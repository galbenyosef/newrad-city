// play-inline-102 02 — quad
// Lines 65-385 of readable/play-inline-102.pretty.js (statement-aligned).
  function subwayCar(cx, cz, yaw, o) {
    o = o || {};
    const L2 = 16,
      W = 3.0,
      FL = 1.25,
      H = 2.5; // floor at FL (platform height), body height
    const m = M.mtx(cx, o.dy || 0, cz, yaw, o.pitch || 0, o.roll || 0);
    M.pushXF(m);
    const body = b("corrugated"),
      dark = b("glass_dirty"),
      trim = b("metal_painted");
    const cBody = [0.78, 0.8, 0.82],
      cRed = [0.6, 0.18, 0.15];
    // undercarriage & trucks
    M.box(
      b("rust"),
      -W / 2 + 0.2,
      0.3,
      -L2 / 2 + 0.5,
      W / 2 - 0.2,
      FL - 0.1,
      L2 / 2 - 0.5,
      { s: 2, c: [0.4, 0.35, 0.3] },
    );
    for (const tz of [-L2 / 2 + 2.5, L2 / 2 - 2.5]) {
      M.box(b("rust"), -1.1, 0.1, tz - 1.3, 1.1, 0.7, tz + 1.3, {
        s: 1,
        c: [0.3, 0.28, 0.25],
      });
      for (const wz of [-0.8, 0.8])
        for (const wx of [-0.75, 0.75])
          M.pipe(
            b("rust"),
            wx - 0.05,
            0.45,
            tz + wz,
            wx + 0.05,
            0.45,
            tz + wz,
            0.42,
            10,
            { c: [0.35, 0.32, 0.3] },
          );
    }
    // floor
    M.box(trim, -W / 2, FL - 0.1, -L2 / 2, W / 2, FL, L2 / 2, {
      s: 2,
      c: [0.45, 0.42, 0.38],
    });
    // side walls with window band & door openings (doors at 3 positions)
    const doors = [-5, 0, 5];
    const dw = 1.3;
    for (const sd of [-1, 1]) {
      const x = (sd * W) / 2;
      const openSide = o.open && sd === (o.openSide || 1);
      let z = -L2 / 2;
      const segs = [];
      for (const dz of doors) {
        segs.push([z, dz - dw / 2]);
        z = dz + dw / 2;
      }
      segs.push([z, L2 / 2]);
      for (const [za, zb] of segs) {
        M.quad(
          body,
          [x, FL, za],
          [x, FL, zb],
          [x, FL + 1.0, zb],
          [x, FL + 1.0, za],
          [sd, 0, 0],
          [0, 0, (zb - za) / 2, 0, (zb - za) / 2, 0.5, 0, 0.5],
          cBody,
        );
        M.quad(
          dark,
          [x + sd * 0.01, FL + 1.0, za + 0.2],
          [x + sd * 0.01, FL + 1.0, zb - 0.2],
          [x + sd * 0.01, FL + 1.9, zb - 0.2],
          [x + sd * 0.01, FL + 1.9, za + 0.2],
          [sd, 0, 0],
          [0, 0, 1, 0, 1, 1, 0, 1],
          [0.12, 0.13, 0.13],
        );
        M.quad(
          body,
          [x, FL + 1.9, za],
          [x, FL + 1.9, zb],
          [x, FL + H, zb],
          [x, FL + H, za],
          [sd, 0, 0],
          [0, 0, (zb - za) / 2, 0, (zb - za) / 2, 0.3, 0, 0.3],
          cBody,
        );
        // window posts
        for (let pz = za + 0.2; pz < zb - 0.1; pz += 1.1)
          M.box(
            trim,
            x - 0.03,
            FL + 1.0,
            pz - 0.05,
            x + 0.03,
            FL + 1.9,
            pz + 0.05,
            { s: 1, c: cBody },
          );
      }
      for (const dz of doors) {
        const open = openSide || (o.brokenDoors && Math.abs(dz) === 5);
        if (!open)
          M.quad(
            body,
            [x, FL, dz - dw / 2],
            [x, FL, dz + dw / 2],
            [x, FL + 2.05, dz + dw / 2],
            [x, FL + 2.05, dz - dw / 2],
            [sd, 0, 0],
            [0, 0, 1, 0, 1, 1, 0, 1],
            M.mulc(cBody, 0.85),
          );
        M.quad(
          body,
          [x, FL + 2.05, dz - dw / 2],
          [x, FL + 2.05, dz + dw / 2],
          [x, FL + H, dz + dw / 2],
          [x, FL + H, dz - dw / 2],
          [sd, 0, 0],
          [0, 0, 1, 0, 1, 0.3, 0, 0.3],
          cBody,
        );
      }
      // red belt line
      M.box(
        b("paint_red"),
        x - 0.02,
        FL + 0.9,
        -L2 / 2,
        x + 0.02,
        FL + 1.0,
        L2 / 2,
        { s: 1, c: cRed },
      );
    }
    // ends with windows
    for (const sd of [-1, 1]) {
      const z = (sd * L2) / 2;
      M.quad(
        body,
        [-W / 2, FL - 0.1, z],
        [W / 2, FL - 0.1, z],
        [W / 2, FL + H, z],
        [-W / 2, FL + H, z],
        [0, 0, sd],
        [0, 0, 1.5, 0, 1.5, 1.3, 0, 1.3],
        M.mulc(cBody, 0.9),
      );
      M.quad(
        dark,
        [-0.9, FL + 1.1, z + sd * 0.01],
        [0.9, FL + 1.1, z + sd * 0.01],
        [0.9, FL + 1.9, z + sd * 0.01],
        [-0.9, FL + 1.9, z + sd * 0.01],
        [0, 0, sd],
        [0, 0, 1, 0, 1, 1, 0, 1],
        [0.1, 0.1, 0.1],
      );
      M.quad(
        b("my/subwaysigns"),
        [-0.9, FL + 2.0, z + sd * 0.02],
        [0.9, FL + 2.0, z + sd * 0.02],
        [0.9, FL + 2.4, z + sd * 0.02],
        [-0.9, FL + 2.4, z + sd * 0.02],
        [0, 0, sd],
        (() => {
          const uv = M.cellUV(10, 2, 8);
          return sd > 0
            ? [uv[0], uv[1], uv[2], uv[1], uv[2], uv[3], uv[0], uv[3]]
            : [uv[2], uv[1], uv[0], uv[1], uv[0], uv[3], uv[2], uv[3]];
        })(),
      );
      // bumper/coupler
      M.box(b("rust"), -0.25, 0.6, z, 0.25, 0.9, z + sd * 0.6, {
        s: 1,
        c: [0.35, 0.3, 0.28],
      });
    }
    // curved roof (3 facets)
    const rC = [0.65, 0.66, 0.68];
    M.quad(
      body,
      [-W / 2, FL + H, -L2 / 2],
      [-W / 2, FL + H, L2 / 2],
      [-0.8, FL + H + 0.35, L2 / 2],
      [-0.8, FL + H + 0.35, -L2 / 2],
      [-0.5, 0.85, 0],
      [0, 0, 8, 0, 8, 0.5, 0, 0.5],
      rC,
    );
    M.quad(
      body,
      [-0.8, FL + H + 0.35, -L2 / 2],
      [-0.8, FL + H + 0.35, L2 / 2],
      [0.8, FL + H + 0.35, L2 / 2],
      [0.8, FL + H + 0.35, -L2 / 2],
      [0, 1, 0],
      [0, 0, 8, 0, 8, 1, 0, 1],
      rC,
    );
    M.quad(
      body,
      [0.8, FL + H + 0.35, -L2 / 2],
      [0.8, FL + H + 0.35, L2 / 2],
      [W / 2, FL + H, L2 / 2],
      [W / 2, FL + H, -L2 / 2],
      [0.5, 0.85, 0],
      [0, 0, 8, 0, 8, 0.5, 0, 0.5],
      rC,
    );
    if (o.open) {
      // interior: inside faces, seats, poles, straps, litter
      const inn = b("metal_panel");
      const ic = [0.62, 0.6, 0.55];
      for (const sd of [-1, 1])
        M.quad(
          inn,
          [sd * (W / 2 - 0.04), FL, sd > 0 ? L2 / 2 : -L2 / 2],
          [sd * (W / 2 - 0.04), FL, sd > 0 ? -L2 / 2 : L2 / 2],
          [sd * (W / 2 - 0.04), FL + 1.0, sd > 0 ? -L2 / 2 : L2 / 2],
          [sd * (W / 2 - 0.04), FL + 1.0, sd > 0 ? L2 / 2 : -L2 / 2],
          [-sd, 0, 0],
          [0, 0, 8, 0, 8, 0.5, 0, 0.5],
          ic,
        );
      M.quad(
        inn,
        [-W / 2, FL + H - 0.05, L2 / 2],
        [W / 2, FL + H - 0.05, L2 / 2],
        [W / 2, FL + H - 0.05, -L2 / 2],
        [-W / 2, FL + H - 0.05, -L2 / 2],
        [0, -1, 0],
        [0, 0, 1.5, 0, 1.5, 8, 0, 8],
        [0.7, 0.68, 0.62],
      );
      for (const sd of [-1, 1]) {
        const z0e = (sd * L2) / 2 - sd * 0.04;
        M.quad(
          inn,
          [W / 2, FL, z0e],
          [-W / 2, FL, z0e],
          [-W / 2, FL + H, z0e],
          [W / 2, FL + H, z0e],
          [0, 0, -sd],
          [0, 0, 1.5, 0, 1.5, 1.3, 0, 1.3],
          ic,
        );
      }
      const seat = b("fabric");
      for (const [za, zb] of [
        [-7.6, -5.8],
        [-4.2, -0.8],
        [0.8, 4.2],
        [5.8, 7.6],
      ])
        for (const sd of [-1, 1]) {
          M.box(
            seat,
            sd > 0 ? W / 2 - 0.55 : -W / 2 + 0.05,
            FL + 0.42,
            za,
            sd > 0 ? W / 2 - 0.05 : -W / 2 + 0.55,
            FL + 0.52,
            zb,
            { s: 1, c: [0.55, 0.4, 0.25] },
          );
          M.box(
            seat,
            sd > 0 ? W / 2 - 0.15 : -W / 2 + 0.05,
            FL + 0.52,
            za,
            sd > 0 ? W / 2 - 0.05 : -W / 2 + 0.15,
            FL + 1.0,
            zb,
            { s: 1, c: [0.5, 0.38, 0.24] },
          );
        }
      for (const z of [-6.5, -2.5, 2.5, 6.5])
        M.pipe(b("chrome"), 0, FL, z, 0, FL + H, z, 0.03, 6, {
          c: [0.8, 0.8, 0.78],
        });
      for (let z = -7; z < 7.5; z += 0.9)
        for (const sd of [-0.6, 0.6]) {
          M.pipe(
            b("chrome"),
            sd,
            FL + H - 0.05,
            z,
            sd,
            FL + H - 0.35,
            z,
            0.01,
            3,
            { c: [0.7, 0.7, 0.68] },
          );
          M.cyl(b("fabric"), sd, FL + H - 0.45, z, 0.07, 0.07, 0.1, 6, {
            c: [0.8, 0.75, 0.6],
          });
        }
      const db = M.buf("my/markings", 0, 0, LAYER);
      M.decal(db, 0, FL + 0.01, -3, 1.6, 3, 0.2, M.MARK.LITTER);
      M.decal(db, 0.3, FL + 0.012, 4, 1.4, 2.4, 1.2, M.MARK.BLOOD);
    }
    M.popXF();
  }

  // -------------------------------------------------------------------
  // Interior build
  // -------------------------------------------------------------------
  const PF = 1.2; // platform height
  const TOP = 5.2; // track-level ceiling
  const MZ = 5.5; // mezzanine floor
  const MTOP = 9.0; // mezzanine ceiling
  const T61_X = 80; // east tunnel north wall (z -8) around x 80 is reserved for the lair's T-61 bulkhead: keep it clear
