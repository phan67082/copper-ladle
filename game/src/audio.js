// The Copper Ladle — sound: small synthesised effects on WebAudio, no files.
// The context starts on the first player gesture, as browsers require.
export function createAudio() {
  let ctx = null;
  let muted = false;

  function ensure() {
    if (!ctx) {
      try {
        ctx = new (window.AudioContext ?? window.webkitAudioContext)();
      } catch {
        ctx = null;
      }
    }
    if (ctx && ctx.state === 'suspended') void ctx.resume();
    return ctx;
  }

  function tone(freq, dur, type, gain, slideTo = null, delay = 0) {
    const ac = ensure();
    if (!ac || muted) return;
    const t0 = ac.currentTime + delay;
    const osc = ac.createOscillator();
    const amp = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo !== null) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    amp.gain.setValueAtTime(0.0001, t0);
    amp.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
    amp.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(amp).connect(ac.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  const sounds = {
    chop() { tone(180, 0.09, 'square', 0.12, 90); tone(1200, 0.05, 'triangle', 0.06, 500); },
    plated() { tone(520, 0.1, 'sine', 0.12, 660); },
    sizzle() { tone(3200, 0.25, 'sawtooth', 0.03, 2400); tone(180, 0.2, 'triangle', 0.08, 140); },
    serve() { tone(880, 0.12, 'sine', 0.14); tone(1318, 0.18, 'sine', 0.14, null, 0.1); },
    ticket() { tone(660, 0.08, 'triangle', 0.08); tone(990, 0.1, 'triangle', 0.08, null, 0.07); },
    miss() { tone(220, 0.3, 'sawtooth', 0.1, 110); },
    burn() { tone(140, 0.25, 'sawtooth', 0.12, 70); },
    buzz() { tone(110, 0.15, 'square', 0.1, 90); },
    rush() { tone(392, 0.12, 'square', 0.1); tone(523, 0.12, 'square', 0.1, null, 0.11); tone(659, 0.2, 'square', 0.1, null, 0.22); },
    click() { tone(700, 0.05, 'sine', 0.08); },
    over() { tone(523, 0.25, 'sine', 0.12); tone(392, 0.25, 'sine', 0.12, null, 0.2); tone(330, 0.4, 'sine', 0.12, null, 0.4); },
  };

  return {
    get muted() { return muted; },
    play(name) { if (sounds[name]) sounds[name](); },
    toggleMute() { muted = !muted; return muted; },
    unlock() { ensure(); },
  };
}
