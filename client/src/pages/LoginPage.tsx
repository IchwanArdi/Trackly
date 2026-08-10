import { useState } from 'react';
import { toast } from 'react-toastify';
import { api, setAuthToken, saveUser } from '../utils/auth';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useData } from '../store/dataStore';

// Official Google "G" logo (4-color), per Google brand guidelines
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" />
      <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" />
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.581C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" />
    </svg>
  );
}

export function LoginPage() {
  const navigate = useNavigate();
  const { refreshAll } = useData();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const idToast = toast.loading('Loading...');
    try {
      const response = await api.post('/api/auth/login', {
        email,
        password,
      });
      setAuthToken(response.data.token);
      saveUser(response.data.user);
      await refreshAll();

      toast.update(idToast, {
        render: `${response.data.message}`,
        type: 'success',
        isLoading: false,
        autoClose: 2000,
      });

      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (error: unknown) {
      toast.update(idToast, {
        render: `${(error as { response?: { data?: { message?: string } } }).response?.data?.message || 'An unexpected error occurred'}`,
        type: 'error',
        isLoading: false,
        autoClose: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setGoogleLoading(true);
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    window.location.assign(`${apiBaseUrl}/api/auth/google`);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-80 xl:w-96 bg-card border-r border-border flex-col justify-between p-10 shrink-0">
        <Link to="/">
          <div className="flex items-center gap-2.5 cursor-pointer">
            <div className="w-8 h-8 bg-accent rounded-md flex items-center justify-center">
              <img src="/trackly-icon.webp" alt="Trackly Icon" />
            </div>
            <span className="font-semibold text-sm tracking-tight text-foreground">Trackly</span>
          </div>
        </Link>

        <div className="flex flex-col justify-center h-full gap-2">
          <blockquote className="text-sm text-muted leading-relaxed">"Consistency beats perfection. Trackly helps me see my patterns clearly without the noise."</blockquote>
          <div className="mt-4">
            <p className="text-sm font-medium text-foreground">Alex Kim</p>
            <p className="text-xs text-muted">Product Designer</p>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-accent rounded-md flex items-center justify-center">
              <img src="/trackly-icon.webp" alt="Trackly Icon" />
            </div>
            <span className="font-semibold text-sm text-foreground">Trackly</span>
          </Link>

          <h1 className="text-xl font-semibold text-foreground mb-1">Sign in</h1>
          <p className="text-sm text-muted mb-7">Track what matters, every day.</p>

          <form id="form-login" onSubmit={handleSubmit} className="space-y-4">
            <Input id="input-email" label="Email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
            <Input id="input-password" label="Password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-xs text-accent hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button id="btn-login-submit" type="submit" variant="primary" size="md" className="w-full">
              {loading ? 'Loading...' : 'Sign in'}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted">or continue with</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Google Sign-In */}
          <button
            type="button"
            id="btn-google-login"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 h-10 rounded-md border border-border bg-white text-sm font-medium text-neutral-700 hover:bg-neutral-50 active:bg-neutral-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            <GoogleIcon />
            {googleLoading ? 'Connecting...' : 'Sign in with Google'}
          </button>

          <p className="text-xs text-muted text-center mt-5">
            Don't have an account?{' '}
            <Link to="/register" className="text-accent hover:underline font-medium">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
