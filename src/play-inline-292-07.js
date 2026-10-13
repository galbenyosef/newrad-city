// play-inline-292 07 — fillstyle
// Lines 1546-1850 of readable/play-inline-292.pretty.js (statement-aligned).
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
