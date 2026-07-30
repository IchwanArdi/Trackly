import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { api } from '../utils/auth';
import { toast } from 'react-toastify';

// ── Types ────────────────────────────────────────────────────────
export interface Category {
  id: string;
  name: string;
  unit: string;
  color: string;
  icon: string;
}

export interface Entry {
  id: string;
  categoryId: string;
  date: string; // YYYY-MM-DD
  value: number;
  note?: string;
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
      const [catRes, entRes] = await Promise.all([
        api.get<Category[]>('/api/categories'),
        api.get<Entry[]>('/api/entries'),
      ]);
      setCategories(catRes.data);
      setEntries(entRes.data);
    } catch (err: any) {
      // 401 = not logged in, silently ignore (redirect handled by page)
      if (err?.response?.status !== 401) {
        toast.error('Gagal memuat data dari server');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Load on mount
  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // ── Category actions ─────────────────────────────────────────
  const addCategory = useCallback(async (cat: Omit<Category, 'id'>) => {
    const res = await api.post<Category>('/api/categories', cat);
    setCategories(prev => [...prev, res.data]);
  }, []);

  const updateCategory = useCallback(async (id: string, updates: Partial<Omit<Category, 'id'>>) => {
    const res = await api.put<Category>(`/api/categories/${id}`, updates);
    setCategories(prev => prev.map(c => c.id === id ? res.data : c));
  }, []);

  const deleteCategory = useCallback(async (id: string) => {
    await api.delete(`/api/categories/${id}`);
    // Hapus juga entries yang terkait (cascade sudah ada di DB, tapi update state lokal)
    setCategories(prev => prev.filter(c => c.id !== id));
    setEntries(prev => prev.filter(e => e.categoryId !== id));
  }, []);

  // ── Entry actions ────────────────────────────────────────────
  const addEntry = useCallback(async (entry: Omit<Entry, 'id'>) => {
    const res = await api.post<Entry>('/api/entries', entry);
    setEntries(prev => [res.data, ...prev]);
  }, []);

  const updateEntry = useCallback(async (id: string, updates: Partial<Omit<Entry, 'id'>>) => {
    const res = await api.put<Entry>(`/api/entries/${id}`, updates);
    setEntries(prev => prev.map(e => e.id === id ? res.data : e));
  }, []);

  const deleteEntry = useCallback(async (id: string) => {
    await api.delete(`/api/entries/${id}`);
    setEntries(prev => prev.filter(e => e.id !== id));
  }, []);

  // Hapus semua state lokal — dipanggil saat logout
  const clearData = useCallback(() => {
    setCategories([]);
    setEntries([]);
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
