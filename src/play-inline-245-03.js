// play-inline-245 03 — math
// Lines 78-929 of readable/play-inline-245.pretty.js (statement-aligned).
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
