// play-inline-385 03 — tint
// Lines 291-607 of readable/play-inline-385.pretty.js (statement-aligned).
  K.mailTruck = function (b, x, y, z, yaw, o) {
    o = o || {};
    const Lc = K.L(x, z, yaw),
      body = [0.82, 0.8, 0.74];
    // chassis & wheels (flat tyres)
    b.box("rust", x, y + 0.3, z, 1.8, 0.25, 4.6, {
      yaw,
      tint: [0.4, 0.3, 0.24],
    });
    for (const [u, v] of [
      [-0.85, -1.4],
      [0.85, -1.4],
      [-0.85, 1.45],
      [0.85, 1.45],
    ]) {
      const p = Lc(u, v);
      b.geo("rubber", K.unitCyl(12), {
        x: p[0],
        y: y + 0.36,
        z: p[1],
        sx: 0.4,
        sy: 0.24,
        sz: 0.4,
        rz: PI / 2,
        ry: yaw,
      });
      b.geo("rust", K.unitCyl(8), {
        x: p[0],
        y: y + 0.36,
        z: p[1],
        sx: 0.2,
        sy: 0.26,
        sz: 0.2,
        rz: PI / 2,
        ry: yaw,
        tint: [0.5, 0.4, 0.3],
      });
    }
    // cargo box (tall, rounded roof)
    const bc = Lc(0, 0.75);
    b.box("metal", bc[0], y + 0.55, bc[1], 1.9, 1.75, 3.0, {
      yaw,
      tint: body,
      faces: "nsewt",
    });
    b.geo("metal", K.unitCyl(12), {
      x: bc[0],
      y: y + 2.3,
      z: bc[1],
      sx: 0.95,
      sy: 3.0,
      sz: 0.25,
      rx: PI / 2,
      ry: yaw,
      tint: body,
    });
    // cab: bulbous nose + windscreen
    const cc = Lc(0, -1.45);
    b.box("metal", cc[0], y + 0.55, cc[1], 1.9, 1.05, 1.5, { yaw, tint: body });
    b.geo("metal", K.sphereGeo(), {
      x: Lc(0, -2.1)[0],
      y: y + 1.0,
      z: Lc(0, -2.1)[1],
      sx: 0.95,
      sy: 0.55,
      sz: 0.55,
      ry: yaw,
      tint: body,
    });
    const wc = Lc(0, -1.35);
    b.box("glass_dark", wc[0], y + 1.6, wc[1], 1.75, 0.65, 1.1, {
      yaw,
      tint: [0.3, 0.34, 0.33],
    });
    b.box("metal", wc[0], y + 2.25, wc[1], 1.85, 0.08, 1.2, {
      yaw,
      tint: body,
    });
    // livery stripes (red / blue) and the eagle
    for (const s of [-1, 1]) {
      const p = Lc(s * 0.96, 0.75),
        q = Lc(s * 0.96, -1.9);
      b.beam(
        "usps_red",
        p[0],
        y + 1.3,
        p[1] + 0,
        q[0],
        y + 1.3,
        q[1],
        0.02,
        0.14,
        {},
      );
      b.beam(
        "usps_blue",
        p[0],
        y + 1.12,
        p[1],
        q[0],
        y + 1.12,
        q[1],
        0.02,
        0.14,
        {},
      );
      const e = Lc(s * 0.97, 0.9);
      b.plate(
        "art",
        e[0],
        y + 1.75,
        e[1],
        s * Math.cos(yaw),
        -s * Math.sin(yaw),
        0.8,
        0.8,
        K.eagleCell(),
        { off: 0.02 },
      );
    }
    // bumper, headlamps
    const bp = Lc(0, -2.35);
    b.box("chrome", bp[0], y + 0.42, bp[1], 1.95, 0.16, 0.14, {
      yaw,
      tint: [0.5, 0.48, 0.44],
    });
    for (const s of [-1, 1]) {
      const hp = Lc(s * 0.6, -2.3);
      b.geo("glass", K.sphereGeo(), {
        x: hp[0],
        y: y + 0.95,
        z: hp[1],
        s: 0.12,
      });
    }
    b.burn(x, y + 1.2, z, o.burn || 1.6, 0.35);
    if (o.col !== false)
      b.ocol(x, z, 2.0, 4.9, y, y + 2.5, yaw, { tag: "car", surface: "metal" });
  };

  /** Letter sorting case: pigeonhole grid (atlas) in a wooden frame, facing local −z. w wide, h high. */
  K.sortCase = function (b, x, y, z, yaw, w, o) {
    o = o || {};
    const h = o.h || 1.7,
      d = 0.36,
      mat = o.mat || "oak",
      Lc = K.L(x, z, yaw),
      fx = -Math.sin(yaw),
      fz = -Math.cos(yaw);
    b.box(mat, x, y + 0.75, z, w, 0.04, d + 0.14, {
      yaw,
      faces: "nsewtb",
      tint: o.tint,
    }); // ledge
    b.box(mat, x, y, z, w, 0.75, d, {
      yaw,
      faces: "nsewt",
      tint: (o.tint || [1, 1, 1]).map((v) => v * 0.8),
    }); // base cabinet
    const back = Lc(0, 0.15);
    b.box(mat, back[0], y + 0.79, back[1], w, h - 0.79, 0.04, {
      yaw,
      tint: o.tint,
    });
    for (const s of [-1, 1]) {
      const p = Lc(s * (w / 2 - 0.02), 0);
      b.box(mat, p[0], y + 0.79, p[1], 0.04, h - 0.79, d, {
        yaw,
        tint: o.tint,
      });
    }
    const top = Lc(0, 0);
    b.box(mat, top[0], y + h, top[1], w + 0.06, 0.05, d + 0.04, {
      yaw,
      tint: o.tint,
      faces: "nsewtb",
    });
    // the pigeonholes: one atlas plate recessed a little + a few proud slats (depth read)
    const pc = Lc(0, 0.12);
    b.plate(
      "art",
      pc[0],
      y + 0.79 + (h - 0.79) / 2,
      pc[1],
      fx,
      fz,
      w - 0.08,
      h - 0.85,
      K.pigeonCell(o.variant || 0),
      { off: 0 },
    );
    const rows = 5;
    for (let k = 1; k < rows; k++) {
      const s0 = Lc(-w / 2 + 0.04, -0.15),
        s1 = Lc(w / 2 - 0.04, -0.15);
      const yy = y + 0.79 + (k * (h - 0.85)) / rows;
      b.beam(mat, s0[0], yy, s0[1], s1[0], yy, s1[1], 0.02, 0.3, {
        tint: o.tint,
      });
    }
    // label strip
    const lb = Lc(0, -d / 2 - 0.01);
    b.plate(
      "art",
      lb[0],
      y + 0.66,
      lb[1],
      fx,
      fz,
      Math.min(w - 0.2, 1.2),
      0.1,
      K.signCell(
        "ppn_case_lbl" + (o.label || "X"),
        o.label || "CITY ROUTES 1-40",
        256,
        22,
        {
          bg: "#d8ccaa",
          fg: "#2a2418",
          font: "Courier New, monospace",
          weather: false,
        },
      ),
      { off: 0.01 },
    );
    if (o.col !== false)
      b.ocol(x, z, w, d + 0.14, y, y + h, yaw, {
        tag: "furniture",
        surface: "wood",
        walkable: false,
      });
  };

  /** Belt conveyor from A to B at belt height yb (world y of belt top). Returns nothing. */
  K.conveyor = function (b, ax, az, bx, bz, y, yb, o) {
    o = o || {};
    const len = Math.hypot(bx - ax, bz - az);
    if (len < 0.1) return;
    const ux = (bx - ax) / len,
      uz = (bz - az) / len,
      nx = uz,
      nz = -ux,
      W = o.w || 0.8;
    // belt
    b.quadN(
      "rubber",
      [ax + (nx * W) / 2, yb, az + (nz * W) / 2],
      [bx + (nx * W) / 2, yb, bz + (nz * W) / 2],
      [bx - (nx * W) / 2, yb, bz - (nz * W) / 2],
      [ax - (nx * W) / 2, yb, az - (nz * W) / 2],
      [0, 1, 0],
      { tint: [0.16, 0.16, 0.15] },
    );
    // side rails
    for (const s of [-1, 1])
      b.beam(
        "metal",
        ax + nx * s * (W / 2 + 0.04),
        yb + 0.02,
        az + nz * s * (W / 2 + 0.04),
        bx + nx * s * (W / 2 + 0.04),
        yb + 0.02,
        bz + nz * s * (W / 2 + 0.04),
        0.06,
        0.18,
        { tint: o.tint || [0.45, 0.5, 0.42] },
      );
    // underside + legs every ~2 m
    b.beam("metal_dark", ax, yb - 0.12, az, bx, yb - 0.12, bz, W, 0.16, {
      tint: [0.4, 0.4, 0.38],
    });
    const n = Math.max(1, Math.round(len / 2.2));
    for (let i = 0; i <= n; i++) {
      const t = i / n,
        px = ax + (bx - ax) * t,
        pz = az + (bz - az) * t;
      for (const s of [-1, 1])
        b.beam(
          "metal",
          px + nx * s * W * 0.42,
          y,
          pz + nz * s * W * 0.42,
          px + nx * s * W * 0.42,
          yb - 0.2,
          pz + nz * s * W * 0.42,
          0.06,
          0.06,
          { tint: o.tint || [0.45, 0.5, 0.42] },
        );
    }
    // end drums
    for (const [px, pz] of [
      [ax, az],
      [bx, bz],
    ])
      b.geo("metal_dark", K.unitCyl(10), {
        x: px,
        y: yb - 0.1,
        z: pz,
        sx: 0.12,
        sy: W,
        sz: 0.12,
        rz: PI / 2,
        ry: Math.atan2(nx, nz) + PI / 2,
      });
    if (o.col !== false) {
      const cx = (ax + bx) / 2,
        cz = (az + bz) / 2;
      b.ocol(cx, cz, W + 0.2, len, y, yb + 0.2, Math.atan2(ux, uz), {
        tag: "furniture",
        surface: "metal",
        walkable: true,
      });
    }
  };

  /** Canvas mail hamper on castors. */
