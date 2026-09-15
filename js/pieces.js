// Tetraminós, rotação e gerador aleatório (7-bag)
const SHAPES = {
  I: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],
  O: [[1,1],[1,1]],
  T: [[0,1,0],[1,1,1],[0,0,0]],
  S: [[0,1,1],[1,1,0],[0,0,0]],
  Z: [[1,1,0],[0,1,1],[0,0,0]],
  J: [[1,0,0],[1,1,1],[0,0,0]],
  L: [[0,0,1],[1,1,1],[0,0,0]],
};

// Deslocamentos testados ao girar (wall kicks simplificados)
const KICKS = [[0,0],[-1,0],[1,0],[0,-1],[-2,0],[2,0],[0,1]];

function rotateMatrix(m, dir) {
  const n = m.length;
  const out = Array.from({ length: n }, () => Array(n).fill(0));
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      if (dir === 1) out[x][n - 1 - y] = m[y][x];   // horário
      else out[n - 1 - x][y] = m[y][x];             // anti-horário
    }
  }
  return out;
}

class Piece {
  constructor(type) {
    this.type = type;
    this.shape = SHAPES[type].map(r => r.slice());
    this.x = Math.floor((COLS - this.shape.length) / 2);
    this.y = type === 'I' ? -1 : 0;
  }
  cells() {
    const out = [];
    this.shape.forEach((row, dy) => row.forEach((v, dx) => {
      if (v) out.push([this.x + dx, this.y + dy]);
    }));
    return out;
  }
  clone() {
    const p = new Piece(this.type);
    p.shape = this.shape.map(r => r.slice());
    p.x = this.x; p.y = this.y;
    return p;
  }
}

class Bag {
  constructor() { this.queue = []; }
  refill() {
    const types = Object.keys(SHAPES);
    for (let i = types.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [types[i], types[j]] = [types[j], types[i]];
    }
    this.queue.push(...types);
  }
  next() {
    if (this.queue.length < 7) this.refill();
    return this.queue.shift();
  }
  peek(n) {
    while (this.queue.length < n) this.refill();
    return this.queue.slice(0, n);
  }
}
