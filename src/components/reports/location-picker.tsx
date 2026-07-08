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
  lng: 77.209,
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

export function LocationPicker({
  onLocationSelected,
  location,
}: LocationPickerProps) {
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
      () => {
        setError('GPS unavailable');
        setLoading(false);
      },
      { timeout: 10000 },
    );
  }

  return (
    <div className="space-y-3">
      {/* Current location display */}
      <div
        className={cn(
          'flex items-start gap-3 rounded-lg border p-3 transition-colors',
          location
            ? 'border-emerald-500/30 bg-emerald-500/5'
            : 'border-border bg-secondary',
        )}
      >
        {loading ? (
          <Loader2 className="text-muted-foreground mt-0.5 size-4 shrink-0 animate-spin" />
        ) : (
          <MapPin
            className={cn(
              'mt-0.5 size-4 shrink-0',
              location ? 'text-emerald-400' : 'text-muted-foreground',
            )}
          />
        )}
        <div className="min-w-0 flex-1">
          {loading ? (
            <p className="text-muted-foreground text-sm">
              Detecting your location...
            </p>
          ) : location ? (
            <>
              <p className="truncate text-sm font-medium">{location.address}</p>
              <p className="text-muted-foreground mt-0.5 text-xs">
                {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </p>
            </>
          ) : (
            <p className="text-muted-foreground text-sm">
              No location detected
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={handleRefetch}
          disabled={loading}
          className="hover:bg-accent shrink-0 rounded-lg p-1.5 transition-colors disabled:opacity-50"
          title="Refresh GPS"
        >
          <LocateFixed className="text-muted-foreground size-3.5" />
        </button>
      </div>

      {error && <p className="text-xs text-amber-400">{error}</p>}

      {/* Manual override */}
      <details className="text-xs">
        <summary className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
          Enter coordinates manually
        </summary>
        <div className="mt-2 flex gap-2">
          <input
            type="number"
            step="any"
            placeholder="Latitude"
            value={manualLat}
            onChange={(e) => setManualLat(e.target.value)}
            className="bg-secondary border-border focus:ring-primary flex-1 rounded-lg border px-2 py-1.5 text-xs focus:ring-1 focus:outline-none"
          />
          <input
            type="number"
            step="any"
            placeholder="Longitude"
            value={manualLng}
            onChange={(e) => setManualLng(e.target.value)}
            className="bg-secondary border-border focus:ring-primary flex-1 rounded-lg border px-2 py-1.5 text-xs focus:ring-1 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleManualSubmit}
            className="bg-primary text-primary-foreground rounded-lg px-2 py-1.5 text-xs font-medium hover:opacity-90"
          >
            Set
          </button>
        </div>
      </details>
    </div>
  );
}
