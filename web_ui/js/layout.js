// Generic linked/simple module rendering and split-list layout helpers.

function renderLinkedModule(mod){if(mod.key==='software')return renderSoftwareModern();const sourceRows=DB[mod.key]||[];const rows=filterRows(sourceRows,mod.key);const idx=clamp(selectedIndex[mod.key],rows.length);selectedIndex[mod.key]=idx;const row=rows[idx]||null;return contextHeader(mod)+renderListControls(mod.key,sourceRows)+toolbar(mod,row,idx)+renderSplit(mod.key,rows,moduleColumns(mod.key),row,renderModuleCard(mod,row,idx,rows.length));}
function renderSimpleModule(mod){const sourceRows=DB[mod.key]||[];const rows=filterRows(sourceRows,mod.key);const idx=clamp(selectedIndex[mod.key],rows.length);selectedIndex[mod.key]=idx;const row=rows[idx]||null;return renderListControls(mod.key,sourceRows)+toolbar(mod,row,idx)+renderSplit(mod.key,rows,moduleColumns(mod.key),row,renderGenericCard(mod,row,idx,rows.length));}
function renderSplit(key,rows,cols,row,cardHtml){
  const empty = rows.length === 0
    ? `<tr><td colspan="${Math.max(cols.length,1)}">${emptyStateFor(key)}</td></tr>`
    : '';
  return `<div class="split"><div><div class="card"><div class="card-header">Liste</div><div class="card-body"><div class="table-wrap"><table class="table table-sm table-hover data-table"><thead><tr>${cols.map(c=>`<th>${safeEscape(c)}</th>`).join('')}</tr></thead><tbody>${empty || renderGroupedRows(key, rows, cols)}</tbody></table></div></div></div></div><div>${cardHtml}</div></div>`;
}
function renderGroupedRows(key, rows, cols){
  const group = listState(key).group;
  let last = null;
  return rows.map((r,i)=>{
    const current = group && group !== 'none' ? groupValue(key, r, group) : null;
    const header = current && current !== last ? `<tr class="table-group-row"><td colspan="${Math.max(cols.length,1)}">${safeEscape(current)}</td></tr>` : '';
    last = current || last;
    return header + `<tr class="${i===selectedIndex[key]?'active':''}" onclick="selectRow('${key}',${i})">${cols.map(c=>`<td>${formatCell(r,c)}</td>`).join('')}</tr>`;
  }).join('');
}
function groupValue(key,row,group){
  if(group === 'family') return softwareFamilyParts(row).family || 'Ohne Produktfamilie';
  return row[group] || 'Ohne Wert';
}
