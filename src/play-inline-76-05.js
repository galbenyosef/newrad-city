// play-inline-76 05 — math
// Lines 685-1014 of readable/play-inline-76.pretty.js (statement-aligned).
  function gather(rd) {
    const t0 = performance.now();
    nC = 0;
    merge.clear();
    const cam = G.camera;
    if (!cam) return;
    camX = cam.position.x;
    camY = cam.position.y;
    camZ = cam.position.z;
    inside = R.interior();
    XMIN = (G.LAYOUT && G.LAYOUT.INTERIOR_X_MIN) || 1e9;
    night = 1;
    try {
      if (G.atmos && !G.isStub("atmos") && G.atmos.nightFactor)
        night = Math.max(0, Math.min(1, G.atmos.nightFactor()));
    } catch (e) {
      night = 1;
    }
    const src = S.sources;
    src.props = gatherGlowField(rd);
    src.glows = gatherGlows();
    src.fixtures = gatherFixtures();
    src.interior = gatherInterior();
    src.combat = gatherTransients();
    // view score: how much this light matters from here (close + bright + big first)
    sel.length = 0;
    for (let i = 0; i < nC; i++) {
      const c = pool[i];
      if (c.dead) continue;
      const dx = c.x - camX,
        dy = c.y - camY,
        dz = c.z - camZ;
      c.score =
        (c.score * c.range * c.range) /
        (dx * dx + dy * dy * 0.5 + dz * dz + c.range * c.range * 0.5);
      sel.push(c);
    }
    sel.sort((a, b) => b.score - a.score);
    if (sel.length > VL.MAXL) sel.length = VL.MAXL;
    S.cands = nC;
    S.sel = sel.length;
    buildGrid();
    S.gatherMs = +(performance.now() - t0).toFixed(2);
  }

  // ------------------------------------------------------------------
  // grid + texture
  // ------------------------------------------------------------------
  const tileN = new Uint8Array(VL.GN * VL.GN);
  let gx0 = 0,
    gz0 = 0;
  function buildGrid() {
    const D = VL.data,
      TW = VL.TW,
      GN = VL.GN,
      T = VL.TILE,
      PER = VL.PER;
    gx0 = Math.floor(camX / T) * T - (GN / 2) * T;
    gz0 = Math.floor(camZ / T) * T - (GN / 2) * T;
    tileN.fill(0);
    D.fill(0, 2 * TW * 4); // grid rows only
    let used = 0,
      mx = 0;
    for (let k = 0; k < sel.length; k++) {
      const c = sel[k],
        id = k + 1;
      // light record: row 0 pos+range (colour written per frame)
      const o = k * 4;
      D[o] = c.x;
      D[o + 1] = c.y;
      D[o + 2] = c.z;
      D[o + 3] = c.range;
      const rr = c.range;
      const tx0 = Math.max(0, Math.floor((c.x - rr - gx0) / T)),
        tx1 = Math.min(GN - 1, Math.floor((c.x + rr - gx0) / T));
      const tz0 = Math.max(0, Math.floor((c.z - rr - gz0) / T)),
        tz1 = Math.min(GN - 1, Math.floor((c.z + rr - gz0) / T));
      for (let tz = tz0; tz <= tz1; tz++) {
        // circle vs tile row: skip tiles the range circle cannot reach
        const cz =
          Math.max(gz0 + tz * T, Math.min(c.z, gz0 + (tz + 1) * T)) - c.z;
        for (let tx = tx0; tx <= tx1; tx++) {
          const cx =
            Math.max(gx0 + tx * T, Math.min(c.x, gx0 + (tx + 1) * T)) - c.x;
          if (cx * cx + cz * cz > rr * rr) continue;
          const ti = tz * GN + tx,
            n = tileN[ti];
          if (n >= PER) continue;
          if (n === 0) used++;
          tileN[ti] = n + 1;
          if (n + 1 > mx) mx = n + 1;
          const idx = ti * 2 + (n >> 2); // texel index in the grid rows
          D[(2 * TW + idx) * 4 + (n & 3)] = id;
        }
      }
    }
    // clear stale records past the selection
    for (let k = sel.length; k < VL.MAXL; k++) {
      const o = k * 4;
      if (D[o + 3] === 0) break;
      D[o] = D[o + 1] = D[o + 2] = D[o + 3] = 0;
    }
    S.tilesUsed = used;
    S.maxTile = mx;
    U.nrcVL.value.y = gx0;
    U.nrcVL.value.z = gz0;
    U.nrcVL.value.w = 1 / T;
  }

  function hash(n) {
    const s = Math.sin(n) * 43758.5453;
    return s - Math.floor(s);
  }
  const supp = new Float32Array(VL.MAXL);
  function writeColours(t) {
    const D = VL.data,
      TW = VL.TW;
    // atmosphere lends real PointLights to the nearest fixtures: the matching virtual light steps back
    supp.fill(0, 0, sel.length);
    S.supp = 0;
    if (poolLights) {
      for (const pl of poolLights) {
        if (!(pl.intensity > 0) || !pl.parent) continue;
        const p = pl.position;
        let best = -1,
          bd = 2.2 * 2.2;
        for (let k = 0; k < sel.length; k++) {
          const c = sel[k],
            dx = c.x - p.x,
            dy = (c.y - p.y) * 0.6,
            dz = c.z - p.z,
            d2 = dx * dx + dy * dy + dz * dz;
          if (d2 < bd) {
            bd = d2;
            best = k;
          }
        }
        if (best >= 0) {
          const c = sel[best],
            mine = c.i * Math.pow(c.range * 0.33, 2) * Math.max(c.r, c.g, c.b);
          supp[best] = Math.min(
            1,
            supp[best] + pl.intensity / Math.max(mine, 1e-3),
          );
          S.supp++;
        }
      }
    }
    let any = false;
    for (let k = 0; k < sel.length; k++) {
      const c = sel[k];
      if (c.tr) {
        // combat flash: atmosphere's own curve and intensity convention (physical units, like its PointLights);
        // silent while the pool's real light still serves this very flash
        const T = c.tr,
          h = T.h;
        let live = false;
        try {
          live = !!(h && h.alive && h.alive());
        } catch (e) {
          live = false;
        }
        const I = live
          ? 0
          : T.i * Math.pow(T.range * 0.33, 2) * transK(T) * GAIN_T;
        const o = (TW + k) * 4,
          p = k * 4;
        D[p] = T.x;
        D[p + 1] = T.y;
        D[p + 2] = T.z;
        D[o] = T.color.r * I;
        D[o + 1] = T.color.g * I;
        D[o + 2] = T.color.b * I;
        D[o + 3] = 0;
        if (I > 0.01) any = true;
        continue;
      }
      let f = 1;
      if (c.flicker > 0.01) {
        if (c.fire)
          f =
            1 -
            c.flicker *
              0.5 *
              (1 + Math.sin(t * 17 + c.seed) * Math.sin(t * 7.3 + c.seed * 3)) *
              0.8;
        else {
          const h = hash(Math.floor(t * 9 + c.seed * 31));
          f =
            1 -
            c.flicker *
              (h > 0.35 ? 0.25 * hash(Math.floor(t * 27.9 + c.seed)) : 1);
        }
      }
      // intensity convention shared with atmosphere's pooled fixtures: ≈ illuminance at a third of the range
      const I =
        c.i *
        Math.pow(c.range * 0.33, 2) *
        f *
        (1 - supp[k]) *
        (inside ? GAIN_IN : GAIN_OUT);
      const o = (TW + k) * 4;
      D[o] = c.r * I;
      D[o + 1] = c.g * I;
      D[o + 2] = c.b * I;
      D[o + 3] = c.cone;
      if (I > 0.01) any = true;
    }
    return any;
  }

  // ------------------------------------------------------------------
  // per frame
  // ------------------------------------------------------------------
  let enabled = true,
    ready = false;
  function init() {
    try {
      if (localStorage.getItem("nrc_rl_vl") === "0") enabled = false;
    } catch (e) {
      /* ignore */
    }
    try {
      GAIN_T = G.renderer && G.renderer._useLegacyLights === true ? Math.PI : 1;
    } catch (e) {
      GAIN_T = 1;
    }
    wrapSources();
    G.events.on("initDone", () => {
      try {
        scanExisting();
      } catch (e) {
        G.reportError("render_lighting/lights-scan", e);
      }
      ready = true;
    });
  }
  // test tools: ?rlflashtest=N fires N combat flashes in a fan ahead of the camera near the end of a SHOT
  // (atmosphere's pool lights 3 of them, the virtual lights the rest)
  let flashTest = 0;
  try {
    flashTest = G.SHOT
      ? +new URLSearchParams(location.search).get("rlflashtest") || 0
      : 0;
  } catch (e) {
    flashTest = 0;
  }
  function runFlashTest() {
    const FX = G.fx,
      cam = G.camera;
    if (!FX || !FX.flash || !cam) return;
    cam.getWorldDirection(_s);
    _s.y = 0;
    _s.normalize();
    for (let k = 0; k < flashTest; k++) {
      const a = (k / Math.max(1, flashTest - 1) - 0.5) * 1.2,
        d = 7 + (k % 3) * 6;
      const x = cam.position.x + (_s.x * Math.cos(a) - _s.z * Math.sin(a)) * d,
        z = cam.position.z + (_s.z * Math.cos(a) + _s.x * Math.sin(a)) * d;
      let y = 1.3;
      try {
        if (G.world && G.world.terrainHeight)
          y += G.world.terrainHeight(x, z) || 0;
      } catch (e) {
        /* ignore */
      }
      FX.flash(
        new THREE.Vector3(x, y, z),
        k % 4 === 3 ? 0x60ff60 : 0xffb060,
        3,
        1.5,
        { range: 10, curve: "hold" },
      );
    }
  }
  let lastGX = 1e9,
    lastGZ = 1e9;
  function late(dt, realDt) {
    if (flashTest && S.frame === 38) runFlashTest();
    stepTransients(dt === undefined ? realDt || 0.016 : dt);
    const on =
      enabled &&
      R.patched &&
      R.vlPatched &&
      ready &&
      G.state !== "title" &&
      !!G.camera;
    if (!on) {
      U.nrcVL.value.x = 0;
      return;
    }
    const rd = realDt || 0.016;
    S.frame++;
    const tier = R.quality();
    VL.PER = PER_TIER[tier] || 3;
    U.nrcVL2.value.x = VL.PER;
    U.nrcVL2.value.w = RL.debug ? 1 : 0;
    const cam = G.camera.position;
    const moved = Math.abs(cam.x - lastGX) + Math.abs(cam.z - lastGZ) > 6;
    if (moved || transDirty || S.frame % 4 === 1 || G.SHOT || G.SURVEY) {
      lastGX = cam.x;
      lastGZ = cam.z;
      transDirty = false;
      gather(rd);
    }
    const any = sel.length > 0 && writeColours(performance.now() / 1000);
    U.nrcVL.value.x = any ? 1 : 0;
    if (any) {
      // every lit material holds a CLONE of the texture object sharing its Source (three clones texture
      // uniforms): the master's upload refreshes the shared GL texture for all of them (as the probe atlas)
      VL.tex.needsUpdate = true;
      try {
        if (G.renderer && G.renderer.initTexture)
          G.renderer.initTexture(VL.tex);
      } catch (e) {
        /* uploaded on first use */
      }
    }
  }

  RL.setLights = function (on) {
    enabled = !!on;
    RL.lights = enabled;
    try {
      localStorage.setItem("nrc_rl_vl", on ? "1" : "0");
    } catch (e) {
      /* ignore */
    }
    if (!on) U.nrcVL.value.x = 0;
  };
