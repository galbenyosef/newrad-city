// play-inline-28 01 — peak
// Lines 10-321 of readable/play-inline-28.pretty.js (statement-aligned).
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
