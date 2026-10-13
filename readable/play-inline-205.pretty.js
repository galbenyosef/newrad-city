/* src/poi_financial/10_trinity.js */
/* =====================================================================
 * NEW RAD CITY — POI FINANCIAL — TRINITY CHURCH
 * Exterior (site x -110..-50, z 766..799): soot-dark brownstone Gothic
 * Revival church, entrance tower with clocks, belfry and the tall
 * octagonal spire at the head of Wall Street; nave with clerestory,
 * buttresses & pinnacles; chancel with the great west window; walled
 * churchyard with slate headstones, Alexander Hamilton's pyramid tomb and
 * the settlers' vegetable beds ("Trinity Sanctuary").
 * Interior (INTERIORS.trinity_church): narthex, ribbed-vault nave with
 * stained glass, organ loft, chancel + reredos, clinic aisle, vestry,
 * stair turret to the ringing chamber / clock room / belfry (+ exterior
 * lookout), and the CRYPT (ossuary, flooded vault, colonial tunnel breach,
 * Maniac nest) with a one-way return stair — side quest "Dust to Dust".
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE || !G._pf) return;
  const PF = G._pf;
  const K = PF.kit,
    D = PF.dress;
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  const PI = Math.PI,
    HP = Math.PI / 2,
    TAU = Math.PI * 2;

  // Exterior frame
  const TX = -58.5,
    TZ = 782.5; // tower centre
  const TW = 9; // tower width
  const NAVE_X0 = -97,
    NAVE_X1 = -63; // nave + aisles
  const CH_X0 = -105; // chancel west end
  const Z_N = 775,
    Z_S = 790; // aisle outer walls
  const CL_N = 778.5,
    CL_S = 786.5; // clerestory walls
  const LOOKOUT = { x: -58.5, y: 24, z: 789.2 };

  PF.flagDefaults.tr_crypt_open = false; // crypt door unlocked
  PF.flagDefaults.tr_crypt_gate = false; // return stair gate unbolted
  PF.flagDefaults.tr_breach = null; // how the breach was sealed
  PF.flagDefaults.tr_met = false;
  PF.flagDefaults.tr_blessed = 0;

  // ===================================================================
  // helpers
  // ===================================================================
  /** Pointed-arch height at x for an arch spanning x0..x1, springing y0, rise H. */
  function archY(x, x0, x1, y0, H) {
    const W = x1 - x0,
      R = ((W * W) / 4 + H * H) / W,
      xm = (x0 + x1) / 2;
    if (x <= xm) {
      const cx = x0 + R;
      return y0 + Math.sqrt(Math.max(0, R * R - (x - cx) * (x - cx)));
    }
    const cx = x1 - R;
    return y0 + Math.sqrt(Math.max(0, R * R - (x - cx) * (x - cx)));
  }
  /** Pointed barrel vault spanning x0..x1 along zA..zB (underside visible). */
  function vault(b, key, x0, x1, zA, zB, y0, H, opts) {
    opts = opts || {};
    const g = PF.surface(
      (u, v, out) => {
        const x = x0 + u * (x1 - x0);
        out.set(x, archY(x, x0, x1, y0, H), zA + v * (zB - zA));
      },
      opts.nu || 14,
      opts.nv || Math.max(2, Math.round(Math.abs(zB - zA) / 3)),
      {},
    );
    b.add(key, g, {
      grime: opts.grime === undefined ? 0.35 : opts.grime,
      noAO: true,
    });
  }
  /** Rib following the pointed arch across x0..x1 at z (or diagonal to z2). */
  function rib(b, key, x0, x1, z, y0, H, w, z2) {
    const N = 12;
    let prev = null;
    for (let i = 0; i <= N; i++) {
      const t = i / N,
        x = x0 + t * (x1 - x0);
      const p = V3(
        x,
        archY(x, x0, x1, y0, H) - w * 0.3,
        z2 === undefined ? z : z + (z2 - z) * t,
      );
      if (prev) b.beam(key, prev, p, w, w, { grime: 0.3 });
      prev = p;
    }
  }
  /** Headstone (tilted slab with a rounded top). */
  function headstone(b, x, z, ry, r, key) {
    const h = 0.55 + r() * 0.55,
      w = 0.45 + r() * 0.3,
      tilt = (r() - 0.5) * 0.28,
      lean = (r() - 0.5) * 0.12;
    const M = PF.m4(x, 0, z, ry, tilt, lean);
    const kk = key || (r() < 0.65 ? "slate" : "limestone");
    b.add(kk, new THREE.BoxGeometry(w, h, 0.09), {
      m: new THREE.Matrix4().multiplyMatrices(M, PF.m4(0, h / 2 - 0.1, 0)),
      grime: 0.7,
    });
    const top = new THREE.CylinderGeometry(
      w / 2,
      w / 2,
      0.09,
      10,
      1,
      false,
      0,
      PI,
    );
    top.rotateX(HP);
    top.rotateZ(HP);
    if (r() < 0.7)
      b.add(kk, top, {
        m: new THREE.Matrix4().multiplyMatrices(M, PF.m4(0, h - 0.1, 0)),
        grime: 0.7,
      });
    PF.col(x, z, w, 0.3, 0, h, ry, { walkable: false });
  }

  // ===================================================================
  // EXTERIOR
  // ===================================================================
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
  function buildInterior(cell, extAnchors) {
    // The whole cell is lifted 10 m: core terrain is y=0 everywhere inside interior cells, so the crypt
    // (7 m below the nave) must stay above it.
    const O = cell.origin,
      ox = O.x,
      oy = O.y + 10,
      oz = O.z;
    const X = (x) => ox + x,
      Z = (z) => oz + z;
    const P = (x, y, z) => V3(ox + x, oy + y, oz + z);
    const A = (x, y, z, yaw) => PF.anchor(ox + x, oy + y, oz + z, yaw || 0);
    const anchors = {};
    const root = cell.root;
    const r = PF.rng("trinity_int");

    // ------------------------------------------------------------------
    // Lights: stained glass daylight, altar candles, settlers' lanterns,
    // clinic lamps, crypt candles & radioactive pool, belfry daylight
    // ------------------------------------------------------------------
    const lights = [];
    for (let z = -16; z <= 20; z += 5.5) {
      lights.push({ x: X(0), y: 5, z: Z(z), color: 0xffd8a0, r: 11, i: 0.42 }); // hanging lanterns down the nave
      lights.push({ x: X(-9), y: 4, z: Z(z), color: 0xa0b8ff, r: 7, i: 0.35 }); // stained glass (cool)
      lights.push({ x: X(9), y: 4, z: Z(z), color: 0xffb0a0, r: 7, i: 0.35 }); // stained glass (warm)
      lights.push({ x: X(0), y: 15, z: Z(z), color: 0xd0c8ff, r: 9, i: 0.25 }); // clerestory
    }
    lights.push({ x: X(0), y: 2, z: Z(-27), color: 0xffb060, r: 10, i: 0.9 }); // altar candles
    lights.push({ x: X(0), y: 13, z: Z(-30), color: 0xd8c0ff, r: 12, i: 0.45 }); // great window
    lights.push({ x: X(8), y: 2.6, z: Z(4), color: 0xfff0d8, r: 8, i: 0.7 }); // clinic
    lights.push({ x: X(8), y: 2.4, z: Z(-26), color: 0xffd090, r: 7, i: 0.6 }); // vestry
    lights.push({ x: X(0), y: 4, z: Z(28), color: 0xffd8a0, r: 9, i: 0.6 }); // narthex
    lights.push({ x: X(-8), y: 3, z: Z(28), color: 0xffe0b0, r: 8, i: 0.35 }); // stair hall base
    for (const y of [9, 16, 22])
      lights.push({
        x: X(-7.5),
        y,
        z: Z(28.5),
        color: 0xd8e0ff,
        r: 8,
        i: 0.35,
      });
    lights.push({ x: X(0), y: 9.5, z: Z(28), color: 0xffd8a0, r: 7, i: 0.5 }); // ringing chamber
    lights.push({ x: X(0), y: 16, z: Z(28), color: 0xfff0c0, r: 7, i: 0.55 }); // clock room (dials)
    lights.push({ x: X(0), y: 24, z: Z(28), color: 0xc8d8ff, r: 8, i: 0.7 }); // belfry
    lights.push({ x: X(0), y: 9, z: Z(21.5), color: 0xffd8a0, r: 7, i: 0.4 }); // organ loft
    // crypt
    for (const [x, z, c, i] of [
      [-8, -28, 0xffb060, 0.7],
      [0, -26, 0xffb060, 0.6],
      [-6, -10, 0xffa050, 0.55],
      [6, -8, 0xffa050, 0.45],
      [-6, 6, 0xffa050, 0.5],
      [6, 12, 0x60ff70, 0.7],
      [-6, 17, 0xffa050, 0.4],
      [-6, 30, 0xff9040, 0.5],
      [-6, 38, 0x60ff70, 0.45],
      [0, -2, 0x8090a0, 0.3],
    ]) {
      lights.push({ x: X(x), y: -3.2, z: Z(z), color: c, r: 8.5, i });
    }
    const b = PF.batch("trinity_int");
    b.ground = oy;
    b.aoH = 3;
    b.setLights(lights, 0x8a8aa0, 0.08);

    // ------------------------------------------------------------------
    // NARTHEX (tower base) — tower interior x -4.5..4.5, z 24.6..33;
    // walls 0.6 thick, 28 m tall; the stair turret adjoins on the west.
    // ------------------------------------------------------------------
    const TW0 = -4.5,
      TW1 = 4.5,
      TZ0 = 24.6,
      TZ1 = 33;
    b.boxMM("marble_floor", X(-11.2), oy - 0.5, Z(24), X(5.1), oy, Z(33.6), {
      grime: 0.5,
    });
    PF.colMM(X(-11.2), oy - 0.5, Z(24), X(5.1), oy, Z(33.6));
    const WG = 0.5;
    // west wall (shared with the stair turret): doorways at ground and at every landing (7 / 14 / 21)
    PF.wall(
      b,
      "brownstone_t",
      "z",
      Z(24),
      Z(33.6),
      X(-5.1),
      X(-4.5),
      oy,
      oy + 28,
      [
        { c: Z(32.2), w: 1.5, y0: oy, h: 2.7 },
        { c: Z(32.2), w: 1.5, y0: oy + 7, h: 2.5 },
        { c: Z(32.2), w: 1.5, y0: oy + 14, h: 2.5 },
        { c: Z(32.2), w: 1.5, y0: oy + 21, h: 2.5 },
      ],
      { grime: WG },
    );
    PF.wall(
      b,
      "brownstone_t",
      "z",
      Z(24),
      Z(33.6),
      X(4.5),
      X(5.1),
      oy,
      oy + 28,
      [],
      { grime: WG },
    ); // east
    PF.wall(
      b,
      "brownstone_t",
      "x",
      X(-4.5),
      X(4.5),
      Z(24),
      Z(24.6),
      oy,
      oy + 28,
      [
        // north
        { c: X(0), w: 6.2, y0: oy, h: 6.2 },
        { c: X(0), w: 2.0, y0: oy + 7, h: 2.5 },
      ],
      { grime: WG },
    );
    PF.wall(
      b,
      "brownstone_t",
      "x",
      X(-4.5),
      X(4.5),
      Z(33),
      Z(33.6),
      oy,
      oy + 28,
      [{ c: X(0), w: 2.6, y0: oy, h: 3.6 }],
      { grime: WG },
    ); // south
    PF.exitDoor(b, X(0), oy, Z(33.25), PI, 2.6, 3.6, {
      key: "oak",
      frame: "brownstone_dk",
    }); // west doors (to the churchyard), daylight in the lites
    // floors of the tower rooms: 7, 14, 21 (tops)
    for (const fy of [7, 14, 21]) {
      b.boxMM(
        "planks",
        X(TW0),
        oy + fy - 0.4,
        Z(TZ0),
        X(TW1),
        oy + fy,
        Z(TZ1),
        { grime: 0.6 },
      );
      PF.colMM(X(TW0), oy + fy - 0.4, Z(TZ0), X(TW1), oy + fy, Z(TZ1), {
        surface: "wood",
      });
      for (let x = TW0 + 0.8; x < TW1; x += 1.6)
        b.box("rotten", X(x), oy + fy - 0.7, Z(28.8), 0.25, 0.3, TZ1 - TZ0, {
          seg: false,
        });
    }
    b.boxMM("planks", X(TW0), oy + 27.6, Z(TZ0), X(TW1), oy + 28, Z(TZ1), {
      grime: 0.6,
    });
    // narthex dressing: sanctuary rules board, poor box, memorial portraits, inner door leaves
    const board = PF.texMat(
      "trinity_board",
      PF.signTex(
        "trinity_board",
        [
          "SANCTUARY RULES",
          "1. NO GUNS DRAWN INSIDE",
          "2. NO STEALING FROM THE POOR BOX",
          "3. MANIACS ARE NOT PARISHIONERS",
          "— REV. J. PENHALLOW",
        ],
        "engraved",
        512,
        384,
        { bg: "#b8a888", fg: "#2a2016" },
      ),
    );
    b.quad(board, X(4.42), oy + 1.9, Z(29), 1.5, 1.15, { ry: -HP });
    b.box("rotten", X(4.45), oy + 1.2, Z(29), 0.08, 1.5, 1.8, { seg: false });
    b.box("oak", X(-3.6), oy, Z(26.2), 0.6, 1.0, 0.6, { seg: false });
    PF.col(X(-3.6), Z(26.2), 0.6, 0.6, oy, oy + 1.0, 0, { walkable: false });
    for (let i = 0; i < 3; i++)
      D.painting(
        b,
        i + 1,
        X(-4.44),
        oy + 2.4,
        Z(26.8 + i * 1.7),
        0.9,
        1.1,
        HP,
        { frame: "brownstone_dk" },
      );
    for (const sx of [-1, 1])
      b.boxMM(
        "oak",
        X(sx > 0 ? 1.3 : -2.35),
        oy,
        Z(32.85),
        X(sx > 0 ? 2.35 : -1.3),
        oy + 3.5,
        Z(32.97),
        { seg: false, grime: 0.5 },
      ); // inner door leaves (open)
    anchors.entrance = A(0, 0, 31.2, 0);
    PF.door({
      id: "pf_tr_exit",
      pos: P(0, 1.5, 32.6),
      label: "Trinity Churchyard",
      verb: "Exit",
      radius: 1.4,
      target: {
        x: extAnchors.entrance.x,
        y: 0.05,
        z: extAnchors.entrance.z,
        yaw: -HP,
      },
      sound: "door_open",
    });

    // ------------------------------------------------------------------
    // STAIR TURRET (interior x -10.6..-5.1, z 24.6..33): switchback flights up to the belfry
    // ------------------------------------------------------------------
    const SX0 = -10.6,
      SX1 = -5.1;
    PF.wall(
      b,
      "brownstone_t",
      "z",
      Z(24),
      Z(33.6),
      X(-11.2),
      X(-10.6),
      oy,
      oy + 28,
      [],
      { grime: WG },
    ); // west
    PF.wall(
      b,
      "brownstone_t",
      "x",
      X(-11.2),
      X(-5.1),
      Z(24),
      Z(24.6),
      oy,
      oy + 28,
      [],
      { grime: WG },
    ); // north (also the aisle end)
    PF.wall(
      b,
      "brownstone_t",
      "x",
      X(-11.2),
      X(-5.1),
      Z(33),
      Z(33.6),
      oy,
      oy + 28,
      [],
      { grime: WG },
    ); // south
    b.boxMM(
      "brownstone_dk",
      X(-11.2),
      oy + 28,
      Z(24),
      X(-5.1),
      oy + 28.5,
      Z(33.6),
      {},
    );
    const FW = 2.0,
      L0 = 26.2,
      L1 = 31.4;
    const levels = [0, 3.5, 7, 10.5, 14, 17.5, 21];
    for (let i = 0; i < 6; i++) {
      const y0 = levels[i],
        y1 = levels[i + 1];
      if (i % 2 === 0)
        PF.stairs(
          b,
          "brownstone_dk",
          X(SX0 + FW / 2),
          Z(L1),
          PI,
          FW,
          L1 - L0,
          oy + y0,
          oy + y1,
          { base: oy + y0 - 0.35 },
        );
      else
        PF.stairs(
          b,
          "brownstone_dk",
          X(SX1 - FW / 2),
          Z(L0),
          0,
          FW,
          L1 - L0,
          oy + y0,
          oy + y1,
          { base: oy + y0 - 0.35 },
        );
      const north = i % 2 === 0;
      const lz0 = north ? TZ0 : L1,
        lz1 = north ? L0 : TZ1;
      b.boxMM(
        "brownstone_dk",
        X(SX0),
        oy + y1 - 0.35,
        Z(lz0),
        X(SX1),
        oy + y1,
        Z(lz1),
        { grime: 0.5 },
      );
      PF.colMM(X(SX0), oy + y1 - 0.35, Z(lz0), X(SX1), oy + y1, Z(lz1));
    }
    // spine wall between the flights
    b.boxMM(
      "brownstone_t",
      X(SX0 + FW + 0.05),
      oy,
      Z(L0),
      X(SX1 - FW - 0.05),
      oy + 22.2,
      Z(L1),
      { grime: 0.5 },
    );
    PF.colMM(
      X(SX0 + FW + 0.05),
      oy,
      Z(L0),
      X(SX1 - FW - 0.05),
      oy + 22.2,
      Z(L1),
      { walkable: false },
    );
    // slit windows (cool daylight) and a wall lamp per landing
    for (let k = 0; k < 7; k++)
      b.quad(
        "lamp_blue",
        X(-10.58),
        oy + 2 + k * 3.5,
        Z(k % 2 ? L0 - 0.8 : L1 + 0.8),
        0.22,
        1.1,
        { ry: HP, noAO: true, grime: 0 },
      );
    for (const y of [3.5, 10.5, 17.5]) {
      b.box("lamp_warm", X(-7.85), oy + y + 2.2, Z(24.66), 0.25, 0.3, 0.1, {
        seg: false,
        noAO: true,
      });
      PF.glow(P(-7.85, y + 2.3, 24.8), 0xffd8a0, 0.9, root, { intensity: 0.8 });
    }
    anchors.stairs_base = A(-8, 0, 32, 0);

    // ------------------------------------------------------------------
    // TOWER ROOMS above the narthex
    // ------------------------------------------------------------------
    // Ringing chamber (y 7): bell ropes with striped sallies, bench, peal boards
    for (let i = 0; i < 3; i++) {
      const x = -2 + i * 2;
      b.cyl("rope", X(x), oy + 7.8, Z(28.8), 0.025, 0.025, 13.2, 5, {
        hSeg: 2,
      });
      b.cyl("stripe_red", X(x), oy + 8.6, Z(28.8), 0.06, 0.06, 0.8, 6, {
        hSeg: 1,
      });
    }
    b.box("oak", X(0), oy + 7, Z(32.2), 5, 0.45, 0.5, { seg: false });
    PF.col(X(0), Z(32.2), 5, 0.5, oy + 7, oy + 7.45, 0, { surface: "wood" });
    const peal = PF.texMat(
      "trinity_peal",
      PF.signTex(
        "trinity_peal",
        [
          "ON THIS DAY WAS RUNG",
          "A PEAL OF 5040 CHANGES",
          "IN 3 HOURS 12 MINUTES",
          "MARCH 4th 1967",
        ],
        "engraved",
        512,
        320,
        { bg: "#3a2a1c", fg: "#d8c890" },
      ),
    );
    b.quad(peal, X(4.44), oy + 9.2, Z(27.5), 1.8, 1.1, { ry: -HP });
    // Clock room (y 14): four backlit dials, the going train, pendulum
    const dialBack = PF.texMat(
      "trinity_dialback",
      PF.canvasTex(
        "pf_trinity_dialback",
        256,
        256,
        (ctx, w) => {
          ctx.fillStyle = "#fff4d8";
          ctx.beginPath();
          ctx.arc(w / 2, w / 2, w / 2 - 2, 0, TAU);
          ctx.fill();
          ctx.save();
          ctx.translate(w, 0);
          ctx.scale(-1, 1);
          ctx.fillStyle = "rgba(40,30,20,0.85)";
          ctx.font = "bold 22px Georgia";
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
          ctx.restore();
          ctx.strokeStyle = "rgba(20,14,8,0.9)";
          ctx.lineWidth = 7;
          ctx.beginPath();
          ctx.moveTo(w / 2, w / 2);
          ctx.lineTo(w / 2 - 50, w / 2 - 20);
          ctx.stroke();
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(w / 2, w / 2);
          ctx.lineTo(w / 2 + 30, w / 2 - 80);
          ctx.stroke();
        },
        { clamp: true },
      ),
      { emissive: 0.9, noShadow: true },
    );
    for (const [x, z, ry] of [
      [4.46, 28.8, -HP],
      [-4.46, 28.8, HP],
      [0, 24.64, 0],
      [0, 32.96, PI],
    ]) {
      if (x < 0) continue; // west dial hidden by the stair-turret wall opening
      b.add(dialBack, new THREE.CircleGeometry(1.5, 24), {
        m: PF.m4(X(x), oy + 17.3, Z(z), ry),
        uv: "keep",
        grime: 0.1,
        noAO: true,
      });
    }
    b.box("iron", X(0), oy + 14, Z(28.8), 1.6, 1.3, 1.0, {
      seg: false,
      grime: 0.4,
    }); // clock frame
    for (let i = 0; i < 5; i++) {
      const g = new THREE.CylinderGeometry(
        0.3 + i * 0.08,
        0.3 + i * 0.08,
        0.05,
        16,
      );
      g.rotateX(HP);
      b.add("brass", g, {
        m: PF.m4(X(-0.5 + i * 0.25), oy + 15.0 + (i % 2) * 0.25, Z(28.8)),
      });
    }
    for (const [x, z] of [
      [0, 24.7],
      [0, 32.9],
      [4.4, 28.8],
    ])
      b.beam("iron", P(0, 15.3, 28.5), P(x, 17.3, z), 0.05, 0.05);
    b.cyl("iron", X(0.7), oy + 11.2, Z(28.8), 0.02, 0.02, 3, 4, { hSeg: 1 });
    b.cyl("brass", X(0.7), oy + 11.0, Z(28.8), 0.25, 0.25, 0.08, 12, {
      hSeg: 1,
      rx: HP,
    });
    PF.col(X(0), Z(28.8), 1.6, 1.0, oy + 14, oy + 15.3, 0, { walkable: false });
    PF.skeleton(b, X(-2.4), oy + 14.02, Z(30.8), 2.2);
    // Belfry (y 21): oak bell frame, three bells, louvres
    b.boxMM("oak", X(-3.5), oy + 21, Z(26.5), X(3.5), oy + 21.35, Z(26.9), {
      seg: false,
    });
    b.boxMM("oak", X(-3.5), oy + 21, Z(30.7), X(3.5), oy + 21.35, Z(31.1), {
      seg: false,
    });
    for (const x of [-3.3, 0, 3.3])
      for (const z of [26.7, 30.9])
        b.box("oak", X(x), oy + 21, Z(z), 0.35, 4.2, 0.35, { seg: false });
    b.boxMM("oak", X(-3.5), oy + 25.2, Z(26.5), X(3.5), oy + 25.55, Z(31.1), {
      seg: false,
    });
    for (const [x, s] of [
      [-1.8, 1.1],
      [0.2, 0.85],
      [2.2, 0.7],
    ]) {
      b.lathe(
        "bronze_patina",
        [
          [0.02, 0],
          [s, 0.02],
          [s * 0.94, s * 0.25],
          [s * 0.62, s * 0.8],
          [s * 0.55, s * 1.1],
          [s * 0.2, s * 1.25],
          [0.02, s * 1.28],
        ],
        18,
        X(x),
        oy + 25.1 - s * 1.28,
        Z(28.8),
        {},
      );
      b.cyl("iron", X(x), oy + 25.1, Z(28.8), 0.08, 0.08, 0.45, 6, { hSeg: 1 });
    }
    PF.col(X(0.2), Z(28.8), 5.6, 2.6, oy + 21, oy + 24.9, 0, {
      walkable: false,
    });
    for (const [nx, nz, ry] of [
      [1, 0, -HP],
      [0, -1, 0],
      [0, 1, PI],
    ]) {
      for (const off of [-1.5, 1.5]) {
        const cx = nx * 4.46 + (nz !== 0 ? off : 0),
          cz = 28.8 + nz * 4.16 + (nx !== 0 ? off : 0);
        if (nz > 0 && Math.abs(off) < 2 && off > 0) continue; // lookout door slot
        b.quad("lamp_blue", X(cx), oy + 23.5, Z(cz), 1.3, 3.8, {
          ry,
          noAO: true,
          grime: 0,
        });
        for (let k = 0; k < 8; k++)
          b.box(
            "rotten",
            X(cx - nx * 0.1),
            oy + 21.9 + k * 0.45,
            Z(cz - nz * 0.1),
            nx !== 0 ? 0.05 : 1.4,
            0.05,
            nx !== 0 ? 1.4 : 0.05,
            {
              rx: nz !== 0 ? 0.6 * nz : 0,
              rz: nx !== 0 ? -0.6 * nx : 0,
              seg: false,
            },
          );
      }
    }
    // lookout door (south wall, belfry level) → exterior timber balcony
    b.boxMM("rotten", X(0.9), oy + 21, Z(32.95), X(2.3), oy + 23.3, Z(33.05), {
      seg: false,
    });
    anchors.belfry = A(1.6, 21, 31.2, PI);
    PF.door({
      id: "pf_tr_lookout_out",
      pos: P(1.6, 22.4, 32.6),
      label: "Belfry Lookout",
      verb: "Go to",
      radius: 1.1,
      target: {
        x: extAnchors.lookout.x,
        y: extAnchors.lookout.y + 0.05,
        z: extAnchors.lookout.z,
        yaw: extAnchors.lookout.yaw,
      },
      sound: "door_open",
    });
    PF.lookoutBack = { x: X(1.6), y: oy + 21.05, z: Z(31.7), yaw: 1.2 }; // facing WNW past the bell frame toward the lookout's nest
    // belfry loot: the lookout's nest
    D.mattress(b, X(-3.2), oy + 21, Z(32), HP);
    anchors.loot_belfry = A(3.2, 21, 25.4, 0);

    // ------------------------------------------------------------------
    // NAVE x -6..6 / AISLES x -10..-6 & 6..10, z -20..24
    // ------------------------------------------------------------------
    const NZ0 = -20,
      NZ1 = 24;
    b.boxMM("marble_floor", X(-8.0), oy - 0.5, Z(NZ0), X(10.6), oy, Z(NZ1), {
      grime: 0.55,
    });
    b.boxMM("marble_floor", X(-10.6), oy - 0.5, Z(NZ0), X(-9.8), oy, Z(NZ1), {
      grime: 0.55,
    });
    b.boxMM("marble_floor", X(-9.8), oy - 0.5, Z(NZ0), X(-8.0), oy, Z(15), {
      grime: 0.55,
    });
    b.boxMM("marble_floor", X(-9.8), oy - 0.5, Z(23), X(-8.0), oy, Z(NZ1), {
      grime: 0.55,
    });
    // floor colliders leave the openings for the crypt return stair (x -9.8..-8.0, z 15..23)
    PF.colMM(X(-10.6), oy - 0.5, Z(NZ0), X(-9.8), oy, Z(NZ1));
    PF.colMM(X(-8.0), oy - 0.5, Z(NZ0), X(10.6), oy, Z(NZ1));
    PF.colMM(X(-9.8), oy - 0.5, Z(NZ0), X(-8.0), oy, Z(15));
    PF.colMM(X(-9.8), oy - 0.5, Z(23), X(-8.0), oy, Z(NZ1));
    // outer aisle walls (x ±10.6) with stained-glass lancets per bay
    const piers = [19, 13.5, 8, 2.5, -3, -8.5, -14];
    for (const sx of [-1, 1]) {
      b.boxMM(
        "brownstone_t",
        X(sx * 10.6 - (sx > 0 ? 0 : 0.6)),
        oy,
        Z(NZ0),
        X(sx * 10.6 + (sx > 0 ? 0.6 : 0)),
        oy + 9,
        Z(NZ1),
        { grime: 0.45, segLen: 3 },
      );
      PF.colMM(
        X(sx * 10.6 - (sx > 0 ? 0 : 0.6)),
        oy,
        Z(NZ0),
        X(sx * 10.6 + (sx > 0 ? 0.6 : 0)),
        oy + 9,
        Z(NZ1),
        { walkable: false },
      );
      for (let i = 0; i < piers.length; i++) {
        const zc = piers[i] - 2.75;
        if (zc < NZ0 + 1) continue;
        PF.lancetWindow(
          b,
          X(sx * 10.55),
          oy + 1.6,
          Z(zc),
          sx > 0 ? -HP : HP,
          1.9,
          5.0,
          {
            glass: PF.stainedKey(i % 3, 1.1),
            frame: "limestone",
            frameW: 0.2,
            out: 0.06,
          },
        );
      }
      // wall shafts between windows
      for (const z of piers)
        b.box("limestone", X(sx * 10.35), oy, Z(z), 0.4, 6.2, 0.5, {
          seg: false,
        });
    }
    // arcade piers (clustered) + arches + clerestory walls
    for (const sx of [-1, 1]) {
      for (const z of piers.concat([-19.4])) {
        b.box("limestone", X(sx * 6), oy, Z(z), 1.3, 0.5, 1.3, {
          seg: false,
          grime: 0.5,
        });
        b.cyl("limestone", X(sx * 6), oy + 0.5, Z(z), 0.42, 0.42, 6.0, 12, {
          hSeg: 2,
          grime: 0.4,
        });
        for (const [dx, dz] of [
          [0.45, 0],
          [-0.45, 0],
          [0, 0.45],
          [0, -0.45],
        ])
          b.cyl(
            "limestone",
            X(sx * 6 + dx),
            oy + 0.5,
            Z(z + dz),
            0.14,
            0.14,
            6.0,
            6,
            { hSeg: 1 },
          );
        b.box("limestone", X(sx * 6), oy + 6.5, Z(z), 1.4, 0.35, 1.4, {
          seg: false,
        });
        if (Math.abs(z) < 30 && z !== -19.4)
          PF.col(X(sx * 6), Z(z), 1.3, 1.3, oy, oy + 14, 0, {
            walkable: false,
          });
      }
      // wall above the arcade (spandrels + triforium + clerestory), with pointed openings
      for (let i = 0; i < piers.length; i++) {
        const za = piers[i],
          zb = i + 1 < piers.length ? piers[i + 1] : -19.4;
        // spandrel wall 6.85..14 (solid band) with a pointed arch soffit beneath
        const N = 10;
        for (let k = 0; k < N; k++) {
          const t0 = k / N,
            t1 = (k + 1) / N;
          const zA = za + (zb - za) * t0,
            zB = za + (zb - za) * t1;
          const yA = archY(zA, Math.min(za, zb), Math.max(za, zb), 6.85, 3.0),
            yB = archY(zB, Math.min(za, zb), Math.max(za, zb), 6.85, 3.0);
          const y = Math.min(yA, yB);
          b.boxMM(
            "limestone",
            X(sx * 6 - 0.35),
            oy + y,
            Z(Math.min(zA, zB)),
            X(sx * 6 + 0.35),
            oy + 10.4,
            Z(Math.max(zA, zB)),
            { seg: false, grime: 0.35 },
          );
        }
        b.boxMM(
          "brownstone_t",
          X(sx * 6 - 0.35),
          oy + 10.4,
          Z(Math.min(za, zb)),
          X(sx * 6 + 0.35),
          oy + 14.2,
          Z(Math.max(za, zb)),
          { seg: false, grime: 0.4 },
        );
        // clerestory lancet (stained glass) facing the nave
        PF.lancetWindow(
          b,
          X(sx * 5.55),
          oy + 10.9,
          Z((za + zb) / 2),
          sx > 0 ? -HP : HP,
          1.8,
          2.9,
          {
            glass: PF.stainedKey((i + 1) % 3, 0.9),
            frame: "limestone",
            frameW: 0.14,
            sill: false,
            out: 0.02,
          },
        );
        // triforium band (blind arcading)
        for (let k = 0; k < 4; k++)
          b.box(
            "brownstone_dk",
            X(sx * 5.64),
            oy + 9.6,
            Z(za + ((zb - za) * (k + 0.5)) / 4),
            0.08,
            0.9,
            0.18,
            { seg: false },
          );
      }
    }
    // south end of the nave: east aisle end wall + filler strips beside the tower up to the vault
    PF.wall(
      b,
      "brownstone_t",
      "x",
      X(5.1),
      X(10.6),
      Z(NZ1),
      Z(NZ1 + 0.6),
      oy,
      oy + 9.5,
      [],
      { grime: 0.5 },
    );
    PF.wall(
      b,
      "brownstone_t",
      "x",
      X(5.1),
      X(6.4),
      Z(NZ1),
      Z(NZ1 + 0.6),
      oy + 9.5,
      oy + 19.2,
      [],
      { grime: 0.5 },
    );
    // vaults: nave (springing 14.2, apex 19), aisles (springing 6.5, apex 9)
    vault(
      b,
      "plaster_w",
      X(-6.3),
      X(6.3),
      Z(NZ0 - 0.1),
      Z(NZ1 + 0.1),
      oy + 14.2,
      4.8,
      { nu: 16 },
    );
    // ribs: transverse at every pier, diagonal per bay, ridge rib
    const allP = piers.concat([-19.4]);
    for (let i = 0; i < allP.length; i++) {
      rib(b, "limestone", X(-6), X(6), Z(allP[i]), oy + 14.2, 4.8, 0.3);
      if (i + 1 < allP.length) {
        rib(
          b,
          "limestone",
          X(-6),
          X(6),
          Z(allP[i]),
          oy + 14.2,
          4.8,
          0.2,
          Z(allP[i + 1]),
        );
        rib(
          b,
          "limestone",
          X(6),
          X(-6),
          Z(allP[i]),
          oy + 14.2,
          4.8,
          0.2,
          Z(allP[i + 1]),
        );
        // boss at the crossing
        b.sphere(
          "gilt",
          X(0),
          oy + 18.75,
          Z((allP[i] + allP[i + 1]) / 2),
          0.28,
          { ws: 8, hs: 6 },
        );
      }
    }
    b.beam("limestone", P(0, 18.85, NZ1), P(0, 18.85, NZ0), 0.22, 0.22, {});
    for (const sx of [-1, 1]) {
      const xa = sx > 0 ? 6.3 : -10.6,
        xb = sx > 0 ? 10.6 : -6.3;
      vault(
        b,
        "plaster_w",
        X(xa),
        X(xb),
        Z(NZ0 - 0.1),
        Z(NZ1 + 0.1),
        oy + 6.5,
        2.6,
        { nu: 10 },
      );
      for (const z of allP)
        rib(b, "limestone", X(xa), X(xb), Z(z), oy + 6.5, 2.6, 0.22);
      // aisle roof above the vault closes the volume (keeps the clerestory from looking into nothing)
      b.boxMM(
        "brownstone_dk",
        X(Math.min(xa, xb)),
        oy + 9.1,
        Z(NZ0),
        X(Math.max(xa, xb)),
        oy + 9.5,
        Z(NZ1),
        { seg: false },
      );
    }
    // roof hole in the nave vault: a charred gap with fallen debris below (the settlers put a bucket under it)
    D.rubble(b, X(-2.5), oy, Z(-6), 0.9, 7, 21);
    b.cyl("rust", X(-1.2), oy, Z(-5.2), 0.22, 0.18, 0.35, 8, {
      hSeg: 1,
      open: true,
    });
    // pews (12 rows each side of the centre aisle); some broken, some turned into beds
    for (let i = 0; i < 12; i++) {
      const z = 17 - i * 2.6;
      for (const sx of [-1, 1]) {
        const broken = r() < 0.12,
          bed = !broken && r() < 0.16;
        const cx = sx * 3.3,
          w = 4.4;
        if (broken) {
          b.box("mahogany", X(cx + (r() - 0.5)), oy, Z(z), w * 0.6, 0.45, 0.5, {
            ry: (r() - 0.5) * 0.8,
            rz: 0.3,
            seg: false,
            grime: 0.7,
          });
          continue;
        }
        b.box("mahogany", X(cx), oy + 0.42, Z(z), w, 0.07, 0.5, {
          seg: false,
          grime: 0.5,
        });
        b.box("mahogany", X(cx), oy + 0.45, Z(z + 0.3), w, 0.55, 0.06, {
          rx: 0.12,
          seg: false,
          grime: 0.5,
        });
        b.box("mahogany", X(cx), oy, Z(z + 0.4), w, 0.95, 0.07, {
          seg: false,
          grime: 0.5,
        });
        b.box("mahogany", X(cx - w / 2), oy, Z(z + 0.1), 0.08, 1.0, 0.7, {
          seg: false,
        });
        b.box("mahogany", X(cx + w / 2), oy, Z(z + 0.1), 0.08, 1.0, 0.7, {
          seg: false,
        });
        b.box("velvet", X(cx), oy + 0.2, Z(z - 0.45), w - 0.2, 0.14, 0.26, {
          seg: false,
          grime: 0.5,
        }); // kneeler
        if (bed) {
          b.box("linen", X(cx), oy + 0.49, Z(z), w - 0.6, 0.12, 0.45, {
            seg: false,
            c: 0xb0a890,
          });
          b.box(
            "linen",
            X(cx - w / 2 + 0.6),
            oy + 0.56,
            Z(z),
            0.4,
            0.12,
            0.35,
            { seg: false },
          );
        }
        PF.col(X(cx), Z(z + 0.1), w, 0.9, oy, oy + 0.5, 0, { surface: "wood" });
        PF.col(X(cx), Z(z + 0.4), w, 0.1, oy, oy + 1.0, 0, { walkable: false });
      }
    }
    // settlers' hanging lanterns down the nave
    for (let z = -16; z <= 20; z += 5.5) {
      b.cyl("iron", X(0), oy + 5.4, Z(z), 0.01, 0.01, 13.4, 3, { hSeg: 1 });
      b.cyl("lamp_warm", X(0), oy + 5.0, Z(z), 0.14, 0.17, 0.4, 6, {
        hSeg: 1,
        noAO: true,
        grime: 0,
      });
      b.cyl("iron", X(0), oy + 5.4, Z(z), 0.03, 0.22, 0.14, 6, { hSeg: 1 });
      PF.glow(P(0, 5.2, z), 0xffc880, 1.5, root, {
        intensity: 1.1,
        flicker: 0.12,
      });
    }
    // candle stands along the aisles
    for (const [x, z] of [
      [-8.5, 10],
      [8.5, -12],
      [-8.5, -12],
      [8.5, 16],
    ]) {
      b.cyl("iron", X(x), oy, Z(z), 0.04, 0.15, 1.2, 6, { hSeg: 1 });
      b.cyl("iron", X(x), oy + 1.2, Z(z), 0.35, 0.3, 0.06, 10, { hSeg: 1 });
      PF.candles(b, X(x), oy + 1.26, Z(z), 7, x * 3 + z, root);
    }

    // ------------------------------------------------------------------
    // SETTLERS' KITCHEN (west aisle, z 1..8): drum brazier with live flames, grill, soup pot, a door-on-crates
    // table, potato crates, water barrel, pots hung on a line between the piers
    // ------------------------------------------------------------------
    {
      const kx = -8.6,
        kz = 4.2;
      b.cyl("rust", X(kx), oy, Z(kz), 0.34, 0.3, 0.7, 10, {
        hSeg: 1,
        grime: 0.6,
      });
      b.cyl("fire", X(kx), oy + 0.62, Z(kz), 0.26, 0.28, 0.08, 8, {
        hSeg: 1,
        noAO: true,
        grime: 0,
      });
      for (let k = 0; k < 5; k++)
        b.box(
          "iron",
          X(kx - 0.3 + k * 0.15),
          oy + 0.72,
          Z(kz),
          0.03,
          0.03,
          0.7,
          { seg: false },
        );
      b.cyl(
        "steel",
        X(kx + 0.12),
        oy + 0.74,
        Z(kz + 0.05),
        0.2,
        0.18,
        0.3,
        10,
        { hSeg: 1, grime: 0.7 },
      );
      PF.fireAt(P(kx - 0.15, 0.7, kz - 0.1), 0.26, { smoke: false });
      PF.glow(P(kx, 1.0, kz), 0xff8a3a, 1.3, root, {
        intensity: 1.2,
        flicker: 0.45,
      });
      PF.col(X(kx), Z(kz), 0.75, 0.75, oy, oy + 0.9, 0, {
        walkable: false,
        surface: "metal",
      });
      // table: an old door on two crates, tin plates, a jar of plum preserves
      b.box("crate", X(-8.9), oy, Z(6.4), 0.6, 0.7, 0.6, { seg: false });
      b.box("crate", X(-8.9), oy, Z(7.9), 0.6, 0.7, 0.6, {
        ry: 0.2,
        seg: false,
      });
      b.box("oak", X(-8.9), oy + 0.7, Z(7.15), 0.95, 0.06, 2.1, {
        seg: false,
        grime: 0.6,
        c: 0x7a5a3a,
      });
      for (let k = 0; k < 4; k++)
        b.cyl(
          "steel",
          X(-8.75 + (k % 2) * -0.3),
          oy + 0.76,
          Z(6.5 + k * 0.4),
          0.12,
          0.1,
          0.03,
          8,
          { hSeg: 1 },
        );
      b.cyl("glass_dark", X(-9.1), oy + 0.76, Z(7.8), 0.07, 0.07, 0.2, 6, {
        hSeg: 1,
      });
      PF.col(X(-8.9), Z(7.15), 0.95, 2.2, oy, oy + 0.76, 0, {
        walkable: false,
        surface: "wood",
      });
      // potato crates + water barrel against the outer wall
      for (let k = 0; k < 3; k++) {
        const cz = 1.2 + k * 0.8;
        b.box("crate", X(-10.1), oy, Z(cz), 0.7, 0.45, 0.65, {
          ry: (k - 1) * 0.1,
          seg: false,
        });
        for (let j = 0; j < 5; j++)
          b.sphere(
            "paint_orange",
            X(-10.1 + (((j * 37) % 5) - 2) * 0.11),
            oy + 0.48,
            Z(cz + (((j * 23) % 5) - 2) * 0.1),
            0.07,
            { ws: 5, hs: 4, grime: 0.7 },
          );
      }
      PF.col(X(-10.1), Z(2.0), 0.75, 2.4, oy, oy + 0.5, 0, {
        walkable: false,
        surface: "wood",
      });
      PF.barrel(b, X(-10.0), oy, Z(5.4), { key: "paint_teal" });
      // pots and ladles hung from a rope between the aisle piers
      b.beam("rope", P(-10.3, 2.3, 2.0), P(-10.3, 2.3, 7.8), 0.02, 0.02, {});
      for (let k = 0; k < 4; k++) {
        const z = 2.8 + k * 1.3;
        b.beam("iron", P(-10.3, 2.3, z), P(-10.3, 2.0, z), 0.01, 0.01, {});
        b.cyl(
          k % 2 ? "copper" : "iron",
          X(-10.3),
          oy + 1.75,
          Z(z),
          0.16,
          0.13,
          0.22,
          8,
          { hSeg: 1 },
        );
      }
      anchors.kitchen = A(-7.6, 0, 4.6, HP);
    }

    // ------------------------------------------------------------------
    // CLINIC (east aisle, z -2..12): curtained cots, IV stands, cabinet
    // ------------------------------------------------------------------
    for (let i = 0; i < 4; i++) {
      const z = -0.5 + i * 3.2;
      b.box("iron", X(8.4), oy + 0.45, Z(z), 2.0, 0.06, 0.9, { seg: false });
      for (const dx of [-0.95, 0.95])
        b.box("iron", X(8.4 + dx), oy, Z(z), 0.05, 0.9, 0.9, { seg: false });
      b.box("linen", X(8.4), oy + 0.51, Z(z), 1.9, 0.14, 0.85, {
        seg: false,
        c: 0xd8d0c0,
        grime: 0.6,
      });
      b.box("linen", X(9.1), oy + 0.62, Z(z), 0.4, 0.12, 0.6, { seg: false });
      PF.col(X(8.4), Z(z), 2.0, 0.9, oy, oy + 0.62, 0, { surface: "wood" });
      // IV stand
      b.cyl("chrome", X(7.2), oy, Z(z + 0.5), 0.015, 0.015, 1.9, 4, {
        hSeg: 1,
      });
      b.box("glass_dark", X(7.2), oy + 1.7, Z(z + 0.5), 0.12, 0.22, 0.06, {
        seg: false,
      });
      // curtain between cots
      if (i < 3)
        b.box("linen", X(8.4), oy + 0.3, Z(z + 1.6), 2.2, 1.9, 0.03, {
          seg: false,
          c: 0xc8c8b8,
          grime: 0.7,
        });
    }
    b.cyl("iron", X(7.1), oy + 2.3, Z(4.2), 0.01, 0.01, 4.2, 3, { hSeg: 1 });
    b.box("lamp_warm", X(7.1), oy + 2.3, Z(4.2), 0.5, 0.08, 0.2, {
      seg: false,
      noAO: true,
    });
    PF.glow(P(7.1, 2.25, 4.2), 0xfff0d0, 1.4, root, { intensity: 1.0 });
    const redX = PF.texMat(
      "trinity_redcross",
      PF.signTex("trinity_redcross", ["+ INFIRMARY +"], "enamel", 512, 128, {
        bg: "#e8e0d0",
        fg: "#a82018",
      }),
    );
    b.quad(redX, X(10.52), oy + 3.1, Z(5), 2.4, 0.6, { ry: -HP });
    anchors.doctor = A(7.0, 0, 7.4, -HP);
    anchors.clinic = A(8.4, 0, 3, 0);

    // ------------------------------------------------------------------
    // CHANCEL z -32..-20 (raised 0.6), reredos, altar, great window, pulpit, lectern
    // ------------------------------------------------------------------
    const CY = 0.6;
    b.boxMM(
      "marble_floor",
      X(-5.6),
      oy - 0.5,
      Z(-32),
      X(5.6),
      oy + CY,
      Z(-20.9),
      { grime: 0.4 },
    );
    PF.colMM(X(-5.6), oy - 0.5, Z(-32), X(5.6), oy + CY, Z(-20.9));
    for (let k = 0; k < 3; k++) {
      const top = (k + 1) * 0.2,
        z0 = -20.9 + (2 - k) * 0.35;
      b.boxMM(
        "marble",
        X(-5.6),
        oy,
        Z(z0 - 0.35),
        X(5.6),
        oy + top,
        Z(z0 + 0.02),
        { seg: false, grime: 0.5 },
      );
      PF.colMM(X(-5.6), oy, Z(z0 - 0.35), X(5.6), oy + top, Z(z0 + 0.02));
    }
    // chancel walls (x ±5.6), side rooms beyond them (vestry east, crypt stair west)
    for (const sx of [-1, 1]) {
      b.boxMM(
        "brownstone_t",
        X(sx > 0 ? 5.6 : -6.2),
        oy,
        Z(-32.6),
        X(sx > 0 ? 6.2 : -5.6),
        oy + 14,
        Z(-20.9),
        { grime: 0.45 },
      );
      PF.colMM(
        X(sx > 0 ? 5.6 : -6.2),
        oy,
        Z(-32.6),
        X(sx > 0 ? 6.2 : -5.6),
        oy + 14,
        Z(-20.9),
        { walkable: false },
      );
      // choir stalls
      for (let i = 0; i < 4; i++) {
        const z = -28 + i * 1.6;
        b.box("oak", X(sx * 4.7), oy + CY, Z(z), 1.0, 0.5, 1.4, {
          seg: false,
          grime: 0.5,
        });
        b.box("oak", X(sx * 5.3), oy + CY, Z(z), 0.2, 2.2, 1.5, {
          seg: false,
          grime: 0.5,
        });
        K.pinnacle(
          b,
          "oak",
          X(sx * 5.3),
          oy + CY + 2.2,
          Z(z - 0.7),
          0.2,
          0.7,
          {},
        );
      }
      PF.col(X(sx * 4.9), Z(-25.6), 1.4, 6.4, oy + CY, oy + CY + 0.5, 0, {
        surface: "wood",
      });
    }
    // east & west end walls of the aisles at z -20 (with doors to the side rooms)
    for (const sx of [-1, 1]) {
      const x0 = sx > 0 ? 6.2 : -10.6,
        x1 = sx > 0 ? 10.6 : -6.2;
      const dc = sx > 0 ? 8.4 : -8.4;
      b.boxMM(
        "brownstone_t",
        X(x0),
        oy,
        Z(-20.6),
        X(dc - 0.8),
        oy + 9,
        Z(-20),
        { grime: 0.45 },
      );
      b.boxMM(
        "brownstone_t",
        X(dc + 0.8),
        oy,
        Z(-20.6),
        X(x1),
        oy + 9,
        Z(-20),
        { grime: 0.45 },
      );
      b.boxMM(
        "brownstone_t",
        X(dc - 0.8),
        oy + 2.6,
        Z(-20.6),
        X(dc + 0.8),
        oy + 9,
        Z(-20),
        { grime: 0.45 },
      );
      PF.colMM(X(x0), oy, Z(-20.6), X(dc - 0.8), oy + 9, Z(-20), {
        walkable: false,
      });
      PF.colMM(X(dc + 0.8), oy, Z(-20.6), X(x1), oy + 9, Z(-20), {
        walkable: false,
      });
      PF.lancetWindow(b, X(dc), oy, Z(-19.98), 0, 1.6, 2.6, {
        frame: "limestone",
        frameW: 0.16,
        sill: false,
      });
    }
    // chancel arch
    for (const sx of [-1, 1])
      b.boxMM(
        "limestone",
        X(sx > 0 ? 5.6 : -6.3),
        oy,
        Z(-21),
        X(sx > 0 ? 6.3 : -5.6),
        oy + 14.2,
        Z(-19.8),
        { seg: false, grime: 0.35 },
      );
    // chancel roof vault + back wall with the great window
    vault(b, "plaster_w", X(-5.7), X(5.7), Z(-32.4), Z(-20.4), oy + 12.8, 4.4, {
      nu: 14,
    });
    b.boxMM("brownstone_t", X(-6.2), oy, Z(-33.2), X(6.2), oy + 18, Z(-32.4), {
      grime: 0.45,
    });
    PF.colMM(X(-6.2), oy, Z(-33.2), X(6.2), oy + 18, Z(-32.4), {
      walkable: false,
    });
    for (const [dx, w, h] of [
      [-2.4, 1.9, 6.2],
      [0, 2.2, 7.6],
      [2.4, 1.9, 6.2],
    ])
      PF.lancetWindow(b, X(dx), oy + 9.6, Z(-32.38), 0, w, h, {
        glass: PF.stainedKey(dx === 0 ? 0 : 2, 0.8),
        frame: "limestone",
        frameW: 0.18,
        sill: dx === 0,
        out: 0.04,
      });
    // the reredos: white stone screen with niches, canopies & pinnacles
    {
      const rz = -31.6;
      b.boxMM(
        "marble",
        X(-4.2),
        oy + CY,
        Z(rz - 0.6),
        X(4.2),
        oy + CY + 3.0,
        Z(rz + 0.25),
        { grime: 0.35 },
      );
      for (let i = 0; i < 7; i++) {
        const x = -3.6 + i * 1.2;
        b.box("marble", X(x), oy + CY + 3.0, Z(rz), 0.9, 3.4, 0.5, {
          seg: false,
          grime: 0.35,
        });
        PF.lancetWindow(b, X(x), oy + CY + 3.3, Z(rz + 0.26), 0, 0.62, 2.4, {
          frame: "marble",
          frameW: 0.08,
          sill: false,
        });
        b.cyl(
          "marble",
          X(x),
          oy + CY + 3.35,
          Z(rz + 0.05),
          0.12,
          0.14,
          1.3,
          6,
          { hSeg: 1 },
        ); // statue stumps (figures)
        b.sphere("marble", X(x), oy + CY + 4.8, Z(rz + 0.05), 0.13, {
          ws: 6,
          hs: 5,
        });
        K.pinnacle(
          b,
          "marble",
          X(x),
          oy + CY + 6.4,
          Z(rz),
          0.5,
          2.2 + (i === 3 ? 1.6 : 0),
          {},
        );
      }
      b.box("gilt", X(0), oy + CY + 7.2, Z(rz + 0.1), 0.14, 1.6, 0.1, {
        seg: false,
      });
      b.box("gilt", X(0), oy + CY + 7.9, Z(rz + 0.1), 0.8, 0.12, 0.1, {
        seg: false,
      });
      PF.colMM(
        X(-4.2),
        oy + CY,
        Z(rz - 0.6),
        X(4.2),
        oy + CY + 6.4,
        Z(rz + 0.3),
        { walkable: false },
      );
    }
    // altar with frontal, candlesticks, and the settlers' offerings (scrip, tin cans, a teddy bear)
    b.boxMM(
      "marble",
      X(-1.6),
      oy + CY,
      Z(-29.4),
      X(1.6),
      oy + CY + 1.0,
      Z(-28.4),
      { grime: 0.3 },
    );
    b.boxMM(
      "velvet",
      X(-1.5),
      oy + CY + 0.05,
      Z(-28.38),
      X(1.5),
      oy + CY + 0.95,
      Z(-28.34),
      { seg: false },
    );
    b.boxMM(
      "linen",
      X(-1.7),
      oy + CY + 1.0,
      Z(-29.5),
      X(1.7),
      oy + CY + 1.04,
      Z(-28.3),
      { seg: false },
    );
    PF.colMM(X(-1.6), oy + CY, Z(-29.4), X(1.6), oy + CY + 1.04, Z(-28.3), {
      walkable: false,
    });
    for (const dx of [-1.2, 1.2]) {
      b.lathe(
        "brass",
        [
          [0.12, 0],
          [0.05, 0.05],
          [0.03, 0.55],
          [0.06, 0.6],
          [0.02, 0.62],
        ],
        8,
        X(dx),
        oy + CY + 1.04,
        Z(-29.1),
        {},
      );
      PF.candles(b, X(dx), oy + CY + 1.66, Z(-29.1), 1, dx * 9, root);
    }
    PF.candles(b, X(0.3), oy + CY + 1.04, Z(-28.7), 9, 77, root);
    for (let i = 0; i < 14; i++)
      b.cyl(
        "chrome",
        X(-1.2 + r() * 2.4),
        oy + CY + 1.04,
        Z(-28.9 + r() * 0.5),
        0.03,
        0.03,
        0.01,
        8,
        { hSeg: 1 },
      );
    // pulpit (hexagonal, carved, with a sounding board) and eagle lectern
    b.cyl("oak", X(4.2), oy, Z(-18.2), 0.8, 0.5, 1.6, 6, { hSeg: 1 });
    b.cyl("oak", X(4.2), oy + 1.6, Z(-18.2), 0.95, 0.95, 1.1, 6, {
      hSeg: 1,
      open: false,
    });
    b.cyl("oak", X(4.2), oy + 4.4, Z(-18.2), 1.2, 1.2, 0.12, 6, { hSeg: 1 });
    b.cyl("iron", X(4.2), oy + 4.5, Z(-18.2), 0.02, 0.02, 9.2, 3, { hSeg: 1 });
    PF.col(X(4.2), Z(-18.2), 1.9, 1.9, oy, oy + 2.7, 0, { walkable: false });
    b.cyl("brass", X(-4.0), oy, Z(-18.6), 0.08, 0.3, 1.2, 8, { hSeg: 1 });
    b.box("brass", X(-4.0), oy + 1.2, Z(-18.6), 0.2, 0.3, 0.6, {
      rx: -0.4,
      seg: false,
    });
    b.box("brass", X(-4.0), oy + 1.35, Z(-18.6), 0.9, 0.05, 0.5, {
      rx: -0.3,
      seg: false,
    });
    PF.col(X(-4.0), Z(-18.6), 0.7, 0.7, oy, oy + 1.4, 0, { walkable: false });
    anchors.reverend = A(3.2, 0, -16.2, PI - 0.3);
    anchors.npc1 = A(3.2, 0, -16.2, PI);
    anchors.altar = A(0, CY, -27.4, 0);

    // ------------------------------------------------------------------
    // ORGAN LOFT (y 7) over the south end of the nave, z 19.4..24
    // ------------------------------------------------------------------
    const OL = 7;
    b.boxMM("oak", X(-6), oy + OL - 0.45, Z(19.4), X(6), oy + OL, Z(NZ1), {
      grime: 0.5,
    });
    PF.colMM(X(-6), oy + OL - 0.45, Z(19.4), X(6), oy + OL, Z(NZ1), {
      surface: "wood",
    });
    for (const x of [-3.2, 3.2]) {
      b.cyl("limestone", X(x), oy, Z(19.8), 0.22, 0.25, OL - 0.45, 8, {
        hSeg: 1,
      });
      PF.col(X(x), Z(19.8), 0.5, 0.5, oy, oy + OL - 0.45, 0, {
        walkable: false,
      });
    }
    K.balustrade(
      b,
      "oak",
      [
        [X(-6), Z(19.5)],
        [X(6), Z(19.5)],
      ],
      oy + OL,
      1.0,
      { collide: true },
    );
    // organ case & pipes (east + west of the loft), console in the middle
    for (const sx of [-1, 1]) {
      b.boxMM(
        "oak",
        X(sx * 3.4),
        oy + OL,
        Z(22),
        X(sx * 6),
        oy + OL + 3,
        Z(24),
        { grime: 0.5 },
      );
      PF.colMM(
        X(Math.min(sx * 3.4, sx * 6)),
        oy + OL,
        Z(22),
        X(Math.max(sx * 3.4, sx * 6)),
        oy + OL + 3,
        Z(24),
        { walkable: false },
      );
      for (let i = 0; i < 9; i++) {
        const x = sx * (3.6 + i * 0.27),
          h = 2.5 + Math.sin((i / 8) * PI) * 3.0 + (i % 2) * 0.4;
        if (r() < 0.12) continue; // stolen pipes
        b.cyl("brass", X(x), oy + OL + 3, Z(22.3), 0.11, 0.11, h, 8, {
          hSeg: 1,
        });
        b.cyl("brass", X(x), oy + OL + 3 - 0.2, Z(22.3), 0.11, 0.02, 0.2, 8, {
          hSeg: 1,
        });
      }
    }
    b.box("oak", X(0), oy + OL, Z(22.6), 2.0, 1.1, 1.0, { seg: false });
    b.box("paint_cream", X(0), oy + OL + 0.8, Z(22.1), 1.8, 0.05, 0.3, {
      rx: -0.2,
      seg: false,
    });
    b.box("oak", X(0), oy + OL + 1.1, Z(23.0), 2.0, 0.9, 0.2, { seg: false });
    PF.col(X(0), Z(22.8), 2.0, 1.2, oy + OL, oy + OL + 1.1, 0, {
      walkable: false,
    });
    D.chair(b, X(0), oy + OL, Z(21.6), PI, false, "oak");
    PF.skeleton(b, X(1.8), oy + OL + 0.02, Z(21.2), 0.4);
    anchors.organ = A(0, OL, 21, 0);

    // ------------------------------------------------------------------
    // VESTRY (east side room x 6.2..10.6, z -32.6..-20.6)
    // ------------------------------------------------------------------
    b.boxMM("planks", X(6.2), oy - 0.5, Z(-32.6), X(10.6), oy, Z(-20.6), {
      grime: 0.5,
    });
    PF.colMM(X(6.2), oy - 0.5, Z(-32.6), X(10.6), oy, Z(-20.6), {
      surface: "wood",
    });
    b.boxMM("brownstone_t", X(10.6), oy, Z(-33.2), X(11.2), oy + 9, Z(-20), {
      grime: 0.5,
    });
    b.boxMM("brownstone_t", X(6.2), oy, Z(-33.2), X(11.2), oy + 9, Z(-32.6), {
      grime: 0.5,
    });
    PF.colMM(X(10.6), oy, Z(-33.2), X(11.2), oy + 9, Z(-20), {
      walkable: false,
    });
    PF.colMM(X(6.2), oy, Z(-33.2), X(11.2), oy + 9, Z(-32.6), {
      walkable: false,
    });
    b.boxMM(
      "plaster_w",
      X(6.2),
      oy + 4.2,
      Z(-32.6),
      X(10.6),
      oy + 4.5,
      Z(-20.6),
      { seg: false },
    );
    // vestment wardrobe, desk + terminal, cot, washstand, the safe
    b.boxMM("oak", X(9.6), oy, Z(-32.4), X(10.55), oy + 2.3, Z(-29.4), {
      grime: 0.5,
    });
    for (let i = 0; i < 5; i++)
      b.box(
        i % 2 ? "linen" : "velvet",
        X(9.9),
        oy + 0.7,
        Z(-31.9 + i * 0.5),
        0.1,
        1.3,
        0.4,
        { seg: false },
      );
    PF.colMM(X(9.6), oy, Z(-32.4), X(10.55), oy + 2.3, Z(-29.4), {
      walkable: false,
    });
    b.box("iron", X(7.2), oy + 0.35, Z(-31.2), 0.9, 0.06, 2.0, { seg: false });
    b.box("linen", X(7.2), oy + 0.41, Z(-31.2), 0.85, 0.14, 1.95, {
      seg: false,
      c: 0xa89a80,
    });
    PF.col(X(7.2), Z(-31.2), 0.9, 2.0, oy, oy + 0.55, 0, { surface: "wood" });
    D.shelf(b, X(10.3), oy, Z(-24.5), -HP, 2.6, 4, 55);
    b.box("lamp_warm", X(8.4), oy + 3.9, Z(-26.5), 0.4, 0.08, 0.4, {
      seg: false,
      noAO: true,
    });
    PF.glow(P(8.4, 3.8, -26.5), 0xffd8a0, 1.2, root, { intensity: 0.9 });
    anchors.terminal = A(8.2, 0, -27.4, 0);
    anchors.safe = A(10.1, 0, -27.8, -HP);
    anchors.vestry = A(8.4, 0, -23, PI);

    // ------------------------------------------------------------------
    // CRYPT STAIR ROOM (west side room x -10.6..-6.2, z -32.6..-20.6) + crypt door
    // ------------------------------------------------------------------
    b.boxMM("brownstone_t", X(-11.2), oy, Z(-33.2), X(-10.6), oy + 9, Z(-20), {
      grime: 0.5,
    });
    b.boxMM("brownstone_t", X(-11.2), oy, Z(-33.2), X(-6.2), oy + 9, Z(-32.6), {
      grime: 0.5,
    });
    PF.colMM(X(-11.2), oy, Z(-33.2), X(-10.6), oy + 9, Z(-20), {
      walkable: false,
    });
    PF.colMM(X(-11.2), oy, Z(-33.2), X(-6.2), oy + 9, Z(-32.6), {
      walkable: false,
    });
    b.boxMM(
      "plaster_w",
      X(-10.6),
      oy + 4.2,
      Z(-32.6),
      X(-6.2),
      oy + 4.5,
      Z(-20.6),
      { seg: false },
    );
    // floor with the stairwell opening (x -9.4..-7.4, z -30.8..-22.2)
    b.boxMM("planks", X(-10.6), oy - 0.5, Z(-22.2), X(-6.2), oy, Z(-20.6), {
      grime: 0.5,
    });
    b.boxMM("planks", X(-10.6), oy - 0.5, Z(-32.6), X(-9.4), oy, Z(-22.2), {
      grime: 0.5,
    });
    b.boxMM("planks", X(-7.4), oy - 0.5, Z(-32.6), X(-6.2), oy, Z(-22.2), {
      grime: 0.5,
    });
    b.boxMM("planks", X(-9.4), oy - 0.5, Z(-32.6), X(-7.4), oy, Z(-30.8), {
      grime: 0.5,
    });
    PF.colMM(X(-10.6), oy - 0.5, Z(-22.2), X(-6.2), oy, Z(-20.6), {
      surface: "wood",
    });
    PF.colMM(X(-10.6), oy - 0.5, Z(-32.6), X(-9.4), oy, Z(-22.2), {
      surface: "wood",
    });
    PF.colMM(X(-7.4), oy - 0.5, Z(-32.6), X(-6.2), oy, Z(-22.2), {
      surface: "wood",
    });
    PF.colMM(X(-9.4), oy - 0.5, Z(-32.6), X(-7.4), oy, Z(-30.8), {
      surface: "wood",
    });
    PF.railing(
      b,
      [
        [X(-9.4), Z(-30.8)],
        [X(-9.4), Z(-22.3)],
      ],
      oy,
      1.0,
      "iron",
      { collide: true },
    );
    PF.railing(
      b,
      [
        [X(-7.4), Z(-30.8)],
        [X(-7.4), Z(-22.3)],
      ],
      oy,
      1.0,
      "iron",
      { collide: true },
    );
    PF.railing(
      b,
      [
        [X(-9.4), Z(-30.8)],
        [X(-7.4), Z(-30.8)],
      ],
      oy,
      1.0,
      "iron",
      { collide: true },
    );
    // stairs down from y 0 (z -22.2) to y -5 (z -30.6), heading north
    PF.stairs(b, "brownstone_dk", X(-8.4), Z(-30.6), 0, 2.0, 8.4, oy - 5, oy, {
      base: oy - 5.3,
    });
    // crypt door: iron grille in the aisle-end doorway (x -9.2..-7.6 at z -20.3)
    const grille = new THREE.Group();
    grille.name = "pf_tr_crypt_grille";
    {
      const gb = PF.batch("trinity_grille");
      for (let i = 0; i < 9; i++)
        gb.box("iron", -0.7 + i * 0.175, 0, 0, 0.035, 2.5, 0.035, {
          seg: false,
        });
      for (const y of [0.2, 1.2, 2.3])
        gb.box("iron", 0, y, 0, 1.6, 0.06, 0.05, { seg: false });
      gb.box("iron", 0.55, 1.1, 0.05, 0.12, 0.22, 0.08, { seg: false });
      gb.build(grille);
      grille.position.set(X(-8.4), oy, Z(-20.3));
      root.add(grille);
    }
    const gcol = { c: null };
    const setGrille = (open) => {
      grille.rotation.y = open ? -1.7 : 0;
      grille.position.x = X(-8.4) + (open ? -0.8 : 0);
      grille.position.z = Z(-20.3) + (open ? -0.75 : 0);
      if (!open && !gcol.c)
        gcol.c = PF.col(X(-8.4), Z(-20.3), 1.6, 0.3, oy, oy + 2.6, 0, {
          walkable: false,
        });
      if (open && gcol.c) {
        G.world.removeCollider(gcol.c);
        gcol.c = null;
      }
    };
    setGrille(false);
    PF.flagWatch.push((k) => {
      if (k === "*" || k === "tr_crypt_open")
        setGrille(!!PF.flag("tr_crypt_open"));
    });
    PF.onReset.push(() => setGrille(false));
    PF.use({
      pos: P(-8.4, 1.3, -20.2),
      radius: 0.9,
      range: 2.6,
      label: () => (PF.flag("tr_crypt_open") ? "Crypt Gate" : "Crypt Gate"),
      verb: () =>
        PF.flag("tr_crypt_open")
          ? "Close"
          : PF.inv.count("pf_crypt_key")
            ? "Unlock"
            : "Open",
      locked: () =>
        !PF.flag("tr_crypt_open") &&
        !PF.inv.count("pf_crypt_key") &&
        !PF.lockIsOpen(TR_LOCKS.crypt.id)
          ? "Locked — Reverend Penhallow has the key"
          : null,
      onInteract() {
        if (PF.flag("tr_crypt_open")) {
          PF.setFlag("tr_crypt_open", false);
          PF.sfx("door_open", P(-8.4, 1, -20.3));
          return;
        }
        const open = () => {
          PF.setFlag("tr_crypt_open", true);
          PF.sfx("door_open", P(-8.4, 1, -20.3));
          PF.q.advance("pf_dust", ["talk", "key"], "crypt");
        };
        PF.lockOpen(TR_LOCKS.crypt, open); // key-only: Reverend Penhallow hands it over (and has a spare)
      },
    });
    const cryptSign = PF.texMat(
      "trinity_crypt_sign",
      PF.signTex(
        "trinity_crypt_sign",
        ["CRYPT — KEEP OUT", "(IT'S NOT THE DEAD. IT'S THE ONES WHO SCREAM.)"],
        "raider",
        512,
        160,
        { bg: "#5a5040", fg: "#e0d8c0" },
      ),
    );
    b.quad(cryptSign, X(-8.4), oy + 3.0, Z(-19.96), 1.8, 0.56, {});
    anchors.crypt_door = A(-8.4, 0, -18.8, PI);

    // ------------------------------------------------------------------
    // CRYPT (floor y -5, ceiling ~ -0.5): x -11..11, z -32.6..20
    // ------------------------------------------------------------------
    const CF = -5;
    const cryptFloor = (x0, z0, x1, z1, y) => {
      b.boxMM(
        "granite",
        X(x0),
        oy + (y || CF) - 0.5,
        Z(z0),
        X(x1),
        oy + (y || CF),
        Z(z1),
        { grime: 0.7 },
      );
      PF.colMM(
        X(x0),
        oy + (y || CF) - 0.5,
        Z(z0),
        X(x1),
        oy + (y || CF),
        Z(z1),
      );
    };
    cryptFloor(-11, -32.6, 11, 5);
    cryptFloor(-11, 5, 2, 20);
    cryptFloor(2, 5, 11, 20, CF - 0.7); // the flooded vault (sunken)
    b.boxMM("granite", X(1.6), oy + CF - 0.7, Z(5), X(2.0), oy + CF, Z(20), {
      seg: false,
    });
    // stepping blocks out of the pool
    for (let i = 0; i < 4; i++) {
      b.box(
        "granite",
        X(2.6 + i * 0.8),
        oy + CF - 0.7,
        Z(12 + i * 0.3),
        0.7,
        0.4 + i * 0.07,
        0.7,
        { seg: false },
      );
    }
    PF.stairs(
      b,
      "granite",
      X(3.5),
      Z(5.1),
      PI,
      3,
      1.4,
      oy + CF - 0.7,
      oy + CF,
      { base: oy + CF - 0.8 },
    );
    // radioactive water
    b.boxMM("goo", X(2), oy + CF - 0.35, Z(5), X(11), oy + CF - 0.3, Z(20), {
      seg: false,
      uv: "box",
      grime: 0,
      noAO: true,
    });
    PF.safe("rad", () =>
      G.world.addRadSource({
        x: X(7),
        y: oy + CF - 0.3,
        z: Z(13),
        radius: 6.5,
        strength: 3.5,
      }),
    );
    // perimeter walls
    K.room(
      b,
      "schist",
      X(-11.6),
      Z(-33.2),
      X(11.6),
      Z(20.6),
      oy + CF - 0.8,
      oy - 0.45,
      0.6,
      [
        { side: "s", c: X(-6), w: 2.6, h: 3.0 }, // the breach (colonial tunnel)
        { side: "s", c: X(-8.9), w: 1.9, h: 6.0 }, // the return stair passes under the aisle
      ],
      { grime: 0.6 },
    );
    // ceiling (underside of the nave floor)
    b.boxMM("schist", X(-7.4), oy - 0.6, Z(-32.6), X(11), oy - 0.5, Z(20), {
      seg: false,
    });
    b.boxMM("schist", X(-11), oy - 0.6, Z(-22.2), X(-7.4), oy - 0.5, Z(14), {
      seg: false,
    });
    b.boxMM("schist", X(-11), oy - 0.6, Z(-32.6), X(-9.4), oy - 0.5, Z(-22.2), {
      seg: false,
    });
    b.boxMM("schist", X(-11), oy - 0.6, Z(14), X(-9.8), oy - 0.5, Z(20), {
      seg: false,
    });
    b.boxMM("schist", X(-8.0), oy - 0.6, Z(14), X(-7.4), oy - 0.5, Z(20), {
      seg: false,
    });
    // pier grid + transverse pointed arches
    const cpx = [-7.5, -3.5, 3.5, 7.5],
      cpz = [-28, -23, -18, -13, -8, -3, 2, 7, 12, 17];
    for (const x of cpx)
      for (const z of cpz) {
        if (x > 0 && z > 5) {
          /* piers in the pool are shorter bases */
        }
        const y0 = oy + (x > 1.6 && z > 5 && z < 20 ? CF - 0.7 : CF);
        b.box("schist", X(x), y0, Z(z), 0.9, oy - 0.5 - y0, 0.9, {
          seg: false,
          grime: 0.6,
        });
        PF.col(X(x), Z(z), 0.9, 0.9, y0, oy - 0.5, 0, { walkable: false });
      }
    for (const z of cpz)
      for (const [xa, xb] of [
        [-11, -7.5],
        [-7.5, -3.5],
        [-3.5, 3.5],
        [3.5, 7.5],
        [7.5, 11],
      ])
        rib(b, "schist", X(xa), X(xb), Z(z), oy - 2.6, 2.0, 0.45);
    for (const x of cpx)
      for (let i = 0; i < cpz.length - 1; i++) {
        // longitudinal arches between piers (z direction): approximate with a lintel-arch of beams
        const za = cpz[i],
          zb = cpz[i + 1],
          N = 6;
        let prev = null;
        for (let k = 0; k <= N; k++) {
          const z = za + ((zb - za) * k) / N;
          const p = P(x, archY(z, za, zb, -2.6, 2.0) - 0.15, z);
          if (prev) b.beam("schist", prev, p, 0.45, 0.45, { grime: 0.5 });
          prev = p;
        }
      }
    // wall niches (loculi) with slabs, some broken open showing bones
    for (const sx of [-1, 1])
      for (let z = -30; z < 18; z += 2.1) {
        if (sx < 0 && z > -31 && z < -28) continue;
        for (let row = 0; row < 3; row++) {
          const y = oy + CF + 0.3 + row * 1.05;
          const open = r() < 0.3;
          b.box(
            open ? "bone" : "limestone",
            X(sx * 10.9),
            y,
            Z(z),
            0.12,
            0.85,
            1.7,
            { seg: false, grime: 0.8, c: open ? 0x6a6050 : 0xffffff },
          );
          if (open) {
            b.sphere("bone", X(sx * 10.75), y + 0.2, Z(z + 0.3), 0.11, {
              ws: 6,
              hs: 4,
            });
            b.box(
              "bone",
              X(sx * 10.75),
              y + 0.05,
              Z(z - 0.2),
              0.06,
              0.05,
              0.8,
              { seg: false },
            );
          }
        }
      }
    // sarcophagi with recumbent effigies between the piers
    const sarcs = [
      [-5.5, -25.5],
      [5.5, -25.5],
      [-5.5, -15.5],
      [5.5, -15.5],
      [-5.5, -5.5],
      [0, -10.5],
      [5.5, -5.5],
      [5.5, 1.5],
    ];
    for (const [x, z] of sarcs) {
      b.boxMM(
        "limestone",
        X(x - 0.8),
        oy + CF,
        Z(z - 1.3),
        X(x + 0.8),
        oy + CF + 0.9,
        Z(z + 1.3),
        { grime: 0.7 },
      );
      b.boxMM(
        "limestone",
        X(x - 0.9),
        oy + CF + 0.9,
        Z(z - 1.4),
        X(x + 0.9),
        oy + CF + 1.05,
        Z(z + 1.4),
        { seg: false },
      );
      b.cyl("limestone", X(x), oy + CF + 1.25, Z(z), 0.28, 0.24, 1.6, 8, {
        hSeg: 1,
        rx: HP,
      });
      b.sphere("limestone", X(x), oy + CF + 1.25, Z(z - 1.05), 0.16, {
        ws: 7,
        hs: 5,
      });
      for (let k = 0; k < 3; k++)
        b.box(
          "limestone",
          X(x - 0.7 + k * 0.7),
          oy + CF + 0.2,
          Z(z + 1.31),
          0.4,
          0.5,
          0.03,
          { seg: false },
        );
      PF.colMM(
        X(x - 0.9),
        oy + CF,
        Z(z - 1.4),
        X(x + 0.9),
        oy + CF + 1.05,
        Z(z + 1.4),
      );
    }
    // ossuary under the chancel: walls of skulls & long bones, a skull cross
    for (const sx of [-1, 1]) {
      const wx = sx * 3.05;
      for (let row = 0; row < 7; row++)
        for (let i = 0; i < 16; i++) {
          const z = -31.9 + i * 0.52 + (row % 2) * 0.26,
            y = oy + CF + 0.25 + row * 0.42;
          if (row % 3 === 2)
            b.cyl("bone", X(wx - sx * 0.12), y, Z(z), 0.035, 0.035, 0.48, 4, {
              hSeg: 1,
              rx: HP,
            });
          else
            b.sphere("bone", X(wx - sx * 0.1), y + 0.1, Z(z), 0.14, {
              ws: 6,
              hs: 5,
              grime: 0.6,
            });
        }
      b.boxMM(
        "schist",
        X(Math.min(wx, wx + sx * 0.4)),
        oy + CF,
        Z(-32.6),
        X(Math.max(wx, wx + sx * 0.4)),
        oy - 0.5,
        Z(-23.5),
        { seg: false },
      );
      PF.colMM(
        X(Math.min(wx - sx * 0.2, wx + sx * 0.4)),
        oy + CF,
        Z(-32.6),
        X(Math.max(wx - sx * 0.2, wx + sx * 0.4)),
        oy - 0.5,
        Z(-23.5),
        { walkable: false },
      );
    }
    for (let i = 0; i < 9; i++)
      b.sphere("bone", X(0), oy + CF + 0.9 + i * 0.3, Z(-32.45), 0.13, {
        ws: 6,
        hs: 5,
      });
    for (let i = -3; i <= 3; i++)
      if (i)
        b.sphere("bone", X(i * 0.3), oy + CF + 2.7, Z(-32.45), 0.13, {
          ws: 6,
          hs: 5,
        });
    PF.candles(b, X(-1.2), oy + CF, Z(-31.8), 6, 991, root);
    PF.candles(b, X(1.2), oy + CF, Z(-31.8), 5, 992, root);
    // candles on sarcophagi + the Sexton's lamp
    for (const [x, z] of [
      [-5.5, -15.5],
      [0, -10.5],
      [5.5, 1.5],
    ])
      PF.candles(
        b,
        X(x + 0.5),
        oy + CF + 1.05,
        Z(z + 0.9),
        4,
        x * 13 + z,
        root,
      );
    // cobwebs / rubble / bones
    D.rubble(b, X(-9), oy + CF, Z(16), 0.9, 6, 31);
    D.rubble(b, X(-3.8), oy + CF, Z(18.6), 0.6, 4, 32);
    PF.skeleton(b, X(-1.5), oy + CF + 0.02, Z(-2), 1.1);
    PF.skeleton(b, X(9.6), oy + CF - 0.68, Z(17.2), 2.6);
    anchors.crypt = A(-6, CF, -20, 0);
    anchors.spawn1 = A(-5.5, CF, -20.5, 0);
    anchors.spawn2 = A(0, CF, -3, 0);
    anchors.spawn3 = A(-6, CF, 13, 0);
    anchors.spawn4 = A(0, CF, 10, 0);
    anchors.spawn5 = A(-6, CF - 2, 36, 0);
    anchors.spawn6 = A(-3, CF - 2, 39, 0);
    anchors.loot1 = A(5.5, CF, -15.5, 0);
    anchors.loot2 = A(-10.2, CF, 4.5, 0);

    // ---- the one-way return stair: crypt (z 8, y -5) → west aisle (z 23, y 0), gate at the top ----
    PF.stairs(b, "brownstone_dk", X(-8.9), Z(8.2), 0, 1.8, 14.6, oy + CF, oy, {
      base: oy + CF - 0.3,
    });
    b.boxMM("schist", X(-8.0), oy + CF, Z(8), X(-7.6), oy - 0.5, Z(20), {
      seg: false,
    });
    PF.colMM(X(-8.0), oy + CF, Z(8), X(-7.6), oy - 0.5, Z(20), {
      walkable: false,
    });
    PF.railing(
      b,
      [
        [X(-8.0), Z(15)],
        [X(-8.0), Z(22.8)],
      ],
      oy,
      1.0,
      "iron",
      { collide: true },
    );
    PF.railing(
      b,
      [
        [X(-9.8), Z(15)],
        [X(-8.0), Z(15)],
      ],
      oy,
      1.0,
      "iron",
      { collide: true },
    );
    const bolt = new THREE.Group();
    {
      const gb = PF.batch("trinity_bolt");
      for (let i = 0; i < 9; i++)
        gb.box("iron", -0.85 + i * 0.21, 0, 0, 0.035, 2.2, 0.035, {
          seg: false,
        });
      for (const y of [0.3, 1.1, 2.0])
        gb.box("iron", 0, y, 0, 1.8, 0.06, 0.05, { seg: false });
      gb.box("rust", 0, 1.1, -0.12, 0.6, 0.12, 0.12, { seg: false });
      gb.build(bolt);
      bolt.position.set(X(-8.9), oy, Z(22.9));
      root.add(bolt);
    }
    const bcol = { c: null };
    const setBolt = (open) => {
      bolt.position.y = oy + (open ? 2.3 : 0);
      if (!open && !bcol.c)
        bcol.c = PF.col(X(-8.9), Z(22.9), 1.8, 0.3, oy - 1.5, oy + 2.4, 0, {
          walkable: false,
        });
      if (open && bcol.c) {
        G.world.removeCollider(bcol.c);
        bcol.c = null;
      }
    };
    setBolt(false);
    PF.flagWatch.push((k) => {
      if (k === "*" || k === "tr_crypt_gate")
        setBolt(!!PF.flag("tr_crypt_gate"));
    });
    PF.onReset.push(() => setBolt(false));
    PF.use({
      pos: P(-8.9, 0.6, 22.4),
      radius: 0.9,
      range: 2.8,
      label: "Crypt Gate",
      verb: () =>
        PF.flag("tr_crypt_gate")
          ? "Examine"
          : G.player.pos.y < oy - 0.3
            ? "Unbolt"
            : "Open",
      locked: () =>
        !PF.flag("tr_crypt_gate") && G.player.pos.y >= oy - 0.3
          ? "Bolted from the other side"
          : null,
      onInteract() {
        if (PF.flag("tr_crypt_gate")) {
          G.notify("The gate is chained open. A quick way out of the crypt.");
          return;
        }
        if (G.player.pos.y < oy - 0.3) {
          PF.setFlag("tr_crypt_gate", true);
          PF.sfx("door_open", P(-8.9, 0, 22.9));
          G.notify(
            "You slide the rusted bolt. The gate swings up into the aisle.",
          );
        } else {
          PF.sfx("door_locked");
          G.notify("The gate is bolted from below.");
        }
      },
    });

    // ---- the breach & colonial tunnel → the Maniac nest ---------------------
    // tunnel from the breach (x -6, z 20.6) sloping down south to y -7 at z 31, nest chamber z 31..42
    const TNF = -7;
    PF.stepPath(X(-6), Z(20.3), 0, 2.4, 11, (t) => oy + CF + (TNF - CF) * t, {
      maxRise: 0.25,
      thick: 0.6,
    });
    for (let k = 0; k < 11; k++) {
      const z = 20.8 + k,
        y = oy + CF + (TNF - CF) * (k / 11);
      b.box("dirt", X(-6), y - 0.4, Z(z), 2.6, 0.4, 1.05, {
        seg: false,
        grime: 0.5,
      });
      b.box("schist", X(-7.6), y, Z(z), 0.6, 3.0, 1.05, {
        seg: false,
        grime: 0.7,
      });
      b.box("schist", X(-4.4), y, Z(z), 0.6, 3.0, 1.05, {
        seg: false,
        grime: 0.7,
      });
      b.box("rotten", X(-6), y + 2.8, Z(z), 3.2, 0.25, 0.3, { seg: false }); // timber shoring
      if (k % 2 === 0)
        for (const sx of [-1, 1])
          b.box("rotten", X(-6 + sx * 1.25), y, Z(z), 0.2, 2.8, 0.2, {
            seg: false,
          });
    }
    PF.colMM(X(-7.9), oy + TNF - 1, Z(20.6), X(-7.3), oy + CF + 3, Z(31), {
      walkable: false,
    });
    PF.colMM(X(-4.7), oy + TNF - 1, Z(20.6), X(-4.1), oy + CF + 3, Z(31), {
      walkable: false,
    });
    // nest chamber (rough cave-cut room)
    b.boxMM("dirt", X(-11), oy + TNF - 0.5, Z(31), X(-1), oy + TNF, Z(42), {
      grime: 0.6,
    });
    PF.colMM(X(-11), oy + TNF - 0.5, Z(31), X(-1), oy + TNF, Z(42), {
      surface: "dirt",
    });
    K.room(
      b,
      "schist",
      X(-11.6),
      Z(31),
      X(-0.4),
      Z(42.6),
      oy + TNF,
      oy + TNF + 3.6,
      0.6,
      [{ side: "n", c: X(-6), w: 2.6, h: 3.4 }],
      { grime: 0.8 },
    );
    b.boxMM(
      "schist",
      X(-11),
      oy + TNF + 3.5,
      Z(31),
      X(-1),
      oy + TNF + 3.9,
      Z(42),
      { seg: false },
    );
    for (let i = 0; i < 6; i++)
      b.rock(
        "rock",
        X(-10 + r() * 8),
        oy + TNF,
        Z(33 + r() * 8),
        0.5 + r() * 0.6,
        { flat: 0.6 },
      );
    for (let i = 0; i < 5; i++)
      D.mattress(
        b,
        X(-9.5 + i * 1.8),
        oy + TNF + 0.02,
        Z(40.5 - (i % 2) * 1.2),
        r() * PI,
        0x6a5a40,
      );
    for (let i = 0; i < 14; i++)
      b.box(
        "bone",
        X(-10 + r() * 8),
        oy + TNF + 0.03,
        Z(32 + r() * 9),
        0.05,
        0.05,
        0.35 + r() * 0.3,
        { ry: r() * PI, seg: false },
      );
    PF.skeleton(b, X(-3), oy + TNF + 0.02, Z(37), 0.9);
    b.cyl("lamp_green", X(-2.2), oy + TNF, Z(40.5), 0.16, 0.2, 0.3, 6, {
      hSeg: 1,
      noAO: true,
    });
    PF.glow(P(-2.2, TNF + 0.3, 40.5), 0x70ff80, 1.2, root, {
      intensity: 0.9,
      flicker: 0.3,
    });
    anchors.breach = A(-6, CF, 19.6, 0);
    anchors.nest = A(-6, TNF, 37, 0);
    anchors.boss = A(-6, TNF, 39.5, 0);

    // breach interaction (seal the tunnel)
    PF.use({
      pos: P(-6, CF + 1.4, 20.4),
      radius: 1.2,
      range: 3.0,
      label: "The Breach",
      verb: () => (PF.flag("tr_breach") ? "Examine" : "Seal"),
      enabled: () => !!G.player && G.player.pos.z < Z(20.4),
      onInteract() {
        if (PF.flag("tr_breach")) {
          G.notify(
            "The breach is sealed. Nothing is scratching at the chancel any more.",
          );
          return;
        }
        if (PF.live("dialogue") && G.dialogue.start)
          G.dialogue.start("pf_dlg_breach", null, { name: "The Breach" });
        else sealBreach("rubble");
      },
    });
    const sealMesh = new THREE.Group();
    {
      const gb = PF.batch("trinity_seal");
      for (let i = 0; i < 6; i++)
        gb.box("rotten", 0, 0.2 + i * 0.45, 0, 2.8, 0.35, 0.3, {
          rz: i % 2 ? 0.05 : -0.05,
          seg: false,
          grime: 0.6,
        });
      gb.rock("rubble", -0.6, 0, 0.5, 0.8, { flat: 0.6 });
      gb.rock("rubble", 0.8, 0, 0.6, 0.7, { flat: 0.6 });
      gb.build(sealMesh);
      sealMesh.position.set(X(-6), oy + CF, Z(20.9));
      sealMesh.visible = false;
      root.add(sealMesh);
    }
    const scol = { c: null };
    const applySeal = () => {
      const s = !!PF.flag("tr_breach");
      sealMesh.visible = s;
      if (s && !scol.c)
        scol.c = PF.col(
          X(-6),
          Z(20.9),
          3.0,
          0.6,
          oy + CF - 0.5,
          oy + CF + 3.2,
          0,
          { walkable: false },
        );
      if (!s && scol.c) {
        G.world.removeCollider(scol.c);
        scol.c = null;
      }
    };
    PF.flagWatch.push((k) => {
      if (k === "*" || k === "tr_breach") applySeal();
    });
    PF.onReset.push(() => {
      if (scol.c) {
        G.world.removeCollider(scol.c);
        scol.c = null;
      }
      sealMesh.visible = false;
    });
    PF.trBreachPos = P(-6, CF + 1, 20);

    const g = b.build(root, { lodDistInt: 400 });
    g.name = "trinity_interior";

    // triggers: entering the crypt → quest update; reaching the nest
    PF.trigger(
      {
        x0: X(-11),
        x1: X(11),
        y0: oy + CF - 1,
        y1: oy + CF + 2,
        z0: Z(-32),
        z1: Z(19),
      },
      () => {
        PF.q.advance("pf_dust", ["talk", "key", "crypt"], "clear");
      },
      {
        cond: () =>
          PF.q.active("pf_dust") &&
          ["talk", "key", "crypt"].indexOf(PF.q.stage("pf_dust")) >= 0,
      },
    );
    PF.trigger(
      {
        x0: X(-11),
        x1: X(-1),
        y0: oy + TNF - 1,
        y1: oy + TNF + 3,
        z0: Z(31),
        z1: Z(42),
      },
      () => {
        G.notify(
          "The smell of old death and new rot. Something has been nesting down here.",
        );
      },
      { cond: () => PF.q.active("pf_dust") },
    );
    return anchors;
  }

  // ===================================================================
  // Sealing the breach (dialogue actions call this)
  // ===================================================================
  function sealBreach(how) {
    PF.setFlag("tr_breach", how);
    PF.sfx(how === "blast" ? "explosion" : "melee_hit", PF.trBreachPos);
    if (how === "blast") {
      try {
        G.player.shake(0.8, 0.8);
      } catch (e) {
        /* optional */
      }
      try {
        G.fx.dust(PF.trBreachPos);
      } catch (e) {
        /* optional */
      }
    }
    if (how === "blast") PF.inv.remove("frag_grenade", 1);
    const msg = {
      brace:
        "You wedge old pew timbers across the breach and brace them with rubble. It'll hold.",
      blast:
        "The grenade brings the tunnel roof down in a roar of dust. Nothing is getting through that.",
      rubble:
        "An hour of hauling rubble later, the breach is packed tight. Your back will remember this.",
    }[how];
    G.notify(msg || "The breach is sealed.");
    if (how === "rubble") {
      try {
        if (PF.live("rpg") && G.rpg.wait) G.rpg.wait(1);
      } catch (e) {
        /* optional */
      }
    }
    PF.q.advance(
      "pf_dust",
      ["talk", "key", "crypt", "clear", "breach"],
      "report",
    );
  }
  PF.trSealBreach = sealBreach;

  // ===================================================================
  // CONTENT: items, notes, terminal, dialogue, quest, NPCs
  // ===================================================================
  // ---- locks: the crypt gate (key from Reverend Penhallow), the vestry teletype and safe (codes in Penhallow's dialogue / the parish ledger) ----
  const TR_LOCKS = (PF.trLocks = {
    crypt: PF.regLock({
      id: "pf_lk_tr_crypt",
      label: "Trinity Crypt Gate",
      key: "pf_crypt_key",
      kind: "gate",
      hint: 'Reverend Penhallow gives the key (and a spare) for "Dust to Dust".',
    }),
    parish: PF.regLock({
      id: "pf_lk_tr_parish",
      label: "Trinity Parish Teletype",
      passcode: "ALEXANDER",
      kind: "terminal",
      hint: "Reverend Penhallow mentions it when he talks about Hamilton.",
    }),
    safe: PF.regLock({
      id: "pf_lk_tr_vestry_safe",
      label: "Vestry Safe",
      code: "0711",
      kind: "safe",
      hint: "The settlement ledger on the parish teletype.",
    }),
  });
  PF.keyFrom("pf_crypt_key", "Reverend Penhallow (Dust to Dust)");
  PF.item({
    id: "pf_crypt_key",
    type: "key",
    name: "Trinity Crypt Key",
    weight: 0,
    value: 0,
    quest: true,
    desc: "A heavy iron key on a loop of purple ribbon. Reverend Penhallow handed it over like it was hot.",
  });
  PF.item({
    id: "pf_note_sexton",
    type: "note",
    name: "Sexton's Day-Book",
    title: "Day-Book of Silas Cobb, Sexton — Trinity Parish",
    text:
      "Mar 5. The sirens. Forty-one parishioners and I went down into the crypt and I barred the gate as the Rector asked. The ground shook like the end of the world, which the Rector says it was not, technically.\n\n" +
      "Mar 12. Air is thin. The old colonial tunnel behind the south wall has a draught in it. I have begun to dig.\n\n" +
      "Nov 12. We are through to the tunnel. It goes toward the river. The air that comes in is warm and tastes of pennies. Mrs. Okonjo's skin is peeling. Mine too.\n\n" +
      "Dec ?. The lamp oil is gone and I find I do not mind the dark. I have lost the words to the Psalms. The others have stopped talking and started screaming. I will stay with them. A sexton keeps the dead. That is the job.\n\n" +
      "[The last page is a list of names, forty-one of them, each crossed out, and a forty-second — Silas Cobb — not yet crossed out.]",
  });
  PF.item({
    id: "pf_note_organist",
    type: "note",
    name: "Organist's Programme",
    title: "Order of Service — Sunday 5 March 1967 (Fourth Sunday in Lent)",
    text:
      'PRELUDE: "A Mighty Fortress" (arr. for full swell)\nHYMN 1: "Eternal Father, Strong to Save"\nSERMON: "Render Unto Caesar: Faith and Your Shelter Card" — The Rev. H. Whitcombe\n\n' +
      "[Pencilled in the margin:] Sunday is cancelled. Everything is cancelled. I am staying up here to play anyway. If God is listening, the acoustics had better be good.",
  });
  PF.item({
    id: "pf_note_lookout",
    type: "note",
    name: "Lookout's Log",
    title: "Belfry Watch — Trinity Sanctuary",
    text: "Day 1: Wall Street quiet. Raider fires at the Exchange again.\nDay 3: Robots still marching around the Federal Reserve on Liberty Street. Round and round. Nobody goes in. Nobody comes out.\nDay 4: Shellbacks on the Seaport piers, big ones. Something hatching on the tall ship.\nDay 6: Lights in Fraunces Tavern. Tobin says rumours are free, drinks are not.\nDay 9: Scratching under the chancel again at night. Reverend says it's rats. Reverend has never met a rat.",
  });
  PF.item({
    id: "pf_reel_rector",
    type: "tape",
    name: 'Tape reel: "The Last Sermon"',
    title: "Trinity Parish — Recorded Sermon, 5 Mar 1967 (partial)",
    text: "[Organ, very faint. A cough.]\n\nRECTOR WHITCOMBE: ...and so when they tell us the Shelter is Tomorrow, remember that this church has stood through fire, through revolution, through the Panic of 1907 and the markets of last Tuesday. We do not need a reservation to be saved.\n\n[A siren begins outside.]\n\nRECTOR: ...Ah. Well. Silas, would you be so kind as to open the crypt. Ladies and gentlemen, please proceed downstairs in an orderly — no, walk, WALK —\n\n[Recording ends.]",
  });
  PF.item({
    id: "pf_weehawken",
    build() {
      const base = PF.live("items")
        ? G.items.get("pistol_32") || G.items.get("pistol_10mm")
        : null;
      const w =
        base && base.weapon
          ? Object.assign({}, base.weapon, {
              damage: Math.round((base.weapon.damage || 14) * 1.9),
              magSize: 5,
              critMult: 2.5,
              critChance: 2.0,
              spread: (base.weapon.spread || 0.02) * 0.6,
              skin: "gold",
              condDecay: (base.weapon.condDecay || 0.002) * 0.6,
            })
          : undefined;
      return {
        id: "pf_weehawken",
        type: w ? "weapon" : "misc",
        name: "Weehawken",
        weight: 2,
        value: 900,
        unique: true,
        icon: base ? base.icon : undefined,
        desc: 'A .32 revolver with a brass-inlaid grip engraved "A.H. — 1804". Reverend Penhallow swears it is a faithful copy of a certain pair of duelling pistols. The Reverend is a terrible liar. Superb critical hits.',
        weapon: w,
      };
    },
  });

  PF.terminal("pf_tr_parish", {
    title: "TRINITY PARISH OFFICE",
    header: "KESTREL TELETYPE CORP. — MODEL 40 — PARISH RECORDS SYSTEM v2.1",
    lock: TR_LOCKS.parish,
    entries: [
      {
        title: "Burial Register (Crypt)",
        text: 'CRYPT INTERMENTS SUSPENDED 1843.\nEXCEPTION: EMERGENCY SHELTER PROTOCOL (CIVIL DEFENSE ORDER CD-61-114) — "Parish crypts designated as public shelter where no private shelter space is held."\n\nSHELTER LOG: 42 persons admitted 03/05/1967. Sexton S. Cobb responsible.\n\nNO FURTHER ENTRIES.',
      },
      {
        title: "Memo: The South Wall",
        text: 'To: Rector Whitcombe\nFrom: Buildings & Grounds\n\nThe draught in the crypt\'s south wall is the old colonial tunnel (c. 1776) that ran to the river. It was bricked up in 1911. The bricks are "sort of" still there. Recommend we do not tell the insurance people.',
      },
      {
        title: "Sermon Draft (unfinished)",
        text: "RENDER UNTO CAESAR\n\nWhen the Office of Civil Defense asks for our faith, and the Federal Reserve asks for our gold, and the Stock Exchange asks for our souls, we must ask: which of these will still be standing on Monday?\n\n[Draft ends. Coffee ring.]",
      },
      {
        title: "Settlement Ledger (Rev. Penhallow)",
        text: "Water: 3 barrels. Potato beds: 5, doing well. Doc Obi: out of Prussian Blue again.\nDonations: 212 scrip, one old-world ten-dollar bill (Hamilton's grave — returned it), a live chicken (ate it).\n\nThe scratching under the chancel is getting louder. Must ask a stranger. Nobody here will go down.\n\nVestry safe reset to 0711 (the duel; the old Rector's joke, kept for his sake).",
        learn: "pf_lk_tr_vestry_safe",
      },
    ],
  });

  // --- dialogue: Reverend Josiah Penhallow -----------------------------------
  PF.dialogue("pf_dlg_pell", {
    start: () => {
      const st = PF.q.stage("pf_dust");
      if (PF.q.active("pf_dust") && st === "report") return "report";
      return PF.flag("tr_met") ? "again" : "first";
    },
    nodes: {
      first: {
        text: "Welcome to Trinity, child. Sanctuary is free: water from the pump, a pew to sleep on, and the Lord's own roof — mostly. Holes in it, but holy ones. I'm Reverend Josiah Penhallow. Rules are on the board by the door. Guns stay holstered. Maniacs are not parishioners.",
        onEnter() {
          PF.setFlag("tr_met", true);
        },
        responses: [
          {
            text: "How did you end up running a church in the ruins?",
            next: "history",
          },
          {
            text: "You look worried, Reverend.",
            next: "problem",
            cond: () => !PF.q.started("pf_dust"),
          },
          {
            text: "About the crypt...",
            next: "problem",
            cond: () =>
              PF.q.active("pf_dust") && PF.q.stage("pf_dust") === "talk",
          },
          {
            text: "[Donate 25 scrip] Bless me, Reverend.",
            cond: () => PF.inv.scrip() >= 25,
            action: () => {
              PF.inv.addScrip(-25);
              PF.setFlag("tr_blessed", (PF.flag("tr_blessed") || 0) + 1);
              PF.standing(10, "Donation to Trinity");
              try {
                G.player.heal(25);
              } catch (e) {
                /* ignore */
              }
            },
            next: "bless",
          },
          { text: "Goodbye, Reverend." },
        ],
      },
      again: {
        text: () =>
          PF.q.complete("pf_dust")
            ? "The nights are quiet now. I sleep. The Doc sleeps. Even Tobias sleeps, and Tobias hasn't slept since the Truman administration. God bless you."
            : "Back again. The door's always open. Mostly because we can't find the key to it.",
        responses: [
          {
            text: "About the scratching under the chancel...",
            next: "problem",
            cond: () =>
              !PF.q.started("pf_dust") ||
              (PF.q.active("pf_dust") && PF.q.stage("pf_dust") === "talk"),
          },
          {
            text: "I need the crypt key again.",
            cond: () =>
              PF.q.active("pf_dust") &&
              !PF.inv.count("pf_crypt_key") &&
              !PF.flag("tr_crypt_open"),
            action: () => PF.inv.add("pf_crypt_key", 1),
            next: "key_again",
          },
          { text: "Tell me about Trinity.", next: "history" },
          {
            text: "[Donate 25 scrip] Bless me, Reverend.",
            cond: () => PF.inv.scrip() >= 25,
            action: () => {
              PF.inv.addScrip(-25);
              PF.setFlag("tr_blessed", (PF.flag("tr_blessed") || 0) + 1);
              PF.standing(10, "Donation to Trinity");
              try {
                G.player.heal(25);
              } catch (e) {
                /* ignore */
              }
            },
            next: "bless",
            repeatable: true,
          },
          { text: "Goodbye." },
        ],
      },
      history: {
        text: "I was a deacon in Brooklyn when the bombs fell. Walked across the bridge in '82 with eleven people and a goat. Found this place standing when half the street around it wasn't — the spire's been the tallest thing on Wall Street twice now. Hamilton's out in the yard, you know. We keep his grave tidy. Man knew a thing or two about owing money.",
        responses: [
          { text: "Hamilton?", next: "hamilton" },
          {
            text: "Anything I can help with?",
            next: "problem",
            cond: () => !PF.q.started("pf_dust"),
          },
          { text: "Thanks, Reverend." },
        ],
      },
      hamilton: {
        learn: "pf_lk_tr_parish",
        text: "First Secretary of the Treasury. Built the whole machine — banks, credit, the national debt. People leave him scrip now. I think he'd have appreciated a currency you can find on the ground. The old Rector even made him the password on the vestry teletype: ALEXANDER. Read the parish records, if you like. They're mostly about drains.",
        responses: [{ text: "Fair enough.", next: "again" }],
      },
      problem: {
        text: "There is something under my chancel. Every night, after the lanterns are down: scratching. At the crypt gate, at the floor. The Doc says Maniacs. I say the crypt has been sealed since the Bombing, and the dead should stay where they're put. None of my people will go down. You, though... you have the look of someone who goes down into places.",
        responses: [
          {
            text: "I'll take a look.",
            action: () => {
              if (!PF.q.started("pf_dust")) PF.q.start("pf_dust");
              PF.q.advance("pf_dust", "talk", "key");
              PF.inv.add("pf_crypt_key", 1);
            },
            next: "key",
          },
          { text: "What's in it for me?", next: "reward" },
          {
            text: "[Persuasion 40] A job like that is worth more than a blessing.",
            check: { skill: "persuasion", value: 40 },
            next: "haggle",
            failNext: "haggle_fail",
            cond: () => !PF.flag("tr_haggled"),
          },
          { text: "Not my problem." },
        ],
      },
      reward: {
        text: "Scrip — a hundred, all we've got in the poor box. And there's a thing in the vestry that belonged to the old Rector. A pistol. Engraved. Men of God shouldn't keep pistols. I keep it anyway. It's yours if you bring me quiet nights.",
        responses: [
          {
            text: "Deal. Give me the key.",
            action: () => {
              if (!PF.q.started("pf_dust")) PF.q.start("pf_dust");
              PF.q.advance("pf_dust", "talk", "key");
              PF.inv.add("pf_crypt_key", 1);
            },
            next: "key",
          },
          { text: "I'll think about it." },
        ],
      },
      haggle: {
        text: "...You'd make a fine collection-plate man. All right — a hundred and fifty. The Lord will understand; the Doc won't.",
        onEnter() {
          PF.setFlag("tr_haggled", true);
        },
        responses: [
          {
            text: "Deal. Give me the key.",
            action: () => {
              if (!PF.q.started("pf_dust")) PF.q.start("pf_dust");
              PF.q.advance("pf_dust", "talk", "key");
              PF.inv.add("pf_crypt_key", 1);
            },
            next: "key",
          },
        ],
      },
      haggle_fail: {
        text: "Child, I am a preacher in a ruin. You are negotiating with a man whose collection plate is a hubcap.",
        responses: [
          {
            text: "Fine. I'll do it.",
            action: () => {
              if (!PF.q.started("pf_dust")) PF.q.start("pf_dust");
              PF.q.advance("pf_dust", "talk", "key");
              PF.inv.add("pf_crypt_key", 1);
            },
            next: "key",
          },
          { text: "Forget it." },
        ],
      },
      key: {
        text: "Here. The gate's at the end of the west aisle, past the chancel. Take a lamp. Take a gun. Take... well, you know what you're doing. If you find anyone down there who was one of ours — be kind, if you can. Be quick, if you can't.",
        responses: [{ text: "I'll be back." }],
      },
      key_again: {
        text: "Lose things often? Here. That's the spare. There is no spare after the spare.",
        responses: [{ text: "Thanks." }],
      },
      bless: {
        text: "The Lord bless you and keep you, and keep your rads low and your tonic bottles full. [He sketches a cross in the air. You feel... slightly better.]",
        responses: [{ text: "Amen." }],
      },
      report: {
        text: () => {
          const how = PF.flag("tr_breach");
          const tail =
            how === "blast"
              ? "I heard the blast from up here. So did the Doc. So did Brooklyn."
              : how === "brace"
                ? "Braced with pew timber, you say? The pews have never been more useful."
                : "Hauled rubble with your own hands. That's a penance I'd not wish on a banker.";
          return (
            "It's quiet. First quiet night in a year, and I could hear it before you even came up the aisle. " +
            tail +
            " And the Sexton — Silas Cobb. I read his name in the old register. Forty-two souls. Now they rest."
          );
        },
        responses: [
          {
            text: "They're at rest now.",
            action: () => {
              PF.q.done("pf_dust");
              PF.inv.remove("pf_crypt_key", 1);
              if (PF.flag("tr_haggled")) PF.inv.addScrip(50);
              PF.news(
                "Word from Trinity Church on Wall Street: the Reverend says the crypt is quiet and the sanctuary is open to all. He also says to stop leaving scrip on Hamilton's grave. He will, however, accept them in the poor box.",
              );
            },
            next: "thanks",
          },
        ],
      },
      thanks: {
        text: 'Take the Rector\'s pistol. "Weehawken," he called it — an old joke about a duel. Use it on things that deserve it. And come back whenever you need a pew.',
        responses: [{ text: "Goodbye, Reverend." }],
      },
    },
  });

  // --- dialogue: sealing the breach -------------------------------------
  PF.dialogue("pf_dlg_breach", {
    start: "root",
    nodes: {
      root: {
        speaker: "The Breach",
        text: () =>
          "A ragged hole in the crypt's south wall, where colonial bricks have been clawed out from the far side. Cold air breathes out of the dark, smelling of river mud and something worse." +
          (PF.getNpc("pf_tr_sexton") && !PF.getNpc("pf_tr_sexton").dead
            ? " Deep in the tunnel, something big is breathing."
            : ""),
        responses: [
          {
            text: "[Mechanics 40] Brace the hole with pew timbers and rubble.",
            check: { skill: "mechanics", value: 40 },
            action: () => sealBreach("brace"),
            failNext: "fail_repair",
          },
          {
            text: "[Explosives 35] Wedge a frag grenade in the roof of the tunnel and collapse it.",
            check: { skill: "explosives", value: 35 },
            cond: () => PF.inv.count("frag_grenade") > 0,
            action: () => sealBreach("blast"),
            failNext: "fail_blast",
          },
          {
            text: "Pack the hole with rubble, one stone at a time. (Takes an hour)",
            action: () => sealBreach("rubble"),
          },
          { text: "Leave it for now." },
        ],
      },
      fail_repair: {
        speaker: "The Breach",
        text: "The timbers slip and crash. You're going to need a better plan — or more patience.",
        responses: [
          {
            text: "Pack it with rubble instead. (Takes an hour)",
            action: () => sealBreach("rubble"),
          },
          { text: "Leave it." },
        ],
      },
      fail_blast: {
        speaker: "The Breach",
        text: "You look at the grenade. You look at the ceiling. You look at the forty feet of church on top of the ceiling. Maybe not.",
        responses: [
          {
            text: "Pack it with rubble instead. (Takes an hour)",
            action: () => sealBreach("rubble"),
          },
          { text: "Leave it." },
        ],
      },
    },
  });

  // --- dialogue: Doctor Hester Obi ----------------------------------------
  PF.dialogue("pf_dlg_obi", {
    start: "root",
    nodes: {
      root: {
        text: () =>
          "Doctor Obi. Infirmary's open, supplies are not infinite. " +
          (G.player && G.player.hp < G.player.maxHp * 0.7
            ? "You're leaking. Sit."
            : "You look vertical, which is my favourite kind of patient."),
        responses: [
          {
            text: "[30 scrip] Patch me up.",
            cond: () => PF.inv.scrip() >= 30,
            action: () => {
              PF.inv.addScrip(-30);
              heal(false);
            },
            next: "healed",
            repeatable: true,
          },
          {
            text: "[75 scrip] Flush the radiation out of me.",
            cond: () => PF.inv.scrip() >= 75,
            action: () => {
              PF.inv.addScrip(-75);
              heal(true);
            },
            next: "flushed",
            repeatable: true,
          },
          { text: "Let me see what you're selling.", barter: true },
          {
            text: "How do you keep a clinic running out here?",
            next: "clinic",
          },
          { text: "Take care, Doc." },
        ],
      },
      healed: {
        text: "There. Stitches, a Rally Tonic and a stern look. The stern look is free.",
        responses: [{ text: "Thanks, Doc." }],
      },
      flushed: {
        text: "Prussian Blue, forty minutes on a cot, and I'll ask you not to glow in my infirmary again. The Reverend thinks it's a sign.",
        responses: [{ text: "Thanks, Doc." }],
      },
      clinic: {
        text: "Pills and tonic from the Seaport traders before the Shellbacks moved in, Prussian Blue from whatever the Reverend can beg. I was a veterinary nurse before all this. Turns out people are just large, whiny dogs.",
        responses: [{ text: "Fair.", next: "root" }],
      },
    },
  });
  function heal(rads) {
    try {
      if (PF.live("rpg") && G.rpg.doctorHeal)
        G.rpg.doctorHeal({ rads: !!rads, limbs: true, hp: true });
      else {
        G.player.heal(999);
        if (rads) {
          G.player.rads = Math.max(0, G.player.rads - 400);
        }
      }
    } catch (e) {
      try {
        G.player.heal(999);
      } catch (e2) {
        /* ignore */
      }
    }
    PF.sfx("inject");
  }

  PF.quest({
    id: "pf_dust",
    name: "Dust to Dust",
    giver: "Reverend Penhallow",
    location: "Trinity Church",
    desc: "Something has been scratching at the crypt gate beneath Trinity Church every night. Reverend Josiah Penhallow asked me to find out what, and make it stop.",
    stages: [
      {
        id: "talk",
        text: "Speak with Reverend Josiah Penhallow inside Trinity Church.",
        markers: () => [{ npc: "pf_tr_reverend", label: "Reverend Penhallow" }],
      },
      {
        id: "key",
        text: "Unlock the crypt gate at the end of the west aisle.",
        markers: () => {
          const a = PF.anchorOf("trinity_church", "crypt_door");
          return a
            ? [
                {
                  x: a.x,
                  z: a.z,
                  y: a.y,
                  label: "Crypt Gate",
                  interior: "trinity_church",
                },
              ]
            : [];
        },
      },
      {
        id: "crypt",
        text: "Descend into the crypt beneath Trinity Church.",
        markers: () => {
          const a = PF.anchorOf("trinity_church", "crypt");
          return a
            ? [
                {
                  x: a.x,
                  z: a.z,
                  y: a.y,
                  label: "Crypt",
                  interior: "trinity_church",
                },
              ]
            : [];
        },
      },
      {
        id: "clear",
        text: "Find the source of the scratching in the crypt.",
        markers: () => {
          const a = PF.anchorOf("trinity_church", "breach");
          return a
            ? [
                {
                  x: a.x,
                  z: a.z,
                  y: a.y,
                  label: "South Wall",
                  interior: "trinity_church",
                },
              ]
            : [];
        },
      },
      {
        id: "breach",
        text: "Seal the breach in the crypt's south wall.",
        markers: () => {
          const a = PF.anchorOf("trinity_church", "breach");
          return a
            ? [
                {
                  x: a.x,
                  z: a.z,
                  y: a.y,
                  label: "The Breach",
                  interior: "trinity_church",
                },
              ]
            : [];
        },
      },
      {
        id: "report",
        text: "Return to Reverend Penhallow.",
        markers: () => [{ npc: "pf_tr_reverend", label: "Reverend Penhallow" }],
      },
    ],
    rewards: {
      xp: 350,
      scrip: 100,
      standing: 50,
      items: [["pf_weehawken", 1]],
    },
  });
  PF.anchorOf = function (poi, name) {
    try {
      return G.pois.getAnchor(poi, name);
    } catch (e) {
      return null;
    }
  };

  // Sexton killed → the breach stage
  G.events.on("actorKilled", (a) => {
    if (!a || !a.id) return;
    if (a.id === "pf_tr_sexton") {
      PF.setFlag("tr_sexton_dead", true);
      if (
        PF.q.active("pf_dust") &&
        ["crypt", "clear", "key", "talk"].indexOf(PF.q.stage("pf_dust")) >= 0 &&
        !PF.flag("tr_breach")
      )
        PF.q.set("pf_dust", "breach");
    }
  });

  // ---- NPC roster ----------------------------------------------------------
  function npcAt(name) {
    return () => PF.anchorOf("trinity_church", name);
  }
  PF.trNpcs = function (anch) {
    const pos = (a) => ({ x: a.x, y: a.y, z: a.z });
    PF.npc({
      id: "pf_tr_reverend",
      type: "human",
      name: "Reverend Josiah Penhallow",
      outfit: "settler",
      gender: "m",
      faction: "settlers",
      level: 6,
      pos: pos(anch.reverend),
      yaw: anch.reverend.yaw,
      ai: "guard",
      home: { x: anch.reverend.x, z: anch.reverend.z, r: 2 },
      dialogue: "pf_dlg_pell",
      essential: true,
      voice: "settler",
      seed: 4101,
      weapon: "none",
      barks: [
        "Guns stay holstered in the Lord's house.",
        "Mind the hole in the roof. And in the floor.",
        "Bless you, child.",
      ],
    });
    PF.npc({
      id: "pf_tr_doctor",
      type: "human",
      name: "Doctor Hester Obi",
      outfit: "doctor",
      gender: "f",
      faction: "settlers",
      level: 6,
      pos: pos(anch.doctor),
      yaw: anch.doctor.yaw,
      ai: "guard",
      home: { x: anch.doctor.x, z: anch.doctor.z, r: 2.5 },
      dialogue: "pf_dlg_obi",
      essential: true,
      voice: "settler",
      seed: 4102,
      weapon: "none",
      merchant: {
        scrip: 350,
        stock: [
          ["rally_tonic", 6],
          ["prussian_blue", 3],
          ["iodine_tabs", 3],
          ["morphine_syrette", 2],
          ["purified_water", 4],
          ["field_surgery_kit", 1],
          ["bull_tabs", 1],
        ],
        restock: 3,
      },
      barks: [
        "Next!",
        "Keep pressure on it.",
        "I'm out of Prussian Blue. Again.",
      ],
    });
    PF.npc({
      id: "pf_tr_deacon",
      type: "human",
      name: "Deacon Barlow",
      outfit: "leather_armor",
      gender: "m",
      faction: "settlers",
      level: 7,
      pos: pos(anch.ext_guard),
      yaw: anch.ext_guard.yaw,
      ai: "guard",
      home: { x: anch.ext_guard.x, z: anch.ext_guard.z, r: 1.5 },
      weapon: "hunting_rifle",
      voice: "guard",
      seed: 4103,
      barks: [
        "Holster it or turn around.",
        "Sanctuary's inside. Doc too.",
        "Welcome to Trinity. Wipe your feet. On the raiders, ideally.",
      ],
    });
    PF.npc({
      id: "pf_tr_maggie",
      type: "human",
      name: "Maggie Vail",
      outfit: "survivor",
      gender: "f",
      faction: "settlers",
      level: 3,
      pos: pos(anch.refugee1),
      yaw: 0,
      ai: "wander",
      home: { x: anch.refugee1.x, z: anch.refugee1.z, r: 5 },
      voice: "settler",
      seed: 4104,
      weapon: "none",
      barks: [
        "Pews are hard, but they don't shoot back.",
        "The Reverend saved my kids. Don't you cause trouble.",
        "Heard the Seaport shellbacks are laying eggs on that big ship.",
      ],
    });
    PF.npc({
      id: "pf_tr_tobias",
      type: "human",
      name: "Old Tobias",
      outfit: "settler",
      gender: "m",
      faction: "settlers",
      level: 2,
      pos: pos(anch.refugee2),
      yaw: PI,
      ai: "guard",
      home: { x: anch.refugee2.x, z: anch.refugee2.z, r: 1 },
      voice: "settler",
      seed: 4105,
      weapon: "none",
      barks: [
        "Scratching again last night. I heard it. Nobody believes old Tobias.",
        "Hamilton owed my great-great-great-grandpappy money. Probably.",
        "Don't sit there, that's where the roof drips.",
      ],
    });
    // crypt Maniacs + the Sexton (hostile, stable ids so their deaths persist)
    const pack = [
      [anch.spawn1, "Maniac Parishioner"],
      [anch.spawn2, "Maniac Parishioner"],
      [anch.spawn3, "Maniac Parishioner"],
      [anch.spawn5, "Maniac Parishioner"],
    ];
    pack.forEach(([a, nm], i) =>
      PF.npc({
        id: "pf_tr_maniac" + (i + 1),
        type: "maniac",
        name: nm,
        faction: "maniacs",
        level: 4 + i,
        pos: pos(a),
        yaw: r0(i),
        ai: "wander",
        home: { x: a.x, z: a.z, r: 6 },
        seed: 4110 + i,
      }),
    );
    PF.npc({
      id: "pf_tr_sexton",
      type: "maniac_bruiser",
      name: "Silas Cobb, the Sexton",
      faction: "maniacs",
      level: 8,
      pos: pos(anch.boss),
      yaw: 0,
      ai: "guard",
      home: { x: anch.boss.x, z: anch.boss.z, r: 5 },
      seed: 4120,
      loot: "maniac_bruiser",
      inventory: [
        ["pf_note_sexton", 1],
        ["scrip", 35],
      ],
    });
  };
  function r0(i) {
    return (i * 1.7) % TAU;
  }

  // ===================================================================
  // BUILDER
  // ===================================================================
  PF.addBuilder(
    "trinity_church",
    function (PF2, site, root) {
      const ext = buildExterior(site, root);
      const cell = PF.cell("trinity_church");
      const int = buildInterior(cell, ext);
      // exterior entrance door → narthex
      PF.door({
        id: "pf_tr_enter",
        pos: V3(TX + TW / 2 + 1.0, 1.6, TZ),
        label: "Trinity Church",
        verb: "Enter",
        radius: 1.6,
        target: {
          x: int.entrance.x,
          y: int.entrance.y + 0.05,
          z: int.entrance.z,
          yaw: 0,
        },
        sound: "door_open",
      });
      // lookout door back into the belfry (placeholder target filled now that the interior exists)
      for (const d of G.world.doors || [])
        if (d.def && d.def.id === "pf_tr_lookout_in")
          d.def.target = PF.lookoutBack;
      // extra anchors for NPCs / combat / quests
      int.refugee1 = PF.anchor(
        int.entrance.x,
        int.entrance.y,
        int.entrance.z - 16,
        0,
      ); // centre aisle (was inside a pew)
      int.refugee2 = PF.anchor(
        int.entrance.x + 3.3,
        int.entrance.y,
        int.entrance.z - 26.2,
        PI,
      ); // (was 0.2 m from the rail collider)
      int.npc2 = int.doctor;
      int.npc3 = int.refugee1;
      int.merchant = int.doctor;
      int.ext_guard = ext.guard1;
      int.loot3 = PF.anchor(
        int.belfry.x + 1.6,
        int.belfry.y,
        int.belfry.z - 5.8,
        0,
      );
      const all = Object.assign({}, int, {
        exterior_entrance: ext.entrance,
        gate: ext.gate,
        hamilton: ext.hamilton,
        lookout: ext.lookout,
        guard1: ext.guard1,
      });
      PF.register("trinity_church", root, all, {
        interiorRoot: cell.root,
        interiorKey: "trinity_church",
      });
      PF.trNpcs(all);

      // persistent props: terminal, safe, containers, notes (interior y is lifted: always build on the anchor's y)
      PF.prop("terminal", {
        x: int.terminal.x,
        y: int.terminal.y,
        z: int.terminal.z,
        yaw: 0,
        terminalId: "pf_tr_parish",
        id: "pf_tr_terminal",
      });
      PF.prop("safe", {
        x: int.safe.x,
        y: int.safe.y + 0.9,
        z: int.safe.z,
        yaw: -HP,
        lock: TR_LOCKS.safe,
        loot: "wall_safe",
        id: "pf_tr_safe",
        name: "Vestry Safe",
        owner: "settlers",
      });
      PF.prop("first_aid", {
        x: int.clinic.x + 1.9,
        y: int.clinic.y + 1.4,
        z: int.clinic.z - 2.6,
        yaw: -HP,
        id: "pf_tr_firstaid",
        owner: "settlers",
      });
      PF.prop("footlocker", {
        x: int.refugee1.x - 5.6,
        y: int.refugee1.y,
        z: int.refugee1.z - 3,
        yaw: HP,
        loot: "footlocker",
        id: "pf_tr_footlocker",
        owner: "settlers",
      });
      PF.prop("ammo_box", {
        x: int.loot_belfry.x,
        y: int.loot_belfry.y,
        z: int.loot_belfry.z,
        yaw: 0,
        loot: "ammo_box",
        id: "pf_tr_belfry_ammo",
      });
      PF.prop("footlocker", {
        x: int.loot1.x + 1.3,
        y: int.loot1.y,
        z: int.loot1.z,
        yaw: HP,
        loot: "skeleton",
        id: "pf_tr_crypt_chest1",
        name: "Parishioner's Trunk",
      });
      PF.prop("footlocker", {
        x: int.nest.x + 3.5,
        y: int.nest.y,
        z: int.nest.z - 3,
        yaw: -HP,
        loot: "raider_stash",
        id: "pf_tr_nest_stash",
        name: "Scavenger's Pack",
      });
      PF.prop("scrip_stash", {
        x: int.loot2.x + 0.2,
        y: int.loot2.y,
        z: int.loot2.z,
        yaw: 0,
        id: "pf_tr_crypt_scrip",
      });
      PF.prop("lamp", {
        x: int.vestry.x - 0.3,
        y: int.vestry.y,
        z: int.vestry.z - 7.0,
        kind: "desk",
        id: "pf_tr_lamp1",
      });
      PF.pickup(
        "pf_note_organist",
        1,
        V3(int.organ.x + 0.5, int.organ.y + 1.15, int.organ.z + 1.6),
      );
      PF.pickup(
        "pf_note_lookout",
        1,
        V3(int.belfry.x - 4.2, int.belfry.y + 0.3, int.belfry.z + 0.6),
      );
      PF.pickup(
        "pf_reel_rector",
        1,
        V3(int.vestry.x - 1.2, int.vestry.y + 0.56, int.vestry.z - 8.6),
      ); // on the rector's cot
      PF.pickup(
        "rally_tonic",
        1,
        V3(int.loot1.x - 0.3, int.loot1.y + 1.1, int.loot1.z + 0.4),
      );
      // the scratching: eerie sounds near the crypt gate at night while the quest is unresolved
      let scratchT = 8;
      PF.updaters.push((dt) => {
        if (PF.flag("tr_breach")) return;
        scratchT -= dt;
        if (scratchT > 0) return;
        scratchT = 9 + Math.random() * 10;
        const p = G.player.pos,
          cd = int.crypt_door;
        if (Math.hypot(p.x - cd.x, p.z - cd.z) < 16 && Math.abs(p.y - cd.y) < 3)
          PF.sfx("maniac_growl", V3(cd.x, cd.y - 3, cd.z), {
            volume: 0.35,
            pitch: 0.7,
          });
      });
    },
    10,
  );
})();
