'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const raiz = document.documentElement;
  const parametros = new URLSearchParams(location.search);
  const segundos = (chave, padrao, limite) => {
    const valor = Number(parametros.get(chave));
    return Number.isFinite(valor) && valor >= 1 && valor <= limite ? valor * 1000 : padrao * 1000;
  };
  const inatividade = segundos('inatividade', 180, 3600), permanencia = segundos('permanencia', 20, 120);
  const aviso = document.createElement('div');
  aviso.id = 'quiosque-aviso';
  aviso.setAttribute('popover', 'manual');
  aviso.textContent = 'Toque na tela para explorar';
  document.body.append(aviso);

  const enviar = (frame, mensagem) => frame?.contentWindow?.postMessage(mensagem, '*');
  const quadroDaAba = aba => document.querySelector(`#view-${aba} iframe`);
  const abasComDemo = ['holobionte', 'wiki', 'fundamentos', 'factors', 'mecanismos', 'hero'];
  let timer, ativo = false, cena = 0, passo = 0, inicio = 0, indiceGaleria = 0;
  let engolirClique = false, engolirTecla = null;

  function mostrarAviso() {
    if (aviso.matches(':popover-open')) aviso.hidePopover();
    if (ativo && !document.hidden) aviso.showPopover();
  }
  function sincronizarQuadro(frame) {
    const aba = frame.closest('.view-section')?.id.replace('view-', '');
    enviar(frame, { rizoQuiosque: { ativo, visivel: (window.rizoAbaAtual || 'hero') === aba && !document.hidden } });
  }
  function sincronizarQuadros() {
    document.querySelectorAll('iframe').forEach(sincronizarQuadro);
  }
  function agendar(fn, atraso) {
    clearTimeout(timer);
    if (!document.hidden && raiz.classList.contains('modo-tela')) timer = setTimeout(fn, Math.max(0, atraso));
  }
  function parar() {
    if (!ativo) return;
    ativo = false;
    raiz.classList.remove('quiosque-apresentando');
    mostrarAviso();
    sincronizarQuadros();
  }
  function atividade() {
    parar();
    if (raiz.classList.contains('modo-tela')) {
      window.carregarIframesRizo?.('factors', true);
      window.carregarIframesRizo?.('mecanismos', true);
    }
    agendar(iniciar, inatividade);
  }
  function prepararTroca(depois) {
    const aberto = document.querySelector('dialog.expandida:modal');
    if (!aberto) { depois(); return; }
    if (aberto.rizoExpansao) aberto.rizoExpansao.fechar();
    else enviar(aberto.querySelector('iframe'), { rizoQuiosqueAcao: 'fechar' });
    agendar(() => prepararTroca(depois), 400);
  }
  function iniciar() {
    ativo = true;
    cena = 0;
    raiz.classList.add('quiosque-apresentando');
    closeLightbox();
    mostrarAviso();
    sincronizarQuadros();
    abrirCena();
  }
  function selecionar(aba) {
    if (aba === 'holobionte') {
      const botoes = document.querySelectorAll('.holo-palco .holo-no');
      botoes[(passo + 1) % botoes.length]?.click();
    }
    if (aba === 'wiki') {
      const grupos = Object.keys(bioData);
      loadWiki(grupos[indiceGaleria++ % grupos.length]);
    }
    if (aba === 'fundamentos') {
      const ids = ['nitrogen', 'nutrients', 'auxin'];
      const botoes = document.querySelectorAll('.hotspot-btn');
      Array.from(botoes).find(b => b.dataset.id === ids[passo % ids.length])?.click();
    }
    if (aba === 'factors' && passo === 0) enviar(quadroDaAba(aba), { rizoQuiosqueAcao: 'grafico', indice: indiceGaleria });
    if (aba === 'mecanismos') enviar(quadroDaAba(aba), { rizoQuiosqueAcao: 'fluxo', indice: passo });
  }
  function abrirCena() {
    prepararTroca(() => {
      if (!ativo) return;
      const aba = abasComDemo[cena];
      window.switchView(aba);
      passo = 0;
      inicio = performance.now();
      if (aba === 'wiki') {
        selecionar(aba);
      }
      if (aba === 'factors') enviar(quadroDaAba(aba), { rizoQuiosqueAcao: 'matriz' });
      const marcas = aba === 'hero' ? []
        : aba === 'factors' ? [.38]
        : [.16, .48, .76];
      const avancar = () => {
        if (passo < marcas.length) {
          selecionar(aba);
          passo++;
          const proximo = marcas[passo] ?? 1;
          agendar(avancar, inicio + permanencia * proximo - performance.now());
        } else {
          cena = (cena + 1) % abasComDemo.length;
          abrirCena();
        }
      };
      agendar(avancar, permanencia * (marcas[0] ?? 1));
    });
  }

  function entrada(ev) {
    if (!ev.isTrusted) return;
    const eraAtivo = ativo;
    if (ev.type === 'pointerdown') engolirClique = eraAtivo;
    if (ev.type === 'keydown' && eraAtivo) engolirTecla = ev.code;
    if (eraAtivo || (['click', 'pointerup'].includes(ev.type) && engolirClique) ||
        (ev.type === 'keyup' && engolirTecla === ev.code)) {
      ev.preventDefault();
      ev.stopImmediatePropagation();
      if (ev.type === 'click') engolirClique = false;
      if (ev.type === 'keyup') engolirTecla = null;
    }
    if (eraAtivo || ['pointerdown', 'keydown', 'wheel'].includes(ev.type)) atividade();
  }
  for (const evento of ['pointerdown', 'pointerup', 'click', 'keydown', 'keyup', 'wheel']) {
    window.addEventListener(evento, entrada, { capture:true, passive:false });
  }
  window.addEventListener('rizo-aba', sincronizarQuadros);
  window.addEventListener('rizo-expansao', mostrarAviso);
  window.addEventListener('message', ev => {
    const frame = Array.from(document.querySelectorAll('iframe')).find(f => f.contentWindow === ev.source);
    if (!frame) return;
    if (ev.data?.rizoQuiosquePronto) sincronizarQuadro(frame);
    if (ev.data?.rizoQuiosqueAtividade) atividade();
  });
  document.addEventListener('visibilitychange', () => { atividade(); sincronizarQuadros(); });
  window.rizoQuiosque = { atividade, get ativo() { return ativo; } };
  queueMicrotask(atividade);
});
