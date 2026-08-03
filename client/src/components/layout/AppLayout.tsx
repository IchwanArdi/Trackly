import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { MobileHeader } from './MobileHeader';

export function AppLayout() {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Desktop sidebar — hidden on mobile */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header — hidden on desktop */}
        <MobileHeader />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-4 py-5 md:px-6 md:py-8 pb-24 md:pb-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Bottom nav — mobile only */}
      <BottomNav />
    </div>
  );
}
