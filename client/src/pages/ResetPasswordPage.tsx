/* Hallmark · pre-emit critique: P5 H5 E5 S4 R5 V5 */
/* Hallmark · macrostructure: Centered Card · tone: calm-focused · anchor hue: orange */
import { api } from '../utils/auth';
import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ArrowLeft, Eye, EyeOff, CheckCircle2, Loader2 } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const passwordsMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error('Reset token is missing or invalid.');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setLoading(true);
    const idToast = toast.loading('Saving new password...');
    try {
      const response = await api.post('/api/auth/reset-password', {
        token,
        newPassword,
      });

      toast.update(idToast, {
        render: response.data.message,
        type: 'success',
        isLoading: false,
        autoClose: 2000,
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 1800);
    } catch (error: unknown) {
      toast.update(idToast, {
        render: (error as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'An error occurred while resetting password.',
        type: 'error',
        isLoading: false,
        autoClose: 2500,
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
          <span className="font-mono text-[11px] text-muted">Set New Password</span>
        </div>

        {success ? (
          <div className="text-center py-4">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-surface text-accent">
              <CheckCircle2 size={22} />
            </div>
            <h1 className="text-xl font-bold text-foreground mb-2">Password successfully updated</h1>
            <p className="text-sm text-muted leading-relaxed">Redirecting you to the sign-in page...</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Create new password</h1>
              <p className="mt-1.5 text-sm text-muted">Ensure your new password contains at least 8 characters.</p>
            </div>

            <form id="form-reset-password" onSubmit={handleResetPassword} className="space-y-4">
              <div className="relative">
                <Input
                  id="input-new-password"
                  label="New password"
                  type={showPassword ? 'text' : 'password'}
                  disabled={loading}
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-8.5 text-muted hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              <div>
                <Input
                  id="input-confirm-password"
                  label="Confirm password"
                  type={showPassword ? 'text' : 'password'}
                  disabled={loading}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
                {passwordsMismatch && <p className="text-xs text-red-500 mt-1">Passwords do not match.</p>}
              </div>

              <Button disabled={loading} id="btn-reset-submit" type="submit" variant="primary" size="md" className="w-full mt-2">
                {loading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Saving password...</span>
                  </>
                ) : (
                  'Reset password'
                )}
              </Button>
            </form>
          </>
        )}

        {!success && (
          <div className="mt-8 pt-6 border-t border-border/60 text-center">
            <Link to="/login" className="inline-flex items-center justify-center gap-1.5 text-xs text-muted hover:text-foreground font-medium transition">
              <ArrowLeft size={13} />
              <span>Return to Sign in</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
