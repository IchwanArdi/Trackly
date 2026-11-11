import axios, { type InternalAxiosRequestConfig, type AxiosResponse } from 'axios';
import { toast } from 'react-toastify';
import { clearAuthToken } from './session';

// Re-export supaya import lama tetap bekerja. Modul yang hanya butuh token
// (mis. landing page) sebaiknya mengimpor dari './session' agar axios dan
// react-toastify tidak ikut dimuat.
export {
  AUTH_CHANGE_EVENT,
  clearAuthToken,
  getUser,
  isAuthenticated,
  saveUser,
  setAuthToken,
} from './session';

const API_URL = import.meta.env.VITE_API_URL;

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 1. Interceptor Request (Menempelkan token otomatis)
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: unknown) => {
    return Promise.reject(error);
  },
);

// 2. Interceptor Response (Menangkap Error 401 & Paksa Logout)
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Jika API sukses (status 2xx), langsung teruskan datanya
    return response;
  },
  (error: { response?: { status?: number } } & Error) => {
    // 401 hanya berarti "sesi habis" kalau request sebelumnya memang mengirim token.
    // Tanpa token, jangan buang sesi / redirect paksa (mis. user memang belum login).
    const wasAuthenticated = !!localStorage.getItem('token');

    if (error.response?.status === 401 && wasAuthenticated) {
      console.warn('Session expired or invalid token. Clearing storage...');

      // Bersihkan semua data autentikasi dari localStorage (sekaligus broadcast ke UI)
      clearAuthToken();

      // Beri informasi ke user agar tidak bingung mengapa mereka terlempar keluar
      toast.error('Your session has expired. Please log in again.');

      // Paksa browser mengalihkan halaman ke login (hindari loop kalau sudah di sana)
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    // Tetap kembalikan error agar tidak merusak chain Promise/catch lokal jika dibutuhkan
    return Promise.reject(error);
  },
);
