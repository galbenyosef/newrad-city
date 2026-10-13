// play-inline-23 04 — rec
// Lines 994-1300 of readable/play-inline-23.pretty.js (statement-aligned).
  function bakeRecipe(name) {
    const rec = S.R[name];
    const t0 = performance.now();
    if (rec.gen) {
      const seedOf = (v) => G.util.hashStr(name) + v * 7919;
      const fromArrays = (res) => {
        const len = res.chans[0].length;
        const b = newBuffer(rec.channels, len, rec.sr);
        res.chans.forEach((a, c) => {
          if (b.copyToChannel) b.copyToChannel(a, c);
          else b.getChannelData(c).set(a);
        });
        if (rec.norm && res.k) rec._norm = res.k;
        return trimTail(b, rec);
      };
      if (S.canUseWorker()) {
        const jobs = [];
        for (let v = 0; v < rec.variants; v++) {
          jobs.push(
            S.job({
              type: "gen",
              src: rec.gen.toString(),
              dur: rec.dur,
              sr: rec.sr,
              channels: rec.channels,
              loop: !!(rec.loop || rec.seamless),
              seed: seedOf(v),
              v,
              norm: rec.norm,
              normRms: rec.normRms || 0.25,
              noFade: isLoopRec(rec),
            }),
          );
        }
        return Promise.all(jobs)
          .then((rs) => {
            S.cache[name] = rs.map(fromArrays);
            S.stats.bakeMs += performance.now() - t0;
          })
          .catch(() => {
            genSync(name);
          });
      }
      genSync(name);
      return Promise.resolve();
    }
    const OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    if (!OAC) return Promise.reject(new Error("no OfflineAudioContext"));
    // Graph building is synchronous main-thread work: build ONE variant per idle slot, render off-thread.
    return new Promise((resolve, reject) => {
      const jobs = [];
      let v = 0;
      const step = () => {
        const tb = performance.now();
        try {
          const len = Math.ceil(rec.dur * rec.sr);
          const oc = new OAC(rec.channels, len, rec.sr);
          const out = oc.createGain();
          out.connect(oc.destination);
          const r = S.rng(G.util.hashStr(name) + v * 7919);
          rec.build(new Kit(oc, out, 0, r), v, r, {});
          // normalise + trim each variant as its render lands (separate tasks, not one long batch)
          jobs.push(
            oc.startRendering().then((buf) => {
              const k = rec.norm ? normalize(buf, rec) : 1;
              if (k) rec._norm = k;
              return trimTail(buf, rec);
            }),
          );
        } catch (e) {
          reject(e);
          return;
        }
        const dt = performance.now() - tb;
        S.stats.bakeMs += dt;
        if (dt > S.stats.bakeMaxMs) S.stats.bakeMaxMs = dt;
        if (++v < rec.variants) {
          idle(step);
          return;
        }
        Promise.all(jobs).then((bufs) => {
          S.cache[name] = bufs;
          resolve();
        }, reject);
      };
      step();
    });
  }
  // Loudness hints: the normalisation gain of every baked recipe is remembered per browser, so the live-synthesis
  // fallback (used for the first few seconds, before a bake lands) plays at the same loudness as the baked buffer.
  let normHints = {};
  try {
    normHints = JSON.parse(S.lsGet("sfxnorm") || "{}") || {};
  } catch (e) {
    normHints = {};
  }
  let normSaveT = null;
  function noteBaked(name) {
    const rec = S.R[name],
      bufs = S.cache[name];
    let bytes = 0;
    if (bufs) for (const b of bufs) bytes += b.length * b.numberOfChannels * 4;
    S.stats.bakedBytes += bytes - (bakedSize[name] || 0);
    bakedSize[name] = bytes;
    lastUse[name] = lastUse[name] || performance.now();
    if (!rec || !rec._norm || rec.gen) return;
    const k = Math.round(rec._norm * 1000) / 1000;
    if (normHints[name] === k) return;
    normHints[name] = k;
    clearTimeout(normSaveT);
    normSaveT = setTimeout(() => {
      S.lsSet("sfxnorm", JSON.stringify(normHints));
    }, 3000);
  }
  S.normHint = (name) => normHints[name];
  /** Synchronous main-thread generation of a gen-recipe (fallback when no Worker). */
  function genSync(name) {
    const rec = S.R[name],
      t0 = performance.now(),
      bufs = [];
    for (let v = 0; v < rec.variants; v++) {
      const seed = G.util.hashStr(name) + v * 7919;
      let b;
      if (rec.loop || rec.seamless)
        b = S.makeLoop(
          rec.dur,
          rec.sr,
          rec.channels,
          (d, sr, rr, n) => rec.gen(d, sr, rr, n, v),
          seed,
        );
      else {
        b = newBuffer(rec.channels, Math.ceil(rec.dur * rec.sr), rec.sr);
        const arrs = [];
        for (let c = 0; c < rec.channels; c++) arrs.push(b.getChannelData(c));
        rec.gen(arrs, rec.sr, S.rng(seed), b.length, v);
      }
      if (rec.norm) rec._norm = normalize(b, rec);
      bufs.push(trimTail(b, rec));
    }
    S.cache[name] = bufs;
    S.stats.bakeMs += performance.now() - t0;
  }
  /**
   * Queue every recipe for background baking (priority order). Recipes flagged `lazy` (rare and/or long:
   * nuke blast, cryo hatch, thunder, ripjaw…) are skipped: they bake on a hint (S.hintBake / G.sfx.preload,
   * e.g. entering the cryo unit, rain starting, equipping a recoilless rifle) or on first use (played live meanwhile), so
   * their buffers never occupy memory in a session that doesn't need them.
   */
  S.bakeAll = function () {
    Object.keys(S.R).forEach((n) => {
      if (!S.R[n].lazy) S.requestBake(n, undefined, true);
    });
  };

  // ------------------------------------------------------------------
  // Memory manager. Baked sfx live in Float32 AudioBuffers; a whole session
  // would otherwise accumulate ~55 MB. Background pre-baking stops at 80 % of
  // S.MEM_BUDGET, and an LRU evicts buffers that have not been played for a
  // while whenever the total is over budget (they re-bake on the next hint or
  // use; build-recipes play live-synthesised meanwhile at matched loudness).
  // Never evicted: anything sounding or held by a loop/bed, pinned recipes
  // (UI, footsteps, Geiger, the equipped weapon), gen one-shots (no live path).
  // ------------------------------------------------------------------
  S.MEM_BUDGET = 28e6;
  S.EVICT_IDLE_MS = 90000;
  const bakedSize = (S.bakedSize = {});
  const lastUse = (S.lastUse = {});
  S.pinned = new Set();
  const PIN_RE = /^(footstep_|ui_|goggles_|terminal_|teletype_|keypad_|key_)/;
  function evictable(name, now, busy) {
    const rec = S.R[name];
    if (
      !rec ||
      !S.cache[name] ||
      bakeState[name] !== "done" ||
      busy.has(name) ||
      S.pinned.has(name) ||
      rec.pin
    )
      return false;
    if (PIN_RE.test(name) || rec.bus === "ui") return false;
    if (rec.gen && !isLoopRec(rec)) return false;
    return now - (lastUse[name] || 0) > S.EVICT_IDLE_MS;
  }
  /** Drop least-recently-used baked buffers until under 90 % of the budget. Returns bytes freed. */
  S.evictIdle = function (force) {
    if (!force && S.stats.bakedBytes <= S.MEM_BUDGET) return 0;
    const now = performance.now(),
      busy = new Set();
    for (const v of S.voices) busy.add(v.name);
    for (const h of S.loops) busy.add(h.name);
    if (S.amb && S.amb.beds) for (const b in S.amb.beds) busy.add(b);
    const cands = Object.keys(S.cache)
      .filter((n) => evictable(n, now, busy))
      .sort((a, b) => (lastUse[a] || 0) - (lastUse[b] || 0));
    let freed = 0;
    for (const n of cands) {
      if (!force && S.stats.bakedBytes <= S.MEM_BUDGET * 0.9) break;
      const sz = bakedSize[n] || 0;
      delete S.cache[n];
      delete bakeState[n];
      delete S.bakePromises[n];
      delete bakedSize[n];
      S.stats.bakedBytes -= sz;
      freed += sz;
      S.stats.evicted++;
    }
    return freed;
  };
  /** Ask for a recipe (or alias) to be baked soon — e.g. when its use becomes likely. */
  S.hintBake = function (name, prio) {
    name = S.resolve(name);
    if (S.R[name] && !S.cache[name])
      S.requestBake(name, prio === undefined ? 0 : prio);
  };
  /** Synchronously bake a gen-type recipe (used by loops at first play). */
  /** Make sure a gen-recipe gets generated soon (async via worker; sync only if workers are unavailable). */
  S.bakeNow = function (name) {
    const rec = S.R[name];
    if (!rec || S.cache[name]) return;
    if (S.canUseWorker()) S.requestBake(name, -2);
    else {
      bakeState[name] = "done";
      genSync(name);
      noteBaked(name);
    }
  };

  // ------------------------------------------------------------------
  // Reverb impulse responses (generated at context sample rate)
  // ------------------------------------------------------------------
  /**
   * o: {dur, rt60, pre (s), fc0 (Hz start brightness), fcEnd, er: [[time, gain], …], width (0..1), metallic (0..1)}
   */
  /** Pure IR synthesis into two Float32Arrays (runs in the worker or on the main thread). */
  function irArrays(o, sr, seed) {
    const n = Math.floor(sr * o.dur),
      r = mulberry(seed),
      chans = [new Float32Array(n), new Float32Array(n)];
    for (let c = 0; c < 2; c++) {
      const d = chans[c];
      let lp = 0;
      const pre = Math.floor((o.pre || 0.01) * sr);
      for (let i = pre; i < n; i++) {
        const t = (i - pre) / sr;
        const fc =
          (o.fcEnd || 800) +
          ((o.fc0 || 8000) - (o.fcEnd || 800)) *
            Math.exp((-t * 3) / (o.rt60 || 1));
        const a = Math.exp((-2 * Math.PI * fc) / sr);
        lp = lp * a + (r() * 2 - 1) * (1 - a);
        const envl =
          Math.exp((-6.9 * t) / (o.rt60 || 1)) * Math.min(1, t / 0.012 + 0.15);
        d[i] = lp * envl * (1.6 + fc / 6000);
      }
      if (o.metallic) {
        // cryo bunker / tunnel ring: a few decaying partials
        [311, 523, 877, 1290, 1811].forEach((f, k) => {
          const ph = r() * 6.28,
            rt = (o.rt60 || 1) * 0.6,
            w = (2 * Math.PI * f * (1 + c * 0.003)) / sr;
          const lim = Math.min(n, pre + Math.floor(rt * sr * 1.2));
          for (let i = pre; i < lim; i++) {
            const t = (i - pre) / sr;
            d[i] +=
              (Math.sin(ph + w * (i - pre)) *
                Math.exp((-6.9 * t) / rt) *
                0.02 *
                o.metallic) /
              (k + 1);
          }
        });
      }
      (o.er || []).forEach((e) => {
        // discrete early reflections (building slaps, walls)
        const idx = Math.floor((e[0] + (c ? 0.004 : 0) + r() * 0.003) * sr);
        for (let j = 0; j < 120 && idx + j < n; j++)
          d[idx + j] +=
            (r() * 2 - 1) *
            e[1] *
            Math.exp(-j / 25) *
            (c && o.width ? 1 - o.width * 0.5 : 1);
      });
    }
    let e = 0;
    for (const d of chans) for (let i = 0; i < n; i++) e += d[i] * d[i];
    const k = (1 / Math.sqrt(e / 2 + 1e-9)) * 0.9;
    for (const d of chans) for (let i = 0; i < n; i++) d[i] *= k;
    return chans;
  }
  S.workerLib(irArrays);
  function irBuffer(chans) {
    const b = S.ctx.createBuffer(2, chans[0].length, S.ctx.sampleRate);
    chans.forEach((a, c) => {
      if (b.copyToChannel) b.copyToChannel(a, c);
      else b.getChannelData(c).set(a);
    });
    return b;
  }
  /** Synchronous IR (used at init for the default environments). */
  S.makeIR = function (o) {
    return irBuffer(
      irArrays(o, S.ctx.sampleRate, G.util.hashStr(JSON.stringify(o))),
    );
  };
  /** Environment presets: IR + base wet send. */
