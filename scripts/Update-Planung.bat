@echo off
setlocal
cd /d "%~dp0.."
python tools\planning\plan_automation.py all
if errorlevel 1 (
  echo.
  echo Planung konnte nicht aktualisiert werden.
  exit /b 1
)
echo.
echo Planung aktualisiert.
exit /b 0
