import { useNavigate } from 'react-router-dom';
import { LogOut, User, Mail, ShieldCheck } from 'lucide-react';
import { clearAuthToken, getUser } from '../utils/auth';
import { useData } from '../store/dataStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export function ProfilePage() {
  const navigate = useNavigate();
  const { clearData } = useData();
  const user = getUser();

  const handleLogout = () => {
    clearData();
    clearAuthToken();
    navigate('/login');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Profile & Settings</h1>
        <p className="text-sm text-muted mt-0.5">Manage your personal account details.</p>
      </div>

      <Card>
        <div className="flex items-center gap-4 py-2 border-b border-border pb-5 mb-5">
          <div className="w-14 h-14 rounded-full bg-surface border border-border flex items-center justify-center text-lg font-bold text-accent shrink-0">
            {user?.name ? user.name.substring(0, 2).toUpperCase() : 'US'}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-semibold text-foreground truncate">{user?.name ?? 'User'}</h2>
            <p className="text-xs text-muted truncate">{user?.email ?? 'user@example.com'}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-2 border-b border-border text-sm">
            <div className="flex items-center gap-3 text-muted">
              <User size={16} />
              <span>Full Name</span>
            </div>
            <span className="font-medium text-foreground">{user?.name ?? 'N/A'}</span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-border text-sm">
            <div className="flex items-center gap-3 text-muted">
              <Mail size={16} />
              <span>Email Address</span>
            </div>
            <span className="font-medium text-foreground truncate max-w-[180px] sm:max-w-none">{user?.email ?? 'N/A'}</span>
          </div>

          <div className="flex items-center justify-between py-2 text-sm">
            <div className="flex items-center gap-3 text-muted">
              <ShieldCheck size={16} />
              <span>Account Status</span>
            </div>
            <span className="text-xs font-medium px-2 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/20">Active</span>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-sm font-semibold text-foreground mb-3">Account Actions</h3>
        <Button
          id="btn-profile-logout"
          variant="danger"
          size="md"
          className="w-full flex justify-center items-center gap-2"
          onClick={handleLogout}
        >
          <LogOut size={16} />
          Sign out of Trackly
        </Button>
      </Card>
    </div>
  );
}
