// play-inline-28 04 — gain
// Lines 1009-1354 of readable/play-inline-28.pretty.js (statement-aligned).
  D("alarm", {
    dur: 1.0,
    variants: 1,
    gain: 0.5,
    ref: 25,
    rolloff: 0.8,
    wet: 0.8,
    exactLoop: true,
    sr: 32000,
    priority: 4,
    pitchVar: 0,
    maxVoices: 2,
    gen(d, sr, r, n) {
      // electric fire-alarm bell: a striker at 18 Hz hammering a two-mode bell
      const a = d[0],
        f1 = 1250,
        f2 = 2980,
        rate = 18;
      for (let i = 0; i < n; i++) {
        const t = i / sr,
          tp = ((t * rate) % 1) / rate;
        a[i] =
          (Math.sin(2 * Math.PI * f1 * t) * 0.6 +
            Math.sin(2 * Math.PI * f2 * t) * 0.3) *
          (0.35 + 0.65 * Math.exp(-tp * 60));
      }
    },
  });
  D("pa_chime", {
    dur: 2.2,
    variants: 1,
    gain: 0.35,
    ref: 30,
    rolloff: 0.6,
    wet: 1.2,
    priority: 6,
    pitchVar: 0,
    build(k) {
      [
        [0, 76],
        [0.35, 72],
        [0.7, 67],
      ].forEach((n) => {
        S.jingleKit.bell(k, n[0], n[1], 1.4, 0.4);
      });
    },
  });

  // ------------------------------------------------------------------
  // Loops: fire, electricity
  // ------------------------------------------------------------------
  D("fire_loop", {
    dur: 4,
    loop: true,
    gain: 0.5,
    ref: 4,
    rolloff: 1.2,
    sr: 32000,
    priority: 3,
    pitchVar: 0.05,
    wet: 0.5,
    gen(d, sr, r, n) {
      const a = d[0];
      let lp = 0,
        lp2 = 0,
        ring = 0,
        ringV = 0;
      const sn = slowNoise(r, 4, 16);
      for (let i = 0; i < n; i++) {
        const t = i / sr,
          x = r() * 2 - 1;
        lp += (x - lp) * 0.04;
        lp2 += (x - lp2) * 0.3;
        const roar = lp * 3.2 * (0.75 + 0.25 * sn(t));
        if (r() < 0.0009) ringV = (r() - 0.5) * 2.4; // crackle / pop
        ring = ring * 0.93 + ringV;
        ringV *= 0.35;
        a[i] = roar + ring * 0.35 + (lp2 - lp) * 0.08;
      }
    },
  });
  D("hum_electric", {
    dur: 2,
    loop: true,
    gain: 0.35,
    ref: 3,
    rolloff: 1.3,
    sr: 32000,
    priority: 4,
    pitchVar: 0.02,
    wet: 0.4,
    gen(d, sr, r, n) {
      const a = d[0];
      for (let i = 0; i < n; i++) {
        const t = i / sr,
          h = Math.sin(2 * Math.PI * 60 * t);
        const buzz = Math.tanh(Math.sin(2 * Math.PI * 120 * t) * 4) * 0.25;
        const flick = r() < 0.00015 ? 0 : 1;
        a[i] =
          (h * 0.5 +
            Math.sin(2 * Math.PI * 180 * t) * 0.15 +
            buzz +
            (r() * 2 - 1) * 0.03) *
          flick;
      }
    },
  });
  D("zap", {
    dur: 0.6,
    variants: 3,
    gain: 0.55,
    ref: 8,
    priority: 5,
    dedupe: 0,
    build(k) {
      k.grains({
        start: 0,
        span: 0.25,
        n: 30,
        f: 4000,
        q: 0.6,
        gain: 0.8,
        len: 0.003,
        skew: 1.3,
      });
      const o = k.osc("sawtooth", 120, 0, 0.3),
        g = k.gain(0);
      k.perc(g.gain, 0, 0.4, 0.002, 0.25);
      k.chain(o, k.shaper(10, "hard"), k.filt("bandpass", 2000, 0.8), g, k.out);
    },
  });

  // ------------------------------------------------------------------
  // Weather & environment one-shots (ambience spot sounds)
  // ------------------------------------------------------------------
  D("wind_gust", {
    dur: 4.5,
    variants: 2,
    gain: 0.45,
    bus: "amb",
    sr: 22050,
    channels: 2,
    priority: 5,
    pitchVar: 0.1,
    build(k) {
      const d = k.rr(3, 4.2);
      [-0.6, 0.6].forEach((pp, i) => {
        const n = k.noise("pink", 0, d),
          f = k.filt("bandpass", 400, 0.9),
          g = k.gain(0),
          p = k.pan(pp);
        k.env(f.frequency, [
          [0, 250],
          [d * 0.45, k.rr(700, 1100)],
          [d, 300],
        ]);
        k.env(g.gain, [
          [0, 0.0001],
          [d * (0.35 + i * 0.1), 0.9],
          [d, 0.0001],
        ]);
        k.chain(n, f, g, p, k.out);
      });
      const w = k.noise("white", 0, d),
        wf = k.filt("bandpass", 1300, 25),
        wg = k.gain(0); // whistle through a gap
      k.env(wf.frequency, [
        [0, 1000],
        [d * 0.5, k.rr(1500, 2100)],
        [d, 1100],
      ]);
      k.env(wg.gain, [
        [0, 0.0001],
        [d * 0.5, 0.8],
        [d, 0.0001],
      ]);
      k.chain(w, wf, wg, k.out);
    },
  });
  D("thunder", {
    dur: 6,
    variants: 3,
    gain: 0.9,
    bus: "amb",
    sr: 22050,
    priority: 5,
    pitchVar: 0.08,
    build(k, v) {
      if (v === 0)
        k.burst({
          a: 0.001,
          d: 0.15,
          peak: 1,
          type: "highpass",
          f: 800,
          shaper: 3,
        }); // close crack
      for (let i = 0; i < 6; i++)
        k.burst({
          kind: "brown",
          start: k.rr(0.05, 3),
          a: k.rr(0.05, 0.3),
          d: k.rr(0.8, 2),
          peak: k.rr(0.4, 1),
          type: "lowpass",
          f: k.rr(180, 450),
        });
      k.tone({
        type: "sine",
        f: 45,
        f2: 28,
        glide: 2,
        a: 0.2,
        d: 3,
        peak: 0.6,
      });
    },
  });
  D("debris", {
    dur: 2.2,
    variants: 3,
    gain: 0.45,
    ref: 10,
    priority: 6,
    build(k) {
      k.grains({
        start: 0,
        span: k.rr(0.8, 1.8),
        n: 30,
        f: 2200,
        q: 0.9,
        gain: 0.6,
        len: 0.01,
        skew: 1.4,
      });
      for (let i = 0; i < 4; i++)
        k.burst({
          start: k.rr(0, 1.2),
          a: 0.002,
          d: 0.08,
          peak: k.rr(0.3, 0.7),
          type: "lowpass",
          f: 500,
        });
    },
  });
  D("creak", {
    sr: 22050,
    dur: 2.4,
    variants: 4,
    gain: 0.45,
    ref: 15,
    priority: 6,
    build(k) {
      // a ruined skyscraper's steel frame groaning in the wind
      const d = k.rr(1.2, 2);
      creak(k, 0.05, d, k.rr(45, 80), k.rr(60, 110), 0.7);
      const m = k.metal(
        1,
        [k.rr(160, 240), k.rr(420, 520), k.rr(900, 1100)],
        30,
      );
      k.chain(m.output, k.gain(0.3), k.out);
      k.burst({
        start: 0.1,
        a: 0.3,
        d: d,
        peak: 0.15,
        type: "lowpass",
        f: 1500,
        dest: m.input,
      });
    },
  });
  D("glass_break", {
    dur: 1.4,
    variants: 2,
    gain: 0.5,
    ref: 8,
    priority: 6,
    build(k) {
      k.burst({ a: 0.0005, d: 0.05, peak: 1, type: "highpass", f: 2500 });
      const m = k.metal(1, [3100, 4400, 5900, 7700], 40);
      k.chain(m.output, k.gain(0.6), k.out);
      k.grains({
        start: 0,
        span: 0.9,
        n: 30,
        f: 5000,
        q: 1,
        gain: 0.7,
        len: 0.004,
        skew: 1.5,
        dest: m.input,
      });
      k.grains({
        start: 0.02,
        span: 0.8,
        n: 20,
        f: 6000,
        q: 0.8,
        gain: 0.35,
        len: 0.003,
        skew: 1.5,
      });
    },
  });
  D("drip", {
    dur: 0.5,
    variants: 4,
    gain: 0.3,
    ref: 6,
    priority: 6,
    pitchVar: 0.15,
    wet: 1.5,
    build(k) {
      const f = k.rr(900, 1600);
      k.tone({
        type: "sine",
        f: f,
        f2: f * 1.9,
        glide: 0.03,
        a: 0.001,
        d: 0.06,
        peak: 0.8,
      });
    },
  });
  D("steam_hiss", {
    dur: 2.5,
    variants: 2,
    gain: 0.35,
    ref: 6,
    priority: 6,
    build(k) {
      k.burst({
        a: 0.08,
        d: 2,
        peak: 1,
        type: "highpass",
        f: 2600,
        q: 0.7,
        curve: "lin",
      });
    },
  });
