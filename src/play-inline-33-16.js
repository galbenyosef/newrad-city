// play-inline-33 16 — math
// Lines 4549-4981 of readable/play-inline-33.pretty.js (statement-aligned).
  function singer2(ctx, dest, opts) {
    opts = opts || {};
    const V = SING2[opts.voice] || SING2.male;
    const fs = V.fs * (opts.fs || 1),
      det = Math.pow(2, (opts.detune || 0) / 1200);
    const P = { rate: 1, breath: V.breath * (opts.breath || 1), tilt: V.tilt };
    const vibRateK = opts.vibRate || 0.96 + Math.random() * 0.08; // every singer of a group has her own vibrato
    // frame timeline anchored on the context's sample grid
    const t0 =
      Math.ceil(
        Math.max(ctx.currentTime + 0.02, opts.start || 0) * ctx.sampleRate,
      ) / ctx.sampleRate;
    const m = {
      sr: VSR,
      hop: HOP,
      np: NP,
      n: 0,
      off: 0,
      p: new Float32Array(0),
      f5: (V.sf ? 3350 : 3750) * fs,
      f6: 4700 * Math.sqrt(fs),
      oq: V.oq,
      jitter: V.jitter,
      shimmer: V.shimmer,
      gain: 1,
      pe: 1.8,
      ta: 0.00016,
    };
    const st = klattState(m, (Math.random() * 4294967296) >>> 0);
    const nodes = [];
    const mk = (n) => {
      nodes.push(n);
      return n;
    };
    const warm = mk(bq(ctx, "lowshelf", 220, 0.7, V.warmth * 0.6));
    const hp = mk(bq(ctx, "highpass", 90, 0.7));
    const pres = mk(bq(ctx, "peaking", 2800, 1.1, V.pres)); // ribbon-mic presence (the crooner's own singer's formant does the rest)
    const out = mk(ctx.createGain());
    out.gain.value =
      (opts.gain === undefined ? 1 : opts.gain) * V.gain * SING_NORM;
    warm.connect(hp);
    hp.connect(pres);
    pres.connect(out);
    const oscs = [];
    if (opts.ensemble) {
      // ensemble chorus for doubled parts: a slowly modulated 10–18 ms copy (two throats never sit on one pitch/time)
      const cd = mk(ctx.createDelay(0.05));
      cd.delayTime.value = 0.011 + Math.random() * 0.006;
      const lfo = mk(ctx.createOscillator());
      lfo.frequency.value = 0.3 + Math.random() * 0.4;
      const lg = mk(ctx.createGain());
      lg.gain.value = 0.0024;
      lfo.connect(lg);
      lg.connect(cd.delayTime);
      const cg = mk(ctx.createGain());
      cg.gain.value = 0.5;
      pres.connect(cd);
      cd.connect(cg);
      cg.connect(out);
      try {
        lfo.start();
        oscs.push(lfo);
      } catch (e) {
        /* */
      }
    }
    if (opts.delay) {
      const dl = mk(ctx.createDelay(0.2));
      dl.delayTime.value = opts.delay;
      out.connect(dl);
      dl.connect(dest);
    } else out.connect(dest);
    // echo-chamber send (shared per destination)
    const plateK = opts.plate === undefined ? V.plate : opts.plate;
    if (plateK > 0) {
      try {
        const sd = mk(ctx.createGain());
        sd.gain.value = plateK;
        out.connect(sd);
        sd.connect(vocalPlate(ctx, dest));
      } catch (e) {
        /* no convolver: dry */
      }
    }
    const srcs = new Set();
    const queue = []; // planned notes waiting to be rendered: {fa, fb, p (frames fa..fb+XF)}
    let cursor = t0,
      lastPitch = 0,
      voiced = false,
      voicedUntil = 0,
      disposed = false,
      prevSeg = null,
      lastV = 0,
      vibPh = 0,
      planF = 0,
      wob = 0;
    const sched = (data, fa, fadeIn) => {
      const at = t0 + fa * FR,
        now = ctx.currentTime;
      if (at + data.length / VSR <= now + 0.01) return;
      const buf = ctx.createBuffer(1, data.length, VSR);
      if (buf.copyToChannel) buf.copyToChannel(data, 0);
      else buf.getChannelData(0).set(data);
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.connect(warm);
      if (at < now) src.start(now, now - at);
      else src.start(at);
      srcs.add(src);
      src.onended = () => {
        srcs.delete(src);
        try {
          src.disconnect();
        } catch (e) {
          /* */
        }
      };
    };
    // sung notes render in the VOX worker (continuous synth state per singer there); main-thread pump as fallback
    let sid = 0;
    const wk = !isOffline(ctx) ? voxWorker() : null;
    if (wk) {
      sid = ++VW.id;
      VW.h.set(sid, (d) => {
        if (disposed) return;
        if (d.failed) {
          sid = 0;
          return;
        }
        if (d.data) sched(d.data, d.from, false);
      });
      const mm = Object.assign({}, m);
      mm.p = new Float32Array(0);
      wk.postMessage({ op: "singer", id: sid, m: mm, seed: st.seed });
    }
    const api = {
      start: t0,
      _pump(until) {
        if (disposed) return;
        const lim = until === undefined ? ctx.currentTime + 0.5 : until;
        while (queue.length && t0 + queue[0].fa * FR < lim) {
          const q = queue.shift();
          if (st.f < q.fa) {
            // a long silence between phrases: start fresh there (the tract has rung out)
            const s2 = klattState(m, st.seed);
            s2.f = q.fa;
            Object.assign(st, s2);
            st.fresh = true;
          }
          m.p = q.p;
          m.off = q.pa;
          m.n = q.pn;
          const data = renderXF(m, st, q.fb, !st.fresh && q.fa > 0);
          st.fresh = false;
          sched(data, q.startF, false);
        }
      },
      /** Sing one syllable. The vowel starts at t and the syllable (coda included) ends at t + dur. */
      note(t, dur, midi, syl, vel, o) {
        if (disposed || !syl) return;
        o = o || {};
        vel = vel === undefined ? 1 : vel;
        const f = S.mtof(midi) * det;
        const floor = Math.max(cursor, ctx.currentTime + 0.01);
        if (t + dur <= floor + 0.05) return;
        // onset / coda timing exactly as the composer expects (legacy onsetDur), phones from the lexicon
        const Fa = VF[syl.v[0]] || VF.schwa;
        const onOld = consSegs(syl.on, Fa),
          coOld = consSegs(syl.co, VF[syl.v[syl.v.length - 1]] || Fa);
        const onD = onOld.reduce((a, s) => a + s.d, 0);
        let start = t - onD,
          k = 1;
        if (start < floor) {
          k =
            onD > 0 ? Math.max(0.35, Math.min(1, (t + 0.03 - floor) / onD)) : 1;
          start = floor;
        }
        const legato =
          voiced && start - voicedUntil < 0.07 && o.legato !== false;
        const end = t + dur;
        const coD0 = coOld.reduce((a, s) => a + s.d, 0);
        const kc = coD0 > 0 ? Math.min(1, (dur * 0.35) / coD0) : 1;
        // segments (times relative to t0)
        const segs = [];
        if (prevSeg && legato) segs.push(prevSeg);
        // an audible breath before a phrase (when there's room): the singer fills her lungs
        const brD =
          o.breath && !legato && start - 0.26 > floor
            ? 0.2 + Math.random() * 0.05
            : 0;
        if (brD) {
          start -= brD + 0.02;
          segs.push({ p: "BR", k: { c: "BR" }, t: start - t0, d: brD, st: -1 });
        }
        let tt = start - t0 + (brD ? brD + 0.02 : 0);
        const pushC = (list, scale) => {
          for (const ph of list) {
            const kp = KP[OLD2K[ph] || ph];
            if (!kp) continue;
            const d0 = (kp.di / 1000) * 0.75 * scale;
            if (kp.c === "S" || kp.c === "A") {
              const bd = kp.pl === "vel" ? 0.014 : 0.01,
                asp = kp.vc ? 0.006 : 0.025 * scale;
              const cl = Math.max(0.02, d0 - bd - asp);
              segs.push({ p: ph, k: kp, sub: "cl", t: tt, d: cl, st: -1 });
              tt += cl;
              segs.push({ p: ph, k: kp, sub: "bu", t: tt, d: bd, st: -1 });
              tt += bd;
              segs.push({
                p: ph,
                k: kp,
                sub: "as",
                t: tt,
                d: asp,
                st: -1,
                strong: true,
              });
              tt += asp;
            } else {
              segs.push({ p: OLD2K[ph] || ph, k: kp, t: tt, d: d0, st: -1 });
              tt += d0;
            }
          }
        };
        // fit the onset exactly into [start, t)
        const onPh = [].concat(syl.on);
        const onNominal = onPh.reduce((a, ph) => {
          const kp = KP[OLD2K[ph] || ph];
          return a + (kp ? (kp.di / 1000) * 0.75 : 0);
        }, 0);
        pushC(
          onPh,
          onNominal > 0
            ? Math.max(0.2, (t - start - (brD ? brD + 0.02 : 0)) / onNominal)
            : 1,
        );
        const vs = Math.max(tt, t - t0 - 0.01);
        const coPh = [].concat(syl.co);
        const coNominal = coPh.reduce((a, ph) => {
          const kp = KP[OLD2K[ph] || ph];
          return a + (kp ? (kp.di / 1000) * 0.75 : 0);
        }, 0);
        const coLen = coD0 * kc;
        const vEnd = Math.max(vs + 0.05, end - t0 - coLen);
        const vk = KP[oldV2K(syl.v)] || KP.AX;
        const vl = vEnd - vs;
        const vSeg = {
          p: oldV2K(syl.v),
          k: vk,
          t: vs,
          d: vl,
          st: syl.stressed ? 1 : 0,
          av: vel * (syl.stressed ? 1 : 0.9),
          glide: vk.F2t
            ? [Math.max(0.05, 1 - Math.min(0.14, vl * 0.35) / vl - 0.02), 0.97]
            : null,
        };
        segs.push(vSeg);
        tt = vEnd;
        pushC(coPh, coNominal > 0 ? Math.max(0.2, coLen / coNominal) : 1);
        const segEnd = tt;
        if (!o.legato)
          segs.push({ p: "PAU", k: { c: "PAU" }, t: segEnd, d: 0.12, st: -1 });
        // frames for this note: [fa, fb) + XF tail frames
        const prevFb = queue.length
          ? queue[queue.length - 1].fb
          : Math.max(st.f, planF);
        let fa = Math.max(prevFb, Math.round((start - t0) / FR));
        const bridge = fa - prevFb <= 40 && prevFb > 0; // short rests are rendered (continuous state), long ones skipped
        if (bridge) fa = prevFb;
        const fb = Math.max(
          fa + 2,
          Math.round((o.legato ? segEnd : segEnd + 0.09) / FR),
        );
        const pa = fa,
          pn = fb - fa + XF + 2;
        const tr = [];
        for (let i = 0; i < NP; i++) tr.push(new Track());
        if (!legato)
          [iAV, iAVS, iAH, iAF].forEach((i) => tr[i].add(fa * FR, 0)); // a detached note starts from silence
        segTracks(segs, P, tr);
        tr[iFNZ].add(0, 270);
        const p = new Float32Array(pn * NP);
        for (let i = 0; i < NP; i++) if (i !== iF0) tr[i].fill(p, i, pn, pa);
        // pitch: portamento between legato notes, scoop into detached ones, delayed vibrato, swell, fall-off
        const tS = start - t0 + (brD ? brD + 0.02 : 0),
          tV = vs,
          tE = vEnd,
          scoopEnd = t - t0 + (o.scoop === false ? 0.02 : 0.09);
        const pStart =
          legato && lastPitch
            ? lastPitch
            : f * (o.scoop === false ? 1 : V.scoop);
        const vibD = f * V.vib[1] * (o.vib || 1) * (0.85 + Math.random() * 0.3),
          vibRate = V.vib[0] * vibRateK;
        // vibrato develops: none for ~160 ms, an S-curve bloom over ~300 ms, the rate settling up from 90 %
        const vDel = 0.16,
          vGrow = Math.max(0.12, Math.min(0.32, vl * 0.45));
        const sstep = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
        for (let i = 0; i < pn; i++) {
          const tf = (pa + i) * FR,
            q = i * NP;
          let pf = f;
          if (tf < scoopEnd)
            pf =
              pStart +
              (f - pStart) * sstep((tf - tS) / Math.max(0.02, scoopEnd - tS)); // smooth portamento / scoop
          if (o.fall && tf > tE) pf *= 1 - 0.07 * Math.min(1, (tf - tE) / 0.1);
          let env = vl > 0.3 ? sstep((tf - tV - vDel) / vGrow) : 0;
          if (tf > tE) env *= Math.max(0, 1 - (tf - tE) / 0.05);
          vibPh += 2 * Math.PI * vibRate * (0.9 + 0.1 * env) * FR;
          wob = wob * 0.96 + (Math.random() - 0.5) * 0.0011; // slow pitch wander (a human never holds dead-still)
          const sv = Math.sin(vibPh);
          p[q + iF0] = pf * (1 + wob) + vibD * env * sv;
          // held notes swell a little; amplitude vibrato rides with the pitch vibrato (source-formant interaction)
          if (vl > 0.6 && tf > tV && tf < tE)
            p[q + iAV] *= 1 + (0.1 * (tf - tV)) / vl;
          if (env > 0) p[q + iAV] *= 1 + 0.06 * env * sv;
          // sung-vowel formants: open jaw (F1↑), F1 tuned above f0 on high notes, singer's-formant cluster (crooner)
          const voicedV = tf >= tV && tf <= tE;
          p[q + iF1] *= fs * (voicedV ? V.f1k : 1);
          p[q + iF2] *= fs;
          p[q + iF3] *= fs;
          if (voicedV && p[q + iF1] < pf * 1.1) p[q + iF1] = pf * 1.1;
          if (V.sf && voicedV && p[q + iF3] < 2550 * fs)
            p[q + iF3] += (2550 * fs - p[q + iF3]) * 0.4;
          p[q + iF4] = (V.sf ? 2950 : 3300) * fs;
          if (!(p[q + iB1] > 20)) p[q + iB1] = 80;
          if (!(p[q + iB2] > 20)) p[q + iB2] = 100;
          if (!(p[q + iB3] > 20)) p[q + iB3] = 150;
          if (!(p[q + iFNZ] > 100)) p[q + iFNZ] = 270;
          if (!(p[q + iTL] > 0)) p[q + iTL] = V.tilt;
          p[q + iFRY] = 0;
        }
        // the tail frames hold the last values (the crossfade blends them with whatever comes next)
        for (let i = fb - pa; i < pn; i++)
          p.copyWithin(i * NP, (fb - pa - 1) * NP, (fb - pa) * NP);
        const qn = { fa, fb, pa, pn, p, startF: fa };
        planF = fb;
        if (sid && VW.w) {
          try {
            VW.w.postMessage({ op: "note", id: sid, q: qn }, [p.buffer]);
          } catch (e) {
            sid = 0;
            queue.push(qn);
          }
        } else queue.push(qn);
        prevSeg = segs.filter((s) => s.k.c !== "PAU").pop() || null;
        if (o.legato) {
          voiced = true;
          voicedUntil = segEnd + t0;
          cursor = segEnd + t0;
        } else {
          voiced = false;
          voicedUntil = segEnd + t0;
          cursor = segEnd + t0 + 0.1;
          prevSeg = null;
        }
        lastPitch = f;
        if (queue.length) {
          live2.add(api);
          if (!pumpTimer) pumpTimer = setInterval(pumpAll, 100);
          if (t0 + fa * FR < ctx.currentTime + 0.25) api._pump();
        }
      },
      /** Render everything planned (offline renders). */
      flush() {
        api._pump(Infinity);
      },
      /** Stop singing and free the graph. */
      dispose(fade) {
        if (disposed) return;
        disposed = true;
        live2.delete(api);
        queue.length = 0;
        if (sid) {
          VW.h.delete(sid);
          if (VW.w) {
            try {
              VW.w.postMessage({ op: "cancel", id: sid });
            } catch (e) {
              /* */
            }
          }
        }
        const t = ctx.currentTime,
          f = fade === undefined ? 0.1 : fade;
        try {
          out.gain.cancelScheduledValues(t);
          out.gain.setValueAtTime(out.gain.value, t);
          out.gain.linearRampToValueAtTime(0, t + f);
        } catch (e) {
          /* */
        }
        srcs.forEach((s) => {
          try {
            s.stop(t + f + 0.05);
          } catch (e) {
            /* */
          }
        });
        oscs.forEach((s) => {
          try {
            s.stop(t + f + 0.3);
          } catch (e) {
            /* */
          }
        });
        setTimeout(
          () => {
            srcs.forEach((s) => {
              try {
                s.disconnect();
              } catch (e) {
                /* */
              }
            });
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

  /** Word → the singer's phone format (lexicon-driven), with stress. */
