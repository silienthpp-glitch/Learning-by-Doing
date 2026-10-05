/* Originalunterlagen werden ausschließlich vom lokalen Server geladen. */
window.renderIhk = async function () {
  const container = document.querySelector('#app');
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  container.innerHTML = '<div class="heading"><div><h1>IHK AP2 · Prüfungsbibliothek</h1><p>Aufgaben bearbeiten und anschließend mit den Lösungen vergleichen. Deine Unterlagen bleiben auf diesem Rechner.</p></div></div><section class="card" id="ihk-documents">Unterlagen werden geladen …</section>';
  const target = document.querySelector('#ihk-documents');
  if (!['localhost', '127.0.0.1', '[::1]'].includes(location.hostname)) {
    target.textContent = 'Die Originalunterlagen stehen im lokal gestarteten Programm zur Verfügung.';
    return;
  }
  try {
    const response = await fetch('private-ihk/catalog.json', {cache: 'no-store'});
    if (!response.ok) throw Error('Noch keine lokalen Unterlagen importiert. Starte import_ihk.py mit deiner ZIP-Datei.');
    const entries = await response.json();
    if (!Array.isArray(entries)) throw Error('Der lokale Katalog ist ungültig.');
    const groups = [...new Set(entries.map(x => x.group))];
    const filters = document.createElement('div');
    filters.className = 'filter-grid';
    filters.innerHTML = '<label>Bereich<select id="ihk-group"><option value="">Alle Bereiche</option>'+groups.map(g=>'<option>'+escape(g)+'</option>').join('')+'</select></label><label>Suche<input id="ihk-search" type="search" placeholder="z. B. Sommer 2025"></label>';
    target.replaceChildren(filters);
    const list = document.createElement('div');
    target.append(list);
    function draw() {
      const group = filters.querySelector('select').value;
      const search = filters.querySelector('input').value.toLocaleLowerCase('de');
      const selected = entries.filter(x => (!group || x.group === group) && (x.name+' '+x.term+' '+x.group).toLocaleLowerCase('de').includes(search));
      list.innerHTML = '<p class="small">'+selected.length+' Dokumente · Aufgaben und Lösungen getrennt öffnen</p>';
      const pairs = new Map();
      for (const entry of selected) {
        const primary = ['IT-Systeme', 'Netzwerke', 'WiSo'].includes(entry.group);
        const stem = entry.name.replace(/\.pdf$/i, '').replace(/(?:_Lsg|_L|_Lösungen| Lösungen| Aufgaben)$/i, '').replace(/-1$/, '').trim();
        const key = entry.group + ' · ' + (primary && entry.term ? entry.term : stem);
        if (!pairs.has(key)) pairs.set(key, []);
        pairs.get(key).push(entry);
      }
      for (const [title, documents] of pairs) {
        const card = document.createElement('section');
        card.className = 'set-card';
        card.style.marginBottom = '12px';
        const heading = document.createElement('h3');
        heading.textContent = title;
        card.append(heading);
        for (const doc of documents) {
          if (!/^[a-f0-9]{64}\.pdf$/.test(doc.file)) continue;
          const link = document.createElement('a');
          link.className = 'button quiet';
          link.style.margin = '4px';
          link.href = 'private-ihk/' + doc.file;
          link.target = '_blank';
          link.rel = 'noopener';
          link.textContent = doc.kind + ' · ' + doc.name;
          card.append(link);
        }
        list.append(card);
      }
      if (!selected.length) list.append('Keine passenden Unterlagen gefunden.');
    }
    filters.querySelector('select').onchange = draw;
    filters.querySelector('input').oninput = draw;
    draw();
  } catch (error) { target.textContent = error.message; }
};
