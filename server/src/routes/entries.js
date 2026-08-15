import express from 'express';
import { prisma } from '../config/prisma.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Semua route dilindungi oleh JWT
router.use(authenticateToken);

// GET /api/entries — ambil entries milik user (dengan pagination)
// Query params opsional: categoryId, from (YYYY-MM-DD), to (YYYY-MM-DD), page, limit
router.get('/', async (req, res) => {
  try {
    const { categoryId, from, to, page = 1, limit = 50 } = req.query;

    const where = { userId: req.user.id };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (from || to) {
      where.date = {};
      if (from) where.date.gte = new Date(from);
      if (to) {
        // Sertakan seluruh hari "to" (sampai akhir hari)
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        where.date.lte = toDate;
      }
    }

    // Sanitasi & batasi page/limit biar gak disalahgunakan (misal limit=999999)
    const pageNum = Math.max(parseInt(page) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit) || 50, 1), 100);
    const skip = (pageNum - 1) * limitNum;

    const [entries, total] = await prisma.$transaction([
      prisma.entry.findMany({
        where,
        orderBy: { date: 'desc' },
        include: {
          category: {
            select: { name: true, unit: true, color: true, icon: true },
          },
        },
        take: limitNum,
        skip,
      }),
      prisma.entry.count({ where }),
    ]);

    // Format date sebagai string YYYY-MM-DD untuk konsistensi dengan frontend
    const formatted = entries.map((e) => ({
      id: e.id,
      categoryId: e.categoryId,
      date: e.date.toISOString().slice(0, 10),
      value: e.value,
      note: e.note ?? undefined,
      category: e.category,
    }));

    return res.status(200).json({
      data: formatted,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('GET /entries error:', error.message);
    return res.status(500).json({ message: 'Failed to fetch entries' });
  }
});

// POST /api/entries — buat entry baru
router.post('/', async (req, res) => {
  try {
    const { categoryId, date, value, note } = req.body;

    if (!categoryId || !date || value === undefined || value === null) {
      return res.status(400).json({ message: 'categoryId, date, and value are required!' });
    }

    if (typeof value !== 'number' || value <= 0) {
      return res.status(400).json({ message: 'value must be a positive number!' });
    }

    // Pastikan kategori milik user ini
    const category = await prisma.category.findFirst({
      where: { id: categoryId, userId: req.user.id },
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found!' });
    }

    const entry = await prisma.entry.create({
      data: {
        userId: req.user.id,
        categoryId,
        date: new Date(date),
        value,
        note: note?.trim() || null,
      },
    });

    return res.status(201).json({
      id: entry.id,
      categoryId: entry.categoryId,
      date: entry.date.toISOString().slice(0, 10),
      value: entry.value,
      note: entry.note ?? undefined,
    });
  } catch (error) {
    console.error('POST /entries error:', error.message);
    return res.status(500).json({ message: 'Failed to save entry!' });
  }
});

// PUT /api/entries/:id — update entry
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { date, value, note } = req.body;

    const existing = await prisma.entry.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Entry not found!' });
    }

    const updated = await prisma.entry.update({
      where: { id },
      data: {
        ...(date && { date: new Date(date) }),
        ...(value !== undefined && value !== null && { value }),
        note: note !== undefined ? note?.trim() || null : existing.note,
      },
    });

    console.log('Entry updated:', updated.date.toISOString().slice(0, 10));

    return res.status(200).json({
      id: updated.id,
      categoryId: updated.categoryId,
      date: updated.date.toISOString().slice(0, 10),
      value: updated.value,
      note: updated.note ?? undefined,
    });
  } catch (error) {
    console.error('PUT /entries/:id error:', error.message);
    return res.status(500).json({ message: 'Failed to update entry!' });
  }
});

// DELETE /api/entries/:id — hapus entry
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.entry.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Entry not found!' });
    }

    await prisma.entry.delete({ where: { id } });

    return res.status(200).json({ message: 'Entry deleted successfully!' });
  } catch (error) {
    console.error('DELETE /entries/:id error:', error.message);
    return res.status(500).json({ message: 'Failed to delete entry!' });
  }
});

export default router;
