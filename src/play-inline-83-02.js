// play-inline-83 02 — buf
// Lines 2334-2515 of readable/play-inline-83.pretty.js (statement-aligned).
(function () {
  "use strict";
  const G = window.G;
  const M = G.map._;
  M.buildBoathouse = function () {
    const F = G.LAYOUT.PARK_FEATURES,
      lk = F.lake;
    // find the east shore at the lake's mid latitude
    const z = (lk.z0 + lk.z1) / 2 + 6;
    let x = lk.x1 + 20;
    for (let k = 0; k < 60; k++) {
      if (M.parkHeight(x, z) < M.LAKE_Y + 0.4) break;
      x -= 1;
    }
    const bx = x + 7,
      bz = z; // building on the shore, dock reaching west over the water
    const y = Math.max(0, M.parkHeight(bx, bz));
    const W = 9,
      D = 18,
      H = 4.2;
    const bs = M.buf("stone_limestone", bx, bz);
    M.box(
      bs,
      bx - W / 2,
      y - 0.5,
      bz - D / 2,
      bx + W / 2,
      y + 0.4,
      bz + D / 2,
      { s: 3, c: [0.85, 0.83, 0.78] },
    );
    // back wall (east) & end walls; open colonnade to the lake (west)
    M.box(
      M.buf("brick_red", bx, bz),
      bx + W / 2 - 0.5,
      y + 0.4,
      bz - D / 2,
      bx + W / 2,
      y + H,
      bz + D / 2,
      { s: 3, c: [0.85, 0.75, 0.68] },
    );
    for (const zz of [bz - D / 2, bz + D / 2 - 0.5])
      M.box(
        M.buf("brick_red", bx, bz),
        bx - W / 2,
        y + 0.4,
        zz,
        bx + W / 2,
        y + H,
        zz + 0.5,
        { s: 3, c: [0.85, 0.75, 0.68] },
      );
    for (let zz = bz - D / 2 + 2; zz < bz + D / 2 - 1; zz += 2.8)
      M.cyl(bs, bx - W / 2 + 0.4, y + 0.4, zz, 0.22, 0.2, H - 0.4, 8, {
        c: [0.9, 0.88, 0.82],
      });
    // copper hip roof (patinated)
    const br = M.buf("metal_painted", bx, bz);
    const rc = [0.45, 0.72, 0.6],
      ry = y + H;
    M.quad(
      br,
      [bx - W / 2 - 0.8, ry, bz - D / 2 - 0.8],
      [bx - W / 2 - 0.8, ry, bz + D / 2 + 0.8],
      [bx, ry + 2.2, bz + D / 2 - 2],
      [bx, ry + 2.2, bz - D / 2 + 2],
      [-0.6, 0.8, 0],
      [0, 0, 6, 0, 6, 1, 0, 1],
      rc,
    );
    M.quad(
      br,
      [bx + W / 2 + 0.8, ry, bz + D / 2 + 0.8],
      [bx + W / 2 + 0.8, ry, bz - D / 2 - 0.8],
      [bx, ry + 2.2, bz - D / 2 + 2],
      [bx, ry + 2.2, bz + D / 2 - 2],
      [0.6, 0.8, 0],
      [0, 0, 6, 0, 6, 1, 0, 1],
      M.mulc(rc, 0.9),
    );
    M.tri(
      br,
      [bx - W / 2 - 0.8, ry, bz - D / 2 - 0.8],
      [bx, ry + 2.2, bz - D / 2 + 2],
      [bx + W / 2 + 0.8, ry, bz - D / 2 - 0.8],
      [0, 0.7, -0.7],
      [0, 0, 0.5, 1, 1, 0],
      M.mulc(rc, 0.85),
    );
    M.tri(
      br,
      [bx + W / 2 + 0.8, ry, bz + D / 2 + 0.8],
      [bx, ry + 2.2, bz + D / 2 - 2],
      [bx - W / 2 - 0.8, ry, bz + D / 2 + 0.8],
      [0, 0.7, 0.7],
      [0, 0, 0.5, 1, 1, 0],
      M.mulc(rc, 0.85),
    );
    M.quad(
      M.buf("plaster_stained", bx, bz),
      [bx - W / 2, ry - 0.05, bz + D / 2],
      [bx + W / 2, ry - 0.05, bz + D / 2],
      [bx + W / 2, ry - 0.05, bz - D / 2],
      [bx - W / 2, ry - 0.05, bz - D / 2],
      [0, -1, 0],
      [0, 0, 3, 0, 3, 6, 0, 6],
      [0.6, 0.58, 0.54],
    );
    M.box3(bx + W / 2 - 0.5, 0, bz - D / 2, bx + W / 2, y + H, bz + D / 2, {
      tag: "building",
    });
    for (const zz of [bz - D / 2, bz + D / 2 - 0.5])
      M.box3(bx - W / 2, 0, zz, bx + W / 2, y + H, zz + 0.5, {
        tag: "building",
      });
    M.box3(bx - W / 2, y - 0.5, bz - D / 2, bx + W / 2, y + 0.4, bz + D / 2, {
      tag: "floor",
      surface: "concrete",
    });
    // wooden dock over the water
    const dx0 = bx - W / 2 - 10,
      dx1 = bx - W / 2;
    const bd = M.buf("wood_planks", bx, bz);
    M.box(bd, dx0, y + 0.1, bz - 3, dx1, y + 0.4, bz + 3, {
      s: 2,
      c: [0.7, 0.6, 0.48],
    });
    for (let xx = dx0 + 0.5; xx < dx1; xx += 3)
      for (const zz of [bz - 2.7, bz + 2.7])
        M.cyl(
          M.buf("wood_rotten", bx, bz),
          xx,
          -2.4,
          zz,
          0.18,
          0.18,
          y + 2.5,
          6,
          { c: [0.45, 0.4, 0.34] },
        );
    M.box3(dx0, y - 0.2, bz - 3, dx1, y + 0.4, bz + 3, {
      tag: "dock",
      surface: "wood",
    });
    // rowboats (some swamped)
    const r = M.rng("rowboats");
    for (let i = 0; i < 4; i++) {
      const px = dx0 + 1.5 + i * 2.2,
        pz = bz + (i % 2 ? 5 : -5);
      const b = M.buf("wood_rotten", px, pz, "mid");
      M.pushXF(
        M.mtx(
          px,
          M.LAKE_Y - (i === 2 ? 0.45 : 0.1),
          pz,
          r.range(-0.3, 0.3),
          r.range(-0.05, 0.1),
          r.range(-0.2, 0.25),
        ),
      );
      M.hull(b, 4.2, 1.5, 0.6, {
        c: [0.55, 0.4, 0.28],
        ct: [0.7, 0.55, 0.38],
        cd: [0.4, 0.32, 0.25],
        noDeck: true,
      });
      M.box(b, -0.7, 0.05, -0.2, 0.7, 0.12, 0.15, {
        s: 1,
        c: [0.6, 0.48, 0.34],
      });
      M.popXF();
    }
    M.boathouse = { x: bx, z: bz };
    M.parkExcl.push({
      x0: dx0 - 2,
      x1: bx + W / 2 + 3,
      z0: bz - D / 2 - 3,
      z1: bz + D / 2 + 3,
    });
  };
})();
