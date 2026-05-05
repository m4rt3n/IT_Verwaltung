@echo off
setlocal
cd /d "%~dp0"
python app_server.py
if errorlevel 1 (
  echo.
  echo Python konnte nicht mit "python" gestartet werden. Versuche "py"...
  py app_server.py
)
pause
