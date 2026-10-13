// play-inline-305 02 — portal
// Lines 30-129 of readable/play-inline-305.pretty.js (statement-aligned).
  const P = G._pe,
    D = P.dress,
    E = P.dress2;
  const PI = P.PI,
    HP = P.HP,
    TAU = P.TAU;
  const DN = (P.dn = P.dn || {});

  // ===================================================================
  // EXTERIOR
  // ===================================================================
  /** Striped facade on one face of a block: piers, window columns, spandrels. */
  function stripeFace(S, side, a0, a1, c, y0, y1, o) {
    o = o || {};
    const F = P.face(S, side, a0, a1, c);
    const r = P.rng("dn_face" + side + a0 + c + y0);
    const bay = o.bay || 1.5,
      n = Math.max(2, Math.round(F.len / bay)),
      bw = F.len / n;
    const fh = o.floorH || 3.3,
      wy0 = o.winStart !== undefined ? o.winStart : y0 + 1.0;
    const skip = o.skip || (() => false);
    // piers
    for (let k = 0; k <= n; k++) {
      const u = k * bw,
        corner = k === 0 || k === n,
        pw = corner ? 0.95 : 0.58;
      const ua = corner ? (k === 0 ? -0.35 : u - 0.6) : u - pw / 2,
        ub = corner ? (k === 0 ? 0.6 : u + 0.35) : u + pw / 2;
      // pier may be interrupted by the entrance portal
      let ya = y0;
      if (o.portal && u > o.portal[0] - 0.3 && u < o.portal[1] + 0.3)
        ya = Math.max(y0, o.portal[2]);
      if (o.broken && o.broken(u, y1)) {
        const top = o.broken(u, y1);
        if (top > ya + 1)
          F.box(o.pier || "dn_brick", ua, ub, ya, top, 0, 0.34, { segLen: 6 });
        continue;
      }
      F.box(o.pier || "dn_brick", ua, ub, ya, y1 + (o.pierTop || 0), 0, 0.34, {
        segLen: 6,
      });
    }
    // parapet band tying the piers at the top
    if (!o.noCap)
      F.box(
        o.pier || "dn_brick",
        -0.35,
        F.len + 0.35,
        y1 - 0.5,
        y1 + 0.15,
        0,
        0.36,
        { seg: false },
      );
    // windows per bay per floor
    for (let k = 0; k < n; k++) {
      const u = (k + 0.5) * bw;
      if (o.portal && u > o.portal[0] - 0.6 && u < o.portal[1] + 0.6) {
        if (o.portal[2] > y1) continue;
      }
      for (let y = wy0; y + 1.9 < y1 - 0.6; y += fh) {
        if (
          o.portal &&
          u > o.portal[0] - 0.6 &&
          u < o.portal[1] + 0.6 &&
          y < o.portal[2]
        )
          continue;
        if (skip(u, y)) continue;
        const q = r();
        const key =
          q < 0.06
            ? "glass_broken"
            : q < 0.1 && y < 30
              ? "wood_rotten"
              : q < 0.115 && y < 40
                ? "window_lit"
                : "glass_dark";
        F.box(key, u - bw * 0.3, u + bw * 0.3, y, y + 1.95, -0.01, 0.05, {
          seg: false,
          grime: 0.15,
          noAO: true,
        });
        // thin dark sill under each window
        F.box(
          "concrete_dark",
          u - bw * 0.32,
          u + bw * 0.32,
          y - 0.12,
          y,
          0,
          0.1,
          { seg: false, noAO: true },
        );
      }
    }
    return F;
  }

