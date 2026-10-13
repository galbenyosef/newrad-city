/* src/sound/20_instruments.js */
/* =====================================================================
 * NEW RAD CITY — SOUND MODULE · 20_instruments.js
 * The procedural "band": instruments used by the adaptive score and by
 * the goggle radio stations.
 *
 *  SAMPLED (generated once in JS, time-sliced, then pitch-shifted):
 *    piano (additive, inharmonic, two detuned strings + hammer),
 *    upright bass & guitar & pizzicato (Karplus–Strong with all-pass
 *    tuning), vibraphone (motor tremolo), drum kit (brushes, ride, hats,
 *    kick, snare, toms, march snare & bass drum, crash, taiko, timpani,
 *    anvil, bongos, claves, maracas).
 *  LIVE (oscillator voices scheduled ahead of time):
 *    clarinet, muted trumpet, trumpet, sax, "crooner" hum (formant
 *    vocal), flute/piccolo, harmonica reed, cello, duduk, string section,
 *    brass section, tuba, organ, pad, drone, bowed metal.
 *  RADIO CHAIN: AM band-limit + tube saturation + wow/flutter + vinyl
 *    crackle & hiss.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const S = G._snd;
  const mtof = S.mtof;
  const I = (S.inst = { samples: {}, ready: {}, pending: {} });
  const SR = 32000;

  // ------------------------------------------------------------------
  // Sample generators
  // ------------------------------------------------------------------
  /** Karplus–Strong plucked string with fractional-delay tuning. */
  function ks(f, dur, o, r) {
    const n = Math.floor(SR * dur),
      out = new Float32Array(n);
    const P = SR / f;
    const N = Math.max(2, Math.floor(P - 0.5)),
      frac = P - 0.5 - N;
    const C = (1 - frac) / (1 + frac);
    const buf = new Float32Array(N);
    let lp = 0;
    const br = o.bright === undefined ? 0.5 : o.bright;
    for (let i = 0; i < N; i++) {
      const x = r() * 2 - 1;
      lp += (x - lp) * (0.08 + 0.9 * br);
      buf[i] = lp;
    }
    // pluck position comb (removes some harmonics → more woody)
    if (o.pos) {
      const d = Math.max(1, Math.floor(N * o.pos));
      const cp = buf.slice();
      for (let i = 0; i < N; i++) buf[i] = cp[i] - cp[(i + d) % N] * 0.8;
    }
    const loss = Math.pow(0.001, 1 / (f * (o.decay || 3)));
    let idx = 0,
      prev = 0,
      apX = 0,
      apY = 0,
      olp = 0;
    const damp = o.damp === undefined ? 0.5 : o.damp; // 0.5 = classic averaging
    for (let i = 0; i < n; i++) {
      const cur = buf[idx];
      const avg = (cur * (1 - damp) + prev * damp) * loss;
      prev = cur;
      const y = C * avg + apX - C * apY;
      apX = avg;
      apY = y;
      buf[idx] = y;
      idx++;
      if (idx >= N) idx = 0;
      olp += (cur - olp) * (o.outLp || 1);
      out[i] = olp;
    }
    // attack thump / finger noise
    if (o.thump)
      for (let i = 0; i < Math.min(n, SR * 0.03); i++)
        out[i] +=
          (r() * 2 - 1) * o.thump * Math.exp(-i / (SR * 0.004)) +
          Math.sin((2 * Math.PI * f * 0.5 * i) / SR) *
            o.thump *
            0.5 *
            Math.exp(-i / (SR * 0.02));
    fadeTail(out, 0.05);
    return out;
  }
  /** Additive piano tone. */
  function piano(f, dur, r) {
    const n = Math.floor(SR * dur),
      out = new Float32Array(n);
    const B = 0.00025 + (f > 500 ? 0.0006 : 0); // inharmonicity
    const t60 = Math.max(1.4, 7.5 - Math.log2(f / 55) * 1.25); // lower notes ring longer
    const nP = Math.min(18, Math.floor((SR * 0.45) / f));
    for (let p = 1; p <= nP; p++) {
      const fp = f * p * Math.sqrt(1 + B * p * p);
      if (fp > SR * 0.45) break;
      const amp =
        (1 / Math.pow(p, 1.05)) * Math.abs(Math.sin(Math.PI * p * 0.13)) * 1.8;
      const decay = Math.pow(0.001, 1 / ((SR * t60) / (1 + (p - 1) * 0.45)));
      for (let s = 0; s < 2; s++) {
        // two slightly detuned strings → beating
        const w = (2 * Math.PI * fp * (1 + (s ? 0.0006 : -0.0004))) / SR,
          c2 = 2 * Math.cos(w);
        let y1 = Math.sin(-w + r() * 0.01),
          y2 = Math.sin(-2 * w),
          env = amp * 0.5;
        // "double decay": fast initial drop then slower sustain (prompt + aftersound)
        const fast = Math.pow(0.001, 1 / (SR * 0.9)),
          mix = 0.55;
        let envF = 1;
        for (let i = 0; i < n; i++) {
          const y = c2 * y1 - y2;
          y2 = y1;
          y1 = y;
          out[i] += y * env * (mix * envF + (1 - mix));
          env *= decay;
          envF *= fast;
          if (env < 1e-5) break;
        }
      }
    }
    // hammer thump + key noise
    let lp = 0;
    for (let i = 0; i < Math.min(n, SR * 0.04); i++) {
      lp += (r() * 2 - 1 - lp) * 0.25;
      out[i] += lp * 0.35 * Math.exp(-i / (SR * 0.006));
    }
    fadeTail(out, 0.08);
    return out;
  }
  function vibes(f, dur, r) {
    const n = Math.floor(SR * dur),
      out = new Float32Array(n);
    const parts = [
      [1, 1, 3.5],
      [4, 0.28, 0.8],
      [10.0, 0.06, 0.25],
    ];
    for (const p of parts) {
      const w = (2 * Math.PI * f * p[0]) / SR;
      if (f * p[0] > SR * 0.45) continue;
      const dec = Math.pow(0.001, 1 / (SR * p[2]));
      let env = p[1],
        ph = r() * 6;
      for (let i = 0; i < n; i++) {
        out[i] += Math.sin(ph + w * i) * env;
        env *= dec;
      }
    }
    for (let i = 0; i < n; i++)
      out[i] *= 0.75 + 0.25 * Math.sin((2 * Math.PI * 5.2 * i) / SR); // motor tremolo
    for (let i = 0; i < Math.min(n, 200); i++)
      out[i] += (r() * 2 - 1) * 0.2 * Math.exp(-i / 30); // mallet
    fadeTail(out, 0.1);
    return out;
  }
  function fadeTail(a, sec) {
    const f = Math.min(a.length, Math.floor(SR * sec));
    for (let i = 0; i < f; i++) a[a.length - 1 - i] *= i / f;
  }

  /** Drum / percussion one-shots. */
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
  I.ensure = function (name) {
    if (I.ready[name] || I.pending[name]) return !!I.ready[name];
    I.pending[name] = true;
    if (SETS[name]) {
      const set = SETS[name];
      Promise.all(
        set.roots.map((m) =>
          genSample(set.expr, m, G.util.hashStr(name) + m, set.sr).then(
            (buf) => ({ midi: m, buf, loop: set.loop || null }),
          ),
        ),
      )
        .then((arr) => {
          I.samples[name] = arr.sort((a, b) => a.midi - b.midi);
          I.ready[name] = true;
        })
        .catch((e) => {
          I.pending[name] = false;
          G.reportError("sound:inst:" + name, e);
        });
    } else if (name === "drums") {
      Promise.all(
        DRUMS.map((d) =>
          genSample("drum('" + d + "', r)", 0, G.util.hashStr(d)).then(
            (buf) => [d, buf],
          ),
        ),
      )
        .then((arr) => {
          const o = {};
          arr.forEach((x) => (o[x[0]] = x[1]));
          I.samples.drums = o;
          I.ready.drums = true;
        })
        .catch((e) => {
          I.pending[name] = false;
          G.reportError("sound:inst:drums", e);
        });
    }
    return false;
  };
  /**
   * Register a sampled instrument set: {roots:[midi], expr:'fn(mtof(m), …, r)', sr?, loop?:[startSec, endSec]}.
   * `libs` = the generator functions (shipped to the worker, and kept for the main-thread fallback).
   */
  I.defineSet = function (name, set, libs) {
    SETS[name] = set;
    if (libs) {
      S.workerLib.apply(null, libs);
      libs.forEach((f) => {
        I.fallbackLibs[f.name] = f;
      });
    }
  };
  I.ensureAll = function () {
    ["drums", "bass", "piano", "guitar", "vibes", "pizz"].forEach(I.ensure);
  };
  I.allReady = function (names) {
    return names.every((n) => I.ready[n]);
  };

  /** Play a sampled pitched note. */
  I.sample = function (ctx, dest, name, midi, t, dur, vel, o) {
    const set = I.samples[name];
    if (!I.ready[name] || !set || !set.length) return null;
    let best = set[0];
    for (const s of set)
      if (Math.abs(s.midi - midi) < Math.abs(best.midi - midi)) best = s;
    const src = ctx.createBufferSource();
    src.buffer = best.buf;
    src.playbackRate.value = Math.pow(2, (midi - best.midi) / 12);
    if (o && o.detune) src.detune.value = o.detune;
    const g = ctx.createGain();
    const rel =
      (o && o.release) ||
      (name === "piano" ? 0.35 : name === "bass" ? 0.12 : 0.4);
    g.gain.setValueAtTime(vel, t);
    if (dur !== undefined && dur !== null) {
      g.gain.setValueAtTime(vel, t + dur);
      g.gain.setTargetAtTime(0, t + dur, rel / 3);
    }
    src.connect(g);
    g.connect(dest);
    src.start(t);
    src.stop(
      t +
        Math.min(
          best.buf.duration / src.playbackRate.value,
          (dur || 10) + rel * 2,
        ) +
        0.05,
    );
    src.onended = () => {
      try {
        g.disconnect();
      } catch (e) {
        /* */
      }
    };
    return g;
  };
  /** Play a drum hit. */
  I.drum = function (ctx, dest, name, t, vel, rate) {
    if (!I.ready.drums) return;
    const b = I.samples.drums[name];
    if (!b) return;
    const src = ctx.createBufferSource();
    src.buffer = b;
    if (rate) src.playbackRate.value = rate;
    const g = ctx.createGain();
    g.gain.value = vel;
    src.connect(g);
    g.connect(dest);
    src.start(t);
    src.onended = () => {
      try {
        g.disconnect();
      } catch (e) {
        /* */
      }
    };
  };
  /** Timpani is pitched: sample at MIDI 41. */
  I.timpani = function (ctx, dest, midi, t, vel) {
    I.drum(ctx, dest, "timpani", t, vel, Math.pow(2, (midi - 41) / 12));
  };

  // ------------------------------------------------------------------
  // Live synthesised voices
  // ------------------------------------------------------------------
  function vibrato(ctx, t, dur, osc, f, rate, depth, delay) {
    const lfo = ctx.createOscillator();
    lfo.frequency.value = rate;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.setValueAtTime(0, t + delay);
    g.gain.linearRampToValueAtTime(f * depth, t + delay + 0.3);
    lfo.connect(g);
    (Array.isArray(osc) ? osc : [osc]).forEach((o) => g.connect(o.frequency));
    lfo.start(t);
    lfo.stop(t + dur + 1);
  }
  function ampEnv(ctx, t, dur, vel, att, rel) {
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vel, t + att);
    g.gain.setValueAtTime(vel, t + Math.max(att, dur));
    g.gain.setTargetAtTime(0, t + Math.max(att, dur), rel / 3);
    return g;
  }
  function oscW(ctx, wave, f, t, end) {
    const o = ctx.createOscillator();
    if (["sine", "square", "sawtooth", "triangle"].includes(wave))
      o.type = wave;
    else o.setPeriodicWave(S.wave(ctx, wave));
    o.frequency.value = f;
    o.start(t);
    o.stop(end);
    return o;
  }
  function bq(ctx, type, f, q, gain) {
    const b = ctx.createBiquadFilter();
    b.type = type;
    b.frequency.value = f;
    b.Q.value = q || 0.7;
    if (gain !== undefined) b.gain.value = gain;
    return b;
  }

  /**
   * I.synth(ctx, dest, kind, midi, t, dur, vel, opts) — schedule one live note. opts: {vowel, bright, glide}
   */
  I.synth = function (ctx, dest, kind, midi, t, dur, vel, o) {
    o = o || {};
    const f = mtof(midi);
    let rel = 0.15,
      att = 0.03;
    const end = () => t + dur + rel * 3 + 0.1;
    let out;
    switch (kind) {
      case "clarinet": {
        att = 0.04;
        rel = 0.12;
        const os = oscW(ctx, "clarinet", f, t, end());
        vibrato(ctx, t, dur, os, f, 5, 0.004, 0.3);
        const lp = bq(ctx, "lowpass", Math.min(5000, f * 5), 0.7);
        out = ampEnv(ctx, t, dur, vel, att, rel);
        os.connect(lp);
        lp.connect(out);
        break;
      }
      case "mute":
      case "trumpet":
      case "tuba": {
        att = kind === "tuba" ? 0.05 : 0.03;
        rel = 0.1;
        const os = oscW(ctx, kind === "mute" ? "mute" : "trumpet", f, t, end());
        // jazz scoop into the note
        if (o.scoop !== false && kind !== "tuba") {
          os.frequency.setValueAtTime(f * 0.97, t);
          os.frequency.linearRampToValueAtTime(f, t + 0.06);
        }
        vibrato(ctx, t, dur, os, f, 5.6, 0.005, 0.35);
        const lp = bq(ctx, "lowpass", 600, 1.2);
        const top = kind === "tuba" ? 900 : kind === "mute" ? 2600 : 3800;
        lp.frequency.setValueAtTime(top * 0.3, t);
        lp.frequency.linearRampToValueAtTime(top * (0.6 + 0.4 * vel), t + 0.05);
        lp.frequency.setTargetAtTime(top * 0.55, t + 0.1, 0.3);
        let last = lp;
        os.connect(lp);
        if (kind === "mute") {
          const pk = bq(ctx, "peaking", 1600, 2, 9);
          lp.connect(pk);
          last = pk;
        }
        out = ampEnv(ctx, t, dur, vel, att, rel);
        last.connect(out);
        break;
      }
      case "sax": {
        att = 0.05;
        rel = 0.12;
        const os = oscW(ctx, "sax", f, t, end());
        os.frequency.setValueAtTime(f * 0.96, t);
        os.frequency.linearRampToValueAtTime(f, t + 0.08);
        vibrato(ctx, t, dur, os, f, 5, 0.006, 0.25);
        const lp = bq(ctx, "lowpass", 2400, 0.8),
          pk = bq(ctx, "peaking", 1100, 1.5, 5);
        out = ampEnv(ctx, t, dur, vel, att, rel);
        os.connect(lp);
        lp.connect(pk);
        pk.connect(out);
        // breath
        const n = ctx.createBufferSource();
        n.buffer = S.noiseBufs.white;
        n.loop = true;
        n.start(t, Math.random() * 2);
        n.stop(end());
        const nb = bq(ctx, "bandpass", f * 3, 2),
          ng = ctx.createGain();
        ng.gain.value = 0.06;
        n.connect(nb);
        nb.connect(ng);
        ng.connect(out);
        break;
      }
      case "croon": {
        // wordless crooner "ooh/aah" — glottal source + formant bank
        att = 0.12;
        rel = 0.3;
        const os = oscW(ctx, "glottal", f, t, end());
        vibrato(ctx, t, dur, os, f, 5.4, 0.009, 0.2);
        const v = S.VOWELS[o.vowel || "oo"];
        const mix = ctx.createGain();
        mix.gain.value = 1;
        [0, 1, 2].forEach((k) => {
          const bp = bq(ctx, "bandpass", v[k] * 1.08, v[k] / [70, 90, 130][k]);
          const g = ctx.createGain();
          g.gain.value = [1.2, 0.7, 0.3][k];
          os.connect(bp);
          bp.connect(g);
          g.connect(mix);
        });
        out = ampEnv(ctx, t, dur, vel * 1.4, att, rel);
        mix.connect(out);
        break;
      }
      case "flute":
      case "piccolo": {
        att = 0.05;
        rel = 0.1;
        const os = oscW(ctx, "flute", f, t, end());
        vibrato(ctx, t, dur, os, f, 5.2, 0.005, 0.2);
        out = ampEnv(ctx, t, dur, vel, att, rel);
        os.connect(out);
        const n = ctx.createBufferSource();
        n.buffer = S.noiseBufs.white;
        n.loop = true;
        n.start(t, Math.random() * 2);
        n.stop(end());
        const nb = bq(ctx, "bandpass", f * 2, 4),
          ng = ctx.createGain();
        ng.gain.value = 0.08;
        n.connect(nb);
        nb.connect(ng);
        ng.connect(out);
        break;
      }
      case "reed": {
        // harmonica / accordion
        att = 0.04;
        rel = 0.12;
        const os = oscW(ctx, "reed", f, t, end()),
          os2 = oscW(ctx, "reed", f, t, end());
        os2.detune.value = 12;
        const bp = bq(ctx, "bandpass", 1400, 0.5);
        out = ampEnv(ctx, t, dur, vel * 0.7, att, rel);
        os.connect(bp);
        os2.connect(bp);
        bp.connect(out);
        const trem = ctx.createOscillator();
        trem.frequency.value = 5.5;
        const tg = ctx.createGain();
        tg.gain.value = vel * 0.15;
        trem.connect(tg);
        tg.connect(out.gain);
        trem.start(t);
        trem.stop(end());
        break;
      }
      case "cello":
      case "duduk": {
        att = kind === "duduk" ? 0.12 : 0.18;
        rel = 0.5;
        const os = oscW(ctx, kind === "duduk" ? "reed" : "cello", f, t, end());
        if (o.glide) {
          os.frequency.setValueAtTime(mtof(o.glide), t);
          os.frequency.exponentialRampToValueAtTime(f, t + 0.12);
        }
        vibrato(ctx, t, dur, os, f, kind === "duduk" ? 4.8 : 5.2, 0.007, 0.35);
        const lp = bq(ctx, "lowpass", kind === "duduk" ? 1500 : 2200, 0.8);
        let last = lp;
        os.connect(lp);
        if (kind === "duduk") {
          const pk = bq(ctx, "peaking", 600, 2, 6);
          lp.connect(pk);
          last = pk;
        }
        out = ampEnv(ctx, t, dur, vel, att, rel);
        last.connect(out);
        break;
      }
      case "strings": {
        att = o.att || 0.25;
        rel = o.rel || 0.7;
        const lp = bq(ctx, "lowpass", o.bright || 2600, 0.6);
        const oss = [-11, 0, 9].map((d) => {
          const x = oscW(ctx, "sawtooth", f, t, end());
          x.detune.value = d + (Math.random() - 0.5) * 4;
          x.connect(lp);
          return x;
        });
        vibrato(ctx, t, dur, oss, f, 5.3, 0.004, 0.3);
        out = ampEnv(ctx, t, dur, vel * 0.4, att, rel);
        lp.connect(out);
        break;
      }
      case "brass": {
        att = 0.04;
        rel = 0.18;
        const lp = bq(ctx, "lowpass", 500, 1.4);
        const top = o.bright || 2800;
        lp.frequency.setValueAtTime(350, t);
        lp.frequency.linearRampToValueAtTime(top, t + 0.06);
        lp.frequency.setTargetAtTime(top * 0.5, t + 0.08, 0.25);
        [-7, 0, 8].forEach((d) => {
          const x = oscW(ctx, "sawtooth", f, t, end());
          x.detune.value = d;
          x.connect(lp);
        });
        out = ampEnv(ctx, t, dur, vel * 0.45, att, rel);
        lp.connect(out);
        break;
      }
      case "organ": {
        att = 0.01;
        rel = 0.08;
        const os = oscW(ctx, "organ", f, t, end());
        out = ampEnv(ctx, t, dur, vel * 0.6, att, rel);
        os.connect(out);
        const trem = ctx.createOscillator();
        trem.frequency.value = 6.3;
        const tg = ctx.createGain();
        tg.gain.value = vel * 0.1;
        trem.connect(tg);
        tg.connect(out.gain);
        trem.start(t);
        trem.stop(end());
        break;
      }
      case "pad": {
        att = o.att || 1.6;
        rel = o.rel || 2.5;
        const lp = bq(ctx, "lowpass", o.bright || 900, 0.8);
        const lfo = ctx.createOscillator();
        lfo.frequency.value = 0.08 + Math.random() * 0.1;
        const lg = ctx.createGain();
        lg.gain.value = (o.bright || 900) * 0.35;
        lfo.connect(lg);
        lg.connect(lp.frequency);
        lfo.start(t);
        lfo.stop(end());
        [
          ["sawtooth", -8],
          ["sawtooth", 7],
          ["triangle", 1200],
        ].forEach((w) => {
          const x = oscW(ctx, w[0], f, t, end());
          x.detune.value = w[1];
          x.connect(lp);
        });
        out = ampEnv(ctx, t, dur, vel * 0.3, att, rel);
        lp.connect(out);
        break;
      }
      case "drone": {
        att = o.att || 2;
        rel = o.rel || 3;
        const lp = bq(ctx, "lowpass", o.bright || 320, 1.1);
        [
          ["sawtooth", -5],
          ["sawtooth", 6],
          ["sine", 0],
        ].forEach((w, i) => {
          const x = oscW(ctx, w[0], i === 2 ? f / 2 : f, t, end());
          x.detune.value = w[1];
          x.connect(lp);
        });
        out = ampEnv(ctx, t, dur, vel * 0.5, att, rel);
        lp.connect(out);
        break;
      }
      case "bowedmetal": {
        att = o.att || 1.2;
        rel = o.rel || 2;
        const n = ctx.createBufferSource();
        n.buffer = S.noiseBufs.pink;
        n.loop = true;
        n.start(t, Math.random() * 2);
        n.stop(end());
        out = ampEnv(ctx, t, dur, vel, att, rel);
        [1, 2.76, 5.4, 8.93].forEach((m, i) => {
          const b = bq(ctx, "bandpass", f * m, 120);
          const g = ctx.createGain();
          g.gain.value = 3 / (i + 1);
          n.connect(b);
          b.connect(g);
          g.connect(out);
        });
        break;
      }
      default: {
        // simple sine
        const os = oscW(ctx, "sine", f, t, end());
        out = ampEnv(ctx, t, dur, vel, att, rel);
        os.connect(out);
      }
    }
    out.connect(dest);
    setTimeout(
      () => {
        try {
          out.disconnect();
        } catch (e) {
          /* */
        }
      },
      Math.max(0, (end() - ctx.currentTime) * 1000 + 200),
    );
    return out;
  };

  // ------------------------------------------------------------------
  // Vintage radio / phonograph chain
  // ------------------------------------------------------------------
  /**
   * Build an AM-radio / 78rpm chain on ctx. Returns {input, output, setStatic(v), crackle(v), dispose()}.
   * input → HP 230 → LP 3600 → presence → tube saturation → wow/flutter delay → output; + crackle + hiss + static.
   */
  I.radioChain = function (ctx, dest, o) {
    o = o || {};
    const input = ctx.createGain();
    const hp = bq(ctx, "highpass", o.hp || 230, 0.8),
      lp = bq(ctx, "lowpass", o.lp || 3600, 1.1),
      lp2 = bq(ctx, "lowpass", (o.lp || 3600) * 1.3, 0.7);
    const pres = bq(ctx, "peaking", 1400, 1.2, 4);
    const sh = ctx.createWaveShaper();
    sh.curve = S.curve(1.2, "tube");
    sh.oversample = "2x";
    const pre = ctx.createGain();
    pre.gain.value = 0.9;
    const wow = ctx.createDelay(0.1);
    wow.delayTime.value = 0.012;
    const wl = ctx.createOscillator();
    wl.frequency.value = 0.55;
    const wg = ctx.createGain();
    wg.gain.value = 0.0009;
    const fl = ctx.createOscillator();
    fl.frequency.value = 7.3;
    const fg = ctx.createGain();
    fg.gain.value = 0.00012;
    wl.connect(wg);
    wg.connect(wow.delayTime);
    fl.connect(fg);
    fg.connect(wow.delayTime);
    wl.start();
    fl.start();
    const output = ctx.createGain();
    output.gain.value = o.out === undefined ? 0.62 : o.out;
    // broadcast limiter (1940s stations rode everything hard) + DC blocker after the asymmetric tube stage
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -22;
    comp.knee.value = 8;
    comp.ratio.value = 4;
    comp.attack.value = 0.008;
    comp.release.value = 0.25;
    const mk = ctx.createGain();
    mk.gain.value = 1.1;
    const dcb = bq(ctx, "highpass", 35, 0.7);
    // word-exact signal dropouts (VOX): a duck on the programme + a burst of the static, automated on the audio clock
    const duck = ctx.createGain();
    input.connect(duck);
    duck.connect(hp);
    hp.connect(lp);
    lp.connect(lp2);
    lp2.connect(comp);
    comp.connect(mk);
    mk.connect(pres);
    pres.connect(pre);
    pre.connect(sh);
    sh.connect(dcb);
    dcb.connect(wow);
    wow.connect(output);
    // vinyl crackle + hiss
    const cr = ctx.createBufferSource();
    cr.buffer = S.noiseBufs.crackle;
    cr.loop = true;
    cr.playbackRate.value = 0.7;
    const crf = bq(ctx, "highpass", 900, 0.7),
      crg = ctx.createGain();
    crg.gain.value = o.crackle === undefined ? 0.35 : o.crackle;
    cr.connect(crf);
    crf.connect(crg);
    crg.connect(output);
    cr.start(0, Math.random() * 2);
    const hs = ctx.createBufferSource();
    hs.buffer = S.noiseBufs.pink;
    hs.loop = true;
    const hsf = bq(ctx, "bandpass", 2400, 0.5),
      hsg = ctx.createGain();
    hsg.gain.value = o.hiss === undefined ? 0.012 : o.hiss;
    hs.connect(hsf);
    hsf.connect(hsg);
    hsg.connect(output);
    hs.start(0, Math.random() * 2);
    // tunable static (signal strength)
    const st = ctx.createBufferSource();
    st.buffer = S.noiseBufs.white;
    st.loop = true;
    const stf = bq(ctx, "bandpass", 1800, 0.6),
      stg = ctx.createGain();
    stg.gain.value = 0;
    const stAm = ctx.createOscillator();
    stAm.frequency.value = 0.37;
    const stAmG = ctx.createGain();
    stAmG.gain.value = 0;
    stAm.connect(stAmG);
    stAmG.connect(stg.gain);
    stAm.start();
    st.connect(stf);
    stf.connect(stg);
    stg.connect(output);
    st.start(0, Math.random() * 2);
    const dropG = ctx.createGain();
    dropG.gain.value = 0;
    stf.connect(dropG);
    dropG.connect(output);
    const hold = (prm, t) => {
      if (prm.cancelAndHoldAtTime) prm.cancelAndHoldAtTime(t);
      else {
        prm.cancelScheduledValues(t);
        prm.setValueAtTime(prm.value, t);
      }
    };
    // speech bed: while the DJ talks (speechSynthesis can't be routed into WebAudio) a faint studio room tone +
    // mains hum runs through the same AM chain, so the voice sits "inside" the radio instead of on top of it.
    const rt = ctx.createBufferSource();
    rt.buffer = S.noiseBufs.brown;
    rt.loop = true;
    const rtf = bq(ctx, "lowpass", 700, 0.7),
      rtg = ctx.createGain();
    rtg.gain.value = 0;
    const hum = ctx.createOscillator();
    hum.frequency.value = 120;
    const humg = ctx.createGain();
    humg.gain.value = 0;
    const hum2 = ctx.createOscillator();
    hum2.frequency.value = 180;
    hum2.connect(humg);
    rt.connect(rtf);
    rtf.connect(rtg);
    rtg.connect(input);
    hum.connect(humg);
    humg.connect(input);
    rt.start(0, Math.random() * 2);
    hum.start();
    hum2.start();
    output.connect(dest);
    return {
      input,
      output,
      speechBed(v) {
        const t = ctx.currentTime;
        rtg.gain.setTargetAtTime(v * 0.09, t, v ? 0.15 : 0.4);
        humg.gain.setTargetAtTime(v * 0.012, t, v ? 0.15 : 0.4);
      },
      setStatic(v, tau) {
        const t = ctx.currentTime,
          k = tau || 0.3;
        stg.gain.setTargetAtTime(v * 0.18, t, k);
        stAmG.gain.setTargetAtTime(v * 0.1, t, k);
        input.gain.setTargetAtTime(1 - v * 0.5, t, k);
      },
      crackle(v) {
        crg.gain.setTargetAtTime(v, ctx.currentTime, 0.2);
      },
      /** Static bursts over exact ctx-time spans [{t0, t1}] (the words lost to a weak signal); level 0..1. */
      scheduleDrops(spans, level) {
        const now = ctx.currentTime;
        for (const d of spans) {
          const a = Math.max(now, d.t0 - 0.03),
            b = Math.max(a + 0.04, d.t1 + 0.03);
          dropG.gain.setTargetAtTime(level * 0.2, a, 0.008);
          dropG.gain.setTargetAtTime(0, b, 0.04);
          duck.gain.setTargetAtTime(0.45, a, 0.008);
          duck.gain.setTargetAtTime(1, b, 0.05);
        }
      },
      /** Cancel pending dropouts (the line was stopped). */
      clearDrops(fade) {
        const t = ctx.currentTime,
          f = fade || 0.1;
        try {
          hold(dropG.gain, t);
          hold(duck.gain, t);
          dropG.gain.setTargetAtTime(0, t, f / 3);
          duck.gain.setTargetAtTime(1, t, f / 3);
        } catch (e) {
          /* */
        }
      },
      dispose() {
        [wl, fl, cr, hs, st, stAm, rt, hum, hum2].forEach((s) => {
          try {
            s.stop();
          } catch (e) {
            /* */
          }
        });
        try {
          output.disconnect();
        } catch (e) {
          /* */
        }
      },
    };
  };
})();
