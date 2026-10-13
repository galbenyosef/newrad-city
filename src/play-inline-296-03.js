// play-inline-296 03 — grime
// Lines 72-591 of readable/play-inline-296.pretty.js (statement-aligned).
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
