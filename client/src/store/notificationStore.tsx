/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { api } from '../utils/auth';

export interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
}

interface NotificationStore {
    notifications: Notification[];
    unreadCount: number;
    refresh: () => Promise<void>;
    markAllRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationStore | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const refresh = useCallback(async () => {
        if (!localStorage.getItem('token')) return;
        try {
            const res = await api.get<Notification[]>('/api/notifications');
            setNotifications(res.data);
        } catch {
            // Silently ignore — notification list is non-critical to core app function
        }
    }, []);

    const markAllRead = useCallback(async () => {
        try {
            await api.patch('/api/notifications/read-all');
            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        } catch {
            // Silently ignore
        }
    }, []);

    useEffect(() => {
        refresh();
        // Poll tiap 60 detik supaya notifikasi baru (misal dari cron) muncul tanpa reload manual
        const interval = setInterval(refresh, 60_000);
        return () => clearInterval(interval);
    }, [refresh]);

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return <NotificationContext.Provider value={{ notifications, unreadCount, refresh, markAllRead }}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
    const ctx = useContext(NotificationContext);
    if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
    return ctx;
}