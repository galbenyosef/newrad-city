// play-inline-433 06 — fillrect
// Lines 1137-1384 of readable/play-inline-433.pretty.js (statement-aligned).
  K.mural = function (i, w, h) {
    w = w || 384;
    h = h || 192;
    const scene = MURAL_SCENES[i % MURAL_SCENES.length];
    return K.paint(
      "pics",
      "ppk_mural_" + i + "_" + w,
      w,
      h,
      function (x, X, Y, W, H) {
        const r = K.rng("mural" + i);
        const g = x.createLinearGradient(0, Y, 0, Y + H);
        g.addColorStop(0, "#b8b48e");
        g.addColorStop(0.62, "#8e9a6c");
        g.addColorStop(1, "#5c6844");
        x.fillStyle = g;
        x.fillRect(X, Y, W, H);
        // distant skyline + park trees
        x.fillStyle = "rgba(80,90,90,0.55)";
        for (let k = 0; k < 16; k++) {
          const bw = W * (0.03 + r() * 0.05),
            bh = H * (0.15 + r() * 0.3);
          x.fillRect(X + r() * W, Y + H * 0.55 - bh, bw, bh);
        }
        x.fillStyle = "rgba(46,70,40,0.8)";
        for (let k = 0; k < 10; k++) {
          x.beginPath();
          x.arc(X + r() * W, Y + H * 0.58, H * (0.06 + r() * 0.08), 0, PI * 2);
          x.fill();
        }
        const fig = (fx, fy, s, col, pose) => {
          x.fillStyle = col;
          x.beginPath();
          x.arc(fx, fy - s * 0.9, s * 0.12, 0, PI * 2);
          x.fill();
          x.fillRect(fx - s * 0.12, fy - s * 0.78, s * 0.24, s * 0.45);
          x.fillRect(fx - s * 0.11, fy - s * 0.34, s * 0.09, s * 0.34);
          x.fillRect(fx + s * 0.02, fy - s * 0.34, s * 0.09, s * 0.34);
          x.save();
          x.translate(fx, fy - s * 0.72);
          x.rotate(pose);
          x.fillRect(-s * 0.2, 0, s * 0.07, s * 0.36);
          x.rotate(-pose * 2);
          x.fillRect(s * 0.13, 0, s * 0.07, s * 0.36);
          x.restore();
        };
        const cols = ["#3a2a20", "#5a3a28", "#2e3e4a", "#6a4a30", "#40382a"];
        if (scene === "animals" || scene === "sheep") {
          for (let k = 0; k < 7; k++) {
            const ax = X + W * (0.08 + k * 0.13),
              ay = Y + H * (0.82 + r() * 0.08),
              s = H * (0.12 + r() * 0.08);
            x.fillStyle =
              scene === "sheep"
                ? "#d8d4c0"
                : r.pick(["#6a5a48", "#8a7a5a", "#4a4038", "#d0ccb8"]);
            x.beginPath();
            x.ellipse(ax, ay - s * 0.5, s * 0.6, s * 0.35, 0, 0, PI * 2);
            x.fill();
            x.beginPath();
            x.ellipse(
              ax - s * 0.6,
              ay - s * 0.7,
              s * 0.2,
              s * 0.18,
              0,
              0,
              PI * 2,
            );
            x.fill();
            for (const e of [-0.4, -0.15, 0.2, 0.4])
              x.fillRect(ax + e * s, ay - s * 0.3, s * 0.08, s * 0.3);
          }
          fig(X + W * 0.9, Y + H * 0.92, H * 0.5, "#3a2a20", 0.3);
        } else if (scene === "skaters") {
          x.fillStyle = "rgba(220,230,235,0.8)";
          x.fillRect(X, Y + H * 0.7, W, H * 0.3);
          for (let k = 0; k < 8; k++)
            fig(
              X + W * (0.06 + k * 0.12),
              Y + H * (0.88 + r() * 0.06),
              H * (0.36 + r() * 0.1),
              cols[k % 5],
              0.6 + r() * 0.6,
            );
        } else {
          for (let k = 0; k < 9; k++)
            fig(
              X + W * (0.05 + k * 0.11),
              Y + H * (0.9 + r() * 0.05),
              H * (0.42 + r() * 0.12),
              cols[k % 5],
              scene === "parade" ? 1.2 : 0.2 + r() * 0.4,
            );
          if (scene === "soldiers") {
            x.strokeStyle = "#2a2018";
            x.lineWidth = 3;
            for (let k = 0; k < 9; k++) {
              const fx = X + W * (0.05 + k * 0.11);
              x.beginPath();
              x.moveTo(fx + H * 0.08, Y + H * 0.45);
              x.lineTo(fx + H * 0.14, Y + H * 0.85);
              x.stroke();
            }
          }
          if (scene === "builders") {
            x.fillStyle = "#6a5040";
            x.fillRect(X + W * 0.3, Y + H * 0.25, W * 0.4, H * 0.1);
            x.fillRect(X + W * 0.33, Y + H * 0.35, W * 0.03, H * 0.5);
            x.fillRect(X + W * 0.64, Y + H * 0.35, W * 0.03, H * 0.5);
          }
          if (scene === "parade") {
            x.fillStyle = "#a02a20";
            x.fillRect(X + W * 0.12, Y + H * 0.2, W * 0.12, H * 0.08);
            x.fillStyle = "#e8e0cc";
            x.fillRect(X + W * 0.12, Y + H * 0.28, W * 0.12, H * 0.04);
          }
        }
        // painted border + age
        x.strokeStyle = "#3a3020";
        x.lineWidth = 6;
        x.strokeRect(X + 3, Y + 3, W - 6, H - 6);
        x.fillStyle = "rgba(120,90,40,0.18)";
        x.fillRect(X, Y, W, H);
        K.stains(x, X, Y, W, H, 14, i * 7 + 1, 0.45, [50, 40, 20]);
        K.streaks(x, X, Y, W, H, 18, i + 5, 0.3);
        // flaking: pale plaster showing through
        for (let k = 0; k < 12; k++) {
          x.fillStyle = "rgba(210,200,180,0.8)";
          x.beginPath();
          x.ellipse(
            X + r() * W,
            Y + r() * H,
            4 + r() * 16,
            3 + r() * 9,
            r() * 3,
            0,
            PI * 2,
          );
          x.fill();
        }
      },
    );
  };

  /** Top-down Central Park map (for the Arsenal's diorama table); drawn from LAYOUT so it matches the world. */
  K.parkMapCell = function () {
    return K.paint("pics", "ppk_parkmap", 256, 680, function (x, X, Y, W, H) {
      const L = G.LAYOUT,
        P = L.PARK,
        F = L.PARK_FEATURES;
      const sx = W / (P.x1 - P.x0),
        sz = H / (P.z1 - P.z0);
      const M = (wx, wz) => [X + (wx - P.x0) * sx, Y + (P.z1 - wz) * sz]; // north (−z) at the top of the cell → v up
      x.fillStyle = "#6e7a4e";
      x.fillRect(X, Y, W, H);
      for (let i = 0; i < 400; i++) {
        x.fillStyle = "rgba(40,60,30,0.25)";
        x.fillRect(X + Math.random() * W, Y + Math.random() * H, 2, 2);
      }
      const rect = (r, col) => {
        const a = M(r.x0, r.z1),
          b = M(r.x1, r.z0);
        x.fillStyle = col;
        x.fillRect(a[0], b[1], b[0] - a[0], a[1] - b[1]);
      };
      rect(F.sheepMeadow, "#8a9460");
      rect(F.reservoir, "#3a5a5a");
      rect(F.lake, "#3a5a54");
      // drive loop
      x.strokeStyle = "#3a3a36";
      x.lineWidth = 3;
      const D = [
        [-60, -421],
        [-80, -470],
        [-88, -560],
        [-92, -640],
        [-90, -700],
        [-88, -752],
        [-86, -768],
        [-90, -820],
        [-100, -905],
        [-86, -960],
        [-40, -985],
        [20, -985],
        [70, -962],
        [92, -900],
        [96, -815],
        [90, -768],
        [88, -752],
        [96, -700],
        [98, -640],
        [96, -560],
        [80, -470],
        [60, -421],
      ];
      x.beginPath();
      D.forEach((p, i) => {
        const q = M(p[0], p[1]);
        if (i) x.lineTo(q[0], q[1]);
        else x.moveTo(q[0], q[1]);
      });
      x.stroke();
      // the Mall + transverse
      x.strokeStyle = "#c8c0a8";
      x.lineWidth = 2;
      let a = M(0, -421),
        b2 = M(0, -539);
      x.beginPath();
      x.moveTo(a[0], a[1]);
      x.lineTo(b2[0], b2[1]);
      x.stroke();
      a = M(P.x0, -760);
      b2 = M(P.x1, -760);
      x.strokeStyle = "#3a3a36";
      x.beginPath();
      x.moveTo(a[0], a[1]);
      x.lineTo(b2[0], b2[1]);
      x.stroke();
      // landmark dots
      const dot = (wx, wz, col) => {
        const q = M(wx, wz);
        x.fillStyle = col;
        x.beginPath();
        x.arc(q[0], q[1], 4, 0, PI * 2);
        x.fill();
      };
      dot(F.bethesda.x, F.bethesda.z, "#e0d8c0");
      dot(F.belvedere.x, F.belvedere.z, "#e0d8c0");
      dot(81, -465, "#b04030");
      dot(-100, -560, "#2a6a3a");
      // tiny trees
      for (let i = 0; i < 260; i++) {
        const q = M(
          P.x0 + Math.random() * (P.x1 - P.x0),
          P.z0 + Math.random() * (P.z1 - P.z0),
        );
        x.fillStyle = "rgba(40,60,30,0.7)";
        x.beginPath();
        x.arc(q[0], q[1], 1.5 + Math.random() * 2, 0, PI * 2);
        x.fill();
      }
      x.strokeStyle = "#2a2a20";
      x.lineWidth = 4;
      x.strokeRect(X + 2, Y + 2, W - 4, H - 4);
      K.stains(x, X, Y, W, H, 10, 77, 0.35, [60, 50, 30]);
    });
  };
