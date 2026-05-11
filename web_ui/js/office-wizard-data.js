// Office wizard constants and default state.

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
