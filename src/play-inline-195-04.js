// play-inline-195 04 — side
// Lines 770-957 of readable/play-inline-195.pretty.js (statement-aligned).
  function cell(b, ctx, side, tier, i, r, o) {
    // side −1 = west (x −10..−6.4), +1 = east (x 6.4..10)
    const y = TIER[tier],
      z0 = CZ0 + i * CW,
      z1 = z0 + CW,
      zc = (z0 + z1) / 2;
    const xo = side * 10,
      xf = side * 6.4; // outer wall / front
    const xin = (a) => (side < 0 ? a : -a); // mirror helper for x offsets from the outer wall
    const h = (tier < 2 ? TIER[tier + 1] - 0.25 : TOPC - 0.3) - y;
    // partition at z0 (and the last at z1)
    const part = (z) => {
      b.boxMM(
        "celltile",
        Math.min(xo, xf),
        y,
        z - 0.08,
        Math.max(xo, xf),
        y + h,
        z + 0.08,
        { tint: [0.78, 0.8, 0.72] },
      );
      b.col(Math.min(xo, xf), y, z - 0.08, Math.max(xo, xf), y + h, z + 0.08, {
        tag: "wall",
      });
    };
    part(z0);
    if (i === CELLS - 1) part(z1);
    // bunk, toilet, sink
    const bx = -10 + 1.6;
    b.boxMM(
      "metal",
      Math.min(xin(bx - 0.95) * 1, xin(bx + 0.95)),
      y + 0.45,
      z0 + 0.1,
      Math.max(xin(bx - 0.95), xin(bx + 0.95)),
      y + 0.52,
      z0 + 0.85,
      { tint: [0.5, 0.52, 0.5] },
    );
    if (r() < 0.7)
      b.boxMM(
        "fabric",
        Math.min(xin(bx - 0.9), xin(bx + 0.9)),
        y + 0.52,
        z0 + 0.12,
        Math.max(xin(bx - 0.9), xin(bx + 0.9)),
        y + 0.62,
        z0 + 0.82,
        {
          tint: r.pick([
            [0.55, 0.5, 0.42],
            [0.4, 0.38, 0.34],
            [0.5, 0.35, 0.3],
          ]),
        },
      );
    b.cyl("steel", xin(-9.55), y, z1 - 0.5, 0.2, 0.18, 0.42, 8, {
      tint: [0.7, 0.72, 0.72],
    });
    b.boxMM(
      "steel",
      Math.min(xin(-9.95), xin(-9.6)),
      y + 0.75,
      z1 - 1.3,
      Math.max(xin(-9.95), xin(-9.6)),
      y + 1.0,
      z1 - 0.85,
      { tint: [0.7, 0.72, 0.72] },
    );
    // tally marks / graffiti on the back wall
    if (r() < 0.5)
      b.plate(
        "decal",
        xo - side * 0.11,
        y + 1.6,
        zc,
        -side,
        0,
        1.2,
        0.5,
        K.tag(
          r.pick([
            "IIII IIII IIII",
            "INNOCENT",
            "1967",
            "IIII IIII",
            "NO EXIT",
            "MA I'M SORRY",
          ]),
          "#d8d0c0",
          256,
          96,
          { size: 0.5, rot: (r() - 0.5) * 0.2 },
        ),
        { off: 0.01 },
      );
    if (r() < 0.25)
      b.hplate(
        "decal",
        (xo + xf) / 2,
        y + 0.012,
        zc,
        1.5,
        1.5,
        r() * 6,
        K.decal("blood", (i + tier * 10) % 8),
      );
    // header above the bars
    b.boxMM(
      "celltile",
      Math.min(xf, xf + side * 0.1),
      y + 2.55,
      z0,
      Math.max(xf, xf + side * 0.1),
      y + h,
      z1,
      { tint: [0.6, 0.62, 0.56] },
    );
    // bars: fixed half (z0 side) always; door half (z1 side) open/closed/separate
    const bars = (bb, za, zb, open) => {
      for (let z = za + 0.12; z < zb - 0.05; z += 0.16)
        bb.pipe("black_iron", xf, y, z, xf, y + 2.55, z, 0.022, 5);
      for (const yy of [0.12, 1.25, 2.5])
        bb.beam("black_iron", xf, y + yy, za, xf, y + yy, zb, 0.06, 0.05);
      void open;
    };
    const zm = z1 - 1.25;
    bars(b, z0, zm);
    b.col(
      Math.min(xf, xf + side * 0.08) - 0.03,
      y,
      z0,
      Math.max(xf, xf + side * 0.08) + 0.03,
      y + 2.55,
      zm,
      { tag: "interactable_self", walkable: false },
    );
    const st = o.door || (r() < 0.45 ? "open" : "closed");
    if (st === "closed") {
      bars(b, zm, z1);
      b.col(
        Math.min(xf, xf + side * 0.08) - 0.03,
        y,
        zm,
        Math.max(xf, xf + side * 0.08) + 0.03,
        y + 2.55,
        z1,
        { tag: "interactable_self", walkable: false },
      );
    } else if (st === "open") {
      const xs = xf + side * 0.12;
      for (let z = z0 + 0.2; z < z0 + 1.2; z += 0.16)
        b.pipe("black_iron", xs, y, z, xs, y + 2.55, z, 0.022, 5);
    } // slid behind the fixed half
    return { y, z0, z1, zm, xf, zc };
  }
  function doorLeaf(ctx, side, y, zm, z1, xf) {
    // a separate, movable cell door (for the prisoners)
    const db = K.builder({
      name: "tombs_door",
      off: ctx.O,
      lit: true,
      amb: [0.28, 0.26, 0.24],
    });
    for (let z = 0.12; z < z1 - zm - 0.05; z += 0.16)
      db.pipe("black_iron", 0, 0, z, 0, 2.55, z, 0.022, 5);
    for (const yy of [0.12, 1.25, 2.5])
      db.beam("black_iron", 0, yy, 0, 0, yy, z1 - zm, 0.06, 0.05);
    db.box("black_iron", 0, 1.05, 0.4, 0.1, 0.25, 0.15, {}); // lock box
    const g = db.finish(null);
    g.position.set(xf, y, zm);
    g.children.forEach((m) => {
      m.matrixAutoUpdate = true;
    });
    const O = ctx.O;
    const col = G.world.addBox(
      O.x + Math.min(xf, xf + side * 0.08) - 0.03,
      O.y + y,
      O.z + zm,
      O.x + Math.max(xf, xf + side * 0.08) + 0.03,
      O.y + y + 2.55,
      O.z + z1,
      { tag: "interactable_self", walkable: false },
    );
    return { group: g, col, open: false, t: 0, z0: zm, O, side, y, xf, z1 };
  }

