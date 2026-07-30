import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import 'dotenv/config'; // Memastikan file .env terbaca dengan baik

// 1. Buat pool koneksi menggunakan driver 'pg' bawaan Node.js
const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL
});

// 2. Bungkus pool tersebut menggunakan Driver Adapter dari Prisma
const adapter = new PrismaPg(pool);

// 3. Masukkan adapter ke dalam constructor PrismaClient
export const prisma = new PrismaClient({ adapter });
