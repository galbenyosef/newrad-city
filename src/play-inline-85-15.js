// play-inline-85 15 — len
// Lines 3324-3629 of readable/play-inline-85.pretty.js (statement-aligned).
  function entranceCanopy(lot, x0, z0, x1, z1, r) {
    const fr = frontSides(lot);
    const k = fr.n ? "n" : fr.s ? "s" : fr.w ? "w" : fr.e ? "e" : null;
    if (!k) return;
    const cx = (x0 + x1) / 2,
      cz = (z0 + z1) / 2;
    const nx = k === "e" ? 1 : k === "w" ? -1 : 0,
      nz = k === "s" ? 1 : k === "n" ? -1 : 0;
    const px = k === "e" ? x1 : k === "w" ? x0 : cx,
      pz = k === "s" ? z1 : k === "n" ? z0 : cz;
    const ux = nz !== 0 ? 1 : 0,
      uz = nx !== 0 ? 1 : 0;
    // doorway: a recessed vestibule, bronze double doors (one ajar) and a dim lobby behind — not a black void
    const sideLen = nz !== 0 ? x1 - x0 : z1 - z0;
    if (sideLen > 7.5) lobbyEntrance(px, pz, nx, nz, ux, uz, cx, cz);
    else {
      const dk = M.buf("glass_dirty", cx, cz);
      M.quad(
        dk,
        [px - ux * 1.2 + nx * 0.04, 0, pz - uz * 1.2 + nz * 0.04],
        [px + ux * 1.2 + nx * 0.04, 0, pz + uz * 1.2 + nz * 0.04],
        [px + ux * 1.2 + nx * 0.04, 3.2, pz + uz * 1.2 + nz * 0.04],
        [px - ux * 1.2 + nx * 0.04, 3.2, pz - uz * 1.2 + nz * 0.04],
        [nx, 0, nz],
        [0, 0, 1, 0, 1, 1, 0, 1],
        [0.05, 0.05, 0.05],
      );
    }
    const bs = M.buf("stone_limestone", cx, cz, "detail");
    M.box(
      bs,
      Math.min(px - ux * 1.7, px + ux * 1.7 + nx * 0.3),
      DOOR_H,
      Math.min(pz - uz * 1.7, pz + uz * 1.7 + nz * 0.3),
      Math.max(px - ux * 1.7, px + ux * 1.7 + nx * 0.3),
      DOOR_H + 0.6,
      Math.max(pz - uz * 1.7, pz + uz * 1.7 + nz * 0.3),
      { s: 1, c: TRIM_C },
    );
    // pilasters framing the door
    for (const sd of [-1, 1]) {
      const qx = px + ux * sd * (DOOR_HW + 0.2),
        qz = pz + uz * sd * (DOOR_HW + 0.2);
      M.box(
        bs,
        Math.min(qx - ux * 0.2, qx + ux * 0.2 + nx * 0.22),
        0,
        Math.min(qz - uz * 0.2, qz + uz * 0.2 + nz * 0.22),
        Math.max(qx - ux * 0.2, qx + ux * 0.2 + nx * 0.22),
        DOOR_H,
        Math.max(qz - uz * 0.2, qz + uz * 0.2 + nz * 0.22),
        { s: 1, c: M.mulc(TRIM_C, 0.9) },
      );
    }
    // NYC apartment canopy out to the curb (frame + tattered fabric)
    if (r() < 0.6) {
      const len = 5.5;
      const fb = M.buf("fabric@ds", cx, cz, "detail");
      const col = r.pick([
        [0.2, 0.28, 0.24],
        [0.45, 0.15, 0.13],
        [0.18, 0.2, 0.3],
      ]);
      const A = [px - ux * 1.3, pz - uz * 1.3],
        B = [px + ux * 1.3, pz + uz * 1.3];
      const torn = r() < 0.5 ? r.range(0.4, 0.9) : 1;
      M.quad(
        fb,
        [A[0], 3.3, A[1]],
        [B[0], 3.3, B[1]],
        [B[0] + nx * len * torn, 3.0, B[1] + nz * len * torn],
        [A[0] + nx * len * torn, 3.0, A[1] + nz * len * torn],
        [0, 1, 0],
        [0, 0, 1, 0, 1, 2, 0, 2],
        col,
      );
      const pb = M.buf("chrome", cx, cz, "detail");
      for (const S of [A, B]) {
        M.pipe(
          pb,
          S[0] + nx * len,
          0,
          S[1] + nz * len,
          S[0] + nx * len,
          3.0,
          S[1] + nz * len,
          0.04,
          5,
          { c: [0.6, 0.6, 0.58] },
        );
        M.pipe(
          pb,
          S[0],
          3.25,
          S[1],
          S[0] + nx * len,
          3.0,
          S[1] + nz * len,
          0.035,
          5,
          { c: [0.6, 0.6, 0.58] },
        );
      }
    }
  }
  function loadingDock(x0, z0, x1, z1, side, r) {
    const cx = (x0 + x1) / 2,
      cz = (z0 + z1) / 2;
    const nx = side === "e" ? 1 : side === "w" ? -1 : 0,
      nz = side === "s" ? 1 : side === "n" ? -1 : 0;
    const ax = side === "e" ? x1 : x0,
      az = side === "s" ? z1 : z0;
    const len = nz !== 0 ? x1 - x0 : z1 - z0;
    const ux = nz !== 0 ? 1 : 0,
      uz = nx !== 0 ? 1 : 0;
    const pb = M.buf("concrete", cx, cz);
    // platform
    const d = 2.2;
    const P0 = [ax + nx * 0, az + nz * 0],
      P1 = [ax + ux * len + nx * d, az + uz * len + nz * d];
    M.box(
      pb,
      Math.min(P0[0], P1[0]),
      0,
      Math.min(P0[1], P1[1]),
      Math.max(P0[0], P1[0]),
      1.2,
      Math.max(P0[1], P1[1]),
      { s: 3, c: [0.72, 0.7, 0.66] },
    );
    M.box3(
      Math.min(P0[0], P1[0]),
      0,
      Math.min(P0[1], P1[1]),
      Math.max(P0[0], P1[0]),
      1.2,
      Math.max(P0[1], P1[1]),
      { tag: "dock", surface: "concrete" },
    );
    // roll-up doors
    const n = Math.max(1, Math.floor(len / 8));
    const bs = M.buf("corrugated", cx, cz),
      bdk = M.buf("glass_dirty", cx, cz);
    for (let i = 0; i < n; i++) {
      const t = ((i + 0.5) * len) / n;
      const px = ax + ux * t + nx * 0.05,
        pz = az + uz * t + nz * 0.05;
      const open = r() < 0.3 ? r.range(0.3, 0.8) : 0;
      const top = 5.2,
        bot = 1.2 + (top - 1.2) * open;
      M.quad(
        bs,
        [px - ux * 2, bot, pz - uz * 2],
        [px + ux * 2, bot, pz + uz * 2],
        [px + ux * 2, top, pz + uz * 2],
        [px - ux * 2, top, pz - uz * 2],
        [nx, 0, nz],
        [0, 0, 2, 0, 2, 2, 0, 2],
        r.pick([
          [0.6, 0.62, 0.6],
          [0.55, 0.35, 0.28],
          [0.35, 0.45, 0.55],
        ]),
      );
      if (open)
        M.quad(
          bdk,
          [px - ux * 2 + nx * -0.01, 1.2, pz - uz * 2],
          [px + ux * 2, 1.2, pz + uz * 2],
          [px + ux * 2, bot, pz + uz * 2],
          [px - ux * 2, bot, pz - uz * 2],
          [nx, 0, nz],
          [0, 0, 1, 0, 1, 1, 0, 1],
          [0.03, 0.03, 0.03],
        );
    }
    // dock canopy
    const cb = M.buf("rust", cx, cz, "detail");
    M.quad(
      cb,
      [ax, 6, az],
      [ax + ux * len, 6, az + uz * len],
      [ax + ux * len + nx * 3, 5.6, az + uz * len + nz * 3],
      [ax + nx * 3, 5.6, az + nz * 3],
      [0, 1, 0],
      [0, 0, len / 3, 0, len / 3, 1, 0, 1],
      [0.7, 0.6, 0.5],
    );
  }

  // -------------------------------------------------------------------
  // Rooftop dressing (bulkheads, HVAC, water towers, antennas, skylights)
  // -------------------------------------------------------------------
  function rooftop(x0, z0, x1, z1, y, r, o) {
    o = o || {};
    const w = x1 - x0,
      d = z1 - z0;
    const cx = (x0 + x1) / 2,
      cz = (z0 + z1) / 2;
    // stair bulkhead
    if (w > 6 && d > 6) {
      const bx = x0 + 1 + r() * (w - 5),
        bz = z0 + 1 + r() * (d - 5);
      M.box(M.buf("brick_brown", cx, cz), bx, y, bz, bx + 3, y + 3, bz + 3.5, {
        s: 2.5,
        c: [0.8, 0.75, 0.7],
      });
      M.box(
        M.buf("concrete_dark", cx, cz),
        bx - 0.1,
        y + 3,
        bz - 0.1,
        bx + 3.1,
        y + 3.2,
        bz + 3.6,
        { s: 3 },
      );
    }
    if (r() < (o.tower || 0) && w > 7 && d > 7) {
      const tx = x0 + 3 + r() * (w - 6),
        tz = z0 + 3 + r() * (d - 6);
      M.waterTower(tx, y, tz, r.range(0.85, 1.15), r() < 0.12);
    }
    roofClutter(x0, z0, x1, z1, y, null, null, null, null, r);
  }
  M.rooftop = rooftop;
  function roofClutter(x0, z0, x1, z1, y, ex0, ez0, ex1, ez1, r) {
    const cx = (x0 + x1) / 2,
      cz = (z0 + z1) / 2;
    const b = M.buf("metal_panel", cx, cz, "detail");
    const n = r.int(1, 4);
    for (let i = 0; i < n; i++) {
      const s = r.range(0.8, 2.4);
      const px = x0 + 1 + r() * Math.max(0.1, x1 - x0 - 2 - s),
        pz = z0 + 1 + r() * Math.max(0.1, z1 - z0 - 2 - s);
      if (ex0 !== null && px > ex0 - s && px < ex1 && pz > ez0 - s && pz < ez1)
        continue;
      const k = r();
      if (k < 0.5)
        M.box(b, px, y, pz, px + s, y + s * 0.6, pz + s * 0.8, {
          s: 1.5,
          c: [0.62, 0.64, 0.6],
        }); // HVAC
      else if (k < 0.75) {
        M.cyl(b, px, y, pz, 0.25, 0.25, 1.2, 6, {
          c: [0.5, 0.5, 0.48],
          capTop: true,
        });
        M.cyl(b, px, y + 1.2, pz, 0.45, 0.1, 0.3, 6, { c: [0.45, 0.45, 0.42] });
      } // vent
      else {
        const bm = M.buf("rust", cx, cz, "detail");
        M.pipe(bm, px, y, pz, px, y + r.range(4, 9), pz, 0.05, 4, {
          c: [0.6, 0.5, 0.45],
        });
        M.beam(bm, px - 0.8, y + 3, pz, px + 0.8, y + 3, pz, 0.04, 0.04, {
          c: [0.6, 0.5, 0.45],
        });
      } // antenna
    }
  }

  // -------------------------------------------------------------------
  // Fire escapes on street façades
  // -------------------------------------------------------------------
  function fireEscapesFor(lot, x0, z0, x1, z1, yFrom, yTo, flH, r, single) {
    const fr = frontSides(lot);
    const cands = [];
    if (fr.n || lot.faceN) cands.push(["n", x0, z0, x1, z0, 0, -1]);
    if (fr.s || lot.faceS) cands.push(["s", x1, z1, x0, z1, 0, 1]);
    if (fr.e) cands.push(["e", x1, z0, x1, z1, 1, 0]);
    if (fr.w) cands.push(["w", x0, z1, x0, z0, -1, 0]);
    if (!cands.length) return;
    const n = single ? 1 : Math.min(cands.length, r.int(1, 2));
    for (let i = 0; i < n; i++) {
      const c = cands[i];
      const len = Math.hypot(c[3] - c[1], c[4] - c[2]);
      if (len < 5) continue;
      const w = Math.min(len - 1.5, r.range(4.5, 7));
      const t = r.range(0.5, Math.max(0.5, len - w - 0.5));
      M.fireEscape(
        c[1],
        c[2],
        c[3],
        c[4],
        c[5],
        c[6],
        t,
        w,
        yFrom,
        yTo,
        flH,
        r,
      );
    }
  }

  // -------------------------------------------------------------------
  // Enterable storefront shells
  // -------------------------------------------------------------------
  M.shells = []; // enterable shop registry (filled by M.buildShellInterior, 40_buildings_interior.js)
  /**
   * Enterable, looted corner shop. Built in a local frame: the shop front is
   * the local x axis at local z = 0, the room extends toward local +z and the
   * street is at local -z. For south-facing lots the frame is rotated by π.
   */
