'use client';

import { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import type { PollutionFingerprint } from '@/types/report';
import { SOURCE_TYPE_CONFIG } from '@/types/report';

interface AiAnalysisDisplayProps {
  status: 'idle' | 'scanning' | 'complete' | 'error';
  fingerprint?: PollutionFingerprint;
  error?: string;
}

const SCANNING_MESSAGES = [
  'Uploading photo to analysis engine...',
  'Running Gemini vision model...',
  'Classifying pollution source...',
  'Estimating severity and radius...',
  'Identifying pollutants...',
  'Generating municipal recommendations...',
];

function ScanningAnimation() {
  const [msgIdx, setMsgIdx] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const msgTimer = setInterval(() => {
      setMsgIdx((i) => (i + 1) % SCANNING_MESSAGES.length);
    }, 1200);
    const progTimer = setInterval(() => {
      setProgress((p) => Math.min(p + 2, 95));
    }, 100);
    return () => {
      clearInterval(msgTimer);
      clearInterval(progTimer);
    };
  }, []);

  return (
    <div className="bg-primary/5 border-primary/20 space-y-4 rounded-xl border p-5">
      <div className="flex items-center gap-3">
        <div className="relative size-10">
          <div className="border-primary/20 absolute inset-0 animate-ping rounded-full border-2" />
          <div className="bg-primary/10 flex size-10 items-center justify-center rounded-full">
            <Loader2 className="text-primary size-5 animate-spin" />
          </div>
        </div>
        <div>
          <p className="text-primary text-sm font-semibold">
            AI Analysis Running
          </p>
          <p className="text-muted-foreground text-xs">
            Gemini 2.5 Flash · Environmental Forensics
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-secondary h-1.5 overflow-hidden rounded-full">
        <div
          className="bg-primary h-full rounded-full transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Animated scanning message */}
      <p className="text-muted-foreground min-h-4 animate-pulse text-xs">
        {SCANNING_MESSAGES[msgIdx]}
      </p>
    </div>
  );
}

function ResultDisplay({ fingerprint }: { fingerprint: PollutionFingerprint }) {
  const sourceCfg = SOURCE_TYPE_CONFIG[fingerprint.sourceType];
  const severityPct = (fingerprint.severity / 10) * 100;
  const severityColor =
    fingerprint.severity >= 8
      ? '#ef4444'
      : fingerprint.severity >= 6
        ? '#f97316'
        : fingerprint.severity >= 4
          ? '#f59e0b'
          : '#22c55e';
  const healthColor =
    fingerprint.healthRisk === 'critical'
      ? '#8b5cf6'
      : fingerprint.healthRisk === 'high'
        ? '#ef4444'
        : fingerprint.healthRisk === 'medium'
          ? '#f97316'
          : '#22c55e';

  return (
    <div className="space-y-4 rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <CheckCircle2 className="size-4 text-emerald-400" />
        <span className="text-sm font-semibold text-emerald-400">
          Analysis Complete
        </span>
      </div>

      {/* Source classification */}
      <div className="bg-card border-border flex items-start gap-3 rounded-lg border p-3">
        <span className="text-2xl">{sourceCfg?.emoji ?? '❓'}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="font-semibold">
              {sourceCfg?.label ?? fingerprint.sourceType}
            </p>
            <span className="bg-secondary text-muted-foreground rounded-full px-1.5 py-0.5 text-xs font-medium">
              {Math.round(fingerprint.confidence * 100)}% confidence
            </span>
          </div>
          <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
            {fingerprint.description}
          </p>
        </div>
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card border-border rounded-lg border p-2.5 text-center">
          <p className="text-muted-foreground text-xs">Severity</p>
          <p
            className="mt-0.5 text-xl font-bold"
            style={{ color: severityColor }}
          >
            {fingerprint.severity}/10
          </p>
        </div>
        <div className="bg-card border-border rounded-lg border p-2.5 text-center">
          <p className="text-muted-foreground text-xs">Health Risk</p>
          <p
            className="mt-0.5 text-sm font-bold capitalize"
            style={{ color: healthColor }}
          >
            {fingerprint.healthRisk}
          </p>
        </div>
        <div className="bg-card border-border rounded-lg border p-2.5 text-center">
          <p className="text-muted-foreground text-xs">Radius</p>
          <p className="mt-0.5 text-sm font-bold">
            {fingerprint.estimatedRadiusMeters}m
          </p>
        </div>
      </div>

      {/* Severity bar */}
      <div>
        <div className="mb-1 flex justify-between text-xs">
          <span className="text-muted-foreground">Severity level</span>
          <span className="font-medium" style={{ color: severityColor }}>
            {fingerprint.severity}/10
          </span>
        </div>
        <div className="bg-secondary h-2 overflow-hidden rounded-full">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{ width: `${severityPct}%`, backgroundColor: severityColor }}
          />
        </div>
      </div>

      {/* Pollutants */}
      <div>
        <p className="text-muted-foreground mb-1.5 text-xs">
          Identified Pollutants
        </p>
        <div className="flex flex-wrap gap-1.5">
          {fingerprint.pollutants.map((p) => (
            <span
              key={p}
              className="bg-secondary border-border rounded-full border px-2 py-0.5 font-mono text-xs"
            >
              {p}
            </span>
          ))}
        </div>
      </div>

      {/* Recommended action */}
      <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
        <p className="mb-1 text-xs font-semibold text-amber-400">
          Municipal Action Required
        </p>
        <p className="text-muted-foreground text-xs leading-relaxed">
          {fingerprint.recommendedAction}
        </p>
      </div>
    </div>
  );
}

export function AiAnalysisDisplay({
  status,
  fingerprint,
  error,
}: AiAnalysisDisplayProps) {
  if (status === 'idle') return null;
  if (status === 'scanning') return <ScanningAnimation />;
  if (status === 'error') {
    return (
      <div className="bg-destructive/10 border-destructive/25 flex items-start gap-3 rounded-xl border p-4">
        <AlertCircle className="text-destructive mt-0.5 size-4 shrink-0" />
        <div>
          <p className="text-destructive text-sm font-semibold">
            Analysis Failed
          </p>
          <p className="text-muted-foreground mt-1 text-xs">
            {error ?? 'Please try again.'}
          </p>
        </div>
      </div>
    );
  }
  if (status === 'complete' && fingerprint)
    return <ResultDisplay fingerprint={fingerprint} />;
  return null;
}
