import express from 'express';
import { prisma } from '../config/prisma.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticateToken);

router.get('/', async (req, res) => {
    try {
        const notifications = await prisma.notification.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' },
            take: 30,
        });
        res.json(notifications);
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ message: 'Gagal mengambil notifikasi' });
    }
});

router.patch('/read-all', async (req, res) => {
    try {
        await prisma.notification.updateMany({
            where: { userId: req.user.id, isRead: false },
            data: { isRead: true },
        });
        res.json({ message: 'ok' });
    } catch (error) {
        console.error('Mark all read error:', error);
        res.status(500).json({ message: 'Gagal menandai notifikasi' });
    }
});

export default router;