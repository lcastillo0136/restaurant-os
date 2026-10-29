import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const mockupRoot = resolve(root, 'design', 'mockups', 'phase-0.4');
const assetRoot = resolve(mockupRoot, 'assets');
const canonicalPath = resolve(root, 'docs', 'design', 'WIREFRAMES.md');
const tokenRoot = resolve(root, 'design', 'tokens');

const environments = [
  { folder: 'admin', theme: 'admin-light', environment: 'Administración', ids: ['ADM-02'] },
  { folder: 'tablet', theme: 'customer-warm', environment: 'Tableta cliente', ids: ['TAB-01', 'TAB-03'] },
  { folder: 'kds', theme: 'kitchen-dark', environment: 'Cocina KDS', ids: ['KDS-01'] },
  { folder: 'pos', theme: 'pos-light', environment: 'Caja POS', ids: ['POS-03'] },
  { folder: 'waiter', theme: 'customer-warm', environment: 'Meseros', ids: ['WAI-02'] },
];

const expectedReferences = new Map([
  ['01-admin-aprobado.png', 'b816382c0cfea84469885ea017c6ade6b7b161a6c831e9dfc4266e7dc6bb54c3'],
  ['02-tablet-aprobado.png', '36a87f4e58f83aea107278c431dc46f989a8c9cca772378591674644e5c357e7'],
  ['03-kds-aprobado.png', '076cd7b14599c003c9afb5521a1dbf0de5cdfc7505e7af1d09787075f9196fdd'],
  ['04-pos-aprobado.png', '0d326b5789506961793faa867b0138439eb26ade6cddfb69b426f038351a3c0e'],
]);

const tokenFiles = ['colors.json', 'components.json', 'elevation.json', 'motion.json', 'radius.json', 'spacing.json', 'typography.json'];

const captures = new Map([
  ['ADM-02.png', [1600, 1000]],
  ['TAB-01.png', [1100, 1280]],
  ['TAB-03.png', [1100, 1280]],
  ['TAB-03-horizontal.png', [1280, 1280]],
  ['KDS-01.png', [1600, 900]],
  ['POS-03.png', [1440, 900]],
  ['WAI-02.png', [1000, 1280]],
]);

function fail(message) {
  throw new Error(message);
}

function read(path) {
  if (!existsSync(path)) fail(`Archivo ausente: ${path}`);
  return readFileSync(path, 'utf8');
}

function parseCanonical(markdown) {
  const records = new Map();
  for (const line of markdown.split(/\r?\n/)) {
    const columns = line.split('|').slice(1, -1).map((value) => value.trim());
    if (!/^(ADM|TAB|KDS|POS|WAI)-\d{2}$/.test(columns[0] ?? '')) continue;
    const [id, title, environment, role, platform, routeCell] = columns;
    records.set(id, { id, title, environment, role, platform, route: routeCell.replaceAll('`', '') });
  }
  return records;
}

function loadConfig(folder) {
  const path = resolve(mockupRoot, folder, 'index.html');
  const html = read(path);
  const match = html.match(/<script>\s*(window\.MOCKUP_CONFIG\s*=\s*[\s\S]*?)\s*<\/script>/);
  if (!match) fail(`Configuración ausente: ${path}`);
  const context = { window: {} };
  vm.runInNewContext(match[1], context, { filename: path });
  return { path, html, config: context.window.MOCKUP_CONFIG };
}

function localReferences(html, pagePath) {
  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const reference = match[1];
    if (/^(?:https?:)?\/\//.test(reference)) fail(`Recurso externo en ${pagePath}: ${reference}`);
    if (reference.startsWith('#')) continue;
    const filePart = reference.split('#')[0].split('?')[0];
    if (!filePart) continue;
    const target = resolve(dirname(pagePath), filePart);
    if (!existsSync(target)) fail(`Referencia local rota en ${pagePath}: ${reference}`);
  }
}

function expectCssRule(css, selector, declarations) {
  const start = css.indexOf(`${selector} {`);
  if (start < 0) fail(`Regla CSS ausente: ${selector}`);
  const end = css.indexOf('}', start);
  if (end < 0) fail(`Regla CSS sin cierre: ${selector}`);
  const body = css.slice(start, end);
  for (const declaration of declarations) {
    if (!body.includes(declaration)) fail(`${selector} no contiene ${declaration}`);
  }
}

function pngDimensions(path) {
  const buffer = readFileSync(path);
  const signature = buffer.subarray(0, 8).toString('hex');
  if (signature !== '89504e470d0a1a0a') fail(`Captura no es PNG válida: ${path}`);
  return [buffer.readUInt32BE(16), buffer.readUInt32BE(20)];
}

const canonical = parseCanonical(read(canonicalPath));
const foundIds = new Set();
for (const environment of environments) {
  const { path, html, config } = loadConfig(environment.folder);
  localReferences(html, path);
  if (config.theme !== environment.theme) fail(`${environment.folder}: tema ${config.theme} != ${environment.theme}`);
  const ids = config.screens.map((screen) => screen.id);
  if (JSON.stringify(ids) !== JSON.stringify(environment.ids)) fail(`${environment.folder}: IDs inesperados ${ids.join(', ')}`);
  for (const screen of config.screens) {
    if (foundIds.has(screen.id)) fail(`ID duplicado: ${screen.id}`);
    foundIds.add(screen.id);
    const record = canonical.get(screen.id);
    if (!record) fail(`ID ausente en WIREFRAMES.md: ${screen.id}`);
    if (screen.title !== record.title) fail(`${screen.id}: título distinto del wireframe canónico`);
    if (screen.route !== record.route) fail(`${screen.id}: ruta distinta del wireframe canónico`);
    if (screen.platform !== record.platform) fail(`${screen.id}: plataforma distinta del wireframe canónico`);
    for (const field of ['role', 'resolution', 'tokens', 'wireframe', 'reference', 'status']) {
      if (!screen[field]) fail(`${screen.id}: falta metadato ${field}`);
    }
    if (screen.status !== 'Pendiente de aprobación visual') fail(`${screen.id}: estado de aprobación incorrecto`);
  }
}

const expectedIds = environments.flatMap((environment) => environment.ids);
if (foundIds.size !== 6 || expectedIds.some((id) => !foundIds.has(id))) fail(`Cobertura: ${foundIds.size}/6 mockups`);

const indexPath = resolve(mockupRoot, 'index.html');
const indexHtml = read(indexPath);
localReferences(indexHtml, indexPath);
for (const id of expectedIds) {
  if (!indexHtml.includes(`#${id}"`)) fail(`Índice sin destino: ${id}`);
}

const js = read(resolve(assetRoot, 'mockups.js'));
const css = read(resolve(assetRoot, 'mockups.css'));
const tokensCss = read(resolve(assetRoot, 'tokens.css'));
new Function(js);
if (/(https?:)?\/\//.test(`${js}\n${css}`)) fail('Los assets contienen referencias externas.');
if (/\b(?:Restro|FoodCourt|Fascano)\b/.test(`${indexHtml}\n${js}\n${css}`)) fail('Se detectó una marca copiada de las referencias.');
if (/#[0-9a-fA-F]{3,8}\b/.test(css)) fail('mockups.css contiene colores literales fuera de tokens.css.');
for (const phrase of ['Sin sesión pública iniciada', 'Invitado confirmado · sesión activa', 'Sin movimiento contable todavía', 'solo después del ACK', 'Ilustración demo', 'Datos ficticios']) {
  if (!js.includes(phrase)) fail(`Falta salvaguarda o etiqueta: ${phrase}`);
}
if (!js.includes("query.get('orientation') === 'landscape'")) fail('La adaptación horizontal no está disponible por URL.');
if (!css.includes('.tablet-device.landscape')) fail('Falta layout horizontal de tableta.');

expectCssRule(css, '.warm-primary', ['min-height: 56px']);
expectCssRule(css, '.food-category', ['min-height: var(--target-min)']);
expectCssRule(css, '.food-card-copy button', ['width: var(--target-min)', 'height: var(--target-min)']);
expectCssRule(css, '.station-select, .kds-toolbar button', ['min-height: var(--target-min)']);
expectCssRule(css, '.view-tabs span', ['min-height: var(--target-min)']);
expectCssRule(css, '.kds-ticket button', ['min-height: var(--target-min)']);
expectCssRule(css, '.pos-rail-icon', ['min-height: 58px']);
expectCssRule(css, '.pos-continue', ['min-height: 56px']);
expectCssRule(css, '.waiter-tabs span', ['min-height: var(--target-min)']);
expectCssRule(css, '.waiter-bottom span', ['min-height: 54px']);

const actualTokenFiles = readdirSync(tokenRoot).filter((name) => extname(name) === '.json').sort();
if (JSON.stringify(actualTokenFiles) !== JSON.stringify([...tokenFiles].sort())) fail(`Tokens inesperados: ${actualTokenFiles.join(', ')}`);
const colors = JSON.parse(read(resolve(tokenRoot, 'colors.json')));
for (const [theme, values] of Object.entries(colors.themes)) {
  const start = tokensCss.indexOf(`.${theme} {`);
  const end = tokensCss.indexOf('}', start);
  if (start < 0 || end < 0) fail(`Tema ausente en tokens.css: ${theme}`);
  const block = tokensCss.slice(start, end);
  for (const [name, value] of Object.entries(values)) {
    if (!block.includes(`--${name}: ${value};`)) fail(`${theme}.${name} no coincide con colors.json`);
  }
}
if (!tokensCss.includes('--target-min: 48px;')) fail('El mínimo táctil no coincide con components.json.');
for (const tokenFile of tokenFiles) JSON.parse(read(resolve(tokenRoot, tokenFile)));

for (const [file, expectedHash] of expectedReferences) {
  const buffer = readFileSync(resolve(root, 'design', 'reference', file));
  const actualHash = createHash('sha256').update(buffer).digest('hex');
  if (actualHash !== expectedHash) fail(`Referencia oficial alterada: ${file}`);
}

for (const [file, dimensions] of captures) {
  const path = resolve(mockupRoot, 'captures', file);
  if (!existsSync(path) || !statSync(path).isFile()) fail(`Captura ausente: ${file}`);
  const actual = pngDimensions(path);
  if (actual[0] !== dimensions[0] || actual[1] !== dimensions[1]) fail(`${file}: ${actual.join('×')} != ${dimensions.join('×')}`);
}

console.log('Fase 0.4 · primera entrega validada:');
console.log('- 6 IDs, títulos, rutas y plataformas coinciden con los wireframes aprobados.');
console.log('- Índice y cinco entornos estáticos completos, sin recursos externos.');
console.log('- 4 temas y 7 JSON canónicos consumidos sin propuesta de cambio.');
console.log('- Objetivos táctiles de 48 px, adaptación horizontal y estados no engañosos verificados.');
console.log('- 7 capturas PNG reales verificadas por firma y dimensiones.');
console.log('- 4 referencias oficiales conservan sus SHA-256 originales.');
