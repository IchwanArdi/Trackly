import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { api, saveUser, setAuthToken } from '../utils/auth';
import { useData } from '../store/dataStore';
import { trackEvent } from '../utils/analytics';

export function AuthSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshAll } = useData();
  const exchangeStarted = useRef(false);

  useEffect(() => {
    // React StrictMode can run effects twice in development. The exchange code
    // is single-use, so guard it to avoid a false "already used" error.
    if (exchangeStarted.current) return;
    exchangeStarted.current = true;

    const code = searchParams.get('code');

    if (!code) {
      toast.error('Authentication failed. Please try again.');
      navigate('/login', { replace: true });
      return;
    }

    // Remove the one-time code from the address bar before the async exchange.
    // This keeps it out of browser history and out of any third-party script's
    // view; the value is already captured safely in memory.
    window.history.replaceState(window.history.state, '', '/auth/success');

    const exchangeCode = async () => {
      try {
        // The 7-day JWT is returned in the response body. It never appears in
        // the URL; only the short-lived, single-use OAuth code does.
        const response = await api.post('/api/auth/google/exchange', { code });

        setAuthToken(response.data.token);
        saveUser(response.data.user);

        // A failed data prefetch should not block a successful sign-in.
        await refreshAll().catch(() => {});

        trackEvent('login', { method: 'google' });
        navigate('/dashboard', { replace: true });
      } catch (error) {
        const message =
          (error as { response?: { data?: { message?: string } } }).response?.data?.message ||
          'Google sign-in failed. Please try again.';
        toast.error(message);
        navigate('/login', { replace: true });
      }
    };

    void exchangeCode();
  }, [navigate, refreshAll, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="text-center">
        <p className="text-lg font-medium">Connecting your account...</p>
        <p className="text-sm text-muted mt-2">Please wait a moment.</p>
      </div>
    </div>
  );
}
