import express from 'express';
import { prisma } from '../config/prisma.js';
import { sendPushToUser } from '../utils/sendPush.js';
import { sendReminderEmail } from '../utils/sendEmail.js';

const router = express.Router();

router.get('/daily-reminder', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const users = await prisma.user.findMany({
            where: { entries: { none: { date: { gte: startOfToday } } } },
            select: { id: true, name: true, email: true },
        });

        for (const user of users) {
            await prisma.notification.create({
                data: {
                    userId: user.id,
                    type: 'reminder',
                    title: 'Belum log hari ini',
                    message: 'Jangan lupa catat aktivitasmu hari ini di Trackly!',
                },
            });

            await sendPushToUser(user.id, {
                title: 'Belum log hari ini 👀',
                body: 'Yuk catat aktivitasmu di Trackly',
                url: '/log',
            });

            await sendReminderEmail(user.email, user.name);
        }

        res.json({ message: `Reminder terkirim ke ${users.length} user` });
    } catch (error) {
        console.error('Cron daily-reminder error:', error);
        res.status(500).json({ message: 'Gagal menjalankan reminder' });
    }
});

export default router;