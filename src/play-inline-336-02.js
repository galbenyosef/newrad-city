// play-inline-336 02 — tint
// Lines 32-241 of readable/play-inline-336.pretty.js (statement-aligned).
  const EV = G._pev;
  const K = EV.kit;
  const PI = Math.PI,
    HP = PI / 2;

  // ---- site placement: read from the layout (never hard-code world x/z) ----
  const SITE = (G.LAYOUT.getSite && G.LAYOUT.getSite("orourkes")) || {
    x0: 210,
    x1: 270,
    z0: 362,
    z1: 393,
  };
  const SO = { x: SITE.x0, y: 0, z: SITE.z0 }; // site-local → world offset
  const wx = (x) => x + SO.x,
    wz = (z) => z + SO.z; // site-local → world
  // site-local constants (x across the 60 m frontage, z from the back lot line to the street)
  const SW = SITE.x1 - SITE.x0; // frontage width (60)
  const FZ = SITE.z1 - SITE.z0 - 0.5; // street façade line (30.5)
  const BZ0 = 8; // back walls
  const MX0 = 15,
    MX1 = 24; // O'Rourke's building
  const DOOR_X = 19.5; // the saloon door
  const HATCH = { x: 22.6, z: FZ + 1.5 }; // sidewalk cellar hatch
  const LX0 = 38,
    LX1 = SW - 0.5,
    LZ0 = 2; // the Beer Garden (vacant lot)
  const GATE0 = 46.5,
    GATE1 = 50.5,
    GATE_X = (GATE0 + GATE1) / 2;
  const UP = 4.0,
    CY = -3.2; // apartment floor, cellar floor (local)

  // ==================================================================
  // helpers
  // ==================================================================
  /** NYC fire escape on a façade facing +z: landings at each floor, ladders, drop ladder. */
  function fireEscape(b, x0, x1, fz, floors) {
    const D = 1.2;
    floors.forEach((y, i) => {
      b.boxMM("black_iron", x0, y - 0.06, fz, x1, y, fz + D, {
        tint: [0.16, 0.15, 0.14],
        faces: "nsewtb",
      });
      for (let x = x0 + 0.2; x < x1; x += 0.25)
        b.beam(
          "black_iron",
          x,
          y + 0.005,
          fz + 0.05,
          x,
          y + 0.005,
          fz + D - 0.05,
          0.02,
          0.02,
        ); // grating
      K.railing(b, x0, fz + D, x1, fz + D, y, {
        h: 1.0,
        mat: "black_iron",
        handMat: "black_iron",
        step: 0.14,
        col: false,
      });
      K.railing(b, x0, fz, x0, fz + D, y, {
        h: 1.0,
        mat: "black_iron",
        handMat: "black_iron",
        step: 0.14,
        col: false,
      });
      K.railing(b, x1, fz, x1, fz + D, y, {
        h: 1.0,
        mat: "black_iron",
        handMat: "black_iron",
        step: 0.14,
        col: false,
      });
      // brackets
      for (const x of [x0 + 0.2, x1 - 0.2])
        b.beam(
          "black_iron",
          x,
          y - 0.8,
          fz,
          x,
          y - 0.05,
          fz + D - 0.1,
          0.05,
          0.05,
        );
      // ladder to the next landing
      if (i < floors.length - 1) {
        const yn = floors[i + 1],
          lx = i % 2 ? x0 + 0.7 : x1 - 0.7,
          dir = i % 2 ? 1 : -1;
        for (const s of [-0.22, 0.22])
          b.beam(
            "black_iron",
            lx + s,
            y,
            fz + D - 0.35,
            lx + s + dir * 1.4,
            yn,
            fz + D - 0.35,
            0.04,
            0.04,
          );
        const n = Math.round((yn - y) / 0.3);
        for (let k = 1; k < n; k++) {
          const t = k / n;
          b.beam(
            "black_iron",
            lx - 0.22 + dir * 1.4 * t,
            y + (yn - y) * t,
            fz + D - 0.35,
            lx + 0.22 + dir * 1.4 * t,
            y + (yn - y) * t,
            fz + D - 0.35,
            0.03,
            0.04,
          );
        }
      }
    });
    // counterweighted drop ladder under the first landing
    const y0 = floors[0],
      lx = x0 + 0.8;
    for (const s of [-0.2, 0.2])
      b.beam(
        "black_iron",
        lx + s,
        y0 - 2.4,
        fz + D - 0.2,
        lx + s,
        y0,
        fz + D - 0.2,
        0.04,
        0.04,
      );
    for (let yy = y0 - 2.2; yy < y0; yy += 0.3)
      b.beam(
        "black_iron",
        lx - 0.2,
        yy,
        fz + D - 0.2,
        lx + 0.2,
        yy,
        fz + D - 0.2,
        0.03,
        0.03,
      );
  }
  /** Tenement body with sash windows on the street face. */
  function tenement(b, r, x0, x1, h, o) {
    o = o || {};
    const mat = o.mat || "brick_red",
      tint = o.tint || [0.85, 0.62, 0.52];
    b.face(mat, x0, 0, FZ, 1, 0, 0, 0, 1, 0, x1 - x0, h, { tint });
    b.face(mat, x1, 0, BZ0, -1, 0, 0, 0, 1, 0, x1 - x0, h, {
      tint: tint.map((v) => v * 0.85),
    });
    if (o.east !== false)
      b.face(mat, x1, 0, FZ, 0, 0, -1, 0, 1, 0, FZ - BZ0, h, {
        tint: tint.map((v) => v * 0.9),
      });
    if (o.west !== false)
      b.face(mat, x0, 0, BZ0, 0, 0, 1, 0, 1, 0, FZ - BZ0, h, {
        tint: tint.map((v) => v * 0.9),
      });
    if (o.roof !== false)
      b.face("concrete_dark", x0, h, FZ, 1, 0, 0, 0, 0, -1, x1 - x0, FZ - BZ0, {
        uv: "top",
        tint: [0.4, 0.38, 0.36],
      });
    b.col(x0, 0, BZ0, x1, h, FZ, { tag: "building" });
    const nW = o.windows || Math.max(2, Math.floor((x1 - x0) / 3.2));
    for (let f = 1; f < (o.floors || 5); f++) {
      for (let k = 0; k < nW; k++) {
        const x = x0 + ((x1 - x0) * (k + 0.5)) / nW,
          u = r();
        K.sash(b, x, 4.2 + (f - 1) * 3.1 + 0.7, FZ, 0, 1, 1.1, 1.8, {
          state:
            u < 0.3
              ? "broken"
              : u < 0.55
                ? "dark"
                : u < 0.7
                  ? "boarded"
                  : "glass",
          cols: 2,
          rows: 2,
          surround: o.trimMat || "limestone",
          surroundTint: o.trimTint || [0.78, 0.74, 0.66],
          lintel: 0.22,
        });
      }
    }
    // pressed-metal cornice
    if (o.cornice !== false)
      K.cornice(b, x0, FZ, x1, FZ, h - 0.9, 0, 1, {
        mat: "metal",
        tint: o.cornTint || [0.34, 0.3, 0.26],
        depth: 0.7,
        h: 0.9,
        brackets: 0.8,
      });
  }

  // ==================================================================
  // EXTERIOR
  // ==================================================================
