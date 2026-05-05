@echo off
setlocal
cd /d "%~dp0"
echo IT-Verwaltung - Windows Hardware Scanner STABLE v43 / Full Software Scan
echo.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0tools\hardware_scanner\Scan-WindowsInventory.ps1" -FullSoftwareScan
echo.
pause
