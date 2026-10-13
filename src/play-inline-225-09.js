// play-inline-225 09 — math
// Lines 2285-2623 of readable/play-inline-225.pretty.js (statement-aligned).
  A.arch = function (C, key, cx, springY, cz, w, d, thick, axis, o) {
    o = o || {};
    const b = o.batch || C.b;
    const R = w / 2,
      n = 12,
      pts = [];
    for (let i = 0; i <= n; i++) {
      const a = (Math.PI * i) / n;
      pts.push([Math.cos(a) * (R + thick), Math.sin(a) * (R + thick)]);
    }
    for (let i = n; i >= 0; i--) {
      const a = (Math.PI * i) / n;
      pts.push([Math.cos(a) * R, Math.sin(a) * R]);
    }
    const ry = axis === "z" ? Math.PI / 2 : 0;
    const m = M4(cx, springY, cz, ry).multiply(
      new THREE.Matrix4().makeTranslation(0, 0, -d / 2),
    );
    b.extrude(key, pts, d, { m });
  };
  /** Pendant lamp: cord, shade, glowing bulb; adds a baked light. */
  A.pendant = function (C, x, y, z, ceilY, o) {
    o = o || {};
    const b = o.batch || C.b;
    b.rod(o.cord || "iron", [x, y + 0.3, z], [x, ceilY, z], 0.012);
    b.lathe(
      o.shade || "brass",
      [
        [0.05, 0.3],
        [0.08, 0.26],
        [0.3, 0.02],
        [0.32, 0],
      ],
      10,
      x,
      y,
      z,
    );
    b.sphere(o.bulb || "lamp", x, y + 0.02, z, 0.1, { ws: 8, hs: 6 });
    if (o.light !== false)
      b.light(
        x,
        y - 0.3,
        z,
        o.color === undefined ? 0xffd8a0 : o.color,
        o.r || 9,
        o.i || 1,
      );
  };
  /** Wall sconce facing direction yaw (ry = three.js rotation of the fixture; +z faces out). */
  A.sconce = function (C, x, y, z, ry, o) {
    o = o || {};
    const b = o.batch || C.b;
    const s = Math.sin(ry),
      c = Math.cos(ry);
    b.obox(o.metal || "brass", x, y, z, 0.18, 0.3, 0.06, ry);
    b.lathe(
      o.metal || "brass",
      [
        [0.02, 0],
        [0.14, 0.22],
        [0.15, 0.24],
        [0, 0.24],
      ],
      8,
      x + s * 0.14,
      y,
      z + c * 0.14,
    );
    b.sphere(o.bulb || "lamp", x + s * 0.14, y + 0.2, z + c * 0.14, 0.07, {
      ws: 6,
      hs: 5,
    });
    if (o.light !== false)
      b.light(
        x + s * 0.5,
        y + 0.2,
        z + c * 0.5,
        o.color === undefined ? 0xffcf90 : o.color,
        o.r || 6,
        o.i || 0.7,
      );
  };
  /** Fluorescent tube fixture (ceiling-hung), along x (ry rotates). dead → dark tube. */
  A.tube = function (C, x, y, z, ry, len, o) {
    o = o || {};
    const b = o.batch || C.b;
    len = len || 1.3;
    b.obox("metal_painted", x, y + 0.06, z, len + 0.1, 0.08, 0.28, ry, {
      c: 0xd8d8d0,
    });
    b.obox(
      o.dead ? "glass_dark" : o.color || "lamp_cool",
      x,
      y - 0.01,
      z,
      len,
      0.05,
      0.08,
      ry,
    );
    if (!o.dead && o.light !== false)
      b.light(
        x,
        y - 0.4,
        z,
        o.lc === undefined ? 0xe0f0ff : o.lc,
        o.r || 8,
        o.i || 0.9,
      );
  };
  /** Chandelier: tiers of candle bulbs. */
  A.chandelier = function (C, x, y, z, ceilY, R, o) {
    o = o || {};
    const b = o.batch || C.b;
    R = R || 0.9;
    b.rod("brass", [x, y + 0.6, z], [x, ceilY, z], 0.02);
    b.lathe(
      "brass",
      [
        [0, 0],
        [0.12, 0.05],
        [0.18, 0.3],
        [0.08, 0.6],
        [0.03, 0.62],
      ],
      8,
      x,
      y,
      z,
    );
    for (const [rr, yy, n] of [
      [R, 0.25, 10],
      [R * 0.6, 0.5, 6],
    ]) {
      b.torus("brass", x, y + yy, z, rr, 0.02, { ts: 20 });
      for (let i = 0; i < n; i++) {
        const a = (i / n) * TAU;
        b.sphere(
          o.bulb || "lamp",
          x + Math.cos(a) * rr,
          y + yy + 0.08,
          z + Math.sin(a) * rr,
          0.045,
          { ws: 5, hs: 4 },
        );
      }
    }
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * TAU;
      b.rod(
        "glass",
        [x + Math.cos(a) * R, y + 0.2, z + Math.sin(a) * R],
        [
          x + Math.cos(a) * R * 0.95,
          y - 0.35 - (i % 3) * 0.1,
          z + Math.sin(a) * R * 0.95,
        ],
        0.012,
        { seg: 4 },
      );
    }
    if (o.light !== false)
      b.light(
        x,
        y - 0.2,
        z,
        o.color === undefined ? 0xffdca8 : o.color,
        o.r || 12,
        o.i || 1.1,
      );
  };

  // =====================================================================
  // Furniture kit (visual; colliders where it matters)
  // =====================================================================
  const F = (LI.furn = {});
  const rot = (x, z, cx, cz, ry) => {
    const s = Math.sin(ry),
      c = Math.cos(ry);
    return [cx + x * c + z * s, cz - x * s + z * c];
  };
  LI.rot = rot;
  F.chair = function (C, x, y, z, ry, o) {
    o = o || {};
    const b = o.batch || C.b,
      k = o.key || "wood_dark";
    if (o.toppled) {
      b.obox(k, x, y + 0.22, z, 0.46, 0.05, 0.46, ry, {
        rx: Math.PI / 2 - 0.2,
      });
      b.obox(k, x, y + 0.05, z + 0.2, 0.46, 0.5, 0.05, ry, { rx: 0.1 });
      return;
    }
    b.obox(k, x, y + 0.45, z, 0.46, 0.05, 0.46, ry);
    const back = rot(0, 0.21, x, z, ry);
    b.obox(k, back[0], y + 0.72, back[1], 0.46, 0.5, 0.05, ry);
    for (const [lx, lz] of [
      [-0.2, -0.2],
      [0.2, -0.2],
      [-0.2, 0.2],
      [0.2, 0.2],
    ]) {
      const p = rot(lx, lz, x, z, ry);
      b.box(
        k,
        p[0] - 0.025,
        y,
        p[1] - 0.025,
        p[0] + 0.025,
        y + 0.45,
        p[1] + 0.025,
      );
    }
    if (o.seat) {
      b.obox(o.seat, x, y + 0.49, z, 0.44, 0.05, 0.42, ry);
      b.obox(o.seat, back[0], y + 0.74, back[1] - 0.01, 0.42, 0.4, 0.04, ry);
    }
  };
  F.table = function (C, x, y, z, w, d, ry, o) {
    o = o || {};
    const b = o.batch || C.b,
      k = o.key || "wood_dark",
      h = o.h || 0.76;
    b.obox(k, x, y + h - 0.03, z, w, 0.06, d, ry);
    for (const [lx, lz] of [
      [-w / 2 + 0.06, -d / 2 + 0.06],
      [w / 2 - 0.06, -d / 2 + 0.06],
      [-w / 2 + 0.06, d / 2 - 0.06],
      [w / 2 - 0.06, d / 2 - 0.06],
    ]) {
      const p = rot(lx, lz, x, z, ry);
      b.box(
        k,
        p[0] - 0.03,
        y,
        p[1] - 0.03,
        p[0] + 0.03,
        y + h - 0.06,
        p[1] + 0.03,
      );
    }
    if (o.col !== false)
      C.colRot(x, z, w, d, y, y + h, ry, { walkable: false, surface: "wood" });
  };
  F.desk = function (C, x, y, z, w, d, ry, o) {
    o = o || {};
    const b = o.batch || C.b,
      k = o.key || "wood_dark";
    b.obox(k, x, y + 0.74, z, w + 0.04, 0.05, d + 0.04, ry);
    for (const s of [-1, 1]) {
      const p = rot(s * (w / 2 - 0.22), 0, x, z, ry);
      b.obox(k, p[0], y + 0.36, p[1], 0.42, 0.72, d, ry);
    }
    const mp = rot(0, d / 2 - 0.03, x, z, ry);
    b.obox(k, mp[0], y + 0.45, mp[1], w - 0.9, 0.5, 0.03, ry);
    if (o.col !== false)
      C.colRot(x, z, w, d, y, y + 0.77, ry, {
        walkable: false,
        surface: "wood",
      });
  };
  /** CRT monitor (screen glowing) on a surface at y. */
  F.monitor = function (C, x, y, z, ry, o) {
    o = o || {};
    const b = o.batch || C.b;
    b.obox(o.key || "metal_painted", x, y + 0.2, z, 0.42, 0.38, 0.4, ry, {
      c: o.c || 0xc8c0a8,
    });
    const f = rot(0, -0.205, x, z, ry);
    b.quad(
      o.dead ? "glass_dark" : "screen",
      f[0],
      y + 0.21,
      f[1],
      0.3,
      0.24,
      ry + Math.PI,
    );
  };
  /** Bookshelf with books. ry: the shelf's front faces +z rotated by ry. */
  F.bookshelf = function (C, x, y, z, w, h, ry, o) {
    o = o || {};
    const b = o.batch || C.b,
      k = o.key || "wood_dark",
      d = 0.38;
    const r = LI.rng(o.seed || (x * 13 + z * 7) | 0);
    b.obox(k, x, y + h / 2, z, w, h, 0.04, ry); // back (centre plane)
    for (const s of [-1, 1]) {
      const p = rot((s * w) / 2, d / 2, x, z, ry);
      b.obox(k, p[0], y + h / 2, p[1], 0.04, h, d, ry);
    }
    const shelves = Math.max(2, Math.round(h / 0.4));
    const books = [
      "paper",
      "leather",
      "fabric_red",
      "fabric_blue",
      "fabric_green",
      "cardboard",
    ];
    for (let i = 0; i <= shelves; i++) {
      const yy = y + (i * (h - 0.04)) / shelves;
      const p = rot(0, d / 2, x, z, ry);
      b.obox(k, p[0], yy + 0.02, p[1], w, 0.04, d, ry);
      if (i === shelves || (o.empty && r() < 0.7)) continue;
      let t = -w / 2 + 0.05;
      while (t < w / 2 - 0.08) {
        const bw = 0.03 + r() * 0.05,
          bh = 0.2 + r() * 0.14;
        if (r() < (o.gaps || 0.18)) {
          t += bw * 2;
          continue;
        }
        const lean = r() < 0.1 ? 0.3 : 0;
        const q = rot(t + bw / 2, d / 2 + 0.02, x, z, ry);
        b.obox(
          books[(r() * books.length) | 0],
          q[0],
          yy + 0.04 + bh / 2,
          q[1],
          bw,
          bh,
          0.24,
          ry,
          { rz: lean, grime: 0.3 },
        );
        t += bw + 0.005;
      }
    }
    if (o.col !== false) {
      const p = rot(0, d / 2, x, z, ry);
      C.colRot(p[0], p[1], w, d, y, y + h, ry, {
        walkable: false,
        surface: "wood",
      });
    }
  };
  /** Low sofa / settee. */
