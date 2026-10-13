// play-inline-449 05 — color
// Lines 1245-1547 of readable/play-inline-449.pretty.js (statement-aligned).
  D("cash_register", (k, r, v) => {
    const o = { color: 0x8a7a5a, rust: 0.2 };
    k.cbox(
      "metal",
      0.45,
      0.2,
      0.42,
      0,
      0.1,
      0,
      Object.assign({ bevel: 0.03 }, o),
    );
    k.cbox(
      "metal",
      0.4,
      0.22,
      0.2,
      0,
      0.3,
      0.08,
      Object.assign({ bevel: 0.03, rx: 0.3 }, o),
    );
    for (let i = 0; i < 12; i++)
      k.cyl(
        "plain",
        0.018,
        0.018,
        0.03,
        -0.14 + (i % 4) * 0.09,
        0.28 + ((i / 4) | 0) * 0.05,
        -0.02 + ((i / 4) | 0) * 0.03,
        { seg: 6, color: 0xe8e0d0, rx: 0.3 },
      );
    k.box("metal", 0.3, 0.08, 0.04, 0, 0.46, 0.15, { color: 0x2a2a28 });
    k.meta.container = { name: "Cash Register", loot: "register" };
    k.meta.interactY = 0.3;
    k.meta.tier = "small";
  });

  // ---------------- shelving unit ----------------
  // Store gondola / wall shelving: steel uprights, pegboard back, 4 shelves
  // with price-tag rails. v0 stocked (labelled cereal boxes, cans, Fizzo
  // bottles — mostly picked over), v1 ransacked (a few survivors, items on
  // their sides, a sagging shelf, goods spilled at the foot), v2 bare.
  const W_SH = 1.8,
    D_SH = 0.5,
    H_SH = 2.0;
  function labelUV(region) {
    return (g) => {
      const R = X.atlasRegion(region),
        uv = g.attributes.uv;
      for (let i = 0; i < uv.count; i++)
        uv.setXY(
          i,
          X.lerp(R.u0, R.u1, X.clamp(uv.getX(i), 0, 1)),
          X.lerp(R.v0, R.v1, X.clamp(uv.getY(i), 0, 1)),
        );
    };
  }
  /** A labelled product: cereal-style box (abox) or tin can (label wraps the cylinder). */
  function product(k, r, x, y, z, o) {
    o = o || {};
    const pi = (r() * X.PRODUCTS.length) | 0,
      reg = "prod_" + pi,
      kind = X.PRODUCTS[pi];
    const lying = o.lying || false;
    if (kind === "can") {
      const g = new THREE.CylinderGeometry(0.038, 0.038, 0.11, 8, 1, false);
      k.add("atlas", g, {
        x,
        y: y + (lying ? 0.038 : 0.055),
        z,
        rz: lying ? PI / 2 : 0,
        ry: r() * 6,
        uv: "keep",
        uvFn: labelUV(reg),
        color: 0xe0dcd0,
        grime: 0.25,
        ao: [0.8, 0.1],
      });
    } else {
      const bw = 0.17 + r() * 0.05,
        bh = 0.26 + r() * 0.06,
        bd = 0.07;
      k.abox(reg, bw, bh, bd, x, y + (lying ? bd / 2 : bh / 2), z, {
        ry: (r() - 0.5) * 0.25 + (o.ry || 0),
        rx: lying ? -PI / 2 : o.lean ? 0.25 : 0,
        color: 0xe8e4dc,
        grime: 0.2,
        ao: [0.85, 0.2],
      });
    }
  }
  X.product = product;
  /** Tall ribbed Fizzo bottle for shelves and floors (low poly): ribbed lower body, long neck, label band. */
  function fizzoBottleSmall(k, r, x, y, z, lying) {
    k.lathe(
      "glass",
      [
        [0, 0],
        [0.029, 0],
        [0.031, 0.02],
        [0.028, 0.032],
        [0.031, 0.044],
        [0.028, 0.056],
        [0.031, 0.068],
        [0.03, 0.13],
        [0.013, 0.17],
        [0.01, 0.22],
        [0, 0.22],
      ],
      x,
      y + (lying ? 0.032 : 0),
      z,
      { seg: 7, color: 0x4a1208, rz: lying ? PI / 2 : 0, ry: r() * 6 },
    );
    if (!lying)
      k.cyl("plain", 0.0315, 0.0315, 0.035, x, y + 0.1, z, {
        seg: 7,
        color: 0xd8d0c0,
        open: true,
      });
  }
  X.fizzoBottleSmall = fizzoBottleSmall;
  D("shelf", (k, r, v) => {
    const o = {
      color: [0x7a7a70, 0x6a7a74, 0x8a7a64][(r() * 3) | 0],
      rust: 0.45,
    };
    const W = W_SH,
      Dp = D_SH,
      H = H_SH;
    for (const sx of [-1, 1])
      for (const sz of [-1, 1])
        k.boxB("metal", 0.045, H, 0.045, (sx * W) / 2, 0, (sz * Dp) / 2, o);
    // pegboard back + kick plate
    k.boxB("metal", W, H - 0.2, 0.02, 0, 0.12, Dp / 2 - 0.02, {
      color: 0x9a9280,
      rust: 0.2,
      grime: 0.35,
    });
    k.boxB("metal", W, 0.12, 0.02, 0, 0, -Dp / 2 + 0.02, o);
    const sag = v === 1 ? 1 + ((r() * 3) | 0) : -1;
    for (let i = 0; i < 4; i++) {
      const y = 0.12 + i * 0.52;
      const tilt = i === sag ? 0.12 : 0;
      k.boxB(
        "metal",
        W,
        0.03,
        Dp,
        0,
        y - (tilt ? 0.05 : 0),
        0,
        Object.assign({ rz: tilt }, o),
      );
      // price-tag rail
      k.box(
        "plain",
        W,
        0.035,
        0.012,
        0,
        y + 0.015 - (tilt ? 0.05 : 0),
        -Dp / 2 - 0.006,
        { color: 0xc8b890, grime: 0.4, rz: tilt },
      );
      if (v === 2) continue;
      // facings: products stand in rows, many gaps where scavengers took them
      const keep = v === 0 ? 0.78 : 0.3;
      for (let x = -W / 2 + 0.14; x < W / 2 - 0.1; x += 0.2 + r() * 0.06) {
        if (r() > keep) continue;
        const t = r(),
          zz = -Dp / 2 + 0.12 + r() * 0.12,
          lying = v === 1 ? r() < 0.5 : r() < 0.12;
        if (tilt) continue;
        if (t < 0.62) {
          product(k, r, x, y + 0.03, zz, { lying, lean: !lying && r() < 0.12 });
          if (!lying && r() < 0.4)
            product(k, r, x + (r() - 0.5) * 0.04, y + 0.03, zz + 0.12, {}); // second row behind
        } else fizzoBottleSmall(k, r, x, y + 0.03, zz, lying);
      }
    }
    // a couple of things knocked off onto the floor in front
    if (v === 1)
      for (let i = 0; i < 4; i++) {
        const x = (r() - 0.5) * W,
          z = -Dp / 2 - 0.2 - r() * 0.5;
        if (r() < 0.6) product(k, r, x, 0, z, { lying: true, ry: r() * 6 });
        else fizzoBottleSmall(k, r, x, 0, z, true);
      }
    k.meta.collider = { w: W, d: Dp, h: H };
    k.meta.surface = "metal";
    k.meta.tier = "small";
  });

  // ---------------- spilled goods (shop floors) ----------------
  D("floor_goods", (k, r, v) => {
    const n = 7 + ((r() * 6) | 0) + v * 4;
    for (let i = 0; i < n; i++) {
      const a = r() * X.TAU,
        d = Math.sqrt(r()) * (0.6 + v * 0.4),
        x = Math.cos(a) * d,
        z = Math.sin(a) * d;
      const t = r();
      if (t < 0.55) product(k, r, x, 0, z, { lying: r() < 0.8, ry: r() * 6 });
      else if (t < 0.75) fizzoBottleSmall(k, r, x, 0, z, true);
      else if (t < 0.88) X.paperBall(k, r, x, z, 1 + r());
      else
        for (let j = 0; j < 3; j++)
          k.box(
            "glass",
            0.05 + r() * 0.06,
            0.004,
            0.03 + r() * 0.04,
            x + (r() - 0.5) * 0.2,
            0.004,
            z + (r() - 0.5) * 0.2,
            { ry: r() * 6, color: 0x5a1a10 },
          ); // broken bottle
    }
    if (v >= 1)
      k.boxB("wood", 0.45, 0.3, 0.32, (r() - 0.5) * 0.6, 0, (r() - 0.5) * 0.6, {
        rz: (PI / 2) * (r() < 0.5 ? 1 : 0),
        ry: r() * 3,
        color: 0x7a6448,
        grime: 0.45,
      }); // torn carton
    k.meta.tier = "small";
  });

  // ---------------- wall signs & posters (flat, mounted ~1.6-2.4 m) ----------------
  const WALL_SIGNS = [
    ["sign_checkout", 1.2, 0.3, 2.3],
    ["sign_sale", 0.6, 0.45, 1.7],
    ["sign_prices", 0.6, 0.45, 1.6],
    ["poster_fizzo", 0.6, 0.9, 1.6],
    ["poster_longwinter", 0.6, 0.9, 1.6],
    ["poster_crunch", 0.6, 0.9, 1.6],
    ["poster_wanted", 0.5, 0.7, 1.5],
    ["sign_open", 0.5, 0.25, 1.9],
    ["poster_neighbor", 0.6, 0.9, 1.6],
  ];
  X.WALL_SIGNS = WALL_SIGNS.length;
  D("wall_sign", (k, r, v) => {
    const ws = WALL_SIGNS[v % WALL_SIGNS.length];
    if (ws[0].indexOf("sign_") === 0)
      k.box("metal", ws[1] + 0.04, ws[2] + 0.04, 0.02, 0, ws[3], 0.012, {
        color: 0x3a3630,
        rust: 0.4,
      });
    k.quad(ws[0], ws[1], ws[2], 0, ws[3], -0.002, {
      ry: PI,
      rz: (r() - 0.5) * 0.06,
      grime: 0.25,
    });
    k.meta.tier = "small";
  });

  // ---------------- shop pendant lamp (long cord; ceiling hides the excess) ----------------
  D("shop_lamp", (k, r, v) => {
    k.seg("plain", [0, 4.6, 0], [0, 2.75, 0], 0.006, { color: 0x1a1a1a });
    k.cyl("metal", 0.04, 0.28, 0.16, 0, 2.7, 0, {
      seg: 12,
      open: true,
      color: 0x3a5a4a,
      rust: 0.3,
    });
    k.sphere("glow", 0.055, 0, 2.62, 0, {
      color: C.bulbWarm,
      s: [1, 1.2, 1],
      wseg: 7,
      hseg: 5,
    });
    k.meta.glows = [
      {
        x: 0,
        y: 2.6,
        z: 0,
        color: 0xffc878,
        size: v === 1 ? 7 : 5,
        flicker: v === 2 ? 0.5 : 0.08,
        interior: true,
      },
      {
        x: 0,
        y: 2.45,
        z: 0,
        color: 0xa07040,
        size: 14,
        flicker: 0,
        interior: true,
      },
    ];
    k.meta.tier = "small";
  });

  // ---------------- shop counter ----------------
  // Old-world corner-store counter: wood body with raised panels, formica top
  // with chrome edge, rusty kick plate, glass display case at one end (a few
  // dusty goods inside), a magazine/cigarette rack and a service bell.
  // variant = length index (0: 2.0 m, 1: 2.6 m, 2: 3.2 m, 3: 3.8 m). Front
  // (customer side) faces -z like every prototype; the clerk stands at +z.
