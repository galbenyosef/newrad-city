/* src/poi_chelsea/04_mats.js */
/* =====================================================================
 * NEW RAD CITY — POI CHELSEA — 04_mats.js
 * Extra materials, custom canvas textures (ghost signs, railroad
 * heralds, marquee neon, gig posters) and small shared helpers used by
 * the three Chelsea POIs (High Line, Nabisco factory, Webster Hall).
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE || !G._pch) return;
  const PF = G._pch;
  const U = G.util;
  const TAU = Math.PI * 2;
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

  // -------------------------------------------------------------------
  // Materials
  // -------------------------------------------------------------------
  Object.assign(PF.MAT_DEFS, {
    // High Line: riveted steel painted the West Side Improvement's dark grey-green, flaking to rust
    hl_steel: {
      src: "metal_painted",
      color: 0x3c4038,
      tint: 0x5a6252,
      rough: 0.72,
      metal: 0.4,
      uv: 3,
    },
    hl_steel_dk: {
      src: "metal_painted",
      color: 0x2a2d28,
      tint: 0x3e443a,
      rough: 0.7,
      metal: 0.45,
      uv: 3,
    },
    ballast: {
      src: "gravel",
      color: 0x6a645a,
      tint: 0xa89e90,
      rough: 1,
      uv: 3,
    },
    tie_wood: {
      src: "wood_rotten",
      color: 0x3e3226,
      tint: 0x6a5846,
      rough: 1,
      uv: 2,
    },
    rail: {
      src: "metal_scratched",
      color: 0x5a4a3c,
      tint: 0x9a8272,
      rough: 0.5,
      metal: 0.7,
      uv: 2,
    },
    leaf: {
      src: "grass_dead",
      color: 0x5c5a34,
      tint: 0x8a8a52,
      rough: 1,
      uv: 2,
    },
    leaf_red: {
      src: "grass_dead",
      color: 0x6a3a24,
      tint: 0xb07048,
      rough: 1,
      uv: 2,
    },
    weeds: {
      src: "grass_dead",
      color: 0x6b6a45,
      tint: 0xa8a070,
      rough: 1,
      uv: 3,
      noShadow: true,
    },
    boxcar: {
      src: "metal_painted",
      color: 0x6a3222,
      tint: 0x9a4a34,
      rough: 0.8,
      metal: 0.3,
      uv: 3,
    },
    boxcar_yel: {
      src: "metal_painted",
      color: 0x9a7a2a,
      tint: 0xc8a048,
      rough: 0.8,
      metal: 0.25,
      uv: 3,
    },
    // Nabisco: deep red-brown factory brick
    brick_nab: {
      src: "brick_red",
      color: 0x7a3a2a,
      tint: 0xc07a62,
      rough: 0.95,
      uv: 2.6,
    },
    brick_nab_dk: {
      src: "brick_brown",
      color: 0x5a3024,
      tint: 0x9a6250,
      rough: 0.95,
      uv: 2.6,
    },
    steel_win: {
      src: "metal_painted",
      color: 0x2a2c2a,
      tint: 0x484c48,
      rough: 0.6,
      metal: 0.5,
      uv: 2,
    },
    tile_white: {
      src: "tile_subway",
      color: 0xd8d4c8,
      tint: 0xf0ece0,
      rough: 0.5,
      uv: 2,
    },
    belt: { src: "rubber", color: 0x222220, tint: 0x3a3a36, rough: 0.8, uv: 2 },
    cake: { color: 0xc89048, rough: 0.8, uv: 1, plain: true },
    cake_pink: { color: 0xe8a0b0, rough: 0.6, uv: 1, plain: true },
    cake_cream: { color: 0xf0e4c8, rough: 0.6, uv: 1, plain: true },
    carton: {
      src: "cardboard",
      color: 0xb89a6a,
      tint: 0xd8c0a0,
      rough: 0.95,
      uv: 1.5,
    },
    flour: { src: "burlap", color: 0xd8d0b8, tint: 0xf0e8d8, rough: 1, uv: 1 },
    nest: { src: "dirt", color: 0x5a4632, tint: 0x9a8064, rough: 1, uv: 4 },
    nest_dk: { src: "dirt", color: 0x3a2c20, tint: 0x6a5440, rough: 1, uv: 4 },
    resin: {
      color: 0x8a5a1a,
      emissive: 0x4a2a04,
      emissiveIntensity: 0.35,
      rough: 0.25,
      metal: 0.1,
      uv: 2,
      plain: true,
    },
    ant_egg: {
      color: 0xe8e0b0,
      emissive: 0x9ab040,
      emissiveIntensity: 0.55,
      rough: 0.35,
      uv: 1,
      plain: true,
      noShadow: true,
    },
    oven_door: {
      src: "metal_scratched",
      color: 0x5a5a56,
      tint: 0x8a8a84,
      rough: 0.45,
      metal: 0.7,
      uv: 2,
    },
    oven_glow: {
      color: 0xff8030,
      emissive: 0xff5a10,
      emissiveIntensity: 1.6,
      rough: 1,
      uv: 1,
      plain: true,
      noShadow: true,
    },
    enamel_blue: {
      src: "metal_painted",
      color: 0x3a5a7a,
      tint: 0x5a80a8,
      rough: 0.5,
      metal: 0.3,
      uv: 2,
    },
    // Webster Hall: warm red brick with pale terracotta trim, a gilded ballroom
    brick_web: {
      src: "brick_red",
      color: 0x8a3e2e,
      tint: 0xd08870,
      rough: 0.95,
      uv: 2.4,
    },
    terra: {
      custom: "terracotta",
      prefer: "custom",
      color: 0xd8cfb8,
      tint: 0xe8d8bc,
      rough: 0.7,
      uv: 3,
      bump: 0.6,
    },
    parquet: {
      src: "wood_planks",
      color: 0x6a4a2c,
      tint: 0xa87a50,
      rough: 0.55,
      uv: 1.6,
    },
    ball_wall: {
      src: "plaster_stained",
      color: 0x9a8a6a,
      tint: 0xd8c8a0,
      rough: 0.9,
      uv: 4,
    },
    ball_red: {
      src: "wallpaper",
      color: 0x6a2224,
      tint: 0xa84444,
      rough: 0.9,
      uv: 2.5,
    },
    gold_trim: {
      color: 0xb08a3a,
      rough: 0.38,
      metal: 0.75,
      uv: 2,
      plain: true,
    },
    mirror: { color: 0xd8dce0, rough: 0.12, metal: 0.95, uv: 1, plain: true },
    neon_pink: {
      color: 0xff70c0,
      emissive: 0xff2a9a,
      emissiveIntensity: 2.6,
      rough: 0.4,
      uv: 1,
      plain: true,
      noShadow: true,
    },
    neon_blue: {
      color: 0x80c8ff,
      emissive: 0x2a8aff,
      emissiveIntensity: 2.4,
      rough: 0.4,
      uv: 1,
      plain: true,
      noShadow: true,
    },
    neon_red: {
      color: 0xff6048,
      emissive: 0xff2a10,
      emissiveIntensity: 2.6,
      rough: 0.4,
      uv: 1,
      plain: true,
      noShadow: true,
    },
    bulb: {
      color: 0xfff4d8,
      emissive: 0xffe0a0,
      emissiveIntensity: 2.4,
      rough: 0.4,
      uv: 1,
      plain: true,
      noShadow: true,
    },
    stage_black: {
      src: "wood_planks",
      color: 0x1e1a18,
      tint: 0x3a3430,
      rough: 0.8,
      uv: 2,
    },
    curtain: {
      src: "fabric",
      color: 0x6a1418,
      tint: 0xa02a2a,
      rough: 1,
      uv: 1.2,
    },
    marble_bar: {
      src: "marble_dark",
      color: 0x2a3430,
      tint: 0x5a6a62,
      rough: 0.25,
      uv: 2,
    },
    felt: { src: "fabric", color: 0x1e4a2a, tint: 0x3a7a48, rough: 1, uv: 1 },
    meat: { color: 0x7a2a22, rough: 0.6, uv: 1, plain: true },
    ice: { color: 0xc8dce8, rough: 0.2, metal: 0.1, uv: 1, plain: true },
  });

  // -------------------------------------------------------------------
  // Custom canvas textures
  // -------------------------------------------------------------------
  /** Faded painted "ghost sign" on brick (transparent background, paint only). */
  PF.ghostSignTex = function (key, lines, opts) {
    opts = opts || {};
    return PF.canvasTex(
      "pch_ghost_" + key,
      opts.w || 1024,
      opts.h || 256,
      (ctx, w, h) => {
        const r = PF.rng("ghost" + key);
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = opts.bg || "rgba(40,30,22,0.55)";
        ctx.fillRect(w * 0.02, h * 0.04, w * 0.96, h * 0.92);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const fs0 = Math.floor((h * 0.78) / lines.length);
        lines.forEach((t, i) => {
          let fs = fs0 * (i === 0 ? 1 : 0.8);
          ctx.font = "bold " + fs + 'px "Arial Black", Impact, sans-serif';
          const mw = ctx.measureText(t).width;
          if (mw > w * 0.9) {
            fs = Math.floor((fs * w * 0.9) / mw);
            ctx.font = "bold " + fs + 'px "Arial Black", Impact, sans-serif';
          }
          const y = h / 2 + (i - (lines.length - 1) / 2) * fs0 * 1.02;
          ctx.fillStyle =
            (opts.colors && opts.colors[i]) ||
            opts.fg ||
            "rgba(236,226,200,0.9)";
          ctx.fillText(t, w / 2, y);
        });
        // flaking: punch holes through the paint so brick shows through
        ctx.globalCompositeOperation = "destination-out";
        for (let i = 0; i < 900; i++) {
          ctx.fillStyle = "rgba(0,0,0," + (0.3 + r() * 0.7) + ")";
          ctx.beginPath();
          ctx.ellipse(
            r() * w,
            r() * h,
            1 + r() * 9,
            1 + r() * 5,
            r() * 3,
            0,
            TAU,
          );
          ctx.fill();
        }
        for (let i = 0; i < 40; i++) {
          ctx.fillStyle = "rgba(0,0,0," + (0.2 + r() * 0.4) + ")";
          ctx.fillRect(r() * w, 0, 2 + r() * 7, h);
        }
        ctx.globalCompositeOperation = "source-over";
      },
      { clamp: true },
    );
  };
  /** Ghost-sign material key (alpha-tested decal quad). */
  PF.ghostKey = function (key, lines, opts) {
    return PF.texMat("ghost_" + key, PF.ghostSignTex(key, lines, opts), {
      transparent: true,
      rough: 0.95,
      noShadow: true,
    });
  };

  /** Rail herald for the boxcars: "NEW YORK CENTRAL SYSTEM" oval + reporting marks. */
  PF.heraldTex = function (mark, num) {
    return PF.canvasTex(
      "pch_herald_" + mark + num,
      512,
      256,
      (ctx, w, h) => {
        const r = PF.rng("herald" + mark + num);
        ctx.clearRect(0, 0, w, h);
        ctx.strokeStyle = "rgba(232,224,204,0.92)";
        ctx.fillStyle = "rgba(232,224,204,0.92)";
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.ellipse(w * 0.72, h * 0.45, w * 0.2, h * 0.3, 0, 0, TAU);
        ctx.stroke();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = 'bold 30px "Arial Black", Impact, sans-serif';
        ctx.fillText("NEW YORK", w * 0.72, h * 0.34);
        ctx.fillRect(w * 0.56, h * 0.44, w * 0.32, 5);
        ctx.font = 'bold 30px "Arial Black", Impact, sans-serif';
        ctx.fillText("CENTRAL", w * 0.72, h * 0.55);
        ctx.font = "bold 16px Arial, sans-serif";
        ctx.fillText("SYSTEM", w * 0.72, h * 0.67);
        ctx.textAlign = "left";
        ctx.font = "bold 38px Arial, sans-serif";
        ctx.fillText(mark + " " + num, w * 0.05, h * 0.3);
        ctx.font = "bold 18px Arial, sans-serif";
        ctx.fillText("CAPY 100000  LD LMT 131200", w * 0.05, h * 0.56);
        ctx.fillText("LT WT 56800   NEW 5-77", w * 0.05, h * 0.68);
        ctx.globalCompositeOperation = "destination-out";
        for (let i = 0; i < 500; i++) {
          ctx.fillStyle = "rgba(0,0,0," + (0.3 + r() * 0.7) + ")";
          ctx.beginPath();
          ctx.arc(r() * w, r() * h, 1 + r() * 6, 0, TAU);
          ctx.fill();
        }
        ctx.globalCompositeOperation = "source-over";
      },
      { clamp: true },
    );
  };

  /** Gig poster (Webster Hall shows). */
  PF.posterTex = function (key, title, sub, bg, fg) {
    return PF.canvasTex(
      "pch_poster_" + key,
      256,
      384,
      (ctx, w, h) => {
        const r = PF.rng("poster" + key);
        ctx.fillStyle = bg || "#1c2a4a";
        ctx.fillRect(0, 0, w, h);
        // sunburst
        ctx.save();
        ctx.translate(w / 2, h * 0.42);
        for (let i = 0; i < 18; i++) {
          ctx.rotate(TAU / 18);
          ctx.fillStyle =
            i % 2 ? "rgba(255,220,140,0.18)" : "rgba(255,255,255,0.05)";
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(-26, -260);
          ctx.lineTo(26, -260);
          ctx.fill();
        }
        ctx.restore();
        ctx.fillStyle = "#e8c048";
        ctx.beginPath();
        ctx.arc(w / 2, h * 0.42, 46, 0, TAU);
        ctx.fill();
        ctx.fillStyle = "#1a1a1a";
        ctx.beginPath();
        ctx.arc(w / 2, h * 0.42, 30, 0, TAU);
        ctx.fill(); // record
        ctx.fillStyle = "#c83a2a";
        ctx.beginPath();
        ctx.arc(w / 2, h * 0.42, 9, 0, TAU);
        ctx.fill();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = fg || "#f0e0b8";
        ctx.font = "bold 20px Georgia, serif";
        ctx.fillText("WEBSTER HALL", w / 2, 30);
        ctx.font = "bold 13px Georgia, serif";
        ctx.fillText("119 EAST 11th STREET", w / 2, 52);
        let fs = 34;
        ctx.font = "bold " + fs + 'px Impact, "Arial Black", sans-serif';
        const lines = title.split("|");
        lines.forEach((t, i) => {
          let f = fs;
          ctx.font = "bold " + f + "px Impact, sans-serif";
          const mw = ctx.measureText(t).width;
          if (mw > w * 0.9) {
            f = Math.floor((f * w * 0.9) / mw);
            ctx.font = "bold " + f + "px Impact, sans-serif";
          }
          ctx.fillStyle = "#ffe07a";
          ctx.fillText(t, w / 2, h * 0.68 + i * 36);
        });
        ctx.fillStyle = fg || "#f0e0b8";
        ctx.font = "bold 14px Georgia, serif";
        ctx.fillText(sub || "DANCING NIGHTLY", w / 2, h * 0.9);
        // wear
        for (let i = 0; i < 60; i++) {
          ctx.fillStyle = "rgba(40,30,20," + r() * 0.25 + ")";
          ctx.beginPath();
          ctx.ellipse(
            r() * w,
            r() * h,
            4 + r() * 30,
            3 + r() * 20,
            r() * 3,
            0,
            TAU,
          );
          ctx.fill();
        }
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(0, 0, w, 3);
        ctx.fillRect(0, h - 3, w, 3);
      },
      { clamp: true },
    );
  };

  /** Neon script lettering on transparent background (emissive, alpha-tested). */
  PF.neonTex = function (key, text, color, opts) {
    opts = opts || {};
    return PF.canvasTex(
      "pch_neon_" + key,
      opts.w || 1024,
      opts.h || 256,
      (ctx, w, h) => {
        ctx.clearRect(0, 0, w, h);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        let fs = opts.size || Math.floor(h * 0.7);
        const fam =
          opts.font || '"Futura", "Century Gothic", "Trebuchet MS", sans-serif';
        ctx.font = (opts.italic ? "italic " : "") + "bold " + fs + "px " + fam;
        const mw = ctx.measureText(text).width;
        if (mw > w * 0.94) {
          fs = Math.floor((fs * w * 0.94) / mw);
          ctx.font =
            (opts.italic ? "italic " : "") + "bold " + fs + "px " + fam;
        }
        ctx.lineJoin = "round";
        ctx.shadowColor = color;
        ctx.shadowBlur = fs * 0.25;
        ctx.strokeStyle = color;
        ctx.lineWidth = fs * 0.1;
        ctx.strokeText(text, w / 2, h / 2);
        ctx.shadowBlur = fs * 0.08;
        ctx.fillStyle = "#fff6ea";
        ctx.fillText(text, w / 2, h / 2);
      },
      { clamp: true },
    );
  };
  PF.neonKey = function (key, text, color, opts) {
    return PF.texMat("neon_" + key, PF.neonTex(key, text, color, opts), {
      transparent: true,
      emissive: 1.8,
      rough: 0.5,
      noShadow: true,
      side: THREE.DoubleSide,
    });
  };

  /** Chocolate Zeppelin carton print (for pallets of boxes): a little silver airship-shaped cake. */
  PF.cakeBoxTex = function () {
    return PF.canvasTex("pch_cakebox", 256, 256, (ctx, w, h) => {
      const r = PF.rng("cakebox");
      ctx.fillStyle = "#e4d6b4";
      ctx.fillRect(0, 0, w, h);
      // sky-blue band with the airship cake drifting across it
      ctx.fillStyle = "#2c4a78";
      ctx.fillRect(0, h * 0.06, w, h * 0.5);
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      for (const [cx, cy, rx] of [
        [w * 0.18, h * 0.16, 22],
        [w * 0.82, h * 0.13, 18],
      ]) {
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, rx * 0.4, 0, 0, TAU);
        ctx.fill();
      }
      const zx = w * 0.5,
        zy = h * 0.22;
      // tail fins
      ctx.fillStyle = "#9aa4ae";
      ctx.beginPath();
      ctx.moveTo(zx - 58, zy);
      ctx.lineTo(zx - 82, zy - 18);
      ctx.lineTo(zx - 74, zy);
      ctx.lineTo(zx - 82, zy + 18);
      ctx.closePath();
      ctx.fill();
      // silver envelope (foil-wrapped cake), with a chocolate seam
      const g = ctx.createLinearGradient(0, zy - 20, 0, zy + 20);
      g.addColorStop(0, "#f4f6f8");
      g.addColorStop(0.45, "#c2c8d0");
      g.addColorStop(1, "#7c848e");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(zx, zy, 66, 19, 0, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = "#4a2a18";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(zx - 62, zy + 2);
      ctx.lineTo(zx + 62, zy + 2);
      ctx.stroke();
      ctx.strokeStyle = "rgba(80,88,96,0.6)";
      ctx.lineWidth = 1;
      for (let k = -2; k <= 2; k++) {
        ctx.beginPath();
        ctx.ellipse(zx + k * 22, zy, 3, 18 - Math.abs(k) * 2, 0, 0, TAU);
        ctx.stroke();
      }
      // gondola
      ctx.fillStyle = "#4a2a18";
      ctx.fillRect(zx - 12, zy + 18, 24, 7);
      ctx.fillStyle = "#fff4e0";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "italic bold 30px Georgia, serif";
      ctx.fillText("Chocolate", w / 2, h * 0.38);
      ctx.font = "bold 26px Georgia, serif";
      ctx.fillText("ZEPPELIN", w / 2, h * 0.49);
      ctx.fillStyle = "#4a2a18";
      ctx.font = "italic 13px Georgia, serif";
      ctx.fillText("Lighter than air. Sweeter than pie.", w / 2, h * 0.63);
      ctx.font = "bold 15px Arial, sans-serif";
      ctx.fillText("48 CT  —  KEEP DRY", w / 2, h * 0.73);
      ctx.fillText("NATIONAL BISCUIT CO.", w / 2, h * 0.82);
      ctx.fillText("THIS SIDE UP  ▲", w / 2, h * 0.92);
      for (let i = 0; i < 60; i++) {
        ctx.fillStyle = "rgba(90,60,30," + r() * 0.22 + ")";
        ctx.beginPath();
        ctx.ellipse(
          r() * w,
          r() * h,
          3 + r() * 24,
          3 + r() * 16,
          r() * 3,
          0,
          TAU,
        );
        ctx.fill();
      }
    });
  };
  PF.cakeBoxKey = function () {
    return PF.texMat("cakebox", PF.cakeBoxTex(), { rough: 0.9 });
  };

  /** Grass/wildflower card (transparent): dense blades of dry meadow grass, goldenrod and asters. */
  PF.grassCardTex = function (variant) {
    return PF.canvasTex(
      "pch_grasscard" + (variant || 0),
      256,
      128,
      (ctx, w, h) => {
        const r = PF.rng("grass" + (variant || 0));
        ctx.clearRect(0, 0, w, h);
        const cols = [
          "#7a7a44",
          "#8a8450",
          "#6a6a3a",
          "#9a9058",
          "#5a6234",
          "#a89a60",
          "#74803e",
        ];
        for (let i = 0; i < 90; i++) {
          const x0 = r() * w,
            hh = h * (0.35 + r() * 0.62),
            bend = (r() - 0.5) * 40;
          ctx.strokeStyle = cols[(r() * cols.length) | 0];
          ctx.lineWidth = 1.5 + r() * 2.5;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(x0, h);
          ctx.quadraticCurveTo(
            x0 + bend * 0.3,
            h - hh * 0.6,
            x0 + bend,
            h - hh,
          );
          ctx.stroke();
        }
        const flowers =
          variant === 1
            ? ["#d8b030", "#e0c040"]
            : variant === 2
              ? ["#c8b8e0", "#e8e0d0"]
              : ["#c8a030"];
        for (let i = 0; i < (variant ? 16 : 6); i++) {
          const x = 10 + r() * (w - 20),
            y = h * (0.1 + r() * 0.4);
          ctx.strokeStyle = "#6a6a3a";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(x, h);
          ctx.lineTo(x + (r() - 0.5) * 8, y);
          ctx.stroke();
          ctx.fillStyle = flowers[(r() * flowers.length) | 0];
          for (let k = 0; k < 6; k++) {
            ctx.beginPath();
            ctx.arc(
              x + (r() - 0.5) * 8,
              y + (r() - 0.5) * 10,
              2 + r() * 2.5,
              0,
              TAU,
            );
            ctx.fill();
          }
        }
      },
      { clamp: true },
    );
  };
  PF.grassCardKey = function (variant) {
    return PF.texMat(
      "grasscard" + (variant || 0),
      PF.grassCardTex(variant || 0),
      { transparent: true, rough: 1, noShadow: true, side: THREE.DoubleSide },
    );
  };

  // -------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------
  /** Realise glow requests queued by the kit (PF.glows) as sprites parented to `parent` (hide with the cell). */
  PF.flushGlows = function (parent) {
    for (const g of PF.glows.splice(0))
      PF.glow(g.pos, g.color, g.size, parent || null, {
        intensity: g.intensity || 1.2,
        flicker: g.flicker || 0,
      });
  };
  /** Exterior fire barrels queued by the kit → real fire FX at initDone. */
  PF.flushFires = function () {
    const list = PF.fires.splice(0);
    PF.onInitDone.push(() => {
      if (!PF.live("fx") || typeof G.fx.fire !== "function") return;
      for (const p of list) PF.safe("fire", () => G.fx.fire(p.clone(), 0.5));
    });
  };
  /**
   * Horizontal slab with a walkable collider (floors, platforms). (x0,z0)-(x1,z1), top at y, thickness t.
   */
  PF.slab = function (b, key, x0, z0, x1, z1, y, t, opts) {
    opts = opts || {};
    t = t || 0.3;
    b.boxMM(key, x0, y - t, z0, x1, y, z1, {
      grime: opts.grime,
      segLen: opts.segLen || 6,
      c: opts.c,
    });
    if (!opts.noCollide)
      PF.colMM(x0, y - (opts.colT || Math.max(t, 0.5)), z0, x1, y, z1, {
        surface: opts.surface || "concrete",
      });
  };
  /** Steel-stringer stair with treads, handrails and step colliders (≤0.34 m rise). ry: climbing toward local +Z. */
  PF.steelStair = function (b, x, z, ry, width, run, y0, y1, opts) {
    opts = opts || {};
    const key = opts.key || "steel";
    const rise = y1 - y0,
      n = Math.max(1, Math.ceil(Math.abs(rise) / 0.3));
    const sr = run / n,
      sh = rise / n;
    const P = (lx, ly, lz) => {
      const [wx, wz] = PF.rot(x, z, ry, lx, lz);
      return V3(wx, ly, wz);
    };
    for (let i = 0; i < n; i++) {
      const top = y0 + sh * (i + 1);
      const [wx, wz] = PF.rot(x, z, ry, 0, sr * (i + 0.5));
      b.box(
        opts.tread || "diamond",
        wx,
        top - 0.06,
        wz,
        width,
        0.06,
        sr + 0.04,
        { ry, seg: false, grime: 0.4 },
      );
      PF.col(wx, wz, width, sr + 0.04, top - 0.35, top, ry, {
        surface: "metal",
      });
    }
    // stringers (sloped beams) + handrails
    for (const sg of [-1, 1]) {
      b.beam(
        key,
        P((sg * width) / 2, y0 - 0.1, 0),
        P((sg * width) / 2, y1 - 0.1, run),
        0.08,
        0.3,
        { twist: ry },
      );
      if (opts.rails !== false) {
        b.beam(
          opts.railKey || key,
          P(sg * (width / 2 + 0.02), y0 + 1.0, 0),
          P(sg * (width / 2 + 0.02), y1 + 1.0, run),
          0.05,
          0.05,
          {},
        );
        for (let k = 0; k <= n; k += 3) {
          const t = k / n;
          b.beam(
            opts.railKey || key,
            P(sg * (width / 2 + 0.02), y0 + rise * t, run * t),
            P(sg * (width / 2 + 0.02), y0 + rise * t + 1.0, run * t),
            0.04,
            0.04,
            {},
          );
        }
        const [cx, cz] = PF.rot(x, z, ry, sg * (width / 2 + 0.05), run / 2);
        PF.col(cx, cz, 0.1, run, Math.min(y0, y1), Math.max(y0, y1) + 1.0, ry, {
          walkable: false,
          surface: "metal",
        });
      }
    }
    return n;
  };
  /** Railing run between two points at y (posts + 2 rails) with optional collider. */
  PF.rail = function (b, x0, z0, x1, z1, y, opts) {
    opts = opts || {};
    const key = opts.key || "iron",
      h = opts.h || 1.05;
    b.beam(key, V3(x0, y + h, z0), V3(x1, y + h, z1), 0.06, 0.06, {
      grime: 0.3,
    });
    b.beam(key, V3(x0, y + h * 0.5, z0), V3(x1, y + h * 0.5, z1), 0.04, 0.04, {
      grime: 0.3,
    });
    const len = Math.hypot(x1 - x0, z1 - z0),
      n = Math.max(1, Math.round(len / (opts.step || 1.6)));
    for (let k = 0; k <= n; k++) {
      const t = k / n;
      b.box(key, x0 + (x1 - x0) * t, y, z0 + (z1 - z0) * t, 0.06, h, 0.06, {
        seg: false,
        grime: 0.3,
      });
    }
    if (!opts.noCollide)
      PF.colWall(x0, z0, x1, z1, 0.2, y - 0.2, y + h + 0.2, {
        walkable: false,
        surface: "metal",
      });
  };
  /** Ceiling light bulb in a cage + baked light record + glow. Returns the light record for setLights. */
  PF.cageLamp = function (b, x, y, z, color, parent) {
    b.cyl("iron", x, y + 0.2, z, 0.02, 0.02, 0.6, 4, { hSeg: 1 });
    b.cyl("iron", x, y, z, 0.18, 0.12, 0.2, 8, { hSeg: 1, open: true });
    b.sphere("bulb", x, y - 0.05, z, 0.08, {
      ws: 6,
      hs: 4,
      noAO: true,
      grime: 0,
    });
    PF.glow(V3(x, y - 0.1, z), color || 0xffd8a0, 1.3, parent, {
      intensity: 1.1,
    });
  };
  /** Readable sign interactable + register. */
  /** extra: optional fields merged into the def, e.g. {learn: 'lock_id'} (reading it teaches that code / passcode). */
  PF.note = function (id, name, title, text, extra) {
    return PF.item(
      Object.assign(
        { id, type: "note", name, title, text, weight: 0, value: 0 },
        extra || {},
      ),
    );
  };
  PF.tapeReel = function (id, name, title, text, extra) {
    return PF.item(
      Object.assign(
        { id, type: "tape", name, title, text, weight: 0, value: 0 },
        extra || {},
      ),
    );
  };
})();
