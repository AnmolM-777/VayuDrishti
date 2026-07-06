import { LoadingSpinner } from '@/components/feedback/loading-spinner';

export default function MunicipalLoading() {
  return (
    <div className="flex h-full items-center justify-center p-8">
      <LoadingSpinner size="lg" />
    </div>
  );
}
