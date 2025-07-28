'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './auth-wrapper';
import Fallback from './fallback';

interface ProtectedRouteProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
    redirectTo?: string;
}

export default function ProtectedRoute({
    children,
    fallback = <Fallback />,
    redirectTo = '/auth'
}: ProtectedRouteProps) {
    const { userData, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !userData) {
            router.push(redirectTo);
        }
    }, [userData, isLoading, router, redirectTo]);

    if (isLoading) {
        return <>{fallback}</>;
    }

    if (!userData) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
} 