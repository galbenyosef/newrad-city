// play-inline-101 02 — top
// Lines 197-460 of readable/play-inline-101.pretty.js (statement-aligned).
  function buildEntrance(e) {
    const x1 = e.cx + e.len / 2,
      x0 = e.cx - e.len / 2,
      z0 = e.cz - e.w / 2,
      z1 = e.cz + e.w / 2;
    const cx = e.cx,
      cz = e.cz;
    const top = M.rasterAt(x1 + 1, cz) === M.RC.RAISED ? 0.12 : 0.0;
    const tile = M.buf("my/subwaytile", cx, cz, "main");
    const s = 2;
    // stairwell walls (N, S, W) from street level down into darkness
    const wallC0 = [0.25, 0.25, 0.23],
      wallC1 = [0.85, 0.83, 0.78];
    M.quad(
      tile,
      [x1, DEPTH2, z0],
      [x0, DEPTH2, z0],
      [x0, top, z0],
      [x1, top, z0],
      [0, 0, 1],
      [
        x1 / s,
        DEPTH2 / s,
        x0 / s,
        DEPTH2 / s,
        x0 / s,
        top / s,
        x1 / s,
        top / s,
      ],
      wallC0,
      wallC1,
    );
    M.quad(
      tile,
      [x0, DEPTH2, z1],
      [x1, DEPTH2, z1],
      [x1, top, z1],
      [x0, top, z1],
      [0, 0, -1],
      [
        x0 / s,
        DEPTH2 / s,
        x1 / s,
        DEPTH2 / s,
        x1 / s,
        top / s,
        x0 / s,
        top / s,
      ],
      wallC0,
      wallC1,
    );
    M.quad(
      tile,
      [x0, DEPTH2, z0],
      [x0, DEPTH2, z1],
      [x0, top, z1],
      [x0, top, z0],
      [1, 0, 0],
      [
        z0 / s,
        DEPTH2 / s,
        z1 / s,
        DEPTH2 / s,
        z1 / s,
        top / s,
        z0 / s,
        top / s,
      ],
      [0.05, 0.05, 0.05],
      [0.4, 0.4, 0.38],
    );
    // east end below the top step (the riser under the street edge)
    // steps: first flight (walkable), landing, second flight (dark, behind the gate)
    const sb = M.buf("concrete", cx, cz, "main");
    const n1 = 7;
    for (let i = 0; i < n1; i++) {
      const tA = (LANDING * i) / n1,
        tB = (LANDING * (i + 1)) / n1;
      const y = top + ((DEPTH1 - top) * (i + 1)) / n1;
      M.box(sb, x1 - tB, DEPTH2, z0, x1 - tA, y, z1, {
        s: 1.5,
        c: [0.7, 0.68, 0.64],
        cy: [0.8, 0.78, 0.72],
        skip: 8 + 16 + 32,
      });
      // metal nosing
      M.box(
        M.buf("metal_panel", cx, cz, "detail"),
        x1 - tB - 0.02,
        y - 0.02,
        z0 + 0.05,
        x1 - tB + 0.06,
        y + 0.01,
        z1 - 0.05,
        { s: 1, c: [0.6, 0.6, 0.55] },
      );
    }
    M.box(sb, x1 - LAND_END, DEPTH2, z0, x1 - LANDING, DEPTH1, z1, {
      s: 1.5,
      c: [0.62, 0.6, 0.56],
      skip: 8 + 16 + 32,
    });
    const n2 = 8;
    for (let i = 0; i < n2; i++) {
      const tA = LAND_END + ((e.len - LAND_END) * i) / n2,
        tB = LAND_END + ((e.len - LAND_END) * (i + 1)) / n2;
      const y = DEPTH1 + ((DEPTH2 + 0.3 - DEPTH1) * (i + 1)) / n2;
      M.box(sb, x1 - tB, DEPTH2 - 0.2, z0, x1 - tA, y, z1, {
        s: 1.5,
        c: M.mulc([0.5, 0.48, 0.45], 1 - (i / n2) * 0.8),
        skip: 8 + 16 + 32,
      });
    }
    // darkness at the bottom
    M.quad(
      M.buf("glass_dirty", cx, cz, "main"),
      [x0 + 0.02, DEPTH2, z1],
      [x0 + 0.02, DEPTH2, z0],
      [x0 + 0.02, DEPTH1 + 0.2, z0],
      [x0 + 0.02, DEPTH1 + 0.2, z1],
      [1, 0, 0],
      [0, 0, 1, 0, 1, 1, 0, 1],
      [0.01, 0.01, 0.01],
    );
    // rusted scissor gate at the landing
    const gx = x1 - LAND_END + 0.1;
    const gb = M.buf("rust", cx, cz, "detail");
    for (let z = z0 + 0.1; z < z1; z += 0.22)
      M.beam(gb, gx, DEPTH1, z, gx, DEPTH1 + 2.3, z + 0.12, 0.03, 0.03, {
        c: [0.5, 0.35, 0.28],
      });
    for (let z = z0 + 0.1; z < z1; z += 0.22)
      M.beam(gb, gx, DEPTH1, z + 0.12, gx, DEPTH1 + 2.3, z, 0.03, 0.03, {
        c: [0.5, 0.35, 0.28],
      });
    M.beam(gb, gx, DEPTH1 + 2.35, z0, gx, DEPTH1 + 2.35, z1, 0.08, 0.08, {
      c: [0.45, 0.32, 0.26],
    });
    M.box3(gx - 0.1, DEPTH1 - 0.5, z0, gx + 0.1, DEPTH1 + 3, z1, {
      tag: "gate",
      surface: "metal",
    });
    // granite coping & iron railings (N, S, W) with colliders; the east end is the way in
    const cp = M.buf("granite", cx, cz, "main");
    M.box(cp, x0 - 0.3, top - 0.05, z0 - 0.3, x1, top + 0.18, z0, {
      s: 1.5,
      c: [0.8, 0.78, 0.74],
    });
    M.box(cp, x0 - 0.3, top - 0.05, z1, x1, top + 0.18, z1 + 0.3, {
      s: 1.5,
      c: [0.8, 0.78, 0.74],
    });
    M.box(cp, x0 - 0.3, top - 0.05, z0, x0, top + 0.18, z1, {
      s: 1.5,
      c: [0.8, 0.78, 0.74],
    });
    const rb = M.buf("metal_painted", cx, cz, "detail");
    const rc = [0.2, 0.28, 0.22];
    const rail = (ax, az, bx, bz) => {
      M.beam(rb, ax, top + 1.1, az, bx, top + 1.1, bz, 0.06, 0.06, { c: rc });
      M.beam(rb, ax, top + 0.35, az, bx, top + 0.35, bz, 0.04, 0.04, { c: rc });
      const L2 = Math.hypot(bx - ax, bz - az),
        n = Math.max(2, Math.round(L2 / 0.14));
      for (let i = 0; i <= n; i++) {
        const t = i / n;
        const px = ax + (bx - ax) * t,
          pz = az + (bz - az) * t;
        M.box(
          rb,
          px - 0.015,
          top + 0.18,
          pz - 0.015,
          px + 0.015,
          top + 1.1,
          pz + 0.015,
          { s: 1, c: rc, skip: 12 },
        );
      }
      M.box3(
        Math.min(ax, bx) - 0.08,
        top,
        Math.min(az, bz) - 0.08,
        Math.max(ax, bx) + 0.08,
        top + 1.15,
        Math.max(az, bz) + 0.08,
        { tag: "railing", surface: "metal" },
      );
    };
    rail(x0 - 0.15, z0 - 0.15, x1, z0 - 0.15);
    rail(x0 - 0.15, z1 + 0.15, x1, z1 + 0.15);
    rail(x0 - 0.15, z0 - 0.15, x0 - 0.15, z1 + 0.15);
    // ornate newel posts with green globe lamps at the entrance
    for (const zz of [z0 - 0.15, z1 + 0.15]) {
      M.cyl(rb, x1, top, zz, 0.12, 0.09, 2.3, 8, { c: rc });
      M.cyl(rb, x1, top + 2.3, zz, 0.1, 0.16, 0.18, 8, { c: rc });
      M.cyl(
        M.buf("neon_green@lampg", cx, cz, "main"),
        x1,
        top + 2.48,
        zz,
        0.2,
        0.2,
        0.36,
        10,
        { capTop: true },
      );
      M.cyl(rb, x1, top + 2.84, zz, 0.12, 0.03, 0.14, 8, { c: rc });
    }
    // SUBWAY sign on a bar between the posts
    M.beam(
      rb,
      x1,
      top + 1.95,
      z0 - 0.15,
      x1,
      top + 1.95,
      z1 + 0.15,
      0.05,
      0.05,
      { c: rc },
    );
    const i = SSIGNS.indexOf("SUBWAY"),
      uv = M.cellUV(i, 2, 8);
    const sg = M.buf("my/subwaysigns", cx, cz, "main");
    M.quad(
      sg,
      [x1 + 0.03, top + 1.55, z1 - 0.1],
      [x1 + 0.03, top + 1.55, z0 + 0.1],
      [x1 + 0.03, top + 1.93, z0 + 0.1],
      [x1 + 0.03, top + 1.93, z1 - 0.1],
      [1, 0, 0],
      [uv[0], uv[1], uv[2], uv[1], uv[2], uv[3], uv[0], uv[3]],
    );
    M.quad(
      sg,
      [x1 - 0.03, top + 1.55, z0 + 0.1],
      [x1 - 0.03, top + 1.55, z1 - 0.1],
      [x1 - 0.03, top + 1.93, z1 - 0.1],
      [x1 - 0.03, top + 1.93, z0 + 0.1],
      [-1, 0, 0],
      [uv[0], uv[1], uv[2], uv[1], uv[2], uv[3], uv[0], uv[3]],
    );
    // litter & dirt in the stairwell
    const db = M.buf("my/markings", cx, cz, "fine");
    M.decal(db, x1 - 4.5, DEPTH1 + 0.02, cz, 1.6, 2.2, 0.3, M.MARK.LITTER);
    M.decal(
      db,
      x1 - 4.2,
      DEPTH1 + 0.025,
      cz + 0.3,
      1.4,
      1.4,
      1.1,
      M.MARK.PUDDLE,
    );
    e.door = new THREE.Vector3(gx + 0.35, DEPTH1 + 1.2, cz);
    e.outside = new THREE.Vector3(x1 + 1.4, top, cz);
  }

  M.buildSubwayEntrances = function () {
    for (const e of M.subwayEntrances) buildEntrance(e);
  };
