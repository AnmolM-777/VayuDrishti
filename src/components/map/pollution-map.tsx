'use client';

import type { MarkerClusterer } from '@googlemaps/markerclusterer';
import { useEffect, useRef, useState } from 'react';
import { loadGoogleMaps } from '@/lib/google-maps';
import type { PollutionHotspot } from '@/types/hotspot';
import type { MonitoringStation } from '@/types/station';
import type { PollutionReport } from '@/types/report';
import { SOURCE_TYPE_CONFIG } from '@/types/report';
import { HOTSPOT_SEVERITY_CONFIG } from '@/types/hotspot';
import { cn } from '@/lib/utils';

interface PollutionMapProps {
  hotspots: PollutionHotspot[];
  stations: MonitoringStation[];
  reports: PollutionReport[];
  className?: string;
}

// AQI-based color for heatmap gradient
const AQI_COLORS = [
  '#22c55e',
  '#84cc16',
  '#f59e0b',
  '#f97316',
  '#ef4444',
  '#8b5cf6',
];

function getAqiColor(aqi: number) {
  if (aqi <= 50) return '#22c55e';
  if (aqi <= 100) return '#84cc16';
  if (aqi <= 200) return '#f59e0b';
  if (aqi <= 300) return '#f97316';
  if (aqi <= 400) return '#ef4444';
  return '#8b5cf6';
}

// No-key placeholder SVG map
function MapPlaceholder({
  hotspots,
  stations,
}: {
  hotspots: PollutionHotspot[];
  stations: MonitoringStation[];
}) {
  const DELHI_BOUNDS = {
    minLat: 28.4,
    maxLat: 28.88,
    minLng: 76.84,
    maxLng: 77.35,
  };
  function toPercent(lat: number, lng: number) {
    const x =
      ((lng - DELHI_BOUNDS.minLng) /
        (DELHI_BOUNDS.maxLng - DELHI_BOUNDS.minLng)) *
      100;
    const y =
      ((DELHI_BOUNDS.maxLat - lat) /
        (DELHI_BOUNDS.maxLat - DELHI_BOUNDS.minLat)) *
      100;
    return { x, y };
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-slate-900">
      {/* Grid lines */}
      <svg width="100%" height="100%" className="absolute inset-0 opacity-10">
        {[10, 20, 30, 40, 50, 60, 70, 80, 90].map((p) => (
          <g key={p}>
            <line
              x1={`${p}%`}
              y1="0"
              x2={`${p}%`}
              y2="100%"
              stroke="#94a3b8"
              strokeWidth="0.5"
            />
            <line
              x1="0"
              y1={`${p}%`}
              x2="100%"
              y2={`${p}%`}
              stroke="#94a3b8"
              strokeWidth="0.5"
            />
          </g>
        ))}
      </svg>

      {/* City label */}
      <div className="absolute top-4 left-4 text-xs font-bold tracking-widest text-slate-400 uppercase">
        Delhi NCR
      </div>

      {/* Station markers */}
      {stations.map((stn) => {
        const { x, y } = toPercent(stn.location.lat, stn.location.lng);
        const color = stn.latestReading
          ? getAqiColor(stn.latestReading.aqi)
          : '#6b7280';
        return (
          <div
            key={stn.id}
            className="group absolute z-10 cursor-pointer"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div
              className="border-background flex size-5 items-center justify-center rounded-full border-2 text-[8px] font-bold shadow"
              style={{ backgroundColor: color }}
              title={`${stn.name}: AQI ${stn.latestReading?.aqi}`}
            >
              S
            </div>
          </div>
        );
      })}

      {/* Hotspot markers */}
      {hotspots.map((hs) => {
        const { x, y } = toPercent(hs.location.lat, hs.location.lng);
        const color = HOTSPOT_SEVERITY_CONFIG[hs.severity].color;
        const emoji = SOURCE_TYPE_CONFIG[hs.sourceType]?.emoji ?? '❓';
        return (
          <div
            key={hs.id}
            className="group absolute z-20 cursor-pointer"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {/* Pulse ring */}
            {hs.status !== 'resolved' && (
              <div
                className="absolute inset-0 animate-ping rounded-full opacity-30"
                style={{ backgroundColor: color, transform: 'scale(3)' }}
              />
            )}
            <div
              className="border-background relative z-10 flex size-8 items-center justify-center rounded-full border-2 text-sm shadow-lg"
              style={{ backgroundColor: color }}
              title={`${emoji} ${hs.location.address} — ${hs.severity}`}
            >
              {emoji}
            </div>

            {/* Tooltip */}
            <div className="bg-popover border-border absolute bottom-full left-1/2 z-30 mb-2 hidden min-w-32 -translate-x-1/2 rounded-lg border p-2 text-xs whitespace-nowrap shadow-xl group-hover:block">
              <p className="font-semibold">{hs.location.address}</p>
              <p style={{ color }}>Severity: {hs.severity}</p>
              {hs.estimatedAqi && (
                <p className="text-muted-foreground">AQI ~{hs.estimatedAqi}</p>
              )}
              <p className="text-muted-foreground">{hs.reportCount} reports</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function PollutionMap({
  hotspots,
  stations,
  reports,
  className,
}: PollutionMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const markers: google.maps.Marker[] = [];
    const listeners: google.maps.MapsEventListener[] = [];
    let heatmap:
      | (google.maps.visualization.HeatmapLayer & {
          setMap(map: google.maps.Map | null): void;
        })
      | null = null;
    let clusterer: MarkerClusterer | null = null;

    loadGoogleMaps()
      .then(async () => {
        if (cancelled || !mapRef.current || !window.google) return;
        const { MarkerClusterer } = await import('@googlemaps/markerclusterer');
        if (cancelled || !mapRef.current || !window.google) return;
        const google = window.google;
        const map = new google.maps.Map(mapRef.current, {
          center: { lat: 28.6139, lng: 77.209 },
          zoom: 11,
          mapTypeId: 'roadmap',
          styles: [
            { elementType: 'geometry', stylers: [{ color: '#1d2535' }] },
            {
              elementType: 'labels.text.stroke',
              stylers: [{ color: '#1d2535' }],
            },
            {
              elementType: 'labels.text.fill',
              stylers: [{ color: '#8ec3b9' }],
            },
            {
              featureType: 'road',
              elementType: 'geometry',
              stylers: [{ color: '#2c3e50' }],
            },
            { featureType: 'water', stylers: [{ color: '#0f3460' }] },
            {
              featureType: 'poi',
              elementType: 'geometry',
              stylers: [{ color: '#263238' }],
            },
          ],
        });

        // Heatmap from reports
        const heatmapData = reports
          .filter((r) => r.aiAnalysis)
          .slice(0, 500)
          .map((r) => ({
            location: new google.maps.LatLng(r.location.lat, r.location.lng),
            weight: r.aiAnalysis!.severity,
          }));

        // @ts-expect-error google.maps types incorrectly mark HeatmapLayer constructor as taking 0 args
        heatmap = new google.maps.visualization.HeatmapLayer({
          data: heatmapData,
          map,
          radius: 40,
          gradient: AQI_COLORS,
        }) as google.maps.visualization.HeatmapLayer & {
          setMap(map: google.maps.Map | null): void;
        };

        // Hotspot markers
        hotspots.forEach((hs) => {
          const color = HOTSPOT_SEVERITY_CONFIG[hs.severity].color;
          const emoji = SOURCE_TYPE_CONFIG[hs.sourceType]?.emoji ?? '❓';
          const marker = new google.maps.Marker({
            position: { lat: hs.location.lat, lng: hs.location.lng },
            map,
            label: { text: emoji, fontSize: '18px' },
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: color,
              fillOpacity: 0.9,
              strokeColor: '#fff',
              strokeWeight: 2,
              scale: 14,
            },
          });
          markers.push(marker);
          const infoWindow = new google.maps.InfoWindow({
            content: `<div style="color:#000;padding:4px">
              <strong>${emoji} ${SOURCE_TYPE_CONFIG[hs.sourceType]?.label}</strong><br/>
              ${hs.location.address}<br/>
              Severity: ${hs.severity} · AQI ~${hs.estimatedAqi ?? 'N/A'}<br/>
              ${hs.reportCount} reports
            </div>`,
          });
          listeners.push(
            marker.addListener('click', () =>
              infoWindow.open({ anchor: marker, map }),
            ),
          );
        });

        // Station markers
        stations.forEach((stn) => {
          if (!stn.latestReading) return;
          const color = getAqiColor(stn.latestReading.aqi);
          const marker = new google.maps.Marker({
            position: { lat: stn.location.lat, lng: stn.location.lng },
            map,
            label: {
              text: `${stn.latestReading.aqi}`,
              color: '#fff',
              fontSize: '10px',
              fontWeight: 'bold',
            },
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: color,
              fillOpacity: 0.85,
              strokeColor: '#fff',
              strokeWeight: 1.5,
              scale: 16,
            },
          });
          markers.push(marker);
          const infoWindow = new google.maps.InfoWindow({
            content: `<div style="color:#000;padding:4px">
              <strong>${stn.name}</strong><br/>
              AQI ${stn.latestReading.aqi} (${stn.latestReading.category})<br/>
              PM2.5: ${stn.latestReading.pm25} · PM10: ${stn.latestReading.pm10}
            </div>`,
          });
          listeners.push(
            marker.addListener('click', () =>
              infoWindow.open({ anchor: marker, map }),
            ),
          );
        });

        clusterer = new MarkerClusterer({ map, markers });
      })
      .catch((err) => {
        if (!cancelled) setMapError(err.message);
      });

    return () => {
      cancelled = true;
      listeners.forEach((listener) => listener.remove());
      clusterer?.clearMarkers();
      heatmap?.setMap(null);
      markers.forEach((marker) => marker.setMap(null));
    };
  }, [hotspots, stations, reports]);

  return (
    <div
      className={cn(
        'border-border relative overflow-hidden rounded-xl border',
        className,
      )}
    >
      {/* Google Maps container (hidden when error) */}
      <div
        ref={mapRef}
        className={cn('h-full w-full', mapError ? 'hidden' : '')}
      />

      {/* Fallback SVG map */}
      {mapError && <MapPlaceholder hotspots={hotspots} stations={stations} />}
    </div>
  );
}
