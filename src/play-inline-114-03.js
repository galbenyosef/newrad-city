// play-inline-114 03 — math
// Lines 213-845 of readable/play-inline-114.pretty.js (statement-aligned).
  function build(rec) {
    const b = K.builder("chrysler_shell", { grime: 0.45 });
    const d = K.builder("chrysler_detail", { grime: 0.55 });
    const glows = K.glowSet("chrysler");
    const beacons = K.glowSet("chrysler_beacon");
    const P = K.parts;
    b.burn(300, 110, -198, 6, 0.6)
      .burn(290.6, 3, -207.5, 5, 0.7)
      .burn(318, 60, -196, 5, 0.5);

    // ---- base with walk-in lobby (hollow x 293.4..317, z -214..-201, y 0..7) ----
    // podium flush with the block's property line on Lexington (x 290) and both side streets (z -223 / -192)
    const A = { x0: 290.4, x1: 323, z0: -222.7, z1: -192.3 };
    const L = { x0: 293.4, x1: 317, z0: -214, z1: -201, h: 7 };
    b.boxMM("fac_chrysler", A.x0, 0, A.z0, A.x1, 22, A.z1, { faces: "nset" });
    // west face in pieces around the portal (portal: z -209.5..-205.5, y 0..6.5)
    b.boxMM("fac_chrysler", A.x0, 0, A.z0, A.x0 + 0.01, 22, -209.5, {
      faces: "w",
    });
    b.boxMM("fac_chrysler", A.x0, 0, -205.5, A.x0 + 0.01, 22, A.z1, {
      faces: "w",
    });
    b.boxMM("fac_chrysler", A.x0, 6.5, -209.5, A.x0 + 0.01, 22, -205.5, {
      faces: "w",
    });
    // colliders around the lobby hollow
    K.colBox(A.x0, 0, A.z0, A.x1, 22, L.z0);
    K.colBox(A.x0, 0, L.z1, A.x1, 22, A.z1);
    K.colBox(L.x1, 0, L.z0, A.x1, 22, L.z1);
    K.colBox(A.x0, L.h, L.z0, L.x1, 22, L.z1);
    K.colBox(A.x0, 0, L.z0, L.x0, L.h, -209.5);
    K.colBox(A.x0, 0, -205.5, L.x0, L.h, L.z1);
    // portal passage (x 290.4..293.4)
    b.boxMM("granite", A.x0 - 0.02, 0, -209.6, L.x0, 6.5, -209.5, {
      faces: "n",
      tint: 0x222222,
    });
    b.boxMM("granite", A.x0 - 0.02, 0, -205.5, L.x0, 6.5, -205.4, {
      faces: "s",
      tint: 0x222222,
    });
    b.boxMM("granite", A.x0, 6.5, -209.5, L.x0, 6.6, -205.5, {
      faces: "b",
      tint: 0x222222,
    });
    // black granite stepped portal surround + sunburst transom
    for (let k = 0; k < 3; k++) {
      d.boxMM(
        "granite",
        A.x0 - 0.3 - k * 0.25,
        0,
        -210.2 - k * 0.6,
        A.x0,
        7.2 + k * 1.3,
        -209.5 - k * 0.6,
        { tint: 0x2a2a2a, grime: 0.3 },
      );
      d.boxMM(
        "granite",
        A.x0 - 0.3 - k * 0.25,
        0,
        -205.5 + k * 0.6,
        A.x0,
        7.2 + k * 1.3,
        -204.8 + k * 0.6,
        { tint: 0x2a2a2a, grime: 0.3 },
      );
      d.boxMM(
        "granite",
        A.x0 - 0.3 - k * 0.25,
        6.5 + k * 1.3,
        -210.2 - k * 0.6,
        A.x0,
        7.2 + k * 1.3,
        -204.8 + k * 0.6,
        { tint: 0x2a2a2a, grime: 0.3 },
      );
    }
    d.panel("atlas_paint", A.x0 - 0.35, 8.5, CZ, 4.6, 2.3, -Math.PI / 2, {
      rect: K.paint("chrysler_portal", 256, 256),
    });
    // tall triangular Lexington portal (the Chrysler's signature entrance): black granite frame rising to a point over
    // a chrome-mullioned glazed triangle, lit from inside by the raiders' fires
    {
      const TX = A.x0 - 0.05,
        ty0 = 9.6,
        tyA = 16.2,
        hw = 3.6;
      const tri = new THREE.Shape();
      tri.moveTo(-hw, 0);
      tri.lineTo(hw, 0);
      tri.lineTo(0, tyA - ty0);
      tri.lineTo(-hw, 0);
      const tg = new THREE.ShapeGeometry(tri);
      d.geo("lit_warm", tg, {
        x: TX - 0.02,
        y: ty0,
        z: CZ,
        ry: -Math.PI / 2,
        tint: 0x6a4424,
        grime: 0,
      });
      tg.dispose();
      for (const s2 of [-1, 1])
        d.beam(
          "granite",
          TX - 0.25,
          ty0 - 0.4,
          CZ + s2 * (hw + 0.5),
          TX - 0.25,
          tyA + 0.7,
          CZ,
          0.8,
          { tint: 0x262626, grime: 0.3 },
        );
      d.box("granite", TX - 0.25, ty0 - 0.45, CZ, 0.8, 0.5, 2 * hw + 1.4, {
        tint: 0x262626,
        grime: 0.3,
      });
      for (let k = -3; k <= 3; k++) {
        const zz = CZ + (k * hw) / 3.5,
          hh = (tyA - ty0) * (1 - Math.abs(k) / 3.5);
        if (hh > 0.3)
          d.beam("chrome", TX - 0.08, ty0, zz, TX - 0.08, ty0 + hh, zz, 0.07);
      }
      for (const f of [0.33, 0.66])
        d.beam(
          "chrome",
          TX - 0.08,
          ty0 + (tyA - ty0) * f,
          CZ - hw * (1 - f),
          TX - 0.08,
          ty0 + (tyA - ty0) * f,
          CZ + hw * (1 - f),
          0.07,
        );
      glows.add(TX - 1.0, ty0 + 2.0, CZ, 0xffa050, "l");
    }
    // ground-floor shopfronts: chrome frames, transom bars, sunburst fanlights (N, S and Lexington either side of the portal)
    const shop = (px, pz, face) => {
      const nx = Math.sin(face),
        nz = Math.cos(face),
        ux = Math.cos(face),
        uz = -Math.sin(face);
      b.panel(
        "glass_broken",
        px + nx * 0.02,
        2.1,
        pz + nz * 0.02,
        3,
        3.2,
        face,
      );
      for (const sx of [-1.55, 1.55])
        d.box(
          "chrome",
          px + ux * sx + nx * 0.05,
          0.4,
          pz + uz * sx + nz * 0.05,
          0.12,
          3.5,
          0.1,
          { yaw: face, grime: 0.3 },
        );
      d.box("chrome", px + nx * 0.05, 3.72, pz + nz * 0.05, 3.2, 0.14, 0.1, {
        yaw: face,
        grime: 0.3,
      });
      d.box("chrome", px + nx * 0.04, 2.9, pz + nz * 0.04, 3.1, 0.07, 0.08, {
        yaw: face,
        grime: 0.3,
      });
      d.panel(
        "atlas_paint",
        px + nx * 0.05,
        4.35,
        pz + nz * 0.05,
        2.4,
        1.1,
        face,
        { rect: K.paint("chrysler_portal", 256, 256) },
      );
    };
    {
      const LX = A.x1 - A.x0;
      for (let t = 2.5; t < LX - 2; t += 4.3) {
        shop(A.x0 + t, A.z1, 0);
        shop(A.x1 - t, A.z0, Math.PI);
      }
    }
    for (const z of [-219.6, -215.2, -199.8, -195.4])
      shop(A.x0, z, -Math.PI / 2);
    b.boxMM("granite", A.x0 - 0.1, 0, A.z0 - 0.1, A.x0 + 0.5, 0.8, -210.2, {
      faces: "wn",
      tint: 0x3a3a3a,
    });
    b.boxMM("granite", A.x0 - 0.1, 0, -204.8, A.x0 + 0.5, 0.8, A.z1 + 0.1, {
      faces: "ws",
      tint: 0x3a3a3a,
    });
    b.boxMM("steel", A.x0 - 0.2, 22, A.z0 - 0.2, A.x1 + 0.2, 22.5, A.z1 + 0.2, {
      faces: "nsewtb",
    });

    // ---- setbacks ----
    b.boxMM("fac_chrysler", 299.5, 22.5, -219, 320.5, 40, -196, {});
    K.colBox(299.5, 22.5, -219, 320.5, 40, -196);
    b.boxMM("steel", 299.3, 40, -219.2, 320.7, 40.4, -195.8, {
      faces: "nsewtb",
    });
    b.boxMM("fac_chrysler", 300.5, 40.4, -217.5, 319.5, 56, -197.5, {});
    K.colBox(300.5, 40.4, -217.5, 319.5, 56, -197.5);
    // hubcap frieze + winged radiator-cap ornaments (the 31st floor)
    b.boxMM("metal_dark", 300.3, 56, -217.7, 319.7, 57.6, -197.3, {
      faces: "nsewt",
      tint: 0x55585c,
    });
    for (let t = 1.2; t < 19; t += 2.1) {
      for (const f of [
        [300.5 + t, -197.25, 0],
        [300.5 + t, -217.75, Math.PI],
      ])
        d.geo("chrome", K.T.cyl12, {
          x: f[0],
          y: 56.8,
          z: f[1],
          rx: Math.PI / 2,
          sx: 0.55,
          sy: 0.12,
          sz: 0.55,
        });
      for (const f of [
        [319.75, -217.5 + t, Math.PI / 2],
        [300.25, -217.5 + t, -Math.PI / 2],
      ])
        d.geo("chrome", K.T.cyl12, {
          x: f[0],
          y: 56.8,
          z: f[1],
          rz: Math.PI / 2,
          sx: 0.55,
          sy: 0.12,
          sz: 0.55,
        });
    }
    for (const c of [
      [300.3, -217.7, (-3 * Math.PI) / 4],
      [319.7, -217.7, (3 * Math.PI) / 4],
      [319.7, -197.3, Math.PI / 4],
      [300.3, -197.3, -Math.PI / 4],
    ]) {
      const dx = Math.sin(c[2]),
        dz = Math.cos(c[2]);
      d.beam(
        "chrome",
        c[0],
        57.3,
        c[1],
        c[0] + dx * 2.2,
        58.2,
        c[1] + dz * 2.2,
        0.35,
        { d: 0.35 },
      );
      for (const sgn of [-1, 1])
        d.geo("chrome", K.T.box, {
          x: c[0] + dx * 1.2 - dz * sgn * 0.6,
          y: 58.3,
          z: c[1] + dz * 1.2 + dx * sgn * 0.6,
          ry: c[2] + sgn * 0.6,
          rx: -0.5,
          sx: 0.1,
          sy: 0.9,
          sz: 1.8,
        });
    }

    // ---- notched shaft ----
    const S0 = { x0: 302, x1: 318, z0: -215.5, z1: -199.5 };
    b.boxMM("fac_chrysler", S0.x0, 57.6, S0.z0 + 1.4, S0.x1, 110, S0.z1 - 1.4, {
      faces: "ewt",
    });
    b.boxMM("fac_chrysler", S0.x0 + 1.4, 57.6, S0.z0, S0.x1 - 1.4, 110, S0.z1, {
      faces: "nst",
    });
    K.colBox(S0.x0, 57.6, S0.z0, S0.x1, 110, S0.z1);
    // dark vertical window strips at the notches
    for (const c of [
      [S0.x0 + 0.7, S0.z0 + 0.7],
      [S0.x1 - 0.7, S0.z0 + 0.7],
      [S0.x1 - 0.7, S0.z1 - 0.7],
      [S0.x0 + 0.7, S0.z1 - 0.7],
    ])
      b.box("metal_dark", c[0], 57.6, c[1], 1.42, 52.4, 1.42, {
        faces: "nsew",
        tint: 0x4a4e52,
      });
    // grey-brick piers proud of the shaft faces (aligned with the façade texture's pier lines, every 2 bays)
    K.ALIASES.brick_pier = K.ALIASES.brick_pier || ["brick_tan", 0x9c9ea0];
    const fin = (x, z, alongX) =>
      b.box(
        "brick_pier",
        x,
        57.6,
        z,
        alongX ? 0.62 : 0.34,
        52.4,
        alongX ? 0.34 : 0.62,
        { grime: 0.35 },
      );
    for (const k of [1, 2]) {
      fin(303.4 + 5.2 * k, S0.z1 + 0.17, true);
      fin(316.6 - 5.2 * k, S0.z0 - 0.17, true);
      fin(S0.x1 + 0.17, S0.z1 - 1.4 - 5.2 * k, false);
      fin(S0.x0 - 0.17, S0.z0 + 1.4 + 5.2 * k, false);
    }
    // dark-grey brick corner quoins + horizontal bands crowning every setback block
    const blocks = [
      [A.x0, A.x1, A.z0, A.z1, 0.8, 22],
      [299.5, 320.5, -219, -196, 22.5, 40],
      [300.5, 319.5, -217.5, -197.5, 40.4, 56],
    ];
    for (const bk of blocks) {
      const [x0, x1, z0, z1, y0, y1] = bk;
      for (const cx of [x0, x1])
        for (const cz of [z0, z1])
          b.boxMM(
            "brick_grey",
            cx - 0.7,
            y0,
            cz - 0.7,
            cx + 0.7,
            y1 - 0.02,
            cz + 0.7,
            { faces: "nsew", grime: 0.4 },
          );
      b.boxMM(
        "brick_grey",
        x0 - 0.08,
        y1 - 2.2,
        z0 - 0.08,
        x1 + 0.08,
        y1 - 0.9,
        z1 + 0.08,
        { faces: "nsew", grime: 0.45 },
      );
      b.boxMM(
        "brick_white",
        x0 - 0.12,
        y1 - 0.9,
        z0 - 0.12,
        x1 + 0.12,
        y1 - 0.5,
        z1 + 0.12,
        { faces: "nsewb", grime: 0.4 },
      );
    }
    // gargoyle cornice + eagle heads projecting from the corners
    b.boxMM(
      "steel",
      S0.x0 - 0.4,
      110,
      S0.z0 - 0.4,
      S0.x1 + 0.4,
      111,
      S0.z1 + 0.4,
      { faces: "nsewtb" },
    );
    for (const c of [
      [S0.x0, S0.z0, (-3 * Math.PI) / 4],
      [S0.x1, S0.z0, (3 * Math.PI) / 4],
      [S0.x1, S0.z1, Math.PI / 4],
      [S0.x0, S0.z1, -Math.PI / 4],
    ]) {
      P.eagle(b, "chrome", c[0], 110.5, c[1], c[2], 2.2, { head: true });
    }

    // ---- terraced crown (6 tiers of arches) ----
    const tiers = [
      [8, 112.5, 10.5],
      [6.9, 116.5, 9.4],
      [5.8, 120.5, 8.2],
      [4.7, 124.5, 7.0],
      [3.6, 128.5, 5.6],
      [2.5, 132.5, 4.2],
    ];
    for (const tr of tiers) {
      const w = tr[0],
        ys = tr[1],
        ah = tr[2];
      for (let k = 0; k < 4; k++) {
        const face = (k * Math.PI) / 2;
        archFace(
          b,
          "chrysler_crown",
          CX + Math.sin(face) * w,
          CZ + Math.cos(face) * w,
          face,
          w,
          111,
          ys,
          ah,
        );
      }
    }
    K.colBox(CX - 8, 111, CZ - 8, CX + 8, 128, CZ + 8);
    // cap + spire
    b.geo("steel", K.T.cone4, {
      x: CX,
      y: 134.8,
      z: CZ,
      ry: Math.PI / 4,
      sx: 3.0,
      sy: 4.4,
      sz: 3.0,
    });
    b.cyl("steel", CX, 136.5, CZ, 1.3, 0.9, 4, 8, { grime: 0.1 });
    b.cyl("steel", CX, 140.5, CZ, 0.9, 0.4, 7, 8, { grime: 0.1 });
    for (let y = 141; y < 147; y += 1.5)
      b.cyl(
        "steel",
        CX,
        y,
        CZ,
        0.95 - (y - 140.5) * 0.08,
        0.95 - (y - 140.5) * 0.08,
        0.2,
        8,
        { grime: 0 },
      );
    b.cyl("chrome", CX, 147.5, CZ, 0.4, 0.02, 12.5, 8, { grime: 0 });
    beacons.add(CX, 160, CZ, 0xff3020, "l");
    // stainless rim ribs tracing every crown arch (reads from the street against the sky)
    for (const tr of tiers) {
      const w = tr[0],
        ys = tr[1],
        ah = tr[2];
      for (let k = 0; k < 4; k++) {
        const face = (k * Math.PI) / 2,
          fx = Math.sin(face),
          fz = Math.cos(face),
          ux = Math.cos(face),
          uz = -Math.sin(face);
        const px = CX + fx * (w + 0.12),
          pz = CZ + fz * (w + 0.12);
        let prev = null;
        for (let i = 0; i <= 10; i++) {
          const a = (Math.PI * i) / 10,
            lx = Math.cos(a) * w,
            ly = ys + Math.sin(a) * ah;
          const cur = [px + ux * lx, ly, pz + uz * lx];
          if (prev)
            b.beam(
              "chrome",
              prev[0],
              prev[1],
              prev[2],
              cur[0],
              cur[1],
              cur[2],
              0.22,
              { grime: 0.1 },
            );
          prev = cur;
        }
      }
    }

    // ---- raider sniper nest on the SW gargoyle corner ----
    const nx = S0.x0 - 1.8,
      nz = S0.z1 + 1.8,
      ny = 110.2;
    d.box("wood", nx, ny, nz, 4.2, 0.25, 4.2, { yaw: Math.PI / 4, grime: 0.6 });
    for (const o of [
      [-1.4, -1.4],
      [1.4, 1.4],
    ])
      d.beam(
        "rust",
        nx + o[0],
        ny,
        nz + o[1],
        S0.x0 + 0.3,
        ny - 3.5,
        S0.z1 - 0.3,
        0.12,
      );
    d.beam("rust", nx - 1.6, ny, nz + 0.6, S0.x0, ny - 2.5, S0.z1, 0.1);
    P.sandbags(d, nx - 2.2, nz - 0.2, nx - 0.2, nz + 2.0, 2, {
      y: ny + 0.25,
      collide: false,
      seed: 61,
    });
    P.sandbags(d, nx - 0.2, nz + 2.0, nx + 1.8, nz + 0.2, 2, {
      y: ny + 0.25,
      collide: false,
      seed: 62,
    });
    P.mattress(d, nx + 0.5, ny + 0.25, nz - 0.6, Math.PI / 4);
    P.crate(d, nx + 1.2, ny + 0.25, nz - 1.3, 0.6, 0.4);
    P.flagpole(
      d,
      nx + 1.6,
      nz - 1.6,
      4.5,
      K.flag("raider", null),
      Math.PI / 4,
      { y: ny, w: 2.2, h: 1.1, finialMat: "bone" },
    );
    K.colBox(nx - 2.1, ny - 0.3, nz - 2.1, nx + 2.1, ny + 0.25, nz + 2.1, {
      surface: "wood",
    });
    glows.add(nx - 0.5, ny + 1.0, nz + 0.8, 0xff9040, "m");
    // winch arm + rope for the service lift (door placed by quests at nest + (1.6, 1.1, -1.4))
    d.beam(
      "rust",
      nx + 1.6,
      ny + 0.25,
      nz - 1.4,
      nx + 1.6,
      ny + 2.6,
      nz - 1.4,
      0.1,
    );
    d.beam(
      "rust",
      nx + 1.6,
      ny + 2.6,
      nz - 1.4,
      nx + 2.9,
      ny + 2.8,
      nz - 2.7,
      0.08,
    );
    d.cable(
      "rust",
      nx + 2.9,
      ny + 2.8,
      nz - 2.7,
      nx + 2.9,
      ny - 6,
      nz - 2.7,
      0,
      0.025,
      2,
    );
    d.cyl("black_metal", nx + 1.6, ny + 0.25, nz - 1.4, 0.3, 0.3, 0.6, 8, {});

    // ---- lobby (raider den): 30_chrysler_interior.js ----
    K.interior("chrysler", { rec, b, d, glows, P, A, L, CZ });

    // ---- raider barricade at the Lexington portal (on the pavement only; the carriageway stays open) ----
    P.scrapWall(d, 288.5, -213.6, 288.5, -210.4, 2.6, { seed: 71 });
    P.scrapWall(d, 288.5, -204.6, 288.5, -201.4, 2.6, { seed: 72 });
    P.sandbags(d, 287.6, -213.2, 287.6, -210.8, 2, { seed: 74 });
    P.sandbags(d, 287.6, -204.2, 287.6, -201.8, 2, { seed: 75 });
    P.car(d, 281, -214, 0.2, { seed: 7 });
    P.car(d, 281.5, -200, -0.15, { seed: 8, flipped: false });
    for (const sp of [
      [288.2, -209.9],
      [288.2, -205.1],
      [289.2, -214.4],
      [289.2, -200.6],
    ])
      P.spike(d, sp[0], sp[1], 2.5, { gore: sp[1] > -206 });
    P.signBoard(
      d,
      "atlas_paint",
      K.paint("raider_keepout", 256, 128),
      288.0,
      2.0,
      -212.0,
      1.8,
      0.9,
      -Math.PI / 2,
      {},
    );
    P.barrel(d, 291.6, 0, -209.0, "fire", { glows, collide: true });
    P.barrel(d, 289.3, 0, -203.2, "rust", { collide: true });
    P.meatBag(d, 291.9, 6.4, -208.9, { len: 1.2 });
    P.meatBag(d, 291.9, 6.4, -206.0, { len: 1.5 });
    // scrap lean-to against the north corner + a lookout's crate stack
    P.crate(d, 289.0, 0, -219.0, 1.0, 0.3);
    P.crate(d, 289.1, 1.0, -219.1, 0.8, 0.9);
    // raider banners hanging from the first setback
    for (const bz of [-214, -201])
      d.face(
        "flags_static",
        A.x0 - 0.05,
        12,
        bz + 1.1,
        0,
        0,
        -1,
        0,
        1,
        0,
        2.2,
        8,
        { uv: "rect", rect: K.flag("raider", null), su: 1, sv: 1, grime: 0.3 },
      );
    P.rubblePile(d, 324.6, -190.6, 2.0, 1.0, { seed: 73 });

    // ---- anchors ----
    rec.anchor("entrance", 286.8, 0, CZ, Math.PI / 2);
    rec.anchor("portal", A.x0 + 1.6, 0, CZ, Math.PI / 2);
    rec.anchor("sniper", nx - 0.3, ny + 0.25, nz + 0.3, -Math.PI / 4);
    rec.anchor("rooftop", 310, 40.4, -197.5, 0);
    rec.anchor("spawn4", 289.2, 0, -199.2, Math.PI / 2);
    rec.anchor("loot2", nx + 1.2, ny + 0.25, nz - 1.3, 0);
    rec.anchor("crown", CX, 131, CZ, 0);

    b.finish(rec.root);
    d.finish(rec.root, { lod: 300 });
    glows.finish(rec.root, { dayOpacity: 0.4 });
    const bg = beacons.finish(rec.root, { dayOpacity: 0.5, beacon: true });
    const bmats = [];
    bg.traverse((o) => {
      if (o.material) bmats.push(o.material);
    });
    K.animate((dt, t, night) => {
      const on = t % 2.2 < 1.1;
      for (const m of bmats) m.opacity = on ? 0.45 + night * 0.55 : 0.05;
    });
    // crown glow: raider generator sputters on at night
    const cm = K.mat("chrysler_crown");
    K.animate((dt, t, night) => {
      const sputter = Math.sin(t * 0.37) > -0.85 ? 1 : 0.25;
      cm.emissiveIntensity =
        0.05 + night * 1.1 * sputter * (0.92 + 0.08 * Math.sin(t * 9));
    });
  }

