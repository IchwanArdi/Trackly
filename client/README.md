# Trackly Client

React 19 + TypeScript + Vite frontend for [Trackly](https://tracklyid.vercel.app).

## Commands

```bash
npm install
npm run dev          # local development
npm run build        # type-check + Vite build
npm run build:seo    # build + prerender public pages
npm run prerender    # prerender an existing dist/
npm run preview      # preview the built SPA
npm run lint         # ESLint
npx lhci autorun     # Lighthouse CI
```

## Environment

Copy `.env.example` to `.env` and fill in the values:

```env
VITE_API_URL=http://localhost:5000
VITE_SITE_URL=https://tracklyid.vercel.app
VITE_GA_MEASUREMENT_ID=
VITE_VAPID_PUBLIC_KEY=
```

`VITE_GA_MEASUREMENT_ID` is optional. Without it, analytics and Web Vitals calls are no-ops.

Production defaults live in `.env.production`; Vercel environment variables override them.

## SEO Architecture

- `src/lib/seo.ts` — `useSeo()`, `useAppSeo()`, and `useTracklySchema()`.
  - `useSeo()` sets title, description, canonical, Open Graph, Twitter Cards, robots, and a Markdown alternate link.
  - `useAppSeo()` marks private/auth routes as `noindex, nofollow`.
  - `useTracklySchema()` emits a shared Schema.org graph: `WebSite`, `WebPage`, `SoftwareApplication`, `Organization`, optional `FAQPage`, and `ImageObject`.
- `src/components/AnalyticsPageView.tsx` — one GA4 `page_view` per SPA navigation.
- `src/components/RouteSeo.tsx` — noindex + titles for private routes.
- `scripts/prerender.mjs` — builds static HTML for `/`, `/help`, `/privacy-policy`, `/terms-of-service`, and `/data-deletion` with Puppeteer.
- `public/robots.txt`, `public/sitemap.xml`, `public/llms.txt`, `public/llms-full.txt`, and `public/*.md` — static discovery files.

The prerenderer starts from a clean Vite shell for each route, waits for React to render, and writes `dist/<route>/index.html`. This means crawlers get the real page content and head tags even when JavaScript is disabled.

## Notes

- `build:seo` is the Vercel build command (`client/vercel.json`).
- Lighthouse CI runs on GitHub Actions via `.github/workflows/lighthouse.yml`.
- The current thresholds are: SEO ≥ 0.95 (error), performance/accessibility/best-practices ≥ 0.8/0.9 (warnings).
- Local Lighthouse runs may log a CORS console error because the live API allows the production origin, not `http://127.0.0.1:4173`.
