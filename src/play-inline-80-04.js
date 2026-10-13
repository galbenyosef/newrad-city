// play-inline-80 04 — math
// Lines 826-1126 of readable/play-inline-80.pretty.js (statement-aligned).
  function buildEllisBuilding(cx, cz) {
    const W = 34,
      D = 15,
      H = 16;
    const x0 = cx - W / 2,
      x1 = cx + W / 2,
      z0 = cz - D / 2,
      z1 = cz + D / 2;
    const bf = M.buf("facade/warehouse/1", cx, cz);
    const tile = M.facadeTile();
    const wallC = [0.95, 0.8, 0.72],
      wallT = [1, 0.92, 0.86];
    const sides = [
      [x0, z0, x1, z0],
      [x1, z0, x1, z1],
      [x1, z1, x0, z1],
      [x0, z1, x0, z0],
    ];
    for (const s of sides) {
      const l = Math.hypot(s[2] - s[0], s[3] - s[1]);
      M.wall(
        bf,
        s[0],
        s[1],
        s[2],
        s[3],
        3,
        H,
        0,
        l / tile.w,
        0,
        (H - 3) / tile.h,
        wallC,
        wallT,
      );
    }
    const bl = M.buf("stone_limestone", cx, cz);
    M.box(bl, x0 - 0.3, 0, z0 - 0.3, x1 + 0.3, 3, z1 + 0.3, {
      s: 3,
      c: [0.9, 0.88, 0.82],
    });
    M.box(bl, x0 - 0.5, H, z0 - 0.5, x1 + 0.5, H + 0.8, z1 + 0.5, {
      s: 3,
      c: [0.92, 0.9, 0.84],
    });
    // central arched entrance portico
    M.box(bl, cx - 4, 0, z1, cx + 4, 9, z1 + 1.2, { s: 3 });
    const bd = M.buf("glass_dirty", cx, cz);
    M.box(bd, cx - 3, 0.1, z1 + 1.2, cx + 3, 7.5, z1 + 1.25, {
      s: 3,
      c: [0.4, 0.4, 0.4],
      skip: 8 + 1 + 2 + 4 + 32,
    });
    // roof (hipped, ruined in places)
    const br = M.buf("metal_painted", cx, cz);
    const roofC = [0.45, 0.7, 0.6];
    M.quad(
      br,
      [x0, H + 0.8, z0],
      [x1, H + 0.8, z0],
      [x1 - 4, H + 5, cz],
      [x0 + 4, H + 5, cz],
      [0, 0.7, -0.7],
      [0, 0, 8, 0, 8, 2, 0, 2],
      roofC,
    );
    M.quad(
      br,
      [x1, H + 0.8, z1],
      [x0, H + 0.8, z1],
      [x0 + 12, H + 5, cz],
      [x1 - 4, H + 5, cz],
      [0, 0.7, 0.7],
      [0, 0, 8, 0, 8, 2, 0, 2],
      roofC,
    );
    M.tri(
      br,
      [x0, H + 0.8, z0],
      [x0 + 4, H + 5, cz],
      [x0, H + 0.8, z1],
      [-1, 0.5, 0],
      [0, 0, 1, 1, 0, 2],
      roofC,
    );
    M.tri(
      br,
      [x1, H + 0.8, z1],
      [x1 - 4, H + 5, cz],
      [x1, H + 0.8, z0],
      [1, 0.5, 0],
      [0, 0, 1, 1, 0, 2],
      roofC,
    );
    // collapsed roof hole — exposed rafters
    const bg = M.buf("rust", cx, cz, "detail");
    for (let k = 0; k < 5; k++)
      M.beam(
        bg,
        x0 + 5 + k * 1.6,
        H + 0.9,
        z1 - 1,
        x0 + 5 + k * 1.6,
        H + 4.5,
        cz,
        0.18,
        0.25,
        { c: [0.8, 0.8, 0.8] },
      );
    // four towers with domes
    for (const [tx, tz] of [
      [x0 + 1.5, z0 + 1.5],
      [x1 - 1.5, z0 + 1.5],
      [x0 + 1.5, z1 - 1.5],
      [x1 - 1.5, z1 - 1.5],
    ]) {
      M.box(bl, tx - 2, 0, tz - 2, tx + 2, H + 8, tz + 2, {
        s: 3,
        c: [0.92, 0.9, 0.86],
      });
      M.box(
        M.buf("brick_red", tx, tz),
        tx - 2.05,
        3,
        tz - 2.05,
        tx + 2.05,
        H + 6,
        tz + 2.05,
        { s: 3, skip: 12 },
      );
      M.cyl(br, tx, H + 8, tz, 2.2, 0.2, 3.6, 12, { c: [0.45, 0.75, 0.62] });
      M.cyl(br, tx, H + 11.4, tz, 0.12, 0.05, 2.2, 5, { c: [0.3, 0.3, 0.3] });
      M.box(bl, tx - 2.3, H + 7.4, tz - 2.3, tx + 2.3, H + 8, tz + 2.3, {
        s: 3,
      });
    }
    M.box3(x0, 0, z0, x1, H + 1, z1, { tag: "building" });
  }

  // -------------------------------------------------------------------
  // Piers
  // -------------------------------------------------------------------
  M.pierRoots = [];
  /** Pier from shore point (x,z) along (dx,dz), length len, width w. */
  function pier(x, z, dx, dz, len, w, o) {
    o = o || {};
    const l = Math.hypot(dx, dz);
    dx /= l;
    dz /= l;
    const px = -dz,
      pz = dx;
    M.pierRoots.push({ x, z, w });
    const ex = x + dx * len,
      ez = z + dz * len;
    const mx = (x + ex) / 2,
      mz = (z + ez) / 2;
    const yaw = Math.atan2(dx, dz);
    const broken = !!o.broken;
    const deckLen = broken ? len * 0.72 : len;
    const dmx = x + (dx * deckLen) / 2,
      dmz = z + (dz * deckLen) / 2;
    // deck (collider & visual)
    const bd = M.buf("concrete", mx, mz);
    M.obox(bd, dmx, -0.35, dmz, w, 0.7, deckLen + 1, yaw, {
      s: 4,
      c: [0.82, 0.8, 0.76],
      ct: [0.9, 0.88, 0.84],
    });
    M.ocol(dmx, dmz, w, deckLen + 1, -1.5, 0, yaw, {
      tag: "pier",
      surface: "concrete",
    });
    // fender timbers along the sides
    const bw = M.buf("wood_rotten", mx, mz, "detail");
    for (const sd of [-1, 1])
      M.obox(
        bw,
        dmx + px * sd * (w / 2 + 0.15),
        -0.55,
        dmz + pz * sd * (w / 2 + 0.15),
        0.3,
        0.5,
        deckLen,
        yaw,
        { s: 2, c: [0.7, 0.62, 0.52] },
      );
    // pilings
    const bp = M.buf("wood_rotten", mx, mz, "detail");
    for (let a = 3; a < len; a += 6)
      for (const sd of [-1, 1]) {
        const qx = x + dx * a + px * sd * (w / 2 - 0.6),
          qz = z + dz * a + pz * sd * (w / 2 - 0.6);
        M.cyl(bp, qx, -6, qz, 0.35, 0.33, a > deckLen ? 5.4 : 5.3, 7, {
          c: [0.45, 0.42, 0.35],
          capTop: a > deckLen,
        });
      }
    // bollards / cleats
    const bb = M.buf("rust", mx, mz, "detail");
    for (let a = 5; a < deckLen - 2; a += 9)
      for (const sd of [-1, 1]) {
        const qx = x + dx * a + px * sd * (w / 2 - 0.5),
          qz = z + dz * a + pz * sd * (w / 2 - 0.5);
        M.cyl(bb, qx, 0, qz, 0.22, 0.2, 0.55, 8, {
          capTop: true,
          c: [0.6, 0.5, 0.45],
        });
        M.cyl(bb, qx, 0.55, qz, 0.3, 0.3, 0.1, 8, {
          capTop: true,
          c: [0.6, 0.5, 0.45],
        });
      }
    if (broken) {
      // collapsed end section slumping into the river
      const a0 = deckLen + 2;
      const bx = x + dx * (a0 + len * 0.14),
        bz = z + dz * (a0 + len * 0.14);
      M.obox(bd, bx, -1.6, bz, w * 0.95, 0.7, len * 0.26, yaw + 0.05, {
        pitch: 0.16,
        roll: 0.06,
        s: 4,
        c: [0.6, 0.6, 0.55],
      });
    }
    // pier shed (corrugated hangar)
    if (o.shed) {
      const sl = deckLen * 0.62,
        sw = w - 3,
        sh = 8 + M.hash(x, z, 4) * 3;
      const sa = deckLen * 0.28;
      const scx = x + dx * (sa + sl / 2),
        scz = z + dz * (sa + sl / 2);
      const bs = M.buf("corrugated", scx, scz);
      M.setXF(M.mtx(scx, 0, scz, yaw));
      const tint =
        M.hash(x, z, 6) < 0.5 ? [0.75, 0.8, 0.78] : [0.85, 0.72, 0.62];
      // walls
      M.box(bs, -sw / 2, 0, -sl / 2, sw / 2, sh, sl / 2, {
        s: 3,
        c: tint,
        skip: 8 + 4,
      });
      // gable roof (arched approximation)
      const br = M.buf("rust", scx, scz);
      const seg = 6;
      for (let k = 0; k < seg; k++) {
        const a0 = (Math.PI * k) / seg,
          a1 = (Math.PI * (k + 1)) / seg;
        const X0 = (Math.cos(a0) * sw) / 2,
          Y0 = sh + Math.sin(a0) * 3.2,
          X1 = (Math.cos(a1) * sw) / 2,
          Y1 = sh + Math.sin(a1) * 3.2;
        const nx0 = Math.cos((a0 + a1) / 2),
          ny0 = Math.sin((a0 + a1) / 2);
        if (k === 2 && M.hash(x, z, 8) < 0.6) continue; // hole in the roof
        M.quad(
          br,
          [X0, Y0, -sl / 2],
          [X1, Y1, -sl / 2],
          [X1, Y1, sl / 2],
          [X0, Y0, sl / 2],
          [nx0, ny0, 0],
          [0, 0, 1, 0, 1, sl / 3, 0, sl / 3],
          [0.8, 0.72, 0.65],
        );
      }
      for (const e of [-1, 1]) {
        // gable ends
        for (let k = 0; k < seg; k++) {
          const a0 = (Math.PI * k) / seg,
            a1 = (Math.PI * (k + 1)) / seg;
          M.tri(
            bs,
            [0, sh, (e * sl) / 2],
            [(Math.cos(a0) * sw) / 2, sh + Math.sin(a0) * 3.2, (e * sl) / 2],
            [(Math.cos(a1) * sw) / 2, sh + Math.sin(a1) * 3.2, (e * sl) / 2],
            [0, 0, e],
            [0, 0, 1, 0, 0.5, 1],
            tint,
          );
        }
      }
      // big door openings (dark)
      const bdk = M.buf("glass_dirty", scx, scz);
      M.box(bdk, -3, 0, -sl / 2 - 0.05, 3, 6, -sl / 2 + 0.05, {
        c: [0.1, 0.1, 0.1],
        s: 3,
        skip: 8,
      });
      // painted pier number
      M.setXF(null);
      M.ocol(scx, scz, sw, sl, 0, sh + 3, yaw, {
        tag: "building",
        surface: "metal",
      });
    }
    M.setXF(null);
    return { x, z, ex, ez, dx, dz, yaw };
  }
  M.pier = pier;

