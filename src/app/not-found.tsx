import Link from 'next/link';
import { MapPinOff } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-dvh items-center justify-center p-4">
      <div className="flex max-w-md flex-col items-center text-center">
        <div className="bg-muted flex size-14 items-center justify-center rounded-full">
          <MapPinOff className="text-muted-foreground size-7" />
        </div>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="text-muted-foreground mt-2 text-sm">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          href={ROUTES.HOME}
          className={cn(buttonVariants({ variant: 'default' }), 'mt-6')}
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
