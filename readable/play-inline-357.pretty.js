/* src/poi_wallst/04_mats.js */
/* =====================================================================
 * NEW RAD CITY — POI WALL STREET — 04_mats.js
 * Extra materials, canvas textures (headstones, clock dials, the Marsh
 * harbour murals, L'Enfant's "Glory", the Great Seal, safe-deposit box
 * walls, bank & raider signs) and shared helpers for the four Wall Street
 * POIs: St. Paul's Chapel, the Singer Building, 40 Wall Street and the
 * Alexander Hamilton U.S. Custom House.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE || !G._pws) return;
  const PF = G._pws;
  const TAU = Math.PI * 2,
    PI = Math.PI,
    HP = PI / 2;
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

  // -------------------------------------------------------------------
  // Materials
  // -------------------------------------------------------------------
  Object.assign(PF.MAT_DEFS, {
    // St. Paul's: Manhattan schist rubble walls with brownstone quoins, white-painted timber steeple
    schist_sp: {
      custom: "schist_sq",
      prefer: "custom",
      color: 0x5e5a50,
      tint: 0xc4bcae,
      rough: 0.95,
      uv: 3.4,
      bump: 1.0,
    }, // squared, coursed dark schist rubble (05_extras)
    brown_sp: {
      src: "stone_brownstone",
      custom: "sandstone",
      color: 0x7e5642,
      tint: 0xd8a080,
      rough: 0.95,
      uv: 3,
    },
    timber_white: {
      src: "wood_planks",
      color: 0xc8c2b2,
      tint: 0xe6e0d0,
      rough: 0.8,
      uv: 2.2,
    },
    slate_roof: {
      src: "granite",
      color: 0x3a3c40,
      tint: 0x5a5e64,
      rough: 0.8,
      uv: 1.6,
    },
    sp_plaster: {
      custom: "stucco",
      prefer: "custom",
      color: 0xd8c4bc,
      tint: 0xe8cfc6,
      rough: 0.9,
      uv: 5,
    }, // the chapel's pale pink walls
    sp_white: {
      custom: "stucco",
      prefer: "custom",
      color: 0xe8e2d4,
      tint: 0xfaf6ee,
      rough: 0.75,
      uv: 4,
    },
    box_pew: {
      custom: "stucco",
      prefer: "custom",
      color: 0xe0dace,
      tint: 0xf0ebe0,
      rough: 0.7,
      uv: 2,
    },
    marble_soft: {
      custom: "limestone_fine",
      prefer: "custom",
      color: 0xd8d4cc,
      tint: 0xefeae2,
      rough: 0.35,
      uv: 3,
    },
    // Singer: dark red pressed brick, pale limestone, the mansard dome (red-brown copper + gilt)
    brick_singer: {
      src: "brick_red",
      color: 0x7a3024,
      tint: 0xc0624c,
      rough: 0.95,
      uv: 2.4,
    },
    lime_ws: {
      custom: "limestone_fine",
      prefer: "custom",
      color: 0xcfc4a8,
      tint: 0xe2d8c0,
      rough: 0.9,
      uv: 3.2,
    },
    dome_red: {
      src: "metal_painted",
      color: 0x8a2a1a,
      tint: 0xd8583a,
      rough: 0.55,
      metal: 0.25,
      uv: 2.5,
    },
    gold_leaf: {
      color: 0xb8913c,
      emissive: 0x3a2604,
      emissiveIntensity: 0.2,
      rough: 0.58,
      metal: 0.45,
      uv: 2,
      plain: true,
    }, // matte, weathered gilt (no sun hotspots)
    iron_green: {
      src: "metal_painted",
      color: 0x44604f,
      tint: 0x6e8e7a,
      rough: 0.7,
      metal: 0.35,
      uv: 2,
    }, // weathered verdigris cast iron
    // 40 Wall: Indiana limestone base, buff brick shaft, the green copper pyramid
    buff_brick: {
      src: "brick_tan",
      color: 0xb09a74,
      tint: 0xd8c4a0,
      rough: 0.95,
      uv: 2.4,
    },
    copper_ws: {
      color: 0x5f9884,
      rough: 0.8,
      metal: 0.2,
      uv: 3,
      custom: "verdigris",
      tint: 0x94b8a8,
    },
    copper_dull: {
      color: 0x4f7a6a,
      rough: 0.85,
      metal: 0.15,
      uv: 3,
      custom: "verdigris",
      tint: 0x6a8a7c,
    },
    bronze_door: {
      src: "metal_scratched",
      color: 0x4a3a24,
      tint: 0x8a6a40,
      rough: 0.45,
      metal: 0.75,
      uv: 2,
    },
    // Custom House: grey Maine granite, marble halls
    granite_ch: {
      custom: "granite_ashlar",
      prefer: "custom",
      color: 0x9a968e,
      tint: 0xc8c4bc,
      rough: 0.9,
      uv: 3.0,
      bump: 0.8,
    },
    marble_ws: {
      src: "marble",
      color: 0xd9d4c8,
      tint: 0xf0ece4,
      rough: 0.35,
      uv: 3,
      custom: "limestone_fine",
    },
    marble_vein: {
      custom: "marble_floor",
      prefer: "custom",
      color: 0xd0cabe,
      rough: 0.3,
      uv: 3,
    },
    statue_stone: {
      custom: "stucco",
      prefer: "custom",
      color: 0xc4bcaa,
      tint: 0xe4dccc,
      rough: 0.8,
      uv: 1.6,
    }, // smooth carved stone (no ashlar joints)
    // shared interior materials
    oak_ws: {
      src: "wood_planks",
      color: 0x6a4e30,
      tint: 0x9a7a54,
      rough: 0.65,
      uv: 2,
    },
    mahog_ws: {
      src: "wood_planks",
      color: 0x4a2a1a,
      tint: 0x7a4a34,
      rough: 0.55,
      uv: 2,
    },
    brass_ws: { color: 0x9a7a3a, rough: 0.35, metal: 0.8, uv: 2, plain: true },
    crystal: {
      color: 0xe8f0f4,
      emissive: 0xfff0d8,
      emissiveIntensity: 0.55,
      rough: 0.1,
      metal: 0.2,
      uv: 1,
      plain: true,
      noShadow: true,
    },
    lamp_ws: {
      color: 0xffe0a0,
      emissive: 0xffc070,
      emissiveIntensity: 2.0,
      rough: 0.5,
      uv: 1,
      plain: true,
      noShadow: true,
    },
    daylight: {
      color: 0xd8dccc,
      emissive: 0xc8d0b8,
      emissiveIntensity: 0.95,
      rough: 0.6,
      uv: 1,
      plain: true,
      noShadow: true,
    },
    daylight_dim: {
      color: 0x9aa090,
      emissive: 0x8a9480,
      emissiveIntensity: 0.6,
      rough: 0.6,
      uv: 1,
      plain: true,
      noShadow: true,
    },
    vault_ws: {
      src: "metal_scratched",
      color: 0x8a8e90,
      tint: 0xb8bcbe,
      rough: 0.35,
      metal: 0.8,
      uv: 3,
    },
    vault_dk: {
      src: "metal_panel",
      color: 0x3a3e40,
      tint: 0x5a5e62,
      rough: 0.5,
      metal: 0.6,
      uv: 3,
    },
    carpet_red: {
      src: "carpet",
      color: 0x6a2424,
      tint: 0x9a3a34,
      rough: 1,
      uv: 3,
    },
    carpet_green: {
      src: "carpet",
      color: 0x2a4a34,
      tint: 0x3e6a4a,
      rough: 1,
      uv: 3,
    },
    linen_ws: {
      src: "fabric",
      color: 0xb8b0a0,
      tint: 0xe8e0d0,
      rough: 1,
      uv: 1.5,
    },
    canvas_ws: {
      src: "fabric",
      color: 0xb8a882,
      tint: 0xd8c8a0,
      rough: 1,
      uv: 2,
    },
    hay: {
      src: "grass_dead",
      color: 0xa89a5a,
      tint: 0xd8c880,
      rough: 1,
      uv: 1.5,
    },
    black_enamel: {
      color: 0x141414,
      rough: 0.3,
      metal: 0.4,
      uv: 1,
      plain: true,
    },
    dressform: {
      src: "fabric",
      color: 0x8a7a64,
      tint: 0xc8b8a0,
      rough: 1,
      uv: 0.8,
    },
    gore: { color: 0x4a100c, rough: 0.4, uv: 1, plain: true },
    candle_ws: { color: 0xf0e8d0, rough: 0.8, uv: 1, plain: true },
    flame_ws: {
      color: 0xffc060,
      emissive: 0xffa030,
      emissiveIntensity: 3.0,
      rough: 1,
      uv: 1,
      plain: true,
      noShadow: true,
    },
    bulb_ws: {
      color: 0xfff4d8,
      emissive: 0xffe0a0,
      emissiveIntensity: 2.4,
      rough: 0.4,
      uv: 1,
      plain: true,
      noShadow: true,
    },
    red_alarm: {
      color: 0xff4030,
      emissive: 0xff2010,
      emissiveIntensity: 2.2,
      rough: 0.5,
      uv: 1,
      plain: true,
      noShadow: true,
    },
    tar_ws: { src: "roof_tar", color: 0x2a2a28, rough: 0.95, uv: 5 },
    paving: {
      src: "sidewalk",
      color: 0x8a8680,
      tint: 0xb0aca4,
      rough: 0.95,
      uv: 3,
    },
    flagstone: {
      src: "granite",
      color: 0x77736a,
      tint: 0x9a968c,
      rough: 0.95,
      uv: 2.2,
    },
  });

  // -------------------------------------------------------------------
  // Canvas textures
  // -------------------------------------------------------------------
  const U = G.util;
  /** Colonial slate headstone: tympanum with a winged death's head, lettering, weathering. */
  PF.headstoneTex = function (v) {
    return PF.canvasTex(
      "pws_headstone" + v,
      128,
      192,
      (ctx, w, h) => {
        const r = PF.rng("hs" + v);
        const base = ["#4a4c50", "#56524c", "#6a5a4c", "#3e4246"][v % 4];
        ctx.fillStyle = base;
        ctx.fillRect(0, 0, w, h);
        for (let i = 0; i < 260; i++) {
          ctx.fillStyle =
            "rgba(" +
            (r() < 0.5 ? "255,255,255" : "0,0,0") +
            "," +
            (0.03 + r() * 0.06) +
            ")";
          ctx.fillRect(r() * w, r() * h, 2 + r() * 8, 1 + r() * 4);
        }
        // border + tympanum arch line
        ctx.strokeStyle = "rgba(20,20,20,0.55)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(8, h - 6);
        ctx.lineTo(8, 52);
        ctx.arc(w / 2, 52, w / 2 - 8, PI, 0);
        ctx.lineTo(w - 8, h - 6);
        ctx.stroke();
        // winged death's head (or a cherub / urn on some)
        const cx = w / 2,
          cy = 34;
        ctx.fillStyle = "rgba(20,20,20,0.6)";
        if (v % 3 !== 2) {
          ctx.beginPath();
          ctx.ellipse(cx, cy, 10, 12, 0, 0, TAU);
          ctx.fill();
          ctx.fillStyle = base;
          ctx.beginPath();
          ctx.arc(cx - 4, cy - 2, 3, 0, TAU);
          ctx.arc(cx + 4, cy - 2, 3, 0, TAU);
          ctx.fill();
          ctx.fillStyle = "rgba(20,20,20,0.6)";
          for (const s of [-1, 1])
            for (let k = 0; k < 5; k++) {
              ctx.beginPath();
              ctx.ellipse(
                cx + s * (16 + k * 6),
                cy - 2 + k * 1.5,
                6,
                2.2,
                s * (0.3 + k * 0.08),
                0,
                TAU,
              );
              ctx.fill();
            }
        } else {
          ctx.beginPath();
          ctx.moveTo(cx - 9, cy + 12);
          ctx.quadraticCurveTo(cx - 14, cy - 6, cx, cy - 12);
          ctx.quadraticCurveTo(cx + 14, cy - 6, cx + 9, cy + 12);
          ctx.fill();
          ctx.fillRect(cx - 12, cy + 12, 24, 3);
        }
        // lettering lines (illegible, weathered)
        ctx.fillStyle = "rgba(15,15,15,0.55)";
        ctx.textAlign = "center";
        ctx.font = "bold 10px Georgia, serif";
        ctx.fillText("HERE LIES", cx, 66);
        const names = [
          "IOHN VAN ZANDT",
          "MARY LIVINGSTON",
          "CAPT. W. BOGART",
          "ABRAHAM DE PEYSTER",
          "SARAH TEMPLETON",
          "THOS. MOORE",
          "CATHARINE DUYCKINCK",
          "JACOB LEISLER",
        ];
        ctx.font = "bold 9px Georgia, serif";
        ctx.fillText(names[v % names.length], cx, 82);
        ctx.font = "8px Georgia, serif";
        ctx.fillText("who departed this life", cx, 96);
        ctx.fillText("Anno " + (1760 + ((v * 7) % 40)), cx, 108);
        for (let y = 122; y < h - 20; y += 10) {
          ctx.fillRect(18 + r() * 8, y, w - 40 - r() * 20, 1.4);
        }
        // lichen & loss
        for (let i = 0; i < 30; i++) {
          ctx.fillStyle =
            "rgba(" +
            ((120 + r() * 60) | 0) +
            "," +
            ((130 + r() * 50) | 0) +
            ",90," +
            (0.1 + r() * 0.25) +
            ")";
          ctx.beginPath();
          ctx.arc(r() * w, h * 0.5 + r() * h * 0.5, 2 + r() * 7, 0, TAU);
          ctx.fill();
        }
      },
      { clamp: true },
    );
  };
  PF.headstoneKey = function (v) {
    return PF.texMat("headstone" + (v % 4), PF.headstoneTex(v % 4), {
      rough: 0.9,
    });
  };

  /** Clock dial (white or gilt numerals on black), hands frozen at 9:47. */
  PF.clockTex = function (dark) {
    return PF.canvasTex(
      "pws_clock" + (dark ? "d" : "w"),
      256,
      256,
      (ctx, w, h) => {
        const cx = w / 2,
          cy = h / 2,
          R = w / 2 - 6;
        ctx.fillStyle = dark ? "#1a1c1e" : "#e8e2d0";
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, TAU);
        ctx.fill();
        ctx.strokeStyle = dark ? "#c8a050" : "#2a2a2a";
        ctx.lineWidth = 6;
        ctx.stroke();
        ctx.fillStyle = dark ? "#d8b060" : "#222";
        ctx.font = "bold 26px Georgia, serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const N = [
          "XII",
          "I",
          "II",
          "III",
          "IIII",
          "V",
          "VI",
          "VII",
          "VIII",
          "IX",
          "X",
          "XI",
        ];
        for (let i = 0; i < 12; i++) {
          const a = (i / 12) * TAU - HP;
          ctx.save();
          ctx.translate(
            cx + Math.cos(a) * R * 0.78,
            cy + Math.sin(a) * R * 0.78,
          );
          ctx.rotate(a + HP);
          ctx.fillText(N[i], 0, 0);
          ctx.restore();
        }
        for (let i = 0; i < 60; i++) {
          const a = (i / 60) * TAU;
          ctx.fillRect(
            cx + Math.cos(a) * R * 0.93 - 1.5,
            cy + Math.sin(a) * R * 0.93 - 1.5,
            3,
            3,
          );
        }
        const hand = (a, len, wd) => {
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(a);
          ctx.fillRect(-wd / 2, -len, wd, len + 10);
          ctx.restore();
        };
        hand(((9 + 47 / 60) / 12) * TAU, R * 0.5, 9);
        hand((47 / 60) * TAU, R * 0.74, 5);
        const g = ctx.createRadialGradient(cx, cy, R * 0.2, cx, cy, R);
        g.addColorStop(0, "rgba(0,0,0,0)");
        g.addColorStop(1, "rgba(40,30,10,0.35)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, TAU);
        ctx.fill();
      },
      { clamp: true },
    );
  };
  PF.clockKey = function (dark) {
    return PF.texMat("clock" + (dark ? "d" : "w"), PF.clockTex(dark), {
      rough: 0.6,
      emissive: dark ? 0.15 : 0.08,
    });
  };

  /**
   * Reginald Marsh-style harbour mural (original composition): sepia-ochre fresco of ocean liners,
   * tugs and a lighthouse under a cloudy sky, in a painted frame. variant 0..7.
   */
  PF.muralTex = function () {
    return PF.canvasTex("pws_murals", 1024, 512, (ctx, W, H) => {
      const cw = W / 4,
        ch = H / 2;
      for (let v = 0; v < 8; v++) {
        const r = PF.rng("mural" + v);
        const x0 = (v % 4) * cw,
          y0 = Math.floor(v / 4) * ch;
        ctx.save();
        ctx.beginPath();
        ctx.rect(x0, y0, cw, ch);
        ctx.clip();
        const sky = ctx.createLinearGradient(0, y0, 0, y0 + ch);
        sky.addColorStop(0, "#c8b894");
        sky.addColorStop(0.55, "#e0d0a8");
        sky.addColorStop(0.56, "#6a7068");
        sky.addColorStop(1, "#4a5048");
        ctx.fillStyle = sky;
        ctx.fillRect(x0, y0, cw, ch);
        // clouds
        for (let k = 0; k < 7; k++) {
          ctx.fillStyle = "rgba(245,235,210," + (0.35 + r() * 0.3) + ")";
          ctx.beginPath();
          ctx.ellipse(
            x0 + r() * cw,
            y0 + ch * (0.1 + r() * 0.3),
            20 + r() * 40,
            8 + r() * 12,
            0,
            0,
            TAU,
          );
          ctx.fill();
        }
        // waves
        ctx.strokeStyle = "rgba(220,210,180,0.35)";
        ctx.lineWidth = 1.5;
        for (let y = y0 + ch * 0.6; y < y0 + ch; y += 6) {
          ctx.beginPath();
          for (let x = x0; x < x0 + cw; x += 8)
            ctx.lineTo(x, y + Math.sin(x * 0.15 + y) * 1.5);
          ctx.stroke();
        }
        const horizon = y0 + ch * 0.56;
        if (v % 3 === 0) {
          // ocean liner: black hull, white superstructure, three raked funnels trailing smoke
          const hx = x0 + cw * (0.15 + r() * 0.2),
            hw = cw * 0.62,
            hy = horizon + 10;
          ctx.fillStyle = "#1e1e1e";
          ctx.beginPath();
          ctx.moveTo(hx, hy);
          ctx.lineTo(hx + hw, hy - 4);
          ctx.lineTo(hx + hw - 14, hy + 22);
          ctx.lineTo(hx + 10, hy + 22);
          ctx.fill();
          ctx.fillStyle = "#e8e0cc";
          ctx.fillRect(hx + hw * 0.18, hy - 14, hw * 0.6, 14);
          ctx.fillRect(hx + hw * 0.3, hy - 22, hw * 0.34, 8);
          for (let k = 0; k < 3; k++) {
            const fx = hx + hw * (0.28 + k * 0.14);
            ctx.fillStyle = "#8a3020";
            ctx.fillRect(fx, hy - 40, 12, 26);
            ctx.fillStyle = "#111";
            ctx.fillRect(fx, hy - 40, 12, 6);
            ctx.fillStyle = "rgba(70,64,56,0.5)";
            for (let s = 0; s < 5; s++) {
              ctx.beginPath();
              ctx.arc(fx + 6 - s * 14, hy - 48 - s * 5, 7 + s * 3, 0, TAU);
              ctx.fill();
            }
          }
          ctx.fillStyle = "#c8c0a8";
          for (let k = 0; k < 14; k++)
            ctx.fillRect(hx + 16 + (k * hw) / 16, hy + 4, 3, 3);
        } else if (v % 3 === 1) {
          // tugboat pushing, a harbour lighthouse on a rock
          const tx = x0 + cw * 0.2,
            ty = horizon + 26;
          ctx.fillStyle = "#2a2420";
          ctx.beginPath();
          ctx.ellipse(tx + 40, ty, 44, 12, 0, 0, PI);
          ctx.fill();
          ctx.fillStyle = "#b8a888";
          ctx.fillRect(tx + 22, ty - 20, 34, 20);
          ctx.fillStyle = "#6a2a1a";
          ctx.fillRect(tx + 34, ty - 38, 10, 18);
          ctx.fillStyle = "rgba(90,80,70,0.45)";
          for (let s = 0; s < 4; s++) {
            ctx.beginPath();
            ctx.arc(tx + 39 + s * 12, ty - 46 - s * 8, 6 + s * 3, 0, TAU);
            ctx.fill();
          }
          const lx = x0 + cw * 0.78;
          ctx.fillStyle = "#5a5046";
          ctx.beginPath();
          ctx.ellipse(lx, horizon + 16, 34, 10, 0, PI, TAU);
          ctx.fill();
          ctx.fillStyle = "#e0d8c0";
          ctx.beginPath();
          ctx.moveTo(lx - 8, horizon + 8);
          ctx.lineTo(lx - 5, horizon - 60);
          ctx.lineTo(lx + 5, horizon - 60);
          ctx.lineTo(lx + 8, horizon + 8);
          ctx.fill();
          ctx.fillStyle = "#8a2a1a";
          ctx.fillRect(lx - 7, horizon - 70, 14, 10);
          ctx.fillStyle = "#ffe890";
          ctx.fillRect(lx - 4, horizon - 68, 8, 6);
        } else {
          // square-rigged clipper under sail
          const sx = x0 + cw * 0.5,
            sy = horizon + 18;
          ctx.fillStyle = "#2a2018";
          ctx.beginPath();
          ctx.moveTo(sx - 60, sy);
          ctx.lineTo(sx + 66, sy - 4);
          ctx.lineTo(sx + 50, sy + 14);
          ctx.lineTo(sx - 50, sy + 14);
          ctx.fill();
          ctx.strokeStyle = "#2a2018";
          ctx.lineWidth = 2;
          for (const mx of [-34, 0, 34]) {
            ctx.beginPath();
            ctx.moveTo(sx + mx, sy);
            ctx.lineTo(sx + mx, sy - 110);
            ctx.stroke();
            for (let k = 0; k < 4; k++) {
              ctx.fillStyle = "rgba(240,230,205,0.92)";
              const sw = 30 - k * 5;
              ctx.beginPath();
              ctx.moveTo(sx + mx - sw, sy - 22 - k * 24);
              ctx.quadraticCurveTo(
                sx + mx,
                sy - 10 - k * 24,
                sx + mx + sw,
                sy - 22 - k * 24,
              );
              ctx.lineTo(sx + mx + sw - 3, sy - 42 - k * 24);
              ctx.lineTo(sx + mx - sw + 3, sy - 42 - k * 24);
              ctx.fill();
            }
          }
          ctx.beginPath();
          ctx.moveTo(sx + 66, sy - 4);
          ctx.lineTo(sx + 110, sy - 30);
          ctx.stroke();
        }
        // gulls
        ctx.strokeStyle = "rgba(40,36,30,0.7)";
        ctx.lineWidth = 1.5;
        for (let k = 0; k < 4; k++) {
          const gx = x0 + r() * cw,
            gy = y0 + 20 + r() * ch * 0.3;
          ctx.beginPath();
          ctx.moveTo(gx - 6, gy);
          ctx.quadraticCurveTo(gx - 3, gy - 4, gx, gy);
          ctx.quadraticCurveTo(gx + 3, gy - 4, gx + 6, gy);
          ctx.stroke();
        }
        // fresco grime, water stains, flaking
        for (let k = 0; k < 40; k++) {
          ctx.fillStyle = "rgba(60,44,24," + (0.05 + r() * 0.15) + ")";
          ctx.beginPath();
          ctx.ellipse(
            x0 + r() * cw,
            y0 + r() * ch,
            6 + r() * 30,
            10 + r() * 50,
            0,
            0,
            TAU,
          );
          ctx.fill();
        }
        for (let k = 0; k < 10; k++) {
          ctx.fillStyle = "rgba(210,200,180,0.8)";
          ctx.fillRect(x0 + r() * cw, y0 + r() * ch, 3 + r() * 12, 2 + r() * 8);
        }
        // painted frame
        ctx.strokeStyle = "#6a5230";
        ctx.lineWidth = 10;
        ctx.strokeRect(x0 + 5, y0 + 5, cw - 10, ch - 10);
        ctx.strokeStyle = "#c8a860";
        ctx.lineWidth = 2;
        ctx.strokeRect(x0 + 11, y0 + 11, cw - 22, ch - 22);
        ctx.restore();
      }
    });
  };
  PF.muralKey = function () {
    return PF.texMat("murals", PF.muralTex(), { rough: 0.85 });
  };
  PF.muralRect = function (v) {
    const u0 = (v % 4) / 4,
      v0 = Math.floor(v / 4) === 0 ? 0.5 : 0;
    return [u0, v0, u0 + 0.25, v0 + 0.5];
  };

  /** L'Enfant's "Glory": gilded sunburst with clouds, Mount Sinai and the tablets of the law (original drawing). */
  PF.gloryTex = function () {
    return PF.canvasTex(
      "pws_glory",
      512,
      512,
      (ctx, w, h) => {
        const r = PF.rng("glory");
        ctx.clearRect(0, 0, w, h);
        const cx = w / 2,
          cy = h * 0.46;
        for (let i = 0; i < 64; i++) {
          const a = (i / 64) * TAU,
            len = (i % 2 ? 0.46 : 0.36) * w + r() * 12;
          ctx.fillStyle = i % 2 ? "#d8aa48" : "#b88a30";
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(
            cx + Math.cos(a - 0.03) * len,
            cy + Math.sin(a - 0.03) * len,
          );
          ctx.lineTo(
            cx + Math.cos(a + 0.03) * len,
            cy + Math.sin(a + 0.03) * len,
          );
          ctx.fill();
        }
        // clouds
        for (let i = 0; i < 26; i++) {
          const a = r() * TAU,
            d = w * (0.12 + r() * 0.14);
          ctx.fillStyle =
            "rgba(" +
            ((225 + r() * 20) | 0) +
            "," +
            ((215 + r() * 20) | 0) +
            "," +
            ((190 + r() * 20) | 0) +
            ",0.95)";
          ctx.beginPath();
          ctx.arc(
            cx + Math.cos(a) * d,
            cy + Math.sin(a) * d * 0.8 + 30,
            18 + r() * 22,
            0,
            TAU,
          );
          ctx.fill();
        }
        // mountain + tablets
        ctx.fillStyle = "#6a5a44";
        ctx.beginPath();
        ctx.moveTo(cx - 90, cy + 110);
        ctx.lineTo(cx - 10, cy - 10);
        ctx.lineTo(cx + 20, cy + 20);
        ctx.lineTo(cx + 90, cy + 110);
        ctx.fill();
        ctx.fillStyle = "#e8e0c8";
        for (const s of [-1, 1]) {
          ctx.beginPath();
          ctx.moveTo(cx + s * 4, cy - 60);
          ctx.lineTo(cx + s * 4, cy + 10);
          ctx.lineTo(cx + s * 40, cy + 10);
          ctx.lineTo(cx + s * 40, cy - 48);
          ctx.quadraticCurveTo(cx + s * 22, cy - 76, cx + s * 4, cy - 60);
          ctx.fill();
        }
        ctx.fillStyle = "#3a2a18";
        ctx.font = "bold 11px Georgia, serif";
        ctx.textAlign = "center";
        const numerals = [
          "I",
          "II",
          "III",
          "IV",
          "V",
          "VI",
          "VII",
          "VIII",
          "IX",
          "X",
        ];
        for (let k = 0; k < 5; k++) {
          ctx.fillText(numerals[k], cx - 22, cy - 44 + k * 11);
          ctx.fillText(numerals[k + 5], cx + 22, cy - 44 + k * 11);
        }
        // Hebrew-like cartouche → a gilt triangle with an eye-less glow (kept abstract)
        const g = ctx.createRadialGradient(cx, cy - 110, 2, cx, cy - 110, 40);
        g.addColorStop(0, "rgba(255,240,180,1)");
        g.addColorStop(1, "rgba(255,220,120,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, cy - 110, 40, 0, TAU);
        ctx.fill();
        // age: dust in the gilding
        for (let i = 0; i < 90; i++) {
          ctx.fillStyle = "rgba(40,30,10," + (0.05 + r() * 0.15) + ")";
          ctx.beginPath();
          ctx.arc(r() * w, r() * h, 2 + r() * 10, 0, TAU);
          ctx.fill();
        }
      },
      { clamp: true },
    );
  };
  PF.gloryKey = function () {
    return PF.texMat("glory", PF.gloryTex(), {
      transparent: true,
      rough: 0.35,
      metal: 0.4,
      emissive: 0.25,
      side: THREE.DoubleSide,
    });
  };

  /** Painted oval of the arms of the United States (eagle, shield, olive branch, arrows) — original drawing. */
  PF.sealTex = function (faded) {
    return PF.canvasTex(
      "pws_seal" + (faded ? "f" : ""),
      256,
      256,
      (ctx, w, h) => {
        const r = PF.rng("seal");
        const cx = w / 2,
          cy = h / 2;
        ctx.fillStyle = "#16233a";
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = "#e6dcc0";
        ctx.beginPath();
        ctx.ellipse(cx, cy, w * 0.44, h * 0.44, 0, 0, TAU);
        ctx.fill();
        ctx.strokeStyle = "#b88a30";
        ctx.lineWidth = 8;
        ctx.stroke();
        // eagle wings
        ctx.fillStyle = "#6a4a2a";
        for (const s of [-1, 1]) {
          ctx.beginPath();
          ctx.moveTo(cx, cy - 10);
          ctx.quadraticCurveTo(cx + s * 70, cy - 70, cx + s * 96, cy - 20);
          ctx.quadraticCurveTo(cx + s * 70, cy - 10, cx + s * 40, cy + 20);
          ctx.fill();
          for (let k = 0; k < 6; k++) {
            ctx.beginPath();
            ctx.moveTo(cx + s * (40 + k * 9), cy + 10 - k * 4);
            ctx.lineTo(cx + s * (48 + k * 9), cy + 30 - k * 5);
            ctx.lineTo(cx + s * (52 + k * 9), cy + 6 - k * 5);
            ctx.fill();
          }
        }
        // head
        ctx.fillStyle = "#f0ece0";
        ctx.beginPath();
        ctx.arc(cx, cy - 44, 14, 0, TAU);
        ctx.fill();
        ctx.fillStyle = "#d8a020";
        ctx.beginPath();
        ctx.moveTo(cx + 10, cy - 46);
        ctx.lineTo(cx + 22, cy - 42);
        ctx.lineTo(cx + 10, cy - 38);
        ctx.fill();
        // shield: stripes + blue chief
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(cx - 26, cy - 28);
        ctx.lineTo(cx + 26, cy - 28);
        ctx.lineTo(cx + 26, cy + 10);
        ctx.quadraticCurveTo(cx, cy + 44, cx - 26, cy + 10);
        ctx.closePath();
        ctx.clip();
        for (let k = 0; k < 13; k++) {
          ctx.fillStyle = k % 2 ? "#e8e0cc" : "#a02820";
          ctx.fillRect(cx - 26 + k * 4, cy - 28, 4, 80);
        }
        ctx.fillStyle = "#1e3a78";
        ctx.fillRect(cx - 26, cy - 28, 52, 14);
        ctx.restore();
        // olive branch & arrows
        ctx.strokeStyle = "#3a5a24";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx - 20, cy + 34);
        ctx.quadraticCurveTo(cx - 50, cy + 40, cx - 64, cy + 30);
        ctx.stroke();
        ctx.fillStyle = "#4a7a30";
        for (let k = 0; k < 6; k++) {
          ctx.beginPath();
          ctx.ellipse(
            cx - 28 - k * 7,
            cy + 36 - (k % 2) * 6,
            4,
            2,
            0.5,
            0,
            TAU,
          );
          ctx.fill();
        }
        ctx.strokeStyle = "#5a4020";
        ctx.lineWidth = 2;
        for (let k = 0; k < 3; k++) {
          ctx.beginPath();
          ctx.moveTo(cx + 20, cy + 34);
          ctx.lineTo(cx + 60, cy + 20 + k * 8);
          ctx.stroke();
        }
        // stars in a glory over the head
        ctx.fillStyle = "#d8b050";
        for (let k = 0; k < 13; k++) {
          const a = -HP + (k - 6) * 0.2;
          PF.drawStar(
            ctx,
            cx + Math.cos(a) * 64,
            cy - 30 + Math.sin(a) * 44,
            5,
          );
        }
        ctx.fillStyle = "#3a2a18";
        ctx.font = "bold 13px Georgia, serif";
        ctx.textAlign = "center";
        ctx.fillText("E PLURIBUS UNUM", cx, cy + 78);
        if (faded)
          for (let i = 0; i < 70; i++) {
            ctx.fillStyle = "rgba(60,44,24," + (0.05 + r() * 0.2) + ")";
            ctx.beginPath();
            ctx.arc(r() * w, r() * h, 3 + r() * 14, 0, TAU);
            ctx.fill();
          }
      },
      { clamp: true },
    );
  };
  PF.sealKey = function (faded) {
    return PF.texMat("seal" + (faded ? "f" : ""), PF.sealTex(faded), {
      rough: 0.6,
      emissive: 0.12,
    });
  };

  /** Wall of brass safe-deposit box doors (numbers, keyholes, a few forced open). */
  PF.boxesTex = function () {
    return PF.canvasTex("pws_boxes", 512, 512, (ctx, w, h) => {
      const r = PF.rng("boxes");
      ctx.fillStyle = "#2a2418";
      ctx.fillRect(0, 0, w, h);
      const cols = 8,
        rows = 12,
        cw = w / cols,
        chh = h / rows;
      let n = 1000;
      for (let j = 0; j < rows; j++)
        for (let i = 0; i < cols; i++) {
          const x = i * cw + 2,
            y = j * chh + 2,
            bw = cw - 4,
            bh = chh - 4;
          const open = r() < 0.12;
          if (open) {
            ctx.fillStyle = "#0a0806";
            ctx.fillRect(x, y, bw, bh);
            continue;
          }
          const g = ctx.createLinearGradient(x, y, x + bw, y + bh);
          g.addColorStop(0, "#b8964e");
          g.addColorStop(1, "#7a5e2c");
          ctx.fillStyle = g;
          ctx.fillRect(x, y, bw, bh);
          ctx.strokeStyle = "rgba(40,28,10,0.8)";
          ctx.lineWidth = 1.5;
          ctx.strokeRect(x + 3, y + 3, bw - 6, bh - 6);
          ctx.fillStyle = "#2a1e0c";
          ctx.beginPath();
          ctx.arc(x + bw * 0.3, y + bh / 2, 3, 0, TAU);
          ctx.arc(x + bw * 0.7, y + bh / 2, 3, 0, TAU);
          ctx.fill();
          ctx.fillStyle = "#f0e0b0";
          ctx.fillRect(x + bw / 2 - 11, y + 4, 22, 9);
          ctx.fillStyle = "#2a1e0c";
          ctx.font = "bold 8px monospace";
          ctx.textAlign = "center";
          ctx.fillText(String(n + j * cols + i), x + bw / 2, y + 11);
          if (r() < 0.25) {
            ctx.fillStyle = "rgba(40,60,40," + (0.2 + r() * 0.3) + ")";
            ctx.fillRect(x, y, bw, bh);
          }
        }
      void n;
    });
  };
  PF.boxesKey = function () {
    return PF.texMat("boxes", PF.boxesTex(), { rough: 0.45, metal: 0.6 });
  };

  /** Big incised name band on stone (e.g. "BANK OF THE MANHATTAN COMPANY"). */
  PF.bandKey = function (key, lines, opts) {
    opts = opts || {};
    return PF.texMat(
      key,
      PF.signTex(
        key,
        lines,
        opts.style || "engraved",
        opts.w || 1024,
        opts.h || 128,
        opts.extra || {},
      ),
      { rough: 0.85 },
    );
  };
  /** Transparent graffiti quad material. */
  PF.grafKey = function (key, lines, color, extra) {
    return PF.texMat(
      "graf_" + key,
      PF.graffitiTex(
        key,
        lines,
        512,
        256,
        Object.assign({ color }, extra || {}),
      ),
      { transparent: true, rough: 0.9, noShadow: true },
    );
  };

  // -------------------------------------------------------------------
  // Helpers (copied from poi_chelsea/04_mats.js, same semantics)
  // -------------------------------------------------------------------
  PF.flushGlows = function (parent) {
    for (const g of PF.glows.splice(0))
      PF.glow(g.pos, g.color, g.size, parent || null, {
        intensity: g.intensity || 1.2,
        flicker: g.flicker || 0,
      });
  };
  PF.flushFires = function () {
    const list = PF.fires.splice(0);
    PF.onInitDone.push(() => {
      if (!PF.live("fx") || typeof G.fx.fire !== "function") return;
      for (const p of list) PF.safe("fire", () => G.fx.fire(p.clone(), 0.5));
    });
  };
  /** Horizontal slab with a walkable collider (floors, platforms). Top at y, thickness t. */
  PF.slab = function (b, key, x0, z0, x1, z1, y, t, opts) {
    opts = opts || {};
    t = t || 0.3;
    b.boxMM(key, x0, y - t, z0, x1, y, z1, {
      grime: opts.grime,
      segLen: opts.segLen || 6,
      c: opts.c,
      noAO: opts.noAO,
    });
    if (!opts.noCollide)
      PF.colMM(x0, y - (opts.colT || Math.max(t, 0.5)), z0, x1, y, z1, {
        surface: opts.surface || "concrete",
      });
  };
  /** Steel-stringer stair with treads, rails and step colliders (≤0.3 m rise). Climbs toward local +Z of ry. */
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
      if (opts.solid)
        b.box(
          opts.tread || "diamond",
          wx,
          y0 - 0.05,
          wz,
          width,
          top - y0 + 0.05,
          sr + 0.02,
          { ry, seg: false, grime: 0.4 },
        );
      else
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
        surface: opts.surface || "metal",
      });
    }
    for (const sg of [-1, 1]) {
      if (!opts.solid)
        b.beam(
          key,
          P((sg * width) / 2, y0 - 0.1, 0),
          P((sg * width) / 2, y1 - 0.1, run),
          0.08,
          0.3,
          { twist: ry },
        );
      if (opts.rails !== false && !(opts.railSide && opts.railSide !== sg)) {
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

  /** Semicircular-arch opening: voussoir ring + recessed pane (+ optional sash). (x,y,z) bottom centre on the wall. */
  PF.archBay = function (b, x, y, z, ry, w, h, opts) {
    opts = opts || {};
    const c = Math.cos(ry),
      s = Math.sin(ry);
    const P = (lx, ly, lz) =>
      V3(x + lx * c + lz * s, y + ly, z - lx * s + lz * c);
    const springY = h - w / 2;
    const sh = new THREE.Shape();
    sh.moveTo(-w / 2, 0);
    sh.lineTo(w / 2, 0);
    sh.lineTo(w / 2, springY);
    sh.absarc(0, springY, w / 2, 0, PI, false);
    sh.lineTo(-w / 2, 0);
    const g = PF.shapeGeo(sh, 10);
    b.add(opts.pane || "glass_dark", g, {
      m: PF.m4(x - s * 0.02, y, z - c * 0.02, ry),
      uv: opts.paneUV || (opts.paneRect ? "keep" : "box"),
      uvRect: opts.paneRect,
      grime: 0.1,
      noAO: true,
    });
    const N = opts.n || 11,
      rw = opts.ringW || 0.3,
      R = w / 2 + rw * 0.55;
    // voussoirs: close the joints along the arc (thin rings used to read as separate 'teeth'); thin gilt/iron
    // rings get a proportionally shallower radial depth
    const tang = Math.max(rw, ((PI * R) / N) * 0.94),
      radial = rw >= 0.3 ? 0.46 : Math.max(0.22, rw * 1.4);
    for (let i = 0; i <= N; i++) {
      const a = (i / N) * PI;
      const p = P(Math.cos(a) * R, springY + Math.sin(a) * R, 0.06);
      b.add(opts.ring || "lime_ws", new THREE.BoxGeometry(tang, radial, 0.3), {
        m: PF.m4(p.x, p.y, p.z, ry, 0, a - HP),
        grime: 0.5,
      });
    }
    if (opts.jambs)
      for (const sg of [-1, 1]) {
        const p = P(sg * (w / 2 + 0.15), 0, 0.06);
        b.box(opts.ring || "lime_ws", p.x, y, p.z, 0.3, springY, 0.3, {
          ry,
          seg: false,
          grime: 0.5,
        });
      }
    if (opts.key) {
      const p = P(0, h + 0.18, 0.1);
      b.add(opts.key, new THREE.BoxGeometry(0.4, 0.6, 0.34), {
        m: PF.m4(p.x, p.y, p.z, ry),
        grime: 0.4,
      });
    }
    if (opts.sash) {
      for (const k of [-1, 0, 1]) {
        const p = P((k * w) / 4, 0, 0.03);
        b.box(
          opts.sashKey || "iron",
          p.x,
          y,
          p.z,
          0.06,
          springY + (w / 2) * Math.sqrt(1 - (k / 2) * (k / 2)),
          0.05,
          { ry, seg: false },
        );
      }
      for (let k = 1; k <= 3; k++) {
        const p = P(0, (springY * k) / 3.2, 0.03);
        b.box(opts.sashKey || "iron", p.x, p.y, p.z, w, 0.05, 0.05, {
          ry,
          seg: false,
        });
      }
    }
  };
  /**
   * Classical window: pane + architrave frame + sill (+ optional cornice/pediment head, keystone, muntins).
   * (x,y,z) = bottom centre on the wall face; faces ry. opts: {pane, frame, head:'cornice'|'pediment'|'arch'|null, muntins, keystone, frameW}
   */
  PF.classicWindow = function (b, x, y, z, ry, w, h, opts) {
    opts = opts || {};
    const fk = opts.frame || "lime_ws",
      fw = opts.frameW || 0.18;
    const c = Math.cos(ry),
      s = Math.sin(ry);
    const P = (lx, ly, lz) =>
      V3(x + lx * c + lz * s, y + ly, z - lx * s + lz * c);
    const pane = opts.pane || "glass_dark";
    const p0 = P(0, h / 2, 0.01);
    b.quad(pane, p0.x, p0.y, p0.z, w, h, {
      ry,
      uv: "box",
      grime: 0.1,
      noAO: true,
    });
    for (const sg of [-1, 1]) {
      const p = P(sg * (w / 2 + fw / 2), 0, 0.06);
      b.box(fk, p.x, y, p.z, fw, h, 0.14, { ry, seg: false, grime: 0.45 });
    }
    {
      const p = P(0, 0, 0.06);
      b.box(fk, p.x, y + h, p.z, w + fw * 2, fw, 0.14, {
        ry,
        seg: false,
        grime: 0.45,
      });
    }
    {
      const p = P(0, 0, 0.1);
      b.box(fk, p.x, y - 0.16, p.z, w + fw * 2 + 0.2, 0.16, 0.3, {
        ry,
        seg: false,
        grime: 0.5,
      });
    }
    if (opts.muntins && pane !== "glass_broken" && pane !== "planks") {
      const mk = opts.muntinKey || "timber_white";
      const nx = opts.muntins[0],
        ny = opts.muntins[1];
      for (let i = 1; i < nx; i++) {
        const p = P(-w / 2 + (i * w) / nx, 0, 0.04);
        b.box(mk, p.x, y, p.z, 0.04, h, 0.04, { ry, seg: false, grime: 0.2 });
      }
      for (let j = 1; j < ny; j++) {
        const p = P(0, 0, 0.04);
        b.box(mk, p.x, y + (j * h) / ny - 0.02, p.z, w, 0.04, 0.04, {
          ry,
          seg: false,
          grime: 0.2,
        });
      }
    }
    const top = y + h + fw;
    if (opts.head === "cornice") {
      const p = P(0, 0, 0.14);
      b.box(fk, p.x, top + 0.05, p.z, w + fw * 2 + 0.4, 0.14, 0.34, {
        ry,
        seg: false,
        grime: 0.5,
      });
      const q = P(0, 0, 0.08);
      b.box(fk, q.x, top - 0.02, q.z, w + fw * 2 + 0.1, 0.3, 0.2, {
        ry,
        seg: false,
        grime: 0.5,
      });
    } else if (opts.head === "pediment") {
      const pw = w + fw * 2 + 0.4,
        ph = pw * 0.22;
      const sh = new THREE.Shape();
      sh.moveTo(-pw / 2, 0);
      sh.lineTo(pw / 2, 0);
      sh.lineTo(0, ph);
      sh.closePath();
      const g = new THREE.ExtrudeGeometry(sh, {
        depth: 0.3,
        bevelEnabled: false,
      });
      g.translate(0, 0, -0.05);
      const p = P(0, 0, 0);
      b.add(fk, g, { m: PF.m4(p.x, top + 0.05, p.z, ry), grime: 0.5 });
      const q = P(0, 0, 0.12);
      b.box(fk, q.x, top - 0.05, q.z, pw, 0.12, 0.3, { ry, seg: false });
    } else if (opts.head === "arch") {
      const N = 7,
        R = w / 2 + fw / 2;
      for (let i = 0; i <= N; i++) {
        const a = (i / N) * PI;
        const p = P(Math.cos(a) * R, h + Math.sin(a) * R * 0.5, 0.06);
        b.add(fk, new THREE.BoxGeometry(fw, 0.32, 0.16), {
          m: PF.m4(p.x, p.y, p.z, ry, 0, a - HP),
          grime: 0.4,
        });
      }
    }
    if (opts.keystone) {
      const p = P(0, 0, 0.12);
      b.box(fk, p.x, y + h - 0.1, p.z, 0.3, 0.44, 0.22, {
        ry,
        seg: false,
        grime: 0.4,
      });
    }
  };
  /** Corinthian column: base, fluted shaft, bell capital with two leaf rows and volutes, abacus. */
  PF.corinthian = function (b, key, x, y, z, h, r, opts) {
    opts = opts || {};
    const ck = opts.capKey || key;
    b.box(key, x, y, z, r * 2.7, r * 0.45, r * 2.7, { seg: false, grime: 0.5 });
    b.cyl(key, x, y + r * 0.45, z, r * 1.18, r * 1.3, r * 0.22, 16, {
      hSeg: 1,
    });
    b.cyl(key, x, y + r * 0.67, z, r * 1.05, r * 1.15, r * 0.2, 16, {
      hSeg: 1,
    });
    const capH = r * 2.2,
      shaftH = h - r * 0.87 - capH - r * 0.3;
    b.cyl(key, x, y + r * 0.87, z, r * 0.86, r, shaftH, opts.flutes || 20, {
      hSeg: Math.max(2, Math.round(shaftH / 3)),
      grime: 0.45,
    });
    const cy = y + r * 0.87 + shaftH;
    b.cyl(ck, x, cy, z, r * 1.25, r * 0.88, capH, 12, { hSeg: 1, grime: 0.4 });
    if (!opts.cheap) {
      for (let row = 0; row < 2; row++)
        for (let i = 0; i < 8; i++) {
          const a = ((i + row * 0.5) / 8) * TAU,
            rr = r * (0.95 + row * 0.12);
          b.add(ck, new THREE.SphereGeometry(r * 0.3, 5, 4), {
            m: PF.m4(
              x + Math.cos(a) * rr,
              cy + capH * (0.25 + row * 0.3),
              z + Math.sin(a) * rr,
              -a,
              0,
              0,
              0.7,
              1.4,
              0.55,
            ),
            grime: 0.4,
          });
        }
      for (let i = 0; i < 4; i++) {
        const a = PI / 4 + i * HP;
        b.sphere(
          ck,
          x + Math.cos(a) * r * 1.25,
          cy + capH * 0.85,
          z + Math.sin(a) * r * 1.25,
          r * 0.22,
          { ws: 6, hs: 4 },
        );
      }
    }
    b.box(ck, x, cy + capH, z, r * 2.8, r * 0.3, r * 2.8, {
      seg: false,
      grime: 0.4,
    });
    if (opts.collide !== false)
      PF.col(x, z, r * 2.2, r * 2.2, y, y + h, 0, { walkable: false });
  };
  /** Waterford-style crystal chandelier: brass stem, ring of arms with candle bulbs, tiers of crystal drops. */
  PF.chandelier = function (b, x, y, z, R, lit, parent, ceilY) {
    if (ceilY !== undefined)
      b.beam("brass_ws", V3(x, y + 0.9, z), V3(x, ceilY, z), 0.03, 0.03, {
        noAO: true,
      });
    b.lathe(
      "brass_ws",
      [
        [0.02, 0],
        [0.12, 0.1],
        [0.08, 0.4],
        [0.14, 0.6],
        [0.05, 0.9],
      ],
      8,
      x,
      y,
      z,
      { noAO: true, grime: 0.1 },
    );
    const arms = Math.max(6, Math.round(R * 10));
    for (let i = 0; i < arms; i++) {
      const a = (i / arms) * TAU,
        ax = x + Math.cos(a) * R,
        az = z + Math.sin(a) * R;
      b.beam(
        "brass_ws",
        V3(x, y + 0.25, z),
        V3(ax, y + 0.18, az),
        0.025,
        0.025,
        { noAO: true },
      );
      b.cyl("candle_ws", ax, y + 0.18, az, 0.025, 0.025, 0.12, 5, {
        hSeg: 1,
        noAO: true,
        grime: 0,
      });
      b.sphere(lit ? "bulb_ws" : "crystal", ax, y + 0.34, az, 0.04, {
        ws: 5,
        hs: 3,
        noAO: true,
        grime: 0,
      });
    }
    // crystal drops: two tiers of cones
    for (let t = 0; t < 2; t++) {
      const rr = R * (0.85 - t * 0.35),
        n = Math.round(rr * 16);
      for (let i = 0; i < n; i++) {
        const a = ((i + t * 0.5) / n) * TAU;
        b.cyl(
          "crystal",
          x + Math.cos(a) * rr,
          y - 0.16 - t * 0.22,
          z + Math.sin(a) * rr,
          0.001,
          0.035,
          0.18,
          4,
          { hSeg: 1, noAO: true, grime: 0 },
        );
      }
    }
    b.cyl("crystal", x, y - 0.5, z, 0.001, 0.12, 0.45, 6, {
      hSeg: 1,
      noAO: true,
      grime: 0,
    });
    if (lit)
      PF.glow(V3(x, y + 0.1, z), 0xffe0b0, R * 3.2, parent || null, {
        intensity: 1.1,
      });
  };
  /** Coffered ceiling grid between (x0,z0)-(x1,z1) at height y (underside): beams + recessed panels + rosettes. */
  PF.coffers = function (b, key, x0, z0, x1, z1, y, cell, opts) {
    opts = opts || {};
    const bw = opts.beam || 0.35,
      depth = opts.depth || 0.5;
    b.boxMM(opts.panel || key, x0, y, z0, x1, y + 0.15, z1, {
      segLen: 8,
      noAO: true,
    });
    const nx = Math.max(1, Math.round((x1 - x0) / cell)),
      nz = Math.max(1, Math.round((z1 - z0) / cell));
    for (let i = 0; i <= nx; i++) {
      const x = x0 + ((x1 - x0) * i) / nx;
      b.boxMM(key, x - bw / 2, y - depth, z0, x + bw / 2, y, z1, {
        seg: false,
        noAO: true,
        grime: 0.2,
      });
    }
    for (let j = 0; j <= nz; j++) {
      const z = z0 + ((z1 - z0) * j) / nz;
      b.boxMM(key, x0, y - depth, z - bw / 2, x1, y, z + bw / 2, {
        seg: false,
        noAO: true,
        grime: 0.2,
      });
    }
    if (opts.rosette)
      for (let i = 0; i < nx; i++)
        for (let j = 0; j < nz; j++) {
          const cx = x0 + ((x1 - x0) * (i + 0.5)) / nx,
            cz = z0 + ((z1 - z0) * (j + 0.5)) / nz;
          b.cyl(opts.rosette, cx, y - 0.12, cz, 0.18, 0.12, 0.12, 8, {
            hSeg: 1,
            noAO: true,
            grime: 0.1,
          });
        }
  };
  /** 1900s Singer treadle sewing machine on its iron stand (black enamel, gilt decals). */
  PF.sewingMachine = function (b, x, y, z, ry, opts) {
    opts = opts || {};
    const M = PF.m4(x, y, z, ry, 0, opts.tipped ? 1.3 : 0);
    const add = (k, g, m) =>
      b.add(k, g, {
        m: new THREE.Matrix4().multiplyMatrices(M, m),
        grime: 0.4,
      });
    if (!opts.noStand) {
      add("oak_ws", new THREE.BoxGeometry(1.0, 0.05, 0.45), PF.m4(0, 0.76, 0));
      for (const sx of [-0.42, 0.42]) {
        add(
          "iron",
          new THREE.BoxGeometry(0.05, 0.74, 0.38),
          PF.m4(sx, 0.37, 0),
        );
        const wg = new THREE.TorusGeometry(0.16, 0.02, 4, 12);
        wg.rotateY(HP);
        if (sx > 0) add("iron", wg, PF.m4(sx - 0.06, 0.34, 0));
      }
      add(
        "iron",
        new THREE.BoxGeometry(0.8, 0.04, 0.3),
        PF.m4(0, 0.1, 0.02, 0, 0.2),
      ); // treadle
    }
    const top = opts.noStand ? 0 : 0.78;
    add(
      "black_enamel",
      new THREE.BoxGeometry(0.5, 0.05, 0.2),
      PF.m4(0, top + 0.025, 0),
    );
    add(
      "black_enamel",
      new THREE.BoxGeometry(0.1, 0.24, 0.12),
      PF.m4(0.2, top + 0.17, 0),
    ); // pillar
    add(
      "black_enamel",
      new THREE.BoxGeometry(0.42, 0.09, 0.11),
      PF.m4(0.02, top + 0.3, 0),
    ); // arm
    add(
      "black_enamel",
      new THREE.BoxGeometry(0.08, 0.16, 0.09),
      PF.m4(-0.18, top + 0.2, 0),
    ); // head
    add(
      "chrome",
      new THREE.CylinderGeometry(0.008, 0.008, 0.12, 4),
      PF.m4(-0.18, top + 0.07, 0.02),
    );
    const hw = new THREE.CylinderGeometry(0.075, 0.075, 0.03, 12);
    hw.rotateZ(HP);
    add("chrome", hw, PF.m4(0.27, top + 0.3, 0)); // hand wheel
    add(
      "gold_leaf",
      new THREE.BoxGeometry(0.2, 0.03, 0.112),
      PF.m4(0.02, top + 0.3, 0),
    ); // gilt decal band
  };
  /** Dressmaker's form (dress form) on a tripod stand; raiders dress some in gore and scrap. */
  PF.dressForm = function (b, x, y, z, ry, opts) {
    opts = opts || {};
    const M = PF.m4(x, y, z, ry, opts.tilt || 0, opts.lean || 0);
    const add = (k, g, m) =>
      b.add(k, g, {
        m: new THREE.Matrix4().multiplyMatrices(M, m),
        grime: 0.5,
      });
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * TAU;
      add(
        "iron",
        new THREE.BoxGeometry(0.04, 0.03, 0.36),
        PF.m4(Math.cos(a) * 0.15, 0.02, Math.sin(a) * 0.15, -a + HP),
      );
    }
    add(
      "oak_ws",
      new THREE.CylinderGeometry(0.02, 0.025, 0.9, 5),
      PF.m4(0, 0.45, 0),
    );
    const torso = new THREE.LatheGeometry(
      [
        [0.001, 0],
        [0.16, 0.02],
        [0.2, 0.18],
        [0.15, 0.38],
        [0.2, 0.55],
        [0.17, 0.68],
        [0.07, 0.74],
        [0.05, 0.8],
        [0.001, 0.82],
      ].map((p) => new THREE.Vector2(p[0], p[1])),
      10,
    );
    torso.scale(1.15, 1, 0.8);
    add(opts.gore ? "gore" : "dressform", torso, PF.m4(0, 0.9, 0));
    if (opts.gore)
      add(
        "rust",
        new THREE.BoxGeometry(0.44, 0.24, 0.3),
        PF.m4(0, 1.3, 0.02, 0, 0, 0.2),
      ); // scrap pauldron
    if (opts.skull)
      add("bone", new THREE.SphereGeometry(0.1, 7, 5), PF.m4(0, 1.8, 0));
  };
  /**
   * Seated allegorical figure (Four Continents): throne block, robed seated body, head, arm gesture
   * and one attribute per continent. (x,y,z) = pedestal top centre, faces ry (+Z local = forward).
   */
  /**
   * Daniel Chester French-style seated allegorical figure (the Custom House FOUR CONTINENTS): a heavily draped
   * woman enthroned, legs and knees modelled under a robe that spills in folds over the throne front, a mantle
   * down the back, shaped torso/shoulders/neck/head with hair, and per-kind attributes & companions.
   * Local frame: faces +z, seat top at y 0.95, figure ~2.7 m tall at s = 1.
   */
  PF.seatedFigure = function (b, key, x, y, z, ry, kind, s, opts) {
    s = s || 1;
    opts = opts || {};
    const M = PF.m4(x, y, z, ry, 0, 0, s, s, s);
    const gr = opts.grime === undefined ? 0.55 : opts.grime;
    const add = (g, m, k) =>
      b.add(k || key, g, {
        m: new THREE.Matrix4().multiplyMatrices(M, m),
        grime: gr,
      });
    const lathe = (prof, seg) =>
      new THREE.LatheGeometry(
        prof.map((p) => new THREE.Vector2(Math.max(0.001, p[0]), p[1])),
        seg || 14,
      );
    /** capsule limb from a to c (local), radius r0 */
    const limb = (a, c, r0) => {
      const A = V3(a[0], a[1], a[2]),
        C = V3(c[0], c[1], c[2]),
        d = C.clone().sub(A),
        len = d.length();
      const g = new THREE.CapsuleGeometry(r0, Math.max(0.01, len), 3, 8);
      g.translate(0, len / 2, 0);
      const q = new THREE.Quaternion().setFromUnitVectors(
        V3(0, 1, 0),
        d.normalize(),
      );
      add(g, new THREE.Matrix4().compose(A, q, V3(1, 1, 1)));
    };
    const folds = (g, n, amp, y0, y1) =>
      PF.deform(g, (v) => {
        const a = Math.atan2(v.z, v.x),
          t = Math.min(1, Math.max(0, (y1 - v.y) / (y1 - y0)));
        const f = 1 + amp * t * Math.sin(a * n + v.y * 1.7);
        v.x *= f;
        v.z *= f;
      });
    // --- the throne: stepped block with a moulded seat, carved side panels and a high back ---
    add(new THREE.BoxGeometry(1.7, 0.2, 1.55), PF.m4(0, 0.1, -0.2));
    add(new THREE.BoxGeometry(1.5, 0.75, 1.3), PF.m4(0, 0.575, -0.25));
    add(new THREE.BoxGeometry(1.62, 0.12, 1.42), PF.m4(0, 0.97, -0.25));
    for (const sx of [-1, 1]) {
      add(
        new THREE.BoxGeometry(0.06, 0.5, 0.95),
        PF.m4(sx * 0.77, 0.55, -0.25),
      ); // side panel
      add(new THREE.BoxGeometry(0.16, 0.5, 0.16), PF.m4(sx * 0.72, 1.25, 0.28)); // arm-rest post
      add(new THREE.BoxGeometry(0.2, 0.1, 1.0), PF.m4(sx * 0.72, 1.5, -0.2)); // arm-rest
      add(new THREE.SphereGeometry(0.11, 8, 6), PF.m4(sx * 0.72, 1.56, 0.32)); // scroll end
    }
    add(new THREE.BoxGeometry(1.4, 1.35, 0.18), PF.m4(0, 1.62, -0.86)); // high back
    add(new THREE.BoxGeometry(1.52, 0.14, 0.26), PF.m4(0, 2.33, -0.86));
    // --- legs under the drapery: thighs forward, knees, shins down to sandalled feet ---
    const kx = kind === "africa" ? 0.28 : 0.24;
    for (const sx of [-1, 1]) {
      limb([sx * 0.2, 1.12, -0.35], [sx * kx, 1.16, 0.42], 0.2);
      limb(
        [sx * kx, 1.12, 0.46],
        [
          sx * (kx + 0.02),
          0.2,
          0.62 + (sx > 0 && kind === "europe" ? 0.12 : 0),
        ],
        0.13,
      );
      add(
        new THREE.BoxGeometry(0.16, 0.1, 0.32),
        PF.m4(sx * (kx + 0.02), 0.07, 0.74),
      ); // foot
    }
    // --- robe: lap drape over the knees spilling in vertical folds to the plinth, and the skirt at the sides ---
    const skirt = lathe(
      [
        [0.001, 1.36],
        [0.4, 1.33],
        [0.56, 1.2],
        [0.58, 0.95],
        [0.6, 0.6],
        [0.66, 0.25],
        [0.74, 0.04],
        [0.001, 0],
      ].reverse(),
      20,
    );
    folds(skirt, 9, 0.09, 0, 1.3);
    skirt.scale(1.02, 1, 0.62);
    add(skirt, PF.m4(0, 0, 0.36));
    const lap = new THREE.CapsuleGeometry(0.34, 0.8, 3, 10);
    lap.rotateX(HP);
    lap.scale(1.35, 0.55, 1);
    add(lap, PF.m4(0, 1.2, 0.02));
    // --- torso: hips, waist, bust, shoulders; a mantle down the back and over one shoulder ---
    const torso = lathe(
      [
        [0.001, 0],
        [0.42, 0],
        [0.4, 0.18],
        [0.3, 0.42],
        [0.34, 0.62],
        [0.36, 0.78],
        [0.3, 0.92],
        [0.12, 1.0],
        [0.001, 1.02],
      ],
      16,
    );
    torso.scale(1.18, 1, 0.78);
    const lean =
      kind === "asia"
        ? 0.12
        : kind === "africa"
          ? 0.2
          : kind === "america"
            ? -0.06
            : 0;
    add(torso, PF.m4(0, 1.15, -0.3, 0, lean));
    for (const sx of [-1, 1])
      add(
        new THREE.SphereGeometry(0.16, 10, 8),
        PF.m4(sx * 0.36, 2.02, -0.3 + lean * 0.9, 0, 0, 0, 1, 0.85, 1),
      ); // shoulders
    const mantle = lathe(
      [
        [0.001, 1.25],
        [0.34, 1.18],
        [0.48, 0.8],
        [0.58, 0.35],
        [0.66, 0.02],
        [0.001, 0],
      ].reverse(),
      16,
    );
    folds(mantle, 7, 0.08, 0, 1.2);
    mantle.scale(1.15, 1, 0.5);
    add(mantle, PF.m4(0, 0.95, -0.62, 0, 0.05));
    // neck, head, hair
    const hy = 2.28,
      hz = -0.3 + lean * 1.1;
    const tilt =
      kind === "asia"
        ? 0.25
        : kind === "africa"
          ? 0.45
          : kind === "america"
            ? -0.12
            : 0.05;
    if (opts.broken) {
      // head lost (shrapnel): a snapped neck stump; the head lies on the plinth at her feet
      add(
        new THREE.CylinderGeometry(0.07, 0.09, 0.1, 8),
        PF.m4(0, hy - 0.24, hz, 0, 0.35, 0.2),
      );
      add(
        new THREE.SphereGeometry(0.155, 12, 10),
        PF.m4(0.42, 0.17, 0.95, 0.6, 1.2, 0.4, 0.88, 1.08, 1),
      );
      add(
        new THREE.SphereGeometry(0.16, 10, 8, 0, TAU, 0, PI * 0.55),
        PF.m4(0.42, 0.19, 0.95, 0.6, 1.2 - 0.3, 0.4, 0.95, 1, 1.05),
      );
    } else {
      add(
        new THREE.CylinderGeometry(0.075, 0.09, 0.2, 8),
        PF.m4(0, hy - 0.2, hz),
      );
      add(
        new THREE.SphereGeometry(0.155, 12, 10),
        PF.m4(
          0,
          hy,
          hz + 0.02,
          0,
          tilt,
          kind === "africa" ? 0.35 : 0,
          0.88,
          1.08,
          1,
        ),
      );
      add(
        new THREE.BoxGeometry(0.1, 0.06, 0.05),
        PF.m4(0, hy - 0.02, hz + 0.16, 0, tilt),
      ); // nose / brow line
      add(
        new THREE.SphereGeometry(0.16, 10, 8, 0, TAU, 0, PI * 0.55),
        PF.m4(0, hy + 0.03, hz - 0.03, 0, tilt - 0.3, 0, 0.95, 1, 1.05),
      ); // hair cap
      add(
        new THREE.SphereGeometry(0.08, 8, 6),
        PF.m4(0, hy + 0.02, hz - 0.17, 0, tilt),
      ); // chignon
    }
    const sh = (sx) => [sx * 0.38, 2.0, -0.3 + lean * 0.9];
    // --- per-kind arms, attributes and companions ---
    if (kind === "america") {
      // alert and forward-looking: the torch of Liberty raised high, maize on the lap, the eagle behind her
      limb(sh(1), [0.52, 2.35, -0.05], 0.1);
      limb([0.52, 2.35, -0.05], [0.56, 2.85, 0.02], 0.085);
      add(
        new THREE.CylinderGeometry(0.05, 0.035, 0.6, 8),
        PF.m4(0.56, 2.95, 0.03),
      );
      add(
        lathe(
          [
            [0.001, 0],
            [0.1, 0.02],
            [0.13, 0.12],
            [0.07, 0.3],
            [0.001, 0.42],
          ],
          8,
        ),
        PF.m4(0.56, 3.25, 0.03),
      ); // flame (stone)
      limb(sh(-1), [-0.45, 1.55, -0.05], 0.1);
      limb([-0.45, 1.55, -0.05], [-0.18, 1.42, 0.38], 0.085);
      for (let k = 0; k < 5; k++)
        add(
          new THREE.CylinderGeometry(0.03, 0.05, 0.62, 6),
          PF.m4(-0.1 + k * 0.05, 1.45, 0.3, k * 0.4, HP * 0.9, 0.15 - k * 0.07),
        ); // maize sheaf
      // the eagle perched on the throne back, wings half-spread
      add(
        new THREE.SphereGeometry(0.2, 10, 8),
        PF.m4(-0.5, 2.6, -0.8, 0, 0.3, 0, 0.8, 1.2, 0.9),
      );
      add(new THREE.SphereGeometry(0.1, 8, 6), PF.m4(-0.5, 2.88, -0.68));
      add(
        new THREE.ConeGeometry(0.04, 0.12, 5),
        PF.m4(-0.5, 2.86, -0.58, 0, HP),
      );
      for (const sx of [-1, 1]) {
        const w = new THREE.BoxGeometry(0.62, 0.06, 0.34);
        w.translate(sx * 0.31, 0, 0);
        add(w, PF.m4(-0.5 + sx * 0.08, 2.7, -0.82, 0, 0.1, sx * 0.55));
      }
    } else if (kind === "asia") {
      // meditative, eyes lowered, hands folded around a Buddha idol on her lap; the lotus crown; the throne on skulls
      limb(sh(1), [0.3, 1.6, 0.05], 0.1);
      limb([0.3, 1.6, 0.05], [0.08, 1.45, 0.34], 0.085);
      limb(sh(-1), [-0.3, 1.6, 0.05], 0.1);
      limb([-0.3, 1.6, 0.05], [-0.08, 1.45, 0.34], 0.085);
      add(
        new THREE.SphereGeometry(0.11, 8, 6),
        PF.m4(0, 1.5, 0.38, 0, 0, 0, 1.1, 0.8, 1),
      );
      add(new THREE.SphereGeometry(0.07, 8, 6), PF.m4(0, 1.64, 0.38));
      add(new THREE.SphereGeometry(0.035, 6, 4), PF.m4(0, 1.73, 0.38));
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * TAU;
        add(
          new THREE.ConeGeometry(0.06, 0.18, 4),
          PF.m4(
            Math.cos(a) * 0.1,
            hy + 0.2,
            hz + Math.sin(a) * 0.1,
            0,
            Math.sin(a) * 0.3,
            -Math.cos(a) * 0.3,
          ),
        );
      }
      // the heap of skulls under her feet: carved crania with orbits, nasal aperture, jaw and teeth
      for (let k = 0; k < 5; k++)
        PF.skull(
          b,
          key,
          opts.sockKey || "granite_dark",
          -0.56 + k * 0.28,
          0.02 + (k % 2) * 0.03,
          0.97,
          1.25,
          (k - 2) * 0.35,
          (k % 2) * -0.2,
          { M, grime: gr },
        );
      for (let k = 0; k < 2; k++)
        PF.skull(
          b,
          key,
          opts.sockKey || "granite_dark",
          -0.42 + k * 0.56,
          0.2,
          0.86,
          1.1,
          k ? -0.4 : 0.4,
          0.1,
          { M, grime: gr },
        );
    } else if (kind === "europe") {
      // regal, crowned, the right hand on a globe, the left on a book of law; the prow of a ship beside her
      limb(sh(1), [0.55, 1.6, 0.0], 0.1);
      limb([0.55, 1.6, 0.0], [0.74, 1.35, 0.3], 0.085);
      add(new THREE.SphereGeometry(0.3, 14, 10), PF.m4(0.82, 1.02, 0.34));
      add(
        new THREE.TorusGeometry(0.31, 0.015, 4, 20),
        PF.m4(0.82, 1.02, 0.34, 0.4, 0.3),
      );
      add(
        new THREE.TorusGeometry(0.31, 0.015, 4, 20),
        PF.m4(0.82, 1.02, 0.34, 0, HP),
      );
      limb(sh(-1), [-0.48, 1.62, 0.05], 0.1);
      limb([-0.48, 1.62, 0.05], [-0.28, 1.45, 0.34], 0.085);
      add(
        new THREE.BoxGeometry(0.34, 0.08, 0.44),
        PF.m4(-0.3, 1.46, 0.36, 0.2, 0.2),
      );
      if (!opts.broken) {
        add(
          lathe(
            [
              [0.18, 0],
              [0.19, 0.08],
              [0.17, 0.14],
            ],
            12,
          ),
          PF.m4(0, hy + 0.12, hz),
        );
        for (let k = 0; k < 6; k++) {
          const a = (k / 6) * TAU;
          add(
            new THREE.ConeGeometry(0.035, 0.12, 4),
            PF.m4(Math.cos(a) * 0.17, hy + 0.3, hz + Math.sin(a) * 0.17),
          );
        }
      }
      const prow = new THREE.Shape();
      prow.moveTo(0, 0);
      prow.quadraticCurveTo(0.9, 0.2, 1.2, 1.4);
      prow.lineTo(0.95, 1.45);
      prow.quadraticCurveTo(0.5, 0.5, 0, 0.35);
      prow.closePath();
      const pg = new THREE.ExtrudeGeometry(prow, {
        depth: 0.28,
        bevelEnabled: false,
      });
      pg.translate(0, 0, -0.14);
      add(pg, PF.m4(-0.95, 0.2, -0.45, -HP));
    } else {
      // Africa: asleep, her head resting on her arm across the head of a sphinx; a lion crouched at her side
      limb(sh(-1), [-0.62, 1.9, -0.05], 0.1);
      limb([-0.62, 1.9, -0.05], [-0.2, 2.12, -0.12], 0.085);
      limb(sh(1), [0.42, 1.55, 0.05], 0.1);
      limb([0.42, 1.55, 0.05], [0.3, 1.3, 0.42], 0.085);
      // sphinx head (nemes headdress) on a block at her left
      add(new THREE.BoxGeometry(0.5, 0.6, 0.6), PF.m4(-0.85, 1.2, -0.25));
      add(
        new THREE.SphereGeometry(0.2, 10, 8),
        PF.m4(-0.85, 1.72, -0.18, 0, 0, 0, 0.9, 1.1, 0.9),
      );
      const nemes = new THREE.CylinderGeometry(0.12, 0.34, 0.5, 4, 1, true);
      nemes.rotateY(PI / 4);
      add(nemes, PF.m4(-0.85, 1.72, -0.24));
      // the lion: body, haunch, maned head, forepaws
      const body = new THREE.CapsuleGeometry(0.26, 0.7, 3, 10);
      body.rotateX(HP);
      add(body, PF.m4(1.0, 0.36, -0.05));
      add(
        new THREE.SphereGeometry(0.28, 10, 8),
        PF.m4(1.0, 0.42, -0.5, 0, 0, 0, 1, 1, 1.1),
      );
      add(
        new THREE.SphereGeometry(0.3, 12, 9),
        PF.m4(1.0, 0.58, 0.45, 0, 0, 0, 1.05, 1, 0.85),
      ); // mane
      add(
        new THREE.SphereGeometry(0.17, 10, 8),
        PF.m4(1.0, 0.56, 0.66, 0, 0, 0, 0.9, 0.9, 1.1),
      ); // muzzle
      for (const sx of [-1, 1])
        add(
          new THREE.CapsuleGeometry(0.07, 0.3, 2, 6),
          PF.m4(1.0 + sx * 0.14, 0.12, 0.6, 0, HP),
        );
    }
  };
  /** Convoy wagon: plank bed on four spoked wheels, hoop-and-canvas cover, tongue, crates. */
  PF.wagon = function (b, x, y, z, ry, opts) {
    opts = opts || {};
    const M = PF.m4(x, y, z, ry);
    const add = (k, g, m, o) =>
      b.add(
        k,
        g,
        Object.assign(
          { m: new THREE.Matrix4().multiplyMatrices(M, m), grime: 0.55 },
          o || {},
        ),
      );
    add("planks", new THREE.BoxGeometry(1.7, 0.12, 3.6), PF.m4(0, 0.75, 0));
    for (const sx of [-0.85, 0.85])
      add("planks", new THREE.BoxGeometry(0.06, 0.5, 3.6), PF.m4(sx, 1.0, 0));
    for (const sz of [-1.8, 1.8])
      add("planks", new THREE.BoxGeometry(1.7, 0.5, 0.06), PF.m4(0, 1.0, sz));
    for (const sx of [-0.95, 0.95])
      for (const sz of [-1.2, 1.2]) {
        const w = new THREE.TorusGeometry(0.45, 0.05, 4, 14);
        w.rotateY(HP);
        add("rotten", w, PF.m4(sx, 0.48, sz));
        for (let k = 0; k < 4; k++)
          add(
            "rotten",
            new THREE.BoxGeometry(0.04, 0.88, 0.05),
            PF.m4(sx, 0.48, sz, 0, (k * PI) / 4),
          );
      }
    add(
      "rust",
      new THREE.CylinderGeometry(0.04, 0.04, 2.1, 5),
      PF.m4(0, 0.48, -1.2, 0, 0, HP),
    );
    add(
      "rust",
      new THREE.CylinderGeometry(0.04, 0.04, 2.1, 5),
      PF.m4(0, 0.48, 1.2, 0, 0, HP),
    );
    add(
      "rotten",
      new THREE.BoxGeometry(0.1, 0.1, 2.0),
      PF.m4(0, 0.6, -2.7, 0, -0.15),
    );
    if (opts.cover !== false) {
      for (let k = 0; k < 4; k++) {
        const hz = -1.5 + k;
        const hoop = new THREE.TorusGeometry(0.88, 0.03, 3, 10, PI);
        add("rotten", hoop, PF.m4(0, 1.2, hz), {});
      }
      const cov = new THREE.CylinderGeometry(
        0.9,
        0.9,
        3.3,
        12,
        1,
        true,
        -HP,
        PI,
      );
      cov.rotateX(HP);
      add(opts.canvas || "canvas_ws", cov, PF.m4(0, 1.2, 0), { grime: 0.7 });
    }
    for (let k = 0; k < 3; k++)
      add(
        "crate",
        new THREE.BoxGeometry(0.55, 0.45, 0.55),
        PF.m4(-0.4 + (k % 2) * 0.8, 1.05, 0.9 - k * 0.7, 0.2 * k),
      );
    PF.col(x, z, 2.1, 4.2, y, y + 2.2, ry, {
      walkable: false,
      surface: "wood",
    });
  };
  /** Iron ceiling / wall lamp in a cage + glow (for interiors). */
  PF.cageLamp = function (b, x, y, z, color, parent) {
    b.cyl("iron", x, y + 0.2, z, 0.02, 0.02, 0.6, 4, { hSeg: 1 });
    b.cyl("iron", x, y, z, 0.18, 0.12, 0.2, 8, { hSeg: 1, open: true });
    b.sphere("bulb_ws", x, y - 0.05, z, 0.08, {
      ws: 6,
      hs: 4,
      noAO: true,
      grime: 0,
    });
    PF.glow(V3(x, y - 0.1, z), color || 0xffd8a0, 1.3, parent, {
      intensity: 1.1,
    });
  };
  /** Headstone (slate slab with texture on the front) — small, cheap, leaning. */
  /** Colonial headstone outline: shoulders + round tympanum (bottom-centre origin, from y = yb up to h). */
  function stoneShape(w, h, yb, style) {
    const sh = new THREE.Shape();
    const rc = w * (style === 1 ? 0.5 : 0.34),
      hs = h - rc,
      sw = w / 2 - rc;
    sh.moveTo(-w / 2, yb);
    sh.lineTo(w / 2, yb);
    sh.lineTo(w / 2, hs);
    if (style === 1) {
      sh.absarc(0, hs, rc, 0, PI, false);
    } // plain round top
    else {
      sh.quadraticCurveTo(w / 2 - sw / 2, hs + sw * 1.1, rc, hs); // right shoulder lobe
      sh.absarc(0, hs, rc, 0, PI, false); // tympanum
      sh.quadraticCurveTo(-w / 2 + sw / 2, hs + sw * 1.1, -w / 2, hs); // left shoulder lobe
    }
    sh.lineTo(-w / 2, yb);
    return sh;
  }
  PF.headstone = function (b, x, z, ry, v, opts) {
    opts = opts || {};
    const r = PF.rng("hsx" + x.toFixed(1) + z.toFixed(1));
    const h = (opts.h || 1.0) * (0.75 + r() * 0.5),
      w = 0.55 + r() * 0.3,
      tilt = (r() - 0.5) * 0.22,
      lean = (r() - 0.5) * 0.1;
    const y0 = opts.y || 0,
      style = v % 5 === 3 ? 1 : 0,
      T = 0.1;
    const m = PF.m4(x, y0, z, ry, tilt, lean);
    const g = new THREE.ExtrudeGeometry(stoneShape(w, h, -0.18, style), {
      depth: T,
      bevelEnabled: false,
      curveSegments: 5,
    });
    g.translate(0, 0, -T / 2);
    b.add(v % 2 ? "slate" : "brown_sp", g, { m, grime: 0.6 });
    // carved face: the same outline, UVs normalised to the stone so the tympanum art sits in the arch
    const f = new THREE.ShapeGeometry(
      stoneShape(w * 0.97, h * 0.985, 0.02, style),
      5,
    );
    const uv = f.attributes.uv,
      pos = f.attributes.position;
    for (let i = 0; i < uv.count; i++)
      uv.setXY(i, (pos.getX(i) + w / 2) / w, pos.getY(i) / h);
    f.translate(0, 0, T / 2 + 0.004);
    const at = PF.hsAtlas; // St. Paul's exterior packs the headstone faces into its sign atlas (one draw call)
    b.add(at ? at.key : PF.headstoneKey(v), f, {
      m,
      uv: "keep",
      uvRect: at ? at.rect("hs" + (v % 4)) : undefined,
      grime: 0.3,
    });
  };
})();
