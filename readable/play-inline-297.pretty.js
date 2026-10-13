/* src/poi_midtown2/20_algonquin.js */
/* =====================================================================
 * NEW RAD CITY — POI MIDTOWN 2 — THE ALGONQUIN HOTEL
 * Exterior (site x -110..-50, z -179..-146, facing 44th Street to the
 * south): the 12-storey Renaissance Revival hotel — rusticated limestone
 * base with arched openings, red brick shaft with limestone quoins and
 * lintels, arched attic storey under a deep bracketed copper cornice, the
 * green-and-gold marquee and the red neon ALGONQUIN blade sign, a water
 * tower on the roof — between the Hotel Iroquois and a book shop.
 * The settlement "The Round Table": sandbag gate, guard, string lights.
 * Interior (INTERIORS.algonquin): oak-panelled lobby (front desk, key
 * pigeonholes, armchairs, grandfather clock, the cat's bed), the Blue
 * Bar, the Round Table Room, the Oak Room supper club with a stage and
 * piano, and upstairs a corridor of guest rooms (clinic, scriptorium,
 * a rentable room, a sealed room, the locked room 207 where Matilda hides).
 * Friendly: named NPCs + dialogue in 80_content.js.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE || !G._pm2) return;
  const PM = G._pm2;
  const K = PM.kit,
    D = PM.dress;
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  const PI = Math.PI,
    HP = PI / 2,
    TAU = PI * 2;

  const FZ = -147.3; // facade plane (44th Street)
  const AX0 = -92,
    AX1 = -66,
    AH = 38; // hotel footprint x, cornice height
  const F2 = 5.4,
    CEIL2 = 8.8;

  Object.assign(PM.flagDefaults, {
    alg_cat_found: false,
    alg_cat_home: false,
    alg_cat_pets: 0,
    alg_room_rented: false,
  });

  // ===================================================================
  // EXTERIOR
  // ===================================================================
  function buildExterior(site, root) {
    const b = PM.batch("alg_ext");
    b.ground = 0;
    b.aoH = 4;
    const r = PM.rng("alg_ext");
    const A = {};
    const back = site.z0 + 1;
    b.boxMM("sidewalk", site.x0, -0.1, FZ - 0.2, site.x1, 0.06, site.z1 - 0.2, {
      grime: 0.6,
      segLen: 6,
    });

    // ---------------- the hotel ----------------
    const cx = (AX0 + AX1) / 2;
    // limestone base (2 storeys) with rustication grooves
    b.boxMM("limestone", AX0, 0, back, AX1, 8.6, FZ, { grime: 0.5 });
    {
      // rustication grooves, interrupted by the arched openings
      const holes = [
        [AX0 + 3.0, 1.6],
        [AX0 + 7.3, 1.6],
        [(AX0 + AX1) / 2, 2.1],
        [AX1 - 7.3, 1.6],
        [AX1 - 3.0, 1.6],
      ];
      for (let y = 0.9; y < 8.2; y += 0.62) {
        let xa = AX0 - 0.03;
        const cuts =
          y < 5.9
            ? holes.map(([hx, hw]) => [hx - hw, hx + hw])
            : y > 6.0 && y < 8.0
              ? []
              : [];
        for (const [c0, c1] of cuts.concat([[AX1 + 0.03, AX1 + 0.03]])) {
          if (c0 > xa + 0.05)
            b.boxMM("granite_dark", xa, y, FZ - 0.02, c0, y + 0.05, FZ + 0.03, {
              seg: false,
              grime: 0.2,
            });
          xa = c1;
        }
      }
    }
    b.boxMM("granite_dark", AX0 - 0.1, 0, FZ - 0.1, AX1 + 0.1, 0.8, FZ + 0.12, {
      seg: false,
    });
    // brick shaft with limestone quoins
    b.boxMM("alg_brick", AX0, 8.6, back, AX1, AH - 3.2, FZ - 0.05, {
      grime: 0.45,
    });
    for (const x of [AX0, AX1 - 1.2])
      for (let y = 8.6, k = 0; y < AH - 3.4; y += 0.7, k++)
        b.boxMM(
          "limestone",
          x - (k % 2 ? 0 : 0.05),
          y,
          FZ - 0.02,
          x + (k % 2 ? 0.9 : 1.25),
          y + 0.62,
          FZ + 0.06,
          { seg: false, grime: 0.4 },
        );
    // belt courses
    for (const y of [8.6, 12.0, AH - 3.2])
      b.boxMM(
        "limestone",
        AX0 - 0.15,
        y - 0.15,
        FZ - 0.1,
        AX1 + 0.15,
        y + 0.35,
        FZ + 0.25,
        { seg: false, grime: 0.4 },
      );
    // attic storey (limestone) with arched windows, then the deep bracketed copper cornice
    b.boxMM("limestone", AX0, AH - 3.2, back, AX1, AH + 1.2, FZ, {
      grime: 0.5,
    });
    for (let i = 0; i < 9; i++) {
      const x = AX0 + 1.9 + (i * (AX1 - AX0 - 3.8)) / 8;
      b.quad("glass_dark", x, AH - 1.3, FZ + 0.02, 1.0, 2.0, {
        ry: 0,
        noAO: true,
      });
      b.add("limestone", new THREE.TorusGeometry(0.55, 0.1, 4, 10, PI), {
        m: PM.m4(x, AH - 0.3, FZ + 0.05),
      });
    }
    b.boxMM(
      "copper",
      AX0 - 1.2,
      AH + 1.2,
      FZ - 0.6,
      AX1 + 1.2,
      AH + 1.9,
      FZ + 1.4,
      { seg: false, grime: 0.5 },
    );
    b.boxMM(
      "copper",
      AX0 - 0.9,
      AH + 0.6,
      FZ - 0.4,
      AX1 + 0.9,
      AH + 1.2,
      FZ + 1.0,
      { seg: false },
    );
    for (let x = AX0 - 0.6; x <= AX1 + 0.6; x += 1.1)
      b.box("copper", x, AH + 0.25, FZ + 0.55, 0.25, 0.9, 0.9, {
        seg: false,
        rx: 0.15,
      });
    PM.colMM(AX0, 0, back, AX1, AH + 1.9, FZ + 0.1, { walkable: false });
    // shaft windows: 7 bays × 8 floors, stone lintels + sills; some lit (settlement), some boarded
    for (let f = 0; f < 8; f++) {
      const y = 12.8 + f * 2.95;
      for (let i = 0; i < 7; i++) {
        const x = AX0 + 3.0 + (i * (AX1 - AX0 - 6)) / 6;
        const roll = r();
        const key =
          roll < 0.12
            ? "glass_broken"
            : roll < 0.2
              ? "planks"
              : (f < 3 && roll > 0.62) || roll > 0.88
                ? "window_lit"
                : "glass_dark";
        b.quad(key, x, y + 1.0, FZ + 0.01, 1.25, 2.0, { ry: 0, noAO: true });
        b.boxMM(
          "limestone",
          x - 0.85,
          y + 2.0,
          FZ - 0.02,
          x + 0.85,
          y + 2.35,
          FZ + 0.12,
          { seg: false, grime: 0.4 },
        );
        b.box("limestone", x, y + 2.0, FZ + 0.1, 0.3, 0.42, 0.1, {
          seg: false,
        });
        b.boxMM(
          "limestone",
          x - 0.75,
          y - 0.12,
          FZ - 0.02,
          x + 0.75,
          y,
          FZ + 0.18,
          { seg: false },
        );
      }
    }
    // second floor (base) windows with keystones
    for (let i = 0; i < 7; i++) {
      const x = AX0 + 3.0 + (i * (AX1 - AX0 - 6)) / 6;
      b.quad(
        i === 3 ? "window_lit" : "glass_dark",
        x,
        7.0,
        FZ + 0.01,
        1.4,
        1.8,
        { ry: 0, noAO: true },
      );
      b.box("limestone", x, 7.9, FZ + 0.05, 0.4, 0.55, 0.15, { seg: false });
    }
    // ground floor: arched openings (entrance centre; lit arched windows each side)
    const arch = (x, w, h, key) => {
      b.quad(key, x, (h - w / 2) / 2 + 0.8, FZ + 0.02, w, h - w / 2 - 0.8, {
        ry: 0,
        noAO: true,
      });
      const g = PM.shapeGeo(
        (() => {
          const sh = new THREE.Shape();
          sh.moveTo(-w / 2, 0);
          sh.lineTo(w / 2, 0);
          sh.absarc(0, 0, w / 2, 0, PI, false);
          return sh;
        })(),
        12,
      );
      b.add(key, g, {
        m: PM.m4(x, h - w / 2, FZ + 0.02),
        uv: "keep",
        noAO: true,
      });
      for (let k = 0; k <= 8; k++) {
        const a = (k / 8) * PI;
        b.box(
          "limestone",
          x + Math.cos(a) * (w / 2 + 0.2),
          h - w / 2 + Math.sin(a) * (w / 2 + 0.2) - 0.2,
          FZ + 0.08,
          0.34,
          0.42,
          0.2,
          { ry: 0, rz: a - HP, seg: false },
        );
      }
      b.box("limestone", x, h - 0.05, FZ + 0.12, 0.45, 0.6, 0.24, {
        seg: false,
      });
    };
    for (const x of [AX0 + 3.0, AX0 + 7.3, AX1 - 7.3, AX1 - 3.0])
      arch(x, 2.4, 5.0, x < cx ? "window_lit" : "glass_dark");
    arch(cx, 3.4, 5.6, "glass_dark");
    // entrance doors (brass & oak) inside the centre arch
    b.boxMM("oak", cx - 1.3, 0.8, FZ - 0.1, cx + 1.3, 3.8, FZ + 0.04, {
      seg: false,
      c: 0x6a3a22,
    });
    b.boxMM("brass", cx - 0.06, 0.8, FZ + 0.04, cx + 0.06, 3.8, FZ + 0.08, {
      seg: false,
    });
    for (let k = 0; k < 3; k++) {
      b.box(
        "granite",
        cx,
        0,
        FZ + 0.5 + k * 0.35,
        3.6 - k * 0.2,
        0.8 - k * 0.27,
        0.35,
        { seg: false },
      );
      PM.col(
        cx,
        FZ + 0.5 + k * 0.35,
        3.6 - k * 0.2,
        0.35,
        0,
        0.8 - k * 0.27,
        0,
        {},
      );
    }
    // the marquee canopy: dark green with gold lettering, lights underneath, chains to the wall
    {
      const cw = 6.4,
        cd = 4.2,
        cy = 4.7;
      b.boxMM(
        "paint_teal",
        cx - cw / 2,
        cy,
        FZ,
        cx + cw / 2,
        cy + 0.3,
        FZ + cd,
        { seg: false, c: 0x2a4a38, grime: 0.5 },
      );
      const mk = PM.texMat(
        "pm2_alg_marquee",
        PM.canvasTex(
          "pm2_alg_marquee",
          1024,
          128,
          (c, w, h) => {
            c.fillStyle = "#1e3a2a";
            c.fillRect(0, 0, w, h);
            c.strokeStyle = "#c8a050";
            c.lineWidth = 6;
            c.strokeRect(6, 6, w - 12, h - 12);
            c.fillStyle = "#e0c070";
            c.textAlign = "center";
            c.textBaseline = "middle";
            c.font = 'bold 76px Georgia, "Times New Roman", serif';
            c.fillText("THE  ALGONQUIN", w / 2, h / 2 + 4);
            PM.m2grime(c, w, h, PM.rng("marq"), 0.6);
          },
          { clamp: true },
        ),
        { rough: 0.6, emissive: 0.25 },
      );
      b.boxMM(
        "paint_teal",
        cx - cw / 2,
        cy - 0.5,
        FZ + cd - 0.05,
        cx + cw / 2,
        cy + 0.3,
        FZ + cd + 0.05,
        { seg: false, c: 0x2a4a38 },
      );
      b.quad(mk, cx, cy - 0.1, FZ + cd + 0.07, cw - 0.2, 0.75, {
        ry: 0,
        grime: 0.2,
      });
      for (const sg of [-1, 1]) {
        b.boxMM(
          "paint_teal",
          cx + (sg * cw) / 2 - 0.05,
          cy - 0.5,
          FZ,
          cx + (sg * cw) / 2 + 0.05,
          cy + 0.3,
          FZ + cd,
          { seg: false, c: 0x2a4a38 },
        );
        b.beam(
          "iron",
          V3(cx + sg * (cw / 2 - 0.3), 8.2, FZ + 0.1),
          V3(cx + sg * (cw / 2 - 0.3), cy + 0.3, FZ + cd - 0.3),
          0.04,
          0.04,
          {},
        );
      }
      for (let i = 0; i < 5; i++) {
        const x = cx - 2.4 + i * 1.2;
        b.sphere("lamp_warm", x, cy - 0.06, FZ + 2.8, 0.1, {
          ws: 6,
          hs: 4,
          noAO: true,
        });
      }
      PM.glow(V3(cx, cy - 0.4, FZ + 2.6), 0xffc070, 4.0, null, {
        intensity: 1.2,
        flicker: 0.05,
      });
    }
    // the neon ALGONQUIN blade sign (both faces), projecting from the east side of the facade
    {
      const sx = AX1 - 2.2,
        y0 = 12.5,
        y1 = 27;
      const tex = PM.canvasTex(
        "pm2_alg_blade",
        128,
        1024,
        (c, w, h) => {
          c.fillStyle = "#141414";
          c.fillRect(0, 0, w, h);
          c.strokeStyle = "#ff4a2a";
          c.lineWidth = 5;
          c.strokeRect(10, 10, w - 20, h - 20);
          const t = "ALGONQUIN".split("");
          c.textAlign = "center";
          c.textBaseline = "middle";
          c.font = 'bold 86px "Futura", "Century Gothic", Arial, sans-serif';
          t.forEach((ch, i) => {
            const y = 70 + (i * (h - 140)) / (t.length - 1);
            c.shadowColor = "#ff3a1a";
            c.shadowBlur = 16;
            c.fillStyle = i === 5 ? "#5a1a10" : "#ff6a4a";
            c.fillText(ch, w / 2, y);
            c.shadowBlur = 2;
            c.fillStyle = i === 5 ? "#3a1410" : "#ffe0d0";
            c.fillText(ch, w / 2, y);
          });
        },
        { clamp: true },
      );
      const k = PM.texMat("pm2_alg_blade", tex, {
        rough: 0.5,
        emissive: 1.6,
        noShadow: true,
      });
      b.boxMM("black_steel", sx - 0.12, y0, FZ, sx + 0.12, y1, FZ + 2.3, {
        seg: false,
      });
      b.quad(k, sx + 0.13, (y0 + y1) / 2, FZ + 1.2, 2.1, y1 - y0 - 0.3, {
        ry: HP,
        noAO: true,
        grime: 0,
      });
      b.quad(k, sx - 0.13, (y0 + y1) / 2, FZ + 1.2, 2.1, y1 - y0 - 0.3, {
        ry: -HP,
        noAO: true,
        grime: 0,
      });
      for (const y of [y0 + 0.5, y1 - 0.5])
        b.beam("iron", V3(sx, y, FZ), V3(sx, y, FZ + 2.2), 0.08, 0.08, {});
      for (let i = 0; i < 4; i++)
        PM.glow(V3(sx, y0 + 2 + i * 3.6, FZ + 1.2), 0xff4020, 3.2, null, {
          intensity: 1.3,
          flicker: i === 2 ? 0.6 : 0.08,
          dayFactor: 0.25,
        });
    }
    // flagpoles over the entrance
    const flagK = PM.texMat("pm2_alg_flag", PM.flagTex(1), {
      rough: 0.9,
      side: THREE.DoubleSide,
    });
    for (const sg of [-1, 1]) {
      const fx = cx + sg * 5.2;
      b.beam(
        "iron",
        V3(fx, 9.2, FZ + 0.1),
        V3(fx, 10.8, FZ + 2.6),
        0.05,
        0.05,
        {},
      );
      if (sg < 0)
        b.quad(flagK, fx - 0.6, 9.8, FZ + 2.1, 1.3, 0.8, {
          ry: HP * 0.1,
          rz: 0.2,
          grime: 0.3,
        });
    }
    // roof: water tower on steel legs, a radio mast, a rooftop garden of spuds
    {
      const wx = AX0 + 6,
        wz = FZ - 12,
        wy = AH + 1.9;
      for (const [dx, dz] of [
        [-1.3, -1.3],
        [1.3, -1.3],
        [-1.3, 1.3],
        [1.3, 1.3],
      ])
        b.box("rust", wx + dx, wy, wz + dz, 0.2, 3.2, 0.2, { seg: false });
      b.boxMM(
        "rust",
        wx - 1.6,
        wy + 3.2,
        wz - 1.6,
        wx + 1.6,
        wy + 3.4,
        wz + 1.6,
        { seg: false },
      );
      b.cyl("rotten", wx, wy + 3.4, wz, 1.7, 1.8, 3.6, 16, { hSeg: 2 });
      for (const y of [0.8, 1.9, 3.0])
        b.cyl("iron", wx, wy + 3.4 + y, wz, 1.82, 1.82, 0.08, 16, { hSeg: 1 });
      b.lathe(
        "rotten",
        [
          [1.85, 0],
          [1.2, 0.8],
          [0.01, 1.3],
        ],
        12,
        wx,
        wy + 7.0,
        wz,
        {},
      );
      b.beam(
        "iron",
        V3(AX1 - 4, wy, FZ - 6),
        V3(AX1 - 4, wy + 9, FZ - 6),
        0.08,
        0.08,
        {},
      );
      for (let k = 0; k < 4; k++)
        b.beam(
          "iron",
          V3(AX1 - 4, wy + 9, FZ - 6),
          V3(AX1 - 4 + Math.cos(k * HP) * 3, wy, FZ - 6 + Math.sin(k * HP) * 3),
          0.02,
          0.02,
          {},
        );
      b.sphere("lamp_red", AX1 - 4, wy + 9.1, FZ - 6, 0.15, { noAO: true });
      PM.glow(V3(AX1 - 4, wy + 9.2, FZ - 6), 0xff3020, 1.2, null, {
        intensity: 1.4,
        flicker: 0.4,
      });
      b.boxMM("dirt", AX0 + 11, wy, FZ - 20, AX1 - 2, wy + 0.4, FZ - 8, {
        seg: false,
        grime: 0.8,
      });
    }

    // ---------------- neighbours ----------------
    // Hotel Iroquois (west)
    {
      const x0 = site.x0 + 1,
        x1 = AX0 - 0.2,
        H = 30;
      const p = [
        [x0, back],
        [x1, back],
        [x1, FZ],
        [x0, FZ],
      ];
      K.prismBands(b, "brick_brown", p, 0, H, 4.5, { grime: 0.55 });
      b.boxMM("limestone", x0, 0, FZ - 0.1, x1, 5.2, FZ + 0.1, { grime: 0.5 });
      b.boxMM("limestone", x0 - 0.2, H - 0.8, FZ - 0.2, x1 + 0.2, H, FZ + 0.6, {
        seg: false,
      });
      PM.colMM(x0, 0, back, x1, H, FZ + 0.1, { walkable: false });
      K.polyWindows(b, p, {
        y0: 6.2,
        floors: 7,
        floorH: 3.3,
        w: 1.1,
        h: 1.9,
        spacing: 2.4,
        frameKey: "limestone",
        sill: true,
        lintel: true,
        broken: 0.3,
        boarded: 0.15,
        lit: 0.06,
        seed: 31,
        skipEdge: (i) => i !== 2,
        margin: 1.2,
      });
      const ik = PM.texMat(
        "pm2_iroq",
        PM.signTex("iroq", ["HOTEL IROQUOIS"], "enamel", 512, 96, {
          bg: "#2a2a2a",
          fg: "#d8d0b8",
        }),
      );
      b.quad(ik, (x0 + x1) / 2, 4.3, FZ + 0.13, 8, 0.8, { ry: 0 });
      b.boxMM("planks", x0 + 2, 0.4, FZ + 0.1, x1 - 2, 3.4, FZ + 0.16, {
        seg: false,
        grime: 0.8,
      });
    }
    // the book shop block (east)
    {
      const x0 = AX1 + 0.2,
        x1 = site.x1 - 1,
        H = 17;
      const p = [
        [x0, back],
        [x1, back],
        [x1, FZ],
        [x0, FZ],
      ];
      K.prismBands(b, "brick_tan", p, 0, H, 4.2, { grime: 0.55 });
      PM.colMM(x0, 0, back, x1, H, FZ + 0.1, { walkable: false });
      b.boxMM(
        "paint_teal",
        x0 - 0.1,
        H - 0.8,
        FZ - 0.1,
        x1 + 0.1,
        H,
        FZ + 0.5,
        { seg: false, c: 0x5a6a5a },
      );
      K.polyWindows(b, p, {
        y0: 5.4,
        floors: 3,
        floorH: 3.3,
        w: 1.1,
        h: 1.8,
        spacing: 2.4,
        frameKey: "limestone",
        sill: true,
        lintel: true,
        broken: 0.35,
        boarded: 0.2,
        seed: 33,
        skipEdge: (i) => i !== 2,
        margin: 1.0,
      });
      b.boxMM("iron", x0 + 0.3, 0, FZ - 0.05, x1 - 0.3, 4.2, FZ + 0.2, {
        seg: false,
        grime: 0.5,
      });
      b.boxMM("glass_broken", x0 + 1, 0.6, FZ + 0.18, x1 - 1, 3.4, FZ + 0.21, {
        seg: false,
        noAO: true,
      });
      const bk = PM.texMat(
        "pm2_books_sign",
        PM.signTex(
          "bookshop",
          ["GOTHAM BOOKS · RARE & USED"],
          "enamel",
          512,
          96,
          { bg: "#3a1e14", fg: "#e8d8a8" },
        ),
      );
      b.quad(bk, (x0 + x1) / 2, 4.6, FZ + 0.22, 9, 0.8, { ry: 0 });
      for (let i = 0; i < 3; i++)
        D.papers(b, x0 + 3 + i * 4, 0.06, FZ + 1.5, 1.2, 8, 90 + i);
    }

    // ---------------- the settlement's front: sandbag gate, guard post, lights ----------------
    PM.sandbags(b, AX0 + 1, FZ + 5.5, cx - 2.2, FZ + 5.5, 3, {});
    PM.sandbags(b, cx + 2.2, FZ + 5.5, AX1 - 1, FZ + 5.5, 3, {});
    PM.fireBarrel(b, cx - 3.2, 0, FZ + 4.4, null);
    PM.lampPost(b, cx - 4, 0, FZ + 6.3, true);
    PM.lampPost(b, cx + 4, 0, FZ + 6.3, true);
    D.stringLights(
      b,
      V3(cx - 4, 3.9, FZ + 6.3),
      V3(cx - 3, 4.8, FZ + 3.5),
      0.3,
      8,
    );
    D.stringLights(
      b,
      V3(cx + 4, 3.9, FZ + 6.3),
      V3(cx + 3, 4.8, FZ + 3.5),
      0.3,
      8,
    );
    {
      const ck = PM.texMat(
        "pm2_alg_chalk",
        PM.signTex(
          "alg_chalk",
          [
            "THE ROUND TABLE",
            "Writers, drinkers",
            "& the well-read welcome.",
            "Raiders will be reviewed.",
          ],
          "engraved",
          320,
          256,
          { bg: "#1c201c", fg: "#e8e8e0" },
        ),
      );
      b.box("oak", cx + 2.6, 0, FZ + 4.4, 0.8, 1.2, 0.06, {
        rx: -0.2,
        seg: false,
      });
      b.quad(ck, cx + 2.6, 0.68, FZ + 4.33, 0.72, 0.58, { ry: PI, rx: 0.2 });
      b.quad(ck, cx + 2.6, 0.68, FZ + 4.47, 0.72, 0.58, { ry: 0, rx: -0.2 });
    }
    PM.car(b, AX0 - 6, 0, FZ + 7.8, HP + 0.2, { seed: 55 });
    D.crates(b, AX1 + 2, 0, FZ + 1.4, 2, 56);
    PM.barrel(b, AX1 + 3.2, 0, FZ + 1.1, {});
    b.build(root);
    A.door = PM.anchor(cx, 0, FZ + 2.4, PI);
    A.guard = PM.anchor(cx - 1.4, 0, FZ + 6.6, PI);
    A.guard2 = PM.anchor(cx + 5.5, 0, FZ + 4.2, PI);
    PM.readable(
      V3(cx + 2.4, 1.6, FZ + 0.15),
      "The Algonquin Hotel",
      'Opened 1902. From 1919 the "Round Table" of critics, wits and writers lunched here daily and insulted one another brilliantly. The hotel cat has been named Hamlet or Matilda ever since. The cat, like the wits, outlived the building\'s better days.',
    );
    return A;
  }

  // ===================================================================
  // INTERIOR
  // ===================================================================
  function buildInterior(cell) {
    const O = cell.origin,
      oy = O.y;
    const b = PM.batch("alg_int");
    const F = PM.frame(O.x, oy, O.z, b);
    const { X, Z, P, A: AN, W } = F;
    const root = cell.root;
    const r = PM.rng("alg_int");
    const A = {};
    b.ground = oy;
    b.aoH = 2.6;
    b.grime = 0.3;

    // ---------------- lights: warm lamps everywhere, blue in the bar ----------------
    const L = [];
    const lamp = (x, y, z, col, rad, i) =>
      L.push({ x: X(x), y: oy + y, z: Z(z), color: col, r: rad, i });
    for (const [x, z] of [
      [-10, 6],
      [-3, 7],
      [-9, -1],
      [0, 2],
      [5, -1],
    ])
      lamp(x, 3.2, z, 0xffb868, 8, 0.75);
    lamp(0, 2.5, 11.5, 0xffd090, 5, 0.5);
    lamp(14, 3.6, 3, 0x5a80ff, 10, 1.0);
    lamp(18.5, 2.2, 3, 0x6a90ff, 6, 0.9);
    lamp(11, 2.2, -2, 0xffb060, 5, 0.5); // Blue Bar
    lamp(-5, 3.8, -11, 0xffc078, 11, 0.9);
    lamp(-11, 2.4, -16, 0xffb060, 6, 0.5);
    lamp(1, 2.4, -16, 0xffb060, 6, 0.5); // Round Table
    lamp(12, 3.8, -11, 0xffa860, 10, 0.7);
    lamp(18, 3.2, -11, 0xff8a70, 7, 0.8); // Oak Room (stage)
    for (let x = -4; x <= 18; x += 5.5) lamp(x, F2 + 2.8, 0, 0xffc880, 6, 0.55); // corridor
    lamp(-10, F2 + 2.8, 3, 0xffc070, 9, 0.7); // library landing
    for (const x of [-3.9, 0.3, 4.5, 8.7]) {
      lamp(x, F2 + 2.4, -4.6, 0xffc880, 5, 0.5);
      lamp(x, F2 + 2.4, 5.6, 0xffc880, 5, 0.45);
    }
    b.setLights(L, 0x9a8a78, 0.14);

    // ================= SHELL =================
    F.slab("rose_carpet", -14, -18, 20, 13, 0, [], {
      th: 0.3,
      surface: "carpet",
    });
    F.slab("rose_carpet", -14, -18, 20, 13, F2, [[-14, -0.7, -11.1, 8.2]], {
      under: "cream_plaster",
      surface: "carpet",
    });
    F.box("cream_plaster", -14, CEIL2, -8, 20, CEIL2 + 0.3, 10, { grime: 0.3 });
    // outer walls (ground floor: oak panelling to 3.2 m, cream plaster above)
    const panelWall = (ax, a0, a1, f0, f1, gaps, y0, y1) => {
      W(
        "cream_plaster",
        ax,
        a0,
        a1,
        f0,
        f1,
        y0 + 3.2,
        y1,
        gaps
          .filter((g) => g.y0 + g.h > y0 + 3.2)
          .map((g) => ({
            c: g.c,
            w: g.w,
            y0: Math.max(g.y0, y0 + 3.2),
            h: g.y0 + g.h - Math.max(g.y0, y0 + 3.2),
          })),
      );
      W(
        "oak_panel",
        ax,
        a0,
        a1,
        f0,
        f1,
        y0,
        y0 + 3.2,
        gaps.filter((g) => g.y0 < y0 + 3.2),
      );
    };
    panelWall(
      "x",
      -14,
      20,
      12.8,
      13.2,
      [{ c: 0, w: 3.4, y0: 0, h: 3.3 }],
      0,
      F2 - 0.4,
    );
    panelWall("z", -18, 13, -14.4, -14, [], 0, F2 - 0.4);
    panelWall("z", -18, 13, 20, 20.4, [], 0, F2 - 0.4);
    panelWall("x", -14.4, 20.4, -18.4, -18, [], 0, F2 - 0.4);
    // ground-floor partitions: z = -4 (lobby | Round Table & Oak Room), x = 8 (lobby | Blue Bar), x = 4 (Round Table | Oak Room)
    panelWall(
      "x",
      -14,
      20,
      -4.2,
      -3.8,
      [
        { c: -5, w: 2.6, y0: 0, h: 3.0 },
        { c: 14, w: 2.2, y0: 0, h: 2.8 },
      ],
      0,
      F2 - 0.4,
    );
    panelWall(
      "z",
      -4,
      13,
      7.8,
      8.2,
      [{ c: 5, w: 2.4, y0: 0, h: 3.0 }],
      0,
      F2 - 0.4,
    );
    panelWall(
      "z",
      -18,
      -4,
      3.8,
      4.2,
      [{ c: -10, w: 2, y0: 0, h: 2.8 }],
      0,
      F2 - 0.4,
    );
    // coffered lobby ceiling beams
    for (let x = -13; x <= 7; x += 2.5)
      F.box("oak", x - 0.15, F2 - 0.75, -4, x + 0.15, F2 - 0.4, 13, {
        seg: false,
      });
    for (let z = -3; z <= 12; z += 2.5)
      F.box("oak", -14, F2 - 0.7, z - 0.12, 8, F2 - 0.4, z + 0.12, {
        seg: false,
      });

    // ================= LOBBY =================
    // vestibule & exit
    F.box("oak", -1.7, 0, 12.2, 1.7, 3.3, 12.35, { seg: false, c: 0x6a3a22 });
    F.box("brass", -0.06, 0, 12.1, 0.06, 3.3, 12.2, { seg: false });
    A.entrance = AN(0, 0, 10.5, 0);
    A.exit_door = P(0, 1.4, 12.1);
    // the front desk (east side): panelled counter, marble top, brass bell, guest ledger, key pigeonholes behind
    F.solid("walnut_panel", 1.6, 0, 1.2, 7.6, 1.1, 2.0);
    F.box("marble_green", 1.5, 1.1, 1.1, 7.7, 1.16, 2.1, { seg: false });
    b.cyl("brass", X(3.2), oy + 1.16, Z(1.6), 0.07, 0.09, 0.07, 10, {
      hSeg: 1,
    });
    b.box("leather_red", X(4.6), oy + 1.16, Z(1.55), 0.55, 0.06, 0.4, {
      ry: 0.2,
      seg: false,
    });
    F.box("walnut", 2, 0, -3.75, 7.6, 2.8, -3.35, { seg: false });
    for (let i = 0; i < 12; i++)
      for (let j = 0; j < 5; j++) {
        const x = 2.2 + i * 0.44,
          y = 0.9 + j * 0.36;
        F.box("iron", x, y, -3.36, x + 0.38, y + 0.3, -3.34, {
          seg: false,
          c: 0x2a1a10,
        });
        if (r() < 0.25)
          b.box(
            "brass",
            X(x + 0.19),
            oy + y + 0.05,
            Z(-3.33),
            0.04,
            0.12,
            0.02,
            { seg: false },
          );
      }
    F.box("oak", 2, 2.8, -3.8, 7.6, 3.0, -3.25, { seg: false });
    b.quad(
      PM.labelKey(
        "alg_desk",
        ["FRONT DESK", "Rooms · Messages · Cat"],
        "brass",
        512,
        160,
      ),
      X(4.6),
      oy + 3.35,
      Z(-3.72),
      1.6,
      0.5,
      { ry: 0 },
    );
    A.manager = AN(4.6, 0, -1.5, PI);
    A.desk_ledger = AN(4.6, 1.2, 1.5, 0);
    // Matilda's cushion at the end of the desk
    b.cyl("velvet", X(7.0), oy + 1.16, Z(1.6), 0.28, 0.3, 0.1, 12, { hSeg: 1 });
    A.cat_bed = AN(7.0, 1.26, 1.6, 0.4);
    // armchair clusters around low tables with lamps
    const cluster = (x, z, n, seed) => {
      F.solid("walnut", x - 0.45, 0, z - 0.45, x + 0.45, 0.55, z + 0.45);
      PM.tableLamp(b, X(x), oy + 0.55, Z(z), root);
      for (let k = 0; k < n; k++) {
        const a = (k / n) * TAU + seed;
        PM.armchair(
          b,
          X(x + Math.cos(a) * 1.35),
          oy,
          Z(z + Math.sin(a) * 1.35),
          -a - HP,
          k % 2 ? "leather_red" : "leather_brown",
        );
        PM.col(
          X(x + Math.cos(a) * 1.35),
          Z(z + Math.sin(a) * 1.35),
          0.8,
          0.8,
          oy,
          oy + 0.9,
          0,
          { walkable: false },
        );
      }
    };
    cluster(-8.5, 6.5, 3, 0.4);
    cluster(-3.5, 7.5, 3, 1.2);
    cluster(-8.5, 0.5, 4, 0.1);
    cluster(-2.5, 1.2, 2, 2.4);
    // grandfather clock, bookcase, sofa, the cat portrait, potted (dead) palms
    {
      const gx = 7.45,
        gz = 9.2;
      F.solid("walnut", gx - 0.3, 0, gz - 0.35, gx + 0.3, 2.3, gz + 0.35);
      b.lathe(
        "walnut",
        [
          [0.35, 0],
          [0.4, 0.1],
          [0.01, 0.4],
        ],
        4,
        X(gx),
        oy + 2.3,
        Z(gz),
        {},
      );
      b.cyl(
        "paint_cream",
        X(gx - 0.31),
        oy + 1.85,
        Z(gz),
        0.22,
        0.22,
        0.02,
        16,
        { hSeg: 1, rz: HP },
      );
      b.box("brass", X(gx - 0.33), oy + 0.9, Z(gz), 0.02, 0.6, 0.08, {
        seg: false,
      });
    }
    PM.bookcase(b, X(-13.95), Z(8.5), X(-13.95), Z(11.8), oy, oy + 2.8, HP, {
      frame: "walnut",
    });
    {
      const catTex = PM.canvasTex(
        "pm2_catportrait",
        256,
        320,
        (c, w, h) => {
          const g = c.createLinearGradient(0, 0, 0, h);
          g.addColorStop(0, "#3a2a1e");
          g.addColorStop(1, "#1a120c");
          c.fillStyle = g;
          c.fillRect(0, 0, w, h);
          c.fillStyle = "#b8742e";
          c.beginPath();
          c.ellipse(w / 2, h * 0.7, 80, 70, 0, 0, TAU);
          c.fill();
          c.beginPath();
          c.arc(w / 2, h * 0.38, 58, 0, TAU);
          c.fill();
          for (const sx of [-1, 1]) {
            c.beginPath();
            c.moveTo(w / 2 + sx * 50, h * 0.3);
            c.lineTo(w / 2 + sx * 40, h * 0.12);
            c.lineTo(w / 2 + sx * 18, h * 0.24);
            c.fill();
          }
          c.strokeStyle = "#6a3a14";
          c.lineWidth = 5;
          for (let k = 0; k < 5; k++) {
            c.beginPath();
            c.moveTo(w / 2 - 40 + k * 20, h * 0.26);
            c.lineTo(w / 2 - 36 + k * 18, h * 0.34);
            c.stroke();
          }
          c.fillStyle = "#9ad040";
          for (const sx of [-1, 1]) {
            c.beginPath();
            c.ellipse(w / 2 + sx * 22, h * 0.37, 10, 7, 0, 0, TAU);
            c.fill();
          }
          c.fillStyle = "#111";
          for (const sx of [-1, 1])
            c.fillRect(w / 2 + sx * 22 - 1.5, h * 0.35, 3, 12);
          c.fillStyle = "#d88a8a";
          c.beginPath();
          c.moveTo(w / 2 - 6, h * 0.45);
          c.lineTo(w / 2 + 6, h * 0.45);
          c.lineTo(w / 2, h * 0.47);
          c.fill();
          c.strokeStyle = "#f0e0c0";
          c.lineWidth = 1.5;
          for (const sx of [-1, 1])
            for (let k = 0; k < 3; k++) {
              c.beginPath();
              c.moveTo(w / 2 + sx * 10, h * 0.47);
              c.lineTo(w / 2 + sx * 70, h * 0.44 + k * 8);
              c.stroke();
            }
          c.fillStyle = "#c8a050";
          c.font = "italic bold 20px Georgia";
          c.textAlign = "center";
          c.fillText("Matilda IX", w / 2, h - 18);
          PM.m2grime(c, w, h, PM.rng("catp"), 0.6);
        },
        { clamp: true },
      );
      const ck = PM.texMat("pm2_catportrait", catTex, { rough: 0.7, vc: true });
      F.box("gilt", -2.3, 1.4, -3.8, -0.7, 3.2, -3.72, { seg: false });
      b.quad(ck, X(-1.5), oy + 2.3, Z(-3.7), 1.3, 1.62, { ry: 0 });
    }
    for (const [x, z] of [
      [-12.8, 11.9],
      [7.2, 11.9],
      [-12.8, -3.2],
    ]) {
      b.cyl("brass", X(x), oy, Z(z), 0.3, 0.25, 0.6, 10, { hSeg: 1 });
      PM.deadTree(b, X(x), oy + 0.55, Z(z), 1.6, x * 3 + z);
    }
    D.papers(b, X(-5), oy + 0.01, Z(4), 2.5, 10, 101);
    b.quad(
      PM.labelKey(
        "alg_notice",
        [
          "NOTICE TO GUESTS",
          "Rooms 10 scrip / night",
          "Doc Benchley — Room 201",
          "Scriptorium — Room 202",
          "Please do not feed the cat",
          "She is lying to you",
        ],
        "label",
        512,
        400,
      ),
      X(7.75),
      oy + 1.9,
      Z(10.5),
      1.1,
      0.86,
      { ry: -HP },
    );
    A.lobby = AN(-5, 0, 4, 0);
    A.merchant = AN(-9.4, 0, -3.0, PI);
    // Rex's book & sundries stall in the lobby corner
    F.solid("walnut", -10.8, 0, -2.4, -8.0, 1.0, -1.8);
    D.shelf(b, X(-9.4), oy, Z(-3.55), 0, 3.0, 4, 111);
    for (let i = 0; i < 8; i++)
      b.box(
        r() < 0.5 ? "leather_red" : "leather_brown",
        X(-10.6 + i * 0.32),
        oy + 1.0,
        Z(-2.1),
        0.25,
        0.06 + r() * 0.05,
        0.34,
        { ry: r() * 0.3, seg: false },
      );
    b.quad(
      PM.labelKey(
        "alg_rex",
        ["HARROW'S BOOKS & SUNDRIES", "Buying: books, bullets, gossip"],
        "brass",
        512,
        160,
      ),
      X(-9.4),
      oy + 3.2,
      Z(-3.76),
      1.8,
      0.56,
      { ry: 0 },
    );
    // stair up (west side of the lobby) with oak balustrade
    PM.stairs(b, "oak", X(-12.6), Z(8.0), PI, 2.2, 8.4, oy, oy + F2, {
      base: oy - 0.1,
    });
    F.rail(
      [
        [-11.35, 8.0, 0],
        [-11.35, -0.4, F2],
      ],
      0,
      1.0,
      "walnut",
    );
    F.rail(
      [
        [-11.1, -0.7],
        [-11.1, 8.2],
      ],
      F2,
      1.0,
      "walnut",
    );
    F.rail(
      [
        [-14, 8.2],
        [-11.1, 8.2],
      ],
      F2,
      1.0,
      "walnut",
    );

    // ================= BLUE BAR (x 8..20, z -4..10) =================
    F.box("carpet", 8.2, 0.01, -3.8, 19.8, 0.03, 12.8, {
      seg: false,
      c: 0x3a4a6a,
    });
    F.solid("walnut_panel", 16.8, 0, -2, 17.6, 1.1, 8.5);
    F.box("marble_white", 16.7, 1.1, -2.1, 17.7, 1.16, 8.6, {
      seg: false,
      c: 0xb8c0d0,
    });
    D.shelf(b, X(19.75), oy, Z(3), -HP, 8, 4, 121);
    F.box("blue_neon", 19.8, 2.5, -2, 19.9, 2.56, 8, {
      seg: false,
      noAO: true,
    });
    F.box("blue_neon", 8.3, F2 - 0.55, -3.7, 19.7, F2 - 0.5, -3.64, {
      seg: false,
      noAO: true,
    });
    F.box("blue_neon", 8.3, F2 - 0.55, 12.64, 19.7, F2 - 0.5, 12.7, {
      seg: false,
      noAO: true,
    });
    for (const z of [-1, 3, 7])
      PM.glow(P(19.3, 2.6, z), 0x4070ff, 2.2, root, {
        intensity: 1.2,
        flicker: 0.03,
      });
    for (let i = 0; i < 7; i++) {
      const z = -1.3 + i * 1.4;
      b.cyl("chrome", X(16.2), oy, Z(z), 0.05, 0.2, 0.75, 8, { hSeg: 1 });
      b.cyl("leather_red", X(16.2), oy + 0.75, Z(z), 0.22, 0.22, 0.08, 10, {
        hSeg: 1,
      });
    }
    for (let i = 0; i < 10; i++)
      b.cyl(
        r() < 0.4 ? "glass_dark" : "chrome",
        X(17.2 + (r() - 0.5) * 0.4),
        oy + 1.16,
        Z(-1.5 + r() * 9.5),
        0.035,
        0.03,
        0.12 + r() * 0.12,
        6,
        { hSeg: 1 },
      );
    // caricature sketches along the walls
    const cr = PM.texMat("pm2_caric", PM.caricatureTex(), {
      rough: 0.7,
      vc: true,
    });
    for (let i = 0; i < 6; i++) {
      const z = -2.5 + i * 2.4;
      F.box("black_steel", 8.2, 1.35, z - 0.55, 8.25, 2.45, z + 0.55, {
        seg: false,
      });
      b.quad(cr, X(8.27), oy + 1.9, Z(z), 1.0, 1.0, {
        ry: HP,
        uvRect: [
          (i % 2) * 0.5,
          Math.floor((i % 4) / 2) * 0.5,
          (i % 2) * 0.5 + 0.5,
          Math.floor((i % 4) / 2) * 0.5 + 0.5,
        ],
      });
    }
    for (const [x, z] of [
      [11, -1.5],
      [11, 5.5],
      [13.5, 9.5],
    ]) {
      b.cyl("walnut", X(x), oy, Z(z), 0.06, 0.2, 0.72, 8, { hSeg: 1 });
      b.cyl("walnut", X(x), oy + 0.72, Z(z), 0.5, 0.5, 0.05, 14, { hSeg: 1 });
      PM.col(X(x), Z(z), 1.0, 1.0, oy, oy + 0.77, 0, { walkable: false });
      for (const a of [0.3, 2.4, 4.2])
        PM.armchair(
          b,
          X(x + Math.cos(a) * 1.05),
          oy,
          Z(z + Math.sin(a) * 1.05),
          -a - HP,
          "leather_brown",
        );
      b.cyl("glass_dark", X(x + 0.1), oy + 0.77, Z(z), 0.04, 0.035, 0.14, 6, {
        hSeg: 1,
      });
    }
    b.quad(
      PM.labelKey("alg_bluebar", ["THE BLUE BAR"], "brass", 512, 128),
      X(12),
      oy + 3.9,
      Z(12.75),
      2.2,
      0.55,
      { ry: PI },
    );
    A.bartender = AN(18.6, 0, 3, HP);
    A.bar_patron = AN(15.4, 0, 5.8, HP);

    // ================= ROUND TABLE ROOM (x -14..4, z -18..-4) =================
    W("rose_plaster", "x", -13.95, 3.75, -17.95, -17.9, 3.2, F2 - 0.4, []);
    {
      const tx = -5,
        tz = -11;
      b.cyl("walnut", X(tx), oy, Z(tz), 0.35, 0.6, 0.72, 12, { hSeg: 1 });
      b.cyl("walnut", X(tx), oy + 0.72, Z(tz), 2.2, 2.2, 0.08, 32, { hSeg: 1 });
      b.cyl("linen", X(tx), oy + 0.8, Z(tz), 2.25, 2.25, 0.02, 32, { hSeg: 1 });
      PM.col(X(tx), Z(tz), 3.4, 3.4, oy, oy + 0.82, 0, { walkable: false });
      for (let k = 0; k < 10; k++) {
        const a = (k / 10) * TAU;
        D.chair(
          b,
          X(tx + Math.cos(a) * 2.75),
          oy,
          Z(tz + Math.sin(a) * 2.75),
          -a + HP,
          false,
          "walnut",
        );
        b.cyl(
          "paint_cream",
          X(tx + Math.cos(a) * 1.7),
          oy + 0.82,
          Z(tz + Math.sin(a) * 1.7),
          0.14,
          0.14,
          0.015,
          12,
          { hSeg: 1 },
        );
        if (k % 2)
          b.cyl(
            "glass_dark",
            X(tx + Math.cos(a) * 1.4),
            oy + 0.82,
            Z(tz + Math.sin(a) * 1.4),
            0.035,
            0.04,
            0.14,
            6,
            { hSeg: 1 },
          );
      }
      PM.candles(b, X(tx), oy + 0.82, Z(tz), 4, 131, root);
      D.papers(b, X(tx + 0.5), oy + 0.83, Z(tz + 0.3), 1.2, 9, 132);
      b.box(
        "black_steel",
        X(tx - 0.8),
        oy + 0.82,
        Z(tz - 0.5),
        0.45,
        0.16,
        0.35,
        { ry: 0.4, seg: false },
      ); // typewriter
      // chandelier
      b.beam("brass", P(tx, F2 - 0.4, tz), P(tx, 3.4, tz), 0.02, 0.02, {});
      b.add("brass", new THREE.TorusGeometry(0.8, 0.04, 5, 16), {
        m: PM.m4(X(tx), oy + 3.3, Z(tz), 0, HP),
      });
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * TAU;
        b.sphere(
          "lamp_warm",
          X(tx + Math.cos(a) * 0.8),
          oy + 3.42,
          Z(tz + Math.sin(a) * 0.8),
          0.07,
          { ws: 6, hs: 4, noAO: true },
        );
      }
      PM.glow(P(tx, 3.4, tz), 0xffc070, 2.8, root, {
        intensity: 1.2,
        flicker: 0.05,
      });
      A.table = AN(tx, 0, tz, 0);
      // seats for the writers (actor anchors face the table)
      const seat = (k) => {
        const a = (k / 10) * TAU;
        return AN(
          tx + Math.cos(a) * 2.75,
          0,
          tz + Math.sin(a) * 2.75,
          Math.atan2(Math.cos(a), Math.sin(a)),
        );
      };
      A.seat_crane = seat(2);
      A.seat_park = seat(5);
      A.seat_hazel = seat(8);
    }
    // the group portrait over the sideboard
    {
      const gk = PM.texMat("pm2_vicious", PM.groupPortraitTex(), {
        rough: 0.7,
        vc: true,
      });
      F.box("gilt", -9.2, 1.6, -17.95, -0.8, 5.0, -17.85, { seg: false });
      b.quad(gk, X(-5), oy + 3.3, Z(-17.83), 8.0, 3.2, { ry: 0 });
      F.solid("walnut", -8.5, 0, -17.9, -1.5, 0.95, -17.2);
      for (let i = 0; i < 5; i++)
        b.cyl(
          i % 2 ? "chrome" : "glass_dark",
          X(-7.5 + i * 1.3),
          oy + 0.95,
          Z(-17.5),
          0.08,
          0.1,
          0.3,
          8,
          { hSeg: 1 },
        );
    }
    for (let i = 0; i < 3; i++)
      PM.bookcase(
        b,
        X(-13.95),
        Z(-17 + i * 3.4),
        X(-13.95),
        Z(-14 + i * 3.4),
        oy,
        oy + 3.0,
        HP,
        { frame: "walnut" },
      );
    b.quad(
      PM.labelKey(
        "alg_rt",
        [
          "THE ROUND TABLE",
          "Est. 1919 · Re-est. 1971",
          "Wits only. Half-wits by appointment.",
        ],
        "brass",
        512,
        200,
      ),
      X(3.7),
      oy + 2.2,
      Z(-8),
      1.2,
      0.47,
      { ry: -HP },
    );

    // ================= OAK ROOM (x 4..20, z -18..-4): supper club =================
    {
      F.box("oak", 15.8, 0, -17.6, 19.9, 0.5, -4.4);
      F.col(15.8, 0, -17.6, 19.9, 0.5, -4.4, { surface: "wood" });
      F.box("oak", 15.4, 0, -12, 15.8, 0.25, -9, { seg: false });
      F.col(15.4, 0, -12, 15.8, 0.25, -9, { surface: "wood" });
      // red velvet curtains (pleated)
      for (let i = 0; i < 18; i++)
        F.box(
          "velvet",
          19.6,
          0.5,
          -17.5 + i * 0.73,
          19.85,
          F2 - 0.5,
          -17.5 + i * 0.73 + 0.62,
          { seg: false, c: i % 2 ? 0xffffff : 0xc0a0a0 },
        );
      for (const sg of [-1, 1])
        F.box(
          "velvet",
          16.2,
          0.5,
          sg < 0 ? -17.6 : -5.2,
          16.5,
          F2 - 0.5,
          sg < 0 ? -16.4 : -4.4,
          { seg: false },
        );
      F.box("gilt", 16, F2 - 0.9, -17.8, 16.4, F2 - 0.4, -4.2, { seg: false });
      // the piano
      F.solid("iron", 17, 0.5, -15.5, 18.6, 1.5, -13.4);
      b.box("paint_cream", X(16.95), oy + 1.35, Z(-14.45), 0.25, 0.06, 1.8, {
        seg: false,
      });
      b.box("iron", X(17.8), oy + 1.5, Z(-14.4), 1.5, 0.05, 1.9, {
        rz: 0.5,
        seg: false,
      });
      A.pianist = AN(16.4, 0.5, -14.4, -HP);
      // a mic stand and a spotlight
      b.cyl("chrome", X(17.2), oy + 0.5, Z(-10.2), 0.02, 0.02, 1.6, 5, {
        hSeg: 1,
      });
      b.sphere("iron", X(17.2), oy + 2.12, Z(-10.2), 0.06, {});
      A.singer = AN(17.6, 0.5, -10.2, HP);
      // cabaret tables with little lamps
      for (const [x, z] of [
        [7, -7],
        [10.5, -7],
        [7, -11],
        [10.5, -11.5],
        [7.5, -15.5],
        [11.5, -15.5],
        [13.5, -7],
      ]) {
        b.cyl("walnut", X(x), oy, Z(z), 0.05, 0.18, 0.72, 8, { hSeg: 1 });
        b.cyl("linen", X(x), oy + 0.72, Z(z), 0.45, 0.45, 0.04, 12, {
          hSeg: 1,
        });
        PM.col(X(x), Z(z), 0.9, 0.9, oy, oy + 0.76, 0, { walkable: false });
        b.cyl("lamp_shade", X(x), oy + 0.76, Z(z), 0.06, 0.1, 0.18, 8, {
          hSeg: 1,
          noAO: true,
        });
        for (const a of [0.5, 3.6])
          D.chair(
            b,
            X(x + Math.cos(a) * 0.8),
            oy,
            Z(z + Math.sin(a) * 0.8),
            -a - HP,
            false,
            "walnut",
          );
      }
      PM.glow(P(10, 1.0, -11), 0xffb060, 3.0, root, {
        intensity: 0.8,
        flicker: 0.1,
      });
      PM.glow(P(17.8, 3.5, -10.5), 0xff9a80, 2.0, root, {
        intensity: 1.0,
        flicker: 0.05,
      });
      b.quad(
        PM.labelKey(
          "alg_oak",
          [
            "THE OAK ROOM",
            "Tonight: Irving at the piano",
            "Songs your grandparents",
            "would have been ashamed of",
          ],
          "brass",
          512,
          256,
        ),
        X(4.25),
        oy + 2.3,
        Z(-8),
        1.2,
        0.6,
        { ry: HP },
      );
      A.oakroom = AN(10, 0, -9, 0);
    }

    // ================= SECOND FLOOR: guest rooms =================
    // enclosure walls
    W("cream_plaster", "x", -14, 20, 9.8, 10.2, F2, CEIL2, []);
    W("cream_plaster", "x", -14, 20, -8.2, -7.8, F2, CEIL2, []);
    W("cream_plaster", "z", -8, 10, -14.4, -14, F2, CEIL2, []);
    W("cream_plaster", "z", -8, 10, 20, 20.4, F2, CEIL2, []);
    // writers' library landing (x -14..-6): the stair arrives here
    W("oak_panel", "z", -8, 10, -6.2, -5.8, F2, CEIL2, [
      { c: 0, w: 2.4, y0: F2, h: 2.6 },
    ]);
    for (let i = 0; i < 3; i++)
      PM.bookcase(
        b,
        X(-13.5 + i * 2.5),
        Z(-7.75),
        X(-11.2 + i * 2.5),
        Z(-7.75),
        oy + F2,
        oy + F2 + 2.9,
        0,
        { frame: "walnut" },
      );
    PM.bookcase(
      b,
      X(-6.25),
      Z(2),
      X(-6.25),
      Z(9.5),
      oy + F2,
      oy + F2 + 2.9,
      -HP,
      { frame: "walnut" },
    );
    PM.armchair(b, X(-9), oy + F2, Z(-5.2), 0.3, "leather_red");
    PM.armchair(b, X(-7.2), oy + F2, Z(-3.6), -0.9, "leather_brown");
    PM.tableLamp(b, X(-8.2), oy + F2 + 0.55, Z(-4.8), root);
    F.solid("walnut", -8.6, F2, -5.2, -7.8, F2 + 0.55, -4.4);
    A.library = AN(-9, F2, -2, 0);
    // corridor (x -6..20, z -1.2..1.2) with room doors both sides
    const ROOMS = [];
    const xs = [-6, -1.8, 2.4, 6.6, 10.8, 15, 20];
    for (let i = 0; i < 6; i++)
      ROOMS.push(
        { n: 201 + i * 2, x0: xs[i], x1: xs[i + 1], side: "n" },
        { n: 202 + i * 2, x0: xs[i], x1: xs[i + 1], side: "s" },
      );
    const OPEN = {
      201: "clinic",
      202: "scriptorium",
      203: "rental",
      204: "store",
      205: "couple",
      207: "cat",
      209: "writer",
      206: "boarded",
    };
    const gapsN = [],
      gapsS = [];
    for (const rm of ROOMS) {
      const c = (rm.x0 + rm.x1) / 2;
      if (OPEN[rm.n] && rm.n !== 207)
        (rm.side === "n" ? gapsN : gapsS).push({ c, w: 1.2, y0: F2, h: 2.3 });
      if (rm.n === 207) gapsN.push({ c, w: 1.2, y0: F2, h: 2.3 });
    }
    W("wallpaper_g", "x", -6, 20, -1.4, -1.2, F2, CEIL2, gapsN);
    W("wallpaper_g", "x", -6, 20, 1.2, 1.4, F2, CEIL2, gapsS);
    for (const x of xs.slice(1, -1)) {
      W("cream_plaster", "z", -7.8, -1.4, x - 0.1, x + 0.1, F2, CEIL2, []);
      W("cream_plaster", "z", 1.4, 9.8, x - 0.1, x + 0.1, F2, CEIL2, []);
    }
    F.box("carpet", -6, F2 + 0.01, -1.2, 20, F2 + 0.03, 1.2, {
      seg: false,
      c: 0x7a3a3a,
    });
    // closed doors (leaf panels) with brass numbers for the rooms nobody opens
    const numK = (n) => PM.labelKey("alg_n" + n, [String(n)], "brass", 128, 64);
    for (const rm of ROOMS) {
      const c = (rm.x0 + rm.x1) / 2,
        fz = rm.side === "n" ? -1.2 : 1.2,
        face = rm.side === "n" ? 0 : PI;
      b.quad(
        numK(rm.n),
        X(c + 0.9),
        oy + F2 + 1.9,
        Z(fz + (rm.side === "n" ? 0.02 : -0.02)),
        0.3,
        0.15,
        { ry: face },
      );
      if (!OPEN[rm.n]) {
        F.box("oak", c - 0.6, F2, fz - 0.06, c + 0.6, F2 + 2.3, fz + 0.06, {
          seg: false,
          c: 0x7a4a2a,
        });
        if (r() < 0.5)
          b.quad(
            PM.labelKey("alg_dnd", ["DO NOT", "DISTURB"], "label", 256, 128),
            X(c + 0.3),
            oy + F2 + 1.3,
            Z(fz + (rm.side === "n" ? 0.08 : -0.08)),
            0.2,
            0.1,
            { ry: face },
          );
      }
      if (rm.n === 206) {
        F.box(
          "planks",
          c - 0.7,
          F2 + 0.2,
          fz - 0.1,
          c + 0.7,
          F2 + 2.2,
          fz - 0.05,
          { seg: false, grime: 0.8 },
        );
      }
    }
    for (let x = -4; x <= 18; x += 5.5) {
      b.sphere("lamp_warm", X(x), oy + CEIL2 - 0.25, Z(0), 0.14, {
        noAO: true,
      });
      PM.glow(P(x, CEIL2 - 0.35, 0), 0xffc070, 1.3, root, {
        intensity: 1.0,
        flicker: 0.05,
      });
    }
    // corridor end window: the ruined skyline at dusk
    {
      const sk = PM.texMat("pm2_skyline_win", PM.skylineTex(), {
        rough: 1,
        emissive: 0.7,
        noShadow: true,
      });
      b.quad(sk, X(19.95), oy + F2 + 1.7, Z(0), 1.9, 2.2, {
        ry: -HP,
        uvRect: [0.3, 0.2, 0.45, 0.75],
      });
      F.box("white_paint", 19.9, F2 + 0.5, -1.1, 19.95, F2 + 2.9, 1.1, {
        seg: false,
        c: 0xd8d0c0,
      });
    }
    // --- room furnishing helpers ---
    const bed = (x, z, ry, messy) => {
      F.box("walnut", x - 0.8, F2, z - 1.05, x + 0.8, F2 + 0.45, z + 1.05, {
        seg: false,
      });
      b.box("linen", X(x), oy + F2 + 0.45, Z(z), 1.5, 0.2, 1.95, {
        seg: false,
        grime: messy ? 0.9 : 0.4,
      });
      b.box("linen", X(x), oy + F2 + 0.65, Z(z - 0.75), 1.2, 0.12, 0.35, {
        seg: false,
      });
      F.box("walnut", x - 0.85, F2, z - 1.15, x + 0.85, F2 + 1.1, z - 1.05, {
        seg: false,
      });
      PM.col(X(x), Z(z), 1.6, 2.1, oy + F2, oy + F2 + 0.65, 0, {
        walkable: true,
        surface: "wood",
      });
      void ry;
    };
    const dresser = (x, z) => {
      F.solid("walnut", x - 0.6, F2, z - 0.25, x + 0.6, F2 + 0.95, z + 0.25);
    };
    const room = (n) => ROOMS.find((q) => q.n === n);
    const cxr = (rm) => (rm.x0 + rm.x1) / 2;
    // 201: Doc Benchley's clinic
    {
      const rm = room(201),
        c = cxr(rm);
      bed(c - 1, -5.8, 0);
      F.box("linen", c + 0.4, F2 + 0.02, -7.7, c + 1.9, F2 + 2.0, -7.6, {
        seg: false,
        c: 0xd8d8c8,
      });
      F.solid("white_paint", c + 0.8, F2, -3.4, c + 1.9, F2 + 1.8, -2.7);
      for (let i = 0; i < 6; i++)
        b.cyl(
          r() < 0.5 ? "paint_red" : "glass_dark",
          X(c + 0.9 + i * 0.16),
          oy + F2 + 1.8,
          Z(-3.05),
          0.04,
          0.04,
          0.12,
          6,
          { hSeg: 1 },
        );
      b.quad(
        PM.labelKey(
          "alg_clinic",
          [
            "DR. R. BENCHLEY",
            "Physician · Surgeon · Listener",
            "Rally Tonic 60 · Rad cures 80",
          ],
          "label",
          512,
          256,
        ),
        X(c - 0.9),
        oy + F2 + 1.7,
        Z(-1.43),
        0.9,
        0.45,
        { ry: PI },
      );
      A.doctor = AN(c + 0.3, F2, -4.6, PI);
      A.clinic_bed = AN(c - 1, F2 + 0.65, -5.8, 0);
    }
    // 202: Archivist Park's scriptorium
    {
      const rm = room(202),
        c = cxr(rm);
      F.solid("walnut", c - 1.6, F2, 7.2, c + 1.6, F2 + 0.78, 8.2);
      for (let i = 0; i < 14; i++)
        b.box(
          r() < 0.5 ? "leather_red" : "leather_brown",
          X(c - 1.4 + r() * 2.8),
          oy + F2 + 0.78 + Math.floor(i / 5) * 0.08,
          Z(7.4 + r() * 0.6),
          0.25,
          0.07,
          0.34,
          { ry: r() * 0.6, seg: false },
        );
      PM.candles(b, X(c + 1.2), oy + F2 + 0.78, Z(7.6), 3, 141, root);
      PM.bookcase(
        b,
        X(rm.x0 + 0.15),
        Z(2),
        X(rm.x0 + 0.15),
        Z(9.6),
        oy + F2,
        oy + F2 + 2.8,
        HP,
        { frame: "walnut", books: "books_dark" },
      );
      const banner = PM.texMat(
        "pm2_covenant_banner",
        PM.signTex(
          "covenant_banner",
          ["⚔", "WE KEEP", "WHAT WAS"],
          "banner",
          256,
          512,
          { bg: "#2a2a3a", fg: "#c8b070", size: 48 },
        ),
        { rough: 0.95 },
      );
      b.quad(banner, X(rm.x1 - 0.12), oy + F2 + 1.9, Z(5.5), 1.0, 2.0, {
        ry: -HP,
        rz: 0.03,
      });
      A.archivist = AN(c, F2, 6.4, PI);
      A.scriptorium = AN(c, F2, 4, PI);
    }
    // 203: the rental room
    {
      const rm = room(203),
        c = cxr(rm);
      bed(c, -5.9, 0);
      dresser(c + 1.3, -2.2);
      PM.tableLamp(b, X(c + 1.3), oy + F2 + 0.95, Z(-2.2), root);
      b.quad(
        PM.labelKey(
          "alg_rent",
          ["ROOM 203", "Yours for 10 scrip a night", "Ask at the front desk"],
          "label",
          512,
          200,
        ),
        X(c - 0.9),
        oy + F2 + 1.7,
        Z(-1.43),
        0.7,
        0.28,
        { ry: PI },
      );
      A.rental = AN(c - 0.8, F2, -3.5, PI);
      A.rental_bed = AN(c, F2, -5.9, 0);
    }
    // 204: Rex's storeroom (locked, owned)
    {
      const rm = room(204),
        c = cxr(rm);
      for (let i = 0; i < 4; i++)
        D.crates(
          b,
          X(rm.x0 + 0.8 + i * 0.9),
          oy + F2,
          Z(9.1),
          1 + (i % 3),
          150 + i,
        );
      D.shelf(b, X(c), oy + F2, Z(9.6), PI, 3.4, 4, 151);
      A.store = AN(c, F2, 6, 0);
    }
    // 205: the couple who never checked out
    {
      const rm = room(205),
        c = cxr(rm);
      bed(c, -5.9, 0);
      PM.skeleton(b, X(c - 0.35), oy + F2 + 0.67, Z(-5.4), PI * 0.98);
      PM.skeleton(b, X(c + 0.35), oy + F2 + 0.67, Z(-5.5), PI * 1.02);
      dresser(c - 1.3, -2.2);
      b.cyl(
        "glass_dark",
        X(c - 1.2),
        oy + F2 + 0.95,
        Z(-2.2),
        0.05,
        0.06,
        0.3,
        6,
        { hSeg: 1 },
      );
      D.papers(b, X(c), oy + F2 + 0.02, Z(-3.5), 0.8, 5, 152);
      A.couple = AN(c, F2, -3.6, PI);
    }
    // 207: Matilda's hideout (locked; the door is a real swing door)
    {
      const rm = room(207),
        c = cxr(rm);
      bed(c + 0.4, -6.0, 0);
      dresser(c - 1.3, -6.9);
      F.box(
        "panel",
        rm.x0 + 0.2,
        F2 + 2.3,
        -7.75,
        rm.x0 + 0.8,
        F2 + 2.7,
        -7.7,
        { seg: false },
      ); // the vent she came in through
      PM.bonePile(b, X(c - 1.0), oy + F2, Z(-3.0), 0.4, 8, 153); // (bird bones — she has been eating well)
      A.cat_hide = AN(c + 0.4, F2 + 0.66, -6.2, 0.3);
      A.room207_door = AN(c - 0.6, F2, -1.3, 0);
    }
    // 209: a writer's room — typewriter, manuscript drifts
    {
      const rm = room(209),
        c = cxr(rm);
      bed(c + 0.9, -6.0, 0);
      F.solid("walnut", c - 1.6, F2, -7.6, c - 0.2, F2 + 0.76, -6.9);
      b.box(
        "black_steel",
        X(c - 0.9),
        oy + F2 + 0.76,
        Z(-7.2),
        0.45,
        0.16,
        0.35,
        { seg: false },
      );
      D.papers(b, X(c - 0.5), oy + F2 + 0.02, Z(-4.5), 1.6, 26, 154);
      D.chair(b, X(c - 0.9), oy + F2, Z(-6.3), PI, false, "walnut");
      A.writer = AN(c - 0.9, F2, -5.8, PI);
    }
    // 206: boarded (visual only above)
    A.corridor = AN(6, F2, 0, -HP);

    b.build(root);
    return A;
  }

  // ===================================================================
  // BUILDER
  // ===================================================================
  PM.addBuilder(
    "algonquin",
    function (PM2, site, root) {
      const ext = buildExterior(site, root);
      const cell = PM.cell("algonquin");
      const int = buildInterior(cell);
      const O = cell.origin;
      PM.door({
        id: "pm2_alg_enter",
        pos: V3((AX0 + AX1) / 2, 1.6, FZ + 0.2),
        label: "The Algonquin Hotel",
        verb: "Enter",
        radius: 1.5,
        target: {
          x: int.entrance.x,
          y: int.entrance.y + 0.05,
          z: int.entrance.z,
          yaw: 0,
        },
        sound: "door_open",
      });
      PM.door({
        id: "pm2_alg_exit",
        pos: int.exit_door,
        label: "44th Street",
        verb: "Exit",
        radius: 1.4,
        target: { x: ext.door.x, y: 0.05, z: ext.door.z, yaw: PI },
        sound: "door_open",
      });
      // Room 207 (Matilda's hideout): Case's spare key
      PM.swingDoor({
        id: "pm2_alg_207",
        x: int.room207_door.x,
        y: int.room207_door.y,
        z: int.room207_door.z + 0.05,
        ry: 0,
        w: 1.2,
        h: 2.3,
        t: 0.08,
        key: "oak",
        lock: PM.LOCKS.alg_207,
        label: "Room 207",
        parent: cell.root,
        openAngle: 1.5,
      });
      // the rental room and the storeroom have ordinary doors
      PM.swingDoor({
        id: "pm2_alg_203",
        x: O.x - 0.3,
        y: O.y + F2,
        z: O.z - 1.25,
        ry: 0,
        w: 1.2,
        h: 2.3,
        key: "oak",
        label: "Room 203",
        parent: cell.root,
        openAngle: 1.5,
      });
      PM.swingDoor({
        id: "pm2_alg_204",
        x: O.x + 0.9,
        y: O.y + F2,
        z: O.z + 1.3,
        ry: PI,
        w: 1.2,
        h: 2.3,
        key: "oak",
        lock: PM.LOCKS.alg_204,
        label: "Room 204 — Storage (Rex Hadley)",
        parent: cell.root,
        openAngle: 1.5,
      });

      const all = Object.assign({}, int, {
        exterior_entrance: ext.door,
        guard1: ext.guard,
        guard2: ext.guard2,
      });
      all.npc1 = int.manager;
      all.npc2 = int.bartender;
      all.npc3 = int.seat_crane;
      all.npc4 = int.archivist;
      all.npc5 = int.doctor;
      all.npc6 = int.merchant;
      all.loot1 = int.store;
      all.loot2 = int.couple;
      all.loot3 = int.writer;
      // (friendly settlement — spawn anchors only used if something hostile is ever sent here)
      all.spawn1 = int.lobby;
      all.spawn2 = int.oakroom;
      all.spawn3 = int.table;
      all.spawn4 = int.corridor;
      all.spawn5 = int.library;
      all.spawn6 = int.rental;
      PM.register("algonquin", root, all, {
        interiorRoot: cell.root,
        interiorKey: "algonquin",
      });

      // containers & props
      PM.prop("cash_register", {
        x: O.x + 3.8,
        y: O.y + 1.16,
        z: O.z + 1.6,
        yaw: PI,
        loot: "cash_register",
        items: [["pm2_alg_key204", 1]],
        owner: "settlers",
        id: "pm2_alg_register",
        name: "Front Desk Register",
      });
      PM.prop("footlocker", {
        x: int.store.x - 1,
        y: int.store.y,
        z: int.store.z + 2.5,
        yaw: PI,
        loot: "crate",
        items: [["pm2_note_rex", 1]],
        owner: "settlers",
        id: "pm2_alg_store_crate",
        name: "Rex's Stock",
      });
      PM.prop("safe", {
        x: int.store.x + 1.2,
        y: int.store.y,
        z: int.store.z + 2.4,
        yaw: PI,
        locked: 0,
        lock: PM.LOCKS.alg_safe,
        loot: "wall_safe",
        owner: "settlers",
        id: "pm2_alg_store_safe",
        name: "Rex's Strongbox",
      });
      PM.prop("footlocker", {
        x: int.couple.x + 1.2,
        y: int.couple.y,
        z: int.couple.z - 3.4,
        yaw: 0,
        loot: "luggage",
        id: "pm2_alg_couple_trunk",
        name: "Steamer Trunk",
      });
      PM.prop("desk", {
        x: int.writer.x + 2.4,
        y: int.writer.y,
        z: int.writer.z + 1.9,
        yaw: -HP,
        loot: "desk",
        id: "pm2_alg_writer_desk",
        name: "Writing Desk",
      });
      PM.prop("first_aid", {
        x: int.doctor.x + 1.5,
        y: int.doctor.y + 1.2,
        z: int.doctor.z + 3.1,
        yaw: PI,
        loot: "medical_cabinet",
        owner: "settlers",
        id: "pm2_alg_clinic_cab",
        name: "Medicine Cabinet",
      });
      PM.prop("fridge", {
        x: O.x + 19.4,
        y: O.y,
        z: O.z + 9.3,
        yaw: -HP,
        loot: "cooler",
        owner: "settlers",
        id: "pm2_alg_bar_icebox",
        name: "Bar Icebox",
      });
      PM.prop("radio", {
        x: O.x + 17.2,
        y: O.y + 1.16,
        z: O.z + 7.9,
        yaw: -HP,
        id: "pm2_alg_radio",
        name: "Bar Radio",
      });
    },
    20,
  );
})();
