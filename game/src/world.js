// The Copper Ladle — the world: orders, the plate, the grill, the chopping
// board, the pass, the timer and the score. No drawing here, only rules.
import {
  BURN_AFTER_SECONDS, CHOPS_NEEDED, COMBO_MAX, COMBO_STEP, GRILL_SLOTS,
  INGREDIENT_BY_ID, MAX_TICKETS, MISS_PENALTY, PATIENCE_RUSH, PATIENCE_START,
  RECIPES, SHIFT_SECONDS, SPAWN_RUSH, SPAWN_START, RUSH_AT_SECONDS_LEFT,
} from './config.js';

// A tiny seeded random so screenshot scenes stage exactly the same every run.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pickRecipe(rng) {
  return RECIPES[Math.floor(rng() * RECIPES.length)];
}

function sameItems(a, b) {
  if (a.length !== b.length) return false;
  const count = new Map();
  for (const item of a) count.set(item, (count.get(item) ?? 0) + 1);
  for (const item of b) {
    const left = count.get(item) ?? 0;
    if (left === 0) return false;
    count.set(item, left - 1);
  }
  return true;
}

export function newWorld(seed = 1) {
  return {
    screen: 'title', // title | play | over
    timeLeft: SHIFT_SECONDS,
    elapsed: 0,
    spawnIn: 6,
    tickets: [],
    ticketSeq: 0,
    plate: [], // ingredient ids, bottom to top
    grill: Array.from({ length: GRILL_SLOTS }, () => null), // {id, cooked, burnt}
    chop: null, // {id, done, total}
    pass: null, // finished dish waiting on the pass {recipeId, servedAt}
    score: 0,
    served: 0,
    missed: 0,
    streak: 0,
    bestCombo: 1,
    rush: false,
    rushAnnounced: false,
    message: '',
    messageAt: 0,
    floats: [], // {x, y, text, colour, born, life}
    shake: 0,
    rng: mulberry32(seed),
    over: null, // {stars, served, score, best}
    muted: false,
  };
}

export function patienceFor(world) {
  return world.rush ? PATIENCE_RUSH : PATIENCE_START;
}

export function spawnTicket(world, recipeId = null) {
  if (world.tickets.length >= MAX_TICKETS) return null;
  const recipe = recipeId
    ? RECIPES.find((r) => r.id === recipeId)
    : pickRecipe(world.rng);
  const ticket = {
    id: world.ticketSeq += 1,
    recipe,
    patience: patienceFor(world),
    maxPatience: patienceFor(world),
    born: world.elapsed,
  };
  world.tickets.push(ticket);
  return ticket;
}

export function comboOf(world) {
  return Math.min(1 + world.streak * COMBO_STEP, COMBO_MAX);
}

function announce(world, text) {
  world.message = text;
  world.messageAt = world.elapsed;
}

function float(world, x, y, text, colour) {
  world.floats.push({ x, y, text, colour, born: world.elapsed, life: 1.1 });
}

// The player picked an ingredient bin. Ready ones go straight on the plate;
// the rest go to their station (grill or chopping board) to be prepared.
export function takeIngredient(world, id) {
  if (world.screen !== 'play') return 'idle';
  const ing = INGREDIENT_BY_ID[id];
  if (!ing) return 'idle';
  if (world.plate.length >= 5) { announce(world, 'Plate is full — serve or clear it'); return 'full'; }
  if (ing.prep === 'ready') {
    world.plate.push(id);
    return 'plated';
  }
  if (ing.prep === 'grill') {
    const slot = world.grill.findIndex((g) => g === null);
    if (slot === -1) { announce(world, 'Grill is full — collect a cooked item first'); return 'busy'; }
    world.grill[slot] = { id, cooked: 0, need: ing.grillSeconds, burnt: false };
    return 'grilling';
  }
  if (world.chop !== null) { announce(world, 'Board is busy — finish chopping first'); return 'busy'; }
  world.chop = { id, done: 0, total: CHOPS_NEEDED };
  return 'chopping';
}

// One chop on the board. When the chops are done the item lands on the plate.
export function chopOnce(world) {
  if (world.screen !== 'play' || world.chop === null) return 'idle';
  world.chop.done += 1;
  if (world.chop.done < world.chop.total) return 'chopped';
  const id = world.chop.id;
  world.chop = null;
  if (world.plate.length < 5) world.plate.push(id);
  return 'plated';
}

// Collect a cooked grill item onto the plate. A burnt one goes in the bin.
export function collectGrill(world, slot) {
  if (world.screen !== 'play') return 'idle';
  const item = world.grill[slot];
  if (!item) return 'idle';
  if (item.burnt) {
    world.grill[slot] = null;
    world.streak = 0;
    announce(world, 'Burnt! The bin eats another one');
    return 'burnt';
  }
  if (item.cooked < item.need) return 'raw';
  world.grill[slot] = null;
  if (world.plate.length < 5) world.plate.push(item.id);
  return 'plated';
}

// Take one item off the plate (a mistake, or a change of plan).
export function removeFromPlate(world, index) {
  if (world.screen !== 'play') return;
  if (index >= 0 && index < world.plate.length) world.plate.splice(index, 1);
}

// Serve the plate to a ticket it matches exactly. Tips reward fast service
// and a hot streak; a wrong plate is refused, never served.
export function serveTicket(world, ticketId) {
  if (world.screen !== 'play') return 'idle';
  const ticket = world.tickets.find((t) => t.id === ticketId);
  if (!ticket) return 'idle';
  if (!sameItems(world.plate, ticket.recipe.items)) return 'wrong';
  const tip = Math.round(50 * (ticket.patience / ticket.maxPatience));
  const combo = comboOf(world);
  const earned = Math.round((ticket.recipe.price + tip) * combo);
  world.score += earned;
  world.served += 1;
  world.streak += 1;
  world.bestCombo = Math.max(world.bestCombo, comboOf(world));
  world.tickets = world.tickets.filter((t) => t.id !== ticketId);
  world.pass = { recipeId: ticket.recipe.id, servedAt: world.elapsed };
  float(world, 1090, 300, `+${earned}`, '#ffd94d');
  world.plate = [];
  announce(world, `${ticket.recipe.name} served — +${earned}`);
  return 'served';
}

function starsFor(score, served) {
  if (served >= 12 && score >= 3000) return 3;
  if (served >= 8 && score >= 1800) return 2;
  if (served >= 4) return 1;
  return 0;
}

export function endShift(world) {
  world.screen = 'over';
  const best = Math.max(world.score, Number(localStorage.getItem('copper-ladle-best') ?? 0));
  localStorage.setItem('copper-ladle-best', String(best));
  world.over = {
    stars: starsFor(world.score, world.served),
    served: world.served,
    missed: world.missed,
    score: world.score,
    best,
    bestCombo: world.bestCombo,
  };
}

// One tick of the kitchen clock. Returns sound cues for the frame.
export function step(world, dt) {
  const cues = [];
  if (world.screen !== 'play') return cues;
  world.elapsed += dt;
  world.timeLeft = Math.max(0, SHIFT_SECONDS - world.elapsed);

  if (!world.rush && world.timeLeft <= RUSH_AT_SECONDS_LEFT) {
    world.rush = true;
    world.rushAnnounced = true;
    announce(world, 'RUSH HOUR — orders are coming fast!');
    cues.push('rush');
  }
  if (world.timeLeft <= 0) { endShift(world); cues.push('over'); return cues; }

  // New tickets on a schedule that quickens in the rush.
  world.spawnIn -= dt;
  if (world.spawnIn <= 0) {
    if (spawnTicket(world)) cues.push('ticket');
    world.spawnIn = world.rush ? SPAWN_RUSH : SPAWN_START;
  }

  // Patience runs out: the customer leaves, the streak breaks.
  for (const ticket of [...world.tickets]) {
    ticket.patience -= dt;
    if (ticket.patience <= 0) {
      world.tickets = world.tickets.filter((t) => t.id !== ticket.id);
      world.missed += 1;
      world.streak = 0;
      world.score = Math.max(0, world.score - MISS_PENALTY);
      world.shake = 0.35;
      announce(world, `${ticket.recipe.name} walked out — -${MISS_PENALTY}`);
      cues.push('miss');
    }
  }

  // The grill cooks; left too long, it burns.
  for (const item of world.grill) {
    if (!item) continue;
    item.cooked += dt;
    if (!item.burnt && item.cooked >= item.need + BURN_AFTER_SECONDS) {
      item.burnt = true;
      cues.push('burn');
    }
  }

  // The finished plate waits on the pass a little, then the runner takes it.
  if (world.pass && world.elapsed - world.pass.servedAt > 6) world.pass = null;

  // Floating scores fade; the shake settles.
  world.floats = world.floats.filter((f) => world.elapsed - f.born < f.life);
  if (world.shake > 0) world.shake = Math.max(0, world.shake - dt);
  return cues;
}
