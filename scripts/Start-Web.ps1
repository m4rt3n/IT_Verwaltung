$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

if (Get-Command python -ErrorAction SilentlyContinue) {
    python app_server.py
} elseif (Get-Command py -ErrorAction SilentlyContinue) {
    py app_server.py
} else {
    throw "Python wurde nicht gefunden."
}
