// Teclado e controles de toque. Traduz eventos em ações do jogo.
const KEYMAP = {
  ArrowLeft: 'left',
  ArrowRight: 'right',
  ArrowDown: 'softDrop',
  ArrowUp: 'rotateCW',
  KeyX: 'rotateCW',
  KeyZ: 'rotateCCW',
  ControlLeft: 'rotateCCW',
  Space: 'hardDrop',
  KeyC: 'hold',
  ShiftLeft: 'hold',
  KeyP: 'pause',
  Escape: 'pause',
  KeyR: 'restart',
  Enter: 'start',
};

// Auto-repeat lateral (DAS): atraso inicial e intervalo
const DAS_DELAY = 170;
const DAS_RATE = 50;

function bindInput(dispatch) {
  const held = new Map(); // action -> timer id

  function startRepeat(action) {
    if (held.has(action)) return;
    dispatch(action);
    const id = setTimeout(() => {
      held.set(action, setInterval(() => dispatch(action), DAS_RATE));
    }, DAS_DELAY);
    held.set(action, id);
  }
  function stopRepeat(action) {
    const id = held.get(action);
    if (id !== undefined) { clearTimeout(id); clearInterval(id); held.delete(action); }
  }

  window.addEventListener('keydown', e => {
    const action = KEYMAP[e.code];
    if (!action) return;
    e.preventDefault();
    if (e.repeat) return;
    if (action === 'left' || action === 'right' || action === 'softDrop') startRepeat(action);
    else dispatch(action);
  });
  window.addEventListener('keyup', e => {
    const action = KEYMAP[e.code];
    if (action) stopRepeat(action);
  });
  window.addEventListener('blur', () => { for (const a of [...held.keys()]) stopRepeat(a); });

  // Botões de toque
  document.querySelectorAll('#touch button').forEach(btn => {
    const action = btn.dataset.action;
    const repeatable = action === 'left' || action === 'right' || action === 'softDrop';
    btn.addEventListener('pointerdown', e => {
      e.preventDefault();
      repeatable ? startRepeat(action) : dispatch(action);
    });
    const end = () => stopRepeat(action);
    btn.addEventListener('pointerup', end);
    btn.addEventListener('pointerleave', end);
    btn.addEventListener('pointercancel', end);
  });

  // Toque/clique no overlay inicia ou reinicia
  document.getElementById('overlay').addEventListener('pointerdown', e => {
    e.preventDefault();
    dispatch('start');
  });
}
