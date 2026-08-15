import express from 'express';
import { prisma } from '../config/prisma.js';
import { hashPassword, comparePassword } from '../utils/encryption.js';
import { authLimiter } from '../middleware/rateLimit.js';
import jwt from 'jsonwebtoken';
import passport from 'passport';

const router = express.Router();

// Route Register
router.post('/register', authLimiter, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Validasi input dasar
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required!' });
    }

    // 2. Cek apakah email sudah terdaftar di tabel User Prisma
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered!' });
    }

    // 3. Hash password menggunakan bcrypt
    const hashedPassword = await hashPassword(password);

    // 4. Simpan user baru ke database via Prisma
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // 5. Kirim respons sukses ke client
    return res.status(201).json({
      message: 'Registration successful!',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error('Prisma Register Error:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Route Login
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validasi input dasar
    if (!email || !password) {
      return res.status(400).json({ message: 'All fields are required!' });
    }

    // 2. Cek apakah email sudah terdaftar di tabel User Prisma
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!existingUser) {
      return res.status(400).json({ message: 'Email not registered!' });
    }

    // 3. Cek Password menggunakan bcrypt
    const checkPassword = await comparePassword(password, existingUser.password);

    if (!checkPassword) {
      return res.status(400).json({ message: 'Incorrect password!' });
    }

    // 4. JWT Token
    const token = jwt.sign({ userId: existingUser.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // 5. Kirim respons sukses ke client
    return res.status(200).json({
      message: 'Login successful!',
      token,
      user: {
        id: existingUser.id,
        name: existingUser.name,
        email: existingUser.email,
      },
    });
  } catch (error) {
    console.error('Prisma Login Error:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Konfigurasi Login dengan Google

const frontendURL = process.env.NODE_ENV === 'production' ? 'https://thetrackly.vercel.app' : 'http://localhost:5173';

// Route Login pake Google - INISIATOR (ini yang kepencet pas klik tombol)
router.get('/google', passport.authenticate('google', { scope: ['email', 'profile'], session: false }));

// Route Login pake Google - CALLBACK (dipanggil otomatis oleh Google, bukan manual)
router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: `${frontendURL}/login` }), (req, res) => {
  try {
    // Generate JWT token
    const token = jwt.sign({ userId: req.user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Redirect ke frontend dengan token serta data user sebagai query parameter
    const redirectUrl = new URL('/auth/success', frontendURL);
    redirectUrl.searchParams.set('token', token);
    redirectUrl.searchParams.set('id', req.user.id);
    redirectUrl.searchParams.set('name', req.user.name || '');
    redirectUrl.searchParams.set('email', req.user.email || '');

    res.redirect(redirectUrl.toString());
  } catch (error) {
    console.error('Google Callback Error:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
