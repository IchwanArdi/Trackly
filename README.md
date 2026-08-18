# Trackly

> A streamlined, privacy-first personal activity & habit tracking application.

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.1-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Express.js](https://img.shields.io/badge/Express-5.2-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-7.9-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-DB-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

---

## 📌 Overview

**Trackly** is a modern full-stack web application designed for recording daily activities, tracking personal target metrics, and visualizing long-term consistency. Built with a responsive React 19 single-page client and an Express + Prisma backend, Trackly enables rapid activity logging, custom category creation, and interactive timeline analytics without friction.

---

## ✨ Key Features

- **🔐 Dual Authentication**: Secure email/password login (with Bcrypt hashing and JWT session handling) alongside Google OAuth 2.0 integration via Passport.js.
- **📧 Password Recovery**: Automated transactional password reset flow integrated with the Resend API.
- **🏷️ Custom Categories**: Define custom activity categories with personalized measurement units, color badges, and icons.
- **⚡ Rapid Daily Logging**: Update daily numbers in seconds with custom increments, notes, and date pickers.
- **📊 Interactive Analytics & Heatmaps**: Visualize annual activity trends, summary totals, and streak history using Recharts data visualization.
- **📸 Card Export**: Generate and download visual activity summary cards directly from the browser using `html-to-image`.
- **🛡️ Rate-Limiting & Security**: API protection powered by Helmet HTTP headers and Express Rate Limit middleware.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS v4, Vanilla CSS design system
- **State & Routing**: Context API, React Router v7
- **UI & Animations**: Lucide Icons, Framer Motion, React Toastify, Recharts

### Backend & Database
- **Runtime**: Node.js (ES Modules), Express 5
- **Database ORM**: Prisma 7 with PostgreSQL (`@prisma/adapter-pg`)
- **Authentication**: Passport.js (Google OAuth 2.0), JSON Web Tokens (`jsonwebtoken`), Bcrypt
- **Email Service**: Resend Mailer API
- **Security & Validation**: Helmet, Express Rate Limit, Zod

### Deployment
- **Platform**: Vercel (Frontend SPA & Serverless Node.js API)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- PostgreSQL Database instance (e.g., Supabase, Neon, or local PostgreSQL)

---

### Environment Setup

Create `.env` files in both the `server/` and `client/` directories based on the required variable names below:

#### Backend (`server/.env`)
```env
DATABASE_URL=
DIRECT_URL=
PORT=5000
NODE_ENV=development
JWT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=
RESEND_API_KEY=
CLIENT_URL=http://localhost:5173
```

#### Frontend (`client/.env`)
```env
VITE_API_URL=http://localhost:5000
```

---

### Installation & Local Execution

1. **Clone the repository**:
   ```bash
   git clone https://github.com/IchwanArdi/Trackly.git
   cd Trackly
   ```

2. **Start Backend Server**:
   ```bash
   cd server
   npm install
   npx prisma generate
   npx prisma db push
   npm start
   ```

3. **Start Frontend Client** (in a separate terminal window):
   ```bash
   cd client
   npm install
   npm run dev
   ```

4. Open `http://localhost:5173` in your browser to view the application.

---

## 📁 Project Structure

```
Trackly/
├── client/                 # React 19 + TypeScript Frontend (Vite)
│   ├── public/             # Static assets, icons, and banners
│   ├── src/
│   │   ├── components/     # UI components & layout structures
│   │   ├── pages/          # Application routes & views
│   │   ├── store/          # React Context state management
│   │   └── utils/          # API client & auth helper utilities
│   └── package.json
├── server/                 # Node.js + Express 5 Backend
│   ├── prisma/             # Database schema & migrations
│   ├── src/
│   │   ├── config/         # Prisma client & Passport strategies
│   │   ├── middleware/     # Rate limiter & security handlers
│   │   ├── routes/         # Express API endpoints
│   │   └── utils/          # Hashing & email mailer utilities
│   └── package.json
└── api.json                # Postman API Collection
```

---

## 📄 License

This project is licensed under the [ISC License](https://opensource.org/licenses/ISC).
