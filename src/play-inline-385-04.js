// play-inline-385 04 — yaw
// Lines 608-956 of readable/play-inline-385.pretty.js (statement-aligned).
  K.hamper = function (b, x, y, z, yaw, o) {
    o = o || {};
    const Lc = K.L(x, z, yaw),
      W = 0.9,
      D = 1.3,
      H = 0.95;
    for (const [u, v] of [
      [-W / 2, -D / 2],
      [W / 2, -D / 2],
      [-W / 2, D / 2],
      [W / 2, D / 2],
    ]) {
      const p = Lc(u * 0.9, v * 0.9);
      b.cyl("rubber", p[0], y, p[1], 0.06, 0.06, 0.1, 6);
    }
    b.box("metal", x, y + 0.12, z, W, 0.05, D, {
      yaw,
      tint: [0.5, 0.52, 0.5],
      faces: "nsewtb",
    });
    b.box(o.cloth || "canvas", x, y + 0.17, z, W - 0.04, H - 0.17, D - 0.04, {
      yaw,
      faces: "nsew",
      tint: o.tint || [0.78, 0.74, 0.62],
    });
    // frame
    for (const [u, v] of [
      [-W / 2, -D / 2],
      [W / 2, -D / 2],
      [-W / 2, D / 2],
      [W / 2, D / 2],
    ]) {
      const p = Lc(u, v);
      b.beam("metal", p[0], y + 0.12, p[1], p[0], y + H, p[1], 0.03, 0.03, {
        tint: [0.45, 0.46, 0.44],
      });
    }
    for (const v of [-D / 2, D / 2]) {
      const p = Lc(-W / 2, v),
        q = Lc(W / 2, v);
      b.beam("metal", p[0], y + H, p[1], q[0], y + H, q[1], 0.03, 0.03, {
        tint: [0.45, 0.46, 0.44],
      });
    }
    for (const u of [-W / 2, W / 2]) {
      const p = Lc(u, -D / 2),
        q = Lc(u, D / 2);
      b.beam("metal", p[0], y + H, p[1], q[0], y + H, q[1], 0.03, 0.03, {
        tint: [0.45, 0.46, 0.44],
      });
    }
    // contents: letters/parcels heaped
    if (o.full !== false) {
      const r = K.rng((x * 17 + z * 5) | 0);
      b.geo("canvas", K.sphereGeo(), {
        x,
        y: y + H - 0.2,
        z,
        sx: W * 0.45,
        sy: 0.25,
        sz: D * 0.45,
        ry: yaw,
        tint: [0.7, 0.66, 0.56],
      });
      for (let k = 0; k < 6; k++) {
        const p = Lc((r() - 0.5) * W * 0.7, (r() - 0.5) * D * 0.7);
        b.box("flat", p[0], y + H - 0.02 + r() * 0.08, p[1], 0.22, 0.01, 0.12, {
          yaw: r() * 6,
          tint: [0.9, 0.88, 0.8],
        });
      }
      for (let k = 0; k < 2; k++) {
        const p = Lc((r() - 0.5) * W * 0.5, (r() - 0.5) * D * 0.5);
        b.box("wood", p[0], y + H - 0.1, p[1], 0.3, 0.2, 0.25, {
          yaw: r() * 6,
          tint: [0.7, 0.58, 0.4],
        });
      }
    }
    if (o.col !== false)
      b.ocol(x, z, W, D, y, y + H, yaw, { tag: "furniture", surface: "metal" });
  };

  /** Bulging mail sack lying or standing. */
  K.sack = function (b, x, y, z, yaw, o) {
    o = o || {};
    const s = o.s || 1,
      stand = !!o.stand,
      tint = o.tint || [0.66, 0.62, 0.5];
    if (stand) {
      b.geo("canvas", K.sphereGeo(), {
        x,
        y: y + 0.38 * s,
        z,
        sx: 0.32 * s,
        sy: 0.4 * s,
        sz: 0.3 * s,
        ry: yaw,
        tint,
      });
      b.cyl("canvas", x, y + 0.72 * s, z, 0.1 * s, 0.05 * s, 0.14 * s, 6, {
        tint,
      });
    } else {
      b.geo("canvas", K.sphereGeo(), {
        x,
        y: y + 0.2 * s,
        z,
        sx: 0.34 * s,
        sy: 0.22 * s,
        sz: 0.55 * s,
        ry: yaw,
        tint,
      });
      const Lc = K.L(x, z, yaw),
        t = Lc(0, 0.58 * s);
      b.cyl(
        "canvas",
        t[0],
        y + 0.12 * s,
        t[1],
        0.07 * s,
        0.1 * s,
        0.14 * s,
        6,
        { tint },
      );
    }
    if (o.label)
      b.plate(
        "art",
        x - Math.sin(yaw) * 0.01,
        y + (stand ? 0.4 : 0.2) * s,
        z,
        -Math.sin(yaw + PI / 2),
        -Math.cos(yaw + PI / 2),
        0.3 * s,
        0.14 * s,
        K.signCell("ppn_sack_" + o.label, o.label, 128, 56, {
          bg: "#b8ac88",
          fg: "#2a3a5a",
          font: "Courier New, monospace",
        }),
        { off: 0.3 * s },
      );
  };

  /** Hotel PBX cord switchboard section (w wide), operator faces local +z side?  Board faces local −z. */
  K.switchboard = function (b, x, y, z, yaw, w, o) {
    o = o || {};
    const Lc = K.L(x, z, yaw),
      fx = -Math.sin(yaw),
      fz = -Math.cos(yaw);
    // desk shelf with keys & cords
    b.box("walnut", x, y, z, w, 0.72, 0.8, { yaw, tint: [0.7, 0.55, 0.4] });
    const dk = Lc(0, -0.1);
    b.box("bakelite", dk[0], y + 0.72, dk[1], w, 0.05, 0.62, {
      yaw,
      faces: "nsewtb",
    });
    // vertical panel (jack field atlas) + cabinet
    const pc = Lc(0, 0.28);
    b.box("walnut", pc[0], y + 0.77, pc[1], w, 1.45, 0.25, {
      yaw,
      tint: [0.6, 0.46, 0.32],
    });
    b.plate(
      "art",
      pc[0] + fx * 0.13,
      y + 1.5,
      pc[1] + fz * 0.13,
      fx,
      fz,
      w - 0.12,
      1.3,
      K.jackCell(),
      { off: 0.005 },
    );
    const hood = Lc(0, 0.12);
    b.box("walnut", hood[0], y + 2.22, hood[1], w + 0.05, 0.12, 0.5, {
      yaw,
      tint: [0.6, 0.46, 0.32],
      faces: "nsewtb",
    });
    // cords: plugs lying on the shelf + a few patched up into the jacks (red cords in sagging arcs)
    const r = K.rng((x * 13 + z * 11) | 0);
    for (let k = 0; k < Math.floor(w * 5); k++) {
      const u = -w / 2 + 0.12 + k * 0.2 + r() * 0.04,
        p = Lc(u, -0.25);
      b.cyl("bakelite", p[0], y + 0.77, p[1], 0.018, 0.018, 0.09, 5);
      if (r() < 0.35) {
        const q = Lc(u + (r() - 0.5) * 0.8, 0.14),
          up = y + 0.95 + r() * 1.0;
        const m = [
          (p[0] + q[0]) / 2 + fx * 0.2,
          Math.min(y + 0.8, up) - 0.18,
          (p[1] + q[1]) / 2 + fz * 0.2,
        ];
        b.pipe("cord_red", p[0], y + 0.86, p[1], m[0], m[1], m[2], 0.008, 3);
        b.pipe("cord_red", m[0], m[1], m[2], q[0], up, q[1], 0.008, 3);
      }
    }
    // key row (listening / ringing keys)
    for (let k = 0; k < Math.floor(w * 6); k++) {
      const p = Lc(-w / 2 + 0.1 + k * 0.165, -0.34);
      b.box("ivory_key", p[0], y + 0.77, p[1], 0.03, 0.05, 0.06, { yaw });
    }
    // indicator lamps: a few still glowing amber (the board never lost power)
    if (o.live)
      for (let k = 0; k < 5; k++) {
        const p = Lc(-w / 2 + 0.2 + r() * (w - 0.4), 0.15);
        const yy = y + 1.0 + r() * 1.0;
        b.geo("lamp", K.sphereGeo(), {
          x: p[0] + fx * 0.02,
          y: yy,
          z: p[1] + fz * 0.02,
          s: 0.018,
          tint: [1, 0.62, 0.2],
        });
        b.glow(p[0] + fx * 0.05, yy, p[1] + fz * 0.05, [0.5, 0.3, 0.08], 0.35);
      }
    if (o.col !== false)
      b.ocol(x, z, w, 0.9, y, y + 2.3, yaw, {
        tag: "furniture",
        surface: "wood",
        walkable: false,
      });
  };

  /** Grand piano, keyboard facing local −z (player of it sits at −z). */
  K.piano = function (b, x, y, z, yaw, o) {
    o = o || {};
    const Lc = K.L(x, z, yaw),
      m = "piano_black";
    for (const [u, v] of [
      [-0.62, -0.5],
      [0.62, -0.5],
      [0.1, 1.1],
    ]) {
      const p = Lc(u, v);
      b.cyl(m, p[0], y, p[1], 0.06, 0.08, 0.62, 6);
    }
    // case: rectangle + curved tail approximated with a scaled cylinder
    const c0 = Lc(0, -0.15);
    b.box(m, c0[0], y + 0.62, c0[1], 1.5, 0.3, 0.9, { yaw, faces: "nsewtb" });
    const c1 = Lc(0.18, 0.55);
    b.geo(m, K.unitCyl(16), {
      x: c1[0],
      y: y + 0.77,
      z: c1[1],
      sx: 0.62,
      sy: 0.3,
      sz: 0.9,
      ry: yaw,
    });
    // keyboard
    const kb = Lc(0, -0.72);
    b.box("ivory_key", kb[0], y + 0.82, kb[1], 1.3, 0.04, 0.2, { yaw });
    for (let k = 0; k < 18; k++) {
      const p = Lc(-0.62 + k * 0.073, -0.74);
      if (k % 7 === 2 || k % 7 === 6) continue;
      b.box(m, p[0], y + 0.86, p[1], 0.03, 0.02, 0.12, { yaw });
    }
    // lid propped up
    const lp = Lc(0.05, 0.25),
      a = Lc(-0.7, 0.25),
      tip = Lc(0.6, 0.25);
    b.quadN(
      m,
      [a[0], y + 0.93, a[1]],
      [lp[0], y + 1.75, lp[1]],
      [Lc(0.05, 1.2)[0], y + 1.75, Lc(0.05, 1.2)[1]],
      [Lc(-0.7, 1.0)[0], y + 0.93, Lc(-0.7, 1.0)[1]],
      [Math.cos(yaw) * -1, 0.6, Math.sin(yaw)],
      { grime: 0.3 },
    );
    b.pipe(
      "brass",
      tip[0],
      y + 0.92,
      tip[1],
      tip[0],
      y + 1.6,
      tip[1],
      0.012,
      3,
    );
    if (o.col !== false)
      b.ocol(c0[0], c0[1], 1.5, 1.9, y, y + 1.0, yaw, {
        tag: "furniture",
        surface: "wood",
      });
  };

  /** Drum kit (bass drum with painted head, snare, toms, cymbals). */
  K.drums = function (b, x, y, z, yaw, headRect) {
    const Lc = K.L(x, z, yaw);
    const bd = Lc(0, -0.1);
    b.geo("paint_white", K.unitCyl(16), {
      x: bd[0],
      y: y + 0.32,
      z: bd[1],
      sx: 0.34,
      sy: 0.4,
      sz: 0.34,
      rx: PI / 2,
      ry: yaw,
      tint: [0.7, 0.2, 0.18],
    });
    if (headRect) {
      const h = Lc(0, -0.31);
      b.plate(
        "art",
        h[0],
        y + 0.32,
        h[1],
        -Math.sin(yaw),
        -Math.cos(yaw),
        0.62,
        0.62,
        headRect,
        { off: 0.005 },
      );
    }
    for (const [u, v, r, hh, yy] of [
      [-0.45, 0.25, 0.18, 0.16, 0.55],
      [0.4, 0.3, 0.22, 0.3, 0.3],
      [-0.15, 0.2, 0.14, 0.14, 0.72],
      [0.15, 0.2, 0.15, 0.15, 0.72],
    ]) {
      const p = Lc(u, v);
      b.cyl("paint_white", p[0], y + yy, p[1], r, r, hh, 12, {
        tint: [0.72, 0.2, 0.18],
      });
      b.pipe("chrome", p[0], y, p[1], p[0], y + yy, p[1], 0.012, 3);
    }
    for (const [u, v, hh] of [
      [-0.7, 0.35, 1.2],
      [0.7, 0.5, 1.35],
    ]) {
      const p = Lc(u, v);
      b.pipe("chrome", p[0], y, p[1], p[0], y + hh, p[1], 0.012, 3);
      b.cyl("brass", p[0], y + hh, p[1], 0.24, 0.02, 0.04, 12, {
        tint: [0.8, 0.65, 0.3],
      });
    }
  };

  /** Brass elevator door pair in a wall facing (nx,nz), centred at (x,z) on the wall surface; o.open → gap to the shaft. */
