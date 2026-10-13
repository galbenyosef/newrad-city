/* src/poi_village/05_art.js */
/* =====================================================================
 * NEW RAD CITY — poi_village / 05_art.js
 * Procedural art for the 'art' atlas: paintings (8 styles × variants),
 * sepia photographs (jazz musicians, deli celebrities, mugshots),
 * propaganda posters, framed pieces and decals (blood, puddles, cracks,
 * graffiti tags) — all original drawings, painted once at init.
 * Plus framed-picture helpers that put them on walls.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE) return;
  const PV = G._pv;
  const K = PV.kit;
  const U = G.util;

  const PAL = [
    ["#e9dfc4", "#b8342a", "#1f3b57", "#e0b040", "#2a2a2a"],
    ["#2c3e50", "#e67e22", "#ecf0f1", "#c0392b", "#16a085"],
    ["#3b2a20", "#c9a66b", "#7a3b2e", "#e8d9b0", "#5a6b3a"],
    ["#1a1a2e", "#e94560", "#f5d76e", "#0f3460", "#eeeeee"],
    ["#f2e6c9", "#6b8f71", "#d96c4f", "#3e4a61", "#f0c05a"],
    ["#5c2a2a", "#d4a373", "#264653", "#e9c46a", "#f4a261"],
  ];
  function age(x, X, Y, W, H, seed, amt) {
    // varnish yellowing + grime + cracks
    x.fillStyle = "rgba(120,90,30," + (0.12 + (amt || 0.1)) + ")";
    x.fillRect(X, Y, W, H);
    K.stains(x, X, Y, W, H, 6, seed, 0.35, [40, 30, 15]);
    const r = K.rng(seed + 9);
    x.strokeStyle = "rgba(30,20,10,0.25)";
    x.lineWidth = 0.7;
    for (let i = 0; i < 14; i++) {
      x.beginPath();
      let px = X + r() * W,
        py = Y + r() * H;
      x.moveTo(px, py);
      for (let k = 0; k < 4; k++) {
        px += (r() - 0.5) * 30;
        py += (r() - 0.5) * 30;
        x.lineTo(px, py);
      }
      x.stroke();
    }
    const g = x.createRadialGradient(
      X + W / 2,
      Y + H / 2,
      Math.min(W, H) * 0.3,
      X + W / 2,
      Y + H / 2,
      Math.max(W, H) * 0.75,
    );
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(1, "rgba(20,12,5,0.45)");
    x.fillStyle = g;
    x.fillRect(X, Y, W, H);
  }
  const STYLES = [
    function splatter(x, X, Y, W, H, r, p) {
      x.fillStyle = p[0];
      x.fillRect(X, Y, W, H);
      for (let i = 0; i < 26; i++) {
        x.strokeStyle = p[1 + (i % 4)];
        x.lineWidth = 1 + r() * 4;
        x.globalAlpha = 0.85;
        x.beginPath();
        let px = X + r() * W,
          py = Y + r() * H;
        x.moveTo(px, py);
        for (let k = 0; k < 7; k++) {
          px += (r() - 0.5) * W * 0.5;
          py += (r() - 0.5) * H * 0.5;
          x.quadraticCurveTo(
            px + (r() - 0.5) * 40,
            py + (r() - 0.5) * 40,
            px,
            py,
          );
        }
        x.stroke();
      }
      for (let i = 0; i < 80; i++) {
        x.fillStyle = p[1 + (i % 4)];
        x.beginPath();
        x.arc(X + r() * W, Y + r() * H, 0.5 + r() * 3, 0, 6.3);
        x.fill();
      }
      x.globalAlpha = 1;
    },
    function colorField(x, X, Y, W, H, r, p) {
      x.fillStyle = p[4];
      x.fillRect(X, Y, W, H);
      const n = 2 + ((r() * 2) | 0);
      for (let i = 0; i < n; i++) {
        const y0 = Y + H * (0.06 + (i * 0.9) / n),
          h = H * (0.9 / n - 0.05);
        x.fillStyle = p[1 + ((i + ((r() * 3) | 0)) % 4)];
        x.globalAlpha = 0.9;
        x.fillRect(X + W * 0.08, y0, W * 0.84, h);
        x.globalAlpha = 0.3;
        x.fillRect(X + W * 0.06, y0 - 3, W * 0.88, h + 6);
      }
      x.globalAlpha = 1;
    },
    function portrait(x, X, Y, W, H, r, p) {
      x.fillStyle = p[3];
      x.fillRect(X, Y, W, H);
      const deep = r() < 0.5;
      const skin = deep ? "#8a5a3c" : "#d9b38c";
      x.fillStyle = p[2];
      x.beginPath();
      x.ellipse(X + W / 2, Y + H * 1.02, W * 0.42, H * 0.36, 0, Math.PI, 0);
      x.fill(); // shoulders
      x.fillStyle = skin;
      x.fillRect(X + W * 0.45, Y + H * 0.52, W * 0.1, H * 0.16); // neck
      x.beginPath();
      x.ellipse(X + W / 2, Y + H * 0.4, W * 0.16, H * 0.22, 0.05, 0, 6.3);
      x.fill(); // long face
      x.fillStyle = "#2a1a10";
      x.beginPath();
      x.ellipse(X + W / 2, Y + H * 0.25, W * 0.18, H * 0.1, 0, Math.PI, 0);
      x.fill();
      x.fillStyle = "#1a1a1a";
      x.beginPath();
      x.ellipse(X + W * 0.44, Y + H * 0.38, W * 0.03, H * 0.012, 0, 0, 6.3);
      x.ellipse(X + W * 0.56, Y + H * 0.38, W * 0.03, H * 0.012, 0, 0, 6.3);
      x.fill();
      x.fillStyle = deep ? "#5a2a20" : "#a0403a";
      x.fillRect(X + W * 0.47, Y + H * 0.5, W * 0.06, H * 0.012);
    },
    function city(x, X, Y, W, H, r, p) {
      const g = x.createLinearGradient(0, Y, 0, Y + H);
      g.addColorStop(0, p[1]);
      g.addColorStop(0.7, p[3]);
      g.addColorStop(1, p[0]);
      x.fillStyle = g;
      x.fillRect(X, Y, W, H);
      if (r() < 0.6) {
        // the cloud
        x.fillStyle = "rgba(250,230,190,0.85)";
        x.beginPath();
        x.arc(X + W * 0.65, Y + H * 0.3, W * 0.14, 0, 6.3);
        x.fill();
        x.fillRect(X + W * 0.62, Y + H * 0.35, W * 0.06, H * 0.4);
        x.beginPath();
        x.ellipse(X + W * 0.65, Y + H * 0.26, W * 0.2, H * 0.06, 0, 0, 6.3);
        x.fill();
      }
      x.fillStyle = "#1b1b22";
      let px = X;
      while (px < X + W) {
        const w = W * (0.04 + r() * 0.08),
          h = H * (0.15 + r() * 0.45);
        x.fillRect(px, Y + H - h, w, h);
        if (r() < 0.2) {
          x.beginPath();
          x.moveTo(px, Y + H - h);
          x.lineTo(px + w / 2, Y + H - h - H * 0.12);
          x.lineTo(px + w, Y + H - h);
          x.fill();
        }
        px += w + 1;
      }
      x.fillStyle = "rgba(255,220,120,0.7)";
      for (let i = 0; i < 40; i++)
        x.fillRect(X + r() * W, Y + H * (0.6 + r() * 0.35), 2, 2);
    },
    function pop(x, X, Y, W, H, r, p) {
      const cols = [
        ["#e94560", "#f5d76e"],
        ["#0f3460", "#e94560"],
        ["#16a085", "#f39c12"],
        ["#f5d76e", "#2c3e50"],
      ];
      for (let j = 0; j < 2; j++)
        for (let i = 0; i < 2; i++) {
          const c = cols[(i + j * 2 + ((r() * 4) | 0)) % 4],
            cx = X + W * (0.25 + i * 0.5),
            cy = Y + H * (0.25 + j * 0.5);
          x.fillStyle = c[0];
          x.fillRect(X + (i * W) / 2, Y + (j * H) / 2, W / 2, H / 2);
          x.fillStyle = c[1]; // bottle
          x.beginPath();
          x.moveTo(cx - W * 0.03, cy - H * 0.2);
          x.lineTo(cx + W * 0.03, cy - H * 0.2);
          x.lineTo(cx + W * 0.03, cy - H * 0.1);
          x.quadraticCurveTo(
            cx + W * 0.1,
            cy - H * 0.05,
            cx + W * 0.08,
            cy + H * 0.2,
          );
          x.lineTo(cx - W * 0.08, cy + H * 0.2);
          x.quadraticCurveTo(
            cx - W * 0.1,
            cy - H * 0.05,
            cx - W * 0.03,
            cy - H * 0.1,
          );
          x.fill();
          x.fillStyle = "#fff";
          x.fillRect(cx - W * 0.07, cy + H * 0.02, W * 0.14, H * 0.05);
        }
    },
    function geometric(x, X, Y, W, H, r, p) {
      x.fillStyle = p[0];
      x.fillRect(X, Y, W, H);
      for (let i = 0; i < 14; i++) {
        x.fillStyle = p[1 + (i % 4)];
        x.strokeStyle = "#111";
        x.lineWidth = 1 + r() * 2;
        x.globalAlpha = 0.8;
        const t = r();
        if (t < 0.35) {
          x.beginPath();
          x.arc(X + r() * W, Y + r() * H, 6 + r() * W * 0.14, 0, 6.3);
          x.fill();
          x.stroke();
        } else if (t < 0.7) {
          x.beginPath();
          x.moveTo(X + r() * W, Y + r() * H);
          x.lineTo(X + r() * W, Y + r() * H);
          x.lineTo(X + r() * W, Y + r() * H);
          x.closePath();
          x.fill();
        } else {
          x.beginPath();
          x.moveTo(X + r() * W, Y + r() * H);
          x.lineTo(X + r() * W, Y + r() * H);
          x.stroke();
        }
      }
      x.globalAlpha = 1;
    },
    function landscape(x, X, Y, W, H, r, p) {
      const g = x.createLinearGradient(0, Y, 0, Y + H * 0.6);
      g.addColorStop(0, "#9fb8c8");
      g.addColorStop(1, "#e8d8b0");
      x.fillStyle = g;
      x.fillRect(X, Y, W, H);
      for (let k = 0; k < 3; k++) {
        x.fillStyle = ["#6a7a4a", "#4f6a3a", "#3a4a2a"][k];
        x.beginPath();
        x.moveTo(X, Y + H);
        let px = X;
        while (px <= X + W) {
          x.lineTo(
            px,
            Y +
              H * (0.5 + k * 0.12) +
              Math.sin(px * 0.03 + k * 2 + r()) * H * 0.06,
          );
          px += W / 12;
        }
        x.lineTo(X + W, Y + H);
        x.fill();
      }
      x.fillStyle = "#3a2a1a";
      x.fillRect(X + W * 0.7, Y + H * 0.45, W * 0.03, H * 0.25);
      x.fillStyle = "#2f4a2a";
      x.beginPath();
      x.arc(X + W * 0.715, Y + H * 0.42, W * 0.09, 0, 6.3);
      x.fill();
    },
    function stillLife(x, X, Y, W, H, r, p) {
      x.fillStyle = p[4];
      x.fillRect(X, Y, W, H);
      x.fillStyle = p[2];
      x.fillRect(X, Y + H * 0.65, W, H * 0.35);
      x.fillStyle = "#d8d0c0";
      x.beginPath();
      x.ellipse(X + W / 2, Y + H * 0.68, W * 0.3, H * 0.07, 0, 0, 6.3);
      x.fill();
      const fr = ["#c0392b", "#e67e22", "#f1c40f", "#6a8a3a", "#8e44ad"];
      for (let i = 0; i < 6; i++) {
        x.fillStyle = fr[i % 5];
        x.beginPath();
        x.arc(
          X + W * (0.32 + r() * 0.36),
          Y + H * (0.55 + r() * 0.08),
          W * (0.05 + r() * 0.04),
          0,
          6.3,
        );
        x.fill();
      }
      x.fillStyle = "#2e5a3a";
      x.fillRect(X + W * 0.15, Y + H * 0.3, W * 0.08, H * 0.38);
      x.fillRect(X + W * 0.17, Y + H * 0.2, W * 0.04, H * 0.12);
    },
  ];
  K.PAINT_STYLES = STYLES.length;
  /** Painting cell i (deterministic). w,h in px. */
  K.painting = function (i, w, h) {
    w = w || 192;
    h = h || 240;
    return K.paint(
      "pics",
      "painting_" + i + "_" + w + "x" + h,
      w,
      h,
      function (x, X, Y, W, H) {
        const r = K.rng("painting" + i);
        const st = STYLES[i % STYLES.length];
        st(x, X, Y, W, H, r, PAL[(i * 7 + 3) % PAL.length]);
        age(x, X, Y, W, H, i * 13 + 5, 0.05);
      },
    );
  };
  /** Sepia photograph: subject 'jazz' | 'deli' | 'mug' | 'family'. */
  K.photo = function (subject, i, w, h) {
    w = w || 128;
    h = h || 160;
    return K.paint(
      "pics",
      "photo_" + subject + "_" + i,
      w,
      h,
      function (x, X, Y, W, H) {
        const r = K.rng(subject + i);
        const g = x.createLinearGradient(0, Y, 0, Y + H);
        g.addColorStop(0, "#6e6250");
        g.addColorStop(1, "#2e281e");
        x.fillStyle = g;
        x.fillRect(X, Y, W, H);
        x.fillStyle = "#1a1510";
        if (subject === "mug") {
          // mugshot with height chart
          x.fillStyle = "#b8b0a0";
          x.fillRect(X, Y, W, H);
          x.strokeStyle = "#333";
          for (let k = 0; k < 8; k++) {
            x.beginPath();
            x.moveTo(X, Y + (k * H) / 8);
            x.lineTo(X + W * 0.25, Y + (k * H) / 8);
            x.stroke();
          }
          x.fillStyle = "#2a2520";
        }
        // figure: head + shoulders
        const cx = X + W * (0.4 + r() * 0.2);
        x.beginPath();
        x.ellipse(cx, Y + H * 0.36, W * 0.13, H * 0.12, 0, 0, 6.3);
        x.fill();
        x.beginPath();
        x.ellipse(cx, Y + H * 0.85, W * 0.32, H * 0.28, 0, Math.PI, 0);
        x.fill();
        if (subject === "jazz") {
          // instrument
          const t = r();
          x.strokeStyle = "#c8a860";
          x.lineWidth = W * 0.05;
          if (t < 0.4) {
            x.beginPath();
            x.moveTo(cx + W * 0.05, Y + H * 0.45);
            x.quadraticCurveTo(
              cx + W * 0.25,
              Y + H * 0.75,
              cx + W * 0.1,
              Y + H * 0.9,
            );
            x.stroke();
            x.beginPath();
            x.arc(cx + W * 0.1, Y + H * 0.88, W * 0.07, 0, 6.3);
            x.stroke();
          } else if (t < 0.7) {
            x.beginPath();
            x.moveTo(cx - W * 0.02, Y + H * 0.42);
            x.lineTo(cx + W * 0.35, Y + H * 0.38);
            x.stroke();
            x.beginPath();
            x.arc(cx + W * 0.38, Y + H * 0.38, W * 0.06, 0, 6.3);
            x.fill();
          } else {
            x.fillStyle = "#4a3020";
            x.beginPath();
            x.ellipse(
              cx + W * 0.15,
              Y + H * 0.8,
              W * 0.16,
              H * 0.2,
              0.2,
              0,
              6.3,
            );
            x.fill();
            x.fillRect(cx + W * 0.13, Y + H * 0.2, W * 0.03, H * 0.45);
          }
          x.fillStyle = "rgba(255,240,200,0.25)";
          x.beginPath();
          x.arc(X + W * 0.8, Y + H * 0.15, W * 0.25, 0, 6.3);
          x.fill();
        }
        if (subject === "deli") {
          x.fillStyle = "#e8e0d0";
          x.fillRect(X + W * 0.05, Y + H * 0.05, W * 0.9, H * 0.08);
          x.fillStyle = "#1a1510";
          x.font = "bold " + ((H * 0.06) | 0) + "px Georgia";
          x.textAlign = "center";
          x.fillText(
            r.pick([
              "To Katz — Love!",
              "Best pastrami!",
              "xoxo",
              "Thanks Irv!",
              "Worth the wait",
            ]),
            X + W / 2,
            Y + H * 0.11,
          );
        }
        // sepia + border
        x.fillStyle = "rgba(160,120,60,0.22)";
        x.fillRect(X, Y, W, H);
        x.strokeStyle = "#e8e0cc";
        x.lineWidth = W * 0.05;
        x.strokeRect(X + W * 0.025, Y + W * 0.025, W - W * 0.05, H - W * 0.05);
        K.stains(
          x,
          X,
          Y,
          W,
          H,
          4,
          (i * 7 + subject.length) | 0,
          0.4,
          [60, 40, 20],
        );
      },
    );
  };
  /** Decals with alpha: 'blood', 'puddle', 'crack', 'scorch', 'grime', 'hotspot' (glowing green radioactive puddle), 'paint' (splatter), 'tag' (graffiti text). */
  K.decal = function (kind, i) {
    i = i || 0;
    return K.paint(
      "art",
      "decal_" + kind + "_" + i,
      128,
      128,
      function (x, X, Y, W, H) {
        x.clearRect(X, Y, W, H);
        const r = K.rng(kind + i);
        const cx = X + W / 2,
          cy = Y + H / 2;
        const blob = (col, n, rds) => {
          for (let k = 0; k < n; k++) {
            const a = r() * 6.3,
              d = r() * rds;
            const g = x.createRadialGradient(
              cx + Math.cos(a) * d,
              cy + Math.sin(a) * d,
              0,
              cx + Math.cos(a) * d,
              cy + Math.sin(a) * d,
              rds * (0.3 + r() * 0.5),
            );
            g.addColorStop(0, col(0.8));
            g.addColorStop(1, col(0));
            x.fillStyle = g;
            x.fillRect(X, Y, W, H);
          }
        };
        if (kind === "blood") {
          blob((a) => "rgba(90,10,8," + a + ")", 10, W * 0.3);
          for (let k = 0; k < 20; k++) {
            x.fillStyle = "rgba(80,8,6,0.8)";
            x.beginPath();
            x.arc(
              cx + (r() - 0.5) * W * 0.9,
              cy + (r() - 0.5) * H * 0.9,
              1 + r() * 4,
              0,
              6.3,
            );
            x.fill();
          }
        } else if (kind === "puddle")
          blob((a) => "rgba(20,25,20," + a * 0.8 + ")", 8, W * 0.3);
        else if (kind === "hotspot")
          blob((a) => "rgba(90,255,60," + a * 0.7 + ")", 9, W * 0.3);
        else if (kind === "scorch")
          blob((a) => "rgba(10,8,6," + a + ")", 12, W * 0.32);
        else if (kind === "grime")
          blob((a) => "rgba(50,40,25," + a * 0.7 + ")", 14, W * 0.35);
        else if (kind === "paint") {
          const cols = [
            "220,40,30",
            "30,80,200",
            "240,200,40",
            "30,160,90",
            "240,240,230",
          ];
          for (let k = 0; k < 5; k++) {
            const c = cols[(k + i) % 5];
            blob((a) => "rgba(" + c + "," + a + ")", 2, W * 0.2);
          }
        } else if (kind === "crack") {
          x.strokeStyle = "rgba(15,12,10,0.8)";
          x.lineWidth = 1.5;
          for (let k = 0; k < 6; k++) {
            x.beginPath();
            let px = cx,
              py = cy;
            x.moveTo(px, py);
            for (let s = 0; s < 6; s++) {
              px += (r() - 0.5) * 40;
              py += (r() - 0.5) * 40;
              x.lineTo(px, py);
            }
            x.stroke();
          }
        } else if (kind === "roach") {
          // egg sacs & slime
          blob((a) => "rgba(120,110,40," + a * 0.7 + ")", 10, W * 0.35);
          for (let k = 0; k < 18; k++) {
            x.fillStyle = "rgba(220,200,140,0.85)";
            x.beginPath();
            x.ellipse(
              cx + (r() - 0.5) * W * 0.6,
              cy + (r() - 0.5) * H * 0.6,
              3 + r() * 4,
              2 + r() * 2,
              r() * 3,
              0,
              6.3,
            );
            x.fill();
          }
        }
      },
    );
  };
  /** Graffiti text decal (alpha) */
  K.tag = function (text, color, w, h, o) {
    o = o || {};
    return K.paint(
      "art",
      "tag_" + text + color,
      w || 256,
      h || 96,
      function (x, X, Y, W, H) {
        x.clearRect(X, Y, W, H);
        x.save();
        x.translate(X + W / 2, Y + H / 2);
        x.rotate(o.rot || -0.05);
        x.font =
          "bold " +
          Math.round(H * (o.size || 0.55)) +
          "px " +
          (o.font || "Impact, Arial Black, sans-serif");
        x.textAlign = "center";
        x.textBaseline = "middle";
        x.lineWidth = H * 0.06;
        x.strokeStyle = "rgba(0,0,0,0.6)";
        x.strokeText(text, 0, 0, W * 0.95);
        x.fillStyle = color || "#d02020";
        x.fillText(text, 0, 0, W * 0.95);
        // drips
        const r = K.rng(text);
        for (let k = 0; k < 8; k++) {
          const px = (r() - 0.5) * W * 0.8;
          x.fillRect(px, H * 0.1, 2, H * (0.1 + r() * 0.3));
        }
        x.restore();
      },
    );
  };

  // ------------------------------------------------------------------
  // Framed picture on a wall (local coords): (x,y,z) wall surface point, facing (nx,nz)
  // ------------------------------------------------------------------
  K.framed = function (b, x, y, z, nx, nz, w, h, rect, o) {
    o = o || {};
    const fm = o.frame || "gold";
    const rx = nz,
      rz = -nx,
      t = o.fw || 0.06,
      d = o.depth || 0.04;
    const P = (u, v, dd) => [x + rx * u + nx * dd, y + v, z + rz * u + nz * dd];
    // canvas
    const c0 = P(-w / 2, -h / 2, d),
      c1 = P(w / 2, -h / 2, d),
      c2 = P(w / 2, h / 2, d),
      c3 = P(-w / 2, h / 2, d);
    b.quad("art", c0, c1, c2, c3, {
      rect,
      grime: 0,
      tint: o.tint || [0.95, 0.92, 0.85],
    });
    if (o.frame === false) return;
    // frame bars
    const bar = (u0, v0, u1, v1) => {
      const a = P(u0, v0, d / 2),
        bb = P(u1, v1, d / 2);
      b.beam(fm, a[0], a[1], a[2], bb[0], bb[1], bb[2], t, d + 0.02, {
        grime: 0.2,
        tint: o.frameTint,
      });
    };
    bar(-w / 2 - t / 2, -h / 2 - t / 2, w / 2 + t / 2, -h / 2 - t / 2);
    bar(-w / 2 - t / 2, h / 2 + t / 2, w / 2 + t / 2, h / 2 + t / 2);
    bar(-w / 2 - t / 2, -h / 2 - t, -w / 2 - t / 2, h / 2 + t);
    bar(w / 2 + t / 2, -h / 2 - t, w / 2 + t / 2, h / 2 + t);
    if (o.tilt) {
      /* tilted frames handled by caller */
    }
  };
  /** A salon-hang cluster of paintings filling a wall span. */
  K.salonWall = function (b, x0, x1, y0, y1, fixed, nx, nz, seed, o) {
    o = o || {};
    const r = K.rng(seed);
    // fixed: the wall line coordinate (z for walls facing ±z, x for walls facing ±x)
    let t = x0 + 0.3;
    while (t < x1 - 0.5) {
      const w = 0.5 + r() * 1.1;
      if (t + w > x1 - 0.2) break;
      let yy = y0 + 0.2;
      while (yy < y1 - 0.5) {
        const h = 0.45 + r() * 0.9;
        if (yy + h > y1 - 0.15) break;
        if (r() < (o.density || 0.8)) {
          const rect =
            r() < 0.12 && o.photos
              ? K.photo(o.photos, (r() * 12) | 0)
              : K.painting((r() * 40) | 0, 128, 160);
          const cx = t + w / 2,
            cy = yy + h / 2;
          const px = nz !== 0 ? cx : fixed,
            pz = nz !== 0 ? fixed : cx;
          K.framed(b, px, cy, pz, nx, nz, w - 0.12, h - 0.12, rect, {
            frame: r.pick(["gold", "wood_dark", "black_iron", "gold"]),
          });
        }
        yy += h + 0.12 + r() * 0.15;
      }
      t += w + 0.1 + r() * 0.2;
    }
  };
})();
