import { useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../utils/auth';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export function RegisterPage() {
  // 1. State untuk menyimpan input user
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // 2. Fungsi handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const idToast = toast.loading('Loading...');
    try {
      // 3. Kirim data ke backend via Axios
      const response = await api.post('/api/auth/register', {
        name,
        email,
        password,
      });
      // 4. Notifikasi sukses + redirect
      toast.update(idToast, {
        render: `${response.data.message}`,
        type: 'success',
        isLoading: false,
        autoClose: 2000,
      });
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (error: any) {
      toast.update(idToast, {
        render: `${error.response.data.message}`,
        type: 'error',
        isLoading: false,
        autoClose: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-80 xl:w-96 bg-card border-r border-border flex-col justify-between p-10 shrink-0">
        <Link to='/' >
          <div className="flex items-center gap-2.5 cursor-pointer">
            <div className="w-8 h-8 bg-accent rounded-md flex items-center justify-center">
              <img src="/trackly-icon.webp" alt="Trackly Icon" />
            </div>
            <span className="font-semibold text-sm tracking-tight text-foreground">Trackly</span>
          </div>
        </Link>

        <div className="flex flex-col justify-center h-full gap-2">
          <blockquote className="text-sm text-muted leading-relaxed">"A journey of a thousand miles begins with a single step."</blockquote>
          <div className="mt-4">
            <p className="text-sm font-medium text-foreground">Laozi</p>
            <p className="text-xs text-muted">Filosofi</p>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <Link to='/' className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-accent rounded-md flex items-center justify-center">
              <img src="/trackly-icon.webp" alt="Trackly Icon" />
            </div>
            <span className="font-semibold text-sm text-foreground">Trackly</span>
          </Link>

          <h1 className="text-xl font-semibold text-foreground mb-1">Create an account</h1>
          <p className="text-sm text-muted mb-7">Start building your activity history.</p>

          <form id="form-register" onSubmit={handleSubmit} className="space-y-4">
            <Input id="input-name" label="Full name" type="text" placeholder="Alex Kim" value={name} onChange={(e) => setName(e.target.value)} required />
            <Input id="input-email" label="Email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
            <Input id="input-password" label="Password" type="password" placeholder="Min. 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />

            <p className="text-[11px] text-muted leading-relaxed">
              By creating an account, you agree to our{' '}
              <Link to="/terms-of-service" className="text-accent hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy-policy" className="text-accent hover:underline">
                Privacy Policy
              </Link>
              .
            </p>

            <Button id="btn-register-submit" type="submit" variant="primary" size="md" className="w-full" disabled={loading}>
              {loading ? 'Loading...' : 'Create account'}
            </Button>
          </form>

          <p className="text-xs text-muted text-center mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-accent hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
