// play-inline-33 15 — the
// Lines 4415-4548 of readable/play-inline-33.pretty.js (statement-aligned).
  function renderLine(text, profileId, seed, chunked) {
    let a = seed >>> 0 || 7;
    const rnd = () => {
      a = (a * 1664525 + 1013904223) >>> 0;
      return a / 4294967296;
    };
    const pl = plan2(text, profileId, rnd);
    const st = klattState(pl.m, 12345);
    if (!chunked)
      return { data: klattRender(pl.m, st, pl.m.n), sr: VSR, plan: pl };
    // same path as live playback: crossfaded chunks overlap-added at their frame offsets
    const m = pl.m,
      outA = new Float32Array((m.n + XF) * HOP);
    while (st.f < m.n - 1) {
      const from = st.f,
        cut = cutFrame(m, Math.min(m.n - 1, from + 30), from + 120),
        d = renderXF(m, st, cut, from > 0);
      for (let i = 0; i < d.length && from * HOP + i < outA.length; i++)
        outA[from * HOP + i] += d[i];
    }
    return { data: outA, sr: VSR, plan: pl };
  }
  // ------------------------------------------------------------------
  // SINGER 2 — the VOX 2 synthesiser driven by a melody. Same contract as
  // the legacy singer (note(t, dur, midi, syl, vel, o) in time order;
  // dispose(fade)). Each sung syllable becomes segments (onset consonants
  // sung ahead of the beat, sustained pure vowel with a late diphthong
  // glide, coda consonants) on one continuous frame timeline; the pitch
  // track carries the crooner's scoop / legato portamento, a delayed
  // vibrato that blooms on held notes, the swell and the jazz fall-off.
  // Rendering is lazy (a shared ~100 ms pump renders ≈ 0.5 s ahead), in
  // crossfaded chunks, so a bar of notes never stalls the main thread.
  // ------------------------------------------------------------------
  // Round 1 revision (singing pass): breathier, warmer sources (higher open quotient, more aspiration, darker tilt),
  // sung-vowel formant tuning (f1k: a more open jaw; F1 follows f0 on high notes), a singer's-formant cluster for the
  // crooner (sf: F3/F4/F5 pulled together near 2.6–3.4 kHz), vibrato that develops (delay → S-curve onset, rate
  // settling upward, per-note depth, coupled amplitude vibrato), slow pitch wander, smooth portamento, audible
  // breath intakes, a plate/echo-chamber send and (girl-group doubles) an ensemble chorus.
  const SING2 = {
    male: {
      f0: 110,
      tilt: 0.36,
      oq: 0.63,
      jitter: 0.005,
      shimmer: 0.028,
      breath: 0.058,
      vib: [5.4, 0.016],
      gain: 0.86,
      warmth: 5,
      scoop: 0.95,
      fs: 1.0,
      f1k: 1.05,
      sf: 1,
      plate: 0.2,
      pres: 2.5,
    },
    female: {
      f0: 220,
      tilt: 0.38,
      oq: 0.68,
      jitter: 0.004,
      shimmer: 0.024,
      breath: 0.078,
      vib: [5.9, 0.018],
      gain: 0.8,
      warmth: 2,
      scoop: 0.962,
      fs: 1.17,
      f1k: 1.07,
      sf: 0,
      plate: 0.24,
      pres: 3.5,
    },
  };
  // Shared plate / echo-chamber reverb per destination (the station chain input): 1950s records put the singer in an
  // echo chamber, the band mostly dry. One ConvolverNode per chain, IR generated once (≈ 1.4 s, darkening tail).
  const PLATES = typeof WeakMap !== "undefined" ? new WeakMap() : null;
  function vocalPlate(ctx, dest) {
    let cv = PLATES && PLATES.get(dest);
    if (cv) return cv;
    const sr = ctx.sampleRate,
      len = Math.floor(sr * 1.4),
      pre = Math.floor(sr * 0.014),
      ir = ctx.createBuffer(2, len, sr);
    let a = 0x2545f491;
    const rnd = () => {
      a ^= a << 13;
      a ^= a >>> 17;
      a ^= a << 5;
      return ((a >>> 0) / 4294967296) * 2 - 1;
    };
    for (let ch = 0; ch < 2; ch++) {
      const d = ir.getChannelData(ch);
      let lp = 0;
      for (let i = pre; i < len; i++) {
        const tt = (i - pre) / sr,
          k = Math.exp((-tt * 3.9) / 1.1); // RT60 ≈ 1.1 s
        const c = 0.55 - 0.4 * Math.min(1, tt / 1.0); // the tail darkens
        lp += c * (rnd() - lp);
        d[i] = lp * k * (tt < 0.004 ? tt / 0.004 : 1);
      }
    }
    cv = ctx.createConvolver();
    cv.buffer = ir;
    const g = ctx.createGain();
    g.gain.value = 0.9;
    const hp = bq(ctx, "highpass", 300, 0.7);
    cv.connect(hp);
    hp.connect(g);
    g.connect(dest);
    if (PLATES) PLATES.set(dest, cv);
    return cv;
  }
  const OLD2K = { H: "HH" };
  const oldV2K = (v) =>
    v.length > 1
      ? OLD_D[v.join("-")] || OLD_V[v[0]] || "AX"
      : OLD_V[v[0]] || "AX";
  const live2 = new Set();
  let pumpTimer = 0;
  function pumpAll() {
    live2.forEach((sg) => {
      try {
        sg._pump();
      } catch (e) {
        G.reportError && G.reportError("sound:singer", e);
        live2.delete(sg);
      }
    });
    if (!live2.size && pumpTimer) {
      clearInterval(pumpTimer);
      pumpTimer = 0;
    }
  }
