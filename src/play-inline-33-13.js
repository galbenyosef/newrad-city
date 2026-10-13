// play-inline-33 13 — math
// Lines 3797-4085 of readable/play-inline-33.pretty.js (statement-aligned).
  function klattRender(m, st, f1) {
    const sr = m.sr,
      hop = m.hop,
      np = m.np,
      P = m.p;
    const off = m.off || 0; // m.p may hold a window of the timeline starting at frame `off`
    f1 = Math.min(f1, off + m.n - 1);
    const n0 = st.f;
    if (f1 <= n0) return new Float32Array(0);
    const out = new Float32Array((f1 - n0) * hop);
    const TWO_PI_T = (2 * Math.PI) / sr;
    const c = st.c;
    let seed = st.seed,
      ph = st.ph,
      T = st.T,
      amp = st.amp,
      alt = st.alt,
      tl = st.tl,
      vb = st.vb,
      dc1 = st.dc1,
      dc2 = st.dc2,
      cp = st.cp,
      ret = st.ret || 0;
    const TA = m.ta || 0; // glottal return phase (s): the closure is an exponential return, not a step (LF model)
    const PE = m.pe === undefined ? 1.6 : m.pe; // presence pre-emphasis (≈ +4 dB at 2 kHz, +7 dB at 3 kHz)
    const oq = m.oq || 0.6,
      jit = m.jitter || 0.01,
      shim = m.shimmer || 0.05,
      G0 = (m.gain || 1) * 0.068;
    // resonator coefficient helpers
    const res = (F, Bw, o) => {
      const r = Math.exp((-Math.PI * Bw) / sr);
      const C = -r * r,
        Bc = 2 * r * Math.cos(TWO_PI_T * F);
      o[0] = 1 - Bc - C;
      o[1] = Bc;
      o[2] = C;
    };
    const bpc = (F, Bw, o) => {
      const w = TWO_PI_T * Math.min(F, sr * 0.45),
        q = Math.max(0.5, F / Bw),
        al = Math.sin(w) / (2 * q),
        a0 = 1 + al;
      o[0] = al / a0;
      o[1] = (-2 * Math.cos(w)) / a0;
      o[2] = (1 - al) / a0;
    };
    const k1 = [0, 0, 0],
      k2 = [0, 0, 0],
      k3 = [0, 0, 0],
      k4 = [0, 0, 0],
      k5 = [0, 0, 0],
      knp = [0, 0, 0],
      knz = [0, 0, 0];
    const p2 = [0, 0, 0],
      p3 = [0, 0, 0],
      p4 = [0, 0, 0],
      p5 = [0, 0, 0],
      p6 = [0, 0, 0];
    res(m.f5, 250, k5);
    res(270, 100, knp);
    bpc(m.f5, 300, p5);
    bpc(m.f6, 500, p6);
    let o = 0;
    const BLK = 16;
    for (let f = n0; f < f1; f++) {
      const a = (f - off) * np,
        b = a + np;
      for (let s0 = 0; s0 < hop; s0 += BLK) {
        const u = (s0 + BLK * 0.5) / hop,
          iu = 1 - u;
        const lerp = (i) => P[a + i] * iu + P[b + i] * u;
        const F1 = lerp(iF1),
          F2 = lerp(iF2),
          F3 = lerp(iF3),
          F4 = lerp(iF4);
        res(F1, lerp(iB1), k1);
        res(F2, lerp(iB2), k2);
        res(F3, lerp(iB3), k3);
        res(F4, 250, k4);
        const fnz = lerp(iFNZ);
        res(fnz, 100, knz);
        const nzA = 1 / knz[0],
          nzB = -knz[1] / knz[0],
          nzC = -knz[2] / knz[0];
        bpc(F2, 250, p2);
        bpc(F3, 300, p3);
        bpc(F4, 350, p4);
        const f0 = P[a + iF0] * iu + P[b + iF0] * u;
        const tlt = Math.min(0.95, Math.max(0, lerp(iTL))),
          fry = lerp(iFRY);
        // louder phonation closes a little faster (brighter), soft voice slower (the "vocal effort" tilt)
        const rdec =
          TA > 0
            ? Math.exp(-1 / (TA * sr * (1.3 - 0.4 * Math.min(1, lerp(iAV)))))
            : 0;
        for (let s = 0; s < BLK; s++) {
          const w = (s0 + s) / hop,
            iw = 1 - w;
          const av = P[a + iAV] * iw + P[b + iAV] * w,
            avs = P[a + iAVS] * iw + P[b + iAVS] * w;
          const ah = P[a + iAH] * iw + P[b + iAH] * w,
            af = P[a + iAF] * iw + P[b + iAF] * w;
          // --- glottal source (flow derivative, KLGLOTT88-like)
          ph += 1 / T;
          if (ph >= 1) {
            ph -= 1;
            const jj = jit + fry * 0.12;
            T =
              (sr / Math.max(40, f0 * (1 - fry * 0.25))) *
              (1 +
                ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296 -
                  0.5) *
                  2 *
                  jj);
            amp =
              1 +
              ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296 -
                0.5) *
                2 *
                (shim + fry * 0.5);
            alt = fry > 0.05 ? (alt > 0 ? -1 : 1) : 1;
          }
          let g = 0;
          if (ph < oq) {
            const x = ph / oq;
            g = (2 * x - 3 * x * x) * amp * (alt < 0 ? 1 - fry * 0.6 : 1);
            ret = g;
          } else {
            ret *= rdec;
            g = ret;
          }
          seed = (seed * 1664525 + 1013904223) >>> 0;
          const noise = seed / 2147483648 - 1;
          // spectral tilt (one-pole low-pass on the source)
          tl = g * (1 - tlt) + tl * tlt;
          vb = tl * 0.08 + vb * 0.92; // voice bar: heavily low-passed voicing
          const asp = noise * ah * (av > 0.05 ? (ph < oq ? 1 : 0.45) : 1) * 1.3;
          let x = tl * av * 3.2 + vb * avs * 1.6 + asp;
          // --- cascade: nasal pole → nasal zero → F5 → F4 → F3 → F2 → F1
          let y = knp[0] * x + knp[1] * c[0] + knp[2] * c[1];
          c[1] = c[0];
          c[0] = y;
          x = y;
          y = nzA * x + nzB * c[2] + nzC * c[3];
          c[3] = c[2];
          c[2] = x;
          x = y;
          y = k5[0] * x + k5[1] * c[4] + k5[2] * c[5];
          c[5] = c[4];
          c[4] = y;
          x = y;
          y = k4[0] * x + k4[1] * c[6] + k4[2] * c[7];
          c[7] = c[6];
          c[6] = y;
          x = y;
          y = k3[0] * x + k3[1] * c[8] + k3[2] * c[9];
          c[9] = c[8];
          c[8] = y;
          x = y;
          y = k2[0] * x + k2[1] * c[10] + k2[2] * c[11];
          c[11] = c[10];
          c[10] = y;
          x = y;
          y = k1[0] * x + k1[1] * c[12] + k1[2] * c[13];
          c[13] = c[12];
          c[12] = y;
          const casc = y;
          // --- parallel frication branch (band-passes on F2..F6 + bypass)
          let par = 0;
          if (af > 1e-4 || c[14] !== 0) {
            const fn = noise * af;
            const A2 = P[a + iA2] * iw + P[b + iA2] * w,
              A3 = P[a + iA3] * iw + P[b + iA3] * w,
              A4 = P[a + iA4] * iw + P[b + iA4] * w;
            const A5 = P[a + iA5] * iw + P[b + iA5] * w,
              A6 = P[a + iA6] * iw + P[b + iA6] * w,
              AB = P[a + iAB] * iw + P[b + iAB] * w;
            // direct-form biquad band-pass: y = b0 (x − x2) − a1 y1 − a2 y2 ; shared input history in c[14], c[15]
            const x1 = c[14],
              x2 = c[15];
            let yy;
            yy = p2[0] * (fn - x2) - p2[1] * c[16] - p2[2] * c[17];
            c[17] = c[16];
            c[16] = yy;
            par += A2 * yy;
            yy = p3[0] * (fn - x2) - p3[1] * c[18] - p3[2] * c[19];
            c[19] = c[18];
            c[18] = yy;
            par -= A3 * yy;
            yy = p4[0] * (fn - x2) - p4[1] * c[20] - p4[2] * c[21];
            c[21] = c[20];
            c[20] = yy;
            par += A4 * yy;
            yy = p5[0] * (fn - x2) - p5[1] * c[22] - p5[2] * c[23];
            c[23] = c[22];
            c[22] = yy;
            par -= A5 * yy;
            yy = p6[0] * (fn - x2) - p6[1] * st.p6a - p6[2] * st.p6b;
            st.p6b = st.p6a;
            st.p6a = yy;
            par += A6 * yy;
            par += AB * (fn - x1) * 0.35;
            c[15] = x1;
            c[14] = fn;
            if (
              af <= 1e-4 &&
              Math.abs(fn) < 1e-9 &&
              Math.abs(c[16]) + Math.abs(c[18]) + Math.abs(c[22]) < 1e-6
            ) {
              c[14] = 0;
              c[15] = 0;
            }
          }
          // --- output: DC block, gain
          const v = casc + PE * (casc - cp) + par * 4;
          cp = casc;
          const hp = v - dc1 + 0.995 * dc2;
          dc1 = v;
          dc2 = hp;
          out[o++] = hp * G0;
        }
      }
    }
    st.f = f1;
    st.seed = seed;
    st.ph = ph;
    st.T = T;
    st.amp = amp;
    st.alt = alt;
    st.tl = tl;
    st.vb = vb;
    st.dc1 = dc1;
    st.dc2 = dc2;
    st.cp = cp;
    st.ret = ret;
    return out;
  }
  function cloneSt(st) {
    const o = Object.assign({}, st);
    o.c = new Float64Array(st.c);
    return o;
  }
  const XF = 2; // chunk crossfade (frames): every chunk carries a 10 ms faded tail rendered from a copy of the state,
  //               the next chunk (same state → identical samples) fades in over it, so chunk seams are inaudible.
  function renderXF(m, st, f1, fadeIn) {
    const main = klattRender(m, st, f1);
    const tail = klattRender(m, cloneSt(st), f1 + XF);
    const n = main.length,
      nt = tail.length,
      out = new Float32Array(n + nt),
      W = XF * m.hop;
    out.set(main);
    out.set(tail, n);
    if (fadeIn) for (let i = 0; i < W && i < out.length; i++) out[i] *= i / W;
    for (let i = 0; i < nt; i++) out[n + i] *= 1 - i / W;
    return out;
  }
  /** Next good chunk end ≥ `from` frames: a run of ≥ 3 silent frames (no voicing/noise), else `max`. */
  function cutFrame(m, from, max) {
    const P = m.p,
      np = m.np;
    max = Math.min(max, m.n - 1);
    let run = 0;
    for (let f = from; f < max; f++) {
      const o = f * np;
      if (
        P[o + iAV] < 0.01 &&
        P[o + iAVS] < 0.01 &&
        P[o + iAH] < 0.01 &&
        P[o + iAF] < 0.01
      ) {
        if (++run >= 3) return f;
      } else run = 0;
    }
    return max;
  }

  // ------------------------------------------------------------------
  // Render worker. Sample synthesis runs off the main thread: the first
  // ≈ 0.45 s of a line is rendered synchronously (zero start latency), the
  // state is handed to a dedicated Worker that renders the rest of the line
  // (and every sung note) as fast as it can and posts crossfaded chunks
  // back; the main thread only schedules AudioBuffers on the audio clock at
  // their frame times. A main-thread stall after a line started no longer
  // starves the voice (the whole line is usually scheduled within ~50 ms).
  // Falls back to the lazy main-thread pump when Workers are unavailable
  // and for OfflineAudioContext renders.
  // ------------------------------------------------------------------
