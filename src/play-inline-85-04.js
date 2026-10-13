// play-inline-85 04 — suv
// Lines 769-948 of readable/play-inline-85.pretty.js (statement-aligned).
  function cornice(x0, z0, x1, z1, y, depth, h, mat, c, o) {
    o = o || {};
    const cx = (x0 + x1) / 2,
      cz = (z0 + z1) / 2;
    const b = M.buf(mat || "stone_limestone", cx, cz);
    c = c || TRIM_C;
    const d = depth;
    // stepped profile: small fillet, big overhang, top cap
    M.box(
      b,
      x0 - d * 0.35,
      y,
      z0 - d * 0.35,
      x1 + d * 0.35,
      y + h * 0.35,
      z1 + d * 0.35,
      { s: 2, c: M.mulc(c, 0.85) },
    );
    M.box(b, x0 - d, y + h * 0.35, z0 - d, x1 + d, y + h, z1 + d, {
      s: 2,
      c,
      cb: M.mulc(c, 0.7),
    });
    if (o.brackets) {
      const bb = M.buf(mat || "stone_limestone", cx, cz, "detail");
      const step = 1.4;
      for (const [ax, az, bx, bz, nx, nz] of [
        [x0, z0, x1, z0, 0, -1],
        [x0, z1, x1, z1, 0, 1],
        [x0, z0, x0, z1, -1, 0],
        [x1, z0, x1, z1, 1, 0],
      ]) {
        if (
          o.sides &&
          !o.sides[nx < 0 ? "w" : nx > 0 ? "e" : nz < 0 ? "n" : "s"]
        )
          continue;
        const len = Math.hypot(bx - ax, bz - az),
          n = Math.floor(len / step);
        for (let i = 1; i < n; i++) {
          const t = i / n,
            px = ax + (bx - ax) * t + nx * d * 0.5,
            pz = az + (bz - az) * t + nz * d * 0.5;
          M.box(
            bb,
            px - 0.12 - Math.abs(nz) * 0,
            y - 0.5,
            pz - 0.12,
            px + 0.12,
            y + h * 0.35,
            pz + 0.12,
            { s: 1, c: M.mulc(c, 0.8) },
          );
        }
      }
    }
  }
  M.cornice = cornice;
  /** Horizontal belt course (string course). */
  function belt(x0, z0, x1, z1, y, d, h, mat, c) {
    const b = M.buf(mat || "stone_limestone", (x0 + x1) / 2, (z0 + z1) / 2);
    M.box(b, x0 - d, y, z0 - d, x1 + d, y + h, z1 + d, {
      s: 2,
      c: c || TRIM_C,
    });
  }
  /** Corner piers (vertical strips) of a tier. */
  function piers(x0, z0, x1, z1, y0, y1, w, d, mat, c) {
    const b = M.buf(mat || "stone_limestone", (x0 + x1) / 2, (z0 + z1) / 2);
    for (const [px, pz] of [
      [x0, z0],
      [x1, z0],
      [x1, z1],
      [x0, z1],
    ])
      M.box(
        b,
        px - w / 2 - d,
        y0,
        pz - w / 2 - d,
        px + w / 2 + d,
        y1,
        pz + w / 2 + d,
        { s: 2, c: c || TRIM_C, skip: 8 + 4 },
      );
  }

  /** Dark shell hole / blast damage on a wall (quad in front of the wall with scorch decal). */
  function shellHole(ax, az, bx, bz, t, y, w, h, nx, nz) {
    const px = ax + (bx - ax) * t + nx * 0.06,
      pz = az + (bz - az) * t + nz * 0.06;
    const ux = bx - ax,
      uz = bz - az,
      l = Math.hypot(ux, uz) || 1;
    const dx = ((ux / l) * w) / 2,
      dz = ((uz / l) * w) / 2;
    const b = M.buf("glass_dirty", px, pz);
    // irregular octagon-ish hole: two quads
    const c = [0.08, 0.08, 0.08];
    M.quad(
      b,
      [px - dx, y - h * 0.35, pz - dz],
      [px + dx, y - h * 0.45, pz + dz],
      [px + dx * 0.8, y + h * 0.5, pz + dz * 0.8],
      [px - dx * 0.9, y + h * 0.4, pz - dz * 0.9],
      [nx, 0, nz],
      [0, 0, 1, 0, 1, 1, 0, 1],
      c,
    );
    M.quad(
      b,
      [px - dx * 0.5, y + h * 0.4, pz - dz * 0.5],
      [px + dx * 0.6, y + h * 0.45, pz + dz * 0.6],
      [px + dx * 0.2, y + h * 0.62, pz + dz * 0.2],
      [px - dx * 0.2, y + h * 0.6, pz - dz * 0.2],
      [nx, 0, nz],
      [0, 0, 1, 0, 1, 1, 0, 1],
      c,
    );
    // scorch decal around
    const sb = M.buf("my/markings", px, pz, "detail");
    const k = 1.8,
      suv = M.markUV(M.MARK.SCORCH);
    M.quad(
      sb,
      [px - dx * k + nx * 0.02, y - h * k * 0.5, pz - dz * k + nz * 0.02],
      [px + dx * k + nx * 0.02, y - h * k * 0.5, pz + dz * k + nz * 0.02],
      [px + dx * k + nx * 0.02, y + h * k * 0.6, pz + dz * k + nz * 0.02],
      [px - dx * k + nx * 0.02, y + h * k * 0.6, pz - dz * k + nz * 0.02],
      [nx, 0, nz],
      [suv[0], suv[1], suv[2], suv[1], suv[2], suv[3], suv[0], suv[3]],
    );
    // twisted girder stubs poking out
    const gb = M.buf("rust", px, pz, "detail");
    for (let i = 0; i < 2; i++)
      M.beam(
        gb,
        px - dx * (0.5 - i),
        y - h * 0.2,
        pz - dz * (0.5 - i),
        px - dx * (0.5 - i) + nx * 1.5,
        y - h * 0.2 + (i ? 0.6 : -0.4),
        pz - dz * (0.5 - i) + nz * 1.5,
        0.15,
        0.25,
        { c: [0.8, 0.7, 0.6] },
      );
  }
  M.shellHole = shellHole;
  function randomHoles(x0, z0, x1, z1, yMin, yMax, n, r, face) {
    const sides = [
      ["n", x0, z0, x1, z0, 0, -1],
      ["e", x1, z0, x1, z1, 1, 0],
      ["s", x1, z1, x0, z1, 0, 1],
      ["w", x0, z1, x0, z0, -1, 0],
    ];
    for (let i = 0; i < n; i++) {
      const s = sides[r.int(0, 3)];
      if (face && face[s[0]] !== "f") continue;
      const len = Math.hypot(s[3] - s[1], s[4] - s[2]);
      if (len < 6) continue;
      shellHole(
        s[1],
        s[2],
        s[3],
        s[4],
        r.range(0.2, 0.8),
        r.range(yMin, yMax),
        r.range(2.5, 6),
        r.range(2.5, 5),
        s[5],
        s[6],
      );
    }
  }

  // -------------------------------------------------------------------
  // Ruined (jagged) top section: vertical strips with random tops, exposed
  // floor slabs & girders.
  // -------------------------------------------------------------------
