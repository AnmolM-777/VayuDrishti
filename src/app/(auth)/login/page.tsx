'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Wind, Globe, Loader2, ArrowRight, Info } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const {
    signInWithGoogle,
    isFirebaseConfigured,
    loading: authLoading,
  } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleGoogleSignIn() {
    if (!isFirebaseConfigured) return;
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      router.push('/dashboard');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Sign-in failed. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  }

  function handleDemoAccess() {
    // For hackathon demo: skip auth and go straight to dashboard
    router.push('/dashboard');
  }

  return (
    <div className="space-y-6">
      {/* Logo + branding */}
      <div className="space-y-3 text-center">
        <div className="flex items-center justify-center gap-2">
          <div className="bg-primary rounded-xl p-2">
            <Wind className="text-primary-foreground size-7" />
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-bold">VayuDrishti</h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">
            वायुदृष्टि · AI Pollution Intelligence
          </p>
        </div>
        <p className="text-muted-foreground text-sm">
          Join Delhi&apos;s network of citizen air quality sentinels.
        </p>
      </div>

      {/* Auth card */}
      <div className="bg-card border-border space-y-4 rounded-xl border p-6 shadow-sm">
        <div>
          <h2 className="text-lg font-semibold">Welcome back</h2>
          <p className="text-muted-foreground text-sm">
            Sign in to your account
          </p>
        </div>

        {error && (
          <div className="bg-destructive/10 border-destructive/25 text-destructive rounded-lg border px-3 py-2 text-sm">
            {error}
          </div>
        )}

        {/* Firebase not configured notice */}
        {!isFirebaseConfigured && (
          <div className="flex items-start gap-2 rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2.5 text-xs text-amber-400">
            <Info className="mt-0.5 size-3.5 shrink-0" />
            <span>
              Firebase not configured. Use Demo Access below to explore the app.
            </span>
          </div>
        )}

        {/* Google Sign In */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading || authLoading || !isFirebaseConfigured}
          className={cn(
            'border-border flex w-full items-center justify-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium transition-all',
            isFirebaseConfigured
              ? 'hover:bg-accent hover:border-foreground/20 active:scale-[0.98]'
              : 'cursor-not-allowed opacity-40',
          )}
        >
          {loading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Globe className="size-4" />
          )}
          Continue with Google
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="bg-border h-px flex-1" />
          <span className="text-muted-foreground text-xs">or</span>
          <div className="bg-border h-px flex-1" />
        </div>

        {/* Demo access */}
        <button
          onClick={handleDemoAccess}
          className="bg-primary text-primary-foreground flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-opacity hover:opacity-90 active:scale-[0.98]"
        >
          <ArrowRight className="size-4" />
          Demo Access (No login required)
        </button>

        <p className="text-muted-foreground text-center text-xs">
          Don&apos;t have an account?{' '}
          <Link
            href="/register"
            className="text-primary font-medium hover:underline"
          >
            Register
          </Link>
        </p>
      </div>

      {/* Features teaser */}
      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          { emoji: '🗺️', label: 'Live Map' },
          { emoji: '🤖', label: 'AI Analysis' },
          { emoji: '🚒', label: 'Dispatch' },
        ].map(({ emoji, label }) => (
          <div
            key={label}
            className="bg-card border-border rounded-lg border p-3"
          >
            <div className="mb-1 text-xl">{emoji}</div>
            <p className="text-muted-foreground text-[10px] font-medium">
              {label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
