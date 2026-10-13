// play-inline-444 05 — color
// Lines 1261-1498 of readable/play-inline-444.pretty.js (statement-aligned).
  function tarpGeometry(w, z0, y0, z1, y1, sag, seed) {
    const nx = 5,
      nz = 3,
      pos = [],
      idx = [];
    for (let j = 0; j <= nz; j++)
      for (let i = 0; i <= nx; i++) {
        const u = i / nx,
          t = j / nz;
        const s =
          Math.sin(t * PI) * sag * (0.7 + 0.3 * Math.sin(u * PI)) +
          Math.sin(u * 9 + seed) * 0.03 * Math.sin(t * PI);
        const frayed =
          i === 0 || i === nx ? 0.08 * Math.sin(j * 2.3 + seed) : 0;
        pos.push(
          (u - 0.5) * w,
          X.lerp(y0, y1, t) - s - frayed,
          X.lerp(z0, z1, t),
        );
      }
    const N = (nx + 1) * (nz + 1);
    for (let k = 0; k < N; k++)
      pos.push(pos[k * 3], pos[k * 3 + 1] - 0.012, pos[k * 3 + 2]); // underside (reverse winding)
    for (let j = 0; j < nz; j++)
      for (let i = 0; i < nx; i++) {
        const a = j * (nx + 1) + i,
          b = a + 1,
          c = a + nx + 1,
          d = c + 1;
        idx.push(a, b, c, b, d, c, a + N, c + N, b + N, b + N, c + N, d + N);
      }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx);
    return g;
  }
  D("squat_camp", (k, r, v) => {
    const lit = v % 3 !== 2;
    const sign = v % (X.SCAV_SIGNS || 6);
    const wood = { color: 0x5a4a36, grime: 0.45 };
    const tarpC = pick(r, [0x4a5a66, 0x5c5a44, 0x6a5038, 0x55624e]);
    // poles + ridge; the tarp runs from the wall (high) to the front poles, sagging between
    for (const s of [-1, 1]) {
      k.seg(
        "wood",
        [s * 1.35, 0, -0.95],
        [s * 1.35 + (r() - 0.5) * 0.08, 1.72, -0.95],
        0.045,
        wood,
      );
      k.seg("wood", [s * 1.35, 1.7, -0.95], [s * 1.5, 0, -1.9], 0.012, {
        color: 0x8a7a60,
      }); // guy rope
      k.box("wood", 0.05, 0.25, 0.05, s * 1.5, 0.05, -1.9, wood);
    }
    k.seg("wood", [-1.5, 1.7, -0.95], [1.5, 1.72, -0.95], 0.04, wood);
    k.add("fabric", tarpGeometry(3.2, 0.9, 2.25, -1.05, 1.66, 0.22, r() * 6), {
      color: tarpC,
      grime: 0.55,
      ao: [0.75, 2.3],
    });
    // side curtain on one end (old blanket)
    k.box("fabric", 0.03, 1.4, 1.5, -1.36, 0.95, 0, {
      rz: 0.04,
      color: pick(r, [0x6a3a2a, 0x3a4a5a, 0x5a5040]),
      grime: 0.5,
    });
    // bedroll + rolled pillow + a dirty blanket
    k.box("fabric", 0.75, 0.09, 1.9, 0.45, 0.05, 0.05, {
      ry: PI / 2 + (r() - 0.5) * 0.2,
      color: 0x5a5444,
      grime: 0.5,
    });
    k.cyl("fabric", 0.12, 0.12, 0.7, 1.25, 0.16, 0.05, {
      rx: PI / 2,
      seg: 7,
      color: 0x6a6450,
    });
    k.box("fabric", 0.8, 0.07, 0.9, 0.7, 0.12, 0.1, {
      ry: 0.3,
      rz: 0.08,
      color: pick(r, [0x7a3a30, 0x3a5a4a, 0x6a6a5a]),
      grime: 0.5,
    });
    // fire ring with a cook-pot tripod in front of the shelter
    const fz = -1.75;
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * X.TAU;
      k.cbox(
        "concrete",
        0.2,
        0.13,
        0.16,
        Math.cos(a) * 0.42,
        0.06,
        fz + Math.sin(a) * 0.42,
        { ry: a, color: pick(r, RUBBLE), bevel: 0.03, grime: 0.5 },
      );
    }
    k.cyl("concrete", 0.36, 0.36, 0.02, 0, 0.012, fz, {
      seg: 10,
      color: 0x1e1c1a,
      grime: 0.3,
    });
    for (let i = 0; i < 3; i++) {
      const a = i * 2.1 + r();
      k.seg(
        "wood",
        [Math.cos(a) * 0.3, 0.04, fz + Math.sin(a) * 0.3],
        [-Math.cos(a) * 0.1, 0.12, fz - Math.sin(a) * 0.1],
        0.04,
        { color: lit ? 0x2a1c12 : 0x3a3430 },
      );
    }
    for (let i = 0; i < 3; i++) {
      const a = (i * X.TAU) / 3;
      k.seg(
        "metal",
        [Math.cos(a) * 0.5, 0, fz + Math.sin(a) * 0.5],
        [0, 0.95, fz],
        0.013,
        { color: 0x2a2826 },
      );
    }
    k.seg("metal", [0, 0.95, fz], [0, 0.62, fz], 0.006, { color: 0x3a3836 });
    k.cyl("metal", 0.15, 0.12, 0.2, 0, 0.52, fz, {
      seg: 10,
      color: 0x3a3a38,
      rust: 0.6,
    });
    // crate table with tins & a bottle; a stack of salvaged plates of scrap
    k.abox("crate_plain", 0.6, 0.5, 0.45, -0.95, 0.25, -0.35, { ry: 0.2 });
    for (let i = 0; i < 3; i++)
      k.cyl(
        "metal",
        0.04,
        0.04,
        0.1,
        -1.05 + i * 0.1,
        0.55,
        -0.35 + (r() - 0.5) * 0.2,
        { seg: 6, color: pick(r, [0x8a2a22, 0x6a6a62, 0x9a8a50]), rust: 0.5 },
      );
    k.lathe(
      "glass",
      [
        [0, 0],
        [0.035, 0],
        [0.038, 0.14],
        [0.015, 0.22],
        [0, 0.22],
      ],
      -0.8,
      0.5,
      -0.4,
      { seg: 6, color: 0x2a3a24 },
    );
    k.box("metal", 0.9, 0.04, 0.6, 1.1, 0.35, 0.55, {
      rz: 1.1,
      color: 0x5a5448,
      rust: 0.8,
    }); // corrugated sheet leaning on the wall
    // hand-painted sign on a stake at the front corner
    k.seg("wood", [1.7, 0, -1.4], [1.72, 1.2, -1.4], 0.04, wood);
    k.box("wood", 1.02, 0.34, 0.03, 1.72, 1.0, -1.42, wood);
    k.quad("scav_sign_" + sign, 1.0, 0.31, 1.72, 1.0, -1.44, {
      mat: "trim",
      ry: PI,
      rz: (r() - 0.5) * 0.08,
    });
    if (lit) {
      k.meta.fires = [{ x: 0, y: 0.12, z: fz, scale: 0.45, smoke: true }];
      k.meta.glows = [
        { x: 0, y: 0.35, z: fz, color: 0xff9a40, size: 2.4, flicker: 0.5 },
      ];
    }
    k.meta.collider = { w: 0.6, d: 0.45, h: 0.5, cx: -0.95, cz: -0.35 };
    k.meta.surface = "wood";
    k.meta.tier = "medium";
  });

  // hand-painted plank sign on a stake
  D("scav_sign", (k, r, v) => {
    const wood = { color: 0x5a4a36, grime: 0.45 };
    const lean = (r() - 0.5) * 0.12;
    k.seg("wood", [0, 0, 0], [lean, 1.35, 0], 0.045, wood);
    k.box(
      "wood",
      1.02,
      0.34,
      0.03,
      lean,
      1.12,
      0.03,
      Object.assign({ rz: (r() - 0.5) * 0.1 }, wood),
    );
    k.quad(
      "scav_sign_" + (v % (X.SCAV_SIGNS || 6)),
      1.0,
      0.31,
      lean,
      1.12,
      0.01,
      { mat: "trim", ry: PI, rz: (r() - 0.5) * 0.1 },
    );
    k.meta.tier = "small";
  });

  // old-world US Army quarantine board (+ evacuation-route plate). v1 knocked askew.
  D("quarantine_sign", (k, r, v) => {
    const post = { color: 0x3a3e2c, rust: 0.6, grime: 0.3 };
    const tilt = v === 1 ? 0.28 : 0;
    const s = new X.Kit(13);
    for (const x of [-0.75, 0.75])
      s.box("metal", 0.08, 2.1, 0.08, x, 1.05, 0, post);
    s.box("metal", 1.72, 1.08, 0.04, 0, 1.55, 0.03, {
      color: 0xd8d0b8,
      grime: 0.3,
    });
    s.quad("quarantine", 1.66, 1.04, 0, 1.55, -0.001, { mat: "trim", ry: PI });
    s.quad("evac_route", 0.42, 0.42, 0.52, 0.72, -0.001, {
      mat: "trim",
      ry: PI,
    });
    s.box("metal", 0.44, 0.44, 0.03, 0.52, 0.72, 0.02, { color: 0x1d4f8a });
    k.include(s, { rz: tilt, x: tilt * 0.3 });
    // sandbag footing
    for (const x of [-0.75, 0.75])
      k.sphere("fabric", 0.24, x, 0.1, 0, {
        s: [1.3, 0.55, 0.9],
        color: 0x8a7a58,
        wseg: 7,
        hseg: 4,
        grime: 0.4,
      });
    k.meta.collider = { w: 1.8, d: 0.3, h: 2.1 };
    k.meta.tier = "medium";
  });
