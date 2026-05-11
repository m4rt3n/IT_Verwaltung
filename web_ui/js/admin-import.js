// Admin CSV import assistant.

let CSV_IMPORT_PREVIEW_SOURCE = null;
let CSV_IMPORT_PREVIEW_RESULT = null;
let CSV_IMPORT_DRAFT = null;

function openCsvImportAssistant(){
  if(typeof requireWriteAccess === 'function' && !requireWriteAccess('CSV-Import prüfen')) return;
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.csv,text/csv';
  input.onchange = e=>{
    const file = e.target.files && e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = ()=>{
      try{
        CSV_IMPORT_PREVIEW_SOURCE = {text:String(reader.result || ''), filename:file.name};
        const result = analyzeCsvImport(CSV_IMPORT_PREVIEW_SOURCE.text, CSV_IMPORT_PREVIEW_SOURCE.filename);
        showCsvImportPreview(result);
      }catch(err){
        console.error(err);
        notify('CSV-Prüfung fehlgeschlagen: ' + err.message, 'error');
      }
    };
    reader.readAsText(file, 'utf-8');
  };
  input.click();
}

function detectDelimiter(text){
  const firstLine = String(text || '').split(/\r?\n/).find(line => line.trim()) || '';
  const semicolons = firstLine.split(';').length;
  const commas = firstLine.split(',').length;
  return semicolons >= commas ? ';' : ',';
}

function parseCsvLine(line, delimiter){
  const cells = [];
  let current = '';
  let quoted = false;
  for(let i=0;i<line.length;i++){
    const ch = line[i];
    if(ch === '"'){
      if(quoted && line[i+1] === '"'){
        current += '"';
        i++;
      }else{
        quoted = !quoted;
      }
      continue;
    }
    if(ch === delimiter && !quoted){
      cells.push(current);
      current = '';
      continue;
    }
    current += ch;
  }
  cells.push(current);
  return cells;
}

function parseCsvText(text){
  const delimiter = detectDelimiter(text);
  const lines = String(text || '').replace(/^\ufeff/, '').split(/\r?\n/).filter(line => line.trim());
  if(!lines.length) throw new Error('CSV-Datei ist leer.');
  const headers = parseCsvLine(lines[0], delimiter).map(h => h.trim());
  if(!headers.length || headers.every(h => !h)) throw new Error('CSV-Datei hat keine Kopfzeile.');
  const rows = lines.slice(1).map(line => {
    const cells = parseCsvLine(line, delimiter);
    const row = {};
    headers.forEach((header, index) => {
      row[header] = typeof cells[index] === 'undefined' ? '' : cells[index].trim();
    });
    return row;
  });
  return {delimiter, headers, rows};
}

function guessImportTarget(headers, filename){
  const defs = exportTableDefinitions();
  const lowerName = String(filename || '').toLowerCase();
  const byName = Object.entries(defs).find(([key, def]) => lowerName === def.filename.toLowerCase() || lowerName.includes(key));
  if(byName) return byName[0];
  let best = {key:'assets', score:-1};
  Object.entries(defs).forEach(([key, def]) => {
    const score = def.required.filter(col => headers.includes(col)).length + def.columns.filter(col => headers.includes(col)).length / 10;
    if(score > best.score) best = {key, score};
  });
  return best.key;
}

function normalizeCsvHeaderName(value){
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');
}

function defaultCsvColumnMapping(headers, def){
  const normalized = new Map(headers.map(header => [normalizeCsvHeaderName(header), header]));
  const mapping = {};
  def.columns.forEach(column => {
    if(headers.includes(column)){
      mapping[column] = column;
      return;
    }
    mapping[column] = normalized.get(normalizeCsvHeaderName(column)) || '';
  });
  return mapping;
}

function applyCsvColumnMapping(rawRows, def, mapping){
  return rawRows.map(raw => {
    const row = {};
    def.columns.forEach(column => {
      const source = mapping[column];
      row[column] = source ? (raw[source] || '') : '';
    });
    return row;
  });
}

function analyzeCsvImport(text, filename, requestedTarget='', requestedMapping=null){
  const parsed = parseCsvText(text);
  const defs = exportTableDefinitions();
  const guessedTarget = guessImportTarget(parsed.headers, filename);
  const target = defs[requestedTarget] ? requestedTarget : guessedTarget;
  const def = defs[target];
  const mapping = requestedMapping || defaultCsvColumnMapping(parsed.headers, def);
  const rows = applyCsvColumnMapping(parsed.rows, def, mapping);
  const missingColumns = def.required.filter(col => !mapping[col]);
  const existingIds = new Set((def.rows || []).map(row => String(row[def.id] || '').trim()).filter(Boolean));
  const seenIds = new Set();
  const rowIssues = [];
  const suggestions = {neu:0, update:0, doppelt:0, unklar:0};
  rows.forEach((row, index) => {
    const rowNumber = index + 2;
    const missingRequired = def.required.filter(col => !String(row[col] || '').trim());
    def.required.forEach(col => {
      if(!String(row[col] || '').trim()) rowIssues.push(`Zeile ${rowNumber}: Pflichtfeld ${col} fehlt`);
    });
    const id = String(row[def.id] || '').trim();
    let suggestion = missingRequired.length ? 'unklar' : 'neu';
    if(id){
      if(existingIds.has(id)){
        rowIssues.push(`Zeile ${rowNumber}: ${def.id} ${id} existiert bereits`);
        suggestion = 'update';
      }
      if(seenIds.has(id)){
        rowIssues.push(`Zeile ${rowNumber}: ${def.id} ${id} kommt mehrfach in der Importdatei vor`);
        suggestion = 'doppelt';
      }
      seenIds.add(id);
    }else{
      suggestion = 'unklar';
    }
    row.__vorschlag = suggestion;
    suggestions[suggestion] = (suggestions[suggestion] || 0) + 1;
  });
  return {
    filename,
    target,
    guessedTarget,
    manualTarget: !!requestedTarget && requestedTarget !== guessedTarget,
    tableTitle: target,
    delimiter: parsed.delimiter,
    headers: parsed.headers,
    targetColumns: def.columns,
    requiredColumns: def.required,
    mapping,
    rows,
    missingColumns,
    rowIssues,
    suggestions,
    previewRows: rows.slice(0, 8)
  };
}

function rerunCsvImportPreviewForTarget(target){
  if(!CSV_IMPORT_PREVIEW_SOURCE){
    notify('CSV-Quelle für die Vorschau ist nicht mehr vorhanden. Bitte Datei erneut öffnen.', 'warning');
    return;
  }
  try{
    showCsvImportPreview(analyzeCsvImport(CSV_IMPORT_PREVIEW_SOURCE.text, CSV_IMPORT_PREVIEW_SOURCE.filename, target));
  }catch(err){
    console.error(err);
    notify('CSV-Prüfung fehlgeschlagen: ' + err.message, 'error');
  }
}

function csvImportDraftSignature(result){
  return JSON.stringify({
    filename: result.filename,
    target: result.target,
    delimiter: result.delimiter,
    rows: result.rows.length,
    mapping: result.mapping
  });
}

function acceptCsvImportDraft(){
  if(!CSV_IMPORT_PREVIEW_RESULT){
    notify('Keine Importvorschau vorhanden.', 'warning');
    return;
  }
  const result = CSV_IMPORT_PREVIEW_RESULT;
  const acceptedRows = result.rows.filter(row => ['neu','update'].includes(row.__vorschlag));
  const discardedRows = result.rows.filter(row => !['neu','update'].includes(row.__vorschlag));
  CSV_IMPORT_DRAFT = {
    createdAt:new Date().toISOString(),
    filename:result.filename,
    target:result.target,
    mapping:{...result.mapping},
    signature:csvImportDraftSignature(result),
    rows:acceptedRows.map(row => ({...row})),
    discarded:discardedRows.length,
    suggestions:{...result.suggestions},
    backup:null,
    readyForApply:false
  };
  showCsvImportPreview(result);
  notify(`Importentwurf erstellt: ${acceptedRows.length} Zeile(n), ${discardedRows.length} verworfen.`, 'success');
}

async function prepareCsvImportDraftBackup(){
  if(!CSV_IMPORT_PREVIEW_RESULT || !CSV_IMPORT_DRAFT){
    notify('Bitte zuerst einen Importentwurf übernehmen.', 'warning');
    return;
  }
  if(CSV_IMPORT_DRAFT.signature !== csvImportDraftSignature(CSV_IMPORT_PREVIEW_RESULT)){
    notify('Der Importentwurf passt nicht mehr zur aktuellen Vorschau. Bitte Entwurf neu übernehmen.', 'warning');
    return;
  }
  if(!CSV_BACKEND_AVAILABLE){
    notify('Server-Backup ist nur mit aktivem CSV Backend möglich. Starte die App über start.bat.', 'warning');
    return;
  }
  const preview = csvBackupPreview();
  if(!safetyConfirm('Server-Backup vor Importübernahme erstellen?', 'Ohne erfolgreiches Backup bleibt die produktive Importübernahme gesperrt.\n\nBetroffene Tabellen:\n' + affectedTablesText(preview))){
    return;
  }
  try{
    const res = await fetch('/api/backup', {method:'POST', headers:apiPostHeaders()});
    if(!res.ok) throw new Error(await res.text());
    const data = await res.json();
    CSV_IMPORT_DRAFT.backup = data.backup || 'erstellt';
    CSV_IMPORT_DRAFT.backupAt = new Date().toISOString();
    const log = await writeCsvImportProtocol();
    CSV_IMPORT_DRAFT.protocol = log.log || 'erstellt';
    CSV_IMPORT_DRAFT.protocolAt = new Date().toISOString();
    CSV_IMPORT_DRAFT.readyForApply = true;
    showCsvImportPreview(CSV_IMPORT_PREVIEW_RESULT);
    notify('Server-Backup und Importprotokoll erstellt. Entwurf ist vorbereitet.', 'success');
  }catch(err){
    console.error(err);
    CSV_IMPORT_DRAFT.readyForApply = false;
    notify('Backup/Importprotokoll vor Importübernahme fehlgeschlagen: ' + err.message, 'error');
  }
}

async function writeCsvImportProtocol(){
  if(!CSV_IMPORT_DRAFT){
    throw new Error('Kein Importentwurf vorhanden.');
  }
  const payload = {
    filename:CSV_IMPORT_DRAFT.filename,
    target:CSV_IMPORT_DRAFT.target,
    backup:CSV_IMPORT_DRAFT.backup,
    rows:CSV_IMPORT_DRAFT.rows.length,
    discarded:CSV_IMPORT_DRAFT.discarded,
    suggestions:CSV_IMPORT_DRAFT.suggestions,
    mapping:CSV_IMPORT_DRAFT.mapping,
    signature:CSV_IMPORT_DRAFT.signature
  };
  const res = await fetch('/api/import-log', {
    method:'POST',
    headers:apiPostHeaders({'Content-Type':'application/json'}),
    body:JSON.stringify(payload)
  });
  if(!res.ok) throw new Error(await res.text());
  return res.json();
}

function discardCsvImportDraft(){
  CSV_IMPORT_DRAFT = null;
  if(CSV_IMPORT_PREVIEW_RESULT) showCsvImportPreview(CSV_IMPORT_PREVIEW_RESULT);
  notify('Importentwurf verworfen.', 'info');
}

function rerunCsvImportPreviewWithMapping(){
  const target = document.getElementById('csvImportTargetSelect')?.value || '';
  if(!CSV_IMPORT_PREVIEW_SOURCE || !target){
    notify('CSV-Quelle für die Vorschau ist nicht mehr vorhanden. Bitte Datei erneut öffnen.', 'warning');
    return;
  }
  const mapping = {};
  document.querySelectorAll('.csv-map-field').forEach(select => {
    mapping[select.dataset.targetColumn] = select.value;
  });
  try{
    showCsvImportPreview(analyzeCsvImport(CSV_IMPORT_PREVIEW_SOURCE.text, CSV_IMPORT_PREVIEW_SOURCE.filename, target, mapping));
  }catch(err){
    console.error(err);
    notify('CSV-Mapping konnte nicht geprüft werden: ' + err.message, 'error');
  }
}

function renderCsvTargetOptions(selected){
  const defs = exportTableDefinitions();
  return Object.entries(defs).map(([key, def]) => {
    const label = `${key} (${def.filename})`;
    return `<option value="${escapeHtml(key)}" ${key === selected ? 'selected' : ''}>${escapeHtml(label)}</option>`;
  }).join('');
}

function renderCsvMappingPanel(result){
  const sourceOptions = column => [
    `<option value="">Nicht zuordnen</option>`,
    ...result.headers.map(header => `<option value="${escapeHtml(header)}" ${result.mapping[column] === header ? 'selected' : ''}>${escapeHtml(header)}</option>`)
  ].join('');
  return `<div class="card mb-3">
    <div class="card-body">
      <div class="d-flex justify-content-between align-items-start gap-2 flex-wrap mb-2">
        <div>
          <div class="fw-bold">Spaltenmapping</div>
          <div class="form-text">Ordne CSV-Quellspalten den Zielspalten zu. Pflichtspalten sind markiert.</div>
        </div>
        <span class="badge text-bg-secondary">${result.headers.length} Quellspalten</span>
      </div>
      <div class="csv-mapping-grid">
        ${result.targetColumns.map(column => `<label class="csv-map-row">
          <span>${escapeHtml(column)}${result.requiredColumns.includes(column) ? ' *' : ''}</span>
          <select class="form-select form-select-sm csv-map-field" data-target-column="${escapeHtml(column)}" onchange="rerunCsvImportPreviewWithMapping()">
            ${sourceOptions(column)}
          </select>
        </label>`).join('')}
      </div>
    </div>
  </div>`;
}

function renderCsvDraftPanel(result){
  const signature = csvImportDraftSignature(result);
  const draftActive = CSV_IMPORT_DRAFT && CSV_IMPORT_DRAFT.signature === signature;
  const staleDraft = CSV_IMPORT_DRAFT && CSV_IMPORT_DRAFT.signature !== signature;
  if(draftActive){
    const backupHtml = CSV_IMPORT_DRAFT.readyForApply
      ? `<div class="alert alert-success py-2 mt-3 mb-0">Server-Backup: <b>${escapeHtml(CSV_IMPORT_DRAFT.backup || '-')}</b><br>Importprotokoll: <b>${escapeHtml(CSV_IMPORT_DRAFT.protocol || '-')}</b><br>Produktives Schreiben bleibt bis zum finalen Uebernahme-Schritt deaktiviert.</div>`
      : '<div class="alert alert-warning py-2 mt-3 mb-0">Vor produktiver Übernahme muessen zwingend Server-Backup und Importprotokoll erstellt werden.</div>';
    return `<div class="card mb-3 csv-draft-card">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-start gap-2 flex-wrap">
          <div>
            <div class="fw-bold">Importentwurf aktiv</div>
            <div class="text-muted">Temporär im Browser: ${CSV_IMPORT_DRAFT.rows.length} Zeile(n) für <b>${escapeHtml(CSV_IMPORT_DRAFT.target)}</b>, ${CSV_IMPORT_DRAFT.discarded} verworfen.</div>
          </div>
          <span class="badge text-bg-info">schreibgeschützt</span>
        </div>
        ${backupHtml}
      </div>
    </div>`;
  }
  return `<div class="card mb-3 csv-draft-card ${staleDraft ? 'csv-draft-stale' : ''}">
    <div class="card-body">
      <div class="d-flex justify-content-between align-items-start gap-2 flex-wrap">
        <div>
          <div class="fw-bold">Entwurfsmodus</div>
          <div class="form-text">${staleDraft ? 'Vorhandener Entwurf passt nicht mehr zur aktuellen Vorschau.' : 'Übernimmt plausible Zeilen nur in einen temporären Entwurf. Es werden keine produktiven Daten geschrieben.'}</div>
        </div>
        <span class="badge text-bg-secondary">neu/update: ${(result.suggestions.neu || 0) + (result.suggestions.update || 0)}</span>
      </div>
    </div>
  </div>`;
}

function showCsvImportPreview(result){
  CSV_IMPORT_PREVIEW_RESULT = result;
  const issues = [...result.missingColumns.map(c => `Pflichtspalte fehlt: ${c}`), ...result.rowIssues];
  const displayColumns = Array.from(new Set([...result.requiredColumns, ...result.targetColumns])).slice(0, 8);
  const columns = ['__vorschlag', ...displayColumns];
  const preview = result.previewRows.map(row => `<tr>${columns.map(col => `<td>${escapeHtml(col === '__vorschlag' ? row.__vorschlag : row[col])}</td>`).join('')}</tr>`).join('');
  const targetHint = result.manualTarget
    ? `<div class="alert alert-warning py-2">Manuelle Zieltabellen-Auswahl aktiv. Die automatische Erkennung war <b>${escapeHtml(result.guessedTarget)}</b>.</div>`
    : `<div class="alert alert-secondary py-2">Automatisch erkannte Zieltabellen-Auswahl: <b>${escapeHtml(result.guessedTarget)}</b>. Bei Bedarf manuell umstellen.</div>`;
  const html = `<div class="modal fade" id="csvImportPreviewModal" tabindex="-1">
    <div class="modal-dialog modal-xl modal-dialog-scrollable"><div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">CSV-Import prüfen</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body">
        <div class="alert alert-info">
          Diese Vorschau schreibt keine Daten. Übernahme bleibt gesperrt, bis Spaltenmapping, Backup und Importprotokoll vollständig umgesetzt sind.
        </div>
        <div class="card mb-3">
          <div class="card-body">
            <label for="csvImportTargetSelect" class="form-label fw-bold">Zieltabelle für Prüfung</label>
            <select id="csvImportTargetSelect" class="form-select" onchange="rerunCsvImportPreviewForTarget(this.value)">
              ${renderCsvTargetOptions(result.target)}
            </select>
            <div class="form-text">Die Auswahl ändert nur die Vorschau und Pflichtfeldprüfung. Es werden keine CSV-Daten geschrieben.</div>
          </div>
        </div>
        ${targetHint}
        ${renderCsvMappingPanel(result)}
        ${renderCsvDraftPanel(result)}
        <div class="kv mb-3">
          ${kv('Datei', result.filename)}
          ${kv('Geprüfte Tabelle', result.target)}
          ${kv('Automatische Erkennung', result.guessedTarget)}
          ${kv('Trennzeichen', result.delimiter === ';' ? 'Semikolon' : 'Komma')}
          ${kv('Zeilen', result.rows.length)}
          ${kv('Gemappte Pflichtspalten', `${result.requiredColumns.length - result.missingColumns.length} / ${result.requiredColumns.length}`)}
          ${kv('Vorschläge', `neu: ${result.suggestions.neu || 0}, update: ${result.suggestions.update || 0}, doppelt: ${result.suggestions.doppelt || 0}, unklar: ${result.suggestions.unklar || 0}`)}
        </div>
        ${issues.length ? `<div class="alert alert-warning"><b>Prüfhinweise</b><ul class="mb-0">${issues.slice(0,20).map(issue => `<li>${escapeHtml(issue)}</li>`).join('')}</ul>${issues.length>20?'<div>Weitere Hinweise gekürzt.</div>':''}</div>` : '<div class="alert alert-success">Pflichtfelder und IDs sehen in der Vorschau plausibel aus.</div>'}
        <div class="table-responsive">
          <table class="table table-sm table-striped">
            <thead><tr>${columns.map(col => `<th>${escapeHtml(col === '__vorschlag' ? 'Vorschlag' : col)}</th>`).join('')}</tr></thead>
            <tbody>${preview || '<tr><td>Keine Datenzeilen vorhanden.</td></tr>'}</tbody>
          </table>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline-danger" onclick="discardCsvImportDraft()" ${CSV_IMPORT_DRAFT ? '' : 'disabled'}>Entwurf verwerfen</button>
        <button class="btn btn-primary" onclick="acceptCsvImportDraft()">Entwurf übernehmen</button>
        <button class="btn btn-outline-primary" onclick="prepareCsvImportDraftBackup()" ${CSV_IMPORT_DRAFT ? '' : 'disabled'}>Backup vor Übernahme</button>
        <button class="btn btn-secondary" data-bs-dismiss="modal">Schließen</button>
      </div>
    </div></div>
  </div>`;
  const old = document.getElementById('csvImportPreviewModal');
  if(old) old.remove();
  document.body.insertAdjacentHTML('beforeend', html);
  const modalEl = document.getElementById('csvImportPreviewModal');
  const modal = new bootstrap.Modal(modalEl);
  modalEl.addEventListener('hidden.bs.modal', () => modalEl.remove(), {once:true});
  modal.show();
}
