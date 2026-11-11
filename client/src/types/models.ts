/**
 * Tipe domain murni tanpa dependency runtime.
 *
 * File ini dipakai oleh landing page dan komponen visual yang hanya butuh
 * bentuk data. Dengan memisahkan tipe dari dataStore, Vite tidak perlu
 * menganggap store (axios, toastify, dsb.) sebagai dependency landing page.
 */
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
