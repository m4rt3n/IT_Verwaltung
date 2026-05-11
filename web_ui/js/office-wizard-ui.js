// Office wizard modal and step rendering.

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
