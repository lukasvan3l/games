// ── State ─────────────────────────────────────────────────
// All mutable game state variables.
// Depends on: constants.js (PIPE_SPEED, GAP)

let state = 'idle';
let pipes = [], tntBlocks = [], particles = [], booms = [];
let frameCount = 0;
let screenFlash = 0, screenFlashColor = '#FF9ECD';
let countdownTimer = 0, countdownValue = 3, lastCountdownValue = -1;
let gameOverTimer = 0;
let level = 1, levelUpTimer = 0;
let p1, p2, p3;
let cloudX = 0;

const clouds = [
  { x: 60,  y: 55, w: 72, h: 28 },
  { x: 210, y: 38, w: 88, h: 32 },
  { x: 370, y: 65, w: 60, h: 24 },
  { x: 530, y: 42, w: 76, h: 30 },
];

function getSpeed() { return PIPE_SPEED; }
function getGap()   { return GAP - (level >= 2 ? 40 : 0); }
