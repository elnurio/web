const App = (() => {
  let journey = [];
  let thinkTimer = null;
  let busy = false;

  function init() {
    Graph.init(document.getElementById('graph-container'), KNOWLEDGE_GRAPH);
    Graph.onNodeClick(onNodeClick);

    on('main-ask',    'click',   onMainAsk);
    on('detail-ask',  'click',   onDetailAsk);
    on('close-detail','click',   () => closeDetail());
    on('main-input',  'keydown', e => e.key === 'Enter' && onMainAsk());
    on('detail-input','keydown', e => e.key === 'Enter' && onDetailAsk());
  }

  function on(id, ev, fn) {
    document.getElementById(id).addEventListener(ev, fn);
  }

  function findResponse(q) {
    const lower = q.toLowerCase();
    return MOCK_RESPONSES.find(r => r.keywords.some(kw => lower.includes(kw))) || DEFAULT_RESPONSE;
  }

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
    const resp = findResponse(q);

    startThinking(resp.thinking);

    if (resp.trail.length >= 2) {
      await Graph.animateTrail(resp.trail);
    } else {
      await wait(900);
    }

    stopThinking();

    if (resp.targetNode) {
      Graph.highlightNode(resp.targetNode);
      Graph.pulseNode(resp.targetNode);
      await wait(250);
      Graph.focusNode(resp.targetNode, true);
      await wait(500);
      addCrumb(resp.targetNode, resp.title);
    }

    showDetail(resp);
    busy = false;
  }

  function onNodeClick(node) {
    if (busy) return;
    const resp = MOCK_RESPONSES.find(r => r.targetNode === node.id);
    if (!resp) return;

    Graph.highlightNode(node.id);
    Graph.pulseNode(node.id);
    Graph.focusNode(node.id, true);
    addCrumb(node.id, node.label);
    showDetail(resp);
  }

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

  function showDetail(resp) {
    document.getElementById('detail-title').textContent = resp.title;
    document.getElementById('detail-text').textContent = resp.content;

    const imgEl = document.getElementById('detail-images');
    imgEl.innerHTML = '';
    imgEl.className = resp.images.length === 1 ? 'single' : '';
    resp.images.forEach(img => {
      const wrap = document.createElement('div');
      wrap.className = 'detail-img-wrap';
      const image = document.createElement('img');
      image.src = img.url;
      image.alt = img.caption;
      image.loading = 'lazy';
      const cap = document.createElement('div');
      cap.className = 'img-caption';
      cap.textContent = img.caption;
      wrap.append(image, cap);
      imgEl.appendChild(wrap);
    });

    const chipsEl = document.getElementById('related-chips');
    chipsEl.innerHTML = '';
    resp.relatedNodes.forEach(id => {
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

  function addCrumb(nodeId, label) {
    // Replace last if same, otherwise append
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
