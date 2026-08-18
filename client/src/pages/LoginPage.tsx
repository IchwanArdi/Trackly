/* Hallmark · pre-emit critique: P5 H5 E5 S4 R5 V5 */
/* Hallmark · macrostructure: Split Studio · tone: calm-focused · anchor hue: orange */
import { useState } from 'react';
import { toast } from 'react-toastify';
import { api, setAuthToken, saveUser } from '../utils/auth';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useData } from '../store/dataStore';
import { Loader2, ArrowLeft, Activity, BarChart3 } from 'lucide-react';

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
    <div className="min-h-screen bg-background text-foreground flex flex-col lg:flex-row font-sans selection:bg-accent/20 selection:text-accent">
      {/* Left Feature & Identity Panel (Desktop) */}
      <div className="hidden lg:flex w-[420px] xl:w-[480px] bg-card border-r border-border flex-col justify-between p-10 shrink-0">
        <div>
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <img src="/trackly-icon.webp" alt="Trackly Icon" className="h-8 w-8 rounded-lg" />
            <span className="font-bold text-base tracking-tight text-foreground group-hover:text-accent transition">Trackly</span>
          </Link>

          <div className="mt-16 space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-surface text-xs font-mono font-medium text-muted">
              <span>SYSTEM LOGIN</span>
            </div>

            <h2 className="text-3xl font-bold tracking-tight text-foreground leading-snug">
              Daily routines, recorded without friction.
            </h2>

            <p className="text-sm text-muted leading-relaxed">
              Log into your Trackly account to access your personal dashboard, update category targets, and observe your activity heatmaps.
            </p>

            <div className="pt-4 space-y-4">
              <div className="flex items-start gap-3">
                <div className="h-7 w-7 rounded-lg border border-border bg-surface flex items-center justify-center shrink-0 mt-0.5">
                  <Activity className="h-3.5 w-3.5 text-accent" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">Rapid Logging</h4>
                  <p className="text-xs text-muted leading-normal">Update activity numbers in seconds with custom increments.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-7 w-7 rounded-lg border border-border bg-surface flex items-center justify-center shrink-0 mt-0.5">
                  <BarChart3 className="h-3.5 w-3.5 text-accent" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">Consistency Heatmaps</h4>
                  <p className="text-xs text-muted leading-normal">Track your long-term streak milestones and annual activity trends.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-border/60 flex items-center justify-between text-xs text-muted">
          <Link to="/" className="inline-flex items-center gap-1 hover:text-foreground transition font-medium">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to website</span>
          </Link>
          <span className="font-mono text-[11px]">Trackly v1.0</span>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-10">
        <div className="flex items-center justify-between lg:hidden mb-8">
          <Link to="/" className="flex items-center gap-2">
            <img src="/trackly-icon.webp" alt="Trackly Icon" className="h-7 w-7 rounded-lg" />
            <span className="font-bold text-sm text-foreground">Trackly</span>
          </Link>
          <Link to="/" className="text-xs text-muted hover:text-foreground flex items-center gap-1 font-medium">
            <ArrowLeft className="h-3 w-3" />
            <span>Home</span>
          </Link>
        </div>

        <div className="my-auto mx-auto w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Sign in</h1>
            <p className="mt-1.5 text-sm text-muted">Welcome back. Enter your credentials to continue.</p>
          </div>

          <form id="form-login" onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="input-email"
              label="Email address"
              type="email"
              disabled={loading}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="input-password" className="text-xs font-medium text-foreground">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs text-accent hover:underline font-medium">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="input-password"
                type="password"
                disabled={loading}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <Button disabled={loading} id="btn-login-submit" type="submit" variant="primary" size="md" className="w-full mt-2">
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted font-mono uppercase tracking-wider">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Google Sign-In */}
          <button
            type="button"
            id="btn-google-login"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-2.5 h-10 rounded-xl border border-border bg-card text-sm font-medium text-foreground hover:bg-surface active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer focus-visible:ring-2 focus-visible:ring-border"
          >
            <GoogleIcon />
            <span>{googleLoading ? 'Connecting...' : 'Sign in with Google'}</span>
          </button>

          <p className="text-xs text-muted text-center mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-accent hover:underline font-semibold">
              Create an account
            </Link>
          </p>
        </div>

        <div className="hidden lg:block text-center text-xs text-muted py-4">
          Protected by Trackly Auth · Privacy First
        </div>
      </div>
    </div>
  );
}
