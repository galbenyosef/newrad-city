// play-inline-385 05 — tint
// Lines 957-1104 of readable/play-inline-385.pretty.js (statement-aligned).
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
