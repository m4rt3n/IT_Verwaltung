// Office Deployment Tool configuration wizard.
// Kept separate from app.js so Knowledge rendering stays readable.

const OFFICE_WIZARD_STEPS = ['Ziel','Version','Pakete','Sprachen','Optionen','Policies','Vorschau'];
const OFFICE_LANGUAGE_OPTIONS = [
  {id:'de-de', label:'Deutsch'},
  {id:'en-gb', label:'Englisch UK'},
  {id:'en-us', label:'Englisch US'},
  {id:'fr-fr', label:'Französisch'},
  {id:'es-es', label:'Spanisch'}
];
const OFFICE_GENERATIONS = {
  m365: {
    label:'Microsoft 365 Apps',
    defaultChannel:'Current',
    editions:[{id:'o365', label:'Microsoft 365 Apps for enterprise', product:'O365ProPlusRetail'}],
    channels:['Current','MonthlyEnterprise'],
    licenseModels:['Benutzerlizenz','Shared Computer Licensing','Device Based Licensing']
  },
  ltsc2024: {
    label:'Office LTSC 2024',
    defaultChannel:'PerpetualVL2024',
    editions:[
      {id:'standard2024', label:'Office Standard 2024 Volume', product:'Standard2024Volume'},
      {id:'proplus2024', label:'Office Professional Plus 2024 Volume', product:'ProPlus2024Volume'}
    ],
    channels:['PerpetualVL2024'],
    licenseModels:['KMS','MAK','Device Based Licensing']
  },
  ltsc2021: {
    label:'Office LTSC 2021',
    defaultChannel:'PerpetualVL2021',
    editions:[
      {id:'standard2021', label:'Office Standard 2021 Volume', product:'Standard2021Volume'},
      {id:'proplus2021', label:'Office Professional Plus 2021 Volume', product:'ProPlus2021Volume'}
    ],
    channels:['PerpetualVL2021'],
    licenseModels:['KMS','MAK']
  }
};

function defaultOfficeWizardState(){
  return {
    step:0,
    target:'Standardarbeitsplatz',
    assetId:'',
    generation:'m365',
    edition:'o365',
    licenseModel:'Benutzerlizenz',
    channel:'Current',
    languages:{'de-de':true,'en-gb':true,'en-us':true},
    packages:{languagePack:true, proofingTools:true, project:false, visio:false, teams:true, groove:true},
    options:{removeMSI:true, removeAll:false, forceUpgrade:true, officeMgmtCom:true, migrateArch:true, allowCdnFallback:true, forceAppShutdown:true, pinIcons:true, displayLevel:'Full'},
    policies:{enableUpdates:true, automaticUpdates:true, showUpdateButton:true, setChannelExposure:true, longPaths:true, outlookAutodiscover:true, officeFormats:false, importReg:false},
    productKeys:{},
    confirms:{licensedAddons:false, destructive:false, shutdown:false, registry:false},
    profileName:''
  };
}

function openOfficeConfigWizard(){
  officeWizardState = defaultOfficeWizardState();
  renderOfficeConfigWizard();
  new bootstrap.Modal(document.getElementById('officeConfigWizardModal')).show();
}

function ensureOfficeConfigWizardModal(){
  let el = document.getElementById('officeConfigWizardModal');
  if(el) return el;
  el = document.createElement('div');
  el.className = 'modal fade';
  el.id = 'officeConfigWizardModal';
  el.tabIndex = -1;
  el.innerHTML = `<div class="modal-dialog modal-xl modal-dialog-scrollable"><div class="modal-content">
    <div class="modal-header"><h5 class="modal-title">Office-Konfigurationswizard</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
    <div class="modal-body"><div id="officeWizardRoot"></div></div>
    <div class="modal-footer" id="officeWizardFooter"></div>
  </div></div>`;
  document.body.appendChild(el);
  return el;
}

function renderOfficeConfigWizard(){
  ensureOfficeConfigWizardModal();
  officeNormalizeSelection();
  const state = officeWizardState;
  document.getElementById('officeWizardRoot').innerHTML = `<div class="office-wizard">
    <div class="office-wizard-steps">${OFFICE_WIZARD_STEPS.map((step,i)=>`<button type="button" class="office-wizard-step ${i===state.step?'active':''} ${i<state.step?'done':''}" onclick="officeWizardGo(${i})">${i+1}. ${safeEscape(step)}</button>`).join('')}</div>
    ${officeWizardBody()}
  </div>`;
  const last = state.step === OFFICE_WIZARD_STEPS.length - 1;
  document.getElementById('officeWizardFooter').innerHTML = `<button class="btn btn-secondary" onclick="officeWizardBack()" ${state.step===0?'disabled':''}>Zurück</button>
    <button class="btn btn-primary ${last?'d-none':''}" onclick="officeWizardNext()">Weiter</button>
    <button class="btn btn-outline-primary ${last?'':'d-none'}" onclick="copyOfficeWizardXml()">XML kopieren</button>
    <button class="btn btn-success ${last?'':'d-none'}" onclick="downloadOfficeWizardXml()">XML herunterladen</button>`;
}

function officeWizardBody(){
  const s = officeWizardState;
  if(s.step === 0) return officeWizardTargetStep();
  if(s.step === 1) return officeWizardVersionStep();
  if(s.step === 2) return officeWizardPackageStep();
  if(s.step === 3) return officeWizardLanguageStep();
  if(s.step === 4) return officeWizardOptionsStep();
  if(s.step === 5) return officeWizardPoliciesStep();
  return officeWizardPreviewStep();
}

function officeWizardTargetStep(){
  const s = officeWizardState;
  return `<h4>Ziel und Profiltyp</h4>
    <div class="office-choice-grid">
      ${officeRadioCard('target','Standardarbeitsplatz','Standardarbeitsplatz','Normale Arbeitsplatzinstallation.')}
      ${officeRadioCard('target','Einzelgerät','Einzelgerät','Optional mit Asset-Kontext dokumentieren.')}
      ${officeRadioCard('target','Labor/Poolraum','Labor/Poolraum','Wiederverwendbares Raum- oder Poolprofil.')}
      ${officeRadioCard('target','Spezialarbeitsplatz','Spezialarbeitsplatz','Für Project, Visio oder besondere Lizenzierung.')}
      ${officeRadioCard('target','Terminalserver/RDS','Terminalserver/RDS','Prüft Shared Computer Licensing als Risikooption.')}
    </div>
    <div class="form-grid mt-3">
      <div>
        <label class="form-label">Asset-Kontext optional</label>
        <select class="form-select office-wiz-field" data-office-path="assetId" onchange="officeWizardSaveAndRender()">
          <option value="">Kein Einzelasset</option>
          ${(DB.assets || []).map(a=>`<option value="${safeEscape(a['Asset-ID'])}" ${s.assetId===a['Asset-ID']?'selected':''}>${safeEscape(a['Asset-ID'] + ' - ' + a['Gerätename'])}</option>`).join('')}
        </select>
        <div class="logic-hint">Der Wizard erzeugt keine Assetdaten; der Kontext hilft bei Profilname und Dokumentation.</div>
      </div>
      <div>
        <label class="form-label">Profilname</label>
        <input class="form-control office-wiz-field" data-office-path="profileName" value="${safeEscape(s.profileName || officeProfileName())}" oninput="officeWizardSaveFields()">
      </div>
    </div>
    ${officeWizardContextHint()}`;
}

function officeWizardVersionStep(){
  const s = officeWizardState;
  const gen = OFFICE_GENERATIONS[s.generation];
  return `<h4>Version und Lizenzmodell</h4>
    <div class="office-choice-grid">
      ${officeRadioCard('generation','m365','Microsoft 365 Apps','Aktuelle Microsoft-365-Apps mit Benutzer- oder Geräte-/Shared-Lizenz.')}
      ${officeRadioCard('generation','ltsc2024','Office LTSC 2024','Volumenlizenz-Installation mit PerpetualVL2024-Kanal.')}
      ${officeRadioCard('generation','ltsc2021','Office LTSC 2021','Bestandsstandard für Umgebungen, die noch auf 2021 bleiben.')}
    </div>
    <div class="form-grid mt-3">
      <div><label class="form-label">Edition</label><select class="form-select office-wiz-field" data-office-path="edition" onchange="officeWizardSaveAndRender()">${gen.editions.map(e=>`<option value="${safeEscape(e.id)}" ${s.edition===e.id?'selected':''}>${safeEscape(e.label)}</option>`).join('')}</select></div>
      <div><label class="form-label">Lizenzmodell</label><select class="form-select office-wiz-field" data-office-path="licenseModel" onchange="officeWizardSaveAndRender()">${gen.licenseModels.map(x=>`<option value="${safeEscape(x)}" ${s.licenseModel===x?'selected':''}>${safeEscape(x)}</option>`).join('')}</select></div>
      <div><label class="form-label">Updatekanal</label><select class="form-select office-wiz-field" data-office-path="channel" onchange="officeWizardSaveAndRender()">${gen.channels.map(x=>`<option value="${safeEscape(x)}" ${s.channel===x?'selected':''}>${safeEscape(x)}</option>`).join('')}</select></div>
    </div>
    ${officeWizardRisksHtml()}`;
}

function officeWizardPackageStep(){
  const s = officeWizardState;
  return `<h4>Pakete und Zusatzmodule</h4>
    <div class="office-toggle-grid">
      ${officeToggle('packages.languagePack','LanguagePack','Zusätzliche Office-Sprachpakete installieren.')}
      ${officeToggle('packages.proofingTools','ProofingTools','Korrekturhilfen für gewählte Sprachen.')}
      ${officeToggle('packages.project','Project Professional','Nur bei dokumentierter Lizenzzuordnung aktivieren.')}
      ${officeToggle('packages.visio','Visio Professional','Nur bei dokumentierter Lizenzzuordnung aktivieren.')}
      ${officeToggle('packages.teams','Lync/Skype ausschließen','Setzt ExcludeApp Lync.')}
      ${officeToggle('packages.groove','Groove ausschließen','Setzt ExcludeApp Groove.')}
    </div>
    ${(s.packages.project || s.packages.visio) ? `<label class="office-confirm mt-3"><input type="checkbox" class="office-wiz-field" data-office-path="confirms.licensedAddons" ${s.confirms.licensedAddons?'checked':''} onchange="officeWizardSaveAndRender()"> Lizenzzuordnung für Project/Visio ist dokumentiert.</label>` : ''}
    ${officeWizardPackagePreview()}`;
}

function officeWizardLanguageStep(){
  return `<h4>Sprachen auswählen</h4>
    <div class="office-preset-row">
      <button class="btn btn-outline-primary" onclick="officeSetLanguagePreset('de')">Deutsch only</button>
      <button class="btn btn-outline-primary" onclick="officeSetLanguagePreset('de-en')">Deutsch + Englisch</button>
      <button class="btn btn-outline-primary" onclick="officeSetLanguagePreset('multi')">Mehrsprachig</button>
    </div>
    <div class="office-toggle-grid mt-3">${OFFICE_LANGUAGE_OPTIONS.map(lang=>officeToggle('languages.' + lang.id, lang.label, lang.id)).join('')}</div>
    ${officeSelectedLanguages().length ? `<div class="alert alert-info mt-3">Ausgewählte Sprachen: ${officeSelectedLanguages().map(safeEscape).join(', ')}</div>` : '<div class="alert alert-danger mt-3">Mindestens eine Sprache auswählen.</div>'}`;
}

function officeWizardOptionsStep(){
  const s = officeWizardState;
  return `<h4>Installations- und Sicherheitsoptionen</h4>
    <div class="office-toggle-grid">
      ${officeToggle('options.removeMSI','Alte MSI-Office-Versionen entfernen','Setzt RemoveMSI All=TRUE.')}
      ${officeToggle('options.removeAll','Vorhandenes Office vollständig entfernen','Setzt Remove All=TRUE. Hohe Wirkung.')}
      ${officeToggle('options.forceUpgrade','ForceUpgrade','Erzwingt Upgradepfad innerhalb ODT.')}
      ${officeToggle('options.officeMgmtCom','OfficeMgmtCOM','Erlaubt Management durch Office-COM/Updateverwaltung.')}
      ${officeToggle('options.migrateArch','MigrateArch','Architekturwechsel ermöglichen.')}
      ${officeToggle('options.allowCdnFallback','CDN-Fallback erlauben','Fallback auf Microsoft CDN.')}
      ${officeToggle('options.forceAppShutdown','Office-Anwendungen schließen','Kann Benutzerarbeit unterbrechen.')}
      ${officeToggle('options.pinIcons','Icons an Taskleiste anheften','Setzt PinIconsToTaskbar.')}
    </div>
    <div class="form-grid mt-3"><div><label class="form-label">Anzeigelevel</label><select class="form-select office-wiz-field" data-office-path="options.displayLevel" onchange="officeWizardSaveAndRender()">${['Full','None'].map(x=>`<option value="${x}" ${s.options.displayLevel===x?'selected':''}>${x}</option>`).join('')}</select></div></div>
    ${s.options.removeAll ? `<label class="office-confirm mt-3"><input type="checkbox" class="office-wiz-field" data-office-path="confirms.destructive" ${s.confirms.destructive?'checked':''} onchange="officeWizardSaveAndRender()"> Ich bestätige, dass vorhandenes Office entfernt werden darf.</label>` : ''}
    ${s.options.forceAppShutdown ? `<label class="office-confirm mt-2"><input type="checkbox" class="office-wiz-field" data-office-path="confirms.shutdown" ${s.confirms.shutdown?'checked':''} onchange="officeWizardSaveAndRender()"> Benutzer sind informiert; Office-Anwendungen dürfen geschlossen werden.</label>` : ''}
    ${officeWizardRisksHtml()}`;
}

function officeWizardPoliciesStep(){
  const s = officeWizardState;
  return `<h4>Policies und Registry</h4>
    <p class="text-muted">Diese Auswahl erzeugt eine passende <code>MSO-Config.reg</code> zur ODT-XML. Die REG-Datei enthält keine Product Keys.</p>
    <div class="office-toggle-grid">
      ${officeToggle('policies.enableUpdates','Office-Updates aktivieren','Setzt enableupdates=1.')}
      ${officeToggle('policies.automaticUpdates','Automatische Updates aktivieren','Setzt enableautomaticupdates=1.')}
      ${officeToggle('policies.showUpdateButton','Update-Button sichtbar lassen','Setzt hideenabledisableupdates=0.')}
      ${officeToggle('policies.setChannelExposure','Updatekanal sichtbar schalten','Setzt passende Office Channel Exposure Werte.')}
      ${officeToggle('policies.longPaths','LongPaths aktivieren','Setzt LongPathsEnabled=1.')}
      ${officeToggle('policies.outlookAutodiscover','Outlook Autodiscover O365-Endpunkt ausschließen','Setzt ExcludeExplicitO365Endpoint=1.')}
      ${officeToggle('policies.officeFormats','Office-Standardformate setzen','Setzt optionale Word/Excel/PowerPoint DefaultFormat-Werte.')}
      ${officeToggle('policies.importReg','REG-Import als Nachlauf planen','Zeigt reg-import Befehl in der Zusammenfassung.')}
    </div>
    <label class="office-confirm mt-3"><input type="checkbox" class="office-wiz-field" data-office-path="confirms.registry" ${s.confirms.registry?'checked':''} onchange="officeWizardSaveAndRender()"> Registry-/Policy-Änderungen wurden fachlich geprüft und dürfen bereitgestellt werden.</label>
    ${officeWizardPolicySummary()}
    ${officeWizardRisksHtml()}`;
}

function officeWizardPreviewStep(){
  const xml = buildOfficeConfigurationXml();
  const reg = buildOfficeRegistryConfig();
  const readme = buildOfficeWizardReadme();
  return `<h4>Vorschau und Bereitstellung</h4>
    <div class="office-preview-grid">
      <div class="office-summary-card"><div class="knowledge-section-title">Zusammenfassung</div>${officeWizardSummaryList()}${officeWizardRisksHtml()}</div>
      <div class="office-summary-card"><div class="knowledge-section-title">Bereitstellung</div><p>Die XML und REG enthalten keine Product Keys. Speichere beide Dateien lokal in den Profilordner und nutze sie mit dem Office Deployment Tool.</p><code class="scanner-command">${safeEscape(officeConfigureCommand())}</code>${officeWizardState.policies.importReg ? `<code class="scanner-command mt-2">${safeEscape(officeRegImportCommand())}</code>` : ''}</div>
    </div>
    ${officeWizardProductKeyInputs()}
    <div class="knowledge-command mt-3"><div class="d-flex justify-content-between align-items-center gap-2 flex-wrap"><b>configuration.xml</b><div class="d-flex gap-2"><button class="btn btn-sm btn-outline-primary" onclick="copyOfficeWizardXml()">Kopieren</button><button class="btn btn-sm btn-primary" onclick="downloadOfficeWizardXml()">Herunterladen</button></div></div><pre><code>${safeEscape(xml)}</code></pre></div>
    <div class="knowledge-command mt-3"><div class="d-flex justify-content-between align-items-center gap-2 flex-wrap"><b>MSO-Config.reg</b><div class="d-flex gap-2"><button class="btn btn-sm btn-outline-primary" onclick="copyOfficeWizardReg()">Kopieren</button><button class="btn btn-sm btn-primary" onclick="downloadOfficeWizardReg()">Herunterladen</button></div></div><pre><code>${safeEscape(reg)}</code></pre></div>
    <div class="knowledge-command mt-3"><div class="d-flex justify-content-between align-items-center gap-2 flex-wrap"><b>README.txt</b><div class="d-flex gap-2"><button class="btn btn-sm btn-outline-primary" onclick="copyOfficeWizardReadme()">Kopieren</button><button class="btn btn-sm btn-primary" onclick="downloadOfficeWizardReadme()">Herunterladen</button></div></div><pre><code>${safeEscape(readme)}</code></pre></div>`;
}

function officeRadioCard(path, value, title, text){
  const current = getOfficePath(path);
  return `<label class="office-choice ${current===value?'selected':''}"><input type="radio" name="office-${safeEscape(path)}" class="office-wiz-field" data-office-path="${safeEscape(path)}" value="${safeEscape(value)}" ${current===value?'checked':''} onchange="officeWizardSaveAndRender()"><b>${safeEscape(title)}</b><span>${safeEscape(text)}</span></label>`;
}

function officeToggle(path, title, text){
  const checked = !!getOfficePath(path);
  return `<label class="office-toggle ${checked?'selected':''}"><input type="checkbox" class="office-wiz-field" data-office-path="${safeEscape(path)}" ${checked?'checked':''} onchange="officeWizardSaveAndRender()"><b>${safeEscape(title)}</b><span>${safeEscape(text)}</span></label>`;
}

function officeWizardGo(step){officeWizardSaveFields(); if(step > officeWizardState.step && !officeWizardCanContinue()) return; officeWizardState.step = Math.max(0, Math.min(OFFICE_WIZARD_STEPS.length - 1, step)); renderOfficeConfigWizard();}
function officeWizardBack(){officeWizardGo(officeWizardState.step - 1);}
function officeWizardNext(){officeWizardSaveFields(); if(!officeWizardCanContinue()) return; officeWizardState.step = Math.min(OFFICE_WIZARD_STEPS.length - 1, officeWizardState.step + 1); renderOfficeConfigWizard();}
function officeWizardSaveAndRender(){officeWizardSaveFields(); renderOfficeConfigWizard();}

function officeWizardSaveFields(){
  document.querySelectorAll('#officeConfigWizardModal .office-wiz-field').forEach(el=>{
    const path = el.dataset.officePath;
    if(!path) return;
    if(el.type === 'radio' && !el.checked) return;
    setOfficePath(path, el.type === 'checkbox' ? el.checked : el.value);
  });
  officeNormalizeSelection();
}

function getOfficePath(path){return path.split('.').reduce((obj,key)=>obj ? obj[key] : undefined, officeWizardState);}
function setOfficePath(path, value){const parts = path.split('.'); let obj = officeWizardState; parts.slice(0,-1).forEach(key=>{if(!obj[key]) obj[key] = {}; obj = obj[key];}); obj[parts[parts.length - 1]] = value;}

function officeNormalizeSelection(){
  const s = officeWizardState;
  if(!s) return;
  const gen = OFFICE_GENERATIONS[s.generation] || OFFICE_GENERATIONS.m365;
  if(!gen.editions.some(e=>e.id === s.edition)) s.edition = gen.editions[0].id;
  if(!gen.channels.includes(s.channel)) s.channel = gen.defaultChannel;
  if(!gen.licenseModels.includes(s.licenseModel)) s.licenseModel = gen.licenseModels[0];
  if(s.target === 'Terminalserver/RDS' && s.generation === 'm365') s.licenseModel = 'Shared Computer Licensing';
  if(s.generation === 'm365'){s.packages.project = false; s.packages.visio = false;}
  if(!officeSelectedLanguages().length) s.languages['de-de'] = true;
}

function officeWizardCanContinue(){
  const s = officeWizardState;
  const messages = [];
  if(s.step === 3 && !officeSelectedLanguages().length) messages.push('Bitte mindestens eine Sprache auswählen.');
  if(s.step >= 2 && (s.packages.project || s.packages.visio) && !s.confirms.licensedAddons) messages.push('Bitte die Lizenzzuordnung für Project/Visio bestätigen.');
  if(s.step >= 4 && s.options.removeAll && !s.confirms.destructive) messages.push('Bitte die Entfernung vorhandener Office-Installationen bestätigen.');
  if(s.step >= 4 && s.options.forceAppShutdown && !s.confirms.shutdown) messages.push('Bitte bestätigen, dass Benutzer informiert sind.');
  if(s.step >= 5 && !s.confirms.registry) messages.push('Bitte Registry-/Policy-Änderungen fachlich bestätigen.');
  const invalidKey = Object.values(s.productKeys || {}).find(key => key && !officeProductKeyLooksValid(key));
  if(invalidKey) messages.push('Bitte Product-Key-Format prüfen oder das Feld leer lassen.');
  if(messages.length){notify(messages[0], 'warning'); return false;}
  return true;
}

function officeSetLanguagePreset(kind){
  officeWizardSaveFields();
  const all = Object.fromEntries(OFFICE_LANGUAGE_OPTIONS.map(l=>[l.id,false]));
  if(kind === 'de') all['de-de'] = true;
  if(kind === 'de-en'){all['de-de'] = true; all['en-gb'] = true; all['en-us'] = true;}
  if(kind === 'multi') OFFICE_LANGUAGE_OPTIONS.forEach(l=>all[l.id] = true);
  officeWizardState.languages = all;
  renderOfficeConfigWizard();
}

function officeSelectedLanguages(){return Object.entries(officeWizardState?.languages || {}).filter(([,v])=>v).map(([k])=>k);}

function officeSelectedProducts(){
  const s = officeWizardState;
  const gen = OFFICE_GENERATIONS[s.generation] || OFFICE_GENERATIONS.m365;
  const edition = gen.editions.find(e=>e.id === s.edition) || gen.editions[0];
  const products = [{id:edition.product, languages:officeSelectedLanguages(), exclude:officeExcludedApps()}];
  if(s.generation !== 'm365' && s.packages.project) products.push({id:s.generation === 'ltsc2021' ? 'ProjectPro2021Volume' : 'ProjectPro2024Volume', languages:officeSelectedLanguages(), exclude:officeExcludedApps()});
  if(s.generation !== 'm365' && s.packages.visio) products.push({id:s.generation === 'ltsc2021' ? 'VisioPro2021Volume' : 'VisioPro2024Volume', languages:officeSelectedLanguages(), exclude:officeExcludedApps()});
  if(s.packages.languagePack) products.push({id:'LanguagePack', languages:officeSelectedLanguages(), exclude:[]});
  if(s.packages.proofingTools) products.push({id:'ProofingTools', languages:officeSelectedLanguages(), exclude:[]});
  return products;
}

function officeExcludedApps(){const s = officeWizardState; const out = []; if(s.packages.teams) out.push('Lync'); if(s.packages.groove) out.push('Groove'); return out;}

function buildOfficeConfigurationXml(){
  const s = officeWizardState;
  const attrs = [['OfficeClientEdition','64'],['Channel',s.channel],['ForceUpgrade',s.options.forceUpgrade ? 'TRUE' : 'FALSE'],['OfficeMgmtCOM',s.options.officeMgmtCom ? 'TRUE' : 'FALSE'],['MigrateArch',s.options.migrateArch ? 'TRUE' : 'FALSE'],['AllowCdnFallback',s.options.allowCdnFallback ? 'True' : 'False']];
  const productXml = officeSelectedProducts().map(p=>{
    const key = String(s.productKeys?.[p.id] || '').trim();
    const keyAttr = key ? ` PIDKEY="${xmlAttr(key)}"` : '';
    return [`    <Product ID="${xmlAttr(p.id)}"${keyAttr}>`,...p.languages.map(lang=>`      <Language ID="${xmlAttr(lang)}" />`),...p.exclude.map(app=>`      <ExcludeApp ID="${xmlAttr(app)}" />`),'    </Product>'].join('\n');
  }).join('\n');
  return `<Configuration>
  <!-- Generated by IT-Verwaltung Office Wizard. Product Keys are intentionally not stored here. -->
  <Add ${attrs.map(([k,v])=>`${k}="${xmlAttr(v)}"`).join(' ')}>
${productXml}
  </Add>
${s.options.removeMSI ? '  <RemoveMSI All="TRUE" />\n' : ''}${s.options.removeAll ? '  <Remove All="TRUE" />\n' : ''}  <Updates Enabled="TRUE" />
  <Display Level="${xmlAttr(s.options.displayLevel)}" AcceptEULA="TRUE" />
  <Logging Level="Standard" />
  <Property Name="AUTOACTIVATE" Value="1" />
  <Property Name="FORCEAPPSHUTDOWN" Value="${s.options.forceAppShutdown ? 'TRUE' : 'FALSE'}" />
  <Property Name="SharedComputerLicensing" Value="${s.licenseModel === 'Shared Computer Licensing' ? '1' : '0'}" />
  <Property Name="DeviceBasedLicensing" Value="${s.licenseModel === 'Device Based Licensing' ? '1' : '0'}" />
  <Property Name="SCLCacheOverride" Value="0" />
  <Property Name="PinIconsToTaskbar" Value="${s.options.pinIcons ? 'TRUE' : 'FALSE'}" />
  <AppSettings>
    <Setup Name="Company" Value="Ernst-Abbe-Hochschule Jena" />
  </AppSettings>
</Configuration>`;
}

function buildOfficeRegistryConfig(){
  const s = officeWizardState;
  const p = s.policies;
  const lines = ['Windows Registry Editor Version 5.00', '', '; Generated by IT-Verwaltung Office Wizard. No Product Keys are stored here.', ''];
  lines.push('[HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Office\\ClickToRun\\Configuration]');
  lines.push('"Platform"="x64"');
  lines.push(`"SharedComputerLicensing"="${s.licenseModel === 'Shared Computer Licensing' ? '1' : '0'}"`);
  lines.push(`"O365ProPlusRetail.DeviceBasedLicensing"="${s.licenseModel === 'Device Based Licensing' ? '1' : '0'}"`);
  lines.push(`"UpdatesEnabled"="${p.enableUpdates ? 'True' : 'False'}"`);
  lines.push('"SCLCacheOverride"="0"');
  lines.push(`"AllowCdnFallback"="${s.options.allowCdnFallback ? 'True' : 'False'}"`);
  officeSelectedProducts().forEach(product => {
    if(/Volume$/i.test(product.id)) lines.push(`"${product.id}.MediaType"="CDN"`);
  });
  lines.push('');
  if(p.officeFormats){
    lines.push('[HKEY_CURRENT_USER\\Software\\Microsoft\\Office\\16.0\\Word\\Options]');
    lines.push('"DefaultFormat"=""');
    lines.push('');
    lines.push('[HKEY_CURRENT_USER\\Software\\Microsoft\\Office\\16.0\\Excel\\Options]');
    lines.push('"DefaultFormat"=dword:00000033');
    lines.push('');
    lines.push('[HKEY_CURRENT_USER\\Software\\Microsoft\\Office\\16.0\\PowerPoint\\Options]');
    lines.push('"DefaultFormat"=dword:0000001b');
    lines.push('');
  }
  if(p.outlookAutodiscover){
    lines.push('[HKEY_CURRENT_USER\\Software\\Microsoft\\Office\\16.0\\Outlook\\AutoDiscover]');
    lines.push('"ExcludeExplicitO365Endpoint"=dword:00000001');
    lines.push('');
    lines.push('[HKEY_CURRENT_USER\\Software\\Policies\\Microsoft\\Office\\16.0\\Outlook\\AutoDiscover]');
    lines.push('"ExcludeExplicitO365Endpoint"=dword:00000001');
    lines.push('');
  }
  lines.push('[HKEY_CURRENT_USER\\Software\\Policies\\Microsoft\\Office\\16.0\\Common\\Internet]');
  lines.push('"donotuselongfilenames"=dword:00000000');
  lines.push('');
  if(p.longPaths){
    lines.push('[HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Control\\FileSystem]');
    lines.push('"LongPathsEnabled"=dword:00000001');
    lines.push('');
  }
  lines.push('[HKEY_LOCAL_MACHINE\\SOFTWARE\\Policies\\Microsoft\\office\\16.0\\common]');
  lines.push('"suppressofficechannelselector"=dword:00000000');
  lines.push('');
  lines.push('[HKEY_LOCAL_MACHINE\\SOFTWARE\\Policies\\Microsoft\\office\\16.0\\common\\officeupdate]');
  lines.push(`"enableupdates"=dword:${p.enableUpdates ? '00000001' : '00000000'}`);
  lines.push(`"enableautomaticupdates"=dword:${p.automaticUpdates ? '00000001' : '00000000'}`);
  lines.push(`"hideenabledisableupdates"=dword:${p.showUpdateButton ? '00000000' : '00000001'}`);
  lines.push(p.setChannelExposure && ['Current','MonthlyEnterprise'].includes(s.channel) ? `"updatebranch"="${s.channel}"` : '"updatebranch"=-');
  lines.push('');
  if(p.setChannelExposure){
    lines.push('[HKEY_LOCAL_MACHINE\\SOFTWARE\\Policies\\Microsoft\\office\\16.0\\common\\officechannelexposure]');
    officeChannelExposureLines(s.channel).forEach(line => lines.push(line));
    lines.push('');
    lines.push('[HKEY_CURRENT_USER\\Software\\Policies\\Microsoft\\Office\\16.0\\common\\officechannelexposure]');
    officeChannelExposureLines(s.channel).forEach(line => lines.push(line));
    lines.push('');
  }
  return lines.join('\r\n');
}

function officeChannelExposureLines(channel){
  const active = {
    current: channel === 'Current',
    monthlyenterprise: channel === 'MonthlyEnterprise',
    perpetualvl2024: channel === 'PerpetualVL2024',
    perpetualvl2021: channel === 'PerpetualVL2021'
  };
  return [
    '"insiderfast"=dword:00000000',
    '"firstreleasecurrent"=dword:00000000',
    `"current"=dword:${active.current ? '00000001' : '00000000'}`,
    `"monthlyenterprise"=dword:${active.monthlyenterprise ? '00000001' : '00000000'}`,
    '"firstreleasedeferred"=dword:00000000',
    '"deferred"=dword:00000000',
    `"perpetualvl2024"=dword:${active.perpetualvl2024 ? '00000001' : '00000000'}`,
    `"perpetualvl2021"=dword:${active.perpetualvl2021 ? '00000001' : '00000000'}`
  ];
}

function buildOfficeWizardReadme(){
  return [
    'Office Deployment Tool Profil',
    '==============================',
    '',
    `Profil: ${officeProfileName()}`,
    `Ziel: ${officeWizardState.target}`,
    `Asset-Kontext: ${officeWizardState.assetId || '-'}`,
    `Version/Kanal: ${OFFICE_GENERATIONS[officeWizardState.generation].label} / ${officeWizardState.channel}`,
    `Lizenzmodell: ${officeWizardState.licenseModel}`,
    `Product-IDs: ${officeSelectedProducts().map(p=>p.id).join(', ')}`,
    `Sprachen: ${officeSelectedLanguages().join(', ')}`,
    '',
    'Dateien:',
    '- configuration.xml: ODT-Installation',
    '- MSO-Config.reg: Office/Windows Policies und Click-to-Run-Konfiguration',
    '',
    'Ablauf:',
    '1. Dateien in einen lokalen Profilordner legen.',
    '2. Microsoft-Signatur von setup.exe prüfen.',
    '3. Optional Download ausführen: setup.exe /Download configuration.xml',
    '4. Installation ausführen: setup.exe /Configure configuration.xml',
    officeWizardState.policies.importReg ? '5. REG nach Sichtprüfung importieren: reg import MSO-Config.reg' : '5. REG nur nach Sichtprüfung und Freigabe importieren.',
    '6. gpupdate /force ausführen und Office-Updatezustand prüfen.',
    '',
    'Sicherheit:',
    '- Product Keys, Tenantdaten und interne Lizenzwerte werden nicht in diesen Dateien gespeichert.',
    '- Remove All, ForceAppShutdown und REG-Import nur im Wartungsfenster nutzen.'
  ].join('\r\n');
}

function xmlAttr(value){return String(value ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[m]));}

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
