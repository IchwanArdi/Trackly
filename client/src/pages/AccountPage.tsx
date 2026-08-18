import { useState } from 'react';
import { Clock3, KeyRound, ShieldCheck, X, AlertTriangle, MessageSquare } from 'lucide-react';
import UserInfoDisplay from '../components/shared/UserInfoDisplay';
import FeedbackForm from '../components/shared/FeedbackForm';
import DeleteAccountSection from '../components/shared/DeleteAccountFlow';

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
            <div className="space-y-4 ">

              <UserInfoDisplay />


              {/* Danger Zone (Delete Account) */}
              <div className="rounded-xl border border-border p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 text-red-500 mt-0.5">
                    <AlertTriangle size={16} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-red-500 mb-1">Delete Account</h3>
                    <DeleteAccountSection onDeleted={onClose} variant="inline" />
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'security' ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-border p-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={18} className="text-accent" />
                  <h3 className="text-base font-semibold text-foreground">Account Security</h3>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">Your account is protected with a secure login session and user data stored locally in your browser.</p>
              </div>

              <div className="rounded-xl border border-border p-4">
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
              <div className="rounded-xl border border-border p-4">
                <div className="flex items-center gap-2">
                  <MessageSquare size={18} className="text-accent" />
                  <h3 className="text-base font-semibold text-foreground">Feedback</h3>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">Provide your feedback to help us improve our services.</p>
              </div>

              <div className="rounded-xl border border-border p-4">
                <FeedbackForm />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};