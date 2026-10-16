import { useSyncExternalStore } from 'react';
import { AUTH_CHANGE_EVENT, isAuthenticated } from './auth';

// Status login disimpan di luar React (localStorage), jadi UI harus berlangganan
// perubahan supaya ikut re-render saat token ditambah/dihapus.
const subscribe = (onStoreChange: () => void): (() => void) => {
  const resync = () => onStoreChange();

  window.addEventListener(AUTH_CHANGE_EVENT, resync); // login/logout di tab ini
  window.addEventListener('storage', resync); // login/logout dari tab lain
  window.addEventListener('pageshow', resync); // restore dari BFCACHE (tombol back browser)

  return () => {
    window.removeEventListener(AUTH_CHANGE_EVENT, resync);
    window.removeEventListener('storage', resync);
    window.removeEventListener('pageshow', resync);
  };
};

/**
 * Status login yang reaktif. Aman dipakai di halaman publik (mis. navbar homepage):
 * navbar ikut ter-update saat login/logout di tab yang sama, tab lain,
 * maupun setelah halaman di-restore dari BFCACHE.
 */
export function useAuthStatus(): boolean {
  return useSyncExternalStore(subscribe, isAuthenticated, () => false);
}
