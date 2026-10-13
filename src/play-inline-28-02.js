// play-inline-28 02 — gain
// Lines 322-668 of readable/play-inline-28.pretty.js (statement-aligned).
  D(
    "footstep_wood",
    Object.assign({}, FS, {
      build(k, v) {
        k.burst({
          a: 0.001,
          d: 0.05,
          peak: 1,
          type: "bandpass",
          f: k.rr(170, 230),
          q: 3,
        }); // hollow body
        k.burst({
          a: 0.001,
          d: 0.03,
          peak: 0.6,
          type: "bandpass",
          f: k.rr(420, 560),
          q: 4,
        });
        k.burst({
          a: 0.0008,
          d: 0.01,
          peak: 0.4,
          type: "bandpass",
          f: 2200,
          q: 1.2,
        });
        if (v % 3 === 0) {
          // floorboard creak
          const o = k.osc("sawtooth", k.rr(300, 420), 0.03, 0.2),
            am = k.osc("square", k.rr(30, 45), 0.03, 0.2),
            ag = k.gain(0.5),
            g = k.gain(0);
          k.env(g.gain, [
            [0.03, 0.0001],
            [0.07, 0.12],
            [0.2, 0.0001],
          ]);
          k.chain(am, ag, g.gain);
          k.chain(o, k.filt("bandpass", 900, 5), g, k.out);
        }
      },
    }),
  );
  D(
    "footstep_water",
    Object.assign({}, FS, {
      dur: 0.6,
      build(k) {
        const n = k.noise("white", 0, 0.3),
          f = k.filt("bandpass", 1400, 1.2),
          g = k.gain(0);
        k.env(f.frequency, [
          [0, 900],
          [0.05, 2600],
          [0.2, 1300],
        ]);
        k.env(g.gain, [
          [0, 0.0001],
          [0.012, 0.8],
          [0.22, 0.0001],
        ]);
        const am = k.osc("sine", k.rr(35, 55), 0, 0.3),
          ag = k.gain(0.35);
        k.chain(am, ag, g.gain); // bubbly
        k.chain(n, f, g, k.out);
        k.tone({
          type: "sine",
          f: k.rr(300, 380),
          f2: 150,
          glide: 0.06,
          a: 0.003,
          d: 0.07,
          peak: 0.4,
        }); // plop
        k.grains({
          start: 0.08,
          span: 0.25,
          n: 5,
          f: 3000,
          q: 4,
          gain: 0.2,
          len: 0.006,
        }); // drips
      },
    }),
  );
  D(
    "footstep_rubble",
    Object.assign({}, FS, {
      build(k) {
        k.grains({
          start: 0,
          span: 0.12,
          n: 16,
          f: k.rr(1800, 2600),
          q: 0.9,
          gain: 0.55,
          len: 0.009,
          skew: 0.8,
        }); // gravel
        for (let i = 0; i < 2; i++)
          k.burst({
            start: k.rr(0.01, 0.1),
            a: 0.0004,
            d: 0.012,
            peak: 0.5,
            type: "bandpass",
            f: k.rr(2500, 3800),
            q: 7,
          }); // pebbles
        k.burst({ a: 0.004, d: 0.06, peak: 0.6, type: "lowpass", f: 700 });
        heelThump(k, 0.4, 100);
      },
    }),
  );
  D(
    "footstep_carpet",
    Object.assign({}, FS, {
      build(k) {
        k.burst({ a: 0.006, d: 0.06, peak: 0.8, type: "lowpass", f: 420 });
        k.burst({
          start: 0.01,
          a: 0.01,
          d: 0.05,
          peak: 0.2,
          type: "bandpass",
          f: 2500,
          q: 0.7,
        });
        heelThump(k, 0.35, 85);
      },
    }),
  );
  D("jump", {
    dur: 0.45,
    variants: 3,
    gain: 0.35,
    bus: "ui",
    dedupe: 0.2,
    priority: 2,
    build(k) {
      k.burst({
        kind: "pink",
        a: 0.02,
        d: 0.14,
        peak: 0.5,
        type: "bandpass",
        f: 1800,
        q: 0.7,
      }); // clothes & gear
      k.voice({
        dur: 0.18,
        f0: [
          [0, 140],
          [0.18, 150],
        ],
        vowels: [
          [0, "hh"],
          [0.18, "uh"],
        ],
        breath: 1,
        gain: 0.25,
        attack: 0.02,
        release: 0.1,
      });
      k.burst({
        a: 0.001,
        d: 0.02,
        peak: 0.25,
        type: "bandpass",
        f: 2200,
        q: 1.3,
      });
    },
  });
  D("land", {
    dur: 0.6,
    variants: 3,
    gain: 0.5,
    bus: "ui",
    dedupe: 0.15,
    priority: 2,
    build(k) {
      k.tone({
        type: "sine",
        f: 95,
        f2: 45,
        glide: 0.08,
        a: 0.002,
        d: 0.12,
        peak: 1,
      });
      k.burst({ a: 0.002, d: 0.08, peak: 0.8, type: "lowpass", f: 900 });
      k.grains({
        start: 0.02,
        span: 0.15,
        n: 7,
        f: 3000,
        q: 3,
        gain: 0.25,
        len: 0.01,
      }); // gear rattle
      k.burst({
        kind: "pink",
        start: 0.01,
        a: 0.01,
        d: 0.1,
        peak: 0.3,
        type: "bandpass",
        f: 1600,
        q: 0.7,
      });
    },
  });
  D("splash", {
    dur: 1.2,
    variants: 2,
    gain: 0.6,
    ref: 6,
    priority: 4,
    build(k) {
      const n = k.noise("white", 0, 0.9),
        f = k.filt("bandpass", 1200, 0.8),
        g = k.gain(0);
      k.env(f.frequency, [
        [0, 700],
        [0.08, 3000],
        [0.8, 1200],
      ]);
      k.env(g.gain, [
        [0, 0.0001],
        [0.02, 1],
        [0.85, 0.0001],
      ]);
      k.chain(n, f, g, k.out);
      k.tone({
        type: "sine",
        f: 220,
        f2: 90,
        glide: 0.1,
        a: 0.003,
        d: 0.15,
        peak: 0.7,
      });
      k.grains({
        start: 0.2,
        span: 0.8,
        n: 20,
        f: 2500,
        q: 3,
        gain: 0.3,
        len: 0.008,
      });
    },
  });

  // ------------------------------------------------------------------
  // Doors
  // ------------------------------------------------------------------
  function creak(k, st, d, f0, f1, peak, dest) {
    const o = k.osc("sawtooth", f0, st, d + 0.05);
    k.env(o.frequency, [
      [st, f0],
      [st + d, f1, "l"],
    ]);
    const am = k.osc("square", k.rr(16, 28), st, d + 0.05),
      ag = k.gain(0.45);
    const g = k.gain(0);
    k.env(g.gain, [
      [st, 0.0001],
      [st + 0.06, peak],
      [st + d * 0.8, peak * 0.7, "l"],
      [st + d, 0.0001],
    ]);
    k.chain(am, ag, g.gain);
    k.chain(o, k.filt("bandpass", f0 * 3, 5), g, dest || k.out);
    k.chain(o, k.filt("bandpass", f0 * 6.3, 7), g);
  }
  S.creak = creak;
  D("door_open", {
    dur: 1.6,
    variants: 3,
    gain: 0.55,
    ref: 5,
    wet: 0.6,
    dedupe: 0.2,
    priority: 1,
    build(k) {
      // handle + latch, hinge creak as the door swings, air whoosh, closing thud behind you
      k.burst({
        a: 0.0004,
        d: 0.012,
        peak: 0.8,
        type: "bandpass",
        f: 2600,
        q: 3,
      });
      k.burst({
        start: 0.05,
        a: 0.0004,
        d: 0.015,
        peak: 0.7,
        type: "bandpass",
        f: 1500,
        q: 3,
      });
      creak(k, 0.12, k.rr(0.45, 0.7), k.rr(130, 190), k.rr(220, 320), 0.45);
      k.burst({
        kind: "pink",
        start: 0.15,
        a: 0.15,
        d: 0.4,
        peak: 0.25,
        type: "lowpass",
        f: 600,
      });
      k.burst({
        start: 1.05,
        a: 0.002,
        d: 0.12,
        peak: 0.9,
        type: "lowpass",
        f: 500,
      });
      k.tone({
        type: "sine",
        start: 1.05,
        f: 110,
        f2: 60,
        glide: 0.08,
        a: 0.001,
        d: 0.15,
        peak: 0.6,
      });
      k.burst({
        start: 1.08,
        a: 0.0004,
        d: 0.012,
        peak: 0.5,
        type: "bandpass",
        f: 2800,
        q: 3,
      });
    },
  });
