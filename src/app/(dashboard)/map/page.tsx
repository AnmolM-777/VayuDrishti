'use client';

import { useState, useEffect } from 'react';
import type { PollutionHotspot } from '@/types/hotspot';
import type { MonitoringStation } from '@/types/station';
import type { PollutionReport } from '@/types/report';
import { PollutionMap } from '@/components/map/pollution-map';
import { MapControls, type MapFilterState } from '@/components/map/map-controls';
import { MapLegend } from '@/components/map/map-legend';
import { PageHeader } from '@/components/feedback/page-header';

const DEFAULT_FILTERS: MapFilterState = {
  sourceTypes: ['garbage_burning', 'industrial', 'vehicle_exhaust', 'construction_dust', 'crop_burning', 'road_dust', 'unknown'],
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
    ? reports.filter((r) => r.aiAnalysis && filters.sourceTypes.includes(r.aiAnalysis.sourceType))
    : [];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Pollution Map"
        description="Live heatmap of pollution hotspots, CPCB station readings, and citizen reports across Delhi."
      />

      {loading ? (
        <div className="bg-card border border-border rounded-xl h-[70vh] animate-pulse" />
      ) : (
        <div className="relative rounded-xl overflow-hidden border border-border" style={{ height: '70vh' }}>
          <PollutionMap
            hotspots={filteredHotspots}
            stations={filteredStations}
            reports={filteredReports}
            className="w-full h-full"
          />
          <MapControls filters={filters} onChange={setFilters} />
          <MapLegend />

          {/* Live indicator */}
          <div className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-card/95 backdrop-blur-md border border-border rounded-lg px-3 py-1.5 text-xs font-medium shadow-lg">
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
            Live data
          </div>

          {/* Stats overlay */}
          <div className="absolute bottom-4 right-4 z-10 bg-card/95 backdrop-blur-md border border-border rounded-xl p-3 shadow-lg space-y-1 text-xs">
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
