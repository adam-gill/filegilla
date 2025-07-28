import { getUserData } from '@/lib/auth/userData';
import AuthWrapper from './auth-wrapper';

interface ServerAuthProviderProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export default async function ServerAuthProvider({ 
  children, 
  requireAuth = false 
}: ServerAuthProviderProps) {
  let initialUserData = null;
  
  try {
    initialUserData = await getUserData();
  } catch (error) {
    console.log('Server auth check failed:', error);
  }

  return (
    <AuthWrapper 
      initialUserData={initialUserData}
      requireAuth={requireAuth}
    >
      {children}
    </AuthWrapper>
  );
} 