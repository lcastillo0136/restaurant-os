Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Get-RestaurantRepositoryRoot {
  (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
}

function Assert-RestaurantLoopbackAddress([string]$Address, [string]$ParameterName) {
  if ($Address -notin @('127.0.0.1', '::1', 'localhost')) {
    throw "$ParameterName debe ser una dirección loopback; se recibió '$Address'."
  }
}

function Get-RestaurantNativeProcessDirectory {
  $directory = Join-Path (Get-RestaurantRepositoryRoot) '.tmp\phase-1.1\native-processes'
  New-Item -ItemType Directory -Path $directory -Force | Out-Null
  $directory
}

function Get-RestaurantNativeProcessRecordPath([string]$Name) {
  if ($Name -notmatch '^[a-z0-9-]+$') { throw 'El nombre del proceso nativo no es válido.' }
  Join-Path (Get-RestaurantNativeProcessDirectory) "$Name.json"
}

function Save-RestaurantNativeProcess([string]$Name, [System.Diagnostics.Process]$Process, [string]$Command, [System.Diagnostics.Process]$LauncherProcess) {
  $record = [ordered]@{
    name = $Name
    processId = $Process.Id
    startedAtUtc = $Process.StartTime.ToUniversalTime().ToString('O')
    command = $Command
  }
  if ($null -ne $LauncherProcess) {
    $record.launcherProcessId = $LauncherProcess.Id
    $record.launcherStartedAtUtc = $LauncherProcess.StartTime.ToUniversalTime().ToString('O')
  }
  $record | ConvertTo-Json | Set-Content -LiteralPath (Get-RestaurantNativeProcessRecordPath $Name) -Encoding utf8
}

function Get-RestaurantLoopbackListenerProcess([int]$Port) {
  $listener = Get-NetTCPConnection -State Listen -LocalPort $Port -ErrorAction SilentlyContinue |
    Where-Object { $_.LocalAddress -in @('127.0.0.1', '::1') } |
    Select-Object -First 1
  if ($null -eq $listener) { throw "No se encontró un listener loopback en el puerto $Port." }
  Get-Process -Id $listener.OwningProcess -ErrorAction Stop
}

function Get-RestaurantNativePostgreSqlService([string]$ServiceName) {
  $candidates = @(Get-Service | Where-Object {
    $_.Name -match '^postgresql' -or $_.DisplayName -match '^PostgreSQL'
  })

  if ($ServiceName) {
    $service = $candidates | Where-Object Name -eq $ServiceName | Select-Object -First 1
    if ($null -eq $service) { throw "No se encontró un servicio PostgreSQL permitido con nombre '$ServiceName'." }
    return $service
  }
  if ($candidates.Count -eq 0) { throw 'No se encontró un servicio PostgreSQL local. Instala PostgreSQL antes de continuar.' }
  if ($candidates.Count -gt 1) {
    throw "Se detectaron varios servicios PostgreSQL ($($candidates.Name -join ', ')); indica -ServiceName explícitamente."
  }
  $candidates[0]
}

function Assert-RestaurantPortAvailable([int]$Port) {
  $listener = Get-NetTCPConnection -State Listen -LocalPort $Port -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($null -ne $listener) { throw "El puerto local $Port ya está ocupado por el proceso $($listener.OwningProcess)." }
}
