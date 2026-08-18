/* Hallmark · pre-emit critique: P5 H5 E5 S4 R5 V5 */
/* Hallmark · macrostructure: Centered Card · tone: calm-focused · anchor hue: orange */
import { toast } from 'react-toastify';
import { api } from '../utils/auth';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Loader2, MailCheck } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export function ForgetPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const idToast = toast.loading('Sending reset link...');
    try {
      const response = await api.post('/api/auth/forgot-password', { email });
      toast.update(idToast, {
        render: response.data.message,
        type: 'success',
        isLoading: false,
        autoClose: 3000,
      });
      setSubmitted(true);
    } catch (error: unknown) {
      toast.update(idToast, {
        render: (error as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'An error occurred while requesting a password reset.',
        type: 'error',
        isLoading: false,
        autoClose: 3000,
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 sm:p-6 font-sans selection:bg-accent/20 selection:text-accent">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm">
        {/* Header Logo */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-border/60">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/trackly-icon.webp" alt="Trackly Logo" className="h-7 w-7 rounded-lg" />
            <span className="font-bold text-sm text-foreground tracking-tight">Trackly</span>
          </Link>
          <span className="font-mono text-[11px] text-muted">Password Recovery</span>
        </div>

        {submitted ? (
          <div className="text-center py-4">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-surface text-accent">
              <MailCheck size={20} />
            </div>
            <h1 className="text-xl font-bold text-foreground mb-2">Check your email</h1>
            <p className="text-sm text-muted leading-relaxed mb-6">
              If <span className="text-foreground font-semibold">{email}</span> is registered, we sent a password reset link valid for 15 minutes.
            </p>
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="text-xs text-accent hover:underline font-semibold cursor-pointer"
            >
              Need to try another email? Resend
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Forgot password?</h1>
              <p className="mt-1.5 text-sm text-muted">Enter your registered email address to receive a secure password reset link.</p>
            </div>

            <form id="form-forgot-password" onSubmit={handleSubmit} className="space-y-4">
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
                autoFocus
              />

              <Button disabled={loading} id="btn-forgot-submit" type="submit" variant="primary" size="md" className="w-full">
                {loading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Sending reset link...</span>
                  </>
                ) : (
                  'Send reset link'
                )}
              </Button>
            </form>
          </>
        )}

        <div className="mt-8 pt-6 border-t border-border/60 text-center">
          <Link to="/login" className="inline-flex items-center justify-center gap-1.5 text-xs text-muted hover:text-foreground font-medium transition">
            <ArrowLeft size={13} />
            <span>Return to Sign in</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
