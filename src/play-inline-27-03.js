// play-inline-27 03 — gain
// Lines 705-1042 of readable/play-inline-27.pretty.js (statement-aligned).
  D("ui_click", {
    dur: 0.12,
    variants: 2,
    gain: 0.3,
    bus: "ui",
    dedupe: 0.03,
    priority: 1,
    build(k) {
      click(k, 0, 3200, 1);
      k.tone({ type: "sine", f: 1900, a: 0.001, d: 0.025, peak: 0.3 });
    },
  });
  /** Studio microphone switch (radio DJ on/off air) — heard through the AM chain. */
  D("radio_mic_click", {
    dur: 0.22,
    variants: 2,
    gain: 0.35,
    bus: "radio",
    dedupe: 0.05,
    priority: 4,
    wet: 0,
    build(k) {
      click(k, 0, 1800, 1);
      click(k, 0.012, 900, 0.6);
      k.tone({
        type: "sine",
        f: 70,
        f2: 45,
        glide: 0.08,
        a: 0.002,
        d: 0.09,
        peak: 0.35,
      }); // handling thump
      k.burst({
        kind: "pink",
        start: 0.01,
        a: 0.004,
        d: 0.08,
        peak: 0.12,
        type: "bandpass",
        f: 1200,
        q: 0.6,
      });
    },
  });
  D("ui_hover", {
    dur: 0.08,
    variants: 1,
    gain: 0.12,
    bus: "ui",
    dedupe: 0.03,
    priority: 1,
    build(k) {
      click(k, 0, 4200, 0.8);
    },
  });
  D("ui_select", {
    dur: 0.3,
    variants: 1,
    gain: 0.3,
    bus: "ui",
    dedupe: 0.05,
    priority: 1,
    build(k) {
      beep(k, 0, 1320, 0.05, 0.4);
      beep(k, 0.06, 1760, 0.08, 0.4);
      click(k, 0, 3000, 0.5);
    },
  });
  D("ui_back", {
    dur: 0.3,
    variants: 1,
    gain: 0.3,
    bus: "ui",
    dedupe: 0.05,
    priority: 1,
    build(k) {
      beep(k, 0, 1320, 0.05, 0.4);
      beep(k, 0.06, 990, 0.08, 0.4);
      click(k, 0, 2500, 0.5);
    },
  });
  D("ui_error", {
    dur: 0.4,
    variants: 1,
    gain: 0.3,
    bus: "ui",
    dedupe: 0.1,
    priority: 1,
    build(k) {
      beep(k, 0, 220, 0.1, 0.5, "sawtooth");
      beep(k, 0.13, 196, 0.16, 0.5, "sawtooth");
    },
  });
  D("ui_equip", {
    dur: 0.4,
    variants: 2,
    gain: 0.35,
    bus: "ui",
    dedupe: 0.05,
    priority: 3,
    build(k) {
      click(k, 0, 2200, 0.8);
      const m = k.metal(1, [1300, 2800, 4400], 20);
      k.chain(m.output, k.gain(0.5), k.out);
      k.burst({
        start: 0.02,
        a: 0.0003,
        d: 0.01,
        peak: 0.6,
        type: "highpass",
        f: 800,
        dest: m.input,
      });
      k.burst({
        kind: "pink",
        a: 0.03,
        d: 0.12,
        peak: 0.3,
        type: "bandpass",
        f: 2000,
        q: 0.7,
      });
    },
  });
  D("radio_tune", {
    dur: 0.9,
    variants: 3,
    gain: 0.35,
    bus: "ui",
    dedupe: 0.1,
    priority: 2,
    build(k) {
      const n = k.noise("white", 0, 0.8),
        bp = k.filt("bandpass", 1800, 0.7),
        g = k.gain(0);
      k.env(g.gain, [
        [0, 0.0001],
        [0.05, 0.6],
        [0.6, 0.5, "l"],
        [0.8, 0.0001],
      ]);
      k.chain(n, bp, g, k.out);
      // heterodyne whistle sweeping past stations
      const o = k.osc("sine", 2500, 0, 0.8);
      k.env(o.frequency, [
        [0, k.rr(1500, 3500)],
        [0.35, k.rr(300, 900)],
        [0.7, k.rr(1500, 4000)],
      ]);
      const og = k.gain(0);
      k.env(og.gain, [
        [0, 0.0001],
        [0.1, 0.15],
        [0.7, 0.0001],
      ]);
      k.chain(o, og, k.out);
      k.grains({
        start: 0,
        span: 0.7,
        n: 20,
        f: 3000,
        q: 0.7,
        gain: 0.3,
        len: 0.004,
      });
    },
  });
  D("radio_static", {
    dur: 3,
    loop: true,
    gain: 0.3,
    bus: "radio",
    sr: 32000,
    priority: 4,
    gen(d, sr, r, n) {
      const a = d[0];
      let lp = 0,
        lp2 = 0;
      for (let i = 0; i < n; i++) {
        const x = r() * 2 - 1;
        lp += (x - lp) * 0.35;
        lp2 += (lp - lp2) * 0.35;
        const fl =
          0.7 +
          0.3 *
            Math.sin((i / sr) * 2 * Math.PI * 0.9) *
            Math.sin((i / sr) * 2 * Math.PI * 3.1);
        a[i] = (lp2 * 0.9 + (r() < 0.003 ? (r() - 0.5) * 3 : 0)) * fl;
      }
    },
  });

  // ------------------------------------------------------------------
  // Teletype terminals: typebar strikes, line-printer chatter, carriage
  // return, paper feed, the bell. terminal_* ids are the ones callers use.
  // ------------------------------------------------------------------
  /** One teletype key: a stiff key travel, the typebar slapping the platen through the ribbon, a little ring. */
  D("teletype_key", {
    dur: 0.14,
    variants: 6,
    gain: 0.32,
    bus: "ui",
    dedupe: 0.015,
    maxVoices: 6,
    priority: 1,
    pitchVar: 0.08,
    build(k) {
      k.burst({
        a: 0.0003,
        d: 0.006,
        peak: 0.6,
        type: "bandpass",
        f: k.rr(1800, 2400),
        q: 2,
      }); // key top
      k.burst({
        start: 0.018,
        a: 0.0002,
        d: 0.012,
        peak: 1,
        type: "bandpass",
        f: k.rr(900, 1300),
        q: 2.5,
      }); // typebar on platen
      k.tone({
        type: "sine",
        start: 0.018,
        f: k.rr(150, 200),
        a: 0.001,
        d: 0.03,
        peak: 0.35,
      });
      const m = k.metal(1, [k.rr(2600, 3100), k.rr(4300, 5000)], 30);
      k.chain(m.output, k.gain(0.18), k.out);
      k.burst({
        start: 0.019,
        a: 0.0002,
        d: 0.004,
        peak: 0.6,
        type: "highpass",
        f: 1500,
        dest: m.input,
      });
    },
  });
  /** A printed line: a run of hammer strikes at ~10 characters/s with the motor under it, ending in the carriage. */
  D("teletype_print", {
    dur: 1.1,
    variants: 3,
    gain: 0.32,
    bus: "ui",
    dedupe: 0.2,
    priority: 2,
    build(k) {
      const n = 7 + ((k.r() * 5) | 0);
      const mot = k.noise("brown", 0, 1.0),
        mf = k.filt("bandpass", 220, 1.2),
        mg = k.gain(0);
      k.env(mg.gain, [
        [0, 0.0001],
        [0.05, 0.14],
        [0.9, 0.12, "l"],
        [1.0, 0.0001],
      ]);
      k.chain(mot, mf, mg, k.out);
      for (let i = 0; i < n; i++) {
        const st = 0.04 + i * 0.075 + k.rr(-0.006, 0.006);
        k.burst({
          start: st,
          a: 0.0002,
          d: 0.01,
          peak: k.rr(0.6, 1),
          type: "bandpass",
          f: k.rr(900, 1400),
          q: 2.2,
        });
        k.burst({
          start: st + 0.004,
          a: 0.0002,
          d: 0.006,
          peak: 0.3,
          type: "highpass",
          f: 3500,
        });
      }
      const ce = 0.06 + n * 0.075;
      k.burst({
        start: ce,
        a: 0.02,
        d: 0.12,
        peak: 0.25,
        type: "bandpass",
        f: 700,
        f2: 1500,
        fT: 0.12,
        q: 1.5,
      }); // carriage
      click(k, ce + 0.14, 1800, 0.6);
    },
  });
  /** Paper feed: the platen ratchets a line or two. */
  D("teletype_feed", {
    dur: 0.3,
    variants: 2,
    gain: 0.3,
    bus: "ui",
    dedupe: 0.05,
    priority: 2,
    build(k) {
      for (let i = 0; i < 3; i++) click(k, i * 0.045, k.rr(1500, 2100), 0.7);
      k.burst({ a: 0.01, d: 0.15, peak: 0.12, type: "bandpass", f: 900, q: 1 });
    },
  });
  /** The teletype idling while its paper is up: motor drone, a gear whine, the odd selector tick. */
  D("teletype_idle", {
    dur: 2,
    loop: true,
    gain: 0.12,
    bus: "ui",
    sr: 24000,
    priority: 6,
    gen(d, sr, r, n) {
      const a = d[0];
      let lp = 0;
      for (let i = 0; i < n; i++) {
        const t = i / sr,
          x = r() * 2 - 1;
        lp += (x - lp) * 0.04;
        const tick = (t * 6) % 1 < 0.004 ? (r() * 2 - 1) * 0.5 : 0; // selector clutch, six times a second
        a[i] =
          Math.sin(2 * Math.PI * 50 * t) * 0.3 +
          Math.sin(2 * Math.PI * 300 * t) * 0.05 +
          lp * 0.6 +
          tick;
      }
    },
  });
