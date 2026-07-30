import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma.js';

export const authenticateToken = async (req, res, next) => {
    try {
        // 1. Ambil token dari header Authorization
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ message: 'Token tidak ditemukan, akses ditolak' });
        }

        // 2. Verifikasi token menggunakan jsonwebtoken dan JWT_SECRET dari .env
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3. Cari user di database PostgreSQL menggunakan Prisma berdasarkan userId dari token
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                name: true,
                email: true
            }
        });

        // 4. Jika user tidak ditemukan di database kita
        if (!user) {
            return res.status(401).json({ message: 'Pengguna tidak ditemukan, akses ditolak' });
        }

        // 5. Simpan data user
        req.user = user;

        console.log(`data user ${user}`)

        next();
    } catch (error) {
        console.error('Auth middleware error:', error.message);

        // Menangani error spesifik jika token kedaluwarsa
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token telah kedaluwarsa, silakan login ulang' });
        }

        return res.status(401).json({ message: 'Token tidak valid' });
    }
};
