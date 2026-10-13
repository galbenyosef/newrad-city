// play-inline-624 07 — src
// Lines 1456-1684 of readable/play-inline-624.pretty.js (statement-aligned).
  H.work = function (budgetMs) {
    if (!H.inited) return 0;
    const t0 = performance.now();
    const cam = G.camera ? G.camera.position : null;
    while (performance.now() - t0 < budgetMs) {
      if (!H.job) {
        const c = pickNext(cam);
        if (!c) break;
        H.jobCell = c;
        c.stale = false;
        H.job = buildJob(c);
      }
      let r;
      const ts = performance.now();
      try {
        r = H.job.next();
      } catch (e) {
        G.reportError("render_perf:hlod build", e);
        H.jobCell.fails++;
        H.job = null;
        H.jobCell.done = true;
        H.jobCell = null;
        continue;
      }
      if (r.done) {
        const c = H.jobCell;
        H.job = null;
        H.jobCell = null;
        c.done = true;
        if (c.stale) {
          c.dirty = true;
          c.due = performance.now() + 2500;
          for (const u of c.units) u.hbNext = null;
          continue;
        }
        try {
          install(c, r.value);
        } catch (e) {
          G.reportError("render_perf:hlod install", e);
          c.fails++;
        }
      }
      const dt = performance.now() - ts;
      if (dt > H.stats.worstStepMs) H.stats.worstStepMs = +dt.toFixed(1);
      if (dt > 40) H.stats.slowSteps = (H.stats.slowSteps || 0) + 1;
    }
    const ms = performance.now() - t0;
    H.stats.buildMs += ms;
    return ms;
  };

  // ------------------------------------------------------------------
  // Per frame (called from the cull pass with this frame's final camera)
  // ------------------------------------------------------------------
  let dT = 0,
    visIdx = 0,
    visCell = 0;
  function updateD() {
    let D = 600;
    const f = G.scene && G.scene.fog;
    if (f && f.density > 0)
      D = 0.78 / f.density; // FogExp2: haze ≈ 45 % at D
    else if (f && f.far > 0) D = f.near + (f.far - f.near) * 0.45;
    D = Math.max(420, Math.min(1500, D)) * (H.Dmul || 1);
    // move slowly (weather transitions) so cells do not flicker in and out
    H.D = H.D ? H.D + (D - H.D) * 0.25 : D;
    H.stats.D = Math.round(H.D);
  }
  function watchVisibility(n) {
    const L = H.list;
    if (!L.length) return;
    let guard = L.length + 1;
    while (n > 0 && guard-- > 0) {
      if (visCell >= L.length) visCell = 0;
      const c = L[visCell];
      if (!c.ready || !c.src) {
        visCell++;
        visIdx = 0;
        continue;
      }
      const src = c.src,
        vis = c.vis;
      for (; visIdx < src.length && n > 0; visIdx++, n--) {
        const m = src[visIdx];
        const v = m.parent && effVisible(m) ? 1 : 0;
        if (v !== vis[visIdx]) {
          const u = c.srcU[visIdx];
          u.hVis = (u.hVis || 0) + 1;
          noBake.add(m); // its owner toggles it (distance LOD, night-only neon, quest state…): leave it out
          if (u.hVis > 24) u.noHlod = true;
          markDirty(c, 1500);
          visIdx = src.length;
          break;
        }
      }
      if (visIdx >= src.length) {
        visCell++;
        visIdx = 0;
      }
    }
  }
  function inFrustum(planes, c) {
    for (let i = 0; i < 6; i++) {
      const p = planes[i],
        nn = p.normal;
      const x = nn.x > 0 ? c.x1 : c.x0,
        y = nn.y > 0 ? c.y1 : c.y0,
        z = nn.z > 0 ? c.z1 : c.z0;
      if (nn.x * x + nn.y * y + nn.z * z + p.constant < 0) return false;
    }
    return true;
  }
  H.frame = function (cam, planes, occOn, O, cx, cy, cz, indoors) {
    if (!H.inited || !H.root) return;
    const on = R.enabled && R.opts.hlod;
    if (!on || indoors) {
      H.root.visible = false;
      if (!on) for (const c of H.list) if (c.far) setFar(c, false);
      return;
    }
    H.root.visible = true;
    if (--dT <= 0) {
      dT = 20;
      updateD();
    }
    const D = H.D,
      Dn = D * 0.93;
    let far = 0,
      shown = 0;
    for (const c of H.list) {
      if (!c.ready) continue;
      const dx = c.x0 > cx ? c.x0 - cx : cx > c.x1 ? cx - c.x1 : 0;
      const dy = c.y0 > cy ? c.y0 - cy : cy > c.y1 ? cy - c.y1 : 0;
      const dz = c.z0 > cz ? c.z0 - cz : cz > c.z1 ? cz - c.z1 : 0;
      const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
      const f = H.force || (c.far ? d > Dn : d > D);
      if (f !== c.far) setFar(c, f);
      if (f) {
        far++;
        let vis = true;
        if (
          occOn &&
          inFrustum(planes, c) &&
          O.boxOccluded(c.x0, c.y0, c.z0, c.x1, c.y1, c.z1)
        )
          vis = false;
        c.proxy.visible = vis;
        if (vis) shown++;
      }
    }
    H.stats.far = far;
    H.stats.shown = shown;
    watchVisibility(400);
  };

  H.onEnabled = function (on) {
    if (!H.root) return;
    if (!on) {
      for (const c of H.list) if (c.far) setFar(c, false);
      H.root.visible = false;
    }
  };

  // ------------------------------------------------------------------
  // System: setup once the units exist, progressive build, live table
  // ------------------------------------------------------------------
  let tabT = 0,
    assignT = 0;
  R.addSystem({
    name: "hlod",
    order: 40,
    update(dt, realDt) {
      if (!R.opts.hlod || !R.enabled) return;
      if (!H.inited) {
        if (!R.unitsReady || !G.scene) return;
        H.root = new THREE.Group();
        H.root.name = "rp_hlod";
        H.root.matrixAutoUpdate = false;
        G.scene.add(H.root);
        makeTab();
        H.inited = true;
        H.assignAll();
      }
      // units adopted later (rescans after newGame) join their cell at its next rebuild
      if ((assignT -= realDt || 0) <= 0) {
        assignT = 3;
        H.assignAll(true);
      }
      // build: synchronous in smoke / shot runs (their few frames must show the real far view),
      // otherwise a small slice per frame (more while the world is paused, indoors or in a menu)
      let budget;
      if (G.SMOKE || G.SHOT) budget = 1e9;
      else {
        const indoors =
          G.player &&
          G.player.pos &&
          G.player.pos.x >= ((G.LAYOUT && G.LAYOUT.INTERIOR_X_MIN) || 2500);
        const running = G.worldRunning ? G.worldRunning() : true;
        budget = !running || indoors ? 8 : 2.5;
      }
      H.work(budget);
      if ((tabT -= realDt || 0) <= 0) {
        tabT = 0.25;
        refreshTable();
      } else if (tabDirty) refreshTable();
      // stats
      let ready = 0,
        tris = 0,
        srcTris = 0,
        src = 0,
        pending = 0;
      for (const c of H.list) {
        if (c.ready) {
          ready++;
          tris += c.tris;
          srcTris += c.srcTris;
          src += c.src ? c.src.length : 0;
        } else if (c.units.length && !(c.done && !c.dirty)) pending++;
      }
      const s = H.stats;
      s.cells = H.list.length;
      s.ready = ready;
      s.tris = tris;
      s.srcTris = srcTris;
      s.srcMeshes = src;
      s.slots = slots.length;
      s.pending = pending;
    },
  });
