import { useState } from 'react';
import { toast } from 'react-toastify';
import { api, setAuthToken } from '../utils/auth';
import { useNavigate, Link } from 'react-router-dom';
import { Activity, ArrowRight } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const idToast = toast.loading('Loading...');
    try {
      const response = await api.post('/api/auth/login', {
        email,
        password
      });
      setAuthToken(response.data.token);
      toast.update(idToast, {
        render: `${response.data.message}`,
        type: 'success',
        isLoading: false,
        autoClose: 2000
      });

      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (error: any) {
      toast.update(idToast, {
        render: `${error.response.data.message}`,
        type: 'error',
        isLoading: false,
        autoClose: 2000
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-80 xl:w-96 bg-card border-r border-border flex-col justify-between p-10 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-accent rounded-md flex items-center justify-center">
            <Activity size={14} className="text-white" />
          </div>
          <span className="font-semibold text-sm tracking-tight text-foreground">Trackly</span>
        </div>

        <div>
          <blockquote className="text-sm text-muted leading-relaxed">
            "Consistency beats perfection. Trackly helps me see my patterns clearly without the noise."
          </blockquote>
          <div className="mt-4">
            <p className="text-sm font-medium text-foreground">Alex Kim</p>
            <p className="text-xs text-muted">Product Designer</p>
          </div>
        </div>

        <div className="space-y-3">
          {[
            { label: 'Total activities logged', value: '2,847' },
            { label: 'Active users', value: '1,200+' },
            { label: 'Categories tracked', value: '18' },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-center">
              <span className="text-xs text-muted">{label}</span>
              <span className="text-sm font-semibold text-foreground tabular-nums">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-7 h-7 bg-accent rounded-md flex items-center justify-center">
              <Activity size={14} className="text-white" />
            </div>
            <span className="font-semibold text-sm text-foreground">Trackly</span>
          </div>

          <h1 className="text-xl font-semibold text-foreground mb-1">Sign in</h1>
          <p className="text-sm text-muted mb-7">Track what matters, every day.</p>

          <form id="form-login" onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="input-email"
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <Input
              id="input-password"
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />

            <div className="flex justify-end">
              <button type="button" className="text-xs text-accent hover:underline">
                Forgot password?
              </button>
            </div>

            <Button
              id="btn-login-submit"
              type="submit"
              variant="primary"
              size="md"
              className="w-full"
              icon={<ArrowRight size={14} />}
            >
              {loading ? 'Loading...' : 'Sign in'}
            </Button>
          </form>

          <p className="text-xs text-muted text-center mt-5">
            Don't have an account?{' '}
            <Link to="/register" className="text-accent hover:underline font-medium">
              Create one
            </Link>
          </p>

          {/* Demo hint */}
          <div className="mt-6 p-3 bg-surface border border-border rounded-md">
            <p className="text-[11px] text-muted text-center">
              Demo mode — click <strong className="text-foreground">Sign in</strong> with any credentials
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
