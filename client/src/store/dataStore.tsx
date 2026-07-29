import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { CATEGORIES, ENTRIES, type Category, type Entry } from '../data/mockData';

interface DataStore {
  categories: Category[];
  entries: Entry[];
  addCategory: (cat: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, updates: Partial<Omit<Category, 'id'>>) => void;
  deleteCategory: (id: string) => void;
  addEntry: (entry: Omit<Entry, 'id'>) => void;
  updateEntry: (id: string, updates: Partial<Omit<Entry, 'id'>>) => void;
  deleteEntry: (id: string) => void;
}

const DataContext = createContext<DataStore | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>(CATEGORIES);
  const [entries, setEntries] = useState<Entry[]>(ENTRIES);

  const addCategory = useCallback((cat: Omit<Category, 'id'>) => {
    setCategories(prev => [...prev, { ...cat, id: `cat-${Date.now()}` }]);
  }, []);

  const updateCategory = useCallback((id: string, updates: Partial<Omit<Category, 'id'>>) => {
    setCategories(prev => prev.map(c => (c.id === id ? { ...c, ...updates } : c)));
  }, []);

  const deleteCategory = useCallback((id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    setEntries(prev => prev.filter(e => e.categoryId !== id));
  }, []);

  const addEntry = useCallback((entry: Omit<Entry, 'id'>) => {
    setEntries(prev => [...prev, { ...entry, id: `entry-${Date.now()}` }]);
  }, []);

  const updateEntry = useCallback((id: string, updates: Partial<Omit<Entry, 'id'>>) => {
    setEntries(prev => prev.map(e => (e.id === id ? { ...e, ...updates } : e)));
  }, []);

  const deleteEntry = useCallback((id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  }, []);

  return (
    <DataContext.Provider
      value={{ categories, entries, addCategory, updateCategory, deleteCategory, addEntry, updateEntry, deleteEntry }}
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
