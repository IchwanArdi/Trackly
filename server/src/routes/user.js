import express from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { authenticateToken } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimit.js';

const router = express.Router();


// Route Delete User
router.delete('/me', authenticateToken, async (req, res) => {

  const userId = req.user.id;
  try {
    await prisma.user.delete({
      where: { id: userId },
    });

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('DELETE /users/me error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Route Feedback
router.post('/feedback', authLimiter, async (req, res) => {
  const { category, message } = req.body;

  // Validasi Zod
  const feedbackSchema = z.object({

    message: z.string()
      .min(3, 'Feedback must be at least 3 characters long')
      .max(200, 'Feedback must be less than 200 characters long')
      .trim(),
  });

  const validation = feedbackSchema.safeParse({ message });

  if (!validation.success) {
    const firstError = validation.error.issues?.[0]?.message || 'Invalid input data';
    return res.status(400).json({ message: firstError });
  }

  try {
    await prisma.feedback.create({
      data: {
        category,
        message,
      },
    });

    res.status(200).json({ message: 'Thank you for your feedback!' });
  } catch (error) {
    console.error('Error creating feedback:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
