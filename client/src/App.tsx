import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { DataProvider } from './store/dataStore';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { LogEntryPage } from './pages/LogEntryPage';
import { HistoryPage } from './pages/HistoryPage';
import { CategoriesPage } from './pages/CategoriesPage';

function App() {
  return (
    <DataProvider>
      <ToastContainer position='top-right' autoClose={2000} theme='colored' />
      <BrowserRouter>
        <Routes>
          {/* Auth routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* App routes */}
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/log" element={<LogEntryPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </DataProvider>
  );
}

export default App;