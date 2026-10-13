/* src/poi_eastside/06_dress2.js */
/* =====================================================================
 * NEW RAD CITY — POI EASTSIDE · 06 extra set dressing
 * Newsroom & office furniture (desks, typewriters, phones, lamps, file
 * cabinets, teletypes), industrial bits (girders, catwalk decks,
 * fluorescent fixtures), street kit (sandbag walls, scrap booths, NYC
 * rooftop water tower, lattice antenna), raider clutter (spikes, cages,
 * mattresses) and bones / nests for the ash bear den.
 * All geometry goes into a site's batch (local coordinates).
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE || !G._pe) return;
  const P = G._pe;
  const TAU = P.TAU,
    PI = P.PI,
    HP = P.HP;
  const D = P.dress;
  const E = (P.dress2 = {});

  // ---------------------------------------------------------------
  // Office
  // ---------------------------------------------------------------
  /** Steel/oak office desk, front (+z local) toward the chair. o: {w, wood, clutter, lamp (S)} */
  E.desk = function (b, x, y, z, ry, o) {
    o = o || {};
    const M = P.m4(x, y, z, ry),
      w = o.w || 1.5,
      d = o.d || 0.75,
      k = o.key || "wood_dark";
    const add = (key, g, oo) =>
      b.geo(key, g, M, Object.assign({ noAO: true, grime: 0.35 }, oo || {}));
    add(k, new THREE.BoxGeometry(w, 0.05, d).translate(0, 0.74, 0));
    add(
      k,
      new THREE.BoxGeometry(0.42, 0.7, d - 0.06).translate(
        w / 2 - 0.23,
        0.36,
        0,
      ),
    );
    add(
      k,
      new THREE.BoxGeometry(0.04, 0.7, d - 0.06).translate(
        -w / 2 + 0.03,
        0.36,
        0,
      ),
    );
    add(
      k,
      new THREE.BoxGeometry(w - 0.1, 0.5, 0.03).translate(
        0,
        0.45,
        -d / 2 + 0.04,
      ),
    );
    for (let i = 0; i < 3; i++)
      add(
        "brass",
        new THREE.BoxGeometry(0.12, 0.02, 0.02).translate(
          w / 2 - 0.23,
          0.18 + i * 0.22,
          d / 2 - 0.02,
        ),
      );
    if (o.clutter !== false) {
      const r = P.rng(x * 7.1 + z * 3.3);
      for (let i = 0; i < 3; i++)
        add(
          "paper",
          new THREE.BoxGeometry(0.22, 0.01, 0.3)
            .rotateY(r() * 2)
            .translate(
              (r() - 0.5) * w * 0.7,
              0.77 + i * 0.004,
              (r() - 0.5) * d * 0.5,
            ),
        );
      if (r() < 0.6)
        add(
          "newsprint",
          new THREE.BoxGeometry(0.3, 0.08 + r() * 0.15, 0.4).translate(
            -w / 2 + 0.25,
            0.8,
            -0.1,
          ),
          { uv: "box" },
        );
      if (r() < 0.5)
        add(
          "paint_white",
          new THREE.CylinderGeometry(0.04, 0.035, 0.1, 6).translate(
            w / 2 - 0.3,
            0.82,
            0.15,
          ),
        );
    }
    if (o.typewriter !== false) E.typewriter(b, 0, 0.765, 0.05, 0, M);
    if (o.phone) E.phone(b, -w / 2 + 0.25, 0.765, 0.15, 0.3, M);
  };
  /** Typewriter on a desk top. (lx,ly,lz,lry) local to M (or world when no M). */
  E.typewriter = function (b, lx, ly, lz, lry, M) {
    const m = (M ? M.clone() : new THREE.Matrix4()).multiply(
      P.m4(lx, ly, lz, lry),
    );
    const add = (key, g) => b.geo(key, g, m, { noAO: true, grime: 0.3 });
    add(
      "press_dark",
      new THREE.BoxGeometry(0.44, 0.1, 0.34).translate(0, 0.05, 0),
    );
    add(
      "press_dark",
      new THREE.BoxGeometry(0.4, 0.08, 0.16)
        .rotateX(-0.35)
        .translate(0, 0.1, 0.1),
    );
    add(
      "chrome",
      new THREE.CylinderGeometry(0.035, 0.035, 0.52, 8)
        .rotateZ(HP)
        .translate(0, 0.16, -0.1),
    );
    add(
      "paper",
      new THREE.BoxGeometry(0.22, 0.26, 0.004)
        .rotateX(-0.25)
        .translate(0, 0.3, -0.13),
    );
    for (let r = 0; r < 3; r++)
      for (let i = 0; i < 8; i++)
        add(
          "paint_white",
          new THREE.CylinderGeometry(0.012, 0.012, 0.02, 5).translate(
            -0.14 + i * 0.04,
            0.14 + r * 0.02,
            0.05 + r * 0.045,
          ),
        );
  };
  E.phone = function (b, lx, ly, lz, lry, M) {
    const m = (M ? M.clone() : new THREE.Matrix4()).multiply(
      P.m4(lx, ly, lz, lry),
    );
    b.geo(
      "paint_black",
      new THREE.BoxGeometry(0.2, 0.08, 0.22).translate(0, 0.04, 0),
      m,
      { noAO: true },
    );
    b.geo(
      "paint_black",
      new THREE.CylinderGeometry(0.03, 0.03, 0.22, 6)
        .rotateZ(HP)
        .translate(0, 0.11, 0),
      m,
      { noAO: true },
    );
    b.geo(
      "chrome",
      new THREE.CylinderGeometry(0.05, 0.05, 0.01, 10).translate(
        0,
        0.085,
        0.05,
      ),
      m,
      { noAO: true },
    );
  };
  /** Green banker's desk lamp; adds a small baked light + glow when lit. */
  E.deskLamp = function (S, x, y, z, lit) {
    const b = S.b;
    b.cyl("brass", x, y, z, 0.06, 0.08, 0.03, 8, { noAO: true });
    b.rod("brass", [x, y, z], [x, y + 0.32, z - 0.04], 0.012, 4, {
      noAO: true,
    });
    b.cyl("paint_green", x, y + 0.3, z, 0.07, 0.12, 0.08, 10, {
      rz: 0.1,
      noAO: true,
      open: true,
    });
    if (lit) {
      b.sphere("lamp", x, y + 0.29, z, 0.035, { ws: 5, hs: 4 });
      S.light(x, y + 0.2, z, 0xffd8a0, 3.2, 0.7);
      S.glow(x, y + 0.25, z, 0xffd8a0, 0.35);
    }
  };
  /** Visual four-drawer file cabinet (no container). */
  E.cabinet = function (b, x, y, z, ry, o) {
    o = o || {};
    const M = P.m4(x, y, z, ry),
      k = o.key || "metal";
    b.geo(k, new THREE.BoxGeometry(0.5, 1.35, 0.62).translate(0, 0.675, 0), M, {
      noAO: true,
      grime: 0.4,
    });
    for (let i = 0; i < 4; i++) {
      const open = o.open && i === 1 ? 0.3 : 0;
      b.geo(
        k,
        new THREE.BoxGeometry(0.46, 0.29, 0.03).translate(
          0,
          0.2 + i * 0.32,
          0.31 + open,
        ),
        M,
        { noAO: true },
      );
      b.geo(
        "chrome",
        new THREE.BoxGeometry(0.14, 0.025, 0.03).translate(
          0,
          0.25 + i * 0.32,
          0.34 + open,
        ),
        M,
        { noAO: true },
      );
      if (open)
        b.geo(
          "paper",
          new THREE.BoxGeometry(0.42, 0.22, 0.28).translate(
            0,
            0.25 + i * 0.32,
            0.18 + open,
          ),
          M,
          { noAO: true },
        );
    }
  };
  /** Teletype / wire machine on a stand, paper tape spilling out. */
  E.teletype = function (b, x, y, z, ry) {
    const M = P.m4(x, y, z, ry);
    b.geo(
      "press_green",
      new THREE.BoxGeometry(0.7, 0.72, 0.55).translate(0, 0.36, 0),
      M,
      { noAO: true },
    );
    b.geo(
      "press_green",
      new THREE.BoxGeometry(0.66, 0.34, 0.5).translate(0, 0.9, 0),
      M,
      { noAO: true },
    );
    b.geo(
      "glass_dark",
      new THREE.BoxGeometry(0.5, 0.18, 0.02).translate(0, 0.95, 0.25),
      M,
      { noAO: true },
    );
    b.geo(
      "paper",
      new THREE.BoxGeometry(0.3, 0.5, 0.005)
        .rotateX(0.4)
        .translate(0, 1.05, -0.2),
      M,
      { noAO: true },
    );
    b.geo(
      "paper",
      new THREE.BoxGeometry(0.3, 0.005, 0.9).translate(0, 0.01, 0.7),
      M,
      { noAO: true },
    );
  };

  // ---------------------------------------------------------------
  // Lighting fixtures
  // ---------------------------------------------------------------
  /** Hanging enamel shade lamp on a chain. */
  E.hangLamp = function (S, x, y, z, o) {
    o = o || {};
    const b = S.b,
      ch = o.chain || 1.2;
    b.rod("iron", [x, y, z], [x, y - ch, z], 0.012, 3, { noAO: true });
    b.cyl(o.shade || "paint_green", x, y - ch - 0.18, z, 0.06, 0.28, 0.2, 12, {
      open: true,
      noAO: true,
    });
    if (o.lit !== false) {
      b.sphere("lamp", x, y - ch - 0.2, z, 0.06, { ws: 6, hs: 4 });
      S.light(
        x,
        y - ch - 0.35,
        z,
        o.color || 0xffd8a0,
        o.r || 6.5,
        o.i || 0.85,
      );
      S.glow(x, y - ch - 0.25, z, o.color || 0xffd8a0, o.size || 0.55);
    } else b.sphere("glass_dark", x, y - ch - 0.2, z, 0.06, { ws: 6, hs: 4 });
  };
  /** Twin-tube fluorescent fixture hanging from rods (cool light). */
  E.tube = function (S, x, y, z, ry, o) {
    o = o || {};
    const b = S.b,
      L = o.len || 2.4,
      M = P.m4(x, y, z, ry);
    for (const s of [-1, 1])
      b.geo(
        "iron",
        new THREE.CylinderGeometry(0.008, 0.008, o.drop || 0.8, 3).translate(
          s * L * 0.4,
          (o.drop || 0.8) / 2,
          0,
        ),
        M,
        { noAO: true },
      );
    b.geo("metal", new THREE.BoxGeometry(L, 0.06, 0.28).translate(0, 0, 0), M, {
      noAO: true,
    });
    const lit = o.lit !== false;
    for (const s of [-1, 1])
      b.geo(
        lit ? "lamp_cool" : "glass_dark",
        new THREE.CylinderGeometry(0.025, 0.025, L - 0.1, 6)
          .rotateZ(HP)
          .translate(0, -0.05, s * 0.07),
        M,
        { noAO: true },
      );
    if (lit) {
      const p = new THREE.Vector3(0, -0.3, 0).applyMatrix4(M);
      S.light(p.x, p.y, p.z, o.color || 0xdce8ff, o.r || 9, o.i || 0.9);
      if (o.glow !== false)
        S.glow(p.x, p.y + 0.2, p.z, o.color || 0xdce8ff, o.size || 0.8);
    }
  };

  // ---------------------------------------------------------------
  // Structure / ruin
  // ---------------------------------------------------------------
  /** I-beam from a to b (square-ish rod with flanges). */
  E.girder = function (b, a, c, s, key) {
    s = s || 0.18;
    key = key || "rust";
    b.rod(key, a, c, s * 0.25, 4, { square: true, r2: s, noAO: true });
    b.rod(key, a, c, s, 4, { square: true, r2: s * 0.12, noAO: true });
  };
  /** Steel-grate catwalk deck with collider (walkable) and optional rails. */
  E.catwalk = function (S, x0, z0, x1, z1, y, o) {
    o = o || {};
    S.b.box(o.key || "panel", x0, y - 0.08, z0, x1, y, z1, {
      seg: false,
      grime: 0.3,
    });
    S.col(x0, y - 0.25, z0, x1, y, z1, { surface: "metal" });
    // under-frame
    const alongX = Math.abs(x1 - x0) > Math.abs(z1 - z0);
    if (alongX) {
      for (const zz of [z0 + 0.05, z1 - 0.05])
        S.b.box("iron", x0, y - 0.3, zz - 0.04, x1, y - 0.08, zz + 0.04, {
          seg: false,
        });
    } else {
      for (const xx of [x0 + 0.05, x1 - 0.05])
        S.b.box("iron", xx - 0.04, y - 0.3, z0, xx + 0.04, y - 0.08, z1, {
          seg: false,
        });
    }
    if (o.rails)
      for (const side of o.rails) {
        if (side === "n")
          S.rail(
            "iron",
            [
              [x0, z0 + 0.04],
              [x1, z0 + 0.04],
            ],
            y,
            1.0,
            { r: 0.03, step: 1.2 },
          );
        if (side === "s")
          S.rail(
            "iron",
            [
              [x0, z1 - 0.04],
              [x1, z1 - 0.04],
            ],
            y,
            1.0,
            { r: 0.03, step: 1.2 },
          );
        if (side === "w")
          S.rail(
            "iron",
            [
              [x0 + 0.04, z0],
              [x0 + 0.04, z1],
            ],
            y,
            1.0,
            { r: 0.03, step: 1.2 },
          );
        if (side === "e")
          S.rail(
            "iron",
            [
              [x1 - 0.04, z0],
              [x1 - 0.04, z1],
            ],
            y,
            1.0,
            { r: 0.03, step: 1.2 },
          );
      }
    if (o.posts) {
      const n = Math.max(
        1,
        Math.round((alongX ? Math.abs(x1 - x0) : Math.abs(z1 - z0)) / 4),
      );
      for (let i = 0; i <= n; i++) {
        const t = i / n;
        const px = alongX ? x0 + (x1 - x0) * t : (x0 + x1) / 2,
          pz = alongX ? (z0 + z1) / 2 : z0 + (z1 - z0) * t;
        S.b.box(
          "iron",
          px - 0.06,
          o.posts,
          pz - 0.06,
          px + 0.06,
          y - 0.3,
          pz + 0.06,
          { seg: false },
        );
      }
    }
  };

  // ---------------------------------------------------------------
  // Street / settlement kit
  // ---------------------------------------------------------------
  /** Row of sandbags from (x0,z0) to (x1,z1), n layers high, with collider. */
  E.sandbags = function (S, x0, z0, x1, z1, y, layers, o) {
    o = o || {};
    const b = S.b,
      L = Math.hypot(x1 - x0, z1 - z0),
      n = Math.max(1, Math.round(L / 0.62)),
      ang = Math.atan2(z1 - z0, x1 - x0);
    const r = P.rng(x0 * 3 + z0 * 5);
    for (let l = 0; l < (layers || 3); l++) {
      for (let i = 0; i < n - (l % 2); i++) {
        const t = (i + 0.5 + (l % 2) * 0.5) / n;
        const px = x0 + (x1 - x0) * t,
          pz = z0 + (z1 - z0) * t;
        const g = new THREE.SphereGeometry(0.3, 7, 4).scale(1.05, 0.42, 0.62);
        b.geo(
          o.key || "burlap",
          g,
          P.m4(px, y + 0.12 + l * 0.24, pz, -ang + (r() - 0.5) * 0.15),
          { noAO: true, grime: 0.5 },
        );
      }
    }
    if (o.col !== false)
      S.colR(
        (x0 + x1) / 2,
        (z0 + z1) / 2,
        L,
        0.7,
        y,
        y + (layers || 3) * 0.24 + 0.1,
        -ang,
        { walkable: false },
      );
  };
  /** Corrugated scrap booth / kiosk (3 walls + slanted roof) facing ry. */
  E.booth = function (S, x, y, z, ry, o) {
    o = o || {};
    const b = S.b,
      w = o.w || 2.2,
      d = o.d || 1.6,
      h = o.h || 2.4,
      M = P.m4(x, y, z, ry);
    const k = o.key || "corrugated";
    b.geo(k, new THREE.BoxGeometry(w, h, 0.06).translate(0, h / 2, -d / 2), M, {
      grime: 0.6,
    });
    for (const s of [-1, 1])
      b.geo(
        k,
        new THREE.BoxGeometry(0.06, h, d).translate((s * w) / 2, h / 2, 0),
        M,
        { grime: 0.6 },
      );
    b.geo(
      o.counter || "wood_rotten",
      new THREE.BoxGeometry(w, 1.0, 0.3).translate(0, 0.5, d / 2 - 0.15),
      M,
      { grime: 0.5 },
    );
    b.geo(
      k,
      new THREE.BoxGeometry(w + 0.4, 0.06, d + 0.8)
        .rotateX(0.12)
        .translate(0, h + 0.1, 0.2),
      M,
      { grime: 0.6 },
    );
    for (const s of [-1, 1])
      b.geo(
        "wood_rotten",
        new THREE.BoxGeometry(0.08, h + 0.2, 0.08).translate(
          s * (w / 2 + 0.1),
          (h + 0.2) / 2,
          d / 2 + 0.5,
        ),
        M,
      );
    const c = new THREE.Vector3(0, 0, 0).applyMatrix4(M);
    S.colR(c.x, c.z, w + 0.1, d, y, y + h, ry, { walkable: false });
  };
  /** Classic NYC rooftop water tower (wooden tank, conical cap, steel legs). */
  E.waterTower = function (b, x, y, z, s) {
    s = s || 1;
    const legH = 3.2 * s,
      R = 2.1 * s,
      H = 4.2 * s;
    for (const [lx, lz] of [
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 1],
    ])
      b.rod(
        "rust",
        [x + lx * R * 0.7, y, z + lz * R * 0.7],
        [x + lx * R * 0.62, y + legH, z + lz * R * 0.62],
        0.12 * s,
        5,
      );
    for (const [a, c] of [
      [
        [-1, -1],
        [1, 1],
      ],
      [
        [1, -1],
        [-1, 1],
      ],
    ])
      b.rod(
        "rust",
        [x + a[0] * R * 0.7, y + 0.3, z + a[1] * R * 0.7],
        [x + c[0] * R * 0.62, y + legH, z + c[1] * R * 0.62],
        0.04 * s,
        3,
      );
    b.box(
      "rust",
      x - R * 0.8,
      y + legH - 0.2,
      z - R * 0.8,
      x + R * 0.8,
      y + legH,
      z + R * 0.8,
      { seg: false },
    );
    b.cyl("wood_rotten", x, y + legH, z, R, R * 1.03, H, 16, { hSeg: 3 });
    for (let i = 0; i < 4; i++)
      b.torus(
        "iron",
        x,
        y + legH + 0.4 + (i * (H - 0.7)) / 3,
        z,
        R * 1.02 + 0.02,
        0.035 * s,
        TAU,
        { rx: HP, ts: 24, rs: 4 },
      );
    b.cyl("tar", x, y + legH + H, z, 0.1, R * 1.08, 1.4 * s, 16);
    b.cyl("iron", x, y + legH + H + 1.3 * s, z, 0.08, 0.08, 0.5 * s, 6);
  };
  /** Lattice radio mast with red beacon (adds glow via S). */
  E.mast = function (S, x, y, z, h, o) {
    o = o || {};
    const b = S.b,
      w = o.w || 0.9,
      n = Math.max(2, Math.round(h / 1.6));
    for (const [lx, lz] of [
      [-1, -1],
      [1, -1],
      [1, 1],
      [-1, 1],
    ])
      b.rod(
        "iron",
        [x + (lx * w) / 2, y, z + (lz * w) / 2],
        [x + lx * w * 0.18, y + h, z + lz * w * 0.18],
        0.05,
        4,
      );
    for (let i = 0; i < n; i++) {
      const t0 = i / n,
        t1 = (i + 1) / n,
        w0 = (w / 2) * (1 - t0 * 0.64),
        w1 = (w / 2) * (1 - t1 * 0.64),
        y0 = y + h * t0,
        y1 = y + h * t1;
      b.rod("iron", [x - w0, y0, z - w0], [x + w1, y1, z - w1], 0.02, 3);
      b.rod("iron", [x + w0, y0, z + w0], [x - w1, y1, z + w1], 0.02, 3);
      b.rod("iron", [x - w0, y0, z + w0], [x - w1, y1, z - w1], 0.02, 3);
      b.rod("iron", [x + w0, y0, z - w0], [x + w1, y1, z + w1], 0.02, 3);
    }
    b.sphere("lamp_red", x, y + h + 0.15, z, 0.18, { ws: 6, hs: 5 });
    S.glow(x, y + h + 0.15, z, 0xff3020, o.glow || 2.2, { flicker: 0.1 });
    if (o.dish) {
      b.sphere("metal", x + 0.5, y + h * 0.7, z, 0.6, {
        pl: PI,
        sx: 0.4,
        ry: HP,
      });
    }
  };
  /** Wooden spike / pike with a skull (raider decor). */
  E.pike = function (b, x, y, z, h) {
    h = h || 2.2;
    b.rod("wood_rotten", [x, y, z], [x, y + h, z], 0.04, 4, { rTop: 0.01 });
    b.sphere("bone", x, y + h - 0.2, z, 0.11, { ws: 6, hs: 5, sy: 1.15 });
    b.box(
      "bone",
      x - 0.06,
      y + h - 0.36,
      z - 0.05,
      x + 0.06,
      y + h - 0.28,
      z + 0.07,
      { seg: false, noAO: true },
    );
  };
  /** Hanging raider cage (iron bars) at (x,y top,z); optional skeleton heap inside. */
  E.cage = function (b, x, y, z, o) {
    o = o || {};
    const R = o.r || 0.55,
      H = o.h || 1.8;
    b.rod("iron", [x, y, z], [x, y - (o.chain || 0.6), z], 0.02, 3);
    const top = y - (o.chain || 0.6);
    b.cyl("rust", x, top - 0.06, z, R, R, 0.06, 10);
    b.cyl("rust", x, top - H, z, R, R, 0.06, 10);
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * TAU;
      b.rod(
        "rust",
        [x + Math.cos(a) * R, top - H, z + Math.sin(a) * R],
        [x + Math.cos(a) * R, top, z + Math.sin(a) * R],
        0.015,
        3,
      );
    }
    if (o.bones) {
      b.sphere("bone", x, top - H + 0.15, z + 0.1, 0.1, { ws: 5, hs: 4 });
      for (let i = 0; i < 5; i++)
        b.rod(
          "bone",
          [x - 0.2 + i * 0.08, top - H + 0.08, z - 0.2],
          [x - 0.1 + i * 0.06, top - H + 0.1, z + 0.25],
          0.02,
          3,
        );
    }
  };
  /** Mattress on the floor (visual). */
  E.mattress = function (b, x, y, z, ry, o) {
    o = o || {};
    b.box(
      o.key || "fabric",
      x - 0.45,
      y,
      z - 0.95,
      x + 0.45,
      y + 0.16,
      z + 0.95,
      { ry, seg: false, grime: 0.8, noAO: true },
    );
  };

  // ---------------------------------------------------------------
  // Den / bones
  // ---------------------------------------------------------------
  /** Scatter of long bones, ribs and skulls. */
  E.bones = function (b, x, y, z, r, n, o) {
    o = o || {};
    const rn = P.rng(x * 13.7 + z * 2.9 + y);
    for (let i = 0; i < (n || 10); i++) {
      const a = rn() * TAU,
        d = Math.sqrt(rn()) * r,
        px = x + Math.cos(a) * d,
        pz = z + Math.sin(a) * d;
      const k = rn();
      if (k < 0.18)
        b.sphere("bone", px, y + 0.09, pz, 0.1 + rn() * 0.05, {
          ws: 6,
          hs: 5,
          sy: 0.9,
        });
      else if (k < 0.3) {
        for (let j = 0; j < 5; j++)
          b.torus("bone", px, y + 0.05, pz + j * 0.08, 0.16, 0.015, PI, {
            ry: rn(),
            rs: 3,
            ts: 8,
          });
      } else {
        const L = 0.25 + rn() * 0.4,
          aa = rn() * TAU;
        b.rod(
          o.key || "bone",
          [px, y + 0.03, pz],
          [
            px + Math.cos(aa) * L,
            y + 0.03 + rn() * 0.08,
            pz + Math.sin(aa) * L,
          ],
          0.025,
          4,
          { noAO: true },
        );
      }
    }
  };
  /** ash bear nest: ring of torn mattresses / fur / branches with bones in the bowl. */
  E.nest = function (S, x, y, z, R, o) {
    o = o || {};
    const b = S.b,
      rn = P.rng(x * 3.1 + z * 1.3);
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * TAU + rn() * 0.2,
        d = R * (0.75 + rn() * 0.3);
      b.rock(
        i % 3 === 0 ? "fabric" : "fur",
        x + Math.cos(a) * d,
        y + 0.15,
        z + Math.sin(a) * d,
        0.5 + rn() * 0.4,
        { flat: 0.5, rough: 0.8, seed: i * 1.7 },
      );
    }
    for (let i = 0; i < 16; i++) {
      const a = rn() * TAU,
        d = R * (0.5 + rn() * 0.6);
      b.rod(
        "wood_rotten",
        [x + Math.cos(a) * d, y + 0.1, z + Math.sin(a) * d],
        [
          x + Math.cos(a + 0.6) * d * 0.9,
          y + 0.25 + rn() * 0.2,
          z + Math.sin(a + 0.6) * d * 0.9,
        ],
        0.04,
        4,
        { noAO: true },
      );
    }
    b.cyl("fur", x, y, z, R * 0.8, R * 0.85, 0.08, 16, { noAO: true });
    E.bones(b, x, y + 0.08, z, R * 0.7, o.bones || 16);
  };
})();
