[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$repositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
Set-Location $repositoryRoot

& (Join-Path $PSScriptRoot 'Test-RestaurantRequirements.ps1') -RequireDocker
if (-not (Test-Path -LiteralPath '.env')) {
  throw 'Falta .env. Ejecuta scripts/ops/Initialize-RestaurantEnvironment.ps1 y define POSTGRES_PASSWORD.'
}

& docker compose --env-file .env -f infra/docker-compose.dev.yml up --build --detach
if ($LASTEXITCODE -ne 0) { throw 'Docker Compose no pudo iniciar los servicios.' }
& (Join-Path $PSScriptRoot 'Get-RestaurantServiceStatus.ps1')
