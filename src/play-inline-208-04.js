// play-inline-208 04 — seg
// Lines 558-1463 of readable/play-inline-208.pretty.js (statement-aligned).
  function buildExterior(site, root) {
    const b = PF.batch("seaport_ext");
    b.ground = 0;
    b.aoH = 4;
    const r = PF.rng("seaport");
    const anchors = {};
    anchors.clutches = [];
    // ---- ground: cobbled plaza, esplanade to the river --------------------
    b.boxMM("cobble", site.x0, -0.1, site.z0, site.x1, 0.05, site.z1, {
      grime: 0.55,
      segLen: 6,
    });
    for (let z = site.z0; z < site.z1; z += 4) {
      const sx = shoreX(z + 2);
      b.boxMM("deck_wood", site.x1, -0.1, z, sx + 0.5, 0.06, z + 4, {
        grime: 0.6,
      });
    }
    // bulkhead edge along the shore (timber cribbing + rail)
    for (let z = site.z0; z < site.z1; z += 3) {
      const xa = shoreX(z),
        xb = shoreX(z + 3);
      b.beam(
        "rotten",
        V3(xa + 0.3, 0.05, z),
        V3(xb + 0.3, 0.05, z + 3),
        0.4,
        0.4,
      );
      b.beam(
        "rotten",
        V3(xa + 0.4, -1.4, z),
        V3(xb + 0.4, -1.4, z + 3),
        0.6,
        1.6,
      );
      if (
        (z > P16.z1 + 1 || z + 3 < P16.z0 - 1) &&
        (z > P17.z1 + 1 || z + 3 < P17.z0 - 1)
      )
        PF.colWall(xa + 0.3, z, xb + 0.3, z + 3, 0.3, 0, 1.0, {
          walkable: false,
        });
      if (r() < 0.6)
        b.cyl("iron", xa, 0.05, z + 1.5, 0.05, 0.05, 1.0, 5, { hSeg: 1 });
    }

    // ---- SCHERMERHORN ROW -------------------------------------------------
    const units = [
      { x0: 176, x1: 187, h: 12.5, k: "brick_fed", stories: 4 },
      { x0: 187, x1: 197.5, h: 12.5, k: "brick", stories: 4 },
      { x0: 197.5, x1: 208, h: 13.2, k: "brick_fed", stories: 4 },
      { x0: 208, x1: 219, h: 12.5, k: "brick_brown", stories: 4 },
      { x0: 219, x1: 230, h: 16.2, k: "brick_fed", stories: 5 },
      { x0: 230, x1: 242, h: 12.5, k: "brick", stories: 4 },
    ];
    const RZ0 = 680,
      RZ1 = 694;
    units.forEach((u, i) => {
      const poly = [
        [u.x0, RZ0],
        [u.x1, RZ0],
        [u.x1, RZ1],
        [u.x0, RZ1],
      ];
      K.prismBands(b, u.k, poly, 0, u.h, 4.2, { grime: 0.55 });
      PF.colMM(u.x0, 0, RZ0, u.x1, u.h, RZ1 + 0.1, { walkable: false });
      // both long faces are full street fronts: south onto the plaza, north onto Fulton Street (the approach)
      const bays = u.x1 - u.x0 > 10.6 ? 4 : 3,
        bw = (u.x1 - u.x0) / bays;
      facade(b, u, i, bays, bw, 1, r);
      facade(b, u, i, bays, bw, -1, r);
      // pitched roof (ridge along x) with dormers on the south slope
      const rh = 3.2 + (u.stories === 5 ? -0.8 : 0);
      const sh = new THREE.Shape();
      sh.moveTo(RZ0 - 0.3, 0);
      sh.lineTo(RZ1 + 0.5, 0);
      sh.lineTo((RZ0 + RZ1) / 2, rh);
      sh.closePath();
      const g = new THREE.ExtrudeGeometry(sh, {
        depth: u.x1 - u.x0,
        bevelEnabled: false,
      });
      g.rotateY(-HP);
      b.add("slate", g, { m: PF.m4(u.x1, u.h, 0), grime: 0.55 });
      for (let k = 0; k < bays; k++) {
        const cx = u.x0 + (k + 0.5) * bw;
        b.box("white_paint", cx, u.h + 0.4, RZ1 - 1.6, 1.3, 1.5, 1.4, {
          seg: false,
          grime: 0.5,
        });
        K.pediment(b, "slate", cx, u.h + 1.9, RZ1 - 1.6, 1.6, 0.7, 1.5, 0, {});
        b.quad("glass_dark", cx, u.h + 1.1, RZ1 - 0.89, 0.7, 0.9, {
          noAO: true,
        });
      }
      // chimneys on the party walls
      b.box(u.k, u.x0 + 0.4, u.h - 1, RZ0 + 3.5, 0.8, rh + 3.2, 2.4, {
        seg: false,
        grime: 0.6,
      });
      b.box(u.k, u.x0 + 0.4, u.h - 1, RZ1 - 3.5, 0.8, rh + 3.2, 2.4, {
        seg: false,
        grime: 0.6,
      });
      for (let c = 0; c < 3; c++)
        b.cyl(
          "rust",
          u.x0 + 0.4,
          u.h + rh + 2.2,
          RZ0 + 2.8 + c * 0.7,
          0.13,
          0.15,
          0.4,
          6,
          { hSeg: 1 },
        );
    });
    const rowPlq = PF.texMat(
      "sp_row",
      PF.signTex(
        "sp_row",
        [
          "SCHERMERHORN ROW",
          "Built 1811–1812 as counting-houses",
          "for the merchants of the East River",
        ],
        "bronze",
        512,
        192,
      ),
    );
    b.quad(rowPlq, 176.8, 1.9, RZ1 + 0.52, 1.2, 0.45, {});
    PF.readable(
      V3(176.8, 1.9, RZ1 + 0.9),
      "Schermerhorn Row",
      "Built 1811–1812 as counting-houses for the merchants of the East River. Survived fire, flood, a century and a half of real estate developers, and one nuclear war.",
    );
    // fire escape on the tall unit
    for (let f = 0; f < 4; f++) {
      const y = 4.4 + f * 3.0;
      b.boxMM("iron", 220, y, RZ1 + 0.1, 229, y + 0.08, RZ1 + 1.4, {
        seg: false,
      });
      PF.railing(
        b,
        [
          [220, RZ1 + 1.4],
          [229, RZ1 + 1.4],
        ],
        y,
        0.9,
        "iron",
      );
      if (f < 3)
        b.beam(
          "iron",
          V3(221, y, RZ1 + 1.0),
          V3(223.5, y + 3, RZ1 + 1.0),
          0.5,
          0.06,
          {},
        );
    }

    // north (Fulton Street) side: fire escapes, the roof-mounted SCHERMERHORN ROW sign, the defenders' last barricade,
    // and the clutter of a fish market that died mid-shift (barrels, crates, nets, shellback shells picked clean)
    for (const [fx0, fx1, n] of [
      [188.5, 196.5, 3],
      [209, 217.5, 3],
    ]) {
      for (let f = 0; f < n; f++) {
        const y = 4.4 + f * 3.0;
        b.boxMM("iron", fx0, y, RZ0 - 1.3, fx1, y + 0.08, RZ0 - 0.1, {
          seg: false,
        });
        PF.railing(
          b,
          [
            [fx0, RZ0 - 1.3],
            [fx1, RZ0 - 1.3],
          ],
          y,
          0.9,
          "iron",
        );
        for (const x of [fx0, fx1])
          b.beam(
            "iron",
            V3(x, y, RZ0 - 1.3),
            V3(x, y + 0.9, RZ0 - 1.3),
            0.04,
            0.04,
          );
        if (f < n - 1)
          b.beam(
            "iron",
            V3(fx1 - 1.0, y + 0.05, RZ0 - 0.75),
            V3(fx1 - 3.4, y + 3.0, RZ0 - 0.75),
            0.55,
            0.06,
          );
        for (const x of [fx0 + 0.4, fx1 - 0.4])
          b.beam(
            "iron",
            V3(x, y - 0.9, RZ0 - 0.05),
            V3(x, y, RZ0 - 1.2),
            0.05,
            0.05,
          ); // brackets
      }
      for (let k = 0; k < 8; k++)
        b.box("iron", fx0 + 0.6, 1.9 + k * 0.3, RZ0 - 1.25, 0.5, 0.03, 0.03, {
          seg: false,
        }); // drop ladder
      b.beam(
        "iron",
        V3(fx0 + 0.35, 1.9, RZ0 - 1.25),
        V3(fx0 + 0.35, 4.4, RZ0 - 1.25),
        0.04,
        0.04,
      );
      b.beam(
        "iron",
        V3(fx0 + 0.85, 1.9, RZ0 - 1.25),
        V3(fx0 + 0.85, 4.4, RZ0 - 1.25),
        0.04,
        0.04,
      );
    }
    {
      const sk = PF.texMat(
        "sp_row_big",
        PF.signTex("sp_row_big", ["SCHERMERHORN ROW"], "engraved", 1024, 128, {
          bg: "#e0d8c0",
          fg: "#2a2418",
        }),
      );
      const sx0 = 177.5,
        sx1 = 196,
        sy = 12.5 + 0.35;
      b.quad(sk, (sx0 + sx1) / 2, sy + 1.0, RZ0 - 0.55, sx1 - sx0, 1.7, {
        ry: PI,
        grime: 0.5,
      });
      b.boxMM("iron", sx0, sy + 0.1, RZ0 - 0.5, sx1, sy + 0.18, RZ0 - 0.4, {
        seg: false,
      });
      b.boxMM("iron", sx0, sy + 1.85, RZ0 - 0.5, sx1, sy + 1.93, RZ0 - 0.4, {
        seg: false,
      });
      for (let x = sx0; x <= sx1 + 0.01; x += 3.08) {
        b.beam(
          "iron",
          V3(x, sy, RZ0 - 0.45),
          V3(x, sy + 2.0, RZ0 - 0.45),
          0.06,
          0.06,
        );
        b.beam(
          "iron",
          V3(x, sy + 1.9, RZ0 - 0.45),
          V3(x, sy - 0.2, RZ0 + 1.5),
          0.04,
          0.04,
        );
      }
      b.box("rust", 185.2, sy + 0.5, RZ0 - 0.6, 0.25, 0.9, 0.02, {
        seg: false,
        noAO: true,
      }); // one letter panel hanging loose
    }
    // the barricade across the west end of the Fulton Street walk (sandbags + scrap), a burnt-out barrel fire
    PF.scrapWall(b, 172.5, 677.6, 172.5, 679.6, 2.2, { seed: 9 });
    PF.sandbags(b, 173.2, 677.4, 175.6, 677.4, 3);
    PF.barrel(b, 174.2, 0, 678.8, {});
    PF.skeleton(b, 176.2, 0.05, 678.3, 2.1);
    for (const [x, z, a] of [
      [181, 678.6, 0.3],
      [199.5, 678.4, 2.2],
      [214, 678.8, 4.0],
      [236.5, 678.5, 1.1],
    ]) {
      // shellback shell picked clean: domed carapace, torn-off claw, a scatter of leg segments
      b.sphere("terracotta", x, 0.05, z, 0.8, {
        sx: 1.25,
        sy: 0.42,
        sz: 1.0,
        ry: a,
        c: 0x8a5a40,
        ws: 10,
        hs: 5,
      });
      b.box(
        "bone",
        x + Math.cos(a) * 1.2,
        0.05,
        z + Math.sin(a) * 0.6,
        0.55,
        0.22,
        0.3,
        { ry: a, seg: false, c: 0xb08060 },
      );
      for (let k = 0; k < 4; k++)
        b.box(
          "bone",
          x - 0.9 + k * 0.45,
          0.04,
          z - 0.5 + (k % 2) * 0.9,
          0.35,
          0.07,
          0.08,
          { ry: a + k, seg: false, c: 0xa07050 },
        );
    }
    for (const [x, z, n] of [
      [183.5, 678.7, 2],
      [204, 678.6, 3],
      [226.5, 678.9, 1],
      [240, 678.5, 2],
    ])
      D.crates(b, x, 0, z, n, x * 7);
    for (const [x, z] of [
      [192.5, 678.9],
      [221.5, 678.6],
      [233, 678.9],
    ]) {
      PF.barrel(b, x, 0, z, { key: "paint_teal" });
      PF.barrel(b, x + 0.7, 0, z - 0.1, {});
      b.box("net", x + 0.35, 0.93, z, 1.6, 0.05, 1.2, {
        rz: 0.15,
        rx: -0.1,
        seg: false,
      });
    }
    D.rubble(b, 206.5, 0, 678.6, 0.9, 6, 212);
    D.papers(b, 200, 0.06, 678.5, 3.5, 30, 1812);

    // ---- FULTON FISH MARKET SHED --------------------------------------------
    const MX0 = 180,
      MX1 = 232,
      MZ0 = 714,
      MZ1 = 734,
      MH = 7.5;
    K.prismBands(
      b,
      "brick",
      [
        [MX0, MZ0],
        [MX1, MZ0],
        [MX1, MZ1],
        [MX0, MZ1],
      ],
      0,
      MH,
      3.8,
      { grime: 0.6 },
    );
    PF.colMM(MX0, 0, MZ0 - 0.1, MX1, MH + 3, MZ1, { walkable: false });
    // arched openings (bricked/boarded) along both long sides
    const MDX = MX0 + 3 + 5.2 * 4; // the market's street door takes the 5th arch of the north (plaza) front
    for (let x = MX0 + 3; x < MX1 - 2; x += 5.2) {
      for (const [z, ry] of [
        [MZ0 - 0.02, PI],
        [MZ1 + 0.02, 0],
      ]) {
        if (ry === PI && Math.abs(x - MDX) < 0.1) continue; // built below as the entrance bay
        b.add(
          r() < 0.3 ? "glass_broken" : "rotten",
          PF.shapeGeo(roundArch(3.0, 4.6), 8),
          { m: PF.m4(x, 0.2, z, ry), uv: "box", grime: 0.6 },
        );
        for (let k = 0; k <= 8; k++) {
          const a = (k / 8) * PI;
          b.box(
            "limestone",
            x + Math.cos(a) * 1.7 * (ry ? -1 : 1),
            3.3 + Math.sin(a) * 1.7,
            z + (ry ? -0.08 : 0.08),
            0.5,
            0.36,
            0.2,
            { rz: (a - HP) * (ry ? -1 : 1), seg: false, grime: 0.4 },
          );
        }
        for (const sx of [-1, 1])
          b.box(
            "limestone",
            x + sx * 1.62,
            0.2,
            z + (ry ? -0.08 : 0.08),
            0.34,
            3.1,
            0.2,
            { seg: false, grime: 0.4 },
          );
      }
    }
    // clerestory roof: lower roof + raised monitor with louvres, iron trusses showing at the gable
    b.boxMM(
      "corrugated",
      MX0 - 0.6,
      MH,
      MZ0 - 0.8,
      MX1 + 0.6,
      MH + 0.25,
      MZ1 + 0.8,
      { grime: 0.6 },
    );
    b.boxMM("brick", MX0 + 2, MH + 0.25, MZ0 + 6, MX1 - 2, MH + 2.6, MZ1 - 6, {
      grime: 0.5,
    });
    for (let x = MX0 + 3; x < MX1 - 2; x += 2.2)
      for (const z of [MZ0 + 5.98, MZ1 - 5.98])
        b.quad("glass_dark", x, MH + 1.4, z, 1.6, 1.4, {
          ry: z < 724 ? PI : 0,
          noAO: true,
        });
    {
      const sh = new THREE.Shape();
      sh.moveTo(MZ0 + 5.5, 0);
      sh.lineTo(MZ1 - 5.5, 0);
      sh.lineTo((MZ0 + MZ1) / 2, 1.8);
      sh.closePath();
      const g = new THREE.ExtrudeGeometry(sh, {
        depth: MX1 - MX0 - 3,
        bevelEnabled: false,
      });
      g.rotateY(-HP);
      b.add("corrugated", g, { m: PF.m4(MX1 - 1.5, MH + 2.6, 0), grime: 0.6 });
    }
    const fishK = PF.texMat(
      "sp_fulton",
      PF.signTex("sp_fulton", ["FULTON FISH MARKET"], "enamel", 1024, 128, {
        bg: "#1c3a5a",
        fg: "#f0e8c8",
      }),
    );
    b.quad(fishK, (MX0 + MX1) / 2, MH - 1.1, MZ0 - 0.1, 16, 2.0, { ry: PI });
    b.quad(fishK, MX1 + 0.1, MH - 1.1, (MZ0 + MZ1) / 2, 12, 1.5, { ry: HP });
    // main doors (north, facing the plaza) & dock door (east, facing the river)
    // MAIN ENTRANCE BAY (plaza side): a projecting brick surround with a stone arch, a roll-up steel shutter
    // jammed half open over the lit market hall, a caged work lamp and a hand-painted sign — readable from the plaza
    {
      const x = MDX,
        z = MZ0;
      b.boxMM("brick", x - 2.6, 0, z - 0.7, x - 1.6, 5.6, z, { grime: 0.6 });
      b.boxMM("brick", x + 1.6, 0, z - 0.7, x + 2.6, 5.6, z, { grime: 0.6 });
      b.boxMM("brick", x - 2.6, 4.6, z - 0.7, x + 2.6, 5.6, z, { grime: 0.6 });
      b.boxMM("limestone", x - 2.8, 5.6, z - 0.85, x + 2.8, 5.85, z, {
        seg: false,
        grime: 0.5,
      });
      PF.colMM(x - 2.6, 0, z - 0.7, x - 1.6, 5.6, z, { walkable: false });
      PF.colMM(x + 1.6, 0, z - 0.7, x + 2.6, 5.6, z, { walkable: false });
      for (let k = 0; k <= 8; k++) {
        const a = (k / 8) * PI;
        b.box(
          "limestone",
          x - Math.cos(a) * 1.75,
          3.1 + Math.sin(a) * 1.5,
          z - 0.78,
          0.45,
          0.34,
          0.2,
          { rz: -(a - HP), seg: false, grime: 0.45 },
        );
      }
      // the lit hall beyond (painted interior card): stalls, hanging bulbs, wet concrete
      const hallK = PF.texMat(
        "sp_hall_card",
        PF.canvasTex(
          "pf_sp_hall_card",
          512,
          256,
          (ctx, w, h) => {
            ctx.fillStyle = "#0c0d0b";
            ctx.fillRect(0, 0, w, h);
            const gl = ctx.createRadialGradient(
              w * 0.5,
              h * 0.35,
              8,
              w * 0.5,
              h * 0.5,
              w * 0.55,
            );
            gl.addColorStop(0, "rgba(255,200,130,0.9)");
            gl.addColorStop(0.4, "rgba(120,96,60,0.7)");
            gl.addColorStop(1, "rgba(12,12,10,0)");
            ctx.fillStyle = gl;
            ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = "#3a3a34";
            ctx.beginPath();
            ctx.moveTo(0, h);
            ctx.lineTo(w, h);
            ctx.lineTo(w * 0.7, h * 0.62);
            ctx.lineTo(w * 0.3, h * 0.62);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = "rgba(200,210,200,0.25)";
            ctx.fillRect(w * 0.42, h * 0.7, w * 0.16, h * 0.3); // wet sheen
            ctx.fillStyle = "rgba(14,12,10,0.92)";
            for (const [x0, x1] of [
              [0.05, 0.3],
              [0.7, 0.95],
            ]) {
              ctx.fillRect(w * x0, h * 0.55, w * (x1 - x0), h * 0.18);
              ctx.fillRect(w * x0, h * 0.35, w * 0.02, h * 0.2);
              ctx.fillRect(w * (x1 - 0.02), h * 0.35, w * 0.02, h * 0.2);
              ctx.fillRect(w * x0, h * 0.33, w * (x1 - x0), h * 0.04);
            }
            for (const bx of [0.3, 0.5, 0.7]) {
              ctx.fillRect(w * bx - 1, 0, 2, h * 0.22);
              ctx.fillStyle = "#ffe4a8";
              ctx.beginPath();
              ctx.arc(w * bx, h * 0.24, 6, 0, TAU);
              ctx.fill();
              ctx.fillStyle = "rgba(14,12,10,0.92)";
            }
          },
          { clamp: true },
        ),
        { emissive: 0.8, rough: 0.9 },
      );
      b.quad(hallK, x, 1.25, z - 0.03, 3.2, 2.5, { ry: PI, noAO: true });
      // roll-up shutter jammed at 2.5 m (slats + bottom bar + guide rails) and the arch tympanum boarded above it
      for (let y = 2.5; y < 4.6; y += 0.16)
        b.box("corrugated", x, y, z - 0.12, 3.2, 0.15, 0.06, {
          seg: false,
          grime: 0.7,
        });
      b.box("rust", x, 2.42, z - 0.16, 3.25, 0.12, 0.12, { seg: false });
      for (const sx of [-1, 1])
        b.box("iron", x + sx * 1.63, 0, z - 0.12, 0.08, 4.6, 0.12, {
          seg: false,
        });
      b.box("rust", x, 4.6, z - 0.35, 3.4, 0.5, 0.5, {
        seg: false,
        grime: 0.6,
      }); // shutter drum housing
      b.boxMM("concrete_dark", x - 1.6, 0, z - 1.6, x + 1.6, 0.12, z, {
        seg: false,
        grime: 0.8,
      }); // worn threshold apron
      // painted sign + caged lamp
      const entK = PF.texMat(
        "sp_entrance",
        PF.signTex(
          "sp_entrance",
          ["MARKET HALL", "ENTRANCE · NO CARTS"],
          "painted",
          512,
          160,
          { bg: "#e8dcc0", fg: "#8a2a1a" },
        ),
      );
      b.quad(entK, x, 5.1, z - 0.72, 2.9, 0.9, { ry: PI });
      b.beam(
        "iron",
        V3(x, 4.35, z - 0.72),
        V3(x, 4.35, z - 1.4),
        0.05,
        0.05,
        {},
      );
      b.cyl("lamp_warm", x, 4.0, z - 1.4, 0.13, 0.13, 0.28, 8, {
        hSeg: 1,
        noAO: true,
      });
      b.cyl("iron", x, 4.27, z - 1.4, 0.03, 0.26, 0.1, 8, { hSeg: 1 });
      PF.glow(V3(x, 4.1, z - 1.4), 0xffc880, 2.0, null, {
        intensity: 1.3,
        flicker: 0.3,
      });
      PF.glow(V3(x, 1.2, z - 0.4), 0xffb070, 2.6, null, {
        intensity: 0.6,
        flicker: 0.05,
      });
    }
    // dock door (east, facing the river): steel leaf in a frame, stencil, lamp
    b.box("rust", MX1 + 0.12, 0, 724, 0.2, 3.8, 3.6, {
      seg: false,
      grime: 0.6,
    });
    for (const dz of [-1.9, 1.9])
      b.box("iron", MX1 + 0.2, 0, 724 + dz, 0.25, 4.0, 0.2, { seg: false });
    b.box("iron", MX1 + 0.2, 3.8, 724, 0.25, 0.25, 4.0, { seg: false });
    const dockK = PF.texMat(
      "sp_dock",
      PF.signTex("sp_dock", ["LOADING DOCK 3"], "stencil", 512, 128, {
        bg: "#5a4a38",
        fg: "#e8e0c8",
      }),
    );
    b.quad(dockK, MX1 + 0.24, 4.4, 724, 2.6, 0.65, { ry: HP });
    b.cyl("lamp_warm", MX1 + 0.7, 4.3, 725.9, 0.12, 0.12, 0.25, 8, {
      hSeg: 1,
      noAO: true,
    });
    PF.glow(V3(MX1 + 0.7, 4.4, 725.9), 0xffc880, 1.6, null, {
      intensity: 1.0,
      flicker: 0.4,
    });
    anchors.market_door = PF.anchor(MDX, 0, MZ0 - 2.2, 0);
    anchors.market_door_x = MDX;
    anchors.dock_door = PF.anchor(MX1 + 2.2, 0, 724, -HP);

    // ---- plaza dressing: nests, stalls, lamp posts, kiosk, carts, bodies ------------
    anchors.clutches.push(nest(b, 214, 0, 708, 1.6, 12, null, 71));
    anchors.clutches.push(nest(b, 188, 0, 700, 1.2, 8, null, 72));
    anchors.clutches.push(nest(b, 244.5, 0, 700, 1.1, 7, null, 73));
    D.stall(b, 196, 704, PI, 3.4, 2.2, {
      goods: "junk",
      sign: "FRESH FISH",
      seed: 11,
    });
    D.stall(b, 226, 707, 0.3, 3.0, 2.0, {
      goods: "bottles",
      sign: "OYSTERS 2 SCRIP",
      seed: 12,
    });
    for (const [x, z] of [
      [180, 697],
      [200, 711],
      [224, 697],
      [238, 711],
      [190, 740],
      [214, 740],
    ])
      PF.lampPost(b, x, 0, z, false);
    for (const [x, z, a] of [
      [210, 703, 0.4],
      [219, 710, 2.2],
      [185, 707, -1.1],
      [236, 704, 1.5],
    ])
      PF.skeleton(b, x, 0.06, z, a);
    // fishing nets over barrels & crates, lobster pots
    for (const [x, z] of [
      [232, 700],
      [178, 710],
      [246, 745],
    ]) {
      PF.barrel(b, x, 0, z, {});
      PF.barrel(b, x + 0.7, 0, z + 0.3, {});
      b.box("net", x + 0.4, 0.95, z + 0.15, 1.8, 0.05, 1.4, {
        rz: 0.2,
        rx: 0.1,
        seg: false,
      });
      for (let k = 0; k < 3; k++)
        b.box("rotten", x - 1.2 - k * 0.2, 0, z + k * 0.7, 0.8, 0.5, 0.6, {
          seg: false,
        });
    }
    // the SOUTH STREET SEAPORT arch sign at the west entrance
    for (const z of [697, 711]) {
      b.box("iron", 172, 0, z, 0.35, 5.8, 0.35, { seg: false });
      PF.col(172, z, 0.4, 0.4, 0, 5.8, 0, { walkable: false });
    }
    b.box("iron", 172, 5.6, 704, 0.3, 0.3, 14.6, { seg: false });
    const ssK = PF.texMat(
      "sp_arch",
      PF.signTex("sp_arch", ["SOUTH STREET SEAPORT"], "enamel", 1024, 128, {
        bg: "#1c3a5a",
        fg: "#e8d8a8",
      }),
    );
    b.quad(ssK, 172.18, 4.8, 704, 11, 1.4, { ry: -HP });
    b.quad(ssK, 171.82, 4.8, 704, 11, 1.4, { ry: HP });

    // ---- Titanic Memorial Lighthouse ---------------------------------------
    {
      const lx = 180,
        lz = 746;
      b.box("granite", lx, 0, lz, 3.2, 1.2, 3.2, { seg: false, grime: 0.6 });
      b.cyl("white_paint", lx, 1.2, lz, 0.95, 1.25, 7.4, 12, {
        hSeg: 3,
        grime: 0.6,
      });
      b.cyl("iron", lx, 8.6, lz, 1.3, 1.3, 0.2, 12, { hSeg: 1 });
      PF.railing(
        b,
        Array.from({ length: 13 }, (_, i) => [
          lx + Math.cos((i / 12) * TAU) * 1.25,
          lz + Math.sin((i / 12) * TAU) * 1.25,
        ]),
        8.8,
        0.8,
        "iron",
      );
      b.cyl("glass_dark", lx, 8.8, lz, 0.75, 0.75, 1.4, 10, { hSeg: 1 });
      b.cyl("copper", lx, 10.2, lz, 0.1, 1.0, 1.1, 10, { hSeg: 1 });
      b.sphere("copper", lx, 11.4, lz, 0.2, { ws: 6, hs: 5 });
      PF.col(lx, lz, 3.2, 3.2, 0, 8.6, 0, { walkable: false });
      const tk = PF.texMat(
        "sp_titanic",
        PF.signTex(
          "sp_titanic",
          ["TITANIC MEMORIAL", "APRIL 15, 1912"],
          "bronze",
          512,
          192,
        ),
      );
      b.quad(tk, lx, 0.6, lz - 1.62, 1.6, 0.6, { ry: PI });
    }
    // benches & wreck of a sightseeing bus on the promenade
    for (const [x, z] of [
      [195, 747],
      [205, 747],
      [225, 747],
    ])
      PF.bench(b, x, 0, z, PI);
    anchors.bus = PF.anchor(212, 0, 744, HP);

    // ---- FDR Drive fragment (elevated), broken in the middle ----------------
    const VX0 = 238.5,
      VX1 = 249.5,
      VY = 8.5;
    for (const [z0, z1] of [
      [site.z0, 709],
      [723, site.z1],
    ]) {
      b.boxMM("concrete", VX0, VY - 1.0, z0, VX1, VY, z1, { grime: 0.6 });
      b.boxMM("concrete_dark", VX0, VY - 1.5, z0, VX0 + 0.8, VY - 1.0, z1, {
        seg: false,
      });
      b.boxMM("concrete_dark", VX1 - 0.8, VY - 1.5, z0, VX1, VY - 1.0, z1, {
        seg: false,
      });
      b.boxMM("asphalt", VX0 + 0.4, VY, z0, VX1 - 0.4, VY + 0.05, z1, {
        grime: 0.4,
      });
      for (const x of [VX0 + 0.3, VX1 - 0.3])
        b.boxMM("concrete", x - 0.3, VY, z0, x + 0.3, VY + 0.9, z1, {
          seg: false,
          grime: 0.5,
        });
      PF.colMM(VX0, VY - 1.0, z0, VX1, VY, z1);
    }
    for (let z = site.z0 + 3; z < site.z1; z += 11) {
      if (z > 707 && z < 725) continue;
      for (const x of [VX0 + 1.4, VX1 - 1.4]) {
        b.box("concrete_dark", x, 0, z, 1.0, VY - 1.0, 1.0, {
          seg: false,
          grime: 0.6,
        });
        PF.col(x, z, 1.0, 1.0, 0, VY - 1, 0, { walkable: false });
      }
      b.box(
        "concrete_dark",
        (VX0 + VX1) / 2,
        VY - 2.2,
        z,
        VX1 - VX0 - 1,
        1.2,
        1.2,
        { seg: false },
      );
    }
    // broken ends: rebar, hanging slab, a car teetering over the gap
    for (const [z, dir] of [
      [709, 1],
      [723, -1],
    ]) {
      for (let i = 0; i < 12; i++) {
        const x = VX0 + 0.5 + i * 0.9;
        b.beam(
          "rust",
          V3(x, VY - 0.5, z),
          V3(
            x + (r() - 0.5) * 0.4,
            VY - 0.6 - r() * 1.2,
            z + dir * (0.8 + r() * 1.5),
          ),
          0.04,
          0.04,
        );
      }
    }
    b.box("concrete", 243, VY - 5.5, 713, 9, 0.9, 6, {
      rx: 0.9,
      seg: false,
      grime: 0.6,
    });
    D.rubble(b, 244, 0, 716, 1.6, 10, 55);
    PF.col(244, 716, 6, 6, 0, 1.4, 0, { surface: "rubble" });
    anchors.fdr_car = PF.anchor(244, VY, 708.4, 0);

    // ---- PIERS ---------------------------------------------------------------
    const s16 = shoreX(P16.z1),
      s17 = shoreX(P17.z0);
    pier(b, s16 - 1, P16.x1, P16.z0, P16.z1, 0.3, { holes: 4 });
    pier(b, s17 - 1, P17.x1, P17.z0, P17.z1, 0.3, { holes: 2 });
    for (const [z0, z1] of [[P16.z0, P16.z1]])
      PF.railing(
        b,
        [
          [P16.x1, z0],
          [P16.x1, z1],
        ],
        0.3,
        1.0,
        "iron",
        { collide: true },
      );
    // Pier 17 pavilion: glass & green steel, gabled roof, the PIER 17 sign
    {
      const x0 = 275,
        x1 = 309,
        z0 = 683,
        z1 = 699,
        H = 9.5;
      b.boxMM("paint_teal", x0, 0.3, z0, x1, 0.8, z1, {
        seg: false,
        grime: 0.6,
      });
      for (let x = x0; x <= x1 + 0.01; x += 3.4)
        for (const z of [z0, z1])
          b.box("paint_teal", x, 0.8, z, 0.3, H - 0.5, 0.3, {
            seg: false,
            grime: 0.5,
            c: 0x6a9a8a,
          });
      for (let z = z0; z <= z1 + 0.01; z += 4)
        for (const x of [x0, x1])
          b.box("paint_teal", x, 0.8, z, 0.3, H - 0.5, 0.3, {
            seg: false,
            grime: 0.5,
            c: 0x6a9a8a,
          });
      for (const y of [4.8, H]) {
        b.boxMM("paint_teal", x0, y, z0 - 0.15, x1, y + 0.3, z0 + 0.15, {
          seg: false,
          c: 0x6a9a8a,
        });
        b.boxMM("paint_teal", x0, y, z1 - 0.15, x1, y + 0.3, z1 + 0.15, {
          seg: false,
          c: 0x6a9a8a,
        });
      }
      for (let x = x0 + 1.7; x < x1; x += 3.4)
        for (const [z, ry] of [
          [z0 - 0.02, PI],
          [z1 + 0.02, 0],
        ])
          for (const y of [2.8, 7.2])
            b.quad(r() < 0.45 ? "glass_broken" : "pane", x, y, z, 3.0, 3.8, {
              ry,
              noAO: true,
            });
      for (let z = z0 + 2; z < z1; z += 4)
        for (const [x, ry] of [
          [x0 - 0.02, -HP],
          [x1 + 0.02, HP],
        ])
          for (const y of [2.8, 7.2])
            b.quad(r() < 0.45 ? "glass_broken" : "pane", x, y, z, 3.6, 3.8, {
              ry,
              noAO: true,
            });
      b.boxMM(
        "concrete_dark",
        x0 + 0.2,
        4.6,
        z0 + 0.2,
        x1 - 0.2,
        4.8,
        z1 - 0.2,
        { seg: false },
      );
      const sh = new THREE.Shape();
      sh.moveTo(z0 - 0.6, 0);
      sh.lineTo(z1 + 0.6, 0);
      sh.lineTo((z0 + z1) / 2, 3.2);
      sh.closePath();
      const g = new THREE.ExtrudeGeometry(sh, {
        depth: x1 - x0 + 1.2,
        bevelEnabled: false,
      });
      g.rotateY(-HP);
      b.add("copper", g, { m: PF.m4(x1 + 0.6, H + 0.3, 0), grime: 0.5 });
      PF.colMM(x0, 0.3, z0, x1, H + 3, z1, { walkable: false });
      const p17 = PF.texMat(
        "sp_p17",
        PF.signTex("sp_p17", ["PIER 17"], "enamel", 512, 160, {
          bg: "#1c3a5a",
          fg: "#f0f0e0",
        }),
      );
      b.quad(p17, x0 - 0.05, H + 1.2, (z0 + z1) / 2, 5, 1.6, { ry: -HP });
      b.quad(p17, x1 + 0.35, H + 1.2, (z0 + z1) / 2, 5, 1.6, { ry: HP });
    }
    // pier nest by the Peking gangway
    anchors.clutches.push(nest(b, 309, 0.3, 723, 1.3, 10, null, 74));

    // ---- THE PEKING -----------------------------------------------------------
    peking(b, anchors, r);
    // ---- THE AMBROSE -----------------------------------------------------------
    ambrose(b, anchors, r);

    b.build(root);
    return anchors;
  }

