import express from 'express';
import { prisma } from '../config/prisma.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticateToken);

router.post('/subscribe', async (req, res) => {
    try {
        const { endpoint, keys } = req.body;

        if (!endpoint || !keys?.p256dh || !keys?.auth) {
            return res.status(400).json({ message: 'Subscription data tidak lengkap' });
        }

        await prisma.pushSubscription.upsert({
            where: { endpoint },
            update: { userId: req.user.id, p256dh: keys.p256dh, auth: keys.auth },
            create: { userId: req.user.id, endpoint, p256dh: keys.p256dh, auth: keys.auth },
        });

        res.status(201).json({ message: 'Berhasil subscribe notifikasi' });
    } catch (error) {
        console.error('Push subscribe error:', error);
        res.status(500).json({ message: 'Gagal menyimpan subscription' });
    }
});

router.delete('/unsubscribe', async (req, res) => {
    try {
        const { endpoint } = req.body;
        await prisma.pushSubscription.deleteMany({ where: { endpoint, userId: req.user.id } });
        res.json({ message: 'Berhasil unsubscribe' });
    } catch (error) {
        console.error('Push unsubscribe error:', error);
        res.status(500).json({ message: 'Gagal menghapus subscription' });
    }
});

export default router;