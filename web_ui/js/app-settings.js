// UI settings, persistence and visual application.

function loadAppSettings(){
  const defaults = {
    darkMode:false,
    animations:true,
    compactMode:false,
    autosave:true,
    confirmDelete:true,
    startView:'topology',
    role:'admin'
  };
  try{
    return {...defaults, ...(JSON.parse(localStorage.getItem(APP_SETTINGS_KEY)) || {})};
  }catch{
    return defaults;
  }
}

function saveAppSettings(){
  localStorage.setItem(APP_SETTINGS_KEY, JSON.stringify(APP_SETTINGS));
  applyAppSettings();
}

function applyAppSettings(){
  document.body.classList.toggle('dark-mode', !!APP_SETTINGS.darkMode);
  document.body.classList.toggle('animations-off', !APP_SETTINGS.animations);
  document.body.classList.toggle('compact-mode', !!APP_SETTINGS.compactMode);
  document.body.classList.toggle('role-normal', !isAdminRole());
}

function setSetting(key, value){
  APP_SETTINGS[key] = value;
  saveAppSettings();
  render();
}

function uxAnimateContent(){
  if(!APP_SETTINGS.animations || typeof $ === 'undefined') return;
  $('#tabContent').hide().fadeIn(140);
  $('.card').addClass('ux-card-enter');
  setTimeout(()=>$('.card').removeClass('ux-card-enter'), 280);
}
