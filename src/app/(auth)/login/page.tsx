'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Wind, Globe, Loader2, ArrowRight, Info } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const { signInWithGoogle, isFirebaseConfigured, loading: authLoading } = useAuth();
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
      setError(err instanceof Error ? err.message : 'Sign-in failed. Please try again.');
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
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-2">
          <div className="bg-primary p-2 rounded-xl">
            <Wind className="size-7 text-primary-foreground" />
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-bold">VayuDrishti</h1>
          <p className="text-sm text-muted-foreground mt-1 font-medium">वायुदृष्टि · AI Pollution Intelligence</p>
        </div>
        <p className="text-sm text-muted-foreground">
          Join Delhi's network of citizen air quality sentinels.
        </p>
      </div>

      {/* Auth card */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-4 shadow-sm">
        <div>
          <h2 className="font-semibold text-lg">Welcome back</h2>
          <p className="text-sm text-muted-foreground">Sign in to your account</p>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/25 rounded-lg px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Firebase not configured notice */}
        {!isFirebaseConfigured && (
          <div className="bg-amber-500/10 border border-amber-500/25 rounded-lg px-3 py-2.5 flex items-start gap-2 text-xs text-amber-400">
            <Info className="size-3.5 mt-0.5 shrink-0" />
            <span>Firebase not configured. Use Demo Access below to explore the app.</span>
          </div>
        )}

        {/* Google Sign In */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading || authLoading || !isFirebaseConfigured}
          className={cn(
            'w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg border border-border font-medium text-sm transition-all',
            isFirebaseConfigured
              ? 'hover:bg-accent hover:border-foreground/20 active:scale-[0.98]'
              : 'opacity-40 cursor-not-allowed',
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
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Demo access */}
        <button
          onClick={handleDemoAccess}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity active:scale-[0.98]"
        >
          <ArrowRight className="size-4" />
          Demo Access (No login required)
        </button>

        <p className="text-xs text-muted-foreground text-center">
          Don't have an account?{' '}
          <Link href="/register" className="text-primary hover:underline font-medium">
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
          <div key={label} className="bg-card border border-border rounded-lg p-3">
            <div className="text-xl mb-1">{emoji}</div>
            <p className="text-[10px] text-muted-foreground font-medium">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
