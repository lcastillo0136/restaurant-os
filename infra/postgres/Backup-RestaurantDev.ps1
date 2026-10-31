[CmdletBinding()]
param(
  [string]$OutputPath = (Join-Path (Get-Location) '.tmp/fase-1.2/restaurant_dev.backup')
)

$ErrorActionPreference = 'Stop'

function Get-DatabaseUri {
  $environmentPath = Join-Path (Get-Location) '.env.database'
  if (-not (Test-Path -LiteralPath $environmentPath)) {
    throw '.env.database no existe; cree la configuración local antes de respaldar.'
  }

  $line = Get-Content -LiteralPath $environmentPath | Where-Object { $_ -match '^\s*DATABASE_URL\s*=' } | Select-Object -First 1
  if (-not $line) { throw 'DATABASE_URL no está definido en .env.database.' }

  $value = ($line -replace '^\s*DATABASE_URL\s*=\s*', '').Trim().Trim('"').Trim("'")
  $uri = $null
  if (-not [Uri]::TryCreate($value, [UriKind]::Absolute, [ref]$uri)) {
    throw 'DATABASE_URL no tiene una sintaxis URI válida.'
  }
  if ($uri.Scheme -ne 'postgresql' -or $uri.Host -ne '127.0.0.1' -or $uri.Port -ne 5432 -or $uri.AbsolutePath.Trim('/') -ne 'restaurant_dev') {
    throw 'El respaldo está limitado a restaurant_dev en 127.0.0.1:5432.'
  }
  return $uri
}

function Get-PostgresBinary([string]$Name) {
  $candidate = Join-Path ${env:ProgramFiles} "PostgreSQL/17/bin/$Name.exe"
  if (Test-Path -LiteralPath $candidate) { return $candidate }
  $command = Get-Command $Name -ErrorAction SilentlyContinue
  if ($command) { return $command.Source }
  throw "$Name no está disponible. Instale o use PostgreSQL 17 localmente."
}

$databaseUri = Get-DatabaseUri
$userInfo = $databaseUri.GetComponents([System.UriComponents]::UserInfo, [System.UriFormat]::UriEscaped)
$separator = $userInfo.IndexOf(':')
if ($separator -lt 1 -or [Uri]::UnescapeDataString($userInfo.Substring(0, $separator)) -ne 'restaurant_app') {
  throw 'DATABASE_URL debe utilizar la cuenta local restaurant_app.'
}

$resolvedOutputPath = [IO.Path]::GetFullPath($OutputPath)
$outputDirectory = Split-Path -Parent $resolvedOutputPath
New-Item -ItemType Directory -Force -Path $outputDirectory | Out-Null

$env:PGPASSWORD = [Uri]::UnescapeDataString($userInfo.Substring($separator + 1))
try {
  & (Get-PostgresBinary 'pg_dump') --host 127.0.0.1 --port 5432 --username restaurant_app --format custom --no-owner --no-privileges --file $resolvedOutputPath restaurant_dev
  if ($LASTEXITCODE -ne 0) { throw "pg_dump terminó con código $LASTEXITCODE." }
} finally {
  Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
}

Write-Output "Respaldo creado: $resolvedOutputPath"
