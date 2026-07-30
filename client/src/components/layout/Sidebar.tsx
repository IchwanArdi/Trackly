import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ListOrdered, Plus, FolderOpen, LogOut, Activity
} from 'lucide-react';

import { clearAuthToken } from '../../utils/auth';
import { useData } from '../../store/dataStore';
import { getUser } from '../../utils/auth';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/history', icon: ListOrdered, label: 'History' },
  { to: '/log', icon: Plus, label: 'Log Entry' },
  { to: '/categories', icon: FolderOpen, label: 'Categories' },
];

export function Sidebar() {
  const navigate = useNavigate();
  const { clearData } = useData();
  const user = getUser();

  const handleLogout = () => {
    clearData();
    clearAuthToken();
    navigate('/login');
  };

  return (
    <aside className="w-56 shrink-0 h-screen sticky top-0 bg-card border-r border-border flex flex-col">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-border flex items-center gap-2.5">
        <div className="w-7 h-7 bg-accent rounded-md flex items-center justify-center">
          <Activity size={14} className="text-white" />
        </div>
        <span className="font-semibold text-sm tracking-tight text-foreground">Trackly</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 flex flex-col gap-0.5">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            id={`nav-${label.toLowerCase().replace(' ', '-')}`}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors duration-100 ${isActive
                ? 'bg-accent/10 text-accent font-medium'
                : 'text-muted hover:text-foreground hover:bg-surface'
              }`
            }
          >
            <Icon size={15} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-border">
        <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
          <div className="w-6 h-6 rounded-full bg-surface border border-border flex items-center justify-center text-xs font-medium text-foreground">
            {user?.name.substring(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-foreground truncate">{user?.name}</p>
            <p className="text-[10px] text-muted truncate">{user?.email}</p>
          </div>
        </div>
        <button
          id="btn-logout"
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-muted hover:text-foreground hover:bg-surface rounded-md transition-colors duration-100 cursor-pointer"
        >
          <LogOut size={13} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
