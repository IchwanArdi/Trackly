import { api } from '../utils/auth';
import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ArrowLeft, ArrowRight, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
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
      // 3. PERBAIKAN PRO: URL menjadi statis, token aman dikirim lewat body JSON
      const response = await api.post('/api/auth/reset-password', {
        token,
        newPassword
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
        render: (error as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'An error occurred while resetting password. Please try again.',
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
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8 justify-left">
          <div className="w-8 h-8 rounded-md flex items-center justify-center">
            <img src="/icon-512.png" alt="icon" />
          </div>
          <span className="font-semibold text-sm text-foreground">Trackly</span>
        </div>

        {success ? (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card">
              <CheckCircle2 size={18} className="text-accent" />
            </div>
            <h1 className="text-lg font-semibold text-foreground mb-1.5">Password successfully changed</h1>
            <p className="text-sm text-muted leading-relaxed">Redirecting you to the login page...</p>
          </div>
        ) : (
          <>
            <h1 className="text-xl font-semibold text-foreground mb-1">Create new password</h1>
            <p className="text-sm text-muted mb-7">Your new password must be different from previous passwords.</p>

            <form id="form-reset-password" onSubmit={handleResetPassword} className="space-y-4">
              <div className="relative">
                <Input
                  id="input-new-password"
                  label="New password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  autoFocus
                />
                <button type="button" onClick={() => setShowPassword((prev) => !prev)} className="absolute right-3 top-8.5 text-muted hover:text-foreground transition-colors" tabIndex={-1}>
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              <Input
                id="input-confirm-password"
                label="Confirm password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
              />
              {passwordsMismatch && <p className="text-xs text-red-500 -mt-2">Passwords do not match.</p>}

              <p className="text-xs text-muted">At least 8 characters.</p>

              <Button id="btn-reset-submit" type="submit" variant="primary" size="md" className="w-full" icon={<ArrowRight size={14} />}>
                {loading ? 'Saving...' : 'Reset password'}
              </Button>
            </form>
          </>
        )}

        {!success && (
          <Link to="/login" className="mt-6 flex items-center justify-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors">
            <ArrowLeft size={13} />
            Back to login page
          </Link>
        )}
      </div>
    </div>
  );
};
