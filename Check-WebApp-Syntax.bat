@echo off
setlocal
cd /d "%~dp0"
echo IT-Verwaltung - WebApp Syntax Check
echo.

python -m py_compile app_server.py
if errorlevel 1 (
  echo Python-Syntax FEHLER.
  exit /b 1
)
echo Python-Syntax OK.

echo.
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "$tokens=$null;$errors=$null;$null=[System.Management.Automation.Language.Parser]::ParseFile('%~dp0tools\hardware_scanner\Scan-WindowsInventory.ps1',[ref]$tokens,[ref]$errors); if($errors.Count -gt 0){$errors | Format-List; exit 1}else{Write-Host 'PowerShell-Syntax OK' -ForegroundColor Green}"
if errorlevel 1 (
  echo PowerShell-Syntax FEHLER.
  exit /b 1
)

echo.
set "NODE_EXE="
for /f "delims=" %%N in ('where node 2^>nul') do if not defined NODE_EXE set "NODE_EXE=%%N"
if not defined NODE_EXE if exist "%ProgramFiles%\nodejs\node.exe" set "NODE_EXE=%ProgramFiles%\nodejs\node.exe"
if not defined NODE_EXE (
  echo JavaScript-Syntax NICHT GEPRUEFT: node ist nicht installiert oder nicht im PATH.
  echo Installiere Node.js oder fuege node zum PATH hinzu, dann erneut starten.
  exit /b 2
)

"%NODE_EXE%" --check web_ui\js\app.js
if errorlevel 1 (
  echo JavaScript-Syntax FEHLER.
  exit /b 1
)
echo JavaScript-Syntax OK.

echo.
echo Alle verfuegbaren Syntaxchecks OK.
exit /b 0
