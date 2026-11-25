// ── Update & Loop ─────────────────────────────────────────
// Game update logic and main render loop.
// Depends on: all other files

function update() {
  if (state === 'gameover') { gameOverTimer++; }
  if (state === 'countdown') {
    countdownTimer++;
    countdownValue = 3 - Math.floor(countdownTimer / 60);
    if (countdownValue !== lastCountdownValue) {
      lastCountdownValue = countdownValue;
      playCountdownTick(countdownValue <= 0);
    }
    if (countdownTimer >= 240) state = 'playing';
    return;
  }
  if (state !== 'playing') return;

  frameCount++;
  if (levelUpTimer > 0) levelUpTimer--;
  cloudX += getSpeed() * 0.35;

  if (frameCount % 155 === 0)  addPipe();
  if (frameCount % 155 === 78) addTNT();

  for (const bird of [p1, p2, p3]) {
    if (!bird.alive) continue;
    bird.vy += GRAVITY; bird.y += bird.vy;
    if (frameCount % 2 === 0) {
      bird.trail.push({ x: bird.x + BIRD_SIZE/2, y: bird.y + BIRD_SIZE/2,
        vx: -getSpeed(), life: 1,
        color: TRAIL_COLS[bird.trailColor++ % TRAIL_COLS.length] });
    }
  }
  for (const bird of [p1, p2, p3]) {
    for (const t of bird.trail) { t.life -= 0.055; t.x += t.vx; }
    bird.trail = bird.trail.filter(t => t.life > 0);
  }

  for (const p of pipes) {
    p.x -= getSpeed();
    let scored = false;
    if (!p.s1 && p1.alive && p1.x > p.x+PIPE_W) { p1.score++; p.s1=true; scored=true; }
    if (!p.s2 && p2.alive && p2.x > p.x+PIPE_W) { p2.score++; p.s2=true; scored=true; }
    if (!p.s3 && p3.alive && p3.x > p.x+PIPE_W) { p3.score++; p.s3=true; scored=true; }
    if (scored) {
      playScore();
      if (level === 1 && Math.max(p1.score, p2.score, p3.score) >= 5) {
        level = 2; levelUpTimer = 150; playLevelUp();
        screenFlash = 0.8; screenFlashColor = '#FFDD00';
      }
    }
  }
  pipes = pipes.filter(p => p.x + PIPE_W > 0);

  for (const t of tntBlocks) {
    t.x -= getSpeed();
    t.y = t.baseY + Math.sin(frameCount * t.bobSpeed + t.bobOff) * t.bobAmp;
  }
  tntBlocks = tntBlocks.filter(t => t.x + t.r > 0);

  for (const p of particles) { p.x+=p.vx; p.y+=p.vy; p.vy+=0.12; p.life-=0.03; }
  particles = particles.filter(p => p.life > 0);

  if (screenFlash > 0) screenFlash -= 0.05;
  for (const b of booms) { b.y+=b.vy; b.life-=0.022; }
  booms = booms.filter(b => b.life > 0);

  checkCollisions(p1); checkCollisions(p2); checkCollisions(p3);
  if (!p1.alive && !p2.alive && !p3.alive && state !== 'gameover') {
    state = 'gameover'; gameOverTimer = 0; playGameOver();
  }
}

function loop() {
  update();
  drawBackground();
  pipes.forEach(level >= 2 ? drawMinecraftPipe : drawCrystalPipe);
  tntBlocks.forEach(level >= 2 ? drawTNTBlock : drawStormCloud);
  drawTrails();
  drawBird(p1); drawBird(p2); drawBird(p3);
  drawParticles();
  drawScreenFlash();
  drawBooms();
  drawLevelUp();
  drawScores();

  if (state === 'idle') {
    const startHint = isMobile ? 'Tik links of rechts om te starten' : 'Druk PIJL, W of SPATIE om te starten';
    drawUnicornBox('~* FLAPPY UNICORN *~', [], [startHint]);
  } else if (state === 'countdown') {
    drawCountdown();
  } else if (state === 'gameover') {
    const max = Math.max(p1.score, p2.score, p3.score);
    const ws = [
      p1.score===max ? 'Floris' : null,
      p2.score===max ? 'Yune'   : null,
      p3.score===max ? 'Lukas'  : null,
    ].filter(Boolean);
    const winText = ws.length > 1 ? 'Gelijkspel!' : `${ws[0]} wint!`;
    const canRestart = gameOverTimer >= GAMEOVER_DELAY;
    const restartLine = canRestart
      ? (isMobile ? 'Tik om opnieuw te spelen' : 'Druk PIJL, W of SPATIE opnieuw')
      : `Wacht ${Math.ceil((GAMEOVER_DELAY - gameOverTimer) / 60)}s...`;
    drawUnicornBox('GAME OVER', [winText], [
      `Floris:${p1.score}  Yune:${p2.score}  Lukas:${p3.score}`,
      restartLine,
    ]);
  }

  requestAnimationFrame(loop);
}

// ── Bootstrap ─────────────────────────────────────────────
resetGame();
loop();
