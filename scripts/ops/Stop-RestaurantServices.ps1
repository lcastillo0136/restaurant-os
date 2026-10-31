[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$repositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
Set-Location $repositoryRoot

& (Join-Path $PSScriptRoot 'Test-RestaurantRequirements.ps1') -RequireDocker
if (-not (Test-Path -LiteralPath '.env')) { throw 'Falta .env para identificar el proyecto Docker Compose.' }

& docker compose --env-file .env -f infra/docker-compose.dev.yml stop
if ($LASTEXITCODE -ne 0) { throw 'Docker Compose no pudo detener los servicios.' }
Write-Output 'Servicios detenidos. El volumen postgres_data no se eliminó.'
