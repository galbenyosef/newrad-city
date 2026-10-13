// play-inline-292 03 — fillstyle
// Lines 336-629 of readable/play-inline-292.pretty.js (statement-aligned).
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
