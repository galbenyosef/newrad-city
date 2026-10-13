/* src/landmarks_a/60_nypl_bryant_interior.js */
/* =====================================================================
 * NEW RAD CITY — landmarks_a / 60_nypl_bryant_interior.js
 * NEW YORK PUBLIC LIBRARY — INTERIOR (interior stream): the walk-in
 * ASTOR HALL behind the central portal (Maniac dungeon): hall floor
 * (incl. the portal passage), marble wall linings, coffered ceiling,
 * side arches, twin stairs blocked by rubble, collapsed-ceiling light
 * shaft, card catalogues, book drifts, skeletons, lamps, and the hall
 * anchors (hall, spawn1..2, terminal, books, loot1). The shell, hollow
 * colliders, portico and terrace are exterior (60_nypl_bryant.js).
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G,
    THREE = window.THREE;
  if (!G || !THREE || !G.LMA) return;
  const K = G.LMA.kit;

  K.defineInterior("nypl:paints", function () {
    K.paint("nypl_ceiling", 512, 512, (x, W, H) => {
      x.fillStyle = "#d8d0bc";
      x.fillRect(0, 0, W, H);
      x.strokeStyle = "#a89c80";
      x.lineWidth = 10;
      for (let i = 0; i <= 4; i++) {
        x.beginPath();
        x.moveTo((i * W) / 4, 0);
        x.lineTo((i * W) / 4, H);
        x.stroke();
        x.beginPath();
        x.moveTo(0, (i * H) / 4);
        x.lineTo(W, (i * H) / 4);
        x.stroke();
      }
      for (let i = 0; i < 4; i++)
        for (let j = 0; j < 4; j++) {
          x.fillStyle = "rgba(160,140,100,0.5)";
          x.beginPath();
          x.arc((i * W) / 4 + W / 8, (j * H) / 4 + H / 8, 18, 0, 7);
          x.fill();
        }
      K.stains(x, W, H, 14, 33, 0.5, "60,50,30");
    });
    K.paint("card_catalog", 256, 256, (x, W, H) => {
      x.fillStyle = "#6a4a2a";
      x.fillRect(0, 0, W, H);
      for (let i = 0; i < 6; i++)
        for (let j = 0; j < 8; j++) {
          x.fillStyle = "#7e5a36";
          x.fillRect(4 + i * 42, 4 + j * 31, 38, 27);
          x.fillStyle = "#c8b070";
          x.fillRect(18 + i * 42, 14 + j * 31, 10, 5);
          x.fillStyle = "#e8e0c8";
          x.fillRect(10 + i * 42, 8 + j * 31, 26, 4);
        }
      K.stains(x, W, H, 5, 34, 0.4);
    });
  });

  K.defineInterior("nypl", function (ctx) {
    const { rec, b, d, glows, P, B, TERR, HALL } = ctx;
    // ---- Astor Hall (walk-in) ----
    b.boxMM(
      "marble",
      HALL.x0,
      0,
      HALL.z0,
      HALL.x1 + 0.8,
      TERR + 0.02,
      HALL.z1,
      { faces: "t", tint: 0xc8c0ac },
    );
    K.colBox(HALL.x0, 0, HALL.z0, B.x1 + 0.8, TERR, HALL.z1, {
      surface: "concrete",
    });
    for (const w of [
      [HALL.x0, HALL.z0, HALL.x1, HALL.z0 + 0.02, "s"],
      [HALL.x0, HALL.z1 - 0.02, HALL.x1, HALL.z1, "n"],
      [HALL.x0, HALL.z0, HALL.x0 + 0.02, HALL.z1, "e"],
    ])
      b.boxMM("marble", w[0], TERR, w[1], w[2], HALL.h, w[3], {
        faces: w[4],
        tint: 0xe8e2d4,
        grime: 0.55,
      });
    b.quad(
      "atlas_paint",
      [HALL.x0, HALL.h, HALL.z0],
      [HALL.x1, HALL.h, HALL.z0],
      [HALL.x1, HALL.h, HALL.z1],
      [HALL.x0, HALL.h, HALL.z1],
      { rect: K.paint("nypl_ceiling", 512, 512) },
    );
    // arches along the side walls
    for (let x = HALL.x0 + 2; x < HALL.x1 - 1; x += 3.2)
      for (const z of [HALL.z0 + 0.3, HALL.z1 - 0.3]) {
        b.box("marble", x, TERR, z, 0.8, HALL.h - TERR - 1, 0.6, {
          tint: 0xe0dace,
        });
        for (let k = 0; k < 6; k++) {
          const a0 = (Math.PI * k) / 6,
            a1 = (Math.PI * (k + 1)) / 6;
          b.beam(
            "marble",
            x + 1.6 - Math.cos(a0) * 1.6,
            HALL.h - 3.6 + Math.sin(a0) * 1.4,
            z,
            x + 1.6 - Math.cos(a1) * 1.6,
            HALL.h - 3.6 + Math.sin(a1) * 1.4,
            z,
            0.35,
            { d: 0.5, tint: 0xe0dace },
          );
        }
      }
    // twin stairs up (blocked by rubble) at the back
    for (const sz of [HALL.z0 + 1.6, HALL.z1 - 1.6])
      b.stairs("marble", HALL.x0 + 5, sz, -1, 0, 2.2, 3.6, TERR, TERR + 3, 6, {
        solid: true,
        tint: 0xd8d0c0,
      });
    P.rubblePile(d, HALL.x0 + 1.8, (HALL.z0 + HALL.z1) / 2, 2.4, 2.4, {
      seed: 83,
      collide: true,
      n: 16,
    });
    // collapsed ceiling hole + light shaft
    K.shaft &&
      K.shaft(
        d,
        [HALL.x0 + 3, HALL.h, -162.5],
        [0.1, -1, 0],
        9,
        1.2,
        1.8,
        0xfff0d0,
      );
    // card catalogues, book drifts, desks
    const cc = K.paint("card_catalog", 256, 256);
    for (const c of [
      [93, -165.6, 0],
      [96, -165.6, 0],
      [94.5, -159.4, Math.PI],
    ]) {
      d.box("wood_dark", c[0], TERR, c[1], 2.4, 1.3, 0.8, { grime: 0.5 });
      d.panel(
        "atlas_paint",
        c[0],
        TERR + 0.65,
        c[1] + (c[2] ? -0.41 : 0.41),
        2.3,
        1.2,
        c[2] ? Math.PI : 0,
        { rect: cc },
      );
      K.colBox(
        c[0] - 1.2,
        TERR,
        c[1] - 0.4,
        c[0] + 1.2,
        TERR + 1.3,
        c[1] + 0.4,
        { surface: "wood" },
      );
    }
    d.geo("wood_dark", K.T.box, {
      x: 97.5,
      y: TERR + 0.35,
      z: -160.5,
      ry: 0.4,
      rz: Math.PI / 2 - 0.1,
      sx: 1.3,
      sy: 2.4,
      sz: 0.8,
    });
    for (let k = 0; k < 40; k++) {
      const r = K.rng(840 + k);
      const bx = HALL.x0 + 2 + r() * 9,
        bz = HALL.z0 + 0.8 + r() * 6.4;
      d.box(
        ["paint_red", "paint_green", "paint_blue", "wood", "fabric"][k % 5],
        bx,
        TERR + 0.02 + (k % 4) * 0.06,
        bz,
        0.22,
        0.05,
        0.3,
        { yaw: r() * 3, tint: 0xb0a080, grime: 0.6 },
      );
    }
    P.table(d, 91.5, TERR, -162.5, 0.2, { w: 2, d: 1 });
    P.chair(d, 92.2, TERR, -161.3, 2.5, { fallen: true });
    for (const s of [
      [95, -163],
      [98.5, -160.2],
    ])
      P.skeleton(d, s[0], TERR + 0.03, s[1], s[0]);
    for (const lz of [HALL.z0 + 0.35, HALL.z1 - 0.35]) {
      d.panel(
        "lit_warm",
        97,
        TERR + 5,
        lz,
        0.4,
        0.6,
        lz < -162.5 ? 0 : Math.PI,
      );
      glows.add(97, TERR + 5, lz + (lz < -162.5 ? 0.3 : -0.3), 0xffc070, "m");
    }
    // hall anchors
    rec.anchor("hall", 95, TERR, -162.5, -Math.PI / 2);
    rec.anchor("spawn1", 94, TERR, -164.5, Math.PI / 2);
    rec.anchor("spawn2", 96, TERR, -160, Math.PI / 2);
    rec.anchor("terminal", 91.5, TERR + 0.75, -162.5, Math.PI / 2);
    rec.anchor("books", 92, TERR, -164, Math.PI / 2);
    rec.anchor("loot1", 90.5, TERR, -159.4, 0);
  });
})();
