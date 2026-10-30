import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { verifyOfficialReferences } from './official-reference-policy.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const reviewPackage = process.argv.includes('--review-package');
const read = (relative) => readFileSync(resolve(root, relative), 'utf8');
const fail = (message) => { throw new Error(message); };
const requireFile = (relative) => {
  const absolute = resolve(root, relative);
  if (!existsSync(absolute) || !statSync(absolute).isFile()) fail(`Archivo ausente: ${relative}`);
  return absolute;
};

const idsByArea = {
  ADM: 10,
  TAB: 12,
  KDS: 7,
  POS: 10,
  WAI: 7,
};
const canonicalIds = Object.entries(idsByArea).flatMap(([prefix, count]) =>
  Array.from({ length: count }, (_, index) => `${prefix}-${String(index + 1).padStart(2, '0')}`),
);

const wireframes = read('docs/design/WIREFRAMES.md');
const screenMap = read('docs/design/MAPA-PANTALLAS.md');
const collectTextFiles = (relativeDirectory, extensions) => {
  const directory = resolve(root, relativeDirectory);
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const relative = `${relativeDirectory}/${entry.name}`;
    if (entry.isDirectory()) return collectTextFiles(relative, extensions);
    return extensions.some((extension) => entry.name.endsWith(extension)) ? [read(relative)] : [];
  }).join('\n');
};
const mockupCatalog = collectTextFiles('design/mockups/phase-0.4', ['.html', '.js']);
const prototypeCatalog = read('design/prototypes/phase-0.5/assets/screen-catalog.js');
for (const id of canonicalIds) {
  for (const [label, content] of [
    ['WIREFRAMES.md', wireframes],
    ['MAPA-PANTALLAS.md', screenMap],
    ['visor de mockups', mockupCatalog],
    ['catálogo de prototipos', prototypeCatalog],
  ]) {
    if (!content.includes(id)) fail(`${id} ausente en ${label}.`);
  }
}

const captures = readdirSync(resolve(root, 'design/mockups/phase-0.4/captures'))
  .filter((name) => name.toLowerCase().endsWith('.png'));
if (captures.length !== 47) fail(`Se esperaban 47 capturas de mockups y se encontraron ${captures.length}.`);
for (const id of canonicalIds) {
  if (!captures.includes(`${id}.png`)) fail(`Captura canónica ausente: ${id}.png`);
}
requireFile('design/mockups/phase-0.4/captures/TAB-03-horizontal.png');

const tokenNames = ['colors', 'typography', 'spacing', 'radius', 'elevation', 'motion', 'components'];
const tokens = Object.fromEntries(tokenNames.map((name) => {
  const relative = `design/tokens/${name}.json`;
  requireFile(relative);
  try { return [name, JSON.parse(read(relative))]; }
  catch (error) { fail(`${relative}: JSON inválido (${error.message})`); }
}));
const themes = ['admin-light', 'customer-warm', 'kitchen-dark', 'pos-light'];
if (JSON.stringify(Object.keys(tokens.colors.themes)) !== JSON.stringify(themes)) {
  fail('Los cuatro temas canónicos cambiaron o no están completos.');
}
if (tokens.components.touch.minimumTargetDp !== 48) fail('El objetivo táctil canónico dejó de ser 48 dp.');

const reactComponents = [
  'RestaurantButton', 'RestaurantIconButton', 'RestaurantCard', 'KpiCard', 'DataTable',
  'TextField', 'SelectField', 'FormSection', 'HorizontalNavigation', 'CompactRail',
  'Modal', 'Alert', 'EmptyState', 'ConnectionStatus', 'LoadingIndicator', 'KdsOrderCard',
  'KitchenColumn', 'TableCard', 'PaymentOption', 'AccountSummary', 'TipIndicator',
];
const reactSources = [
  'packages/web_ui/src/primitives.tsx', 'packages/web_ui/src/forms.tsx',
  'packages/web_ui/src/navigation.tsx', 'packages/web_ui/src/feedback.tsx',
  'packages/web_ui/src/domain.tsx',
].map(read).join('\n');
for (const component of reactComponents) {
  if (!reactSources.includes(component)) fail(`Componente React ausente: ${component}`);
}

const flutterComponents = [
  'RestaurantButton', 'RestaurantTextField', 'RestaurantCard', 'RestaurantHeader',
  'MenuCategoryChip', 'ProductCard', 'CartSummary', 'RestaurantBottomNavigation',
  'RestaurantEmptyState', 'RestaurantErrorMessage', 'RestaurantLoadingIndicator',
  'RestaurantAlert', 'showRestaurantConfirmationDialog', 'RestaurantTableCard',
  'AttentionRequestCard', 'OrderStatusBadge',
];
const flutterSources = [
  'packages/flutter_design_system/lib/src/components/actions.dart',
  'packages/flutter_design_system/lib/src/components/content.dart',
  'packages/flutter_design_system/lib/src/components/feedback.dart',
  'packages/flutter_design_system/lib/src/components/navigation.dart',
].map(read).join('\n');
for (const component of flutterComponents) {
  if (!flutterSources.includes(component)) fail(`Componente Flutter ausente: ${component}`);
}

const referenceResult = verifyOfficialReferences(root, reviewPackage);

const relativeLuminance = (hex) => {
  const channels = hex.match(/[a-f\d]{2}/gi).map((value) => Number.parseInt(value, 16) / 255)
    .map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
};
const contrast = (left, right) => {
  const values = [relativeLuminance(left), relativeLuminance(right)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
};
const contrastFindings = [];
for (const theme of themes) {
  const palette = tokens.colors.themes[theme];
  const warning = contrast(palette.warning, palette.surface);
  const border = contrast(palette.border, palette.surface);
  if (warning < 4.5) contrastFindings.push(`${theme}: warning/surface ${warning.toFixed(2)}:1`);
  if (border < 3) contrastFindings.push(`${theme}: border/surface ${border.toFixed(2)}:1`);
}
const kitchen = tokens.colors.themes['kitchen-dark'];
const kitchenDanger = contrast(kitchen.danger, kitchen.surface);
if (kitchenDanger < 4.5) contrastFindings.push(`kitchen-dark: danger/surface ${kitchenDanger.toFixed(2)}:1`);

console.log('Fase 0.7 auditada técnicamente:');
console.log(`- ${canonicalIds.length}/46 IDs canónicos presentes en wireframes, mapa, mockups y prototipos.`);
console.log(`- ${captures.length}/47 capturas de mockups y variante horizontal verificadas.`);
console.log('- 7/7 tokens JSON, 4/4 temas y objetivo táctil de 48 dp verificados.');
console.log(`- ${reactComponents.length}/21 componentes React y ${flutterComponents.length}/16 Flutter inventariados.`);
console.log(`- ${referenceResult}`);
console.log(`- Hallazgos de contraste que requieren decisión/corrección: ${contrastFindings.join('; ')}.`);
console.log('- READINESS: BLOQUEADO hasta corregir los hallazgos P1/P2 documentados en VALIDACION-FASE-0.7.md.');
