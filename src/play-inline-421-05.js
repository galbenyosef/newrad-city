// play-inline-421 05 — rad
// Lines 956-1055 of readable/play-inline-421.pretty.js (statement-aligned).
  K.nest = function (b, x, y, z, rad, eggs, o) {
    o = o || {};
    const r = K.rng(o.seed || (x * 7 + z * 3) | 0);
    b.geo("slime", K.sphereGeo(), {
      x,
      y: y - rad * 0.25,
      z,
      sx: rad,
      sy: rad * 0.45,
      sz: rad * 0.9,
      ry: r() * 3,
      tint: [0.8, 0.85, 0.7],
    });
    for (let k = 0; k < 4; k++) {
      const a = r() * TAU,
        d = rad * (0.6 + r() * 0.5);
      b.geo("slime", K.sphereGeo(), {
        x: x + Math.cos(a) * d,
        y: y - 0.05,
        z: z + Math.sin(a) * d,
        sx: rad * 0.4,
        sy: 0.15,
        sz: rad * 0.3,
        ry: r() * 3,
      });
    }
    for (let k = 0; k < eggs; k++) {
      const a = r() * TAU,
        d = Math.sqrt(r()) * rad * 0.7;
      b.geo("egg", K.sphereGeo(), {
        x: x + Math.cos(a) * d,
        y: y + 0.12 + (1 - d / rad) * rad * 0.2,
        z: z + Math.sin(a) * d,
        sx: 0.15,
        sy: 0.19,
        sz: 0.15,
        ry: r() * 3,
        tint: [0.85 + r() * 0.1, 0.82, 0.62],
      });
    }
    for (let k = 0; k < 5; k++) {
      const a = r() * TAU,
        d = rad * (0.8 + r() * 0.6);
      b.box(
        "shell",
        x + Math.cos(a) * d,
        y,
        z + Math.sin(a) * d,
        0.35 + r() * 0.3,
        0.06,
        0.25,
        { yaw: r() * 3, tint: [0.55, 0.4, 0.28] },
      );
    }
    for (let k = 0; k < 4; k++) {
      const a = r() * TAU,
        d = rad * (0.9 + r() * 0.5);
      b.pipe(
        "bone_old",
        x + Math.cos(a) * d,
        y + 0.03,
        z + Math.sin(a) * d,
        x + Math.cos(a) * d + (r() - 0.5) * 0.5,
        y + 0.05,
        z + Math.sin(a) * d + (r() - 0.5) * 0.5,
        0.025,
        4,
      );
    }
    b.hplate(
      "decal",
      x,
      y + 0.013,
      z,
      rad * 3.2,
      rad * 3.2,
      r() * 3,
      K.decal("roach", 3),
    );
    if (o.glow !== false) {
      b.glow(x, y + 0.3, z, [0.35, 0.55, 0.22], rad * 1.6);
      if (b.lit) b.light(x, y + 0.6, z, [0.5, 0.8, 0.3], 0.5, rad * 3);
    }
  };
  /** Interior flood-water sheet at height y over a rect. */
  K.waterPlate = function (b, x0, z0, x1, z1, y) {
    b.face("water_int", x0, y, z1, 1, 0, 0, 0, 0, -1, x1 - x0, z1 - z0, {
      uv: "top",
      grime: 0,
      tint: [0.75, 0.85, 0.8],
    });
  };
  /** Painted harbour view for an interior window (water + far skyline). */
  /**
   * Lamplit ROOM seen through a street window / open doorway (round 2): a one-point-perspective painting of the
   * interior on black, in the ADDITIVE 'neon' atlas so it glows like a lit room day and night (the lamp-quad panes
   * read as blank lightboxes). kind: 'hall' (the ferry waiting room: gallery, kiosk, pews, pendants) | 'market'
   * (brick warehouse: timber posts, lanterns, stalls, string lights). variant shifts the vanishing point so
   * neighbouring windows don't repeat. Returns an atlas rect for b.plate / b.quad('neon', …, {rect}).
   */
