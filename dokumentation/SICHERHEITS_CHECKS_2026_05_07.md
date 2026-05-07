# Sicherheits- und Smoke-Checks 2026-05-07

## Reproduzierbare Checks

```powershell
python -m py_compile app_server.py
scripts\Check-WebApp-Syntax.bat
scripts\Smoke-Test.bat
python tools\planning\plan_automation.py status
```

## Smoke-Test-Abdeckung

- `/api/status`
- `/api/load`
- `/api/help`
- `/api/software-full`
- Payloadvalidierung ueber `validate_payload()`
- Ablehnung fremder Origins bei POST
- Ablehnung unbekannter Scanner-Modi

## Nicht automatisiert

- Echter UAC-Doppelklick.
- Echte Browserinteraktion im Hilfe-Tab.
- Echter Scannerlauf mit erhoehten Rechten.

Diese Punkte duerfen nicht stillschweigend als real manuell getestet gelten.

