'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/feedback/page-header';
import {
  getSampleAlerts,
  getSampleResources,
  getSampleDispatches,
} from '@/lib/sample-data';
import {
  ALERT_PRIORITY_CONFIG,
  RESOURCE_TYPE_CONFIG,
  DISPATCH_STATUS_CONFIG,
} from '@/types/alert';
import { SOURCE_TYPE_CONFIG } from '@/types/report';
import type {
  AlertPriority,
  DispatchStatus,
  ResourceType,
} from '@/types/alert';

export default function DispatchPage() {
  const alerts = getSampleAlerts();
  const resources = getSampleResources();
  const dispatches = getSampleDispatches();

  const [deployingId, setDeployingId] = useState<string | null>(null);

  const activeAlerts = alerts.filter(
    (a) =>
      a.status === 'active' ||
      a.status === 'dispatched' ||
      a.status === 'acknowledged',
  );
  const activeDispatches = dispatches.filter(
    (d) => d.status !== 'completed' && d.status !== 'cancelled',
  );

  function handleDeploy(resourceId: string) {
    setDeployingId(resourceId);
    setTimeout(() => setDeployingId(null), 2000);
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dispatch Center"
        description="Monitor alerts, deploy resources, and track active dispatches in real-time."
      />

      {/* ── Active Alerts ────────────────────────────────────────── */}
      <section>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold tracking-tight">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
          </span>
          Active Alerts
          <span className="text-muted-foreground ml-1 text-sm font-normal">
            ({activeAlerts.length})
          </span>
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {activeAlerts.map((alert) => {
            const priorityCfg =
              ALERT_PRIORITY_CONFIG[alert.priority as AlertPriority];
            const sourceCfg = SOURCE_TYPE_CONFIG[alert.sourceType];
            return (
              <div
                key={alert.id}
                className="group bg-card rounded-xl border p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                {/* Header row */}
                <div className="mb-3 flex items-start justify-between gap-2">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
                    style={{
                      backgroundColor: priorityCfg.bgColor,
                      color: priorityCfg.color,
                    }}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: priorityCfg.color }}
                    />
                    {priorityCfg.label}
                  </span>
                  <span className="text-muted-foreground text-xs tabular-nums">
                    AQI {alert.estimatedAqi}
                  </span>
                </div>

                {/* Title */}
                <h3 className="mb-1.5 text-sm leading-snug font-semibold">
                  {alert.title}
                </h3>

                {/* Location */}
                <p className="text-muted-foreground mb-2 text-xs">
                  📍 {alert.location.address}
                </p>

                {/* Source type badge */}
                <div className="mb-3 flex items-center gap-2">
                  <span
                    className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium"
                    style={{
                      backgroundColor: sourceCfg.color + '18',
                      color: sourceCfg.color,
                    }}
                  >
                    {sourceCfg.emoji} {sourceCfg.label}
                  </span>
                  {alert.affectedPopulation && (
                    <span className="text-muted-foreground text-xs">
                      👥 {alert.affectedPopulation.toLocaleString()}
                    </span>
                  )}
                </div>

                {/* Recommended action */}
                <p className="text-muted-foreground bg-muted/50 rounded-lg px-3 py-2 text-xs leading-relaxed">
                  💡 {alert.recommendedAction}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Available Resources ───────────────────────────────────── */}
      <section>
        <h2 className="mb-4 text-lg font-semibold tracking-tight">
          🚀 Available Resources
          <span className="text-muted-foreground ml-1 text-sm font-normal">
            ({resources.filter((r) => r.isAvailable).length} ready)
          </span>
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {resources.map((resource) => {
            const typeCfg = RESOURCE_TYPE_CONFIG[resource.type as ResourceType];
            const isDeploying = deployingId === resource.id;
            return (
              <div
                key={resource.id}
                className="group bg-card rounded-xl border p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="mb-3 flex items-center gap-3">
                  <span className="bg-muted flex h-10 w-10 items-center justify-center rounded-lg text-xl">
                    {typeCfg.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold">
                      {resource.name}
                    </h3>
                    <p className="text-muted-foreground text-xs">
                      {typeCfg.label}
                    </p>
                  </div>
                </div>

                {resource.capacity && (
                  <p className="text-muted-foreground mb-3 text-xs">
                    ⚙️ {resource.capacity}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${
                      resource.isAvailable
                        ? 'bg-emerald-500/10 text-emerald-600'
                        : 'bg-amber-500/10 text-amber-600'
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        resource.isAvailable ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                    />
                    {resource.isAvailable ? 'Available' : 'Deployed'}
                  </span>

                  {resource.isAvailable && (
                    <button
                      type="button"
                      onClick={() => handleDeploy(resource.id)}
                      disabled={isDeploying}
                      className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-150 hover:shadow-sm active:scale-95 disabled:opacity-60"
                    >
                      {isDeploying ? (
                        <span className="flex items-center gap-1.5">
                          <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          Deploying…
                        </span>
                      ) : (
                        'Deploy'
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Active Dispatches ─────────────────────────────────────── */}
      <section>
        <h2 className="mb-4 text-lg font-semibold tracking-tight">
          📋 Active Dispatches
          <span className="text-muted-foreground ml-1 text-sm font-normal">
            ({activeDispatches.length})
          </span>
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          {activeDispatches.map((dispatch) => {
            const statusCfg =
              DISPATCH_STATUS_CONFIG[dispatch.status as DispatchStatus];
            const resourceCfg =
              RESOURCE_TYPE_CONFIG[dispatch.resourceType as ResourceType];
            return (
              <div
                key={dispatch.id}
                className="group bg-card rounded-xl border p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{resourceCfg.emoji}</span>
                    <div>
                      <h3 className="text-sm font-semibold">
                        {dispatch.resourceName}
                      </h3>
                      <p className="text-muted-foreground text-xs">
                        {resourceCfg.label}
                      </p>
                    </div>
                  </div>
                  <span
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
                    style={{
                      backgroundColor: statusCfg.color + '18',
                      color: statusCfg.color,
                    }}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: statusCfg.color }}
                    />
                    {statusCfg.label}
                  </span>
                </div>

                <div className="text-muted-foreground space-y-1 text-xs">
                  <p>📍 {dispatch.targetLocation.address}</p>
                  {dispatch.eta && (
                    <p className="text-foreground font-medium">
                      ⏱ ETA: {dispatch.eta}
                    </p>
                  )}
                  {dispatch.distanceKm && (
                    <p>🛣 Distance: {dispatch.distanceKm} km</p>
                  )}
                </div>
              </div>
            );
          })}

          {activeDispatches.length === 0 && (
            <div className="text-muted-foreground bg-card col-span-full rounded-xl border border-dashed p-8 text-center text-sm">
              No active dispatches. Deploy a resource from above to get started.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
