'use client';

import { useEffect, useRef, useState } from 'react';
import { loadGoogleMaps } from '@/lib/google-maps';
import type { PollutionHotspot } from '@/types/hotspot';
import type { MonitoringStation } from '@/types/station';
import type { PollutionReport } from '@/types/report';
import { SOURCE_TYPE_CONFIG } from '@/types/report';
import { HOTSPOT_SEVERITY_CONFIG } from '@/types/hotspot';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PollutionMapProps {
  hotspots: PollutionHotspot[];
  stations: MonitoringStation[];
  reports: PollutionReport[];
  className?: string;
}

// AQI-based color for heatmap gradient
const AQI_COLORS = ['#22c55e', '#84cc16', '#f59e0b', '#f97316', '#ef4444', '#8b5cf6'];

function getAqiColor(aqi: number) {
  if (aqi <= 50) return '#22c55e';
  if (aqi <= 100) return '#84cc16';
  if (aqi <= 200) return '#f59e0b';
  if (aqi <= 300) return '#f97316';
  if (aqi <= 400) return '#ef4444';
  return '#8b5cf6';
}

// No-key placeholder SVG map
function MapPlaceholder({ hotspots, stations }: { hotspots: PollutionHotspot[]; stations: MonitoringStation[] }) {
  const DELHI_BOUNDS = { minLat: 28.40, maxLat: 28.88, minLng: 76.84, maxLng: 77.35 };
  function toPercent(lat: number, lng: number) {
    const x = ((lng - DELHI_BOUNDS.minLng) / (DELHI_BOUNDS.maxLng - DELHI_BOUNDS.minLng)) * 100;
    const y = ((DELHI_BOUNDS.maxLat - lat) / (DELHI_BOUNDS.maxLat - DELHI_BOUNDS.minLat)) * 100;
    return { x, y };
  }

  return (
    <div className="relative w-full h-full bg-slate-900 overflow-hidden">
      {/* Grid lines */}
      <svg width="100%" height="100%" className="absolute inset-0 opacity-10">
        {[10,20,30,40,50,60,70,80,90].map((p) => (
          <g key={p}>
            <line x1={`${p}%`} y1="0" x2={`${p}%`} y2="100%" stroke="#94a3b8" strokeWidth="0.5" />
            <line x1="0" y1={`${p}%`} x2="100%" y2={`${p}%`} stroke="#94a3b8" strokeWidth="0.5" />
          </g>
        ))}
      </svg>

      {/* City label */}
      <div className="absolute top-4 left-4 text-slate-400 text-xs font-bold tracking-widest uppercase">Delhi NCR</div>

      {/* API key notice */}
      <div className="absolute top-4 right-4 bg-amber-500/20 border border-amber-500/30 rounded-lg px-3 py-2 text-xs text-amber-400 flex items-center gap-2">
        <AlertCircle className="size-3.5" />
        Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY for full map
      </div>

      {/* Station markers */}
      {stations.map((stn) => {
        const { x, y } = toPercent(stn.location.lat, stn.location.lng);
        const color = stn.latestReading ? getAqiColor(stn.latestReading.aqi) : '#6b7280';
        return (
          <div
            key={stn.id}
            className="absolute group cursor-pointer z-10"
            style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
          >
            <div
              className="size-5 rounded-full border-2 border-background flex items-center justify-center text-[8px] font-bold shadow"
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
            className="absolute group cursor-pointer z-20"
            style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
          >
            {/* Pulse ring */}
            {hs.status !== 'resolved' && (
              <div
                className="absolute inset-0 rounded-full animate-ping opacity-30"
                style={{ backgroundColor: color, transform: 'scale(3)' }}
              />
            )}
            <div
              className="relative size-8 rounded-full border-2 border-background flex items-center justify-center text-sm shadow-lg z-10"
              style={{ backgroundColor: color }}
              title={`${emoji} ${hs.location.address} — ${hs.severity}`}
            >
              {emoji}
            </div>

            {/* Tooltip */}
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-popover border border-border rounded-lg p-2 text-xs hidden group-hover:block z-30 whitespace-nowrap shadow-xl min-w-32">
              <p className="font-semibold">{hs.location.address}</p>
              <p style={{ color }}>Severity: {hs.severity}</p>
              {hs.estimatedAqi && <p className="text-muted-foreground">AQI ~{hs.estimatedAqi}</p>}
              <p className="text-muted-foreground">{hs.reportCount} reports</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function PollutionMap({ hotspots, stations, reports, className }: PollutionMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    loadGoogleMaps()
      .then(() => {
        if (!mapRef.current || !window.google) return;
        const google = window.google;
        const map = new google.maps.Map(mapRef.current, {
          center: { lat: 28.6139, lng: 77.209 },
          zoom: 11,
          mapTypeId: 'roadmap',
          styles: [
            { elementType: 'geometry', stylers: [{ color: '#1d2535' }] },
            { elementType: 'labels.text.stroke', stylers: [{ color: '#1d2535' }] },
            { elementType: 'labels.text.fill', stylers: [{ color: '#8ec3b9' }] },
            { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2c3e50' }] },
            { featureType: 'water', stylers: [{ color: '#0f3460' }] },
            { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#263238' }] },
          ],
        });

        // Heatmap from reports
        const heatmapData = reports
          .filter((r) => r.aiAnalysis)
          .map((r) => ({
            location: new google.maps.LatLng(r.location.lat, r.location.lng),
            weight: r.aiAnalysis!.severity,
          }));

        // @ts-expect-error google.maps types incorrectly mark HeatmapLayer constructor as taking 0 args
        new google.maps.visualization.HeatmapLayer({
          data: heatmapData,
          map,
          radius: 40,
          gradient: AQI_COLORS,
        });

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
          const infoWindow = new google.maps.InfoWindow({
            content: `<div style="color:#000;padding:4px">
              <strong>${emoji} ${SOURCE_TYPE_CONFIG[hs.sourceType]?.label}</strong><br/>
              ${hs.location.address}<br/>
              Severity: ${hs.severity} · AQI ~${hs.estimatedAqi ?? 'N/A'}<br/>
              ${hs.reportCount} reports
            </div>`,
          });
          marker.addListener('click', () => infoWindow.open({ anchor: marker, map }));
        });

        // Station markers
        stations.forEach((stn) => {
          if (!stn.latestReading) return;
          const color = getAqiColor(stn.latestReading.aqi);
          const marker = new google.maps.Marker({
            position: { lat: stn.location.lat, lng: stn.location.lng },
            map,
            label: { text: `${stn.latestReading.aqi}`, color: '#fff', fontSize: '10px', fontWeight: 'bold' },
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: color,
              fillOpacity: 0.85,
              strokeColor: '#fff',
              strokeWeight: 1.5,
              scale: 16,
            },
          });
          const infoWindow = new google.maps.InfoWindow({
            content: `<div style="color:#000;padding:4px">
              <strong>${stn.name}</strong><br/>
              AQI ${stn.latestReading.aqi} (${stn.latestReading.category})<br/>
              PM2.5: ${stn.latestReading.pm25} · PM10: ${stn.latestReading.pm10}
            </div>`,
          });
          marker.addListener('click', () => infoWindow.open({ anchor: marker, map }));
        });

      })
      .catch((err) => {
        setMapError(err.message);
      });
  }, [hotspots, stations, reports]);

  return (
    <div className={cn('relative rounded-xl overflow-hidden border border-border', className)}>
      {/* Google Maps container (hidden when error) */}
      <div ref={mapRef} className={cn('w-full h-full', mapError ? 'hidden' : '')} />

      {/* Fallback SVG map */}
      {mapError && <MapPlaceholder hotspots={hotspots} stations={stations} />}
    </div>
  );
}
