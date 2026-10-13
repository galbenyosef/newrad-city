// play-inline-81 03 — math
// Lines 577-852 of readable/play-inline-81.pretty.js (statement-aligned).
  function bulkhead(x0, a, b, dir, alongZ) {
    const r = R;
    const P = (t, off, y) =>
      alongZ ? [x0 + dir * off, y, t] : [t, y, x0 + dir * off];
    const n = alongZ ? [dir, 0, 0] : [0, 0, dir];
    const st = fb(
      "stone_limestone",
      alongZ ? x0 : (a + b) / 2,
      alongZ ? (a + b) / 2 : x0,
    );
    for (let t = a; t < b; t += 40) {
      const t1 = Math.min(b, t + 40);
      const q = (y0, y1, c0, c1) => {
        const p0 = P(t, 0.05, y0),
          p1 = P(t1, 0.05, y0),
          p2 = P(t1, 0.05, y1),
          p3 = P(t, 0.05, y1);
        if (dir < 0 === alongZ)
          M.quad(st, p1, p0, p3, p2, n, [0, 0, 8, 0, 8, 1, 0, 1], c0, c1);
        else M.quad(st, p0, p1, p2, p3, n, [0, 0, 8, 0, 8, 1, 0, 1], c0, c1);
      };
      q(-2.5, -0.7, [0.18, 0.22, 0.16], [0.26, 0.27, 0.2]); // algae / waterline band
      q(-0.7, 1.4, [0.3, 0.27, 0.23], [0.42, 0.4, 0.36]); // soot-dark ashlar
      // coping
      const c0 = P(t, 0.35, 1.4),
        c1 = P(t1, 0.35, 1.4);
      M.box(
        st,
        Math.min(c0[0], c1[0]) - (alongZ ? 0.4 : 0),
        1.4,
        Math.min(c0[2], c1[2]) - (alongZ ? 0 : 0.4),
        Math.max(c0[0], c1[0]) + (alongZ ? 0.4 : 0),
        1.75,
        Math.max(c0[2], c1[2]) + (alongZ ? 0 : 0.4),
        { s: 3, c: [0.5, 0.48, 0.44], skip: 8 },
      );
    }
    // timber fender piles + riprap
    const wb = fb("wood_rotten", x0, a),
      rb = fb("my/rock", x0, a);
    // (always-drawn far layer: square piles, sparse — they only have to read as a fender line from 500 m)
    for (let t = a + 2; t < b; t += r.range(4.5, 7)) {
      if (r() < 0.25) continue;
      const p = P(t, 0.9, -2.5),
        h = r.range(3.4, 4.6);
      M.obox(wb, p[0], -2.5 + h / 2, p[2], 0.55, h, 0.55, 0, {
        c: [0.26, 0.22, 0.18],
        skip: 8,
      });
    }
    for (let t = a + 4; t < b; t += r.range(9, 16)) {
      const p = P(t, r.range(1.5, 4), -1.6),
        s = r.range(1.2, 2.6);
      M.obox(
        rb,
        p[0],
        -1.3 + s * 0.2,
        p[2],
        s * r.range(1, 1.8),
        s * 0.8,
        s,
        r() * 3,
        { c: [0.36, 0.34, 0.3], pitch: r.range(-0.3, 0.3) },
      );
    }
    // half-sunk barges / tugs along the wall
    for (let t = a + r.range(40, 120); t < b - 40; t += r.range(180, 340)) {
      const p = P(t, 9, 0),
        len = r.range(22, 36),
        w = r.range(7, 10),
        tilt = r.range(0.05, 0.16);
      const hb = fb("rust", p[0], p[2]);
      M.obox(hb, p[0], -0.4, p[2], alongZ ? w : len, 2.4, alongZ ? len : w, 0, {
        c: [0.36, 0.28, 0.22],
        roll: alongZ ? tilt : 0,
        pitch: alongZ ? 0 : tilt,
      });
      if (r() < 0.5)
        M.obox(
          hb,
          p[0],
          1.8,
          p[2] + (alongZ ? len * 0.3 : 0),
          alongZ ? w * 0.5 : 5,
          3,
          alongZ ? 5 : w * 0.5,
          0,
          { c: [0.42, 0.34, 0.28] },
        );
    }
  }

  // ---------------------------------------------------------------- far-shore landmark silhouettes
  /** Vertical polygon fan in the plane x = const (facing dir ±1 on x): n-gon of radius rr centred (x,y,z). */
  function vDisc(b, x, y, z, rr, n, dir, c, a0) {
    for (let i = 0; i < n; i++) {
      const a = (a0 || 0) + (i / n) * Math.PI * 2,
        e = (a0 || 0) + ((i + 1) / n) * Math.PI * 2;
      const p1 = [x, y + Math.sin(a) * rr, z + Math.cos(a) * rr],
        p2 = [x, y + Math.sin(e) * rr, z + Math.cos(e) * rr];
      if (dir > 0)
        M.tri(b, [x, y, z], p2, p1, [1, 0, 0], [0, 0, 1, 0, 0, 1], c);
      else M.tri(b, [x, y, z], p1, p2, [-1, 0, 0], [0, 0, 1, 0, 0, 1], c);
    }
  }
  /** The Colgate Clock: a 15 m octagonal clock face on a steel lattice, facing Manhattan across the Hudson. */
  function colgateClock(x, z) {
    const st = fb("rust", x, z),
      fc = fb("stone_limestone", x, z);
    const H = 20,
      R0 = 7.6,
      cy = H + R0;
    for (const s of [-1, 1])
      for (const dx of [-3, 3])
        M.beam(
          st,
          x + dx,
          0,
          z + s * 4,
          x + dx * 0.5,
          H + 2,
          z + s * 3,
          0.6,
          0.6,
          { c: [0.3, 0.26, 0.22] },
        );
    for (let k = 0; k < 5; k++)
      M.beam(
        st,
        x - 2,
        3 + k * 4,
        z - 4 + k * 0.2,
        x - 2,
        3 + k * 4,
        z + 4 - k * 0.2,
        0.35,
        0.35,
        { c: [0.3, 0.26, 0.22] },
      );
    vDisc(st, x + 0.8, cy, z, R0 + 0.7, 8, 1, [0.22, 0.2, 0.18], Math.PI / 8); // dark rim
    vDisc(fc, x + 1.0, cy, z, R0, 8, 1, [0.95, 0.93, 0.86], Math.PI / 8); // pale face
    M.beam(st, x + 1.3, cy, z, x + 1.3, cy + R0 * 0.8, z + 1.2, 0.5, 0.25, {
      c: [0.12, 0.1, 0.1],
    }); // minute hand (stopped)
    M.beam(
      st,
      x + 1.3,
      cy,
      z,
      x + 1.3,
      cy - R0 * 0.25,
      z + R0 * 0.45,
      0.6,
      0.3,
      { c: [0.12, 0.1, 0.1] },
    ); // hour hand
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      M.box(
        st,
        x + 1.05,
        cy + Math.sin(a) * R0 * 0.85 - 0.35,
        z + Math.cos(a) * R0 * 0.85 - 0.35,
        x + 1.2,
        cy + Math.sin(a) * R0 * 0.85 + 0.35,
        z + Math.cos(a) * R0 * 0.85 + 0.35,
        { c: [0.15, 0.13, 0.12], skip: 2 + 8 + 4 + 16 + 32 },
      );
    }
  }
  /** Hoboken Terminal: long ferry sheds on the water + the copper-roofed clock tower. */
  function hobokenTerminal(x, z) {
    const r = R;
    tower(x - 34, z - 40, x, z + 40, 16, {
      style: "warehouse",
      v: 1,
      flat: true,
      tint: [0.62, 0.66, 0.6],
    });
    const cb = fb("metal_painted", x, z);
    for (let k = -1; k <= 1; k++)
      M.box(cb, x, 1, z + k * 24 - 9, x + 30, 12, z + k * 24 + 9, {
        s: 3,
        c: [0.42, 0.55, 0.5],
        skip: 8 + 2,
      });
    const tx = x - 12,
      tz = z - 30;
    tower(tx - 5, tz - 5, tx + 5, tz + 5, 52, {
      style: "office",
      v: 1,
      flat: true,
      tint: [0.78, 0.74, 0.66],
    });
    M.cyl(fb("metal_painted", tx, tz), tx, 68, tz, 4.5, 0.4, 9, 4, {
      c: [0.36, 0.58, 0.5],
      a0: Math.PI / 4,
      a1: Math.PI / 4 + Math.PI * 2,
    });
    vDisc(
      fb("stone_limestone", tx, tz),
      tx + 5.2,
      60,
      tz,
      2.4,
      8,
      1,
      [0.95, 0.93, 0.86],
    );
    void r;
  }
  /** Church spire (brownstone base + tall needle). */
  function spire(x, z, h) {
    const w = R.range(5, 8);
    tower(x - w, z - w * 1.6, x + w, z + w * 1.6, h * 0.35, {
      style: "apartment",
      v: 1,
      flat: true,
      tint: [0.55, 0.42, 0.36],
    });
    M.box(
      fb("stone_limestone", x, z),
      x - 2.4,
      h * 0.35,
      z - w * 1.6 - 0.5,
      x + 2.4,
      h * 0.62,
      z - w * 1.6 + 4.3,
      { s: 3, c: [0.6, 0.5, 0.44], skip: 8 },
    );
    M.cyl(
      fb("metal_painted", x, z),
      x,
      h * 0.62,
      z - w * 1.6 + 1.9,
      2.6,
      0.1,
      h * 0.38,
      4,
      { c: [0.3, 0.42, 0.38], a0: Math.PI / 4, a1: Math.PI / 4 + Math.PI * 2 },
    );
  }
  /** Brick smokestack. */
  function smokestack(x, z, h) {
    M.cyl(fb("paint_red", x, z), x, 0, z, 3.2, 2.1, h, 6, {
      c: [0.62, 0.36, 0.3],
    });
    M.cyl(fb("rust", x, z), x, h - 2, z, 2.4, 2.4, 2, 6, {
      c: [0.25, 0.22, 0.2],
    });
  }
  /** Lattice radio / transmission mast with guy lines (a thin vertical accent). */
  function mast(x, z, h) {
    const st = fb("rust", x, z);
    for (let k = 0; k < 3; k++) {
      const a = (k / 3) * Math.PI * 2;
      M.beam(
        st,
        x + Math.cos(a) * 1.2,
        0,
        z + Math.sin(a) * 1.2,
        x + Math.cos(a) * 0.4,
        h,
        z + Math.sin(a) * 0.4,
        0.3,
        0.3,
        { c: [0.55, 0.3, 0.24] },
      );
    }
    for (let y = 12; y < h; y += 14)
      M.box(st, x - 1, y, z - 1, x + 1, y + 0.6, z + 1, {
        c: [0.8, 0.8, 0.78],
        skip: 8,
      });
  }

