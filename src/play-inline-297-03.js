// play-inline-297 03 — ax1
// Lines 48-691 of readable/play-inline-297.pretty.js (statement-aligned).
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
