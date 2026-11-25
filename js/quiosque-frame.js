'use strict';

if (parent !== window) {
  let ativo = false, engolirClique = false, engolirTecla = null;
  for (const evento of ['pointerdown', 'pointerup', 'click', 'keydown', 'keyup', 'wheel']) {
    window.addEventListener(evento, ev => {
      if (!ev.isTrusted) return;
      const eraAtivo = ativo;
      if (evento === 'pointerdown') engolirClique = eraAtivo;
      if (evento === 'keydown' && eraAtivo) engolirTecla = ev.code;
      if (eraAtivo || ((evento === 'click' || evento === 'pointerup') && engolirClique) ||
          (evento === 'keyup' && engolirTecla === ev.code)) {
        ev.preventDefault();
        ev.stopImmediatePropagation();
        if (evento === 'click') engolirClique = false;
        if (evento === 'keyup') engolirTecla = null;
      }
      if (eraAtivo || ['pointerdown', 'keydown', 'wheel'].includes(evento)) {
        ativo = false;
        parent.postMessage({ rizoQuiosqueAtividade:true }, '*');
      }
    }, { capture:true, passive:false });
  }
  window.addEventListener('message', ev => {
    if (ev.source !== parent) return;
    if (ev.data?.rizoQuiosque) {
      ativo = ev.data.rizoQuiosque.ativo;
      document.documentElement.classList.toggle('rizo-invisivel', !ev.data.rizoQuiosque.visivel);
    }
    if (ev.data?.rizoQuiosqueAcao && (ativo || ev.data.rizoQuiosqueAcao === 'fechar')) {
      window.dispatchEvent(new CustomEvent('rizo-demo-frame', { detail:ev.data }));
    }
  });
  parent.postMessage({ rizoQuiosquePronto:true }, '*');
}
