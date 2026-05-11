// Software full-scan display names, labels and risk classification.

function softwareFullDisplayName(row){
  let name = String(row.DisplayName || row.Name || '').trim();
  if(!name) return 'Software';
  const family = softwareFullFamily({...row, Name:name, DisplayName:''});
  if(family) return family.family;
  name = name.replace(/^[A-Z0-9]{4,}\./, '');
  name = name.replace(/^(Microsoft|Windows)\./, '');
  name = name.replace(/Desktop$/i, '');
  name = name.replace(/\s+app$/i, '');
  const normalizedFamily = softwareFullFamily({...row, Name:name, DisplayName:''});
  if(normalizedFamily) return normalizedFamily.family;
  if(/^Chocolatey/i.test(name)) return 'Chocolatey';
  if(/^Microsoft Visual Studio Code/i.test(name) || /^Visual Studio Code/i.test(name)) return 'Visual Studio Code';
  if(/^Python\s+\d/i.test(name) && !/^Python Launcher/i.test(name)) return 'Python';
  if(/^Microsoft Edge$|^MicrosoftEdge\.Stable$/i.test(name)) return 'Microsoft Edge';
  if(/^Microsoft Office LTSC|^MicrosoftOfficeHub$/i.test(name)) return 'Microsoft Office';
  if(/^LibreOffice/i.test(name) || /^soffice$/i.test(name)) return 'LibreOffice';
  const aliasKey = name.replace(/[^A-Za-z0-9]/g, '').toLowerCase();
  const aliases = {
    '7zfm':'7-Zip',
    '7zip':'7-Zip',
    'acrord32':'Adobe Acrobat Reader',
    'acrobatreader':'Adobe Acrobat Reader',
    'adobeacrobat64bit':'Adobe Acrobat',
    'adobeacrobat':'Adobe Acrobat',
    'adobeacrobatdccoreapp':'Adobe Acrobat',
    'adobeacrobaticondccoreapp':'Adobe Acrobat',
    'acrobatnotificationclient':'Adobe Acrobat',
    'adobenotificationclient':'Adobe Acrobat',
    'adoberefreshmanager':'Adobe Acrobat',
    'chocolateyinstallonly':'Chocolatey',
    'chocolateygui':'Chocolatey',
    'code':'Visual Studio Code',
    'microsoftvisualstudiocodeuser':'Visual Studio Code',
    'microsoftvisualstudiocodecli':'Visual Studio Code',
    'soffice':'LibreOffice',
    whatsappdesktop:'WhatsApp',
    whatsapp:'WhatsApp',
    googlechrome:'Google Chrome',
    chrome:'Google Chrome',
    microsoftteams:'Microsoft Teams',
    teams:'Microsoft Teams'
  };
  return aliases[aliasKey] || name.trim();
}

function softwareFullFamily(row){
  const name = String(row.DisplayName || row.Name || '').trim();
  const publisher = String(row.Publisher || row.Hersteller || '').trim();
  const packageType = String(row.PackageType || row.Pakettyp || '').trim();
  const source = String(row.Sources || row.Source || row.Quelle || '').trim();
  const raw = String(row.RawSourceKey || row.RawPath || row.InstallLocation || '').trim();
  const haystack = `${name} ${publisher} ${packageType} ${source} ${raw}`;
  const fields = [name, publisher, packageType, source, raw, haystack];
  return SOFTWARE_FULL_FAMILY_RULES.find(rule=>rule.patterns.some(pattern=>fields.some(value=>pattern.test(value)))) || null;
}

function softwareFullProductHint(row){
  const config = DB.softwareClassification || {};
  const hints = config.productHints || {};
  const name = String(row.DisplayName || softwareFullDisplayName(row) || '').trim();
  return hints[name] || {};
}

function softwareFullClass(row){
  const hint = softwareFullProductHint(row);
  if(hint.class) return hint.class;
  const category = softwareFullCategory(row);
  const packageType = String(row.PackageType || row.Pakettyp || '').toLowerCase();
  const name = String(row.DisplayName || row.Name || '').toLowerCase();
  const publisher = String(row.Publisher || row.Hersteller || '').toLowerCase();
  if(category === 'system') return 'windows';
  if(packageType.includes('driver')) return 'driver';
  if(packageType.includes('service')) return 'service';
  if(category === 'component') return 'runtime';
  if(/defender|sophos|security|antivirus|bitlocker|firewall|endpoint/.test(`${name} ${publisher}`)) return 'security';
  if(/powershell|putty|winscp|sysinternals|chocolatey|uniget|winget|glpi|deskupdate|backup|partition|remote|ssh|scanner/.test(name)) return 'admin';
  if(/python|git|visual studio|code|intellij|unity|node|npm|java|jdk|sdk/.test(name)) return 'development';
  if(!publisher || publisher === '-' || String(row.DetectionConfidence || '').toLowerCase() === 'low') return 'unclear';
  return 'productivity';
}

function softwareFullClassLabel(row){
  const labels = (DB.softwareClassification || {}).classLabels || {};
  const swClass = softwareFullClass(row);
  return labels[swClass] || swClass || 'Unklar';
}

function softwareFullRisk(row){
  const hint = softwareFullProductHint(row);
  if(hint.risk) return hint.risk;
  const swClass = softwareFullClass(row);
  if(['admin','security'].includes(swClass)) return 'high';
  if(['development','driver','productivity'].includes(swClass)) return 'medium';
  return 'low';
}

function softwareFullLabels(row){
  const hint = softwareFullProductHint(row);
  const labels = new Set(Array.isArray(hint.labels) ? hint.labels : []);
  const swClass = softwareFullClass(row);
  const scope = String(row.Scope || row.BenutzerKontext || '').toLowerCase();
  const packageType = String(row.PackageType || row.Pakettyp || '').toLowerCase();
  const confidence = String(row.DetectionConfidence || '').toLowerCase();
  if(swClass === 'windows') labels.add('Windows-Bordmittel');
  if(swClass === 'runtime') labels.add('Komponente');
  if(swClass === 'admin') labels.add('Admin-/IT-Tool');
  if(swClass === 'development') labels.add('Entwicklung');
  if(swClass === 'security') labels.add('Security-relevant');
  if(packageType.includes('portable')) labels.add('Portable');
  if(scope.includes('user')) labels.add('Benutzerinstallation');
  if(confidence === 'low' || swClass === 'unclear') labels.add('Pruefen');
  scannerUncertaintyLabels(row).forEach(label => labels.add(label));
  return Array.from(labels);
}

function softwareFullProfileStatus(row){
  const asset = softwareFullAsset(row);
  const config = DB.softwareClassification || {};
  const profiles = config.standardProfiles || {};
  const type = asset?.['Asset-Typ'] || 'Desktop';
  const profile = profiles[type] || profiles.Desktop || [];
  const name = row.DisplayName || softwareFullDisplayName(row);
  if(!Array.isArray(profile) || !profile.length) return 'Kein Profil';
  return profile.includes(name) ? 'Standardprofil' : 'Zusatzsoftware';
}

function softwareFullLogo(row){
  const hint = softwareFullProductHint(row);
  if(hint.logo) return hint.logo;
  const name = String(row.DisplayName || softwareFullDisplayName(row) || '').trim();
  return name.split(/\s+/).slice(0,2).map(part=>part[0]).join('').toUpperCase() || 'SW';
}

function softwareFullLogoPath(row){
  const hint = softwareFullProductHint(row);
  return hint.logoPath || '';
}

function renderSoftwareFullLogo(row, size='list'){
  const path = softwareFullLogoPath(row);
  const text = softwareFullLogo(row);
  const title = row.DisplayName || softwareFullDisplayName(row);
  if(path){
    return `<span class="software-logo-mark software-logo-${size}" title="${safeEscape(title)}"><img src="${safeEscape(path)}" alt="${safeEscape(title)} Logo" onerror="this.style.display='none';this.parentNode.classList.add('logo-fallback');this.parentNode.dataset.logo='${safeEscape(text)}';"></span>`;
  }
  return `<span class="software-logo-mark software-logo-${size} logo-fallback" data-logo="${safeEscape(text)}" title="${safeEscape(title)}"></span>`;
}

function softwareFullUpdateAssessment(row){
  const normalized = normalizeUpdateStatus(row);
  if(normalized === 'UpdateAvailable'){
    const latest = row.LatestVersion ? ` -> ${row.LatestVersion}` : '';
    return `Update verfuegbar${latest} (${row.UpdateSource || 'Quelle unbekannt'})`;
  }
  if(normalized === 'Current') return 'Aktuell';
  if(normalized === 'Error') return 'Update-Pruefung fehlerhaft';
  if(normalized === 'Unknown') return 'Update unbekannt';
  if(row.UpdateStatus === 'NoUpdateKnown') return 'Kein Update aus Quellen bekannt';
  if(normalized === 'NotChecked') return 'Update nicht geprüft';
  const source = String(row.Sources || row.Source || row.Quelle || '').toLowerCase();
  const swClass = softwareFullClass(row);
  if(swClass === 'windows' || swClass === 'runtime') return 'System-/Komponentenpflege';
  if(source.includes('winget')) return 'Winget erkannt, Upgrade-Abgleich möglich';
  if(source.includes('choco')) return 'Chocolatey erkannt, Upgrade-Abgleich möglich';
  if(source.includes('pip') || source.includes('npm')) return 'Paketmanager erkannt, Version prüfen';
  return 'Manuell prüfen';
}

function normalizeUpdateStatus(row){
  const raw = String(row.UpdateStatus || row['Update-Status'] || '').toLowerCase();
  const available = String(row.UpdateAvailable || '').toLowerCase();
  if(available === 'true' || raw.includes('available') || raw.includes('verfüg') || raw.includes('verfueg')) return 'UpdateAvailable';
  if(raw.includes('current') || raw.includes('aktuell') || raw.includes('ok')) return 'Current';
  if(raw.includes('error') || raw.includes('fehler') || raw.includes('warn')) return 'Error';
  if(raw.includes('notchecked') || raw.includes('not checked') || raw.includes('nicht geprüft') || raw.includes('nicht gepr')) return 'NotChecked';
  if(raw.includes('unknown') || raw.includes('unbekannt')) return 'Unknown';
  return raw ? 'Unknown' : 'NotChecked';
}

function scannerUncertaintyLabels(row){
  const labels = [];
  const type = String(row['Asset-Typ'] || row.DeviceType || '').trim().toLowerCase();
  const connection = String(row.Verbindungstyp || row.ConnectionType || '').trim().toLowerCase();
  const blob = Object.values(row || {}).join(' ').toLowerCase();
  if(type === 'desktop') labels.push('Typ Desktop pruefen');
  if(connection === '' || connection === 'lan/wlan') labels.push('Verbindung unsicher');
  if(/to be filled|system product name|o\.e\.m\.|oem|default string|not specified|unknown/i.test(blob)) labels.push('OEM-Platzhalter');
  return labels;
}

function softwareFullSourceTrust(row){
  const source = String(row.Sources || row.Source || row.Quelle || row.PackageType || row.Pakettyp || '').toLowerCase();
  if(source.includes('winget') || source.includes('registry')) return {level:'hoch', text:'Hohe Verlässlichkeit'};
  if(source.includes('appx') || source.includes('msix') || source.includes('choco')) return {level:'mittel', text:'Mittlere Verlässlichkeit'};
  if(source.includes('pip') || source.includes('npm') || source.includes('service') || source.includes('driver')) return {level:'niedrig', text:'Technischer Kontext, fachlich prüfen'};
  return {level:'unklar', text:'Quelle unbekannt'};
}

function softwareFullVersion(row){
  const raw = String(row.Version || '').trim();
  const matches = raw.match(/[0-9]+(?:\.[0-9A-Za-z-]+)+/g);
  return matches && matches.length ? matches[matches.length - 1] : raw;
}

function softwareFamilyParts(row){
  const name = String(row.DisplayName || row.Softwarename || row.Name || '').trim();
  const source = String(row.Sources || row.Source || row.Quelle || row.PackageType || '').trim();
  const version = softwareFullVersion(row);
  const family = name
    .replace(/\b\d+(?:\.\d+)+\b/g, '')
    .replace(/\b(x64|x86|64-bit|32-bit|deutsch|german|english)\b/ig, '')
    .replace(/\s+/g, ' ')
    .trim();
  return {family: family || name, version, source};
}
