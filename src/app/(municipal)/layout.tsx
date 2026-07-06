import type { ReactNode } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { MUNICIPAL_NAV_ITEMS } from '@/constants/navigation';

export default function MunicipalLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <AppShell navItems={MUNICIPAL_NAV_ITEMS} navLabel="Municipal navigation">
      {children}
    </AppShell>
  );
}
