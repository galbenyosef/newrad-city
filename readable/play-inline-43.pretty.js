/* src/sound/68_story_cues.js */
/* =====================================================================
 * NEW RAD CITY — SOUND MODULE · 68_story_cues.js
 * Sounds for the main story's last act (the Glowkeepers' lair under Grand
 * Central: Track 61, the Hall of Candles, the M42 "Sun Room" and the Second
 * Sun) — all procedural, all original:
 *   dosimeter_click / dosimeter_loop     the bomb's leaking casing
 *   record_crackle / record_runout / record_needle   the alcove record player
 *   G.sfx.record(title, {pos})           a record on a positional phonograph
 *                                        (e.g. 'Two Bits and a Kiss')
 *   amb_candle_hall (bed), candle_gutter, match_strike, match_flick, candle_snuff
 *   bomb_hum (firing-set dynamotor loop), firing_set_arm, firing_set_off,
 *   cipher_wheel, bomb_key, breaker_trip, drill_loop
 *   clock_tick / clock_tock / clock_tick_loop / clock_minute  (the 09:47 clock)
 *   handcar_loop                         Rose's Park Avenue handcar
 * + interior acoustics archetypes 'candlehall', 'sunroom', 'track61' for the
 *   lair cells (INTERIORS entry `acoustics: '<archetype>'`, or by name).
 * ===================================================================== */
(function () {
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
  D("candle_snuff", {
    dur: 0.5,
    variants: 2,
    gain: 0.22,
    ref: 1.5,
    rolloff: 1.6,
    priority: 6,
    pitchVar: 0.08,
    wet: 0.4,
    lazy: true,
    build(k) {
      k.burst({
        kind: "pink",
        a: 0.01,
        d: 0.2,
        peak: 0.6,
        type: "lowpass",
        f: 900,
      });
      k.tone({ type: "sine", f: 180, f2: 120, a: 0.003, d: 0.05, peak: 0.2 });
    },
  });

  // ------------------------------------------------------------------
  // The Second Sun: firing set, keys, cipher wheel, breaker, drill
  // ------------------------------------------------------------------
  /** The firing set's dynamotor: a 400-cycle whine over 120-cycle transformer hum, beating gently (mono loop). */
  D("bomb_hum", {
    dur: 3,
    loop: true,
    sr: 24000,
    gain: 0.32,
    ref: 3,
    rolloff: 1.2,
    priority: 5,
    pitchVar: 0,
    wet: 0.7,
    lazy: true,
    gen(d, sr, r, n) {
      const TAU = 2 * Math.PI;
      const a = d[0],
        hp = biquad("hp", 60, 0.7, sr),
        bp = biquad("bp", 2400, 2, sr);
      // every partial completes whole cycles in 3 s (seamless): f = k / 3
      const fw = 1200 / 3,
        fb = 1201 / 3,
        fh = 360 / 3,
        fr = 2 / 3;
      for (let i = 0; i < n; i++) {
        const t = i / sr,
          x = r() * 2 - 1;
        const whine =
          Math.sin(TAU * fw * t) * 0.32 +
          Math.sin(TAU * fb * t) * 0.22 +
          Math.sin(TAU * fw * 2 * t) * 0.08 +
          Math.sin(TAU * fw * 3 * t) * 0.03;
        const hum =
          Math.sin(TAU * fh * t) * 0.35 + Math.sin(TAU * fh * 2 * t) * 0.12;
        const brush = bp(x) * 0.08 * (0.6 + 0.4 * Math.sin(TAU * fr * t));
        a[i] = hp(whine * 0.7 + hum + brush);
      }
    },
  });
  D("firing_set_arm", {
    dur: 2.6,
    variants: 1,
    gain: 0.6,
    ref: 4,
    rolloff: 1.1,
    priority: 6,
    pitchVar: 0,
    wet: 0.8,
    lazy: true,
    build(k) {
      k.burst({
        a: 0.001,
        d: 0.03,
        peak: 0.9,
        type: "bandpass",
        f: 1400,
        q: 2,
      }); // relay
      k.tone({ type: "sine", f: 60, f2: 40, a: 0.002, d: 0.1, peak: 0.6 });
      const w = k.tone({
        type: "sawtooth",
        f: 60,
        f2: 400,
        glide: 1.8,
        a: 0.3,
        d: 2.4,
        peak: 0.25,
        filter: ["lowpass", 2400, 0.8],
      }); // spin-up
      k.tone({
        type: "sine",
        start: 0.1,
        f: 30,
        f2: 120,
        glide: 1.8,
        a: 0.4,
        d: 2.2,
        peak: 0.3,
      });
      return w;
    },
  });
  D("firing_set_off", {
    dur: 3.2,
    variants: 1,
    gain: 0.55,
    ref: 4,
    rolloff: 1.1,
    priority: 6,
    pitchVar: 0,
    wet: 0.8,
    lazy: true,
    build(k) {
      k.burst({
        a: 0.001,
        d: 0.04,
        peak: 1,
        type: "bandpass",
        f: 1100,
        q: 1.5,
      });
      k.tone({
        type: "sawtooth",
        f: 400,
        f2: 30,
        glide: 2.8,
        a: 0.005,
        d: 3,
        peak: 0.28,
        filter: ["lowpass", 2000, 0.8],
      }); // spin-down
      k.tone({
        type: "sine",
        f: 120,
        f2: 25,
        glide: 2.6,
        a: 0.005,
        d: 2.8,
        peak: 0.3,
      });
    },
  });
  /** One detent of the brass cipher wheel. */
  D("cipher_wheel", {
    dur: 0.18,
    variants: 4,
    gain: 0.3,
    ref: 1.5,
    rolloff: 1.5,
    priority: 4,
    pitchVar: 0.06,
    wet: 0.4,
    dedupe: 0.04,
    build(k) {
      const m = k.metal(
        1,
        [k.rr(2100, 2500), k.rr(3900, 4600), k.rr(6100, 7000)],
        30,
      );
      k.chain(m.output, k.gain(0.4), k.out);
      k.burst({
        a: 0.0003,
        d: 0.006,
        peak: 1,
        type: "highpass",
        f: 1500,
        dest: m.input,
      });
      k.burst({
        a: 0.0005,
        d: 0.02,
        peak: 0.5,
        type: "bandpass",
        f: 700,
        q: 1.5,
      });
    },
  });
  /** A heavy keyed arming switch: key in, a quarter turn, a solid clunk. */
  D("bomb_key", {
    dur: 1.1,
    variants: 2,
    gain: 0.55,
    ref: 2.5,
    rolloff: 1.3,
    priority: 5,
    pitchVar: 0.04,
    wet: 0.6,
    lazy: true,
    build(k) {
      k.burst({
        a: 0.02,
        d: 0.18,
        peak: 0.4,
        type: "bandpass",
        f: 3800,
        q: 1.6,
      }); // key slides in
      k.grains({
        start: 0.25,
        span: 0.25,
        n: 5,
        f: 2600,
        q: 2,
        gain: 0.35,
        len: 0.006,
      }); // tumblers
      const m = k.metal(k.rr(380, 460), [1, 2.4, 4.1], 18, [1, 0.4, 0.2]);
      k.chain(m.output, k.gain(0.5), k.out);
      k.burst({
        start: 0.55,
        a: 0.001,
        d: 0.03,
        peak: 1,
        type: "lowpass",
        f: 2200,
        dest: m.input,
      }); // clunk
      k.tone({
        type: "sine",
        start: 0.55,
        f: 90,
        f2: 55,
        a: 0.002,
        d: 0.15,
        peak: 0.6,
      });
    },
  });
  /** M42's main breaker tripping: spring clack, an arc, a deep thump, the hum dying. */
  D("breaker_trip", {
    dur: 4,
    variants: 1,
    gain: 0.9,
    ref: 8,
    rolloff: 0.9,
    priority: 7,
    pitchVar: 0,
    wet: 1.1,
    lazy: true,
    build(k) {
      k.burst({ a: 0.0005, d: 0.04, peak: 1, type: "bandpass", f: 1800, q: 1 });
      k.burst({
        start: 0.01,
        a: 0.002,
        d: 0.35,
        peak: 0.8,
        type: "highpass",
        f: 1200,
        shaper: 3,
      }); // arc
      k.tone({
        type: "sine",
        f: 55,
        f2: 30,
        glide: 0.3,
        a: 0.003,
        d: 0.6,
        peak: 1,
      }); // thump
      k.tone({
        type: "sawtooth",
        start: 0.05,
        f: 120,
        f2: 20,
        glide: 3.5,
        a: 0.01,
        d: 3.6,
        peak: 0.25,
        filter: ["lowpass", 900, 0.7],
      });
    },
  });
  /** Brother Tinder's drill crew boring a spare keyway through the casing plate (mono loop). */
  D("drill_loop", {
    dur: 2,
    loop: true,
    sr: 24000,
    gain: 0.45,
    ref: 4,
    rolloff: 1.2,
    priority: 5,
    pitchVar: 0,
    wet: 0.7,
    lazy: true,
    gen(d, sr, r, n) {
      const TAU = 2 * Math.PI;
      const a = d[0],
        grind = biquad("bp", 2600, 1.5, sr),
        lo = biquad("lp", 400, 0.7, sr);
      const fm = (180 * 2) / 2; // 180 Hz motor, whole cycles in 2 s
      for (let i = 0; i < n; i++) {
        const t = i / sr,
          x = r() * 2 - 1;
        const chatter =
          0.6 + 0.4 * Math.sin(TAU * 11 * t) * Math.sin(TAU * 1.5 * t);
        a[i] =
          Math.sin(TAU * fm * t) * 0.25 +
          Math.sin(TAU * fm * 2 * t) * 0.1 +
          grind(x) * 0.9 * chatter +
          lo(x) * 0.6;
      }
    },
  });

  // ------------------------------------------------------------------
  // The clock from Grand Central's information booth (09:31 → 09:47)
  // ------------------------------------------------------------------
  function tickBody(k, f, peak) {
    const m = k.metal(f, [1, 2.71, 5.1], 22, [1, 0.35, 0.12]);
    k.chain(m.output, k.gain(peak), k.out);
    k.burst({
      a: 0.0004,
      d: 0.008,
      peak: 1,
      type: "bandpass",
      f: 2600,
      q: 1.2,
      dest: m.input,
    });
    k.burst({
      a: 0.0005,
      d: 0.03,
      peak: 0.3,
      type: "bandpass",
      f: 420,
      q: 1.5,
    }); // case
  }
  D("clock_tick", {
    dur: 0.35,
    variants: 2,
    gain: 0.35,
    ref: 3,
    rolloff: 1.2,
    priority: 4,
    pitchVar: 0.01,
    wet: 0.9,
    build(k) {
      tickBody(k, 1250, 0.5);
    },
  });
  D("clock_tock", {
    dur: 0.35,
    variants: 2,
    gain: 0.35,
    ref: 3,
    rolloff: 1.2,
    priority: 4,
    pitchVar: 0.01,
    wet: 0.9,
    build(k) {
      tickBody(k, 1050, 0.45);
    },
  });
  /** Tick-tock, one beat a second (2 s loop). */
  D("clock_tick_loop", {
    dur: 2,
    loop: true,
    sr: 24000,
    gain: 0.32,
    ref: 3,
    rolloff: 1.2,
    priority: 5,
    pitchVar: 0,
    wet: 0.9,
    gen(d, sr, r, n) {
      const TAU = 2 * Math.PI;
      const a = d[0];
      [
        [0.0, 1250],
        [1.0, 1050],
      ].forEach(([t0, f]) => {
        const i0 = (t0 * sr) | 0;
        for (let k = 0; k < sr * 0.3 && i0 + k < n; k++) {
          const t = k / sr;
          a[i0 + k] +=
            (k < 2 ? 0.5 : 0) +
            Math.sin(TAU * f * t) * Math.exp(-t * 60) * 0.4 +
            Math.sin(TAU * f * 2.71 * t) * Math.exp(-t * 90) * 0.15 +
            Math.sin(TAU * 420 * t) * Math.exp(-t * 40) * 0.12;
        }
      });
    },
  });
  /** The minute hand stepping on a station master clock: a solenoid clunk and a little spring buzz. */
  D("clock_minute", {
    dur: 0.9,
    variants: 1,
    gain: 0.45,
    ref: 4,
    rolloff: 1.1,
    priority: 5,
    pitchVar: 0,
    wet: 1,
    build(k) {
      k.burst({
        a: 0.0008,
        d: 0.05,
        peak: 1,
        type: "bandpass",
        f: 900,
        q: 1.2,
      });
      k.tone({ type: "sine", f: 140, f2: 90, a: 0.002, d: 0.12, peak: 0.6 });
      const m = k.metal(1, [880, 1760 * 1.03, 3300], 40, [0.5, 0.3, 0.15]);
      k.chain(m.output, k.gain(0.25), k.out);
      k.burst({
        start: 0.01,
        a: 0.0005,
        d: 0.01,
        peak: 1,
        type: "highpass",
        f: 800,
        dest: m.input,
      });
    },
  });

  // ------------------------------------------------------------------
  // Rose's handcar on the Park Avenue spur (mono loop): rail joints + lever creak
  // ------------------------------------------------------------------
  D("handcar_loop", {
    dur: 2.4,
    loop: true,
    sr: 22050,
    gain: 0.4,
    ref: 5,
    rolloff: 1.1,
    priority: 6,
    pitchVar: 0,
    wet: 0.8,
    lazy: true,
    gen(d, sr, r, n) {
      const TAU = 2 * Math.PI;
      const a = d[0],
        rumble = biquad("lp", 160, 0.7, sr),
        creak = biquad("bp", 700, 6, sr);
      for (let i = 0; i < n; i++) {
        const t = i / sr,
          x = r() * 2 - 1;
        let v = rumble(x) * 1.6;
        const ph = t % 1.2; // two rail joints a cycle (clack-clack)
        if (ph < 0.03 || (ph > 0.18 && ph < 0.21))
          v += (r() * 2 - 1) * 0.7 * Math.exp(-((ph % 0.18) * 90));
        const lv = Math.sin((TAU * t) / 1.2); // pump lever, creaking at the ends of its stroke
        v += creak(x) * Math.pow(Math.abs(lv), 8) * 0.5;
        a[i] = v;
      }
    },
  });

  // ------------------------------------------------------------------
  // Positional record player: a procedural record from the radio library
  // through a phonograph chain, from a point in the world.
  // ------------------------------------------------------------------
  const players = new Set();
  function findSong(title) {
    const T = S.radioText;
    const all = [].concat(
      T.rfmSongs || [],
      T.continuityMarches || [],
      T.classicalPieces || [],
    );
    const k = String(title || "").toLowerCase();
    return (
      all.find((s) => s.title.toLowerCase() === k) ||
      all.find((s) => s.title.toLowerCase().indexOf(k) >= 0) ||
      (T.rfmSongs || []).find((s) => s.title === "Two Bits and a Kiss")
    );
  }
  /**
   * G.sfx.record(title, {pos:{x,y,z}, loop=true, volume=1}) → {stop(fade), setPosition(p), isPlaying(), title} | null.
   * Plays the named record (default 'Two Bits and a Kiss') on a phonograph at pos: needle drop, the record with
   * surface noise and wow, the run-out groove for a few turns, then (loop) the needle goes back to the start.
   */
  S.recordPlay = function (title, opts) {
    opts = opts || {};
    const ctx = S.ctx;
    if (!ctx || !S.bus || !S.songs) return null;
    const song = findSong(title);
    if (!song) return null;
    const pos = {
      x: opts.pos ? opts.pos.x : S.listenerPos.x,
      y: opts.pos ? opts.pos.y || 0 : S.listenerPos.y,
      z: opts.pos ? opts.pos.z : S.listenerPos.z,
    };
    const input = ctx.createGain();
    input.gain.value = (opts.volume === undefined ? 1 : opts.volume) * 1.2;
    const box = ctx.createBiquadFilter();
    box.type = "peaking";
    box.frequency.value = 700;
    box.Q.value = 0.9;
    box.gain.value = 4; // horn / cabinet
    const pan = ctx.createPanner();
    pan.panningModel = "equalpower";
    pan.distanceModel = "inverse";
    pan.refDistance = 2;
    pan.rolloffFactor = 1.4;
    pan.maxDistance = 10000;
    S.setPannerPos(pan, pos);
    const send = ctx.createGain();
    send.gain.value = Math.max(0.2, S.env.wet * 1.8);
    input.connect(box);
    box.connect(pan);
    pan.connect(S.bus.world);
    pan.connect(send);
    send.connect(S.bus.revSend);
    const chain = S.inst.radioChain(ctx, input, {
      crackle: 0.55,
      hiss: 0.02,
      lp: 4800,
      hp: 160,
      out: 0.75,
    });
    const h = {
      title: song.title,
      pos,
      cue: null,
      state: "needle",
      at: 0,
      stopped: false,
      runout: null,
    };
    function begin() {
      if (h.stopped) return;
      if (
        !S.inst.allReady(["piano", "bass", "drums", "guitar", "vibes", "pizz"])
      ) {
        ["piano", "bass", "drums", "guitar", "vibes", "pizz"].forEach(
          S.inst.ensure,
        );
        h.state = "wait";
        return;
      }
      S.play("record_needle", { pos, volume: 0.8 });
      const gen = S.songs.make(song);
      const cue = new S.Cue("record:" + song.title, gen, {
        dest: chain.input,
        reverb: 0,
      });
      cue.out.gain.value = S.songs.gainFor(song);
      cue.start(ctx.currentTime + 1.0, 0.2);
      h.cue = cue;
      h.state = "play";
    }
    h.tick = function () {
      if (h.stopped) return;
      const now = ctx.currentTime;
      if (h.state === "wait" || h.state === "needle") {
        begin();
        return;
      }
      if (h.state === "play" && h.cue) {
        h.cue.tick(now, now + 1.2);
        if (h.cue.stopped) {
          h.cue = null;
          h.state = "runout";
          h.at = G.time.real + 7;
          h.runout = S.play("record_runout", { pos, loop: true, volume: 0.9 });
        }
      } else if (h.state === "runout" && G.time.real > h.at) {
        if (h.runout) {
          h.runout.stop(0.3);
          h.runout = null;
        }
        if (opts.loop === false) {
          h.stop(0.5);
          return;
        }
        h.state = "needle";
      }
    };
    h.stop = function (fade) {
      if (h.stopped) return;
      h.stopped = true;
      players.delete(h);
      const f = fade === undefined ? 0.6 : fade;
      if (h.cue) h.cue.stop(f);
      if (h.runout) h.runout.stop(f);
      setTimeout(
        () => {
          try {
            chain.dispose();
            pan.disconnect();
            send.disconnect();
          } catch (e) {
            /* */
          }
        },
        (f + 0.5) * 1000,
      );
    };
    h.setPosition = function (p) {
      if (!p) return;
      pos.x = p.x;
      pos.y = p.y || 0;
      pos.z = p.z;
      S.setPannerPos(pan, pos);
    };
    h.isPlaying = function () {
      return !h.stopped;
    };
    players.add(h);
    return h;
  };
  S.recordStopAll = function (fade) {
    Array.from(players).forEach((p) => p.stop(fade));
  };
  S.story = S.story || {};
  S.story.update = function () {
    for (const p of players) {
      try {
        p.tick();
      } catch (e) {
        G.reportError("sound:record", e);
        p.stop(0);
      }
    }
  };
  G.events.on("reset", () => S.recordStopAll(0));

  // ------------------------------------------------------------------
  // Interior acoustics for the lair (64_spaces.js reads S.spaceArchetypes)
  // ------------------------------------------------------------------
  const ARCH_ADD = {
    // the Hall of Candles: a stone vault of candles, quiet, drips, wicks spitting
    candlehall: {
      fam: "stone",
      over: { 0: "stone", 1: "stone", 2: "gallery", 3: "cathedral" },
      def: "gallery",
      rain: 0,
      beds: { amb_candle_hall: 0.8, amb_tunnel: 0.15 },
      spots: [
        ["candle_gutter", 2.2, { wall: 1 }],
        ["drip", 2],
        ["distant_thud", 0.08, { far: 1 }],
      ],
    },
    // the M42 substation: concrete and dead iron, the firing set's whine is placed by the lair itself
    sunroom: {
      fam: "concrete",
      over: { 0: "bunker", 1: "hall", 2: "hall", 3: "tunnel" },
      def: "hall",
      rain: 0,
      beds: { amb_candle_hall: 0.45, amb_int_machine: 0.12, amb_room: 0.3 },
      spots: [
        ["candle_gutter", 1.2, { wall: 1 }],
        ["pipe_knock", 0.4],
        ["drip", 1.5],
        ["distant_thud", 0.1, { far: 1 }],
      ],
    },
    // the Track 61 platform: a long low tunnel with a dead train in it
    track61: {
      fam: "concrete",
      over: { 0: "tunnel", 1: "tunnel", 2: "tunnel" },
      def: "tunnel",
      rain: 0,
      beds: { amb_tunnel: 0.8, amb_candle_hall: 0.2, amb_int_water: 0.12 },
      spots: [
        ["drip", 4],
        ["rat_scurry", 0.6, { wall: 1 }],
        ["chain_rattle", 0.2],
        ["candle_gutter", 0.5, { wall: 1 }],
        ["distant_thud", 0.15, { far: 1 }],
      ],
    },
  };
  if (S.spaceArch) Object.assign(S.spaceArch, ARCH_ADD);
  if (S.spaceRules)
    S.spaceRules.unshift(
      [/hall of candles|candle hall|candles/i, "candlehall"],
      [/\bm42\b|sun room|substation|second sun/i, "sunroom"],
      [/track 61|track61|sixty-one|glowkeeper lair/i, "track61"],
    );
})();
