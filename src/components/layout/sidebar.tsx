'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { NavItem } from '@/constants/navigation';
import { resolveNavIcon } from '@/lib/nav-icons';
import { cn } from '@/lib/utils';
import { Wind } from 'lucide-react';

interface SidebarProps {
  readonly items: readonly NavItem[];
  readonly label: string;
}

export function Sidebar({ items, label }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="bg-sidebar hidden h-dvh w-64 shrink-0 border-r lg:block">
      <div className="flex h-full flex-col">
        <div className="flex h-14 items-center gap-2 border-b px-4">
          <div className="bg-primary flex size-8 items-center justify-center rounded-lg">
            <Wind className="text-primary-foreground size-4" />
          </div>
          <span className="text-lg font-bold">VayuDrishti</span>
        </div>

        <nav
          className="flex-1 space-y-1 overflow-y-auto p-3"
          aria-label={label}
        >
          {items.map((item) => {
            const isActive = pathname === item.href;
            const Icon = resolveNavIcon(item.iconName);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="size-4 shrink-0" />
                {item.title}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
