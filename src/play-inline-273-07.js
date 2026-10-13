// play-inline-273 07 — cyl
// Lines 1434-1758 of readable/play-inline-273.pretty.js (statement-aligned).
  X.awning = function (S, F, u, y, w, o) {
    o = o || {};
    const b = S.b,
      depth = o.depth || 1.6,
      drop = o.drop || 0.9,
      key = o.key || "awning";
    const p0 = F.pt(u, 0),
      p1 = F.pt(u, depth);
    // canvas slope as a thin box rotated about the facade axis
    const sh = new THREE.Shape();
    sh.moveTo(0, 0);
    sh.lineTo(depth, -drop);
    sh.lineTo(depth, -drop - 0.35);
    sh.lineTo(depth - 0.05, -drop - 0.35);
    sh.lineTo(depth - 0.05, -drop - 0.02);
    sh.lineTo(0, -0.05);
    sh.closePath();
    const g = new THREE.ExtrudeGeometry(sh, { depth: w, bevelEnabled: false });
    // shape: x = out from facade, y = up; extrude along facade u
    const m = new THREE.Matrix4()
      .makeBasis(
        new THREE.Vector3(F.nx, 0, F.nz),
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(-F.dx, 0, -F.dz),
      )
      .setPosition(F.pt(u + w / 2, 0)[0], y, F.pt(u + w / 2, 0)[1]);
    b.geo(key, g, m, { uv: "box", grime: 0.4 });
    // iron frame arms
    for (const s of [-1, 1]) {
      const a = F.pt(u + s * (w / 2 - 0.05), 0),
        c = F.pt(u + s * (w / 2 - 0.05), depth);
      b.rod(
        "iron",
        [a[0], y - 0.02, a[1]],
        [c[0], y - drop - 0.02, c[1]],
        0.02,
        3,
        { noAO: true },
      );
    }
    void p0;
    void p1;
    if (o.text) {
      const tk = P.texMat(
        "awn_" + o.text + (o.fg || ""),
        P.signTex("awn_" + o.text + (o.fg || ""), [o.text], "plain", 512, 64, {
          bg: o.bg || "#18181a",
          fg: o.fg || "#e8e4dc",
          font: o.font || P.FONTS.SANS,
        }),
        { rough: 0.9 },
      );
      const q = F.pt(u, depth + 0.012);
      b.quad(tk, q[0], y - drop - 0.17, q[1], w * 0.9, 0.3, { ry: F.ry });
    }
  };

  /** NYC rooftop water tower (wooden tank on a steel frame, conical cap). */
  X.waterTower = function (b, x, y, z, o) {
    o = o || {};
    const r = o.r || 2.2,
      h = o.h || 3.6,
      legs = o.legs || 3.2;
    for (const [lx, lz] of [
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 1],
    ])
      b.rod(
        "rust",
        [x + lx * r * 0.7, y, z + lz * r * 0.7],
        [x + lx * r * 0.6, y + legs, z + lz * r * 0.6],
        0.09,
        4,
        { square: true },
      );
    for (const yy of [legs * 0.35, legs * 0.75]) {
      b.box(
        "rust",
        x - r * 0.7,
        y + yy,
        z - r * 0.7 - 0.05,
        x + r * 0.7,
        y + yy + 0.08,
        z - r * 0.7 + 0.05,
        { seg: false },
      );
      b.box(
        "rust",
        x - r * 0.7,
        y + yy,
        z + r * 0.7 - 0.05,
        x + r * 0.7,
        y + yy + 0.08,
        z + r * 0.7 + 0.05,
        { seg: false },
      );
    }
    b.box("rust", x - r, y + legs, z - r, x + r, y + legs + 0.18, z + r, {
      seg: false,
    });
    b.cyl("wood_rotten", x, y + legs + 0.18, z, r * 0.96, r, h, 16);
    for (let i = 0; i < 4; i++)
      b.torus(
        "rust",
        x,
        y + legs + 0.5 + (i * (h - 0.8)) / 3,
        z,
        r * (1.0 - i * 0.01) + 0.02,
        0.03,
        TAU,
        { rx: HP, ts: 20, rs: 3 },
      );
    b.cyl(
      "wood_rotten",
      x,
      y + legs + 0.18 + h,
      z,
      0.1,
      r * 1.08,
      r * 0.55,
      16,
    );
    b.cyl("rust", x, y + legs + 0.18 + h + r * 0.55, z, 0.06, 0.12, 0.3, 6);
    b.rod("rust", [x + r, y, z], [x + r, y + legs + h, z], 0.02, 3); // ladder rail
    for (let yy = 0.3; yy < legs + h; yy += 0.35)
      b.rod(
        "rust",
        [x + r, y + yy, z - 0.2],
        [x + r, y + yy, z + 0.2],
        0.012,
        3,
      );
  };

  /** Raised wooden farm bed full of dead crops (or live crops when o.alive). */
  X.farmBed = function (S, x0, z0, x1, z1, y, o) {
    o = o || {};
    const b = S.b,
      r = P.rng(x0 * 3 + z0 * 7 + y);
    if (!o.cropsOnly) {
      b.box("wood_rotten", x0, y, z0, x1, y + 0.5, z1, {
        seg: false,
        grime: 0.6,
      });
      b.box(
        "dirt",
        x0 + 0.08,
        y + 0.5,
        z0 + 0.08,
        x1 - 0.08,
        y + 0.54,
        z1 - 0.08,
        { seg: false, noAO: true },
      );
      if (o.col !== false)
        S.col(x0, y, z0, x1, y + 0.5, z1, { surface: "wood" });
    }
    const n = Math.floor((x1 - x0) * (z1 - z0) * (o.density || 3));
    for (let i = 0; i < n; i++) {
      const px = x0 + 0.2 + r() * (x1 - x0 - 0.4),
        pz = z0 + 0.2 + r() * (z1 - z0 - 0.4),
        hh = 0.3 + r() * (o.alive ? 0.6 : 0.8);
      const lean = (r() - 0.5) * (o.alive ? 0.3 : 0.9);
      b.rod(
        o.alive ? "foliage" : "crop_dead",
        [px, y + 0.52, pz],
        [px + lean * 0.4, y + 0.52 + hh, pz + (r() - 0.5) * 0.2],
        o.alive ? 0.02 : 0.012,
        3,
        { noAO: true },
      );
      if (o.alive && r() < 0.6)
        b.sphere(
          "foliage",
          px + lean * 0.4,
          y + 0.52 + hh,
          pz,
          0.09 + r() * 0.08,
          { ws: 5, hs: 4, noAO: true },
        );
      if (o.alive && r() < 0.15)
        b.sphere(
          r() < 0.5 ? "paint_red" : "gold",
          px,
          y + 0.52 + hh * 0.6,
          pz + 0.08,
          0.05,
          { ws: 5, hs: 4, noAO: true },
        );
    }
  };

  /** Round temple crown (tholos) of the San Remo towers: podium drum, ring of columns, entablature, domed roof, lantern. */
  X.tholos = function (S, x, y, z, R, H, o) {
    o = o || {};
    const b = S.b,
      k = o.key || "limestone_warm",
      nc = o.cols || 10;
    b.cyl(k, x, y, z, R + 0.6, R + 0.8, 0.9, 20); // stylobate
    b.cyl(k, x, y + 0.9, z, R + 0.35, R + 0.45, 0.25, 20);
    for (let i = 0; i < nc; i++) {
      const a = (i / nc) * TAU,
        px = x + Math.cos(a) * R,
        pz = z + Math.sin(a) * R;
      b.lathe(
        k,
        [
          [0.001, 0],
          [0.32, 0],
          [0.3, 0.2],
          [0.24, 0.3],
          [0.22, H - 0.7],
          [0.3, H - 0.45],
          [0.38, H - 0.2],
          [0.001, H - 0.2],
        ],
        10,
        px,
        y + 1.15,
        pz,
      );
      b.box(
        k,
        px - 0.4,
        y + 1.15 + H - 0.2,
        pz - 0.4,
        px + 0.4,
        y + 1.15 + H,
        pz + 0.4,
        { seg: false },
      );
    }
    // inner cella wall (dark windows) — the tower's water tank lives in here
    b.cyl(k, x, y + 1.15, z, R - 0.9, R - 0.9, H, 16);
    for (let i = 0; i < 4; i++)
      X.cylWindow(
        b,
        x,
        z,
        R - 0.9,
        (i / 4) * TAU + PI / 4,
        y + 1.15 + H * 0.3,
        0.8,
        H * 0.4,
        { style: i === 1 && o.lit ? "lit" : "dark", frame: k },
      );
    const ey = y + 1.15 + H;
    b.cyl(k, x, ey, z, R + 0.45, R + 0.45, 0.7, 20); // entablature
    b.cyl(k, x, ey + 0.7, z, R + 0.75, R + 0.5, 0.3, 20); // cornice
    // scalloped roof (low dome) + acroteria
    b.lathe(
      o.roof || k,
      [
        [R + 0.4, 0],
        [R * 0.9, 0.7],
        [R * 0.6, 1.3],
        [R * 0.25, 1.7],
        [0.001, 1.8],
      ],
      16,
      x,
      ey + 1.0,
      z,
    );
    for (let i = 0; i < nc; i++) {
      const a = ((i + 0.5) / nc) * TAU;
      b.cyl(
        k,
        x + Math.cos(a) * (R + 0.55),
        ey + 1.0,
        z + Math.sin(a) * (R + 0.55),
        0.03,
        0.2,
        0.45,
        4,
      );
    }
    // lantern + finial
    const ly = ey + 2.7;
    b.cyl(k, x, ly, z, 0.8, 0.9, 0.35, 12);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * TAU;
      b.cyl(
        k,
        x + Math.cos(a) * 0.62,
        ly + 0.35,
        z + Math.sin(a) * 0.62,
        0.07,
        0.08,
        1.6,
        6,
      );
    }
    b.cyl(
      o.lit ? "lamp_warm" : "glass_dark",
      x,
      ly + 0.35,
      z,
      0.45,
      0.45,
      1.6,
      8,
    );
    b.lathe(
      k,
      [
        [0.9, 0],
        [0.7, 0.4],
        [0.3, 0.8],
        [0.001, 1.0],
      ],
      10,
      x,
      ly + 1.95,
      z,
    );
    b.cyl(o.finial || "verdigris", x, ly + 2.9, z, 0.04, 0.12, 1.6, 6);
    b.sphere(o.finial || "verdigris", x, ly + 2.95, z, 0.18, { ws: 8, hs: 6 });
    if (o.lit) S.glow(x, ly + 1.1, z, 0xffc070, 2.2);
    return { top: ly + 4.5, floor: y + 1.15 };
  };

  /** Classical urn on a plinth. */
