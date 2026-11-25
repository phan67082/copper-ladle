// The Copper Ladle — the renderer: every pixel of the kitchen, drawn on one
// canvas with plain shapes. No images, no fonts from the network.
import { INGREDIENT_BY_ID, LAYOUT, RECIPES, VIEW } from './config.js';
import { comboOf } from './world.js';

const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = "Verdana, Geneva, sans-serif";

// Geometry the pointer code shares: where each ticket and bin sits.
export function ticketRect(index) {
  return { x: LAYOUT.board.x + 16, y: LAYOUT.board.y + 30 + index * 124, w: LAYOUT.ticket.w, h: LAYOUT.ticket.h };
}
export function binRect(index) {
  const w = LAYOUT.counter.w / 8;
  return { x: LAYOUT.counter.x + index * w, y: LAYOUT.counter.y, w, h: LAYOUT.counter.h };
}
export function grillSlotRect(slot) {
  return { x: LAYOUT.grill.x + 25 + slot * 135, y: LAYOUT.grill.y + 32, w: 120, h: 110 };
}
export function chopRect() {
  return { x: LAYOUT.chop.x + 25, y: LAYOUT.chop.y + 32, w: 210, h: 118 };
}
export function plateRect() {
  return { x: LAYOUT.plate.x, y: LAYOUT.plate.y, w: LAYOUT.plate.w, h: LAYOUT.plate.h };
}
export function passRect() {
  return { x: LAYOUT.pass.x, y: LAYOUT.pass.y, w: LAYOUT.pass.w, h: LAYOUT.pass.h };
}

// --- tiny drawing helpers -------------------------------------------------
function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
function text(ctx, s, x, y, font, colour, align = 'left') {
  ctx.font = font;
  ctx.fillStyle = colour;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(s, x, y);
}
function circle(ctx, x, y, r, colour) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = colour;
  ctx.fill();
}

// One ingredient, drawn as a little dish of itself. Size is its diameter.
export function drawIngredient(ctx, id, x, y, size, opts = {}) {
  const ing = INGREDIENT_BY_ID[id];
  const r = size / 2;
  const wobble = opts.wobble ?? 0;
  ctx.save();
  ctx.translate(x, y + Math.sin(wobble) * 1.5);
  if (id === 'bun') {
    ctx.fillStyle = ing.dark; rr(ctx, -r, -r * 0.15, size, r * 0.55, r * 0.2); ctx.fill();
    ctx.fillStyle = ing.base;
    ctx.beginPath(); ctx.arc(0, -r * 0.1, r * 0.92, Math.PI, 0); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#fff3d0';
    for (const [dx, dy] of [[-0.4, -0.55], [0, -0.7], [0.4, -0.55], [-0.2, -0.35], [0.25, -0.35]]) {
      circle(ctx, dx * r, dy * r, r * 0.09, '#fff3d0');
    }
  } else if (id === 'patty') {
    ctx.fillStyle = ing.dark; rr(ctx, -r, -r * 0.42, size, r * 0.9, r * 0.35); ctx.fill();
    ctx.fillStyle = ing.base; rr(ctx, -r * 0.94, -r * 0.52, size * 0.94, r * 0.85, r * 0.32); ctx.fill();
    ctx.fillStyle = ing.light;
    for (const [dx, dy] of [[-0.45, -0.15], [0.1, 0.05], [0.5, -0.2]]) circle(ctx, dx * r, dy * r, r * 0.1, ing.light);
  } else if (id === 'cheese') {
    ctx.fillStyle = ing.dark;
    ctx.beginPath(); ctx.moveTo(-r, r * 0.6); ctx.lineTo(r, r * 0.6); ctx.lineTo(0, -r * 0.7); ctx.closePath(); ctx.fill();
    ctx.fillStyle = ing.base;
    ctx.beginPath(); ctx.moveTo(-r * 0.88, r * 0.48); ctx.lineTo(r * 0.88, r * 0.48); ctx.lineTo(0, -r * 0.55); ctx.closePath(); ctx.fill();
    ctx.fillStyle = ing.dark;
    for (const [dx, dy] of [[-0.3, 0.15], [0.25, 0.1], [0, -0.25]]) circle(ctx, dx * r, dy * r, r * 0.13, ing.dark);
  } else if (id === 'lettuce') {
    // A leafy head: a scalloped dark ring around a lighter heart, with a vein.
    ctx.fillStyle = ing.dark;
    for (let i = 0; i < 8; i += 1) {
      const a = (i / 8) * Math.PI * 2;
      circle(ctx, Math.cos(a) * r * 0.68, Math.sin(a) * r * 0.68, r * 0.36, ing.dark);
    }
    ctx.fillStyle = ing.base;
    ctx.beginPath(); ctx.arc(0, 0, r * 0.66, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = ing.light; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, -r * 0.5); ctx.lineTo(0, r * 0.5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, -r * 0.2); ctx.lineTo(-r * 0.35, -r * 0.45); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, -r * 0.2); ctx.lineTo(r * 0.35, -r * 0.45); ctx.stroke();
  } else if (id === 'tomato') {
    circle(ctx, 0, 0, r * 0.92, ing.base);
    ctx.fillStyle = ing.light; circle(ctx, -r * 0.3, -r * 0.35, r * 0.25, ing.light);
    ctx.fillStyle = '#3f8f4f';
    ctx.beginPath(); ctx.moveTo(0, -r * 0.95); ctx.lineTo(-r * 0.35, -r * 0.55); ctx.lineTo(0, -r * 0.65); ctx.lineTo(r * 0.35, -r * 0.55); ctx.closePath(); ctx.fill();
  } else if (id === 'onion') {
    circle(ctx, 0, 0, r * 0.92, ing.base);
    ctx.strokeStyle = ing.dark; ctx.lineWidth = 2.5;
    for (const rad of [0.62, 0.38]) { ctx.beginPath(); ctx.arc(0, 0, r * rad, 0, Math.PI * 2); ctx.stroke(); }
    ctx.fillStyle = '#7fb069';
    ctx.beginPath(); ctx.moveTo(0, -r * 0.95); ctx.lineTo(-r * 0.18, -r * 0.6); ctx.lineTo(r * 0.18, -r * 0.6); ctx.closePath(); ctx.fill();
  } else if (id === 'egg') {
    ctx.fillStyle = '#fffdf4';
    ctx.beginPath();
    ctx.arc(-r * 0.25, r * 0.1, r * 0.55, 0, Math.PI * 2);
    ctx.arc(r * 0.35, -r * 0.15, r * 0.5, 0, Math.PI * 2);
    ctx.arc(r * 0.1, r * 0.35, r * 0.45, 0, Math.PI * 2);
    ctx.fill();
    circle(ctx, r * 0.05, 0, r * 0.42, '#f6b93b');
    ctx.fillStyle = '#ffe27a'; circle(ctx, r * 0.05, 0, r * 0.26, '#ffe27a');
  } else if (id === 'bacon') {
    ctx.strokeStyle = ing.base; ctx.lineWidth = r * 0.42; ctx.lineCap = 'round';
    for (const dy of [-0.42, 0.12]) {
      ctx.beginPath();
      ctx.moveTo(-r * 0.85, dy * r);
      ctx.quadraticCurveTo(-r * 0.3, dy * r - r * 0.35, r * 0.2, dy * r);
      ctx.quadraticCurveTo(r * 0.6, dy * r + r * 0.3, r * 0.85, dy * r);
      ctx.stroke();
    }
    ctx.strokeStyle = ing.light; ctx.lineWidth = r * 0.12;
    for (const dy of [-0.42, 0.12]) {
      ctx.beginPath();
      ctx.moveTo(-r * 0.85, dy * r);
      ctx.quadraticCurveTo(-r * 0.3, dy * r - r * 0.35, r * 0.2, dy * r);
      ctx.quadraticCurveTo(r * 0.6, dy * r + r * 0.3, r * 0.85, dy * r);
      ctx.stroke();
    }
  }
  if (opts.burnt) {
    ctx.fillStyle = 'rgba(20,12,6,0.55)';
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
    text(ctx, '✕', 0, 1, `bold ${Math.round(size * 0.55)}px ${SANS}`, '#ffd9c2', 'center');
  }
  ctx.restore();
}

// --- chop particles (transient, kept by the renderer) ----------------------
const particles = [];
export function chopBurst(x, y) {
  for (let i = 0; i < 14; i += 1) {
    particles.push({ x, y, vx: (Math.random() - 0.5) * 260, vy: -40 - Math.random() * 160, life: 0.5 + Math.random() * 0.3, born: performance.now() / 1000, colour: ['#e0492f', '#ff7a5c', '#3f8f4f'][i % 3] });
  }
}
function drawParticles(ctx, now) {
  for (let i = particles.length - 1; i >= 0; i -= 1) {
    const p = particles[i];
    const age = now - p.born;
    if (age > p.life) { particles.splice(i, 1); continue; }
    const k = 1 - age / p.life;
    ctx.globalAlpha = k;
    circle(ctx, p.x + p.vx * age, p.y + p.vy * age + 260 * age * age, 3.5 * k + 1, p.colour);
  }
  ctx.globalAlpha = 1;
}

// --- the kitchen ------------------------------------------------------------
function drawWall(ctx) {
  ctx.fillStyle = '#f3e2c6';
  ctx.fillRect(0, 64, VIEW.width, 572);
  // Window with a dusk sky and a street.
  ctx.fillStyle = '#7fb3d9'; rr(ctx, 340, 84, 260, 66, 10); ctx.fill();
  ctx.fillStyle = '#f6c453'; circle(ctx, 540, 108, 14, '#f6c453');
  ctx.fillStyle = '#5d7a52';
  ctx.beginPath(); ctx.moveTo(340, 150); ctx.lineTo(400, 118); ctx.lineTo(460, 150); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#8a5a33'; ctx.fillRect(336, 78, 268, 8); ctx.fillRect(336, 148, 268, 8);
  // Hanging lamps.
  for (const x of [700, 900, 1100]) {
    ctx.strokeStyle = '#5a4632'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x, 64); ctx.lineTo(x, 92); ctx.stroke();
    ctx.fillStyle = '#c47a2e';
    ctx.beginPath(); ctx.moveTo(x - 18, 96); ctx.lineTo(x + 18, 96); ctx.lineTo(x, 78); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255, 214, 130, 0.55)'; circle(ctx, x, 104, 12, 'rgba(255, 214, 130, 0.55)');
  }
  // Shelf with jars.
  ctx.fillStyle = '#8a5a33'; ctx.fillRect(940, 128, 300, 10);
  const jars = ['#d96b4f', '#7fb069', '#e8c85a', '#b48ec2'];
  jars.forEach((c, i) => {
    ctx.fillStyle = c; rr(ctx, 956 + i * 62, 92, 40, 36, 6); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(960 + i * 62, 96, 32, 6);
  });
  // Floor tiles.
  ctx.fillStyle = '#e3cda4'; ctx.fillRect(0, 560, VIEW.width, 76);
  ctx.strokeStyle = '#d3b98d'; ctx.lineWidth = 2;
  for (let x = 0; x < VIEW.width; x += 80) { ctx.beginPath(); ctx.moveTo(x, 560); ctx.lineTo(x, 636); ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(0, 598); ctx.lineTo(VIEW.width, 598); ctx.stroke();
}

function drawTopBar(ctx, world) {
  const bar = LAYOUT.topBar;
  ctx.fillStyle = '#2e2018'; ctx.fillRect(bar.x, bar.y, bar.w, bar.h);
  // Copper ladle mark.
  ctx.strokeStyle = '#e8a94f'; ctx.lineWidth = 4; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(34, 20); ctx.lineTo(34, 44); ctx.stroke();
  circle(ctx, 34, 50, 7, '#e8a94f');
  text(ctx, 'THE COPPER LADLE', 52, 33, `bold 26px ${SERIF}`, '#f7e8c8');
  // Shift timer, dead centre, with its bar.
  const mins = Math.floor(world.timeLeft / 60);
  const secs = Math.floor(world.timeLeft % 60);
  const urgent = world.timeLeft <= 30;
  const timerText = `${mins}:${String(secs).padStart(2, '0')}`;
  text(ctx, 'SHIFT', 640, 20, `bold 12px ${SANS}`, '#c9a878', 'center');
  text(ctx, timerText, 640, 38, `bold 30px ${SANS}`, urgent ? '#ff6b4a' : '#fff6e0', 'center');
  ctx.fillStyle = '#4a3626'; rr(ctx, 540, 54, 200, 6, 3); ctx.fill();
  ctx.fillStyle = urgent ? '#ff6b4a' : '#58b368';
  rr(ctx, 540, 54, 200 * (world.timeLeft / 150), 6, 3); ctx.fill();
  // Score and streak, right, kept apart so they never collide.
  text(ctx, 'SCORE', 990, 20, `bold 12px ${SANS}`, '#c9a878', 'right');
  text(ctx, String(world.score), 990, 40, `bold 26px ${SANS}`, '#ffd94d', 'right');
  const combo = comboOf(world);
  text(ctx, combo > 1 ? `COMBO ×${combo.toFixed(2).replace(/0$/, '')}` : 'COMBO ×1', 1180, 33, `bold 18px ${SANS}`, combo > 1 ? '#ff9d5c' : '#c9a878', 'right');
  text(ctx, world.muted ? '🔇 M' : '🔊 M', 1264, 33, `16px ${SANS}`, '#f7e8c8', 'right');
}

function drawBoard(ctx, world) {
  const b = LAYOUT.board;
  ctx.fillStyle = '#8a5a33'; rr(ctx, b.x - 4, b.y - 4, b.w + 8, b.h + 8, 12); ctx.fill();
  ctx.fillStyle = '#fff8e7'; rr(ctx, b.x, b.y, b.w, b.h, 10); ctx.fill();
  text(ctx, '📋  ORDER BOARD', b.x + 14, b.y + 18, `bold 17px ${SANS}`, '#5a3a1e');
  world.tickets.forEach((ticket, i) => {
    const r = ticketRect(i);
    const matched = world.plate.length > 0 && world.plate.length === ticket.recipe.items.length
      && ticket.recipe.items.every((id) => world.plate.includes(id));
    const urgent = ticket.patience < 12;
    ctx.fillStyle = matched ? '#e6f7e6' : '#ffffff';
    rr(ctx, r.x, r.y, r.w, r.h, 8); ctx.fill();
    ctx.strokeStyle = matched ? '#58b368' : urgent ? '#e0492f' : '#d9c49a';
    ctx.lineWidth = matched || urgent ? 3 : 1.5;
    rr(ctx, r.x, r.y, r.w, r.h, 8); ctx.stroke();
    text(ctx, `#${ticket.id}  ${ticket.recipe.name}`, r.x + 10, r.y + 18, `bold 16px ${SANS}`, '#3a2a18');
    text(ctx, `$${ticket.recipe.price}`, r.x + r.w - 10, r.y + 18, `bold 16px ${SANS}`, '#b97a28', 'right');
    // The dish, as a row of ingredient icons.
    ticket.recipe.items.forEach((id, j) => drawIngredient(ctx, id, r.x + 28 + j * 40, r.y + 52, 34));
    // Patience bar.
    const frac = Math.max(0, ticket.patience / ticket.maxPatience);
    ctx.fillStyle = '#e8dcc8'; rr(ctx, r.x + 10, r.y + 84, r.w - 20, 12, 6); ctx.fill();
    ctx.fillStyle = urgent ? '#e0492f' : frac < 0.5 ? '#e8a94f' : '#58b368';
    rr(ctx, r.x + 10, r.y + 84, (r.w - 20) * frac, 12, 6); ctx.fill();
    text(ctx, `${Math.ceil(ticket.patience)}s`, r.x + r.w - 12, r.y + 102, `11px ${SANS}`, '#8a7a5c', 'right');
    if (matched) text(ctx, '✓ READY — CLICK TO SERVE', r.x + 10, r.y + 102, `bold 11px ${SANS}`, '#2f7d3d');
  });
  if (world.tickets.length === 0) {
    text(ctx, 'No orders yet —', b.x + b.w / 2, b.y + 120, `15px ${SANS}`, '#8a7a5c', 'center');
    text(ctx, 'the lunch crowd is coming.', b.x + b.w / 2, b.y + 146, `15px ${SANS}`, '#8a7a5c', 'center');
  }
}

function drawGrill(ctx, world) {
  const g = LAYOUT.grill;
  ctx.fillStyle = '#6b4a2f'; rr(ctx, g.x, g.y, g.w, g.h, 12); ctx.fill();
  text(ctx, '🔥  GRILL', g.x + 16, g.y + 18, `bold 16px ${SANS}`, '#ffd9a0');
  world.grill.forEach((item, slot) => {
    const r = grillSlotRect(slot);
    ctx.fillStyle = '#3a2a1c'; rr(ctx, r.x, r.y, r.w, r.h, 10); ctx.fill();
    ctx.strokeStyle = '#8a6a4a'; ctx.lineWidth = 2;
    for (let i = 1; i < 5; i += 1) { ctx.beginPath(); ctx.moveTo(r.x + 8, r.y + i * 20); ctx.lineTo(r.x + r.w - 8, r.y + i * 20); ctx.stroke(); }
    if (item) {
      const done = item.cooked >= item.need;
      drawIngredient(ctx, item.id, r.x + r.w / 2, r.y + r.h / 2 - 6, 58, { burnt: item.burnt });
      // Cook progress ring.
      const frac = Math.min(1, item.cooked / item.need);
      ctx.strokeStyle = item.burnt ? '#e0492f' : done ? '#58b368' : '#e8a94f';
      ctx.lineWidth = 6;
      ctx.beginPath(); ctx.arc(r.x + r.w / 2, r.y + r.h / 2 - 6, 40, -Math.PI / 2, -Math.PI / 2 + frac * Math.PI * 2); ctx.stroke();
      if (done && !item.burnt) text(ctx, 'READY — CLICK', r.x + r.w / 2, r.y + r.h - 12, `bold 12px ${SANS}`, '#8fd89b', 'center');
      if (item.burnt) text(ctx, 'BURNT — CLICK TO BIN', r.x + r.w / 2, r.y + r.h - 12, `bold 11px ${SANS}`, '#ff9d8a', 'center');
    } else {
      text(ctx, 'empty', r.x + r.w / 2, r.y + r.h / 2, `14px ${SANS}`, '#8a7a5c', 'center');
    }
  });
}

function drawChop(ctx, world) {
  const c = LAYOUT.chop;
  ctx.fillStyle = '#a4713e'; rr(ctx, c.x, c.y, c.w, c.h, 12); ctx.fill();
  text(ctx, '🔪  CHOPPING BOARD', c.x + 16, c.y + 18, `bold 16px ${SANS}`, '#fff0d0');
  const r = chopRect();
  ctx.fillStyle = '#d9b57e'; rr(ctx, r.x, r.y, r.w, r.h, 8); ctx.fill();
  ctx.strokeStyle = '#b98f56'; ctx.lineWidth = 2; rr(ctx, r.x, r.y, r.w, r.h, 8); ctx.stroke();
  if (world.chop) {
    drawIngredient(ctx, world.chop.id, r.x + r.w / 2, r.y + r.h / 2 - 4, 64);
    // Knife.
    ctx.save();
    ctx.translate(r.x + r.w - 42, r.y + 22);
    ctx.rotate(-0.5);
    ctx.fillStyle = '#dfe6ea'; rr(ctx, 0, 0, 52, 12, 4); ctx.fill();
    ctx.fillStyle = '#5a4632'; rr(ctx, 52, 2, 22, 8, 4); ctx.fill();
    ctx.restore();
    const frac = world.chop.done / world.chop.total;
    ctx.fillStyle = '#fff8e7'; rr(ctx, r.x + 20, r.y + r.h - 22, r.w - 40, 10, 5); ctx.fill();
    ctx.fillStyle = '#58b368'; rr(ctx, r.x + 20, r.y + r.h - 22, (r.w - 40) * frac, 10, 5); ctx.fill();
    text(ctx, `CHOP! ${world.chop.done}/${world.chop.total}`, r.x + r.w / 2, r.y + r.h - 34, `bold 13px ${SANS}`, '#5a3a1e', 'center');
  } else {
    text(ctx, 'tomato & onion come here', r.x + r.w / 2, r.y + r.h / 2 - 8, `13px ${SANS}`, '#8a6a44', 'center');
    text(ctx, 'click the board to chop', r.x + r.w / 2, r.y + r.h / 2 + 12, `13px ${SANS}`, '#8a6a44', 'center');
  }
}

function drawPlate(ctx, world) {
  const p = LAYOUT.plate;
  ctx.fillStyle = '#fdf6e3'; rr(ctx, p.x, p.y, p.w, p.h, 12); ctx.fill();
  ctx.strokeStyle = '#e0c9a0'; ctx.lineWidth = 2; rr(ctx, p.x, p.y, p.w, p.h, 12); ctx.stroke();
  text(ctx, '🍽️  PLATING', p.x + 16, p.y + 18, `bold 16px ${SANS}`, '#5a3a1e');
  const cx = p.x + p.w / 2, cy = p.y + 132;
  circle(ctx, cx, cy, 92, '#ffffff');
  ctx.strokeStyle = '#d9c49a'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(cx, cy, 92, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(cx, cy, 66, 0, Math.PI * 2); ctx.stroke();
  if (world.plate.length === 0) {
    text(ctx, 'build a dish here', cx, cy - 6, `15px ${SANS}`, '#b09a78', 'center');
    text(ctx, 'click ingredients below', cx, cy + 16, `13px ${SANS}`, '#b09a78', 'center');
  } else {
    // The dish mid-assembly: its items fanned across the plate.
    const n = world.plate.length;
    world.plate.forEach((id, i) => {
      const dx = (i - (n - 1) / 2) * 44;
      const dy = Math.sin(i * 1.3) * 10;
      drawIngredient(ctx, id, cx + dx, cy + dy, 56, { wobble: world.elapsed * 2 + i });
    });
    text(ctx, `${world.plate.length} item${world.plate.length > 1 ? 's' : ''} on the plate — click one to take it off`, cx, p.y + p.h - 22, `12px ${SANS}`, '#8a7a5c', 'center');
  }
  // Which ticket, if any, does this plate complete?
  const match = world.tickets.find((t) => world.plate.length === t.recipe.items.length
    && t.recipe.items.every((id) => world.plate.includes(id)));
  if (match) {
    ctx.fillStyle = '#2f7d3d'; rr(ctx, p.x + 60, p.y + 34, p.w - 120, 26, 13); ctx.fill();
    text(ctx, `✓ ${match.recipe.name} — click its ticket!`, cx, p.y + 47, `bold 13px ${SANS}`, '#ffffff', 'center');
  }
}

function drawPass(ctx, world) {
  const p = LAYOUT.pass;
  ctx.fillStyle = '#5d4030'; rr(ctx, p.x, p.y, p.w, p.h, 12); ctx.fill();
  text(ctx, '🛎️  THE PASS — READY TO SERVE', p.x + 14, p.y + 20, `bold 14px ${SANS}`, '#ffd9a0');
  ctx.fillStyle = '#8a5a33'; ctx.fillRect(p.x + 12, p.y + 96, p.w - 24, 10);
  if (world.pass) {
    const recipe = RECIPES.find((r) => r.id === world.pass.recipeId);
    circle(ctx, p.x + 90, p.y + 78, 46, '#ffffff');
    ctx.strokeStyle = '#d9c49a'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(p.x + 90, p.y + 78, 46, 0, Math.PI * 2); ctx.stroke();
    recipe.items.forEach((id, i) => {
      const dx = (i - (recipe.items.length - 1) / 2) * 26;
      drawIngredient(ctx, id, p.x + 90 + dx, p.y + 78, 30);
    });
    text(ctx, recipe.name, p.x + 148, p.y + 62, `bold 15px ${SANS}`, '#fff6e0');
    text(ctx, 'served — the runner takes it', p.x + 148, p.y + 84, `12px ${SANS}`, '#e8d5b5');
    // The service bell, tucked in the top-right corner, clear of the name.
    ctx.fillStyle = '#f2c230';
    ctx.beginPath(); ctx.arc(p.x + 262, p.y + 36, 13, Math.PI, 0); ctx.closePath(); ctx.fill();
    ctx.fillRect(p.x + 247, p.y + 36, 30, 4);
    circle(ctx, p.x + 262, p.y + 22, 3, '#f2c230');
  } else {
    text(ctx, 'finished dishes wait here', p.x + p.w / 2, p.y + 66, `14px ${SANS}`, '#c9a878', 'center');
    text(ctx, 'for the runner', p.x + p.w / 2, p.y + 88, `14px ${SANS}`, '#c9a878', 'center');
  }
}

function drawRushPanel(ctx, world) {
  const r = LAYOUT.rush;
  ctx.fillStyle = world.rush ? '#7a2e1d' : '#f0e2c8';
  rr(ctx, r.x, r.y, r.w, r.h, 12); ctx.fill();
  if (world.rush) {
    text(ctx, '⚡ RUSH HOUR', r.x + r.w / 2, r.y + 30, `bold 20px ${SANS}`, '#ffd94d', 'center');
    text(ctx, 'orders are coming fast —', r.x + r.w / 2, r.y + 58, `13px ${SANS}`, '#ffe9c2', 'center');
    text(ctx, 'keep the streak alive!', r.x + r.w / 2, r.y + 78, `13px ${SANS}`, '#ffe9c2', 'center');
    text(ctx, `streak ${world.streak}  •  best combo ×${world.bestCombo.toFixed(2).replace(/0$/, '')}`, r.x + r.w / 2, r.y + 112, `bold 13px ${SANS}`, '#ffffff', 'center');
  } else {
    text(ctx, '☀️  CALM BEFORE', r.x + r.w / 2, r.y + 30, `bold 18px ${SANS}`, '#8a6a44', 'center');
    text(ctx, 'the lunch rush', r.x + r.w / 2, r.y + 52, `bold 18px ${SANS}`, '#8a6a44', 'center');
    text(ctx, 'rush hour hits with 1:00 left.', r.x + r.w / 2, r.y + 82, `13px ${SANS}`, '#8a7a5c', 'center');
    text(ctx, `served ${world.served}  •  missed ${world.missed}`, r.x + r.w / 2, r.y + 112, `bold 13px ${SANS}`, '#5a3a1e', 'center');
  }
}

function drawCounter(ctx, world) {
  const c = LAYOUT.counter;
  ctx.fillStyle = '#6b4423'; rr(ctx, c.x, c.y, c.w, c.h, 12); ctx.fill();
  ctx.fillStyle = '#8a5a33'; ctx.fillRect(c.x + 8, c.y + 8, c.w - 16, 6);
  const ingredients = Object.values(INGREDIENT_BY_ID);
  ingredients.forEach((ing, i) => {
    const r = binRect(i);
    const cx = r.x + r.w / 2;
    const hover = world.hoverBin === i;
    ctx.fillStyle = hover ? '#a4713e' : '#7d5230';
    rr(ctx, r.x + 6, r.y + 10, r.w - 12, r.h - 20, 10); ctx.fill();
    ctx.strokeStyle = hover ? '#ffd94d' : '#5d3a1e'; ctx.lineWidth = hover ? 3 : 1.5;
    rr(ctx, r.x + 6, r.y + 10, r.w - 12, r.h - 20, 10); ctx.stroke();
    drawIngredient(ctx, ing.id, cx, r.y + 52, 56, { wobble: world.elapsed + i });
    text(ctx, ing.name, cx, r.y + 96, `bold 15px ${SANS}`, '#fff6e0', 'center');
    const tag = ing.prep === 'grill' ? 'GRILL' : ing.prep === 'chop' ? 'CHOP' : 'READY';
    ctx.fillStyle = ing.prep === 'ready' ? '#58b368' : ing.prep === 'grill' ? '#e0492f' : '#e8a94f';
    rr(ctx, cx - 26, r.y + 106, 52, 16, 8); ctx.fill();
    text(ctx, tag, cx, r.y + 114, `bold 10px ${SANS}`, '#ffffff', 'center');
    ctx.fillStyle = '#2e2018'; circle(ctx, r.x + 20, r.y + 26, 11, '#2e2018');
    text(ctx, ing.key, r.x + 20, r.y + 27, `bold 12px ${SANS}`, '#ffd94d', 'center');
  });
  text(ctx, 'Click an ingredient to use it  •  1–8 pick one  •  click a ticket to serve  •  P pause  •  M mute', LAYOUT.hint.x + LAYOUT.hint.w / 2, 791, `12px ${SANS}`, '#8a7a5c', 'center');
}

function drawMessage(ctx, world) {
  if (!world.message) return;
  const age = world.elapsed - world.messageAt;
  if (age > 3.5) return;
  ctx.globalAlpha = age > 3 ? 3.5 - age : 1;
  // Measure with the message's own font, then centre the pill on the screen.
  ctx.font = `bold 15px ${SANS}`;
  const w = ctx.measureText(world.message).width + 36;
  ctx.fillStyle = '#2e2018';
  rr(ctx, VIEW.width / 2 - w / 2, 552, w, 34, 17); ctx.fill();
  text(ctx, world.message, VIEW.width / 2, 569, `bold 15px ${SANS}`, '#ffe9c2', 'center');
  ctx.globalAlpha = 1;
}

function drawFloats(ctx, world) {
  for (const f of world.floats) {
    const age = world.elapsed - f.born;
    const k = 1 - age / f.life;
    ctx.globalAlpha = k;
    text(ctx, f.text, f.x, f.y - age * 46, `bold 26px ${SANS}`, f.colour, 'center');
  }
  ctx.globalAlpha = 1;
}

function drawTitle(ctx, world) {
  ctx.fillStyle = 'rgba(46, 32, 24, 0.82)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  ctx.fillStyle = '#fdf6e3';
  rr(ctx, 290, 110, 700, 520, 18); ctx.fill();
  ctx.strokeStyle = '#c47a2e'; ctx.lineWidth = 3; rr(ctx, 290, 110, 700, 520, 18); ctx.stroke();
  text(ctx, '🍳', 640, 178, '44px serif', '#3a2a18', 'center');
  text(ctx, 'THE COPPER LADLE', 640, 232, `bold 44px ${SERIF}`, '#5a3a1e', 'center');
  text(ctx, 'a fast little bistro game', 640, 268, `italic 20px ${SERIF}`, '#8a6a44', 'center');
  const lines = [
    'Orders land on the board — build each dish on the plate.',
    'Tomato & onion need the chopping board. Patty, egg & bacon need the grill —',
    'collect them in time or they burn. Serve before patience runs out.',
    'Fast serves earn tips; serves in a row build your combo.',
  ];
  lines.forEach((line, i) => text(ctx, line, 640, 322 + i * 26, `16px ${SANS}`, '#3a2a18', 'center'));
  text(ctx, 'Click ingredients below, or press 1–8. Click a ticket to serve it.', 640, 448, `bold 15px ${SANS}`, '#5a3a1e', 'center');
  const best = Number(localStorage.getItem('copper-ladle-best') ?? 0);
  if (best > 0) text(ctx, `Best shift so far: ${best}`, 640, 478, `15px ${SANS}`, '#8a6a44', 'center');
  ctx.fillStyle = '#c47a2e'; rr(ctx, 540, 510, 200, 56, 12); ctx.fill();
  text(ctx, '▶  START SHIFT', 640, 538, `bold 20px ${SANS}`, '#ffffff', 'center');
  text(ctx, '150 seconds. Three stars at 12 dishes and 3,000 points.', 640, 596, `13px ${SANS}`, '#8a7a5c', 'center');
}

function drawOver(ctx, world) {
  ctx.fillStyle = 'rgba(46, 32, 24, 0.82)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  ctx.fillStyle = '#fdf6e3';
  rr(ctx, 330, 120, 620, 500, 18); ctx.fill();
  ctx.strokeStyle = '#c47a2e'; ctx.lineWidth = 3; rr(ctx, 330, 120, 620, 500, 18); ctx.stroke();
  text(ctx, 'SHIFT OVER', 640, 178, `bold 40px ${SERIF}`, '#5a3a1e', 'center');
  const stars = '★'.repeat(world.over.stars) + '☆'.repeat(3 - world.over.stars);
  text(ctx, stars, 640, 232, '44px serif', '#e8a94f', 'center');
  text(ctx, `Score  ${world.over.score}`, 640, 292, `bold 26px ${SANS}`, '#3a2a18', 'center');
  text(ctx, `Dishes served  ${world.over.served}    •    Walked out  ${world.over.missed}`, 640, 332, `16px ${SANS}`, '#5a3a1e', 'center');
  text(ctx, `Best combo  ×${world.over.bestCombo.toFixed(2).replace(/0$/, '')}    •    Best shift  ${world.over.best}`, 640, 362, `16px ${SANS}`, '#5a3a1e', 'center');
  const verdict = world.over.stars === 3 ? 'A flawless service — the bistro sings your name.'
    : world.over.stars === 2 ? 'A strong shift. The rush nearly had you.'
    : world.over.stars === 1 ? 'The kitchen survived. Barely.'
    : 'The lunch crowd ate you alive. Again?';
  text(ctx, verdict, 640, 402, `italic 17px ${SERIF}`, '#8a6a44', 'center');
  ctx.fillStyle = '#c47a2e'; rr(ctx, 540, 460, 200, 56, 12); ctx.fill();
  text(ctx, '↻  PLAY AGAIN', 640, 488, `bold 20px ${SANS}`, '#ffffff', 'center');
  text(ctx, 'Press Enter or click to start another shift.', 640, 556, `13px ${SANS}`, '#8a7a5c', 'center');
}

// --- the frame ----------------------------------------------------------------
export function draw(ctx, world, now) {
  ctx.save();
  if (world.shake > 0) {
    ctx.translate((Math.random() - 0.5) * world.shake * 22, (Math.random() - 0.5) * world.shake * 22);
  }
  drawWall(ctx);
  drawTopBar(ctx, world);
  drawBoard(ctx, world);
  drawGrill(ctx, world);
  drawChop(ctx, world);
  drawPlate(ctx, world);
  drawPass(ctx, world);
  drawRushPanel(ctx, world);
  drawCounter(ctx, world);
  drawParticles(ctx, now);
  drawMessage(ctx, world);
  drawFloats(ctx, world);
  ctx.restore();
  if (world.screen === 'title') drawTitle(ctx, world);
  if (world.screen === 'over') drawOver(ctx, world);
}
