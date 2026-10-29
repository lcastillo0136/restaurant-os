import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const host = '127.0.0.1';
const port = Number.parseInt(process.env.PORT ?? '4190', 10);
const repositoryRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const publicRoot = resolve(repositoryRoot, 'design', 'mockups', 'phase-0.4');

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

function resolveRequestPath(url) {
  const pathname = decodeURIComponent(new URL(url, `http://${host}:${port}`).pathname);
  const relativePath = normalize(pathname).replace(/^([/\\])+/, '');
  let target = resolve(publicRoot, relativePath || 'index.html');
  if (target !== publicRoot && !target.startsWith(`${publicRoot}${sep}`)) return null;
  if (existsSync(target) && statSync(target).isDirectory()) target = join(target, 'index.html');
  return target;
}

const server = createServer((request, response) => {
  const target = resolveRequestPath(request.url ?? '/');
  if (!target || !existsSync(target) || !statSync(target).isFile()) {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Archivo no encontrado');
    return;
  }

  response.writeHead(200, {
    'Cache-Control': 'no-store',
    'Content-Type': contentTypes[extname(target).toLowerCase()] ?? 'application/octet-stream',
    'X-Content-Type-Options': 'nosniff',
  });
  createReadStream(target).pipe(response);
});

server.listen(port, host, () => {
  console.log(`Restaurant OS Fase 0.4: http://${host}:${port}/`);
  console.log('Pulsa Ctrl+C para detener el servidor.');
});

process.on('SIGINT', () => server.close(() => process.exit(0)));
