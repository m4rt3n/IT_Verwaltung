@echo off
setlocal

net session >nul 2>&1
if %errorlevel% neq 0 (
  echo IT-Verwaltung wird mit Administratorrechten neu gestartet...
  powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process -FilePath '%~f0' -WorkingDirectory '%~dp0' -Verb RunAs"
  exit /b
)

cd /d "%~dp0"
python app_server.py
if errorlevel 1 (
  echo.
  echo Python konnte nicht mit "python" gestartet werden. Versuche "py"...
  py app_server.py
)
pause
