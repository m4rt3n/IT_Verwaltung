// Dashboard topology view rendering.

function renderTopologyView(){
  const assets = DB.assets || [];
  const switches = assets.filter(a => (a['Asset-Typ']||'').toLowerCase().includes('switch'));
  const aps = assets.filter(a => (a['Asset-Typ']||'').toLowerCase().includes('access point'));
  const printers = assets.filter(a => (a['Asset-Typ']||'').toLowerCase().includes('drucker'));
  const servers = assets.filter(a => (a['Asset-Typ']||'').toLowerCase().includes('server'));
  const clients = assets.filter(a => ['PC','Notebook','Workstation','Thin Client'].includes(a['Asset-Typ']));
  const others = assets.filter(a => !switches.includes(a) && !aps.includes(a) && !printers.includes(a) && !servers.includes(a) && !clients.includes(a));

  return `<div class="topology-wrap">
    <div class="topology-toolbar">
      <span class="badge text-bg-primary">Topologie</span>
      <span class="text-muted">Unifi-ähnliche Sicht: Infrastruktur oben, Clients unten</span>
    </div>

    <div class="topology-stage">
      <svg class="topology-lines" viewBox="0 0 1200 620" preserveAspectRatio="none">
        ${topologyLines()}
      </svg>

      <div class="topology-layer layer-core">
        ${topologyNode({title:'Internet / WAN', subtitle:'Upstream', icon:'🌐', cls:'wan'})}
        ${topologyNode({title:'Firewall / Gateway', subtitle:'Router / DHCP / DNS', icon:'🛡️', cls:'gateway'})}
      </div>

      <div class="topology-layer layer-switch">
        ${switches.length ? switches.map(a=>topologyAssetNode(a,'switch')).join('') : topologyNode({title:'Core Switch', subtitle:'SW-CORE-01', icon:'🔀', cls:'switch'})}
        ${servers.map(a=>topologyAssetNode(a,'server')).join('')}
      </div>

      <div class="topology-layer layer-ap">
        ${aps.map(a=>topologyAssetNode(a,'ap')).join('')}
        ${printers.map(a=>topologyAssetNode(a,'printer')).join('')}
      </div>

      <div class="topology-layer layer-client">
        ${clients.map(a=>topologyAssetNode(a,'client')).join('')}
        ${others.map(a=>topologyAssetNode(a,'other')).join('')}
      </div>
    </div>
  </div>`;
}
function topologyNode(n){
  return `<div class="topology-node topo-${n.cls}">
    <div class="topo-icon">${n.icon}</div>
    <div class="topo-title">${escapeHtml(n.title)}</div>
    <div class="topo-sub">${escapeHtml(n.subtitle||'')}</div>
  </div>`;
}
function topologyAssetNode(a, cls){
  const id = a['Asset-ID'];
  const net = firstByAsset('netzwerk', id);
  const ip = net ? (net['IP-Adresse'] || net['Adressart'] || '-') : '-';
  const tickets = byAsset('tickets', id).length;
  const status = a.Status === 'Defekt' ? 'defect' : 'ok';
  return `<div class="topology-node topo-${cls} topo-status-${status}" onclick="openAssetFromGraph('${id}')">
    <div class="topo-icon">${topologyIcon(a['Asset-Typ'])}</div>
    <div class="topo-title">${escapeHtml(a['Gerätename'])}</div>
    <div class="topo-sub">${escapeHtml(a['Asset-Typ'])} · ${escapeHtml(ip)}</div>
    ${tickets ? `<div class="topo-ticket">${tickets} Ticket(s)</div>` : ''}
  </div>`;
}
function topologyIcon(type){
  const t = (type||'').toLowerCase();
  if(t.includes('switch')) return '🔀';
  if(t.includes('access point')) return '📡';
  if(t.includes('drucker')) return '🖨️';
  if(t.includes('notebook')) return '💻';
  if(t.includes('server')) return '🗄️';
  if(t.includes('workstation')) return '🧰';
  if(t.includes('thin')) return '🖥️';
  return '🖥️';
}
function topologyLines(){
  let lines = '';
  // WAN -> Gateway
  lines += `<path class="topo-line topo-line-core" d="M600 45 C600 70,600 70,600 95"/>`;
  // Gateway -> Switch Layer
  lines += `<path class="topo-line topo-line-core" d="M600 130 C600 180,600 180,600 220"/>`;
  // Switch -> AP/Printer
  lines += `<path class="topo-line topo-line-network" d="M600 260 C420 315,330 315,240 365"/>`;
  lines += `<path class="topo-line topo-line-network" d="M600 260 C600 315,600 315,600 365"/>`;
  lines += `<path class="topo-line topo-line-network" d="M600 260 C780 315,870 315,960 365"/>`;
  // AP/Printer -> Clients
  lines += `<path class="topo-line topo-line-client" d="M240 395 C240 460,360 470,430 515"/>`;
  lines += `<path class="topo-line topo-line-client" d="M600 395 C600 455,600 470,600 515"/>`;
  lines += `<path class="topo-line topo-line-client" d="M960 395 C960 460,840 470,770 515"/>`;
  return lines;
}
