/* src/poi_bridges/10_queensboro_ext.js */
/* =====================================================================
 * NEW RAD CITY — POI BRIDGES — QUEENSBORO BRIDGE (exterior)
 * Site x 300..820, z -446..-424, deckY 22.
 *  - The 1909 cantilever: two lattice trusses (zN / zS planes) whose eyebar
 *    top chords sweep up to the four pinnacled steel towers standing on
 *    rock-faced granite piers — A (Manhattan shore, x 346), B & C on
 *    Roosevelt Island (x 388, 428), D alone in the East River (x 622).
 *  - The span past the island is gone: C's cantilever arm ends in twisted
 *    steel at x 490, the suspended span lies in the river, and tower D
 *    stands orphaned with its two broken arms.
 *  - Walkable upper deck (y 22) from the Manhattan abutment (x 300) to the
 *    broken end, reached by a 17° ramp along the north side (step colliders
 *    ≤ 0.25 m); a switch-back stair tower drops to Roosevelt Island (the old
 *    "elevator building").
 *  - THE BRIDGEMARKET: the masonry approach beneath the deck (x 300..341)
 *    with four great arched windows on 59th Street, glazed, and behind them
 *    the lamp-lit Guastavino tile vaults of the settlement market.
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
  const ZA = V3(0, 0, 1),
    UP = V3(0, 1, 0),
    XA = V3(1, 0, 0);

  const Q = (PF.QB = {
    x0: 300,
    brk: 490,
    zN: -440,
    zS: -430,
    zc: -435,
    deck: 22,
    lo: 16,
    towers: [346, 388, 428, 622],
    top: 64,
    low: 32,
    L: 26,
    mk: { x0: 300, x1: 341, z0: -441.2, z1: -424, top: 16 },
    ramp: { x0: 300, x1: 372, z0: -445.8, z1: -441.8 },
    stair: { xA: 400, xB: 406.5, lanes: [-427.9, -425.5], w: 2.2, ld: 1.8 },
    bays: [306.75, 316.25, 325.75, 335.25],
    arch: { w: 6.4, spring: 8 },
    doorBay: 1,
    kiosk: { x0: 314, x1: 319, z0: -439, z1: -434.5 },
  });

  /** Top-chord height of the cantilever trusses at x (peaks at the towers, tapering anchor arm at the west end). */
  function topRaw(x) {
    let y = Q.low;
    for (const T of Q.towers) {
      const t = Math.min(1, Math.abs(x - T) / Q.L);
      y = Math.max(y, Q.low + (Q.top - Q.low) * Math.pow(1 - t, 1.6));
    }
    return y;
  }
  const y330 = topRaw(330);
  function topY(x) {
    let y = topRaw(x);
    if (x < 330) y = Math.min(y, 24 + ((x - 312) / 18) * (y330 - 24));
    return y;
  }
  Q.topY = topY;
  /** Panel points between key stations (≈5 m panels, every station included). */
  function panels(keys) {
    const out = [keys[0]];
    for (let i = 0; i < keys.length - 1; i++) {
      const a = keys[i],
        c = keys[i + 1],
        n = Math.max(1, Math.round((c - a) / 5.2));
      for (let k = 1; k <= n; k++) out.push(a + ((c - a) * k) / n);
    }
    return out;
  }
  const nearestTower = (x) => {
    let best = Q.towers[0];
    for (const T of Q.towers)
      if (Math.abs(T - x) < Math.abs(best - x)) best = T;
    return best;
  };

  // =================================================================
  // Truss plane
  // =================================================================
  function trussPlane(b, z0, xs, opts) {
    opts = opts || {};
    const lo = Q.lo;
    const P = (x, y) => V3(x, y, z0);
    for (let i = 0; i < xs.length; i++) {
      const x = xs[i],
        ty = topY(x);
      const isTower = Q.towers.some((T) => Math.abs(T - x) < 0.01);
      // posts (tower posts are built separately)
      if (!isTower)
        BK.laced(b, "qb_steel", P(x, lo), P(x, ty), 0.95, 0.85, XA, {
          flange: 0.2,
          laceKey: "qb_steel_dk",
        });
      // pins on the top chord
      b.cyl("qb_steel_dk", x, ty - 0.8, z0, 0.3, 0.3, 1.6, 8, {
        hSeg: 1,
        rx: HP,
        grime: 0.4,
      });
      if (i === xs.length - 1) break;
      const xn = xs[i + 1],
        tn = topY(xn);
      // bottom chord (box girder) and eyebar top chord
      BK.beamOriented(b, "qb_steel", P(x, lo), P(xn, lo), 1.4, 1.2, UP, 0.55);
      BK.eyebars(b, "qb_steel", P(x, ty), P(xn, tn), 4, 1.15, 0.13, 0.3, ZA);
      // main diagonal: from the top of the tower-side post down to the foot of the far post
      const towerLeft =
        Math.abs(nearestTower((x + xn) / 2) - x) <
        Math.abs(nearestTower((x + xn) / 2) - xn);
      const a = towerLeft ? P(x, ty - 0.5) : P(xn, tn - 0.5),
        c = towerLeft ? P(xn, lo + 0.5) : P(x, lo + 0.5);
      BK.laced(b, "qb_steel", a, c, 0.75, 0.7, BK.perpUp(a, c, ZA), {
        flange: 0.16,
        laceKey: "qb_steel_dk",
      });
      // secondary strut: from the far post's top to the diagonal's midpoint (sub-paneling)
      const m = a.clone().lerp(c, 0.5);
      const f = towerLeft ? P(xn, tn - 0.5) : P(x, ty - 0.5);
      b.beam("qb_steel_dk", f, m, 0.35, 0.35, { grime: 0.5 });
      const g = towerLeft ? P(x, lo + 0.5) : P(xn, lo + 0.5);
      b.beam("qb_steel_dk", g, m, 0.3, 0.3, { grime: 0.5 });
      // deck-level colliders: the diagonal where it crosses the walking band (22..24.5)
      if (opts.collide && x >= 300 && xn <= Q.brk + 0.1) {
        for (const yy of [22.4, 23.6]) {
          const tt = (yy - c.y) / (a.y - c.y);
          if (tt < 0 || tt > 1) continue;
          const px = c.x + (a.x - c.x) * tt;
          PF.col(px, z0, 0.9, 0.9, yy - 0.6, yy + 0.6, 0, {
            walkable: false,
            surface: "metal",
          });
        }
      }
    }
    if (opts.collide)
      for (const x of xs) {
        if (x < 300 || x > Q.brk) continue;
        if (Q.towers.some((T) => Math.abs(T - x) < 0.01)) continue;
        if (topY(x) < Q.deck + 0.5) continue;
        PF.col(x, z0, 1.0, 0.95, Q.deck - 0.3, Q.deck + 3.5, 0, {
          walkable: false,
          surface: "metal",
        });
      }
  }

  // =================================================================
  // Towers (steel above the piers) with the famous pinnacle finials
  // =================================================================
  function tower(b, T, opts) {
    opts = opts || {};
    const y0 = Q.lo,
      y1 = Q.top + 2;
    for (const z0 of [Q.zN, Q.zS]) {
      for (const dx of [-1.6, 1.6]) {
        BK.laced(
          b,
          "qb_steel",
          V3(T + dx, y0, z0),
          V3(T + dx, y1, z0),
          1.4,
          1.6,
          XA,
          { flange: 0.28, laceKey: "qb_steel_dk", lace: 1.1 },
        );
        // finial: base, lantern, spire, ball
        b.box("qb_steel", T + dx, y1, z0, 2.0, 0.9, 2.0, {
          seg: false,
          grime: 0.4,
        });
        b.cyl("qb_steel", T + dx, y1 + 0.9, z0, 0.62, 0.75, 1.2, 8, {
          hSeg: 1,
          grime: 0.4,
        });
        b.cyl("qb_steel_dk", T + dx, y1 + 2.1, z0, 0.8, 0.6, 0.25, 8, {
          hSeg: 1,
        });
        b.cyl("qb_steel", T + dx, y1 + 2.35, z0, 0.04, 0.55, 4.6, 8, {
          hSeg: 2,
          grime: 0.3,
        });
        b.sphere("qb_steel_dk", T + dx, y1 + 6.9, z0, 0.2, { ws: 8, hs: 6 });
        for (const [sx, sz] of [
          [-1, -1],
          [1, -1],
          [-1, 1],
          [1, 1],
        ])
          b.cyl(
            "qb_steel",
            T + dx + sx * 0.8,
            y1 + 0.9,
            z0 + sz * 0.8,
            0.02,
            0.14,
            1.6,
            4,
            { hSeg: 1 },
          );
        if (opts.collide)
          PF.col(T + dx, z0, 1.5, 1.7, y0, y1, 0, {
            walkable: false,
            surface: "metal",
          });
      }
      // battens + X bracing between the twin columns of the post
      for (let y = y0 + 3; y < y1 - 1; y += 6) {
        BK.beamOriented(
          b,
          "qb_steel_dk",
          V3(T - 1.0, y, z0),
          V3(T + 1.0, y, z0),
          0.5,
          1.2,
          UP,
          0.5,
        );
        b.beam(
          "qb_steel_dk",
          V3(T - 1.0, y, z0),
          V3(T + 1.0, Math.min(y + 6, y1 - 1), z0),
          0.2,
          0.2,
          {},
        );
        b.beam(
          "qb_steel_dk",
          V3(T + 1.0, y, z0),
          V3(T - 1.0, Math.min(y + 6, y1 - 1), z0),
          0.2,
          0.2,
          {},
        );
      }
      BK.beamOriented(
        b,
        "qb_steel",
        V3(T - 2.6, y1 - 0.6, z0),
        V3(T + 2.6, y1 - 0.6, z0),
        1.3,
        1.9,
        UP,
        0.5,
      );
    }
    // portal bracing between the two trusses (clear of the deck)
    const lv = [31, 41, 51, 60, 65];
    for (const dx of [-1.6, 1.6]) {
      for (const y of lv)
        BK.laced(
          b,
          "qb_steel",
          V3(T + dx, y, Q.zN + 0.8),
          V3(T + dx, y, Q.zS - 0.8),
          1.0,
          0.8,
          UP,
          { flange: 0.18, laceKey: "qb_steel_dk" },
        );
      for (let i = 0; i < lv.length - 1; i++) {
        b.beam(
          "qb_steel_dk",
          V3(T + dx, lv[i], Q.zN + 0.8),
          V3(T + dx, lv[i + 1], Q.zS - 0.8),
          0.28,
          0.28,
          {},
        );
        b.beam(
          "qb_steel_dk",
          V3(T + dx, lv[i], Q.zS - 0.8),
          V3(T + dx, lv[i + 1], Q.zN + 0.8),
          0.28,
          0.28,
          {},
        );
      }
      // knee braces into the deck-level portal (the "gateway" silhouette seen from the roadway)
      b.beam(
        "qb_steel",
        V3(T + dx, 26.5, Q.zN + 0.8),
        V3(T + dx, 31, Q.zN + 4.5),
        0.5,
        0.5,
        {},
      );
      b.beam(
        "qb_steel",
        V3(T + dx, 26.5, Q.zS - 0.8),
        V3(T + dx, 31, Q.zS - 4.5),
        0.5,
        0.5,
        {},
      );
    }
  }

  // =================================================================
  // Granite piers
  // =================================================================
  function pier(b, T, yBase, opts) {
    opts = opts || {};
    const x0 = T - 4.5,
      x1 = T + 4.5,
      z0 = -441.8,
      z1 = -428.2,
      top = Q.lo;
    const batter = 0.9;
    // battered shaft in 3 courses
    const courses = [
      [yBase, 2.2, batter],
      [2.2, top - 1.4, batter * 0.4],
      [top - 1.4, top, 0],
    ];
    for (const [ya, yb, bt] of courses)
      b.boxMM("pier_stone", x0 - bt, ya, z0 - bt, x1 + bt, yb, z1 + bt, {
        grime: 0.6,
        segLen: 3,
      });
    // pointed cutwater (south, downstream) and rounded north nose
    const cw = new THREE.Shape();
    cw.moveTo(-4.5 - batter, 0);
    cw.lineTo(4.5 + batter, 0);
    cw.lineTo(0, 3.8);
    cw.closePath();
    const g = new THREE.ExtrudeGeometry(cw, {
      depth: 11.2 - yBase,
      bevelEnabled: false,
    });
    g.rotateX(-HP);
    g.rotateY(PI);
    b.add("pier_stone", g, { m: PF.m4(T, yBase, z1 + batter), grime: 0.55 });
    if (opts.northNose)
      b.cyl(
        "pier_stone",
        T,
        yBase,
        z0 - batter,
        4.5 + batter,
        4.5 + batter,
        10.2 - yBase,
        16,
        { thetaStart: HP, thetaLen: PI, hSeg: 2, sz: 0.5, grime: 0.55 },
      );
    // cornice + cap plate + bearing shoes
    b.boxMM(
      "granite_block",
      x0 - 0.5,
      top - 1.4,
      z0 - 0.5,
      x1 + 0.5,
      top - 0.9,
      z1 + 0.5,
      { grime: 0.5, seg: false },
    );
    b.boxMM(
      "granite_block",
      x0 - 0.2,
      top - 0.3,
      z0 - 0.2,
      x1 + 0.2,
      top,
      z1 + 0.2,
      { grime: 0.5, seg: false },
    );
    for (const zz of [Q.zN, Q.zS])
      for (const dx of [-1.6, 1.6])
        b.box("qb_steel_dk", T + dx, top - 0.05, zz, 2.2, 0.6, 2.4, {
          seg: false,
        });
    // blind arch panels on the long faces
    for (const zz of [z0 - batter * 0.4 - 0.05, z1 + batter * 0.4 + 0.05]) {
      b.boxMM("granite_block", T - 2.2, 4, zz - 0.15, T + 2.2, 9.5, zz + 0.15, {
        grime: 0.6,
        seg: false,
      });
    }
    PF.colMM(x0 - batter, yBase, z0 - batter, x1 + batter, top, z1 + batter, {
      surface: "concrete",
    });
    if (opts.cutwaterCol)
      PF.colMM(T - 3, yBase, z1, T + 3, 10, z1 + 3.2, { walkable: false });
  }

  // =================================================================
  // Bridgemarket masonry approach (exterior shell + lit "peek" bays)
  // =================================================================
  function archShape(w, spring, segs) {
    const s = new THREE.Shape();
    s.moveTo(-w / 2, 0);
    s.lineTo(w / 2, 0);
    s.lineTo(w / 2, spring);
    s.absarc(0, spring, w / 2, 0, PI, false);
    s.lineTo(-w / 2, 0);
    void segs;
    return s;
  }
  function archPath(w, spring, cx) {
    const p = new THREE.Path();
    p.moveTo(cx - w / 2, 0.001);
    p.lineTo(cx + w / 2, 0.001);
    p.lineTo(cx + w / 2, spring);
    p.absarc(cx, spring, w / 2, 0, PI, false);
    p.lineTo(cx - w / 2, 0.001);
    return p;
  }
  function market(b, bLit, bGlass, anchors) {
    const M = Q.mk,
      A = Q.arch;
    const zf = M.z1 - 0.7; // facade wall back face
    // core mass behind the peek bays
    b.boxMM("granite_block", M.x0, 0, M.z0, M.x1, M.top - 1.2, M.z1 - 3.2, {
      grime: 0.55,
      segLen: 4,
    });
    PF.colMM(M.x0, 0, M.z0, M.x1, M.top - 0.8, M.z1, { surface: "concrete" });
    // south facade: solid piers between the openings + arched spandrels above each opening
    const edges = [M.x0]
      .concat(...Q.bays.map((cx) => [cx - A.w / 2, cx + A.w / 2]))
      .concat([M.x1]);
    for (let i = 0; i < edges.length; i += 2)
      b.boxMM(
        "granite_block",
        edges[i],
        0,
        zf,
        edges[i + 1],
        M.top - 1.2,
        zf + 0.7,
        { grime: 0.55, segLen: 4 },
      );
    for (const cx of Q.bays) {
      const sp = new THREE.Shape(),
        R = A.w / 2;
      sp.moveTo(-R, A.spring);
      sp.absarc(0, A.spring, R, PI, 0, true);
      sp.lineTo(R, M.top - 1.2);
      sp.lineTo(-R, M.top - 1.2);
      sp.closePath();
      const sg = new THREE.ExtrudeGeometry(sp, {
        depth: 0.7,
        bevelEnabled: false,
        curveSegments: 16,
      });
      b.add("granite_block", sg, { m: PF.m4(cx, 0, zf), grime: 0.55 });
    }
    // rusticated base course & pilasters between the bays
    const piers = [
      M.x0,
      Q.bays[0] - A.w / 2,
      Q.bays[0] + A.w / 2,
      Q.bays[1] - A.w / 2,
      Q.bays[1] + A.w / 2,
      Q.bays[2] - A.w / 2,
      Q.bays[2] + A.w / 2,
      Q.bays[3] - A.w / 2,
      Q.bays[3] + A.w / 2,
      M.x1,
    ];
    for (let i = 0; i < piers.length; i += 2) {
      const a = piers[i],
        c = piers[i + 1],
        cx = (a + c) / 2,
        w = c - a;
      for (let y = 0; y < 2.6; y += 0.65)
        b.box("pier_stone", cx, y, M.z1 + 0.18, w + 0.1, 0.6, 0.45, {
          seg: false,
          grime: 0.6,
        });
      b.box(
        "granite_block",
        cx,
        2.6,
        M.z1 + 0.15,
        Math.max(1.4, w - 0.9),
        10.6,
        0.4,
        { seg: false, grime: 0.5 },
      );
      b.box(
        "granite_block",
        cx,
        13.1,
        M.z1 + 0.2,
        Math.max(1.8, w - 0.5),
        0.6,
        0.55,
        { seg: false, grime: 0.45 },
      ); // capital
    }
    // voussoirs + keystones around each arch
    for (const cx of Q.bays) {
      const R = A.w / 2,
        n = 13;
      for (let k = 0; k <= n; k++) {
        const a = (k / n) * PI,
          rr = R + 0.55;
        const px = cx + Math.cos(a) * rr,
          py = A.spring + Math.sin(a) * rr;
        const key = k === Math.round(n / 2);
        b.box(
          "arch_stone",
          px,
          py - (key ? 0.75 : 0.55),
          M.z1 + 0.12,
          key ? 1.0 : 0.62,
          key ? 1.5 : 1.1,
          key ? 0.6 : 0.4,
          { rz: a - HP, seg: false, grime: 0.45 },
        );
      }
      // impost blocks
      for (const sg of [-1, 1])
        b.box(
          "arch_stone",
          cx + sg * (R + 0.35),
          A.spring - 0.45,
          M.z1 + 0.1,
          1.1,
          0.45,
          0.5,
          { seg: false, grime: 0.45 },
        );
      // round medallion in the spandrel
      b.cyl(
        "arch_stone",
        cx + R + 1.55,
        12.35,
        M.z1 + 0.05,
        0.5,
        0.5,
        0.3,
        12,
        { rx: HP, hSeg: 1 },
      );
    }
    // cornice, dentils, balustraded parapet
    b.boxMM(
      "arch_stone",
      M.x0 - 0.3,
      13.7,
      M.z1 - 0.2,
      M.x1 + 0.3,
      14.3,
      M.z1 + 0.85,
      { grime: 0.5, seg: false },
    );
    for (let x = M.x0; x < M.x1; x += 0.7)
      b.box("arch_stone", x + 0.2, 13.45, M.z1 + 0.55, 0.3, 0.25, 0.3, {
        seg: false,
        grime: 0.4,
      });
    K.balustrade(
      b,
      "arch_stone",
      [
        [M.x0, M.z1 + 0.2],
        [M.x1, M.z1 + 0.2],
      ],
      14.3,
      1.05,
      {},
    );
    b.boxMM("granite_block", M.x0, 14.3, M.z0, M.x1, 15.2, M.z1 - 0.6, {
      grime: 0.6,
      seg: false,
    }); // roof deck under the bridge
    // engraved dedication stone
    const inscr = PF.texMat(
      "qb_inscr",
      PF.signTex(
        "qb_inscr",
        ["QUEENSBORO BRIDGE · MDCCCCIX"],
        "engraved",
        1024,
        96,
        { bg: "#b8b2a2" },
      ),
      { rough: 0.9 },
    );
    b.quad(inscr, (M.x0 + M.x1) / 2, 13.95, M.z1 + 0.87, 22, 0.5, {
      grime: 0.2,
    });

    // ---- the peek bays behind the arches: floor, tile back wall, Guastavino barrel vault, stalls (lit) ----
    const pz0 = M.z1 - 3.2,
      pz1 = zf;
    bLit.setLights(
      Q.bays
        .map((cx) => ({
          x: cx,
          y: 7.5,
          z: pz0 + 1.6,
          color: 0xffc070,
          r: 9,
          i: 1.1,
        }))
        .concat(
          Q.bays.map((cx) => ({
            x: cx,
            y: 1.8,
            z: pz0 + 1.2,
            color: 0xff9a40,
            r: 4,
            i: 0.8,
          })),
        ),
      0x2a2018,
      0.9,
    );
    bLit.boxMM("quarry", M.x0 + 0.5, 0, pz0, M.x1 - 0.5, 0.05, pz1, {
      grime: 0.5,
    });
    bLit.boxMM("guastavino", M.x0 + 0.5, 0, pz0 - 0.2, M.x1 - 0.5, 13.6, pz0, {
      grime: 0.35,
    });
    // barrel vault (half-cylinder along x) in tile
    const vg = new THREE.CylinderGeometry(
      1.7,
      1.7,
      M.x1 - M.x0 - 1,
      16,
      1,
      true,
      0,
      PI,
    );
    vg.rotateZ(HP);
    bLit.add("guastavino", vg, {
      m: PF.m4((M.x0 + M.x1) / 2, 11.6, pz0 + 1.6, 0, 0, 0, 1, 1.25, 1),
      grime: 0.3,
    });
    for (const cx of Q.bays) {
      // cross arches (ribs) at the bay divisions, stalls, crates, a hanging lamp
      D.stall(bLit, cx - 1.2, pz0 + 1.4, 0, 3.2, 1.8, {
        seed: cx | 0,
        goods: ["cans", "bottles", "junk", "meds"][Q.bays.indexOf(cx)],
        y: 0,
      });
      D.crates(bLit, cx + 2.2, 0, pz0 + 0.6, 2, cx | 0, false);
      bLit.cyl("iron", cx, 9.4, pz0 + 1.6, 0.01, 0.01, 3.4, 4, { hSeg: 1 });
      bLit.sphere("lamp_warm", cx, 9.3, pz0 + 1.6, 0.25, {
        ws: 8,
        hs: 6,
        noAO: true,
      });
      PF.glow(V3(cx, 9.3, pz0 + 1.6), 0xffc070, 2.2, null, {
        intensity: 1.0,
        dayFactor: 0.3,
      });
    }
    D.stringLights(
      bLit,
      V3(M.x0 + 1, 10.6, pz0 + 2.6),
      V3(M.x1 - 1, 10.6, pz0 + 2.6),
      1.2,
      30,
      0xffd090,
    );

    // ---- glazing: transparent arch panes with iron mullions; boarded lower lights; door bay storefront ----
    Q.bays.forEach((cx, i) => {
      const door = i === Q.doorBay;
      const gz = M.z1 - 0.35;
      const g = PF.shapeGeo(archShape(A.w - 0.1, A.spring), 16);
      bGlass.add("glass_tr", g, {
        m: PF.m4(cx, door ? 0 : 0, gz),
        uv: "keep",
        noAO: true,
        grime: 0,
      });
      // mullions
      for (let k = 1; k < 6; k++) {
        const mx = cx - A.w / 2 + (k * A.w) / 6;
        const yTop =
          A.spring +
          Math.sqrt(Math.max(0, (A.w / 2) ** 2 - (mx - cx) ** 2)) -
          0.05;
        b.box(
          "iron",
          mx,
          door ? 4 : 0,
          gz + 0.05,
          0.1,
          yTop - (door ? 4 : 0),
          0.12,
          { seg: false, grime: 0.3 },
        );
      }
      for (let y = door ? 5.2 : 1.4; y < A.spring + 2.5; y += 1.4) {
        const half =
          y <= A.spring
            ? A.w / 2
            : Math.sqrt(Math.max(0, (A.w / 2) ** 2 - (y - A.spring) ** 2));
        if (half > 0.3)
          b.box("iron", cx, y, gz + 0.05, half * 2 - 0.05, 0.1, 0.12, {
            seg: false,
          });
      }
      if (door) {
        // storefront: steel frame, double doors, transom sign
        b.boxMM("steel", cx - A.w / 2, 0, gz - 0.1, cx - 1.6, 4, gz + 0.25, {
          grime: 0.6,
          seg: false,
        });
        b.boxMM("steel", cx + 1.6, 0, gz - 0.1, cx + A.w / 2, 4, gz + 0.25, {
          grime: 0.6,
          seg: false,
        });
        b.boxMM(
          "steel",
          cx - A.w / 2,
          3.6,
          gz - 0.1,
          cx + A.w / 2,
          4.1,
          gz + 0.3,
          { grime: 0.6, seg: false },
        );
        for (const sg of [-1, 1]) {
          b.boxMM(
            "paint_teal",
            cx + (sg < 0 ? -1.55 : 0.03),
            0,
            gz + 0.02,
            cx + (sg < 0 ? -0.03 : 1.55),
            3.55,
            gz + 0.12,
            { grime: 0.7, seg: false },
          );
          b.quad("glass_broken", cx + sg * 0.8, 2.5, gz + 0.14, 0.9, 1.0, {
            noAO: true,
          });
          b.box("chrome", cx + sg * 0.2, 1.3, gz + 0.2, 0.06, 0.6, 0.06, {
            seg: false,
          });
        }
        const sk = PF.texMat(
          "qb_market_neon",
          PF.signTex("qb_market_neon", ["BRIDGEMARKET"], "neon", 1024, 192, {
            fg: "#ffb040",
          }),
          { emissive: 1.6, rough: 0.6, noShadow: true },
        );
        b.boxMM("iron", cx - 3.3, 4.2, gz + 0.2, cx + 3.3, 5.5, gz + 0.45, {
          seg: false,
        });
        b.quad(sk, cx, 4.85, gz + 0.47, 6.4, 1.2, { noAO: true });
        PF.glow(V3(cx, 4.85, gz + 0.9), 0xffa040, 4.5, null, {
          intensity: 1.2,
          dayFactor: 0.25,
          flicker: 0.05,
        });
        anchors.market_door = PF.anchor(cx, 0, M.z1 + 2.2, PI);
        // steps / threshold
        b.boxMM(
          "granite_block",
          cx - 2.2,
          0,
          M.z1,
          cx + 2.2,
          0.15,
          M.z1 + 1.2,
          { seg: false },
        );
      } else {
        // lower lights boarded with scrap; sandbags outside
        b.boxMM(
          "planks",
          cx - A.w / 2 + 0.1,
          0,
          gz + 0.15,
          cx + A.w / 2 - 0.1,
          2.6,
          gz + 0.25,
          { grime: 0.8, seg: false },
        );
        for (let k = 0; k < 4; k++)
          b.box(
            k % 2 ? "corrugated" : "rust",
            cx - 2.2 + k * 1.45,
            0.3,
            gz + 0.3,
            1.3,
            1.6 + (k % 3) * 0.3,
            0.06,
            { rz: (k - 1.5) * 0.05, seg: false, grime: 0.7 },
          );
        PF.sandbags(b, cx - 2.8, M.z1 + 0.9, cx + 2.8, M.z1 + 0.9, 3, {
          noCollide: false,
        });
      }
    });
    // west face: blind arch + mural
    b.boxMM("granite_block", M.x0 - 0.3, 0, M.z0 + 2, M.x0, 2.4, M.z1 - 1, {
      grime: 0.6,
      seg: false,
    });
    const wg = PF.texMat(
      "qb_west_mural",
      PF.signTex(
        "qb_west_mural",
        ["BRIDGEMARKET", "TRADE · WATER · DOCTOR", "ENTRANCE ON 59TH →"],
        "raider",
        1024,
        512,
        { bg: "#5a5448", fg: "#e8d8a0" },
      ),
      { rough: 0.9 },
    );
    b.quad(wg, M.x0 - 0.33, 6.8, (M.z0 + M.z1) / 2, 11, 5.4, {
      ry: -HP,
      grime: 0.3,
    });
    // deck abutment above the market's west end
    b.boxMM(
      "granite_block",
      M.x0,
      M.top - 1.2,
      -440.5,
      M.x0 + 4,
      Q.deck - 0.6,
      -424.2,
      { grime: 0.6 },
    );
    PF.colMM(M.x0, M.top - 1.2, -440.5, M.x0 + 4, Q.deck - 0.6, -424.2, {});
  }

  // =================================================================
  // Deck, ramp, stair tower, railings
  // =================================================================
  function deck(b) {
    const d = Q.deck;
    BK.deckSlab(b, Q.x0, Q.brk, -440.5, -429.5, d, { lanes: [-435] });
    BK.deckSlab(b, Q.ramp.x1, Q.brk, -445.8, -440.5, d, {
      fascia: "concrete_dark",
    });
    BK.deckSlab(b, Q.x0, Q.stair.xA - Q.stair.ld, -429.5, -424.2, d, {});
    BK.deckSlab(b, Q.stair.xB + Q.stair.ld, Q.brk, -429.5, -424.2, d, {});
    // lower (subway/roadway) level between the trusses — visual only
    b.boxMM(
      "concrete_dark",
      312,
      Q.lo + 0.3,
      -439.6,
      Q.brk,
      Q.lo + 0.6,
      -430.4,
      { grime: 0.7, segLen: 8 },
    );
    // floor beams at every panel point (lower + upper)
    for (const x of panels([312, 346, 388, 428, Q.brk])) {
      b.boxMM(
        "qb_steel_dk",
        x - 0.35,
        Q.lo - 0.7,
        -446,
        x + 0.35,
        Q.lo + 0.3,
        -424,
        { grime: 0.6, seg: false },
      );
      b.boxMM(
        "qb_steel_dk",
        x - 0.3,
        d - 1.4,
        x < Q.ramp.x1 ? -440.5 : -445.8,
        x + 0.3,
        d - 0.6,
        -424.2,
        { grime: 0.6, seg: false },
      );
      // hangers between the levels at the outer lanes
      for (const zz of [-445.4, -424.6])
        if (!(zz < -441 && x < Q.ramp.x1))
          b.box(
            "qb_steel_dk",
            x,
            Q.lo + 0.3,
            zz,
            0.25,
            d - 1.4 - Q.lo - 0.3,
            0.25,
            { seg: false },
          );
    }
    // railings: lattice parapets on the outer edges
    BK.rail(
      b,
      [
        [Q.x0 + 0.2, -424.35, d],
        [Q.stair.xA - Q.stair.ld, -424.35, d],
      ],
      { lattice: true, post: 3 },
    );
    BK.rail(
      b,
      [
        [Q.stair.xB + Q.stair.ld, -424.35, d],
        [Q.brk - 1.5, -424.35, d],
      ],
      { lattice: true, post: 3 },
    );
    BK.rail(
      b,
      [
        [Q.ramp.x1 - 0.5, -445.65, d],
        [Q.brk - 1.5, -445.65, d],
      ],
      { lattice: true, post: 3 },
    );
    BK.rail(
      b,
      [
        [Q.x0 + 0.2, -440.35, d],
        [Q.ramp.x1 - 3, -440.35, d],
      ],
      { lattice: true, post: 3 },
    );
    // west parapet at the abutment (the old approach beyond is gone)
    b.boxMM("granite_block", Q.x0, d, -440.5, Q.x0 + 0.6, d + 1.1, -424.2, {
      grime: 0.6,
      seg: false,
    });
    PF.colMM(Q.x0, d - 0.5, -440.5, Q.x0 + 0.6, d + 1.1, -424.2, {
      walkable: false,
    });
    // stairwell guard at the top of the island stair (lane 0 is open air above flight 2)
    const st = Q.stair;
    b.beam(
      "iron",
      V3(st.xA + 0.05, d + 1.05, st.lanes[0] - st.w / 2),
      V3(st.xA + 0.05, d + 1.05, st.lanes[0] + st.w / 2),
      0.07,
      0.07,
      {},
    );
    PF.colMM(
      st.xA - 0.05,
      d - 0.2,
      st.lanes[0] - st.w / 2 - 0.1,
      st.xA + 0.15,
      d + 1.1,
      st.lanes[0] + st.w / 2,
      { walkable: false, surface: "metal" },
    );
    // stairwell side railings on the deck edge of the gap
    BK.rail(
      b,
      [
        [st.xA, -429.45, d],
        [st.xB + st.ld, -429.45, d],
      ],
      { post: 2 },
    );
  }
  function ramp(b) {
    const R = Q.ramp,
      len = R.x1 - R.x0,
      rise = Q.deck,
      w = R.z1 - R.z0,
      zc = (R.z0 + R.z1) / 2;
    const ang = Math.atan2(rise, len),
      L = Math.hypot(len, rise);
    const slab = new THREE.BoxGeometry(L, 0.5, w, 16, 1, 1);
    b.add("asphalt", slab, {
      m: PF.m4(
        (R.x0 + R.x1) / 2,
        rise / 2 - 0.25 * Math.cos(ang),
        zc,
        0,
        0,
        ang,
      ),
      grime: 0.6,
    });
    for (const zz of [R.z0 + 0.1, R.z1 - 0.1])
      b.add("concrete_dark", new THREE.BoxGeometry(L, 0.9, 0.3, 16, 1, 1), {
        m: PF.m4((R.x0 + R.x1) / 2, rise / 2 - 0.6, zz, 0, 0, ang),
        grime: 0.7,
      });
    // step colliders (≤ 0.25 m) under the sloped surface
    PF.stepPath(R.x0, zc, HP, w, len, (t) => t * rise, {
      maxRise: 0.25,
      thick: 0.8,
      maxLen: 1.2,
    });
    // bents
    for (let x = R.x0 + 8; x < R.x1 - 2; x += 9) {
      const y = ((x - R.x0) / len) * rise - 0.6;
      const yb = G.LAYOUT.isLand(x, zc) ? 0 : -6;
      for (const zz of [R.z0 + 0.4, R.z1 - 0.4]) {
        b.box("qb_steel_dk", x, yb, zz, 0.5, y - yb, 0.5, {
          seg: false,
          grime: 0.6,
        });
        PF.col(x, zz, 0.55, 0.55, yb, y, 0, {
          walkable: false,
          surface: "metal",
        });
      }
      b.boxMM("qb_steel_dk", x - 0.3, y - 0.7, R.z0, x + 0.3, y, R.z1, {
        seg: false,
        grime: 0.6,
      });
      b.beam(
        "qb_steel_dk",
        V3(x, yb + 0.5, R.z0 + 0.4),
        V3(x, y - 0.7, R.z1 - 0.4),
        0.15,
        0.15,
        {},
      );
    }
    // railings, sampled every 8 m so each collider hugs the slope
    const pts = (z) => {
      const o = [];
      for (let x = R.x0; x <= R.x1 + 0.01; x += 8)
        o.push([x, z, ((x - R.x0) / len) * rise]);
      if (o[o.length - 1][0] < R.x1) o.push([R.x1, z, rise]);
      return o;
    };
    BK.rail(b, pts(R.z0 + 0.15), { lattice: true, post: 3 });
    BK.rail(b, pts(R.z1 - 0.15), { lattice: true, post: 3 });
  }

  // =================================================================
  // Broken span: C's arm ends in twisted steel; the suspended span in the river; orphaned tower D
  // =================================================================
  function brokenSpan(b) {
    BK.debris(b, "qb_steel", Q.brk, Q.lo, [Q.zN, Q.zS], 1, 71);
    BK.debris(
      b,
      "qb_steel_dk",
      Q.brk - 1,
      Q.deck - 0.8,
      [-445, -438, -432, -426],
      1,
      72,
    );
    // jagged deck ends
    const r = PF.rng(4901);
    for (let z = -445.5; z < -424.5; z += 1.6) {
      const l = 0.5 + r() * 2.6;
      b.boxMM(
        "asphalt",
        Q.brk,
        Q.deck - 0.6,
        z,
        Q.brk + l,
        Q.deck - 0.1 - r() * 0.3,
        z + 1.5,
        { seg: false, rz: -r() * 0.2, grime: 0.8 },
      );
    }
    // the fallen suspended span lying tilted in the river
    const M = PF.m4(525, -3, -435, 0.08, 0.05, 0.12);
    const add = (a, c, w) =>
      b.beam(
        "qb_steel",
        a.clone().applyMatrix4(M),
        c.clone().applyMatrix4(M),
        w,
        w,
        { grime: 0.7 },
      );
    for (const z0 of [-5, 5]) {
      for (let x = -24; x < 24; x += 6) {
        add(V3(x, 0, z0), V3(x + 6, 0, z0), 1.1);
        add(V3(x, 9, z0), V3(x + 6, 9, z0), 0.9);
        add(V3(x, 0, z0), V3(x, 9, z0), 0.7);
        add(V3(x, 9, z0), V3(x + 6, 0, z0), 0.6);
      }
    }
    for (let x = -24; x <= 24; x += 6) add(V3(x, 0, -5), V3(x, 0, 5), 0.6);
    // tower D arms (x 560..684): trusses + deck, visual only
    const xsD = panels([560, 622, 684]);
    for (const z0 of [Q.zN, Q.zS]) trussPlane(b, z0, xsD, { collide: false });
    b.boxMM("asphalt", 560, Q.deck - 0.6, -440.5, 684, Q.deck, -429.5, {
      grime: 0.8,
      segLen: 10,
    });
    BK.debris(b, "qb_steel", 560, Q.lo, [Q.zN, Q.zS], -1, 73);
    BK.debris(b, "qb_steel", 684, Q.lo, [Q.zN, Q.zS], 1, 74);
    tower(b, 622, {});
    pier(b, 622, -6, { northNose: true });
  }

  // =================================================================
  // Dressing: kiosk (roof stair), barricades, wrecks, lamps, signs
  // =================================================================
  function dress(b, anchors) {
    const d = Q.deck,
      k = Q.kiosk;
    // brick stair-head kiosk on the deck (door on its east face → Bridgemarket roof stair)
    K.room(
      b,
      "brick_dark",
      k.x0,
      k.z0,
      k.x1,
      k.z1,
      d,
      d + 3.2,
      0.3,
      [{ side: "e", c: (k.z0 + k.z1) / 2, w: 1.4, h: 2.3 }],
      {},
    );
    b.boxMM(
      "corrugated",
      k.x0 - 0.3,
      d + 3.2,
      k.z0 - 0.3,
      k.x1 + 0.3,
      d + 3.4,
      k.z1 + 0.3,
      { seg: false, grime: 0.7 },
    );
    b.boxMM(
      "paint_teal",
      k.x1 - 0.2,
      d,
      (k.z0 + k.z1) / 2 - 0.65,
      k.x1 - 0.1,
      d + 2.25,
      (k.z0 + k.z1) / 2 + 0.65,
      { seg: false, grime: 0.6 },
    );
    const ks = PF.texMat(
      "qb_kiosk",
      PF.signTex("qb_kiosk", ["BRIDGEMARKET", "STAIRS ↓"], "enamel", 512, 256, {
        bg: "#1d4a3a",
      }),
      { rough: 0.8 },
    );
    b.quad(ks, k.x1 + 0.02, d + 2.75, (k.z0 + k.z1) / 2, 1.6, 0.8, { ry: HP });
    anchors.deck_hatch = PF.anchor(k.x1 + 1.6, d, (k.z0 + k.z1) / 2, -HP);
    BK.lamp(b, k.x1 + 1, d, k.z1 + 0.6, 0, true);
    // settler barricade with a gate across the main deck at x 334
    PF.scrapWall(b, 334, -440.2, 334, -437.2, 2.2, { y: d, seed: 11 });
    PF.scrapWall(b, 334, -432.8, 334, -429.8, 2.2, { y: d, seed: 12 });
    PF.sandbags(b, 336, -437, 336, -433, 3, { y: d });
    PF.barrel(b, 331.5, d, -438.5, { fire: true });
    const tollTex = PF.texMat(
      "qb_toll",
      PF.signTex(
        "qb_toll",
        ["BRIDGEMARKET", "NO RAIDERS · NO BRUTES", "NO EXCEPTIONS"],
        "raider",
        512,
        256,
        { bg: "#4a4638", fg: "#e8d8a0" },
      ),
      { rough: 0.9 },
    );
    b.quad(tollTex, 334.1, d + 1.4, -438.7, 2.6, 1.3, { ry: HP });
    // wrecked traffic of 1967
    PF.car(b, 352, d, -433.2, HP + 0.25, { seed: 1 });
    PF.car(b, 364, d, -437.2, HP - 0.1, { seed: 2, paint: "paint_cream" });
    PF.car(b, 393, d, -432.8, HP + 0.6, { seed: 3, flipped: true });
    PF.car(b, 418, d, -437, HP, { seed: 4 });
    PF.car(b, 447, d, -433.5, HP - 0.3, { seed: 5, paint: "rust" });
    PF.car(b, 462, d, -427, HP + 0.1, { seed: 6 });
    PF.car(b, 486.5, d + 0.3, -436.5, HP, { seed: 7, tilt: -0.22 });
    PF.skeleton(b, 366.5, d + 0.02, -439, 0.4);
    PF.skeleton(b, 431, d + 0.02, -443.5, 2.1);
    // box truck
    b.boxMM("paint_cream", 432, d + 0.7, -438.4, 441, d + 3.9, -435.6, {
      grime: 0.7,
      seg: false,
    });
    b.boxMM("paint_red", 441, d + 0.7, -438.2, 443.6, d + 2.9, -435.8, {
      grime: 0.7,
      seg: false,
    });
    for (const x of [434, 439.5, 442.6])
      for (const z of [-438.5, -435.5])
        b.cyl("tire", x, d + 0.45, z, 0.45, 0.45, 0.3, 10, { rx: HP, hSeg: 1 });
    PF.colMM(432, d, -438.4, 443.6, d + 3.9, -435.6, {
      walkable: true,
      surface: "metal",
    });
    const nk = PF.texMat(
      "qb_truck",
      PF.signTex(
        "qb_truck",
        ["FIZZO COLA", "ZAP THAT THIRST!"],
        "enamel",
        512,
        192,
        { bg: "#b02a20", fg: "#f4ecd8" },
      ),
      { rough: 0.8 },
    );
    b.quad(nk, 436.5, d + 2.4, -435.55, 7.5, 2.4, { grime: 0.4 });
    b.quad(nk, 436.5, d + 2.4, -438.45, 7.5, 2.4, { ry: PI, grime: 0.4 });
    // lamp standards along the south parapet (lit near the market)
    for (let x = 306; x < Q.brk - 5; x += 22)
      BK.lamp(b, x, d, -424.9, PI, x < 360);
    for (let x = 384; x < Q.brk - 5; x += 22)
      BK.lamp(b, x, d, -445.2, 0, false);
    // highway sign over the ramp foot
    const hs = PF.texMat(
      "qb_hwy",
      PF.signTex(
        "qb_hwy",
        ["QUEENSBORO BRIDGE", "59TH ST · TO QUEENS"],
        "enamel",
        1024,
        320,
        { bg: "#1f5a3c" },
      ),
      { rough: 0.7 },
    );
    BK.gantry(b, 302.5, 0, -446, -441.6, 5.2, hs, 4.2, 1.4, -HP);
    // ramp-top checkpoint posts and a painted notice
    for (const zz of [-445.2, -442.1])
      b.box("rust", 374, d, zz, 0.3, 2.6, 0.3, { seg: false });
    const bb = PF.texMat(
      "qb_brk",
      PF.signTex(
        "qb_brk",
        ["BRIDGE OUT", "PAST THE ISLAND"],
        "raider",
        512,
        192,
        { bg: "#6a5a40", fg: "#f0e0b0" },
      ),
      { rough: 0.9 },
    );
    b.quad(bb, 374, d + 2.1, -443.65, 2.8, 1.05, { ry: -HP });
    // near the break: warning barricade
    PF.scrapWall(b, 480, -439, 480, -431, 1.4, {
      y: d,
      seed: 13,
      noSpikes: true,
    });
    b.quad(bb, 479.9, d + 1.0, -435, 2.6, 1.0, { ry: -HP });
    // settlement banner hung between the trusses near the market
    const ban = PF.texMat(
      "qb_banner",
      PF.signTex("qb_banner", ["BRIDGEMARKET"], "banner", 1024, 256, {
        bg: "#2a4a6a",
        fg: "#e8dcb8",
      }),
      { rough: 1, side: THREE.DoubleSide },
    );
    b.quad(ban, 326, 29.5, Q.zS - 0.6, 11, 2.6, { grime: 0.3 });
    b.quad(ban, 326, 29.5, Q.zN + 0.6, 11, 2.6, { ry: PI, grime: 0.3 });
    // street level: guard post at the ramp foot + market forecourt
    PF.barrel(b, 305.5, 0, -422.3, { fire: true });
    BK.lamp(b, Q.bays[1] - 4.2, 0, -423.2, PI, true);
    BK.lamp(b, Q.bays[1] + 4.2, 0, -423.2, PI, true);
    // landing + service hatch at the Manhattan pier's waterline (the Pier Works exit)
    b.boxMM("concrete", 334, 0, -446, 350, 0.3, -442.2, { grime: 0.8 });
    PF.colMM(334, -1.5, -446, 350, 0.3, -442.2, { surface: "concrete" });
    b.boxMM("rust", 344.2, 0.3, -442.95, 346.2, 2.6, -442.72, {
      grime: 0.8,
      seg: false,
    });
    const hk = PF.texMat(
      "qb_pierhatch",
      PF.signTex(
        "qb_pierhatch",
        ["PIER WORKS", "AUTHORIZED ONLY"],
        "enamel",
        512,
        192,
        { bg: "#6a2a20" },
      ),
      { rough: 0.8 },
    );
    b.quad(hk, 345.2, 3.1, -442.2, 1.8, 0.65, { ry: PI });
    anchors.pier_hatch = PF.anchor(345.2, 0.3, -443.6, 0);
    b.boxMM("iron", 338, 0.3, -446, 350, 1.3, -445.9, { seg: false });
  }

  // =================================================================
  // BUILD
  // =================================================================
  PF.buildQueensboroExterior = function (root) {
    const b = PF.batch("qb_ext");
    const bLit = PF.batch("qb_peek");
    const bGlass = PF.batch("qb_glass");
    const anchors = {};
    const gm = PF.mat("glass_tr");
    gm.transparent = true;
    gm.opacity = 0.32;
    gm.depthWrite = false;
    gm.side = THREE.DoubleSide;

    const xs = panels([312, 346, 388, 428, Q.brk]);
    for (const z0 of [Q.zN, Q.zS]) trussPlane(b, z0, xs, { collide: true });
    // lateral struts across the top chords where they clear the deck (and a few at the anchor end)
    for (const x of xs) {
      const ty = topY(x);
      if (ty > 30)
        BK.beamOriented(
          b,
          "qb_steel_dk",
          V3(x, ty - 1.2, Q.zN),
          V3(x, ty - 1.2, Q.zS),
          0.6,
          0.5,
          UP,
          0.5,
        );
    }
    for (const T of [346, 388, 428]) tower(b, T, { collide: true });
    pier(b, 346, -6, { cutwaterCol: true });
    pier(b, 388, 0, {});
    pier(b, 428, 0, {});
    market(b, bLit, bGlass, anchors);
    deck(b);
    ramp(b);
    // island stair tower ("the elevator building")
    const st = Q.stair;
    const top = BK.switchback(
      b,
      "qb_steel_dk",
      st.xA,
      st.xB,
      st.lanes,
      st.w,
      0,
      Q.deck,
      4,
      { landing: st.ld, frame: "qb_steel" },
    );
    anchors.island_stair = PF.anchor(st.xA - 2.5, 0, st.lanes[0], -HP);
    anchors.island_stair_top = PF.anchor(top.x, top.y, top.z, HP);
    brokenSpan(b);
    dress(b, anchors);

    b.build(root);
    bLit.build(root, { lodDistInt: 260 });
    bGlass.build(root, { noShadow: true, castShadow: false });
    anchors.entrance = anchors.market_door;
    anchors.ramp_foot = PF.anchor(301.5, 0, -443.8, -HP);
    anchors.ramp_top = PF.anchor(376, Q.deck, -443.6, -HP);
    anchors.deck_mid = PF.anchor(410, Q.deck, -435, -HP);
    anchors.broken_end = PF.anchor(484, Q.deck, -435, -HP);
    anchors.guard1 = PF.anchor(303.5, 1.1, -443.8, -HP * 0.6);
    anchors.guard2 = PF.anchor(337.5, Q.deck, -435.2, -HP);
    return anchors;
  };
})();
