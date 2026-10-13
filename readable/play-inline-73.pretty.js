/* src/render_lighting/20_probes.js */
/* =====================================================================
 * RENDER_LIGHTING — canyon probes & skyline horizon (per-district ambient)
 *
 * A probe ATLAS over the whole outdoor world (4 m cells, bounds from
 * G.LAYOUT.WORLD). Every static collider taller than ~3 m is rasterised into
 * a height field (buildings, landmark walls, bridge decks, rubble mounds…),
 * then for each cell a 16-direction horizon scan measures
 *   tile 0   R sky visibility at street level (cosine-weighted), G canyon
 *            height (÷ 320 m), B park, A valid
 *   tiles 1–4  the skyline in 8 azimuths (k·45°): top of the occluder that
 *            sets the horizon + its distance, packed in opposite pairs so ONE
 *            tap gives both the key-light side and the anti-key-light side
 *   tile 5   façade/ground albedo tint per district (brick Village & Brooklyn,
 *            limestone Midtown, steel-grey Financial District, green park,
 *            cool harbour), blurred across district borders
 * Cells inside a building footprint scan as if standing at its wall base
 * (the building's own mass is skipped), so façades get their street's value.
 *
 * The patched light loop (00_core.js), per lit outdoor fragment (4 taps):
 *   • hemisphere sky  → sky·vis + (interreflected sky + light bounced off the
 *     SUNLIT façades across the street)·(1 − vis), tinted by district albedo
 *   • atmosphere's horizontal bounce fill ×(1 + gain·lit-façade share) where a
 *     lit façade faces the fragment, × down to 0.6 in dark alleys → directional
 *     ambient that follows the sun around the block
 *   • beyond the far shadow map: key light × skyline visibility (distant
 *     avenues fall into the towers' shadows instead of a bright strip)
 * Colours are recomputed every frame from atmosphere's live lights, so time
 * of day and weather follow automatically.
 *
 * The bake is progressive in every phase (terrain rows, collider batches,
 * scan chunks): ≤ 2 ms per frame while playing, ≤ 8 ms on the title screen /
 * menus, synchronous only in the headless shot/smoke/survey tools.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G,
    THREE = window.THREE;
  if (!G || !G.rlight || !G.rlight._) return;
  const RL = G.rlight,
    R = RL._,
    U = R.uniforms,
    P = R.probe;

  const CELL = P.cell,
    X0 = P.x0,
    Z0 = P.z0,
    W = P.w,
    H = P.h;
  const HC_SCALE = 320;
  const DIRS = 16;
  const STEPS = [3, 6, 9, 13, 18, 24, 31, 40, 52, 66, 84, 106, 132, 165, 205];
  const B = {
    state: "idle",
    phase: "",
    row: 0,
    col: 0,
    ci: 0,
    height: null,
    bld: null,
    ground: null,
    ms: 0,
    frames: 0,
    maxFrameMs: 0,
    colliders: 0,
  };
  // Tunables (RL.setProbeParams). NOTE: fillFloor was removed — the fill is now scaled per fragment
  // between alleyFill (dark alleys) and 1 + fillGain (facing a sunlit façade).
  const OPT = {
    strength: 1.0, // 0 = canyon terms off
    minVis: 0.3, // sky visibility floor at the bottom of the deepest canyon
    interreflect: 0.6, // share of the hidden sky that comes back as multiple wall bounces
    facadeAlbedo: 0.42, // albedo of sunlit façades (bounce = key light × this × lit share)
    fillGain: 2.0, // atmosphere fill boost where a sunlit façade faces the fragment
    alleyFill: 0.6, // atmosphere fill where neither sky nor lit façades are visible
    skyline: 1.0, // skyline sun occlusion beyond the far shadow map (0 = off)
  };
  const ALB = {
    // façade / ground albedo tint (multiplier on the bounce colour)
    midtown: [1.06, 1.0, 0.9],
    midtown_south: [1.1, 0.98, 0.86],
    financial_district: [0.94, 0.99, 1.07],
    greenwich_village: [1.18, 0.94, 0.8],
    upper_west_side: [1.12, 0.97, 0.84],
    upper_east_side: [1.1, 0.98, 0.87],
    brooklyn: [1.16, 0.93, 0.79],
    central_park: [0.86, 1.1, 0.74],
    harbor: [0.92, 1.0, 1.08],
    water: [0.9, 1.0, 1.1],
  };

  function idx(i, j) {
    return j * W + i;
  }
  function budgetMs() {
    if (G.SHOT || G.SMOKE || G.SURVEY) return 1e9;
    return G.state === "play" ? 2 : 8;
  }

  // ---------------------------------------------------------------- height field (progressive)
  function stepGround(t0, lim) {
    const Wd = G.world;
    const th = Wd && Wd.terrainHeight ? Wd.terrainHeight : null;
    while (B.row < H) {
      const j = B.row++;
      const z = Z0 + (j + 0.5) * CELL;
      for (let i = 0; i < W; i++) {
        let g = 0;
        if (th) {
          try {
            g = th(X0 + (i + 0.5) * CELL, z);
          } catch (e) {
            g = 0;
          }
        }
        if (!(g > -50)) g = 0;
        B.ground[idx(i, j)] = g;
        B.height[idx(i, j)] = g;
      }
      if (performance.now() - t0 > lim) return false;
    }
    return true;
  }
  function stepColliders(t0, lim) {
    const Wd = G.world,
      L = G.LAYOUT;
    const cols = (Wd && Wd.colliders) || [];
    const xMax = L ? L.INTERIOR_X_MIN - 50 : 2400;
    const height = B.height;
    while (B.ci < cols.length) {
      const c = cols[B.ci++];
      if (
        !c ||
        c.tag === "actor" ||
        c.tag === "forcefield" ||
        c.tag === "interactable_self" ||
        c.tag === "prop_car"
      )
        continue;
      if (c.cx >= xMax) continue;
      const tall = c.maxY - c.minY;
      if (!(c.maxY >= 4.5 && tall >= 3)) continue;
      if (c.hx < 0.12 || c.hz < 0.12) continue; // poles, sign posts
      if (c.hx * c.hz < 0.6 && c.maxY < 10) continue; // small props
      B.colliders++;
      // conservative coverage: sample the rotated footprint every ≤1.5 m (edges included)
      const nx = Math.max(1, Math.ceil((c.hx * 2) / 1.5)),
        nz = Math.max(1, Math.ceil((c.hz * 2) / 1.5));
      const cs = c.cos !== undefined ? c.cos : Math.cos(-(c.yaw || 0)),
        sn = c.sin !== undefined ? c.sin : Math.sin(-(c.yaw || 0));
      for (let a = 0; a <= nx; a++) {
        const lx = -c.hx + (2 * c.hx * a) / nx;
        for (let b = 0; b <= nz; b++) {
          const lz = -c.hz + (2 * c.hz * b) / nz;
          // inverse of core's toLocal() (engine.js toWorldDir)
          const wx = c.cx + lx * cs + lz * sn,
            wz = c.cz - lx * sn + lz * cs;
          const i = Math.floor((wx - X0) / CELL),
            j = Math.floor((wz - Z0) / CELL);
          if (i < 0 || j < 0 || i >= W || j >= H) continue;
          const k = idx(i, j);
          if (c.maxY > height[k]) height[k] = c.maxY;
        }
      }
      if ((B.ci & 63) === 0 && performance.now() - t0 > lim) return false;
    }
    const n = W * H;
    for (let k = 0; k < n; k++)
      B.bld[k] = B.height[k] > B.ground[k] + 3 ? 1 : 0;
    return true;
  }

  // precomputed direction steps: direction d at angle d·22.5° (even d = the 8 stored azimuths)
  const DX = new Float32Array(DIRS),
    DZ = new Float32Array(DIRS);
  for (let d = 0; d < DIRS; d++) {
    const a = (d / DIRS) * Math.PI * 2;
    DX[d] = Math.cos(a);
    DZ[d] = Math.sin(a);
  }
  const topB = new Float32Array(8),
    dstB = new Float32Array(8);
  const enc = (v) => Math.max(0, Math.min(255, Math.round(v * 255)));

  function scanCell(i, j) {
    const height = B.height,
      ground = B.ground,
      bld = B.bld,
      data = P.data;
    const k = idx(i, j);
    const g = ground[k],
      h0 = g + 1.2,
      own = bld[k];
    let vis = 0,
      hcW = 0,
      hcS = 0;
    for (let d = 0; d < DIRS; d++) {
      let maxT = 0,
        maxH = 0,
        tTop = 0,
        tDst = 0,
        skip = own === 1;
      const dx = DX[d] / CELL,
        dz = DZ[d] / CELL;
      for (let s = 0; s < STEPS.length; s++) {
        const dist = STEPS[s];
        const qi = Math.floor(i + 0.5 + dx * dist),
          qj = Math.floor(j + 0.5 + dz * dist);
        if (qi < 0 || qj < 0 || qi >= W || qj >= H) break;
        const q = qj * W + qi;
        if (skip) {
          if (bld[q]) continue;
          skip = false;
        }
        const hq = height[q];
        const t = (hq - h0) / dist;
        if (t > maxT) {
          maxT = t;
          tTop = hq;
          tDst = dist;
        }
        const hh = hq - g;
        if (hh > maxH && t > 0.15) maxH = hh;
      }
      const cos2 = 1 / (1 + maxT * maxT);
      vis += cos2;
      const occ = 1 - cos2;
      hcS += maxH * occ;
      hcW += occ;
      if ((d & 1) === 0) {
        topB[d >> 1] = maxT > 0.02 ? tTop : -1e9;
        dstB[d >> 1] = tDst;
      }
    }
    vis /= DIRS;
    const hc = hcW > 1e-3 ? hcS / hcW : 0;
    let o = P.off(0, i, j);
    data[o] = enc(vis);
    data[o + 1] = enc(hc / HC_SCALE);
    data[o + 3] = 255;
    // azimuth pairs (p, p+4) → tiles 1..4
    for (let p = 0; p < 4; p++) {
      o = P.off(p + 1, i, j);
      const a = p,
        b = p + 4;
      data[o] = topB[a] < -1e8 ? 0 : Math.max(1, enc((topB[a] + 20) / 420));
      data[o + 1] = topB[a] < -1e8 ? 255 : enc(dstB[a] / 256);
      data[o + 2] = topB[b] < -1e8 ? 0 : Math.max(1, enc((topB[b] + 20) / 420));
      data[o + 3] = topB[b] < -1e8 ? 255 : enc(dstB[b] / 256);
    }
  }
  function stepScan(t0, lim) {
    const L = G.LAYOUT;
    while (B.row < H) {
      const j = B.row;
      const z = Z0 + (j + 0.5) * CELL;
      const end = Math.min(W, B.col + 100);
      for (let i = B.col; i < end; i++) {
        scanCell(i, j);
        let park = 0;
        try {
          park = L && L.inPark && L.inPark(X0 + (i + 0.5) * CELL, z) ? 1 : 0;
        } catch (e) {
          park = 0;
        }
        P.data[P.off(0, i, j) + 2] = park * 255;
      }
      B.col = end;
      if (B.col >= W) {
        B.col = 0;
        B.row++;
      }
      if (performance.now() - t0 > lim) return false;
    }
    return true;
  }
  // district albedo on a coarse 16 m grid, blurred, bilinearly written into tile 5
  function writeAlbedo() {
    const L = G.LAYOUT;
    const C = 4,
      cw = Math.ceil(W / C) + 1,
      ch = Math.ceil(H / C) + 1;
    let a = new Float32Array(cw * ch * 3);
    for (let cj = 0; cj < ch; cj++) {
      for (let ci = 0; ci < cw; ci++) {
        const x = X0 + ci * C * CELL,
          z = Z0 + cj * C * CELL;
        let d = "midtown";
        try {
          d = L && L.districtAt ? L.districtAt(x, z) : "midtown";
        } catch (e) {
          /* ignore */
        }
        const t = ALB[d] || [1, 1, 1];
        const o = (cj * cw + ci) * 3;
        a[o] = t[0];
        a[o + 1] = t[1];
        a[o + 2] = t[2];
      }
    }
    // 2 passes of a 3×3 box blur → ~40 m transitions at district borders
    for (let pass = 0; pass < 2; pass++) {
      const b = new Float32Array(a.length);
      for (let cj = 0; cj < ch; cj++)
        for (let ci = 0; ci < cw; ci++) {
          let r = 0,
            g = 0,
            bl = 0,
            n = 0;
          for (let dj = -1; dj <= 1; dj++)
            for (let di = -1; di <= 1; di++) {
              const x = ci + di,
                y = cj + dj;
              if (x < 0 || y < 0 || x >= cw || y >= ch) continue;
              const o = (y * cw + x) * 3;
              r += a[o];
              g += a[o + 1];
              bl += a[o + 2];
              n++;
            }
          const o = (cj * cw + ci) * 3;
          b[o] = r / n;
          b[o + 1] = g / n;
          b[o + 2] = bl / n;
        }
      a = b;
    }
    const data = P.data;
    for (let j = 0; j < H; j++) {
      const v = j / C,
        cj = Math.min(ch - 2, Math.floor(v)),
        fz = v - cj;
      for (let i = 0; i < W; i++) {
        const u = i / C,
          ci = Math.min(cw - 2, Math.floor(u)),
          fx = u - ci;
        const o00 = (cj * cw + ci) * 3,
          o10 = o00 + 3,
          o01 = o00 + cw * 3,
          o11 = o01 + 3;
        const o = P.off(5, i, j);
        for (let c = 0; c < 3; c++) {
          const val =
            (a[o00 + c] * (1 - fx) + a[o10 + c] * fx) * (1 - fz) +
            (a[o01 + c] * (1 - fx) + a[o11 + c] * fx) * fz;
          data[o + c] = enc(val * 0.5);
        }
        data[o + 3] = 255;
      }
    }
  }

  function finish() {
    try {
      writeAlbedo();
    } catch (e) {
      G.reportError("render_lighting/probes-albedo", e);
    }
    B.state = "done";
    B.phase = "done";
    B.height = B.ground = B.bld = null; // free ~3 MB
    P.tex.needsUpdate = true;
    // upload through the master texture object: every material's cloned uniform shares its Source
    // → same GL texture (see 00_core.js)
    try {
      if (G.renderer && G.renderer.initTexture) G.renderer.initTexture(P.tex);
    } catch (e) {
      /* uploaded on first use */
    }
    const Pv = U.nrcProbe.value;
    Pv.x = 1 / (W * CELL);
    Pv.y = 1 / (H * CELL);
    Pv.z = -X0 / (W * CELL);
    Pv.w = -Z0 / (H * CELL);
    RL.probesReady = true;
    G.events.emit("rlightProbesReady");
  }

  function startBake() {
    if (!RL.probes || !R.patched || B.state === "running" || B.state === "done")
      return;
    const n = W * H;
    B.height = new Float32Array(n);
    B.ground = new Float32Array(n);
    B.bld = new Uint8Array(n);
    B.state = "running";
    B.phase = "ground";
    B.row = 0;
    B.col = 0;
    B.ci = 0;
    B.colliders = 0;
    progress();
  }
  function progress() {
    if (B.state !== "running") return;
    const t0 = performance.now(),
      lim = budgetMs();
    try {
      if (B.phase === "ground" && stepGround(t0, lim)) {
        B.phase = "colliders";
      }
      if (
        B.phase === "colliders" &&
        performance.now() - t0 < lim &&
        stepColliders(t0, lim)
      ) {
        B.phase = "scan";
        B.row = 0;
        B.col = 0;
      }
      if (
        B.phase === "scan" &&
        performance.now() - t0 < lim &&
        stepScan(t0, lim)
      )
        finish();
    } catch (e) {
      G.reportError("render_lighting/probes", e);
      B.state = "failed";
      B.height = B.ground = B.bld = null;
    }
    const ms = performance.now() - t0;
    B.ms += ms;
    B.frames++;
    if (ms > B.maxFrameMs && lim < 1e8) B.maxFrameMs = ms;
  }

  /** CPU twin of the shader's sky term: sky visibility 0..1 at a world point (1 off-grid / indoors).
   *  Allocation-free (safe to call per NPC per frame). */
  RL.skyVisibility = function (x, y, z, upness) {
    if (B.state !== "done") return 1;
    const u = (x - X0) / CELL - 0.5,
      v = (z - Z0) / CELL - 0.5;
    const i = Math.floor(u),
      j = Math.floor(v);
    if (i < 0 || j < 0 || i >= W - 1 || j >= H - 1) return 1;
    const fx = u - i,
      fz = v - j,
      d = P.data;
    const o00 = P.off(0, i, j),
      o10 = o00 + 4,
      o01 = P.off(0, i, j + 1),
      o11 = o01 + 4;
    const w00 = (1 - fx) * (1 - fz),
      w10 = fx * (1 - fz),
      w01 = (1 - fx) * fz,
      w11 = fx * fz;
    if (
      d[o00 + 3] * w00 +
        d[o10 + 3] * w10 +
        d[o01 + 3] * w01 +
        d[o11 + 3] * w11 <
      127
    )
      return 1;
    const v0 =
      (d[o00] * w00 + d[o10] * w10 + d[o01] * w01 + d[o11] * w11) / 255;
    const hcv =
      (d[o00 + 1] * w00 +
        d[o10 + 1] * w10 +
        d[o01 + 1] * w01 +
        d[o11 + 1] * w11) /
      255;
    const hc = hcv * HC_SCALE + 2;
    const hy = Math.min(1, Math.max(0, (y || 0) / hc));
    let vv = v0 + (1 - v0) * hy * hy * (3 - 2 * hy);
    vv =
      vv +
      (Math.sqrt(vv) - vv) * Math.max(0, upness == null ? 0.5 : upness) * 0.5;
    return 1 + (OPT.minVis + (1 - OPT.minVis) * vv - 1) * OPT.strength;
  };
  RL.probeInfo = () => ({
    state: B.state,
    phase: B.phase,
    ms: Math.round(B.ms),
    frames: B.frames,
    maxFrameMs: +B.maxFrameMs.toFixed(1),
    colliders: B.colliders,
    cells: W * H,
    cell: CELL,
    atlas: P.aw + "x" + P.ah,
    atlasMB: +((P.aw * P.ah * 4) / 1048576).toFixed(1),
    bounce: [U.nrcBounce.value.x, U.nrcBounce.value.y, U.nrcBounce.value.z].map(
      (v) => +v.toFixed(3),
    ),
    bounceSun: [
      U.nrcBounceSun.value.x,
      U.nrcBounceSun.value.y,
      U.nrcBounceSun.value.z,
    ].map((v) => +v.toFixed(3)),
    key: {
      tan: +U.nrcHzK.value.w.toFixed(2),
      hor: +U.nrcHzL.value.x.toFixed(2),
    },
  });
  /** Tune the canyon terms: {strength, minVis, interreflect, facadeAlbedo, fillGain, alleyFill, skyline}. */
  RL.setProbeParams = function (o) {
    if (o) for (const k in OPT) if (typeof o[k] === "number") OPT[k] = o[k];
  };
  RL.getProbeParams = () => Object.assign({}, OPT);
  RL.setProbes = function (on) {
    RL.probes = !!on;
    try {
      localStorage.setItem("nrc_rl_probes", on ? "1" : "0");
    } catch (e) {
      /* ignore */
    }
    if (on && (B.state === "idle" || B.state === "failed") && B.initDone) {
      B.state = "idle";
      startBake();
    }
  };

  // ---------------------------------------------------------------- per-frame uniforms
  const _sky = new THREE.Color(),
    _sun = new THREE.Color(),
    _L = new THREE.Vector3();
  let vmVis = 1,
    vmBase = -1,
    vmWritten = -1;
  const TILE_X = [0, 1, 2, 0, 1, 2],
    TILE_Y = [0, 0, 0, 1, 1, 1];
  function update() {
    progress();
    const K = U.nrcProbeK.value;
    const indoors = R.interior();
    K.x = RL.probes && B.state === "done" && !indoors ? OPT.strength : 0;
    K.y = OPT.minVis;
    K.z = OPT.fillGain;
    K.w = HC_SCALE;
    if (K.x <= 0) return;
    const A = G.atmos || {};
    const hemi = A.hemi || (G.baseLights && G.baseLights.hemi),
      sun = A.sun || (G.baseLights && G.baseLights.sun);
    if (!hemi || !sun) return;
    // skyline taps bracketing the key light's azimuth (pairs p / p+4 share a texel)
    const HK = U.nrcHzK.value,
      HT = U.nrcHzT.value,
      HL = U.nrcHzL.value;
    if (R.keyDir(_L)) {
      let az = Math.atan2(_L.z, _L.x);
      if (az < 0) az += Math.PI * 2;
      const kf = az / (Math.PI / 4),
        k = Math.floor(kf) % 8,
        k1 = (k + 1) % 8;
      const t0 = (k % 4) + 1,
        t1 = (k1 % 4) + 1;
      HT.x = TILE_X[t0];
      HT.y = TILE_Y[t0];
      HT.z = TILE_X[t1];
      HT.w = TILE_Y[t1];
      HK.x = k >= 4 ? 1 : 0;
      HK.y = k1 >= 4 ? 1 : 0;
      HK.z = kf - Math.floor(kf);
      const lxz = Math.hypot(_L.x, _L.z);
      HK.w = Math.min(20, Math.max(0, _L.y) / Math.max(lxz, 0.05));
      HL.x = lxz;
    }
    HL.y = 0.06;
    HL.z = OPT.alleyFill;
    R.skylineOff = !(OPT.skyline > 0); // (10_cascade.js writes nrcHzL.w every frame)
    // interreflected sky (warm-grey multiple bounces between the walls) and sunlit-façade bounce
    _sky.copy(hemi.color).multiplyScalar(hemi.intensity);
    _sun.copy(sun.color).multiplyScalar(sun.intensity);
    const Bn = U.nrcBounce.value,
      Bs = U.nrcBounceSun.value;
    const ir = OPT.interreflect;
    Bn.x = _sky.r * ir * 1.06;
    Bn.y = _sky.g * ir;
    Bn.z = _sky.b * ir * 0.9;
    const fa = OPT.facadeAlbedo;
    Bs.x = _sun.r * fa;
    Bs.y = _sun.g * fa * 0.96;
    Bs.z = _sun.b * fa * 0.88;
  }

  // viewmodel: the first-person arms/gun sit in the same canyon. Atmosphere sets the viewmodel
  // hemisphere in its lateUpdate; we run after it and scale it — from the value atmosphere wrote
  // THIS frame (never compounding if atmosphere stopped writing), floored so it stacks gently
  // with atmosphere's own "in shadow" darkening.
  function late(dt, realDt) {
    const VL = G.viewLights;
    if (!VL || !VL.amb) return;
    const cur = VL.amb.intensity;
    if (cur !== vmWritten) vmBase = cur; // atmosphere rewrote it (normal case)
    if (vmBase < 0) return;
    let tgt = 1;
    if (
      B.state === "done" &&
      RL.probes &&
      !R.interior() &&
      !G.isStub("atmos")
    ) {
      const p = G.camera.position;
      const v = RL.skyVisibility(p.x, p.y, p.z, 0.3);
      // the hidden sky partly comes back as bounce (see update): net loss is ~half the occlusion
      tgt = Math.max(0.7, 1 - (1 - v) * 0.45);
    }
    vmVis = R.damp(vmVis, tgt, 3, realDt || 0.016);
    VL.amb.intensity = vmWritten = vmBase * vmVis;
  }

  R.addSystem({
    name: "probes",
    order: 20,
    update,
    late,
    init() {
      G.events.on("initDone", () => {
        B.initDone = true;
        startBake();
      });
    },
  });
})();
