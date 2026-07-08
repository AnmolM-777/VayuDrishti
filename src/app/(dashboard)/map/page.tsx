'use client';

import { useState, useEffect } from 'react';
import type { PollutionHotspot } from '@/types/hotspot';
import type { MonitoringStation } from '@/types/station';
import type { PollutionReport } from '@/types/report';
import { PollutionMap } from '@/components/map/pollution-map';
import {
  MapControls,
  type MapFilterState,
} from '@/components/map/map-controls';
import { MapLegend } from '@/components/map/map-legend';
import { PageHeader } from '@/components/feedback/page-header';

const DEFAULT_FILTERS: MapFilterState = {
  sourceTypes: [
    'garbage_burning',
    'industrial',
    'vehicle_exhaust',
    'construction_dust',
    'crop_burning',
    'road_dust',
    'unknown',
  ],
  severity: ['low', 'medium', 'high', 'critical'],
  showHotspots: true,
  showStations: true,
  showReports: true,
  showHeatmap: true,
};

export default function MapPage() {
  const [hotspots, setHotspots] = useState<PollutionHotspot[]>([]);
  const [stations, setStations] = useState<MonitoringStation[]>([]);
  const [reports, setReports] = useState<PollutionReport[]>([]);
  const [filters, setFilters] = useState<MapFilterState>(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      fetch('/api/hotspots').then((r) => r.json()),
      fetch('/api/stations').then((r) => r.json()),
      fetch('/api/reports').then((r) => r.json()),
    ]).then(([h, s, r]) => {
      if (h.status === 'fulfilled') setHotspots(h.value.hotspots ?? []);
      if (s.status === 'fulfilled') setStations(s.value.stations ?? []);
      if (r.status === 'fulfilled') setReports(r.value.reports ?? []);
      setLoading(false);
    });
  }, []);

  // Apply filters
  const filteredHotspots = filters.showHotspots
    ? hotspots.filter((h) => filters.sourceTypes.includes(h.sourceType))
    : [];
  const filteredStations = filters.showStations ? stations : [];
  const filteredReports = filters.showReports
    ? reports.filter(
        (r) =>
          r.aiAnalysis && filters.sourceTypes.includes(r.aiAnalysis.sourceType),
      )
    : [];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Pollution Map"
        description="Live heatmap of pollution hotspots, CPCB station readings, and citizen reports across Delhi."
      />

      {loading ? (
        <div className="bg-card border-border h-[70vh] animate-pulse rounded-xl border" />
      ) : (
        <div
          className="border-border relative overflow-hidden rounded-xl border"
          style={{ height: '70vh' }}
        >
          <PollutionMap
            hotspots={filteredHotspots}
            stations={filteredStations}
            reports={filteredReports}
            className="h-full w-full"
          />
          <MapControls filters={filters} onChange={setFilters} />
          <MapLegend />

          {/* Live indicator */}
          <div className="bg-card/95 border-border absolute top-4 right-4 z-10 flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium shadow-lg backdrop-blur-md">
            <span className="size-2 animate-pulse rounded-full bg-emerald-400" />
            Live data
          </div>

          {/* Stats overlay */}
          <div className="bg-card/95 border-border absolute right-4 bottom-4 z-10 space-y-1 rounded-xl border p-3 text-xs shadow-lg backdrop-blur-md">
            <div className="flex gap-3">
              <span className="text-muted-foreground">Hotspots</span>
              <span className="font-bold">{filteredHotspots.length}</span>
            </div>
            <div className="flex gap-3">
              <span className="text-muted-foreground">Stations</span>
              <span className="font-bold">{filteredStations.length}</span>
            </div>
            <div className="flex gap-3">
              <span className="text-muted-foreground">Reports</span>
              <span className="font-bold">{filteredReports.length}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
