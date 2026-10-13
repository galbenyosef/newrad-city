/* src/landmarks_a/60_nypl_bryant.js */
/* =====================================================================
 * NEW RAD CITY — landmarks_a / 60_nypl_bryant.js
 * NEW YORK PUBLIC LIBRARY — Beaux-Arts marble block facing Fifth Avenue:
 * grand steps to a raised terrace, the two reclining lions on their
 * pedestals, a portico of paired Corinthian columns with statues on the
 * entablature and the carved inscription, flagpoles, tall stack windows
 * on the side. The walk-in ASTOR HALL (Maniac dungeon: card
 * catalogues, book drifts, collapsed ceiling) is interior:
 * 60_nypl_bryant_interior.js.
 * BRYANT PARK — dead lawn, gravel walks, rows of dead plane trees, stone
 * balustrades, the Lowell fountain, a ruined carousel, bistro chairs and
 * burrow-rat holes.
 * Footprints: nypl x 50..110, z -179..-146 · bryant_park x 50..110, z -224..-191
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G,
    THREE = window.THREE;
  if (!G || !THREE || !G.LMA) return;
  const K = G.LMA.kit;

  const B = { x0: 58, x1: 101, z0: -176, z1: -149, h: 17 };
  const TERR = 3; // terrace / hall floor level
  const HALL = { x0: 89, x1: 101, z0: -166.5, z1: -158.5, h: 12.5 };
  const PORT = { x0: 101, x1: 104.5, z0: -169.5, z1: -155.5 };

  function textures() {
    K.facade("fac_nypl", {
      bays: 4,
      floors: 3,
      bayW: 3.6,
      floorH: 5.6,
      wall: "#e2ddd0",
      glass: "#2a302e",
      frame: "#6a6458",
      win: { x0: 0.26, x1: 0.74, y0: 0.14, y1: 0.86 },
      broken: 0.35,
      boarded: 0.15,
      mullions: 1,
      sill: "#cfc8b8",
      lintel: true,
      seed: 1911,
      deco: (x, W, H, fy, y0, fh, bw) => {
        for (let i = 0; i < 4; i++) {
          x.fillStyle = "rgba(120,110,95,0.35)";
          x.beginPath();
          x.arc(i * bw + bw / 2, y0 + fh * 0.14, bw * 0.24, Math.PI, 0);
          x.fill();
        }
      },
    });
    K.facade("fac_nypl_stacks", {
      bays: 8,
      floors: 4,
      bayW: 1.6,
      floorH: 4.2,
      wall: "#ddd7c8",
      glass: "#252b2a",
      frame: "#5a564c",
      win: { x0: 0.32, x1: 0.68, y0: 0.05, y1: 0.95 },
      broken: 0.3,
      boarded: 0.1,
      mullions: 0,
      seed: 1912,
    });
    K.paint("nypl_inscr", 1024, 96, (x, W, H) => {
      x.fillStyle = "#d8d2c2";
      x.fillRect(0, 0, W, H);
      x.fillStyle = "#5a5448";
      x.font = 'bold 46px Georgia, "Times New Roman", serif';
      x.textAlign = "center";
      x.textBaseline = "middle";
      try {
        x.letterSpacing = "3px";
      } catch (e) {
        /* */
      }
      x.fillText("THE NEW YORK PUBLIC LIBRARY", W / 2, H / 2 + 3);
      try {
        x.letterSpacing = "0px";
      } catch (e) {
        /* */
      }
      K.stains(x, W, H, 6, 31, 0.3);
      K.streaks(x, W, H, 16, 32, 0.3);
    });
    K.interior("nypl:paints"); // Astor Hall ceiling + card catalogues — 60_nypl_bryant_interior.js
    K.paint("bp_sign", 512, 128, (x, W, H) =>
      K.signText(x, W, H, "BRYANT PARK", {
        bg: "#2a3a2a",
        fg: "#e8e0c0",
        size: 70,
        border: "#8a8a60",
        font: "Georgia, serif",
      }),
    );
    K.paint("carousel_top", 256, 256, (x, W, H) => {
      for (let i = 0; i < 16; i++) {
        x.fillStyle = i % 2 ? "#c8403a" : "#e8dcc0";
        x.beginPath();
        x.moveTo(W / 2, H / 2);
        x.arc(W / 2, H / 2, W / 2, (i * Math.PI) / 8, ((i + 1) * Math.PI) / 8);
        x.fill();
      }
      K.stains(x, W, H, 10, 35, 0.5);
    });
  }

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

  function bryant(rec) {
    const b = K.builder("bryant", { grime: 0.5 });
    const d = K.builder("bryant_detail", { grime: 0.5 });
    const glows = K.glowSet("bryant");
    const P = K.parts;
    const X0 = 50,
      X1 = 110,
      Z0 = -223,
      Z1 = -192;
    // ground: gravel walks, dead lawn
    b.boxMM("dirt", X0, -0.2, Z0, X1, 0.04, Z1, {
      faces: "t",
      tint: 0xb0a080,
      grime: 0.4,
    });
    b.boxMM("grass", 64, -0.2, -217.5, 100, 0.09, -197.5, {
      faces: "nsewt",
      grime: 0.5,
    });
    // raised stone border around the lawn
    for (const e of [
      [64, -217.5, 100, -217.5],
      [64, -197.5, 100, -197.5],
      [64, -217.5, 64, -197.5],
      [100, -217.5, 100, -197.5],
    ])
      b.beam("granite", e[0], 0.15, e[1], e[2], 0.15, e[3], 0.35, {
        d: 0.35,
        tint: 0x9a968c,
      });
    // balustrades (with gaps) along the long sides
    const balus = (x0, x1, z) => {
      b.boxMM("granite", x0, 0, z - 0.25, x1, 0.25, z + 0.25, {
        tint: 0xb0aca0,
      });
      b.boxMM("granite", x0, 0.75, z - 0.25, x1, 0.9, z + 0.25, {
        tint: 0xb0aca0,
      });
      for (let x = x0 + 0.25; x < x1; x += 0.5)
        b.cyl("granite", x, 0.25, z, 0.08, 0.1, 0.5, 6, { tint: 0xb0aca0 });
      K.colBox(x0, 0, z - 0.25, x1, 0.9, z + 0.25, { tag: "cover" });
    };
    balus(55, 78, -221);
    balus(86, 107, -221);
    balus(55, 78, -194);
    balus(86, 107, -194);
    // iron fence on the west end
    for (let z = Z0 + 1; z < Z1 - 1; z += 0.3) {
      if (Math.abs(z + 207.5) < 2.5) continue;
      d.beam("black_metal", X0 + 0.6, 0, z, X0 + 0.6, 1.3, z, 0.03);
    }
    d.beam("black_metal", X0 + 0.6, 1.2, Z0 + 1, X0 + 0.6, 1.2, Z1 - 1, 0.04);
    K.colBox(X0 + 0.4, 0, Z0 + 1, X0 + 0.8, 1.3, -210);
    K.colBox(X0 + 0.4, 0, -205, X0 + 0.8, 1.3, Z1 - 1);
    // dead plane trees in rows
    for (let x = 55; x <= 106; x += 5.2)
      for (const z of [-219.5, -195.5]) {
        if (x < 62 && z < -210) continue;
        P.deadTree(d, x, z, 9 + ((x * 7) % 3), {
          seed: Math.round(x * 13 + z),
          depth: 2,
        });
      }
    // Lowell fountain (west end)
    const fx = 57,
      fz = -207.5;
    b.cyl("granite", fx, 0, fz, 3.4, 3.4, 0.7, 20, {
      top: false,
      tint: 0x9a968c,
    });
    b.cyl("granite", fx, 0, fz, 3.1, 3.1, 0.3, 20, { tint: 0x4a4a40 });
    b.cyl("granite", fx, 0.3, fz, 0.6, 0.45, 1.6, 10, { tint: 0x9a968c });
    b.cyl("bronze", fx, 1.9, fz, 0.4, 1.6, 0.5, 14, { grime: 0.4 });
    b.cyl("bronze", fx, 2.4, fz, 0.2, 0.2, 0.7, 8, {});
    b.geo("bronze", K.T.sphereLo, { x: fx, y: 3.2, z: fz, s: 0.3 });
    for (let k = 0; k < 10; k++) {
      const a = (k * Math.PI) / 5,
        a2 = a + Math.PI / 5;
      K.colWall(
        fx + Math.cos(a) * 3.3,
        fz + Math.sin(a) * 3.3,
        fx + Math.cos(a2) * 3.3,
        fz + Math.sin(a2) * 3.3,
        0.35,
        0,
        0.7,
        [],
      );
    }
    // ruined carousel (south-west corner)
    const cx = 57,
      cz = -217.5;
    b.cyl("wood_rotten", cx, 0, cz, 3.8, 3.8, 0.45, 16, {});
    b.cyl("metal", cx, 0.45, cz, 0.35, 0.35, 3.6, 8, {});
    b.cyl("atlas_paint", cx, 4.0, cz, 4.2, 0.3, 1.3, 16, {
      tint: 0xffffff,
      grime: 0.2,
    });
    b.geo("atlas_paint", new THREE.ConeGeometry(4.2, 1.3, 16, 1), {
      x: cx,
      y: 4.65,
      z: cz,
      uv: "rect",
      rect: K.paint("carousel_top", 256, 256),
    });
    for (let k = 0; k < 8; k++) {
      const a = (k * Math.PI) / 4,
        px = cx + Math.cos(a) * 3,
        pz = cz + Math.sin(a) * 3;
      d.beam("brass", px, 0.45, pz, px, 4.0, pz, 0.06);
      const hy = 1.1 + (k % 2) * 0.35;
      d.geo("paint_white", K.T.sphere, {
        x: px,
        y: hy,
        z: pz,
        ry: -a,
        sx: 0.22,
        sy: 0.25,
        sz: 0.55,
        tint: [0xe8dcc0, 0x8a5a3a, 0xc8c8c8][k % 3],
      });
      d.beam(
        "paint_white",
        px + Math.sin(-a) * 0,
        hy + 0.1,
        pz,
        px - Math.sin(a) * 0.45,
        hy + 0.55,
        pz + Math.cos(a) * 0.45,
        0.14,
        { tint: 0xe8dcc0 },
      );
      if (k % 3 === 0)
        d.geo("paint_white", K.T.sphere, {
          x: px,
          y: 0.6,
          z: pz + 0.4,
          ry: 1,
          rz: 1.4,
          sx: 0.22,
          sy: 0.25,
          sz: 0.55,
          tint: 0x8a5a3a,
        });
    }
    K.colBox(cx - 3.8, 0, cz - 3.8, cx + 3.8, 0.45, cz + 3.8, {
      surface: "wood",
    });
    K.colBox(cx - 0.4, 0, cz - 0.4, cx + 0.4, 4, cz + 0.4);
    // bistro chairs + tables scattered, kiosk, lamp posts, sign
    for (let k = 0; k < 22; k++) {
      const r = K.rng(700 + k);
      const x = 60 + r() * 45,
        z = r() < 0.5 ? -220 + r() * 2.5 : -196.5 + r() * 2.5;
      P.chair(d, x, 0, z, r() * 6, { mat: "paint_green", fallen: r() < 0.4 });
    }
    for (const t of [
      [68, -219.8],
      [92, -195.3],
      [98, -219.6],
    ])
      P.table(d, t[0], 0, t[1], 0.3, { mat: "paint_green", w: 0.7, d: 0.7 });
    b.box("corrugated", 104, 0, -207.5, 3.2, 2.6, 2.4, { grime: 0.7 });
    b.geo("paint_green", K.T.box, {
      x: 104,
      y: 2.8,
      z: -207.5,
      rx: 0.1,
      sx: 3.8,
      sy: 0.08,
      sz: 3.0,
    });
    K.colBox(102.4, 0, -208.7, 105.6, 2.6, -206.3);
    for (const lp of [
      [62, -221],
      [82, -221],
      [102, -221],
      [62, -194],
      [82, -194],
      [102, -194],
    ])
      P.lampPost(d, glows, lp[0], lp[1], 4.2, { broken: lp[0] === 82 });
    P.signBoard(
      d,
      "atlas_paint",
      K.paint("bp_sign", 512, 128),
      108.5,
      1.4,
      -207.5,
      3,
      0.75,
      Math.PI / 2,
      {},
    );
    d.beam("black_metal", 108.5, 0, -209, 108.5, 1.8, -209, 0.06);
    d.beam("black_metal", 108.5, 0, -206, 108.5, 1.8, -206, 0.06);
    // burrow-rat holes on the lawn
    const burrows = [
      [72, -212],
      [85, -203],
      [95, -214],
    ];
    for (const bw of burrows) {
      d.geo("dirt", K.T.sphere, {
        x: bw[0],
        y: -0.2,
        z: bw[1],
        sx: 1.6,
        sy: 0.7,
        sz: 1.3,
        grime: 0.3,
      });
      d.cyl("rubber", bw[0] + 0.3, 0.35, bw[1], 0.5, 0.5, 0.02, 10, {
        tint: 0x050505,
      });
      for (let k = 0; k < 5; k++) {
        const a = k * 1.3;
        d.geo("dirt", K.T.dodeca, {
          x: bw[0] + Math.cos(a) * 1.8,
          y: 0.05,
          z: bw[1] + Math.sin(a) * 1.5,
          s: 0.25 + (k % 2) * 0.15,
        });
      }
    }
    P.skeleton(d, 80, 0.09, -209, 1.1);
    P.car(d, 45, -215, 0.05, { seed: 91 });

    rec.anchor("entrance", 108, 0, -207.5, -Math.PI / 2);
    rec.anchor("fountain", fx + 4, 0, fz, -Math.PI / 2);
    rec.anchor("carousel", cx + 5, 0, cz, -Math.PI / 2);
    burrows.forEach((bw, i) =>
      rec.anchor("burrow" + (i + 1), bw[0], 0, bw[1], 0),
    );
    rec.anchor("spawn1", 75, 0, -205, 0);
    rec.anchor("spawn2", 90, 0, -209, 0);
    rec.anchor("spawn3", 70, 0, -195.8, Math.PI);
    rec.anchor("spawn4", 96, 0, -219.8, 0);
    rec.anchor("loot1", 104, 0, -205.8, 0);

    b.finish(rec.root);
    d.finish(rec.root, { lod: 220 });
    glows.finish(rec.root, { dayOpacity: 0.3 });
  }

  K.defineSite("nypl", 60, function () {
    textures();
    nypl(K.record("nypl"));
    bryant(K.record("bryant_park"));
  });
})();
