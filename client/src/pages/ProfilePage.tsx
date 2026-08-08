import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { LogOut, User, Mail, ShieldCheck, Trash2, Loader2, MessageSquare, HelpCircle, X, ChevronRight, AlertTriangle } from 'lucide-react';
import { clearAuthToken, getUser, api } from '../utils/auth';
import { useData } from '../store/dataStore';

export function ProfilePage() {
  const navigate = useNavigate();
  const { clearData } = useData();
  const user = getUser();
  const [isDeleting, setIsDeleting] = useState(false);
  const [openFeedbackModal, setOpenFeedbackModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [feedbackCategory, setFeedbackCategory] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await api.delete('/users/me');
      clearData();
      clearAuthToken();
      navigate('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Gagal menghapus akun. Silakan coba lagi.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackCategory || !feedbackMessage) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post('/api/users/feedback', {
        category: feedbackCategory,
        message: feedbackMessage,
      });

      toast.success(`${response.data.message}`);
      setFeedbackCategory('');
      setFeedbackMessage('');
      setOpenFeedbackModal(false);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    clearData();
    clearAuthToken();
    navigate('/login');
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="space-y-6 pb-4 max-w-md mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold text-foreground">Profile</h1>
        <p className="text-xs text-muted mt-0.5">Account & Settings</p>
      </div>

      {/* User Card — murni info, tanpa aksi destruktif di dalamnya */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-3.5 pb-4 border-b border-border/60">
          <div className="w-12 h-12 rounded-full bg-accent/15 border border-accent/20 flex items-center justify-center text-sm font-bold text-accent shrink-0">{getInitials(user?.name)}</div>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold text-foreground truncate">{user?.name ?? 'User'}</h2>
            <p className="text-xs text-muted truncate mt-0.5">{user?.email ?? 'user@example.com'}</p>
          </div>
        </div>

        <div className="pt-3 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5 text-muted">
              <User size={14} />
              <span>Name</span>
            </div>
            <span className="font-medium text-foreground">{user?.name ?? 'N/A'}</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5 text-muted">
              <Mail size={14} />
              <span>Email</span>
            </div>
            <span className="font-medium text-foreground truncate max-w-45">{user?.email ?? 'N/A'}</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5 text-muted">
              <ShieldCheck size={14} />
              <span>Status</span>
            </div>
            <span className="text-[11px] font-medium text-emerald-500">Active</span>
          </div>
        </div>
      </div>

      {/* Support — list group, konsisten dengan pattern "settings list" */}
      <div>
        <p className="text-xs font-medium text-muted px-1 mb-2">Support</p>
        <div className="bg-card border border-border rounded-xl overflow-hidden divide-y divide-border/60">
          <button onClick={() => navigate('/help')} className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-surface transition-colors cursor-pointer">
            <HelpCircle size={15} className="text-muted shrink-0" />
            <span className="flex-1 text-sm text-foreground">Help</span>
            <ChevronRight size={15} className="text-muted shrink-0" />
          </button>

          <button onClick={() => setOpenFeedbackModal(true)} className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-surface transition-colors cursor-pointer">
            <MessageSquare size={15} className="text-muted shrink-0" />
            <span className="flex-1 text-sm text-foreground">Provide Feedback</span>
            <ChevronRight size={15} className="text-muted shrink-0" />
          </button>
        </div>
      </div>

      {/* Sign out — netral, aksi biasa (bukan destruktif) */}
      <button
        id="btn-profile-logout"
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-semibold text-foreground bg-card border border-border hover:bg-surface transition-colors cursor-pointer"
      >
        <LogOut size={14} />
        Sign out
      </button>

      {/* delete account */}
      <div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted leading-relaxed mb-3">Menghapus akun akan menghilangkan seluruh data kamu secara permanen termasuk kategori dan riwayat aktivitas. Tindakan ini tidak bisa dibatalkan.</p>
          <button
            id="btn-profile-delete"
            onClick={() => setOpenDeleteModal(true)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors cursor-pointer"
          >
            <Trash2 size={14} />
            Delete Account
          </button>
        </div>
      </div>

      {/* Feedback Modal */}
      {openFeedbackModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="relative bg-background border border-border rounded-xl p-6 max-w-md w-full">
            <button onClick={() => setOpenFeedbackModal(false)} className="absolute top-4 right-5 rounded-full text-muted hover:text-foreground transition-colors">
              <X size={16} />
            </button>
            <h3 className="text-lg font-semibold text-foreground mb-1">Provide Feedback</h3>
            <p className="text-sm text-muted mb-4">We value your feedback! Please fill out the form below.</p>
            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
              <div>
                <label htmlFor="feedback-category" className="text-xs font-medium text-muted">
                  Kategori
                </label>
                <select
                  id="feedback-category"
                  value={feedbackCategory}
                  onChange={(e) => setFeedbackCategory(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent"
                >
                  <option value="">Pilih kategori</option>
                  <option value="bug">Laporan Bug</option>
                  <option value="feature">Saran Fitur</option>
                  <option value="other">Lainnya</option>
                </select>
              </div>

              <div>
                <label htmlFor="feedback-message" className="text-xs font-medium text-muted">
                  Pesan
                </label>
                <textarea
                  id="feedback-message"
                  value={feedbackMessage}
                  onChange={(e) => setFeedbackMessage(e.target.value)}
                  rows={4}
                  placeholder="Tulis feedback Anda di sini..."
                  className="mt-1.5 w-full resize-none rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent"
                />
              </div>

              <div className="flex justify-end">
                <button disabled={isSubmitting} type="submit" className="rounded-lg bg-accent px-4 py-2 text-xs font-medium text-white hover:bg-accent/90 transition cursor-pointer flex items-center gap-2 disabled:opacity-60">
                  {isSubmitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Processing...
                    </>
                  ) : (
                    'Kirim Feedback'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Account confirmation modal — mencegah penghapusan tidak sengaja */}
      {openDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="relative bg-background border border-border rounded-xl p-6 max-w-md w-full">
            <button
              onClick={() => {
                setOpenDeleteModal(false);
                setDeleteConfirmText('');
              }}
              className="absolute top-4 right-5 rounded-full text-muted hover:text-foreground transition-colors"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-2.5 mb-1">
              <AlertTriangle size={18} className="text-red-500" />
              <h3 className="text-lg font-semibold text-foreground">Hapus akun secara permanen?</h3>
            </div>
            <p className="text-sm text-muted mb-4 leading-relaxed">
              Tindakan ini tidak bisa dibatalkan. Ketik <span className="font-mono font-medium text-foreground">hapus akun permanen</span> untuk konfirmasi.
            </p>

            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="hapus akun permanen"
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:border-red-500"
            />

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => {
                  setOpenDeleteModal(false);
                  setDeleteConfirmText('');
                }}
                className="flex-1 rounded-lg border border-border py-2 text-xs font-medium text-foreground hover:bg-surface transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'hapus akun permanen' || isDeleting}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-red-500 py-2 text-xs font-medium text-white transition hover:bg-red-600 disabled:bg-transparent disabled:border disabled:border-border disabled:text-muted disabled:cursor-not-allowed disabled:hover:bg-transparent cursor-pointer"
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    Menghapus...
                  </>
                ) : (
                  'Hapus akun'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
