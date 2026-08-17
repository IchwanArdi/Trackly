import { toast } from 'react-toastify';
import { api } from '../utils/auth';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, MailCheck } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export function ForgetPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const idToast = toast.loading('Sending...');
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
        render: (error as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'An error occurred while requesting a password reset. Please try again.',
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
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {submitted ? (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card">
              <MailCheck size={18} className="text-accent" />
            </div>
            <h1 className="text-lg font-semibold text-foreground mb-1.5">Check your email</h1>
            <p className="text-sm text-muted leading-relaxed mb-6">
              If <span className="text-foreground font-medium">{email}</span> is registered, we have sent a link to reset your password. The link is valid for 15 minutes.
            </p>
            <button type="button" onClick={() => setSubmitted(false)} className="text-xs text-accent hover:underline cursor-pointer">
              Wrong email address? Resend
            </button>
          </div>
        ) : (
          <>
            {/* Logo */}
            <div className="flex items-center gap-2 mb-8 justify-left">
              <div className="w-8 h-8 rounded-md flex items-center justify-center">
                <img src="/trackly-icon.webp" alt="icon" />
              </div>
              <span className="font-semibold text-sm text-foreground">Trackly</span>
            </div>

            <h1 className="text-xl font-semibold text-foreground mb-1">Forgot password?</h1>
            <p className="text-sm text-muted mb-7">Enter your email address and we will send you a link to reset your password.</p>

            <form id="form-forgot-password" onSubmit={handleSubmit} className="space-y-4">
              <Input id="input-email" label="Email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" autoFocus />

              <Button id="btn-forgot-submit" type="submit" variant="primary" size="md" className="w-full" disabled={loading} icon={<ArrowRight size={14} />}>
                {loading ? 'Sending...' : 'Send reset link'}
              </Button>
            </form>
          </>
        )}

        <Link to="/login" className="mt-6 flex items-center justify-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors">
          <ArrowLeft size={13} />
          Back to login page
        </Link>
      </div>
    </div>
  );
}
