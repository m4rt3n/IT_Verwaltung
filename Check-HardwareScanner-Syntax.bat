@echo off
setlocal
cd /d "%~dp0"
echo IT-Verwaltung - Scanner Syntax Check v43
echo.
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "$tokens=$null;$errors=$null;$null=[System.Management.Automation.Language.Parser]::ParseFile('%~dp0tools\hardware_scanner\Scan-WindowsInventory.ps1',[ref]$tokens,[ref]$errors); if($errors.Count -gt 0){$errors | Format-List; exit 1}else{Write-Host 'PowerShell Syntax OK' -ForegroundColor Green}"
echo.
pause
