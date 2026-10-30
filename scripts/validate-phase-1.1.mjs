import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const read = (relative) => {
  const path = resolve(root, relative);
  if (!existsSync(path)) throw new Error(`Archivo requerido ausente: ${relative}`);
  return readFileSync(path, 'utf8');
};
const requireText = (content, text, context) => {
  if (!content.includes(text)) throw new Error(`${context}: falta ${text}`);
};

const compose = read('infra/docker-compose.dev.yml');
for (const text of [
  'api:',
  'postgres:',
  'postgres_data:',
  'restaurant_internal:',
  'condition: service_healthy',
  'POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:?Define POSTGRES_PASSWORD in .env}',
  '127.0.0.1:${POSTGRES_PORT:-5433}:5432',
  '127.0.0.1:${API_PORT:-3000}:3000',
  'system/health',
  'restart: unless-stopped',
]) requireText(compose, text, 'Docker Compose');

const dockerfile = read('apps/api/Dockerfile');
for (const text of [
  'FROM node:24.20.0-bookworm-slim',
  'pnpm install --frozen-lockfile',
  'pnpm --filter @restaurant-os/api build',
  'USER node',
  'apps/api/dist/main.js',
]) requireText(dockerfile, text, 'Dockerfile de API');

const environmentExample = read('.env.example');
for (const key of [
  'COMPOSE_PROJECT_NAME=',
  'POSTGRES_IMAGE=',
  'POSTGRES_DB=',
  'POSTGRES_USER=',
  'POSTGRES_PASSWORD=<define-a-local-development-secret>',
  'POSTGRES_PORT=',
  'API_HOST=',
  'API_PORT=',
  'API_EXECUTION_MODE=',
  'API_ALLOWED_ORIGINS=',
]) requireText(environmentExample, key, '.env.example');

const apiEnvironment = read('apps/api/src/environment.ts');
for (const text of ['API_PORT debe ser un entero', 'API_ALLOWED_ORIGINS', 'development', 'docker', 'test']) {
  requireText(apiEnvironment, text, 'Validación de entorno API');
}

for (const script of [
  'scripts/ops/Test-RestaurantRequirements.ps1',
  'scripts/ops/Initialize-RestaurantEnvironment.ps1',
  'scripts/ops/Start-RestaurantServices.ps1',
  'scripts/ops/Stop-RestaurantServices.ps1',
  'scripts/ops/Get-RestaurantServiceStatus.ps1',
  'scripts/ops/Invoke-RestaurantValidation.ps1',
  'scripts/ops/Test-RestaurantCompose.ps1',
  'scripts/ops/Clear-RestaurantTemporaryFiles.ps1',
]) read(script);

const operationalScripts = [
  'scripts/ops/Start-RestaurantServices.ps1',
  'scripts/ops/Stop-RestaurantServices.ps1',
  'scripts/ops/Get-RestaurantServiceStatus.ps1',
  'scripts/ops/Test-RestaurantCompose.ps1',
].map(read).join('\n');
if (/docker\s+compose[^\n]*\sdown\s+[^\n]*-v/i.test(operationalScripts)) {
  throw new Error('Los scripts operativos no pueden eliminar volúmenes persistentes.');
}

const workflow = read('.github/workflows/validation.yml');
for (const text of [
  'pull_request:',
  'push:',
  'Master',
  'contents: read',
  'actions/checkout@v7',
  'actions/setup-node@v7',
  'pnpm/action-setup@v4',
  'subosito/flutter-action@v2',
  'pnpm install --frozen-lockfile',
  'pnpm validate:design:public',
  'pnpm test:web',
  'pnpm build:web',
  'pnpm test:api',
  'pnpm audit:production',
  'flutter analyze',
  'flutter test',
]) requireText(workflow, text, 'Workflow CI');
if (/deploy|publish|upload-artifact/i.test(workflow)) {
  throw new Error('El workflow de Fase 1.1 no debe desplegar, publicar ni subir artefactos.');
}

console.log('Fase 1.1 validada estáticamente: Compose, Dockerfile, entorno, scripts y CI coherentes.');
