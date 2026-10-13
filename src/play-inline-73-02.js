// play-inline-73 02 — math
// Lines 40-378 of readable/play-inline-73.pretty.js (statement-aligned).
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

