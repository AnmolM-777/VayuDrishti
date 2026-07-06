'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Root error:', error);
  }, [error]);

  return (
    <div className="flex min-h-dvh items-center justify-center p-4">
      <div className="flex max-w-md flex-col items-center text-center">
        <div className="bg-destructive/10 flex size-14 items-center justify-center rounded-full">
          <AlertTriangle className="text-destructive size-7" />
        </div>
        <h2 className="mt-4 text-xl font-semibold">Something went wrong</h2>
        <p className="text-muted-foreground mt-2 text-sm">
          An unexpected error occurred. Please try again.
        </p>
        <Button onClick={reset} className="mt-6">
          Try again
        </Button>
      </div>
    </div>
  );
}
