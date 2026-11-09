import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { DataProvider } from './store/dataStore';
import { NotificationProvider } from './store/notificationStore';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { LogEntryPage } from './pages/LogEntryPage';
import { HistoryPage } from './pages/HistoryPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { ProfilePage } from './pages/ProfilePage';
import LandingPage from './pages/LandingPage';
import { HelpPage } from './pages/HelpPage';
import { TermsOfService } from './pages/TermsOfService';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { DataDeletion } from './pages/Datadeletion';
import { AuthSuccessPage } from './pages/AuthSuccessPage';
import { ScrollToTop } from './components/layout/ScrollToTop';
import { AnalyticsPageView } from './components/AnalyticsPageView';
import { RouteSeo } from './components/RouteSeo';

function App() {
  return (
    <DataProvider>
      <NotificationProvider>
        <ToastContainer position="top-right" autoClose={2000} theme="colored" />
        <BrowserRouter>
          <AnalyticsPageView />
          <RouteSeo />
          <ScrollToTop />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/help" element={<HelpPage />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/data-deletion" element={<DataDeletion />} />

            {/* Auth routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/auth/success" element={<AuthSuccessPage />} />

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
        </BrowserRouter>
      </NotificationProvider>
    </DataProvider>
  );
}

export default App;