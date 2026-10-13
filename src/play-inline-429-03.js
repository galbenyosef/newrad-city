// play-inline-429 03 — fillstyle
// Lines 246-910 of readable/play-inline-429.pretty.js (statement-aligned).
  const customPaint = {
    wallpaper(x, S, r) {
      // faded damask
      x.fillStyle = "#b8a48a";
      x.fillRect(0, 0, S, S);
      x.fillStyle = "rgba(120,70,60,0.55)";
      for (let j = 0; j < 4; j++)
        for (let i = 0; i < 4; i++) {
          const cx = (i * S) / 4 + ((j % 2) * S) / 8 + S / 8,
            cy = (j * S) / 4 + S / 8;
          x.beginPath();
          x.ellipse(cx, cy, S / 22, S / 12, 0, 0, Math.PI * 2);
          x.fill();
          x.beginPath();
          x.ellipse(
            cx - S / 18,
            cy + S / 30,
            S / 40,
            S / 22,
            0.6,
            0,
            Math.PI * 2,
          );
          x.fill();
          x.beginPath();
          x.ellipse(
            cx + S / 18,
            cy + S / 30,
            S / 40,
            S / 22,
            -0.6,
            0,
            Math.PI * 2,
          );
          x.fill();
        }
      x.fillStyle = "rgba(90,60,40,0.18)";
      for (let i = 0; i < S; i += S / 16) x.fillRect(i, 0, 2, S);
      K.stains(x, 0, 0, S, S, 18, 11, 0.4, [70, 50, 30]);
      K.streaks(x, 0, 0, S, S, 30, 12, 0.25);
    },
    wallpaper_green(x, S, r) {
      x.fillStyle = "#6f7a5c";
      x.fillRect(0, 0, S, S);
      for (let i = 0; i < S; i += S / 8) {
        x.fillStyle = "rgba(40,50,30,0.35)";
        x.fillRect(i, 0, S / 32, S);
        x.fillStyle = "rgba(200,190,140,0.2)";
        x.fillRect(i + S / 16, 0, 3, S);
      }
      K.stains(x, 0, 0, S, S, 16, 21, 0.45, [50, 40, 25]);
      K.streaks(x, 0, 0, S, S, 24, 22, 0.3);
    },
    hextile(x, S, r) {
      // Katz's small white hex floor
      x.fillStyle = "#6f6a60";
      x.fillRect(0, 0, S, S);
      const R = S / 16,
        h = (R * Math.sqrt(3)) / 2;
      for (let j = -1; j < S / h + 1; j++)
        for (let i = -1; i < S / (R * 1.5) + 1; i++) {
          const cx = i * R * 1.5,
            cy = j * h * 2 + (i % 2 ? h : 0);
          const dark = r() < 0.05;
          x.fillStyle = dark
            ? "#3c3a36"
            : "rgb(" +
              ((205 + r() * 30) | 0) +
              "," +
              ((200 + r() * 28) | 0) +
              "," +
              ((188 + r() * 25) | 0) +
              ")";
          x.beginPath();
          for (let k = 0; k < 6; k++) {
            const a = (k * Math.PI) / 3;
            const px = cx + Math.cos(a) * (R - 1.5),
              py = cy + Math.sin(a) * (R - 1.5);
            if (k) x.lineTo(px, py);
            else x.moveTo(px, py);
          }
          x.fill();
        }
      K.stains(x, 0, 0, S, S, 22, 31, 0.5, [70, 55, 30]);
    },
    checker(x, S, r) {
      const n = 8,
        c = S / n;
      for (let j = 0; j < n; j++)
        for (let i = 0; i < n; i++) {
          const w = (i + j) % 2 === 0;
          const v = w ? 200 + r() * 30 : 30 + r() * 20;
          x.fillStyle =
            "rgb(" +
            (v | 0) +
            "," +
            ((v * 0.97) | 0) +
            "," +
            ((v * 0.9) | 0) +
            ")";
          x.fillRect(i * c, j * c, c, c);
        }
      x.strokeStyle = "rgba(0,0,0,0.3)";
      for (let i = 0; i <= n; i++) {
        x.beginPath();
        x.moveTo(i * c, 0);
        x.lineTo(i * c, S);
        x.stroke();
        x.beginPath();
        x.moveTo(0, i * c);
        x.lineTo(S, i * c);
        x.stroke();
      }
      K.stains(x, 0, 0, S, S, 20, 41, 0.5, [60, 45, 25]);
    },
    mosaic(x, S, r) {
      // lobby mosaic floor: border + rosettes
      x.fillStyle = "#c9bca2";
      x.fillRect(0, 0, S, S);
      const c = S / 32;
      for (let j = 0; j < 32; j++)
        for (let i = 0; i < 32; i++) {
          const v = 180 + r() * 50;
          x.fillStyle =
            "rgb(" +
            (v | 0) +
            "," +
            ((v * 0.93) | 0) +
            "," +
            ((v * 0.8) | 0) +
            ")";
          x.fillRect(i * c + 0.5, j * c + 0.5, c - 1, c - 1);
        }
      x.strokeStyle = "#6e2a22";
      x.lineWidth = c;
      x.strokeRect(c * 2, c * 2, S - c * 4, S - c * 4);
      x.strokeStyle = "#2e4a3c";
      x.lineWidth = c * 0.6;
      x.strokeRect(c * 3.5, c * 3.5, S - c * 7, S - c * 7);
      x.fillStyle = "#7a3026";
      x.beginPath();
      x.arc(S / 2, S / 2, S / 7, 0, Math.PI * 2);
      x.fill();
      x.fillStyle = "#c8a050";
      for (let k = 0; k < 8; k++) {
        const a = (k * Math.PI) / 4;
        x.beginPath();
        x.ellipse(
          S / 2 + (Math.cos(a) * S) / 11,
          S / 2 + (Math.sin(a) * S) / 11,
          S / 40,
          S / 90,
          a,
          0,
          Math.PI * 2,
        );
        x.fill();
      }
      K.stains(x, 0, 0, S, S, 20, 51, 0.45, [60, 45, 25]);
    },
    tin(x, S, r) {
      // pressed tin ceiling
      x.fillStyle = "#b8b2a2";
      x.fillRect(0, 0, S, S);
      const c = S / 4;
      for (let j = 0; j < 4; j++)
        for (let i = 0; i < 4; i++) {
          const X = i * c,
            Y = j * c;
          const g = x.createRadialGradient(
            X + c / 2,
            Y + c / 2,
            c * 0.05,
            X + c / 2,
            Y + c / 2,
            c * 0.5,
          );
          g.addColorStop(0, "#dcd6c6");
          g.addColorStop(0.6, "#9c9686");
          g.addColorStop(1, "#c4beae");
          x.fillStyle = g;
          x.fillRect(X + 3, Y + 3, c - 6, c - 6);
          x.strokeStyle = "#7a7466";
          x.lineWidth = 3;
          x.strokeRect(X + 6, Y + 6, c - 12, c - 12);
          x.beginPath();
          x.arc(X + c / 2, Y + c / 2, c * 0.18, 0, Math.PI * 2);
          x.stroke();
        }
      K.stains(x, 0, 0, S, S, 20, 61, 0.55, [90, 60, 30]);
    },
    lace(x, S, r) {
      // cast-iron lace (alpha cut-out): Hotel Chelsea balconies & stair balusters
      x.clearRect(0, 0, S, S);
      x.strokeStyle = "#fff";
      x.fillStyle = "#fff";
      x.lineWidth = S / 40;
      x.strokeRect(0, S * 0.02, S, S * 0.96); // top/bottom rails
      x.fillRect(0, 0, S, S * 0.07);
      x.fillRect(0, S * 0.93, S, S * 0.07);
      const n = 2,
        w = S / n;
      for (let i = 0; i < n; i++) {
        const cx = i * w + w / 2;
        x.lineWidth = S / 64;
        x.beginPath();
        x.moveTo(i * w + 2, S * 0.07);
        x.lineTo(i * w + 2, S * 0.93);
        x.stroke(); // posts
        // central flower
        x.beginPath();
        x.arc(cx, S * 0.5, w * 0.16, 0, Math.PI * 2);
        x.stroke();
        x.beginPath();
        x.arc(cx, S * 0.5, w * 0.05, 0, Math.PI * 2);
        x.fill();
        for (let k = 0; k < 4; k++) {
          const a = (k * Math.PI) / 2 + Math.PI / 4;
          x.beginPath();
          x.ellipse(
            cx + Math.cos(a) * w * 0.28,
            S * 0.5 + Math.sin(a) * w * 0.28,
            w * 0.12,
            w * 0.05,
            a,
            0,
            Math.PI * 2,
          );
          x.stroke();
        }
        // C-scrolls top & bottom
        for (const yy of [0.2, 0.8]) {
          x.beginPath();
          x.arc(cx - w * 0.18, S * yy, w * 0.12, -Math.PI * 0.5, Math.PI * 0.9);
          x.stroke();
          x.beginPath();
          x.arc(cx + w * 0.18, S * yy, w * 0.12, Math.PI * 0.1, Math.PI * 1.5);
          x.stroke();
        }
        // diamond frame
        x.beginPath();
        x.moveTo(cx, S * 0.1);
        x.lineTo(i * w + w * 0.95, S * 0.5);
        x.lineTo(cx, S * 0.9);
        x.lineTo(i * w + w * 0.05, S * 0.5);
        x.closePath();
        x.stroke();
      }
    },
    rooftile(x, S, r) {
      // glazed Chinese roof tiles (tinted by vertex colour)
      x.fillStyle = "#3a3a34";
      x.fillRect(0, 0, S, S);
      const n = 8,
        c = S / n;
      for (let i = 0; i < n; i++) {
        const g = x.createLinearGradient(i * c, 0, i * c + c, 0);
        g.addColorStop(0, "#5a5a52");
        g.addColorStop(0.5, "#e8e8d8");
        g.addColorStop(1, "#4a4a42");
        x.fillStyle = g;
        x.fillRect(i * c + 2, 0, c - 4, S);
        for (let j = 0; j < 6; j++) {
          x.fillStyle = "rgba(20,20,15,0.5)";
          x.fillRect(i * c, (j * S) / 6, c, 3);
        }
      }
      K.stains(x, 0, 0, S, S, 14, 71, 0.5, [40, 50, 30]);
      K.streaks(x, 0, 0, S, S, 20, 72, 0.3);
    },
    lacquer(x, S, r) {
      // red lacquered panel with gold fret border
      x.fillStyle = "#8a1a12";
      x.fillRect(0, 0, S, S);
      x.strokeStyle = "#c89a3a";
      x.lineWidth = S / 40;
      x.strokeRect(S * 0.06, S * 0.06, S * 0.88, S * 0.88);
      x.lineWidth = S / 80;
      for (let i = 0; i < 6; i++) {
        const X = S * 0.12 + i * S * 0.13;
        x.beginPath();
        x.moveTo(X, S * 0.12);
        x.lineTo(X + S * 0.08, S * 0.12);
        x.lineTo(X + S * 0.08, S * 0.2);
        x.lineTo(X + S * 0.03, S * 0.2);
        x.stroke();
      }
      K.stains(x, 0, 0, S, S, 18, 81, 0.45, [30, 10, 5]);
      K.grain(x, 0, 0, S, S, 30, 82);
    },
    plaster(x, S, r) {
      // subtle stained plaster (no big blotches)
      x.fillStyle = "#cbc3b1";
      x.fillRect(0, 0, S, S);
      for (let i = 0; i < 60; i++) {
        const px = r() * S,
          py = r() * S,
          rad = 20 + r() * 90,
          g = x.createRadialGradient(px, py, 0, px, py, rad);
        const t = r() < 0.5 ? "150,140,120" : "225,218,200";
        g.addColorStop(0, "rgba(" + t + ",0.16)");
        g.addColorStop(1, "rgba(" + t + ",0)");
        x.fillStyle = g;
        x.fillRect(px - rad, py - rad, rad * 2, rad * 2);
      }
      x.strokeStyle = "rgba(70,60,50,0.35)";
      x.lineWidth = 0.8;
      for (let i = 0; i < 5; i++) {
        x.beginPath();
        let px = r() * S,
          py = r() * S;
        x.moveTo(px, py);
        for (let k = 0; k < 5; k++) {
          const qx = px + (r() - 0.5) * 70,
            qy = py + (r() - 0.3) * 60;
          x.quadraticCurveTo(
            px + (r() - 0.5) * 30,
            py + (r() - 0.5) * 30,
            qx,
            qy,
          );
          px = qx;
          py = qy;
        }
        x.stroke();
      }
      K.streaks(x, 0, 0, S, S, 14, 7, 0.12);
      K.grain(x, 0, 0, S, S, 22, 8);
    },
    marble(x, S, r) {
      x.fillStyle = "#e4ded0";
      x.fillRect(0, 0, S, S);
      for (let i = 0; i < 30; i++) {
        const px = r() * S,
          py = r() * S,
          rad = 30 + r() * 110,
          g = x.createRadialGradient(px, py, 0, px, py, rad);
        const t = r() < 0.5 ? "200,194,180" : "245,242,232";
        g.addColorStop(0, "rgba(" + t + ",0.35)");
        g.addColorStop(1, "rgba(" + t + ",0)");
        x.fillStyle = g;
        x.fillRect(px - rad, py - rad, rad * 2, rad * 2);
      }
      for (let i = 0; i < 14; i++) {
        x.strokeStyle =
          "rgba(120,112,100," + (0.12 + r() * 0.22).toFixed(2) + ")";
        x.lineWidth = 0.6 + r() * 1.6;
        x.beginPath();
        let px = r() * S,
          py = r() * S;
        x.moveTo(px, py);
        for (let k = 0; k < 5; k++) {
          const qx = px + (r() - 0.3) * 120,
            qy = py + (r() - 0.5) * 80;
          x.bezierCurveTo(
            px + (r() - 0.5) * 60,
            py + (r() - 0.5) * 60,
            qx + (r() - 0.5) * 60,
            qy + (r() - 0.5) * 60,
            qx,
            qy,
          );
          px = qx;
          py = qy;
        }
        x.stroke();
      }
      x.strokeStyle = "rgba(60,55,50,0.35)";
      x.lineWidth = 2;
      x.strokeRect(1, 1, S - 2, S - 2);
      K.stains(x, 0, 0, S, S, 6, 91, 0.2);
    },
    terrazzo(x, S, r) {
      x.fillStyle = "#9a948a";
      x.fillRect(0, 0, S, S);
      for (let i = 0; i < 1600; i++) {
        const v = r();
        x.fillStyle =
          v < 0.3
            ? "#5a5650"
            : v < 0.6
              ? "#c8c2b4"
              : v < 0.8
                ? "#8a6a52"
                : "#3a3a3a";
        x.fillRect(r() * S, r() * S, 2 + r() * 5, 2 + r() * 5);
      }
      K.stains(x, 0, 0, S, S, 20, 101, 0.45);
    },
    padded(x, S, r) {
      // padded / tiled cell wall
      x.fillStyle = "#a8a494";
      x.fillRect(0, 0, S, S);
      const c = S / 4;
      for (let j = 0; j < 4; j++)
        for (let i = 0; i < 4; i++) {
          const g = x.createRadialGradient(
            i * c + c / 2,
            j * c + c / 2,
            2,
            i * c + c / 2,
            j * c + c / 2,
            c * 0.7,
          );
          g.addColorStop(0, "#c4c0ae");
          g.addColorStop(1, "#6e6a5c");
          x.fillStyle = g;
          x.fillRect(i * c + 1, j * c + 1, c - 2, c - 2);
        }
      K.stains(x, 0, 0, S, S, 24, 111, 0.6, [70, 50, 30]);
    },
    celltile(x, S, r) {
      // glazed institutional wall tile: green dado
      x.fillStyle = "#b8b8a6";
      x.fillRect(0, 0, S, S);
      const c = S / 8;
      for (let j = 0; j < 8; j++)
        for (let i = 0; i < 8; i++) {
          const v = 170 + r() * 30;
          x.fillStyle =
            "rgb(" +
            ((v * 0.8) | 0) +
            "," +
            (v | 0) +
            "," +
            ((v * 0.85) | 0) +
            ")";
          x.fillRect(i * c + 1, j * c + 1, c - 2, c - 2);
        }
      K.stains(x, 0, 0, S, S, 20, 121, 0.55, [60, 50, 30]);
      K.streaks(x, 0, 0, S, S, 20, 122, 0.3);
    },
    carpet(x, S, r) {
      x.fillStyle = "#6a2020";
      x.fillRect(0, 0, S, S);
      x.strokeStyle = "#b08a40";
      x.lineWidth = 3;
      for (let j = 0; j < 4; j++)
        for (let i = 0; i < 4; i++) {
          const cx = (i * S) / 4 + S / 8,
            cy = (j * S) / 4 + S / 8;
          x.beginPath();
          x.moveTo(cx, cy - S / 12);
          x.lineTo(cx + S / 12, cy);
          x.lineTo(cx, cy + S / 12);
          x.lineTo(cx - S / 12, cy);
          x.closePath();
          x.stroke();
        }
      K.grain(x, 0, 0, S, S, 40, 131);
      K.stains(x, 0, 0, S, S, 20, 132, 0.5, [30, 20, 10]);
    },
    velvet(x, S, r) {
      x.fillStyle = "#7a1c1c";
      x.fillRect(0, 0, S, S);
      for (let i = 0; i < S; i += 6) {
        x.fillStyle =
          "rgba(0,0,0," + (0.1 + 0.1 * Math.sin(i * 0.3)).toFixed(2) + ")";
        x.fillRect(i, 0, 3, S);
      }
      K.grain(x, 0, 0, S, S, 30, 141);
      K.stains(x, 0, 0, S, S, 12, 142, 0.4, [20, 10, 5]);
    },
    sawdust(x, S, r) {
      // O'Rourke's: worn floorboards under a drift of sawdust
      x.fillStyle = "#6a4a2e";
      x.fillRect(0, 0, S, S);
      const n = 8,
        w = S / n;
      for (let i = 0; i < n; i++) {
        const v = 0.8 + r() * 0.3;
        x.fillStyle =
          "rgb(" +
          ((110 * v) | 0) +
          "," +
          ((78 * v) | 0) +
          "," +
          ((48 * v) | 0) +
          ")";
        x.fillRect(i * w + 1, 0, w - 2, S);
        x.fillStyle = "rgba(30,18,8,0.6)";
        x.fillRect(i * w, 0, 2, S);
        for (let k = 0; k < 3; k++) {
          const y = r() * S;
          x.fillRect(i * w, y, w, 1.5);
        }
        for (let k = 0; k < 8; k++) {
          x.strokeStyle = "rgba(40,25,12,0.25)";
          x.beginPath();
          const yy = r() * S;
          x.moveTo(i * w + 3, yy);
          x.bezierCurveTo(
            i * w + w * 0.3,
            yy + 20,
            i * w + w * 0.7,
            yy - 20,
            i * w + w - 3,
            yy + 6,
          );
          x.stroke();
        }
      }
      // sawdust: thousands of pale flecks, clumped
      for (let c = 0; c < 26; c++) {
        const cx = r() * S,
          cy = r() * S,
          rad = 20 + r() * 80;
        for (let k = 0; k < 220; k++) {
          const a = r() * 6.283,
            d = Math.pow(r(), 0.6) * rad;
          const v = 170 + r() * 60;
          x.fillStyle =
            "rgba(" +
            (v | 0) +
            "," +
            ((v * 0.82) | 0) +
            "," +
            ((v * 0.55) | 0) +
            "," +
            (0.35 + r() * 0.5).toFixed(2) +
            ")";
          x.fillRect(
            cx + Math.cos(a) * d,
            cy + Math.sin(a) * d,
            1 + r() * 3,
            1 + r() * 2,
          );
        }
      }
      K.stains(x, 0, 0, S, S, 14, 151, 0.45, [40, 25, 10]);
    },
    slate(x, S, r) {
      // roof slates (Tammany's hipped roof)
      x.fillStyle = "#3a3e42";
      x.fillRect(0, 0, S, S);
      const rows = 16,
        h = S / rows;
      for (let j = 0; j < rows; j++) {
        const w = S / 8,
          off = ((j % 2) * w) / 2;
        for (let i = -1; i < 9; i++) {
          const v = 50 + r() * 30;
          x.fillStyle =
            "rgb(" +
            (v | 0) +
            "," +
            ((v * 1.05) | 0) +
            "," +
            ((v * 1.12) | 0) +
            ")";
          x.fillRect(i * w + off + 1, j * h + 1, w - 2, h - 1);
        }
        x.fillStyle = "rgba(0,0,0,0.5)";
        x.fillRect(0, j * h, S, 2);
      }
      K.stains(x, 0, 0, S, S, 14, 161, 0.4, [60, 70, 40]);
      K.streaks(x, 0, 0, S, S, 24, 162, 0.3);
    },
    parquet(x, S, r) {
      // herringbone parquet
      x.fillStyle = "#5a3a22";
      x.fillRect(0, 0, S, S);
      const c = S / 8;
      for (let j = 0; j < 8; j++)
        for (let i = 0; i < 8; i++) {
          const v = 0.75 + r() * 0.35;
          x.fillStyle =
            "rgb(" +
            ((120 * v) | 0) +
            "," +
            ((80 * v) | 0) +
            "," +
            ((46 * v) | 0) +
            ")";
          if ((i + j) % 2)
            for (let k = 0; k < 4; k++)
              x.fillRect(i * c + (k * c) / 4 + 1, j * c + 1, c / 4 - 2, c - 2);
          else
            for (let k = 0; k < 4; k++)
              x.fillRect(i * c + 1, j * c + (k * c) / 4 + 1, c - 2, c / 4 - 2);
        }
      K.stains(x, 0, 0, S, S, 18, 171, 0.5, [40, 25, 10]);
      K.grain(x, 0, 0, S, S, 25, 172);
    },
    brownstone(x, S, r) {
      // Cooper Union's brown sandstone ashlar
      x.fillStyle = "#7a5a46";
      x.fillRect(0, 0, S, S);
      const rows = 6,
        h = S / rows;
      for (let j = 0; j < rows; j++) {
        const w = S / 3,
          off = ((j % 2) * w) / 2;
        for (let i = -1; i < 4; i++) {
          const v = 0.85 + r() * 0.25;
          x.fillStyle =
            "rgb(" +
            ((122 * v) | 0) +
            "," +
            ((90 * v) | 0) +
            "," +
            ((70 * v) | 0) +
            ")";
          x.fillRect(i * w + off + 2, j * h + 2, w - 4, h - 4);
        }
      }
      for (let i = 0; i < 900; i++) {
        x.fillStyle =
          r() < 0.5 ? "rgba(60,40,30,0.25)" : "rgba(180,150,120,0.18)";
        x.fillRect(r() * S, r() * S, 2 + r() * 4, 1 + r() * 2);
      }
      K.stains(x, 0, 0, S, S, 16, 181, 0.45, [40, 28, 20]);
      K.streaks(x, 0, 0, S, S, 30, 182, 0.3);
    },
    flemish(x, S, r) {
      // Flemish-bond red brick (Tammany)
      x.fillStyle = "#d8d0c0";
      x.fillRect(0, 0, S, S);
      const rows = 16,
        h = S / rows,
        L = S / 5.33,
        Hd = L / 2;
      for (let j = 0; j < rows; j++) {
        let px = j % 2 ? -Hd * 0.75 : 0,
          k = 0;
        while (px < S) {
          const hdr = k % 2 === 1;
          const w = hdr ? Hd : L;
          const v = hdr ? 0.55 + r() * 0.15 : 0.8 + r() * 0.2;
          x.fillStyle =
            "rgb(" +
            ((150 * v) | 0) +
            "," +
            ((62 * v) | 0) +
            "," +
            ((44 * v) | 0) +
            ")";
          x.fillRect(px + 1.5, j * h + 1.5, w - 3, h - 3);
          px += w;
          k++;
        }
      }
      K.stains(x, 0, 0, S, S, 16, 191, 0.4, [40, 25, 18]);
      K.streaks(x, 0, 0, S, S, 30, 192, 0.3);
    },
    chalkboard(x, S, r) {
      x.fillStyle = "#23302a";
      x.fillRect(0, 0, S, S);
      for (let i = 0; i < 40; i++) {
        const g = x.createRadialGradient(
          r() * S,
          r() * S,
          0,
          r() * S,
          r() * S,
          60,
        );
        g.addColorStop(0, "rgba(200,210,200,0.08)");
        g.addColorStop(1, "rgba(200,210,200,0)");
        x.fillStyle = g;
        x.fillRect(0, 0, S, S);
      }
      K.grain(x, 0, 0, S, S, 20, 201);
    },
  };
