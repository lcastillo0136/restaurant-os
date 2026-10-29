import { existsSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { spawn, spawnSync } from 'node:child_process';
import { resolve, join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const edge = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const port = 4191;
const captureRoot = resolve(root, 'design', 'mockups', 'phase-0.4', 'captures');
const groups = [
  ['admin', ['ADM-01','ADM-03','ADM-04','ADM-05','ADM-06','ADM-07','ADM-08','ADM-09','ADM-10'], [1600,1000]],
  ['tablet', ['TAB-02','TAB-04','TAB-05','TAB-06','TAB-07','TAB-08','TAB-09','TAB-10','TAB-11','TAB-12'], [1100,1280]],
  ['kds', ['KDS-02','KDS-03','KDS-04','KDS-05','KDS-06','KDS-07'], [1600,900]],
  ['pos', ['POS-01','POS-02','POS-04','POS-05','POS-06','POS-07','POS-08','POS-09','POS-10'], [1440,900]],
  ['waiter', ['WAI-01','WAI-03','WAI-04','WAI-05','WAI-06','WAI-07'], [1000,1280]],
];

if (!existsSync(edge)) throw new Error(`Microsoft Edge no encontrado: ${edge}`);
mkdirSync(captureRoot, { recursive: true });
const server = spawn(process.execPath, [resolve(root, 'scripts', 'serve-phase-0.4-review.mjs')], {
  cwd: root,
  env: { ...process.env, PORT: String(port) },
  stdio: ['ignore', 'pipe', 'pipe'],
});

async function ready() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/`);
      if (response.ok) return;
    } catch {}
    await new Promise(resolveWait => setTimeout(resolveWait, 150));
  }
  throw new Error('El servidor HTTP local no respondió.');
}

try {
  await ready();
  let completed = 0;
  for (const [folder, ids, [width,height]] of groups) {
    for (const id of ids) {
      const profile = mkdtempSync(join(tmpdir(), 'restaurant-os-edge-'));
      const output = resolve(captureRoot, `${id}.png`);
      const url = `http://127.0.0.1:${port}/${folder}/delivery-2.html?capture=1&screen=${id}#${id}`;
      const result = spawnSync(edge, [
        '--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run',
        '--disable-features=msEdgeFirstRunExperience', `--user-data-dir=${profile}`,
        `--window-size=${width},${height}`, '--force-device-scale-factor=1',
        `--screenshot=${output}`, url,
      ], { cwd: root, encoding: 'utf8', timeout: 45000 });
      rmSync(profile, { recursive: true, force: true });
      if (result.status !== 0 || !existsSync(output)) {
        throw new Error(`${id}: Edge terminó con ${result.status}. ${result.stderr || result.stdout}`);
      }
      completed += 1;
      console.log(`${completed}/40 ${id}.png`);
    }
  }
  console.log('40 capturas reales generadas con Microsoft Edge Chromium headless.');
} finally {
  server.kill('SIGINT');
}
