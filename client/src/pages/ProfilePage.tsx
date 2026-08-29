import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, MessageSquare, HelpCircle, X, ChevronRight, AlertTriangle, Bell, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { clearAuthToken } from '../utils/auth';
import { useData } from '../store/dataStore';
import { isPushSubscribed, subscribeToPush, unsubscribeFromPush } from '../utils/push';
import UserInfoDisplay from '../components/shared/UserInfoDisplay';
import FeedbackForm from '../components/shared/FeedbackForm';
import DeleteAccountSection from '../components/shared/DeleteAccountFlow';

export function ProfilePage() {
  const navigate = useNavigate();
  const { clearData } = useData();
  const [openFeedbackModal, setOpenFeedbackModal] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);

  useEffect(() => {
    isPushSubscribed().then(setPushEnabled);
  }, []);

  const handleTogglePush = async () => {
    setPushLoading(true);
    try {
      if (pushEnabled) {
        await unsubscribeFromPush();
        setPushEnabled(false);
        toast.success('Notifikasi reminder dimatikan');
      } else {
        const result = await subscribeToPush();
        if (result.ok) {
          setPushEnabled(true);
          toast.success('Notifikasi reminder diaktifkan');
        } else {
          toast.error(result.reason || 'Gagal mengaktifkan notifikasi');
        }
      }
    } catch {
      toast.error('Terjadi kesalahan saat mengubah pengaturan notifikasi');
    } finally {
      setPushLoading(false);
    }
  };

  useEffect(() => {
    if (openFeedbackModal) {
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    } else {
      document.body.style.overflow = 'unset'; // Restore scrolling
    }
    return () => {
      document.body.style.overflow = 'unset'; // Restore scrolling on unmount
    };
  }, [openFeedbackModal]);

  const handleLogout = () => {
    clearData();
    clearAuthToken();
    navigate('/login');
  };

  return (
    <div className="space-y-6 pb-4 max-w-md mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold text-foreground">Profile</h1>
        <p className="text-xs text-muted mt-0.5">Account & Settings</p>
      </div>

      {/* User Card */}
      <UserInfoDisplay />

      {/* Notifications — toggle reminder harian via push notification */}
      <div>
        <p className="text-xs font-medium text-muted px-1 mb-2">Notifications</p>
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <button
            id="btn-toggle-push"
            onClick={handleTogglePush}
            disabled={pushLoading}
            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-surface transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Bell size={15} className="text-muted shrink-0" />
            <span className="flex-1 text-sm text-foreground">Daily Reminder</span>
            {pushLoading ? (
              <Loader2 size={16} className="animate-spin text-muted shrink-0" />
            ) : (
              <div className={`w-9 h-5 rounded-full transition-colors shrink-0 relative ${pushEnabled ? 'bg-accent' : 'bg-surface border border-border'}`}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${pushEnabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </div>
            )}
          </button>
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

      {/* Feedback Modal */}
      {openFeedbackModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="relative bg-background border border-border rounded-xl p-6 max-w-md w-full">
            <button onClick={() => setOpenFeedbackModal(false)} className="absolute top-4 right-5 rounded-full text-muted hover:text-foreground transition-colors">
              <X size={16} />
            </button>
            <h3 className="text-lg font-semibold text-foreground mb-1">Provide Feedback</h3>
            <p className="text-sm text-muted mb-4">We value your feedback! Please fill out the form below.</p>
            <FeedbackForm onSuccess={() => setOpenFeedbackModal(false)} />
          </div>
        </div>
      )}

      {/* Delete Account confirmation modal — mencegah penghapusan tidak sengaja */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2 border-b border-border pb-2">
          <AlertTriangle size={16} className="text-red-500 shrink-0" />
          <h3 className="text-sm font-semibold text-red-500">Delete Account</h3>
        </div>
        <DeleteAccountSection onDeleted={() => navigate('/')} variant="inline" />
      </div>

    </div>
  );
}