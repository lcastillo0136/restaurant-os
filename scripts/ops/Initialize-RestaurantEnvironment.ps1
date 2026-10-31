[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$repositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
Set-Location $repositoryRoot

& (Join-Path $PSScriptRoot 'Test-RestaurantRequirements.ps1')

if (-not (Test-Path -LiteralPath '.env')) {
  Copy-Item -LiteralPath '.env.example' -Destination '.env'
  Write-Output 'Se creó .env desde .env.example. Define POSTGRES_PASSWORD antes de iniciar Docker Compose.'
} else {
  Write-Output '.env ya existe; no se sobrescribió.'
}

& pnpm install --frozen-lockfile
if ($LASTEXITCODE -ne 0) { throw 'pnpm install falló.' }
Write-Output 'Dependencias instaladas con lockfile inmutable.'
