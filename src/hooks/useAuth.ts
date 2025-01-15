import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function useAuth({ required = true } = {}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const loading = status === 'loading';
  const user = session?.user;

  useEffect(() => {
    if (!loading && required && !session) {
      router.push('/auth/signin');
    }
  }, [loading, session, required, router]);

  return {
    user,
    session,
    loading,
    isAuthenticated: !!session,
    isLoading: loading,
  };
}