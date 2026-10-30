import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const host = '127.0.0.1';
const port = Number.parseInt(process.env.PORT ?? '4198', 10);
const root = resolve(fileURLToPath(new URL('../packages/web_ui/dist/', import.meta.url)));
const types = { '.css': 'text/css; charset=utf-8', '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png' };

function targetFor(url) {
  const pathname = decodeURIComponent(new URL(url, `http://${host}:${port}`).pathname);
  const relative = normalize(pathname).replace(/^([/\\])+/, '');
  let target = resolve(root, relative || 'index.html');
  if (target !== root && !target.startsWith(`${root}${sep}`)) return null;
  if (existsSync(target) && statSync(target).isDirectory()) target = join(target, 'index.html');
  return target;
}

const server = createServer((request, response) => {
  const target = targetFor(request.url ?? '/');
  if (!target || !existsSync(target) || !statSync(target).isFile()) {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Archivo no encontrado');
    return;
  }
  response.writeHead(200, { 'Cache-Control': 'no-store', 'Content-Type': types[extname(target).toLowerCase()] ?? 'application/octet-stream', 'X-Content-Type-Options': 'nosniff' });
  createReadStream(target).pipe(response);
});

server.listen(port, host, () => console.log(`Restaurant OS Fase 0.6: http://${host}:${port}/`));
process.on('SIGINT', () => server.close(() => process.exit(0)));
