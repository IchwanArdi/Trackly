import express from 'express';
import { prisma } from '../config/prisma.js';

const router = express.Router();

// GET /api/stats/public — agregat publik (tanpa auth, tanpa data pribadi) untuk landing page.
// Hanya berisi jumlah total; tidak ada informasi user individual.
router.get('/public', async (req, res) => {
  try {
    const [users, entries, categories] = await Promise.all([
      prisma.user.count(),
      prisma.entry.count(),
      prisma.category.count(),
    ]);

    // Cache 5 menit di browser/CDN — angka tidak perlu real-time per detik
    res.set('Cache-Control', 'public, max-age=300');
    res.status(200).json({ data: { users, entries, categories } });
  } catch (error) {
    console.error('GET /stats/public error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
