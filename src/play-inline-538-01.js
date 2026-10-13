// play-inline-538 01 — vol
// Lines 11-285 of readable/play-inline-538.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const AR = G.arcade._;

  const MAX_VOICES = 10;
  let out = null,
    outCtx = null,
    noiseBuf = null,
    voices = 0,
    lastFallback = 0,
    muted = false;

  function ctx() {
    try {
      if (G.isStub("sfx")) return null;
      const c = G.sfx.context;
      if (
        c &&
        typeof c.createOscillator === "function" &&
        c.state === "running"
      )
        return c;
    } catch (e) {
      /* stubbed */
    }
    return null;
  }
  function volume() {
    try {
      const v = G.sfx.getVolumes ? G.sfx.getVolumes() : null;
      if (v)
        return (v.master == null ? 1 : v.master) * (v.ui == null ? 1 : v.ui);
    } catch (e) {
      /* stub */
    }
    return 0.8;
  }
  /** Lazily builds the output chain: voices → gain → soft compressor → destination. */
  function output(c) {
    if (out && outCtx === c) {
      out.gain.value = 0.32 * volume();
      return out;
    }
    outCtx = c;
    out = c.createGain();
    const comp = c.createDynamicsCompressor();
    comp.threshold.value = -14;
    comp.ratio.value = 6;
    comp.attack.value = 0.002;
    comp.release.value = 0.12;
    // a little speaker colouring: an 8-inch cabinet speaker behind a grille
    const hp = c.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 120;
    const lp = c.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 6400;
    out.connect(hp);
    hp.connect(lp);
    lp.connect(comp);
    comp.connect(c.destination);
    out.gain.value = 0.32 * volume();
    const len = Math.floor(c.sampleRate * 0.8);
    noiseBuf = c.createBuffer(1, len, c.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return out;
  }
  function fallback(name) {
    const now = performance.now();
    if (now - lastFallback < 90) return;
    lastFallback = now;
    try {
      G.sfx.play(name || "ui_click", { volume: 0.35 });
    } catch (e) {
      /* stub */
    }
  }
  function voiceEnded() {
    voices = Math.max(0, voices - 1);
  }

  /**
   * beep({f, f2?, dur=0.08, type='square', vol=0.5, delay=0, fb?})
   * f → f2 exponential glide over the duration. fb = G.sfx fallback name.
   */
  function beep(o) {
    if (muted) return;
    const c = ctx();
    if (!c) {
      if (o && o.fb) fallback(o.fb);
      return;
    }
    if (voices >= MAX_VOICES) return;
    const dst = output(c);
    const t0 = c.currentTime + (o.delay || 0),
      dur = o.dur || 0.08,
      v = o.vol == null ? 0.5 : o.vol;
    const osc = c.createOscillator(),
      g = c.createGain();
    osc.type = o.type || "square";
    osc.frequency.setValueAtTime(Math.max(20, o.f || 440), t0);
    if (o.f2)
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, o.f2), t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(v, t0 + 0.004);
    g.gain.setValueAtTime(v, t0 + dur * 0.55);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g);
    g.connect(dst);
    voices++;
    osc.onended = voiceEnded;
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }
  /** noise({dur=0.3, f=1800, f2=200, vol=0.6, delay=0, fb?}) — filtered noise burst (explosions, hits). */
  function noise(o) {
    if (muted) return;
    const c = ctx();
    if (!c) {
      if (o && o.fb) fallback(o.fb);
      return;
    }
    if (voices >= MAX_VOICES) return;
    const dst = output(c);
    const t0 = c.currentTime + (o.delay || 0),
      dur = o.dur || 0.3,
      v = o.vol == null ? 0.6 : o.vol;
    const src = c.createBufferSource();
    src.buffer = noiseBuf;
    const lp = c.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.setValueAtTime(o.f || 1800, t0);
    lp.frequency.exponentialRampToValueAtTime(
      Math.max(40, o.f2 || 200),
      t0 + dur,
    );
    const g = c.createGain();
    g.gain.setValueAtTime(v, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(lp);
    lp.connect(g);
    g.connect(dst);
    voices++;
    src.onended = voiceEnded;
    src.start(t0, Math.random() * 0.3);
    src.stop(t0 + dur + 0.02);
  }
  /** seq([[freq, dur], ...], {type, vol, gap}) — little jingles. freq 0 = rest. */
  function seq(notes, o) {
    o = o || {};
    let t = o.delay || 0;
    for (const n of notes) {
      if (n[0] > 0)
        beep({
          f: n[0],
          dur: n[1] * 0.95,
          type: o.type || "square",
          vol: o.vol == null ? 0.35 : o.vol,
          delay: t,
        });
      t += n[1] + (o.gap || 0);
    }
    if (!ctx() && o.fb) fallback(o.fb);
  }

  // note helper: semitone offsets from A4
  const N = (semi) => 440 * Math.pow(2, semi / 12);

  AR.audio = {
    beep,
    noise,
    seq,
    N,
    setMuted(m) {
      muted = !!m;
    },
    isMuted: () => muted,
    // Cabinet screen cues (ids named after what they are)
    uiMove() {
      beep({ f: 880, dur: 0.03, vol: 0.18, fb: "ui_hover" });
    },
    uiSelect() {
      beep({ f: 660, f2: 990, dur: 0.07, vol: 0.25, fb: "ui_select" });
    },
    uiBack() {
      beep({ f: 520, f2: 300, dur: 0.08, vol: 0.22, fb: "ui_back" });
    },
    coin() {
      // a quarter rattles down the chute: two bright pings, the coin-mech clunk, then the credit chirp
      beep({ f: 2637, dur: 0.05, vol: 0.16, type: "triangle", fb: "ui_click" });
      beep({ f: 3136, dur: 0.06, vol: 0.12, type: "triangle", delay: 0.07 });
      noise({ dur: 0.07, f: 1200, f2: 300, vol: 0.45, delay: 0.16 });
      seq(
        [
          [N(7), 0.05],
          [N(14), 0.05],
          [N(19), 0.1],
        ],
        { delay: 0.3, vol: 0.2, type: "square" },
      );
    },
    powerOn() {
      beep({
        f: 60,
        f2: 15000,
        dur: 0.35,
        vol: 0.05,
        type: "sine",
        fb: "ui_click",
      });
    },
    start() {
      seq(
        [
          [N(3), 0.09],
          [N(7), 0.09],
          [N(10), 0.09],
          [N(15), 0.22],
        ],
        { vol: 0.3, fb: "ui_select" },
      );
    },
    gameOver() {
      seq(
        [
          [N(10), 0.16],
          [N(6), 0.16],
          [N(3), 0.16],
          [N(-2), 0.45],
        ],
        { vol: 0.32, type: "triangle", fb: "terminal_fail" },
      );
    },
    highScore() {
      seq(
        [
          [N(15), 0.08],
          [N(19), 0.08],
          [N(22), 0.08],
          [N(27), 0.08],
          [N(22), 0.08],
          [N(27), 0.3],
        ],
        { vol: 0.3, fb: "levelup" },
      );
    },
    houseRecord() {
      seq(
        [
          [N(10), 0.07],
          [N(15), 0.07],
          [N(19), 0.07],
          [N(22), 0.07],
          [N(27), 0.07],
          [N(31), 0.07],
          [N(34), 0.4],
        ],
        { vol: 0.3, type: "square", fb: "levelup" },
      );
    },
    victory() {
      seq(
        [
          [N(3), 0.12],
          [N(7), 0.12],
          [N(10), 0.12],
          [N(15), 0.25],
          [N(10), 0.12],
          [N(15), 0.5],
        ],
        { vol: 0.32, fb: "quest_complete" },
      );
    },
  };
