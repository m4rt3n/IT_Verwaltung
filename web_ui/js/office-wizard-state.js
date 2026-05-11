// Office wizard state updates and selection helpers.

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
