import type { ReactNode } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import type { NavItem } from '@/constants/navigation';

interface AppShellProps {
  readonly children: ReactNode;
  readonly navItems: readonly NavItem[];
  readonly navLabel: string;
}

export function AppShell({ children, navItems, navLabel }: AppShellProps) {
  return (
    <div className="flex h-dvh">
      <a
        href="#main-content"
        className="focus:bg-background focus:text-foreground focus:ring-ring sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:ring-2"
      >
        Skip to main content
      </a>
      <Sidebar items={navItems} label={navLabel} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header items={navItems} label={navLabel} />
        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 overflow-y-auto p-4 sm:p-6"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
