// play-inline-379 03 — math
// Lines 32-294 of readable/play-inline-379.pretty.js (statement-aligned).
  let railMat = null;
  function getRailMat() {
    if (railMat) return railMat;
    railMat = new THREE.MeshStandardMaterial({
      color: 0x3a3632,
      roughness: 0.62,
      metalness: 0.45,
    });
    railMat.userData.shared = true;
    return railMat;
  }

  function guard(ox, oz, opts) {
    opts = opts || {};
    const t0 = performance.now();
    const W = G.world,
      half = opts.half || 160;
    if (!W || typeof W.query !== "function") return 0;
    const all = W.query(ox - half, oz - half, ox + half, oz + half);
    const floors = all.filter(
      (c) =>
        c.walkable !== false &&
        c.hx * c.hz * 4 >= 0.12 &&
        c.cx > ox - half &&
        c.cx < ox + half &&
        c.cz > oz - half &&
        c.cz < oz + half &&
        c.tag !== "poi_guard" &&
        c.tag !== "poi_clutter",
    );
    const hasFloor = (x, z, y) => {
      if (y <= 0.35 && y >= -0.35) return true; // ground-level floors of non-lifted cells: the cell terrain (y 0) is the floor
      for (const c of W.query(x - 0.05, z - 0.05, x + 0.05, z + 0.05)) {
        if (
          c.walkable !== false &&
          c.maxY <= y + 0.6 &&
          c.maxY >= y - 12 &&
          W.pointInCollider(c, x, z, 0)
        )
          return true;
      }
      return false;
    };
    const blocked = (x, z, y) => {
      for (const c of W.query(x - 0.3, z - 0.3, x + 0.3, z + 0.3)) {
        if (
          c.maxY > y + 0.6 &&
          c.minY < y + 1.7 &&
          W.pointInCollider(c, x, z, 0.12)
        )
          return true;
      }
      return false;
    };
    // 1. void runs per floor edge, as world-space segments {ax,az,bx,bz,y}
    const segs = [];
    const toW = (c, lx, lz) => [
      c.cx + lx * c.cos + lz * c.sin,
      c.cz - lx * c.sin + lz * c.cos,
    ];
    for (const c of floors) {
      const y = c.maxY;
      for (const axis of ["x", "z"]) {
        for (const sgn of [-1, 1]) {
          const L = axis === "x" ? c.hz : c.hx;
          const n = Math.max(1, Math.round((2 * L) / 0.5));
          const step = (2 * L) / n;
          let runStart = null;
          const emit = (t0_, t1_) => {
            if (t1_ - t0_ < 0.05) return;
            const off = 0.11;
            const a =
              axis === "x"
                ? toW(c, sgn * (c.hx + off), t0_)
                : toW(c, t0_, sgn * (c.hz + off));
            const b =
              axis === "x"
                ? toW(c, sgn * (c.hx + off), t1_)
                : toW(c, t1_, sgn * (c.hz + off));
            segs.push({ ax: a[0], az: a[1], bx: b[0], bz: b[1], y });
          };
          for (let i = 0; i <= n; i++) {
            let isVoid = false;
            if (i < n) {
              const t = -L + (i + 0.5) * step;
              isVoid = true;
              for (const dOut of [0.3, 0.6, 0.9]) {
                const lx = axis === "x" ? sgn * (c.hx + dOut) : t,
                  lz = axis === "x" ? t : sgn * (c.hz + dOut);
                const w = toW(c, lx, lz);
                if (dOut === 0.3 && blocked(w[0], w[1], y)) {
                  isVoid = false;
                  break;
                }
                if (hasFloor(w[0], w[1], y)) {
                  isVoid = false;
                  break;
                }
              }
            }
            if (isVoid && runStart === null) runStart = -L + i * step;
            if (!isVoid && runStart !== null) {
              emit(runStart, -L + i * step);
              runStart = null;
            }
          }
        }
      }
    }
    // 2. merge collinear, touching segments (same line, same floor height)
    const groups = new Map();
    for (const s of segs) {
      let dx = s.bx - s.ax,
        dz = s.bz - s.az;
      const len = Math.hypot(dx, dz) || 1;
      dx /= len;
      dz /= len;
      if (dx < -1e-6 || (Math.abs(dx) < 1e-6 && dz < 0)) {
        dx = -dx;
        dz = -dz;
        const tx = s.ax,
          tz = s.az;
        s.ax = s.bx;
        s.az = s.bz;
        s.bx = tx;
        s.bz = tz;
      }
      const ang = Math.round(Math.atan2(dz, dx) * 200) / 200,
        nx = -dz,
        nz = dx;
      const d = Math.round((s.ax * nx + s.az * nz) * 20) / 20;
      const k = ang + "|" + d + "|" + Math.round(s.y * 10);
      let g = groups.get(k);
      if (!g) {
        g = { dx, dz, nx, nz, d, y: s.y, iv: [] };
        groups.set(k, g);
      }
      const t0_ = s.ax * dx + s.az * dz,
        t1_ = s.bx * dx + s.bz * dz;
      g.iv.push([Math.min(t0_, t1_), Math.max(t0_, t1_)]);
    }
    const runs = [];
    for (const g of groups.values()) {
      g.iv.sort((a, b) => a[0] - b[0]);
      let cur = null;
      for (const iv of g.iv) {
        if (cur && iv[0] <= cur[1] + 0.12) cur[1] = Math.max(cur[1], iv[1]);
        else {
          if (cur) runs.push({ g, t0: cur[0], t1: cur[1] });
          cur = iv.slice();
        }
      }
      if (cur) runs.push({ g, t0: cur[0], t1: cur[1] });
    }
    // 3. colliders (one per run) + railing geometry
    const doors = opts.doors || [];
    const nearDoor = (x, z, y) =>
      doors.some(
        (p) =>
          Math.hypot(p.x - x, p.z - z) < 2.6 && Math.abs((p.y || 0) - y) < 3,
      );
    const added = [];
    const pos = [],
      idx = [];
    const boxV = (cx, cy, cz, sx, sy, sz, dir) => {
      const c = dir[0],
        s = dir[1],
        b = pos.length / 3; // local x runs along dir
      for (const [px, py, pz] of [
        [-1, -1, -1],
        [1, -1, -1],
        [1, 1, -1],
        [-1, 1, -1],
        [-1, -1, 1],
        [1, -1, 1],
        [1, 1, 1],
        [-1, 1, 1],
      ]) {
        const lx = (px * sx) / 2,
          lz = (pz * sz) / 2;
        pos.push(
          cx + lx * c - lz * s,
          cy + (py * sy) / 2,
          cz + lx * s + lz * c,
        );
      }
      for (const f of [
        [0, 2, 1, 0, 3, 2],
        [4, 5, 6, 4, 6, 7],
        [0, 1, 5, 0, 5, 4],
        [3, 7, 6, 3, 6, 2],
        [0, 4, 7, 0, 7, 3],
        [1, 2, 6, 1, 6, 5],
      ])
        for (const i of f) idx.push(b + i);
    };
    for (const r of runs) {
      const g = r.g,
        len = r.t1 - r.t0;
      if (len < 0.05) continue;
      const tm = (r.t0 + r.t1) / 2;
      const cx = g.dx * tm + g.nx * g.d,
        cz = g.dz * tm + g.nz * g.d;
      const yaw = Math.atan2(g.dz, g.dx),
        dir = [g.dx, g.dz]; // addCollider yaw: local x runs along (dx,dz)
      added.push(
        W.addCollider(cx, cz, len, 0.2, g.y - 0.4, g.y + 2.6, yaw, {
          tag: "poi_guard",
          walkable: false,
          surface: "metal",
        }),
      );
      if (!opts.parent || len < 0.5) continue;
      // railing, split around doors
      const nPost = Math.max(1, Math.round(len / 1.3));
      let seg0 = null;
      const flushRail = (ta, tb) => {
        if (tb - ta < 0.4) return;
        const m = (ta + tb) / 2,
          x = g.dx * m + g.nx * g.d,
          z = g.dz * m + g.nz * g.d;
        boxV(x, g.y + 1.0, z, tb - ta, 0.05, 0.06, dir);
        boxV(x, g.y + 0.52, z, tb - ta, 0.035, 0.035, dir);
      };
      for (let i = 0; i <= nPost; i++) {
        const t = r.t0 + (len * i) / nPost,
          x = g.dx * t + g.nx * g.d,
          z = g.dz * t + g.nz * g.d;
        const nd = nearDoor(x, z, g.y);
        if (!nd) {
          boxV(x, g.y + 0.5, z, 0.05, 1.02, 0.05, dir);
          if (seg0 === null) seg0 = t;
        }
        if ((nd || i === nPost) && seg0 !== null) {
          flushRail(seg0, nd ? t - len / nPost : t);
          seg0 = null;
        }
      }
    }
    if (opts.parent && pos.length) {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
      geo.setIndex(
        pos.length / 3 > 65535
          ? new THREE.Uint32BufferAttribute(idx, 1)
          : new THREE.Uint16BufferAttribute(idx, 1),
      );
      const ng = geo.toNonIndexed();
      ng.computeVertexNormals();
      ng.computeBoundingSphere();
      const mesh = new THREE.Mesh(ng, getRailMat());
      mesh.name = "poi_guard_rail";
      mesh.matrixAutoUpdate = false;
      mesh.updateMatrix();
      opts.parent.add(mesh);
    }
    G.poiVoidGuards = (G.poiVoidGuards || 0) + added.length;
    G.poiVoidGuardSegs = (G.poiVoidGuardSegs || 0) + segs.length;
    G.poiVoidGuardMs = (G.poiVoidGuardMs || 0) + (performance.now() - t0);
    return added.length;
  }
  guard.version = VERSION;
  G.poiVoidGuard = guard;
