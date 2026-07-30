import axios, { type InternalAxiosRequestConfig } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// 1. Interceptor Request (Type-safe menggunakan tipe bawaan Axios)
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
    }
);

// 2. Fungsi Manajemen Token
export const setAuthToken = (token: string | null): void => {
    if (token) {
        localStorage.setItem('token', token);
    } else {
        localStorage.removeItem('token');
    }
};

// 3. Fungsi Hapus Token
export const clearAuthToken = (): void => {
    localStorage.removeItem('token');
};

// 4. Fungsi Cek Token
export const isAuthenticated = (): boolean => {
    const token = localStorage.getItem('token');
    return !!token; // Mengembalikan true jika ada token, false jika null/kosong
};

// 4. Simpan User Ke Local Storage
export const saveUser = (user: { id: string; name: string; email: string }): void => {
    localStorage.setItem('user', JSON.stringify(user));
};

// 5. Ambil User Dari Local Storage
export const getUser = (): { id: string; name: string; email: string } | null => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
};
