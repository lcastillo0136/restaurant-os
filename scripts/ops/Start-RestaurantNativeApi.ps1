[CmdletBinding()]
param(
  [ValidateSet('127.0.0.1', '::1', 'localhost')]
  [string]$ApiHost = '127.0.0.1',
  [ValidateRange(1, 65535)]
  [int]$ApiPort = 3000,
  [ValidateRange(10, 120)]
  [int]$TimeoutSeconds = 60
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'Native-Restaurant.Common.ps1')
$repositoryRoot = Get-RestaurantRepositoryRoot
Set-Location $repositoryRoot
& (Join-Path $PSScriptRoot 'Test-RestaurantNativeRequirements.ps1')
Assert-RestaurantLoopbackAddress $ApiHost 'ApiHost'
Assert-RestaurantPortAvailable $ApiPort

$processDirectory = Get-RestaurantNativeProcessDirectory
$stdout = Join-Path $processDirectory 'api.stdout.log'
$stderr = Join-Path $processDirectory 'api.stderr.log'
$previousHost = $env:API_HOST
$previousPort = $env:API_PORT
$previousMode = $env:API_EXECUTION_MODE
try {
  $env:API_HOST = $ApiHost
  $env:API_PORT = [string]$ApiPort
  $env:API_EXECUTION_MODE = 'development'
  $process = Start-Process -FilePath ((Get-Command pnpm -ErrorAction Stop).Source) -ArgumentList @('--filter', '@restaurant-os/api', 'start') -WorkingDirectory $repositoryRoot -RedirectStandardOutput $stdout -RedirectStandardError $stderr -PassThru
} finally {
  $env:API_HOST = $previousHost
  $env:API_PORT = $previousPort
  $env:API_EXECUTION_MODE = $previousMode
}
$healthUri = "http://$ApiHost`:$ApiPort/api/v1/system/health"
$deadline = (Get-Date).AddSeconds($TimeoutSeconds)
while ((Get-Date) -lt $deadline) {
  if ($process.HasExited) { throw "La API terminó durante el arranque. Consulta $stderr." }
  try {
    if ((Invoke-WebRequest -Uri $healthUri -TimeoutSec 3).StatusCode -eq 200) {
      $listenerProcess = Get-RestaurantLoopbackListenerProcess $ApiPort
      Save-RestaurantNativeProcess 'api' $listenerProcess "pnpm --filter @restaurant-os/api start ($ApiHost`:$ApiPort)" $process
      Write-Output "API nativa lista: $healthUri (PID listener $($listenerProcess.Id))."
      return
    }
  } catch { Start-Sleep -Milliseconds 750 }
}
throw "La API no respondió en $healthUri dentro de $TimeoutSeconds segundos. Consulta $stdout y $stderr."
