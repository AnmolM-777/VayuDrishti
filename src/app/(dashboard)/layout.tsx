import type { ReactNode } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { CITIZEN_NAV_ITEMS } from '@/constants/navigation';

export default function DashboardLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <AppShell navItems={CITIZEN_NAV_ITEMS} navLabel="Citizen navigation">
      {children}
    </AppShell>
  );
}
