// play-inline-251 03 — opts
// Lines 347-671 of readable/play-inline-251.pretty.js (statement-aligned).
  D.painting = function (b, idx, x, y, z, w, h, ry, opts) {
    opts = opts || {};
    const c = Math.cos(ry),
      s = Math.sin(ry);
    const fk = opts.frame || "gilt";
    const t = 0.12;
    b.box(fk, x + s * 0.04, y - h / 2 - t, z + c * 0.04, w + 2 * t, t, 0.1, {
      ry,
      seg: false,
      grime: 0.3,
    });
    b.box(fk, x + s * 0.04, y + h / 2, z + c * 0.04, w + 2 * t, t, 0.1, {
      ry,
      seg: false,
      grime: 0.3,
    });
    for (const sg of [-1, 1])
      b.box(
        fk,
        x + s * 0.04 + c * sg * (w / 2 + t / 2),
        y - h / 2,
        z + c * 0.04 - s * sg * (w / 2 + t / 2),
        t,
        h,
        0.1,
        { ry, seg: false, grime: 0.3 },
      );
    const i = idx % 8,
      u0 = (i % 4) / 4,
      v0 = Math.floor(i / 4) === 0 ? 0.5 : 0;
    b.quad(D.paintingsKey(), x + s * 0.03, y, z + c * 0.03, w, h, {
      ry,
      uvRect: [u0, v0, u0 + 0.25, v0 + 0.5],
      grime: 0.2,
      rz: opts.tilt || 0,
    });
  };

  // -------------------------------------------------------------------
  // Furniture & clutter
  // -------------------------------------------------------------------
  /** Wooden / steel chair. fallen: lying on its back. */
  D.chair = function (b, x, y, z, ry, fallen, key) {
    key = key || "rotten";
    const M = PF.m4(
      x,
      y + (fallen ? 0.24 : 0),
      z,
      ry,
      fallen ? -Math.PI / 2 + 0.1 : 0,
      0,
    );
    const add = (g, m, k) =>
      b.add(k || key, g, {
        m: new THREE.Matrix4().multiplyMatrices(M, m),
        grime: 0.5,
      });
    add(new THREE.BoxGeometry(0.46, 0.05, 0.44), PF.m4(0, 0.46, 0));
    add(
      new THREE.BoxGeometry(0.46, 0.5, 0.04),
      PF.m4(0, 0.73, -0.21, 0, -0.08),
    );
    for (const [dx, dz] of [
      [-0.2, -0.19],
      [0.2, -0.19],
      [-0.2, 0.19],
      [0.2, 0.19],
    ])
      add(new THREE.BoxGeometry(0.04, 0.46, 0.04), PF.m4(dx, 0.23, dz), "iron");
  };
  /** Scattered paper sheets (ticker tape, ledgers, currency) around (cx, cz). */
  D.papers = function (b, cx, y, cz, radius, n, seed) {
    const r = PF.rng(seed || cx * 7 + cz * 3);
    for (let i = 0; i < n; i++) {
      const a = r() * TAU,
        d = Math.sqrt(r()) * radius;
      const g = new THREE.PlaneGeometry(0.22 + r() * 0.12, 0.3 + r() * 0.1);
      g.rotateX(-Math.PI / 2);
      b.add("paper", g, {
        m: PF.m4(
          cx + Math.cos(a) * d,
          y + 0.012 + r() * 0.02,
          cz + Math.sin(a) * d,
          r() * TAU,
          (r() - 0.5) * 0.15,
          (r() - 0.5) * 0.15,
        ),
        uv: "keep",
        grime: 0.35,
        noAO: true,
      });
    }
  };
  /** Market stall: counter, 4 posts, striped canvas awning, hanging sign, goods. */
  D.stall = function (b, x, z, ry, w, d, opts) {
    opts = opts || {};
    const r = PF.rng(opts.seed || x * 5 + z * 13);
    const c = Math.cos(ry),
      s = Math.sin(ry);
    const P = (lx, lz) => [x + lx * c + lz * s, z - lx * s + lz * c];
    const y0 = opts.y || 0;
    // counter (front at local +Z)
    const [cx, cz] = P(0, d / 2 - 0.35);
    b.box(opts.counterKey || "planks", cx, y0, cz, w, 1.05, 0.7, {
      ry,
      seg: false,
      grime: 0.55,
    });
    b.box("rust", cx, y0 + 1.05, cz, w + 0.1, 0.06, 0.8, { ry, seg: false });
    PF.col(cx, cz, w, 0.7, y0, y0 + 1.1, ry, {
      walkable: false,
      surface: "wood",
    });
    // posts
    for (const [lx, lz] of [
      [-w / 2, d / 2 - 0.1],
      [w / 2, d / 2 - 0.1],
      [-w / 2, -d / 2],
      [w / 2, -d / 2],
    ]) {
      const [px, pz] = P(lx, lz);
      b.box("rust", px, y0, pz, 0.1, 2.6 + (lz < 0 ? 0.3 : 0), 0.1, {
        ry,
        seg: false,
      });
    }
    // striped awning: alternating stripes, sloped toward the front
    const stripes = Math.max(3, Math.round(w / 0.5));
    const k1 = opts.awning || (r() < 0.5 ? "stripe_red" : "awning_green"),
      k2 = "stripe_cream";
    for (let i = 0; i < stripes; i++) {
      const lx = -w / 2 + ((i + 0.5) * w) / stripes;
      const [ax, az] = P(lx, 0.1);
      b.box(
        i % 2 ? k2 : k1,
        ax,
        y0 + 2.62,
        az,
        w / stripes + 0.01,
        0.04,
        d + 0.5,
        { ry, rx: 0.18, seg: false, grime: 0.6 },
      );
    }
    // valance flaps along the front
    for (let i = 0; i < stripes; i++) {
      const lx = -w / 2 + ((i + 0.5) * w) / stripes;
      const [ax, az] = P(lx, d / 2 + 0.33);
      b.box(i % 2 ? k2 : k1, ax, y0 + 2.2, az, w / stripes - 0.03, 0.32, 0.03, {
        ry,
        seg: false,
        grime: 0.6,
      });
    }
    // goods on the counter
    const goods = opts.goods || "cans";
    for (let i = 0; i < Math.round(w * 2.2); i++) {
      const lx = -w / 2 + 0.25 + r() * (w - 0.5);
      const [gx, gz] = P(lx, d / 2 - 0.35 + (r() - 0.5) * 0.4);
      if (goods === "cans")
        b.cyl(
          r() < 0.5 ? "paint_red" : "chrome",
          gx,
          y0 + 1.11,
          gz,
          0.06,
          0.06,
          0.14,
          6,
          { hSeg: 1 },
        );
      else if (goods === "bottles") {
        b.cyl(
          r() < 0.3 ? "paint_red" : "glass_dark",
          gx,
          y0 + 1.11,
          gz,
          0.05,
          0.06,
          0.24,
          6,
          { hSeg: 1 },
        );
      } else if (goods === "guns")
        b.box("iron", gx, y0 + 1.11, gz, 0.6, 0.06, 0.14, {
          ry: ry + r() * 0.5,
          seg: false,
        });
      else if (goods === "meds")
        b.box(
          r() < 0.5 ? "paint_cream" : "paint_red",
          gx,
          y0 + 1.11,
          gz,
          0.22,
          0.1,
          0.14,
          { ry: ry + r(), seg: false },
        );
      else if (goods === "junk")
        b.box(
          r() < 0.5 ? "rust" : "panel",
          gx,
          y0 + 1.11,
          gz,
          0.2 + r() * 0.25,
          0.08 + r() * 0.15,
          0.2,
          { ry: ry + r(), seg: false },
        );
    }
    // back shelf with crates
    const [bx, bz] = P(0, -d / 2 + 0.3);
    b.box("rust", bx, y0, bz, w - 0.3, 1.8, 0.45, {
      ry,
      seg: false,
      grime: 0.6,
    });
    for (let k = 0; k < 3; k++)
      b.box("rust", bx, y0 + 0.4 + k * 0.5, bz, w - 0.3, 0.04, 0.5, {
        ry,
        seg: false,
      });
    for (const i of [0, 2]) {
      const [qx, qz] = P(-w / 2 + 0.5 + (i * (w - 1)) / 2, -d / 2 + 0.9);
      b.box("crate", qx, y0, qz, 0.7, 0.55, 0.55, {
        ry: ry + (r() - 0.5) * 0.4,
        seg: false,
        grime: 0.4,
      });
    }
    PF.col(bx, bz, w - 0.3, 0.5, y0, y0 + 1.8, ry, { walkable: false });
    // hanging sign above the awning front
    if (opts.sign) {
      const sk = PF.texMat(
        "stall_" + opts.sign.replace(/\W/g, "_"),
        PF.signTex(
          "stall_" + opts.sign,
          [opts.sign],
          opts.signStyle || "raider",
          512,
          160,
          opts.signColors || { bg: "#4a4638", fg: "#e8d8a0" },
        ),
      );
      const [hx, hz] = P(0, d / 2 + 0.36);
      b.quad(
        sk,
        hx,
        y0 + 2.95,
        hz,
        Math.min(w * 0.8, 2.6),
        Math.min(w * 0.8, 2.6) * 0.31,
        { ry, grime: 0.2 },
      );
      const [hx2, hz2] = P(0, d / 2 + 0.34);
      b.box(
        "rust",
        hx2,
        y0 + 2.5,
        hz2,
        Math.min(w * 0.8, 2.6) + 0.1,
        0.05,
        0.05,
        { ry, seg: false },
      );
    }
  };
  /** Stack of wooden crates (1..n) with a random twist. */
  D.crates = function (b, x, y, z, n, seed, collide) {
    const r = PF.rng(seed || x * 3 + z);
    let h = y;
    for (let i = 0; i < n; i++) {
      const s = 0.6 + r() * 0.3;
      b.box(
        "crate",
        x + (r() - 0.5) * 0.15,
        h,
        z + (r() - 0.5) * 0.15,
        s,
        s * 0.8,
        s,
        { ry: r() * 0.6, seg: false, grime: 0.45 },
      );
      h += s * 0.8;
    }
    if (collide !== false)
      PF.col(x, z, 0.9, 0.9, y, h, 0, { walkable: false, surface: "wood" });
  };
  /** Catenary string of lamp bulbs between two points (emissive bulbs + a couple of glow sprites). */
  D.stringLights = function (b, a, c, sag, n, color) {
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      pts.push(
        V(
          a.x + (c.x - a.x) * t,
          a.y + (c.y - a.y) * t - Math.sin(t * Math.PI) * sag,
          a.z + (c.z - a.z) * t,
        ),
      );
    }
    for (let i = 0; i < n; i++)
      b.beam("iron", pts[i], pts[i + 1], 0.015, 0.015, {
        noAO: true,
        grime: 0,
      });
    for (let i = 1; i < n; i++) {
      b.sphere(
        i % 5 === 3 ? "glass_broken" : "lamp",
        pts[i].x,
        pts[i].y - 0.08,
        pts[i].z,
        0.06,
        { ws: 6, hs: 4, noAO: true, grime: 0 },
      );
      if (i % 4 === 2)
        PF.glows.push({
          pos: pts[i].clone().setY(pts[i].y - 0.08),
          color: color || 0xffd090,
          size: 0.45,
        });
    }
  };
  /** Bank of CRT monitors on a desk or trading post ring. */
