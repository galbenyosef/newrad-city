// play-inline-243 02 — add
// Lines 16-205 of readable/play-inline-243.pretty.js (statement-aligned).
  const PR = G._pr;
  const TAU = Math.PI * 2,
    HP = Math.PI / 2;
  const V = (x, y, z) => new THREE.Vector3(x, y, z);

  Object.assign(PR.MAT_DEFS, {
    tram_red: { src: "paint_red", uv: 2, tint: 0xb04030 },
    tower_rust: { src: "rust", uv: 2, tint: 0x9a5a40 },
  });

  const TZ = -463; // cable line
  const TWR = { x: 386, top: 36 }; // lattice tower
  const ST = { x0: 391, x1: 403, z0: -469, z1: -457, y: 5.2 }; // station platform

  /** Quadratic Bezier point. */
  const bez = (a, c, b, t) =>
    V(
      (1 - t) * (1 - t) * a.x + 2 * (1 - t) * t * c.x + t * t * b.x,
      (1 - t) * (1 - t) * a.y + 2 * (1 - t) * t * c.y + t * t * b.y,
      (1 - t) * (1 - t) * a.z + 2 * (1 - t) * t * c.z + t * t * b.z,
    );
  function cable(b, a, c, e, r, n) {
    let prev = a;
    for (let i = 1; i <= n; i++) {
      const p = bez(a, c, e, i / n);
      b.rod("iron", prev, p, r, 5);
      prev = p;
    }
  }

  /** Tram cabin (local: length along X, centre at floor), with the hanger arm up to a carriage at +hang. */
  function cabin(b, M, opts) {
    opts = opts || {};
    const add = (key, geo, m, o) =>
      b.add(
        key,
        geo,
        Object.assign(
          { m: new THREE.Matrix4().multiplyMatrices(M, m), grime: 0.6 },
          o || {},
        ),
      );
    const L = 5.6,
      W = 2.7,
      H = 2.5;
    add("tram_red", new THREE.BoxGeometry(L, 0.8, W), PR.m4(0, 0.4, 0)); // lower body
    add("tram_red", new THREE.BoxGeometry(L, 0.45, W), PR.m4(0, H - 0.22, 0)); // roof band
    add(
      "panel",
      new THREE.BoxGeometry(L + 0.1, 0.12, W + 0.1),
      PR.m4(0, H + 0.05, 0),
      { c: 0x9a9a90 },
    );
    for (let k = 0; k < 7; k++) {
      const x = -L / 2 + 0.05 + (k * (L - 0.1)) / 6;
      add(
        "steel",
        new THREE.BoxGeometry(0.1, H - 1.25, W + 0.02),
        PR.m4(x, 0.8 + (H - 1.25) / 2, 0),
        { c: 0x6a6a64 },
      );
    } // window mullions
    add(
      opts.broken ? "glass_broken" : "glass_dark",
      new THREE.BoxGeometry(L - 0.1, H - 1.25, W - 0.1),
      PR.m4(0, 0.8 + (H - 1.25) / 2, 0),
    );
    add(
      "rust",
      new THREE.BoxGeometry(L - 0.4, 0.15, W - 0.3),
      PR.m4(0, -0.05, 0),
    ); // undercarriage
    // hanger: two raked arms to a yoke, carriage with sheaves on the rope
    const hang = opts.hang || 3.2;
    for (const s of [-1, 1]) {
      const a = V(s * 1.6, H + 0.1, 0).applyMatrix4(M),
        c = V(s * 0.3, H + hang - 0.3, 0).applyMatrix4(M);
      b.beam("steel", a, c, 0.16, 0.16, { grime: 0.6, c: 0x6a6a64 });
    }
    add(
      "steel",
      new THREE.BoxGeometry(2.4, 0.4, 0.5),
      PR.m4(0, H + hang - 0.1, 0),
      { c: 0x5a5a54 },
    );
    for (const s of [-0.8, 0.8])
      add(
        "iron",
        new THREE.CylinderGeometry(0.28, 0.28, 0.14, 12),
        PR.m4(s, H + hang + 0.25, 0, 0, HP, 0),
      );
    // livery: "ROOSEVELT ISLAND" band + car number
    const k = PR.texMat(
      "pr_tram_livery",
      PR.signTex(
        "pr_tram_livery",
        ["WELFARE ISLAND AERIAL TRAMWAY"],
        "plain",
        512,
        64,
        { bg: "#b04030", fg: "#f0e6d0" },
      ),
    );
    for (const s of [-1, 1])
      add(
        k,
        new THREE.PlaneGeometry(4.2, 0.42),
        PR.m4(0, 0.5, s * (W / 2 + 0.02), s > 0 ? 0 : Math.PI),
        { uv: "keep", grime: 0.3, noAO: true },
      );
    const nk = PR.texMat(
      "pr_tram_no" + (opts.no || 1),
      PR.signTex(
        "pr_tram_no" + (opts.no || 1),
        [String(opts.no || 1)],
        "plain",
        128,
        128,
        { bg: "#b04030", fg: "#f0e6d0" },
      ),
    );
    for (const s of [-1, 1])
      add(
        nk,
        new THREE.PlaneGeometry(0.6, 0.6),
        PR.m4(s * (L / 2 + 0.02), 1.4, 0, s * HP),
        { uv: "keep", grime: 0.3, noAO: true },
      );
  }

  function lattice(b, x, z, h, bx0, bz0, bx1, bz1) {
    // four legs tapering from (±bx0, ±bz0) at the base to (±bx1, ±bz1) at the top; X-bracing every 4 m
    const corner = (sx, sz, y) => {
      const f = y / h;
      return V(
        x + sx * (bx0 + (bx1 - bx0) * f),
        y,
        z + sz * (bz0 + (bz1 - bz0) * f),
      );
    };
    const C = [
      [-1, -1],
      [1, -1],
      [1, 1],
      [-1, 1],
    ];
    for (const [sx, sz] of C)
      b.beam("tower_rust", corner(sx, sz, 0), corner(sx, sz, h), 0.34, 0.34, {
        grime: 0.5,
      });
    for (let y = 0; y < h - 0.5; y += 4) {
      const y1 = Math.min(h, y + 4);
      for (let i = 0; i < 4; i++) {
        const [ax, az] = C[i],
          [cx, cz] = C[(i + 1) % 4];
        b.beam(
          "tower_rust",
          corner(ax, az, y1),
          corner(cx, cz, y1),
          0.16,
          0.16,
          { grime: 0.5 },
        );
        b.beam("tower_rust", corner(ax, az, y), corner(cx, cz, y1), 0.1, 0.1, {
          grime: 0.5,
        });
        b.beam("tower_rust", corner(cx, cz, y), corner(ax, az, y1), 0.1, 0.1, {
          grime: 0.5,
        });
      }
    }
    for (const [sx, sz] of C) {
      const p = corner(sx, sz, 0);
      b.boxMM(
        "concrete",
        p.x - 0.6,
        -0.2,
        p.z - 0.6,
        p.x + 0.6,
        0.5,
        p.z + 0.6,
        { seg: false },
      );
      PR.col(p.x, p.z, 1.2, 1.2, 0, 3, 0, {
        walkable: false,
        surface: "metal",
      });
    }
  }

