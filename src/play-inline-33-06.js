// play-inline-33 06 — gain
// Lines 1564-1921 of readable/play-inline-33.pretty.js (statement-aligned).
  function consSegs(list, nextF) {
    const segs = [];
    for (const p of list) {
      const q = PH[p];
      if (!q) continue;
      let F = q.F ? q.F.slice() : nextF.slice();
      if (!q.F && q.F2)
        F = [
          Math.min(nextF[0], 350),
          q.F2 * 0.6 + nextF[1] * 0.4,
          nextF[2] * 0.96,
          nextF[3],
        ];
      if (q.c === "P") {
        segs.push({
          d: q.cl * 0.9,
          F: [220, F[1], F[2], F[3]],
          v: q.v,
          a: 0,
          fr: null,
        });
        segs.push({ d: 0.012, F, v: q.v * 1.5, a: 0.1, fr: q.b, burst: true });
        if (q.asp)
          segs.push({ d: q.asp * 0.8, F: nextF, v: 0.05, a: 0.3, fr: null });
        continue;
      }
      if (q.c === "H") {
        segs.push({ d: q.d, F: nextF, v: 0, a: q.a, fr: null });
        continue;
      }
      // sung nasals & liquids are held a touch longer (they carry pitch)
      segs.push({
        d: q.d * (q.c === "N" || q.c === "L" ? 1.15 : 0.95),
        F,
        v: q.v,
        a: q.c === "F" ? 0.02 : 0,
        fr: q.fr || null,
        nasal: q.c === "N",
      });
    }
    return segs;
  }

  /**
   * A singer living on `dest`. opts: {voice:'male'|'female', start, gain, detune (cents), delay (s), fs (tract scale ×)}.
   * singer.note(t, dur, midi, syl, vel, {legato, breath, fall}) schedules one sung syllable whose vowel starts at t.
   * Notes must be scheduled in time order (the composers do, bar by bar). dispose(fade) frees the graph.
   */
  function singer(ctx, dest, opts) {
    opts = opts || {};
    const V = SING[opts.voice] || SING.male;
    const fs = V.fs * (opts.fs || 1);
    const t0 = Math.max(ctx.currentTime + 0.02, opts.start || 0);
    const nodes = [];
    const mk = (n) => {
      nodes.push(n);
      return n;
    };
    const osc = mk(ctx.createOscillator());
    osc.setPeriodicWave(S.wave(ctx, "glottal"));
    osc.frequency.value = 220;
    osc.detune.value = opts.detune || 0;
    const vib = mk(ctx.createOscillator());
    vib.frequency.value = V.vib[0] * (0.96 + Math.random() * 0.08);
    const vibG = mk(ctx.createGain());
    vibG.gain.value = 0;
    vib.connect(vibG);
    vibG.connect(osc.frequency);
    const jit = mk(ctx.createBufferSource());
    jit.buffer = S.noiseBufs.pink;
    jit.loop = true;
    jit.playbackRate.value = 0.3;
    const jitF = mk(bq(ctx, "lowpass", 30, 0.5));
    const jitG = mk(ctx.createGain());
    jitG.gain.value = 5;
    jit.connect(jitF);
    jitF.connect(jitG);
    jitG.connect(osc.frequency);
    const nz = mk(ctx.createBufferSource());
    nz.buffer = S.noiseBufs.white;
    nz.loop = true;
    const vG = mk(ctx.createGain());
    vG.gain.value = 0;
    const aG = mk(ctx.createGain());
    aG.gain.value = 0;
    const aHp = mk(bq(ctx, "highpass", 500, 0.5));
    osc.connect(vG);
    nz.connect(aHp);
    aHp.connect(aG);
    const res = [];
    let prev = null;
    for (let k = 0; k < 4; k++) {
      const f = VF.schwa[k] * fs;
      const r = mk(bq(ctx, "lowpass", f, qdb(f, k)));
      res.push(r);
      if (prev) prev.connect(r);
      prev = r;
    }
    vG.connect(res[0]);
    aG.connect(res[0]);
    const frF = mk(bq(ctx, "bandpass", 5000, 2));
    const frG = mk(ctx.createGain());
    frG.gain.value = 0;
    nz.connect(frF);
    frF.connect(frG);
    const lipRad = mk(bq(ctx, "highshelf", 1200, 0.7, 6));
    const warm = mk(bq(ctx, "lowshelf", 220, 0.7, V.warmth));
    const hp = mk(bq(ctx, "highpass", 90, 0.7));
    const pres = mk(bq(ctx, "peaking", 2800, 1.1, 4)); // singer's formant / ribbon-mic presence
    const out = mk(ctx.createGain());
    out.gain.value =
      (opts.gain === undefined ? 1 : opts.gain) * V.gain * NORM * SING_NORM;
    res[3].connect(lipRad);
    frG.connect(lipRad);
    lipRad.connect(warm);
    warm.connect(hp);
    hp.connect(pres);
    pres.connect(out);
    if (opts.delay) {
      const dl = mk(ctx.createDelay(0.2));
      dl.delayTime.value = opts.delay;
      out.connect(dl);
      dl.connect(dest);
    } else out.connect(dest);
    [osc, vib, jit, nz].forEach((s) =>
      s.start(t0, s === nz || s === jit ? Math.random() * 2 : 0),
    );

    const lastF = VF.schwa.map((f) => f * fs);
    let cursor = t0,
      lastPitch = 0,
      voiced = false,
      voicedUntil = 0,
      vibCursor = t0,
      disposed = false;
    const setF = (Fv, tt, tr) => {
      for (let k = 0; k < 4; k++) {
        const f = Math.min(Fv[k] * fs, 4800);
        res[k].frequency.setValueAtTime(lastF[k], tt);
        res[k].frequency.linearRampToValueAtTime(f, tt + tr);
        res[k].Q.setValueAtTime(qdb(lastF[k], k), tt);
        res[k].Q.linearRampToValueAtTime(qdb(f, k), tt + tr);
        lastF[k] = f;
      }
    };
    /** One consonant segment at ts lasting d (same automation as the speaking voice). */
    const seg = (sg, ts, d) => {
      const tr = Math.min(0.03, d * 0.45),
        tail = ts + d;
      setF(sg.F, ts, tr);
      const va = sg.v * (sg.nasal ? 0.9 : 1);
      vG.gain.linearRampToValueAtTime(
        va,
        ts + (sg.burst ? 0.006 : Math.min(0.016, d * 0.5)),
      );
      vG.gain.setValueAtTime(va, Math.max(ts + 0.002, tail - 0.004));
      aG.gain.linearRampToValueAtTime(sg.a, ts + Math.min(0.012, d * 0.5));
      aG.gain.setValueAtTime(sg.a, Math.max(ts + 0.002, tail - 0.004));
      if (sg.fr) {
        frF.frequency.setValueAtTime(sg.fr[0] * Math.sqrt(fs), ts);
        frF.Q.setValueAtTime(sg.fr[1], ts);
        frG.gain.linearRampToValueAtTime(
          sg.fr[2] * 0.85,
          ts + (sg.burst ? 0.004 : Math.min(0.02, d * 0.5)),
        );
        frG.gain.linearRampToValueAtTime(
          sg.fr[2] * (sg.burst ? 0.3 : 0.85),
          Math.max(ts + 0.005, tail - 0.004),
        );
      } else {
        frG.gain.linearRampToValueAtTime(0, ts + Math.min(0.012, d * 0.5));
        frG.gain.setValueAtTime(0, Math.max(ts + 0.002, tail - 0.004));
      }
    };
    const api = {
      start: t0,
      /** Sing one syllable. The vowel starts at t and the syllable (coda included) ends at t + dur. */
      note(t, dur, midi, syl, vel, o) {
        if (disposed || !syl) return;
        o = o || {};
        vel = vel === undefined ? 1 : vel;
        const f = S.mtof(midi);
        const floor = Math.max(cursor, ctx.currentTime + 0.01);
        if (t + dur <= floor + 0.05) return; // too late to sing this one
        const Fa = VF[syl.v[0]] || VF.schwa,
          Fb = syl.v.length > 1 ? VF[syl.v[1]] || null : null;
        const onS = consSegs(syl.on, Fa),
          coS = consSegs(syl.co, Fb || Fa);
        const onD = onS.reduce((a, s) => a + s.d, 0);
        let start = t - onD,
          k = 1;
        if (start < floor) {
          k =
            onD > 0 ? Math.max(0.35, Math.min(1, (t + 0.03 - floor) / onD)) : 1;
          start = floor;
        }
        const legato =
          voiced && start - voicedUntil < 0.07 && o.legato !== false;
        // anchors (continuity with what is already scheduled)
        const fq = osc.frequency;
        vG.gain.setValueAtTime(legato ? api._lastV || 0 : 0, start);
        aG.gain.setValueAtTime(0, start);
        frG.gain.setValueAtTime(0, start);
        // a quick in-breath before a phrase
        if (o.breath && !voiced && start - floor > 0.32) {
          const bt = start - 0.3;
          for (let q = 0; q < 4; q++) {
            lastF[q] = VF.ae[q] * fs * (q ? 1.1 : 1);
            res[q].frequency.setValueAtTime(lastF[q], bt);
            res[q].Q.setValueAtTime(qdb(lastF[q], q), bt);
          }
          aG.gain.setValueAtTime(0, bt);
          aG.gain.linearRampToValueAtTime(0.05 + V.breath, bt + 0.12);
          aG.gain.linearRampToValueAtTime(0, bt + 0.26);
          aG.gain.setValueAtTime(0, start);
        }
        // pitch: portamento between legato notes, a crooner's scoop into detached ones
        if (legato && lastPitch) {
          fq.setValueAtTime(lastPitch, start);
          fq.linearRampToValueAtTime(f, Math.max(start + 0.02, t + 0.06));
        } else {
          fq.setValueAtTime(f * (o.scoop === false ? 1 : V.scoop), start);
          fq.linearRampToValueAtTime(f, t + (o.scoop === false ? 0.02 : 0.09));
        }
        // onset consonants
        let tt = start;
        for (const sg of onS) {
          const d = sg.d * k;
          seg(sg, tt, d);
          tt += d;
        }
        // vowel
        const end = t + dur;
        const coD0 = coS.reduce((a, s) => a + s.d, 0);
        const kc = coD0 > 0 ? Math.min(1, (dur * 0.35) / coD0) : 1;
        const vs = Math.max(tt, t - 0.01),
          vEnd = Math.max(vs + 0.05, end - coD0 * kc);
        const vl = vEnd - vs;
        setF(Fa, vs, Math.min(0.05, vl * 0.3));
        if (Fb)
          setF(Fb, vEnd - Math.min(0.14, vl * 0.35), Math.min(0.12, vl * 0.3));
        const v1 = vel * (syl.stressed ? 1 : 0.9);
        vG.gain.linearRampToValueAtTime(v1, vs + 0.035);
        if (vl > 0.6)
          vG.gain.linearRampToValueAtTime(v1 * 1.1, vEnd - 0.05); // held notes swell a little
        else vG.gain.setValueAtTime(v1, Math.max(vs + 0.036, vEnd - 0.004));
        aG.gain.linearRampToValueAtTime(V.breath, vs + 0.03);
        aG.gain.setValueAtTime(V.breath, Math.max(vs + 0.031, vEnd - 0.004));
        frG.gain.linearRampToValueAtTime(0, vs + 0.012);
        // vibrato blooms late on held notes
        const vb = Math.max(vs, vibCursor);
        vibG.gain.setValueAtTime(0, vb);
        if (vl > 0.32) {
          vibG.gain.setValueAtTime(0, vb + 0.14);
          vibG.gain.linearRampToValueAtTime(
            f * V.vib[1] * (o.vib || 1),
            Math.max(vb + 0.15, Math.min(vEnd, vb + 0.55)),
          );
          vibG.gain.setValueAtTime(
            f * V.vib[1] * (o.vib || 1),
            Math.max(vb + 0.16, vEnd),
          );
        }
        vibG.gain.linearRampToValueAtTime(0, Math.max(vb + 0.17, vEnd + 0.05));
        vibCursor = Math.max(vb + 0.18, vEnd + 0.06);
        // coda consonants
        tt = vEnd;
        for (const sg of coS) {
          const d = sg.d * kc;
          seg(sg, tt, d);
          tt += d;
        }
        const last = coS.length ? coS[coS.length - 1] : null;
        api._lastV = last ? last.v : v1;
        if (o.legato) {
          voiced = true;
          voicedUntil = tt;
          cursor = tt;
        } else {
          // release: a short jazz fall-off at phrase ends, then silence
          if (o.fall) fq.linearRampToValueAtTime(f * 0.93, tt + 0.1);
          vG.gain.linearRampToValueAtTime(0, tt + 0.07);
          aG.gain.linearRampToValueAtTime(0, tt + 0.05);
          frG.gain.linearRampToValueAtTime(0, tt + 0.03);
          voiced = false;
          voicedUntil = tt;
          cursor = tt + 0.1;
          api._lastV = 0;
        }
        lastPitch = f;
      },
      /** Stop singing and free the graph. */
      dispose(fade) {
        if (disposed) return;
        disposed = true;
        const t = ctx.currentTime,
          f = fade === undefined ? 0.1 : fade;
        try {
          out.gain.cancelScheduledValues(t);
          out.gain.setValueAtTime(out.gain.value, t);
          out.gain.linearRampToValueAtTime(0, t + f);
        } catch (e) {
          /* */
        }
        [osc, vib, jit, nz].forEach((s) => {
          try {
            s.stop(t + f + 0.05);
          } catch (e) {
            /* */
          }
        });
        setTimeout(
          () => {
            nodes.forEach((n) => {
              try {
                n.disconnect();
              } catch (e) {
                /* */
              }
            });
          },
          (f + 0.4) * 1000,
        );
      },
    };
    return api;
  }

  /** How long a syllable's onset consonants take (the composer shortens the previous legato note by it). */
  function onsetDur(syl) {
    return syl
      ? consSegs(syl.on, VF[syl.v[0]] || VF.schwa).reduce(
          (a, sg) => a + sg.d,
          0,
        )
      : 0;
  }

  // ==================================================================
  // VOX 2 — a sample-level cascade/parallel formant synthesiser (Klatt
  // 1980 / KLGLOTT88 lineage) with a real phonetic front end:
  //   · pronouncing LEXICON (ARPAbet, ~1,500 on-air words) + suffix
  //     stripping + the old spelling rules as a fallback,
  //   · Klatt's segmental DURATION rules (phrase-final lengthening,
  //     polysyllabic / non-final / unstressed shortening, post-vocalic
  //     voicing, clusters) on inherent/minimum durations per phone,
  //   · locus-equation FORMANT TRANSITIONS (place-dependent coarticulation,
  //     abrupt nasal/stop boundaries, smooth glides, velar pinch, vowel
  //     nasalisation before nasals),
  //   · stops as closure (voice bar) → place-shaped burst → aspiration
  //     whose formants are already moving into the vowel (VOT),
  //   · a glottal-flow-derivative source with open quotient, spectral
  //     tilt, jitter/shimmer, pitch-synchronous breath and phrase-final fry.
  // Every line is planned in JS (5 ms parameter frames) and rendered in
  // short chunks cut at silent frames, just ahead of the audio clock
  // (≈ 0.5 ms of main-thread time per 100 ms of speech at 16 kHz), then
  // played as AudioBuffers through the same mic EQ → station AM chain.
  // ==================================================================
