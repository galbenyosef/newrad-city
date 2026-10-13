// play-inline-27 06 — gain
// Lines 1694-2037 of readable/play-inline-27.pretty.js (statement-aligned).
  D("tonic", {
    dur: 1.4,
    variants: 1,
    gain: 0.45,
    bus: "ui",
    dedupe: 0.3,
    priority: 3,
    build(k) {
      // cork + liquid bloops + drip
      const n = k.noise("brown", 0, 0.6),
        f = k.filt("lowpass", 500, 3),
        g = k.gain(0);
      const am = k.osc("sine", 7, 0, 0.6),
        ag = k.gain(250);
      k.chain(am, ag, f.frequency);
      k.env(g.gain, [
        [0, 0.0001],
        [0.1, 0.6],
        [0.55, 0.0001],
      ]);
      k.chain(n, f, g, k.out);
      for (let i = 0; i < 6; i++) {
        const st = 0.15 + i * k.rr(0.1, 0.18),
          fr = k.rr(300, 700);
        k.tone({
          type: "sine",
          start: st,
          f: fr,
          f2: fr * 2,
          glide: 0.04,
          a: 0.004,
          d: 0.05,
          peak: 0.3,
        });
      }
      k.tone({
        type: "sine",
        start: 1.1,
        f: 1400,
        f2: 700,
        glide: 0.05,
        a: 0.002,
        d: 0.12,
        peak: 0.25,
      });
      click(k, 0, 2000, 0.4);
    },
  });
  /** Iodine tabs: a small tin rattled, two tablets tipped out, a swallow. */
  D("iodine_tabs", {
    dur: 0.9,
    variants: 2,
    gain: 0.4,
    bus: "ui",
    dedupe: 0.3,
    priority: 3,
    build(k) {
      k.grains({
        start: 0,
        span: 0.22,
        n: 9,
        f: 3600,
        q: 4,
        gain: 0.5,
        len: 0.006,
      });
      click(k, 0.3, 3000, 0.4);
      click(k, 0.36, 3300, 0.35);
      gulp(k, 0.55, 0.6);
    },
  });
  S.aliasOf("use_chem", "inject");

  // ------------------------------------------------------------------
  // Pickups, containers, barter
  // ------------------------------------------------------------------
  D("pickup", {
    dur: 0.4,
    variants: 3,
    gain: 0.35,
    bus: "ui",
    dedupe: 0.05,
    priority: 1,
    build(k) {
      k.burst({
        kind: "pink",
        a: 0.02,
        d: 0.12,
        peak: 0.6,
        type: "bandpass",
        f: 1800,
        q: 0.7,
      });
      k.burst({
        start: 0.08,
        a: 0.002,
        d: 0.05,
        peak: 0.6,
        type: "lowpass",
        f: 900,
      });
    },
  });
  /** Ration scrip: a fold of paper notes riffled and snapped, the paper crisp from twenty years in a drawer. */
  D("pickup_scrip", {
    dur: 0.55,
    variants: 3,
    gain: 0.4,
    bus: "ui",
    dedupe: 0.05,
    priority: 1,
    build(k) {
      const n = 4 + ((k.r() * 4) | 0);
      for (let i = 0; i < n; i++)
        k.burst({
          kind: "pink",
          start: i * k.rr(0.03, 0.05),
          a: 0.003,
          d: k.rr(0.02, 0.04),
          peak: k.rr(0.4, 0.8),
          type: "bandpass",
          f: k.rr(2400, 4200),
          q: 1.2,
        });
      k.burst({
        start: 0.24,
        a: 0.001,
        d: 0.03,
        peak: 0.9,
        type: "highpass",
        f: 1800,
      }); // snap
      k.burst({
        start: 0.25,
        a: 0.002,
        d: 0.05,
        peak: 0.3,
        type: "lowpass",
        f: 700,
      });
    },
  });
  D("pickup_weapon", {
    dur: 0.5,
    variants: 2,
    gain: 0.4,
    bus: "ui",
    dedupe: 0.05,
    priority: 2,
    build(k) {
      k.burst({
        kind: "pink",
        a: 0.03,
        d: 0.12,
        peak: 0.5,
        type: "bandpass",
        f: 1600,
        q: 0.7,
      });
      const m = k.metal(1, [800, 1900, 3100], 18);
      k.chain(m.output, k.gain(0.7), k.out);
      k.burst({
        start: 0.1,
        a: 0.0003,
        d: 0.012,
        peak: 0.9,
        type: "highpass",
        f: 600,
        dest: m.input,
      });
      k.burst({
        start: 0.16,
        a: 0.0003,
        d: 0.01,
        peak: 0.5,
        type: "highpass",
        f: 600,
        dest: m.input,
      });
    },
  });
  D("pickup_armor", {
    dur: 0.6,
    variants: 2,
    gain: 0.4,
    bus: "ui",
    dedupe: 0.05,
    priority: 2,
    build(k) {
      k.burst({
        kind: "pink",
        a: 0.05,
        d: 0.25,
        peak: 0.6,
        type: "bandpass",
        f: 1200,
        q: 0.6,
      });
      k.grains({
        start: 0.05,
        span: 0.25,
        n: 8,
        f: 900,
        q: 3,
        gain: 0.3,
        len: 0.02,
      }); // leather creaks
      const m = k.metal(1, [600, 1500], 12);
      k.chain(m.output, k.gain(0.5), k.out);
      k.burst({
        start: 0.25,
        a: 0.0005,
        d: 0.015,
        peak: 0.7,
        type: "highpass",
        f: 500,
        dest: m.input,
      });
    },
  });
  D("container_open", {
    dur: 1.0,
    variants: 3,
    gain: 0.45,
    ref: 4,
    wet: 0.4,
    dedupe: 0.1,
    priority: 2,
    build(k, v) {
      // hinge creak (stick-slip friction) + latch + rummage
      click(k, 0, 2000, 0.6);
      const o = k.osc("sawtooth", k.rr(180, 320), 0.05, 0.4);
      k.env(o.frequency, [
        [0.05, 220 + v * 40],
        [0.4, 330 + v * 60, "l"],
      ]);
      const am = k.osc("square", k.rr(14, 22), 0.05, 0.4),
        ag = k.gain(0.5);
      const g = k.gain(0);
      k.env(g.gain, [
        [0.05, 0.0001],
        [0.12, 0.25],
        [0.42, 0.0001],
      ]);
      k.chain(am, ag, g.gain);
      k.chain(o, k.filt("bandpass", 1100, 4), g, k.out);
      k.grains({
        start: 0.45,
        span: 0.4,
        n: 10,
        f: 2200,
        q: 0.8,
        gain: 0.3,
        len: 0.015,
      });
    },
  });
  D("container_close", {
    dur: 0.5,
    variants: 2,
    gain: 0.45,
    ref: 4,
    wet: 0.4,
    dedupe: 0.1,
    priority: 2,
    build(k) {
      k.burst({ a: 0.002, d: 0.08, peak: 1, type: "lowpass", f: 700 });
      k.tone({
        type: "sine",
        f: 140,
        f2: 80,
        glide: 0.05,
        a: 0.001,
        d: 0.08,
        peak: 0.6,
      });
      click(k, 0.06, 2600, 0.5);
    },
  });
  D("barter_trade", {
    dur: 1.2,
    variants: 1,
    gain: 0.45,
    bus: "ui",
    dedupe: 0.3,
    priority: 3,
    build(k) {
      bell(k, 0, 93, 1.0, 0.35);
      bell(k, 0.005, 88, 0.9, 0.2); // ka-ching
      k.burst({
        start: 0.1,
        a: 0.01,
        d: 0.2,
        peak: 0.35,
        type: "bandpass",
        f: 1500,
        q: 1,
      }); // drawer
      k.grains({
        start: 0.15,
        span: 0.3,
        n: 10,
        f: 5000,
        q: 6,
        gain: 0.35,
        len: 0.004,
      }); // coins
    },
  });

  // ------------------------------------------------------------------
  // Warnings & body
  // ------------------------------------------------------------------
  D("sneak_detected", {
    dur: 1.3,
    variants: 1,
    gain: 0.4,
    bus: "ui",
    dedupe: 1,
    priority: 3,
    build(k) {
      const lp = k.filt("lowpass", 3500, 0.7),
        g = k.gain(0);
      k.env(g.gain, [
        [0, 0.0001],
        [0.02, 0.35],
        [0.8, 0.0001],
      ]);
      [72, 73, 79].forEach((m) => {
        const o = k.osc("sawtooth", mtof(m), 0, 0.9);
        o.connect(lp);
      });
      k.chain(lp, g, k.out);
      k.tone({
        type: "sine",
        f: 70,
        f2: 45,
        glide: 0.2,
        a: 0.002,
        d: 0.4,
        peak: 0.6,
      });
    },
  });
