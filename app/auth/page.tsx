import SignInForm from '@/app/auth/components/signInForm';
import { Skeleton } from '@/components/ui/skeleton';
import { Suspense } from 'react';

export default function Auth() {
  return (
    <div className="min-h-screen px-8 w-full flex items-center justify-center bg-linear-to-br fg-grad-r">
      <Suspense fallback={<Skeleton className="rounded-xl w-125 h-125 bg-neutral-700/30!" />}>
        <SignInForm />
      </Suspense>
    </div>
  );
}
