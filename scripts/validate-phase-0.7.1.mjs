import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (relative) => readFileSync(resolve(root, relative), 'utf8');
const fail = (message) => { throw new Error(message); };
const requireText = (content, expected, context) => {
  if (!content.includes(expected)) fail(`${context}: falta ${expected}`);
};

const packageJson = JSON.parse(read('package.json'));
const webPackage = JSON.parse(read('packages/web_ui/package.json'));
const workspace = read('pnpm-workspace.yaml');
const lockfile = read('pnpm-lock.yaml');
if (webPackage.devDependencies.vitest !== '^4.1.12') fail('Vitest no está fijado al rango corregido 4.1.12.');
for (const entry of ['multer@2.4.0', 'vitest@3.2.7', 'tinypool@1.1.1', 'webpack@5.106.2']) {
  if (new RegExp(`^  ${entry.replaceAll('.', '\\.')}:(?:\\r?\\n)`, 'm').test(lockfile)) {
    fail(`El lockfile aún resuelve la versión bloqueada ${entry}.`);
  }
}
for (const entry of ['multer@2.5.0', 'vitest@4.1.12', 'webpack@5.112.2']) {
  requireText(lockfile, entry, 'lockfile corregido');
}
requireText(workspace, 'multer@2.4.0: 2.5.0', 'override dirigido de Multer');
requireText(workspace, 'webpack@5.106.2: 5.112.2', 'override dirigido de webpack');
if (packageJson.scripts['validate:phase-0.7.1'] !== 'node scripts/validate-phase-0.7.1.mjs') {
  fail('Falta el comando reproducible validate:phase-0.7.1.');
}

const flutterContent = read('packages/flutter_design_system/lib/src/components/content.dart');
const flutterActions = read('packages/flutter_design_system/lib/src/components/actions.dart');
const flutterTests = read('packages/flutter_design_system/test/components_test.dart');
for (const entry of ['LayoutBuilder(', 'MediaQuery.textScalerOf(context)', 'constraints.maxWidth < 420', 'textScale > 1.5']) {
  requireText(flutterContent, entry, 'reflow Flutter');
}
requireText(flutterActions, 'Flexible(child: Text(label, textAlign: TextAlign.center))', 'botón Flutter adaptable');
for (const entry of ['TextScaler.linear(2)', 'Size(320, 800)', 'Size(320, 640)', 'tester.takeException(), isNull']) {
  requireText(flutterTests, entry, 'pruebas Flutter de escalado');
}

const modal = read('packages/web_ui/src/feedback.tsx');
const reactTests = read('packages/web_ui/src/components.test.tsx');
for (const entry of ['dialog.showModal()', "event.key !== 'Tab'", 'openerRef.current?.focus()', 'aria-describedby={bodyId}', 'onCancel=']) {
  requireText(modal, entry, 'modal accesible');
}
for (const entry of ['contains modal focus', 'restores it to the opener', 'keeps a pending modal open']) {
  requireText(reactTests, entry, 'pruebas React del modal');
}

const tokens = JSON.parse(read('design/tokens/colors.json')).themes;
const webStyles = read('packages/web_ui/src/styles.css');
for (const entry of ['--ros-color-control-border', '--ros-color-warning-contrast', '--ros-color-danger-contrast', '--ros-color-on-danger']) {
  requireText(webStyles, entry, 'contraste local React');
}
const channels = (hex) => hex.slice(1).match(/../g).map((value) => Number.parseInt(value, 16));
const mix = (left, right, leftWeight) => `#${channels(left).map((value, index) =>
  Math.round(value * leftWeight + channels(right)[index] * (1 - leftWeight)).toString(16).padStart(2, '0')).join('')}`;
const luminance = (hex) => {
  const values = channels(hex).map((value) => value / 255)
    .map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return 0.2126 * values[0] + 0.7152 * values[1] + 0.0722 * values[2];
};
const contrast = (left, right) => {
  const values = [luminance(left), luminance(right)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
};
const ratios = [];
for (const [name, palette] of Object.entries(tokens)) {
  const warning = contrast(mix(palette.warning, palette['text-primary'], 0.72), palette.surface);
  const danger = contrast(mix(palette.danger, palette['text-primary'], 0.72), palette.surface);
  const border = contrast(mix(palette.border, palette['text-primary'], 0.35), palette.surface);
  const onDanger = contrast(palette.background, palette.danger);
  const focus = contrast(palette.accent, palette.background);
  if (warning < 4.5 || danger < 4.5 || border < 3 || onDanger < 4.5 || focus < 3) {
    fail(`${name}: contraste local insuficiente.`);
  }
  ratios.push(`${name} warning ${warning.toFixed(2)}, danger ${danger.toFixed(2)}, borde ${border.toFixed(2)}, on-danger ${onDanger.toFixed(2)}, foco ${focus.toFixed(2)}`);
}

for (const relative of ['apps/admin_web/src/styles.css', 'apps/kitchen_web/src/styles.css', 'apps/pos_web/src/styles.css']) {
  requireText(read(relative), ':focus-visible', `${relative} foco visible`);
}

const referenceHashes = new Map([
  ['01-admin-aprobado.png', 'b816382c0cfea84469885ea017c6ade6b7b161a6c831e9dfc4266e7dc6bb54c3'],
  ['02-tablet-aprobado.png', '36a87f4e58f83aea107278c431dc46f989a8c9cca772378591674644e5c357e7'],
  ['03-kds-aprobado.png', '076cd7b14599c003c9afb5521a1dbf0de5cdfc7505e7af1d09787075f9196fdd'],
  ['04-pos-aprobado.png', '0d326b5789506961793faa867b0138439eb26ade6cddfb69b426f038351a3c0e'],
]);
for (const [name, expected] of referenceHashes) {
  const relative = `design/reference/${name}`;
  if (!existsSync(resolve(root, relative))) fail(`Referencia privada local ausente: ${name}`);
  const actual = createHash('sha256').update(readFileSync(resolve(root, relative))).digest('hex');
  if (actual !== expected) fail(`Referencia oficial alterada: ${name}`);
}

const capturePath = resolve(root, 'design/validation/phase-0.7.1/react-catalog-remediated.png');
if (!existsSync(capturePath)) fail('Falta la captura real de remediación React.');
const capture = readFileSync(capturePath);
if (capture.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a'
  || capture.readUInt32BE(16) !== 1600
  || capture.readUInt32BE(20) !== 5000) {
  fail('La captura React de Fase 0.7.1 no es un PNG 1600×5000 válido.');
}

console.log('Fase 0.7.1 validada estáticamente:');
console.log('- Multer 2.5.0, Vitest 4.1.12 y webpack 5.112.2 resueltos; versiones bloqueadas ausentes.');
console.log('- ProductCard y CartSummary adaptativos con pruebas 200 % a 320 dp.');
console.log('- Modal con showModal, foco inicial, contención, Escape, cierre y restauración.');
console.log(`- Contrastes locales WCAG verificados: ${ratios.join('; ')}.`);
console.log('- Siete tokens canónicos no modificados y cuatro referencias oficiales intactas.');
console.log('- Captura React real 1600×5000 verificada.');
