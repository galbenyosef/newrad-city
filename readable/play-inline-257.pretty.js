/* src/poi_bridges/20_manhattan_ext.js */
/* =====================================================================
 * NEW RAD CITY — POI BRIDGES — MANHATTAN BRIDGE (exterior)
 * Site x 196..560, z 560..586, deckY 20 (closes Canal St & the avenues).
 *  - Carrère & Hastings' granite TRIUMPHAL ARCH (x 226..236) with its two
 *    curved COLONNADES embracing the Canal Street forecourt, the allegorical
 *    groups on their plinths and the "buffalo hunt" frieze.
 *  - The roadway climbs through the arch on a masonry approach to the
 *    Manhattan ANCHORAGE (twin cable housings x 258..290), crosses the
 *    river on a stiffened suspension span hung from four cables over two
 *    blue steel TOWERS with arched crowns and globe finials (x 320, 436),
 *    and descends past the Brooklyn anchorage (x 462..494) to DUMBO.
 *  - Lower level: subway tracks inside the stiffening trusses; a derailed
 *    D-train car hangs out over the East River.
 *  - The anchorage's service door (south housing, street level) leads to
 *    the Brute larder in the anchorage vaults (INTERIORS.manhattan_bridge);
 *    a hatch on the housing roof connects back from the vaults.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE || !G._pbr) return;
  const PF = G._pbr;
  const BK = PF.bk,
    K = PF.kit,
    D = PF.dress;
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  const PI = Math.PI,
    HP = PI / 2;
  const UP = V3(0, 1, 0),
    XA = V3(1, 0, 0),
    ZA = V3(0, 0, 1);

  const M = (PF.MB = {
    zc: 573,
    deck: 20,
    z0: 561,
    z1: 585,
    road: { z0: 566.4, z1: 579.6 }, // centre band between the cable housings
    cables: [562.2, 565.2, 580.8, 583.8],
    legs: [563.7, 582.3],
    t1: 320,
    t2: 436,
    tTop: 72,
    ancM: { x0: 258, x1: 290, saddle0: 282 }, // Manhattan anchorage housings (+ saddle under the deck)
    ancB: { x0: 462, x1: 494, saddle1: 472 }, // Brooklyn anchorage
    rampM: { x0: 216, x1: 282 },
    rampB: { x0: 472, x1: 556 },
    ramp: { z0: 567.6, z1: 578.4 },
    arch: { x0: 226, x1: 236, z0: 560.5, z1: 585.5, open: 11, spring: 7.5 },
    lo: 13,
  });
  const midX = (M.t1 + M.t2) / 2,
    half = (M.t2 - M.t1) / 2;
  /** Main-cable height at x (parabola between the towers, straight backstays to the anchorages). */
  function cableY(x) {
    if (x >= M.t1 && x <= M.t2) {
      const u = (x - midX) / half;
      return M.tTop - (M.tTop - 22.5) * (1 - u * u);
    }
    if (x < M.t1) {
      const t = (M.t1 - x) / (M.t1 - 272);
      return M.tTop + (30 - M.tTop) * t + Math.sin(t * PI) * -2.5;
    }
    const t = (x - M.t2) / (480 - M.t2);
    return M.tTop + (30 - M.tTop) * t + Math.sin(t * PI) * -2.5;
  }
  M.cableY = cableY;
  const rampYM = (x) =>
    Math.max(
      0,
      Math.min(M.deck, ((x - M.rampM.x0) / (M.rampM.x1 - M.rampM.x0)) * M.deck),
    );
  const rampYB = (x) =>
    Math.max(
      0,
      Math.min(M.deck, ((M.rampB.x1 - x) / (M.rampB.x1 - M.rampB.x0)) * M.deck),
    );

  // =================================================================
  // Triumphal arch + colonnades (Carrère & Hastings, 1912)
  // =================================================================
  /** Canvas relief frieze: a buffalo hunt in low relief (light/shadow on stone). */
  function friezeTex() {
    return PF.canvasTex(
      "pbr_mb_frieze",
      1024,
      128,
      (ctx, w, h) => {
        const r = PF.rng(1912);
        ctx.fillStyle = "#b8b2a4";
        ctx.fillRect(0, 0, w, h);
        const fig = (x, y, s, kind) => {
          const draw = (dx, dy, col) => {
            ctx.fillStyle = col;
            ctx.beginPath();
            if (kind === "buffalo") {
              ctx.ellipse(x + dx, y + dy, 34 * s, 20 * s, 0, 0, Math.PI * 2);
              ctx.fill();
              ctx.beginPath();
              ctx.ellipse(
                x + dx - 30 * s,
                y + dy - 8 * s,
                16 * s,
                14 * s,
                0,
                0,
                Math.PI * 2,
              );
              ctx.fill();
              for (const lx of [-20, -8, 12, 24])
                ctx.fillRect(x + dx + lx * s, y + dy + 12 * s, 5 * s, 22 * s);
            } else {
              ctx.ellipse(
                x + dx,
                y + dy - 26 * s,
                7 * s,
                8 * s,
                0,
                0,
                Math.PI * 2,
              );
              ctx.fill();
              ctx.fillRect(x + dx - 6 * s, y + dy - 18 * s, 12 * s, 26 * s);
              ctx.beginPath();
              ctx.ellipse(
                x + dx,
                y + dy + 16 * s,
                26 * s,
                14 * s,
                0,
                0,
                Math.PI * 2,
              );
              ctx.fill();
              for (const lx of [-18, 16])
                ctx.fillRect(x + dx + lx * s, y + dy + 24 * s, 5 * s, 18 * s);
              ctx.fillRect(x + dx + 4 * s, y + dy - 14 * s, 30 * s, 3 * s);
            }
          };
          draw(3, 3, "rgba(60,54,44,0.55)");
          draw(-2, -2, "rgba(250,246,236,0.5)");
          draw(0, 0, "#aaa496");
        };
        for (let i = 0; i < 9; i++)
          fig(
            60 + i * 112 + r() * 20,
            70 + r() * 10,
            0.85 + r() * 0.2,
            i % 3 === 1 ? "rider" : "buffalo",
          );
        ctx.fillStyle = "rgba(40,36,30,0.35)";
        ctx.fillRect(0, 0, w, 6);
        ctx.fillRect(0, h - 6, w, 6);
        for (let i = 0; i < 60; i++) {
          ctx.fillStyle = "rgba(40,34,24," + r() * 0.2 + ")";
          ctx.beginPath();
          ctx.ellipse(
            r() * w,
            r() * h,
            10 + r() * 40,
            5 + r() * 20,
            0,
            0,
            Math.PI * 2,
          );
          ctx.fill();
        }
      },
      { clamp: true },
    );
  }
  function arch(b) {
    const A = M.arch,
      zc = M.zc,
      W2 = A.open / 2,
      key = "arch_stone";
    const xc = (A.x0 + A.x1) / 2;
    // pylons (north & south of the opening), rusticated base
    for (const [za, zb] of [
      [A.z0, zc - W2],
      [zc + W2, A.z1],
    ]) {
      b.boxMM(key, A.x0, 0, za, A.x1, 14.6, zb, { grime: 0.45, segLen: 3 });
      for (let y = 0; y < 5; y += 0.8)
        b.boxMM(
          "granite_block",
          A.x0 - 0.25,
          y,
          za - 0.25,
          A.x1 + 0.25,
          y + 0.72,
          zb + 0.25,
          { seg: false, grime: 0.55 },
        );
      PF.colMM(A.x0 - 0.25, 0, za - 0.25, A.x1 + 0.25, 21, zb + 0.25, {
        walkable: false,
      });
      // paired engaged columns on both faces
      const pc = (za + zb) / 2;
      for (const xf of [A.x0 - 0.55, A.x1 + 0.55])
        for (const dz of [-2.4, 2.4]) {
          b.box(key, xf, 5, pc + dz, 1.4, 0.6, 1.4, { seg: false, grime: 0.5 });
          b.cyl(key, xf, 5.6, pc + dz, 0.5, 0.56, 7.6, 14, {
            hSeg: 2,
            grime: 0.4,
          });
          b.box(key, xf, 13.2, pc + dz, 1.35, 0.7, 1.35, {
            seg: false,
            grime: 0.4,
          });
        }
      // niche with a carved medallion
      for (const xf of [A.x0 - 0.05, A.x1 + 0.05])
        b.cyl("arch_stone", xf, 10.5, pc, 1.0, 1.0, 0.25, 16, {
          rz: HP,
          hSeg: 1,
        });
    }
    // archivolt: coffered intrados + voussoirs, spandrels above the opening
    const R = W2;
    const sp = new THREE.Shape();
    sp.moveTo(-R, A.spring);
    sp.absarc(0, A.spring, R, PI, 0, true);
    sp.lineTo(R, 14.6);
    sp.lineTo(-R, 14.6);
    sp.closePath();
    const sg = new THREE.ExtrudeGeometry(sp, {
      depth: A.x1 - A.x0,
      bevelEnabled: false,
      curveSegments: 20,
    });
    b.add(key, sg, { m: PF.m4(A.x0, 0, zc, HP), grime: 0.4 });
    for (let k = 0; k <= 14; k++) {
      const a = (k / 14) * PI;
      for (const xf of [A.x0 - 0.12, A.x1 + 0.12])
        b.box(
          key,
          xf,
          A.spring + Math.sin(a) * (R + 0.6) - 0.6,
          zc + Math.cos(a) * (R + 0.6),
          0.5,
          1.2,
          0.8,
          { rx: a - HP, seg: false, grime: 0.4 },
        );
      // coffer ribs across the soffit
      const y = A.spring + Math.sin(a) * (R - 0.1),
        z = zc + Math.cos(a) * (R - 0.1);
      if (k % 2 === 0)
        b.box("granite_block", xc, y - 0.2, z, A.x1 - A.x0 - 0.4, 0.35, 0.35, {
          rx: a - HP,
          seg: false,
          grime: 0.4,
        });
    }
    for (const xf of [A.x0 - 0.3, A.x1 + 0.3])
      b.box(key, xf, A.spring + R - 0.2, zc, 1.0, 2.0, 1.6, {
        seg: false,
        grime: 0.4,
      }); // keystones
    // frieze band + attic + cornices
    b.boxMM(key, A.x0 - 0.8, 14.6, A.z0 - 0.8, A.x1 + 0.8, 15.4, A.z1 + 0.8, {
      seg: false,
      grime: 0.45,
    });
    const fz = PF.texMat("mb_frieze", friezeTex(), { rough: 0.9 });
    for (const [xf, ry] of [
      [A.x0 - 0.02, -HP],
      [A.x1 + 0.02, HP],
    ])
      b.quad(fz, xf, 16.4, zc, A.z1 - A.z0 - 2, 2.0, { ry, grime: 0.3 });
    b.boxMM(key, A.x0, 15.4, A.z0, A.x1, 17.4, A.z1, {
      seg: false,
      grime: 0.45,
    });
    b.boxMM(key, A.x0 - 1.0, 17.4, A.z0 - 1.0, A.x1 + 1.0, 18.1, A.z1 + 1.0, {
      seg: false,
      grime: 0.4,
    });
    b.boxMM(key, A.x0 + 0.4, 18.1, A.z0 + 1.5, A.x1 - 0.4, 20.6, A.z1 - 1.5, {
      seg: false,
      grime: 0.5,
    });
    b.boxMM(key, A.x0 + 0.1, 20.6, A.z0 + 1.2, A.x1 - 0.1, 21.1, A.z1 - 1.2, {
      seg: false,
      grime: 0.4,
    });
    const ins = PF.texMat(
      "mb_inscr",
      PF.signTex("mb_inscr", ["MANHATTAN BRIDGE"], "engraved", 1024, 128, {
        bg: "#c4beb0",
      }),
      { rough: 0.9 },
    );
    b.quad(ins, A.x0 + 0.38, 19.35, zc, 14, 1.3, { ry: -HP, grime: 0.2 });
    b.quad(ins, A.x1 - 0.38, 19.35, zc, 14, 1.3, { ry: HP, grime: 0.2 });
    // allegorical groups on plinths flanking the west face ("Spirit of Commerce" / "Spirit of Industry")
    for (const pz of [A.z0 + 3.5, A.z1 - 3.5]) {
      b.boxMM(
        "granite_block",
        A.x0 - 5.2,
        0,
        pz - 1.8,
        A.x0 - 1.6,
        3.2,
        pz + 1.8,
        { grime: 0.5 },
      );
      PF.colMM(A.x0 - 5.2, 0, pz - 1.8, A.x0 - 1.6, 3.2, pz + 1.8, {});
      const sx = A.x0 - 3.4;
      const rr = PF.rng(pz | 0);
      b.add("bronze_patina", new THREE.CapsuleGeometry(0.75, 2.2, 3, 8), {
        m: PF.m4(sx, 5.0, pz, 0, 0, 0.1),
        grime: 0.4,
      }); // standing figure
      b.sphere("bronze_patina", sx, 6.7, pz, 0.42, { ws: 8, hs: 6 });
      b.add("bronze_patina", new THREE.CapsuleGeometry(0.5, 1.4, 3, 8), {
        m: PF.m4(sx - 0.6, 4.1, pz + (pz < 573 ? 1.0 : -1.0), 0, 0.9, 0.3),
        grime: 0.4,
      }); // seated companion
      b.beam(
        "bronze_patina",
        V3(sx + 0.2, 5.8, pz),
        V3(sx - 0.4, 7.6 + rr(), pz + 0.8),
        0.14,
        0.14,
        {},
      ); // raised arm / torch
      b.box("bronze_patina", sx, 3.2, pz, 2.4, 0.5, 2.2, { seg: false });
    }
  }
  function colonnades(b) {
    const cx = 231,
      cz = M.zc,
      a = 30,
      bb = 13;
    const th0 = Math.asin(5 / a),
      th1 = Math.asin(0.8),
      n = 11;
    for (const sgn of [-1, 1]) {
      const pts = [];
      for (let i = 0; i <= n; i++) {
        const th = th0 + ((th1 - th0) * i) / n;
        pts.push([cx - a * Math.sin(th), cz + sgn * bb * Math.cos(th)]);
      }
      // two rows of Tuscan columns (outer row offset outward) + entablature + balustrade
      const out = (p, q, k) => {
        const dx = q[0] - p[0],
          dz = q[1] - p[1],
          l = Math.hypot(dx, dz);
        return [p[0] + (dz / l) * k * sgn * -1, p[1] - (dx / l) * k * sgn * -1];
      };
      for (let i = 0; i <= n; i++) {
        const p = pts[i],
          q =
            pts[Math.min(n, i + 1)] === p
              ? pts[i - 1]
              : pts[Math.min(n, i + 1)];
        const o = i < n ? out(p, q, 2.4) : out(pts[i - 1], p, 2.4);
        for (const c of [p, o])
          K.column(b, "arch_stone", c[0], 0, c[1], 7.4, 0.42, { flutes: 12 });
      }
      for (let i = 0; i < n; i++) {
        const p = pts[i],
          q = pts[i + 1];
        const o1 = out(p, q, 2.4),
          o2 = out(p, q, 2.4);
        void o2;
        const mx = (p[0] + q[0]) / 2,
          mz = (p[1] + q[1]) / 2,
          len = Math.hypot(q[0] - p[0], q[1] - p[1]) + 0.2,
          ry = Math.atan2(-(q[1] - p[1]), q[0] - p[0]);
        const ox = (o1[0] - p[0]) / 2,
          oz = (o1[1] - p[1]) / 2;
        b.box("arch_stone", mx + ox, 7.4, mz + oz, len, 1.1, 3.6, {
          ry,
          seg: false,
          grime: 0.45,
        }); // entablature (both rows)
        b.box("arch_stone", mx + ox, 8.5, mz + oz, len + 0.1, 0.35, 4.0, {
          ry,
          seg: false,
          grime: 0.4,
        }); // cornice
        b.box("concrete_dark", mx + ox, 7.3, mz + oz, len, 0.1, 3.0, {
          ry,
          seg: false,
          grime: 0.7,
        }); // coffered ceiling
      }
      K.balustrade(
        b,
        "arch_stone",
        pts.map((p, i) =>
          i < n ? out(p, pts[i + 1], 1.2) : out(pts[i - 1], p, 1.2),
        ),
        8.85,
        0.9,
        {},
      );
      // ruin: one broken column and fallen drums at the end of the south arm
      if (sgn > 0) {
        const e = pts[n];
        b.cyl(
          "arch_stone",
          e[0] - 2.4,
          -0.18,
          e[1] + 2.8,
          0.42,
          0.42,
          1.2,
          12,
          { rz: HP, hSeg: 1 },
        );
        b.cyl(
          "arch_stone",
          e[0] - 3.8,
          -0.28,
          e[1] + 1.6,
          0.42,
          0.42,
          1.4,
          12,
          { rz: HP, ry: 0.8, hSeg: 1 },
        );
      }
    }
    // forecourt paving (granite setts), a dry fountain basin and lamp posts
    b.boxMM("granite_block", 198, -0.05, 561, 226, 0.03, 585, {
      grime: 0.8,
      segLen: 6,
    });
    PF.lampPost(b, 212, 0, 563.5, true);
    PF.lampPost(b, 212, 0, 582.5, false);
  }

  // =================================================================
  // Anchorages (twin cable housings + saddle under the roadway)
  // =================================================================
  function anchorage(b, A, west, anchors) {
    const d = M.deck,
      R = M.road;
    for (const [za, zb] of [
      [559.5, R.z0],
      [R.z1, 586.5],
    ]) {
      // rusticated mass, arcaded faces, sloped cable-entry top
      b.boxMM("granite_block", A.x0, 0, za, A.x1, 24, zb, {
        grime: 0.6,
        segLen: 4,
      });
      for (let y = 0; y < 3.2; y += 0.8)
        b.boxMM(
          "pier_stone",
          A.x0 - 0.3,
          y,
          za - 0.3,
          A.x1 + 0.3,
          y + 0.74,
          zb + 0.3,
          { seg: false, grime: 0.6 },
        );
      const slopeUp = west ? 1 : -1;
      const wedge = new THREE.Shape();
      const L = A.x1 - A.x0;
      if (west) {
        wedge.moveTo(0, 0);
        wedge.lineTo(L, 0);
        wedge.lineTo(L, 1.5);
        wedge.lineTo(4, 10);
        wedge.lineTo(0, 10);
        wedge.closePath();
      } else {
        wedge.moveTo(0, 0);
        wedge.lineTo(L, 0);
        wedge.lineTo(L, 10);
        wedge.lineTo(L - 4, 10);
        wedge.lineTo(0, 1.5);
        wedge.closePath();
      }
      void slopeUp;
      const wg = new THREE.ExtrudeGeometry(wedge, {
        depth: zb - za,
        bevelEnabled: false,
      });
      b.add("granite_block", wg, { m: PF.m4(A.x0, 24, za), grime: 0.6 });
      PF.colMM(A.x0 - 0.3, 0, za - 0.3, A.x1 + 0.3, 34, zb + 0.3, {
        walkable: false,
      });
      // big blind arches on the outer face + string course
      const face = za < M.zc ? za - 0.05 : zb + 0.05;
      for (let i = 0; i < 3; i++) {
        const acx = A.x0 + ((i + 0.5) * L) / 3;
        const s = new THREE.Shape();
        const w = L / 3 - 3.2;
        s.moveTo(-w / 2, 0);
        s.lineTo(w / 2, 0);
        s.lineTo(w / 2, 11);
        s.absarc(0, 11, w / 2, 0, PI, false);
        s.lineTo(-w / 2, 0);
        b.add("concrete_dark", PF.shapeGeo(s, 12), {
          m: PF.m4(
            acx,
            3.2,
            face + (za < M.zc ? -0.02 : 0.02),
            za < M.zc ? PI : 0,
          ),
          uv: "box",
          grime: 0.8,
        });
        for (let k = 0; k <= 10; k++) {
          const an = (k / 10) * PI;
          b.box(
            "arch_stone",
            acx + Math.cos(an) * (w / 2 + 0.5),
            3.2 + 11 + Math.sin(an) * (w / 2 + 0.5) - 0.5,
            face,
            0.8,
            1.0,
            0.5,
            { rz: an - HP, seg: false, grime: 0.5 },
          );
        }
      }
      b.boxMM(
        "arch_stone",
        A.x0 - 0.4,
        22.6,
        face - 0.4,
        A.x1 + 0.4,
        23.4,
        face + 0.4,
        { seg: false, grime: 0.5 },
      );
    }
    // saddle block under the roadway (east part of the Manhattan anchorage / west part of Brooklyn's)
    const sx0 = west ? A.saddle0 : A.x0,
      sx1 = west ? A.x1 : A.saddle1;
    b.boxMM("granite_block", sx0, 0, R.z0, sx1, d - 0.6, R.z1, { grime: 0.6 });
    PF.colMM(sx0, 0, R.z0, sx1, d - 0.6, R.z1, {});
    if (west) {
      // service door (south housing, street level) → the anchorage vaults
      const dx = 276,
        dz = 586.85;
      b.boxMM("rust", dx - 1.2, 0, dz, dx + 1.2, 2.8, dz + 0.2, {
        seg: false,
        grime: 0.8,
      });
      b.boxMM("iron", dx - 1.45, 2.8, dz, dx + 1.45, 3.1, dz + 0.3, {
        seg: false,
      });
      const sk = PF.texMat(
        "mb_door",
        PF.signTex(
          "mb_door",
          ["DEPT. OF PLANT & STRUCTURES", "ANCHORAGE — NO ADMITTANCE"],
          "enamel",
          512,
          160,
          { bg: "#2a3a52" },
        ),
        { rough: 0.8 },
      );
      b.quad(sk, dx, 3.6, dz + 0.02, 2.6, 0.8, { grime: 0.4 });
      const gr = PF.texMat(
        "mb_graf",
        PF.graffitiTex(
          "mb_graf",
          ["HUMIES KEEP OUT", "OR COME IN. WE HUNGRY"],
          512,
          256,
          { color: "#9aff40", tag: "skull" },
        ),
        { transparent: true, rough: 1 },
      );
      b.quad(gr, dx + 7, 5.2, dz + 0.03, 7, 3.5, { grime: 0.1 });
      anchors.anchorage_door = PF.anchor(dx, 0, dz + 1.8, PI);
      // deck-level hatch in the south housing's east face (reached from the vault stair inside)
      const hz = 583;
      b.boxMM("rust", A.x1 + 0.02, d, hz - 0.8, A.x1 + 0.2, d + 2.4, hz + 0.8, {
        seg: false,
        grime: 0.7,
      });
      b.boxMM(
        "mb_blue_dk",
        A.x1,
        d + 2.4,
        hz - 1.0,
        A.x1 + 0.35,
        d + 2.7,
        hz + 1.0,
        { seg: false },
      );
      const hs = PF.texMat(
        "mb_hatch",
        PF.signTex(
          "mb_hatch",
          ["ANCHORAGE", "SOUTH CABLE HOUSING"],
          "enamel",
          512,
          160,
          { bg: "#2a3a52" },
        ),
        { rough: 0.8 },
      );
      b.quad(hs, A.x1 + 0.25, d + 3.2, hz, 1.8, 0.56, { ry: HP });
      anchors.deck_hatch = PF.anchor(A.x1 + 1.8, d, hz, -HP);
    }
  }

  // =================================================================
  // Towers — blue steel legs, X-braced, arched crown, globe finials
  // =================================================================
  function tower(b, T) {
    const top = M.tTop;
    for (const lz of M.legs) {
      // tapering built-up leg in five banded stages
      const stages = 6,
        y0 = 12,
        y1 = top - 2;
      for (let i = 0; i < stages; i++) {
        const ya = y0 + ((y1 - y0) * i) / stages,
          yb = y0 + ((y1 - y0) * (i + 1)) / stages,
          k = i / stages;
        const wx = 3.4 - k * 0.8,
          wz = 4.4 - k * 0.8;
        b.box("mb_blue", T, ya, lz, wx, yb - ya, wz, {
          seg: false,
          grime: 0.45,
        });
        b.box("mb_blue_dk", T, yb - 0.5, lz, wx + 0.25, 0.5, wz + 0.25, {
          seg: false,
          grime: 0.5,
        }); // band
        for (const s of [-1, 1])
          b.box("mb_blue_dk", T + (s * wx) / 2, ya, lz, 0.2, yb - ya, 0.6, {
            seg: false,
          }); // vertical ribs
        for (const s of [-1, 1])
          b.box("mb_blue_dk", T, ya, lz + (s * wz) / 2, 0.6, yb - ya, 0.2, {
            seg: false,
          });
      }
      // saddle housing + globe finial
      b.box("mb_blue", T, y1, lz, 3.2, 3.0, 4.4, { seg: false, grime: 0.4 });
      b.box("mb_blue_dk", T, y1 + 3.0, lz, 3.6, 0.5, 4.8, { seg: false });
      b.cyl("mb_blue", T, y1 + 3.5, lz, 0.9, 1.3, 1.6, 12, { hSeg: 1 });
      b.sphere("mb_blue", T, y1 + 6.1, lz, 1.2, { ws: 14, hs: 10 });
      b.cyl("mb_blue_dk", T, y1 + 7.2, lz, 0.05, 0.25, 1.4, 8, { hSeg: 1 });
      PF.col(T, lz, 3.6, 4.6, 12, top, 0, {
        walkable: false,
        surface: "metal",
      });
    }
    // X-bracing between the legs (below the deck and above the traffic portal)
    const zi0 = M.legs[0] + 2.0,
      zi1 = M.legs[1] - 2.0;
    const lv = [12.5, 19, 30, 40, 50, 58];
    for (let i = 0; i < lv.length - 1; i++) {
      if (lv[i] === 19) continue; // keep the roadway portal open
      for (const dx of [-1.2, 1.2]) {
        BK.laced(
          b,
          "mb_blue",
          V3(T + dx, lv[i], zi0),
          V3(T + dx, lv[i + 1], zi1),
          0.8,
          0.6,
          BK.perpUp(V3(T, lv[i], zi0), V3(T, lv[i + 1], zi1), XA),
          { flange: 0.16, laceKey: "mb_blue_dk" },
        );
        BK.laced(
          b,
          "mb_blue",
          V3(T + dx, lv[i], zi1),
          V3(T + dx, lv[i + 1], zi0),
          0.8,
          0.6,
          BK.perpUp(V3(T, lv[i], zi1), V3(T, lv[i + 1], zi0), XA),
          { flange: 0.16, laceKey: "mb_blue_dk" },
        );
      }
    }
    for (const y of [12.5, 30, 40, 50, 58])
      for (const dx of [-1.2, 1.2])
        BK.beamOriented(
          b,
          "mb_blue_dk",
          V3(T + dx, y, zi0),
          V3(T + dx, y, zi1),
          1.0,
          0.7,
          UP,
          0.5,
        );
    // arched crown: two arch ribs (x faces) springing from the legs, cornice across the top
    for (const dx of [-1.3, 1.3]) {
      let prev = null;
      for (let k = 0; k <= 14; k++) {
        const t = k / 14,
          z = zi0 + (zi1 - zi0) * t,
          y = 58 + Math.sin(t * PI) * 8.5;
        const p = V3(T + dx, y, z);
        if (prev)
          BK.beamOriented(
            b,
            "mb_blue",
            prev,
            p,
            1.4,
            0.8,
            UP.clone().cross(ZA).lengthSq() ? BK.perpUp(prev, p, XA) : UP,
            0.45,
          );
        prev = p;
      }
      // spandrel lattice between the arch and the cornice
      for (let k = 1; k < 8; k++) {
        const t = k / 8,
          z = zi0 + (zi1 - zi0) * t,
          y = 58 + Math.sin(t * PI) * 8.5;
        b.beam(
          "mb_blue_dk",
          V3(T + dx, y, z),
          V3(T + dx, top - 2, z),
          0.25,
          0.25,
          {},
        );
      }
    }
    b.boxMM(
      "mb_blue",
      T - 2.0,
      top - 2.6,
      zi0 - 1,
      T + 2.0,
      top - 0.8,
      zi1 + 1,
      { seg: false, grime: 0.4 },
    );
    b.boxMM(
      "mb_blue_dk",
      T - 2.3,
      top - 0.8,
      zi0 - 1.3,
      T + 2.3,
      top - 0.3,
      zi1 + 1.3,
      { seg: false },
    );
    // three small globe finials along the crown
    for (const z of [M.zc - 5, M.zc, M.zc + 5]) {
      b.cyl("mb_blue", T, top - 0.3, z, 0.4, 0.6, 0.8, 10, { hSeg: 1 });
      b.sphere("mb_blue", T, top + 1.0, z, 0.6, { ws: 12, hs: 8 });
    }
    // granite pier
    b.boxMM("pier_stone", T - 7, -6, 558.5, T + 7, 10.6, 587.5, {
      grime: 0.6,
      segLen: 3,
    });
    b.boxMM("granite_block", T - 7.5, 10.6, 558, T + 7.5, 12, 588, {
      seg: false,
      grime: 0.5,
    });
    for (const zz of [558.5, 587.5])
      b.cyl("pier_stone", T, -6, zz, 7, 7, 16.6, 16, {
        thetaStart: zz < 570 ? PI / 2 : -PI / 2,
        thetaLen: PI,
        sz: 0.4,
        hSeg: 2,
        grime: 0.6,
      });
    PF.colMM(T - 7, -6, 558.5, T + 7, 12, 587.5, {});
  }

  // =================================================================
  // Deck, stiffening trusses, subway level, cables & suspenders
  // =================================================================
  function deck(b) {
    const d = M.deck,
      R = M.road;
    // centre roadway: Manhattan saddle → Brooklyn saddle; outer walkways between the housings' faces
    BK.deckSlab(b, M.ancM.saddle0, M.ancB.saddle1, R.z0, R.z1, d, {
      lanes: [M.zc],
    });
    BK.deckSlab(b, M.ancM.x1, M.ancB.x0, M.z0, R.z0, d, {});
    BK.deckSlab(b, M.ancM.x1, M.ancB.x0, R.z1, M.z1, d, {});
    // outer railings + small collars where the tower legs pierce the walkways
    for (const zz of [M.z0 + 0.15, M.z1 - 0.15])
      BK.rail(
        b,
        [
          [M.ancM.x1 + 0.3, zz, d],
          [M.ancB.x0 - 0.3, zz, d],
        ],
        { post: 2.5 },
      );
    // stiffening trusses under each cable (y 13..20) + lower level
    const x0 = M.ancM.x1,
      x1 = M.ancB.x0;
    for (const zt of M.cables) {
      b.boxMM("mb_blue", x0, d - 1.4, zt - 0.35, x1, d - 0.6, zt + 0.35, {
        grime: 0.5,
        segLen: 8,
      });
      b.boxMM("mb_blue", x0, M.lo, zt - 0.35, x1, M.lo + 0.8, zt + 0.35, {
        grime: 0.55,
        segLen: 8,
      });
      for (let x = x0; x < x1 - 0.1; x += 5) {
        b.box(
          "mb_blue_dk",
          x,
          M.lo + 0.8,
          zt,
          0.35,
          d - 1.4 - M.lo - 0.8,
          0.5,
          { seg: false, grime: 0.5 },
        );
        const xa = x,
          xb = Math.min(x1, x + 5),
          up = ((x - x0) / 5) % 2 === 0;
        b.beam(
          "mb_blue_dk",
          V3(xa, up ? M.lo + 0.8 : d - 1.4, zt),
          V3(xb, up ? d - 1.4 : M.lo + 0.8, zt),
          0.3,
          0.3,
          { grime: 0.5 },
        );
      }
    }
    // floor beams, lower level slab, subway tracks (north + south outer bays)
    for (let x = x0; x < x1; x += 5)
      b.boxMM(
        "mb_blue_dk",
        x - 0.3,
        M.lo - 0.4,
        M.z0,
        x + 0.3,
        M.lo + 0.2,
        M.z1,
        { seg: false, grime: 0.6 },
      );
    b.boxMM(
      "concrete_dark",
      x0,
      M.lo + 0.2,
      M.cables[1] + 0.4,
      x1,
      M.lo + 0.45,
      M.cables[2] - 0.4,
      { grime: 0.7, segLen: 8 },
    );
    for (const [za, zb] of [
      [M.cables[0] + 0.4, M.cables[1] - 0.4],
      [M.cables[2] + 0.4, M.cables[3] - 0.4],
    ]) {
      const zc = (za + zb) / 2;
      for (let x = x0; x < x1; x += 0.9)
        b.boxMM(
          "sleeper",
          x,
          M.lo + 0.2,
          za + 0.1,
          x + 0.28,
          M.lo + 0.4,
          zb - 0.1,
          { seg: false, grime: 0.6 },
        );
      for (const dz of [-0.72, 0.72])
        b.boxMM(
          "rail",
          x0,
          M.lo + 0.4,
          zc + dz - 0.05,
          x1,
          M.lo + 0.55,
          zc + dz + 0.05,
          { seg: false, grime: 0.3 },
        );
    }
    // lateral wind bracing under the lower level
    for (let x = x0; x < x1 - 5; x += 10) {
      b.beam(
        "mb_blue_dk",
        V3(x, M.lo - 0.6, M.z0),
        V3(x + 10, M.lo - 0.6, M.z1),
        0.25,
        0.25,
        {},
      );
      b.beam(
        "mb_blue_dk",
        V3(x, M.lo - 0.6, M.z1),
        V3(x + 10, M.lo - 0.6, M.z0),
        0.25,
        0.25,
        {},
      );
    }
  }
  function cables(b) {
    const d = M.deck;
    for (const zc of M.cables) {
      let prev = null;
      for (let x = 272; x <= 480.01; x += 2.5) {
        const p = V3(x, cableY(x), zc);
        if (prev) b.rod("cable", prev, p, 0.42, 8, { grime: 0.3 });
        prev = p;
      }
      // cable bands + suspenders over the deck
      for (let x = M.ancM.x1 + 2; x < M.ancB.x0 - 1; x += 5) {
        const y = cableY(x);
        if (y < d + 1.2) continue;
        if (Math.abs(x - M.t1) < 2.5 || Math.abs(x - M.t2) < 2.5) continue;
        b.cyl("iron", x, y - 0.35, zc, 0.52, 0.52, 0.7, 8, { rz: HP, hSeg: 1 });
        b.beam("cable", V3(x, d - 0.6, zc), V3(x, y - 0.3, zc), 0.12, 0.12, {
          noAO: true,
          grime: 0.2,
        });
        PF.col(x, zc, 0.35, 0.35, d, d + 3, 0, {
          walkable: false,
          surface: "metal",
        });
      }
    }
    // splay castings where the cables dive into the anchorage housings
    for (const zc of M.cables)
      for (const x of [273, 479])
        b.cyl("mb_blue_dk", x, cableY(x) - 1.2, zc, 0.5, 1.4, 2.4, 10, {
          rz: x < 300 ? -0.75 : 0.75,
          hSeg: 1,
        });
  }
  function ramps(b) {
    const RZ = M.ramp,
      w = RZ.z1 - RZ.z0,
      zc = (RZ.z0 + RZ.z1) / 2;
    for (const [x0, x1, yf, dirUp] of [
      [M.rampM.x0, M.rampM.x1, rampYM, 1],
      [M.rampB.x0, M.rampB.x1, rampYB, -1],
    ]) {
      const len = x1 - x0,
        ang = Math.atan2(M.deck, len) * dirUp,
        L = Math.hypot(len, M.deck);
      b.add("asphalt", new THREE.BoxGeometry(L, 0.5, w, 18, 1, 1), {
        m: PF.m4((x0 + x1) / 2, M.deck / 2 - 0.25, zc, 0, 0, ang),
        grime: 0.6,
      });
      // solid masonry approach under the slope (viaduct walls with arches on the faces)
      const sh = new THREE.Shape();
      if (dirUp > 0) {
        sh.moveTo(x0, 0);
        sh.lineTo(x1, 0);
        sh.lineTo(x1, M.deck - 0.5);
        sh.closePath();
      } else {
        sh.moveTo(x0, 0);
        sh.lineTo(x1, 0);
        sh.lineTo(x0, M.deck - 0.5);
        sh.closePath();
      }
      const vg = new THREE.ExtrudeGeometry(sh, {
        depth: w - 0.2,
        bevelEnabled: false,
      });
      b.add("granite_block", vg, { m: PF.m4(0, 0, RZ.z0 + 0.1), grime: 0.6 });
      // arcade reliefs on the viaduct faces
      for (let x = x0 + 6; x < x1 - 4; x += 6) {
        const hTop = yf(x) - 1.2;
        if (hTop < 3) continue;
        for (const zf of [RZ.z0 + 0.05, RZ.z1 - 0.05])
          b.boxMM(
            "concrete_dark",
            x - 1.8,
            0,
            zf - 0.05,
            x + 1.8,
            Math.min(hTop, 8),
            zf + 0.05,
            { seg: false, grime: 0.8 },
          );
      }
      PF.stepPath(
        dirUp > 0 ? x0 : x1,
        zc,
        dirUp > 0 ? HP : -HP,
        w,
        len,
        (t) => t * M.deck,
        { maxRise: 0.25, thick: 0.8, maxLen: 1.2 },
      );
      const pts = (z) => {
        const o = [];
        for (let x = x0; x <= x1 + 0.01; x += 6) o.push([x, z, yf(x)]);
        if (o[o.length - 1][0] < x1) o.push([x1, z, yf(x1)]);
        return o;
      };
      BK.rail(b, pts(RZ.z0 + 0.15), { post: 2.5 });
      BK.rail(b, pts(RZ.z1 - 0.15), { post: 2.5 });
    }
    // through the arch the ramp is flanked by the pylons: the rail colliders there are harmless
  }

  // =================================================================
  // Dressing: wrecks, the dangling subway car, Brute territory markers
  // =================================================================
  function dress(b, anchors) {
    const d = M.deck;
    PF.car(b, 300, d, 571, HP + 0.2, { seed: 21 });
    PF.car(b, 334, d, 575.5, HP - 0.35, { seed: 22, paint: "paint_teal" });
    PF.car(b, 352, d, 569.5, HP + 0.9, { seed: 23, flipped: true });
    PF.car(b, 391, d, 576, HP, { seed: 24, paint: "rust" });
    PF.car(b, 418, d, 570, HP - 0.15, { seed: 25 });
    PF.car(b, 455, d, 575.8, HP + 0.3, { seed: 26, paint: "paint_cream" });
    PF.skeleton(b, 336.5, d + 0.02, 572.6, 1.2);
    // bus wreck across two lanes near midspan
    b.boxMM("paint_orange", 372, d + 0.5, 568.2, 383, d + 3.6, 571, {
      rz: 0.03,
      grime: 0.8,
      seg: false,
    });
    b.boxMM("glass_broken", 372.1, d + 2.0, 568.15, 382.9, d + 3.0, 571.05, {
      seg: false,
    });
    PF.colMM(372, d, 568.2, 383, d + 3.6, 571, { surface: "metal" });
    // the derailed D-train car hanging out of the lower level, over the river
    const car = PF.m4(356, M.lo + 0.2, M.cables[0] - 1.5, 0.18, 0, -0.55);
    const cg = new THREE.BoxGeometry(15, 3.4, 3.0);
    cg.translate(4, 1.7, 0);
    b.add("subway_car", cg, {
      m: car.clone().multiply(new THREE.Matrix4().makeRotationY(0.25)),
      grime: 0.7,
    });
    for (let i = 0; i < 6; i++) {
      const wg = new THREE.PlaneGeometry(1.1, 0.9);
      wg.translate(-1.5 + i * 2.2, 2.2, 1.52);
      b.add("glass_broken", wg, {
        m: car.clone().multiply(new THREE.Matrix4().makeRotationY(0.25)),
        uv: "keep",
        noAO: true,
      });
    }
    const lg = PF.texMat(
      "mb_dtrain",
      PF.signTex("mb_dtrain", ["D"], "enamel", 128, 128, {
        bg: "#e8702a",
        fg: "#ffffff",
      }),
      { rough: 0.8 },
    );
    const lp = new THREE.PlaneGeometry(0.7, 0.7);
    lp.translate(11.45, 2.4, 0);
    lp.rotateY(HP);
    b.add(lg, lp, {
      m: car.clone().multiply(new THREE.Matrix4().makeRotationY(0.25)),
      uv: "keep",
      noAO: true,
    });
    // Brute territory: meat bags on the arch & at the anchorage door, spiked barricade, bonfire
    for (const [x, z] of [
      [227.5, 570],
      [227.5, 576],
      [274, 587.5],
      [279, 587.5],
    ]) {
      b.beam("rust", V3(x, 6.5, z), V3(x, 4.2, z), 0.03, 0.03, {});
      b.sphere("gore", x, 3.6, z, 0.45, { ws: 8, hs: 6, sy: 1.5 });
    }
    PF.scrapWall(b, 266, 590.5, 270, 590.5, 1.8, { seed: 31 });
    PF.barrel(b, 283, 0, 590, { fire: true });
    PF.skeleton(b, 280.5, 0.02, 589.2, 2.4);
    D.rubble(b, 266, 0, 588.5, 1.1, 6, 32);
    const gr2 = PF.texMat(
      "mb_graf2",
      PF.graffitiTex("mb_graf2", ["TOLL = 1 HUMIE"], 512, 192, {
        color: "#d8302a",
      }),
      { transparent: true, rough: 1 },
    );
    b.quad(gr2, M.arch.x0 - 0.06, 3.2, M.zc - 8.5, 5, 1.9, {
      ry: -HP,
      grime: 0.1,
    });
    // lamps along the span (all dead) and the old bridge sign
    for (let x = 300; x < 460; x += 20) {
      BK.lamp(b, x, d, M.z1 - 0.8, PI, false);
      BK.lamp(b, x + 10, d, M.z0 + 0.8, 0, false);
    }
    const hs = PF.texMat(
      "mb_hwy",
      PF.signTex(
        "mb_hwy",
        ["MANHATTAN BRIDGE", "TO BROOKLYN · FLATBUSH AV"],
        "enamel",
        1024,
        320,
        { bg: "#1f5a3c" },
      ),
      { rough: 0.7 },
    );
    BK.gantry(
      b,
      250,
      rampYM(250),
      M.ramp.z0 - 0.3,
      M.ramp.z1 + 0.3,
      5.4,
      hs,
      5.6,
      1.7,
      -HP,
    );
    anchors.plaza = PF.anchor(210, 0, 573, -HP);
    anchors.arch = PF.anchor(222, 0, 573, -HP);
    anchors.deck_mid = PF.anchor(378, d, 573, -HP);
    anchors.brooklyn_foot = PF.anchor(558, 0, 573, HP);
    anchors.guard1 = PF.anchor(273, 0, 590, PI);
    anchors.guard2 = PF.anchor(279.5, 0, 591.5, PI);
  }

  // =================================================================
  // BUILD
  // =================================================================
  PF.buildManhattanExterior = function (root) {
    const b = PF.batch("mb_ext");
    const anchors = {};
    arch(b);
    colonnades(b);
    anchorage(b, M.ancM, true, anchors);
    anchorage(b, M.ancB, false, anchors);
    tower(b, M.t1);
    tower(b, M.t2);
    deck(b);
    cables(b);
    ramps(b);
    dress(b, anchors);
    b.build(root);
    anchors.entrance = anchors.anchorage_door;
    return anchors;
  };
})();
