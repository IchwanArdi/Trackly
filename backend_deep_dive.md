# 🏗️ Trackly Backend — Deep Dive Analysis
> Ditulis berdasarkan kode aktual di `d:\Project FullStack\Trackly\server\`
> Tujuan: Bukan sekedar "belajar backend", tapi **memahami mengapa** setiap keputusan desain dibuat

---

## Bagian 1: State of Your Backend — Audit Jujur

Sebelum ngomongin yang ideal, kita lihat dulu apa yang sudah kamu punya dan nilainya secara objektif.

### ✅ Yang Sudah Benar (Production-Ready)

| Aspek | Kode Kamu | Kenapa Ini Bagus |
|---|---|---|
| **Auth Middleware** | `authenticateToken` di `middleware/auth.js` | Verifikasi JWT + DB lookup user = double-check yang solid |
| **Ownership Check** | `findFirst({ where: { id, userId: req.user.id } })` | Di SETIAP mutasi, kamu verifikasi kepemilikan — ini critical |
| **CORS yang tepat** | Regex untuk `*.vercel.app` | Tidak asal `origin: '*'` yang berbahaya |
| **Cookie Security** | `httpOnly: true`, `secure: isProduction`, `sameSite` | Ini setup yang benar untuk OAuth flow |
| **Trust Proxy** | `app.set('trust proxy', 1)` | Diperlukan di Vercel/Render untuk IP detection yang benar |
| **Error Differentiation** | `TokenExpiredError` vs generic 401 | Client bisa handle refresh vs re-login dengan tepat |
| **Prisma Singleton** | Import `{ prisma }` dari satu file config | Tidak membuat multiple DB connections — ini benar |

### ⚠️ Yang Belum Ada (Gap Analysis)

| Gap | Risiko | Level |
|---|---|---|
| Rate limiting | Brute force password, DDoS | 🔴 Critical |
| Input sanitization & validation library | Injection, XSS via stored data | 🔴 Critical |
| Request size limit | Server bisa di-flood dengan body besar | 🟡 High |
| Database query pagination | `findMany()` tanpa limit = OOM di 10k entries | 🟡 High |
| Structured logging | Tidak bisa debug production issues | 🟡 High |
| Database indexes | Query lambat setelah data banyak | 🟡 High |
| Global error handler | Error tidak ter-catch = server crash | 🟡 High |
| Security headers (Helmet) | Banyak HTTP attack vectors terbuka | 🟠 Medium |
| Refresh token mechanism | JWT expired = user harus login ulang | 🟠 Medium |
| Health check endpoint | Tidak bisa tahu server status | 🟠 Medium |

---

## Bagian 2: Arsitektur — Apa yang Terjadi di Balik Layar

### Alur Request Saat Ini (Visualisasi)

```
Client (React)
    │
    │  HTTP Request
    ▼
[Vercel / Internet]
    │
    ▼
Express Server (app.js)
    │
    ├── cors() ──────────────── Cek: apakah origin boleh?
    ├── express.json() ──────── Parse body JSON
    ├── session() ───────────── Session untuk OAuth (Google)
    ├── passport.initialize() ─ Setup OAuth strategy
    │
    ▼
Router (/api/auth, /api/categories, /api/entries)
    │
    ├── [Public routes] ─────── /auth/register, /auth/login, /auth/google
    │
    └── [Protected routes] ──── middleware: authenticateToken
            │
            ├── Baca header "Authorization: Bearer <token>"
            ├── jwt.verify(token, JWT_SECRET) ──── Verifikasi signature
            ├── prisma.user.findUnique() ──────── Cek user masih exist
            └── req.user = user ───────────────── Pass ke route handler
                    │
                    ▼
            Route Handler
                    │
                    └── prisma.xxx.findMany/create/update/delete()
                            │
                            ▼
                    PostgreSQL Database
                            │
                            ▼
                    JSON Response → Client
```

### Kenapa Ada DB Lookup di Auth Middleware?

Ini pertanyaan penting. JWT sudah self-contained — kenapa masih query DB?

```js
// Di auth.js middleware kamu
const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
});
```

**Alasan:** Bayangkan user dihapus dari DB, atau adminnya ban akun. Kalau kamu hanya verifikasi JWT tanpa cek DB, token yang sudah di-issue (valid sampai 7 hari) masih bisa dipakai. Dengan DB lookup, banned user langsung 401.

**Trade-off:** Setiap protected request = 1 DB query extra. Di 1000 req/s, ini 1000 DB queries extra per detik hanya untuk auth.

**Solusi di scale:** Redis cache — simpan user data ke cache dengan TTL 5 menit. Lookup Redis dulu, kalau miss baru ke DB.

---

## Bagian 3: Keamanan — Serangan yang Mungkin Terjadi

### 3.1 Brute Force Attack (🔴 Belum Ada Proteksi)

**Skenario:** Attacker punya email target. Dia coba 10.000 kombinasi password.

```
POST /api/auth/login  ← 10.000x per menit dari IP yang sama
{ email: "target@gmail.com", password: "password1" }
{ email: "target@gmail.com", password: "password2" }
...
```

**Kode kamu sekarang:** Tidak ada apapun yang menghentikan ini.

**Solusi — Rate Limiting dengan `express-rate-limit`:**
```js
import rateLimit from 'express-rate-limit';

// Hanya untuk auth routes — lebih ketat
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 menit
    max: 10,                   // maksimal 10 percobaan login
    message: { message: 'Terlalu banyak percobaan. Coba lagi dalam 15 menit.' },
    standardHeaders: true,
    legacyHeaders: false,
});

router.post('/login', authLimiter, async (req, res) => { ... });
```

**Apa yang terjadi di production:** Setelah 10x gagal, IP tersebut di-block selama 15 menit. Brute force yang butuh 10.000 percobaan akan perlu waktu `(10.000 / 10) × 15 menit = 250 jam`.

---

### 3.2 Mass Assignment / Parameter Pollution

**Skenario:** User nakal kirim field yang tidak seharusnya.

```js
// POST /api/categories
// Yang dikirim attacker:
{
  "name": "Lari",
  "unit": "km",
  "color": "#fff",
  "icon": "Run",
  "userId": "id-user-lain",  // ← injeksi!
  "isAdmin": true             // ← injeksi!
}
```

**Kode kamu sekarang:** Aman, karena kamu manual destructure:
```js
const { name, unit, color, icon } = req.body; // hanya ambil yang perlu
```

Tapi tidak ada validasi **tipe dan format**. Attacker bisa kirim:
```js
{ "name": "", "unit": null, "color": "DROP TABLE users;", "icon": 12345 }
```

**Solusi — Zod atau Joi validation:**
```js
import { z } from 'zod';

const categorySchema = z.object({
    name: z.string().min(1).max(50).trim(),
    unit: z.string().min(1).max(20).trim(),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/), // valid hex color
    icon:  z.string().min(1).max(30),
});

router.post('/', async (req, res) => {
    const result = categorySchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ errors: result.error.flatten() });
    }
    const { name, unit, color, icon } = result.data; // type-safe!
    // ...
});
```

---

### 3.3 IDOR (Insecure Direct Object Reference)

**Ini adalah celah paling umum di API.**

**Skenario:** User A punya entry dengan id `abc-123`. User B tahu id ini (bisa dari network tab) dan coba akses:
```
DELETE /api/entries/abc-123
```

**Kode kamu — Sudah aman!**
```js
const existing = await prisma.entry.findFirst({
    where: { id, userId: req.user.id }, // ← filter by userId!
});
if (!existing) return res.status(404).json(...);
```

User B akan dapat 404 karena entry itu tidak punya `userId: userB.id`. Ini **pattern yang benar** dan kamu sudah melakukannya di semua DELETE dan PUT. ✅

---

### 3.4 JWT Security — Yang Perlu Diketahui

**Token kamu saat ini:**
```js
jwt.sign({ userId: existingUser.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
```

**Masalah:** Tidak ada cara untuk "logout" dari server side. Kalau user klik logout, token dihapus dari localStorage — tapi token itu sendiri masih valid 7 hari. Kalau token dicuri (via XSS), attacker masih punya akses 7 hari penuh.

**Solusi bertingkat:**

**Level 1 (Simple):** Kurangi expiry ke 1 jam, tambah refresh token (14 hari) yang disimpan di httpOnly cookie. Frontend auto-refresh silently.

**Level 2 (Production):** Token blacklist di Redis. Saat logout, simpan `jti` (JWT ID) ke Redis dengan TTL = sisa waktu token. Auth middleware cek Redis sebelum approve.

**Level 3 (Enterprise):** Refresh token rotation — setiap kali token di-refresh, token lama diinvalidate. Kalau ada 2 request dengan token yang sama berarti token dicuri.

---

### 3.5 Security Headers (Helmet)

```js
import helmet from 'helmet';
app.use(helmet());
```

Satu baris ini otomatis menambahkan:
- `X-Content-Type-Options: nosniff` — Cegah MIME type sniffing
- `X-Frame-Options: DENY` — Cegah clickjacking
- `Content-Security-Policy` — Cegah XSS
- `Strict-Transport-Security` — Force HTTPS
- Dan 10+ header security lainnya

---

## Bagian 4: Performa & Skalabilitas

### 4.1 Bottleneck yang PASTI Terjadi — Database Query Tanpa Limit

```js
// entries.js — GET handler kamu saat ini
const entries = await prisma.entry.findMany({
    where,
    orderBy: { date: 'desc' },
    include: { category: { select: {...} } },
});
// ← Tidak ada 'take' (LIMIT)!
```

**Simulasi:** 1 user aktif selama 3 tahun, log harian = `3 × 365 = 1095 entries`. Kalau kamu punya 500 user aktif dan semua hit GET /api/entries bersamaan:

- `500 × 1095 = 547.500` rows di-fetch dari DB
- Di-serialize ke JSON
- Dikirim lewat network

**Server akan OOM (Out of Memory) atau sangat lambat.**

**Solusi — Pagination:**
```js
router.get('/', async (req, res) => {
    const { categoryId, from, to, page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [entries, total] = await prisma.$transaction([
        prisma.entry.findMany({
            where,
            orderBy: { date: 'desc' },
            take: parseInt(limit),
            skip,
            include: { category: { select: {...} } },
        }),
        prisma.entry.count({ where }),
    ]);

    return res.json({
        data: formatted,
        meta: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / parseInt(limit)),
        }
    });
});
```

---

### 4.2 N+1 Query Problem

Ini adalah performance bug yang paling sering terjadi di backend pemula.

**Skenario:** Kamu punya fitur dashboard yang ambil semua kategori + jumlah entries per kategori.

**Cara naif (N+1):**
```js
const categories = await prisma.category.findMany(...); // 1 query
for (const cat of categories) {
    cat.entryCount = await prisma.entry.count({        // N queries!
        where: { categoryId: cat.id }
    });
}
// Kalau ada 10 kategori: 1 + 10 = 11 queries
// Kalau ada 100 kategori: 101 queries
```

**Cara benar (1 query):**
```js
const categories = await prisma.category.findMany({
    where: { userId: req.user.id },
    include: {
        _count: { select: { entries: true } }, // ← Prisma aggregate
    }
});
// 1 query, hasil: [{ name: "Lari", _count: { entries: 45 } }]
```

---

### 4.3 Database Indexes — Kenapa Query Lambat Setelah Data Banyak

Di Prisma schema kamu (perkiraan), tabel Entry ada field `userId` dan `date`. Tapi apakah ada index di sana?

**Tanpa index:** Database baca SEMUA rows dan filter satu-satu. `O(n)`.
**Dengan index:** Database pakai struktur B-tree untuk langsung ke rows yang relevan. `O(log n)`.

**Simulasi:**
- 100 entries: Tidak ada bedanya
- 100.000 entries: Tanpa index = 2 detik, dengan index = 2ms

**Tambahkan ke `schema.prisma`:**
```prisma
model Entry {
  id         String   @id @default(cuid())
  userId     String
  categoryId String
  date       DateTime
  value      Float
  note       String?
  createdAt  DateTime @default(now())

  user     User     @relation(fields: [userId], references: [id])
  category Category @relation(fields: [categoryId], references: [id])

  @@index([userId])             // ← Query by userId cepat
  @@index([userId, date])       // ← Filter userId + date range cepat
  @@index([userId, categoryId]) // ← Filter userId + categoryId cepat
}
```

---

### 4.4 Kapan Node.js Menjadi Bottleneck?

Node.js event loop = **single-threaded**. Artinya, kalau ada kode yang CPU-intensive (bukan I/O), semua request lain akan nunggu.

**Contoh yang blocking:**
```js
// Jangan lakukan ini di Node.js
const result = heavyComputation(data); // loop jutaan kali
// Semua request lain nunggu sampai ini selesai!
```

**Kode kamu (entries, categories):** Aman karena semua operasinya I/O-bound (DB query, network). Node.js sangat baik untuk ini karena bisa handle banyak concurrent I/O tanpa blocking.

**Kapan Node.js TIDAK cocok:** Image processing, video transcoding, ML inference, enkripsi heavy. Untuk ini pakai Worker Thread atau microservice terpisah.

---

## Bagian 5: Cara "Merasakan" Production Load Tanpa User

### 5.1 Load Testing dengan k6

```bash
npm install -g k6
```

**Script `load-test.js`:**
```js
import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
    stages: [
        { duration: '30s', target: 10 },   // Ramp up ke 10 VU
        { duration: '1m',  target: 100 },  // Ramp ke 100 VU
        { duration: '30s', target: 0 },    // Ramp down
    ],
};

export default function () {
    // Simulate login
    const loginRes = http.post('http://localhost:3000/api/auth/login', JSON.stringify({
        email: 'test@example.com',
        password: 'testpassword123'
    }), { headers: { 'Content-Type': 'application/json' } });

    check(loginRes, { 'login status 200': (r) => r.status === 200 });

    const token = loginRes.json('token');

    // Simulate get entries
    const entriesRes = http.get('http://localhost:3000/api/entries', {
        headers: { Authorization: `Bearer ${token}` }
    });

    check(entriesRes, { 'entries status 200': (r) => r.status === 200 });

    sleep(1); // User pause 1 detik
}
```

```bash
k6 run load-test.js
```

**Output yang akan kamu lihat:**
```
✓ login status 200
✓ entries status 200

checks.........................: 100.00% ✓ 5400  ✗ 0
data_received..................: 2.3 MB  23 kB/s
http_req_duration..............: avg=234ms min=45ms  med=210ms max=2.1s  p(90)=450ms p(95)=890ms
http_req_failed................: 0.00%   ✓ 0     ✗ 2700
vus............................: 100     min=0   max=100
```

**Dari sini kamu bisa tahu:**
- Rata-rata response time (`avg=234ms`)
- Worst case response (`max=2.1s`)
- Kapan server mulai kewalahan (response time naik drastis)

---

### 5.2 Monitoring dengan Log yang Benar

**Sekarang kamu pakai:**
```js
console.error('GET /entries error:', error.message);
```

**Yang seharusnya di production:**
```js
import winston from 'winston';

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
    ],
});

// Di route handler
logger.info({
    method: req.method,
    url: req.url,
    userId: req.user?.id,
    duration: Date.now() - startTime,
    statusCode: res.statusCode,
});
```

**Kenapa JSON logging?** Karena log JSON bisa di-ingest ke tools seperti Datadog, Grafana Loki, atau AWS CloudWatch dan kamu bisa query: "semua error dari userId X dalam 1 jam terakhir".

---

### 5.3 Request Timing Middleware

Tambahkan ini untuk tahu mana endpoint yang paling lambat:

```js
// Di app.js, sebelum semua routes
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${req.method} ${req.url} ${res.statusCode} - ${duration}ms`);
        
        // Alert kalau lambat
        if (duration > 1000) {
            console.warn(`⚠️ SLOW REQUEST: ${req.method} ${req.url} took ${duration}ms`);
        }
    });
    next();
});
```

---

## Bagian 6: Arsitektur yang Akan Kamu Perlukan Saat Scale

### Level 1: Sekarang (0-1000 users)
```
[Client] → [Single Express Server] → [PostgreSQL]
```
Ini cukup. Jangan over-engineer.

### Level 2: Growing (1000-50.000 users)
```
[Client] → [Load Balancer (Nginx)] → [Express Server × 2-3] → [PostgreSQL + Read Replica]
                                                             ↘ [Redis Cache]
```

**Yang berubah:**
- Multiple server instance = perlu sticky session atau JWT (kamu sudah pakai JWT ✅)
- Read replica = query SELECT ke replica, INSERT/UPDATE ke primary
- Redis = cache session, cache query results yang sering diakses

### Level 3: Scale Out (50k+ users)
```
[Client] → [CDN] → [API Gateway] → [Auth Service]
                                 → [Activity Service]  → [PostgreSQL Cluster]
                                 → [Analytics Service] → [TimescaleDB]
                                 → [Notification Service] → [Queue (Redis/RabbitMQ)]
```

**Microservices** — setiap domain punya server sendiri. Tapi ini juga kompleksitas jauh lebih tinggi. Untuk Trackly, Level 1 akan cukup bertahun-tahun.

---

## Bagian 7: Roadmap — Apa yang Harus Dilakukan Selanjutnya

Urut berdasarkan prioritas dan dampak pembelajaran:

### 🔴 Segera (Security Critical)
1. **Pasang `express-rate-limit`** di `/api/auth/login` dan `/api/auth/register`
2. **Pasang `helmet`** di `app.js`
3. **Tambah body size limit**: `app.use(express.json({ limit: '10kb' }))`
4. **Pasang Zod validation** di minimal auth routes

### 🟡 Berikutnya (Reliability)
5. **Global error handler** di akhir `app.js`:
   ```js
   app.use((err, req, res, next) => {
       console.error(err.stack);
       res.status(500).json({ message: 'Internal Server Error' });
   });
   ```
6. **Pagination** di `GET /api/entries`
7. **Database indexes** di schema.prisma

### 🟠 Untuk Belajar (Intermediate)
8. **Request timing middleware** — pahami mana yang lambat
9. **Load test dengan k6** — rasakan bottleneck
10. **Structured logging dengan Winston**

### 🟢 Advanced (Untuk Ambisi)
11. **Refresh token** + **token blacklist dengan Redis**
12. **Database query optimization** dengan `EXPLAIN ANALYZE` di PostgreSQL
13. **Caching layer** untuk data yang sering diakses

---

## Penutup: Mental Model yang Paling Penting

> **"Kamu tidak perlu 1000 user untuk belajar. Kamu butuh 1 request yang kamu trace dari ujung ke ujung — middleware, route, DB query, response — dan pahami setiap microsecond-nya."**

Yang membuat backend engineer handal bukan jumlah user-nya. Tapi **kemampuan membaca sistem** — melihat `console.log` dan tahu bahwa DB query itu butuh 300ms karena tidak ada index, lalu fix, lalu verify jadi 2ms.

Tool yang akan membuat perbedaan:
- **Prisma Studio** → lihat data DB secara visual
- **Thunder Client / Postman** → test API manual dengan detail
- **k6** → simulate load
- **`EXPLAIN ANALYZE`** → debug query PostgreSQL
- **Node.js `--inspect`** → profiling CPU/memory
