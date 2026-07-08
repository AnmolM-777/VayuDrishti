/**
 * Google Maps API async loader with @types/google.maps support.
 * Singleton promise — only loads the script once per page lifecycle.
 * Falls back gracefully when the API key is not configured.
 */

let loaderPromise: Promise<void> | null = null;

export function loadGoogleMaps(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Cannot load Google Maps on server'));
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey || apiKey === 'your_google_maps_api_key_here') {
    return Promise.reject(
      new Error('NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not configured'),
    );
  }

  if (loaderPromise) return loaderPromise;

  loaderPromise = new Promise<void>((resolve, reject) => {
    // Already loaded
    if (typeof window.google !== 'undefined' && window.google.maps) {
      resolve();
      return;
    }

    const callbackName = `__gmaps_cb_${Date.now()}`;
    (window as unknown as Record<string, unknown>)[callbackName] = () =>
      resolve();

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=visualization&callback=${callbackName}`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      loaderPromise = null;
      reject(new Error('Failed to load Google Maps script'));
    };
    document.head.appendChild(script);
  });

  return loaderPromise;
}
