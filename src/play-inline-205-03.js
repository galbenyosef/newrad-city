// play-inline-205 03 — grime
// Lines 131-1418 of readable/play-inline-205.pretty.js (statement-aligned).
  function buildExterior(site, root) {
    const b = PF.batch("trinity_ext");
    b.ground = 0;
    b.aoH = 4;
    const anchors = {};
    const r = PF.rng("trinity");
    const S = site;

    // ---- churchyard ground, paths -------------------------------------
    b.boxMM("dirt", S.x0, -0.1, S.z0, S.x1, 0.02, S.z1, {
      grime: 0.3,
      segLen: 6,
    });
    for (const [x0, z0, x1, z1] of [
      [S.x0 + 1, S.z0 + 1, S.x1 - 1, Z_N - 0.5],
      [S.x0 + 1, Z_S + 0.5, S.x1 - 1, S.z1 - 1],
    ]) {
      b.boxMM("grass", x0, 0.0, z0, x1, 0.035, z1, { grime: 0.5, segLen: 6 });
    }
    // flagstone forecourt + paths around the church
    b.boxMM("granite", -54.5, 0, 779, S.x1 - 0.3, 0.06, 786, { grime: 0.5 });
    b.boxMM("granite", -82, 0, Z_S, -76, 0.06, S.z1 - 0.3, { grime: 0.5 }); // south gate path
    b.boxMM("granite", S.x0 + 1, 0, Z_S + 0.2, -54, 0.05, Z_S + 1.6, {
      grime: 0.55,
    }); // walk along south aisle
    b.boxMM("granite", S.x0 + 1, 0, Z_N - 1.6, -54, 0.05, Z_N - 0.2, {
      grime: 0.55,
    });

    // ---- perimeter: brownstone kneewall + iron railing with spear points ----
    const railRun = (x0, z0, x1, z1) => {
      const len = Math.hypot(x1 - x0, z1 - z0),
        ry = Math.atan2(-(z1 - z0), x1 - x0);
      b.box("brownstone_dk", (x0 + x1) / 2, 0, (z0 + z1) / 2, len, 0.7, 0.55, {
        ry,
        seg: false,
        grime: 0.6,
      });
      b.box(
        "brownstone_t",
        (x0 + x1) / 2,
        0.7,
        (z0 + z1) / 2,
        len + 0.1,
        0.12,
        0.65,
        { ry, seg: false },
      );
      const n = Math.max(1, Math.round(len / 0.16));
      for (let i = 0; i <= n; i++) {
        const t = i / n,
          px = x0 + (x1 - x0) * t,
          pz = z0 + (z1 - z0) * t;
        if (r() < 0.04) continue; // missing pickets
        b.box("iron", px, 0.82, pz, 0.035, 1.35, 0.035, {
          seg: false,
          grime: 0.2,
          rz: (r() - 0.5) * (r() < 0.1 ? 0.5 : 0.03),
        });
        b.cyl("iron", px, 2.17, pz, 0.001, 0.045, 0.14, 4, { hSeg: 1 });
      }
      b.beam("iron", V3(x0, 1.0, z0), V3(x1, 1.0, z1), 0.05, 0.03);
      b.beam("iron", V3(x0, 2.0, z0), V3(x1, 2.0, z1), 0.05, 0.03);
      for (let p = 0; p <= len; p += 3.2) {
        const t = p / len,
          px = x0 + (x1 - x0) * t,
          pz = z0 + (z1 - z0) * t;
        b.box("brownstone_dk", px, 0, pz, 0.75, 1.0, 0.75, {
          seg: false,
          grime: 0.5,
        });
        b.box("iron", px, 1.0, pz, 0.12, 1.5, 0.12, { seg: false });
        b.sphere("iron", px, 2.6, pz, 0.1, { ws: 6, hs: 4 });
      }
      PF.colWall(x0, z0, x1, z1, 0.6, 0, 2.3, { walkable: false });
    };
    const E = S.x1 - 0.5,
      W = S.x0 + 0.5,
      N = S.z0 + 0.5,
      So = S.z1 - 0.5;
    railRun(W, N, E, N); // north
    railRun(W, So, -82, So);
    railRun(-76, So, E, So); // south (gate x -82..-76)
    railRun(W, N, W, So); // west
    railRun(E, N, E, 779.2);
    railRun(E, 785.8, E, So); // east (main gate z 779.2..785.8)
    // gate piers with lanterns
    for (const [x, z] of [
      [E, 779.2],
      [E, 785.8],
      [-82, So],
      [-76, So],
    ]) {
      b.box("brownstone_t", x, 0, z, 1.1, 2.8, 1.1, { seg: false, grime: 0.5 });
      K.pinnacle(b, "brownstone_t", x, 2.8, z, 1.0, 1.4, { finial: true });
      b.cyl("iron", x, 3.1, z + (z > 790 ? -0.8 : 0), 0.04, 0.04, 0.6, 4, {
        hSeg: 1,
      });
      PF.col(x, z, 1.1, 1.1, 0, 2.8, 0, { walkable: false });
    }
    // lanterns on the main gate piers (settler work: tin lanterns on hooks)
    for (const z of [779.2, 785.8]) {
      b.box("iron", E - 0.7, 2.3, z, 0.8, 0.05, 0.05, { seg: false });
      b.cyl("lamp_warm", E - 1.05, 1.85, z, 0.12, 0.14, 0.3, 6, {
        hSeg: 1,
        noAO: true,
        grime: 0,
      });
      b.cyl("iron", E - 1.05, 2.15, z, 0.02, 0.16, 0.12, 6, { hSeg: 1 });
      PF.glow(V3(E - 1.05, 2.0, z), 0xffc070, 1.4, null, {
        intensity: 1.2,
        flicker: 0.2,
      });
    }
    // open wrought-iron gate leaves (swung inward)
    for (const [z, a] of [
      [779.4, 1.2],
      [785.6, -1.2],
    ]) {
      const M = PF.m4(E, 0, z, a);
      for (let i = 0; i < 12; i++)
        b.add("iron", new THREE.BoxGeometry(0.035, 2.0, 0.035), {
          m: new THREE.Matrix4().multiplyMatrices(
            M,
            PF.m4(-0.12 - i * 0.24, 1.0, 0),
          ),
        });
      b.add("iron", new THREE.BoxGeometry(2.9, 0.06, 0.04), {
        m: new THREE.Matrix4().multiplyMatrices(M, PF.m4(-1.45, 0.3, 0)),
      });
      b.add("iron", new THREE.BoxGeometry(2.9, 0.06, 0.04), {
        m: new THREE.Matrix4().multiplyMatrices(M, PF.m4(-1.45, 1.8, 0)),
      });
    }

    // ---- TOWER ---------------------------------------------------------
    const tx0 = TX - TW / 2,
      tx1 = TX + TW / 2,
      tz0 = TZ - TW / 2,
      tz1 = TZ + TW / 2;
    b.box("brownstone_dk", TX, 0, TZ, TW + 0.8, 0.9, TW + 0.8, { grime: 0.6 }); // plinth
    K.prismBands(
      b,
      "brownstone_t",
      [
        [tx0, tz0],
        [tx1, tz0],
        [tx1, tz1],
        [tx0, tz1],
      ],
      0.9,
      28,
      7,
      { grime: 0.6 },
    );
    PF.colMM(tx0 - 0.4, 0, tz0 - 0.4, tx1 + 0.4, 28, tz1 + 0.4, {
      walkable: false,
    });
    // string courses
    for (const y of [9, 16.5, 20.2, 27.2])
      b.boxMM(
        "brownstone_dk",
        tx0 - 0.25,
        y,
        tz0 - 0.25,
        tx1 + 0.25,
        y + 0.35,
        tz1 + 0.25,
        { seg: false, grime: 0.4 },
      );
    // clasping corner buttresses with three set-offs, pinnacles above the parapet
    for (const sx of [-1, 1])
      for (const sz of [-1, 1]) {
        const cx = TX + sx * (TW / 2),
          cz = TZ + sz * (TW / 2);
        const steps = [
          [0, 9, 1.5],
          [9, 18, 1.1],
          [18, 27, 0.75],
        ];
        for (const [y0, y1, dp] of steps) {
          b.box(
            "brownstone_t",
            cx + (sx * dp) / 2,
            y0,
            cz - sz * 0.9,
            dp,
            y1 - y0,
            1.3,
            { grime: 0.55 },
          );
          b.box(
            "brownstone_t",
            cx - sx * 0.9,
            y0,
            cz + (sz * dp) / 2,
            1.3,
            y1 - y0,
            dp,
            { grime: 0.55 },
          );
          // sloped set-off cap
          b.box(
            "brownstone_dk",
            cx + (sx * dp) / 2,
            y1 - 0.2,
            cz - sz * 0.9,
            dp + 0.1,
            0.35,
            1.4,
            { rz: sx * 0.35, seg: false },
          );
        }
        K.pinnacle(b, "brownstone_t", cx, 27.2, cz, 1.4, 6.5, {});
      }
    // parapet with crenellations + small arcaded frieze
    for (const [a, c] of [
      [
        [tx0, tz0],
        [tx1, tz0],
      ],
      [
        [tx1, tz0],
        [tx1, tz1],
      ],
      [
        [tx1, tz1],
        [tx0, tz1],
      ],
      [
        [tx0, tz1],
        [tx0, tz0],
      ],
    ]) {
      PF.crenels(
        b,
        "brownstone_t",
        a[0],
        a[1],
        c[0],
        c[1],
        27.55,
        0.5,
        1.6,
        0.7,
        0.5,
      );
    }
    // main portal (east face): three receding pointed orders + doors + gable
    const pf = tx1 + 0.02;
    b.box("brownstone_dk", pf + 0.35, 0, TZ, 0.7, 7.6, 5.6, {
      seg: false,
      grime: 0.6,
    }); // portal block
    for (let o = 0; o < 3; o++) {
      const w = 3.0 + o * 0.7,
        h = 6.0 + o * 0.5,
        out = 0.72 - o * 0.12;
      PF.lancetWindow(b, pf + out, 0.2, TZ, HP, w, h, {
        frame: o % 2 ? "brownstone_t" : "limestone",
        frameW: 0.3,
        sill: false,
        k: 0.9,
      });
    }
    // doors (oak leaves with iron strap hinges)
    b.add("oak", PF.shapeGeo(PF.lancetShape(2.9, 5.9, 0.9), 6), {
      m: PF.m4(pf + 0.74, 0.2, TZ, HP),
      uv: "box",
      grime: 0.5,
    });
    for (let k = 0; k < 4; k++)
      for (const sz of [-1, 1])
        b.box("iron", pf + 0.8, 1.0 + k * 1.1, TZ + sz * 0.8, 0.04, 0.09, 1.3, {
          seg: false,
        });
    b.box("iron", pf + 0.8, 0.2, TZ, 0.05, 5.0, 0.06, { seg: false });
    // settlers keep a pair of tin lanterns burning either side of the portal (reads as "open" from 7th Avenue)
    for (const sz of [-1, 1]) {
      const lz = TZ + sz * 3.35;
      b.beam(
        "iron",
        V3(pf + 0.72, 3.4, lz),
        V3(pf + 1.4, 3.4, lz),
        0.05,
        0.05,
        {},
      );
      b.cyl("lamp_warm", pf + 1.4, 2.72, lz, 0.13, 0.15, 0.34, 6, {
        hSeg: 1,
        noAO: true,
        grime: 0,
      });
      b.cyl("iron", pf + 1.4, 3.06, lz, 0.02, 0.18, 0.14, 6, { hSeg: 1 });
      b.cyl("iron", pf + 1.4, 2.66, lz, 0.17, 0.17, 0.06, 6, { hSeg: 1 });
      PF.glow(V3(pf + 1.4, 2.9, lz), 0xffc070, 1.6, null, {
        intensity: 1.3,
        flicker: 0.25,
      });
    }
    // worn threshold slab & a boot-scraper
    b.box("granite", pf + 1.3, 0, TZ, 1.2, 0.08, 3.4, {
      seg: false,
      grime: 0.7,
    });
    // gable (wimperg) over the portal with crockets + a niche statue
    K.pediment(b, "brownstone_t", pf + 0.7, 7.6, TZ, 5.8, 2.8, 0.4, HP, {});
    b.cyl("limestone", pf + 0.75, 8.1, TZ, 0.22, 0.28, 1.6, 8, { hSeg: 2 });
    b.sphere("limestone", pf + 0.75, 9.9, TZ, 0.2, {});
    // large window above the portal (tracery) + clock faces on all four sides
    PF.lancetWindow(b, tx1 + 0.05, 10.2, TZ, HP, 3.2, 5.6, {
      glass: "glass_dark",
      frame: "brownstone_dk",
      frameW: 0.3,
      mullion: true,
    });
    const clockK = PF.texMat(
      "trinity_clock",
      PF.canvasTex(
        "pf_trinity_clock",
        256,
        256,
        (ctx, w) => {
          ctx.fillStyle = "#d8d0b8";
          ctx.beginPath();
          ctx.arc(w / 2, w / 2, w / 2 - 2, 0, TAU);
          ctx.fill();
          ctx.strokeStyle = "#2a261e";
          ctx.lineWidth = 6;
          ctx.beginPath();
          ctx.arc(w / 2, w / 2, w / 2 - 8, 0, TAU);
          ctx.stroke();
          ctx.fillStyle = "#1e1a14";
          ctx.font = "bold 22px Georgia, serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          const R = [
            "XII",
            "I",
            "II",
            "III",
            "IIII",
            "V",
            "VI",
            "VII",
            "VIII",
            "IX",
            "X",
            "XI",
          ];
          for (let i = 0; i < 12; i++) {
            const a = (i / 12) * TAU - HP;
            ctx.fillText(
              R[i],
              w / 2 + Math.cos(a) * (w / 2 - 30),
              w / 2 + Math.sin(a) * (w / 2 - 30),
            );
          }
          // hands stopped at 9:47 (the morning of March 5, 1967)
          const hand = (a, l, th) => {
            ctx.lineWidth = th;
            ctx.beginPath();
            ctx.moveTo(w / 2, w / 2);
            ctx.lineTo(
              w / 2 + Math.cos(a - HP) * l,
              w / 2 + Math.sin(a - HP) * l,
            );
            ctx.stroke();
          };
          ctx.strokeStyle = "#141008";
          hand(((9 + 47 / 60) / 12) * TAU, 55, 8);
          hand((47 / 60) * TAU, 85, 5);
          const g = ctx.createRadialGradient(
            w * 0.4,
            w * 0.4,
            10,
            w / 2,
            w / 2,
            w / 2,
          );
          g.addColorStop(0, "rgba(255,255,255,0)");
          g.addColorStop(1, "rgba(60,40,20,0.45)");
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(w / 2, w / 2, w / 2, 0, TAU);
          ctx.fill();
        },
        { clamp: true },
      ),
      { rough: 0.6 },
    );
    for (const [nx, nz, ry] of [
      [1, 0, HP],
      [-1, 0, -HP],
      [0, 1, 0],
      [0, -1, PI],
    ]) {
      const cx = TX + nx * (TW / 2 + 0.06),
        cz = TZ + nz * (TW / 2 + 0.06);
      const disc = new THREE.CircleGeometry(1.5, 28);
      b.add(clockK, disc, {
        m: PF.m4(cx, 18.3, cz, ry),
        uv: "keep",
        grime: 0.2,
        noAO: true,
      });
      const ring = new THREE.TorusGeometry(1.6, 0.16, 5, 28);
      b.add("limestone", ring, {
        m: PF.m4(cx + nx * 0.05, 18.3, cz + nz * 0.05, ry),
        grime: 0.4,
      });
    }
    // belfry stage: paired louvred lancets on each face
    for (const [nx, nz, ry] of [
      [1, 0, HP],
      [-1, 0, -HP],
      [0, 1, 0],
      [0, -1, PI],
    ]) {
      for (const off of [-1.5, 1.5]) {
        const cx = TX + nx * (TW / 2 + 0.03) + (nz !== 0 ? off : 0),
          cz = TZ + nz * (TW / 2 + 0.03) + (nx !== 0 ? off : 0);
        PF.lancetWindow(b, cx, 20.9, cz, ry, 1.6, 5.2, {
          glass: "glass_broken",
          frame: "brownstone_dk",
          frameW: 0.24,
          sill: true,
        });
        for (let k = 0; k < 9; k++)
          b.box(
            "rotten",
            cx + nx * 0.12,
            21.2 + k * 0.42,
            cz + nz * 0.12,
            nx !== 0 ? 0.05 : 1.5,
            0.05,
            nx !== 0 ? 1.5 : 0.05,
            {
              rx: nz !== 0 ? -0.6 * nz : 0,
              rz: nx !== 0 ? 0.6 * nx : 0,
              seg: false,
            },
          );
      }
    }
    // ---- SPIRE: octagonal, broach base, lucarnes, crockets, gilt cross --
    const spBase = 28.2,
      spTop = 60,
      R0 = 3.7;
    b.cyl("brownstone_t", TX, 27.6, TZ, R0 + 0.3, R0 + 0.5, 1.2, 8, {
      hSeg: 1,
      thetaStart: PI / 8,
    });
    b.cyl(
      "brownstone_t",
      TX,
      spBase + 0.6,
      TZ,
      0.35,
      R0,
      spTop - spBase - 0.6,
      8,
      { hSeg: 8, thetaStart: PI / 8, grime: 0.55 },
    );
    b.cyl("brownstone_dk", TX, spBase + 0.6, TZ, R0 * 0.72, R0 + 0.05, 4.5, 8, {
      hSeg: 1,
      thetaStart: PI / 8,
    }); // band
    for (let i = 0; i < 8; i++) {
      const a = ((i + 0.5) / 8) * TAU + PI / 8;
      // crockets on each arris
      for (let k = 0; k < 10; k++) {
        const t = 0.12 + k * 0.085,
          y = spBase + 0.6 + t * (spTop - spBase - 0.6),
          rr = R0 + (0.35 - R0) * t + 0.12;
        b.box(
          "brownstone_t",
          TX + Math.cos(a) * rr,
          y,
          TZ + Math.sin(a) * rr,
          0.22,
          0.3,
          0.22,
          { ry: -a, rz: 0.4, seg: false, grime: 0.3 },
        );
      }
      // lucarnes (small gabled dormers) on alternate faces
      if (i % 2 === 0) {
        const fa = a + PI / 8,
          rr = R0 * 0.78,
          lx = TX + Math.cos(fa) * rr,
          lz = TZ + Math.sin(fa) * rr;
        const ry = Math.atan2(Math.cos(fa), Math.sin(fa));
        b.box("brownstone_t", lx, spBase + 4.2, lz, 1.2, 2.2, 1.0, {
          ry,
          seg: false,
        });
        K.pediment(
          b,
          "brownstone_t",
          lx,
          spBase + 6.4,
          lz,
          1.4,
          1.1,
          1.0,
          ry,
          {},
        );
        b.quad(
          "glass_broken",
          lx + Math.cos(fa) * 0.52,
          spBase + 5.1,
          lz + Math.sin(fa) * 0.52,
          0.7,
          1.4,
          { ry, noAO: true },
        );
      }
    }
    b.cyl("gilt", TX, spTop - 0.3, TZ, 0.12, 0.18, 1.4, 6, { hSeg: 1 });
    b.box("gilt", TX, spTop + 1.0, TZ, 0.14, 2.0, 0.14, { seg: false });
    b.box("gilt", TX, spTop + 2.1, TZ, 0.9, 0.14, 0.14, { seg: false });

    // ---- NAVE, AISLES, CLERESTORY, ROOFS -------------------------------
    const bays = 7,
      bayW = (NAVE_X1 - NAVE_X0) / bays;
    // aisles (outer walls to 8 m)
    K.prismBands(
      b,
      "brownstone_t",
      [
        [NAVE_X0, Z_N],
        [NAVE_X1, Z_N],
        [NAVE_X1, Z_S],
        [NAVE_X0, Z_S],
      ],
      0,
      8.2,
      4.2,
      { grime: 0.6 },
    );
    // clerestory
    K.prismBands(
      b,
      "brownstone_t",
      [
        [NAVE_X0, CL_N],
        [NAVE_X1, CL_N],
        [NAVE_X1, CL_S],
        [NAVE_X0, CL_S],
      ],
      8.2,
      14.6,
      3.2,
      { grime: 0.5 },
    );
    PF.colMM(NAVE_X0, 0, Z_N, NAVE_X1, 14.6, Z_S, { walkable: false });
    // lean-to aisle roofs (slate)
    for (const [zo, zi, sg] of [
      [Z_N, CL_N, -1],
      [Z_S, CL_S, 1],
    ]) {
      const len = Math.hypot(zi - zo, 2.6),
        ang = Math.atan2(2.6, Math.abs(zi - zo));
      b.box(
        "slate",
        (NAVE_X0 + NAVE_X1) / 2,
        8.1 + 1.3,
        (zo + zi) / 2,
        NAVE_X1 - NAVE_X0 + 0.4,
        0.22,
        len + 0.5,
        { rx: sg * ang, seg: true, grime: 0.6 },
      );
    }
    // nave gable roof (steep)
    const roofSh = new THREE.Shape();
    roofSh.moveTo(CL_N - 0.5, 0);
    roofSh.lineTo(CL_S + 0.5, 0);
    roofSh.lineTo(TZ, 7.2);
    roofSh.closePath();
    {
      const g = new THREE.ExtrudeGeometry(roofSh, {
        depth: NAVE_X1 - CH_X0 - 8 + 0.6,
        bevelEnabled: false,
      });
      // shape in (z, y) → rotate so extrusion runs along -x
      g.rotateY(-HP);
      b.add("slate", g, {
        m: PF.m4(NAVE_X1 + 0.3, 14.4, 0, 0, 0, 0),
        grime: 0.55,
      });
    }
    // roof hole (collapsed bay): charred rafters sticking out
    for (let k = 0; k < 6; k++)
      b.beam(
        "rotten",
        V3(-79 - k * 0.9, 14.6, CL_N + 0.3),
        V3(-79 - k * 0.9 + (r() - 0.5) * 0.6, 18.5 + r(), TZ - 0.4),
        0.18,
        0.18,
        { grime: 0.8 },
      );
    b.box("tar", -81.5, 14.4, TZ - 1.5, 5.5, 0.05, 2.5, {
      rx: -0.8,
      seg: false,
    });
    // ridge cresting
    for (let x = CH_X0 + 8.5; x < NAVE_X1; x += 1.2)
      b.box("iron", x, 21.55, TZ, 0.06, 0.45, 0.06, { seg: false });
    // buttresses with pinnacles, aisle windows, clerestory windows
    for (let i = 0; i <= bays; i++) {
      const x = NAVE_X0 + i * bayW;
      for (const [zw, sg] of [
        [Z_N, -1],
        [Z_S, 1],
      ]) {
        b.box("brownstone_t", x, 0, zw + sg * 0.75, 1.1, 5.2, 1.5, {
          seg: false,
          grime: 0.6,
        });
        b.box("brownstone_t", x, 5.2, zw + sg * 0.5, 1.0, 3.2, 1.0, {
          seg: false,
          grime: 0.55,
        });
        b.box("brownstone_dk", x, 5.0, zw + sg * 0.75, 1.15, 0.3, 1.6, {
          rx: sg * 0.4,
          seg: false,
        });
        if (!(i === 4 && sg < 0))
          K.pinnacle(b, "brownstone_t", x, 8.2, zw + sg * 0.4, 0.8, 3.4, {});
        PF.col(x, zw + sg * 0.75, 1.1, 1.5, 0, 5.2, 0, { walkable: false });
      }
    }
    // aisle & clerestory lancets: leaded stained glass lit from inside by the settlement's lamps (reads even with the
    // walls in shadow), a quatrefoil ring in each aisle window head, the odd pane smashed or boarded
    for (let i = 0; i < bays; i++) {
      const x = NAVE_X0 + (i + 0.5) * bayW;
      for (const [zw, ry] of [
        [Z_N - 0.04, PI],
        [Z_S + 0.04, 0],
      ]) {
        const porch = i === 3 && ry === PI; // north porch occupies this bay
        if (!porch) {
          const roll = r();
          PF.lancetWindow(b, x, 1.8, zw, ry, 2.0, 5.0, {
            glass:
              roll < 0.12
                ? "glass_broken"
                : roll < 0.2
                  ? "planks"
                  : PF.stainedKey(i % 3, 0.55),
            frame: "brownstone_dk",
            frameW: 0.22,
            mullion: true,
          });
          const sgn = ry === 0 ? 1 : -1;
          b.add("brownstone_dk", new THREE.TorusGeometry(0.36, 0.06, 4, 14), {
            m: PF.m4(x, 1.8 + 5.0 - 2.0 * 0.62, zw + sgn * 0.06, ry),
            grime: 0.4,
          });
          for (let k = 0; k < 4; k++) {
            const a = k * HP + PI / 4;
            b.add(
              "brownstone_dk",
              new THREE.TorusGeometry(0.13, 0.035, 3, 10),
              {
                m: PF.m4(
                  x + Math.cos(a) * 0.2,
                  1.8 + 5.0 - 2.0 * 0.62 + Math.sin(a) * 0.2,
                  zw + sgn * 0.06,
                  ry,
                ),
                grime: 0.4,
              },
            );
          }
        }
        const zc = ry === 0 ? CL_S + 0.04 : CL_N - 0.04;
        for (const off of [-0.7, 0.7])
          PF.lancetWindow(b, x + off, 10.0, zc, ry, 1.0, 3.2, {
            glass: r() < 0.15 ? "glass_dark" : PF.stainedKey((i + 1) % 3, 0.55),
            frame: "brownstone_dk",
            frameW: 0.16,
            sill: false,
          });
      }
    }
    // north porch (onto the Wall Street side): shallow gabled portal, three moulded orders, bronze doors
    {
      const px = NAVE_X0 + 3.5 * bayW,
        pz = Z_N - 0.9;
      b.boxMM("brownstone_t", px - 2.3, 0, pz, px + 2.3, 6.4, Z_N, {
        grime: 0.6,
      });
      K.pediment(b, "brownstone_t", px, 6.4, pz + 0.45, 4.9, 2.2, 0.9, PI, {});
      K.pinnacle(b, "brownstone_t", px - 2.3, 6.4, pz + 0.3, 0.6, 2.4, {});
      K.pinnacle(b, "brownstone_t", px + 2.3, 6.4, pz + 0.3, 0.6, 2.4, {});
      for (let o = 0; o < 3; o++)
        PF.lancetWindow(
          b,
          px,
          0.15,
          pz - 0.05 - o * 0.001,
          PI,
          2.3 - o * 0.35,
          5.0 - o * 0.35,
          {
            frame: o % 2 ? "brownstone_dk" : "limestone",
            frameW: 0.2,
            sill: false,
            out: 0.08 + (2 - o) * 0.07,
          },
        );
      b.add("bronze", PF.shapeGeo(PF.lancetShape(1.6, 4.2, 0.85), 6), {
        m: PF.m4(px, 0.15, pz - 0.04, PI),
        uv: "box",
        grime: 0.5,
      });
      for (let k = 0; k < 5; k++)
        b.box("bronze_patina", px, 0.5 + k * 0.72, pz - 0.08, 1.5, 0.06, 0.04, {
          seg: false,
        }); // panel mouldings
      b.box("iron", px, 0.15, pz - 0.09, 0.05, 3.3, 0.05, { seg: false });
      const sgK = PF.texMat(
        "trinity_n_sign",
        PF.signTex(
          "trinity_n_sign",
          ["TRINITY", "SANCTUARY"],
          "engraved",
          512,
          192,
          { bg: "#d8ccb0", fg: "#3a1a10" },
        ),
      );
      b.quad(sgK, px, 7.35, pz - 0.02, 1.9, 0.72, { ry: PI });
      PF.colMM(px - 2.3, 0, pz, px + 2.3, 6.4, Z_N, { walkable: false });
      b.cyl("lamp_warm", px - 1.6, 3.3, pz - 0.25, 0.12, 0.14, 0.3, 6, {
        hSeg: 1,
        noAO: true,
        grime: 0,
      });
      b.cyl("lamp_warm", px + 1.6, 3.3, pz - 0.25, 0.12, 0.14, 0.3, 6, {
        hSeg: 1,
        noAO: true,
        grime: 0,
      });
      PF.glow(V3(px, 3.4, pz - 0.4), 0xffc070, 2.6, null, {
        intensity: 1.1,
        flicker: 0.2,
      });
    }
    // aisle parapets (pierced quatrefoil band approximated by a coped wall)
    for (const zw of [Z_N, Z_S])
      b.boxMM("brownstone_dk", NAVE_X0, 8.2, zw - 0.3, NAVE_X1, 8.8, zw + 0.3, {
        grime: 0.5,
      });
    // east ends of the aisles (beside the tower): small doors + lancets
    for (const [z0, z1] of [
      [Z_N, tz0 - 0.4],
      [tz1 + 0.4, Z_S],
    ]) {
      const zc = (z0 + z1) / 2;
      PF.lancetWindow(b, NAVE_X1 + 0.04, 1.2, zc, HP, 1.2, 3.2, {
        glass: "glass_dark",
        frame: "brownstone_dk",
        frameW: 0.18,
      });
    }
    // ---- CHANCEL (west) with the great window ---------------------------
    K.prismBands(
      b,
      "brownstone_t",
      [
        [CH_X0, 777.5],
        [NAVE_X0, 777.5],
        [NAVE_X0, 787.5],
        [CH_X0, 787.5],
      ],
      0,
      12.5,
      4.2,
      { grime: 0.6 },
    );
    PF.colMM(CH_X0, 0, 777.5, NAVE_X0, 12.5, 787.5, { walkable: false });
    {
      const sh = new THREE.Shape();
      sh.moveTo(777.1 - TZ, 0);
      sh.lineTo(787.9 - TZ, 0);
      sh.lineTo(0, 6.4);
      sh.closePath();
      const g = new THREE.ExtrudeGeometry(sh, {
        depth: NAVE_X0 - CH_X0 + 0.4,
        bevelEnabled: false,
      });
      g.rotateY(-HP);
      b.add("slate", g, { m: PF.m4(NAVE_X0 + 0.2, 12.4, TZ), grime: 0.55 });
      // gable wall
      const gw = new THREE.ExtrudeGeometry(sh, {
        depth: 0.8,
        bevelEnabled: false,
      });
      gw.rotateY(-HP);
      b.add("brownstone_t", gw, {
        m: PF.m4(CH_X0 + 0.8, 12.45, TZ),
        grime: 0.5,
      });
      K.pinnacle(b, "brownstone_t", CH_X0 + 0.3, 18.6, TZ, 0.7, 2.4, {});
      // nave west gable above the chancel roof
      const sh2 = new THREE.Shape();
      sh2.moveTo(CL_N - TZ, 0);
      sh2.lineTo(CL_S - TZ, 0);
      sh2.lineTo(0, 7.0);
      sh2.closePath();
      const gw2 = new THREE.ExtrudeGeometry(sh2, {
        depth: 0.8,
        bevelEnabled: false,
      });
      gw2.rotateY(-HP);
      b.add("brownstone_t", gw2, {
        m: PF.m4(NAVE_X0 + 0.8, 14.5, TZ),
        grime: 0.5,
      });
    }
    PF.lancetWindow(b, CH_X0 - 0.05, 3.2, TZ, -HP, 5.2, 8.6, {
      glass: PF.stainedKey(1, 0.25),
      frame: "brownstone_dk",
      frameW: 0.35,
      mullion: true,
    });
    for (const sz of [-1, 1])
      for (const sx of [0]) {
        const cz = TZ + sz * 5.3;
        b.box(
          "brownstone_t",
          CH_X0 + 0.6 + sx,
          0,
          cz + sz * 0.5,
          1.4,
          11,
          1.4,
          { seg: false, grime: 0.55 },
        );
        K.pinnacle(
          b,
          "brownstone_t",
          CH_X0 + 0.6,
          11,
          cz + sz * 0.5,
          1.0,
          3.0,
          {},
        );
        PF.col(CH_X0 + 0.6, cz + sz * 0.5, 1.4, 1.4, 0, 11, 0, {
          walkable: false,
        });
        PF.lancetWindow(
          b,
          (CH_X0 + NAVE_X0) / 2,
          3,
          TZ + sz * 5.04,
          sz > 0 ? 0 : PI,
          1.6,
          5,
          { glass: "glass_dark", frame: "brownstone_dk", frameW: 0.2 },
        );
      }

    // ---- LOOKOUT platform (settlers' timber balcony off the belfry, south face) ----
    {
      // (widened/deepened in loop round 2 so the arrival from the belfry has room to face out along the platform)
      const y = LOOKOUT.y,
        x0 = TX - 3.6,
        x1 = TX + 3.6,
        z0 = tz1,
        z1 = tz1 + 3.4;
      b.boxMM("planks", x0, y - 0.25, z0, x1, y, z1, { grime: 0.6 });
      PF.colMM(x0, y - 0.25, z0, x1, y, z1, { surface: "wood" });
      for (const x of [x0 + 0.1, x1 - 0.1])
        b.beam(
          "rust",
          V3(x, y - 0.2, z1 - 0.1),
          V3(x, y - 3.4, z0 + 0.1),
          0.14,
          0.14,
        );
      PF.sandbags(b, x0 + 0.2, z1 - 0.3, x1 - 0.2, z1 - 0.3, 3, { y });
      PF.sandbags(b, x0 + 0.2, z0 + 0.3, x0 + 0.2, z1 - 0.3, 3, { y });
      PF.sandbags(b, x1 - 0.2, z0 + 0.3, x1 - 0.2, z1 - 0.3, 3, { y });
      PF.colMM(x0 - 0.1, y, z1 - 0.1, x1 + 0.1, y + 1.3, z1 + 0.2, {
        walkable: false,
      });
      // hatch door back into the belfry
      // (at x +1.6, the same place as the belfry-side door inside)
      b.box("rotten", TX + 1.6, y, tz1 + 0.05, 1.3, 2.2, 0.1, { seg: false });
      for (const dx of [-0.72, 0.72])
        b.box("oak", TX + 1.6 + dx, y, tz1 + 0.08, 0.14, 2.35, 0.16, {
          seg: false,
        });
      b.box("oak", TX + 1.6, y + 2.2, tz1 + 0.08, 1.58, 0.14, 0.16, {
        seg: false,
      });
      anchors.lookout = PF.anchor(TX + 1.0, y, tz1 + 1.3, HP + 0.35); // looking WSW along the platform, over the churchyard
      PF.door({
        id: "pf_tr_lookout_in",
        pos: V3(TX + 1.6, y + 1.4, tz1 + 0.3),
        label: "Trinity Belfry",
        verb: "Enter",
        radius: 1.1,
        target: null,
        sound: "door_open",
      });
    }

    // ---- CHURCHYARD: headstones, Hamilton's tomb, trees, beds -------------
    const avoid = (x, z) =>
      (x > -83 && x < -75 && z > Z_S) ||
      (x > -56 && z > 778 && z < 787) ||
      (x > -76 && x < -66 && z > 791 && z < 799) ||
      Math.abs(z - Z_S - 0.9) < 1.1 ||
      Math.abs(z - Z_N + 0.9) < 1.1;
    // south yard rows
    for (let x = -107; x < -56; x += 1.9)
      for (let z = 792.5; z < 797.8; z += 1.6) {
        const px = x + (r() - 0.5) * 0.6,
          pz = z + (r() - 0.5) * 0.4;
        if (avoid(px, pz) || r() < 0.18) continue;
        headstone(b, px, pz, (r() - 0.5) * 0.3, r);
      }
    // north yard: headstones east half, garden beds west half
    for (let x = -80; x < -56; x += 1.9)
      for (let z = 768; z < 773; z += 1.6) {
        const px = x + (r() - 0.5) * 0.6,
          pz = z + (r() - 0.5) * 0.4;
        if (avoid(px, pz) || r() < 0.2) continue;
        headstone(b, px, pz, PI + (r() - 0.5) * 0.3, r);
      }
    // older rows further west in the north yard, badly leaning / toppled (the ground has heaved)
    for (let x = -86; x < -80; x += 1.7)
      for (let z = 767.6; z < 773.5; z += 1.5) {
        const px = x + (r() - 0.5) * 0.5,
          pz = z + (r() - 0.5) * 0.4;
        if (r() < 0.15) continue;
        if (r() < 0.2) {
          b.box("slate", px, 0.02, pz, 0.6, 0.09, 0.9, {
            ry: r() * 0.6,
            seg: false,
            grime: 0.7,
          });
          continue;
        } // fallen flat
        const M = PF.m4(
          px,
          0,
          pz,
          PI + (r() - 0.5) * 0.4,
          (r() - 0.5) * 0.6,
          (r() - 0.5) * 0.4,
        );
        const h = 0.6 + r() * 0.5;
        b.add(
          r() < 0.6 ? "slate" : "limestone",
          new THREE.BoxGeometry(0.5, h, 0.09),
          {
            m: new THREE.Matrix4().multiplyMatrices(
              M,
              PF.m4(0, h / 2 - 0.1, 0),
            ),
            grime: 0.75,
          },
        );
      }
    // settlers' own graves beside the beds: fresh mounds, plank crosses, a helmet on one
    for (let k = 0; k < 4; k++) {
      const gx = -85.5 + k * 1.5,
        gz = 766.9 + 0.1;
      b.sphere("dirt", gx, 0, gz + 1.2, 1, {
        sx: 0.5,
        sy: 0.24,
        sz: 1.0,
        ws: 10,
        hs: 4,
        phiLen: HP,
      });
      b.box("rotten", gx, 0, gz + 0.1, 0.07, 1.0, 0.05, {
        rz: (r() - 0.5) * 0.15,
        seg: false,
      });
      b.box("rotten", gx, 0.62, gz + 0.1, 0.5, 0.07, 0.05, { seg: false });
    }
    b.sphere("army", -84.0, 0.95, 767.05, 0.17, {
      ws: 8,
      hs: 5,
      phiLen: PI / 2,
    });
    // the north walk: a trader's welcome banner on the Wall Street railing, lanterns on the buttresses, string lights
    const nBan = PF.texMat(
      "trinity_nbanner",
      PF.signTex(
        "trinity_nbanner",
        ["TRINITY SANCTUARY", "TRADERS WELCOME · DOCTOR · GATE ON BROADWAY ▸"],
        "banner",
        1024,
        256,
        { bg: "#d8ccb0", fg: "#6a1a14", size: 58 },
      ),
    );
    b.quad(nBan, -64, 1.55, S.z0 + 0.14, 6.4, 1.5, { ry: PI, grime: 0.4 });
    for (const x of [-67.2, -60.8])
      b.beam(
        "rope",
        V3(x, 2.3, S.z0 + 0.16),
        V3(x, 0.8, S.z0 + 0.16),
        0.02,
        0.02,
      );
    for (const i of [1, 3, 5, 6]) {
      const x = NAVE_X0 + i * bayW;
      b.beam("iron", V3(x, 3.6, Z_N - 1.5), V3(x, 3.6, Z_N - 2.2), 0.05, 0.05);
      b.cyl("lamp_warm", x, 3.0, Z_N - 2.2, 0.12, 0.14, 0.3, 6, {
        hSeg: 1,
        noAO: true,
        grime: 0,
      });
      b.cyl("iron", x, 3.3, Z_N - 2.2, 0.02, 0.16, 0.12, 6, { hSeg: 1 });
      if (i !== 3)
        PF.glow(V3(x, 3.15, Z_N - 2.2), 0xffc070, 1.5, null, {
          intensity: 1.1,
          flicker: 0.25,
        });
    }
    D.stringLights(
      b,
      V3(tx0 - 0.2, 6.5, tz0 - 0.2),
      V3(-66, 3.2, S.z0 + 0.6),
      0.8,
      14,
      0xffc890,
    );
    // watch nest at the north-east corner of the yard
    PF.sandbags(b, -56.5, 767.4, -53.0, 767.4, 3, {});
    PF.sandbags(b, -53.0, 767.6, -53.0, 770.6, 3, {});
    PF.barrel(b, -54.6, 0, 769.4, { fire: true });
    b.box("rotten", -53.6, 0, 767.8, 0.1, 3.4, 0.1, { seg: false });
    const flK = PF.texMat(
      "trinity_flag",
      PF.signTex("trinity_flag", ["✝"], "banner", 256, 160, {
        bg: "#e8e0c8",
        fg: "#8a1a14",
        size: 110,
      }),
      { side: THREE.DoubleSide },
    );
    b.quad(flK, -54.35, 2.9, 767.8, 1.4, 0.9, { grime: 0.3 });
    // a few obelisks and table tombs
    for (const [x, z] of [
      [-99, 794.5],
      [-88, 796],
      [-64, 770.5],
      [-104, 771],
    ]) {
      b.box("limestone", x, 0, z, 1.0, 0.5, 1.0, { seg: false, grime: 0.6 });
      b.cyl("limestone", x, 0.5, z, 0.12, 0.36, 3.2 + r() * 1.5, 4, {
        hSeg: 2,
        thetaStart: PI / 4,
        grime: 0.6,
      });
      PF.col(x, z, 1.0, 1.0, 0, 3.5, 0, { walkable: false });
    }
    for (const [x, z] of [
      [-93, 793.8],
      [-70, 769.5],
    ]) {
      b.box("limestone", x, 0, z, 2.2, 0.9, 1.1, { seg: false, grime: 0.7 });
      b.box("slate", x, 0.9, z, 2.4, 0.12, 1.3, { seg: false });
      PF.col(x, z, 2.4, 1.3, 0, 1.0, 0, { surface: "concrete" });
    }
    // Alexander Hamilton's tomb: white marble pyramid on a die, urns at the corners
    {
      const hx = -71,
        hz = 795;
      b.box("marble", hx, 0, hz, 3.0, 0.45, 3.0, { seg: false, grime: 0.5 });
      b.box("marble", hx, 0.45, hz, 2.2, 1.5, 2.2, { seg: false, grime: 0.55 });
      b.box("marble", hx, 1.95, hz, 2.5, 0.25, 2.5, { seg: false, grime: 0.4 });
      const pyr = new THREE.ConeGeometry(1.55, 2.3, 4, 1);
      pyr.rotateY(PI / 4);
      b.add("marble", pyr, { m: PF.m4(hx, 2.2 + 1.15, hz), grime: 0.5 });
      for (const sx of [-1, 1])
        for (const sz of [-1, 1])
          b.lathe(
            "marble",
            [
              [0.12, 0],
              [0.22, 0.12],
              [0.28, 0.4],
              [0.16, 0.62],
              [0.2, 0.7],
              [0.02, 0.85],
            ],
            10,
            hx + sx * 1.25,
            0.45,
            hz + sz * 1.25,
            {},
          );
      const plq = PF.texMat(
        "hamilton_plaque",
        PF.signTex(
          "hamilton_plaque",
          [
            "TO THE MEMORY OF",
            "ALEXANDER HAMILTON",
            "SOLDIER · STATESMAN · FINANCIER",
          ],
          "engraved",
          512,
          256,
          { bg: "#d8d4c8" },
        ),
      );
      b.quad(plq, hx, 1.2, hz - 1.11, 1.8, 0.9, { ry: PI });
      PF.col(hx, hz, 3.0, 3.0, 0, 3.4, 0, { walkable: false });
      PF.readable(
        V3(hx, 1.2, hz - 1.5),
        "Hamilton's Tomb",
        "The engraving is worn but legible. Someone has left an old-world ten-dollar bill under a pebble, and a scrip beside it — just in case.",
        "Examine",
      );
      anchors.hamilton = PF.anchor(hx, 0, hz - 2.2, PI);
    }
    // dead trees
    for (const [x, z, h] of [
      [-96, 769],
      [-86, 797.5],
      [-60, 796.5],
      [-107, 780],
      [-66, 768],
    ].map((a) => [a[0], a[1], 8 + r() * 4]))
      PF.deadTree(b, x, 0, z, h);
    // settlers' vegetable beds (north-west yard) + scarecrow + water pump + lean-to
    for (let i = 0; i < 5; i++) {
      const x = -106 + i * 4.2,
        z = 770.5;
      b.boxMM("planks", x - 1.6, 0, z - 2.4, x + 1.6, 0.42, z + 2.4, {
        grime: 0.6,
      });
      b.boxMM("dirt", x - 1.45, 0.42, z - 2.25, x + 1.45, 0.48, z + 2.25, {
        grime: 0.2,
      });
      PF.col(x, z, 3.2, 4.8, 0, 0.48, 0, { surface: "dirt" });
      for (let k = 0; k < 10; k++) {
        const px = x - 1.1 + (k % 3) * 1.1,
          pz = z - 1.9 + Math.floor(k / 3) * 1.25 + (r() - 0.5) * 0.2;
        const hgt = 0.35 + r() * 0.5;
        b.beam(
          "moss",
          V3(px, 0.46, pz),
          V3(px + (r() - 0.5) * 0.2, 0.46 + hgt, pz + (r() - 0.5) * 0.2),
          0.05,
          0.05,
          { grime: 0.1 },
        );
        b.sphere(i % 2 ? "moss" : "egg", px, 0.5 + hgt, pz, 0.09 + r() * 0.06, {
          ws: 6,
          hs: 4,
          sy: 0.8,
        });
        for (let l = 0; l < 3; l++) {
          const a = r() * TAU;
          b.box(
            "moss",
            px + Math.cos(a) * 0.14,
            0.5 + hgt * 0.5,
            pz + Math.sin(a) * 0.14,
            0.26,
            0.02,
            0.1,
            { ry: a, rz: 0.5, seg: false, noAO: true },
          );
        }
      }
    }
    // scarecrow: crossed poles, a faded plaid shirt, a cooking-pot helmet
    b.box("rotten", -96.5, 0, 767.6, 0.1, 2.2, 0.1, { seg: false });
    b.box("rotten", -96.5, 1.6, 767.6, 1.4, 0.08, 0.08, { seg: false });
    b.box("fabric", -96.5, 1.0, 767.6, 0.5, 0.8, 0.25, {
      seg: false,
      c: 0x8a4a3a,
    });
    b.sphere("rust", -96.5, 2.3, 767.6, 0.2, { ws: 8, hs: 5, phiLen: PI / 2 });
    // hand pump + trough
    b.cyl("iron", -108, 0, 787, 0.12, 0.14, 1.1, 8, { hSeg: 1 });
    b.beam("iron", V3(-108, 1.05, 787), V3(-107.3, 1.3, 787), 0.06, 0.06);
    b.boxMM("rotten", -108.8, 0, 788, -106.8, 0.5, 789, { seg: false });
    PF.col(-108, 787.5, 1.2, 2.2, 0, 0.9, 0, { walkable: false });
    // lean-to (tarp on poles) with cots in the west yard
    for (const [x, z] of [
      [-109.2, 776],
      [-109.2, 784],
      [-106.2, 776],
      [-106.2, 784],
    ])
      b.box("rotten", x, 0, z, 0.12, x < -107 ? 2.6 : 2.0, 0.12, {
        seg: false,
      });
    b.box("tent", -107.7, 2.25, 780, 3.4, 0.05, 8.6, {
      rz: 0.18,
      seg: false,
      grime: 0.6,
    });
    for (const z of [777, 779.3, 781.6]) {
      b.box("iron", -108, 0.35, z, 2.0, 0.06, 0.8, { seg: false });
      b.box("fabric", -108, 0.41, z, 1.9, 0.12, 0.75, {
        seg: false,
        c: 0x8a8060,
      });
    }

    // ---- settlement dressing at the gate --------------------------------
    PF.sandbags(b, E - 1.2, 776.2, E - 1.2, 778.6, 3, {});
    PF.sandbags(b, E - 1.2, 786.4, E - 1.2, 788.8, 3, {});
    PF.barrel(b, -52.2, 0, 777.6, { fire: true });
    const banner = PF.texMat(
      "trinity_banner",
      PF.signTex(
        "trinity_banner",
        ["TRINITY SANCTUARY", "ALL SOULS WELCOME · GUNS STAY HOLSTERED"],
        "banner",
        1024,
        256,
        { bg: "#d8ccb0", fg: "#6a1a14", size: 64 },
      ),
    );
    b.quad(banner, E + 0.05, 2.9, 782.5, 6.0, 1.3, { ry: HP, grime: 0.4 });
    b.beam(
      "rope",
      V3(E + 0.05, 3.6, 779.2),
      V3(E + 0.05, 3.6, 785.8),
      0.03,
      0.03,
    );
    const docK = PF.texMat(
      "trinity_doc",
      PF.signTex(
        "trinity_doc",
        ["DOCTOR INSIDE", "+ SCRIP OR BARTER +"],
        "raider",
        512,
        192,
        { bg: "#d8d0c0", fg: "#b3261c" },
      ),
    );
    b.quad(docK, tx1 + 0.03, 2.3, TZ - 3.6, 1.4, 0.55, { ry: HP });
    // the gate bell
    b.box("rotten", E - 0.2, 0, 787.8, 0.14, 2.6, 0.14, { seg: false });
    b.lathe(
      "brass",
      [
        [0.02, 0],
        [0.22, 0.02],
        [0.2, 0.12],
        [0.13, 0.3],
        [0.05, 0.38],
        [0.01, 0.4],
      ],
      12,
      E - 0.2,
      2.1,
      788.25,
      { ry: 0, rx: PI },
    );
    // wrecks & rubble outside the gate / against the fence
    D.rubble(b, -51.5, 0, 797.5, 0.9, 6, 12);
    D.rubble(b, -104, 0, 767.5, 0.7, 5, 13);

    b.build(root);
    anchors.entrance = PF.anchor(S.x1 + 2.5, 0, TZ, -HP);
    anchors.gate = PF.anchor(E - 1.6, 0, 782.5, -HP);
    anchors.npc1 = PF.anchor(-54.8, 0, 787.6, -HP);
    anchors.guard1 = PF.anchor(-52.4, 0, 779.6, -HP);
    anchors.merchant = PF.anchor(-106.8, 0, 786.4, HP);
    return anchors;
  }

  // ===================================================================
  // INTERIOR
  // ===================================================================
