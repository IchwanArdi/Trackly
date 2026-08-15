import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { prisma } from './prisma.js';

// Fungsi untuk menemukan atau membuat user berdasarkan profil dari provider OAuth
const findOrCreateUser = async (profile, provider) => {
  // Ambil informasi yang relevan dari profil
  const providerId = profile.id;
  const email = profile.emails?.[0]?.value;
  const name = profile.displayName;
  const field = `${provider}Id`;

  // Cek apakah user sudah ada berdasarkan providerId
  let user = await prisma.user.findUnique({ where: { [field]: providerId } });
  if (user) return user;

  // Jika user belum ada, cek apakah email sudah ada di database
  if (email) {
    user = await prisma.user.findUnique({ where: { email } });
    // Jika user dengan email sudah ada, update record tersebut dengan providerId
    if (user) {
      return await prisma.user.update({
        where: { email },
        data: { [field]: providerId },
      });
    }
  }

  // Jika user belum ada, buat user baru
  return await prisma.user.create({
    data: {
      name,
      email: email ?? `${providerId}@${provider}.local`,
      [field]: providerId,
    },
  });
};

// Konfigurasi Passport untuk Google OAuth
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    // Callback function untuk menangani login dengan Google
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
