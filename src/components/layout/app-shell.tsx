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
      <Sidebar items={navItems} label={navLabel} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header items={navItems} label={navLabel} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
