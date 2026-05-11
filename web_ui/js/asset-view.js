// Asset detail tabs and generic detail cards.

function setAssetDetailTab(tab){ASSET_DETAIL_TAB=tab;render();}
function assetTabButton(key,label,count){
  const active = ASSET_DETAIL_TAB === key ? 'active' : '';
  const suffix = count === undefined ? '' : ` <span class="badge text-bg-light text-dark">${count}</span>`;
  return `<button class="nav-link ${active}" onclick="setAssetDetailTab('${key}')">${label}${suffix}</button>`;
}
function assetRowsTable(rows, columns){
  if(!rows.length) return '<div class="text-muted">Keine Einträge vorhanden.</div>';
  return `<div class="table-responsive"><table class="table table-sm table-striped mb-0"><thead><tr>${columns.map(c=>`<th>${safeEscape(c)}</th>`).join('')}</tr></thead><tbody>${rows.map(row=>`<tr>${columns.map(c=>`<td>${safeEscape(row[c] || '-')}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}
function renderAssetHistory(a, related){
  const entries = [];
  if(a.Status) entries.push({type:'Status', text:a.Status});
  related.tickets.forEach(t=>entries.push({type:'Ticket', text:`${t.Titel || t['Ticket-ID']} [${t.Status || '-'}]`}));
  related.notes.forEach(n=>entries.push({type:'Notiz', text:n.Titel || n['Notiz-ID']}));
  related.software.forEach(s=>entries.push({type:'Software', text:s.Softwarename || s['Software-ID']}));
  if(!entries.length) return '<div class="text-muted">Noch keine Historienpunkte ableitbar.</div>';
  return `<ul class="list-group list-group-flush">${entries.map(entry=>`<li class="list-group-item d-flex justify-content-between gap-3"><span>${safeEscape(entry.text)}</span><span class="badge text-bg-secondary">${safeEscape(entry.type)}</span></li>`).join('')}</ul>`;
}
function renderAssetWorkflowActions(a){
  const assetArg = encodeURIComponent(a['Asset-ID'] || '');
  return `<div class="asset-workflow-actions d-flex flex-wrap gap-2 mt-3">
    <button class="btn btn-sm btn-primary" onclick="openTicketFromAsset(decodeURIComponent('${assetArg}'))">Ticket aus Asset</button>
    <button class="btn btn-sm btn-outline-secondary" onclick="createAssetWorkflowNote(decodeURIComponent('${assetArg}'),'move')">Umzug planen</button>
    <button class="btn btn-sm btn-outline-secondary" onclick="createAssetWorkflowNote(decodeURIComponent('${assetArg}'),'retire')">Ausmusterung planen</button>
    <button class="btn btn-sm btn-outline-secondary" onclick="createAssetWorkflowNote(decodeURIComponent('${assetArg}'),'inventory')">Inventur bestätigen</button>
    <button class="btn btn-sm btn-outline-secondary" onclick="createAssetWorkflowNote(decodeURIComponent('${assetArg}'),'loan')">Ausgabe/Rückgabe planen</button>
  </div>`;
}
function renderAssetTabContent(a, related){
  const hw = related.hardware[0] || null;
  const net = related.network[0] || null;
  if(ASSET_DETAIL_TAB === 'hardware') return hw ? `<div class="kv">${Object.entries(hw).map(([k,v])=>kv(displayFieldLabel('hardware',k),v)).join('')}</div>` : '<div class="text-muted">Keine Hardware erfasst.</div>';
  if(ASSET_DETAIL_TAB === 'software') return assetRowsTable(related.software, ['Software-ID','Softwarename','Version','Hersteller','Lizenzstatus','Update-Status']);
  if(ASSET_DETAIL_TAB === 'network') return net ? `<div class="kv">${Object.entries(net).map(([k,v])=>kv(displayFieldLabel('netzwerk',k),v)).join('')}</div>` : '<div class="text-muted">Keine Netzwerkdaten erfasst.</div>';
  if(ASSET_DETAIL_TAB === 'tickets') return assetRowsTable(related.tickets, ['Ticket-ID','Titel','Kategorie','Priorität','Status','Knowledge-ID']);
  if(ASSET_DETAIL_TAB === 'notes') return assetRowsTable(related.notes, ['Notiz-ID','Titel','Kategorie','Status','Inhalt']);
  if(ASSET_DETAIL_TAB === 'knowledge') return assetRowsTable(related.knowledge, ['Knowledge-ID','Titel','Kategorie','Tags','Lösung']);
  if(ASSET_DETAIL_TAB === 'history') return renderAssetHistory(a, related);
  return `<div class="row mt-3"><div class="col"><div class="kv">${kv('Asset-ID',a['Asset-ID'])}${kv('Standort',val(a,'Standort'))}${kv('Raum',val(a,'Raum'))}${kv('Hauptnutzer',val(a,'Hauptnutzer'))}</div></div><div class="col"><div class="kv">${kv('Hersteller',val(a,'Hersteller'))}${kv('Modell',val(a,'Modell'))}${kv('Betriebssystem',val(a,'Betriebssystem'))}${kv('Inventar',val(a,'Inventarnummer'))}</div></div></div>`;
}
function renderAssetCard(a,idx,total){
  if(!a) return '<div class="card"><div class="card-body">Keine Daten</div></div>';
  const id = a['Asset-ID'];
  const related = {
    hardware: byAsset('hardware', id),
    network: byAsset('netzwerk', id),
    software: byAsset('software', id),
    tickets: byAsset('tickets', id),
    notes: byAsset('notizen', id),
    knowledge: (DB.knowledge || []).filter(k => byAsset('tickets', id).some(t => t['Knowledge-ID'] && t['Knowledge-ID'] === k['Knowledge-ID']))
  };
  if(!['overview','hardware','software','network','tickets','notes','knowledge','history'].includes(ASSET_DETAIL_TAB)) ASSET_DETAIL_TAB = 'overview';
  return `${nav('assets',idx,total)}
  <div class="card mt-3">
    <div class="card-body">
      <div class="detail-title">${val(a,'Gerätename')}</div>
      <span class="badge text-bg-primary">${val(a,'Asset-Typ')}</span>
      <span class="badge text-bg-success">${val(a,'Status')}</span>
      ${renderAssetWorkflowActions(a)}
      <ul class="nav nav-pills mt-3 asset-detail-tabs">
        ${assetTabButton('overview','Übersicht')}
        ${assetTabButton('hardware','Hardware',related.hardware.length)}
        ${assetTabButton('software','Software',related.software.length)}
        ${assetTabButton('network','Netzwerk',related.network.length)}
        ${assetTabButton('tickets','Tickets',related.tickets.length)}
        ${assetTabButton('notes','Notizen',related.notes.length)}
        ${assetTabButton('knowledge','Knowledge',related.knowledge.length)}
        ${assetTabButton('history','Historie')}
      </ul>
      <div class="asset-detail-panel mt-3">${renderAssetTabContent(a, related)}</div>
    </div>
  </div>`;}
function renderModuleCard(mod,r,idx,total){if(!r)return '<div class="card"><div class="card-body">Keine Daten</div></div>';const a=assetFor(r);let main='';Object.entries(r).forEach(([k,v])=>main+=kv(displayFieldLabel(mod.key,k),v));return `${nav(mod.key,idx,total)}<div class="card mt-3 card-context-${mod.context||'default'}"><div class="card-body"><div class="detail-title">${r[mod.id]||mod.title}</div><span class="badge text-bg-primary">${mod.title}</span> <span class="badge text-bg-success">zugeordnet zu: ${assetName(r['Asset-ID'])}</span>${logicBadges(mod.key,r)}<div class="row mt-3"><div class="col"><h5>Eintrag</h5><div class="kv">${main}</div></div><div class="col"><h5>Zugeordnetes Asset</h5>${a?assetSummary(a):'<p>Kein Asset zugeordnet.</p>'}</div></div></div></div>`;}
function logicBadges(key,r){let out='';if(key==='tickets'&&r.Status==='Gelöst')out+='<div class="alert alert-success mt-2">Ticket ist gelöst: Knowledge-Erstellung ist sinnvoll.</div>';if(key==='netzwerk'&&r.Adressart==='DHCP')out+='<div class="alert alert-info mt-2">DHCP aktiv: IP-Adresse wird nicht manuell gepflegt.</div>';if(key==='netzwerk'&&r.Verbindungstyp.includes('WLAN'))out+='<div class="alert alert-info mt-2">WLAN aktiv: Access Point und SSID relevant.</div>';return out;}
function renderGenericCard(mod,r,idx,total){
  if(!r) return '<div class="card"><div class="card-body">Keine Daten</div></div>';
  if(mod.key === 'knowledge') return renderKnowledgeCard(mod,r,idx,total);
  let main='';
  Object.entries(r).forEach(([k,v])=>main+=kv(displayFieldLabel(mod.key,k),v));
  return `${nav(mod.key,idx,total)}<div class="card mt-3 card-context-${mod.context||'default'}"><div class="card-body"><div class="detail-title">${safeEscape(r[mod.id]||mod.title)}</div><div class="kv mt-3">${main}</div></div></div>`;
}

function assetSummary(a){return `<div class="kv">${kv('Asset-ID',val(a,'Asset-ID'))}${kv('Gerätename',val(a,'Gerätename'))}${kv('Typ',val(a,'Asset-Typ'))}${kv('Standort',val(a,'Standort')+' / '+val(a,'Raum'))}${kv('Nutzer',val(a,'Hauptnutzer'))}${kv('Status',val(a,'Status'))}</div>`;}
