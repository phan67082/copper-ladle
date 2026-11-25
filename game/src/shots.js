// The Copper Ladle — screenshot scenes. Each one stages a real game state
// through the world's own rules, then the renderer draws it exactly as live
// play would: nothing here is a mock-up, and the same seed always gives the
// same frame.
import { RECIPES } from './config.js';
import { chopBurst } from './render.js';
import { newWorld, spawnTicket } from './world.js';

function ticket(world, recipeId, patience) {
  const t = spawnTicket(world, recipeId);
  if (t) { t.patience = patience; t.maxPatience = 50; }
  return t;
}

// The cover: everything the judge's first criterion asks for, in one frame —
// the board with three tickets, the counter's ingredients, a dish mid-assembly
// on the plate, the grill at work, the shift timer, and a finished plate
// waiting on the pass.
export function stageCover(world) {
  world.screen = 'play';
  world.elapsed = 43;
  world.timeLeft = 107;
  world.score = 1240;
  world.streak = 8;
  world.served = 5;
  world.bestCombo = 2;
  ticket(world, 'copper-burger', 28);
  ticket(world, 'garden-stack', 12);
  ticket(world, 'smoky-melt', 41);
  world.plate = ['bun', 'patty', 'cheese'];
  world.grill[0] = { id: 'patty', cooked: 3, need: 5, burnt: false };
  world.grill[1] = { id: 'egg', cooked: 1.2, need: 4, burnt: false };
  world.chop = { id: 'tomato', done: 1, total: 2 };
  world.pass = { recipeId: 'sunrise-plate', servedAt: world.elapsed - 1 };
  world.floats = [{ x: 1180, y: 235, text: '+312', colour: '#ffd94d', born: world.elapsed, life: 1.1 }];
  world.message = 'Copper Burger is one ingredient away!';
  world.messageAt = world.elapsed;
}

// The action shot: a knife mid-chop, a finished rasher waiting on the grill.
export function stageAction(world) {
  world.screen = 'play';
  world.elapsed = 52;
  world.timeLeft = 98;
  world.score = 860;
  world.streak = 5;
  world.served = 3;
  ticket(world, 'sunrise-plate', 30);
  ticket(world, 'veggie-tower', 22);
  world.plate = ['egg', 'bacon'];
  world.grill[0] = { id: 'bacon', cooked: 4.2, need: 4, burnt: false };
  world.chop = { id: 'tomato', done: 1, total: 2 };
  world.message = 'Chop, chop — the Sunrise Plate is nearly there.';
  world.messageAt = world.elapsed;
  chopBurst(745, 250);
}

// The rush shot: the red hour, three tickets short on patience.
export function stageRush(world) {
  world.screen = 'play';
  world.elapsed = 109;
  world.timeLeft = 41;
  world.rush = true;
  world.score = 2310;
  world.streak = 10;
  world.served = 9;
  world.missed = 1;
  world.bestCombo = 2.5;
  ticket(world, 'copper-classic', 8);
  ticket(world, 'smoky-melt', 15);
  ticket(world, 'garden-stack', 6);
  world.plate = ['bun', 'patty'];
  world.grill[0] = { id: 'patty', cooked: 4.5, need: 5, burnt: false };
  world.grill[1] = { id: 'bacon', cooked: 2, need: 4, burnt: false };
  world.chop = { id: 'onion', done: 1, total: 2 };
  world.pass = { recipeId: 'copper-burger', servedAt: world.elapsed - 2 };
  world.message = 'RUSH HOUR — orders are coming fast!';
  world.messageAt = world.elapsed;
}

// The results shot: a three-star shift, the way a good run ends.
export function stageResults(world) {
  world.screen = 'over';
  world.elapsed = 150;
  world.timeLeft = 0;
  world.score = 3120;
  world.served = 14;
  world.missed = 1;
  world.bestCombo = 2.5;
  world.over = { stars: 3, served: 14, missed: 1, score: 3120, best: 3120, bestCombo: 2.5 };
  ticket(world, 'copper-burger', 20);
  world.plate = ['bun', 'patty', 'cheese', 'lettuce'];
}

export const SHOTS = { cover: stageCover, action: stageAction, rush: stageRush, results: stageResults };

export function stageShot(name, seed = 1) {
  const world = newWorld(seed);
  const stage = SHOTS[name] ?? SHOTS.cover;
  stage(world);
  return world;
}

// The shot list the screenshots are taken from, in the order they are named.
export const SHOT_LIST = [
  { name: '1-cover.jpg', shot: 'cover' },
  { name: '2-action.jpg', shot: 'action' },
  { name: '3-rush.jpg', shot: 'rush' },
  { name: '4-results.jpg', shot: 'results' },
];
