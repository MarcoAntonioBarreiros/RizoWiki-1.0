'use strict';
// RizoWiki · Fatores — matriz de evidências, páginas por fator e Sankey (base: módulo GPT/Gemini; visual e gráficos refeitos)
const F = window.FAT;
const app = document.getElementById('app');
const popRaiz = document.getElementById('pop-raiz');
const corGrupo = Object.fromEntries(F.grupos.map(g => [g.nome, g.cor]));
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const num = (v, d = 2) => v == null ? '—' : Number(v).toLocaleString('pt-BR', { maximumFractionDigits: d });
const hexA = (h, a) => { const n = parseInt(h.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };
const segundaCor = c => (c === '#fbbf24' || c === '#f97316') ? '#38bdf8' : '#fbbf24';
const terceiraCor = '#f472b6';
const expsDoFator = id => F.exps.filter(e => e.fatores.includes(id));
const expsDaCelula = (g, f) => expsDoFator(f).filter(e => e.grupoM === g);
const fatorPorId = id => F.fatores.find(f => f.id === id);
const ehFora = e => !/brasil/i.test(e.location || '');
let fatorAtual = null;

// ---------- intensidade de uma célula ----------
function resumoCelula(a, fid) {
  if (fid === 'formulacao') {
    const p = a.filter(e => e.prot && e.prot.sem !== undefined);
    if (p.length) { const m = p.reduce((x, y) => (y.prot.com - y.prot.sem > x.prot.com - x.prot.sem ? y : x));
      return { tipo: 'ganha', mag: Math.min(100, m.prot.com - m.prot.sem), txt: num(m.prot.sem, 1) + '→' + num(m.prot.com, 0) + '%' }; }
    return { tipo: 'qual', mag: 0, txt: (a[0].prot && a[0].prot.qual) || 'qualitativo' };
  }
  const comNum = a.filter(e => e.sobra !== undefined);
  const perdas = comNum.filter(e => e.sobra < 100);
  if (perdas.length) { const pior = Math.min(...perdas.map(e => e.sobra)); return { tipo: 'perde', mag: 100 - pior, txt: '−' + num(100 - pior, 0) + '%' }; }
  if (comNum.length) { const m = Math.max(...comNum.map(e => e.sobra)); return { tipo: 'ganha', mag: Math.min(m - 100, 100), txt: '+' + num(m - 100, 0) + '%' }; }
  return { tipo: 'qual', mag: 0, txt: a[0].qual || 'qualitativo' };
}
function esfera(c, mag, tipo, id) {
  // disco de vidro fosco (mesmo estilo dos pontos do solo): fundo translúcido, anel na cor do organismo, brilho suave
  const r = tipo === 'qual' ? 9 : 7 + 18 * Math.sqrt(mag / 100);
  if (tipo === 'qual') return `<svg width="56" height="56" viewBox="-28 -28 56 56"><circle r="${r}" fill="${hexA(c, .1)}" stroke="${c}" stroke-width="2" stroke-dasharray="3 3"/></svg>`;
  const seta = tipo === 'ganha' ? `<path d="M0 -6 L6 2 L-6 2 Z" fill="${c}"/>` : '';
  return `<svg width="56" height="56" viewBox="-28 -28 56 56"><circle r="${r + 3}" fill="${c}" opacity=".13"/>
    <circle r="${r}" fill="${hexA(c, .3)}" stroke="${c}" stroke-width="2.2"/><circle r="${Math.max(r - 3.5, 2)}" fill="none" stroke="#fff" stroke-opacity=".12" stroke-width="1"/>${seta}</svg>`;
}

// ---------- VISÃO GERAL: matriz ----------
function visaoGeral() {
  fatorAtual = null; fecharPop();
  const nPub = F.exps.length, nConf = F.exps.filter(e => e.conferido).length, nAcv = Object.values(F.acervo).reduce((a, b) => a + b, 0);
  let cel = 0;
  const linhas = F.grupos.map(g => {
    const tiles = F.fatores.map(f => {
      const a = f.soAcervo ? [] : expsDaCelula(g.nome, f.id);
      const nA = F.acervo[g.nome + '|' + f.id] || 0;
      if (a.length) {
        const r = resumoCelula(a, f.id); cel++;
        const resp = [...new Set(a.map(e => e.curto))].join(' · ');
        return `<button class="tile" data-g="${esc(g.nome)}" data-f="${f.id}" style="--c:${g.cor};--bgc:${hexA(g.cor, .16)};--bdc:${hexA(g.cor, .28)}"
          aria-label="${esc(g.nome)} e ${esc(f.nome)}">${esfera(g.cor, r.mag, r.tipo, cel)}
          <b class="t-num ${r.tipo === 'qual' ? 'q' : ''} ${r.txt.includes('→') ? 'p' : ''}">${esc(r.txt)}</b><span class="t-resp">${esc(resp)}</span>
          <span class="t-pe">${a.map(() => '<span></span>').join('')}</span>${nA ? `<span class="t-acv" title="no acervo, a conferir">+${nA}</span>` : ''}</button>`;
      }
      if (nA) return `<button class="tile acervo" data-g="${esc(g.nome)}" data-f="${f.id}" data-acv="1"><b>no acervo</b><small>${nA} ${nA > 1 ? 'resultados' : 'resultado'} a conferir</small></button>`;
      return `<div class="vazio" title="sem estudo encontrado">—</div>`;
    }).join('');
    return `<div class="m-org" style="--c:${g.cor}"><i></i><span>${esc(g.nome)}${g.nome === 'Bioinseticidas' ? '<small>Beauveria, Metarhizium, Bt, Chromobacterium</small>' : g.nome === 'PNSB' ? '<small>bactérias púrpuras</small>' : ''}</span></div>${tiles}`;
  }).join('');
  app.innerHTML = `
  <div class="panel">
    <div style="display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;align-items:start">
      <div><p class="eyebrow">Mapa de evidências</p><h1>O que ajuda ou atrapalha cada biológico</h1>
        <p class="lead">Cada esfera mostra a <b>maior perda medida</b> quando o fator aparece, comparada com o mesmo biológico sem o fator. Toque numa célula para ver os estudos; toque no nome do fator (no alto da coluna) para ver todos os gráficos.</p></div>
      <span class="selo"><i class="fas fa-circle-check"></i> ${nConf} de ${nPub} estudos conferidos na fonte</span>
    </div>
    <div class="matriz-rolagem"><div class="matriz">
      <div></div>${F.fatores.map(f => `<button class="m-cab ${f.soAcervo ? 'soacervo' : ''}" data-fator="${f.soAcervo ? '' : f.id}"><i class="fas ${f.icone}"></i>${esc(f.nome)}</button>`).join('')}
      ${linhas}
    </div></div>
    <div class="legenda">
      <span>${esfera('#94a3b8', 15, 'perde', 'l1')}${esfera('#94a3b8', 90, 'perde', 'l2')} perdeu pouco · perdeu muito</span>
      <span>${esfera('#94a3b8', 40, 'ganha', 'l3')} o fator ajudou</span>
      <span>${esfera('#94a3b8', 0, 'qual', 'l4')} sem número (teste de sim ou não)</span>
      <span><b style="color:var(--text)">—</b> nenhum estudo encontrado</span>
    </div>
    <p class="lead" style="font-size:12.5px;margin-top:10px">${nPub} medidas em ${cel} combinações; ${nConf} delas já reconferidas no artigo original. A cor é o organismo. Laboratório, estufa e campo têm contextos diferentes: veja o tipo de ensaio em cada estudo.</p>
  </div>
  <div class="panel sankey-panel">
    <p class="eyebrow">Fluxo de solução</p><h2>Do problema no campo ao mecanismo do biológico</h2>
    <p class="lead" style="font-size:13.5px">Toque num problema, num biológico ou num mecanismo para acender os caminhos ligados a ele.</p>
    <div class="sk-info" id="sk-info"><i class="fas fa-hand-pointer"></i><div><b>Toque no diagrama</b><span>Cada linha liga um problema a um biológico e ao mecanismo que ele usa.</span></div></div>
    <div id="sankey"></div>
    <p class="lead" style="font-size:12px;margin-top:6px">Mecanismos gerais descritos na literatura. Não são medidas: os números estão na matriz acima.</p>
  </div>`;
  requestAnimationFrame(() => desenharSankey());
  ligarNav();
  app.querySelectorAll('.m-cab[data-fator]').forEach(b => b.dataset.fator && b.addEventListener('click', () => abrirFator(b.dataset.fator)));
  app.querySelectorAll('.tile').forEach(t => {
    t.addEventListener('click', ev => { ev.stopPropagation(); mostrarPop(t); });
    t.addEventListener('pointerenter', ev => { if (ev.pointerType === 'mouse') mostrarPop(t); });
  });
}
function navFatores() {
  return `<nav class="nav"><button data-nav="" class="${fatorAtual ? '' : 'on'}"><i class="fas fa-table-cells"></i>Visão geral</button>${F.fatores.filter(f => !f.soAcervo).map(f =>
    `<button data-nav="${f.id}" class="${fatorAtual === f.id ? 'on' : ''}"><i class="fas ${f.icone}"></i>${esc(f.nome)}</button>`).join('')}</nav>`;
}
function ligarNav() { app.querySelectorAll('[data-nav]').forEach(b => b.addEventListener('click', () => b.dataset.nav ? abrirFator(b.dataset.nav) : visaoGeral())); }

// ---------- POPOVER junto da célula ----------
function fecharPop() { popRaiz.innerHTML = ''; app.querySelectorAll('.tile.sel').forEach(t => t.classList.remove('sel')); }
function mostrarPop(t) {
  const g = t.dataset.g, f = fatorPorId(t.dataset.f), c = t.dataset.acv ? '#64748b' : corGrupo[g];
  if (t.classList.contains('sel')) return;
  fecharPop(); t.classList.add('sel');
  let corpo;
  if (t.dataset.acv) {
    const itens = (F.acervoItens[g + '|' + f.id] || []).slice(0, 6);
    corpo = `<p class="pop-acv">Há estudos sobre isso no acervo, mas os números ainda não foram conferidos na fonte. Por isso não aparecem como esfera.</p>
      <ul class="pop-acv">${itens.map(i => `<li>${esc(i)}</li>`).join('')}</ul>`;
  } else {
    const a = expsDaCelula(g, f.id);
    const nA = F.acervo[g + '|' + f.id] || 0;
    corpo = a.map(e => `<div class="pop-item"><div class="pop-num">${f.id === 'formulacao' && e.prot ? (e.prot.sem !== undefined ? num(e.prot.sem, 1) + '→' + num(e.prot.com, 0) + '%<br><small>sem → com</small>' : '<small>' + esc(e.prot.qual) + '</small>') : e.sobra !== undefined ? (e.sobra <= 100 ? num(e.sobra, 1) + '%<br><small>sobrou</small>' : '+' + num(e.sobra - 100, 0) + '%<br><small>a mais</small>') : '<small>' + esc(e.qual) + '</small>'}</div>
      <div><p>${esc(e.headline)}</p><small>${esc(e.curto)} · ${esc(e.kind)} · ${esc(e.location)}</small></div></div>`).join('') +
      (nA ? `<p class="pop-acv" style="margin:8px 0 0">+${nA} resultado(s) no acervo, a conferir.</p>` : '') +
      `<button class="pop-ir" data-ir="${f.id}" data-jump="${a[0].id}">Ver os gráficos de ${esc(f.nome.toLowerCase())} <i class="fas fa-arrow-right"></i></button>`;
  }
  popRaiz.innerHTML = `<div class="pop" style="--c:${c}" role="dialog"><button class="fechar" aria-label="Fechar"><i class="fas fa-xmark"></i></button>
    <h3>${esc(g)} · ${esc(f.nome)}</h3><p class="sub">${t.dataset.acv ? 'ainda sem dado conferido' : 'o que os estudos mediram'}</p>${corpo}</div>`;
  const p = popRaiz.firstElementChild, r = t.getBoundingClientRect(), W = innerWidth, H = innerHeight, pw = p.offsetWidth, ph = p.offsetHeight;
  let x = r.right + 10, y = r.top;
  if (x + pw > W - 8) x = r.left - pw - 10;
  if (x < 8) { x = Math.max(8, Math.min(W - pw - 8, r.left + r.width / 2 - pw / 2)); y = r.bottom + 8; if (y + ph > H - 8) y = r.top - ph - 8; }
  y = Math.max(8, Math.min(y, H - ph - 8));
  p.style.left = x + 'px'; p.style.top = y + 'px';
  p.querySelector('.fechar').onclick = fecharPop;
  const ir = p.querySelector('.pop-ir'); if (ir) ir.onclick = () => abrirFator(ir.dataset.ir, ir.dataset.jump);
  p.addEventListener('click', ev => ev.stopPropagation());
}
document.addEventListener('click', fecharPop);
addEventListener('scroll', () => { if (popRaiz.innerHTML) fecharPop(); }, { passive: true });

// ---------- VISÃO DO FATOR ----------
function abrirFator(id, salto) {
  fecharPop(); fatorAtual = id;
  const f = fatorPorId(id), v = F.views[id] || {}, a = expsDoFator(id);
  const ordem = F.grupos.map(g => g.nome);
  const ordenados = [...a].sort((x, y) => ordem.indexOf(x.grupoM) - ordem.indexOf(y.grupoM));
  app.innerHTML = `
  <div class="panel">
    <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap">
      <button class="voltar" data-nav=""><i class="fas fa-arrow-left"></i> Visão geral</button><span class="selo"><i class="fas fa-circle-check"></i> ${a.filter(e => e.conferido).length} de ${a.length} estudos conferidos na fonte</span></div>
    ${navFatores()}
    <div class="hero">
      <div><div class="hero-ic"><i class="fas ${f.icone}"></i></div><p class="eyebrow">${esc(f.nome)}</p><h1>${esc(v.title || f.nome)}</h1><p class="lead">${esc(v.lead || '')}</p></div>
      <div class="manejo"><b>No manejo</b>${esc(v.practice || '')}</div>
    </div>
    <div class="integrado">
      <div class="cab"><div><p class="eyebrow">Todos juntos</p><h2>${id === 'formulacao' ? 'Quanto a proteção segura de cada biológico' : 'Quanto sobra de cada biológico com ' + esc(artigo(id))}</h2>
        <p>${id === 'formulacao' ? 'Barra clara: o que sobrou sem proteção. Barra cheia: o que sobrou com a formulação protetora, no mesmo teste.' : 'Cada barra compara o biológico com ele mesmo sem o fator (linha de 100%).'} Toque numa linha para ver o gráfico do estudo.</p></div>
        <span class="chip">${new Set(a.map(e => e.grupoM)).size} grupos · ${a.length} medidas</span></div>
      ${id === 'formulacao' ? graficoProtecao(a) : graficoIntegrado(a)}
    </div>
  </div>
  <div class="cards">${ordenados.map(cartao).join('')}</div>`;
  ligarNav();
  app.querySelectorAll('.linha-int').forEach(l => l.addEventListener('click', () => saltar(l.dataset.id)));
  app.scrollIntoView({ block: 'start' });
  if (salto) setTimeout(() => saltar(salto), 60);
}
function artigo(id) {
  return { temperatura: 'o calor', radiacao: 'o sol (UV)', agua: 'pouca água', compatibilidade: 'produtos químicos', tempo: 'o passar do tempo',
    nutricao: 'adubo', formulacao: 'a formulação', salinidade: 'sal', ph: 'a acidez' }[id] || 'o fator';
}
function saltar(id) {
  const el = document.getElementById('c-' + id); if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  el.classList.add('realce'); setTimeout(() => el.classList.remove('realce'), 2200);
}

// Gráfico integrado: todos os organismos do fator na mesma régua "% que sobra"
function graficoIntegrado(a) {
  const com = a.filter(e => e.sobra !== undefined).sort((x, y) => x.sobra - y.sobra);
  const sem = a.filter(e => e.sobra === undefined);
  const lista = [...com, ...sem];
  const W = 1000, esq = 300, dir = 80, alt = 46, topo = 30, H = topo + lista.length * alt + 10;
  const max = 150; // ganhos acima de +50% ficam no limite da régua; o número mostra o valor real
  const x = v => esq + (W - esq - dir) * Math.min(v, max) / max;
  let s = `<svg class="g" viewBox="0 0 ${W} ${H}" role="img" aria-label="Quanto sobra de cada biológico">`;
  [0, 25, 50, 75, 100, 125, 150].filter(t => t <= max).forEach(t => {
    s += `<line x1="${x(t)}" x2="${x(t)}" y1="${topo - 6}" y2="${H - 6}" stroke="var(--grid)" ${t === 100 ? 'stroke-width="2" stroke-dasharray="5 4" stroke="var(--muted)"' : ''}/>
      <text x="${x(t)}" y="${topo - 12}" text-anchor="middle" font-size="12" fill="var(--muted)">${t}%</text>`;
  });
  s += `<text x="${x(100) + 6}" y="${H - 10}" font-size="11.5" fill="var(--muted)">sem o fator = 100%</text>`;
  lista.forEach((e, i) => {
    const y = topo + i * alt, c = corGrupo[e.grupoM], cy = y + alt / 2;
    s += `<g class="linha-int" data-id="${e.id}"><rect class="fundo" x="0" y="${y + 2}" width="${W}" height="${alt - 4}" rx="10" fill="transparent"/>
      <circle cx="14" cy="${cy}" r="6" fill="${c}"/>
      <text x="28" y="${cy - 3}" font-size="14" font-weight="700" fill="var(--strong)">${esc(e.grupoM)} · ${esc(e.curto)}</text>
      <text x="28" y="${cy + 14}" font-size="11.5" fill="var(--muted)">${esc(e.kind)}${ehFora(e) ? ' · fora do Brasil' : ''}</text>`;
    if (e.sobra !== undefined) {
      const w = Math.max(x(e.sobra) - esq, 3);
      s += `<rect x="${esq}" y="${cy - 9}" width="${x(100) - esq}" height="18" rx="9" fill="${hexA(c, .1)}"/>
        <rect x="${esq}" y="${cy - 9}" width="${w}" height="18" rx="9" fill="${c}"><title>${esc(e.sobraRef)}</title></rect>
        <text x="${esq + w + 8}" y="${cy + 5}" font-size="14" font-weight="700" fill="var(--strong)">${e.sobra > 100 ? '+' + num(e.sobra - 100, 0) + '%' : num(e.sobra, 1) + '%'}</text>`;
    } else {
      s += `<rect x="${esq}" y="${cy - 13}" width="${x(100) - esq}" height="26" rx="13" fill="none" stroke="${c}" stroke-dasharray="4 4"/>
        <text x="${esq + 14}" y="${cy + 5}" font-size="13" fill="var(--text)">${esc(e.qual)} · sem número comparável</text>`;
    }
    s += `</g>`;
  });
  return s + '</svg>';
}

function graficoProtecao(a) {
  const W = 1000, esq = 300, dir = 90, alt = 58, topo = 30, H = topo + a.length * alt + 10, max = 125;
  const x = v => esq + (W - esq - dir) * Math.min(v, max) / max;
  let s = `<svg class="g" viewBox="0 0 ${W} ${H}">`;
  [0, 25, 50, 75, 100, 125].forEach(t => s += `<line x1="${x(t)}" x2="${x(t)}" y1="${topo - 6}" y2="${H - 6}" stroke="var(--grid)" ${t === 100 ? 'stroke-dasharray="5 4" stroke="var(--muted)" stroke-width="2"' : ''}/><text x="${x(t)}" y="${topo - 12}" text-anchor="middle" font-size="12" fill="var(--muted)">${t}%</text>`);
  a.forEach((e, i) => {
    const y = topo + i * alt, cy = y + alt / 2, c = corGrupo[e.grupoM];
    s += `<g class="linha-int" data-id="${e.id}"><rect class="fundo" x="0" y="${y + 2}" width="${W}" height="${alt - 4}" rx="10" fill="transparent"/><circle cx="14" cy="${cy}" r="6" fill="${c}"/>
      <text x="28" y="${cy - 3}" font-size="14" font-weight="700" fill="var(--strong)">${esc(e.grupoM)} · ${esc(e.curto)}</text><text x="28" y="${cy + 14}" font-size="11.5" fill="var(--muted)">${esc(e.kind)}${ehFora(e) ? ' · fora do Brasil' : ''}</text>`;
    if (e.prot && e.prot.sem !== undefined) {
      s += `<rect x="${esq}" y="${cy - 17}" width="${Math.max(x(e.prot.sem) - esq, 3)}" height="13" rx="6.5" fill="${hexA(c, .35)}"><title>${esc(e.prot.ref)}</title></rect>
        <text x="${Math.max(x(e.prot.sem), esq + 3) + 8}" y="${cy - 6}" font-size="12" fill="var(--muted)">sem proteção: ${num(e.prot.sem, 1)}%</text>
        <rect x="${esq}" y="${cy + 2}" width="${x(e.prot.com) - esq}" height="15" rx="7.5" fill="${c}"><title>${esc(e.prot.ref)}</title></rect>
        <text x="${x(e.prot.com) + 8}" y="${cy + 14}" font-size="13.5" font-weight="700" fill="var(--strong)">com proteção: ${num(e.prot.com, 0)}%</text>`;
    } else s += `<rect x="${esq}" y="${cy - 13}" width="${x(100) - esq}" height="26" rx="13" fill="none" stroke="${c}" stroke-dasharray="4 4"/><text x="${esq + 14}" y="${cy + 5}" font-size="13" fill="var(--text)">${esc((e.prot && e.prot.qual) || 'sem número comparável')}</text>`;
    s += '</g>';
  });
  return s + '</svg>';
}

// ---------- CARTÕES com gráficos ----------
function cartao(e) {
  const c = corGrupo[e.grupoM];
  const conferido = /^reconferido|reconferido em/i.test(e.verification || '');
  return `<article class="card" id="c-${e.id}" style="--c:${c}">
    <div class="card-top"><span class="chip g"><i class="fas fa-circle" style="font-size:7px"></i>${esc(e.grupoM)}</span><span class="chip">${esc(e.kind)}</span>
      <span class="chip ${ehFora(e) ? 'fora' : ''}">${esc(e.location)}</span><span class="chip ${e.conferido ? 'ok' : 'pend'}"><i class="fas ${e.conferido ? 'fa-circle-check' : 'fa-hourglass-half'}"></i>${e.conferido ? 'conferido na fonte' : 'a conferir'}</span></div>
    <h3>${esc(e.title)}</h3><p class="org">${esc(e.organism)}</p>
    <p class="metrica">${esc(e.metric)}${e.unit ? ' · ' + esc(e.unit) : ''}</p>
    ${desenhar(e, c)}
    <p class="resultado">${esc(e.headline)}</p>${e.meaning && e.meaning.trim() !== (e.headline || '').trim() ? `<p class="sentido">${esc(e.meaning)}</p>` : ''}
    ${fatorAtual === 'formulacao' && e.prot ? `<p class="conta"><i class="fas fa-calculator"></i> Sem × com proteção: ${esc(e.prot.ref)}.</p>` : e.sobraRef ? `<p class="conta"><i class="fas fa-calculator"></i> Conta do "quanto sobra": ${esc(e.sobraRef)}.</p>` : ''}
    <details class="fonte"><summary><i class="fas fa-book"></i> Fonte e limites</summary>
      <p><b>Fonte:</b> ${esc(e.source)} · ${esc(e.locator)}</p><p><b>Condições:</b> ${esc(e.condition)}</p>
      <p><b>Comparação:</b> ${esc(e.baseline)}</p><p><b>Repetições:</b> ${esc(e.rep)}</p><p><b>Vínculos:</b> ${esc(e.affiliation)}</p>
      <p><b>Limite:</b> ${esc(e.note)}</p><p class="${conferido ? '' : 'aconferir'}"><b>Conferência:</b> ${esc(e.verification)}</p></details>
  </article>`;
}

// ---------- tipos de gráfico ----------
function desenhar(e, c) {
  const t = e.grafico;
  try {
    if (t === 'linha' || t === 'linha-log') return gLinha(e, c, t === 'linha-log');
    if (t === 'colunas') return gColunas(e, c);
    if (t === 'barras') return gBarras(e, c);
    if (t.startsWith('inclinacao')) return gInclinacao(e, c, t.includes('-t'), t.includes('log'));
    if (t === 'antes-depois') return gAntesDepois(e, c);
    if (t === 'duracao') return gDuracao(e, c);
    if (t === 'waffle') return gWaffle(e, c);
    if (t === 'qualitativo') return gQual(e, c);
  } catch (err) { console.error(e.id, err); }
  return gBarras(e, c);
}
const coresSerie = (c, n) => [c, segundaCor(c), terceiraCor].slice(0, Math.max(n, 1));
function legenda(nomes, cores) { return nomes.length > 1 ? `<div class="leg-serie">${nomes.map((n, i) => `<span><i style="background:${cores[i]}"></i>${esc(n)}</span>`).join('')}</div>` : ''; }
function escalaY(vals, log, max0) {
  if (log) {
    const pos = vals.filter(v => v > 0); const lo = Math.floor(Math.log10(Math.min(...pos))), hi = Math.ceil(Math.log10(Math.max(...pos)));
    return { log: true, lo: Math.min(lo, hi - 1), hi, ticks: Array.from({ length: hi - Math.min(lo, hi - 1) + 1 }, (_, i) => Math.pow(10, Math.min(lo, hi - 1) + i)) };
  }
  const mx = Math.max(...vals, max0 || 0) || 1; const passo = Math.pow(10, Math.floor(Math.log10(mx))) / (mx / Math.pow(10, Math.floor(Math.log10(mx))) > 5 ? 1 : 2);
  const hi = Math.ceil(mx / passo) * passo; const ticks = []; for (let v = 0; v <= hi + 1e-9; v += passo) ticks.push(+v.toFixed(6));
  return { log: false, lo: 0, hi, ticks };
}
const sup = n => String(n).replace(/[-0-9]/g, d => '⁻⁰¹²³⁴⁵⁶⁷⁸⁹'['-0123456789'.indexOf(d)]);
const rotTick = (v, esc_) => esc_.log ? '10' + sup(Math.round(Math.log10(v))) : num(v);
function yPos(v, s, top, h) {
  if (s.log) { const lv = v > 0 ? Math.log10(v) : s.lo; return top + h - h * (Math.max(lv, s.lo) - s.lo) / (s.hi - s.lo); }
  return top + h - h * v / s.hi;
}
function caminhoSuave(p) {
  if (p.length < 3) return 'M' + p.map(q => q.join(',')).join(' L');
  let d = `M${p[0][0]},${p[0][1]}`;
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[i - 1] || p[i], p1 = p[i], p2 = p[i + 1], p3 = p[i + 2] || p2;
    const lo = Math.min(p1[1], p2[1]), hi = Math.max(p1[1], p2[1]), cl = v => Math.max(lo, Math.min(hi, v));
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, cl(p1[1] + (p2[1] - p0[1]) / 6)], c2 = [p2[0] - (p3[0] - p1[0]) / 6, cl(p2[1] - (p3[1] - p1[1]) / 6)];
    d += ` C${c1[0]},${c1[1]} ${c2[0]},${c2[1]} ${p2[0]},${p2[1]}`;
  }
  return d;
}
function gLinha(e, c, log) {
  const W = 560, H = 270, L = 54, R = 24, T = 22, B = 36, w = W - L - R, h = H - T - B;
  const todos = e.series.flatMap(s => s.values); const s = escalaY(todos, log, e.maximum && !log ? e.maximum : 0);
  const xs = e.xValues && e.xValues.length === e.labels.length ? e.xValues : e.labels.map((_, i) => i);
  const x0 = Math.min(...xs), x1 = Math.max(...xs); const X = v => L + w * (x1 === x0 ? .5 : (v - x0) / (x1 - x0));
  const cores = coresSerie(c, e.series.length); const id = 'gr' + e.id;
  let g = `${legenda(e.series.map(q => q.name), cores)}<svg class="g" viewBox="0 0 ${W} ${H}">`;
  s.ticks.forEach(t => { const y = yPos(t, s, T, h); g += `<line x1="${L}" x2="${W - R}" y1="${y}" y2="${y}" stroke="var(--grid)"/><text x="${L - 8}" y="${y + 4}" text-anchor="end" font-size="11" fill="var(--muted)">${rotTick(t, s)}</text>`; });
  e.labels.forEach((l, i) => g += `<text x="${X(xs[i])}" y="${H - 12}" text-anchor="middle" font-size="12" fill="var(--muted)">${esc(l)}</text>`);
  e.series.forEach((q, k) => {
    const pts = q.values.map((v, i) => [X(xs[i]), yPos(v, s, T, h)]);
    g += `<defs><linearGradient id="${id}${k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${cores[k]}" stop-opacity="${e.series.length > 1 ? .18 : .35}"/><stop offset="1" stop-color="${cores[k]}" stop-opacity="0"/></linearGradient></defs>`;
    g += `<path d="${caminhoSuave(pts)} L${pts[pts.length - 1][0]},${T + h} L${pts[0][0]},${T + h} Z" fill="url(#${id}${k})"/>`;
    g += `<path d="${caminhoSuave(pts)}" fill="none" stroke="${cores[k]}" stroke-width="3" stroke-linecap="round"/>`;
    const imin = q.values.indexOf(Math.min(...q.values));
    pts.forEach((p, i) => {
      const outros = e.series.filter((_, j) => j !== k).map(o => o.values[i]);
      const acima = !outros.length || q.values[i] >= Math.max(...outros) ? -12 : 21;
      g += `<circle cx="${p[0]}" cy="${p[1]}" r="${i === imin ? 6.5 : 4.5}" fill="${i === imin ? cores[k] : 'var(--bg)'}" stroke="${cores[k]}" stroke-width="2.5"/>
        <text x="${p[0]}" y="${p[1] + acima}" text-anchor="${i === 0 ? 'start' : i === pts.length - 1 ? 'end' : 'middle'}" dx="${i === 0 ? 4 : i === pts.length - 1 ? -4 : 0}" font-size="12" font-weight="700" fill="${cores[k]}" paint-order="stroke" stroke="var(--bg)" stroke-width="3">${num(q.values[i])}</text>`;
    });
  });
  return g + '</svg>';
}
function gColunas(e, c) {
  const W = 560, H = 260, L = 46, R = 12, T = 26, B = 40, w = W - L - R, h = H - T - B;
  const s = escalaY(e.series.flatMap(q => q.values), false, e.maximum || 0); const cores = coresSerie(c, e.series.length);
  cores[0] = e.series.length > 1 ? '#64748b' : c; if (e.series.length > 1) cores[1] = c;
  const gw = w / e.labels.length, bw = Math.min(54, (gw - 26) / e.series.length);
  let g = `${legenda(e.series.map(q => q.name), cores)}<svg class="g" viewBox="0 0 ${W} ${H}">`;
  s.ticks.forEach(t => { const y = yPos(t, s, T, h); g += `<line x1="${L}" x2="${W - R}" y1="${y}" y2="${y}" stroke="var(--grid)"/><text x="${L - 8}" y="${y + 4}" text-anchor="end" font-size="11" fill="var(--muted)">${num(t)}</text>`; });
  e.labels.forEach((l, i) => {
    const gx = L + i * gw + gw / 2 - (bw * e.series.length + 6 * (e.series.length - 1)) / 2;
    e.series.forEach((q, k) => {
      const v = q.values[i], y = yPos(v, s, T, h), x = gx + k * (bw + 6);
      g += `<rect x="${x}" y="${y}" width="${bw}" height="${T + h - y}" rx="7" fill="${cores[k]}" opacity="${k === 0 && e.series.length > 1 ? .55 : .95}"/>
        <text x="${x + bw / 2}" y="${y - 7}" text-anchor="middle" font-size="12.5" font-weight="700" fill="var(--strong)">${num(v)}</text>`;
    });
    g += `<text x="${L + i * gw + gw / 2}" y="${H - 14}" text-anchor="middle" font-size="12.5" fill="var(--muted)">${esc(l)}</text>`;
  });
  return g + '</svg>';
}
function gBarras(e, c) {
  const vals = e.series[0].values, labels = e.labels;
  const iref = e.refIdx !== undefined ? e.refIdx : labels.findIndex(l => /controle|sem fungicida|sem aditivo|meio sem|sem uv|0% n|sem alum/i.test(l));
  const ref = iref >= 0 ? vals[iref] : null;
  const W = 560, L = 190, R = 70, alt = labels.length > 6 ? 24 : 34, T = 14, H = T + labels.length * alt + 26;
  const mx = Math.max(...vals, e.maximum && e.maximum < Math.max(...vals) * 3 ? e.maximum : 0) || 1;
  const X = v => L + (W - L - R) * v / mx;
  let g = `<svg class="g" viewBox="0 0 ${W} ${H}">`;
  if (ref !== null) g += `<line x1="${X(ref)}" x2="${X(ref)}" y1="${T - 6}" y2="${H - 20}" stroke="var(--muted)" stroke-dasharray="5 4"/><text x="${X(ref)}" y="${H - 6}" text-anchor="middle" font-size="11" fill="var(--muted)">referência</text>`;
  labels.forEach((l, i) => {
    const v = vals[i], y = T + i * alt, bh = alt - (alt > 30 ? 12 : 8), cor = i === iref ? '#64748b' : c;
    const queda = ref && i !== iref ? v / ref : null;
    g += `<text x="${L - 10}" y="${y + bh / 2 + 4}" text-anchor="end" font-size="${alt > 30 ? 12.5 : 11.5}" fill="var(--text)">${esc(l)}</text>
      <rect x="${L}" y="${y}" width="${W - L - R}" height="${bh}" rx="${bh / 2}" fill="${hexA('#94a3b8', .08)}"/>
      <rect x="${L}" y="${y}" width="${Math.max(X(v) - L, v > 0 ? 4 : 0)}" height="${bh}" rx="${bh / 2}" fill="${cor}" opacity="${queda !== null && queda < .5 ? 1 : .8}"/>
      ${v === 0 ? `<text x="${L + 6}" y="${y + bh / 2 + 4}" font-size="11.5" font-weight="700" fill="#f87171">zero</text>` : `<text x="${X(v) + 7}" y="${y + bh / 2 + 4}" font-size="12.5" font-weight="700" fill="var(--strong)">${num(v)}</text>`}`;
  });
  return g + '</svg>';
}
function gInclinacao(e, c, transpor, log) {
  let xsN, linhas;
  if (transpor) { xsN = e.series.map(s => s.name); linhas = e.labels.map((l, i) => ({ name: l, values: e.series.map(s => s.values[i]) })); }
  else { xsN = e.labels; linhas = e.series.map(s => ({ name: s.name, values: s.values })); }
  const W = 560, H = 270, L = 150, R = 150, T = 30, B = 34, w = W - L - R, h = H - T - B;
  const s = escalaY(linhas.flatMap(q => q.values), log, 0);
  const X = i => L + w * (xsN.length === 1 ? .5 : i / (xsN.length - 1));
  const cores = linhas.map((q, k) => /controle/i.test(q.name) ? '#64748b' : [c, segundaCor(c), terceiraCor][k % 3]);
  let g = `<svg class="g" viewBox="0 0 ${W} ${H}">`;
  xsN.forEach((n, i) => g += `<line x1="${X(i)}" x2="${X(i)}" y1="${T - 8}" y2="${T + h}" stroke="var(--grid)" stroke-width="2"/><text x="${X(i)}" y="${H - 10}" text-anchor="middle" font-size="12.5" font-weight="700" fill="var(--muted)">${esc(n)}</text>`);
  const rotulos = [];
  linhas.forEach((q, k) => {
    const pts = q.values.map((v, i) => [X(i), yPos(v, s, T, h)]);
    g += `<path d="M${pts.map(p => p.join(',')).join(' L')}" fill="none" stroke="${cores[k]}" stroke-width="3.5" stroke-linecap="round"/>`;
    pts.forEach((p, i) => g += `<circle cx="${p[0]}" cy="${p[1]}" r="6" fill="${cores[k]}" stroke="var(--bg)" stroke-width="2"/>`);
    rotulos.push({ y: pts[0][1], x: pts[0][0] - 12, anc: 'end', txt: `${q.name}: ${log ? fmtGrande(q.values[0]) : num(q.values[0])}`, cor: cores[k] });
    const ult = pts.length - 1;
    rotulos.push({ y: pts[ult][1], x: pts[ult][0] + 12, anc: 'start', txt: `${log ? fmtGrande(q.values[ult]) : num(q.values[ult])}` + (q.values[0] > 0 && !log ? `  (${q.values[ult] >= q.values[0] ? '+' : '−'}${num(Math.abs(q.values[ult] / q.values[0] - 1) * 100, 0)}%)` : ''), cor: cores[k] });
  });
  ['end', 'start'].forEach(anc => { const rs = rotulos.filter(r => r.anc === anc).sort((a, b) => a.y - b.y); for (let i = 1; i < rs.length; i++) if (rs[i].y - rs[i - 1].y < 16) rs[i].y = rs[i - 1].y + 16; });
  rotulos.forEach(r => g += `<text x="${r.x}" y="${r.y + 4}" text-anchor="${r.anc}" font-size="12" font-weight="700" fill="${r.cor}">${esc(r.txt)}</text>`);
  return g + '</svg>';
}
const fmtGrande = v => v >= 1e6 ? num(v / 1e6, 1) + ' mi' : v >= 1e3 ? num(v / 1e3, 0) + ' mil' : num(v);
function gAntesDepois(e, c) {
  const v = e.series[0].values, l = e.labels, log = /log/i.test(e.unit || '');
  const W = 560, H = 250, base = 210, topo = 78, mx = Math.max(...v);
  const Y = x => base - (base - topo) * x / mx, bw = 120, xa = 120, xb = 330;
  const dif = log ? `${v[1] >= v[0] ? '+' : '−'}${num(Math.abs(v[1] - v[0]), 1)} log` : `${v[1] >= v[0] ? '+' : '−'}${num(Math.abs(v[1] / v[0] - 1) * 100, 0)}%`;
  const corB = v[1] < v[0] ? '#f87171' : '#4ade80';
  return `<svg class="g" viewBox="0 0 ${W} ${H}">
    <line x1="60" x2="${W - 30}" y1="${base}" y2="${base}" stroke="var(--grid)" stroke-width="2"/>
    <rect x="${xa}" y="${Y(v[0])}" width="${bw}" height="${base - Y(v[0])}" rx="10" fill="#64748b" opacity=".6"/>
    <rect x="${xb}" y="${Y(v[1])}" width="${bw}" height="${base - Y(v[1])}" rx="10" fill="${c}"/>
    <text x="${xa + bw / 2}" y="${Y(v[0]) - 10}" text-anchor="middle" font-size="20" font-weight="700" fill="var(--strong)" font-family="Space Grotesk, Inter">${num(v[0])}</text>
    <text x="${xb + bw / 2}" y="${Y(v[1]) - 10}" text-anchor="middle" font-size="20" font-weight="700" fill="var(--strong)" font-family="Space Grotesk, Inter">${num(v[1])}</text>
    <text x="${xa + bw / 2}" y="${base + 22}" text-anchor="middle" font-size="12.5" fill="var(--muted)">${esc(l[0])}</text>
    <text x="${xb + bw / 2}" y="${base + 22}" text-anchor="middle" font-size="12.5" fill="var(--muted)">${esc(l[1])}</text>
    <path d="M${xa + bw + 12},${Y(v[0]) + 14} C${xa + bw + 60},${Y(v[0]) + 4} ${xb - 60},${Y(v[1]) - 4} ${xb - 12},${Y(v[1]) + 6}" fill="none" stroke="${corB}" stroke-width="2.5" marker-end="url(#seta${e.id})"/>
    <defs><marker id="seta${e.id}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="${corB}"/></marker></defs>
    <rect x="${(xa + bw + xb) / 2 - 48}" y="8" width="96" height="32" rx="16" fill="${hexA(corB, .15)}" stroke="${corB}"/>
    <text x="${(xa + bw + xb) / 2}" y="29" text-anchor="middle" font-size="15" font-weight="800" fill="${corB}">${dif}</text>
  </svg>`;
}
function gDuracao(e, c) {
  const v = e.series[0].values, l = e.labels, W = 560, L = 90, R = 80, mx = Math.max(...v), X = d => L + (W - L - R) * d / mx, H = 210;
  let g = `<svg class="g" viewBox="0 0 ${W} ${H}">`;
  const passo = mx > 30 ? 10 : 5;
  for (let d = 0; d <= mx; d += passo) g += `<line x1="${X(d)}" x2="${X(d)}" y1="18" y2="150" stroke="var(--grid)"/><text x="${X(d)}" y="168" text-anchor="middle" font-size="11" fill="var(--muted)">${d}</text>`;
  g += `<text x="${(L + W - R) / 2}" y="190" text-anchor="middle" font-size="11.5" fill="var(--muted)">dias até a bactéria não ser mais recuperada do solo</text>`;
  v.forEach((d, i) => {
    const y = 34 + i * 62, cor = i === 0 ? c : '#f87171';
    g += `<text x="${L - 12}" y="${y + 20}" text-anchor="end" font-size="16" font-weight="700" fill="var(--strong)">${esc(l[i])}</text>
      <rect x="${L}" y="${y}" width="${Math.max(X(d) - L, 10)}" height="30" rx="15" fill="${cor}" opacity=".9"/>
      <text x="${Math.max(X(d), L + 10) + 10}" y="${y + 21}" font-size="15" font-weight="800" fill="${cor}">${num(d)} ${d === 1 ? 'dia' : 'dias'}</text>`;
  });
  if (v[0] && v[1]) g += `<text x="${W - R}" y="14" text-anchor="end" font-size="12.5" font-weight="700" fill="#f87171">${num(v[0] / v[1], 0)} vezes mais rápido no calor</text>`;
  return g + '</svg>';
}
function gWaffle(e, c) {
  const v = e.series[0].values, l = e.labels, resto = Math.round(v[1] / (v[0] || 100) * 100);
  const W = 560, H = 236, tam = 17, gap = 4, x0 = 28, y0 = 18;
  let g = `<svg class="g" viewBox="0 0 ${W} ${H}">`;
  for (let i = 0; i < 100; i++) {
    const col = i % 10, lin = Math.floor(i / 10), viva = i < resto;
    g += `<circle cx="${x0 + col * (tam + gap) + tam / 2}" cy="${y0 + lin * (tam + gap) + tam / 2}" r="${tam / 2}" fill="${viva ? c : 'none'}" stroke="${viva ? c : 'var(--faint)'}" stroke-width="1.5"/>`;
  }
  g += `<text x="270" y="74" font-size="54" font-weight="700" fill="${c}" font-family="Space Grotesk, Inter">${resto}</text>
    <text x="270" y="102" font-size="15" fill="var(--strong)" font-weight="700">de cada 100</text>
    <text x="270" y="124" font-size="13" fill="var(--muted)">${esc(l[1])}</text>
    <text x="270" y="160" font-size="12" fill="var(--muted)">Cada bolinha = 1% de ${esc(l[0].toLowerCase())}.</text>`;
  return g + '</svg>';
}
function gQual(e, c) {
  return `<div style="margin:8px 0">${(e.qualRows || []).map(([a, b]) => `<div style="display:flex;justify-content:space-between;gap:14px;padding:11px 12px;border-radius:12px;background:var(--chip);margin:6px 0;border:1px solid var(--chip-b)">
    <span style="font-size:13.5px">${esc(a)}</span><b style="font-size:13px;color:${/sem halo|não houve/i.test(b) ? '#4ade80' : 'var(--muted)'}"><i class="fas ${/sem halo|não houve/i.test(b) ? 'fa-circle-check' : 'fa-circle-dot'}"></i> ${esc(b)}</b></div>`).join('')}</div>`;
}

// ---------- tema (mesma conversa do analytics.html com o index) ----------
addEventListener('message', ev => {
  const h = document.documentElement;
  if (ev.data === 'toggle-theme') h.classList.toggle('light-mode');
  if (ev.data === 'force-light') h.classList.add('light-mode');
});
try { if (parent !== window && parent.document.documentElement.classList.contains('light-mode')) document.documentElement.classList.add('light-mode'); } catch (_) {}

visaoGeral();


// ---------- SANKEY: problema → biológico → mecanismo ----------
const SK = {
  nos: [
    { id: 's1', nome: 'Solo compactado', col: 0, cor: '#ef4444' }, { id: 's2', nome: 'Pouco fósforo', col: 0, cor: '#f97316' },
    { id: 's3', nome: 'Doenças (patógenos)', col: 0, cor: '#d946ef' }, { id: 's4', nome: 'Falta de nitrogênio', col: 0, cor: '#eab308' },
    { id: 's5', nome: 'Seca e sal', col: 0, cor: '#fb923c' }, { id: 's6', nome: 'Insetos-praga', col: 0, cor: '#a3a3a3' },
    ...F.grupos.map(g => ({ id: 'g:' + g.nome, nome: g.nome, col: 1, cor: g.cor })),
    { id: 'o1', nome: 'Agregação do solo', col: 2, cor: '#64748b' }, { id: 'o2', nome: 'Solubilização de P', col: 2, cor: '#f97316' },
    { id: 'o3', nome: 'Controle de doenças', col: 2, cor: '#d946ef' }, { id: 'o6', nome: 'Defesa da planta (ISR)', col: 2, cor: '#8b5cf6' },
    { id: 'o4', nome: 'Fixação de N', col: 2, cor: '#22c55e' }, { id: 'o7', nome: 'Hifas: água e P', col: 2, cor: '#fbbf24' },
    { id: 'o5', nome: 'ACC desaminase', col: 2, cor: '#ef4444' }, { id: 'o8', nome: 'Hormônios (AIA, ALA)', col: 2, cor: '#fb7185' },
    { id: 'o9', nome: 'Controle de insetos', col: 2, cor: '#818cf8' }
  ],
  fluxos: [
    ['s1', 'Bacillus', 'o1', 'Bacillus produz biofilme (EPS), que ajuda a agregar o solo.'],
    ['s1', 'Azospirillum', 'o1', 'Azospirillum produz EPS nas raízes e cria microambientes.'],
    ['s1', 'Micorrizas', 'o1', 'As hifas e a glomalina das micorrizas ajudam a agregar o solo.'],
    ['s2', 'Pseudomonas', 'o2', 'Pseudomonas solta fosfato com ácidos orgânicos (como o glucônico).'],
    ['s2', 'Bacillus', 'o2', 'Bacillus solubiliza fosfato pela via PQQ-GDH.'],
    ['s2', 'Micorrizas', 'o7', 'As hifas exploram o solo além das raízes e levam fósforo à planta.'],
    ['s3', 'Trichoderma', 'o3', 'Trichoderma parasita e degrada outros fungos.'],
    ['s3', 'Bacillus', 'o3', 'Bacillus secreta lipopeptídeos antifúngicos (iturinas).'],
    ['s3', 'Pseudomonas', 'o3', 'Pseudomonas tira o ferro dos patógenos com sideróforos.'],
    ['s3', 'Pseudomonas', 'o6', 'Pseudomonas ativa a resistência sistêmica induzida (ISR).'],
    ['s4', 'Rizóbios', 'o4', 'Rizóbios fixam N dentro dos nódulos.'],
    ['s4', 'Azospirillum', 'o4', 'Azospirillum fixa N associado às raízes, em taxa menor.'],
    ['s4', 'Methylobacterium', 'o4', 'Methylobacterium symbioticum fixa N na superfície das folhas.'],
    ['s4', 'PNSB', 'o4', 'Bactérias púrpuras fixam N e liberam amônio.'],
    ['s5', 'Azospirillum', 'o5', 'Azospirillum quebra o etileno de estresse (ACC desaminase).'],
    ['s5', 'Bacillus', 'o1', 'Bacillus forma biofilme que retém umidade.'],
    ['s5', 'Micorrizas', 'o7', 'As hifas ajudam a planta a captar água em solo seco.'],
    ['s5', 'PNSB', 'o8', 'Bactérias púrpuras produzem ALA e AIA, ligados à tolerância da planta ao estresse.'],
    ['s6', 'Bioinseticidas', 'o9', 'Bt, Beauveria e Metarhizium intoxicam ou infectam insetos-praga.']
  ]
};
function desenharSankey() {
  const box = document.getElementById('sankey'); if (!box || !window.d3) return;
  box.innerHTML = '';
  const vertical = box.clientWidth < 760;
  const W = box.clientWidth || 900, H = vertical ? 880 : 640;
  const nos = SK.nos.map(n => ({ ...n })), porId = Object.fromEntries(nos.map(n => [n.id, n]));
  const cols = [[], [], []]; nos.forEach(n => cols[n.col].push(n));
  const margem = vertical ? 70 : 170, faixa = vertical ? H : W, pos = [margem, faixa / 2, faixa - margem];
  cols.forEach((g, ci) => { const cruz = vertical ? W : H, passo = cruz / (g.length + 1);
    g.forEach((n, i) => { if (vertical) { n.x = passo * (i + 1); n.y = pos[ci]; } else { n.x = pos[ci]; n.y = passo * (i + 1); } }); });
  const links = [];
  SK.fluxos.forEach(([a, b, c, d], k) => { const A = porId[a], B = porId['g:' + b], C = porId[c];
    links.push({ s: A, t: B, k, d, cor: B.cor }, { s: B, t: C, k, d, cor: B.cor }); });
  const svg = d3.select(box).append('svg').attr('viewBox', `0 0 ${W} ${H}`).attr('width', '100%');
  const gen = vertical ? d3.linkVertical().source(l => [l.s.x, l.s.y + 10]).target(l => [l.t.x, l.t.y - 10])
                       : d3.linkHorizontal().source(l => [l.s.x + 12, l.s.y]).target(l => [l.t.x - 12, l.t.y]);
  const L = svg.append('g').selectAll('path').data(links).enter().append('path').attr('d', gen).attr('fill', 'none')
    .attr('stroke', l => l.cor).attr('stroke-width', 5).attr('stroke-opacity', .22).style('cursor', 'pointer');
  const N = svg.append('g').selectAll('g').data(nos).enter().append('g').attr('transform', n => `translate(${n.x},${n.y})`).style('cursor', 'pointer');
  N.append('circle').attr('r', n => n.col === 1 ? 11 : 8).attr('fill', n => hexA(n.cor, .3)).attr('stroke', n => n.cor).attr('stroke-width', 2.2);
  const T = N.append('text').text(n => n.nome).attr('fill', 'var(--strong)').style('font-size', vertical ? '11px' : '13px').style('font-weight', 700)
    .style('font-family', 'Inter, sans-serif').style('pointer-events', 'none').attr('paint-order', 'stroke').attr('stroke', 'var(--bg)').attr('stroke-width', 3);
  if (vertical) T.attr('text-anchor', 'start').attr('transform', n => n.col === 2 ? 'rotate(50) translate(14,4)' : 'rotate(-50) translate(14,4)');
  else T.attr('dy', '.35em').attr('x', n => n.col === 2 ? 16 : n.col === 0 ? -16 : 0).attr('y', n => n.col === 1 ? -20 : 0)
        .attr('text-anchor', n => n.col === 2 ? 'start' : n.col === 0 ? 'end' : 'middle');
  const info = document.getElementById('sk-info');
  const mostrar = (titulo, texto, cor, ativos) => {
    L.attr('stroke-opacity', l => ativos.has(l.k) ? .9 : .06).attr('stroke-width', l => ativos.has(l.k) ? 8 : 5);
    info.style.setProperty('--c', cor);
    info.innerHTML = `<i class="fas fa-diagram-project"></i><div><b>${esc(titulo)}</b><span>${texto}</span></div>`;
  };
  const tocarLink = l => mostrar('Caminho', esc(l.d), l.cor, new Set([l.k]));
  const tocarNo = n => {
    const ks = new Set(SK.fluxos.map((f, k) => [f, k]).filter(([f]) => f[0] === n.id || 'g:' + f[1] === n.id || f[2] === n.id).map(([, k]) => k));
    const lista = [...ks].map(k => '• ' + esc(SK.fluxos[k][3])).join('<br>');
    mostrar(n.nome, lista || 'Sem caminho desenhado.', n.cor, ks);
  };
  L.on('click', (ev, l) => { ev.stopPropagation(); tocarLink(l); }).on('pointerenter', (ev, l) => ev.pointerType === 'mouse' && tocarLink(l));
  N.on('click', (ev, n) => { ev.stopPropagation(); tocarNo(n); }).on('pointerenter', (ev, n) => ev.pointerType === 'mouse' && tocarNo(n));
}
let skTimer; addEventListener('resize', () => { clearTimeout(skTimer); skTimer = setTimeout(() => { if (!fatorAtual) desenharSankey(); }, 200); });

// ---------- altura automática dentro do index (iframe) ----------
if (parent !== window) {
  document.documentElement.classList.add('embutido');
  const enviar = () => { try { parent.postMessage({ rizoAltura: Math.ceil(document.documentElement.scrollHeight) }, '*'); } catch (_) {} };
  new ResizeObserver(enviar).observe(document.body); addEventListener('load', enviar);
}
