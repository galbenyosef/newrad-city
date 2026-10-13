// play-inline-86 01 — topy
// Lines 17-314 of readable/play-inline-86.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const M = G.map._;
  const SY = M.SIDEWALK_Y;

  /**
   * A dim, looted shop interior behind a storefront bay (open hole or display window):
   * side walls, back wall, floor & ceiling (main layer, dark vertex colours so it reads as unlit),
   * plus stock shelving, a counter, junk, fallen ceiling panels and dirt (detail / fine layers).
   * P(t, off) → [x, z] with off < 0 going into the building.
   */
  // (materials shared with the rest of the city chunk — no extra draw calls per chunk)
  const SHOP_WALLS = ["plaster_stained"];
  const SHOP_FLOORS = ["wood_planks", "concrete", "concrete_dark"];
  function shopInterior(P, tL, tR, topY, nx, nz, r, cx, cz, D, mode) {
    const y0 = 0.02,
      rec = 0.3;
    // (round 1: 0.42/0.5 read as a continuous black void band along every street — the rooms sit in the
    // building's shadow and only get sky light; lifted, plus a fake bounce glow on the back wall below)
    const dim = mode === "glass" ? 0.66 : 0.74;
    const wm = r.pick(SHOP_WALLS),
      fm = r.pick(SHOP_FLOORS);
    const wc = M.mulc(
      r.pick([
        [0.72, 0.68, 0.6],
        [0.6, 0.66, 0.58],
        [0.7, 0.6, 0.52],
        [0.62, 0.62, 0.64],
      ]),
      dim,
    );
    const V = (t, off, y) => {
      const q = P(t, off);
      return [q[0], y, q[1]];
    };
    const ul =
      Math.hypot(P(tR, 0)[0] - P(tL, 0)[0], P(tR, 0)[1] - P(tL, 0)[1]) || 1;
    const ux = (P(tR, 0)[0] - P(tL, 0)[0]) / ul,
      uz = (P(tR, 0)[1] - P(tL, 0)[1]) / ul;
    const W = tR - tL;
    const wb = M.buf(wm, cx, cz),
      fb = M.buf(fm, cx, cz),
      cb = M.buf("plaster_stained", cx, cz);
    // back wall (facing the street), side walls (facing inward), floor, ceiling
    M.quad(
      wb,
      V(tL, -D, y0),
      V(tR, -D, y0),
      V(tR, -D, topY),
      V(tL, -D, topY),
      [nx, 0, nz],
      [0, 0, W / 2, 0, W / 2, topY / 2, 0, topY / 2],
      M.mulc(wc, 0.55),
      wc,
    );
    M.quad(
      wb,
      V(tL, -rec, y0),
      V(tL, -D, y0),
      V(tL, -D, topY),
      V(tL, -rec, topY),
      [ux, 0, uz],
      [0, 0, D / 2, 0, D / 2, topY / 2, 0, topY / 2],
      M.mulc(wc, 0.5),
      M.mulc(wc, 0.85),
    );
    M.quad(
      wb,
      V(tR, -D, y0),
      V(tR, -rec, y0),
      V(tR, -rec, topY),
      V(tR, -D, topY),
      [-ux, 0, -uz],
      [0, 0, D / 2, 0, D / 2, topY / 2, 0, topY / 2],
      M.mulc(wc, 0.5),
      M.mulc(wc, 0.85),
    );
    M.quad(
      fb,
      V(tL, -rec, y0 + 0.12),
      V(tR, -rec, y0 + 0.12),
      V(tR, -D, y0 + 0.12),
      V(tL, -D, y0 + 0.12),
      [0, 1, 0],
      [0, 0, W / 2, 0, W / 2, D / 2, 0, D / 2],
      M.mulc([0.62, 0.58, 0.52], dim + 0.1),
      M.mulc([0.62, 0.58, 0.52], dim * 0.7),
    );
    M.quad(
      cb,
      V(tL, -rec, topY),
      V(tR, -rec, topY),
      V(tR, -D, topY),
      V(tL, -D, topY),
      [0, -1, 0],
      [0, 0, W / 2, 0, W / 2, D / 2, 0, D / 2],
      M.mulc([0.5, 0.48, 0.44], dim),
    );
    // dressing: back-wall shelving with stock, a counter or a toppled gondola, ceiling panels, dirt
    // shelving, stock, counters: 'fine' layer (150 m) — tiny boxes behind glass don't read further out (perf)
    const db = M.buf("wood_planks", cx, cz, "fine"),
      mb = M.buf("metal_painted", cx, cz, "fine");
    const sc = M.mulc([0.5, 0.42, 0.34], dim + 0.15);
    const kind = r();
    if (kind < 0.7) {
      const sh0 = tL + 0.25,
        sh1 = tR - 0.25,
        H = Math.min(topY - 0.4, 2.1);
      for (let lv = 0; lv < 3; lv++) {
        const yy = y0 + 0.2 + (lv * (H - 0.2)) / 2.4;
        const a = V(sh0, -D + 0.02, yy),
          c = V(sh1, -D + 0.45, yy + 0.04);
        M.box(
          db,
          Math.min(a[0], c[0]),
          yy,
          Math.min(a[2], c[2]),
          Math.max(a[0], c[0]),
          yy + 0.04,
          Math.max(a[2], c[2]),
          { s: 1, c: sc },
        );
        if (lv === 2 && r() < 0.5) continue;
        // leftover stock as a couple of runs of goods (the gaps are where it was looted)
        for (let t = sh0 + 0.1; t < sh1 - 0.3;) {
          const run = r.range(0.3, 1.1),
            gapL = r.range(0.2, 0.9);
          if (r() < 0.6) {
            const a2 = V(t, -D + 0.08, yy + 0.04),
              c2 = V(Math.min(sh1 - 0.1, t + run), -D + 0.38, yy + 0.04),
              h = r.range(0.12, 0.28);
            M.box(
              mb,
              Math.min(a2[0], c2[0]),
              yy + 0.04,
              Math.min(a2[2], c2[2]),
              Math.max(a2[0], c2[0]),
              yy + 0.04 + h,
              Math.max(a2[2], c2[2]),
              {
                s: 0.3,
                c: M.mulc(
                  r.pick([
                    [0.8, 0.3, 0.25],
                    [0.8, 0.72, 0.5],
                    [0.35, 0.5, 0.7],
                    [0.6, 0.62, 0.55],
                    [0.4, 0.6, 0.35],
                  ]),
                  dim + 0.2,
                ),
                skip: 8,
              },
            );
          }
          t += run + gapL;
        }
      }
      for (const t of [sh0, sh1]) {
        const a = V(t, -D + 0.02, y0),
          c = V(t + (t === sh0 ? 0.05 : -0.05), -D + 0.45, y0 + H);
        M.box(
          db,
          Math.min(a[0], c[0]),
          y0,
          Math.min(a[2], c[2]),
          Math.max(a[0], c[0]),
          y0 + H,
          Math.max(a[2], c[2]),
          { s: 1, c: sc },
        );
      }
    }
    if (kind > 0.35 && W > 2.2) {
      // shop counter across part of the room (sometimes shoved askew)
      const t0 = tL + W * r.range(0.1, 0.3),
        t1 = t0 + Math.min(W * 0.55, 2.2),
        off = -D * r.range(0.45, 0.6);
      const a = V(t0, off, y0),
        c = V(t1, off - 0.6, y0);
      const yaw = Math.atan2(ux, uz) + (r() < 0.3 ? r.range(-0.3, 0.3) : 0);
      M.obox(
        db,
        (a[0] + c[0]) / 2,
        y0 + 0.5,
        (a[2] + c[2]) / 2,
        0.6,
        1.0,
        t1 - t0,
        yaw,
        { s: 1, c: M.mulc([0.5, 0.4, 0.3], dim + 0.2) },
      );
      if (r() < 0.5)
        M.obox(
          mb,
          (a[0] + c[0]) / 2,
          y0 + 1.15,
          (a[2] + c[2]) / 2,
          0.35,
          0.3,
          0.4,
          yaw,
          { s: 1, c: M.mulc([0.45, 0.42, 0.3], dim + 0.2) },
        ); // cash register
    } else if (kind > 0.2) {
      // toppled gondola shelf spilling stock
      const q = V(tL + W * 0.5, -D * 0.5, y0);
      M.obox(
        mb,
        q[0],
        y0 + 0.3,
        q[2],
        0.5,
        0.5,
        Math.min(W - 0.6, 2.4),
        Math.atan2(ux, uz) + r.range(-0.4, 0.4),
        { roll: 1.2, s: 1, c: M.mulc([0.55, 0.55, 0.52], dim + 0.2) },
      );
    }
    // fallen ceiling panels & a dangling fixture
    for (let i = 0; i < 2; i++) {
      const q = V(tL + r() * W, -rec - r() * (D - rec - 0.3), y0 + 0.16);
      M.obox(
        M.buf("plaster_stained", cx, cz, "detail"),
        q[0],
        q[1],
        q[2],
        0.6,
        0.03,
        0.6,
        r() * 6,
        {
          pitch: r.range(-0.3, 0.3),
          s: 1,
          c: M.mulc([0.7, 0.68, 0.62], dim + 0.2),
        },
      );
    }
    if (r() < 0.5) {
      const q = V(tL + W * r.range(0.3, 0.7), -D * 0.5, topY);
      M.pipe(
        mb,
        q[0],
        topY,
        q[2],
        q[0] + r.range(-0.4, 0.4),
        topY - r.range(0.5, 1.1),
        q[2] + r.range(-0.3, 0.3),
        0.015,
        3,
        { c: [0.15, 0.15, 0.15] },
      );
    }
    const fq = V(tL + W / 2, -D / 2, y0 + 0.14);
    M.decal(
      M.buf("my/markings", cx, cz, "fine"),
      fq[0],
      fq[1],
      fq[2],
      W * 0.9,
      D * 0.8,
      Math.atan2(ux, uz),
      r.pick([M.MARK.LITTER, M.MARK.DIRT, M.MARK.GRIME, M.MARK.LEAVES]),
      M.mulc(M.WHITE, 0.6),
    );
    // daylight falling in through the opening onto the floor (faint additive pool)
    const lfx = M.buf("my/lightfx", cx, cz, "fine");
    if (mode !== "glass") {
      const lq = V(tL + W / 2, -rec - 0.8, y0 + 0.15);
      M.lightPool(lfx, lq[0], lq[1], lq[2], W * 0.4, 0.9, [0.05, 0.05, 0.045]);
    }
    // bounce light on the back wall (soft additive glow, cell 3): the room reads as a dim space, not a hole
    if (mode !== "glass") {
      const uv = M.lightUV(3),
        gc = [0.075, 0.07, 0.06];
      const a0 = V(tL + 0.1, -D + 0.04, y0 + 0.1),
        a1 = V(tR - 0.1, -D + 0.04, y0 + 0.1),
        a2 = V(tR - 0.1, -D + 0.04, topY - 0.1),
        a3 = V(tL + 0.1, -D + 0.04, topY - 0.1);
      M.quad(
        lfx,
        a0,
        a1,
        a2,
        a3,
        [nx, 0, nz],
        [uv[0], uv[1], uv[2], uv[1], uv[2], uv[3], uv[0], uv[3]],
        gc,
        M.mulc(gc, 0.7),
      );
    }
  }
  M.shopInterior = shopInterior;

  /**
   * Enterable corner shop room (buildShell in 40_buildings.js). Runs inside the shell's local frame
   * (shop front = local x axis at z = 0, room toward +z); S carries the shell's locals.
   */
