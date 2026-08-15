import { useState } from 'react';
import { Clock3, KeyRound, Mail, ShieldCheck, User, X, Trash2, Loader2, AlertTriangle, MessageSquare } from 'lucide-react';
import { api, getUser } from '../utils/auth';
import { useData } from '../store/dataStore';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

interface AccountPageProps {
  onClose: () => void;
}

type AccountTab = 'account' | 'security' | 'feedback';

const navItems: { key: AccountTab; label: string }[] = [
  { key: 'account', label: 'Account' },
  { key: 'security', label: 'Security' },
  { key: 'feedback', label: 'Feedback' },
];

export const AccountPage = ({ onClose }: AccountPageProps) => {
  const [activeTab, setActiveTab] = useState<AccountTab>('account');
  const user = getUser();
  const { deleteUser } = useData();
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedbackCategory, setFeedbackCategory] = useState<string>('');
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Func untuk submit feedback
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
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Func delete account
  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteUser();

      if (!localStorage.getItem('token')) {
        onClose();
        navigate('/');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
    } finally {
      setIsDeleting(false);
    }
  };


  return (
    <div className="w-full">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Account</h2>
          <p className="mt-1 text-sm text-muted-foreground">Manage your account information and preferences with ease.</p>
        </div>

        <button type="button" onClick={onClose} className="rounded-full p-2 text-muted-foreground transition hover:bg-surface hover:text-foreground" aria-label="Close account">
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
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Account Information</p>
                <div className="mt-3 space-y-3 text-sm">
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User size={15} />
                      <span>Full Name</span>
                    </div>
                    <span className="font-medium text-foreground">{user?.name ?? 'N/A'}</span>
                  </div>

                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail size={15} />
                      <span>Email</span>
                    </div>
                    <span className="max-w-45 truncate font-medium text-foreground">{user?.email ?? 'N/A'}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <ShieldCheck size={15} />
                      <span>Account Status</span>
                    </div>
                    <span className="rounded-full border border-green-500/20 bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-500">Active</span>
                  </div>
                </div>
              </div>

              {/* Danger Zone (Delete Account) */}
              <div className="rounded-xl border border-border bg-surface/70 p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 text-red-500 mt-0.5">
                    <AlertTriangle size={16} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-red-500">Delete Account</h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">This action is permanent. All your data, profile, and application settings will be completely deleted and cannot be recovered.</p>

                    {!showConfirm ? (
                      <button
                        type="button"
                        onClick={() => setShowConfirm(true)}
                        className="mt-3 flex items-center gap-2 rounded-lg border border-red-500/20 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-500 hover:text-white transition duration-150 cursor-pointer"
                      >
                        <Trash2 size={13} />
                        Delete My Account
                      </button>
                    ) : (
                      <div className="mt-3 rounded-lg border border-border bg-card p-3 space-y-3">
                        <p className="text-xs font-medium text-foreground">
                          Type <span className="font-mono bg-surface px-1 py-0.5 rounded border border-red-500/30 text-red-500 font-bold select-none">delete permanent account</span> to confirm:
                        </p>

                        <input
                          type="text"
                          placeholder="Enter confirmation text"
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
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleDeleteAccount}
                            disabled={confirmText !== 'delete permanent account' || isDeleting}
                            className="flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500 px-2.5 py-1 text-xs font-medium text-white transition hover:bg-red-500/60 disabled:border-border disabled:bg-transparent disabled:text-muted disabled:cursor-not-allowed disabled:hover:bg-transparent cursor-pointer"
                          >
                            {isDeleting ? (
                              <>
                                <Loader2 size={12} className="animate-spin" />
                                Deleting...
                              </>
                            ) : (
                              'Yes, Delete'
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'security' ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-surface/70 p-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={18} className="text-accent" />
                  <h3 className="text-base font-semibold text-foreground">Account Security</h3>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">Your account is protected with a secure login session and user data stored locally in your browser.</p>
              </div>

              <div className="rounded-xl border border-border bg-surface/70 p-4">
                <div className="space-y-3 text-sm text-foreground">
                  <div className="flex items-start gap-2">
                    <KeyRound size={16} className="mt-0.5 text-accent" />
                    <span>Ensure your password is strong and do not share login credentials with anyone.</span>
                  </div>

                  <div className="flex items-start gap-2">
                    <Clock3 size={16} className="mt-0.5 text-accent" />
                    <span>Log out from other devices if you notice any suspicious activity.</span>
                  </div>

                  <div className="flex items-start gap-2">
                    <ShieldCheck size={16} className="mt-0.5 text-accent" />
                    <span>Use a secure internet connection when accessing your account.</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-surface/70 p-4">
                <div className="flex items-center gap-2">
                  <MessageSquare size={18} className="text-accent" />
                  <h3 className="text-base font-semibold text-foreground">Feedback</h3>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">Provide your feedback to help us improve our services.</p>

                <div className="mt-3 flex items-start gap-2 rounded-lg border border-border bg-surface px-3 py-2.5">
                  <ShieldCheck size={14} className="mt-0.5 text-accent shrink-0" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    This feedback is <span className="font-bold text-foreground">anonymous</span>, we cannot identify the sender, so please feel free to share honestly and openly.
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-surface/70 p-4">
                <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="feedback-category" className="text-xs font-medium text-muted-foreground">
                      Category
                    </label>
                    <select
                      id="feedback-category"
                      value={feedbackCategory}
                      onChange={(e) => setFeedbackCategory(e.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent"
                    >
                      <option value="">Select category</option>
                      <option value="bug">Bug Report</option>
                      <option value="feature">Feature Suggestion</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="feedback-message" className="text-xs font-medium text-muted-foreground">
                      Message
                    </label>
                    <textarea
                      id="feedback-message"
                      value={feedbackMessage}
                      onChange={(e) => setFeedbackMessage(e.target.value)}
                      rows={4}
                      placeholder="Write your feedback here..."
                      className="mt-1.5 w-full resize-none rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button disabled={isSubmitting} type="submit" className="rounded-lg bg-accent px-4 py-2 text-xs font-medium text-white hover:bg-accent/90 transition cursor-pointer flex items-center gap-2">
                      {isSubmitting ? (
                        <>
                          {' '}
                          <Loader2 size={14} className="animate-spin w-full" /> Processing...
                        </>
                      ) : (
                        'Submit Feedback'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
