'use strict';
// Ampliação das fotos (Wiki): em tela estreita a foto cresce, animada, a partir do ponto tocado.
// Foto deitada num celular em pé abre maior que a largura da tela; arrasta-se para os lados.
// Em tela larga (≥1024px) o comportamento é o de antes: só esmaece e mostra a foto inteira.
(function () {
  const caixa = document.getElementById('lightbox');
  const img = document.getElementById('lightbox-img');
  const legenda = document.getElementById('lightbox-caption');
  if (!caixa || !img || !legenda) return;

  const pista = document.createElement('div');
  pista.className = 'lb-pista';
  img.before(pista);
  pista.append(img);
  const dica = document.createElement('div');
  dica.className = 'lb-dica';
  dica.innerHTML = '<i class="fas fa-arrows-alt-h" aria-hidden="true"></i> arraste para os lados';
  caixa.append(dica);

  const FACILIDADE = 'cubic-bezier(.22,.68,.26,1)';
  const semMovimento = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  let origem = null, animacao = null, aberta = false, versao = 0;

  // Retângulo "cobre" da origem sobre a foto final: escala única + recorte, sem deformar a imagem.
  function quadros(o, f) {
    const s = Math.max(o.width / f.width, o.height / f.height);
    const dx = o.left + o.width / 2 - (f.left + f.width / 2);
    const dy = o.top + o.height / 2 - (f.top + f.height / 2);
    const iy = Math.max(0, (f.height - o.height / s) / 2), ix = Math.max(0, (f.width - o.width / s) / 2);
    return [
      { transform: `translate(${dx}px, ${dy}px) scale(${s})`, clipPath: `inset(${iy}px ${ix}px round ${16 / s}px)` },
      { transform: 'none', clipPath: 'inset(0px 0px round 6px)' }
    ];
  }

  function limpar() {
    animacao?.cancel(); animacao = null;
    img.style.width = img.style.height = img.style.maxWidth = img.style.maxHeight = '';
    pista.classList.remove('lb-rola');
    caixa.classList.remove('lb-zoom');
    dica.classList.remove('lb-dica-on');
  }

  function dimensionar() {
    const ar = img.naturalWidth / img.naturalHeight;
    if (!ar || innerWidth >= 1024) return false;
    caixa.classList.add('lb-zoom');
    const altLivre = innerHeight - legenda.offsetHeight - 56;
    const larLivre = innerWidth - 16;
    let w = Math.min(larLivre, altLivre * ar), h = w / ar;          // foto inteira
    if (ar > larLivre / altLivre) {                                  // limitada pela largura: amplia
      h = Math.min(altLivre, h * 1.8); w = h * ar;
    }
    img.style.maxWidth = img.style.maxHeight = 'none';
    img.style.width = `${Math.round(w)}px`; img.style.height = `${Math.round(h)}px`;
    const rola = w > innerWidth + 1;
    pista.classList.toggle('lb-rola', rola);
    if (rola) pista.scrollLeft = (pista.scrollWidth - pista.clientWidth) / 2;
    return rola;
  }

  window.openLightbox = function (src, caption) {
    const v = ++versao;
    const ev = window.event, alvo = ev && ev.currentTarget instanceof Element ? ev.currentTarget : null;
    origem = alvo ? (alvo.querySelector('img') || alvo) : null;
    limpar();
    legenda.textContent = caption || '';
    img.src = src;
    aberta = true;
    const mostrar = () => {
      if (v !== versao || !aberta) return;
      const rola = dimensionar();
      caixa.classList.add('active');
      if (!caixa.classList.contains('lb-zoom') || semMovimento() || !origem) return;
      const o = origem.getBoundingClientRect();
      if (!o.width || !o.height) return;
      animacao = img.animate(quadros(o, img.getBoundingClientRect()), { duration: 380, easing: FACILIDADE });
      animacao.finished.then(() => { animacao = null; if (rola && aberta) dica.classList.add('lb-dica-on'); }, () => {});
    };
    if (img.decode) img.decode().then(mostrar, mostrar); else mostrar();
  };

  window.closeLightbox = function () {
    if (!aberta) return;
    aberta = false; versao++;
    dica.classList.remove('lb-dica-on');
    const fim = () => { caixa.classList.remove('active'); };
    const o = origem && origem.isConnected ? origem.getBoundingClientRect() : null;
    const visivel = o && o.width && o.bottom > 0 && o.top < innerHeight;
    if (!caixa.classList.contains('lb-zoom') || semMovimento() || !visivel) { fim(); setTimeout(limpar, 320); return; }
    animacao?.cancel();
    const [inicio, final] = quadros(o, img.getBoundingClientRect());
    caixa.classList.add('lb-fechando');
    animacao = img.animate([final, inicio], { duration: 320, easing: FACILIDADE, fill: 'forwards' });
    fim();
    animacao.finished.then(() => { caixa.classList.remove('lb-fechando'); limpar(); }, () => caixa.classList.remove('lb-fechando'));
  };

  addEventListener('resize', () => { if (aberta && caixa.classList.contains('lb-zoom')) dimensionar(); });
})();
