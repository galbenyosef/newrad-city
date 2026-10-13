// play-inline-43 02 — peak
// Lines 357-702 of readable/play-inline-43.pretty.js (statement-aligned).
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
