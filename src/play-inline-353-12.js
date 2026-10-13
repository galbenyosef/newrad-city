// play-inline-353 12 — math
// Lines 3089-3412 of readable/play-inline-353.pretty.js (statement-aligned).
  PF.scrapWall = function (b, x0, z0, x1, z1, h, opts) {
    opts = opts || {};
    const r = PF.rng(opts.seed || x0 * 3 + z1 * 5);
    const len = Math.hypot(x1 - x0, z1 - z0),
      ry = Math.atan2(-(z1 - z0), x1 - x0);
    const sn = Math.sin(ry),
      cs = Math.cos(ry);
    const y0 = opts.y || 0;
    const at = (tt, off) => [
      x0 + ((x1 - x0) * tt) / len + off * sn,
      z0 + ((z1 - z0) * tt) / len + off * cs,
    ];
    const TINTS = [
      undefined,
      0xc8b8a0,
      0x9aa890,
      0xb89478,
      0x8898a8,
      undefined,
    ];
    let t = 0,
      side = 1;
    while (t < len) {
      const pw = Math.min(len - t, 1.4 + r() * 1.8);
      const mid = t + pw / 2;
      const [px, pz] = at(mid, 0);
      const ph = h * (0.8 + r() * 0.35);
      const key = r.pick([
        "corrugated",
        "rust",
        "panel",
        "corrugated",
        "planks",
        "paint_red",
        "rust",
        "diamond",
        "paint_teal",
      ]);
      b.box(key, px, y0, pz, pw + 0.15, ph, 0.08, {
        ry,
        rz: (r() - 0.5) * 0.06,
        rx: (r() - 0.5) * 0.08,
        seg: false,
        grime: 0.7,
        c: r.pick(TINTS),
      });
      // patchwork: smaller sheets riveted over the joints, alternating faces
      if (r() < 0.55) {
        const pw2 = 0.6 + r() * 0.9,
          ph2 = 0.5 + r() * 1.0,
          tt = t + r() * pw;
        const [qx, qz] = at(tt, side * 0.07);
        b.box(
          r.pick([
            "rust",
            "corrugated",
            "paint_cream",
            "paint_orange",
            "steel",
          ]),
          qx,
          y0 + 0.3 + r() * (ph - ph2 - 0.3),
          qz,
          pw2,
          ph2,
          0.05,
          { ry, rz: (r() - 0.5) * 0.35, seg: false, grime: 0.8 },
        );
      }
      // a car door (painted shell + broken window) or a road sign bolted on
      if (r() < 0.16) {
        const [qx, qz] = at(mid, side * 0.1);
        b.box(
          r.pick(["paint_red", "paint_teal", "paint_cream", "rust"]),
          qx,
          y0 + 0.4,
          qz,
          1.1,
          1.05,
          0.1,
          { ry, rz: (r() - 0.5) * 0.2, seg: false, grime: 0.6 },
        );
        const [gx, gz] = at(mid, side * 0.16);
        b.quad("glass_broken", gx, y0 + 1.15, gz, 0.8, 0.36, {
          ry: ry + (side > 0 ? 0 : Math.PI),
          noAO: true,
        });
        b.box("chrome", qx, y0 + 0.95, qz, 0.2, 0.05, 0.16, { ry, seg: false });
      } else if (r() < 0.1) {
        const [qx, qz] = at(mid, side * 0.1);
        const sg = new THREE.CylinderGeometry(0.42, 0.42, 0.04, 8);
        sg.rotateX(Math.PI / 2);
        b.add("paint_red", sg, {
          m: PF.m4(qx, y0 + ph * 0.6, qz, ry, 0, Math.PI / 8),
          grime: 0.5,
        });
      }
      // horizontal batten
      if (r() < 0.35) {
        const [qx, qz] = at(mid, side * 0.08);
        b.box(
          "planks",
          qx,
          y0 + 0.6 + r() * (ph - 1.0),
          qz,
          pw + 0.3,
          0.16,
          0.05,
          { ry, rz: (r() - 0.5) * 0.1, seg: false },
        );
      }
      // rebar spikes / sharpened pipes along the top
      if (!opts.noSpikes && r() < 0.5)
        for (let k = 0; k < 3; k++) {
          const [qx, qz] = at(t + ((k + 0.5) * pw) / 3, 0);
          b.beam(
            "rust",
            new THREE.Vector3(qx, y0 + ph - 0.3, qz),
            new THREE.Vector3(
              qx + (r() - 0.5) * 0.2,
              y0 + ph + 0.35 + r() * 0.4,
              qz + (r() - 0.5) * 0.2,
            ),
            0.035,
            0.035,
            { noAO: true },
          );
        }
      // tyres stacked at the foot of the wall
      if (!opts.noClutter && r() < 0.12) {
        const [qx, qz] = at(mid, side * 0.55);
        for (let k = 0, n = 1 + ((r() * 3) | 0); k < n; k++) {
          const tg = new THREE.TorusGeometry(0.32, 0.12, 5, 10);
          tg.rotateX(Math.PI / 2);
          b.add("tire", tg, {
            m: PF.m4(qx + (r() - 0.5) * 0.08, y0 + 0.12 + k * 0.23, qz),
            noAO: true,
          });
        }
      }
      side = -side;
      t += pw;
    }
    // posts
    for (let p = 0; p <= len; p += 3) {
      const px = x0 + ((x1 - x0) * p) / len,
        pz = z0 + ((z1 - z0) * p) / len;
      b.box("rust", px, y0, pz, 0.14, h * 1.1, 0.14, { ry, seg: false });
    }
    if (!opts.noCollide)
      PF.colWall(x0, z0, x1, z1, 0.4, y0, y0 + h, {
        walkable: false,
        surface: "metal",
      });
  };
  /**
   * 1950s wrecked car shell (big-finned sedan). Built from a few boxes + rounded bits.
   * (x,y,z) centre bottom, ry heading. opts.color: paint key.
   */
  PF.car = function (b, x, y, z, ry, opts) {
    opts = opts || {};
    const r = PF.rng(opts.seed || x * 31 + z * 17);
    const paint =
      opts.paint ||
      r.pick([
        "paint_red",
        "paint_teal",
        "paint_cream",
        "rust",
        "paint_orange",
        "rust",
      ]);
    const M = PF.m4(
      x,
      y + (opts.flipped ? 1.45 : 0),
      z,
      ry,
      0,
      opts.flipped ? Math.PI : opts.tilt || 0,
    );
    const add = (key, geo, m) =>
      b.add(key, geo, {
        m: new THREE.Matrix4().multiplyMatrices(M, m),
        grime: 0.65,
      });
    // lower body: rounded slab (lathe-like capsule scaled)
    const body = new THREE.CapsuleGeometry(0.62, 3.1, 3, 10);
    body.rotateZ(Math.PI / 2);
    body.scale(1, 0.62, 1.45);
    add(paint, body, PF.m4(0, 0.72, 0, Math.PI / 2));
    // cabin
    const cab = new THREE.CapsuleGeometry(0.55, 1.1, 3, 8);
    cab.rotateZ(Math.PI / 2);
    cab.scale(1, 0.7, 1.35);
    add(paint, cab, PF.m4(0, 1.18, -0.15, Math.PI / 2));
    add(
      "glass_broken",
      new THREE.BoxGeometry(1.5, 0.42, 1.9),
      PF.m4(0, 1.2, -0.15),
    );
    // tail fins
    for (const sx of [-0.72, 0.72])
      add(
        paint,
        new THREE.BoxGeometry(0.08, 0.35, 1.0),
        PF.m4(sx, 1.02, 1.9, 0, -0.25),
      );
    // chrome bumpers
    add(
      "chrome",
      new THREE.BoxGeometry(1.95, 0.18, 0.16),
      PF.m4(0, 0.5, -2.45),
    );
    add("chrome", new THREE.BoxGeometry(1.95, 0.18, 0.16), PF.m4(0, 0.5, 2.45));
    // wheels (some missing)
    for (const wx of [-0.86, 0.86])
      for (const wz of [-1.5, 1.45]) {
        if (r() < 0.25) continue;
        const w = new THREE.CylinderGeometry(0.34, 0.34, 0.24, 10);
        w.rotateZ(Math.PI / 2);
        add("tire", w, PF.m4(wx, 0.34 - (r() < 0.3 ? 0.12 : 0), wz));
      }
    if (!opts.noCollide)
      PF.col(x, z, 2.0, 5.0, y, y + 1.5, ry, { surface: "metal" });
  };
  /**
   * Freestanding 1950s billboard on rusty I-beam legs with catwalk + lamp hoods.
   * (x,z) centre at ground y, facing ry (0 → +Z). w×h panel, raised `lift` metres.
   */
  PF.billboard = function (b, brand, x, y, z, ry, w, h, lift) {
    w = w || 12;
    h = h || 5.5;
    lift = lift === undefined ? 5 : lift;
    const c = Math.cos(ry),
      s = Math.sin(ry);
    const P = (lx, lz) => [x + lx * c + lz * s, z - lx * s + lz * c];
    for (const lx of [-w * 0.35, w * 0.35]) {
      const [px, pz] = P(lx, -0.6);
      b.box("rust", px, y, pz, 0.35, lift + h + 0.3, 0.35, {
        ry,
        seg: false,
        grime: 0.6,
      });
      const [bx, bz] = P(lx, -1.8);
      b.beam(
        "rust",
        new THREE.Vector3(bx, y, bz),
        new THREE.Vector3(px, y + lift * 0.9, pz),
        0.18,
        0.18,
      );
      PF.col(px, pz, 0.5, 0.5, y, y + lift + h, ry, { walkable: false });
    }
    const [fx, fz] = P(0, -0.35);
    b.box("rust", fx, y + lift - 0.2, fz, w + 0.5, h + 0.5, 0.25, {
      ry,
      seg: false,
      grime: 0.6,
    });
    const [qx, qz] = P(0, -0.2);
    b.quad(PF.brandMat(brand), qx, y + lift + h / 2 + 0.05, qz, w, h, {
      ry,
      grime: 0.2,
    });
    // catwalk + lamp hoods
    const [cx, cz] = P(0, 0.4);
    b.box("iron", cx, y + lift - 0.35, cz, w + 0.6, 0.08, 0.9, {
      ry,
      seg: false,
    });
    for (let k = -1; k <= 1; k++) {
      const [lx2, lz2] = P(k * w * 0.33, 0.9);
      b.box("iron", lx2, y + lift - 0.3, lz2, 0.06, 0.8, 0.06, {
        ry,
        seg: false,
      });
      b.cyl("iron", lx2, y + lift + 0.4, lz2, 0.12, 0.3, 0.25, 6, { hSeg: 1 });
    }
  };
  /** Dead tree: trunk + a few forked branches (bark material). */
  PF.deadTree = function (b, x, y, z, h, seed) {
    const r = PF.rng(seed || x * 5 + z * 11);
    const base = new THREE.Vector3(x, y - 0.3, z);
    const top = new THREE.Vector3(
      x + (r() - 0.5) * 0.8,
      y + h * 0.55,
      z + (r() - 0.5) * 0.8,
    );
    b.rod("bark", base, top, 0.22 + h * 0.015, 6, { r2: 0.13, grime: 0.2 });
    const branch = (from, len, rad, depth) => {
      const n = depth > 1 ? 2 : 3;
      for (let i = 0; i < n; i++) {
        const a = r() * TAU,
          up = 0.5 + r() * 0.6;
        const to = new THREE.Vector3(
          from.x + Math.cos(a) * len * (1 - up * 0.5),
          from.y + len * up,
          from.z + Math.sin(a) * len * (1 - up * 0.5),
        );
        b.rod("bark", from, to, rad, 4, { r2: rad * 0.5, grime: 0.1 });
        if (depth < 2) branch(to, len * 0.6, rad * 0.55, depth + 1);
      }
    };
    branch(top, h * 0.35, 0.1, 0);
  };
  /** Victorian park lamp post (cast iron), optional glow bulb. */
  PF.lampPost = function (b, x, y, z, lit) {
    b.cyl("iron", x, y, z, 0.09, 0.16, 0.6, 8, { hSeg: 1 });
    b.cyl("iron", x, y + 0.6, z, 0.06, 0.08, 3.0, 6, { hSeg: 1 });
    b.cyl("iron", x, y + 3.55, z, 0.24, 0.12, 0.18, 6, { hSeg: 1 });
    b.cyl(lit ? "lamp" : "glass_broken", x, y + 3.73, z, 0.2, 0.2, 0.45, 6, {
      hSeg: 1,
      noAO: true,
      grime: 0,
    });
    b.cyl("iron", x, y + 4.18, z, 0.02, 0.28, 0.2, 6, { hSeg: 1 });
    if (lit)
      PF.glows.push({
        pos: new THREE.Vector3(x, y + 3.95, z),
        color: 0xffd9a0,
        size: 2.2,
      });
  };
  /** Park bench (wood slats on iron). */
