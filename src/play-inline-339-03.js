// play-inline-339 03 — fillstyle
// Lines 130-914 of readable/play-inline-339.pretty.js (statement-aligned).
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
    // ---------------- poi_civic additions ----------------
    rustic(x, S, r) {
      // rusticated limestone: deep horizontal channels, long blocks, chamfered edges
      x.fillStyle = "#cfc4ab";
      x.fillRect(0, 0, S, S);
      const rows = 4,
        rh = S / rows;
      for (let j = 0; j < rows; j++) {
        const off = ((j % 2) * S) / 4;
        for (let i = -1; i < 3; i++) {
          const X = (i * S) / 2 + off,
            Y = j * rh;
          const v = 190 + r() * 30;
          const g = x.createLinearGradient(0, Y, 0, Y + rh);
          g.addColorStop(
            0,
            "rgb(" +
              ((v + 20) | 0) +
              "," +
              ((v + 12) | 0) +
              "," +
              ((v - 8) | 0) +
              ")",
          );
          g.addColorStop(
            0.5,
            "rgb(" + (v | 0) + "," + ((v - 8) | 0) + "," + ((v - 28) | 0) + ")",
          );
          g.addColorStop(
            1,
            "rgb(" +
              ((v - 30) | 0) +
              "," +
              ((v - 38) | 0) +
              "," +
              ((v - 55) | 0) +
              ")",
          );
          x.fillStyle = g;
          x.fillRect(X + 3, Y + 6, S / 2 - 6, rh - 12);
          x.fillStyle = "rgba(40,32,24,0.35)";
          x.fillRect(X + 3, Y + rh - 8, S / 2 - 6, 3);
        }
        x.fillStyle = "#4a4034";
        x.fillRect(0, j * rh, S, 6); // the channel
        x.fillStyle = "rgba(255,245,220,0.35)";
        x.fillRect(0, j * rh + 6, S, 2);
      }
      K.grain(x, 0, 0, S, S, 30, 1401);
      K.stains(x, 0, 0, S, S, 22, 1402, 0.4, [60, 50, 35]);
      K.streaks(x, 0, 0, S, S, 30, 1403, 0.28);
    },
    ashlar(x, S, r) {
      // big granite ashlar blocks (Municipal Building base)
      x.fillStyle = "#a8a298";
      x.fillRect(0, 0, S, S);
      const rows = 6,
        rh = S / rows;
      for (let j = 0; j < rows; j++) {
        const off = ((j % 2) * S) / 6;
        for (let i = -1; i < 4; i++) {
          const v = 150 + r() * 40;
          x.fillStyle =
            "rgb(" + (v | 0) + "," + ((v - 3) | 0) + "," + ((v - 10) | 0) + ")";
          x.fillRect((i * S) / 3 + off + 1.5, j * rh + 1.5, S / 3 - 3, rh - 3);
        }
        x.fillStyle = "rgba(40,38,34,0.6)";
        x.fillRect(0, j * rh, S, 1.5);
      }
      for (let i = 0; i < 2500; i++) {
        const v = r();
        x.fillStyle =
          v < 0.5
            ? "rgba(30,30,30,0.25)"
            : v < 0.8
              ? "rgba(240,235,225,0.25)"
              : "rgba(120,80,70,0.3)";
        x.fillRect(r() * S, r() * S, 1.5, 1.5);
      }
      K.stains(x, 0, 0, S, S, 20, 1411, 0.35, [50, 45, 35]);
      K.streaks(x, 0, 0, S, S, 30, 1412, 0.25);
    },
    fieldstone(x, S, r) {
      // 1815 rubble-stone wall under a failed brown stucco skin (Old St. Patrick's)
      x.fillStyle = "#7e6a56";
      x.fillRect(0, 0, S, S);
      for (let i = 0; i < 90; i++) {
        const cx = r() * S,
          cy = r() * S,
          rw = 18 + r() * 34,
          rh2 = 12 + r() * 20;
        const v = 90 + r() * 70;
        x.fillStyle =
          "rgb(" + ((v + 15) | 0) + "," + (v | 0) + "," + ((v - 15) | 0) + ")";
        x.beginPath();
        for (let k = 0; k < 7; k++) {
          const a = (k / 7) * 6.283,
            rr = 0.75 + r() * 0.3;
          const px = cx + Math.cos(a) * rw * rr,
            py = cy + Math.sin(a) * rh2 * rr;
          if (k) x.lineTo(px, py);
          else x.moveTo(px, py);
        }
        x.closePath();
        x.fill();
        x.strokeStyle = "rgba(40,30,22,0.5)";
        x.lineWidth = 2;
        x.stroke();
      }
      // patches of surviving stucco
      for (let i = 0; i < 14; i++) {
        const px = r() * S,
          py = r() * S,
          rad = 30 + r() * 90;
        const g = x.createRadialGradient(px, py, rad * 0.6, px, py, rad);
        g.addColorStop(0, "rgba(150,120,92,0.92)");
        g.addColorStop(1, "rgba(150,120,92,0)");
        x.fillStyle = g;
        x.fillRect(px - rad, py - rad, rad * 2, rad * 2);
      }
      K.grain(x, 0, 0, S, S, 35, 1421);
      K.stains(x, 0, 0, S, S, 20, 1422, 0.45, [40, 30, 20]);
      K.streaks(x, 0, 0, S, S, 40, 1423, 0.3);
    },
    patina(x, S, r) {
      // verdigris copper: blue-green with dark streaks and bare-copper spots
      x.fillStyle = "#5f9a86";
      x.fillRect(0, 0, S, S);
      for (let i = 0; i < 50; i++) {
        const px = r() * S,
          py = r() * S,
          rad = 20 + r() * 80,
          g = x.createRadialGradient(px, py, 0, px, py, rad);
        const t =
          r() < 0.6 ? "120,178,156" : r() < 0.6 ? "60,100,90" : "140,90,50";
        g.addColorStop(0, "rgba(" + t + ",0.5)");
        g.addColorStop(1, "rgba(" + t + ",0)");
        x.fillStyle = g;
        x.fillRect(px - rad, py - rad, rad * 2, rad * 2);
      }
      x.strokeStyle = "rgba(40,60,52,0.5)";
      x.lineWidth = 2;
      for (let i = 0; i < S; i += S / 8) {
        x.beginPath();
        x.moveTo(i, 0);
        x.lineTo(i, S);
        x.stroke();
      } // standing seams
      K.streaks(x, 0, 0, S, S, 60, 1431, 0.35);
      K.grain(x, 0, 0, S, S, 25, 1432);
    },
    coffer(x, S, r) {
      // coffered plaster ceiling with rosettes (rotunda, arch soffit)
      x.fillStyle = "#b9ae96";
      x.fillRect(0, 0, S, S);
      const n = 2,
        c = S / n;
      for (let j = 0; j < n; j++)
        for (let i = 0; i < n; i++) {
          const X = i * c,
            Y = j * c;
          for (let k = 0; k < 4; k++) {
            const v = 170 - k * 22;
            x.fillStyle = "rgb(" + v + "," + (v - 8) + "," + (v - 24) + ")";
            x.fillRect(
              X + 14 + k * 12,
              Y + 14 + k * 12,
              c - 28 - k * 24,
              c - 28 - k * 24,
            );
          }
          x.fillStyle = "#6a5a40";
          x.beginPath();
          x.arc(X + c / 2, Y + c / 2, c * 0.12, 0, 6.3);
          x.fill();
          x.fillStyle = "#c8a860";
          for (let k = 0; k < 8; k++) {
            const a = (k * Math.PI) / 4;
            x.beginPath();
            x.ellipse(
              X + c / 2 + Math.cos(a) * c * 0.08,
              Y + c / 2 + Math.sin(a) * c * 0.08,
              c * 0.05,
              c * 0.018,
              a,
              0,
              6.3,
            );
            x.fill();
          }
        }
      K.stains(x, 0, 0, S, S, 20, 1441, 0.45, [60, 45, 25]);
      K.grain(x, 0, 0, S, S, 20, 1442);
    },
    crypt_brick(x, S, r) {
      // old soft brick with nitre bloom (catacombs)
      x.fillStyle = "#3e3028";
      x.fillRect(0, 0, S, S);
      const bw = S / 8,
        bh = S / 24;
      for (let j = 0; j < 24; j++)
        for (let i = -1; i < 9; i++) {
          const X = i * bw + ((j % 2) * bw) / 2,
            v = 70 + r() * 50;
          x.fillStyle =
            "rgb(" +
            ((v + 30) | 0) +
            "," +
            ((v * 0.7) | 0) +
            "," +
            ((v * 0.55) | 0) +
            ")";
          x.fillRect(X + 2, j * bh + 2, bw - 4, bh - 3);
        }
      for (let i = 0; i < 18; i++) {
        const px = r() * S,
          py = r() * S * 0.7 + S * 0.3,
          rad = 20 + r() * 70,
          g = x.createRadialGradient(px, py, 0, px, py, rad);
        g.addColorStop(0, "rgba(220,215,195,0.35)");
        g.addColorStop(1, "rgba(220,215,195,0)");
        x.fillStyle = g;
        x.fillRect(px - rad, py - rad, rad * 2, rad * 2);
      }
      K.stains(x, 0, 0, S, S, 22, 1451, 0.55, [20, 15, 10]);
      K.streaks(x, 0, 0, S, S, 30, 1452, 0.3);
    },
    slate(x, S, r) {
      // roof slate courses
      x.fillStyle = "#2e3134";
      x.fillRect(0, 0, S, S);
      const rows = 12,
        rh = S / rows,
        w = S / 10;
      for (let j = 0; j < rows; j++)
        for (let i = -1; i < 11; i++) {
          const X = i * w + ((j % 2) * w) / 2,
            v = 45 + r() * 30;
          x.fillStyle =
            "rgb(" + (v | 0) + "," + ((v + 3) | 0) + "," + ((v + 8) | 0) + ")";
          x.fillRect(X + 1, j * rh + 1, w - 2, rh - 1);
          x.fillStyle = "rgba(0,0,0,0.4)";
          x.fillRect(X, j * rh + rh - 3, w, 3);
        }
      for (let i = 0; i < 12; i++) {
        x.fillStyle = "rgba(0,0,0,0.8)";
        x.fillRect(r() * S, r() * S, w * 0.8, rh);
      } // missing slates
      K.stains(x, 0, 0, S, S, 16, 1461, 0.4, [70, 80, 50]);
      K.streaks(x, 0, 0, S, S, 20, 1462, 0.2);
    },
    lino(x, S, r) {
      // precinct linoleum: worn institutional green/grey squares
      const n = 8,
        c = S / n;
      for (let j = 0; j < n; j++)
        for (let i = 0; i < n; i++) {
          const g = (i + j) % 2 === 0;
          const v = 100 + r() * 25;
          x.fillStyle = g
            ? "rgb(" +
              ((v * 0.8) | 0) +
              "," +
              (v | 0) +
              "," +
              ((v * 0.85) | 0) +
              ")"
            : "rgb(" +
              ((v + 40) | 0) +
              "," +
              ((v + 38) | 0) +
              "," +
              ((v + 30) | 0) +
              ")";
          x.fillRect(i * c, j * c, c, c);
        }
      x.strokeStyle = "rgba(0,0,0,0.25)";
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
      for (let i = 0; i < 10; i++) {
        x.fillStyle = "rgba(40,36,30,0.9)";
        const px = r() * S,
          py = r() * S;
        x.fillRect(px, py, c * (0.3 + r() * 0.6), c * (0.3 + r() * 0.6));
      } // lifted tiles
      K.stains(x, 0, 0, S, S, 24, 1471, 0.55, [60, 50, 30]);
    },
    oak_panel(x, S, r) {
      // raised oak panelling (courtrooms, offices, pews' backs)
      x.fillStyle = "#6a4a2c";
      x.fillRect(0, 0, S, S);
      for (let i = 0; i < 400; i++) {
        x.fillStyle =
          "rgba(" + (r() < 0.5 ? "40,24,12" : "150,110,70") + ",0.12)";
        x.fillRect(0, r() * S, S, 1 + r() * 2);
      }
      for (let j = 0; j < 2; j++)
        for (let i = 0; i < 2; i++) {
          const X = (i * S) / 2 + 18,
            Y = (j * S) / 2 + 18,
            W = S / 2 - 36,
            H = S / 2 - 36;
          x.fillStyle = "rgba(30,18,8,0.45)";
          x.fillRect(X - 6, Y - 6, W + 12, 6);
          x.fillRect(X - 6, Y - 6, 6, H + 12);
          x.fillStyle = "rgba(200,160,110,0.25)";
          x.fillRect(X - 6, Y + H, W + 12, 6);
          x.fillRect(X + W, Y - 6, 6, H + 12);
          x.fillStyle = "rgba(120,80,45,0.35)";
          x.fillRect(X + 10, Y + 10, W - 20, H - 20);
        }
      K.stains(x, 0, 0, S, S, 16, 1481, 0.4, [20, 12, 5]);
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
  };
