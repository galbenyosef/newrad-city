// play-inline-23 03 — math
// Lines 720-993 of readable/play-inline-23.pretty.js (statement-aligned).
  function isLoopRec(rec) {
    return !!(rec.loop || rec.seamless || rec.exactLoop);
  }
  function normalize(buf, rec) {
    const chs = [];
    for (let c = 0; c < buf.numberOfChannels; c++)
      chs.push(buf.getChannelData(c));
    return normalizeArrays(
      chs,
      buf.sampleRate,
      rec.normRms || 0.25,
      isLoopRec(rec),
    );
  }

  /** Cut the silent tail of a one-shot buffer (saves memory: most recipes over-allocate for safety). */
  function trimTail(buf, rec) {
    if (rec.loop || rec.seamless || rec.exactLoop) return buf;
    const n = buf.length,
      chs = [];
    for (let c = 0; c < buf.numberOfChannels; c++)
      chs.push(buf.getChannelData(c));
    let pk = 0;
    for (const d of chs)
      for (let i = 0; i < n; i++) {
        const a = Math.abs(d[i]);
        if (a > pk) pk = a;
      }
    const thr = Math.max(1e-5, pk * 0.0012);
    let last = 0;
    for (const d of chs)
      for (let i = n - 1; i > last; i--)
        if (Math.abs(d[i]) > thr) {
          last = i;
          break;
        }
    const keep = Math.min(n, last + Math.floor(buf.sampleRate * 0.03));
    if (keep > n * 0.92) return buf;
    const out = newBuffer(buf.numberOfChannels, keep, buf.sampleRate);
    for (let c = 0; c < chs.length; c++) {
      const d = out.getChannelData(c);
      d.set(chs[c].subarray(0, keep));
      const fo = Math.min(keep >> 2, Math.floor(buf.sampleRate * 0.02));
      for (let i = 0; i < fo; i++) d[keep - 1 - i] *= i / fo;
    }
    return out;
  }
  S.trimTail = trimTail;

  // ------------------------------------------------------------------
  // Generation WORKER: all heavy JS sample synthesis (ambience beds, loops,
  // instrument multisamples) runs off the main thread. Modules register the
  // pure helper functions their generators need with S.workerLib(fn...).
  // Falls back to time-sliced main-thread generation if Workers fail.
  // ------------------------------------------------------------------
  S.workerLibs = [];
  S.workerLib = function () {
    for (const f of arguments) S.workerLibs.push(f.toString());
  };
  function mulberry(seed) {
    let a = seed >>> 0 || 1;
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function workerMain(e) {
    const j = e.data;
    try {
      let chans,
        k = 1;
      if (j.type === "gen") {
        const obj = eval("({" + j.src + "})"); // eslint-disable-line no-eval
        const gen = obj.gen,
          r = mulberry(j.seed);
        if (j.loop) {
          const fade = Math.floor(j.sr * 0.25),
            n = Math.floor(j.dur * j.sr) + fade,
            tmp = [];
          for (let c = 0; c < j.channels; c++) tmp.push(new Float32Array(n));
          gen(tmp, j.sr, r, n, j.v);
          chans = tmp.map((a) => loopifyArr(a, fade));
        } else {
          const n = Math.ceil(j.dur * j.sr);
          chans = [];
          for (let c = 0; c < j.channels; c++) chans.push(new Float32Array(n));
          gen(chans, j.sr, r, n, j.v);
        }
        if (j.norm) k = normalizeArrays(chans, j.sr, j.normRms, j.noFade);
      } else if (j.type === "ir") {
        chans = irArrays(j.o, j.sr, j.seed);
      } else if (j.type === "inst") {
        const f = new Function("m", "r", "return " + j.expr); // eslint-disable-line no-new-func
        const a = f(j.m, mulberry(j.seed));
        let pk = 0;
        for (let i = 0; i < a.length; i++) {
          const v = Math.abs(a[i]);
          if (v > pk) pk = v;
        }
        const kk = pk > 0 ? 0.9 / pk : 1;
        for (let i = 0; i < a.length; i++) a[i] *= kk;
        chans = [a];
      }
      postMessage(
        { id: j.id, chans, k },
        chans.map((a) => a.buffer),
      );
    } catch (err) {
      postMessage({ id: j.id, error: String((err && err.stack) || err) });
    }
  }
  function loopifyArr(s, fade) {
    const m = s.length - fade,
      d = new Float32Array(m);
    for (let i = 0; i < m; i++) d[i] = s[i];
    for (let i = 0; i < fade; i++) {
      const t = i / fade;
      d[i] = s[i] * Math.sqrt(t) + s[m + i] * Math.sqrt(1 - t);
    }
    return d;
  }
  const W = (S.worker = {
    w: null,
    failed: false,
    next: 1,
    pending: new Map(),
  });
  function ensureWorker() {
    if (W.w || W.failed) return W.w;
    try {
      if (!window.Worker || !window.Blob || !window.URL)
        throw new Error("no Worker");
      const src = [
        "'use strict';",
        "const SR = 32000; const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);",
        mulberry.toString(),
        loopifyArr.toString(),
        normalizeArrays.toString(),
        S.workerLibs.join("\n"),
        'const S = { biquad: typeof biquad !== "undefined" ? biquad : null, slowNoise: typeof slowNoise !== "undefined" ? slowNoise : null, mtof };',
        "onmessage = " + workerMain.toString() + ";",
      ].join("\n");
      const url = URL.createObjectURL(
        new Blob([src], { type: "text/javascript" }),
      );
      W.w = new Worker(url);
      W.w.onmessage = (ev) => {
        const d = ev.data,
          p = W.pending.get(d.id);
        if (!p) return;
        W.pending.delete(d.id);
        if (d.error) p.reject(new Error(d.error));
        else p.resolve(d);
      };
      W.w.onerror = (ev) => {
        S.warnOnce(
          "worker",
          "sound worker error, falling back to main thread: " +
            (ev && ev.message),
        );
        W.failed = true;
        try {
          W.w.terminate();
        } catch (e) {
          /* */
        }
        W.w = null;
        W.pending.forEach((p) => p.reject(new Error("worker failed")));
        W.pending.clear();
      };
    } catch (e) {
      W.failed = true;
      W.w = null;
      S.warnOnce(
        "worker",
        "sound worker unavailable (" +
          e.message +
          "), generating on main thread",
      );
    }
    return W.w;
  }
  /** Post a job to the generation worker. Resolves {chans:[Float32Array], k}. Rejects if the worker is unavailable. */
  S.job = function (msg) {
    const w = ensureWorker();
    if (!w) return Promise.reject(new Error("no worker"));
    return new Promise((resolve, reject) => {
      const id = W.next++;
      W.pending.set(id, { resolve, reject });
      msg.id = id;
      w.postMessage(msg);
    });
  };
  S.canUseWorker = function () {
    return !W.failed && !!(window.Worker && window.Blob);
  };

  // ------------------------------------------------------------------
  // Baking (offline rendering) queue — async, a couple at a time.
  // ------------------------------------------------------------------
  const bakeQ = [];
  const bakeState = {}; // name → 'queued'|'baking'|'done'|'failed'
  let baking = 0;
  S.bakeConcurrency = 2;
  S.requestBake = function (name, prio, bg) {
    const rec = S.R[name];
    if (!rec) return;
    if (bakeState[name] === "queued" && prio !== undefined) {
      // bump priority of a queued job
      const j = bakeQ.find((x) => x.name === name);
      if (j) j.bg = !!bg && j.bg;
      if (j && prio < j.prio) {
        j.prio = prio;
        bakeQ.sort((a, b) => a.prio - b.prio);
      }
      return;
    }
    if (bakeState[name]) return;
    bakeState[name] = "queued";
    bakeQ.push({
      name,
      prio: prio === undefined ? rec.priority : prio,
      bg: !!bg,
    });
    bakeQ.sort((a, b) => a.prio - b.prio);
    pump();
  };
  S.bakeState = bakeState;
  S.bakePromises = {};
  /** Run fn in an idle slot (or soon): keeps graph building out of busy frames. */
  const idle = (fn) => {
    if (window.requestIdleCallback && !G.SMOKE)
      window.requestIdleCallback(fn, { timeout: 400 });
    else setTimeout(fn, 12);
  };
  S.idle = idle;
  function pump() {
    while (baking < S.bakeConcurrency && bakeQ.length) {
      const job = bakeQ.shift();
      // background pre-bakes stop at the soft memory budget: the rest bake on a hint or on first use
      if (job.bg && S.stats.bakedBytes > S.MEM_BUDGET * 0.8) {
        delete bakeState[job.name];
        S.stats.skippedBg++;
        continue;
      }
      baking++;
      bakeState[job.name] = "baking";
      const pr = bakeRecipe(job.name);
      S.bakePromises[job.name] = pr.then(
        () => true,
        () => false,
      );
      pr.then(() => {
        bakeState[job.name] = "done";
        S.stats.baked++;
        noteBaked(job.name);
      })
        .catch((e) => {
          bakeState[job.name] = "failed";
          S.stats.bakeFailed++;
          S.warnOnce(
            "bake:" + job.name,
            "bake failed for " + job.name + ": " + (e && e.message),
          );
        })
        .then(() => {
          baking--;
          setTimeout(pump, 0);
        });
    }
  }
