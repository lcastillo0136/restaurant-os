[CmdletBinding()]
param(
  [switch]$IncludeFlutter,
  [switch]$RequirePostgreSql
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
& (Join-Path $PSScriptRoot 'Test-RestaurantRequirements.ps1') -IncludeFlutter:$IncludeFlutter

if ($RequirePostgreSql) {
  . (Join-Path $PSScriptRoot 'Native-Restaurant.Common.ps1')
  foreach ($commandName in @('psql', 'pg_isready')) {
    Write-Output "$commandName`t$(Get-RestaurantPostgreSqlCommand $commandName)"
  }
  $service = Get-RestaurantNativePostgreSqlService ''
  Write-Output "postgres-service`t$($service.Name) ($($service.Status))"
}

Write-Output 'Requisitos nativos verificados.'
