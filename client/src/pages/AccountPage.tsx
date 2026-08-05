import { useState } from 'react';
import { Clock3, KeyRound, Mail, ShieldCheck, User, X, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { getUser, api } from '../utils/auth';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

interface AccountPageProps {
  onClose: () => void;
}

type AccountTab = 'account' | 'security';

const navItems: { key: AccountTab; label: string }[] = [
  { key: 'account', label: 'Account' },
  { key: 'security', label: 'Keamanan' },
];

export const AccountPage = ({ onClose }: AccountPageProps) => {
  const [activeTab, setActiveTab] = useState<AccountTab>('account');
  const user = getUser();
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Func delete account
  const handleDeleteAccount = async () => {
    if (!user?.id) return;

    setIsDeleting(true); // Tambahkan ini
    try {
      await api.delete(`/api/users/${user.id}`);
      toast.success('Account deleted successfully');
      onClose();
      navigate('/login');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account');
    }
    {
      setIsDeleting(false); // Tambahkan ini
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Akun</h2>
          <p className="mt-1 text-sm text-muted-foreground">Kelola informasi akun dan preferensi Anda dengan lebih nyaman.</p>
        </div>

        <button type="button" onClick={onClose} className="rounded-full p-2 text-muted-foreground transition hover:bg-surface hover:text-foreground" aria-label="Tutup akun">
          <X size={18} />
        </button>
      </div>

      <div className="mt-6 flex flex-col gap-4 md:flex-row">
        <aside className="flex w-full flex-col gap-2 rounded-xl border border-border bg-card p-2 md:w-36">
          {navItems.map(({ key, label }) => {
            const isActive = activeTab === key;

            return (
              <button key={key} type="button" onClick={() => setActiveTab(key)} className={`rounded-lg px-3 py-2 text-left text-sm font-medium transition ${isActive ? 'bg-accent/10 text-accent' : 'text-foreground hover:bg-surface'}`}>
                {label}
              </button>
            );
          })}
        </aside>

        <div className="flex-1">
          {activeTab === 'account' ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-surface/70 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-background text-sm font-semibold text-foreground">{user?.name ? user.name.substring(0, 2).toUpperCase() : 'US'}</div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground">{user?.name ?? 'User'}</h3>
                    <p className="text-sm text-muted-foreground">{user?.email ?? 'user@example.com'}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-surface/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Informasi akun</p>
                <div className="mt-3 space-y-3 text-sm">
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User size={15} />
                      <span>Nama lengkap</span>
                    </div>
                    <span className="font-medium text-foreground">{user?.name ?? 'N/A'}</span>
                  </div>

                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail size={15} />
                      <span>Email</span>
                    </div>
                    <span className="max-w-[180px] truncate font-medium text-foreground">{user?.email ?? 'N/A'}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <ShieldCheck size={15} />
                      <span>Status akun</span>
                    </div>
                    <span className="rounded-full border border-green-500/20 bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-500">Aktif</span>
                  </div>
                </div>
              </div>

              {/* REDESAIN SECTION: Danger Zone (Hapus Akun) */}
              <div className="rounded-xl border border-border bg-surface/70 p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 text-red-500 mt-0.5">
                    <AlertTriangle size={16} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-red-500">Hapus Akun</h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Tindakan ini bersifat permanen. Seluruh data Anda, profil, dan pengaturan aplikasi akan dihapus total dan tidak dapat dikembalikan.</p>

                    {!showConfirm ? (
                      <button
                        type="button"
                        onClick={() => setShowConfirm(true)}
                        className="mt-3 flex items-center gap-2 rounded-lg border border-red-500/20 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-500 hover:text-white transition duration-150 cursor-pointer"
                      >
                        <Trash2 size={13} />
                        Hapus Akun Saya
                      </button>
                    ) : (
                      <div className="mt-3 rounded-lg border border-border bg-card p-3 space-y-3">
                        <p className="text-xs font-medium text-foreground">
                          Ketik <span className="font-mono bg-surface px-1 py-0.5 rounded border border-red-500/30 text-red-500 font-bold select-none">hapus akun permanen</span> untuk konfirmasi:
                        </p>

                        <input
                          type="text"
                          placeholder="Masukkan teks konfirmasi"
                          value={confirmText}
                          onChange={(e) => setConfirmText(e.target.value)}
                          disabled={isDeleting}
                          className="w-full rounded-lg bg-surface px-3 py-1.5 text-xs text-foreground focus:outline-none disabled:opacity-50"
                        />

                        <div className="flex items-center gap-2 justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              setShowConfirm(false);
                              setConfirmText('');
                            }}
                            disabled={isDeleting}
                            className="rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-foreground hover:bg-surface disabled:opacity-50 transition cursor-pointer"
                          >
                            Batal
                          </button>
                          <button
                            type="button"
                            onClick={handleDeleteAccount}
                            disabled={confirmText !== 'hapus akun permanen' || isDeleting}
                            className="flex items-center gap-1.5 rounded-lg bg-red-500 px-2.5 py-1 text-xs font-medium text-white hover:bg-red-600 disabled:text-red-500/40 disabled:cursor-not-allowed transition cursor-pointer"
                          >
                            {isDeleting ? (
                              <>
                                <Loader2 size={12} className="animate-spin" />
                                Menghapus...
                              </>
                            ) : (
                              'Ya, Hapus'
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-surface/70 p-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={18} className="text-accent" />
                  <h3 className="text-base font-semibold text-foreground">Keamanan akun</h3>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">Akun Anda sudah terlindungi dengan sesi masuk yang aman dan data pengguna yang tersimpan secara lokal di browser.</p>
              </div>

              <div className="rounded-xl border border-border bg-surface/70 p-4">
                <div className="space-y-3 text-sm text-foreground">
                  <div className="flex items-start gap-2">
                    <KeyRound size={16} className="mt-0.5 text-accent" />
                    <span>Pastikan password Anda kuat dan jangan bagikan kode login ke siapa pun.</span>
                  </div>

                  <div className="flex items-start gap-2">
                    <Clock3 size={16} className="mt-0.5 text-accent" />
                    <span>Logout dari perangkat lain jika Anda merasa ada aktivitas yang mencurigakan.</span>
                  </div>

                  <div className="flex items-start gap-2">
                    <ShieldCheck size={16} className="mt-0.5 text-accent" />
                    <span>Gunakan koneksi internet yang aman saat mengakses akun Anda.</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
