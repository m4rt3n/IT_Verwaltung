@echo off
setlocal
cd /d "%~dp0.."
echo IT-Verwaltung - Windows Hardware Scanner STABLE v43
echo.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0..\tools\hardware_scanner\Scan-WindowsInventory.ps1" -HardwareOnly
echo.
pause
