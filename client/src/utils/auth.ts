import axios, { type InternalAxiosRequestConfig, type AxiosResponse } from 'axios';
import { toast } from 'react-toastify';
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
  (error: any) => {
    // Cek jika server mengembalikan error status 401 (Unauthorized)
    if (error.response && error.response.status === 401) {
      console.warn('Session expired or invalid token. Clearing storage...');

      // Bersihkan semua data autentikasi dari localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Beri informasi ke user agar tidak bingung mengapa mereka terlempar keluar
      toast.error('Your session has expired. Please log in again.');

      // Paksa browser mengalihkan halaman ke login
      window.location.href = '/login';
    }

    // Tetap kembalikan error agar tidak merusak chain Promise/catch lokal jika dibutuhkan
    return Promise.reject(error);
  },
);

// 3. Fungsi Manajemen Token
export const setAuthToken = (token: string | null): void => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

// 4. Fungsi Hapus Token
export const clearAuthToken = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user'); // Ikut bersihkan user saat logout manual
};

// 5. Fungsi Cek Token
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('token');
  return !!token;
};

// 6. Simpan User Ke Local Storage
export const saveUser = (user: { id: string; name: string; email: string }): void => {
  localStorage.setItem('user', JSON.stringify(user));
};

// 7. Ambil User Dari Local Storage
export const getUser = (): { id: string; name: string; email: string } | null => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};
