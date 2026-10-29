import { execFileSync } from 'node:child_process';
import { readFileSync, statSync } from 'node:fs';
import { extname, normalize, sep } from 'node:path';

const root = process.cwd();
const output = execFileSync('git', ['ls-files', '--cached', '-z'], {
  cwd: root,
  encoding: 'utf8',
});
const files = output.split('\0').filter(Boolean);

const forbiddenPaths = [
  /(^|\/)node_modules(\/|$)/i,
  /(^|\/)(build|dist|coverage|\.dart_tool)(\/|$)/i,
  /(^|\/)(\.chrome-profile|\.edge-profile|\.capture-profile)[^/]*(\/|$)/i,
  /^design\/reference\/[^/]+\.png$/i,
  /^restaurant-os-.*\.zip(?:\.sha256)?$/i,
  /\.(?:pem|key|p12|pfx|jks|keystore|db|sqlite3?|dump|backup)$/i,
];

const secretPatterns = [
  ['private key', /-----BEGIN (?:RSA |OPENSSH |EC |DSA )?PRIVATE KEY-----/],
  ['GitHub token', /\b(?:github_pat_[A-Za-z0-9_]{20,}|ghp_[A-Za-z0-9]{20,})\b/],
  ['AWS access key', /\bAKIA[0-9A-Z]{16}\b/],
  ['Google API key', /\bAIza[0-9A-Za-z_-]{35}\b/],
  ['OpenAI-style secret', /\bsk-[A-Za-z0-9_-]{20,}\b/],
  ['bearer token', /\bBearer\s+[A-Za-z0-9._~+\/-]{20,}={0,2}\b/i],
  ['credentialed database URL', /\b(?:postgres(?:ql)?|mysql|mongodb(?:\+srv)?):\/\/[^\s/:]+:[^\s/@]+@/i],
];

const binaryExtensions = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico', '.pdf', '.zip', '.gz',
  '.woff', '.woff2', '.ttf', '.otf', '.jar', '.apk', '.dll', '.exe',
]);
const findings = [];

for (const file of files) {
  const portable = normalize(file).split(sep).join('/');
  if (/(^|\/)\.env(?:\.|$)/i.test(portable) && !/(^|\/)\.env\.example$/i.test(portable)) {
    findings.push(`${portable}: archivo de entorno real prohibido para publicación`);
  }
  for (const pattern of forbiddenPaths) {
    if (pattern.test(portable)) findings.push(`${portable}: ruta prohibida para publicación`);
  }

  const absolute = `${root}${sep}${normalize(file)}`;
  const size = statSync(absolute).size;
  if (size > 20 * 1024 * 1024) findings.push(`${portable}: archivo mayor a 20 MiB (${size} bytes)`);
  if (binaryExtensions.has(extname(file).toLowerCase()) || size > 5 * 1024 * 1024) continue;

  const content = readFileSync(absolute, 'utf8');
  for (const [label, pattern] of secretPatterns) {
    if (pattern.test(content)) findings.push(`${portable}: posible ${label}`);
  }
}

if (findings.length) {
  console.error('AUDITORÍA PÚBLICA: FALLÓ');
  for (const finding of findings) console.error(`- ${finding}`);
  process.exit(1);
}

console.log(`AUDITORÍA PÚBLICA: CORRECTA (${files.length} archivos preparados)`);
console.log('Sin rutas prohibidas ni patrones fuertes de secretos en el índice.');
