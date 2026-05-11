// Device wizard conditional and network validation logic.

// Conditional logic helpers
function isComputeType(type){return ['PC','Notebook','Thin Client'].includes(type);}
function isInfraType(type){return ['Access Point','Switch'].includes(type);}
function isPrinterType(type){return type==='Drucker';}
function isMonitorType(type){return type==='Monitor';}

// Wizard

// ===== v22 SAFE UX LOGIC =====
function getConnectionProfile(conn){
  const c = (conn || '').toLowerCase();
  if(c.includes('wlan')) return 'wlan';
  if(c.includes('vpn')) return 'vpn';
  if(c.includes('offline')) return 'offline';
  if(c.includes('poe')) return 'lan';
  if(c.includes('lan')) return 'lan';
  return 'other';
}
function getNetworkTypeFromConnection(conn){
  const p = getConnectionProfile(conn);
  if(p === 'wlan') return 'WLAN';
  if(p === 'vpn') return 'VPN';
  if(p === 'offline') return 'Offline';
  return 'LAN';
}
function filterConnectionTypes(networkType){
  const defaults = {
    LAN: ['LAN direkt Wanddose','LAN über Dockingstation','LAN über lokalen Switch','PoE direkt Switch'],
    WLAN: ['WLAN über Access Point'],
    VPN: ['VPN'],
    Offline: ['Offline']
  };

  const all = (STAMM.verbindungstypen && STAMM.verbindungstypen.length)
    ? STAMM.verbindungstypen
    : [...defaults.LAN, ...defaults.WLAN, ...defaults.VPN, ...defaults.Offline];

  const nt = String(networkType || '').toLowerCase();
  let filtered = [];

  if(nt.includes('wlan')){
    filtered = all.filter(x => String(x).toLowerCase().includes('wlan'));
    return filtered.length ? filtered : defaults.WLAN;
  }
  if(nt.includes('vpn')){
    filtered = all.filter(x => String(x).toLowerCase().includes('vpn'));
    return filtered.length ? filtered : defaults.VPN;
  }
  if(nt.includes('offline')){
    filtered = all.filter(x => String(x).toLowerCase().includes('offline'));
    return filtered.length ? filtered : defaults.Offline;
  }
  if(nt.includes('lan')){
    filtered = all.filter(x => {
      const v = String(x).toLowerCase();
      return (v.includes('lan') || v.includes('poe') || v.includes('wanddose') || v.includes('dock')) && !v.includes('wlan');
    });
    return filtered.length ? filtered : defaults.LAN;
  }

  return all;
}
function isValidIPv4(ip){
  if(!ip) return false;
  const parts = String(ip).trim().split('.');
  if(parts.length !== 4) return false;
  return parts.every(p => /^\d+$/.test(p) && Number(p) >= 0 && Number(p) <= 255);
}
function isValidMac(mac){
  if(!mac) return true;
  return /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test(String(mac).trim());
}
function networkValidationMessages(data){
  const n = data.netzwerk || data;
  const profile = getConnectionProfile(n.Verbindungstyp);
  const msgs = [];
  const warnings = [];

  if(!networkTypeMatchesConnection(n.Netzwerktyp, n.Verbindungstyp)){
    msgs.push('Netzwerktyp und Verbindungstyp passen nicht zusammen.');
  }

  if(profile === 'lan'){
    if(!n.SwitchPort && !n['Switch-Port']) msgs.push('LAN: Switch-Port ist Pflicht.');
    if(!n.Wanddose) warnings.push('LAN: Wanddose ist empfohlen.');
  }
  if(profile === 'wlan'){
    if(!n.AccessPoint && !n['Access Point']) msgs.push('WLAN: Access Point ist Pflicht.');
    if(!n.SSID) msgs.push('WLAN: SSID ist Pflicht.');
  }
  if(profile === 'vpn'){
    warnings.push('VPN: keine physische Infrastruktur erforderlich.');
  }
  if(profile === 'offline'){
    warnings.push('Offline: Netzwerkdaten werden bewusst leer gelassen.');
  }
  if(n.Adressart === 'Statisch'){
    const ip = n['IP-Adresse'] || n.IPAdresse || '';
    const dns = n.DNS || '';
    if(!ip) msgs.push('Statisch: IP-Adresse ist Pflicht.');
    else if(!isValidIPv4(ip)) msgs.push('IP-Adresse hat kein gültiges IPv4-Format.');
    if(!dns) msgs.push('Statisch: DNS-Eintrag ist Pflicht.');
  }
  if(n['MAC-Adresse'] && !isValidMac(n['MAC-Adresse'])) msgs.push('MAC-Adresse hat kein gültiges Format.');
  const vlan = String(n.VLAN || '').trim();
  if(vlan && vlan !== '-' && !/^\d{1,4}$/.test(vlan)) warnings.push('VLAN sollte als Zahl gepflegt werden.');
  if(/^\d+$/.test(vlan) && (Number(vlan) < 1 || Number(vlan) > 4094)) msgs.push('VLAN liegt ausserhalb des gültigen Bereichs 1-4094.');
  return {errors: msgs, warnings};
}
function resetNetworkFieldsForProfile(){
  if(!wizard || !wizard.data || !wizard.data.netzwerk) return;
  const n = wizard.data.netzwerk;
  const profile = getConnectionProfile(n.Verbindungstyp);
  n.Netzwerktyp = getNetworkTypeFromConnection(n.Verbindungstyp);

  if(n.Adressart === 'DHCP'){
    n['IP-Adresse'] = '';
    n.DNS = '';
  }

  if(profile === 'lan'){
    n.AccessPoint = '-';
    n.SSID = '-';
  }
  if(profile === 'wlan'){
    n.SwitchPort = '';
    n.Wanddose = '';
  }
  if(profile === 'vpn'){
    n.SwitchPort = '';
    n.Wanddose = '';
    n.AccessPoint = '-';
    n.SSID = '-';
    n.VLAN = '';
  }
  if(profile === 'offline'){
    n.Adressart = 'DHCP';
    n['IP-Adresse'] = '';
    n.DNS = '';
    n['MAC-Adresse'] = '';
    n.VLAN = '';
    n.SwitchPort = '';
    n.Wanddose = '';
    n.AccessPoint = '-';
    n.SSID = '-';
  }
}

function networkTypeMatchesConnection(networkType, connectionType){
  const nt = (networkType || '').toLowerCase();
  const profile = getConnectionProfile(connectionType);

  if(nt.includes('wlan')) return profile === 'wlan';
  if(nt.includes('vpn')) return profile === 'vpn';
  if(nt.includes('offline')) return profile === 'offline';
  if(nt.includes('lan')) return profile === 'lan';

  return true;
}
function normalizeNetworkSelection(){
  if(!wizard || !wizard.data || !wizard.data.netzwerk) return;
  const n = wizard.data.netzwerk;
  const allowed = filterConnectionTypes(n.Netzwerktyp);

  if(!allowed.includes(n.Verbindungstyp)){
    n.Verbindungstyp = allowed[0] || '';
  }

  resetNetworkFieldsForProfile();
}
function onWizardNetworkTypeChanged(){
  saveWizardFields();
  if(!wizard || !wizard.data || !wizard.data.netzwerk) return;
  const n = wizard.data.netzwerk;
  const allowed = filterConnectionTypes(n.Netzwerktyp);
  n.Verbindungstyp = allowed[0] || '';
  resetNetworkFieldsForProfile();
  renderWizard();
}

function onWizardConnectionTypeChanged(){
  saveWizardFields();
  if(!wizard || !wizard.data || !wizard.data.netzwerk) return;
  const n = wizard.data.netzwerk;
  n.Netzwerktyp = getNetworkTypeFromConnection(n.Verbindungstyp);
  resetNetworkFieldsForProfile();
  renderWizard();
}


function wizardSafeNotice(){
  if(!wizard || !wizard.data) return '';
  const type = wizard.data.type;
  if(isMonitorType(type)) return '<div class="alert alert-warning">Monitor: Netzwerk und Software sind nicht erforderlich. Nur Grunddaten/Hardware-Zuordnung pflegen.</div>';
  if(isInfraType(type)) return '<div class="alert alert-info">Infrastrukturgerät: Netzwerk-/Managementdaten sind besonders wichtig. Software wird eher als Firmware dokumentiert.</div>';
  if(isPrinterType(type)) return '<div class="alert alert-info">Drucker: Software-Step kann für Treiber/Druckserver genutzt werden.</div>';
  return '';
}
function renderValidationSummary(){
  if(!wizard || !wizard.data) return '';
  const net = (typeof networkValidationMessages === 'function') ? networkValidationMessages(wizard.data) : {errors:[], warnings:[]};
  const checks = [];
  const g = wizard.data.grund || {};
  if(!g.Standort) checks.push({level:'danger', text:'Standort fehlt'});
  if(!g.Raum) checks.push({level:'warning', text:'Raum fehlt'});
  if(!g.Hersteller) checks.push({level:'danger', text:'Hersteller fehlt'});
  if(!g.Modell) checks.push({level:'warning', text:'Modell ist leer'});
  (net.errors||[]).forEach(x=>checks.push({level:'danger', text:x}));
  (net.warnings||[]).forEach(x=>checks.push({level:'warning', text:x}));
  if(!checks.length) checks.push({level:'success', text:'Alle Pflichtprüfungen bestanden'});
  return `<div class="mt-3">
    <h5>Prüfstatus</h5>
    ${checks.map(c=>`<div class="alert alert-${c.level} py-2 mb-2">${c.text}</div>`).join('')}
  </div>`;
}
