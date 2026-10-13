// play-inline-324 02 — add
// Lines 18-359 of readable/play-inline-324.pretty.js (statement-aligned).
  const PF = G._pch;
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  const PI = Math.PI,
    HP = PI / 2,
    TAU = PI * 2;

  // ---- geometry constants (world) ----
  const HL = (PF.HL = {
    X0: -312,
    X1: -299, // deck edges
    GW: -311.2,
    GE: -299.8, // girder lines (columns)
    DY: 7.5, // walkable deck top
    ZN: -38,
    ZS: 273, // north end / headhouse north wall
    TW: -308.5,
    TE: -302.5, // track centre lines
    HZ0: 273,
    HZ1: 290, // headhouse (freight terminal) footprint
    SPUR_Z0: 236.5,
    SPUR_Z1: 245.5,
    SPUR_X1: -262,
  });
  HL.RAIL = HL.DY + 0.3; // rail top
  const STREETS = [];
  for (let i = 0; i < 31; i++) STREETS.push(-410 + i * 45);
  /** Is z within a street corridor (plus margin)? */
  function inStreet(z, m) {
    for (const s of STREETS) if (Math.abs(z - s) < 7 + (m || 0)) return true;
    return false;
  }
  HL.inStreet = inStreet;

  // -------------------------------------------------------------------
  // Boxcar (New York Central 40-ft steel boxcar), local frame: length along
  // local Z. y = rail top. opts: {mat, tipped, doorOpen, num, reefer, flat}
  // -------------------------------------------------------------------
  function boxcar(b, cx, y, cz, ry, opts) {
    opts = opts || {};
    const r = PF.rng("car" + cx + cz);
    const body = opts.mat || "boxcar";
    const M = PF.m4(cx, y, cz, ry, 0, opts.tipped || 0);
    const add = (key, geo, m, o) =>
      b.add(
        key,
        geo,
        Object.assign(
          { m: new THREE.Matrix4().multiplyMatrices(M, m), grime: 0.7 },
          o || {},
        ),
      );
    const L = 12.4,
      W = 3.0;
    // trucks (bogies): side frames, bolster, wheels
    for (const tz of [-4.3, 4.3]) {
      for (const sx of [-0.78, 0.78]) {
        add(
          "hl_steel_dk",
          new THREE.BoxGeometry(0.16, 0.42, 2.5),
          PF.m4(sx, 0.45, tz),
        );
        for (const wz of [-0.85, 0.85]) {
          const w = new THREE.CylinderGeometry(0.42, 0.42, 0.14, 12);
          w.rotateZ(HP);
          add("rust", w, PF.m4(sx - Math.sign(sx) * 0.06, 0.42, tz + wz));
        }
      }
      add(
        "hl_steel_dk",
        new THREE.BoxGeometry(2.2, 0.3, 0.5),
        PF.m4(0, 0.7, tz),
      );
    }
    // underframe: centre sill + side sills + coupler boxes
    add("hl_steel_dk", new THREE.BoxGeometry(0.5, 0.4, L), PF.m4(0, 0.95, 0));
    for (const sz of [-1, 1]) {
      add(
        "hl_steel_dk",
        new THREE.BoxGeometry(0.35, 0.35, 0.8),
        PF.m4(0, 0.9, sz * (L / 2 + 0.3)),
      );
      add(
        "rust",
        new THREE.BoxGeometry(0.3, 0.25, 0.4),
        PF.m4(0, 0.9, sz * (L / 2 + 0.75)),
      );
    }
    if (opts.flat) {
      // flatcar: deck + stake pockets
      add("tie_wood", new THREE.BoxGeometry(W, 0.18, L), PF.m4(0, 1.25, 0));
      add(
        body,
        new THREE.BoxGeometry(W + 0.1, 0.35, L + 0.1),
        PF.m4(0, 1.02, 0),
      );
      for (let k = -5; k <= 5; k++)
        for (const sx of [-1, 1])
          add(
            "rust",
            new THREE.BoxGeometry(0.1, 0.25, 0.14),
            PF.m4(sx * (W / 2 + 0.05), 1.1, k * 1.1),
          );
      return;
    }
    const H = 3.3,
      y0 = 1.15;
    add(body, new THREE.BoxGeometry(W, H, L, 1, 2, 4), PF.m4(0, y0 + H / 2, 0));
    // roof (slight crown) + running board
    const roof = new THREE.CylinderGeometry(
      4.5,
      4.5,
      L + 0.1,
      24,
      1,
      false,
      -0.34,
      0.68,
    );
    roof.rotateX(HP);
    roof.rotateZ(HP);
    roof.rotateY(HP);
    add(body, roof, PF.m4(0, y0 + H - 4.5 * Math.cos(0.34) + 0.02, 0, 0, 0, 0));
    add(
      "tie_wood",
      new THREE.BoxGeometry(0.55, 0.06, L),
      PF.m4(0, y0 + H + 0.2, 0),
    );
    // vertical ribs (the pressed-steel side posts) and end ribs
    for (let k = 0; k < 13; k++) {
      const z = -L / 2 + 0.45 + (k * (L - 0.9)) / 12;
      if (Math.abs(z) < 1.9) continue; // door opening
      for (const sx of [-1, 1])
        add(
          body,
          new THREE.BoxGeometry(0.08, H - 0.1, 0.14),
          PF.m4(sx * (W / 2 + 0.03), y0 + H / 2, z),
        );
    }
    for (const sz of [-1, 1])
      for (let k = 0; k < 4; k++)
        add(
          body,
          new THREE.BoxGeometry(W - 0.2, 0.12, 0.08),
          PF.m4(0, y0 + 0.5 + k * 0.85, sz * (L / 2 + 0.03)),
        );
    // sliding doors (one side may be open) + door tracks
    for (const sx of [-1, 1]) {
      const open = opts.doorOpen && sx === opts.doorOpen;
      add(
        "rust",
        new THREE.BoxGeometry(0.06, 0.1, 6),
        PF.m4(sx * (W / 2 + 0.1), y0 + H - 0.15, 0),
      );
      add(
        "rust",
        new THREE.BoxGeometry(0.06, 0.1, 6),
        PF.m4(sx * (W / 2 + 0.1), y0 + 0.1, 0),
      );
      add(
        body,
        new THREE.BoxGeometry(0.09, H - 0.35, 3.0),
        PF.m4(sx * (W / 2 + 0.07), y0 + H / 2 - 0.05, open ? 2.9 : 0),
        { c: 0xd8c8c0 },
      );
      for (let k = 0; k < 3; k++)
        add(
          "rust",
          new THREE.BoxGeometry(0.05, H - 0.4, 0.07),
          PF.m4(sx * (W / 2 + 0.13), y0 + H / 2, (open ? 2.9 : 0) - 1.0 + k),
        );
      if (open)
        add(
          "glass_broken",
          new THREE.PlaneGeometry(2.9, H - 0.3),
          PF.m4(sx * (W / 2 + 0.005), y0 + H / 2, 0, sx * HP),
          { uv: "keep", noAO: true, grime: 0 },
        );
      // herald + reporting marks
      const hk = PF.texMat(
        "herald_" + (opts.num || 1),
        PF.heraldTex(opts.mark || "NYC", opts.num || 174022),
        { transparent: true, noShadow: true },
      );
      add(
        hk,
        new THREE.PlaneGeometry(4.2, 2.1),
        PF.m4(sx * (W / 2 + 0.03), y0 + H * 0.55, sx * 3.9, sx * HP),
        { uv: "keep", grime: 0.1, noAO: true },
      );
      // corner ladders
      for (const sz of [-1, 1]) {
        for (let k = 0; k < 7; k++)
          add(
            "rust",
            new THREE.BoxGeometry(0.05, 0.05, 0.45),
            PF.m4(
              sx * (W / 2 + 0.12),
              y0 + 0.4 + k * 0.42,
              sz * (L / 2 - 0.35),
            ),
          );
      }
    }
    // brake wheel on one end
    const bw = new THREE.TorusGeometry(0.3, 0.03, 4, 12);
    add("rust", bw, PF.m4(0.4, y0 + H - 0.2, L / 2 + 0.2));
    void r;
  }
  PF.boxcar = boxcar;

  // -------------------------------------------------------------------
  // Meadow: grass blades, goldenrod stalks, low shrubs, soil beds
  // -------------------------------------------------------------------
  const bladeGeo = () => new THREE.ConeGeometry(0.035, 1, 3, 1, true);
  function meadow(b, x0, z0, x1, z1, y, density, seed) {
    const r = PF.rng(seed);
    // grass cards (crossed alpha quads) for density, then a few 3D blades & flowers for parallax
    const cards = Math.round((x1 - x0) * (z1 - z0) * density * 0.85);
    for (let i = 0; i < cards; i++) {
      const cx = x0 + r() * (x1 - x0),
        cz = z0 + r() * (z1 - z0);
      const key = PF.grassCardKey(r() < 0.6 ? 0 : r() < 0.6 ? 1 : 2);
      const sw = 0.9 + r() * 0.8,
        sh = 0.45 + r() * 0.55,
        a = r() * PI;
      for (let k = 0; k < 2; k++)
        b.quad(key, cx, y + sh / 2 - 0.03, cz, sw, sh, {
          ry: a + k * HP,
          grime: 0.05,
          noAO: true,
        });
    }
    density *= 0.35;
    const area = (x1 - x0) * (z1 - z0);
    const clumps = Math.round(area * density);
    for (let i = 0; i < clumps; i++) {
      const cx = x0 + r() * (x1 - x0),
        cz = z0 + r() * (z1 - z0);
      const n = 3 + ((r() * 5) | 0),
        h0 = 0.35 + r() * 0.6;
      const key = r() < 0.7 ? "weeds" : "leaf";
      for (let k = 0; k < n; k++) {
        const h = h0 * (0.6 + r() * 0.6);
        const g = bladeGeo();
        g.translate(0, 0.5, 0);
        g.scale(1, h, 1);
        b.add(key, g, {
          m: PF.m4(
            cx + (r() - 0.5) * 0.35,
            y,
            cz + (r() - 0.5) * 0.35,
            r() * TAU,
            (r() - 0.5) * 0.7,
            (r() - 0.5) * 0.7,
          ),
          grime: 0.15,
          noAO: true,
        });
      }
      if (r() < 0.12) {
        // goldenrod / aster flower head on a stalk
        const h = 0.8 + r() * 0.5,
          fx = cx + (r() - 0.5) * 0.2,
          fz = cz + (r() - 0.5) * 0.2;
        b.beam(
          "leaf",
          V3(fx, y, fz),
          V3(fx + (r() - 0.5) * 0.2, y + h, fz + (r() - 0.5) * 0.2),
          0.02,
          0.02,
          { noAO: true, grime: 0 },
        );
        b.sphere(
          r() < 0.6 ? "flower_y" : "flower_w",
          fx,
          y + h + 0.05,
          fz,
          0.08,
          { ws: 4, hs: 2, sy: 1.8, noAO: true, grime: 0.1 },
        );
      }
    }
  }
  function shrub(b, x, y, z, s, seed, key) {
    const r = PF.rng(seed);
    const n = 3 + ((r() * 3) | 0);
    for (let i = 0; i < n; i++) {
      const a = r() * TAU,
        d = r() * s * 0.5;
      b.sphere(
        key || (r() < 0.75 ? "leaf" : "leaf_red"),
        x + Math.cos(a) * d,
        y + s * (0.3 + r() * 0.25),
        z + Math.sin(a) * d,
        s * (0.35 + r() * 0.25),
        {
          ws: 7,
          hs: 5,
          sy: 0.7,
          grime: 0.2,
          noAO: true,
          deform: (v) => {
            const k =
              1 + Math.sin(v.x * 9 + seed) * Math.cos(v.z * 7 + v.y * 5) * 0.18;
            v.multiplyScalar(k);
          },
        },
      );
    }
  }
  /** Sumac / ailanthus tree: leaning trunk + clusters of leaf blobs. */
  function tree(b, x, y, z, h, seed) {
    const r = PF.rng(seed);
    const top = V3(x + (r() - 0.5) * 1.2, y + h * 0.7, z + (r() - 0.5) * 1.2);
    b.rod("bark", V3(x, y - 0.2, z), top, 0.12 + h * 0.012, 6, {
      r2: 0.07,
      grime: 0.2,
    });
    for (let i = 0; i < 4; i++) {
      const a = r() * TAU,
        len = h * (0.25 + r() * 0.2);
      const tip = V3(
        top.x + Math.cos(a) * len,
        top.y + len * (0.3 + r() * 0.5),
        top.z + Math.sin(a) * len,
      );
      b.rod("bark", top, tip, 0.06, 4, { r2: 0.03, grime: 0.1 });
      shrub(
        b,
        tip.x,
        tip.y - h * 0.18,
        tip.z,
        h * 0.42,
        seed * 7 + i,
        r() < 0.35 ? "leaf_red" : "leaf",
      );
    }
  }
  PF.hlMeadow = meadow;
  PF.hlShrub = shrub;
  PF.hlTree = tree;

