[CmdletBinding()]
param(
  [Parameter(Mandatory)]
  [ValidateSet('admin', 'kitchen', 'pos')]
  [string]$Application,
  [ValidateRange(10, 120)]
  [int]$TimeoutSeconds = 60
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'Native-Restaurant.Common.ps1')
$repositoryRoot = Get-RestaurantRepositoryRoot
Set-Location $repositoryRoot
& (Join-Path $PSScriptRoot 'Test-RestaurantNativeRequirements.ps1')
$mapping = @{
  admin = @{ package = '@restaurant-os/admin-web'; port = 5173 }
  kitchen = @{ package = '@restaurant-os/kitchen-web'; port = 5174 }
  pos = @{ package = '@restaurant-os/pos-web'; port = 5175 }
}
$target = $mapping[$Application]
Assert-RestaurantPortAvailable $target.port

$processDirectory = Get-RestaurantNativeProcessDirectory
$stdout = Join-Path $processDirectory "$Application.stdout.log"
$stderr = Join-Path $processDirectory "$Application.stderr.log"
$process = Start-Process -FilePath ((Get-Command pnpm -ErrorAction Stop).Source) -ArgumentList @('--filter', $target.package, 'dev') -WorkingDirectory $repositoryRoot -RedirectStandardOutput $stdout -RedirectStandardError $stderr -PassThru
$uri = "http://127.0.0.1:$($target.port)/"
$deadline = (Get-Date).AddSeconds($TimeoutSeconds)
while ((Get-Date) -lt $deadline) {
  if ($process.HasExited) { throw "$Application terminó durante el arranque. Consulta $stderr." }
  try {
    if ((Invoke-WebRequest -Uri $uri -TimeoutSec 3).StatusCode -eq 200) {
      $listenerProcess = Get-RestaurantLoopbackListenerProcess $target.port
      Save-RestaurantNativeProcess "web-$Application" $listenerProcess "pnpm --filter $($target.package) dev (127.0.0.1:$($target.port))" $process
      Write-Output "Aplicación $Application lista: $uri (PID listener $($listenerProcess.Id))."
      return
    }
  } catch { Start-Sleep -Milliseconds 750 }
}
throw "$Application no respondió en $uri dentro de $TimeoutSeconds segundos. Consulta $stdout y $stderr."
