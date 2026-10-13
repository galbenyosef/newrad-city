// play-inline-29 01 — math
// Lines 21-160 of readable/play-inline-29.pretty.js (statement-aligned).
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
