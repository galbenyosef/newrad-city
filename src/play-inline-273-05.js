// play-inline-273 05 — math
// Lines 772-1108 of readable/play-inline-273.pretty.js (statement-aligned).
  X.roundWall = function (S, cx, cz, R, y0, y1, o) {
    o = o || {};
    const b = S.b,
      n = o.n || 12,
      t = o.t || 0.3,
      key = o.key || "plaster";
    const pw = 2 * R * Math.tan(PI / n) + 0.04;
    for (let i = 0; i < n; i++) {
      const ap = (o.a0 || 0) + (i * TAU) / n;
      const ry = -ap - HP;
      const pcx = cx + Math.cos(ap) * R,
        pcz = cz + Math.sin(ap) * R;
      const tx = -Math.sin(ap),
        tz = Math.cos(ap);
      const holes = (o.doors || [])
        .filter(
          (d) =>
            Math.abs(Math.atan2(Math.sin(d.a - ap), Math.cos(d.a - ap))) <
            PI / n,
        )
        .map((d) => [-d.w / 2, d.w / 2, d.y - y0, d.y - y0 + d.h])
        .sort((p, q) => p[2] - q[2]);
      const pieces = [];
      if (!holes.length) pieces.push([-pw / 2, pw / 2, 0, y1 - y0]);
      else {
        const hw = holes[0][1];
        pieces.push([-pw / 2, -hw, 0, y1 - y0]);
        pieces.push([hw, pw / 2, 0, y1 - y0]);
        let cur = 0;
        for (const h of holes) {
          if (h[2] > cur) pieces.push([-hw, hw, cur, h[2]]);
          cur = h[3];
        }
        if (cur < y1 - y0) pieces.push([-hw, hw, cur, y1 - y0]);
      }
      for (const pc of pieces) {
        const u = (pc[0] + pc[1]) / 2,
          w = pc[1] - pc[0];
        if (w < 0.01 || pc[3] - pc[2] < 0.01) continue;
        const px = pcx + tx * u,
          pz = pcz + tz * u;
        b.box(
          key,
          px - w / 2,
          y0 + pc[2],
          pz - t / 2,
          px + w / 2,
          y0 + pc[3],
          pz + t / 2,
          { ry, ground: o.ground === undefined ? y0 : o.ground, segLen: 2 },
        );
        if (o.col !== false)
          S.colR(px, pz, w, t, y0 + pc[2], y0 + pc[3], ry, { walkable: false });
      }
      if (o.pilasters) {
        const a2 = ap + PI / n,
          px = cx + Math.cos(a2) * (R - t / 2 - 0.08),
          pz = cz + Math.sin(a2) * (R - t / 2 - 0.08);
        b.box(o.pilasters, px - 0.2, y0, pz - 0.1, px + 0.2, y1, pz + 0.1, {
          ry: -a2 - HP,
          seg: false,
        });
      }
    }
  };

  /** Bulbous (Beaux-Arts / Ansonia) dome with lantern + finial on a drum top at (x,y,z). */
  X.dome = function (b, x, y, z, r, h, o) {
    o = o || {};
    const k = o.key || "verdigris";
    const prof0 = [
      [r * 1.02, 0],
      [r * 1.08, h * 0.12],
      [r * 1.12, h * 0.3],
      [r * 1.02, h * 0.5],
      [r * 0.78, h * 0.68],
      [r * 0.48, h * 0.82],
      [r * 0.22, h * 0.92],
      [0.001, h * 0.95],
    ];
    if (o.broken) {
      // skin torn away over part of the dome: ribs + purlins exposed, dark void inside
      b.lathe(k, prof0, o.seg || 16, x, y, z, {
        grime: 0.45,
        p0: o.brokenAt || 0,
        pl: TAU * (1 - o.broken),
      });
      b.lathe(
        "roof_tar",
        prof0.map((p) => [p[0] * 0.96, p[1] * 0.98]),
        o.seg || 16,
        x,
        y,
        z,
        {
          p0: (o.brokenAt || 0) + TAU * (1 - o.broken),
          pl: TAU * o.broken,
          noAO: true,
          uv: "box",
        },
      );
      for (let j = 1; j < 5; j++) {
        const pr = prof0[j];
        b.torus("rust", x, y + pr[1], z, pr[0], 0.05, TAU * o.broken, {
          rx: HP,
          ry: 0,
          rz: 0,
          ts: 10,
          rs: 3,
        });
      }
    } else b.lathe(k, prof0, o.seg || 16, x, y, z, { grime: 0.35 });
    // ribs
    const nr = o.ribs || 8;
    for (let i = 0; i < nr; i++) {
      const a = (i / nr) * TAU;
      const prof = [
        [1.1, 0.05],
        [1.14, 0.3],
        [1.04, 0.5],
        [0.8, 0.68],
        [0.5, 0.82],
        [0.24, 0.92],
      ];
      for (let j = 0; j < prof.length - 1; j++)
        b.rod(
          k,
          [
            x + Math.cos(a) * r * prof[j][0],
            y + h * prof[j][1],
            z + Math.sin(a) * r * prof[j][0],
          ],
          [
            x + Math.cos(a) * r * prof[j + 1][0],
            y + h * prof[j + 1][1],
            z + Math.sin(a) * r * prof[j + 1][0],
          ],
          r * 0.035,
          4,
          { noAO: true },
        );
    }
    // oculus dormers
    if (o.oculi)
      for (let i = 0; i < o.oculi; i++) {
        const a = ((i + 0.5) / o.oculi) * TAU,
          rr = r * 1.1;
        b.torus(
          o.trim || "terracotta_cream",
          x + Math.cos(a) * rr,
          y + h * 0.28,
          z + Math.sin(a) * rr,
          r * 0.16,
          r * 0.04,
          TAU,
          { ry: -a + HP, ts: 12, rs: 4 },
        );
        b.cyl(
          "glass_dark",
          x + Math.cos(a) * (rr - 0.02),
          y + h * 0.28,
          z + Math.sin(a) * (rr - 0.02),
          r * 0.15,
          r * 0.15,
          0.05,
          10,
          { rx: HP, ry: -a + HP },
        );
      }
    // lantern
    const ly = y + h * 0.92,
      lr = o.lantern || r * 0.28;
    if (lr > 0) {
      b.cyl(
        o.trim || "terracotta_cream",
        x,
        ly,
        z,
        lr * 1.2,
        lr * 1.25,
        0.25,
        12,
      );
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * TAU;
        b.cyl(
          k,
          x + Math.cos(a) * lr,
          ly + 0.25,
          z + Math.sin(a) * lr,
          0.07,
          0.08,
          lr * 2.2,
          6,
        );
      }
      b.cyl("glass_dark", x, ly + 0.25, z, lr * 0.8, lr * 0.8, lr * 2.2, 8);
      b.lathe(
        k,
        [
          [lr * 1.25, 0],
          [lr * 1.1, lr * 0.5],
          [lr * 0.6, lr * 1.0],
          [0.001, lr * 1.3],
        ],
        10,
        x,
        ly + 0.25 + lr * 2.2,
        z,
      );
      const fy = ly + 0.25 + lr * 2.2 + lr * 1.3;
      b.sphere(k, x, fy + 0.2, z, 0.22, { ws: 8, hs: 6 });
      b.cyl(k, x, fy + 0.35, z, 0.02, 0.07, o.spire || 2.4, 5);
    }
  };

  /** Window wrapped on a cylinder (tower) — glass + frame + sill, facing outward at angle a. */
  X.cylWindow = function (b, cx, cz, R, a, y, w, h, o) {
    o = o || {};
    const ry = -a - HP,
      gk =
        o.style === "broken"
          ? "glass_broken"
          : o.style === "lit"
            ? "window_lit"
            : "glass_dark";
    const at = (d) => [cx + Math.cos(a) * (R + d), cz + Math.sin(a) * (R + d)];
    let p = at(0.02);
    b.box(gk, p[0] - w / 2, y, p[1] - 0.04, p[0] + w / 2, y + h, p[1] + 0.04, {
      ry,
      seg: false,
      grime: 0.1,
      noAO: true,
    });
    if (o.style === "boarded")
      for (let i = 0; i < 3; i++) {
        p = at(0.1);
        b.box(
          "wood_rotten",
          p[0] - w / 2 - 0.05,
          y + 0.3 + (i * (h - 0.5)) / 2,
          p[1] - 0.03,
          p[0] + w / 2 + 0.05,
          y + 0.5 + (i * (h - 0.5)) / 2,
          p[1] + 0.03,
          { ry, seg: false },
        );
      }
    const fk = o.frame || "terracotta_cream";
    p = at(0.08);
    b.box(
      fk,
      p[0] - w / 2 - 0.14,
      y + h,
      p[1] - 0.12,
      p[0] + w / 2 + 0.14,
      y + h + 0.16,
      p[1] + 0.12,
      { ry, seg: false },
    );
    b.box(
      fk,
      p[0] - w / 2 - 0.12,
      y - 0.12,
      p[1] - 0.14,
      p[0] + w / 2 + 0.12,
      y,
      p[1] + 0.14,
      { ry, seg: false },
    );
    for (const s of [-1, 1]) {
      const q = [
        p[0] - Math.sin(a) * s * (w / 2 + 0.06),
        p[1] + Math.cos(a) * s * (w / 2 + 0.06),
      ];
      b.box(fk, q[0] - 0.07, y, q[1] - 0.1, q[0] + 0.07, y + h, q[1] + 0.1, {
        ry,
        seg: false,
      });
    }
    if (o.hood) {
      p = at(0.2);
      b.box(
        fk,
        p[0] - w / 2 - 0.3,
        y + h + 0.16,
        p[1] - 0.2,
        p[0] + w / 2 + 0.3,
        y + h + 0.36,
        p[1] + 0.2,
        { ry, seg: false },
      );
    }
  };
  /** Iron balcony wrapped on a cylinder over an angle range. */
  X.cylBalcony = function (S, cx, cz, R, a0, a1, y, o) {
    o = o || {};
    const b = S.b,
      key = o.key || "iron",
      n = Math.max(3, Math.ceil(((a1 - a0) * R) / 0.5));
    X.sectorSlab(
      b,
      o.slab || "terracotta_cream",
      cx,
      cz,
      R - 0.1,
      R + 0.9,
      a0,
      a1,
      y,
      0.18,
      { grime: 0.5 },
    );
    for (let i = 0; i <= n; i++) {
      const a = a0 + ((a1 - a0) * i) / n,
        px = cx + Math.cos(a) * (R + 0.85),
        pz = cz + Math.sin(a) * (R + 0.85);
      b.rod(key, [px, y, pz], [px, y + 1.0, pz], 0.015, 3, { noAO: true });
      if (i < n) {
        const a2 = a0 + ((a1 - a0) * (i + 1)) / n;
        b.rod(
          key,
          [px, y + 1.0, pz],
          [
            cx + Math.cos(a2) * (R + 0.85),
            y + 1.0,
            cz + Math.sin(a2) * (R + 0.85),
          ],
          0.025,
          3,
          { noAO: true },
        );
      }
    }
  };

  /** Bronze seal statue (the Ansonia lobby fountain). Local +z = where the seal looks. pose 'up' | 'lie' */
