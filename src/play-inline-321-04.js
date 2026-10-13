// play-inline-321 04 — math
// Lines 672-828 of readable/play-inline-321.pretty.js (statement-aligned).
  D.monitor = function (b, x, y, z, ry, on) {
    const c = Math.cos(ry),
      s = Math.sin(ry);
    b.box("paint_cream", x, y, z, 0.55, 0.45, 0.5, {
      ry,
      seg: false,
      grime: 0.6,
    });
    b.box(
      "paint_cream",
      x - s * 0.18,
      y + 0.05,
      z - c * 0.18,
      0.4,
      0.35,
      0.25,
      { ry, seg: false, grime: 0.6 },
    );
    b.quad(
      on ? "screen" : "glass_dark",
      x + s * 0.252,
      y + 0.23,
      z + c * 0.252,
      0.42,
      0.32,
      { ry, noAO: true, grime: 0 },
    );
  };
  /** Fluorescent tube fixture hanging on two wires (emissive or broken). */
  D.fluoro = function (b, x, y, z, ry, len, lit, ceilY) {
    const c = Math.cos(ry),
      s = Math.sin(ry);
    b.box("panel", x, y, z, len, 0.1, 0.3, { ry, seg: false, grime: 0.4 });
    b.box(
      lit ? "lamp" : "glass_broken",
      x,
      y - 0.06,
      z,
      len - 0.1,
      0.06,
      0.16,
      { ry, seg: false, noAO: true, grime: 0 },
    );
    for (const sg of [-1, 1])
      b.beam(
        "iron",
        V(x + c * sg * len * 0.4, y + 0.1, z - s * sg * len * 0.4),
        V(x + c * sg * len * 0.4, ceilY, z - s * sg * len * 0.4),
        0.015,
        0.015,
        { noAO: true },
      );
    if (lit)
      PF.glows.push({ pos: V(x, y - 0.1, z), color: 0xe8f4ff, size: 0.9 });
  };
  /** Cable run hanging between points (sagging). */
  D.cable = function (b, pts, sag) {
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i],
        c = pts[i + 1],
        n = 6;
      for (let k = 0; k < n; k++) {
        const t0 = k / n,
          t1 = (k + 1) / n;
        const p0 = V(
          a.x + (c.x - a.x) * t0,
          a.y + (c.y - a.y) * t0 - Math.sin(t0 * Math.PI) * sag,
          a.z + (c.z - a.z) * t0,
        );
        const p1 = V(
          a.x + (c.x - a.x) * t1,
          a.y + (c.y - a.y) * t1 - Math.sin(t1 * Math.PI) * sag,
          a.z + (c.z - a.z) * t1,
        );
        b.beam("tire", p0, p1, 0.035, 0.035, { noAO: true, grime: 0 });
      }
    }
  };
  /** Low rubble drift (chunks + dust mound). */
  D.rubble = function (b, x, y, z, r0, n, seed) {
    const r = PF.rng(seed || x * 11 + z * 5);
    b.rock("rubble", x, y - r0 * 0.35, z, r0, {
      flat: 0.3,
      rough: 0.5,
      seed: seed || x,
    });
    for (let i = 0; i < n; i++) {
      const a = r() * TAU,
        d = r0 * (0.6 + r() * 0.9);
      b.rock(
        r() < 0.3 ? "concrete" : "rubble",
        x + Math.cos(a) * d,
        y,
        z + Math.sin(a) * d,
        0.15 + r() * 0.35,
        { flat: 0.6, detail: 0, seed: i + (seed || 0) },
      );
    }
  };
  /** Stained mattress on the floor (raider bedding). */
  D.mattress = function (b, x, y, z, ry, tint) {
    b.box("fabric", x, y, z, 1.0, 0.2, 1.95, {
      ry,
      seg: false,
      c: tint || 0xa89070,
      grime: 0.8,
    });
    b.box(
      "fabric",
      x + Math.sin(ry) * -0.7,
      y + 0.2,
      z + Math.cos(ry) * -0.7,
      0.6,
      0.12,
      0.35,
      { ry, seg: false, c: 0xc8c0a8, grime: 0.6 },
    );
  };
  /** A shelf unit with bottles/cans (bar back, shop). */
  D.shelf = function (b, x, y, z, ry, w, rows, seed) {
    const r = PF.rng(seed || x + z * 7);
    const c = Math.cos(ry),
      s = Math.sin(ry);
    b.box("rotten", x, y, z, w, rows * 0.45 + 0.2, 0.4, {
      ry,
      seg: false,
      grime: 0.6,
    });
    for (let k = 0; k < rows; k++) {
      b.box(
        "rotten",
        x + s * 0.05,
        y + 0.25 + k * 0.45,
        z + c * 0.05,
        w,
        0.04,
        0.42,
        { ry, seg: false },
      );
      for (let i = 0; i < Math.round(w * 4); i++) {
        if (r() < 0.3) continue;
        const lx = -w / 2 + 0.12 + i * 0.25;
        b.cyl(
          r() < 0.25 ? "paint_red" : r() < 0.5 ? "glass_dark" : "chrome",
          x + c * lx + s * 0.1,
          y + 0.29 + k * 0.45,
          z - s * lx + c * 0.1,
          0.045,
          0.05,
          0.2 + r() * 0.1,
          6,
          { hSeg: 1 },
        );
      }
    }
    PF.col(x, z, w, 0.45, y, y + rows * 0.45 + 0.2, ry, { walkable: false });
  };
