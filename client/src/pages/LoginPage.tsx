/* Hallmark · pre-emit critique: P5 H5 E5 S4 R5 V5 */
/* Hallmark · macrostructure: Split Studio · tone: calm-focused · anchor hue: orange */
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { toast } from 'react-toastify';
import { api, setAuthToken, saveUser } from '../utils/auth';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useData } from '../store/dataStore';
import { Loader2, ArrowLeft, Activity, BarChart3, Mail } from 'lucide-react';
import { trackEvent } from '../utils/analytics';
import { ToastHost } from '../components/layout/ToastHost';

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

// Safely extracts the server's error message from an Axios error.
function getErrorMessage(error: unknown, fallback: string) {
  return (error as { response?: { data?: { message?: string } } }).response?.data?.message || fallback;
}

export function LoginPage() {
  const navigate = useNavigate();
  const { refreshAll } = useData();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const googleErrorHandled = useRef(false);

  // The backend redirects here with ?error=google when OAuth is cancelled or
  // fails. Show it once, then remove the parameter so a refresh stays clean.
  useEffect(() => {
    if (googleErrorHandled.current || searchParams.get('error') !== 'google') return;

    googleErrorHandled.current = true;
    toast.error('Google sign-in was cancelled or failed. Please try again.');

    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('error');
    setSearchParams(nextParams, { replace: true });
  }, [searchParams, setSearchParams]);

  /**
   * OTP step 1: ask the server to email a short-lived code.
   * The server intentionally returns the same message for every valid email,
   * so this page never learns whether an account already exists.
   */
  const requestCode = async () => {
    if (loading) return;

    if (!email.trim()) {
      toast.error('Enter your email address first.');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Sending a login code...');

    try {
      const response = await api.post('/api/auth/request-code', {
        email: email.trim(),
      });

      toast.update(toastId, {
        render: response.data.message,
        type: 'success',
        isLoading: false,
        autoClose: 4000,
      });

      setStep('code');
      setCode('');
    } catch (error) {
      toast.update(toastId, {
        render: getErrorMessage(error, 'Could not send the login code.'),
        type: 'error',
        isLoading: false,
        autoClose: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  /** OTP step 2: exchange the emailed code for the app JWT. */
  const handleVerifyCode = async (event: FormEvent) => {
    event.preventDefault();

    if (code.length !== 6) {
      toast.error('Enter the 6-digit code from your email.');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Verifying your code...');

    try {
      const response = await api.post('/api/auth/verify-code', {
        email: email.trim(),
        code,
      });

      setAuthToken(response.data.token);
      saveUser(response.data.user);

      // Data can also load on the dashboard; a failed prefetch must not block
      // a successful login.
      await refreshAll().catch(() => {});

      trackEvent(response.data.isNewUser ? 'sign_up' : 'login', {
        method: 'email_otp',
      });

      toast.update(toastId, {
        render: response.data.message,
        type: 'success',
        isLoading: false,
        autoClose: 2000,
      });

      navigate('/dashboard', { replace: true });
    } catch (error) {
      toast.update(toastId, {
        render: getErrorMessage(error, 'That code is invalid or has expired.'),
        type: 'error',
        isLoading: false,
        autoClose: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestCode = (event: FormEvent) => {
    event.preventDefault();
    void requestCode();
  };

  const handleGoogleLogin = () => {
    setGoogleLoading(true);
    const apiBaseUrl = import.meta.env.VITE_API_URL;
    window.location.assign(`${apiBaseUrl}/api/auth/google`);
  };

  const handleChangeEmail = () => {
    setStep('email');
    setCode('');
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col lg:flex-row font-sans selection:bg-accent/20 selection:text-accent">
      <ToastHost />
      {/* Left Feature & Identity Panel (Desktop) */}
      <div className="hidden lg:flex w-105 xl:w-120 bg-card border-r border-border flex-col justify-between p-10 shrink-0">
        <div>
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <img src="/trackly-icon.webp" alt="Trackly Icon" className="h-8 w-8 rounded-lg" />
            <span className="font-bold text-base tracking-tight text-foreground group-hover:text-accent transition">Trackly</span>
          </Link>

          <div className="mt-16 space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-surface text-xs font-mono font-medium text-muted">
              <span>PASSWORDLESS ACCESS</span>
            </div>

            <h2 className="text-3xl font-bold tracking-tight text-foreground leading-snug">Daily routines, recorded without friction.</h2>

            <p className="text-sm text-muted leading-relaxed">Sign in with a one-time code sent to your email, or continue with Google. No password to remember.</p>

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
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{step === 'email' ? 'Sign in or create account' : 'Check your email'}</h1>
            <p className="mt-1.5 text-sm text-muted">{step === 'email' ? 'Use a one-time email code or continue with Google. No password needed.' : `We sent a 6-digit code to ${email}. It expires in 10 minutes.`}</p>
          </div>

          <form id={step === 'email' ? 'form-request-code' : 'form-verify-code'} onSubmit={step === 'email' ? handleRequestCode : handleVerifyCode} className="space-y-4">
            {step === 'email' ? (
              <Input id="input-email" label="Email address" type="email" disabled={loading} placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" />
            ) : (
              <>
                {/* Keep the chosen email visible, with a quick way to correct it. */}
                <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface px-3.5 py-2.5">
                  <div className="flex min-w-0 items-center gap-2">
                    <Mail className="h-4 w-4 shrink-0 text-muted" />
                    <span className="truncate text-sm text-foreground">{email}</span>
                  </div>
                  <button type="button" onClick={handleChangeEmail} className="shrink-0 text-xs font-medium text-accent hover:underline focus-visible:ring-2 focus-visible:ring-border rounded">
                    Change
                  </button>
                </div>

                <Input
                  id="input-code"
                  label="6-digit code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  autoComplete="one-time-code"
                  autoFocus
                  disabled={loading}
                  placeholder="000000"
                  value={code}
                  onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="text-center font-mono text-lg tracking-[0.35em]"
                  required
                />
              </>
            )}

            <Button disabled={loading} id={step === 'email' ? 'btn-request-code' : 'btn-verify-code'} type="submit" variant="primary" size="md" className="w-full mt-2">
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>{step === 'email' ? 'Sending code...' : 'Verifying...'}</span>
                </>
              ) : step === 'email' ? (
                'Email me a login code'
              ) : (
                'Verify code'
              )}
            </Button>

            {step === 'code' && (
              <div className="space-y-1 pt-1 text-xs text-muted">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span>Didn't get it? Check spam, then</span>
                  <button type="button" onClick={() => void requestCode()} disabled={loading} className="font-medium text-accent hover:underline disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-border rounded">
                    resend the code
                  </button>
                </div>
                <p className="text-[11px] text-muted/80">Codes can be resent once per minute.</p>
              </div>
            )}
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
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-2.5 h-10 rounded-xl border border-border bg-card text-sm font-medium text-foreground hover:bg-surface active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer focus-visible:ring-2 focus-visible:ring-border"
          >
            <GoogleIcon />
            <span>{googleLoading ? 'Connecting...' : 'Continue with Google'}</span>
          </button>

          <p className="text-xs text-muted text-center mt-6">{step === 'email' ? 'New here? Just enter your email — we will create your account automatically.' : 'No password to remember. Your email is your account.'}</p>
        </div>

        <div className="hidden lg:block text-center text-xs text-muted py-4">Protected by Trackly Auth · Passwordless</div>
      </div>
    </div>
  );
}
