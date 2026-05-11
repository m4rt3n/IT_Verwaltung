// Office wizard summary, key input and export actions.

function officeProfileName(){
  const s = officeWizardState;
  if(!s) return 'Office-Profil';
  if(s.profileName && s.profileName.trim()) return s.profileName.trim().replace(/[^A-Za-z0-9._-]+/g,'-');
  const parts = [s.generation.toUpperCase(), s.edition, s.channel];
  if(s.packages.project) parts.push('Project');
  if(s.packages.visio) parts.push('Visio');
  parts.push(officeSelectedLanguages().join('-'));
  if(s.assetId) parts.push(s.assetId);
  return parts.filter(Boolean).join('-').replace(/[^A-Za-z0-9._-]+/g,'-');
}

function officeConfigureCommand(){return `"E:\\Microsoft Office\\setup.exe" /Configure "E:\\Microsoft Office\\profiles\\${officeProfileName()}\\configuration.xml"`;}
function officeRegImportCommand(){return `reg import "E:\\Microsoft Office\\profiles\\${officeProfileName()}\\MSO-Config.reg"`;}

function officeWizardSummaryList(){
  const s = officeWizardState;
  const gen = OFFICE_GENERATIONS[s.generation];
  const edition = gen.editions.find(e=>e.id === s.edition) || gen.editions[0];
  return `<div class="kv">${kv('Ziel', s.target)}${kv('Asset-Kontext', s.assetId || '-')}${kv('Profilname', officeProfileName())}${kv('Version', gen.label)}${kv('Edition', edition.label)}${kv('Lizenzmodell', s.licenseModel)}${kv('Kanal', s.channel)}${kv('Product-IDs', officeSelectedProducts().map(p=>p.id).join(', '))}${kv('Sprachen', officeSelectedLanguages().join(', '))}</div>`;
}

function officeWizardRisks(){
  const s = officeWizardState;
  const risks = [];
  if(s.packages.project || s.packages.visio) risks.push({level:'danger', text:'Project/Visio benötigen eine dokumentierte Lizenz- und Asset-Zuordnung.'});
  if(s.options.removeAll) risks.push({level:'danger', text:'Remove All entfernt vorhandene Office-Installationen.'});
  if(s.options.removeMSI) risks.push({level:'warning', text:'RemoveMSI entfernt alte MSI-basierte Office-Versionen.'});
  if(s.options.forceAppShutdown) risks.push({level:'warning', text:'ForceAppShutdown kann offene Office-Anwendungen schließen.'});
  if(s.licenseModel === 'MAK') risks.push({level:'warning', text:'MAK/Product Keys dürfen nicht im Repo oder Knowledge gespeichert werden.'});
  if(s.target === 'Terminalserver/RDS') risks.push({level:'warning', text:'RDS/Terminalserver braucht bewusst gesetzte Shared-Computer-Lizenzierung.'});
  if(s.policies.importReg) risks.push({level:'warning', text:'REG-Import ändert produktive Office-/Windows-Policy-Werte.'});
  if(!risks.length) risks.push({level:'success', text:'Aktuelle Auswahl hat keine besonderen Wizard-Risiken.'});
  return risks;
}

function officeWizardRisksHtml(){return `<div class="office-risk-list mt-3">${officeWizardRisks().map(r=>`<div class="alert alert-${r.level} py-2">${safeEscape(r.text)}</div>`).join('')}</div>`;}
function officeWizardPolicySummary(){
  const s = officeWizardState;
  const enabled = Object.entries(s.policies).filter(([,v])=>v).map(([k])=>k);
  return `<div class="office-summary-card mt-3"><div class="knowledge-section-title">REG-Ausgabe</div><div class="admin-risk-row">${enabled.map(k=>`<span class="admin-risk admin-risk-write">${safeEscape(k)}</span>`).join('')}</div><div class="logic-hint mt-2">Kanal: ${safeEscape(s.channel)} · Lizenzmodell: ${safeEscape(s.licenseModel)}</div></div>`;
}
function officeWizardPackagePreview(){return `<div class="office-summary-card mt-3"><div class="knowledge-section-title">Aktuelle Product-IDs</div><div class="admin-risk-row">${officeSelectedProducts().map(p=>`<span class="admin-risk admin-risk-artifact">${safeEscape(p.id)}</span>`).join('')}</div></div>`;}
function officeWizardContextHint(){if(!officeWizardState.assetId) return ''; const a = (typeof CORE !== 'undefined' && CORE.findAsset) ? CORE.findAsset(officeWizardState.assetId) : (DB.assets || []).find(x=>x['Asset-ID'] === officeWizardState.assetId); return a ? `<div class="alert alert-info mt-3">Asset-Kontext: <b>${safeEscape(a['Gerätename'])}</b>, ${safeEscape(a.Standort || '-')}/${safeEscape(a.Raum || '-')}</div>` : '';}
function officeProductsNeedingKeys(){
  return officeSelectedProducts().filter(p => /Volume$/i.test(p.id) || /^ProjectPro|^VisioPro/i.test(p.id));
}
function officeWizardProductKeyInputs(){
  const products = officeProductsNeedingKeys();
  if(!products.length){
    return `<div class="alert alert-info mt-3">Für diese Auswahl sind keine temporären Product-Key-Felder nötig. Microsoft 365 wird üblicherweise über Konto/Tenant lizenziert.</div>`;
  }
  return `<div class="office-key-panel mt-3">
    <div class="d-flex justify-content-between gap-2 flex-wrap align-items-start">
      <div>
        <div class="knowledge-section-title">Temporäre Product Keys</div>
        <p class="text-muted mb-2">Die Eingaben werden nicht in CSV, Knowledge oder LocalStorage gespeichert. Sie landen nur in der aktuell kopierten oder heruntergeladenen XML.</p>
      </div>
      <button class="btn btn-sm btn-outline-danger" onclick="clearOfficeWizardKeys()">Schlüssel verwerfen</button>
    </div>
    <div class="form-grid">
      ${products.map(product => {
        const key = officeWizardState.productKeys?.[product.id] || '';
        const valid = !key || officeProductKeyLooksValid(key);
        return `<div>
          <label class="form-label">${safeEscape(product.id)}</label>
          <input type="password" class="form-control office-wiz-field" autocomplete="off" spellcheck="false" data-office-path="productKeys.${safeEscape(product.id)}" value="${safeEscape(key)}" oninput="officeWizardSaveFields(); renderOfficeConfigWizard();" placeholder="XXXXX-XXXXX-XXXXX-XXXXX-XXXXX">
          <div class="logic-hint ${valid ? '' : 'text-danger'}">${valid ? 'Optional, nur lokal für diese Ausgabe.' : 'Format prüfen: 5 Blöcke mit je 5 Zeichen.'}</div>
        </div>`;
      }).join('')}
    </div>
  </div>`;
}
function officeProductKeyLooksValid(value){
  return /^[A-Z0-9]{5}(-[A-Z0-9]{5}){4}$/i.test(String(value || '').trim());
}
function clearOfficeWizardKeys(){
  if(officeWizardState) officeWizardState.productKeys = {};
  renderOfficeConfigWizard();
  notify('Temporäre Product Keys verworfen.', 'info');
}
function copyOfficeWizardXml(){officeWizardSaveFields(); copyCommand(buildOfficeConfigurationXml());}
function downloadOfficeWizardXml(){officeWizardSaveFields(); downloadBlob(buildOfficeConfigurationXml(), `${officeProfileName() || 'office-configuration'}.configuration.xml`, 'application/xml;charset=utf-8'); toast('Office-Konfiguration erstellt.');}
function copyOfficeWizardReg(){officeWizardSaveFields(); copyCommand(buildOfficeRegistryConfig());}
function downloadOfficeWizardReg(){officeWizardSaveFields(); downloadBlob(buildOfficeRegistryConfig(), 'MSO-Config.reg', 'text/plain;charset=utf-8'); toast('Office-Registry-Konfiguration erstellt.');}
function copyOfficeWizardReadme(){officeWizardSaveFields(); copyCommand(buildOfficeWizardReadme());}
function downloadOfficeWizardReadme(){officeWizardSaveFields(); downloadBlob(buildOfficeWizardReadme(), 'README.txt', 'text/plain;charset=utf-8'); toast('Office-README erstellt.');}
