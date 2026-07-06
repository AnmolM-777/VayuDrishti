'use client';

import { ThemeToggle } from '@/components/layout/theme-toggle';
import { NotificationButton } from '@/components/layout/notification-button';
import { UserMenu } from '@/components/layout/user-menu';
import { MobileNav } from '@/components/layout/mobile-nav';
import type { NavItem } from '@/constants/navigation';

interface HeaderProps {
  readonly items: readonly NavItem[];
  readonly label: string;
}

export function Header({ items, label }: HeaderProps) {
  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-30 flex h-14 items-center gap-2 border-b px-4 backdrop-blur-sm">
      <MobileNav items={items} label={label} />

      <div className="flex flex-1 items-center justify-end gap-1">
        <ThemeToggle />
        <NotificationButton />
        <UserMenu />
      </div>
    </header>
  );
}
