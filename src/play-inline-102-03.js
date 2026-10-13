// play-inline-102 03 — the
// Lines 386-1241 of readable/play-inline-102.pretty.js (statement-aligned).
  function buildInterior() {
    const r = M.rng("subway");
    // ---------------- track level box: x -45..45, z -8..16 ----------------
    // floor (track bed), ballast strips, rails & third rail
    M.quad(
      b("rubble"),
      [-95, 0, 16],
      [95, 0, 16],
      [95, 0, -8],
      [-95, 0, -8],
      [0, 1, 0],
      [-30, 5, 30, 5, 30, -3, -30, -3],
      [0.55, 0.52, 0.48],
    );
    for (const tz of [-3.5, 11.5]) {
      for (const rz of [-0.72, 0.72])
        M.box(b("rust"), -95, 0.12, tz + rz - 0.04, 95, 0.28, tz + rz + 0.04, {
          s: 2,
          c: [0.75, 0.62, 0.5],
        });
      M.box(b("wood_rotten"), -95, 0, tz - 1.2, 95, 0.12, tz + 1.2, {
        s: 1.2,
        c: [0.45, 0.38, 0.3],
      });
      M.box(b("metal_painted"), -95, 0.2, tz + 1.55, 95, 0.38, tz + 1.7, {
        s: 2,
        c: [0.35, 0.33, 0.3],
      }); // third rail
      M.box(b("wood_planks"), -95, 0.38, tz + 1.5, 95, 0.42, tz + 1.75, {
        s: 2,
        c: [0.5, 0.42, 0.3],
      }); // cover board
    }
    // island platform z -1..9
    concreteBox(-45, 0, -1, 45, PF, 9, [0.62, 0.6, 0.56]);
    CB(-45, 0, -1, 45, PF, 9, { surface: "concrete" });
    // yellow warning strips at the edges
    for (const ez of [-0.95, 8.35])
      M.box(b("cryo_orange"), -45, PF, ez, 45, PF + 0.01, ez + 0.6, {
        s: 2,
        c: [0.9, 0.85, 0.7],
      });
    // outer tiled walls (z=-8 facing +z, z=16 facing -z) and station ends (x=±45) above the tunnels
    tileWall(45, -8, -45, -8, 0, TOP, 0, 1);
    tileWall(-45, 16, 45, 16, 0, TOP, 0, -1);
    // north wall colliders leave a doorway to the maintenance room (x -62..-60)
    CB(-95, 0, -8.4, -62, TOP, -8);
    CB(-60, 0, -8.4, 95, TOP, -8);
    CB(-62, 2.7, -8.4, -60, TOP, -8);
    CB(-95, 0, 16, 95, TOP, 16.4);
    // mosaic band & name tablets
    for (const [z, nz] of [
      [-7.98, 1],
      [15.98, -1],
    ]) {
      for (let x = -40; x <= 40; x += 13)
        ssign("TIMES SQ — 42 ST", x, 2.9, z, 0, nz, 3.2);
      for (let x = -46; x <= 46; x += 13)
        ssign("42", x + 6.5, 2.9, z, 0, nz, 1.2);
      const band = b("paint_teal");
      M.box(
        band,
        -45,
        3.9,
        nz > 0 ? z - 0.02 : z - 0.03,
        45,
        4.1,
        nz > 0 ? z + 0.03 : z + 0.02,
        { s: 1, c: [0.6, 0.85, 0.75] },
      );
    }
    // ceiling (track level) outside the mezzanine
    const ceil = b("concrete@emis2");
    const ceilQ = (x0, z0, x1, z1) =>
      M.quad(
        ceil,
        [x0, TOP, z0],
        [x1, TOP, z0],
        [x1, TOP, z1],
        [x0, TOP, z1],
        [0, -1, 0],
        [x0 / 4, z0 / 4, x1 / 4, z0 / 4, x1 / 4, z1 / 4, x0 / 4, z1 / 4],
        [0.5, 0.5, 0.47],
      );
    // (leave the stair opening x 3.5..6.5, z 0.5..8 open)
    ceilQ(-95, -8, 3.5, 16);
    ceilQ(6.5, -8, 95, 16);
    ceilQ(3.5, -8, 6.5, 0.5);
    ceilQ(3.5, 8, 6.5, 16);
    // column rows along the platform edges and between tracks outside the platform
    const colB = b("metal_painted");
    for (let x = -42; x <= 42; x += 5)
      for (const z of [0.1, 7.9]) {
        M.box(colB, x - 0.15, PF, z - 0.2, x + 0.15, TOP, z + 0.2, {
          s: 1,
          c: [0.28, 0.35, 0.3],
        });
        M.box(colB, x - 0.3, PF, z - 0.05, x + 0.3, TOP, z + 0.05, {
          s: 1,
          c: [0.3, 0.37, 0.32],
        });
        CB(x - 0.3, PF, z - 0.2, x + 0.3, TOP, z + 0.2, { surface: "metal" });
      }
    // hanging fluorescent fixtures (some dead, some flickering) & direction signs; each live tube throws a soft
    // additive light cone and a pool on the platform (fake light — the atmosphere module lends real lights to the nearest)
    const fx = b("my/lightfx");
    const flick = [];
    for (let x = -40; x <= 40; x += 6) {
      const k = r(),
        alive = k < 0.72;
      M.box(
        b(alive ? "emissive_window@lampw" : "glass_dirty"),
        x - 0.9,
        TOP - 0.5,
        3.9,
        x + 0.9,
        TOP - 0.42,
        4.1,
        { s: 1, c: [0.35, 0.35, 0.33] },
      );
      M.box(
        b("metal_painted"),
        x - 0.95,
        TOP - 0.42,
        3.82,
        x + 0.95,
        TOP - 0.36,
        4.18,
        { s: 1, c: [0.3, 0.32, 0.3] },
      );
      M.pipe(
        b("metal_painted"),
        x - 0.7,
        TOP,
        4,
        x - 0.7,
        TOP - 0.42,
        4,
        0.015,
        3,
        { c: [0.2, 0.2, 0.2] },
      );
      M.pipe(
        b("metal_painted"),
        x + 0.7,
        TOP,
        4,
        x + 0.7,
        TOP - 0.42,
        4,
        0.015,
        3,
        { c: [0.2, 0.2, 0.2] },
      );
      if (alive) {
        const cc = [0.07, 0.085, 0.08];
        M.lightCone(fx, x, TOP - 0.5, 4, x, PF + 0.02, 4, 0.9, 2.2, cc);
        M.lightPool(fx, x, PF + 0.03, 4, 3.2, 2.6, [0.16, 0.18, 0.16]);
        if (k > 0.6) flick.push([x, TOP - 0.6, 4]);
      }
    }
    // caged wall lamps along both outer walls & the track bed, and red emergency lamps by the stairs
    for (let x = -42; x <= 42; x += 9)
      for (const [z, nz] of [
        [-7.9, 1],
        [15.9, -1],
      ]) {
        const alive = r() < 0.7;
        M.box(
          b("metal_painted"),
          x - 0.18,
          3.25,
          nz > 0 ? z : z - 0.25,
          x + 0.18,
          3.65,
          nz > 0 ? z + 0.25 : z,
          { s: 1, c: [0.25, 0.25, 0.23] },
        );
        M.box(
          b(alive ? "emissive_window@lamp" : "glass_dirty"),
          x - 0.12,
          3.3,
          nz > 0 ? z + 0.05 : z - 0.3,
          x + 0.12,
          3.55,
          nz > 0 ? z + 0.3 : z - 0.05,
          { s: 1, c: [0.5, 0.5, 0.45] },
        );
        if (alive) {
          M.lightCone(
            fx,
            x,
            3.3,
            z + nz * 0.3,
            x,
            0.02,
            z + nz * 1.6,
            0.25,
            1.6,
            [0.08, 0.065, 0.04],
            false,
          );
          M.lightPool(fx, x, 0.03, z + nz * 1.8, 2.2, 2.2, [0.12, 0.1, 0.07]);
        }
      }
    for (const [x, z] of [
      [3.2, 8.4],
      [6.8, 0.2],
      [-2.6, -7.8],
    ]) {
      M.box(
        b("neon_red@lampr"),
        x - 0.12,
        PF + 3.2,
        z - 0.12,
        x + 0.12,
        PF + 3.45,
        z + 0.12,
        { s: 1 },
      );
    }
    M.subwayFlicker = flick.map(
      (p) => new THREE.Vector3(S.x + p[0], (S.y || 0) + p[1], S.z + p[2]),
    );
    for (const x of [-30, 20]) {
      ssign("UPTOWN & THE BRONX", x, TOP - 0.9, 1.6, 0, -1, 2.8);
      ssign("DOWNTOWN & BROOKLYN", x, TOP - 0.9, 6.4, 0, 1, 2.8);
    }
    // benches, trash, newsstand
    const wb = b("wood_planks");
    for (const x of [-35, -20, 25, 38]) {
      M.box(wb, x - 1.2, PF + 0.42, 3.4, x + 1.2, PF + 0.47, 4.6, {
        s: 1,
        c: [0.55, 0.42, 0.3],
      });
      M.box(wb, x - 1.2, PF + 0.47, 4.5, x + 1.2, PF + 0.95, 4.6, {
        s: 1,
        c: [0.5, 0.4, 0.28],
      });
      CB(x - 1.2, PF, 3.4, x + 1.2, PF + 0.5, 4.6, { surface: "wood" });
    }
    M.box(wb, 28, PF, 2.2, 32, PF + 2.6, 5.8, {
      s: 1.5,
      c: [0.55, 0.45, 0.32],
    });
    M.box(b("fabric"), 27.8, PF + 2.6, 2.0, 32.2, PF + 2.75, 6.0, {
      s: 1,
      c: [0.5, 0.2, 0.15],
    });
    M.box(b("glass_dirty"), 27.98, PF + 1.1, 2.6, 28.0, PF + 2.2, 5.4, {
      s: 1,
      c: [0.3, 0.3, 0.3],
    });
    CB(28, PF, 2.2, 32, PF + 2.6, 5.8, { surface: "wood" });
    for (const x of [-10, 12, 35]) {
      M.cyl(b("metal_panel"), x, PF, 1.2, 0.3, 0.28, 0.9, 8, {
        c: [0.35, 0.4, 0.35],
        capTop: true,
      });
      CB(x - 0.3, PF, 0.9, x + 0.3, PF + 0.9, 1.5);
    }
    // posters on the walls
    const brands = [
      "fizzo_cola",
      "long_winter",
      "lonly_tv",
      "prairie_root_beer",
      "super_sergeant",
      "silver_torch",
      "homeguard",
      "burger_brigade",
      "hi_octane",
      "liberty_jetliner",
      "junior_rocketeer",
      "miracle_mane",
      "excalibur_gardens",
      "chocolate_zeppelin",
    ]; // 14 platform posters, no repeats
    let bi = 0;
    for (let x = -38; x <= 38; x += 13) {
      M.adPanel(
        brands[bi++ % brands.length],
        x + 6.5,
        2.0,
        -7.95,
        0,
        1,
        2.4,
        1.2,
        { layer: LAYER },
      );
      M.adPanel(
        brands[bi++ % brands.length],
        x + 6.5,
        2.0,
        15.95,
        0,
        -1,
        2.4,
        1.2,
        { layer: LAYER },
      );
    }
    // platform grime
    const db = M.buf("my/markings", 0, 0, LAYER);
    for (let i = 0; i < 40; i++)
      M.decal(
        db,
        r.range(-44, 44),
        PF + 0.012,
        r.range(0, 8),
        r.range(1, 3),
        r.range(1, 3),
        r() * 6,
        r.pick([
          M.MARK.LITTER,
          M.MARK.STAIN,
          M.MARK.PUDDLE,
          M.MARK.DIRT,
          M.MARK.CRACKS,
          M.MARK.BLOOD,
        ]),
      );
    for (let i = 0; i < 24; i++)
      M.decal(
        db,
        r.range(-90, 90),
        0.02,
        r.pick([-3.5, 11.5]) + r.range(-1.5, 1.5),
        r.range(1, 3),
        r.range(1, 3),
        r() * 6,
        r.pick([M.MARK.PUDDLE, M.MARK.LITTER, M.MARK.STAIN]),
      );

    // ---------------- mezzanine above: x -14..14, z -8..16, y 5.5..9 ----------------
    // floor slab with the stair opening at x 3.5..6.5, z 0.5..8
    const slab = (x0, z0, x1, z1) => {
      concreteBox(x0, TOP, z0, x1, MZ, z1, [0.62, 0.6, 0.56]);
      M.quad(
        b("tile_cryo"),
        [x0, MZ + 0.005, z1],
        [x1, MZ + 0.005, z1],
        [x1, MZ + 0.005, z0],
        [x0, MZ + 0.005, z0],
        [0, 1, 0],
        [x0 / 2, z1 / 2, x1 / 2, z1 / 2, x1 / 2, z0 / 2, x0 / 2, z0 / 2],
        [0.7, 0.68, 0.62],
      );
      CB(x0, TOP, z0, x1, MZ, z1);
    };
    slab(-14, -8, 3.5, 16);
    slab(6.5, -8, 14, 16);
    slab(3.5, -8, 6.5, 0.5);
    slab(3.5, 8, 6.5, 16);
    // mezzanine walls & ceiling
    tileWall(14, -8, 2.5, -8, MZ, MTOP, 0, 1);
    tileWall(-2.5, -8, -14, -8, MZ, MTOP, 0, 1);
    tileWall(-14, 16, 14, 16, MZ, MTOP, 0, -1);
    tileWall(-14, -8, -14, 16, MZ, MTOP, 1, 0);
    tileWall(14, 16, 14, -8, MZ, MTOP, -1, 0);
    CB(-14.4, MZ, -8, -14, MTOP, 16);
    CB(14, MZ, -8, 14.4, MTOP, 16);
    M.quad(
      b("concrete@emis2"),
      [-14, MTOP, -8],
      [14, MTOP, -8],
      [14, MTOP, 16],
      [-14, MTOP, 16],
      [0, -1, 0],
      [0, 0, 8, 0, 8, 8, 0, 8],
      [0.55, 0.55, 0.52],
    );
    // street stair opening in the north wall (x -2.5..2.5) — cut a hole by overlaying a dark stairwell
    // stairwell box going up to the (sealed) street gate
    const sx0 = -2.5,
      sx1 = 2.5;
    const nS = 12;
    for (let i = 0; i < nS; i++) {
      const y = MZ + (4.2 * (i + 1)) / nS,
        z1 = -8 - i * 0.55,
        z0 = z1 - 0.55;
      M.box(b("concrete"), sx0, MZ, z0, sx1, y, z1, {
        s: 1.5,
        c: [0.6, 0.58, 0.54],
        skip: 8,
      });
      CB(sx0, MZ, z0, sx1, y, z1);
    }
    tileWall(sx0, -14.6, sx0, -8, MZ, MTOP + 4, 1, 0);
    tileWall(sx1, -8, sx1, -14.6, MZ, MTOP + 4, -1, 0);
    CB(sx0 - 0.4, MZ, -15, sx0, MTOP + 4, -8);
    CB(sx1, MZ, -15, sx1 + 0.4, MTOP + 4, -8);
    M.quad(
      b("concrete_dark"),
      [sx0, MTOP + 4, -14.6],
      [sx1, MTOP + 4, -14.6],
      [sx1, MTOP + 4, -8],
      [sx0, MTOP + 4, -8],
      [0, -1, 0],
      [0, 0, 2, 0, 2, 3, 0, 3],
      [0.3, 0.3, 0.3],
    );
    // sealed gate at the top + daylight leaking through, spilling a shaft of dusty light down the stairs
    const gb = b("rust");
    for (let x = sx0 + 0.1; x < sx1; x += 0.2)
      M.beam(gb, x, MZ + 4.2, -14.55, x, MZ + 7.2, -14.55, 0.03, 0.03, {
        c: [0.5, 0.35, 0.28],
      });
    M.quad(
      b("emissive_window@lamp"),
      [sx1, MZ + 4.2, -14.62],
      [sx0, MZ + 4.2, -14.62],
      [sx0, MZ + 7.2, -14.62],
      [sx1, MZ + 7.2, -14.62],
      [0, 0, 1],
      [0, 0, 1, 0, 1, 1, 0, 1],
    );
    {
      const fx2 = b("my/lightfx"),
        uv = M.lightUV(0),
        sc = [0.22, 0.21, 0.16];
      // slanted shaft from the gate down onto the mezzanine floor (two layers for depth)
      for (const k of [0, 1]) {
        const w = 2.3 - k * 0.5,
          zf = -6 + k * 1.5;
        M.quad(
          fx2,
          [-w, MZ + 0.05, zf],
          [w, MZ + 0.05, zf],
          [w, MZ + 7.0, -14.5],
          [-w, MZ + 7.0, -14.5],
          [0, 0.6, 0.8],
          [uv[0], uv[1], uv[2], uv[1], uv[2], uv[3], uv[0], uv[3]],
          sc,
          sc,
        );
      }
      M.lightPool(fx2, 0, MZ + 0.03, -5, 2.6, 2.4, [0.2, 0.19, 0.15]);
    }
    CB(sx0, MZ + 4.2, -15, sx1, MZ + 8, -14.5);
    // mezzanine north wall pieces around the stair opening are the tile wall above (the opening is the gap between sx0/sx1)
    ssign("EXIT TO 42 ST", 0, MZ + 3.0, -7.95, 0, 1, 2.6);
    // token booth (centre) & turnstile line (z = 4)
    const bb = b("metal_painted");
    M.box(bb, -3, MZ, -1, 1, MZ + 1.1, 2, { s: 1.5, c: [0.4, 0.5, 0.45] });
    M.box(b("glass_dirty"), -3, MZ + 1.1, -1, 1, MZ + 2.4, 2, {
      s: 2,
      c: [0.55, 0.62, 0.6],
    });
    M.box(bb, -3.1, MZ + 2.4, -1.1, 1.1, MZ + 2.6, 2.1, {
      s: 1,
      c: [0.3, 0.35, 0.32],
    });
    ssign("TOKENS", -1, MZ + 2.9, -1.1, 0, -1, 2);
    CB(-3, MZ, -1, 1, MZ + 2.6, 2);
    for (let x = -12; x <= 12; x += 1.4) {
      if (x > 2.5 && x < 7.5) continue; // stair opening side
      if (Math.abs(x - 0) < 1.3 || Math.abs(x + 8) < 0.8) continue; // open gaps (broken turnstiles)
      M.box(b("chrome"), x - 0.25, MZ, 4.3, x + 0.25, MZ + 0.95, 4.7, {
        s: 1,
        c: [0.65, 0.65, 0.62],
      });
      M.cyl(b("chrome"), x, MZ + 0.95, 4.5, 0.18, 0.18, 0.12, 8, {
        capTop: true,
        c: [0.7, 0.7, 0.68],
      });
      CB(x - 0.25, MZ, 4.3, x + 0.25, MZ + 0.95, 4.7);
    }
    // stair railing around the opening in the mezzanine floor
    const rl = b("metal_painted");
    for (const [ax, az, bx2, bz] of [
      [3.5, 0.5, 3.5, 8],
      [6.5, 0.5, 6.5, 8],
      [3.5, 8, 6.5, 8],
    ]) {
      M.beam(rl, ax, MZ + 1, az, bx2, MZ + 1, bz, 0.05, 0.05, {
        c: [0.3, 0.35, 0.3],
      });
      CB(
        Math.min(ax, bx2) - 0.05,
        MZ,
        Math.min(az, bz) - 0.05,
        Math.max(ax, bx2) + 0.05,
        MZ + 1.05,
        Math.max(az, bz) + 0.05,
        { tag: "railing" },
      );
    }
    // stairs down to the platform (x 3.5..6.5, from z 0.5 (top, MZ) to z 8 (bottom, PF))
    const nD = 13;
    for (let i = 0; i < nD; i++) {
      const y = MZ - ((MZ - PF) * (i + 1)) / nD,
        z0 = 0.5 + (7.5 * i) / nD,
        z1 = z0 + 7.5 / nD;
      M.box(b("concrete"), 3.6, PF, z0, 6.4, y + (MZ - PF) / nD, z1, {
        s: 1.5,
        c: [0.62, 0.6, 0.56],
        skip: 8,
      });
      CB(3.6, PF, z0, 6.4, y + (MZ - PF) / nD, z1);
    }
    // mezzanine lights & dressing
    for (const [x, z] of [
      [-9, -2],
      [-9, 10],
      [9, -2],
      [9, 10],
      [0, 12],
      [-4, 5],
    ]) {
      const alive = r() < 0.75;
      M.box(
        b(alive ? "emissive_window@lampw" : "glass_dirty"),
        x - 0.8,
        MTOP - 0.1,
        z - 0.2,
        x + 0.8,
        MTOP - 0.02,
        z + 0.2,
        { s: 1, c: [0.3, 0.3, 0.3] },
      );
      if (alive) {
        M.lightCone(
          b("my/lightfx"),
          x,
          MTOP - 0.1,
          z,
          x,
          MZ + 0.02,
          z,
          0.8,
          2.0,
          [0.06, 0.07, 0.065],
        );
        M.lightPool(
          b("my/lightfx"),
          x,
          MZ + 0.03,
          z,
          2.8,
          2.8,
          [0.14, 0.15, 0.14],
        );
      }
    }
    ssign("TO ALL TRAINS", 5, MZ + 2.6, 15.95, 0, -1, 2.6);
    ssign("SHELTER — CAPACITY 200", -8, MZ + 2.4, 15.95, 0, -1, 3.2);
    for (let i = 0; i < 10; i++)
      M.decal(
        db,
        r.range(-13, 13),
        MZ + 0.015,
        r.range(-7, 15),
        r.range(1, 2.5),
        r.range(1, 2.5),
        r() * 6,
        r.pick([M.MARK.LITTER, M.MARK.STAIN, M.MARK.DIRT]),
      );
    // makeshift camp in the mezzanine (mattresses, crates) — survivors once sheltered here
    M.box(b("fabric"), -12, MZ, 8, -10, MZ + 0.25, 10, {
      s: 1,
      c: [0.55, 0.5, 0.4],
    });
    M.box(b("fabric"), -12, MZ, 11, -10, MZ + 0.25, 13, {
      s: 1,
      c: [0.5, 0.45, 0.38],
    });
    M.box(b("wood_planks"), -9, MZ, 13.5, -8, MZ + 0.8, 14.5, {
      s: 1,
      c: [0.65, 0.55, 0.4],
    });
    CB(-9, MZ, 13.5, -8, MZ + 0.8, 14.5, { surface: "wood" });

    // ---------------- tunnels beyond the station (x ±45..95) ----------------
    for (const sd of [-1, 1]) {
      const xa = sd * 45,
        xb = sd * 95;
      // tunnel walls: separate tubes around each track with a column line between
      if (sd > 0) tileWall(xa, -8, xb, -8, 0, TOP, 0, 1, true);
      else {
        tileWall(-95, -8, -62, -8, 0, TOP, 0, 1, true);
        tileWall(-60, -8, -45, -8, 0, TOP, 0, 1, true);
        tileWall(-62, -8, -60, -8, 2.7, TOP, 0, 1, true);
      }
      tileWall(Math.max(xa, xb), 16, Math.min(xa, xb), 16, 0, TOP, 0, -1, true);
      // the platform end wall
      M.quad(
        b("concrete"),
        [xa, 0, 9],
        [xa, 0, -1],
        [xa, PF, -1],
        [xa, PF, 9],
        [sd, 0, 0],
        [0, 0, 3, 0, 3, 0.4, 0, 0.4],
        [0.5, 0.5, 0.48],
      );
      // centre wall between the tracks (with arch openings suggested by columns)
      for (let x = xa + sd * 2; sd > 0 ? x < xb : x > xb; x += sd * 3.5) {
        M.box(colB, x - 0.25, 0, 3.4, x + 0.25, TOP, 4.6, {
          s: 1,
          c: [0.3, 0.3, 0.28],
        });
        CB(x - 0.25, 0, 3.4, x + 0.25, TOP, 4.6, { surface: "metal" });
      }
      // cave-in at the end
      const cz = [-3.5, 11.5];
      for (const z of cz) {
        const ex = xb - sd * 4;
        for (let k = 0; k < 14; k++) {
          const px = ex + sd * r.range(-3, 3),
            pz = z + r.range(-2.2, 2.2);
          M.obox(
            b(r() < 0.5 ? "concrete" : "rubble"),
            px,
            r.range(0.3, 3.5),
            pz,
            r.range(1, 2.5),
            r.range(0.6, 1.5),
            r.range(1, 2.2),
            r() * 6,
            {
              pitch: r.range(-0.6, 0.6),
              roll: r.range(-0.6, 0.6),
              s: 2,
              c: [0.55, 0.53, 0.5],
            },
          );
        }
        M.beam(
          b("rust"),
          ex - sd * 3,
          0,
          z - 1.5,
          ex + sd * 1,
          4.8,
          z + 1.2,
          0.3,
          0.4,
          { c: [0.6, 0.5, 0.4] },
        );
      }
      CB(xb - sd * 7 - 0.01, 0, -8, xb, TOP, 16, { walkable: false });
      M.quad(
        b("rubble"),
        [xb - sd * 6.5, 0, sd > 0 ? 16 : -8],
        [xb - sd * 6.5, 0, sd > 0 ? -8 : 16],
        [xb - sd * 6.5, TOP, sd > 0 ? -8 : 16],
        [xb - sd * 6.5, TOP, sd > 0 ? 16 : -8],
        [-sd, 0, 0],
        [0, 0, 8, 0, 8, 2, 0, 2],
        [0.4, 0.38, 0.35],
      );
      // red signal lamps (east tunnel: the north wall at local x 77..83 stays bare: the lair's T-61 bulkhead hatch, src/lair/30_entrances.js)
      for (
        let x = xa + sd * 12;
        sd > 0 ? x < xb - 8 : x > xb + 8;
        x += sd * 14
      ) {
        if (sd > 0 && Math.abs(x - T61_X) < 3) continue;
        M.box(b("metal_painted"), x - 0.2, 2.2, -7.9, x + 0.2, 3.0, -7.6, {
          s: 1,
          c: [0.2, 0.2, 0.2],
        });
        const red = r() < 0.5;
        M.box(
          b(red ? "neon_red@lampr" : "neon_green@lampg"),
          x - 0.1,
          2.6,
          -7.6,
          x + 0.1,
          2.8,
          -7.55,
          { s: 1 },
        );
        M.lightPool(
          b("my/lightfx"),
          x,
          0.04,
          -6.6,
          1.4,
          1.4,
          red ? [0.12, 0.02, 0.01] : [0.02, 0.1, 0.03],
        );
      }
      // caged work lights along the tunnel walls (most dead): pools of light you can see from the platform
      for (
        let x = xa + sd * 7;
        sd > 0 ? x < xb - 8 : x > xb + 8;
        x += sd * 10
      ) {
        if (r() < 0.45) continue;
        M.box(
          b("emissive_window@lamp"),
          x - 0.15,
          3.6,
          15.6,
          x + 0.15,
          3.85,
          15.9,
          { s: 1 },
        );
        M.lightCone(
          b("my/lightfx"),
          x,
          3.6,
          15.6,
          x,
          0.02,
          13.2,
          0.25,
          1.8,
          [0.07, 0.06, 0.04],
          false,
        );
        M.lightPool(
          b("my/lightfx"),
          x,
          0.04,
          13.4,
          2.4,
          2.2,
          [0.1, 0.085, 0.06],
        );
      }
      A["tunnel_" + (sd > 0 ? "e" : "w")] = [sd * 70, 0, -3.5];
      if (sd > 0) A.t61_bulkhead = [T61_X, 0, -6];
    }
    // ---------------- maintenance room off the west tunnel ----------------
    // opening in the north tunnel wall at x -62..-60 (tile walls are just quads; collider gap)
    const mx0 = -68,
      mx1 = -54,
      mz0 = -16,
      mz1 = -8;
    M.quad(
      b("concrete"),
      [mx0, 0.01, mz1],
      [mx1, 0.01, mz1],
      [mx1, 0.01, mz0],
      [mx0, 0.01, mz0],
      [0, 1, 0],
      [0, 0, 5, 0, 5, 3, 0, 3],
      [0.5, 0.5, 0.48],
    );
    M.quad(
      b("concrete_dark"),
      [mx0, 3.4, mz0],
      [mx1, 3.4, mz0],
      [mx1, 3.4, mz1],
      [mx0, 3.4, mz1],
      [0, -1, 0],
      [0, 0, 5, 0, 5, 3, 0, 3],
      [0.35, 0.35, 0.33],
    );
    tileWall(mx1, mz0, mx0, mz0, 0, 3.4, 0, 1, true);
    tileWall(mx0, mz0, mx0, mz1, 0, 3.4, 1, 0, true);
    tileWall(mx1, mz1, mx1, mz0, 0, 3.4, -1, 0, true);
    CB(mx0, 0, mz0 - 0.4, mx1, 3.4, mz0);
    CB(mx0 - 0.4, 0, mz0, mx0, 3.4, mz1);
    CB(mx1, 0, mz0, mx1 + 0.4, 3.4, mz1);
    // doorway frame & sign
    M.box(b("metal_painted"), -62.3, 0, -8.3, -62, 2.4, -7.9, {
      s: 1,
      c: [0.3, 0.3, 0.28],
    });
    M.box(b("metal_painted"), -60, 0, -8.3, -59.7, 2.4, -7.9, {
      s: 1,
      c: [0.3, 0.3, 0.28],
    });
    M.box(b("metal_painted"), -62.3, 2.4, -8.3, -59.7, 2.7, -7.9, {
      s: 1,
      c: [0.3, 0.3, 0.28],
    });
    ssign("MAINTENANCE — KEEP OUT", -61, 3.3, -7.95, 0, 1, 2.6);
    // the tunnel wall quad covers the doorway: draw a dark doorway panel just in front of it? instead render the inner room visible through a gap:
    // (the long tunnel tile wall is split around the doorway)
    // contents: workbench, generator, lockers, shelves
    M.box(b("wood_planks"), -67.5, 0, -15.5, -63, 0.95, -14.5, {
      s: 1,
      c: [0.55, 0.45, 0.32],
    });
    CB(-67.5, 0, -15.5, -63, 0.95, -14.5, { surface: "wood" });
    M.box(b("metal_painted"), -58, 0, -15.6, -55, 1.6, -13.4, {
      s: 1,
      c: [0.55, 0.45, 0.25],
    });
    M.cyl(b("metal_painted"), -56.5, 1.6, -14.5, 0.3, 0.3, 1.2, 8, {
      c: [0.3, 0.3, 0.3],
    });
    CB(-58, 0, -15.6, -55, 1.6, -13.4);
    M.box(b("emissive_window@lamp"), -61.5, 3.3, -12.2, -60.5, 3.38, -11.8, {
      s: 1,
    });
    A.maintenance = [-61, 0, -12];
    A.maintenance_loot = [-66, 0, -13];

    // ---------------- the derailed train ----------------
    // car A: on the north track inside the station, doors open to the platform (enterable)
    subwayCar(-3.5, -2.6, Math.PI / 2, { open: true, openSide: -1, dy: -0.05 });
    // (car local +X side faces the platform: yaw π/2 maps local x→ world -z? handled by openSide)
    // car B: jackknifed off the rails, nose buried against the platform edge
    subwayCar(-26, -4.2, Math.PI / 2 + 0.12, {
      roll: 0.12,
      brokenDoors: true,
      dy: -0.1,
    });
    // car C: in the east tunnel, tipped on its side
    subwayCar(62, 11.2, Math.PI / 2 - 0.05, {
      roll: 1.35,
      dy: 1.2,
      brokenDoors: true,
    });
    // colliders for the cars (approximate footprints)
    // car A walls: sides at world z = -3.5 ± 1.5, x from -11.5..4.5 ; enterable via the door gaps on the platform side (z = -2)
    const carA = { x0: -11.5, x1: 4.5, z0: -4.1, z1: -1.1 };
    CB(carA.x0, 0, carA.z0 - 0.1, carA.x1, 4, carA.z0 + 0.1, {
      surface: "metal",
    }); // far side wall
    CB(carA.x0 - 0.1, 0, carA.z0, carA.x0 + 0.1, 4, carA.z1, {
      surface: "metal",
    }); // end walls
    CB(carA.x1 - 0.1, 0, carA.z0, carA.x1 + 0.1, 4, carA.z1, {
      surface: "metal",
    });
    CB(carA.x0, 0, carA.z0, carA.x1, PF, carA.z1, { surface: "metal" }); // floor at platform height
    CB(carA.x0, 3.8, carA.z0, carA.x1, 4.3, carA.z1, { surface: "metal" }); // roof
    // platform-side wall pieces between the three door openings (doors at local z -5,0,5 → world x -8.5, -3.5, 1.5)
    const dcs = [-3.5 - 5, -3.5, -3.5 + 5];
    let xa2 = carA.x0;
    for (const dx of dcs) {
      CB(xa2, PF, carA.z1 - 0.1, dx - 0.65, 4, carA.z1 + 0.1, {
        surface: "metal",
      });
      xa2 = dx + 0.65;
    }
    CB(xa2, PF, carA.z1 - 0.1, carA.x1, 4, carA.z1 + 0.1, { surface: "metal" });
    CB(-34.5, 0, -6.2, -17.5, 4, -2.1, { surface: "metal" });
    CB(53, 0, 9.5, 71, 3.4, 14.2, { surface: "metal" });
    A.train = [-3.5, PF, -3.5];
    A.train_b = [-26, 0, -6];
    // spawn points
    A.platform = [0, PF, 4];
    A.mezzanine = [-6, MZ, 8];
    A.booth = [-1, MZ, 0.5];
    A.spawn1 = [-20, PF, 5];
    A.spawn2 = [15, PF, 3];
    A.spawn3 = [36, PF, 6];
    A.spawn4 = [-40, 0, 11.5];
    A.spawn5 = [55, 0, -3.5];
    A.spawn6 = [-70, 0, 11.5];
    A.arrival = [0, MZ, -7];
    A.loot = A.maintenance_loot;
    A.core = [-3.5, PF, -2.6];
    A.car = [-3.5, PF, -2.6];
  }

