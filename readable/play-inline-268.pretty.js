/* src/poi_ues/40_armory.js */
/* =====================================================================
 * NEW RAD CITY — POI UPPER EAST SIDE · 40 Park Avenue Armory
 *                                            (Seventh Regiment Armory)
 *
 * EXTERIOR (site x 210..270, z -600..-540, Park Avenue on the west,
 *   Lexington on the east): the 1880 brick Gothic-Revival "castle" —
 *   granite base, a head house of red brick with stone string courses,
 *   paired arched windows, crenellated parapets, a tall central entrance
 *   tower with machicolations and corner bartizans over the great arched
 *   gateway, end towers, and behind it the vast Drill Hall: buttressed
 *   brick side walls with arched clerestory windows under the segmental
 *   balloon-truss roof (one bay fallen in). Occupied by "The Seventh",
 *   a mercenary company that calls itself a regiment: sandbags, scrap walls,
 *   a gate turret, banners, spray paint, a wrecked armoured car.
 * INTERIOR (cell 'park_ave_armory', origin 7800,0,400, lifted +5):
 *   Entrance Hall (grand stair, regimental colours) → the Drill Hall
 *   (80 × 68 m clear span, arched iron trusses, the Pit ring, shacks,
 *   container cover, the tank "Old Glory", reviewing balcony, command
 *   stage, the locked weapons cache) → NW stairwell down to the basement
 *   Rifle Range → armourer's lobby → stair up into the Veterans Room
 *   (carved dark wood, chain motif, mosaic hearth) → Entrance Hall.
 *   Upstairs: Board of Officers Room (Major Callahan — boss, and the
 *   stolen St. Francis), Company Room / polling place (the voting
 *   machine), reviewing balcony over the Drill Hall.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE || !G._ues) return;
  const P = G._ues,
    D = P.dress,
    A = P.arch;
  const PI = P.PI,
    HP = P.HP,
    TAU = P.TAU;
  const LIFT = 5;
  // cylinder (axis y, arc in x/z) → axis along x, arc in the y/z plane (y = R cosθ up, z = R sinθ)
  const PERM_X = new THREE.Matrix4().set(
    0,
    1,
    0,
    0,
    0,
    0,
    1,
    0,
    1,
    0,
    0,
    0,
    0,
    0,
    0,
    1,
  );

  // ===================================================================
  // EXTERIOR
  // ===================================================================
  function buildExterior() {
    const S = P.site("armory_ext", { grime: 0.6 });
    const b = S.b;
    const HX0 = 211,
      HX1 = 226,
      Z0 = -598,
      Z1 = -542; // head house
    const DX0 = 226,
      DX1 = 269,
      DZ0 = -596,
      DZ1 = -544; // drill hall
    const TZ0 = -575,
      TZ1 = -565; // central tower
    // ---------------- ground ----------------
    b.box("sidewalk", 210.1, 0, -599.9, 269.9, 0.05, -540.1, {
      segLen: 6,
      grime: 0.6,
    });
    // areaway railing along Park Avenue (gap at the gate)
    A.fence(
      S,
      [
        [210.5, Z0],
        [210.5, TZ0 - 1],
      ],
      0.05,
      { h: 1.2, step: 0.14 },
    );
    A.fence(
      S,
      [
        [210.5, TZ1 + 1],
        [210.5, Z1],
      ],
      0.05,
      { h: 1.2, step: 0.14, bent: 0.06 },
    );
    // ---------------- head house ----------------
    b.box("granite_dark", HX0, 0, Z0, HX1, 2.6, Z1, { segLen: 3 });
    b.box("brick_red", HX0, 2.6, Z0, HX1, 19, Z1, { segLen: 3 });
    S.col(HX0, 0, Z0, HX1, 19, Z1, { walkable: false });
    const FW = P.face(S, "w", Z0, Z1, HX0);
    FW.band("ashlar", 2.5, 2.9, 0, 0.3);
    for (const y of [8.6, 13.8]) FW.band("ashlar", y, y + 0.3, 0, 0.22);
    FW.band("ashlar", 18.2, 18.7, 0, 0.35);
    // corbelled machicolation band + crenellated parapet along the whole front
    for (let u = 0.3; u < FW.len - 0.2; u += 0.8)
      FW.box("brick_red", u - 0.18, u + 0.18, 18.7, 19.4, 0, 0.5, {
        seg: false,
      });
    FW.box("brick_red", 0, FW.len, 19.4, 20.4, 0, 0.55, { seg: false });
    for (let u = 0.4; u < FW.len; u += 1.6)
      FW.box("brick_red", u - 0.4, u + 0.4, 20.4, 21.4, 0, 0.55, {
        seg: false,
      });
    // paired arched windows, 3 storeys (skip the tower and the end towers)
    for (let u = 11; u < FW.len - 10; u += 3.4) {
      if (u > TZ0 - Z0 - 1.5 && u < TZ1 - Z0 + 1.5) continue;
      const rn = P.rng("armwin" + u);
      for (const [y, h] of [
        [3.6, 3.8],
        [9.4, 3.4],
        [14.5, 2.9],
      ]) {
        for (const s of [-0.62, 0.62])
          FW.window(u + s, y, 0.95, h, {
            arch: true,
            style: rn() < 0.3 ? "broken" : rn() < 0.2 ? "boarded" : "dark",
            frame: "iron",
            sill: "ashlar",
            mull: false,
          });
        FW.box("ashlar", u - 0.12, u + 0.12, y, y + h, 0, 0.12, { seg: false });
        FW.box(
          "ashlar",
          u - 1.45,
          u + 1.45,
          y + h + 0.05,
          y + h + 0.3,
          0,
          0.18,
          { seg: false },
        );
      }
    }
    // ground floor: slit windows in the granite (rifle loops)
    for (let u = 3; u < FW.len - 2; u += 2.6) {
      if (u > TZ0 - Z0 - 1 && u < TZ1 - Z0 + 1) continue;
      FW.box("paint_black", u - 0.1, u + 0.1, 0.8, 2.2, -0.01, 0.02, {
        seg: false,
        noAO: true,
      });
    }
    // central entrance tower (proud of the front)
    const TW = 8.5,
      TX0 = HX0 - 1.2;
    b.box("granite_dark", TX0, 0, TZ0, TX0 + TW, 3.2, TZ1, { seg: false });
    b.box("brick_red", TX0, 3.2, TZ0, TX0 + TW, 30, TZ1, { segLen: 3 });
    S.col(TX0, 0, TZ0, TX0 + TW, 30, TZ1, { walkable: false });
    const FT = P.face(S, "w", TZ0, TZ1, TX0);
    FT.band("ashlar", 3.1, 3.5, 0, 0.3);
    for (const y of [12.5, 20.5]) FT.band("ashlar", y, y + 0.35, 0, 0.25);
    // the great gateway arch + iron-bound doors
    FT.box("granite", 1.3, 8.7, 0, 3.4, 0, 0.5, { seg: false });
    FT.arch("granite", 5, 3.2, 2.4, 0.8, 0, 0.6);
    FT.box("granite_dark", 2.6, 7.4, 0, 3.2, -0.02, 0.01, { seg: false });
    FT.halfDisc("paint_black", 5, 3.2, 2.4, 0.01);
    FT.box("wood_dark", 2.8, 4.95, 0, 3.2, 0.02, 0.12, { seg: false });
    FT.box("wood_dark", 5.05, 7.2, 0, 3.2, 0.02, 0.12, { seg: false });
    for (let y = 0.4; y < 3.1; y += 0.55)
      FT.box("iron", 2.8, 7.2, y, y + 0.08, 0.12, 0.16, {
        seg: false,
        noAO: true,
      });
    for (let u = 3.1; u < 7.1; u += 0.5)
      for (let y = 0.5; y < 3; y += 0.55)
        FT.box("iron", u - 0.04, u + 0.04, y - 0.04, y + 0.04, 0.16, 0.2, {
          seg: false,
          noAO: true,
        });
    D.sign(
      b,
      "armory_name",
      ["SEVENTH REGIMENT", "ARMORY"],
      "engraved",
      TX0 - 0.08,
      9.2,
      (TZ0 + TZ1) / 2,
      6.4,
      1.3,
      -HP,
      { tw: 1024, th: 208, bg: "#b8ac98", spacing: 10 },
    );
    // tower windows: tall lancets + a big "7" medallion
    FT.window(5, 13.3, 1.6, 6.2, {
      arch: true,
      style: "broken",
      frame: "iron",
      sill: "ashlar",
      mull: true,
    });
    FT.window(2.6, 21.3, 0.8, 3.6, {
      arch: true,
      style: "dark",
      frame: "iron",
      sill: "ashlar",
      mull: false,
    });
    FT.window(7.4, 21.3, 0.8, 3.6, {
      arch: true,
      style: "dark",
      frame: "iron",
      sill: "ashlar",
      mull: false,
    });
    const seven = P.texMat(
      "ues_seven",
      P.canvasTex(
        "ues_seven",
        256,
        256,
        (ctx, w, h) => {
          ctx.fillStyle = "#b8ac98";
          ctx.beginPath();
          ctx.arc(w / 2, h / 2, w / 2 - 4, 0, TAU);
          ctx.fill();
          ctx.strokeStyle = "#4a3a2a";
          ctx.lineWidth = 10;
          ctx.stroke();
          ctx.fillStyle = "#4a3a2a";
          ctx.font = "bold 170px serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("7", w / 2, h / 2 + 8);
          const r = P.rng("seven");
          for (let i = 0; i < 600; i++) {
            ctx.fillStyle = "rgba(40,30,20," + r() * 0.3 + ")";
            ctx.fillRect(r() * w, r() * h, 2, 2);
          }
        },
        { clamp: true },
      ),
      { rough: 0.9, transparent: true, alphaTest: 0.2 },
    );
    b.quad(seven, TX0 - 0.03, 26, (TZ0 + TZ1) / 2, 2.4, 2.4, { ry: -HP });
    // machicolations, crenels, corner bartizans
    for (let u = 0.3; u < FT.len; u += 0.7)
      FT.box("brick_red", u - 0.15, u + 0.15, 29, 30, 0, 0.6, { seg: false });
    b.box(
      "brick_red",
      TX0 - 0.6,
      30,
      TZ0 - 0.6,
      TX0 + TW + 0.6,
      30.9,
      TZ1 + 0.6,
      { seg: false },
    );
    for (const [ax, az, bx, bz] of [
      [TX0 - 0.6, TZ0 - 0.6, TX0 - 0.6, TZ1 + 0.6],
      [TX0 - 0.6, TZ1 + 0.6, TX0 + TW + 0.6, TZ1 + 0.6],
      [TX0 + TW + 0.6, TZ1 + 0.6, TX0 + TW + 0.6, TZ0 - 0.6],
      [TX0 + TW + 0.6, TZ0 - 0.6, TX0 - 0.6, TZ0 - 0.6],
    ])
      A.crenels(b, "brick_red", ax, az, bx, bz, 30.9, {
        step: 1.2,
        mh: 1.1,
        d: 0.5,
      });
    for (const [x, z] of [
      [TX0 - 0.3, TZ0 - 0.3],
      [TX0 - 0.3, TZ1 + 0.3],
    ]) {
      b.cyl("brick_red", x, 24, z, 1.0, 0.7, 7.4, 10);
      b.lathe(
        "ashlar",
        [
          [0.7, 0],
          [1.05, 0.4],
          [0.001, 0.45],
        ],
        10,
        x,
        23.6,
        z,
      );
      b.cyl("brick_red", x, 31.4, z, 1.1, 1.1, 0.8, 10);
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * TAU;
        b.box(
          "brick_red",
          x + Math.cos(a) * 0.9 - 0.2,
          32.2,
          z + Math.sin(a) * 0.9 - 0.2,
          x + Math.cos(a) * 0.9 + 0.2,
          32.9,
          z + Math.sin(a) * 0.9 + 0.2,
          { seg: false },
        );
      }
      b.box("paint_black", x - 0.12, 26.5, z - 0.9, x + 0.12, 28.2, z - 0.82, {
        seg: false,
        noAO: true,
      });
    }
    // flagpole on the tower: the Seventh's colours, tattered
    const flagT = P.texMat(
      "ues_seventh_flag",
      P.signTex("seventh_flag", ["VII"], "banner", 256, 160, {
        bg: "#3a3a2a",
        fg: "#d8c060",
        top: 0.2,
      }),
      { rough: 0.95, double: true },
    );
    A.flagpole(S, TX0 + TW / 2, 30.9, (TZ0 + TZ1) / 2, 7, flagT, {
      w: 2.4,
      fh: 1.5,
      phase: 1.3,
    });
    // end towers (north & south), taller than the block, with crenels
    for (const [z0, z1] of [
      [Z0, Z0 + 8],
      [Z1 - 8, Z1],
    ]) {
      b.box("brick_red", HX0 - 0.6, 2.6, z0, HX0 + 8, 24, z1, { segLen: 3 });
      b.box("granite_dark", HX0 - 0.6, 0, z0, HX0 + 8, 2.6, z1, { seg: false });
      S.col(HX0 - 0.6, 0, z0, HX0 + 8, 24, z1, { walkable: false });
      const F = P.face(S, "w", z0, z1, HX0 - 0.6);
      for (const y of [8.6, 13.8, 18.4]) F.band("ashlar", y, y + 0.3, 0, 0.22);
      for (const [y, h] of [
        [3.6, 3.8],
        [9.4, 3.4],
        [14.5, 3.0],
        [19.2, 2.6],
      ])
        F.window(4, y, 1.3, h, {
          arch: true,
          style: y > 14 ? "broken" : "dark",
          frame: "iron",
          sill: "ashlar",
          mull: true,
        });
      for (let u = 0.3; u < F.len; u += 0.8)
        F.box("brick_red", u - 0.18, u + 0.18, 23.2, 24, 0, 0.5, {
          seg: false,
        });
      b.box("brick_red", HX0 - 1.1, 24, z0 - 0.5, HX0 + 8.5, 24.9, z1 + 0.5, {
        seg: false,
      });
      A.crenels(
        b,
        "brick_red",
        HX0 - 1.1,
        z0 - 0.3,
        HX0 - 1.1,
        z1 + 0.3,
        24.9,
        { step: 1.2, d: 0.5 },
      );
    }
    // ---------------- drill hall ----------------
    const WH = 11;
    b.box("brick_red", DX0, 0, DZ0, DX1, WH, DZ0 + 0.8, { segLen: 3 });
    b.box("brick_red", DX0, 0, DZ1 - 0.8, DX1, WH, DZ1, { segLen: 3 });
    b.box("brick_red", DX1 - 0.8, 0, DZ0, DX1, WH, DZ1, { segLen: 3 });
    b.box("granite_dark", DX0, 0, DZ0 - 0.1, DX1 + 0.1, 1.2, DZ1 + 0.1, {
      seg: false,
    });
    S.col(DX0, 0, DZ0, DX1, WH, DZ1, { walkable: false });
    // buttresses + clerestory arched windows along both long sides
    for (const [side, c] of [
      ["n", DZ0],
      ["s", DZ1],
    ]) {
      const F = P.face(S, side, DX0, DX1, c);
      F.band("ashlar", WH - 0.5, WH, 0, 0.3);
      for (let u = 1.5; u < F.len; u += 5.3) {
        F.box("brick_red", u - 0.45, u + 0.45, 0, WH - 0.5, 0, 0.9, {
          seg: false,
        });
        F.box("ashlar", u - 0.5, u + 0.5, WH - 3, WH - 2.7, 0, 1.0, {
          seg: false,
        });
        const w = u + 2.65;
        if (w > F.len - 1) continue;
        F.window(w, 5.2, 2.3, 4.6, {
          arch: true,
          style: P.rng("dh" + side + u)() < 0.35 ? "broken" : "dark",
          frame: "iron",
          sill: "ashlar",
          mull: true,
        });
      }
    }
    // the arched roof: segmental barrel (ridge along x), trusses visible at the gable ends, one bay fallen in
    const span = DZ1 - DZ0,
      rise = 11,
      R = ((span * span) / 4 + rise * rise) / (2 * rise),
      ang = Math.asin(span / 2 / R);
    const cz = (DZ0 + DZ1) / 2,
      cy = WH + rise - R;
    const HOLE0 = DX0 + 26,
      HOLE1 = DX0 + 33;
    for (const [x0, x1] of [
      [DX0 + 0.2, HOLE0],
      [HOLE1, DX1 - 0.2],
    ]) {
      const g = new THREE.CylinderGeometry(
        R,
        R,
        x1 - x0,
        28,
        1,
        true,
        -ang,
        ang * 2,
      ).applyMatrix4(PERM_X);
      b.geo("corrugated", g, P.m4((x0 + x1) / 2, cy, cz, 0, 0, 0), {
        grime: 0.7,
        uvScale: 3,
      });
      b.inside(
        "metal",
        g.clone(),
        P.m4((x0 + x1) / 2, cy - 0.15, cz, 0, 0, 0),
        { grime: 0.7 },
      );
    }
    // roof ribs over the hole (exposed trusses) + skylight strip along the ridge
    for (let x = HOLE0; x <= HOLE1 + 0.01; x += 3.5)
      for (let k = 0; k < 16; k++) {
        const a0 = -ang + (k / 16) * ang * 2,
          a1 = -ang + ((k + 1) / 16) * ang * 2;
        b.rod(
          "iron",
          [x, cy + Math.cos(a0) * R, cz + Math.sin(a0) * R],
          [x, cy + Math.cos(a1) * R, cz + Math.sin(a1) * R],
          0.18,
          4,
          { square: true },
        );
      }
    b.box(
      "glass_green",
      DX0 + 1,
      cy + R + 0.05,
      cz - 1.4,
      HOLE0 - 0.5,
      cy + R + 0.3,
      cz + 1.4,
      { seg: false, noAO: true },
    );
    b.box(
      "glass_green",
      HOLE1 + 0.5,
      cy + R + 0.05,
      cz - 1.4,
      DX1 - 1,
      cy + R + 0.3,
      cz + 1.4,
      { seg: false, noAO: true },
    );
    // east gable (Lexington): brick infill following the arch + big loading door
    const ge = new THREE.Shape();
    ge.moveTo(-span / 2, 0);
    for (let k = 0; k <= 20; k++) {
      const a = -ang + (k / 20) * ang * 2;
      ge.lineTo(Math.sin(a) * R, cy + Math.cos(a) * R - WH);
    }
    ge.lineTo(span / 2, 0);
    ge.closePath();
    b.extrude("brick_red", ge, 0.8, P.m4(DX1 - 0.8, WH, cz, HP), { segLen: 3 });
    b.extrude("brick_red", ge, 0.5, P.m4(DX0, WH, cz, HP), { segLen: 3 });
    const FE = P.face(S, "e", DZ0, DZ1, DX1);
    FE.box("rust", span / 2 - 4, span / 2 + 4, 0, 6.5, 0, 0.1, { seg: false });
    for (let k = 0; k < 10; k++)
      FE.box(
        "iron",
        span / 2 - 4,
        span / 2 + 4,
        0.3 + k * 0.62,
        0.36 + k * 0.62,
        0.1,
        0.14,
        { seg: false, noAO: true },
      );
    FE.window(span / 2, 13, 5, 7, {
      arch: true,
      style: "broken",
      frame: "iron",
      sill: false,
      mull: true,
    });
    D.sign(
      b,
      "armory_gun",
      ["THE SEVENTH", "GUNS FOR HIRE · SCRIP UP FRONT"],
      "raider",
      DX1 + 0.12,
      8.2,
      cz,
      8,
      2,
      HP,
      { fg: "#e8c030", tw: 1024, th: 256 },
    );
    // ---------------- occupation: emplacements, scrap, turret, wreck ----------------
    for (const z of [TZ0 - 3.5, TZ1 + 3.5])
      S.prop("sandbags", HX0 - 3, 0.05, z, HP, { count: 3 });
    S.prop("turret", HX0 - 1.8, 0.05, TZ0 - 1.8, HP, {
      faction: "raiders",
      hostile: true,
      group: "ues_armory_gate",
      hp: 120,
    });
    for (let i = 0; i < 5; i++) {
      const rn = P.rng("armscrap" + i),
        z = Z0 + 3 + i * 1.6;
      b.box(
        ["corrugated", "rust", "metal"][i % 3],
        HX0 - 3.2,
        0,
        z,
        HX0 - 3.05,
        1.8 + rn(),
        z + 1.7,
        { rz: (rn() - 0.5) * 0.2, seg: false },
      );
    }
    S.col(HX0 - 3.3, 0, Z0 + 3, HX0 - 3.0, 2.2, Z0 + 11, { walkable: false });
    for (const z of [TZ0 - 1.4, TZ1 + 1.4]) {
      b.rod("wood_rotten", [HX0 - 2.2, 0, z], [HX0 - 2.2, 3.4, z], 0.05, 4);
    }
    const bn = P.texMat("ues_poster_hired", P.uesPoster("hired"), {
      rough: 0.9,
    });
    b.quad(bn, HX0 - 0.04, 5.2, TZ0 - 5, 2.0, 3.0, { ry: -HP });
    b.quad(bn, HX0 - 0.04, 5.2, TZ1 + 5, 2.0, 3.0, { ry: -HP });
    // wrecked armoured car on Park Avenue side
    const AX = 203.5,
      AZ = -583;
    b.box("paint_army", AX - 1.3, 0.6, AZ - 3, AX + 1.3, 2.3, AZ + 3, {
      ry: 0.25,
      seg: false,
      grime: 0.9,
    });
    b.box("paint_army", AX - 1.0, 2.3, AZ - 1.5, AX + 1.0, 3.0, AZ + 1.2, {
      ry: 0.25,
      seg: false,
      grime: 0.9,
    });
    b.rod("iron", [AX, 2.7, AZ - 1.2], [AX - 0.8, 2.9, AZ - 3.8], 0.08, 6);
    for (const dz of [-2, 0, 2])
      for (const s of [-1, 1])
        b.cyl("rubber", AX + s * 1.35, 0.55, AZ + dz, 0.55, 0.55, 0.35, 10, {
          rz: HP,
        });
    S.col(AX - 1.6, 0, AZ - 3.3, AX + 1.6, 3.0, AZ + 3.3, { walkable: false });
    D.rubble(S, HX0 + 30, 0.05, Z1 + 0.6, 1.2);
    S.anchor("exterior_entrance", TX0 - 1.8, 0, (TZ0 + TZ1) / 2, HP);
    S.anchor("front", TX0 - 8, 0, (TZ0 + TZ1) / 2, -HP);
    S.build({ shadow: true, lod: 320 });
    return { S, doorX: TX0, doorZ: (TZ0 + TZ1) / 2 };
  }

  // ===================================================================
  // INTERIOR
  // ===================================================================
  function buildInterior() {
    const O = P.I("park_ave_armory");
    const S = P.site("armory_int", {
      ox: O.x,
      oy: O.y + LIFT,
      oz: O.z,
      lit: true,
      ambient: 0x5a5448,
      ambI: 0.3,
      interiorKey: "park_ave_armory",
    });
    const b = S.b;
    const H = 5.5,
      UY = 6.0,
      UH = 5.0,
      UT = UY + UH,
      BY = -4.5;
    const DOOR = (a, w) => [a - (w || 3) / 2, a + (w || 3) / 2, 0, 3.6];
    const w2X = (z, x0, x1, hN, hS, kN, kS, holes, y0) =>
      A.wall2X(S, z, x0, x1, y0 || 0, hN, hS, kN, kS, holes, {
        frame: "wood_dark",
        frameO: { cornice: true },
      });
    const w2Z = (x, z0, z1, hW, hE, kW, kE, holes, y0) =>
      A.wall2Z(S, x, z0, z1, y0 || 0, hW, hE, kW, kE, holes, {
        frame: "wood_dark",
        frameO: { cornice: true },
      });
    const trim = (x0, z0, x1, z1, y, h, top) => {
      const e = 0.21;
      for (const [yy, hh, d, k] of [
        [y, 0.25, 0.05, "wood_dark"],
        [y + 1.2, 0.08, 0.05, "wood_dark"],
        [y + h - 0.35, 0.35, 0.12, top || "wood_dark"],
      ]) {
        b.box(k, x0 + e, yy, z0 + e, x1 - e, yy + hh, z0 + e + d, {
          seg: false,
          noAO: true,
        });
        b.box(k, x0 + e, yy, z1 - e - d, x1 - e, yy + hh, z1 - e, {
          seg: false,
          noAO: true,
        });
        b.box(k, x0 + e, yy, z0 + e, x0 + e + d, yy + hh, z1 - e, {
          seg: false,
          noAO: true,
        });
        b.box(k, x1 - e - d, yy, z0 + e, x1 - e, yy + hh, z1 - e, {
          seg: false,
          noAO: true,
        });
      }
    };
    // ==================================================================
    // HEAD HOUSE — ground floor
    // ==================================================================
    S.floor("checker", -6, 18, 6, 30, 0); // Entrance Hall
    S.floor("parquet", -24, 14, -6, 22.4, 0, { surface: "wood" }); // Veterans Room (cut for the range stair below)
    S.floor("parquet", -24, 28.1, -6, 30, 0, { surface: "wood" });
    S.floor("parquet", -24, 22.4, -23.5, 28.1, 0, { surface: "wood" });
    S.floor("parquet", -20.7, 22.4, -6, 28.1, 0, { surface: "wood" });
    S.floor("parquet", 6, 14, 24, 30, 0, { surface: "wood" }); // Regimental Room (workshop)
    S.floor("concrete", -3, 12, 3, 18, 0); // passage to the Drill Hall
    S.ceil("plaster", -3, 12, 3, 18, 4.2, { col: true });
    S.ceil("oak_dark", -24, 14, -6, 30, H, { col: true });
    S.ceil("plaster", 6, 14, 24, 30, H, { col: true });
    S.wallX("oak_dark", 30, -6.2, 6.2, 0, UT, 0.5, [[-1.6, 1.6, 0, 3.8]]); // front wall + street door
    w2Z(-6, 18, 30, H, H, "oak_dark", "oak_dark", [DOOR(24, 2.6)]);
    w2Z(6, 18, 30, H, H, "oak_dark", "brick_red", [DOOR(20, 2.6)]);
    w2X(18, -6, 6, H, H, "brick_red", "oak_dark", [DOOR(0, 2.8)]);
    S.wallZ("brick_red", -3, 12, 18, 0, 4.2, 0.4, []);
    S.wallZ("brick_red", 3, 12, 18, 0, 4.2, 0.4, []);
    // Veterans Room walls
    S.wallX("oak_dark", 30, -24.2, -5.8, 0, H, 0.5, []);
    S.wallZ("oak_dark", -24, 14, 30, 0, H, 0.5, []);
    w2X(14, -24, -6, H, H, "brick_red", "oak_dark", []);
    w2Z(-6, 14, 18, H, H, "oak_dark", "brick_red", []);
    // Regimental Room walls
    S.wallX("brick_red", 30, 5.8, 24.2, 0, H, 0.5, []);
    S.wallZ("brick_red", 24, 14, 30, 0, H, 0.5, []);
    w2X(14, 6, 24, H, H, "brick_red", "brick_red", [DOOR(15, 3)]); // workshop → Drill Hall side door
    S.floor("concrete", 13.5, 12, 16.5, 14, 0);
    S.ceil("concrete", 13.5, 12, 16.5, 14, 3.8, {});
    S.wallZ("brick_red", 13.3, 12, 14, 0, 3.8, 0.4, []);
    S.wallZ("brick_red", 16.7, 12, 14, 0, 3.8, 0.4, []);
    w2Z(6, 14, 18, H, H, "brick_red", "brick_red", []);
    // ---------------- ENTRANCE HALL ----------------
    trim(-6, 18, 6, 30, 0, H);
    S.stairs("wood_oak", 4.4, 29.2, "n", 2.4, 0, UY, {
      run: 0.3,
      rail: "iron",
      railSides: [-1],
      nosing: "carpet_red",
    });
    const SL = Math.ceil(UY / 0.24) * 0.3,
      sTop = 29.2 - SL;
    S.floor("parquet", -6, 18, 3.2, 30, UY, { t: 0.4, surface: "wood" });
    S.floor("parquet", 3.2, 18, 6, sTop, UY, { t: 0.4, surface: "wood" });
    A.balustrade(
      S,
      [
        [3.2, sTop + 0.2],
        [3.2, 29.6],
      ],
      UY,
      { key: "wood_dark", h: 1.0, posts: false },
    );
    for (const x of [-4.5, -1.5, 1.5]) {
      const fl = P.texMat("ues_poster_seventh", P.uesPoster("seventh"), {
        rough: 0.95,
        double: true,
      });
      b.quad(fl, x, 3.6, 18.24, 1.1, 1.65, { ry: 0 });
      b.rod("gold", [x - 0.65, 4.45, 18.3], [x + 0.65, 4.45, 18.3], 0.02, 4);
    }
    D.chandelier(S, -1, H - 0.7, 24, 0.9, {
      tiers: 1,
      lr: 10,
      li: 0.8,
      chain: 0.6,
    });
    D.master(b, -5.78, 3.1, 24, 1.4, 1.9, HP, 7);
    S.prop("sandbags", -1, 0, 20.5, 0, { count: 2 });
    D.sign(
      b,
      "armory_hall",
      ["SEVENTH REGIMENT · N.Y.N.G.", '"PRO PATRIA ET GLORIA"', "DRILL HALL ↑"],
      "gilt",
      0,
      4.6,
      18.24,
      3.2,
      0.7,
      0,
      { tw: 900, th: 196 },
    );
    S.anchor("entrance", 0, 0, 27.6, 0);
    S.anchor("hall", 0, 0, 23, 0);
    // ---------------- VETERANS ROOM (x -24..-6, z 14..30) ----------------
    trim(-24, 14, -6, 30, 0, H, "bronze");
    // carved columns + chain-link frieze + coffered ceiling beams
    for (const [x, z] of [
      [-18, 18.2],
      [-12, 18.2],
      [-18, 26],
      [-12, 26],
    ]) {
      b.cyl("oak_dark", x, 0, z, 0.32, 0.36, H, 8);
      for (let k = 0; k < 6; k++)
        b.torus("iron", x, 0.8 + k * 0.8, z, 0.36, 0.04, TAU, {
          rx: HP,
          ts: 12,
          rs: 4,
        });
      S.col(x - 0.36, 0, z - 0.36, x + 0.36, H, z + 0.36, { walkable: false });
    }
    for (let x = -22; x <= -8; x += 3)
      b.box("oak_dark", x - 0.15, H - 0.55, 14, x + 0.15, H - 0.05, 30, {
        seg: false,
      });
    for (let z = 16; z <= 28; z += 3)
      b.box("oak_dark", -24, H - 0.5, z - 0.12, -6, H - 0.1, z + 0.12, {
        seg: false,
      });
    for (let x = -23.5; x < -6.5; x += 0.5)
      b.torus("iron", x, H - 0.8, 29.72, 0.14, 0.025, TAU, {
        rx: (Math.round(x * 2) % 2) * HP,
        ts: 8,
        rs: 3,
      });
    // the mosaic hearth
    D.fireplace(b, S, -23.75, 0, 22, HP, { key: "marble_green", lit: true });
    b.box("stained", -23.75, 1.6, 20.7, -23.72, 4.4, 23.3, {
      seg: false,
      noAO: true,
      noBake: true,
    });
    D.master(b, -6.22, 3.0, 22, 2.2, 1.6, -HP, 9);
    // Tiffany glass windows (fake, back-lit) on the front wall
    for (const x of [-20, -10]) {
      b.box("stained", x - 1.1, 1.5, 29.72, x + 1.1, 4.6, 29.75, {
        seg: false,
        noAO: true,
        noBake: true,
      });
      S.light(x, 3, 28.8, 0xffd8a0, 7, 0.55);
    }
    D.rug(b, -21, 16, -9, 28, 0.01, "carpet_red");
    for (const [x, z, ry] of [
      [-15, 22, 0],
      [-15, 25, PI],
    ])
      D.sofa(b, x, 0, z, ry, { fabric: "leather", w: 2.4 });
    D.table(b, -15, 0, 23.5, {
      rect: [1.8, 0.9],
      top: "oak_dark",
      leg: "iron",
    });
    // the range stairwell (NW corner), railed off
    A.balustrade(
      S,
      [
        [-23.6, 22.3],
        [-20.6, 22.3],
        [-20.6, 28.2],
      ],
      0,
      { key: "wood_dark", h: 1.0, posts: false },
    );
    S.anchor("veterans", -15, 0, 20, PI);
    S.anchor("lieutenant", -11, 0, 27, PI);
    // ---------------- REGIMENTAL ROOM → gunsmith workshop (x 6..24, z 14..30) ----------------
    trim(6, 14, 24, 30, 0, H, "wood_dark");
    for (const z of [17, 22]) {
      b.box("wood", 10, 0, z, 20, 0.9, z + 1.4, { segLen: 2 });
      S.col(10, 0, z, 20, 0.95, z + 1.4, { walkable: false });
    }
    for (let i = 0; i < 10; i++) {
      const rn = P.rng("gunbench" + i);
      b.box(
        rn() < 0.5 ? "iron" : "wood_dark",
        10.4 + i * 0.95,
        0.9,
        17.4 + rn() * 0.6,
        10.9 + i * 0.95 + rn() * 0.3,
        0.98,
        17.5 + rn() * 0.6,
        { seg: false, noAO: true, ry: rn() },
      );
    }
    // gun racks on the east wall (rifles as rods)
    for (let k = 0; k < 14; k++) {
      const z = 15.5 + k * 1.0;
      b.rod("wood_dark", [23.6, 0.4, z], [23.7, 1.6, z + 0.1], 0.035, 4);
      b.rod("iron", [23.62, 1.2, z + 0.06], [23.72, 2.0, z + 0.12], 0.02, 3);
    }
    b.box("wood_dark", 23.5, 0.3, 15, 23.8, 0.4, 29.5, { seg: false });
    b.box("wood_dark", 23.5, 1.9, 15, 23.8, 2.0, 29.5, { seg: false });
    for (let x = 9; x < 22; x += 5) {
      b.sphere("lamp_dim", x, H - 0.5, 20, 0.12, { ws: 6, hs: 4 });
      S.light(x, H - 0.8, 20, 0xffd8a0, 7, 0.75);
    }
    S.anchor("workshop", 15, 0, 20, 0);

    // ==================================================================
    // HEAD HOUSE — upstairs (UY 6): Upper Hall, Board of Officers (boss), Company Room (polling place)
    // ==================================================================
    S.ceil("plaster", -24, 14, 24, 30, UT, { col: true });
    S.floor("parquet", -24, 14, -6, 30, UY, { t: 0.4, surface: "wood" });
    S.floor("parquet", 6, 14, 24, 30, UY, { t: 0.4, surface: "wood" });
    S.floor("parquet", -3, 12, 3, 18, UY, { t: 0.4, surface: "wood" }); // passage to the balcony
    S.wallX("plaster", 30, -24.2, 24.2, UY, UT, 0.5, []);
    S.wallZ("plaster", -24, 14, 30, UY, UT, 0.5, []);
    S.wallZ("plaster", 24, 14, 30, UY, UT, 0.5, []);
    w2Z(-6, 14, 30, UH, UH, "silk_red", "plaster", [DOOR(24, 2.4)], UY);
    w2Z(6, 14, 30, UH, UH, "plaster", "plaster_cream", [DOOR(24, 2.4)], UY);
    w2X(18, -6, 6, UH, UH, "plaster", "plaster", [DOOR(0, 2.6)], UY);
    S.wallZ("plaster", -3, 12, 18, UY, UT, 0.4, []);
    S.wallZ("plaster", 3, 12, 18, UY, UT, 0.4, []);
    trim(-6, 18, 6, 30, UY, UH);
    D.master(b, 5.78, UY + 2.4, 21, 1.4, 1.8, -HP, 3);
    S.anchor("upper_hall", 0, UY, 24, 0);
    // Board of Officers Room (x -24..-6)
    trim(-24, 14, -6, 30, UY, UH, "gold");
    b.box("oak_dark", -20, UY, 20.5, -10, UY + 0.8, 23.5, { segLen: 2 });
    S.col(-20, UY, 20.5, -10, UY + 0.85, 23.5, { walkable: false });
    for (let i = 0; i < 6; i++)
      for (const s of [-1, 1])
        D.chair(b, -19 + i * 1.7, UY, 22 + s * 2.1, s < 0 ? 0 : PI, {
          seat: "leather",
          wood: "oak_dark",
          arms: true,
          toppled: i === 2 && s > 0,
        });
    b.box("paper", -16, UY + 0.8, 21, -13, UY + 0.82, 23, {
      seg: false,
      noAO: true,
    }); // the map of Manhattan
    for (let i = 0; i < 6; i++)
      b.cyl(
        "paint_red",
        -15.8 + i * 0.5,
        UY + 0.82,
        21.4 + (i % 3) * 0.5,
        0.03,
        0.03,
        0.1,
        5,
        { noAO: true },
      );
    for (let k = 0; k < 5; k++)
      D.master(
        b,
        -20 + k * 3.2,
        UY + 2.6,
        14.24,
        1.1,
        1.5,
        0,
        [7, 3, 12, 1, 7][k],
      );
    // the stolen St. Francis on an easel at the head of the table
    b.rod("wood_dark", [-8.2, UY, 21.2], [-8.4, UY + 2.4, 22], 0.04, 4);
    b.rod("wood_dark", [-8.2, UY, 22.8], [-8.4, UY + 2.4, 22], 0.04, 4);
    b.rod("wood_dark", [-7.6, UY, 22], [-8.3, UY + 2.4, 22], 0.04, 4);
    D.master(b, -8.55, UY + 1.8, 22, 1.7, 1.3, -HP, 2, { frame: "gold" });
    D.sign(
      b,
      "armory_trophy",
      ["PROPERTY OF THE SEVENTH", "DO NOT SHOOT THE ART"],
      "raider",
      -8.6,
      UY + 0.75,
      22,
      1.4,
      0.45,
      -HP,
      { fg: "#e8c030", tw: 512, th: 164 },
    );
    D.chandelier(S, -15, UT - 0.6, 22, 1.0, {
      tiers: 2,
      lr: 12,
      li: 0.9,
      chain: 0.4,
    });
    D.sconce(S, -23.75, UY + 2.5, 18, HP, { r: 6, i: 0.7 });
    D.sconce(S, -23.75, UY + 2.5, 26, HP, { r: 6, i: 0.7 });
    S.anchor("boss", -9.5, UY, 25.5, -HP);
    S.anchor("francis", -8.55, UY, 22, -HP);
    // Company Room (x 6..24): the polling place + bunks
    trim(6, 14, 24, 30, UY, UH, "plaster_cream");
    for (let i = 0; i < 5; i++)
      D.bed(b, 8.5 + i * 3.2, UY, 27.6, PI, {
        w: 0.95,
        cover: "paint_army",
        sheet: "fabric",
        wood: "metal",
      });
    D.poster(b, "polling", 6.24, UY + 1.8, 17.2, HP, 1.2);
    D.poster(b, "vote_1", 6.24, UY + 1.8, 19.2, HP, 1.1);
    // the voting booths (curtained) along the north wall
    for (let i = 0; i < 4; i++) {
      const x = 10 + i * 3;
      b.box("metal", x - 1.1, UY, 14.4, x - 1.05, UY + 2.2, 15.9, {
        seg: false,
      });
      b.box("metal", x + 1.05, UY, 14.4, x + 1.1, UY + 2.2, 15.9, {
        seg: false,
      });
      b.rod(
        "iron",
        [x - 1.1, UY + 2.2, 15.9],
        [x + 1.1, UY + 2.2, 15.9],
        0.02,
        3,
      );
      b.box(
        i === 2 ? "flag_red" : "canvas_tent",
        x - 1.0,
        UY + 0.6,
        15.85,
        x + (i === 1 ? -0.3 : 1.0),
        UY + 2.15,
        15.9,
        { seg: false, noAO: true },
      );
    }
    b.box("metal", 18.4, UY, 20.4, 20.6, UY + 0.8, 21.6, { seg: false });
    S.col(18.4, UY, 20.4, 20.6, UY + 0.85, 21.6, { walkable: false }); // table for the machine
    D.sign(
      b,
      "armory_poll",
      [
        "ELECTION DISTRICT 73",
        "THIS MACHINE COUNTS",
        "(IT COUNTED 2,041 ON NOV. 2, 1965)",
      ],
      "label",
      19.5,
      UY + 2.2,
      14.26,
      2.6,
      0.8,
      0,
      { tw: 700, th: 216 },
    );
    for (let x = 10; x < 22; x += 6) {
      b.sphere("lamp_dim", x, UT - 0.4, 22, 0.12, { ws: 6, hs: 4 });
      S.light(x, UT - 0.7, 22, 0xffd8a0, 8, 0.7);
    }
    S.anchor("machine", 19.5, UY + 0.8, 21, PI);
    S.anchor("company", 15, UY, 22, 0);

    // ==================================================================
    // DRILL HALL (x -40..40, z -56..12)
    // ==================================================================
    const DX = 40,
      DZ0 = -56,
      DZ1 = 12,
      WH = 12;
    const NX0 = -39.4,
      NX1 = -36.4; // NW stairwell to the range (cut out of the floor)
    const RL = Math.ceil((0 - BY) / 0.24) * 0.3; // 19 steps → 5.7 m
    const NZt = DZ0 + 2,
      NZb = NZt + RL;
    S.floor("drill_floor", -DX, NZb, DX, DZ1, 0, {
      surface: "wood",
      colT: 0.5,
    });
    S.floor("drill_floor", -DX, DZ0, DX, NZt, 0, {
      surface: "wood",
      colT: 0.5,
    });
    S.floor("drill_floor", -DX, NZt, NX0, NZb, 0, {
      surface: "wood",
      colT: 0.5,
    });
    S.floor("drill_floor", NX1, NZt, DX, NZb, 0, {
      surface: "wood",
      colT: 0.5,
    });
    // brick walls with blind arcades + clerestory
    S.wallZ("brick_red", -DX, DZ0, DZ1, 0, WH, 0.8, []);
    S.wallZ("brick_red", DX, DZ0, DZ1, 0, WH, 0.8, []);
    S.wallX("brick_red", DZ0, -DX - 0.4, DX + 0.4, 0, WH, 0.8, []);
    S.wallX("brick_red", DZ1, -DX - 0.4, DX + 0.4, 0, WH, 0.8, [
      [-3, 3, 0, 4.2],
      [-3, 3, UY, UY + 3.4],
      [13.5, 16.5, 0, 3.6],
    ]);
    for (const x of [-DX + 0.4, DX - 0.4]) {
      const s = Math.sign(x);
      for (let z = DZ0 + 8.25; z < DZ1 - 2; z += 8.5) {
        b.box(
          "glass_sky",
          Math.min(x - s * 0.02, x - s * 0.05),
          7.0,
          z - 1.6,
          Math.max(x - s * 0.02, x - s * 0.05),
          10.2,
          z + 1.6,
          { seg: false, noAO: true, noBake: true },
        );
        b.box(
          "iron",
          Math.min(x - s * 0.02, x - s * 0.1),
          7.0,
          z - 0.04,
          Math.max(x - s * 0.02, x - s * 0.1),
          10.2,
          z + 0.04,
          { seg: false, noAO: true },
        );
        b.box(
          "iron",
          Math.min(x - s * 0.02, x - s * 0.1),
          8.6,
          z - 1.6,
          Math.max(x - s * 0.02, x - s * 0.1),
          8.66,
          z + 1.6,
          { seg: false, noAO: true },
        );
        S.light(x - s * 2, 8.6, z, 0xd8e0c8, 9, 0.45);
      }
    }
    // arched trusses spanning x every 8.5 m, roof sheathing, fallen bay with sky
    const rise = 14,
      span = 2 * DX,
      R = ((span * span) / 4 + rise * rise) / (2 * rise),
      ang = Math.asin(span / 2 / R),
      cy = WH + rise - R;
    const HZ0 = -26,
      HZ1 = -18;
    for (let z = DZ0 + 4; z < DZ1; z += 8.5) {
      for (let k = 0; k < 20; k++) {
        const a0 = -ang + (k / 20) * ang * 2,
          a1 = -ang + ((k + 1) / 20) * ang * 2;
        const p0 = [Math.sin(a0) * R, cy + Math.cos(a0) * R],
          p1 = [Math.sin(a1) * R, cy + Math.cos(a1) * R];
        b.rod("iron", [p0[0], p0[1], z], [p1[0], p1[1], z], 0.22, 4, {
          square: true,
          r2: 0.12,
        });
        const q0 = [Math.sin(a0) * (R - 1.4), cy + Math.cos(a0) * (R - 1.4)],
          q1 = [Math.sin(a1) * (R - 1.4), cy + Math.cos(a1) * (R - 1.4)];
        b.rod("iron", [q0[0], q0[1], z], [q1[0], q1[1], z], 0.12, 4, {
          square: true,
          r2: 0.08,
        });
        b.rod("iron", [p0[0], p0[1], z], [q1[0], q1[1], z], 0.05, 3, {
          square: true,
        });
      }
      b.box("iron", -DX + 0.4, 0, z - 0.3, -DX + 1.2, WH, z + 0.3, {
        seg: false,
      });
      b.box("iron", DX - 1.2, 0, z - 0.3, DX - 0.4, WH, z + 0.3, {
        seg: false,
      });
    }
    for (const [z0, z1] of [
      [DZ0, HZ0],
      [HZ1, DZ1],
    ]) {
      const g = new THREE.CylinderGeometry(
        R,
        R,
        z1 - z0,
        32,
        1,
        true,
        -ang,
        ang * 2,
      ).rotateX(-HP);
      b.inside("corrugated", g, P.m4(0, cy, (z0 + z1) / 2), {
        grime: 0.6,
        uvScale: 3,
      });
    }
    b.box("glass_sky", -18, cy + R + 1.2, HZ0, 18, cy + R + 1.3, HZ1, {
      seg: false,
      noAO: true,
      noBake: true,
    });
    for (let x = -30; x <= 30; x += 12)
      S.light(x, WH + 8, -22, 0xd8e0c8, 22, 0.9);
    for (let x = -24; x <= 24; x += 12) S.glow(x, WH + 10, -22, 0xd8e0c8, 6);
    // gable walls above the side walls follow the arch
    const ge = new THREE.Shape();
    ge.moveTo(-DX, 0);
    for (let k = 0; k <= 24; k++) {
      const a = -ang + (k / 24) * ang * 2;
      ge.lineTo(Math.sin(a) * R, cy + Math.cos(a) * R - WH);
    }
    ge.lineTo(DX, 0);
    ge.closePath();
    b.extrude("brick_red", ge, 0.8, P.m4(0, WH, DZ0 - 0.4), { segLen: 4 });
    b.extrude("brick_red", ge, 0.8, P.m4(0, WH, DZ1 - 0.4), { segLen: 4 });
    b.box("stained", -6, WH + 3, DZ0 + 0.42, 6, WH + 10, DZ0 + 0.45, {
      seg: false,
      noAO: true,
      noBake: true,
      c: 0xb8b8a0,
    });
    // hanging work lights (a few still on, fed by the Seventh's generator)
    for (let x = -30; x <= 30; x += 15)
      for (let z = -48; z <= 4; z += 13) {
        const on = P.rng("dl" + x + z)() < 0.6;
        b.rod("iron", [x, WH + 6, z], [x, 7.2, z], 0.015, 3, { noAO: true });
        b.cyl(on ? "lamp" : "glass_dark", x, 6.9, z, 0.18, 0.5, 0.3, 8, {
          open: true,
          noAO: true,
        });
        if (on) {
          S.light(x, 6.5, z, 0xffe0b0, 16, 0.85);
          S.glow(x, 6.8, z, 0xffe0b0, 1.2);
        }
      }
    // ---- reviewing balcony along the south wall (UY) ----
    S.floor("wood", -24, 7, 25.4, 12, UY, { t: 0.4, surface: "wood" });
    for (let x = -22; x <= 22; x += 4) {
      b.box("iron", x - 0.15, 0, 6.9, x + 0.15, UY - 0.4, 7.2, { seg: false });
      S.col(x - 0.15, 0, 6.9, x + 0.15, UY, 7.2, { walkable: false });
    }
    A.balustrade(
      S,
      [
        [-24, 7.2],
        [24, 7.2],
      ],
      UY,
      { key: "iron", h: 1.05, posts: false, step: 0.25 },
    );
    A.balustrade(
      S,
      [
        [-24, 7.2],
        [-24, 11.6],
      ],
      UY,
      { key: "iron", h: 1.05, posts: false, step: 0.25 },
    );
    A.balustrade(
      S,
      [
        [25.4, 7.2],
        [25.4, 11.6],
      ],
      UY,
      { key: "iron", h: 1.05, posts: false, step: 0.25 },
    );
    A.balustrade(
      S,
      [
        [24, 2.3],
        [24, 7.2],
      ],
      UY,
      { key: "iron", h: 1.05, posts: false, step: 0.25 },
    );
    for (let k = 0; k < 6; k++)
      b.box(
        "canvas_tent",
        -20 + k * 7.6,
        UY + 0.02,
        7.3,
        -18 + k * 7.6,
        UY + 0.6,
        7.9,
        { seg: false, grime: 0.8 },
      ); // sandbags on the rail
    // iron stair from the floor up to the balcony (east end)
    S.stairs("iron", 26.2, 2.2 + Math.ceil(UY / 0.24) * 0.3, "n", 1.6, 0, UY, {
      run: 0.3,
      rail: "iron",
      railSides: [1],
    });
    S.floor("iron", 24, 0.6, 27.2, 2.3, UY, { t: 0.3, surface: "metal" });
    S.floor("iron", 24, 2.3, 25.4, 7, UY, { t: 0.3, surface: "metal" });
    S.anchor("balcony", 0, UY, 9.5, PI);
    // ---- the Pit: a scrap boxing ring with bleachers ----
    const RX = -4,
      RZ = -18;
    b.box("wood", RX - 4, 0, RZ - 4, RX + 4, 0.9, RZ + 4, { segLen: 2 });
    S.col(RX - 4, 0, RZ - 4, RX + 4, 0.9, RZ + 4, { surface: "wood" });
    b.box("canvas_tent", RX - 3.9, 0.9, RZ - 3.9, RX + 3.9, 0.93, RZ + 3.9, {
      seg: false,
      c: 0x8a6a5a,
    });
    for (const [x, z] of [
      [-1, -1],
      [1, -1],
      [1, 1],
      [-1, 1],
    ])
      b.cyl("rust", RX + x * 3.8, 0.9, RZ + z * 3.8, 0.1, 0.1, 1.6, 6);
    for (const y of [1.4, 1.9, 2.4])
      for (const [a, c] of [
        [
          [-1, -1],
          [1, -1],
        ],
        [
          [1, -1],
          [1, 1],
        ],
        [
          [1, 1],
          [-1, 1],
        ],
        [
          [-1, 1],
          [-1, -1],
        ],
      ])
        b.rod(
          "rubber",
          [RX + a[0] * 3.8, y, RZ + a[1] * 3.8],
          [RX + c[0] * 3.8, y, RZ + c[1] * 3.8],
          0.025,
          4,
          { noAO: true },
        );
    for (let i = 0; i < 3; i++) {
      b.box(
        "wood_rotten",
        RX - 8 - i * 0.8,
        0,
        RZ - 5,
        RX - 7.2 - i * 0.8,
        0.45 + i * 0.45,
        RZ + 5,
        { seg: false },
      );
      S.col(
        RX - 8 - i * 0.8,
        0,
        RZ - 5,
        RX - 7.2 - i * 0.8,
        0.45 + i * 0.45,
        RZ + 5,
      );
    }
    D.sign(
      b,
      "armory_pit",
      ["THE PIT", "BETS WITH SGT. MOSS"],
      "raider",
      RX,
      4.2,
      RZ - 4.1,
      3.6,
      1.2,
      0,
      { fg: "#e8c030", tw: 512, th: 170 },
    );
    b.rod("iron", [RX - 1.6, 3.6, RZ - 4], [RX - 1.6, 12, RZ - 4], 0.02, 3);
    b.rod("iron", [RX + 1.6, 3.6, RZ - 4], [RX + 1.6, 12, RZ - 4], 0.02, 3);
    S.light(RX, 5, RZ, 0xffe0b0, 12, 0.9);
    S.glow(RX, 5.5, RZ, 0xffd8a0, 1.4);
    S.anchor("pit", RX, 0.9, RZ, 0);
    // ---- "Old Glory": the Seventh's tank ----
    const TKX = 16,
      TKZ = -6;
    b.box("paint_army", TKX - 1.8, 0.6, TKZ - 3.6, TKX + 1.8, 2.0, TKZ + 3.6, {
      seg: false,
      grime: 0.8,
    });
    b.box("paint_army", TKX - 1.5, 2.0, TKZ - 2.8, TKX + 1.5, 2.4, TKZ + 2.4, {
      seg: false,
      grime: 0.8,
    });
    b.cyl("paint_army", TKX, 2.4, TKZ - 0.4, 1.2, 1.35, 0.9, 12, {
      grime: 0.8,
    });
    b.rod("paint_army", [TKX, 2.9, TKZ - 1.2], [TKX, 3.1, TKZ - 6.2], 0.12, 8);
    for (const s of [-1, 1]) {
      b.box(
        "rubber",
        TKX + s * 1.95 - 0.35,
        0,
        TKZ - 3.8,
        TKX + s * 1.95 + 0.35,
        1.1,
        TKZ + 3.8,
        { seg: false },
      );
      for (let k = 0; k < 6; k++)
        b.cyl(
          "iron",
          TKX + s * 1.95,
          0.5,
          TKZ - 3 + k * 1.2,
          0.42,
          0.42,
          0.72,
          10,
          { rz: HP, noAO: true },
        );
    }
    D.sign(
      b,
      "armory_tank",
      ["OLD GLORY"],
      "raider",
      TKX + 1.82,
      1.4,
      TKZ,
      3.2,
      0.8,
      HP,
      { fg: "#f0e0b0", tw: 512, th: 128 },
    );
    S.col(TKX - 2.3, 0, TKZ - 3.9, TKX + 2.3, 2.4, TKZ + 3.9, {
      walkable: false,
    });
    // ---- shacks, containers, sandbag lines for cover ----
    for (const [x, z, ry] of [
      [-34, -8, HP],
      [-34, 2, HP],
      [-34, -30, HP],
    ])
      S.prop("shack", x, 0, z, ry, {});
    const cont = (x, z, ry, y, key) => {
      b.box(key, -1.2, 0, -3.0, 1.2, 2.6, 3.0, {
        m: P.m4(x, y || 0, z, ry),
        segLen: 1.5,
        grime: 0.7,
      });
      for (let k = -6; k <= 6; k++)
        b.box(key, -1.25, 0.1, k * 0.46 - 0.05, 1.25, 2.5, k * 0.46 + 0.05, {
          m: P.m4(x, y || 0, z, ry),
          seg: false,
          noAO: true,
        });
      S.colR(x, z, 2.5, 6.1, y || 0, (y || 0) + 2.6, ry);
    };
    cont(24, -30, 0.1, 0, "paint_red");
    cont(20.5, -31, -0.05, 0, "paint_navy");
    cont(22.5, -30.5, 0.4, 2.6, "rust");
    cont(-20, -44, HP, 0, "paint_olive");
    cont(10, -40, HP + 0.3, 0, "paint_blue");
    for (const [x, z, ry, n] of [
      [-8, 0, 0, 4],
      [8, -12, 0.3, 3],
      [-18, -24, HP, 3],
      [2, -34, 0, 4],
      [-28, -18, HP, 2],
    ])
      S.prop("sandbags", x, 0, z, ry, { count: n });
    for (let i = 0; i < 6; i++) {
      const rn = P.rng("drillcrate" + i);
      const x = -26 + rn() * 50,
        z = -50 + rn() * 50;
      b.box("crate", x - 0.6, 0, z - 0.6, x + 0.6, 1.2, z + 0.6, {
        ry: rn() * 3,
        seg: false,
        grime: 0.7,
      });
      S.col(x - 0.6, 0, z - 0.6, x + 0.6, 1.2, z + 0.6);
    }
    D.rubble(S, 7, 0, -23, 3.2, {
      key: "corrugated",
      rebar: true,
      col: true,
      colH: 0.6,
    }); // fallen roof bay
    for (let i = 0; i < 4; i++)
      b.rod(
        "iron",
        [4 + i * 2.2, 0.2, -25 + i],
        [6 + i * 2, 2.5 + i * 0.6, -21 - i * 0.5],
        0.14,
        4,
        { square: true },
      );
    // ---- the command stage (north end) ----
    b.box("wood_dark", -14, 0, DZ0 + 0.4, 14, 1.2, DZ0 + 8, { segLen: 2 });
    S.col(-14, 0, DZ0 + 0.4, 14, 1.2, DZ0 + 8, { surface: "wood" });
    for (let i = 0; i < 4; i++) {
      b.box(
        "wood_dark",
        -3 + 0,
        0,
        DZ0 + 8 + i * 0.3,
        3,
        1.2 - i * 0.3,
        DZ0 + 8.3 + i * 0.3,
        { seg: false },
      );
      S.col(-3, 0, DZ0 + 8 + i * 0.3, 3, 1.2 - i * 0.3, DZ0 + 8.3 + i * 0.3);
    }
    for (const x of [-10, -3.5, 3.5, 10]) {
      const fl = P.texMat("ues_seventh_flag", null);
      b.quad(fl, x, 6.5, DZ0 + 0.45, 3.0, 5.0, { ry: 0 });
    }
    b.box("wood_oak", -1.2, 1.2, DZ0 + 3.2, 1.2, 2.4, DZ0 + 4.2, {
      seg: false,
    }); // lectern
    S.light(0, 5, DZ0 + 5, 0xffc080, 14, 0.9);
    S.anchor("stage", 0, 1.2, DZ0 + 4.8, 0);
    // ---- the weapons cache: locked cage in the north-east corner ----
    const CX0 = 22,
      CX1 = 38,
      CZ0 = DZ0 + 1,
      CZ1 = DZ0 + 13;
    for (let x = CX0; x <= CX1 + 0.01; x += 0.5)
      b.rod("iron", [x, 0, CZ1], [x, 4.2, CZ1], 0.018, 3, { noAO: true });
    for (let z = CZ0; z <= CZ1 + 0.01; z += 0.5)
      b.rod("iron", [CX0, 0, z], [CX0, 4.2, z], 0.018, 3, { noAO: true });
    for (const y of [0.1, 2.1, 4.2]) {
      b.box("iron", CX0, y, CZ1 - 0.04, CX1, y + 0.08, CZ1 + 0.04, {
        seg: false,
      });
      b.box("iron", CX0 - 0.04, y, CZ0, CX0 + 0.04, y + 0.08, CZ1, {
        seg: false,
      });
    }
    b.box("iron", CX0, 4.2, CZ0, CX1, 4.28, CZ1, { seg: false });
    S.col(CX0, 0, CZ1 - 0.08, CX1, 4.3, CZ1 + 0.08, { walkable: false });
    S.col(CX0 - 0.08, 0, CZ0, CX0 + 0.08, 4.3, CZ1, { walkable: false });
    // racks of rifles, ammo crates, a missile launcher on pegs
    for (let k = 0; k < 18; k++) {
      const x = CX0 + 1 + k * 0.8;
      b.rod(
        "wood_dark",
        [x, 0.3, DZ0 + 1.2],
        [x + 0.05, 1.7, DZ0 + 1.3],
        0.04,
        4,
      );
      b.rod(
        "iron",
        [x + 0.02, 1.0, DZ0 + 1.3],
        [x + 0.06, 2.0, DZ0 + 1.35],
        0.025,
        3,
      );
    }
    b.box("wood_dark", CX0 + 0.6, 0.25, DZ0 + 0.9, CX1 - 0.6, 0.35, DZ0 + 1.6, {
      seg: false,
    });
    b.box("wood_dark", CX0 + 0.6, 1.8, DZ0 + 0.9, CX1 - 0.6, 1.9, DZ0 + 1.6, {
      seg: false,
    });
    for (let i = 0; i < 8; i++) {
      const x = CX0 + 2 + (i % 4) * 3.5,
        z = DZ0 + 5 + Math.floor(i / 4) * 3;
      b.box(
        "paint_army",
        x - 0.7,
        0,
        z - 0.4,
        x + 0.7,
        0.6 + (i % 2) * 0.6,
        z + 0.4,
        { seg: false, grime: 0.6 },
      );
      S.col(x - 0.7, 0, z - 0.4, x + 0.7, 0.6 + (i % 2) * 0.6, z + 0.4);
    }
    D.sign(
      b,
      "armory_cache",
      ["REGIMENTAL ARMOURY", "AUTHORIZED PERSONNEL — MAJOR CALLOWAY ONLY"],
      "label",
      (CX0 + CX1) / 2,
      3.2,
      CZ1 + 0.06,
      3.4,
      0.7,
      0,
      { tw: 900, th: 184 },
    );
    S.light((CX0 + CX1) / 2, 4, (CZ0 + CZ1) / 2, 0xffe0b0, 12, 0.8);
    S.anchor("cache", (CX0 + CX1) / 2, 0, CZ1 + 1.6, PI);
    S.anchor("cache_door", CX0 + 3, 0, CZ1 + 0.6, PI);
    // ---- NW stairwell down to the rifle range ----
    S.stairs("concrete", (NX0 + NX1) / 2, NZb, "n", NX1 - NX0, BY, 0, {
      run: 0.3,
    });
    A.balustrade(
      S,
      [
        [NX1 + 0.1, NZt],
        [NX1 + 0.1, NZb + 0.2],
        [NX0, NZb + 0.2],
      ],
      0,
      { key: "iron", h: 1.0, posts: false },
    );
    D.sign(
      b,
      "armory_range",
      ["RIFLE RANGE ↓", "EYES & EARS"],
      "label",
      NX1 + 0.12,
      2.2,
      NZt + 2.5,
      1.2,
      0.5,
      HP,
      { tw: 480, th: 200 },
    );
    // spawns + drill hall anchors
    S.anchor("spawn1", -12, 0, -6, 0);
    S.anchor("spawn2", 14, 0, -24, PI);
    S.anchor("spawn3", -22, 0, -38, 0);
    S.anchor("spawn4", 6, UY, 9.5, PI);
    S.anchor("spawn5", -33, BY, -20, 0);
    S.anchor("spawn6", 15, UY, 20, 0);
    S.anchor("drill_hall", 0, 0, 0, 0);

    // ==================================================================
    // BASEMENT (BY): Rifle Range (x -40..-30, z NZb..8), armourer's lobby (x -40..-20, z 8..30)
    // ==================================================================
    b.ground = BY;
    const RX0 = -40,
      RX1 = -30,
      RZ0 = NZb,
      RZ1 = 8,
      BH = 4.0;
    S.wallZ("concrete", -36.2, DZ0, NZb, BY, BY + BH, 0.3, []); // stair shaft | lanes
    S.floor("concrete_dark", RX0, DZ0, RX1, RZ1, BY);
    S.ceil("concrete", RX0, NZb, RX1, RZ1, BY + BH, { col: true });
    S.ceil("concrete", -36.2, DZ0, RX1, NZb, BY + BH, { col: true });
    S.wallZ("concrete", RX0, DZ0, 30, BY, BY + BH, 0.4, []);
    S.wallZ("concrete", RX1, DZ0, RZ1, BY, BY + BH, 0.4, []);
    S.wallX("concrete", DZ0, RX0, RX1, BY, BY + BH, 0.4, []);
    // lanes: target frames at the north end, shooting booths at the south end
    for (let l = 0; l < 3; l++) {
      const x = -35 + l * 2;
      b.box("wood", x - 0.5, BY, DZ0 + 1.5, x + 0.5, BY + 0.1, DZ0 + 1.7, {
        seg: false,
      });
      b.box(
        "paper",
        x - 0.4,
        BY + 0.9,
        DZ0 + 1.55,
        x + 0.4,
        BY + 2.1,
        DZ0 + 1.58,
        { seg: false, noAO: true },
      );
      b.box(
        "paint_black",
        x - 0.12,
        BY + 1.5,
        DZ0 + 1.52,
        x + 0.12,
        BY + 1.74,
        DZ0 + 1.55,
        { seg: false, noAO: true },
      );
      b.rod(
        "iron",
        [x, BY + 2.1, DZ0 + 1.56],
        [x, BY + BH, DZ0 + 1.56],
        0.015,
        3,
        { noAO: true },
      );
      b.box("wood_dark", x - 1.15, BY, RZ1 - 5, x - 1.1, BY + 2.2, RZ1 - 3.2, {
        seg: false,
      });
      b.box(
        "wood",
        x - 1.1,
        BY + 1.0,
        RZ1 - 5.2,
        x + 1.1,
        BY + 1.08,
        RZ1 - 4.8,
        { seg: false },
      );
    }
    b.box(
      "paint_yellow",
      -36.2,
      BY + 0.005,
      RZ1 - 5.3,
      RX1,
      BY + 0.02,
      RZ1 - 5.2,
      { seg: false, noAO: true },
    );
    for (let z = DZ0 + 6; z < RZ1 - 6; z += 12) {
      b.box(
        "lamp_dim",
        RX0 + 1,
        BY + BH - 0.1,
        z - 0.8,
        RX1 - 1,
        BY + BH - 0.05,
        z + 0.8,
        { seg: false },
      );
      S.light((RX0 + RX1) / 2, BY + BH - 0.6, z, 0xe8f0d0, 9, 0.7);
    }
    S.light((RX0 + RX1) / 2, BY + 2, DZ0 + 2.5, 0xffe8b0, 7, 0.8);
    S.prop("skeleton", -33, BY, DZ0 + 3.2, 0.5, { pose: "lying" });
    S.anchor("range", (RX0 + RX1) / 2, BY, RZ1 - 6.5, 0);
    // armourer's lobby (x -40..-20, z 8..30): counter, lockers, the stair up into the Veterans Room
    S.floor("concrete_dark", RX0, RZ1, -20, 30, BY);
    S.ceil("concrete", RX0, RZ1, -24, 30, BY + BH, { col: true });
    S.ceil("concrete", -24, RZ1, -20, 22.3, BY + BH, { col: true });
    S.wallX("concrete", RZ1, RX1, -19.8, BY, BY + BH, 0.4, []);
    S.wallX("concrete", 30, RX0, -19.8, BY, BY + BH, 0.4, []);
    S.wallZ("concrete", -20, RZ1, 30, BY, BY + BH, 0.4, []);
    S.stairs("concrete", -22.1, 28.1, "n", 2.8, BY, 0, { run: 0.3 });
    b.box("wood", -36, BY, 14, -31, BY + 1.05, 15, { segLen: 2 });
    S.col(-36, BY, 14, -31, BY + 1.1, 15, { walkable: false });
    b.box("iron", -36, BY + 1.05, 14.9, -31, BY + 3.2, 15.0, {
      seg: false,
      noAO: true,
    });
    for (let k = 0; k < 8; k++)
      b.box("metal", -39.6, BY, 17 + k * 0.9, -39, BY + 2.1, 17.85 + k * 0.9, {
        seg: false,
        grime: 0.6,
      });
    S.col(-39.8, BY, 17, -39, BY + 2.1, 24.2, { walkable: false });
    D.sign(
      b,
      "armory_armourer",
      ["ARMOURER", "Sign Out · Sign In · Clean Your Weapon"],
      "label",
      -33.5,
      BY + 2.6,
      14.04,
      2.6,
      0.6,
      PI,
      { tw: 700, th: 160 },
    );
    b.sphere("lamp_dim", -30, BY + BH - 0.3, 20, 0.12, { ws: 6, hs: 4 });
    S.light(-30, BY + BH - 0.6, 20, 0xffd8a0, 9, 0.8);
    S.glow(-30, BY + BH - 0.3, 20, 0xffd8a0, 0.5);
    S.light(-22, BY + 2, 26, 0xffd8a0, 6, 0.6);
    S.anchor("lobby", -30, BY, 20, 0);
    b.ground = 0;
    return { S, BY, UY, DZ0, CX0, CZ1 };
  }

  function dressInterior(S, info) {
    const BY = info.BY,
      UY = info.UY,
      DZ0 = info.DZ0;
    S.prop("terminal", -15, UY + 0.8, 20.9, 0, {
      terminalId: "ues_armory_orders",
      mount: "bare",
    });
    S.prop("terminal", -33.5, BY + 1.05, 14.3, PI, {
      terminalId: "ues_armory_range",
      mount: "bare",
    });
    S.prop("ammo_box", 26, 0, DZ0 + 3, 0, {
      loot: "weapon_crate",
      name: "Seventh Regiment Weapons Locker",
      items: [
        ["assault_rifle", 1],
        ["ammo_556", 120],
        ["frag_grenade", 4],
        ["missile_launcher", 1],
        ["ammo_missile", 4],
      ],
    });
    S.prop("ammo_box", 30, 0, DZ0 + 3, 0, {
      loot: "ammo_box",
      name: "Ammunition Crate",
    });
    S.prop("ammo_box", 34, 0, DZ0 + 3, 0, {
      loot: "ammo_box",
      name: "Ammunition Crate",
    });
    S.prop("footlocker", -12, UY, 29.3, 0, {
      loot: "raider_boss",
      locked: 0,
      lock: P.LOCKS.armory_footlocker,
      name: "Major Callahan's Footlocker",
    });
    S.prop("safe", -23.7, UY + 1.2, 16, -HP, {
      loot: "safe",
      locked: 0,
      lock: P.LOCKS.armory_safe,
      name: "Regimental Safe",
    });
    S.prop("ammo_box", -1, 0, 20.2, 0, { loot: "ammo_box" });
    S.prop("first_aid", -39.7, BY + 1.3, 26, -HP, { loot: "first_aid" });
    S.prop("locker", -39.3, BY, 12, -HP, { loot: "locker" });
    S.prop("toolbox", 19.8, 0.9, 22.6, PI, { loot: "toolbox" });
    S.prop("workbench", 15, 0, 28.8, 0, {});
    S.prop("footlocker", 22.8, UY, 25.2, HP, { loot: "footlocker" });
    S.prop("crate", -33, 0, -44, 0.3, {
      loot: "raider_stash",
      kind: "army",
      name: "Seventh Supply Crate",
    });
    S.prop("radio", -17.2, UY + 0.85, 21.3, 0, {});
    S.pickup("ues_note_armory_orders", 1, -13.8, UY + 0.83, 21.6);
    S.pickup("ues_reel_armory_1977", 1, -35.5, BY + 1.07, 14.4);
    S.pickup("ues_voting_machine", 1, 19.5, UY + 0.82, 21);
    S.pickup("ues_painting_francis", 1, -8.8, UY + 0.02, 22);
    S.pickup("ues_note_armory_moss", 1, -3.5, 0.95, -18.5);
    S.pickup("ues_key_armory_cage", 1, -11.0, UY + 0.84, 22.8); // on the Major's desk in the Board of Officers Room
    S.pickup("ammo_10mm", 24, -1.2, 0.95, 20.2);
  }

  P.addBuilder(
    "park_ave_armory",
    function () {
      const EX = buildExterior(),
        E = EX.S;
      const info = buildInterior(),
        I = info.S;
      dressInterior(I, info);
      I.build({ interior: true });
      P.addInterior("park_ave_armory", I.root);
      const O = P.I("park_ave_armory"),
        OY = O.y + LIFT;
      E.door(
        EX.doorX - 0.2,
        1.8,
        EX.doorZ,
        "Park Avenue Armory",
        { x: O.x, y: OY, z: O.z + 27.6, yaw: 0 },
        {
          radius: 2.2,
          onEnter: () => P.safe("disc", () => G.discover("park_ave_armory")),
        },
      );
      I.door(
        0,
        1.8,
        29.6,
        "Park Avenue",
        { x: EX.doorX - 1.8, y: 0, z: EX.doorZ, yaw: HP },
        { verb: "Exit", radius: 1.8 },
      );
      // the cache cage gate (the key lies on Major Callahan's desk upstairs)
      I.door(
        info.CX0 + 3,
        1.4,
        info.CZ1 + 0.3,
        "Regimental Armoury",
        { x: O.x + info.CX0 + 3, y: OY, z: O.z + info.CZ1 - 1.2, yaw: 0 },
        {
          verb: "Open",
          radius: 1.3,
          lock: P.lockReg(P.LOCKS.armory_cage),
          id: "ues_armory_cage_in",
          sound: "door_open",
        },
      );
      I.door(
        info.CX0 + 3,
        1.4,
        info.CZ1 - 1.0,
        "Drill Hall",
        { x: O.x + info.CX0 + 3, y: OY, z: O.z + info.CZ1 + 1.4, yaw: PI },
        { verb: "Leave", radius: 1.0 },
      );
      P.register("park_ave_armory", {
        root: E.root,
        interiorRoot: I.root,
        interiorKey: "park_ave_armory",
        anchors: Object.assign({}, E.anchors, I.anchors),
        noCombatBoss: true,
      });
    },
    40,
  );
})();
