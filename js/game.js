// Estado do jogo, regras e loop principal
class Game {
  constructor() {
    this.boardCtx = document.getElementById('board').getContext('2d');
    this.holdCtx = document.getElementById('hold').getContext('2d');
    this.nextCtx = document.getElementById('next').getContext('2d');
    this.el = {
      score: document.getElementById('score'),
      lines: document.getElementById('lines'),
      level: document.getElementById('level'),
      best: document.getElementById('best'),
      overlay: document.getElementById('overlay'),
    };
    this.best = Number(localStorage.getItem('tetris-best') || 0);
    Theme.apply(Theme.current);
    this.board = new Board();
    this.state = 'ready'; // ready | playing | paused | over
    this.flashRows = [];
    this.reset();
    bindInput(a => this.action(a));
    this.last = performance.now();
    requestAnimationFrame(t => this.loop(t));
  }

  reset() {
    this.board.reset();
    this.bag = new Bag();
    this.hold = null;
    this.canHold = true;
    this.score = 0;
    this.lines = 0;
    this.level = 1;
    this.dropTimer = 0;
    this.lockTimer = 0;
    this.flashRows = [];
    this.flashTimer = 0;
    this.spawn();
    this.updateHud();
  }

  spawn() {
    this.current = new Piece(this.bag.next());
    this.canHold = true;
    this.dropTimer = 0;
    this.lockTimer = 0;
    if (this.board.collides(this.current)) this.gameOver();
  }

  // ---------- Ações ----------
  action(name) {
    if (name === 'start') {
      if (this.state === 'ready') return this.start();
      if (this.state === 'over') { this.reset(); return this.start(); }
      if (this.state === 'paused') return this.togglePause();
      return;
    }
    if (name === 'restart') { this.reset(); return this.start(); }
    if (name === 'pause') return this.togglePause();
    if (name === 'theme') { this.toast(`Tema: ${Theme.next()}`); return; }
    if (this.state !== 'playing') return;

    switch (name) {
      case 'left': this.move(-1); break;
      case 'right': this.move(1); break;
      case 'softDrop': if (this.step()) this.score += 1; this.updateHud(); break;
      case 'hardDrop': this.hardDrop(); break;
      case 'rotateCW': this.rotate(1); break;
      case 'rotateCCW': this.rotate(-1); break;
      case 'hold': this.swapHold(); break;
    }
  }

  start() {
    this.state = 'playing';
    this.el.overlay.classList.add('hidden');
  }

  togglePause() {
    if (this.state === 'playing') {
      this.state = 'paused';
      this.showOverlay('PAUSADO', '<kbd>P</kbd> ou toque para continuar');
    } else if (this.state === 'paused') {
      this.start();
    }
  }

  move(dx) {
    this.current.x += dx;
    if (this.board.collides(this.current)) { this.current.x -= dx; return false; }
    this.lockTimer = 0;
    Sound.move();
    return true;
  }

  rotate(dir) {
    if (this.current.type === 'O') return;
    const rotated = rotateMatrix(this.current.shape, dir);
    const original = this.current.shape;
    const ox = this.current.x, oy = this.current.y;
    this.current.shape = rotated;
    for (const [kx, ky] of KICKS) {
      this.current.x = ox + kx;
      this.current.y = oy + ky;
      if (!this.board.collides(this.current)) { this.lockTimer = 0; Sound.rotate(); return true; }
    }
    this.current.shape = original;
    this.current.x = ox; this.current.y = oy;
    return false;
  }

  // Desce uma célula. Retorna false se encostou.
  step() {
    this.current.y++;
    if (this.board.collides(this.current)) { this.current.y--; return false; }
    return true;
  }

  hardDrop() {
    const target = this.board.dropPosition(this.current);
    this.score += (target.y - this.current.y) * 2;
    this.current = target;
    Sound.hard();
    this.lockPiece();
  }

  swapHold() {
    if (!this.canHold) return;
    const held = this.hold;
    this.hold = this.current.type;
    if (held) {
      this.current = new Piece(held);
      this.dropTimer = 0; this.lockTimer = 0;
    } else {
      this.spawn();
    }
    this.canHold = false;
    Sound.hold();
    this.updateHud();
  }

  lockPiece() {
    const above = this.board.lock(this.current);
    if (above) return this.gameOver();
    const cleared = this.board.clearLines();
    if (cleared.length) {
      this.flashRows = cleared;
      this.flashTimer = 120;
      this.lines += cleared.length;
      this.score += SCORE_TABLE[cleared.length] * this.level;
      const newLevel = 1 + Math.floor(this.lines / LINES_PER_LEVEL);
      if (newLevel > this.level) { this.level = newLevel; Sound.level(); }
      else if (cleared.length === 4) Sound.tetris();
      else Sound.clear(cleared.length);
    } else {
      Sound.lock();
    }
    if (this.score > this.best) {
      this.best = this.score;
      localStorage.setItem('tetris-best', this.best);
    }
    this.spawn();
    this.updateHud();
  }

  gameOver() {
    this.state = 'over';
    Sound.over();
    const pos = HighScores.add(this.score, this.lines, this.level);
    const headline = pos === 1 ? '🏆 Novo recorde!' : pos ? `#${pos} no ranking` : '';
    this.showOverlay('GAME OVER',
      `<span class="big">${this.score} pontos</span>${headline ? `<br><em>${headline}</em>` : ''}` +
      HighScores.html(pos) +
      `<kbd>Enter</kbd> ou toque para jogar de novo`);
  }

  // Aviso rápido no canto (troca de tema etc.)
  toast(msg) {
    let el = document.getElementById('toast');
    if (!el) { el = document.createElement('div'); el.id = 'toast'; document.body.appendChild(el); }
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => el.classList.remove('show'), 1200);
  }

  // ---------- Loop ----------
  loop(now) {
    const dt = Math.min(100, now - this.last);
    this.last = now;
    if (this.state === 'playing') this.update(dt);
    if (this.flashTimer > 0) { this.flashTimer -= dt; if (this.flashTimer <= 0) this.flashRows = []; }
    this.render();
    requestAnimationFrame(t => this.loop(t));
  }

  update(dt) {
    this.dropTimer += dt;
    const grounded = (() => { const p = this.current.clone(); p.y++; return this.board.collides(p); })();

    if (grounded) {
      this.lockTimer += dt;
      if (this.lockTimer >= LOCK_DELAY) this.lockPiece();
      return;
    }
    const interval = gravityMs(this.level);
    while (this.dropTimer >= interval) {
      this.dropTimer -= interval;
      if (!this.step()) break;
    }
  }

  render() {
    const ghost = this.state === 'playing' ? this.board.dropPosition(this.current) : null;
    // A peça só é exibida sobre o tabuleiro se estamos jogando/pausados (não em ready/over após reset visual)
    const showPiece = this.state !== 'ready';
    drawBoard(this.boardCtx, this.board, showPiece ? this.current : null, ghost, this.flashRows);
    drawHold(this.holdCtx, this.hold, this.canHold);
    drawNext(this.nextCtx, this.bag.peek(NEXT_COUNT));
  }

  updateHud() {
    this.el.score.textContent = this.score;
    this.el.lines.textContent = this.lines;
    this.el.level.textContent = this.level;
    this.el.best.textContent = this.best;
  }

  showOverlay(title, html) {
    this.el.overlay.innerHTML = `<h1>${title}</h1><p>${html}</p>`;
    this.el.overlay.classList.remove('hidden');
  }
}

window.addEventListener('DOMContentLoaded', () => { window.game = new Game(); });
