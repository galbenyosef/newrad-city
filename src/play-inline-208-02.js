// play-inline-208 02 — math
// Lines 24-331 of readable/play-inline-208.pretty.js (statement-aligned).
  const PF = G._pf;
  const K = PF.kit,
    D = PF.dress;
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  const PI = Math.PI,
    HP = Math.PI / 2,
    TAU = Math.PI * 2;
  const BASE = 10;

  // ship frames (exterior)
  const PK = {
    x0: 264,
    x1: 328,
    zc: 736.2,
    hb: 5.0,
    deck: 4.0,
    top: 5.2,
    bot: -5.5,
  }; // Peking
  const AM = {
    x0: 281,
    x1: 307,
    zc: 712.2,
    hb: 3.4,
    deck: 2.6,
    top: 3.5,
    bot: -3.5,
  }; // Ambrose
  const P16 = { z0: 718, z1: 728, x1: 332 }; // Pier 16
  const P17 = { z0: 681, z1: 701, x1: 318 }; // Pier 17
  const shoreX = (z) => 285 - ((z - 620) * 30) / 140;

  Object.assign(PF.flagDefaults, {
    sp_met: false,
    sp_nest: false,
    sp_harvest: false,
    sp_cal: false,
    sp_market: false,
    sp_clutch: [],
    sp_lottie_door: false,
  });

  // ===================================================================
  // helpers
  // ===================================================================
  /** Hull half-width factor along the length v (0 = stern, 1 = bow). */
  function wf(v, sharp) {
    if (v < 0.12) return 0.72 + 0.28 * (v / 0.12);
    if (v > 0.68)
      return Math.pow(Math.cos(((v - 0.68) / 0.32) * HP), sharp || 0.85);
    return 1;
  }
  /** Deck outline point (world) at v, side s (-1 port/north, +1 starboard/south). */
  function deckPt(S, v, s, inset) {
    return [S.x0 + v * (S.x1 - S.x0), S.zc + s * (S.hb * wf(v) - (inset || 0))];
  }
  /** Parametric hull surface. */
  function hull(b, key, S, opts) {
    opts = opts || {};
    const g = PF.surface(
      (u, v, out) => {
        const th = (u - 0.5) * PI,
          w = S.hb * wf(v);
        const sheer = S.top + 0.6 * Math.pow(Math.abs(v - 0.5) * 2, 2.5); // sheer line rises at the ends
        const bot = S.bot + 1.5 * Math.pow(Math.abs(v - 0.45) * 1.8, 3);
        const yy = sheer - (sheer - bot) * Math.pow(Math.cos(th), 0.35);
        out.set(S.x0 + v * (S.x1 - S.x0), yy, S.zc + w * Math.sin(th));
      },
      opts.nu || 16,
      opts.nv || 36,
      { flip: true },
    );
    b.add(key, g, { grime: 0.45, noAO: true });
  }
  /** Flat deck polygon at height y (+ collider strips). */
  function deck(b, key, S, y, inset, collide) {
    const pts = [];
    for (let i = 0; i <= 24; i++) pts.push(deckPt(S, i / 24, -1, inset));
    for (let i = 24; i >= 0; i--) pts.push(deckPt(S, i / 24, 1, inset));
    const sh = new THREE.Shape();
    sh.moveTo(pts[0][0], -pts[0][1]);
    for (let i = 1; i < pts.length; i++) sh.lineTo(pts[i][0], -pts[i][1]);
    const g = new THREE.ExtrudeGeometry(sh, {
      depth: 0.25,
      bevelEnabled: false,
    });
    g.rotateX(-HP);
    g.translate(0, y - 0.25, 0);
    b.add(key, g, { grime: 0.5 });
    if (collide) {
      for (let i = 0; i < 16; i++) {
        const v0 = i / 16,
          v1 = (i + 1) / 16,
          vm = (v0 + v1) / 2;
        const w = S.hb * Math.min(wf(v0), wf(v1)) - (inset || 0) + 0.2;
        if (w < 0.3) continue;
        PF.colMM(
          S.x0 + v0 * (S.x1 - S.x0),
          S.bot,
          S.zc - w,
          S.x0 + v1 * (S.x1 - S.x0),
          y,
          S.zc + w,
          { surface: "wood" },
        );
        void vm;
      }
    }
    return pts;
  }
  /** Bulwark (inner planking + rail) along the deck edge with colliders; gaps: [[v0,v1,side]]. */
  function bulwark(b, S, y, h, gaps, keyIn, keyRail) {
    for (const s of [-1, 1]) {
      for (let i = 0; i < 24; i++) {
        const v0 = i / 24,
          v1 = (i + 1) / 24,
          vm = (v0 + v1) / 2;
        if ((gaps || []).some((g) => g[2] === s && vm > g[0] && vm < g[1]))
          continue;
        const [ax, az] = deckPt(S, v0, s, 0.12),
          [bx, bz] = deckPt(S, v1, s, 0.12);
        const len = Math.hypot(bx - ax, bz - az),
          ry = Math.atan2(-(bz - az), bx - ax);
        b.box(
          keyIn || "hull_white",
          (ax + bx) / 2,
          y,
          (az + bz) / 2,
          len + 0.05,
          h,
          0.14,
          { ry, seg: false, grime: 0.5 },
        );
        b.box(
          keyRail || "mahogany",
          (ax + bx) / 2,
          y + h,
          (az + bz) / 2,
          len + 0.08,
          0.1,
          0.3,
          { ry, seg: false },
        );
        PF.colWall(ax, az, bx, bz, 0.25, y, y + h + 0.1, { walkable: false });
      }
    }
    // transom (stern) rail
    const [sx0, sz0] = deckPt(S, 0, -1, 0.12),
      [sx1, sz1] = deckPt(S, 0, 1, 0.12);
    b.box(
      keyIn || "hull_white",
      sx0 + 0.07,
      y,
      (sz0 + sz1) / 2,
      0.14,
      h,
      Math.abs(sz1 - sz0),
      { seg: false },
    );
    b.box(
      keyRail || "mahogany",
      sx0 + 0.07,
      y + h,
      (sz0 + sz1) / 2,
      0.3,
      0.1,
      Math.abs(sz1 - sz0) + 0.1,
      { seg: false },
    );
    PF.colMM(
      sx0 - 0.1,
      y,
      Math.min(sz0, sz1),
      sx0 + 0.25,
      y + h + 0.1,
      Math.max(sz0, sz1),
      { walkable: false },
    );
  }
  /** Painted letters on a hull side (flat quad). */
  function hullName(b, text, x, y, z, ry, w, h, color) {
    const k = PF.texMat(
      "sp_name_" + text + "_" + (color || "w"),
      PF.canvasTex(
        "pf_sp_name_" + text + (color || "w"),
        512,
        96,
        (ctx, W, H) => {
          ctx.clearRect(0, 0, W, H);
          ctx.fillStyle = color || "#e8e4d8";
          ctx.font = "bold 76px Georgia, serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(text, W / 2, H / 2 + 4);
          for (let i = 0; i < 400; i++) {
            ctx.clearRect(
              Math.random() * W,
              Math.random() * H,
              2 + Math.random() * 5,
              2 + Math.random() * 4,
            );
          }
        },
        { clamp: true },
      ),
      { transparent: true, rough: 0.7 },
    );
    b.quad(k, x, y, z, w, h, { ry, grime: 0.1, noAO: true });
  }
  /** A timber pier: deck slab + piles + bollards + edge beams (+ colliders). */
  function pier(b, x0, x1, z0, z1, y, opts) {
    opts = opts || {};
    b.boxMM(opts.key || "deck_wood", x0, y - 0.35, z0, x1, y, z1, {
      grime: 0.6,
      segLen: 4,
    });
    PF.colMM(x0, y - 3, z0, x1, y, z1, { surface: "wood" });
    for (let x = x0 + 1; x < x1; x += 3)
      for (const z of [z0 + 0.3, (z0 + z1) / 2, z1 - 0.3])
        b.cyl("rotten", x, -6, z, 0.25, 0.28, 6 + y - 0.35, 6, {
          hSeg: 2,
          grime: 0.8,
        });
    for (let x = x0 + 2; x < x1 - 1; x += 7)
      for (const z of [z0 + 0.4, z1 - 0.4]) {
        b.cyl("iron", x, y, z, 0.18, 0.22, 0.5, 8, { hSeg: 1 });
        b.cyl("iron", x, y + 0.5, z, 0.26, 0.2, 0.12, 8, { hSeg: 1 });
      }
    b.boxMM("rotten", x0, y - 0.6, z0 - 0.2, x1, y - 0.1, z0, { seg: false });
    b.boxMM("rotten", x0, y - 0.6, z1, x1, y - 0.1, z1 + 0.2, { seg: false });
    // broken planks & holes
    const r = PF.rng(x0 * 3 + z0);
    for (let i = 0; i < (opts.holes || 3); i++)
      b.box(
        "glass_broken",
        x0 + 4 + r() * (x1 - x0 - 8),
        y + 0.005,
        z0 + 1 + r() * (z1 - z0 - 2),
        1.2 + r(),
        0.01,
        0.6 + r() * 0.6,
        { ry: r() * PI, seg: false, noAO: true },
      );
  }
  /** Shellback nest mound with eggs (+ glow). Returns centre. */
  function nest(b, x, y, z, r0, eggs, parent, seed) {
    const r = PF.rng(seed || x * 7 + z);
    b.rock("dirt", x, y - r0 * 0.4, z, r0, {
      flat: 0.35,
      rough: 0.6,
      seed: seed || x,
    });
    b.rock("slime", x + r0 * 0.3, y - r0 * 0.3, z - r0 * 0.2, r0 * 0.6, {
      flat: 0.3,
      detail: 1,
      seed: (seed || x) + 1,
    });
    for (let i = 0; i < eggs; i++) {
      const a = r() * TAU,
        d = Math.sqrt(r()) * r0 * 0.8;
      b.sphere(
        "egg",
        x + Math.cos(a) * d,
        y + 0.15 + r() * 0.12 + (1 - d / r0) * r0 * 0.25,
        z + Math.sin(a) * d,
        0.16 + r() * 0.06,
        { ws: 8, hs: 6, sy: 1.25 },
      );
    }
    for (let i = 0; i < 5; i++) {
      const a = r() * TAU;
      b.box(
        "bone",
        x + Math.cos(a) * r0,
        y + 0.03,
        z + Math.sin(a) * r0,
        0.05,
        0.05,
        0.4,
        { ry: r() * PI, seg: false },
      );
    }
    PF.glow(V3(x, y + 0.4, z), 0x9aff60, r0 * 1.6, parent || null, {
      intensity: 0.7,
      flicker: 0.15,
    });
    return V3(x, y, z);
  }

  /** One long face of a Schermerhorn Row unit (fs +1 = south / plaza, -1 = north / Fulton Street): granite shopfront
   *  storey with cast-iron mullions & a named sign band, framed 6-over-6 sash windows (jambs, splayed lintel, sill,
   *  muntins) with a spread of dark / broken / boarded / shuttered states, and a dentil cornice. */
  const SHOPS_N = [
    "BOWNE & CO. STATIONERS",
    "A. A. LOW & BROS.",
    "SWEET'S",
    "FULTON ST. PROVISIONS",
    "PAGAN'S SAIL LOFT",
    "SEAPORT BOOKS",
  ];
  const SHOPS_S = [
    "FULTON FISH CO.",
    "SEAMEN'S SUPPLY",
    "SLOPPY LOU'S OYSTERS",
    "SHIP CHANDLERY",
    "SEAPORT MUSEUM",
    "FIZZO COLA · OYSTERS · RUM",
  ];
