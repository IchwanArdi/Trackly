import crypto from 'crypto';
import express from 'express';
import { prisma } from '../config/prisma.js';
import { hashPassword } from '../utils/encryption.js';
import { sendResetPasswordEmail } from '../utils/sendEmail.js';
import { authLimiter } from '../middleware/rateLimit.js';

const router = express.Router();

router.post('/forgot-password', authLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required!' });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // PENTING: jangan bilang "email tidak ditemukan" secara eksplisit.
    // Kalau bocorin info itu, orang jahat bisa "menebak" email mana yang
    // terdaftar di sistem kita (email enumeration attack). Selalu balas
    // pesan yang sama, baik email ketemu atau tidak.
    if (!user) {
      return res.status(200).json({
        message: 'If the email is registered, a password reset link has been sent.',
      });
    }

    // Kalau user ini daftar via Google (gak punya password), gak masuk akal
    // dia minta reset password. Tetap balas pesan generik yang sama.
    if (!user.password) {
      return res.status(200).json({
        message: 'If the email is registered, a password reset link has been sent.',
      });
    }

    // Generate token random (bukan JWT), simpan ke database
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 jam dari sekarang

    await prisma.user.update({
      where: { email },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    const frontendURL = process.env.NODE_ENV === 'production' ? 'https://thetrackly.vercel.app' : 'http://localhost:5173';

    const resetLink = `${frontendURL}/reset-password/${resetToken}`;

    await sendResetPasswordEmail(user.email, resetLink);

    return res.status(200).json({
      message: 'If the email is registered, a password reset link has been sent.',
    });
  } catch (error) {
    console.error('Forgot Password Error:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// ============================================
// Route: Reset Password
// User submit token (dari link email) + password baru
// ============================================
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required!' });
    }

    const user = await prisma.user.findUnique({ where: { resetToken: token } });

    if (!user) {
      return res.status(400).json({ message: 'Token is invalid or has been used.' });
    }

    // Cek apakah token sudah kadaluarsa
    if (!user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
      return res.status(400).json({ message: 'Token has expired. Please request a new reset link.' });
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null, // hapus token setelah dipakai — sekali pakai
        resetTokenExpiry: null,
      },
    });

    return res.status(200).json({ message: 'Password reset successfully. Please login with your new password.' });
  } catch (error) {
    console.error('Reset Password Error:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
