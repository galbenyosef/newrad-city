// play-inline-201 12 — three
// Lines 3200-3475 of readable/play-inline-201.pretty.js (statement-aligned).
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
  PF.bench = function (b, x, y, z, ry) {
    const c = Math.cos(ry),
      s = Math.sin(ry);
    for (let i = 0; i < 3; i++)
      b.box(
        "rotten",
        x + s * (i * 0.14 - 0.14),
        y + 0.45,
        z + c * (i * 0.14 - 0.14),
        1.8,
        0.04,
        0.12,
        { ry, seg: false },
      );
    for (let i = 0; i < 2; i++)
      b.box(
        "rotten",
        x - s * 0.24,
        y + 0.62 + i * 0.16,
        z - c * 0.24,
        1.8,
        0.1,
        0.03,
        { ry, seg: false },
      );
    for (const k of [-0.8, 0.8])
      b.box("iron", x + c * k, y, z - s * k, 0.06, 0.8, 0.5, {
        ry,
        seg: false,
      });
  };
  /** Human skeleton lying on the ground (cheap bones). */
  PF.skeleton = function (b, x, y, z, ry) {
    const M = PF.m4(x, y, z, ry);
    const add = (geo, m) =>
      b.add("bone", geo, {
        m: new THREE.Matrix4().multiplyMatrices(M, m),
        grime: 0.3,
      });
    add(new THREE.SphereGeometry(0.11, 7, 5), PF.m4(0, 0.1, -0.8));
    for (let i = 0; i < 5; i++)
      add(
        new THREE.TorusGeometry(0.13 - i * 0.008, 0.012, 3, 8, Math.PI),
        PF.m4(0, 0.06, -0.55 + i * 0.07, 0, Math.PI / 2),
      );
    add(
      new THREE.CylinderGeometry(0.02, 0.02, 0.6, 4),
      PF.m4(0, 0.04, -0.35, 0, Math.PI / 2),
    );
    add(new THREE.BoxGeometry(0.28, 0.08, 0.14), PF.m4(0, 0.05, 0));
    for (const sx of [-0.1, 0.1]) {
      add(
        new THREE.CylinderGeometry(0.022, 0.018, 0.85, 4),
        PF.m4(sx * 1.4, 0.03, 0.45, sx * 2, Math.PI / 2),
      );
      add(
        new THREE.CylinderGeometry(0.018, 0.015, 0.6, 4),
        PF.m4(sx * 3.2, 0.03, -0.35, sx * 6, Math.PI / 2),
      );
    }
  };
  /** Low chain/rail fence of iron posts with rails between points (closed=false). */
  PF.railing = function (b, pts, y, h, key, opts) {
    opts = opts || {};
    key = key || "iron";
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i],
        c = pts[i + 1];
      const ya = typeof a[2] === "number" ? a[2] : y,
        yc = typeof c[2] === "number" ? c[2] : y;
      b.beam(
        key,
        new THREE.Vector3(a[0], ya + h, a[1]),
        new THREE.Vector3(c[0], yc + h, c[1]),
        0.06,
        0.06,
        { grime: 0.2 },
      );
      b.beam(
        key,
        new THREE.Vector3(a[0], ya + h * 0.5, a[1]),
        new THREE.Vector3(c[0], yc + h * 0.5, c[1]),
        0.04,
        0.04,
        { grime: 0.2 },
      );
      const len = Math.hypot(c[0] - a[0], c[1] - a[1]);
      const n = Math.max(1, Math.round(len / (opts.postStep || 2)));
      for (let k = 0; k < n; k++) {
        const t = k / n;
        const px = a[0] + (c[0] - a[0]) * t,
          pz = a[1] + (c[1] - a[1]) * t,
          py = ya + (yc - ya) * t;
        b.box(key, px, py, pz, 0.08, h + 0.05, 0.08, {
          seg: false,
          grime: 0.2,
        });
      }
      if (opts.collide)
        PF.colWall(
          a[0],
          a[1],
          c[0],
          c[1],
          0.2,
          Math.min(ya, yc) - 0.5,
          Math.max(ya, yc) + h,
          { walkable: false, surface: "metal" },
        );
    }
  };
