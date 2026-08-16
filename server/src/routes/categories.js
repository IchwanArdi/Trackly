import express from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Semua route dilindungi oleh JWT
router.use(authenticateToken);

// GET /api/categories — ambil semua kategori milik user
// Menggunakan Pagination
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const where = { userId: req.user.id };

    // Sanitasi & batasi page/limit biar gak disalahgunakan
    const pageNum = Math.max(parseInt(page) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit) || 50, 1), 100);
    const skip = (pageNum - 1) * limitNum;

    // ambil data sekaligus hitung total
    const [categories, total] = await prisma.$transaction([
      prisma.category.findMany({
        where,
        orderBy: { createdAt: 'asc' },
        take: limitNum,
        skip,
      }),
      prisma.category.count({ where }),
    ]);

    // kembalikan data dalam bentuk JSON
    return res.status(200).json({
      data: categories,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('GET /categories error:', error.message);
    return res.status(500).json({ message: 'Failed to fetch categories' });
  }
});


// validasi schema menggunakan Zod
// untuk memastikan data yang masuk sesuai dengan tipe data yang diharapkan
const categorySchema = z.object({
  name: z.string().min(1).max(50).trim(),
  unit: z.string().min(1).max(20).trim(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/), // valid hex color
  icon: z.string().min(1).max(30),
});
// POST /api/categories — buat kategori baru
router.post('/', async (req, res) => {
  try {

    const result = categorySchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ errors: result.error.flatten() });
    }
    const { name, unit, color, icon } = result.data; // type-safe!

    const category = await prisma.category.create({
      data: {
        userId: req.user.id,
        name,
        unit,
        color,
        icon,
      },
    });

    return res.status(201).json(category);
  } catch (error) {
    // Unique constraint: userId + name
    if (error.code === 'P2002') {
      return res.status(409).json({ message: `Category "${req.body.name}" already exists` });
    }
    console.error('POST /categories error:', error.message);
    return res.status(500).json({ message: 'Failed to create category' });
  }
});

// PUT /api/categories/:id — update kategori
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = categorySchema.partial().safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({ errors: result.error.flatten() });
    }
    const { name, unit, color, icon } = result.data;

    // cek category berdasarkan id dan id user
    const existing = await prisma.category.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Category not found!' });
    }

    const updated = await prisma.category.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(unit !== undefined && { unit }),
        ...(color !== undefined && { color }),
        ...(icon !== undefined && { icon }),
      },
    });

    return res.status(200).json(updated);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ message: `Category name already exists` });
    }
    console.error('PUT /categories/:id error:', error.message);
    return res.status(500).json({ message: 'Failed to update category' });
  }
});

// DELETE /api/categories/:id — hapus kategori (entries ikut terhapus via cascade)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.category.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Category not found!' });
    }

    await prisma.category.delete({ where: { id } });

    return res.status(200).json({ message: 'Category deleted successfully!' });
  } catch (error) {
    console.error('DELETE /categories/:id error:', error.message);
    return res.status(500).json({ message: 'Failed to delete category' });
  }
});

export default router;
