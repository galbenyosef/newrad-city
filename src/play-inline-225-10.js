// play-inline-225 10 — math
// Lines 2624-2822 of readable/play-inline-225.pretty.js (statement-aligned).
  F.sofa = function (C, x, y, z, w, ry, o) {
    o = o || {};
    const b = o.batch || C.b,
      k = o.key || "leather";
    b.obox(k, x, y + 0.25, z, w, 0.25, 0.85, ry);
    const bk = rot(0, 0.35, x, z, ry);
    b.obox(k, bk[0], y + 0.55, bk[1], w, 0.55, 0.2, ry);
    for (const s of [-1, 1]) {
      const p = rot(s * (w / 2 - 0.1), 0, x, z, ry);
      b.obox(k, p[0], y + 0.45, p[1], 0.2, 0.4, 0.85, ry);
    }
    b.obox("wood_dark", x, y + 0.06, z, w, 0.12, 0.8, ry);
    if (o.col !== false)
      C.colRot(x, z, w, 0.85, y, y + 0.6, ry, {
        walkable: false,
        surface: "wood",
      });
  };
  /** Scattered paper sheets. */
  F.papers = function (C, x, y, z, R, n, seed, o) {
    const b = (o && o.batch) || C.b,
      r = LI.rng(seed || 5);
    for (let i = 0; i < n; i++) {
      const a = r() * TAU,
        d = Math.sqrt(r()) * R;
      b.flat(
        "paper",
        x + Math.cos(a) * d,
        y + 0.005 + r() * 0.01,
        z + Math.sin(a) * d,
        0.21 + r() * 0.1,
        0.28 + r() * 0.08,
        r() * TAU,
        { c: 0.75 + r() * 0.25 > 0.9 ? 0xe8e0c8 : 0xc8bca0 },
      );
    }
  };
  /** Rubble mound + chunks (walkable low heap, collider optional). */
  F.rubble = function (C, x, y, z, R, seed, o) {
    o = o || {};
    const b = o.batch || C.b,
      r = LI.rng(seed || 9);
    const g = new THREE.SphereGeometry(R, 10, 6, 0, TAU, 0, Math.PI / 2);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const yy = p.getY(i);
      p.setY(
        i,
        yy *
          (o.h || 0.45) *
          (0.8 + 0.4 * vnoise(p.getX(i) * 2 + seed, p.getZ(i) * 2)),
      );
      p.setX(i, p.getX(i) * (0.9 + 0.2 * r()));
    }
    b.add(o.key || "rubble", g, { m: M4(x, y, z, r() * TAU) });
    for (let i = 0; i < (o.n || 8); i++) {
      const a = r() * TAU,
        d = r() * R * 1.1;
      b.obox(
        r() < 0.5 ? "concrete" : o.chunk || "plaster",
        x + Math.cos(a) * d,
        y + 0.1 + r() * 0.15,
        z + Math.sin(a) * d,
        0.2 + r() * 0.5,
        0.12 + r() * 0.25,
        0.2 + r() * 0.4,
        r() * TAU,
        { rx: r() * 0.6, rz: r() * 0.6 },
      );
    }
    if (o.rebar !== false)
      for (let i = 0; i < 3; i++) {
        const a = r() * TAU;
        b.rod(
          "rust",
          [x + Math.cos(a) * R * 0.3, y + 0.2, z + Math.sin(a) * R * 0.3],
          [
            x + Math.cos(a) * R * (0.6 + r() * 0.6),
            y + 0.6 + r() * 0.9,
            z + Math.sin(a) * R * (0.6 + r() * 0.6),
          ],
          0.015,
        );
      }
    if (o.col)
      C.col(
        x - R * 0.6,
        y,
        z - R * 0.6,
        x + R * 0.6,
        y + (o.h || 0.45) * R * 0.7,
        z + R * 0.6,
        { surface: "rubble" },
      );
  };
  /** Crate stack (visual + collider). */
  F.crates = function (C, x, y, z, n, ry, o) {
    o = o || {};
    const b = o.batch || C.b,
      r = LI.rng(o.seed || (x * 31 + z * 17) | 0);
    for (let i = 0; i < n; i++) {
      const lx = (i % 2) * 0.95 - 0.45,
        ly = Math.floor(i / 2) * 0.75,
        p = rot(lx, (r() - 0.5) * 0.1, x, z, ry);
      b.obox(
        o.key || "wood",
        p[0],
        y + ly + 0.36,
        p[1],
        0.9,
        0.72,
        0.8,
        ry + (r() - 0.5) * 0.2,
      );
    }
    C.colRot(x, z, 1.9, 0.9, y, y + Math.ceil(n / 2) * 0.75, ry, {
      walkable: true,
      surface: "wood",
    });
  };
  /** Sandbag wall run between two points (visual + collider). */
  F.sandbags = function (C, p, q, y, rows, o) {
    o = o || {};
    const b = o.batch || C.b;
    rows = rows || 3;
    const L = Math.hypot(q[0] - p[0], q[1] - p[1]),
      ry = Math.atan2(-(q[1] - p[1]), q[0] - p[0]),
      n = Math.max(1, Math.round(L / 0.62));
    for (let rI = 0; rI < rows; rI++)
      for (let i = 0; i < n; i++) {
        const t = (i + 0.5 + (rI % 2) * 0.5) / n;
        if (t > 1) continue;
        b.sphere(
          o.key || "fabric",
          p[0] + (q[0] - p[0]) * t,
          y + 0.13 + rI * 0.24,
          p[1] + (q[1] - p[1]) * t,
          0.33,
          { ws: 7, hs: 4, sx: 1, sy: 0.4, sz: 0.62, ry, c: 0x9a8a6a },
        );
      }
    C.colRot(
      (p[0] + q[0]) / 2,
      (p[1] + q[1]) / 2,
      L,
      0.6,
      y,
      y + rows * 0.24 + 0.1,
      ry,
      { surface: "dirt", tag: "cover" },
    );
  };
  /** Wall-mounted framed picture using a texture key (uvRect optional). Faces +z rotated by ry. */
  F.frame = function (C, key, x, y, z, w, h, ry, o) {
    o = o || {};
    const b = o.batch || C.b;
    b.obox(o.frame || "gold", x, y, z, w + 0.16, h + 0.16, 0.05, ry);
    const f = rot(0, 0.03, x, z, ry);
    b.quad(key, f[0], y, f[1], w, h, ry, { uvRect: o.uvRect, rz: o.tilt || 0 });
  };
  /** Human skeleton visual (lying) when props is absent; otherwise props spawns one (see C.prop). */
  F.bones = function (C, x, y, z, ry, o) {
    o = o || {};
    const b = o.batch || C.b;
    b.sphere("bone", x, y + 0.1, z, 0.11, { ws: 8, hs: 6, sy: 1.1 });
    const p = rot(0, 0.5, x, z, ry);
    b.beam("bone", [x, y + 0.08, z], [p[0], y + 0.08, p[1]], 0.05, 0.05);
    for (let i = 0; i < 5; i++) {
      const q = rot(0, 0.2 + i * 0.07, x, z, ry);
      b.torus("bone", q[0], y + 0.1, q[1], 0.12, 0.012, {
        ts: 10,
        rs: 4,
        ry,
        rx: 0,
      });
    }
  };

  /**
   * Floor clutter (lived-in wreckage): papers, crumpled sheets, tin cans, bottles, plaster chunks,
   * splintered planks and soggy boxes, merged into the cell batch (no extra draw calls). Pieces are only placed
   * where the cell's colliders say there is bare floor at height y (never inside walls/furniture, never floating),
   * and they gather against walls and furniture like real debris. rect in local coords.
   * o: {n=60, seed, edge=0.8 (edge bias), mix:{paper,crumple,can,bottle,chunk,plank,box} weights, chunkKey}
   */
  function inPoly(pl, x, z) {
    let c = false;
    for (let i = 0, j = pl.length - 1; i < pl.length; j = i++) {
      const a = pl[i],
        b2 = pl[j];
      if (
        a[1] > z !== b2[1] > z &&
        x < ((b2[0] - a[0]) * (z - a[1])) / (b2[1] - a[1]) + a[0]
      )
        c = !c;
    }
    return c;
  }
  LI.inPoly = inPoly;
