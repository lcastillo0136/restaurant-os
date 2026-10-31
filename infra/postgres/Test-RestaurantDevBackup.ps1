[CmdletBinding()]
param(
  [Parameter(Mandatory)]
  [string]$BackupPath
)

$ErrorActionPreference = 'Stop'
$resolvedBackupPath = [IO.Path]::GetFullPath($BackupPath)
if (-not (Test-Path -LiteralPath $resolvedBackupPath)) {
  throw "No existe el respaldo: $resolvedBackupPath"
}

$candidate = Join-Path ${env:ProgramFiles} 'PostgreSQL/17/bin/pg_restore.exe'
if (Test-Path -LiteralPath $candidate) {
  $pgRestore = $candidate
} else {
  $command = Get-Command pg_restore -ErrorAction SilentlyContinue
  if (-not $command) { throw 'pg_restore no está disponible.' }
  $pgRestore = $command.Source
}

$entries = & $pgRestore --list $resolvedBackupPath
if ($LASTEXITCODE -ne 0) { throw "pg_restore --list terminó con código $LASTEXITCODE." }
if (-not ($entries | Select-String -SimpleMatch 'organizations')) {
  throw 'El respaldo no contiene la tabla fundacional organizations.'
}

Write-Output "Respaldo verificable: $resolvedBackupPath"
