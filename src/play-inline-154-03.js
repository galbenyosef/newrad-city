// play-inline-154 03 — door_z
// Lines 82-612 of readable/play-inline-154.pretty.js (statement-aligned).
  function buildExterior() {
    const S = P.site("plaza_ext", { grime: 0.22 });
    const b = S.b;
    const X0 = 52,
      X1 = 96,
      Z0 = -401,
      Z1 = -374,
      BASE = 10,
      BODY = 52,
      ROOF = 65;
    b.box("sidewalk", 50.1, 0, -402.9, 109.9, 0.03, -372.1, {
      segLen: 8,
      grime: 0.4,
      noAO: true,
    });
    // masses
    b.box("marble", X0, 0, Z0, X1, BASE, Z1);
    b.box("brick_white", X0, BASE, Z0, X1, BODY, Z1);
    S.col(X0, 0, Z0, X1, BODY, Z1);
    // facades
    const rows = [];
    for (let k = 0; k < 11; k++)
      rows.push({
        y: BASE + 1.2 + k * 3.6,
        h: 2.1,
        hood: k === 3 || k === 7 ? "pediment" : undefined,
      });
    rows.push({ y: BASE + 1.2 + 11 * 3.6, h: 2.3, arch: true });
    const facade = (side, a0, a1, c, o) => {
      o = o || {};
      const F = P.face(S, side, a0, a1, c);
      // base: rusticated marble with big arched windows
      for (let y = 1.1; y < BASE - 0.5; y += 1.1)
        F.box("marble", 0, F.len, y - 0.05, y + 0.05, 0.0, 0.05, {
          seg: false,
          grime: 0.8,
        });
      F.band("marble", BASE - 0.6, BASE, 0, 0.5);
      F.band("marble", BASE + 14.2, BASE + 14.6, 0, 0.35);
      F.band("marble", BASE + 28.6, BASE + 29.0, 0, 0.35);
      F.cornice("marble", BODY - 1.4, 1.1, { step: 0.7 });
      const n = Math.max(3, Math.round(F.len / 3.4));
      const bays = [];
      for (let i = 0; i < n; i++) {
        const u = ((i + 0.5) * F.len) / n;
        if (u < 3.4 || u > F.len - 3.4) continue;
        if (o.skip && o.skip(u)) continue;
        bays.push(u);
      }
      P.windowGrid(F, bays, rows, {
        sill: "marble",
        hoodKey: "marble",
        frame: "paint_white",
        broken: 0.12,
        boarded: 0.04,
        lit: 0.18,
        seed: c * 3,
      });
      for (const u of bays)
        if (!(o.skipBase && o.skipBase(u)))
          F.window(u, 2.0, 2.2, 5.6, {
            arch: true,
            style: "dark",
            frame: "iron",
            sill: "marble",
            keystone: "marble",
            mull: true,
          });
      // balcony slabs on the belt courses
      for (const u of bays)
        if (Math.abs(u - F.len / 2) < F.len * 0.22) {
          F.box("marble", u - 1.2, u + 1.2, BASE + 14.2, BASE + 14.5, 0, 0.9, {
            seg: false,
          });
          for (let k = -4; k <= 4; k++)
            F.box(
              "marble",
              u + k * 0.28 - 0.05,
              u + k * 0.28 + 0.05,
              BASE + 14.5,
              BASE + 15.4,
              0.75,
              0.85,
              { seg: false },
            );
          F.box(
            "marble",
            u - 1.2,
            u + 1.2,
            BASE + 15.4,
            BASE + 15.55,
            0.7,
            0.9,
            { seg: false },
          );
        }
      return F;
    };
    const DOOR_Z = -387.5;
    const FE = facade("e", Z0, Z1, X1, {
      skipBase: (u) => Math.abs(u - 13.5) < 3,
    });
    facade("n", X0, X1, Z0, {});
    facade("s", X0, X1, Z1, {});
    facade("w", Z0, Z1, X0, {});
    // corner turrets
    for (const [tx, tz] of [
      [X0, Z0],
      [X1, Z0],
      [X0, Z1],
      [X1, Z1],
    ]) {
      b.cyl("brick_white", tx, BASE, tz, 3.4, 3.4, BODY + 4 - BASE, 20, {
        hSeg: 8,
      });
      b.cyl("marble", tx, BASE - 1.0, tz, 3.2, 2.0, 1.0, 20);
      for (const y of [BASE + 14.2, BASE + 28.6, BODY - 1.4])
        b.cyl("marble", tx, y, tz, 3.65, 3.65, 0.4, 20);
      for (let k = 0; k < 6; k++) {
        const a =
          (tx > 70 ? 0 : PI) +
          (k - 2.5) * 0.45 * (tz > -390 ? -1 : 1) * 0 +
          (k / 6) * TAU;
        const px = tx + Math.cos(a) * 3.42,
          pz = tz + Math.sin(a) * 3.42;
        if (px > X0 + 0.5 && px < X1 - 0.5 && pz > Z0 + 0.5 && pz < Z1 - 0.5)
          continue;
        for (let y = BASE + 1.2; y < BODY; y += 3.6)
          b.box(
            "glass_dark",
            px - 0.45,
            y,
            pz - 0.08,
            px + 0.45,
            y + 2.0,
            pz + 0.08,
            { ry: -a + HP, seg: false },
          );
      }
      b.cyl("copper", tx, BODY + 4, tz, 0.2, 3.9, 11, 20, { hSeg: 4 });
      b.cyl("copper", tx, BODY + 4, tz, 3.9, 3.9, 0.4, 20);
      b.cyl("gold", tx, BODY + 15, tz, 0.05, 0.25, 2.6, 6);
      S.col(tx - 3.5, 0, tz - 3.5, tx + 3.5, BODY + 4, tz + 3.5, {
        walkable: false,
      });
    }
    // copper mansard + dormers
    P.mansard(
      b,
      "copper",
      (X0 + X1) / 2,
      (Z0 + Z1) / 2,
      X1 - X0 - 2,
      Z1 - Z0,
      true,
      BODY,
      ROOF,
      6,
      {},
    );
    b.box("copper", X0 + 1, BODY, Z0 + 3, X0 + 3, ROOF - 3, Z1 - 3);
    b.box("copper", X1 - 3, BODY, Z0 + 3, X1 - 1, ROOF - 3, Z1 - 3);
    const slope = (side, a0, a1, c) => {
      const F = P.face(S, side, a0, a1, c);
      const n = Math.round(F.len / 3.4);
      for (let i = 0; i < n; i++) {
        const u = ((i + 0.5) * F.len) / n;
        if (u < 5 || u > F.len - 5) continue;
        for (const [y, d] of [
          [BODY + 1.2, -1.0],
          [BODY + 5.0, -4.2],
        ]) {
          F.box("copper", u - 0.8, u + 0.8, y, y + 2.2, d - 1.6, d, {
            seg: false,
          });
          F.box(
            (i + y) % 3 === 0 ? "window_lit" : "glass_dark",
            u - 0.5,
            u + 0.5,
            y + 0.3,
            y + 1.9,
            d,
            d + 0.03,
            { seg: false },
          );
          F.arch("copper", u, y + 1.9, 0.55, 0.3, d - 1.6, d + 0.1);
        }
      }
      // central gable (on the long faces)
      if (F.len > 30) {
        const uc = F.len / 2;
        const sh = new THREE.Shape();
        sh.moveTo(-4.5, 0);
        sh.lineTo(4.5, 0);
        sh.lineTo(4.5, 4);
        sh.lineTo(0, 10);
        sh.lineTo(-4.5, 4);
        sh.closePath();
        b.extrude("brick_white", sh, 1.4, F.mat(uc, BODY - 0.2, -1.2));
        F.box("marble", uc - 4.7, uc + 4.7, BODY + 3.8, BODY + 4.2, -1.2, 0.4, {
          seg: false,
        });
        F.window(uc, BODY + 1.2, 2.0, 2.4, {
          arch: true,
          style: "lit",
          frame: "paint_white",
          sill: "marble",
          d: 0.22,
        });
        const tp = F.pt(uc, -0.5);
        b.cyl("gold", tp[0], BODY + 9.8, tp[1], 0.04, 0.2, 2.2, 6);
      }
    };
    slope("e", Z0, Z1, X1);
    slope("w", Z0, Z1, X0);
    slope("n", X0, X1, Z0);
    slope("s", X0, X1, Z1);
    // ---- the Fifth Avenue entrance ----
    const u0 = X1; // facade plane x
    // steps (4 × 0.25) up to the entrance platform at y 1.0
    // (round 2: the platform was 1.2 m deep, so the revolving door's drum hung over the steps — now a 2.6 m deep,
    // 12 m wide marble terrace that also carries the planters, with the flight centred in front of the door)
    const PD = 2.6;
    b.box("marble", u0, 0, DOOR_Z - 6, u0 + PD, 1.0, DOOR_Z + 6);
    b.box(
      "marble",
      u0 + PD - 0.05,
      0.95,
      DOOR_Z - 6.05,
      u0 + PD + 0.08,
      1.08,
      DOOR_Z + 6.05,
      { seg: false },
    ); // nosing
    S.col(u0, 0, DOOR_Z - 6, u0 + PD, 1.0, DOOR_Z + 6);
    S.stairs("marble", u0 + PD + 1.2, DOOR_Z, "w", 8, 0, 1.0, { run: 0.3 });
    // revolving door + surround
    FE.box("marble", 13.5 - 2.6, 13.5 + 2.6, 1.0, 7.4, 0, 0.35);
    FE.box("glass_dark", 13.5 - 1.8, 13.5 + 1.8, 1.0, 5.6, 0.36, 0.38, {
      seg: false,
    });
    b.cyl("glass", u0 + 1.0, 1.0, DOOR_Z, 1.1, 1.1, 2.6, 16, {
      t0: -HP * 0.9,
      tl: PI * 0.9,
    });
    b.cyl("gold", u0 + 1.0, 1.0, DOOR_Z, 1.15, 1.15, 0.08, 16);
    b.cyl("gold", u0 + 1.0, 3.55, DOOR_Z, 1.15, 1.15, 0.1, 16);
    b.box(
      "gold",
      u0 + 1.0 - 0.03,
      1.0,
      DOOR_Z - 0.03,
      u0 + 1.0 + 0.03,
      3.6,
      DOOR_Z + 0.03,
      { seg: false },
    );
    for (let k = 0; k < 4; k++) {
      const a = k * HP + 0.3;
      b.box(
        "glass",
        u0 + 1.0 + Math.cos(a) * 0.55 - 0.5,
        1.05,
        DOOR_Z + Math.sin(a) * 0.55 - 0.02,
        u0 + 1.0 + Math.cos(a) * 0.55 + 0.5,
        3.5,
        DOOR_Z + Math.sin(a) * 0.55 + 0.02,
        { ry: -a, seg: false },
      );
    }
    // marquee canopy with THE PLAZA
    b.box("bronze", u0, 5.8, DOOR_Z - 3.6, u0 + 4.2, 6.4, DOOR_Z + 3.6);
    b.box("paint_white", u0, 5.55, DOOR_Z - 3.5, u0 + 4.1, 5.8, DOOR_Z + 3.5, {
      seg: false,
    });
    for (const s of [-1, 1])
      b.rod(
        "bronze",
        [u0 + 4.0, 6.4, DOOR_Z + s * 3.4],
        [u0 + 0.2, 9.0, DOOR_Z + s * 3.4],
        0.05,
        4,
      );
    const mq = P.texMat(
      "plaza_marquee",
      P.signTex("plaza_marquee", ["THE PLAZA"], "gilt", 1024, 128, {
        bg: "#1a1612",
        font: P.FONTS.SERIF,
        spacing: 10,
      }),
      { rough: 0.4, emissive: 0.35 },
    );
    b.quad(mq, u0 + 4.22, 6.1, DOOR_Z, 6.8, 0.55, { ry: HP });
    for (let k = -6; k <= 6; k++) {
      b.sphere("lamp_dim", u0 + 3.9, 5.5, DOOR_Z + k * 0.55, 0.06, {
        ws: 5,
        hs: 4,
      });
    }
    S.light(u0 + 2, 5, DOOR_Z, 0xffd8a0, 8, 0.7);
    S.glow(u0 + 3, 5.4, DOOR_Z, 0xffd8a0, 1.6);
    // three flags on angled poles above the canopy
    const flags = ["us", "plaza", "society"];
    flags.forEach((f, i) => {
      const fz = DOOR_Z + (i - 1) * 3.2,
        base = [u0 + 0.1, 12.5, fz],
        tip = [u0 + 5.2, 16.2, fz];
      b.rod("iron", base, tip, 0.07, 6);
      b.sphere("gold", tip[0], tip[1], tip[2], 0.14, { ws: 6, hs: 4 });
      const fk = P.texMat("flag_" + f, flagTex(f), { double: true, rough: 1 });
      const g = new THREE.PlaneGeometry(2.6, 1.6, 8, 1);
      const p = g.attributes.position;
      for (let v = 0; v < p.count; v++)
        p.setZ(v, Math.sin(p.getX(v) * 2.2 + i) * 0.12);
      b.geo(
        fk,
        g,
        P.m4(u0 + 3.9, 14.3, fz, HP, 0, 0.62).multiply(P.m4(0, -0.8, 0)),
        { uv: "keep", noAO: true, grime: 0.2 },
      );
    });
    // society's sign + velvet ropes + planters
    const soc = P.texMat(
      "plaza_soc",
      P.signTex(
        "plaza_soc",
        [
          "THE PLAZA SOCIETY",
          "Members & Guests Only",
          "Proper Attire Required",
          "Rooms by the Night",
        ],
        "poster",
        512,
        512,
        { bg: "#e8dcc0", fg: "#2a3a2a" },
      ),
      { rough: 0.9 },
    );
    b.box("wood_dark", u0 + 5.4, 0, DOOR_Z + 5.0, u0 + 5.5, 1.5, DOOR_Z + 6.2, {
      seg: false,
    });
    b.quad(soc, u0 + 5.56, 1.2, DOOR_Z + 5.6, 1.1, 1.1, { ry: HP });
    for (const s of [-1, 1])
      for (let k = 0; k < 3; k++) {
        const x = u0 + 0.35 + k * 1.0,
          z = DOOR_Z + s * 3.6,
          y0 = 1.0;
        b.cyl("gold", x, y0, z, 0.04, 0.12, 1.0, 8);
        b.sphere("gold", x, y0 + 1.02, z, 0.06, { ws: 6, hs: 4 });
        if (k < 2)
          b.geo(
            "velvet",
            new THREE.TubeGeometry(
              new THREE.QuadraticBezierCurve3(
                new THREE.Vector3(x, y0 + 0.88, z),
                new THREE.Vector3(x + 0.5, y0 + 0.62, z),
                new THREE.Vector3(x + 1.0, y0 + 0.88, z),
              ),
              8,
              0.035,
              5,
            ),
            P.m4(0, 0, 0),
            { noAO: true },
          );
      }
    for (const s of [-1, 1]) {
      b.lathe(
        "marble",
        [
          [0.001, 0],
          [0.5, 0],
          [0.7, 0.9],
          [0.75, 1.0],
          [0.001, 0.95],
        ],
        12,
        u0 + 1.6,
        1.0,
        DOOR_Z + s * 5.3,
      );
      b.sphere("grass", u0 + 1.6, 2.1, DOOR_Z + s * 5.3, 0.6, { sy: 0.8 });
    }
    // ---- Pulitzer Fountain (Grand Army Plaza) ----
    // (round 2: moved north off the entrance axis — it sat 0.3 m past the bottom step, so the way in from Fifth
    // Avenue ran into its basin and the exit put the player nose-to-rim)
    const FX = 104.2,
      FZ = -396.8;
    b.cyl("granite", FX, 0, FZ, 5.3, 5.5, 0.3, 28);
    b.cyl("granite", FX, 0.3, FZ, 4.8, 5.0, 0.3, 28);
    b.cyl("marble", FX, 0.6, FZ, 4.2, 4.3, 0.5, 28, { open: true });
    b.cyl("marble", FX, 0.55, FZ, 4.1, 4.1, 0.06, 28);
    const pool = new THREE.Mesh(
      new THREE.CircleGeometry(4.05, 28).rotateX(-HP),
      P.mat("water_toxic").clone(),
    );
    pool.position.set(FX, 0.85, FZ);
    S.root.add(pool);
    for (const [r, y, rr, h] of [
      [2.9, 1.0, 3.1, 0.6],
      [1.9, 2.1, 2.05, 0.45],
      [1.1, 3.0, 1.2, 0.35],
    ]) {
      b.lathe(
        "marble",
        [
          [0.001, 0],
          [0.35, 0],
          [0.3, 0.3],
          [r * 0.8, h * 0.7],
          [r, h],
          [r * 0.97, h + 0.05],
          [0.001, h * 0.9],
        ],
        24,
        FX,
        y - h,
        FZ,
      );
      b.cyl("bronze", FX, y - 0.1, FZ, rr * 0.2, rr * 0.25, 0.12, 12);
    }
    b.lathe(
      "marble",
      [
        [0.001, 0],
        [0.35, 0],
        [0.25, 0.9],
        [0.35, 1.2],
        [0.001, 1.25],
      ],
      12,
      FX,
      3.0,
      FZ,
    );
    D.figure(b, "bronze", FX, 4.25, FZ, -HP, 1.25, "pomona", {
      robe: true,
      grime: 0.55,
    });
    b.cyl("bronze", FX + 0.1, 4.25 + 1.25 * 1.55, FZ, 0.28, 0.2, 0.25, 10);
    b.sphere("paint_red", FX + 0.1, 4.25 + 1.25 * 1.55 + 0.25, FZ, 0.14, {
      ws: 6,
      hs: 4,
    });
    S.col(FX - 4.8, 0, FZ - 4.8, FX + 4.8, 0.6, FZ + 4.8, {
      surface: "concrete",
    });
    S.col(FX - 4.2, 0.6, FZ - 4.2, FX + 4.2, 1.1, FZ + 4.2, {
      walkable: false,
    });
    S.col(FX - 1.2, 0.6, FZ - 1.2, FX + 1.2, 4.3, FZ + 1.2, {
      walkable: false,
    });
    G.world.addRadSource({ x: FX, y: 0.8, z: FZ, radius: 5, strength: 0.6 });
    P.animate(FX, FZ, 200, (t) => {
      pool.material.emissiveIntensity = 0.2 + 0.05 * Math.sin(t * 0.9);
    });
    const plq = P.texMat(
      "plaza_pulitzer",
      P.signTex(
        "plaza_pulitzer",
        ["PULITZER FOUNTAIN", "ABUNDANCE · 1916"],
        "bronze",
        512,
        128,
        { c0: "#c8a868", c1: "#5a4020" },
      ),
      { transparent: true, metal: 0.5 },
    );
    b.quad(plq, FX - 5.31, 0.35, FZ, 1.8, 0.45, { ry: -HP });
    // benches + dead trees + wrecked hansom cab by the plaza
    for (const z of [-378.5, -375.5]) {
      b.box("wood", 104.5, 0, z, 107.5, 0.45, z + 0.5, { seg: false });
      b.box("wood", 104.5, 0.45, z + 0.42, 107.5, 0.95, z + 0.5, {
        seg: false,
      });
      S.col(104.5, 0, z, 107.5, 0.5, z + 0.5, { walkable: true });
    }
    // the entrance walk: a worn red runner from the kerb to the steps
    b.box(
      "carpet_red",
      u0 + PD + 1.2,
      0.005,
      DOOR_Z - 1.1,
      109.6,
      0.02,
      DOOR_Z + 1.1,
      { seg: false, grime: 0.85 },
    );
    b.box(
      "carpet_red",
      u0 + 0.3,
      1.005,
      DOOR_Z - 1.1,
      u0 + PD,
      1.02,
      DOOR_Z + 1.1,
      { seg: false, grime: 0.7 },
    );
    for (const [x, z] of [
      [98.6, -377],
      [109, -377],
      [99.2, -402.2],
      [109.4, -381.5],
    ]) {
      b.rod("wood_rotten", [x, 0, z], [x + 0.3, 5, z - 0.2], 0.14, 5, {
        rTop: 0.06,
      });
      const r = P.rng(x + z);
      for (let k = 0; k < 5; k++)
        b.rod(
          "wood_rotten",
          [x, 2.5 + k * 0.5, z],
          [x + (r() - 0.5) * 3, 3.5 + k * 0.6, z + (r() - 0.5) * 3],
          0.04,
          3,
        );
    }
    S.anchor("doorman", 98.9, 0, -392.2, -HP);
    S.anchor("fountain", FX - 6, 0, FZ, -HP);
    S.anchor("exterior_entrance", u0 + PD + 2.2, 0, DOOR_Z, -HP);
    S.build({ shadow: true, lod: 300 });
    return { S, DOOR_Z };
  }

  // ===================================================================
  // Registration: right after the exterior is built, 30_plaza_interior.js
  // (P.interiorBuilders.plaza_hotel) builds the interior cell, the street<->interior doors
  // and registers the G.pois entry (see P.finishSite in 00_kit.js).
  // ===================================================================
