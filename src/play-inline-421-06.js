// play-inline-421 06 — fillrect
// Lines 1056-1393 of readable/play-inline-421.pretty.js (statement-aligned).
  K.roomView = function (kind, variant, w, h) {
    w = w || 256;
    h = h || 384;
    variant = variant || 0;
    return K.paint(
      "neon",
      "ph2_room_" + kind + "_" + variant,
      w,
      h,
      function (x, X, Y, W, H) {
        const r = K.rng("rv" + kind + variant);
        const hall = kind === "hall";
        const vx = X + W * (0.5 + (variant - 1) * 0.22),
          vy = Y + H * (hall ? 0.52 : 0.5);
        const bw = W * 0.42,
          bh = H * (hall ? 0.4 : 0.34); // back wall
        const bx0 = vx - bw / 2,
          bx1 = vx + bw / 2,
          by0 = vy - bh * 0.62,
          by1 = vy + bh * 0.38;
        const col = (c, k) =>
          "rgb(" + c.map((v) => Math.round(v * (k || 1))).join(",") + ")";
        const wall = hall ? [120, 112, 84] : [96, 54, 38],
          floor = hall ? [92, 86, 70] : [84, 64, 44],
          ceil = hall ? [30, 44, 36] : [34, 24, 16];
        x.fillStyle = "#000";
        x.fillRect(X, Y, W, H);
        const poly = (pts, fill) => {
          x.fillStyle = fill;
          x.beginPath();
          x.moveTo(pts[0][0], pts[0][1]);
          for (let i = 1; i < pts.length; i++) x.lineTo(pts[i][0], pts[i][1]);
          x.closePath();
          x.fill();
        };
        // floor, ceiling, side walls (gradients darken toward the viewer = light falls off from the room's lamps)
        let g = x.createLinearGradient(0, by1, 0, Y + H);
        g.addColorStop(0, col(floor, 1.1));
        g.addColorStop(1, col(floor, 0.45));
        poly(
          [
            [bx0, by1],
            [bx1, by1],
            [X + W, Y + H],
            [X, Y + H],
          ],
          g,
        );
        g = x.createLinearGradient(0, Y, 0, by0);
        g.addColorStop(0, col(ceil, 0.5));
        g.addColorStop(1, col(ceil, 1.2));
        poly(
          [
            [X, Y],
            [X + W, Y],
            [bx1, by0],
            [bx0, by0],
          ],
          g,
        );
        g = x.createLinearGradient(X, 0, bx0, 0);
        g.addColorStop(0, col(wall, 0.45));
        g.addColorStop(1, col(wall, 0.9));
        poly(
          [
            [X, Y],
            [bx0, by0],
            [bx0, by1],
            [X, Y + H],
          ],
          g,
        );
        g = x.createLinearGradient(X + W, 0, bx1, 0);
        g.addColorStop(0, col(wall, 0.45));
        g.addColorStop(1, col(wall, 0.9));
        poly(
          [
            [X + W, Y],
            [bx1, by0],
            [bx1, by1],
            [X + W, Y + H],
          ],
          g,
        );
        x.fillStyle = col(wall, 1.05);
        x.fillRect(bx0, by0, bw, bh);
        // floor boards / terrazzo joints converging on the vanishing point
        x.strokeStyle = hall ? "rgba(40,36,28,0.5)" : "rgba(30,20,12,0.55)";
        x.lineWidth = 1;
        for (let k = -8; k <= 8; k++) {
          x.beginPath();
          x.moveTo(vx + (k * bw) / 16, by1);
          x.lineTo(vx + (k * W) / 5, Y + H);
          x.stroke();
        }
        if (hall) {
          // back wall: slip gates (dark arches) + the departures board
          for (const k of [-1, 0, 1]) {
            const ax = vx + k * bw * 0.33;
            x.fillStyle = col([20, 24, 20]);
            x.fillRect(ax - bw * 0.1, by1 - bh * 0.5, bw * 0.2, bh * 0.5);
            x.beginPath();
            x.arc(ax, by1 - bh * 0.5, bw * 0.1, Math.PI, 0);
            x.fill();
          }
          x.fillStyle = "rgb(18,16,12)";
          x.fillRect(vx - bw * 0.3, by0 + bh * 0.08, bw * 0.6, bh * 0.16);
          x.fillStyle = "rgba(210,170,70,0.8)";
          for (let k = 0; k < 4; k++)
            x.fillRect(
              vx - bw * 0.27,
              by0 + bh * (0.11 + k * 0.03),
              bw * (0.3 + r() * 0.2),
              1.5,
            );
          // gallery: slab + railing running round the room at ~40 % height
          const gy = by0 + bh * 0.32;
          x.fillStyle = "rgb(26,34,28)";
          poly(
            [
              [X, Y + H * 0.2],
              [bx0, gy],
              [bx1, gy],
              [X + W, Y + H * 0.2],
              [X + W, Y + H * 0.24],
              [bx1, gy + 4],
              [bx0, gy + 4],
              [X, Y + H * 0.24],
            ],
            "rgb(26,34,28)",
          );
          x.strokeStyle = "rgba(60,80,64,0.9)";
          x.lineWidth = 1.2;
          for (let k = 0; k <= 12; k++) {
            const t = k / 12,
              px = X + (bx0 - X) * t,
              py = Y + H * 0.2 + (gy - Y - H * 0.2) * t;
            x.beginPath();
            x.moveTo(px, py);
            x.lineTo(px, py - (1 - t) * H * 0.08 - 6);
            x.stroke();
            const qx = X + W - (X + W - bx1) * t;
            x.beginPath();
            x.moveTo(qx, py);
            x.lineTo(qx, py - (1 - t) * H * 0.08 - 6);
            x.stroke();
          }
          // iron columns under the gallery
          x.fillStyle = "rgb(20,28,22)";
          for (let k = 1; k < 4; k++) {
            const t = k / 4,
              cx = X + (bx0 - X) * t,
              cw = 7 * (1 - t) + 2;
            x.fillRect(
              cx - cw / 2,
              Y + H * 0.24 + (gy - Y - H * 0.24) * t,
              cw,
              Y +
                H -
                (Y + H - by1) * t -
                (Y + H * 0.24 + (gy - Y - H * 0.24) * t),
            );
            const qx = X + W - (X + W - bx1) * t;
            x.fillRect(
              qx - cw / 2,
              Y + H * 0.24 + (gy - Y - H * 0.24) * t,
              cw,
              Y +
                H -
                (Y + H - by1) * t -
                (Y + H * 0.24 + (gy - Y - H * 0.24) * t),
            );
          }
          // pews in rows
          x.fillStyle = "rgb(34,24,16)";
          for (let k = 0; k < 5; k++) {
            const t = 0.25 + k * 0.15,
              py = by1 + (Y + H - by1) * t,
              pw = bw * (0.5 + t * 1.3);
            x.fillRect(
              vx - pw / 2 - (k % 2 ? pw * 0.1 : 0),
              py - 5 - t * 8,
              pw * 0.42,
              4 + t * 10,
            );
            x.fillRect(vx + pw * 0.08, py - 5 - t * 8, pw * 0.42, 4 + t * 10);
          }
          // the information kiosk: dark drum + brass clock glow
          const ky = by1 + (Y + H - by1) * 0.12;
          x.fillStyle = "rgb(22,16,12)";
          x.fillRect(vx - bw * 0.16, ky - bh * 0.28, bw * 0.32, bh * 0.28);
          x.fillRect(vx - bw * 0.2, ky - bh * 0.34, bw * 0.4, bh * 0.05);
          x.fillStyle = "rgba(230,220,180,0.85)";
          x.beginPath();
          x.arc(vx, ky - bh * 0.42, bw * 0.05, 0, 6.3);
          x.fill();
        } else {
          // brick coursing on the walls
          x.fillStyle = "rgba(30,16,10,0.35)";
          for (let yy = by0; yy < by1; yy += 3) x.fillRect(bx0, yy, bw, 1);
          // timber posts in two rows receding to the back
          for (let k = 0; k < 5; k++) {
            const t = k / 5,
              py0 = Y + H * 0.05 + (by0 - Y - H * 0.05) * t,
              py1 = Y + H - (Y + H - by1) * t,
              cw = 10 * (1 - t) + 2;
            for (const e of [-1, 1]) {
              const px = vx + e * (W * 0.34 * (1 - t) + bw * 0.28 * t);
              x.fillStyle = "rgb(28,18,10)";
              x.fillRect(px - cw / 2, py0, cw, py1 - py0);
            }
            x.fillStyle = "rgba(28,18,10,0.9)";
            x.fillRect(X, py0 - 2, W, 3 * (1 - t) + 1);
          }
          // stalls: counters with striped awnings (muted), goods glinting
          for (let k = 0; k < 4; k++) {
            const t = 0.2 + k * 0.18,
              e = k % 2 ? 1 : -1,
              sx = vx + e * (bw * 0.3 + W * 0.3 * (1 - t)),
              sy = by1 + (Y + H - by1) * (1 - t) * 0.5,
              sw = 26 * (1 - t) + 10,
              sh = 20 * (1 - t) + 8;
            x.fillStyle = "rgb(40,26,16)";
            x.fillRect(sx - sw / 2, sy - sh * 0.5, sw, sh * 0.5);
            for (let q = 0; q < 5; q++) {
              x.fillStyle = q % 2 ? "rgb(120,40,30)" : "rgb(140,120,90)";
              x.fillRect(
                sx - sw / 2 + (q * sw) / 5,
                sy - sh * 1.1,
                sw / 5 + 0.5,
                sh * 0.3,
              );
            }
            x.fillStyle = "rgba(220,180,110,0.8)";
            for (let q = 0; q < 4; q++)
              x.fillRect(
                sx - sw / 2 + 2 + r() * (sw - 4),
                sy - sh * 0.62,
                2,
                2,
              );
          }
          // a couple of shoppers in silhouette
          for (let k = 0; k < 3; k++) {
            const t = 0.3 + r() * 0.5,
              px = vx + (r() - 0.5) * bw * 1.4,
              py = by1 + (Y + H - by1) * t * 0.6,
              s = 16 * (0.4 + t);
            x.fillStyle = "rgb(12,9,6)";
            x.fillRect(px - s * 0.18, py - s, s * 0.36, s);
            x.beginPath();
            x.arc(px, py - s - s * 0.12, s * 0.13, 0, 6.3);
            x.fill();
          }
        }
        // lamps: pendant glows along the ceiling (both kinds) + string lights in the market
        for (let k = 0; k < 6; k++) {
          const t = k / 6,
            ly = Y + H * 0.1 + (by0 - Y - H * 0.1) * t + 8,
            lx = vx + (k % 2 ? 1 : -1) * (W * 0.25 * (1 - t) + bw * 0.2 * t),
            rr = 26 * (1 - t) + 8;
          const lg = x.createRadialGradient(lx, ly, 0, lx, ly, rr);
          lg.addColorStop(0, "rgba(255,214,150,0.95)");
          lg.addColorStop(0.25, "rgba(230,160,80,0.45)");
          lg.addColorStop(1, "rgba(200,120,50,0)");
          x.fillStyle = lg;
          x.fillRect(lx - rr, ly - rr, rr * 2, rr * 2);
        }
        if (!hall)
          for (let k = 0; k < 24; k++) {
            const t = k / 24,
              px = X + W * t,
              py = Y + H * 0.16 + Math.sin(t * Math.PI) * H * 0.1;
            x.fillStyle = "rgba(255,200,120,0.9)";
            x.fillRect(px, py, 2, 2);
          }
        // window grime: darker edges + a dirt band at the bottom (it's seen through old glass / a dim doorway)
        const vg = x.createRadialGradient(
          X + W / 2,
          Y + H * 0.5,
          W * 0.2,
          X + W / 2,
          Y + H * 0.5,
          W * 0.85,
        );
        vg.addColorStop(0, "rgba(0,0,0,0)");
        vg.addColorStop(1, "rgba(0,0,0,0.7)");
        x.fillStyle = vg;
        x.fillRect(X, Y, W, H);
        K.stains && K.stains(x, X, Y, W, H, 6, 811 + variant, 0.25, [0, 0, 0]);
      },
    );
  };

  K.harborView = function (variant, w, h) {
    w = w || 512;
    h = h || 192;
    return K.paint(
      "pics",
      "ph2_harborview_" + variant,
      w,
      h,
      function (x, X, Y, W, H) {
        const r = K.rng("hv" + variant);
        const g = x.createLinearGradient(0, Y, 0, Y + H * 0.6);
        g.addColorStop(0, "#8e9a86");
        g.addColorStop(1, "#c8c4a4");
        x.fillStyle = g;
        x.fillRect(X, Y, W, H * 0.6);
        // far shore / skyline
        x.fillStyle = "#5e6456";
        let px = X;
        while (px < X + W) {
          const bw = 6 + r() * 26,
            bh = H * (0.04 + r() * (variant === 1 ? 0.3 : 0.12));
          x.fillRect(px, Y + H * 0.6 - bh, bw, bh);
          px += bw + r() * 4;
        }
        const w2 = x.createLinearGradient(0, Y + H * 0.6, 0, Y + H);
        w2.addColorStop(0, "#5e6a58");
        w2.addColorStop(1, "#2c3a30");
        x.fillStyle = w2;
        x.fillRect(X, Y + H * 0.6, W, H * 0.4);
        x.strokeStyle = "rgba(210,220,190,0.25)";
        x.lineWidth = 1;
        for (let k = 0; k < 60; k++) {
          const yy = Y + H * (0.62 + r() * 0.36),
            xx = X + r() * W,
            ww = 6 + r() * 30;
          x.beginPath();
          x.moveTo(xx, yy);
          x.lineTo(xx + ww, yy);
          x.stroke();
        }
        K.grain(x, X, Y, W, H, 20, 900 + variant);
      },
    );
  };
