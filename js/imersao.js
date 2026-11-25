'use strict';

const EXPLICACOES_WIKI = [
  'Contribuição para a nutrição nitrogenada da planta.',
  'Mobilização de fósforo em formas que a planta pode aproveitar.',
  'Promoção do desenvolvimento das raízes.',
  'Contribuição para a proteção da planta contra doenças.',
  'Atuação no controle de pragas.',
  'Apoio à planta em condições de estresse, como seca, salinidade ou calor.'
];
let eixoWiki = null;

function limparFocoRadarWiki() {
  eixoWiki = null;
  document.querySelector('.radar-foco')?.remove();
}

function corDoEixoWiki(indice, cor, modoAlvos, linha = false) {
  if (modoAlvos || eixoWiki === null || indice === undefined) return cor;
  if (eixoWiki === indice) return bioData[window.currentWikiKey]?.colors.hex || '#0ea5e9';
  if (linha) return 'rgba(100,116,139,.26)';
  return document.documentElement.classList.contains('light-mode') ? '#64748b' : '#94a3b8';
}

function atualizarRadarWiki(canvas, anterior, config, modoAlvos) {
  if (!anterior || anterior.canvas !== canvas) {
    anterior?.destroy();
    anterior = new Chart(canvas, config);
  } else {
    const dadosAntigos = anterior.data.datasets;
    const atual = config.data.datasets;
    anterior.data.labels = config.data.labels;
    anterior.data.datasets = atual.map((serie, i) => {
      const conservada = serie.label === '__silhueta' ? dadosAntigos.find(d => d.label === '__silhueta')
        : dadosAntigos[i]?.label === '__silhueta' ? null : dadosAntigos[i];
      if (modoAlvos !== anterior.modoRizoAlvos || !conservada) return serie;
      for (const chave of Object.keys(conservada)) if (!(chave in serie)) delete conservada[chave];
      return Object.assign(conservada, serie);
    });
    anterior.options = config.options;
    anterior.update();
  }
  anterior.modoRizoAlvos = modoAlvos;
  return anterior;
}

function mostrarFocoRadarWiki(chart, indice, x, y) {
  const igual = eixoWiki === indice;
  limparFocoRadarWiki();
  if (indice < 0 || igual) { chart.update('none'); return; }
  eixoWiki = indice;
  const aviso = document.createElement('aside');
  aviso.className = 'radar-foco';
  aviso.setAttribute('role', 'status');
  const titulo = document.createElement('strong');
  titulo.textContent = FUNCOES_LABELS_LONGOS[indice];
  const texto = document.createElement('p');
  texto.textContent = EXPLICACOES_WIKI[indice];
  const lista = document.createElement('ul');
  chart.data.datasets.filter(d => d.label !== '__silhueta').forEach(d => {
    const linha = document.createElement('li');
    const estado = d.data[indice] === 2 ? 'função principal' : d.data[indice] === 1 ? 'função secundária' : 'função não indicada';
    linha.textContent = `${d.label} · ${estado}`;
    lista.append(linha);
  });
  aviso.append(titulo, texto, lista);
  const area = chart.canvas.parentElement;
  area.append(aviso);
  const escala = chart.scales.r;
  const aoLado = escala.xCenter + escala.drawingArea + 75;
  const esquerda = aoLado + aviso.offsetWidth + 5 < area.clientWidth ? aoLado : x - aviso.offsetWidth / 2;
  aviso.style.left = `${Math.max(5, Math.min(esquerda, area.clientWidth - aviso.offsetWidth - 5))}px`;
  aviso.style.top = `${Math.max(5, Math.min(y + 14, area.clientHeight - aviso.offsetHeight - 5))}px`;
  chart.tooltip?.setActiveElements([], { x, y });
  chart.update('none');
}

const interacaoEixosWiki = {
  id: 'interacaoEixosWiki',
  afterEvent(chart, { event, replay }) {
    if (replay || chart.modoRizoAlvos || event.type !== 'click') return;
    const escala = chart.scales.r, x = event.x, y = event.y;
    let indice = chart.data.labels.findIndex((_, i) => {
      const caixa = escala.getPointLabelPosition(i);
      return caixa && x >= caixa.left - 8 && x <= caixa.right + 8 && y >= caixa.top - 8 && y <= caixa.bottom + 8;
    });
    if (indice < 0 && Math.hypot(x - escala.xCenter, y - escala.yCenter) > 16) {
      indice = chart.data.labels.findIndex((_, i) => {
        const p = escala.getPointPosition(i, escala.drawingArea);
        const dx = p.x - escala.xCenter, dy = p.y - escala.yCenter;
        const px = x - escala.xCenter, py = y - escala.yCenter;
        const parte = (px * dx + py * dy) / (dx * dx + dy * dy);
        return parte > 0 && parte < 1.06 && Math.abs(px * dy - py * dx) / Math.hypot(dx, dy) < 11;
      });
    }
    mostrarFocoRadarWiki(chart, indice, x, y);
  }
};

function atualizarFotoWiki(foto, chave, html) {
  if (foto.dataset.organismo === chave) return;
  foto.dataset.organismo = chave;
  const anterior = Array.from(foto.children).findLast(camada => camada.style.opacity !== '0');
  const nova = document.createElement('div');
  nova.className = 'wiki-foto-camada';
  nova.innerHTML = html;
  for (const antiga of Array.from(foto.children)) if (antiga !== anterior) antiga.remove();
  if (anterior) anterior.inert = true;
  foto.append(nova);
  const finalizar = () => anterior?.remove();
  const imagem = nova.querySelector('img');
  if (!anterior || matchMedia('(prefers-reduced-motion: reduce)').matches) { finalizar(); return; }
  nova.style.opacity = '0';
  const entrar = () => {
    if (foto.lastElementChild !== nova) return;
    nova.style.opacity = '1';
    nova.animate([{ opacity:0 }, { opacity:1 }], { duration:360, easing:'ease-out' }).finished.then(finalizar);
  };
  if (imagem?.decode) imagem.decode().then(entrar, entrar);
  else entrar();
}

function posicionarBotaoWiki(botao) {
  const nav = botao.parentElement;
  const botoes = nav.getBoundingClientRect(), item = botao.getBoundingClientRect();
  if (nav.scrollWidth > nav.clientWidth && (item.left < botoes.left || item.right > botoes.right)) {
    nav.scrollLeft += item.left - botoes.left - (nav.clientWidth - item.width) / 2;
  }
  if (nav.scrollHeight > nav.clientHeight && (item.top < botoes.top || item.bottom > botoes.bottom)) {
    nav.scrollTop += item.top - botoes.top - (nav.clientHeight - item.height) / 2;
  }
}

function prepararMatrizWiki(body) {
  const tabela = body.querySelector('table');
  let selecao = '';
  tabela.addEventListener('click', ev => {
    const ficha = ev.target.closest('[data-mz-ficha]');
    if (ficha) {
      fecharMatrizFuncoes(() => {
        const navegar = () => { switchView('wiki'); loadWiki(ficha.dataset.mzFicha); };
        const radar = document.querySelector('#view-wiki dialog.expandida')?.rizoExpansao;
        if (!radar?.fechar(navegar)) navegar();
      });
      return;
    }
    const coluna = ev.target.closest('[data-mz-foco-col]')?.dataset.mzFocoCol;
    const linha = ev.target.closest('[data-mz-linha]')?.dataset.mzLinha;
    const pedido = coluna !== undefined ? 'c:' + coluna : linha ? 'l:' + linha : '';
    selecao = selecao === pedido ? '' : pedido;
    for (const el of tabela.querySelectorAll('[data-mz-linha], [data-mz-col]')) {
      const atual = selecao.startsWith('l:') ? el.dataset.mzLinha : el.dataset.mzCol;
      const on = !!selecao && atual === selecao.slice(2);
      el.classList.toggle('mz-em-foco', on);
      el.classList.toggle('mz-apagado', !!selecao && atual !== undefined && !on);
    }
    for (const b of tabela.querySelectorAll('[aria-pressed]')) {
      b.setAttribute('aria-pressed', selecao === 'c:' + b.dataset.mzFocoCol || selecao === 'l:' + b.dataset.mzFocoLinha);
    }
  });
}

function prepararRadarWiki() {
  const bloco = document.getElementById('wiki-bloco-grafico');
  if (!bloco) return;
  avancarComJanelaRizo(bloco, {
    titulo: 'Gráfico radar da Wiki',
    redimensionar: () => requestAnimationFrame(() => Chart.getChart(document.getElementById('wikiChartCanvas'))?.resize())
  });
}

document.addEventListener('DOMContentLoaded', () => {
  avancarComJanelaRizo(document.getElementById('root-holobionte'), { titulo: 'O Universo Oculto da Rizosfera' });
  avancarComJanelaRizo(document.querySelector('.fund-bloco'), { titulo: 'Diagrama de Ação PGPR' });
  avancarComJanelaRizo(document.querySelector('.lab-visualizacao'), {
    titulo: 'Gráfico analítico do Lab',
    areaBotao: document.querySelector('.lab-grafico'),
    redimensionar: () => requestAnimationFrame(() => window.bubbleChartLab?.resize())
  });
});
document.addEventListener('visibilitychange', () => {
  document.documentElement.classList.toggle('rizo-documento-oculto', document.hidden);
});
