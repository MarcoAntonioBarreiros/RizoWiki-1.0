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
// altura útil da tela do index (sem o cabeçalho); chega por postMessage. Sem ela, um valor de notebook.
let telaUtil = 700, modoTela = false;
const LIMITE_VERTICAL = 720;   // abaixo desta largura: versão vertical contextual (celular, tablet estreito)

// largura aproximada de um texto, para escolher a fonte que cabe na caixa
const larguraTexto = (t, f) => t.length * f * .56;

// ---------- versão completa: Sankey horizontal em pixels reais (1 unidade = 1 px), altura pela tela ----------
function desenhar(W) {
  const { oOrd, mOrd } = montar();
  const nMax = Math.max(PROB.length, oOrd.length, mOrd.length);
  const disponivel = telaUtil - (modoTela ? 215 : 190);           // título, instrução e legenda ficam na mesma tela
  const passo = Math.max(40, Math.min(modoTela ? 70 : 62, (disponivel - 40) / nMax));
  const T = 28, H = Math.round(T + nMax * passo + 8);
  const hNo = Math.min(modoTela ? 46 : 40, passo - 6);
  const fBase = modoTela ? 16 : (W >= 1100 ? 14.5 : 13.5);
  const wLado = Math.round(Math.max(176, Math.min(260, W * .215))), wOrg = Math.round(Math.max(150, Math.min(210, W * .17)));
  const nos = {};
  const yCol = (n, i) => T + (H - T - 8) * (i + .5) / n;
  PROB.forEach((p, i) => nos[p.id] = { id: p.id, nome: p.nome, ic: p.ic, col: 0, x: 1, w: wLado, y: yCol(PROB.length, i), cor: '#94a3b8' });
  oOrd.forEach((o, i) => nos['g:' + o] = { id: 'g:' + o, nome: o, col: 1, x: Math.round((W - wOrg) / 2), w: wOrg, y: yCol(oOrd.length, i), cor: ORG[o] });
  mOrd.forEach((m, i) => nos[m] = { id: m, nome: MEC[m], col: 2, x: W - wLado - 1, w: wLado, y: yCol(mOrd.length, i), cor: '#94a3b8' });
  // segmentos únicos (o mesmo trecho pode servir a vários caminhos)
  const seg = {};
  FLUXOS.forEach((f, k) => {
    [[f[0], 'g:' + f[1]], ['g:' + f[1], f[2]]].forEach(([a, b]) => { const id = a + '>' + b; (seg[id] = seg[id] || { a: nos[a], b: nos[b], ks: [], cor: ORG[f[1]] }).ks.push(k); });
  });
  Object.values(seg).forEach(s => s.pend = s.ks.every(k => FLUXOS[k][5] === 'pendente'));
  const curva = s => { const x0 = s.a.x + s.a.w, x1 = s.b.x, mx = (x0 + x1) / 2; return `M${x0},${s.a.y} C${mx},${s.a.y} ${mx},${s.b.y} ${x1},${s.b.y}`; };
  let g = `<svg class="sk" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Diagrama: problema, microrganismo e mecanismo">
    <text x="2" y="14" class="col-tit">PROBLEMA NO CAMPO</text><text x="${W / 2}" y="14" class="col-tit" text-anchor="middle">MICRORGANISMO</text><text x="${W - 2}" y="14" class="col-tit" text-anchor="end">MECANISMO</text>`;
  Object.entries(seg).forEach(([id, s]) => {
    g += `<g class="lig" data-ks="${s.ks.join(',')}"><path d="${curva(s)}" fill="none" stroke="${s.cor}" stroke-width="${modoTela ? 5 : 4}" stroke-linecap="round" ${s.pend ? 'stroke-dasharray="7 6"' : ''} class="v"/>
      <path d="${curva(s)}" fill="none" stroke="transparent" stroke-width="20" class="alvo"/></g>`;
  });
  Object.values(nos).forEach(n => {
    const ks = FLUXOS.map((f, k) => [f, k]).filter(([f]) => f[0] === n.id || 'g:' + f[1] === n.id || f[2] === n.id).map(([, k]) => k);
    const corBorda = n.col === 1 ? n.cor : 'var(--chip-b)';
    const xt = n.col === 1 ? n.x + 30 : n.x + 14, cabe = n.w - (xt - n.x) - 8;
    let f = fBase; while (f > 11 && larguraTexto(n.nome, f) > cabe) f -= .5;
    g += `<g class="no" data-id="${esc(n.id)}" data-ks="${ks.join(',')}" tabindex="0" role="button" aria-label="${esc(n.nome)}">
      <rect x="${n.x}" y="${n.y - hNo / 2}" width="${n.w}" height="${hNo}" rx="12" fill="${n.col === 1 ? hexA(n.cor, .18) : 'var(--pill)'}" stroke="${corBorda}" stroke-width="${n.col === 1 ? 2 : 1}"/>
      ${n.col === 1 ? `<circle cx="${n.x + 16}" cy="${n.y}" r="5.5" fill="${n.cor}"/>` : ''}
      <text x="${xt}" y="${n.y + f * .36}" font-size="${f}" font-weight="700" fill="var(--strong)">${esc(n.nome)}</text></g>`;
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

// ---------- versão vertical contextual (celular): um foco por vez, Problema → Microrganismo → Mecanismo de cima para baixo ----------
// Um toque basta: tocar num item ou numa ligação acende o caminho ali mesmo e mostra a ficha logo abaixo do diagrama.
const V = { modo: 'prob', foco: 's4', sub: null };
const MODOS = { prob: 'Problema', org: 'Microrganismo', mec: 'Mecanismo' };
const ORGS_TODOS = () => [...new Set(FLUXOS.map(f => f[1]))];
const MECS_TODOS = () => Object.keys(MEC).filter(m => FLUXOS.some(f => f[2] === m));
const idFoco = () => V.modo === 'prob' ? V.foco : V.modo === 'org' ? 'g:' + V.foco : V.foco;
const fluxosDoFoco = () => FLUXOS.map((f, k) => [f, k]).filter(([f]) => V.modo === 'prob' ? f[0] === V.foco : V.modo === 'org' ? f[1] === V.foco : f[2] === V.foco).map(([, k]) => k);
const nomeDe = id => id.startsWith('g:') ? id.slice(2) : (MEC[id] || (PROB.find(p => p.id === id) || {}).nome || id);
const kssDoNo = (id, ks) => ks.filter(k => { const f = FLUXOS[k]; return f[0] === id || 'g:' + f[1] === id || f[2] === id; });

function desenharVertical() {
  const ks = fluxosDoFoco();
  // colunas: os dois níveis que não são o foco, na ordem do caminho (problema → microrganismo → mecanismo)
  const nivelFoco = V.modo === 'prob' ? 0 : V.modo === 'org' ? 1 : 2;
  const [cA, cB] = [0, 1, 2].filter(n => n !== nivelFoco);
  const TIT = ['Problema no campo', 'Microrganismo', 'Mecanismo'];
  const idNivel = (f, n) => n === 0 ? f[0] : n === 1 ? 'g:' + f[1] : f[2];
  const colA = [], colB = [];
  ks.forEach(k => { const f = FLUXOS[k]; const a = idNivel(f, cA), b = idNivel(f, cB); if (!colA.includes(a)) colA.push(a); if (!colB.includes(b)) colB.push(b); });
  const { oOrd, mOrd } = montar();
  const ordem = (n) => (a, b) => n === 0 ? PROB.findIndex(p => p.id === a) - PROB.findIndex(p => p.id === b) : n === 1 ? oOrd.indexOf(a.slice(2)) - oOrd.indexOf(b.slice(2)) : mOrd.indexOf(a) - mOrd.indexOf(b);
  colA.sort(ordem(cA)); colB.sort(ordem(cB));
  const lista = V.modo === 'prob' ? PROB.map(p => [p.id, p.nome, `<i class="fas ${p.ic}"></i>`]) : V.modo === 'org' ? ORGS_TODOS().map(o => [o, o, `<span class="v-ponto" style="background:${ORG[o]}"></span>`]) : MECS_TODOS().map(m => [m, MEC[m], '']);
  const noHtml = id => {
    const org = id.startsWith('g:'), cor = org ? ORG[id.slice(2)] : null, foco = id === idFoco();
    const prob = PROB.find(p => p.id === id);
    return `<button class="v-no${org ? ' v-org' : ''}${foco ? ' v-foco' : ''}" data-id="${esc(id)}" style="${org ? `--o:${cor}` : ''}">${org ? '<span class="v-ponto"></span>' : prob ? `<i class="fas ${prob.ic}"></i>` : ''}<span>${esc(nomeDe(id))}</span></button>`;
  };
  caixa.innerHTML = `
    <div class="v-modos" role="tablist" aria-label="Começar por">${Object.entries(MODOS).map(([m, n]) => `<button role="tab" aria-selected="${V.modo === m}" class="v-modo${V.modo === m ? ' on' : ''}" data-modo="${m}">${n}</button>`).join('')}</div>
    <div class="v-chips">${lista.map(([id, nome, ic]) => `<button class="v-chip${id === V.foco ? ' on' : ''}" data-foco="${esc(id)}">${ic}${esc(nome)}</button>`).join('')}</div>
    <div class="v-diag">
      <svg class="v-lig"></svg>
      <div class="v-topo"><p class="v-tit">${TIT[nivelFoco]}</p>${noHtml(idFoco())}</div>
      <div class="v-cols">
        <div class="v-col"><p class="v-tit">${TIT[cA]}</p>${colA.map(noHtml).join('')}</div>
        <div class="v-col"><p class="v-tit">${TIT[cB]}</p>${colB.map(noHtml).join('')}</div>
      </div>
    </div>
    <div class="v-ficha" id="v-ficha"></div>`;
  caixa.querySelectorAll('.v-modo').forEach(b => b.onclick = ev => { ev.stopPropagation(); trocarModo(b.dataset.modo); });
  caixa.querySelectorAll('.v-chip').forEach(b => b.onclick = ev => { ev.stopPropagation(); V.foco = b.dataset.foco; V.sub = null; desenharVertical(); });
  caixa.querySelectorAll('.v-no').forEach(b => b.onclick = ev => {
    ev.stopPropagation();
    const id = b.dataset.id;
    if (id === idFoco() || (V.sub && V.sub.id === id)) { V.sub = null; } else V.sub = { id, ks: kssDoNo(id, ks), el: b };
    aplicarSub(ks);
  });
  const chipOn = caixa.querySelector('.v-chip.on');
  if (chipOn) { const tira = chipOn.parentElement; tira.scrollLeft = chipOn.offsetLeft - (tira.clientWidth - chipOn.offsetWidth) / 2; }
  V.colunas = [cA, cB];
  ligarVertical(ks);
  aplicarSub(ks, true);
}
function trocarModo(m) {
  if (V.modo === m) return;
  // mantém o contexto: o novo foco é o primeiro item ligado ao foco atual
  const ks = fluxosDoFoco(), col = m === 'prob' ? 0 : m === 'org' ? 1 : 2;
  V.modo = m; V.sub = null;
  V.foco = ks.length ? FLUXOS[ks[0]][col] : (m === 'prob' ? PROB[0].id : m === 'org' ? ORGS_TODOS()[0] : MECS_TODOS()[0]);
  desenharVertical();
}
// ligações: o foco desce por um tronco à esquerda e entra em cada item da 1ª coluna; entre as colunas, curvas na cor do microrganismo
function ligarVertical(ks) {
  const diag = caixa.querySelector('.v-diag'), svg = caixa.querySelector('.v-lig');
  if (!diag || !svg) return;
  const rd = diag.getBoundingClientRect();
  svg.setAttribute('width', rd.width); svg.setAttribute('height', rd.height); svg.setAttribute('viewBox', `0 0 ${rd.width} ${rd.height}`);
  const pos = {};
  caixa.querySelectorAll('.v-no').forEach(b => { const r = b.getBoundingClientRect(); pos[b.dataset.id] = { l: r.left - rd.left, r: r.right - rd.left, cx: r.left - rd.left + r.width / 2, cy: r.top - rd.top + r.height / 2, bot: r.bottom - rd.top }; });
  const [cA, cB] = V.colunas;
  const idNivel = (f, n) => n === 0 ? f[0] : n === 1 ? 'g:' + f[1] : f[2];
  const F = pos[idFoco()], gx = 7;
  let html = '';
  // tronco + ramos (neutros; o que conta é o caminho entre as colunas)
  const ramos = {};
  ks.forEach(k => { const a = idNivel(FLUXOS[k], cA); (ramos[a] = ramos[a] || []).push(k); });
  Object.entries(ramos).forEach(([a, lk]) => {
    const A = pos[a]; if (!F || !A) return;
    const y0 = F.bot, yc = y0 + 14;
    const d = `M${F.cx},${y0} C${F.cx},${yc + 6} ${gx},${yc - 6} ${gx},${yc + 18} L${gx},${A.cy - 12} Q${gx},${A.cy} ${A.l},${A.cy}`;
    html += `<g class="v-l v-ramo" data-ks="${lk.join(',')}"><path d="${d}" fill="none" stroke="var(--muted)" stroke-width="2.5" stroke-linecap="round" class="v"/></g>`;
  });
  const seg = {};
  ks.forEach(k => { const f = FLUXOS[k]; const a = idNivel(f, cA), b = idNivel(f, cB), id = a + '>' + b; (seg[id] = seg[id] || { a, b, ks: [], cor: ORG[f[1]] }).ks.push(k); });
  Object.values(seg).forEach(s => {
    const A = pos[s.a], B = pos[s.b]; if (!A || !B) return;
    const pend = s.ks.every(k => FLUXOS[k][5] === 'pendente'), mx = (A.r + B.l) / 2;
    const d = `M${A.r},${A.cy} C${mx},${A.cy} ${mx},${B.cy} ${B.l},${B.cy}`;
    html += `<g class="v-l" data-ks="${s.ks.join(',')}"><path d="${d}" fill="none" stroke="${s.cor}" stroke-width="4" stroke-linecap="round" ${pend ? 'stroke-dasharray="7 6"' : ''} class="v"/><path d="${d}" fill="none" stroke="transparent" stroke-width="22" class="alvo"/></g>`;
  });
  svg.innerHTML = html;
  svg.querySelectorAll('.v-l:not(.v-ramo)').forEach(l => l.onclick = ev => {
    ev.stopPropagation();
    const lk = l.dataset.ks.split(',').map(Number);
    V.sub = (V.sub && V.sub.chave === l.dataset.ks) ? null : { id: null, chave: l.dataset.ks, ks: lk, el: l, titulo: lk.length > 1 ? 'Caminhos deste trecho' : 'Caminho' };
    aplicarSub(ks);
  });
}
// destaca o que foi tocado e mostra a ficha (todos os caminhos do foco, ou só os do item tocado)
function aplicarSub(ks, inicial) {
  const vis = V.sub ? V.sub.ks : ks, set = new Set(vis);
  caixa.querySelectorAll('.v-l').forEach(l => { const on = l.dataset.ks.split(',').some(k => set.has(+k)); l.classList.toggle('on', !!V.sub && on); l.classList.toggle('off', !!V.sub && !on); });
  const ativos = new Set(); vis.forEach(k => { const f = FLUXOS[k]; ativos.add(f[0]); ativos.add('g:' + f[1]); ativos.add(f[2]); });
  caixa.querySelectorAll('.v-no').forEach(b => { b.classList.toggle('off', !!V.sub && !ativos.has(b.dataset.id)); b.classList.toggle('v-tocado', !!V.sub && V.sub.id === b.dataset.id); });
  const ficha = caixa.querySelector('#v-ficha');
  const titulo = V.sub ? (V.sub.id ? nomeDe(V.sub.id) : V.sub.titulo) : nomeDe(idFoco());
  const cor = V.sub && V.sub.id && V.sub.id.startsWith('g:') ? ORG[V.sub.id.slice(2)] : (V.modo === 'org' && !V.sub ? ORG[V.foco] : '#0ea5e9');
  // atalho de exploração: ver tudo sobre o item tocado (vira o novo foco)
  let ir = '';
  if (V.sub && V.sub.id) { const m = V.sub.id.startsWith('g:') ? 'org' : MEC[V.sub.id] ? 'mec' : 'prob'; ir = `<button class="v-ir" data-m="${m}" data-f="${esc(m === 'org' ? V.sub.id.slice(2) : V.sub.id)}">Ver tudo sobre ${esc(nomeDe(V.sub.id))} <i class="fas fa-arrow-right"></i></button>`; }
  ficha.innerHTML = `<div class="v-cab" style="--c:${cor}"><h3>${esc(titulo)}</h3><p class="sub">${vis.length} ${vis.length > 1 ? 'caminhos' : 'caminho'} na literatura reunida${V.sub ? ' · <button class="v-todos">mostrar todos</button>' : ''}</p>${ir}</div>` +
    vis.map(k => {
      const [p, o, m, txt, refs, st] = FLUXOS[k], prob = PROB.find(x => x.id === p).nome;
      return `<div class="cam" style="--c:${ORG[o]}"><p class="rota"><span>${esc(prob)}</span><i class="fas fa-arrow-down"></i><b>${esc(o)}</b><i class="fas fa-arrow-down"></i><span>${esc(MEC[m])}</span></p>
        <p class="txt">${esc(txt)}</p>
        <p class="refs"><span class="st" style="--s:${STATUS[st][1]}">${STATUS[st][0]}</span>${refs.map(r => LINK_REF[r] ? `<a href="${LINK_REF[r]}" target="_blank" rel="noopener">${esc(REF[r])}</a>` : `<span>${esc(REF[r])}</span>`).join('')}</p></div>`;
    }).join('');
  const todos = ficha.querySelector('.v-todos'); if (todos) todos.onclick = ev => { ev.stopPropagation(); V.sub = null; aplicarSub(ks); };
  const bIr = ficha.querySelector('.v-ir'); if (bIr) bIr.onclick = ev => { ev.stopPropagation(); V.modo = bIr.dataset.m; V.foco = bIr.dataset.f; V.sub = null; desenharVertical(); };
  // resposta no lugar do toque: um aviso junto ao item, apontando para a ficha logo abaixo
  if (!inicial && V.sub && V.sub.el) dicaToque(V.sub.el, `${vis.length} ${vis.length > 1 ? 'caminhos' : 'caminho'} na ficha abaixo`);
  else dicaEl.hidden = true;
}

// ---------- escolhe a versão pela largura disponível e redesenha quando ela muda ----------
let versao = null, larguraAtual = 0;
function renderizar(forcar) {
  const W = Math.floor(caixa.clientWidth);
  if (!W) return;
  if (!forcar && W === larguraAtual) return;
  larguraAtual = W;
  const nova = W < LIMITE_VERTICAL ? 'vertical' : 'completa';
  document.documentElement.classList.toggle('mec-vertical', nova === 'vertical');
  if (nova !== versao) { limpar(); versao = nova; }
  if (versao === 'vertical') desenharVertical(); else desenhar(W);
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
  if (versao === 'vertical') return;                          // na versão vertical o destaque some só por toque no próprio diagrama
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

renderizar(true);
let _tR = null;
addEventListener('resize', () => { clearTimeout(_tR); _tR = setTimeout(() => renderizar(), 120); });
// a versão vertical mede os botões: redesenha as curvas quando as fontes terminam de carregar
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => renderizar(true));

// ---------- tema e altura (mesma conversa do analytics.html com o index) ----------
addEventListener('message', ev => {
  const h = document.documentElement;
  if (ev.data === 'toggle-theme') h.classList.toggle('light-mode');
  if (ev.data === 'force-light') h.classList.add('light-mode');
  if (ev.data && ev.data.rizoTela) {                         // altura útil e modo tela vindos do index
    const t = ev.data.rizoTela, mudou = Math.abs(t.util - telaUtil) > 4 || !!t.modoTela !== modoTela;
    telaUtil = t.util; modoTela = !!t.modoTela; h.classList.toggle('modo-tela', modoTela);
    if (mudou) renderizar(true);
  }
});
try { if (parent !== window && parent.document.documentElement.classList.contains('light-mode')) document.documentElement.classList.add('light-mode'); } catch (_) {}
if (parent !== window) {
  document.documentElement.classList.add('embutido');
  const enviar = () => { try { parent.postMessage({ rizoAltura: Math.ceil(document.documentElement.scrollHeight) }, '*'); } catch (_) {} };
  new ResizeObserver(enviar).observe(document.body); addEventListener('load', enviar);
  try { parent.postMessage({ rizoPedeTela: 1 }, '*'); } catch (_) {}   // pede a altura útil ao index
}
