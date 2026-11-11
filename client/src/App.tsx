import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ScrollToTop } from './components/layout/ScrollToTop';
import { AnalyticsPageView } from './components/AnalyticsPageView';
import { RouteSeo } from './components/RouteSeo';
import LandingPage from './pages/LandingPage';

/**
 * Landing page sengaja di-import eager karena itu halaman pertama yang dibuka.
 * Halaman lain di-split ke chunk terpisah supaya pengunjung landing tidak
 * mengunduh kode dashboard, Recharts, html-to-image, dan halaman legal.
 *
 * Sebelum perubahan ini semua halaman di-import statis sehingga Vite
 * menggabungkannya menjadi satu bundle ~1 MB (307 KB setelah Brotli).
 */
const AppLayout = lazy(() =>
  import('./components/layout/AppLayout').then((module) => ({ default: module.AppLayout })),
);
const LoginPage = lazy(() =>
  import('./pages/LoginPage').then((module) => ({ default: module.LoginPage })),
);
const DashboardPage = lazy(() =>
  import('./pages/DashboardPage').then((module) => ({ default: module.DashboardPage })),
);
const LogEntryPage = lazy(() =>
  import('./pages/LogEntryPage').then((module) => ({ default: module.LogEntryPage })),
);
const HistoryPage = lazy(() =>
  import('./pages/HistoryPage').then((module) => ({ default: module.HistoryPage })),
);
const CategoriesPage = lazy(() =>
  import('./pages/CategoriesPage').then((module) => ({ default: module.CategoriesPage })),
);
const ProfilePage = lazy(() =>
  import('./pages/ProfilePage').then((module) => ({ default: module.ProfilePage })),
);
const HelpPage = lazy(() =>
  import('./pages/HelpPage').then((module) => ({ default: module.HelpPage })),
);
const TermsOfService = lazy(() =>
  import('./pages/TermsOfService').then((module) => ({ default: module.TermsOfService })),
);
const PrivacyPolicy = lazy(() =>
  import('./pages/PrivacyPolicy').then((module) => ({ default: module.PrivacyPolicy })),
);
const DataDeletion = lazy(() =>
  import('./pages/Datadeletion').then((module) => ({ default: module.DataDeletion })),
);
const AuthSuccessPage = lazy(() =>
  import('./pages/AuthSuccessPage').then((module) => ({ default: module.AuthSuccessPage })),
);
// Login dan AuthSuccess memakai useData().refreshAll(), jadi keduanya perlu
// provider sendiri di luar AppLayout.
const AuthDataProvider = lazy(() =>
  import('./components/layout/AuthDataProvider').then((module) => ({ default: module.AuthDataProvider })),
);

function RouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
      <div
        role="status"
        aria-label="Memuat halaman"
        className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent"
      />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AnalyticsPageView />
      <RouteSeo />
      <ScrollToTop />
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/data-deletion" element={<DataDeletion />} />

          {/* Auth routes */}
          <Route
            path="/login"
            element={
              <AuthDataProvider>
                <LoginPage />
              </AuthDataProvider>
            }
          />
          <Route
            path="/auth/success"
            element={
              <AuthDataProvider>
                <AuthSuccessPage />
              </AuthDataProvider>
            }
          />

          {/* Old password routes now point to the passwordless login page.
              Keeping redirects avoids broken bookmarks and old search links. */}
          <Route path="/register" element={<Navigate to="/login" replace />} />
          <Route path="/forgot-password" element={<Navigate to="/login" replace />} />
          <Route path="/reset-password" element={<Navigate to="/login" replace />} />

          {/* App routes */}
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/log" element={<LogEntryPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;