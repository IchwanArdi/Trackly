import rateLimit from 'express-rate-limit';

// Hanya untuk auth routes — lebih ketat
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 10, // maksimal 10 percobaan login
  message: { message: 'Terlalu banyak percobaan. Coba lagi dalam 15 menit.' },
  standardHeaders: true,
  legacyHeaders: false,
});
