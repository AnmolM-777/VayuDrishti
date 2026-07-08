'use client';

import { useState, useEffect } from 'react';
import type { PollutionHotspot } from '@/types/hotspot';
import { PageHeader } from '@/components/feedback/page-header';
import { HotspotCard } from '@/components/hotspots/hotspot-card';
import {
  HotspotFilters,
  type HotspotFilterState,
} from '@/components/hotspots/hotspot-filters';
import { UpvoteButton } from '@/components/hotspots/upvote-button';
import { Flame } from 'lucide-react';

export default function HotspotsPage() {
  const [hotspots, setHotspots] = useState<PollutionHotspot[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<HotspotFilterState>({
    severity: 'all',
    status: 'all',
    sourceType: 'all',
  });

  useEffect(() => {
    fetch('/api/hotspots')
      .then((r) => r.json())
      .then((data) => {
        setHotspots(data.hotspots ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = hotspots.filter((h) => {
    if (filters.severity !== 'all' && h.severity !== filters.severity)
      return false;
    if (filters.status !== 'all' && h.status !== filters.status) return false;
    if (filters.sourceType !== 'all' && h.sourceType !== filters.sourceType)
      return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pollution Hotspots"
        description="AI-detected pollution clusters from citizen reports and sensor data."
      />

      <HotspotFilters
        filters={filters}
        onChange={setFilters}
        totalCount={hotspots.length}
        filteredCount={filtered.length}
      />

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-card border-border h-48 animate-pulse rounded-xl border p-4"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Flame className="text-muted-foreground mb-3 size-12" />
          <p className="font-medium">No hotspots match your filters</p>
          <p className="text-muted-foreground mt-1 text-sm">
            Try adjusting the filter criteria above.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((hs) => (
            <div key={hs.id} className="flex flex-col">
              <HotspotCard hotspot={hs} />
              <div className="mt-2 px-1">
                <UpvoteButton hotspotId={hs.id} count={hs.reportCount * 3} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
