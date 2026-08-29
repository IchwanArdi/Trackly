
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import passport from 'passport';
import helmet from 'helmet';
import './src/config/passport.js';
import authRoutes from './src/routes/auth.js';
import categoriesRoutes from './src/routes/categories.js';
import entriesRoutes from './src/routes/entries.js';
import userRoutes from './src/routes/user.js';
import resetPasswordRoutes from './src/routes/resetPassword.js';
import pushRoutes from './src/routes/push.js';
import cronRoutes from './src/routes/cron.js';

dotenv.config();
const app = express();

const isProduction = process.env.NODE_ENV === 'production';

// KEAMANAN & PARSING DATA
app.use(helmet());
app.use(express.json());

// KONFIGURASI CORS
const allowedOrigins = ['http://localhost:5173', process.env.CLIENT_URL].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || /^https:\/\/trackly[\w-]*\.vercel\.app$/i.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy does not allow access from ${origin}`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options(/(.*)/, cors(corsOptions));

app.set('trust proxy', 1);

app.use(passport.initialize());

// LOG PENCATAT KECEPATAN
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.url} ${res.statusCode} - ${duration}ms`);

    if (duration > 1000) {
      console.warn(`⚠️ SLOW REQUEST: ${req.method} ${req.url} took ${duration}ms`);
    }
  });
  next();
});

// SEMUA ROUTE API UTAMA
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Trackly Backend Berjalan' });
});

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/entries', entriesRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', resetPasswordRoutes);
app.use('/api/push', pushRoutes);
app.use('/api/cron', cronRoutes);

// JARING PENGAMAN EROR
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

export default app;
