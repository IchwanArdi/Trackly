# Trackly

> A streamlined, privacy-first personal activity & habit tracking application.

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Express.js](https://img.shields.io/badge/Express-5.2-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-7.9-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-DB-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

**Live app:** [tracklyid.vercel.app](https://tracklyid.vercel.app) · **API:** [trackly-server.vercel.app](https://trackly-server.vercel.app) · **Author:** [Ichwan Ardi](https://github.com/IchwanArdi)

---

## 📌 Overview

**Trackly** is a modern full-stack web application for recording daily activities, tracking personal target metrics, and visualizing long-term consistency. It pairs a responsive React 19 single-page client with an Express + Prisma backend, so users can log activities quickly, create custom categories, and review streak and heatmap analytics without friction.

The public site is also built to be discoverable: every marketing page is prerendered to static HTML, carries page-specific Open Graph and JSON-LD metadata, and is listed in a sitemap. Private app routes are explicitly excluded from search indexes.

---

## ✨ Key Features

- **🔐 Passwordless Authentication**: One-time email codes plus Google OAuth 2.0 via Passport.js, with JWT sessions.
- **🏷️ Custom Categories**: Personalized units, colors, and icons for each routine.
- **⚡ Rapid Daily Logging**: Quick increments, notes, and date selection.
- **📊 Analytics & Heatmaps**: Annual activity trends, totals, streaks, and contribution heatmaps with Recharts.
- **📸 Share Cards**: Generate downloadable progress images with `html-to-image`.
- **📱 Installable PWA**: Installable app shell with a custom service worker and push reminders.
- **🔎 SEO & AI Discoverability**: Prerendered public pages, canonical URLs, Open Graph, Twitter Cards, FAQ/SoftwareApplication JSON-LD, `robots.txt`, `sitemap.xml`, `llms.txt`, and Markdown page versions.
- **📈 Privacy-Conscious Measurement**: Optional GA4 events with query strings stripped, plus real-user Core Web Vitals reporting.
- **🛡️ Security**: Helmet headers, rate limiting, Zod validation, and JWT-protected API routes.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS v4, custom CSS design system
- **State & Routing**: Context API, React Router v7
- **UI & Animation**: Lucide Icons, Framer Motion, React Toastify, Recharts
- **Head & Structured Data**: `@unhead/react`, `@unhead/schema-org`
- **Analytics**: GA4 events and `web-vitals`
- **Build-time SEO**: Puppeteer prerendering + Lighthouse CI

### Backend & Database
- **Runtime**: Node.js (ES Modules), Express 5
- **Database ORM**: Prisma 7 with PostgreSQL (`@prisma/adapter-pg`)
- **Authentication**: Passport.js (Google OAuth 2.0), passwordless email OTP, JSON Web Tokens
- **Email**: Resend
- **Security & Validation**: Helmet, Express Rate Limit, Zod

### Deployment
- **Platform**: Vercel (prerendered frontend + serverless Node.js API)
- **CI**: GitHub Actions + Lighthouse CI

---

## 🚀 Getting Started

### Prerequisites
- **Node.js 22+** (required by Puppeteer and Lighthouse CI)
- PostgreSQL database (Supabase, Neon, or local)

### Environment Setup

Create `.env` files in both `server/` and `client/`.

#### Backend (`server/.env`)
```env
DATABASE_URL=
DIRECT_URL=
PORT=5000
NODE_ENV=development
JWT_SECRET=
OTP_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=
RESEND_API_KEY=
RESEND_FROM_EMAIL=Trackly <noreply@trackly.web.id>
CLIENT_URL=http://localhost:5173
```

`OTP_SECRET` is optional; when omitted, the server falls back to `JWT_SECRET`. Set a separate random value in production.
`RESEND_FROM_EMAIL` must use a sender domain that is verified in Resend.

The server's `vercel-build` runs `prisma migrate deploy` before `prisma generate`, so production schema changes are applied automatically. Keep `DIRECT_URL` available during the Vercel build.

#### Frontend (`client/.env`)
```env
VITE_API_URL=http://localhost:5000
VITE_SITE_URL=https://tracklyid.vercel.app
VITE_GA_MEASUREMENT_ID=
VITE_VAPID_PUBLIC_KEY=
```

`VITE_GA_MEASUREMENT_ID` may stay empty locally. Analytics helpers become no-ops when it is not set.

### Installation & Local Execution

1. **Clone the repository**
   ```bash
   git clone https://github.com/IchwanArdi/Trackly.git
   cd Trackly
   ```

2. **Start the backend**
   ```bash
   cd server
   npm install
   npx prisma generate
   npx prisma migrate dev
   npm start
   ```

3. **Start the frontend** (in a second terminal)
   ```bash
   cd client
   npm install
   npm run dev
   ```

4. Open `http://localhost:5173`.

---

## 🧪 Frontend Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start Vite with HMR |
| `npm run build` | Type-check and build the SPA |
| `npm run build:seo` | Build, then prerender public pages with Puppeteer |
| `npm run prerender` | Re-run prerendering against an existing `dist/` |
| `npm run preview` | Preview the built SPA |
| `npm run lint` | Run ESLint |
| `npx lhci autorun` | Run Lighthouse CI locally |

`build:seo` is the production build command configured in `client/vercel.json`. It writes real HTML for `/`, `/help`, `/privacy-policy`, `/terms-of-service`, and `/data-deletion`, and refreshes `dist/sitemap.xml` with the build date.

---

## 🔎 SEO & Analytics Setup

The public pages are prerendered, so search engines and AI crawlers receive complete HTML without executing JavaScript.

1. **Set the production origin** in Vercel: `VITE_SITE_URL=https://tracklyid.vercel.app`.
2. **Create a GA4 property** and set `VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX` in Vercel. Events tracked include `page_view`, `sign_up`, `login` (`email_otp` or `google`), `create_category`, `log_entry`, `share_card`, `install_pwa`, `cta_click`, and `web_vitals`.
3. **Verify the site in Google Search Console** using the DNS or HTML tag method, then submit `https://tracklyid.vercel.app/sitemap.xml`.
4. Optionally submit the sitemap to Bing Webmaster Tools.
5. Run `npx lhci autorun` inside `client/` to check performance, accessibility, best practices, and SEO locally.

Static discovery files live in `client/public/`:

- `robots.txt` — allows public pages and excludes private app routes
- `sitemap.xml` — regenerated during `build:seo`
- `llms.txt` — short site guide for AI agents and tooling
- `llms-full.txt` — all public content in one plain-text file
- `*.md` — Markdown versions of each public page
- `favicon.ico` + `favicon-48x48.png`, `favicon-96x96.png`, `favicon-144x144.png` — Google Search favicon set. Google supports ICO/PNG (not SVG), so keep these PNG links stable and at least 48px.

> `llms.txt` is an emerging convention, not a Google ranking factor. The real SEO wins come from prerendered HTML, canonical URLs, structured data, and a valid sitemap.
>
> Google can take days to weeks to refresh a favicon. `WebSite` structured data plus `og:site_name` and `alternateName` help Google choose the brand name instead of the hosting-provider fallback.

Private routes (`/dashboard`, `/log`, `/history`, `/categories`, `/profile`, and auth pages) send `noindex` meta tags and `X-Robots-Tag` headers, and are excluded from the sitemap.

---

## 📁 Project Structure

```
Trackly/
├── .github/workflows/      # Lighthouse CI workflow
├── .agents/                # Shared agent skills (hallmark)
├── client/                 # React 19 + TypeScript frontend
│   ├── public/             # Static assets, robots.txt, sitemap, llms.txt, Markdown pages
│   ├── scripts/            # Puppeteer prerender + static dist server
│   ├── src/
│   │   ├── components/     # UI, layout, analytics page-view tracker, route SEO
│   │   ├── lib/            # SEO helpers (meta, canonical, JSON-LD)
│   │   ├── pages/          # Application routes and public pages
│   │   ├── store/          # React Context state management
│   │   └── utils/          # API client, auth, analytics, web vitals
│   ├── .lighthouserc.json
│   ├── vercel.json
│   └── package.json
├── server/                 # Node.js + Express 5 backend
│   ├── prisma/             # Database schema and migrations
│   ├── src/
│   │   ├── config/         # Prisma client and Passport strategies
│   │   ├── middleware/     # Rate limiter and security handlers
│   │   ├── routes/         # Express API endpoints
│   │   └── utils/          # Hashing and email utilities
│   └── package.json
└── api.json                # Postman API collection
```

---

## 📄 License

This project is licensed under the [ISC License](https://opensource.org/licenses/ISC).
