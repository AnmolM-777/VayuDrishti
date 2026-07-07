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
    return () => { clearInterval(msgTimer); clearInterval(progTimer); };
  }, []);

  return (
    <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative size-10">
          <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" />
          <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Loader2 className="size-5 text-primary animate-spin" />
          </div>
        </div>
        <div>
          <p className="font-semibold text-sm text-primary">AI Analysis Running</p>
          <p className="text-xs text-muted-foreground">Gemini 2.5 Flash · Environmental Forensics</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Animated scanning message */}
      <p className="text-xs text-muted-foreground animate-pulse min-h-4">{SCANNING_MESSAGES[msgIdx]}</p>
    </div>
  );
}

function ResultDisplay({ fingerprint }: { fingerprint: PollutionFingerprint }) {
  const sourceCfg = SOURCE_TYPE_CONFIG[fingerprint.sourceType];
  const severityPct = (fingerprint.severity / 10) * 100;
  const severityColor = fingerprint.severity >= 8 ? '#ef4444' : fingerprint.severity >= 6 ? '#f97316' : fingerprint.severity >= 4 ? '#f59e0b' : '#22c55e';
  const healthColor = fingerprint.healthRisk === 'critical' ? '#8b5cf6' : fingerprint.healthRisk === 'high' ? '#ef4444' : fingerprint.healthRisk === 'medium' ? '#f97316' : '#22c55e';

  return (
    <div className="bg-emerald-500/5 border border-emerald-500/25 rounded-xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <CheckCircle2 className="size-4 text-emerald-400" />
        <span className="text-sm font-semibold text-emerald-400">Analysis Complete</span>
      </div>

      {/* Source classification */}
      <div className="flex items-start gap-3 p-3 bg-card rounded-lg border border-border">
        <span className="text-2xl">{sourceCfg?.emoji ?? '❓'}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="font-semibold">{sourceCfg?.label ?? fingerprint.sourceType}</p>
            <span className="text-xs px-1.5 py-0.5 rounded-full font-medium bg-secondary text-muted-foreground">
              {Math.round(fingerprint.confidence * 100)}% confidence
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{fingerprint.description}</p>
        </div>
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-2.5 bg-card rounded-lg border border-border text-center">
          <p className="text-xs text-muted-foreground">Severity</p>
          <p className="text-xl font-bold mt-0.5" style={{ color: severityColor }}>{fingerprint.severity}/10</p>
        </div>
        <div className="p-2.5 bg-card rounded-lg border border-border text-center">
          <p className="text-xs text-muted-foreground">Health Risk</p>
          <p className="text-sm font-bold mt-0.5 capitalize" style={{ color: healthColor }}>{fingerprint.healthRisk}</p>
        </div>
        <div className="p-2.5 bg-card rounded-lg border border-border text-center">
          <p className="text-xs text-muted-foreground">Radius</p>
          <p className="text-sm font-bold mt-0.5">{fingerprint.estimatedRadiusMeters}m</p>
        </div>
      </div>

      {/* Severity bar */}
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-muted-foreground">Severity level</span>
          <span className="font-medium" style={{ color: severityColor }}>{fingerprint.severity}/10</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${severityPct}%`, backgroundColor: severityColor }} />
        </div>
      </div>

      {/* Pollutants */}
      <div>
        <p className="text-xs text-muted-foreground mb-1.5">Identified Pollutants</p>
        <div className="flex flex-wrap gap-1.5">
          {fingerprint.pollutants.map((p) => (
            <span key={p} className="text-xs px-2 py-0.5 rounded-full bg-secondary border border-border font-mono">{p}</span>
          ))}
        </div>
      </div>

      {/* Recommended action */}
      <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg">
        <p className="text-xs font-semibold text-amber-400 mb-1">Municipal Action Required</p>
        <p className="text-xs text-muted-foreground leading-relaxed">{fingerprint.recommendedAction}</p>
      </div>
    </div>
  );
}

export function AiAnalysisDisplay({ status, fingerprint, error }: AiAnalysisDisplayProps) {
  if (status === 'idle') return null;
  if (status === 'scanning') return <ScanningAnimation />;
  if (status === 'error') {
    return (
      <div className="bg-destructive/10 border border-destructive/25 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="size-4 text-destructive mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-destructive">Analysis Failed</p>
          <p className="text-xs text-muted-foreground mt-1">{error ?? 'Please try again.'}</p>
        </div>
      </div>
    );
  }
  if (status === 'complete' && fingerprint) return <ResultDisplay fingerprint={fingerprint} />;
  return null;
}
