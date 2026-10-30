import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  realpathSync,
  rmSync,
} from 'node:fs';
import { dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const temporaryParent = resolve(root, '.tmp');
mkdirSync(temporaryParent, { recursive: true });
const temporaryRoot = mkdtempSync(resolve(temporaryParent, 'phase-0.7.1-validator-'));

const run = (workingDirectory, argumentsList) => spawnSync(
  process.execPath,
  ['scripts/validate-phase-0.7.1.mjs', ...argumentsList],
  { cwd: workingDirectory, encoding: 'utf8' },
);
const expect = (condition, message, result) => {
  if (condition) return;
  const output = [result?.stdout, result?.stderr].filter(Boolean).join('\n');
  throw new Error(`${message}${output ? `\n${output}` : ''}`);
};

try {
  const localResult = run(root, []);
  expect(localResult.status === 0, 'El modo normal debe verificar las referencias locales.', localResult);

  const tracked = spawnSync('git', ['ls-files', '-z'], {
    cwd: root,
    encoding: 'utf8',
  });
  expect(tracked.status === 0, 'No se pudo obtener el inventario público de Git.', tracked);
  for (const relative of tracked.stdout.split('\0').filter(Boolean)) {
    const source = resolve(root, relative);
    const destination = resolve(temporaryRoot, relative);
    mkdirSync(dirname(destination), { recursive: true });
    copyFileSync(source, destination);
  }

  const packageNormalResult = run(temporaryRoot, []);
  expect(
    packageNormalResult.status !== 0
      && packageNormalResult.stderr.includes('Referencia privada local ausente'),
    'El modo normal debe fallar si el paquete no contiene las referencias privadas.',
    packageNormalResult,
  );

  const packageReviewResult = run(temporaryRoot, ['--review-package']);
  expect(
    packageReviewResult.status === 0
      && packageReviewResult.stdout.includes('paquete redistribuible sin PNG privados'),
    'El modo --review-package debe validar el contenido público sin exigir referencias privadas.',
    packageReviewResult,
  );

  const leakedReference = '01-admin-aprobado.png';
  copyFileSync(
    resolve(root, 'design/reference', leakedReference),
    resolve(temporaryRoot, 'design/reference', leakedReference),
  );
  const leakedReviewResult = run(temporaryRoot, ['--review-package']);
  expect(
    leakedReviewResult.status !== 0
      && leakedReviewResult.stderr.includes('no debe incluir referencias PNG privadas'),
    'El modo --review-package debe rechazar una referencia privada filtrada.',
    leakedReviewResult,
  );

  console.log('Validador Fase 0.7.1 probado: modo local, paquete sin referencias y rechazo de PNG privado.');
} finally {
  const resolvedTemporaryRoot = realpathSync(temporaryRoot);
  const allowedPrefix = `${realpathSync(temporaryParent).toLowerCase()}\\`;
  if (!resolvedTemporaryRoot.toLowerCase().startsWith(allowedPrefix)) {
    throw new Error(`Ruta temporal fuera del directorio permitido: ${resolvedTemporaryRoot}`);
  }
  rmSync(resolvedTemporaryRoot, { recursive: true, force: true });
}
