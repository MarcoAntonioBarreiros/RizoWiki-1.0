'use strict';

// O mesmo iframe permanece montado durante toda a apresentação.
function montarJanelaFatores(container, frame) {
  const janela = document.createElement('dialog');
  janela.className = 'fatores-janela';
  janela.setAttribute('aria-label', 'Gráfico expandido');
  janela.setAttribute('open', '');
  janela.appendChild(frame);
  container.appendChild(janela);

  let fase = 'normal', origem, alturaOriginal, animacao, overflowOriginal, rolagemOriginal;
  const viewport = document.querySelector('meta[name="viewport"]');
  let viewportOriginal;
  const enviar = mensagem => frame.contentWindow.postMessage(mensagem, '*');

  function animar(inversa) {
    animacao?.cancel();
    const painel = janela.getBoundingClientRect();
    const slot = container.getBoundingClientRect();
    const largura = origem.width * slot.width / origem.frameWidth;
    const esquerda = slot.left + origem.left * slot.width / origem.frameWidth;
    const topo = slot.top + origem.top;
    const geometria = {
      transform: `translate(${esquerda - painel.left}px, ${topo - painel.top}px) scale(${largura / painel.width}, ${origem.height / painel.height})`
    };
    const final = { transform: 'none' };
    animacao = janela.animate(inversa ? [final, geometria] : [geometria, final], {
      duration: matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 350,
      easing: 'cubic-bezier(.22,.68,.26,1)', fill: 'both'
    });
    return animacao.finished;
  }

  window.addEventListener('message', async ev => {
    if (ev.source !== frame.contentWindow || !ev.data) return;
    const { tipo, rect } = ev.data;
    if (tipo === 'fatores-expansao-pronta') enviar({ tipo: 'fatores-expansao-disponivel' });
    if (tipo === 'fatores-expandir' && fase === 'normal') {
      const frameRect = frame.getBoundingClientRect();
      if (!rect || ![rect.left, rect.top, rect.width, rect.height].every(Number.isFinite) ||
          !frameRect.width || rect.width <= 0 || rect.height <= 0) return;
      origem = { ...rect, frameWidth: frameRect.width };
      alturaOriginal = frame.style.height;
      rolagemOriginal = { left: scrollX, top: scrollY, behavior: 'instant' };
      container.style.height = `${container.offsetHeight}px`;
      overflowOriginal = document.documentElement.style.overflow;
      const barra = innerWidth - document.documentElement.clientWidth;
      if (barra > 0) document.documentElement.classList.add('fatores-travar-rolagem');
      document.documentElement.style.overflow = 'hidden';

      fase = 'abrindo';
      // O documento principal controla o zoom por pinçamento, inclusive sobre o iframe.
      viewportOriginal = viewport?.content;
      if (viewport) viewport.content = viewportOriginal.replace(/,\s*(?:maximum-scale|user-scalable)=[^,]*/g, '');
      janela.close();
      janela.classList.add('expandida');
      frame.style.height = '100%';
      janela.showModal();
      frame.focus({ preventScroll: true });
      enviar({ tipo: 'fatores-expandido' });
      await animar(false);
      animacao.cancel();
      fase = 'expandida';
      enviar({ tipo: 'fatores-transicao-concluida' });
    }
    if (tipo === 'fatores-restaurar' && fase === 'expandida') {
      fase = 'fechando';
      janela.classList.add('restaurando');
      await animar(true);
      janela.close();
      animacao.cancel();
      janela.classList.remove('expandida', 'restaurando');
      janela.setAttribute('open', '');
      frame.style.height = alturaOriginal;
      container.style.height = '';
      if (viewport) viewport.content = viewportOriginal;
      document.documentElement.style.overflow = overflowOriginal;
      document.documentElement.classList.remove('fatores-travar-rolagem');
      window.scrollTo(rolagemOriginal);
      fase = 'normal';
      enviar({ tipo: 'fatores-restaurado' });
    }
  });

  janela.addEventListener('cancel', ev => {
    ev.preventDefault();
    enviar({ tipo: 'fatores-pedir-restauracao' });
  });
  let iniciouFora = false;
  janela.addEventListener('pointerdown', ev => { iniciouFora = ev.target === janela; });
  janela.addEventListener('click', ev => {
    if (iniciouFora && ev.target === janela) enviar({ tipo: 'fatores-pedir-restauracao' });
    iniciouFora = false;
  });
  return { get expandida() { return fase !== 'normal'; } };
}
