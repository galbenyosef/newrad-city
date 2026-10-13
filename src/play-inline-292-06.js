// play-inline-292 06 — rough
// Lines 1206-1545 of readable/play-inline-292.pretty.js (statement-aligned).
  Object.assign(PM.MAT_DEFS, {
    books: {
      custom: "books_warm",
      prefer: "custom",
      color: 0x6a4a3a,
      rough: 0.85,
      uv: 1.2,
      noShadow: true,
    },
    books_dark: {
      custom: "books_dark",
      prefer: "custom",
      color: 0x3a2a24,
      rough: 0.85,
      uv: 1.2,
      noShadow: true,
    },
    oak_panel: {
      custom: "oak_panel",
      prefer: "custom",
      color: 0x6a4424,
      rough: 0.6,
      uv: 1.6,
    },
    walnut_panel: {
      custom: "walnut_panel",
      prefer: "custom",
      color: 0x4a2c18,
      rough: 0.55,
      uv: 1.6,
    },
    walnut: {
      src: "wood_planks",
      color: 0x4a2c18,
      tint: 0x6a4028,
      rough: 0.55,
      uv: 2,
    },
    damask: {
      custom: "damask",
      prefer: "custom",
      color: 0x6a1210,
      rough: 0.9,
      uv: 1.4,
    },
    mosaic: {
      custom: "mosaic",
      prefer: "custom",
      color: 0xd8ccb4,
      rough: 0.5,
      uv: 10,
    },
    rose_carpet: {
      custom: "rose_carpet",
      prefer: "custom",
      color: 0x5a1a20,
      rough: 1,
      uv: 2.4,
    },
    gallery: {
      custom: "gallery_plaster",
      prefer: "custom",
      color: 0xe6e2d8,
      rough: 0.95,
      uv: 3,
    },
    oak_floor: {
      custom: "oak_floor",
      prefer: "custom",
      color: 0xa88a60,
      rough: 0.7,
      uv: 2.4,
    },
    thermolux: {
      custom: "thermolux",
      prefer: "custom",
      color: 0xd0d0c4,
      rough: 0.4,
      uv: 6.8,
      emissive: 0x302c20,
      emissiveIntensity: 0.25,
      emissiveMapCustom: true,
      noShadow: true,
    },
    moma_marble: {
      custom: "moma_marble",
      prefer: "custom",
      color: 0xe8e4da,
      rough: 0.6,
      uv: 3.2,
      bump: 0.3,
    },
    pink_marble: {
      custom: "pink_marble",
      prefer: "custom",
      color: 0xe0cfc0,
      rough: 0.6,
      uv: 3.6,
      bump: 0.4,
    },
    alg_brick: {
      custom: "alg_brick",
      prefer: "custom",
      color: 0x7e3a2a,
      rough: 0.95,
      uv: 3.2,
      bump: 0.8,
    },
    black_steel: {
      src: "metal_painted",
      color: 0x18191a,
      tint: 0x26282a,
      rough: 0.5,
      metal: 0.55,
      uv: 3,
    },
    white_steel: {
      src: "metal_painted",
      color: 0xd8d8d0,
      tint: 0xecece4,
      rough: 0.6,
      metal: 0.2,
      uv: 3,
    },
    red_steel: {
      src: "metal_painted",
      color: 0xa82a1c,
      tint: 0xc8321e,
      rough: 0.6,
      metal: 0.3,
      uv: 3,
    },
    marble_white: {
      custom: "limestone_fine",
      prefer: "custom",
      color: 0xefece4,
      tint: 0xf4f2ec,
      rough: 0.35,
      uv: 3,
    },
    marble_green: {
      color: 0x2a4a3a,
      rough: 0.3,
      metal: 0.05,
      uv: 2,
      plain: true,
    },
    gilt_dull: {
      color: 0x9a7a3a,
      rough: 0.45,
      metal: 0.65,
      uv: 2,
      plain: true,
    },
    leather_red: {
      src: "fabric",
      color: 0x5a1a14,
      tint: 0x8a2a1e,
      rough: 0.7,
      uv: 1,
    },
    leather_brown: {
      src: "fabric",
      color: 0x4a2a18,
      tint: 0x6a3e24,
      rough: 0.7,
      uv: 1,
    },
    felt_green: {
      src: "fabric",
      color: 0x1e3a24,
      tint: 0x2e5a38,
      rough: 1,
      uv: 1,
    },
    cream_plaster: {
      src: "plaster_stained",
      color: 0xd8ccb0,
      tint: 0xf0e4c8,
      rough: 0.95,
      uv: 4,
    },
    rose_plaster: {
      src: "plaster_stained",
      color: 0xb88a80,
      tint: 0xd8a098,
      rough: 0.95,
      uv: 4,
    },
    lamp_shade: {
      color: 0xf0d8a0,
      emissive: 0xffb860,
      emissiveIntensity: 1.2,
      rough: 0.8,
      uv: 1,
      plain: true,
      noShadow: true,
    },
    blue_neon: {
      color: 0x6aa0ff,
      emissive: 0x3070ff,
      emissiveIntensity: 2.4,
      rough: 0.5,
      uv: 1,
      plain: true,
      noShadow: true,
    },
    red_neon: {
      color: 0xff6050,
      emissive: 0xff2a14,
      emissiveIntensity: 2.6,
      rough: 0.5,
      uv: 1,
      plain: true,
      noShadow: true,
    },
    sky_glow: {
      color: 0x9a8a6a,
      emissive: 0xffffff,
      emissiveIntensity: 0.7,
      rough: 1,
      uv: 1,
      plain: true,
      noShadow: true,
    },
    meat: { color: 0x6a1a14, rough: 0.6, uv: 1, plain: true },
    fur_orange: {
      src: "fabric",
      color: 0xb86a2a,
      tint: 0xd88a44,
      rough: 1,
      uv: 0.5,
    },
  });

  // -------------------------------------------------------------------
  // Ceiling murals (East Room) & tapestry & caricatures & group portrait
  // -------------------------------------------------------------------
  /** Mural atlas 1024×512: 4 lunettes/spandrel figures (top row) + 4 zodiac roundels (bottom row). */
  PM.muralTex = function () {
    return PM.canvasTex(
      "pm2_mural",
      1024,
      512,
      (c) => {
        const s = 256;
        const signs = ["♈", "♋", "♎", "♑"];
        for (let i = 0; i < 8; i++) {
          const x0 = (i % 4) * s,
            y0 = Math.floor(i / 4) * s,
            r = rnd(300 + i);
          c.save();
          c.translate(x0, y0);
          const g = c.createRadialGradient(
            s / 2,
            s / 2,
            10,
            s / 2,
            s / 2,
            s * 0.7,
          );
          g.addColorStop(0, "#d8b870");
          g.addColorStop(1, "#6a4a24");
          c.fillStyle = g;
          c.fillRect(0, 0, s, s);
          if (i < 4) {
            // allegorical figure in a sky
            c.fillStyle = "#6a8ab0";
            c.beginPath();
            c.arc(s / 2, s * 0.9, s * 0.62, Math.PI, 0);
            c.fill();
            c.fillStyle = "rgba(240,230,210,0.6)";
            for (let k = 0; k < 6; k++) {
              c.beginPath();
              c.ellipse(r() * s, s * 0.45 + r() * s * 0.3, 30, 10, 0, 0, TAU);
              c.fill();
            }
            c.fillStyle = ["#8a2a1e", "#2a4a8a", "#e0c070", "#4a6a3a"][i]; // robe
            c.beginPath();
            c.moveTo(s * 0.35, s * 0.9);
            c.quadraticCurveTo(s * 0.5, s * 0.3, s * 0.68, s * 0.9);
            c.fill();
            c.fillStyle = "#e8c8a0";
            c.beginPath();
            c.arc(s * 0.52, s * 0.36, 18, 0, TAU);
            c.fill();
            c.strokeStyle = "#e8c8a0";
            c.lineWidth = 8;
            c.beginPath();
            c.moveTo(s * 0.5, s * 0.5);
            c.lineTo(s * 0.3 + i * 12, s * 0.38);
            c.stroke();
            c.fillStyle = "#e8d8a0";
            c.fillRect(s * 0.22 + i * 12, s * 0.32, 22, 16); // a book / scroll
          } else {
            c.strokeStyle = "#e8d090";
            c.lineWidth = 8;
            c.beginPath();
            c.arc(s / 2, s / 2, s * 0.4, 0, TAU);
            c.stroke();
            c.fillStyle = "#1e2e5a";
            c.beginPath();
            c.arc(s / 2, s / 2, s * 0.36, 0, TAU);
            c.fill();
            for (let k = 0; k < 14; k++) {
              c.fillStyle = "#f0e0a0";
              c.beginPath();
              c.arc(
                s / 2 + (r() - 0.5) * s * 0.6,
                s / 2 + (r() - 0.5) * s * 0.6,
                2,
                0,
                TAU,
              );
              c.fill();
            }
            c.fillStyle = "#e8d090";
            c.font = "bold 90px serif";
            c.textAlign = "center";
            c.textBaseline = "middle";
            c.fillText(signs[i - 4], s / 2, s / 2);
          }
          c.strokeStyle = "#c8a050";
          c.lineWidth = 10;
          c.strokeRect(0, 0, s, s);
          crackle(c, 0, 0, s, s, r, 40);
          grime(c, s, s, r, 0.9);
          c.restore();
        }
      },
      { clamp: true },
    );
  };
  PM.muralKey = () =>
    PM.texMat("pm2_mural", PM.muralTex(), { rough: 0.8, vc: true });
  PM.muralRect = (i) => {
    const u0 = (i % 4) / 4,
      v1 = 1 - Math.floor(i / 4) / 2;
    return [u0, v1 - 0.5, u0 + 0.25, v1];
  };
