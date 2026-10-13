// play-inline-207 05 — seg
// Lines 1590-2878 of readable/play-inline-207.pretty.js (statement-aligned).
  function buildInterior(cell, ext) {
    const O = cell.origin,
      ox = O.x,
      oy = O.y + BASE,
      oz = O.z;
    const X = (x) => ox + x,
      Z = (z) => oz + z;
    const P = (x, y, z) => V3(ox + x, oy + y, oz + z);
    const A = (x, y, z, yaw) => PF.anchor(ox + x, oy + y, oz + z, yaw || 0);
    const anchors = {};
    const root = cell.root;
    const r = PF.rng("ft_int");
    const F2 = 4.2,
      F3 = 8.2,
      AT = 12.0,
      CEL = -3.6;
    const W = (key, ax, a0, a1, f0, f1, y0, y1, gaps, o) =>
      PF.wall(
        b,
        key,
        ax,
        ax === "x" ? X(a0) : Z(a0),
        ax === "x" ? X(a1) : Z(a1),
        ax === "x" ? Z(f0) : X(f0),
        ax === "x" ? Z(f1) : X(f1),
        oy + y0,
        oy + y1,
        (gaps || []).map((g) => ({
          c: ax === "x" ? X(g.c) : Z(g.c),
          w: g.w,
          y0: oy + g.y0,
          h: g.h,
        })),
        o,
      );
    const slab = (key, x0, z0, x1, z1, y, holes, o) => {
      // floor slab with rectangular holes (split into strips along x)
      const hs = (holes || []).slice();
      const xs = [x0, x1];
      for (const h of hs) xs.push(h[0], h[2]);
      xs.sort((p, q) => p - q);
      for (let i = 0; i < xs.length - 1; i++) {
        const a = xs[i],
          c = xs[i + 1];
        if (c - a < 0.01) continue;
        const mid = (a + c) / 2;
        const cut = hs
          .filter((h) => mid > h[0] && mid < h[2])
          .map((h) => [h[1], h[3]])
          .sort((p, q) => p[0] - q[0]);
        let z = z0;
        const segs = [];
        for (const k of cut) {
          if (k[0] > z) segs.push([z, k[0]]);
          z = Math.max(z, k[1]);
        }
        if (z < z1) segs.push([z, z1]);
        for (const [za, zb] of segs) {
          b.boxMM(
            key,
            X(a),
            oy + y - 0.4,
            Z(za),
            X(c),
            oy + y,
            Z(zb),
            o || { grime: 0.5 },
          );
          PF.colMM(X(a), oy + y - 0.4, Z(za), X(c), oy + y, Z(zb), {
            surface: "wood",
          });
        }
      }
    };

    // ---------------- lights ----------------
    const L = [];
    L.push({ x: X(-4), y: oy + 2.6, z: Z(-3), color: 0xffb060, r: 9, i: 0.75 }); // taproom lamps
    L.push({
      x: X(-4),
      y: oy + 2.6,
      z: Z(3.5),
      color: 0xffb060,
      r: 9,
      i: 0.65,
    });
    L.push({ x: X(-7.4), y: oy + 1.0, z: Z(1), color: 0xff8030, r: 7, i: 1.0 }); // fireplace
    L.push({ x: X(-4), y: oy + 2.2, z: Z(-6), color: 0xffc070, r: 6, i: 0.6 }); // bar back
    L.push({ x: X(6), y: oy + 1.2, z: Z(-6.5), color: 0xff8030, r: 6, i: 0.9 }); // kitchen hearth
    L.push({ x: X(5), y: oy + 2.8, z: Z(3.5), color: 0xffd090, r: 7, i: 0.5 }); // stair hall
    for (const x of [-5, 0, 5])
      L.push({
        x: X(x),
        y: oy + F2 + 2.4,
        z: Z(-3.8),
        color: 0xffd8a0,
        r: 7,
        i: 0.55,
      }); // long room
    L.push({
      x: X(-3),
      y: oy + F2 + 2.4,
      z: Z(3.5),
      color: 0xfff0d0,
      r: 8,
      i: 0.5,
    }); // gallery
    L.push({
      x: X(5),
      y: oy + F2 + 2.4,
      z: Z(3.5),
      color: 0xffd8a0,
      r: 7,
      i: 0.4,
    });
    for (const x of [-5.5, -0.5, 5])
      L.push({
        x: X(x),
        y: oy + F3 + 2.2,
        z: Z(-3.8),
        color: 0xffd090,
        r: 6,
        i: 0.5,
      }); // guest rooms
    L.push({
      x: X(-3),
      y: oy + F3 + 2.2,
      z: Z(4),
      color: 0xffe0b0,
      r: 7,
      i: 0.45,
    });
    L.push({
      x: X(0),
      y: oy + F3 + 2.2,
      z: Z(0.6),
      color: 0xffd8a0,
      r: 7,
      i: 0.4,
    });
    L.push({
      x: X(5),
      y: oy + F3 + 2.2,
      z: Z(4),
      color: 0xffd8a0,
      r: 6,
      i: 0.4,
    });
    L.push({
      x: X(0),
      y: oy + AT + 1.6,
      z: Z(0),
      color: 0xd0d8ff,
      r: 9,
      i: 0.45,
    }); // attic dormers
    L.push({
      x: X(-3),
      y: oy + CEL + 2.2,
      z: Z(-2),
      color: 0xffa050,
      r: 8,
      i: 0.6,
    }); // cellar
    L.push({
      x: X(4),
      y: oy + CEL + 2.2,
      z: Z(3),
      color: 0xffa050,
      r: 7,
      i: 0.5,
    });
    L.push({
      x: X(0),
      y: oy + CEL + 1.6,
      z: Z(11),
      color: 0xff9040,
      r: 6,
      i: 0.5,
    }); // tunnel
    const b = PF.batch("fraunces_int");
    b.ground = oy + CEL;
    b.aoH = 2.2;
    b.setLights(L, 0x908070, 0.1);

    // ---------------- shell: exterior walls G..F3, floors ----------------
    const EXT = "brick_fed";
    W(EXT, "x", -8.4, 8.4, -7.4, -7, 0, AT, [
      { c: -4.5, w: 1.1, y0: 1.2, h: 2.0 },
      { c: 0, w: 1.1, y0: 1.2, h: 2.0 },
      { c: -4.5, w: 1.1, y0: F2 + 1.1, h: 2.0 },
      { c: 0, w: 1.1, y0: F2 + 1.1, h: 2.0 },
      { c: 4.5, w: 1.1, y0: F2 + 1.1, h: 2.0 },
      { c: -5.5, w: 1.0, y0: F3 + 1.0, h: 1.6 },
      { c: -0.5, w: 1.0, y0: F3 + 1.0, h: 1.6 },
      { c: 5, w: 1.0, y0: F3 + 1.0, h: 1.6 },
    ]);
    W(EXT, "x", -8.4, 8.4, 7, 7.4, 0, AT, [
      { c: 5, w: 1.6, y0: 0, h: 2.6 },
      { c: -4.5, w: 1.1, y0: 1.2, h: 2.0 },
      { c: -1, w: 1.1, y0: 1.2, h: 2.0 },
      { c: -4.5, w: 1.1, y0: F2 + 1.1, h: 2.0 },
      { c: -1, w: 1.1, y0: F2 + 1.1, h: 2.0 },
      { c: -4, w: 1.0, y0: F3 + 1.0, h: 1.6 },
    ]);
    PF.exitDoor(b, X(5), oy, Z(7.2), PI, 1.6, 2.6, {
      key: "oak",
      frame: "white_paint",
    }); // the front door onto Beaver Street, fanlight glowing
    W(EXT, "z", -7.4, 7.4, -8.4, -8, 0, AT, [
      { c: -3.5, w: 1.1, y0: F2 + 1.1, h: 2.0 },
      { c: 3.5, w: 1.1, y0: F2 + 1.1, h: 2.0 },
    ]);
    W(EXT, "z", -7.4, 7.4, 8, 8.4, 0, AT, [
      { c: 4.5, w: 1.1, y0: F2 + 1.1, h: 2.0 },
      { c: -4.5, w: 1.1, y0: 1.2, h: 2.0 },
    ]);
    // window glass/lit panes in those openings (warm daylight)
    const winQ = (x, y, z, ry) => {
      b.quad("lamp_warm", X(x), oy + y, Z(z), 1.0, 1.9, {
        ry,
        noAO: true,
        grime: 0,
      });
      for (const yy of [-0.45, 0.45])
        b.box(
          "white_paint",
          X(x),
          oy + y + yy,
          Z(z),
          ry === 0 || Math.abs(ry) === PI ? 1.0 : 0.04,
          0.04,
          ry === 0 || Math.abs(ry) === PI ? 0.04 : 1.0,
          { seg: false },
        );
    };
    for (const x of [-4.5, 0]) {
      winQ(x, 2.2, -7.3, 0);
      winQ(x, F2 + 2.1, -7.3, 0);
    }
    winQ(4.5, F2 + 2.1, -7.3, 0);
    for (const x of [-4.5, -1]) {
      winQ(x, 2.2, 7.3, PI);
      winQ(x, F2 + 2.1, 7.3, PI);
    }
    for (const z of [-3.5, 3.5]) winQ(-8.3, F2 + 2.1, z, HP);
    winQ(8.3, F2 + 2.1, 4.5, -HP);
    winQ(8.3, 2.2, -4.5, -HP);
    // floors: ground (plank), F2 (holes over flight A), F3 (hole over flight B), attic (hole over flight C)
    slab("planks", -8, -7, 8, 7, 0, [[2.4, -6.4, 3.6, -1]]);
    slab("planks", -8, -7, 8, 7, F2, [[6.6, 1.0, 8, 6.6]]);
    slab("planks", -8, -7, 8, 7, F3, [[2.0, 1.0, 3.4, 6.2]]);
    slab("planks", -8, -7, 8, 7, AT, [[6.6, 1.0, 8, 6.2]]);
    // ceiling beams (exposed) in the taproom and long room
    for (let x = -7.5; x <= 1.5; x += 1.5)
      b.box("mahogany", X(x), oy + F2 - 0.7, Z(0), 0.25, 0.3, 14, {
        seg: false,
        grime: 0.5,
      });
    for (let x = -7.2; x <= 7.2; x += 1.8)
      b.box("oak", X(x), oy + F3 - 0.7, Z(-3.7), 0.2, 0.28, 6.6, {
        seg: false,
        grime: 0.4,
      });

    // ================= GROUND FLOOR =================
    // partitions: x = 2 (taproom | kitchen & stair hall), z = 0 (kitchen | stair hall)
    W("plaster_clean", "z", -7, 7, 1.85, 2.15, 0, F2 - 0.4, [
      { c: -4, w: 1.2, y0: 0, h: 2.3 },
      { c: 3.6, w: 1.6, y0: 0, h: 2.5 },
    ]);
    W("plaster_clean", "x", 2.15, 8, -0.15, 0.15, 0, F2 - 0.4, [
      { c: 5.2, w: 1.2, y0: 0, h: 2.3 },
    ]);
    // wainscot + wallpaper band in the taproom
    b.boxMM("mahogany", X(-7.98), oy, Z(-6.98), X(-7.9), oy + 1.1, Z(6.98), {
      seg: false,
    });
    b.boxMM("mahogany", X(-7.98), oy, Z(6.9), X(1.84), oy + 1.1, Z(6.98), {
      seg: false,
    });
    // the bar: counter along the north wall, back shelves with bottles, taps, stools
    b.boxMM("mahogany", X(-7.4), oy, Z(-5.4), X(-1.2), oy + 1.1, Z(-4.7), {
      grime: 0.45,
    });
    b.boxMM("oak", X(-7.5), oy + 1.1, Z(-5.5), X(-1.1), oy + 1.18, Z(-4.6), {
      seg: false,
    });
    b.boxMM(
      "brass",
      X(-7.4),
      oy + 0.12,
      Z(-4.66),
      X(-1.2),
      oy + 0.18,
      Z(-4.6),
      { seg: false },
    ); // foot rail
    PF.colMM(X(-7.4), oy, Z(-5.4), X(-1.2), oy + 1.18, Z(-4.7), {
      walkable: false,
    });
    D.shelf(b, X(-4.3), oy + 0.2, Z(-6.75), 0, 5.6, 4, 17);
    b.boxMM(
      "mahogany",
      X(-7.2),
      oy + 2.3,
      Z(-6.95),
      X(-1.4),
      oy + 2.8,
      Z(-6.6),
      { seg: false },
    );
    for (let i = 0; i < 4; i++) {
      b.cyl("brass", X(-6 + i * 1.1), oy + 1.18, Z(-5.2), 0.03, 0.03, 0.35, 6, {
        hSeg: 1,
      });
      b.box("mahogany", X(-6 + i * 1.1), oy + 1.5, Z(-5.2), 0.05, 0.14, 0.05, {
        seg: false,
      });
    }
    for (let i = 0; i < 6; i++) {
      const x = -6.8 + i * 1.05;
      b.cyl("mahogany", X(x), oy, Z(-4.1), 0.05, 0.08, 0.72, 6, { hSeg: 1 });
      b.cyl("velvet", X(x), oy + 0.72, Z(-4.1), 0.2, 0.2, 0.07, 10, {
        hSeg: 1,
      });
    }
    for (let i = 0; i < 9; i++)
      b.cyl(
        r() < 0.5 ? "glass_dark" : "brass",
        X(-7 + r() * 5.6),
        oy + 1.18,
        Z(-5.1 + r() * 0.3),
        0.04,
        0.045,
        0.16 + r() * 0.1,
        6,
        { hSeg: 1 },
      ); // tankards & bottles
    anchors.bartender = A(-4.2, 0, -6.0, 0);
    // fireplace on the west wall (brick hearth, mantel, fire, kettle, portrait above)
    // (open firebox: back wall, two jambs and the chimney breast, so the fire is actually visible)
    b.boxMM("brick_fed", X(-8), oy, Z(-0.2), X(-7.85), oy + 2.4, Z(2.4), {
      grime: 0.6,
      c: 0x3a2a22,
    });
    b.boxMM("brick_fed", X(-7.85), oy, Z(-0.2), X(-7.2), oy + 1.3, Z(0.35), {
      grime: 0.6,
    });
    b.boxMM("brick_fed", X(-7.85), oy, Z(1.85), X(-7.2), oy + 1.3, Z(2.4), {
      grime: 0.6,
    });
    b.boxMM(
      "brick_fed",
      X(-7.85),
      oy + 1.3,
      Z(-0.2),
      X(-7.2),
      oy + 2.4,
      Z(2.4),
      { grime: 0.6 },
    );
    b.boxMM(
      "granite_dark",
      X(-7.85),
      oy,
      Z(0.35),
      X(-7.2),
      oy + 0.04,
      Z(1.85),
      { seg: false, c: 0x2a2420 },
    ); // soot-black hearth floor
    b.boxMM("granite_dark", X(-7.2), oy, Z(0.0), X(-6.7), oy + 0.06, Z(2.2), {
      seg: false,
    }); // hearthstone
    for (const z of [0.36, 1.84])
      b.boxMM(
        "brick_fed",
        X(-7.84),
        oy + 0.9,
        Z(z) - 0.005,
        X(-7.22),
        oy + 1.3,
        Z(z) + 0.005,
        { seg: false, c: 0x1a120e },
      ); // soot on the jambs
    PF.fireAt(P(-7.55, 0.12, 1.1), 0.32, { smoke: false, light: true });
    b.boxMM("oak", X(-7.3), oy + 1.45, Z(-0.4), X(-6.95), oy + 1.6, Z(2.6), {
      seg: false,
    });
    b.box("fire", X(-7.6), oy + 0.05, Z(1.1), 0.5, 0.35, 1.0, {
      seg: false,
      noAO: true,
    });
    for (let k = 0; k < 3; k++)
      b.box(
        "rotten",
        X(-7.55),
        oy + 0.05 + k * 0.06,
        Z(0.8 + k * 0.25),
        0.15,
        0.12,
        0.9,
        { ry: 0.3 * k, seg: false },
      );
    b.sphere("iron", X(-7.5), oy + 0.7, Z(1.1), 0.18, { ws: 8, hs: 6 });
    PF.glow(P(-7.4, 0.5, 1.1), 0xff7a2a, 1.6, root, {
      intensity: 1.6,
      flicker: 0.5,
    });
    PF.colMM(X(-8), oy, Z(-0.2), X(-7.2), oy + 2.4, Z(2.4), {
      walkable: false,
    });
    D.painting(b, 1, X(-7.19), oy + 3.1, Z(1.1), 1.0, 1.1, HP, {
      frame: "gilt",
    });
    // tables with Windsor chairs, candles, tankards
    for (const [x, z] of [
      [-5.5, -1.8],
      [-2.5, -1.2],
      [-5.5, 2.4],
      [-2.2, 3.0],
      [-0.2, 5.6],
      [-6.2, 5.6],
    ]) {
      b.cyl("oak", X(x), oy, Z(z), 0.06, 0.12, 0.72, 6, { hSeg: 1 });
      b.cyl("oak", X(x), oy + 0.72, Z(z), 0.55, 0.55, 0.06, 12, { hSeg: 1 });
      PF.col(X(x), Z(z), 1.0, 1.0, oy, oy + 0.78, 0, { walkable: false });
      for (let k = 0; k < 3; k++) {
        const a = (k / 3) * TAU + x;
        windsor(
          b,
          X(x + Math.cos(a) * 0.9),
          oy,
          Z(z + Math.sin(a) * 0.9),
          -a + HP,
        );
      }
      PF.candles(b, X(x), oy + 0.78, Z(z), 1, x * 3 + z, root);
      if (r() < 0.7)
        b.cyl(
          "brass",
          X(x + 0.2),
          oy + 0.78,
          Z(z - 0.15),
          0.05,
          0.045,
          0.14,
          6,
          { hSeg: 1 },
        );
    }
    // fiddler's corner (a crate stage), dartboard, a moose-head-shaped raider helmet trophy
    b.boxMM("planks", X(-7.9), oy, Z(4.4), X(-5.8), oy + 0.3, Z(6.9), {
      seg: false,
    });
    PF.colMM(X(-7.9), oy, Z(4.4), X(-5.8), oy + 0.3, Z(6.9), {
      surface: "wood",
    });
    b.cyl("paint_cream", X(1.84), oy + 1.7, Z(-1.8), 0.25, 0.25, 0.04, 16, {
      hSeg: 1,
      rz: HP,
    });
    b.cyl("paint_red", X(1.82), oy + 1.7, Z(-1.8), 0.08, 0.08, 0.05, 12, {
      hSeg: 1,
      rz: HP,
    });
    // chandelier: iron candle ring
    for (const z of [-2, 3.5]) {
      b.cyl("iron", X(-4), oy + 2.6, Z(z), 0.01, 0.01, 1.2, 3, { hSeg: 1 });
      b.add("iron", new THREE.TorusGeometry(0.55, 0.03, 4, 12), {
        m: PF.m4(X(-4), oy + 2.6, Z(z), 0, HP),
      });
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * TAU;
        b.cyl(
          "candle",
          X(-4 + Math.cos(a) * 0.55),
          oy + 2.62,
          Z(z + Math.sin(a) * 0.55),
          0.02,
          0.02,
          0.14,
          5,
          { hSeg: 1 },
        );
        b.sphere(
          "flame",
          X(-4 + Math.cos(a) * 0.55),
          oy + 2.8,
          Z(z + Math.sin(a) * 0.55),
          0.02,
          { ws: 4, hs: 3, sy: 2 },
        );
      }
      PF.glow(P(-4, 2.75, z), 0xffb060, 1.8, root, {
        intensity: 1.2,
        flicker: 0.15,
      });
    }
    const taproomK = PF.texMat(
      "ft_rules",
      PF.signTex(
        "ft_rules",
        [
          "HOUSE RULES",
          "PAY FIRST · DRINK SECOND",
          "NO SHOOTING THE FIDDLER",
          "ROOMS 10 SCRIP",
        ],
        "engraved",
        512,
        320,
        { bg: "#2a1e14", fg: "#e0c890" },
      ),
    );
    b.quad(taproomK, X(1.83), oy + 1.9, Z(1.6), 1.2, 0.75, { ry: -HP });
    anchors.vane = A(-2.2, 0, 4.0, PI);
    anchors.fiddler = A(-7.25, 0.3, 6.1, HP); // (was inside the stage crate collider)
    anchors.patron = A(-5.5, 0, -0.9, PI);
    anchors.taproom = A(-3.5, 0, 1, 0);

    // kitchen (x 2..8, z -7..0): hearth, work table, pots, sacks, the cellar stair
    b.boxMM("brick_fed", X(7.8), oy, Z(-7), X(8), oy + 2.6, Z(-4.4), {
      grime: 0.6,
      c: 0x3a2a22,
    });
    b.boxMM("brick_fed", X(6.8), oy, Z(-7), X(7.8), oy + 1.4, Z(-6.5), {
      grime: 0.6,
    });
    b.boxMM("brick_fed", X(6.8), oy, Z(-4.9), X(7.8), oy + 1.4, Z(-4.4), {
      grime: 0.6,
    });
    b.boxMM("brick_fed", X(6.8), oy + 1.4, Z(-7), X(7.8), oy + 2.6, Z(-4.4), {
      grime: 0.6,
    });
    b.boxMM("granite_dark", X(6.8), oy, Z(-6.5), X(7.8), oy + 0.04, Z(-4.9), {
      seg: false,
      c: 0x2a2420,
    });
    PF.fireAt(P(7.45, 0.12, -5.7), 0.3, { smoke: false });
    b.box("fire", X(7.4), oy + 0.05, Z(-5.7), 0.6, 0.35, 0.9, {
      seg: false,
      noAO: true,
    });
    b.cyl("iron", X(7.3), oy + 0.45, Z(-5.7), 0.3, 0.25, 0.4, 10, { hSeg: 1 });
    b.beam("iron", P(7.9, 1.3, -5.7), P(7.3, 1.3, -5.7), 0.03, 0.03);
    PF.glow(P(7.3, 0.5, -5.7), 0xff7a2a, 1.3, root, {
      intensity: 1.5,
      flicker: 0.5,
    });
    PF.colMM(X(6.8), oy, Z(-7), X(8), oy + 2.6, Z(-4.4), { walkable: false });
    b.box("oak", X(5.4), oy, Z(-2.6), 2.2, 0.85, 1.0, {
      seg: false,
      grime: 0.6,
    });
    PF.col(X(5.4), Z(-2.6), 2.2, 1.0, oy, oy + 0.85, 0, { walkable: false });
    for (let i = 0; i < 5; i++)
      b.cyl(
        r() < 0.5 ? "iron" : "copper",
        X(4.6 + i * 0.4),
        oy + 0.85,
        Z(-2.6 + (r() - 0.5) * 0.5),
        0.12,
        0.1,
        0.12 + r() * 0.1,
        8,
        { hSeg: 1 },
      );
    D.shelf(b, X(5.2), oy, Z(-6.8), 0, 2.6, 3, 29);
    for (let i = 0; i < 4; i++)
      b.sphere("sandbag", X(7.4), oy + 0.3, Z(-3.9 + i * 0.7), 0.35, {
        sy: 0.9,
      });
    for (let i = 0; i < 6; i++)
      b.box(
        "rotten",
        X(4.2 + (i % 3) * 0.6),
        oy + 2.9,
        Z(-0.3),
        0.05,
        0.5 + r() * 0.3,
        0.05,
        { seg: false },
      ); // hanging herbs/meat hooks
    // cellar stair opening railing + stair down (x 2.4..3.6, from z -1 down north to z -6.4)
    PF.railing(
      b,
      [
        [X(3.7), Z(-6.4)],
        [X(3.7), Z(-1.05)],
      ],
      oy,
      1.0,
      "mahogany",
      { collide: true },
    );
    PF.stairs(b, "oak", X(3.0), Z(-6.4), 0, 1.2, 5.3, oy + CEL, oy, {
      base: oy + CEL - 0.3,
    });
    anchors.cook = A(5.4, 0, -4.1, 0);
    anchors.kitchen = A(5, 0, -1.5, 0);

    // stair hall (x 2..8, z 0..7): entrance, flight A up to F2 along the east wall
    PF.stairs(b, "oak", X(7.3), Z(6.6), PI, 1.4, 5.6, oy, oy + F2, {
      base: oy - 0.2,
    });
    PF.railing(
      b,
      [
        [X(6.55), Z(6.6)],
        [X(6.55), Z(1.0)],
      ],
      oy,
      1.0,
      "mahogany",
      {},
    );
    for (let k = 0; k < 12; k++) {
      const t = k / 11;
      b.box(
        "white_paint",
        X(6.55),
        oy + t * F2 + 0.2,
        Z(6.6 - t * 5.6),
        0.04,
        0.9,
        0.04,
        { seg: false },
      );
    }
    D.painting(b, 3, X(2.16), oy + 1.8, Z(5.2), 0.8, 1.0, HP, {
      frame: "gilt",
    });
    b.box("oak", X(3), oy, Z(6.4), 1.4, 0.9, 0.5, { seg: false }); // hall table
    PF.col(X(3), Z(6.4), 1.4, 0.5, oy, oy + 0.9, 0, { walkable: false });
    anchors.entrance = A(4.0, 0, 3.7, HP); // stair hall, facing west through the open doorway into the taproom (bar & fireplace)
    PF.door({
      id: "pf_ft_exit",
      pos: P(5, 1.4, 7.1),
      label: "Beaver Street",
      verb: "Exit",
      radius: 1.2,
      target: { x: ext.door.x, y: 0.05, z: ext.door.z, yaw: 0 },
      sound: "door_open",
    }); // face the street, away from the door

    // ================= SECOND FLOOR: THE LONG ROOM + gallery =================
    W("plaster_blue", "x", -8, 8, -0.55, -0.25, F2, F3 - 0.4, [
      { c: -3, w: 1.4, y0: F2, h: 2.4 },
      { c: 5, w: 1.4, y0: F2, h: 2.4 },
    ]);
    W("plaster_clean", "z", -0.25, 7, 1.85, 2.15, F2, F3 - 0.4, [
      { c: 3.6, w: 1.4, y0: F2, h: 2.4 },
    ]);
    // the Long Room is restored colonial: painted plaster lining over the brick (window reveals kept), chair rail & cornice
    const lin = { noCollide: true };
    W(
      "plaster_blue",
      "x",
      -8,
      8,
      -7,
      -6.97,
      F2,
      F3 - 0.4,
      [
        { c: -4.5, w: 1.1, y0: F2 + 1.1, h: 2.0 },
        { c: 0, w: 1.1, y0: F2 + 1.1, h: 2.0 },
        { c: 4.5, w: 1.1, y0: F2 + 1.1, h: 2.0 },
      ],
      lin,
    );
    W(
      "plaster_blue",
      "z",
      -6.97,
      -0.55,
      -8,
      -7.97,
      F2,
      F3 - 0.4,
      [{ c: -3.5, w: 1.1, y0: F2 + 1.1, h: 2.0 }],
      lin,
    );
    W("plaster_blue", "z", -6.97, -0.55, 7.97, 8, F2, F3 - 0.4, [], lin);
    b.boxMM(
      "white_paint",
      X(-7.97),
      oy + F2 + 1.0,
      Z(-6.97),
      X(7.97),
      oy + F2 + 1.07,
      Z(-6.9),
      { seg: false },
    );
    b.boxMM(
      "white_paint",
      X(-7.97),
      oy + F3 - 0.62,
      Z(-6.97),
      X(7.97),
      oy + F3 - 0.4,
      Z(-6.86),
      { seg: false },
    );
    for (const sx of [-1, 1]) {
      b.boxMM(
        "white_paint",
        X(sx * 7.97 - (sx > 0 ? 0.07 : 0)),
        oy + F2 + 1.0,
        Z(-6.97),
        X(sx * 7.97 + (sx < 0 ? 0.07 : 0)),
        oy + F2 + 1.07,
        Z(-0.56),
        { seg: false },
      );
      b.boxMM(
        "white_paint",
        X(sx * 7.97 - (sx > 0 ? 0.11 : 0)),
        oy + F3 - 0.62,
        Z(-6.97),
        X(sx * 7.97 + (sx < 0 ? 0.11 : 0)),
        oy + F3 - 0.4,
        Z(-0.56),
        { seg: false },
      );
    }
    // Long Room: wainscot, portraits, the long table set for the farewell
    b.boxMM(
      "mahogany",
      X(-7.98),
      oy + F2,
      Z(-6.98),
      X(7.98),
      oy + F2 + 1.0,
      Z(-6.9),
      { seg: false },
    );
    b.boxMM(
      "mahogany",
      X(-7.98),
      oy + F2,
      Z(-6.98),
      X(-7.9),
      oy + F2 + 1.0,
      Z(-0.56),
      { seg: false },
    );
    for (let i = 0; i < 5; i++)
      D.painting(
        b,
        [1, 3, 1, 3, 5][i],
        X(-6 + i * 3),
        oy + F2 + 2.2,
        Z(-6.92),
        1.0,
        1.3,
        0,
        { frame: "gilt" },
      );
    b.boxMM(
      "mahogany",
      X(-5.5),
      oy + F2 + 0.74,
      Z(-4.4),
      X(4.5),
      oy + F2 + 0.8,
      Z(-3.2),
      { grime: 0.3 },
    );
    b.boxMM(
      "linen",
      X(-5.6),
      oy + F2 + 0.8,
      Z(-4.5),
      X(4.6),
      oy + F2 + 0.82,
      Z(-3.1),
      { seg: false },
    );
    for (let x = -5.2; x <= 4.2; x += 1.6)
      for (const z of [-4.4, -3.2])
        b.cyl("mahogany", X(x), oy + F2, Z(z), 0.04, 0.05, 0.74, 6, {
          hSeg: 1,
        });
    PF.colMM(X(-5.5), oy + F2, Z(-4.4), X(4.5), oy + F2 + 0.82, Z(-3.2), {
      walkable: false,
    });
    for (let i = 0; i < 7; i++) {
      const x = -5 + i * 1.5;
      for (const [z, a] of [
        [-4.95, 0],
        [-2.65, PI],
      ]) {
        windsor(b, X(x), oy + F2, Z(z), a);
        b.cyl(
          "paint_cream",
          X(x),
          oy + F2 + 0.82,
          Z(z + (a ? -0.55 : 0.55)),
          0.13,
          0.13,
          0.015,
          12,
          { hSeg: 1 },
        );
        b.cyl(
          "glass_dark",
          X(x + 0.2),
          oy + F2 + 0.82,
          Z(z + (a ? -0.6 : 0.6)),
          0.03,
          0.035,
          0.14,
          6,
          { hSeg: 1 },
        );
      }
    }
    for (const x of [-3, 0.5, 3.5]) {
      b.lathe(
        "brass",
        [
          [0.1, 0],
          [0.04, 0.05],
          [0.025, 0.4],
          [0.05, 0.44],
          [0.02, 0.46],
        ],
        8,
        X(x),
        oy + F2 + 0.82,
        Z(-3.8),
        {},
      );
      PF.candles(b, X(x), oy + F2 + 1.28, Z(-3.8), 1, x * 11, root);
    }
    const farewellK = PF.texMat(
      "ft_farewell",
      PF.signTex(
        "ft_farewell",
        [
          "THE LONG ROOM",
          "Here, on the 4th of December 1783, General George Washington",
          "bade farewell to the officers of the Continental Army.",
          '"With a heart full of love and gratitude, I now take leave of you."',
        ],
        "bronze",
        1024,
        256,
      ),
    );
    b.quad(farewellK, X(7.9), oy + F2 + 1.8, Z(-3.8), 2.6, 0.65, { ry: -HP });
    anchors.docent = A(6.0, F2, -3.8, HP);
    anchors.long_room = A(0, F2, -2, PI);
    // gallery (x -8..2, z -0.25..7): display cases, the tricorn case, flag, diorama
    const caseAt = (x, z, w, d) => {
      b.box("mahogany", X(x), oy + F2, Z(z), w, 0.85, d, {
        seg: false,
        grime: 0.4,
      });
      b.box("glass_dark", X(x), oy + F2 + 0.85, Z(z), w - 0.05, 0.5, d - 0.05, {
        seg: false,
      });
      b.box("brass", X(x), oy + F2 + 1.35, Z(z), w, 0.04, d, { seg: false });
      PF.col(X(x), Z(z), w, d, oy + F2, oy + F2 + 1.4, 0, { walkable: false });
    };
    caseAt(-6.5, 1.6, 1.2, 0.8);
    caseAt(-6.5, 4.0, 1.2, 0.8);
    caseAt(-3.2, 2.8, 1.8, 0.9);
    caseAt(0.6, 5.8, 1.0, 1.0);
    b.sphere("bone", X(-6.5), oy + F2 + 0.95, Z(1.6), 0.03, {}); // "Washington's tooth"
    b.box("fabric", X(-6.5), oy + F2 + 0.9, Z(4.0), 0.2, 0.04, 0.05, {
      seg: false,
      c: 0xb8b0a0,
    }); // lock of hair
    b.box("iron", X(-3.2), oy + F2 + 0.9, Z(2.8), 0.9, 0.05, 0.1, {
      seg: false,
    });
    b.box("mahogany", X(-3.5), oy + F2 + 0.9, Z(2.8), 0.4, 0.06, 0.08, {
      seg: false,
    }); // musket
    // diorama: New York, 1783 (tiny buildings)
    b.box("oak", X(-1.5), oy + F2, Z(0.9), 2.0, 0.8, 1.0, { seg: false });
    for (let i = 0; i < 18; i++)
      b.box(
        i % 3 ? "brick_fed" : "white_paint",
        X(-2.3 + r() * 1.6),
        oy + F2 + 0.8,
        Z(0.6 + r() * 0.6),
        0.1 + r() * 0.08,
        0.06 + r() * 0.12,
        0.1,
        { seg: false },
      );
    PF.col(X(-1.5), Z(0.9), 2.0, 1.0, oy + F2, oy + F2 + 0.95, 0, {
      walkable: false,
    });
    const flagK = PF.texMat("ft_flag_in", PF.flagTex(1), { rough: 0.9 });
    b.quad(flagK, X(-7.94), oy + F2 + 2.2, Z(3.2), 2.0, 1.15, { ry: HP });
    const plq = [
      [
        "tooth",
        "ALLEGEDLY: ONE (1) TOOTH, G. WASHINGTON. Hippopotamus ivory. The General had many teeth, few of them his own.",
        -6.5,
        1.6,
      ],
      [
        "hair",
        "A LOCK OF HAIR, said to be Washington's. Or his horse's. The label was water-damaged in 1971.",
        -6.5,
        4.0,
      ],
      [
        "musket",
        "BROWN BESS MUSKET, c. 1775. Do not load. Do not ask the robot to load it.",
        -3.2,
        2.8,
      ],
      [
        "diorama",
        "NEW YORK, 1783 — the British evacuate the city. For a while, they said, it would be a ruin. They were early.",
        -1.5,
        0.9,
      ],
    ];
    for (const [id, text, x, z] of plq)
      PF.readable(P(x, F2 + 1.3, z), "Exhibit Card", text, "Read");
    anchors.tricorn_case = A(0.6, F2 + 0.9, 5.8, 0);
    anchors.gallery = A(-3, F2, 5, 0);
    // flight B: F2 → F3 along the stair hall west wall (x 2..3.4), rising south
    PF.stairs(b, "oak", X(2.7), Z(1.0), 0, 1.4, 5.2, oy + F2, oy + F3, {
      base: oy + F2 - 0.2,
    });
    PF.railing(
      b,
      [
        [X(3.45), Z(1.0)],
        [X(3.45), Z(6.2)],
      ],
      oy + F2,
      1.0,
      "mahogany",
      {},
    );
    PF.railing(
      b,
      [
        [X(6.55), Z(1.0)],
        [X(6.55), Z(6.6)],
        [X(8), Z(6.6)],
      ],
      oy + F2,
      1.0,
      "mahogany",
      { collide: true },
    ); // around flight A's well
    D.painting(b, 5, X(7.94), oy + F2 + 2, Z(3.5), 0.9, 1.1, -HP, {
      frame: "gilt",
    });

    // ================= THIRD FLOOR: guest rooms, the period room =================
    W("plaster_w", "x", -8, 8, -0.55, -0.25, F3, AT - 0.4, [
      { c: -5.5, w: 1.0, y0: F3, h: 2.2 },
      { c: -0.5, w: 1.0, y0: F3, h: 2.2 },
      { c: 4.5, w: 1.0, y0: F3, h: 2.2 },
    ]);
    W("plaster_w", "z", -7, -0.55, -3.1, -2.9, F3, AT - 0.4);
    W("plaster_w", "z", -7, -0.55, 1.9, 2.1, F3, AT - 0.4);
    W("plaster_w", "x", -8, 2.15, 1.9, 2.2, F3, AT - 0.4, [
      { c: -3, w: 1.0, y0: F3, h: 2.2 },
    ]);
    W("plaster_w", "z", 2.2, 7, 1.85, 2.15, F3, AT - 0.4);
    // corridor z -0.25..1.9 across the floor; rooms north
    const bedAt = (x, z, ry, rich) => {
      b.box(rich ? "mahogany" : "oak", X(x), oy + F3, Z(z), 1.5, 0.45, 2.1, {
        ry,
        seg: false,
      });
      b.box(
        rich ? "velvet" : "linen",
        X(x),
        oy + F3 + 0.45,
        Z(z),
        1.45,
        0.15,
        2.0,
        { ry, seg: false, grime: 0.5 },
      );
      for (const sx of [-1, 1])
        for (const sz of [-1, 1])
          b.box(
            "mahogany",
            X(x + sx * 0.7),
            oy + F3,
            Z(z + sz * 1.0),
            0.08,
            rich ? 2.0 : 1.0,
            0.08,
            { seg: false },
          );
      PF.col(X(x), Z(z), 1.5, 2.1, oy + F3, oy + F3 + 0.6, ry, {
        surface: "wood",
      });
    };
    bedAt(-6.9, -5.4, 0, false);
    bedAt(-1.4, -5.4, 0, false);
    bedAt(6.6, -5.4, 0, true);
    for (const [x, z] of [
      [-4.2, -6.5],
      [0.6, -6.5],
      [3.5, -6.5],
    ]) {
      b.box("oak", X(x), oy + F3, Z(z), 0.9, 1.0, 0.5, { seg: false });
      PF.col(X(x), Z(z), 0.9, 0.5, oy + F3, oy + F3 + 1.0, 0, {
        walkable: false,
      });
    }
    D.chair(b, X(-4.5), oy + F3, Z(-2.5), 0.8, false, "oak");
    D.painting(b, 6, X(-5.5), oy + F3 + 1.8, Z(-6.92), 0.8, 0.6, 0, {
      frame: "oak",
    });
    D.painting(b, 0, X(5), oy + F3 + 1.8, Z(-6.92), 1.4, 0.9, 0, {
      frame: "gilt",
    });
    anchors.room_bed = A(-6.9, F3 + 0.6, -5.4, 0);
    anchors.guest = A(-5.5, F3, -2.2, PI);
    anchors.owner_safe = A(7.7, F3 + 0.9, -2.2, -HP);
    // period room (x -8..2, z 1.9..7): green wallpaper, a harpsichord, a card table, a skeleton in the wing chair
    b.boxMM(
      "wallpaper_g",
      X(-7.98),
      oy + F3,
      Z(2.1),
      X(-7.9),
      oy + AT - 0.4,
      Z(6.98),
      { seg: false },
    );
    b.boxMM(
      "wallpaper_g",
      X(-7.98),
      oy + F3,
      Z(6.9),
      X(1.84),
      oy + AT - 0.4,
      Z(6.98),
      { seg: false },
    );
    b.box("mahogany", X(-5.8), oy + F3, Z(6.2), 1.8, 0.9, 0.7, { seg: false });
    b.box("paint_cream", X(-5.8), oy + F3 + 0.9, Z(6.0), 1.6, 0.04, 0.25, {
      seg: false,
    });
    PF.col(X(-5.8), Z(6.2), 1.8, 0.7, oy + F3, oy + F3 + 0.95, 0, {
      walkable: false,
    });
    b.box("velvet", X(-2), oy + F3, Z(4.8), 0.9, 0.5, 0.8, { seg: false });
    b.box("velvet", X(-2), oy + F3 + 0.5, Z(5.15), 0.9, 0.7, 0.15, {
      seg: false,
    });
    PF.skeleton(b, X(-2), oy + F3 + 0.52, Z(4.7), PI);
    anchors.period = A(-3.5, F3, 3.5, 0);
    // flight C: F3 → attic along the east wall
    PF.stairs(b, "oak", X(7.3), Z(6.2), PI, 1.4, 5.2, oy + F3, oy + AT, {
      base: oy + F3 - 0.2,
    });
    PF.railing(
      b,
      [
        [X(2.0), Z(1.0)],
        [X(3.45), Z(1.0)],
      ],
      oy + F3,
      1.0,
      "mahogany",
      { collide: true },
    );
    PF.railing(
      b,
      [
        [X(3.45), Z(1.0)],
        [X(3.45), Z(6.2)],
      ],
      oy + F3,
      1.0,
      "mahogany",
      { collide: true },
    );

    // ================= ATTIC =================
    W("plaster_w", "x", -8, 8, -7, -6.6, AT, AT + 3.2);
    W("plaster_w", "x", -8, 8, 6.6, 7, AT, AT + 3.2);
    W("plaster_w", "z", -6.6, 6.6, -8, -7.6, AT, AT + 3.2);
    W("plaster_w", "z", -6.6, 6.6, 7.6, 8, AT, AT + 3.2);
    // raked ceiling (sloping boards) + rafters
    for (const sg of [-1, 1]) {
      b.box("rotten", X(0), oy + AT + 2.35, Z(sg * 4.2), 16, 0.06, 5.4, {
        rx: sg * 0.52,
        seg: true,
        grime: 0.6,
      });
    }
    b.boxMM(
      "rotten",
      X(-8),
      oy + AT + 3.3,
      Z(-1.3),
      X(8),
      oy + AT + 3.4,
      Z(1.3),
      { seg: false },
    );
    for (let x = -7; x <= 7; x += 1.4)
      for (const sg of [-1, 1])
        b.beam(
          "oak",
          P(x, 1.0, sg * 6.5).setY(oy + AT + 1.0),
          P(x, 3.3, sg * 1.3).setY(oy + AT + 3.3),
          0.14,
          0.14,
          {},
        );
    for (const x of [-4.5, 0, 4.5])
      b.quad("lamp_blue", X(x), oy + AT + 1.2, Z(-6.55), 0.7, 0.9, {
        noAO: true,
      });
    D.crates(b, X(-6), oy + AT, Z(-4.5), 2, 31, true);
    D.crates(b, X(-5), oy + AT, Z(-5.3), 1, 32, true);
    for (let i = 0; i < 4; i++)
      b.box("fabric", X(-2 + i * 1.3), oy + AT, Z(-5.5), 1.0, 0.6, 0.6, {
        seg: false,
        c: 0x9a8a70,
        grime: 0.7,
      }); // trunks under sheets
    D.mattress(b, X(4.5), oy + AT, Z(4.5), HP);
    b.box("panel", X(0.5), oy + AT, Z(5.8), 1.4, 0.75, 0.6, { seg: false });
    PF.col(X(0.5), Z(5.8), 1.4, 0.6, oy + AT, oy + AT + 0.75, 0, {
      walkable: false,
    });
    anchors.attic = A(0, AT, 0, 0);
    anchors.attic_radio = A(0.5, AT + 0.76, 5.8, PI);

    // ================= CELLAR =================
    b.boxMM("granite", X(-8), oy + CEL - 0.4, Z(-7), X(8), oy + CEL, Z(7), {
      grime: 0.7,
    });
    PF.colMM(X(-8), oy + CEL - 0.4, Z(-7), X(8), oy + CEL, Z(7));
    W("schist", "x", -8.4, 8.4, -7.4, -7, CEL, 0);
    W("schist", "x", -8.4, 8.4, 7, 7.4, CEL, 0, [
      { c: 0, w: 1.6, y0: CEL, h: 2.4 },
    ]);
    W("schist", "z", -7.4, 7.4, -8.4, -8, CEL, 0);
    W("schist", "z", -7.4, 7.4, 8, 8.4, CEL, 0);
    // brick barrel vaults (two bays along x)
    const vY = oy + CEL + 2.0;
    for (const [x0, x1] of [
      [-8, 0],
      [0, 8],
    ]) {
      const g = PF.surface(
        (u, v, out) => {
          const x = X(x0 + u * (x1 - x0));
          const t = (u - 0.5) * 2;
          out.set(
            x,
            vY + Math.sqrt(Math.max(0, 1 - t * t)) * 1.5,
            Z(-7 + v * 14),
          );
        },
        12,
        5,
        {},
      );
      b.add("brick_fed", g, { grime: 0.6, noAO: true });
    }
    // central arcade between the two vaults: piers with a wide gap (z -0.6..2.6) and a clear run to the tunnel (z > 4.6)
    for (const [z0, z1] of [
      [-7, -0.6],
      [2.6, 4.6],
    ]) {
      b.boxMM(
        "schist",
        X(-0.3),
        oy + CEL,
        Z(z0),
        X(0.3),
        oy + CEL + 2.2,
        Z(z1),
        { seg: false, grime: 0.6 },
      );
      PF.colMM(X(-0.3), oy + CEL, Z(z0), X(0.3), oy - 0.4, Z(z1), {
        walkable: false,
      });
    }
    b.boxMM(
      "schist",
      X(-0.3),
      oy + CEL + 2.0,
      Z(-7),
      X(0.3),
      oy + CEL + 2.3,
      Z(7),
      { seg: false },
    );
    // barrel racks, the still, sacks, a hidden ale stash
    for (let i = 0; i < 5; i++)
      for (let k = 0; k < 2; k++) {
        const g = new THREE.CylinderGeometry(0.4, 0.4, 0.9, 12);
        g.rotateZ(HP);
        b.add("oak", g, {
          m: PF.m4(X(-7.4), oy + CEL + 0.45 + k * 0.8, Z(-6 + i * 1.0)),
          grime: 0.5,
        });
      }
    PF.colMM(X(-8), oy + CEL, Z(-6.5), X(-6.8), oy + CEL + 1.7, Z(-1.5), {
      walkable: false,
    });
    b.cyl("copper", X(5.5), oy + CEL, Z(-5), 0.7, 0.8, 1.2, 12, { hSeg: 1 });
    b.sphere("copper", X(5.5), oy + CEL + 1.25, Z(-5), 0.65, {
      ws: 10,
      hs: 6,
      phiLen: PI / 2,
    });
    b.rod("copper", P(5.5, CEL + 1.8, -5), P(7.2, CEL + 1.3, -5), 0.07, 6);
    PF.col(X(5.8), Z(-5), 2.4, 1.6, oy + CEL, oy + CEL + 1.9, 0, {
      walkable: false,
    });
    for (let i = 0; i < 7; i++)
      b.sphere(
        "sandbag",
        X(-5 + (i % 4) * 0.8),
        oy + CEL + 0.3,
        Z(5.6 + Math.floor(i / 4) * 0.7),
        0.36,
        { sy: 0.85 },
      );
    D.crates(b, X(6.6), oy + CEL, Z(5.4), 2, 44, true);
    PF.skeleton(b, X(-3), oy + CEL + 0.02, Z(-2.5), 1.3);
    anchors.cellar = A(3.0, CEL, -5.8, PI);
    anchors.cellar_stash = A(-7.2, CEL, 3.5, HP);
    // the smugglers' tunnel (south, x -0.8..0.8, z 7.4..14) → bulkhead to the courtyard
    b.boxMM("dirt", X(-0.9), oy + CEL - 0.4, Z(7), X(0.9), oy + CEL, Z(14), {
      grime: 0.6,
    });
    PF.colMM(X(-0.9), oy + CEL - 0.4, Z(7), X(0.9), oy + CEL, Z(14), {
      surface: "dirt",
    });
    W("schist", "z", 7.4, 14.5, -1.5, -0.9, CEL, CEL + 2.2);
    W("schist", "z", 7.4, 14.5, 0.9, 1.5, CEL, CEL + 2.2);
    W("schist", "x", -1.5, 1.5, 14, 14.5, CEL, CEL + 2.2);
    b.boxMM(
      "rotten",
      X(-0.9),
      oy + CEL + 2.1,
      Z(7.4),
      X(0.9),
      oy + CEL + 2.3,
      Z(14),
      { seg: false },
    );
    for (let z = 8; z < 14; z += 1.2)
      for (const sx of [-1, 1])
        b.box("rotten", X(sx * 0.8), oy + CEL, Z(z), 0.14, 2.1, 0.14, {
          seg: false,
        });
    b.box("oak", X(0), oy + CEL + 0.9, Z(13.9), 1.4, 1.2, 0.1, {
      rx: 0.5,
      seg: false,
    });
    const tunnelK = PF.texMat(
      "ft_tunnel",
      PF.signTex(
        "ft_tunnel",
        ["SONS OF LIBERTY", "DEATH TO TYRANTS", "— & TAXMEN —"],
        "raider",
        512,
        192,
        { bg: "#4a4034", fg: "#e8d8b8" },
      ),
    );
    b.quad(tunnelK, X(-0.88), oy + CEL + 1.4, Z(10.5), 1.2, 0.45, { ry: HP });
    anchors.tunnel = A(0, CEL, 12.6, PI);

    const g = b.build(root, { lodDistInt: 300 });
    g.name = "fraunces_interior";
    return anchors;
  }
  /** Windsor chair (spindle back) — delicate, for the Long Room and taproom. */
