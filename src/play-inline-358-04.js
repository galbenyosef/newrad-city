// play-inline-358 04 — rough
// Lines 709-929 of readable/play-inline-358.pretty.js (statement-aligned).
  Object.assign(PF.CUSTOM_TEX, {
    schist_sq: [512, 512, schistSqDraw],
    flags_sand: [512, 512, flagsDraw],
    singer_marble: [512, 512, singerFloorDraw],
    terrazzo_brass: [512, 512, terrazzoDraw],
    mosaic_ch: [512, 512, mosaicDraw],
    parquet: [512, 512, parquetDraw],
    skyline: [1024, 512, skylineDraw],
    tin_ceiling: [512, 512, tinDraw],
    guastavino: [512, 512, guastavinoDraw],
    marble_panel: [512, 512, marblePanelDraw],
  });
  Object.assign(PF.MAT_DEFS, {
    sp_flags: {
      custom: "flags_sand",
      prefer: "custom",
      color: 0xa89478,
      tint: 0xe8dcc8,
      rough: 0.9,
      uv: 3.2,
      bump: 0.5,
    },
    sg_floor: {
      custom: "singer_marble",
      prefer: "custom",
      color: 0xd8d4c8,
      rough: 0.3,
      uv: 2.6,
    },
    fw_terrazzo: {
      custom: "terrazzo_brass",
      prefer: "custom",
      color: 0xc4b89c,
      rough: 0.35,
      uv: 4.8,
    },
    ch_mosaic: {
      custom: "mosaic_ch",
      prefer: "custom",
      color: 0xc8bca4,
      rough: 0.45,
      uv: 3.6,
    },
    parquet_ws: {
      custom: "parquet",
      prefer: "custom",
      color: 0x7a5634,
      tint: 0xd8c0a0,
      rough: 0.55,
      uv: 2.4,
    },
    // the view out of every window (emissive: interiors read daylit, the view reads through dirty glass)
    sky_view: {
      custom: "skyline",
      prefer: "custom",
      color: 0xb8b8a0,
      tint: 0x9a9888,
      emissive: 0xffffff,
      emissiveIntensity: 0.62,
      emissiveMapCustom: true,
      rough: 0.2,
      metal: 0.1,
      uv: 1,
      noShadow: true,
    },
    window_amber: {
      color: 0x3a3020,
      emissive: 0xffb050,
      emissiveIntensity: 0.32,
      rough: 0.6,
      uv: 2,
      plain: true,
      noShadow: true,
    },
    statue_ws: {
      custom: "stucco",
      prefer: "custom",
      color: 0xa8a292,
      tint: 0xb4ad9c,
      rough: 0.85,
      uv: 1.4,
    }, // weathered, sooty marble
    money: { color: 0x6a7a58, rough: 0.9, uv: 1, plain: true },
    leather_ws: {
      src: "leather",
      color: 0x4a2a1a,
      tint: 0x9a6a48,
      rough: 0.6,
      uv: 1.2,
    },
    china: { color: 0xe8e4da, rough: 0.3, uv: 1, plain: true },
    felt: { src: "carpet", color: 0x2a5a3a, tint: 0x3e7a50, rough: 1, uv: 1 },
    tin_ceil: {
      custom: "tin_ceiling",
      prefer: "custom",
      color: 0xc8c0a8,
      tint: 0xe8e0d0,
      rough: 0.6,
      metal: 0.25,
      uv: 2.4,
      bump: 0.6,
    },
    guastavino: {
      custom: "guastavino",
      prefer: "custom",
      color: 0xc49a70,
      tint: 0xf0dcc8,
      rough: 0.85,
      uv: 2.2,
      bump: 0.4,
    },
    marble_pnl: {
      custom: "marble_panel",
      prefer: "custom",
      color: 0xe0dbd0,
      tint: 0xf4f0e8,
      rough: 0.35,
      uv: 2.4,
    },
    wall_clean: {
      custom: "stucco",
      prefer: "custom",
      color: 0xd8d0bc,
      tint: 0xc8bea8,
      rough: 0.9,
      uv: 4,
    },
    walnut: {
      src: "wood_planks",
      color: 0x3a2618,
      tint: 0x6a4a34,
      rough: 0.5,
      uv: 1.6,
    },
    gilt_matte: {
      color: 0xb08a3c,
      emissive: 0x2a1a04,
      emissiveIntensity: 0.15,
      rough: 0.82,
      metal: 0.2,
      uv: 2,
      plain: true,
    }, // weathered exterior gilding: no sun hotspots / bloom
  });
  /** A random view rectangle for a window of w×h metres. high = the view from 140 m (Singer lantern). */
  PF.skyRect = function (r, w, h, high) {
    const du = Math.min(0.95, Math.max(0.05, (w / h) * 0.25));
    const u0 = r() * (1 - du);
    return high ? [u0, 0, u0 + du, 0.5] : [u0, 0.5, u0 + du, 1];
  };

  // -------------------------------------------------------------------
  // Sign atlas: many sign canvases → one texture/material (one draw call)
  // -------------------------------------------------------------------
  /**
   * entries: [[name, THREE.Texture (canvas)] ...] → {key, rect(name) → [u0,v0,u1,v1]}. Shelf-packed, 4 px padding.
   * opts: {transparent, side, emissive}
   */
  PF.atlas = function (key, entries, opts) {
    opts = opts || {};
    const W = 2048,
      pad = 4,
      rects = {};
    let x = 0,
      y = 0,
      rowH = 0;
    const place = entries.map(([name, tex]) => {
      const img = tex.image,
        w = img.width,
        h = img.height;
      if (x + w + pad > W) {
        x = 0;
        y += rowH + pad;
        rowH = 0;
      }
      const p = { name, img, x, y, w, h };
      x += w + pad;
      rowH = Math.max(rowH, h);
      return p;
    });
    const H = y + rowH;
    const tex = PF.canvasTex(
      "pws_atlas_" + key,
      W,
      H,
      (ctx) => {
        ctx.clearRect(0, 0, W, H);
        for (const p of place) {
          try {
            ctx.drawImage(p.img, p.x, p.y);
          } catch (e) {
            /* canvas missing */
          }
        }
      },
      { clamp: true },
    );
    for (const p of place)
      rects[p.name] = [
        (p.x + 0.5) / W,
        1 - (p.y + p.h - 0.5) / H,
        (p.x + p.w - 0.5) / W,
        1 - (p.y + 0.5) / H,
      ];
    const k = PF.texMat("atlas_" + key, tex, {
      rough: opts.rough === undefined ? 0.85 : opts.rough,
      transparent: !!opts.transparent,
      side: opts.side,
      noShadow: true,
      emissive: opts.emissive,
    });
    return { key: k, rect: (name) => rects[name] || [0, 0, 1, 1] };
  };

  // -------------------------------------------------------------------
  // Statues: standing draped figure (Custom House attic — the trading nations)
  // -------------------------------------------------------------------
  /**
   * Standing classical figure, ~2.6 m at s = 1, faces +z. variant: 0 oar, 1 caduceus, 2 cornucopia, 3 spear & shield,
   * 4 anchor, 5 book & torch. opts: {grime, broken (head lost)}.
   */
