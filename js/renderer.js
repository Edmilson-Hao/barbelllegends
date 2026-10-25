/**
 * Pixel Art renderer using Canvas 2D.
 * Procedural sprites and scenes - no external images required.
 */

const PALETTE = {
  bg: '#0f172a',
  floor: '#1e293b',
  wall: '#334155',
  wood: '#78350f',
  woodLight: '#a16207',
  metal: '#64748b',
  metalDark: '#475569',
  gold: '#fbbf24',
  red: '#ef4444',
  green: '#22c55e',
  blue: '#3b82f6',
  white: '#f8fafc',
  black: '#0a0a0a',
  skin: '#e0ac69',
  hair: '#1a1a1a'
};

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;
    this.w = canvas.width;
    this.h = canvas.height;
    this.frame = 0;
    this.animTimer = 0;
  }

  clear(color = PALETTE.bg) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.w, this.h);
  }

  // Tiny pixel helpers
  px(x, y, color, s = 1) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(Math.floor(x), Math.floor(y), s, s);
  }

  rect(x, y, w, h, color) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(h));
  }

  // ---------- Character Sprite (48x64 scale) ----------
  drawCharacter(x, y, appearance, activity = 'idle', frame = 0, scale = 1) {
    const s = scale;
    const skin = appearance.skin || PALETTE.skin;
    const hair = appearance.hair || PALETTE.hair;
    const shirt = appearance.shirt || '#1e3a5f';
    const gender = appearance.gender || 'M';

    // Bob for idle / work
    let bob = 0;
    if (activity === 'idle' || activity === 'work' || activity === 'study') {
      bob = Math.sin(frame * 0.15) * 1;
    }
    if (activity === 'sleep') bob = 0;

    const bx = x;
    const by = y + bob;

    // Legs
    const legColor = '#1e293b';
    if (activity === 'walk') {
      const legOff = Math.sin(frame * 0.4) * 3;
      this.rect(bx + 10 * s, by + 40 * s, 6 * s, 18 * s, legColor);
      this.rect(bx + 20 * s + legOff, by + 40 * s, 6 * s, 18 * s, legColor);
    } else if (activity === 'squat') {
      // Squatting legs
      this.rect(bx + 6 * s, by + 36 * s, 8 * s, 14 * s, legColor);
      this.rect(bx + 22 * s, by + 36 * s, 8 * s, 14 * s, legColor);
    } else {
      this.rect(bx + 12 * s, by + 40 * s, 6 * s, 18 * s, legColor);
      this.rect(bx + 20 * s, by + 40 * s, 6 * s, 18 * s, legColor);
    }

    // Shoes
    this.rect(bx + 10 * s, by + 56 * s, 8 * s, 4 * s, '#0f172a');
    this.rect(bx + 20 * s, by + 56 * s, 8 * s, 4 * s, '#0f172a');

    // Body / shirt
    let bodyY = by + 20 * s;
    let bodyH = 22 * s;
    if (activity === 'squat') {
      bodyY = by + 24 * s;
      bodyH = 16 * s;
    }
    this.rect(bx + 8 * s, bodyY, 22 * s, bodyH, shirt);

    // Arms
    if (activity === 'bench') {
      // Arms extended
      this.rect(bx + 0 * s, by + 24 * s, 10 * s, 5 * s, skin);
      this.rect(bx + 28 * s, by + 24 * s, 10 * s, 5 * s, skin);
    } else if (activity === 'dead' || activity === 'squat') {
      this.rect(bx + 4 * s, by + 22 * s, 6 * s, 14 * s, skin);
      this.rect(bx + 28 * s, by + 22 * s, 6 * s, 14 * s, skin);
    } else if (activity === 'work' || activity === 'study') {
      // One arm forward
      this.rect(bx + 4 * s, by + 24 * s, 5 * s, 12 * s, skin);
      this.rect(bx + 29 * s, by + 26 * s, 8 * s, 5 * s, skin);
    } else {
      this.rect(bx + 4 * s, by + 22 * s, 5 * s, 14 * s, skin);
      this.rect(bx + 29 * s, by + 22 * s, 5 * s, 14 * s, skin);
    }

    // Head
    this.rect(bx + 12 * s, by + 6 * s, 14 * s, 14 * s, skin);

    // Hair
    this.rect(bx + 11 * s, by + 4 * s, 16 * s, 6 * s, hair);
    if (appearance.hairStyle === 1) {
      this.rect(bx + 10 * s, by + 8 * s, 4 * s, 8 * s, hair);
    } else if (appearance.hairStyle === 2) {
      this.rect(bx + 11 * s, by + 2 * s, 16 * s, 4 * s, hair);
    }

    // Eyes
    this.rect(bx + 15 * s, by + 11 * s, 2 * s, 2 * s, PALETTE.black);
    this.rect(bx + 21 * s, by + 11 * s, 2 * s, 2 * s, PALETTE.black);

    // Mouth (simple)
    if (activity === 'sleep') {
      this.rect(bx + 17 * s, by + 16 * s, 4 * s, 2 * s, '#c084fc'); // zzz hint
    } else {
      this.rect(bx + 17 * s, by + 15 * s, 4 * s, 1 * s, '#9a3412');
    }
  }

  // ---------- Barbell with plates ----------
  drawBarbell(x, y, weightKg, scale = 1) {
    const s = scale;
    // Bar
    this.rect(x, y + 4 * s, 80 * s, 3 * s, PALETTE.metal);

    // Plates based on weight (simplified visual)
    const plates = this.platesForWeight(weightKg);
    let leftX = x - 2 * s;
    let rightX = x + 80 * s;

    for (const p of plates) {
      const color = p.color;
      const h = p.size;
      this.rect(leftX - p.w * s, y + (6 - h / 2) * s, p.w * s, h * s, color);
      this.rect(rightX, y + (6 - h / 2) * s, p.w * s, h * s, color);
      leftX -= p.w * s;
      rightX += p.w * s;
    }

    // Collars
    this.rect(x + 2 * s, y + 2 * s, 4 * s, 7 * s, PALETTE.metalDark);
    this.rect(x + 74 * s, y + 2 * s, 4 * s, 7 * s, PALETTE.metalDark);
  }

  platesForWeight(kg) {
    // Approximate plate visual (not exact loading)
    const plates = [];
    let remaining = Math.max(20, kg - 20); // bar = 20kg
    const sizes = [
      { w: 6, size: 14, color: '#ef4444', val: 25 }, // red 25
      { w: 5, size: 12, color: '#3b82f6', val: 20 }, // blue 20
      { w: 4, size: 10, color: '#eab308', val: 15 }, // yellow 15
      { w: 3, size: 8, color: '#22c55e', val: 10 },  // green 10
      { w: 2, size: 6, color: '#f8fafc', val: 5 },   // white 5
      { w: 2, size: 5, color: '#64748b', val: 2.5 }
    ];
    for (const sz of sizes) {
      while (remaining >= sz.val - 0.1) {
        plates.push(sz);
        remaining -= sz.val;
        if (plates.length > 6) break;
      }
      if (plates.length > 6) break;
    }
    if (plates.length === 0) {
      plates.push({ w: 3, size: 8, color: '#22c55e', val: 10 });
    }
    return plates;
  }

  // ---------- Scenes ----------
  drawHomeScene(char, activity, frame) {
    this.clear('#0f172a');
    // Floor
    this.rect(0, 140, 320, 40, '#1e293b');
    // Wall
    this.rect(0, 0, 320, 140, '#1e3a5f');
    // Window
    this.rect(220, 20, 70, 50, '#0ea5e9');
    this.rect(220, 20, 70, 50, 'rgba(14,165,233,0.3)');
    this.rect(253, 20, 4, 50, '#1e293b');
    this.rect(220, 43, 70, 4, '#1e293b');
    // Bed
    this.rect(20, 100, 80, 40, '#7c3aed');
    this.rect(20, 95, 80, 10, '#a78bfa');
    this.rect(15, 100, 8, 40, '#4c1d95');
    // Desk
    this.rect(130, 110, 60, 8, '#78350f');
    this.rect(135, 118, 6, 25, '#78350f');
    this.rect(180, 118, 6, 25, '#78350f');
    // Chair
    this.rect(145, 125, 20, 6, '#44403c');
    this.rect(148, 118, 4, 10, '#44403c');

    // Character
    let act = activity;
    if (activity === 'sleep') act = 'sleep';
    else if (activity === 'study' || activity === 'work') act = 'study';
    else act = 'idle';

    const cy = activity === 'sleep' ? 85 : 70;
    this.drawCharacter(40, cy, char.appearance, act, frame, 1);

    // Zzz if sleeping
    if (activity === 'sleep') {
      this.ctx.fillStyle = '#c084fc';
      this.ctx.font = '10px monospace';
      this.ctx.fillText('z', 85, 80 - (frame % 20));
      this.ctx.fillText('Z', 92, 70 - (frame % 15));
    }
  }

  drawWorkScene(char, activity, frame) {
    this.clear('#1e293b');
    // Office / store floor
    this.rect(0, 150, 320, 30, '#334155');
    this.rect(0, 0, 320, 150, '#0f172a');

    // Desk / counter
    this.rect(40, 100, 120, 12, '#57534e');
    this.rect(45, 112, 8, 40, '#44403c');
    this.rect(145, 112, 8, 40, '#44403c');

    // Computer monitor
    this.rect(70, 70, 50, 35, '#1e293b');
    this.rect(73, 73, 44, 28, '#22c55e');
    this.rect(90, 105, 10, 8, '#64748b');

    // Shelves (for repositor vibe)
    this.rect(200, 30, 100, 8, '#78716c');
    this.rect(200, 50, 100, 8, '#78716c');
    this.rect(200, 70, 100, 8, '#78716c');
    // Boxes
    this.rect(210, 38, 20, 12, '#b45309');
    this.rect(240, 38, 18, 12, '#b45309');
    this.rect(215, 58, 22, 12, '#a16207');

    this.drawCharacter(60, 70, char.appearance, 'work', frame, 1);
  }

  drawGymScene(char, activity, frame, lifts) {
    this.clear('#111827');
    // Floor
    this.rect(0, 150, 320, 30, '#1f2937');
    // Rubber mat
    this.rect(40, 145, 240, 20, '#0f172a');
    // Wall mirrors
    this.rect(10, 20, 40, 100, '#334155');
    this.rect(12, 22, 36, 96, '#1e3a5f');
    this.rect(270, 20, 40, 100, '#334155');
    this.rect(272, 22, 36, 96, '#1e3a5f');

    // Squat rack
    this.rect(80, 40, 8, 110, PALETTE.metal);
    this.rect(160, 40, 8, 110, PALETTE.metal);
    this.rect(80, 40, 88, 6, PALETTE.metalDark);
    this.rect(80, 80, 88, 4, PALETTE.metal);

    // Bench
    this.rect(200, 120, 70, 10, '#dc2626');
    this.rect(210, 130, 8, 25, '#7f1d1d');
    this.rect(250, 130, 8, 25, '#7f1d1d');

    // Character + barbell
    let act = 'idle';
    let barbellY = 75;
    let charY = 70;
    const weight = lifts ? (lifts.squat?.oneRM || 60) : 60;

    if (activity === 'train') {
      const phase = Math.floor(frame / 8) % 4;
      if (phase === 0) { act = 'idle'; barbellY = 75; }
      else if (phase === 1) { act = 'squat'; barbellY = 90; charY = 78; }
      else if (phase === 2) { act = 'squat'; barbellY = 95; charY = 82; }
      else { act = 'idle'; barbellY = 75; charY = 70; }
    }

    this.drawCharacter(95, charY, char.appearance, act, frame, 1);
    this.drawBarbell(70, barbellY, weight * 0.75, 1);

    // Weight plates on floor
    this.rect(30, 140, 12, 12, '#ef4444');
    this.rect(45, 142, 10, 10, '#3b82f6');
    this.rect(250, 140, 12, 12, '#22c55e');
  }

  drawMenuBackground(frame) {
    this.clear('#0a0f1a');
    // Abstract gym silhouettes
    for (let i = 0; i < 5; i++) {
      const x = 30 + i * 55;
      const h = 40 + Math.sin(frame * 0.05 + i) * 10;
      this.rect(x, 140 - h, 20, h, '#1e293b');
      this.rect(x + 5, 140 - h - 15, 10, 15, '#334155');
    }
    // Floor line
    this.rect(0, 145, 320, 2, '#fbbf24');
    // Floating barbell
    const by = 60 + Math.sin(frame * 0.08) * 5;
    this.drawBarbell(120, by, 140, 1);
  }

  /**
   * Main scene dispatcher
   */
  render(state) {
    this.frame++;
    const { char, activity, scene } = state;

    if (scene === 'menu') {
      this.drawMenuBackground(this.frame);
      return;
    }

    if (scene === 'home' || activity === 'sleep' || activity === 'eat' || activity === 'rest' || activity === 'leisure') {
      this.drawHomeScene(char, activity, this.frame);
    } else if (scene === 'work' || activity === 'work' || activity === 'commute') {
      this.drawWorkScene(char, activity, this.frame);
    } else if (scene === 'gym' || activity === 'train') {
      this.drawGymScene(char, activity, this.frame, char.lifts);
    } else if (activity === 'study') {
      this.drawHomeScene(char, 'study', this.frame);
    } else {
      this.drawHomeScene(char, 'idle', this.frame);
    }
  }

  /**
   * Draw character portrait for generation screen
   */
  drawPortrait(canvas, appearance) {
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Reuse character drawing at larger scale
    const temp = {
      canvas,
      ctx,
      w: canvas.width,
      h: canvas.height,
      frame: 0,
      px: (x, y, c, s = 1) => { ctx.fillStyle = c; ctx.fillRect(x, y, s, s); },
      rect: (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); },
      drawCharacter: this.drawCharacter.bind({ ctx, rect: (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); } })
    };
    // Manual portrait
    const s = 1.5;
    const skin = appearance.skin;
    const hair = appearance.hair;
    const shirt = appearance.shirt;
    const ox = 20, oy = 10;

    // Body
    ctx.fillStyle = shirt;
    ctx.fillRect(ox + 12, oy + 55, 40, 50);
    // Head
    ctx.fillStyle = skin;
    ctx.fillRect(ox + 18, oy + 20, 28, 28);
    // Hair
    ctx.fillStyle = hair;
    ctx.fillRect(ox + 16, oy + 14, 32, 14);
    // Eyes
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(ox + 24, oy + 30, 4, 4);
    ctx.fillRect(ox + 36, oy + 30, 4, 4);
    // Arms
    ctx.fillStyle = skin;
    ctx.fillRect(ox + 4, oy + 58, 10, 30);
    ctx.fillRect(ox + 50, oy + 58, 10, 30);
  }
}
