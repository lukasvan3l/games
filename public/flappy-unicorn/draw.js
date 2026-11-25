// ── Drawing ───────────────────────────────────────────────
// All canvas draw functions: background, pipes, obstacles, sprites, effects, UI.
// Depends on: constants.js (ctx, W, H, PIPE_W, BIRD_SIZE, RAINBOW, TRAIL_COLS)
//             state.js (level, clouds, cloudX, screenFlash, screenFlashColor,
//                       levelUpTimer, countdownTimer, countdownValue,
//                       p1, p2, p3, pipes, tntBlocks, particles, booms)

// ── Background ────────────────────────────────────────────

function drawBackground() {
  if (level >= 2) {
    // Minecraft sky
    ctx.fillStyle = '#7AAFD4'; ctx.fillRect(0, 0, W, H);

    // Blocky Minecraft clouds
    for (const c of clouds) {
      const x = ((c.x - cloudX) % (W + 130) + (W + 130)) % (W + 130) - 65;
      ctx.fillStyle = '#F4F4F4';
      ctx.fillRect(x, c.y, c.w, c.h);
      ctx.fillRect(x + 8, c.y - 8, c.w - 16, 8);
      ctx.fillStyle = '#CCCCCC';
      ctx.fillRect(x, c.y + c.h - 4, c.w, 4);
    }

    // Minecraft grass + dirt ground
    ctx.fillStyle = '#5D8C3C'; ctx.fillRect(0, H - 28, W, 8);
    ctx.fillStyle = '#6DB33F';
    for (let gx = 0; gx < W; gx += 16) ctx.fillRect(gx, H - 28, 8, 4);
    ctx.fillStyle = '#8B6914'; ctx.fillRect(0, H - 20, W, 20);
    ctx.fillStyle = '#6B4E11';
    for (let gx = 0; gx < W; gx += 8) {
      for (let gy = H - 20; gy < H; gy += 8) {
        if ((Math.floor(gx/8) + Math.floor(gy/8)) % 3 === 0) ctx.fillRect(gx, gy, 8, 8);
      }
    }
  } else {
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#FFD6EC'); sky.addColorStop(0.5, '#E8C8FF'); sky.addColorStop(1, '#C8E8FF');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);

    // Fluffy clouds with rainbow stripe
    for (const c of clouds) {
      const x = ((c.x - cloudX) % (W + 130) + (W + 130)) % (W + 130) - 65;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(x, c.y, c.w, c.h);
      ctx.fillRect(x + c.w*0.18, c.y - c.h*0.45, c.w*0.38, c.h*0.5);
      ctx.fillRect(x + c.w*0.42, c.y - c.h*0.70, c.w*0.30, c.h*0.70);
      RAINBOW.forEach((col, i) => {
        ctx.globalAlpha = 0.45;
        ctx.fillStyle = col;
        ctx.fillRect(x + i * (c.w / 5), c.y + c.h - 5, c.w / 5 + 1, 5);
      });
      ctx.globalAlpha = 1;
    }

    // Candy-colored ground
    RAINBOW.forEach((col, i) => {
      ctx.fillStyle = col;
      ctx.fillRect(i * W / 5, H - 28, W / 5 + 1, 10);
    });
    ctx.fillStyle = '#A8E6CF'; ctx.fillRect(0, H - 18, W, 18);
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    for (let x = 8; x < W; x += 16) ctx.fillRect(x, H - 14, 5, 5);
  }
}

// ── Pipes ─────────────────────────────────────────────────

function drawCrystalPipe(pipe) {
  const S = 8;
  const cols = ['#FF9ECD','#C77DFF','#74C0FC','#FFD166','#06D6A0'];

  // Top pipe
  for (let y = 0; y < pipe.topH - 18; y += S) {
    ctx.fillStyle = cols[Math.floor(y / S) % cols.length];
    ctx.fillRect(pipe.x, y, PIPE_W, S);
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.fillRect(pipe.x + 3, y + 1, 5, S - 2);
  }
  // Cap
  ctx.fillStyle = '#FF9ECD'; ctx.fillRect(pipe.x - 7, pipe.topH - 18, PIPE_W + 14, 18);
  ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.fillRect(pipe.x - 7, pipe.topH - 18, PIPE_W + 14, 5);
  ctx.fillStyle = '#FF6BB5'; ctx.fillRect(pipe.x - 7, pipe.topH - 6, PIPE_W + 14, 6);

  // Bottom pipe
  const botY = pipe.topH + pipe.gap;
  for (let y = botY + 18; y < H - 28; y += S) {
    ctx.fillStyle = cols[Math.floor(y / S) % cols.length];
    ctx.fillRect(pipe.x, y, PIPE_W, S);
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.fillRect(pipe.x + 3, y + 1, 5, S - 2);
  }
  ctx.fillStyle = '#C77DFF'; ctx.fillRect(pipe.x - 7, botY, PIPE_W + 14, 18);
  ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.fillRect(pipe.x - 7, botY, PIPE_W + 14, 5);
  ctx.fillStyle = '#9B4FCC'; ctx.fillRect(pipe.x - 7, botY + 12, PIPE_W + 14, 6);
}

function drawMinecraftPipe(pipe) {
  const BS = 8;
  function cobble(px, py, pw, ph) {
    for (let cy = py; cy < py + ph; cy += BS) {
      for (let cx = px; cx < px + pw; cx += BS) {
        const shade = (Math.floor(cx/BS) + Math.floor(cy/BS)) % 3;
        ctx.fillStyle = shade === 0 ? '#8A8A8A' : shade === 1 ? '#787878' : '#9A9A9A';
        ctx.fillRect(cx, cy, Math.min(BS, px+pw-cx), Math.min(BS, py+ph-cy));
      }
    }
    ctx.fillStyle = '#606060';
    for (let cy = py; cy < py + ph; cy += BS) ctx.fillRect(px, cy, pw, 1);
    for (let cx = px; cx < px + pw; cx += BS) ctx.fillRect(cx, py, 1, ph);
  }

  // Top pipe body
  cobble(pipe.x, 0, PIPE_W, Math.max(0, pipe.topH - 12));
  // Top cap (moss stone)
  ctx.fillStyle = '#7A8A6A'; ctx.fillRect(pipe.x - 6, pipe.topH - 12, PIPE_W + 12, 12);
  ctx.fillStyle = '#9AAA8A'; ctx.fillRect(pipe.x - 6, pipe.topH - 12, PIPE_W + 12, 3);
  ctx.fillStyle = '#4A5A3A'; ctx.fillRect(pipe.x - 6, pipe.topH - 3,  PIPE_W + 12, 3);

  // Bottom cap
  const botY = pipe.topH + pipe.gap;
  ctx.fillStyle = '#7A8A6A'; ctx.fillRect(pipe.x - 6, botY,      PIPE_W + 12, 12);
  ctx.fillStyle = '#9AAA8A'; ctx.fillRect(pipe.x - 6, botY,      PIPE_W + 12, 3);
  ctx.fillStyle = '#4A5A3A'; ctx.fillRect(pipe.x - 6, botY + 9,  PIPE_W + 12, 3);
  // Bottom pipe body
  cobble(pipe.x, botY + 12, PIPE_W, Math.max(0, H - 28 - (botY + 12)));
}

// ── Obstacles ─────────────────────────────────────────────

function drawTNTBlock(t) {
  const s = t.r, x = t.x - s, y = t.y - s, w = s*2, h = s*2;
  // Red sides
  ctx.fillStyle = '#CE2030'; ctx.fillRect(x, y, w, h);
  // Grey top/bottom bands
  ctx.fillStyle = '#888888';
  ctx.fillRect(x, y,           w, h * 0.28);
  ctx.fillRect(x, y + h*0.72,  w, h * 0.28);
  // White pixel highlights on grey bands
  ctx.fillStyle = '#AAAAAA';
  ctx.fillRect(x + 2, y + 2, w - 4, 2);
  ctx.fillRect(x + 2, y + h*0.72 + 2, w - 4, 2);
  // "TNT" label
  ctx.save();
  ctx.font = `bold ${Math.max(8, Math.floor(s * 0.85))}px 'Courier New'`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = '#440000'; ctx.fillText('TNT', t.x + 1, t.y + 1);
  ctx.fillStyle = '#FFFFFF'; ctx.fillText('TNT', t.x, t.y);
  ctx.restore(); ctx.textBaseline = 'alphabetic';
}

function drawStormCloud(t) {
  const r = t.r, x = t.x, y = t.y;
  // Glow
  ctx.globalAlpha = 0.3;
  ctx.fillStyle = '#8B00FF';
  ctx.beginPath(); ctx.arc(x, y, r * 1.6, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;
  // Cloud puffs
  ctx.fillStyle = '#4A306A';
  ctx.fillRect(x - r*0.5, y - r, r*1.0, r*1.8);
  ctx.fillRect(x - r,     y - r*0.4, r*2, r*1.2);
  ctx.fillRect(x - r*0.8, y - r*0.8, r*0.8, r*0.8);
  ctx.fillRect(x + r*0.1, y - r*0.9, r*0.8, r*0.8);
  // Highlight top
  ctx.fillStyle = '#6A45AA';
  ctx.fillRect(x - r*0.4, y - r, r*0.8, r*0.3);
  // Lightning bolt (yellow zigzag)
  ctx.fillStyle = '#FFDD00';
  ctx.fillRect(x - 2, y - r*0.2, 5, r*0.4);
  ctx.fillRect(x - 5, y + r*0.2, 5, r*0.4);
  ctx.fillRect(x - 2, y + r*0.55, 4, r*0.3);
  // Warning ring
  ctx.strokeStyle = 'rgba(180,80,255,0.4)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(x, y, r * 1.25, 0, Math.PI * 2); ctx.stroke();
}

// ── Sprites ───────────────────────────────────────────────

function drawToucan(cx, cy, size, angle) {
  const s = size / 8;
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(angle);

  // Black body
  ctx.fillStyle = '#111111';
  ctx.fillRect(-size/2, -size/2, size, size);
  // Cream/white chest
  ctx.fillStyle = '#FFFDE7';
  ctx.fillRect(-size/2 + s, s*0.5, size*0.55, size/2 - s);
  // Yellow throat
  ctx.fillStyle = '#FFD600';
  ctx.fillRect(-size/2 + s, -s*1.5, size*0.5, s*2);
  // Beak base (red)
  ctx.fillStyle = '#FF3D00';
  ctx.fillRect(size/2 - s, -size/4, s*2, size/2);
  // Beak middle (orange)
  ctx.fillStyle = '#FF9100';
  ctx.fillRect(size/2 + s, -size/4 + s*0.5, s*3, size/2 - s);
  // Beak front (yellow)
  ctx.fillStyle = '#FFD600';
  ctx.fillRect(size/2 + s*4, -size/4 + s, s*2, size/2 - s*2);
  // Beak tip
  ctx.fillStyle = '#FF6D00';
  ctx.fillRect(size/2 + s*6, -size/4 + s*1.5, s, size/2 - s*3);
  // Lower beak divider
  ctx.fillStyle = '#222222';
  ctx.fillRect(size/2, size/4 - s*0.5, s*7, s*0.5);
  // Eye ring (teal)
  ctx.fillStyle = '#00BCD4';
  ctx.fillRect(-size/2 + s*1.5, -size/2 + s*1.5, s*2.5, s*2.5);
  // Eye (black)
  ctx.fillStyle = '#111111';
  ctx.fillRect(-size/2 + s*2, -size/2 + s*2, s*1.5, s*1.5);
  // Eye shine
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(-size/2 + s*2, -size/2 + s*2, s*0.6, s*0.6);

  ctx.restore();
}

function drawUnicorn(cx, cy, size, angle, faceCol, hornCol, mane1, mane2) {
  const s = size / 8;
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(angle);

  // Mane behind face (left side strips)
  ctx.fillStyle = mane1;
  ctx.fillRect(-size/2 - s*0.5, -size/2, s*2, size);
  ctx.fillStyle = mane2;
  ctx.fillRect(-size/2 - s*0.5, -size/2 + s*2, s*2, s*2);
  ctx.fillRect(-size/2 - s*0.5, -size/2 + s*6, s*2, s*2);
  // Face
  ctx.fillStyle = faceCol; ctx.fillRect(-size/2, -size/2, size, size);
  // Horn
  ctx.fillStyle = hornCol;
  ctx.fillRect(-s*0.5, -size/2 - s*3.5, s,   s*2.5);   // tip
  ctx.fillRect(-s,     -size/2 - s*1.5,  s*2, s*1.5);   // base
  ctx.fillStyle = 'rgba(255,255,255,0.65)';
  ctx.fillRect(-s*0.15, -size/2 - s*3.2, s*0.4, s*2.8); // shine
  // Eyes
  ctx.fillStyle = '#1A1030';
  ctx.fillRect(-size/2 + s*1.5, -size/2 + s*2.8, s*2, s*2.5);
  ctx.fillRect(-size/2 + s*4.5, -size/2 + s*2.8, s*2, s*2.5);
  ctx.fillStyle = '#fff';
  ctx.fillRect(-size/2 + s*1.7, -size/2 + s*3.0, s*0.7, s*0.7);
  ctx.fillRect(-size/2 + s*4.7, -size/2 + s*3.0, s*0.7, s*0.7);
  // Blush
  ctx.fillStyle = 'rgba(255,120,160,0.55)';
  ctx.fillRect(-size/2 + s*0.8, -size/2 + s*5.2, s*1.3, s*0.8);
  ctx.fillRect(-size/2 + s*5.9, -size/2 + s*5.2, s*1.3, s*0.8);
  // Smile
  ctx.fillStyle = '#DD6699';
  ctx.fillRect(-size/2 + s*2.5, -size/2 + s*6.8, s*3, s*0.5);

  ctx.restore();
}

function drawBird(bird) {
  if (!bird.alive) return;
  const cx = bird.x + BIRD_SIZE / 2, cy = bird.y + BIRD_SIZE / 2;
  const angle = Math.min(Math.max(bird.vy * 3.5, -25), 70) * Math.PI / 180;
  if (bird.type === 'white')  drawToucan(cx, cy, BIRD_SIZE, angle);
  if (bird.type === 'pink')   drawUnicorn(cx, cy, BIRD_SIZE, angle, '#FFB6C1', '#74C0FC', '#FFDD00', '#FF6BB5');
  if (bird.type === 'purple') drawUnicorn(cx, cy, BIRD_SIZE, angle, '#D8B4FE', '#FFDD00', '#FF9ECD', '#06D6A0');
}

// ── Effects ───────────────────────────────────────────────

function drawScreenFlash() {
  if (screenFlash <= 0) return;
  ctx.globalAlpha = screenFlash * 0.4;
  ctx.fillStyle = screenFlashColor;
  ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = 1;
}

function drawTrails() {
  for (const bird of [p1, p2, p3]) {
    for (const t of bird.trail) {
      ctx.globalAlpha = t.life * 0.75;
      ctx.fillStyle = t.color;
      const s = t.life * BIRD_SIZE * 1.3;
      ctx.fillRect(t.x - s/2, t.y - s/2, s, s);
    }
  }
  ctx.globalAlpha = 1;
}

function drawParticles() {
  for (const p of particles) {
    ctx.globalAlpha = p.life;
    const s = Math.max(1, (p.size || 4) * p.life);
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x - s/2, p.y - s/2, s, s);
  }
  ctx.globalAlpha = 1;
}

function drawBooms() {
  for (const b of booms) {
    ctx.save(); ctx.globalAlpha = b.life;
    ctx.translate(b.x, b.y);
    ctx.scale(0.6 + (1 - b.life) * 1.2, 0.6 + (1 - b.life) * 1.2);
    ctx.font = "bold 34px 'Courier New'";
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = '#330033'; ctx.fillText(b.text, 3, 3);
    ctx.fillStyle = b.color;  ctx.fillText(b.text, 0, 0);
    ctx.restore();
  }
  ctx.globalAlpha = 1; ctx.textBaseline = 'alphabetic';
}

// ── HUD & UI ──────────────────────────────────────────────

function drawScores() {
  const players = [
    { b: p1, name: 'Floris', color: '#FFD6EC', align: 'left',   x: 12 },
    { b: p2, name: 'Yune',   color: '#D8B4FE', align: 'center', x: W / 2 },
    { b: p3, name: 'Lukas',  color: '#74C0FC', align: 'right',  x: W - 12 },
  ];
  for (const { b, name, color, align, x } of players) {
    ctx.font = 'bold 14px Courier New'; ctx.textAlign = align;
    ctx.fillStyle = 'rgba(80,0,80,0.7)'; ctx.fillText(`${name}: ${b.score}`, x+2, 32);
    ctx.fillStyle = color; ctx.fillText(`${name}: ${b.score}`, x, 30);
    if (!b.alive) {
      ctx.font = 'bold 11px Courier New';
      ctx.fillStyle = '#660033'; ctx.fillText('DOOD', x+1, 47);
      ctx.fillStyle = '#FF4488'; ctx.fillText('DOOD', x, 46);
    }
  }
}

function drawStar(cx, cy, r, color) {
  ctx.fillStyle = color;
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
    const ai = a + Math.PI / 5;
    ctx.fillRect(cx + Math.cos(a)*r - 2, cy + Math.sin(a)*r - 2, 5, 5);
    ctx.fillRect(cx + Math.cos(ai)*(r*0.4) - 1, cy + Math.sin(ai)*(r*0.4) - 1, 3, 3);
  }
}

function drawUnicornBox(title, lines, sub) {
  ctx.fillStyle = 'rgba(60,0,80,0.65)'; ctx.fillRect(0, 0, W, H);
  const bw = 340, bh = 60 + lines.length * 36 + sub.length * 22 + 24;
  const bx = (W - bw) / 2, by = (H - bh) / 2 - 20;

  // Pink-purple brick pattern
  const BS = 18;
  for (let row = 0; row * (BS/2) < bh + BS; row++) {
    const off = row % 2 === 0 ? 0 : BS/2;
    for (let col = -1; col * BS < bw + BS; col++) {
      const rx = bx + col*BS + off, ry = by + row*(BS/2);
      if (rx+BS > bx && rx < bx+bw && ry+BS/2 > by && ry < by+bh) {
        ctx.fillStyle = row % 3 === 0 ? '#7B3FA0' : '#6A3088';
        ctx.fillRect(Math.max(bx,rx)+1, Math.max(by,ry)+1,
          Math.min(BS-2, bx+bw-rx-1), Math.min(BS/2-2, by+bh-ry-1));
      }
    }
  }
  ctx.fillStyle = 'rgba(40,0,60,0.72)'; ctx.fillRect(bx, by, bw, bh);
  ctx.strokeStyle = '#FF9ECD'; ctx.lineWidth = 3; ctx.strokeRect(bx, by, bw, bh);
  ctx.strokeStyle = '#C77DFF'; ctx.lineWidth = 1; ctx.strokeRect(bx+3, by+3, bw-6, bh-6);

  drawStar(bx+14,      by+14,      8, '#FFDD00');
  drawStar(bx+bw-14,   by+14,      8, '#FFDD00');
  drawStar(bx+14,      by+bh-14,   8, '#FFDD00');
  drawStar(bx+bw-14,   by+bh-14,   8, '#FFDD00');

  ctx.textAlign = 'center';
  ctx.font = "bold 22px 'Courier New'";
  ctx.fillStyle = '#660033'; ctx.fillText(title, W/2+2, by+42);
  ctx.fillStyle = '#FF9ECD'; ctx.fillText(title, W/2, by+40);
  ctx.font = "bold 16px 'Courier New'";
  lines.forEach((l, i) => {
    ctx.fillStyle = '#330033'; ctx.fillText(l, W/2+1, by+40+(i+1)*34+1);
    ctx.fillStyle = '#FFFFFF'; ctx.fillText(l, W/2, by+40+(i+1)*34);
  });
  ctx.font = "12px 'Courier New'"; ctx.fillStyle = '#D8B4FE';
  sub.forEach((l, i) => ctx.fillText(l, W/2, by+40+lines.length*34+18+i*22));
}

function drawLevelUp() {
  if (levelUpTimer <= 0) return;
  const t = levelUpTimer / 150;
  const pulse = 1 + 0.15 * Math.sin(levelUpTimer * 0.25);
  ctx.save(); ctx.translate(W/2, H/2 - 40); ctx.scale(pulse, pulse);
  ctx.globalAlpha = Math.min(t * 3, 1);
  ctx.font = "bold 52px 'Courier New'";
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = '#330033'; ctx.fillText('NIVEAU 2!', 3, 3);
  ctx.fillStyle = '#FFDD00'; ctx.fillText('NIVEAU 2!', 0, 0);
  ctx.font = "bold 18px 'Courier New'";
  ctx.fillStyle = '#FF9ECD'; ctx.fillText('KLEINER GAT!', 0, 46);
  ctx.restore();
  ctx.globalAlpha = 1; ctx.textBaseline = 'alphabetic';
}

function drawCountdown() {
  const label = countdownValue > 0 ? String(countdownValue) : 'GO!';
  const pulse = 1 + 0.1 * Math.sin(countdownTimer * 0.18);
  ctx.save(); ctx.translate(W/2, H/2-20); ctx.scale(pulse, pulse);
  ctx.font = "bold 88px 'Courier New'";
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = '#660033'; ctx.fillText(label, 4, 4);
  ctx.fillStyle = countdownValue > 0 ? '#FF9ECD' : '#74C0FC';
  ctx.fillText(label, 0, 0);
  ctx.restore(); ctx.textBaseline = 'alphabetic';
}
