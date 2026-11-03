import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { saveUser, setAuthToken } from '../utils/auth';
import { useData } from '../store/dataStore';
import { trackEvent } from '../utils/analytics';

export function AuthSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshAll } = useData();
  const tracked = useRef(false);

  useEffect(() => {
    const token = searchParams.get('token');
    const userId = searchParams.get('id') ?? '';
    const name = searchParams.get('name') ?? '';
    const email = searchParams.get('email') ?? '';

    if (!token) {
      toast.error('Authentication failed. Please try again.');
      navigate('/login', { replace: true });
      return;
    }

    setAuthToken(token);
    saveUser({ id: userId, name, email });

    if (!tracked.current) {
      tracked.current = true;
      trackEvent('login', { method: 'google' });
    }

    refreshAll().finally(() => {
      navigate('/dashboard', { replace: true });
    });
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
