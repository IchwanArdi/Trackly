import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { DataProvider } from '../../store/dataStore';
import { NotificationProvider } from '../../store/notificationStore';
import { isAuthenticated } from '../../utils/session';
import { ToastHost } from './ToastHost';

export function AppLayout() {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // Provider data/notifikasi hanya dibutuhkan di area aplikasi. Menempatkannya
  // di sini membuat landing page tidak perlu memuat dataStore, axios, dan
  // react-toastify.
  return (
    <DataProvider>
      <NotificationProvider>
        <ToastHost />
        <div className="flex min-h-screen bg-background text-foreground">
          {/* Desktop sidebar — hidden on mobile */}
          <div className="hidden md:block">
            <Sidebar />
          </div>

          {/* Main content area */}
          <div className="flex-1 flex flex-col min-w-0">
            <main className="flex-1 overflow-y-auto isolate">
              <div className="max-w-5xl mx-auto px-4 py-5 md:px-6 md:py-8 pb-24 md:pb-8">
                <Outlet />
              </div>
            </main>
          </div>

          {/* Bottom nav — mobile only */}
          <BottomNav />
        </div>
      </NotificationProvider>
    </DataProvider>
  );
}
