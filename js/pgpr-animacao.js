'use strict';

const raizPGPR = 'M80 108 Q79 115 68 122 T46 138 M80 113 Q94 117 103 128 T122 136 M79 131 Q67 137 65 149';
const pelosPGPR = 'M68 122 q-5 -3 -8 -1 M64 128 q-5 -2 -7 0 M58 133 q-4 -1 -6 2 M96 121 q2 -5 6 -5 M101 127 q4 -2 7 -1 M110 133 q4 -4 8 -2 M72 140 q-5 2 -7 7';
const folhaPGPR = 'M87 64 C96 46 109 43 142 39 C133 51 108 49 87 64Z';
const rotuloPGPR = (texto, x, y) => `<text class="pgpr-rotulo" x="${x}" y="${y}">${texto}</text>`;
const caminhoPGPR = (d, atraso = '0s') => `<path class="pgpr-trajeto" pathLength="100" style="--espera:${atraso}" d="${d}"/>`;
const marcasPGPR = (pontos, classe = '') => pontos.map(([x, y], i) => `<circle class="pgpr-marca ${classe}" style="--espera:${i * 0.16}s" cx="${x}" cy="${y}" r="2"/>`).join('');

const sobreposicoesPGPR = {
  roots() {
    return caminhoPGPR(raizPGPR) + caminhoPGPR(pelosPGPR, '.55s') +
      rotuloPGPR('Raízes laterais', 36, 146) + rotuloPGPR('Pelos radiculares', 111, 150);
  },
  nitrogen() {
    return rotuloPGPR('N₂', 34, 95) + caminhoPGPR('M35 99 Q42 119 61 121 Q71 121 78 111') +
      marcasPGPR([[42,109],[49,116],[59,121],[68,120]]) +
      rotuloPGPR('N disponível', 55, 137);
  },
  nutrients() {
    return rotuloPGPR('P no solo', 133, 160) + caminhoPGPR('M131 154 Q122 152 108 142 Q97 133 86 129') +
      marcasPGPR([[127,153],[116,147],[106,141],[95,134]]) +
      rotuloPGPR('Fosfato disponível', 94, 154);
  },
  auxin() {
    return rotuloPGPR('Auxina (AIA)', 103, 107) +
      caminhoPGPR('M99 110 Q88 112 83 119') + caminhoPGPR(raizPGPR, '.4s') + caminhoPGPR(pelosPGPR, '.75s');
  },
  leaves() {
    return `<path class="pgpr-folha" d="${folhaPGPR}"/>` +
      caminhoPGPR('M81 105 Q79 81 86 66 Q104 52 130 44') +
      rotuloPGPR('Parte aérea', 116, 63);
  },
  photosynthesis() {
    return `<path class="pgpr-folha" d="${folhaPGPR}"/>` +
      caminhoPGPR('M109 17 L106 34 M122 16 L120 33 M135 21 L131 35') +
      rotuloPGPR('Luz', 121, 16) + rotuloPGPR('Carbono na biomassa', 120, 66) +
      marcasPGPR([[99,51],[111,47],[123,44],[134,41]]);
  }
};

function mostrarAnimacaoPGPR(mecanismo) {
  const camada = document.getElementById('pgpr-animacao');
  if (!camada) return;
  camada.dataset.mecanismo = mecanismo || '';
  camada.innerHTML = sobreposicoesPGPR[mecanismo]?.() || '';
}
