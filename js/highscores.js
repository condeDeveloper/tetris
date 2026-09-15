// Ranking local com as 5 melhores partidas
const HighScores = {
  KEY: 'tetris-highscores',
  MAX: 5,

  load() {
    try { return JSON.parse(localStorage.getItem(this.KEY) || '[]'); } catch (_) { return []; }
  },

  // Adiciona uma partida e devolve a posição no ranking (1-based) ou 0 se não entrou
  add(score, lines, level) {
    if (!score) return 0;
    const list = this.load();
    const entry = { score, lines, level, date: new Date().toISOString().slice(0, 10) };
    list.push(entry);
    list.sort((a, b) => b.score - a.score);
    const trimmed = list.slice(0, this.MAX);
    try { localStorage.setItem(this.KEY, JSON.stringify(trimmed)); } catch (_) {}
    const pos = trimmed.indexOf(entry);
    return pos === -1 ? 0 : pos + 1;
  },

  html(highlightPos = 0) {
    const list = this.load();
    if (!list.length) return '';
    const rows = list.map((e, i) =>
      `<li class="${i + 1 === highlightPos ? 'me' : ''}"><span>${i + 1}.</span><strong>${e.score}</strong><small>${e.lines} linhas · nv ${e.level}</small></li>`
    ).join('');
    return `<ol class="ranking">${rows}</ol>`;
  },
};
