import crypto from 'crypto';
import express from 'express';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { prisma } from '../config/prisma.js';
import { authLimiter } from '../middleware/rateLimit.js';
import { sendLoginCodeEmail } from '../utils/sendEmail.js';

const router = express.Router();

// The frontend URL is used for OAuth redirects and email links. Keep it in one
// place so production/staging deployments only need to change CLIENT_URL.
const frontendURL = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/+$/, '');

// A missing CLIENT_URL in production would send users to localhost after OAuth.
// Make the misconfiguration visible in the server logs during deployment.
if (!process.env.CLIENT_URL) {
  console.warn(
    'CLIENT_URL is not set. Auth redirects will fall back to http://localhost:5173.',
  );
}

// Login codes are short-lived and limited to prevent brute-force attempts.
const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
const OTP_RESEND_COOLDOWN_MS = 60 * 1000; // 1 minute
const OTP_MAX_ATTEMPTS = 5;
const OAUTH_CODE_TTL_MS = 2 * 60 * 1000; // 2 minutes

// Normalize emails so "User@Example.com " and "user@example.com" share one
// account and one OTP record.
const normalizeEmail = (value) => String(value || '').trim().toLowerCase();

// Shape validation only. Actual ownership is proven by the OTP itself. The
// length cap blocks oversized payloads before they reach the database.
const isValidEmail = (email) =>
  email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// A 6-digit code has only one million possibilities. A plain SHA-256 hash would
// be easy to brute-force after a database leak, so use an HMAC with a server
// secret. OTP_SECRET is optional; JWT_SECRET is an acceptable fallback.
const hashSecret = process.env.OTP_SECRET || process.env.JWT_SECRET;

const hashValue = (value) => {
  if (!hashSecret) {
    throw new Error('OTP_SECRET or JWT_SECRET must be configured');
  }
  return crypto.createHmac('sha256', hashSecret).update(String(value)).digest('hex');
};

// Constant-time comparison prevents an attacker from learning a valid code by
// measuring response times.
const hashesMatch = (rawValue, storedHash) => {
  try {
    const incoming = Buffer.from(hashValue(rawValue), 'hex');
    const stored = Buffer.from(storedHash, 'hex');
    return incoming.length === stored.length && crypto.timingSafeEqual(incoming, stored);
  } catch {
    return false;
  }
};

const createJwt = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  // Always return the normalized form so the client never stores a legacy
  // mixed-case address that would fail a future exact-match lookup.
  email: user.email.toLowerCase(),
});

// Same response for existing and non-existing emails. This prevents account
// enumeration while still giving the user actionable instructions.
const GENERIC_CODE_MESSAGE =
  'If the email is valid, a login code has been sent. Check your inbox and spam folder.';
const INVALID_CODE_MESSAGE = 'That code is invalid or has expired. Request a new code.';

/**
 * Step 1 of email login: request a short-lived one-time code.
 *
 * Security notes:
 * - The response never reveals whether the email belongs to an existing user.
 * - A 60-second per-email cooldown stops inbox spam.
 * - Expired codes are cleaned up opportunistically.
 */
router.post('/request-code', authLimiter, async (req, res) => {
  const email = normalizeEmail(req.body?.email);

  if (!isValidEmail(email)) {
    return res.status(400).json({ message: 'Enter a valid email address.' });
  }

  try {
    // Cheap cleanup; avoids needing a separate cron job for expired OTP rows.
    await prisma.loginCode.deleteMany({ where: { expiresAt: { lt: new Date() } } });

    const existingCode = await prisma.loginCode.findUnique({ where: { email } });
    if (
      existingCode &&
      Date.now() - existingCode.createdAt.getTime() < OTP_RESEND_COOLDOWN_MS
    ) {
      // Deliberately return the same message as a real send. The user can retry
      // after a minute, and an attacker cannot use this endpoint to spam inboxes.
      return res.status(200).json({ message: GENERIC_CODE_MESSAGE });
    }

    const code = crypto.randomInt(0, 1_000_000).toString().padStart(6, '0');
    const codeHash = hashValue(code);
    const expiresAt = new Date(Date.now() + OTP_TTL_MS);

    // Upsert guarantees that only the newest code can be used.
    await prisma.loginCode.upsert({
      where: { email },
      create: { email, codeHash, expiresAt },
      update: {
        codeHash,
        expiresAt,
        attempts: 0,
        // Refresh the timestamp so the resend cooldown starts again.
        createdAt: new Date(),
      },
    });

    let delivery;
    try {
      delivery = await sendLoginCodeEmail(email, code);
    } catch (error) {
      // The code is unusable without an email, so remove it and let the user
      // retry immediately instead of waiting for the cooldown.
      await prisma.loginCode.deleteMany({ where: { email } });
      console.error('Send login code error:', error.message);
      return res.status(502).json({
        message: 'Could not send the login code. Please try again or use Google sign-in.',
      });
    }

    if (delivery?.skipped) {
      await prisma.loginCode.deleteMany({ where: { email } });
      return res.status(503).json({
        message: 'Email delivery is not configured. Please use Google sign-in for now.',
      });
    }

    return res.status(200).json({ message: GENERIC_CODE_MESSAGE });
  } catch (error) {
    console.error('Request login code error:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * Step 2 of email login: verify the code and issue the same 7-day JWT used by
 * Google login. A new account is created only after the email is verified.
 */
router.post('/verify-code', authLimiter, async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const code = String(req.body?.code || '').replace(/\s+/g, '');

  if (!isValidEmail(email) || !/^\d{6}$/.test(code)) {
    return res.status(400).json({ message: INVALID_CODE_MESSAGE });
  }

  try {
    const loginCode = await prisma.loginCode.findUnique({ where: { email } });

    if (!loginCode || loginCode.expiresAt.getTime() <= Date.now()) {
      if (loginCode) {
        await prisma.loginCode.delete({ where: { email } }).catch(() => {});
      }
      return res.status(400).json({ message: INVALID_CODE_MESSAGE });
    }

    if (!hashesMatch(code, loginCode.codeHash)) {
      const attempts = loginCode.attempts + 1;
      if (attempts >= OTP_MAX_ATTEMPTS) {
        // Burn the code after too many guesses.
        await prisma.loginCode.delete({ where: { email } }).catch(() => {});
      } else {
        await prisma.loginCode.update({ where: { email }, data: { attempts } });
      }
      return res.status(400).json({ message: INVALID_CODE_MESSAGE });
    }

    // Consume the code atomically. If two requests arrive at the same time,
    // only one deleteMany can remove the row and the other request is rejected.
    const consumed = await prisma.loginCode.deleteMany({
      where: { email, codeHash: loginCode.codeHash },
    });
    if (consumed.count === 0) {
      return res.status(400).json({ message: INVALID_CODE_MESSAGE });
    }

    // Case-insensitive lookup keeps legacy accounts (created before email
    // normalization) usable and prevents a duplicate account on first OTP login.
    let user = await prisma.user.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
    });
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      // A friendly default name from the email local part. The profile can be
      // extended with a rename feature later without blocking sign-up.
      const defaultName =
        email
          .split('@')[0]
          .replace(/[._-]+/g, ' ')
          .trim()
          .replace(/\b\w/g, (character) => character.toUpperCase()) || 'Trackly User';

      user = await prisma.user.create({
        data: { name: defaultName, email, emailVerified: true },
      });
    } else if (!user.emailVerified) {
      // Existing legacy users become verified the first time they prove their
      // email through an OTP.
      user = await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: true },
      });
    }

    return res.status(200).json({
      message: isNewUser ? 'Account created!' : 'Login successful!',
      token: createJwt(user.id),
      isNewUser,
      user: publicUser(user),
    });
  } catch (error) {
    console.error('Verify login code error:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Google OAuth entry point (the button on the login page hits this URL).
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['email', 'profile'],
    prompt: 'select_account',
    session: false,
  }),
);

/**
 * Google OAuth callback.
 *
 * We do NOT put the 7-day JWT in the redirect URL anymore. Instead we create a
 * short-lived, single-use code and redirect with that. The SPA exchanges the
 * code for the JWT via POST /google/exchange, so the long-lived credential
 * never appears in browser history, analytics, or referrer headers.
 */
router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${frontendURL}/login?error=google`,
  }),
  async (req, res) => {
    try {
      // Keep at most one live exchange code per user and clean up expired rows.
      await prisma.oAuthCode.deleteMany({
        where: {
          OR: [{ userId: req.user.id }, { expiresAt: { lt: new Date() } }],
        },
      });

      const rawCode = crypto.randomBytes(32).toString('hex');
      await prisma.oAuthCode.create({
        data: {
          codeHash: hashValue(rawCode),
          userId: req.user.id,
          expiresAt: new Date(Date.now() + OAUTH_CODE_TTL_MS),
        },
      });

      const redirectUrl = new URL('/auth/success', frontendURL);
      redirectUrl.searchParams.set('code', rawCode);
      return res.redirect(redirectUrl.toString());
    } catch (error) {
      console.error('Google callback error:', error.message);
      return res.redirect(`${frontendURL}/login?error=google`);
    }
  },
);

/**
 * Exchange the short-lived Google code for the real JWT. The code is deleted
 * on first use, so a leaked URL cannot be replayed after the SPA exchanges it.
 */
router.post('/google/exchange', authLimiter, async (req, res) => {
  const code = String(req.body?.code || '').trim();

  if (!code) {
    return res.status(400).json({ message: 'Missing sign-in code.' });
  }

  try {
    const oauthCode = await prisma.oAuthCode.findUnique({
      where: { codeHash: hashValue(code) },
      include: { user: true },
    });

    if (!oauthCode || oauthCode.expiresAt.getTime() <= Date.now()) {
      if (oauthCode) {
        await prisma.oAuthCode.delete({ where: { id: oauthCode.id } }).catch(() => {});
      }
      return res.status(400).json({
        message: 'This sign-in link is invalid or has expired. Please try again.',
      });
    }

    // Delete first so even two simultaneous exchange requests cannot both win.
    const consumed = await prisma.oAuthCode.deleteMany({ where: { id: oauthCode.id } });
    if (consumed.count === 0) {
      return res.status(400).json({
        message: 'This sign-in link has already been used. Please try again.',
      });
    }

    return res.status(200).json({
      message: 'Login successful!',
      token: createJwt(oauthCode.user.id),
      user: publicUser(oauthCode.user),
    });
  } catch (error) {
    console.error('Google exchange error:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
