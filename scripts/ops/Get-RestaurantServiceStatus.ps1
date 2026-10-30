[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$repositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
Set-Location $repositoryRoot

& (Join-Path $PSScriptRoot 'Test-RestaurantRequirements.ps1') -RequireDocker
if (-not (Test-Path -LiteralPath '.env')) { throw 'Falta .env para consultar Docker Compose.' }

& docker compose --env-file .env -f infra/docker-compose.dev.yml ps
if ($LASTEXITCODE -ne 0) { throw 'No se pudo consultar el estado de Docker Compose.' }
