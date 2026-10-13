// play-inline-262 06 — color
// Lines 1288-1443 of readable/play-inline-262.pretty.js (statement-aligned).
  C.oak_dark = [
    512,
    512,
    (ctx, w, h) => {
      // dark Scottish oak panelling, tall linenfold panels
      const r = P.rng("oakd");
      ctx.fillStyle = "#3c2a18";
      ctx.fillRect(0, 0, w, h);
      for (let y = 0; y < h; y += 2) {
        ctx.fillStyle =
          "rgba(" +
          ((80 + r() * 30) | 0) +
          "," +
          ((54 + r() * 18) | 0) +
          ",28," +
          (0.12 + r() * 0.18) +
          ")";
        ctx.fillRect(0, y, w, 1 + r() * 2);
      }
      for (let i = 0; i < 4; i++) {
        const x0 = (i * w) / 4 + 12,
          pw = w / 4 - 24;
        ctx.strokeStyle = "rgba(12,6,2,0.8)";
        ctx.lineWidth = 5;
        ctx.strokeRect(x0, 16, pw, h - 32);
        ctx.strokeStyle = "rgba(160,110,60,0.22)";
        ctx.lineWidth = 2;
        ctx.strokeRect(x0 + 5, 21, pw - 10, h - 42);
        for (let k = 1; k < 4; k++) {
          ctx.strokeStyle = "rgba(12,6,2,0.35)";
          ctx.beginPath();
          ctx.moveTo(x0 + (k * pw) / 4, 40);
          ctx.bezierCurveTo(
            x0 + (k * pw) / 4 - 8,
            h * 0.4,
            x0 + (k * pw) / 4 + 8,
            h * 0.6,
            x0 + (k * pw) / 4,
            h - 40,
          );
          ctx.stroke();
        }
      }
      B(ctx, w, h, r, 20, 0.25);
    },
  ];
  C.shingle = [
    256,
    256,
    (ctx, w, h) => {
      // dark wooden roof shingles
      const r = P.rng("shing");
      ctx.fillStyle = "#3a3430";
      ctx.fillRect(0, 0, w, h);
      for (let y = 0; y < h; y += 16)
        for (let x = -16; x < w; x += 18) {
          const c = 50 + r() * 30;
          ctx.fillStyle =
            "rgb(" +
            (c | 0) +
            "," +
            ((c * 0.92) | 0) +
            "," +
            ((c * 0.85) | 0) +
            ")";
          ctx.fillRect(x + ((y / 16) % 2) * 9, y, 17, 15);
          ctx.fillStyle = "rgba(0,0,0,0.4)";
          ctx.fillRect(x + ((y / 16) % 2) * 9, y + 13, 17, 3);
        }
      B(ctx, w, h, r, 20, 0.3);
    },
  ];

  const M = P.MAT;
  Object.assign(M, {
    ashlar: { custom: "ashlar", color: 0xc8bea8, uv: 3.2 },
    ashlar_dark: { custom: "ashlar", tint: 0x9a927e, color: 0x9a927e, uv: 3.2 },
    rustic: { custom: "rustic", color: 0xbeb49e, uv: 2.4 },
    brick_flemish: { custom: "brick_flemish", color: 0x8a4a38, uv: 2.6 },
    clapboard: { custom: "clapboard", color: 0xd8c888, uv: 1.4 },
    silk_red: { custom: "silk_red", color: 0x6e1c18, uv: 1.2 },
    silk_green: { custom: "silk_green", color: 0x2e4a34, uv: 1.2 },
    silk_gold: { custom: "silk_gold", color: 0x7a6030, uv: 1.2 },
    teak: { custom: "teak", color: 0x5a3a1c, uv: 2.2 },
    checker: { custom: "checker", color: 0x888480, uv: 2.4, rough: 0.35 },
    zuber: { custom: "zuber", color: 0xc0c8a8, uv: 6 },
    travertine: { custom: "travertine", color: 0xd0c4a8, uv: 2.4, rough: 0.6 },
    drill_floor: { custom: "drill_floor", color: 0x8a6a40, uv: 6, rough: 0.7 },
    oak_dark: { custom: "oak_dark", color: 0x3c2a18, uv: 2.6 },
    shingle: { custom: "shingle", color: 0x3a3430, uv: 2.2 },
    paint_yellow: { src: "paint_yellow", color: 0xd8b840, uv: 2 },
    paint_olive: { src: "paint_olive", color: 0x5a5a38, uv: 2 },
    paint_army: { src: "paint_army", color: 0x4a5236, uv: 2 },
    paint_navy: { src: "paint_navy", color: 0x1e2a44, uv: 2 },
    paint_orange: { src: "paint_orange", color: 0xc8662a, uv: 2 },
    paint_mint: { src: "paint_mint", color: 0x8ac8a8, uv: 2 },
    shutter_green: {
      src: "paint_green",
      tint: 0x4a6a4a,
      color: 0x2e4a34,
      uv: 1.5,
    },
    glass_sky: {
      color: 0xb8c8b8,
      emissive: 0xc8d8c0,
      ei: 0.38,
      rough: 0.2,
      plain: true,
      noShadow: true,
      uv: 2,
      opacity: 0.85,
    },
    glass_green: { src: "glass_green", color: 0x5a8a6a, uv: 2, noShadow: true },
    neon_red: {
      color: 0xff5a4a,
      emissive: 0xff3020,
      ei: 2.2,
      plain: true,
      noShadow: true,
      uv: 1,
    },
    rad_glow: {
      color: 0x40ff60,
      emissive: 0x40ff60,
      ei: 1.4,
      plain: true,
      noShadow: true,
      uv: 1,
    },
    water_rad: {
      color: 0x0c1a10,
      emissive: 0x30c040,
      ei: 0.3,
      rough: 0.05,
      metal: 0.5,
      uv: 6,
      plain: true,
      noShadow: true,
      opacity: 0.86,
    },
    water_clear: {
      color: 0x2a3a3a,
      emissive: 0x3a6a60,
      ei: 0.12,
      rough: 0.05,
      metal: 0.4,
      uv: 6,
      plain: true,
      noShadow: true,
      opacity: 0.8,
    },
    moss: { src: "grass_dead", tint: 0x6a8a4a, color: 0x4a6a34, uv: 2 },
    felt_green: { src: "fabric", tint: 0x3a6a3a, color: 0x2a4a2a, uv: 0.8 },
    canvas_tent: { src: "fabric", tint: 0xa89a78, color: 0x8a7a5a, uv: 1.5 },
    flag_red: { src: "fabric", tint: 0xb83a2a, color: 0x8a2a20, uv: 1 },
  });
