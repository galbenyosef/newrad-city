// play-inline-215 02 — seg
// Lines 22-159 of readable/play-inline-215.pretty.js (statement-aligned).
  const PH = G._pharbor;
  const TAU = Math.PI * 2;
  const GY = 0,
    RY = 6.5,
    DY = 12.5;
  const HALL = { x0: -24, x1: 24, z0: -12, z1: 12 };
  const SPRING = 17,
    CROWN = 21;

  /** Floor + ceiling-underside slab pair (top key visible from above, bottom key from below). */
  function floorPair(b, x0, z0, x1, z1, y, top, bot, surface) {
    b.boxMM(top, x0, y - 0.06, z0, x1, y, z1, {
      grime: 0.35,
      seg: false,
      segLen: 8,
    });
    b.boxMM(bot || "plaster", x0, y - 0.3, z0, x1, y - 0.06, z1, {
      grime: 0.5,
      segLen: 8,
    });
    PH.colMM(x0, y - 0.3, z0, x1, y, z1, { surface: surface || "concrete" });
  }
  /** Triple-tier iron bunk (Ellis dormitories had canvas bunks stacked three high). ry: 0 = long axis along x. */
  function tripleBunk(b, x, y, z, ry, used) {
    const r = PH.rng("bunk" + x + z);
    for (const [lx, lz] of [
      [-0.95, -0.42],
      [0.95, -0.42],
      [-0.95, 0.42],
      [0.95, 0.42],
    ]) {
      const [px, pz] = PH.rot(x, z, ry, lx, lz);
      b.cyl("iron", px, y, pz, 0.03, 0.03, 2.5, 5, { hSeg: 1 });
    }
    for (const ly of [0.35, 1.15, 1.95]) {
      const [cx, cz] = PH.rot(x, z, ry, 0, 0);
      b.box("iron", cx, y + ly - 0.04, cz, 1.95, 0.05, 0.9, { ry, seg: false });
      b.box("canvas", cx, y + ly, cz, 1.85, 0.06, 0.8, {
        ry,
        seg: false,
        grime: 0.6,
      });
      if (used && r() < 0.7)
        b.box(
          "fabric",
          cx + (r() - 0.5) * 0.3,
          y + ly + 0.06,
          cz,
          1.2,
          0.08,
          0.78,
          {
            ry: ry + (r() - 0.5) * 0.2,
            seg: false,
            c: [0x7a5a4a, 0x4a5a6a, 0x8a7a5a, 0x5a6a4a][(r() * 4) | 0],
          },
        );
    }
    PH.col(x, z, ry ? 1 : 2, ry ? 2 : 1, y, y + 2.5, 0, { walkable: false });
  }
  /** Wooden immigrant bench (backrest), long axis along local x. */
  function bench(b, x, y, z, ry, len) {
    const M = (lx, ly, lz) => {
      const [px, pz] = PH.rot(x, z, ry, lx, lz);
      return [px, y + ly, pz];
    };
    let p = M(0, 0.42, 0);
    b.box("wood_dark", p[0], p[1], p[2], len, 0.06, 0.42, { ry, seg: false });
    p = M(0, 0.5, 0.22);
    b.box("wood_dark", p[0], p[1], p[2], len, 0.45, 0.05, {
      ry,
      rx: -0.12,
      seg: false,
    });
    for (const lx of [-len / 2 + 0.15, 0, len / 2 - 0.15])
      for (const lz of [-0.15, 0.15]) {
        p = M(lx, 0, lz);
        b.box("iron", p[0], p[1], p[2], 0.05, 0.42, 0.05, { ry, seg: false });
      }
    const c = M(0, 0, 0.02);
    PH.col(c[0], c[2], ry ? 0.6 : len, ry ? len : 0.6, y, y + 0.5, 0, {});
  }
  /** Heap of old-world luggage (trunks, suitcases, hat boxes, baskets). */
  function luggage(b, x, y, z, rad, n, seed) {
    const r = PH.rng("lug" + seed);
    const tints = [
      0x8a6a4a, 0x5a4a3a, 0x6a7a8a, 0x9a8a6a, 0x7a3a2a, 0x4a5a4a, 0xa89878,
    ];
    let hmax = 0;
    for (let i = 0; i < n; i++) {
      const a = r() * TAU,
        d = Math.sqrt(r()) * rad;
      const px = x + Math.cos(a) * d,
        pz = z + Math.sin(a) * d;
      const layer = (1 - d / rad) * 1.6 * r();
      const kind = r();
      if (kind < 0.35)
        b.box("leather", px, y + layer, pz, 0.7, 0.22, 0.45, {
          ry: r() * 3,
          rz: (r() - 0.5) * 0.3,
          seg: false,
          c: tints[(r() * 7) | 0],
        });
      else if (kind < 0.6) {
        b.box("wood_dark", px, y + layer, pz, 0.9, 0.5, 0.5, {
          ry: r() * 3,
          seg: false,
          c: tints[(r() * 7) | 0],
        });
        b.box("bronze", px, y + layer + 0.5, pz, 0.92, 0.04, 0.52, {
          ry: r() * 3,
          seg: false,
        });
      } else if (kind < 0.75)
        b.cyl("cardboard", px, y + layer, pz, 0.22, 0.22, 0.3, 10, {
          hSeg: 1,
          c: tints[(r() * 7) | 0],
        });
      else if (kind < 0.88)
        b.box("burlap", px, y + layer, pz, 0.6, 0.35, 0.4, {
          ry: r() * 3,
          rx: (r() - 0.5) * 0.4,
          seg: false,
        });
      else b.cyl("rotten", px, y + layer, pz, 0.3, 0.24, 0.35, 10, { hSeg: 1 }); // wicker basket
      hmax = Math.max(hmax, layer + 0.5);
    }
    PH.col(x, z, rad * 1.3, rad * 1.3, y, y + Math.min(1.2, hmax), 0, {});
  }
  /** Big hanging flag (quad both sides). */
  function hangFlag(b, flagK, x, yTop, z, ry, w, h) {
    b.quad(flagK, x, yTop - h / 2, z, w, h, { ry, rz: Math.PI / 2 });
    b.quad(flagK, x, yTop - h / 2, z, w, h, {
      ry: ry + Math.PI,
      rz: -Math.PI / 2,
    });
  }

