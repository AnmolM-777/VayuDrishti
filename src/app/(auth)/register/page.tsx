'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Wind, Globe, Loader2, ArrowRight, User, MapPin } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';

const DELHI_WARDS = [
  'Lajpat Nagar', 'Okhla', 'ITO', 'Connaught Place', 'Dwarka', 'Punjabi Bagh',
  'Anand Vihar', 'R.K. Puram', 'Lodhi Road', 'Saket', 'Rohini', 'Vasant Kunj',
];

export default function RegisterPage() {
  const { signInWithGoogle, isFirebaseConfigured } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ displayName: '', city: 'Delhi', ward: '' });
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
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center">
          <div className="bg-primary p-2 rounded-xl">
            <Wind className="size-7 text-primary-foreground" />
          </div>
        </div>
        <h1 className="text-2xl font-bold">Join VayuDrishti</h1>
        <p className="text-sm text-muted-foreground">Become a Citizen Air Quality Sentinel</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 space-y-4 shadow-sm">
        <div>
          <h2 className="font-semibold text-lg">Create account</h2>
          <p className="text-sm text-muted-foreground">Help map pollution in your neighbourhood</p>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/25 rounded-lg px-3 py-2 text-sm text-destructive">{error}</div>
        )}

        {/* Name field */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Display Name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Your full name"
              value={form.displayName}
              onChange={(e) => setForm({ ...form, displayName: e.target.value })}
              className="w-full pl-8 pr-3 py-2.5 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* City + Ward */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">City</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full pl-8 pr-3 py-2.5 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Ward / Area</label>
            <select
              value={form.ward}
              onChange={(e) => setForm({ ...form, ward: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">Select area</option>
              {DELHI_WARDS.map((w) => <option key={w} value={w}>{w}</option>)}
            </select>
          </div>
        </div>

        {/* Sentinel level preview */}
        <div className="bg-secondary border border-border rounded-lg p-3 flex items-center gap-3 text-xs">
          <span className="text-2xl">👁️</span>
          <div>
            <p className="font-semibold">Starting as Observer</p>
            <p className="text-muted-foreground">Submit reports to earn trust and advance to Scout → Guardian → Sentinel → Champion</p>
          </div>
        </div>

        {/* Google Register */}
        <button
          onClick={handleGoogleRegister}
          disabled={loading || !isFirebaseConfigured}
          className={cn(
            'w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg border border-border font-medium text-sm transition-all',
            isFirebaseConfigured ? 'hover:bg-accent active:scale-[0.98]' : 'opacity-40 cursor-not-allowed',
          )}
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Globe className="size-4" />}
          Register with Google
        </button>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <button
          onClick={handleDemoAccess}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity"
        >
          <ArrowRight className="size-4" />
          Try Demo (No account needed)
        </button>

        <p className="text-xs text-muted-foreground text-center">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:underline font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
