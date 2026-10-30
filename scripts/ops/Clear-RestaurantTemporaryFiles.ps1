[CmdletBinding(SupportsShouldProcess)]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$repositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$temporaryRoot = Join-Path $repositoryRoot '.tmp\phase-1.1'

if (-not (Test-Path -LiteralPath $temporaryRoot)) {
  Write-Output 'No hay recursos temporales de Fase 1.1 para limpiar.'
  return
}

if ($PSCmdlet.ShouldProcess($temporaryRoot, 'Eliminar únicamente recursos temporales de Fase 1.1')) {
  Remove-Item -LiteralPath $temporaryRoot -Recurse -Force
  Write-Output 'Recursos temporales de Fase 1.1 eliminados. No se modificaron volúmenes, .env ni datos PostgreSQL.'
}
