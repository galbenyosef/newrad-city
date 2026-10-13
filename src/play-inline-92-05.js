// play-inline-92 05 — the
// Lines 1922-2023 of readable/play-inline-92.pretty.js (statement-aligned).
  function forecourt(o) {
    const r = M.rng(o.id);
    const cx = (o.x0 + o.x1) / 2,
      cz = (o.z0 + o.z1) / 2;
    const C = o.clear || { z0: cz, z1: cz };
    const y = SY + 0.012;
    // granite paving across the approach, flush with the sidewalk
    M.quad(
      M.buf("granite", cx, cz),
      [o.x0, y, C.z1],
      [o.x1, y, C.z1],
      [o.x1, y, C.z0],
      [o.x0, y, C.z0],
      [0, 1, 0],
      [
        o.x0 / 3,
        C.z1 / 3,
        o.x1 / 3,
        C.z1 / 3,
        o.x1 / 3,
        C.z0 / 3,
        o.x0 / 3,
        C.z0 / 3,
      ],
      [0.78, 0.76, 0.71],
    );
    // the ends (north: o.z0..C.z0, south: C.z1..o.z1)
    const ends = [
      [o.z0, C.z0],
      [C.z1, o.z1],
    ].filter(([a, b]) => b - a > 2.5);
    for (const [a, b] of ends) {
      const ez = (a + b) / 2;
      // street tree in a granite pit near the kerb
      const tx = o.x1 - 2.6;
      const pb = M.buf("granite", tx, ez);
      for (const [x0, z0, x1, z1] of [
        [tx - 1.1, ez - 1.1, tx + 1.1, ez - 0.9],
        [tx - 1.1, ez + 0.9, tx + 1.1, ez + 1.1],
        [tx - 1.1, ez - 0.9, tx - 0.9, ez + 0.9],
        [tx + 0.9, ez - 0.9, tx + 1.1, ez + 0.9],
      ]) {
        M.box(pb, x0, SY, z0, x1, SY + 0.14, z1, {
          s: 2,
          c: [0.7, 0.68, 0.64],
        });
      }
      M.box(
        M.buf("dirt", tx, ez),
        tx - 0.9,
        SY - 0.02,
        ez - 0.9,
        tx + 0.9,
        SY + 0.04,
        ez + 0.9,
        { s: 1, c: [0.45, 0.39, 0.3] },
      );
      M.placeTree(tx, ez, r.pick(M.TREE_KINDS.standing), r() * 6, 0.62);
      // bench against the forecourt's back edge (facing the avenue), a broken one at one end
      const deep = b - a > 5;
      M.parkBench(o.x0 + 3.2, deep ? b - 1.6 : ez, -Math.PI / 2, r() < 0.5); // own collider
      // a deeper end also gets a little rubble at the pavilion's foot (spalled stone from the cornice)
      if (deep)
        M.rubblePile(
          o.x0 + 1.7,
          a + 1.7,
          r.range(0.9, 1.2),
          r.range(0.35, 0.55),
          r,
        );
    }
    // litter, cracks and leaves everywhere (flat decals only on the approach)
    const db = M.buf("my/markings", cx, cz, "fine");
    for (let i = 0; i < 16; i++)
      M.decal(
        db,
        r.range(o.x0 + 1, o.x1 - 1),
        SY + 0.02,
        r.range(o.z0 + 1, o.z1 - 1),
        r.range(1.4, 3.2),
        r.range(1.4, 3.2),
        r() * 6,
        r.pick([
          M.MARK.CRACKS,
          M.MARK.LITTER,
          M.MARK.LEAVES,
          M.MARK.DIRT,
          M.MARK.STAIN,
        ]),
      );
  }

  M.buildOpenSpaces = function () {
    for (const o of M.OPEN_SPACES) {
      if (o.kind === "park") madisonSquare(o);
      else if (o.kind === "island") worthSquare(o);
      else if (o.kind === "forecourt") forecourt(o);
      else plaza(o);
    }
    columbusCircle();
    unionSquare();
  };
