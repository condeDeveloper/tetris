// Tabuleiro: grade, colisão, travamento e limpeza de linhas
class Board {
  constructor() { this.reset(); }

  reset() {
    this.grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
  }

  // Célula ocupada ou fora dos limites laterais/inferior. Acima do topo é permitido.
  collides(piece) {
    return piece.cells().some(([x, y]) =>
      x < 0 || x >= COLS || y >= ROWS || (y >= 0 && this.grid[y][x])
    );
  }

  // Fixa a peça na grade. Retorna true se alguma célula ficou acima do topo (game over).
  lock(piece) {
    let above = false;
    for (const [x, y] of piece.cells()) {
      if (y < 0) above = true;
      else this.grid[y][x] = piece.type;
    }
    return above;
  }

  // Remove linhas completas e devolve quantas foram limpas e seus índices.
  clearLines() {
    const cleared = [];
    for (let y = ROWS - 1; y >= 0; y--) {
      if (this.grid[y].every(c => c)) {
        cleared.push(y);
        this.grid.splice(y, 1);
        this.grid.unshift(Array(COLS).fill(null));
        y++; // a linha de cima desceu para este índice, reavaliar
      }
    }
    return cleared;
  }

  // Posição final se a peça caísse direto (para ghost e hard drop)
  dropPosition(piece) {
    const p = piece.clone();
    while (!this.collides(p)) p.y++;
    p.y--;
    return p;
  }
}
