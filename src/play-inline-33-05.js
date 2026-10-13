// play-inline-33 05 — gain
// Lines 1234-1563 of readable/play-inline-33.pretty.js (statement-aligned).
  function say(ctx, dest, text, profileId, opts) {
    opts = opts || {};
    const P = PROFILES[profileId] || PROFILES.announcer;
    const rnd = opts.rng || Math.random;
    const t0 = Math.max(ctx.currentTime + 0.05, opts.start || 0);
    const plans = plan(text, profileId, rnd);
    const fs = P.fs * (opts.formantScale || 1);
    const pitch = (opts.pitch || 1) * P.f0 * (0.97 + rnd() * 0.06);
    const nodes = [];
    const mk = (n) => {
      nodes.push(n);
      return n;
    };
    // sources
    const osc = mk(ctx.createOscillator());
    osc.setPeriodicWave(S.wave(ctx, "glottal"));
    osc.frequency.value = pitch;
    const vib = mk(ctx.createOscillator());
    vib.frequency.value = 5.2 + rnd() * 0.8;
    const vibG = mk(ctx.createGain());
    vibG.gain.value = pitch * P.vib;
    vib.connect(vibG);
    vibG.connect(osc.frequency);
    const jit = mk(ctx.createBufferSource());
    jit.buffer = S.noiseBufs.pink;
    jit.loop = true;
    jit.playbackRate.value = 0.3;
    const jitF = mk(bq(ctx, "lowpass", 40, 0.5));
    const jitG = mk(ctx.createGain());
    jitG.gain.value = pitch * 0.05;
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
    // cascade resonators
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
    // frication branch (parallel)
    const frF = mk(bq(ctx, "bandpass", 5000, 2));
    const frG = mk(ctx.createGain());
    frG.gain.value = 0;
    nz.connect(frF);
    frF.connect(frG);
    // lip radiation (+6 dB/oct-ish) + mic warmth + presence, then the line gain
    const lipRad = mk(bq(ctx, "highshelf", 1200, 0.7, 7));
    const warm = mk(bq(ctx, "lowshelf", 220, 0.7, P.warmth));
    const hp = mk(bq(ctx, "highpass", 85, 0.7));
    const pres = mk(bq(ctx, "peaking", 2600, 1.2, 3));
    const line = mk(ctx.createGain());
    line.gain.value = 0;
    // NORM: the cascade has ~+20 dB of resonance gain; this brings a line to ≈ −20 dBFS RMS (record level at the chain)
    const out = mk(ctx.createGain());
    out.gain.value = (opts.gain === undefined ? 1 : opts.gain) * P.gain * NORM;
    res[3].connect(lipRad);
    frG.connect(lipRad);
    lipRad.connect(warm);
    warm.connect(hp);
    hp.connect(pres);
    pres.connect(line);
    line.connect(out);
    out.connect(dest);
    [osc, vib, jit, nz].forEach((s) =>
      s.start(t0 - 0.02, s === nz || s === jit ? rnd() * 2 : 0),
    );
    line.gain.setValueAtTime(0, t0 - 0.02);
    line.gain.linearRampToValueAtTime(1, t0 + 0.02);

    // --- phrase timing
    const starts = [];
    let cur = t0;
    for (const p of plans) {
      starts.push(cur);
      cur += p.dur + p.pause + (p.breath ? 0.18 * P.pause : 0);
    }
    const plannedEnd = cur;
    let next = 0;
    // JS-side mirror of the automated values (AudioParam.value is stale when scheduling ahead)
    const lastF = VF.schwa.map((f) => f * fs);
    let lastPitch = pitch;
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
    function schedulePhrase(i) {
      const p = plans[i],
        T0 = starts[i];
      // anchor every automated param at the phrase start (continuity from the previous phrase)
      vG.gain.setValueAtTime(0, T0);
      aG.gain.setValueAtTime(0, T0);
      frG.gain.setValueAtTime(0, T0);
      for (const sg of p.segs) {
        const ts = T0 + sg.t,
          tr = Math.min(0.035, sg.d * 0.45),
          tail = ts + sg.d;
        setF(sg.F, ts, tr);
        if (sg.F2) setF(sg.F2, ts + sg.d * 0.45, sg.d * 0.5); // diphthong glide
        const va = sg.v * (sg.nasal ? 0.9 : 1);
        vG.gain.linearRampToValueAtTime(va, ts + (sg.burst ? 0.006 : 0.016));
        vG.gain.setValueAtTime(va, tail - 0.004);
        aG.gain.linearRampToValueAtTime(sg.a, ts + 0.012);
        aG.gain.setValueAtTime(sg.a, tail - 0.004);
        if (sg.fr) {
          frF.frequency.setValueAtTime(sg.fr[0] * Math.sqrt(fs), ts);
          frF.Q.setValueAtTime(sg.fr[1], ts);
          frG.gain.linearRampToValueAtTime(
            sg.fr[2],
            ts + (sg.burst ? 0.004 : 0.022),
          );
          frG.gain.linearRampToValueAtTime(
            sg.fr[2] * (sg.burst ? 0.35 : 1),
            tail - 0.004,
          );
        } else {
          frG.gain.linearRampToValueAtTime(0, ts + 0.012);
          frG.gain.setValueAtTime(0, tail - 0.004);
        }
      }
      const pe = T0 + p.dur;
      vG.gain.linearRampToValueAtTime(0, pe + 0.04);
      aG.gain.linearRampToValueAtTime(0, pe + 0.03);
      frG.gain.linearRampToValueAtTime(0, pe + 0.02);
      // intonation
      const fq = osc.frequency;
      fq.setValueAtTime(lastPitch, T0 - 0.01);
      for (const pt of p.f0) {
        lastPitch = pitch * pt[1];
        fq.linearRampToValueAtTime(lastPitch, T0 + pt[0]);
      }
      // phrase-final creak (vocal fry): the glottal pulse goes irregular as the pitch falls away
      if (P.fry && (p.end === "." || p.end === "…")) {
        const fs0 = Math.max(T0, pe - 0.16);
        jitG.gain.setValueAtTime(pitch * 0.05, fs0);
        jitG.gain.linearRampToValueAtTime(pitch * (0.05 + 0.13 * P.fry), pe);
        jitG.gain.linearRampToValueAtTime(pitch * 0.05, pe + 0.08);
      }
      // audible in-breath before the next sentence (studio mic)
      if (p.breath && i < plans.length - 1) {
        const bt = pe + p.pause * 0.55;
        for (let k = 0; k < 4; k++) {
          lastF[k] = VF.ae[k] * fs * (k ? 1.1 : 1);
          res[k].frequency.setValueAtTime(lastF[k], bt);
          res[k].Q.setValueAtTime(qdb(lastF[k], k), bt);
        }
        aG.gain.setValueAtTime(0, bt);
        aG.gain.linearRampToValueAtTime(0.09 + P.breath * 0.4, bt + 0.12);
        aG.gain.linearRampToValueAtTime(0, bt + 0.26);
      }
    }
    const ctl = {
      start: t0,
      plannedEnd,
      end: plannedEnd,
      stopped: false,
      /** Schedule every phrase that starts before `until` (ctx time). Returns true when all phrases are scheduled. */
      pump(until) {
        while (next < plans.length && starts[next] < until) {
          try {
            schedulePhrase(next);
          } catch (e) {
            G.reportError("sound:vox", e);
          }
          next++;
        }
        return next >= plans.length;
      },
      stop(fade) {
        if (ctl.stopped) return;
        ctl.stopped = true;
        const t = ctx.currentTime,
          f = fade === undefined ? 0.08 : fade;
        try {
          line.gain.cancelScheduledValues(t);
          line.gain.setValueAtTime(line.gain.value, t);
          line.gain.linearRampToValueAtTime(0, t + f);
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
          (f + 0.3) * 1000,
        );
      },
    };
    // fade the line out at its natural end and free the graph
    line.gain.setValueAtTime(1, plannedEnd - 0.02);
    line.gain.linearRampToValueAtTime(0, plannedEnd + 0.05);
    [osc, vib, jit, nz].forEach((s) => s.stop(plannedEnd + 0.1));
    osc.onended = () => {
      if (!ctl.stopped) {
        ctl.stopped = true;
        nodes.forEach((n) => {
          try {
            n.disconnect();
          } catch (e) {
            /* */
          }
        });
      }
    };
    ctl.pump(t0 + 1.6);
    return ctl;
  }

  // ==================================================================
  // SINGING — the same formant tract, driven by a melody instead of an
  // intonation contour. The composers in 40_songs.js turn lyric lines into
  // sung syllables (syllables()), give every syllable a note, and call
  // singer.note() bar by bar, just ahead of the audio clock:
  //   · onset consonants are sung *before* the beat so the vowel lands on it,
  //   · the vowel is sustained for the note (pure vowel; a diphthong glides
  //     only at the very end, the way trained singers do),
  //   · crooner scoop into detached notes, portamento between legato ones,
  //   · delayed vibrato that blooms on held notes, a small swell, a jazz
  //     fall-off at phrase ends and an audible breath before each phrase,
  //   · coda consonants close the note.
  // A girl-group chorus is several singers (detuned, slightly late, with
  // different tract lengths) singing the same syllables.
  // ==================================================================
  const PREFIX = /^(be|re|de|a|con|pro|com|in|un|en|ex|dis)/;
  /** Lyric text → sung syllables [{on:[phone], v:[vowel(s)], co:[phone], stressed, word, wordEnd}] */
  function syllables(text) {
    const out = [];
    const words = String(text)
      .toLowerCase()
      .replace(/[’']/g, "'")
      .replace(/(\d+)/g, (x) => " " + spellNumber(x) + " ")
      .replace(/-/g, " ")
      .split(/\s+/)
      .map((w) => w.replace(/[^a-z']/g, ""))
      .filter(Boolean);
    words.forEach((w, wi) => {
      const ph = singPhones(w);
      const func = FUNC.has(w) && words.length > 1;
      const nuc = [];
      ph.forEach((p, i) => {
        if (p.k !== "C") nuc.push(i);
      });
      const nv = nuc.length;
      let stressIdx = nuc.findIndex((i) => ph[i].st === 1);
      if (stressIdx < 0)
        stressIdx = nv >= 2 && PREFIX.test(w) && w.length > 4 ? 1 : 0;
      for (let s = 0; s < nv; s++) {
        const i = nuc[s],
          prevN = s ? nuc[s - 1] : -1,
          nextN = s < nv - 1 ? nuc[s + 1] : ph.length;
        // onset = consonants since the previous nucleus (a cluster of two or more gives its first one to the previous coda)
        const onStart = s > 0 && i - prevN - 1 >= 2 ? prevN + 2 : prevN + 1;
        const on = ph.slice(onStart, i).map((p) => p.p);
        const co =
          s === nv - 1
            ? ph.slice(i + 1).map((p) => p.p)
            : nextN - i - 1 >= 2
              ? [ph[i + 1].p]
              : [];
        out.push({
          on,
          v: ph[i].v,
          co,
          stressed: !func && s === stressIdx,
          word: wi,
          wordEnd: s === nv - 1,
        });
      }
    });
    return out;
  }

  const SING = {
    // a relaxed baritone crooner
    male: {
      fs: 1.0,
      breath: 0.035,
      vib: [5.3, 0.012],
      gain: 1.0,
      warmth: 5,
      scoop: 0.95,
    },
    // a bright alto / girl-group lead
    female: {
      fs: 1.17,
      breath: 0.05,
      vib: [5.8, 0.014],
      gain: 0.86,
      warmth: 2,
      scoop: 0.962,
    },
  };
  const SING_NORM = 0.72; // sustained vowels are denser than speech: keep a sung line level with a spoken one

  /** Consonant cluster → timed tract segments (the same model the speaking voice uses). */
