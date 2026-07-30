import express from 'express';
import { prisma } from '../config/prisma.js';
import { hashPassword, comparePassword } from '../utils/encryption.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Route Register
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

        // 5. Kirim respons sukses ke client
        return res.status(201).json({
            message: 'Registrasi berhasil!',
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

// Route Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Validasi input dasar
        if (!email || !password) {
            return res.status(400).json({ message: 'Semua kolom wajib diisi!' });
        }

        // 2. Cek apakah email sudah terdaftar di tabel User Prisma
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (!existingUser) {
            return res.status(400).json({ message: 'Email tidak terdaftar!' });
        }

        // 3. Cek Password menggunakan bcrypt
        const checkPassword = await comparePassword(password, existingUser.password);

        if (!checkPassword) {
            return res.status(400).json({ message: 'Password salah!' });
        }

        // 4. JWT Token
        const token = jwt.sign(
            { userId: existingUser.id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // 5. Kirim respons sukses ke client
        return res.status(200).json({
            message: 'Login berhasil!',
            token,
            user: {
                id: existingUser.id,
                name: existingUser.name,
                email: existingUser.email
            }
        });

    } catch (error) {
        console.error('Prisma Register Error:', error.message);
        return res.status(500).json({ message: 'Terjadi kesalahan internal pada server' });
    }
});


export default router;
