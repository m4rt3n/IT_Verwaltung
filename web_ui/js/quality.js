// Data quality checks and Stammdaten consistency findings.

function duplicateKeys(rows, keyFn){
  const seen = new Map();
  rows.forEach(row => {
    const key = keyFn(row);
    if(!key) return;
    if(!seen.has(key)) seen.set(key, []);
    seen.get(key).push(row);
  });
  return Array.from(seen.entries()).filter(([,items]) => items.length > 1);
}

function dataQualityFindings(){
  const findings = [];
  duplicateKeys(DB.assets || [], a => String(a['Gerätename'] || '').toLowerCase()).forEach(([key,items]) => findings.push(`Doppelter Gerätename: ${key} (${items.length})`));
  duplicateKeys(DB.assets || [], a => String(a.Seriennummer || '').toLowerCase()).forEach(([key,items]) => findings.push(`Doppelte Seriennummer: ${key} (${items.length})`));
  duplicateKeys(DB.assets || [], a => String(a.Inventarnummer || '').toLowerCase()).forEach(([key,items]) => findings.push(`Doppelte Inventarnummer: ${key} (${items.length})`));
  duplicateKeys(DB.netzwerk || [], n => String(n['MAC-Adresse'] || '').toLowerCase()).forEach(([key,items]) => findings.push(`Doppelte MAC-Adresse: ${key} (${items.length})`));
  duplicateKeys(DB.software || [], s => [s['Asset-ID'], String(s.Softwarename || '').toLowerCase(), String(s.Version || '').toLowerCase(), normalizeManufacturer(s.Hersteller).toLowerCase()].join('|')).forEach(([key,items]) => findings.push(`Doppelter Softwareeintrag: ${key} (${items.length})`));
  findings.push(...stammdatenFindings());
  return findings;
}

function stammdatenFindings(){
  const checks = [
    {table:'assets', field:'Asset-Typ', stamm:'assetTypen'},
    {table:'assets', field:'Status', stamm:'status'},
    {table:'assets', field:'Standort', stamm:'standorte'},
    {table:'assets', field:'Raum', stamm:'raeume'},
    {table:'assets', field:'Hersteller', stamm:'hersteller', normalize:normalizeManufacturer},
    {table:'netzwerk', field:'Netzwerktyp', stamm:'netzwerktypen'},
    {table:'netzwerk', field:'Adressart', stamm:'adressarten'},
    {table:'tickets', field:'Status', stamm:'ticketStatus'},
    {table:'tickets', field:'Priorität', stamm:'prioritaeten'}
  ];
  const findings = [];
  checks.forEach(check => {
    const allowed = new Set((STAMM[check.stamm] || []).map(x => String(x).toLowerCase()));
    if(!allowed.size) return;
    (DB[check.table] || []).forEach(row => {
      const raw = row[check.field];
      if(!raw) return;
      const value = check.normalize ? check.normalize(raw) : raw;
      if(!allowed.has(String(value).toLowerCase())) findings.push(`${check.table}.${check.field}: "${raw}" nicht in Stammdaten`);
    });
  });
  return findings;
}
