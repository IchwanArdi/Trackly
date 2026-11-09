import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { prisma } from './prisma.js';

/**
 * Find or create a user from a Google profile.
 *
 * Account linking is only allowed when Google explicitly says the email is
 * verified. Without this check, an attacker could create a Google account with
 * a victim's email (if Google ever allowed an unverified address) and take over
 * the existing Trackly account.
 */
const findOrCreateUser = async (profile, provider) => {
  const providerId = profile.id;
  const email = profile.emails?.[0]?.value?.trim().toLowerCase();
  // `verified` is normally true for Gmail addresses. Treat only an explicit
  // `false` as unsafe so older Passport profile shapes keep working. An email
  // must also exist before it can count as verified.
  const emailVerified = Boolean(email) && profile.emails?.[0]?.verified !== false;
  const name = profile.displayName?.trim() || email?.split('@')[0] || 'Trackly User';
  const field = `${provider}Id`;

  // 1. Returning provider user: the provider id is the strongest identifier.
  let user = await prisma.user.findUnique({ where: { [field]: providerId } });
  if (user) {
    // Existing Google users predate the emailVerified field. Mark them as
    // verified on their next login instead of requiring a second flow.
    if (emailVerified && !user.emailVerified) {
      return await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: true },
      });
    }
    return user;
  }

  // 2. Link to an existing Trackly account with the same email, but only when
  //    Google has verified ownership of that email.
  if (email) {
    // Legacy rows may still have mixed-case emails. Match case-insensitively
    // before creating a new account, otherwise Google login could duplicate it.
    user = await prisma.user.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
    });
    if (user) {
      if (!emailVerified) {
        throw new Error('Google account email is not verified');
      }

      return await prisma.user.update({
        // Use the primary key: the lookup above is case-insensitive, but the
        // stored email may still have legacy casing.
        where: { id: user.id },
        data: { [field]: providerId, emailVerified: true },
      });
    }
  }

  // 3. New user. The fallback address is only used if Google omitted an email;
  //    it is marked unverified so it can never be silently linked later.
  return await prisma.user.create({
    data: {
      name,
      email: email ?? `${providerId}@${provider}.local`,
      [field]: providerId,
      emailVerified: Boolean(email && emailVerified),
    },
  });
};

// Passport Google OAuth configuration.
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      proxy: true,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await findOrCreateUser(profile, 'google');
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    },
  ),
);

export default passport;
