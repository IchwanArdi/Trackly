import { createServer } from 'node:http';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '..', 'dist');
const port = Number(process.env.PORT || 4173);
const host = process.env.HOST || '127.0.0.1';

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
  '.map': 'application/json; charset=utf-8',
};

function safePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  const normalized = path.normalize(decoded).replace(/^(\.\.[/\\])+/, '');
  return path.join(distDir, normalized);
}

async function resolveFile(filePath) {
  try {
    return { data: await fs.readFile(filePath), filePath };
  } catch {
    try {
      const indexPath = path.join(filePath, 'index.html');
      return { data: await fs.readFile(indexPath), filePath: indexPath };
    } catch {
      const shellPath = path.join(distDir, 'index.html');
      return { data: await fs.readFile(shellPath), filePath: shellPath };
    }
  }
}

const server = createServer(async (req, res) => {
  try {
    const { data, filePath } = await resolveFile(safePath(req.url || '/'));
    const ext = path.extname(filePath).toLowerCase();
    res.setHeader('Content-Type', MIME_TYPES[ext] || 'application/octet-stream');
    res.end(data);
  } catch (error) {
    console.error('Static server error:', error);
    res.statusCode = 500;
    res.end('Internal server error');
  }
});

server.listen(port, host, () => {
  console.log(`Serving dist at http://${host}:${port}`);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    server.close(() => process.exit(0));
  });
}
