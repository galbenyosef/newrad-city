// play-inline-27 01 — peak
// Lines 10-358 of readable/play-inline-27.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const S = G._snd;
  const D = S.define;
  const mtof = S.mtof;

  // ------------------------------------------------------------------
  // Tiny orchestral palette for jingles
  // ------------------------------------------------------------------
  /** Brass voice: 2 detuned saws → brightening low-pass → envelope, delayed vibrato. */
  function brass(k, st, midi, d, peak, dest, bright) {
    const f = mtof(midi);
    const o1 = k.osc("sawtooth", f, st, d + 0.3),
      o2 = k.osc("sawtooth", f, st, d + 0.3);
    o2.detune.value = 9;
    o1.detune.value = -6;
    const vib = k.osc("sine", 5.2, st, d + 0.3),
      vg = k.gain(0);
    k.env(vg.gain, [
      [st, 0.0001],
      [st + 0.25, 0.0001],
      [st + 0.6, f * 0.006, "l"],
    ]);
    k.chain(vib, vg, o1.frequency);
    vg.connect(o2.frequency);
    const lp = k.filt("lowpass", 500, 1.5);
    const b = bright || 2600;
    k.env(lp.frequency, [
      [st, 400],
      [st + 0.05, b],
      [st + d, b * 0.55],
      [st + d + 0.25, 400],
    ]);
    const g = k.gain(0);
    k.env(g.gain, [
      [st, 0.0001],
      [st + 0.035, peak],
      [st + d, peak * 0.75, "l"],
      [st + d + 0.25, 0.0001],
    ]);
    k.chain(o1, lp);
    o2.connect(lp);
    k.chain(lp, g, dest || k.out);
  }
  /** Bell / glockenspiel: inharmonic sine partials with exponential decays. */
  function bell(k, st, midi, d, peak, dest, glock) {
    const f = mtof(midi);
    const parts = glock
      ? [
          [1, 1, 1],
          [2.76, 0.25, 0.4],
          [5.4, 0.1, 0.25],
        ]
      : [
          [1, 1, 1],
          [2.0, 0.45, 0.7],
          [2.76, 0.35, 0.5],
          [5.4, 0.2, 0.3],
          [8.93, 0.1, 0.18],
        ];
    parts.forEach((p) =>
      k.tone({
        type: "sine",
        start: st,
        f: f * p[0],
        a: 0.002,
        d: d * p[2],
        peak: peak * p[1],
        dest,
      }),
    );
  }
  /** Soft string pad chord. */
  function strings(k, st, midis, d, peak, dest, att) {
    const lp = k.filt("lowpass", 1600, 0.7),
      g = k.gain(0);
    k.env(g.gain, [
      [st, 0.0001],
      [st + (att || 0.35), peak],
      [st + d, peak * 0.8, "l"],
      [st + d + 0.6, 0.0001],
    ]);
    k.chain(lp, g, dest || k.out);
    midis.forEach((m) => {
      [-7, 6].forEach((det) => {
        const o = k.osc("sawtooth", mtof(m), st, d + 0.7);
        o.detune.value = det;
        o.connect(lp);
      });
    });
  }
  function timpani(k, st, midi, peak, dest) {
    const f = mtof(midi);
    k.tone({
      type: "sine",
      start: st,
      f: f * 1.5,
      f2: f,
      glide: 0.05,
      a: 0.002,
      d: 0.8,
      peak: peak,
      dest,
    });
    k.tone({
      type: "sine",
      start: st,
      f: f * 1.5 * 1.5,
      a: 0.002,
      d: 0.4,
      peak: peak * 0.3,
      dest,
    });
    k.burst({
      start: st,
      a: 0.001,
      d: 0.06,
      peak: peak * 0.5,
      type: "lowpass",
      f: 600,
      dest,
    });
  }
  function cymbalSwell(k, st, d, peak, dest) {
    const n = k.noise("white", st, d + 0.2),
      hp = k.filt("highpass", 5000, 0.7),
      g = k.gain(0);
    k.env(g.gain, [
      [st, 0.0001],
      [st + d, peak],
      [st + d + 0.15, 0.0001],
    ]);
    k.chain(n, hp, g, dest || k.out);
  }
  function click(k, st, f, peak, dest) {
    k.burst({
      start: st,
      a: 0.0002,
      d: 0.006,
      peak: peak,
      type: "bandpass",
      f: f || 3000,
      q: 1.5,
      dest,
    });
  }
  function beep(k, st, f, d, peak, type, dest) {
    k.tone({
      type: type || "square",
      start: st,
      f,
      a: 0.003,
      d,
      peak,
      filter: ["lowpass", 3200],
      curve: "lin",
      dest,
    });
  }
  /** Electromechanical relay: armature clack (two contacts) + a short metallic ring + a low coil thunk. */
  function relay(k, st, peak, dest) {
    k.burst({
      start: st,
      a: 0.0002,
      d: 0.004,
      peak: peak,
      type: "bandpass",
      f: 3400,
      q: 2,
      dest,
    });
    k.burst({
      start: st + 0.006,
      a: 0.0002,
      d: 0.006,
      peak: peak * 0.6,
      type: "bandpass",
      f: 2100,
      q: 2.5,
      dest,
    });
    k.tone({
      type: "sine",
      start: st,
      f: 140,
      f2: 90,
      glide: 0.03,
      a: 0.001,
      d: 0.035,
      peak: peak * 0.35,
      dest,
    });
    k.tone({
      type: "sine",
      start: st + 0.002,
      f: 5300,
      a: 0.0005,
      d: 0.03,
      peak: peak * 0.08,
      dest,
    });
  }
  S.jingleKit = {
    brass,
    bell,
    strings,
    timpani,
    cymbalSwell,
    click,
    beep,
    relay,
  };

  // ------------------------------------------------------------------
  // Jingles
  // ------------------------------------------------------------------
  // Progression cues are electronic and 1970s-mainframe flavoured (relays, CRT whine, sine chords): the
  // goggles are a machine, so a level-up is a chord blooming out of a bank of relays, not a fanfare.
  D("levelup", {
    dur: 3.0,
    variants: 1,
    gain: 0.55,
    bus: "ui",
    dedupe: 1.5,
    priority: 3,
    pitchVar: 0,
    normRms: 0.18,
    build(k) {
      const m = k.gain(1);
      m.connect(k.out);
      const rv = k.echo(0.23, 0.42, 3200, 0.35);
      rv.output.connect(m);
      // three relays latch in quick succession, then a slow-blooming open chord (D, A, E, F#, A, C#, G#: add9 #11)
      relay(k, 0, 0.9, m);
      relay(k, 0.09, 0.75, m);
      relay(k, 0.18, 0.95, m);
      [
        [50, 0.22],
        [57, 0.16],
        [64, 0.13],
        [66, 0.12],
        [69, 0.1],
        [73, 0.08],
        [80, 0.05],
      ].forEach((n, i) => {
        const st = 0.26 + i * 0.045;
        k.tone({
          type: i ? "triangle" : "sine",
          start: st,
          f: mtof(n[0]),
          a: 0.35,
          d: 2.2,
          peak: n[1],
          dest: m,
        });
        k.tone({
          type: "sine",
          start: st,
          f: mtof(n[0]) * 1.003,
          a: 0.4,
          d: 2.0,
          peak: n[1] * 0.5,
          dest: rv.input,
        });
      });
      // a CRT scan shimmer sweeping up through the chord, then two confirming ticks
      k.tone({
        type: "sine",
        start: 0.3,
        f: 1800,
        f2: 7200,
        glide: 1.1,
        a: 0.08,
        d: 1.2,
        peak: 0.035,
        dest: m,
      });
      k.burst({
        start: 0.28,
        a: 0.25,
        d: 0.9,
        peak: 0.05,
        type: "bandpass",
        f: 5200,
        q: 1.2,
        dest: rv.input,
      });
      beep(k, 1.42, mtof(86), 0.05, 0.12, "sine", m);
      beep(k, 1.52, mtof(93), 0.09, 0.1, "sine", m);
    },
  });
  D("quest_start", {
    dur: 4.2,
    variants: 1,
    gain: 0.55,
    bus: "ui",
    dedupe: 1.5,
    priority: 3,
    pitchVar: 0,
    normRms: 0.18,
    build(k) {
      const m = k.gain(1);
      m.connect(k.out);
      strings(k, 0, [50, 57, 62, 65], 2.4, 0.18, m, 0.8); // D minor, low and dark
      brass(k, 0.5, 69, 0.45, 0.28, m, 1500); // horn call: A4 – D5 – C5
      brass(k, 0.95, 74, 0.35, 0.28, m, 1500);
      brass(k, 1.3, 72, 1.3, 0.3, m, 1400);
      timpani(k, 0.02, 38, 0.6, m);
      bell(k, 1.3, 84, 2.2, 0.08, m);
    },
  });
  D("quest_complete", {
    dur: 4.2,
    variants: 1,
    gain: 0.6,
    bus: "ui",
    dedupe: 1.5,
    priority: 3,
    pitchVar: 0,
    normRms: 0.2,
    build(k) {
      const m = k.gain(1);
      m.connect(k.out);
      // G4 C5 E5 (triplet pickup) → G5 over a C major chord
      [
        [0, 67, 0.1],
        [0.11, 72, 0.1],
        [0.22, 76, 0.12],
      ].forEach((n) => brass(k, n[0], n[1], n[2], 0.5, m, 3200));
      [79, 76, 72, 67].forEach((n, i) =>
        brass(k, 0.36, n, 1.9, i ? 0.3 : 0.55, m, 3400),
      );
      brass(k, 0.36, 48, 1.9, 0.4, m, 1100);
      strings(k, 0.36, [60, 64, 67, 72], 2.2, 0.12, m, 0.2);
      timpani(k, 0.36, 43, 1, m);
      timpani(k, 0.22, 43, 0.4, m);
      timpani(k, 0.29, 43, 0.5, m);
      cymbalSwell(k, 0.0, 0.34, 0.18, m);
      k.burst({
        start: 0.36,
        a: 0.002,
        d: 1.4,
        peak: 0.12,
        type: "highpass",
        f: 4500,
        dest: m,
      }); // crash
    },
  });
