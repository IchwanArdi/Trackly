import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Activity, ArrowRight } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-7 h-7 bg-accent rounded-md flex items-center justify-center">
            <Activity size={14} className="text-white" />
          </div>
          <span className="font-semibold text-sm text-foreground">Trackly</span>
        </div>

        <h1 className="text-xl font-semibold text-foreground mb-1">Create an account</h1>
        <p className="text-sm text-muted mb-7">Start building your activity history.</p>

        <form id="form-register" onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="input-name"
            label="Full name"
            type="text"
            placeholder="Alex Kim"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
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
            placeholder="Min. 8 characters"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={8}
          />

          <p className="text-[11px] text-muted leading-relaxed">
            By creating an account, you agree to our{' '}
            <span className="text-accent cursor-pointer hover:underline">Terms of Service</span> and{' '}
            <span className="text-accent cursor-pointer hover:underline">Privacy Policy</span>.
          </p>

          <Button
            id="btn-register-submit"
            type="submit"
            variant="primary"
            size="md"
            className="w-full"
            icon={<ArrowRight size={14} />}
          >
            Create account
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
  );
}
