[CmdletBinding(SupportsShouldProcess)]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'Native-Restaurant.Common.ps1')
$directory = Get-RestaurantNativeProcessDirectory
$records = @(Get-ChildItem -LiteralPath $directory -Filter '*.json' -File -ErrorAction SilentlyContinue)
if ($records.Count -eq 0) {
  Write-Output 'No hay procesos nativos iniciados por Restaurant OS para detener.'
  return
}

foreach ($recordFile in $records) {
  $record = Get-Content -Raw -LiteralPath $recordFile.FullName | ConvertFrom-Json
  $process = Get-Process -Id $record.processId -ErrorAction SilentlyContinue
  if ($null -eq $process) {
    Remove-Item -LiteralPath $recordFile.FullName -Force
    continue
  }
  $startedAt = $process.StartTime.ToUniversalTime()
  $recordedStart = [datetime]$record.startedAtUtc
  if ([math]::Abs(($startedAt - $recordedStart).TotalSeconds) -gt 1) {
    throw "El PID $($record.processId) ya no corresponde al proceso registrado '$($record.name)'; no se detuvo."
  }
  if ($PSCmdlet.ShouldProcess("PID $($record.processId) ($($record.name))", 'Detener proceso iniciado por Restaurant OS')) {
    Stop-Process -Id $record.processId -Force
    if ($record.PSObject.Properties.Name -contains 'launcherProcessId') {
      $launcher = Get-Process -Id $record.launcherProcessId -ErrorAction SilentlyContinue
      if ($null -ne $launcher) {
        $launcherStart = $launcher.StartTime.ToUniversalTime()
        $recordedLauncherStart = [datetime]$record.launcherStartedAtUtc
        if ([math]::Abs(($launcherStart - $recordedLauncherStart).TotalSeconds) -le 1) {
          Stop-Process -Id $record.launcherProcessId -Force
        }
      }
    }
    Remove-Item -LiteralPath $recordFile.FullName -Force
    Write-Output "Proceso nativo detenido: $($record.name) (PID $($record.processId))."
  }
}
