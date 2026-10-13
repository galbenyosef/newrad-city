// play-inline-43 01 — math
// Lines 20-356 of readable/play-inline-43.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const S = G._snd;
  const D = S.define;
  const biquad = S.biquad,
    slowNoise = S.slowNoise; // gen() bodies resolve these in the worker too
  const TAU = Math.PI * 2;

  // ------------------------------------------------------------------
  // Dosimeter: a dry chirp-tick (quieter, woodier than the goggles' Geiger)
  // ------------------------------------------------------------------
  D("dosimeter_click", {
    dur: 0.05,
    variants: 6,
    gain: 0.32,
    ref: 2,
    rolloff: 1.5,
    bus: "world",
    dedupe: 0,
    maxVoices: 10,
    priority: 3,
    pitchVar: 0.12,
    norm: false,
    gen(d, sr, r, n) {
      const TAU = 2 * Math.PI;
      const a = d[0],
        f = 3100 + r() * 900,
        f2 = 820 + r() * 160;
      for (let i = 0; i < n; i++) {
        const t = i / sr;
        a[i] =
          (i === 0 ? 0.7 : i === 1 ? -0.45 : 0) +
          Math.sin(TAU * f * t) * Math.exp(-t * 1400) * 0.45 +
          Math.sin(TAU * f2 * t) * Math.exp(-t * 260) * 0.28;
      }
    },
  });
  /** The casing's dosimeter, left running: irregular clicks with little clusters (mono, positional). */
  D("dosimeter_loop", {
    dur: 6,
    loop: true,
    sr: 24000,
    gain: 0.3,
    ref: 2.5,
    rolloff: 1.3,
    priority: 5,
    pitchVar: 0,
    wet: 0.5,
    norm: false,
    lazy: true,
    gen(d, sr, r, n) {
      const TAU = 2 * Math.PI;
      const a = d[0];
      let t = 0.05;
      while (t < 5.9) {
        const i0 = (t * sr) | 0,
          f = 2900 + r() * 1200;
        for (let k = 0; k < sr * 0.03 && i0 + k < n; k++) {
          const tt = k / sr;
          a[i0 + k] +=
            (k === 0 ? 0.6 : k === 1 ? -0.4 : 0) +
            Math.sin(TAU * f * tt) * Math.exp(-tt * 1500) * 0.4;
        }
        t += r() < 0.25 ? 0.03 + r() * 0.06 : 0.12 + r() * 0.5; // clusters
      }
      for (let i = 0; i < n; i++) a[i] += (r() * 2 - 1) * 0.004; // meter hiss
    },
  });

  // ------------------------------------------------------------------
  // Record player (45 rpm: one turn = 1.333 s)
  // ------------------------------------------------------------------
  D("record_crackle", {
    dur: 4,
    loop: true,
    sr: 22050,
    gain: 0.22,
    ref: 2,
    rolloff: 1.4,
    priority: 5,
    pitchVar: 0,
    wet: 0.5,
    lazy: true,
    gen(d, sr, r, n) {
      const TAU = 2 * Math.PI;
      const a = d[0],
        lp = biquad("lp", 2600, 0.6, sr),
        hp = biquad("hp", 900, 0.7, sr),
        rum = biquad("lp", 45, 0.7, sr);
      const turn = 4 / 3;
      for (let i = 0; i < n; i++) {
        const t = i / sr,
          x = r() * 2 - 1;
        let v = lp(x) * 0.05 + rum(x) * 0.9;
        if (r() < 0.0011) v += (r() * 2 - 1) * (0.4 + r() * 0.5); // crackle pops
        const ph = (t % turn) / turn; // the same scratch once a turn
        if (ph < 0.004) v += Math.sin(ph * 2400) * 0.35 * (1 - ph / 0.004);
        a[i] = hp(v) * 0.6 + v * 0.4;
      }
    },
  });
  D("record_runout", {
    dur: 4,
    loop: true,
    sr: 22050,
    gain: 0.26,
    ref: 2,
    rolloff: 1.4,
    priority: 5,
    pitchVar: 0,
    wet: 0.5,
    lazy: true,
    gen(d, sr, r, n) {
      const TAU = 2 * Math.PI;
      const a = d[0],
        lp = biquad("lp", 2000, 0.6, sr),
        body = biquad("bp", 180, 3, sr);
      const turn = 4 / 3;
      for (let i = 0; i < n; i++) {
        const t = i / sr,
          ph = (t % turn) / turn,
          x = r() * 2 - 1;
        let v = lp(x) * 0.06;
        if (ph < 0.012)
          v += body(x * (1 - ph / 0.012) * 3) * 0.9 + (ph < 0.002 ? 0.5 : 0); // the run-out groove's thump
        if (r() < 0.0008) v += (r() * 2 - 1) * 0.4;
        a[i] = v;
      }
    },
  });
  D("record_needle", {
    dur: 1.2,
    variants: 2,
    gain: 0.35,
    ref: 2,
    rolloff: 1.4,
    priority: 6,
    pitchVar: 0.05,
    wet: 0.5,
    lazy: true,
    build(k) {
      k.tone({
        type: "sine",
        f: 70,
        f2: 40,
        glide: 0.08,
        a: 0.002,
        d: 0.12,
        peak: 0.7,
      }); // tonearm lands
      k.burst({
        a: 0.001,
        d: 0.02,
        peak: 0.6,
        type: "bandpass",
        f: 2200,
        q: 1,
      });
      k.grains({
        start: 0.05,
        span: 1.0,
        n: 14,
        f: 3000,
        q: 0.8,
        gain: 0.25,
        len: 0.006,
      }); // lead-in crackle
      k.burst({
        kind: "pink",
        start: 0.04,
        a: 0.05,
        d: 1.0,
        peak: 0.12,
        type: "lowpass",
        f: 900,
      });
    },
  });

  // ------------------------------------------------------------------
  // Candles & matches
  // ------------------------------------------------------------------
  /** The Hall of Candles: deep stone air, a thousand small flames fluttering, wax ticking, far water (stereo bed). */
  D("amb_candle_hall", {
    dur: 10,
    loop: true,
    bus: "amb",
    channels: 2,
    sr: 16000,
    gain: 0.45,
    pitchVar: 0,
    priority: 4,
    wet: 0,
    lazy: true,
    gen(d, sr, r, n) {
      const TAU = 2 * Math.PI;
      for (let c = 0; c < 2; c++) {
        const a = d[c],
          air = biquad("lp", 140, 0.7, sr),
          fl = biquad("bp", 420, 0.9, sr),
          fl2 = biquad("bp", 900, 1.2, sr),
          am = slowNoise(r, 10, 23),
          am2 = slowNoise(r, 10, 37);
        for (let i = 0; i < n; i++) {
          const t = i / sr,
            x = r() * 2 - 1;
          const flutter =
            Math.max(0, 0.5 + 0.5 * am(t + c * 0.37)) *
            (0.6 + 0.4 * Math.max(0, am2(t)));
          let v =
            air(x) * 2.4 +
            fl(x) * 0.12 * flutter +
            fl2(r() * 2 - 1) * 0.04 * flutter;
          if (r() < 0.00025) v += (r() * 2 - 1) * 0.25; // a wick spits
          a[i] = v;
        }
        // a slow far drip, twice per loop
        for (const tt of [2.3 + c * 0.9, 7.1 - c * 1.3]) {
          const i0 = (tt * sr) | 0,
            f = 1300 + r() * 500;
          for (let k = 0; k < sr * 0.25 && i0 + k < n; k++) {
            const q = k / sr;
            a[i0 + k] +=
              Math.sin(TAU * f * (1 + q * 0.6) * q) * Math.exp(-q * 30) * 0.09;
          }
        }
      }
    },
  });
  D("candle_gutter", {
    dur: 0.8,
    variants: 3,
    gain: 0.25,
    ref: 1.5,
    rolloff: 1.6,
    priority: 6,
    pitchVar: 0.1,
    wet: 0.6,
    lazy: true,
    build(k) {
      k.grains({
        span: 0.5,
        n: 7,
        f: 2400,
        q: 1,
        gain: 0.5,
        len: 0.008,
        skew: 1.6,
      });
      k.burst({
        kind: "pink",
        a: 0.02,
        d: 0.5,
        peak: 0.25,
        type: "bandpass",
        f: 500,
        q: 0.8,
      });
    },
  });
  D("match_strike", {
    dur: 1.4,
    variants: 3,
    gain: 0.45,
    ref: 2,
    rolloff: 1.4,
    priority: 5,
    pitchVar: 0.06,
    wet: 0.5,
    lazy: true,
    build(k) {
      k.burst({
        a: 0.01,
        d: 0.12,
        peak: 0.8,
        type: "bandpass",
        f: 3200,
        f2: 5200,
        fT: 0.12,
        q: 1.4,
      }); // scrape
      k.burst({
        start: 0.1,
        a: 0.004,
        d: 0.05,
        peak: 0.9,
        type: "highpass",
        f: 2500,
      }); // head catches
      k.burst({
        kind: "pink",
        start: 0.11,
        a: 0.02,
        d: 0.45,
        peak: 0.6,
        type: "bandpass",
        f: 900,
        f2: 400,
        fT: 0.4,
        q: 0.7,
      }); // flare
      k.burst({
        kind: "brown",
        start: 0.2,
        a: 0.1,
        d: 1.0,
        peak: 0.12,
        type: "lowpass",
        f: 600,
      }); // burning
    },
  });
  /** Shaking a match out: one quick flick of the wrist. */
  D("match_flick", {
    dur: 0.4,
    variants: 2,
    gain: 0.3,
    ref: 2,
    rolloff: 1.4,
    priority: 6,
    pitchVar: 0.08,
    wet: 0.4,
    lazy: true,
    build(k) {
      k.burst({
        kind: "pink",
        a: 0.03,
        d: 0.18,
        peak: 0.6,
        type: "bandpass",
        f: 700,
        f2: 300,
        fT: 0.15,
        q: 0.8,
      });
    },
  });
