// The Copper Ladle — input: mouse and keyboard, translated into kitchen
// actions. Hit-testing shares its geometry with the renderer.
import { INGREDIENTS, LAYOUT } from './config.js';
import { binRect, chopRect, grillSlotRect, plateRect, ticketRect } from './render.js';
import { chopOnce, collectGrill, removeFromPlate, serveTicket, takeIngredient } from './world.js';

function inside(x, y, r) {
  return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
}

function plateItemAt(world, x, y) {
  const cx = LAYOUT.plate.x + LAYOUT.plate.w / 2;
  const cy = LAYOUT.plate.y + 132;
  const n = world.plate.length;
  for (let i = 0; i < n; i += 1) {
    const dx = (i - (n - 1) / 2) * 44;
    const dy = Math.sin(i * 1.3) * 10;
    const px = cx + dx, py = cy + dy;
    if ((x - px) ** 2 + (y - py) ** 2 <= 30 * 30) return i;
  }
  return -1;
}

export function attachInput(canvas, world, audio, onStateChange) {
  let paused = false;

  function toGame(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * (canvas.width / rect.width),
      y: (event.clientY - rect.top) * (canvas.height / rect.height),
    };
  }

  function clickAt(x, y) {
    if (world.screen === 'title') {
      if (inside(x, y, { x: 540, y: 510, w: 200, h: 56 })) onStateChange('start');
      return;
    }
    if (world.screen === 'over') {
      if (inside(x, y, { x: 540, y: 460, w: 200, h: 56 })) onStateChange('again');
      return;
    }
    if (paused) return;
    // Mute toggle, top right.
    if (inside(x, y, { x: 1208, y: 18, w: 56, h: 30 })) { audio.toggleMute(); world.muted = audio.muted; return; }
    // Tickets first: a matching plate serves on the ticket's click.
    for (let i = 0; i < world.tickets.length; i += 1) {
      if (inside(x, y, ticketRect(i))) {
        const result = serveTicket(world, world.tickets[i].id);
        audio.play(result === 'served' ? 'serve' : 'buzz');
        return;
      }
    }
    // Grill slots: collect what is cooked, bin what burnt.
    for (let slot = 0; slot < world.grill.length; slot += 1) {
      if (inside(x, y, grillSlotRect(slot))) {
        const result = collectGrill(world, slot);
        if (result === 'plated') audio.play('plated');
        if (result === 'burnt') audio.play('buzz');
        return;
      }
    }
    // The chopping board.
    if (inside(x, y, chopRect())) {
      const result = chopOnce(world);
      if (result === 'chopped' || result === 'plated') audio.play('chop');
      return;
    }
    // An item already on the plate comes off with a click.
    const plateIndex = plateItemAt(world, x, y);
    if (plateIndex >= 0) { removeFromPlate(world, plateIndex); audio.play('click'); return; }
    // The ingredient counter along the bottom.
    for (let i = 0; i < INGREDIENTS.length; i += 1) {
      if (inside(x, y, binRect(i))) {
        const result = takeIngredient(world, INGREDIENTS[i].id);
        if (result === 'plated') audio.play('plated');
        else if (result === 'grilling') audio.play('sizzle');
        else if (result === 'chopping') audio.play('chop');
        else if (result === 'busy' || result === 'full') audio.play('buzz');
        return;
      }
    }
  }

  canvas.addEventListener('pointerdown', (event) => {
    const { x, y } = toGame(event);
    clickAt(x, y);
  });
  canvas.addEventListener('pointermove', (event) => {
    const { x, y } = toGame(event);
    world.hoverBin = -1;
    if (world.screen === 'play') {
      for (let i = 0; i < INGREDIENTS.length; i += 1) {
        if (inside(x, y, binRect(i))) world.hoverBin = i;
      }
    }
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'm' || event.key === 'M') {
      audio.toggleMute();
      world.muted = audio.muted;
      return;
    }
    if (event.key === 'p' || event.key === 'P') {
      if (world.screen === 'play') { paused = !paused; onStateChange(paused ? 'pause' : 'resume'); }
      return;
    }
    if (world.screen === 'title' && (event.key === 'Enter' || event.key === ' ')) { onStateChange('start'); return; }
    if (world.screen === 'over' && (event.key === 'Enter' || event.key === ' ')) { onStateChange('again'); return; }
    if (world.screen !== 'play' || paused) return;
    const bin = INGREDIENTS.findIndex((ing) => ing.key === event.key);
    if (bin >= 0) {
      const result = takeIngredient(world, INGREDIENTS[bin].id);
      if (result === 'plated') audio.play('plated');
      else if (result === 'grilling') audio.play('sizzle');
      else if (result === 'chopping') audio.play('chop');
      else if (result === 'busy' || result === 'full') audio.play('buzz');
      return;
    }
    if (event.key === 'c' || event.key === 'C') {
      const result = chopOnce(world);
      if (result === 'chopped' || result === 'plated') audio.play('chop');
    }
    if (event.key === 'g' || event.key === 'G') {
      for (let slot = 0; slot < world.grill.length; slot += 1) {
        const item = world.grill[slot];
        if (item && !item.burnt && item.cooked >= item.need) {
          if (collectGrill(world, slot) === 'plated') audio.play('plated');
          break;
        }
      }
    }
  });

  return {
    isPaused: () => paused,
    setPaused: (value) => { paused = value; },
  };
}
