// play-inline-25 05 — gain
// Lines 1187-1518 of readable/play-inline-25.pretty.js (statement-aligned).
  D("siren_blast", {
    dur: 1.4,
    variants: 2,
    gain: 0.9,
    ref: 16,
    maxVoices: 2,
    priority: 3,
    build(k) {
      const o = k.osc("sawtooth", 260, 0, 1.3),
        o2 = k.osc("sawtooth", 390, 0, 1.3);
      k.env(o.frequency, [
        [0, 220],
        [0.35, 640],
        [0.9, 610, "l"],
        [1.3, 300],
      ]);
      k.env(o2.frequency, [
        [0, 330],
        [0.35, 960],
        [0.9, 915, "l"],
        [1.3, 450],
      ]);
      const g = k.gain(0);
      k.env(g.gain, [
        [0, 0.0001],
        [0.08, 0.9],
        [0.9, 0.7, "l"],
        [1.3, 0.0001],
      ]);
      const lp = k.filt("lowpass", 2600, 0.8);
      k.chain(o, lp, g, k.out);
      o2.connect(lp);
      k.tone({
        type: "sine",
        f: 70,
        f2: 40,
        glide: 0.2,
        a: 0.004,
        d: 0.3,
        peak: 1.0,
      });
      k.burst({
        kind: "brown",
        a: 0.01,
        d: 0.25,
        peak: 0.5,
        type: "lowpass",
        f: 500,
      });
    },
  });
  D("explosion", {
    dur: 3.6,
    variants: 3,
    gain: 1.15,
    ref: 30,
    rolloff: 1,
    maxVoices: 4,
    priority: 1,
    pitchVar: 0.08,
    build(k) {
      explosion(k, 1);
    },
    onPlay(opts, dist) {
      if (dist < 40) {
        const amt = 1 - dist / 40;
        S.shellShock && S.shellShock(amt * 0.7, 1.2 + amt * 2);
        S.duck(S.bus.musicDuck.gain, 1 - amt * 0.6, 0.02, 0.3, 1.5);
      }
    },
  });
  D("explosion_nuke", {
    dur: 9,
    variants: 1,
    gain: 1.4,
    ref: 120,
    rolloff: 0.6,
    maxVoices: 2,
    priority: 3,
    sr: 24000,
    pitchVar: 0.02,
    wet: 0.6,
    build(k) {
      const mix = k.gain(1);
      mix.connect(k.out);
      k.burst({
        kind: "white",
        a: 0.0003,
        d: 0.05,
        peak: 1.6,
        type: "highpass",
        f: 1000,
        dest: mix,
      });
      // colossal sub swell
      const sub = k.osc("sine", 48, 0, 8);
      k.env(sub.frequency, [
        [0, 55],
        [5, 21],
      ]);
      const sg = k.gain(0);
      k.env(sg.gain, [
        [0, 0.0001],
        [0.25, 1.8],
        [2.5, 1.2],
        [8.5, 0.0001],
      ]);
      k.chain(sub, sg, k.shaper(4), mix);
      // main roar
      const roar = k.noise("brown", 0, 8.8);
      const rf = k.filt("lowpass", 300, 0.7);
      k.env(rf.frequency, [
        [0, 1200],
        [0.6, 700],
        [3, 380],
        [8, 120],
      ]);
      const rg = k.gain(0);
      k.env(rg.gain, [
        [0, 0.0001],
        [0.3, 2.0],
        [3, 1.4],
        [8.8, 0.0001],
      ]);
      k.chain(roar, rf, rg, k.shaper(6), mix);
      // fireball blast
      k.burst({
        kind: "white",
        a: 0.004,
        d: 2.2,
        peak: 1.4,
        type: "lowpass",
        f: 4500,
        f2: 200,
        fT: 2,
        shaper: 12,
        dest: mix,
      });
      // shockwave wind rush passing
      const wind = k.noise("pink", 1.2, 5);
      const wf = k.filt("bandpass", 400, 1.2);
      k.env(wf.frequency, [
        [1.2, 300],
        [2.8, 2200],
        [6, 500],
      ]);
      const wg = k.gain(0);
      k.env(wg.gain, [
        [1.2, 0.0001],
        [2.6, 0.9],
        [6.2, 0.0001],
      ]);
      k.chain(wind, wf, wg, mix);
      // rolling thunder
      for (let i = 0; i < 7; i++)
        k.burst({
          kind: "brown",
          start: k.rr(0.8, 5.5),
          a: 0.05,
          d: k.rr(0.6, 1.4),
          peak: k.rr(0.4, 0.9),
          type: "lowpass",
          f: k.rr(250, 500),
          dest: mix,
        });
      // debris rain
      k.grains({
        start: 2.0,
        span: 5.5,
        n: 70,
        f: 2200,
        q: 0.8,
        gain: 0.3,
        len: 0.012,
        skew: 1.3,
        dest: mix,
      });
    },
    onPlay(opts, dist) {
      const amt = S.clamp(1 - dist / 450, 0, 1);
      if (amt > 0) {
        S.shellShock && S.shellShock(0.5 + amt * 0.5, 3 + amt * 4);
        if (amt > 0.3) S.tinnitus && S.tinnitus(amt, 4 + amt * 3);
        S.duck(S.bus.musicDuck.gain, 0.15, 0.05, 3, 4);
        S.duck(S.bus.radioDuck.gain, 0.2, 0.05, 3, 4);
      }
    },
  });

  // ------------------------------------------------------------------
  // Reloading & handling
  // ------------------------------------------------------------------
  function clack(k, t, base, peak, dest) {
    const m = k.metal(1, [base, base * 2.13, base * 3.41], 18);
    k.chain(m.output, k.gain(0.8), dest || k.out);
    k.burst({
      start: t,
      a: 0.0004,
      d: 0.012,
      peak: peak,
      type: "highpass",
      f: 700,
      dest: m.input,
    });
    k.burst({
      start: t,
      a: 0.0004,
      d: 0.025,
      peak: peak * 0.7,
      type: "bandpass",
      f: base * 2.5,
      q: 1.2,
      dest: dest || k.out,
    });
    k.tone({
      type: "sine",
      start: t,
      f: 260,
      f2: 120,
      glide: 0.03,
      a: 0.001,
      d: 0.04,
      peak: peak * 0.4,
      dest: dest || k.out,
    });
  }
  function slide(k, t, d, f0, f1, peak) {
    k.burst({
      start: t,
      a: d * 0.3,
      d: d,
      peak: peak,
      type: "bandpass",
      f: f0,
      f2: f1,
      fT: d,
      q: 1.4,
    });
  }
  D("reload", {
    dur: 1.35,
    variants: 2,
    gain: 0.55,
    ref: 4,
    bus: "world",
    wet: 0.4,
    maxVoices: 2,
    priority: 2,
    build(k) {
      // mag release + slide out
      k.burst({
        start: 0.05,
        a: 0.0004,
        d: 0.012,
        peak: 0.6,
        type: "bandpass",
        f: 4200,
        q: 4,
      });
      slide(k, 0.08, 0.12, 1600, 2400, 0.35);
      // new mag slides in → seats with a clack
      slide(k, 0.42, 0.1, 1400, 2200, 0.35);
      clack(k, 0.55, 1150, 0.9);
      // charging handle pulled back & released
      slide(k, 0.84, 0.07, 3000, 1600, 0.4);
      clack(k, 0.97, 900, 1.0);
    },
  });
  D("reload_shotgun", {
    dur: 0.4,
    variants: 3,
    gain: 0.5,
    ref: 4,
    wet: 0.4,
    maxVoices: 3,
    priority: 2,
    dedupe: 0.05,
    build(k) {
      slide(k, 0.0, 0.04, 2600, 3400, 0.4); // shell pushed past the gate
      clack(k, 0.06, 1500, 0.6);
      k.tone({
        type: "sine",
        start: 0.06,
        f: 700,
        f2: 500,
        glide: 0.05,
        a: 0.001,
        d: 0.06,
        peak: 0.12,
      }); // brass tink
    },
  });
  D("shotgun_pump", {
    dur: 0.6,
    variants: 2,
    gain: 0.6,
    ref: 5,
    wet: 0.4,
    maxVoices: 2,
    priority: 3,
    build(k) {
      slide(k, 0.0, 0.08, 1300, 2600, 0.5);
      clack(k, 0.1, 800, 0.9);
      slide(k, 0.22, 0.07, 2600, 1300, 0.5);
      clack(k, 0.3, 950, 1.0);
    },
  });
  D("bolt_action", {
    dur: 0.9,
    variants: 2,
    gain: 0.55,
    ref: 5,
    wet: 0.4,
    maxVoices: 2,
    priority: 5,
    build(k) {
      clack(k, 0.02, 1400, 0.6);
      slide(k, 0.1, 0.12, 2000, 3200, 0.4);
      k.tone({
        type: "sine",
        start: 0.2,
        f: 900,
        f2: 700,
        glide: 0.1,
        a: 0.001,
        d: 0.15,
        peak: 0.12,
      });
      slide(k, 0.42, 0.1, 3200, 2000, 0.4);
      clack(k, 0.55, 1200, 0.9);
    },
  });
