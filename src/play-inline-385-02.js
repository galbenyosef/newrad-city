// play-inline-385 02 — tint
// Lines 28-290 of readable/play-inline-385.pretty.js (statement-aligned).
  const PV = G._ppn;
  const K = PV.kit;
  const PI = Math.PI;
  const rgba = K.rgba;

  // own materials / aliases
  Object.assign(K.ALIAS, {
    usps_blue: ["flat", 0x24385e],
    usps_red: ["flat", 0x8e2a22],
    hotel_red: ["velvet", 0x7a1c18],
    rouge_wall: ["wallpaper", 0xb04a3c],
    enamel_black: ["shiny", 0x16161a],
    piano_black: ["shiny", 0x121214],
    ivory_key: ["flat", 0xe6dfcc],
    canvas: ["fabric", 0xb4a888],
    canvas_grey: ["fabric", 0x8a8a80],
    cord_red: ["flat", 0x7a2a22],
    bakelite: ["shiny", 0x3a2418],
    teal_tile: ["tile", 0x5a8a82],
    postal_green: ["flat", 0x4a5a48],
    gilt: ["shiny", 0xc89a44],
    nickel: ["shiny", 0xb8b8b0],
    mattress: ["fabric", 0xc8bca0],
  });

  K.faceYaw = (fx, fz) => Math.atan2(-fx, -fz);
  /** Local (u along width, v along depth) → world point for an object at (x,z) with yaw. */
  K.L = function (x, z, yaw) {
    const c = Math.cos(yaw),
      s = Math.sin(yaw);
    return (u, v) => [x + u * c + v * s, z - u * s + v * c];
  };

  // ------------------------------------------------------------------
  // Columns & street furniture
  // ------------------------------------------------------------------
  /** Corinthian column: attic base, fluted shaft, bell capital with two acanthus rows + corner volutes, abacus. */
  K.corinthian = function (b, x, y0, z, r, h, o) {
    o = o || {};
    const mat = o.mat || "granite_pale",
      tint = o.tint || [0.9, 0.87, 0.82];
    const capH = r * 2.3,
      baseH = r * 0.9;
    // plinth + two tori
    b.box(mat, x, y0, z, r * 2.7, baseH * 0.42, r * 2.7, { tint });
    b.cyl(mat, x, y0 + baseH * 0.42, z, r * 1.32, r * 1.22, baseH * 0.26, 16, {
      tint,
    });
    b.cyl(mat, x, y0 + baseH * 0.68, z, r * 1.12, r * 1.05, baseH * 0.32, 16, {
      tint,
    });
    const sh = h - capH - baseH;
    if (o.broken) {
      // shaft snapped off: jagged top with rebar/iron cramp showing
      const bh = sh * o.broken;
      K.flutedShaft(
        b,
        mat,
        x,
        y0 + baseH,
        z,
        r,
        r * (1 - 0.14 * o.broken),
        bh,
        24,
        tint,
      );
      const rr = K.rng((x * 31 + z * 7) | 0);
      for (let k = 0; k < 7; k++) {
        const a = (k / 7) * PI * 2;
        b.box(
          mat,
          x + Math.cos(a) * r * 0.5,
          y0 + baseH + bh - 0.05,
          z - Math.sin(a) * r * 0.5,
          r * 0.7,
          0.1 + rr() * 0.45,
          r * 0.5,
          { yaw: a, tint: tint.map((v) => v * 0.9) },
        );
      }
      b.pipe(
        "rust",
        x,
        y0 + baseH + bh - 0.2,
        z,
        x + 0.1,
        y0 + baseH + bh + 0.6,
        z + 0.05,
        0.03,
        4,
      );
      return;
    }
    K.flutedShaft(b, mat, x, y0 + baseH, z, r, r * 0.86, sh, 24, tint);
    const yc = y0 + h - capH,
      rt = r * 0.86;
    b.cyl(mat, x, yc - 0.06, z, rt * 1.08, rt * 1.08, 0.1, 16, { tint }); // astragal
    b.cyl(mat, x, yc, z, rt, rt * 1.28, capH * 0.78, 16, {
      tint: tint.map((v) => v * 0.94),
      top: false,
    }); // bell
    // acanthus: two tiers of 8 curled leaves (tilted plates with a thick tip)
    for (let tier = 0; tier < 2; tier++) {
      const lh = capH * (tier ? 0.5 : 0.36),
        ly = yc + (tier ? capH * 0.12 : 0),
        n = 8;
      for (let k = 0; k < n; k++) {
        const a = ((k + tier * 0.5) / n) * PI * 2,
          ca = Math.cos(a),
          sa = -Math.sin(a);
        const rb = rt * (1.02 + tier * 0.05),
          rtip = rt * (1.3 + tier * 0.1);
        b.beam(
          mat,
          x + ca * rb,
          ly,
          z + sa * rb,
          x + ca * rtip,
          ly + lh,
          z + sa * rtip,
          r * 0.42,
          0.07,
          { tint: tint.map((v) => v * (tier ? 1.0 : 0.9)) },
        );
        b.box(
          mat,
          x + ca * rtip * 1.02,
          ly + lh - 0.08,
          z + sa * rtip * 1.02,
          r * 0.3,
          0.16,
          0.16,
          { yaw: a, tint },
        );
      }
    }
    // corner volutes under the abacus
    for (let k = 0; k < 4; k++) {
      const a = PI / 4 + (k * PI) / 2,
        px = x + Math.cos(a) * r * 1.32,
        pz = z - Math.sin(a) * r * 1.32;
      b.geo(mat, K.unitCyl(8), {
        x: px,
        y: yc + capH * 0.8,
        z: pz,
        sx: capH * 0.14,
        sy: r * 0.32,
        sz: capH * 0.14,
        rx: PI / 2,
        ry: a + PI / 2,
        tint,
      });
    }
    b.box(mat, x, yc + capH * 0.78, z, r * 2.9, capH * 0.22, r * 2.9, {
      tint: tint.map((v) => v * 1.03),
      faces: "nsewtb",
    }); // abacus
    b.cyl(mat, x, yc + capH * 0.72, z, r * 0.22, r * 0.3, capH * 0.12, 6, {
      tint,
    }); // flower (fleuron) hint
  };

  /** Cast-iron lamp standard: fluted base, post, crossarm with two globes (dead or lit), finial. */
  K.lampStandard = function (b, x, y, z, yaw, o) {
    o = o || {};
    const H = o.h || 5.2,
      mat = "black_iron",
      lit = !!o.lit,
      bent = o.bent || 0;
    b.cyl(mat, x, y, z, 0.32, 0.24, 0.5, 8, { tint: [0.28, 0.28, 0.26] });
    b.cyl(mat, x, y + 0.5, z, 0.2, 0.14, 0.9, 8, { tint: [0.26, 0.26, 0.24] });
    const tx = x + Math.sin(yaw) * bent,
      tz = z + Math.cos(yaw) * bent;
    b.pipe(mat, x, y + 1.4, z, tx, y + H, tz, 0.075, 8, {
      tint: [0.24, 0.24, 0.22],
    });
    const Lc = K.L(tx, tz, yaw);
    const a = Lc(-0.75, 0),
      c = Lc(0.75, 0);
    b.beam(
      mat,
      a[0],
      y + H - 0.35,
      a[1],
      c[0],
      y + H - 0.35,
      c[1],
      0.07,
      0.07,
      { tint: [0.24, 0.24, 0.22] },
    );
    for (const g of [a, c]) {
      b.cyl(mat, g[0], y + H - 0.28, g[1], 0.08, 0.12, 0.1, 8);
      if (o.dead && Math.abs(g[0] - a[0]) < 1e-6 && o.oneGlobe) continue;
      b.geo(lit ? "lamp" : "glass", K.sphereGeo(), {
        x: g[0],
        y: y + H - 0.02,
        z: g[1],
        s: 0.24,
        tint: lit ? [1, 0.86, 0.6] : [0.62, 0.64, 0.58],
      });
      if (lit) b.glow(g[0], y + H, g[1], [0.9, 0.7, 0.45], 2.4);
    }
    b.cyl(mat, tx, y + H - 0.4, tz, 0.1, 0.02, 0.9, 6);
    if (o.col !== false)
      b.col(x - 0.3, y, z - 0.3, x + 0.3, y + H, z + 0.3, {
        tag: "prop",
        walkable: false,
      });
  };

  /** Blue street collection box (FO-style rounded top), facing yaw. */
  K.collectionBox = function (b, x, y, z, yaw, o) {
    o = o || {};
    const c = o.tint || [1, 1, 1],
      blue = "usps_blue",
      Lc = K.L(x, z, yaw);
    for (const [u, v] of [
      [-0.26, -0.2],
      [0.26, -0.2],
      [-0.26, 0.2],
      [0.26, 0.2],
    ]) {
      const p = Lc(u, v);
      b.box("black_iron", p[0], y, p[1], 0.06, 0.28, 0.06, { yaw });
    }
    b.box(blue, x, y + 0.28, z, 0.62, 0.92, 0.52, {
      yaw,
      tint: c,
      faces: "nsewt",
    });
    b.geo(blue, K.unitCyl(12), {
      x,
      y: y + 1.2,
      z,
      sx: 0.31,
      sy: 0.52,
      sz: 0.26,
      rz: PI / 2,
      ry: yaw,
      tint: c,
    });
    const f = Lc(0, -0.27);
    b.box("metal_dark", f[0], y + 0.92, f[1], 0.4, 0.12, 0.05, {
      yaw,
      tint: [0.3, 0.32, 0.36],
    }); // pull-down chute
    b.plate(
      "art",
      f[0],
      y + 0.6,
      f[1],
      -Math.sin(yaw),
      -Math.cos(yaw),
      0.46,
      0.46,
      K.eagleCell(),
      { off: 0.012 },
    );
  };

  /** 1950s rounded-cab mail truck (rust + faded postal livery). Front faces local −z. */
