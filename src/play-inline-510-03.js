// play-inline-510 03 — math
// Lines 696-1015 of readable/play-inline-510.pretty.js (statement-aligned).
  const NAV = (C.nav = {
    tiles: new Map(),
    frame: -1,
    budget: 0,
    builds: 0,
    stats: { searches: 0, found: 0, failed: 0, nodes: 0, tiles: 0 },
  });
  const NAV_TS = 64,
    NAV_PAD = 0.3,
    NAV_STEP = 0.55,
    NAV_DROP = 2.2,
    NAV_TTL = 45,
    NAV_MAX_TILES = 40;
  const NAV_NODES = 360,
    NAV_MAX_NODES = 2200,
    NAV_BUILDS = 1,
    NAV_W = 1.35;
  const navKey = (ix, iz) => (ix + 30000) * 60000 + (iz + 30000);
  function navFrame() {
    const f =
      G.time.frame !== undefined ? G.time.frame : Math.floor(now() * 60);
    if (NAV.frame !== f) {
      NAV.frame = f;
      NAV.budget = NAV_NODES;
      NAV.builds = NAV_BUILDS;
    }
  }
  C.navReset = function () {
    NAV.tiles.clear();
  };
  function navBuildTile(tx, tz) {
    const x0 = tx * NAV_TS,
      z0 = tz * NAV_TS,
      N = NAV_TS * NAV_TS;
    const terr = new Float32Array(N),
      lists = new Array(N);
    for (let iz = 0; iz < NAV_TS; iz++)
      for (let ix = 0; ix < NAV_TS; ix++)
        terr[iz * NAV_TS + ix] = G.world.terrainHeight(
          x0 + ix + 0.5,
          z0 + iz + 0.5,
        );
    const cs = G.world.query(x0 - 1, z0 - 1, x0 + NAV_TS + 1, z0 + NAV_TS + 1);
    for (const c of cs) {
      if (c.tag === "actor") continue;
      const bb = c.bb;
      if (!bb) continue;
      const ix0 = Math.max(0, Math.floor(bb.x0 - NAV_PAD - x0)),
        ix1 = Math.min(NAV_TS - 1, Math.floor(bb.x1 + NAV_PAD - x0));
      const iz0 = Math.max(0, Math.floor(bb.z0 - NAV_PAD - z0)),
        iz1 = Math.min(NAV_TS - 1, Math.floor(bb.z1 + NAV_PAD - z0));
      for (let iz = iz0; iz <= iz1; iz++)
        for (let ix = ix0; ix <= ix1; ix++) {
          const i = iz * NAV_TS + ix;
          (lists[i] || (lists[i] = [])).push(c);
        }
    }
    NAV.stats.tiles++;
    return { tx, tz, x0, z0, terr, lists, built: now(), used: now() };
  }
  /** Tile containing world cell (ix, iz); builds it when the per-frame budget allows (null = not yet). */
  function navTileFor(ix, iz) {
    const tx = Math.floor(ix / NAV_TS),
      tz = Math.floor(iz / NAV_TS),
      k = tx * 100000 + tz;
    let t = NAV.tiles.get(k);
    const T = now();
    if (t && T - t.built > NAV_TTL && NAV.builds > 0) t = null; // colliders may have changed (doors, quest props)
    if (t) {
      t.used = T;
      return t;
    }
    if (NAV.builds <= 0) return null;
    NAV.builds--;
    t = navBuildTile(tx, tz);
    NAV.tiles.set(k, t);
    if (NAV.tiles.size > NAV_MAX_TILES) {
      let ok = null,
        ou = 1e9;
      for (const [kk, tt] of NAV.tiles)
        if (tt.used < ou && tt !== t) {
          ou = tt.used;
          ok = kk;
        }
      if (ok !== null) NAV.tiles.delete(ok);
    }
    return t;
  }
  function navTileHas(ix, iz) {
    return (
      NAV.tiles.get(
        Math.floor(ix / NAV_TS) * 100000 + Math.floor(iz / NAV_TS),
      ) || null
    );
  }
  /** Walkable ground at (x,z) reachable from height yRef (step up ≤ NAV_STEP). */
  function navGround(t, x, z, yRef, terrain) {
    const ix = Math.floor(x) - t.x0,
      iz = Math.floor(z) - t.z0;
    const i = iz * NAV_TS + ix;
    let best = terrain !== undefined ? terrain : t.terr[i];
    const L = t.lists[i];
    if (L)
      for (let k = 0; k < L.length; k++) {
        const c = L[k];
        if (
          c.walkable &&
          c.maxY > best &&
          c.maxY <= yRef + NAV_STEP &&
          G.world.pointInCollider(c, x, z, 0.05)
        )
          best = c.maxY;
      }
    return best;
  }
  function navBlocked(t, x, z, h, clear) {
    const ix = Math.floor(x) - t.x0,
      iz = Math.floor(z) - t.z0;
    const L = t.lists[iz * NAV_TS + ix];
    if (!L) return false;
    for (let k = 0; k < L.length; k++) {
      const c = L[k];
      if (
        c.maxY > h + NAV_STEP &&
        c.minY < h + clear &&
        G.world.pointInCollider(c, x, z, NAV_PAD)
      )
        return true;
    }
    return false;
  }
  /** Step from (x,z,h) to the centre of cell (cix,ciz): arrival height, or NaN if impassable. */
  function navStep(S, x, z, h, cix, ciz) {
    const cx = cix + 0.5,
      cz = ciz + 0.5,
      mx = (x + cx) * 0.5,
      mz = (z + cz) * 0.5;
    const tm = navTileHas(Math.floor(mx), Math.floor(mz)),
      tc = navTileHas(cix, ciz);
    if (!tm || !tc) return NaN;
    // terrain at the half-way point: mean of the two cached cell samples (terrain is smooth; water edges stay impassable)
    const ti = (Math.floor(z) - tc.z0) * NAV_TS + (Math.floor(x) - tc.x0);
    const tParent =
      ti >= 0 &&
      ti < NAV_TS * NAV_TS &&
      Math.floor(x) - tc.x0 >= 0 &&
      Math.floor(x) - tc.x0 < NAV_TS
        ? tc.terr[ti]
        : G.world.terrainHeight(x, z);
    const tChild = tc.terr[(ciz - tc.z0) * NAV_TS + (cix - tc.x0)];
    const hm = navGround(tm, mx, mz, h, (tParent + tChild) * 0.5);
    if (hm < h - NAV_DROP || navBlocked(tm, mx, mz, hm, S.clear)) return NaN;
    const hc = navGround(tc, cx, cz, hm);
    if (hc < hm - NAV_DROP) return NaN;
    if (!S.amph && hc < G.world.waterLevel - 0.3) return NaN;
    if (navBlocked(tc, cx, cz, hc, S.clear)) return NaN;
    return hc;
  }
  // binary heap (keys + f)
  function heapPush(S, k, f) {
    const hk = S.hk,
      hf = S.hf;
    let i = hk.length;
    hk.push(k);
    hf.push(f);
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (hf[p] <= f) break;
      hk[i] = hk[p];
      hf[i] = hf[p];
      i = p;
    }
    hk[i] = k;
    hf[i] = f;
  }
  function heapPop(S) {
    const hk = S.hk,
      hf = S.hf;
    const top = hk[0];
    const lk = hk.pop(),
      lf = hf.pop();
    const n = hk.length;
    if (n) {
      let i = 0;
      for (;;) {
        let c = 2 * i + 1;
        if (c >= n) break;
        if (c + 1 < n && hf[c + 1] < hf[c]) c++;
        if (hf[c] >= lf) break;
        hk[i] = hk[c];
        hf[i] = hf[c];
        i = c;
      }
      hk[i] = lk;
      hf[i] = lf;
    }
    return top;
  }
  const NAV_DIRS = [
    [1, 0, 1],
    [-1, 0, 1],
    [0, 1, 1],
    [0, -1, 1],
    [1, 1, 1.4142],
    [1, -1, 1.4142],
    [-1, 1, 1.4142],
    [-1, -1, 1.4142],
  ];
  function navStart(a, gx, gz) {
    const six = Math.floor(a.pos.x),
      siz = Math.floor(a.pos.z);
    const S = {
      six,
      siz,
      gx,
      gz,
      gix: Math.floor(gx),
      giz: Math.floor(gz),
      g: new Map(),
      h: new Map(),
      par: new Map(),
      closed: new Set(),
      hk: [],
      hf: [],
      nodes: 0,
      bestK: 0,
      bestH: 1e9,
      clear: C.clamp(a.height || 1.8, 0.6, 2.4),
      amph: !!a.td.amphibious,
      sx: a.pos.x,
      sz: a.pos.z,
      maxR: C.clamp(Math.hypot(gx - a.pos.x, gz - a.pos.z) * 1.8 + 24, 40, 130),
      path: null,
      t0: now(),
    };
    const k = navKey(six, siz);
    S.g.set(k, 0);
    S.h.set(k, a.pos.y);
    S.par.set(k, -1);
    heapPush(S, k, 0);
    S.bestK = k;
    S.bestH = Math.hypot(gx - a.pos.x, gz - a.pos.z);
    NAV.stats.searches++;
    return S;
  }
  /** Run a search for up to the remaining per-frame budget: 'found' | 'fail' | 'pending'. */
  function navRun(S) {
    navFrame();
    while (NAV.budget > 0) {
      if (!S.hk.length || S.nodes >= NAV_MAX_NODES) return navFinish(S, false);
      const k = S.hk[0];
      if (S.closed.has(k)) {
        heapPop(S);
        continue;
      }
      const ix = Math.floor(k / 60000) - 30000,
        iz = (k % 60000) - 30000;
      // make sure the tiles around this cell exist (budgeted builds; resume next frame otherwise)
      if (
        !navTileFor(ix - 1, iz - 1) ||
        !navTileFor(ix + 1, iz - 1) ||
        !navTileFor(ix - 1, iz + 1) ||
        !navTileFor(ix + 1, iz + 1)
      )
        return "pending";
      heapPop(S);
      S.closed.add(k);
      S.nodes++;
      NAV.budget--;
      NAV.stats.nodes++;
      const x = ix + 0.5,
        z = iz + 0.5;
      const dgoal = Math.hypot(S.gx - x, S.gz - z);
      if (dgoal < S.bestH) {
        S.bestH = dgoal;
        S.bestK = k;
      }
      if (dgoal < 1.1) return navFinish(S, true);
      const gk = S.g.get(k),
        hk = S.h.get(k);
      const sx0 = k === navKey(S.six, S.siz) ? S.sx : x,
        sz0 = k === navKey(S.six, S.siz) ? S.sz : z;
      for (let d = 0; d < 8; d++) {
        const D = NAV_DIRS[d],
          nix = ix + D[0],
          niz = iz + D[1],
          nk = navKey(nix, niz);
        if (S.closed.has(nk)) continue;
        if (Math.hypot(nix + 0.5 - S.sx, niz + 0.5 - S.sz) > S.maxR) continue;
        if (D[2] > 1) {
          // no corner cutting: both orthogonal neighbours must be free at this height
          const ta = navTileHas(ix + D[0], iz),
            tb = navTileHas(ix, iz + D[1]);
          if (
            !ta ||
            !tb ||
            navBlocked(ta, ix + D[0] + 0.5, z, hk, S.clear) ||
            navBlocked(tb, x, iz + D[1] + 0.5, hk, S.clear)
          )
            continue;
        }
        const nh = navStep(S, sx0, sz0, hk, nix, niz);
        if (nh !== nh) continue; // NaN
        const ng = gk + D[2] + Math.abs(nh - hk) * 0.6;
        const og = S.g.get(nk);
        if (og !== undefined && og <= ng) continue;
        S.g.set(nk, ng);
        S.h.set(nk, nh);
        S.par.set(nk, k);
        const hx = Math.abs(S.gx - (nix + 0.5)),
          hz = Math.abs(S.gz - (niz + 0.5));
        heapPush(
          S,
          nk,
          ng + NAV_W * (Math.max(hx, hz) + 0.4142 * Math.min(hx, hz)),
        );
      }
    }
    return "pending";
  }
