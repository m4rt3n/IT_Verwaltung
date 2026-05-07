@echo off
setlocal
cd /d "%~dp0.."
echo IT-Verwaltung - Smoke-Test
echo.
python tools\smoke_test.py
exit /b %errorlevel%
