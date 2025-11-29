import { type ReactNode, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';

interface RequireAuthProps {
  children: ReactNode;
  whiteList?: string[];
}

export function RequireAuth({ children, whiteList = [] }: RequireAuthProps) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      const isWhitelisted = whiteList.some(pattern => {
        if (pattern.endsWith('/*')) {
          const basePath = pattern.slice(0, -2);
          return location.pathname.startsWith(basePath);
        }
        return location.pathname === pattern;
      });

      if (!isWhitelisted) {
        navigate('/login', { state: { from: location.pathname } });
      }
    }
  }, [user, loading, location, navigate, whiteList]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
