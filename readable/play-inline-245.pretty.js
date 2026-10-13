/* src/poi_roosevelt/10_octagon.js */
/* =====================================================================
 * NEW RAD CITY — POI ROOSEVELT — THE OCTAGON
 * (New York City Lunatic Asylum, A. J. Davis, 1839)
 * Exterior (site x 384..428, z -700..-640): the grey-gneiss octagonal
 * rotunda with limestone quoins and string courses, bracketed cornice,
 * drum with oculi, the ribbed octagonal dome (two panels caved in), lantern
 * and finial; the west portico; the two long wings with mansard roofs
 * (the south one burnt out); asylum fence, signs, grounds.
 * Interior (INTERIORS.roosevelt_octagon): vestibule & admissions → the
 * ROTUNDA with the famous cantilevered SPIRAL STAIR climbing three storeys
 * of galleries to the dome and its oculus;
 *   L0 north: Women's Ward A + night-nurse station
 *   L0 south: HYDROTHERAPY (continuous baths, needle shower, wet packs)
 *             → chained gate to the service stair (opened from inside)
 *   L1 north: Superintendent Harrow's office (locked) + records room
 *   L1 south: day room (piano, television, checkers)
 *   L2 north: "The Lodge" — padded isolation cells
 *   L2 south: treatment room (electroconvulsive chair, operating table)
 *   L3: dome gallery — the Superintendent (a Maniac Bruiser) and his "archive"
 * Loop: L2 treatment → service stair → L0 gate → hydrotherapy → rotunda.
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

  const C = { x: 406, z: -670 }; // rotunda centre (exterior)
  const RO = 9.8; // exterior circumradius
  const APO = RO * Math.cos(PI / 8); // exterior apothem (≈ 9.05)
  // interior
  const IAP = 9.05,
    IRI = IAP / Math.cos(PI / 8); // inner apothem / circumradius
  const LV = [0, 5, 10, 15]; // floor levels
  const STAIR = { rIn: 2.9, rOut: 5.3, a0: 0, per: 20 };
  const GAL_IN = 5.45; // gallery inner edge radius

  Object.assign(PR.MAT_DEFS, {
    win_day: {
      color: 0x8a947c,
      emissive: 0x76866a,
      emissiveIntensity: 0.55,
      rough: 0.8,
      uv: 1.5,
      plain: true,
      noShadow: true,
    },
    dado: {
      custom: "plaster_old",
      prefer: "custom",
      color: 0x46503c,
      tint: 0x55604a,
      rough: 0.7,
      uv: 3.2,
    },
    tv_glow: {
      color: 0x9ab0c8,
      emissive: 0x8aa8e0,
      emissiveIntensity: 1.3,
      rough: 0.3,
      uv: 1,
      plain: true,
      noShadow: true,
    },
  });

  // ===================================================================
  // EXTERIOR
  // ===================================================================
  function buildExterior(root) {
    const b = PR.batch("oct_ext");
    b.ground = 0;
    b.aoH = 4;
    const anchors = {};
    const poly = PR.octPoly(C.x, C.z, RO);
    // rusticated water table + walls
    K.prism(b, "granite_block", PR.octPoly(C.x, C.z, RO + 0.45), -0.3, 1.1);
    K.prismBands(b, "gneiss", poly, 1.1, 19.2, 3.0);
    for (const y of [5.2, 10.2, 15.2])
      K.prism(b, "limestone", PR.octPoly(C.x, C.z, RO + 0.16), y, y + 0.32, {
        grime: 0.45,
      });
    // quoins: alternating long/short dressed blocks at the eight arrises
    for (let k = 0; k < 8; k++) {
      const a = PI / 8 + (k * PI) / 4;
      for (let y = 1.1, j = 0; y < 19; y += 0.6, j++) {
        const long = j % 2 === 0;
        b.box(
          "limestone",
          C.x + Math.cos(a) * (RO + 0.02),
          y,
          C.z + Math.sin(a) * (RO + 0.02),
          long ? 1.1 : 0.7,
          0.56,
          0.5,
          { ry: -a + HP, seg: false, grime: 0.45 },
        );
      }
    }
    // windows (edge 3 = west face → only upper floors there, above the portico)
    const WIN = {
      y0: 1.9,
      floors: 4,
      floorH: 5.0,
      w: 1.15,
      h: 2.5,
      spacing: 3.1,
      frameKey: "limestone",
      lintel: true,
      broken: 0.45,
      boarded: 0.18,
      margin: 0.9,
      minEdge: 2,
      seed: 18,
    };
    K.polyWindows(
      b,
      poly,
      Object.assign({}, WIN, { skipEdge: (i) => i === 3 }),
    );
    K.polyWindows(
      b,
      poly,
      Object.assign({}, WIN, {
        y0: 11.9,
        floors: 2,
        skipEdge: (i) => i !== 3,
        seed: 19,
      }),
    );
    // bracketed cornice + parapet
    K.prism(b, "limestone", PR.octPoly(C.x, C.z, RO + 0.75), 19.2, 19.75, {
      grime: 0.4,
    });
    for (let k = 0; k < 8; k++) {
      const a0 = PI / 8 + (k * PI) / 4,
        a1 = a0 + PI / 4;
      for (let i = 1; i <= 5; i++) {
        const t = i / 6;
        const x =
            C.x + (Math.cos(a0) * (1 - t) + Math.cos(a1) * t) * (RO + 0.2),
          z = C.z + (Math.sin(a0) * (1 - t) + Math.sin(a1) * t) * (RO + 0.2);
        b.box("limestone", x, 18.7, z, 0.25, 0.5, 0.5, {
          ry: -(a0 + PI / 8) + HP,
          seg: false,
        });
      }
    }
    K.prism(b, "gneiss", PR.octPoly(C.x, C.z, RO - 0.2), 19.75, 20.6);
    // drum with oculi
    const drum = PR.octPoly(C.x, C.z, 7.4);
    K.prism(b, "gneiss", drum, 20.6, 24.0);
    for (let k = 0; k < 8; k++) {
      const a = (k * PI) / 4,
        ap = 7.4 * Math.cos(PI / 8) + 0.03;
      const x = C.x + Math.cos(a) * ap,
        z = C.z + Math.sin(a) * ap;
      const ry = Math.atan2(Math.cos(a), Math.sin(a));
      b.add("glass_broken", new THREE.CircleGeometry(0.62, 14), {
        m: PR.m4(x, 22.3, z, ry),
        uv: "box",
        noAO: true,
      });
      b.add("limestone", new THREE.TorusGeometry(0.72, 0.12, 5, 16), {
        m: PR.m4(x, 22.3, z, ry),
      });
    }
    K.prism(b, "limestone", PR.octPoly(C.x, C.z, 7.85), 24.0, 24.4);
    // attic floor (visible through the caved-in dome panels)
    K.prism(b, "rotten", PR.octPoly(C.x, C.z, 7.3), 24.3, 24.45);
    D.rubble(b, C.x + 3.5, 24.45, C.z + 1.5, 1.2, 5, 44);
    // ribbed octagonal dome — panels k=1,2 (east / south-east) caved in
    const prof = [
      [7.6, 0],
      [7.35, 0.4],
      [6.9, 1.8],
      [6.1, 3.2],
      [5.0, 4.5],
      [3.6, 5.5],
      [2.2, 6.2],
      [1.5, 6.45],
    ];
    b.lathe("slate", prof, 6, C.x, 24.4, C.z, {
      phiStart: (7 * PI) / 8,
      phiLen: (3 * PI) / 2,
      grime: 0.5,
    });
    b.lathe(
      "gneiss_dk",
      prof
        .slice()
        .reverse()
        .map((p) => [p[0] - 0.25, p[1] - 0.1]),
      8,
      C.x,
      24.4,
      C.z,
      { phiStart: PI / 8, grime: 0.2 },
    );
    for (let k = 0; k < 8; k++) {
      const phi = PI / 8 + (k * PI) / 4,
        sx = Math.sin(phi),
        sz = Math.cos(phi);
      for (let i = 0; i < prof.length - 1; i++) {
        const p = prof[i],
          q = prof[i + 1];
        b.beam(
          k === 1 || k === 2 || k === 3 ? "char" : "limestone",
          V3(C.x + sx * (p[0] + 0.08), 24.4 + p[1], C.z + sz * (p[0] + 0.08)),
          V3(C.x + sx * (q[0] + 0.08), 24.4 + q[1], C.z + sz * (q[0] + 0.08)),
          0.28,
          0.22,
        );
      }
    }
    // exposed purlins across the hole
    for (const i of [1, 3, 5]) {
      const p = prof[i];
      for (let k = 1; k <= 2; k++) {
        const pa = PI / 8 + (k * PI) / 4,
          pb = pa + PI / 4;
        if (i === 3 && k === 2) continue;
        b.beam(
          "char",
          V3(C.x + Math.sin(pa) * p[0], 24.4 + p[1], C.z + Math.cos(pa) * p[0]),
          V3(
            C.x + Math.sin(pb) * p[0] * 0.98,
            24.4 + p[1] - (i === 5 ? 0.6 : 0),
            C.z + Math.cos(pb) * p[0] * 0.98,
          ),
          0.14,
          0.14,
        );
      }
    }
    // lantern (cupola) + finial
    const lan = PR.octPoly(C.x, C.z, 1.7);
    K.prism(b, "limestone", PR.octPoly(C.x, C.z, 1.9), 30.8, 31.1);
    for (const p of lan)
      b.box("iron", p[0], 31.1, p[1], 0.16, 2.1, 0.16, { seg: false });
    b.cyl("glass_broken", C.x, 31.1, C.z, 1.55, 1.55, 2.1, 8, {
      hSeg: 1,
      thetaStart: PI / 8,
      open: true,
    });
    K.prism(b, "limestone", PR.octPoly(C.x, C.z, 2.0), 33.2, 33.5);
    b.lathe(
      "slate",
      [
        [2.0, 0],
        [1.6, 0.6],
        [0.9, 1.2],
        [0.25, 1.6],
        [0.05, 1.7],
      ],
      8,
      C.x,
      33.5,
      C.z,
      { phiStart: PI / 8 },
    );
    b.sphere("iron", C.x, 35.3, C.z, 0.2, {});
    b.beam("iron", V3(C.x, 35.3, C.z), V3(C.x, 37.2, C.z), 0.06, 0.06);
    K.polyColliders(poly, 0, 20.6, 1.2);

    // ---------------- west portico ----------------
    const fx = C.x - APO; // west face plane
    const px0 = fx - 3.6;
    b.boxMM("granite", px0, 0, C.z - 3.8, fx, 0.6, C.z + 3.8, { grime: 0.5 });
    PR.colMM(px0, 0, C.z - 3.8, fx, 0.6, C.z + 3.8, { surface: "concrete" });
    for (let i = 0; i < 3; i++) {
      b.boxMM(
        "granite",
        px0 - 0.4 * (i + 1),
        0,
        C.z - 2.4,
        px0 - 0.4 * i,
        0.6 - 0.2 * (i + 1),
        C.z + 2.4,
        { seg: false, grime: 0.6 },
      );
      PR.colMM(
        px0 - 0.4 * (i + 1),
        0,
        C.z - 2.4,
        px0 - 0.4 * i,
        0.6 - 0.2 * (i + 1),
        C.z + 2.4,
        { surface: "concrete" },
      );
    }
    for (const z of [-3.1, -1.05, 1.05, 3.1])
      K.column(b, "limestone", px0 + 0.5, 0.6, C.z + z, 5.0, 0.3);
    b.boxMM("limestone", px0, 5.6, C.z - 3.8, fx, 6.4, C.z + 3.8, {
      grime: 0.45,
    });
    b.boxMM("limestone", px0 - 0.2, 6.4, C.z - 4.0, fx, 6.6, C.z + 4.0, {
      seg: false,
    });
    K.balustrade(
      b,
      "limestone",
      [
        [px0 - 0.05, C.z - 3.8],
        [px0 - 0.05, C.z + 3.8],
      ],
      6.6,
      0.9,
    );
    // doorway: dark reveal, bronze-studded oak leaves ajar, fanlight, barricade
    b.boxMM(
      "gneiss_dk",
      fx - 0.02,
      0.6,
      C.z - 1.05,
      fx + 0.35,
      3.9,
      C.z + 1.05,
      { seg: false },
    );
    b.quad("glass_broken", fx - 0.04, 2.25, C.z, 2.0, 3.3, {
      ry: -HP,
      noAO: true,
    });
    b.box("oak", fx - 0.3, 0.6, C.z - 0.95, 0.08, 3.1, 0.95, {
      ry: 0.9,
      seg: false,
      grime: 0.6,
    });
    b.box("oak", fx - 0.15, 0.6, C.z + 0.6, 0.08, 3.1, 0.95, {
      ry: -0.25,
      seg: false,
      grime: 0.6,
    });
    const fan = new THREE.CircleGeometry(1.05, 12, 0, PI);
    b.add("glass_dark", fan, {
      m: PR.m4(fx - 0.05, 3.95, C.z, -HP),
      uv: "box",
      noAO: true,
    });
    b.add("limestone", new THREE.TorusGeometry(1.15, 0.13, 5, 12, PI), {
      m: PR.m4(fx - 0.06, 3.95, C.z, -HP),
    });
    for (const [y, rz] of [
      [1.3, 0.2],
      [2.1, -0.35],
      [3.0, 0.1],
    ])
      b.box("planks", fx - 0.4, y, C.z + 0.9, 0.06, 0.22, 1.5, {
        rx: rz,
        seg: false,
        grime: 0.7,
      });
    const nameK = PR.texMat(
      "pr_oct_name",
      PR.signTex(
        "pr_oct_name",
        ["NEW YORK CITY LUNATIC ASYLUM", "MDCCCXXXIX"],
        "engraved",
        1024,
        160,
      ),
      { rough: 0.9 },
    );
    b.quad(nameK, px0 - 0.22, 6.0, C.z, 6.6, 0.75, { ry: -HP });
    const enamel = PR.texMat(
      "pr_oct_enamel",
      PR.signTex(
        "pr_oct_enamel",
        [
          "WELFARE ISLAND",
          "METROPOLITAN HOSPITAL",
          "OCTAGON — PSYCHIATRIC ANNEX",
        ],
        "enamel",
        512,
        256,
        { bg: "#e8e0c8", fg: "#2a3a5a" },
      ),
    );
    b.box("iron", px0 - 2.8, 0, C.z - 5.4, 0.08, 2.2, 0.08, { seg: false });
    b.box("iron", px0 - 2.8, 0, C.z - 3.6, 0.08, 2.2, 0.08, { seg: false });
    b.quad(enamel, px0 - 2.85, 2.2, C.z - 4.5, 2.0, 1.0, { ry: -HP });
    PR.col(px0 - 2.8, C.z - 4.5, 0.2, 2.0, 0, 2.6, 0, { walkable: false });
    const graf = PR.texMat(
      "pr_oct_graf",
      PR.graffitiTex(
        "pr_oct_graf",
        ["DON'T", "GO UP", "THE STAIRS"],
        512,
        512,
        { color: "#c02818" },
      ),
      { transparent: true },
    );
    b.quad(graf, fx - 0.03, 9.0, C.z + 2.4, 2.6, 2.6, { ry: -HP });
    anchors.entrance = PR.anchor(px0 - 2.2, 0, C.z, HP);

    // ---------------- wings ----------------
    const wing = (z0, z1, burnt, seed) => {
      const x0 = C.x - 7,
        x1 = C.x + 7;
      const rp = PR.rectPoly(x0, z0, x1, z1);
      K.prism(
        b,
        "granite_block",
        PR.rectPoly(x0 - 0.3, z0 - 0.3, x1 + 0.3, z1 + 0.3),
        -0.3,
        1.0,
      );
      K.prismBands(b, "gneiss", rp, 1.0, 13.5, 3.4);
      for (const y of [4.7, 9.2])
        K.prism(
          b,
          "limestone",
          PR.rectPoly(x0 - 0.12, z0 - 0.12, x1 + 0.12, z1 + 0.12),
          y,
          y + 0.28,
        );
      K.prism(
        b,
        "limestone",
        PR.rectPoly(x0 - 0.5, z0 - 0.5, x1 + 0.5, z1 + 0.5),
        13.5,
        13.95,
      );
      const nearIdx = z1 > C.z ? 2 : 0; // edge that touches the rotunda (skip windows there)
      K.polyWindows(b, rp, {
        y0: 1.7,
        floors: 3,
        floorH: 4.5,
        w: 1.0,
        h: 2.2,
        spacing: 2.9,
        frameKey: "limestone",
        lintel: true,
        broken: burnt ? 0.7 : 0.4,
        boarded: 0.15,
        margin: 1.2,
        seed,
        skipEdge: (i) => i === (z1 > C.z ? 0 : 2),
      });
      void nearIdx;
      // iron bars over the ground-floor windows of the long sides
      for (const sx of [x0 - 0.06, x1 + 0.06])
        for (let z = z0 + 1.6; z < z1 - 1; z += 2.9)
          for (let k = -2; k <= 2; k++)
            b.box("iron", sx, 1.7, z + k * 0.22, 0.03, 2.2, 0.03, {
              seg: false,
            });
      // mansard roof (square frustum scaled to the rectangle) + dormers
      const W = x1 - x0 + 0.6,
        Dd = z1 - z0 + 0.6;
      const roofLen = burnt ? Dd * 0.45 : Dd;
      const rz0 = burnt ? (z1 > C.z ? z0 - 0.3 : z1 + 0.3 - roofLen) : z0 - 0.3;
      const fr = new THREE.CylinderGeometry(0.78, 1, 3.3, 4, 1);
      fr.rotateY(PI / 4);
      b.add("slate", fr, {
        m: PR.m4(
          C.x,
          13.95 + 1.65,
          rz0 + roofLen / 2,
          0,
          0,
          0,
          W / Math.SQRT2,
          1,
          roofLen / Math.SQRT2,
        ),
        grime: 0.5,
      });
      b.boxMM(
        "tar",
        C.x - W * 0.39,
        17.2,
        rz0 + roofLen * 0.11,
        C.x + W * 0.39,
        17.35,
        rz0 + roofLen * 0.89,
        { seg: false },
      );
      for (const side of [-1, 1])
        for (let z = rz0 + 2.2; z < rz0 + roofLen - 1.5; z += 3.6) {
          const dx = C.x + side * (W / 2 - 0.7);
          b.box("limestone", dx, 14.2, z, 1.2, 1.9, 1.3, { seg: false });
          b.quad("glass_broken", dx + side * 0.61, 15.1, z, 0.7, 1.1, {
            ry: side * HP,
            noAO: true,
          });
          b.box("slate", dx, 16.1, z, 1.5, 0.12, 1.1, {
            rz: -side * 0.5,
            seg: false,
          });
        }
      if (burnt) {
        // collapsed part: charred rafters, broken wall tops, scorch
        const bz0 = z1 > C.z ? z0 - 0.3 + roofLen : z0 - 0.3,
          bz1 = z1 > C.z ? z1 + 0.3 : z1 + 0.3 - roofLen;
        for (let z = bz0 + 0.5; z < bz1 - 0.2; z += 1.1) {
          const lean = Math.sin(z * 3.1) * 0.5;
          b.beam(
            "char",
            V3(x0 + 0.2, 13.9, z),
            V3(C.x, 16.2 - Math.abs(lean) * 2, z + lean),
            0.14,
            0.2,
          );
          if (Math.sin(z * 7.7) > -0.3)
            b.beam(
              "char",
              V3(x1 - 0.2, 13.9, z),
              V3(C.x + 0.3, 15.6 - Math.abs(lean), z - lean * 0.6),
              0.14,
              0.2,
            );
        }
        b.boxMM("char", x0 + 0.3, 13.2, bz0, x1 - 0.3, 13.5, bz1, {
          seg: false,
          grime: 0.9,
        });
        for (let k = 0; k < 6; k++)
          b.quad(
            PR.texMat(
              "pr_scorch",
              PR.canvasTex(
                "pr_scorch",
                128,
                256,
                (ctx, w, h) => {
                  const g = ctx.createLinearGradient(0, h, 0, 0);
                  g.addColorStop(0, "rgba(10,8,6,0)");
                  g.addColorStop(0.35, "rgba(10,8,6,0.8)");
                  g.addColorStop(1, "rgba(10,8,6,0.95)");
                  ctx.fillStyle = g;
                  ctx.beginPath();
                  ctx.moveTo(w * 0.3, h);
                  ctx.quadraticCurveTo(0, h * 0.4, w * 0.2, 0);
                  ctx.lineTo(w * 0.8, 0);
                  ctx.quadraticCurveTo(w, h * 0.4, w * 0.7, h);
                  ctx.fill();
                },
                { clamp: true },
              ),
              { transparent: true, noShadow: true },
            ),
            k % 2 ? x1 + 0.05 : x0 - 0.05,
            10.5,
            bz0 + 1.5 + k * 1.6,
            1.6,
            3.4,
            { ry: k % 2 ? HP : -HP },
          );
      } else {
        // chimneys
        for (const z of [z0 + 3, z1 - 3])
          b.box("brick", C.x + 3.5, 13.9, z, 0.9, 5.2, 0.9, {
            seg: false,
            grime: 0.7,
          });
      }
      PR.colMM(x0, 0, z0, x1, 17.3, z1, { walkable: false });
    };
    wing(C.z - APO - 21, C.z - APO + 0.8, false, 31);
    // south wing: burnt, and its outer third has come down — jagged wall stubs, fallen floors and a rubble slope,
    // so the rotunda & dome read over the ruin from the southern approach (the island promenade)
    const SZC = C.z + APO + 11.5,
      SZ1 = C.z + APO + 21;
    wing(C.z + APO - 0.8, SZC, true, 37);
    {
      const x0 = C.x - 7,
        x1 = C.x + 7,
        rr = PR.rng("oct_ruin"),
        L = SZ1 - SZC;
      K.prism(
        b,
        "granite_block",
        PR.rectPoly(x0 - 0.3, SZC, x1 + 0.3, SZ1 + 0.3),
        -0.3,
        1.0,
      );
      const stub = (x, z, w, d, h, ry) => {
        b.box("gneiss", x, 1.0, z, w, h, d, {
          ry: ry || 0,
          grime: 0.7,
          segLen: 3,
        });
        if (h > 3.9)
          b.box("limestone", x, 4.7, z, w + (ry ? 0 : 0.02), 0.28, d + 0.24, {
            ry: ry || 0,
            seg: false,
            grime: 0.5,
          });
        if (h > 8.4)
          b.box("limestone", x, 9.2, z, w, 0.28, d + 0.24, {
            ry: ry || 0,
            seg: false,
            grime: 0.5,
          });
        b.box("char", x, 1.0 + h - 0.05, z, w * 0.9, 0.12, d * 0.9, {
          ry: ry || 0,
          seg: false,
        }); // scorched broken top
        PR.col(x, z, w, d, 0, 1.0 + h, ry || 0, { walkable: false });
      };
      // long side walls: tall near the surviving block, falling away to knee height, one window reveal left standing
      for (const sx of [x0 + 0.3, x1 - 0.3]) {
        for (let z = SZC + 0.55; z < SZ1; z += 1.1) {
          const t = (z - SZC) / L,
            h = Math.max(0.6, 12.5 * Math.pow(1 - t, 1.6) + (rr() - 0.6) * 2.2);
          stub(sx, z, 0.6, 1.12, h);
        }
      }
      // end wall: a breach in the middle, low stubs either side
      for (let x = x0 + 0.55; x < x1; x += 1.1) {
        if (Math.abs(x - C.x) < 1.6) continue;
        stub(x, SZ1 - 0.3, 1.12, 0.6, 0.5 + rr() * 2.6);
      }
      // fallen floors: slabs & joists slumped from the cut face down to the ground
      for (const [y, tilt] of [
        [9.2, 0.62],
        [4.7, 0.42],
      ]) {
        b.box("planks", C.x - 1.5, y * 0.45, SZC + 3.2, 10, 0.3, 6.6, {
          rx: tilt,
          rz: (rr() - 0.5) * 0.2,
          seg: true,
          grime: 0.8,
        });
        for (let k = 0; k < 7; k++) {
          const x = x0 + 1.2 + k * 1.9;
          b.beam(
            "char",
            V3(x, y, SZC + 0.1),
            V3(
              x + (rr() - 0.5),
              Math.max(0.6, y - 2 - rr() * 3),
              SZC + 2.5 + rr() * 3,
            ),
            0.16,
            0.22,
          );
        }
      }
      b.box("char", C.x, 13.1, SZC + 0.2, 14, 0.3, 0.4, { seg: false });
      // rubble slope + scattered dressed stones and slates
      for (let k = 0; k < 16; k++)
        b.rock(
          rr() < 0.7 ? "gneiss" : "granite_block",
          x0 + 1.5 + rr() * 11,
          0.2,
          SZC + 1 + rr() * (L - 2),
          0.5 + rr() * 1.2,
          { flat: 0.55, detail: 0, seed: 900 + k },
        );
      for (let k = 0; k < 12; k++)
        b.box(
          "slate",
          x0 + 1.5 + rr() * 11,
          0.3 + rr() * 0.6,
          SZC + 1 + rr() * (L - 2),
          0.6,
          0.04,
          0.35,
          { ry: rr() * 3, rx: (rr() - 0.5) * 0.8, seg: false },
        );
      PR.col(C.x, SZC + L / 2, 12.4, L - 1.2, 0, 0.9, 0, { surface: "rubble" });
      // cut face of the surviving block: charred floor edges
      for (const y of [4.7, 9.2])
        b.boxMM(
          "char",
          x0 + 0.3,
          y - 0.35,
          SZC - 0.05,
          x1 - 0.3,
          y,
          SZC + 0.25,
          { seg: false },
        );
    }
    // vines on the rotunda + wings
    const vk = PR.vineKey(0),
      vk2 = PR.vineKey(1);
    for (const [x, y, z, ry, w, h] of [
      [C.x - 7.3, 9, C.z - APO - 21.05, PI, 4, 8],
      [C.x + 7.05, 7, C.z + 14, HP, 5, 9],
      [C.x - 7.05, 6.5, C.z + 18, -HP, 4, 8],
      [C.x + APO * 0.7 + 0.05, 12, C.z - APO * 0.7, PI * 0.75, 3.5, 9],
      [C.x - APO - 0.04, 15, C.z - 2.8, -HP, 2.8, 7],
    ]) {
      b.quad(Math.abs(x) % 2 < 1 ? vk : vk2, x, y, z, w, h, { ry });
    }

    // ---------------- grounds ----------------
    const s = G.LAYOUT.getSite("roosevelt_octagon") || {
      x0: 384,
      x1: 428,
      z0: -700,
      z1: -640,
    };
    PR.railing(
      b,
      [
        [s.x0 + 0.5, s.z0 + 0.5],
        [s.x0 + 0.5, C.z - 3.2],
      ],
      0.02,
      1.9,
      "iron",
      { collide: true, postStep: 0.3 },
    );
    PR.railing(
      b,
      [
        [s.x0 + 0.5, C.z + 3.2],
        [s.x0 + 0.5, s.z1 - 0.5],
      ],
      0.02,
      1.9,
      "iron",
      { collide: true, postStep: 0.3 },
    );
    for (const z of [C.z - 3.2, C.z + 3.2]) {
      b.box("gneiss", s.x0 + 0.5, 0, z, 0.8, 2.6, 0.8, { seg: false });
      b.sphere("limestone", s.x0 + 0.5, 2.85, z, 0.3, {});
      PR.col(s.x0 + 0.5, z, 0.8, 0.8, 0, 2.6, 0, { walkable: false });
    }
    b.box("iron", s.x0 + 0.1, 0.02, C.z - 1.6, 0.06, 1.9, 2.6, {
      ry: 0.9,
      seg: false,
    }); // swung gate leaf
    // south fence (either side of the wing) with a gate & the enamel direction sign facing the promenade
    PR.railing(
      b,
      [
        [s.x0 + 0.5, s.z1 - 0.5],
        [C.x - 11, s.z1 - 0.5],
      ],
      0.02,
      1.9,
      "iron",
      { collide: true, postStep: 0.3 },
    );
    PR.railing(
      b,
      [
        [C.x - 8, s.z1 - 0.5],
        [C.x - 7.5, s.z1 - 0.5],
      ],
      0.02,
      1.9,
      "iron",
      { collide: true, postStep: 0.3 },
    );
    PR.railing(
      b,
      [
        [C.x + 7.5, s.z1 - 0.5],
        [s.x1 - 0.5, s.z1 - 0.5],
      ],
      0.02,
      1.9,
      "iron",
      { collide: true, postStep: 0.3 },
    );
    for (const x of [C.x - 11, C.x - 8]) {
      b.box("gneiss", x, 0, s.z1 - 0.5, 0.7, 2.4, 0.7, { seg: false });
      b.sphere("limestone", x, 2.62, s.z1 - 0.5, 0.26, {});
      PR.col(x, s.z1 - 0.5, 0.7, 0.7, 0, 2.4, 0, { walkable: false });
    }
    b.box("iron", C.x - 10.3, 0.02, s.z1 + 0.4, 0.06, 1.9, 1.4, {
      ry: -0.7,
      seg: false,
    });
    {
      const dk = PR.texMat(
        "pr_oct_dir",
        PR.signTex(
          "pr_oct_dir",
          [
            "THE OCTAGON",
            "NYC LUNATIC ASYLUM 1839",
            "ENTRANCE — WEST PORTICO ▸",
          ],
          "enamel",
          512,
          256,
          { bg: "#e8e0c8", fg: "#2a3a5a" },
        ),
      );
      b.box("iron", C.x - 13, 0, s.z1 + 1.2, 0.08, 2.6, 0.08, { seg: false });
      b.quad(dk, C.x - 13, 2.0, s.z1 + 1.25, 1.5, 0.75, { rz: -0.08 });
      b.quad(dk, C.x - 13, 2.0, s.z1 + 1.15, 1.5, 0.75, { ry: PI, rz: 0.08 });
      const gK = PR.texMat(
        "pr_oct_graf_s",
        PR.graffitiTex("pr_oct_graf_s", ["THEY", "NEVER", "LEFT"], 512, 512, {
          color: "#b02010",
        }),
        { transparent: true },
      );
      b.quad(gK, C.x + 7.07, 3.2, C.z + APO + 6, 2.6, 2.6, { ry: HP });
    }
    // gravel paths: gate → portico, south gate → round the wing; worn dirt patches & weeds over the grounds
    b.boxMM(
      "cobble",
      s.x0 + 0.6,
      0.0,
      C.z - 1.4,
      C.x - APO - 3.2,
      0.04,
      C.z + 1.4,
      { grime: 0.5, segLen: 4 },
    );
    b.boxMM("cobble", C.x - 10.8, 0.0, C.z + 1.4, C.x - 8.2, 0.04, s.z1 - 0.6, {
      grime: 0.5,
      segLen: 4,
    });
    const tr = PR.rng("oct_tufts");
    for (let k = 0; k < 160; k++) {
      const x = s.x0 + 1 + tr() * (s.x1 - s.x0 - 2),
        z = s.z0 + 1 + tr() * (s.z1 - s.z0 - 2);
      if (
        Math.hypot(x - C.x, z - C.z) < RO + 1 ||
        (Math.abs(x - C.x) < 7.6 && Math.abs(z - C.z) < 31.5) ||
        (Math.abs(z - C.z) < 1.6 && x < C.x)
      )
        continue;
      if (tr() < 0.75) {
        const h = 0.25 + tr() * 0.4;
        for (let q = 0; q < 4; q++) {
          const a = tr() * TAU;
          b.add(
            tr() < 0.5 ? "straw" : "leaf_dead",
            new THREE.ConeGeometry(0.035, h * (0.6 + tr() * 0.6), 3),
            {
              m: PR.m4(
                x + Math.cos(a) * 0.12,
                h * 0.3,
                z + Math.sin(a) * 0.12,
                a,
                (tr() - 0.5) * 0.7,
                (tr() - 0.5) * 0.7,
              ),
              grime: 0.2,
              noAO: true,
            },
          );
        }
      } else
        b.rock("rock", x, -0.05, z, 0.12 + tr() * 0.25, {
          flat: 0.6,
          detail: 0,
          seed: 400 + k,
        });
    }
    for (let k = 0; k < 8; k++) {
      const c = new THREE.CircleGeometry(1.2 + tr() * 1.8, 9);
      c.rotateX(-HP);
      b.add(k % 2 ? "dirt" : "leaf_dead", c, {
        m: PR.m4(
          s.x0 + 3 + tr() * 12,
          0.015 + k * 0.001,
          s.z0 + 5 + tr() * (s.z1 - s.z0 - 10),
        ),
        grime: 0.4,
        noAO: true,
      });
    }
    // the forecourt as the last evacuation left it: gurneys, wheelchairs, an ambulance on its side, bodies under sheets
    PR.car(b, C.x - 15.5, 0, s.z1 - 6, 0.3, {
      paint: "paint_cream",
      flipped: false,
      tilt: 0.0,
      seed: 1839,
    });
    PR.col(C.x - 15.5, s.z1 - 6, 2.2, 4.6, 0, 1.5, 0.3, { walkable: false });
    PR.bed(b, C.x - 11.5, 0.02, s.z1 - 10, 1.9, {
      skeleton: true,
      straps: true,
    });
    PR.bed(b, C.x - 17.2, 0.02, C.z - 14, -0.6, {
      skeleton: false,
      sheet: "canvas_w",
    });
    PR.wheelchair(b, C.x - 9.4, 0, s.z1 - 3.2, 2.6, true);
    PR.wheelchair(b, C.x + 10.5, 0, s.z1 - 4, -0.4, false);
    for (const [x, z, a] of [
      [C.x - 12.6, s.z1 - 13, 1.9],
      [C.x + 9.8, s.z1 - 8, 0.5],
    ]) {
      PR.skeleton(b, x, 0.03, z, a);
      b.box("canvas_w", x, 0.12, z, 0.7, 0.06, 1.8, {
        ry: a,
        rz: 0.05,
        seg: false,
        grime: 0.7,
      });
    }
    const r = PR.rng("pr_oct_grounds");
    for (let k = 0; k < 7; k++) {
      const x = s.x0 + 3 + r() * 10,
        z = s.z0 + 4 + r() * (s.z1 - s.z0 - 8);
      if (Math.abs(z - C.z) < 6) continue;
      PR.deadTree(b, x, 0, z, 6 + r() * 4, 700 + k);
      PR.col(x, z, 0.5, 0.5, 0, 4, 0, { walkable: false });
    }
    for (const [x, z, a] of [
      [C.x - 14, C.z + 6, 0.8],
      [C.x - 16.5, C.z - 8, 2.4],
      [C.x + 12, C.z + 20, -1.3],
    ])
      PR.skeleton(b, x, 0.03, z, a);
    PR.wheelchair(b, C.x - 13.4, 0, C.z - 5.2, 1.2, false);
    PR.bed(b, C.x - 17, 0.02, C.z + 11, 0.4, { skeleton: true, straps: true });
    D.papers(b, C.x - 13, 0.62, C.z, 2.4, 14, 91);
    b.build(root);
    return anchors;
  }

  // ===================================================================
  // INTERIOR
  // ===================================================================
  function buildInterior(cell, extAnchors) {
    const O = cell.origin,
      ox = O.x,
      oy = O.y,
      oz = O.z;
    const X = (x) => ox + x,
      Y = (y) => oy + y,
      Z = (z) => oz + z;
    const P = (x, y, z) => V3(ox + x, oy + y, oz + z);
    const A = (x, y, z, yaw) => PR.anchor(ox + x, oy + y, oz + z, yaw || 0);
    const anchors = {};
    const root = cell.root;
    const r = PR.rng("pr_oct_int");
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
    const win = (x, y, z, ry, w, h) => {
      b.quad("win_day", X(x), Y(y), Z(z), w, h, { ry, noAO: true });
      for (let k = 1; k < 5; k++) {
        const lx = -w / 2 + (k * w) / 5;
        b.box(
          "iron",
          X(x + Math.cos(ry) * lx),
          Y(y - h / 2),
          Z(z - Math.sin(ry) * lx),
          0.03,
          h,
          0.03,
          { seg: false },
        );
      }
    };

    // ---------------- baked lights ----------------
    const L = [];
    const Lp = (x, y, z, color, rr, i) =>
      L.push({ x: X(x), y: Y(y), z: Z(z), color, r: rr, i });
    Lp(0, 27, 0, 0xe2e0cc, 34, 0.6); // oculus (neutral grey daylight)
    Lp(0, 3, 0, 0xffd8a8, 9, 0.25); // warm bounce off the checker floor
    Lp(0, 16, 0, 0xd8d8c8, 14, 0.25);
    Lp(-12.5, 3.4, 0, 0xffe0b0, 7, 0.55); // vestibule
    Lp(0, 3.6, -18, 0xffd8a0, 9, 0.35);
    Lp(0, 3.6, -30, 0xffd8a0, 9, 0.28);
    Lp(0, 2.0, -37.5, 0x60ff90, 6, 0.6);
    Lp(0, 3.6, 16, 0xd0e0ff, 10, 0.3);
    Lp(3.2, 0.8, 22, 0x70ff40, 8, 0.75);
    Lp(-3, 3.6, 27, 0xd0e0ff, 8, 0.25);
    Lp(0, 3, 36, 0xffc890, 8, 0.4);
    Lp(0, 8, 36, 0xffc890, 8, 0.35);
    Lp(0, 13, 36, 0xff5030, 8, 0.4);
    Lp(0, 6.9, -17, 0xffc070, 8, 0.7);
    Lp(0, 9, -19, 0xffe0b0, 10, 0.3);
    Lp(0, 8.6, -32, 0xd8e0ff, 10, 0.3);
    Lp(4.5, 6.4, 22, 0x8aa8e0, 7, 0.55);
    Lp(-3, 8.6, 18, 0xd8d0b0, 10, 0.3);
    Lp(0, 13.6, -17, 0xff3020, 9, 0.5);
    Lp(0, 13.6, -31, 0xff3020, 9, 0.45);
    Lp(0, 13.8, 20, 0xf0f8ff, 10, 0.75);
    Lp(-4, 12.2, 26, 0x80a0ff, 6, 0.35);
    Lp(-7, 16.4, 0, 0xffb060, 7, 0.6);
    b = PR.batch("oct_int");
    b.ground = oy;
    b.aoH = 3.2;
    b.setLights(L, 0x8a96a4, 0.08);

    // =============================== ROTUNDA ===============================
    const oct = PR.octPoly(0, 0, IRI);
    // floor (checker marble, a compass rose of the asylum seal) + gallery slabs with the stair well
    const fl = new THREE.Shape();
    oct.forEach((p, i) =>
      i ? fl.lineTo(p[0], -p[1]) : fl.moveTo(p[0], -p[1]),
    );
    const flg = new THREE.ExtrudeGeometry(fl, {
      depth: 0.3,
      bevelEnabled: false,
    });
    flg.rotateX(-HP);
    b.add("checker", flg, { m: PR.m4(X(0), Y(-0.3), Z(0)), grime: 0.5 });
    PR.colMM(X(-IRI), Y(-0.4), Z(-IRI), X(IRI), Y(0), Z(IRI));
    const sealK = PR.texMat(
      "pr_oct_seal",
      PR.canvasTex(
        "pr_oct_seal",
        512,
        512,
        (ctx, w) => {
          ctx.fillStyle = "#1e2224";
          ctx.fillRect(0, 0, w, w);
          ctx.strokeStyle = "#b8b0a0";
          ctx.lineWidth = 10;
          ctx.beginPath();
          ctx.arc(w / 2, w / 2, w / 2 - 14, 0, TAU);
          ctx.stroke();
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(w / 2, w / 2, w / 2 - 44, 0, TAU);
          ctx.stroke();
          ctx.fillStyle = "#b8b0a0";
          ctx.font = "bold 30px Georgia";
          ctx.textAlign = "center";
          const txt = "NEW YORK CITY LUNATIC ASYLUM • BLACKWELL'S ISLAND • ";
          for (let i = 0; i < txt.length; i++) {
            const a = -HP + (i / txt.length) * TAU;
            ctx.save();
            ctx.translate(
              w / 2 + Math.cos(a) * (w / 2 - 30),
              w / 2 + Math.sin(a) * (w / 2 - 30),
            );
            ctx.rotate(a + HP);
            ctx.fillText(txt[i], 0, 10);
            ctx.restore();
          }
          for (let k = 0; k < 8; k++) {
            const a = (k / 8) * TAU;
            ctx.beginPath();
            ctx.moveTo(w / 2, w / 2);
            ctx.lineTo(w / 2 + Math.cos(a) * 150, w / 2 + Math.sin(a) * 150);
            ctx.lineTo(
              w / 2 + Math.cos(a + 0.2) * 60,
              w / 2 + Math.sin(a + 0.2) * 60,
            );
            ctx.fill();
          }
          ctx.font = "bold 44px Georgia";
          ctx.fillText("1839", w / 2, w / 2 + 16);
          for (let i = 0; i < 2600; i++) {
            ctx.fillStyle = "rgba(0,0,0," + Math.random() * 0.3 + ")";
            ctx.fillRect(Math.random() * w, Math.random() * w, 3, 3);
          }
        },
        { clamp: true },
      ),
      { rough: 0.5 },
    );
    b.quad(sealK, X(0), Y(0.012), Z(0), 5.4, 5.4, { rx: -HP, grime: 0.4 });
    // gallery slabs (octagon ring with a round well)
    for (const y of [5, 10, 15]) {
      const sh = new THREE.Shape();
      oct.forEach((p, i) =>
        i ? sh.lineTo(p[0], -p[1]) : sh.moveTo(p[0], -p[1]),
      );
      const hole = new THREE.Path();
      hole.absarc(0, 0, GAL_IN, 0, TAU, true);
      sh.holes.push(hole);
      const g = new THREE.ExtrudeGeometry(sh, {
        depth: 0.35,
        bevelEnabled: false,
        curveSegments: 24,
      });
      g.rotateX(-HP);
      b.add(y === 15 ? "planks" : "planks", g, {
        m: PR.m4(X(0), Y(y - 0.35), Z(0)),
        grime: 0.5,
      });
      // colliders: 16 radial boxes + corner fillers
      for (let k = 0; k < 16; k++) {
        const a = ((k + 0.5) / 16) * TAU,
          rm = (GAL_IN + IAP) / 2 + 0.02;
        PR.col(
          X(Math.cos(a) * rm),
          Z(Math.sin(a) * rm),
          IAP - GAL_IN + 0.05,
          2 * IAP * Math.tan(PI / 16) + 0.1,
          Y(y - 0.4),
          Y(y),
          -a,
          { surface: "wood" },
        );
      }
      for (let k = 0; k < 8; k++) {
        const a = PI / 8 + (k * PI) / 4;
        PR.col(
          X(Math.cos(a) * (IRI - 0.7)),
          Z(Math.sin(a) * (IRI - 0.7)),
          1.4,
          1.4,
          Y(y - 0.4),
          Y(y),
          -a,
          { surface: "wood" },
        );
      }
      // cast-iron railing on the inner edge (gap at the stair arrival, angles -40°..+6°)
      const n = 48;
      for (let k = 0; k < n; k++) {
        const a0 = (k / n) * TAU,
          a1 = ((k + 1) / n) * TAU;
        const am = (a0 + a1) / 2;
        const rel = ((am + PI) % TAU) - PI;
        if (rel > -0.72 && rel < 0.1) continue;
        const p0 = [
            Math.cos(a0) * (GAL_IN + 0.08),
            Math.sin(a0) * (GAL_IN + 0.08),
          ],
          p1 = [Math.cos(a1) * (GAL_IN + 0.08), Math.sin(a1) * (GAL_IN + 0.08)];
        b.beam(
          "iron",
          P(p0[0], y + 1.0, p0[1]),
          P(p1[0], y + 1.0, p1[1]),
          0.06,
          0.05,
        );
        b.beam(
          "iron",
          P(p0[0], y + 0.12, p0[1]),
          P(p1[0], y + 0.12, p1[1]),
          0.04,
          0.04,
        );
        for (let q = 0; q < 3; q++) {
          const t = q / 3,
            aa = a0 + (a1 - a0) * t;
          box(
            "iron",
            Math.cos(aa) * (GAL_IN + 0.08),
            y,
            Math.sin(aa) * (GAL_IN + 0.08),
            0.03,
            1.0,
            0.03,
          );
        }
        PR.colWall(
          X(p0[0]),
          Z(p0[1]),
          X(p1[0]),
          Z(p1[1]),
          0.12,
          Y(y - 0.2),
          Y(y + 1.05),
          { walkable: false, surface: "metal" },
        );
      }
      // gallery fascia with a Greek-key band
      b.cyl(
        "plaster_w",
        X(0),
        Y(y - 0.75),
        Z(0),
        GAL_IN + 0.02,
        GAL_IN + 0.02,
        0.4,
        32,
        { hSeg: 1, open: true },
      );
    }
    // rotunda walls: 8 faces, openings N/S (three levels), W (entrance)
    const faceLen = 2 * IRI * Math.sin(PI / 8) + 0.9;
    const doorGaps = [
      { c: 0, w: 2.2, y0: 0, h: 3.0 },
      { c: 0, w: 2.2, y0: 5, h: 2.8 },
      { c: 0, w: 2.2, y0: 10, h: 2.8 },
    ];
    W(
      "plaster_w",
      "x",
      -faceLen / 2,
      faceLen / 2,
      -IAP - 0.8,
      -IAP,
      0,
      22,
      doorGaps,
      { grime: 0.5 },
    );
    W(
      "plaster_w",
      "x",
      -faceLen / 2,
      faceLen / 2,
      IAP,
      IAP + 0.8,
      0,
      22,
      doorGaps,
      { grime: 0.5 },
    );
    W(
      "plaster_w",
      "z",
      -faceLen / 2,
      faceLen / 2,
      -IAP - 0.8,
      -IAP,
      0,
      22,
      [
        { c: 0, w: 2.4, y0: 0, h: 3.2 },
        { c: 0, w: 1.4, y0: 6.2, h: 2.4 },
        { c: 0, w: 1.4, y0: 11.2, h: 2.4 },
      ],
      { grime: 0.5 },
    );
    W(
      "plaster_w",
      "z",
      -faceLen / 2,
      faceLen / 2,
      IAP,
      IAP + 0.8,
      0,
      22,
      [
        { c: 0, w: 1.4, y0: 1.2, h: 2.4 },
        { c: 0, w: 1.4, y0: 6.2, h: 2.4 },
        { c: 0, w: 1.4, y0: 11.2, h: 2.4 },
        { c: 0, w: 1.4, y0: 16.2, h: 2.4 },
      ],
      { grime: 0.5 },
    );
    for (const [x, y] of [
      [IAP + 0.45, 2.4],
      [IAP + 0.45, 7.4],
      [IAP + 0.45, 12.4],
      [IAP + 0.45, 17.4],
      [-IAP - 0.45, 7.4],
      [-IAP - 0.45, 12.4],
    ])
      win(x, y, 0, x > 0 ? -HP : HP, 1.4, 2.4);
    for (let k = 0; k < 4; k++) {
      const th = PI / 4 + (k * PI) / 2;
      const cx = Math.cos(th) * (IAP + 0.4),
        cz = Math.sin(th) * (IAP + 0.4);
      b.box("plaster_w", X(cx), Y(0), Z(cz), 0.8, 22, faceLen, {
        ry: -th,
        grime: 0.5,
        segLen: 4,
      });
      col(cx, cz, 0.8, faceLen, 0, 22, -th);
      // tall windows on the diagonal faces (one per level)
      for (const y of [2.2, 7.2, 12.2, 17.2]) {
        const wx = Math.cos(th) * (IAP - 0.02),
          wz = Math.sin(th) * (IAP - 0.02);
        b.quad("win_day", X(wx), Y(y), Z(wz), 1.2, 2.3, {
          ry: Math.atan2(-Math.cos(th), -Math.sin(th)),
          noAO: true,
        });
      }
    }
    // institutional two-tone paint: dark green-brown dado with a picture rail on every level (light plaster above)
    {
      const fl2 = 2 * IAP * Math.tan(PI / 8),
        DH = 1.15;
      for (let k = 0; k < 8; k++) {
        const th = (k * PI) / 4,
          nx = -Math.cos(th),
          nz = -Math.sin(th),
          tx = -Math.sin(th),
          tz = Math.cos(th);
        const ry = Math.atan2(nx, nz),
          axisDoor = k === 2 || k === 6; // k 2/6 = ±Z faces: doors on 3 levels
        for (const y of LV) {
          const door = (axisDoor && y < 15) || (k === 4 && y === 0);
          const dw = k === 4 ? 2.4 : 2.2;
          const segs = door
            ? [
                [-fl2 / 2, -dw / 2 - 0.05],
                [dw / 2 + 0.05, fl2 / 2],
              ]
            : [[-fl2 / 2, fl2 / 2]];
          for (const [u0, u1] of segs) {
            const uc = (u0 + u1) / 2,
              w = u1 - u0;
            if (w < 0.3) continue;
            const px = Math.cos(th) * (IAP - 0.025) + tx * uc,
              pz = Math.sin(th) * (IAP - 0.025) + tz * uc;
            b.quad("dado", X(px), Y(y + DH / 2), Z(pz), w, DH, {
              ry,
              grime: 0.5,
              uv: "box",
            });
            b.box(
              "oak",
              X(px + nx * 0.02),
              Y(y + DH),
              Z(pz + nz * 0.02),
              w,
              0.07,
              0.05,
              { ry, seg: false },
            );
          }
        }
      }
    }
    // wainscot + corner pilasters with capitals at each gallery
    for (let k = 0; k < 8; k++) {
      const a = PI / 8 + (k * PI) / 4,
        x = Math.cos(a) * (IRI - 0.25),
        z = Math.sin(a) * (IRI - 0.25);
      box("limestone", x, 0, z, 0.55, 20, 0.55, {
        ry: -a,
        seg: false,
        grime: 0.4,
      });
      for (const y of [4.3, 9.3, 14.3, 19.3])
        box("limestone", x, y, z, 0.8, 0.35, 0.8, { ry: -a, seg: false });
    }
    // dome (inner shell) + oculus + drum ring
    for (let k = 0; k < 8; k++) {
      const th = (k * PI) / 4;
      b.box(
        "limestone",
        X(Math.cos(th) * (IAP - 0.3)),
        Y(20),
        Z(Math.sin(th) * (IAP - 0.3)),
        0.9,
        0.55,
        faceLen,
        { ry: -th, seg: false, grime: 0.4 },
      );
    }
    const dprof = [
      [1.7, 8.2],
      [2.8, 7.9],
      [4.3, 7.2],
      [5.8, 6.0],
      [7.2, 4.4],
      [8.3, 2.6],
      [9.2, 0.9],
      [9.6, 0],
    ];
    b.lathe("plaster_w", dprof, 16, X(0), Y(20.5), Z(0), { grime: 0.6 });
    b.lathe("plaster_w", dprof.slice().reverse(), 16, X(0), Y(20.5), Z(0), {
      grime: 0.6,
    }); // both windings: visible from any side
    for (let k = 0; k < 8; k++) {
      const phi = PI / 8 + (k * PI) / 4,
        sx = Math.sin(phi),
        sz = Math.cos(phi);
      for (let i = 0; i < dprof.length - 1; i++) {
        const p = dprof[i],
          q = dprof[i + 1];
        b.beam(
          "limestone",
          P(sx * (p[0] - 0.05), 20.5 + p[1], sz * (p[0] - 0.05)),
          P(sx * (q[0] - 0.05), 20.5 + q[1], sz * (q[0] - 0.05)),
          0.22,
          0.18,
        );
      }
    }
    b.add("limestone", new THREE.TorusGeometry(1.75, 0.18, 6, 24), {
      m: PR.m4(X(0), Y(28.7), Z(0), 0, HP),
    });
    b.add("oculus", new THREE.CircleGeometry(1.7, 20), {
      m: PR.m4(X(0), Y(29.2), Z(0), 0, HP),
      uv: "box",
      noAO: true,
    });
    PR.lightShaft(root, X(0), Y(29), Z(0), 1.6, 5.2, 29, 0xe8e4d0, 0.03);
    PR.glow(P(0, 28.6, 0), 0xd8f0c8, 5, root, { intensity: 0.9 });
    // hanging chain + dead chandelier ring in the well
    b.beam("iron", P(0, 28.5, 0), P(0, 17, 0), 0.04, 0.04);
    b.add("brass", new THREE.TorusGeometry(1.2, 0.06, 5, 16), {
      m: PR.m4(X(0), Y(17), Z(0), 0, HP),
    });
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * TAU;
      b.sphere(
        "glass_broken",
        X(Math.cos(a) * 1.2),
        Y(17.15),
        Z(Math.sin(a) * 1.2),
        0.08,
        { ws: 5, hs: 4 },
      );
    }

    // ---- THE SPIRAL STAIR (three full turns of cantilevered stone treads, iron stringer, balustrade) ----
    // Colliders from PR.spiral (visual off); the treads are built here as individual stone blocks with a
    // marble nosing plate so that from the rotunda floor the underside reads as a stepped, cantilevered helix
    // (not a smooth ramp), with a dark cast-iron inner stringer and a mahogany handrail on iron balusters.
    PR.spiral(
      b,
      "marble",
      X(0),
      Z(0),
      Y(0),
      STAIR.rIn,
      STAIR.rOut,
      STAIR.a0,
      3,
      5,
      STAIR.per,
      { noVisual: true, rail: "iron", railH: 1.0 },
    );
    {
      const per = STAIR.per,
        n = 3 * per,
        da = TAU / per,
        dy = 5 / per,
        rI = STAIR.rIn,
        rO = STAIR.rOut;
      const sector = (r0, r1, aA, aB) => {
        const sh = new THREE.Shape();
        sh.moveTo(Math.cos(aA) * r0, Math.sin(aA) * r0);
        sh.lineTo(Math.cos(aA) * r1, Math.sin(aA) * r1);
        sh.absarc(0, 0, r1, aA, aB, false);
        sh.lineTo(Math.cos(aB) * r0, Math.sin(aB) * r0);
        sh.absarc(0, 0, r0, aB, aA, true);
        return sh;
      };
      // one tread block (local: centred on angle 0), reused for every step through its matrix
      const blockH = dy + 0.16;
      const gBlock = new THREE.ExtrudeGeometry(
        sector(rI, rO - 0.06, -da / 2 - 0.01, da / 2 + 0.01),
        { depth: blockH, bevelEnabled: false, curveSegments: 2 },
      );
      gBlock.rotateX(HP);
      gBlock.translate(0, blockH, 0);
      const plateH = 0.06;
      const gPlate = new THREE.ExtrudeGeometry(
        sector(rI - 0.03, rO + 0.02, -da / 2 - 0.01, da / 2 + 0.05),
        { depth: plateH, bevelEnabled: false, curveSegments: 2 },
      );
      gPlate.rotateX(HP);
      gPlate.translate(0, plateH, 0);
      const rr = PR.rng("oct_stair");
      for (let i = 0; i < n; i++) {
        const a = STAIR.a0 + da * (i + 0.5),
          top = dy * (i + 1);
        const broken = i === 23 || i === 41; // two treads cracked off at the nosing
        b.add("limestone", gBlock.clone(), {
          m: PR.m4(X(0), Y(top - blockH - plateH + 0.001), Z(0), -a),
          grime: 0.5,
        });
        b.add(broken ? "marble_dark" : "marble", gPlate.clone(), {
          m: PR.m4(X(0), Y(top - plateH), Z(0), -a, 0, broken ? 0.02 : 0),
          grime: 0.35,
        });
        // balusters: two per tread on the inner edge (every fourth one a heavier turned post)
        for (const f of [0.25, 0.75]) {
          const aa = STAIR.a0 + da * (i + f),
            yb = top;
          const heavy = (i * 2 + (f > 0.5 ? 1 : 0)) % 4 === 0;
          if (i === 41 && f > 0.5) continue; // a missing baluster
          b.box(
            "iron",
            X(Math.cos(aa) * (rI + 0.1)),
            Y(yb),
            Z(Math.sin(aa) * (rI + 0.1)),
            heavy ? 0.05 : 0.022,
            0.98 + f * dy,
            heavy ? 0.05 : 0.022,
            { ry: -aa, seg: false, noAO: true },
          );
        }
        // handrail (mahogany cap on an iron core) and the lower iron rail
        const a1 = STAIR.a0 + da * i,
          a2 = a1 + da,
          y1 = dy * i + dy * 0.5,
          y2 = y1 + dy;
        const hp = (aa, y, rad, h) =>
          P(Math.cos(aa) * rad, y + h, Math.sin(aa) * rad);
        b.beam(
          "mahogany",
          hp(a1, y1 + 0.5 * dy, rI + 0.1, 1.0),
          hp(a2, y2 + 0.5 * dy, rI + 0.1, 1.0),
          0.09,
          0.06,
          { grime: 0.2 },
        );
        b.beam(
          "iron",
          hp(a1, y1 + 0.5 * dy, rI + 0.1, 0.16),
          hp(a2, y2 + 0.5 * dy, rI + 0.1, 0.16),
          0.03,
          0.03,
        );
        // a little debris on a few treads
        if (rr() < 0.12)
          b.box(
            "rubble",
            X(Math.cos(a) * (rI + 0.8 + rr() * 1.2)),
            Y(top),
            Z(Math.sin(a) * (rI + 0.8 + rr() * 1.2)),
            0.25,
            0.08,
            0.2,
            { ry: rr() * 3, seg: false },
          );
      }
      // cast-iron stringers: inner (tall, with a moulded top) and a slim outer fascia — both follow the helix
      const ribbon = (key, rad, hTop, hBot, flip) => {
        const pos = [],
          idx = [];
        for (let i = 0; i <= n * 2; i++) {
          const a = STAIR.a0 + (i / (per * 2)) * TAU,
            y = (i * dy) / 2;
          pos.push(
            Math.cos(a) * rad,
            y + hTop,
            Math.sin(a) * rad,
            Math.cos(a) * rad,
            y - hBot,
            Math.sin(a) * rad,
          );
          if (i < n * 2) {
            const q = i * 2;
            if (flip) idx.push(q, q + 2, q + 1, q + 1, q + 2, q + 3);
            else idx.push(q, q + 1, q + 2, q + 1, q + 3, q + 2);
          }
        }
        const g = new THREE.BufferGeometry();
        g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
        g.setIndex(idx);
        g.computeVertexNormals();
        b.add(key, g, { m: PR.m4(X(0), Y(0), Z(0)), grime: 0.3, noAO: true });
      };
      ribbon("iron", rI - 0.04, 0.04, 0.62, false);
      ribbon("iron", rI - 0.04, 0.04, 0.62, true); // both faces
      ribbon("iron", rO - 0.05, -0.02, 0.34, false);
      ribbon("iron", rO - 0.05, -0.02, 0.34, true);
      ribbon("limestone", rI - 0.07, 0.08, -0.02, false); // moulded cap line
    }
    // newel post at the foot of the stair
    box(
      "oak",
      Math.cos(STAIR.a0 + 0.05) * (STAIR.rIn + 0.1),
      0,
      Math.sin(STAIR.a0 + 0.05) * (STAIR.rIn + 0.1),
      0.3,
      1.3,
      0.3,
    );
    b.sphere(
      "brass",
      X(Math.cos(STAIR.a0 + 0.05) * (STAIR.rIn + 0.1)),
      Y(1.4),
      Z(Math.sin(STAIR.a0 + 0.05) * (STAIR.rIn + 0.1)),
      0.16,
      {},
    );
    // rotunda dressing: toppled benches, gurneys, a fallen chandelier, dead patients, papers
    D.papers(b, X(0), Y(0.01), Z(0), 7, 50, 1839);
    for (const [x, z, a] of [
      [-6.5, 4, 0.3],
      [6.2, -5.6, 2.2],
      [-3.5, -7.4, -1.1],
    ])
      PR.skeleton(b, X(x), Y(0.02), Z(z), a);
    PR.wheelchair(b, X(-6.8), Y(0), Z(-3.6), 0.6, true);
    PR.bed(b, X(6.4), Y(0), Z(5.4), 2.4, {
      mattress: true,
      sheet: "canvas_w",
      skeleton: false,
    });
    D.rubble(b, X(3.2), Y(0), Z(7.6), 1.0, 6, 55);
    for (let k = 0; k < 4; k++)
      D.chair(
        b,
        X(-7.6 + k * 0.9),
        Y(15),
        Z(-2.4 + k * 0.4),
        k * 0.7,
        k % 2 === 0,
        "oak",
      );
    const graf2 = PR.texMat(
      "pr_oct_graf2",
      PR.graffitiTex(
        "pr_oct_graf2",
        ["ROUND AND", "ROUND AND", "ROUND"],
        512,
        512,
        { color: "#8a1a10" },
      ),
      { transparent: true },
    );
    b.quad(graf2, X(0), Y(7.5), Z(IAP - 0.02), 2.6, 2.6, { ry: PI });
    const graf3 = PR.texMat(
      "pr_oct_graf3",
      PR.graffitiTex("pr_oct_graf3", ["HE IS", "UPSTAIRS"], 512, 512, {
        color: "#9a2014",
      }),
      { transparent: true },
    );
    b.quad(graf3, X(-IAP + 0.02), Y(12.6), Z(2.3), 2.0, 2.0, { ry: HP });
    anchors.rotunda = A(-4, 0, 0, -HP);
    anchors.spawn1 = A(6.5, 0, -2, HP);
    anchors.stair_foot = A(Math.cos(STAIR.a0) * 4.1 - 0.8, 0, -0.9, 0);

    // ---- vestibule & admissions (x -16..-9.85) ----
    floor("checker", -16.4, -3.4, -IAP - 0.8, 3.4, 0);
    W("gneiss_dk", "z", -3.4, 3.4, -16.8, -16.2, 0, 4.6);
    W("plaster_w", "x", -16.8, -IAP - 0.7, -3.9, -3.3, 0, 4.6);
    W("plaster_w", "x", -16.8, -IAP - 0.7, 3.3, 3.9, 0, 4.6);
    ceil("plaster_w", -16.8, -3.9, -IAP - 0.7, 3.9, 4.4);
    box("oak", -14.2, 0, -2.3, 3.2, 1.1, 0.9);
    col(-14.2, -2.3, 3.2, 0.9, 0, 1.1);
    box("oak", -14.2, 1.1, -2.3, 3.4, 0.06, 1.05);
    D.papers(b, X(-14.2), Y(1.17), Z(-2.3), 1.1, 8, 7);
    D.monitor(b, X(-13.4), Y(1.16), Z(-2.5), 0, false);
    b.box("brass", X(-15.3), Y(1.16), Z(-2.1), 0.14, 0.05, 0.14, {
      seg: false,
    }); // service bell
    for (let k = 0; k < 3; k++)
      D.chair(b, X(-15.4 + k * 1.1), Y(0), Z(2.7), PI, k === 1, "oak");
    b.quad("oak", X(-16.18), Y(1.6), Z(0), 1.8, 3.1, { ry: HP }); // front door (inside)
    const admK = PR.texMat(
      "pr_oct_adm",
      PR.signTex(
        "pr_oct_adm",
        ["ADMISSIONS", "ALL PATIENTS MUST BE ACCOMPANIED"],
        "enamel",
        512,
        128,
        { bg: "#1c2a2a", fg: "#e0d8b8" },
      ),
    );
    b.quad(admK, X(-14.2), Y(3.3), Z(-3.28), 2.2, 0.55, {});
    PR.door({
      id: "pr_oct_exit",
      pos: P(-15.9, 1.6, 0),
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
    anchors.entrance = A(-14.4, 0, 0, -HP);
    anchors.admissions = A(-14.2, 1.17, -2.3, 0);

    // ---------------- helper to build one wing level ----------------
    // wings run along z from the rotunda face (|z| = IAP+0.8) out to |z| = 40, x -7..7
    const WZ0 = IAP + 0.8,
      WZ1 = 40.5;
    const S = (sgn, z) => sgn * z; // mirror helper (north wing: sgn -1)
    function wingShell(sgn) {
      // outer walls (both long sides), end wall, throat walls, floors & ceilings
      const za = S(sgn, WZ0),
        zb = S(sgn, WZ1);
      const z0 = Math.min(za, zb),
        z1 = Math.max(za, zb);
      for (const [x0, x1] of [
        [-7.6, -7],
        [7, 7.6],
      ])
        W("plaster_w", "z", z0, z1, x0, x1, 0, 15.4, [], { grime: 0.55 });
      W(
        "gneiss_dk",
        "x",
        -7.6,
        7.6,
        sgn < 0 ? z0 - 0.6 : z1,
        sgn < 0 ? z0 : z1 + 0.6,
        0,
        15.4,
        [],
        {},
      );
      // throat (2.2 m wide corridor from the rotunda doorway to the rooms)
      const tz0 = S(sgn, WZ0),
        tz1 = S(sgn, 12);
      for (const lv of [0, 5, 10]) {
        // throat side walls + partition at |z| = 12 with a doorway
        for (const sx of [-1, 1])
          W(
            "plaster_w",
            "z",
            Math.min(tz0, tz1),
            Math.max(tz0, tz1),
            sx * 1.1 - (sx > 0 ? 0 : 0.3),
            sx * 1.1 + (sx > 0 ? 0.3 : 0),
            lv,
            lv + 4.65,
            [],
            {},
          );
        W(
          "plaster_w",
          "x",
          -7,
          -1.1,
          Math.min(S(sgn, 12), S(sgn, 12.3)),
          Math.max(S(sgn, 12), S(sgn, 12.3)),
          lv,
          lv + 4.65,
          [],
          {},
        );
        W(
          "plaster_w",
          "x",
          1.1,
          7,
          Math.min(S(sgn, 12), S(sgn, 12.3)),
          Math.max(S(sgn, 12), S(sgn, 12.3)),
          lv,
          lv + 4.65,
          [],
          {},
        );
        b.boxMM(
          "plaster_w",
          X(-1.1),
          Y(lv + 3.0),
          Z(Math.min(S(sgn, 12), S(sgn, 12.3))),
          X(1.1),
          Y(lv + 4.65),
          Z(Math.max(S(sgn, 12), S(sgn, 12.3))),
          { seg: false },
        );
        floor(
          lv === 0 ? "checker" : "planks",
          -1.1,
          Math.min(tz0, tz1),
          1.1,
          Math.max(tz0, tz1),
          lv,
          0.35,
        );
        ceil(
          "plaster_w",
          -1.1,
          Math.min(tz0, tz1),
          1.1,
          Math.max(tz0, tz1),
          lv + 4.1,
        );
      }
    }
    wingShell(-1);
    wingShell(1);

    // ============================ NORTH WING ============================
    // ---- L0: Women's Ward A (z -12.3..-35) + night-nurse station (z -35..-40) ----
    floor("checker", -7, -40, 7, -12.3, 0);
    ceil("plaster_w", -7, -40, 7, -12.3, 4.6);
    for (let z = -15.2; z > -34; z -= 3.6) {
      for (const sx of [-1, 1]) {
        const i = Math.round(-z);
        PR.bed(b, X(sx * 5.2), Y(0), Z(z), sx > 0 ? -HP : HP, {
          skeleton: (i * 7 + sx) % 5 === 0,
          straps: (i + sx) % 3 === 0,
          tilt: r() - 0.5,
        });
        win(sx * 6.98, 2.5, z, sx > 0 ? -HP : HP, 1.2, 2.2);
      }
    }
    for (let z = -16; z > -34; z -= 6)
      D.fluoro(b, X(0), Y(4.2), Z(z), 0, 2.4, z % 12 === -4, Y(4.65));
    PR.wheelchair(b, X(1.2), Y(0), Z(-26), 2.2, false);
    D.papers(b, X(0), Y(0.01), Z(-24), 4, 18, 21);
    const wardK = PR.texMat(
      "pr_oct_wardA",
      PR.signTex(
        "pr_oct_wardA",
        ["WARD A — FEMALE", "QUIET PLEASE"],
        "enamel",
        512,
        128,
        { bg: "#e0d8c0", fg: "#1a2a3a" },
      ),
    );
    b.quad(wardK, X(0), Y(3.6), Z(-12.36), 2.0, 0.5, { ry: PI });
    // nurse station
    W("plaster_w", "x", -7, 7, -35.3, -35, 0, 4.65, [
      { c: 0, w: 2.0, y0: 0, h: 2.6 },
      { c: -4, w: 2.6, y0: 1.1, h: 1.2 },
    ]);
    box("enamel_w", -4, 0, -35.8, 3.0, 1.05, 0.6);
    col(-4, -35.8, 3.0, 0.6, 0, 1.05);
    box("panel", 4.6, 0, -39.4, 3.4, 2.0, 0.6);
    col(4.6, -39.4, 3.4, 0.6, 0, 2.0); // medicine cabinet wall
    for (let k = 0; k < 6; k++)
      b.cyl(
        k % 2 ? "glass_dark" : "paint_cream",
        X(3.2 + k * 0.5),
        Y(1.3),
        Z(-39.1),
        0.05,
        0.05,
        0.16,
        6,
        { hSeg: 1 },
      );
    D.chair(b, X(-4), Y(0), Z(-37), 0.2, false, "steel");
    PR.skeleton(b, X(-2.2), Y(0.02), Z(-38.2), 1.9);
    anchors.nurse_terminal = A(-5.2, 1.05, -35.9, PI);
    anchors.nurse_desk = A(-3.2, 1.07, -35.8, 0);
    anchors.nurse_aid = A(4.6, 1.4, -39.0, 0);
    anchors.ward = A(0, 0, -22, 0);
    anchors.ward_bed = A(-5.2, 0, -29.6, 0);
    anchors.spawn2 = A(2.5, 0, -28, 0);

    // ---- L1: Superintendent's office (z -12.3..-25) + records (z -25..-40) ----
    floor("carpet", -7, -25, 7, -12.3, 5);
    floor("planks", -7, -40, 7, -25, 5);
    ceil("plaster_w", -7, -40, 7, -12.3, 9.6);
    W("oak", "x", -7, 7, -25.3, -25, 5, 9.65, [
      { c: 3, w: 1.6, y0: 5, h: 2.5 },
    ]);
    // wood panelling, bookcases, desk, diplomas, display case (the Orbitoclast)
    for (const sx of [-1, 1])
      b.boxMM(
        "oak",
        X(sx * 6.98 - (sx > 0 ? 0.04 : 0)),
        Y(5),
        Z(-25),
        X(sx * 6.98 + (sx > 0 ? 0 : 0.04)),
        Y(6.3),
        Z(-12.3),
        { seg: false },
      );
    win(-6.97, 7.5, -18.5, HP, 1.4, 2.2);
    win(6.97, 7.5, -18.5, -HP, 1.4, 2.2);
    for (const z of [-14, -16.2, -20.8, -23]) {
      D.shelf(b, X(-6.6), Y(5), Z(z), HP, 2.0, 4, Math.round(-z * 3));
      col(-6.6, z, 0.5, 2.0, 5, 7.2);
    }
    box("mahogany", 0, 5, -17.5, 2.6, 0.8, 1.2);
    col(0, -17.5, 2.6, 1.2, 5, 5.8);
    box("mahogany", 0, 5.8, -17.5, 2.8, 0.06, 1.35);
    D.papers(b, X(0.6), Y(5.87), Z(-17.4), 0.8, 8, 44);
    b.cyl("brass", X(-0.9), Y(5.86), Z(-17.8), 0.1, 0.14, 0.05, 8, { hSeg: 1 });
    b.cyl("brass", X(-0.9), Y(5.9), Z(-17.8), 0.015, 0.015, 0.4, 4, {
      hSeg: 1,
    });
    b.cyl("lamp_warm", X(-0.9), Y(6.3), Z(-17.8), 0.08, 0.2, 0.18, 8, {
      hSeg: 1,
    });
    PR.glow(P(-0.9, 6.35, -17.8), 0xffc070, 1.2, root, {
      intensity: 0.9,
      flicker: 0.1,
    });
    D.chair(b, X(0), Y(5), Z(-18.6), PI, false, "mahogany");
    D.chair(b, X(-0.8), Y(5), Z(-15.8), 0.3, false, "mahogany");
    D.chair(b, X(0.9), Y(5), Z(-15.9), -0.4, true, "mahogany");
    for (let k = 0; k < 3; k++)
      D.painting(b, k + 1, X(-2.4 + k * 2.4), Y(7.8), Z(-24.98), 1.0, 0.8, 0);
    // display case
    box("mahogany", 4.8, 5, -14.2, 1.8, 0.9, 0.7);
    col(4.8, -14.2, 1.8, 0.7, 5, 6.1);
    b.boxMM(
      "glass_broken",
      X(3.95),
      Y(5.9),
      Z(-14.5),
      X(5.65),
      Y(6.1),
      Z(-13.9),
      { seg: false },
    );
    box("velvet", 4.8, 5.9, -14.2, 1.6, 0.03, 0.55);
    const certK = PR.texMat(
      "pr_oct_cert",
      PR.signTex(
        "pr_oct_cert",
        [
          "CERTIFICATE OF MERIT",
          "Dr. C. HARROW",
          "TRANSORBITAL LEUCOTOMY — 500 PROCEDURES",
          "Civil Defense Mental Hygiene Division",
        ],
        "engraved",
        512,
        320,
        { bg: "#e8dcb8" },
      ),
    );
    b.quad(certK, X(4.8), Y(7.4), Z(-12.4), 1.2, 0.75, { ry: PI });
    anchors.office = A(0, 5, -16, 0);
    anchors.office_terminal = A(0.7, 5.86, -17.9, 0);
    anchors.orbitoclast = A(4.8, 5.95, -14.2, 0);
    anchors.office_safe = A(5.9, 5, -23.8, -HP);
    // records room: rows of steel file cabinets
    for (let x = -5; x <= 5; x += 2.5) {
      for (let z = -27; z > -39; z -= 0.75)
        box("steel", x, 5, z, 0.7, 1.5, 0.62, { seg: false, grime: 0.6 });
      col(x, -33, 0.7, 12.2, 5, 6.5);
    }
    D.papers(b, X(0), Y(5.01), Z(-33), 5, 30, 71);
    PR.skeleton(b, X(1.3), Y(5.02), Z(-36), 0.4);
    for (let z = -28; z > -39; z -= 5)
      D.fluoro(b, X(0), Y(9.2), Z(z), 0, 2.4, z === -33, Y(9.65));
    anchors.records = A(0, 5, -32, 0);
    anchors.spawn4 = A(-3.8, 5, -31, 0);

    // ---- L2: "The Lodge" — padded isolation cells ----
    floor("checker", -7, -40, 7, -12.3, 10);
    ceil("plaster_w", -7, -40, 7, -12.3, 14.6);
    // corridor x -1.5..1.5; cells on both sides, 5 per side
    const lodgeCells = [];
    for (let i = 0; i < 5; i++) {
      const zc = -15 - i * 5.1;
      for (const sx of [-1, 1]) {
        const num = i * 2 + (sx > 0 ? 1 : 2);
        const xa = sx * 1.5,
          xb = sx * 7;
        // cell walls (padded inside)
        W(
          "plaster_w",
          "x",
          Math.min(xa, xb),
          Math.max(xa, xb),
          zc - 2.55,
          zc - 2.4,
          10,
          14.65,
          [],
          {},
        );
        W(
          "plaster_w",
          "z",
          zc - 2.4,
          zc + 2.4,
          sx > 0 ? 1.5 : -1.8,
          sx > 0 ? 1.8 : -1.5,
          10,
          14.65,
          [{ c: zc + 1.2, w: 1.1, y0: 10, h: 2.3 }],
          {},
        );
        b.boxMM(
          "padded",
          X(Math.min(xa, xb) + (sx > 0 ? 0.3 : 0.05)),
          Y(10),
          Z(zc - 2.38),
          X(Math.max(xa, xb) - (sx > 0 ? 0.05 : 0.3)),
          Y(13.2),
          Z(zc - 2.3),
          { seg: false, grime: 0.6 },
        );
        b.boxMM(
          "padded",
          X(sx > 0 ? 6.95 : -7.0),
          Y(10),
          Z(zc - 2.3),
          X(sx > 0 ? 7.0 : -6.95),
          Y(13.2),
          Z(zc + 2.3),
          { seg: false, grime: 0.6 },
        );
        lodgeCells.push({ num, zc, sx });
        const cellK = PR.texMat(
          "pr_oct_cell" + num,
          PR.signTex("pr_oct_cell" + num, [String(num)], "enamel", 128, 128, {
            bg: "#d8d0b8",
            fg: "#1a1a1a",
          }),
        );
        b.quad(cellK, X(sx * 1.47), Y(12.8), Z(zc + 1.2), 0.3, 0.3, {
          ry: sx > 0 ? -HP : HP,
        });
        // door leaf: open (swung in) or shut (solid + collider)
        const shut = num === 3 || num === 8;
        if (shut) {
          box("steel", sx * 1.65, 10, zc + 1.2, 0.08, 2.3, 1.1);
          col(sx * 1.65, zc + 1.2, 0.15, 1.1, 10, 12.3);
          box("glass_dark", sx * 1.6, 11.6, zc + 1.2, 0.04, 0.2, 0.4);
        } else if (num !== 6)
          box("steel", sx * 2.1, 10, zc + 1.9, 0.08, 2.3, 1.1, {
            ry: sx * 1.2,
            seg: false,
          });
        win(sx * 6.94, 12.6, zc - 0.6, sx > 0 ? -HP : HP, 0.5, 0.6);
      }
    }
    // cell contents: bed frames, restraints, scratches, a skeleton in a straitjacket, the locked cell 6
    for (const c of lodgeCells) {
      if (c.num % 3 !== 0)
        PR.bed(b, X(c.sx * 5.2), Y(10), Z(c.zc - 0.4), 0, {
          straps: true,
          skeleton: c.num === 5,
        });
      if (c.num === 7) {
        PR.skeleton(b, X(c.sx * 4.5), Y(10.02), Z(c.zc + 0.5), 0.8);
        b.box(
          "canvas_w",
          X(c.sx * 4.5),
          Y(10.05),
          Z(c.zc + 0.2),
          0.5,
          0.2,
          0.6,
          { seg: false },
        );
      }
    }
    const scratchK = PR.texMat(
      "pr_oct_scr",
      PR.graffitiTex(
        "pr_oct_scr",
        ["LET ME OUT", "LET ME OUT", "LET ME OUT"],
        512,
        512,
        { color: "#5a2a1a", drips: false },
      ),
      { transparent: true },
    );
    b.quad(scratchK, X(-6.9), Y(11.8), Z(-30.3 + 0.8), 2.4, 2.4, { ry: HP });
    const tally = PR.texMat(
      "pr_oct_tally",
      PR.canvasTex(
        "pr_oct_tally",
        256,
        256,
        (ctx, w, h) => {
          ctx.clearRect(0, 0, w, h);
          ctx.strokeStyle = "rgba(60,30,20,0.85)";
          ctx.lineWidth = 3;
          for (let g = 0; g < 30; g++) {
            const x0 = 10 + (g % 6) * 40,
              y0 = 10 + Math.floor(g / 6) * 48;
            for (let k = 0; k < 4; k++) {
              ctx.beginPath();
              ctx.moveTo(x0 + k * 7, y0);
              ctx.lineTo(x0 + k * 7 + 2, y0 + 36);
              ctx.stroke();
            }
            ctx.beginPath();
            ctx.moveTo(x0 - 3, y0 + 30);
            ctx.lineTo(x0 + 28, y0 + 6);
            ctx.stroke();
          }
        },
        { clamp: true },
      ),
      { transparent: true },
    );
    b.quad(tally, X(6.9), Y(11.6), Z(-19.9), 1.6, 1.6, { ry: -HP });
    // cell 6 gate (lock 75): holds the lodge stash
    const c6 = lodgeCells.find((c) => c.num === 6);
    PR.gate({
      x: X(c6.sx * 1.65),
      y: Y(10),
      z: Z(c6.zc + 1.2),
      w: 1.1,
      h: 2.3,
      ry: HP,
      flag: "oct_cell6",
      label: "Isolation Cell 6",
      lock: PR.LOCKS.oct_cell6,
      parent: root,
      bars: false,
      key: "steel",
    });
    anchors.cell6 = A(c6.sx * 5, 10, c6.zc - 1.2, 0);
    anchors.lodge = A(0, 10, -24, 0);
    anchors.lodge_tape = A(-4.6, 10.05, -14.2, 0);
    anchors.spawn5 = A(0, 10, -30, 0);
    for (let z = -15; z > -38; z -= 6)
      D.fluoro(b, X(0), Y(14.2), Z(z), 0, 1.6, false, Y(14.65));
    for (const z of [-17, -31]) {
      b.box("lamp_red", X(0), Y(14.4), Z(z), 0.3, 0.14, 0.3, {
        seg: false,
        noAO: true,
      });
      PR.glow(P(0, 14.3, z), 0xff3020, 1.2, root, {
        intensity: 1.0,
        flicker: 0.5,
      });
    }
    const lodgeK = PR.texMat(
      "pr_oct_lodge",
      PR.signTex(
        "pr_oct_lodge",
        ["THE LODGE", "VIOLENT PATIENTS — STAFF IN PAIRS"],
        "enamel",
        512,
        128,
        { bg: "#7a1c14", fg: "#f0e0c0" },
      ),
    );
    b.quad(lodgeK, X(0), Y(13.6), Z(-12.36), 2.4, 0.6, { ry: PI });

    // ============================ SOUTH WING ============================
    // ---- L0: HYDROTHERAPY (z 12.3..32) ----
    b.boxMM("tile_wall", X(-7), Y(-0.01), Z(12.3), X(7), Y(0.02), Z(32), {
      seg: false,
      grime: 0.6,
    });
    PR.colMM(X(-7), Y(-0.4), Z(12.3), X(7), Y(0.02), Z(40));
    for (const sx of [-1, 1])
      b.boxMM(
        "tile_wall",
        X(sx > 0 ? 6.95 : -7),
        Y(0),
        Z(12.3),
        X(sx > 0 ? 7 : -6.95),
        Y(4.6),
        Z(32),
        { seg: false, grime: 0.6 },
      );
    ceil("plaster_w", -7, 12.3, 7, 32, 4.6);
    // continuous-bath tubs with canvas restraint covers; one leaks irradiated water
    const tubs = [];
    for (let i = 0; i < 4; i++)
      for (const sx of [-1, 1]) tubs.push([sx * 4.2, 15 + i * 4.2]);
    tubs.forEach(([x, z], i) => {
      // enamelled cast-iron tub: base + four walls (hollow), water inside, canvas restraint cover
      b.boxMM(
        "enamel_w",
        X(x - 0.8),
        Y(0),
        Z(z - 1.1),
        X(x + 0.8),
        Y(0.28),
        Z(z + 1.1),
        { seg: false, grime: 0.7 },
      );
      for (const [a0, b0, a1, b1] of [
        [-0.8, -1.1, 0.8, -0.98],
        [-0.8, 0.98, 0.8, 1.1],
        [-0.8, -1.1, -0.68, 1.1],
        [0.68, -1.1, 0.8, 1.1],
      ])
        b.boxMM(
          "enamel_w",
          X(x + a0),
          Y(0.28),
          Z(z + b0),
          X(x + a1),
          Y(0.74),
          Z(z + b1),
          { seg: false, grime: 0.6 },
        );
      b.boxMM(
        "enamel_w",
        X(x - 0.86),
        Y(0.72),
        Z(z - 1.16),
        X(x + 0.86),
        Y(0.78),
        Z(z + 1.16),
        { seg: false, grime: 0.5 },
      );
      const glowT = i === 3;
      b.boxMM(
        glowT ? "rad_water" : "dirty_water_k",
        X(x - 0.68),
        Y(0.5),
        Z(z - 0.98),
        X(x + 0.68),
        Y(0.53),
        Z(z + 0.98),
        { seg: false, noAO: true },
      );
      if (!glowT)
        b.boxMM(
          "canvas_w",
          X(x - 0.86),
          Y(0.78),
          Z(z - 1.1),
          X(x + 0.86),
          Y(0.81),
          Z(z + 0.55),
          { seg: false, grime: 0.6 },
        );
      if (!glowT && i % 2 === 0)
        b.sphere("canvas_w", X(x), Y(0.84), Z(z + 0.78), 0.14, {
          ws: 8,
          hs: 5,
          sy: 0.6,
        }); // the head-hole
      for (const sx of [-0.7, 0.7])
        for (const sz of [-1.0, 1.0])
          b.sphere("iron", X(x + sx), Y(0.06), Z(z + sz), 0.09, {
            ws: 5,
            hs: 4,
          }); // claw feet
      b.cyl("chrome", X(x), Y(0.78), Z(z - 1.05), 0.03, 0.03, 0.4, 5, {
        hSeg: 1,
      });
      col(x, z, 1.6, 2.2, 0, 0.78, 0, { surface: "metal" });
      if (i === 5) PR.skeleton(b, X(x), Y(0.82), Z(z - 0.2), 0);
    });
    const radTub = tubs[3];
    PR.onInitDone.push(() => {
      try {
        G.world.addRadSource({
          x: X(radTub[0]),
          y: Y(0.6),
          z: Z(radTub[1]),
          radius: 4,
          strength: 4,
        });
      } catch (e) {
        /* core */
      }
    });
    PR.glow(P(radTub[0], 0.9, radTub[1]), 0x70ff40, 2.0, root, {
      intensity: 0.9,
      flicker: 0.15,
    });
    b.boxMM(
      "rad_water",
      X(radTub[0] - 1.6),
      Y(0.021),
      Z(radTub[1] + 1.1),
      X(radTub[0] + 0.3),
      Y(0.03),
      Z(radTub[1] + 3.2),
      { seg: false, noAO: true },
    );
    // needle shower cage (ring pipes) + hose reel + drain channel + wet-pack table
    for (let k = 0; k < 6; k++)
      b.add("chrome", new THREE.TorusGeometry(0.65, 0.035, 5, 18), {
        m: PR.m4(X(0), Y(0.4 + k * 0.35), Z(29.4), 0, HP),
      });
    for (let k = 0; k < 4; k++) {
      const a = (k / 4) * TAU;
      b.cyl(
        "chrome",
        X(Math.cos(a) * 0.65),
        Y(0),
        Z(29.4 + Math.sin(a) * 0.65),
        0.03,
        0.03,
        2.4,
        5,
        { hSeg: 1 },
      );
    }
    b.cyl("chrome", X(0), Y(2.4), Z(29.4), 0.3, 0.12, 0.12, 10, { hSeg: 1 });
    b.boxMM("iron", X(-0.25), Y(0.021), Z(12.6), X(0.25), Y(0.03), Z(31.6), {
      seg: false,
    });
    b.box("steel", X(-6.4), Y(1.0), Z(26), 0.4, 0.9, 0.9, { seg: false });
    b.add("rust", new THREE.TorusGeometry(0.35, 0.08, 5, 14), {
      m: PR.m4(X(-6.1), Y(1.45), Z(26), HP),
    });
    box("enamel_w", 5.2, 0, 30, 1.2, 0.85, 2.2);
    col(5.2, 30, 1.2, 2.2, 0, 0.9);
    box("linen", 5.2, 0.85, 30, 1.1, 0.12, 2.0);
    for (let z = 14; z < 32; z += 6)
      D.fluoro(b, X(0), Y(4.2), Z(z), 0, 2.4, z === 20, Y(4.65));
    const hydK = PR.texMat(
      "pr_oct_hydro",
      PR.signTex(
        "pr_oct_hydro",
        ["HYDROTHERAPY", "CALM IS A TEMPERATURE"],
        "enamel",
        512,
        128,
        { bg: "#dce4e0", fg: "#1a3a4a" },
      ),
    );
    b.quad(hydK, X(0), Y(3.6), Z(12.36), 2.2, 0.55, {});
    anchors.hydro = A(0, 0, 21, PI);
    anchors.hydro_locker = A(-6.4, 0, 16.5, -HP);
    anchors.spawn3 = A(-1.5, 0, 24, PI);
    // wall between hydrotherapy and the service stair hall (z 32..32.3) with the chained gate at x -4
    W("tile_wall", "x", -7, 7, 32, 32.3, 0, 4.65, [
      { c: -4, w: 1.6, y0: 0, h: 2.6 },
    ]);
    PR.gate({
      x: X(-4),
      y: Y(0),
      z: Z(32.15),
      w: 1.6,
      h: 2.6,
      ry: 0,
      flag: "oct_gate",
      label: "Service Stair Gate",
      chain: true,
      parent: root,
      canUse: (p) => p.z > Z(32.15),
      denyText: "The gate is chained shut from the other side.",
      verbOpen: "Unchain",
      lockedText: "Chained from the other side.",
    });
    anchors.gate = A(-4, 0, 31.2, 0);

    // ---- L1: day room (z 12.3..32) ----
    floor("checker", -7, 12.3, 7, 32, 5);
    ceil("plaster_w", -7, 12.3, 7, 32, 9.6);
    W("plaster_w", "x", -7, 7, 32, 32.3, 5, 9.65, [
      { c: -4, w: 1.6, y0: 5, h: 2.6 },
    ]);
    for (let z = 15; z < 31; z += 4)
      for (const sx of [-1, 1])
        win(sx * 6.97, 7.4, z, sx > 0 ? -HP : HP, 1.2, 2.2);
    // circle of chairs, piano, TV console, checkers table, patient drawings
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * TAU;
      D.chair(
        b,
        X(Math.cos(a) * 2.2 - 1.5),
        Y(5),
        Z(20 + Math.sin(a) * 2.2),
        -a - HP + (k === 3 ? 1.5 : 0),
        k === 5,
        "oak",
      );
    }
    box("mahogany", -5.2, 5, 27.5, 1.5, 1.1, 0.7);
    box("mahogany", -5.2, 6.1, 27.8, 1.5, 0.6, 0.3);
    box("paint_cream", -5.2, 5.9, 27.3, 1.3, 0.05, 0.25);
    col(-5.2, 27.5, 1.5, 0.8, 5, 6.3);
    box("oak", 4.5, 5, 22, 1.3, 1.1, 0.7);
    col(4.5, 22, 1.3, 0.7, 5, 6.1);
    b.quad("tv_glow", X(4.5), Y(5.75), Z(21.63), 0.7, 0.55, {
      ry: PI,
      noAO: true,
    });
    PR.glow(P(4.5, 5.75, 21.5), 0x8aa8e0, 1.6, root, {
      intensity: 0.8,
      flicker: 0.6,
    });
    box("oak", 2, 5, 28, 0.9, 0.72, 0.9);
    b.quad(
      PR.texMat(
        "pr_checkers",
        PR.canvasTex(
          "pr_checkers",
          128,
          128,
          (ctx) => {
            for (let i = 0; i < 8; i++)
              for (let j = 0; j < 8; j++) {
                ctx.fillStyle = (i + j) % 2 ? "#1a1a1a" : "#b83a2a";
                ctx.fillRect(i * 16, j * 16, 16, 16);
              }
          },
          { clamp: true },
        ),
      ),
      X(2),
      Y(5.73),
      Z(28),
      0.7,
      0.7,
      { rx: -HP },
    );
    col(2, 28, 0.9, 0.9, 5, 5.72);
    const artK = PR.texMat(
      "pr_oct_art",
      PR.canvasTex(
        "pr_oct_art",
        512,
        256,
        (ctx, w, h) => {
          ctx.fillStyle = "#d8d0b8";
          ctx.fillRect(0, 0, w, h);
          const rr = PR.rng(1887);
          for (let k = 0; k < 4; k++) {
            const x0 = 10 + k * 125;
            ctx.fillStyle = "#efe8d4";
            ctx.fillRect(x0, 20, 110, 150);
            ctx.strokeStyle = ["#2a2a8a", "#8a2a2a", "#2a6a2a", "#1a1a1a"][k];
            ctx.lineWidth = 3;
            if (k === 0) {
              ctx.beginPath();
              for (let i = 0; i < 60; i++) {
                const a = i * 0.5,
                  rad = i * 0.8;
                ctx.lineTo(x0 + 55 + Math.cos(a) * rad, 95 + Math.sin(a) * rad);
              }
              ctx.stroke();
            }
            if (k === 1) {
              for (let i = 0; i < 8; i++) {
                ctx.beginPath();
                ctx.moveTo(x0 + 10 + i * 12, 30);
                ctx.lineTo(x0 + 10 + i * 12, 160);
                ctx.stroke();
              }
            }
            if (k === 2) {
              ctx.beginPath();
              ctx.moveTo(x0 + 20, 150);
              ctx.lineTo(x0 + 55, 40);
              ctx.lineTo(x0 + 90, 150);
              ctx.closePath();
              ctx.stroke();
              ctx.beginPath();
              ctx.arc(x0 + 55, 110, 14, 0, TAU);
              ctx.stroke();
            }
            if (k === 3) {
              ctx.font = "bold 22px Georgia";
              ctx.fillStyle = "#1a1a1a";
              ctx.fillText("NELL", x0 + 20, 70);
              ctx.fillText("WAS", x0 + 25, 100);
              ctx.fillText("HERE", x0 + 20, 130);
            }
            void rr;
          }
        },
        { clamp: true },
      ),
    );
    b.quad(artK, X(-2.5), Y(7.6), Z(32 - 0.02), 3.2, 1.6, { ry: PI });
    for (let z = 15; z < 31; z += 7)
      D.fluoro(b, X(0), Y(9.2), Z(z), 0, 2.4, false, Y(9.65));
    anchors.dayroom = A(-1.5, 5, 20, 0);
    anchors.day_piano = A(-5.2, 5, 26.6, 0);

    // ---- L2: treatment room (z 12.3..32) ----
    floor("tile_wall", -7, 12.3, 7, 32, 10, 0.35, { seg: false, grime: 0.6 });
    ceil("plaster_w", -7, 12.3, 7, 32, 14.6);
    W("plaster_w", "x", -7, 7, 32, 32.3, 10, 14.65, [
      { c: -4, w: 1.6, y0: 10, h: 2.6 },
    ]);
    for (const sx of [-1, 1])
      b.boxMM(
        "tile_wall",
        X(sx > 0 ? 6.95 : -7),
        Y(10),
        Z(12.3),
        X(sx > 0 ? 7 : -6.95),
        Y(12),
        Z(32),
        { seg: false, grime: 0.6 },
      );
    // operating table + surgical lamp
    box("chrome", 0, 10, 20, 0.3, 0.85, 0.3);
    box("enamel_w", 0, 10.85, 20, 0.8, 0.12, 2.0);
    col(0, 20, 0.9, 2.0, 10, 11);
    b.cyl("chrome", X(0), Y(13.2), Z(20), 0.02, 0.02, 1.45, 4, { hSeg: 1 });
    b.lathe(
      "enamel_w",
      [
        [0.05, 0.3],
        [0.5, 0.25],
        [0.65, 0.05],
        [0.6, 0.0],
      ],
      16,
      X(0),
      Y(12.9),
      Z(20),
      {},
    );
    b.add("lamp", new THREE.CircleGeometry(0.5, 16), {
      m: PR.m4(X(0), Y(12.92), Z(20), 0, HP),
      uv: "box",
      noAO: true,
    });
    PR.glow(P(0, 12.8, 20), 0xf0f8ff, 2.4, root, {
      intensity: 1.0,
      flicker: 0.05,
    });
    // electroconvulsive chair with the apparatus
    box("oak", -4.2, 10, 25.5, 0.9, 0.5, 0.9);
    box("oak", -4.2, 10.5, 25.9, 0.9, 1.2, 0.12);
    box("oak", -4.2, 10.5, 25.5, 0.9, 0.08, 0.9);
    for (const sx of [-0.45, 0.45])
      box("oak", -4.2 + sx, 10.5, 25.5, 0.08, 0.35, 0.8);
    b.add("chrome", new THREE.TorusGeometry(0.16, 0.03, 5, 12), {
      m: PR.m4(X(-4.2), Y(11.85), Z(25.7), 0, HP),
    });
    col(-4.2, 25.6, 1.0, 1.0, 10, 11.7);
    box("panel", -6.2, 10, 25.5, 0.8, 1.6, 1.2);
    col(-6.2, 25.5, 0.8, 1.2, 10, 11.6);
    for (let k = 0; k < 3; k++) {
      b.cyl(
        "glass_dark",
        X(-5.78),
        Y(11.2),
        Z(25 + k * 0.45),
        0.12,
        0.12,
        0.04,
        10,
        { hSeg: 1, rz: HP },
      );
    }
    b.sphere("lamp_red", X(-5.78), Y(11.45), Z(26.2), 0.04, { ws: 5, hs: 4 });
    D.cable(
      b,
      [P(-5.8, 11.2, 25.5), P(-4.8, 11.9, 25.6), P(-4.3, 11.9, 25.7)],
      0.3,
    );
    PR.glow(P(-5.7, 11.4, 25.6), 0x80a0ff, 0.9, root, {
      intensity: 0.8,
      flicker: 0.9,
    });
    // instrument trolley, specimen jars, gurney with restraints
    box("chrome", 2.2, 10, 21.6, 0.9, 0.9, 0.5);
    for (let k = 0; k < 5; k++)
      box("chrome", 1.9 + k * 0.15, 10.9, 21.6, 0.03, 0.02, 0.25);
    col(2.2, 21.6, 0.9, 0.5, 10, 10.9);
    for (let k = 0; k < 6; k++) {
      b.cyl(
        "glass_dark",
        X(6.3),
        Y(11.2 + (k % 2) * 0.5),
        Z(15 + Math.floor(k / 2) * 0.5),
        0.12,
        0.12,
        0.35,
        8,
        { hSeg: 1 },
      );
    }
    box("steel", 6.4, 10, 15.5, 0.6, 2.0, 1.8);
    col(6.4, 15.5, 0.6, 1.8, 10, 12);
    PR.bed(b, X(3.8), Y(10), Z(28.2), HP, { straps: true, sheet: "linen" });
    const ectK = PR.texMat(
      "pr_oct_ect",
      PR.signTex(
        "pr_oct_ect",
        [
          "TREATMENT ROOM",
          "PATIENT MUST BE RESTRAINED",
          "BEFORE CURRENT IS APPLIED",
        ],
        "enamel",
        512,
        256,
        { bg: "#e0dcc8", fg: "#6a1a14" },
      ),
    );
    b.quad(ectK, X(-6.94), Y(12.9), Z(19), 1.6, 0.8, { ry: HP });
    for (let z = 14; z < 32; z += 6)
      D.fluoro(b, X(-3), Y(14.2), Z(z), 0, 1.6, false, Y(14.65));
    anchors.treatment = A(0, 10, 22, 0);
    anchors.treatment_tape = A(3.8, 10.62, 27.8, 0);
    anchors.treatment_cabinet = A(6.4, 10, 17.2, -HP);
    anchors.spawn6 = A(-2, 10, 16, PI);

    // ---- service stair hall (z 32.3..40, x -7..7): L0 ↔ L1 ↔ L2 ----
    const LN = [33.1, 35.1],
      LS = [37.4, 39.4]; // north lane z, south lane z
    const flights = [
      [0, 2.5, LN, 1],
      [2.5, 5, LS, -1],
      [5, 7.5, LN, 1],
      [7.5, 10, LS, -1],
    ];
    for (const [y0, y1, lane, dir] of flights) {
      const zc = (lane[0] + lane[1]) / 2,
        xs = dir > 0 ? -2 : 2;
      PR.treads(
        b,
        "planks",
        X(xs),
        Z(zc),
        dir > 0 ? HP : -HP,
        2.0,
        4.0,
        Y(y0),
        Y(y1),
        { maxRise: 0.25, surface: "wood", thick: 0.14 },
      );
      // stringer + rail on the well side
      const wz = dir > 0 ? lane[1] + 0.08 : lane[0] - 0.08;
      b.beam(
        "iron",
        P(xs, y0 + 1.0, wz),
        P(xs + dir * 4, y1 + 1.0, wz),
        0.05,
        0.05,
      );
      for (let s = 0; s < 4; s++) {
        const t = (s + 0.5) / 4;
        col(
          xs + dir * 4 * t,
          wz,
          1.0,
          0.1,
          y0 + (y1 - y0) * t - 0.1,
          y0 + (y1 - y0) * t + 1.0,
        );
      }
    }
    // landings: east at 2.5 & 7.5, west at 5 & 10
    for (const [y, x0, x1] of [
      [2.5, 2, 6.9],
      [7.5, 2, 6.9],
      [5, -6.9, -2],
      [10, -6.9, -2],
    ]) {
      floor("planks", x0, 32.3, x1, 39.9, y, 0.25);
    }
    for (const sx of [-1, 1])
      b.boxMM(
        "brick_int",
        X(sx > 0 ? 6.97 : -7),
        Y(0),
        Z(32.3),
        X(sx > 0 ? 7 : -6.97),
        Y(14.65),
        Z(40.5),
        { seg: false, grime: 0.7 },
      );
    W("brick_int", "x", -7, 7, 39.9, 40.5, 0, 15.4, [], {});
    ceil("plaster_w", -7, 32.3, 7, 40, 14.6);
    for (const y of [3.2, 8.2, 13.2]) {
      b.box("lamp_warm", X(0), Y(y), Z(39.8), 0.3, 0.2, 0.15, {
        seg: false,
        noAO: true,
      });
      PR.glow(P(0, y, 39.6), 0xffc890, 1.0, root, {
        intensity: 0.8,
        flicker: 0.3,
      });
    }
    PR.skeleton(b, X(4.5), Y(2.52), Z(36), 2.6);
    const exitK = PR.texMat(
      "pr_oct_svc",
      PR.signTex(
        "pr_oct_svc",
        ["STAFF STAIR", "KEEP GATE CHAINED — DR. H."],
        "enamel",
        512,
        128,
        { bg: "#2a3a2a", fg: "#e0d8b8" },
      ),
    );
    b.quad(exitK, X(-4), Y(3.2), Z(32.34), 1.6, 0.4, {});
    anchors.service_stair = A(-4, 10, 34, PI);

    // ============================ L3 DOME GALLERY ============================
    // the Superintendent's "archive": a nest of patient files, candles, his desk dragged up the stairs
    box("mahogany", -7.2, 15, -1.2, 1.2, 0.8, 2.4);
    col(-7.2, -1.2, 1.2, 2.4, 15, 15.8);
    D.papers(b, X(-7), Y(15.82), Z(-1.2), 0.9, 10, 88);
    D.papers(b, X(-6.2), Y(15.01), Z(1.8), 2.5, 40, 89);
    PR.candles(b, X(-7.3), Y(15.8), Z(-0.4), 5, 11, root);
    PR.candles(b, X(-6.4), Y(15.0), Z(3.4), 7, 12, root);
    for (let k = 0; k < 5; k++) {
      const a = PI * 0.8 + k * 0.18;
      D.crates(
        b,
        X(Math.cos(a) * 7.8),
        Y(15),
        Z(Math.sin(a) * 7.8),
        1 + (k % 2),
        200 + k,
        false,
      );
    }
    for (let k = 0; k < 3; k++)
      PR.bed(
        b,
        X(Math.cos(PI * 0.55 + k * 0.28) * 7.4),
        Y(15),
        Z(Math.sin(PI * 0.55 + k * 0.28) * 7.4),
        PI * 0.55 + k * 0.28,
        { skeleton: true, straps: true, collide: false },
      );
    anchors.boss = A(-6.2, 15, 0.5, -HP);
    anchors.dome = A(6, 15, 0, HP);
    anchors.dome_safe = A(-8.3, 15, -3.2, -HP);
    anchors.dome_bag = A(-6.8, 15.82, -2.0, 0);
    anchors.loot1 = A(-14.2, 1.17, -2.6, 0);
    anchors.loot2 = anchors.hydro_locker;
    anchors.loot3 = anchors.office_safe;
    anchors.loot4 = anchors.cell6;
    anchors.loot5 = anchors.dome_safe;

    b.build(root, { castShadow: false });
    return anchors;
  }

  // ===================================================================
  // BUILDER + CONTENT PLACEMENT
  // ===================================================================
  PR.addBuilder(
    "roosevelt_octagon",
    function (PR2, site, root) {
      const ext = buildExterior(root);
      const cell = PR.cell("roosevelt_octagon");
      const int = buildInterior(cell, ext);
      PR.door({
        id: "pr_oct_enter",
        pos: V3(C.x - APO - 0.4, 1.9, C.z),
        label: "The Octagon",
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
      PR.register("roosevelt_octagon", root, all, {
        interiorRoot: cell.root,
        interiorKey: "roosevelt_octagon",
      });
      PR.octAnchors = int;
      const Pp = (a, dy) => ({
        x: a.x,
        y: a.y + (dy || 0),
        z: a.z,
        yaw: a.yaw || 0,
      });
      // terminals, containers, notes, tape reels, unique
      PR.prop(
        "terminal",
        Object.assign(Pp(int.nurse_terminal), {
          terminalId: "pr_oct_nurse",
          id: "pr_oct_term_nurse",
        }),
      );
      PR.prop(
        "terminal",
        Object.assign(Pp(int.office_terminal), {
          terminalId: "pr_oct_harrow",
          id: "pr_oct_term_harrow",
          mount: "bare",
        }),
      );
      PR.prop(
        "first_aid",
        Object.assign(Pp(int.nurse_aid), {
          id: "pr_oct_aid",
          loot: "first_aid",
        }),
      );
      PR.prop(
        "locker",
        Object.assign(Pp(int.hydro_locker), {
          id: "pr_oct_hlocker",
          loot: "locker",
        }),
      );
      PR.prop("footlocker", {
        x: int.ward_bed.x + 1.2,
        y: int.ward_bed.y,
        z: int.ward_bed.z + 1.4,
        yaw: HP,
        id: "pr_oct_foot1",
        loot: "footlocker",
      });
      PR.prop(
        "safe",
        Object.assign(Pp(int.office_safe), {
          id: "pr_oct_osafe",
          locked: 0,
          lock: PR.LOCKS.oct_office_safe,
          name: "Superintendent's Safe",
          items: [
            ["scrip", 85],
            ["focus_pills", 2],
            ["morphine_syrette", 1],
            ["pr_note_harrow_letter", 1],
          ],
        }),
      );
      PR.prop("file_cabinet", {
        x: int.records.x - 5.9,
        y: int.records.y,
        z: int.records.z + 5,
        yaw: HP,
        id: "pr_oct_files1",
        loot: "file_cabinet",
      });
      PR.prop("file_cabinet", {
        x: int.records.x + 5.9,
        y: int.records.y,
        z: int.records.z - 4,
        yaw: -HP,
        id: "pr_oct_files2",
        loot: "file_cabinet",
      });
      PR.prop(
        "footlocker",
        Object.assign(Pp(int.cell6), {
          id: "pr_oct_cell6_stash",
          name: "Patient's Hoard",
          locked: 0,
          items: [
            ["rally_tonic", 3],
            ["prussian_blue", 2],
            ["scrip", 60],
            ["scrap_metal", 4],
            ["ammo_10mm", 24],
          ],
        }),
      );
      PR.prop(
        "first_aid",
        Object.assign(Pp(int.treatment_cabinet), {
          id: "pr_oct_tcab",
          loot: "medical_cabinet",
        }),
      );
      PR.prop(
        "safe",
        Object.assign(Pp(int.dome_safe), {
          id: "pr_oct_dsafe",
          locked: 0,
          lock: PR.LOCKS.oct_dome_safe,
          name: "Superintendent's Strongbox",
          items: [
            ["scrip", 140],
            ["rally_tonic", 2],
            ["rally_tonic_extra", 1],
            ["old_dollars", 6],
          ],
        }),
      );
      PR.prop("ammo_box", {
        x: int.dome.x - 1,
        y: int.dome.y,
        z: int.dome.z + 2.5,
        yaw: -HP,
        id: "pr_oct_ammo",
        loot: "ammo_box",
      });
      PR.pickup(
        "pr_note_admission",
        1,
        V3(
          int.admissions.x + 0.6,
          int.admissions.y + 0.01,
          int.admissions.z + 0.1,
        ),
      );
      PR.pickup(
        "pr_reel_nell1",
        1,
        V3(int.ward_bed.x + 0.2, int.ward_bed.y + 0.05, int.ward_bed.z + 1.2),
      );
      PR.pickup(
        "pr_oct_office_key",
        1,
        V3(int.nurse_desk.x, int.nurse_desk.y + 0.01, int.nurse_desk.z),
      );
      PR.pickup(
        "pr_note_hydro",
        1,
        V3(int.hydro.x + 5.2, 0.98, int.hydro.z + 9),
      );
      PR.pickup(
        "pr_orbitoclast",
        1,
        V3(int.orbitoclast.x, int.orbitoclast.y, int.orbitoclast.z),
      );
      PR.pickup(
        "pr_reel_nell2",
        1,
        V3(int.lodge_tape.x, int.lodge_tape.y, int.lodge_tape.z),
      );
      PR.pickup(
        "pr_reel_nell3",
        1,
        V3(int.treatment_tape.x, int.treatment_tape.y, int.treatment_tape.z),
      );
      PR.pickup(
        "pr_note_harrow_final",
        1,
        V3(int.dome_bag.x, int.dome_bag.y, int.dome_bag.z),
      );
      PR.pickup(
        "pr_oct_master_key",
        1,
        V3(int.dome_bag.x + 0.4, int.dome_bag.y, int.dome_bag.z + 0.5),
      );
      // the office door (locked, key from the night-nurse station)
      PR.gate({
        x: int.office.x,
        y: int.office.y,
        z: int.office.z + 3.55,
        w: 2.2,
        h: 2.8,
        ry: 0,
        flag: "oct_office",
        label: "Superintendent's Office",
        lock: PR.LOCKS.oct_office,
        parent: cell.root,
        bars: false,
        key: "oak",
      });
      // the Superintendent (named Maniac Bruiser) + a few Maniacs placed by hand (combat adds the location's spawns)
      PR.npc({
        id: "pr_oct_harrow",
        type: "maniac_bruiser",
        name: "The Superintendent",
        faction: "maniacs",
        level: 10,
        pos: Pp(int.boss),
        yaw: int.boss.yaw,
        ai: "guard",
        home: { x: int.boss.x, z: int.boss.z, r: 6 },
        seed: 1839,
        loot: "maniac_bruiser",
        xp: 150,
        noRespawn: true,
        barks: [
          "[a long, dragging moan that rises at the end like a question]",
          "[he hums the same three notes, round and round]",
          "[a scream that might once have been a patient's name]",
        ],
      });
      PR.npc({
        id: "pr_oct_maniac1",
        type: "maniac",
        name: "Maniac Patient",
        faction: "maniacs",
        level: 6,
        pos: Pp(int.ward),
        ai: "wander",
        home: { x: int.ward.x, z: int.ward.z, r: 8 },
        seed: 1840,
      });
      PR.npc({
        id: "pr_oct_maniac2",
        type: "maniac",
        name: "Maniac Orderly",
        faction: "maniacs",
        level: 7,
        pos: Pp(int.dayroom),
        ai: "wander",
        home: { x: int.dayroom.x, z: int.dayroom.z, r: 7 },
        seed: 1841,
      });
      PR.npc({
        id: "pr_oct_maniac3",
        type: "maniac",
        name: "Maniac Patient",
        faction: "maniacs",
        level: 6,
        pos: Pp(int.lodge),
        ai: "wander",
        home: { x: int.lodge.x, z: int.lodge.z, r: 8 },
        seed: 1842,
      });
      PR.npc({
        id: "pr_oct_maniac4",
        type: "maniac",
        name: "Maniac Nurse",
        faction: "maniacs",
        level: 7,
        pos: Pp(int.treatment),
        ai: "wander",
        home: { x: int.treatment.x, z: int.treatment.z, r: 6 },
        seed: 1843,
      });
    },
    10,
  );
})();
