
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$Web = Join-Path $Root "web_ui"
$Port = 8765
Start-Process "http://localhost:$Port"
Set-Location $Web
python -m http.server $Port
