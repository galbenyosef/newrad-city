// play-inline-109 06 — yaw
// Lines 1353-1559 of readable/play-inline-109.pretty.js (statement-aligned).
  P.rotorcraft = function (b, x, y, z, yaw, o) {
    o = o || {};
    const f = frame(x, y, z, yaw);
    const hull = o.mat || "metal_dark",
      tint = o.tint || 0x5a6258;
    const P0 = (lx, ly, lz) => f.p(lx, ly, lz);
    // long boxy fuselage with a rounded nose and a glazed cockpit
    let p = P0(0, 0, -0.5);
    b.box(hull, p[0], 0.55, p[2], 2.7, 2.3, 10.5, { yaw, tint, grime: 0.5 });
    p = P0(0, 0, 5.0);
    b.geo(hull, T.sphere, {
      x: p[0],
      y: 1.65,
      z: p[2],
      ry: yaw,
      sx: 1.35,
      sy: 1.15,
      sz: 1.3,
      tint,
      grime: 0.5,
    });
    p = P0(0, 0, 5.3);
    b.geo("glass", T.sphere, {
      x: p[0],
      y: 2.0,
      z: p[2],
      ry: yaw,
      rx: 0.25,
      sx: 1.2,
      sy: 0.75,
      sz: 1.0,
    });
    // rear loading ramp (half down) and the two rotor pylons: a low one forward, a tall one aft
    p = P0(0, 0, -6.4);
    b.geo(hull, T.box, {
      x: p[0],
      y: 0.75,
      z: p[2],
      ry: yaw,
      rx: -0.5,
      sx: 2.5,
      sy: 0.12,
      sz: 2.0,
      tint,
    });
    const hubs = [
      [0, 3.35, 3.4, 0.9],
      [0, 4.4, -4.8, 1.9],
    ];
    for (const hq of hubs) {
      p = P0(hq[0], 0, hq[2]);
      b.box(hull, p[0], 2.85, p[2], 1.4, hq[1] - 2.85, 1.8, {
        yaw,
        tint,
        grime: 0.4,
      });
      b.cyl("black_metal", p[0], hq[1], p[2], 0.25, 0.25, 0.4, 8);
      // three drooping blades per rotor
      for (let k = 0; k < 3; k++) {
        const an = k * 2.094 + hq[2] * 0.3;
        b.beam(
          "black_metal",
          p[0],
          hq[1] + 0.35,
          p[2],
          p[0] + Math.cos(an) * 5.6,
          hq[1] + 0.1,
          p[2] + Math.sin(an) * 5.6,
          0.12,
          { d: 0.5 },
        );
      }
    }
    // side sponsons + fixed wheels
    for (const sx of [-1, 1]) {
      p = P0(sx * 1.55, 0, -0.8);
      b.box(hull, p[0], 0.25, p[2], 0.5, 0.7, 4.2, { yaw, tint, grime: 0.5 });
      for (const sz of [3.6, -2.0]) {
        const q = P0(sx * 1.35, 0, sz);
        b.geo("rubber", T.cyl12, {
          x: q[0],
          y: 0.32,
          z: q[2],
          ry: yaw,
          rz: Math.PI / 2,
          sx: 0.32,
          sy: 0.24,
          sz: 0.32,
          grime: 0,
        });
      }
    }
    // side door open + door gun
    p = P0(1.37, 1.4, 2.0);
    b.box("black_metal", p[0], 0.75, p[2], 0.1, 1.7, 1.4, {
      yaw,
      tint: 0x222222,
    });
    let a = P0(1.6, 1.6, 2.2),
      c = P0(2.6, 1.5, 2.8);
    b.beam("black_metal", a[0], a[1], a[2], c[0], c[1], c[2], 0.12, {
      round: 6,
    });
    if (o.collide !== false)
      K.colRot(x, z, 3.4, 12.5, 0, 3.0, yaw, { surface: "metal" });
    return b;
  };

  /** Flagpole with a waving flag (rect from K.flag). */
  P.flagpole = function (b, x, z, h, rect, face, o) {
    o = o || {};
    const y0 = o.y || 0;
    b.cyl(o.poleMat || "metal", x, y0, z, 0.08, 0.05, h, 6, { grime: 0.3 });
    b.geo(o.finialMat || "gold", T.sphereLo, {
      x,
      y: y0 + h + 0.08,
      z,
      s: 0.1,
    });
    if (rect)
      K.addFlag(
        b,
        rect,
        x,
        y0 + h - 0.15,
        z,
        face || 0,
        o.w || 2.4,
        o.h || 1.2,
      );
    return b;
  };

  /** Searchlight on stand (lens is emissive; beam optional as additive shaft). */
  P.searchlight = function (b, glows, x, y, z, yaw, pitch) {
    const f = frame(x, y, z, yaw);
    for (let i = 0; i < 3; i++) {
      const a = i * 2.1;
      b.beam(
        "black_metal",
        x,
        y + 1.1,
        z,
        x + Math.cos(a) * 0.6,
        y,
        z + Math.sin(a) * 0.6,
        0.05,
      );
    }
    const p = f.p(0, 1.4, 0);
    b.geo("metal_dark", T.cyl12, {
      x: p[0],
      y: y + 1.4,
      z: p[2],
      ry: yaw,
      rx: Math.PI / 2 - (pitch || 0.3),
      sx: 0.4,
      sy: 0.7,
      sz: 0.4,
    });
    const l = f.p(0, 0, 0.36);
    b.geo("lit_white", T.cyl12, {
      x: l[0],
      y: y + 1.4 + Math.sin(pitch || 0.3) * 0.36,
      z: l[2],
      ry: yaw,
      rx: Math.PI / 2 - (pitch || 0.3),
      sx: 0.36,
      sy: 0.02,
      sz: 0.36,
    });
    // lens glint only ('m' on the lens): a 6 m 'l' halo at head height read as a white fog blob by day
    if (glows)
      glows.add(
        l[0],
        y + 1.4 + Math.sin(pitch || 0.3) * 0.36,
        l[2],
        0xfff4e0,
        "m",
      );
    return b;
  };

  /** Neon/painted sign board on posts or wall (uses atlas rect). face = three yaw of normal. */
  P.signBoard = function (b, mat, rect, cx, cy, cz, w, h, face, o) {
    o = o || {};
    if (o.backing !== false) {
      const nx = Math.sin(face),
        nz = Math.cos(face);
      b.box(
        o.backMat || "metal_dark",
        cx - nx * 0.06,
        cy - h / 2 - 0.06,
        cz - nz * 0.06,
        w + 0.12,
        h + 0.12,
        0.1,
        { yaw: face, grime: 0.5 },
      );
    }
    b.panel(mat, cx, cy, cz, w, h, face, {
      rect,
      off: 0.02,
      double: !!o.double,
    });
    return b;
  };
