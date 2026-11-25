'use strict';

function animarJanelaRizo(janela, origem, inversa = false) {
  const painel = janela.getBoundingClientRect();
  const geometria = {
    transform: `translate(${origem.left - painel.left}px, ${origem.top - painel.top}px) scale(${origem.width / painel.width}, ${origem.height / painel.height})`
  };
  const final = { transform: 'none' };
  return janela.animate(inversa ? [final, geometria] : [geometria, final], {
    duration: matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 350,
    easing: 'cubic-bezier(.22,.68,.26,1)', fill: 'both'
  });
}

function avancarComJanelaRizo(alvo, opcoes = {}) {
  const existente = alvo.closest('dialog[data-rizo-janela]');
  if (existente?.rizoExpansao) return existente.rizoExpansao;
  const janela = existente || document.createElement('dialog');
  const slot = existente ? janela.parentElement : document.createElement('div');
  if (!existente) {
    slot.className = 'rizo-visual-slot';
    alvo.before(slot);
    slot.append(janela);
    janela.append(alvo);
  }
  janela.classList.add('fatores-janela', 'rizo-visual-janela');
  janela.dataset.rizoJanela = '';
  janela.setAttribute('open', '');
  janela.setAttribute('aria-label', opcoes.titulo || 'Visualização expandida');
  if (opcoes.avulsa) janela.classList.add('rizo-janela-avulsa');

  const botao = document.createElement('button');
  botao.type = 'button';
  botao.className = 'rizo-maximizar';
  const fecharBotao = botao.cloneNode();
  fecharBotao.classList.add('rizo-restaurar');
  fecharBotao.title = 'Restaurar visualização';
  fecharBotao.setAttribute('aria-label', fecharBotao.title);
  fecharBotao.innerHTML = '<i class="fas fa-compress" aria-hidden="true"></i>';
  botao.title = 'Expandir visualização';
  botao.setAttribute('aria-label', botao.title);
  botao.setAttribute('aria-haspopup', 'dialog');
  botao.innerHTML = '<i class="fas fa-expand" aria-hidden="true"></i>';
  if (!opcoes.avulsa) (opcoes.areaBotao || janela).append(botao);
  janela.prepend(fecharBotao);

  let fase = 'normal', origem, ancora, rolagem, overflow, tinhaCalha, focoAnterior, aposFechar, animacao;
  let fechouAoAbrir = false;
  const alturaAnterior = slot.style.height;
  function iniciar(entrada, animar = true) {
    if (fase !== 'normal') return;
    fase = 'abrindo';
    ancora = entrada instanceof Element ? entrada : null;
    origem = ancora?.getBoundingClientRect() || alvo.getBoundingClientRect();
    focoAnterior = ancora || document.activeElement;
    rolagem = { left: scrollX, top: scrollY, behavior: 'instant' };
    slot.style.height = `${slot.offsetHeight}px`;
    if (!opcoes.embutida) {
      overflow = document.documentElement.style.overflow;
      tinhaCalha = document.documentElement.classList.contains('fatores-travar-rolagem');
      if (innerWidth > document.documentElement.clientWidth) document.documentElement.classList.add('fatores-travar-rolagem');
      document.documentElement.style.overflow = 'hidden';
    }
    janela.close();
    janela.classList.add('expandida');
    janela.classList.toggle('rizo-visual-embutida', opcoes.embutida === true);
    janela.showModal();
    window.dispatchEvent(new Event('rizo-expansao'));
    fecharBotao.focus({ preventScroll: true });
    opcoes.redimensionar?.(true);
    if (animar) {
      animacao = animarJanelaRizo(janela, origem);
      animacao.finished.then(concluirAbertura);
    }
  }
  function concluirAbertura() {
    animacao?.cancel();
    animacao = null;
    fase = 'aberta';
    if (fechouAoAbrir) pedirFechamento();
  }
  function restaurar() {
    janela.close();
    animacao?.cancel();
    animacao = null;
    janela.classList.remove('expandida', 'restaurando');
    janela.setAttribute('open', '');
    slot.style.height = alturaAnterior;
    if (!opcoes.embutida) {
      document.documentElement.style.overflow = overflow;
      document.documentElement.classList.toggle('fatores-travar-rolagem', tinhaCalha);
    }
    fase = 'normal';
    fechouAoAbrir = false;
    focoAnterior?.focus({ preventScroll: true });
    window.scrollTo(rolagem);
    opcoes.redimensionar?.(false);
    const depois = aposFechar;
    aposFechar = null;
    depois?.();
  }
  function pedirFechamento(depois) {
    if (fase === 'fechando' || fase === 'normal') return false;
    if (typeof depois === 'function') aposFechar = depois;
    if (fase === 'abrindo') { fechouAoAbrir = true; return true; }
    fase = 'fechando';
    if (opcoes.fecharNoPrincipal) { opcoes.fecharNoPrincipal(); return true; }
    janela.classList.add('restaurando');
    const destino = ancora?.isConnected && ancora !== botao ? ancora.getBoundingClientRect()
      : { ...origem.toJSON(), top: slot.getBoundingClientRect().top, left: slot.getBoundingClientRect().left };
    animacao = animarJanelaRizo(janela, destino, true);
    animacao.finished.then(restaurar);
    return true;
  }
  botao.onclick = () => opcoes.abrirNoPrincipal ? opcoes.abrirNoPrincipal() : iniciar();
  fecharBotao.onclick = () => pedirFechamento();
  janela.addEventListener('cancel', ev => {
    ev.preventDefault();
    if (!opcoes.esc?.()) pedirFechamento();
  });
  let iniciouFora = false;
  janela.addEventListener('pointerdown', ev => { iniciouFora = ev.target === janela; });
  janela.addEventListener('click', ev => {
    if (iniciouFora && ev.target === janela) {
      const r = janela.getBoundingClientRect();
      if (ev.clientX < r.left || ev.clientX > r.right || ev.clientY < r.top || ev.clientY > r.bottom) pedirFechamento();
    }
    iniciouFora = false;
  });
  janela.rizoExpansao = { abrir: iniciar, concluirAbertura, restaurar, fechar: pedirFechamento,
    get ativa() { return fase !== 'normal'; } };
  return janela.rizoExpansao;
}

// O mesmo iframe permanece montado durante toda a apresentação.
function montarJanelaFatores(container, frame, titulo = 'Gráfico expandido') {
  const janela = document.createElement('dialog');
  janela.className = 'fatores-janela';
  janela.setAttribute('aria-label', titulo);
  janela.setAttribute('open', '');
  janela.appendChild(frame);
  container.appendChild(janela);

  let fase = 'normal', origem, alturaOriginal, animacao, overflowOriginal, rolagemOriginal;
  const viewport = document.querySelector('meta[name="viewport"]');
  let viewportOriginal;
  const enviar = mensagem => frame.contentWindow.postMessage(mensagem, '*');

  function animar(inversa) {
    animacao?.cancel();
    const slot = container.getBoundingClientRect();
    const largura = origem.width * slot.width / origem.frameWidth;
    const esquerda = slot.left + origem.left * slot.width / origem.frameWidth;
    const topo = slot.top + origem.top;
    animacao = animarJanelaRizo(janela, { left: esquerda, top: topo, width: largura, height: origem.height }, inversa);
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
      window.dispatchEvent(new Event('rizo-expansao'));
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
