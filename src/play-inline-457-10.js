// play-inline-457 10 — add
// Lines 2224-2474 of readable/play-inline-457.pretty.js (statement-aligned).
  function dotPaint(x, y, z, nx, ny, nz, out, wx, wy, wz) {
    if (Math.sin(wx * 150) * Math.sin(wy * 150) * Math.sin(wz * 150) > 0.35) {
      out[0] = out[0] * 0.3 + 0.55;
      out[1] = out[1] * 0.3 + 0.52;
      out[2] = out[2] * 0.3 + 0.48;
    }
  }

  // Hats & masks were sized for the old 0.09-wide skull; the sculpted head is
  // now 0.082 (22_face.js), so every head piece they add is narrowed in x to
  // match (brims, crowns, mask shells, straps, headphone cups…).
  H.HEAD_X = 0.082 / 0.09;
  const narrowHead = (fn) =>
    function (R) {
      const own = Object.prototype.hasOwnProperty.call(R, "add"),
        add0 = R.add;
      R.add = function (bn, g, m) {
        if (bn === "head" && g && typeof g.scale === "function")
          g.scale(H.HEAD_X, 1, 1);
        return add0.call(this, bn, g, m);
      };
      try {
        return fn.apply(this, arguments);
      } finally {
        if (own) R.add = add0;
        else delete R.add;
      }
    };
  H.glasses = function (R, b, kind) {
    // fitted to the sculpted face (22_face.js stores b._eyeFit); outfits call
    // this before the head exists, so the request is deferred until then
    const E = b._eyeFit;
    if (!E) {
      (b._pendingGlasses = b._pendingGlasses || []).push(kind);
      return;
    }
    const hs = b.headS;
    // 'weld' = round welding/work goggles (dark rubber cups, smoked green lenses);
    // 'weldup' = the same pushed up onto the forehead
    const weld = kind === "weld" || kind === "weldup",
      up = kind === "weldup";
    const gog = kind === "goggles" || weld;
    const lr =
      (weld ? 0.0215 : gog ? 0.0205 : kind === "sun" ? 0.0175 : 0.0155) * hs; // lens radius
    const lx = Math.max(E.x, lr + (gog ? 0.012 : 0.009) * hs); // lens centre (bridge clears the nose)
    const ly = E.y + (kind === "sun" ? 0.002 : 0) * hs + (up ? 0.052 * hs : 0);
    const lz =
      Math.min(E.cornea - (gog ? 0.013 : 0.011) * hs, E.nose - 0.004 * hs) +
      (up ? 0.004 * hs : 0); // in front of the cornea and the nose bridge
    const frame =
      kind === "sun"
        ? { color: 0x141210, rough: 0.35, metal: 0.4 }
        : metalM(kind === "square" ? 0x2a2420 : 0x6a5634, { rough: 0.35 });
    const side = E.side + (gog ? 0.006 : 0.003) * hs;
    for (const sg of [-1, 1]) {
      const cx = sg * lx;
      if (weld) {
        // dark rubber cups, a screw-on steel rim, smoked green lens
        const tilt = up ? -0.35 : 0;
        R.add(
          "head",
          P.xf(
            P.cyl(lr * 1.0, lr * 1.16, 0.02 * hs, 14, true),
            cx,
            ly,
            lz + 0.007 * hs,
            PI / 2 + tilt,
            sg * 0.18,
            0,
          ),
          { color: 0x2a2826, region: "rubber", rough: 0.85 },
        );
        R.add(
          "head",
          P.xf(
            P.torus(lr * 1.02, 0.0045 * hs, 5, 16),
            cx,
            ly,
            lz - 0.003 * hs,
            tilt,
            sg * 0.18,
            0,
          ),
          metalM(0x8a8a84, { rough: 0.4 }),
        );
        R.add(
          "head",
          P.xf(
            P.cyl(lr * 0.92, lr * 0.92, 0.002 * hs, 14),
            cx,
            ly,
            lz - 0.002 * hs,
            PI / 2 + tilt,
            sg * 0.18,
            0,
          ),
          { color: 0x1c3026, rough: 0.05, metal: 0.55, emis: 0.03, cls: 0 },
        );
      } else if (gog) {
        // riveted brass cups with a leather gasket, tinted glass lens
        R.add(
          "head",
          P.xf(
            P.cyl(lr * 1.02, lr * 1.12, 0.017 * hs, 14, true),
            cx,
            ly,
            lz + 0.006 * hs,
            PI / 2,
            sg * 0.18,
            0,
          ),
          metalM(0x6a5a3a, { rough: 0.5 }),
        );
        R.add(
          "head",
          P.xf(
            P.torus(lr * 1.05, 0.0035 * hs, 5, 16),
            cx,
            ly,
            lz - 0.002 * hs,
            0,
            sg * 0.18,
            0,
          ),
          metalM(0x7a6440, { rough: 0.4 }),
        );
        R.add(
          "head",
          P.xf(
            P.cyl(lr * 0.9, lr * 0.9, 0.002 * hs, 14),
            cx,
            ly,
            lz - 0.001 * hs,
            PI / 2,
            sg * 0.18,
            0,
          ),
          { color: 0x6a8070, rough: 0.05, metal: 0.5, emis: 0.05, cls: 0 },
        );
      } else {
        const shape = kind === "square" ? 1.25 : 1;
        R.add(
          "head",
          P.xf(
            P.torus(lr, 0.0016 * hs * (kind === "sun" ? 1.6 : 1), 4, 18),
            cx,
            ly,
            lz,
            0,
            sg * 0.1,
            0,
            shape,
            1,
            1,
          ),
          frame,
        );
        R.add(
          "head",
          P.xf(
            P.cyl(lr * 0.97, lr * 0.97, 0.0015 * hs, 16),
            cx,
            ly,
            lz,
            PI / 2,
            sg * 0.1,
            0,
            shape,
            1,
            1,
          ),
          kind === "sun"
            ? { color: 0x0a0a0a, rough: 0.08, metal: 0.35, cls: 0 }
            : {
                color: 0x3a4644,
                rough: 0.04,
                metal: 0.75,
                noise: 0,
                grad: [1, 1],
                cls: 0,
              },
        );
        // temple arm: from the lens' outer rim along the side of the head to behind the ear
        const ox = sg * (lx + lr * shape);
        R.add(
          "head",
          P.sweep(
            [
              [ox, ly + 0.002 * hs, lz + 0.002 * hs],
              [sg * side, ly + 0.003 * hs, lz + 0.022 * hs],
              [sg * (side + 0.001 * hs), ly + 0.001 * hs, E.sideZ + 0.01 * hs],
              [sg * (side - 0.004 * hs), ly - 0.016 * hs, E.sideZ + 0.03 * hs],
            ],
            0.0017 * hs * (kind === "sun" ? 1.4 : 1),
            { seg: 8, rs: 4 },
          ),
          frame,
        );
      }
    }
    if (gog) {
      // leather strap round the head at eye level (front ends at the cups)
      const pts = [],
        rzb = E.back - E.sideZ;
      for (let i = 0; i <= 10; i++) {
        const a = -PI / 2 + (PI * i) / 10;
        pts.push([
          Math.sin(a) * side * 1.02,
          ly + 0.004 * hs,
          E.sideZ + Math.cos(a) * rzb,
        ]);
      }
      pts.unshift([-(lx + lr), ly, lz + 0.008 * hs]);
      pts.push([lx + lr, ly, lz + 0.008 * hs]);
      R.add(
        "head",
        P.sweep(pts, (t) => (weld ? 0.006 : 0.0045) * hs, { seg: 24, rs: 4 }),
        weld
          ? { color: 0x26241f, region: "rubber", rough: 0.85 }
          : Object.assign(leatherM(0x2a2016), { rough: 0.8 }),
      );
      R.add(
        "head",
        P.xf(
          P.box(0.012 * hs, 0.006 * hs, 0.008 * hs, 0.001),
          0,
          ly,
          lz + 0.004 * hs,
        ),
        metalM(weld ? 0x5a5a56 : 0x6a5a3a),
      );
    } else {
      // bridge arching over the nose
      R.add(
        "head",
        P.sweep(
          [
            [-(lx - lr), ly + 0.002 * hs, lz],
            [0, ly + 0.006 * hs, lz - 0.002 * hs],
            [lx - lr, ly + 0.002 * hs, lz],
          ],
          0.0016 * hs,
          { seg: 6, rs: 4 },
        ),
        frame,
      );
    }
  };

  /** Gas mask / hockey mask / bandit bandana / respirator — raider & street faces. */
  const color2Side = (v) => (v === -1 ? -1 : 1);
