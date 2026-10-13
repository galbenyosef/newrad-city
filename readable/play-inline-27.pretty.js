/* src/sound/14_recipes_ui.js */
/* =====================================================================
 * NEW RAD CITY — SOUND MODULE · 14_recipes_ui.js
 * VIGIL goggle & menu UI (relay clicks, CRT whine, typed text),
 * progression cues (level up, quests, discovery, standing), teletype
 * terminals, keypads & keys, consumables, pickups, containers, barter,
 * Geiger counter click, heartbeat. All melodies and cues are original.
 * ===================================================================== */
(function () {
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
  D("terminal_type", {
    dur: 0.14,
    variants: 6,
    gain: 0.3,
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
      });
      k.burst({
        start: 0.018,
        a: 0.0002,
        d: 0.012,
        peak: 1,
        type: "bandpass",
        f: k.rr(900, 1300),
        q: 2.5,
      });
      k.tone({
        type: "sine",
        start: 0.018,
        f: k.rr(150, 200),
        a: 0.001,
        d: 0.03,
        peak: 0.35,
      });
    },
  });
  /** Carriage return + line feed. */
  D("terminal_enter", {
    dur: 0.45,
    variants: 1,
    gain: 0.35,
    bus: "ui",
    dedupe: 0.05,
    priority: 1,
    build(k) {
      k.burst({
        a: 0.0003,
        d: 0.01,
        peak: 0.9,
        type: "bandpass",
        f: 1100,
        q: 2,
      });
      k.burst({
        start: 0.03,
        a: 0.03,
        d: 0.18,
        peak: 0.3,
        type: "bandpass",
        f: 1500,
        f2: 600,
        fT: 0.18,
        q: 1.4,
      });
      click(k, 0.24, 1700, 0.7);
      click(k, 0.28, 1500, 0.5);
    },
  });
  /** Accepted: the teletype bell, then a short burst of printing. */
  D("terminal_success", {
    dur: 1.2,
    variants: 1,
    gain: 0.35,
    bus: "ui",
    dedupe: 0.3,
    priority: 2,
    build(k) {
      bell(k, 0, 88, 0.9, 0.3);
      bell(k, 0.004, 95, 0.7, 0.12);
      for (let i = 0; i < 6; i++)
        k.burst({
          start: 0.35 + i * 0.07,
          a: 0.0002,
          d: 0.01,
          peak: 0.7,
          type: "bandpass",
          f: k.rr(900, 1400),
          q: 2.2,
        });
    },
  });
  /** Refused: the motor stalls on a jammed typebar, a dull double buzz. */
  D("terminal_fail", {
    dur: 0.8,
    variants: 1,
    gain: 0.35,
    bus: "ui",
    dedupe: 0.3,
    priority: 2,
    build(k) {
      k.burst({
        a: 0.0003,
        d: 0.02,
        peak: 0.9,
        type: "bandpass",
        f: 800,
        q: 2,
      });
      beep(k, 0.06, 196, 0.16, 0.45, "sawtooth");
      beep(k, 0.28, 147, 0.3, 0.45, "sawtooth");
    },
  });
  /** Power-up: the mains switch, the motor spinning up, a test line chattering out, the bell. */
  D("terminal_boot", {
    dur: 2.4,
    variants: 1,
    gain: 0.35,
    bus: "ui",
    dedupe: 0.5,
    priority: 2,
    build(k) {
      k.burst({ a: 0.001, d: 0.08, peak: 0.8, type: "lowpass", f: 500 }); // power switch thunk
      const mot = k.noise("brown", 0.05, 2.2),
        mf = k.filt("bandpass", 120, 1.4),
        mg = k.gain(0); // motor spin-up
      k.env(mf.frequency, [
        [0.05, 60],
        [0.9, 240],
      ]);
      k.env(mg.gain, [
        [0.05, 0.0001],
        [0.8, 0.22],
        [2.1, 0.18, "l"],
        [2.3, 0.0001],
      ]);
      k.chain(mot, mf, mg, k.out);
      k.tone({
        type: "sine",
        f: 30,
        f2: 60,
        glide: 0.8,
        a: 0.1,
        d: 1.8,
        peak: 0.25,
      });
      for (let i = 0; i < 12; i++)
        k.burst({
          start: 1.0 + i * 0.06 + k.rr(-0.005, 0.005),
          a: 0.0002,
          d: 0.01,
          peak: k.rr(0.5, 0.9),
          type: "bandpass",
          f: k.rr(900, 1400),
          q: 2.2,
        });
      bell(k, 1.85, 88, 0.6, 0.18);
    },
  });

  /** Power-down: the mains switch, the motor winding down, a last ratchet of the platen. */
  D("teletype_off", {
    dur: 1.2,
    variants: 1,
    gain: 0.33,
    bus: "ui",
    dedupe: 0.4,
    priority: 2,
    build(k) {
      k.burst({ a: 0.001, d: 0.07, peak: 0.8, type: "lowpass", f: 450 }); // power switch thunk
      const mot = k.noise("brown", 0, 1.1),
        mf = k.filt("bandpass", 240, 1.4),
        mg = k.gain(0); // motor spin-down
      k.env(mf.frequency, [
        [0, 240],
        [1.0, 50],
      ]);
      k.env(mg.gain, [
        [0, 0.0001],
        [0.03, 0.2],
        [1.0, 0.0001],
      ]);
      k.chain(mot, mf, mg, k.out);
      k.tone({
        type: "sine",
        f: 60,
        f2: 24,
        glide: 0.9,
        a: 0.01,
        d: 1.0,
        peak: 0.22,
      });
      click(k, 0.62, 1600, 0.4);
      click(k, 0.68, 1400, 0.3);
    },
  });
  /** The teletype bell: one small, bright ding on the bell stand. */
  D("teletype_bell", {
    dur: 0.9,
    variants: 1,
    gain: 0.32,
    bus: "ui",
    dedupe: 0.12,
    priority: 2,
    build(k) {
      k.burst({ a: 0.0002, d: 0.004, peak: 0.5, type: "highpass", f: 2500 });
      bell(k, 0, 88, 0.8, 0.32);
    },
  });

  // ------------------------------------------------------------------
  // Keys & keypads (locked doors open with a key, a keypad code or a passcode)
  // ------------------------------------------------------------------
  /** A keypad key: plastic key click and a short two-oscillator beep (pitch varies per key). */
  D("keypad_beep", {
    dur: 0.16,
    variants: 6,
    gain: 0.3,
    bus: "ui",
    dedupe: 0.03,
    maxVoices: 3,
    priority: 1,
    build(k, v) {
      const lo = [697, 770, 852, 941, 697, 852][v % 6],
        hi = [1209, 1336, 1477, 1209, 1477, 1336][v % 6];
      click(k, 0, 2600, 0.6);
      k.tone({
        type: "sine",
        start: 0.005,
        f: lo,
        a: 0.002,
        d: 0.09,
        peak: 0.28,
        curve: "lin",
      });
      k.tone({
        type: "sine",
        start: 0.005,
        f: hi,
        a: 0.002,
        d: 0.09,
        peak: 0.22,
        curve: "lin",
      });
    },
  });
  /** Code accepted: two rising beeps and the door solenoid pulling the bolt. */
  D("keypad_accept", {
    dur: 0.8,
    variants: 1,
    gain: 0.42,
    bus: "ui",
    dedupe: 0.3,
    priority: 2,
    build(k) {
      beep(k, 0, 1047, 0.07, 0.3, "sine");
      beep(k, 0.09, 1568, 0.12, 0.3, "sine");
      k.burst({
        start: 0.26,
        a: 0.0005,
        d: 0.03,
        peak: 0.9,
        type: "lowpass",
        f: 900,
      }); // solenoid
      k.tone({
        type: "sine",
        start: 0.26,
        f: 160,
        f2: 80,
        glide: 0.05,
        a: 0.001,
        d: 0.09,
        peak: 0.5,
      });
      k.burst({
        start: 0.32,
        a: 0.02,
        d: 0.12,
        peak: 0.25,
        type: "bandpass",
        f: 1500,
        f2: 2400,
        fT: 0.12,
        q: 1.5,
      }); // bolt slides
    },
  });
  /** Code refused: a low double buzz. */
  D("keypad_deny", {
    dur: 0.6,
    variants: 1,
    gain: 0.36,
    bus: "ui",
    dedupe: 0.3,
    priority: 2,
    build(k) {
      beep(k, 0, 233, 0.13, 0.45, "square");
      beep(k, 0.18, 233, 0.2, 0.45, "square");
    },
  });
  /** The goggle keypad overlay comes up: a relay clack and a short rising CRT chirp. */
  D("keypad_open", {
    dur: 0.35,
    variants: 1,
    gain: 0.3,
    bus: "ui",
    dedupe: 0.2,
    priority: 1,
    build(k) {
      relay(k, 0, 0.7);
      k.tone({
        type: "sine",
        start: 0.03,
        f: 900,
        f2: 1800,
        glide: 0.08,
        a: 0.004,
        d: 0.12,
        peak: 0.18,
        curve: "lin",
      });
      k.tone({
        type: "sine",
        start: 0.03,
        f: 15700,
        a: 0.01,
        d: 0.25,
        peak: 0.02,
      }); // CRT whine
    },
  });
  /** Entry cleared: two quick falling blips. */
  D("keypad_clear", {
    dur: 0.3,
    variants: 1,
    gain: 0.3,
    bus: "ui",
    dedupe: 0.1,
    priority: 1,
    build(k) {
      click(k, 0, 2400, 0.5);
      beep(k, 0.01, 1175, 0.05, 0.25, "sine");
      beep(k, 0.08, 784, 0.07, 0.25, "sine");
    },
  });
  /** A code or passcode written into the goggles' NOTES: a relay tick and three soft ascending data blips. */
  D("code_logged", {
    dur: 0.6,
    variants: 1,
    gain: 0.32,
    bus: "ui",
    dedupe: 0.4,
    priority: 2,
    build(k) {
      relay(k, 0, 0.5);
      [1319, 1568, 2093].forEach((f, i) =>
        beep(k, 0.05 + i * 0.07, f, 0.05, 0.2, "sine"),
      );
      k.burst({
        start: 0.3,
        a: 0.01,
        d: 0.12,
        peak: 0.08,
        type: "bandpass",
        f: 4200,
        q: 2,
      }); // data chatter
    },
  });
  /** A key in a lock: pins scraping as it goes in, a turn, the latch clacking open. */
  D("key_turn", {
    dur: 0.7,
    variants: 3,
    gain: 0.4,
    bus: "ui",
    dedupe: 0.2,
    priority: 2,
    pitchVar: 0.06,
    build(k) {
      k.grains({
        start: 0,
        span: 0.16,
        n: 5,
        f: k.rr(3800, 5200),
        q: 6,
        gain: 0.6,
        len: 0.005,
      }); // pins
      k.burst({
        start: 0.2,
        a: 0.03,
        d: 0.1,
        peak: 0.25,
        type: "bandpass",
        f: 2200,
        q: 3,
      }); // turn
      const m = k.metal(1, [900, 2100, 3400], 16);
      k.chain(m.output, k.gain(0.6), k.out);
      k.burst({
        start: 0.34,
        a: 0.0003,
        d: 0.015,
        peak: 0.9,
        type: "highpass",
        f: 700,
        dest: m.input,
      }); // latch
      k.tone({
        type: "sine",
        start: 0.34,
        f: 180,
        f2: 90,
        glide: 0.06,
        a: 0.001,
        d: 0.1,
        peak: 0.5,
      });
    },
  });

  // ------------------------------------------------------------------
  // Consumables
  // ------------------------------------------------------------------
  /** Hypodermic injector (morphine syrette, rage inhaler, doctors' shots): safety cap, spring-loaded needle, pressurised hiss, a relieved breath. */
  D("inject", {
    dur: 0.9,
    variants: 1,
    gain: 0.45,
    bus: "ui",
    dedupe: 0.3,
    priority: 2,
    build(k) {
      click(k, 0, 2600, 0.7); // cap off
      k.burst({
        start: 0.1,
        a: 0.0003,
        d: 0.012,
        peak: 0.6,
        type: "bandpass",
        f: 1700,
        q: 2,
      }); // spring fires
      k.burst({
        start: 0.12,
        a: 0.005,
        d: 0.02,
        peak: 0.5,
        type: "bandpass",
        f: 4000,
        q: 3,
      }); // needle in
      k.burst({
        start: 0.16,
        a: 0.03,
        d: 0.35,
        peak: 0.45,
        type: "highpass",
        f: 3000,
        f2: 5000,
        fT: 0.3,
      }); // plunger hiss
      k.tone({
        type: "sine",
        start: 0.55,
        f: 3200,
        a: 0.001,
        d: 0.25,
        peak: 0.12,
      }); // glass tink
      k.voice({
        start: 0.2,
        dur: 0.35,
        f0: [
          [0, 130],
          [0.35, 110],
        ],
        vowels: [
          [0, "hh"],
          [0.35, "uh"],
        ],
        breath: 1,
        gain: 0.15,
        attack: 0.05,
        release: 0.2,
      });
    },
  });
  D("eat", {
    dur: 1.3,
    variants: 2,
    gain: 0.45,
    bus: "ui",
    dedupe: 0.3,
    priority: 3,
    build(k) {
      for (let i = 0; i < 3; i++) {
        const st = i * k.rr(0.3, 0.38);
        k.grains({
          start: st,
          span: 0.08,
          n: 9,
          f: 1400,
          q: 0.8,
          gain: 0.8,
          len: 0.012,
        });
        k.burst({
          start: st + 0.02,
          a: 0.02,
          d: 0.12,
          peak: 0.25,
          type: "lowpass",
          f: 700,
        }); // wet chew
      }
    },
  });
  function gulp(k, st, peak) {
    k.voice({
      start: st,
      dur: 0.14,
      f0: [
        [0, 90],
        [0.14, 70],
      ],
      vowels: [
        [0, "o"],
        [0.14, "u"],
      ],
      shift: 0.8,
      gain: peak,
      attack: 0.02,
      release: 0.06,
    });
    k.tone({
      type: "sine",
      start: st + 0.02,
      f: 300,
      f2: 180,
      glide: 0.08,
      a: 0.005,
      d: 0.08,
      peak: peak * 0.4,
    });
  }
  D("drink", {
    dur: 1.5,
    variants: 2,
    gain: 0.45,
    bus: "ui",
    dedupe: 0.3,
    priority: 3,
    build(k) {
      k.tone({ type: "sine", f: 2900, a: 0.001, d: 0.12, peak: 0.08 }); // bottle to lips
      gulp(k, 0.25, 0.9);
      gulp(k, 0.55, 0.9);
      gulp(k, 0.85, 0.8);
      k.voice({
        start: 1.05,
        dur: 0.35,
        f0: [
          [0, 140],
          [0.35, 115],
        ],
        vowels: [
          [0, "hh"],
          [0.35, "a"],
        ],
        breath: 0.9,
        gain: 0.2,
        attack: 0.03,
        release: 0.2,
      });
    },
  });
  /** A bottle of Fizzo: the crown cap pops, a long fizz, two gulps and a satisfied "ahh". */
  D("drink_fizzo", {
    dur: 2.1,
    variants: 1,
    gain: 0.5,
    bus: "ui",
    dedupe: 0.3,
    priority: 3,
    build(k) {
      k.burst({
        a: 0.0005,
        d: 0.03,
        peak: 1,
        type: "bandpass",
        f: 1800,
        q: 1.5,
      });
      k.tone({
        type: "sine",
        f: 1100,
        f2: 700,
        glide: 0.05,
        a: 0.001,
        d: 0.06,
        peak: 0.3,
      });
      k.grains({
        start: 0.02,
        span: 0.9,
        n: 60,
        f: 6000,
        q: 0.8,
        gain: 0.25,
        len: 0.002,
        skew: 1.6,
      });
      k.burst({
        start: 0.02,
        a: 0.01,
        d: 0.6,
        peak: 0.25,
        type: "highpass",
        f: 4500,
      });
      gulp(k, 0.55, 0.9);
      gulp(k, 0.85, 0.9);
      k.voice({
        start: 1.2,
        dur: 0.6,
        f0: [
          [0, 150],
          [0.2, 160],
          [0.6, 120],
        ],
        vowels: [
          [0, "a"],
          [0.6, "uh"],
        ],
        breath: 0.6,
        gain: 0.45,
        attack: 0.04,
        release: 0.3,
      });
      k.tone({
        type: "sine",
        start: 1.25,
        f: 3136,
        a: 0.001,
        d: 0.25,
        peak: 0.06,
      });
    },
  });
  /** Rally Tonic: the cork comes out with a squeak, the syrup glugs from the bottle, a last drip off the lip. */
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
  D("caution", {
    dur: 0.6,
    variants: 1,
    gain: 0.3,
    bus: "ui",
    dedupe: 0.5,
    priority: 3,
    build(k) {
      beep(k, 0, 880, 0.09, 0.35, "triangle");
      beep(k, 0.13, 880, 0.09, 0.35, "triangle");
    },
  });
  D("heartbeat", {
    dur: 0.7,
    variants: 2,
    gain: 0.55,
    bus: "ui",
    dedupe: 0.2,
    priority: 2,
    pitchVar: 0.02,
    build(k) {
      k.tone({
        type: "sine",
        f: 62,
        f2: 42,
        glide: 0.1,
        a: 0.008,
        d: 0.13,
        peak: 1,
      });
      k.burst({ a: 0.004, d: 0.06, peak: 0.25, type: "lowpass", f: 180 });
      k.tone({
        type: "sine",
        start: 0.24,
        f: 55,
        f2: 40,
        glide: 0.1,
        a: 0.008,
        d: 0.12,
        peak: 0.7,
      });
    },
  });
  D("low_health", {
    dur: 2.0,
    variants: 2,
    gain: 0.4,
    bus: "ui",
    dedupe: 1.5,
    priority: 3,
    build(k) {
      // labored breath in … out
      k.voice({
        dur: 0.55,
        f0: [
          [0, 120],
          [0.55, 130],
        ],
        vowels: [
          [0, "hh"],
          [0.55, "uh"],
        ],
        breath: 1,
        gain: 0.3,
        attack: 0.15,
        release: 0.2,
      });
      k.voice({
        start: 0.7,
        dur: 0.8,
        f0: [
          [0, 125],
          [0.8, 95],
        ],
        vowels: [
          [0, "uh"],
          [0.8, "hh"],
        ],
        breath: 1,
        rough: 0.5,
        gain: 0.35,
        attack: 0.05,
        release: 0.4,
      });
      k.tone({
        type: "sine",
        f: 60,
        f2: 42,
        glide: 0.1,
        a: 0.008,
        d: 0.13,
        peak: 0.5,
      });
      k.tone({
        type: "sine",
        start: 0.24,
        f: 55,
        f2: 40,
        glide: 0.1,
        a: 0.008,
        d: 0.12,
        peak: 0.35,
      });
    },
  });
  /** A field repair: wrench ratchet, a tightened nut, a tap on the casing. */
  D("repair", {
    dur: 0.9,
    variants: 2,
    gain: 0.4,
    bus: "ui",
    dedupe: 0.3,
    priority: 3,
    pitchVar: 0.06,
    build(k) {
      k.grains({
        start: 0,
        span: 0.32,
        n: 9,
        f: k.rr(2800, 3600),
        q: 4,
        gain: 0.7,
        len: 0.006,
        peakMin: 0.5,
      }); // ratchet
      k.grains({
        start: 0.4,
        span: 0.2,
        n: 5,
        f: k.rr(2600, 3200),
        q: 4,
        gain: 0.6,
        len: 0.006,
        peakMin: 0.5,
      });
      const m = k.metal(1, [620, 1450, 2380, 3900], 22);
      k.chain(m.output, k.gain(0.5), k.out);
      k.burst({
        start: 0.7,
        a: 0.0003,
        d: 0.012,
        peak: 0.9,
        type: "highpass",
        f: 500,
        dest: m.input,
      }); // tap
      k.tone({
        type: "sine",
        start: 0.7,
        f: 210,
        f2: 140,
        glide: 0.04,
        a: 0.001,
        d: 0.08,
        peak: 0.35,
      });
    },
  });
  /** Steadying the aim: a short in-breath held behind the teeth. */
  D("breath_hold", {
    dur: 0.7,
    variants: 2,
    gain: 0.25,
    bus: "ui",
    dedupe: 0.5,
    priority: 4,
    pitchVar: 0.04,
    build(k) {
      const n = k.noise("pink", 0, 0.7),
        bp = k.filt("bandpass", 1100, 0.9),
        g = k.gain(0);
      k.env(bp.frequency, [
        [0, 800],
        [0.4, 1500],
      ]);
      k.env(g.gain, [
        [0, 0.0001],
        [0.32, 0.5],
        [0.42, 0.05],
        [0.6, 0.0001],
      ]);
      k.chain(n, bp, g, k.out);
    },
  });
  /** Letting the breath go after the shot. */
  D("breath_exhale", {
    dur: 1.0,
    variants: 2,
    gain: 0.25,
    bus: "ui",
    dedupe: 0.5,
    priority: 4,
    pitchVar: 0.05,
    build(k) {
      const n = k.noise("pink", 0, 1.0),
        bp = k.filt("bandpass", 1200, 0.8),
        g = k.gain(0);
      k.env(bp.frequency, [
        [0, 1300],
        [0.9, 650],
      ]);
      k.env(g.gain, [
        [0, 0.0001],
        [0.06, 0.45],
        [0.5, 0.2, "l"],
        [0.95, 0.0001],
      ]);
      k.chain(n, bp, g, k.out);
    },
  });
  /** A big bronze bell (clock towers, church belfries): hum, strike tone and a long ringing tail. */
  D("bell", {
    dur: 5,
    variants: 1,
    gain: 0.7,
    ref: 30,
    rolloff: 0.6,
    dedupe: 1,
    priority: 7,
    lazy: true,
    wet: 1.3,
    build(k) {
      k.burst({
        a: 0.0005,
        d: 0.03,
        peak: 0.6,
        type: "bandpass",
        f: 1800,
        q: 1,
      }); // clapper strike
      bell(k, 0, 55, 4.5, 0.55);
      k.tone({ type: "sine", f: mtof(43), a: 0.01, d: 4.8, peak: 0.3 }); // hum note
    },
  });
  D("geiger", {
    dur: 0.03,
    variants: 5,
    gain: 0.4,
    bus: "ui",
    dedupe: 0,
    maxVoices: 16,
    priority: 0,
    pitchVar: 0.15,
    norm: false,
    gen(d, sr, r, n) {
      const a = d[0];
      // one avalanche discharge: sharp impulse + tiny speaker ring
      const f = 2200 + r() * 1400;
      for (let i = 0; i < n; i++) {
        const t = i / sr;
        a[i] =
          (i < 3 ? (i === 0 ? 0.9 : -0.6) : 0) +
          Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 900) * 0.6 +
          (r() * 2 - 1) * Math.exp(-t * 2500) * 0.4;
      }
      // fixed-target peak (≤ 0.92): up to 16 overlapping clicks must not lean on the master limiter
      let pk = 0;
      for (let i = 0; i < n; i++) pk = Math.max(pk, Math.abs(a[i]));
      if (pk > 0.92) {
        const k = 0.92 / pk;
        for (let i = 0; i < n; i++) a[i] *= k;
      }
    },
  });
  [
    ["ui_tab", "goggles_tab"],
    ["ui_scroll", "ui_hover"],
    ["ui_confirm", "ui_select"],
    ["ui_cancel", "ui_back"],
    ["talent_select", "ui_select"],
    ["notify", "ui_hover"],
    ["ui_drop", "pickup"],
    ["pickup_ammo", "pickup_weapon"],
    ["pickup_aid", "pickup"],
    ["pickup_note", "pickup"],
    ["pickup_metal", "pickup_weapon"],
    ["ui_tick", "ui_click"],
    ["trade_done", "barter_trade"],
    ["stealth_detected", "sneak_detected"],
    ["ui_open", "goggles_tab"],
    ["level_up", "levelup"],
    ["questComplete", "quest_complete"],
    ["discovery_sting", "discover_location"],
    ["levelup_chord", "levelup"],
    ["keypad_ok", "keypad_accept"],
    ["keypad_fail", "keypad_deny"],
    ["key_unlock", "key_turn"],
    ["keypad_key", "keypad_beep"],
    ["keypad_buzz", "keypad_deny"],
    ["lock_key", "key_turn"],
    ["teletype_on", "terminal_boot"],
    ["teletype_accept", "terminal_success"],
    ["terminal_unlock", "terminal_success"],
    ["teletype_return", "terminal_enter"],
    ["teletype_boot", "terminal_boot"],
  ].forEach((a) => S.aliasOf(a[0], a[1]));
})();
