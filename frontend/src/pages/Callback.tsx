import { useAuth } from 'react-oidc-context';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function Callback() {
  const auth = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Når auth er ferdig og bruker er autentisert, naviger til dashboard
    if (!auth.isLoading && auth.isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [auth.isAuthenticated, auth.isLoading, navigate]);

  if (auth.error) {
    return <div>Authentication error: {auth.error.message}</div>;
  }

  return <div>Signing you in…</div>;
}