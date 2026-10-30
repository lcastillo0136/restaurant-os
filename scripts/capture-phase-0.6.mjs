import { existsSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { spawn, spawnSync } from 'node:child_process';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const edge = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const port = 4198;
const output = resolve(root, 'design', 'validation', 'phase-0.6');
const shots = [
  ['react-catalog.png', 1600, 1200],
  ['react-catalog-full.png', 1600, 5000],
];
if (!existsSync(edge)) throw new Error(`Microsoft Edge no encontrado: ${edge}`);
mkdirSync(output, { recursive: true });
const server = spawn(process.execPath, [resolve(root, 'scripts', 'serve-phase-0.6-catalog.mjs')], { cwd: root, env: { ...process.env, PORT: String(port) }, stdio: 'ignore' });
try {
  let ready = false;
  for (let index = 0; index < 40 && !ready; index += 1) {
    try { ready = (await fetch(`http://127.0.0.1:${port}/`)).ok; } catch {}
    if (!ready) await new Promise((resolveWait) => setTimeout(resolveWait, 150));
  }
  if (!ready) throw new Error('Servidor local no disponible');
  for (const [file, width, height] of shots) {
    const profile = mkdtempSync(join(tmpdir(), 'restaurant-os-components-edge-'));
    const target = resolve(output, file);
    const result = spawnSync(edge, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run', '--disable-features=msEdgeFirstRunExperience', `--user-data-dir=${profile}`, `--window-size=${width},${height}`, '--force-device-scale-factor=1', `--screenshot=${target}`, `http://127.0.0.1:${port}/`], { cwd: root, encoding: 'utf8', timeout: 45000 });
    rmSync(profile, { recursive: true, force: true });
    if (result.status !== 0 || !existsSync(target)) throw new Error(`${file}: captura fallida ${result.status} ${result.stderr || result.stdout}`);
    console.log(`Captura real: ${file}`);
  }
} finally {
  server.kill('SIGINT');
}
