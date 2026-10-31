[CmdletBinding()]
param(
  [switch]$RequireDocker,
  [switch]$IncludeFlutter
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Get-RequiredCommand([string]$Name) {
  $command = Get-Command $Name -ErrorAction SilentlyContinue
  if ($null -eq $command) {
    throw "Requisito no disponible: $Name. Consulta docs/infra/GUIA-DESARROLLO.md."
  }
  $command
}

$required = @('git', 'node', 'pnpm')
if ($RequireDocker) { $required += 'docker' }
if ($IncludeFlutter) { $required += 'flutter' }

foreach ($name in $required) {
  $command = Get-RequiredCommand $name
  $version = switch ($name) {
    'node' { (& node --version).Trim() }
    'pnpm' { (& pnpm --version).Trim() }
    'flutter' { ((& flutter --version | Select-Object -First 1) -join '').Trim() }
    'docker' { ((& docker --version) -join '').Trim() }
    default { $command.Source }
  }
  Write-Output "$name`t$version"
}

Write-Output 'Requisitos verificados.'
