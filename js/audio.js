// Efeitos sonoros sintetizados com WebAudio (sem arquivos)
const Sound = (() => {
  let ctx;
  function tone(freq, dur, type = 'square', vol = 0.06) {
    try {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type;
      o.frequency.value = freq;
      g.gain.setValueAtTime(vol, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
      o.connect(g).connect(ctx.destination);
      o.start();
      o.stop(ctx.currentTime + dur);
    } catch (_) { /* áudio bloqueado ou indisponível */ }
  }
  return {
    move:   () => tone(220, 0.03, 'square', 0.03),
    rotate: () => tone(440, 0.05, 'triangle'),
    lock:   () => tone(160, 0.08, 'sawtooth', 0.05),
    hard:   () => tone(120, 0.12, 'sawtooth', 0.07),
    hold:   () => tone(660, 0.06, 'triangle'),
    clear:  (n) => { for (let i = 0; i < n; i++) setTimeout(() => tone(520 + i * 120, 0.12, 'triangle', 0.07), i * 60); },
    tetris: () => [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => tone(f, 0.18, 'triangle', 0.08), i * 80)),
    level:  () => [392, 523, 659].forEach((f, i) => setTimeout(() => tone(f, 0.15, 'square', 0.05), i * 100)),
    over:   () => [400, 300, 200, 120].forEach((f, i) => setTimeout(() => tone(f, 0.25, 'sawtooth', 0.07), i * 150)),
  };
})();
