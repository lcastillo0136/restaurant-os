import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const read = (name) => JSON.parse(readFileSync(resolve(root, 'design', 'tokens', name), 'utf8'));

const colors = read('colors.json');
const components = read('components.json');
const elevation = read('elevation.json');
const motion = read('motion.json');
const radius = read('radius.json');
const spacing = read('spacing.json');
const typography = read('typography.json');

const cssLines = [
  '/* GENERATED from design/tokens/*.json by scripts/generate-design-tokens.mjs. */',
  '/* Do not edit values here; change only the canonical JSON after approval. */',
  '',
  ':root {',
  ...Object.entries(spacing.scale).map(([key, value]) => `  --space-${key}: ${value}px;`),
  ...Object.entries(radius.radius).map(([key, value]) => `  --radius-${key}: ${value}px;`),
  ...Object.entries(elevation.elevation).map(([key, value]) => `  --elevation-${key}: ${value};`),
  ...Object.entries(motion.duration).map(([key, value]) => `  --duration-${key}: ${value}ms;`),
  `  --easing-standard: ${motion.easing.standard};`,
  `  --target-min: ${components.touch.minimumTargetDp}px;`,
  `  --focus-width: ${components.focus.outlineWidth}px;`,
  `  --focus-offset: ${components.focus.outlineOffset}px;`,
  `  --font-sans: ${typography.families.sans.map((value) => value.includes(' ') ? `"${value}"` : value).join(', ')};`,
  ...Object.entries(typography.weights).map(([key, value]) => `  --font-weight-${key}: ${value};`),
  ...Object.entries(typography.scale).flatMap(([key, value]) => [
    `  --font-${key}-size: ${value.size}px;`,
    `  --font-${key}-line: ${value.lineHeight}px;`,
    `  --font-${key}-weight: var(--font-weight-${value.weight});`,
  ]),
  '  --font-financial-numeric: tabular-nums;',
  '}',
  '',
];

for (const [themeName, theme] of Object.entries(colors.themes)) {
  const selector = themeName === 'admin-light'
    ? ':root,\n[data-theme="admin-light"]'
    : `[data-theme="${themeName}"]`;
  cssLines.push(`${selector} {`);
  for (const [key, value] of Object.entries(theme)) cssLines.push(`  --color-${key}: ${value};`);
  cssLines.push('}', '');
}

cssLines.push(
  '@media (prefers-reduced-motion: reduce) {',
  '  :root {',
  '    --duration-short: 0ms;',
  '    --duration-medium: 0ms;',
  '  }',
  '}',
);

writeFileSync(resolve(root, 'packages', 'web_design_tokens', 'styles.css'), `${cssLines.join('\n')}\n`);

const themeNames = Object.keys(colors.themes);
const dartEnum = (value) => value.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
const dartColor = (value) => `Color(0xFF${value.slice(1).toUpperCase()})`;
const colorFields = Object.keys(colors.themes[themeNames[0]]);
const dart = `// GENERATED from design/tokens/*.json by scripts/generate-design-tokens.mjs.\n` +
`// Do not edit values here; change only the canonical JSON after approval.\n\n` +
`import 'package:flutter/material.dart';\n\n` +
`enum RestaurantThemeName { ${themeNames.map(dartEnum).join(', ')} }\n\n` +
`@immutable\nclass RestaurantColorTokens {\n` +
`  const RestaurantColorTokens({\n${colorFields.map((field) => `    required this.${dartEnum(field)},`).join('\n')}\n  });\n\n` +
`${colorFields.map((field) => `  final Color ${dartEnum(field)};`).join('\n')}\n}\n\n` +
`abstract final class RestaurantTokens {\n` +
`  static const double minimumTouchTarget = ${components.touch.minimumTargetDp}.0;\n` +
`  static const double focusWidth = ${components.focus.outlineWidth}.0;\n` +
`  static const double focusOffset = ${components.focus.outlineOffset}.0;\n` +
`${Object.entries(spacing.scale).map(([key, value]) => `  static const double space${key} = ${value}.0;`).join('\n')}\n` +
`${Object.entries(radius.radius).map(([key, value]) => `  static const double radius${key[0].toUpperCase()}${key.slice(1)} = ${value}.0;`).join('\n')}\n` +
`${Object.entries(motion.duration).map(([key, value]) => `  static const Duration duration${key[0].toUpperCase()}${key.slice(1)} = Duration(milliseconds: ${value});`).join('\n')}\n\n` +
`  static const Map<RestaurantThemeName, RestaurantColorTokens> themes = {\n` +
`${themeNames.map((themeName) => {
  const theme = colors.themes[themeName];
  return `    RestaurantThemeName.${dartEnum(themeName)}: RestaurantColorTokens(\n${colorFields.map((field) => `      ${dartEnum(field)}: ${dartColor(theme[field])},`).join('\n')}\n    ),`;
}).join('\n')}\n  };\n}\n`;

writeFileSync(
  resolve(root, 'packages', 'flutter_design_system', 'lib', 'src', 'generated', 'design_tokens.g.dart'),
  dart,
);

console.log('Generated React CSS and Flutter Dart adapters from seven canonical token files.');
