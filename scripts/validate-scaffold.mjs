import { access, readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { verifyOfficialReferences } from './official-reference-policy.mjs';

const root = process.cwd();
const reviewPackage = process.argv.includes('--review-package');
const requiredPaths = [
  'AGENTS.md',
  'docs/00-FUENTE-DE-VERDAD.md',
  'docs/design/REFERENCIAS-VISUALES.md',
  'design/tokens.json',
  'design/tokens/colors.json',
  'design/tokens/typography.json',
  'design/tokens/spacing.json',
  'design/tokens/radius.json',
  'design/tokens/elevation.json',
  'design/tokens/motion.json',
  'design/tokens/components.json',
  'apps/api/src/main.ts',
  'apps/admin_web/src/main.tsx',
  'apps/admin_web/src/App.tsx',
  'apps/kitchen_web/src/KitchenSample.tsx',
  'apps/kitchen_web/src/main.tsx',
  'apps/pos_web/src/PosSample.tsx',
  'apps/pos_web/src/main.tsx',
  'apps/table_kiosk/android/app/src/main/AndroidManifest.xml',
  'apps/table_kiosk/lib/main.dart',
  'packages/flutter_design_system/lib/restaurant_theme.dart',
  'design/validation/phase-0.1/README.md',
  'design/validation/phase-0.1/01-admin-react.png',
  'design/validation/phase-0.1/03-kds-react.png',
  'design/validation/phase-0.1/04-pos-react.png',
];

if (!reviewPackage) {
  requiredPaths.splice(4, 0,
    'design/reference/01-admin-aprobado.png',
    'design/reference/02-tablet-aprobado.png',
    'design/reference/03-kds-aprobado.png',
    'design/reference/04-pos-aprobado.png',
  );
}

for (const relativePath of requiredPaths) {
  await access(resolve(root, relativePath));
}

const referenceResult = verifyOfficialReferences(root, reviewPackage);

const requiredThemes = ['admin-light', 'customer-warm', 'kitchen-dark', 'pos-light'];
const tokenFiles = [
  'colors',
  'typography',
  'spacing',
  'radius',
  'elevation',
  'motion',
  'components',
];
const tokenDocuments = {};

for (const tokenFile of tokenFiles) {
  tokenDocuments[tokenFile] = JSON.parse(
    await readFile(resolve(root, `design/tokens/${tokenFile}.json`), 'utf8'),
  );
}

const manifest = JSON.parse(
  await readFile(resolve(root, 'design/tokens.json'), 'utf8'),
);
if (manifest.meta?.sourceOfTruth !== 'design/tokens/') {
  throw new Error('design/tokens.json must identify design/tokens/ as the only token source.');
}
if (JSON.stringify(manifest.themes) !== JSON.stringify(requiredThemes)) {
  throw new Error('The compatibility manifest theme names do not match the canonical token themes.');
}
for (const tokenFile of tokenFiles) {
  if (manifest.files?.[tokenFile] !== `design/tokens/${tokenFile}.json`) {
    throw new Error(`The compatibility manifest does not point to ${tokenFile}.json.`);
  }
}

const colors = tokenDocuments.colors;
const requiredSemanticColors = [
  'background',
  'surface',
  'surface-elevated',
  'text-primary',
  'text-secondary',
  'border',
  'accent',
  'success',
  'warning',
  'danger',
  'disabled'
];

for (const theme of requiredThemes) {
  if (!colors.themes?.[theme]) {
    throw new Error(`Missing token theme: ${theme}`);
  }
  for (const token of requiredSemanticColors) {
    if (!colors.themes[theme][token]) {
      throw new Error(`Missing ${token} in ${theme}`);
    }
  }
}

const webTokens = await readFile(
  resolve(root, 'packages/web_design_tokens/styles.css'),
  'utf8',
);
for (const theme of requiredThemes) {
  const themeBlock = webTokens.match(
    new RegExp(`\\[data-theme="${theme}"\\]\\s*\\{([\\s\\S]*?)\\n\\}`, 'm'),
  )?.[1];
  if (!themeBlock) {
    throw new Error(`Missing CSS token block for ${theme}.`);
  }
  for (const token of requiredSemanticColors) {
    const expectedDeclaration = `--color-${token}: ${colors.themes[theme][token]};`;
    if (!themeBlock.includes(expectedDeclaration)) {
      throw new Error(`CSS token mismatch for ${theme}.${token}.`);
    }
  }
}

const flutterTheme = await readFile(
  resolve(root, 'packages/flutter_design_system/lib/restaurant_theme.dart'),
  'utf8',
);
const flutterTokens = await readFile(
  resolve(root, 'packages/flutter_design_system/lib/src/generated/design_tokens.g.dart'),
  'utf8',
);
if (!flutterTheme.includes("src/generated/design_tokens.g.dart")) {
  throw new Error('Flutter ThemeData must consume the generated canonical token adapter.');
}
const customerWarm = colors.themes['customer-warm'];
for (const token of ['background', 'text-primary', 'accent', 'surface', 'border']) {
  const flutterColor = `Color(0xFF${customerWarm[token].slice(1).toUpperCase()})`;
  if (!flutterTokens.includes(flutterColor)) {
    throw new Error(`Flutter customer-warm token mismatch for ${token}.`);
  }
}
const touchTarget = tokenDocuments.components.touch?.minimumTargetDp;
if (!flutterTokens.includes(`minimumTouchTarget = ${touchTarget}.0`)) {
  throw new Error('Flutter minimum touch target does not match components.json.');
}

const adminApp = await readFile(resolve(root, 'apps/admin_web/src/App.tsx'), 'utf8');
if (!adminApp.includes('data-theme="admin-light"')) {
  throw new Error('Admin shell must declare the admin-light theme.');
}
if (!adminApp.includes('<header className="admin-nav">') || /<aside\b/.test(adminApp)) {
  throw new Error('Admin shell must use the approved horizontal navigation without a permanent sidebar.');
}

const designDocuments = await Promise.all([
  'docs/00-FUENTE-DE-VERDAD.md',
  'docs/03-DISENO-UX.md',
  'docs/design/REFERENCIAS-VISUALES.md',
].map((relativePath) => readFile(resolve(root, relativePath), 'utf8')));
if (designDocuments.some((document) => document.includes('design/screenshots/'))) {
  throw new Error('Official design documentation must not reference removed screenshot sources.');
}

const kioskMain = await readFile(resolve(root, 'apps/table_kiosk/lib/main.dart'), 'utf8');
if (/confirmar pedido|pago con tarjeta|CFDI/i.test(kioskMain)) {
  throw new Error('The Phase 0.1 kiosk shell must not contain transactional UI.');
}

const staticSamplePaths = [
  'apps/admin_web/src/App.tsx',
  'apps/kitchen_web/src/KitchenSample.tsx',
  'apps/pos_web/src/PosSample.tsx',
  'apps/table_kiosk/lib/main.dart',
];
for (const relativePath of staticSamplePaths) {
  const source = await readFile(resolve(root, relativePath), 'utf8');
  if (/\b(fetch|axios|WebSocket)\b/.test(source)) {
    throw new Error(`Phase 0.1 sample must not perform integration work: ${relativePath}`);
  }
}

console.log(
  `Phase 0.1 scaffold validated: ${requiredPaths.length} required paths, 7 canonical token files, and 4 synchronized themes. ${referenceResult}`,
);
