// play-inline-206 03 — ctx
// Lines 259-973 of readable/play-inline-206.pretty.js (statement-aligned).
  function buildExterior(site, root) {
    const b = PF.batch("fed_ext");
    b.ground = 0;
    b.aoH = 5;
    const r = PF.rng("fedreserve");
    const anchors = {};
    const CXm = (BX0 + BX1) / 2;
    // paving apron
    b.boxMM("granite", site.x0, -0.1, site.z0, site.x1, 0.06, site.z1, {
      grime: 0.55,
      segLen: 5,
    });
    // plinth + rusticated base
    b.boxMM(
      "granite_dark",
      BX0 - 0.35,
      0,
      BZ0 - 0.35,
      BX1 + 0.35,
      0.9,
      BZ1 + 0.35,
      { grime: 0.6 },
    );
    K.prismBands(
      b,
      "fed_rust",
      [
        [BX0, BZ0],
        [BX1, BZ0],
        [BX1, BZ1],
        [BX0, BZ1],
      ],
      0.9,
      H_BASE,
      5.6,
      { grime: 0.55 },
    );
    // rustication bands (deep horizontal joints read as shadow lines)
    for (let y = 1.8; y < H_BASE; y += 1.2) {
      for (const [x0, z0, x1, z1] of [
        [BX0 - 0.12, BZ0 - 0.12, BX1 + 0.12, BZ0],
        [BX0 - 0.12, BZ1, BX1 + 0.12, BZ1 + 0.12],
        [BX0 - 0.12, BZ0, BX0, BZ1],
        [BX1, BZ0, BX1 + 0.12, BZ1],
      ]) {
        b.boxMM("fed_rust", x0, y, z0, x1, y + 0.95, z1, {
          grime: 0.5,
          segLen: 8,
        });
      }
    }
    // upper walls (smooth sandstone) and quoins
    K.prismBands(
      b,
      "fed_stone",
      [
        [BX0 + 0.4, BZ0 + 0.4],
        [BX1 - 0.4, BZ0 + 0.4],
        [BX1 - 0.4, BZ1 - 0.4],
        [BX0 + 0.4, BZ1 - 0.4],
      ],
      H_BASE,
      H_SHAFT,
      5.5,
      { grime: 0.5 },
    );
    b.boxMM(
      "fed_rust",
      BX0 - 0.2,
      H_BASE - 0.1,
      BZ0 - 0.2,
      BX1 + 0.2,
      H_BASE + 0.7,
      BZ1 + 0.2,
      { grime: 0.4 },
    ); // belt course
    for (const [qx, qz] of [
      [BX0 + 0.4, BZ0 + 0.4],
      [BX1 - 0.4, BZ0 + 0.4],
      [BX1 - 0.4, BZ1 - 0.4],
      [BX0 + 0.4, BZ1 - 0.4],
    ]) {
      for (let y = H_BASE + 0.7, k = 0; y < H_SHAFT - 0.5; y += 1.4, k++) {
        const long = k % 2 === 0;
        const sx = qx < CXm ? 1 : -1,
          sz = qz < 782 ? 1 : -1;
        b.box(
          "fed_rust",
          qx + sx * (long ? 0.9 : 0.55) - sx * 0.05,
          y,
          qz - sz * 0.12,
          long ? 1.9 : 1.2,
          1.25,
          0.34,
          { seg: false, grime: 0.5 },
        );
        b.box(
          "fed_rust",
          qx - sx * 0.12,
          y,
          qz + sz * (long ? 0.55 : 0.9) - sz * 0.05,
          0.34,
          1.25,
          long ? 1.2 : 1.9,
          { seg: false, grime: 0.5 },
        );
      }
    }
    PF.colMM(BX0 - 0.4, 0, BZ0 - 0.4, BX1 + 0.4, H_TOP, BZ1 + 0.4, {
      walkable: false,
    });

    // ground-floor arched windows with iron grilles (all four faces), the entrance bay on Liberty Street (north)
    const faces = [
      { ax: "x", fixed: BZ0 - 0.13, ry: PI, a0: BX0, a1: BX1 }, // north (Liberty St)
      { ax: "x", fixed: BZ1 + 0.13, ry: 0, a0: BX0, a1: BX1 }, // south (Maiden Lane)
      { ax: "z", fixed: BX0 - 0.13, ry: -HP, a0: BZ0, a1: BZ1 }, // west (Nassau)
      { ax: "z", fixed: BX1 + 0.13, ry: HP, a0: BZ0, a1: BZ1 }, // east (William)
    ];
    for (const f of faces) {
      const len = f.a1 - f.a0,
        n = Math.floor(len / 6.2);
      const start = f.a0 + (len - (n - 1) * 6.2) / 2;
      for (let i = 0; i < n; i++) {
        const a = start + i * 6.2;
        if (f.ry === PI && Math.abs(a - CXm) < 4) continue; // entrance bay
        const x = f.ax === "x" ? a : f.fixed,
          z = f.ax === "x" ? f.fixed : a;
        archWindow(b, x, 2.2, z, f.ry, 2.3, 5.6, {
          grille: true,
          scroll: true,
          glass: r() < 0.2 ? "glass_broken" : "glass_dark",
        });
        // small mezzanine window above
        const c = Math.cos(f.ry),
          s = Math.sin(f.ry);
        b.quad("glass_dark", x + s * 0.02, 9.6, z + c * 0.02, 1.1, 1.3, {
          ry: f.ry,
          noAO: true,
        });
        for (let k = 1; k < 4; k++)
          b.box(
            "iron",
            x + s * 0.1 + c * (-0.55 + k * 0.275),
            8.95,
            z + c * 0.1 - s * (-0.55 + k * 0.275),
            0.04,
            1.3,
            0.04,
            { seg: false },
          );
      }
    }
    // upper windows: small, deep-set, in a disciplined grid (fortress-like)
    K.polyWindows(
      b,
      [
        [BX0 + 0.4, BZ0 + 0.4],
        [BX1 - 0.4, BZ0 + 0.4],
        [BX1 - 0.4, BZ1 - 0.4],
        [BX0 + 0.4, BZ1 - 0.4],
      ],
      {
        y0: H_BASE + 2.0,
        floors: 7,
        floorH: 3.0,
        w: 1.15,
        h: 1.6,
        spacing: 3.1,
        inset: 0.03,
        frameKey: "fed_rust",
        sill: true,
        lintel: true,
        broken: 0.22,
        boarded: 0.04,
        seed: 77,
        margin: 2.4,
      },
    );
    // blast damage: blown-out window cluster + scorch on the east face
    for (let i = 0; i < 5; i++)
      b.quad(
        "glass_broken",
        BX1 - 0.25 + 0.02,
        22 + r() * 8,
        776 + r() * 8,
        1.6 + r(),
        1.8 + r(),
        { ry: HP, noAO: true },
      );
    b.rock("rubble", BX1 + 1.2, 0, 779, 1.4, { flat: 0.5 });
    b.rock("rubble", BX1 + 0.8, 0, 783, 1.0, { flat: 0.5 });
    // LOGGIA: recessed arcade on columns under the cornice
    b.boxMM(
      "fed_stone",
      BX0 + 1.6,
      H_SHAFT,
      BZ0 + 1.6,
      BX1 - 1.6,
      H_LOG,
      BZ1 - 1.6,
      { grime: 0.4 },
    ); // recessed wall
    b.boxMM(
      "shadow" in PF.MAT_DEFS ? "shadow" : "glass_dark",
      BX0 + 1.58,
      H_SHAFT + 0.3,
      BZ0 + 1.58,
      BX1 - 1.58,
      H_LOG - 0.8,
      BZ1 - 1.58,
      { seg: false, noAO: true },
    );
    b.boxMM(
      "fed_rust",
      BX0 - 0.1,
      H_SHAFT - 0.4,
      BZ0 - 0.1,
      BX1 + 0.1,
      H_SHAFT + 0.25,
      BZ1 + 0.1,
      { grime: 0.4 },
    ); // loggia floor slab / string
    for (const f of faces) {
      const len = f.a1 - f.a0,
        n = Math.floor((len - 1) / 3.0);
      const start = f.a0 + (len - n * 3.0) / 2;
      const c = Math.cos(f.ry),
        s = Math.sin(f.ry);
      for (let i = 0; i <= n; i++) {
        const a = start + i * 3.0;
        const x = f.ax === "x" ? a : f.fixed - s * 0.6,
          z = f.ax === "x" ? f.fixed - c * 0.6 : a;
        b.cyl("fed_stone", x, H_SHAFT + 0.25, z, 0.22, 0.26, 3.4, 10, {
          hSeg: 1,
        });
        b.box("fed_stone", x, H_SHAFT + 3.65, z, 0.7, 0.3, 0.7, { seg: false });
        if (i < n) {
          const mx = f.ax === "x" ? a + 1.5 : x,
            mz = f.ax === "x" ? z : a + 1.5;
          const arch = new THREE.Shape();
          arch.moveTo(-1.5, 0);
          arch.lineTo(1.5, 0);
          arch.lineTo(1.5, 1.6);
          arch.lineTo(-1.5, 1.6);
          arch.closePath();
          const hole = new THREE.Path();
          hole.moveTo(-1.28, 0);
          hole.lineTo(1.28, 0);
          hole.lineTo(1.28, 0.2);
          hole.absarc(0, 0.2, 1.28, 0, PI, false);
          hole.lineTo(-1.28, 0);
          arch.holes.push(hole);
          const g = new THREE.ExtrudeGeometry(arch, {
            depth: 0.5,
            bevelEnabled: false,
          });
          g.translate(0, 0, -0.25);
          b.add("fed_stone", g, {
            m: PF.m4(mx, H_SHAFT + 3.95, mz, f.ry),
            grime: 0.4,
          });
        }
      }
    }
    // deep bracketed cornice
    b.boxMM(
      "fed_stone",
      BX0 - 1.6,
      H_LOG,
      BZ0 - 1.6,
      BX1 + 1.6,
      H_LOG + 0.5,
      BZ1 + 1.6,
      { grime: 0.45 },
    );
    b.boxMM(
      "fed_stone",
      BX0 - 1.9,
      H_LOG + 0.5,
      BZ0 - 1.9,
      BX1 + 1.9,
      H_LOG + 1.2,
      BZ1 + 1.9,
      { grime: 0.45 },
    );
    b.boxMM(
      "tar",
      BX0 - 1.5,
      H_LOG + 1.2,
      BZ0 - 1.5,
      BX1 + 1.5,
      H_TOP + 0.1,
      BZ1 + 1.5,
      { grime: 0.5 },
    );
    for (const f of faces) {
      const len = f.a1 - f.a0,
        n = Math.floor(len / 1.2);
      const c = Math.cos(f.ry),
        s = Math.sin(f.ry);
      for (let i = 0; i <= n; i++) {
        if (r() < 0.05) continue; // missing brackets
        const a = f.a0 + (i * len) / n;
        const x = f.ax === "x" ? a : f.fixed + s * 0.8,
          z = f.ax === "x" ? f.fixed + c * 0.8 : a;
        b.box(
          "fed_stone",
          x,
          H_LOG - 0.8,
          z,
          f.ax === "x" ? 0.3 : 1.6,
          0.85,
          f.ax === "x" ? 1.6 : 0.3,
          { seg: false, grime: 0.35 },
        );
      }
    }
    // a bitten-off corner of the cornice (shell hit)
    b.rock("fed_stone", BX1 + 1, H_LOG + 0.4, BZ0 - 1, 1.2, { flat: 0.7 });
    // roof clutter: water tank, antenna mast with a red beacon, AC housings, collapsed skylight
    b.cyl("rotten", BX0 + 8, H_TOP, BZ0 + 8, 2.2, 2.2, 3.4, 14, { hSeg: 2 });
    b.cyl("rotten", BX0 + 8, H_TOP + 3.4, BZ0 + 8, 0.2, 2.4, 1.2, 14, {
      hSeg: 1,
    });
    for (const [dx, dz] of [
      [-1.5, -1.5],
      [1.5, -1.5],
      [-1.5, 1.5],
      [1.5, 1.5],
    ])
      b.box("rust", BX0 + 8 + dx, H_TOP - 0.1, BZ0 + 8 + dz, 0.2, 0.2, 0.2, {
        seg: false,
      });
    b.cyl("iron", BX1 - 10, H_TOP, BZ1 - 8, 0.08, 0.2, 9, 5, { hSeg: 2 });
    b.sphere("lamp_red", BX1 - 10, H_TOP + 9.1, BZ1 - 8, 0.18, {
      ws: 6,
      hs: 4,
    });
    PF.glow(V3(BX1 - 10, H_TOP + 9.1, BZ1 - 8), 0xff3020, 1.4, null, {
      intensity: 1.4,
      flicker: 0.6,
    });
    for (let i = 0; i < 4; i++)
      b.box("panel", BX0 + 20 + i * 5, H_TOP, BZ1 - 6, 2.4, 1.6, 1.8, {
        seg: false,
      });

    // ---- the Liberty Street entrance ----------------------------------
    const ex = CXm,
      ez = BZ0 - 0.13;
    // portal block: a real 1.1 m deep round-arched RECESS (U-shaped extrusion), so the entrance reads as a doorway
    // from down the street instead of a flat black arch
    {
      const AW = 2.2,
        SP = 5.0; // half-width of the opening, springing height
      const sh = new THREE.Shape();
      sh.moveTo(-4.4, 0);
      sh.lineTo(-AW, 0);
      sh.lineTo(-AW, SP);
      sh.absarc(0, SP, AW, PI, 0, true);
      sh.lineTo(AW, 0);
      sh.lineTo(4.4, 0);
      sh.lineTo(4.4, 10.5);
      sh.lineTo(-4.4, 10.5);
      sh.closePath();
      const g = new THREE.ExtrudeGeometry(sh, {
        depth: 1.1,
        bevelEnabled: false,
        curveSegments: 14,
      });
      b.add("fed_rust", g, { m: PF.m4(ex, 0, ez - 0.9, 0), grime: 0.5 });
      PF.colMM(ex - 4.4, 0, ez - 0.9, ex - AW, 10.5, ez + 0.2, {
        walkable: false,
      });
      PF.colMM(ex + AW, 0, ez - 0.9, ex + 4.4, 10.5, ez + 0.2, {
        walkable: false,
      });
      // granite threshold + worn step in the recess
      b.boxMM("granite_dark", ex - AW, 0, ez - 0.9, ex + AW, 0.14, ez + 0.05, {
        grime: 0.7,
      });
      // fanlight: dark glazing above the transom, radial iron grille, bronze transom bar
      const fan = new THREE.Shape();
      fan.moveTo(-AW, 4.45);
      fan.lineTo(AW, 4.45);
      fan.lineTo(AW, SP);
      fan.absarc(0, SP, AW, 0, PI, false);
      fan.lineTo(-AW, 4.45);
      b.add("glass_dark", PF.shapeGeo(fan, 14), {
        m: PF.m4(ex, 0, ez - 0.02, PI),
        uv: "keep",
        noAO: true,
      });
      b.boxMM("bronze", ex - AW, 4.35, ez - 0.2, ex + AW, 4.6, ez, {
        seg: false,
        grime: 0.5,
      });
      for (let i = 0; i <= 8; i++) {
        const a = (i / 8) * PI;
        b.beam(
          "iron",
          V3(ex + Math.cos(a) * 0.35, SP + Math.sin(a) * 0.35, ez - 0.08),
          V3(ex + Math.cos(a) * AW, SP + Math.sin(a) * AW, ez - 0.08),
          0.045,
          0.045,
          {},
        );
        if (i < 8) {
          const a2 = ((i + 1) / 8) * PI;
          b.beam(
            "iron",
            V3(ex + Math.cos(a) * 1.2, SP + Math.sin(a) * 1.2, ez - 0.08),
            V3(ex + Math.cos(a2) * 1.2, SP + Math.sin(a2) * 1.2, ez - 0.08),
            0.04,
            0.04,
            {},
          );
        }
      }
      for (const x of [-1.4, -0.7, 0, 0.7, 1.4])
        b.beam(
          "iron",
          V3(ex + x, 4.6, ez - 0.08),
          V3(ex + x, SP, ez - 0.08),
          0.04,
          0.04,
          {},
        );
      b.cyl("bronze", ex, SP - 0.05, ez - 0.1, 0.35, 0.35, 0.12, 12, {
        hSeg: 1,
        rx: HP,
      });
      // the lit vestibule seen through the gap of the forced leaf (painted interior card: warm lamp, marble floor,
      // the silhouette of the revolving drum) — the one warm light on a dead facade says "the way in is here"
      const vestK = PF.texMat(
        "fed_vest_card",
        PF.canvasTex(
          "pf_fed_vest_card",
          256,
          512,
          (ctx, w, h) => {
            ctx.fillStyle = "#120d08";
            ctx.fillRect(0, 0, w, h);
            const gl = ctx.createRadialGradient(
              w * 0.5,
              h * 0.42,
              10,
              w * 0.5,
              h * 0.5,
              h * 0.55,
            );
            gl.addColorStop(0, "rgba(255,196,120,0.95)");
            gl.addColorStop(0.35, "rgba(160,104,52,0.75)");
            gl.addColorStop(1, "rgba(20,14,8,0)");
            ctx.fillStyle = gl;
            ctx.fillRect(0, 0, w, h);
            // marble floor in perspective
            ctx.fillStyle = "#6a5a44";
            ctx.beginPath();
            ctx.moveTo(0, h);
            ctx.lineTo(w, h);
            ctx.lineTo(w * 0.72, h * 0.66);
            ctx.lineTo(w * 0.28, h * 0.66);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = "rgba(30,22,14,0.8)";
            ctx.lineWidth = 2;
            for (let i = 0; i <= 6; i++) {
              const t = i / 6;
              ctx.beginPath();
              ctx.moveTo(w * t, h);
              ctx.lineTo(w * (0.28 + 0.44 * t), h * 0.66);
              ctx.stroke();
            }
            for (const t of [0.72, 0.8, 0.9]) {
              ctx.beginPath();
              ctx.moveTo(0, h * t + (1 - t) * 0);
              ctx.lineTo(w, h * t);
              ctx.stroke();
            }
            // side walls
            ctx.fillStyle = "rgba(40,30,20,0.85)";
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(w * 0.28, h * 0.2);
            ctx.lineTo(w * 0.28, h * 0.66);
            ctx.lineTo(0, h);
            ctx.closePath();
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(w, 0);
            ctx.lineTo(w * 0.72, h * 0.2);
            ctx.lineTo(w * 0.72, h * 0.66);
            ctx.lineTo(w, h);
            ctx.closePath();
            ctx.fill();
            // revolving drum silhouette + hanging lamp
            ctx.fillStyle = "rgba(18,12,8,0.9)";
            ctx.fillRect(w * 0.36, h * 0.3, w * 0.28, h * 0.03);
            ctx.fillRect(w * 0.36, h * 0.62, w * 0.28, h * 0.03);
            for (const x of [0.37, 0.5, 0.62])
              ctx.fillRect(w * x, h * 0.3, 5, h * 0.34);
            ctx.fillRect(w * 0.5 - 1, 0, 2, h * 0.16);
            ctx.fillStyle = "#ffe0a0";
            ctx.beginPath();
            ctx.arc(w * 0.5, h * 0.18, 9, 0, TAU);
            ctx.fill();
          },
          { clamp: true },
        ),
        { emissive: 0.85, rough: 0.9 },
      );
      b.quad(vestK, ex + 1.12, 0.14 + 4.25 / 2, ez - 0.015, 2.1, 4.25, {
        ry: PI,
        noAO: true,
      });
      // bronze double doors: the west leaf shut, the east leaf forced and hanging open onto the street
      const leaf = (hx, dir, ang) => {
        const M = PF.m4(hx, 0.14, ez - 0.1, ang);
        const add = (key, gw, gh, gd, lx, ly, lz, o) =>
          b.add(
            key,
            new THREE.BoxGeometry(gw, gh, gd),
            Object.assign(
              { m: new THREE.Matrix4().multiplyMatrices(M, PF.m4(lx, ly, lz)) },
              o || {},
            ),
          );
        const cx = dir * 1.07;
        add("bronze", 2.12, 4.2, 0.12, cx, 2.1, 0, { grime: 0.6 });
        for (const [py, ph] of [
          [0.95, 1.3],
          [2.45, 1.3],
          [3.65, 0.7],
        ])
          add("bronze", 1.55, ph, 0.05, cx, py, -0.08, { grime: 0.45 });
        for (const [py, ph] of [
          [0.95, 1.3],
          [2.45, 1.3],
        ])
          add("gilt", 1.25, ph - 0.3, 0.02, cx, py, -0.11, { grime: 0.7 });
        add("bronze", 0.08, 0.5, 0.08, dir * 1.95, 2.0, -0.14); // pull bar
      };
      leaf(ex - AW + 0.05, 1, 0); // west leaf, closed
      leaf(ex + AW - 0.05, -1, -0.38); // east leaf, swung out ~22 degrees
      PF.glow(V3(ex + 1.1, 1.6, ez - 0.25), 0xffb060, 2.2, null, {
        intensity: 0.9,
        flicker: 0.1,
      });
    }
    for (let i = 0; i < 11; i++) {
      // voussoirs
      const a = ((i + 0.5) / 11) * PI,
        rr = 2.2 + 0.55;
      b.box(
        i === 5 ? "fed_stone" : "fed_rust",
        ex + Math.cos(a) * rr,
        5.0 + Math.sin(a) * rr - 0.4,
        ez - 1.0,
        0.85,
        i === 5 ? 1.2 : 0.8,
        0.35,
        { rz: a - HP, seg: false, grime: 0.4 },
      );
    }
    // massive iron gates, one leaf hanging open
    const gate = (x0, ry) => {
      const M = PF.m4(x0, 0, ez - 1.2, ry);
      for (let i = 0; i < 9; i++)
        b.add("iron", new THREE.BoxGeometry(0.06, 5.2, 0.06), {
          m: new THREE.Matrix4().multiplyMatrices(
            M,
            PF.m4(0.12 + i * 0.24, 2.6, 0),
          ),
        });
      for (const y of [0.3, 2.0, 3.6, 5.1])
        b.add("iron", new THREE.BoxGeometry(2.2, 0.1, 0.08), {
          m: new THREE.Matrix4().multiplyMatrices(M, PF.m4(1.1, y, 0)),
        });
      for (let i = 0; i < 4; i++)
        b.add("iron", new THREE.TorusGeometry(0.22, 0.03, 4, 12), {
          m: new THREE.Matrix4().multiplyMatrices(
            M,
            PF.m4(0.35 + i * 0.5, 2.8, 0),
          ),
        });
    };
    gate(ex - 2.2, 0.0);
    gate(ex + 2.2, PI - 1.1);
    PF.colMM(ex - 2.2, 0, ez - 1.25, ex - 0.1, 5.3, ez - 1.1, {
      walkable: false,
    });
    // engraved name band + seal
    const nameK = PF.texMat(
      "fed_name",
      PF.signTex(
        "fed_name",
        ["FEDERAL RESERVE BANK OF NEW YORK"],
        "engraved",
        1024,
        96,
        { bg: "#b8a888", fg: "#3a3020" },
      ),
    );
    b.quad(nameK, ex, 11.3, BZ0 - 0.24, 16, 1.2, { ry: PI });
    const sealK = PF.texMat(
      "fed_seal",
      PF.canvasTex(
        "pf_fed_seal",
        256,
        256,
        (ctx, w) => {
          ctx.fillStyle = "#6a6250";
          ctx.beginPath();
          ctx.arc(w / 2, w / 2, w / 2 - 2, 0, TAU);
          ctx.fill();
          ctx.strokeStyle = "#2a261c";
          ctx.lineWidth = 6;
          ctx.beginPath();
          ctx.arc(w / 2, w / 2, w / 2 - 14, 0, TAU);
          ctx.stroke();
          ctx.fillStyle = "#3a3428";
          ctx.font = "bold 20px Georgia";
          ctx.textAlign = "center";
          const t = "FEDERAL RESERVE SYSTEM ★ NEW YORK ★ ";
          for (let i = 0; i < t.length; i++) {
            const a = (i / t.length) * TAU - HP;
            ctx.save();
            ctx.translate(
              w / 2 + Math.cos(a) * (w / 2 - 34),
              w / 2 + Math.sin(a) * (w / 2 - 34),
            );
            ctx.rotate(a + HP);
            ctx.fillText(t[i], 0, 6);
            ctx.restore();
          }
          // eagle (stylised)
          ctx.fillStyle = "#2a261c";
          ctx.beginPath();
          ctx.moveTo(w / 2, w * 0.3);
          ctx.lineTo(w * 0.72, w * 0.46);
          ctx.lineTo(w * 0.62, w * 0.5);
          ctx.lineTo(w * 0.56, w * 0.7);
          ctx.lineTo(w / 2, w * 0.64);
          ctx.lineTo(w * 0.44, w * 0.7);
          ctx.lineTo(w * 0.38, w * 0.5);
          ctx.lineTo(w * 0.28, w * 0.46);
          ctx.closePath();
          ctx.fill();
        },
        { clamp: true },
      ),
      { rough: 0.6 },
    );
    b.add(sealK, new THREE.CircleGeometry(1.2, 24), {
      m: PF.m4(ex, 8.9, ez - 1.03, PI),
      uv: "keep",
      noAO: true,
    });
    // Yellin lanterns: flanking the entrance, and at the building corners
    yellinLantern(b, ex - 4.2, 5.0, ez - 0.9, PI, true, null);
    yellinLantern(b, ex + 4.2, 5.0, ez - 0.9, PI, false, null);
    for (const [x, z, ry] of [
      [BX0 + 1.2, BZ0 - 0.1, PI],
      [BX1 - 1.2, BZ0 - 0.1, PI],
      [BX0 + 1.2, BZ1 + 0.1, 0],
      [BX1 - 1.2, BZ1 + 0.1, 0],
    ])
      yellinLantern(b, x, 6.2, z, ry, false, null);
    // security post: sandbag emplacements, concertina wire, warning signs, the dead heist crew
    PF.sandbags(b, ex - 7.5, BZ0 - 3.6, ex - 4.8, BZ0 - 3.6, 4, {});
    PF.sandbags(b, ex + 4.8, BZ0 - 3.6, ex + 7.5, BZ0 - 3.6, 4, {});
    for (let i = 0; i < 16; i++) {
      const x = site.x0 + 1 + i * 1.3;
      b.add("iron", new THREE.TorusGeometry(0.4, 0.015, 3, 10), {
        m: PF.m4(x, 0.42, site.z0 + 0.6, HP + 0.2 * Math.sin(i)),
        noAO: true,
      });
    }
    const warnK = PF.texMat(
      "fed_warn",
      PF.signTex(
        "fed_warn",
        ["WARNING", "FEDERAL PROPERTY", "LETHAL FORCE AUTHORIZED"],
        "enamel",
        512,
        320,
        { bg: "#b8a028", fg: "#1a1a14" },
      ),
    );
    for (const x of [ex - 9.5, ex + 9.5]) {
      b.box("iron", x, 0, BZ0 - 2.4, 0.08, 1.4, 0.08, { seg: false });
      b.quad(warnK, x, 1.8, BZ0 - 2.45, 1.4, 0.88, { ry: PI });
    }
    for (const [x, z, a] of [
      [ex - 2.8, BZ0 - 5.2, 0.4],
      [ex + 1.5, BZ0 - 6.4, 2.1],
      [ex + 6.3, BZ0 - 1.5, -0.8],
      [ex - 6.8, BZ0 - 1.4, 1.2],
    ])
      PF.skeleton(b, x, 0.07, z, a);
    D.papers(b, ex, 0.07, BZ0 - 4, 5, 26, 404); // scattered bank notes
    D.rubble(b, BX0 + 2, 0, BZ1 + 1.2, 1.0, 6, 41);
    anchors.entrance = PF.anchor(ex, 0, BZ0 - 3.0, 0); // on the Liberty St sidewalk, facing away from the portal
    anchors.turret1 = PF.anchor(ex - 6.2, 1.2, BZ0 - 3.0, PI);
    anchors.turret2 = PF.anchor(ex + 6.2, 1.2, BZ0 - 3.0, PI);
    anchors.armored_car = PF.anchor(ex - 14, 0, site.z0 - 1.6, HP);
    b.build(root);
    return anchors;
  }

  // ===================================================================
  // INTERIOR
  // ===================================================================
