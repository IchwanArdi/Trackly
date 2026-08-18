import crypto from 'crypto';
import express from 'express';
import { prisma } from '../config/prisma.js';
import { hashPassword } from '../utils/encryption.js';
import { sendResetPasswordEmail } from '../utils/sendEmail.js';
import { authLimiter } from '../middleware/rateLimit.js';

const router = express.Router();

// Helper untuk melakukan enkripsi satu arah (hash) pada token
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

// REQUEST FORGOT PASSWORD
router.post('/forgot-password', authLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    const genericMessage = { message: 'If the email is registered, a password reset link has been sent.' };

    if (!email) {
      return res.status(400).json({ message: 'Email is required!' });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // Anti-Enumeration & Proteksi Google OAuth Akun
    if (!user || !user.password) {
      return res.status(200).json(genericMessage);
    }

    // Pembuatan Token Berumur Pendek
    const rawResetToken = crypto.randomBytes(32).toString('hex');
    const secureHashedToken = hashToken(rawResetToken);
    const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 menit

    await prisma.user.update({
      where: { email },
      data: {
        resetToken: secureHashedToken,
        resetTokenExpiry,
      },
    });

    const frontendURL = process.env.NODE_ENV === 'production' ? 'https://thetrackly.vercel.app' : 'http://localhost:5173';

    // email, kirim token mentah asli (bukan versi hash)
    const resetLink = `${frontendURL}/reset-password?token=${rawResetToken}`;

    // Jalankan pengiriman email di latar belakang
    sendResetPasswordEmail(user.email, resetLink).catch((err) =>
      console.error('Background Email Error:', err.message)
    );

    return res.status(200).json(genericMessage);
  } catch (error) {
    console.error('Forgot Password Error:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// EXECUTE RESET PASSWORD
// token ditaruh di dalam body JSON agar tidak bocor ke log server
router.post('/reset-password', authLimiter, async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required!' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long!' });
    }

    // Hash token dari user terlebih dahulu sebelum dicocokkan dengan database
    const secureHashedToken = hashToken(token);

    const user = await prisma.user.findUnique({ where: { resetToken: secureHashedToken } });


    if (!user) {
      return res.status(400).json({ message: 'Token is invalid or has been used.' });
    }

    // Validasi Kedaluwarsa Token
    if (!user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
      return res.status(400).json({ message: 'Token has expired. Please request a new reset link.' });
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,       // Sekali pakai (Langsung hangus)
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
