// play-inline-33 11 — add
// Lines 3055-3459 of readable/play-inline-33.pretty.js (statement-aligned).
  function segTracks(segs, P, tr) {
    const F = [tr[iF1], tr[iF2], tr[iF3]],
      B = [tr[iB1], tr[iB2], tr[iB3]];
    // --- formant targets per segment
    // (speech) vowel undershoot: short unstressed vowels only get part-way to their target (s.red → schwa),
    // short diphthongs glide only part of the way (s.gk)
    const SCH = [500, 1450, 2500];
    const tgt = (s, end) => {
      const k = s.k;
      if (!k.F) return null;
      let T = k.F;
      if (end && k.F2t)
        T =
          s.gk !== undefined && s.gk < 1
            ? [0, 1, 2].map((q) => k.F[q] + (k.F2t[q] - k.F[q]) * s.gk)
            : k.F2t;
      if (s.red > 0) {
        const r = s.red;
        T = [
          T[0] + (SCH[0] - T[0]) * r,
          T[1] + (SCH[1] - T[1]) * r,
          T[2] + (SCH[2] - T[2]) * r * 0.5,
        ];
      }
      return T;
    };
    const nextSon = (i) => {
      for (let j = i + 1; j < segs.length && j < i + 4; j++) {
        const c = segs[j].k.c;
        if (SON[c]) return segs[j];
        if (c === "PAU") return null;
      }
      return null;
    };
    const prevSon = (i) => {
      for (let j = i - 1; j >= 0 && j > i - 4; j--) {
        const c = segs[j].k.c;
        if (SON[c]) return segs[j];
        if (c === "PAU") return null;
      }
      return null;
    };
    // velar locus is fronted before front vowels
    const locus = (s, v) => {
      const L = s.k.F.slice();
      if (s.k.pl === "vel" && v) {
        const f2 = v.k.F[1];
        L[1] = f2 > 1600 ? 2250 : 1500;
        L[2] = f2 > 1600 ? 2700 : 2100;
      }
      return L;
    };
    for (let i = 0; i < segs.length; i++) {
      const s = segs[i],
        c = s.k.c,
        t0 = s.t,
        t1 = s.t + s.d;
      if (c === "PAU" || c === "BR") {
        if (c === "BR") {
          const v = KP.AE.F;
          for (let q = 0; q < 3; q++) {
            F[q].add(t0, v[q] * 1.08);
            F[q].add(t1, v[q] * 1.08);
            B[q].add(t0, 300);
            B[q].add(t1, 300);
          }
        }
        continue;
      }
      if (SON[c]) {
        const Ta = tgt(s, false),
          Tb = tgt(s, true);
        const pv = segs[i - 1],
          nx = segs[i + 1];
        // left boundary
        let tin = Math.min(0.05, s.d * 0.4);
        if (
          pv &&
          pv.k.F &&
          (pv.k.c === "N" ||
            pv.k.c === "F" ||
            pv.k.c === "S" ||
            pv.k.c === "A" ||
            pv.k.c === "X")
        ) {
          const src = pv.k.c === "S" || pv.k.c === "A" ? pv : pv;
          const L = locus(src, s),
            kk = KLOC[src.k.pl] || KLOC.alv;
          // stops: the transition starts at the release (burst/aspiration are transparent), others at the boundary
          const bt = pv.sub === "as" ? pv.t : pv.sub === "bu" ? pv.t : t0;
          for (let q = 0; q < 3; q++)
            F[q].add(bt, (L[q] + kk[q] * (Ta[q] - L[q])) * 1);
          tin = Math.min(
            pv.k.c === "S" || pv.k.c === "A"
              ? 0.05
              : pv.k.c === "N"
                ? 0.045
                : 0.04,
            s.d * 0.5,
          );
        } else if (pv && SON[pv.k.c]) {
          const Tp = tgt(pv, true),
            glide = c === "G" || pv.k.c === "G";
          const w = c === "G" ? 0.75 : pv.k.c === "G" ? 0.25 : 0.5;
          for (let q = 0; q < 3; q++) F[q].add(t0, Tp[q] * w + Ta[q] * (1 - w));
          tin = glide ? Math.min(0.07, s.d * 0.5) : Math.min(0.05, s.d * 0.4);
        } else if (pv && pv.k.c === "H") {
          tin = 0.012;
        }
        // targets (diphthongs glide from 30 % to 85 %)
        let tout = Math.min(0.05, s.d * 0.4);
        // VC transitions carry most of the place cue of a final stop/nasal ("pat/pack/pap", "sun/sum/sung"):
        // ≈ 60 ms into stops, 55 ms into nasals (measured on natural voices), shorter into fricatives
        if (
          nx &&
          (nx.k.c === "N" || nx.k.c === "F" || nx.k.c === "S" || nx.k.c === "A")
        )
          tout = Math.min(
            nx.k.c === "S" || nx.k.c === "A"
              ? 0.06
              : nx.k.c === "N"
                ? 0.055
                : 0.04,
            s.d * 0.5,
          );
        else if (nx && SON[nx.k.c])
          tout = Math.min(
            nx.k.c === "G" || c === "G" ? 0.06 : 0.05,
            s.d * 0.45,
          );
        if (c === "G") {
          tin = Math.min(tin, s.d * 0.35);
          tout = Math.min(tout, s.d * 0.35);
        }
        if (s.k.F2t) {
          const gl = s.glide || [0.3, 0.85],
            a = t0 + Math.max(tin, s.d * gl[0]),
            b = t0 + s.d * gl[1];
          for (let q = 0; q < 3; q++) {
            F[q].add(a, Ta[q]);
            F[q].add(Math.max(a, Math.min(b, t1 - tout * 0.3)), Tb[q]);
          }
        } else {
          const a = t0 + tin,
            b = Math.max(a, t1 - tout);
          for (let q = 0; q < 3; q++) {
            F[q].add(a, Ta[q]);
            F[q].add(b, Ta[q]);
          }
        }
        // right boundary into an obstruent/nasal: move toward its locus
        if (
          nx &&
          nx.k.F &&
          (nx.k.c === "N" ||
            nx.k.c === "F" ||
            nx.k.c === "S" ||
            nx.k.c === "A" ||
            nx.k.c === "X")
        ) {
          const L = locus(nx, s),
            kk = KLOC[nx.k.pl] || KLOC.alv;
          for (let q = 0; q < 3; q++)
            F[q].add(t1 - 0.0005, L[q] + kk[q] * (Tb[q] - L[q]));
        }
        const Bv = s.k.B;
        for (let q = 0; q < 3; q++) {
          B[q].add(t0 + 0.01, Bv[q]);
          B[q].add(t1 - 0.01, Bv[q]);
        }
        continue;
      }
      if (c === "H") {
        // HH: the voiceless onset of the next vowel
        const v = nextSon(i) || prevSon(i);
        const T = v ? tgt(v, false) : KP.AX.F;
        for (let q = 0; q < 3; q++) {
          F[q].add(t0, T[q]);
          F[q].add(t1, T[q]);
          B[q].add(t0, [300, 150, 200][q]);
          B[q].add(t1, [300, 150, 200][q]);
        }
        continue;
      }
      // obstruents & nasals hold their own (locus) values; the vowels carry the transitions
      if (s.sub === "as") {
        // aspiration: widened B1, formants gliding (the next vowel's left anchor sits at the release)
        B[0].add(t0, 250);
        B[0].add(t1, 250);
        B[1].add(t0, 150);
        B[2].add(t0, 220);
        continue;
      }
      if (s.sub === "bu") {
        B[0].add(t0, 250);
        continue;
      }
      const v = nextSon(i) || prevSon(i);
      const L = locus(s, v);
      // coarticulation: the tongue body is already on its way to the vowel during the consonant (anticipatory,
      // ≈ 20 %; nasals 15 %), and inside consonant clusters the tract glides from one consonant to the next
      // (15–20 ms ramps) instead of jumping — clusters like "str", "nd", "ks" no longer click or buzz
      const Vt = v ? tgt(v, false) : null;
      if (Vt) {
        const a = s.k.c === "N" ? 0.15 : 0.2;
        for (let q = 0; q < 3; q++) L[q] += a * (Vt[q] - L[q]);
      }
      const pc = segs[i - 1],
        inCl =
          pc &&
          pc.k &&
          pc.k.F &&
          !SON[pc.k.c] &&
          pc.k.c !== "PAU" &&
          pc.k.c !== "BR" &&
          pc.k.c !== "H" &&
          (pc.src === undefined || pc.src !== s.src);
      const rin = inCl ? Math.min(0.018, s.d * 0.45) : 0.0005;
      for (let q = 0; q < 3; q++) {
        F[q].add(t0 + rin, L[q]);
        F[q].add(Math.max(t0 + rin, t1 - 0.0005), L[q]);
      }
      for (let q = 0; q < 3; q++) {
        B[q].add(t0 + Math.max(0.003, rin), s.k.B[q]);
        B[q].add(t1 - 0.003, s.k.B[q]);
      }
    }
    // --- amplitudes & source parameters
    const AV = tr[iAV],
      AVS = tr[iAVS],
      AH = tr[iAH],
      AF = tr[iAF],
      FNZ = tr[iFNZ],
      TL = tr[iTL],
      FRY = tr[iFRY];
    const PAR = [tr[iA2], tr[iA3], tr[iA4], tr[iA5], tr[iA6], tr[iAB]];
    const setAmp = (trk, t0, t1, v, rin, rout) => {
      trk.add(t0 + Math.min(rin, (t1 - t0) * 0.5), v);
      trk.add(
        Math.max(
          t0 + Math.min(rin, (t1 - t0) * 0.5),
          t1 - Math.min(rout, (t1 - t0) * 0.5),
        ),
        v,
      );
    };
    const br = P.breath;
    for (let i = 0; i < segs.length; i++) {
      const s = segs[i],
        c = s.k.c,
        t0 = s.t,
        t1 = s.t + s.d;
      let av = 0,
        avs = 0,
        ah = 0,
        af = 0,
        par = null,
        fnz = 270,
        r = 0.012,
        avsDone = false;
      if (c === "PAU") {
        av = 0;
        r = 0.03;
      } else if (c === "BR") {
        ah = 0.05 + br * 0.5;
        r = 0.08;
      } else if (c === "V" || c === "D") {
        av = s.av !== undefined ? s.av : s.st > 0 ? 1 : s.func ? 0.72 : 0.8;
        ah = s.ah !== undefined ? s.ah : br * Math.min(1, av);
        if (s.final) av *= 0.92;
        if (s.emph && s.st > 0) av *= 1.12;
        FNZ.add(t0 + Math.min(0.03, s.d * 0.3), 270);
        const nx = segs[i + 1];
        if (nx && nx.k.c === "N") {
          FNZ.add(Math.max(t0, t1 - 0.06), 270);
          FNZ.add(t1, 400);
        }
      } else if (c === "G") {
        av = s.p === "W" || s.p === "Y" ? 0.78 : 0.82;
        ah = br * 0.5;
        // after a voiceless stop's release or a voiceless fricative in the same cluster ("play", "tree", "fly", "sweet")
        // the glide starts devoiced: aspiration carries its formants, voicing comes in part-way through
        const pv = segs[i - 1];
        if (
          pv &&
          ((pv.sub === "as" && pv.src && pv.src.w === s.w) ||
            (pv.k.c === "F" && !pv.k.vc && pv.w === s.w))
        ) {
          const tv = t0 + s.d * 0.45;
          AV.add(t0 + 0.003, av * 0.15);
          AV.add(tv, av);
          AV.add(Math.max(tv, t1 - r), av);
          AH.add(t0 + 0.003, 0.34);
          AH.add(tv, ah);
          AH.add(Math.max(tv, t1 - r), ah);
          setAmp(AVS, t0, t1, 0, 0.008, 0.01);
          setAmp(AF, t0, t1, 0, r, r);
          setAmp(FNZ, t0, t1, 270, 0.008, 0.008);
          continue;
        }
      } else if (c === "X") {
        av = 0.55;
        r = 0.006;
      } else if (c === "N") {
        av = 0.78;
        fnz = 450;
        r = 0.008;
      } else if (c === "H") {
        ah = 0.55;
        r = 0.015;
      } else if (c === "F") {
        av = s.k.vc ? 0.3 : 0;
        af = s.k.af;
        par = s.k.par;
        r = 0.02;
        // lip rounding before a rounded vowel/glide lowers the frication ("sue", "shoe", "swing"); spread lips raise it
        const v = nextSon(i);
        if (
          v &&
          (v.p === "UW" ||
            v.p === "OW" ||
            v.p === "UH" ||
            v.p === "AO" ||
            v.p === "W" ||
            v.p === "R" ||
            v.p === "OY")
        )
          par = [
            par[0],
            par[1] * 1.1,
            par[2] * 1.2,
            par[3] * 0.85,
            par[4] * 0.7,
            par[5] * 0.8,
          ];
        else if (v && (v.p === "IY" || v.p === "IH" || v.p === "EY"))
          par = [par[0], par[1], par[2] * 0.9, par[3], par[4] * 1.1, par[5]];
      } else if (c === "S" || c === "A") {
        if (s.sub === "cl") {
          r = 0.006;
          if (s.k.vc) {
            // English /b d g/: no prevoicing after a pause or a voiceless sound (short-lag stops — a long voice bar
            // there reads as a nasal murmur: "bed"→"med"/"wed"); after a sonorant the voice bar dies away within
            // ~50 ms (utterance-final "bad" no longer hums like "ban")
            const pv = segs[i - 1],
              pc = pv ? pv.k.c : "PAU";
            const voicedBefore =
              pv &&
              (SON[pc] ||
                pc === "N" ||
                (pv.k.vc && pc !== "PAU" && pc !== "BR"));
            if (voicedBefore) {
              const dk = Math.min(s.d, 0.055);
              AVS.add(t0 + 0.004, 0.42);
              AVS.add(t0 + dk, 0.1);
              AVS.add(t1 - 0.002, s.d > 0.07 ? 0.02 : 0.1);
              avsDone = true;
            }
          }
        } else if (s.sub === "bu") {
          av = s.k.vc ? 0.25 : 0;
          af = (s.k.c === "A" ? s.k.af : 0.9) * (s.weak || 1);
          par = s.k.c === "A" ? s.k.par : s.k.burst;
          r = 0.001;
          if (s.k.c !== "A") {
            // burst: sharp onset, fast decay
            AF.add(t0, 0);
            AF.add(t0 + 0.0015, af);
            AF.add(t1, af * 0.4);
            for (let q = 0; q < 6; q++) {
              PAR[q].add(t0, par[q]);
              PAR[q].add(t1, par[q]);
            }
            AV.add(t0, 0);
            AV.add(t1, av);
            AH.add(t0, 0);
            AH.add(t1, s.k.vc ? 0 : 0.3);
            AVS.add(t0, 0);
            AVS.add(t1, 0);
            FNZ.add(t0, 270);
            FNZ.add(t1, 270);
            continue;
          }
        } else if (s.sub === "as") {
          ah = s.strong ? 0.5 : 0.4;
          av = s.k.vc ? 0.4 : 0;
          r = 0.004;
        }
      }
      AV.add(t0 + Math.min(r, s.d * 0.4), av);
      AV.add(
        Math.max(t0 + Math.min(r, s.d * 0.4), t1 - Math.min(r, s.d * 0.4)),
        av,
      );
      if (!avsDone) setAmp(AVS, t0, t1, avs, 0.008, 0.01);
      setAmp(AH, t0, t1, ah, r, r);
      setAmp(AF, t0, t1, af, c === "F" ? 0.025 : r, c === "F" ? 0.02 : r);
      if (par)
        for (let q = 0; q < 6; q++)
          setAmp(PAR[q], t0, t1, par[q], 0.004, 0.004);
      if (c !== "V" && c !== "D") setAmp(FNZ, t0, t1, fnz, 0.008, 0.008);
    }
  }

  /** Plan a whole line into synth frames. Returns {m (render job), plans:[{t0,t1,text}], dur}. */
