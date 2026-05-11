// Knowledge card rendering, solution sections, command suggestions and tool hooks.

function renderKnowledgeCard(mod,r,idx,total){
  const commandHtml = renderKnowledgeCommands(r);
  return `${nav(mod.key,idx,total)}
    <div class="card mt-3 knowledge-card">
      <div class="card-body">
        <div class="detail-title">${safeEscape(r['Knowledge-ID'] || 'Knowledge')}</div>
        <div class="kv mt-3">
          ${kv('Knowledge-ID', r['Knowledge-ID'])}
          ${kv('Titel', r.Titel)}
          ${kv('Kategorie', r.Kategorie)}
          ${kv('Tags', r.Tags)}
        </div>
        ${renderKnowledgeTools(r)}
        ${renderKnowledgeSolution(r['Lösung'])}
        ${commandHtml}
      </div>
    </div>`;
}

function renderKnowledgeTools(row){
  const title = normalizeKnowledgeTitle(row);
  if(title !== 'office deployment tool und office-updates verwalten') return '';
  return `<div class="knowledge-tool-panel mt-4">
    <div>
      <div class="knowledge-section-title">Auswahlwerkzeug</div>
      <div class="text-muted">Geführter Wizard für Version, Pakete, Sprachen, Risiken und ODT-XML.</div>
    </div>
    <button class="btn btn-primary" onclick="openOfficeConfigWizard()">Office-Konfigurationswizard öffnen</button>
  </div>`;
}

function renderKnowledgeSolution(value){
  const sections = splitKnowledgeSections(value);
  if(!sections.length) return '<div class="text-muted mt-3">Keine Lösung dokumentiert.</div>';
  const problem = sections.filter(s => /problem|symptom|fehler|störung|stoerung/i.test(s.title));
  const rest = sections.filter(s => !problem.includes(s));
  return `<div class="knowledge-solution mt-4">
    ${problem.length ? `<div class="knowledge-problem">
      <div class="knowledge-section-title">Zu behebendes Problem</div>
      ${problem.map(renderKnowledgeSectionBody).join('')}
    </div>` : ''}
    ${rest.map(section => `<section class="knowledge-section">
      <div class="knowledge-section-title">${safeEscape(section.title)}</div>
      ${renderKnowledgeSectionBody(section)}
    </section>`).join('')}
  </div>`;
}

function splitKnowledgeSections(value){
  const text = htmlToPlainText(value);
  const lines = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  const sections = [];
  let current = {title:'Zusammenfassung', body:[]};
  lines.forEach(line => {
    const heading = line.match(/^##\s*(.+)$/);
    if(heading){
      if(current.body.length) sections.push(current);
      current = {title:heading[1].trim(), body:[]};
    }else{
      current.body.push(line);
    }
  });
  if(current.body.length) sections.push(current);
  return sections.length ? sections : [{title:'Lösung', body:[text]}];
}

function renderKnowledgeSectionBody(section){
  const items = section.body.filter(line => line.startsWith('- ')).map(line => line.slice(2));
  const paragraphs = section.body.filter(line => !line.startsWith('- '));
  return `${paragraphs.map(line => `<p>${safeEscape(line)}</p>`).join('')}
    ${items.length ? `<ul>${items.map(item => `<li>${safeEscape(item)}</li>`).join('')}</ul>` : ''}`;
}
