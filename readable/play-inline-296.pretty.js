/* src/poi_midtown2/10_moma.js */
/* =====================================================================
 * NEW RAD CITY — POI MIDTOWN 2 — THE MUSEUM OF MODERN ART
 * Exterior (site x 130..190, z -314..-281, facing 53rd Street to the
 * south): the 1939 Goodwin & Stone building — white marble frame, the
 * milky Thermolux glass band, a row of square top-floor windows, the thin
 * wavy entrance canopy, the vertical "MUSEUM OF MODERN ART" lettering and
 * the rooftop canopy pierced with round holes — between the black steel
 * Johnson wing (west) and a gutted glass tower stump (east).
 * Interior (INTERIORS.moma): lobby → the Atrium (hanging helicopter,
 * broken obelisk, water-lily panorama) → The Atomic Age special
 * exhibition → Painting & Sculpture galleries (F2) → atrium bridge → the
 * Brutes' "Critics' Salon" → Architecture & Design (F3) →
 * Photography → curators' offices → locked Collection Storage (reward)
 * → freight elevator down to the loading dock → the Sculpture Garden,
 * where The Critic holds court → café → lobby.
 * Hostile: Brutes ("art critics"), boss THE CRITIC.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE || !G._pm2) return;
  const PM = G._pm2;
  const D = PM.dress;
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  const PI = Math.PI,
    HP = PI / 2,
    TAU = PI * 2;

  const FZ = -281.6; // front plane of the facades (53rd Street)
  const F2 = 5.2,
    F3 = 10.2,
    ROOF = 15;

  Object.assign(PM.flagDefaults, {
    moma_storage_code: false,
    moma_critic_dead: false,
    moma_review_read: false,
  });

  // ===================================================================
  // EXTERIOR
  // ===================================================================
  function curtainWall(b, x0, x1, y0, y1, z, opts) {
    // glass curtain wall on a south-facing plane: panes + black mullion grid + spandrels
    opts = opts || {};
    b.boxMM(opts.glass || "pane", x0, y0, z - 0.25, x1, y1, z, {
      grime: 0.25,
      noAO: true,
      seg: false,
    });
    const bay = opts.bay || 1.6,
      fh = opts.floorH || 4;
    for (let x = x0; x <= x1 + 0.01; x += bay)
      b.box(opts.mull || "black_steel", x, y0, z + 0.06, 0.14, y1 - y0, 0.18, {
        seg: false,
        grime: 0.3,
      });
    for (let y = y0; y <= y1 + 0.01; y += fh)
      b.boxMM(
        opts.mull || "black_steel",
        x0 - 0.05,
        y - 0.35,
        z,
        x1 + 0.05,
        y + 0.35,
        z + 0.2,
        { seg: false, grime: 0.35 },
      );
  }
  function buildExterior(site, root) {
    const b = PM.batch("moma_ext");
    b.ground = 0;
    b.aoH = 4;
    const r = PM.rng("moma_ext");
    const A = {};
    // forecourt paving along the whole front
    b.boxMM("sidewalk", site.x0, -0.1, FZ - 0.1, site.x1, 0.06, site.z1 - 0.2, {
      grime: 0.6,
      segLen: 6,
    });

    // ---------------- 1939 building (x 150..174) ----------------
    const BX0 = 150,
      BX1 = 174,
      BH = 21,
      PH = 24.6;
    const back = site.z0 + 1;
    // side/back volume
    b.boxMM("moma_marble", BX0, 0, back, BX1, BH, FZ - 2.4, { grime: 0.5 });
    PM.colMM(BX0, 0, back, BX1, PH, FZ - 2.2, { walkable: false });
    // marble piers (full height) — the west one carries the vertical lettering
    b.boxMM("moma_marble", BX0, 0, FZ - 2.4, BX0 + 2.4, BH, FZ, { grime: 0.5 });
    b.boxMM("moma_marble", BX1 - 1.2, 0, FZ - 2.4, BX1, BH, FZ, { grime: 0.5 });
    PM.colMM(BX0, 0, FZ - 2.4, BX0 + 2.4, BH, FZ, { walkable: false });
    PM.colMM(BX1 - 1.2, 0, FZ - 2.4, BX1, BH, FZ, { walkable: false });
    // ground floor: recessed glass lobby wall + revolving door
    const GZ = FZ - 2.2;
    b.boxMM("glass_dark", BX0 + 2.4, 0, GZ - 0.1, BX1 - 1.2, 4.4, GZ, {
      seg: false,
      noAO: true,
      grime: 0.2,
    });
    for (let x = BX0 + 2.4; x <= BX1 - 1.2 + 0.01; x += 1.55)
      b.box("black_steel", x, 0, GZ + 0.05, 0.12, 4.4, 0.12, { seg: false });
    b.boxMM("black_steel", BX0 + 2.4, 2.9, GZ, BX1 - 1.2, 3.05, GZ + 0.1, {
      seg: false,
    });
    b.boxMM("planks", 155.2, 0.2, GZ + 0.02, 158.4, 2.8, GZ + 0.08, {
      seg: false,
      grime: 0.8,
    }); // boarded panes
    b.boxMM("glass_broken", 166, 0.3, GZ + 0.01, 169.5, 2.8, GZ + 0.03, {
      seg: false,
      noAO: true,
    });
    b.cyl("glass_dark", 162, 0, GZ + 0.9, 1.1, 1.1, 2.6, 16, {
      hSeg: 1,
      open: true,
      thetaStart: 0,
      thetaLen: PI,
      noAO: true,
    });
    b.cyl("black_steel", 162, 2.6, GZ + 0.9, 1.2, 1.2, 0.2, 16, {
      hSeg: 1,
      thetaStart: 0,
      thetaLen: PI,
    });
    for (let k = 0; k < 4; k++) {
      const a = (k / 4) * PI + 0.3;
      b.box(
        "black_steel",
        162 + Math.cos(a) * 0.55,
        0,
        GZ + 0.9 - Math.sin(a) * 0.55,
        1.1,
        2.4,
        0.05,
        { ry: a, seg: false },
      );
    }
    PM.colMM(BX0 + 2.4, 0, GZ - 0.2, BX1 - 1.2, 4.4, GZ + 0.05, {
      walkable: false,
    });
    // a little warm light still burns in the lobby (seen through the glass)
    b.boxMM("window_lit", BX0 + 3, 0.3, GZ - 0.6, BX1 - 2, 3.6, GZ - 0.5, {
      seg: false,
      noAO: true,
    });
    for (const x of [156, 166])
      PM.glow(V3(x, 3.4, GZ - 1.2), 0xffc070, 2.4, null, {
        intensity: 0.9,
        flicker: 0.1,
      });
    // lobby floor under the canopy (terrazzo) + step
    b.boxMM("terrazzo", BX0 + 2.4, 0, GZ, BX1 - 1.2, 0.12, FZ + 0.3, {
      seg: false,
      grime: 0.5,
    });
    // floor slab edge above the recess (spandrel) — marble
    b.boxMM("moma_marble", BX0 + 2.4, 4.4, FZ - 2.4, BX1 - 1.2, 5.0, FZ, {
      grime: 0.4,
    });
    // Thermolux band (floors 2–4) with black mullions on a 1.7 m grid
    const TX0 = BX0 + 2.4,
      TX1 = BX1 - 1.2,
      TY0 = 5.0,
      TY1 = 16.9;
    b.boxMM("thermolux", TX0, TY0, FZ - 0.35, TX1, TY1, FZ - 0.05, {
      seg: false,
      grime: 0.35,
      noAO: true,
    });
    for (let x = Math.ceil(TX0 / 1.7) * 1.7; x < TX1; x += 1.7)
      b.box("black_steel", x, TY0, FZ - 0.02, 0.1, TY1 - TY0, 0.1, {
        seg: false,
      });
    for (let y = Math.ceil(TY0 / 1.7) * 1.7; y < TY1; y += 1.7)
      b.boxMM(
        "black_steel",
        TX0,
        y - 0.05,
        FZ - 0.05,
        TX1,
        y + 0.05,
        FZ + 0.04,
        { seg: false },
      );
    b.boxMM("moma_marble", TX0, TY1, FZ - 0.4, TX1, BH, FZ, { grime: 0.45 }); // top floor marble band
    // row of square windows in the top band
    for (let i = 0; i < 10; i++) {
      const x = TX0 + 1.0 + (i * (TX1 - TX0 - 2)) / 9;
      b.quad(
        i === 3 || i === 7 ? "glass_broken" : "glass_dark",
        x,
        18.9,
        FZ + 0.01,
        1.05,
        1.05,
        { ry: 0, noAO: true },
      );
      b.boxMM("black_steel", x - 0.6, 18.3, FZ, x + 0.6, 18.4, FZ + 0.08, {
        seg: false,
      });
    }
    // parapet coping & the set-back penthouse (glass) with its famous perforated canopy
    b.boxMM(
      "moma_marble",
      BX0 - 0.1,
      BH,
      FZ - 0.5,
      BX1 + 0.1,
      BH + 1.0,
      FZ + 0.1,
      { grime: 0.4 },
    );
    b.boxMM("glass_dark", BX0 + 1, BH, FZ - 9, BX1 - 1, PH - 0.4, FZ - 4, {
      grime: 0.3,
      noAO: true,
    });
    for (let x = BX0 + 1; x <= BX1 - 1 + 0.01; x += 2.2)
      b.box("white_steel", x, BH, FZ - 4, 0.12, PH - 0.4 - BH, 0.12, {
        seg: false,
      });
    {
      const w = BX1 - BX0 + 1.6,
        d = 11.5;
      const sh = new THREE.Shape();
      sh.moveTo(-w / 2, 0);
      sh.lineTo(w / 2, 0);
      sh.lineTo(w / 2, d);
      sh.lineTo(-w / 2, d);
      sh.closePath();
      const holes = [
        [-8.5, 3.4],
        [-4.2, 3.0],
        [0.2, 3.5],
        [4.6, 3.1],
        [8.8, 3.4],
        [-6.3, 7.6],
        [-1.8, 7.9],
        [2.7, 7.4],
        [7.1, 7.8],
      ];
      for (const [hx, hy] of holes) {
        const p = new THREE.Path();
        p.absarc(hx, hy, 1.05, 0, TAU, true);
        sh.holes.push(p);
      }
      const g = new THREE.ExtrudeGeometry(sh, {
        depth: 0.42,
        bevelEnabled: false,
        curveSegments: 14,
      });
      g.rotateX(-HP); // shape y → -z, extrusion → +y
      b.add("white_steel", g, {
        m: PM.m4((BX0 + BX1) / 2, PH - 0.2, FZ + 0.9),
        grime: 0.4,
      });
      for (const x of [BX0 + 2, BX1 - 2])
        for (const z of [FZ - 4.2, FZ - 9])
          b.box("white_steel", x, BH, z, 0.16, PH - BH - 0.2, 0.16, {
            seg: false,
          });
    }
    // the vertical lettering on the west pier
    {
      const tex = PM.canvasTex(
        "pm2_moma_vert",
        128,
        1024,
        (c, w, h) => {
          c.fillStyle = "#e8e4da";
          c.fillRect(0, 0, w, h);
          const t = "MUSEUM OF MODERN ART".split("");
          c.fillStyle = "#1a1a1a";
          c.textAlign = "center";
          c.textBaseline = "middle";
          c.font =
            'bold 52px "Futura", "Century Gothic", "Helvetica Neue", Arial, sans-serif';
          t.forEach((ch, i) =>
            c.fillText(ch, w / 2, 40 + (i * (h - 70)) / (t.length - 1)),
          );
          PM.m2grime(c, w, h, PM.rng("vert"), 0.9);
        },
        { clamp: true },
      );
      b.quad(
        PM.texMat("pm2_moma_vert", tex, { rough: 0.6 }),
        BX0 + 1.2,
        11.5,
        FZ + 0.02,
        1.2,
        12.5,
        { ry: 0, grime: 0.3 },
      );
    }
    // the thin wavy entrance canopy
    {
      const sh = new THREE.Shape();
      const x0 = -8.5,
        x1 = 8.5,
        zb = 0.2,
        N = 24;
      sh.moveTo(x0, -zb);
      for (let i = 0; i <= N; i++) {
        const t = i / N,
          x = x0 + (x1 - x0) * t;
        sh.lineTo(
          x,
          2.6 + Math.sin(t * PI * 2.5) * 0.7 + Math.sin(t * PI) * 0.8,
        );
      }
      sh.lineTo(x1, -zb);
      sh.closePath();
      const g = new THREE.ExtrudeGeometry(sh, {
        depth: 0.3,
        bevelEnabled: false,
      });
      g.rotateX(HP); // y → +z (south), extrusion → -y
      b.add("white_steel", g, { m: PM.m4(162, 4.05, GZ + 0.1), grime: 0.5 });
      for (const x of [155.5, 168.5])
        b.cyl("black_steel", x, 0, FZ + 1.2, 0.07, 0.07, 3.8, 6, { hSeg: 1 });
      // what the critics hung from it
      b.beam(
        "iron",
        V3(158.4, 3.75, FZ + 1.4),
        V3(158.4, 2.6, FZ + 1.4),
        0.03,
        0.03,
        {},
      );
      b.add("bone", new THREE.CapsuleGeometry(0.14, 0.55, 3, 6), {
        m: PM.m4(158.4, 2.1, FZ + 1.4, 0.3),
        grime: 0.5,
      });
      b.sphere("bone", 158.4, 2.62, FZ + 1.4, 0.12, { ws: 7, hs: 5 });
    }
    // graffiti over the Thermolux
    {
      const k1 = PM.texMat(
        "pm2_graf_moma1",
        PM.graffitiTex("moma1", ["ART CRITICS", "ONLY"], 512, 256, {
          color: "#b8201a",
          outline: "rgba(20,10,8,0.8)",
          tag: "skull",
        }),
        { transparent: true, rough: 0.9 },
      );
      b.quad(k1, 164, 8.4, FZ + 0.06, 7.5, 3.6, {
        ry: 0,
        noAO: true,
        grime: 0,
      });
      const k2 = PM.texMat(
        "pm2_graf_moma2",
        PM.graffitiTex("moma2", ["SOFTLING = ART SUPPLIES"], 1024, 160, {
          color: "#2a2a2a",
        }),
        { transparent: true, rough: 0.9 },
      );
      b.quad(k2, 145, 2.2, FZ + 0.05, 9, 1.4, { ry: 0, noAO: true, grime: 0 });
    }

    // ---------------- Johnson wing (x 131..150): black steel & glass ----------------
    {
      const x0 = 131,
        x1 = BX0,
        H = 24;
      b.boxMM("black_steel", x0, 0, back, x1, H, FZ - 0.3, { grime: 0.4 });
      curtainWall(b, x0, x1, 0.6, H - 0.5, FZ - 0.05, {
        bay: 1.58,
        floorH: 4.6,
      });
      b.boxMM(
        "black_steel",
        x0 - 0.2,
        H - 0.6,
        FZ - 0.4,
        x1,
        H + 0.3,
        FZ + 0.3,
        { seg: false },
      );
      b.boxMM("granite_dark", x0, 0, FZ - 0.3, x1, 0.6, FZ + 0.1, {
        seg: false,
      });
      PM.colMM(x0, 0, back, x1, H, FZ + 0.1, { walkable: false });
      // exhibition banners (vertical) on steel arms
      const ban = PM.texMat(
        "pm2_moma_banner",
        PM.signTex(
          "moma_banner",
          [
            "THE",
            "ATOMIC",
            "AGE",
            "",
            "ART OF",
            "TOMORROW",
            "",
            "JAN 14 –",
            "JUN 30",
            "1967",
          ],
          "banner",
          256,
          768,
          {
            bg: "#a82a1e",
            fg: "#f0e6cc",
            size: 38,
            emblem: (c, w, h) => {
              c.strokeStyle = "#f0e6cc";
              c.lineWidth = 5;
              for (let k = 0; k < 3; k++) {
                c.beginPath();
                c.ellipse(w / 2, h * 0.86, 60, 22, k * 1.05, 0, TAU);
                c.stroke();
              }
              c.fillStyle = "#f0e6cc";
              c.beginPath();
              c.arc(w / 2, h * 0.86, 10, 0, TAU);
              c.fill();
            },
          },
        ),
        { rough: 0.95, side: THREE.DoubleSide },
      );
      for (const [x, torn] of [
        [135.2, 0],
        [141.5, 0],
        [147.1, 1],
      ]) {
        b.beam(
          "black_steel",
          V3(x, 17.5, FZ),
          V3(x, 17.5, FZ + 1.3),
          0.06,
          0.06,
          {},
        );
        b.quad(ban, x, 12.8 + torn * 0.8, FZ + 1.25, 2.2, 9.4 - torn * 1.6, {
          ry: 0,
          grime: 0.3,
          rz: torn * 0.08,
        });
      }
      // ground floor: museum store window + boarded door
      b.quad(
        PM.labelKey(
          "moma_hours",
          [
            "MUSEUM HOURS",
            "Mon–Sun 10:30–5:30",
            "Fridays until the end of the world",
            "Members free",
          ],
          "label",
          512,
          256,
        ),
        138,
        1.9,
        FZ + 0.03,
        1.4,
        0.7,
        { ry: 0 },
      );
    }

    // ---------------- glass tower stump (x 174..190) ----------------
    {
      const x0 = BX1,
        x1 = site.x1 - 1,
        H = 36;
      b.boxMM("concrete_dark", x0, 0, back, x1, 30, FZ - 0.4, { grime: 0.6 });
      curtainWall(b, x0 + 0.1, x1, 0.8, 30, FZ - 0.1, {
        bay: 1.5,
        floorH: 3.6,
        glass: "pane_cracked",
      });
      PM.colMM(x0, 0, back, x1, 30, FZ + 0.1, { walkable: false });
      // exposed steel frame of the upper floors (collapsed skin), jagged slabs
      for (let y = 30; y < H; y += 3.6) {
        b.boxMM(
          "concrete",
          x0,
          y - 0.3,
          back,
          x1 - r() * 5,
          y,
          FZ - 0.2 - r() * 3,
          { grime: 0.7 },
        );
        for (let x = x0 + 0.5; x < x1; x += 3.8)
          if (r() < 0.8)
            b.box("rust", x, y, FZ - 0.4, 0.3, 3.6 * (0.4 + r() * 0.6), 0.3, {
              seg: false,
              rz: (r() - 0.5) * 0.3,
            });
      }
      for (let i = 0; i < 6; i++)
        b.beam(
          "rust",
          V3(x0 + r() * (x1 - x0), 30 + r() * 5, FZ - 0.4),
          V3(x0 + r() * (x1 - x0), 31 + r() * 6, FZ - 3 - r() * 8),
          0.25,
          0.3,
          {},
        );
      const store = PM.texMat(
        "pm2_moma_store",
        PM.signTex("moma_store", ["MoMA DESIGN STORE"], "enamel", 512, 96, {
          bg: "#1a1a1a",
          fg: "#e8e4d8",
        }),
      );
      b.quad(store, 182, 4.4, FZ + 0.05, 7.5, 1.1, { ry: 0 });
      b.boxMM("planks", 176, 0.3, FZ - 0.02, 188, 3.6, FZ + 0.04, {
        seg: false,
        grime: 0.8,
      });
    }

    // ---------------- street-level dressing: the critics' front yard ----------------
    PM.sandbags(b, 151.8, FZ + 2.6, 155.2, FZ + 3.0, 3, {});
    PM.sandbags(b, 168.8, FZ + 3.0, 172.4, FZ + 2.6, 3, {});
    PM.fireBarrel(b, 152.6, 0, FZ + 1.4, null);
    // "UNTITLED (SOFTLING #4)" — tyres, a mannequin and a traffic cone on a plinth
    {
      const px = 176.5,
        pz = FZ + 2.2;
      b.box("moma_marble", px, 0, pz, 1.6, 0.9, 1.6, {
        seg: false,
        grime: 0.6,
      });
      PM.col(px, pz, 1.6, 1.6, 0, 0.9, 0, { walkable: false });
      for (let k = 0; k < 3; k++)
        b.add("tire", new THREE.TorusGeometry(0.42, 0.16, 6, 12), {
          m: PM.m4(px, 1.05 + k * 0.3, pz, k * 0.5, HP),
        });
      b.add("paint_cream", new THREE.CapsuleGeometry(0.2, 0.7, 3, 8), {
        m: PM.m4(px, 2.35, pz, 0, 0, 0.15),
      });
      b.sphere("paint_cream", px + 0.1, 3.05, pz, 0.15, {});
      b.add("paint_orange", new THREE.ConeGeometry(0.16, 0.45, 8), {
        m: PM.m4(px + 0.12, 3.35, pz),
      });
      b.quad(
        PM.labelKey(
          "moma_untitled4",
          [
            "UNTITLED (SOFTLING #4)",
            "Tyres, mannequin, cone, softling",
            "Gift of the Critic",
            "CRITIC SAYS: GOOD. VERY GOOD.",
          ],
          "label",
          512,
          256,
        ),
        px,
        0.55,
        pz + 0.81,
        0.9,
        0.45,
        { ry: 0 },
      );
    }
    PM.dress.crates(b, 186, 0, FZ + 1.8, 2, 71);
    PM.bench(b, 142, 0, FZ + 2.3, 0);
    D.papers(b, 160, 0.06, FZ + 2, 3, 14, 72);
    D.rubble(b, 188.5, 0, FZ + 1.0, 0.9, 6, 73);

    b.build(root);
    A.door = PM.anchor(162, 0, FZ + 1.6, PI);
    A.front = PM.anchor(160, 0, FZ + 6, PI);
    // plaque by the entrance
    PM.readable(
      V3(BX1 - 0.6, 1.5, FZ + 0.1),
      "Museum of Modern Art",
      "Founded 1929. This building, by Philip L. Goodwin and Edward Durell Stone, opened in 1939 — the first International Style museum in America. The roof canopy's round holes were meant to let the sky in. The sky, these days, lets itself in.",
    );
    return A;
  }

  // ===================================================================
  // INTERIOR
  // ===================================================================
  function buildInterior(cell) {
    const O = cell.origin,
      oy = O.y;
    const b = PM.batch("moma_int");
    const F = PM.frame(O.x, oy, O.z, b);
    const { X, Z, P, A: AN, W } = F;
    const root = cell.root;
    const r = PM.rng("moma_int");
    const A = {};
    b.ground = oy;
    b.aoH = 3;
    b.grime = 0.28;

    // ---------------- baked lights ----------------
    const L = [];
    const lamp = (x, y, z, col, rad, i) =>
      L.push({ x: X(x), y: oy + y, z: Z(z), color: col, r: rad, i });
    // cold daylight through the atrium skylight
    lamp(0, 14, -11, 0xc8d4d8, 22, 1.0);
    lamp(0, 6, -11, 0xb8c4c8, 14, 0.5);
    // lobby: sodium emergency lamps + street light through the doors
    lamp(-6, 4.2, 6, 0xffc070, 9, 0.7);
    lamp(6, 4.2, 6, 0xffc070, 9, 0.6);
    lamp(0, 2.5, 11, 0xd8d8c8, 7, 0.6);
    // west wing G1 (Atomic Age: neon pink/green works)
    lamp(-21, 4.2, 4, 0xffd8a0, 10, 0.7);
    lamp(-21, 3, -8, 0x90ff90, 7, 0.6);
    lamp(-24, 2, 8, 0xff70b0, 6, 0.6);
    lamp(-21, 3.5, -18, 0xffa860, 8, 0.6); // loading dock bulb
    // east wing café
    lamp(21, 4, 4, 0xffd090, 10, 0.65);
    lamp(21, 4, -12, 0xffd090, 9, 0.5);
    // F2 galleries (track spots), salon fires
    lamp(-21, F2 + 4.2, 4, 0xfff0d8, 10, 0.7);
    lamp(-21, F2 + 4.2, -13, 0xfff0d8, 10, 0.6);
    lamp(0, F2 + 4, 6, 0xffe8c8, 10, 0.55);
    lamp(18, F2 + 1.4, -4, 0xff8030, 9, 1.0);
    lamp(24, F2 + 1.4, 6, 0xff8030, 8, 0.9);
    lamp(24, F2 + 3.5, -16, 0xffb060, 7, 0.5);
    // F3
    lamp(21, F3 + 4, -12, 0xfff4e0, 11, 0.65);
    lamp(21, F3 + 4, 4, 0xfff4e0, 10, 0.55);
    lamp(0, F3 + 4, 6, 0xffe8d0, 10, 0.55);
    lamp(-21, F3 + 3.6, 5, 0xffd8a0, 9, 0.6);
    lamp(-21, F3 + 3.4, -14, 0x90b8ff, 9, 0.55);
    // sculpture garden: open sky ambience + two fires
    lamp(0, 16, -34, 0xa8b098, 30, 0.9);
    lamp(-6, 1.3, -42, 0xff8030, 9, 1.1);
    lamp(14, 1.3, -30, 0xff8030, 8, 1.0);
    // garden lanterns along the walls
    for (const [x, z] of [
      [-29.6, -40],
      [-29.6, -28],
      [29.6, -40],
      [29.6, -28],
      [-14, -45.6],
      [14, -45.6],
    ])
      lamp(x, 3.2, z, 0xffc880, 8, 0.7);
    b.setLights(L, 0xb0ab9c, 0.2);

    // ================= SHELL =================
    // floors
    F.slab("terrazzo", -30, -22, 30, 12, 0, [], { th: 0.3 });
    F.slab(
      "oak_floor",
      -30,
      -22,
      30,
      12,
      F2,
      [
        [-12, -22, 12, -12.2],
        [-12, -9.3, 12, 0],
        [-30, -7.6, -27.2, 1.7],
      ],
      { under: "gallery" },
    );
    F.slab(
      "oak_floor",
      -30,
      -22,
      30,
      12,
      F3,
      [
        [-12, -22, 12, 0],
        [27.2, -11.2, 30, -1.8],
      ],
      { under: "gallery" },
    );
    F.box("gallery", -30, ROOF, -22, 30, ROOF + 0.4, 12, { grime: 0.2 }); // ceiling
    // atrium skylight: emissive sky panes in a steel grid
    b.boxMM(
      "sky_glow",
      X(-10),
      oy + ROOF - 0.05,
      Z(-20),
      X(10),
      oy + ROOF,
      Z(-2),
      { seg: false, noAO: true, grime: 0.4 },
    );
    for (let x = -10; x <= 10; x += 2.5)
      F.box(
        "black_steel",
        x - 0.08,
        ROOF - 0.4,
        -20,
        x + 0.08,
        ROOF - 0.05,
        -2,
        { seg: false },
      );
    for (let z = -20; z <= -2; z += 2.25)
      F.box(
        "black_steel",
        -10,
        ROOF - 0.4,
        z - 0.08,
        10,
        ROOF - 0.05,
        z + 0.08,
        { seg: false },
      );
    F.box("glass_broken", -2.5, ROOF - 0.3, -12.3, 2.5, ROOF - 0.1, -9.8, {
      seg: false,
      noAO: true,
    });
    // outer walls
    W("gallery", "x", -30, 30, 12, 12.4, 0, ROOF, [
      { c: 0, w: 4.4, y0: 0, h: 3.4 },
    ]); // south (entrance)
    W("gallery", "z", -22, 12.4, -30.4, -30, 0, ROOF, [
      { c: -18, w: 2.2, y0: 0, h: 3.0 },
      { c: -18, w: 2.2, y0: F3, h: 3.0 },
    ]); // west (freight elevator shafts)
    W("gallery", "z", -22, 12.4, 30, 30.4, 0, ROOF, []); // east
    // north wall (building ↔ garden): glass on the ground floor, solid above; openings: dock door, café doors, atrium glass
    W("gallery", "x", -30.4, 30.4, -22.4, -22, F2 - 0.4, ROOF, []);
    W("black_steel", "x", -30.4, 30.4, -22.4, -22, 0, F2 - 0.4, [
      { c: -20, w: 2.4, y0: 0, h: 3.0 },
      { c: 22, w: 3.2, y0: 0, h: 3.2 },
      { c: 0, w: 22, y0: 0.5, h: 3.9 },
      { c: -26, w: 3, y0: 0.9, h: 2.6 },
      { c: 16, w: 4, y0: 0.9, h: 2.6 },
    ]);
    F.box("pane", -11, 0.5, -22.3, 11, 4.4, -22.25, {
      seg: false,
      noAO: true,
      grime: 0.3,
    }); // atrium garden window (see-through dark glass)
    F.col(-11, 0, -22.4, 11, 4.4, -22, { walkable: false });
    for (let x = -11; x <= 11; x += 2.2)
      F.box("black_steel", x - 0.06, 0.5, -22.35, x + 0.06, 4.4, -22.15, {
        seg: false,
      });

    // ================= GROUND FLOOR =================
    // lobby | atrium partition (z = 0) with the wide opening, wing walls x = ±12
    W("gallery", "x", -12, -7, -0.2, 0.2, 0, F2 - 0.4, []);
    W("gallery", "x", 7, 12, -0.2, 0.2, 0, F2 - 0.4, []);
    F.box("gallery", -7, 3.9, -0.2, 7, F2 - 0.4, 0.2, { grime: 0.2 });
    W("gallery", "z", -22, 12, -12.2, -11.8, 0, F2 - 0.4, [
      { c: 6, w: 3, y0: 0, h: 3.2 },
      { c: -10, w: 3, y0: 0, h: 3.2 },
    ]);
    W("gallery", "z", -22, 12, 11.8, 12.2, 0, F2 - 0.4, [
      { c: 6, w: 3, y0: 0, h: 3.2 },
      { c: -10, w: 3, y0: 0, h: 3.2 },
    ]);
    // --- lobby ---
    // vestibule: glass doors, stanchions, exit
    F.box("glass_dark", -2.2, 0, 11.3, 2.2, 3.3, 11.36, {
      seg: false,
      noAO: true,
    });
    for (const x of [-2.2, -1.1, 0, 1.1, 2.2])
      F.box("black_steel", x - 0.05, 0, 11.28, x + 0.05, 3.3, 11.4, {
        seg: false,
      });
    A.entrance = AN(0, 0, 9.2, 0);
    // curved ticket desk
    for (let i = 0; i < 9; i++) {
      const a = -0.9 + i * 0.225;
      const x = -4.5 + Math.sin(a) * 3.2,
        z = 5.2 - Math.cos(a) * 1.4;
      b.box("white_steel", X(x), oy, Z(z), 0.82, 1.1, 0.5, {
        ry: -a * 0.45,
        seg: false,
        grime: 0.5,
      });
      PM.col(X(x), Z(z), 0.82, 0.5, oy, oy + 1.1, -a * 0.45, {
        walkable: false,
      });
    }
    F.box("marble_white", -8, 1.1, 3.4, -1, 1.16, 4.3, { seg: false });
    D.monitor(b, X(-5.2), oy + 1.16, Z(3.9), PI, false);
    D.papers(b, X(-4), oy + 0.01, Z(2.4), 1.6, 12, 11);
    b.quad(
      PM.labelKey(
        "moma_tickets",
        [
          "ADMISSION",
          "Adults $25 · Students $14",
          "sleepers: FREE*",
          "*Offer valid until Mar. 5, 1967",
        ],
        "label",
        512,
        256,
      ),
      X(-4.5),
      oy + 3.0,
      Z(0.23),
      2.4,
      1.2,
      { ry: 0 },
    );
    // coat check (east) with hanger rail and abandoned coats
    F.solid("white_steel", 6, 0, 1.2, 11.6, 1.1, 1.8);
    F.box("iron", 6.2, 2.0, 0.6, 11.6, 2.05, 0.66, { seg: false });
    for (let i = 0; i < 9; i++) {
      const x = 6.5 + i * 0.6;
      if (r() < 0.3) continue;
      b.box(
        r() < 0.5 ? "fabric" : "leather_brown",
        X(x),
        oy + 0.95,
        Z(0.63),
        0.5,
        1.05,
        0.2,
        { seg: false, c: [0x6a5a4a, 0x3a3a44, 0x7a3a2a][i % 3], grime: 0.6 },
      );
    }
    b.quad(
      PM.labelKey(
        "moma_coat",
        [
          "COAT CHECK",
          "Not responsible for lost items,",
          "nuclear or otherwise",
        ],
        "label",
        512,
        200,
      ),
      X(8.9),
      oy + 2.8,
      Z(0.23),
      1.6,
      0.62,
      { ry: 0 },
    );
    // benches, directory board, turnstile stanchions, skeleton guard
    for (const [x, z] of [
      [-8.5, 9],
      [6, 9],
    ]) {
      F.solid("walnut", x - 1.2, 0.35, z - 0.3, x + 1.2, 0.45, z + 0.3);
      for (const dx of [-1, 1])
        F.box(
          "black_steel",
          x + dx - 0.05,
          0,
          z - 0.25,
          x + dx + 0.05,
          0.35,
          z + 0.25,
          { seg: false },
        );
    }
    b.box("black_steel", X(9.6), oy, Z(8.4), 0.1, 2.4, 0.1, { seg: false });
    b.quad(
      PM.labelKey(
        "moma_dir",
        [
          "FLOOR GUIDE",
          "3  Architecture & Design · Photography",
          "    Curatorial (Staff Only)",
          "2  Painting & Sculpture · Critics' Lounge*",
          "1  Atrium · The Atomic Age · Café",
          "   Sculpture Garden",
          "*not a museum space",
        ],
        "label",
        512,
        400,
      ),
      X(9.6),
      oy + 1.7,
      Z(8.46),
      1.2,
      0.94,
      { ry: 0 },
    );
    for (let i = 0; i < 5; i++) {
      b.cyl("chrome", X(-2 + i), oy, Z(1.6), 0.06, 0.18, 1.0, 8, { hSeg: 1 });
      if (i === 2) continue;
    }
    PM.skeleton(b, X(-2.5), oy + 0.02, Z(7.5), 0.8);
    // --- the atrium ---
    // the broken obelisk: a pyramid, and an inverted obelisk balanced on its point (weathering steel)
    {
      const ax = 0,
        az = -12;
      const pyr = new THREE.ConeGeometry(1.7, 2.3, 4, 1);
      pyr.rotateY(PI / 4);
      b.add("rust", pyr, {
        m: PM.m4(X(ax), oy + 1.15 + 0.3, Z(az)),
        grime: 0.3,
      });
      const ob = new THREE.CylinderGeometry(0.75, 0.05, 5.8, 4, 3);
      ob.rotateY(PI / 4);
      PM.deform(ob, (v) => {
        if (v.y > 2.4) {
          v.y += Math.sin(v.x * 9 + v.z * 7) * 0.35;
        }
      });
      b.add("rust", ob, { m: PM.m4(X(ax), oy + 2.6 + 2.8, Z(az)), grime: 0.3 });
      F.solid("granite_dark", ax - 2.3, 0, az - 2.3, ax + 2.3, 0.3, az + 2.3);
      PM.col(X(ax), Z(az), 2.6, 2.6, oy, oy + 3, PI / 4, { walkable: false });
      b.quad(
        PM.labelKey(
          "moma_obelisk",
          [
            "BROKEN OBELISK",
            "Weathering steel, 1963–69",
            "It was like this when we got here.",
            "— Museum staff, 1967",
          ],
          "label",
          512,
          256,
        ),
        X(ax),
        oy + 0.2,
        Z(az + 2.32),
        1.0,
        0.5,
        { ry: 0 },
      );
    }
    // the hanging helicopter (bubble canopy, lattice tail boom, rotor, skids) on cables
    {
      const hx = 3,
        hy = 10.8,
        hz = -7;
      const M = PM.m4(X(hx), oy + hy, Z(hz), 0.5);
      const add = (key, g, m, o) =>
        b.add(
          key,
          g,
          Object.assign(
            { m: new THREE.Matrix4().multiplyMatrices(M, m), grime: 0.3 },
            o || {},
          ),
        );
      add(
        "glass_dark",
        new THREE.SphereGeometry(1.05, 14, 10),
        PM.m4(0, 0.2, 0, 0, 0, 0, 1, 0.95, 1.1),
        { noAO: true },
      );
      add(
        "chrome",
        new THREE.TorusGeometry(1.03, 0.04, 4, 20),
        PM.m4(0, 0.1, 0, 0, HP),
      );
      add("army", new THREE.BoxGeometry(1.4, 0.7, 1.3), PM.m4(0, -0.6, -1.3)); // engine deck
      add(
        "army",
        new THREE.CylinderGeometry(0.28, 0.28, 0.9, 8),
        PM.m4(0, -0.2, -1.4),
      );
      for (let i = 0; i < 4; i++) {
        const sx = i % 2 ? 0.18 : -0.18,
          sy = i < 2 ? 0.18 : -0.18;
        add(
          "army",
          new THREE.CylinderGeometry(0.03, 0.03, 5, 4),
          PM.m4(sx * 0.5, sy * 0.5 - 0.3, -3.9, 0, HP * 0.98, 0),
        );
      }
      for (let k = 0; k < 10; k++)
        add(
          "army",
          new THREE.BoxGeometry(0.03, 0.25, 0.03),
          PM.m4(0, -0.3, -1.8 - k * 0.48, 0, 0, k % 2 ? 0.8 : -0.8),
        );
      add("army", new THREE.BoxGeometry(0.06, 0.6, 0.35), PM.m4(0, -0.1, -6.3)); // tail rotor fin
      add(
        "black_steel",
        new THREE.BoxGeometry(0.05, 1.2, 0.12),
        PM.m4(0.12, -0.1, -6.35),
      );
      add(
        "black_steel",
        new THREE.BoxGeometry(10.5, 0.05, 0.3),
        PM.m4(0, 1.45, -0.6, 0.4),
      ); // main rotor
      add(
        "black_steel",
        new THREE.CylinderGeometry(0.07, 0.07, 0.8, 6),
        PM.m4(0, 1.05, -0.6),
      );
      for (const sx of [-1, 1]) {
        add(
          "chrome",
          new THREE.CylinderGeometry(0.05, 0.05, 3.2, 6),
          PM.m4(sx * 1.0, -1.35, -0.4, 0, HP),
        );
        for (const dz of [-0.9, 0.5])
          add(
            "chrome",
            new THREE.CylinderGeometry(0.035, 0.035, 0.8, 4),
            PM.m4(sx * 0.8, -1.0, dz, 0, 0, sx * 0.4),
          );
      }
      for (const [dx, dz] of [
        [-1, 0.5],
        [1, 0.5],
        [0, -4],
      ]) {
        const p = new THREE.Vector3(dx, 1.2, dz).applyMatrix4(M);
        b.beam("iron", p, V3(p.x, oy + ROOF - 0.4, p.z), 0.015, 0.015, {
          noAO: true,
          grime: 0,
        });
      }
    }
    // water-lily panorama across the atrium's north wall (F2 level)
    {
      const lk = PM.texMat("pm2_lilies", PM.liliesTex(), {
        rough: 0.8,
        vc: true,
      });
      F.box("walnut", -9.1, 6.3, -21.95, 9.1, 10.2, -21.8, { seg: false });
      b.quad(lk, X(0), oy + 8.25, Z(-21.75), 18, 3.7, {
        ry: 0,
        grime: 0.2,
        noAO: true,
      });
      b.quad(
        PM.labelKey(
          "moma_lilies",
          [
            "WATER LILIES (panorama)",
            "Oil on canvas",
            "Damage: one Brute, one tantrum",
          ],
          "label",
          512,
          256,
        ),
        X(9.9),
        oy + F2 + 1.4,
        Z(-21.78),
        0.9,
        0.45,
        { ry: 0 },
      );
    }
    // atrium floor clutter: fallen glass, a toppled bench, blood trail, mattress nest near the obelisk
    D.rubble(b, X(-1.5), oy, Z(-10.5), 0.6, 8, 21);
    for (let i = 0; i < 20; i++)
      b.box(
        "glass_broken",
        X((r() - 0.5) * 10),
        oy + 0.01,
        Z(-11 + (r() - 0.5) * 8),
        0.3 + r() * 0.5,
        0.02,
        0.2 + r() * 0.3,
        { ry: r() * TAU, seg: false, noAO: true },
      );
    PM.nest(b, X(-8), oy + 0.01, Z(-18), 0.4);
    PM.bonePile(b, X(-6.5), oy, Z(-19.5), 1.2, 16, 22);
    // --- WEST WING: "THE ATOMIC AGE" special exhibition ---
    b.quad(
      PM.labelKey(
        "moma_atomic",
        [
          "THE ATOMIC AGE",
          "Art of Tomorrow, 1945–1967",
          "Presented by Civil Defense Industries",
          '"Prepare for the Future!"',
        ],
        "label",
        768,
        320,
      ),
      X(-12.25),
      oy + 3.4,
      Z(9),
      2.6,
      1.08,
      { ry: -HP },
    );
    PM.canvas(b, 8, X(-29.95), oy + 2.4, Z(6.5), 2.6, 2.6, HP, {});
    PM.canvas(b, 9, X(-18), oy + 2.4, Z(11.75), 2.4, 2.4, PI, {});
    PM.canvas(b, 10, X(-24), oy + 2.3, Z(-13.95), 2.4, 2.4, 0, {});
    PM.canvas(b, 1, X(-18), oy + 2.3, Z(-13.95), 3.0, 2.0, 0, {});
    // central plinths: a giant cola bottle, a painted patrolman head, a glowing atom sculpture
    {
      F.solid("marble_white", -22, 0, -2, -19, 0.7, 1);
      const bx = X(-20.5),
        bz = Z(-0.5);
      b.lathe(
        "paint_red",
        [
          [0.02, 0],
          [0.55, 0.05],
          [0.6, 0.6],
          [0.45, 1.6],
          [0.52, 2.2],
          [0.3, 2.9],
          [0.2, 3.3],
          [0.22, 3.45],
          [0.01, 3.5],
        ],
        14,
        bx,
        oy + 0.7,
        bz,
        {},
      );
      b.cyl("white_steel", bx, oy + 1.8, bz, 0.52, 0.52, 0.5, 14, { hSeg: 1 });
      F.solid("marble_white", -25, 0, -9.5, -23.4, 1.1, -7.9);
      b.sphere("paint_teal", X(-24.2), oy + 1.55, Z(-8.7), 0.42, { sy: 0.9 });
      b.cyl("lamp_red", X(-24.2), oy + 1.6, Z(-8.3), 0.1, 0.1, 0.1, 8, {
        hSeg: 1,
        rx: HP,
      });
      F.solid("marble_white", -17.2, 0, -9.5, -15.6, 1.0, -7.9);
      const ax = X(-16.4),
        az = Z(-8.7);
      b.sphere("lamp_green", ax, oy + 2.0, az, 0.18, {});
      for (let k = 0; k < 3; k++)
        b.add("lamp_green", new THREE.TorusGeometry(0.62, 0.035, 5, 28), {
          m: PM.m4(ax, oy + 2.0, az, k * 1.05, 1.1, 0),
          noAO: true,
        });
      PM.glow(P(-16.4, 2.0, -8.7), 0x80ff80, 2.2, root, {
        intensity: 1.4,
        flicker: 0.1,
      });
      b.quad(
        PM.labelKey(
          "moma_atom",
          [
            "OUR FRIEND THE ATOM",
            "Neon, steel, uranium glass",
            "Lent by American Automaton Co.",
            "Please do not lick",
          ],
          "label",
          512,
          256,
        ),
        X(-16.4),
        oy + 0.5,
        Z(-7.88),
        0.8,
        0.4,
        { ry: 0 },
      );
    }
    // mushroom-cloud neon on the south wall
    {
      const nx = -24,
        nz = 11.95;
      b.add("lamp_red", new THREE.TorusGeometry(0.9, 0.05, 5, 24), {
        m: PM.m4(X(nx), oy + 3.2, Z(nz - 0.05), 0, 0, 0, 1.6, 0.8, 1),
        noAO: true,
      });
      b.box("lamp_red", X(nx), oy + 1.0, Z(nz - 0.05), 0.08, 1.7, 0.05, {
        seg: false,
        noAO: true,
      });
      b.box("lamp_red", X(nx), oy + 0.95, Z(nz - 0.05), 2.4, 0.06, 0.05, {
        seg: false,
        noAO: true,
      });
      PM.glow(P(nx, 2.6, nz - 0.3), 0xff5090, 2.4, root, {
        intensity: 1.2,
        flicker: 0.2,
      });
    }
    // stair S1 (west wing → F2) with glass balustrade
    PM.stairs(b, "oak_floor", X(-28.6), Z(1.5), PI, 2.4, 8.9, oy, oy + F2, {
      base: oy - 0.1,
    });
    F.rail(
      [
        [-27.25, 1.5, 0],
        [-27.25, -7.4, F2],
      ],
      0,
      1.0,
      "white_steel",
    );
    F.rail(
      [
        [-27.2, 1.7],
        [-27.2, -5.2],
      ],
      F2,
      1.0,
      "white_steel",
    );
    F.rail(
      [
        [-30, 1.7],
        [-27.2, 1.7],
      ],
      F2,
      1.0,
      "white_steel",
    );
    // --- loading dock (west wing north) & freight elevator ---
    W("gallery", "x", -30, -12, -14.2, -13.8, 0, F2 - 0.4, [
      { c: -20, w: 2.4, y0: 0, h: 3.0 },
    ]);
    F.box("concrete", -30, 0.01, -22, -12, 0.03, -14, {
      seg: false,
      grime: 0.8,
    });
    D.crates(b, X(-15), oy, Z(-20.5), 3, 31);
    D.crates(b, X(-16.3), oy, Z(-20.6), 2, 32);
    F.solid("planks", -27, 0, -16, -24.6, 0.2, -14.8);
    for (let i = 0; i < 2; i++)
      b.box("crate", X(-25.8), oy + 0.2 + i * 1.1, Z(-15.4), 2.2, 1.1, 1.0, {
        seg: false,
        grime: 0.5,
      }); // painting crates
    b.quad(
      PM.labelKey(
        "moma_crate",
        ["FRAGILE — ART", "LOAN: MoMA → CIVIL DEFENSE ARCHIVE", "DO NOT TIP"],
        "brute",
        512,
        256,
      ),
      X(-25.8),
      oy + 1.3,
      Z(-14.88),
      1.4,
      0.7,
      { ry: 0 },
    );
    F.box("black_steel", -30, 0, -19.3, -29.8, 3.2, -16.7, { seg: false });
    F.box("rust", -29.85, 0, -19.1, -29.75, 3.0, -16.9, { seg: false });
    b.quad(
      PM.labelKey(
        "moma_freight",
        ["FREIGHT ELEVATOR", "1 — DOCK · 3 — STORAGE", "Art handlers only"],
        "label",
        512,
        256,
      ),
      X(-29.7),
      oy + 3.5,
      Z(-18),
      1.2,
      0.6,
      { ry: HP },
    );
    A.dock_elevator = AN(-28, 0, -18, -HP);
    // café (east wing): counter, espresso machine, tables, menu, design-store shelving
    F.solid("white_steel", 14, 0, -20.5, 22, 1.05, -19.5);
    F.box("marble_white", 13.9, 1.05, -20.6, 22.1, 1.1, -19.4, { seg: false });
    b.box("chrome", X(16), oy + 1.1, Z(-20.2), 0.8, 0.5, 0.45, { seg: false });
    for (let i = 0; i < 6; i++)
      b.cyl(
        r() < 0.5 ? "paint_cream" : "glass_dark",
        X(17 + i * 0.6),
        oy + 1.1,
        Z(-20 + (r() - 0.5) * 0.4),
        0.05,
        0.04,
        0.1,
        6,
        { hSeg: 1 },
      );
    D.shelf(b, X(18), oy, Z(-21.7), 0, 5, 3, 41);
    b.quad(
      PM.labelKey(
        "moma_menu",
        [
          "CAFÉ 2",
          "Espresso ...... 3.50",
          "Radiation-free Water .... 9.00",
          "Soup of the Day ... it is always",
          "the same day now",
        ],
        "label",
        512,
        320,
      ),
      X(24),
      oy + 2.6,
      Z(-21.95),
      1.8,
      1.12,
      { ry: 0 },
    );
    for (const [x, z] of [
      [16, -14],
      [20, -15],
      [24, -13],
      [17, -8],
      [22, -7.5],
      [26, -6],
    ]) {
      b.cyl("white_steel", X(x), oy, Z(z), 0.05, 0.25, 0.72, 8, { hSeg: 1 });
      b.cyl("marble_white", X(x), oy + 0.72, Z(z), 0.45, 0.45, 0.04, 14, {
        hSeg: 1,
      });
      PM.col(X(x), Z(z), 0.9, 0.9, oy, oy + 0.76, 0, { walkable: false });
      for (let k = 0; k < 2; k++)
        D.chair(
          b,
          X(x + (k ? 0.8 : -0.8)),
          oy,
          Z(z + (r() - 0.5) * 0.4),
          k ? -HP : HP,
          r() < 0.3,
          "white_steel",
        );
    }
    for (let i = 0; i < 3; i++)
      D.shelf(b, X(15 + i * 5), oy, Z(10.8), PI, 4, 3, 50 + i);
    b.quad(
      PM.labelKey(
        "moma_store",
        [
          "MoMA DESIGN STORE",
          "Good design is timeless.",
          "So, apparently, are we.",
        ],
        "label",
        512,
        256,
      ),
      X(21),
      oy + 3.6,
      Z(11.75),
      2.6,
      1.3,
      { ry: PI },
    );
    A.cafe = AN(21, 0, -10, 0);
    // --- ground floor spawns & anchors ---
    A.atrium = AN(-4, 0, -16, 0);
    A.atomic = AN(-20, 0, 4, 0);

    // ================= SECOND FLOOR =================
    // atrium edges: glass balustrades; bridge across the atrium (z -12.2..-9.3)
    F.glassRail(-12, -12.2, 12, -12.2, F2, {});
    F.glassRail(-12, -9.3, 12, -9.3, F2, {});
    F.glassRail(-12, 0, 12, 0, F2, {}); // mezzanine edge over the lobby
    // F2 walls: x = ±12 walls (gallery wings) with atrium windows + bridge doors + mezzanine doors
    W("gallery", "z", -22, 12, -12.2, -11.8, F2, F3 - 0.4, [
      { c: -17.5, w: 7, y0: F2 + 1.0, h: 2.6 },
      { c: -10.75, w: 2.9, y0: F2, h: 3.0 },
      { c: -4.5, w: 6, y0: F2 + 1.0, h: 2.6 },
      { c: 6, w: 3, y0: F2, h: 3.0 },
    ]);
    W("gallery", "z", -22, 12, 11.8, 12.2, F2, F3 - 0.4, [
      { c: -17.5, w: 7, y0: F2 + 1.0, h: 2.6 },
      { c: -10.75, w: 2.9, y0: F2, h: 3.0 },
      { c: -4.5, w: 6, y0: F2 + 1.0, h: 2.6 },
      { c: 6, w: 3, y0: F2, h: 3.0 },
    ]);
    // west galleries: partition z = -5 with a doorway
    W("gallery", "x", -27.2, -12, -5.2, -4.8, F2, F3 - 0.4, [
      { c: -21, w: 2.6, y0: F2, h: 3.2 },
    ]);
    // Painting & Sculpture I (x -30..-12, z -5..12)
    const art = (i, x, y, z, w, h, ry, o) =>
      PM.canvas(b, i, X(x), oy + y, Z(z), w, h, ry, o || {});
    art(0, -29.95, F2 + 2.3, 8.5, 1.8, 2.2, HP);
    art(2, -29.95, F2 + 2.4, 4.4, 2.4, 3.0, HP);
    art(1, -21, F2 + 2.4, 11.75, 5.0, 2.6, PI);
    art(3, -12.25, F2 + 2.4, 3, 2.4, 3.0, -HP);
    art(12, -16, F2 + 2.3, -4.75, 2.2, 1.8, 0);
    art(13, -26, F2 + 2.3, -4.75, 1.8, 1.8, 0);
    for (const [x, z, i] of [
      [-29.9, 8.5, 0],
      [-29.9, 4.4, 1],
      [-21, 11.7, 2],
    ])
      b.quad(
        PM.labelKey(
          "moma_p" + i,
          [
            [
              "COMPOSITION IN RED, BLUE & A LITTLE PANIC",
              "THE DRIP (No. 31½)",
              "MURAL, EXPANDED",
            ][i],
            "Oil on canvas",
            [
              "Gift of the artist's estate",
              "Purchase, 1950",
              "Anonymous loan (please return)",
            ][i],
          ],
          "label",
          512,
          256,
        ),
        X(x + (i === 2 ? 3.2 : 0.05)),
        oy + F2 + 1.2,
        Z(z + (i === 2 ? -0.05 : 1.8)),
        0.6,
        0.3,
        { ry: i === 2 ? PI : HP },
      );
    for (const [x, z] of [
      [-21, 3.5],
      [-21, -1],
    ]) {
      F.solid(
        "leather_brown",
        x - 1.4,
        F2,
        z - 0.35,
        x + 1.4,
        F2 + 0.45,
        z + 0.35,
      );
    }
    PM.spotTrack(b, X(-28), Z(3), X(-14), Z(3), oy + F3 - 0.5, true);
    PM.spotTrack(b, X(-28), Z(8), X(-14), Z(8), oy + F3 - 0.5, false);
    // Painting & Sculpture II (x -30..-12, z -22..-5): the room the critics "improved"
    art(4, -29.95, F2 + 2.4, -13, 2.4, 2.4, HP);
    art(5, -21, F2 + 2.4, -21.75, 2.2, 2.2, 0);
    art(7, -26, F2 + 2.4, -21.75, 2.2, 2.2, 0);
    art(14, -16, F2 + 2.4, -21.75, 2.6, 2.6, 0, { tilt: 0.06 });
    art(15, -12.25, F2 + 2.2, -19.8, 1.6, 1.6, -HP);
    art(11, -29.95, F2 + 2.2, -10.5, 2.4, 1.6, HP);
    b.quad(
      PM.labelKey(
        "moma_mut1",
        ["SOFTLING No. 12", "MEDIUM: SOFTLING", "CRITIC SAYS:", "MASTERPIECE"],
        "brute",
        512,
        320,
      ),
      X(-16),
      oy + F2 + 0.9,
      Z(-21.78),
      0.8,
      0.5,
      { ry: 0 },
    );
    b.quad(
      PM.labelKey(
        "moma_mut2",
        ["THIS ONE EMPTY.", "CRITIC FIX IT."],
        "brute",
        512,
        256,
      ),
      X(-12.28),
      oy + F2 + 0.9,
      Z(-19.8),
      0.7,
      0.35,
      { ry: -HP },
    );
    // a "sculpture" of stacked chairs and a skeleton, blood on the floor
    for (let k = 0; k < 4; k++)
      D.chair(
        b,
        X(-22 + (r() - 0.5) * 0.4),
        oy + F2 + k * 0.5,
        Z(-13 + (r() - 0.5) * 0.4),
        r() * TAU,
        false,
        "white_steel",
      );
    PM.skeleton(b, X(-20), oy + F2 + 0.02, Z(-10), 2.2);
    PM.bonePile(b, X(-26), oy + F2, Z(-18), 1.0, 12, 23);
    PM.nest(b, X(-24), oy + F2 + 0.01, Z(-19), HP);
    // the fallen Nocturne label (the painting is in storage — see the curators' terminal)
    b.quad(
      PM.labelKey(
        "moma_noct_label",
        [
          "NOCTURNE FOR A DYING CITY",
          "Aldous Penrose (American, b. 1921)",
          "Oil on canvas, 1966. Acquired 1967.",
          "TEMPORARILY REMOVED FOR CONSERVATION",
        ],
        "label",
        512,
        256,
      ),
      X(-29.9),
      oy + F2 + 1.6,
      Z(-17.5),
      1.0,
      0.5,
      { ry: HP },
    );
    F.box("paint_cream", -29.98, F2 + 2.0, -18.8, -29.92, F2 + 4.2, -16.2, {
      seg: false,
      c: 0xf6f4ee,
    }); // clean patch where it hung
    // mezzanine (over the lobby): sculpture pedestals, long bench
    for (const [x, z, k] of [
      [-6, 6, 0],
      [0, 8, 1],
      [6, 6, 2],
    ]) {
      F.solid("marble_white", x - 0.6, F2, z - 0.6, x + 0.6, F2 + 1.1, z + 0.6);
      if (k === 0)
        b.lathe(
          "bronze",
          [
            [0.01, 0],
            [0.18, 0.05],
            [0.12, 0.6],
            [0.16, 1.0],
            [0.08, 1.5],
            [0.14, 1.65],
            [0.01, 1.8],
          ],
          10,
          X(x),
          oy + F2 + 1.1,
          Z(z),
          {},
        );
      if (k === 1)
        for (let i = 0; i < 3; i++)
          b.sphere(
            "bronze",
            X(x + (i - 1) * 0.25),
            oy + F2 + 1.3 + i * 0.12,
            Z(z),
            0.2 + i * 0.05,
            { sy: 0.7, sx: 1.3 },
          );
      if (k === 2)
        b.add("bronze", new THREE.TorusKnotGeometry(0.28, 0.08, 40, 6), {
          m: PM.m4(X(x), oy + F2 + 1.55, Z(z)),
        });
    }
    A.mezz = AN(0, F2, 5, 0);
    // --- CRITICS' SALON (F2 east, x 12..30): the Brute den ---
    F.box("dirt", 12, F2 + 0.01, -22, 30, F2 + 0.04, 12, {
      seg: false,
      grime: 0.9,
    });
    PM.fireBarrel(b, X(18), oy + F2, Z(-4), root);
    PM.fireBarrel(b, X(24), oy + F2, Z(6), root);
    PM.meatRack(b, X(26), oy + F2, Z(-2), HP, 3.6, 4, 61);
    PM.nest(b, X(15), oy + F2 + 0.01, Z(8), 0.2);
    PM.nest(b, X(28), oy + F2 + 0.01, Z(9.5), HP);
    PM.nest(b, X(15), oy + F2 + 0.01, Z(-17), -0.3);
    PM.bonePile(b, X(20), oy + F2, Z(9), 1.4, 20, 62);
    // the critics' "exhibition": skeleton in a gilt frame, a canvas of handprints, a row of review placards
    {
      F.box("gilt_dull", 29.6, F2 + 0.8, 1.2, 29.9, F2 + 3.6, 3.8, {
        seg: false,
      });
      F.box("damask", 29.55, F2 + 0.95, 1.35, 29.6, F2 + 3.45, 3.65, {
        seg: false,
        c: 0x5a3a3a,
      });
      const sk = PM.m4(X(29.4), oy + F2 + 2.2, Z(2.5), -HP, HP * 0.98, 0);
      b.add("bone", new THREE.SphereGeometry(0.11, 7, 5), {
        m: new THREE.Matrix4().multiplyMatrices(sk, PM.m4(0, 0.1, -0.8)),
      });
      for (let i = 0; i < 5; i++)
        b.add("bone", new THREE.TorusGeometry(0.13, 0.012, 3, 8, PI), {
          m: new THREE.Matrix4().multiplyMatrices(
            sk,
            PM.m4(0, 0.06, -0.55 + i * 0.07, 0, HP),
          ),
        });
      for (const sx of [-0.12, 0.12])
        b.add("bone", new THREE.CylinderGeometry(0.02, 0.02, 0.9, 4), {
          m: new THREE.Matrix4().multiplyMatrices(
            sk,
            PM.m4(sx, 0.05, 0.3, 0, HP),
          ),
        });
      b.quad(
        PM.labelKey(
          "moma_self",
          [
            "SELF PORTRAIT OF SOFTLING",
            "SOFTLING (DEAD)",
            "CRITIC SAYS: TOO THIN. 2 STARS.",
          ],
          "brute",
          512,
          256,
        ),
        X(29.55),
        oy + F2 + 0.55,
        Z(2.5),
        1.0,
        0.5,
        { ry: -HP },
      );
      art(14, 12.25, F2 + 2.4, -2, 2.6, 2.6, HP, { tilt: -0.04 });
      b.quad(
        PM.labelKey(
          "moma_rules",
          [
            "CRITIC RULES",
            "1. ART GOES ON WALL",
            "2. SOFTLING GOES IN ART",
            "3. NO TOUCH CRITIC BERET",
          ],
          "brute",
          512,
          400,
        ),
        X(12.3),
        oy + F2 + 2.2,
        Z(5),
        1.6,
        1.25,
        { ry: HP },
      );
    }
    PM.sandbags(b, X(13.2), Z(-10.6), X(13.2), Z(-8), 2, { y: oy + F2 });
    A.salon = AN(21, F2, -2, 0);
    // stair S2 (F2 → F3) along the east wall
    PM.stairs(
      b,
      "oak_floor",
      X(28.4),
      Z(-2.0),
      PI,
      2.4,
      9.0,
      oy + F2,
      oy + F3,
      { base: oy + F2 - 0.1 },
    );
    F.rail(
      [
        [27.15, -2.0, F2],
        [27.15, -11.0, F3],
      ],
      F2,
      1.0,
      "white_steel",
    );
    F.rail(
      [
        [27.1, -11.2],
        [27.1, -1.8],
      ],
      F3,
      1.0,
      "white_steel",
    );
    F.rail(
      [
        [27.1, -1.8],
        [30, -1.8],
      ],
      F3,
      1.0,
      "white_steel",
    );

    // ================= THIRD FLOOR =================
    F.glassRail(-12, 0, 12, 0, F3, {});
    W("gallery", "z", -22, 12, -12.2, -11.8, F3, ROOF, [
      { c: -12, w: 14, y0: F3 + 1.0, h: 2.8 },
      { c: 6, w: 3, y0: F3, h: 3.0 },
    ]);
    W("gallery", "z", -22, 12, 11.8, 12.2, F3, ROOF, [
      { c: -12, w: 14, y0: F3 + 1.0, h: 2.8 },
      { c: 6, w: 3, y0: F3, h: 3.0 },
    ]);
    F.glassRail(-12.1, -19, -12.1, -5, F3 + 0.9, { glass: "glass_dark" });
    F.glassRail(12.1, -19, 12.1, -5, F3 + 0.9, { glass: "glass_dark" });
    // --- Architecture & Design (east) ---
    {
      // the Strato-Eight concept car on a turntable
      const cx = 20,
        cz = -7;
      b.cyl("white_steel", X(cx), oy + F3, Z(cz), 3.2, 3.2, 0.25, 24, {
        hSeg: 1,
      });
      PM.col(X(cx), Z(cz), 5.6, 5.6, oy + F3, oy + F3 + 0.25, 0, {
        surface: "metal",
      });
      PM.car(b, X(cx), oy + F3 + 0.25, Z(cz), 0.6, {
        paint: "paint_teal",
        seed: 77,
      });
      b.quad(
        PM.labelKey(
          "moma_strato",
          [
            "STRATO-EIGHT ATOMIC V8 (concept)",
            "Aerodyne Motors, 1962",
            "Top speed: yes",
            "Fuel: do not ask",
          ],
          "label",
          512,
          256,
        ),
        X(cx),
        oy + F3 + 0.6,
        Z(cz + 3.25),
        1.0,
        0.5,
        { ry: 0 },
      );
      // cola bottle evolution vitrine
      PM.vitrine(b, X(26.5), oy + F3, Z(2), 3.2, 0.8, 0.7, 0);
      for (let i = 0; i < 7; i++)
        b.lathe(
          i === 6 ? "lamp_blue" : "glass_dark",
          [
            [0.01, 0],
            [0.06, 0.01],
            [0.07, 0.1],
            [0.05, 0.2],
            [0.025, 0.28],
            [0.025, 0.32],
            [0.01, 0.33],
          ],
          8,
          X(25.1 + i * 0.45),
          oy + F3 + 0.92,
          Z(2),
          { sy: 0.8 + i * 0.05 },
        );
      b.quad(
        PM.labelKey(
          "moma_bottle",
          [
            "THE FIZZO COLA BOTTLE: 1934–1967",
            "Seven generations of the rocket-shaped bottle.",
            "The blue one glows. That is not a design choice.",
          ],
          "label",
          512,
          256,
        ),
        X(26.5),
        oy + F3 + 0.5,
        Z(2.42),
        1.0,
        0.5,
        { ry: 0 },
      );
      // mister-handy-like prototype on a plinth
      F.solid("marble_white", 14.4, F3, 3.4, 16, F3 + 0.8, 5);
      b.sphere("chrome", X(15.2), oy + F3 + 1.5, Z(4.2), 0.42, {});
      for (let k = 0; k < 3; k++) {
        const a = (k / 3) * TAU;
        b.beam(
          "chrome",
          P(15.2 + Math.cos(a) * 0.3, F3 + 1.6, 4.2 + Math.sin(a) * 0.3),
          P(15.2 + Math.cos(a) * 0.55, F3 + 2.1, 4.2 + Math.sin(a) * 0.55),
          0.04,
          0.04,
          {},
        );
        b.sphere(
          "paint_cream",
          X(15.2 + Math.cos(a) * 0.55),
          oy + F3 + 2.15,
          Z(4.2 + Math.sin(a) * 0.55),
          0.08,
          {},
        );
      }
      b.cyl("fire", X(15.2), oy + F3 + 0.85, Z(4.2), 0.08, 0.16, 0.22, 8, {
        hSeg: 1,
        noAO: true,
      });
      // shelter architectural model under glass
      PM.vitrine(b, X(21), oy + F3, Z(7.5), 3.6, 2.4, 0.9, 0);
      b.cyl("vault_steel", X(21), oy + F3 + 0.92, Z(7.5), 0.9, 0.9, 0.12, 20, {
        hSeg: 1,
        rz: HP * 0.0,
      });
      for (let i = 0; i < 6; i++)
        b.box(
          i % 2 ? "paint_cream" : "panel",
          X(20 + (i % 3) * 0.7),
          oy + F3 + 0.92,
          Z(7 + Math.floor(i / 3) * 0.7),
          0.6,
          0.25,
          0.6,
          { seg: false },
        );
      b.quad(
        PM.labelKey(
          "moma_vault",
          [
            "CIVIL DEFENSE SHELTER — PRESENTATION MODEL",
            "Civil Defense Architectural Division, 1963",
            '"Ask about a shelter in YOUR neighbourhood!"',
          ],
          "label",
          512,
          256,
        ),
        X(21),
        oy + F3 + 0.5,
        Z(8.72),
        1.0,
        0.5,
        { ry: 0 },
      );
      // wall of chairs (design classics) on brackets
      for (let i = 0; i < 5; i++) {
        D.chair(
          b,
          X(29.5),
          oy + F3 + 1.6,
          Z(-3 + i * 1.6),
          -HP,
          false,
          i % 2 ? "red_steel" : "white_steel",
        );
        b.box(
          "black_steel",
          X(29.8),
          oy + F3 + 1.55,
          Z(-3 + i * 1.6),
          0.3,
          0.05,
          0.5,
          { seg: false },
        );
      }
      PM.spotTrack(b, X(14), Z(-2), X(28), Z(-2), oy + ROOF - 0.5, true);
      A.design = AN(21, F3, -12, 0);
    }
    // --- Photography (over the lobby) ---
    {
      const pk = PM.photoKey();
      for (let i = 0; i < 8; i++) {
        const x = -10 + i * 2.8,
          onN = i % 2 === 0;
        b.box("black_steel", X(x), oy + F3 + 1.3, Z(11.9), 1.3, 1.3, 0.05, {
          seg: false,
        });
        b.quad(pk, X(x), oy + F3 + 1.95, Z(11.86), 1.1, 1.1, {
          ry: PI,
          uvRect: [
            (i % 2) * 0.5,
            Math.floor((i % 4) / 2) * 0.5,
            (i % 2) * 0.5 + 0.5,
            Math.floor((i % 4) / 2) * 0.5 + 0.5,
          ],
        });
        void onN;
      }
      b.quad(
        PM.labelKey(
          "moma_photo",
          [
            "THE CITY, 1900–1967",
            "Photographs from the collection",
            "Several of these places still exist.",
            "Most do not.",
          ],
          "label",
          512,
          256,
        ),
        X(-11.7),
        oy + F3 + 1.8,
        Z(8),
        1.2,
        0.6,
        { ry: HP },
      );
      F.solid("leather_brown", -3, F3, 5.2, 3, F3 + 0.45, 5.8);
      A.photo = AN(0, F3, 7, 0);
    }
    // --- Curatorial offices (F3 west, z -5..12) ---
    W("gallery", "x", -30, -12, -5.2, -4.8, F3, ROOF, [
      { c: -21, w: 2.6, y0: F3, h: 3.2 },
    ]);
    W("cream_plaster", "z", -4.8, 12, -21.2, -20.8, F3, F3 + 3.2, [
      { c: 6, w: 1.2, y0: F3, h: 2.3 },
    ]);
    F.box("carpet", -30, F3 + 0.01, -4.8, -12, F3 + 0.03, 12, {
      seg: false,
      grime: 0.8,
    });
    for (const [x, z, ry] of [
      [-26, 2, 0],
      [-26, 8, 0],
      [-16, 3, PI],
    ]) {
      F.solid("walnut", x - 1.0, F3, z - 0.45, x + 1.0, F3 + 0.76, z + 0.45);
      D.monitor(b, X(x - 0.4), oy + F3 + 0.76, Z(z), ry, x === -16);
      D.papers(b, X(x), oy + F3 + 0.77, Z(z), 0.5, 6, x * 7 + z);
      D.chair(
        b,
        X(x),
        oy + F3,
        Z(z + (ry ? -0.9 : 0.9)),
        ry ? 0 : PI,
        r() < 0.4,
        "leather_brown",
      );
    }
    for (let i = 0; i < 4; i++)
      PM.bookcase(
        b,
        X(-29.95),
        Z(-4.4 + i * 2.2),
        X(-29.95),
        Z(-2.4 + i * 2.2),
        oy + F3,
        oy + F3 + 2.4,
        HP,
        { depth: 0.4, frame: "walnut" },
      );
    PM.skeleton(b, X(-18), oy + F3 + 0.03, Z(8.5), 1.2);
    b.quad(
      PM.labelKey("moma_staff", ["CURATORIAL — STAFF ONLY"], "label", 512, 96),
      X(-12.25),
      oy + F3 + 2.6,
      Z(6),
      1.6,
      0.3,
      { ry: -HP },
    );
    A.curator_terminal = AN(-16.4, F3 + 0.76, 3, PI);
    A.offices = AN(-21, F3, 4, 0);
    // --- Collection Storage (F3 west, z -22..-5): locked reward room ---
    F.box("concrete", -30, F3 + 0.01, -22, -12, F3 + 0.03, -5.2, {
      seg: false,
      grime: 0.6,
    });
    for (let k = 0; k < 4; k++) {
      // sliding painting racks (steel mesh screens hung with canvases)
      const z = -20 + k * 3.3;
      F.box("net", -27.5, F3 + 0.1, z - 0.04, -15, F3 + 3.6, z + 0.04, {
        seg: false,
        grime: 0.3,
      });
      F.box(
        "black_steel",
        -27.6,
        F3 + 3.6,
        z - 0.08,
        -14.9,
        F3 + 3.75,
        z + 0.08,
        { seg: false },
      );
      PM.colMM(
        X(-27.5),
        oy + F3,
        Z(z - 0.1),
        X(-15),
        oy + F3 + 3.7,
        Z(z + 0.1),
        { walkable: false },
      );
      for (let i = 0; i < 4; i++)
        PM.canvas(
          b,
          (k * 4 + i + 3) % 14,
          X(-26 + i * 3),
          oy + F3 + 1.9,
          Z(z + 0.06),
          1.4 + r() * 0.8,
          1.2 + r() * 0.6,
          0,
          { frame: r() < 0.5 ? "gilt_dull" : null },
        );
    }
    D.crates(b, X(-13.5), oy + F3, Z(-20.5), 2, 81);
    D.crates(b, X(-13.4), oy + F3, Z(-18.6), 1, 82);
    // the conservation easel with THE painting (quest pickup placed on its ledge)
    {
      const ex = -19,
        ez = -6.6;
      for (const sg of [-1, 1])
        b.beam(
          "walnut",
          P(ex + sg * 0.5, F3, ez + 0.3),
          P(ex + sg * 0.15, F3 + 2.6, ez),
          0.06,
          0.06,
          {},
        );
      b.beam(
        "walnut",
        P(ex, F3, ez - 0.6),
        P(ex, F3 + 2.4, ez - 0.05),
        0.06,
        0.06,
        {},
      );
      b.box("walnut", X(ex), oy + F3 + 0.9, Z(ez + 0.1), 1.4, 0.08, 0.2, {
        seg: false,
      });
      A.nocturne = AN(ex, F3 + 1.0, ez + 0.12, 0);
      b.quad(
        PM.labelKey(
          "moma_cons",
          [
            "CONSERVATION",
            'Penrose — "Nocturne" — surface cleaning',
            "DO NOT MOVE. DO NOT LET THE BIG ONES SEE IT.",
          ],
          "label",
          512,
          256,
        ),
        X(ex + 1.3),
        oy + F3 + 1.5,
        Z(ez + 0.05),
        0.7,
        0.35,
        { ry: 0 },
      );
    }
    PM.skeleton(b, X(-22.5), oy + F3 + 0.03, Z(-7.5), -0.6);
    A.storage_safe = AN(-29.5, F3, -13, -HP);
    A.storage = AN(-21, F3, -10, 0);
    b.quad(
      PM.labelKey(
        "moma_freight3",
        ["FREIGHT ELEVATOR — STORAGE LEVEL"],
        "label",
        512,
        96,
      ),
      X(-29.7),
      oy + F3 + 3.3,
      Z(-18),
      1.6,
      0.3,
      { ry: HP },
    );
    F.box("black_steel", -30, F3, -19.3, -29.8, F3 + 3.2, -16.7, {
      seg: false,
    });
    A.storage_elevator = AN(-28, F3, -18, -HP);

    // ================= THE SCULPTURE GARDEN (z -46..-22) =================
    {
      const G0 = -46;
      F.slab("granite", -30, G0, 30, -22, 0, [], { th: 0.3, grime: 0.6 });
      // raised north terrace with steps
      F.solid("granite_dark", -30, 0, G0, 30, 0.9, -42);
      for (let k = 0; k < 3; k++) {
        F.box(
          "granite",
          -8,
          0,
          -42 + k * 0.4,
          8,
          0.9 - k * 0.3,
          -41.6 + k * 0.4,
          { seg: false, grime: 0.5 },
        );
        F.col(-8, 0, -42 + k * 0.4, 8, 0.9 - k * 0.3, -41.6 + k * 0.4, {});
      }
      // garden walls (W, E, N) with ivy-grime, and the building's glass north facade (south side of the garden)
      W("concrete", "z", G0, -22, -30.6, -30.2, 0, 7, []);
      W("concrete", "z", G0, -22, 30.2, 30.6, 0, 7, []);
      W("concrete", "x", -30.6, 30.6, G0 - 0.4, G0, 0, 7, []);
      F.box("moss", -30.2, 0.5, G0, 30.2, 5.5, G0 + 0.06, {
        seg: false,
        grime: 0.8,
      });
      // pools of toxic water
      for (const [x0, z0, x1, z1] of [
        [-18, -40, -4, -35],
        [6, -31, 18, -27],
      ]) {
        F.box("goo", x0, 0.26, z0, x1, 0.3, z1, { seg: false, noAO: true });
        F.col(x0, 0, z0, x1, 0.22, z1, { surface: "water" });
        for (const [a0, b0, a1, b1] of [
          [x0 - 0.35, z0 - 0.35, x1 + 0.35, z0],
          [x0 - 0.35, z1, x1 + 0.35, z1 + 0.35],
          [x0 - 0.35, z0, x0, z1],
          [x1, z0, x1 + 0.35, z1],
        ]) {
          F.box("marble_white", a0, 0, b0, a1, 0.45, b1, { seg: false });
          F.col(a0, 0, b0, a1, 0.45, b1, {});
        }
      }
      try {
        G.world.addRadSource({
          x: X(-11),
          y: oy,
          z: Z(-37.5),
          radius: 7,
          strength: 1.5,
        });
        G.world.addRadSource({
          x: X(12),
          y: oy,
          z: Z(-29),
          radius: 6,
          strength: 1.2,
        });
      } catch (e) {
        /* core */
      }
      // birch groves (dead) in gravel beds
      for (const [x0, x1] of [
        [-28, -21],
        [21, 28],
      ]) {
        F.box("dirt", x0, 0, -40, x1, 0.12, -24, { seg: false, grime: 0.8 });
        for (let i = 0; i < 7; i++)
          PM.deadTree(
            b,
            X(x0 + 1 + r() * (x1 - x0 - 2)),
            oy + 0.1,
            Z(-39 + r() * 14),
            5 + r() * 3,
            i * 13 + x0,
          );
      }
      // sculptures
      const plinth = (x, z, w, d, h) =>
        F.solid(
          "marble_white",
          x - w / 2,
          0,
          z - d / 2,
          x + w / 2,
          h,
          z + d / 2,
        );
      // (a) reclining figure — organic bronze blobs
      plinth(-11, -30, 3.4, 1.4, 0.6);
      {
        const pts = [
          V3(X(-12.4), oy + 0.95, Z(-30)),
          V3(X(-11.6), oy + 1.25, Z(-30.1)),
          V3(X(-10.6), oy + 1.05, Z(-29.9)),
          V3(X(-9.8), oy + 1.5, Z(-30)),
        ];
        b.add(
          "bronze_patina",
          PM.organicTube(pts, (t) => 0.32 + Math.sin(t * PI) * 0.18, {
            radial: 10,
            seg: 12,
          }),
          { grime: 0.3 },
        );
        b.sphere("bronze_patina", X(-12.7), oy + 1.2, Z(-30), 0.22, {});
        b.add("bronze_patina", new THREE.TorusGeometry(0.28, 0.14, 6, 10), {
          m: PM.m4(X(-10.2), oy + 1.4, Z(-30), 0, 0, 0.6),
        });
      }
      // (b) thin walking figure
      plinth(8, -40, 1.0, 1.0, 1.0);
      {
        const bx = X(8),
          bz = Z(-40);
        b.beam(
          "bronze",
          V3(bx - 0.1, oy + 1.0, bz + 0.2),
          V3(bx, oy + 2.1, bz),
          0.07,
          0.07,
          {},
        );
        b.beam(
          "bronze",
          V3(bx + 0.1, oy + 1.0, bz - 0.25),
          V3(bx, oy + 2.1, bz),
          0.07,
          0.07,
          {},
        );
        b.beam(
          "bronze",
          V3(bx, oy + 2.1, bz),
          V3(bx, oy + 3.1, bz),
          0.1,
          0.08,
          {},
        );
        for (const sg of [-1, 1])
          b.beam(
            "bronze",
            V3(bx, oy + 3.0, bz),
            V3(bx + sg * 0.12, oy + 2.2, bz + 0.05),
            0.04,
            0.04,
            {},
          );
        b.sphere("bronze", bx, oy + 3.3, bz, 0.1, { sy: 1.6 });
        b.box("bronze", bx, oy + 1.0, bz, 0.5, 0.12, 0.7, { seg: false });
      }
      // (c) the red stabile: curved steel plates
      {
        const sx = X(20),
          sz = Z(-34);
        for (let k = 0; k < 4; k++)
          b.box(
            "red_steel",
            sx + Math.cos(k * 1.6) * 0.8,
            oy,
            sz + Math.sin(k * 1.6) * 0.8,
            0.08,
            3.5 - k * 0.4,
            1.6,
            { ry: k * 1.6, rz: 0.18 * (k % 2 ? 1 : -1), seg: false },
          );
        b.box("red_steel", sx, oy + 3.0, sz, 2.8, 0.08, 0.6, {
          ry: 0.4,
          rz: 0.2,
          seg: false,
        });
        PM.col(sx, sz, 2.4, 2.4, oy, oy + 3.5, 0, { walkable: false });
      }
      // (d) standing woman, smooth bronze
      plinth(-22, -27, 1.2, 1.2, 0.8);
      b.lathe(
        "bronze_patina",
        [
          [0.01, 0],
          [0.24, 0.05],
          [0.2, 0.6],
          [0.28, 1.0],
          [0.22, 1.25],
          [0.3, 1.45],
          [0.16, 1.7],
          [0.12, 1.8],
          [0.14, 1.95],
          [0.01, 2.1],
        ],
        12,
        X(-22),
        oy + 0.8,
        Z(-27),
        {},
      );
      // (e) THE CRITIC'S CHOICE: "MAN, REARRANGED" — mixed media (man)
      plinth(0, -44, 2.4, 1.6, 1.6);
      for (let k = 0; k < 3; k++)
        PM.skeleton(
          b,
          X(-0.4 + k * 0.4),
          oy + 1.62 + k * 0.12,
          Z(-44),
          k * 1.3,
        );
      b.add("paint_cream", new THREE.CapsuleGeometry(0.2, 0.8, 3, 8), {
        m: PM.m4(X(0.3), oy + 2.4, Z(-44), 0, 0.4, 0.8),
      });
      b.add("tire", new THREE.TorusGeometry(0.4, 0.14, 6, 12), {
        m: PM.m4(X(-0.5), oy + 2.3, Z(-44.1), 0.4, 0.2),
      });
      b.quad(
        PM.labelKey(
          "moma_manrearr",
          [
            "MAN, REARRANGED",
            "MIXED MEDIA (MAN)",
            "THE CRITIC'S CHOICE",
            "ASK CRITIC WHY. CRITIC WILL SHOW YOU.",
          ],
          "brute",
          512,
          320,
        ),
        X(0),
        oy + 1.2,
        Z(-43.18),
        1.2,
        0.75,
        { ry: 0 },
      );
      // Brute camp: fires, meat, cage, nests, scrap tables
      PM.fireBarrel(b, X(-6), oy + 0.9, Z(-43), root);
      PM.fireBarrel(b, X(14), oy, Z(-30.8), root);
      PM.meatRack(b, X(-14), oy + 0.9, Z(-44.5), 0, 4, 5, 91);
      PM.nest(b, X(16), oy + 0.91, Z(-44.5), HP);
      PM.nest(b, X(-22), oy + 0.01, Z(-34), 0.3);
      PM.bonePile(b, X(4), oy, Z(-34.5), 1.5, 24, 92);
      {
        const cx = X(24),
          cz = Z(-43.5);
        for (let k = 0; k < 10; k++) {
          const a = (k / 10) * TAU;
          b.box(
            "rust",
            cx + Math.cos(a) * 1.1,
            oy + 0.9,
            cz + Math.sin(a) * 1.1,
            0.06,
            2.4,
            0.06,
            { seg: false },
          );
        }
        b.cyl("rust", cx, oy + 3.3, cz, 1.15, 1.15, 0.1, 12, { hSeg: 1 });
        PM.col(cx, cz, 2.4, 2.4, oy + 0.9, oy + 3.4, 0, { walkable: false });
        PM.skeleton(b, cx, oy + 0.93, cz, 0.7);
      }
      // backdrop: the city beyond the walls, and the sky
      const sky = PM.texMat("pm2_sky", PM.skyTex(), {
        rough: 1,
        emissive: 0.9,
        noShadow: true,
        side: THREE.DoubleSide,
      });
      b.quad(sky, X(0), oy + 42, Z(-34), 160, 120, {
        rx: HP,
        noAO: true,
        grime: 0,
      });
      const sl = PM.texMat("pm2_skyline", PM.skylineTex(), {
        rough: 1,
        emissive: 0.75,
        noShadow: true,
      });
      b.quad(sl, X(0), oy + 22, Z(-62), 150, 60, {
        ry: 0,
        noAO: true,
        grime: 0,
      });
      b.quad(sl, X(-50), oy + 22, Z(-34), 120, 60, {
        ry: HP,
        noAO: true,
        grime: 0,
      });
      b.quad(sl, X(50), oy + 22, Z(-34), 120, 60, {
        ry: -HP,
        noAO: true,
        grime: 0,
      });
      // the museum's own north face seen from the garden (above the ground-floor glass)
      F.box("black_steel", -30.4, F2 - 0.4, -22.5, 30.4, ROOF + 0.4, -22.4, {
        seg: false,
      });
      for (let y = F2; y < ROOF; y += 1.7)
        F.box("pane", -30, y + 0.2, -22.6, 30, y + 1.5, -22.52, {
          seg: false,
          noAO: true,
          grime: 0.2,
        });
      for (const [x, z, ry] of [
        [-29.6, -40, HP],
        [-29.6, -28, HP],
        [29.6, -40, -HP],
        [29.6, -28, -HP],
        [-14, -45.6, 0],
        [14, -45.6, 0],
      ]) {
        b.box("black_steel", X(x), oy + 2.9, Z(z), 0.3, 0.5, 0.3, {
          seg: false,
        });
        b.box("lamp_warm", X(x), oy + 2.95, Z(z), 0.22, 0.38, 0.22, {
          seg: false,
          noAO: true,
        });
        PM.glow(P(x, 3.15, z), 0xffc070, 1.4, root, {
          intensity: 1.2,
          flicker: 0.08,
        });
      }
      A.garden = AN(0, 0, -30, PI);
      A.boss = AN(3.2, 0.9, -43.4, 0);
    }

    b.build(root);
    return A;
  }

  // ===================================================================
  // CONTENT (items, terminal, notes)
  // ===================================================================
  PM.item({
    id: "pm2_nocturne",
    type: "misc",
    quest: true,
    name: 'Painting: "Nocturne for a Dying City"',
    weight: 4,
    value: 400,
    desc: 'Aldous Penrose, oil on canvas, 1966. A swirling night over the skyline and a green moon that is not a moon. On the back, in crayon: "GOOD. MAKE CRITIC SAD. 5 STARS."',
  });
  PM.item({
    id: "pm2_critics_beret",
    type: "apparel",
    slot: "head",
    name: "The Critic's Beret",
    weight: 0.5,
    value: 180,
    dr: 1,
    attrs: { senses: 1, presence: -1 },
    skills: { persuasion: 10 },
    desc: "A black felt beret stretched over a Brute's skull for years. Wearing it makes you notice everything and like none of it. +1 Senses, −1 Presence, +10 Persuasion.",
  });
  PM.item({
    id: "pm2_moma_key",
    type: "key",
    name: "MoMA Registrar's Key",
    weight: 0,
    value: 0,
    desc: 'A brass key on a lanyard marked "REGISTRAR — COLLECTION STORAGE". The Critic wore it as an earring.',
  });
  PM.item({
    id: "pm2_note_guard",
    type: "note",
    name: "Security Log, Mar. 5",
    title: "MoMA Security — Night Log",
    text: 'MAR 4 — 23:10. Loading dock. Six crates signed out to "Civil Defense, Central Park". Paperwork says LOAN. Driver says "safekeeping". Nobody asked the curators.\n\nMAR 5 — 09:42. Sirens. Visitors sent to the garden, then back inside, then to the garden again. Nobody knows which is safer.\n\n09:47. The sky went white over the Bronx. I have locked Storage. The key is with the registrar. The registrar is on the third floor.\n\n09:49. Tell my wife I finished the crossword. I didn\'t, but tell her anyway.',
  });
  PM.item({
    id: "pm2_note_review",
    type: "note",
    name: 'Brute Scrawl: "REVIEW"',
    title: "REVIEW BY CRITIC (ON BACK OF MUSEUM MAP)",
    text: "HUMAN ART.\n\nSQUARE ONES: TOO SQUARE. 1 STAR.\nDRIPPY ONE: CRITIC ALSO DRIP. RELATE. 3 STARS.\nFLOWER POND ONE: CRITIC HIT IT. NOW BETTER. 4 STARS.\nNIGHT CITY ONE: MAKE CRITIC FEEL... SOMETHING. CRITIC NOT LIKE FEEL. PUT IN STORAGE. 5 STARS.\n\nSOFT ONES WHO VISIT: VERY SQUISHY. MAKE GOOD SCULPTURE.\n\nCRITIC IS BEST CRITIC. OTHER CRITICS ARE FOOD.",
  });
  PM.item({
    id: "pm2_reel_audio",
    type: "tape",
    name: "Tape reel: MoMA Audio Guide, Stop 12",
    title: 'Audio Guide — Stop 12: "Nocturne for a Dying City"',
    text: '[A warm, practised voice.]\n\nStop twelve. Aldous Penrose painted this in the summer of 1966 from the roof of a hotel on 44th Street. Look at the moon. Now look again. Penrose said he wanted to paint the city "the way it will be remembered, by whoever is left to remember it."\n\nCritics called it alarmist. The museum bought it anyway.\n\n[Pause.]\n\nIf you are hearing this during an air-raid drill, please proceed calmly to the Sculpture Garden. Please do not touch the sculptures on your way. Stop thirteen is the gift shop.\n\n[A second voice, close to the microphone, after the tape was meant to end:] Curators — the teletype word this season is NOCTURNE. Do not put it on a label. — Registrar',
    learn: "pm2_term_moma_curator",
  });

  PM.terminal("pm2_term_moma_curator", {
    title: "MoMA CURATORIAL NETWORK",
    header: "Department of Painting & Sculpture — Chief Curator",
    lock: PM.LOCKS.moma_term,
    entries: [
      {
        title: "Registrar's Safe",
        learn: "pm2_moma_safe",
        text: "Registrar's safe, Collection Storage: 1-9-2-9 (the year we opened). Petty cash and the Popular Circuits loan copy.",
      },
      {
        title: "Acquisitions — FY1967",
        text: 'APPROVED: Penrose, Aldous. "Nocturne for a Dying City" (1966). Oil on canvas.\n\nNote from the board: "Too gloomy for the lobby." Note from me: "That is the point." Hung in Painting & Sculpture II, west wall.\n\nUPDATE MAR 2: Moved to Collection Storage for surface cleaning. Someone keeps leaving green fingerprints on the frame.',
      },
      {
        title: 'Memo: Civil Defense "loan"',
        text: 'To: Director\nRe: The Civil Defense archive loan\n\nSix of our finest works are going into a hole under Central Park so that, and I quote the Civil Defense representative, "the future has something to look at." I asked which future. He smiled at me for a very long time.\n\nI have hidden the Penrose in Storage. They are not having the Penrose.',
      },
      {
        title: "Facilities: freight elevator",
        text: "The freight elevator runs between the Loading Dock (1) and Collection Storage (3). Art handlers only. It is also, since the sirens, the only way to the garden that the Big Ones do not guard.",
      },
      {
        title: "Release Collection Storage door",
        text: "Magnetic lock on Collection Storage: RELEASED.\n\nWARNING: climate control offline since 03/05/1967. Canvases may be brittle.",
        action() {
          PM.setFlag("moma_storage_code", true);
          PM.unlockDoor("pm2_moma_storage");
          G.notify("Collection Storage door unlocked.");
        },
      },
    ],
  });

  // ===================================================================
  // BUILDER
  // ===================================================================
  PM.addBuilder(
    "moma",
    function (PM2, site, root) {
      const ext = buildExterior(site, root);
      const cell = PM.cell("moma");
      const int = buildInterior(cell);
      const O = cell.origin;
      // doors: street ↔ lobby; freight elevator dock ↔ storage
      PM.door({
        id: "pm2_moma_enter",
        pos: V3(162, 1.5, FZ - 1.4),
        label: "Museum of Modern Art",
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
      // fix the interior exit target now that the exterior anchor exists
      PM.door({
        id: "pm2_moma_exit",
        pos: V3(O.x, O.y + 1.4, O.z + 11.2),
        label: "53rd Street",
        verb: "Exit",
        radius: 1.4,
        target: { x: ext.door.x, y: 0.05, z: ext.door.z, yaw: PI },
        sound: "door_open",
      });
      PM.door({
        id: "pm2_moma_freight_up",
        pos: V3(O.x - 29.2, O.y + 1.4, O.z - 18),
        label: "Freight Elevator — Storage (3)",
        verb: "Ride",
        radius: 1.2,
        target: {
          x: int.storage_elevator.x + 0.6,
          y: int.storage_elevator.y + 0.05,
          z: int.storage_elevator.z,
          yaw: -HP,
        },
        sound: "door_open",
      });
      PM.door({
        id: "pm2_moma_freight_down",
        pos: V3(O.x - 29.2, O.y + F3 + 1.4, O.z - 18),
        label: "Freight Elevator — Loading Dock (1)",
        verb: "Ride",
        radius: 1.2,
        target: {
          x: int.dock_elevator.x + 0.6,
          y: int.dock_elevator.y + 0.05,
          z: int.dock_elevator.z,
          yaw: -HP,
        },
        sound: "door_open",
      });
      // Collection Storage door (the registrar's key — the Critic wears it — or the curators' teletype release)
      PM.swingDoor({
        id: "pm2_moma_storage",
        x: O.x - 22.3,
        y: O.y + F3,
        z: O.z - 5.0,
        ry: 0,
        w: 2.5,
        h: 3.1,
        t: 0.12,
        key: "vault_dark",
        lock: PM.LOCKS.moma_storage,
        label: "Collection Storage",
        parent: cell.root,
        slide: 2.4,
        openAngle: 1,
      });
      // exterior-side door to the garden from the dock is an opening (same cell) — nothing to add.
      const all = Object.assign({}, int, {
        exterior_entrance: ext.door,
        front: ext.front,
      });
      all.spawn1 = int.atrium;
      all.spawn2 = int.atomic;
      all.spawn3 = int.mezz;
      all.spawn4 = int.salon;
      all.spawn5 = int.design;
      all.spawn6 = int.garden;
      all.loot1 = int.storage_safe;
      all.loot2 = int.cafe;
      all.loot3 = int.offices;
      all.terminal = int.curator_terminal;
      PM.register("moma", root, all, {
        interiorRoot: cell.root,
        interiorKey: "moma",
      });

      // containers, terminal, pickups
      const Q = (a, dx, dy, dz) => ({
        x: a.x + (dx || 0),
        y: a.y + (dy || 0),
        z: a.z + (dz || 0),
      });
      PM.prop(
        "terminal",
        Object.assign(Q(int.curator_terminal, 0, 0, 0), {
          yaw: PI,
          terminalId: "pm2_term_moma_curator",
          id: "pm2_moma_term",
          name: "Curator's Terminal",
        }),
      );
      PM.prop(
        "safe",
        Object.assign(Q(int.storage_safe, 0.3, 0.9, 0), {
          yaw: -HP,
          locked: 0,
          lock: PM.LOCKS.moma_safe,
          items: [
            ["scrip", 180],
            ["old_dollars", 12],
            ["book_popular_circuits", 1],
            ["rally_tonic", 2],
          ],
          loot: "wall_safe",
          id: "pm2_moma_safe",
          name: "Registrar's Safe",
        }),
      );
      PM.prop(
        "footlocker",
        Object.assign(Q(int.storage, 3.5, 0, -9.5), {
          yaw: 0,
          loot: "weapon_crate",
          id: "pm2_moma_crate",
          name: "Art Handler's Crate",
        }),
      );
      PM.prop("cash_register", {
        x: O.x - 5.2,
        y: O.y + 1.16,
        z: O.z + 4.3,
        yaw: PI,
        loot: "cash_register",
        id: "pm2_moma_register",
        name: "Ticket Register",
      });
      PM.prop("fridge", {
        x: O.x + 22.8,
        y: O.y,
        z: O.z - 21.4,
        yaw: 0,
        loot: "fridge",
        id: "pm2_moma_fridge",
        name: "Café Fridge",
      });
      PM.prop("first_aid", {
        x: O.x + 11.8,
        y: O.y + 1.4,
        z: O.z + 3,
        yaw: -HP,
        loot: "first_aid",
        id: "pm2_moma_aid",
        name: "First Aid Box",
      });
      PM.prop("footlocker", {
        x: O.x + 26,
        y: O.y + F2,
        z: O.z + 9,
        yaw: -HP,
        loot: "raider_stash",
        id: "pm2_moma_salon_stash",
        name: "Critics' Stash",
      });
      PM.prop("footlocker", {
        x: O.x + 10.5,
        y: O.y,
        z: O.z + 0.4,
        yaw: PI,
        loot: "luggage",
        id: "pm2_moma_coats",
        name: "Lost & Found",
      });
      PM.prop("ammo_box", {
        x: O.x + 17,
        y: O.y + 0.9,
        z: O.z - 45,
        yaw: 0,
        loot: "ammo_box",
        id: "pm2_moma_garden_ammo",
        name: "Ammo Box",
      });
      PM.pickup(
        "pm2_nocturne",
        1,
        V3(int.nocturne.x, int.nocturne.y, int.nocturne.z),
      );
      PM.pickup("pm2_note_guard", 1, V3(O.x - 2.9, O.y + 0.05, O.z + 7.1));
      PM.pickup(
        "pm2_note_review",
        1,
        V3(O.x + 29.3, O.y + F2 + 0.05, O.z + 4.8),
      );
      PM.pickup(
        "pm2_reel_audio",
        1,
        V3(O.x - 29.3, O.y + F2 + 0.05, O.z - 17.4),
      );
      PM.pickup("rally_tonic", 1, V3(O.x - 17.7, O.y + F3 + 0.05, O.z + 8.2));

      // hostiles: the Critic (boss, garden) and his "fellow critics" (combat adds the location's generic spawns)
      const MUT = {
        type: "brute",
        faction: "brutes",
        hostile: true,
        ai: "guard",
        noRespawn: true,
      };
      const at = (a, dx, dz) => ({
        x: a.x + (dx || 0),
        y: a.y + 0.05,
        z: a.z + (dz || 0),
      });
      PM.npc(
        Object.assign({}, MUT, {
          id: "pm2_moma_critic",
          name: "The Critic",
          level: 12,
          hp: 460,
          dr: 10,
          pos: at(int.boss),
          yaw: 0,
          home: { x: int.boss.x, z: int.boss.z, r: 9 },
          weapon: "fire_axe",
          inventory: [
            ["pm2_critics_beret", 1],
            ["pm2_moma_key", 1],
            ["scrip", 60],
          ],
          when: () => !PM.flag("moma_critic_dead"),
          barks: [
            "CRITIC NOT IMPRESSED.",
            "YOU. STAND STILL. CRITIC MAKE YOU INTO ART.",
            "TOO MUCH SMOOTH. NOT ENOUGH SQUISH.",
            "HUMAN ART BAD. NEEDS MORE RED.",
            "ONE STAR!",
          ],
          onDeath: () => {
            PM.setFlag("moma_critic_dead", true);
            PM.news(
              'Word from Midtown: the Brute who called himself "The Critic" has given his final review at the Museum of Modern Art.',
            );
          },
        }),
      );
      PM.npc(
        Object.assign({}, MUT, {
          id: "pm2_moma_brush",
          name: "Brushstroke",
          level: 8,
          pos: at(int.salon, 1, 2),
          home: { x: int.salon.x, z: int.salon.z, r: 7 },
          barks: ["BRUSHSTROKE PAINT WITH YOU.", "RED IS BEST COLOUR."],
        }),
      );
      PM.npc(
        Object.assign({}, MUT, {
          id: "pm2_moma_easel",
          name: "Easel",
          level: 8,
          pos: at(int.design, -2, 1),
          home: { x: int.design.x, z: int.design.z, r: 7 },
          weapon: "hunting_rifle",
          barks: ["EASEL SEE YOU.", "CAR IS ART? CAR IS CAR."],
        }),
      );
      PM.npc(
        Object.assign({}, MUT, {
          id: "pm2_moma_docent",
          name: "Docent",
          level: 7,
          pos: at(int.atrium, 2, 0),
          home: { x: int.atrium.x, z: int.atrium.z, r: 10 },
          barks: [
            "WELCOME TO MUSEUM. YOU ARE EXHIBIT NOW.",
            "NO FLASH PHOTOGRAPHY!",
          ],
        }),
      );
      PM.npc(
        Object.assign({}, MUT, {
          id: "pm2_moma_gallerist",
          name: "Gallerist",
          level: 7,
          pos: at(int.garden, -6, -4),
          home: { x: int.garden.x - 6, z: int.garden.z - 4, r: 8 },
          barks: ["GALLERY CLOSED. FOREVER."],
        }),
      );
    },
    10,
  );
})();
