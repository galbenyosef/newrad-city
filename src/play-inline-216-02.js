// play-inline-216 02 — kind
// Lines 15-60 of readable/play-inline-216.pretty.js (statement-aligned).
  const PH = G._pharbor;
  const TAU = Math.PI * 2;

  const BLOCKS = [
    // name, x0, z0, x1, z1, height, floors
    ["filter", 650, 440, 682, 480, 40, 8],
    ["pan", 616, 444, 650, 478, 32, 6],
    ["finish", 602, 450, 616, 474, 22, 4],
  ];
  const DOOR = { x: 633, z: 444 };
  PH.DOMINO = { DOOR };

  /** Cheap factory window: recessed arched pane, brick header ring, stone sill, steel sash. */
  function factoryWindow(b, fx, fz, ry, lx, y0, w, h, kind) {
    const M = (dz, dy) => {
      const [x, z] = PH.rot(fx, fz, ry, lx, dz);
      return PH.m4(x, y0 + (dy || 0), z, ry);
    };
    const key =
      kind === "glass" ? "glass" : kind === "lit" ? "winlit" : "shadow";
    b.geo(
      key,
      new THREE.ShapeGeometry(PH.archShape(w, h, w * 0.35), 5),
      M(0.005),
      { grime: 0.2 },
    );
    b.extrude("brick_dark", PH.archRing(w, h, 0.22, w * 0.35), 0.1, {
      m: M(0.0),
      curveSegments: 5,
    });
    const [sx, sz] = PH.rot(fx, fz, ry, lx, 0.08);
    b.box("concrete", sx, y0 - 0.12, sz, w + 0.3, 0.12, 0.26, {
      ry,
      seg: false,
    });
    if (kind === "glass" || kind === "lit") {
      const [mx, mz] = PH.rot(fx, fz, ry, lx, 0.035);
      b.box("rust", mx, y0, mz, 0.05, h - w * 0.3, 0.04, { ry, seg: false });
      for (let k = 1; k < 3; k++)
        b.box("rust", mx, y0 + ((h - w * 0.35) * k) / 3, mz, w, 0.05, 0.04, {
          ry,
          seg: false,
        });
    }
  }

