// Desenho no canvas
function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.min(255, Math.max(0, (n >> 16) + amt));
  const g = Math.min(255, Math.max(0, ((n >> 8) & 255) + amt));
  const b = Math.min(255, Math.max(0, (n & 255) + amt));
  return `rgb(${r},${g},${b})`;
}

function drawCell(ctx, x, y, size, color) {
  const pad = Math.max(1, size * 0.06);
  ctx.fillStyle = color;
  ctx.fillRect(x + pad, y + pad, size - pad * 2, size - pad * 2);
  // brilho superior e sombra inferior para dar volume
  ctx.fillStyle = shade(color, 60);
  ctx.fillRect(x + pad, y + pad, size - pad * 2, size * 0.18);
  ctx.fillStyle = shade(color, -60);
  ctx.fillRect(x + pad, y + size - pad - size * 0.18, size - pad * 2, size * 0.18);
}

function drawBoard(ctx, board, current, ghost, flashRows = []) {
  const W = COLS * CELL, H = ROWS * CELL;
  ctx.clearRect(0, 0, W, H);

  // grade de fundo
  ctx.strokeStyle = COLORS.grid;
  ctx.lineWidth = 1;
  for (let x = 1; x < COLS; x++) { ctx.beginPath(); ctx.moveTo(x * CELL, 0); ctx.lineTo(x * CELL, H); ctx.stroke(); }
  for (let y = 1; y < ROWS; y++) { ctx.beginPath(); ctx.moveTo(0, y * CELL); ctx.lineTo(W, y * CELL); ctx.stroke(); }

  // blocos fixos
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const t = board.grid[y][x];
      if (t) drawCell(ctx, x * CELL, y * CELL, CELL, COLORS[t]);
    }
  }

  // linhas em flash (acabaram de completar)
  if (flashRows.length) {
    ctx.fillStyle = 'rgba(255,255,255,.85)';
    for (const y of flashRows) ctx.fillRect(0, y * CELL, W, CELL);
  }

  // ghost
  if (ghost) {
    ctx.fillStyle = COLORS.ghost;
    for (const [x, y] of ghost.cells()) {
      if (y >= 0) ctx.fillRect(x * CELL + 2, y * CELL + 2, CELL - 4, CELL - 4);
    }
  }

  // peça atual
  if (current) {
    for (const [x, y] of current.cells()) {
      if (y >= 0) drawCell(ctx, x * CELL, y * CELL, CELL, COLORS[current.type]);
    }
  }
}

// Desenha uma peça centralizada numa área quadrada (hold / próximas)
function drawMini(ctx, type, ox, oy, box) {
  if (!type) return;
  const shape = SHAPES[type];
  // recorta linhas/colunas vazias para centralizar de verdade
  const rows = shape.filter(r => r.some(v => v));
  const colIdx = [];
  shape[0].forEach((_, i) => { if (shape.some(r => r[i])) colIdx.push(i); });
  const w = colIdx.length, h = rows.length;
  const size = Math.floor(box / 4.5);
  const startX = ox + (box - w * size) / 2;
  const startY = oy + (box - h * size) / 2;
  rows.forEach((row, dy) => colIdx.forEach((ci, dx) => {
    if (row[ci]) drawCell(ctx, startX + dx * size, startY + dy * size, size, COLORS[type]);
  }));
}

function drawHold(ctx, type, canHold) {
  const s = ctx.canvas.width;
  ctx.clearRect(0, 0, s, ctx.canvas.height);
  ctx.globalAlpha = canHold ? 1 : 0.35;
  drawMini(ctx, type, 0, 0, s);
  ctx.globalAlpha = 1;
}

function drawNext(ctx, types) {
  const s = ctx.canvas.width;
  ctx.clearRect(0, 0, s, ctx.canvas.height);
  types.forEach((t, i) => drawMini(ctx, t, 0, i * (s - 10), s));
}
