/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { api, clearAuthToken } from '../utils/auth';
import { toast } from 'react-toastify';


// ── Types ────────────────────────────────────────────────────────
export interface ApiResponse {
  message: string;
}

export interface Category {
  id: string;
  name: string;
  unit: string;
  color: string;
  icon: string;
}

interface CategoryResponse {
  data: Category[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface Entry {
  id: string;
  categoryId: string;
  date: string; // YYYY-MM-DD
  value: number;
  note?: string;
}

// Tambahkan interface untuk mencocokkan format paginated dari backend Express
interface EntriesResponse {
  data: Entry[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface DataStore {
  categories: Category[];
  entries: Entry[];
  loading: boolean;

  // Categories
  addCategory: (cat: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (id: string, updates: Partial<Omit<Category, 'id'>>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  // Entries
  addEntry: (entry: Omit<Entry, 'id'>) => Promise<void>;
  updateEntry: (id: string, updates: Partial<Omit<Entry, 'id'>>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;

  // User
  deleteUser: () => Promise<ApiResponse>; // 🔄 Diubah untuk mengembalikan data respons

  // Feedback
  sendFeedback: (feedback: { category: string; message: string }) => Promise<ApiResponse>; // 🔄 Diubah untuk mengembalikan data respons

  // Manual refresh
  refreshAll: () => Promise<void>;
  // Clear all in-memory data (call on logout)
  clearData: () => void;
}

const DataContext = createContext<DataStore | null>(null);

// ── Provider ─────────────────────────────────────────────────────
export function DataProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch both from server
  const refreshAll = useCallback(async () => {
    // Jika belum login (tidak ada token), skip fetch
    if (!localStorage.getItem('token')) return;

    setLoading(true);
    try {

      // PERBAIKAN: Gunakan EntriesResponse & CategoryResponse untuk tipe data Axios get /api/entries & /api/categories
      const [catRes, entRes] = await Promise.all([
        api.get<CategoryResponse>('/api/categories'),
        api.get<EntriesResponse>('/api/entries')]);

      // Ambil kategori dan simpan ke state
      setCategories(catRes.data.data);

      // PERBAIKAN: Ambil entRes.data.data karena array asli dibungkus di dalam properti "data"
      const incomingEntries = entRes.data?.data;
      setEntries(Array.isArray(incomingEntries) ? incomingEntries : []);
    } catch (err: unknown) {
      // 401 = not logged in, silently ignore (redirect handled by page)
      if ((err as { response?: { status?: number } })?.response?.status !== 401) {
        toast.error('Failed to load data from server');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Load on mount
  useEffect(() => {
    const initialLoad = async () => {
      await refreshAll();
    };
    initialLoad();
  }, [refreshAll]);

  // ── Category actions ─────────────────────────────────────────
  const addCategory = useCallback(async (cat: Omit<Category, 'id'>) => {
    const res = await api.post<Category>('/api/categories', cat);
    setCategories((prev) => [...prev, res.data]);
  }, []);

  const updateCategory = useCallback(async (id: string, updates: Partial<Omit<Category, 'id'>>) => {
    const res = await api.put<Category>(`/api/categories/${id}`, updates);
    setCategories((prev) => prev.map((c) => (c.id === id ? res.data : c)));
  }, []);

  const deleteCategory = useCallback(async (id: string) => {
    await api.delete(`/api/categories/${id}`);
    setCategories((prev) => prev.filter((c) => c.id !== id));
    setEntries((prev) => prev.filter((e) => e.categoryId !== id));
  }, []);

  // ── Entry actions ────────────────────────────────────────────
  const addEntry = useCallback(async (entry: Omit<Entry, 'id'>) => {
    const res = await api.post<Entry>('/api/entries', entry);
    // Catatan: Karena POST backend langsung me-return objek entry tunggal (bukan paginated), ini tetap aman
    setEntries((prev) => [res.data, ...prev]);
  }, []);

  const updateEntry = useCallback(async (id: string, updates: Partial<Omit<Entry, 'id'>>) => {
    const res = await api.put<Entry>(`/api/entries/${id}`, updates);
    setEntries((prev) => prev.map((e) => (e.id === id ? res.data : e)));
  }, []);

  const deleteEntry = useCallback(async (id: string) => {
    await api.delete(`/api/entries/${id}`);
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  // Hapus semua state lokal — dipanggil saat logout
  const clearData = useCallback(() => {
    setCategories([]);
    setEntries([]);
  }, []);

  // ── User actions ─────────────────────────────────────────────
  const deleteUser = useCallback(async () => {
    try {
      const res = await api.delete<ApiResponse>('/api/users/me');
      clearData();
      clearAuthToken();
      return res.data;
    } catch (error: unknown) {
      console.error('Error deleting account:', error);

      const serverMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(serverMessage || 'Failed to delete account. Please check your connection.');

      throw error;
    }
  }, [clearData]);

  // ── Feedback actions ─────────────────────────────────────────
  const sendFeedback = useCallback(async (feedback: { category: string; message: string }) => {
    try {
      const res = await api.post<ApiResponse>('/api/users/feedback', feedback);
      return res.data;
    } catch (error: unknown) {
      console.error('Error sending feedback:', error);

      const serverMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(serverMessage || 'Failed to send feedback. Please try again later.');

      throw error;
    }
  }, []);


  return (
    <DataContext.Provider
      value={{
        categories,
        entries,
        loading,
        addCategory,
        updateCategory,
        deleteCategory,
        addEntry,
        updateEntry,
        deleteEntry,
        deleteUser,
        sendFeedback,
        refreshAll,
        clearData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
