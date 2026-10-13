// play-inline-41 01 — math
// Lines 34-383 of readable/play-inline-41.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const S = G._snd;
  const D = S.define;
  const clamp = S.clamp;
  // gen() bodies run in the worker (free identifiers resolve to worker-lib functions) or, without a worker, here:
  const biquad = S.biquad,
    slowNoise = S.slowNoise;
  function nyTalker() {
    return S.nyTalker.apply(null, arguments);
  }
  function nyClatter() {
    return S.nyClatter.apply(null, arguments);
  }

  // ------------------------------------------------------------------
  // 1. Reverb presets (lazy)
  // ------------------------------------------------------------------
  Object.assign(S.ENVS, {
    small: {
      lazy: true,
      wet: 0.17,
      ir: {
        dur: 0.9,
        rt60: 0.42,
        pre: 0.003,
        fc0: 6000,
        fcEnd: 1100,
        er: [
          [0.006, 0.45],
          [0.011, 0.35],
          [0.017, 0.25],
          [0.024, 0.15],
        ],
      },
    },
    office: {
      lazy: true,
      wet: 0.24,
      ir: {
        dur: 1.5,
        rt60: 0.85,
        pre: 0.008,
        fc0: 7000,
        fcEnd: 1300,
        er: [
          [0.012, 0.38],
          [0.021, 0.3],
          [0.033, 0.22],
          [0.047, 0.12],
        ],
      },
    },
    gallery: {
      lazy: true,
      wet: 0.31,
      ir: {
        dur: 3.0,
        rt60: 2.1,
        pre: 0.018,
        fc0: 8500,
        fcEnd: 1500,
        er: [
          [0.024, 0.34],
          [0.041, 0.28],
          [0.063, 0.22],
          [0.09, 0.14],
        ],
      },
    },
    cathedral: {
      lazy: true,
      wet: 0.44,
      ir: {
        dur: 5.0,
        rt60: 4.3,
        pre: 0.035,
        fc0: 5200,
        fcEnd: 520,
        width: 0.6,
        er: [
          [0.048, 0.24],
          [0.079, 0.22],
          [0.118, 0.18],
          [0.165, 0.14],
          [0.23, 0.1],
        ],
      },
    },
    concourse: {
      lazy: true,
      wet: 0.4,
      ir: {
        dur: 4.4,
        rt60: 3.5,
        pre: 0.045,
        fc0: 6500,
        fcEnd: 700,
        width: 0.5,
        er: [
          [0.07, 0.3],
          [0.13, 0.24],
          [0.21, 0.2],
          [0.32, 0.15],
          [0.46, 0.1],
        ],
      },
    },
    auditorium: {
      lazy: true,
      wet: 0.3,
      ir: {
        dur: 2.6,
        rt60: 1.8,
        pre: 0.022,
        fc0: 5000,
        fcEnd: 650,
        er: [
          [0.028, 0.3],
          [0.045, 0.26],
          [0.066, 0.2],
          [0.098, 0.12],
        ],
      },
    },
    hull: {
      lazy: true,
      wet: 0.33,
      ir: {
        dur: 1.9,
        rt60: 1.15,
        pre: 0.006,
        fc0: 7500,
        fcEnd: 1400,
        metallic: 1.8,
        er: [
          [0.009, 0.45],
          [0.016, 0.35],
          [0.026, 0.28],
          [0.037, 0.2],
        ],
      },
    },
    bunker: {
      lazy: true,
      wet: 0.29,
      ir: {
        dur: 1.7,
        rt60: 1.05,
        pre: 0.006,
        fc0: 6500,
        fcEnd: 1200,
        er: [
          [0.018, 0.4],
          [0.036, 0.33],
          [0.054, 0.27],
          [0.072, 0.21],
          [0.09, 0.15],
          [0.108, 0.1],
        ],
      },
    },
    industrial: {
      lazy: true,
      wet: 0.36,
      ir: {
        dur: 3.4,
        rt60: 2.5,
        pre: 0.03,
        fc0: 6000,
        fcEnd: 800,
        metallic: 0.7,
        er: [
          [0.05, 0.3],
          [0.1, 0.24],
          [0.17, 0.18],
          [0.26, 0.12],
        ],
      },
    },
  });

  // ------------------------------------------------------------------
  // 2. Beds (stereo seamless loops, generated in the worker, lazy)
  // ------------------------------------------------------------------
  const BED = {
    loop: true,
    bus: "amb",
    channels: 2,
    sr: 16000,
    gain: 0.5,
    pitchVar: 0,
    priority: 3,
    wet: 0,
    lazy: true,
  };
  /** A huge ruined space: sub rumble, slow hollow swells, wind moaning somewhere high up through broken glass. */
  D(
    "amb_int_air",
    Object.assign({}, BED, {
      dur: 14,
      gen(d, sr, r, n) {
        for (let c = 0; c < 2; c++) {
          const a = d[c],
            lp = biquad("lp", 80, 0.7, sr),
            bp = biquad("bp", 220, 0.9, sr),
            mo = biquad("bp", 480, 14, sr),
            mo2 = biquad("bp", 690, 18, sr),
            hs = biquad("bp", 2600, 0.5, sr);
          const sw = slowNoise(r, 14, 7),
            pf = slowNoise(r, 14, 5),
            am = slowNoise(r, 14, 9);
          for (let i = 0; i < n; i++) {
            const t = i / sr,
              x = r() * 2 - 1;
            if ((i & 63) === 0) {
              mo.set(380 + 110 * pf(t + c * 0.3), 14);
              mo2.set(560 + 150 * pf(t * 1.3 + 3), 18);
            }
            const s = 0.55 + 0.45 * sw(t + c * 0.8),
              m = Math.max(0, am(t + c * 0.5) * 0.9 + 0.1);
            a[i] =
              lp(x) * 2.4 +
              bp(x) * 0.5 * s +
              (mo(x) * 2.0 + mo2(x) * 1.2) * m +
              hs(x) * 0.015;
          }
        }
      },
    }),
  );
  /** A dead building: structure-borne rumble, a hollow air shaft somewhere, no power (no mains hum). */
  D(
    "amb_int_building",
    Object.assign({}, BED, {
      dur: 10,
      gen(d, sr, r, n) {
        for (let c = 0; c < 2; c++) {
          const a = d[c],
            lp = biquad("lp", 55, 0.7, sr),
            duct = biquad("bp", 118 + c * 9, 2.5, sr),
            air = biquad("bp", 320, 1.1, sr),
            mid = biquad("bp", 800, 0.7, sr);
          const s1 = slowNoise(r, 10, 5),
            s2 = slowNoise(r, 10, 7);
          for (let i = 0; i < n; i++) {
            const t = i / sr,
              x = r() * 2 - 1;
            a[i] =
              lp(x) * 3.2 * (0.8 + 0.2 * s1(t)) +
              duct(x) * 0.55 * (0.6 + 0.4 * s2(t + c)) +
              air(x) * 0.18 * Math.max(0, s2(t * 2 + 1) * 0.6 + 0.4) +
              mid(x) * 0.035;
          }
        }
      },
    }),
  );
  /** Fluorescent tubes still on emergency power: 120 Hz ballast hum, strike buzz, a couple of tubes flickering. */
  D(
    "amb_int_fluoro",
    Object.assign({}, BED, {
      dur: 8,
      gain: 0.35,
      gen(d, sr, r, n) {
        for (let c = 0; c < 2; c++) {
          const a = d[c],
            bp = biquad("bp", 2400 + c * 500, 0.9, sr),
            lp = biquad("lp", 5000, 0.7, sr);
          // flicker pattern: 1–3 bursts per loop where the tube stutters on/off
          const gate = new Float32Array(n).fill(1);
          const bursts = 1 + ((r() * 3) | 0);
          for (let b = 0; b < bursts; b++) {
            let i = Math.floor(r() * n * 0.8);
            const end = Math.min(n, i + Math.floor(sr * (0.3 + r() * 0.9)));
            while (i < end) {
              const on = r() < 0.45,
                len = Math.floor(sr * (0.02 + r() * 0.1));
              for (let j = i; j < Math.min(end, i + len); j++)
                gate[j] = on ? 0.9 : 0.05;
              i += len;
            }
          }
          let prevOn = 0,
            g = 1,
            ph = r() * 6.28;
          for (let i = 0; i < n; i++) {
            const t = i / sr,
              s = Math.sin(2 * Math.PI * 60 * t + ph);
            const on = Math.abs(s) > 0.3 ? (s > 0 ? 1 : -1) : 0,
              edge = on - prevOn;
            prevOn = on;
            g += (gate[i] - g) * 0.02;
            const hum =
              Math.sin(2 * Math.PI * 120 * t + ph) * 0.5 +
              Math.sin(2 * Math.PI * 240 * t + ph * 2) * 0.16 +
              Math.sin(2 * Math.PI * 360 * t) * 0.05;
            a[i] = lp(
              hum * 0.5 * (0.4 + 0.6 * g) +
                bp(edge) * 0.9 * g +
                (r() * 2 - 1) * 0.006,
            );
          }
        }
      },
    }),
  );
  /** Inside a steel hull: waves thudding against the plating, the hull's low boom, sloshing, a trickle. */
  D(
    "amb_int_hull",
    Object.assign({}, BED, {
      dur: 12,
      gen(d, sr, r, n) {
        for (let c = 0; c < 2; c++) {
          const a = d[c],
            lp = biquad("lp", 160, 0.7, sr),
            b1 = biquad("bp", 62 + c * 4, 5, sr),
            b2 = biquad("bp", 131, 6, sr),
            sl = biquad("bp", 420, 1.2, sr),
            sll = biquad("lp", 700, 0.7, sr),
            tr = biquad("bp", 1800, 4, sr);
          const rates = [2 / 12, 3 / 12, 5 / 12],
            ph = rates.map(() => r()),
            sn = slowNoise(r, 12, 6);
          for (let i = 0; i < n; i++) {
            const t = i / sr,
              x = r() * 2 - 1;
            let env = 0;
            for (let k = 0; k < 3; k++)
              env += Math.pow(
                Math.max(
                  0,
                  Math.sin(2 * Math.PI * (rates[k] * t + ph[k] + c * 0.13)),
                ),
                8,
              );
            const ex = x * env;
            a[i] =
              lp(ex) * 2.2 +
              b1(ex) * 6 +
              b2(ex) * 3 +
              sll(sl(x)) * 0.5 * env * env +
              tr(x) * 0.12 * (0.5 + 0.5 * sn(t)) +
              lp(x * 0.3) * 0.4;
          }
        }
      },
    }),
  );
  /** A machine room still turning over: generator drone with beating, fan blade whir, a steady mechanical tick. */
