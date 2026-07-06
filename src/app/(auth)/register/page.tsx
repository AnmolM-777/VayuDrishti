import type { Metadata } from 'next';
import { EmptyState } from '@/components/feedback/empty-state';

export const metadata: Metadata = {
  title: 'Create Account',
  description: 'Create a new VayuDrishti account',
};

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Create an account</h1>
        <p className="text-muted-foreground text-sm">
          Join VayuDrishti to report pollution in your area
        </p>
      </div>
      <EmptyState
        iconName="UserPlus"
        title="Registration coming soon"
        description="Firebase Authentication will be integrated in a future phase."
      />
    </div>
  );
}
