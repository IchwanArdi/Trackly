import express from 'express';
import cors from 'cors';
import session from 'express-session';
import dotenv from 'dotenv';
import passport from 'passport';
import './src/config/passport.js';
import authRoutes from './src/routes/auth.js';
import categoriesRoutes from './src/routes/categories.js';
import entriesRoutes from './src/routes/entries.js';
import userRoutes from './src/routes/user.js';

const app = express();
dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

// Middleware untuk parsing JSON
app.use(express.json());

// Middleware untuk CORS
app.use(
  cors({
    origin: ['http://localhost:5173', 'https://thetrackly.vercel.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }),
);

// Wajib diaktifkan jika backend dideploy di platform seperti Render, Railway, Vercel, atau Heroku
app.set('trust proxy', 1);

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'supersecretkey',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: isProduction, // true jika di production (HTTPS), false jika di localhost (HTTP)
      httpOnly: true, // Mencegah akses cookie dari JavaScript client-side (XSS Protection)
      sameSite: isProduction ? 'none' : 'lax', // 'none' wajib untuk cross-domain cookies di production
    },
  }),
);

app.use(passport.initialize());

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Trackly Backend Berjalan' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/entries', entriesRoutes);
app.use('/api/users', userRoutes);

export default app;
