// play-inline-27 02 — peak
// Lines 359-704 of readable/play-inline-27.pretty.js (statement-aligned).
  D("quest_update", {
    dur: 2.0,
    variants: 1,
    gain: 0.45,
    bus: "ui",
    dedupe: 1.2,
    priority: 3,
    pitchVar: 0,
    build(k) {
      bell(k, 0, 76, 1.4, 0.35);
      bell(k, 0.18, 83, 1.6, 0.3);
      strings(k, 0, [64, 71, 76], 1.2, 0.06, null, 0.3);
    },
  });
  D("xp_gain", {
    dur: 0.6,
    variants: 1,
    gain: 0.22,
    bus: "ui",
    dedupe: 0.25,
    priority: 3,
    pitchVar: 0,
    build(k) {
      bell(k, 0, 88, 0.4, 0.4, null, true);
      bell(k, 0.06, 93, 0.5, 0.3, null, true);
    },
  });
  /** Discovery sting: a data burst on the goggle's line (fast filtered ticks), a sonar-like ping with echoes over a
   *  low open fifth, and a last soft tone a major sixth up — "new place logged". */
  D("discover_location", {
    dur: 4.2,
    variants: 1,
    gain: 0.5,
    bus: "ui",
    dedupe: 2,
    priority: 3,
    pitchVar: 0,
    normRms: 0.15,
    build(k) {
      const m = k.gain(1);
      m.connect(k.out);
      const ec = k.echo(0.31, 0.5, 2600, 0.4);
      ec.output.connect(m);
      k.grains({
        start: 0,
        span: 0.28,
        n: 22,
        f: 4200,
        q: 3,
        gain: 0.35,
        len: 0.004,
        dest: m,
      }); // data burst
      relay(k, 0.3, 0.7, m);
      k.tone({
        type: "sine",
        start: 0.34,
        f: 1244,
        a: 0.002,
        d: 0.9,
        peak: 0.3,
        dest: m,
      }); // ping
      k.tone({
        type: "sine",
        start: 0.34,
        f: 1244,
        a: 0.002,
        d: 0.6,
        peak: 0.25,
        dest: ec.input,
      });
      const d1 = k.osc("sine", mtof(38), 0.3, 3.6),
        d2 = k.osc("triangle", mtof(45), 0.3, 3.6),
        g = k.gain(0);
      k.env(g.gain, [
        [0.3, 0.0001],
        [1.2, 0.2],
        [3.0, 0.14, "l"],
        [3.9, 0.0001],
      ]);
      d1.connect(g);
      d2.connect(g);
      k.chain(g, k.filt("lowpass", 900, 0.7), m);
      k.tone({
        type: "triangle",
        start: 1.25,
        f: mtof(71),
        a: 0.25,
        d: 2.0,
        peak: 0.09,
        dest: m,
      });
      k.tone({
        type: "sine",
        start: 1.25,
        f: mtof(83),
        a: 0.4,
        d: 1.8,
        peak: 0.04,
        dest: ec.input,
      });
    },
  });
  D("standing_up", {
    dur: 1.6,
    variants: 1,
    gain: 0.35,
    bus: "ui",
    dedupe: 1,
    priority: 5,
    pitchVar: 0,
    build(k) {
      [72, 76, 79, 84].forEach((n, i) =>
        bell(k, i * 0.07, n, 1.2, 0.3, null, true),
      );
    },
  });
  D("standing_down", {
    dur: 1.8,
    variants: 1,
    gain: 0.35,
    bus: "ui",
    dedupe: 1,
    priority: 5,
    pitchVar: 0,
    build(k) {
      [
        [0, 52],
        [0.14, 51],
        [0.3, 46],
      ].forEach((n) =>
        k.tone({
          type: "triangle",
          start: n[0],
          f: mtof(n[1]),
          a: 0.005,
          d: 0.9,
          peak: 0.5,
        }),
      );
      strings(k, 0.1, [40, 46], 1.0, 0.12, null, 0.3);
    },
  });

  // ------------------------------------------------------------------
  // VIGIL goggles & UI: relay clicks, a CRT power-up whine, soft typed text
  // ------------------------------------------------------------------
  /** Goggles on: lens-hood relay clack, capacitor charge (rising hum), the CRT flyback whine climbing into place
   *  and a faint raster tick when the display settles. */
  D("goggles_open", {
    dur: 1.0,
    variants: 1,
    gain: 0.45,
    bus: "ui",
    dedupe: 0.3,
    priority: 1,
    pitchVar: 0.02,
    build(k) {
      relay(k, 0, 1);
      k.tone({
        type: "sine",
        start: 0.02,
        f: 38,
        f2: 60,
        glide: 0.35,
        a: 0.03,
        d: 0.7,
        peak: 0.3,
      }); // charge hum
      k.tone({
        type: "triangle",
        start: 0.03,
        f: 90,
        f2: 120,
        glide: 0.35,
        a: 0.05,
        d: 0.5,
        peak: 0.08,
      });
      k.tone({
        type: "sine",
        start: 0.05,
        f: 2400,
        f2: 11800,
        glide: 0.42,
        a: 0.06,
        d: 0.55,
        peak: 0.07,
      }); // CRT whine rising
      k.burst({
        start: 0.08,
        a: 0.12,
        d: 0.3,
        peak: 0.12,
        type: "bandpass",
        f: 1600,
        f2: 5200,
        fT: 0.35,
        q: 1.4,
      }); // static wash
      k.burst({
        start: 0.46,
        a: 0.0003,
        d: 0.01,
        peak: 0.25,
        type: "highpass",
        f: 6000,
      }); // raster tick
      k.tone({
        type: "sine",
        start: 0.5,
        f: 1975,
        a: 0.003,
        d: 0.12,
        peak: 0.06,
      });
    },
  });
  /** Goggles off: the whine collapses downward, the picture "thups" out, the relay drops. */
  D("goggles_close", {
    dur: 0.7,
    variants: 1,
    gain: 0.42,
    bus: "ui",
    dedupe: 0.3,
    priority: 1,
    pitchVar: 0.02,
    build(k) {
      k.tone({
        type: "sine",
        f: 9800,
        f2: 1600,
        glide: 0.25,
        a: 0.004,
        d: 0.28,
        peak: 0.06,
      });
      k.tone({
        type: "sine",
        f: 70,
        f2: 30,
        glide: 0.2,
        a: 0.004,
        d: 0.22,
        peak: 0.35,
      });
      k.burst({ a: 0.003, d: 0.07, peak: 0.25, type: "lowpass", f: 900 });
      relay(k, 0.2, 0.85);
    },
  });
  /** Page / tab change: one tight relay and a tiny CRT redraw blip. */
  D("goggles_tab", {
    dur: 0.22,
    variants: 3,
    gain: 0.33,
    bus: "ui",
    dedupe: 0.04,
    priority: 1,
    pitchVar: 0.04,
    build(k) {
      relay(k, 0, 0.8);
      k.tone({
        type: "sine",
        start: 0.012,
        f: k.rr(2900, 3400),
        a: 0.001,
        d: 0.035,
        peak: 0.12,
      });
    },
  });
  /** Goggle display bed while the menu is up: mains hum, the flyback whine and a soft electrical hiss. */
  D("goggles_hum", {
    dur: 2,
    loop: true,
    gain: 0.11,
    bus: "ui",
    sr: 32000,
    priority: 6,
    gen(d, sr, r, n) {
      const a = d[0];
      let lp = 0;
      for (let i = 0; i < n; i++) {
        const t = i / sr,
          x = r() * 2 - 1;
        lp += (x - lp) * 0.08;
        a[i] =
          Math.sin(2 * Math.PI * 60 * t) * 0.42 +
          Math.sin(2 * Math.PI * 180 * t) * 0.12 +
          lp * 0.18 +
          Math.sin(2 * Math.PI * 15700 * t) *
            0.03 *
            (1 + 0.3 * Math.sin(2 * Math.PI * 0.5 * t)); // flyback whine
      }
    },
  });
  /** Goggle lamp toggle: a small toggle switch and the filament ticking warm. */
  D("goggle_lamp", {
    dur: 0.35,
    variants: 1,
    gain: 0.3,
    bus: "ui",
    dedupe: 0.1,
    priority: 3,
    build(k) {
      click(k, 0, 2100, 0.9);
      click(k, 0.014, 3300, 0.45);
      k.burst({
        start: 0.03,
        a: 0.01,
        d: 0.08,
        peak: 0.06,
        type: "highpass",
        f: 7000,
      });
    },
  });
  /** One character printed on the goggle display (notifications type themselves out): a soft, high CRT tick. */
  D("ui_type", {
    dur: 0.05,
    variants: 4,
    gain: 0.16,
    bus: "ui",
    dedupe: 0.012,
    maxVoices: 4,
    priority: 1,
    pitchVar: 0.12,
    build(k) {
      k.burst({
        a: 0.0002,
        d: 0.004,
        peak: 0.6,
        type: "bandpass",
        f: k.rr(4200, 5600),
        q: 3,
      });
      k.tone({
        type: "sine",
        f: k.rr(2200, 2700),
        a: 0.0005,
        d: 0.012,
        peak: 0.12,
      });
    },
  });
