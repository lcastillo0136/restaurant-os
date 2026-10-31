import { createHash } from 'node:crypto';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { verifyOfficialReferences } from './official-reference-policy.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const reviewPackage = process.argv.includes('--review-package');
const read = (relative) => readFileSync(resolve(root, relative), 'utf8');
const fail = (message) => { throw new Error(message); };
const requireFile = (relative) => {
  const path = resolve(root, relative);
  if (!existsSync(path) || !statSync(path).isFile()) fail(`Archivo ausente: ${relative}`);
  return path;
};

const tokenNames = ['colors', 'typography', 'spacing', 'radius', 'elevation', 'motion', 'components'];
const tokens = Object.fromEntries(tokenNames.map((name) => {
  const relative = `design/tokens/${name}.json`;
  requireFile(relative);
  try { return [name, JSON.parse(read(relative))]; }
  catch (error) { fail(`${relative}: JSON inválido (${error.message})`); }
}));
const themes = ['admin-light', 'customer-warm', 'kitchen-dark', 'pos-light'];
if (JSON.stringify(Object.keys(tokens.colors.themes)) !== JSON.stringify(themes)) {
  fail('Los cuatro temas canónicos no coinciden o cambiaron de orden.');
}
if (tokens.components.touch.minimumTargetDp !== 48) fail('El objetivo táctil canónico dejó de ser 48 dp.');

const css = read('packages/web_design_tokens/styles.css');
const dart = read('packages/flutter_design_system/lib/src/generated/design_tokens.g.dart');
for (const theme of themes) {
  if (!css.includes(`[data-theme="${theme}"]`)) fail(`Adaptador CSS sin tema ${theme}.`);
}
for (const value of Object.values(tokens.colors.themes).flatMap((theme) => Object.values(theme))) {
  if (!css.includes(value)) fail(`Color canónico ausente del adaptador CSS: ${value}`);
  const dartColor = `0xFF${value.slice(1).toUpperCase()}`;
  if (!dart.includes(dartColor)) fail(`Color canónico ausente del adaptador Flutter: ${value}`);
}
for (const value of Object.values(tokens.spacing.scale)) {
  if (!css.includes(`${value}px`)) fail(`Espaciado ${value}px ausente del adaptador CSS.`);
  if (!dart.includes(`${value}.0`)) fail(`Espaciado ${value}.0 ausente del adaptador Flutter.`);
}
if (!css.includes('--target-min: 48px') || !dart.includes('minimumTouchTarget = 48.0')) {
  fail('Paridad del objetivo táctil 48 CSS/Flutter no verificable.');
}
if (!css.includes('@media (prefers-reduced-motion: reduce)')) fail('CSS no respeta reducción de movimiento.');

const reactExports = read('packages/web_ui/src/index.ts');
const reactSources = [
  'packages/web_ui/src/primitives.tsx',
  'packages/web_ui/src/forms.tsx',
  'packages/web_ui/src/navigation.tsx',
  'packages/web_ui/src/feedback.tsx',
  'packages/web_ui/src/domain.tsx',
].map((file) => read(file)).join('\n');
const reactComponents = [
  'RestaurantButton', 'RestaurantIconButton', 'RestaurantCard', 'KpiCard', 'DataTable',
  'TextField', 'SelectField', 'FormSection', 'HorizontalNavigation', 'CompactRail',
  'Modal', 'Alert', 'EmptyState', 'ConnectionStatus', 'LoadingIndicator', 'KdsOrderCard',
  'KitchenColumn', 'TableCard', 'PaymentOption', 'AccountSummary', 'TipIndicator',
];
for (const name of reactComponents) if (!reactSources.includes(name)) fail(`Componente React ausente: ${name}`);
for (const module of ['./primitives', './forms', './navigation', './feedback', './domain']) {
  if (!reactExports.includes(module)) fail(`Barrel React sin exportación ${module}.`);
}
const reactStyles = read('packages/web_ui/src/styles.css');
if (!reactStyles.includes('min-height: var(--target-min)')) fail('React no aplica el objetivo táctil canónico.');
if (!reactStyles.includes(':focus-visible')) fail('React no define foco visible.');
requireFile('packages/web_ui/catalog/index.html');
requireFile('packages/web_ui/catalog/main.tsx');
requireFile('packages/web_ui/src/components.test.tsx');

const flutterSources = [
  'packages/flutter_design_system/lib/src/components/actions.dart',
  'packages/flutter_design_system/lib/src/components/content.dart',
  'packages/flutter_design_system/lib/src/components/feedback.dart',
  'packages/flutter_design_system/lib/src/components/navigation.dart',
].map((file) => read(file)).join('\n');
const flutterComponents = [
  'RestaurantButton', 'RestaurantTextField', 'RestaurantCard', 'RestaurantHeader',
  'MenuCategoryChip', 'ProductCard', 'CartSummary', 'RestaurantBottomNavigation',
  'RestaurantEmptyState', 'RestaurantErrorMessage', 'RestaurantLoadingIndicator',
  'RestaurantAlert', 'showRestaurantConfirmationDialog', 'RestaurantTableCard',
  'AttentionRequestCard', 'OrderStatusBadge',
];
for (const name of flutterComponents) if (!flutterSources.includes(name)) fail(`Componente Flutter ausente: ${name}`);
if (!flutterSources.includes('RestaurantTokens.minimumTouchTarget')) fail('Flutter no consume el objetivo táctil generado.');
if (!flutterSources.includes('Semantics(')) fail('Semántica Flutter no verificable.');
requireFile('packages/flutter_design_system/test/components_test.dart');
requireFile('packages/flutter_design_system/example/lib/main.dart');

const productSources = `${reactSources}\n${flutterSources}\n${read('packages/web_ui/catalog/main.tsx')}\n${read('packages/flutter_design_system/example/lib/main.dart')}`;
if (/\b(?:fetch|XMLHttpRequest|WebSocket|localStorage|sessionStorage|indexedDB)\b/.test(productSources)) {
  fail('Componentes o catálogos contienen red o persistencia.');
}
if (/https?:\/\//.test(productSources)) fail('Componentes o catálogos contienen recursos externos.');

const referenceResult = verifyOfficialReferences(root, reviewPackage);

for (const file of ['react-catalog.png', 'react-catalog-full.png']) {
  const buffer = readFileSync(requireFile(`design/validation/phase-0.6/${file}`));
  const isPng = buffer.subarray(0, 8).toString('hex') === '89504e470d0a1a0a';
  if (!isPng || buffer.readUInt32BE(16) < 1200 || buffer.readUInt32BE(20) < 1000) {
    fail(`Captura React inválida: ${file}`);
  }
}

const androidCapture = readFileSync(requireFile('design/validation/phase-0.6/table-kiosk-android-2026-10-29.png'));
if (androidCapture.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a'
  || androidCapture.readUInt32BE(16) !== 1216
  || androidCapture.readUInt32BE(20) !== 2688) {
  fail('Captura Flutter Android inválida.');
}
const androidCaptureHash = createHash('sha256').update(androidCapture).digest('hex');
if (androidCaptureHash !== '498b158f63240fbcb4d04fcaf056eec20c77463ad2942f9361213586364e6a5d') {
  fail('La captura Flutter Android no coincide con la evidencia inspeccionada.');
}

console.log('Fase 0.6 validada técnicamente:');
console.log('- 7/7 JSON canónicos válidos y 4/4 temas presentes.');
console.log('- Adaptadores CSS y ThemeData mantienen colores, espaciado y objetivo táctil de 48.');
console.log(`- ${reactComponents.length} componentes React y ${flutterComponents.length} componentes Flutter verificados.`);
console.log('- Catálogos, pruebas, foco, semántica y reducción de movimiento verificados.');
console.log('- Sin red, persistencia, backend ni recursos externos en componentes o catálogos.');
console.log(`- 2 capturas React y 1 captura Flutter Android reales verificadas. ${referenceResult}`);
