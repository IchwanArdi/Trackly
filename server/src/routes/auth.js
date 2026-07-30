import express from 'express';
import { prisma } from '../config/prisma.js';
import { hashPassword } from '../utils/encryption.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // 1. Validasi input dasar
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Semba kolom wajib diisi!' });
        }

        // 2. Cek apakah email sudah terdaftar di tabel User Prisma
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return res.status(400).json({ message: 'Email sudah terdaftar!' });
        }

        // 3. Hash password menggunakan bcrypt
        const hashedPassword = await hashPassword(password);

        // 4. Simpan user baru ke database via Prisma
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword
            }
        });

        // 5. JWT Token
        const token = jwt.sign(
            { userId: newUser.id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // 6. Kirim respons sukses ke client
        return res.status(201).json({
            message: 'Registrasi berhasil!',
            token,
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email
            }
        });

    } catch (error) {
        console.error('Prisma Register Error:', error.message);
        return res.status(500).json({ message: 'Terjadi kesalahan internal pada server' });
    }
});

export default router;
