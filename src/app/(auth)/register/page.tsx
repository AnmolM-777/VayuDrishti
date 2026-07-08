'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Wind, Globe, Loader2, ArrowRight, User, MapPin } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';

const DELHI_WARDS = [
  'Lajpat Nagar',
  'Okhla',
  'ITO',
  'Connaught Place',
  'Dwarka',
  'Punjabi Bagh',
  'Anand Vihar',
  'R.K. Puram',
  'Lodhi Road',
  'Saket',
  'Rohini',
  'Vasant Kunj',
];

export default function RegisterPage() {
  const { signInWithGoogle, isFirebaseConfigured } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    displayName: '',
    city: 'Delhi',
    ward: '',
  });
  const router = useRouter();

  async function handleGoogleRegister() {
    if (!isFirebaseConfigured) return;
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed.');
    } finally {
      setLoading(false);
    }
  }

  function handleDemoAccess() {
    router.push('/dashboard');
  }

  return (
    <div className="space-y-6">
      {/* Logo */}
      <div className="space-y-2 text-center">
        <div className="flex items-center justify-center">
          <div className="bg-primary rounded-xl p-2">
            <Wind className="text-primary-foreground size-7" />
          </div>
        </div>
        <h1 className="text-2xl font-bold">Join VayuDrishti</h1>
        <p className="text-muted-foreground text-sm">
          Become a Citizen Air Quality Sentinel
        </p>
      </div>

      <div className="bg-card border-border space-y-4 rounded-xl border p-6 shadow-sm">
        <div>
          <h2 className="text-lg font-semibold">Create account</h2>
          <p className="text-muted-foreground text-sm">
            Help map pollution in your neighbourhood
          </p>
        </div>

        {error && (
          <div className="bg-destructive/10 border-destructive/25 text-destructive rounded-lg border px-3 py-2 text-sm">
            {error}
          </div>
        )}

        {/* Name field */}
        <div>
          <label className="text-muted-foreground mb-1.5 block text-xs font-medium">
            Display Name
          </label>
          <div className="relative">
            <User className="text-muted-foreground absolute top-1/2 left-3 size-3.5 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Your full name"
              value={form.displayName}
              onChange={(e) =>
                setForm({ ...form, displayName: e.target.value })
              }
              className="bg-secondary border-border focus:ring-primary w-full rounded-lg border py-2.5 pr-3 pl-8 text-sm focus:ring-1 focus:outline-none"
            />
          </div>
        </div>

        {/* City + Ward */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-muted-foreground mb-1.5 block text-xs font-medium">
              City
            </label>
            <div className="relative">
              <MapPin className="text-muted-foreground absolute top-1/2 left-3 size-3.5 -translate-y-1/2" />
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="bg-secondary border-border focus:ring-primary w-full rounded-lg border py-2.5 pr-3 pl-8 text-sm focus:ring-1 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="text-muted-foreground mb-1.5 block text-xs font-medium">
              Ward / Area
            </label>
            <select
              value={form.ward}
              onChange={(e) => setForm({ ...form, ward: e.target.value })}
              className="bg-secondary border-border focus:ring-primary w-full rounded-lg border px-3 py-2.5 text-sm focus:ring-1 focus:outline-none"
            >
              <option value="">Select area</option>
              {DELHI_WARDS.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Sentinel level preview */}
        <div className="bg-secondary border-border flex items-center gap-3 rounded-lg border p-3 text-xs">
          <span className="text-2xl">👁️</span>
          <div>
            <p className="font-semibold">Starting as Observer</p>
            <p className="text-muted-foreground">
              Submit reports to earn trust and advance to Scout → Guardian →
              Sentinel → Champion
            </p>
          </div>
        </div>

        {/* Google Register */}
        <button
          onClick={handleGoogleRegister}
          disabled={loading || !isFirebaseConfigured}
          className={cn(
            'border-border flex w-full items-center justify-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium transition-all',
            isFirebaseConfigured
              ? 'hover:bg-accent active:scale-[0.98]'
              : 'cursor-not-allowed opacity-40',
          )}
        >
          {loading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Globe className="size-4" />
          )}
          Register with Google
        </button>

        <div className="flex items-center gap-3">
          <div className="bg-border h-px flex-1" />
          <span className="text-muted-foreground text-xs">or</span>
          <div className="bg-border h-px flex-1" />
        </div>

        <button
          onClick={handleDemoAccess}
          className="bg-primary text-primary-foreground flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-opacity hover:opacity-90"
        >
          <ArrowRight className="size-4" />
          Try Demo (No account needed)
        </button>

        <p className="text-muted-foreground text-center text-xs">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-primary font-medium hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
