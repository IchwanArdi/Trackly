import crypto from 'crypto';
import express from 'express';
import { prisma } from '../config/prisma.js';
import { hashPassword } from '../utils/encryption.js';
import { sendResetPasswordEmail } from '../utils/sendEmail.js';

const router = express.Router();

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email wajib diisi!' });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // PENTING: jangan bilang "email tidak ditemukan" secara eksplisit.
    // Kalau bocorin info itu, orang jahat bisa "menebak" email mana yang
    // terdaftar di sistem kita (email enumeration attack). Selalu balas
    // pesan yang sama, baik email ketemu atau tidak.
    if (!user) {
      return res.status(200).json({
        message: 'Jika email terdaftar, link reset password telah dikirim.',
      });
      console.log(`Forgot Password Request: Email ${email} tidak ditemukan di database.`);
    }

    // Kalau user ini daftar via Google (gak punya password), gak masuk akal
    // dia minta reset password. Tetap balas pesan generik yang sama.
    if (!user.password) {
      return res.status(200).json({
        message: 'Jika email terdaftar, link reset password telah dikirim.',
      });
      console.log(`Forgot Password Request: Email ${email} tidak memiliki password.`);
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
      message: 'Jika email terdaftar, link reset password telah dikirim.',
    });
  } catch (error) {
    console.error('Forgot Password Error:', error.message);
    return res.status(500).json({ message: 'Terjadi kesalahan internal pada server' });
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
      return res.status(400).json({ message: 'Token dan password baru wajib diisi!' });
    }

    const user = await prisma.user.findUnique({ where: { resetToken: token } });

    if (!user) {
      return res.status(400).json({ message: 'Token tidak valid atau sudah digunakan.' });
    }

    // Cek apakah token sudah kadaluarsa
    if (!user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
      return res.status(400).json({ message: 'Token sudah kadaluarsa. Silakan minta link reset baru.' });
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

    return res.status(200).json({ message: 'Password berhasil direset. Silakan login dengan password baru.' });
  } catch (error) {
    console.error('Reset Password Error:', error.message);
    return res.status(500).json({ message: 'Terjadi kesalahan internal pada server' });
  }
});

export default router;
