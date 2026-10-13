// play-inline-29 02 — math
// Lines 161-492 of readable/play-inline-29.pretty.js (statement-aligned).
  function drum(kind, r) {
    const bq = S.biquad;
    const mk = (sec) => new Float32Array(Math.floor(SR * sec));
    let a;
    const noise = () => r() * 2 - 1;
    switch (kind) {
      case "kick": {
        a = mk(0.5);
        let ph = 0;
        for (let i = 0; i < a.length; i++) {
          const t = i / SR,
            f = 50 + 60 * Math.exp(-t * 30);
          ph += f / SR;
          a[i] =
            Math.sin(2 * Math.PI * ph) * Math.exp(-t * 9) +
            (i < 60 ? noise() * 0.3 : 0);
        }
        break;
      }
      case "brush_tap": {
        a = mk(0.25);
        const f = bq("bp", 2600, 0.8, SR);
        for (let i = 0; i < a.length; i++) {
          const t = i / SR;
          a[i] =
            f(noise()) * Math.exp(-t * 28) * 1.4 +
            Math.sin(2 * Math.PI * 190 * t) * Math.exp(-t * 40) * 0.3;
        }
        break;
      }
      case "brush_swish": {
        a = mk(0.45);
        const f = bq("bp", 3800, 0.9, SR);
        for (let i = 0; i < a.length; i++) {
          const t = i / SR;
          const env =
            Math.sin(Math.PI * Math.min(1, t / 0.42)) *
            (0.6 + 0.4 * Math.sin(t * 40));
          a[i] = f(noise()) * env * 0.7;
        }
        break;
      }
      case "ride":
      case "hat":
      case "crash":
      case "hat_open": {
        const len =
          kind === "ride"
            ? 2.2
            : kind === "crash"
              ? 2.8
              : kind === "hat_open"
                ? 0.45
                : 0.08;
        a = mk(len);
        const fs = [205.3, 304.4, 369.6, 522.7, 540, 800].map(
          (x) => x * (kind === "ride" ? 1.6 : 2.1),
        );
        const ph = fs.map(() => r());
        const hp = bq("hp", kind === "ride" ? 5000 : 7000, 0.7, SR),
          bp = bq("bp", kind === "ride" ? 8500 : 10000, 0.9, SR);
        const dec =
          kind === "ride"
            ? 2.2
            : kind === "crash"
              ? 1.6
              : kind === "hat_open"
                ? 9
                : 55;
        for (let i = 0; i < a.length; i++) {
          const t = i / SR;
          let m = 0;
          for (let k = 0; k < 6; k++) {
            ph[k] += fs[k] / SR;
            m += ph[k] % 1 < 0.5 ? 1 : -1;
          }
          const x = m / 6 + (kind === "crash" ? noise() * 0.6 : noise() * 0.15);
          a[i] = hp(bp(x)) * Math.exp(-t * dec) * (1 + 1.5 * Math.exp(-t * 60));
          if (kind === "ride")
            a[i] += Math.sin(2 * Math.PI * 5230 * t) * 0.05 * Math.exp(-t * 3); // ping
        }
        break;
      }
      case "snare":
      case "snare_march": {
        a = mk(0.4);
        const f = bq("bp", 3200, 0.7, SR);
        const tight = kind === "snare_march" ? 18 : 14;
        for (let i = 0; i < a.length; i++) {
          const t = i / SR;
          a[i] =
            f(noise()) * Math.exp(-t * tight) * 1.3 +
            Math.sin(2 * Math.PI * 185 * t) * Math.exp(-t * 30) * 0.6 +
            Math.sin(2 * Math.PI * 330 * t) * Math.exp(-t * 40) * 0.25;
        }
        break;
      }
      case "rim": {
        a = mk(0.12);
        const f = bq("bp", 1700, 6, SR);
        for (let i = 0; i < a.length; i++) {
          const t = i / SR;
          a[i] =
            f(i < 40 ? noise() * 4 : 0) * 1 +
            Math.sin(2 * Math.PI * 820 * t) * Math.exp(-t * 60) * 0.4;
        }
        break;
      }
      case "tom_lo":
      case "tom_hi":
      case "taiko":
      case "bass_march": {
        const f0 =
          kind === "tom_hi"
            ? 180
            : kind === "tom_lo"
              ? 110
              : kind === "taiko"
                ? 62
                : 72;
        const d = kind === "taiko" ? 1.6 : kind === "bass_march" ? 1.0 : 0.6;
        a = mk(d);
        let ph = 0;
        const lp = bq("lp", kind === "taiko" ? 900 : 1500, 0.7, SR);
        for (let i = 0; i < a.length; i++) {
          const t = i / SR,
            f = f0 * (1 + 0.5 * Math.exp(-t * 25));
          ph += f / SR;
          a[i] =
            Math.sin(2 * Math.PI * ph) *
              Math.exp(-t * (kind === "taiko" ? 3 : 6)) +
            lp(noise()) * Math.exp(-t * 35) * (kind === "taiko" ? 1.2 : 0.6);
        }
        break;
      }
      case "timpani": {
        // pitched sample at F2 (MIDI 41)
        a = mk(2.2);
        const f0 = mtof(41);
        const parts = [
          [1, 1, 2.2],
          [1.5, 0.5, 1.6],
          [1.98, 0.3, 1.2],
          [2.44, 0.2, 0.9],
        ];
        const lp = bq("lp", 700, 0.7, SR);
        for (let i = 0; i < a.length; i++) {
          const t = i / SR;
          let v = 0;
          for (const p of parts)
            v +=
              Math.sin(
                2 * Math.PI * f0 * p[0] * t * (1 + 0.02 * Math.exp(-t * 20)),
              ) *
              p[1] *
              Math.exp((-t * 6.9) / p[2]);
          a[i] = v * 0.6 + lp(noise()) * Math.exp(-t * 30) * 0.5;
        }
        break;
      }
      case "anvil": {
        a = mk(1.6);
        const fs = [
          [523, 1, 1.4],
          [1340, 0.6, 1.0],
          [2217, 0.45, 0.7],
          [3673, 0.3, 0.5],
          [5120, 0.2, 0.3],
        ];
        for (let i = 0; i < a.length; i++) {
          const t = i / SR;
          let v = 0;
          for (const p of fs)
            v +=
              Math.sin(2 * Math.PI * p[0] * t) *
              p[1] *
              Math.exp((-t * 6.9) / p[2]);
          a[i] = v * 0.4 + (i < 80 ? noise() * 0.6 : 0);
        }
        break;
      }
      case "bongo_hi":
      case "bongo_lo": {
        const f0 = kind === "bongo_hi" ? 420 : 300;
        a = mk(0.25);
        for (let i = 0; i < a.length; i++) {
          const t = i / SR;
          a[i] =
            Math.sin(2 * Math.PI * f0 * (1 + 0.15 * Math.exp(-t * 60)) * t) *
              Math.exp(-t * 20) +
            (i < 50 ? noise() * 0.3 : 0);
        }
        break;
      }
      case "clave": {
        a = mk(0.2);
        for (let i = 0; i < a.length; i++) {
          const t = i / SR;
          a[i] = Math.sin(2 * Math.PI * 2500 * t) * Math.exp(-t * 35);
        }
        break;
      }
      case "maracas": {
        a = mk(0.1);
        const f = bq("hp", 5000, 0.7, SR);
        for (let i = 0; i < a.length; i++) {
          const t = i / SR;
          a[i] = f(noise()) * Math.sin(Math.PI * Math.min(1, t / 0.09)) * 0.8;
        }
        break;
      }
      case "metal_hit": {
        // combat music scrape/hit
        a = mk(1.2);
        const fs = [
          [187, 1, 1.1],
          [441, 0.7, 0.8],
          [893, 0.5, 0.5],
          [1571, 0.35, 0.35],
          [2610, 0.2, 0.25],
        ];
        const lp = bq("lp", 3000, 0.7, SR);
        for (let i = 0; i < a.length; i++) {
          const t = i / SR;
          let v = 0;
          for (const p of fs)
            v +=
              Math.sin(2 * Math.PI * p[0] * t) *
              p[1] *
              Math.exp((-t * 6.9) / p[2]);
          a[i] = v * 0.35 + lp(noise()) * Math.exp(-t * 25) * 0.8;
        }
        break;
      }
      default:
        a = mk(0.1);
    }
    fadeTail(a, 0.01);
    return a;
  }

  // ------------------------------------------------------------------
  // Instrument sample sets (multi-sampled every 6 semitones)
  // ------------------------------------------------------------------
  // `expr` is evaluated inside the generation worker (m = midi, r = rng); the same helpers are shipped there.
  const SETS = {
    piano: {
      roots: [33, 39, 45, 51, 57, 63, 69, 75, 81, 87, 93],
      expr: "piano(mtof(m), m < 50 ? 4.5 : m < 70 ? 3.5 : 2.5, r)",
    },
    bass: {
      roots: [28, 34, 40, 46, 52],
      expr: "ks(mtof(m), 2.4, { bright: 0.22, decay: 1.6, pos: 0.18, outLp: 0.35, thump: 0.25, damp: 0.55 }, r)",
    },
    guitar: {
      roots: [40, 46, 52, 58, 64, 70, 76],
      expr: "ks(mtof(m), 2.6, { bright: 0.6, decay: 2.8, pos: 0.13, outLp: 0.6, damp: 0.5 }, r)",
    },
    pizz: {
      roots: [36, 42, 48, 54, 60, 66, 72, 78],
      expr: "ks(mtof(m), 1.0, { bright: 0.35, decay: 0.5, pos: 0.25, outLp: 0.3, damp: 0.6 }, r)",
    },
    vibes: {
      roots: [53, 59, 65, 71, 77, 83, 89],
      expr: "vibes(mtof(m), 3.2, r)",
    },
  };
  S.workerLib(ks, piano, vibes, drum, fadeTail);
  /** Main-thread fallback evaluator for an instrument expression. */
  // extra generator functions registered by later files (orchestra) for the main-thread fallback
  I.fallbackLibs = {};
  function evalExpr(expr, m, r) {
    const X = I.fallbackLibs,
      names = Object.keys(X);
    return new Function(
      ...["ks", "piano", "vibes", "drum", "mtof"].concat(names, ["m", "r"]),
      "return " + expr,
    )(ks, piano, vibes, drum, mtof, ...names.map((k) => X[k]), m, r); // eslint-disable-line no-new-func
  }
  const DRUMS = [
    "kick",
    "brush_tap",
    "brush_swish",
    "ride",
    "hat",
    "hat_open",
    "crash",
    "snare",
    "snare_march",
    "rim",
    "tom_lo",
    "tom_hi",
    "taiko",
    "bass_march",
    "timpani",
    "anvil",
    "bongo_hi",
    "bongo_lo",
    "clave",
    "maracas",
    "metal_hit",
  ];

  function toBuffer(arr, sr) {
    const b = S.newBuffer(1, arr.length, sr || SR);
    // normalise peak
    let pk = 0;
    for (let i = 0; i < arr.length; i++) {
      const v = Math.abs(arr[i]);
      if (v > pk) pk = v;
    }
    const k = pk > 0 ? 0.9 / pk : 1;
    const d = b.getChannelData(0);
    for (let i = 0; i < arr.length; i++) d[i] = arr[i] * k;
    return b;
  }
  /** Queue generation of an instrument's samples (time-sliced). */
  /** Generate one instrument sample: in the worker when possible, else time-sliced on the main thread. */
  function genSample(expr, m, seed, sr) {
    const viaMain = () =>
      new Promise((resolve) =>
        S.task(() => resolve(toBuffer(evalExpr(expr, m, S.rng(seed)), sr))),
      );
    if (!S.canUseWorker()) return viaMain();
    return S.job({ type: "inst", expr, m, seed }).then((res) => {
      const a = res.chans[0],
        b = S.newBuffer(1, a.length, sr || SR);
      if (b.copyToChannel) b.copyToChannel(a, 0);
      else b.getChannelData(0).set(a);
      return b;
    }, viaMain);
  }
