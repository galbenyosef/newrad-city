// play-inline-25 06 — peak
// Lines 1519-1863 of readable/play-inline-25.pretty.js (statement-aligned).
  D("reload_energy", {
    dur: 1.2,
    variants: 1,
    gain: 0.5,
    ref: 4,
    wet: 0.3,
    maxVoices: 2,
    priority: 4,
    build(k) {
      k.tone({
        type: "sine",
        start: 0.05,
        f: 900,
        f2: 300,
        glide: 0.25,
        a: 0.005,
        d: 0.25,
        peak: 0.25,
      }); // power down
      slide(k, 0.1, 0.1, 1800, 2600, 0.35);
      clack(k, 0.45, 1300, 0.7);
      k.tone({
        type: "sine",
        start: 0.6,
        f: 400,
        f2: 2200,
        glide: 0.35,
        a: 0.02,
        d: 0.35,
        peak: 0.25,
      }); // charge up whine
      k.tone({
        type: "square",
        start: 0.98,
        f: 1760,
        a: 0.002,
        d: 0.05,
        peak: 0.1,
        filter: ["lowpass", 3000],
      });
    },
  });
  D("empty_click", {
    dur: 0.18,
    variants: 2,
    gain: 0.45,
    ref: 3,
    wet: 0.2,
    maxVoices: 2,
    priority: 1,
    dedupe: 0.08,
    build(k) {
      const m = k.metal(1, [2800, 5100, 7300], 25);
      k.chain(m.output, k.gain(0.6), k.out);
      k.burst({
        a: 0.0002,
        d: 0.006,
        peak: 1,
        type: "highpass",
        f: 2500,
        dest: m.input,
      });
      k.burst({
        a: 0.0002,
        d: 0.008,
        peak: 0.7,
        type: "bandpass",
        f: 3500,
        q: 2,
      });
    },
  });
  D("weapon_draw", {
    dur: 0.55,
    variants: 2,
    gain: 0.4,
    ref: 3,
    wet: 0.2,
    maxVoices: 2,
    priority: 2,
    dedupe: 0.1,
    build(k) {
      k.burst({
        kind: "pink",
        a: 0.08,
        d: 0.2,
        peak: 0.5,
        type: "bandpass",
        f: 2200,
        q: 0.7,
      }); // cloth
      k.grains({
        start: 0.02,
        span: 0.2,
        n: 8,
        f: 3000,
        q: 0.8,
        gain: 0.25,
        len: 0.01,
      });
      slide(k, 0.22, 0.06, 2500, 3500, 0.35);
      clack(k, 0.3, 1600, 0.6);
    },
  });
  D("weapon_holster", {
    dur: 0.45,
    variants: 1,
    gain: 0.35,
    ref: 3,
    wet: 0.2,
    priority: 6,
    build(k) {
      clack(k, 0.02, 1400, 0.5);
      k.burst({
        kind: "pink",
        start: 0.05,
        a: 0.06,
        d: 0.2,
        peak: 0.45,
        type: "bandpass",
        f: 1900,
        q: 0.7,
      });
    },
  });
  D("melee_swing", {
    dur: 0.45,
    variants: 3,
    gain: 0.55,
    ref: 4,
    wet: 0.2,
    maxVoices: 3,
    priority: 2,
    dedupe: 0.05,
    build(k) {
      const n = k.noise("white", 0, 0.4);
      const f = k.filt("bandpass", 400, 2.2);
      k.env(f.frequency, [
        [0, 350],
        [0.13, k.rr(1400, 1900)],
        [0.3, 500],
      ]);
      const g = k.gain(0);
      k.env(g.gain, [
        [0, 0.0001],
        [0.12, 0.9],
        [0.3, 0.0001],
      ]);
      k.chain(n, f, g, k.out);
      const w = k.osc("triangle", 180, 0, 0.35);
      k.env(w.frequency, [
        [0, 150],
        [0.13, 260],
        [0.3, 140],
      ]);
      const wg = k.gain(0);
      k.env(wg.gain, [
        [0, 0.0001],
        [0.12, 0.08],
        [0.3, 0.0001],
      ]);
      k.chain(w, wg, k.out);
    },
  });
  D("melee_hit", {
    dur: 0.6,
    variants: 3,
    gain: 0.8,
    ref: 6,
    wet: 0.5,
    maxVoices: 4,
    priority: 2,
    dedupe: 0.02,
    build(k) {
      k.tone({
        type: "sine",
        f: k.rr(100, 130),
        f2: 55,
        glide: 0.1,
        a: 0.001,
        d: 0.14,
        peak: 1.2,
      });
      k.burst({
        kind: "white",
        a: 0.0008,
        d: 0.09,
        peak: 1,
        type: "lowpass",
        f: 1100,
        shaper: 3,
      });
      k.grains({
        start: 0.003,
        span: 0.05,
        n: 6,
        f: 1600,
        q: 1.2,
        gain: 0.5,
        len: 0.008,
      }); // crunch
      k.burst({
        kind: "pink",
        start: 0.01,
        a: 0.005,
        d: 0.18,
        peak: 0.25,
        type: "bandpass",
        f: 500,
        q: 1,
      });
    },
  });
  D("punch", {
    dur: 0.4,
    variants: 3,
    gain: 0.7,
    ref: 5,
    wet: 0.4,
    maxVoices: 4,
    priority: 2,
    dedupe: 0.02,
    build(k) {
      k.tone({
        type: "sine",
        f: k.rr(140, 170),
        f2: 70,
        glide: 0.07,
        a: 0.001,
        d: 0.1,
        peak: 1,
      });
      k.burst({ a: 0.0005, d: 0.02, peak: 0.8, type: "highpass", f: 1500 }); // slap
      k.burst({
        a: 0.001,
        d: 0.07,
        peak: 0.7,
        type: "lowpass",
        f: 800,
        shaper: 2,
      });
    },
  });

  // ------------------------------------------------------------------
  // Impacts
  // ------------------------------------------------------------------
  D("bullet_impact", {
    dur: 0.45,
    variants: 4,
    gain: 0.55,
    ref: 4,
    maxVoices: 6,
    priority: 1,
    dedupe: 0,
    pitchVar: 0.12,
    build(k) {
      k.burst({ a: 0.0002, d: 0.008, peak: 1, type: "highpass", f: 2600 });
      k.burst({
        a: 0.0005,
        d: 0.035,
        peak: 0.7,
        type: "bandpass",
        f: k.rr(700, 1100),
        q: 1.5,
        shaper: 2,
      });
      k.grains({
        start: 0.01,
        span: 0.2,
        n: 7,
        f: k.rr(2500, 4000),
        q: 1,
        gain: 0.35,
        len: 0.006,
        skew: 1.6,
      }); // chips
    },
  });
  D("bullet_impact_metal", {
    dur: 0.6,
    variants: 3,
    gain: 0.55,
    ref: 5,
    maxVoices: 5,
    priority: 3,
    dedupe: 0,
    pitchVar: 0.12,
    build(k) {
      const m = k.metal(
        1,
        [k.rr(900, 1300), k.rr(2300, 2800), k.rr(3900, 4700), 6100],
        35,
      );
      k.chain(m.output, k.gain(0.7), k.out);
      k.burst({
        a: 0.0002,
        d: 0.01,
        peak: 1,
        type: "highpass",
        f: 1500,
        dest: m.input,
      });
      k.burst({ a: 0.0002, d: 0.01, peak: 0.8, type: "highpass", f: 3000 });
    },
  });
  D("bullet_flesh", {
    dur: 0.35,
    variants: 3,
    gain: 0.6,
    ref: 4,
    maxVoices: 5,
    priority: 1,
    dedupe: 0,
    build(k) {
      k.burst({
        a: 0.001,
        d: 0.06,
        peak: 1,
        type: "lowpass",
        f: 600,
        shaper: 2,
      });
      k.burst({
        start: 0.005,
        a: 0.004,
        d: 0.09,
        peak: 0.6,
        type: "bandpass",
        f: 1000,
        f2: 380,
        fT: 0.09,
        q: 4,
      }); // squelch
      k.tone({
        type: "sine",
        f: 150,
        f2: 70,
        glide: 0.05,
        a: 0.001,
        d: 0.06,
        peak: 0.6,
      });
    },
  });
