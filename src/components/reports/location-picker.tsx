'use client';

import { useState, useEffect } from 'react';
import { MapPin, LocateFixed, Loader2 } from 'lucide-react';
import type { GeoLocation } from '@/types/report';
import { cn } from '@/lib/utils';

interface LocationPickerProps {
  onLocationSelected: (location: GeoLocation) => void;
  location?: GeoLocation;
}

const DELHI_DEFAULT: GeoLocation = {
  lat: 28.6139,
  lng: 77.2090,
  address: 'Delhi, India',
  city: 'Delhi',
};

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
      { headers: { 'User-Agent': 'VayuDrishti/1.0' } },
    );
    const data = await res.json();
    return data.display_name ?? `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } catch {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
}

export function LocationPicker({ onLocationSelected, location }: LocationPickerProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualLat, setManualLat] = useState('');
  const [manualLng, setManualLng] = useState('');

  // Auto-detect on mount
  useEffect(() => {
    if (location) return; // already set
    if (!navigator.geolocation) {
      onLocationSelected(DELHI_DEFAULT);
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        const address = await reverseGeocode(lat, lng);
        onLocationSelected({ lat, lng, address, city: 'Delhi' });
        setLoading(false);
      },
      () => {
        setError('GPS unavailable — using default location');
        onLocationSelected(DELHI_DEFAULT);
        setLoading(false);
      },
      { timeout: 10000, maximumAge: 60000 },
    );
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleManualSubmit() {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);
    if (isNaN(lat) || isNaN(lng)) {
      setError('Invalid coordinates');
      return;
    }
    reverseGeocode(lat, lng).then((address) => {
      onLocationSelected({ lat, lng, address, city: 'Delhi' });
      setError(null);
    });
  }

  function handleRefetch() {
    setLoading(true);
    setError(null);
    navigator.geolocation?.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        const address = await reverseGeocode(lat, lng);
        onLocationSelected({ lat, lng, address, city: 'Delhi' });
        setLoading(false);
      },
      () => { setError('GPS unavailable'); setLoading(false); },
      { timeout: 10000 },
    );
  }

  return (
    <div className="space-y-3">
      {/* Current location display */}
      <div className={cn(
        'flex items-start gap-3 p-3 rounded-lg border transition-colors',
        location ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-border bg-secondary',
      )}>
        {loading ? (
          <Loader2 className="size-4 text-muted-foreground animate-spin mt-0.5 shrink-0" />
        ) : (
          <MapPin className={cn('size-4 mt-0.5 shrink-0', location ? 'text-emerald-400' : 'text-muted-foreground')} />
        )}
        <div className="flex-1 min-w-0">
          {loading ? (
            <p className="text-sm text-muted-foreground">Detecting your location...</p>
          ) : location ? (
            <>
              <p className="text-sm font-medium truncate">{location.address}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">No location detected</p>
          )}
        </div>
        <button
          type="button"
          onClick={handleRefetch}
          disabled={loading}
          className="shrink-0 p-1.5 rounded-lg hover:bg-accent transition-colors disabled:opacity-50"
          title="Refresh GPS"
        >
          <LocateFixed className="size-3.5 text-muted-foreground" />
        </button>
      </div>

      {error && <p className="text-xs text-amber-400">{error}</p>}

      {/* Manual override */}
      <details className="text-xs">
        <summary className="text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
          Enter coordinates manually
        </summary>
        <div className="mt-2 flex gap-2">
          <input
            type="number"
            step="any"
            placeholder="Latitude"
            value={manualLat}
            onChange={(e) => setManualLat(e.target.value)}
            className="flex-1 px-2 py-1.5 rounded-lg bg-secondary border border-border text-xs focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <input
            type="number"
            step="any"
            placeholder="Longitude"
            value={manualLng}
            onChange={(e) => setManualLng(e.target.value)}
            className="flex-1 px-2 py-1.5 rounded-lg bg-secondary border border-border text-xs focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            type="button"
            onClick={handleManualSubmit}
            className="px-2 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90"
          >
            Set
          </button>
        </div>
      </details>
    </div>
  );
}
