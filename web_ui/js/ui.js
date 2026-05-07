// Shared UI helpers and generic browser interactions.
const UI = {
  speed: 160,
  fadeSwap: function(el, html){
    $(el).fadeOut(this.speed, function(){
      $(this).html(html).fadeIn(UI.speed);
    });
  },
  pulse: function(el){
    $(el).addClass('pulse-success');
    setTimeout(function(){ $(el).removeClass('pulse-success'); }, 800);
  }
};

function bindUiChromeEvents(){
  if(!window.jQuery) return;
  $(document).on('mouseenter', '.card', function(){
    $(this).addClass('shadow-lg').css('transform','translateY(-4px)');
  });
  $(document).on('mouseleave', '.card', function(){
    $(this).removeClass('shadow-lg').css('transform','translateY(0)');
  });
  $(document).on('click', '.btn', function(){
    const b = $(this);
    b.css('transform','scale(0.95)');
    setTimeout(function(){ b.css('transform','scale(1)'); }, 120);
  });
  $('#editModal, #deviceWizardModal').on('hidden.bs.modal', function () {
    if(document.activeElement && document.activeElement.blur) document.activeElement.blur();
  });
}

document.addEventListener('DOMContentLoaded', bindUiChromeEvents, {once:true});

function notify(msg, type='success'){
  const old = document.querySelectorAll('.toast-custom');
  old.forEach(x=>x.remove());
  const el = document.createElement('div');
  el.className = 'toast-custom toast-' + type;
  el.setAttribute('role', type === 'error' ? 'alert' : 'status');
  el.innerText = msg;
  document.body.appendChild(el);
  setTimeout(()=> el.classList.add('show'), 10);
  setTimeout(()=> el.remove(), 3000);
}

function toast(msg){
  notify(msg, 'success');
}

function showToast(msg, type='success'){
  return notify(msg, type);
}

function setSaving(state){
  document.querySelectorAll('[data-save-button="true"]').forEach(b=>{
    if(state){
      if(!b.dataset.old) b.dataset.old = b.innerHTML;
      b.innerHTML = 'Speichern...';
      b.disabled = true;
    }else{
      if(b.dataset.old) b.innerHTML = b.dataset.old;
      b.disabled = false;
      delete b.dataset.old;
    }
  });
}

function safeSave(fn){
  try{
    return fn();
  }catch(e){
    console.error('SAVE ERROR:', e);
    notify('Fehler: ' + e.message, 'error');
    return false;
  }
}

function safetyConfirm(action, detail=''){
  const text = detail ? `${action}\n\n${detail}` : action;
  return confirm(`${text}\n\nFortfahren?`);
}

function statusAlertClass(type){
  return {success:'success', warning:'warning', error:'danger', info:'info'}[type] || 'info';
}

function escapeHtml(str){
  return String(str||'').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

function uxHighlight(selector){
  if(!APP_SETTINGS.animations || typeof $ === 'undefined') return;
  $(selector).addClass('ux-highlight');
  setTimeout(()=>$(selector).removeClass('ux-highlight'), 650);
}

function uxShake(selector){
  if(!APP_SETTINGS.animations || typeof $ === 'undefined') return;
  $(selector).addClass('ux-shake');
  setTimeout(()=>$(selector).removeClass('ux-shake'), 450);
}

function uxSuccess(message){
  toast(message || 'Gespeichert.');
  uxHighlight('.card:visible:first');
}

function downloadBlob(content, filename, type='application/octet-stream'){
  const blob = content instanceof Blob ? content : new Blob([content], {type});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}

function adminButton(label, variant, action, title, icon=''){
  const text = icon ? `${icon} ${label}` : label;
  const saveAttr = action.includes('saveDbToServer') ? ' data-save-button="true"' : '';
  return `<button class="btn btn-${variant} admin-action-button"${saveAttr} onclick="${action}" title="${escapeHtml(title)}" aria-label="${escapeHtml(title)}">${text}</button>`;
}

function adminActionTile(title, text, buttons){
  return `<div class="admin-action-tile">
    <div class="admin-action-title">${title}</div>
    <div class="admin-action-text">${text}</div>
    <div class="d-flex flex-wrap gap-2">${buttons}</div>
  </div>`;
}

function copyCommand(command){
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(command)
      .then(()=>notify('Befehl in die Zwischenablage kopiert.', 'success'))
      .catch(()=>prompt('Befehl kopieren:', command));
    return;
  }
  prompt('Befehl kopieren:', command);
}

function scannerCommandTile(title, text, command, tone, mode=''){
  const startButton = mode
    ? `<button class="btn btn-primary admin-action-button" onclick="startScanner('${escapeHtml(mode)}')" title="Startet diese Scanner-Aktion über den lokalen Python-Server in einer separaten Windows-Konsole." aria-label="Startet diese Scanner-Aktion über den lokalen Python-Server in einer separaten Windows-Konsole.">Jetzt starten</button>`
    : '';
  return `<div class="admin-action-tile scanner-command-tile scanner-command-${tone}">
    <div class="admin-action-title">${title}</div>
    <div class="admin-action-text">${text}</div>
    <code class="scanner-command">${command}</code>
    <div class="d-flex flex-wrap gap-2">
      ${startButton}
      <button class="btn btn-outline-primary admin-action-button" onclick="copyCommand('.\\\\${escapeHtml(command)}')" title="Kopiert diesen PowerShell-kompatiblen Befehl mit Punkt-Backslash in die Zwischenablage." aria-label="Kopiert diesen PowerShell-kompatiblen Befehl mit Punkt-Backslash in die Zwischenablage.">Befehl kopieren</button>
    </div>
  </div>`;
}
