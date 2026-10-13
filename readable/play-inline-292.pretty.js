/* src/poi_midtown2/05_m2.js */
/* =====================================================================
 * NEW RAD CITY — POI MIDTOWN 2 — 05_m2.js
 * This module's own surfaces, art and helpers shared by the three POIs:
 *   - procedural ART ATLAS (16 original abstract / pop canvases for MoMA),
 *     sepia photo atlas, water-lily panorama, ink caricatures (Algonquin)
 *   - library surfaces: book-spine shelves, walnut panels, red silk damask,
 *     painted ceiling murals, Flemish-style tapestry, rotunda mosaic
 *   - Algonquin oak panelling, rose carpet, the ALGONQUIN blade sign
 *   - dusk-sky / skyline backdrop for the MoMA sculpture garden
 *   - helpers: bookcase(), canvas(), placard(), cat mesh, glow flush
 * All drawing is original procedural work (no reproductions of real art).
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE || !G._pm2) return;
  const PM = G._pm2;
  const U = G.util;
  const TAU = Math.PI * 2;
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

  PM.anchorOf = function (poi, name) {
    try {
      return G.pois.getAnchor(poi, name);
    } catch (e) {
      return null;
    }
  };

  // -------------------------------------------------------------------
  // small canvas helpers
  // -------------------------------------------------------------------
  function rnd(seed) {
    return U.rng(typeof seed === "string" ? U.hashStr(seed) : seed);
  }
  function grime(ctx, w, h, r, amt) {
    amt = amt === undefined ? 1 : amt;
    for (let i = 0; i < 40 * amt; i++) {
      const x = r() * w,
        y = r() * h,
        rr = 6 + r() * 50;
      const g = ctx.createRadialGradient(x, y, 0, x, y, rr);
      g.addColorStop(0, "rgba(40,30,18," + (0.05 + r() * 0.15) * amt + ")");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(x - rr, y - rr, rr * 2, rr * 2);
    }
    for (let i = 0; i < 500 * amt; i++) {
      ctx.fillStyle = "rgba(20,14,8," + r() * 0.25 + ")";
      ctx.fillRect(r() * w, r() * h, 1.2, 1.2);
    }
  }
  function crackle(ctx, x0, y0, w, h, r, n) {
    ctx.strokeStyle = "rgba(30,20,10,0.35)";
    ctx.lineWidth = 0.6;
    for (let i = 0; i < n; i++) {
      let x = x0 + r() * w,
        y = y0 + r() * h;
      ctx.beginPath();
      ctx.moveTo(x, y);
      for (let k = 0; k < 4; k++) {
        x += (r() - 0.5) * 18;
        y += (r() - 0.5) * 18;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  }
  PM.m2grime = grime;

  // -------------------------------------------------------------------
  // ART ATLAS: 4×4 original canvases, 256 px each (1024²)
  //  0 grid-of-primaries   1 drip & splatter     2 colour field (red)   3 colour field (dusk)
  //  4 circles & lines     5 floating squares    6 NOCTURNE (quest)     7 cut-out shapes
  //  8 bottle grid (pop)   9 atomic pop panel   10 ration-tin prints    11 night diner
  // 12 blue biomorphs     13 grid of glyphs     14 brute blood canvas  15 empty/slashed canvas
  // -------------------------------------------------------------------
  const ART = [];
  ART[0] = (c, s, r) => {
    // grid of primaries
    c.fillStyle = "#efeadc";
    c.fillRect(0, 0, s, s);
    const xs = [0, 0.22, 0.61, 0.8, 1].map((v) => v * s),
      ys = [0, 0.3, 0.55, 0.9, 1].map((v) => v * s);
    const fills = {
      "0,0": "#c8261c",
      "2,2": "#1e3c8c",
      "3,0": "#e8c21c",
      "1,3": "#e8c21c",
      "3,3": "#111",
    };
    for (let i = 0; i < 4; i++)
      for (let j = 0; j < 4; j++) {
        const f = fills[i + "," + j];
        if (f) {
          c.fillStyle = f;
          c.fillRect(xs[i], ys[j], xs[i + 1] - xs[i], ys[j + 1] - ys[j]);
        }
      }
    c.fillStyle = "#111";
    for (const x of xs) c.fillRect(x - 4, 0, 8, s);
    for (const y of ys) c.fillRect(0, y - 4, s, 8);
  };
  ART[1] = (c, s, r) => {
    // drip & splatter
    c.fillStyle = "#d8ceb4";
    c.fillRect(0, 0, s, s);
    const cols = ["#1a1a1a", "#e8e2d0", "#8a5a2a", "#3a4a6a", "#c8a020"];
    for (const col of cols) {
      c.strokeStyle = col;
      c.lineCap = "round";
      for (let k = 0; k < 14; k++) {
        c.lineWidth = 1 + r() * 4;
        c.beginPath();
        let x = r() * s,
          y = r() * s;
        c.moveTo(x, y);
        for (let q = 0; q < 12; q++) {
          x += (r() - 0.5) * 90;
          y += (r() - 0.5) * 90;
          c.quadraticCurveTo(x + (r() - 0.5) * 60, y + (r() - 0.5) * 60, x, y);
        }
        c.stroke();
      }
      c.fillStyle = col;
      for (let k = 0; k < 40; k++) {
        c.beginPath();
        c.arc(r() * s, r() * s, 1 + r() * 4, 0, TAU);
        c.fill();
      }
    }
  };
  function field(c, s, r, bg, a, b) {
    c.fillStyle = bg;
    c.fillRect(0, 0, s, s);
    const blk = (y0, y1, col) => {
      for (let i = 0; i < 6; i++) {
        c.fillStyle = col;
        c.globalAlpha = 0.18;
        c.fillRect(
          s * 0.08 + (r() - 0.5) * 6,
          y0 + (r() - 0.5) * 6,
          s * 0.84,
          y1 - y0,
        );
      }
      c.globalAlpha = 1;
    };
    blk(s * 0.08, s * 0.5, a);
    blk(s * 0.58, s * 0.92, b);
  }
  ART[2] = (c, s, r) => field(c, s, r, "#6a1a14", "#c8401c", "#2a0a0a");
  ART[3] = (c, s, r) => field(c, s, r, "#2a2440", "#b86a2a", "#4a3a6a");
  ART[4] = (c, s, r) => {
    // circles & lines
    c.fillStyle = "#e4dcc4";
    c.fillRect(0, 0, s, s);
    const cols = [
      "#1e3c8c",
      "#c8261c",
      "#e8b01c",
      "#2a7a4a",
      "#111",
      "#8a3a8a",
    ];
    for (let i = 0; i < 9; i++) {
      c.fillStyle = cols[i % cols.length];
      c.globalAlpha = 0.85;
      c.beginPath();
      c.arc(r() * s, r() * s, 8 + r() * 40, 0, TAU);
      c.fill();
      c.globalAlpha = 1;
      c.strokeStyle = "#111";
      c.lineWidth = 2;
      c.stroke();
    }
    c.strokeStyle = "#111";
    for (let i = 0; i < 10; i++) {
      c.lineWidth = 1 + r() * 3;
      c.beginPath();
      c.moveTo(r() * s, r() * s);
      c.lineTo(r() * s, r() * s);
      c.stroke();
    }
    c.fillStyle = "#111";
    c.beginPath();
    c.moveTo(s * 0.2, s * 0.8);
    c.lineTo(s * 0.35, s * 0.45);
    c.lineTo(s * 0.5, s * 0.8);
    c.fill();
  };
  ART[5] = (c, s, r) => {
    // floating squares
    c.fillStyle = "#ece6d6";
    c.fillRect(0, 0, s, s);
    const cols = ["#111", "#c8261c", "#1e3c8c", "#e8b01c", "#555"];
    for (let i = 0; i < 12; i++) {
      c.save();
      c.translate(r() * s, r() * s);
      c.rotate((r() - 0.5) * 1.2);
      c.fillStyle = cols[i % cols.length];
      const w = 10 + r() * (i === 0 ? 110 : 60),
        h = 6 + r() * 30;
      c.fillRect(-w / 2, -h / 2, w, i === 0 ? w : h);
      c.restore();
    }
  };
  ART[6] = (c, s, r) => {
    // "NOCTURNE FOR A DYING CITY" — the quest painting: swirling night over a skyline
    const g = c.createLinearGradient(0, 0, 0, s);
    g.addColorStop(0, "#0c1a4a");
    g.addColorStop(0.7, "#1e3a7a");
    g.addColorStop(1, "#0a0e1a");
    c.fillStyle = g;
    c.fillRect(0, 0, s, s);
    c.lineCap = "round";
    for (let k = 0; k < 260; k++) {
      // swirling brush strokes
      const cx = s * 0.5 + Math.sin(k * 0.13) * s * 0.3,
        cy = s * 0.32 + Math.cos(k * 0.21) * s * 0.18,
        rr = 8 + (k % 23) * 2.2;
      const a0 = r() * TAU;
      c.strokeStyle = ["#4a6ac8", "#8aa8e8", "#2a3a8a", "#c8d8f0", "#e8d060"][
        k % 5
      ];
      c.globalAlpha = 0.5;
      c.lineWidth = 2 + r() * 3;
      c.beginPath();
      c.arc(cx, cy, rr, a0, a0 + 1 + r() * 1.5);
      c.stroke();
    }
    c.globalAlpha = 1;
    // a green-glowing moon (a mushroom cloud, if you look twice)
    const mg = c.createRadialGradient(
      s * 0.78,
      s * 0.2,
      2,
      s * 0.78,
      s * 0.2,
      36,
    );
    mg.addColorStop(0, "#f0f0a0");
    mg.addColorStop(0.4, "#b8e070");
    mg.addColorStop(1, "rgba(120,200,80,0)");
    c.fillStyle = mg;
    c.fillRect(s * 0.6, 0, s * 0.4, s * 0.45);
    c.fillStyle = "#d8e8a0";
    c.beginPath();
    c.ellipse(s * 0.78, s * 0.19, 16, 10, 0, 0, TAU);
    c.fill();
    c.fillRect(s * 0.775, s * 0.2, 6, 26);
    for (let i = 0; i < 14; i++) {
      c.fillStyle = "#f0e070";
      c.beginPath();
      c.arc(r() * s, r() * s * 0.55, 1.5 + r() * 3, 0, TAU);
      c.fill();
    }
    // skyline silhouette with a few lit windows
    c.fillStyle = "#05070c";
    let x = 0;
    while (x < s) {
      const w = 10 + r() * 26,
        h = 40 + r() * 90;
      c.fillRect(x, s - h, w, h);
      if (r() < 0.3) {
        c.beginPath();
        c.moveTo(x, s - h);
        c.lineTo(x + w / 2, s - h - 20 - r() * 30);
        c.lineTo(x + w, s - h);
        c.fill();
      }
      for (let k = 0; k < 5; k++) {
        c.fillStyle = "#e8c060";
        c.fillRect(x + r() * w, s - r() * h, 2, 3);
        c.fillStyle = "#05070c";
      }
      x += w + 1;
    }
    // a tall cypress-like flame of a ruined spire on the left
    c.fillStyle = "#0a1408";
    c.beginPath();
    c.moveTo(s * 0.12, s);
    c.quadraticCurveTo(s * 0.02, s * 0.5, s * 0.16, s * 0.18);
    c.quadraticCurveTo(s * 0.26, s * 0.55, s * 0.22, s);
    c.fill();
  };
  ART[7] = (c, s, r) => {
    // cut-out shapes
    c.fillStyle = "#e8e0cc";
    c.fillRect(0, 0, s, s);
    const cols = ["#1e48a8", "#1e48a8", "#e86a1c", "#2a8a4a", "#111"];
    for (let i = 0; i < 9; i++) {
      c.fillStyle = cols[i % cols.length];
      c.beginPath();
      const cx = r() * s,
        cy = r() * s,
        R = 20 + r() * 35;
      for (let k = 0; k < 10; k++) {
        const a = (k / 10) * TAU,
          rr = R * (k % 2 ? 0.45 + r() * 0.2 : 1);
        c.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
      }
      c.closePath();
      c.fill();
    }
  };
  ART[8] = (c, s, r) => {
    // pop grid of cola bottles
    c.fillStyle = "#f0e8d8";
    c.fillRect(0, 0, s, s);
    const n = 5,
      cw = s / n;
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++) {
        const x = i * cw + cw / 2,
          y = j * cw + cw / 2;
        c.fillStyle = r() < 0.15 ? "#c8261c" : "#2a1a14";
        c.beginPath();
        c.moveTo(x - 5, y - 22);
        c.lineTo(x + 5, y - 22);
        c.lineTo(x + 5, y - 12);
        c.quadraticCurveTo(x + 14, y - 4, x + 12, y + 20);
        c.lineTo(x - 12, y + 20);
        c.quadraticCurveTo(x - 14, y - 4, x - 5, y - 12);
        c.fill();
        c.fillStyle = "#e8e0d0";
        c.fillRect(x - 11, y, 22, 7);
        c.fillStyle = "#c8261c";
        c.beginPath();
        c.arc(x, y - 23, 4, 0, TAU);
        c.fill();
      }
  };
  ART[9] = (c, s, r) => {
    // atomic pop panel with halftone dots and a speech balloon
    c.fillStyle = "#f0d020";
    c.fillRect(0, 0, s, s);
    for (let y = 0; y < s; y += 8)
      for (let x = (y / 8) % 2 ? 4 : 0; x < s; x += 8) {
        c.fillStyle = "#e8801c";
        c.beginPath();
        c.arc(x, y, 2.4, 0, TAU);
        c.fill();
      }
    c.fillStyle = "#f4f0e0";
    c.beginPath();
    c.ellipse(s * 0.5, s * 0.48, s * 0.2, s * 0.13, 0, 0, TAU);
    c.fill();
    c.fillRect(s * 0.44, s * 0.55, s * 0.12, s * 0.3);
    c.fillStyle = "#111";
    c.lineWidth = 4;
    c.strokeStyle = "#111";
    c.beginPath();
    c.ellipse(s * 0.5, s * 0.48, s * 0.2, s * 0.13, 0, 0, TAU);
    c.stroke();
    c.strokeRect(s * 0.44, s * 0.55, s * 0.12, s * 0.3);
    c.fillStyle = "#c8261c";
    c.fillRect(0, s * 0.85, s, s * 0.15);
    c.fillStyle = "#fff";
    c.beginPath();
    c.ellipse(s * 0.3, s * 0.16, s * 0.26, s * 0.11, 0, 0, TAU);
    c.fill();
    c.stroke();
    c.fillStyle = "#111";
    c.font = "bold 34px Impact, sans-serif";
    c.textAlign = "center";
    c.fillText("KA-BOOM!", s * 0.3, s * 0.19);
  };
  ART[10] = (c, s, r) => {
    // screen-print grid of a ration tin (four colourways)
    const cols = ["#e8c21c", "#1e8ac8", "#c83a8a", "#3ac86a"];
    for (let i = 0; i < 2; i++)
      for (let j = 0; j < 2; j++) {
        const x0 = (i * s) / 2,
          y0 = (j * s) / 2,
          h = s / 2;
        c.fillStyle = cols[(i + j * 2) % 4];
        c.fillRect(x0, y0, h, h);
        const cx = x0 + h / 2,
          cy = y0 + h / 2,
          w = h * 0.38,
          th = h * 0.5;
        c.fillStyle = "#d8d0c0";
        c.fillRect(cx - w / 2, cy - th / 2, w, th); // the tin
        c.fillStyle = "#b0a898";
        c.beginPath();
        c.ellipse(cx, cy - th / 2, w / 2, h * 0.05, 0, 0, TAU);
        c.fill();
        c.fillStyle = cols[(i + j * 2 + 2) % 4];
        c.fillRect(cx - w / 2, cy - th * 0.18, w, th * 0.42); // the label band
        c.fillStyle = "#111";
        c.font = "bold " + Math.round(h * 0.08) + "px Impact, sans-serif";
        c.textAlign = "center";
        c.fillText("MEAT", cx, cy + th * 0.02);
        c.fillText("RATION", cx, cy + th * 0.17);
        c.strokeStyle = "#111";
        c.lineWidth = 2;
        c.strokeRect(cx - w / 2, cy - th / 2, w, th);
      }
  };
  ART[11] = (c, s, r) => {
    // lonely night diner
    c.fillStyle = "#0e1a18";
    c.fillRect(0, 0, s, s);
    c.fillStyle = "#1a2a24";
    c.fillRect(0, s * 0.7, s, s * 0.3);
    c.fillStyle = "#d8e8a8";
    c.beginPath();
    c.moveTo(s * 0.15, s * 0.35);
    c.lineTo(s * 0.95, s * 0.35);
    c.lineTo(s * 0.95, s * 0.72);
    c.lineTo(s * 0.1, s * 0.72);
    c.quadraticCurveTo(s * 0.05, s * 0.5, s * 0.15, s * 0.35);
    c.fill();
    c.fillStyle = "#8a3a1a";
    c.fillRect(s * 0.25, s * 0.58, s * 0.62, s * 0.06);
    c.fillStyle = "#1a1a1a";
    for (const x of [0.35, 0.47, 0.72]) {
      c.beginPath();
      c.arc(s * x, s * 0.5, 8, 0, TAU);
      c.fill();
      c.fillRect(s * x - 7, s * 0.5, 14, 20);
    }
    c.fillStyle = "#e8e0c0";
    c.fillRect(s * 0.6, s * 0.46, 12, 24);
    c.fillStyle = "#6a2a1a";
    c.fillRect(s * 0.1, s * 0.26, s * 0.85, s * 0.08);
    c.fillStyle = "#e8d8a0";
    c.font = "bold 16px Georgia";
    c.fillText("PHILLIES", s * 0.45, s * 0.32);
  };
  ART[12] = (c, s, r) => {
    // blue biomorphs
    c.fillStyle = "#f0e8d4";
    c.fillRect(0, 0, s, s);
    for (let i = 0; i < 7; i++) {
      c.fillStyle = ["#1a3a9a", "#111", "#c8261c", "#e8b01c"][i % 4];
      c.beginPath();
      const cx = r() * s,
        cy = r() * s;
      c.moveTo(cx, cy);
      for (let k = 0; k < 5; k++)
        c.bezierCurveTo(
          cx + (r() - 0.5) * 120,
          cy + (r() - 0.5) * 120,
          cx + (r() - 0.5) * 120,
          cy + (r() - 0.5) * 120,
          cx + (r() - 0.5) * 60,
          cy + (r() - 0.5) * 60,
        );
      c.fill();
    }
    c.strokeStyle = "#111";
    c.lineWidth = 2;
    for (let i = 0; i < 6; i++) {
      c.beginPath();
      c.moveTo(r() * s, r() * s);
      c.bezierCurveTo(r() * s, r() * s, r() * s, r() * s, r() * s, r() * s);
      c.stroke();
    }
  };
  ART[13] = (c, s, r) => {
    // grid of glyphs in warm squares
    const n = 8,
      cw = s / n;
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++) {
        c.fillStyle =
          "hsl(" +
          (20 + r() * 40) +
          "," +
          (40 + r() * 30) +
          "%," +
          (40 + r() * 30) +
          "%)";
        c.fillRect(i * cw, j * cw, cw, cw);
      }
    c.strokeStyle = "#1a120a";
    c.lineWidth = 2;
    for (let i = 0; i < 20; i++) {
      const x = r() * s,
        y = r() * s;
      c.beginPath();
      c.moveTo(x, y);
      c.lineTo(x + 12, y - 14);
      c.lineTo(x + 20, y + 4);
      c.stroke();
    }
    c.fillStyle = "#c8261c";
    c.beginPath();
    c.arc(s * 0.7, s * 0.25, 10, 0, TAU);
    c.fill();
  };
  ART[14] = (c, s, r) => {
    // the Brutes' own "masterpiece": blood & handprints on a ruined canvas
    c.fillStyle = "#c8bca0";
    c.fillRect(0, 0, s, s);
    c.fillStyle = "rgba(110,10,6,0.85)";
    for (let i = 0; i < 9; i++) {
      // huge handprints
      const x = r() * s,
        y = r() * s,
        k = 0.8 + r() * 0.8;
      c.beginPath();
      c.ellipse(x, y, 22 * k, 26 * k, 0, 0, TAU);
      c.fill();
      for (let f = 0; f < 4; f++) {
        c.beginPath();
        c.ellipse(
          x - 18 * k + f * 12 * k,
          y - 34 * k,
          5 * k,
          14 * k,
          (f - 1.5) * 0.15,
          0,
          TAU,
        );
        c.fill();
      }
    }
    for (let i = 0; i < 20; i++) {
      c.fillRect(r() * s, r() * s * 0.6, 3, 20 + r() * 80);
    }
    c.fillStyle = "#3a0804";
    c.font = "bold 30px Impact, sans-serif";
    c.textAlign = "center";
    c.save();
    c.translate(s / 2, s * 0.55);
    c.rotate(-0.12);
    c.fillText("SOFTLING", 0, 0);
    c.fillText("No. 12", 0, 34);
    c.restore();
  };
  ART[15] = (c, s, r) => {
    // an empty canvas slashed by claws
    c.fillStyle = "#e8e2d2";
    c.fillRect(0, 0, s, s);
    c.fillStyle = "#1a140e";
    for (let i = 0; i < 4; i++) {
      c.beginPath();
      c.moveTo(s * 0.2 + i * 30, s * 0.1);
      c.lineTo(s * 0.26 + i * 30, s * 0.1);
      c.lineTo(s * 0.5 + i * 30, s * 0.9);
      c.lineTo(s * 0.46 + i * 30, s * 0.9);
      c.fill();
    }
  };
  PM.artTex = function () {
    return PM.canvasTex(
      "pm2_art",
      1024,
      1024,
      (c, w, h) => {
        for (let i = 0; i < 16; i++) {
          const s = 256,
            x0 = (i % 4) * s,
            y0 = Math.floor(i / 4) * s;
          c.save();
          c.translate(x0, y0);
          c.beginPath();
          c.rect(0, 0, s, s);
          c.clip();
          const r = rnd(1000 + i * 37);
          try {
            ART[i](c, s, r);
          } catch (e) {
            c.fillStyle = "#888";
            c.fillRect(0, 0, s, s);
          }
          crackle(c, 0, 0, s, s, r, 20);
          grime(c, s, s, r, 0.35);
          c.restore();
        }
      },
      { clamp: true },
    );
  };
  PM.artKey = function (lit) {
    return PM.texMat("pm2_art" + (lit ? "_lit" : ""), PM.artTex(), {
      rough: 0.75,
      emissive: lit || 0,
    });
  };
  /** uvRect for art index i (atlas rows are drawn top→bottom, uv v=1 at top). */
  PM.artRect = function (i) {
    const u0 = (i % 4) / 4,
      v1 = 1 - Math.floor(i / 4) / 4;
    return [u0, v1 - 0.25, u0 + 0.25, v1];
  };

  /** Framed canvas on a wall: centre (x,y,z), facing ry (0 → +Z), art index, frame key (null = unframed gallery wrap). */
  PM.canvas = function (b, idx, x, y, z, w, h, ry, opts) {
    opts = opts || {};
    const c = Math.cos(ry),
      s = Math.sin(ry);
    const d = opts.depth || 0.06;
    // stretcher / frame block
    b.box(
      opts.frame || "paint_cream",
      x + (s * d) / 2,
      y - h / 2 - (opts.frame ? 0.06 : 0),
      z + (c * d) / 2,
      w + (opts.frame ? 0.12 : 0),
      h + (opts.frame ? 0.12 : 0),
      d,
      { ry, seg: false, grime: 0.2 },
    );
    b.quad(
      opts.key || PM.artKey(),
      x + s * (d + 0.005),
      y,
      z + c * (d + 0.005),
      w,
      h,
      {
        ry,
        uvRect: PM.artRect(idx),
        grime: opts.grime === undefined ? 0.15 : opts.grime,
        rz: opts.tilt || 0,
        noAO: true,
      },
    );
  };

  // -------------------------------------------------------------------
  // Sepia photographs (4 in a 2×2 atlas) and a wide water-lily panorama
  // -------------------------------------------------------------------
  PM.photoTex = function () {
    return PM.canvasTex(
      "pm2_photos",
      512,
      512,
      (c) => {
        const s = 256;
        for (let i = 0; i < 4; i++) {
          const x0 = (i % 2) * s,
            y0 = Math.floor(i / 2) * s,
            r = rnd(700 + i);
          c.save();
          c.translate(x0, y0);
          const g = c.createLinearGradient(0, 0, 0, s);
          g.addColorStop(0, "#d8c8a0");
          g.addColorStop(1, "#8a7658");
          c.fillStyle = g;
          c.fillRect(0, 0, s, s);
          c.fillStyle = "#3a2e20";
          if (i === 0) {
            let x = 0;
            while (x < s) {
              const w = 12 + r() * 30,
                h = 60 + r() * 150;
              c.fillRect(x, s - h, w, h);
              x += w + 2;
            }
            c.fillRect(s * 0.45, s * 0.05, 6, 60);
          } else if (i === 1) {
            for (let k = 0; k < 40; k++) {
              const x = r() * s,
                y = s * 0.55 + r() * s * 0.4;
              c.beginPath();
              c.arc(x, y, 6, 0, TAU);
              c.fill();
              c.fillRect(x - 6, y + 4, 12, 22);
            }
          } else if (i === 2) {
            c.fillRect(0, s * 0.7, s, 8);
            for (const x of [0.25, 0.75]) {
              c.fillRect(s * x - 12, s * 0.2, 24, s * 0.6);
            }
            c.strokeStyle = "#3a2e20";
            c.lineWidth = 2;
            for (let k = 0; k < 12; k++) {
              c.beginPath();
              c.moveTo(s * 0.25, s * 0.22);
              c.lineTo((k * s) / 12, s * 0.7);
              c.stroke();
              c.beginPath();
              c.moveTo(s * 0.75, s * 0.22);
              c.lineTo((k * s) / 12, s * 0.7);
              c.stroke();
            }
          } else {
            c.beginPath();
            c.ellipse(s / 2, s * 0.4, 50, 64, 0, 0, TAU);
            c.fill();
            c.fillRect(s / 2 - 80, s * 0.62, 160, s * 0.4);
            c.fillStyle = "#d8c8a0";
            c.beginPath();
            c.ellipse(s / 2, s * 0.42, 38, 50, 0, 0, TAU);
            c.fill();
          }
          c.strokeStyle = "#f0e8d8";
          c.lineWidth = 10;
          c.strokeRect(0, 0, s, s);
          grime(c, s, s, r, 0.6);
          c.restore();
        }
      },
      { clamp: true },
    );
  };
  PM.photoKey = function () {
    return PM.texMat("pm2_photos", PM.photoTex(), { rough: 0.6 });
  };
  PM.liliesTex = function () {
    return PM.canvasTex(
      "pm2_lilies",
      1024,
      256,
      (c, w, h) => {
        const r = rnd("lilies");
        const g = c.createLinearGradient(0, 0, 0, h);
        g.addColorStop(0, "#3a5a6a");
        g.addColorStop(0.5, "#4a6a7a");
        g.addColorStop(1, "#2a3e4a");
        c.fillStyle = g;
        c.fillRect(0, 0, w, h);
        for (let i = 0; i < 1400; i++) {
          c.fillStyle = [
            "rgba(120,160,190,0.25)",
            "rgba(60,90,70,0.25)",
            "rgba(170,150,190,0.2)",
            "rgba(210,200,160,0.2)",
          ][i % 4];
          c.fillRect(r() * w, r() * h, 6 + r() * 26, 2 + r() * 4);
        }
        for (let i = 0; i < 36; i++) {
          // lily pads & blossoms
          const x = r() * w,
            y = h * (0.3 + r() * 0.65),
            rr = 10 + r() * 26;
          c.fillStyle = "rgba(60,110,60,0.75)";
          c.beginPath();
          c.ellipse(x, y, rr, rr * 0.35, 0, 0, TAU);
          c.fill();
          if (r() < 0.45) {
            c.fillStyle =
              r() < 0.5 ? "rgba(230,170,190,0.9)" : "rgba(240,230,210,0.9)";
            c.beginPath();
            c.ellipse(x + 3, y - 3, 5, 3, 0, 0, TAU);
            c.fill();
          }
        }
        for (let i = 0; i < 30; i++) {
          c.strokeStyle = "rgba(30,50,40,0.4)";
          c.lineWidth = 2;
          c.beginPath();
          const x = r() * w;
          c.moveTo(x, 0);
          c.quadraticCurveTo(
            x + (r() - 0.5) * 40,
            h * 0.3,
            x + (r() - 0.5) * 30,
            h * 0.6,
          );
          c.stroke();
        }
        grime(c, w, h, r, 0.8);
        // a long tear in the canvas
        c.fillStyle = "#0a0806";
        c.beginPath();
        c.moveTo(w * 0.62, 0);
        c.lineTo(w * 0.66, h * 0.4);
        c.lineTo(w * 0.6, h * 0.8);
        c.lineTo(w * 0.63, h * 0.8);
        c.lineTo(w * 0.69, h * 0.4);
        c.lineTo(w * 0.645, 0);
        c.fill();
      },
      { clamp: true },
    );
  };

  // -------------------------------------------------------------------
  // Library & hotel surfaces (world-projected; registered as custom tex)
  // -------------------------------------------------------------------
  /** Book spines: 512² = 1.2 m × 1.2 m, three 0.4 m shelves (boards drawn into the texture). */
  function booksDraw(tone) {
    return (c, w, h) => {
      const r = rnd("books" + tone);
      const shelfH = h / 3;
      const pal =
        tone === "dark"
          ? [
              "#3a1a14",
              "#1e2a1a",
              "#2a1e2e",
              "#4a3a1a",
              "#1a1a2a",
              "#5a2a1a",
              "#2a2a24",
            ]
          : [
              "#6a2a1e",
              "#2a4a2e",
              "#3a2a4a",
              "#7a5a2a",
              "#2a3a5a",
              "#8a3a2a",
              "#4a4a3a",
              "#6a5a4a",
              "#9a8a6a",
            ];
      for (let s = 0; s < 3; s++) {
        const y0 = s * shelfH;
        c.fillStyle = "#140c06";
        c.fillRect(0, y0, w, shelfH); // dark shelf back
        let x = 0;
        while (x < w) {
          const bw = 7 + r() * 14,
            bh = shelfH * (0.62 + r() * 0.3);
          if (r() < 0.05) {
            x += bw * 2;
            continue;
          } // gap
          const col = pal[Math.floor(r() * pal.length)];
          const lean = r() < 0.06;
          c.save();
          c.translate(x, y0 + shelfH - 8);
          if (lean) c.rotate(-0.18);
          c.fillStyle = col;
          c.fillRect(0, -bh, bw, bh);
          c.fillStyle = "rgba(0,0,0,0.35)";
          c.fillRect(bw - 2, -bh, 2, bh); // spine shading
          c.fillStyle = "rgba(255,255,255,0.08)";
          c.fillRect(1, -bh, 2, bh);
          c.fillStyle = "rgba(200,160,80,0.75)"; // gilt bands & titles
          for (const t of [0.12, 0.2, 0.82])
            c.fillRect(1, -bh * (1 - t), bw - 2, 2);
          if (r() < 0.6) c.fillRect(bw * 0.3, -bh * 0.62, bw * 0.4, bh * 0.2);
          c.restore();
          x += bw + 0.5;
        }
        c.fillStyle = "#4a2e18";
        c.fillRect(0, y0 + shelfH - 8, w, 8); // shelf board
        c.fillStyle = "rgba(0,0,0,0.5)";
        c.fillRect(0, y0 + shelfH - 1, w, 1);
        c.fillStyle = "rgba(0,0,0,0.35)";
        c.fillRect(0, y0, w, 6); // shadow under the board above
      }
      grime(c, w, h, r, 0.5);
    };
  }
  /** Raised oak/walnut panelling: 512² = 1.6 m square, 2×2 panels with mouldings. */
  function panelDraw(base) {
    return (c, w, h) => {
      const r = rnd("panel" + base);
      const [R, Gc, B] = PM.hexToRgb(base);
      c.fillStyle = PM.rgbStr([R * 0.8, Gc * 0.8, B * 0.8]);
      c.fillRect(0, 0, w, h);
      for (let y = 0; y < h; y += 2) {
        c.fillStyle =
          "rgba(0,0,0," +
          (0.03 +
            0.05 * Math.abs(Math.sin(y * 0.11 + Math.sin(y * 0.03) * 3))) +
          ")";
        c.fillRect(0, y, w, 1);
      }
      const n = 2,
        pw = w / n;
      for (let i = 0; i < n; i++)
        for (let j = 0; j < n; j++) {
          const x0 = i * pw + 22,
            y0 = j * pw + 22,
            s = pw - 44;
          c.fillStyle = PM.rgbStr([R, Gc, B]);
          c.fillRect(x0, y0, s, s);
          for (let k = 0; k < 60; k++) {
            c.fillStyle = "rgba(40,20,8," + r() * 0.12 + ")";
            c.fillRect(x0 + r() * s, y0, 1 + r() * 2, s);
          } // grain
          c.fillStyle = "rgba(255,230,190,0.18)";
          c.fillRect(x0, y0, s, 4);
          c.fillRect(x0, y0, 4, s);
          c.fillStyle = "rgba(0,0,0,0.4)";
          c.fillRect(x0, y0 + s - 4, s, 4);
          c.fillRect(x0 + s - 4, y0, 4, s);
          c.strokeStyle = "rgba(0,0,0,0.35)";
          c.lineWidth = 2;
          c.strokeRect(x0 + 12, y0 + 12, s - 24, s - 24);
        }
      grime(c, w, h, r, 0.4);
    };
  }
  /** Red silk damask (Morgan's study). */
  function damaskDraw(c, w, h) {
    const r = rnd("damask");
    c.fillStyle = "#6a1210";
    c.fillRect(0, 0, w, h);
    const motif = (cx, cy, s) => {
      c.fillStyle = "#8a2018";
      c.beginPath();
      c.moveTo(cx, cy - s);
      c.bezierCurveTo(
        cx + s * 0.8,
        cy - s * 0.6,
        cx + s * 0.6,
        cy + s * 0.3,
        cx,
        cy + s,
      );
      c.bezierCurveTo(
        cx - s * 0.6,
        cy + s * 0.3,
        cx - s * 0.8,
        cy - s * 0.6,
        cx,
        cy - s,
      );
      c.fill();
      c.fillStyle = "#5a0e0c";
      c.beginPath();
      c.ellipse(cx, cy, s * 0.22, s * 0.45, 0, 0, TAU);
      c.fill();
      c.strokeStyle = "#9a2a20";
      c.lineWidth = 3;
      for (const sg of [-1, 1]) {
        c.beginPath();
        c.moveTo(cx, cy + s * 0.2);
        c.quadraticCurveTo(
          cx + sg * s * 0.9,
          cy + s * 0.1,
          cx + sg * s * 0.7,
          cy - s * 0.5,
        );
        c.stroke();
      }
    };
    for (let j = 0; j < 3; j++)
      for (let i = 0; i < 3; i++)
        motif((i * w) / 2 + (j % 2 ? w / 4 : 0), (j * h) / 2, 70);
    for (let y = 0; y < h; y += 3) {
      c.fillStyle = "rgba(255,200,180,0.03)";
      c.fillRect(0, y, w, 1);
    }
    grime(c, w, h, r, 0.8);
    for (let i = 0; i < 6; i++) {
      c.fillStyle = "rgba(20,10,6,0.35)";
      c.fillRect(r() * w, 0, 4 + r() * 10, h);
    } // water streaks
  }
  /** Rotunda mosaic floor (radial, marble tesserae). */
  function mosaicDraw(c, w, h) {
    const r = rnd("mosaic");
    c.fillStyle = "#d8ccb4";
    c.fillRect(0, 0, w, h);
    // the medallion is centred on the tile CORNERS (drawn 4×, wrapped) so it lands on world multiples of the tile size
    for (const [cx, cy] of [
      [0, 0],
      [w, 0],
      [0, h],
      [w, h],
    ]) {
      const rings = [
        [250, "#6a2a1e"],
        [232, "#d8ccb4"],
        [212, "#2a4a3a"],
        [160, "#d8ccb4"],
        [140, "#8a6a3a"],
        [64, "#d8ccb4"],
        [42, "#6a2a1e"],
      ];
      for (const [rr, col] of rings) {
        c.fillStyle = col;
        c.beginPath();
        c.arc(cx, cy, rr, 0, TAU);
        c.fill();
      }
      c.strokeStyle = "#2a1e14";
      c.lineWidth = 3;
      for (let k = 0; k < 16; k++) {
        const a = (k / 16) * TAU;
        c.beginPath();
        c.moveTo(cx + Math.cos(a) * 64, cy + Math.sin(a) * 64);
        c.lineTo(cx + Math.cos(a) * 160, cy + Math.sin(a) * 160);
        c.stroke();
      }
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * TAU + 0.2;
        c.fillStyle = "#c8a050";
        c.beginPath();
        c.arc(cx + Math.cos(a) * 186, cy + Math.sin(a) * 186, 12, 0, TAU);
        c.fill();
      }
    }
    for (let i = 0; i < 6000; i++) {
      c.fillStyle = "rgba(0,0,0," + r() * 0.12 + ")";
      c.fillRect(
        Math.floor((r() * w) / 6) * 6,
        Math.floor((r() * h) / 6) * 6,
        5,
        5,
      );
    }
    grime(c, w, h, r, 0.8);
  }
  /** Rose-and-gold hotel carpet. */
  function carpetDraw(c, w, h) {
    const r = rnd("carpet");
    c.fillStyle = "#5a1a20";
    c.fillRect(0, 0, w, h);
    for (let j = 0; j < 4; j++)
      for (let i = 0; i < 4; i++) {
        const cx = ((i + 0.5) * w) / 4,
          cy = ((j + 0.5) * h) / 4;
        c.strokeStyle = "#a07a3a";
        c.lineWidth = 3;
        c.beginPath();
        c.moveTo(cx, cy - 40);
        c.lineTo(cx + 40, cy);
        c.lineTo(cx, cy + 40);
        c.lineTo(cx - 40, cy);
        c.closePath();
        c.stroke();
        c.fillStyle = "#7a2a2a";
        c.beginPath();
        c.arc(cx, cy, 16, 0, TAU);
        c.fill();
        c.fillStyle = "#b89050";
        c.beginPath();
        c.arc(cx, cy, 5, 0, TAU);
        c.fill();
      }
    for (let i = 0; i < 3000; i++) {
      c.fillStyle = "rgba(0,0,0," + r() * 0.15 + ")";
      c.fillRect(r() * w, r() * h, 2, 2);
    }
    grime(c, w, h, r, 1.2);
  }
  /** White gallery plaster with faint hanging-hook holes and a scuffed skirting. */
  function galleryDraw(c, w, h) {
    const r = rnd("gallery");
    c.fillStyle = "#e6e2d8";
    c.fillRect(0, 0, w, h);
    for (let i = 0; i < 90; i++) {
      c.fillStyle =
        r() < 0.5 ? "rgba(255,255,250,0.05)" : "rgba(120,110,90,0.05)";
      c.beginPath();
      c.ellipse(r() * w, r() * h, 20 + r() * 60, 10 + r() * 30, 0, 0, TAU);
      c.fill();
    }
    for (let i = 0; i < 12; i++) {
      c.fillStyle = "rgba(60,50,40,0.5)";
      c.fillRect(r() * w, r() * h, 2, 2);
    }
    PM.weatherPass(c, w, h, r, {
      blotches: 30,
      dark: 0.08,
      streaks: 10,
      streak: 0.05,
      specks: 300,
      speckR: 1,
    });
  }
  /** Pale oak gallery floorboards. */
  function oakFloorDraw(c, w, h) {
    const r = rnd("oakfloor");
    const n = 8,
      bh = h / n;
    for (let i = 0; i < n; i++) {
      let x = -r() * 200;
      while (x < w) {
        const len = 120 + r() * 200,
          tone = 150 + r() * 30;
        c.fillStyle =
          "rgb(" +
          ((tone + 20) | 0) +
          "," +
          ((tone - 10) | 0) +
          "," +
          ((tone - 55) | 0) +
          ")";
        c.fillRect(x, i * bh, len, bh);
        for (let k = 0; k < 8; k++) {
          c.fillStyle = "rgba(80,50,20," + r() * 0.12 + ")";
          c.fillRect(x, i * bh + r() * bh, len, 1);
        }
        c.fillStyle = "rgba(40,24,10,0.6)";
        c.fillRect(x, i * bh, 2, bh);
        x += len;
      }
      c.fillStyle = "rgba(40,24,10,0.55)";
      c.fillRect(0, i * bh, w, 2);
    }
    PM.weatherPass(c, w, h, r, {
      blotches: 50,
      dark: 0.16,
      streaks: 0,
      specks: 800,
    });
  }
  /** Milky Thermolux glass panels (MoMA 1939 facade): 512² = 2 × 2 panes. */
  function thermoluxDraw(c, w, h) {
    const r = rnd("thermolux");
    for (let i = 0; i < 4; i++)
      for (let j = 0; j < 4; j++) {
        const x0 = (i * w) / 4,
          y0 = (j * h) / 4,
          s = w / 4;
        const broken =
          (i === 1 && j === 2) || (i === 3 && j === 0) || r() < 0.03;
        const g = c.createLinearGradient(0, y0, 0, y0 + s);
        if (broken) {
          g.addColorStop(0, "#1a1c1a");
          g.addColorStop(1, "#0c0d0c");
        } else {
          g.addColorStop(0, "#d8d8cc");
          g.addColorStop(1, "#b8b8ac");
        }
        c.fillStyle = g;
        c.fillRect(x0, y0, s, s);
        if (!broken) {
          for (let k = 0; k < 40; k++) {
            c.fillStyle = "rgba(90,80,60," + r() * 0.08 + ")";
            c.fillRect(x0 + r() * s, y0, 2 + r() * 6, s);
          }
          c.fillStyle = "rgba(80,70,50,0.25)";
          c.fillRect(x0, y0 + s * 0.85, s, s * 0.15);
          if (r() < 0.25) {
            c.strokeStyle = "rgba(40,40,40,0.6)";
            c.lineWidth = 1;
            const cx = x0 + r() * s,
              cy = y0 + r() * s;
            for (let k = 0; k < 7; k++) {
              c.beginPath();
              c.moveTo(cx, cy);
              const a = r() * TAU;
              c.lineTo(cx + Math.cos(a) * 30, cy + Math.sin(a) * 30);
              c.stroke();
            }
          }
        } else {
          c.fillStyle = "#b8b8ac";
          for (let k = 0; k < 3; k++) {
            const e = r() < 0.5;
            c.beginPath();
            c.moveTo(e ? x0 : x0 + s, y0 + r() * s);
            c.lineTo(x0 + s * (0.2 + r() * 0.6), y0 + r() * s);
            c.lineTo(e ? x0 : x0 + s, y0 + r() * s);
            c.fill();
          }
        }
        c.fillStyle = "#2a2c2a";
        c.fillRect(x0, y0, s, 3);
        c.fillRect(x0, y0, 3, s);
      }
  }
  Object.assign(PM.CUSTOM_TEX, {
    books_warm: [512, 512, booksDraw("warm")],
    books_dark: [512, 512, booksDraw("dark")],
    oak_panel: [512, 512, panelDraw(0x6a4424)],
    walnut_panel: [512, 512, panelDraw(0x4a2c18)],
    damask: [512, 512, damaskDraw],
    mosaic: [512, 512, mosaicDraw],
    rose_carpet: [512, 512, carpetDraw],
    gallery_plaster: [256, 256, galleryDraw],
    oak_floor: [512, 512, oakFloorDraw],
    thermolux: [512, 512, thermoluxDraw],
    moma_marble: [
      512,
      512,
      PM.ashlarDraw({
        base: 0xe8e4da,
        rows: 5,
        cols: 2,
        joint: 2,
        jointCol: 0xb8b2a4,
        vary: 0.04,
        seed: 41,
        weather: { blotches: 60, dark: 0.16, streaks: 60, streak: 0.12 },
      }),
    ],
    pink_marble: [
      512,
      512,
      PM.ashlarDraw({
        base: 0xe0cfc0,
        rows: 6,
        cols: 2,
        joint: 1.5,
        jointCol: 0xb8a898,
        vary: 0.05,
        seed: 43,
        chips: 0.08,
        weather: { blotches: 50, dark: 0.14, streaks: 50, streak: 0.1 },
      }),
    ],
    alg_brick: [
      512,
      512,
      PM.ashlarDraw({
        base: 0x7e3a2a,
        rows: 16,
        cols: 6,
        joint: 3,
        jointCol: 0x6a6258,
        vary: 0.2,
        seed: 47,
        chips: 0.1,
        weather: { blotches: 60, dark: 0.2, streaks: 40 },
      }),
    ],
  });
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
  PM.tapestryTex = function () {
    return PM.canvasTex(
      "pm2_tapestry",
      512,
      512,
      (c, w, h) => {
        const r = rnd("tapestry");
        c.fillStyle = "#4a3a24";
        c.fillRect(0, 0, w, h);
        c.fillStyle = "#6a2a1e";
        c.fillRect(0, 0, w, 36);
        c.fillRect(0, h - 36, w, 36);
        c.fillRect(0, 0, 36, h);
        c.fillRect(w - 36, 0, 36, h);
        for (let k = 0; k < 40; k++) {
          c.fillStyle = "#c8a050";
          c.fillRect(8 + k * 13, 12, 6, 12);
          c.fillRect(8 + k * 13, h - 24, 6, 12);
        }
        // forest-green millefleur background
        c.fillStyle = "#2a3e24";
        c.fillRect(36, 36, w - 72, h - 72);
        for (let i = 0; i < 500; i++) {
          c.fillStyle = ["#8a6a3a", "#a84a2a", "#e0c890", "#4a6a3a"][i % 4];
          c.beginPath();
          c.arc(40 + r() * (w - 80), 40 + r() * (h - 80), 2 + r() * 3, 0, TAU);
          c.fill();
        }
        // figures: a procession of three robed figures and a unicorn-ish white horse
        const fig = (x, y, col) => {
          c.fillStyle = col;
          c.beginPath();
          c.moveTo(x - 30, y + 110);
          c.quadraticCurveTo(x, y - 20, x + 30, y + 110);
          c.fill();
          c.fillStyle = "#d8b890";
          c.beginPath();
          c.arc(x, y, 14, 0, TAU);
          c.fill();
        };
        fig(140, 200, "#8a2a24");
        fig(230, 190, "#2a3a6a");
        fig(320, 205, "#8a6a2a");
        c.fillStyle = "#e8e0d0";
        c.beginPath();
        c.ellipse(410, 300, 50, 26, 0, 0, TAU);
        c.fill();
        c.fillRect(372, 300, 8, 60);
        c.fillRect(440, 300, 8, 60);
        c.beginPath();
        c.ellipse(455, 262, 14, 26, -0.6, 0, TAU);
        c.fill();
        c.strokeStyle = "#e0c890";
        c.lineWidth = 3;
        c.beginPath();
        c.moveTo(465, 240);
        c.lineTo(480, 212);
        c.stroke();
        for (let y = 0; y < h; y += 3) {
          c.fillStyle = "rgba(0,0,0,0.08)";
          c.fillRect(0, y, w, 1);
        } // weave
        grime(c, w, h, r, 1.1);
        c.fillStyle = "rgba(10,8,6,0.9)";
        c.beginPath();
        c.moveTo(w * 0.8, h);
        c.lineTo(w * 0.86, h * 0.7);
        c.lineTo(w * 0.93, h);
        c.fill(); // moth-eaten hole
      },
      { clamp: true },
    );
  };
  PM.caricatureTex = function () {
    return PM.canvasTex(
      "pm2_caric",
      512,
      512,
      (c) => {
        const s = 256;
        for (let i = 0; i < 4; i++) {
          const x0 = (i % 2) * s,
            y0 = Math.floor(i / 2) * s,
            r = rnd(510 + i);
          c.save();
          c.translate(x0, y0);
          c.fillStyle = "#ece4d0";
          c.fillRect(0, 0, s, s);
          c.strokeStyle = "#1a1612";
          c.lineWidth = 2.5;
          c.lineCap = "round";
          for (let f = 0; f < 3; f++) {
            // three exaggerated heads per sheet
            const cx = 50 + f * 78,
              cy = 110 + (r() - 0.5) * 30,
              hw = 20 + r() * 16,
              hh = 32 + r() * 22;
            c.beginPath();
            c.ellipse(cx, cy, hw, hh, (r() - 0.5) * 0.4, 0, TAU);
            c.stroke();
            c.beginPath();
            c.moveTo(cx - 6, cy - 2);
            c.quadraticCurveTo(cx + 10 + r() * 16, cy + 10, cx - 2, cy + 14);
            c.stroke(); // nose
            c.beginPath();
            c.arc(cx - 8, cy - 10, 2, 0, TAU);
            c.arc(cx + 8, cy - 10, 2, 0, TAU);
            c.stroke();
            c.beginPath();
            c.moveTo(cx - 10, cy + 22);
            c.quadraticCurveTo(cx, cy + 26 + r() * 6, cx + 10, cy + 20);
            c.stroke();
            if (r() < 0.6) {
              c.beginPath();
              c.moveTo(cx - hw - 6, cy - hh + 12);
              c.lineTo(cx + hw + 6, cy - hh + 10);
              c.lineTo(cx + hw * 0.5, cy - hh - 16);
              c.lineTo(cx - hw * 0.5, cy - hh - 14);
              c.closePath();
              c.stroke();
            } // hat
            c.beginPath();
            c.moveTo(cx - hw, cy + hh);
            c.quadraticCurveTo(cx, cy + hh + 50, cx + hw + 10, cy + hh + 70);
            c.stroke(); // collar/body line
            if (r() < 0.5) {
              c.beginPath();
              c.moveTo(cx + 8, cy + 22);
              c.lineTo(cx + 34, cy + 30);
              c.stroke();
            } // cigarette holder
          }
          c.fillStyle = "#1a1612";
          c.font = "italic 16px Georgia";
          c.fillText(
            [
              "Mon. lunch",
              "The usual table",
              "Tues., again",
              "No reservations",
            ][i],
            16,
            s - 18,
          );
          grime(c, s, s, r, 0.4);
          c.restore();
        }
      },
      { clamp: true },
    );
  };
  PM.groupPortraitTex = function () {
    return PM.canvasTex(
      "pm2_vicious",
      1024,
      512,
      (c, w, h) => {
        const r = rnd("vicious");
        const g = c.createLinearGradient(0, 0, 0, h);
        g.addColorStop(0, "#5a3a24");
        g.addColorStop(1, "#2a1a10");
        c.fillStyle = g;
        c.fillRect(0, 0, w, h);
        c.fillStyle = "#7a2a24";
        c.beginPath();
        c.ellipse(w / 2, h * 0.86, w * 0.36, h * 0.12, 0, 0, TAU);
        c.fill(); // the round table
        c.fillStyle = "#e8e0d0";
        c.beginPath();
        c.ellipse(w / 2, h * 0.84, w * 0.33, h * 0.09, 0, 0, TAU);
        c.fill();
        for (let i = 0; i < 10; i++) {
          const a = Math.PI + ((i + 0.5) / 10) * Math.PI,
            x = w / 2 + Math.cos(a) * w * 0.38,
            y = h * 0.62 + Math.sin(a) * h * 0.3;
          c.fillStyle = ["#2a2a30", "#3a2a24", "#4a3a3a", "#1a1a20", "#5a4a3a"][
            i % 5
          ];
          c.beginPath();
          c.moveTo(x - 40, y + 140);
          c.quadraticCurveTo(x, y - 10, x + 40, y + 140);
          c.fill();
          c.fillStyle = "#d8b898";
          c.beginPath();
          c.ellipse(x, y, 20 + r() * 8, 26 + r() * 10, 0, 0, TAU);
          c.fill();
          c.fillStyle = "#1a1410";
          if (r() < 0.5) c.fillRect(x - 24, y - 30, 48, 10);
          c.beginPath();
          c.arc(x - 7, y - 4, 2.5, 0, TAU);
          c.arc(x + 7, y - 4, 2.5, 0, TAU);
          c.fill();
        }
        for (let i = 0; i < 6; i++) {
          c.fillStyle = "#e8e0c0";
          c.fillRect(w * 0.3 + r() * w * 0.4, h * 0.8, 10, 14);
        } // cups & glasses
        c.fillStyle = "#d8c080";
        c.font = "italic bold 30px Georgia";
        c.textAlign = "center";
        c.fillText(
          'The Round Table, 1931 — "Nobody here but us wits"',
          w / 2,
          44,
        );
        crackle(c, 0, 0, w, h, r, 120);
        grime(c, w, h, r, 1.2);
      },
      { clamp: true },
    );
  };

  /** Dusk sky (garden ceiling) and a wall of distant towers with lit windows. */
  PM.skyTex = function () {
    return PM.canvasTex("pm2_sky", 512, 512, (c, w, h) => {
      const r = rnd("sky");
      const g = c.createRadialGradient(
        w / 2,
        h / 2,
        10,
        w / 2,
        h / 2,
        w * 0.72,
      );
      g.addColorStop(0, "#9aa070");
      g.addColorStop(0.5, "#6a7050");
      g.addColorStop(1, "#2a3024");
      c.fillStyle = g;
      c.fillRect(0, 0, w, h);
      for (let i = 0; i < 60; i++) {
        c.fillStyle = "rgba(200,190,150," + r() * 0.08 + ")";
        c.beginPath();
        c.ellipse(
          r() * w,
          r() * h,
          40 + r() * 90,
          12 + r() * 30,
          r() * 3,
          0,
          TAU,
        );
        c.fill();
      }
    });
  };
  PM.skylineTex = function () {
    return PM.canvasTex(
      "pm2_skyline",
      1024,
      512,
      (c, w, h) => {
        const r = rnd("skyline");
        const g = c.createLinearGradient(0, 0, 0, h);
        g.addColorStop(0, "#6a7050");
        g.addColorStop(0.6, "#8a8a60");
        g.addColorStop(1, "#4a4a38");
        c.fillStyle = g;
        c.fillRect(0, 0, w, h);
        let x = 0;
        while (x < w) {
          const bw = 40 + r() * 90,
            bh = h * (0.35 + r() * 0.6);
          c.fillStyle =
            "rgb(" +
            ((30 + r() * 20) | 0) +
            "," +
            ((32 + r() * 20) | 0) +
            "," +
            ((30 + r() * 16) | 0) +
            ")";
          c.fillRect(x, h - bh, bw, bh);
          if (r() < 0.3) {
            c.beginPath();
            c.moveTo(x + bw * 0.3, h - bh);
            c.lineTo(x + bw * 0.5, h - bh - 40 - r() * 60);
            c.lineTo(x + bw * 0.7, h - bh);
            c.fill();
          }
          if (r() < 0.25) {
            c.fillStyle = "rgba(0,0,0,0)";
            c.clearRect(x + bw * 0.6, h - bh, bw * 0.4, 30 + r() * 60);
            c.fillStyle = "#6a7050";
            c.fillRect(x + bw * 0.6, h - bh, bw * 0.4, 30 + r() * 40);
          } // broken top
          for (let yy = h - bh + 10; yy < h - 10; yy += 12)
            for (let xx = x + 5; xx < x + bw - 6; xx += 9) {
              if (r() < 0.06) {
                c.fillStyle = "rgba(230,190,110,0.8)";
                c.fillRect(xx, yy, 4, 6);
              } else if (r() < 0.4) {
                c.fillStyle = "rgba(10,10,10,0.5)";
                c.fillRect(xx, yy, 4, 6);
              }
            }
          x += bw + r() * 6;
        }
      },
      { clamp: true },
    );
  };

  // -------------------------------------------------------------------
  // Signs / placards
  // -------------------------------------------------------------------
  /** Museum wall label (small, clean) or Brute scrawl. style: 'label' | 'brute' | 'brass'. Returns material key. */
  PM.labelKey = function (key, lines, style, w, h) {
    w = w || 512;
    h = h || 256;
    const tex = PM.canvasTex(
      "pm2_lbl_" + key,
      w,
      h,
      (c) => {
        const r = rnd("lbl" + key);
        if (style === "brute") {
          c.fillStyle = "#b8ac90";
          c.fillRect(0, 0, w, h);
          for (let i = 0; i < 20; i++) {
            c.fillStyle = "rgba(90,20,10," + r() * 0.3 + ")";
            c.beginPath();
            c.arc(r() * w, r() * h, 4 + r() * 20, 0, TAU);
            c.fill();
          }
          c.fillStyle = "#5a0a06";
          c.textAlign = "center";
          c.textBaseline = "middle";
          let fs = Math.floor((h * 0.75) / lines.length);
          c.font = "bold " + fs + 'px Impact, "Arial Black", sans-serif';
          let mw = 0;
          for (const t of lines) mw = Math.max(mw, c.measureText(t).width);
          if (mw > w * 0.92) {
            fs = Math.floor((fs * w * 0.92) / mw);
            c.font = "bold " + fs + 'px Impact, "Arial Black", sans-serif';
          }
          lines.forEach((t, i) => {
            c.save();
            c.translate(
              w / 2,
              h / 2 + (i - (lines.length - 1) / 2) * fs * 1.05,
            );
            c.rotate((r() - 0.5) * 0.1);
            c.fillText(t, 0, 0);
            c.restore();
          });
        } else if (style === "brass") {
          c.fillStyle = "#6a5428";
          c.fillRect(0, 0, w, h);
          c.strokeStyle = "#c8a860";
          c.lineWidth = 8;
          c.strokeRect(6, 6, w - 12, h - 12);
          c.fillStyle = "#e8d090";
          c.textAlign = "center";
          c.textBaseline = "middle";
          const fs = Math.floor((h * 0.6) / lines.length);
          c.font = "bold " + fs + "px Georgia, serif";
          lines.forEach((t, i) =>
            c.fillText(
              t,
              w / 2,
              h / 2 + (i - (lines.length - 1) / 2) * fs * 1.15,
            ),
          );
          grime(c, w, h, r, 0.5);
        } else {
          c.fillStyle = "#f2efe6";
          c.fillRect(0, 0, w, h);
          c.fillStyle = "#1a1a1a";
          c.textAlign = "left";
          c.textBaseline = "top";
          let y = 16;
          lines.forEach((t, i) => {
            const fs = i === 0 ? Math.floor(h * 0.16) : Math.floor(h * 0.1);
            c.font =
              (i === 0 ? "bold " : "") +
              fs +
              'px "Helvetica Neue", Helvetica, Arial, sans-serif';
            c.fillText(t, 18, y);
            y += fs * 1.35;
          });
          grime(c, w, h, r, 0.3);
        }
      },
      { clamp: true },
    );
    return PM.texMat("pm2_lbl_" + key, tex, { rough: 0.8 });
  };

  // -------------------------------------------------------------------
  // Furniture helpers
  // -------------------------------------------------------------------
  /**
   * Bookcase run against a wall: face centre line from (x0,z0) to (x1,z1) (the face looks toward ry),
   * y0..y1, depth d. Uprights every ~1.2 m, cornice on top. Books are texture (world-projected).
   */
  PM.bookcase = function (b, x0, z0, x1, z1, y0, y1, ry, opts) {
    opts = opts || {};
    const d = opts.depth || 0.45,
      key = opts.books || "books",
      frame = opts.frame || "walnut";
    const len = Math.hypot(x1 - x0, z1 - z0),
      ang = Math.atan2(-(z1 - z0), x1 - x0);
    const c = Math.cos(ry),
      s = Math.sin(ry);
    const mx = (x0 + x1) / 2 - (s * d) / 2,
      mz = (z0 + z1) / 2 - (c * d) / 2;
    // the book face: a thin box (books texture on its front)
    b.box(
      key,
      mx + s * (d / 2 - 0.03),
      y0,
      mz + c * (d / 2 - 0.03),
      len,
      y1 - y0,
      0.06,
      { ry: ang, seg: false, grime: 0.25, noAO: true },
    );
    b.box(frame, mx, y0, mz, len, y1 - y0, d - 0.08, {
      ry: ang,
      seg: false,
      grime: 0.3,
    });
    b.box(frame, mx + s * 0.03, y1, mz + c * 0.03, len + 0.1, 0.16, d + 0.06, {
      ry: ang,
      seg: false,
      grime: 0.3,
    });
    b.box(frame, mx + s * 0.02, y0, mz + c * 0.02, len, 0.12, d + 0.02, {
      ry: ang,
      seg: false,
    });
    const n = Math.max(1, Math.round(len / 1.2));
    for (let i = 0; i <= n; i++) {
      const t = i / n,
        px = x0 + (x1 - x0) * t - s * (d / 2 - 0.02),
        pz = z0 + (z1 - z0) * t - c * (d / 2 - 0.02);
      b.box(frame, px, y0, pz, 0.08, y1 - y0, d, {
        ry: ang,
        seg: false,
        grime: 0.3,
      });
    }
    if (opts.collide !== false)
      PM.colWall(
        x0 - (s * d) / 2,
        z0 - (c * d) / 2,
        x1 - (s * d) / 2,
        z1 - (c * d) / 2,
        d,
        y0,
        y1,
        { walkable: false },
      );
  };
  /** Club armchair (leather). */
  PM.armchair = function (b, x, y, z, ry, key) {
    key = key || "leather_brown";
    const M = PM.m4(x, y, z, ry);
    const add = (g, m, k) =>
      b.add(k || key, g, {
        m: new THREE.Matrix4().multiplyMatrices(M, m),
        grime: 0.45,
      });
    add(new THREE.BoxGeometry(0.85, 0.42, 0.8), PM.m4(0, 0.21, 0));
    add(
      new THREE.BoxGeometry(0.85, 0.55, 0.2),
      PM.m4(0, 0.62, -0.32, 0, -0.12),
    );
    for (const sg of [-1, 1])
      add(
        new THREE.CylinderGeometry(0.12, 0.12, 0.8, 8),
        PM.m4(sg * 0.37, 0.56, 0, 0, Math.PI / 2),
      );
    add(
      new THREE.BoxGeometry(0.72, 0.12, 0.62),
      PM.m4(0, 0.47, 0.05),
      "fabric",
    );
  };
  /** Table lamp with emissive shade and a glow sprite in the given parent. */
  PM.tableLamp = function (b, x, y, z, parent, col) {
    b.cyl("brass", x, y, z, 0.07, 0.1, 0.05, 8, { hSeg: 1 });
    b.cyl("brass", x, y + 0.05, z, 0.02, 0.02, 0.35, 6, { hSeg: 1 });
    b.cyl("lamp_shade", x, y + 0.35, z, 0.12, 0.2, 0.22, 10, {
      hSeg: 1,
      noAO: true,
      open: true,
    });
    PM.glow(V3(x, y + 0.45, z), col || 0xffc070, 0.9, parent, {
      intensity: 1.1,
      flicker: 0.05,
    });
  };
  /** Display vitrine (glass case on a plinth). */
  PM.vitrine = function (b, x, y, z, w, d, h, ry) {
    b.box("walnut", x, y, z, w, 0.9, d, { ry, seg: false, grime: 0.3 });
    b.box("glass_dark", x, y + 0.9, z, w - 0.04, h, d - 0.04, {
      ry,
      seg: false,
      noAO: true,
      grime: 0.1,
    });
    for (const [dx, dz] of [
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 1],
    ]) {
      const c = Math.cos(ry || 0),
        s = Math.sin(ry || 0),
        lx = dx * (w / 2 - 0.02),
        lz = dz * (d / 2 - 0.02);
      b.box(
        "brass",
        x + lx * c + lz * s,
        y + 0.9,
        z - lx * s + lz * c,
        0.03,
        h,
        0.03,
        { seg: false },
      );
    }
    PM.col(x, z, w, d, y, y + 0.9 + h, ry || 0, { walkable: false });
  };

  /** Turn a geometry inside-out (for domes seen from within): flips triangle winding and normals. */
  PM.invertGeo = function (geo) {
    const g = geo.index ? geo.toNonIndexed() : geo;
    for (const name of ["position", "normal", "uv"]) {
      const at = g.attributes[name];
      if (!at) continue;
      const n = at.itemSize,
        arr = at.array;
      for (let t = 0; t < at.count; t += 3)
        for (let k = 0; k < n; k++) {
          const i1 = (t + 1) * n + k,
            i2 = (t + 2) * n + k;
          const tmp = arr[i1];
          arr[i1] = arr[i2];
          arr[i2] = tmp;
        }
    }
    const nr = g.attributes.normal;
    if (nr)
      for (let i = 0; i < nr.array.length; i++) nr.array[i] = -nr.array[i];
    return g;
  };
  /** Painted dome: u around, v up — gilded frieze, a ring of robed figures on clouds, sky, an oculus of light. */
  PM.domeTex = function () {
    return PM.canvasTex("pm2_dome", 1024, 512, (c, w, h) => {
      const r = rnd("dome");
      const g = c.createLinearGradient(0, h, 0, 0);
      g.addColorStop(0, "#c8a868");
      g.addColorStop(0.12, "#8a6a3a");
      g.addColorStop(0.2, "#5a7aa0");
      g.addColorStop(0.75, "#8aa8c8");
      g.addColorStop(0.92, "#e8e0c0");
      g.addColorStop(1, "#fff8e0");
      c.fillStyle = g;
      c.fillRect(0, 0, w, h);
      for (let i = 0; i < 50; i++) {
        c.fillStyle = "rgba(240,232,215," + (0.2 + r() * 0.3) + ")";
        c.beginPath();
        c.ellipse(
          r() * w,
          h * (0.4 + r() * 0.35),
          30 + r() * 60,
          10 + r() * 18,
          0,
          0,
          TAU,
        );
        c.fill();
      }
      for (let k = 0; k < 8; k++) {
        const x = ((k + 0.5) * w) / 8,
          y = h * 0.62;
        c.fillStyle = ["#8a2a1e", "#2a4a8a", "#c8a040", "#4a6a3a"][k % 4];
        c.beginPath();
        c.moveTo(x - 26, y + 60);
        c.quadraticCurveTo(x, y - 30, x + 26, y + 60);
        c.fill();
        c.fillStyle = "#e8c8a0";
        c.beginPath();
        c.arc(x, y - 16, 11, 0, TAU);
        c.fill();
        c.strokeStyle = "#e8d090";
        c.lineWidth = 3;
        c.beginPath();
        c.arc(x, y - 16, 16, 0, TAU);
        c.stroke();
      }
      c.fillStyle = "#c8a050";
      c.fillRect(0, h * 0.86, w, h * 0.05);
      for (let x = 0; x < w; x += 24) {
        c.fillStyle = "#6a4a20";
        c.fillRect(x, h * 0.87, 10, h * 0.03);
      }
      for (let k = 0; k < 16; k++) {
        c.fillStyle = "rgba(200,160,80,0.8)";
        c.fillRect((k * w) / 16, 0, 4, h * 0.86);
      } // gilded ribs
      crackle(c, 0, 0, w, h, r, 120);
      grime(c, w, h, r, 1.0);
      c.fillStyle = "rgba(30,24,16,0.6)";
      c.beginPath();
      c.ellipse(w * 0.3, h * 0.45, 70, 40, 0.3, 0, TAU);
      c.fill(); // water stain
    });
  };

  // -------------------------------------------------------------------
  // The Algonquin cat (a small procedural tabby, animated tail)
  // -------------------------------------------------------------------
  PM.catMesh = function () {
    const g = new THREE.Group();
    g.name = "pm2_cat";
    const fur = PM.mat("fur_orange"),
      dark = PM.mat("iron");
    const mk = (geo, mat, x, y, z, rx, ry, rz) => {
      const n = geo.attributes.position.count;
      geo.setAttribute(
        "color",
        new THREE.BufferAttribute(new Float32Array(n * 3).fill(1), 3),
      );
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, y, z);
      m.rotation.set(rx || 0, ry || 0, rz || 0);
      m.castShadow = false;
      g.add(m);
      return m;
    };
    mk(new THREE.SphereGeometry(0.13, 10, 8), fur, 0, 0.13, 0).scale.set(
      1,
      0.75,
      1.6,
    ); // body (loaf)
    mk(new THREE.SphereGeometry(0.085, 10, 8), fur, 0, 0.2, 0.2); // head
    for (const sx of [-1, 1])
      mk(
        new THREE.ConeGeometry(0.03, 0.06, 4),
        fur,
        sx * 0.045,
        0.28,
        0.2,
        0,
        0,
        -sx * 0.25,
      ); // ears
    for (const sx of [-1, 1])
      mk(
        new THREE.SphereGeometry(0.012, 6, 4),
        PM.mat("lamp_green"),
        sx * 0.03,
        0.215,
        0.275,
      ); // glinting eyes
    mk(new THREE.SphereGeometry(0.012, 6, 4), dark, 0, 0.19, 0.285); // nose
    const tail = new THREE.Group();
    tail.position.set(0, 0.08, -0.2);
    g.add(tail);
    const tm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.018, 0.028, 0.28, 6),
      fur,
    );
    tm.geometry.setAttribute(
      "color",
      new THREE.BufferAttribute(
        new Float32Array(tm.geometry.attributes.position.count * 3).fill(1),
        3,
      ),
    );
    tm.position.set(0.1, 0, -0.04);
    tm.rotation.set(0, 0, 1.3);
    tail.add(tm);
    g.userData.tail = tail;
    return g;
  };

  // -------------------------------------------------------------------
  // Glows queued by the copied dress kit (fluorescent tubes / string lights)
  // → parented to whichever interior cell contains them (else the scene).
  // -------------------------------------------------------------------
  PM.flushKitGlows = function () {
    const list = (PM.glows || []).splice(0);
    for (const g of list) {
      let parent = null;
      for (const k in PM.cells) {
        const c = PM.cells[k];
        if (
          Math.abs(g.pos.x - c.origin.x) < 170 &&
          Math.abs(g.pos.z - c.origin.z) < 170
        ) {
          parent = c.root;
          break;
        }
      }
      PM.glow(g.pos, g.color, g.size, parent, { intensity: 1.0 });
    }
  };
})();
