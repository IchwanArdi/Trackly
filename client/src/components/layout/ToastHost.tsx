import { ToastContainer } from 'react-toastify';

/**
 * Container toast dipisah ke chunk sendiri supaya landing page tidak memuat
 * react-toastify. Komponen ini baru di-render di route selain landing.
 */
export function ToastHost() {
  return <ToastContainer position="top-right" autoClose={2000} theme="colored" />;
}
