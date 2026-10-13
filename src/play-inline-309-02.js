// play-inline-309 02 — box
// Lines 31-172 of readable/play-inline-309.pretty.js (statement-aligned).
  const P = G._pe,
    D = P.dress,
    E = P.dress2;
  const PI = P.PI,
    HP = P.HP,
    TAU = P.TAU;
  const NL = (P.nyl = P.nyl || {});

  /** Rectangular pyramid geometry (apex up), base centred at origin, half-widths hx/hz, height h. */
  function pyramidGeo(hx, hz, h, open) {
    const g = new THREE.ConeGeometry(Math.SQRT2, 1, 4, 1, !!open);
    g.rotateY(PI / 4);
    g.translate(0, 0.5, 0);
    g.scale(hx, h, hz);
    return g;
  }
  NL.pyramidGeo = pyramidGeo;

  // ===================================================================
  // EXTERIOR
  // ===================================================================
  /** Gothic limestone facade: piers, window columns, tracery spandrels, pinnacled cornice. */
  function gothicFace(S, side, a0, a1, c, y0, y1, o) {
    o = o || {};
    const F = P.face(S, side, a0, a1, c);
    const r = P.rng("nyl" + side + a0 + c + y0);
    const bay = o.bay || 2.9,
      n = Math.max(2, Math.round(F.len / bay)),
      bw = F.len / n,
      fh = o.floorH || 3.4;
    const wy0 = o.winStart !== undefined ? o.winStart : y0 + 1.1;
    const skip = o.skip || (() => false);
    for (let k = 0; k <= n; k++) {
      const u = k * bw,
        corner = k === 0 || k === n,
        pw = corner ? 1.1 : 0.62;
      const ua = corner ? (k === 0 ? -0.3 : u - 0.8) : u - pw / 2,
        ub = corner ? (k === 0 ? 0.8 : u + 0.3) : u + pw / 2;
      const ya = o.pierFrom !== undefined ? Math.max(y0, o.pierFrom) : y0;
      F.box("limestone", ua, ub, ya, y1, 0, 0.4, { segLen: 6 });
      if (o.pinnacles !== false && !corner && k % 2 === 0) {
        const [px, pz] = F.pt(u, 0.2);
        S.b.cyl("limestone", px, y1 + 0.9, pz, 0.02, 0.28, 1.6, 4, {
          ry: PI / 4,
        });
      }
    }
    for (let k = 0; k < n; k++) {
      const u = (k + 0.5) * bw;
      for (let y = wy0, f = 0; y + 2.0 < y1 - 0.8; y += fh, f++) {
        if (skip(u, y)) continue;
        const q = r();
        F.box(
          q < 0.08
            ? "glass_broken"
            : q < 0.12 && y < 40
              ? "wood_rotten"
              : "glass_dark",
          u - bw * 0.3,
          u + bw * 0.3,
          y,
          y + 2.1,
          -0.01,
          0.05,
          { seg: false, noAO: true, grime: 0.15 },
        );
        // tracery spandrel panel under the window (darker stone, a small trefoil)
        F.box(
          "limestone_dark",
          u - bw * 0.3,
          u + bw * 0.3,
          y - fh + 2.1 + 0.1,
          y - 0.1,
          0.0,
          0.1,
          { seg: false, grime: 0.5 },
        );
      }
    }
    // cornice + parapet with gothic arcading
    F.box("limestone", -0.4, F.len + 0.4, y1 - 0.2, y1 + 0.35, 0, 0.7, {
      seg: false,
    });
    F.box("limestone", -0.3, F.len + 0.3, y1 + 0.35, y1 + 1.3, -0.1, 0.3, {
      seg: false,
    });
    for (let u = 0.6; u < F.len - 0.4; u += 1.2)
      F.box(
        "limestone_dark",
        u - 0.3,
        u + 0.3,
        y1 + 0.5,
        y1 + 1.1,
        0.26,
        0.32,
        { seg: false, noAO: true },
      );
    return F;
  }
  /** Block of the tower: core box + four gothic faces + collider + roof. */
  function towerBlock(S, x0, z0, x1, z1, y0, y1, o) {
    o = o || {};
    S.b.box("limestone_dark", x0, y0, z0, x1, y1, z1, { segLen: 8 });
    S.col(x0 - 0.4, y0, z0 - 0.4, x1 + 0.4, y1 + 1.3, z1 + 0.4);
    const oo = Object.assign({}, o);
    gothicFace(S, "s", x0, x1, z1, y0, y1, oo);
    gothicFace(S, "n", x0, x1, z0, y0, y1, oo);
    gothicFace(S, "e", z0, z1, x1, y0, y1, oo);
    gothicFace(S, "w", z0, z1, x0, y0, y1, oo);
    S.b.box(
      "tar",
      x0 + 0.2,
      y1 - 0.05,
      z0 + 0.2,
      x1 - 0.2,
      y1 + 0.05,
      z1 - 0.2,
      { segLen: 6, noAO: true },
    );
    // corner pinnacles
    if (o.cornerPinnacles)
      for (const [x, z] of [
        [x0, z0],
        [x1, z0],
        [x0, z1],
        [x1, z1],
      ]) {
        S.b.box("limestone", x - 0.6, y1, z - 0.6, x + 0.6, y1 + 3.2, z + 0.6, {
          seg: false,
        });
        S.b.cyl("limestone", x, y1 + 3.2, z, 0.05, 0.75, 3.6, 4, {
          ry: PI / 4,
        });
        S.b.sphere("gold", x, y1 + 6.9, z, 0.18, { ws: 6, hs: 4 });
      }
  }

  const BX0 = 211,
    BX1 = 269,
    BZ0 = 3,
    BZ1 = 32; // base block
  const DOOR_X = 240;
