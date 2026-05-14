const API_BASE = 'http://localhost:3131';

const App = (() => {
  let journey = [];
  let thinkTimer = null;
  let busy = false;
  let apiMode = false; // switches to true when server is reachable + has key
  let knowledgeBase = {}; // loaded from dzogchen-knowledge-base.json

  // ── Init ──────────────────────────────────────────────────────────────────────────
  function init() {
    Graph.init(document.getElementById('graph-container'), KNOWLEDGE_GRAPH);
    Graph.onNodeClick(onNodeClick);

    on('main-ask',     'click',   onMainAsk);
    on('detail-ask',   'click',   onDetailAsk);
    on('close-detail', 'click',   () => closeDetail());
    on('main-input',   'keydown', e => e.key === 'Enter' && onMainAsk());
    on('detail-input', 'keydown', e => e.key === 'Enter' && onDetailAsk());

    initUploadPanel();
    checkServerHealth();
    loadKnowledgeBase();
  }

  function loadKnowledgeBase() {
    fetch('dzogchen-knowledge-base.json')
      .then(r => r.json())
      .then(data => { data.nodes.forEach(n => { knowledgeBase[n.id] = n; }); })
      .catch(() => {});
  }

  function on(id, ev, fn) {
    document.getElementById(id)?.addEventListener(ev, fn);
  }

  // ── Server health check ─────────────────────────────────────────────────────
  async function checkServerHealth() {
    try {
      const r = await fetch(`${API_BASE}/api/health`, { signal: AbortSignal.timeout(2000) });
      const data = await r.json();
      apiMode = data.hasKey;
      renderModeBadge(data);
      if (data.books > 0) refreshBooksList();
    } catch {
      renderModeBadge(null); // server offline → mock mode
    }
  }

  function renderModeBadge(health) {
    let badge = document.getElementById('mode-badge');
    if (!badge) {
      badge = document.createElement('div');
      badge.id = 'mode-badge';
      document.getElementById('app').appendChild(badge);
    }
    if (!health) {
      badge.textContent = 'mock-режим';
      badge.className = '';
    } else if (!health.hasKey) {
      badge.textContent = 'сервер ✓  ·  нужен API ключ';
      badge.className = '';
    } else {
      badge.textContent = `live · книг: ${health.books}`;
      badge.className = 'live';
    }
  }

  // ── Upload panel ─────────────────────────────────────────────────────────────────
  function initUploadPanel() {
    const toggle  = document.getElementById('upload-toggle');
    const drawer  = document.getElementById('upload-drawer');
    const fileIn  = document.getElementById('file-input');
    const dropZone = document.getElementById('drop-zone');

    toggle.addEventListener('click', e => {
      e.stopPropagation();
      drawer.classList.toggle('open');
    });

    document.addEventListener('click', () => drawer.classList.remove('open'));
    drawer.addEventListener('click', e => e.stopPropagation());

    fileIn.addEventListener('change', () => uploadFiles(Array.from(fileIn.files)));

    dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
    dropZone.addEventListener('drop', e => {
      e.preventDefault();
      dropZone.classList.remove('drag-over');
      const pdfs = Array.from(e.dataTransfer.files).filter(f => f.type === 'application/pdf');
      if (pdfs.length) uploadFiles(pdfs);
    });
  }

  async function uploadFiles(files) {
    setStatus('Загружаю...', '');
    const formData = new FormData();
    files.forEach(f => formData.append('pdfs', f));
    try {
      const r = await fetch(`${API_BASE}/api/upload`, { method: 'POST', body: formData });
      const data = await r.json();
      if (data.error) throw new Error(data.error);
      setStatus(`Загружено: ${data.uploaded.length} файл(ов)`, 'ok');
      await refreshBooksList();
      await checkServerHealth();
    } catch (err) {
      setStatus('Ошибка: ' + err.message, 'error');
    }
  }

  async function refreshBooksList() {
    try {
      const r = await fetch(`${API_BASE}/api/books`);
      const data = await r.json();
      const list = document.getElementById('books-list');
      list.innerHTML = '';
      data.books.forEach(book => {
        const item = document.createElement('div');
        item.className = 'book-item';
        const name = document.createElement('span');
        name.className = 'book-name';
        name.textContent = book.filename.replace(/^\d+_/, '');
        name.title = book.filename;
        const del = document.createElement('button');
        del.className = 'book-delete';
        del.textContent = '×';
        del.title = 'Удалить';
        del.onclick = () => deleteBook(book.filename);
        item.append(name, del);
        list.appendChild(item);
      });
      const label = document.getElementById('upload-label');
      label.textContent = data.books.length ? `Книг: ${data.books.length}` : 'Книги';
    } catch { /* server offline */ }
  }

  async function deleteBook(filename) {
    try {
      await fetch(`${API_BASE}/api/books/${encodeURIComponent(filename)}`, { method: 'DELETE' });
      await refreshBooksList();
      await checkServerHealth();
    } catch (err) {
      setStatus('Ошибка удаления', 'error');
    }
  }

  function setStatus(msg, type) {
    const el = document.getElementById('upload-status');
    el.textContent = msg;
    el.className = type;
  }

  // ── Ask logic ─────────────────────────────────────────────────────────────────────
  async function onMainAsk() {
    if (busy) return;
    const el = document.getElementById('main-input');
    const q = el.value.trim();
    if (!q) return;
    el.value = '';
    closeDetail(false);
    await ask(q);
  }

  async function onDetailAsk() {
    if (busy) return;
    const el = document.getElementById('detail-input');
    const q = el.value.trim();
    if (!q) return;
    el.value = '';
    closeDetail(false);
    await wait(320);
    await ask(q);
  }

  async function ask(q) {
    busy = true;
    try {
      const resp = apiMode ? await askAPI(q) : findMockResponse(q);
      await displayResponse(resp);
    } catch (err) {
      console.error('ask error:', err);
      stopThinking();
    }
    busy = false;
  }

  // ── Mock response ───────────────────────────────────────────────────────────────────
  function findMockResponse(q) {
    const lower = q.toLowerCase();
    return MOCK_RESPONSES.find(r => r.keywords.some(kw => lower.includes(kw))) || DEFAULT_RESPONSE;
  }

  // ── API response ────────────────────────────────────────────────────────────────────
  async function askAPI(q) {
    const existingNodes = KNOWLEDGE_GRAPH.nodes.map(n => ({ id: n.id, label: n.label }));
    startThinking(['Читаю книги...', 'Ищу нити...', 'Формирую ответ...', 'Нахожу связи...']);

    const r = await fetch(`${API_BASE}/api/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: q, existingNodes })
    });

    if (!r.ok) {
      const err = await r.json();
      if (err.error === 'NO_API_KEY') throw new Error('Нет API ключа в .env');
      if (err.error === 'NO_BOOKS')   throw new Error('Сначала загрузи PDF книги');
      throw new Error(err.error || 'Ошибка сервера');
    }

    const data = await r.json();

    // Dynamically expand graph with new nodes from Claude
    if (data.newNodes?.length) {
      data.newNodes.forEach(n => {
        if (!KNOWLEDGE_GRAPH.nodes.find(x => x.id === n.id)) {
          KNOWLEDGE_GRAPH.nodes.push({ weight: 3, ...n });
        }
      });
      data.newLinks?.forEach(l => KNOWLEDGE_GRAPH.links.push(l));
      Graph.addNodes(data.newNodes, data.newLinks || []);
    }

    return data;
  }

  // ── Display response ──────────────────────────────────────────────────────────────────
  async function displayResponse(resp) {
    if (!resp.thinking?.length) startThinking(['Думаю...', 'Ищу...', 'Нахожу...']);
    else startThinking(resp.thinking);

    if (resp.trail?.length >= 2) {
      await Graph.animateTrail(resp.trail);
    } else {
      await wait(900);
    }

    stopThinking();

    const target = resp.targetNode || (resp.newNodes?.[0]?.id) || null;

    if (target) {
      Graph.highlightNode(target);
      Graph.pulseNode(target);
      await wait(250);
      Graph.focusNode(target, true);
      await wait(500);
      const label = resp.title || KNOWLEDGE_GRAPH.nodes.find(n => n.id === target)?.label || target;
      addCrumb(target, label);
    }

    showDetail(resp);
  }

  function onNodeClick(node) {
    if (busy) return;

    const mockResp = MOCK_RESPONSES.find(r => r.targetNode === node.id);
    const kb = knowledgeBase[node.id];

    const graphRelated = KNOWLEDGE_GRAPH.links
      .filter(l => {
        const s = typeof l.source === 'object' ? l.source.id : l.source;
        const t = typeof l.target === 'object' ? l.target.id : l.target;
        return s === node.id || t === node.id;
      })
      .map(l => {
        const s = typeof l.source === 'object' ? l.source.id : l.source;
        const t = typeof l.target === 'object' ? l.target.id : l.target;
        return s === node.id ? t : s;
      });

    const related = (kb?.relatedTo || graphRelated)
      .filter(id => KNOWLEDGE_GRAPH.nodes.find(n => n.id === id))
      .slice(0, 6);

    const subtitle = kb ? [kb.tibetan, kb.sanskrit].filter(Boolean).join(' · ') : '';
    const content = kb?.description
      || `${node.label} — концепция учений Дзогчен. Задай вопрос в строке ниже, чтобы раскрыть эту тему глубже.`;

    const resp = mockResp || { title: node.label, subtitle, content, images: [], relatedNodes: related, thinking: [] };
    if (!mockResp && subtitle) resp.subtitle = subtitle;

    Graph.highlightNode(node.id);
    Graph.pulseNode(node.id);
    Graph.focusNode(node.id, true);
    addCrumb(node.id, node.label);
    showDetail(resp);
  }

  // ── Thinking animation ─────────────────────────────────────────────────────────────────
  function startThinking(words) {
    const overlay = document.getElementById('thinking-overlay');
    const txt = document.getElementById('thinking-words');
    overlay.classList.add('active');
    let i = 0;
    txt.textContent = words[0] || '...';
    thinkTimer = setInterval(() => {
      i = (i + 1) % words.length;
      txt.textContent = words[i];
    }, 480);
  }

  function stopThinking() {
    clearInterval(thinkTimer);
    document.getElementById('thinking-overlay').classList.remove('active');
  }

  // ── Detail panel ─────────────────────────────────────────────────────────────────────
  function showDetail(resp) {
    document.getElementById('detail-title').textContent = resp.title || '';
    document.getElementById('detail-subtitle').textContent = resp.subtitle || '';
    document.getElementById('detail-text').textContent = resp.content || '';

    const imgEl = document.getElementById('detail-images');
    imgEl.innerHTML = '';
    imgEl.className = (resp.images?.length === 1) ? 'single' : '';
    (resp.images || []).forEach(img => {
      const wrap = document.createElement('div');
      wrap.className = 'detail-img-wrap';
      const image = document.createElement('img');
      image.src = img.url;
      image.alt = img.caption || '';
      image.loading = 'lazy';
      const cap = document.createElement('div');
      cap.className = 'img-caption';
      cap.textContent = img.caption || '';
      wrap.append(image, cap);
      imgEl.appendChild(wrap);
    });

    const chipsEl = document.getElementById('related-chips');
    chipsEl.innerHTML = '';
    (resp.relatedNodes || []).forEach(id => {
      const node = KNOWLEDGE_GRAPH.nodes.find(n => n.id === id);
      if (!node) return;
      const chip = document.createElement('button');
      chip.className = 'chip';
      chip.textContent = node.label;
      chip.style.cssText = `border-color:${node.color}66; color:${node.color}; background:${node.color}16;`;
      chip.addEventListener('click', () => {
        closeDetail(false);
        setTimeout(() => onNodeClick(node), 280);
      });
      chipsEl.appendChild(chip);
    });

    document.getElementById('detail-panel').classList.add('open');
  }

  function closeDetail(reset = true) {
    document.getElementById('detail-panel').classList.remove('open');
    if (reset) {
      Graph.resetAll();
      Graph.resetZoom();
    }
  }

  // ── Journey crumbs ────────────────────────────────────────────────────────────────
  function addCrumb(nodeId, label) {
    if (journey.length && journey[journey.length - 1].nodeId === nodeId) return;
    journey.push({ nodeId, label });
    if (journey.length > 8) journey.shift();
    renderCrumbs();
  }

  function renderCrumbs() {
    const el = document.getElementById('journey-crumbs');
    el.innerHTML = journey.map((c, i) =>
      `<span class="crumb">${i > 0 ? '<span class="crumb-sep">→</span>' : ''}<span class="crumb-node">${c.label}</span></span>`
    ).join('');
  }

  function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

  document.addEventListener('DOMContentLoaded', init);

  return { closeDetail };
})();
