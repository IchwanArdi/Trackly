import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ListOrdered, Plus, FolderOpen, User } from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { to: '/history', icon: ListOrdered, label: 'History' },
  { to: '/log', icon: Plus, label: 'Log', isCenter: true },
  { to: '/categories', icon: FolderOpen, label: 'Categories' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export function BottomNav() {
  return (
    <nav id="bottom-nav" className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-card border-t border-border" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <div className="flex items-end justify-around px-2 h-14">
        {navItems.map(({ to, icon: Icon, label, isCenter }) => (
          <NavLink
            key={to}
            to={to}
            id={`bottom-nav-${label.toLowerCase()}`}
            className={({ isActive }) => {
              const base = 'flex flex-col items-center justify-center gap-0.5 min-w-14 min-h-11 select-none transition-colors duration-100';
              if (isCenter) {
                return `${base} -mt-4`;
              }
              return `${base} ${isActive ? 'text-accent' : 'text-muted'}`;
            }}
          >
            {({ isActive }) =>
              isCenter ? (
                <>
                  <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center shadow-md shadow-accent/20">
                    <Icon size={22} className="text-white" strokeWidth={2.5} />
                  </div>
                  <span className="text-[10px] font-medium text-accent leading-none mt-0.5">{label}</span>
                </>
              ) : (
                <>
                  <Icon size={20} strokeWidth={isActive ? 2.2 : 1.5} />
                  <span className={`text-[10px] leading-none ${isActive ? 'font-semibold' : 'font-medium'}`}>{label}</span>
                </>
              )
            }
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
