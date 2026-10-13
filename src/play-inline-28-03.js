// play-inline-28 03 — gain
// Lines 669-1008 of readable/play-inline-28.pretty.js (statement-aligned).
  D("door_locked", {
    dur: 0.8,
    variants: 2,
    gain: 0.5,
    ref: 4,
    wet: 0.5,
    dedupe: 0.3,
    priority: 1,
    build(k) {
      for (let i = 0; i < 4; i++) {
        const st = i * k.rr(0.1, 0.14);
        k.burst({
          start: st,
          a: 0.0004,
          d: 0.015,
          peak: k.rr(0.5, 0.9),
          type: "bandpass",
          f: k.rr(1400, 2200),
          q: 4,
        });
        k.burst({
          start: st + 0.01,
          a: 0.001,
          d: 0.04,
          peak: 0.4,
          type: "lowpass",
          f: 400,
        });
      }
    },
  });
  D("door_close", {
    dur: 0.6,
    variants: 2,
    gain: 0.55,
    ref: 5,
    wet: 0.6,
    dedupe: 0.2,
    priority: 3,
    build(k) {
      k.burst({ a: 0.002, d: 0.12, peak: 1, type: "lowpass", f: 500 });
      k.tone({
        type: "sine",
        f: 110,
        f2: 55,
        glide: 0.08,
        a: 0.001,
        d: 0.15,
        peak: 0.7,
      });
      k.burst({
        start: 0.03,
        a: 0.0004,
        d: 0.012,
        peak: 0.5,
        type: "bandpass",
        f: 2800,
        q: 3,
      });
    },
  });
  D("door_metal", {
    dur: 1.6,
    variants: 2,
    gain: 0.6,
    ref: 6,
    wet: 0.7,
    dedupe: 0.2,
    priority: 3,
    build(k) {
      // sliding pneumatic metal door (bunker and cryo-unit interiors)
      k.burst({ a: 0.02, d: 0.35, peak: 0.6, type: "highpass", f: 2500 }); // pneumatic hiss
      const o = k.osc("sawtooth", 55, 0.1, 0.9),
        am = k.osc("sine", 13, 0.1, 0.9),
        ag = k.gain(0.4),
        g = k.gain(0);
      k.env(g.gain, [
        [0.1, 0.0001],
        [0.2, 0.35],
        [0.85, 0.3, "l"],
        [1.0, 0.0001],
      ]);
      k.chain(am, ag, g.gain);
      k.chain(o, k.filt("lowpass", 500, 2), g, k.out);
      const m = k.metal(1, [210, 530, 1090], 12);
      k.chain(m.output, k.gain(0.8), k.out);
      k.burst({
        start: 1.0,
        a: 0.0005,
        d: 0.02,
        peak: 1,
        type: "highpass",
        f: 300,
        dest: m.input,
      });
      k.tone({
        type: "sine",
        start: 1.0,
        f: 80,
        f2: 45,
        glide: 0.1,
        a: 0.001,
        d: 0.2,
        peak: 0.8,
      });
    },
  });

  // ------------------------------------------------------------------
  // The Cryo Unit C-9 pressure hatch: a round blast hatch on a hinge arm,
  // frosted shut for twenty-two years
  // ------------------------------------------------------------------
  D("cryo_door", {
    dur: 7.5,
    variants: 1,
    gain: 1.0,
    ref: 25,
    rolloff: 0.8,
    wet: 1,
    sr: 32000,
    priority: 2,
    pitchVar: 0,
    maxVoices: 1,
    build(k) {
      const mix = k.gain(1);
      mix.connect(k.out);
      // a warning relay and the pressure equalising through the seal
      k.burst({
        a: 0.0003,
        d: 0.01,
        peak: 0.6,
        type: "bandpass",
        f: 2600,
        q: 2,
        dest: mix,
      });
      k.burst({
        start: 0.15,
        a: 0.3,
        d: 1.5,
        peak: 0.5,
        type: "highpass",
        f: 2200,
        dest: mix,
      });
      // eight dogging bolts withdraw round the rim, one after another
      const bolts = k.metal(1, [131, 297, 512, 870], 9, [1, 0.7, 0.5, 0.3]);
      k.chain(bolts.output, k.gain(0.85), mix);
      for (let i = 0; i < 8; i++) {
        const st = 0.5 + i * 0.13 + k.rr(-0.02, 0.02);
        k.burst({
          start: st,
          a: 0.001,
          d: 0.025,
          peak: 0.9,
          type: "lowpass",
          f: 1800,
          dest: bolts.input,
        });
        k.tone({
          type: "sine",
          start: st,
          f: 85,
          f2: 50,
          glide: 0.07,
          a: 0.002,
          d: 0.12,
          peak: 0.55,
          dest: mix,
        });
      }
      // frost cracking off the seal + the gasket peeling free (a rubbery squeal)
      k.grains({
        start: 1.6,
        span: 0.9,
        n: 40,
        f: 5200,
        q: 2,
        gain: 0.35,
        len: 0.004,
        skew: 1.4,
        dest: mix,
      });
      const sq = k.osc("sawtooth", 340, 1.9, 0.7),
        sqf = k.filt("bandpass", 1200, 6),
        sqg = k.gain(0);
      k.env(sq.frequency, [
        [1.9, 300],
        [2.6, 520, "l"],
      ]);
      k.env(sqg.gain, [
        [1.9, 0.0001],
        [2.05, 0.18],
        [2.5, 0.12, "l"],
        [2.65, 0.0001],
      ]);
      k.chain(sq, sqf, sqg, mix);
      // the hinge ram pushes the hatch out: hydraulic groan and a slow, heavy hinge creak
      const hyd = k.osc("sawtooth", 44, 2.6, 2.6),
        hl = k.filt("lowpass", 240, 3),
        hg = k.gain(0);
      k.env(hyd.frequency, [
        [2.6, 38],
        [5.0, 52, "l"],
      ]);
      k.env(hg.gain, [
        [2.6, 0.0001],
        [2.9, 0.5],
        [4.9, 0.45, "l"],
        [5.2, 0.0001],
      ]);
      k.chain(hyd, hl, hg, mix);
      const cr = k.noise("white", 3.0, 2.0),
        cf = k.filt("bandpass", 620, 9),
        cg = k.gain(0);
      const ss = k.osc("square", 7, 3.0, 2.0),
        sg = k.gain(0.3);
      k.chain(ss, sg, cg.gain);
      k.env(cg.gain, [
        [3.0, 0.0001],
        [3.3, 0.3],
        [4.8, 0.25, "l"],
        [5.0, 0.0001],
      ]);
      k.chain(cr, cf, cg, mix);
      // the hatch reaches its stop: a deep, ringing thud
      k.tone({
        type: "sine",
        start: 5.05,
        f: 62,
        f2: 30,
        glide: 0.7,
        a: 0.004,
        d: 1.4,
        peak: 1.3,
        dest: mix,
      });
      k.burst({
        start: 5.05,
        a: 0.002,
        d: 0.5,
        peak: 0.9,
        type: "lowpass",
        f: 650,
        shaper: 4,
        dest: mix,
      });
      k.burst({
        start: 5.05,
        a: 0.001,
        d: 0.05,
        peak: 1,
        type: "lowpass",
        f: 2000,
        dest: bolts.input,
      });
      k.grains({
        start: 5.1,
        span: 1.3,
        n: 14,
        f: 2000,
        q: 1,
        gain: 0.22,
        len: 0.01,
        skew: 1.5,
        dest: mix,
      }); // frost & grit
    },
  });
  /** Phase-exact generator for loopable tonal alarms. seg: [{f0,f1,dur}] (silence when f0=0). */
  function alarmGen(d, sr, n, segs, shape) {
    // total phase per segment is rounded to whole cycles so the loop is click-free
    const a = d[0];
    let i = 0;
    for (const s of segs) {
      const len = Math.round(s.dur * sr);
      if (!s.f0) {
        for (let j = 0; j < len && i < n; j++) a[i++] = 0;
        continue;
      }
      const cycles = Math.max(1, Math.round(((s.f0 + s.f1) / 2) * s.dur));
      const scale = cycles / (((s.f0 + s.f1) / 2) * s.dur);
      let ph = 0;
      for (let j = 0; j < len && i < n; j++) {
        const t = j / len,
          f = (s.f0 + (s.f1 - s.f0) * t) * scale;
        ph += f / sr;
        const x = ph % 1;
        let v =
          shape === "square"
            ? x < 0.5
              ? 1
              : -1
            : shape === "tri"
              ? 1 - 4 * Math.abs(x - 0.5)
              : x * 2 - 1;
        const edge = Math.min(1, j / (sr * 0.004), (len - j) / (sr * 0.004));
        a[i++] = v * 0.6 * edge;
      }
    }
    while (i < n) a[i++] = 0;
  }
  S.workerLib(alarmGen);
  /** Civil-defense facility alarm: a hard two-tone hi-lo, slightly overdriven through a small horn. */
  D("cryo_alarm", {
    dur: 1.2,
    variants: 1,
    gain: 0.55,
    ref: 30,
    rolloff: 0.7,
    wet: 1,
    exactLoop: true,
    sr: 32000,
    priority: 3,
    pitchVar: 0,
    maxVoices: 2,
    gen(d, sr, r, n) {
      alarmGen(
        d,
        sr,
        n,
        [
          { f0: 960, f1: 960, dur: 0.4 },
          { f0: 720, f1: 720, dur: 0.4 },
          { f0: 0, dur: 0.4 },
        ],
        "square",
      );
      const a = d[0];
      let lp = 0,
        hp = 0,
        px = 0;
      for (let i = 0; i < n; i++) {
        lp += (Math.tanh(a[i] * 2) - lp) * 0.22;
        hp = 0.97 * (hp + lp - px);
        px = lp;
        a[i] = hp;
      }
    },
  });
