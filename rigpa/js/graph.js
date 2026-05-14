const Graph = (() => {
  let svg, g, simulation, zoomBeh;
  let nodeById = {};
  let clickCb = null;

  const W = () => window.innerWidth;
  const H = () => window.innerHeight;

  function init(container, { nodes, links }) {
    nodes.forEach(n => { nodeById[n.id] = n; });

    svg = d3.select(container).append('svg')
      .attr('width', '100%').attr('height', '100%');

    const defs = svg.append('defs');
    mkGlow(defs, 'glow', 3, 1);
    mkGlow(defs, 'glow-strong', 9, 1);
    mkGlow(defs, 'glow-trail', 5, 2);
    mkDropShadow(defs, 'shadow');

    g = svg.append('g').attr('id', 'scene');

    zoomBeh = d3.zoom().scaleExtent([0.15, 6])
      .on('zoom', e => g.attr('transform', e.transform));
    svg.call(zoomBeh).on('dblclick.zoom', null);

    svg.on('click', () => App && App.closeDetail && App.closeDetail());

    const linkG = g.append('g').attr('class', 'links');
    const linkSel = linkG.selectAll('line').data(links).join('line').attr('class', 'link');

    const nodeG = g.append('g').attr('class', 'nodes');
    const nodeSel = nodeG.selectAll('g').data(nodes).join('g')
      .attr('class', 'node-g')
      .call(d3.drag()
        .on('start', (e, d) => { if (!e.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
        .on('drag',  (e, d) => { d.fx = e.x; d.fy = e.y; })
        .on('end',   (e, d) => { if (!e.active) simulation.alphaTarget(0); d.fx = null; d.fy = null; })
      )
      .on('click', (e, d) => { e.stopPropagation(); if (clickCb) clickCb(d); });

    // Standard nodes
    nodeSel.filter(d => d.id !== 'dzogchen')
      .call(appendStandardNode);

    // Special Dzogchen icon
    nodeSel.filter(d => d.id === 'dzogchen')
      .call(appendDzogchenIcon);

    simulation = d3.forceSimulation(nodes)
      .alphaDecay(0.03)
      .force('link', d3.forceLink(links).id(d => d.id).distance(160).strength(0.35))
      .force('charge', d3.forceManyBody().strength(-900))
      .force('center', d3.forceCenter(W() / 2, H() / 2))
      .force('collide', d3.forceCollide(d => d.weight * 14))
      .on('end', () => simulation.stop())
      .on('tick', () => {
        linkSel
          .attr('x1', d => d.source.x).attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x).attr('y2', d => d.target.y);
        nodeSel.attr('transform', d => `translate(${d.x},${d.y})`);
      });

    nodeSel.attr('opacity', 0)
      .transition().delay((_, i) => i * 30).duration(600)
      .attr('opacity', 1);

    window.addEventListener('resize', () => {
      simulation.force('center', d3.forceCenter(W() / 2, H() / 2)).alpha(0.1).restart();
    });
  }

  function appendStandardNode(sel) {
    sel.append('circle').attr('class', 'node-aura')
      .attr('r', d => d.weight * 9)
      .attr('fill', d => d.color)
      .attr('opacity', 0.22)
      .attr('filter', 'url(#glow)');
    sel.append('circle').attr('class', 'node-core')
      .attr('r', d => d.weight * 4)
      .attr('fill', d => d.color)
      .attr('opacity', 0.95)
      .attr('filter', 'url(#shadow)');
    sel.append('text').attr('class', 'node-label')
      .attr('dy', d => d.weight * 4 + 15)
      .text(d => d.label);
  }

  function appendDzogchenIcon(sel) {
    const icon = sel.append('g').attr('class', 'dzogchen-icon')
      .attr('filter', 'url(#shadow)');

    // Five-color rings (outer → inner): blue, yellow, red, green, blue
    icon.append('circle').attr('r', 52).attr('fill', '#2244cc');
    icon.append('circle').attr('r', 43).attr('fill', '#f5c800');
    icon.append('circle').attr('r', 35).attr('fill', '#cc2020');
    icon.append('circle').attr('r', 27).attr('fill', '#228033');
    icon.append('circle').attr('r', 21).attr('fill', '#2244cc');

    // Tibetan "A" syllable — primordial syllable of Dzogchen
    icon.append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('dy', '0.05em')
      .attr('font-size', '28px')
      .attr('fill', 'white')
      .attr('font-family', 'serif, "Noto Serif Tibetan", Georgia')
      .attr('font-weight', 'bold')
      .text('ཨ');

    // Label below
    sel.append('text').attr('class', 'node-label')
      .attr('dy', 70)
      .attr('font-size', '13px')
      .attr('font-weight', '700')
      .text(d => d.label);
  }

  function mkGlow(defs, id, blur, spread) {
    const f = defs.append('filter').attr('id', id)
      .attr('x', '-60%').attr('y', '-60%').attr('width', '220%').attr('height', '220%');
    f.append('feGaussianBlur').attr('stdDeviation', blur).attr('result', 'b');
    const m = f.append('feMerge');
    m.append('feMergeNode').attr('in', 'b');
    m.append('feMergeNode').attr('in', 'SourceGraphic');
  }

  function mkDropShadow(defs, id) {
    const f = defs.append('filter').attr('id', id)
      .attr('x', '-40%').attr('y', '-40%').attr('width', '180%').attr('height', '180%');
    f.append('feDropShadow')
      .attr('dx', 0).attr('dy', 2)
      .attr('stdDeviation', 5)
      .attr('flood-color', 'rgba(0,0,0,0.3)');
  }

  function highlightNode(id) {
    d3.selectAll('.node-g').each(function(d) {
      const s = d3.select(this);
      const on = d.id === id;
      if (d.id === 'dzogchen') {
        s.select('.dzogchen-icon').attr('opacity', on ? 1 : 0.25);
        s.select('.node-label').attr('opacity', on ? 1 : 0.25);
      } else {
        s.select('.node-core').attr('opacity', on ? 1 : 0.18).attr('filter', on ? 'url(#glow-strong)' : 'url(#shadow)');
        s.select('.node-aura').attr('opacity', on ? 0.45 : 0.03);
        s.select('.node-label').attr('opacity', on ? 1 : 0.18);
      }
    });
  }

  function pulseNode(id) {
    if (id === 'dzogchen') {
      const icon = d3.selectAll('.node-g').filter(d => d.id === 'dzogchen').select('.dzogchen-icon');
      icon.transition().duration(180).attr('transform', 'scale(1.2)')
        .transition().duration(180).attr('transform', 'scale(0.95)')
        .transition().duration(120).attr('transform', 'scale(1.1)')
        .transition().duration(120).attr('transform', 'scale(1)');
      return;
    }
    const core = d3.selectAll('.node-g').filter(d => d.id === id).select('.node-core');
    const r = +core.attr('r');
    core
      .transition().duration(180).attr('r', r * 2.2)
      .transition().duration(180).attr('r', r * 0.9)
      .transition().duration(120).attr('r', r * 1.5)
      .transition().duration(120).attr('r', r);
  }

  function focusNode(id, panelOpen = false) {
    const n = nodeById[id];
    if (!n || n.x == null) return;
    const panelW = panelOpen ? 440 : 0;
    const availW = W() - panelW;
    const scale = 2.0;
    const tx = availW / 2 - n.x * scale;
    const ty = H() / 2 - n.y * scale;
    svg.transition().duration(750).ease(d3.easeCubicInOut)
      .call(zoomBeh.transform, d3.zoomIdentity.translate(tx, ty).scale(scale));
  }

  function resetAll() {
    d3.selectAll('.node-g').each(function(d) {
      const s = d3.select(this);
      if (d.id === 'dzogchen') {
        s.select('.dzogchen-icon').attr('opacity', 1);
        s.select('.node-label').attr('opacity', 1);
      } else {
        s.select('.node-core').attr('opacity', 0.92).attr('filter', 'url(#shadow)');
        s.select('.node-aura').attr('opacity', 0.22);
        s.select('.node-label').attr('opacity', 1);
      }
    });
    d3.selectAll('.link').classed('lit', false);
  }

  function resetZoom() {
    svg.transition().duration(650).call(zoomBeh.transform, d3.zoomIdentity);
  }

  function animateTrail(trailIds, color = '#7b6fff') {
    const pts = trailIds.map(id => nodeById[id]).filter(n => n && n.x != null);
    if (pts.length < 2) return Promise.resolve();

    d3.selectAll('.link').classed('lit', d => {
      for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i].id, b = pts[i + 1].id;
        const sid = typeof d.source === 'object' ? d.source.id : d.source;
        const tid = typeof d.target === 'object' ? d.target.id : d.target;
        if ((sid === a && tid === b) || (sid === b && tid === a)) return true;
      }
      return false;
    });

    const lineGen = d3.line().x(d => d.x).y(d => d.y).curve(d3.curveCatmullRom.alpha(0.5));
    const pathD = lineGen(pts);

    const arc = g.append('path')
      .attr('class', 'trail-arc')
      .attr('d', pathD)
      .attr('stroke', color)
      .attr('stroke-width', 2.5)
      .attr('opacity', 0.85)
      .attr('filter', 'url(#glow-trail)');

    const len = arc.node().getTotalLength();
    arc.attr('stroke-dasharray', len).attr('stroke-dashoffset', len);

    return new Promise(resolve => {
      arc.transition().duration(750).ease(d3.easeLinear)
        .attr('stroke-dashoffset', 0)
        .on('end', () => {
          const dot = g.append('circle')
            .attr('r', 5).attr('fill', 'white').attr('opacity', 1)
            .attr('filter', 'url(#glow-strong)');
          const p0 = arc.node().getPointAtLength(0);
          dot.attr('cx', p0.x).attr('cy', p0.y);

          dot.transition().duration(550).ease(d3.easeLinear)
            .attrTween('cx', () => t => arc.node().getPointAtLength(t * len).x)
            .attrTween('cy', () => t => arc.node().getPointAtLength(t * len).y)
            .on('end', () => {
              dot.transition().duration(280).attr('opacity', 0).attr('r', 12).remove();
              arc.transition().delay(150).duration(400).attr('opacity', 0).remove();
              setTimeout(() => d3.selectAll('.link').classed('lit', false), 800);
              resolve();
            });
        });
    });
  }

  function addNodes(newNodes, newLinks) {
    const nodeG = g.select('.nodes');
    const linkG = g.select('.links');

    newNodes.forEach(n => {
      nodeById[n.id] = n;
      n.x = W() / 2 + (Math.random() - 0.5) * 200;
      n.y = H() / 2 + (Math.random() - 0.5) * 200;
    });

    const allLinks = KNOWLEDGE_GRAPH.links;
    linkG.selectAll('line').data(allLinks).join('line').attr('class', 'link');

    const allNodes = KNOWLEDGE_GRAPH.nodes;
    const nodeSel = nodeG.selectAll('g').data(allNodes, d => d.id).join(
      enter => {
        const grp = enter.append('g').attr('class', 'node-g').style('cursor', 'pointer')
          .attr('opacity', 0)
          .call(d3.drag()
            .on('start', (e, d) => { if (!e.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
            .on('drag',  (e, d) => { d.fx = e.x; d.fy = e.y; })
            .on('end',   (e, d) => { if (!e.active) simulation.alphaTarget(0); d.fx = null; d.fy = null; })
          )
          .on('click', (e, d) => { e.stopPropagation(); if (clickCb) clickCb(d); });

        grp.call(appendStandardNode);
        grp.transition().duration(600).attr('opacity', 1);
        return grp;
      },
      update => update,
      exit => exit.remove()
    );

    simulation.nodes(allNodes);
    simulation.force('link').links(allLinks);
    simulation.alpha(0.4).restart();

    simulation.on('tick', () => {
      linkG.selectAll('line')
        .attr('x1', d => d.source.x).attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x).attr('y2', d => d.target.y);
      nodeG.selectAll('g').attr('transform', d => `translate(${d.x},${d.y})`);
    });
  }

  function onNodeClick(cb) { clickCb = cb; }

  return { init, highlightNode, pulseNode, focusNode, resetAll, resetZoom, animateTrail, onNodeClick, addNodes };
})();
