'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { PageHeader } from '@/components/feedback/page-header';
import { getSampleReports } from '@/lib/sample-data';
import { SOURCE_TYPE_CONFIG } from '@/types/report';
import type {
  PollutionReport,
  ReportStatus,
  PollutionSourceType,
} from '@/types/report';

const STATUS_STYLE: Record<
  ReportStatus,
  { label: string; color: string; bgColor: string }
> = {
  pending: { label: 'Pending Review', color: '#f59e0b', bgColor: '#fef3c7' },
  analyzing: { label: 'Analyzing', color: '#6366f1', bgColor: '#e0e7ff' },
  verified: { label: 'Verified', color: '#22c55e', bgColor: '#dcfce7' },
  rejected: { label: 'Rejected', color: '#ef4444', bgColor: '#fee2e2' },
  resolved: { label: 'Resolved', color: '#6b7280', bgColor: '#f3f4f6' },
};

export default function ReviewPage() {
  const initialReports = getSampleReports();
  const [reports, setReports] = useState<PollutionReport[]>(initialReports);

  function handleAction(reportId: string, action: 'approve' | 'reject') {
    setReports((prev) =>
      prev.map((r) =>
        r.id === reportId
          ? { ...r, status: action === 'approve' ? 'verified' : 'rejected' }
          : r,
      ),
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Review Reports"
        description="Review and verify citizen-submitted pollution reports powered by AI analysis."
      />

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Total', value: reports.length, color: '#3b82f6' },
          {
            label: 'Pending',
            value: reports.filter((r) => r.status === 'pending').length,
            color: '#f59e0b',
          },
          {
            label: 'Verified',
            value: reports.filter((r) => r.status === 'verified').length,
            color: '#22c55e',
          },
          {
            label: 'Rejected',
            value: reports.filter((r) => r.status === 'rejected').length,
            color: '#ef4444',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-card rounded-xl border p-4 shadow-sm transition-shadow hover:shadow-md"
          >
            <p className="text-muted-foreground text-xs font-medium">
              {stat.label}
            </p>
            <p
              className="text-2xl font-bold tabular-nums"
              style={{ color: stat.color }}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Report cards */}
      <div className="space-y-4">
        {reports.map((report) => {
          const statusCfg = STATUS_STYLE[report.status];
          const sourceCfg = report.aiAnalysis
            ? SOURCE_TYPE_CONFIG[
                report.aiAnalysis.sourceType as PollutionSourceType
              ]
            : null;
          const isPending =
            report.status === 'pending' || report.status === 'analyzing';

          return (
            <div
              key={report.id}
              className="group bg-card rounded-xl border shadow-sm transition-all duration-200 hover:shadow-md"
            >
              <div className="p-5">
                {/* Top row: user info + status */}
                <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white">
                      {report.userName
                        ? report.userName
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                        : '?'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">
                        {report.userName ?? 'Anonymous'}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {formatDistanceToNow(new Date(report.timestamp), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
                    style={{
                      backgroundColor: statusCfg.bgColor,
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

                {/* Location */}
                <p className="text-muted-foreground mb-3 text-xs">
                  📍 {report.location.address ?? 'Unknown location'}
                  {report.location.ward && (
                    <span className="ml-1 opacity-70">
                      · Ward: {report.location.ward}
                    </span>
                  )}
                </p>

                {/* Source + severity + confidence row */}
                {report.aiAnalysis && sourceCfg && (
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    <span
                      className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium"
                      style={{
                        backgroundColor: sourceCfg.color + '18',
                        color: sourceCfg.color,
                      }}
                    >
                      {sourceCfg.emoji} {sourceCfg.label}
                    </span>

                    {/* Severity bar */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-muted-foreground text-xs">
                        Severity
                      </span>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 10 }, (_, i) => (
                          <div
                            key={i}
                            className="h-2.5 w-1.5 rounded-sm transition-colors"
                            style={{
                              backgroundColor:
                                i < report.aiAnalysis!.severity
                                  ? report.aiAnalysis!.severity >= 8
                                    ? '#ef4444'
                                    : report.aiAnalysis!.severity >= 5
                                      ? '#f59e0b'
                                      : '#22c55e'
                                  : '#e5e7eb',
                            }}
                          />
                        ))}
                      </div>
                      <span className="text-xs font-semibold tabular-nums">
                        {report.aiAnalysis.severity}/10
                      </span>
                    </div>

                    {/* Confidence */}
                    <span className="inline-flex items-center gap-1 rounded-md bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-600">
                      🎯 {Math.round(report.aiAnalysis.confidence * 100)}%
                    </span>
                  </div>
                )}

                {/* AI description */}
                {report.aiAnalysis && (
                  <div className="bg-muted/50 mb-4 rounded-lg px-4 py-3">
                    <p className="text-muted-foreground mb-1 text-xs font-semibold tracking-wider uppercase">
                      🤖 AI Analysis
                    </p>
                    <p className="text-sm leading-relaxed">
                      {report.aiAnalysis.description}
                    </p>
                    {report.aiAnalysis.pollutants.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {report.aiAnalysis.pollutants.map((p) => (
                          <span
                            key={p}
                            className="bg-background text-muted-foreground rounded px-1.5 py-0.5 text-xs font-medium"
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* User description */}
                {report.description && (
                  <p className="text-muted-foreground mb-4 text-sm italic">
                    &ldquo;{report.description}&rdquo;
                  </p>
                )}

                {/* Footer: upvotes + action buttons */}
                <div className="flex items-center justify-between border-t pt-3">
                  <div className="text-muted-foreground flex items-center gap-3 text-xs">
                    <span>👍 {report.upvotes} upvotes</span>
                    {report.verifiedBy.length > 0 && (
                      <span>
                        ✅ {report.verifiedBy.length} corroboration
                        {report.verifiedBy.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  {isPending && (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleAction(report.id, 'approve')}
                        className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-medium text-white transition-all duration-150 hover:bg-emerald-700 hover:shadow-sm active:scale-95"
                      >
                        ✓ Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAction(report.id, 'reject')}
                        className="rounded-lg bg-red-600 px-4 py-1.5 text-xs font-medium text-white transition-all duration-150 hover:bg-red-700 hover:shadow-sm active:scale-95"
                      >
                        ✗ Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
