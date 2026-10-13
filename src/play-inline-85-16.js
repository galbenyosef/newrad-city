// play-inline-85 16 — lot
// Lines 3630-3880 of readable/play-inline-85.pretty.js (statement-aligned).
  function buildShell(lot, r) {
    const fr = frontSides(lot);
    const side = fr.n || lot.faceN ? "n" : fr.s || lot.faceS ? "s" : null;
    if (!side) return null;
    const x0 = lot.x0 + (lot.front.w ? 0 : 0.15),
      x1 = lot.x1 - (lot.front.e ? 0 : 0.15),
      z0 = lot.z0 + (fr.n ? 0 : 0.15),
      z1 = lot.z1 - (fr.s ? 0 : 0.15);
    const W = x1 - x0,
      D = z1 - z0;
    if (W < 7 || D < 9) return null;
    const cx = (x0 + x1) / 2,
      cz = (z0 + z1) / 2;
    const gf = 4.4,
      floors = r.int(3, 6),
      H = gf + floors * 3.4;
    const fmat =
      "facade/apartment/" + chunkVariant("apartment", cx, cz, r() < 0.5);
    const tint = r.pick(TINTS.apartment);
    const face = partyFaces(lot);
    // upper floors (world frame)
    facadeWalls(x0, z0, x1, z1, gf, H, fmat, tint, {
      vBase: gf,
      face,
      blank: "brick_red",
    });
    cornice(
      x0,
      z0,
      x1,
      z1,
      H - 0.9,
      0.7,
      0.9,
      "metal_painted",
      [0.45, 0.42, 0.38],
      { brackets: true, sides: frontSides(lot) },
    );
    roof(x0, z0, x1, z1, H, {
      parapet: 0.6,
      trim: "brick_red",
      trimC: [0.75, 0.6, 0.5],
    });
    rooftop(x0, z0, x1, z1, H, r, { tower: 0.4 });
    fireEscapesFor(lot, x0, z0, x1, z1, gf + 0.6, H - 1.2, 3.4, r, true);
    M.box3(x0, gf - 0.2, z0, x1, H, z1, { tag: "building" });
    // local frame
    const fz = side === "n" ? z0 : z1;
    const flip = side === "s";
    const toW = (lx, lz) => (flip ? [cx - lx, fz - lz] : [cx + lx, fz + lz]);
    const colL = (lx0, lz0, lx1, lz1, y0, y1, tag) => {
      const a = toW(lx0, lz0),
        b = toW(lx1, lz1);
      M.box3(
        Math.min(a[0], b[0]),
        y0,
        Math.min(a[1], b[1]),
        Math.max(a[0], b[0]),
        y1,
        Math.max(a[1], b[1]),
        { tag: tag || "building", surface: "concrete" },
      );
    };
    M.pushXF(M.mtx(cx, 0, fz, flip ? Math.PI : 0));
    const hw = W / 2,
      dep = D;
    const roomW = Math.min(W - 0.8, 16),
      roomD = Math.min(D - 1.2, 11);
    const rl = -roomW / 2,
      rr = roomW / 2;
    const T = 0.3; // wall thickness
    // ground-floor exterior walls (sides & back) in brick
    const gfB = M.buf("brick_red", cx, cz);
    const bc0 = [0.6, 0.55, 0.5],
      bc1 = [0.85, 0.8, 0.75];
    M.wall(gfB, hw, 0, hw, dep, 0, gf, 0, dep / 3, 0, gf / 3, bc0, bc1);
    M.wall(gfB, hw, dep, -hw, dep, 0, gf, 0, W / 3, 0, gf / 3, bc0, bc1);
    M.wall(gfB, -hw, dep, -hw, 0, 0, gf, 0, dep / 3, 0, gf / 3, bc0, bc1);
    // front: [-hw..winL] pier, [winR..doorL] pier, [doorR..hw] pier ; window opening winL..winR (sill), door doorL..doorR
    const doorL = 0.4,
      doorR = 2.8,
      winL = rl + 0.7,
      winR = -0.6;
    const fb = M.buf("stone_limestone", cx, cz);
    const fc0 = [0.62, 0.6, 0.56],
      fc1 = [0.9, 0.88, 0.82];
    const piersL = [
      [-hw, winL],
      [winR, doorL],
      [doorR, hw],
    ];
    for (const [a, b] of piersL) {
      if (b - a < 0.05) continue;
      // outer face (normal -z): traverse from +x to -x so M.wall's normal points -z
      M.wall(fb, a, 0, b, 0, 0, gf, 0, (b - a) / 3, 0, gf / 3, fc0, fc1);
      colL(a, 0, b, T, 0, gf);
    }
    // opening reveals & lintel
    for (const [a, b, bot] of [
      [winL, winR, 0.75],
      [doorL, doorR, 0],
    ]) {
      M.box(fb, a, 3.2, 0, b, gf, T, { s: 1.5, c: fc1, skip: 8 + 4 });
      M.quad(
        fb,
        [a, 3.2, 0],
        [b, 3.2, 0],
        [b, 3.2, T],
        [a, 3.2, T],
        [0, -1, 0],
        [0, 0, 1, 0, 1, 0.1, 0, 0.1],
        fc0,
      );
      for (const [x, n] of [
        [a, 1],
        [b, -1],
      ])
        M.quad(
          fb,
          [x, bot, 0],
          [x, bot, T],
          [x, 3.2, T],
          [x, 3.2, 0],
          [n, 0, 0],
          [0, 0, 0.1, 0, 0.1, 1, 0, 1],
          fc0,
        );
    }
    M.wall(
      fb,
      winL - 0.05,
      0,
      winR + 0.05,
      0,
      0,
      0.75,
      0,
      1,
      0,
      0.25,
      fc0,
      fc1,
    );
    M.box(fb, winL, 0.75, -0.05, winR, 0.82, T + 0.05, { s: 1, c: fc1 });
    colL(winL, 0, winR, T, 0, 0.8, "wall");
    // broken glass shards in the display window
    const gs = M.buf("glass_dirty", cx, cz, "detail");
    for (let i = 0; i < 4; i++) {
      const px = winL + r() * (winR - winL - 0.5);
      M.tri(
        gs,
        [px, 0.82, 0.12],
        [px + 0.5, 0.82, 0.12],
        [px + 0.2, 0.82 + r.range(0.4, 1.4), 0.12],
        [0, 0, -1],
        [0, 0, 1, 0, 0.5, 1],
        [0.5, 0.55, 0.5],
      );
    }
    for (let i = 0; i < 3; i++) {
      const px = winL + r() * (winR - winL - 0.6);
      M.tri(
        gs,
        [px, 3.2, 0.12],
        [px + 0.6, 3.2, 0.12],
        [px + 0.3, 3.2 - r.range(0.4, 1.2), 0.12],
        [0, 0, -1],
        [0, 0, 1, 0, 0.5, 1],
        [0.5, 0.55, 0.5],
      );
    }
    // sign band across the front (readable from the street: u runs +x → -x)
    const i = r.int(0, M.SHOP_SIGN_COUNT - 1),
      uv = M.cellUV(i, 2, 16);
    M.quad(
      M.buf("my/shopsigns", cx, cz, "detail"),
      [hw - 0.4, gf - 1.1, -0.05],
      [-hw + 0.4, gf - 1.1, -0.05],
      [-hw + 0.4, gf - 0.1, -0.05],
      [hw - 0.4, gf - 0.1, -0.05],
      [0, 0, -1],
      [uv[0], uv[1], uv[2], uv[1], uv[2], uv[3], uv[0], uv[3]],
    );
    // the shop room (inner pier faces, walls, floor, ceiling, room colliders, dressing, loot records → M.shells):
    // 40_buildings_interior.js (called inside this local frame; same rng stream, same order)
    M.buildShellInterior({
      r,
      cx,
      cz,
      gf,
      hw,
      dep,
      roomW,
      roomD,
      rl,
      rr,
      T,
      doorL,
      doorR,
      piersL,
      toW,
      colL,
      flip,
    });
    M.popXF();
    return { h: H };
  }

  // -------------------------------------------------------------------
  // Far impostors (HLOD): simple textured boxes built from each lot's
  // building colliders, shown only when the full-detail chunk is hidden.
  // -------------------------------------------------------------------
  M.defineAtlas("farfacade", function () {
    const S = 256,
      cv = M.canvas(S, S),
      ctx = cv.getContext("2d");
    const r = M.rng("farfacade");
    ctx.fillStyle = "#b8b2a4";
    ctx.fillRect(0, 0, S, S);
    const cw = S / 4;
    for (let j = 0; j < 4; j++)
      for (let i = 0; i < 4; i++) {
        const x = i * cw + 16,
          y = j * cw + 14,
          w = cw - 32,
          h = cw - 26;
        const k = r();
        ctx.fillStyle = k < 0.15 ? "#5a4a38" : k < 0.55 ? "#16191a" : "#2c3334";
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = "rgba(0,0,0,0.25)";
        ctx.fillRect(i * cw, j * cw + cw - 6, cw, 3);
      }
    for (let k = 0; k < 30; k++) {
      ctx.fillStyle = "rgba(30,26,20," + r() * 0.15 + ")";
      ctx.fillRect(r() * S, r() * S, 3 + r() * 5, 20 + r() * 80);
    }
    ctx.fillStyle = "#b8b2a4";
    ctx.fillRect(0, 0, 10, 10); // plain wall patch for roofs
    const t = M.finishTex(new THREE.CanvasTexture(cv));
    return { texture: t, roughness: 0.95 };
  });
  const IMP_TINT = {
    tower: [0.9, 0.86, 0.78],
    commercial: [0.78, 0.77, 0.74],
    apartment: [0.78, 0.62, 0.5],
    brownstone: [0.55, 0.42, 0.34],
    tenement: [0.68, 0.5, 0.4],
    warehouse: [0.66, 0.42, 0.33],
    collapsed: [0.5, 0.48, 0.45],
    shell: [0.68, 0.5, 0.4],
  };
