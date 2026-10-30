[CmdletBinding()]
param(
  [switch]$IncludeFlutter,
  [switch]$RequirePostgreSql
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
& (Join-Path $PSScriptRoot 'Test-RestaurantRequirements.ps1') -IncludeFlutter:$IncludeFlutter

if ($RequirePostgreSql) {
  foreach ($commandName in @('psql', 'pg_isready')) {
    $command = Get-Command $commandName -ErrorAction SilentlyContinue
    if ($null -eq $command) { throw "Requisito PostgreSQL no disponible: $commandName." }
    Write-Output "$commandName`t$($command.Source)"
  }
  . (Join-Path $PSScriptRoot 'Native-Restaurant.Common.ps1')
  $service = Get-RestaurantNativePostgreSqlService ''
  Write-Output "postgres-service`t$($service.Name) ($($service.Status))"
}

Write-Output 'Requisitos nativos verificados.'
