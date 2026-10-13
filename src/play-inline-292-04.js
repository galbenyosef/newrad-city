// play-inline-292 04 — fillrect
// Lines 630-944 of readable/play-inline-292.pretty.js (statement-aligned).
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
