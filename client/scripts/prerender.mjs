import { createServer } from 'node:http';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '..', 'dist');
const host = '127.0.0.1';
const port = 4173;
const origin = `http://${host}:${port}`;
const SITE_URL = 'https://tracklyid.vercel.app';

const ROUTES = [
  { path: '/', output: 'index.html' },
  { path: '/help', output: 'help/index.html' },
  { path: '/privacy-policy', output: 'privacy-policy/index.html' },
  { path: '/terms-of-service', output: 'terms-of-service/index.html' },
  { path: '/data-deletion', output: 'data-deletion/index.html' },
];

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
};

function safePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  const normalized = path.normalize(decoded).replace(/^(\.\.[/\\])+/, '');
  return path.join(distDir, normalized);
}

async function readFileOrFallback(filePath) {
  try {
    return { data: await fs.readFile(filePath), filePath };
  } catch {
    // Directory index: /help -> dist/help/index.html
    try {
      const indexPath = path.join(filePath, 'index.html');
      return { data: await fs.readFile(indexPath), filePath: indexPath };
    } catch {
      // SPA fallback: unknown routes get the app shell.
      const shellPath = path.join(distDir, 'index.html');
      return { data: await fs.readFile(shellPath), filePath: shellPath };
    }
  }
}

async function writeSitemap() {
  const lastmod = new Date().toISOString().slice(0, 10);
  const urls = ROUTES.map(({ path: routePath }) => {
    const priority = routePath === '/' ? '1.0' : routePath === '/help' ? '0.7' : '0.3';
    const changefreq = routePath === '/' ? 'weekly' : routePath === '/help' ? 'monthly' : 'yearly';
    const loc = routePath === '/' ? `${SITE_URL}/` : `${SITE_URL}${routePath}`;
    return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
  }).join('\n');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  await fs.writeFile(path.join(distDir, 'sitemap.xml'), sitemap, 'utf8');
  console.log('Updated dist/sitemap.xml');
}

async function launchBrowser() {
  const args = ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'];

  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    return puppeteer.launch({
      headless: true,
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
      args,
    });
  }

  try {
    return await puppeteer.launch({ headless: true, args });
  } catch (error) {
    // Vercel's build container does not ship the shared libraries required by
    // Puppeteer's bundled Chrome. Fall back to the serverless Chromium build.
    if (process.platform !== 'linux') throw error;

    console.warn('Bundled Chromium failed to launch. Falling back to @sparticuz/chromium.');
    console.warn(error instanceof Error ? error.message : error);

    const { default: chromium } = await import('@sparticuz/chromium');
    const executablePath = await chromium.executablePath();
    return puppeteer.launch({
      args: chromium.args,
      executablePath,
      headless: chromium.headless,
    });
  }
}

async function main() {
  const shellPath = path.join(distDir, 'index.html');
  const shellHtml = await fs.readFile(shellPath, 'utf8');

  const server = createServer(async (req, res) => {
    try {
      const filePath = safePath(req.url || '/');
      const { data, filePath: resolvedPath } = await readFileOrFallback(filePath);
      const ext = path.extname(resolvedPath).toLowerCase();
      res.setHeader('Content-Type', MIME_TYPES[ext] || 'application/octet-stream');
      res.end(data);
    } catch (error) {
      console.error('Static server error:', error);
      res.statusCode = 500;
      res.end('Internal server error');
    }
  });

  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, host, resolve);
  });
  console.log(`Static server ready at ${origin}`);

  const browser = await launchBrowser();

  let landingHtml = '';

  try {
    for (const route of ROUTES) {
      // Always start from a clean Vite shell so head tags and JSON-LD from a
      // previous route cannot leak into the next prerendered page.
      await fs.writeFile(shellPath, shellHtml, 'utf8');

      const page = await browser.newPage();
      await page.setViewport({ width: 1280, height: 900 });
      await page.setCacheEnabled(false);
      await page.setRequestInterception(true);

      page.on('request', (request) => {
        const url = request.url();
        // Keep build-time prerendering out of analytics and avoid service
        // worker caching across routes.
        if (url.includes('googletagmanager.com') || url.endsWith('/sw.js')) {
          request.abort();
          return;
        }
        request.continue();
      });

      page.on('pageerror', (error) => {
        console.warn(`[${route.path}] page error:`, error.message);
      });

      const url = `${origin}${route.path}`;
      console.log(`Prerendering ${url}`);
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForFunction(() => (document.querySelector('#root')?.children.length ?? 0) > 0, {
        timeout: 20000,
      });
      await page.waitForSelector('h1', { timeout: 10000 });
      // Give Unhead one frame to flush title/meta/JSON-LD into <head>.
      await new Promise((resolve) => setTimeout(resolve, 500));

      const html = await page.content();
      await page.close();

      if (route.path === '/') {
        landingHtml = html;
      } else {
        const outputPath = path.join(distDir, route.output);
        await fs.mkdir(path.dirname(outputPath), { recursive: true });
        await fs.writeFile(outputPath, html, 'utf8');
        console.log(`Wrote dist/${route.output.replaceAll('\\', '/')}`);
      }
    }

    if (!landingHtml) {
      throw new Error('Landing page was not prerendered.');
    }
    await fs.writeFile(shellPath, landingHtml, 'utf8');
    console.log('Wrote dist/index.html');
    await writeSitemap();
  } finally {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
}

main().catch((error) => {
  console.error('Prerender failed:', error);
  process.exitCode = 1;
});
