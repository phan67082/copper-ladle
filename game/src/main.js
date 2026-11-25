// The Copper Ladle — the entry point: the canvas, the clock, the screens,
// and the screenshot mode the maker uses to take the entry's pictures.
import { VIEW } from './config.js';
import { createAudio } from './audio.js';
import { attachInput } from './input.js';
import { draw } from './render.js';
import { stageShot } from './shots.js';
import { newWorld, spawnTicket, step } from './world.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = VIEW.width;
canvas.height = VIEW.height;

const params = new URLSearchParams(location.search);
const shotName = params.get('shot');
const audio = createAudio();

// One world object for the whole session: the input handlers close over it,
// so a fresh shift resets this object in place instead of replacing it.
const world = newWorld(7);

function startShift() {
  audio.unlock();
  Object.assign(world, newWorld(7));
  world.screen = 'play';
  spawnTicket(world);
  spawnTicket(world);
}

if (shotName) {
  // A screenshot scene: stage the state, draw it, and hold it still.
  Object.assign(world, stageShot(shotName, 7));
  document.title = `The Copper Ladle — ${shotName}`;
  const repaint = () => {
    // Repaint only: particles settle and the wobble breathes, but the kitchen
    // clock never advances, so the frame stays the staged one.
    draw(ctx, world, performance.now() / 1000);
    requestAnimationFrame(repaint);
  };
  requestAnimationFrame(repaint);
} else {
  const input = attachInput(canvas, world, audio, (change) => {
    if (change === 'start' || change === 'again') startShift();
  });
  // A debug handle for play-testing; the game never reads it.
  window.__world = world;

  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (!input.isPaused()) {
      const cues = step(world, dt);
      for (const cue of cues) audio.play(cue);
    }
    draw(ctx, world, now / 1000);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // A stray Enter on the results screen starts a fresh shift.
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && world.screen === 'over') startShift();
  });
}
