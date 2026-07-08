'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { FileText, MapPin, CheckCircle2, Clock, XCircle } from 'lucide-react';
import type { PollutionReport } from '@/types/report';
import { SOURCE_TYPE_CONFIG } from '@/types/report';
import { cn } from '@/lib/utils';

const STATUS_CONFIG = {
  pending: {
    color: '#f59e0b',
    bg: 'bg-amber-500/10',
    Icon: Clock,
    label: 'Pending',
  },
  analyzing: {
    color: '#3b82f6',
    bg: 'bg-blue-500/10',
    Icon: Clock,
    label: 'Analyzing',
  },
  verified: {
    color: '#22c55e',
    bg: 'bg-emerald-500/10',
    Icon: CheckCircle2,
    label: 'Verified',
  },
  rejected: {
    color: '#6b7280',
    bg: 'bg-secondary',
    Icon: XCircle,
    label: 'Rejected',
  },
  resolved: {
    color: '#8b5cf6',
    bg: 'bg-purple-500/10',
    Icon: CheckCircle2,
    label: 'Resolved',
  },
} as const;

export function ReportHistory() {
  const [reports, setReports] = useState<PollutionReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/reports')
      .then((r) => r.json())
      .then((data) => {
        setReports(data.reports ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-card border-border h-20 animate-pulse rounded-xl border"
          />
        ))}
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="flex flex-col items-center py-8 text-center">
        <FileText className="text-muted-foreground mb-2 size-10" />
        <p className="text-sm font-medium">No reports yet</p>
        <p className="text-muted-foreground mt-1 text-xs">
          Your submitted reports will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reports.map((report) => {
        const statusCfg = STATUS_CONFIG[report.status];
        const StatusIcon = statusCfg.Icon;
        const sourceCfg = report.aiAnalysis
          ? SOURCE_TYPE_CONFIG[report.aiAnalysis.sourceType]
          : null;

        return (
          <div
            key={report.id}
            className="bg-card border-border hover:bg-accent/30 flex items-start gap-3 rounded-xl border p-4 transition-colors"
          >
            {/* Source emoji */}
            <span className="shrink-0 text-2xl">
              {sourceCfg?.emoji ?? '📸'}
            </span>

            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-start gap-2">
                <p className="flex-1 truncate text-sm font-medium">
                  {report.description ?? sourceCfg?.label ?? 'Pollution report'}
                </p>
                <span
                  className={cn(
                    'flex shrink-0 items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium',
                    statusCfg.bg,
                  )}
                  style={{ color: statusCfg.color }}
                >
                  <StatusIcon className="size-3" />
                  {statusCfg.label}
                </span>
              </div>

              <div className="text-muted-foreground mb-1 flex items-center gap-1.5 text-xs">
                <MapPin className="size-3 shrink-0" />
                <span className="truncate">
                  {report.location.address ?? report.location.city}
                </span>
              </div>

              <div className="text-muted-foreground flex items-center gap-3 text-xs">
                <span>
                  {formatDistanceToNow(new Date(report.timestamp), {
                    addSuffix: true,
                  })}
                </span>
                {report.aiAnalysis && (
                  <span className="text-amber-400">
                    Severity {report.aiAnalysis.severity}/10
                  </span>
                )}
                {report.upvotes > 0 && <span>👍 {report.upvotes}</span>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
