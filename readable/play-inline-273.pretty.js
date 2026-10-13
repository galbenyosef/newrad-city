/* src/poi_uws/06_parts.js */
/* =====================================================================
 * NEW RAD CITY — POI UPPER WEST SIDE · 06 shared parts
 * Extra materials / surfaces and building parts used by the Ansonia,
 * the San Remo and Bellamy's:
 *   spiral stair (the Ansonia's famous open-well staircase), 12-gon
 *   round walls with door holes, bulbous copper domes + lanterns, windows
 *   wrapped round cylindrical corner towers, bronze seals, mannequins,
 *   clothes racks, escalators, awnings, NYC rooftop water tower, raised
 *   farm beds, round temple crowns (tholos), urns, balustrades, and a
 *   procedural painted skyline backdrop for penthouse windows.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE || !G._uw) return;
  const P = G._uw;
  const TAU = P.TAU,
    PI = P.PI,
    HP = P.HP;
  const X = (P.parts = {});

  // ------------------------------------------------------------------
  // Extra materials
  // ------------------------------------------------------------------
  Object.assign(P.MAT, {
    deco_black: {
      src: "granite",
      tint: 0x2a2a2e,
      color: 0x1c1c20,
      uv: 3,
      rough: 0.35,
    },
    brass: {
      src: "gold",
      tint: 0xd8b060,
      color: 0xb08a40,
      uv: 1,
      metal: 0.8,
      rough: 0.4,
    },
    tile_green: { custom: "tile_green", color: 0x5a8a70, uv: 1.6, rough: 0.35 },
    tile_bath: { custom: "tile_bath", color: 0xd8d8cc, uv: 1.2, rough: 0.35 },
    checker: { custom: "checker", color: 0x888888, uv: 2.4, rough: 0.3 },
    mosaic: {
      custom: "mosaic",
      color: 0xa89a80,
      uv: 4,
      keep: false,
      rough: 0.5,
    },
    mannequin: {
      src: "paint_white",
      tint: 0xe8dccb,
      color: 0xd8ccb8,
      uv: 1,
      rough: 0.45,
    },
    mannequin_dark: {
      src: "paint_black",
      tint: 0x3a3430,
      color: 0x2a2624,
      uv: 1,
      rough: 0.45,
    },
    awning: { custom: "canvas_black", color: 0x1a1a1a, uv: 1.5, rough: 1 },
    canvas: { custom: "canvas_tan", color: 0x8a7a5a, uv: 1.5, rough: 1 },
    crop_dead: { custom: "crop_dead", color: 0x6a5a38, uv: 1.2, rough: 1 },
    hay: { custom: "hay", color: 0xa08a50, uv: 1, rough: 1 },
    chicken_wire: { src: "iron", color: 0x4a4a44, uv: 1, metal: 0.4 },
    limestone_warm: {
      src: "stone_limestone",
      tint: 0xf0e2c8,
      color: 0xc8b898,
      uv: 4,
    },
    terracotta_cream: {
      src: "stone_limestone",
      tint: 0xfff4de,
      color: 0xd8ccb0,
      uv: 3,
    },
    brick_tan: { src: "brick_tan", tint: 0xe8d0a0, color: 0xb89a6a, uv: 3 },
    clothes: { custom: "clothes", color: 0x7a6a5a, uv: 0.8, rough: 1 },
    shoebox: { custom: "shoebox", color: 0x8a7a6a, uv: 0.6, rough: 0.9 },
    backdrop_park: {
      custom: "backdrop_park",
      color: 0x000000,
      emissive: 0xffffff,
      ei: 0.85,
      emissiveCustom: true,
      uv: 1,
      keep: true,
      noShadow: true,
    },
    lamp_warm: {
      color: 0xffe0b0,
      emissive: 0xffc070,
      ei: 1.6,
      plain: true,
      noShadow: true,
      uv: 1,
    },
    lamp_cool: {
      color: 0xd8f0ff,
      emissive: 0xb8e0ff,
      ei: 1.4,
      plain: true,
      noShadow: true,
      uv: 1,
    },
    neon_b: {
      color: 0xfff0f0,
      emissive: 0xff6a88,
      ei: 2.0,
      plain: true,
      noShadow: true,
      uv: 1,
    },
    glow_green: {
      color: 0x70ff70,
      emissive: 0x50ff40,
      ei: 1.3,
      plain: true,
      noShadow: true,
      uv: 1,
    },
  });
  P.DETAILS_EXTRA = ["brass", "mannequin", "clothes", "hay", "chicken_wire"];

  const sp = P.speckle,
    bl = P.blotches;
  Object.assign(P.CUSTOM, {
    tile_green: [
      256,
      256,
      (ctx, w, h) => {
        const r = P.rng("tg");
        const n = 8,
          s = w / n;
        for (let i = 0; i < n; i++)
          for (let j = 0; j < n; j++) {
            const c = 80 + r() * 30;
            ctx.fillStyle =
              "rgb(" +
              ((c * 0.55) | 0) +
              "," +
              ((c * 1.15) | 0) +
              "," +
              ((c * 0.85) | 0) +
              ")";
            ctx.fillRect(i * s + 1, j * s + 1, s - 2, s - 2);
            if (r() < 0.06) {
              ctx.fillStyle = "rgba(20,20,10,0.6)";
              ctx.fillRect(i * s + 1, j * s + 1, s - 2, s - 2);
            }
          }
        ctx.fillStyle = "rgba(230,225,200,0.5)";
        for (let i = 0; i <= n; i++) {
          ctx.fillRect(i * s - 1, 0, 2, h);
          ctx.fillRect(0, i * s - 1, w, 2);
        }
        bl(ctx, w, h, r, 30, 0.3);
        sp(ctx, w, h, r, 700);
      },
    ],
    tile_bath: [
      256,
      256,
      (ctx, w, h) => {
        const r = P.rng("tbath");
        const n = 12,
          s = w / n;
        ctx.fillStyle = "#6a6a60";
        ctx.fillRect(0, 0, w, h);
        for (let i = 0; i < n; i++)
          for (let j = 0; j < n; j++) {
            const c = 200 + r() * 30;
            const blue = (i + j) % 7 === 0;
            ctx.fillStyle = blue
              ? "rgb(70,110,120)"
              : "rgb(" + (c | 0) + "," + (c | 0) + "," + ((c * 0.94) | 0) + ")";
            ctx.fillRect(i * s + 1, j * s + 1, s - 2, s - 2);
          }
        for (let i = 0; i < 8; i++) {
          const x = r() * w;
          const g = ctx.createLinearGradient(0, 0, 0, h);
          g.addColorStop(0, "rgba(90,70,30,0.3)");
          g.addColorStop(1, "rgba(90,70,30,0)");
          ctx.fillStyle = g;
          ctx.fillRect(x, 0, 4 + r() * 16, h);
        }
        bl(ctx, w, h, r, 30, 0.3);
        sp(ctx, w, h, r, 900);
      },
    ],
    checker: [
      256,
      256,
      (ctx, w, h) => {
        const r = P.rng("chk");
        const n = 4,
          s = w / n;
        for (let i = 0; i < n; i++)
          for (let j = 0; j < n; j++) {
            const dark = (i + j) % 2 === 0;
            const g = ctx.createLinearGradient(
              i * s,
              j * s,
              i * s + s,
              j * s + s,
            );
            if (dark) {
              g.addColorStop(0, "#1a1a1c");
              g.addColorStop(1, "#2c2a2a");
            } else {
              g.addColorStop(0, "#e4e0d6");
              g.addColorStop(1, "#cfcac0");
            }
            ctx.fillStyle = g;
            ctx.fillRect(i * s, j * s, s, s);
            ctx.strokeStyle = dark
              ? "rgba(200,200,200,0.12)"
              : "rgba(80,70,60,0.25)";
            ctx.lineWidth = 1;
            for (let k = 0; k < 3; k++) {
              ctx.beginPath();
              let x = i * s + r() * s,
                y = j * s + r() * s;
              ctx.moveTo(x, y);
              for (let q = 0; q < 5; q++) {
                x += (r() - 0.5) * 30;
                y += (r() - 0.5) * 30;
                ctx.lineTo(x, y);
              }
              ctx.stroke();
            }
          }
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        for (let i = 0; i <= n; i++) {
          ctx.fillRect(i * s - 1, 0, 2, h);
          ctx.fillRect(0, i * s - 1, w, 2);
        }
        bl(ctx, w, h, r, 26, 0.3);
        sp(ctx, w, h, r, 900, 0.3, 0.1);
      },
    ],
    mosaic: [
      512,
      512,
      (ctx, w, h) => {
        const r = P.rng("mos");
        ctx.fillStyle = "#b8ab90";
        ctx.fillRect(0, 0, w, h);
        const pal = [
          "#c8b898",
          "#a89878",
          "#d8ccb0",
          "#7a8a78",
          "#4a6a70",
          "#b89a60",
        ];
        for (let y = 0; y < h; y += 8)
          for (let x = 0; x < w; x += 8) {
            const cx = x - w / 2,
              cy = y - h / 2,
              d = Math.hypot(cx, cy),
              a = Math.atan2(cy, cx);
            let c =
              pal[
                (Math.floor(d / 34) + (Math.floor(a / (PI / 8) + 16) % 2)) %
                  pal.length
              ];
            if (d < 60) c = "#3a5a68";
            if (Math.abs(d - 200) < 10) c = "#2a3a40";
            ctx.fillStyle = c;
            ctx.fillRect(x + 0.5, y + 0.5, 7, 7);
          }
        bl(ctx, w, h, r, 40, 0.3);
        sp(ctx, w, h, r, 1600);
      },
    ],
    canvas_black: [
      256,
      256,
      (ctx, w, h) => {
        const r = P.rng("cvb");
        ctx.fillStyle = "#18181a";
        ctx.fillRect(0, 0, w, h);
        for (let y = 0; y < h; y += 2) {
          ctx.fillStyle = "rgba(255,255,255," + r() * 0.04 + ")";
          ctx.fillRect(0, y, w, 1);
        }
        for (let i = 0; i < 12; i++) {
          const x = r() * w;
          ctx.fillStyle = "rgba(120,100,70,0.12)";
          ctx.fillRect(x, 0, 3 + r() * 10, h);
        }
        bl(ctx, w, h, r, 20, 0.25);
      },
    ],
    canvas_tan: [
      256,
      256,
      (ctx, w, h) => {
        const r = P.rng("cvt");
        ctx.fillStyle = "#8a7a58";
        ctx.fillRect(0, 0, w, h);
        for (let y = 0; y < h; y += 2) {
          ctx.fillStyle = "rgba(40,30,10," + r() * 0.08 + ")";
          ctx.fillRect(0, y, w, 1);
        }
        bl(ctx, w, h, r, 30, 0.3);
        sp(ctx, w, h, r, 500);
      },
    ],
    crop_dead: [
      256,
      256,
      (ctx, w, h) => {
        const r = P.rng("crop");
        ctx.fillStyle = "#3a2e1c";
        ctx.fillRect(0, 0, w, h);
        for (let i = 0; i < 260; i++) {
          ctx.strokeStyle =
            "rgba(" +
            ((120 + r() * 60) | 0) +
            "," +
            ((95 + r() * 40) | 0) +
            "," +
            ((50 + r() * 20) | 0) +
            ",0.8)";
          ctx.lineWidth = 1 + r() * 2;
          const x = r() * w,
            y = r() * h;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + (r() - 0.5) * 20, y - 10 - r() * 30);
          ctx.stroke();
        }
      },
    ],
    hay: [
      128,
      128,
      (ctx, w, h) => {
        const r = P.rng("hay");
        ctx.fillStyle = "#8a7438";
        ctx.fillRect(0, 0, w, h);
        for (let i = 0; i < 300; i++) {
          ctx.strokeStyle =
            "rgba(" +
            ((180 + r() * 60) | 0) +
            "," +
            ((150 + r() * 50) | 0) +
            ",80,0.7)";
          ctx.beginPath();
          const x = r() * w,
            y = r() * h;
          ctx.moveTo(x, y);
          ctx.lineTo(x + (r() - 0.5) * 30, y + (r() - 0.5) * 8);
          ctx.stroke();
        }
      },
    ],
    clothes: [
      256,
      256,
      (ctx, w, h) => {
        const r = P.rng("clo");
        const pal = [
          "#6a2a2a",
          "#2a3a5a",
          "#8a7a5a",
          "#3a4a3a",
          "#aa8a6a",
          "#5a3a5a",
          "#c8b8a0",
          "#2a2a2a",
          "#8a4a2a",
        ];
        for (let x = 0; x < w;) {
          const cw = 6 + r() * 16;
          ctx.fillStyle = pal[Math.floor(r() * pal.length)];
          ctx.fillRect(x, 0, cw, h);
          ctx.fillStyle = "rgba(0,0,0,0.3)";
          ctx.fillRect(x, 0, 1.5, h);
          x += cw;
        }
        for (let y = 0; y < h; y += 3) {
          ctx.fillStyle = "rgba(255,255,255," + r() * 0.05 + ")";
          ctx.fillRect(0, y, w, 1);
        }
        bl(ctx, w, h, r, 30, 0.4);
      },
    ],
    shoebox: [
      256,
      256,
      (ctx, w, h) => {
        const r = P.rng("shoe");
        const pal = [
          "#d8c8a8",
          "#8a6a4a",
          "#e0dcd0",
          "#b04a3a",
          "#2a2a2a",
          "#c8a060",
        ];
        for (let y = 0; y < h; y += 32)
          for (let x = 0; x < w; x += 42) {
            if (r() < 0.14) {
              ctx.fillStyle = "#1a1612";
              ctx.fillRect(x, y, 42, 32);
              continue;
            }
            ctx.fillStyle = pal[Math.floor(r() * pal.length)];
            ctx.fillRect(x + 1, y + 1, 40, 30);
            ctx.fillStyle = "rgba(255,255,255,0.5)";
            ctx.fillRect(x + 12, y + 12, 18, 7);
          }
        bl(ctx, w, h, r, 20, 0.35);
      },
    ],
    backdrop_park: [2048, 512, (ctx, w, h) => X.paintSkyline(ctx, w, h)],
  });

  /** Painted view from a Central Park West penthouse: sickly dusk sky, the dead park, the ruined skyline. */
  X.paintSkyline = function (ctx, w, h) {
    const r = P.rng("skyline");
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#2c3a2e");
    g.addColorStop(0.35, "#6a7a52");
    g.addColorStop(0.62, "#c8b878");
    g.addColorStop(0.75, "#8a7a50");
    g.addColorStop(1, "#2a2418");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    // clouds
    for (let i = 0; i < 60; i++) {
      const x = r() * w,
        y = h * (0.08 + r() * 0.4),
        rr = 40 + r() * 140;
      const cg = ctx.createRadialGradient(x, y, 0, x, y, rr);
      cg.addColorStop(0, "rgba(210,200,150," + (0.05 + r() * 0.08) + ")");
      cg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = cg;
      ctx.fillRect(x - rr, y - rr * 0.4, rr * 2, rr * 0.8);
    }
    // sun disc behind haze
    const sg = ctx.createRadialGradient(
      w * 0.7,
      h * 0.52,
      0,
      w * 0.7,
      h * 0.52,
      90,
    );
    sg.addColorStop(0, "rgba(255,240,190,0.9)");
    sg.addColorStop(0.2, "rgba(255,220,150,0.5)");
    sg.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = sg;
    ctx.fillRect(w * 0.7 - 90, h * 0.52 - 90, 180, 180);
    // far skyline (midtown) — silhouettes with a few spires
    const hz = h * 0.66;
    for (let layer = 0; layer < 3; layer++) {
      const c = [70, 50, 34][layer];
      ctx.fillStyle =
        "rgb(" + ((c * 0.95) | 0) + "," + c + "," + ((c * 0.8) | 0) + ")";
      let x = 0;
      while (x < w) {
        const bw = 18 + r() * (50 - layer * 8),
          bh = (20 + r() * (layer === 0 ? 140 : 90)) * (1 - layer * 0.25);
        const y0 = hz - bh + layer * 16;
        ctx.fillRect(x, y0, bw, h - y0);
        if (r() < 0.12) {
          ctx.beginPath();
          ctx.moveTo(x + bw * 0.2, y0);
          ctx.lineTo(x + bw / 2, y0 - bh * 0.4);
          ctx.lineTo(x + bw * 0.8, y0);
          ctx.fill();
        }
        if (r() < 0.2) {
          ctx.fillRect(x + bw * 0.45, y0 - 30, 2, 30);
        }
        if (r() < 0.25) {
          ctx.fillStyle = "rgba(0,0,0,0.25)";
          ctx.fillRect(x + bw * 0.6, y0, bw * 0.4, 8 + r() * 30);
          ctx.fillStyle =
            "rgb(" + ((c * 0.95) | 0) + "," + c + "," + ((c * 0.8) | 0) + ")";
        }
        // a few lit windows (settlements)
        if (layer < 2)
          for (let k = 0; k < 5; k++)
            if (r() < 0.35) {
              ctx.fillStyle = "rgba(255,200,110," + (0.4 + r() * 0.5) + ")";
              ctx.fillRect(x + r() * bw, y0 + r() * bh * 0.8, 2, 2);
              ctx.fillStyle =
                "rgb(" +
                ((c * 0.95) | 0) +
                "," +
                c +
                "," +
                ((c * 0.8) | 0) +
                ")";
            }
        x += bw + r() * 6;
      }
    }
    // the park: a dark mass of dead trees and the reservoir sheen
    ctx.fillStyle = "#1e1c14";
    ctx.fillRect(0, h * 0.78, w, h * 0.22);
    for (let i = 0; i < 900; i++) {
      const x = r() * w,
        y = h * 0.74 + r() * h * 0.1;
      ctx.strokeStyle = "rgba(30,26,18,0.8)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, h * 0.8);
      ctx.lineTo(x + (r() - 0.5) * 8, y);
      ctx.stroke();
    }
    const rg = ctx.createLinearGradient(0, h * 0.82, 0, h * 0.86);
    rg.addColorStop(0, "rgba(150,170,120,0.0)");
    rg.addColorStop(0.5, "rgba(150,170,120,0.35)");
    rg.addColorStop(1, "rgba(150,170,120,0)");
    ctx.fillStyle = rg;
    ctx.fillRect(w * 0.2, h * 0.82, w * 0.5, h * 0.04);
    // haze
    const hg = ctx.createLinearGradient(0, h * 0.5, 0, h * 0.8);
    hg.addColorStop(0, "rgba(180,170,110,0)");
    hg.addColorStop(1, "rgba(180,170,110,0.25)");
    ctx.fillStyle = hg;
    ctx.fillRect(0, h * 0.5, w, h * 0.3);
  };

  // ------------------------------------------------------------------
  // Geometry helpers
  // ------------------------------------------------------------------
  /** Annular sector shape (XY) from angle aS to aE (rad), radii r0..r1. */
  X.sector = function (r0, r1, aS, aE) {
    const sh = new THREE.Shape();
    sh.moveTo(Math.cos(aS) * r1, Math.sin(aS) * r1);
    sh.absarc(0, 0, r1, aS, aE, false);
    sh.lineTo(Math.cos(aE) * r0, Math.sin(aE) * r0);
    sh.absarc(0, 0, r0, aE, aS, true);
    sh.closePath();
    return sh;
  };
  /** Flat annular sector slab: top at y, thickness t, around local centre (cx,cz). World angle a = atan2(z, x). */
  X.sectorSlab = function (b, key, cx, cz, r0, r1, aS, aE, y, t, o) {
    const g = new THREE.ExtrudeGeometry(X.sector(r0, r1, aS, aE), {
      depth: t,
      bevelEnabled: false,
      curveSegments: Math.max(3, Math.ceil((aE - aS) / 0.12)),
    });
    return b.geo(
      key,
      g,
      P.m4(cx, y, cz, 0, HP),
      Object.assign({ uv: "box" }, o || {}),
    );
  };
  /** Colliders approximating an annular sector (walkable top at y). */
  X.sectorCol = function (S, cx, cz, r0, r1, aS, aE, y, t, co) {
    const n = Math.max(1, Math.ceil((aE - aS) / 0.35));
    const da = (aE - aS) / n;
    for (let i = 0; i < n; i++) {
      const a = aS + (i + 0.5) * da;
      // two radial pieces so the outer part is wide enough
      const rm = (r0 + r1) / 2,
        rOuter = r1 - (r1 - r0) * 0.25;
      S.colR(
        cx + Math.cos(a) * rm,
        cz + Math.sin(a) * rm,
        r1 - r0,
        Math.max(0.4, rm * da * 1.15),
        y - (t || 0.3),
        y,
        -a,
        co,
      );
      S.colR(
        cx + Math.cos(a) * rOuter,
        cz + Math.sin(a) * rOuter,
        (r1 - r0) * 0.5,
        Math.max(0.4, r1 * da * 1.12),
        y - (t || 0.3),
        y,
        -a,
        co,
      );
    }
  };

  /**
   * The Ansonia-style open-well spiral stair. levels: [y0, y1, ...]; landing centred on angle a0 spanning `land` rad.
   * o: {rIn, rOut, steps (per floor), key (tread), soffit, rail (key), newel}
   * Treads rise counter-clockwise (increasing world angle) from each landing to the next.
   */
  X.spiralStair = function (S, cx, cz, levels, o) {
    o = o || {};
    const b = S.b;
    const rIn = o.rIn || 1.8,
      rOut = o.rOut || 5,
      land = o.land || PI / 3,
      a0 = o.a0 || 0,
      n = o.steps || 15;
    const key = o.key || "marble",
      rail = o.rail || "iron";
    const railPts = [];
    for (let li = 0; li < levels.length; li++) {
      const y = levels[li];
      const aS = a0 - land / 2,
        aE = a0 + land / 2;
      // landing
      if (li > 0) {
        X.sectorSlab(b, key, cx, cz, rIn, rOut, aS, aE, y, 0.3, { grime: 0.3 });
        X.sectorCol(S, cx, cz, rIn, rOut, aS, aE, y, 0.3, {
          surface: "concrete",
        });
      }
      railPts.push([aS, y]);
      railPts.push([aE, y]);
      if (li === levels.length - 1) break;
      const y1 = levels[li + 1];
      const rise = (y1 - y) / (n + 1),
        dA = (TAU - land) / n;
      for (let k = 0; k < n; k++) {
        const ta = aE + k * dA,
          tb = ta + dA,
          top = y + (k + 1) * rise,
          ac = (ta + tb) / 2;
        // tread (marble slab) + iron soffit plate + riser
        X.sectorSlab(b, key, cx, cz, rIn, rOut, ta, tb + 0.01, top, 0.1, {
          grime: 0.25,
        });
        X.sectorSlab(
          b,
          o.soffit || "iron",
          cx,
          cz,
          rIn + 0.05,
          rOut,
          ta,
          tb,
          top - 0.1,
          0.16,
          { grime: 0.4, noAO: true },
        );
        // colliders: inner and outer pieces
        const rm = (rIn + rOut) / 2,
          ro = rOut - 0.8;
        S.colR(
          cx + Math.cos(ac) * rm,
          cz + Math.sin(ac) * rm,
          rOut - rIn,
          Math.max(0.5, rm * dA * 1.2),
          top - 0.3,
          top,
          -ac,
          { surface: "concrete" },
        );
        S.colR(
          cx + Math.cos(ac) * ro,
          cz + Math.sin(ac) * ro,
          1.6,
          Math.max(0.5, rOut * dA * 1.15),
          top - 0.3,
          top,
          -ac,
          { surface: "concrete" },
        );
        // inner baluster + rail collider
        const bx = cx + Math.cos(ac) * (rIn + 0.08),
          bz = cz + Math.sin(ac) * (rIn + 0.08);
        b.rod(rail, [bx, top, bz], [bx, top + 0.95, bz], 0.018, 4, {
          noAO: true,
        });
        if (k % 3 === 1)
          b.lathe(
            rail,
            [
              [0.001, 0],
              [0.04, 0.02],
              [0.02, 0.2],
              [0.035, 0.45],
              [0.02, 0.7],
              [0.03, 0.95],
              [0.001, 0.96],
            ],
            6,
            bx,
            top,
            bz,
            { noAO: true },
          );
        S.colR(
          bx,
          bz,
          0.14,
          Math.max(0.4, rIn * dA * 1.4),
          top,
          top + 1.0,
          -ac,
          { walkable: false, tag: "rail" },
        );
        railPts.push([ac, top]);
      }
    }
    // helical handrail (brass cap over iron) along the inner edge
    railPts.sort((p, q) => p[1] - q[1] || p[0] - q[0]);
    let prev = null;
    let unwrap = 0;
    for (const [a, y] of railPts) {
      const pa = [
        cx + Math.cos(a) * (rIn + 0.08),
        y + 0.97,
        cz + Math.sin(a) * (rIn + 0.08),
      ];
      if (prev && Math.abs(y - prev[1]) < 0.7)
        b.rod(
          o.cap || "brass",
          [prev[0][0], prev[0][1], prev[0][2]],
          pa,
          0.035,
          5,
          { noAO: true },
        );
      prev = [pa, y];
      void unwrap;
    }
    // landing rails (inner edge)
    for (let li = 1; li < levels.length; li++) {
      const y = levels[li];
      const aS = a0 - land / 2,
        aE = a0 + land / 2,
        m = 5;
      for (let i = 0; i <= m; i++) {
        const a = aS + ((aE - aS) * i) / m,
          px = cx + Math.cos(a) * (rIn + 0.08),
          pz = cz + Math.sin(a) * (rIn + 0.08);
        b.rod(rail, [px, y, pz], [px, y + 0.95, pz], 0.02, 4, { noAO: true });
        if (i < m) {
          const a2 = aS + ((aE - aS) * (i + 1)) / m;
          b.rod(
            o.cap || "brass",
            [px, y + 0.97, pz],
            [
              cx + Math.cos(a2) * (rIn + 0.08),
              y + 0.97,
              cz + Math.sin(a2) * (rIn + 0.08),
            ],
            0.035,
            5,
            { noAO: true },
          );
        }
      }
      X.sectorCol(S, cx, cz, rIn - 0.05, rIn + 0.12, aS, aE, y + 1.0, 1.0, {
        walkable: false,
        tag: "rail",
      });
    }
  };

  /**
   * Round (n-gon) wall around (cx,cz), radius R, from y0 to y1, thickness t.
   * doors: [{a (angle), w, y, h}] cut from the panel nearest angle a. o.key, o.inside (key for inner skin), o.pilasters
   */
  X.roundWall = function (S, cx, cz, R, y0, y1, o) {
    o = o || {};
    const b = S.b,
      n = o.n || 12,
      t = o.t || 0.3,
      key = o.key || "plaster";
    const pw = 2 * R * Math.tan(PI / n) + 0.04;
    for (let i = 0; i < n; i++) {
      const ap = (o.a0 || 0) + (i * TAU) / n;
      const ry = -ap - HP;
      const pcx = cx + Math.cos(ap) * R,
        pcz = cz + Math.sin(ap) * R;
      const tx = -Math.sin(ap),
        tz = Math.cos(ap);
      const holes = (o.doors || [])
        .filter(
          (d) =>
            Math.abs(Math.atan2(Math.sin(d.a - ap), Math.cos(d.a - ap))) <
            PI / n,
        )
        .map((d) => [-d.w / 2, d.w / 2, d.y - y0, d.y - y0 + d.h])
        .sort((p, q) => p[2] - q[2]);
      const pieces = [];
      if (!holes.length) pieces.push([-pw / 2, pw / 2, 0, y1 - y0]);
      else {
        const hw = holes[0][1];
        pieces.push([-pw / 2, -hw, 0, y1 - y0]);
        pieces.push([hw, pw / 2, 0, y1 - y0]);
        let cur = 0;
        for (const h of holes) {
          if (h[2] > cur) pieces.push([-hw, hw, cur, h[2]]);
          cur = h[3];
        }
        if (cur < y1 - y0) pieces.push([-hw, hw, cur, y1 - y0]);
      }
      for (const pc of pieces) {
        const u = (pc[0] + pc[1]) / 2,
          w = pc[1] - pc[0];
        if (w < 0.01 || pc[3] - pc[2] < 0.01) continue;
        const px = pcx + tx * u,
          pz = pcz + tz * u;
        b.box(
          key,
          px - w / 2,
          y0 + pc[2],
          pz - t / 2,
          px + w / 2,
          y0 + pc[3],
          pz + t / 2,
          { ry, ground: o.ground === undefined ? y0 : o.ground, segLen: 2 },
        );
        if (o.col !== false)
          S.colR(px, pz, w, t, y0 + pc[2], y0 + pc[3], ry, { walkable: false });
      }
      if (o.pilasters) {
        const a2 = ap + PI / n,
          px = cx + Math.cos(a2) * (R - t / 2 - 0.08),
          pz = cz + Math.sin(a2) * (R - t / 2 - 0.08);
        b.box(o.pilasters, px - 0.2, y0, pz - 0.1, px + 0.2, y1, pz + 0.1, {
          ry: -a2 - HP,
          seg: false,
        });
      }
    }
  };

  /** Bulbous (Beaux-Arts / Ansonia) dome with lantern + finial on a drum top at (x,y,z). */
  X.dome = function (b, x, y, z, r, h, o) {
    o = o || {};
    const k = o.key || "verdigris";
    const prof0 = [
      [r * 1.02, 0],
      [r * 1.08, h * 0.12],
      [r * 1.12, h * 0.3],
      [r * 1.02, h * 0.5],
      [r * 0.78, h * 0.68],
      [r * 0.48, h * 0.82],
      [r * 0.22, h * 0.92],
      [0.001, h * 0.95],
    ];
    if (o.broken) {
      // skin torn away over part of the dome: ribs + purlins exposed, dark void inside
      b.lathe(k, prof0, o.seg || 16, x, y, z, {
        grime: 0.45,
        p0: o.brokenAt || 0,
        pl: TAU * (1 - o.broken),
      });
      b.lathe(
        "roof_tar",
        prof0.map((p) => [p[0] * 0.96, p[1] * 0.98]),
        o.seg || 16,
        x,
        y,
        z,
        {
          p0: (o.brokenAt || 0) + TAU * (1 - o.broken),
          pl: TAU * o.broken,
          noAO: true,
          uv: "box",
        },
      );
      for (let j = 1; j < 5; j++) {
        const pr = prof0[j];
        b.torus("rust", x, y + pr[1], z, pr[0], 0.05, TAU * o.broken, {
          rx: HP,
          ry: 0,
          rz: 0,
          ts: 10,
          rs: 3,
        });
      }
    } else b.lathe(k, prof0, o.seg || 16, x, y, z, { grime: 0.35 });
    // ribs
    const nr = o.ribs || 8;
    for (let i = 0; i < nr; i++) {
      const a = (i / nr) * TAU;
      const prof = [
        [1.1, 0.05],
        [1.14, 0.3],
        [1.04, 0.5],
        [0.8, 0.68],
        [0.5, 0.82],
        [0.24, 0.92],
      ];
      for (let j = 0; j < prof.length - 1; j++)
        b.rod(
          k,
          [
            x + Math.cos(a) * r * prof[j][0],
            y + h * prof[j][1],
            z + Math.sin(a) * r * prof[j][0],
          ],
          [
            x + Math.cos(a) * r * prof[j + 1][0],
            y + h * prof[j + 1][1],
            z + Math.sin(a) * r * prof[j + 1][0],
          ],
          r * 0.035,
          4,
          { noAO: true },
        );
    }
    // oculus dormers
    if (o.oculi)
      for (let i = 0; i < o.oculi; i++) {
        const a = ((i + 0.5) / o.oculi) * TAU,
          rr = r * 1.1;
        b.torus(
          o.trim || "terracotta_cream",
          x + Math.cos(a) * rr,
          y + h * 0.28,
          z + Math.sin(a) * rr,
          r * 0.16,
          r * 0.04,
          TAU,
          { ry: -a + HP, ts: 12, rs: 4 },
        );
        b.cyl(
          "glass_dark",
          x + Math.cos(a) * (rr - 0.02),
          y + h * 0.28,
          z + Math.sin(a) * (rr - 0.02),
          r * 0.15,
          r * 0.15,
          0.05,
          10,
          { rx: HP, ry: -a + HP },
        );
      }
    // lantern
    const ly = y + h * 0.92,
      lr = o.lantern || r * 0.28;
    if (lr > 0) {
      b.cyl(
        o.trim || "terracotta_cream",
        x,
        ly,
        z,
        lr * 1.2,
        lr * 1.25,
        0.25,
        12,
      );
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * TAU;
        b.cyl(
          k,
          x + Math.cos(a) * lr,
          ly + 0.25,
          z + Math.sin(a) * lr,
          0.07,
          0.08,
          lr * 2.2,
          6,
        );
      }
      b.cyl("glass_dark", x, ly + 0.25, z, lr * 0.8, lr * 0.8, lr * 2.2, 8);
      b.lathe(
        k,
        [
          [lr * 1.25, 0],
          [lr * 1.1, lr * 0.5],
          [lr * 0.6, lr * 1.0],
          [0.001, lr * 1.3],
        ],
        10,
        x,
        ly + 0.25 + lr * 2.2,
        z,
      );
      const fy = ly + 0.25 + lr * 2.2 + lr * 1.3;
      b.sphere(k, x, fy + 0.2, z, 0.22, { ws: 8, hs: 6 });
      b.cyl(k, x, fy + 0.35, z, 0.02, 0.07, o.spire || 2.4, 5);
    }
  };

  /** Window wrapped on a cylinder (tower) — glass + frame + sill, facing outward at angle a. */
  X.cylWindow = function (b, cx, cz, R, a, y, w, h, o) {
    o = o || {};
    const ry = -a - HP,
      gk =
        o.style === "broken"
          ? "glass_broken"
          : o.style === "lit"
            ? "window_lit"
            : "glass_dark";
    const at = (d) => [cx + Math.cos(a) * (R + d), cz + Math.sin(a) * (R + d)];
    let p = at(0.02);
    b.box(gk, p[0] - w / 2, y, p[1] - 0.04, p[0] + w / 2, y + h, p[1] + 0.04, {
      ry,
      seg: false,
      grime: 0.1,
      noAO: true,
    });
    if (o.style === "boarded")
      for (let i = 0; i < 3; i++) {
        p = at(0.1);
        b.box(
          "wood_rotten",
          p[0] - w / 2 - 0.05,
          y + 0.3 + (i * (h - 0.5)) / 2,
          p[1] - 0.03,
          p[0] + w / 2 + 0.05,
          y + 0.5 + (i * (h - 0.5)) / 2,
          p[1] + 0.03,
          { ry, seg: false },
        );
      }
    const fk = o.frame || "terracotta_cream";
    p = at(0.08);
    b.box(
      fk,
      p[0] - w / 2 - 0.14,
      y + h,
      p[1] - 0.12,
      p[0] + w / 2 + 0.14,
      y + h + 0.16,
      p[1] + 0.12,
      { ry, seg: false },
    );
    b.box(
      fk,
      p[0] - w / 2 - 0.12,
      y - 0.12,
      p[1] - 0.14,
      p[0] + w / 2 + 0.12,
      y,
      p[1] + 0.14,
      { ry, seg: false },
    );
    for (const s of [-1, 1]) {
      const q = [
        p[0] - Math.sin(a) * s * (w / 2 + 0.06),
        p[1] + Math.cos(a) * s * (w / 2 + 0.06),
      ];
      b.box(fk, q[0] - 0.07, y, q[1] - 0.1, q[0] + 0.07, y + h, q[1] + 0.1, {
        ry,
        seg: false,
      });
    }
    if (o.hood) {
      p = at(0.2);
      b.box(
        fk,
        p[0] - w / 2 - 0.3,
        y + h + 0.16,
        p[1] - 0.2,
        p[0] + w / 2 + 0.3,
        y + h + 0.36,
        p[1] + 0.2,
        { ry, seg: false },
      );
    }
  };
  /** Iron balcony wrapped on a cylinder over an angle range. */
  X.cylBalcony = function (S, cx, cz, R, a0, a1, y, o) {
    o = o || {};
    const b = S.b,
      key = o.key || "iron",
      n = Math.max(3, Math.ceil(((a1 - a0) * R) / 0.5));
    X.sectorSlab(
      b,
      o.slab || "terracotta_cream",
      cx,
      cz,
      R - 0.1,
      R + 0.9,
      a0,
      a1,
      y,
      0.18,
      { grime: 0.5 },
    );
    for (let i = 0; i <= n; i++) {
      const a = a0 + ((a1 - a0) * i) / n,
        px = cx + Math.cos(a) * (R + 0.85),
        pz = cz + Math.sin(a) * (R + 0.85);
      b.rod(key, [px, y, pz], [px, y + 1.0, pz], 0.015, 3, { noAO: true });
      if (i < n) {
        const a2 = a0 + ((a1 - a0) * (i + 1)) / n;
        b.rod(
          key,
          [px, y + 1.0, pz],
          [
            cx + Math.cos(a2) * (R + 0.85),
            y + 1.0,
            cz + Math.sin(a2) * (R + 0.85),
          ],
          0.025,
          3,
          { noAO: true },
        );
      }
    }
  };

  /** Bronze seal statue (the Ansonia lobby fountain). Local +z = where the seal looks. pose 'up' | 'lie' */
  X.seal = function (b, key, x, y, z, ry, s, pose) {
    s = s || 1;
    const M = P.m4(x, y, z, ry, 0, 0, s);
    const add = (g, m) =>
      b.geo(key, g, M.clone().multiply(m), { noAO: true, grime: 0.45 });
    if (pose === "lie") {
      add(
        new THREE.SphereGeometry(1, 12, 8),
        P.m4(0, 0.28, 0, 0, 0, 0, 0.32, 0.28, 0.9),
      );
      add(
        new THREE.SphereGeometry(0.2, 10, 8),
        P.m4(0, 0.42, 0.78, 0, 0, 0, 1, 0.9, 1.25),
      );
      add(new THREE.ConeGeometry(0.1, 0.16, 8).rotateX(HP), P.m4(0, 0.4, 1.02));
      for (const sd of [-1, 1])
        add(
          new THREE.BoxGeometry(0.34, 0.04, 0.16),
          P.m4(sd * 0.36, 0.08, 0.3, sd * 0.6, 0, sd * 0.3),
        );
      for (const sd of [-1, 1])
        add(
          new THREE.BoxGeometry(0.24, 0.03, 0.3),
          P.m4(sd * 0.12, 0.08, -0.95, sd * 0.4),
        );
      return;
    }
    // upright: body curves up from tail to raised head
    add(
      new THREE.SphereGeometry(1, 12, 8),
      P.m4(0, 0.38, -0.25, 0, -0.5, 0, 0.34, 0.3, 0.72),
    );
    add(
      new THREE.SphereGeometry(1, 12, 8),
      P.m4(0, 0.85, 0.12, 0, -1.1, 0, 0.27, 0.24, 0.5),
    );
    add(
      new THREE.SphereGeometry(0.19, 10, 8),
      P.m4(0, 1.32, 0.28, 0, -0.2, 0, 1, 0.95, 1.2),
    );
    add(
      new THREE.ConeGeometry(0.09, 0.18, 8).rotateX(HP),
      P.m4(0, 1.3, 0.5, 0, 0.15),
    );
    for (const sd of [-1, 1])
      add(new THREE.SphereGeometry(0.03, 5, 4), P.m4(sd * 0.09, 1.38, 0.42));
    for (const sd of [-1, 1])
      add(
        new THREE.BoxGeometry(0.36, 0.04, 0.18),
        P.m4(sd * 0.3, 0.62, 0.3, sd * 0.3, 0.5, sd * 0.6),
      );
    for (const sd of [-1, 1])
      add(
        new THREE.BoxGeometry(0.22, 0.03, 0.3),
        P.m4(sd * 0.13, 0.06, -0.85, sd * 0.35),
      );
  };

  /** Department-store mannequin (smooth, faceless). pose: 'stand'|'hip'|'wave'|'headless'|'fallen'. dress: fabric key or null */
  X.mannequin = function (b, x, y, z, ry, o) {
    o = o || {};
    const k = o.key || "mannequin",
      M = P.m4(x, y, z, ry, 0, 0, o.s || 1);
    if (o.pose === "fallen") M.multiply(P.m4(0, 0.18, 0, 0, HP * 0.98, 0.1));
    const add = (g, m, kk) =>
      b.geo(kk || k, g, M.clone().multiply(m || new THREE.Matrix4()), {
        noAO: true,
        grime: o.grime === undefined ? 0.3 : o.grime,
      });
    // stand base + rod
    if (o.pose !== "fallen" && o.stand !== false) {
      add(
        new THREE.CylinderGeometry(0.2, 0.22, 0.03, 12).translate(0, 0.015, 0),
        null,
        "chrome",
      );
      add(
        new THREE.CylinderGeometry(0.012, 0.012, 0.35, 4).translate(
          0,
          0.2,
          -0.05,
        ),
        null,
        "chrome",
      );
    }
    // legs
    for (const sd of [-1, 1])
      add(
        new THREE.CylinderGeometry(0.065, 0.045, 0.86, 7).translate(0, 0.46, 0),
        P.m4(sd * 0.09, 0.02, 0, 0, 0, sd * 0.04),
      );
    // hips, waist, chest
    add(
      new THREE.SphereGeometry(1, 10, 7),
      P.m4(0, 0.95, 0, 0, 0, 0, 0.17, 0.12, 0.12),
    );
    add(
      new THREE.CylinderGeometry(0.15, 0.12, 0.42, 9).translate(0, 0.21, 0),
      P.m4(0, 0.95, 0),
    );
    add(
      new THREE.SphereGeometry(1, 10, 7),
      P.m4(0, 1.33, 0.01, 0, 0, 0, 0.19, 0.13, 0.12),
    );
    add(
      new THREE.CylinderGeometry(0.04, 0.05, 0.12, 6).translate(0, 0.06, 0),
      P.m4(0, 1.42, 0),
    );
    if (o.pose !== "headless") {
      add(
        new THREE.SphereGeometry(0.1, 10, 8),
        P.m4(0, 1.62, 0.01, 0, 0.1, 0, 0.9, 1.2, 1),
      );
      if (o.wig)
        add(
          new THREE.SphereGeometry(0.108, 10, 6, 0, TAU, 0, PI * 0.55),
          P.m4(0, 1.64, -0.005),
          o.wig,
        );
      if (o.hat)
        add(
          new THREE.CylinderGeometry(0.16, 0.18, 0.04, 12),
          P.m4(0, 1.72, 0),
          o.hat,
        );
    }
    // arms
    const pose = o.pose || "stand";
    for (const sd of [-1, 1]) {
      const raise =
        pose === "wave" && sd > 0 ? -2.6 : pose === "hip" ? 0.5 : 0.12;
      if (o.armless && sd < 0) continue;
      add(
        new THREE.CylinderGeometry(0.035, 0.028, 0.62, 6).translate(
          0,
          -0.31,
          0,
        ),
        P.m4(sd * 0.2, 1.38, 0, 0, pose === "hip" ? 0.2 : 0, sd * raise),
      );
    }
    // garment
    if (o.dress)
      add(
        new THREE.CylinderGeometry(
          0.16,
          o.skirt ? 0.34 : 0.19,
          o.skirt ? 0.95 : 0.6,
          10,
          1,
          true,
        ).translate(0, o.skirt ? -0.05 : 0.2, 0),
        P.m4(0, o.skirt ? 1.0 : 1.05, 0),
        o.dress,
      );
    if (o.dress)
      add(
        new THREE.CylinderGeometry(0.18, 0.16, 0.36, 10, 1, true).translate(
          0,
          0.18,
          0,
        ),
        P.m4(0, 1.18, 0),
        o.dress,
      );
  };

  /** Chrome clothes rack with hanging garments. */
  X.rack = function (b, x, y, z, ry, o) {
    o = o || {};
    const M = P.m4(x, y, z, ry),
      L = o.len || 1.4,
      r = P.rng(x * 3 + z * 7);
    const add = (k, g) => b.geo(k, g, M, { noAO: true, grime: 0.35 });
    for (const s of [-1, 1]) {
      add(
        "chrome",
        new THREE.CylinderGeometry(0.015, 0.015, 1.45, 4).translate(
          (s * L) / 2,
          0.72,
          0,
        ),
      );
      add(
        "chrome",
        new THREE.BoxGeometry(0.04, 0.03, 0.5).translate((s * L) / 2, 0.02, 0),
      );
    }
    add(
      "chrome",
      new THREE.CylinderGeometry(0.012, 0.012, L, 4)
        .rotateZ(HP)
        .translate(0, 1.44, 0),
    );
    const n = Math.floor(L / 0.08);
    for (let i = 0; i < n; i++) {
      if (r() < (o.sparse || 0.3)) continue;
      const u = -L / 2 + 0.06 + (i * (L - 0.12)) / n,
        hh = 0.6 + r() * 0.45;
      add(
        "clothes",
        new THREE.BoxGeometry(0.025, hh, 0.42)
          .translate(u, 1.4 - hh / 2, 0)
          .rotateY((r() - 0.5) * 0.2),
      );
    }
    if (o.fallen)
      for (let i = 0; i < 4; i++)
        add(
          "clothes",
          new THREE.BoxGeometry(0.5, 0.03, 0.4)
            .rotateY(r() * 3)
            .translate((r() - 0.5) * L, 0.02, (r() - 0.5) * 1.2),
        );
  };

  /**
   * Escalator: from (x, y0, z) climbing toward dir ('n'|'s'|'e'|'w') to y1. Visual: steel steps, glass balustrades,
   * black rubber handrails, a steel truss underneath. Colliders: steps (walkable) + side walls.
   */
  X.escalator = function (S, x, z, dir, y0, y1, o) {
    o = o || {};
    const b = S.b,
      W = o.w || 1.3;
    const st = S.stairs("steel", x, z, dir, W, y0, y1, {
      rise: 0.25,
      run: 0.42,
      solid: false,
      nosing: "brass",
    });
    const dx = dir === "e" ? 1 : dir === "w" ? -1 : 0,
      dz = dir === "s" ? 1 : dir === "n" ? -1 : 0;
    const L = st.len,
      H = y1 - y0;
    const sx = dz ? 1 : 0,
      sz = dx ? 1 : 0; // side axis
    for (const s of [-1, 1]) {
      const ox = sx * s * (W / 2 + 0.08),
        oz = sz * s * (W / 2 + 0.08);
      // balustrade: glass panel strips + rubber handrail
      const nSeg = Math.max(2, Math.round(L / 1.2));
      for (let i = 0; i < nSeg; i++) {
        const t0 = i / nSeg,
          t1 = (i + 1) / nSeg;
        const ax = x + ox + dx * L * t0,
          az = z + oz + dz * L * t0,
          bx = x + ox + dx * L * t1,
          bz = z + oz + dz * L * t1;
        const ya = y0 + H * t0,
          yb = y0 + H * t1;
        const cx = (ax + bx) / 2,
          cz = (az + bz) / 2,
          cy = (ya + yb) / 2 + 0.5;
        const len = Math.hypot(bx - ax, bz - az, yb - ya);
        const ang = Math.atan2(yb - ya, Math.hypot(bx - ax, bz - az));
        const ryv = dx ? 0 : HP,
          rz = dx ? ang * dx : 0,
          rx = dz ? -ang * dz : 0;
        void ryv;
        b.box(
          i % 5 === 3 && o.broken ? "glass_broken" : "glass",
          cx - (dx ? len / 2 : 0.02),
          cy - 0.45,
          cz - (dz ? len / 2 : 0.02),
          cx + (dx ? len / 2 : 0.02),
          cy + 0.45,
          cz + (dz ? len / 2 : 0.02),
          { rz, rx, seg: false, noAO: true },
        );
      }
      b.rod(
        "rubber",
        [x + ox, y0 + 1.0, z + oz],
        [x + ox + dx * L, y1 + 1.0, z + oz + dz * L],
        0.045,
        5,
        { noAO: true },
      );
      b.rod(
        "steel",
        [x + ox, y0 + 0.02, z + oz],
        [x + ox + dx * L, y1 + 0.02, z + oz + dz * L],
        0.08,
        4,
        { noAO: true, square: true, r2: 0.12 },
      );
      // side collider (a rotated slab is hard: use stepped boxes)
      const n = Math.ceil(L / 0.8);
      for (let i = 0; i < n; i++) {
        const t = (i + 0.5) / n,
          px = x + ox + dx * L * t,
          pz = z + oz + dz * L * t,
          py = y0 + H * t;
        S.col(
          px - (dx ? 0.45 : 0.06),
          py - 0.6,
          pz - (dz ? 0.45 : 0.06),
          px + (dx ? 0.45 : 0.06),
          py + 1.05,
          pz + (dz ? 0.45 : 0.06),
          { walkable: false, tag: "rail" },
        );
      }
    }
    // underside truss (steel box girder)
    const n2 = 6;
    for (let i = 0; i < n2; i++) {
      const t0 = i / n2,
        t1 = (i + 1) / n2;
      b.box(
        "steel",
        Math.min(x + dx * L * t0, x + dx * L * t1) - (dx ? 0 : W / 2 + 0.1),
        y0 + H * t0 - 0.9,
        Math.min(z + dz * L * t0, z + dz * L * t1) - (dz ? 0 : W / 2 + 0.1),
        Math.max(x + dx * L * t0, x + dx * L * t1) + (dx ? 0 : W / 2 + 0.1),
        y0 + H * t1 - 0.25,
        Math.max(z + dz * L * t0, z + dz * L * t1) + (dz ? 0 : W / 2 + 0.1),
        { seg: false, grime: 0.5 },
      );
    }
    return st;
  };

  /** Shop awning (sloped canvas + valance with lettering) on a facade F at u, above y. */
  X.awning = function (S, F, u, y, w, o) {
    o = o || {};
    const b = S.b,
      depth = o.depth || 1.6,
      drop = o.drop || 0.9,
      key = o.key || "awning";
    const p0 = F.pt(u, 0),
      p1 = F.pt(u, depth);
    // canvas slope as a thin box rotated about the facade axis
    const sh = new THREE.Shape();
    sh.moveTo(0, 0);
    sh.lineTo(depth, -drop);
    sh.lineTo(depth, -drop - 0.35);
    sh.lineTo(depth - 0.05, -drop - 0.35);
    sh.lineTo(depth - 0.05, -drop - 0.02);
    sh.lineTo(0, -0.05);
    sh.closePath();
    const g = new THREE.ExtrudeGeometry(sh, { depth: w, bevelEnabled: false });
    // shape: x = out from facade, y = up; extrude along facade u
    const m = new THREE.Matrix4()
      .makeBasis(
        new THREE.Vector3(F.nx, 0, F.nz),
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(-F.dx, 0, -F.dz),
      )
      .setPosition(F.pt(u + w / 2, 0)[0], y, F.pt(u + w / 2, 0)[1]);
    b.geo(key, g, m, { uv: "box", grime: 0.4 });
    // iron frame arms
    for (const s of [-1, 1]) {
      const a = F.pt(u + s * (w / 2 - 0.05), 0),
        c = F.pt(u + s * (w / 2 - 0.05), depth);
      b.rod(
        "iron",
        [a[0], y - 0.02, a[1]],
        [c[0], y - drop - 0.02, c[1]],
        0.02,
        3,
        { noAO: true },
      );
    }
    void p0;
    void p1;
    if (o.text) {
      const tk = P.texMat(
        "awn_" + o.text + (o.fg || ""),
        P.signTex("awn_" + o.text + (o.fg || ""), [o.text], "plain", 512, 64, {
          bg: o.bg || "#18181a",
          fg: o.fg || "#e8e4dc",
          font: o.font || P.FONTS.SANS,
        }),
        { rough: 0.9 },
      );
      const q = F.pt(u, depth + 0.012);
      b.quad(tk, q[0], y - drop - 0.17, q[1], w * 0.9, 0.3, { ry: F.ry });
    }
  };

  /** NYC rooftop water tower (wooden tank on a steel frame, conical cap). */
  X.waterTower = function (b, x, y, z, o) {
    o = o || {};
    const r = o.r || 2.2,
      h = o.h || 3.6,
      legs = o.legs || 3.2;
    for (const [lx, lz] of [
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 1],
    ])
      b.rod(
        "rust",
        [x + lx * r * 0.7, y, z + lz * r * 0.7],
        [x + lx * r * 0.6, y + legs, z + lz * r * 0.6],
        0.09,
        4,
        { square: true },
      );
    for (const yy of [legs * 0.35, legs * 0.75]) {
      b.box(
        "rust",
        x - r * 0.7,
        y + yy,
        z - r * 0.7 - 0.05,
        x + r * 0.7,
        y + yy + 0.08,
        z - r * 0.7 + 0.05,
        { seg: false },
      );
      b.box(
        "rust",
        x - r * 0.7,
        y + yy,
        z + r * 0.7 - 0.05,
        x + r * 0.7,
        y + yy + 0.08,
        z + r * 0.7 + 0.05,
        { seg: false },
      );
    }
    b.box("rust", x - r, y + legs, z - r, x + r, y + legs + 0.18, z + r, {
      seg: false,
    });
    b.cyl("wood_rotten", x, y + legs + 0.18, z, r * 0.96, r, h, 16);
    for (let i = 0; i < 4; i++)
      b.torus(
        "rust",
        x,
        y + legs + 0.5 + (i * (h - 0.8)) / 3,
        z,
        r * (1.0 - i * 0.01) + 0.02,
        0.03,
        TAU,
        { rx: HP, ts: 20, rs: 3 },
      );
    b.cyl(
      "wood_rotten",
      x,
      y + legs + 0.18 + h,
      z,
      0.1,
      r * 1.08,
      r * 0.55,
      16,
    );
    b.cyl("rust", x, y + legs + 0.18 + h + r * 0.55, z, 0.06, 0.12, 0.3, 6);
    b.rod("rust", [x + r, y, z], [x + r, y + legs + h, z], 0.02, 3); // ladder rail
    for (let yy = 0.3; yy < legs + h; yy += 0.35)
      b.rod(
        "rust",
        [x + r, y + yy, z - 0.2],
        [x + r, y + yy, z + 0.2],
        0.012,
        3,
      );
  };

  /** Raised wooden farm bed full of dead crops (or live crops when o.alive). */
  X.farmBed = function (S, x0, z0, x1, z1, y, o) {
    o = o || {};
    const b = S.b,
      r = P.rng(x0 * 3 + z0 * 7 + y);
    if (!o.cropsOnly) {
      b.box("wood_rotten", x0, y, z0, x1, y + 0.5, z1, {
        seg: false,
        grime: 0.6,
      });
      b.box(
        "dirt",
        x0 + 0.08,
        y + 0.5,
        z0 + 0.08,
        x1 - 0.08,
        y + 0.54,
        z1 - 0.08,
        { seg: false, noAO: true },
      );
      if (o.col !== false)
        S.col(x0, y, z0, x1, y + 0.5, z1, { surface: "wood" });
    }
    const n = Math.floor((x1 - x0) * (z1 - z0) * (o.density || 3));
    for (let i = 0; i < n; i++) {
      const px = x0 + 0.2 + r() * (x1 - x0 - 0.4),
        pz = z0 + 0.2 + r() * (z1 - z0 - 0.4),
        hh = 0.3 + r() * (o.alive ? 0.6 : 0.8);
      const lean = (r() - 0.5) * (o.alive ? 0.3 : 0.9);
      b.rod(
        o.alive ? "foliage" : "crop_dead",
        [px, y + 0.52, pz],
        [px + lean * 0.4, y + 0.52 + hh, pz + (r() - 0.5) * 0.2],
        o.alive ? 0.02 : 0.012,
        3,
        { noAO: true },
      );
      if (o.alive && r() < 0.6)
        b.sphere(
          "foliage",
          px + lean * 0.4,
          y + 0.52 + hh,
          pz,
          0.09 + r() * 0.08,
          { ws: 5, hs: 4, noAO: true },
        );
      if (o.alive && r() < 0.15)
        b.sphere(
          r() < 0.5 ? "paint_red" : "gold",
          px,
          y + 0.52 + hh * 0.6,
          pz + 0.08,
          0.05,
          { ws: 5, hs: 4, noAO: true },
        );
    }
  };

  /** Round temple crown (tholos) of the San Remo towers: podium drum, ring of columns, entablature, domed roof, lantern. */
  X.tholos = function (S, x, y, z, R, H, o) {
    o = o || {};
    const b = S.b,
      k = o.key || "limestone_warm",
      nc = o.cols || 10;
    b.cyl(k, x, y, z, R + 0.6, R + 0.8, 0.9, 20); // stylobate
    b.cyl(k, x, y + 0.9, z, R + 0.35, R + 0.45, 0.25, 20);
    for (let i = 0; i < nc; i++) {
      const a = (i / nc) * TAU,
        px = x + Math.cos(a) * R,
        pz = z + Math.sin(a) * R;
      b.lathe(
        k,
        [
          [0.001, 0],
          [0.32, 0],
          [0.3, 0.2],
          [0.24, 0.3],
          [0.22, H - 0.7],
          [0.3, H - 0.45],
          [0.38, H - 0.2],
          [0.001, H - 0.2],
        ],
        10,
        px,
        y + 1.15,
        pz,
      );
      b.box(
        k,
        px - 0.4,
        y + 1.15 + H - 0.2,
        pz - 0.4,
        px + 0.4,
        y + 1.15 + H,
        pz + 0.4,
        { seg: false },
      );
    }
    // inner cella wall (dark windows) — the tower's water tank lives in here
    b.cyl(k, x, y + 1.15, z, R - 0.9, R - 0.9, H, 16);
    for (let i = 0; i < 4; i++)
      X.cylWindow(
        b,
        x,
        z,
        R - 0.9,
        (i / 4) * TAU + PI / 4,
        y + 1.15 + H * 0.3,
        0.8,
        H * 0.4,
        { style: i === 1 && o.lit ? "lit" : "dark", frame: k },
      );
    const ey = y + 1.15 + H;
    b.cyl(k, x, ey, z, R + 0.45, R + 0.45, 0.7, 20); // entablature
    b.cyl(k, x, ey + 0.7, z, R + 0.75, R + 0.5, 0.3, 20); // cornice
    // scalloped roof (low dome) + acroteria
    b.lathe(
      o.roof || k,
      [
        [R + 0.4, 0],
        [R * 0.9, 0.7],
        [R * 0.6, 1.3],
        [R * 0.25, 1.7],
        [0.001, 1.8],
      ],
      16,
      x,
      ey + 1.0,
      z,
    );
    for (let i = 0; i < nc; i++) {
      const a = ((i + 0.5) / nc) * TAU;
      b.cyl(
        k,
        x + Math.cos(a) * (R + 0.55),
        ey + 1.0,
        z + Math.sin(a) * (R + 0.55),
        0.03,
        0.2,
        0.45,
        4,
      );
    }
    // lantern + finial
    const ly = ey + 2.7;
    b.cyl(k, x, ly, z, 0.8, 0.9, 0.35, 12);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * TAU;
      b.cyl(
        k,
        x + Math.cos(a) * 0.62,
        ly + 0.35,
        z + Math.sin(a) * 0.62,
        0.07,
        0.08,
        1.6,
        6,
      );
    }
    b.cyl(
      o.lit ? "lamp_warm" : "glass_dark",
      x,
      ly + 0.35,
      z,
      0.45,
      0.45,
      1.6,
      8,
    );
    b.lathe(
      k,
      [
        [0.9, 0],
        [0.7, 0.4],
        [0.3, 0.8],
        [0.001, 1.0],
      ],
      10,
      x,
      ly + 1.95,
      z,
    );
    b.cyl(o.finial || "verdigris", x, ly + 2.9, z, 0.04, 0.12, 1.6, 6);
    b.sphere(o.finial || "verdigris", x, ly + 2.95, z, 0.18, { ws: 8, hs: 6 });
    if (o.lit) S.glow(x, ly + 1.1, z, 0xffc070, 2.2);
    return { top: ly + 4.5, floor: y + 1.15 };
  };

  /** Classical urn on a plinth. */
  X.urn = function (b, x, y, z, s, k) {
    s = s || 1;
    k = k || "limestone_warm";
    b.box(
      k,
      x - 0.3 * s,
      y,
      z - 0.3 * s,
      x + 0.3 * s,
      y + 0.5 * s,
      z + 0.3 * s,
      { seg: false },
    );
    b.lathe(
      k,
      [
        [0.001, 0],
        [0.18, 0],
        [0.12, 0.12],
        [0.3, 0.45],
        [0.26, 0.7],
        [0.16, 0.78],
        [0.22, 0.86],
        [0.001, 0.9],
      ].map((p) => [p[0] * s, p[1] * s]),
      10,
      x,
      y + 0.5 * s,
      z,
    );
  };

  /** Stone balustrade along a straight segment (plinth, balusters, rail) with collider. */
  X.balustrade = function (S, x0, z0, x1, z1, y, o) {
    o = o || {};
    const b = S.b,
      k = o.key || "limestone_warm",
      h = o.h || 1.0;
    const L = Math.hypot(x1 - x0, z1 - z0),
      ang = Math.atan2(z1 - z0, x1 - x0),
      cx = (x0 + x1) / 2,
      cz = (z0 + z1) / 2;
    b.box(k, cx - L / 2, y, cz - 0.2, cx + L / 2, y + 0.2, cz + 0.2, {
      ry: -ang,
      seg: false,
    });
    b.box(
      k,
      cx - L / 2,
      y + h - 0.16,
      cz - 0.22,
      cx + L / 2,
      y + h,
      cz + 0.22,
      { ry: -ang, seg: false },
    );
    const n = Math.floor(L / 0.32);
    for (let i = 0; i <= n; i++) {
      const t = i / n,
        px = x0 + (x1 - x0) * t,
        pz = z0 + (z1 - z0) * t;
      if (o.broken && P.rng(px * 7 + pz)() < o.broken) continue;
      b.lathe(
        k,
        [
          [0.001, 0],
          [0.08, 0],
          [0.05, 0.12],
          [0.09, (h - 0.36) * 0.45],
          [0.05, h - 0.4],
          [0.07, h - 0.36],
          [0.001, h - 0.36],
        ],
        6,
        px,
        y + 0.2,
        pz,
        { noAO: true },
      );
    }
    if (o.col !== false)
      S.colR(cx, cz, L, 0.4, y, y + h, -ang, { walkable: false });
  };
})();
