'use client';

import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function NotificationButton() {
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="View notifications"
      className="relative"
    >
      <Bell className="size-4" />
      <span className="bg-destructive absolute top-1 right-1 size-2 rounded-full" />
    </Button>
  );
}
