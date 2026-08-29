import { api } from './auth';

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export async function isPushSubscribed(): Promise<boolean> {
    if (!('serviceWorker' in navigator)) return false;
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) return false;
    const subscription = await registration.pushManager.getSubscription();
    return !!subscription;
}

export async function subscribeToPush(): Promise<{ ok: boolean; reason?: string }> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
        return { ok: false, reason: 'Browser ini tidak mendukung push notification' };
    }

    try {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
            return { ok: false, reason: 'Izin notifikasi ditolak' };
        }

        const registration = await navigator.serviceWorker.register('/sw.js');
        await navigator.serviceWorker.ready;

        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(import.meta.env.VITE_VAPID_PUBLIC_KEY),
        });

        await api.post('/api/push/subscribe', subscription.toJSON());
        return { ok: true };
    } catch (error: any) {
        console.error('Subscription push error:', error);
        return { ok: false, reason: error.message || 'Gagal mengaktifkan push notification' };
    }
}

export async function unsubscribeFromPush(): Promise<void> {
    const registration = await navigator.serviceWorker.getRegistration();
    const subscription = await registration?.pushManager.getSubscription();
    if (subscription) {
        await api.delete('/api/push/unsubscribe', { data: { endpoint: subscription.endpoint } });
        await subscription.unsubscribe();
    }
}