/**
 * Session helpers yang sengaja tidak mengimpor axios/toastify.
 *
 * Landing page hanya butuh membaca/menghapus token. Kalau helper ini ikut
 * mengimpor client API dan react-toastify, seluruh library tersebut masuk ke
 * bundle awal walaupun pengunjung belum login.
 */

// Event internal: dipakai hook useAuthStatus supaya komponen React
// (mis. navbar homepage) ikut re-render saat token ditambah/dihapus.
export const AUTH_CHANGE_EVENT = 'trackly:auth-change';

const notifyAuthChange = (): void => {
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
};

export const setAuthToken = (token: string | null): void => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
  notifyAuthChange();
};

export const clearAuthToken = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  notifyAuthChange();
};

export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('token');
  return !!token;
};

export const saveUser = (user: { id: string; name: string; email: string }): void => {
  localStorage.setItem('user', JSON.stringify(user));
};

export const getUser = (): { id: string; name: string; email: string } | null => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};
