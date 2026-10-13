// play-inline-90 02 — rds
// Lines 355-439 of readable/play-inline-90.pretty.js (statement-aligned).
  M.rubblePile = function (x, z, rds, h, r, o) {
    o = o || {};
    r = r || M.rng("rp" + Math.round(x) + "," + Math.round(z));
    const y0 =
      o.y !== undefined ? o.y : Math.max(0, G.world.terrainHeight(x, z));
    const tint = M.mulc([0.8, 0.77, 0.72], r.range(0.8, 1.05));
    M.geom(
      M.buf("rubble", x, z, o.layer || "main"),
      mound(),
      M.mtx(x, y0 - 0.05, z, r() * 6, 0, 0, [rds, h, rds * r.range(0.7, 1)]),
      { c: tint, us: rds / 2 },
    );
    const n = Math.round(4 + rds * 2.5);
    for (let i = 0; i < n; i++) {
      const a = r() * Math.PI * 2,
        d = Math.sqrt(r()) * rds * 0.9;
      const px = x + Math.cos(a) * d,
        pz = z + Math.sin(a) * d;
      const py =
        y0 + h * Math.sqrt(Math.max(0, 1 - (d / rds) * (d / rds))) * 0.8;
      const k = r();
      const key =
        k < 0.5 ? "concrete" : k < 0.8 ? "brick_red" : "stone_limestone";
      const s = r.range(0.4, 1.6) * Math.min(1.5, rds / 3 + 0.5);
      M.obox(
        M.buf(key, px, pz, "detail"),
        px,
        py,
        pz,
        s * r.range(1, 2.5),
        s * r.range(0.2, 0.6),
        s * r.range(0.8, 1.6),
        r() * 6,
        {
          pitch: r.range(-0.6, 0.6),
          roll: r.range(-0.6, 0.6),
          s: 2,
          c: M.mulc([0.85, 0.82, 0.78], r.range(0.7, 1)),
        },
      );
    }
    // rebar & a girder
    const gb = M.buf("rust", x, z, "detail");
    for (let i = 0; i < 3; i++) {
      const a = r() * 6,
        d = r() * rds * 0.6;
      const px = x + Math.cos(a) * d,
        pz = z + Math.sin(a) * d;
      M.beam(
        gb,
        px,
        y0 + h * 0.4,
        pz,
        px + r.range(-1.5, 1.5),
        y0 + h + r.range(0.3, 1.8),
        pz + r.range(-1.5, 1.5),
        0.04,
        0.04,
        { c: [0.7, 0.5, 0.4] },
      );
    }
    if (rds > 3 && r() < 0.6)
      M.beam(
        gb,
        x - rds * 0.6,
        y0 + 0.3,
        z + r.range(-1, 1),
        x + rds * 0.5,
        y0 + h * 0.9,
        z + r.range(-2, 2),
        0.3,
        0.45,
        { c: [0.72, 0.6, 0.5] },
      );
    if (!o.noCollide && h > 0.6)
      M.box3(
        x - rds * 0.55,
        y0,
        z - rds * 0.55,
        x + rds * 0.55,
        y0 + h * 0.75,
        z + rds * 0.55,
        { tag: "rubble", surface: "rubble" },
      );
  };
