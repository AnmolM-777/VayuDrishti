import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Authentication',
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div className="bg-muted/30 flex min-h-dvh items-center justify-center p-4">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
