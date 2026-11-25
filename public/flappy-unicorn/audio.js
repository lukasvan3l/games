// ── Audio ─────────────────────────────────────────────────
// Web Audio API sound effects. No dependencies on game state.

let audioCtx = null;
function ac() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function tone(freq, endFreq, type, vol, dur, delay) {
  const a = ac(), t = a.currentTime + (delay || 0);
  const osc = a.createOscillator(), g = a.createGain();
  osc.connect(g); g.connect(a.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (endFreq !== freq) osc.frequency.exponentialRampToValueAtTime(endFreq, t + dur * 0.75);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  osc.start(t); osc.stop(t + dur);
}

function playFlap() {
  tone(320, 580, 'square', 0.12, 0.07);
}
function playScore() {
  tone(660, 880, 'sine', 0.18, 0.12);
}
function playDeath(isBig) {
  if (isBig) {
    tone(180, 55, 'sawtooth', 0.4, 0.7);
    tone(90,  35, 'square',   0.25, 0.9, 0.05);
  } else {
    tone(380, 120, 'sawtooth', 0.3, 0.35);
    tone(200, 80,  'square',   0.2, 0.4, 0.04);
  }
}
function playCountdownTick(isGo) {
  if (isGo) {
    tone(523, 784, 'sine', 0.28, 0.25);
    tone(659, 784, 'sine', 0.18, 0.25, 0.06);
  } else {
    tone(440, 440, 'sine', 0.2, 0.1);
  }
}
function playGameOver() {
  [523, 415, 330, 262].forEach((f, i) => tone(f, f, 'sine', 0.2, 0.22, i * 0.18));
}
function playLevelUp() {
  [330, 440, 523, 660, 880].forEach((f, i) => tone(f, f, 'sine', 0.28, 0.15, i * 0.09));
}
