@echo off
setlocal
cd /d "%~dp0.."
echo IT-Verwaltung - WebApp Syntax Check
echo.

python -m py_compile app_server.py
if errorlevel 1 (
  echo Python-Syntax FEHLER.
  exit /b 1
)
echo Python-Syntax OK.

python tools\quality_check.py
if errorlevel 1 (
  echo Quality-Check FEHLER.
  exit /b 1
)
echo Quality-Check OK.

echo.
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "$tokens=$null;$errors=$null;$null=[System.Management.Automation.Language.Parser]::ParseFile('%~dp0..\tools\hardware_scanner\Scan-WindowsInventory.ps1',[ref]$tokens,[ref]$errors); if($errors.Count -gt 0){$errors | Format-List; exit 1}else{Write-Host 'PowerShell-Syntax OK' -ForegroundColor Green}"
if errorlevel 1 (
  echo PowerShell-Syntax FEHLER.
  exit /b 1
)

echo.
set "NODE_EXE="
set "NODE_SOURCE="
for /f "delims=" %%N in ('where node 2^>nul') do if not defined NODE_EXE (
  set "NODE_EXE=%%N"
  set "NODE_SOURCE=Standard Node.js aus PATH"
)
if not defined NODE_EXE if exist "%ProgramFiles%\nodejs\node.exe" (
  set "NODE_EXE=%ProgramFiles%\nodejs\node.exe"
  set "NODE_SOURCE=Standard Node.js unter Program Files"
)
if not defined NODE_EXE if exist "%ProgramFiles(x86)%\nodejs\node.exe" (
  set "NODE_EXE=%ProgramFiles(x86)%\nodejs\node.exe"
  set "NODE_SOURCE=Standard Node.js unter Program Files x86"
)
if not defined NODE_EXE if exist "%LocalAppData%\Programs\nodejs\node.exe" (
  set "NODE_EXE=%LocalAppData%\Programs\nodejs\node.exe"
  set "NODE_SOURCE=Standard Node.js im Benutzerprofil"
)
if not defined NODE_EXE if exist "%ProgramFiles%\Adobe\Adobe Creative Cloud Experience\libs\node.exe" (
  set "NODE_EXE=%ProgramFiles%\Adobe\Adobe Creative Cloud Experience\libs\node.exe"
  set "NODE_SOURCE=Fallback: Adobe Creative Cloud Node"
)
if not defined NODE_EXE if exist "%ProgramFiles%\Common Files\Adobe\Creative Cloud Libraries\libs\node.exe" (
  set "NODE_EXE=%ProgramFiles%\Common Files\Adobe\Creative Cloud Libraries\libs\node.exe"
  set "NODE_SOURCE=Fallback: Adobe Creative Cloud Libraries Node"
)
if not defined NODE_EXE (
  echo JavaScript-Syntax NICHT GEPRUEFT: node ist nicht installiert oder nicht im PATH.
  echo Installiere Node.js oder fuege node zum PATH hinzu, dann erneut starten.
  exit /b 2
)

echo Node gefunden: "%NODE_EXE%"
echo Node-Quelle: %NODE_SOURCE%
echo JavaScript-Dateien werden geprueft:
for %%F in (web_ui\js\*.js) do (
  echo   %%F
  "%NODE_EXE%" --check "%%F"
  if errorlevel 1 (
    echo JavaScript-Syntax FEHLER in %%F.
    exit /b 1
  )
)
echo JavaScript-Syntax OK.

echo.
call scripts\Smoke-Test.bat
if errorlevel 1 (
  echo Smoke-Test FEHLER.
  exit /b 1
)
echo Smoke-Test OK.

echo.
echo Zusammenfassung:
echo   Python-Syntax: OK
echo   Quality-Check: OK
echo   PowerShell-Syntax: OK
echo   JavaScript-Syntax: OK
echo   Smoke-Test: OK
echo Alle verfuegbaren Checks OK.
exit /b 0
