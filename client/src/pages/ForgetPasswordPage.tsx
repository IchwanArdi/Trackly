import { toast } from 'react-toastify';
import { api } from '../utils/auth';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export function ForgetPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleForgetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const idToast = toast.loading('Mengirim...');
    try {
      const response = await api.post('/api/reset-password/forgot-password', { email });
      toast.update(idToast, {
        render: response.data.message,
        type: 'success',
        isLoading: false,
        autoClose: 2000,
      });
      setSent(true);
    } catch (error) {
      toast.update(idToast, {
        render: (error as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Terjadi kesalahan saat mengirim permintaan reset password. Silakan coba lagi.',
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
        {sent ? (
          // Success state — lebih meyakinkan daripada cuma toast yang hilang beberapa detik
          <div className="text-center">
            <h1 className="text-lg font-semibold text-foreground mb-1.5">Cek email kamu</h1>
            <p className="text-sm text-muted leading-relaxed">
              Kalau <span className="text-foreground font-medium">{email}</span> terdaftar, kami sudah mengirim link untuk reset password. Link berlaku selama 1 jam.
            </p>
            <button onClick={() => setSent(false)} className="mt-6 text-xs text-muted hover:text-foreground transition-colors underline">
              Salah alamat email? Kirim ulang
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

            <h1 className="text-xl font-semibold text-foreground mb-1">Lupa password?</h1>
            <p className="text-sm text-muted mb-7">Masukkan email kamu, kami akan kirim link untuk reset password.</p>

            <form id="form-forgot-password" onSubmit={handleForgetPassword} className="space-y-4">
              <Input id="input-email" label="Email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" autoFocus />

              <Button id="btn-forgot-submit" type="submit" variant="primary" size="md" className="w-full" icon={<ArrowRight size={14} />}>
                {loading ? 'Mengirim...' : 'Kirim link reset'}
              </Button>
            </form>
          </>
        )}

        <Link to="/login" className="mt-6 flex items-center justify-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors">
          <ArrowLeft size={13} />
          Kembali ke halaman login
        </Link>
      </div>
    </div>
  );
}
