// play-inline-33 14 — data
// Lines 4086-4414 of readable/play-inline-33.pretty.js (statement-aligned).
  function voxWorkerMain() {
    const jobs = [],
      cancelled = new Set(),
      sing = new Map();
    let busy = false;
    function step() {
      const t = Date.now();
      while (jobs.length && Date.now() - t < 12) {
        const j = jobs[0];
        if (cancelled.has(j.id)) {
          jobs.shift();
          continue;
        }
        if (j.kind === "line") {
          const m = j.m,
            st = j.st,
            last = m.n - 1;
          if (st.f >= last) {
            jobs.shift();
            self.postMessage({ id: j.id, done: true });
            continue;
          }
          const from = st.f,
            cut = cutFrame(m, Math.min(last, from + 30), from + 120);
          const data = renderXF(m, st, cut, from > 0);
          if (!data.length) {
            jobs.shift();
            self.postMessage({ id: j.id, done: true });
            continue;
          }
          self.postMessage({ id: j.id, from, data }, [data.buffer]);
          if (jobs.length > 1) jobs.push(jobs.shift()); // round robin: sung notes interleave with long speeches
        } else {
          jobs.shift();
          const sg = sing.get(j.id);
          if (!sg) continue;
          const q = j.q,
            m = sg.m,
            st = sg.st;
          if (st.f < q.fa) {
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
          self.postMessage({ id: j.id, from: q.startF, data }, [data.buffer]);
        }
      }
      if (jobs.length) setTimeout(step, 0);
      else busy = false;
    }
    self.onmessage = (ev) => {
      const d = ev.data;
      if (d.op === "line") {
        d.st.c = new Float64Array(d.st.c);
        jobs.push({ kind: "line", id: d.id, m: d.m, st: d.st });
      } else if (d.op === "singer")
        sing.set(d.id, { m: d.m, st: klattState(d.m, d.seed) });
      else if (d.op === "note") jobs.push({ kind: "note", id: d.id, q: d.q });
      else if (d.op === "cancel") {
        cancelled.add(d.id);
        sing.delete(d.id);
      }
      if (!busy && jobs.length) {
        busy = true;
        setTimeout(step, 0);
      }
    };
  }
  const VW = { w: null, failed: false, h: new Map(), id: 0, chunks: 0 };
  function voxWorker() {
    if (VW.failed) return null;
    if (VW.w) return VW.w;
    try {
      if (!window.Worker || !window.Blob || !window.URL)
        throw new Error("no Worker");
      const src = [
        '"use strict";',
        "const NP = " + NP + ", XF = " + XF + ";",
        "const iF0 = 0, iAV = 1, iAVS = 2, iAH = 3, iAF = 4, iF1 = 5, iF2 = 6, iF3 = 7, iF4 = 8, iB1 = 9, iB2 = 10, iB3 = 11, iFNZ = 12, iA2 = 13, iA3 = 14, iA4 = 15, iA5 = 16, iA6 = 17, iAB = 18, iTL = 19, iFRY = 20;",
        klattState.toString(),
        klattRender.toString(),
        cloneSt.toString(),
        renderXF.toString(),
        cutFrame.toString(),
        "(" + voxWorkerMain.toString() + ")();",
      ].join("\n");
      const url = URL.createObjectURL(
        new Blob([src], { type: "text/javascript" }),
      );
      const w = new Worker(url);
      w.onmessage = (ev) => {
        const d = ev.data,
          h = VW.h.get(d.id);
        if (h) h(d);
      };
      w.onerror = (e) => {
        VW.failed = true;
        VW.w = null;
        try {
          w.terminate();
        } catch (x) {
          /* */
        }
        console.warn(
          "[sound] VOX render worker failed, rendering on the main thread:",
          e && e.message,
        );
        VW.h.forEach((h) => {
          try {
            h({ failed: true });
          } catch (x) {
            /* */
          }
        });
        VW.h.clear();
      };
      VW.w = w;
      return w;
    } catch (e) {
      VW.failed = true;
      return null;
    }
  }
  const isOffline = (ctx) => typeof ctx.startRendering === "function";

  const NORM2 = 1.0; // the renderer is calibrated to ≈ −20 dBFS RMS over active speech (record level at the chain)
  /**
   * VOX 2 speaker — same controller contract as the legacy formant voice:
   * {start, plannedEnd, end, stopped, pump(untilCtxTime), stop(fade)}.
   * Rendering: first ≈ 0.45 s on the main thread, the rest in the VOX worker (see above); without a worker,
   * pump() renders the next chunks (cut at silent frames) ~2 s ahead of the audio clock.
   */
  function say2(ctx, dest, text, profileId, opts) {
    opts = opts || {};
    const P = PROFILES[profileId] || PROFILES.announcer;
    const rnd = opts.rng || Math.random;
    const pl = plan2(text, profileId, rnd, opts.drop);
    const m = pl.m;
    if (opts.pitch && opts.pitch !== 1)
      for (let f = 0; f < m.n; f++) m.p[f * NP + iF0] *= opts.pitch;
    const st = klattState(m, (rnd() * 4294967296) >>> 0);
    const t0 = Math.max(ctx.currentTime + 0.05, opts.start || 0);
    const nodes = [];
    const mk = (n) => {
      nodes.push(n);
      return n;
    };
    const warm = mk(bq(ctx, "lowshelf", 220, 0.7, P.warmth * 0.6));
    const hp = mk(bq(ctx, "highpass", 80, 0.7));
    const pres = mk(bq(ctx, "peaking", 2500, 1.1, 5.5)); // ribbon-mic presence (consonant clarity through the AM band)
    const out = mk(ctx.createGain());
    out.gain.value = (opts.gain === undefined ? 1 : opts.gain) * P.gain * NORM2;
    warm.connect(hp);
    hp.connect(pres);
    pres.connect(out);
    out.connect(dest);
    const plannedEnd = t0 + pl.dur;
    const srcs = new Set();
    let freed = false,
      wid = 0,
      wDone = false,
      wTo = 0;
    const free = () => {
      if (freed) return;
      freed = true;
      if (wid) VW.h.delete(wid);
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
    };
    const last = m.n - 1;
    const maybeFree = () => {
      if ((wid ? wDone : st.f >= last) && !srcs.size && !ctl.stopped) {
        ctl.stopped = true;
        free();
      }
    };
    const sched = (data, from) => {
      const at = t0 + from * FR,
        now = ctx.currentTime;
      if (at + data.length / VSR <= now + 0.01) return; // hopelessly late (suspended tab): skip
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
        maybeFree();
      };
    };
    const renderSync = (until, budgetFrames) => {
      const want = Math.min(last, Math.ceil((until - t0) / FR));
      const all = until - ctx.currentTime > 30,
        hard = Math.ceil((ctx.currentTime - t0 + 0.6) / FR),
        f00 = st.f;
      let guard = 0;
      while (
        st.f < want &&
        guard++ < 400 &&
        (all || st.f - f00 < budgetFrames || st.f < hard)
      ) {
        const from = st.f;
        const cut = cutFrame(m, Math.min(last, from + 30), from + 120); // 150 … 600 ms chunks, preferably cut in silence
        const data = renderXF(m, st, cut, from > 0);
        if (!data.length) break;
        sched(data, from);
      }
    };
    const ctl = {
      start: t0,
      plannedEnd,
      end: plannedEnd,
      stopped: false,
      phrases: pl.plans.map((p) => ({ t0: t0 + p.t0, t1: t0 + p.t1 })),
      drops: pl.drops.map((d) => ({ t0: t0 + d.t0, t1: t0 + d.t1 })),
      words: pl.words.map((w) => (w ? { t0: t0 + w.t0, t1: t0 + w.t1 } : null)),
      pump(until) {
        if (ctl.stopped) return true;
        if (wid) return wDone;
        renderSync(until + 2.0, 140); // no worker: keep ≈ 2 s rendered ahead, ≈ 0.7 s of speech per call
        return st.f >= last;
      },
      stop(fade) {
        if (ctl.stopped) return;
        ctl.stopped = true;
        if (wid && VW.w) {
          try {
            VW.w.postMessage({ op: "cancel", id: wid });
          } catch (e) {
            /* */
          }
        }
        const t = ctx.currentTime,
          f = fade === undefined ? 0.08 : fade;
        try {
          out.gain.cancelScheduledValues(t);
          out.gain.setValueAtTime(out.gain.value, t);
          out.gain.linearRampToValueAtTime(0, t + f);
        } catch (e) {
          /* */
        }
        srcs.forEach((s) => {
          try {
            s.stop(t + f + 0.02);
          } catch (e) {
            /* */
          }
        });
        setTimeout(free, (f + 0.3) * 1000);
      },
    };
    // head of the line on the main thread (plays immediately), the rest in the worker
    renderSync(t0 + (opts.head || 0.45), 1e9); // opts.head: a shorter synchronous head (NPC barks start a little later)
    const w = !isOffline(ctx) && st.f < last ? voxWorker() : null;
    if (w) {
      wid = ++VW.id;
      VW.h.set(wid, (d) => {
        if (ctl.stopped) return;
        if (d.failed) {
          // worker died: finish on the main thread from the last delivered frame
          wid = 0;
          const s2 = klattState(m, st.seed);
          s2.f = Math.max(st.f, wTo);
          Object.assign(st, s2);
          renderSync(ctx.currentTime + 2, 1e9);
          return;
        }
        if (d.done) {
          wDone = true;
          maybeFree();
          return;
        }
        VW.chunks++;
        wTo = Math.max(wTo, d.from + Math.round(d.data.length / HOP) - XF);
        sched(d.data, d.from);
      });
      const mm = Object.assign({}, m); // structured clone of the frame table + scalars
      const s2 = cloneSt(st);
      s2.c = s2.c.buffer.slice(0);
      w.postMessage({ op: "line", id: wid, m: mm, st: s2 });
    }
    return ctl;
  }
  /** For each space-separated token of `text`, how many VOX words it becomes (numbers are spelled out, hyphens split). */
  function tokenWords(text) {
    return String(text)
      .split(" ")
      .map(
        (tok) =>
          tok
            .replace(/(\d),(\d{3})/g, "$1$2")
            .replace(/[“”"()]/g, "")
            .replace(/[’']/g, "'")
            .replace(/(\d+)/g, (x) => " " + spellNumber(x) + " ")
            .replace(/-/g, " ")
            .toLowerCase()
            .split(/\s+/)
            .map((w) => w.replace(/[^a-z']/g, ""))
            .filter((w) => /[a-z]/.test(w)).length,
      );
  }
  /** Offline helper for tests: render a whole line to a Float32Array at VSR. */
