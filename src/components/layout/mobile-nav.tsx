'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Wind } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import type { NavItem } from '@/constants/navigation';
import { resolveNavIcon } from '@/lib/nav-icons';
import { cn } from '@/lib/utils';

interface MobileNavProps {
  readonly items: readonly NavItem[];
  readonly label: string;
}

export function MobileNav({ items, label }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Open navigation menu"
          />
        }
      >
        <Menu className="size-5" />
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="border-b p-4">
          <SheetTitle className="flex items-center gap-2">
            <div className="bg-primary flex size-8 items-center justify-center rounded-lg">
              <Wind className="text-primary-foreground size-4" />
            </div>
            VayuDrishti
          </SheetTitle>
        </SheetHeader>
        <nav className="space-y-1 p-3" aria-label={label}>
          {items.map((item) => {
            const isActive = pathname === item.href;
            const Icon = resolveNavIcon(item.iconName);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="size-4 shrink-0" />
                {item.title}
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
