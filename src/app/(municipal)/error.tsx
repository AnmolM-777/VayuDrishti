'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MunicipalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Municipal error:', error);
  }, [error]);

  return (
    <div className="flex h-full items-center justify-center p-8">
      <div className="flex max-w-md flex-col items-center text-center">
        <div className="bg-destructive/10 flex size-12 items-center justify-center rounded-full">
          <AlertTriangle className="text-destructive size-6" />
        </div>
        <h2 className="mt-4 text-lg font-semibold">Something went wrong</h2>
        <p className="text-muted-foreground mt-2 text-sm">
          An error occurred while loading the municipal dashboard.
        </p>
        <Button onClick={reset} variant="outline" className="mt-4">
          Try again
        </Button>
      </div>
    </div>
  );
}
