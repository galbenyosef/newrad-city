// play-inline-109 03 — yaw
// Lines 344-683 of readable/play-inline-109.pretty.js (statement-aligned).
  P.stall = function (b, x, z, w, yaw, o) {
    o = o || {};
    const r = K.rng(o.seed || x * 5 + z * 11);
    const f = frame(x, 0, z, yaw);
    const y0 = o.y || 0;
    const cp = f.p(0, 0, 0.5);
    b.box(o.counterMat || "wood", cp[0], y0, cp[2], w, 1.05, 0.6, {
      yaw,
      grime: 0.5,
    });
    b.box("metal", cp[0], y0 + 1.05, cp[2], w + 0.1, 0.05, 0.7, {
      yaw,
      grime: 0.3,
    });
    // posts
    for (const sx of [-w / 2, w / 2])
      for (const sz of [-1.2, 0.8]) {
        const p = f.p(sx, 0, sz);
        b.beam("wood", p[0], y0, p[2], p[0], y0 + 2.6, p[2], 0.1);
      }
    // awning (sloped fabric, colour-tinted stripes via tint)
    const ap = f.p(0, 0, -0.2);
    const col =
      o.color ||
      [0xa83a2a, 0x3a6a8a, 0xc8a040, 0x5a7a3a, 0x8a5a8a][Math.floor(r() * 5)];
    b.geo("fabric", T.box, {
      x: ap[0],
      y: y0 + 2.62,
      z: ap[2],
      ry: yaw,
      rx: 0.22,
      sx: w + 0.5,
      sy: 0.03,
      sz: 2.4,
      tint: col,
      grime: 0.3,
    });
    // back shelves with goods
    const sp = f.p(0, 0, -1.15);
    b.box("wood_rotten", sp[0], y0, sp[2], w * 0.9, 1.9, 0.4, {
      yaw,
      grime: 0.5,
      faces: "nsewt",
    });
    for (let k = 0; k < 10; k++) {
      const gp = f.p((r() - 0.5) * w * 0.8, 0, -1.0 + (r() - 0.5) * 0.1);
      const gy = y0 + [0.55, 1.1, 1.62][Math.floor(r() * 3)];
      const gm = ["paint_red", "metal", "paint_blue", "paint_yellow", "glass"][
        Math.floor(r() * 5)
      ];
      if (r() < 0.5)
        b.cyl(gm, gp[0], gy, gp[2], 0.06, 0.06, 0.22, 6, { grime: 0.2 });
      else
        b.box(gm, gp[0], gy, gp[2], 0.22, 0.28, 0.16, { yaw: r(), grime: 0.2 });
    }
    // counter items
    for (let k = 0; k < 4; k++) {
      const gp = f.p((r() - 0.5) * w * 0.8, 0, 0.5);
      b.box(
        r() < 0.5 ? "paint_green" : "rust",
        gp[0],
        y0 + 1.1,
        gp[2],
        0.3,
        0.18,
        0.2,
        { yaw: r() * 3, grime: 0.3 },
      );
    }
    // crates beside
    const kp = f.p(w / 2 + 0.6, 0, 0.2);
    P.crate(b, kp[0], y0, kp[2], 0.7, yaw + r());
    if (r() < 0.6) P.crate(b, kp[0], y0 + 0.7, kp[2], 0.55, yaw + r() * 2);
    if (o.collide !== false)
      K.colRot(cp[0], cp[2], w, 0.6, y0, y0 + 1.1, yaw, {
        surface: "wood",
        tag: "cover",
      });
    const back = f.p(0, 0, -1.2);
    if (o.collide !== false)
      K.colRot(back[0], back[2], w * 0.9, 0.4, y0, y0 + 1.9, yaw, {
        surface: "wood",
      });
    return f.p(0, 0, 1.6); // customer stands here; vendor at f.p(0,0,-0.4)
  };

  // ------------------------------------------------------------------
  // Clutter
  // ------------------------------------------------------------------
  P.crate = function (b, x, y, z, s, yaw, o) {
    o = o || {};
    b.box(o.mat || "wood", x, y, z, s, s * 0.8, s, {
      yaw,
      grime: 0.5,
      tint: o.tint,
    });
    // slats
    b.box("wood_dark", x, y + s * 0.38, z, s * 1.02, s * 0.06, s * 1.02, {
      yaw,
      grime: 0.3,
    });
    return b;
  };
  P.barrel = function (b, x, y, z, kind, o) {
    o = o || {};
    const mat =
      kind === "red"
        ? "paint_red"
        : kind === "hazard"
          ? "paint_yellow"
          : kind === "blue"
            ? "paint_blue"
            : "rust";
    b.cyl(mat, x, y, z, 0.3, 0.3, 0.9, 10, {
      grime: 0.7,
      top: kind !== "fire",
    });
    b.cyl("rust", x, y + 0.28, z, 0.31, 0.31, 0.05, 10, {
      grime: 0.6,
      top: false,
    });
    b.cyl("rust", x, y + 0.62, z, 0.31, 0.31, 0.05, 10, {
      grime: 0.6,
      top: false,
    });
    if (kind === "fire") {
      b.cyl("rubble", x, y + 0.7, z, 0.27, 0.2, 0.12, 8, {
        grime: 1,
        tint: 0x333333,
      });
      if (o.glows) o.glows.add(x, y + 1.15, z, 0xff8a30, "m");
      K.fire(x, y + 0.95, z, 0.6);
    } // ('m': a 6 m 'l' halo at head height + the fx flames blew out to a white blob)
    if (kind === "hazard" && o.glows)
      o.glows.add(x, y + 0.95, z, 0xc8ff5a, "m");
    if (o.collide)
      K.colBox(x - 0.3, y, z - 0.3, x + 0.3, y + 0.9, z + 0.3, {
        surface: "metal",
        tag: "cover",
      });
    return b;
  };
  P.tire = function (b, x, y, z, flat) {
    b.geo("rubber", T.torusThick, {
      x,
      y: y + (flat ? 0 : 0.35),
      z,
      rx: flat ? Math.PI / 2 : 0,
      ry: x * 0.3,
      s: 0.32,
      grime: 0,
    });
    return b;
  };
  P.mattress = function (b, x, y, z, yaw) {
    b.box("fabric", x, y, z, 0.9, 0.18, 1.9, {
      yaw,
      tint: 0xb8a888,
      grime: 0.8,
    });
    return b;
  };
  P.table = function (b, x, y, z, yaw, o) {
    o = o || {};
    const f = frame(x, y, z, yaw);
    const w = o.w || 1.2,
      d = o.d || 0.7;
    b.box(o.mat || "wood", x, y + 0.72, z, w, 0.05, d, { yaw, grime: 0.4 });
    for (const sx of [-1, 1])
      for (const sz of [-1, 1]) {
        const p = f.p(sx * (w / 2 - 0.06), 0, sz * (d / 2 - 0.06));
        b.beam(o.mat || "wood", p[0], y, p[2], p[0], y + 0.72, p[2], 0.05);
      }
    return b;
  };
  P.chair = function (b, x, y, z, yaw, o) {
    o = o || {};
    const f = frame(x, y, z, yaw);
    const m = o.mat || "wood";
    if (o.fallen) {
      b.geo(m, T.box, {
        x,
        y: y + 0.22,
        z,
        ry: yaw,
        rx: Math.PI / 2,
        sx: 0.44,
        sy: 0.04,
        sz: 0.44,
      });
      b.geo(m, T.box, {
        x: f.p(0, 0, -0.25)[0],
        y: y + 0.05,
        z: f.p(0, 0, -0.25)[2],
        ry: yaw,
        sx: 0.44,
        sy: 0.04,
        sz: 0.5,
      });
      return b;
    }
    b.box(m, x, y + 0.44, z, 0.44, 0.04, 0.44, { yaw, grime: 0.4 });
    for (const sx of [-1, 1])
      for (const sz of [-1, 1]) {
        const p = f.p(sx * 0.19, 0, sz * 0.19);
        b.beam(m, p[0], y, p[2], p[0], y + 0.44, p[2], 0.035);
      }
    const bp = f.p(0, 0, -0.2);
    b.box(m, bp[0], y + 0.46, bp[2], 0.44, 0.45, 0.04, { yaw, grime: 0.4 });
    return b;
  };
  P.bench = function (b, x, z, yaw, o) {
    o = o || {};
    const f = frame(x, 0, z, yaw);
    for (const sx of [-0.8, 0.8]) {
      const p = f.p(sx, 0, 0);
      b.box("black_metal", p[0], 0, p[2], 0.08, 0.45, 0.5, { yaw });
    }
    for (let k = 0; k < 3; k++) {
      const p = f.p(0, 0, -0.15 + k * 0.15);
      b.box(o.mat || "wood", p[0], 0.45, p[2], 1.9, 0.04, 0.12, {
        yaw,
        grime: 0.5,
      });
    }
    for (let k = 0; k < 2; k++) {
      const p = f.p(0, 0, -0.25);
      b.box(o.mat || "wood", p[0], 0.62 + k * 0.18, p[2], 1.9, 0.1, 0.03, {
        yaw,
        grime: 0.5,
      });
    }
    return b;
  };
  P.lampPost = function (b, glows, x, z, h, o) {
    o = o || {};
    h = h || 4.5;
    b.cyl("black_metal", x, 0, z, 0.14, 0.08, h, 8, { grime: 0.3 });
    b.cyl("black_metal", x, 0, z, 0.22, 0.2, 0.6, 8, { grime: 0.3 });
    if (o.globe !== false) {
      b.geo(o.broken ? "glass_broken" : "lit_warm", T.sphereLo, {
        x,
        y: h + 0.25,
        z,
        s: 0.25,
      });
      b.cyl("black_metal", x, h + 0.45, z, 0.1, 0.2, 0.12, 8);
      if (!o.broken && glows)
        glows.add(x, h + 0.25, z, o.color || 0xffc880, "m");
    }
    return b;
  };
  P.skeleton = function (b, x, y, z, yaw) {
    const f = frame(x, y, z, yaw);
    const sk = f.p(0, 0.12, 0.8);
    b.geo("bone", T.sphereLo, {
      x: sk[0],
      y: sk[1],
      z: sk[2],
      sx: 0.1,
      sy: 0.11,
      sz: 0.12,
    });
    const a = f.p(0, 0.08, 0.6),
      c = f.p(0, 0.08, -0.1);
    b.beam("bone", a[0], a[1], a[2], c[0], c[1], c[2], 0.05);
    for (let i = 0; i < 4; i++) {
      const p = f.p(0, 0.1, 0.5 - i * 0.1);
      const l = f.p(-0.14, 0.05, 0.5 - i * 0.1),
        rr = f.p(0.14, 0.05, 0.5 - i * 0.1);
      b.beam("bone", l[0], l[1], l[2], rr[0], rr[1], rr[2], 0.02);
      void p;
    }
    for (const s of [-1, 1]) {
      const h1 = f.p(s * 0.1, 0.05, -0.1),
        k = f.p(s * 0.15, 0.05, -0.55),
        ft = f.p(s * 0.12, 0.05, -0.95);
      b.beam("bone", h1[0], h1[1], h1[2], k[0], k[1], k[2], 0.035);
      b.beam("bone", k[0], k[1], k[2], ft[0], ft[1], ft[2], 0.03);
    }
    for (const s of [-1, 1]) {
      const sh = f.p(s * 0.17, 0.08, 0.55),
        el = f.p(s * 0.35, 0.05, 0.3),
        hd = f.p(s * 0.3, 0.05, 0.05);
      b.beam("bone", sh[0], sh[1], sh[2], el[0], el[1], el[2], 0.03);
      b.beam("bone", el[0], el[1], el[2], hd[0], hd[1], hd[2], 0.025);
    }
    return b;
  };
  P.rubblePile = function (b, x, z, r, h, o) {
    o = o || {};
    const rn = K.rng(o.seed || x * 17 + z * 13);
    b.geo("rubble", T.dodeca, {
      x,
      y: -h * 0.35,
      z,
      sx: r,
      sy: h,
      sz: r * (0.8 + rn() * 0.4),
      ry: rn() * 3,
      grime: 0.6,
    });
    const n = o.n || Math.round(r * 4);
    for (let i = 0; i < n; i++) {
      const a = rn() * Math.PI * 2,
        d = r * (0.4 + rn() * 0.8);
      const s = 0.2 + rn() * 0.6;
      b.geo(rn() < 0.7 ? o.mat || "concrete" : "brick_red", T.box, {
        x: x + Math.cos(a) * d,
        y: s * 0.3 + rn() * h * 0.4,
        z: z + Math.sin(a) * d,
        rx: rn() * 3,
        ry: rn() * 3,
        rz: rn() * 3,
        sx: s * 1.4,
        sy: s * 0.6,
        sz: s,
        grime: 0.6,
      });
    }
    // rebar
    for (let i = 0; i < 3; i++) {
      const a = rn() * 6.28,
        d = rn() * r * 0.6;
      b.beam(
        "rust",
        x + Math.cos(a) * d,
        h * 0.3,
        z + Math.sin(a) * d,
        x + Math.cos(a) * d + (rn() - 0.5) * 2,
        h * (0.6 + rn()),
        z + Math.sin(a) * d + (rn() - 0.5) * 2,
        0.03,
      );
    }
    if (o.collide)
      K.colRot(x, z, r * 1.3, r * 1.3, 0, h * 0.55, 0, { surface: "rubble" });
    return b;
  };
  /** Car hulk (rounded late-1950s sedan silhouette, tail fins). */
