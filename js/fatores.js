'use strict';
// RizoWiki · Fatores — atlas de evidências (matriz + pop-up com anel), páginas por fator e fichas de estudo (base: módulo GPT/Gemini; visual e gráficos refeitos)
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

// ---------- evidência de cada célula ----------
const FAT_COR = { temperatura: '#fb923c', radiacao: '#facc15', agua: '#38bdf8', compatibilidade: '#a78bfa', tempo: '#2dd4bf',
  nutricao: '#4ade80', formulacao: '#f472b6', salinidade: '#94a3b8', ph: '#f87171' };
const FAT_CURTO = { agua: 'Água', formulacao: 'Formulação', radiacao: 'Radiação solar' };
const MED_COR = { sobrevivencia: '#f472b6', germinacao: '#4ade80', crescimento: '#38bdf8', colonizacao: '#fb923c',
  metabolica: '#22d3ee', biocontrole: '#a78bfa', beneficio: '#eab308' };
const orbe = (cor, icone, rotulo, extra, titulo, curta) => `<button class="orbe" style="--o:${cor}" ${extra} title="${esc(titulo || rotulo)}" aria-label="${esc(titulo || rotulo)}"><span class="orbe-c"><i class="fas ${icone}"></i></span><b class="r-cheio">${esc(rotulo)}</b>${curta ? `<b class="r-curto">${esc(curta)}</b>` : ''}</button>`;
const FAT_MINI = { temperatura: 'Temp.', radiacao: 'Radiação', agua: 'Água', compatibilidade: 'Compat.', tempo: 'Espera', nutricao: 'Nutrição', formulacao: 'Formul.', salinidade: 'Sal', ph: 'pH' };
const curtoF = f => FAT_CURTO[f.id] || f.nome;
const MEDIDAS = { sobrevivencia: 'Sobrevivência e cultivabilidade', germinacao: 'Germinação', crescimento: 'Crescimento e esporulação',
  colonizacao: 'Colonização e nodulação', metabolica: 'Atividade metabólica', biocontrole: 'Atividade de biocontrole', beneficio: 'Benefício agronômico' };
const CAT = {
  reducao: { nome: 'Redução observada', cor: '#f87171' },
  nula: { nome: 'Sem diferença detectada', cor: '#94a3b8' },
  aumento: { nome: 'Aumento observado', cor: '#4ade80' },
  semquant: { nome: 'Sem quantificação', cor: '#c4b5fd' }
};
// Uma resposta = um estudo (contraste principal) da célula. Não há limite universal para "acentuada" x "moderada": usa-se "Redução observada".
function categoria(e, fid) {
  if (e.resp) return e.resp;
  if (fid === 'formulacao' && e.prot) return e.prot.sem === undefined ? 'semquant' : e.prot.com > e.prot.sem ? 'aumento' : e.prot.com < e.prot.sem ? 'reducao' : 'nula';
  if (e.sobra !== undefined) return e.sobra < 100 ? 'reducao' : e.sobra > 100 ? 'aumento' : 'nula';
  return 'semquant';
}
function resumoCelula(g, fid) {
  const a = expsDaCelula(g, fid);
  const ver = new Set(a.filter(e => !e.pendente).map(e => e.pub));
  const pen = new Set(a.filter(e => e.pendente && !ver.has(e.pub)).map(e => e.pub));
  return { a, nVer: ver.size, nPen: pen.size };
}
// esfera de vidro fosco: tamanho = publicações verificadas (1 · 2–3 · 4+); fantasma = só estudos ainda não validados
function esfera(c, n, fantasma) {
  if (fantasma) return `<svg viewBox="-32 -32 64 64" class="esf"><circle r="15" fill="${hexA(c, .08)}" stroke="${hexA(c, .8)}" stroke-width="2" stroke-dasharray="3.5 3.5"/></svg>`;
  const r = n >= 4 ? 25 : n >= 2 ? 18 : 11.5;
  return `<svg viewBox="-32 -32 64 64" class="esf"><circle r="${r + 4}" fill="${c}" opacity=".13"/><circle r="${r}" fill="${hexA(c, .3)}" stroke="${c}" stroke-width="2.2"/>
    <circle r="${Math.max(r - 4, 2)}" fill="none" stroke="#fff" stroke-opacity=".14" stroke-width="1"/></svg>`;
}
const corta = (t, n) => (t = String(t || '')).length > n ? t.slice(0, n - 1) + '…' : t;
function refCurta(e) {
  const s = String(e.source || ''), m = s.match(/^\s*([A-ZÀ-Ý][\wÀ-ÿ'\-]+)(.{0,60}?)((?:19|20)\d\d)/);
  return m ? `${m[1]}${/et al|,|&/.test(m[2]) ? ' et al.' : ''} ${m[3]}` : corta(s, 46);
}

// ---------- VISÃO GERAL: matriz ----------
function visaoGeral() {
  fatorAtual = null; fecharPop();
  const nVer = new Set(F.exps.filter(e => !e.pendente).map(e => e.pub)).size;
  const verG = new Set(F.exps.filter(e => !e.pendente).map(e => e.pub)), nPen = new Set(F.exps.filter(e => e.pendente && !verG.has(e.pub)).map(e => e.pub)).size;
  const linhas = F.grupos.map(g => {
    const tiles = F.fatores.map(f => {
      const r = resumoCelula(g.nome, f.id);
      if (!r.a.length) return `<div class="vazio" aria-hidden="true"></div>`;
      const fant = !r.nVer;
      return `<button class="tile ${fant ? 'fantasma' : ''}" data-g="${esc(g.nome)}" data-f="${f.id}" style="--c:${g.cor}"
        aria-label="${esc(g.nome)} e ${esc(f.nome)}">${esfera(g.cor, r.nVer, fant)}</button>`;
    }).join('');
    return `<div class="m-org" style="--c:${g.cor}"><i></i><span>${esc(g.nome).replace('Methylobacterium', 'Methylo&shy;bacterium').replace('Azospirillum', 'Azospi&shy;rillum').replace('Bioinseticidas', 'Bioinseti&shy;cidas').replace('Pseudomonas', 'Pseudo&shy;monas').replace('Trichoderma', 'Tricho&shy;derma')}${g.nome === 'Bioinseticidas' ? '<small>Beauveria, Metarhizium, Bt, Chromobacterium</small>' : g.nome === 'PNSB' ? '<small>bactérias púrpuras</small>' : ''}</span></div>${tiles}`;
  }).join('');
  app.innerHTML = `
  <div class="panel">
    <div style="display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;align-items:start">
      <div><p class="eyebrow">Atlas de evidências</p><h1>O que já se estudou sobre cada biológico</h1>
        <p class="lead">Cada esfera reúne os estudos de um biológico diante de um fator. Toque numa esfera para ver o que eles encontraram; toque no nome do fator para ver todos os gráficos.</p></div>
      <span class="selo"><i class="fas fa-book-open"></i> ${nVer} publicações verificadas · ${nPen} a validar</span>
    </div>
    <div class="matriz-rolagem"><div class="matriz">
      <div></div>${F.fatores.map(f => `<div class="m-cab">${orbe(FAT_COR[f.id], f.icone, curtoF(f), `data-fator="${f.id}"`, f.nome, FAT_MINI[f.id])}</div>`).join('')}
      ${linhas}
    </div></div>
    <div class="leg-fatores">${F.fatores.map(f => `<button data-fator="${f.id}" style="--o:${FAT_COR[f.id]}"><i class="fas ${f.icone}"></i>${esc(curtoF(f))}</button>`).join('')}</div>
    <div class="legenda">
      <span class="leg-tam">${esfera('#94a3b8', 1)}${esfera('#94a3b8', 2)}${esfera('#94a3b8', 4)} 1 · 2 a 3 · 4 ou mais publicações verificadas</span>
      <span>${esfera('#94a3b8', 0, true)} estudos localizados, ainda não validados</span>
      <span><i class="leg-vazio"></i> nenhum estudo localizado</span>
    </div>
    <p class="nota-leg"><i class="fas fa-circle-info"></i> O tamanho mostra quanta literatura verificada o RizoWiki reúne sobre a combinação. Não mostra resistência, eficiência nem qualidade do organismo.</p>
  </div>`;
  app.querySelectorAll('.m-cab [data-fator], .leg-fatores [data-fator]').forEach(b => b.addEventListener('click', () => abrirFator(b.dataset.fator)));
  app.querySelectorAll('.tile').forEach(t => {
    t.addEventListener('click', ev => { ev.stopPropagation(); mostrarPop(t); });
    t.addEventListener('pointerenter', ev => { if (ev.pointerType === 'mouse') mostrarPop(t); });
  });
}
function navFatores() {
  return `<nav class="nav orbes ${fatorAtual ? 'tem-on' : ''}">${orbe('#0ea5e9', 'fa-table-cells', 'Visão geral', 'data-nav=""')}<span class="nav-sep"></span>${F.fatores.map(f =>
    orbe(FAT_COR[f.id], f.icone, curtoF(f), `data-nav="${f.id}"`, f.nome).replace('class="orbe"', `class="orbe ${fatorAtual === f.id ? 'on' : ''}"`)).join('')}</nav>`;
}
function ligarNav() { app.querySelectorAll('[data-nav]').forEach(b => b.addEventListener('click', () => b.dataset.nav ? abrirFator(b.dataset.nav) : visaoGeral())); }

// ---------- POP-UP da esfera: anel com a composição dos resultados ----------
function fecharPop() { popRaiz.innerHTML = ''; app.querySelectorAll('.tile.sel').forEach(t => t.classList.remove('sel')); }
function anel(cont, total) {
  const R = 64, r = 43, cx = 80, cy = 80; let ang = -Math.PI / 2, s = '';
  const pt = (rr, a) => [cx + rr * Math.cos(a), cy + rr * Math.sin(a)];
  Object.keys(CAT).forEach(k => {
    const n = cont[k] || 0; if (!n) return;
    if (n === total) { s += `<circle class="fatia" data-cat="${k}" cx="${cx}" cy="${cy}" r="${(R + r) / 2}" fill="none" stroke="${CAT[k].cor}" stroke-width="${R - r}"/>`; return; }
    const a1 = ang + 2 * Math.PI * n / total, big = a1 - ang > Math.PI ? 1 : 0;
    const [x0, y0] = pt(R, ang), [x1, y1] = pt(R, a1), [x2, y2] = pt(r, a1), [x3, y3] = pt(r, ang);
    s += `<path class="fatia" data-cat="${k}" d="M${x0},${y0} A${R},${R} 0 ${big} 1 ${x1},${y1} L${x2},${y2} A${r},${r} 0 ${big} 0 ${x3},${y3} Z" fill="${CAT[k].cor}" stroke="var(--pop)" stroke-width="2.5"/>`;
    ang = a1;
  });
  return `<svg viewBox="0 0 160 160" class="anel">${s}<text x="80" y="84" text-anchor="middle" font-size="36" font-weight="700" fill="var(--strong)" font-family="Space Grotesk, Inter">${total}</text>
    <text x="80" y="104" text-anchor="middle" font-size="11" fill="var(--muted)">${total > 1 ? 'respostas' : 'resposta'}</text></svg>`;
}
function especies(a) {
  const n = [...new Set(a.map(e => (e.organism || '').replace(/\s*\(.*$/, '').trim()).filter(Boolean))];
  return n.slice(0, 3).join(' · ') + (n.length > 3 ? ` · +${n.length - 3}` : '');
}
function sintese(a, cont) {
  const partes = Object.keys(CAT).filter(k => cont[k]).map(k => `${CAT[k].nome.toLowerCase()} em ${cont[k]}`);
  const ex = a.find(e => !e.pendente) || a[0];
  return `${a.length > 1 ? 'Das ' + a.length + ' respostas: ' + partes.join('; ') + '. ' : ''}${ex.pendente ? '' : a.length > 1 ? 'No estudo verificado: ' : ''}${ex.headline}`;
}
function mostrarPop(t, modo) {
  const g = t.dataset.g, f = fatorPorId(t.dataset.f), c = corGrupo[g];
  if (t.classList.contains('sel') && !modo) return;
  fecharPop(); t.classList.add('sel');
  const r = resumoCelula(g, f.id), a = [...r.a].sort((x, y) => (x.pendente ? 1 : 0) - (y.pendente ? 1 : 0));
  const cont = {}; a.forEach(e => { const k = categoria(e, f.id); cont[k] = (cont[k] || 0) + 1; });
  const cab = `<div class="pop-cab"><span class="pop-ic"><i class="fas fa-bacterium"></i></span><div><h3>${esc(g)} <span>×</span> ${esc(f.nome)}</h3><p class="sub">${esc(especies(a))}</p></div></div>
    <div class="pop-cont"><span><b>${r.nVer}</b> ${r.nVer === 1 ? 'publicação verificada' : 'publicações verificadas'}</span><span><b>${a.length}</b> ${a.length === 1 ? 'resposta' : 'respostas'}</span>${r.nPen ? `<span class="pend"><b>${r.nPen}</b> a validar</span>` : ''}</div>`;
  let corpo;
  if (modo === 'estudos') {
    const porPub = {}; a.forEach(e => (porPub[e.pub] = porPub[e.pub] || []).push(e));
    corpo = `<div class="pop-lista">${Object.values(porPub).map(es => { const e = es[0]; return `<div class="ref"><p>${esc(e.source)}</p>
      <small>${esc(e.kind)} · ${esc(e.location)} · ${e.pendente ? '<span class="pend">a validar</span>' : e.conferido ? '<span class="ok">conferido na fonte</span>' : 'aprovado no levantamento'}</small>
      ${es.map(x => `<button class="ref-ex" data-estudo="${x.id}"><span>${esc(x.title)}</span><i class="fas fa-chevron-right"></i></button>`).join('')}
      ${e.doi ? `<a href="${esc(e.doi)}" target="_blank" rel="noopener">${esc(e.doi.replace(/^https?:\/\//, ''))}</a>` : ''}</div>`; }).join('')}</div>
      <div class="pop-bts"><button class="pop-volta"><i class="fas fa-chart-pie"></i> Voltar ao resumo</button></div>`;
  } else {
    corpo = `<div class="pop-meio">${anel(cont, a.length)}<div class="pop-leg">${Object.keys(CAT).filter(k => cont[k]).map(k =>
      `<button class="leg-cat" data-cat="${k}"><i style="background:${CAT[k].cor}"></i><span>${CAT[k].nome}</span><b>${cont[k]}</b></button>`).join('')}</div></div>
      <div class="pop-cat" hidden></div>
      <p class="pop-sint">${esc(sintese(a, cont))}</p>
      <p class="pop-obs">O anel mostra como se distribuem os resultados reunidos, não a chance de o produto funcionar. Sem estatística informada, o resultado é descritivo.</p>
      <div class="pop-bts"><button class="pop-ir" data-ir="${f.id}" data-jump="${a[0].id}"><i class="fas fa-chart-line"></i> Ver gráficos</button><button class="pop-est"><i class="fas fa-book"></i> Ver estudos</button></div>`;
  }
  popRaiz.innerHTML = `<div class="pop" style="--c:${c}" role="dialog"><button class="fechar" aria-label="Fechar"><i class="fas fa-xmark"></i></button>${cab}${corpo}</div>`;
  const p = popRaiz.firstElementChild; posicionar(p, t.getBoundingClientRect());
  p.querySelector('.fechar').onclick = fecharPop;
  p.addEventListener('click', ev => ev.stopPropagation());
  const ir = p.querySelector('.pop-ir'); if (ir) ir.onclick = () => abrirFator(ir.dataset.ir, ir.dataset.jump);
  const est = p.querySelector('.pop-est'); if (est) est.onclick = () => mostrarPop(t, 'estudos');
  const volta = p.querySelector('.pop-volta'); if (volta) volta.onclick = () => mostrarPop(t, 'resumo');
  p.querySelectorAll('.pop-lista [data-estudo]').forEach(b => b.onclick = () => abrirEstudo(b.dataset.estudo, t));
  const caixa = p.querySelector('.pop-cat');
  const verCat = k => {
    p.querySelectorAll('.fatia').forEach(s => s.style.opacity = s.dataset.cat === k ? 1 : .22);
    p.querySelectorAll('.leg-cat').forEach(b => b.classList.toggle('on', b.dataset.cat === k));
    caixa.hidden = false;
    caixa.innerHTML = `<b style="color:${CAT[k].cor}">${CAT[k].nome}</b>` + a.filter(e => categoria(e, f.id) === k).map(e =>
      `<button class="ref-ex" data-estudo="${e.id}"><span>${esc(e.headline)}<small>${esc(e.curto)} · ${esc(e.kind)}${e.pendente ? ' · a validar' : ''} · ${esc(e.sig)}</small></span><i class="fas fa-chevron-right"></i></button>`).join('');
    caixa.querySelectorAll('[data-estudo]').forEach(b => b.onclick = () => abrirEstudo(b.dataset.estudo, t));
    posicionar(p, t.getBoundingClientRect());
  };
  p.querySelectorAll('.fatia, .leg-cat').forEach(el => {
    el.addEventListener('click', ev => { ev.stopPropagation(); verCat(el.dataset.cat); });
    el.addEventListener('pointerenter', ev => { if (ev.pointerType === 'mouse') verCat(el.dataset.cat); });
  });
}
function posicionar(p, r) {
  const W = innerWidth, H = innerHeight, pw = p.offsetWidth, ph = p.offsetHeight;
  let x = r.right + 10, y = r.top;
  if (x + pw > W - 8) x = r.left - pw - 10;
  if (x < 8) { x = Math.max(8, Math.min(W - pw - 8, r.left + r.width / 2 - pw / 2)); y = r.bottom + 8; if (y + ph > H - 8) y = r.top - ph - 8; }
  y = Math.max(8, Math.min(y, H - ph - 8));
  p.style.left = x + 'px'; p.style.top = y + 'px';
}
document.addEventListener('click', () => { fecharPop(); fecharDica(); });
addEventListener('scroll', () => { if (popRaiz.innerHTML) fecharPop(); }, { passive: true });

// ---------- NÍVEL 3: ficha completa do estudo ----------
function abrirEstudo(id, ancora) {
  const e = F.exps.find(x => x.id === id); if (!e) return;
  fecharPop(); fecharDica();
  const c = corGrupo[e.grupoM], linha = (r, v) => v ? `<div class="fx-l"><b>${r}</b><span>${v}</span></div>` : '';
  const ov = document.createElement('div'); ov.className = 'ficha-fundo';
  ov.style.height = document.documentElement.scrollHeight + 'px';
  ov.innerHTML = `<div class="ficha" style="--c:${c}" role="dialog" aria-label="Ficha do estudo"><button class="fechar" aria-label="Fechar"><i class="fas fa-xmark"></i></button>
    <p class="eyebrow" style="color:${c}">${esc(e.grupoM)} · ${esc(MEDIDAS[e.medida] || '')}</p><h3>${esc(e.title)}</h3><p class="org">${esc(e.organism)}</p>
    <p class="resultado">${esc(e.headline)}</p>${e.meaning && e.meaning.trim() !== (e.headline || '').trim() ? `<p class="sentido">${esc(e.meaning)}</p>` : ''}
    ${linha('Referência', esc(e.source))}${linha('DOI / link', e.doi ? `<a href="${esc(e.doi)}" target="_blank" rel="noopener">${esc(e.doi)}</a>` : '')}
    ${linha('Tabela ou figura', esc(e.locator))}${linha('Ensaio', esc(e.kind))}${linha('País e local', esc(e.location))}
    ${linha('Condições', esc(e.condition))}${linha('Comparação', esc(e.baseline))}${linha('Repetições', esc(e.rep))}${linha('Estatística', esc(e.sig))}
    ${linha('Conta do "quanto sobra"', esc(fatorAtual === 'formulacao' && e.prot ? e.prot.ref : e.sobraRef))}
    ${linha('Limites', esc(e.note))}${linha('Afiliações e vínculos', esc(e.affiliation))}
    ${linha('Validação', `<span class="${e.pendente ? 'pend' : e.conferido ? 'ok' : ''}">${e.pendente ? 'Do acervo, ainda a validar. ' : e.conferido ? '' : 'Aprovado no levantamento. '}${esc(e.verification)}</span>`)}
  </div>`;
  document.body.appendChild(ov);
  const ficha = ov.firstElementChild, rr = (ancora && ancora.getBoundingClientRect) ? ancora.getBoundingClientRect() : { top: 40 };
  ficha.style.top = Math.max(12, Math.min(rr.top + scrollY - 60, document.documentElement.scrollHeight - ficha.offsetHeight - 12)) + 'px';
  const fechar = () => ov.remove();
  ov.addEventListener('click', ev => { ev.stopPropagation(); if (ev.target === ov) fechar(); });
  ficha.querySelector('.fechar').onclick = fechar;
}

// ---------- VISÃO DO FATOR ----------
const MED_IC = { sobrevivencia: 'fa-heart-pulse', germinacao: 'fa-seedling', crescimento: 'fa-arrow-trend-up', colonizacao: 'fa-circle-nodes',
  metabolica: 'fa-bolt', biocontrole: 'fa-shield-virus', beneficio: 'fa-wheat-awn' };
let ctxFator = null;
function abrirFator(id, salto) {
  fecharPop(); fecharDica(); fatorAtual = id;
  const f = fatorPorId(id), v = F.views[id] || {}, a = expsDoFator(id);
  const meds = Object.keys(MEDIDAS).filter(m => a.some(e => e.medida === m));
  const nVer = new Set(a.filter(e => !e.pendente).map(e => e.pub)).size, nPen = new Set(a.filter(e => e.pendente && !a.some(x => !x.pendente && x.pub === e.pub)).map(e => e.pub)).size;
  const ini = salto && (a.find(e => e.id === salto) || {}).medida;
  ctxFator = { id, a, meds };
  app.innerHTML = `
  <div class="panel">
    <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap">
      <button class="voltar" data-nav=""><i class="fas fa-arrow-left"></i> Visão geral</button><span class="selo"><i class="fas fa-book-open"></i> ${nVer} publicações verificadas${nPen ? ' · ' + nPen + ' a validar' : ''}</span></div>
    ${navFatores()}
    <div class="hero">
      <div><span class="orbe-c hero-orbe" style="--o:${FAT_COR[id]}"><i class="fas ${f.icone}"></i></span><p class="eyebrow" style="color:${FAT_COR[id]}">${esc(f.nome)}</p><h1>${esc(v.title || f.nome)}</h1><p class="lead">${esc(v.lead || '')}</p></div>
      <div class="manejo"><b>No manejo</b>${esc(v.practice || '')}</div>
    </div>
    <div class="integrado">
      ${id === 'formulacao' ? `<div class="cab"><div><p class="eyebrow">Mesmo teste, com e sem proteção</p><h2>Quanto a proteção segura de cada biológico</h2>
        <p>Barra clara: sem proteção. Barra cheia: com a formulação, no mesmo teste. Toque numa barra para ver o valor.</p></div></div>${graficoProtecao(a)}` : ''}
      <div class="cab"><div><p class="eyebrow">O que foi medido</p><h2>${id === 'formulacao' ? 'Os estudos, por tipo de medida' : 'Quanto sobra de cada biológico com ' + esc(artigo(id))}</h2>
        <p>Escolha o que foi medido. Cada medida é uma pergunta diferente: compare os biológicos dentro dela, não entre medidas.</p></div></div>
      <div class="abas-med orbes tem-on" role="tablist">${meds.map(m => orbe(MED_COR[m], MED_IC[m], MEDIDAS[m], `data-med="${m}" role="tab"`)).join('')}</div>
      <div id="med-painel"></div>
    </div>
  </div>
  <div id="med-cards"></div>`;
  ligarNav();
  app.querySelectorAll('.abas-med [data-med]').forEach(b => b.addEventListener('click', () => mostrarMedida(b.dataset.med)));
  app.querySelectorAll('.linha-int').forEach(l => ligarLinha(l));
  mostrarMedida(meds.includes(ini) ? ini : meds[0]);
  app.scrollIntoView({ block: 'start' });
  if (salto) setTimeout(() => saltar(salto), 60);
}
function ligarLinha(l) { l.addEventListener('click', ev => { if (ev.target.closest('[data-tip]')) return; saltar(l.dataset.id); }); }
function mostrarMedida(m) {
  if (!ctxFator) return;
  const { id, a } = ctxFator, ordem = F.grupos.map(g => g.nome);
  const lista = a.filter(e => e.medida === m).sort((x, y) => ordem.indexOf(x.grupoM) - ordem.indexOf(y.grupoM));
  fecharDica(); ctxFator.med = m;
  app.querySelectorAll('.abas-med [data-med]').forEach(b => { const on = b.dataset.med === m; b.classList.toggle('on', on); b.setAttribute('aria-selected', on); });
  const painel = document.getElementById('med-painel');
  painel.innerHTML = id === 'formulacao' ? '' : `<div class="painel-med">${painelMedida(m, lista)}<p class="nota-painel">Linha tracejada: 100% = o próprio controle de cada estudo. Toque numa barra para ver o valor; toque no nome para ir ao gráfico.</p></div>`;
  painel.querySelectorAll('.linha-int').forEach(l => ligarLinha(l));
  const cards = document.getElementById('med-cards');
  cards.innerHTML = `<div class="cards">${lista.map(cartao).join('')}</div>`;
  cards.querySelectorAll('.ver-estudo').forEach(b => b.addEventListener('click', ev => { ev.stopPropagation(); abrirEstudo(b.dataset.estudo, b); }));
}
function artigo(id) {
  return { temperatura: 'o calor', radiacao: 'o sol (UV)', agua: 'pouca água', compatibilidade: 'produtos químicos', tempo: 'o passar do tempo',
    nutricao: 'adubo', formulacao: 'a formulação', salinidade: 'sal', ph: 'a acidez' }[id] || 'o fator';
}
function saltar(id) {
  const e = F.exps.find(x => x.id === id);
  if (ctxFator && e && e.medida !== ctxFator.med && ctxFator.meds.includes(e.medida)) mostrarMedida(e.medida);
  const el = document.getElementById('c-' + id); if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  el.classList.add('realce'); setTimeout(() => el.classList.remove('realce'), 2200);
}

// Painéis coordenados: um por tipo de medida; dentro do painel, ordem por organismo (não por valor)
const dicaSobra = e => esc(`<b>${e.sobra > 100 ? '+' + num(e.sobra - 100, 0) + '% acima do controle' : num(e.sobra, 1) + '% do controle'}</b><br>${esc(e.sobraRef || '')}<br><small>${esc(corta(e.condition, 160))}</small>`);
function painelMedida(m, lista) {
  const ordem = F.grupos.map(g => g.nome);
  lista = [...lista].sort((x, y) => ordem.indexOf(x.grupoM) - ordem.indexOf(y.grupoM));
  const larg = Math.round((document.getElementById('med-painel') || {}).clientWidth || 1000), max = 150;
  if (larg >= 640) {
    const W = 1000, esq = 330, dir = 40, alt = 60, topo = 34, H = topo + lista.length * alt + 8;
    const x = v => esq + (W - esq - dir) * Math.min(v, max) / max;
    let s = `<svg class="g" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(MEDIDAS[m])}">`;
    [0, 50, 100, 150].forEach(t => s += `<line x1="${x(t)}" x2="${x(t)}" y1="${topo - 6}" y2="${H - 4}" stroke="var(--grid)" ${t === 100 ? 'stroke-width="2" stroke-dasharray="5 4" stroke="var(--muted)"' : ''}/><text x="${x(t)}" y="${topo - 12}" text-anchor="middle" font-size="14" fill="var(--muted)">${t === 150 ? '150%+' : t + '%'}</text>`);
    lista.forEach((e, i) => {
      const y = topo + i * alt, cy = y + alt / 2, c = corGrupo[e.grupoM];
      s += `<g class="linha-int" data-id="${e.id}"><rect class="fundo" x="0" y="${y + 2}" width="${W}" height="${alt - 4}" rx="10" fill="transparent"/>
        <circle cx="14" cy="${cy}" r="7" fill="${c}"/>
        <text x="30" y="${cy - 4}" font-size="17" font-weight="700" fill="var(--strong)">${esc(e.grupoM)}${e.pendente ? '<tspan fill="#eab308" font-size="13.5" font-weight="600"> · a validar</tspan>' : ''}</text>
        <text x="30" y="${cy + 16}" font-size="14" fill="var(--muted)">${esc(corta(e.metric, 40))}</text>${barraPainel(e, c, esq, cy, x, 24, 15)}</g>`;
    });
    return s + '</svg>';
  }
  // celular: 1 unidade do SVG = 1 px na tela, então a letra não encolhe
  const W = larg, pad = 6, alt = 74, topo = 26, H = topo + lista.length * alt + 4;
  const x = v => pad + (W - 2 * pad) * Math.min(v, max) / max;
  let s = `<svg class="g" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(MEDIDAS[m])}">`;
  [0, 50, 100, 150].forEach(t => s += `<line x1="${x(t)}" x2="${x(t)}" y1="${topo - 4}" y2="${H - 2}" stroke="var(--grid)" ${t === 100 ? 'stroke-width="1.5" stroke-dasharray="4 3" stroke="var(--muted)"' : ''}/><text x="${x(t)}" y="${topo - 10}" text-anchor="${t === 0 ? 'start' : t === 150 ? 'end' : 'middle'}" font-size="11" fill="var(--muted)">${t === 150 ? '150%+' : t + '%'}</text>`);
  lista.forEach((e, i) => {
    const y = topo + i * alt, c = corGrupo[e.grupoM];
    s += `<g class="linha-int" data-id="${e.id}"><rect class="fundo" x="0" y="${y + 2}" width="${W}" height="${alt - 4}" rx="10" fill="transparent"/>
      <circle cx="${pad + 5}" cy="${y + 16}" r="5" fill="${c}"/>
      <text x="${pad + 16}" y="${y + 21}" font-size="14.5" font-weight="700" fill="var(--strong)">${esc(e.grupoM)}${e.pendente ? '<tspan fill="#eab308" font-size="12" font-weight="600"> · a validar</tspan>' : ''}</text>
      <text x="${pad + 16}" y="${y + 38}" font-size="12" fill="var(--muted)">${esc(corta(e.metric, Math.floor((W - 30) / 6.4)))}</text>${barraPainel(e, c, pad, y + 56, x, 16, 12.5)}</g>`;
  });
  return s + '</svg>';
}
function barraPainel(e, c, esq, cy, x, h, fs) {
  if (e.sobra !== undefined) return `<rect x="${esq}" y="${cy - h / 2}" width="${x(100) - esq}" height="${h}" rx="${h / 2}" fill="${hexA(c, .1)}"/>
    <rect x="${esq}" y="${cy - h / 2}" width="${Math.max(x(e.sobra) - esq, 6)}" height="${h}" rx="${h / 2}" fill="${c}" data-tip="${dicaSobra(e)}"/>`;
  return `<rect x="${esq}" y="${cy - h / 2 - 3}" width="${x(100) - esq}" height="${h + 6}" rx="${h / 2 + 3}" fill="none" stroke="${c}" stroke-dasharray="4 4"/><text x="${esq + 12}" y="${cy + fs / 3}" font-size="${fs}" fill="var(--text)">${esc(e.qual || 'sem número comparável')}</text>`;
}
let modoPainel = null;
addEventListener('resize', () => {
  const p = document.getElementById('med-painel'); if (!p || !ctxFator || !ctxFator.med) return;
  const novo = p.clientWidth >= 640 ? 'largo' : 'estreito:' + Math.round(p.clientWidth / 20);
  if (novo !== modoPainel) { modoPainel = novo; mostrarMedida(ctxFator.med); }
});

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

// ---------- CARTÕES (nível 1: pergunta, organismo, eixos, legenda, conclusão, referência curta) ----------
function cartao(e) {
  const c = corGrupo[e.grupoM];
  return `<article class="card" id="c-${e.id}" style="--c:${c}">
    <div class="card-top"><span class="chip g"><i class="fas fa-circle" style="font-size:7px"></i>${esc(e.grupoM)}</span>${e.pendente ? '<span class="chip pend"><i class="fas fa-hourglass-half"></i>a validar</span>' : e.conferido ? '<span class="chip ok"><i class="fas fa-circle-check"></i>conferido na fonte</span>' : ''}</div>
    <h3>${esc(e.title)}</h3><p class="org">${esc(e.organism)}</p>
    <p class="metrica">${esc(e.metric)}${e.unit ? ' · ' + esc(e.unit) : ''}</p>
    ${desenhar(e, c)}
    <p class="resultado">${esc(e.headline)}</p>
    <div class="card-pe"><span><i class="fas fa-book"></i> ${esc(refCurta(e))} · ${esc(e.kind)} · ${esc(e.location)}</span><button class="ver-estudo" data-estudo="${e.id}">Ver estudo <i class="fas fa-chevron-right"></i></button></div>
  </article>`;
}
// dica (nível 2) de um valor medido
function dicaValor(e, rot, serie, v, ref) {
  const pct = ref ? ` <small>(${num(v / ref * 100, 0)}% da referência)</small>` : '';
  return esc(`<b>${esc(num(v, 4))} ${esc(e.unit || '')}</b>${pct}<br>${esc(rot)}${serie && serie !== rot ? ' · ' + esc(serie) : ''}<br><small>${esc(corta(e.condition, 160))}</small>`);
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
    pts.forEach((p, i) => {
      g += `<circle cx="${p[0]}" cy="${p[1]}" r="5" fill="var(--bg)" stroke="${cores[k]}" stroke-width="2.5" pointer-events="none"/>
        <circle class="alvo" cx="${p[0]}" cy="${p[1]}" r="15" fill="transparent" data-tip="${dicaValor(e, e.labels[i], q.name, q.values[i], i > 0 ? q.values[0] : 0)}"/>`;
    });
  });
  return g + '</svg><p class="nota-curva">Curva suavizada só para leitura; os pontos são as medidas (toque para ver o valor).</p>';
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
      g += `<rect x="${x}" y="${y}" width="${bw}" height="${Math.max(T + h - y, 2)}" rx="7" fill="${cores[k]}" opacity="${k === 0 && e.series.length > 1 ? .55 : .95}" data-tip="${dicaValor(e, l, q.name, v, k > 0 ? e.series[0].values[i] : 0)}"/>`;
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
      <rect x="${L}" y="${y}" width="${Math.max(X(v) - L, 6)}" height="${bh}" rx="${bh / 2}" fill="${cor}" opacity="${queda !== null && queda < .5 ? 1 : .8}" data-tip="${dicaValor(e, l, '', v, i !== iref ? ref : 0)}"/>
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

// ---------- NÍVEL 2: dica junto do toque (fica aberta até tocar fora ou fechar) ----------
const dica = document.createElement('div'); dica.className = 'dica'; dica.hidden = true; document.body.appendChild(dica);
let dicaAlvo = null;
function fecharDica() { if (!dica.hidden) dica.hidden = true; if (dicaAlvo) dicaAlvo.classList.remove('dica-on'); dicaAlvo = null; }
function mostrarDica(el) {
  if (dicaAlvo === el && !dica.hidden) return;
  fecharDica(); dicaAlvo = el; el.classList.add('dica-on');
  dica.innerHTML = `<button class="dica-x" aria-label="Fechar"><i class="fas fa-xmark"></i></button>` + el.getAttribute('data-tip');
  dica.hidden = false;
  const r = el.getBoundingClientRect(), dw = dica.offsetWidth, dh = dica.offsetHeight;
  let x = r.left + r.width / 2 - dw / 2 + scrollX, y = r.top + scrollY - dh - 10;
  if (r.top - dh - 10 < 4) y = r.bottom + scrollY + 10;
  x = Math.max(8 + scrollX, Math.min(x, scrollX + innerWidth - dw - 8));
  dica.style.left = x + 'px'; dica.style.top = y + 'px';
  dica.querySelector('.dica-x').onclick = ev => { ev.stopPropagation(); fecharDica(); };
}
dica.addEventListener('click', ev => ev.stopPropagation());
app.addEventListener('click', ev => { const el = ev.target.closest('[data-tip]'); if (el) { ev.stopPropagation(); mostrarDica(el); } });
app.addEventListener('pointerover', ev => { if (ev.pointerType !== 'mouse') return; const el = ev.target.closest('[data-tip]'); if (el) mostrarDica(el); });

visaoGeral();


// ---------- altura automática dentro do index (iframe) ----------
if (parent !== window) {
  document.documentElement.classList.add('embutido');
  const enviar = () => { try { parent.postMessage({ rizoAltura: Math.ceil(document.documentElement.scrollHeight) }, '*'); } catch (_) {} };
  new ResizeObserver(enviar).observe(document.body); addEventListener('load', enviar);
}
