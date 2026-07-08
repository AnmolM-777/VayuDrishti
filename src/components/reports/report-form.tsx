'use client';

import { useState } from 'react';
import { PhotoCapture } from './photo-capture';
import { LocationPicker } from './location-picker';
import { AiAnalysisDisplay } from './ai-analysis-display';
import { useAuth } from '@/lib/auth-context';
import type { GeoLocation, PollutionFingerprint } from '@/types/report';
import { CheckCircle2, ChevronRight, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

const STEPS = ['Photo', 'Location', 'Details', 'AI Results'];

export function ReportForm() {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [photoPreview, setPhotoPreview] = useState<string | undefined>();
  const [photoBase64, setPhotoBase64] = useState<string | undefined>();
  const [location, setLocation] = useState<GeoLocation | undefined>();
  const [description, setDescription] = useState('');
  const [analysisStatus, setAnalysisStatus] = useState<
    'idle' | 'scanning' | 'complete' | 'error'
  >('idle');
  const [fingerprint, setFingerprint] = useState<
    PollutionFingerprint | undefined
  >();
  const [analysisError, setAnalysisError] = useState<string | undefined>();
  const [submitError, setSubmitError] = useState<string | undefined>();
  const [submitted, setSubmitted] = useState(false);

  function handlePhotoSelected(_file: File, preview: string, base64: string) {
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
      const token = user ? await user.getIdToken() : undefined;
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
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
    if (!location) return;
    setSubmitError(undefined);

    try {
      const token = user ? await user.getIdToken() : undefined;
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          location,
          description,
          aiAnalysis: fingerprint,
          imageBase64: photoBase64,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error ?? 'Failed to submit report');
      }
      setSubmitted(true);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Failed to submit report',
      );
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-8 text-center">
        <CheckCircle2 className="size-12 text-emerald-400" />
        <p className="text-lg font-bold">Report Submitted!</p>
        <p className="text-muted-foreground text-sm">
          Your pollution report has been recorded. Municipal teams will be
          notified.
        </p>
        <button
          onClick={() => {
            setStep(0);
            setPhotoPreview(undefined);
            setPhotoBase64(undefined);
            setLocation(undefined);
            setDescription('');
            setAnalysisStatus('idle');
            setFingerprint(undefined);
            setSubmitError(undefined);
            setSubmitted(false);
          }}
          className="bg-primary text-primary-foreground mt-2 rounded-lg px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90"
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
          <div key={s} className="flex flex-1 items-center gap-1">
            <button
              onClick={() => i < step && setStep(i)}
              className={cn(
                'flex items-center gap-1.5 text-xs font-medium transition-colors',
                i === step
                  ? 'text-primary'
                  : i < step
                    ? 'cursor-pointer text-emerald-400'
                    : 'text-muted-foreground cursor-default',
              )}
            >
              <span
                className={cn(
                  'flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold',
                  i === step
                    ? 'bg-primary text-primary-foreground'
                    : i < step
                      ? 'bg-emerald-500 text-white'
                      : 'bg-secondary text-muted-foreground',
                )}
              >
                {i < step ? '✓' : i + 1}
              </span>
              <span className="hidden sm:block">{s}</span>
            </button>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  'mx-1 h-0.5 flex-1 rounded-full',
                  i < step ? 'bg-emerald-500' : 'bg-border',
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="bg-card border-border rounded-xl border p-5">
        {step === 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold">Step 1: Capture Photo</h3>
            <p className="text-muted-foreground text-sm">
              Take or upload a photo of the pollution source.
            </p>
            <PhotoCapture
              onPhotoSelected={handlePhotoSelected}
              preview={photoPreview}
              onClear={() => {
                setPhotoPreview(undefined);
                setPhotoBase64(undefined);
              }}
            />
            <button
              onClick={() => setStep(1)}
              disabled={!photoPreview}
              className="bg-primary text-primary-foreground flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              Next: Set Location <ChevronRight className="size-4" />
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-semibold">Step 2: Confirm Location</h3>
            <p className="text-muted-foreground text-sm">
              We&apos;ll detect your GPS location automatically.
            </p>
            <LocationPicker
              onLocationSelected={setLocation}
              location={location}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setStep(0)}
                className="border-border hover:bg-accent flex-1 rounded-lg border py-2.5 text-sm font-medium transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep(2)}
                disabled={!location}
                className="bg-primary text-primary-foreground flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-40"
              >
                Next: Add Details <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-semibold">Step 3: Describe the Pollution</h3>
            <p className="text-muted-foreground text-sm">
              Add any context to help the AI and municipal teams.
            </p>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Garbage burning near market, smoke visible for 500m..."
              rows={4}
              className="bg-secondary border-border focus:ring-primary w-full resize-none rounded-lg border px-3 py-2.5 text-sm focus:ring-1 focus:outline-none"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="border-border hover:bg-accent flex-1 rounded-lg border py-2.5 text-sm font-medium transition-colors"
              >
                Back
              </button>
              <button
                onClick={runAnalysis}
                className="bg-primary text-primary-foreground flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
              >
                Analyse with AI <Send className="size-4" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-semibold">Step 4: AI Analysis Results</h3>
            <AiAnalysisDisplay
              status={analysisStatus}
              fingerprint={fingerprint}
              error={analysisError}
            />
            {(analysisStatus === 'complete' || analysisStatus === 'error') && (
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="border-border hover:bg-accent flex-1 rounded-lg border py-2.5 text-sm font-medium transition-colors"
                >
                  {analysisStatus === 'error' ? 'Retry' : 'Edit'}
                </button>
                {analysisStatus === 'complete' && (
                  <div className="flex-1 space-y-2">
                    <button
                      onClick={handleSubmit}
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
                    >
                      <CheckCircle2 className="size-4" /> Submit Report
                    </button>
                    {submitError && (
                      <p className="text-destructive text-xs">{submitError}</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
