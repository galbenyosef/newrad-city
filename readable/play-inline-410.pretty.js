/* src/poi_fidi3/11_federal_interior.js */
/* =====================================================================
 * NEW RAD CITY — poi_fidi3 / 11_federal_interior.js
 * FEDERAL HALL — interior cell `federal_hall` (origin from LAYOUT.INTERIORS).
 *
 * Plan (local metres, player enters at (0,0,-1.5) looking north):
 *   Vestibule (x ±5, z 0..-7) — the Congress toll booth: "ENTRY TAX"
 *   ROTUNDA (centre 0,-19, r 12): 16 marble columns, gallery ring,
 *     coffered dome with the oculus letting a shaft of dusty daylight
 *     onto the compass-star medallion; the raiders' "chamber": benches of
 *     museum cases, the voting board, cook fire, cage, and at the north
 *     apse the Speaker's throne under THE CONGRESS banner.
 *   West wing — "Birth of the Republic" exhibit, smashed and looted.
 *   East wing — the ANNEX: raider barracks, pill bench, armoury, and the
 *     Sergeant-at-Arms' chair; stairs in the NE corner down to…
 *   SUB-TREASURY (y −4.5): the vault hall with its barred gold cages,
 *     the assay office where Lancer Halloran is dug in, and at the west
 *     end the round Mosler door of COG ARCHIVE 7 (Voss's key, or the
 *     combination in Archivist Ames's notebook).
 * Locks (G.locks): every key / code / passcode is placed in this POI —
 *   see the FH_LOCKS table below and NOTES.md.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE) return;
  const PV = G._pf3;
  const K = PV.kit;
  const PI = Math.PI,
    HP = PI / 2;
  const BY = -4.5; // Sub-Treasury floor
  const RC = { x: 0, z: -19, r: 12 };

  // ---- locks: keys, codes and passcodes (the unlock for each is placed in this file) ----
  const FH_LOCKS = {
    archive: K.regLock({
      id: "pf3_lk_fh_archive",
      label: "Continuity Archive 7 (Mosler door)",
      key: "pf3_fh_archive_key",
      code: "043089",
      kind: "door",
      hint: "Speaker Voss wears the key; Archivist Ames's notebook (vault hall, by her body) has the combination.",
    }),
    loading: K.regLock({
      id: "pf3_lk_fh_loading",
      label: "Sub-Treasury Loading Door",
      code: "1862",
      kind: "door",
      hint: "Acolyte Quintero's field log (vault hall) mentions the code.",
    }),
    strongbox: K.regLock({
      id: "pf3_lk_fh_speaker_box",
      label: "Speaker's Strongbox",
      code: "4419",
      kind: "safe",
      hint: "Item 8 of the Speaker's Order of Business, on the table by the throne.",
    }),
    locker: K.regLock({
      id: "pf3_lk_fh_guard_locker",
      label: "Sub-Treasury Locker",
      code: "7140",
      kind: "container",
      hint: "Stencilled on the gold cage beside the locker.",
    }),
    safe: K.regLock({
      id: "pf3_lk_fh_archivist_safe",
      label: "Custodian's Safe",
      code: "0612",
      kind: "safe",
      hint: "Custodian Pryce's log on the Archive 7 teletype.",
    }),
    term: K.regLock({
      id: "pf3_lk_fh_cog_term",
      label: "Continuity Archive 7 Teletype",
      passcode: "PALISADE",
      kind: "terminal",
      hint: "Custodian Pryce's desk blotter, on the floor by his chair.",
    }),
  };
  PV.FH_LOCKS = FH_LOCKS;
  K.keyFrom(
    "pf3_fh_archive_key",
    "Speaker Voss (yields it to a Persuasion point of order, or from his body)",
  );

  PV.fhInterior = function (ctx) {
    const O = ctx.O;
    const b = K.builder({
      name: "fh_int",
      off: O,
      lit: true,
      amb: [0.075, 0.07, 0.065],
      floors: [0, BY],
      grime: 0.55,
    });
    const r = K.rng("fh_int");
    const stone = [0.82, 0.79, 0.72],
      fire = [1, 0.55, 0.24],
      day = [0.78, 0.82, 0.7],
      bulb = [1, 0.78, 0.5];
    const ROT_BOX = [-12.6, -1, -34.8, 12.6, 20, -6.6];
    const BASE_BOX = [-26.5, BY - 0.2, -48.5, 27.5, -0.2, -27.5];

    // ------------------------------------------------ gaps (before any room)
    K.gap(ctx, 0, 0, 2.6, 0, 5.0, { casing: false }); // street doors
    K.gap(ctx, 0, -7, 3.4, 0, 4.4); // vestibule ↔ rotunda
    K.gap(ctx, 12, -19, 3.4, 0, 4.2); // rotunda ↔ annex
    K.gap(ctx, -12, -19, 3.4, 0, 4.2); // rotunda ↔ west exhibit
    K.gap(ctx, 24.5, -27, 2.4, 0, 2.6, { casing: false }); // annex ↔ stair room (top)
    K.gap(ctx, 22, -37.5, 2.2, BY, 2.6); // stair room ↔ vault hall (bottom)
    K.gap(ctx, -6, -36, 1.6, BY, 2.3); // vault hall ↔ assay office
    K.gap(ctx, -12, -41, 3.0, BY, 3.5, { casing: false }); // vault hall ↔ COG archive (round Mosler portal)
    K.gap(ctx, -12.6, -41, 3.0, BY, 3.5, { casing: false });

    // ================================================= VESTIBULE
    K.room(b, ctx, {
      x0: -5,
      z0: -7,
      x1: 5,
      z1: 0,
      y: 0,
      h: 6,
      floor: "marble",
      fc: [0.8, 0.78, 0.72],
      wall: "ashlar",
      wc: stone,
      ceil: "coffer",
      cc: [0.55, 0.53, 0.5],
      cornice: true,
      corniceMat: "limestone",
      trimMat: "marble_black",
      surface: "concrete",
    });
    // the bronze doors from inside, fanlight grille above
    b.boxMM("bronze", -1.3, 0, -0.1, 1.3, 5.0, 0.0, {
      tint: [0.45, 0.48, 0.38],
    });
    for (let k = 0; k < 7; k++)
      b.beam(
        "bronze",
        -1.2 + k * 0.4,
        3.3,
        -0.12,
        -1.2 + k * 0.4,
        4.9,
        -0.12,
        0.04,
        0.04,
        { tint: [0.35, 0.38, 0.3] },
      );
    b.plate("lamp", 0, 4.1, -0.05, 0, -1, 2.4, 1.5, null, {
      tint: [0.5, 0.52, 0.44],
    });
    b.light(0, 3.5, -1.2, day, 0.6, 6, { box: [-5.2, -1, -7.2, 5.2, 7, 0.2] });
    // Congress toll booth: a museum info desk + sandbags + the tax board
    K.table(b, -2.8, 0, -4.2, 2.6, 0.9, {
      h: 1.05,
      mat: "wood_dark",
      yaw: 0.25,
    });
    b.plate(
      "art",
      -4.88,
      2.6,
      -3.4,
      1,
      0,
      2.2,
      1.5,
      K.signCell("fh_tax", "ENTRY TAX\n10 SCRIP\n(OR A FINGER)", 256, 192, {
        bg: "#c8b890",
        fg: "#7a1a14",
        font: "Impact, Arial Black, sans-serif",
      }),
    );
    b.plate(
      "art",
      4.88,
      2.4,
      -3.2,
      -1,
      0,
      1.6,
      2.2,
      K.signCell(
        "fh_nps",
        "FEDERAL HALL\nNATIONAL MEMORIAL\n\nNational Park Service\nU.S. Dept. of the Interior",
        256,
        352,
        { bg: "#4a3a26", fg: "#e8dcb8", font: "Georgia, serif" },
      ),
    );
    K.litter(b, -4.6, -6.6, 4.6, -0.4, 0, 16, 101);
    b.hplate("decal", 1.4, 0.012, -3.4, 2.2, 1.6, 0.4, K.decal("blood", 3));
    K.lamp(b, 0, 4.6, -3.5, "cage", bulb, 0.8, 7, {
      ceil: 6,
      lightOpts: { box: [-5.2, -1, -7.2, 5.2, 7, 0.2] },
    });

    // ================================================= ROTUNDA
    b.face("marble", -12, 0, -7, 1, 0, 0, 0, 0, -1, 24, 24, {
      uv: "top",
      tint: [0.86, 0.84, 0.8],
    });
    b.col(-12, -0.3, -31, 12, 0, -7, { tag: "floor", surface: "concrete" });
    b.hplate("decal", RC.x, 0.012, RC.z, 9.5, 9.5, 0, K.medallion("star", 512));
    // walls: four arcs between the openings (S, E, W, N), lintels above, green marble dado
    const OPEN = [
      [-HP, 0.15],
      [0, 0.15],
      [PI, 0.15],
      [HP, 0.175],
    ];
    const arcs = [
      [0.15, HP - 0.175],
      [HP + 0.175, PI - 0.15],
      [PI + 0.15, 1.5 * PI - 0.15],
      [1.5 * PI + 0.15, 2 * PI - 0.15],
    ];
    for (const [a0, a1] of arcs) {
      K.ringWall(b, "ashlar", RC.x, RC.z, RC.r, 0, 10, a0, a1, 10, true, {
        tint: stone,
      });
      K.ringWall(
        b,
        "marble_green",
        RC.x,
        RC.z,
        RC.r - 0.04,
        0,
        1.15,
        a0,
        a1,
        10,
        true,
        { col: false, tint: [0.8, 0.85, 0.8] },
      );
    }
    for (const [ac, hw] of OPEN) {
      K.ringWall(
        b,
        "ashlar",
        RC.x,
        RC.z,
        RC.r,
        4.25,
        10,
        ac - hw,
        ac + hw,
        2,
        true,
        { col: false, tint: stone },
      );
      // keystone + archivolt over each opening
      const px = RC.x + Math.cos(ac) * (RC.r - 0.1),
        pz = RC.z - Math.sin(ac) * (RC.r - 0.1);
      b.box("limestone", px, 4.2, pz, 0.6, 0.8, 0.3, {
        yaw: ac + HP,
        tint: stone.map((v) => v * 1.08),
      });
    }
    // gallery ring at +5 m with a brass rail (the upper-level balcony)
    K.annulus(b, "marble", RC.x, 5.0, RC.z, 10.1, RC.r, 32, true, {
      tint: [0.8, 0.78, 0.74],
    });
    K.annulus(b, "plaster", RC.x, 4.72, RC.z, 10.1, RC.r, 32, false, {
      tint: [0.62, 0.6, 0.56],
    });
    K.ringWall(
      b,
      "limestone",
      RC.x,
      RC.z,
      10.1,
      4.72,
      5.0,
      0,
      PI * 2,
      32,
      true,
      { col: false, tint: stone },
    );
    for (let i = 0; i < 32; i++) {
      const t0 = (i / 32) * PI * 2,
        t1 = ((i + 1) / 32) * PI * 2;
      K.railing(
        b,
        RC.x + Math.cos(t0) * 10.2,
        RC.z - Math.sin(t0) * 10.2,
        RC.x + Math.cos(t1) * 10.2,
        RC.z - Math.sin(t1) * 10.2,
        5.0,
        { h: 0.95, mat: "brass", handMat: "brass", step: 0.45, col: false },
      );
    }
    // sixteen Corinthian-ish columns
    for (let i = 0; i < 16; i++) {
      const a = ((i + 0.5) / 16) * PI * 2,
        x = RC.x + Math.cos(a) * 9.2,
        z = RC.z - Math.sin(a) * 9.2;
      K.column(b, x, 0, z, 0.42, 9.0, {
        kind: "ionic",
        mat: "marble_white",
        tint: [0.9, 0.88, 0.84].map((v) => v * (0.92 + r() * 0.1)),
        flutes: true,
      });
      b.col(x - 0.4, 0, z - 0.4, x + 0.4, 9, z + 0.4, {
        tag: "column",
        walkable: false,
      });
    }
    // entablature ring + soffit, then the coffered dome and the oculus
    K.annulus(b, "limestone", RC.x, 9.0, RC.z, 8.7, RC.r, 32, false, {
      tint: stone.map((v) => v * 0.9),
    });
    K.ringWall(
      b,
      "limestone",
      RC.x,
      RC.z,
      8.7,
      9.0,
      10.0,
      0,
      PI * 2,
      32,
      true,
      { col: false, tint: stone },
    );
    K.annulus(b, "limestone", RC.x, 10.0, RC.z, 8.7, RC.r, 32, true, {
      tint: stone,
    });
    K.dome(b, "coffer", RC.x, 10.0, RC.z, RC.r, 7.4, 2.4, 32, 8, true, {
      tint: [0.72, 0.7, 0.64],
      uRep: 16,
      vRep: 5,
    });
    const OCY = 10 + 7.4 * Math.sin(Math.acos(2.4 / RC.r));
    K.ringWall(
      b,
      "concrete_dark",
      RC.x,
      RC.z,
      2.4,
      OCY - 0.05,
      OCY + 1.4,
      0,
      PI * 2,
      16,
      true,
      { col: false, tint: [0.5, 0.48, 0.44] },
    );
    K.annulus(b, "lamp", RC.x, OCY + 1.4, RC.z, 0, 2.4, 16, false, {
      tint: [0.62, 0.66, 0.54],
    });
    b.light(RC.x, OCY - 1, RC.z, day, 1.1, 24, { box: ROT_BOX, wrap: 0.55 });
    b.light(RC.x, 2.5, RC.z, day, 0.55, 7, { box: ROT_BOX }); // the pool of daylight on the medallion
    for (let k = 0; k < 6; k++)
      b.glow(
        RC.x + (r() - 0.5) * 1.2,
        OCY - 1.5 - k * 2.4,
        RC.z + (r() - 0.5) * 1.2,
        [0.22, 0.24, 0.18],
        3.2 - k * 0.2,
      ); // dusty shaft

    // ---- the Congress in session ----
    // benches: museum display cases pushed into a horseshoe facing the throne
    // (separate cases with gaps, turned legs, the museum pieces still inside under the glass, bedrolls on top)
    for (let i = 0; i < 7; i++) {
      const a = HP + (i - 3) * 0.33,
        x = RC.x + Math.cos(a) * 5.4,
        z = RC.z - Math.sin(a) * 5.4 + 4.2,
        yaw = a - HP;
      const c = Math.cos(yaw),
        sn = Math.sin(yaw),
        L = (u, v) => [x + u * c + v * sn, z - u * sn + v * c];
      b.box("wood", x, 0.34, z, 1.4, 0.36, 0.56, {
        yaw,
        tint: [0.78, 0.56, 0.38],
        faces: "nsewtb",
      });
      b.box("brass", x, 0.7, z, 1.44, 0.03, 0.6, { yaw, faces: "nsewt" });
      for (const [u, v] of [
        [-0.62, -0.22],
        [0.62, -0.22],
        [-0.62, 0.22],
        [0.62, 0.22],
      ]) {
        const q = L(u, v);
        b.cyl("wood", q[0], 0, q[1], 0.035, 0.05, 0.34, 6, {
          tint: [0.7, 0.5, 0.34],
        });
      }
      b.box("cloth_blue", x, 0.7, z, 1.3, 0.012, 0.5, {
        yaw,
        tint: [0.5, 0.2, 0.18],
      });
      // artifacts: quill & inkwell, a flintlock, a tricorn, coins, a folded document (one per case, rotating)
      const q0 = L(-0.35, 0),
        q1 = L(0.3, 0.05);
      if (i % 3 === 0) {
        b.pipe(
          "ivory",
          q0[0],
          0.72,
          q0[1],
          q0[0] + 0.18 * c,
          0.76,
          q0[1] - 0.18 * sn,
          0.008,
          3,
        );
        b.cyl("glass", q1[0], 0.71, q1[1], 0.05, 0.05, 0.06, 8, {
          tint: [0.2, 0.2, 0.24],
        });
      } else if (i % 3 === 1) {
        b.box("metal_dark", q0[0], 0.715, q0[1], 0.5, 0.04, 0.07, {
          yaw: yaw + 0.3,
          tint: [0.3, 0.28, 0.26],
        });
        b.box(
          "wood_dark",
          q0[0] - 0.2 * c,
          0.715,
          q0[1] + 0.2 * sn,
          0.18,
          0.05,
          0.08,
          { yaw: yaw + 0.3 },
        );
        for (let k = 0; k < 4; k++)
          b.cyl("gold", q1[0] + k * 0.05, 0.713, q1[1], 0.02, 0.02, 0.006, 8);
      } else {
        b.cyl("paint_black", q0[0], 0.715, q0[1], 0.16, 0.1, 0.07, 3, {
          tint: [0.12, 0.1, 0.09],
        });
        b.box("flat", q1[0], 0.713, q1[1], 0.3, 0.004, 0.22, {
          yaw: yaw - 0.2,
          tint: [0.86, 0.8, 0.62],
        });
      }
      b.box("glass", x, 0.73, z, 1.36, 0.015, 0.52, {
        yaw,
        tint: [0.62, 0.7, 0.7],
      });
      // the raiders use them as benches: a bedroll, an ammo tin, a bottle
      if (i % 2 === 0) {
        const q = L(0.25, 0);
        b.geo("fabric", K.unitCyl(8), {
          x: q[0],
          y: 0.86,
          z: q[1],
          rz: HP,
          ry: yaw,
          sx: 0.13,
          sy: 0.55,
          sz: 0.13,
          tint: r.pick([
            [0.45, 0.4, 0.3],
            [0.35, 0.3, 0.26],
            [0.5, 0.25, 0.2],
          ]),
        });
      } else {
        const q = L(-0.4, 0.05);
        b.box("paint_olive", q[0], 0.745, q[1], 0.26, 0.16, 0.14, {
          yaw: yaw + 0.4,
          tint: [0.4, 0.46, 0.3],
        });
      }
      b.ocol(x, z, 1.45, 0.6, 0, 0.75, yaw, {
        tag: "furniture",
        surface: "wood",
      });
    }
    // the voting board (a chalk tally on a museum panel)
    const vote = K.paint("art", "fh_vote", 384, 256, function (x, X, Y, W, H) {
      x.fillStyle = "#26302a";
      x.fillRect(X, Y, W, H);
      x.strokeStyle = "#8a6a3a";
      x.lineWidth = 10;
      x.strokeRect(X + 5, Y + 5, W - 10, H - 10);
      x.fillStyle = "rgba(230,230,220,0.9)";
      x.font = 'bold 26px "Comic Sans MS", Arial, sans-serif';
      x.textAlign = "left";
      const lines = [
        "TODAYS BILLS:",
        "EAT THE PRISONER .. AYE 11 NAY 1",
        "TAX WALL ST DOUBLE .. PASSED",
        "KILL BOS TIN MAN .. TABLED",
        "NEW HAT FOR SPEAKER .. PASSED",
        "NAY VOTER .. EATEN",
      ];
      lines.forEach((t, i) => x.fillText(t, X + 22, Y + 40 + i * 36, W - 40));
      K.stains(x, X, Y, W, H, 8, 551, 0.35, [200, 200, 190]);
    });
    {
      const bx = 7.2,
        bz = -26.6;
      let nx = RC.x - bx,
        nz = RC.z - bz;
      const nl = Math.hypot(nx, nz);
      nx /= nl;
      nz /= nl;
      const yaw = Math.atan2(nx, nz);
      b.box("wood_dark", bx, 0, bz, 2.6, 2.4, 0.12, {
        yaw,
        tint: [0.4, 0.3, 0.22],
      });
      b.plate("art", bx, 1.55, bz, nx, nz, 2.4, 1.6, vote, { off: 0.075 });
      b.ocol(bx, bz, 2.6, 0.3, 0, 2.4, yaw, { tag: "furniture" });
    }
    // the prisoner cage (scrap bars) with its last occupant
    const CGX = -7.2,
      CGZ = -12.4;
    for (let k = 0; k < 14; k++) {
      const a = (k / 14) * PI * 2;
      b.pipe(
        "rust",
        CGX + Math.cos(a) * 1.0,
        0,
        CGZ - Math.sin(a) * 1.0,
        CGX + Math.cos(a) * 1.0,
        2.3,
        CGZ - Math.sin(a) * 1.0,
        0.025,
        4,
      );
    }
    b.cyl("rust", CGX, 2.3, CGZ, 1.05, 1.05, 0.06, 14, { bottom: true });
    b.cyl("rust", CGX, 0.02, CGZ, 1.05, 1.05, 0.05, 14);
    b.pipe("black_iron", CGX, 2.36, CGZ, CGX, 10, CGZ, 0.012, 3);
    b.col(CGX - 1.05, 0, CGZ - 1.05, CGX + 1.05, 2.4, CGZ + 1.05, {
      walkable: false,
    });
    K.skel(ctx, CGX + 0.1, 0.06, CGZ, 0.7, "curled");
    // cook fire on the medallion's edge, bones and the stewpot
    b.hplate("decal", 3.5, 0.014, -16.5, 2.6, 2.6, 0, K.decal("scorch", 5));
    for (let k = 0; k < 10; k++)
      b.pipe(
        "bone",
        3.5 + (r() - 0.5) * 2.4,
        0.03,
        -16.5 + (r() - 0.5) * 2.4,
        3.5 + (r() - 0.5) * 2.4,
        0.03,
        -16.5 + (r() - 0.5) * 2.4,
        0.025,
        4,
        { tint: [0.85, 0.8, 0.66] },
      );
    b.light(3.5, 1.0, -16.5, fire, 1.5, 9, { box: ROT_BOX });
    b.light(-6.5, 1.1, -24.5, fire, 1.2, 8, { box: ROT_BOX });
    b.light(6.5, 1.1, -11.5, fire, 1.0, 7, { box: ROT_BOX });
    // Washington's Bible case (smashed) at the west side
    b.box("marble_black", -9.0, 0, -19, 1.0, 1.0, 1.4, {
      tint: [0.5, 0.48, 0.46],
    });
    b.box("glass", -9.0, 1.0, -19, 0.9, 0.02, 1.3, { tint: [0.35, 0.4, 0.4] });
    for (let k = 0; k < 4; k++)
      b.quad(
        "glass",
        [-9.4 + k * 0.2, 1.02, -19.6],
        [-9.2 + k * 0.2, 1.02, -19.6],
        [-9.3 + k * 0.2, 1.3 + r() * 0.3, -19.6],
        [-9.35 + k * 0.2, 1.3 + r() * 0.25, -19.6],
        { tint: [0.5, 0.56, 0.55] },
      );
    b.col(-9.5, 0, -19.7, -8.5, 1.02, -18.3, { tag: "furniture" });
    b.plate(
      "art",
      -8.49,
      0.6,
      -19,
      1,
      0,
      0.8,
      0.3,
      K.signCell(
        "fh_bible",
        "THE WASHINGTON INAUGURAL BIBLE · ON LOAN FROM ST. JOHN'S LODGE",
        512,
        64,
        { bg: "#e0d8c4", fg: "#2a2218", font: "Georgia, serif" },
      ),
    );
    // graffiti and a big raider banner inside the north apse
    b.plate(
      "decal",
      RC.x + Math.cos(PI + 0.55) * 11.9,
      3.0,
      RC.z - Math.sin(PI + 0.55) * 11.9,
      -Math.cos(PI + 0.55),
      Math.sin(PI + 0.55),
      5,
      1.5,
      K.tag("NO TAXATION W/O DECAPITATION", "#c8281e", 768, 128, {
        size: 0.45,
      }),
      { off: 0.03 },
    );
    b.plate(
      "decal",
      RC.x + Math.cos(-0.5) * 11.9,
      2.8,
      RC.z - Math.sin(-0.5) * 11.9,
      -Math.cos(-0.5),
      Math.sin(-0.5),
      4,
      1.3,
      K.tag("VOSS 4 SPEAKER", "#e0d8c0", 384, 128, {}),
      { off: 0.03 },
    );
    K.litter(b, -9, -28, 9, -10, 0, 44, 102);
    for (let k = 0; k < 5; k++)
      b.hplate(
        "decal",
        (r() - 0.5) * 16,
        0.013 + k * 0.0004,
        RC.z + (r() - 0.5) * 16,
        1.2 + r() * 1.5,
        1.2 + r(),
        r() * 6,
        K.decal(k % 2 ? "blood" : "grime", 30 + k),
      );
    // raider string lights around the columns
    for (let i = 0; i < 16; i++) {
      const a0 = ((i + 0.5) / 16) * PI * 2,
        a1 = ((i + 1.5) / 16) * PI * 2,
        R0 = 9.2 - 0.44;
      const P = (t) => {
        const a = a0 + (a1 - a0) * t;
        return [
          Math.cos(a) * R0,
          3.6 - Math.sin(t * PI) * 0.55,
          RC.z - Math.sin(a) * R0,
        ];
      };
      let prev = P(0);
      for (let k = 1; k <= 4; k++) {
        const q = P(k / 4);
        b.pipe(
          "black_iron",
          prev[0],
          prev[1],
          prev[2],
          q[0],
          q[1],
          q[2],
          0.012,
          3,
        );
        prev = q;
      }
      for (const t of [0.3, 0.7]) {
        const q = P(t),
          dead = (i * 2 + (t > 0.5 ? 1 : 0)) % 5 === 3;
        b.geo("lamp", K.sphereGeo(), {
          x: q[0],
          y: q[1] - 0.07,
          z: q[2],
          s: 0.055,
          tint: dead ? [0.2, 0.18, 0.15] : bulb,
        });
        if (!dead) b.glow(q[0], q[1] - 0.07, q[2], [0.75, 0.52, 0.3], 0.7);
      }
      if (i % 2 === 0) {
        const q = P(0.5);
        b.light(
          q[0] * 0.9,
          q[1] - 0.4,
          RC.z + (q[2] - RC.z) * 0.9,
          bulb,
          0.32,
          6,
          { box: ROT_BOX },
        );
      }
    }

    // ================================================= SPEAKER'S APSE (north)
    K.room(b, ctx, {
      x0: -2.05,
      z0: -34.5,
      x1: 2.05,
      z1: -31,
      y: 0,
      h: 5.2,
      floor: "marble",
      fc: [0.7, 0.68, 0.64],
      wall: "ashlar",
      wc: stone.map((v) => v * 0.9),
      ceil: "coffer",
      cc: [0.5, 0.48, 0.45],
      open: { s: true },
      trim: false,
    });
    // dais of ammo crates + the throne (NPS director's chair, car seat, flag cape)
    b.boxMM("wood", -1.8, 0, -34.4, 1.8, 0.45, -32.2, {
      tint: [0.45, 0.5, 0.35],
      faces: "nsewt",
    });
    for (let k = 0; k < 4; k++)
      b.plate(
        "art",
        -1.35 + k * 0.9,
        0.23,
        -32.19,
        0,
        1,
        0.8,
        0.3,
        K.signCell("fh_ammo", "AMMO .308", 192, 64, {
          bg: "#4a5236",
          fg: "#d8d0a0",
          font: "Arial Black, sans-serif",
        }),
      );
    b.col(-1.8, 0, -34.4, 1.8, 0.45, -32.2, { tag: "floor", surface: "wood" });
    b.box("leather_red", 0, 0.45, -33.4, 1.1, 0.55, 1.0, {
      tint: [0.45, 0.18, 0.12],
    });
    b.box("leather_red", 0, 1.0, -33.9, 1.1, 1.6, 0.2, {
      tint: [0.4, 0.15, 0.1],
    });
    for (const s of [-1, 1]) {
      b.box("wood_dark", s * 0.6, 0.45, -33.4, 0.14, 0.95, 1.0, {
        tint: [0.35, 0.22, 0.15],
      });
      b.pipe("rust", s * 0.55, 2.6, -33.95, s * 0.7, 3.3, -34.0, 0.02, 3);
    }
    b.geo("bone", K.sphereGeo(), {
      x: 0,
      y: 2.75,
      z: -33.95,
      sx: 0.13,
      sy: 0.15,
      sz: 0.13,
      tint: [0.85, 0.8, 0.66],
    });
    b.col(-0.7, 0.45, -34.2, 0.7, 2.6, -32.9, { tag: "furniture" });
    const banner = K.flagCell("raider", 256, 256);
    b.plate("art", 0, 3.6, -34.38, 0, 1, 3.4, 3.2, banner, { off: 0.02 });
    b.plate(
      "art",
      -1.93,
      2.2,
      -32.8,
      1,
      0,
      1.2,
      1.4,
      K.signCell(
        "fh_rules",
        "ROBERT'S\nRULES\n(abridged)\n1. SPEAKER\nIS RIGHT",
        192,
        224,
        { bg: "#d8ccaa", fg: "#2a1a10", font: "Georgia, serif" },
      ),
    );
    b.light(0, 3.0, -31.8, fire, 0.8, 5, {
      box: [-2.2, -1, -34.8, 2.2, 6, -30],
    });
    b.glow(-1.6, 1.2, -31.6, [0.9, 0.5, 0.2], 1.4);

    // ================================================= WEST WING: "Birth of the Republic"
    const WX0 = -28,
      WX1 = -12,
      WZ0 = -27,
      WZ1 = -11;
    K.room(b, ctx, {
      x0: WX0,
      z0: WZ0,
      x1: WX1,
      z1: WZ1,
      y: 0,
      h: 5.2,
      floor: "parquet",
      fc: [0.7, 0.62, 0.52],
      wall: "plaster",
      wc: [0.7, 0.72, 0.66],
      wain: "wood_dark",
      wainC: [0.45, 0.32, 0.22],
      wainH: 1.1,
      ceil: "plaster",
      cc: [0.6, 0.6, 0.56],
      cornice: true,
      surface: "wood",
    });
    const WBOX = [WX0 - 0.2, -1, WZ0 - 0.2, WX1 + 0.2, 6, WZ1 + 0.2];
    b.plate(
      "art",
      -20,
      3.9,
      WZ0 + 0.12,
      0,
      1,
      7,
      0.8,
      K.signCell("fh_exh", "BIRTH OF THE REPUBLIC · 1789", 768, 88, {
        bg: "#1e2a3e",
        fg: "#e8dcb8",
        font: "Georgia, serif",
      }),
    );
    // exhibit panels (text & portraits) along the walls, some torn down
    for (let i = 0; i < 5; i++) {
      const x = WX0 + 1.8 + i * 3.1,
        down = r() < 0.35;
      if (down) {
        b.box("wood_dark", x, 0.02, WZ0 + 1.3, 1.8, 0.06, 1.2, {
          yaw: r() - 0.5,
          tint: [0.35, 0.28, 0.2],
        });
        continue;
      }
      b.box("wood_dark", x, 0, WZ0 + 0.3, 1.9, 2.8, 0.1, {
        tint: [0.3, 0.24, 0.18],
      });
      K.framed(
        b,
        x,
        2.1,
        WZ0 + 0.36,
        0,
        1,
        1.1,
        1.2,
        K.photo(i % 2 ? "family" : "mug", 40 + i),
        { frame: "gold" },
      );
      b.plate(
        "art",
        x,
        0.95,
        WZ0 + 0.36,
        0,
        1,
        1.5,
        0.7,
        K.signCell(
          "fh_panel" + i,
          [
            "THE FIRST CONGRESS",
            "THE OATH OF OFFICE",
            "THE BILL OF RIGHTS",
            "THE ZENGER TRIAL",
            "THE SUB-TREASURY",
          ][i],
          256,
          120,
          {
            bg: "#e0d8c4",
            fg: "#2a2218",
            font: "Georgia, serif",
            sub: "— read more at the kiosk —",
          },
        ),
        { off: 0.07 },
      );
    }
    // the diorama table (1789 Wall Street in miniature, stomped flat) and display vitrines
    b.boxMM("wood_dark", -24, 0, -20.5, -16, 0.9, -16.5, {
      tint: [0.4, 0.3, 0.22],
    });
    b.col(-24, 0, -20.5, -16, 0.9, -16.5, {
      tag: "furniture",
      surface: "wood",
    });
    for (let k = 0; k < 22; k++) {
      const bx = -23.6 + r() * 7.2,
        bz = -20.1 + r() * 3.2,
        h = 0.08 + r() * 0.25;
      b.box(
        r() < 0.5 ? "brick_red" : "limestone",
        bx,
        0.9,
        bz,
        0.18 + r() * 0.3,
        r() < 0.3 ? 0.03 : h,
        0.18 + r() * 0.25,
        { yaw: r() * 0.4, tint: [0.8, 0.75, 0.68] },
      );
    }
    b.box("glass", -20, 0.9, -18.5, 7.8, 0.02, 3.8, {
      tint: [0.3, 0.34, 0.34],
    });
    for (const [vx, vz] of [
      [-26.5, -13],
      [-26.5, -24.5],
      [-14, -24.5],
    ]) {
      b.box("wood_dark", vx, 0, vz, 1.1, 0.95, 1.1, {
        tint: [0.35, 0.26, 0.18],
      });
      b.box("glass", vx, 0.95, vz, 1.0, 0.8, 1.0, { tint: [0.35, 0.4, 0.4] });
      b.col(vx - 0.55, 0, vz - 0.55, vx + 0.55, 1.75, vz + 0.55, {
        tag: "furniture",
      });
    }
    // colonial mannequin (skeletal) in a tricorn hat
    b.cyl("paint_black", -26.5, 1.9, -13, 0.22, 0.14, 0.1, 3, {
      tint: [0.1, 0.1, 0.1],
    });
    K.skel(ctx, -25.8, 0, -15.2, 1.2, "sitting");
    K.lamp(b, -20, 4.2, -15, "pendant", bulb, 0.7, 9, {
      ceil: 5.2,
      shade: "paint_green",
      lightOpts: { box: WBOX },
    });
    K.lamp(b, -20, 4.2, -23, "pendant", bulb, 0.55, 8, {
      ceil: 5.2,
      shade: "paint_green",
      lightOpts: { box: WBOX },
    });
    b.light(-16, 1.5, -22.5, [1, 0.62, 0.3], 0.7, 6, { box: WBOX }); // a raider's lantern by the bell
    b.geo("lamp", K.sphereGeo(), {
      x: -16.9,
      y: 0.2,
      z: -22.6,
      s: 0.09,
      tint: [1, 0.7, 0.35],
    });
    b.glow(-16.9, 0.25, -22.6, [0.9, 0.55, 0.25], 1.2);
    b.light(-13.5, 2.0, -19, day, 0.4, 7, { box: WBOX });
    K.litter(b, WX0 + 0.5, WZ0 + 0.5, WX1 - 0.5, WZ1 - 0.5, 0, 26, 103);
    // the Liberty Bell replica, knocked off its yoke and cracked (bronze bell on its side)
    {
      const lx = -15.8,
        lz = -24.4;
      b.boxMM("wood_dark", lx - 1.2, 0, lz - 0.2, lx - 1.0, 2.2, lz + 0.2, {
        tint: [0.4, 0.3, 0.2],
      });
      b.boxMM("wood_dark", lx + 1.0, 0, lz - 0.2, lx + 1.2, 1.1, lz + 0.2, {
        tint: [0.4, 0.3, 0.2],
      });
      b.beam(
        "wood_dark",
        lx - 1.1,
        2.1,
        lz,
        lx + 0.4,
        1.3,
        lz + 0.3,
        0.25,
        0.22,
        { tint: [0.4, 0.3, 0.2] },
      );
      b.geo(
        "bronze",
        new THREE.CylinderGeometry(0.34, 0.62, 0.95, 16, 1, true),
        {
          x: lx + 0.1,
          y: 0.55,
          z: lz + 0.9,
          rz: 1.35,
          ry: 0.4,
          tint: [0.62, 0.52, 0.36],
        },
      );
      b.geo("bronze", K.sphereGeo(), {
        x: lx - 0.36,
        y: 0.5,
        z: lz + 0.72,
        sx: 0.36,
        sy: 0.3,
        sz: 0.36,
        tint: [0.55, 0.46, 0.32],
      });
      b.plate(
        "decal",
        lx + 0.1,
        0.8,
        lz + 1.37,
        0,
        1,
        0.1,
        0.55,
        K.decal("crack", 3),
        { off: 0.01 },
      );
      b.col(lx - 0.8, 0, lz + 0.3, lx + 0.8, 0.9, lz + 1.5, {
        tag: "furniture",
        surface: "metal",
      });
      b.plate(
        "art",
        lx,
        0.5,
        lz - 0.23,
        0,
        -1,
        1.0,
        0.3,
        K.signCell(
          "fh_bell",
          "LIBERTY BELL (REPLICA) · PLEASE DO NOT RING",
          384,
          64,
          { bg: "#e0d8c4", fg: "#2a2218", font: "Georgia, serif" },
        ),
        { off: 0.01 },
      );
    }
    // colonial flags on staffs (one torn down), toppled mannequins in continental blue
    for (const [fx, fz, down] of [
      [-27.4, -18.5, false],
      [-27.4, -22.5, true],
      [-12.8, -13.2, false],
    ]) {
      const flag = K.flagCell("us", 192, 128);
      if (down) {
        b.pipe(
          "wood_dark",
          fx + 0.3,
          0.05,
          fz - 1.4,
          fx + 1.4,
          0.35,
          fz + 1.2,
          0.03,
          5,
        );
        b.hplate("art", fx + 1.0, 0.03, fz, 1.4, 0.9, 0.9, flag);
        continue;
      }
      b.pipe("wood_dark", fx, 0, fz, fx, 3.0, fz, 0.035, 6);
      b.geo("brass", K.sphereGeo(), { x: fx, y: 3.05, z: fz, s: 0.07 });
      const dx = fx < -20 ? 1 : -1;
      b.quad(
        "art",
        [fx, 1.7, fz],
        [fx + dx * 0.05, 1.75, fz + 1.3],
        [fx + dx * 0.05, 2.9, fz + 1.3],
        [fx, 2.9, fz],
        { rect: flag, grime: 0 },
      );
      b.quad(
        "art",
        [fx + dx * 0.05, 1.75, fz + 1.3],
        [fx, 1.7, fz],
        [fx, 2.9, fz],
        [fx + dx * 0.05, 2.9, fz + 1.3],
        { rect: flag, grime: 0 },
      );
    }
    for (const [mx, mz, my] of [
      [-22.2, -14.4, 0.4],
      [-17.5, -12.6, 2.2],
      [-25.2, -21.4, -1.3],
    ]) {
      const c = Math.cos(my),
        sn = Math.sin(my),
        P = (u, v) => [mx + u * c + v * sn, mz - u * sn + v * c];
      let q = P(0, 0);
      b.box("cloth_blue", q[0], 0.02, q[1], 0.4, 0.22, 0.95, {
        yaw: my,
        tint: [0.35, 0.4, 0.62],
        faces: "nsewt",
      });
      q = P(0, 0.62);
      b.geo("flat", K.sphereGeo(), {
        x: q[0],
        y: 0.12,
        z: q[1],
        sx: 0.11,
        sy: 0.1,
        sz: 0.13,
        tint: [0.82, 0.76, 0.66],
      });
      q = P(0, -0.8);
      b.box("cloth_white", q[0], 0.02, q[1], 0.3, 0.14, 0.7, {
        yaw: my + 0.1,
        tint: [0.82, 0.8, 0.72],
      });
      q = P(0.35, 0.2);
      b.box("cloth_blue", q[0], 0.02, q[1], 0.12, 0.12, 0.55, {
        yaw: my + 0.8,
        tint: [0.35, 0.4, 0.62],
      });
      q = P(0.1, 0.95);
      b.cyl("paint_black", q[0], 0.02, q[1], 0.17, 0.11, 0.07, 3, {
        tint: [0.12, 0.1, 0.09],
      });
    }
    K.clutter(b, WX0, WZ0, WX1, WZ1, 0, {
      n: 24,
      seed: 5101,
      kinds: ["paper", "glass", "chair", "panel", "box", "books", "debris"],
      avoid: [
        [-24.2, -20.7, -15.8, -16.3],
        [-12.9, -20.8, -12, -17.2],
        [-27.5, -14, -25.5, -12],
        [-27.5, -25.5, -25.5, -23.5],
        [-15, -25.5, -13, -23.5],
        [-23, -27, -20.5, -24.5],
      ],
      panelTint: [0.66, 0.66, 0.6],
    });
    b.plate(
      "art",
      -21.55,
      1.1,
      WZ0 + 0.11,
      0,
      1,
      1.05,
      2.2,
      K.signCell(
        "fh_svc",
        "STAFF ONLY\n\nSUB-TREASURY\nSERVICE STAIR",
        128,
        256,
        { bg: "#5a5e58", fg: "#e8e0c8", font: "Arial Black, sans-serif" },
      ),
      { off: 0.02 },
    );

    // ================================================= EAST WING: the ANNEX
    const EX0 = 12,
      EX1 = 28,
      EZ0 = -27,
      EZ1 = -11;
    K.room(b, ctx, {
      x0: EX0,
      z0: EZ0,
      x1: EX1,
      z1: EZ1,
      y: 0,
      h: 5.2,
      floor: "terrazzo",
      fc: [0.62, 0.6, 0.55],
      wall: "plaster_stained",
      wc: [0.66, 0.62, 0.54],
      ceil: "plaster",
      cc: [0.45, 0.43, 0.4],
      surface: "concrete",
    });
    const EBOX = [EX0 - 0.2, -1, EZ0 - 0.2, EX1 + 0.2, 6, EZ1 + 0.2];
    // scrap partitions: bunk room (south), pill bench (NW), armoury (NE)
    const scrap = [
      [0.6, 0.35, 0.25],
      [0.55, 0.5, 0.45],
      [0.45, 0.42, 0.36],
      [0.62, 0.55, 0.4],
    ];
    const panelRun = (x0, z0, x1, z1, h) => {
      const len = Math.hypot(x1 - x0, z1 - z0),
        n = Math.max(1, Math.round(len / 1.2)),
        yaw = Math.atan2(-(z1 - z0), x1 - x0);
      for (let k = 0; k < n; k++) {
        const t = (k + 0.5) / n;
        b.box(
          r() < 0.5 ? "corrugated" : "rust",
          x0 + (x1 - x0) * t,
          0,
          z0 + (z1 - z0) * t,
          len / n + 0.04,
          h - 0.4 + r() * 0.6,
          0.06,
          { yaw: yaw + (r() - 0.5) * 0.05, tint: r.pick(scrap) },
        );
      }
      b.ocol((x0 + x1) / 2, (z0 + z1) / 2, len, 0.2, 0, h, yaw, {
        tag: "wall",
      });
    };
    panelRun(EX0 + 3.5, -17, 19.5, -17, 2.6);
    panelRun(21.5, -17, EX1, -17, 2.6);
    panelRun(20.5, EZ0, 20.5, -21.5, 2.6);
    // bunk room: mattresses (props), a tire stove, girlie pin-ups
    b.plate(
      "art",
      EX1 - 0.12,
      2.0,
      -14,
      -1,
      0,
      1.0,
      1.3,
      K.painting(7, 128, 160),
    );
    b.plate(
      "decal",
      EX1 - 0.12,
      3.1,
      -12.8,
      -1,
      0,
      3,
      1,
      K.tag("BACKBENCH", "#e0d8c0", 384, 128, {}),
      { off: 0.02 },
    );
    b.light(24, 1.2, -13, fire, 1.0, 7, { box: EBOX });
    // pill bench NW: lab tables, glassware, a still made of a museum water cooler
    K.table(b, 15.5, 0, -25.2, 3.2, 0.9, { mat: "metal", h: 0.92 });
    for (let k = 0; k < 9; k++) {
      const gx = 14.2 + k * 0.32;
      b.cyl(
        "glass",
        gx,
        0.92,
        -25.2 + (r() - 0.5) * 0.4,
        0.05 + r() * 0.03,
        0.03,
        0.14 + r() * 0.16,
        7,
        {
          tint: r.pick([
            [0.4, 0.8, 0.3],
            [0.8, 0.5, 0.2],
            [0.3, 0.5, 0.8],
            [0.7, 0.7, 0.6],
          ]),
        },
      );
    }
    b.geo("lamp", K.sphereGeo(), {
      x: 16.8,
      y: 1.05,
      z: -25.1,
      s: 0.07,
      tint: [0.4, 1, 0.3],
    });
    b.glow(16.8, 1.1, -25.1, [0.2, 0.6, 0.15], 0.9);
    b.light(15.5, 1.8, -24.5, [0.5, 0.9, 0.4], 0.5, 4, { box: EBOX });
    b.plate(
      "art",
      12.14,
      2.2,
      -24.8,
      1,
      0,
      1.4,
      1.0,
      K.signCell("fh_pills", "PILL COMMITTEE\nDO NOT LICK", 256, 160, {
        bg: "#d8ccaa",
        fg: "#3a5a2a",
        font: "Impact, Arial Black, sans-serif",
      }),
    );
    // armoury NE: weapon rack with cut-outs of guns, ammo crates (props)
    b.boxMM("wood", 26.8, 0, -26.6, 27.8, 2.2, -22.4, {
      tint: [0.45, 0.35, 0.25],
    });
    for (let k = 0; k < 6; k++)
      b.beam(
        "metal_dark",
        26.75,
        0.6,
        -26.2 + k * 0.7,
        26.75,
        1.9,
        -26.3 + k * 0.7,
        0.05,
        0.1,
        { tint: [0.2, 0.2, 0.2] },
      );
    b.col(26.8, 0, -26.6, 27.8, 2.2, -22.4, { tag: "furniture" });
    // Sergeant-at-Arms' chair (combat's gang boss stands here)
    b.box("leather", 18, 0, -13.2, 0.9, 0.5, 0.8, { tint: [0.3, 0.2, 0.12] });
    b.box("leather", 18, 0.5, -12.85, 0.9, 0.9, 0.12, {
      tint: [0.3, 0.2, 0.12],
    });
    b.col(17.5, 0, -13.6, 18.5, 0.6, -12.8, { tag: "furniture" });
    K.lamp(b, 16, 4.2, -20, "bulb", bulb, 0.8, 8, {
      ceil: 5.2,
      lightOpts: { box: EBOX },
    });
    K.lamp(b, 24, 4.2, -20, "bulb", bulb, 0.6, 7, {
      ceil: 5.2,
      lightOpts: { box: EBOX },
    });
    K.litter(b, EX0 + 0.5, EZ0 + 0.5, EX1 - 0.5, EZ1 - 0.5, 0, 30, 104);
    // annex dressing: tire stove, a meat rack, a dartboard of Voss's rivals, pin-ups, ammo tins, bottles, the Whip's list
    b.cyl("rubber", 24, 0, -13, 0.42, 0.42, 0.26, 12, {
      tint: [0.12, 0.11, 0.1],
    });
    b.cyl("rubber", 24, 0.26, -13, 0.4, 0.4, 0.24, 12, {
      tint: [0.13, 0.12, 0.11],
    });
    b.pipe("rust", 24, 0.5, -13, 24, 3.4, -12.6, 0.07, 6);
    b.glow(24, 0.6, -13, [0.9, 0.45, 0.15], 1.6);
    for (let k = 0; k < 3; k++) {
      b.pipe(
        "rust",
        18.6 + k * 1.1,
        2.35,
        -11.25,
        18.6 + k * 1.1,
        1.75,
        -11.25,
        0.01,
        3,
      );
      b.geo("meat", K.sphereGeo(), {
        x: 18.6 + k * 1.1,
        y: 1.55,
        z: -11.3,
        sx: 0.16,
        sy: 0.3,
        sz: 0.1,
        tint: [0.55, 0.28, 0.22],
      });
    }
    b.beam("rust", 18, 2.35, -11.25, 21.4, 2.35, -11.25, 0.04, 0.04);
    b.plate(
      "art",
      13.5,
      1.8,
      -11.13,
      0,
      -1,
      0.7,
      0.7,
      K.medallion("star", 128),
      { off: 0.02 },
    );
    b.plate(
      "art",
      EX0 + 0.12,
      1.9,
      -13.6,
      1,
      0,
      1.0,
      1.25,
      K.painting(9, 128, 160),
    );
    b.plate(
      "art",
      26.6,
      1.9,
      -17.13,
      0,
      1,
      1.4,
      1.0,
      K.signCell(
        "fh_whip",
        "WHIP'S LIST\nSKEETER - owes 3\nMAGS - owes 1\nTIN MAN - owes LIFE\nNEW GUY - ???",
        224,
        160,
        {
          bg: "#d8ccaa",
          fg: "#3a1a10",
          font: '"Comic Sans MS", Arial, sans-serif',
        },
      ),
      { off: 0.02 },
    );
    K.clutter(b, EX0, EZ0, EX1, EZ1, 0, {
      n: 22,
      seed: 5102,
      kinds: ["can", "paper", "debris", "box", "chair", "glass"],
      avoid: [
        [12, -20.6, 13.6, -17.4],
        [22.8, -27, 26.2, -25.2],
        [26.5, -27, 28, -22],
        [13.5, -26, 17.5, -24.3],
        [17.3, -14, 18.7, -12.5],
        [23, -14, 25, -12],
      ],
      debrisTint: [0.66, 0.62, 0.56],
    });
    b.hplate("decal", 16, 0.012, -14, 2, 1.6, 0.3, K.decal("blood", 8));

    // ================================================= STAIR ROOM (annex → Sub-Treasury)
    K.room(b, ctx, {
      x0: 22,
      z0: -39,
      x1: 27,
      z1: -27,
      y: BY,
      h: 9.7,
      floor: "concrete",
      fc: [0.5, 0.48, 0.45],
      wall: "plaster_stained",
      wc: [0.6, 0.58, 0.52],
      ceil: "plaster",
      cc: [0.4, 0.4, 0.38],
      surface: "concrete",
    });
    K.stairs(b, 22.5, -36, 26.5, -28, BY, 0, "+z", {
      mat: "marble",
      tint: [0.7, 0.68, 0.64],
      rail: "r",
      railMat: "brass",
      handMat: "brass",
    });
    b.boxMM("marble", 22, -0.35, -28, 27, 0, -27, {
      tint: [0.7, 0.68, 0.64],
      faces: "nsewt",
    });
    b.col(22, -0.35, -28, 27, 0, -27, { tag: "floor" });
    b.plate(
      "art",
      26.88,
      1.6,
      -30,
      -1,
      0,
      1.3,
      0.8,
      K.signCell(
        "fh_down",
        "SUB-TREASURY\nVAULTS ▼\nAUTHORIZED\nPERSONNEL",
        192,
        128,
        { bg: "#e0d8c4", fg: "#2a2218", font: "Georgia, serif" },
      ),
    );
    K.lamp(b, 24.5, 3.6, -31, "cage", bulb, 0.6, 8, { ceil: 5.2 });
    K.lamp(b, 24.5, BY + 2.9, -37.5, "cage", [1, 0.3, 0.2], 0.6, 5, {
      ceil: BY + 3.4,
    });
    b.boxMM("steel", 26.86, BY, -38.8, 26.9, BY + 2.4, -36.8, {
      tint: [0.42, 0.44, 0.44],
    });
    for (let k = 0; k < 4; k++)
      b.beam(
        "steel",
        26.84,
        BY + 0.3 + k * 0.6,
        -38.8,
        26.84,
        BY + 0.3 + k * 0.6,
        -36.8,
        0.03,
        0.05,
      );
    b.plate(
      "art",
      26.88,
      BY + 2.7,
      -37.8,
      -1,
      0,
      1.6,
      0.3,
      K.signCell("fh_loading_in", "LOADING DOCK · BEAVER ST", 256, 48, {
        bg: "#2a2a28",
        fg: "#d8c890",
        font: "Georgia, serif",
      }),
      { off: 0.01 },
    );

    // ================================================= SUB-TREASURY VAULT HALL (y −4.5)
    const HX0 = -12,
      HX1 = 22,
      HZ0 = -46,
      HZ1 = -36,
      HH = 4.2;
    K.room(b, ctx, {
      x0: HX0,
      z0: HZ0,
      x1: HX1,
      z1: HZ1,
      y: BY,
      h: HH,
      floor: "terrazzo",
      fc: [0.6, 0.58, 0.54],
      wall: "ashlar",
      wc: [0.62, 0.6, 0.55],
      ceil: "concrete",
      cc: [0.4, 0.4, 0.38],
      wain: "marble_black",
      wainC: [0.35, 0.34, 0.33],
      wainH: 0.9,
      surface: "concrete",
    });
    // barred gold cages along the north wall (bays 3.4 m wide)
    const CZ = HZ0 + 2.8;
    for (let i = 0; i < 8; i++) {
      const x0 = -7 + i * 3.4,
        x1 = x0 + 3.2,
        open = i === 2 || i === 5,
        raided = r() < 0.5;
      for (let x = x0 + 0.1; x < x1; x += 0.16) {
        if (open && x > x0 + 1.0 && x < x0 + 2.1) continue;
        b.pipe("black_iron", x, BY, CZ, x, BY + HH, CZ, 0.018, 4);
      }
      for (const yy of [BY + 0.12, BY + 2.2])
        b.beam("black_iron", x0, yy, CZ, x1, yy, CZ, 0.05, 0.08);
      b.boxMM("ashlar", x0 - 0.1, BY, HZ0, x0 + 0.1, BY + HH, CZ - 0.1, {
        tint: [0.62, 0.6, 0.55],
        faces: "nsewt",
      });
      b.plate(
        "art",
        (x0 + x1) / 2,
        BY + 2.6,
        CZ + 0.02,
        0,
        1,
        0.7,
        0.25,
        K.signCell(
          "fh_cage" + i,
          "VAULT " + String.fromCharCode(65 + i),
          128,
          48,
          { bg: "#b89a4a", fg: "#1a1408", font: "Georgia, serif" },
        ),
        { off: 0.02 },
      );
      if (open) {
        b.col(x0, BY, CZ - 0.08, x0 + 1.0, BY + HH, CZ + 0.08, {
          walkable: false,
        });
        b.col(x0 + 2.1, BY, CZ - 0.08, x1, BY + HH, CZ + 0.08, {
          walkable: false,
        });
      } else
        b.col(x0, BY, CZ - 0.08, x1, BY + HH, CZ + 0.08, { walkable: false });
      // contents: empty pallets, a few bars of gold paint on lead (raided) or crates
      b.boxMM("wood", x0 + 0.3, BY, HZ0 + 0.3, x1 - 0.3, BY + 0.14, HZ0 + 2.2, {
        tint: [0.5, 0.4, 0.3],
      });
      if (!raided)
        for (let k = 0; k < 6; k++)
          b.box(
            "gold",
            x0 + 0.7 + (k % 3) * 0.7,
            BY + 0.14 + Math.floor(k / 3) * 0.1,
            HZ0 + 1.0 + (k % 2) * 0.35,
            0.5,
            0.1,
            0.22,
            { tint: [0.85, 0.72, 0.42] },
          );
      else {
        b.box("wood", (x0 + x1) / 2, BY + 0.14, HZ0 + 1.2, 0.9, 0.5, 0.6, {
          yaw: 0.3,
          tint: [0.45, 0.4, 0.3],
        });
        b.plate(
          "art",
          (x0 + x1) / 2,
          BY + 1.5,
          HZ0 + 0.13,
          0,
          1,
          1.2,
          0.5,
          K.signCell(
            "fh_melt",
            "MELTED DOWN\nBY ORDER OF\nTHE CONGRESS",
            192,
            80,
            {
              bg: "#c8b890",
              fg: "#7a1a14",
              font: "Impact, Arial Black, sans-serif",
            },
          ),
          { off: 0.02 },
        );
      }
      b.light((x0 + x1) / 2, BY + 2.4, HZ0 + 1.3, [1, 0.82, 0.52], 0.6, 3.6, {
        box: [x0, BY - 0.2, HZ0 - 0.2, x1, BY + HH, CZ - 0.05],
      });
      if (i % 2 === 0) {
        b.geo("lamp", K.sphereGeo(), {
          x: (x0 + x1) / 2,
          y: BY + HH - 0.25,
          z: HZ0 + 1.3,
          s: 0.07,
          tint: [1, 0.85, 0.55],
        });
        b.glow((x0 + x1) / 2, BY + HH - 0.3, HZ0 + 1.3, [0.6, 0.45, 0.25], 0.8);
      }
      if (open) {
        K.pickup(ctx, "gold_bar", 1, x0 + 1.3, BY + 0.14, HZ0 + 1.1, 0.2);
        if (i === 5)
          K.pickup(ctx, "gold_bar", 1, x0 + 1.9, BY + 0.14, HZ0 + 1.5, 1.1);
      }
    }
    // the COG door on the west wall: frame, the round Mosler door, bolts, wheel, hinge, warning stencils
    const VX = HX0 + 0.12,
      VZ = -41,
      VY = BY + 1.9,
      RO = 1.45; // portal centre, opening radius
    // round portal through the 0.6 m wall: steel collars on both faces, a steel-lined bore and a raised sill
    K.ringCollar(b, "steel", HX0 + 0.11, VY, VZ, 1, 0, RO, 2.45, {
      tint: [0.42, 0.43, 0.44],
      bolts: 16,
    });
    K.ringCollar(b, "vault_steel", HX0 + 0.13, VY, VZ, 1, 0, RO, RO + 0.22, {
      tint: [0.7, 0.72, 0.72],
    });
    K.ringCollar(b, "steel", -12.71, VY, VZ, -1, 0, RO, 2.45, {
      tint: [0.42, 0.43, 0.44],
      bolts: 12,
    });
    for (let k = 0; k < 24; k++) {
      const a0 = (k / 24) * PI * 2,
        a1 = ((k + 1) / 24) * PI * 2,
        am = (a0 + a1) / 2;
      const P = (x, a) => [x, VY + Math.sin(a) * RO, VZ + Math.cos(a) * RO];
      b.quadN(
        "vault_steel",
        P(-12.7, a0),
        P(-11.9, a0),
        P(-11.9, a1),
        P(-12.7, a1),
        [0, -Math.sin(am), -Math.cos(am)],
        { tint: [0.55, 0.57, 0.58] },
      );
    }
    b.boxMM("steel", -12.72, BY, VZ - 1.2, -11.88, VY - RO + 0.02, VZ + 1.2, {
      tint: [0.5, 0.5, 0.5],
      faces: "nsewt",
    });
    b.col(-12.72, BY - 0.3, VZ - 1.5, -11.88, BY, VZ + 1.5, {
      tag: "floor",
      surface: "metal",
    });
    b.col(-12.72, BY, VZ - 1.2, -11.88, VY - RO + 0.02, VZ + 1.2, {
      tag: "floor",
      surface: "metal",
    });
    b.plate(
      "art",
      VX + 0.02,
      BY + 4.0,
      VZ,
      1,
      0,
      3.6,
      0.35,
      K.signCell(
        "fh_cog_st",
        "CONTINUITY ARCHIVE 7 · U.S. GOVERNMENT · AUTHORIZED ACCESS ONLY",
        768,
        64,
        { bg: "#c8a830", fg: "#141414", font: "Arial Black, sans-serif" },
      ),
      { off: 0.02 },
    );
    b.light(VX + 2.2, BY + 3.4, VZ, [1, 0.9, 0.7], 0.7, 7, { box: BASE_BOX });
    for (const s of [-1, 1])
      for (let k = 0; k < 4; k++)
        b.box(
          "paint_yellow",
          VX + 0.9 + k * 0.5,
          BY + 0.005,
          VZ + s * 1.9,
          0.25,
          0.004,
          0.5,
          { yaw: 0.6 * s, tint: [0.85, 0.7, 0.2] },
        );
    b.geo("lamp", K.sphereGeo(), {
      x: VX + 0.2,
      y: BY + 3.7,
      z: VZ - 2.6,
      s: 0.1,
      tint: [1, 0.2, 0.1],
    });
    b.glow(VX + 0.3, BY + 3.7, VZ - 2.6, [0.8, 0.12, 0.06], 1.3);
    b.light(VX + 1.2, BY + 3.2, VZ - 2, [1, 0.25, 0.12], 0.9, 6, {
      box: BASE_BOX,
    });
    // the dead Iron Covenant squad in the hall (the reason Halloran is alone)
    K.skel(ctx, 4, BY, -39.5, 1.9, "lying");
    K.skel(ctx, 10.5, BY, -41.5, -0.7, "reaching");
    K.loot(ctx, "crate", 12.5, BY, -38.6, 0.3, {
      kind: "military",
      loot: "covenant_crate",
      name: "Covenant Field Crate",
    });
    b.hplate(
      "decal",
      4.2,
      BY + 0.012,
      -39.6,
      2.4,
      1.8,
      0.4,
      K.decal("blood", 12),
    );
    b.hplate(
      "decal",
      10.4,
      BY + 0.013,
      -41.4,
      2,
      1.8,
      1.2,
      K.decal("scorch", 13),
    );
    for (let k = 0; k < 4; k++)
      K.lamp(
        b,
        -6 + k * 7.5,
        BY + 3.6,
        -39,
        "cage",
        k === 2 ? [1, 0.3, 0.2] : bulb,
        k === 1 ? 0 : 0.7,
        8,
        { ceil: BY + HH, dead: k === 1, lightOpts: { box: BASE_BOX } },
      );
    K.litter(b, HX0 + 0.5, CZ + 0.4, HX1 - 0.5, HZ1 - 0.5, BY, 26, 105);
    K.clutter(b, HX0 + 1, CZ + 0.3, HX1 - 1, HZ1, BY, {
      n: 16,
      seed: 5103,
      kinds: ["debris", "paper", "can", "glass", "box"],
      avoid: [
        [-12, -43, -7.5, -38],
        [-7, -36.8, -5, -35.5],
        [20.5, -39, 22.5, -36],
      ],
    });
    // the siege line: the delegation's scrap barricade across the east end, facing the assay office
    for (let k = 0; k < 4; k++)
      b.box(
        k % 2 ? "corrugated" : "rust",
        14.6 + (k % 2) * 0.1,
        BY,
        -44 + k * 1.3,
        0.08,
        1.3 + (k % 3) * 0.2,
        1.3,
        { yaw: 0.05 * k, tint: [0.55, 0.42, 0.32] },
      );
    b.col(14.5, BY, -44.7, 14.8, BY + 1.3, -39.4, { tag: "wall" });

    // ================================================= ASSAY OFFICE (Halloran's holdout)
    const AX0 = -10,
      AX1 = -2,
      AZ0 = -36,
      AZ1 = -28;
    K.room(b, ctx, {
      x0: AX0,
      z0: AZ0,
      x1: AX1,
      z1: AZ1,
      y: BY,
      h: 3.4,
      floor: "terrazzo",
      fc: [0.55, 0.53, 0.5],
      wall: "plaster",
      wc: [0.6, 0.62, 0.58],
      wain: "wood_dark",
      wainC: [0.35, 0.26, 0.18],
      wainH: 1.0,
      ceil: "plaster",
      cc: [0.45, 0.45, 0.42],
      surface: "concrete",
    });
    const ABOX = [
      AX0 - 0.2,
      BY - 0.2,
      AZ0 - 0.2,
      AX1 + 0.2,
      BY + 3.6,
      AZ1 + 0.2,
    ];
    K.table(b, -8.6, BY, -30.2, 2.2, 0.9, { mat: "oak", yaw: HP });
    for (let k = 0; k < 2; k++) {
      b.cyl("brass", -8.6, BY + 0.76, -30.8 + k * 1.2, 0.18, 0.18, 0.02, 10);
      b.pipe(
        "brass",
        -8.6,
        BY + 0.76,
        -30.8 + k * 1.2,
        -8.6,
        BY + 1.1,
        -30.8 + k * 1.2,
        0.01,
        3,
      );
    }
    b.plate(
      "art",
      AX1 - 0.12,
      BY + 1.9,
      -31,
      -1,
      0,
      1.6,
      1.1,
      K.signCell(
        "fh_map",
        "LOWER MANHATTAN\n× CONGRESS\n× NAVY YARD →",
        256,
        176,
        {
          bg: "#d8ccaa",
          fg: "#3a2a1a",
          font: "Georgia, serif",
          border: "#6a2a1a",
        },
      ),
    );
    b.boxMM("metal_dark", -3.2, BY, -29.2, -2.2, BY + 0.9, -28.4, {
      tint: [0.35, 0.38, 0.3],
    }); // field radio
    b.plate("lamp", -2.7, BY + 0.7, -29.21, 0, -1, 0.3, 0.08, null, {
      tint: [0.3, 1, 0.3],
    });
    b.glow(-2.7, BY + 0.7, -29.3, [0.2, 0.7, 0.2], 0.4);
    K.lamp(b, -6, BY + 2.9, -32, "bulb", [1, 0.85, 0.65], 0.8, 7, {
      ceil: BY + 3.4,
      lightOpts: { box: ABOX },
    });
    b.light(-6, BY + 1.5, -35, [0.5, 0.6, 1.0], 0.3, 4, { box: ABOX }); // glow of a spare rig battery
    b.col(-9.9, BY, -29.2, -9.0, BY + 1.1, -28.1, { tag: "furniture" });

    // ================================================= COG ARCHIVE 7 (behind the Mosler door)
    const RX0 = -26,
      RX1 = -12.6,
      RZ0 = -48,
      RZ1 = -34,
      RH = 4.4;
    K.room(b, ctx, {
      x0: RX0,
      z0: RZ0,
      x1: RX1,
      z1: RZ1,
      y: BY,
      h: RH,
      floor: "tile",
      fc: [0.55, 0.57, 0.56],
      wall: "metal",
      wc: [0.55, 0.58, 0.56],
      ceil: "metal_dark",
      cc: [0.35, 0.36, 0.36],
      surface: "metal",
      trim: false,
    });
    const RBOX = [
      RX0 - 0.2,
      BY - 0.2,
      RZ0 - 0.2,
      RX1 + 0.2,
      BY + RH + 0.2,
      RZ1 + 0.2,
    ];
    b.light(RX1 - 1.5, BY + 3, VZ, [0.8, 0.9, 1], 0.5, 5, { box: RBOX });
    // mainframe tape banks in rows
    const reels = K.paint(
      "art",
      "fh_reels",
      128,
      192,
      function (x, X, Y, W, H) {
        x.fillStyle = "#c8c0a8";
        x.fillRect(X, Y, W, H);
        x.fillStyle = "#2a2a2a";
        x.fillRect(X + 8, Y + 8, W - 16, H * 0.55);
        for (const cy of [0.18, 0.44]) {
          x.fillStyle = "#6a6660";
          x.beginPath();
          x.arc(X + W / 2, Y + H * cy, W * 0.26, 0, PI * 2);
          x.fill();
          x.fillStyle = "#1a1a1a";
          x.beginPath();
          x.arc(X + W / 2, Y + H * cy, W * 0.2, 0, PI * 2);
          x.fill();
          x.fillStyle = "#8a8680";
          x.beginPath();
          x.arc(X + W / 2, Y + H * cy, W * 0.06, 0, PI * 2);
          x.fill();
        }
        for (let k = 0; k < 8; k++) {
          x.fillStyle = k % 3 ? "#a82a1a" : "#d8a030";
          x.fillRect(
            X + 12 + (k % 4) * 26,
            Y + H * 0.7 + Math.floor(k / 4) * 16,
            12,
            8,
          );
        }
        K.stains(x, X, Y, W, H, 5, 131, 0.3, [60, 50, 30]);
      },
    );
    for (let row = 0; row < 2; row++) {
      const z = row ? -44.5 : -37.5;
      for (let k = 0; k < 6; k++) {
        const x = RX0 + 1.4 + k * 1.05;
        b.box("metal", x, BY, z, 1.0, 2.1, 0.7, { tint: [0.7, 0.68, 0.6] });
        b.plate(
          "art",
          x,
          BY + 1.2,
          z + (row ? 0.36 : -0.36),
          0,
          row ? 1 : -1,
          0.9,
          1.6,
          reels,
          { off: 0.01 },
        );
      }
      b.col(
        RX0 + 0.85,
        BY,
        z - 0.35,
        RX0 + 1.95 + 5 * 1.05,
        BY + 2.1,
        z + 0.35,
        { tag: "furniture", surface: "metal" },
      );
    }
    // the core pedestal (centre of the east half) under a cold lamp; the core itself is a separate mesh
    const CPX = -16.5,
      CPZ = -41;
    b.cyl("steel", CPX, BY, CPZ, 0.55, 0.45, 1.0, 12, {
      tint: [0.4, 0.42, 0.44],
    });
    b.cyl("lamp", CPX, BY + 1.0, CPZ, 0.46, 0.46, 0.02, 12, {
      tint: [0.3, 0.6, 0.9],
    });
    b.col(CPX - 0.5, BY, CPZ - 0.5, CPX + 0.5, BY + 1.0, CPZ + 0.5, {
      tag: "furniture",
    });
    b.light(CPX, BY + 3.2, CPZ, [0.6, 0.75, 1], 1.0, 8, { box: RBOX });
    b.glow(CPX, BY + 1.1, CPZ, [0.2, 0.4, 0.7], 1.6);
    for (let k = 0; k < 3; k++)
      K.lamp(
        b,
        -24 + k * 4.5,
        BY + 3.9,
        -41,
        "tube",
        [0.85, 0.95, 1],
        k === 1 ? 0.8 : 0.5,
        7,
        {
          ceil: BY + RH,
          alongX: false,
          len: 1.2,
          dead: k === 2,
          lightOpts: { box: RBOX },
        },
      );
    // seal on the floor, an Office of Continuity Services poster, the custodian
    b.hplate(
      "decal",
      -20,
      BY + 0.012,
      -41,
      3.4,
      3.4,
      0,
      K.medallion("seal", 256),
    );
    b.plate(
      "art",
      RX0 + 0.12,
      BY + 2.2,
      -41,
      1,
      0,
      1.4,
      1.9,
      K.signCell(
        "fh_ocs",
        'OFFICE OF\nCONTINUITY\nSERVICES\n\n"The Republic,\npreserved."',
        192,
        256,
        { bg: "#5a1e1e", fg: "#efe6cf", font: "Arial Black, sans-serif" },
      ),
    );
    K.skel(ctx, -19.4, BY, -46.6, 0.3, "sitting");
    b.hplate(
      "decal",
      -19.2,
      BY + 0.012,
      -46.2,
      1.4,
      1.2,
      0.2,
      K.decal("grime", 14),
    );
    b.boxMM("steel", -22.5, BY, -34.14, -21.5, BY + 2.2, -34.1, {
      tint: [0.4, 0.42, 0.4],
    });
    b.plate(
      "art",
      -22,
      BY + 2.5,
      -34.1,
      0,
      -1,
      1.2,
      0.3,
      K.signCell("fh_svc2", "SERVICE STAIR · EXHIBIT HALL ▲", 256, 64, {
        bg: "#2a2a28",
        fg: "#e8e0c8",
        font: "Arial Black, sans-serif",
      }),
      { off: 0.01 },
    );

    // ================================================= the core (separate mesh, hidden once taken)
    const cb = K.builder({
      name: "fh_core",
      off: O,
      lit: true,
      amb: [0.4, 0.45, 0.55],
      floors: [BY],
    });
    cb.box("metal_dark", CPX, BY + 1.02, CPZ, 0.5, 0.32, 0.36, {
      tint: [0.4, 0.42, 0.4],
      faces: "nsewtb",
    });
    cb.box("paint_yellow", CPX, BY + 1.18, CPZ, 0.52, 0.04, 0.38, {
      tint: [0.8, 0.65, 0.2],
    });
    cb.plate("lamp", CPX, BY + 1.2, CPZ - 0.185, 0, -1, 0.3, 0.06, null, {
      tint: [0.3, 0.8, 1],
    });
    ctx.coreMesh = cb.finish(null);

    // ================================================= the Mosler door (hinged mesh, hinge at the south edge)
    const DR = 1.75,
      DT = 0.42;
    const db = K.builder({
      name: "fh_vdoor",
      off: { x: 0, y: 0, z: 0 },
      lit: true,
      amb: [0.1, 0.1, 0.11],
      floors: [0],
      grime: 0.3,
    });
    const dz = -DR - 0.08; // disc centre relative to the hinge
    db.geo("vault_steel", K.unitCyl(32), {
      x: DT / 2,
      y: 0,
      z: dz,
      rz: HP,
      sx: DR,
      sy: DT,
      sz: DR,
      tint: [0.74, 0.76, 0.76],
    });
    db.geo("steel", new THREE.TorusGeometry(DR - 0.2, 0.06, 6, 32), {
      x: DT + 0.02,
      y: 0,
      z: dz,
      ry: HP,
      tint: [0.5, 0.52, 0.54],
    });
    for (let k = 0; k < 12; k++) {
      const a = (k / 12) * PI * 2;
      db.geo("steel", K.unitCyl(8), {
        x: DT / 2,
        y: Math.sin(a) * (DR - 0.1),
        z: dz + Math.cos(a) * (DR - 0.1),
        rz: HP,
        sx: 0.09,
        sy: DT + 0.25,
        sz: 0.09,
        tint: [0.62, 0.64, 0.66],
      });
    }
    db.geo("brass", K.unitCyl(16), {
      x: DT + 0.06,
      y: 0,
      z: dz,
      rz: HP,
      sx: 0.3,
      sy: 0.12,
      sz: 0.3,
      tint: [0.85, 0.7, 0.42],
    });
    for (let k = 0; k < 3; k++) {
      const a = (k / 3) * PI * 2 + 0.3;
      db.pipe(
        "steel",
        DT + 0.14,
        0,
        dz,
        DT + 0.14,
        Math.sin(a) * 0.8,
        dz + Math.cos(a) * 0.8,
        0.04,
        5,
        { tint: [0.55, 0.55, 0.57] },
      );
      db.geo("steel", K.sphereGeo(), {
        x: DT + 0.14,
        y: Math.sin(a) * 0.83,
        z: dz + Math.cos(a) * 0.83,
        s: 0.07,
      });
    }
    db.box("steel", DT / 2, -0.7, -0.05, 0.5, 1.4, 0.35, {
      tint: [0.4, 0.4, 0.42],
      faces: "nsewtb",
    }); // hinge block
    db.plate(
      "art",
      DT + 0.01,
      0.95,
      dz,
      1,
      0,
      1.2,
      0.2,
      K.signCell("fh_mosler", "MOSLER SAFE CO.", 256, 44, {
        bg: "#2a2a28",
        fg: "#d8c890",
        font: "Georgia, serif",
      }),
      { off: 0.005 },
    );
    db.light(1.6, 1.2, dz, [1, 0.92, 0.75], 0.9, 5);
    ctx.fhDoor = db.finish(null);
    ctx.fhDoor.position.set(O.x + HX0 + 0.13, O.y + VY, O.z + VZ + DR + 0.08);
    ctx.fhDoor.matrixAutoUpdate = true;
    ctx.fhDoorCol = null;
    ctx.fhDoorOpenCol = null;
    ctx.fhDoorGeo = { hx: O.x + HX0, z0: O.z + VZ, y: O.y + BY, DR };

    // ================================================= doors, interactables, anchors
    const OX = O.x,
      OY = O.y,
      OZ = O.z;
    const disc = () => K.safe("disc", () => G.discover("federal_hall"));
    K.door(ctx, {
      id: "pf3_fh_in",
      pos: PV.fh.door.clone(),
      label: "Federal Hall",
      verb: "Enter",
      target: { x: OX, y: OY, z: OZ - 1.6, yaw: 0 },
      onEnter: disc,
    });
    K.door(ctx, {
      id: "pf3_fh_out",
      pos: new THREE.Vector3(OX, OY + 1.3, OZ - 0.35),
      label: "Wall Street",
      verb: "Leave",
      target: { x: PV.fh.XC, y: PV.fh.PODIUM, z: PV.fh.CELLA_Z - 2.2, yaw: 0 },
    });
    const openVault = () => {
      PV.setFlag("fh_vault_open", true);
      K.sfx("cryo_door", new THREE.Vector3(OX + HX0, OY + VY, OZ + VZ), {
        volume: 1,
      });
      K.notify(
        "The bolts draw back one by one. The Mosler door swings open on its hinge.",
      );
      if (K.q.active("pf3_cog") && K.q.stage("pf3_cog") === "key")
        K.q.set("pf3_cog", "core");
    };
    ctx.interactables.push(
      G.world.addInteractable({
        pos: new THREE.Vector3(OX + HX0 + 0.8, OY + BY + 1.4, OZ + VZ),
        radius: 1.6,
        label: "Continuity Archive 7",
        verb: "Open",
        priority: 2,
        enabled: () => !PV.flag("fh_vault_open"),
        locked: () =>
          K.has("pf3_fh_archive_key") || K.lockIsOpen(FH_LOCKS.archive.id)
            ? null
            : "Locked — key or combination",
        onInteract: () => {
          if (PV.flag("fh_vault_open")) return;
          // Voss's key opens it outright; otherwise the Mosler dial takes Ames's six-digit combination
          K.lockOpen(FH_LOCKS.archive, openVault);
        },
      }),
    );
    // the Sub-Treasury loading door (back of the podium, Beaver Street) ↔ the stair room at vault level
    if (PV.fh.loading) {
      K.door(ctx, {
        id: "pf3_fh_loading_in",
        pos: PV.fh.loading.clone(),
        label: "Sub-Treasury Loading Door",
        verb: "Enter",
        lock: FH_LOCKS.loading,
        sound: "door_open",
        target: { x: OX + 25.4, y: OY + BY, z: OZ - 37.8, yaw: HP },
        onEnter: disc,
      });
      K.door(ctx, {
        id: "pf3_fh_loading_out",
        pos: new THREE.Vector3(OX + 26.7, OY + BY + 1.2, OZ - 37.8),
        radius: 1.1,
        label: "Loading Door — Beaver Street",
        verb: "Leave",
        target: { x: PV.fh.loading.x, y: 0, z: PV.fh.loading.z + 0.9, yaw: PI },
      });
    }
    // one-way service stair from the archive up to the exhibit wing (barred on the exhibit side)
    K.oneWay(ctx, {
      flag: "fh_service_stair",
      open: {
        pos: new THREE.Vector3(OX - 22, OY + BY + 1.2, OZ - 34.3),
        label: "Service Stair — Exhibit Hall",
        verb: "Climb",
        target: { x: OX - 22, y: OY, z: OZ - 25.6, yaw: PI },
        msg: "You slide the bolt on the service door. A shortcut back to the archive.",
      },
      barred: {
        pos: new THREE.Vector3(OX - 22, OY + 1.2, OZ - 26.8),
        label: "Service Door — Sub-Treasury",
        verb: "Descend",
        target: { x: OX - 22, y: OY + BY, z: OZ - 35.4, yaw: 0 },
        msg: "The steel service door is bolted from below.",
      },
    });
    ctx.interactables.push(
      G.world.addInteractable({
        pos: new THREE.Vector3(OX + CPX, OY + BY + 1.15, OZ + CPZ),
        radius: 0.6,
        label: "COG Archive Core",
        verb: "Take",
        priority: 2,
        enabled: () => !PV.flag("fh_core_taken"),
        onInteract: () => {
          PV.setFlag("fh_core_taken", true);
          K.give("pf3_cog_core", 1);
          K.sfx("pickup", new THREE.Vector3(OX + CPX, OY + BY + 1.1, OZ + CPZ));
          // the cradle prints the core's last priority traffic as it releases (mq22: Marsh's 4 March memo; full text on the teletype)
          K.notify(
            'As the cradle lets go, the node teletype chatters out the core\'s last priority traffic. "MOVE THE ROLLS AND ENROLLED STAFF TO LIBERTY TONIGHT. NO PUBLIC NOTICE. PROTECT THE SOURCE. M." It is dated Saturday, the fourth of March, 1967.',
          );
          if (K.q.active("pf3_cog")) K.q.set("pf3_cog", "return");
        },
      }),
    );
    K.anchor(ctx, "entrance", 0, 0, -1.6);
    K.anchor(ctx, "throne", 0, 0, -30.2);
    K.anchor(ctx, "boss", 17.5, BY, -39); // combat's gang boss: the Whip, leading the delegation downstairs
    K.anchor(ctx, "sgt", 2.6, 0, -4.8);
    [
      [-2.2, 0, -18.6],
      [2.4, 0, -17.2],
      [-4.2, 0, -20.2],
      [4.4, 0, -19.4],
      [15.2, 0, -23.6],
      [23.4, 0, -13.8],
    ].forEach((p, i) => K.anchor(ctx, "rep" + (i + 1), p[0], p[1], p[2]));
    K.anchor(ctx, "halloran", -6, BY, -31.2);
    K.anchor(ctx, "page1", 3, BY, -38.6);
    K.anchor(ctx, "page2", -7.5, BY, -41.5);
    K.anchor(ctx, "vault_door", VX + 1, BY, VZ);
    K.anchor(ctx, "core", CPX, BY + 1, CPZ);
    [
      [24.5, BY, -37.6],
      [16, BY, -40.2],
      [9, BY, -38.4],
      [19.5, BY, -41.5],
      [12.5, BY, -41.2],
      [5.5, BY, -41],
    ].forEach((p, i) => K.anchor(ctx, "spawn" + (i + 1), p[0], p[1], p[2]));
    K.anchor(ctx, "loot1", 26.3, 0, -24.5);
    K.anchor(ctx, "loot2", -8.6, BY, -32);
    K.anchor(ctx, "loot3", -23, BY, -46.8);

    ctx.intRoot = b.finish(null);
    ctx.intRoot.name = "poi_federal_hall_int";
    ctx.intRoot.add(ctx.coreMesh);

    // ---- containers / props (spawned on newGame) ----
    K.loot(ctx, "mattress", 24.5, 0, -12.6, 0);
    K.loot(ctx, "mattress", 26.3, 0, -15.5, HP);
    K.loot(ctx, "mattress", 22, 0, -15.8, 0.1);
    K.loot(ctx, "mattress", -9.5, 0, -25.5, 0.6);
    K.loot(ctx, "mattress", 9.8, 0, -13.8, -0.5);
    K.loot(ctx, "footlocker", 26.9, 0, -12.3, -HP, {
      loot: "raider_stash",
      name: "Backbencher's Footlocker",
    });
    K.loot(ctx, "ammo_box", 26.2, 0, -22.0, -HP, {
      large: true,
      loot: "ammo_box",
      name: "Congress Armoury",
    });
    K.loot(ctx, "ammo_box", 26.2, 0, -25.8, -HP, { loot: "ammo_box" });
    K.loot(ctx, "workbench", 13.2, 0, -21.5, HP);
    K.loot(ctx, "first_aid", 12.2, 1.4, -23.8, HP, { loot: "first_aid" });
    K.loot(ctx, "campfire", 3.5, 0, -16.5, 0, { spit: true });
    K.loot(ctx, "barrel", -6.5, 0, -24.5, 0, { burning: true });
    K.loot(ctx, "barrel", 6.5, 0, -11.5, 0, { burning: true });
    K.loot(ctx, "barrel", 24, 0, -13, 0, { burning: true });
    K.loot(ctx, "safe", 1.7, 0.45, -34.1, 0, {
      loot: "safe",
      lock: FH_LOCKS.strongbox,
      name: "Speaker's Strongbox",
    });
    K.loot(ctx, "sandbags", -8.7, BY, -34.2, 0, { low: true });
    K.loot(ctx, "crate", -3.1, BY, -35.2, 0.1, {
      kind: "military",
      loot: "covenant_crate",
      name: "Covenant Supply Crate",
    });
    K.loot(ctx, "footlocker", 2.6, BY, HZ0 + 1.2, 0, {
      loot: "footlocker",
      name: "Sub-Treasury Locker",
      lock: FH_LOCKS.locker,
    });
    K.scrawlAt(
      K.world(ctx, 2.6, BY + 1.5, HZ0 + 0.25),
      "Stencil on the Gold Cage",
      "GUARD LOCKER · COMB. 7140 · CHANGE QUARTERLY (nobody did).",
      FH_LOCKS.locker.id,
    );
    K.loot(ctx, "crate", 13.7, BY, HZ0 + 1.2, 0, {
      kind: "plain",
      loot: "junk_valuable",
      name: "Assay Crate",
    });
    K.loot(ctx, "file_cabinet", RX0 + 0.5, BY, -35.2, HP, {
      loot: "file_cabinet",
      name: "Archive Index",
    });
    K.loot(ctx, "safe", -13.4, BY, -47.3, 0, {
      loot: "safe",
      lock: FH_LOCKS.safe,
      name: "Custodian's Safe",
    });
    K.skel(ctx, -24.8, BY, -39.5, 1.2, "lying");
    K.terminal(ctx, "pf3_term_cog", -19.4, BY, -47.1, 0, termCog(), "own_desk");
    K.terminal(
      ctx,
      "pf3_term_kiosk",
      -13.2,
      0,
      -12.2,
      -2.36,
      termKiosk(),
      "own_desk",
    );
    K.note(ctx, "pf3_reel_ruiz", 10.3, BY + 0.03, -41.1, {
      type: "tape",
      name: "Tape reel: Acolyte Quintero's Field Log",
      title: "Iron Covenant — Field Log, Acolyte E. Quintero",
      learn: FH_LOCKS.loading.id,
      text: 'Day three in the Sub-Treasury. We came in by the Beaver Street loading door; Ames punched 1-8-6-2 on the keypad, the year this place became the Sub-Treasury, and was very pleased with herself. Halloran\'s leg is bad. The Congress sends a "delegation" down the stairs every hour or so. We send them back up in smaller pieces.\n\nAmes says the archive core is behind the round door. Voss has the key. Voss has a lot of things, including, as of this morning, my helmet.\n\nIf this reaches the Neon: Mama, I am not sorry I joined. I am sorry about the dog. Tell Lucky I said the thing.',
    });
    K.note(ctx, "pf3_note_voss", 1.3, 0.48, -33.2, {
      name: "Order of Business (scrawled)",
      title: "Order of Business",
      text: "1. Call to order (hit table with gavel)\n2. Minutes of last session (Skeeter ate them)\n3. Old business: the tin man in the basement. Motion to starve him out. PASSED.\n4. New business: Wall Street tax. Everybody who walks past pays. Everybody who don't walk past ALSO pays.\n5. The Speaker's hat (new) — PASSED unanimous\n6. Adjourn to lunch (see item 3 on last week's list)\n7. Tax box: Skeeter keeps forgetting the combo. Chalk it up where he can see it. PASSED\n8. Speaker's strongbox combo changed to 4419. Anybody reads this out loud gets tabled.",
      learn: FH_LOCKS.strongbox.id,
    });
    K.note(ctx, "pf3_note_ames", 4.5, BY + 0.03, -38.9, {
      name: "Archivist Ames's Notebook",
      title: "Field Notebook — Archivist R. Ames, Iron Covenant",
      learn: FH_LOCKS.archive.id,
      text: 'The memo is a Continuity relocation order, Eastern Seaboard. Node 7 is the Sub-Treasury. The node door is a Mosler: key OR dial combination, and the custodians were told to set the dial to "the date the Republic began."\n\nNot July 4. They meant the government, not the country. The oath: April 30, 1789.\n\nDIAL: 0-4-3-0-8-9\n\nVoss has the key round his neck. I am not asking Voss for anything. We go in tonight.',
    });
    K.note(ctx, "pf3_note_pryce", -18.7, BY + 0.03, -46.2, {
      name: "Custodian's Desk Blotter",
      title: "Desk blotter — H. Pryce, Node Custodian",
      learn: FH_LOCKS.term.id,
      text: "Doodles of the Mosler door. A phone number for a dentist on Pine Street. A list: milk, film, Ellie's present.\n\nIn the corner, boxed twice in red pencil: NODE TELETYPE — PALISADE. (Changed per Security, 02.26.67. Do NOT tape to the machine again.)",
    });
    K.note(ctx, "pf3_note_nps", -2.6, 1.08, -4.4, {
      name: "NPS Visitor Leaflet",
      title: "Federal Hall National Memorial — Visitor Information",
      text: "Welcome to Federal Hall! On this site stood New York's City Hall, where the First Congress met, the Bill of Rights was drafted, and George Washington took the oath of office on April 30, 1789.\n\nThe present building (1842) served as the U.S. Custom House and later the Sub-Treasury, whose vaults once held millions in gold beneath your feet.\n\nPlease do not touch the exhibits. In the event of a nuclear alert, visitors should proceed calmly to the Wall Street Station civil-defense shelter.",
    });
  };

  function termCog() {
    return {
      title: "CONTINUITY ARCHIVE 7",
      header:
        "UNITED STATES GOVERNMENT — CONTINUITY OF GOVERNMENT PROGRAM\nARCHIVE NODE 7 (NEW YORK SUB-TREASURY)\nWARNING: UNAUTHORIZED ACCESS IS A FEDERAL CRIME",
      lock: FH_LOCKS.term,
      entries: [
        {
          title: "Archive Status",
          text: "CORE: SEALED (ARCHIVE 7)\nCONTENTS: 214 program files, 1,406 personnel dossiers, 3 schematics sets flagged CONTINUITY-EYES-ONLY\nLAST SYNC: 03.05.1967 09:41\nNEXT SYNC: ———\n\nRETRIEVAL TEAM ETA: overdue by 8,037 days",
        },
        {
          title: "Memo: Relocation (03.04.67)",
          text: "FROM: Office of the Secretary (Continuity)\nTO: Node custodians, Eastern Seaboard\n\nIn the event of a Condition Red, custodians are to seal their node and await a retrieval team from Mount Weather. Custodians are NOT to evacuate to public shelters. Your family's placement in a Project Long Winter cryo facility has been arranged separately.\n\nThe Republic thanks you.",
        },
        {
          title: "Priority Traffic (04.03.67, 18:10)",
          text: () => {
            PV.setFlag("fh_memo_read", true);
            K.setQFlag("ms_memo_read", true);
            return PV.MARSH_MEMO;
          },
        },
        {
          title: "Custodian Log — H. Pryce",
          text: 'Sealed the door at 09:44. The retrieval team is not coming. I heard the helicopter go over and keep going.\n\nMy "placement" was Cryo Unit C-11. I checked the Long Winter roster on the node. Long Winter is one small trial with ninety-day volunteers. There is no Unit C-11. There never was. It was a story to keep the custodians at their posts.\n\nThe safe is set to 0-6-1-2, Ellie\'s birthday. I am writing it here so that somebody, someday, remembers her birthday.\n\nI am going to sit with the files. Somebody should.',
          learn: FH_LOCKS.safe.id,
        },
        {
          title: "Core Eject",
          text: "The core cradle unlocks with a hiss. The status lamp goes from red to green.",
          action: () => {
            K.notify("The archive core cradle unlocks.");
          },
        },
      ],
    };
  }
  function termKiosk() {
    return {
      title: "EXHIBIT KIOSK",
      header:
        'NATIONAL PARK SERVICE — INTERACTIVE HISTORY STATION\n"Birth of the Republic"',
      entries: [
        {
          title: "The First Congress (1789)",
          text: 'The First Congress of the United States met here in Federal Hall. It wrote the Bill of Rights, established the federal courts and argued, at great length, about what to call the President. "His Highness" was proposed. It did not pass.',
        },
        {
          title: "The Oath of Office",
          text: "On April 30, 1789, George Washington took the oath of office on the balcony overlooking Wall Street, his hand on a Bible borrowed from a nearby Masonic lodge. The crowd cheered. Washington, a nervous public speaker, then went inside and gave a very quiet speech.",
        },
        {
          title: "The Sub-Treasury",
          text: "From 1862 to 1920 this building was the U.S. Sub-Treasury. At times it held more gold than any building in the world. The vaults are closed to the public. Please stop asking the rangers about the vaults.",
        },
        {
          title: "Visitor Survey (1967)",
          text: "Q: How would you rate your visit? — A: The robot guide keeps telling me the Russians are coming. — Q: Would you recommend us to a friend? — A: If they are still alive after Tuesday.",
        },
      ],
    };
  }

  // The Mosler door: swing toward its target (flag), keep the closed / open colliders in step
  const FH_OPEN = -1.62;
  function fhDoorCols(ctx, open) {
    const g = ctx.fhDoorGeo;
    if (!g) return;
    if (!open && !ctx.fhDoorCol)
      ctx.fhDoorCol = G.world.addBox(
        g.hx - 0.1,
        g.y,
        g.z0 - 1.9,
        g.hx + 0.6,
        g.y + 3.9,
        g.z0 + 1.9,
        { tag: "poi_fidi3", surface: "metal", walkable: false },
      );
    if (open && ctx.fhDoorCol) {
      K.safe("rmcol", () => G.world.removeCollider(ctx.fhDoorCol));
      ctx.fhDoorCol = null;
    }
    if (open && !ctx.fhDoorOpenCol)
      ctx.fhDoorOpenCol = G.world.addBox(
        g.hx,
        g.y,
        g.z0 + g.DR - 0.05,
        g.hx + 2 * g.DR + 0.3,
        g.y + 3.9,
        g.z0 + g.DR + 0.6,
        { tag: "poi_fidi3", surface: "metal", walkable: false },
      );
    if (!open && ctx.fhDoorOpenCol) {
      K.safe("rmcol", () => G.world.removeCollider(ctx.fhDoorOpenCol));
      ctx.fhDoorOpenCol = null;
    }
  }
  PV.fhDoorUpdate = function (ctx, realDt) {
    const d = ctx.fhDoor;
    if (!d) return;
    if (!d.parent && ctx.intRoot) ctx.intRoot.add(d);
    const open = !!PV.flag("fh_vault_open"),
      target = open ? FH_OPEN : 0,
      cur = d.rotation.y;
    if (Math.abs(cur - target) > 1e-3) {
      if (!ctx.inside)
        d.rotation.y = target; // loads / resets snap
      else
        d.rotation.y =
          target < cur
            ? Math.max(target, cur - 0.45 * (realDt || 0.016))
            : Math.min(target, cur + 0.8 * (realDt || 0.016));
    }
    const shouldOpen = open && d.rotation.y < -0.35;
    if (shouldOpen !== !!ctx.fhDoorOpenCol || (!shouldOpen && !ctx.fhDoorCol))
      fhDoorCols(ctx, shouldOpen);
  };

  // Keep the core mesh parented to the interior root, visible only until taken
  PV.fhCoreUpdate = function (ctx) {
    if (!ctx.coreMesh) return;
    if (!ctx.coreMesh.parent && ctx.intRoot) ctx.intRoot.add(ctx.coreMesh);
    ctx.coreMesh.visible = !PV.flag("fh_core_taken");
  };
})();
