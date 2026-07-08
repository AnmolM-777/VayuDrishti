'use client';

import { useState, useEffect } from 'react';
import type { PollutionAlert } from '@/types/alert';
import { PageHeader } from '@/components/feedback/page-header';
import { AlertCard } from '@/components/alerts/alert-card';
import {
  AlertFilters,
  type AlertFilterState,
} from '@/components/alerts/alert-filters';
import { Bell } from 'lucide-react';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<PollutionAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<AlertFilterState>({
    priority: 'all',
    status: 'all',
  });

  useEffect(() => {
    fetch('/api/alerts')
      .then((r) => r.json())
      .then((data) => {
        setAlerts(data.alerts ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = alerts.filter((a) => {
    if (filters.priority !== 'all' && a.priority !== filters.priority)
      return false;
    if (filters.status !== 'all' && a.status !== filters.status) return false;
    return true;
  });

  const activeCount = alerts.filter(
    (a) => a.status === 'active' || a.status === 'dispatched',
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <PageHeader
          title="Alerts"
          description="Real-time pollution and air quality alerts from the monitoring network."
        />
        {activeCount > 0 && (
          <div className="mt-1 flex items-center gap-2 text-sm font-medium text-red-400">
            <span className="size-2 animate-pulse rounded-full bg-red-400" />
            {activeCount} active
          </div>
        )}
      </div>

      <AlertFilters filters={filters} onChange={setFilters} />

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-card border-border h-36 animate-pulse rounded-xl border p-4"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Bell className="text-muted-foreground mb-3 size-12" />
          <p className="font-medium">No alerts match your filters</p>
          <p className="text-muted-foreground mt-1 text-sm">
            Adjust the filters above to see more alerts.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </div>
      )}
    </div>
  );
}
