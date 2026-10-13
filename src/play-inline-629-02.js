// play-inline-629 02 — render
// Lines 17-314 of readable/play-inline-629.pretty.js (statement-aligned).
  const RP = G.renderPerf,
    R = RP._;

  /** Instrument exactly one render and return the breakdown. */
  RP.audit = function (opts) {
    const r = G.renderer;
    if (!r || !G.scene) return null;
    opts = opts || {};
    const res = { passes: [], roots: [], stats: RP.stats() };
    const tally = new Map();
    let inShadow = 0,
      main = 0,
      mainTris = 0,
      shadowCalls = 0,
      shadowTris = 0;
    const oRBD = r.renderBufferDirect,
      sm = r.shadowMap,
      oSM = sm.render,
      oRender = r.render;
    const triCount = (geo, obj, group) => {
      let n = geo.index
        ? geo.index.count
        : geo.attributes.position
          ? geo.attributes.position.count
          : 0;
      if (group) n = Math.min(n, group.count);
      n /= 3;
      if (obj.isInstancedMesh) n *= obj.count;
      return n;
    };
    sm.render = function () {
      inShadow++;
      try {
        return oSM.apply(this, arguments);
      } finally {
        inShadow--;
      }
    };
    r.renderBufferDirect = function (cam, scene, geo, mat, obj, group) {
      if (scene === G.scene) {
        const t = triCount(geo, obj, group);
        if (inShadow) {
          shadowCalls++;
          shadowTris += t;
        } else {
          main++;
          mainTris += t;
          let p = obj;
          while (p.parent && p.parent !== G.scene) p = p.parent;
          const k = p.name || p.type;
          const e = tally.get(k) || { calls: 0, tris: 0 };
          e.calls++;
          e.tris += t;
          tally.set(k, e);
        }
      }
      return oRBD.apply(this, arguments);
    };
    r.render = function (scene, cam) {
      const c0 = r.info.render.calls,
        t0 = r.info.render.triangles;
      const s0 = shadowCalls;
      oRender.call(r, scene, cam);
      const name =
        scene === G.scene
          ? "world"
          : scene === G.viewScene
            ? "viewmodel"
            : scene.name || "post";
      res.passes.push({
        pass: name,
        calls: r.info.render.calls - c0 - (shadowCalls - s0),
        tris: Math.round(r.info.render.triangles - t0),
      });
    };
    const t0 = performance.now();
    try {
      r.info.autoReset = false;
      r.info.reset();
      G.render();
    } finally {
      r.renderBufferDirect = oRBD;
      sm.render = oSM;
      r.render = oRender;
      r.info.autoReset = true;
    }
    res.cpuMs = +(performance.now() - t0).toFixed(1);
    res.total = { calls: r.info.render.calls, tris: r.info.render.triangles };
    res.shadow = { calls: shadowCalls, tris: Math.round(shadowTris) };
    res.world = { calls: main, tris: Math.round(mainTris) };
    // merge the many 1-call post passes
    const post = res.passes.filter((p) => p.pass === "post");
    res.passes = res.passes.filter((p) => p.pass !== "post");
    if (post.length)
      res.passes.push({
        pass: "post x" + post.length,
        calls: post.reduce((a, p) => a + p.calls, 0),
        tris: post.reduce((a, p) => a + p.tris, 0),
      });
    res.roots = [...tally.entries()]
      .sort((a, b) => b[1].calls - a[1].calls)
      .slice(0, opts.top || 20)
      .map(([k, e]) => ({ root: k, calls: e.calls, tris: Math.round(e.tris) }));
    res.programs = r.info.programs ? r.info.programs.length : 0;
    res.memory = {
      geometries: r.info.memory.geometries,
      textures: r.info.memory.textures,
    };
    if (G.camera)
      res.camera = G.camera.position.toArray().map((v) => +v.toFixed(1));
    return res;
  };

  // ------------------------------------------------------------------
  // Frame profiler: per-module update / lateUpdate cost + render, over N frames
  //   G.renderPerf.profileStart();  … play …  G.renderPerf.profileStop()
  //   → { frames, frameMs:{avg,p95,max}, render:{avg,max}, modules:[{name, avg, max, spikes}] , spikes:[…] }
  // A spike = a frame over 50 ms: the module that took the longest in it is recorded.
  // ------------------------------------------------------------------
  let prof = null;
  RP.profileStart = function () {
    if (prof) RP.profileStop();
    const P = (prof = {
      t: new Map(),
      frames: [],
      render: [],
      cur: null,
      spikes: [],
      undo: [],
    });
    const acc = (name, dt) => {
      let e = P.t.get(name);
      if (!e) P.t.set(name, (e = { sum: 0, max: 0, n: 0 }));
      e.sum += dt;
      if (dt > e.max) e.max = dt;
      if (P.cur) {
        P.cur[name] = (P.cur[name] || 0) + dt;
      }
    };
    for (const m of G._modules || []) {
      for (const k of ["update", "lateUpdate"]) {
        const f = m[k];
        if (typeof f !== "function") continue;
        const name = m.name + (k === "lateUpdate" ? " (late)" : "");
        m[k] = function () {
          const t0 = performance.now();
          try {
            return f.apply(this, arguments);
          } finally {
            acc(name, performance.now() - t0);
          }
        };
        P.undo.push(() => {
          m[k] = f;
        });
      }
    }
    const pu = G.player && G.player.update;
    if (pu) {
      G.player.update = function () {
        const t0 = performance.now();
        try {
          return pu.apply(this, arguments);
        } finally {
          acc("player", performance.now() - t0);
        }
      };
      P.undo.push(() => {
        G.player.update = pu;
      });
    }
    const rr = G.render;
    G.render = function () {
      const t0 = performance.now();
      try {
        return rr.apply(this, arguments);
      } finally {
        const dt = performance.now() - t0;
        acc("render", dt);
        P.render.push(dt);
        // end of a frame: book it
        const f = P.cur || {};
        let tot = 0;
        for (const k in f) tot += f[k];
        P.frames.push(tot);
        if (tot > 50) {
          let w = null,
            wm = 0;
          for (const k in f)
            if (f[k] > wm) {
              wm = f[k];
              w = k;
            }
          P.spikes.push({
            ms: +tot.toFixed(1),
            worst: w,
            worstMs: +wm.toFixed(1),
          });
        }
        P.cur = {};
      }
    };
    P.undo.push(() => {
      G.render = rr;
    });
    P.cur = {};
    return true;
  };
  RP.profileStop = function () {
    const P = prof;
    if (!P) return null;
    prof = null;
    for (const u of P.undo.reverse()) {
      try {
        u();
      } catch (e) {
        /* ignore */
      }
    }
    const n = Math.max(1, P.frames.length),
      fr = P.frames.slice().sort((a, b) => a - b);
    const q = (a, x) =>
      a.length ? a[Math.min(a.length - 1, Math.floor(a.length * x))] : 0;
    const mods = [...P.t.entries()]
      .map(([name, e]) => ({
        name,
        avg: +(e.sum / n).toFixed(2),
        max: +e.max.toFixed(1),
        spikes: P.spikes.filter((s) => s.worst === name).length,
      }))
      .sort((a, b) => b.avg - a.avg);
    return {
      frames: P.frames.length,
      frameMs: {
        avg: +(fr.reduce((a, b) => a + b, 0) / n).toFixed(1),
        p95: +q(fr, 0.95).toFixed(1),
        max: +q(fr, 1).toFixed(1),
      },
      modules: mods.slice(0, 25),
      spikes: P.spikes.slice(0, 40),
    };
  };

  RP.stats = function () {
    const s = R.stats;
    return {
      enabled: R.enabled,
      quality: RP.getQuality ? RP.getQuality() : null,
      units: s.units,
      meshes: s.meshes,
      frozen: s.frozen,
      hidden: Object.assign({}, s.hidden),
      hiddenMeshes: s.hiddenMeshes,
      occluders: s.occluders,
      rasterOccluders: s.rasterOccluders,
      cullMs: +(s.cullMs || 0).toFixed(2),
      cullAvgMs: +(s.cullAvg || 0).toFixed(2),
      occMs: +(s.occMs || 0).toFixed(2),
      hlod: R.hlod
        ? Object.assign(
            { enabled: !!R.opts.hlod, ms: +(s.hlodMs || 0).toFixed(2) },
            R.hlod.stats,
          )
        : null,
      prewarm: R.warm
        ? {
            compiled: R.warm.compiled,
            programs: R.warm.programsAfter,
            done: !!R.warm.done,
            ms: R.warm.doneMs,
            texUploaded: R.warm.texUploaded,
            texPending: R.warm.pending.length,
          }
        : null,
    };
  };

  // ------------------------------------------------------------------
  // Overlay
  // ------------------------------------------------------------------
  let el = null,
    on = false,
    acc = 0,
    frames = 0,
    worst = 0;
  RP.overlay = function (v) {
    on = v === undefined ? !on : !!v;
    if (on && !el) {
      el = document.createElement("div");
      el.id = "rp-overlay";
      el.style.cssText =
        "position:fixed;top:6px;right:6px;z-index:950;pointer-events:none;background:rgba(0,12,4,.72);color:#5dff8a;" +
        'font:11px/1.35 "Share Tech Mono","Courier New",monospace;padding:6px 8px;border:1px solid rgba(93,255,138,.35);white-space:pre;text-shadow:0 0 4px #1f8f3a';
      document.body.appendChild(el);
    }
    if (el) el.style.display = on ? "block" : "none";
    return on;
  };
