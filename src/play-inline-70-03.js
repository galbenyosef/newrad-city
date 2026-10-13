// play-inline-70 03 — res
// Lines 351-457 of readable/play-inline-70.pretty.js (statement-aligned).
  A.addSystem({
    name: "debug",
    order: 99,
    update() {
      if (!list || fired || G.state !== "play") return;
      if (G.time.frame < Number(q.get("fxframe") || 3)) return; // shots: &fxframe=40 spawns near the end of the 45 warm-up frames
      fired = true;
      const dist = Number(q.get("fxdist") || 20);
      G.camera.updateMatrixWorld();
      for (const t of list)
        try {
          test(t, { dist });
        } catch (e) {
          G.reportError("atmos-debug", e);
        }
      advance(Number(q.get("fxage") || 0.4));
      if (q.get("fxfreeze") === "1") A.fxFreeze = true;
    },
  });
  // ?perfprobe=1 (shots): after the shot frame, time full frames (world + post) with each post feature
  // switched off in turn. Synchronised with a 1-pixel readPixels, so it measures real GPU work.
  function perfProbe() {
    const r = G.renderer,
      gl = r.getContext(),
      px = new Uint8Array(4),
      P = A.post;
    if (!P || !P.enabled || !P.mats.comp) return { post: false };
    const u = P.mats.comp.uniforms;
    const sync = () => gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
    const keep = {
      water: u.uWaterOn.value,
      pud: u.uPudOn.value,
      rays: P.raysOn,
      soft: A.softU.uSoftP.value.z,
    };
    const N = Number(q.get("perfn") || 8);
    const time = (set) => {
      set();
      G.render();
      G.render();
      sync();
      const t0 = performance.now();
      for (let i = 0; i < N; i++) G.render();
      sync();
      const ms = (performance.now() - t0) / N;
      return +ms.toFixed(2);
    };
    const res = {
      frames: N,
      calls: 0,
      water: !!keep.water,
      puddles: !!keep.pud,
      rays: !!keep.rays,
      scale: ATMOS.renderScale(),
    };
    res.all = time(() => {});
    res.calls = r.info.render.calls;
    res.noWaterSSR = time(() => {
      u.uWaterOn.value = 0;
    });
    res.noPuddleSSR = time(() => {
      u.uWaterOn.value = keep.water;
      u.uPudOn.value = 0;
    });
    res.noRays = time(() => {
      u.uPudOn.value = keep.pud;
      P.raysOn = false;
      u.uRayCol.value.setRGB(0, 0, 0);
    });
    res.noPost = time(() => {
      P.enabled = false;
    });
    P.enabled = true;
    P.raysOn = keep.rays;
    return res;
  }
  if (G.SHOT) {
    if (q && q.get("perfprobe"))
      G.events.on("initDone", () =>
        setTimeout(() => {
          let res;
          try {
            res = perfProbe();
          } catch (e) {
            res = { error: String(e && e.message) };
          }
          const pre = document.createElement("pre");
          pre.style.display = "none";
          pre.textContent =
            "ATMOS_PERF_BEGIN" + JSON.stringify(res) + "ATMOS_PERF_END";
          document.body.appendChild(pre);
        }, 0),
      );
    G.events.on("initDone", () =>
      setTimeout(() => {
        try {
          const pre = document.createElement("pre");
          pre.style.display = "none";
          pre.textContent =
            "ATMOS_DEBUG_BEGIN" + JSON.stringify(info()) + "ATMOS_DEBUG_END";
          document.body.appendChild(pre);
        } catch (e) {
          /* ignore */
        }
      }, 0),
    );
  }
