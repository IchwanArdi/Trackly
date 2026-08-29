import webpush from 'web-push';
import { prisma } from '../config/prisma.js';
import 'dotenv/config';

webpush.setVapidDetails(
    process.env.VAPID_SUBJECT,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
);

export const sendPushToUser = async (userId, payload) => {
    const subscriptions = await prisma.pushSubscription.findMany({ where: { userId } });

    const results = await Promise.allSettled(
        subscriptions.map((sub) =>
            webpush.sendNotification(
                { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
                JSON.stringify(payload)
            )
        )
    );

    // Hapus subscription yang udah gak valid (user uninstall/revoke izin/dll)
    const expiredIds = subscriptions
        .filter((_, i) => {
            const r = results[i];
            return r.status === 'rejected' && (r.reason?.statusCode === 410 || r.reason?.statusCode === 404);
        })
        .map((sub) => sub.id);

    if (expiredIds.length > 0) {
        await prisma.pushSubscription.deleteMany({ where: { id: { in: expiredIds } } });
    }
};