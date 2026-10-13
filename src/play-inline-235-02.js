// play-inline-235 02 — yaw
// Lines 20-127 of readable/play-inline-235.pretty.js (statement-aligned).
  const LI = G._li,
    A = LI.arch,
    F = LI.furn;
  const D = (LI.dress = LI.dress || {});
  const DAY = 0xdce6f0,
    WARM = 0xffe6c0,
    AMBER = 0xffc878;
  /** A ceiling tube whose real light pool stutters (atmosphere's fixture pool) over a dim baked base. */
  const flickerTube = (C, x, y, z, ry, len, amt) => {
    A.tube(C, x, y, z, ry, len || 1.3, { r: 6, i: 0.35 });
    C.glow(x, y - 0.08, z, 0xe0f0ff, 1.1, {
      fixture: true,
      flicker: amt || 0.55,
      intensity: 1.1,
      range: 7,
    });
  };
  /** Tripod work floodlight aimed along yaw (0 = −z), with a baked pool + a real fixture light near the player. */
  const floodlight = (C, x, y, z, yaw, o) => {
    o = o || {};
    const b = C.b,
      h = o.h || 2.3,
      sx = -Math.sin(yaw),
      sz = -Math.cos(yaw);
    for (let k = 0; k < 3; k++) {
      const a = (k / 3) * Math.PI * 2 + yaw;
      b.rod(
        "metal_dark",
        [x, y + h - 0.35, z],
        [x + Math.cos(a) * 0.55, y, z + Math.sin(a) * 0.55],
        0.018,
      );
    }
    b.rod("metal_dark", [x, y + h - 0.4, z], [x, y + h - 0.05, z], 0.025);
    b.obox(
      o.body || "continuity_black",
      x,
      y + h + 0.1,
      z,
      0.55,
      0.42,
      0.3,
      yaw,
      { rx: -0.25 },
    );
    b.obox(
      "lamp_cool",
      x + sx * 0.16,
      y + h + 0.1 - 0.04,
      z + sz * 0.16,
      0.46,
      0.34,
      0.02,
      yaw,
      { rx: -0.25 },
    );
    b.light(
      x + sx * 2.2,
      y + h - 0.4,
      z + sz * 2.2,
      o.color || 0xe4eeff,
      o.r || 11,
      o.i || 0.9,
    );
    C.glow(
      x + sx * 0.25,
      y + h + 0.08,
      z + sz * 0.25,
      o.color || 0xe4eeff,
      1.4,
      { fixture: true, intensity: 1.2, range: 10 },
    );
    C.col(x - 0.4, y, z - 0.4, x + 0.4, y + h, z + 0.4, {
      walkable: false,
      surface: "metal",
    });
  };
  /** Cable run on the floor (sagging polyline). */
  const cable = (C, pts, y) => {
    for (let i = 0; i < pts.length - 1; i++)
      C.b.rod(
        "rubber",
        [pts[i][0], y + 0.025, pts[i][1]],
        [pts[i + 1][0], y + 0.025, pts[i + 1][1]],
        0.022,
        { seg: 5 },
      );
  };
  const TIDY = {
    paper: 4,
    crumple: 1,
    can: 0.6,
    bottle: 0.3,
    chunk: 0.6,
    plank: 0.1,
    box: 0.4,
  };
  const FILTH = {
    paper: 3,
    crumple: 2,
    can: 3,
    bottle: 2.5,
    chunk: 2,
    plank: 1.2,
    box: 1,
  };

  // ------------------------------------------------------------------ UN
