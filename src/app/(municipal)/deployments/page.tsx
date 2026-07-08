'use client';

import { format } from 'date-fns';
import { PageHeader } from '@/components/feedback/page-header';
import { getSampleDispatches } from '@/lib/sample-data';
import { RESOURCE_TYPE_CONFIG, DISPATCH_STATUS_CONFIG } from '@/types/alert';
import type { ResourceType, DispatchStatus } from '@/types/alert';

export default function DeploymentsPage() {
  const dispatches = getSampleDispatches();

  // Sort: active first, then completed
  const sorted = [...dispatches].sort((a, b) => {
    const order: Record<DispatchStatus, number> = {
      en_route: 0,
      on_site: 1,
      assigned: 2,
      pending: 3,
      completed: 4,
      cancelled: 5,
    };
    return (order[a.status] ?? 9) - (order[b.status] ?? 9);
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Deployments"
        description="Track all resource deployments and their real-time status across the city."
      />

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          {
            label: 'Total',
            value: dispatches.length,
            icon: '📦',
            color: '#3b82f6',
          },
          {
            label: 'In Progress',
            value: dispatches.filter(
              (d) =>
                d.status === 'en_route' ||
                d.status === 'on_site' ||
                d.status === 'assigned',
            ).length,
            icon: '🚀',
            color: '#f59e0b',
          },
          {
            label: 'Completed',
            value: dispatches.filter((d) => d.status === 'completed').length,
            icon: '✅',
            color: '#22c55e',
          },
          {
            label: 'Avg Distance',
            value:
              (
                dispatches.reduce((sum, d) => sum + (d.distanceKm ?? 0), 0) /
                dispatches.length
              ).toFixed(1) + ' km',
            icon: '🛣',
            color: '#8b5cf6',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-card rounded-xl border p-4 shadow-sm transition-shadow hover:shadow-md"
          >
            <p className="text-muted-foreground text-xs font-medium">
              {stat.icon} {stat.label}
            </p>
            <p
              className="mt-1 text-2xl font-bold tabular-nums"
              style={{ color: stat.color }}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Deployments table-like layout */}
      <div className="bg-card rounded-xl border shadow-sm">
        {/* Header */}
        <div className="hidden border-b px-5 py-3 sm:grid sm:grid-cols-12 sm:gap-4">
          <span className="text-muted-foreground col-span-3 text-xs font-semibold tracking-wider uppercase">
            Resource
          </span>
          <span className="text-muted-foreground col-span-3 text-xs font-semibold tracking-wider uppercase">
            Target
          </span>
          <span className="text-muted-foreground col-span-2 text-xs font-semibold tracking-wider uppercase">
            Status
          </span>
          <span className="text-muted-foreground col-span-2 text-xs font-semibold tracking-wider uppercase">
            Timeline
          </span>
          <span className="text-muted-foreground col-span-2 text-xs font-semibold tracking-wider uppercase">
            Impact
          </span>
        </div>

        {/* Rows */}
        {sorted.map((dispatch, idx) => {
          const resourceCfg =
            RESOURCE_TYPE_CONFIG[dispatch.resourceType as ResourceType];
          const statusCfg =
            DISPATCH_STATUS_CONFIG[dispatch.status as DispatchStatus];
          const isCompleted = dispatch.status === 'completed';
          const isActive =
            dispatch.status === 'en_route' || dispatch.status === 'on_site';

          return (
            <div
              key={dispatch.id}
              className={`group hover:bg-muted/40 grid items-center gap-4 px-5 py-4 transition-colors sm:grid-cols-12 ${
                idx < sorted.length - 1 ? 'border-b' : ''
              }`}
            >
              {/* Resource */}
              <div className="col-span-3 flex items-center gap-3">
                <span className="bg-muted flex h-10 w-10 items-center justify-center rounded-lg text-lg">
                  {resourceCfg.emoji}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {dispatch.resourceName}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {resourceCfg.label}
                  </p>
                </div>
              </div>

              {/* Target */}
              <div className="col-span-3 min-w-0">
                <p className="truncate text-sm">
                  📍 {dispatch.targetLocation.address}
                </p>
                {dispatch.distanceKm && (
                  <p className="text-muted-foreground text-xs">
                    {dispatch.distanceKm} km away
                  </p>
                )}
              </div>

              {/* Status */}
              <div className="col-span-2">
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
                  style={{
                    backgroundColor: statusCfg.color + '18',
                    color: statusCfg.color,
                  }}
                >
                  {isActive && (
                    <span className="relative flex h-1.5 w-1.5">
                      <span
                        className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
                        style={{ backgroundColor: statusCfg.color }}
                      />
                      <span
                        className="relative inline-flex h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: statusCfg.color }}
                      />
                    </span>
                  )}
                  {!isActive && (
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: statusCfg.color }}
                    />
                  )}
                  {statusCfg.label}
                </span>
                {dispatch.eta && (
                  <p className="text-foreground mt-1 text-xs font-medium">
                    ETA: {dispatch.eta}
                  </p>
                )}
              </div>

              {/* Timeline */}
              <div className="text-muted-foreground col-span-2 space-y-0.5 text-xs">
                <p>
                  Assigned: {format(new Date(dispatch.assignedAt), 'HH:mm')}
                </p>
                {dispatch.departedAt && (
                  <p>
                    Departed: {format(new Date(dispatch.departedAt), 'HH:mm')}
                  </p>
                )}
                {dispatch.arrivedAt && (
                  <p>
                    Arrived: {format(new Date(dispatch.arrivedAt), 'HH:mm')}
                  </p>
                )}
                {dispatch.completedAt && (
                  <p className="font-medium text-emerald-600">
                    Done: {format(new Date(dispatch.completedAt), 'HH:mm')}
                  </p>
                )}
              </div>

              {/* Impact */}
              <div className="col-span-2">
                {isCompleted &&
                dispatch.aqiBefore != null &&
                dispatch.aqiAfter != null ? (
                  <div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-semibold text-red-500">
                        {dispatch.aqiBefore}
                      </span>
                      <span className="text-muted-foreground">→</span>
                      <span className="font-semibold text-emerald-500">
                        {dispatch.aqiAfter}
                      </span>
                    </div>
                    <p className="text-xs text-emerald-600">
                      ↓{' '}
                      {Math.round(
                        ((dispatch.aqiBefore - dispatch.aqiAfter) /
                          dispatch.aqiBefore) *
                          100,
                      )}
                      % AQI reduction
                    </p>
                    {dispatch.notes && (
                      <p className="text-muted-foreground mt-1 text-xs italic">
                        {dispatch.notes}
                      </p>
                    )}
                  </div>
                ) : (
                  <span className="text-muted-foreground text-xs italic">
                    {isActive ? 'In progress…' : 'Awaiting data'}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
