import express from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Semua route dilindungi oleh JWT
router.use(authenticateToken);

// GET /api/categories — ambil semua kategori milik user
router.get('/', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'asc' },
    });
    return res.status(200).json(categories);
  } catch (error) {
    console.error('GET /categories error:', error.message);
    return res.status(500).json({ message: 'Gagal mengambil data kategori' });
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
      return res.status(409).json({ message: `Kategori "${req.body.name}" sudah ada` });
    }
    console.error('POST /categories error:', error.message);
    return res.status(500).json({ message: 'Gagal membuat kategori' });
  }
});

// PUT /api/categories/:id — update kategori
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, unit, color, icon } = req.body;

    // Pastikan kategori milik user ini
    const existing = await prisma.category.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Kategori tidak ditemukan' });
    }

    const updated = await prisma.category.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(unit && { unit: unit.trim() }),
        ...(color && { color }),
        ...(icon && { icon }),
      },
    });

    return res.status(200).json(updated);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ message: `Kategori "${req.body.name}" sudah ada` });
    }
    console.error('PUT /categories/:id error:', error.message);
    return res.status(500).json({ message: 'Gagal mengupdate kategori' });
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
      return res.status(404).json({ message: 'Kategori tidak ditemukan' });
    }

    await prisma.category.delete({ where: { id } });

    return res.status(200).json({ message: 'Kategori berhasil dihapus' });
  } catch (error) {
    console.error('DELETE /categories/:id error:', error.message);
    return res.status(500).json({ message: 'Gagal menghapus kategori' });
  }
});

export default router;
