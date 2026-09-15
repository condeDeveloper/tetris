// Constantes do jogo
const COLS = 10;
const ROWS = 20;
const CELL = 30;              // px por célula no canvas principal
const NEXT_COUNT = 3;         // quantas peças mostrar na fila
const LOCK_DELAY = 500;       // ms antes de travar a peça encostada
const LINES_PER_LEVEL = 10;

const COLORS = {
  I: '#22d3ee',
  O: '#facc15',
  T: '#a855f7',
  S: '#22c55e',
  Z: '#ef4444',
  J: '#3b82f6',
  L: '#f97316',
  ghost: 'rgba(255,255,255,.18)',
  grid: 'rgba(255,255,255,.04)',
};

// Pontos por linhas limpas de uma vez (índice = nº de linhas), multiplicado pelo nível
const SCORE_TABLE = [0, 100, 300, 500, 800];

// Tempo (ms) entre quedas automáticas em cada nível
function gravityMs(level) {
  return Math.max(60, Math.round(1000 * Math.pow(0.82, level - 1)));
}
