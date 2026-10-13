/* src/poi_roosevelt/20_renwick.js */
/* =====================================================================
 * NEW RAD CITY — POI ROOSEVELT — RENWICK SMALLPOX HOSPITAL
 * (James Renwick Jr., 1856 — Gothic Revival, the island's own gneiss)
 * Exterior (site x 384..428, z -400..-366): the famous roofless ruin —
 * main range with a gabled central pavilion (great lancet + trefoil,
 * corner pinnacles), crenellated end wings with turrets, pointed-arch
 * windows open to the sky, hood moulds, buttresses, steel shoring frames,
 * dead trees growing inside the shell, vines, chain-link quarantine fence.
 * Interior (INTERIORS.smallpox_hospital, lifted +6 so the cellar stays above
 * the cell's y = 0 ground):
 *   G: entrance hall + grand stair; north ward (collapsed ceiling, the
 *      bolted cellar hatch); SURGICAL THEATRE (tiered benches rising to F1,
 *      operating pit, the quarantine-cellar stair behind a locked gate)
 *   F1: nurses' station (terminal), isolation rooms (one floor fallen in),
 *      nurses' quarters (the quarantine key); the roof is gone — daylight
 *   Cellar: QUARANTINE CELLAR — barred cells, morgue (terminal → lab seal),
 *      the Kessler-Haas field laboratory (K-agent culture tanks, lurcher nest, the
 *      Matron) and the loop stair back up to the ward hatch.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE || !G._pr) return;
  const PR = G._pr;
  const K = PR.kit,
    D = PR.dress;
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  const PI = Math.PI,
    HP = PI / 2,
    TAU = PI * 2;
  const BASE = 6; // interior lift (cellar floor at world y = 1.5)
  const CY = -4.5; // cellar level (local)

  // footprint (exterior)
  const MB = { x0: 399.5, x1: 412.5, z0: -395, z1: -371 }; // main range
  const PV = { x0: 395.5, x1: 399.5, z0: -387.5, z1: -378.5 }; // central pavilion (west)
  const WN = { x0: 397, x1: 413, z0: -399.8, z1: -395 }; // north wing
  const WS = { x0: 397, x1: 413, z0: -371, z1: -366.4 }; // south wing
  const DOOR = { x: PV.x0, z: (PV.z0 + PV.z1) / 2 };

  PR.flagDefaults.ren_hatch = false;
  PR.flagDefaults.ren_purged = false;
  PR.flagDefaults.ren_seal = false;

  // ===================================================================
  // EXTERIOR
  // ===================================================================
  function lancetRow(b, face, a0, a1, fixed, ys, spacing, opts) {
    // face: 'w'|'e'|'n'|'s' outward normal; windows along the run a0..a1 at the given ys
    const ry = { w: -HP, e: HP, n: PI, s: 0 }[face];
    const n = Math.max(1, Math.floor((a1 - a0) / spacing));
    const start = (a1 - a0 - (n - 1) * spacing) / 2 + a0;
    for (const y of ys)
      for (let i = 0; i < n; i++) {
        const t = start + i * spacing;
        const out = face === "w" || face === "n" ? -0.04 : 0.04;
        const x = face === "w" || face === "e" ? fixed + out : t,
          z = face === "w" || face === "e" ? t : fixed + out;
        PR.lancetWindow(b, x, y, z, ry, opts.w || 1.1, opts.h || 2.8, {
          glass: "glass_broken",
          frame: "limestone",
          frameW: 0.18,
          sill: true,
          mullion: opts.mullion,
        });
        // hood mould
        const c = Math.cos(ry),
          s = Math.sin(ry);
        b.box(
          "limestone",
          x + s * 0.12,
          y + (opts.h || 2.8) + 0.15,
          z + c * 0.12,
          (opts.w || 1.1) + 0.7,
          0.14,
          0.2,
          { ry, seg: false, grime: 0.4 },
        );
        if (opts.inner) {
          // same opening seen from inside the roofless shell
          const ix =
              face === "w" ? fixed + 0.78 : face === "e" ? fixed - 0.78 : x,
            iz = face === "n" ? fixed + 0.78 : face === "s" ? fixed - 0.78 : z;
          b.add(
            "glass_broken",
            PR.shapeGeo(PR.lancetShape(opts.w || 1.1, opts.h || 2.8), 6),
            { m: PR.m4(ix, y, iz, ry + PI), uv: "keep", noAO: true },
          );
        }
      }
  }
  function crenelRect(b, R, y, key, skip) {
    const i = 0.375,
      x0 = R.x0 + i,
      x1 = R.x1 - i,
      z0 = R.z0 + i,
      z1 = R.z1 - i;
    const e = [
      [x0, z0, x1, z0],
      [x1, z0, x1, z1],
      [x1, z1, x0, z1],
      [x0, z1, x0, z0],
    ];
    e.forEach((q, k) => {
      if (!skip || skip.indexOf(k) < 0)
        PR.crenels(
          b,
          key || "gneiss",
          q[0],
          q[1],
          q[2],
          q[3],
          y,
          0.75,
          1.4,
          0.8,
          0.6,
        );
    });
  }
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
  function buildInterior(cell, extAnchors) {
    const O = cell.origin,
      ox = O.x,
      oy = O.y + BASE,
      oz = O.z;
    const X = (x) => ox + x,
      Y = (y) => oy + y,
      Z = (z) => oz + z;
    const P = (x, y, z) => V3(ox + x, oy + y, oz + z);
    const A = (x, y, z, yaw) => PR.anchor(ox + x, oy + y, oz + z, yaw || 0);
    const anchors = {};
    const root = cell.root;
    const r = PR.rng("pr_ren_int");
    let b = null;
    const W = (key, ax, a0, a1, f0, f1, y0, y1, gaps, o) =>
      PR.wall(
        b,
        key,
        ax,
        ax === "x" ? X(a0) : Z(a0),
        ax === "x" ? X(a1) : Z(a1),
        ax === "x" ? Z(f0) : X(f0),
        ax === "x" ? Z(f1) : X(f1),
        Y(y0),
        Y(y1),
        (gaps || []).map((g) => ({
          c: ax === "x" ? X(g.c) : Z(g.c),
          w: g.w,
          y0: Y(g.y0),
          h: g.h,
        })),
        o,
      );
    const floor = (key, x0, z0, x1, z1, y, t, o) => {
      b.boxMM(
        key,
        X(x0),
        Y(y - (t || 0.35)),
        Z(z0),
        X(x1),
        Y(y),
        Z(z1),
        o || { grime: 0.5 },
      );
      PR.colMM(X(x0), Y(y - (t || 0.35)), Z(z0), X(x1), Y(y), Z(z1));
    };
    const ceil = (key, x0, z0, x1, z1, y, o) =>
      b.boxMM(
        key,
        X(x0),
        Y(y),
        Z(z0),
        X(x1),
        Y(y + 0.3),
        Z(z1),
        o || { seg: false, grime: 0.3 },
      );
    const box = (key, x, y, z, w, h, d, o) =>
      b.box(key, X(x), Y(y), Z(z), w, h, d, o || { seg: false });
    const col = (x, z, w, d, y0, y1, ry, o) =>
      PR.col(X(x), Z(z), w, d, Y(y0), Y(y1), ry || 0, o || { walkable: false });
    const lancetIn = (x, y, z, ry, w, h, glass) =>
      PR.lancetWindow(b, X(x), Y(y), Z(z), ry, w, h, {
        glass: glass || "win_day",
        frame: "limestone",
        frameW: 0.16,
        sill: true,
        out: 0.02,
      });

    // ---------------- baked lights ----------------
    const L = [];
    const Lp = (x, y, z, color, rr, i) =>
      L.push({ x: X(x), y: Y(y), z: Z(z), color, r: rr, i });
    for (const z of [-12, 0, 12]) Lp(0, 13, z, 0xbcc8ac, 16, 0.5); // open sky
    Lp(-5, 7, -10, 0xbcc8ac, 10, 0.35);
    Lp(-1, 3.6, 0, 0xffe0b0, 10, 0.6);
    Lp(-6, 2.5, 0, 0xd8dcc0, 6, 0.4);
    Lp(0, 3, 15.5, 0xf0f4ff, 9, 0.55); // theatre skylight/lamp
    Lp(-3, 7.4, -1, 0x60ff90, 6, 0.55); // nurse terminal
    Lp(6, CY + 3, 12, 0xffd890, 8, 0.45);
    Lp(6, CY + 3, 6, 0xffd890, 7, 0.35);
    Lp(1.5, CY + 2.5, 10, 0xffc890, 7, 0.25);
    Lp(0, CY + 3, -1, 0xc8e0ff, 9, 0.45); // morgue
    Lp(-3, CY + 1.5, -12, 0x70ff40, 10, 0.9);
    Lp(3, CY + 1.5, -12, 0x70ff40, 10, 0.8);
    Lp(0, CY + 3, -16, 0xff3020, 8, 0.45);
    Lp(-6, CY + 2.5, -11, 0xffc890, 6, 0.4);
    b = PR.batch("ren_int");
    b.ground = oy + CY;
    b.aoH = 3;
    b.setLights(L, 0x909aa0, 0.08);

    // shell: outer walls (gneiss inside, three storeys + open top), x -7..7, z -18..18
    for (const [x0, x1] of [
      [-7.7, -7],
      [7, 7.7],
    ])
      W(
        "gneiss",
        "z",
        -18.7,
        18.7,
        x0,
        x1,
        CY,
        13.5,
        x0 < 0 ? [{ c: 0, w: 2.2, y0: 0, h: 3.6 }] : [],
        { grime: 0.6 },
      );
    for (const [z0, z1] of [
      [-18.7, -18],
      [18, 18.7],
    ])
      W("gneiss", "x", -7, 7, z0, z1, CY, 13.5, [], { grime: 0.6 });
    // crenellated wall tops against the sky
    PR.crenels(
      b,
      "gneiss",
      X(-7.35),
      Z(-18.35),
      X(-7.35),
      Z(18.35),
      Y(13.5),
      0.7,
      1.3,
      0.8,
      0.6,
    );
    PR.crenels(
      b,
      "gneiss",
      X(7.35),
      Z(-18.35),
      X(7.35),
      Z(18.35),
      Y(13.5),
      0.7,
      1.3,
      0.8,
      0.6,
    );
    // sky beyond the missing roof
    b.boxMM("sky_patch", X(-9), Y(15.8), Z(-20), X(9), Y(15.9), Z(20), {
      seg: false,
      noAO: true,
      grime: 0,
    });
    // lancet windows (glowing daylight) on the long walls, both storeys
    for (const z of [-15.5, -11.5, -7.5, 7.5, 11.5, 15.5, -3.2, 3.2]) {
      for (const y of [1.2, 6.2, 10.2]) {
        if (Math.abs(z) < 4 && y < 4) continue;
        lancetIn(-6.98, y, z, HP, 1.0, 2.6);
        lancetIn(6.98, y, z, -HP, 1.0, 2.6);
      }
    }
    // vines hanging inside from the wall tops
    const vk = [PR.vineKey(0), PR.vineKey(1), PR.vineKey(2)];
    for (let k = 0; k < 12; k++) {
      const side = k % 2 ? 1 : -1,
        z = -16 + k * 2.9;
      b.quad(
        vk[k % 3],
        X(side * 6.97),
        Y(10.5 + (k % 3)),
        Z(z),
        3.0,
        6 + (k % 3) * 1.5,
        { ry: side > 0 ? -HP : HP },
      );
    }

    // =============================== GROUND FLOOR ===============================
    // slab pieces around the two openings: H1 = cellar hatch (x -7..-5.2, z -16.4..-14.4), H2 = theatre stairwell (x 1..7, z 16.2..18)
    floor("slate", -7, -14.4, 7, 13.5, 0, 0.4, { grime: 0.7 });
    floor("slate", -5.2, -18, 7, -14.4, 0, 0.4, { grime: 0.7 });
    floor("slate", -7, -18, -5.2, -16.4, 0, 0.4, { grime: 0.7 });
    // ---- entrance hall (z -5..5) + grand stair (east side, climbs north) ----
    W("gneiss_dk", "x", -7, 7, -5.3, -5, 0, 5, [
      { c: 0, w: 2.2, y0: 0, h: 3.2 },
    ]);
    W("gneiss_dk", "x", -7, 7, 5, 5.3, 0, 5, [
      { c: -6.1, w: 1.6, y0: 0, h: 2.6 },
    ]);
    b.quad("oak", X(-6.97), Y(1.8), Z(0), 2.0, 3.4, { ry: HP });
    PR.door({
      id: "pr_ren_exit",
      pos: P(-6.6, 1.6, 0),
      label: "Blackwell's Island",
      verb: "Exit",
      radius: 1.4,
      target: {
        x: extAnchors.entrance.x,
        y: 0.05,
        z: extAnchors.entrance.z,
        yaw: HP,
      },
    });
    anchors.entrance = A(-5.2, 0, 0, -HP);
    PR.treads(b, "oak", X(4.9), Z(4.4), PI, 3.4, 8.4, Y(0), Y(5), {
      maxRise: 0.25,
      surface: "wood",
      thick: 0.3,
    });
    b.beam("oak", P(3.2, -0.1, 4.4), P(3.2, 4.8, -4), 0.12, 0.35); // stringer
    for (let k = 0; k < 10; k++) {
      const t = k / 9;
      box("oak", 3.2, 5 * t, 4.4 - 8.4 * t, 0.06, 1.0, 0.06);
    }
    b.beam("oak", P(3.2, 1.0, 4.4), P(3.2, 6.0, -4), 0.08, 0.1);
    for (let s2 = 0; s2 < 5; s2++) {
      const t = (s2 + 0.5) / 5;
      col(3.2, 4.4 - 8.4 * t, 0.12, 1.7, 5 * t - 0.2, 5 * t + 1.0);
    }
    b.boxMM("plaster_w", X(3.2), Y(-0.1), Z(-4.1), X(7), Y(0.02), Z(4.5), {
      seg: false,
    });
    // hall dressing: benches, a toppled reception desk, a heap of bedding burnt in a barrel, dead
    box("oak", -2.5, 0, -3.8, 3.0, 1.0, 0.7);
    col(-2.5, -3.8, 3.0, 0.7, 0, 1.0);
    PR.barrel(b, X(-4.2), Y(0), Z(3.2), { fire: false });
    for (const [x, z, a] of [
      [-1.5, 1.5, 1.1],
      [1.5, -1, -0.6],
    ])
      PR.skeleton(b, X(x), Y(0.02), Z(z), a);
    D.papers(b, X(0), Y(0.01), Z(0), 4, 20, 56);
    PR.bench(b, X(-6.3), Y(0), Z(-2.4), HP);
    PR.bench(b, X(-6.3), Y(0), Z(2.4), HP);
    b.beam("iron", P(-1, 4.65, 0), P(-1, 3.7, 0), 0.03, 0.03);
    b.cyl("brass", X(-1), Y(3.4), Z(0), 0.15, 0.45, 0.3, 10, { hSeg: 1 });
    b.sphere("lamp_warm", X(-1), Y(3.35), Z(0), 0.14, { ws: 8, hs: 6 });
    PR.glow(P(-1, 3.3, 0), 0xffd8a0, 1.8, root, {
      intensity: 1.0,
      flicker: 0.2,
    });
    anchors.hall = A(-1, 0, 0, 0);
    anchors.spawn1 = A(1.5, 0, 2.5, -HP);

    // ---- north ward (z -18..-5): beds, collapsed ceiling, the cellar hatch ----
    for (let z = -7.5; z > -17; z -= 3.2)
      for (const sx of [-1, 1]) {
        if (sx < 0 && z < -13) continue; // hatch corner
        PR.bed(b, X(sx * 5.4), Y(0), Z(z), sx > 0 ? -HP : HP, {
          skeleton: ((z * 3 + sx) | 0) % 4 === 0,
          tilt: r() - 0.5,
        });
      }
    b.rock("rubble", X(-1), Y(0), Z(-12), 1.9, {
      flat: 0.12,
      rough: 0.5,
      seed: 81,
    }); // what fell from the floor above
    for (let i = 0; i < 12; i++) {
      const a = i * 2.4,
        d = 1.2 + (i % 4) * 0.5;
      b.rock(
        i % 3 ? "rubble" : "concrete",
        X(-1 + Math.cos(a) * d),
        Y(0.05),
        Z(-12 + Math.sin(a) * d),
        0.15 + (i % 5) * 0.07,
        { flat: 0.6, detail: 0, seed: i },
      );
    }
    b.beam("char", P(-4, 5, -9), P(-0.5, 0.2, -12.5), 0.22, 0.3);
    b.beam("char", P(2, 5, -15), P(-1.5, 0.3, -11), 0.2, 0.28);
    PR.wheelchair(b, X(2), Y(0), Z(-8), 0.7, true);
    anchors.ward = A(1.5, 0, -11, 0);
    anchors.spawn2 = A(3, 0, -15.5, 0);
    // the hatch (x -7..-5.2, z -16.4..-14.4) — opens from below
    const H = { x0: -7, x1: -5.2, z0: -16.4, z1: -14.4 };
    const hatchG = new THREE.Group();
    const hb = PR.batch("ren_hatch");
    hb.boxMM("rotten", X(H.x0), Y(-0.12), Z(H.z0), X(H.x1), Y(0.04), Z(H.z1), {
      seg: false,
      grime: 0.7,
    });
    for (const t of [0.25, 0.75])
      hb.boxMM(
        "iron",
        X(H.x0 + 0.1),
        Y(0.04),
        Z(H.z0 + (H.z1 - H.z0) * t - 0.06),
        X(H.x1 - 0.1),
        Y(0.07),
        Z(H.z0 + (H.z1 - H.z0) * t + 0.06),
        { seg: false },
      );
    hb.build(hatchG, { noLOD: true });
    root.add(hatchG);
    const hatchOpenG = new THREE.Group();
    const hb2 = PR.batch("ren_hatch2");
    hb2.boxMM(
      "rotten",
      X(H.x1 - 0.05),
      Y(0),
      Z(H.z0),
      X(H.x1 + 0.11),
      Y(1.8),
      Z(H.z1),
      { seg: false, grime: 0.7 },
    );
    hb2.build(hatchOpenG, { noLOD: true });
    root.add(hatchOpenG);
    let hatchCol = null;
    const setHatch = (open) => {
      hatchG.visible = !open;
      hatchOpenG.visible = !!open;
      if (open && hatchCol) {
        try {
          G.world.removeCollider(hatchCol);
        } catch (e) {
          /* */
        }
        hatchCol = null;
      }
      if (!open && !hatchCol)
        hatchCol = PR.colMM(
          X(H.x0),
          Y(-0.4),
          Z(H.z0),
          X(H.x1),
          Y(0.02),
          Z(H.z1),
          { surface: "wood" },
        );
    };
    setHatch(false);
    PR.flagWatch.push((k) => {
      if (k === "*" || k === "ren_hatch") setHatch(!!PR.flag("ren_hatch"));
    });
    PR.use({
      pos: P((H.x0 + H.x1) / 2, -0.1, (H.z0 + H.z1) / 2),
      radius: 1.1,
      range: 3.0,
      label: "Cellar Hatch",
      verb: () =>
        PR.flag("ren_hatch")
          ? "Open"
          : G.player.pos.y < Y(-0.3)
            ? "Unbolt"
            : "Open",
      enabled: () => !PR.flag("ren_hatch"),
      onInteract() {
        if (G.player.pos.y < Y(-0.3)) {
          PR.setFlag("ren_hatch", true);
          PR.sfx("door_open", P(-6, 0, -15.4));
          G.notify("You slide the bolts back and heave the hatch open.");
        } else {
          PR.sfx("door_locked");
          G.notify("The hatch is bolted from below.");
        }
      },
    });
    anchors.hatch = A(-6.1, 0, -13.4, PI);

    // ---- surgical theatre (south, z 5.3..18): tiers rising north to F1, operating pit, cellar stair ----
    W("gneiss_dk", "z", 5.3, 13.5, -5.5, -5.2, 0, 5, []); // aisle wall (west side of the tiers)
    for (let k = 1; k <= 10; k++) {
      const top = 0.5 * k,
        zA = 13.5 - 0.8 * k,
        zB = 13.5 - 0.8 * (k - 1);
      b.boxMM("oak", X(-5.2), Y(0), Z(zA), X(7), Y(top), Z(zB), {
        seg: false,
        grime: 0.5,
      });
      PR.colMM(X(-5.2), Y(0), Z(zA), X(7), Y(top), Z(zB), { surface: "wood" });
      if (k < 10)
        box("rotten", 0.9, top, zA + 0.15, 11.8, 0.42, 0.3, {
          seg: false,
          grime: 0.5,
        }); // bench seat back
      if (k % 3 === 0)
        D.papers(b, X(r() * 8 - 3), Y(top + 0.01), Z(zA + 0.4), 1, 4, k);
    }
    b.boxMM("oak", X(-5.2), Y(0), Z(5.3), X(7), Y(4.5), Z(5.5), { seg: false });
    // rail along the pit edge
    PR.railing(
      b,
      [
        [X(-5.2), Z(13.6)],
        [X(7), Z(13.6)],
      ],
      Y(0.5),
      0.9,
      "brass",
      { postStep: 1.2 },
    );
    floor("tile_wall", -7, 13.5, 7, 16.2, 0.02, 0.42, {
      seg: false,
      grime: 0.6,
    });
    floor("tile_wall", -7, 16.2, 1.0, 18, 0.02, 0.42, {
      seg: false,
      grime: 0.6,
    });
    box("enamel_w", 0, 0, 15.5, 0.4, 0.8, 0.4);
    box("enamel_w", 0, 0.8, 15.5, 0.8, 0.12, 2.0);
    col(0, 15.5, 0.9, 2.0, 0, 0.95);
    PR.skeleton(b, X(0), Y(0.95), Z(15.4), 0.1);
    b.lathe(
      "enamel_w",
      [
        [0.05, 0.3],
        [0.6, 0.25],
        [0.8, 0.05],
        [0.75, 0.0],
      ],
      16,
      X(0),
      Y(3.6),
      Z(15.5),
      {},
    );
    b.add("lamp", new THREE.CircleGeometry(0.62, 16), {
      m: PR.m4(X(0), Y(3.62), Z(15.5), 0, HP),
      uv: "box",
      noAO: true,
    });
    b.beam("iron", P(0, 3.9, 15.5), P(0, 13.5, 15.5), 0.03, 0.03);
    PR.glow(P(0, 3.5, 15.5), 0xf0f8ff, 2.6, root, {
      intensity: 1.0,
      flicker: 0.08,
    });
    box("chrome", -3.2, 0, 16.5, 1.0, 0.9, 0.5);
    for (let k = 0; k < 5; k++)
      box("chrome", -3.5 + k * 0.15, 0.9, 16.5, 0.03, 0.02, 0.28);
    col(-3.2, 16.5, 1.0, 0.5, 0, 0.9);
    const thK = PR.texMat(
      "pr_ren_theatre",
      PR.canvasTex(
        "pr_ren_theatre",
        512,
        256,
        (ctx, w, h) => {
          ctx.fillStyle = "#1a1c18";
          ctx.fillRect(0, 0, w, h);
          ctx.strokeStyle = "#d8d8c8";
          ctx.lineWidth = 3;
          ctx.font = "18px Georgia";
          ctx.fillStyle = "#d8d8c8";
          ctx.fillText("VARIOLA MAJOR — PUSTULE PROGRESSION", 20, 30);
          for (let k = 0; k < 6; k++) {
            ctx.beginPath();
            ctx.arc(50 + k * 75, 110, 26, 0, TAU);
            ctx.stroke();
            for (let q = 0; q < k * 2 + 1; q++) {
              ctx.beginPath();
              ctx.arc(
                50 + k * 75 + Math.cos(q * 2.3) * 14,
                110 + Math.sin(q * 2.3) * 14,
                3 + k * 0.5,
                0,
                TAU,
              );
              ctx.fill();
            }
            ctx.fillText("D" + (k * 2 + 1), 40 + k * 75, 160);
          }
          ctx.fillText("+ F.E.V. (W.T. strain 7) — SEE ADDENDUM", 20, 210);
          ctx.strokeStyle = "rgba(200,200,190,0.5)";
          ctx.beginPath();
          ctx.moveTo(20, 230);
          ctx.lineTo(480, 238);
          ctx.stroke();
        },
        { clamp: true },
      ),
      { rough: 0.9 },
    );
    b.quad(thK, X(0), Y(2.8), Z(17.96), 4.0, 2.0, { ry: PI });
    // cellar stair: lane z 16.3..17.9, top at x 1.0 descending east to x 6.6
    PR.treads(b, "slate", X(1.2), Z(17.1), HP, 1.6, 5.4, Y(0), Y(CY), {
      maxRise: 0.25,
      surface: "concrete",
      thick: 0.3,
    });
    PR.colMM(X(1.0), Y(-0.5), Z(16.2), X(7), Y(0.03), Z(16.28), {
      walkable: false,
    });
    PR.railing(
      b,
      [
        [X(1.1), Z(16.2)],
        [X(7), Z(16.2)],
      ],
      Y(0.03),
      1.0,
      "iron",
      { postStep: 1.0 },
    );
    PR.gate({
      x: X(1.0),
      y: Y(0.03),
      z: Z(17.1),
      w: 1.7,
      h: 2.4,
      ry: HP,
      flag: "ren_cellar_gate",
      label: "Quarantine Cellar",
      lock: PR.LOCKS.ren_cellar,
      parent: root,
      chain: true,
      lockedText: 'A heavy padlock: "QUARANTINE — KEY AT NURSES\' STATION".',
    });
    const qK = PR.texMat(
      "pr_ren_qdown",
      PR.signTex(
        "pr_ren_qdown",
        ["QUARANTINE CELLAR", "STRICT ISOLATION"],
        "enamel",
        512,
        128,
        { bg: "#c8a820", fg: "#1a1a14" },
      ),
    );
    b.quad(qK, X(0.9), Y(2.9), Z(17.1), 1.6, 0.4, { ry: -HP });
    anchors.theatre = A(1, 0, 14.8, 0);
    anchors.theatre_top = A(0, 5, 5.9, PI);
    anchors.cellar_gate = A(0.2, 0, 17.1, -HP);
    anchors.spawn3 = A(2.5, 0, 14.6, PI);
    // aisle (west, x -7..-5.5) from the hall door to the pit
    D.papers(b, X(-6.2), Y(0.01), Z(9), 0.8, 6, 5);

    // =============================== FLOOR 1 (y 5) ===============================
    floor("planks", -7, -5, 3.1, 5, 5, 0.35); // over the hall (stairwell open east)
    floor("planks", 3.1, -5, 7, -4.1, 5, 0.35);
    floor("planks", -7, 5.3, 7, 6.3, 5, 0.35); // top tier landing (theatre)
    W("gneiss_dk", "x", -7, 7, 5, 5.3, 5, 9.6, [
      { c: -3.5, w: 1.6, y0: 5, h: 2.5 },
    ]);
    // north isolation rooms: corridor x 3.6..7 (east), rooms x -7..3.3
    floor("planks", -7, -18, 7, -9.6, 5, 0.35); // north part
    floor("planks", 3.3, -9.6, 7, -5, 5, 0.35); // corridor strip beside the collapsed room
    floor("planks", -7, -5.3, 3.3, -5, 5, 0.35);
    // collapsed room (x -7..3.3, z -9.6..-5.3): broken joists hanging, you can drop into the ward
    for (let k = 0; k < 5; k++)
      b.beam(
        "char",
        P(-6.8, 4.8, -9.3 + k * 1.0),
        P(-2.5 + k * 0.6, 3.2 - k * 0.3, -9.1 + k * 0.9),
        0.14,
        0.2,
      );
    for (let k = 0; k < 4; k++)
      box("planks", 1.5 + k * 0.2, 4.5, -8.8 + k * 0.9, 1.6, 0.06, 0.25, {
        rx: 0.4 + k * 0.1,
        seg: false,
      });
    W("plaster_w", "z", -18, -5.3, 3.3, 3.6, 5, 9.6, [
      { c: -16, w: 1.2, y0: 5, h: 2.4 },
      { c: -11.8, w: 1.2, y0: 5, h: 2.4 },
      { c: -7.4, w: 1.2, y0: 5, h: 2.4 },
    ]);
    W("plaster_w", "x", -7, 3.3, -14.1, -13.8, 5, 9.6, []);
    W("plaster_w", "x", -7, 3.3, -9.9, -9.6, 5, 9.6, []);
    W("plaster_w", "x", 3.6, 7, -5.3, -5, 5, 9.6, [
      { c: 5.3, w: 1.4, y0: 5, h: 2.5 },
    ]);
    W("plaster_w", "x", -7, 3.3, -5.3, -5, 5, 9.6, []);
    // room 1 (north, z -18..-14.1): nurses' quarters — the key
    PR.bed(b, X(-5.2), Y(5), Z(-16.5), HP, { sheet: "linen" });
    box("oak", 1.8, 5, -17.4, 1.2, 1.6, 0.5);
    col(1.8, -17.4, 1.2, 0.5, 5, 6.6);
    D.chair(b, X(-1), Y(5), Z(-15), 1.2, true, "oak");
    PR.skeleton(b, X(-2.2), Y(5.02), Z(-16.8), 0.9);
    anchors.nurse_room = A(-2, 5, -16, 0);
    anchors.nurse_locker = A(-0.4, 5, -17.6, 0);
    // room 2 (z -13.8..-9.9): isolation, restraint bed, pustule-stained linen
    PR.bed(b, X(-4.6), Y(5), Z(-12), HP, {
      straps: true,
      sheet: "linen",
      skeleton: true,
    });
    b.boxMM("goo", X(-6.95), Y(5.02), Z(-13.5), X(-3), Y(5.03), Z(-10.5), {
      seg: false,
      noAO: true,
    });
    anchors.iso_room = A(-2, 5, -12, 0);
    anchors.f1_corridor = A(5.3, 5, -12, 0);
    // F1 hall: nurses' station (terminal) overlooking the stair
    box("enamel_w", -3.5, 5, -1, 2.6, 1.05, 0.7);
    col(-3.5, -1, 2.6, 0.7, 5, 6.05);
    D.chair(b, X(-3.5), Y(5), Z(-2), 0.3, false, "steel");
    D.papers(b, X(-4), Y(6.07), Z(-1), 0.8, 5, 77);
    anchors.nurse_terminal = A(-2.8, 6.05, -1.05, PI);
    anchors.f1_hall = A(-2, 5, 2, 0);
    PR.railing(
      b,
      [
        [X(3.1), Z(-4.1)],
        [X(3.1), Z(5)],
      ],
      Y(5),
      1.0,
      "oak",
      { collide: true, postStep: 0.8 },
    );
    // open joists over F1 where the roof was: beams against the sky
    for (let z = -16; z < 17; z += 3.3)
      b.beam(
        "char",
        P(-7, 9.8 + Math.sin(z) * 0.2, z),
        P(7, 9.4 + Math.cos(z) * 0.4, z + Math.sin(z * 2) * 0.8),
        0.22,
        0.3,
      );
    b.boxMM("plaster_w", X(-7), Y(9.6), Z(-5.3), X(3.3), Y(9.9), Z(-18), {
      seg: false,
    }); // surviving ceiling over the north rooms

    // =============================== QUARANTINE CELLAR (y -4.5) ===============================
    floor("slate", -7, -18, 7, 18, CY, 0.4, { grime: 0.8 });
    // brick vault (ceiling pieces leave the two stair openings clear)
    ceil("brick_int", -7, -14.4, 7, 16.2, CY + 4.1);
    ceil("brick_int", -5.2, -18, 7, -14.4, CY + 4.1);
    ceil("brick_int", -7, -18, -5.2, -16.4, CY + 4.1);
    ceil("brick_int", -7, 16.2, 1.0, 18, CY + 4.1);
    for (let z = -12; z < 16; z += 2.5)
      b.add("brick_int", new THREE.TorusGeometry(6.95, 0.22, 4, 18, PI), {
        m: PR.m4(X(0), Y(CY + 0.4), Z(z), 0, 0, 0, 1, 0.53, 1),
      });
    for (const [x0, x1] of [
      [-7.6, -7],
      [7, 7.6],
    ])
      b.boxMM("brick_int", X(x0), Y(CY), Z(-18), X(x1), Y(CY + 4.2), Z(18), {
        segLen: 4,
        grime: 0.7,
      });
    // stair foot (x 5.2..7) → east corridor (x 5.2..7, z 4..16.2); wall under the stair lane
    W("brick_int", "x", -7, 5.2, 16.0, 16.3, CY, CY + 4.1, []);
    // three barred cells west of the corridor (x -2..4.9); solid rubble fill beyond x -2
    W("brick_int", "z", 4, 16.0, -2.3, -2.0, CY, CY + 4.1, []);
    b.boxMM("rubble", X(-7), Y(CY), Z(4), X(-2.3), Y(CY + 4.1), Z(16), {
      segLen: 3,
      grime: 0.8,
    });
    const cellsZ = [
      [4.3, 8.1],
      [8.4, 12.1],
      [12.4, 16.0],
    ];
    for (let i = 0; i < 3; i++) {
      const [za, zb] = cellsZ[i],
        zc = (za + zb) / 2;
      if (i > 0) W("brick_int", "x", -2, 4.9, za - 0.3, za, CY, CY + 4.1, []);
      W("brick_int", "z", za, zb, 4.9, 5.2, CY, CY + 4.1, [
        { c: zc, w: 1.2, y0: CY, h: 2.4 },
      ]);
      const open = i !== 1;
      for (let k = -2; k <= 2; k++)
        box(
          "iron",
          5.05 + (open ? -(k + 2) * 0.13 : 0),
          CY,
          zc + (open ? -0.6 : k * 0.22),
          0.035,
          2.4,
          0.035,
        );
      box("iron", 5.05, CY + 2.35, zc, 0.06, 0.06, 1.2);
      if (!open) col(5.05, zc, 0.12, 1.2, CY, CY + 2.4);
      PR.bed(b, X(0.4), Y(CY), Z(zc), HP, {
        mattress: true,
        sheet: "straw",
        skeleton: i === 2,
      });
      box("iron", -1.5, CY, zc + 1.2, 0.4, 0.45, 0.4); // slop bucket
      b.box("lamp_warm", X(6.1), Y(CY + 3.8), Z(zc), 0.25, 0.2, 0.25, {
        seg: false,
        noAO: true,
      });
      PR.glow(P(6.1, CY + 3.7, zc), 0xffd890, 0.9, root, {
        intensity: 0.8,
        flicker: 0.4,
      });
    }
    const tallyK = PR.texMat(
      "pr_ren_tally",
      PR.graffitiTex(
        "pr_ren_tally",
        ["DAY 41", "THEY TOOK", "MARGARET"],
        512,
        512,
        { color: "#4a2a1a", drips: false },
      ),
      { transparent: true },
    );
    b.quad(tallyK, X(-1.98), Y(CY + 1.8), Z(14.2), 2.0, 2.0, { ry: HP });
    const cellsK = PR.texMat(
      "pr_ren_cells",
      PR.signTex(
        "pr_ren_cells",
        ["ISOLATION — DO NOT OPEN", "FOOD THROUGH THE HATCH ONLY"],
        "enamel",
        512,
        128,
        { bg: "#7a1c14", fg: "#f0e0c0" },
      ),
    );
    b.quad(cellsK, X(5.18), Y(CY + 3.2), Z(10.2), 2.2, 0.55, { ry: HP });
    anchors.cellar = A(6.1, CY, 10, 0);
    anchors.cell_loot = A(3.8, CY, 6.2, -HP);
    // ---- morgue (z -6..4) ----
    W("brick_int", "x", -7, 7, 3.7, 4, CY, CY + 4.1, [
      { c: 6.1, w: 1.6, y0: CY, h: 2.8 },
    ]);
    for (const [x, z] of [
      [-2.5, 1.6],
      [-2.5, -2.2],
      [2.5, 1.6],
      [2.5, -2.2],
    ]) {
      box("marble", x, CY, z, 0.35, 0.85, 0.35);
      box("marble", x, CY + 0.85, z, 0.9, 0.1, 2.0);
      col(x, z, 0.9, 2.0, CY, CY + 0.95);
      b.boxMM(
        "linen",
        X(x - 0.42),
        Y(CY + 0.95),
        Z(z - 0.9),
        X(x + 0.42),
        Y(CY + 1.25),
        Z(z + 0.8),
        { seg: false, grime: 0.7, rz: 0.03 },
      );
    }
    // body-drawer wall (west) with a few drawers pulled out
    for (let j = 0; j < 3; j++)
      for (let i = 0; i < 5; i++) {
        const z = -4.8 + i * 1.9,
          y = CY + 0.3 + j * 1.1,
          out = (i * 3 + j) % 5 === 1;
        box("steel", -6.6 + (out ? 0.9 : 0), y, z, 0.9, 0.9, 1.6, {
          seg: false,
          grime: 0.6,
        });
        b.box(
          "chrome",
          X(-6.1 + (out ? 0.9 : 0)),
          Y(y + 0.4),
          Z(z),
          0.06,
          0.08,
          0.5,
          { seg: false },
        );
      }
    col(-6.6, -1, 1.0, 9.6, CY, CY + 3.6);
    box("enamel_w", 5.8, CY, -4.6, 1.8, 1.0, 0.8);
    col(5.8, -4.6, 1.8, 0.8, CY, CY + 1.0);
    b.cyl("chrome", X(0), Y(CY + 0.02), Z(0), 0.3, 0.3, 0.02, 10, { hSeg: 1 }); // floor drain
    for (const z of [-2, 2]) {
      b.box("lamp_warm", X(0), Y(CY + 3.8), Z(z), 1.2, 0.08, 0.2, {
        seg: false,
        noAO: true,
      });
    }
    anchors.morgue = A(0, CY, 0, 0);
    anchors.morgue_terminal = A(5.4, CY + 1.0, -4.65, PI);
    anchors.spawn4 = A(6.1, CY, 13.5, 0);
    anchors.spawn5 = A(1.0, CY, -0.4, 0);
    // ---- the laboratory bulkhead (z -6) ----
    W("panel", "x", -7, 7, -6.3, -6, CY, CY + 4.1, [
      { c: 0, w: 2.4, y0: CY, h: 2.8 },
    ]);
    const labK = PR.texMat(
      "pr_ren_lab",
      PR.signTex(
        "pr_ren_lab",
        [
          "KESSLER-HAAS — FIELD STATION 9",
          "PROJECT VARIOLA",
          "BSL-4 — SUITS REQUIRED",
        ],
        "enamel",
        512,
        256,
        { bg: "#e8e4d8", fg: "#1a2a4a" },
      ),
    );
    b.quad(labK, X(0), Y(CY + 3.4), Z(-5.95), 2.2, 1.1, {});
    PR.gate({
      x: X(0),
      y: Y(CY),
      z: Z(-6.15),
      w: 2.4,
      h: 2.8,
      ry: 0,
      flag: "ren_seal",
      label: "Laboratory Seal",
      lock: PR.LOCKS.ren_seal,
      parent: root,
      bars: false,
      key: "vault_dark",
      verbOpen: "Open",
    });
    // ---- the lab (z -18..-6.3) ----
    b.boxMM(
      "tile_wall",
      X(-6.95),
      Y(CY),
      Z(-18),
      X(6.95),
      Y(CY + 2.2),
      Z(-6.3),
      { seg: false, grime: 0.8 },
    );
    b.boxMM(
      "tile_wall",
      X(-6.9),
      Y(CY),
      Z(-17.95),
      X(6.9),
      Y(CY + 0.02),
      Z(-6.4),
      { seg: false, grime: 0.9 },
    );
    // K-agent culture tanks (glass cylinders of glowing broth)
    const tanks = [
      [-3.5, -11],
      [0, -12.8],
      [3.5, -11],
    ];
    PR.tankPos = [];
    tanks.forEach(([x, z], i) => {
      b.cyl("steel", X(x), Y(CY), Z(z), 1.0, 1.1, 0.6, 14, { hSeg: 1 });
      b.cyl("fev_goo", X(x), Y(CY + 0.6), Z(z), 0.82, 0.82, 2.3, 14, {
        hSeg: 1,
      });
      for (const hy of [0.9, 1.8, 2.7])
        b.add("steel", new THREE.TorusGeometry(0.86, 0.05, 4, 18), {
          m: PR.m4(X(x), Y(CY + hy), Z(z), 0, HP),
          noAO: true,
        });
      for (let k = 0; k < 4; k++) {
        const a = k * HP + 0.4;
        b.box(
          "steel",
          X(x + Math.cos(a) * 0.86),
          Y(CY + 0.6),
          Z(z + Math.sin(a) * 0.86),
          0.08,
          2.4,
          0.08,
          { seg: false },
        );
      }
      b.cyl("steel", X(x), Y(CY + 3.0), Z(z), 0.95, 1.0, 0.35, 14, { hSeg: 1 });
      b.beam("steel", P(x, CY + 3.35, z), P(x, CY + 4.1, z), 0.2, 0.2);
      for (let k = 0; k < 3; k++)
        b.sphere(
          "bone",
          X(x + Math.cos(k * 2.1) * 0.35),
          Y(CY + 1.2 + k * 0.5),
          Z(z + Math.sin(k * 2.1) * 0.35),
          0.12 + k * 0.03,
          {},
        ); // things in the broth
      col(x, z, 2.0, 2.0, CY, CY + 3.4);
      PR.glow(P(x, CY + 1.8, z), 0x70ff40, 3.0, root, {
        intensity: 1.1,
        flicker: 0.1,
      });
      PR.tankPos.push(P(x, CY + 1.5, z));
    });
    D.cable(
      b,
      [P(-3.5, CY + 4.0, -11), P(0, CY + 4.0, -12.8), P(3.5, CY + 4.0, -11)],
      0.3,
    );
    // centaur nest: gore mounds, stitched remains, slime pools
    for (let k = 0; k < 7; k++) {
      const x = -5 + r() * 10,
        z = -17 + r() * 4;
      b.sphere("slime", X(x), Y(CY - 0.2), Z(z), 0.6 + r() * 0.7, {
        sy: 0.45,
        deform: (v) => {
          v.multiplyScalar(
            0.85 +
              0.3 *
                G.util.hash2(
                  Math.round(v.x * 40),
                  Math.round(v.y * 40 + v.z * 13),
                ),
          );
        },
      });
    }
    b.boxMM(
      "goo",
      X(-6),
      Y(CY + 0.02),
      Z(-17.5),
      X(6),
      Y(CY + 0.03),
      Z(-14.8),
      { seg: false, noAO: true },
    );
    for (const [x, z, a] of [
      [-2, -16.2, 0.5],
      [2.8, -15.4, 2.2],
      [5.6, -8, -0.9],
    ])
      PR.skeleton(b, X(x), Y(CY + 0.05), Z(z), a);
    // benches, centrifuge, fridge, specimen shelves, gurneys
    box("steel", -2.6, CY, -7.2, 3.2, 0.95, 1.1);
    col(-2.6, -7.2, 3.2, 1.1, CY, CY + 0.95);
    for (let k = 0; k < 6; k++)
      b.cyl(
        k % 2 ? "glass_dark" : "fev_goo",
        X(-3.9 + k * 0.3),
        Y(CY + 0.95),
        Z(-6.95),
        0.07,
        0.07,
        0.24,
        6,
        { hSeg: 1 },
      );
    D.monitor(b, X(-1.6), Y(CY + 0.95), Z(-7.1), PI, true);
    box("steel", 6.2, CY, -8.5, 1.1, 0.95, 3.2);
    col(6.2, -8.5, 1.1, 3.2, CY, CY + 0.95);
    b.cyl("chrome", X(6.2), Y(CY + 0.95), Z(-9.5), 0.35, 0.4, 0.4, 12, {
      hSeg: 1,
    });
    PR.bed(b, X(4.2), Y(CY), Z(-15.8), 0.4, {
      straps: true,
      sheet: "linen",
      collide: true,
    });
    b.box("lamp_red", X(0), Y(CY + 3.9), Z(-16), 0.3, 0.15, 0.3, {
      seg: false,
      noAO: true,
    });
    PR.glow(P(0, CY + 3.8, -16), 0xff3020, 1.4, root, {
      intensity: 1.0,
      flicker: 0.6,
    });
    anchors.lab = A(0, CY, -9, 0);
    anchors.lab_terminal = A(-2.6, CY + 0.95, -7.3, PI);
    anchors.lab_locker = A(6.5, CY, -14.5, -HP);
    anchors.sample = A(6.2, CY + 0.96, -8.0, 0);
    anchors.boss = A(0, CY, -15.8, 0);
    anchors.spawn6 = A(-3.5, CY, -15, 0);
    // radiation near the tanks
    PR.onInitDone.push(() => {
      try {
        for (const p of PR.tankPos)
          G.world.addRadSource({
            x: p.x,
            y: p.y,
            z: p.z,
            radius: 3.2,
            strength: 3,
          });
      } catch (e) {
        /* */
      }
    });
    // ---- loop stair: lab west side → the bolted hatch in the north ward ----
    PR.treads(b, "slate", X(-6.1), Z(-8.8), PI, 1.7, 4.4, Y(CY), Y(-2.3), {
      maxRise: 0.25,
      surface: "concrete",
      thick: 0.3,
    });
    floor("slate", -7, -14.45, -5.2, -13.2, -2.3, 0.3);
    PR.treads(b, "slate", X(-6.1), Z(-14.45), PI, 1.7, 1.9, Y(-2.3), Y(0), {
      maxRise: 0.26,
      surface: "concrete",
      thick: 0.3,
    });
    b.boxMM("brick_int", X(-5.2), Y(CY), Z(-16.4), X(-4.9), Y(0), Z(-8.6), {
      seg: false,
    });
    PR.colMM(X(-5.2), Y(CY), Z(-16.4), X(-4.9), Y(0.9), Z(-8.6), {
      walkable: false,
    });
    b.box("lamp_warm", X(-6.95), Y(-1.2), Z(-12), 0.1, 0.3, 0.3, {
      seg: false,
      noAO: true,
    });
    PR.glow(P(-6.8, -1.2, -12), 0xffc890, 0.8, root, {
      intensity: 0.8,
      flicker: 0.3,
    });
    anchors.loop_stair = A(-6.1, CY, -8, PI);
    anchors.loot1 = anchors.nurse_locker;
    anchors.loot2 = anchors.cell_loot;
    anchors.loot3 = anchors.lab_locker;
    anchors.loot4 = A(5.8, CY, -3.6, 0);

    b.build(root, { castShadow: false });
    return anchors;
  }

  // ===================================================================
  // BUILDER + CONTENT PLACEMENT
  // ===================================================================
  PR.addBuilder(
    "smallpox_hospital",
    function (PR2, site, root) {
      const ext = buildExterior(root);
      const cell = PR.cell("smallpox_hospital");
      const int = buildInterior(cell, ext);
      PR.door({
        id: "pr_ren_enter",
        pos: V3(PV.x0 - 0.5, 1.9, DOOR.z),
        label: "Renwick Smallpox Hospital",
        verb: "Enter",
        radius: 1.6,
        target: {
          x: int.entrance.x,
          y: int.entrance.y + 0.05,
          z: int.entrance.z,
          yaw: -HP,
        },
      });
      const all = Object.assign({}, int, { exterior_entrance: ext.entrance });
      PR.register("smallpox_hospital", root, all, {
        interiorRoot: cell.root,
        interiorKey: "smallpox_hospital",
      });
      PR.renAnchors = int;
      const Pp = (a, dy) => ({
        x: a.x,
        y: a.y + (dy || 0),
        z: a.z,
        yaw: a.yaw || 0,
      });
      PR.prop(
        "terminal",
        Object.assign(Pp(int.nurse_terminal), {
          terminalId: "pr_ren_nurse",
          id: "pr_ren_term_nurse",
          mount: "bare",
        }),
      );
      PR.prop(
        "terminal",
        Object.assign(Pp(int.morgue_terminal), {
          terminalId: "pr_ren_morgue",
          id: "pr_ren_term_morgue",
          mount: "bare",
        }),
      );
      PR.prop(
        "terminal",
        Object.assign(Pp(int.lab_terminal), {
          terminalId: "pr_ren_lab",
          id: "pr_ren_term_lab",
          mount: "bare",
        }),
      );
      PR.prop(
        "locker",
        Object.assign(Pp(int.nurse_locker), {
          id: "pr_ren_nlocker",
          name: "Nurse Pell's Locker",
          items: [
            ["pr_ren_quarantine_key", 1],
            ["rally_tonic", 1],
            ["iodine_tabs", 1],
            ["pr_note_ren_nurse", 1],
          ],
        }),
      );
      PR.prop(
        "footlocker",
        Object.assign(Pp(int.cell_loot), {
          id: "pr_ren_cellfoot",
          loot: "footlocker",
        }),
      );
      PR.prop(
        "locker",
        Object.assign(Pp(int.lab_locker), {
          id: "pr_ren_lablocker",
          locked: 0,
          lock: PR.LOCKS.ren_lab_locker,
          name: "Hazard Suit Locker",
          items: [
            ["pr_ren_gasmask", 1],
            ["prussian_blue", 2],
            ["iodine_tabs", 2],
            ["rally_tonic", 2],
            ["ammo_gyrojet", 12],
          ],
        }),
      );
      PR.prop(
        "first_aid",
        Object.assign(Pp(int.loot4, 1.2), {
          id: "pr_ren_aid",
          loot: "medical_cabinet",
        }),
      );
      PR.prop("ammo_box", {
        x: int.hall.x - 1.5,
        y: int.hall.y,
        z: int.hall.z - 3,
        yaw: 0,
        id: "pr_ren_ammo",
        loot: "ammo_box",
      });
      PR.pickup(
        "pr_note_renwick_orders",
        1,
        V3(int.hall.x - 1.5, int.hall.y + 1.02, int.hall.z - 3.8),
      );
      PR.pickup(
        "pr_reel_variola",
        1,
        V3(int.morgue.x + 3.5, int.morgue.y + 1.28, int.morgue.z + 1.8),
      );
      PR.pickup(
        "pr_kagent_sample",
        1,
        V3(int.sample.x, int.sample.y, int.sample.z),
      );
      PR.npc({
        id: "pr_ren_matron",
        type: "lurcher",
        name: "The Matron",
        faction: "creatures",
        level: 10,
        pos: Pp(int.boss),
        yaw: 0,
        ai: "guard",
        home: { x: int.boss.x, z: int.boss.z, r: 6 },
        seed: 1856,
        hp: 260,
        xp: 180,
        noRespawn: true,
        variant: 2,
      });
      PR.npc({
        id: "pr_ren_centaur1",
        type: "lurcher",
        name: "Lurcher",
        faction: "creatures",
        level: 7,
        pos: Pp(int.cellar),
        ai: "wander",
        home: { x: int.cellar.x, z: int.cellar.z, r: 6 },
        seed: 1857,
      });
      PR.npc({
        id: "pr_ren_centaur2",
        type: "lurcher",
        name: "Lurcher",
        faction: "creatures",
        level: 7,
        pos: Pp(int.ward),
        ai: "wander",
        home: { x: int.ward.x, z: int.ward.z, r: 6 },
        seed: 1858,
      });
      PR.npc({
        id: "pr_ren_roach1",
        type: "giant_roach",
        name: "Giant roach",
        faction: "creatures",
        level: 3,
        pos: Pp(int.iso_room),
        ai: "wander",
        home: { x: int.iso_room.x, z: int.iso_room.z, r: 4 },
        seed: 1859,
      });
    },
    20,
  );
})();
