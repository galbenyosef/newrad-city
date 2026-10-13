// play-inline-121 03 — terr
// Lines 110-518 of readable/play-inline-121.pretty.js (statement-aligned).
  function nypl(rec) {
    const b = K.builder("nypl_shell", { grime: 0.5 });
    const d = K.builder("nypl_detail", { grime: 0.55 });
    const glows = K.glowSet("nypl");
    const P = K.parts;
    b.burn(97, 14, -150, 6, 0.6)
      .burn(92, 12, -162, 5, 0.6)
      .burn(104, 3, -171, 4, 0.4);

    // ---- main block (hollow hall behind the central portal) ----
    b.boxMM("fac_nypl", B.x0, 0, B.z0, B.x1, B.h, B.z1, { faces: "nwt" });
    b.boxMM("fac_nypl_stacks", B.x0, 0, B.z1 - 0.01, B.x1, B.h, B.z1, {
      faces: "s",
    });
    // east face in parts (around the portal pavilion)
    b.boxMM("fac_nypl", B.x1 - 0.01, 0, B.z0, B.x1, B.h, PORT.z0, {
      faces: "e",
    });
    b.boxMM("fac_nypl", B.x1 - 0.01, 0, PORT.z1, B.x1, B.h, B.z1, {
      faces: "e",
    });
    // colliders around the hall hollow
    K.colBox(B.x0, 0, B.z0, HALL.x0, B.h, B.z1);
    K.colBox(HALL.x0, 0, B.z0, B.x1, B.h, HALL.z0);
    K.colBox(HALL.x0, 0, HALL.z1, B.x1, B.h, B.z1);
    K.colBox(HALL.x0, HALL.h, HALL.z0, B.x1, B.h, HALL.z1);
    // rusticated ground course + cornice + attic balustrade
    b.boxMM("marble", B.x0 - 0.2, 0, B.z0 - 0.2, B.x1 + 0.2, 3.2, B.z1 + 0.2, {
      faces: "nsw",
      tint: 0xcfc8b8,
      grime: 0.7,
    });
    b.boxMM(
      "marble",
      B.x0 - 0.5,
      B.h,
      B.z0 - 0.5,
      B.x1 + 0.5,
      B.h + 0.8,
      B.z1 + 0.5,
      { faces: "nsewtb", tint: 0xd8d2c4, grime: 0.6 },
    );
    for (const side of [
      [B.x0, B.z0, B.x1, B.z0],
      [B.x0, B.z1, B.x1, B.z1],
      [B.x0, B.z0, B.x0, B.z1],
      [B.x1, B.z0, B.x1, B.z1],
    ]) {
      const L = Math.hypot(side[2] - side[0], side[3] - side[1]),
        dx = (side[2] - side[0]) / L,
        dz = (side[3] - side[1]) / L;
      b.beam(
        "marble",
        side[0],
        B.h + 1.9,
        side[1],
        side[2],
        B.h + 1.9,
        side[3],
        0.35,
        { d: 0.5, tint: 0xd8d2c4 },
      );
      for (let t = 0.4; t < L; t += 0.7)
        b.cyl(
          "marble",
          side[0] + dx * t,
          B.h + 0.8,
          side[1] + dz * t,
          0.12,
          0.16,
          1.0,
          6,
          { tint: 0xd8d2c4, grime: 0.4 },
        );
    }
    b.boxMM(
      "slate",
      B.x0 + 1,
      B.h + 0.8,
      B.z0 + 1,
      B.x1 - 1,
      B.h + 1.4,
      B.z1 - 1,
      { faces: "t" },
    );
    // side stair-towers / end pavilions
    for (const z of [B.z0, B.z1 - 5])
      b.boxMM("fac_nypl", B.x1 - 6, 0, z, B.x1 + 1, B.h + 2.5, z + 5, {
        faces: "nsewt",
      });
    K.colBox(B.x1 - 6, 0, B.z0, B.x1 + 1, B.h + 2.5, B.z0 + 5);
    K.colBox(B.x1 - 6, 0, B.z1 - 5, B.x1 + 1, B.h + 2.5, B.z1);

    // ---- terrace, steps, portico ----
    b.boxMM("marble", PORT.x0, 0, PORT.z0 - 5, PORT.x1, TERR, PORT.z1 + 5, {
      faces: "nset",
      tint: 0xd8d2c4,
    });
    K.colBox(PORT.x0, 0, PORT.z0 - 5, PORT.x1, TERR, PORT.z1 + 5, {
      surface: "concrete",
    });
    b.stairs(
      "marble",
      110.5,
      (PORT.z0 + PORT.z1) / 2,
      -1,
      0,
      14,
      6,
      0,
      TERR,
      6,
      { solid: true, tint: 0xd0cabc },
    );
    // front wall of the pavilion with 3 arched portals (centre open, sides boarded)
    const ops = [
      { at: 3, w: 3, h: 8, y: 0, arch: true },
      { at: 7, w: 3.4, h: 8.6, y: 0, arch: true },
      { at: 11, w: 3, h: 8, y: 0, arch: true },
    ];
    b.wall(
      "marble",
      B.x1 + 0.4,
      PORT.z0,
      B.x1 + 0.4,
      PORT.z1,
      TERR,
      B.h,
      0.8,
      ops,
      { tint: 0xe2ddd0, collide: false },
    );
    K.colBox(B.x1, TERR, PORT.z0, B.x1 + 0.8, B.h, -164.2);
    K.colBox(B.x1, TERR, -160.8, B.x1 + 0.8, B.h, PORT.z1);
    K.colBox(B.x1, TERR + 8.2, -164.2, B.x1 + 0.8, B.h, -160.8);
    for (const zc of [PORT.z0 + 3, PORT.z1 - 3]) {
      d.panel("wood_rotten", B.x1 + 0.85, TERR + 3, zc, 3, 6, Math.PI / 2);
      d.panel(
        "glass_broken",
        B.x1 + 0.84,
        TERR + 6.8,
        zc,
        2.6,
        1.8,
        Math.PI / 2,
      );
    }
    // six Corinthian columns in pairs + entablature + statues + inscription
    for (const cz of [-168.6, -167.2, -163.4, -161.6, -157.8, -156.4]) {
      b.cyl("marble", 104, TERR, cz, 0.5, 0.45, 10, 12, {
        top: false,
        tint: 0xe8e2d4,
        grime: 0.4,
      });
      b.box("marble", 104, TERR, cz, 1.2, 0.5, 1.2, { tint: 0xd8d2c4 });
      b.box("marble", 104, TERR + 10, cz, 1.2, 0.9, 1.2, { tint: 0xd8d2c4 });
      K.colBox(103.5, TERR, cz - 0.5, 104.5, TERR + 10, cz + 0.5);
    }
    b.boxMM("marble", 101, TERR + 10.9, PORT.z0, 105, TERR + 13.4, PORT.z1, {
      faces: "nsetb",
      tint: 0xe2ddd0,
    });
    b.boxMM(
      "marble",
      100.5,
      TERR + 13.4,
      PORT.z0 - 0.4,
      105.4,
      TERR + 14,
      PORT.z1 + 0.4,
      { faces: "nsewtb", tint: 0xd8d2c4 },
    );
    b.panel(
      "atlas_paint",
      105.02,
      TERR + 12.1,
      (PORT.z0 + PORT.z1) / 2,
      13,
      1.2,
      Math.PI / 2,
      { rect: K.paint("nypl_inscr", 1024, 96) },
    );
    b.boxMM(
      "marble",
      B.x1 + 0.4,
      TERR + 14,
      PORT.z0 + 2,
      104.5,
      B.h + 2.2,
      PORT.z1 - 2,
      { faces: "nsetb", tint: 0xe2ddd0 },
    );
    for (const [i, cz] of [
      -168, -165.6, -163.3, -161.8, -159.4, -157,
    ].entries())
      P.figure(
        b,
        "marble",
        104.3,
        TERR + 14,
        cz,
        Math.PI / 2,
        1.1,
        i % 2 ? "robed" : "stand",
        { robe: true, grime: 0.6 },
      );
    // lions on pedestals flanking the steps (Patience & Fortitude)
    for (const lz of [-172, -153]) {
      b.boxMM("marble", 105, 0, lz - 1.1, 109.5, 2.2, lz + 1.1, {
        tint: 0xcfc8b8,
        grime: 0.6,
      });
      b.boxMM("marble", 104.8, 2.2, lz - 1.25, 109.7, 2.45, lz + 1.25, {
        tint: 0xd8d2c4,
      });
      P.lion(b, "marble", 107.1, 2.45, lz, Math.PI / 2, 1.45);
      K.colBox(105, 0, lz - 1.1, 109.5, 3.8, lz + 1.1);
    }
    // flagpoles + urns + lamp standards
    P.flagpole(d, 109, -175, 10, K.flag("usa", null), Math.PI, {
      w: 2.6,
      h: 1.4,
    });
    P.flagpole(d, 109, -150, 10, K.flag("usa", null), Math.PI, {
      w: 2.6,
      h: 1.4,
    });
    for (const lz of [-170, -155]) {
      d.cyl("bronze", 103.2, TERR, lz, 0.2, 0.25, 3.2, 8);
      d.geo("glass_broken", K.T.sphereLo, {
        x: 103.2,
        y: TERR + 3.5,
        z: lz,
        s: 0.35,
      });
    }
    // skeletons & debris on the steps
    P.skeleton(d, 107.5, 1.0, -160, 2.5);
    P.rubblePile(d, 106.5, -148.5, 2, 1.0, { seed: 81 });
    for (let k = 0; k < 14; k++) {
      const r = K.rng(820 + k);
      d.box(
        "paint_red",
        103 + r() * 6,
        TERR * (r() > 0.5 ? 1 : 0) + 0.02,
        -168 + r() * 11,
        0.25,
        0.06,
        0.18,
        { yaw: r() * 3, tint: [0x7a2a1a, 0x2a3a5a, 0x5a4a2a][k % 3] },
      );
    }

    // ---- Astor Hall (walk-in): 60_nypl_bryant_interior.js ----
    K.interior("nypl", { rec, b, d, glows, P, B, TERR, HALL });

    // ---- ruin detail around the back and sides: rear terrace balustrade on the 6th Ave lot line (a section toppled),
    //      the NW attic cornice fallen in blocks with a black hole in the parapet, ivy climbing the rustication, rubble ----
    {
      const r = K.rng(6061);
      const balus = (z0, z1) => {
        b.boxMM("marble", 50.4, 0, z0, 50.9, 0.25, z1, {
          tint: 0xc8c0ae,
          grime: 0.6,
        });
        b.boxMM("marble", 50.4, 0.78, z0, 50.9, 0.92, z1, {
          tint: 0xc8c0ae,
          grime: 0.6,
        });
        for (let z = z0 + 0.25; z < z1; z += 0.5)
          b.cyl("marble", 50.65, 0.25, z, 0.08, 0.1, 0.53, 6, {
            tint: 0xc8c0ae,
            grime: 0.5,
          });
        K.colBox(50.4, 0, z0, 50.9, 0.92, z1, { tag: "cover" });
      };
      balus(-176.5, -166.0);
      balus(-159.0, -149.5);
      for (let k = 0; k < 7; k++)
        b.geo("marble", K.T.cyl6, {
          x: 51.2 + r() * 1.6,
          y: 0.1,
          z: -164.8 + k * 0.8,
          rz: Math.PI / 2,
          ry: r() * 3,
          sx: 0.09,
          sy: 0.53,
          sz: 0.09,
          tint: 0xc8c0ae,
        });
      b.geo("marble", K.T.box, {
        x: 51.6,
        y: 0.15,
        z: -162.5,
        ry: 0.3,
        rz: 0.12,
        sx: 0.5,
        sy: 0.15,
        sz: 3.2,
        tint: 0xc8c0ae,
      });
      // the fallen NW cornice
      for (let k = 0; k < 6; k++)
        b.geo("marble", K.T.box, {
          x: 54.5 + r() * 3,
          y: 0.4,
          z: -174.5 + r() * 3.5,
          ry: r() * 3,
          rx: (r() - 0.5) * 0.5,
          rz: (r() - 0.5) * 0.4,
          sx: 0.9 + r() * 1.3,
          sy: 0.6 + r() * 0.3,
          sz: 0.7 + r() * 0.8,
          tint: 0xd8d2c4,
        });
      P.rubblePile(d, 55.6, -172.8, 2.2, 1.0, { seed: 861, collide: true });
      b.boxMM(
        "concrete_dark",
        B.x0 - 0.52,
        B.h - 0.2,
        -175.5,
        B.x0 - 0.5,
        B.h + 0.8,
        -170.5,
        { faces: "w", tint: 0x222222 },
      );
      b.boxMM(
        "concrete_dark",
        B.x0 - 0.2,
        B.h - 1.8,
        -176.02,
        B.x0 + 4.5,
        B.h + 0.8,
        -176.0,
        { faces: "n", tint: 0x222222 },
      );
      for (let k = 0; k < 4; k++)
        d.beam(
          "rust",
          B.x0 - 0.3,
          B.h - 1.2,
          -175 + k * 1.3,
          B.x0 - 1.2 - r(),
          B.h - 3 - r() * 2,
          -174.8 + k * 1.4,
          0.07,
        );
      // ivy up the west and north walls
      for (let k = 0; k < 34; k++) {
        const west = k < 20,
          t = r(),
          hgt = 2 + r() * 8.5,
          w = 0.4 + r() * 1.3;
        if (west)
          d.box(
            "paint_green",
            B.x0 - 0.24,
            0,
            B.z0 + 1 + t * (B.z1 - B.z0 - 2),
            0.06,
            hgt,
            w,
            { tint: [0x3a4a26, 0x4a5a2e, 0x2e3a20][k % 3], grime: 0.5 },
          );
        else
          d.box(
            "paint_green",
            B.x0 + 1 + t * (B.x1 - B.x0 - 12),
            0,
            B.z0 - 0.24,
            w,
            hgt,
            0.06,
            { tint: [0x3a4a26, 0x4a5a2e, 0x2e3a20][k % 3], grime: 0.5 },
          );
      }
      for (let k = 0; k < 12; k++) {
        const x = 51.5 + r() * 5.5,
          z = -176 + r() * 26;
        d.geo("paint_green", K.T.cone8, {
          x,
          y: 0,
          z,
          sx: 0.3 + r() * 0.4,
          sy: 0.4 + r() * 0.6,
          sz: 0.3 + r() * 0.4,
          tint: 0x6a7a3a,
          grime: 0.3,
        });
      }
      P.deadTree(d, 53.8, -155.5, 7, { seed: 862 });
      P.deadTree(d, 54.2, -168.8, 6, { seed: 863 });
      P.car(d, 54.0, -151.5, 1.45, { seed: 864, flipped: true });
    }

    // ---- anchors ----
    rec.anchor("entrance", 112, 0, -162.5, -Math.PI / 2);
    rec.anchor("steps", 106, 1.5, -162.5, -Math.PI / 2);
    rec.anchor("terrace", 103, TERR, -162.5, -Math.PI / 2);
    rec.anchor("lion_patience", 108, 0, -174, 0);
    rec.anchor("lion_fortitude", 108, 0, -151, Math.PI);
    rec.anchor("spawn3", 107, 0.5, -166, -Math.PI / 2);
    rec.anchor("spawn4", 102.5, TERR, -171, -Math.PI / 2);

    b.finish(rec.root);
    d.finish(rec.root, { lod: 240 });
    glows.finish(rec.root, { dayOpacity: 0.5 });
  }

