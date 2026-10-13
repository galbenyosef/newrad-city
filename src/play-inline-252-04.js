// play-inline-252 04 — color
// Lines 698-1028 of readable/play-inline-252.pretty.js (statement-aligned).
  Object.assign(MD, {
    // Queensboro: pale grey-beige painted steel (the 1909 lattice), darker lacing, rusting
    qb_steel: {
      custom: "rivet_plate",
      prefer: "custom",
      color: 0x8c8a80,
      tint: 0x9a9888,
      rough: 0.72,
      metal: 0.35,
      uv: 4,
      bump: 0.25,
    },
    qb_steel_dk: {
      custom: "rivet_plate",
      prefer: "custom",
      color: 0x5e5d56,
      tint: 0x6a6960,
      rough: 0.75,
      metal: 0.35,
      uv: 3,
    },
    // Manhattan Bridge blue (weathered), and its rust-bleeding variant for the lower works
    mb_blue: {
      custom: "rivet_plate",
      prefer: "custom",
      color: 0x5a7ea0,
      tint: 0x6e9cc8,
      rough: 0.7,
      metal: 0.35,
      uv: 4,
      bump: 0.25,
    },
    mb_blue_dk: {
      custom: "rivet_plate",
      prefer: "custom",
      color: 0x3c5670,
      tint: 0x4a6a8e,
      rough: 0.72,
      metal: 0.35,
      uv: 3,
    },
    cable: {
      src: "metal_painted",
      color: 0x2e302e,
      tint: 0x3c3e3c,
      rough: 0.6,
      metal: 0.5,
      uv: 2,
    },
    pier_stone: {
      custom: "pier_stone",
      prefer: "custom",
      color: 0x8a8680,
      tint: 0xb8b4ac,
      rough: 0.95,
      uv: 4,
      bump: 1.1,
    },
    arch_stone: {
      custom: "limestone_fine",
      prefer: "custom",
      color: 0xc8c4b8,
      tint: 0xd8d4c8,
      rough: 0.9,
      uv: 3.2,
      bump: 0.5,
    },
    guastavino: {
      custom: "guastavino",
      prefer: "custom",
      color: 0xd4c098,
      tint: 0xf0e4c8,
      rough: 0.55,
      uv: 2.4,
      bump: 0.25,
    },
    quarry: {
      custom: "quarry",
      prefer: "custom",
      color: 0x8a4a34,
      tint: 0xd8b0a0,
      rough: 0.8,
      uv: 2.4,
    },
    gore: {
      custom: "gore",
      prefer: "custom",
      color: 0x5a1812,
      tint: 0xd08070,
      rough: 0.35,
      metal: 0.05,
      uv: 1.2,
    },
    meat: { color: 0x7a2a22, rough: 0.4, uv: 1, plain: true },
    brick_dark: {
      src: "brick_red",
      color: 0x5a3a2c,
      tint: 0x8a6a5a,
      rough: 0.95,
      uv: 3,
    },
    brass: { color: 0x9a7a3a, rough: 0.35, metal: 0.8, uv: 2, plain: true },
    oak: {
      src: "wood_planks",
      color: 0x6a4e30,
      tint: 0x9a7a54,
      rough: 0.7,
      uv: 2,
    },
    lamp_warm: {
      color: 0xffe0a0,
      emissive: 0xffc070,
      emissiveIntensity: 2.0,
      rough: 0.5,
      uv: 1,
      plain: true,
      noShadow: true,
    },
    lamp_green: {
      color: 0x70ff90,
      emissive: 0x30ff60,
      emissiveIntensity: 2.0,
      rough: 0.5,
      uv: 1,
      plain: true,
      noShadow: true,
    },
    lamp_blue: {
      color: 0x90c0ff,
      emissive: 0x4080ff,
      emissiveIntensity: 1.8,
      rough: 0.5,
      uv: 1,
      plain: true,
      noShadow: true,
    },
    neon_pink: {
      color: 0xff70b0,
      emissive: 0xff3a90,
      emissiveIntensity: 2.4,
      rough: 0.5,
      uv: 1,
      plain: true,
      noShadow: true,
    },
    flame: {
      color: 0xffc060,
      emissive: 0xffa030,
      emissiveIntensity: 3.0,
      rough: 1,
      uv: 1,
      plain: true,
      noShadow: true,
    },
    slime: {
      color: 0x3a4a1a,
      emissive: 0x2a4a08,
      emissiveIntensity: 0.4,
      rough: 0.2,
      metal: 0.1,
      uv: 2,
      plain: true,
    },
    tarp_blue: {
      src: "fabric",
      color: 0x2e4a66,
      tint: 0x4a6a8a,
      rough: 1,
      uv: 2,
    },
    tarp_olive: {
      src: "fabric",
      color: 0x4f5238,
      tint: 0x6a6e48,
      rough: 1,
      uv: 2,
    },
    tile_sub: { src: "tile_subway", color: 0xd8d4c8, rough: 0.5, uv: 2 },
    rail: {
      src: "metal_painted",
      color: 0x3a342c,
      tint: 0x5a5046,
      rough: 0.5,
      metal: 0.7,
      uv: 2,
    },
    sleeper: {
      src: "wood_rotten",
      color: 0x3e3226,
      tint: 0x6a5a48,
      rough: 1,
      uv: 2,
    },
    subway_car: {
      src: "metal_panel",
      color: 0x8a8c88,
      tint: 0xa8aaa4,
      rough: 0.55,
      metal: 0.55,
      uv: 3,
    },
    linen: {
      src: "fabric",
      color: 0xb8b0a0,
      tint: 0xe8e0d0,
      rough: 1,
      uv: 1.5,
    },
    glass_tr: {
      color: 0x9aaeb0,
      rough: 0.08,
      metal: 0.4,
      uv: 1,
      plain: true,
      noShadow: true,
    },
  });
  /** Shape geometry with uvs normalised to 0..1 over its bounding box. */
  PF.shapeGeo = function (shape, segs) {
    const g = new THREE.ShapeGeometry(shape, segs || 6);
    g.computeBoundingBox();
    const bb = g.boundingBox,
      uv = g.attributes.uv,
      p = g.attributes.position;
    for (let i = 0; i < p.count; i++)
      uv.setXY(
        i,
        (p.getX(i) - bb.min.x) / (bb.max.x - bb.min.x || 1),
        (p.getY(i) - bb.min.y) / (bb.max.y - bb.min.y || 1),
      );
    return g;
  };
  /**
   * Axis-aligned wall with rectangular openings at any height (+ colliders).
   * axis 'x': runs along x from a0..a1, occupying z f0..f1. axis 'z': runs along z (a0..a1), occupying x f0..f1.
   * gaps: [{c, w, y0, h}] — c/w along the run, y0 absolute bottom. opts: {grime, noCollide, surface}
   */
  PF.wall = function (b, key, axis, a0, a1, f0, f1, y0, y1, gaps, opts) {
    opts = opts || {};
    gaps = gaps || [];
    const cuts = [a0, a1];
    for (const g of gaps) {
      cuts.push(
        Math.max(a0, Math.min(a1, g.c - g.w / 2)),
        Math.max(a0, Math.min(a1, g.c + g.w / 2)),
      );
    }
    cuts.sort((p, q) => p - q);
    for (let i = 0; i < cuts.length - 1; i++) {
      const p = cuts[i],
        q = cuts[i + 1];
      if (q - p < 0.02) continue;
      const mid = (p + q) / 2;
      const holes = gaps
        .filter((g) => mid > g.c - g.w / 2 && mid < g.c + g.w / 2)
        .map((g) => [g.y0, g.y0 + g.h])
        .sort((u, v) => u[0] - v[0]);
      let y = y0;
      const spans = [];
      for (const h of holes) {
        if (h[0] > y + 0.02) spans.push([y, Math.min(h[0], y1)]);
        y = Math.max(y, h[1]);
      }
      if (y < y1 - 0.02) spans.push([y, y1]);
      for (const [ya, yb] of spans) {
        if (yb - ya < 0.02) continue;
        if (axis === "x") {
          b.boxMM(key, p, ya, f0, q, yb, f1, { grime: opts.grime, segLen: 4 });
          if (!opts.noCollide)
            PF.colMM(p, ya, f0, q, yb, f1, {
              walkable: false,
              surface: opts.surface,
            });
        } else {
          b.boxMM(key, f0, ya, p, f1, yb, q, { grime: opts.grime, segLen: 4 });
          if (!opts.noCollide)
            PF.colMM(f0, ya, p, f1, yb, q, {
              walkable: false,
              surface: opts.surface,
            });
        }
      }
    }
  };
  /** Standalone mesh with a shared module material (adds the white vertex colour the materials expect). */
  PF.mesh = function (key, geo) {
    const n = geo.attributes.position.count;
    const c = new Float32Array(n * 3).fill(1);
    geo.setAttribute("color", new THREE.BufferAttribute(c, 3));
    const m = new THREE.Mesh(geo, PF.mat(key));
    m.castShadow = false;
    m.receiveShadow = true;
    return m;
  };
  /** Readable plaque: interactable that shows text. */
  PF.readable = function (pos, title, text, verb) {
    PF.use({
      pos,
      radius: 0.6,
      range: 2.6,
      label: title,
      verb: verb || "Read",
      onInteract() {
        G.notify(title + " — " + text, { duration: 10 });
        PF.sfx("ui_click");
      },
    });
  };
  /** Candle cluster (emissive flames + one glow). */
  PF.candles = function (b, x, y, z, n, seed, parent) {
    const r = PF.rng(seed || x * 3 + z * 5);
    for (let i = 0; i < n; i++) {
      const a = r() * TAU,
        d = r() * 0.18,
        hh = 0.08 + r() * 0.22;
      const cx = x + Math.cos(a) * d,
        cz = z + Math.sin(a) * d;
      b.cyl("candle", cx, y, cz, 0.022, 0.026, hh, 6, { hSeg: 1, grime: 0.2 });
      b.sphere("flame", cx, y + hh + 0.03, cz, 0.018, {
        ws: 4,
        hs: 3,
        sy: 2,
        noAO: true,
        grime: 0,
      });
    }
    PF.glow(V3(x, y + 0.3, z), 0xffb060, 0.9, parent, {
      intensity: 1.2,
      flicker: 0.25,
    });
  };
