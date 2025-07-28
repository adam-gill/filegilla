'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserData } from '@/lib/auth/userData';
import Fallback from './fallback';

interface AuthWrapperProps {
    children: React.ReactNode;
    initialUserData?: any;
    requireAuth?: boolean;
    fallback?: React.ReactNode;
}

export default function AuthWrapper({
    children,
    initialUserData,
    requireAuth = false,
    fallback = <Fallback />
}: AuthWrapperProps) {
    const [userData, setUserData] = useState(initialUserData);
    const [isLoading, setIsLoading] = useState(!initialUserData);
    const [isClient, setIsClient] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setIsClient(true);

        // If we don't have initial user data, fetch it
        if (!initialUserData) {
            const checkAuth = async () => {
                try {
                    const data = await getUserData();
                    setUserData(data);
                } catch (error) {
                    console.error('Auth check failed:', error);
                    if (requireAuth) {
                        router.push('/signin');
                    }
                } finally {
                    setIsLoading(false);
                }
            };

            checkAuth();
        } else {
            setIsLoading(false);
        }
    }, [initialUserData, requireAuth, router]);

    if (isLoading) {
        return <>{fallback}</>;
    }

    if (requireAuth && !userData) {
        return <>{fallback}</>;
    }

    // Render children with user data context
    return (
        <AuthContext.Provider value={{ userData, isLoading: false }}>
            {children}
        </AuthContext.Provider>
    );
}

// Create a context for user data
import { createContext, useContext } from 'react';

interface AuthContextType {
    userData: any;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
    userData: null,
    isLoading: true,
});

export const useAuth = () => useContext(AuthContext); 