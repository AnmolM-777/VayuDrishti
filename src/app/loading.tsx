import { LoadingSpinner } from '@/components/feedback/loading-spinner';

export default function RootLoading() {
  return (
    <div className="flex min-h-dvh items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <LoadingSpinner size="lg" />
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    </div>
  );
}
