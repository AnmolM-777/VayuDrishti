'use client';

import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function NotificationButton() {
  const [count, setCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    // Poll for active alert count
    fetch('/api/alerts?status=active')
      .then((r) => r.json())
      .then((d) => setCount(d.alerts?.length ?? 0))
      .catch(() => {});
  }, []);

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={`View notifications${count > 0 ? ` (${count} active)` : ''}`}
      className="relative"
      onClick={() => router.push('/alerts')}
    >
      <Bell className="size-4" />
      {count > 0 && (
        <span className="bg-destructive text-destructive-foreground absolute top-1 right-1 flex h-[14px] min-w-[14px] items-center justify-center rounded-full px-0.5 text-[9px] leading-none font-bold">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </Button>
  );
}
