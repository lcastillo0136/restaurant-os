[CmdletBinding()]
param(
  [int]$TimeoutSeconds = 60
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
if ($TimeoutSeconds -lt 10) { throw 'TimeoutSeconds debe ser al menos 10.' }
$repositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
Set-Location $repositoryRoot

& (Join-Path $PSScriptRoot 'Test-RestaurantRequirements.ps1') -RequireDocker
if (-not (Test-Path -LiteralPath '.env')) {
  throw 'Falta .env. Ejecuta Initialize-RestaurantEnvironment.ps1 y define POSTGRES_PASSWORD.'
}

& docker compose --env-file .env -f infra/docker-compose.dev.yml config --quiet
if ($LASTEXITCODE -ne 0) { throw 'La configuración Docker Compose no es válida.' }

& docker compose --env-file .env -f infra/docker-compose.dev.yml up --build --detach
if ($LASTEXITCODE -ne 0) { throw 'Docker Compose no pudo iniciar los servicios para la prueba.' }

$apiPortLine = Get-Content -LiteralPath '.env' | Where-Object { $_ -match '^API_PORT=' } | Select-Object -First 1
$apiPort = if ($apiPortLine) { ($apiPortLine -split '=', 2)[1].Trim() } else { '3000' }
if ($apiPort -notmatch '^\d+$') { throw 'API_PORT en .env debe ser un entero.' }
$deadline = (Get-Date).AddSeconds($TimeoutSeconds)
$healthUri = "http://127.0.0.1:$apiPort/api/v1/system/health"
$healthy = $false
while ((Get-Date) -lt $deadline) {
  try {
    $response = Invoke-WebRequest -Uri $healthUri -TimeoutSec 3
    if ($response.StatusCode -eq 200) { $healthy = $true; break }
  } catch {
    Start-Sleep -Milliseconds 1000
  }
}
if (-not $healthy) {
  & docker compose --env-file .env -f infra/docker-compose.dev.yml ps
  throw "La API no respondió health en $healthUri dentro de $TimeoutSeconds segundos."
}

& docker compose --env-file .env -f infra/docker-compose.dev.yml exec --no-TTY postgres sh -c 'pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB"'
if ($LASTEXITCODE -ne 0) { throw 'PostgreSQL no respondió pg_isready.' }

Write-Output 'Docker Compose verificado: API health 200 y PostgreSQL listo. Use Stop-RestaurantServices.ps1 para detener sin eliminar datos.'
