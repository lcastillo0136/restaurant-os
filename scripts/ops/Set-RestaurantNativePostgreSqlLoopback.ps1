[CmdletBinding(SupportsShouldProcess, ConfirmImpact = 'High')]
param(
  [string]$ServiceName,
  [ValidateRange(1, 65535)] [int]$PostgreSqlPort = 5432,
  [string]$DatabaseUser = 'postgres',
  [securestring]$DatabasePassword
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'Native-Restaurant.Common.ps1')
& (Join-Path $PSScriptRoot 'Test-RestaurantNativeRequirements.ps1') -RequirePostgreSql
$service = Get-RestaurantNativePostgreSqlService $ServiceName
if ($null -eq $DatabasePassword) {
  $DatabasePassword = Read-Host -Prompt "Contraseña local de $DatabaseUser" -AsSecureString
}
$pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($DatabasePassword)
try {
  $env:PGPASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)
  $psql = Get-RestaurantPostgreSqlCommand 'psql'
  if ($PSCmdlet.ShouldProcess($service.Name, 'Restringir PostgreSQL a 127.0.0.1 y reiniciar únicamente ese servicio')) {
    & $psql -X --no-password -h 127.0.0.1 -p $PostgreSqlPort -U $DatabaseUser -d postgres -v ON_ERROR_STOP=1 -c "ALTER SYSTEM SET listen_addresses = '127.0.0.1';"
    if ($LASTEXITCODE -ne 0) { throw 'No se pudo configurar listen_addresses para PostgreSQL.' }
    Restart-Service -Name $service.Name -ErrorAction Stop
    Write-Output "PostgreSQL '$($service.Name)' configurado para escuchar sólo en 127.0.0.1."
  }
} finally {
  Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
  if ($null -ne $pointer) { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer) }
}
