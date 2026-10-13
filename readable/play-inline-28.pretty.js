/* src/sound/16_recipes_world.js */
/* =====================================================================
 * NEW RAD CITY — SOUND MODULE · 16_recipes_world.js
 * Footsteps per surface, movement, doors, the cryo-unit pressure hatch & alarm,
 * alarms, fire / electric loops, weather, and the ambience beds + spot
 * sounds used by the automatic ambience system (60_ambience.js).
 * Loop beds are generated directly in JS (seamless, stereo).
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const S = G._snd;
  const D = S.define;

  // ------------------------------------------------------------------
  // JS DSP helpers for generated buffers
  // ------------------------------------------------------------------
  /** RBJ biquad; returns process(x) with mutable .set(f,q). */
  function biquad(type, f, q, sr) {
    let b0,
      b1,
      b2,
      a1,
      a2,
      x1 = 0,
      x2 = 0,
      y1 = 0,
      y2 = 0;
    const set = (ff, qq) => {
      const w = (2 * Math.PI * Math.min(ff, sr * 0.45)) / sr,
        cs = Math.cos(w),
        al = Math.sin(w) / (2 * qq);
      let a0;
      if (type === "lp") {
        b0 = (1 - cs) / 2;
        b1 = 1 - cs;
        b2 = b0;
        a0 = 1 + al;
        a1 = -2 * cs;
        a2 = 1 - al;
      } else if (type === "hp") {
        b0 = (1 + cs) / 2;
        b1 = -(1 + cs);
        b2 = b0;
        a0 = 1 + al;
        a1 = -2 * cs;
        a2 = 1 - al;
      } else {
        b0 = al;
        b1 = 0;
        b2 = -al;
        a0 = 1 + al;
        a1 = -2 * cs;
        a2 = 1 - al;
      } // bandpass (0 dB peak)
      b0 /= a0;
      b1 /= a0;
      b2 /= a0;
      a1 /= a0;
      a2 /= a0;
    };
    set(f, q);
    const p = function (x) {
      const y = b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
      x2 = x1;
      x1 = x;
      y2 = y1;
      y1 = y;
      return y;
    };
    p.set = set;
    return p;
  }
  S.biquad = biquad;
  /** Smooth random value-noise curve helper: returns fn(t) in [-1,1] periodic over `period` seconds with `k` knots. */
  function slowNoise(r, period, knots) {
    const v = [];
    for (let i = 0; i < knots; i++) v.push(r() * 2 - 1);
    return (t) => {
      const x = ((((t / period) % 1) + 1) % 1) * knots,
        i = Math.floor(x),
        f = x - i;
      const a = v[i % knots],
        b = v[(i + 1) % knots],
        s = f * f * (3 - 2 * f);
      return a + (b - a) * s;
    };
  }
  S.slowNoise = slowNoise;
  S.workerLib(biquad, slowNoise);

  // ------------------------------------------------------------------
  // Footsteps (player & NPCs). Surface ids match G.world colliders.
  // ------------------------------------------------------------------
  const FS = {
    dur: 0.4,
    variants: 6,
    gain: 0.26,
    ref: 2.5,
    rolloff: 1.4,
    maxVoices: 6,
    priority: 0,
    pitchVar: 0.07,
    dedupe: 0,
    wet: 0.6,
  };
  function heelThump(k, peak, f) {
    k.tone({
      type: "sine",
      f: f || 110,
      f2: 60,
      glide: 0.04,
      a: 0.002,
      d: 0.045,
      peak: peak,
    });
  }
  D(
    "footstep_concrete",
    Object.assign({}, FS, {
      build(k) {
        k.burst({
          a: 0.001,
          d: 0.014,
          peak: 1,
          type: "bandpass",
          f: k.rr(1700, 2600),
          q: 1.3,
        }); // heel click
        k.burst({
          start: k.rr(0.025, 0.04),
          a: 0.004,
          d: 0.045,
          peak: 0.4,
          type: "lowpass",
          f: 3000,
        }); // toe scuff
        heelThump(k, 0.55);
        k.grains({
          start: 0.01,
          span: 0.06,
          n: 3,
          f: 4500,
          q: 1,
          gain: 0.15,
          len: 0.004,
        }); // grit
      },
    }),
  );
  /**
   * Gear rattle while sprinting/landing: webbing & strap slap, canteen slosh-knock, a loose buckle / dog-tag
   * clink and a soft ammo-pouch rustle. Deliberately low and cloth-dominated (not coins).
   */
  D("gear_rattle", {
    dur: 0.5,
    variants: 5,
    gain: 0.2,
    ref: 2,
    rolloff: 1.4,
    maxVoices: 2,
    priority: 1,
    pitchVar: 0.06,
    dedupe: 0.12,
    wet: 0.4,
    bus: "world",
    build(k) {
      // strap / webbing slap: short pink burst, band-limited low-mid
      k.burst({
        kind: "pink",
        a: 0.003,
        d: 0.05,
        peak: 0.8,
        type: "bandpass",
        f: k.rr(500, 800),
        q: 0.9,
      });
      k.burst({
        kind: "pink",
        start: k.rr(0.05, 0.09),
        a: 0.01,
        d: 0.07,
        peak: 0.45,
        type: "bandpass",
        f: k.rr(900, 1400),
        q: 0.8,
      });
      // canteen: hollow knock + a little slosh
      const can = k.metal(k.rr(330, 420), [1, 2.32, 3.9], 14, [1, 0.35, 0.15]);
      k.chain(can.output, k.gain(0.35), k.out);
      k.burst({
        start: k.rr(0.0, 0.03),
        a: 0.001,
        d: 0.012,
        peak: 0.9,
        type: "lowpass",
        f: 1500,
        dest: can.input,
      });
      k.burst({
        kind: "brown",
        start: 0.03,
        a: 0.03,
        d: 0.12,
        peak: 0.25,
        type: "bandpass",
        f: 380,
        q: 2.5,
      });
      // buckle / tag clink (occasionally)
      if (k.r() < 0.7) {
        const m = k.metal(
          1,
          [k.rr(2400, 3100), k.rr(4200, 5200), k.rr(6600, 7600)],
          28,
        );
        k.chain(m.output, k.gain(0.18), k.out);
        k.burst({
          start: k.rr(0.02, 0.12),
          a: 0.0002,
          d: 0.004,
          peak: 0.8,
          type: "highpass",
          f: 1800,
          dest: m.input,
        });
      }
      k.grains({
        start: 0.02,
        span: 0.18,
        n: 5,
        f: 3200,
        q: 0.7,
        gain: 0.08,
        len: 0.01,
      }); // pouch rustle
    },
  });
  D(
    "footstep_grass",
    Object.assign({}, FS, {
      build(k) {
        k.grains({
          start: 0,
          span: 0.09,
          n: 14,
          f: k.rr(2500, 3500),
          q: 0.7,
          gain: 0.55,
          len: 0.008,
        }); // dry dead grass crunch
        k.burst({ a: 0.006, d: 0.07, peak: 0.6, type: "lowpass", f: 450 });
        k.burst({
          start: 0.02,
          a: 0.02,
          d: 0.1,
          peak: 0.2,
          type: "bandpass",
          f: 5000,
          q: 0.8,
        });
        heelThump(k, 0.3, 90);
      },
    }),
  );
  D(
    "footstep_dirt",
    Object.assign({}, FS, {
      build(k) {
        k.grains({
          start: 0,
          span: 0.07,
          n: 9,
          f: k.rr(1500, 2200),
          q: 0.8,
          gain: 0.5,
          len: 0.01,
        });
        k.burst({ a: 0.004, d: 0.06, peak: 0.7, type: "lowpass", f: 600 });
        heelThump(k, 0.4, 95);
      },
    }),
  );
  D(
    "footstep_metal",
    Object.assign({}, FS, {
      dur: 0.5,
      build(k) {
        const b = k.rr(360, 470);
        const m = k.metal(
          1,
          [b, b * 2.63, b * 4.41, b * 6.9],
          22,
          [1, 0.6, 0.4, 0.2],
        );
        const rg = k.gain(0.55);
        k.chain(m.output, rg, k.out);
        k.env(rg.gain, [
          [0, 0.55],
          [0.3, 0.001],
        ]);
        k.burst({
          a: 0.0005,
          d: 0.01,
          peak: 1,
          type: "highpass",
          f: 600,
          dest: m.input,
        });
        k.burst({
          a: 0.001,
          d: 0.012,
          peak: 0.6,
          type: "bandpass",
          f: 2800,
          q: 1.5,
        });
        heelThump(k, 0.6, 95);
      },
    }),
  );
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
  D("machinery_clank", {
    dur: 1.2,
    variants: 3,
    gain: 0.4,
    ref: 20,
    priority: 6,
    wet: 1.4,
    build(k) {
      const m = k.metal(
        1,
        [k.rr(140, 200), k.rr(350, 420), k.rr(760, 900), k.rr(1400, 1700)],
        14,
      );
      k.chain(m.output, k.gain(0.8), k.out);
      const hits = 1 + ((k.r() * 3) | 0);
      for (let i = 0; i < hits; i++)
        k.burst({
          start: i * k.rr(0.12, 0.25),
          a: 0.001,
          d: 0.03,
          peak: 1,
          type: "lowpass",
          f: 1500,
          dest: m.input,
        });
    },
  });
  D("siren_distant", {
    dur: 9,
    variants: 1,
    gain: 0.4,
    bus: "amb",
    sr: 22050,
    priority: 8,
    pitchVar: 0.03,
    build(k) {
      // an old civil-defence siren somewhere, still wailing on a dying battery
      const o = k.osc("sawtooth", 300, 0, 9),
        o2 = k.osc("sawtooth", 450, 0, 9);
      k.env(o.frequency, [
        [0, 180],
        [2.5, 520],
        [5, 480, "l"],
        [8.5, 150],
      ]);
      k.env(o2.frequency, [
        [0, 270],
        [2.5, 780],
        [5, 720, "l"],
        [8.5, 225],
      ]);
      const g = k.gain(0);
      k.env(g.gain, [
        [0, 0.0001],
        [2.2, 0.4],
        [5.5, 0.35, "l"],
        [8.8, 0.0001],
      ]);
      const lp = k.filt("lowpass", 1400, 0.7);
      k.chain(o, lp, g, k.out);
      o2.connect(lp);
    },
  });
  D("howl", {
    sr: 22050,
    dur: 3.2,
    variants: 2,
    gain: 0.45,
    ref: 25,
    priority: 7,
    build(k) {
      const f = k.rr(420, 520);
      k.voice({
        dur: 2.6,
        f0: [
          [0, f * 0.8],
          [0.6, f * 1.15],
          [2.0, f * 1.05],
          [2.6, f * 0.7],
        ],
        vowels: [
          [0, "u"],
          [0.6, "o"],
          [2.6, "u"],
        ],
        shift: 1.3,
        breath: 0.3,
        rough: 0.2,
        gain: 1,
        attack: 0.3,
        release: 0.6,
      });
    },
  });
  D("moan", {
    sr: 22050,
    dur: 2.5,
    variants: 3,
    gain: 0.45,
    ref: 15,
    priority: 7,
    build(k) {
      const f = k.rr(90, 130);
      k.voice({
        dur: 2.0,
        f0: [
          [0, f],
          [1, f * 1.3],
          [2, f * 0.8],
        ],
        vowels: [
          [0, "uh"],
          [1, "o"],
          [2, "u"],
        ],
        breath: 0.6,
        rough: 0.7,
        growl: 14,
        gain: 1,
        attack: 0.4,
        release: 0.6,
        dist: 2,
      });
    },
  });
  D("buoy_bell", {
    sr: 22050,
    dur: 3.5,
    variants: 2,
    gain: 0.35,
    ref: 40,
    rolloff: 0.7,
    priority: 8,
    build(k) {
      S.jingleKit.bell(k, 0, 62 + (k.r() < 0.5 ? 0 : 3), 3, 0.6);
    },
  });
  D("fly_buzz", {
    dur: 1.6,
    variants: 2,
    gain: 0.25,
    ref: 2,
    priority: 8,
    channels: 2,
    build(k) {
      const o = k.osc("sawtooth", k.rr(220, 280), 0, 1.5),
        g = k.gain(0),
        p = k.pan(0);
      const w = k.osc("sine", 3, 0, 1.5),
        wg = k.gain(40);
      k.chain(w, wg, o.frequency);
      k.env(g.gain, [
        [0, 0.0001],
        [0.3, 0.4],
        [1.1, 0.35, "l"],
        [1.5, 0.0001],
      ]);
      k.env(p.pan, [
        [0, k.rr(-1, 0)],
        [1.5, k.rr(0, 1), "l"],
      ]);
      k.chain(o, k.filt("bandpass", 1200, 1.5), g, p, k.out);
    },
  });

  // ------------------------------------------------------------------
  // Ambience BEDS (stereo seamless loops on the ambience bus)
  // ------------------------------------------------------------------
  const BED = {
    loop: true,
    bus: "amb",
    channels: 2,
    sr: 22050,
    gain: 0.5,
    pitchVar: 0,
    priority: 2,
    wet: 0,
  };
  D(
    "amb_wind",
    Object.assign({}, BED, {
      dur: 10,
      gen(d, sr, r, n) {
        for (let c = 0; c < 2; c++) {
          const a = d[c],
            f = biquad("bp", 400, 0.6, sr),
            lp = biquad("lp", 900, 0.5, sr);
          const cut = slowNoise(r, 10, 7),
            gust = slowNoise(r, 10, 5);
          for (let i = 0; i < n; i++) {
            const t = i / sr;
            if ((i & 63) === 0) f.set(320 + 260 * (cut(t + c * 0.7) + 1), 0.7);
            const x = r() * 2 - 1;
            a[i] =
              lp(f(x)) *
              (0.45 + 0.55 * Math.max(0, gust(t + c * 0.4) * 0.7 + 0.5)) *
              1.6;
          }
        }
      },
    }),
  );
  D(
    "amb_whistle",
    Object.assign({}, BED, {
      dur: 12,
      gen(d, sr, r, n) {
        for (let c = 0; c < 2; c++) {
          const a = d[c],
            f = biquad("bp", 900, 30, sr),
            f2 = biquad("bp", 1400, 40, sr);
          const sw = slowNoise(r, 12, 6),
            amp = slowNoise(r, 12, 9);
          for (let i = 0; i < n; i++) {
            const t = i / sr;
            if ((i & 63) === 0) {
              f.set(760 + 280 * sw(t + c), 30);
              f2.set(1300 + 400 * sw(t * 1.3 + 2 + c), 40);
            }
            const x = r() * 2 - 1;
            a[i] =
              (f(x) * 5 + f2(x) * 3) *
              Math.max(0, amp(t + c * 0.5) * 0.8 + 0.2);
          }
        }
      },
    }),
  );
  D(
    "amb_city",
    Object.assign({}, BED, {
      dur: 8,
      sr: 16000,
      gen(d, sr, r, n) {
        for (let c = 0; c < 2; c++) {
          const a = d[c],
            lp = biquad("lp", 140, 0.6, sr),
            lp2 = biquad("lp", 600, 0.5, sr),
            sn = slowNoise(r, 8, 6);
          for (let i = 0; i < n; i++) {
            const t = i / sr,
              x = r() * 2 - 1;
            a[i] =
              lp(x) * 3.5 * (0.7 + 0.3 * sn(t + c)) +
              lp2(x) * 0.2 +
              Math.sin(2 * Math.PI * 50 * t) * 0.02;
          }
        }
      },
    }),
  );
  D(
    "amb_water",
    Object.assign({}, BED, {
      dur: 9,
      gen(d, sr, r, n) {
        for (let c = 0; c < 2; c++) {
          const a = d[c],
            lp = biquad("lp", 700, 0.7, sr),
            bp = biquad("bp", 1800, 1.5, sr);
          // wave pulses: sum of periodic bumps at loop-friendly rates
          const rates = [2 / 9, 3 / 9, 5 / 9].map((x) => x * (c ? 1 : 1)),
            ph = rates.map(() => r());
          for (let i = 0; i < n; i++) {
            const t = i / sr;
            let env = 0;
            for (let k = 0; k < 3; k++)
              env += Math.pow(
                Math.max(
                  0,
                  Math.sin(2 * Math.PI * (rates[k] * t + ph[k] + c * 0.21)),
                ),
                3,
              );
            const x = r() * 2 - 1;
            a[i] = lp(x) * 1.3 * (0.25 + env * 0.5) + bp(x) * 0.5 * env * env;
          }
        }
      },
    }),
  );
  D(
    "amb_crickets",
    Object.assign({}, BED, {
      dur: 6,
      sr: 22050,
      gen(d, sr, r, n) {
        // several crickets, each with its own chirp rhythm and pitch, panned
        const crickets = [];
        for (let k = 0; k < 5; k++)
          crickets.push({
            f: 3900 + r() * 1400,
            period: 6 / (4 + ((r() * 6) | 0)),
            off: r(),
            pulses: 2 + ((r() * 3) | 0),
            pan: r(),
            amp: 0.3 + r() * 0.7,
          });
        for (let i = 0; i < n; i++) {
          const t = i / sr;
          let L = 0,
            R = 0;
          for (const cr of crickets) {
            const tt = ((t / cr.period + cr.off) % 1) * cr.period; // time inside this chirp cycle
            const pulseLen = 0.022,
              idx = Math.floor(tt / 0.033);
            if (idx < cr.pulses) {
              const pt = tt - idx * 0.033;
              if (pt < pulseLen) {
                const v =
                  Math.sin(2 * Math.PI * cr.f * t) *
                  Math.sin((Math.PI * pt) / pulseLen) *
                  cr.amp;
                L += v * (1 - cr.pan);
                R += v * cr.pan;
              }
            }
          }
          d[0][i] = L * 0.5 + (r() * 2 - 1) * 0.004;
          d[1][i] = R * 0.5 + (r() * 2 - 1) * 0.004;
        }
      },
    }),
  );
  D(
    "amb_cryo",
    Object.assign({}, BED, {
      dur: 6,
      sr: 16000,
      gen(d, sr, r, n) {
        for (let c = 0; c < 2; c++) {
          const a = d[c],
            lp = biquad("lp", 700, 0.6, sr),
            sn = slowNoise(r, 6, 4);
          for (let i = 0; i < n; i++) {
            const t = i / sr,
              x = r() * 2 - 1;
            const hum =
              Math.sin(2 * Math.PI * 60 * t) * 0.3 +
              Math.sin(2 * Math.PI * 120 * t + c) * 0.12 +
              Math.sin(2 * Math.PI * 240 * t) * 0.03;
            a[i] =
              hum * 0.6 +
              lp(x) * 0.9 * (0.85 + 0.15 * sn(t)) +
              Math.sin(2 * Math.PI * 7000 * t) * 0.002;
          }
        }
      },
    }),
  );
  D(
    "amb_room",
    Object.assign({}, BED, {
      dur: 8,
      sr: 16000,
      gen(d, sr, r, n) {
        for (let c = 0; c < 2; c++) {
          const a = d[c],
            lp = biquad("lp", 260, 0.6, sr),
            bp = biquad("bp", 900, 0.8, sr),
            sn = slowNoise(r, 8, 5);
          for (let i = 0; i < n; i++) {
            const t = i / sr,
              x = r() * 2 - 1;
            a[i] = lp(x) * 2.2 * (0.7 + 0.3 * sn(t + c)) + bp(x) * 0.06;
          }
        }
      },
    }),
  );
  D(
    "amb_tunnel",
    Object.assign({}, BED, {
      dur: 12,
      sr: 16000,
      gen(d, sr, r, n) {
        for (let c = 0; c < 2; c++) {
          const a = d[c],
            lp = biquad("lp", 120, 0.7, sr),
            bp = biquad("bp", 500, 1.2, sr),
            sw = slowNoise(r, 12, 6),
            am = slowNoise(r, 12, 8);
          for (let i = 0; i < n; i++) {
            const t = i / sr,
              x = r() * 2 - 1;
            if ((i & 63) === 0) bp.set(350 + 250 * (sw(t + c) + 1), 1.4);
            a[i] = lp(x) * 3 + bp(x) * 0.6 * Math.max(0, am(t) * 0.7 + 0.4);
          }
        }
      },
    }),
  );
  D(
    "amb_rain",
    Object.assign({}, BED, {
      dur: 5,
      sr: 22050,
      gen(d, sr, r, n) {
        for (let c = 0; c < 2; c++) {
          const a = d[c],
            hp = biquad("hp", 900, 0.6, sr),
            lp = biquad("lp", 7000, 0.6, sr);
          let drop = 0;
          for (let i = 0; i < n; i++) {
            const x = r() * 2 - 1;
            if (r() < 0.0025) drop = (r() - 0.3) * 1.5;
            drop *= 0.86;
            a[i] = lp(hp(x)) * 0.55 + drop * 0.5;
          }
        }
      },
    }),
  );
  D(
    "amb_storm",
    Object.assign({}, BED, {
      dur: 6,
      sr: 22050,
      gen(d, sr, r, n) {
        for (let c = 0; c < 2; c++) {
          const a = d[c],
            sn = slowNoise(r, 6, 12);
          let ring = 0,
            v = 0;
          for (let i = 0; i < n; i++) {
            const t = i / sr;
            if (r() < 0.0012 * (1 + sn(t))) v = (r() - 0.5) * 2;
            ring = ring * 0.8 + v;
            v *= 0.2;
            a[i] =
              ring * 0.3 +
              Math.sin(2 * Math.PI * 55 * t) * 0.05 * (1 + sn(t + 1));
          }
        }
      },
    }),
  );
  D(
    "amb_hum_generator",
    Object.assign({}, BED, {
      dur: 4,
      gen(d, sr, r, n) {
        for (let c = 0; c < 2; c++) {
          const a = d[c];
          for (let i = 0; i < n; i++) {
            const t = i / sr;
            a[i] =
              Math.tanh(Math.sin(2 * Math.PI * 30 * t) * 3) * 0.3 +
              Math.sin(2 * Math.PI * 90 * t) * 0.1 +
              (r() * 2 - 1) * 0.04;
          }
        }
      },
    }),
  );
})();
