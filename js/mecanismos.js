'use strict';
// RizoWiki · Mecanismos de Ação — Problema → Microrganismo → Mecanismo (saiu da aba Fatores; SVG próprio, funciona offline)
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const hexA = (h, a) => { const n = parseInt(h.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };

const ORG = { Bacillus: '#38bdf8', Azospirillum: '#22c55e', 'Rizóbios': '#f97316', Methylobacterium: '#a3e635', Bioinseticidas: '#818cf8',
  Pseudomonas: '#c084fc', Trichoderma: '#34d399', Micorrizas: '#fbbf24', PNSB: '#fb7185' };
const PROB = [
  { id: 's1', nome: 'Solo pouco agregado', ic: 'fa-cubes' }, { id: 's2', nome: 'Pouco fósforo disponível', ic: 'fa-flask' },
  { id: 's3', nome: 'Doenças de solo e raiz', ic: 'fa-virus' }, { id: 's4', nome: 'Falta de nitrogênio', ic: 'fa-seedling' },
  { id: 's5', nome: 'Seca e salinidade', ic: 'fa-sun' }, { id: 's6', nome: 'Insetos-praga', ic: 'fa-bug' }
];
const MEC = {
  o1: 'Agregação do solo', o10: 'Biofilme e EPS', o2: 'Solubilização de fosfato', o7: 'Hifas: alcance de água e P',
  o3: 'Antagonismo a patógenos', o6: 'Resistência induzida (ISR)', o4: 'Fixação biológica de N', o8a: 'Auxina (AIA)',
  o5: 'ACC desaminase', o8b: 'ALA (precursor metabólico)', o9: 'Controle biológico de insetos'
};
// Fontes citadas nos caminhos
const REF = {
  oliveira2024: 'Oliveira-Paiva C.A. et al. 2024. Front. Microbiol. 15:1426166.',
  doc155: 'Embrapa. Rizobactérias como agentes de controle biológico (Documentos 155).',
  doc325: 'Hungria M. 2011. Inoculação com Azospirillum brasilense. Embrapa Soja, Documentos 325.',
  glick2014: 'Glick B.R. 2014. Microbiol. Res. 169:30–39.',
  roy2026: 'Roy et al. 2026. BMC Plant Biol. 26:449.',
  torres2023: 'Torres Vera R. et al. 2023 (avaliação de Methylobacterium symbioticum em campo).',
  goetten2016: 'Goetten L.C. et al. 2016 (fungos micorrízicos arbusculares e fósforo).',
  cartilhaFMA: 'Embrapa. Micorrizas (cartilha).',
  mendes2003: 'Mendes I.C., Hungria M., Vargas M.A.T. 2003 (fixação biológica de N na soja).'
};
const LINK_REF = {
  doc155: 'https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1018841/1/doc155rizobacterias.pdf',
  doc325: 'https://www.infoteca.cnptia.embrapa.br/infoteca/handle/doc/879471',
  cartilhaFMA: 'https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1164118/1/MICORRIZAS.pdf'
};
// status: ok = referência indicada · estirpe = depende da estirpe e das condições · discussao = em discussão · pendente = referência ainda a conferir
const FLUXOS = [
  ['s1', 'Micorrizas', 'o1', 'As hifas das micorrizas envolvem partículas do solo e favorecem a formação de agregados. Agregar o solo não é o mesmo que desfazer a compactação.', [], 'pendente'],
  ['s1', 'Bacillus', 'o10', 'Algumas estirpes formam biofilme e exopolissacarídeos (EPS) junto à raiz, que podem ajudar a agregar partículas. Não desfaz compactação.', [], 'pendente'],
  ['s1', 'Azospirillum', 'o10', 'Azospirillum produz EPS na superfície das raízes. O efeito sobre a estrutura do solo no campo ainda precisa de fonte conferida.', [], 'pendente'],
  ['s2', 'Bacillus', 'o2', 'Estirpes selecionadas de Bacillus solubilizam fosfato com ácidos orgânicos. A via PQQ-GDH não é comum a todo o gênero: vale para as estirpes estudadas.', ['oliveira2024'], 'estirpe'],
  ['s2', 'Pseudomonas', 'o2', 'Estirpes de Pseudomonas liberam fosfato pouco solúvel com ácidos orgânicos.', ['doc155'], 'estirpe'],
  ['s2', 'Micorrizas', 'o7', 'As hifas exploram o solo além da raiz e levam fósforo até a planta.', ['goetten2016', 'cartilhaFMA'], 'ok'],
  ['s3', 'Pseudomonas', 'o3', 'Estirpes de Pseudomonas competem com patógenos, por exemplo retendo ferro com sideróforos.', ['doc155'], 'estirpe'],
  ['s3', 'Pseudomonas', 'o6', 'Algumas estirpes ativam a resistência sistêmica induzida (ISR) da planta.', ['doc155'], 'estirpe'],
  ['s3', 'Bacillus', 'o3', 'Algumas estirpes produzem lipopeptídeos com ação contra fungos de solo.', [], 'pendente'],
  ['s3', 'Trichoderma', 'o3', 'Trichoderma compete por espaço e nutrientes e ataca fungos causadores de doença.', [], 'pendente'],
  ['s4', 'Rizóbios', 'o4', 'Rizóbios fixam N dentro dos nódulos da leguminosa; na soja, a FBN pode suprir a maior parte do N da cultura.', ['mendes2003'], 'ok'],
  ['s4', 'Azospirillum', 'o4', 'Azospirillum fixa N associado às raízes, em quantidade menor que os rizóbios.', ['doc325'], 'ok'],
  ['s4', 'Azospirillum', 'o8a', 'Boa parte do efeito do Azospirillum vem da auxina (AIA), que estimula o crescimento das raízes.', ['doc325'], 'ok'],
  ['s4', 'Methylobacterium', 'o4', 'Methylobacterium symbioticum coloniza as folhas, mas o aporte real de N para a cultura ainda está em discussão. Colonizar a folha não prova fornecimento de N.', ['torres2023'], 'discussao'],
  ['s4', 'PNSB', 'o4', 'Algumas bactérias púrpuras fixam N e podem liberar amônio. Depende da estirpe e das condições de cultivo.', [], 'pendente'],
  ['s5', 'Pseudomonas', 'o5', 'A enzima ACC desaminase degrada o ACC, precursor do etileno. Com menos ACC, a planta forma menos etileno de estresse. Presente em estirpes específicas.', ['glick2014'], 'estirpe'],
  ['s5', 'PNSB', 'o8b', 'Algumas bactérias púrpuras produzem ALA, um precursor metabólico (não é hormônio), estudado na tolerância da planta ao sal.', ['roy2026'], 'estirpe'],
  ['s5', 'Micorrizas', 'o7', 'As hifas ampliam o volume de solo explorado e podem ajudar a planta a captar água em solo seco.', [], 'pendente'],
  ['s5', 'Bacillus', 'o10', 'O biofilme de algumas estirpes retém umidade junto à raiz.', [], 'pendente'],
  ['s6', 'Bioinseticidas', 'o9', 'Produtos biológicos usados no manejo de insetos-praga.', [], 'pendente']
];
const STATUS = { ok: ['Referência indicada', '#22c55e'], estirpe: ['Depende da estirpe', '#38bdf8'], discussao: ['Em discussão', '#f59e0b'], pendente: ['Referência a conferir', '#eab308'] };

// ---------- layout: três colunas, ordem por baricentro para reduzir cruzamentos ----------
function montar() {
  const orgs = [...new Set(FLUXOS.map(f => f[1]))], mecs = Object.keys(MEC).filter(m => FLUXOS.some(f => f[2] === m));
  let oOrd = orgs, mOrd = mecs;
  const pIdx = id => PROB.findIndex(p => p.id === id);
  for (let it = 0; it < 4; it++) {
    const bo = o => { const v = FLUXOS.filter(f => f[1] === o).map(f => pIdx(f[0])); const w = FLUXOS.filter(f => f[1] === o).map(f => mOrd.indexOf(f[2]) * PROB.length / mOrd.length);
      return (v.reduce((a, b) => a + b, 0) / v.length) * .7 + (w.reduce((a, b) => a + b, 0) / w.length) * .3; };
    oOrd = [...oOrd].sort((a, b) => bo(a) - bo(b));
    const bm = m => { const v = FLUXOS.filter(f => f[2] === m).map(f => oOrd.indexOf(f[1])); return v.reduce((a, b) => a + b, 0) / v.length; };
    mOrd = [...mOrd].sort((a, b) => bm(a) - bm(b));
  }
  return { oOrd, mOrd };
}

const caixa = document.getElementById('mec');
const pop = document.getElementById('pop-raiz');
let sel = null;
function desenhar() {
  const { oOrd, mOrd } = montar();
  const W = 1000, passo = 54, T = 34, H = T + mOrd.length * passo + 10;
  const nos = {};
  const yCol = (n, i) => T + (H - T - 10) * (i + .5) / n;
  PROB.forEach((p, i) => nos[p.id] = { id: p.id, nome: p.nome, ic: p.ic, col: 0, x: 20, w: 210, y: yCol(PROB.length, i), cor: '#94a3b8' });
  oOrd.forEach((o, i) => nos['g:' + o] = { id: 'g:' + o, nome: o, col: 1, x: 410, w: 180, y: yCol(oOrd.length, i), cor: ORG[o] });
  mOrd.forEach((m, i) => nos[m] = { id: m, nome: MEC[m], col: 2, x: 770, w: 210, y: yCol(mOrd.length, i), cor: '#94a3b8' });
  // segmentos únicos (o mesmo trecho pode servir a vários caminhos)
  const seg = {};
  FLUXOS.forEach((f, k) => {
    [[f[0], 'g:' + f[1]], ['g:' + f[1], f[2]]].forEach(([a, b]) => { const id = a + '>' + b; (seg[id] = seg[id] || { a: nos[a], b: nos[b], ks: [], cor: ORG[f[1]] }).ks.push(k); });
  });
  Object.values(seg).forEach(s => s.pend = s.ks.every(k => FLUXOS[k][5] === 'pendente'));
  const curva = s => { const x0 = s.a.x + s.a.w, x1 = s.b.x, mx = (x0 + x1) / 2; return `M${x0},${s.a.y} C${mx},${s.a.y} ${mx},${s.b.y} ${x1},${s.b.y}`; };
  let g = `<svg class="sk" viewBox="0 0 ${W} ${H}" role="img" aria-label="Diagrama: problema, microrganismo e mecanismo">
    <text x="20" y="16" class="col-tit">PROBLEMA NO CAMPO</text><text x="500" y="16" class="col-tit" text-anchor="middle">MICRORGANISMO</text><text x="980" y="16" class="col-tit" text-anchor="end">MECANISMO</text>`;
  Object.entries(seg).forEach(([id, s]) => {
    g += `<g class="lig" data-ks="${s.ks.join(',')}"><path d="${curva(s)}" fill="none" stroke="${s.cor}" stroke-width="4" stroke-linecap="round" ${s.pend ? 'stroke-dasharray="7 6"' : ''} class="v"/>
      <path d="${curva(s)}" fill="none" stroke="transparent" stroke-width="18" class="alvo"/></g>`;
  });
  Object.values(nos).forEach(n => {
    const h = 38, ks = FLUXOS.map((f, k) => [f, k]).filter(([f]) => f[0] === n.id || 'g:' + f[1] === n.id || f[2] === n.id).map(([, k]) => k);
    const corBorda = n.col === 1 ? n.cor : 'var(--chip-b)';
    g += `<g class="no" data-id="${esc(n.id)}" data-ks="${ks.join(',')}" tabindex="0" role="button" aria-label="${esc(n.nome)}">
      <rect x="${n.x}" y="${n.y - h / 2}" width="${n.w}" height="${h}" rx="12" fill="${n.col === 1 ? hexA(n.cor, .18) : 'var(--pill)'}" stroke="${corBorda}" stroke-width="${n.col === 1 ? 2 : 1}"/>
      ${n.col === 1 ? `<circle cx="${n.x + 16}" cy="${n.y}" r="5.5" fill="${n.cor}"/>` : ''}
      <text x="${n.col === 1 ? n.x + 30 : n.x + 14}" y="${n.y + 5}" font-size="14" font-weight="700" fill="var(--strong)">${esc(n.nome)}</text></g>`;
  });
  caixa.innerHTML = g + '</svg>';
  const ligs = caixa.querySelectorAll('.lig'), nosEl = caixa.querySelectorAll('.no');
  acenderFn = ks => {
    const set = new Set(ks);
    ligs.forEach(l => { const on = l.dataset.ks.split(',').some(k => set.has(+k)); l.classList.toggle('on', on); l.classList.toggle('off', !on); });
    const ativos = new Set(); ks.forEach(k => { const f = FLUXOS[k]; ativos.add(f[0]); ativos.add('g:' + f[1]); ativos.add(f[2]); });
    nosEl.forEach(n => n.classList.toggle('off', !ativos.has(n.dataset.id)));
  };
  const alvos = [];
  nosEl.forEach(n => { const no = nos[n.dataset.id]; alvos.push({ el: n, chave: n.dataset.id, ks: n.dataset.ks.split(',').filter(Boolean).map(Number), titulo: no.nome, cor: no.col === 1 ? no.cor : '#0ea5e9' }); });
  ligs.forEach(l => { const ks = l.dataset.ks.split(',').map(Number); alvos.push({ el: l, chave: 'l:' + l.dataset.ks, ks, titulo: ks.length > 1 ? 'Caminhos deste trecho' : 'Caminho', cor: ORG[FLUXOS[ks[0]][1]] }); });
  alvos.forEach(a => {
    a.el.addEventListener('click', ev => { ev.stopPropagation(); tocar(a, tipoPonteiro); });
    a.el.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); ev.stopPropagation(); tocar(a, 'teclado'); } });
    // mouse por cima: só acende (prévia), sem cartão
    a.el.addEventListener('pointerenter', ev => { if (ev.pointerType === 'mouse' && estagio < 2) { acenderFn(a.ks); dicaToque(a.el, 'clique para ver a explicação'); } });
  });
  caixa.querySelector('svg').addEventListener('pointerleave', ev => { if (ev.pointerType === 'mouse' && estagio < 2) limpar(); });
}

// ---------- ciclo de toque: 1º acende · 2º abre o cartão · 3º apaga (mouse: passar = acender, clicar = cartão) ----------
let acenderFn = () => {}, estagio = 0, tipoPonteiro = 'mouse';
addEventListener('pointerdown', ev => { tipoPonteiro = ev.pointerType || 'mouse'; }, true);
const dicaEl = document.createElement('div'); dicaEl.className = 'dica-toque'; dicaEl.hidden = true; document.body.appendChild(dicaEl);
function dicaToque(el, txt) {
  dicaEl.innerHTML = `<i class="fas fa-hand-pointer"></i> ${txt}`; dicaEl.hidden = false;
  const r = el.getBoundingClientRect(), dw = dicaEl.offsetWidth;
  const ehNo = el.classList.contains('no');
  const x = ehNo ? r.left + r.width / 2 - dw / 2 : (window._ultX || r.left) - dw / 2;
  const y = ehNo ? r.bottom + 6 : (window._ultY || r.top) + 14;
  dicaEl.style.left = Math.max(8, Math.min(x + scrollX, scrollX + innerWidth - dw - 8)) + 'px';
  dicaEl.style.top = (y + scrollY) + 'px';
}
addEventListener('pointermove', ev => { window._ultX = ev.clientX; window._ultY = ev.clientY; }, { passive: true });
addEventListener('pointerdown', ev => { window._ultX = ev.clientX; window._ultY = ev.clientY; }, true);
function tocar(a, tipo) {
  const mesmo = sel === a.chave;
  if (tipo === 'mouse' || tipo === 'teclado') {
    if (mesmo && estagio === 2) return limpar();             // clicar de novo fecha
    sel = a.chave; estagio = 2; acenderFn(a.ks); dicaEl.hidden = true; mostrarPop(a.ks, a.el, a.titulo, a.cor); return;
  }
  // toque (dedo ou caneta)
  if (!mesmo) { pop.innerHTML = ''; sel = a.chave; estagio = 1; acenderFn(a.ks); dicaToque(a.el, 'toque de novo para ver a explicação'); return; }
  if (estagio === 1) { estagio = 2; dicaEl.hidden = true; mostrarPop(a.ks, a.el, a.titulo, a.cor); return; }
  limpar();                                                   // 3º toque apaga tudo
}
function limpar() {
  pop.innerHTML = ''; sel = null; estagio = 0; dicaEl.hidden = true;
  caixa.querySelectorAll('.on, .off').forEach(e => e.classList.remove('on', 'off'));
}
function mostrarPop(ks, el, titulo, cor) {
  const itens = ks.map(k => {
    const [p, o, m, txt, refs, st] = FLUXOS[k], prob = PROB.find(x => x.id === p).nome;
    return `<div class="cam" style="--c:${ORG[o]}"><p class="rota"><span>${esc(prob)}</span><i class="fas fa-arrow-right"></i><b>${esc(o)}</b><i class="fas fa-arrow-right"></i><span>${esc(MEC[m])}</span></p>
      <p class="txt">${esc(txt)}</p>
      <p class="refs"><span class="st" style="--s:${STATUS[st][1]}">${STATUS[st][0]}</span>${refs.map(r => LINK_REF[r] ? `<a href="${LINK_REF[r]}" target="_blank" rel="noopener">${esc(REF[r])}</a>` : `<span>${esc(REF[r])}</span>`).join('')}</p></div>`;
  }).join('');
  pop.innerHTML = `<div class="pop" style="--c:${cor}" role="dialog"><button class="fechar" aria-label="Fechar"><i class="fas fa-xmark"></i></button>
    <h3>${esc(titulo)}</h3><p class="sub">${ks.length} ${ks.length > 1 ? 'caminhos' : 'caminho'} na literatura reunida · toque fora para fechar</p>${itens}</div>`;
  const p = pop.firstElementChild, r = el.getBoundingClientRect(), W = innerWidth, pw = p.offsetWidth, ph = p.offsetHeight;
  let x = r.right + 12, y = r.top + scrollY - 10;
  if (x + pw > W - 8) x = r.left - pw - 12;
  if (x < 8) { x = Math.max(8, Math.min(W - pw - 8, r.left + r.width / 2 - pw / 2)); y = r.bottom + scrollY + 8; }
  y = Math.max(8, Math.min(y, document.documentElement.scrollHeight - ph - 8));
  p.style.left = x + 'px'; p.style.top = y + 'px';
  p.querySelector('.fechar').onclick = ev => { ev.stopPropagation(); limpar(); };
  p.addEventListener('click', ev => ev.stopPropagation());
}
document.addEventListener('click', limpar);

// legenda de status
document.getElementById('leg').innerHTML = `<span><svg width="34" height="10"><line x1="2" y1="5" x2="32" y2="5" stroke="var(--muted)" stroke-width="4" stroke-linecap="round"/></svg> com referência indicada</span>
  <span><svg width="34" height="10"><line x1="2" y1="5" x2="32" y2="5" stroke="var(--muted)" stroke-width="4" stroke-dasharray="7 6" stroke-linecap="round"/></svg> referência ainda a conferir</span>
  ${Object.values(STATUS).map(([n, c]) => `<span class="st" style="--s:${c}">${n}</span>`).join('')}`;

desenhar();

// ---------- tema e altura (mesma conversa do analytics.html com o index) ----------
addEventListener('message', ev => {
  const h = document.documentElement;
  if (ev.data === 'toggle-theme') h.classList.toggle('light-mode');
  if (ev.data === 'force-light') h.classList.add('light-mode');
});
try { if (parent !== window && parent.document.documentElement.classList.contains('light-mode')) document.documentElement.classList.add('light-mode'); } catch (_) {}
if (parent !== window) {
  document.documentElement.classList.add('embutido');
  const enviar = () => { try { parent.postMessage({ rizoAltura: Math.ceil(document.documentElement.scrollHeight) }, '*'); } catch (_) {} };
  new ResizeObserver(enviar).observe(document.body); addEventListener('load', enviar);
}
