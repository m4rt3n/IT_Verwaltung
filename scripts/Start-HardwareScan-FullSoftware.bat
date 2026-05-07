@echo off
setlocal
cd /d "%~dp0.."
echo IT-Verwaltung - Windows Hardware Scanner STABLE v43 / Full Software Scan
echo Hinweis: Dieser alte Startname ist ein Kompatibilitaetsalias.
echo Fuer getrennte Software-Scans bitte Start-SoftwareScan-Full.bat verwenden.
echo.
call "%~dp0Start-SoftwareScan-Full.bat"
