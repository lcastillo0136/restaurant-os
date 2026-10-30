import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { verifyOfficialReferences } from './official-reference-policy.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const reviewPackage = process.argv.includes('--review-package');
const wireframesRoot = resolve(root, 'design', 'wireframes');
const canonicalPath = resolve(root, 'docs', 'design', 'WIREFRAMES.md');
const mapPath = resolve(root, 'docs', 'design', 'MAPA-PANTALLAS.md');
const cssPath = resolve(wireframesRoot, 'assets', 'wireframe.css');
const jsPath = resolve(wireframesRoot, 'assets', 'wireframe.js');

const environments = [
  { folder: 'admin', environment: 'Administración', prefix: 'ADM', count: 10, platform: 'React web' },
  { folder: 'tablet', environment: 'Tableta cliente', prefix: 'TAB', count: 12, platform: 'Flutter Android' },
  { folder: 'kds', environment: 'Cocina KDS', prefix: 'KDS', count: 7, platform: 'React web' },
  { folder: 'pos', environment: 'Caja POS', prefix: 'POS', count: 10, platform: 'React web' },
  { folder: 'waiter', environment: 'Meseros', prefix: 'WAI', count: 7, platform: 'Flutter Android' },
];

const expectedReferenceHashes = new Map([
  ['01-admin-aprobado.png', 'b816382c0cfea84469885ea017c6ade6b7b161a6c831e9dfc4266e7dc6bb54c3'],
  ['02-tablet-aprobado.png', '36a87f4e58f83aea107278c431dc46f989a8c9cca772378591674644e5c357e7'],
  ['03-kds-aprobado.png', '076cd7b14599c003c9afb5521a1dbf0de5cdfc7505e7af1d09787075f9196fdd'],
  ['04-pos-aprobado.png', '0d326b5789506961793faa867b0138439eb26ade6cddfb69b426f038351a3c0e'],
]);

const expectedTokenFiles = [
  'colors.json', 'typography.json', 'spacing.json', 'radius.json',
  'elevation.json', 'motion.json', 'components.json',
];

function fail(message) {
  throw new Error(message);
}

function read(path) {
  if (!existsSync(path)) fail(`Archivo ausente: ${path}`);
  return readFileSync(path, 'utf8');
}

function loadConfig(environment) {
  const pagePath = resolve(wireframesRoot, environment.folder, 'index.html');
  const html = read(pagePath);
  const match = html.match(/<script>\s*(window\.WIREFRAME_CONFIG\s*=\s*[\s\S]*?)\s*<\/script>/);
  if (!match) fail(`Configuración ausente: ${pagePath}`);
  const context = { window: {} };
  vm.runInNewContext(match[1], context, { filename: pagePath });
  return { config: context.window.WIREFRAME_CONFIG, html, pagePath };
}

function parseCanonicalInventory(markdown) {
  const records = new Map();
  for (const line of markdown.split(/\r?\n/)) {
    const columns = line.split('|').slice(1, -1).map((value) => value.trim());
    if (!/^(ADM|TAB|KDS|POS|WAI)-\d{2}$/.test(columns[0] ?? '')) continue;
    if (columns.length !== 8) fail(`Fila canónica con columnas inválidas: ${line}`);
    const [id, name, environment, role, platform, routeCell] = columns;
    const route = routeCell.replaceAll('`', '');
    if (records.has(id)) fail(`ID duplicado en WIREFRAMES.md: ${id}`);
    records.set(id, { id, name, environment, role, platform, route });
  }
  return records;
}

function parseMapInventory(markdown) {
  const records = new Map();
  for (const line of markdown.split(/\r?\n/)) {
    const columns = line.split('|').slice(1, -1).map((value) => value.trim());
    if (!/^(ADM|TAB|KDS|POS|WAI)-\d{2}$/.test(columns[0] ?? '')) continue;
    if (columns.length !== 4) fail(`Fila derivada del mapa con columnas inválidas: ${line}`);
    const [id, name, environment, routeCell] = columns;
    const route = routeCell.replaceAll('`', '');
    if (records.has(id)) fail(`ID duplicado en MAPA-PANTALLAS.md: ${id}`);
    records.set(id, { id, name, environment, route });
  }
  return records;
}

function localReferences(html, pagePath) {
  const references = [...html.matchAll(/(?:href|src)="([^"]+)"/g)].map((match) => match[1]);
  for (const reference of references) {
    if (reference.startsWith('#')) continue;
    if (/^(?:https?:)?\/\//.test(reference)) fail(`Referencia externa no permitida en ${pagePath}: ${reference}`);
    const filePart = reference.split('#')[0].split('?')[0];
    if (!filePart) continue;
    const target = resolve(dirname(pagePath), filePart);
    if (!existsSync(target)) fail(`Referencia local rota en ${pagePath}: ${reference}`);
  }
}

function expectRule(css, selector, declarations) {
  const start = css.indexOf(`${selector} {`);
  if (start < 0) fail(`Regla CSS ausente: ${selector}`);
  const end = css.indexOf('}', start);
  if (end < 0) fail(`Regla CSS sin cierre: ${selector}`);
  const body = css.slice(start, end);
  for (const declaration of declarations) {
    if (!body.includes(declaration)) fail(`La regla ${selector} no contiene ${declaration}`);
  }
}

const canonical = parseCanonicalInventory(read(canonicalPath));
if (canonical.size !== 46) fail(`Inventario canónico: ${canonical.size}/46`);

const map = read(mapPath);
if (!map.includes('Agrupación conceptual histórica de Fase 0.2 — no canónica')) {
  fail('El mapa histórico no está identificado como no canónico.');
}
const mapInventory = parseMapInventory(map);
if (mapInventory.size !== 46) fail(`Inventario derivado del mapa: ${mapInventory.size}/46`);
for (const [id, record] of canonical) {
  const mapRecord = mapInventory.get(id);
  if (!mapRecord) fail(`ID canónico ausente en MAPA-PANTALLAS.md: ${id}`);
  if (mapRecord.name !== record.name) fail(`${id}: nombre contradictorio en MAPA-PANTALLAS.md`);
  if (mapRecord.environment !== record.environment) fail(`${id}: entorno contradictorio en MAPA-PANTALLAS.md`);
  if (mapRecord.route !== record.route) fail(`${id}: ruta contradictoria en MAPA-PANTALLAS.md`);
}

const seenIds = new Set();
let totalRoutes = 0;
for (const environment of environments) {
  const { config, html, pagePath } = loadConfig(environment);
  if (!config || !Array.isArray(config.screens)) fail(`Configuración inválida: ${pagePath}`);
  if (config.screens.length !== environment.count) fail(`${environment.prefix}: ${config.screens.length}/${environment.count} pantallas`);
  const routesInEnvironment = new Set();

  config.screens.forEach((screen, index) => {
    const expectedId = `${environment.prefix}-${String(index + 1).padStart(2, '0')}`;
    if (screen.id !== expectedId) fail(`Secuencia inválida: se esperaba ${expectedId}, se obtuvo ${screen.id}`);
    if (seenIds.has(screen.id)) fail(`ID duplicado en el visor: ${screen.id}`);
    seenIds.add(screen.id);
    if (routesInEnvironment.has(screen.route)) fail(`Ruta duplicada en ${environment.environment}: ${screen.route}`);
    routesInEnvironment.add(screen.route);
    totalRoutes += 1;

    const record = canonical.get(screen.id);
    if (!record) fail(`ID del visor ausente en WIREFRAMES.md: ${screen.id}`);
    if (record.name !== screen.title) fail(`${screen.id}: nombre canónico "${record.name}" != visor "${screen.title}"`);
    if (record.environment !== environment.environment) fail(`${screen.id}: entorno canónico incorrecto: ${record.environment}`);
    if (record.platform !== environment.platform) fail(`${screen.id}: plataforma canónica incorrecta: ${record.platform}`);
    if (record.route !== screen.route) fail(`${screen.id}: ruta canónica "${record.route}" != visor "${screen.route}"`);
  });

  localReferences(html, pagePath);
}

if (seenIds.size !== 46 || totalRoutes !== 46) fail(`Cobertura del visor: ${seenIds.size} IDs y ${totalRoutes} rutas`);

const indexPath = resolve(wireframesRoot, 'index.html');
const indexHtml = read(indexPath);
localReferences(indexHtml, indexPath);
const indexLinks = [...indexHtml.matchAll(/href="(admin|tablet|kds|pos|waiter)\/index\.html#[A-Z]+-\d{2}"/g)];
if (indexLinks.length !== 5) fail(`Índice visual: ${indexLinks.length}/5 entornos`);

const css = read(cssPath);
const sharedJs = read(jsPath);
new Function(sharedJs);
if (/\b(?:Restro|FoodCourt)\b/.test(sharedJs)) fail('El visor conserva una marca copiada de las referencias.');
if (!sharedJs.includes("let orientation = 'portrait'")) fail('La tableta vertical no es la orientación principal.');
if (!sharedJs.includes("data-orientation=\"landscape\"")) fail('Falta la variante horizontal adaptable.');
if (sharedJs.includes("Invitado · sesión activa")) fail('El encabezado activa al invitado antes de ACK.');
if (!sharedJs.includes('Acceso invitado · pendiente de ACK')) fail('Falta el estado pendiente de acceso invitado.');
if (!sharedJs.includes("isOffline ? '<span class=\"kds-connection offline\">● Sin conexión")) fail('KDS-07 no fuerza el indicador de desconexión.');
if (!sharedJs.includes("if (screen.id === 'POS-08')") || !sharedJs.includes("if (screen.id === 'POS-09')")) fail('POS no contextualiza apertura/cierre de caja.');
if (!sharedJs.includes('${posSummary(screen)}')) fail('El resumen POS no recibe contexto de pantalla.');
for (const ackState of ['offline', 'pending', 'confirmed']) {
  const marker = `if (state === '${ackState}') return \`<div class="state-layer"`;
  if (!sharedJs.includes(marker)) fail(`El estado ${ackState} no oculta contenido contradictorio.`);
}

expectRule(css, '.action', ['min-height: 48px']);
expectRule(css, '.category-tab', ['min-height: 48px']);
expectRule(css, '.kds-select, .kds-button', ['min-height: 48px', 'font-size: 15px']);
expectRule(css, '.kds-action', ['min-height: 48px', 'font-size: 15px']);
expectRule(css, '.rail-icon', ['width: 48px', 'height: 48px']);
expectRule(css, '.ticket h3', ['font-size: 18px']);
expectRule(css, '.ticket ul', ['font-size: 15px']);
expectRule(css, '.tablet-shell.portrait', ['width: min(100%, 520px)', 'min-height: 820px']);
expectRule(css, '.tablet-shell.landscape', ['width: min(100%, 920px)', 'min-height: 570px']);

const tokenRoot = resolve(root, 'design', 'tokens');
const tokenFiles = readdirSync(tokenRoot).filter((name) => extname(name) === '.json').sort();
if (JSON.stringify(tokenFiles) !== JSON.stringify([...expectedTokenFiles].sort())) {
  fail(`Tokens canónicos inesperados: ${tokenFiles.join(', ')}`);
}
for (const tokenFile of tokenFiles) JSON.parse(read(resolve(tokenRoot, tokenFile)));

const referenceResult = verifyOfficialReferences(root, reviewPackage);

console.log('Fase 0.3 validada:');
console.log('- 46 IDs canónicos, nombres, entornos y rutas consistentes entre WIREFRAMES, MAPA y visor.');
console.log('- 5 entornos y recursos locales completos; JavaScript sintácticamente válido.');
console.log('- Tableta vertical principal + variante horizontal adaptable.');
console.log('- Targets táctiles y legibilidad KDS verificados.');
console.log('- Estados ACK, KDS desconectado y resumen POS contextual verificados.');
console.log(`- 7 tokens JSON válidos. ${referenceResult}`);
