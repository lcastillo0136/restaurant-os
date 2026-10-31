[CmdletBinding()]
param(
  [switch]$IncludeFlutter
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$repositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
Set-Location $repositoryRoot

& (Join-Path $PSScriptRoot 'Test-RestaurantRequirements.ps1') -IncludeFlutter:$IncludeFlutter
& pnpm check
if ($LASTEXITCODE -ne 0) { throw 'Las validaciones Node/React/API no fueron correctas.' }

if ($IncludeFlutter) {
  Push-Location 'apps/table_kiosk'
  try {
    & flutter pub get
    if ($LASTEXITCODE -ne 0) { throw 'flutter pub get falló para table_kiosk.' }
    & flutter analyze
    if ($LASTEXITCODE -ne 0) { throw 'flutter analyze falló para table_kiosk.' }
    & flutter test
    if ($LASTEXITCODE -ne 0) { throw 'flutter test falló para table_kiosk.' }
  } finally {
    Pop-Location
  }
}

Write-Output 'Validaciones completadas.'
