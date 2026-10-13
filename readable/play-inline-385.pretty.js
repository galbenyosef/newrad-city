/* src/poi_penn/08_penn.js */
/* =====================================================================
 * NEW RAD CITY — poi_penn / 08_penn.js
 * Geometry + atlas helpers for the two Penn-district POIs (the James A.
 * Farley General Post Office and the Hotel Pennsylvania). All local
 * coords on a kit builder `b`; objects "face" local −z rotated by yaw
 * (use K.faceYaw(fx, fz) to point one at a world direction).
 *   K.corinthian   Corinthian column (base, fluted shaft, acanthus bell, volutes, abacus)
 *   K.lampStandard cast-iron lamp standard (post, crossarm, globes) — lit or dead
 *   K.collectionBox USPS-style blue street collection box
 *   K.mailTruck    1950s rounded-cab mail truck wreck (period silhouette)
 *   K.sortCase     letter sorting case (pigeonholes painted in the atlas)
 *   K.conveyor     belt conveyor on legs, returns the belt top height
 *   K.hamper       canvas mail hamper cart
 *   K.sack         bulging mail sack
 *   K.switchboard  hotel PBX cord switchboard (jack field, keys, cords)
 *   K.piano        grand piano (lid up)          K.drums  drum kit
 *   K.elevatorDoor brass elevator doors + floor-indicator dial
 *   K.bathtub      claw-foot tub
 * Atlas painters: pigeonholes, PO boxes, postal posters, eagle relief,
 * key-cubby wall, jack field, frieze inscription, carpet runner…
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE) return;
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
  K.elevatorDoor = function (b, x, y, z, nx, nz, o) {
    o = o || {};
    const rx = nz,
      rz = -nx,
      W = 1.3,
      H = 2.4,
      open = o.open || 0;
    const P = (u, v, d) => [x + rx * u + nx * d, y + v, z + rz * u + nz * d];
    // surround with the dial above
    const sr = (u, v, w, h, d, mat, tint) => {
      const c = P(u, v, d / 2);
      b.box(
        mat,
        c[0],
        c[1],
        c[2],
        Math.abs(rx) > 0.5 ? w : d,
        h,
        Math.abs(rx) > 0.5 ? d : w,
        { tint },
      );
    };
    sr(-W / 2 - 0.15, 0, 0.3, H + 0.3, 0.12, "gilt", [0.7, 0.55, 0.3]);
    sr(W / 2 + 0.15, 0, 0.3, H + 0.3, 0.12, "gilt", [0.7, 0.55, 0.3]);
    sr(0, H, W, 0.3, 0.12, "gilt", [0.7, 0.55, 0.3]);
    const dial = P(0, H + 0.62, 0.07);
    b.cyl("gilt", dial[0], dial[1] - 0.02, dial[2], 0.01, 0.01, 0.01, 4);
    b.plate(
      "art",
      dial[0],
      dial[1],
      dial[2],
      nx,
      nz,
      0.9,
      0.46,
      K.dialCell(o.floor || "L"),
      { off: 0.0 },
    );
    // leaves
    const lw = W / 2 - open / 2;
    if (lw > 0.02)
      for (const s of [-1, 1]) {
        const cu = s * (open / 2 + lw / 2);
        const c = P(cu, 0, 0.03);
        b.box(
          "brass",
          c[0],
          c[1],
          c[2],
          Math.abs(rx) > 0.5 ? lw : 0.04,
          H,
          Math.abs(rx) > 0.5 ? 0.04 : lw,
          { tint: [0.62, 0.5, 0.3], grime: 0.45 },
        );
        for (const vv of [0.5, 1.4]) {
          const d = P(cu, vv, 0.055);
          b.box(
            "gilt",
            d[0],
            d[1],
            d[2],
            Math.abs(rx) > 0.5 ? lw * 0.7 : 0.02,
            0.6,
            Math.abs(rx) > 0.5 ? 0.02 : lw * 0.7,
            { tint: [0.55, 0.45, 0.28] },
          );
        }
      }
    if (open > 0.05) {
      const c = P(0, 0, -0.2);
      b.box(
        "paint_black",
        c[0],
        c[1],
        c[2],
        Math.abs(rx) > 0.5 ? open : 0.02,
        H,
        Math.abs(rx) > 0.5 ? 0.02 : open,
        { tint: [0.02, 0.02, 0.02] },
      );
    }
  };

  /** Claw-foot bathtub. */
  K.bathtub = function (b, x, y, z, yaw, o) {
    o = o || {};
    const Lc = K.L(x, z, yaw);
    for (const [u, v] of [
      [-0.3, -0.7],
      [0.3, -0.7],
      [-0.3, 0.7],
      [0.3, 0.7],
    ]) {
      const p = Lc(u, v);
      b.geo("brass", K.sphereGeo(), {
        x: p[0],
        y: y + 0.08,
        z: p[1],
        s: 0.08,
        tint: [0.5, 0.4, 0.25],
      });
    }
    b.geo("ceramic", K.unitCyl(14), {
      x,
      y: y + 0.42,
      z,
      sx: 0.42,
      sy: 0.55,
      sz: 0.92,
      ry: yaw,
      tint: [0.86, 0.84, 0.78],
    });
    b.geo(o.fill || "paint_black", K.unitCyl(14), {
      x,
      y: y + 0.66,
      z,
      sx: 0.36,
      sy: 0.02,
      sz: 0.84,
      ry: yaw,
      tint: o.fillTint || [0.25, 0.22, 0.16],
    });
    if (o.col !== false)
      b.ocol(x, z, 0.85, 1.85, y, y + 0.7, yaw, {
        tag: "furniture",
        surface: "metal",
      });
  };

  // ------------------------------------------------------------------
  // Real swinging doors (interior): own small mesh with the SAME baked light as the room
  // ------------------------------------------------------------------
  /**
   * K.hingedDoor(ctx, b, o) — a door leaf that swings open on E (through G.locks when it has a lock).
   * o: {id, x, z, y (local floor), w, h, axis:'x'|'z' (wall runs along), hinge:-1|1 (which end), swing:±1 (opening side),
   *     mat, tint, glass (upper glass pane), sign (atlas rect on the leaf), lock ({id, key|code}), label, flag (state key)}
   * The leaf is built with a builder that copies b's lights, so it matches the room. Collider while closed.
   */
  K.hingedDoor = function (ctx, b, o) {
    (ctx._doorSpecs = ctx._doorSpecs || []).push([b, o]);
  };
  /** Build every door queued with K.hingedDoor (call right before b.finish so all room lights are known). */
  K.buildDoors = function (ctx) {
    for (const [b, o] of ctx._doorSpecs || [])
      K.safe("door " + o.id, () => buildHinged(ctx, b, o));
    ctx._doorSpecs = [];
  };
  function buildHinged(ctx, b, o) {
    const O = ctx.O,
      w = o.w || 1.1,
      h = o.h || 2.2,
      y = o.y || 0,
      th = 0.06;
    const db = K.builder({
      name: "door_" + o.id,
      off: O,
      lit: b.lit,
      amb: b.amb,
      floors: [y],
      grime: 0.35,
    });
    db.lights = b.lights.slice();
    const alongX = o.axis !== "z";
    // hinge point (local)
    const hx = alongX ? o.x + ((o.hinge || -1) * w) / 2 : o.x,
      hz = alongX ? o.z : o.z + ((o.hinge || -1) * w) / 2;
    const cx = o.x,
      cz = o.z;
    const mat = o.mat || "wood_dark",
      tint = o.tint || [0.55, 0.4, 0.28];
    if (alongX) {
      db.boxMM(
        mat,
        cx - w / 2 + 0.01,
        y + 0.01,
        cz - th / 2,
        cx + w / 2 - 0.01,
        y + h,
        cz + th / 2,
        { tint, faces: "nsewtb" },
      );
      for (const s of [-1, 1]) {
        db.boxMM(
          mat,
          cx - w / 2 + 0.12,
          y + 0.2,
          cz + s * (th / 2 + 0.012) - 0.012,
          cx + w / 2 - 0.12,
          y + h * 0.42,
          cz + s * (th / 2 + 0.012) + 0.012,
          { tint: tint.map((v) => v * 0.85) },
        );
        if (o.glass)
          db.boxMM(
            "glass",
            cx - w / 2 + 0.14,
            y + h * 0.52,
            cz + s * 0.001,
            cx + w / 2 - 0.14,
            y + h - 0.14,
            cz + s * 0.001 + 0.004,
            { tint: [0.45, 0.5, 0.48] },
          );
        else
          db.boxMM(
            mat,
            cx - w / 2 + 0.12,
            y + h * 0.5,
            cz + s * (th / 2 + 0.012) - 0.012,
            cx + w / 2 - 0.12,
            y + h - 0.14,
            cz + s * (th / 2 + 0.012) + 0.012,
            { tint: tint.map((v) => v * 0.85) },
          );
        const kx = cx - (o.hinge || -1) * (w / 2 - 0.1);
        db.geo("brass", K.sphereGeo(), {
          x: kx,
          y: y + 1.0,
          z: cz + s * 0.07,
          s: 0.04,
        });
        if (o.sign)
          db.plate(
            "art",
            cx,
            y + h * 0.7,
            cz + s * (th / 2 + 0.03),
            0,
            s,
            Math.min(0.8, w - 0.3),
            0.3,
            o.sign,
            { off: 0 },
          );
      }
    } else {
      db.boxMM(
        mat,
        cx - th / 2,
        y + 0.01,
        cz - w / 2 + 0.01,
        cx + th / 2,
        y + h,
        cz + w / 2 - 0.01,
        { tint, faces: "nsewtb" },
      );
      for (const s of [-1, 1]) {
        db.boxMM(
          mat,
          cx + s * (th / 2 + 0.012) - 0.012,
          y + 0.2,
          cz - w / 2 + 0.12,
          cx + s * (th / 2 + 0.012) + 0.012,
          y + h * 0.42,
          cz + w / 2 - 0.12,
          { tint: tint.map((v) => v * 0.85) },
        );
        if (o.glass)
          db.boxMM(
            "glass",
            cx + s * 0.001,
            y + h * 0.52,
            cz - w / 2 + 0.14,
            cx + s * 0.001 + 0.004,
            y + h - 0.14,
            cz + w / 2 - 0.14,
            { tint: [0.45, 0.5, 0.48] },
          );
        else
          db.boxMM(
            mat,
            cx + s * (th / 2 + 0.012) - 0.012,
            y + h * 0.5,
            cz - w / 2 + 0.12,
            cx + s * (th / 2 + 0.012) + 0.012,
            y + h - 0.14,
            cz + w / 2 - 0.12,
            { tint: tint.map((v) => v * 0.85) },
          );
        const kz = cz - (o.hinge || -1) * (w / 2 - 0.1);
        db.geo("brass", K.sphereGeo(), {
          x: cx + s * 0.07,
          y: y + 1.0,
          z: kz,
          s: 0.04,
        });
        if (o.sign)
          db.plate(
            "art",
            cx + s * (th / 2 + 0.03),
            y + h * 0.7,
            cz,
            s,
            0,
            Math.min(0.8, w - 0.3),
            0.3,
            o.sign,
            { off: 0 },
          );
      }
    }
    const g = db.finish(null);
    // re-pivot on the hinge
    const wx = hx + O.x,
      wy = y + O.y,
      wz = hz + O.z;
    g.traverse((m) => {
      if (m.isMesh && m.geometry) {
        m.geometry.translate(-wx, -wy, -wz);
        m.geometry.computeBoundingSphere();
      }
    });
    g.position.set(wx, wy, wz);
    (ctx.intRoot || ctx.extRoot).add(g);
    const D = {
      id: o.id,
      g,
      open: 0,
      target: 0,
      swing: (o.swing || 1) * (o.hinge || -1) * (alongX ? 1 : -1),
      col: null,
      o,
    };
    const addCol = () => {
      if (D.col) return;
      D.col = alongX
        ? G.world.addBox(
            cx - w / 2 + O.x,
            y + O.y,
            cz - 0.08 + O.z,
            cx + w / 2 + O.x,
            y + h + O.y,
            cz + 0.08 + O.z,
            { tag: "door", surface: "wood" },
          )
        : G.world.addBox(
            cx - 0.08 + O.x,
            y + O.y,
            cz - w / 2 + O.z,
            cx + 0.08 + O.x,
            y + h + O.y,
            cz + w / 2 + O.z,
            { tag: "door", surface: "wood" },
          );
    };
    const remCol = () => {
      if (D.col) {
        K.safe("door col", () => G.world.removeCollider(D.col));
        D.col = null;
      }
    };
    addCol();
    const fk = "door_" + o.id;
    if (o.lock) PV.lockReg(o.lock);
    const locked = () =>
      o.lock &&
      !PV.flag(fk + "_unlocked") &&
      !(PV.locksLive() && G.locks.isOpen && G.locks.isOpen(o.lock.id))
        ? 1
        : 0;
    const setOpen = (v) => {
      D.target = v ? 1 : 0;
      if (v) remCol();
      else addCol();
      K.sfx(v ? "door_open" : "container_close", K.world(ctx, cx, y + 1, cz), {
        volume: 0.7,
      });
    };
    D.setOpen = setOpen;
    D.reset = () => {
      D.target = 0;
      D.open = 0;
      D.g.rotation.y = 0;
      addCol();
    };
    D.locked = locked;
    ctx.interactables.push(
      G.world.addInteractable({
        pos: K.world(ctx, cx, y + 1.1, cz),
        radius: 0.8,
        priority: 1,
        label: () => o.label || "Door",
        verb: () => (D.target ? "Close" : "Open"),
        locked: () => (locked() ? "Locked" : null),
        onInteract: () => {
          if (locked()) {
            if (!PV.locksLive() && !(o.lock.key && K.has(o.lock.key))) {
              K.sfx("door_locked", null);
              K.notify("This door is locked.");
              return;
            }
            PV.lockOpen(o.lock, () => {
              PV.setFlag(fk + "_unlocked", true);
              setOpen(true);
            });
            return;
          }
          setOpen(!D.target);
        },
      }),
    );
    (ctx.swingDoors = ctx.swingDoors || []).push(D);
    return D;
  }
  /** Animate swing doors (called from the POI update). */
  K.updateDoors = function (ctx, dt) {
    for (const D of ctx.swingDoors || []) {
      if (Math.abs(D.open - D.target) < 1e-3) continue;
      D.open +=
        Math.sign(D.target - D.open) *
        Math.min(Math.abs(D.target - D.open), dt * 2.2);
      D.g.rotation.y = D.swing * D.open * PI * 0.5;
    }
  };

  /** Unlit backdrop plane (skyline beyond a blown-out wall): {rect, pos:[x,y,z] local, n:[nx,nz], w, h, tint}. */
  K.backdrop = function (ctx, bd) {
    const rc = bd.rect,
      base = K.mat(K.atlasMat("pics", rc), true);
    const m = new THREE.MeshBasicMaterial({
      map: base.map,
      color: new THREE.Color(bd.tint || 1, bd.tint || 1, bd.tint || 1),
      fog: false,
      toneMapped: true,
    });
    const geo = new THREE.PlaneGeometry(bd.w, bd.h);
    const uv = geo.attributes.uv;
    for (let i = 0; i < uv.count; i++)
      uv.setXY(
        i,
        rc[0] + (rc[2] - rc[0]) * uv.getX(i),
        rc[1] + (rc[3] - rc[1]) * uv.getY(i),
      );
    const mesh = new THREE.Mesh(geo, m);
    mesh.position.set(
      bd.pos[0] + ctx.O.x,
      bd.pos[1] + ctx.O.y,
      bd.pos[2] + ctx.O.z,
    );
    mesh.rotation.y = Math.atan2(bd.n[0], bd.n[1]);
    mesh.name = "ppn_backdrop";
    (ctx.intRoot || ctx.extRoot).add(mesh);
    return mesh;
  };

  // ------------------------------------------------------------------
  // Atlas painters
  // ------------------------------------------------------------------
  /** Bald eagle roundel (postal seal / hotel crest style), transparent corners. */
  K.eagleCell = function () {
    return K.paint("art", "ppn_eagle", 128, 128, function (x, X, Y, W, H) {
      x.clearRect(X, Y, W, H);
      const cx = X + W / 2,
        cy = Y + H / 2;
      x.fillStyle = "#e8e2d0";
      x.beginPath();
      x.arc(cx, cy, W * 0.46, 0, 6.3);
      x.fill();
      x.strokeStyle = "#1e2c4a";
      x.lineWidth = 5;
      x.beginPath();
      x.arc(cx, cy, W * 0.42, 0, 6.3);
      x.stroke();
      // eagle: body, spread wings, head
      x.fillStyle = "#1e2c4a";
      x.beginPath();
      x.moveTo(cx, cy - 8);
      for (let k = 0; k <= 6; k++) {
        const a = PI + (k * PI) / 6;
        x.lineTo(
          cx + Math.cos(a) * 40,
          cy + Math.sin(a) * 26 - 4 + (k % 2) * 7,
        );
      }
      x.closePath();
      x.fill();
      x.beginPath();
      x.ellipse(cx, cy + 6, 10, 20, 0, 0, 6.3);
      x.fill();
      x.beginPath();
      x.moveTo(cx - 10, cy + 22);
      x.lineTo(cx, cy + 38);
      x.lineTo(cx + 10, cy + 22);
      x.fill();
      x.fillStyle = "#e8e2d0";
      x.beginPath();
      x.arc(cx + 2, cy - 18, 7, 0, 6.3);
      x.fill();
      x.fillStyle = "#c8a040";
      x.beginPath();
      x.moveTo(cx + 7, cy - 19);
      x.lineTo(cx + 14, cy - 16);
      x.lineTo(cx + 7, cy - 15);
      x.fill();
      x.fillStyle = "#8e2a22";
      for (let k = 0; k < 4; k++) x.fillRect(cx - 7 + k * 4, cy + 2, 2, 12);
      K.grain(x, X, Y, W, H, 40, 91);
      K.stains(x, X, Y, W, H, 3, 92, 0.3);
    });
  };
  /** Pigeonhole grid with letters poking out (sorting case front). */
  K.pigeonCell = function (v) {
    return K.paint("art", "ppn_pigeon" + v, 256, 192, function (x, X, Y, W, H) {
      const r = K.rng("pig" + v);
      x.fillStyle = "#5a4630";
      x.fillRect(X, Y, W, H);
      const cols = 8,
        rows = 5,
        cw = W / cols,
        ch = H / rows;
      for (let j = 0; j < rows; j++)
        for (let i = 0; i < cols; i++) {
          const px = X + i * cw + 3,
            py = Y + j * ch + 3;
          x.fillStyle = "#1c150e";
          x.fillRect(px, py, cw - 6, ch - 6);
          const n = r() < 0.2 ? 0 : 1 + Math.floor(r() * 5);
          for (let k = 0; k < n; k++) {
            const lw = cw - 10 - r() * 6,
              lh = 4 + r() * 5,
              ly = py + ch - 8 - k * 5 - lh;
            x.fillStyle = r.pick([
              "#d8d2c0",
              "#c8bc9c",
              "#e2dccc",
              "#b8c0c8",
              "#d8c8a0",
            ]);
            x.fillRect(px + 2 + r() * 3, ly, lw, lh);
            if (r() < 0.3) {
              x.fillStyle = "#8e2a22";
              x.fillRect(px + 4, ly, lw * 0.3, 2);
            }
          }
          x.fillStyle = "#c8bc98";
          x.fillRect(px + cw * 0.3, py + ch - 6, cw * 0.35, 3); // brass label
        }
      K.grain(x, X, Y, W, H, 30, 300 + v);
      K.stains(x, X, Y, W, H, 5, 310 + v, 0.35);
    });
  };
  /** Wall of brass post office boxes (with a few opened, a few letters). */
  K.poBoxCell = function () {
    return K.paint("art", "ppn_poboxes", 512, 256, function (x, X, Y, W, H) {
      const r = K.rng("pob");
      x.fillStyle = "#3a2e1c";
      x.fillRect(X, Y, W, H);
      const cols = 16,
        rows = 8,
        cw = W / cols,
        ch = H / rows;
      for (let j = 0; j < rows; j++)
        for (let i = 0; i < cols; i++) {
          const px = X + i * cw + 2,
            py = Y + j * ch + 2,
            open = r() < 0.12;
          if (open) {
            x.fillStyle = "#0e0a06";
            x.fillRect(px, py, cw - 4, ch - 4);
            if (r() < 0.5) {
              x.fillStyle = "#d0c8b0";
              x.fillRect(px + 3, py + ch - 12, cw - 12, 5);
            }
            continue;
          }
          const g = x.createLinearGradient(px, py, px + cw, py + ch);
          g.addColorStop(0, "#b8924a");
          g.addColorStop(1, "#6a5028");
          x.fillStyle = g;
          x.fillRect(px, py, cw - 4, ch - 4);
          x.fillStyle = "#2a2014";
          x.fillRect(px + 4, py + 5, cw - 12, (ch - 4) * 0.35); // glass window
          x.fillStyle = "rgba(200,190,160,0.25)";
          x.fillRect(px + 5, py + 6, 3, (ch - 4) * 0.3);
          x.fillStyle = "#e8dcb8";
          x.font = "bold 7px Arial";
          x.fillText(String(1000 + j * cols + i), px + 4, py + ch - 7);
          x.fillStyle = "#3a2a14";
          x.beginPath();
          x.arc(px + cw - 10, py + ch * 0.66, 3, 0, 6.3);
          x.fill();
        }
      K.grain(x, X, Y, W, H, 26, 331);
      K.stains(x, X, Y, W, H, 8, 332, 0.4, [30, 40, 25]);
    });
  };
  /** Postal / period posters. kind: 'rounds'|'anchorage'|'robot'|'xmas'|'wanted'|'zip' */
  K.posterCell = function (kind) {
    return K.paint(
      "art",
      "ppn_poster_" + kind,
      192,
      256,
      function (x, X, Y, W, H) {
        const r = K.rng(kind);
        const bg =
          {
            rounds: "#d8ccaa",
            anchorage: "#c8b890",
            robot: "#d8d0b8",
            xmas: "#c8d0b8",
            wanted: "#d8ccb0",
            zip: "#e0d4b4",
            band: "#1c1a2a",
            rooms: "#d8ccb0",
            rad: "#d8c890",
          }[kind] || "#d8ccaa";
        x.fillStyle = bg;
        x.fillRect(X, Y, W, H);
        x.textAlign = "center";
        x.textBaseline = "middle";
        const T = (t, y, s, c, f) => {
          x.fillStyle = c;
          x.font =
            "bold " + s + "px " + (f || "Impact, Arial Black, sans-serif");
          x.fillText(t, X + W / 2, Y + y, W * 0.9);
        };
        if (kind === "rounds") {
          x.fillStyle = "#24385e";
          x.fillRect(X, Y, W, 60);
          T("U.S. MAIL", 30, 30, "#e8dcb8");
          x.fillStyle = "#24385e";
          x.beginPath();
          x.arc(X + W / 2, Y + 125, 44, 0, 6.3);
          x.fill();
          x.fillStyle = "#e8dcb8";
          x.fillRect(X + W / 2 - 22, Y + 110, 44, 30);
          x.strokeStyle = "#24385e";
          x.lineWidth = 2;
          x.beginPath();
          x.moveTo(X + W / 2 - 22, Y + 110);
          x.lineTo(X + W / 2, Y + 128);
          x.lineTo(X + W / 2 + 22, Y + 110);
          x.stroke();
          T("THROUGH SNOW,", 190, 17, "#24385e");
          T("RAIN AND", 210, 17, "#24385e");
          T("ATOMIC FIRE", 232, 19, "#8e2a22");
        } else if (kind === "anchorage") {
          x.fillStyle = "#8e2a22";
          x.fillRect(X, Y, W, H * 0.18);
          T("WRITE TO", 22, 22, "#e8dcb8");
          x.fillStyle = "#3a4a3a";
          for (let k = 0; k < 5; k++) {
            x.beginPath();
            x.moveTo(X + 20 + k * 38, Y + 160);
            x.lineTo(X + 38 + k * 38, Y + 70 + r() * 20);
            x.lineTo(X + 56 + k * 38, Y + 160);
            x.fill();
          }
          x.fillStyle = "#f0f0f0";
          for (let k = 0; k < 5; k++) {
            x.beginPath();
            x.moveTo(X + 30 + k * 38, Y + 100);
            x.lineTo(X + 38 + k * 38, Y + 80);
            x.lineTo(X + 46 + k * 38, Y + 100);
            x.fill();
          }
          T("OUR BOYS IN", 186, 18, "#2a2a2a");
          T("ICELAND!", 212, 26, "#8e2a22");
          T("V-MAIL IS FREE", 240, 12, "#2a2a2a", "Courier New");
        } else if (kind === "robot") {
          T("NOW 100%", 26, 22, "#24385e");
          T("AUTOMATED!", 50, 26, "#8e2a22");
          x.fillStyle = "#6a7a8a";
          x.fillRect(X + 70, Y + 80, 52, 70);
          x.beginPath();
          x.arc(X + 96, Y + 78, 22, PI, 0);
          x.fill();
          x.fillStyle = "#f0c040";
          x.beginPath();
          x.arc(X + 88, Y + 72, 4, 0, 6.3);
          x.arc(X + 104, Y + 72, 4, 0, 6.3);
          x.fill();
          x.fillStyle = "#24385e";
          x.fillRect(X + 60, Y + 150, 20, 40);
          x.fillRect(X + 112, Y + 150, 20, 40);
          x.fillStyle = "#e8dcb8";
          x.fillRect(X + 124, Y + 96, 30, 20);
          x.strokeStyle = "#24385e";
          x.strokeRect(X + 124, Y + 96, 30, 20);
          T("AMERICAN AUTOMATON CO.", 204, 11, "#24385e", "Arial");
          T("POSTAL PATROLMEN", 219, 12, "#24385e", "Arial");
          T('"NEITHER RAIN NOR RIOT"', 237, 12, "#2a2a2a", "Georgia");
        } else if (kind === "xmas") {
          x.fillStyle = "#2a5a3a";
          x.fillRect(X, Y, W, 70);
          T("MAIL EARLY", 26, 26, "#e8dcb8");
          T("FOR CHRISTMAS 1967", 54, 14, "#e8c060", "Arial");
          x.fillStyle = "#8e2a22";
          for (let k = 0; k < 3; k++) {
            x.fillRect(X + 30 + k * 48, Y + 110 + (k % 2) * 20, 36, 36);
            x.fillStyle = k % 2 ? "#8e2a22" : "#2a5a3a";
          }
          x.fillStyle = "#e8c060";
          x.fillRect(X + 30, Y + 126, 132, 4);
          T("Every card a little", 208, 14, "#2a2a2a", "Georgia");
          T("piece of Normalcy!", 228, 14, "#2a2a2a", "Georgia");
        } else if (kind === "wanted") {
          T("FBI • WANTED", 24, 20, "#1a1a1a");
          x.fillStyle = "#8a8070";
          x.fillRect(X + 50, Y + 44, 92, 100);
          x.fillStyle = "#4a4238";
          x.beginPath();
          x.arc(X + 96, Y + 80, 22, 0, 6.3);
          x.fill();
          x.fillRect(X + 66, Y + 104, 60, 40);
          T("CHINESE AGENT", 164, 16, "#8e2a22");
          T('"THE TAILOR"', 186, 14, "#1a1a1a", "Georgia");
          x.fillStyle = "#2a2a2a";
          for (let k = 0; k < 4; k++)
            x.fillRect(X + 20, Y + 202 + k * 10, W - 40 - r() * 40, 3);
        } else if (kind === "zip") {
          T("USE ZONE", 30, 24, "#24385e");
          T("NUMBERS!", 58, 26, "#8e2a22");
          x.fillStyle = "#f0c040";
          x.beginPath();
          x.arc(X + 96, Y + 128, 40, 0, 6.3);
          x.fill();
          x.fillStyle = "#1a1a1a";
          x.beginPath();
          x.arc(X + 82, Y + 120, 5, 0, 6.3);
          x.arc(X + 110, Y + 120, 5, 0, 6.3);
          x.fill();
          x.strokeStyle = "#1a1a1a";
          x.lineWidth = 3;
          x.beginPath();
          x.arc(X + 96, Y + 132, 18, 0.2, PI - 0.2);
          x.stroke();
          T("It's the Patriotic", 196, 14, "#2a2a2a", "Georgia");
          T("Thing to Do!", 216, 14, "#2a2a2a", "Georgia");
        } else if (kind === "band") {
          x.fillStyle = "#8e2a22";
          x.fillRect(X + 8, Y + 8, W - 16, H - 16);
          x.fillStyle = "#1c1a2a";
          x.fillRect(X + 14, Y + 14, W - 28, H - 28);
          T("TONIGHT IN THE", 36, 14, "#e8c060", "Georgia");
          T("CAFÉ ROUGE", 66, 28, "#e04030", "Georgia");
          x.fillStyle = "#e8c060";
          for (let k = 0; k < 7; k++) {
            x.beginPath();
            x.moveTo(X + 96, Y + 150);
            x.lineTo(
              X + 96 + Math.cos(k * 0.9) * 60,
              Y + 150 - Math.abs(Math.sin(k * 0.9)) * 50,
            );
            x.lineTo(
              X + 96 + Math.cos(k * 0.9 + 0.12) * 60,
              Y + 150 - Math.abs(Math.sin(k * 0.9 + 0.12)) * 50,
            );
            x.fill();
          }
          T("JOHNNY STARR", 180, 20, "#f0e0c0");
          T("& HIS STARDUST ORCHESTRA", 204, 11, "#e8c060", "Arial");
          T("SUN. MAR 5 • 8 PM", 230, 13, "#f0e0c0", "Arial");
        } else if (kind === "rooms") {
          T("HOTEL", 30, 22, "#8e2a22", "Georgia");
          T("PENNSYLVANIA", 58, 22, "#1c1a2a", "Georgia");
          x.fillStyle = "#6a5a48";
          x.fillRect(X + 40, Y + 80, 112, 90);
          for (let j = 0; j < 6; j++)
            for (let i = 0; i < 5; i++) {
              x.fillStyle = r() < 0.4 ? "#e8c060" : "#2a2418";
              x.fillRect(X + 48 + i * 21, Y + 86 + j * 14, 12, 8);
            }
          T("2,200 ROOMS", 196, 18, "#1c1a2a");
          T("2,200 BATHS", 220, 18, "#8e2a22");
          T("Opposite Penna. Station", 244, 11, "#2a2a2a", "Georgia");
        } else if (kind === "rad") {
          x.fillStyle = "#e0b020";
          x.fillRect(X, Y, W, H);
          x.fillStyle = "#1a1a1a";
          const cx = X + W / 2,
            cy = Y + 100;
          x.beginPath();
          x.arc(cx, cy, 12, 0, 6.3);
          x.fill();
          for (let k = 0; k < 3; k++) {
            const a = -PI / 2 + (k * PI * 2) / 3;
            x.beginPath();
            x.moveTo(cx, cy);
            x.arc(cx, cy, 58, a - 0.52, a + 0.52);
            x.fill();
          }
          T("PUBLIC SHELTER", 196, 18, "#1a1a1a", "Arial Black");
          T("CAPACITY: 400", 226, 16, "#1a1a1a", "Arial");
        }
        K.grain(x, X, Y, W, H, 40, U32(kind));
        K.stains(x, X, Y, W, H, 7, U32(kind) + 1, 0.45, [80, 60, 30]);
        K.streaks(x, X, Y, W, H, 8, U32(kind) + 2, 0.25);
      },
    );
  };
  function U32(s) {
    return G.util.hashStr(s) % 997;
  }
  /** Hotel key/mail cubbies behind the front desk. */
  K.cubbyCell = function () {
    return K.paint("art", "ppn_cubbies", 512, 256, function (x, X, Y, W, H) {
      const r = K.rng("cub");
      x.fillStyle = "#5a3a22";
      x.fillRect(X, Y, W, H);
      const cols = 14,
        rows = 8,
        cw = W / cols,
        ch = H / rows;
      for (let j = 0; j < rows; j++)
        for (let i = 0; i < cols; i++) {
          const px = X + i * cw + 2,
            py = Y + j * ch + 2;
          x.fillStyle = "#1e140c";
          x.fillRect(px, py, cw - 4, ch - 4);
          if (r() < 0.55) {
            x.fillStyle = "#b8924a";
            x.fillRect(px + cw * 0.45, py + 3, 3, ch * 0.45);
            x.beginPath();
            x.arc(px + cw * 0.45 + 1.5, py + ch * 0.55, 4, 0, 6.3);
            x.fill();
          }
          if (r() < 0.35) {
            x.fillStyle = r.pick(["#e0d8c4", "#d8ccaa", "#c8d0d8"]);
            x.fillRect(px + 3, py + ch - 14, cw - 10, 8);
          }
          x.fillStyle = "#d8c090";
          x.font = "7px Arial";
          x.fillText(String((18 - j) * 100 + i + 1), px + 2, py + ch - 3);
        }
      K.grain(x, X, Y, W, H, 26, 441);
      K.stains(x, X, Y, W, H, 6, 442, 0.4);
    });
  };
  /** Switchboard jack field: rows of jacks, designation strips, lamps. */
  K.jackCell = function () {
    return K.paint("art", "ppn_jacks", 512, 256, function (x, X, Y, W, H) {
      const r = K.rng("jack");
      x.fillStyle = "#2a1e14";
      x.fillRect(X, Y, W, H);
      for (let j = 0; j < 10; j++) {
        const py = Y + 10 + j * 24;
        x.fillStyle = "#d8ccaa";
        x.fillRect(X + 6, py, W - 12, 6);
        x.fillStyle = "#2a2418";
        x.font = "5px Arial";
        for (let i = 0; i < 20; i++)
          x.fillText(String(6500 + j * 20 + i), X + 8 + i * 25, py + 5);
        for (let i = 0; i < 20; i++) {
          const px = X + 14 + i * 25;
          x.fillStyle = "#0a0806";
          x.beginPath();
          x.arc(px, py + 13, 4, 0, 6.3);
          x.fill();
          x.strokeStyle = "#8a7040";
          x.lineWidth = 1.5;
          x.stroke();
          if (r() < 0.08) {
            x.fillStyle = "#f0a030";
            x.beginPath();
            x.arc(px + 8, py + 13, 2.5, 0, 6.3);
            x.fill();
          }
        }
      }
      x.fillStyle = "#c8a050";
      x.font = "bold 12px Georgia";
      x.textAlign = "center";
      x.fillText("PENNSYLVANIA 6-5000", X + W / 2, Y + H - 6);
      K.grain(x, X, Y, W, H, 24, 451);
      K.stains(x, X, Y, W, H, 5, 452, 0.35);
    });
  };
  /** Elevator floor-indicator dial (semicircle, needle). */
  K.dialCell = function (floor) {
    return K.paint(
      "art",
      "ppn_dial_" + floor,
      192,
      96,
      function (x, X, Y, W, H) {
        x.clearRect(X, Y, W, H);
        const cx = X + W / 2,
          cy = Y + H - 6;
        x.fillStyle = "#b8924a";
        x.beginPath();
        x.arc(cx, cy, H - 8, PI, 0);
        x.fill();
        x.fillStyle = "#e8dcb8";
        x.beginPath();
        x.arc(cx, cy, H - 16, PI, 0);
        x.fill();
        x.fillStyle = "#2a2014";
        x.font = "bold 9px Georgia";
        x.textAlign = "center";
        const labels = [
          "L",
          "M",
          "2",
          "4",
          "6",
          "8",
          "10",
          "12",
          "14",
          "16",
          "18",
          "20",
          "22",
        ];
        labels.forEach((t, i) => {
          const a = PI + ((i + 0.5) / labels.length) * PI;
          x.fillText(
            t,
            cx + Math.cos(a) * (H - 26),
            cy + Math.sin(a) * (H - 26) + 3,
          );
        });
        const fi = Math.max(0, labels.indexOf(floor)),
          a = PI + ((fi + 0.5) / labels.length) * PI;
        x.strokeStyle = "#1a1208";
        x.lineWidth = 3;
        x.beginPath();
        x.moveTo(cx, cy);
        x.lineTo(cx + Math.cos(a) * (H - 20), cy + Math.sin(a) * (H - 20));
        x.stroke();
        K.grain(x, X, Y, W, H, 20, 461);
      },
    );
  };
  /** Carved inscription frieze band (opaque limestone with incised letters). */
  K.friezeCell = function (key, text, w, h, o) {
    o = o || {};
    return K.paint("art", "ppn_frieze_" + key, w, h, function (x, X, Y, W, H) {
      const r = K.rng(key);
      x.fillStyle = o.bg || "#cbc3b2";
      x.fillRect(X, Y, W, H);
      K.grain(x, X, Y, W, H, 22, 471);
      K.stains(x, X, Y, W, H, 14, 472, 0.28, [70, 64, 50]);
      K.streaks(x, X, Y, W, H, 36, 473, 0.3);
      x.textAlign = "center";
      x.textBaseline = "middle";
      const fs = Math.round(H * 0.56);
      x.font =
        (o.weight || "600") +
        " " +
        fs +
        'px "Trajan Pro", "Times New Roman", Georgia, serif';
      // incised: dark core, light lower-right lip
      const tx = X + W / 2,
        ty = Y + H / 2 + 2;
      x.fillStyle = "rgba(245,240,228,0.55)";
      x.fillText(text, tx + 1.5, ty + 2, W * 0.985);
      x.fillStyle = "#4a4236";
      x.fillText(text, tx, ty, W * 0.985);
      // weathering: chipped letters, soot drips from the cornice
      for (let k = 0; k < 60; k++) {
        x.fillStyle = rgba(200, 192, 176, (0.4 + r() * 0.5).toFixed(2));
        x.fillRect(X + r() * W, Y + r() * H, 2 + r() * 8, 2 + r() * 6);
      }
      for (let k = 0; k < 18; k++) {
        const px = X + r() * W,
          g = x.createLinearGradient(0, Y, 0, Y + H);
        g.addColorStop(0, "rgba(30,26,20,0.45)");
        g.addColorStop(1, "rgba(30,26,20,0)");
        x.fillStyle = g;
        x.fillRect(px, Y, 3 + r() * 10, H * (0.4 + r() * 0.6));
      }
    });
  };
  /** Patterned hotel carpet runner (repeating medallions). */
  K.runnerCell = function () {
    return K.paint("art", "ppn_runner", 128, 512, function (x, X, Y, W, H) {
      x.fillStyle = "#5a1a16";
      x.fillRect(X, Y, W, H);
      x.fillStyle = "#b08a3a";
      x.fillRect(X + 6, Y, 5, H);
      x.fillRect(X + W - 11, Y, 5, H);
      for (let k = 0; k < 8; k++) {
        const cy = Y + 32 + k * 64;
        x.fillStyle = "#1c2a3a";
        x.beginPath();
        x.moveTo(X + W / 2, cy - 26);
        x.lineTo(X + W / 2 + 34, cy);
        x.lineTo(X + W / 2, cy + 26);
        x.lineTo(X + W / 2 - 34, cy);
        x.fill();
        x.fillStyle = "#c8a050";
        x.beginPath();
        x.arc(X + W / 2, cy, 9, 0, 6.3);
        x.fill();
      }
      K.grain(x, X, Y, W, H, 40, 481);
      K.stains(x, X, Y, W, H, 10, 482, 0.5, [30, 20, 10]);
    });
  };
})();
