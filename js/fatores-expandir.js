'use strict';

function criarExpansaoGraficos({ renderizar, limparDica, aoRestaurar }) {
  const modal = document.createElement('dialog');
  modal.className = 'grafico-modal';
  modal.innerHTML = `
    <button type="button" class="grafico-acao grafico-restaurar" aria-label="Restaurar gráfico" title="Restaurar gráfico">
      <i class="fas fa-compress" aria-hidden="true"></i>
    </button>
    <div class="grafico-modal-corpo"></div>`;
  document.body.appendChild(modal);
  const corpo = modal.querySelector('.grafico-modal-corpo');
  const restaurar = modal.querySelector('.grafico-restaurar');
  const enviar = tipo => parent.postMessage({ tipo }, '*');
  let integrado = false, estado = null, quadro = 0;

  function redimensionar() {
    if (!estado || estado.fase === 'fechando') return;
    const { grafico, area } = estado;
    const largura = area.clientWidth;
    if (!largura) return;
    const complementos = Array.from(area.children)
      .filter(el => el.matches('.leg-serie, .nota-curva'))
      .reduce((altura, el) => altura + el.offsetHeight + 8, 0);
    const estilo = getComputedStyle(corpo);
    const alturaUtil = corpo.clientHeight - parseFloat(estilo.paddingTop) - parseFloat(estilo.paddingBottom);
    const altura = Math.max(0, alturaUtil - (grafico.offsetHeight - area.offsetHeight) - complementos - 4);
    const escala = Math.min(1.65, Math.max(1, largura / 690));
    const medidas = { largura: Math.floor(largura / escala), altura: Math.floor(altura / escala) };
    const chave = `${medidas.largura}:${medidas.altura}`;
    if (chave === estado.medidas) return;
    estado.medidas = chave;
    limparDica();
    area.innerHTML = renderizar(grafico, medidas);
    for (const alvo of area.querySelectorAll('[data-tip]')) {
      alvo.setAttribute('tabindex', '0');
      alvo.setAttribute('role', 'button');
      alvo.setAttribute('aria-label', alvo.dataset.tip.replace(/<br>/g, ' · ').replace(/<[^>]*>/g, ''));
    }
  }
  function agendarRedimensionamento() {
    cancelAnimationFrame(quadro);
    quadro = requestAnimationFrame(redimensionar);
  }
  const observador = new ResizeObserver(agendarRedimensionamento);

  function animar(inversa) {
    const { origem } = estado;
    const r = modal.getBoundingClientRect();
    const deslocamento = {
      transform: `translate(${origem.left - r.left}px, ${origem.top - r.top}px) scale(${origem.width / r.width}, ${origem.height / r.height})`
    };
    const destino = { transform: 'none' };
    const animacao = modal.animate(inversa ? [destino, deslocamento] : [deslocamento, destino], {
      duration: matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 350,
      easing: 'cubic-bezier(.22,.68,.26,1)', fill: 'both'
    });
    return animacao.finished.then(() => animacao.cancel());
  }

  function mostrar() {
    limparDica();
    corpo.scrollTop = 0;
    estado.grafico.replaceWith(estado.espaco);
    corpo.appendChild(estado.grafico);
    estado.grafico.classList.add('grafico-ampliado');
    document.documentElement.classList.add('grafico-em-apresentacao');
    modal.classList.toggle('grafico-modal-embutido', estado.integrado);
    const titulo = estado.grafico.querySelector('h2, h3').textContent;
    modal.setAttribute('aria-label', titulo);
    modal.showModal();
    restaurar.focus({ preventScroll: true });
    redimensionar();
    observador.observe(corpo);
  }

  async function abrir(botao) {
    if (estado) return;
    const grafico = botao.closest('[data-grafico-expansivel]');
    const area = grafico.querySelector('.grafico-area');
    const { left, top, width, height } = grafico.getBoundingClientRect();
    const espaco = document.createElement('div');
    espaco.className = 'grafico-espaco';
    espaco.style.height = `${height}px`;
    espaco.setAttribute('aria-hidden', 'true');
    estado = { grafico, area, botao, espaco, integrado, fase: 'abrindo',
      rolagem: { left: scrollX, top: scrollY, behavior: 'instant' },
      origem: { left, top, width, height }, original: Array.from(area.childNodes) };
    if (integrado) {
      parent.postMessage({ tipo: 'fatores-expandir', rect: estado.origem }, '*');
    } else {
      mostrar();
      await animar(false);
      prepararFechamento();
    }
  }

  function prepararFechamento() {
    estado.fase = 'aberto';
    if (estado.fecharAoAbrir) fechar(estado.depois);
  }

  async function fechar(depois) {
    if (!estado || estado.fase === 'fechando') return;
    if (estado.fase === 'abrindo') {
      estado.fecharAoAbrir = true;
      estado.depois = depois;
      return;
    }
    estado.fase = 'fechando';
    estado.depois = depois;
    limparDica();
    if (estado.integrado) {
      enviar('fatores-restaurar');
    } else {
      modal.classList.add('restaurando');
      await animar(true);
      finalizar();
    }
  }

  function finalizar() {
    const { grafico, area, botao, espaco, original, depois, rolagem } = estado;
    observador.disconnect();
    cancelAnimationFrame(quadro);
    modal.close();
    modal.classList.remove('restaurando');
    document.documentElement.classList.remove('grafico-em-apresentacao');
    area.replaceChildren(...original);
    grafico.classList.remove('grafico-ampliado');
    espaco.replaceWith(grafico);
    estado = null;
    botao.focus({ preventScroll: true });
    window.scrollTo(rolagem);
    aoRestaurar();
    depois?.();
  }

  function fecharCamada() {
    const fecharEstudo = modal.querySelector('.ficha-fundo .fechar');
    if (fecharEstudo) fecharEstudo.click();
    else fechar();
  }

  document.addEventListener('click', ev => {
    const botao = ev.target.closest('.grafico-expandir');
    if (botao) abrir(botao);
  });
  restaurar.addEventListener('click', fecharCamada);
  modal.addEventListener('cancel', ev => { ev.preventDefault(); fecharCamada(); });
  modal.addEventListener('keydown', ev => {
    if (ev.key === 'Escape') { ev.preventDefault(); ev.stopPropagation(); fecharCamada(); }
  });
  let iniciouFora = false;
  modal.addEventListener('pointerdown', ev => { iniciouFora = ev.target === modal; });
  modal.addEventListener('click', ev => {
    if (iniciouFora && ev.target === modal) fecharCamada();
    iniciouFora = false;
  });
  corpo.addEventListener('scroll', limparDica, { passive: true });

  if (parent !== window) {
    window.addEventListener('message', ev => {
      if (ev.source !== parent) return;
      switch (ev.data?.tipo) {
        case 'fatores-expansao-disponivel': integrado = true; break;
        case 'fatores-expandido': if (estado?.integrado && !modal.open) mostrar(); break;
        case 'fatores-transicao-concluida': if (estado?.integrado) prepararFechamento(); break;
        case 'fatores-pedir-restauracao': if (estado?.integrado) fecharCamada(); break;
        case 'fatores-restaurado': if (estado?.integrado) finalizar(); break;
      }
    });
    enviar('fatores-expansao-pronta');
  }
  return { get ativa() { return !!estado; }, get modal() { return modal.open ? modal : null; }, fechar };
}
