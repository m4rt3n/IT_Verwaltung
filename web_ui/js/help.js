// Local help area backed by Markdown files in dokumentation/help/.
let HELP_DOCS = [];
let HELP_STATE = {active:'schnellstart', loaded:false, error:null};

async function loadHelpDocs(){
  try{
    const res = await fetch('/api/help?v=' + Date.now());
    if(!res.ok) throw new Error(await res.text());
    const data = await res.json();
    HELP_DOCS = Array.isArray(data.docs) ? data.docs : [];
    HELP_STATE.loaded = true;
    HELP_STATE.error = null;
    if(!HELP_DOCS.some(doc=>doc.slug === HELP_STATE.active)){
      HELP_STATE.active = HELP_DOCS[0]?.slug || 'schnellstart';
    }
    return true;
  }catch(e){
    HELP_DOCS = fallbackHelpDocs();
    HELP_STATE.loaded = false;
    HELP_STATE.error = e.message || String(e);
    return false;
  }
}

function fallbackHelpDocs(){
  return [{
    slug:'schnellstart',
    title:'Schnellstart',
    filename:'Fallback',
    content:'# Schnellstart\n\nDie lokale Hilfe konnte nicht ueber `/api/help` geladen werden. Starte die App ueber `start.bat`, damit der Python-Server aktiv ist.'
  }];
}

function setHelpArticle(slug){
  HELP_STATE.active = slug;
  render();
}

function renderHelp(){
  const docs = filteredHelpDocs();
  const activeDoc = docs.find(doc=>doc.slug === HELP_STATE.active) || docs[0] || HELP_DOCS[0];
  if(activeDoc && HELP_STATE.active !== activeDoc.slug) HELP_STATE.active = activeDoc.slug;
  const status = HELP_STATE.error
    ? `<div class="alert alert-warning">Lokale Hilfe nur eingeschraenkt geladen: ${escapeHtml(HELP_STATE.error)}</div>`
    : '';
  return `<div class="help-layout">
    <div class="card mb-3">
      <div class="card-body d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div>
          <h3 class="mb-1"><i class="bi bi-question-circle"></i> Hilfe</h3>
          <div class="text-muted">Schnellstart, FAQ, Fehlerhilfe, Glossar und Checklisten fuer die lokale IT-Verwaltung.</div>
        </div>
        <button class="btn btn-outline-primary" onclick="loadHelpDocs().then(()=>render())" title="Laedt die Help-Dateien erneut aus dokumentation/help.">
          <i class="bi bi-arrow-clockwise"></i> Hilfe neu laden
        </button>
      </div>
    </div>
    ${status}
    <div class="row g-3">
      <div class="col-lg-3">
        <div class="list-group help-nav">
          ${docs.map(doc=>`<button class="list-group-item list-group-item-action ${doc.slug===HELP_STATE.active?'active':''}" onclick="setHelpArticle('${escapeHtml(doc.slug)}')">
            <span>${escapeHtml(doc.title)}</span>
            <small>${escapeHtml(doc.filename)}</small>
          </button>`).join('') || '<div class="list-group-item">Keine Hilfeartikel gefunden.</div>'}
        </div>
      </div>
      <div class="col-lg-9">
        <div class="card help-article-card">
          <div class="card-body">
            ${activeDoc ? renderMarkdownLite(activeDoc.content) : '<p>Keine Hilfeinhalte vorhanden.</p>'}
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

function filteredHelpDocs(){
  const docs = HELP_DOCS.length ? HELP_DOCS : fallbackHelpDocs();
  const query = String(searchText || '').trim().toLowerCase();
  if(!query) return docs;
  return docs.filter(doc =>
    String(doc.title || '').toLowerCase().includes(query) ||
    String(doc.content || '').toLowerCase().includes(query)
  );
}

function renderMarkdownLite(text){
  const lines = String(text || '').split(/\r?\n/);
  const html = [];
  let inList = false;
  let inCode = false;
  let codeLines = [];
  const closeList = () => {
    if(inList){
      html.push('</ul>');
      inList = false;
    }
  };
  lines.forEach(line=>{
    if(line.trim().startsWith('```')){
      if(inCode){
        html.push(`<pre><code>${escapeHtml(codeLines.join('\n'))}</code></pre>`);
        codeLines = [];
        inCode = false;
      }else{
        closeList();
        inCode = true;
      }
      return;
    }
    if(inCode){
      codeLines.push(line);
      return;
    }
    if(!line.trim()){
      closeList();
      return;
    }
    if(line.startsWith('# ')){
      closeList();
      html.push(`<h3>${inlineMarkdown(line.slice(2))}</h3>`);
      return;
    }
    if(line.startsWith('## ')){
      closeList();
      html.push(`<h4>${inlineMarkdown(line.slice(3))}</h4>`);
      return;
    }
    if(line.startsWith('- ')){
      if(!inList){
        html.push('<ul>');
        inList = true;
      }
      html.push(`<li>${inlineMarkdown(line.slice(2))}</li>`);
      return;
    }
    closeList();
    html.push(`<p>${inlineMarkdown(line)}</p>`);
  });
  closeList();
  if(inCode) html.push(`<pre><code>${escapeHtml(codeLines.join('\n'))}</code></pre>`);
  return html.join('');
}

function inlineMarkdown(text){
  return escapeHtml(text).replace(/`([^`]+)`/g, '<code>$1</code>');
}
