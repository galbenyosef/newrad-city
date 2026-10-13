// play-inline-33 12 — add
// Lines 3460-3796 of readable/play-inline-33.pretty.js (statement-aligned).
  function plan2(text, profileId, rnd, drop) {
    const P = PROFILES[profileId] || PROFILES.announcer;
    rnd = rnd || Math.random;
    const phs = phrases(text);
    const plans = [],
      segLists = [];
    phs.forEach((ph, i) => {
      if (ph.voc) {
        segLists.push(vocSegs(ph.voc, P, rnd));
        plans.push({
          end: "v",
          voc: ph.voc,
          pause: ph.voc === "breath" ? 0.04 : 0.1 + rnd() * 0.08,
          breath: 0,
          words: [],
        });
        return;
      }
      // tempo: a little drift phrase to phrase; the DJ's patter register runs long phrases and exclamations faster
      let rk = 1 + (rnd() - 0.5) * 0.08;
      if (P.patter) {
        rk *=
          1 + P.patter * Math.min(1, Math.max(0, (ph.words.length - 4) / 8));
        if (ph.end === "!") rk *= 1 + P.patter * 0.5;
      }
      const segs = segPhrase(
        ph,
        rk === 1 ? P : Object.assign({}, P, { rate: P.rate * rk }),
        rnd,
      );
      const pause =
        ({ ".": 0.38, "!": 0.4, "?": 0.44, ",": 0.16, ";": 0.26, "…": 0.55 }[
          ph.end
        ] || 0.3) *
        P.pause *
        (0.85 + rnd() * 0.3);
      const prev = phs[i - 1];
      const breath =
        i > 0 &&
        !(prev && prev.voc) &&
        ph.end !== "," &&
        prev.end !== "," &&
        rnd() < 0.5
          ? 0.2 * P.pause
          : 0;
      plans.push({ end: ph.end, pause, breath, words: ph.words });
      segLists.push(segs);
    });
    segLists.forEach((sl, pi) =>
      sl.forEach((sg) => {
        sg.ph = pi;
      }),
    );
    const tl = timeline(segLists, plans, P.rate);
    const segs = tl.segs;
    // vowel undershoot (needs the final durations): short unstressed vowels drift toward schwa, short diphthongs glide less
    for (const sg of segs) {
      const c = sg.k && sg.k.c;
      if ((c !== "V" && c !== "D") || sg.voc) continue;
      if (sg.st === 0) {
        if (sg.p !== "AX" && sg.p !== "AXR") {
          const r = Math.min(0.55, Math.max(0.1, 1 - (sg.d - 0.03) / 0.09));
          sg.red = sg.p === "IY" || sg.p === "IH" ? r * 0.6 : r;
        }
      } else if (sg.d < 0.08) sg.red = 0.1;
      if (c === "D") sg.gk = Math.min(1, Math.max(0.45, sg.d / 0.15));
    }
    // word spans (global word index over the whole line) — for caption sync and signal dropouts
    const wordBase = [];
    let wb = 0;
    plans.forEach((pl) => {
      wordBase.push(wb);
      wb += pl.words.length;
    });
    const words = [];
    for (const sg of segs) {
      const src = sg.src || sg;
      if (src.w === undefined || src.ph === undefined) continue;
      const gi = wordBase[src.ph] + src.w,
        e = words[gi] || (words[gi] = { t0: sg.t, t1: sg.t + sg.d });
      e.t0 = Math.min(e.t0, sg.t);
      e.t1 = Math.max(e.t1, sg.t + sg.d);
    }
    const fs = P.fs;
    const nF = Math.ceil((tl.dur + 0.06) / FR) + 1;
    const p = new Float32Array(nF * NP);
    const tr = [];
    for (let i = 0; i < NP; i++) tr.push(new Track());
    segTracks(segs, P, tr);
    const FRY = tr[iFRY],
      TL = tr[iTL],
      FNZ = tr[iFNZ];
    // --- F0 (intonation). Per intonation phrase: pitch accents on the primary-stressed syllables of content words
    // (and on *emphasised* words), each pre-nuclear accent a step lower than the last (downstep), the nuclear
    // (last) accent carrying the phrase's tune — H* L-L% fall for statements and wh-questions, L* H-H% rise for
    // yes/no questions, a continuation rise before commas; a declining baseline across the comma phrases of one
    // sentence with a reset at each new sentence; micro-prosody after voiceless/voiced onsets; creak at the end.
    const f0 = tr[iF0],
      base = P.f0 * (0.97 + rnd() * 0.06);
    let sentPos = 0;
    plans.forEach((pl, pi) => {
      const ss = segs.filter(
        (s) =>
          s.t >= pl.t0 - 1e-6 &&
          s.t < pl.t1 - 1e-6 &&
          (s.k.c === "V" || s.k.c === "D"),
      );
      if (pl.voc) {
        for (const s of ss) {
          const k = s.pulse || 0;
          let a = 1,
            b = 1,
            mid = 0;
          if (pl.voc === "laugh") {
            a = 1.55 - 0.07 * k;
            b = a * 0.86;
          } else if (pl.voc === "chuckle") {
            a = 1.12 - 0.05 * k;
            b = a * 0.92;
          } else if (pl.voc === "whoop") {
            if (k === 0) {
              a = 1.2;
              b = 1.55;
            } else {
              a = 1.65;
              mid = 2.15;
              b = 1.4;
            }
          } else if (pl.voc === "sigh") {
            a = 1.25;
            b = 0.78;
          }
          f0.add(s.t, base * a);
          if (mid) f0.add(s.t + s.d * 0.45, base * mid);
          f0.add(s.t + s.d, base * b);
          TL.add(s.t, P.tilt + (pl.voc === "whoop" ? -0.06 : 0.06));
          TL.add(s.t + s.d, P.tilt + (pl.voc === "whoop" ? -0.02 : 0.1));
        }
        return;
      }
      const N = ss.length,
        R = P.range * P.accent;
      const emphP = pl.end === "!" ? 1.3 : 1;
      const reset = 1 - 0.045 * sentPos;
      sentPos = pl.end === "," || pl.end === ";" ? sentPos + 1 : 0;
      const acc = ss.map(
        (s) => (s.st === 1 && !s.func) || (s.emph && s.st > 0),
      );
      let nuc = -1;
      for (let i = N - 1; i >= 0; i--)
        if (acc[i]) {
          nuc = i;
          break;
        }
      if (nuc < 0) {
        for (let i = N - 1; i >= 0; i--)
          if (ss[i].st > 0) {
            nuc = i;
            break;
          }
        if (nuc < 0) nuc = N - 1;
        acc[nuc] = true;
      }
      const question = pl.end === "?" && !WH.has(pl.words[0]);
      const cont = pl.end === "," || pl.end === ";" || pl.end === "…";
      const low = 0.8 - R * 0.2;
      f0.add(pl.t0, base * reset * (1.04 + (pi === 0 ? 0.03 : 0)));
      let k = 0;
      ss.forEach((s, i) => {
        const decl = reset * (1.06 - 0.14 * (N > 1 ? i / (N - 1) : 0));
        const onset = segs[segs.indexOf(s) - 1];
        const micro =
          onset && onset.k && (VOICELESS[onset.p] || onset.sub === "as")
            ? 1.04
            : onset && onset.k && onset.k.vc && onset.k.c !== "G"
              ? 0.97
              : 1;
        const t0 = s.t,
          t1 = s.t + s.d;
        const em = s.emph ? 1.6 : 1;
        let tilt = P.tilt + (s.st === 0 ? 0.05 : 0);
        if (i === nuc) {
          const h = R * (0.85 + rnd() * 0.3) * em * emphP;
          tilt -= 0.05;
          if (question) {
            f0.add(t0, base * (decl - R * 0.1) * micro);
            f0.add(t0 + s.d * 0.4, base * (decl - R * 0.12));
            f0.add(t1, base * (i === N - 1 ? 1.1 + R * 1.3 : decl + R * 0.3));
          } else if (cont) {
            f0.add(t0, base * (decl + h * 0.3) * micro);
            f0.add(t0 + s.d * 0.4, base * (decl + h * 0.6));
            f0.add(t1, base * (i === N - 1 ? decl + R * 0.35 : decl + h * 0.3));
          } else {
            f0.add(t0, base * (decl + h * 0.4) * micro);
            f0.add(t0 + s.d * 0.33, base * (decl + h));
            f0.add(t1, base * (i === N - 1 ? low : decl + h * 0.15));
          }
        } else if (i > nuc) {
          // post-nuclear stretch follows the boundary tone
          const u = N - 1 > nuc ? (i - nuc) / (N - 1 - nuc) : 1;
          let v;
          if (question) v = decl + (1.1 + R * 1.3 - decl) * u;
          else if (cont) v = decl + R * 0.35 * u;
          else v = low + 0.07 * (1 - u); // after H* L- the voice stays down
          f0.add(t0, base * v * micro);
          f0.add(
            t1,
            base *
              (i === N - 1
                ? question
                  ? 1.1 + R * 1.3
                  : cont
                    ? decl + R * 0.35
                    : low
                : v),
          );
        } else if (acc[i]) {
          const h =
            R *
            (k === 0 ? 1 : Math.pow(0.8, k)) *
            (0.8 + rnd() * 0.35) *
            em *
            emphP;
          k++;
          tilt -= 0.04;
          f0.add(t0, base * (decl + h * 0.25) * micro);
          f0.add(t0 + s.d * 0.45, base * (decl + h));
          f0.add(t1, base * (decl + h * 0.55));
        } else if (s.st > 0) {
          f0.add(t0, base * (decl + R * 0.04) * micro);
          f0.add(t1, base * (decl + R * 0.02));
        } else {
          f0.add(t0, base * (decl - R * 0.06) * micro);
          f0.add(t1, base * (decl - R * 0.12));
        }
        if (s.final) {
          if (P.fry && (pl.end === "." || pl.end === "…")) {
            FRY.add(t0 + s.d * 0.5, 0);
            FRY.add(t1, P.fry * 0.8);
            FRY.add(t1 + 0.05, 0);
          }
          TL.add(t0, tilt);
          TL.add(t1, Math.min(0.92, P.tilt + 0.15));
        } else {
          TL.add(t0, tilt);
          TL.add(t1, tilt);
        }
      });
    });
    tr[iF4].add(0, 3300);
    FNZ.add(0, 270);
    for (let i = 0; i < NP; i++) tr[i].fill(p, i, nF);
    // dropped words (weak signal): the voice sinks under the static for exactly those words
    const drops = [];
    if (drop && drop.size) {
      drop.forEach((gi) => {
        const w = words[gi];
        if (w) drops.push({ t0: w.t0, t1: w.t1 });
      });
      for (const d of drops) {
        for (
          let f = Math.max(0, Math.floor((d.t0 - 0.03) / FR));
          f < nF && f * FR < d.t1 + 0.03;
          f++
        ) {
          const t = f * FR,
            k = t < d.t0 ? (d.t0 - t) / 0.03 : t > d.t1 ? (t - d.t1) / 0.03 : 0,
            g = 0.06 + 0.94 * Math.min(1, k);
          const o = f * NP;
          p[o + iAV] *= g;
          p[o + iAVS] *= g;
          p[o + iAH] *= g;
          p[o + iAF] *= g;
        }
      }
    }
    // formant scale (tract length) and sanity
    for (let f = 0; f < nF; f++) {
      const o = f * NP;
      p[o + iF1] *= fs;
      p[o + iF2] *= fs;
      p[o + iF3] *= fs;
      p[o + iF4] = 3300 * fs;
      if (!(p[o + iF0] > 40)) p[o + iF0] = base;
      if (!(p[o + iB1] > 20)) p[o + iB1] = 80;
      if (!(p[o + iB2] > 20)) p[o + iB2] = 100;
      if (!(p[o + iB3] > 20)) p[o + iB3] = 150;
      if (!(p[o + iFNZ] > 100)) p[o + iFNZ] = 270;
      if (!(p[o + iTL] > 0)) p[o + iTL] = P.tilt;
    }
    return {
      m: {
        sr: VSR,
        hop: HOP,
        np: NP,
        n: nF,
        p,
        f5: 3750 * fs,
        f6: 4700 * Math.sqrt(fs),
        oq: P.oq,
        jitter: P.jitter,
        shimmer: P.shimmer,
        gain: P.gain * (P.norm || 1),
        ta: P.ta,
        pe: P.pe,
      },
      plans: plans.map((pl) => ({ t0: pl.t0, t1: pl.t1, end: pl.end })),
      segs: segs.map((s) => ({ p: s.p, sub: s.sub, t: s.t, d: s.d, st: s.st })),
      words,
      drops,
      dur: tl.dur,
    };
  }

  // ------------------------------------------------------------------
  // The sample synthesiser (resumable: render frames [f0, f1) per call)
  // ------------------------------------------------------------------
  function klattState(m, seed) {
    return {
      f: 0,
      seed: seed >>> 0 || 0x9e3779b9,
      ph: 1,
      T: 100,
      amp: 1,
      alt: 1,
      c: new Float64Array(24), // cascade & parallel filter states
      tl: 0,
      vb: 0,
      dc1: 0,
      dc2: 0,
      p6a: 0,
      p6b: 0,
      cp: 0,
      ret: 0,
    };
  }
  /** Render frames [st.f, f1) of job m into a Float32Array. */
