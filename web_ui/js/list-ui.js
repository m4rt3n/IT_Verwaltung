// List filters, navigation and generic field formatting helpers.

function listFilterFields(key){
  return {
    assets:['Status','Standort','Raum','Hersteller'],
    hardware:['Gerätename'],
    software:['Hersteller','Update-Status','Kritikalität','Lizenzstatus'],
    netzwerk:['Netzwerktyp','Adressart','VLAN'],
    tickets:['Status','Kategorie','Priorität','Gerätename'],
    notizen:['Status','Kategorie'],
    knowledge:['Kategorie']
  }[key] || [];
}

function listGroupFields(key){
  return {
    assets:[['Standort','Standort'],['Raum','Raum']],
    software:[['Hersteller','Hersteller'],['family','Produktfamilie'],['Update-Status','Update-Status'],['Kritikalität','Kritikalität']],
    tickets:[['Status','Status'],['Kategorie','Kategorie'],['Priorität','Priorität'],['Gerätename','Asset']]
  }[key] || [];
}

function uniqueValues(rows, field){
  return Array.from(new Set(rows.map(r => String(r[field] || '').trim()).filter(Boolean))).sort((a,b)=>a.localeCompare(b,'de')).slice(0, 18);
}

function renderListControls(key, sourceRows){
  const state = listState(key);
  const fields = listFilterFields(key);
  const groupFields = listGroupFields(key);
  if(!fields.length && !groupFields.length) return '';
  const values = state.filterField ? uniqueValues(sourceRows, state.filterField) : [];
  return `<div class="card mb-2 list-controls"><div class="card-body d-flex flex-wrap gap-2 align-items-center">
    <select class="form-select form-select-sm list-select" onchange="setListState('${key}','sort',this.value)">
      <option value="smart" ${state.sort==='smart'?'selected':''}>Sortierung: Status + Name</option>
      <option value="name" ${state.sort==='name'?'selected':''}>Sortierung: Name</option>
      <option value="date" ${state.sort==='date'?'selected':''}>Sortierung: Datum/Garantie</option>
    </select>
    <select class="form-select form-select-sm list-select" onchange="setListState('${key}','filterField',this.value);setListState('${key}','filterValue','')">
      <option value="">Filterfeld</option>
      ${fields.map(field=>`<option value="${safeEscape(field)}" ${state.filterField===field?'selected':''}>${safeEscape(field)}</option>`).join('')}
    </select>
    <select class="form-select form-select-sm list-select" onchange="setListState('${key}','filterValue',this.value)" ${state.filterField?'':'disabled'}>
      <option value="">Alle Werte</option>
      ${values.map(value=>`<option value="${safeEscape(value)}" ${state.filterValue===value?'selected':''}>${safeEscape(value)}</option>`).join('')}
    </select>
    <select class="form-select form-select-sm list-select" onchange="setListState('${key}','group',this.value)">
      <option value="none">Keine Gruppierung</option>
      ${groupFields.map(([field,label])=>`<option value="${safeEscape(field)}" ${state.group===field?'selected':''}>Gruppe: ${safeEscape(label)}</option>`).join('')}
    </select>
    <button class="btn btn-sm btn-outline-secondary ${state.savedView==='incomplete'?'active':''}" onclick="setListState('${key}','savedView',listState('${key}').savedView==='incomplete'?'':'incomplete')">Fehlende Pflichtfelder</button>
    ${key!=='assets'?`<button class="btn btn-sm btn-outline-secondary ${state.savedView==='orphan'?'active':''}" onclick="setListState('${key}','savedView',listState('${key}').savedView==='orphan'?'':'orphan')">Ohne Asset</button>`:''}
    ${key==='tickets'?`<button class="btn btn-sm btn-outline-secondary ${state.savedView==='open_tickets'?'active':''}" onclick="setListState('${key}','savedView',listState('${key}').savedView==='open_tickets'?'':'open_tickets')">Offene Tickets</button>`:''}
    ${key==='assets'?`<button class="btn btn-sm btn-outline-secondary ${state.savedView==='scan_unknown'?'active':''}" onclick="setListState('${key}','savedView',listState('${key}').savedView==='scan_unknown'?'':'scan_unknown')">Scan unbekannt</button>`:''}
    <button class="btn btn-sm btn-outline-secondary" onclick="LIST_STATE['${key}']={sort:'smart',group:'none',filterField:'',filterValue:'',savedView:''};saveListState();render()">Zurücksetzen</button>
    ${renderQuickFilterChips(key)}
  </div></div>`;
}

function renderQuickFilterChips(key){
  const chips = {
    software:[
      ['scan_standard','Scan-Standard'],
      ['incomplete','Prüfen'],
      ['orphan','Ohne Asset']
    ],
    assets:[
      ['incomplete','Unvollständig'],
      ['scan_unknown','Scan fehlt']
    ],
    tickets:[
      ['open_tickets','Offen'],
      ['incomplete','Pflichtfelder']
    ]
  }[key] || [];
  if(!chips.length) return '';
  return `<div class="quick-filter-chips">${chips.map(([view,label])=>`<button class="btn btn-sm btn-outline-primary ${listState(key).savedView===view?'active':''}" onclick="setListState('${key}','savedView',listState('${key}').savedView==='${view}'?'':'${view}')">${label}</button>`).join('')}</div>`;
}

function openContextHelp(slug){
  if(typeof setHelpArticle === 'function') setHelpArticle(slug);
  activeKey = 'help';
  renderAll();
}

function renderAssets(){
  const sourceRows = DB.assets || [];
  const rows = filterRows(sourceRows, 'assets');
  const idx = clamp(selectedIndex.assets, rows.length);
  selectedIndex.assets = idx;
  const row = rows[idx] || null;

  const actions = row && canWrite() ? `
    <div class="alert alert-info py-2 mb-2">
      Neue Assets werden weiterhin über <b>+ Neues Gerät erfassen</b> erstellt.
      Bestehende Assets können hier bearbeitet oder gelöscht werden.
    </div>
    <div class="d-flex gap-2 mb-2">
      <button class="btn btn-outline-primary" onclick="openEdit('assets',${idx})">Asset bearbeiten</button>
      <button class="btn btn-outline-danger" onclick="deleteAssetWithReferences(${idx})">Asset löschen</button>
    </div>
  ` : row ? '<div class="alert alert-secondary py-2 mb-2">Normalmodus: Assets können angesehen, aber nicht geändert werden.</div>' : '';

  return renderListControls('assets', sourceRows) + actions + renderSplit('assets', rows, assetColumns(), row, renderAssetCard(row, idx, rows.length));
}

function formatCell(row,key){
  const text = val(row,key);
  if(!searchText.trim()) return safeEscape(text);
  const escaped = safeEscape(text);
  const q = safeEscape(searchText.trim()).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return escaped.replace(new RegExp(q, 'ig'), match => `<mark>${match}</mark>`);
}
function selectRow(key,idx){selectedIndex[key]=idx;render();}
function prevRow(key){if(typeof selectedIndex[key] !== 'number') return; selectedIndex[key]--;render();}
function nextRow(key){if(typeof selectedIndex[key] !== 'number') return; selectedIndex[key]++;render();}
function nav(key,idx,total){return `<div class="card"><div class="card-body d-flex justify-content-between align-items-center"><button class="btn btn-outline-primary" onclick="prevRow('${key}')">←</button><b>${total?idx+1:0} / ${total}</b><button class="btn btn-outline-primary" onclick="nextRow('${key}')">→</button></div></div>`;}
function navCustom(idx,total,setter){return `<div class="card"><div class="card-body d-flex justify-content-between align-items-center"><button class="btn btn-outline-primary" onclick="${setter}(${Math.max(0,idx-1)})">←</button><b>${total?idx+1:0} / ${total}</b><button class="btn btn-outline-primary" onclick="${setter}(${total?Math.min(total-1,idx+1):0})">→</button></div></div>`;}
function assetColumns(){return ['Asset-ID','Gerätename','Asset-Typ','Standort','Status','Hauptnutzer','Inventarnummer'];}
function moduleColumns(key){const m={hardware:['Hardware-ID','Asset-ID','Gerätename','CPU','RAM','Speicher'],netzwerk:['Netzwerk-ID','Asset-ID','Gerätename','Adressart','Verbindungstyp','IP-Adresse'],software:['Software-ID','Asset-ID','Gerätename','Softwarename','Version','Lizenzstatus'],tickets:['Ticket-ID','Asset-ID','Gerätename','Titel','Status','Priorität'],notizen:['Notiz-ID','Asset-ID','Gerätename','Titel','Kategorie','Status'],knowledge:['Knowledge-ID','Titel','Kategorie','Tags']};return m[key]||Object.keys((DB[key]||[])[0]||{}).slice(0,6);}

function displayFieldLabel(moduleKey, field){
  const map = {
    hardware: {
      'Hersteller':'Gerätehersteller',
      'Modell':'Gerätemodell',
      'Modellserie':'Geräte-Modellserie',
      'Bemerkung':'Hardware-Bemerkung'
    },
    software: {
      'Hersteller':'Softwarehersteller',
      'Softwarename':'Software / Anwendung',
      'Version':'Softwareversion',
      'Bemerkung':'Software-Bemerkung'
    },
    netzwerk: {
      'Hersteller':'Netzwerkhersteller',
      'DNS':'DNS-Eintrag',
      'IP-Adresse':'IP-Adresse',
      'MAC-Adresse':'MAC-Adresse',
      'Bemerkung':'Netzwerk-Bemerkung'
    }
  };
  return (map[moduleKey] && map[moduleKey][field]) ? map[moduleKey][field] : field;
}

function htmlToPlainText(value){
  return String(value || '')
    .replace(/<h[1-6][^>]*>/gi, '\n\n## ')
    .replace(/<\/h[1-6]>/gi, '\n')
    .replace(/<li[^>]*>/gi, '\n- ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|h1|h2|h3|li)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
function kv(k,v){
  const value = (v === undefined || v === null || v === '') ? '-' : v;
  return `<div class="k">${safeEscape(k)}</div><div>${safeEscape(htmlToPlainText(value))}</div>`;
}
function small(title,body){return `<div class="card mini-card"><div class="card-body"><b>${title}</b><div class="preline mt-2">${body||'-'}</div></div></div>`;}
