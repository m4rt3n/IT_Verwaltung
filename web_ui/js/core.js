// Core data helpers shared across views, wizard and edit dialogs.
const CORE = {
  version: 'v44',
  findAsset: function(assetId){
    if(!window.DB && typeof DB === 'undefined') return null;
    if(!DB || !Array.isArray(DB.assets)) return null;
    return DB.assets.find(function(a){ return a && a['Asset-ID'] === assetId; }) || null;
  },
  byAsset: function(table, assetId){
    if(!DB || !Array.isArray(DB[table])) return [];
    return DB[table].filter(function(row){ return row && row['Asset-ID'] === assetId; });
  },
  safeGet: function(obj, path, def){
    try{
      return String(path).split('.').reduce(function(o,k){ return o ? o[k] : undefined; }, obj) ?? def;
    }catch(e){
      return def;
    }
  },
  setPath: function(obj, path, value){
    if(!obj || !path) return;
    var parts = String(path).split('.');
    var cur = obj;
    for(var i=0;i<parts.length-1;i++){
      var key = parts[i];
      if(typeof cur[key] !== 'object' || cur[key] === null) cur[key] = {};
      cur = cur[key];
    }
    cur[parts[parts.length-1]] = value;
  },
  ensureSmartSoftwareDefaults: function(){
    if(typeof DB === 'undefined' || !DB) return;
    if(!DB.stammdaten) DB.stammdaten = {};
    if(!Array.isArray(DB.stammdaten.software)){
      DB.stammdaten.software = [
        {name:"Firefox", isStandard:true, required:false},
        {name:"Chrome", isStandard:true, required:false},
        {name:"Adobe Acrobat Reader", isStandard:true, required:true},
        {name:"Microsoft Office", isStandard:true, required:true},
        {name:"UniGet / WinGet", isStandard:true, required:false},
        {name:"Visual C++ Redistributable", isStandard:true, required:true},
        {name:".NET Runtime", isStandard:true, required:true},
        {name:"VPN Client", isStandard:false, required:false}
      ];
    }
  },
  isSoftwareInstalled: function(assetId, name){
    if(typeof DB === 'undefined' || !DB || !Array.isArray(DB.software)) return false;
    const needle = String(name || '').toLowerCase();
    return DB.software.some(s =>
      String(s["Asset-ID"] || '') === String(assetId || '') &&
      String(s["Softwarename"] || '').toLowerCase().includes(needle)
    );
  }
};

function findAsset(assetId){
  return CORE.findAsset(assetId);
}

function byAsset(table, assetId){
  return CORE.byAsset(table, assetId);
}

function getPath(obj, path, def){
  return CORE.safeGet(obj, path, def);
}

function setPath(obj, path, value){
  return CORE.setPath(obj, path, value);
}

function ensureSmartSoftwareDefaults(){
  return CORE.ensureSmartSoftwareDefaults();
}

function isSoftwareInstalled(assetId, name){
  return CORE.isSoftwareInstalled(assetId, name);
}
