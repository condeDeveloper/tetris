// Temas de cores das peças. Tecla T alterna e a escolha fica salva.
const THEMES = {
  neon:   { label: 'Neon',   I: '#22d3ee', O: '#facc15', T: '#a855f7', S: '#22c55e', Z: '#ef4444', J: '#3b82f6', L: '#f97316' },
  pastel: { label: 'Pastel', I: '#7dd3fc', O: '#fde68a', T: '#d8b4fe', S: '#86efac', Z: '#fca5a5', J: '#a5b4fc', L: '#fdba74' },
  retro:  { label: 'Retrô',  I: '#9bbc0f', O: '#8bac0f', T: '#306230', S: '#9bbc0f', Z: '#8bac0f', J: '#306230', L: '#0f380f' },
  mono:   { label: 'Mono',   I: '#f8fafc', O: '#e2e8f0', T: '#cbd5e1', S: '#94a3b8', Z: '#f1f5f9', J: '#cbd5e1', L: '#e2e8f0' },
};
const THEME_KEY = 'tetris-theme';

const Theme = {
  order: Object.keys(THEMES),
  current: localStorage.getItem(THEME_KEY) || 'neon',

  apply(name) {
    const t = THEMES[name] || THEMES.neon;
    for (const k of ['I', 'O', 'T', 'S', 'Z', 'J', 'L']) COLORS[k] = t[k];
    this.current = name;
    try { localStorage.setItem(THEME_KEY, name); } catch (_) {}
    document.documentElement.style.setProperty('--accent', t.T);
  },

  next() {
    const i = this.order.indexOf(this.current);
    this.apply(this.order[(i + 1) % this.order.length]);
    return THEMES[this.current].label;
  },
};
