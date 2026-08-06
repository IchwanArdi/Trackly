import { useNavigate } from 'react-router-dom';
import { LogOut, User, Mail, ShieldCheck } from 'lucide-react';
import { clearAuthToken, getUser } from '../utils/auth';
import { useData } from '../store/dataStore';

export function ProfilePage() {
  const navigate = useNavigate();
  const { clearData } = useData();
  const user = getUser();

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
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="space-y-4 pb-4 max-w-md mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold text-foreground">Profile</h1>
        <p className="text-xs text-muted mt-0.5">Account & Settings</p>
      </div>

      {/* User Card */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-3.5 pb-4 border-b border-border/60">
          <div className="w-12 h-12 rounded-full bg-accent/15 border border-accent/20 flex items-center justify-center text-sm font-bold text-accent shrink-0">
            {getInitials(user?.name)}
          </div>
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
            <span className="font-medium text-foreground truncate max-w-[180px]">{user?.email ?? 'N/A'}</span>
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

      {/* Actions */}
      <div className="pt-2">
        <button
          id="btn-profile-logout"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-semibold text-red-400 bg-card border border-border hover:bg-red-500/10 hover:border-red-500/20 transition-colors cursor-pointer"
        >
          <LogOut size={14} />
          Sign out
        </button>
      </div>
    </div>
  );
}
