// ── Constants ─────────────────────────────────────────────
// Canvas setup, physics tuning, and shared color palettes.
// Loaded first — no dependencies.

const canvas = document.getElementById('gameCanvas');
const ctx    = canvas.getContext('2d');
const W = canvas.width, H = canvas.height;

const GRAVITY      = 0.13;
const FLAP_FORCE   = -5.8;
const PIPE_W       = 64;
const GAP          = 265;
const PIPE_SPEED   = 1.6;
const BIRD_SIZE    = 24;
const GAMEOVER_DELAY = 180;

const RAINBOW    = ['#FF6B6B','#FFD166','#06D6A0','#74C0FC','#C77DFF'];
const TRAIL_COLS = ['#FF6B6B','#FFD166','#06D6A0','#74C0FC','#C77DFF','#FF9ECD'];
