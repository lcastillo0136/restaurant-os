[CmdletBinding()]
param(
  [string]$ServiceName,
  [ValidateRange(1, 65535)] [int]$PostgreSqlPort = 5432,
  [string]$DatabaseUser = 'postgres',
  [securestring]$DatabasePassword,
  [switch]$VerifyPersistence
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'Native-Restaurant.Common.ps1')
Assert-RestaurantLoopbackAddress '127.0.0.1' 'PostgreSqlHost'
& (Join-Path $PSScriptRoot 'Test-RestaurantNativeRequirements.ps1') -RequirePostgreSql
$service = Get-RestaurantNativePostgreSqlService $ServiceName
if ($service.Status -ne 'Running') { throw "El servicio PostgreSQL '$($service.Name)' no está en ejecución." }

if ($null -eq $DatabasePassword) {
  $DatabasePassword = Read-Host -Prompt "Contraseña local de $DatabaseUser" -AsSecureString
}
$pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($DatabasePassword)
$plainPassword = $null
try {
  $plainPassword = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)
  $env:PGPASSWORD = $plainPassword
  $psql = Get-RestaurantPostgreSqlCommand 'psql'
  $psqlBase = @('-X', '--no-password', '-h', '127.0.0.1', '-p', $PostgreSqlPort, '-U', $DatabaseUser, '-d', 'postgres', '-v', 'ON_ERROR_STOP=1')

  $listenAddresses = (& $psql @psqlBase '-tAc' 'SHOW listen_addresses;').Trim()
  if ($LASTEXITCODE -ne 0) { throw 'No se pudo consultar listen_addresses de PostgreSQL.' }
  if ($listenAddresses -ne '127.0.0.1') {
    throw "PostgreSQL no está restringido exactamente a 127.0.0.1 (valor actual: '$listenAddresses'). Configúralo antes de continuar."
  }

  $listener = Get-NetTCPConnection -State Listen -LocalPort $PostgreSqlPort -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($null -eq $listener -or $listener.LocalAddress -ne '127.0.0.1') {
    throw "No se verificó una escucha PostgreSQL exclusiva en 127.0.0.1:$PostgreSqlPort."
  }
  & $psql @psqlBase '-tAc' 'SELECT 1;'
  if ($LASTEXITCODE -ne 0) { throw 'PostgreSQL no respondió a la consulta técnica.' }
  Write-Output "PostgreSQL nativo disponible y restringido a 127.0.0.1:$PostgreSqlPort."

  if (-not $VerifyPersistence) { return }
  $schema = 'phase_1_1_technical_verification'
  $existing = (& $psql @psqlBase '-tAc' "SELECT 1 FROM pg_namespace WHERE nspname = '$schema';").Trim()
  if ($existing) { throw "El esquema técnico $schema ya existe; no se toca para evitar eliminar datos ajenos." }

  $created = $false
  $verified = $false
  try {
    & $psql @psqlBase '-c' "CREATE SCHEMA $schema; CREATE TABLE $schema.marker (id integer primary key, value text not null); INSERT INTO $schema.marker VALUES (1, 'phase-1.1');"
    if ($LASTEXITCODE -ne 0) { throw 'No se pudo crear el marcador técnico temporal.' }
    $created = $true
    Restart-Service -Name $service.Name -ErrorAction Stop
    $deadline = (Get-Date).AddSeconds(60)
    do {
      & (Get-RestaurantPostgreSqlCommand 'pg_isready') -h 127.0.0.1 -p $PostgreSqlPort -U $DatabaseUser -d postgres | Out-Null
      if ($LASTEXITCODE -eq 0) { break }
      Start-Sleep -Milliseconds 750
    } while ((Get-Date) -lt $deadline)
    if ($LASTEXITCODE -ne 0) { throw 'PostgreSQL no volvió a estar listo tras el reinicio controlado.' }
    $marker = (& $psql @psqlBase '-tAc' "SELECT value FROM $schema.marker WHERE id = 1;").Trim()
    if ($marker -ne 'phase-1.1') { throw 'El marcador técnico no persistió tras reiniciar PostgreSQL.' }
    $verified = $true
    Write-Output 'Persistencia PostgreSQL verificada con marcador técnico aislado.'
  } finally {
    if ($created -and $verified) {
      & $psql @psqlBase '-c' "DROP SCHEMA $schema CASCADE;"
      if ($LASTEXITCODE -ne 0) { throw "La persistencia se verificó, pero no se pudo eliminar el esquema técnico $schema." }
      Write-Output "Esquema técnico temporal $schema eliminado."
    }
  }
} finally {
  Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
  if ($null -ne $pointer) { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer) }
}
