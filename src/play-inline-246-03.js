// play-inline-246 03 — door
// Lines 123-551 of readable/play-inline-246.pretty.js (statement-aligned).
  function buildExterior(root) {
    const b = PR.batch("ren_ext");
    b.ground = 0;
    b.aoH = 4;
    const anchors = {};
    const r = PR.rng("pr_ren_ext");
    // plinths
    for (const R of [MB, PV, WN, WS])
      K.prism(
        b,
        "gneiss_dk",
        PR.rectPoly(R.x0 - 0.3, R.z0 - 0.3, R.x1 + 0.3, R.z1 + 0.3),
        -0.3,
        0.8,
      );
    // hollow shells (roofless) — walls with colliders
    K.room(b, "gneiss", MB.x0, MB.z0, MB.x1, MB.z1, 0.8, 13.4, 0.75, [], {
      grime: 0.6,
    });
    K.room(
      b,
      "gneiss",
      PV.x0,
      PV.z0,
      PV.x1,
      PV.z1,
      0.8,
      14.6,
      0.75,
      [{ side: "w", c: DOOR.z, w: 2.2, h: 3.8 }],
      { grime: 0.6 },
    );
    K.room(b, "gneiss", WN.x0, WN.z0, WN.x1, WN.z1, 0.8, 13.9, 0.75, [], {
      grime: 0.6,
    });
    K.room(b, "gneiss", WS.x0, WS.z0, WS.x1, WS.z1, 0.8, 11.6, 0.75, [], {
      grime: 0.6,
    }); // south wing: top storey fallen
    PR.colMM(PV.x0 + 0.2, 0, DOOR.z - 1.2, PV.x0 + 0.6, 4.6, DOOR.z + 1.2, {
      walkable: false,
    }); // barricaded doorway
    // belt courses
    for (const R of [MB, WN, WS])
      for (const y of [5.2, 9.6])
        K.prism(
          b,
          "limestone",
          PR.rectPoly(R.x0 - 0.1, R.z0 - 0.1, R.x1 + 0.1, R.z1 + 0.1),
          y,
          y + 0.22,
          { grime: 0.5 },
        );
    // pointed-arch windows (three storeys) on every open face
    const YS = [1.6, 6.1, 10.2];
    lancetRow(b, "w", MB.z0 + 0.8, PV.z0 - 0.4, MB.x0, YS, 2.6, {
      inner: true,
    });
    lancetRow(b, "w", PV.z1 + 0.4, MB.z1 - 0.8, MB.x0, YS, 2.6, {
      inner: true,
    });
    lancetRow(b, "e", MB.z0 + 0.8, MB.z1 - 0.8, MB.x1, YS, 2.6, {
      inner: true,
    });
    lancetRow(b, "w", WN.z0 + 0.6, WN.z1 - 0.6, WN.x0, [1.6, 6.1, 10.2], 2.4, {
      w: 1.0,
    });
    lancetRow(b, "n", WN.x0 + 1, WN.x1 - 1, WN.z0, [1.6, 6.1, 10.2], 2.8, {
      w: 1.0,
      inner: true,
    });
    lancetRow(b, "w", WS.z0 + 0.6, WS.z1 - 0.6, WS.x0, [1.6, 6.1], 2.4, {
      w: 1.0,
    });
    lancetRow(b, "s", WS.x0 + 1, WS.x1 - 1, WS.z1, [1.6, 6.1], 2.8, {
      w: 1.0,
      inner: true,
    });
    lancetRow(b, "w", PV.z0 + 1, PV.z0 + 2.6, PV.x0, [6.1, 10.2], 2.0, {
      w: 0.9,
    });
    lancetRow(b, "w", PV.z1 - 2.6, PV.z1 - 1, PV.x0, [6.1, 10.2], 2.0, {
      w: 0.9,
    });
    // central pavilion: great lancet with tracery + gable + pinnacles
    PR.lancetWindow(b, PV.x0 - 0.05, 8.2, DOOR.z, -HP, 2.4, 5.2, {
      glass: "glass_broken",
      frame: "limestone",
      frameW: 0.26,
      mullion: true,
    });
    b.add("limestone", new THREE.TorusGeometry(0.45, 0.07, 5, 12), {
      m: PR.m4(PV.x0 - 0.1, 12.2, DOOR.z, -HP),
    });
    const gab = new THREE.Shape();
    gab.moveTo(PV.z0 - 0.2, 0);
    gab.lineTo(PV.z1 + 0.2, 0);
    gab.lineTo(DOOR.z, 5.6);
    gab.closePath();
    const gg = new THREE.ExtrudeGeometry(gab, {
      depth: 0.75,
      bevelEnabled: false,
    });
    gg.rotateY(-HP);
    b.add("gneiss", gg, { m: PR.m4(PV.x0 + 0.75, 14.6, 0), grime: 0.6 });
    const trefoil = new THREE.CircleGeometry(0.7, 3 * 6);
    b.add("glass_broken", trefoil, {
      m: PR.m4(PV.x0 - 0.03, 16.4, DOOR.z, -HP),
      uv: "box",
      noAO: true,
    });
    for (const k of [0, 1, 2]) {
      const a = HP + (k * TAU) / 3;
      b.add("limestone", new THREE.TorusGeometry(0.32, 0.06, 4, 10), {
        m: PR.m4(
          PV.x0 - 0.06,
          16.4 + Math.sin(a) * 0.36,
          DOOR.z + Math.cos(a) * 0.36,
          -HP,
        ),
      });
    }
    // gable coping + finial
    const gl = Math.hypot((PV.z1 - PV.z0) / 2 + 0.2, 5.6);
    const ga = Math.atan2(5.6, (PV.z1 - PV.z0) / 2 + 0.2);
    for (const sg of [-1, 1])
      b.box(
        "limestone",
        PV.x0 + 0.35,
        14.6 + 2.8,
        DOOR.z + sg * ((PV.z1 - PV.z0) / 4 + 0.1),
        0.95,
        0.3,
        gl,
        { rx: sg * ga, seg: false },
      );
    K.pinnacle(b, "limestone", PV.x0 + 0.35, 20.0, DOOR.z, 0.5, 2.4);
    for (const z of [PV.z0, PV.z1]) {
      b.box("gneiss", PV.x0 - 0.1, 0.8, z, 1.1, 14.2, 1.1, {
        seg: false,
        grime: 0.6,
      });
      K.pinnacle(b, "limestone", PV.x0 - 0.1, 15.0, z, 0.8, 3.6);
    }
    // doorway: pointed arch surround, heavy plank barricade (half torn away), plague cross
    PR.lancetWindow(b, PV.x0 - 0.06, 0.8, DOOR.z, -HP, 2.2, 3.8, {
      glass: "glass_broken",
      frame: "limestone",
      frameW: 0.3,
      sill: false,
    });
    for (const [y, rz, len] of [
      [1.2, 0.08, 2.8],
      [1.9, -0.12, 2.6],
      [2.9, 0.3, 1.6],
      [3.5, -0.05, 2.7],
    ])
      b.box(
        "planks",
        PV.x0 - 0.2,
        y,
        DOOR.z + (len < 2 ? 0.6 : 0),
        0.08,
        0.26,
        len,
        { rx: rz, seg: false, grime: 0.8 },
      );
    const plague = PR.texMat(
      "pr_ren_plague",
      PR.graffitiTex("pr_ren_plague", ["X", "PLAGUE"], 512, 512, {
        color: "#b82014",
      }),
      { transparent: true },
    );
    b.quad(plague, PV.x0 - 0.28, 2.6, DOOR.z, 2.0, 2.0, { ry: -HP });
    // end-wing crenellations & turrets; main range parapet (broken in places)
    crenelRect(b, WN, 13.9);
    crenelRect(b, PV, 14.6, null, [3]);
    for (const [x, z] of [
      [WN.x0, WN.z0],
      [WN.x1, WN.z0],
      [WN.x0, WN.z1],
      [WS.x0, WS.z1],
      [WS.x1, WS.z1],
    ]) {
      b.cyl(
        "gneiss",
        x,
        0.8,
        z,
        0.75,
        0.85,
        (z > -380 ? 11.6 : 13.9) + 0.8,
        8,
        { hSeg: 3 },
      );
      K.pinnacle(b, "limestone", x, z > -380 ? 12.4 : 14.7, z, 0.8, 3.6);
    }
    for (let z = MB.z0 + 0.8; z < MB.z1 - 0.8; z += 1.4) {
      for (const x of [MB.x0 + 0.375, MB.x1 - 0.375]) {
        if (Math.sin(z * 1.7 + x) > 0.6) continue; // gaps where the parapet fell
        b.box(
          "gneiss",
          x,
          13.4,
          z,
          0.75,
          0.6 + (Math.floor(z + x) % 2 ? 0.8 : 0),
          0.8,
          { seg: false, grime: 0.6 },
        );
      }
    }
    // broken wall tops of the south wing (jagged)
    for (let x = WS.x0 + 0.5; x < WS.x1; x += 0.9)
      b.box("gneiss", x, 11.6, WS.z1 - 0.35, 0.9, r() * 1.8, 0.7, {
        seg: false,
        grime: 0.7,
      });
    // buttresses along the east face
    for (let z = MB.z0 + 3.2; z < MB.z1 - 2; z += 5.2) {
      b.box("gneiss_dk", MB.x1 + 0.5, 0, z, 1.0, 9, 0.9, {
        seg: false,
        grime: 0.6,
      });
      b.box("limestone", MB.x1 + 0.45, 9, z, 0.9, 0.5, 0.95, {
        rz: 0.5,
        seg: false,
      });
      PR.col(MB.x1 + 0.5, z, 1.0, 0.9, 0, 9, 0, { walkable: false });
    }
    // steel shoring frames (stabilisation) against the west face
    for (const z of [MB.z0 + 2.5, MB.z1 - 2.5]) {
      const bx = MB.x0 - 5.5;
      b.box("rust", bx, 0, z, 0.35, 1.0, 0.35, { seg: false });
      b.box("concrete", bx, 0, z, 1.2, 0.5, 1.2, { seg: false });
      b.beam("paint_red", V3(bx, 0.5, z), V3(MB.x0 - 0.1, 10.5, z), 0.32, 0.32);
      b.beam("paint_red", V3(bx, 0.5, z), V3(MB.x0 - 0.1, 5.5, z), 0.28, 0.28);
      b.beam(
        "paint_red",
        V3(MB.x0 - 0.2, 0.2, z),
        V3(MB.x0 - 0.2, 11, z),
        0.3,
        0.3,
      );
      b.beam("rust", V3(bx + 1.5, 2.8, z), V3(MB.x0 - 0.2, 2.8, z), 0.12, 0.12);
      PR.col(bx, z, 1.2, 1.2, 0, 1.2, 0, { walkable: false });
    }
    // inside the shell (visible from the bridge): rubble, fallen joists, trees, vines
    D.rubble(b, 405, 0.8, -385, 2.2, 10, 3);
    D.rubble(b, 408, 0.8, -376, 1.6, 8, 4);
    D.rubble(b, 404, 0.8, -392, 1.4, 6, 5);
    b.boxMM(
      "dirt",
      MB.x0 + 0.7,
      0.75,
      MB.z0 + 0.7,
      MB.x1 - 0.7,
      0.82,
      MB.z1 - 0.7,
      { seg: false, grime: 0.4 },
    );
    for (const [z, y, tilt] of [
      [-392, 5.2, 0.4],
      [-389, 9.4, -0.3],
      [-381, 5.2, 0.9],
      [-374, 9.4, 0.2],
      [-377, 5.2, -0.6],
    ]) {
      b.beam(
        "char",
        V3(MB.x0 + 0.7, y, z),
        V3(MB.x1 - 0.7, y - Math.abs(tilt) * 3, z + tilt),
        0.22,
        0.3,
      );
    }
    for (const [x, z, h] of [
      [405, -384, 15],
      [409, -392, 12],
      [404.5, -375, 13],
      [409, -369, 9],
    ])
      PR.deadTree(b, x, 0.8, z, h, Math.round(x * z));
    const vks = [PR.vineKey(0), PR.vineKey(1), PR.vineKey(2)];
    const vines = [
      [MB.x0 - 0.05, 11.2, -392, -HP, 3.2, 6],
      [MB.x0 - 0.05, 12, -375, -HP, 4, 8],
      [PV.x0 - 0.12, 12.8, -385.5, -HP, 2.5, 7],
      [MB.x1 + 0.05, 11.5, -388, HP, 5, 8],
      [MB.x1 + 0.05, 12.5, -377, HP, 4, 9],
      [WN.x0 + 4, 12.8, WN.z0 - 0.05, PI, 5, 9],
      [WS.x0 + 6, 10.5, WS.z1 + 0.05, 0, 6, 7],
      [MB.x0 + 0.72, 11.5, -386, HP, 4, 8],
      [MB.x1 - 0.72, 12, -380, -HP, 4, 9],
      [WN.x1 + 0.05, 11, -397.4, HP, 3, 7],
    ];
    vines.forEach((v, i) =>
      b.quad(vks[i % 3], v[0], v[1], v[2], v[4], v[5], { ry: v[3] }),
    );
    // chain-link quarantine fence around the ruin (gap = gate at the front walk)
    const s = G.LAYOUT.getSite("smallpox_hospital") || {
      x0: 384,
      x1: 428,
      z0: -400,
      z1: -366,
    };
    const fence = [
      [s.x0 + 1, DOOR.z - 2.5],
      [s.x0 + 1, s.z0 + 0.8],
      [s.x1 - 1, s.z0 + 0.8],
      [s.x1 - 1, s.z1 - 0.8],
      [s.x0 + 1, s.z1 - 0.8],
      [s.x0 + 1, DOOR.z + 2.5],
    ];
    const ck = PR.chainKey();
    for (let i = 0; i < fence.length - 1; i++) {
      const a = fence[i],
        c = fence[i + 1];
      const len = Math.hypot(c[0] - a[0], c[1] - a[1]),
        ry = Math.atan2(c[0] - a[0], c[1] - a[1]) - HP;
      b.quad(ck, (a[0] + c[0]) / 2, 1.25, (a[1] + c[1]) / 2, len, 2.3, {
        ry,
        us: len / 1.4,
        vs: 2.3 / 1.4,
      });
      const n = Math.max(1, Math.round(len / 3));
      for (let k = 0; k <= n; k++) {
        const t = k / n;
        b.box(
          "steel",
          a[0] + (c[0] - a[0]) * t,
          0,
          a[1] + (c[1] - a[1]) * t,
          0.07,
          2.6,
          0.07,
          { seg: false },
        );
      }
      b.beam("steel", V3(a[0], 2.4, a[1]), V3(c[0], 2.4, c[1]), 0.05, 0.05);
      for (let w = 0; w < 3; w++)
        b.beam(
          "iron",
          V3(a[0], 2.55 + w * 0.12, a[1]),
          V3(c[0], 2.55 + w * 0.12, c[1]),
          0.015,
          0.015,
        );
      PR.colWall(a[0], a[1], c[0], c[1], 0.2, 0, 2.6, {
        walkable: false,
        surface: "metal",
      });
    }
    // gate leaves lying open
    b.quad(ck, s.x0 - 0.2, 1.25, DOOR.z - 3.6, 2.4, 2.3, {
      ry: 0.3,
      us: 2.4 / 1.4,
      vs: 2.3 / 1.4,
    });
    const qk = PR.texMat(
      "pr_ren_quar",
      PR.signTex(
        "pr_ren_quar",
        ["QUARANTINE", "DEPT. OF HEALTH — CITY OF NEW YORK", "NO ADMITTANCE"],
        "enamel",
        512,
        256,
        { bg: "#c8a820", fg: "#1a1a14" },
      ),
    );
    b.quad(qk, s.x0 + 1.06, 1.6, DOOR.z - 4.5, 1.4, 0.7, { ry: -HP });
    b.quad(qk, s.x0 + 0.94, 1.6, DOOR.z - 4.5, 1.4, 0.7, { ry: HP });
    const armyK = PR.texMat(
      "pr_ren_army",
      PR.signTex(
        "pr_ren_army",
        ["U.S. ARMY", "BIOLOGICAL HAZARD", "AUTHORIZED PERSONNEL ONLY"],
        "enamel",
        512,
        256,
        { bg: "#2a3a24", fg: "#e8e0b0" },
      ),
    );
    b.quad(armyK, s.x0 + 1.06, 1.6, DOOR.z + 4.5, 1.4, 0.7, { ry: -HP });
    const plq = PR.texMat(
      "pr_ren_plq",
      PR.signTex(
        "pr_ren_plq",
        [
          "SMALLPOX HOSPITAL",
          "JAMES RENWICK JR., ARCHITECT, 1856",
          "LANDMARK OF THE CITY OF NEW YORK",
        ],
        "bronze",
        512,
        256,
      ),
    );
    b.box("gneiss_dk", PV.x0 - 3.5, 0, DOOR.z + 3.2, 0.5, 1.2, 1.2, {
      seg: false,
    });
    b.quad(plq, PV.x0 - 3.76, 0.8, DOOR.z + 3.2, 1.1, 0.55, { ry: -HP, rx: 0 });
    PR.col(PV.x0 - 3.5, DOOR.z + 3.2, 0.5, 1.2, 0, 1.2, 0, { walkable: false });
    // front walk, a burnt army truck and dead soldiers
    b.box(
      "sidewalk",
      (s.x0 + PV.x0) / 2,
      -0.05,
      DOOR.z,
      PV.x0 - s.x0,
      0.1,
      2.6,
      { seg: false, grime: 0.6 },
    );
    PR.car(b, s.x0 + 6, 0, DOOR.z + 9, 1.3, { paint: "army", seed: 7 });
    for (const [x, z, a] of [
      [s.x0 + 4, DOOR.z - 6, 0.4],
      [PV.x0 - 2.2, DOOR.z + 1.4, 2.8],
    ])
      PR.skeleton(b, x, 0.03, z, a);
    PR.sandbags(b, PV.x0 - 3, DOOR.z - 3.4, PV.x0 - 3, DOOR.z - 1.6, 3, {});
    anchors.entrance = PR.anchor(PV.x0 - 1.6, 0, DOOR.z, HP);
    b.build(root);
    return anchors;
  }

  // ===================================================================
  // INTERIOR
  // ===================================================================
