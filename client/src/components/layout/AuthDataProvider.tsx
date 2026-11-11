import type { ReactNode } from 'react';
import { DataProvider } from '../../store/dataStore';

/**
 * Provider tipis untuk halaman login/auth-success.
 *
 * Wrapper ini sengaja berupa modul terpisah supaya App tidak perlu melakukan
 * dynamic import langsung ke dataStore. Semua import dataStore jadi berada di
 * chunk lazy, sehingga store + axios + toastify tidak masuk bundle landing.
 */
export function AuthDataProvider({ children }: { children: ReactNode }) {
  return <DataProvider>{children}</DataProvider>;
}
