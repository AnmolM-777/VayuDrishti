import type { Metadata } from 'next';
import { EmptyState } from '@/components/feedback/empty-state';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your VayuDrishti account',
};

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-muted-foreground text-sm">
          Sign in to your VayuDrishti account
        </p>
      </div>
      <EmptyState
        iconName="LogIn"
        title="Authentication coming soon"
        description="Firebase Authentication will be integrated in a future phase."
      />
    </div>
  );
}
