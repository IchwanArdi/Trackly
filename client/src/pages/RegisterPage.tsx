/* Hallmark · pre-emit critique: P5 H5 E5 S4 R5 V5 */
/* Hallmark · macrostructure: Split Studio · tone: calm-focused · anchor hue: orange */
import { useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../utils/auth';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Loader2, ArrowLeft, ShieldCheck, Layers } from 'lucide-react';

export function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const idToast = toast.loading('Creating account...');
    try {
      const response = await api.post('/api/auth/register', {
        name,
        email,
        password,
      });
      toast.update(idToast, {
        render: `${response.data.message}`,
        type: 'success',
        isLoading: false,
        autoClose: 2000,
      });
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (error: unknown) {
      toast.update(idToast, {
        render: `${(error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to create account'}`,
        type: 'error',
        isLoading: false,
        autoClose: 2000,
      });
    } finally {
      setLoading(false);
    }
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
              <span>GET STARTED</span>
            </div>

            <h2 className="text-3xl font-bold tracking-tight text-foreground leading-snug">
              Your personal habit tracking workspace.
            </h2>

            <p className="text-sm text-muted leading-relaxed">
              Create an account in seconds to start building custom habit categories, logging metrics, and sharing milestone progress.
            </p>

            <div className="pt-4 space-y-4">
              <div className="flex items-start gap-3">
                <div className="h-7 w-7 rounded-lg border border-border bg-surface flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-accent" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">100% Free & Private</h4>
                  <p className="text-xs text-muted leading-normal">Zero ads, zero data tracking, and total ownership of your history.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-7 w-7 rounded-lg border border-border bg-surface flex items-center justify-center shrink-0 mt-0.5">
                  <Layers className="h-3.5 w-3.5 text-accent" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">Custom Habit Specs</h4>
                  <p className="text-xs text-muted leading-normal">Configure units, icons, and target numerical goals for each routine.</p>
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
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Create account</h1>
            <p className="mt-1.5 text-sm text-muted">Start tracking your routines with quiet clarity.</p>
          </div>

          <form id="form-register" onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="input-name"
              label="Full name"
              type="text"
              disabled={loading}
              placeholder="e.g. Alex Rivera"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
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
            <Input
              id="input-password"
              label="Password"
              type="password"
              disabled={loading}
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />

            <p className="text-[11px] text-muted leading-relaxed pt-1">
              By creating an account, you agree to our{' '}
              <Link to="/terms-of-service" className="text-accent hover:underline font-medium">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy-policy" className="text-accent hover:underline font-medium">
                Privacy Policy
              </Link>
              .
            </p>

            <Button disabled={loading} id="btn-register-submit" type="submit" variant="primary" size="md" className="w-full">
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                'Create account'
              )}
            </Button>
          </form>

          <p className="text-xs text-muted text-center mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-accent hover:underline font-semibold">
              Sign in
            </Link>
          </p>
        </div>

        <div className="hidden lg:block text-center text-xs text-muted py-4">
          Trackly · Calm Personal Habit Tracking
        </div>
      </div>
    </div>
  );
}
