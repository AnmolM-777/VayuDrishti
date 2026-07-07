'use client';

import { useState } from 'react';
import { PhotoCapture } from './photo-capture';
import { LocationPicker } from './location-picker';
import { AiAnalysisDisplay } from './ai-analysis-display';
import type { GeoLocation, PollutionFingerprint } from '@/types/report';
import { CheckCircle2, ChevronRight, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

const STEPS = ['Photo', 'Location', 'Details', 'AI Results'];

export function ReportForm() {
  const [step, setStep] = useState(0);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | undefined>();
  const [photoBase64, setPhotoBase64] = useState<string | undefined>();
  const [location, setLocation] = useState<GeoLocation | undefined>();
  const [description, setDescription] = useState('');
  const [analysisStatus, setAnalysisStatus] = useState<'idle' | 'scanning' | 'complete' | 'error'>('idle');
  const [fingerprint, setFingerprint] = useState<PollutionFingerprint | undefined>();
  const [analysisError, setAnalysisError] = useState<string | undefined>();
  const [submitted, setSubmitted] = useState(false);

  function handlePhotoSelected(file: File, preview: string, base64: string) {
    setPhotoFile(file);
    setPhotoPreview(preview);
    setPhotoBase64(base64);
  }

  async function runAnalysis() {
    if (!photoBase64 || !location) return;
    setStep(3);
    setAnalysisStatus('scanning');
    setFingerprint(undefined);
    setAnalysisError(undefined);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: photoBase64,
          location,
          description,
          timestamp: new Date().toISOString(),
        }),
      });
      const data = await res.json();
      if (data.success && data.fingerprint) {
        setFingerprint(data.fingerprint);
        setAnalysisStatus('complete');
      } else {
        throw new Error(data.error ?? 'Unknown error');
      }
    } catch (err) {
      setAnalysisError(err instanceof Error ? err.message : 'Analysis failed');
      setAnalysisStatus('error');
    }
  }

  async function handleSubmit() {
    // In production: save to Firestore. For demo, just mark submitted.
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-xl p-8 flex flex-col items-center text-center gap-3">
        <CheckCircle2 className="size-12 text-emerald-400" />
        <p className="text-lg font-bold">Report Submitted!</p>
        <p className="text-muted-foreground text-sm">
          Your pollution report has been recorded. Municipal teams will be notified.
        </p>
        <button
          onClick={() => {
            setStep(0); setPhotoFile(null); setPhotoPreview(undefined); setPhotoBase64(undefined);
            setLocation(undefined); setDescription(''); setAnalysisStatus('idle');
            setFingerprint(undefined); setSubmitted(false);
          }}
          className="mt-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Submit Another Report
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Step progress */}
      <div className="flex items-center gap-1">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-1 flex-1">
            <button
              onClick={() => i < step && setStep(i)}
              className={cn(
                'flex items-center gap-1.5 text-xs font-medium transition-colors',
                i === step ? 'text-primary' : i < step ? 'text-emerald-400 cursor-pointer' : 'text-muted-foreground cursor-default',
              )}
            >
              <span className={cn(
                'size-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0',
                i === step ? 'bg-primary text-primary-foreground' :
                i < step ? 'bg-emerald-500 text-white' : 'bg-secondary text-muted-foreground',
              )}>
                {i < step ? '✓' : i + 1}
              </span>
              <span className="hidden sm:block">{s}</span>
            </button>
            {i < STEPS.length - 1 && (
              <div className={cn('flex-1 h-0.5 rounded-full mx-1', i < step ? 'bg-emerald-500' : 'bg-border')} />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="bg-card border border-border rounded-xl p-5">
        {step === 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold">Step 1: Capture Photo</h3>
            <p className="text-sm text-muted-foreground">Take or upload a photo of the pollution source.</p>
            <PhotoCapture
              onPhotoSelected={handlePhotoSelected}
              preview={photoPreview}
              onClear={() => { setPhotoFile(null); setPhotoPreview(undefined); setPhotoBase64(undefined); }}
            />
            <button
              onClick={() => setStep(1)}
              disabled={!photoPreview}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm disabled:opacity-40 hover:opacity-90 transition-opacity"
            >
              Next: Set Location <ChevronRight className="size-4" />
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-semibold">Step 2: Confirm Location</h3>
            <p className="text-sm text-muted-foreground">We'll detect your GPS location automatically.</p>
            <LocationPicker onLocationSelected={setLocation} location={location} />
            <div className="flex gap-3">
              <button onClick={() => setStep(0)} className="flex-1 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-accent transition-colors">
                Back
              </button>
              <button
                onClick={() => setStep(2)}
                disabled={!location}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm disabled:opacity-40 hover:opacity-90 transition-opacity"
              >
                Next: Add Details <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-semibold">Step 3: Describe the Pollution</h3>
            <p className="text-sm text-muted-foreground">Add any context to help the AI and municipal teams.</p>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Garbage burning near market, smoke visible for 500m..."
              rows={4}
              className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-accent transition-colors">
                Back
              </button>
              <button
                onClick={runAnalysis}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity"
              >
                Analyse with AI <Send className="size-4" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-semibold">Step 4: AI Analysis Results</h3>
            <AiAnalysisDisplay status={analysisStatus} fingerprint={fingerprint} error={analysisError} />
            {(analysisStatus === 'complete' || analysisStatus === 'error') && (
              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="flex-1 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-accent transition-colors">
                  {analysisStatus === 'error' ? 'Retry' : 'Edit'}
                </button>
                {analysisStatus === 'complete' && (
                  <button
                    onClick={handleSubmit}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-emerald-600 text-white font-medium text-sm hover:bg-emerald-700 transition-colors"
                  >
                    <CheckCircle2 className="size-4" /> Submit Report
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
