// play-inline-263 02 — key
// Lines 20-299 of readable/play-inline-263.pretty.js (statement-aligned).
  const P = G._ues;
  const TAU = P.TAU,
    PI = P.PI,
    HP = P.HP;
  const A = (P.arch = {});

  /**
   * Partition along X (constant z) with two finishes: keyN faces -z, keyS faces +z. Heights may differ per side
   * (hN / hS measured from y0). holes like S.wallX (shared by both sides).
   */
  A.wall2X = function (S, z, x0, x1, y0, hN, hS, keyN, keyS, holes, o) {
    o = o || {};
    const t = o.t || 0.4;
    S.wallX(keyN, z - t / 4, x0, x1, y0, y0 + hN, t / 2, holes, {
      noCol: hN < hS,
      grime: o.grime,
    });
    S.wallX(keyS, z + t / 4, x0, x1, y0, y0 + hS, t / 2, holes, {
      noCol: hS <= hN,
      grime: o.grime,
    });
    // collider for the full thickness up to the taller side
    if (o.frame)
      for (const h of holes || [])
        A.doorway(
          S,
          "x",
          z,
          (h[0] + h[1]) / 2,
          h[1] - h[0],
          y0 + (h[2] || 0),
          (h[3] || 3) - (h[2] || 0),
          t,
          o.frame,
          o.frameO,
        );
  };
  A.wall2Z = function (S, x, z0, z1, y0, hW, hE, keyW, keyE, holes, o) {
    o = o || {};
    const t = o.t || 0.4;
    S.wallZ(keyW, x - t / 4, z0, z1, y0, y0 + hW, t / 2, holes, {
      noCol: hW < hE,
      grime: o.grime,
    });
    S.wallZ(keyE, x + t / 4, z0, z1, y0, y0 + hE, t / 2, holes, {
      noCol: hE <= hW,
      grime: o.grime,
    });
    if (o.frame)
      for (const h of holes || [])
        A.doorway(
          S,
          "z",
          x,
          (h[0] + h[1]) / 2,
          h[1] - h[0],
          y0 + (h[2] || 0),
          (h[3] || 3) - (h[2] || 0),
          t,
          o.frame,
          o.frameO,
        );
  };
  /** Door surround: jambs + lintel (+ optional pediment / cornice) on both faces. axis 'x' = wall along x at c. */
  A.doorway = function (S, axis, c, u, w, y0, h, t, key, o) {
    o = o || {};
    const b = S.b,
      fw = o.fw || 0.22,
      fd = t / 2 + (o.proj || 0.07);
    const box = (u0, u1, ya, yb, d0, d1) => {
      if (axis === "x")
        b.box(key, u0, ya, c + d0, u1, yb, c + d1, { seg: false, noAO: true });
      else
        b.box(key, c + d0, ya, u0, c + d1, yb, u1, { seg: false, noAO: true });
    };
    box(u - w / 2 - fw, u - w / 2, y0, y0 + h, -fd, fd);
    box(u + w / 2, u + w / 2 + fw, y0, y0 + h, -fd, fd);
    box(
      u - w / 2 - fw - 0.05,
      u + w / 2 + fw + 0.05,
      y0 + h,
      y0 + h + fw * 1.2,
      -fd - 0.02,
      fd + 0.02,
    );
    if (o.cornice)
      box(
        u - w / 2 - fw - 0.25,
        u + w / 2 + fw + 0.25,
        y0 + h + fw * 1.2,
        y0 + h + fw * 1.2 + 0.16,
        -fd - 0.12,
        fd + 0.12,
      );
  };

  // ------------------------------------------------------------------
  // Classical orders
  // ------------------------------------------------------------------
  /** Free-standing column: base, fluted-look shaft (12 seg lathe with entasis), capital. order: 'ionic'|'doric'|'corinthian'. */
  A.column = function (b, key, x, y, z, h, r, order, o) {
    o = o || {};
    const bh = r * 0.9,
      ch = order === "doric" ? r * 0.7 : r * 1.3;
    // plinth + torus base
    b.box(
      o.base || key,
      x - r * 1.35,
      y,
      z - r * 1.35,
      x + r * 1.35,
      y + bh * 0.45,
      z + r * 1.35,
      { seg: false },
    );
    b.lathe(
      o.base || key,
      [
        [0.001, 0],
        [r * 1.25, 0],
        [r * 1.25, bh * 0.2],
        [r * 1.05, bh * 0.35],
        [r * 1.12, bh * 0.45],
        [r, bh * 0.55],
        [0.001, bh * 0.55],
      ],
      12,
      x,
      y + bh * 0.45,
      z,
      { noAO: true },
    );
    // shaft with entasis
    const sh = h - bh - ch;
    b.lathe(
      key,
      [
        [r, 0],
        [r * 1.02, sh * 0.33],
        [r * 0.93, sh * 0.8],
        [r * 0.86, sh],
      ],
      o.seg || 14,
      x,
      y + bh,
      z,
      { hSeg: 3 },
    );
    const cy = y + bh + sh;
    if (order === "doric") {
      b.cyl(key, x, cy, z, r * 1.05, r * 0.88, ch * 0.4, 12, { noAO: true });
      b.box(
        key,
        x - r * 1.2,
        cy + ch * 0.4,
        z - r * 1.2,
        x + r * 1.2,
        cy + ch,
        z + r * 1.2,
        { seg: false, noAO: true },
      );
    } else if (order === "ionic") {
      b.cyl(key, x, cy, z, r * 1.0, r * 0.88, ch * 0.3, 12, { noAO: true });
      // volutes (a scroll either side) + abacus
      for (const s of [-1, 1])
        b.torus(
          key,
          x + s * r * 0.95,
          cy + ch * 0.45,
          z,
          r * 0.28,
          r * 0.12,
          TAU,
          { ry: HP, ts: 10, rs: 5, noAO: true, sz: 1.4 },
        );
      b.box(
        key,
        x - r * 1.05,
        cy + ch * 0.3,
        z - r * 0.75,
        x + r * 1.05,
        cy + ch * 0.62,
        z + r * 0.75,
        { seg: false, noAO: true },
      );
      b.box(
        key,
        x - r * 1.15,
        cy + ch * 0.62,
        z - r * 1.15,
        x + r * 1.15,
        cy + ch,
        z + r * 1.15,
        { seg: false, noAO: true },
      );
    } else {
      // corinthian-ish: bell with leaves
      b.lathe(
        key,
        [
          [r * 0.88, 0],
          [r * 1.0, ch * 0.3],
          [r * 1.25, ch * 0.75],
          [r * 1.35, ch * 0.8],
          [0.001, ch * 0.8],
        ],
        12,
        x,
        cy,
        z,
        { noAO: true },
      );
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * TAU;
        b.box(
          key,
          x + Math.cos(a) * r * 0.95 - 0.05,
          cy + ch * 0.05,
          z + Math.sin(a) * r * 0.95 - 0.05,
          x + Math.cos(a) * r * 0.95 + 0.05,
          cy + ch * 0.5,
          z + Math.sin(a) * r * 0.95 + 0.05,
          { seg: false, noAO: true },
        );
      }
      b.box(
        key,
        x - r * 1.3,
        cy + ch * 0.8,
        z - r * 1.3,
        x + r * 1.3,
        cy + ch,
        z + r * 1.3,
        { seg: false, noAO: true },
      );
    }
    if (o.col !== false && o.S)
      o.S.col(x - r, y, z - r, x + r, y + h, z + r, { walkable: false });
  };
  /** Pilaster on a facade F at u (width w), y0..y1, projecting d. */
  A.pilaster = function (F, key, u, w, y0, y1, d, o) {
    o = o || {};
    F.box(key, u - w / 2 - 0.06, u + w / 2 + 0.06, y0, y0 + 0.5, 0, d + 0.06, {
      seg: false,
    });
    F.box(key, u - w / 2, u + w / 2, y0 + 0.5, y1 - 0.45, 0, d, { seg: false });
    // flutes (shadow grooves)
    if (o.flutes !== false)
      for (let k = -1; k <= 1; k++)
        F.box(
          o.groove || "ashlar_dark",
          u + k * w * 0.26 - 0.025,
          u + k * w * 0.26 + 0.025,
          y0 + 0.7,
          y1 - 0.7,
          d,
          d + 0.012,
          { seg: false, noAO: true },
        );
    F.box(key, u - w / 2 - 0.1, u + w / 2 + 0.1, y1 - 0.45, y1, 0, d + 0.1, {
      seg: false,
    });
    if (o.ionic)
      for (const s of [-1, 1])
        F.box(
          key,
          u + s * (w / 2) - 0.09,
          u + s * (w / 2) + 0.09,
          y1 - 0.42,
          y1 - 0.15,
          d,
          d + 0.14,
          { seg: false },
        );
  };

  // ------------------------------------------------------------------
  // Balustrades, urns, fences, lamps, flags
  // ------------------------------------------------------------------
  /** Stone balustrade along polyline pts [[x,z],...] with base at y. o: {key, h, step, col, post (post every n m)}. */
