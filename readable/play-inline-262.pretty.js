/* src/poi_ues/06_art.js */
/* =====================================================================
 * NEW RAD CITY — POI UPPER EAST SIDE · 06 art & surfaces
 *   • Old-Masters painting atlas (4×4, all original procedural pastiches:
 *     a Delft interior with a mistress and her maid, a gold-lit self-
 *     portrait, a saint in a rocky desert, a Tudor statesman on green,
 *     a golden harbour, rococo garden panels, a society portrait, the
 *     founder, a butler robot in oils, a slashed canvas …)
 *   • Design-museum posters, voting posters, regimental banners
 *   • Extra surfaces: ashlar limestone, Flemish-bond brick, yellow
 *     clapboard, damask wall silks, carved teak, marble checkerboard,
 *     scenic "Zuber" wallpaper, travertine, drill-hall floorboards.
 * Registers the extra materials into the shared P.MAT/P.CUSTOM tables
 * (materials are created lazily, so adding here before init is safe).
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE || !G._ues) return;
  const P = G._ues,
    D = P.dress;
  const TAU = P.TAU,
    PI = P.PI;

  // ------------------------------------------------------------------
  // small canvas helpers
  // ------------------------------------------------------------------
  function figure(ctx, x, y, s, o) {
    // a painted standing/half figure: body (dress/robe), head, optional hat/ruff
    o = o || {};
    ctx.fillStyle = o.body || "#3a2a1a";
    ctx.beginPath();
    ctx.moveTo(x - s * 0.22, y);
    ctx.quadraticCurveTo(
      x - s * 0.3,
      y + s * 0.6,
      x - s * 0.36,
      y + s * (o.full ? 1.6 : 1.0),
    );
    ctx.lineTo(x + s * 0.36, y + s * (o.full ? 1.6 : 1.0));
    ctx.quadraticCurveTo(x + s * 0.3, y + s * 0.6, x + s * 0.22, y);
    ctx.closePath();
    ctx.fill();
    if (o.collar) {
      ctx.fillStyle = o.collar;
      ctx.beginPath();
      ctx.ellipse(x, y + s * 0.04, s * 0.2, s * 0.07, 0, 0, TAU);
      ctx.fill();
    }
    ctx.fillStyle = o.skin || "#d8a882";
    ctx.beginPath();
    ctx.ellipse(x, y - s * 0.16, s * 0.12, s * 0.16, 0, 0, TAU);
    ctx.fill();
    // modelling shadow
    const g = ctx.createRadialGradient(
      x - s * 0.05,
      y - s * 0.2,
      s * 0.02,
      x,
      y - s * 0.16,
      s * 0.18,
    );
    g.addColorStop(0, "rgba(255,240,210,0.35)");
    g.addColorStop(1, "rgba(40,20,10,0.35)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(x, y - s * 0.16, s * 0.12, s * 0.16, 0, 0, TAU);
    ctx.fill();
    if (o.hair) {
      ctx.fillStyle = o.hair;
      ctx.beginPath();
      ctx.ellipse(x, y - s * 0.26, s * 0.13, s * 0.08, 0, PI, TAU);
      ctx.fill();
    }
    if (o.hat) {
      ctx.fillStyle = o.hat;
      ctx.beginPath();
      ctx.ellipse(x, y - s * 0.3, s * 0.2, s * 0.06, 0, 0, TAU);
      ctx.fill();
      ctx.fillRect(x - s * 0.11, y - s * 0.42, s * 0.22, s * 0.12);
    }
  }
  function varnish(ctx, x, y, w, h, r, k) {
    const g = ctx.createRadialGradient(
      x + w / 2,
      y + h / 2,
      Math.min(w, h) * 0.2,
      x + w / 2,
      y + h / 2,
      Math.max(w, h) * 0.75,
    );
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(1, "rgba(20,12,4," + 0.45 * (k || 1) + ")");
    ctx.fillStyle = g;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = "rgba(140,100,30,0.16)";
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = "rgba(25,15,5,0.22)";
    ctx.lineWidth = 0.6;
    for (let i = 0; i < 90; i++) {
      const px = x + r() * w,
        py = y + r() * h;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px + (r() - 0.5) * 12, py + (r() - 0.5) * 12);
      ctx.stroke();
    }
  }

  // ------------------------------------------------------------------
  // Old Masters atlas — 16 cells (4×4), 256×256 each
  // ------------------------------------------------------------------
  const MASTER_NAMES = [
    "Mistress and Maid",
    "Self-Portrait with Gold Light",
    "St. Francis in the Desert",
    "Portrait of a Statesman",
    "Harbour at Dawn",
    "The Progress of Love",
    "Lady in Grey",
    "Portrait of a King",
    "Village with Water Mill",
    "The Forge",
    "Cleansing of the Temple",
    "Comtesse in Blue",
    "Henry Clay Frick (1910)",
    "Rocket to Tomorrow",
    "Slashed Canvas",
    "Ambrose, Head of Household (1961)",
  ];
  P.MASTER_NAMES = MASTER_NAMES;
  D.masterTex = function () {
    return P.canvasTex("ues_masters", 1024, 1024, (ctx, w, h) => {
      const r = P.rng("masters");
      const cw = w / 4,
        ch = h / 4;
      const scenes = [
        (x, y) => {
          // 0 Delft interior: mistress in yellow jacket + maid with a letter
          ctx.fillStyle = "#1a1712";
          ctx.fillRect(x, y, cw, ch);
          const g = ctx.createRadialGradient(
            x + cw * 0.2,
            y + ch * 0.3,
            5,
            x + cw * 0.3,
            y + ch * 0.4,
            cw * 0.8,
          );
          g.addColorStop(0, "rgba(220,200,150,0.35)");
          g.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = g;
          ctx.fillRect(x, y, cw, ch);
          ctx.fillStyle = "#2c3a58";
          ctx.fillRect(x, y + ch * 0.72, cw, ch * 0.28); // table cloth
          figure(ctx, x + cw * 0.36, y + ch * 0.46, cw * 0.55, {
            body: "#d8b030",
            collar: "#f0ead8",
            skin: "#e8c8a8",
            hair: "#6a4a2a",
          });
          ctx.fillStyle = "#d8b030";
          for (let i = 0; i < 12; i++) {
            ctx.fillStyle = "#f4f0e0";
            ctx.fillRect(x + cw * 0.22 + i * 5, y + ch * 0.58, 2, 2);
          }
          figure(ctx, x + cw * 0.72, y + ch * 0.44, cw * 0.5, {
            body: "#6a5038",
            skin: "#c89a78",
            collar: "#c8b898",
          });
          ctx.fillStyle = "#f0ead0";
          ctx.fillRect(x + cw * 0.62, y + ch * 0.52, cw * 0.08, ch * 0.05); // the letter
          ctx.fillStyle = "#c8c0b0";
          ctx.beginPath();
          ctx.arc(x + cw * 0.2, y + ch * 0.8, 8, 0, TAU);
          ctx.fill(); // pearl box / jug
        },
        (x, y) => {
          // 1 self-portrait, gold light out of darkness
          ctx.fillStyle = "#140e08";
          ctx.fillRect(x, y, cw, ch);
          const g = ctx.createRadialGradient(
            x + cw * 0.5,
            y + ch * 0.4,
            5,
            x + cw * 0.5,
            y + ch * 0.5,
            cw * 0.6,
          );
          g.addColorStop(0, "rgba(200,140,60,0.45)");
          g.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = g;
          ctx.fillRect(x, y, cw, ch);
          figure(ctx, x + cw * 0.5, y + ch * 0.5, cw * 0.9, {
            body: "#b88a2a",
            collar: "#8a2a1a",
            skin: "#d8a060",
            hat: "#1a120a",
          });
          ctx.fillStyle = "#6a1a10";
          ctx.fillRect(x + cw * 0.3, y + ch * 0.78, cw * 0.4, ch * 0.06); // sash
          ctx.fillStyle = "#3a2410";
          ctx.fillRect(x + cw * 0.46, y + ch * 0.82, cw * 0.05, ch * 0.18); // cane
        },
        (x, y) => {
          // 2 saint in the desert: rocky cliffs, brown robe, golden light, blue sky
          const g = ctx.createLinearGradient(0, y, 0, y + ch);
          g.addColorStop(0, "#5a8ac8");
          g.addColorStop(0.5, "#d8e0d8");
          g.addColorStop(0.51, "#b8a070");
          g.addColorStop(1, "#6a5a38");
          ctx.fillStyle = g;
          ctx.fillRect(x, y, cw, ch);
          ctx.fillStyle = "#8a7a5a";
          ctx.beginPath();
          ctx.moveTo(x, y + ch);
          ctx.lineTo(x, y + ch * 0.25);
          ctx.lineTo(x + cw * 0.18, y + ch * 0.18);
          ctx.lineTo(x + cw * 0.34, y + ch * 0.45);
          ctx.lineTo(x + cw * 0.3, y + ch);
          ctx.fill();
          ctx.fillStyle = "#9a8a60";
          ctx.beginPath();
          ctx.moveTo(x + cw * 0.6, y + ch * 0.55);
          ctx.lineTo(x + cw * 0.8, y + ch * 0.3);
          ctx.lineTo(x + cw, y + ch * 0.4);
          ctx.lineTo(x + cw, y + ch * 0.62);
          ctx.fill();
          ctx.fillStyle = "#e8d8a0";
          ctx.fillRect(x + cw * 0.7, y + ch * 0.3, cw * 0.08, ch * 0.05);
          ctx.fillRect(x + cw * 0.82, y + ch * 0.28, cw * 0.05, ch * 0.08); // hill town
          figure(ctx, x + cw * 0.5, y + ch * 0.58, cw * 0.5, {
            body: "#5a3a22",
            skin: "#d8b090",
            full: false,
          });
          ctx.strokeStyle = "#3a2a1a";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(x + cw * 0.35, y + ch * 0.62);
          ctx.lineTo(x + cw * 0.38, y + ch * 0.48);
          ctx.moveTo(x + cw * 0.65, y + ch * 0.62);
          ctx.lineTo(x + cw * 0.62, y + ch * 0.48);
          ctx.stroke(); // outstretched arms
          const s = ctx.createRadialGradient(
            x + cw * 0.05,
            y + ch * 0.05,
            2,
            x + cw * 0.05,
            y + ch * 0.05,
            cw * 0.5,
          );
          s.addColorStop(0, "rgba(255,240,180,0.7)");
          s.addColorStop(1, "rgba(255,240,180,0)");
          ctx.fillStyle = s;
          ctx.fillRect(x, y, cw, ch);
          ctx.fillStyle = "#4a6a2a";
          ctx.beginPath();
          ctx.arc(x + cw * 0.2, y + ch * 0.2, 12, 0, TAU);
          ctx.fill(); // laurel
          ctx.fillStyle = "#8a8a88";
          ctx.beginPath();
          ctx.ellipse(x + cw * 0.85, y + ch * 0.8, 12, 7, 0, 0, TAU);
          ctx.fill(); // donkey
        },
        (x, y) => {
          // 3 Tudor statesman: green ground, fur collar, red velvet sleeves, gold chain
          ctx.fillStyle = "#1e4a3a";
          ctx.fillRect(x, y, cw, ch);
          ctx.fillStyle = "#7a1a1a";
          ctx.fillRect(x, y, cw * 0.18, ch * 0.5); // curtain
          figure(ctx, x + cw * 0.5, y + ch * 0.44, cw * 0.95, {
            body: "#2a1a12",
            collar: "#5a4030",
            skin: "#d8a888",
            hat: "#141010",
          });
          ctx.fillStyle = "#8a1e1a";
          ctx.fillRect(x + cw * 0.18, y + ch * 0.72, cw * 0.18, ch * 0.28);
          ctx.fillRect(x + cw * 0.64, y + ch * 0.72, cw * 0.18, ch * 0.28);
          ctx.strokeStyle = "#d8b040";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(x + cw * 0.5, y + ch * 0.46, cw * 0.16, 0.2, PI - 0.2);
          ctx.stroke();
          ctx.fillStyle = "#d8b040";
          ctx.beginPath();
          ctx.arc(x + cw * 0.5, y + ch * 0.64, 6, 0, TAU);
          ctx.fill();
        },
        (x, y) => {
          // 4 golden harbour at dawn
          const g = ctx.createLinearGradient(0, y, 0, y + ch);
          g.addColorStop(0, "#e8c070");
          g.addColorStop(0.5, "#f4e0a0");
          g.addColorStop(0.6, "#a89868");
          g.addColorStop(1, "#5a5a48");
          ctx.fillStyle = g;
          ctx.fillRect(x, y, cw, ch);
          const s = ctx.createRadialGradient(
            x + cw * 0.55,
            y + ch * 0.42,
            2,
            x + cw * 0.55,
            y + ch * 0.42,
            cw * 0.4,
          );
          s.addColorStop(0, "rgba(255,250,220,0.95)");
          s.addColorStop(1, "rgba(255,240,200,0)");
          ctx.fillStyle = s;
          ctx.fillRect(x, y, cw, ch);
          for (let i = 0; i < 4; i++) {
            const sx = x + cw * (0.1 + i * 0.22),
              sy = y + ch * (0.55 + (i % 2) * 0.06);
            ctx.fillStyle = "rgba(60,40,30,0.7)";
            ctx.fillRect(sx, sy, cw * 0.12, ch * 0.04);
            ctx.fillRect(sx + cw * 0.05, sy - ch * 0.25, 2, ch * 0.25);
            ctx.fillStyle = "rgba(230,210,170,0.6)";
            ctx.fillRect(sx + cw * 0.01, sy - ch * 0.2, cw * 0.04, ch * 0.14);
          }
        },
        (x, y) => {
          // 5 rococo garden: pink & green, lovers, frothy trees
          ctx.fillStyle = "#9ab8a8";
          ctx.fillRect(x, y, cw, ch);
          for (let i = 0; i < 40; i++) {
            ctx.fillStyle = ["#5a7a4a", "#7a9a5a", "#4a6a3a", "#a8b878"][i % 4];
            ctx.beginPath();
            ctx.arc(x + r() * cw, y + r() * ch * 0.6, 14 + r() * 24, 0, TAU);
            ctx.fill();
          }
          ctx.fillStyle = "#d8c8a8";
          ctx.fillRect(x + cw * 0.62, y + ch * 0.2, cw * 0.1, ch * 0.5); // statue plinth
          figure(ctx, x + cw * 0.35, y + ch * 0.55, cw * 0.4, {
            body: "#f0b8b8",
            skin: "#f0d0b8",
            hair: "#c8a878",
            full: true,
          });
          figure(ctx, x + cw * 0.52, y + ch * 0.55, cw * 0.38, {
            body: "#d8a040",
            skin: "#e0b898",
            hair: "#6a4a2a",
            full: true,
          });
          for (let i = 0; i < 30; i++) {
            ctx.fillStyle = "rgba(255,200,210,0.6)";
            ctx.beginPath();
            ctx.arc(x + r() * cw, y + r() * ch * 0.5, 3, 0, TAU);
            ctx.fill();
          }
        },
        (x, y) => {
          // 6 full-length society lady in grey
          ctx.fillStyle = "#3a3a38";
          ctx.fillRect(x, y, cw, ch);
          const g = ctx.createLinearGradient(x, 0, x + cw, 0);
          g.addColorStop(0, "rgba(0,0,0,0.3)");
          g.addColorStop(1, "rgba(90,90,85,0.3)");
          ctx.fillStyle = g;
          ctx.fillRect(x, y, cw, ch);
          figure(ctx, x + cw * 0.5, y + ch * 0.3, cw * 0.45, {
            body: "#8a8a88",
            skin: "#e8d0c0",
            hair: "#2a2018",
            full: true,
            collar: "#c8c8c0",
          });
          ctx.fillStyle = "#1a1a1a";
          ctx.fillRect(x + cw * 0.2, y + ch * 0.9, cw * 0.6, ch * 0.1);
        },
        (x, y) => {
          // 7 king in red and silver
          ctx.fillStyle = "#2a2420";
          ctx.fillRect(x, y, cw, ch);
          figure(ctx, x + cw * 0.5, y + ch * 0.38, cw * 0.62, {
            body: "#a82a22",
            collar: "#e0dcd0",
            skin: "#e8c0a0",
            hair: "#c8a060",
          });
          for (let i = 0; i < 20; i++) {
            ctx.fillStyle = "rgba(230,230,230,0.7)";
            ctx.fillRect(
              x + cw * (0.34 + r() * 0.32),
              y + ch * (0.45 + r() * 0.4),
              3,
              6,
            );
          }
          ctx.fillStyle = "#1a1410";
          ctx.fillRect(x + cw * 0.7, y + ch * 0.6, cw * 0.05, ch * 0.3);
        },
        (x, y) => {
          // 8 Dutch village with water mill
          const g = ctx.createLinearGradient(0, y, 0, y + ch);
          g.addColorStop(0, "#a8b8c8");
          g.addColorStop(0.45, "#e8e0c8");
          g.addColorStop(0.46, "#5a6a3a");
          g.addColorStop(1, "#3a4a28");
          ctx.fillStyle = g;
          ctx.fillRect(x, y, cw, ch);
          for (let i = 0; i < 12; i++) {
            ctx.fillStyle = "#3a4a2a";
            ctx.beginPath();
            ctx.arc(
              x + cw * (0.5 + r() * 0.5),
              y + ch * (0.25 + r() * 0.2),
              12 + r() * 14,
              0,
              TAU,
            );
            ctx.fill();
          }
          ctx.fillStyle = "#8a4a2a";
          ctx.fillRect(x + cw * 0.12, y + ch * 0.4, cw * 0.28, ch * 0.2);
          ctx.fillStyle = "#5a2a1a";
          ctx.beginPath();
          ctx.moveTo(x + cw * 0.1, y + ch * 0.4);
          ctx.lineTo(x + cw * 0.26, y + ch * 0.28);
          ctx.lineTo(x + cw * 0.42, y + ch * 0.4);
          ctx.fill();
          ctx.strokeStyle = "#4a3a2a";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(x + cw * 0.44, y + ch * 0.58, 16, 0, TAU);
          ctx.stroke();
          ctx.fillStyle = "#6a7a88";
          ctx.fillRect(x, y + ch * 0.7, cw, ch * 0.1);
        },
        (x, y) => {
          // 9 the forge — dark, three smiths, orange heat
          ctx.fillStyle = "#16100c";
          ctx.fillRect(x, y, cw, ch);
          const s = ctx.createRadialGradient(
            x + cw * 0.5,
            y + ch * 0.7,
            2,
            x + cw * 0.5,
            y + ch * 0.7,
            cw * 0.4,
          );
          s.addColorStop(0, "rgba(255,160,60,0.9)");
          s.addColorStop(1, "rgba(255,120,30,0)");
          ctx.fillStyle = s;
          ctx.fillRect(x, y, cw, ch);
          for (const fx of [0.28, 0.5, 0.72])
            figure(ctx, x + cw * fx, y + ch * 0.45, cw * 0.36, {
              body: "#4a3a2a",
              skin: "#b87850",
              full: true,
            });
          ctx.strokeStyle = "#2a2018";
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(x + cw * 0.3, y + ch * 0.35);
          ctx.lineTo(x + cw * 0.45, y + ch * 0.2);
          ctx.stroke();
        },
        (x, y) => {
          // 10 elongated figures, cold blues and acid yellows
          ctx.fillStyle = "#2a3448";
          ctx.fillRect(x, y, cw, ch);
          for (let i = 0; i < 7; i++)
            figure(
              ctx,
              x + cw * (0.12 + i * 0.13),
              y + ch * (0.3 + (i % 2) * 0.05),
              cw * 0.3,
              {
                body: ["#c8c030", "#3a5a9a", "#b83a2a", "#6a8a4a"][i % 4],
                skin: "#c8a888",
                full: true,
              },
            );
          ctx.fillStyle = "rgba(230,230,210,0.2)";
          ctx.fillRect(x, y, cw, ch * 0.2);
        },
        (x, y) => {
          // 11 comtesse in blue satin
          ctx.fillStyle = "#3a3830";
          ctx.fillRect(x, y, cw, ch);
          ctx.fillStyle = "#8a7a5a";
          ctx.fillRect(x + cw * 0.72, y, cw * 0.28, ch); // mirror frame
          figure(ctx, x + cw * 0.42, y + ch * 0.4, cw * 0.62, {
            body: "#4a70a8",
            skin: "#f0dcc8",
            hair: "#3a2418",
          });
          ctx.fillStyle = "rgba(255,255,255,0.3)";
          for (let i = 0; i < 6; i++)
            ctx.fillRect(
              x + cw * (0.25 + r() * 0.3),
              y + ch * (0.5 + r() * 0.4),
              2,
              14,
            );
        },
        (x, y) => {
          // 12 the founder, dark suit, white moustache
          ctx.fillStyle = "#241c14";
          ctx.fillRect(x, y, cw, ch);
          figure(ctx, x + cw * 0.5, y + ch * 0.46, cw * 0.95, {
            body: "#16120e",
            collar: "#e8e4d8",
            skin: "#d8b098",
            hair: "#e8e4dc",
          });
          ctx.fillStyle = "#f0ece4";
          ctx.beginPath();
          ctx.ellipse(
            x + cw * 0.5,
            y + ch * 0.36,
            cw * 0.06,
            ch * 0.02,
            0,
            0,
            TAU,
          );
          ctx.fill(); // moustache
          ctx.fillStyle = "#8a6a2a";
          ctx.fillRect(x + cw * 0.56, y + ch * 0.62, 3, ch * 0.06); // watch chain
        },
        (x, y) => {
          // 13 atomic-age commission: rocket over a gleaming city (Civil Defense lobby art)
          const g = ctx.createLinearGradient(0, y, 0, y + ch);
          g.addColorStop(0, "#1a3a6a");
          g.addColorStop(1, "#e8a860");
          ctx.fillStyle = g;
          ctx.fillRect(x, y, cw, ch);
          for (let i = 0; i < 9; i++) {
            ctx.fillStyle = ["#e8e0c8", "#c8d8e8", "#a8c0d8"][i % 3];
            const bw = cw * 0.08,
              bh = ch * (0.2 + r() * 0.4);
            ctx.fillRect(x + (i * cw) / 9, y + ch - bh, bw, bh);
          }
          ctx.fillStyle = "#d83a2a";
          ctx.beginPath();
          ctx.ellipse(
            x + cw * 0.6,
            y + ch * 0.32,
            cw * 0.05,
            ch * 0.16,
            0.5,
            0,
            TAU,
          );
          ctx.fill();
          ctx.fillStyle = "#f4d060";
          ctx.beginPath();
          ctx.moveTo(x + cw * 0.52, y + ch * 0.46);
          ctx.lineTo(x + cw * 0.42, y + ch * 0.62);
          ctx.lineTo(x + cw * 0.5, y + ch * 0.5);
          ctx.fill();
        },
        (x, y) => {
          // 14 slashed canvas (a portrait, knifed, raider tag)
          ctx.fillStyle = "#3a2c20";
          ctx.fillRect(x, y, cw, ch);
          figure(ctx, x + cw * 0.5, y + ch * 0.45, cw * 0.8, {
            body: "#2a1e16",
            skin: "#c8a080",
            collar: "#d8d0c0",
          });
          ctx.strokeStyle = "#0a0806";
          ctx.lineWidth = 7;
          for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(x + cw * (0.2 + i * 0.2), y + ch * 0.1);
            ctx.lineTo(x + cw * (0.35 + i * 0.2), y + ch * 0.9);
            ctx.stroke();
          }
          ctx.fillStyle = "#c42a1e";
          ctx.font = "bold 42px Impact, sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("MINE", x + cw / 2, y + ch * 0.58);
        },
        (x, y) => {
          // 15 formal portrait of a Valet butler, bow tie, gilt chair
          ctx.fillStyle = "#2a2a24";
          ctx.fillRect(x, y, cw, ch);
          ctx.fillStyle = "#6a1a1a";
          ctx.fillRect(x, y, cw, ch * 0.18);
          ctx.fillStyle = "#9aa0a0";
          ctx.beginPath();
          ctx.arc(x + cw * 0.5, y + ch * 0.5, cw * 0.2, 0, TAU);
          ctx.fill();
          const g = ctx.createRadialGradient(
            x + cw * 0.45,
            y + ch * 0.45,
            2,
            x + cw * 0.5,
            y + ch * 0.5,
            cw * 0.2,
          );
          g.addColorStop(0, "rgba(255,255,255,0.5)");
          g.addColorStop(1, "rgba(0,0,0,0.3)");
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(x + cw * 0.5, y + ch * 0.5, cw * 0.2, 0, TAU);
          ctx.fill();
          for (const a of [-0.5, 0, 0.5]) {
            ctx.strokeStyle = "#7a8080";
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(x + cw * 0.5, y + ch * 0.35);
            ctx.lineTo(x + cw * (0.5 + a * 0.4), y + ch * 0.15);
            ctx.stroke();
            ctx.fillStyle = "#e8e8d8";
            ctx.beginPath();
            ctx.arc(x + cw * (0.5 + a * 0.4), y + ch * 0.15, 7, 0, TAU);
            ctx.fill();
          }
          ctx.fillStyle = "#101010";
          ctx.beginPath();
          ctx.moveTo(x + cw * 0.42, y + ch * 0.68);
          ctx.lineTo(x + cw * 0.5, y + ch * 0.72);
          ctx.lineTo(x + cw * 0.42, y + ch * 0.76);
          ctx.moveTo(x + cw * 0.58, y + ch * 0.68);
          ctx.lineTo(x + cw * 0.5, y + ch * 0.72);
          ctx.lineTo(x + cw * 0.58, y + ch * 0.76);
          ctx.fill();
          ctx.fillStyle = "#ffb040";
          ctx.beginPath();
          ctx.moveTo(x + cw * 0.46, y + ch * 0.74);
          ctx.lineTo(x + cw * 0.54, y + ch * 0.74);
          ctx.lineTo(x + cw * 0.5, y + ch * 0.92);
          ctx.fill();
        },
      ];
      scenes.forEach((f, i) => {
        const x = (i % 4) * cw,
          y = Math.floor(i / 4) * ch;
        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y, cw, ch);
        ctx.clip();
        try {
          f(x, y);
        } catch (e) {
          /* keep atlas */
        }
        varnish(ctx, x, y, cw, ch, r, i === 13 ? 0.5 : 1);
        ctx.restore();
      });
    });
  };
  /** Framed Old Master (cell 0..15), facing ry (0 → +z). o: {frame, ft, deep}. */
  D.master = function (b, x, y, z, w, h, ry, cell, o) {
    o = o || {};
    const k = P.texMat("ues_masters", D.masterTex(), { rough: 0.55 });
    const cx = cell % 4,
      cy = Math.floor(cell / 4);
    const m = P.m4(x, y, z, ry);
    b.geo(
      k,
      new THREE.PlaneGeometry(w, h),
      m.clone().multiply(P.m4(0, 0, 0.04)),
      {
        uv: "keep",
        uvRect: [cx / 4, 1 - (cy + 1) / 4, (cx + 1) / 4, 1 - cy / 4],
        noAO: true,
        grime: 0.05,
      },
    );
    const fk = o.frame || "gold",
      ft = o.ft || Math.max(0.08, Math.min(w, h) * 0.08),
      fd = o.deep || 0.09;
    for (const s of [-1, 1]) {
      b.geo(
        fk,
        new THREE.BoxGeometry(w + ft * 2, ft, fd),
        m.clone().multiply(P.m4(0, s * (h / 2 + ft / 2), fd / 2)),
        { noAO: true },
      );
      b.geo(
        fk,
        new THREE.BoxGeometry(ft, h, fd),
        m.clone().multiply(P.m4(s * (w / 2 + ft / 2), 0, fd / 2)),
        { noAO: true },
      );
      // inner bead
      b.geo(
        fk,
        new THREE.BoxGeometry(w, 0.025, 0.03),
        m.clone().multiply(P.m4(0, s * (h / 2 - 0.01), 0.055)),
        { noAO: true },
      );
    }
  };
  /** An empty gilt frame (for stolen works) — canvas missing, faded patch on the wall behind. */
  D.emptyFrame = function (b, x, y, z, w, h, ry, o) {
    o = o || {};
    const m = P.m4(x, y, z, ry),
      ft = Math.max(0.08, Math.min(w, h) * 0.08);
    b.geo(
      o.patch || "plaster_cream",
      new THREE.PlaneGeometry(w + 0.1, h + 0.1),
      m.clone().multiply(P.m4(0, 0, 0.012)),
      { noAO: true, grime: 0, c: 0xfff4dc },
    );
    for (const s of [-1, 1]) {
      b.geo(
        "gold",
        new THREE.BoxGeometry(w + ft * 2, ft, 0.09),
        m.clone().multiply(P.m4(0, s * (h / 2 + ft / 2), 0.045)),
        { noAO: true },
      );
      b.geo(
        "gold",
        new THREE.BoxGeometry(ft, h, 0.09),
        m.clone().multiply(P.m4(s * (w / 2 + ft / 2), 0, 0.045)),
        { noAO: true },
      );
    }
  };

  // ------------------------------------------------------------------
  // posters & banners
  // ------------------------------------------------------------------
  P.uesPoster = function (key) {
    const defs = {
      frick_hours: [
        [
          "THE FRICK COLLECTION",
          "Open 10 to 6",
          "Closed Mondays",
          "Children under ten not admitted",
        ],
        "#e4dcc4",
        "#3a2a1a",
      ],
      frick_robot: [
        [
          "NOTICE TO VISITORS",
          "Your Visit Is Supervised by",
          "American Automaton Attendants",
          "Please Do Not Touch The Art",
          "Or The Attendants",
        ],
        "#d8d0b8",
        "#6a1a14",
      ],
      cooper_streamline: [
        [
          "STREAMLINE!",
          "The Shape of Tomorrow",
          "Cooper-Hewitt Museum",
          "Fall 1967",
        ],
        "#e8c860",
        "#1a2a4a",
      ],
      cooper_cryo: [
        [
          "THE LONG WINTER",
          "Design for the",
          "Sleeper Suite",
          "Gallery 3 — Now Open",
        ],
        "#d4d2c8",
        "#c8562a",
      ],
      cooper_chairs: [
        ["SIT DOWN, AMERICA", "A Century of Chairs", "1867 — 1967"],
        "#c85a3a",
        "#f4ead0",
      ],
      vote_1: [
        [
          "VOTE!",
          "Election Day",
          "November 2, 1965",
          "Your Ballot Is Your Bomb Shelter",
        ],
        "#e8e0cc",
        "#1a3a7a",
      ],
      vote_2: [
        ["RE-ELECT", "WHITCOMBE", "Steady Hands", "For Uncertain Times"],
        "#1a3a7a",
        "#f0e8d0",
      ],
      vote_3: [
        ["DELGADO", "For Mayor", "The Future Is", "Everyone's"],
        "#b8402a",
        "#f4ecd8",
      ],
      polling: [
        [
          "POLLING PLACE",
          "Election District 73",
          "Assembly District 66",
          "Enter Here",
        ],
        "#f0ece0",
        "#1a1a1a",
      ],
      seventh: [
        ["SEVENTH REGIMENT", "N.Y.N.G.", "Pro Patria et Gloria"],
        "#8a8a8a",
        "#1a1a1a",
      ],
      hired: [
        ["THE SEVENTH", "Hiring Guns", "Paying Scrip", "Asking Nothing"],
        "#3a3a2a",
        "#d8c060",
      ],
      mayor: [
        [
          "CITY OF NEW YORK",
          "OFFICE OF THE MAYOR",
          "Temporary Seat of Government",
        ],
        "#e8e0cc",
        "#1a3a7a",
      ],
    };
    const d = defs[key] || [["NOTICE"], "#ddd", "#222"];
    return P.signTex("ues_poster_" + key, d[0], "poster", 320, 480, {
      bg: d[1],
      fg: d[2],
      art: (ctx, w, h, r) => {
        ctx.fillStyle = d[2];
        if (key.indexOf("vote") === 0 || key === "polling" || key === "mayor") {
          // stars & stripes band
          for (let i = 0; i < 5; i++) {
            ctx.fillStyle = i % 2 ? "#b82a22" : "#f4ecd8";
            ctx.fillRect(0, h * 0.78 + i * 10, w, 10);
          }
          ctx.fillStyle = "#1a3a7a";
          ctx.fillRect(0, h * 0.78, w * 0.3, 50);
        } else if (key.indexOf("cooper") === 0) {
          ctx.strokeStyle = d[2];
          ctx.lineWidth = 5;
          for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            ctx.moveTo(30, h * 0.66 + i * 16);
            ctx.lineTo(w - 30 - i * 30, h * 0.66 + i * 16);
            ctx.stroke();
          }
          ctx.beginPath();
          ctx.ellipse(w * 0.6, h * 0.72, 60, 22, -0.1, 0, TAU);
          ctx.stroke();
        } else if (key === "seventh" || key === "hired") {
          ctx.beginPath();
          ctx.moveTo(w / 2, h * 0.6);
          ctx.lineTo(w / 2 + 40, h * 0.7);
          ctx.lineTo(w / 2 + 25, h * 0.86);
          ctx.lineTo(w / 2 - 25, h * 0.86);
          ctx.lineTo(w / 2 - 40, h * 0.7);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = key === "hired" ? "#d8c060" : "#f4ecd8";
          ctx.font = "bold 40px serif";
          ctx.textAlign = "center";
          ctx.fillText("VII", w / 2, h * 0.78);
        } else {
          ctx.strokeStyle = d[2];
          ctx.lineWidth = 3;
          ctx.strokeRect(20, h * 0.62, w - 40, h * 0.3);
        }
        void r;
      },
    });
  };
  /** Wall poster quad (portrait 0.64×0.96 by default). */
  D.poster = function (b, key, x, y, z, ry, s) {
    s = s || 1;
    const k = P.texMat("ues_poster_" + key, P.uesPoster(key), {
      rough: 0.9,
      transparent: false,
    });
    b.quad(k, x, y, z, 0.64 * s, 0.96 * s, { ry });
  };
  /** Painted/engraved sign quad. */
  D.sign = function (b, key, lines, style, x, y, z, w, h, ry, o) {
    const k = P.texMat(
      "ues_s_" + key,
      P.signTex(
        "ues_s_" + key,
        lines,
        style,
        (o && o.tw) || 1024,
        (o && o.th) || Math.max(64, Math.round((1024 * h) / w)),
        o,
      ),
      {
        rough: 0.8,
        transparent: style === "raider" || style === "bronze",
        emissive: o && o.emissive,
      },
    );
    b.quad(k, x, y, z, w, h, Object.assign({ ry }, o && o.q));
  };

  // ------------------------------------------------------------------
  // extra surfaces
  // ------------------------------------------------------------------
  const C = P.CUSTOM,
    B = P.blotches,
    SP = P.speckle;
  C.ashlar = [
    512,
    512,
    (ctx, w, h) => {
      // Indiana limestone ashlar, 4 courses × 2 blocks
      const r = P.rng("ashlar");
      ctx.fillStyle = "#cfc6b2";
      ctx.fillRect(0, 0, w, h);
      const rows = 4,
        rh = h / rows;
      for (let j = 0; j < rows; j++) {
        const off = ((j % 2) * w) / 4;
        for (let i = -1; i < 3; i++) {
          const x0 = (i * w) / 2 + off,
            c = 190 + r() * 26;
          ctx.fillStyle =
            "rgb(" +
            (c | 0) +
            "," +
            ((c * 0.96) | 0) +
            "," +
            ((c * 0.86) | 0) +
            ")";
          ctx.fillRect(x0 + 2, j * rh + 2, w / 2 - 4, rh - 4);
        }
        ctx.fillStyle = "rgba(70,60,45,0.55)";
        ctx.fillRect(0, j * rh, w, 2);
        for (let i = -1; i < 3; i++)
          ctx.fillRect((i * w) / 2 + off, j * rh, 2, rh);
      }
      B(ctx, w, h, r, 40, 0.12);
      SP(ctx, w, h, r, 2600, 0.18, 0.1);
      for (let i = 0; i < 8; i++) {
        const x = r() * w;
        const g = ctx.createLinearGradient(0, 0, 0, h);
        g.addColorStop(0, "rgba(50,44,30,0.18)");
        g.addColorStop(1, "rgba(50,44,30,0)");
        ctx.fillStyle = g;
        ctx.fillRect(x, 0, 3 + r() * 14, h);
      }
    },
  ];
  C.rustic = [
    512,
    512,
    (ctx, w, h) => {
      // rusticated base: deep channelled joints
      const r = P.rng("rustic");
      ctx.fillStyle = "#c4bba6";
      ctx.fillRect(0, 0, w, h);
      const rows = 4,
        rh = h / rows;
      for (let j = 0; j < rows; j++) {
        const g = ctx.createLinearGradient(0, j * rh, 0, (j + 1) * rh);
        g.addColorStop(0, "rgba(255,250,235,0.18)");
        g.addColorStop(0.85, "rgba(0,0,0,0)");
        g.addColorStop(1, "rgba(30,24,16,0.45)");
        ctx.fillStyle = g;
        ctx.fillRect(0, j * rh, w, rh);
        ctx.fillStyle = "rgba(40,32,22,0.8)";
        ctx.fillRect(0, j * rh, w, 6);
      }
      B(ctx, w, h, r, 40, 0.16);
      SP(ctx, w, h, r, 3000, 0.2, 0.1);
    },
  ];
  C.brick_flemish = [
    512,
    512,
    (ctx, w, h) => {
      // Flemish bond: header/stretcher alternating, glazed dark headers
      const r = P.rng("flem");
      ctx.fillStyle = "#b8ab98";
      ctx.fillRect(0, 0, w, h);
      const bh = 16,
        sl = 48,
        hl = 22;
      for (let j = 0; j * bh < h; j++) {
        let x = ((j % 2) * -(sl + hl)) / 2;
        let st = true;
        while (x < w) {
          const L = st ? sl : hl;
          const dark = !st && r() < 0.8;
          const c = dark ? 60 + r() * 25 : 120 + r() * 40;
          ctx.fillStyle =
            "rgb(" +
            ((c * 1.12) | 0) +
            "," +
            ((c * 0.52) | 0) +
            "," +
            ((c * 0.38) | 0) +
            ")";
          ctx.fillRect(x + 1, j * bh + 1, L - 2, bh - 3);
          x += L;
          st = !st;
        }
      }
      B(ctx, w, h, r, 40, 0.2);
      SP(ctx, w, h, r, 2500, 0.25, 0.08);
    },
  ];
  C.clapboard = [
    256,
    256,
    (ctx, w, h) => {
      // pale yellow painted clapboard, peeling
      const r = P.rng("clap");
      const bh = 24;
      for (let j = 0; j * bh < h; j++) {
        const g = ctx.createLinearGradient(0, j * bh, 0, (j + 1) * bh);
        g.addColorStop(0, "#e8d898");
        g.addColorStop(0.8, "#d8c480");
        g.addColorStop(1, "#8a7a4a");
        ctx.fillStyle = g;
        ctx.fillRect(0, j * bh, w, bh);
      }
      for (let i = 0; i < 26; i++) {
        const x = r() * w,
          y = r() * h;
        ctx.fillStyle = "rgba(120,100,70," + (0.3 + r() * 0.4) + ")";
        ctx.fillRect(x, y, 6 + r() * 30, 2 + r() * 8);
      }
      B(ctx, w, h, r, 14, 0.25);
      SP(ctx, w, h, r, 900, 0.2, 0.1);
    },
  ];
  C.silk_red = [
    256,
    256,
    (ctx, w, h) =>
      damaskDraw(ctx, w, h, "#6e1c18", "rgba(170,70,50,0.5)", "silkr"),
  ];
  C.silk_green = [
    256,
    256,
    (ctx, w, h) =>
      damaskDraw(ctx, w, h, "#2e4a34", "rgba(110,150,100,0.45)", "silkg"),
  ];
  C.silk_gold = [
    256,
    256,
    (ctx, w, h) =>
      damaskDraw(ctx, w, h, "#7a6030", "rgba(210,180,110,0.45)", "silky"),
  ];
  function damaskDraw(ctx, w, h, bg, fg, seed) {
    const r = P.rng(seed);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = fg;
    for (let i = 0; i < 2; i++)
      for (let j = 0; j < 2; j++) {
        const cx = (i * w) / 2 + ((j % 2) * w) / 4 + w / 8,
          cy = (j * h) / 2 + h / 4;
        ctx.beginPath();
        ctx.moveTo(cx, cy - 46);
        ctx.bezierCurveTo(cx + 36, cy - 28, cx + 30, cy + 12, cx, cy + 46);
        ctx.bezierCurveTo(cx - 30, cy + 12, cx - 36, cy - 28, cx, cy - 46);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx, cy - 52, 6, 0, TAU);
        ctx.fill();
      }
    for (let i = 0; i < 5; i++) {
      const x = r() * w;
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "rgba(20,14,8,0.4)");
      g.addColorStop(1, "rgba(20,14,8,0)");
      ctx.fillStyle = g;
      ctx.fillRect(x, 0, 6 + r() * 20, h * (0.3 + r() * 0.6));
    }
    SP(ctx, w, h, r, 700, 0.3, 0.06);
  }
  C.teak = [
    512,
    512,
    (ctx, w, h) => {
      // carved teak panels (lattice + medallions)
      const r = P.rng("teak");
      ctx.fillStyle = "#5a3a1c";
      ctx.fillRect(0, 0, w, h);
      for (let y = 0; y < h; y += 2) {
        ctx.fillStyle =
          "rgba(" +
          ((110 + r() * 40) | 0) +
          "," +
          ((70 + r() * 20) | 0) +
          ",30," +
          (0.12 + r() * 0.15) +
          ")";
        ctx.fillRect(0, y, w, 1 + r() * 2);
      }
      ctx.strokeStyle = "rgba(25,12,4,0.7)";
      ctx.lineWidth = 3;
      for (let i = 0; i < 4; i++)
        for (let j = 0; j < 4; j++) {
          const cx = ((i + 0.5) * w) / 4,
            cy = ((j + 0.5) * h) / 4;
          ctx.beginPath();
          ctx.arc(cx, cy, 34, 0, TAU);
          ctx.stroke();
          for (let k = 0; k < 8; k++) {
            const a = (k / 8) * TAU;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + Math.cos(a) * 34, cy + Math.sin(a) * 34);
            ctx.stroke();
          }
          ctx.strokeRect(cx - 60, cy - 60, 120, 120);
        }
      ctx.strokeStyle = "rgba(210,150,80,0.22)";
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 4; i++)
        for (let j = 0; j < 4; j++) {
          const cx = ((i + 0.5) * w) / 4 + 2,
            cy = ((j + 0.5) * h) / 4 + 2;
          ctx.beginPath();
          ctx.arc(cx, cy, 34, 0, TAU);
          ctx.stroke();
        }
      B(ctx, w, h, r, 24, 0.2);
    },
  ];
  C.checker = [
    256,
    256,
    (ctx, w, h) => {
      // black & white marble checkerboard (diagonal)
      const r = P.rng("chk"),
        n = 4,
        s = w / n;
      for (let i = 0; i < n; i++)
        for (let j = 0; j < n; j++) {
          const blk = (i + j) % 2 === 0;
          ctx.fillStyle = blk ? "#1c1c1e" : "#e6e0d4";
          ctx.fillRect(i * s, j * s, s, s);
          ctx.strokeStyle = blk
            ? "rgba(200,200,200,0.12)"
            : "rgba(80,80,80,0.18)";
          ctx.lineWidth = 1;
          for (let k = 0; k < 3; k++) {
            ctx.beginPath();
            ctx.moveTo(i * s + r() * s, j * s);
            ctx.bezierCurveTo(
              i * s + r() * s,
              j * s + s * 0.3,
              i * s + r() * s,
              j * s + s * 0.6,
              i * s + r() * s,
              j * s + s,
            );
            ctx.stroke();
          }
        }
      ctx.strokeStyle = "rgba(40,36,30,0.6)";
      ctx.lineWidth = 2;
      for (let i = 0; i <= n; i++) {
        ctx.beginPath();
        ctx.moveTo(i * s, 0);
        ctx.lineTo(i * s, h);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * s);
        ctx.lineTo(w, i * s);
        ctx.stroke();
      }
      B(ctx, w, h, r, 20, 0.25);
    },
  ];
  C.zuber = [
    1024,
    256,
    (ctx, w, h) => {
      // scenic panoramic wallpaper: river, trees, distant hills, sepia-green
      const r = P.rng("zuber");
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "#c8d0b8");
      g.addColorStop(0.55, "#e0dcc0");
      g.addColorStop(0.56, "#8a9a6a");
      g.addColorStop(1, "#5a6a44");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#9aa888";
      ctx.beginPath();
      ctx.moveTo(0, h * 0.55);
      for (let x = 0; x <= w; x += 32)
        ctx.lineTo(x, h * (0.42 + 0.08 * Math.sin(x / 90) + r() * 0.03));
      ctx.lineTo(w, h * 0.55);
      ctx.fill();
      ctx.fillStyle = "#8aa0a8";
      ctx.fillRect(0, h * 0.62, w, h * 0.08);
      for (let i = 0; i < 24; i++) {
        const x = r() * w;
        ctx.fillStyle = "#4a5a34";
        ctx.fillRect(x - 3, h * 0.5, 6, h * 0.3);
        for (let k = 0; k < 5; k++) {
          ctx.fillStyle = ["#3a5a2a", "#5a7a3a", "#4a6a30"][k % 3];
          ctx.beginPath();
          ctx.arc(
            x + (r() - 0.5) * 40,
            h * (0.3 + r() * 0.2),
            14 + r() * 16,
            0,
            TAU,
          );
          ctx.fill();
        }
      }
      for (let i = 0; i < 6; i++) {
        const x = r() * w;
        ctx.fillStyle = "#e8e0d0";
        ctx.fillRect(x, h * 0.5, 20, 12);
        ctx.fillStyle = "#8a4a3a";
        ctx.beginPath();
        ctx.moveTo(x - 3, h * 0.5);
        ctx.lineTo(x + 10, h * 0.44);
        ctx.lineTo(x + 23, h * 0.5);
        ctx.fill();
      }
      ctx.fillStyle = "rgba(120,100,60,0.2)";
      ctx.fillRect(0, 0, w, h);
      B(ctx, w, h, r, 40, 0.25);
      SP(ctx, w, h, r, 1500, 0.2, 0.06);
    },
  ];
  C.travertine = [
    512,
    512,
    (ctx, w, h) => {
      const r = P.rng("trav");
      ctx.fillStyle = "#d8cbb0";
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 260; i++) {
        ctx.fillStyle =
          "rgba(" +
          ((150 + r() * 40) | 0) +
          "," +
          ((130 + r() * 30) | 0) +
          ",100," +
          (0.15 + r() * 0.25) +
          ")";
        ctx.fillRect(r() * w, r() * h, 10 + r() * 60, 1 + r() * 3);
      }
      ctx.strokeStyle = "rgba(80,70,50,0.45)";
      ctx.lineWidth = 2;
      for (let i = 0; i <= 2; i++) {
        ctx.beginPath();
        ctx.moveTo((i * w) / 2, 0);
        ctx.lineTo((i * w) / 2, h);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, (i * h) / 2);
        ctx.lineTo(w, (i * h) / 2);
        ctx.stroke();
      }
      B(ctx, w, h, r, 30, 0.2);
    },
  ];
  C.drill_floor = [
    512,
    512,
    (ctx, w, h) => {
      // worn maple drill-hall boards with painted marching lines
      const r = P.rng("drill");
      for (let j = 0; j < 32; j++) {
        const c = 120 + r() * 40;
        ctx.fillStyle =
          "rgb(" +
          (c | 0) +
          "," +
          ((c * 0.78) | 0) +
          "," +
          ((c * 0.5) | 0) +
          ")";
        ctx.fillRect(0, j * 16, w, 15);
        ctx.fillStyle = "rgba(30,20,10,0.5)";
        ctx.fillRect(r() * w, j * 16, 2, 16);
      }
      ctx.fillStyle = "rgba(230,220,190,0.55)";
      ctx.fillRect(0, h * 0.5 - 3, w, 6);
      B(ctx, w, h, r, 40, 0.3);
      SP(ctx, w, h, r, 2000, 0.3, 0.05);
    },
  ];
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
})();
