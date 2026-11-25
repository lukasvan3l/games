// ── Game logic ────────────────────────────────────────────
// Init, input, spawning, collision, explosions.
// Depends on: constants.js, audio.js, state.js

// ── Init ──────────────────────────────────────────────────

function createBird(x, yOff, type) {
  return { x, y: H / 2 + yOff, vy: 0, alive: true, score: 0, type, trail: [], trailColor: 0 };
}
function resetGame() {
  pipes = []; tntBlocks = []; particles = []; booms = [];
  frameCount = 0; cloudX = 0; screenFlash = 0; level = 1; levelUpTimer = 0;
  p1 = createBird(85,  -20, 'white');
  p3 = createBird(110,   0, 'pink');
  p2 = createBird(135,  20, 'purple');
}
function startCountdown() {
  resetGame(); state = 'countdown'; countdownValue = 3; countdownTimer = 0; lastCountdownValue = -1;
}

// ── Input ─────────────────────────────────────────────────

const isMobile = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

document.addEventListener('keydown', e => {
  if (!['ArrowUp','KeyW','Space'].includes(e.code)) return;
  e.preventDefault();
  if (state === 'idle') { startCountdown(); return; }
  if (state === 'gameover' && gameOverTimer >= GAMEOVER_DELAY) { startCountdown(); return; }
  if (state === 'playing') {
    if (e.code === 'ArrowUp') flap(p1);
    if (e.code === 'KeyW')    flap(p2);
    if (e.code === 'Space')   flap(p3);
  }
});

function handleTouchInput(bird) {
  if (state === 'idle') { startCountdown(); return; }
  if (state === 'gameover' && gameOverTimer >= GAMEOVER_DELAY) { startCountdown(); return; }
  if (state === 'playing') flap(bird);
}

document.getElementById('touchLeft').addEventListener('touchstart', e => {
  e.preventDefault();
  handleTouchInput(p1);
}, { passive: false });

document.getElementById('touchRight').addEventListener('touchstart', e => {
  e.preventDefault();
  handleTouchInput(p2);
}, { passive: false });

function flap(bird) {
  if (!bird.alive) return;
  bird.vy = FLAP_FORCE;
  playFlap();
  for (let i = 0; i < 5; i++) particles.push({
    x: bird.x, y: bird.y + BIRD_SIZE / 2,
    vx: -1 - Math.random() * 2, vy: (Math.random() - 0.5) * 2,
    life: 1, size: 4 + Math.random() * 4,
    color: ['#FF9ECD','#C77DFF','#74C0FC','#FFDD00'][Math.floor(Math.random()*4)],
  });
}

// ── Spawning ──────────────────────────────────────────────

function addPipe() {
  const gap = getGap();
  const topH = 70 + Math.random() * (H - gap - 130);
  pipes.push({ x: W, topH, gap, s1: false, s2: false, s3: false });
}
function addTNT() {
  const r = 18 + Math.random() * 12;
  const baseY = r + 55 + Math.random() * (H - 2 * r - 115);
  tntBlocks.push({
    x: W + r, baseY, y: baseY, r,
    bobSpeed: 0.010 + Math.random() * 0.008,
    bobAmp:   22 + Math.random() * 25,
    bobOff:   Math.random() * Math.PI * 2,
  });
}

// ── Collision ─────────────────────────────────────────────

function rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

function explode(x, y, isBig) {
  const count = isBig ? 45 : 28;
  const spd   = isBig ? 9  : 5.5;
  const colors = ['#FF6B6B','#FFD166','#06D6A0','#C77DFF','#FF9ECD','#FFFFFF','#74C0FC','#FFDD00'];
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2 + Math.random() * 0.4;
    const s = spd * (0.3 + Math.random());
    particles.push({
      x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - (isBig ? 1.5 : 0),
      life: 1, size: isBig ? 9 + Math.random() * 10 : 5 + Math.random() * 7,
      color: colors[Math.floor(Math.random() * colors.length)],
    });
  }
  playDeath(isBig);
  screenFlash = isBig ? 1.0 : 0.55;
  screenFlashColor = isBig ? '#C77DFF' : '#FF9ECD';
  booms.push({ x, y, vy: -1.2, life: 1,
    text: isBig ? 'BOOM!' : 'CRASH!',
    color: isBig ? '#FFDD00' : '#FF9ECD' });
}

function checkCollisions(bird) {
  if (!bird.alive) return;
  if (bird.y + BIRD_SIZE > H - 28 || bird.y < 0) {
    bird.alive = false;
    explode(bird.x + BIRD_SIZE/2, Math.min(Math.max(bird.y, 10), H-38), false);
    return;
  }
  for (const p of pipes) {
    if (rectsOverlap(bird.x, bird.y, BIRD_SIZE, BIRD_SIZE, p.x, 0, PIPE_W, p.topH) ||
        rectsOverlap(bird.x, bird.y, BIRD_SIZE, BIRD_SIZE, p.x, p.topH + p.gap, PIPE_W, H)) {
      bird.alive = false; explode(bird.x + BIRD_SIZE/2, bird.y + BIRD_SIZE/2, false); return;
    }
  }
  for (const t of tntBlocks) {
    if (rectsOverlap(bird.x, bird.y, BIRD_SIZE, BIRD_SIZE, t.x-t.r, t.y-t.r, t.r*2, t.r*2)) {
      bird.alive = false; explode(bird.x + BIRD_SIZE/2, bird.y + BIRD_SIZE/2, true); return;
    }
  }
}
