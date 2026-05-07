@echo off
setlocal
cd /d "%~dp0.."
echo IT-Verwaltung - Windows Software Scanner STABLE v44 / Full Software Scan
echo.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0..\tools\hardware_scanner\Scan-WindowsInventory.ps1" -FullSoftwareScan
echo.
pause
