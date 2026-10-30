[CmdletBinding()]
param(
  [ValidateRange(1, 65535)] [int]$ApiPort = 3000,
  [ValidateRange(1, 65535)] [int]$PostgreSqlPort = 5432,
  [string]$ServiceName
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'Native-Restaurant.Common.ps1')
foreach ($port in @($ApiPort, $PostgreSqlPort)) {
  $listeners = @(Get-NetTCPConnection -State Listen -LocalPort $port -ErrorAction SilentlyContinue)
  if ($listeners.Count -eq 0) { Write-Output "puerto-$port`tno-escucha"; continue }
  foreach ($listener in $listeners) {
    $scope = if ($listener.LocalAddress -in @('127.0.0.1', '::1')) { 'loopback' } else { 'NO-LOOPBACK' }
    Write-Output "puerto-$port`t$($listener.LocalAddress)`t$scope`tPID $($listener.OwningProcess)"
  }
}

try {
  $service = Get-RestaurantNativePostgreSqlService $ServiceName
  Write-Output "postgres-service`t$($service.Name)`t$($service.Status)"
} catch { Write-Output "postgres-service`tno-disponible`t$($_.Exception.Message)" }

try {
  $response = Invoke-WebRequest -Uri "http://127.0.0.1:$ApiPort/api/v1/system/health" -TimeoutSec 3
  Write-Output "api-health`tHTTP $($response.StatusCode)"
} catch { Write-Output 'api-health	no-disponible' }
