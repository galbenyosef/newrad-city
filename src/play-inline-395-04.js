// play-inline-395 04 — tint
// Lines 688-1019 of readable/play-inline-395.pretty.js (statement-aligned).
  K.deadTree = function (b, x, y, z, h, seed) {
    const r = K.rng(seed || (x * 31 + z * 17) | 0);
    const t = [0.3, 0.26, 0.22];
    b.cyl("wood_rotten", x, y, z, 0.2, 0.12, h * 0.55, 7, { tint: t });
    const branch = (px, py, pz, len, a, pitch, depth) => {
      const ex = px + Math.cos(a) * Math.cos(pitch) * len,
        ey = py + Math.sin(pitch) * len,
        ez = pz + Math.sin(a) * Math.cos(pitch) * len;
      b.pipe(
        "wood_rotten",
        px,
        py,
        pz,
        ex,
        ey,
        ez,
        0.1 * Math.pow(0.6, 3 - depth),
        4,
        { tint: t },
      );
      if (depth > 0)
        for (let k = 0; k < 2; k++)
          branch(
            ex,
            ey,
            ez,
            len * 0.62,
            a + (r() - 0.5) * 1.6,
            pitch + (r() - 0.4) * 0.5,
            depth - 1,
          );
    };
    for (let k = 0; k < 4; k++)
      branch(
        x,
        y + h * (0.45 + r() * 0.12),
        z,
        h * 0.3,
        r() * PI * 2,
        0.6 + r() * 0.5,
        2,
      );
    b.col(x - 0.2, y, z - 0.2, x + 0.2, y + h * 0.5, z + 0.2, {
      tag: "tree",
      walkable: false,
      surface: "wood",
    });
  };

  /** Toothed gear disc, axle along x (a vertical wheel seen from ±x). */
  K.gearWheel = function (b, x, y, z, r, th, teeth, o) {
    o = o || {};
    const mat = o.mat || "brass",
      t = o.tint;
    b.geo(mat, new THREE.CylinderGeometry(r, r, th, Math.max(12, teeth)), {
      x,
      y,
      z,
      rz: PI / 2,
      tint: t,
    });
    for (let k = 0; k < teeth; k++) {
      const a = (k / teeth) * PI * 2;
      b.box(
        mat,
        x,
        y + Math.sin(a) * (r + 0.03) - 0.04,
        z + Math.cos(a) * (r + 0.03),
        th,
        0.08,
        0.08,
        { tint: t },
      );
    }
    b.geo(
      o.hub || "steel",
      new THREE.CylinderGeometry(r * 0.18, r * 0.18, th * 1.8, 8),
      { x, y, z, rz: PI / 2 },
    );
  };
  /**
   * The inside face of a street door — so the way OUT always reads as a door (as in any lived-in interior: a solid
   * door leaf, daylight through the transom/glass, an EXIT sign or lamp over it), never a black hole.
   * Local coords on builder b. (x,y,z) = centre of the opening at floor level on the wall plane; (nx,nz) =
   * axis-aligned normal pointing INTO the room; w,h = opening size.
   * o: {mat, tint, leaves (1|2), glass (upper panels frosted & daylit), transom (text or true), sign ('EXIT' | text | false),
   *     signColor, day ([r,g,b] outside light colour), lightBox ([x0,y0,z0,x1,y1,z1] local), lamp (brass lantern instead of sign)}
   */
  K.exitDoor = function (b, x, y, z, nx, nz, w, h, o) {
    o = o || {};
    const rx = nz !== 0 ? -nz : 0,
      rz = nx !== 0 ? nx : 0; // right-hand axis seen from inside
    const box = (mat, u0, v0, d0, u1, v1, d1, opts) => {
      const ax = x + rx * u0 + nx * d0,
        az = z + rz * u0 + nz * d0,
        bx = x + rx * u1 + nx * d1,
        bz = z + rz * u1 + nz * d1;
      b.boxMM(
        mat,
        Math.min(ax, bx),
        y + v0,
        Math.min(az, bz),
        Math.max(ax, bx),
        y + v1,
        Math.max(az, bz),
        opts || {},
      );
    };
    const P = (u, v, d) => [x + rx * u + nx * d, y + v, z + rz * u + nz * d];
    // daylight through frosted glass is a NEON-atlas plate, not 'lamp' geometry: atmosphere auto-adds a glow
    // sprite + pooled light to every 'lamp' cluster in an interior, which put glare blobs on the door leaves
    const dayCell = K.paint(
      "neon",
      "pv3_daylight_frost",
      64,
      64,
      function (c, X, Y, W, H) {
        const g = c.createLinearGradient(X, Y, X, Y + H);
        g.addColorStop(0, "#f4f0e0");
        g.addColorStop(1, "#c8c4b4");
        c.fillStyle = g;
        c.fillRect(X, Y, W, H);
        const r = K.rng("pv3_frost");
        for (let k = 0; k < 60; k++) {
          c.fillStyle = "rgba(90,86,70," + (r() * 0.25).toFixed(2) + ")";
          c.fillRect(X + r() * W, Y + r() * H, 1 + r() * 5, 1 + r() * 3);
        }
      },
    );
    const dayPlate = (uc, vc, d, pw, ph, k) => {
      const q = P(uc, vc, d);
      b.plate("neon", q[0], q[1], q[2], nx, nz, pw, ph, dayCell, {
        off: 0.002,
        tint: day.map((c) => c * k),
      });
    };
    const mat = o.mat || "wood_dark",
      tint = o.tint || [0.32, 0.2, 0.12];
    const day = o.day || [0.95, 0.9, 0.72];
    const hasTransom = !!o.transom;
    const hd = hasTransom ? h - Math.min(0.7, h * 0.22) : h; // leaf height
    const leaves = o.leaves || (w > 1.5 ? 2 : 1);
    const lw = w / leaves;
    // black backing behind everything (no see-through slivers into the void)
    box("paint_black", -w / 2 - 0.05, 0, -0.06, w / 2 + 0.05, h + 0.05, -0.02, {
      tint: [0.02, 0.02, 0.02],
    });
    for (let i = 0; i < leaves; i++) {
      const u0 = -w / 2 + i * lw + 0.015,
        u1 = u0 + lw - 0.03;
      box(mat, u0, 0.01, 0.0, u1, hd, 0.06, { tint });
      // stiles & rails proud of the slab, raised panels between them
      const pw = u1 - u0 - 0.26;
      const rows = o.glass
        ? [
            [0.25, hd * 0.42],
            [hd * 0.5, hd - 0.14],
          ]
        : [
            [0.25, hd * 0.44],
            [hd * 0.52, hd - 0.14],
          ];
      rows.forEach(([v0, v1], k) => {
        const upperGlass = o.glass && k === 1;
        if (upperGlass) {
          box("paint_black", u0 + 0.13, v0, 0.055, u0 + 0.13 + pw, v1, 0.058, {
            tint: [0.02, 0.02, 0.02],
          });
          dayPlate(u0 + 0.13 + pw / 2, (v0 + v1) / 2, 0.058, pw, v1 - v0, 0.62);
          // glazing bars
          box(
            "black_iron",
            u0 + 0.13 + pw / 2 - 0.015,
            v0,
            0.062,
            u0 + 0.13 + pw / 2 + 0.015,
            v1,
            0.075,
            {},
          );
          box(
            "black_iron",
            u0 + 0.13,
            (v0 + v1) / 2 - 0.015,
            0.062,
            u0 + 0.13 + pw,
            (v0 + v1) / 2 + 0.015,
            0.075,
            {},
          );
        } else {
          box(mat, u0 + 0.13, v0, 0.06, u0 + 0.13 + pw, v1, 0.085, {
            tint: tint.map((c) => c * 1.15),
          });
          box(
            mat,
            u0 + 0.19,
            v0 + 0.06,
            0.085,
            u0 + 0.07 + pw,
            v1 - 0.06,
            0.1,
            { tint: tint.map((c) => c * 0.9) },
          );
        }
      });
      // kick plate + push bar / pull handle on the meeting edge
      box("brass", u0 + 0.05, 0.02, 0.06, u1 - 0.05, 0.24, 0.07, {
        tint: [0.62, 0.5, 0.3],
      });
      const edge = leaves === 2 ? (i === 0 ? u1 - 0.12 : u0 + 0.12) : u1 - 0.14;
      box("brass", edge - 0.02, 0.9, 0.1, edge + 0.02, 1.35, 0.14, {
        tint: [0.75, 0.6, 0.34],
      });
      box("brass", edge - 0.035, 0.88, 0.06, edge + 0.035, 0.92, 0.14, {
        tint: [0.7, 0.56, 0.32],
      });
      box("brass", edge - 0.035, 1.33, 0.06, edge + 0.035, 1.37, 0.14, {
        tint: [0.7, 0.56, 0.32],
      });
    }
    // bright crack of daylight at the sill and between the leaves
    dayPlate(0, 0.014, 0.062, w - 0.06, 0.026, 0.9);
    if (leaves === 2) dayPlate(0, hd / 2, 0.062, 0.016, hd - 0.04, 0.8);
    if (hasTransom) {
      box(mat, -w / 2, hd, 0.0, w / 2, hd + 0.09, 0.09, { tint });
      box(
        "paint_black",
        -w / 2 + 0.05,
        hd + 0.09,
        0.03,
        w / 2 - 0.05,
        h - 0.04,
        0.036,
        { tint: [0.02, 0.02, 0.02] },
      );
      dayPlate(
        0,
        (hd + 0.09 + h - 0.04) / 2,
        0.036,
        w - 0.1,
        h - 0.13 - hd,
        0.72,
      );
      const n = Math.max(2, Math.round(w / 0.45));
      for (let k = 1; k < n; k++) {
        const u = -w / 2 + (w * k) / n;
        box(
          "black_iron",
          u - 0.012,
          hd + 0.09,
          0.04,
          u + 0.012,
          h - 0.04,
          0.06,
          {},
        );
      }
      if (typeof o.transom === "string")
        K.letters(
          b,
          P(0, 0, 0.065)[0],
          y + (hd + h) / 2 + 0.02,
          P(0, 0, 0.065)[2],
          nx,
          nz,
          w * 0.86,
          (h - hd) * 0.5,
          o.transom,
          { fg: "#d8b060", font: "Georgia, serif", off: 0.005, shadow: false },
        );
      const g = P(0, (hd + h) / 2, 0.2);
      b.glow(
        g[0],
        g[1],
        g[2],
        day.map((c) => c * 0.55),
        w * 0.9,
      );
    }
    // the light that comes in with it (baked)
    const L = P(0, 1.3, 1.1);
    b.light(
      L[0],
      L[1],
      L[2],
      day,
      o.lightI || 0.55,
      o.lightR || 4.5,
      o.lightBox ? { box: o.lightBox } : undefined,
    );
    // EXIT sign (neon) or a brass lantern over the door
    if (o.sign !== false && !o.lamp) {
      const txt = o.sign || "EXIT",
        col = o.signColor || "#ff3a26";
      const sw = Math.max(0.62, txt.length * 0.13),
        sy = h + 0.32;
      box(
        "metal",
        -sw / 2 - 0.04,
        sy - 0.17,
        0.0,
        sw / 2 + 0.04,
        sy + 0.17,
        0.1,
        { tint: [0.16, 0.16, 0.15] },
      );
      const s = P(0, 0, 0.102);
      b.plate(
        "neon",
        s[0],
        sy + y,
        s[2],
        nx,
        nz,
        sw,
        0.26,
        K.neonCell("pv3_exit_" + txt, txt, Math.round((64 * sw) / 0.26), 64, {
          color: col,
        }),
        { off: 0.003 },
      );
      const gg = P(0, sy, 0.3);
      b.glow(gg[0], gg[1], gg[2], [1, 0.3, 0.2], 0.9);
    } else if (o.lamp) {
      const l = P(w / 2 + 0.35, h - 0.2, 0.18);
      K.lamp(b, l[0], l[1], l[2], "cage", [1, 0.72, 0.4], 0.45, 3.5, {
        ceil: l[1] + 0.25,
        lightOpts: o.lightBox ? { box: o.lightBox } : undefined,
      });
    }
  };
