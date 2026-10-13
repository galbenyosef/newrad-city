// play-inline-268 03 — box
// Lines 62-570 of readable/play-inline-268.pretty.js (statement-aligned).
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
