// play-inline-211 03 — ctx
// Lines 312-654 of readable/play-inline-211.pretty.js (statement-aligned).
  function hullGreyTex() {
    return PH.canvasTex("ph_hullgrey", 1024, 1024, (ctx, w, h) => {
      noiseFill(ctx, w, h, (x, y) => {
        const n = tf(x, y, 180, 1024),
          m = tf(x + 300, y + 50, 40, 1024),
          st = tf(x * 4, y * 0.25, 200, 1024);
        const v =
          104 + n * 26 + m * 9 + (st - 0.5) * 10 + (U.hash2(x, y) - 0.5) * 6;
        return [v * 0.93, v * 0.99, v * 1.03];
      });
      const r = PH.rng("hullgrey");
      // touch-up paint patches (flat rectangles, slightly different grey)
      for (let i = 0; i < 16; i++) {
        const x = r() * w,
          y = r() * h,
          pw = 40 + r() * 200,
          ph = 20 + r() * 110,
          dv = (r() - 0.5) * 34;
        ctx.fillStyle =
          "rgba(" +
          ((112 + dv) | 0) +
          "," +
          ((120 + dv) | 0) +
          "," +
          ((126 + dv) | 0) +
          ",0.55)";
        ctx.fillRect(x, y, pw, ph);
      }
      // strakes: seams every 150 px (≈1.5 m), with a lit lap edge; butt joints staggered every 512 px
      for (let y = 0; y < h; y += 150) {
        ctx.fillStyle = "rgba(24,26,28,0.7)";
        ctx.fillRect(0, y, w, 3);
        ctx.fillStyle = "rgba(200,206,210,0.22)";
        ctx.fillRect(0, y + 3, w, 2);
        ctx.fillStyle = "rgba(40,42,44,0.18)";
        ctx.fillRect(0, y - 8, w, 8);
        const off = ((y / 150) % 2) * 256;
        for (let x = off; x < w + 1; x += 512) {
          ctx.fillStyle = "rgba(24,26,28,0.6)";
          ctx.fillRect(x % w, y, 3, 150);
          ctx.fillStyle = "rgba(200,206,210,0.18)";
          ctx.fillRect((x + 3) % w, y, 2, 150);
        }
      }
      // rust runs: from the seams and from random fittings, long, tapering, orange-brown
      const run = (x, y, len, wd, a) => {
        const g = ctx.createLinearGradient(0, y, 0, y + len);
        g.addColorStop(0, "rgba(120,64,28," + a + ")");
        g.addColorStop(0.35, "rgba(104,58,30," + a * 0.7 + ")");
        g.addColorStop(1, "rgba(90,56,34,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(x - wd / 2, y);
        ctx.lineTo(x + wd / 2, y);
        ctx.lineTo(x + wd * 0.15, y + len);
        ctx.lineTo(x - wd * 0.15, y + len);
        ctx.closePath();
        ctx.fill();
      };
      for (let i = 0; i < 120; i++) {
        const sy = Math.floor(r() * 7) * 150 + 4;
        run(r() * w, sy, 40 + r() * 260, 3 + r() * 10, 0.2 + r() * 0.4);
      }
      for (let i = 0; i < 26; i++) {
        const x = r() * w,
          y = r() * h;
        ctx.fillStyle = "rgba(92,52,26,0.7)";
        ctx.beginPath();
        ctx.arc(x, y, 3 + r() * 6, 0, TAU);
        ctx.fill();
        run(x, y, 120 + r() * 380, 8 + r() * 18, 0.35 + r() * 0.3);
      }
      // salt bloom along the seams
      for (let i = 0; i < 60; i++) {
        const x = r() * w,
          y = Math.floor(r() * 7) * 150 + 6;
        ctx.fillStyle = "rgba(210,210,196," + (0.05 + r() * 0.1) + ")";
        ctx.fillRect(x, y, 30 + r() * 120, 4 + r() * 16);
      }
      // fender scrapes: bare metal smears
      for (let i = 0; i < 8; i++) {
        const x = r() * w,
          y = r() * h,
          len = 80 + r() * 260;
        ctx.strokeStyle = "rgba(70,58,48,0.45)";
        ctx.lineWidth = 2 + r() * 5;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + len, y + (r() - 0.5) * 30);
        ctx.stroke();
      }
    });
  }
  /** Red anti-fouling below the boot-top: flaking red lead, barnacle crust & silt tide marks. */
  function hullRedTex() {
    return PH.canvasTex("ph_hullred", 512, 512, (ctx, w, h) => {
      noiseFill(ctx, w, h, (x, y) => {
        const n = tf(x, y, 90, 512),
          m = tf(x + 77, y, 18, 512);
        const flake = m > 0.66 ? 0.62 : 1,
          v = (0.8 + n * 0.3) * flake;
        return [
          132 * v + (1 - flake) * 40,
          50 * v + (1 - flake) * 36,
          38 * v + (1 - flake) * 28,
        ];
      });
      const r = PH.rng("hullred");
      for (let i = 0; i < 260; i++) {
        const x = r() * w,
          y = r() * h;
        ctx.fillStyle =
          "rgba(" +
          ((120 + r() * 40) | 0) +
          "," +
          ((100 + r() * 30) | 0) +
          ",84," +
          (0.12 + r() * 0.2) +
          ")";
        ctx.beginPath();
        ctx.arc(x, y, 1 + r() * 2.5, 0, TAU);
        ctx.fill();
      }
      for (let y = 40; y < h; y += 110 + r() * 60) {
        ctx.fillStyle = "rgba(70,60,48,0.3)";
        ctx.fillRect(0, y, w, 3 + r() * 6);
      }
    });
  }
  /** A view out of a window: hazy post-bomb sky, distant ruined skyline, grey water, grime & cracks on the glass.
   *  Used (emissive) on window panes of harbour interiors so they don't read as blank white. */
  function harborViewTex() {
    return PH.canvasTex("ph_harborview2", 1024, 256, (ctx, w, h) => {
      const HZ = h * 0.56; // horizon
      const sky = ctx.createLinearGradient(0, 0, 0, HZ);
      sky.addColorStop(0, "#7f8a78");
      sky.addColorStop(0.55, "#b4b89c");
      sky.addColorStop(1, "#d8d0aa");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);
      const r = PH.rng("harborview2");
      // cloud banks
      for (let i = 0; i < 14; i++) {
        const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
        ctx.save();
        ctx.translate(r() * w, r() * HZ * 0.6);
        ctx.scale(60 + r() * 160, 8 + r() * 18);
        g.addColorStop(0, "rgba(90,96,84,0.35)");
        g.addColorStop(1, "rgba(90,96,84,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(0, 0, 1, 0, TAU);
        ctx.fill();
        ctx.restore();
      }
      // far skyline (pale, hazy), then the near Manhattan skyline (darker, broken tops, a few lit windows)
      const skyline = (base, col, maxH, minW, maxW, lit) => {
        for (let x = -10; x < w;) {
          const bw = minW + r() * (maxW - minW),
            bh = h * (0.04 + Math.pow(r(), 1.6) * maxH);
          ctx.fillStyle = col;
          ctx.fillRect(x, base - bh, bw, bh + 1);
          if (r() < 0.2) {
            ctx.beginPath();
            ctx.moveTo(x + bw * 0.2, base - bh);
            ctx.lineTo(x + bw * 0.5, base - bh - h * 0.08);
            ctx.lineTo(x + bw * 0.8, base - bh);
            ctx.fill();
          } // spire
          else if (r() < 0.3) {
            ctx.clearRect(
              x + bw * (0.4 + r() * 0.4),
              base - bh,
              bw * 0.3,
              bh * 0.15 * r(),
            );
            ctx.fillStyle = col;
          } // bombed-out top
          if (lit)
            for (let k = 0; k < 3; k++)
              if (r() < 0.25) {
                ctx.fillStyle = "rgba(230,190,110,0.8)";
                ctx.fillRect(
                  x + 2 + r() * (bw - 4),
                  base - bh + 3 + r() * (bh - 6),
                  1.5,
                  1.5,
                );
              }
          x += bw + r() * 4;
        }
      };
      skyline(HZ, "rgba(128,132,116,0.8)", 0.26, 6, 16, false);
      skyline(HZ + 2, "rgba(78,82,72,0.95)", 0.2, 8, 22, true);
      // cranes and a derelict freighter on the waterline
      ctx.strokeStyle = "rgba(60,62,56,0.95)";
      ctx.lineWidth = 2;
      for (const cx of [180, 610, 840]) {
        ctx.beginPath();
        ctx.moveTo(cx, HZ);
        ctx.lineTo(cx, HZ - 34);
        ctx.lineTo(cx + 40, HZ - 44);
        ctx.moveTo(cx, HZ - 34);
        ctx.lineTo(cx - 12, HZ - 30);
        ctx.stroke();
      }
      ctx.fillStyle = "rgba(64,60,54,1)";
      ctx.fillRect(420, HZ - 6, 120, 8);
      ctx.fillRect(505, HZ - 16, 18, 10);
      // water: darker toward the viewer, long low glints
      const wat = ctx.createLinearGradient(0, HZ, 0, h);
      wat.addColorStop(0, "#8e927e");
      wat.addColorStop(1, "#474d44");
      ctx.fillStyle = wat;
      ctx.fillRect(0, HZ + 2, w, h - HZ);
      ctx.strokeStyle = "rgba(220,214,180,0.22)";
      ctx.lineWidth = 1;
      for (let i = 0; i < 140; i++) {
        const y = HZ + 4 + Math.pow(r(), 1.5) * (h - HZ - 4),
          x = r() * w;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + 6 + r() * 36 * (y / h), y);
        ctx.stroke();
      }
      // the glass itself: light, even film of dirt, a few runs, one crack web
      ctx.fillStyle = "rgba(70,64,48,0.12)";
      ctx.fillRect(0, 0, w, h);
      const gr = ctx.createLinearGradient(0, h * 0.8, 0, h);
      gr.addColorStop(0, "rgba(60,52,38,0)");
      gr.addColorStop(1, "rgba(60,52,38,0.3)");
      ctx.fillStyle = gr;
      ctx.fillRect(0, h * 0.8, w, h * 0.2);
      for (let i = 0; i < 8; i++) {
        ctx.fillStyle = "rgba(60,54,40,0.1)";
        ctx.fillRect(r() * w, r() * h * 0.4, 1, 20 + r() * 50);
      }
      ctx.strokeStyle = "rgba(225,225,215,0.35)";
      ctx.lineWidth = 1;
      {
        const cx = w * 0.7,
          cy = h * 0.35;
        for (let k = 0; k < 7; k++) {
          const a = r() * TAU;
          let x = cx,
            y = cy;
          ctx.beginPath();
          ctx.moveTo(x, y);
          for (let s2 = 0; s2 < 4; s2++) {
            x += Math.cos(a + (r() - 0.5) * 0.8) * (10 + r() * 22);
            y += Math.sin(a + (r() - 0.5) * 0.8) * (10 + r() * 22);
            ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
      }
    });
  }
  PH.harborViewKey = function () {
    return PH.texMat("ph_harborview", harborViewTex(), {
      emissive: 0.5,
      rough: 0.3,
      name: "ph_window_view",
    });
  };
  /** Hexagonal white ceramic floor tile (Ellis washrooms / medical rooms). */
  function hexTileTex() {
    return PH.canvasTex("ph_hextile", 256, 256, (ctx, w, h) => {
      ctx.fillStyle = "#6e6a60";
      ctx.fillRect(0, 0, w, h);
      const R = 9,
        dx = R * Math.sqrt(3),
        dy = R * 1.5,
        r = PH.rng("hex");
      for (let row = -1; row < h / dy + 2; row++)
        for (let col = -1; col < w / dx + 2; col++) {
          const cx = col * dx + ((row % 2) * dx) / 2,
            cy = row * dy;
          const v = 0.85 + r() * 0.15;
          const dirty = r() < 0.08;
          ctx.fillStyle = dirty
            ? "#5b5448"
            : "rgb(" +
              ((226 * v) | 0) +
              "," +
              ((222 * v) | 0) +
              "," +
              ((210 * v) | 0) +
              ")";
          ctx.beginPath();
          for (let k = 0; k < 6; k++) {
            const a = (k / 6) * TAU + Math.PI / 6;
            ctx[k ? "lineTo" : "moveTo"](
              cx + Math.cos(a) * (R - 1),
              cy + Math.sin(a) * (R - 1),
            );
          }
          ctx.closePath();
          ctx.fill();
        }
      noiseFill(ctx, w, h, (x, y, R2, Gc, B) => {
        const n = tf(x, y, 40, 256);
        const k = 0.8 + n * 0.3;
        return [R2 * k, Gc * k, B * k * 0.97];
      });
    });
  }
  /** Red quarry tile (Ludowici-style) floor with dark grout, wear paths and dust. */
  function redTileTex() {
    return PH.canvasTex("ph_redtile", 512, 512, (ctx, w, h) => {
      ctx.fillStyle = "#3a2a22";
      ctx.fillRect(0, 0, w, h);
      const r = PH.rng("redtile"),
        T = 64;
      for (let y = 0; y < h; y += T)
        for (let x = 0; x < w; x += T) {
          const v = 0.78 + r() * 0.28;
          ctx.fillStyle =
            "rgb(" +
            ((150 * v) | 0) +
            "," +
            ((66 * v) | 0) +
            "," +
            ((44 * v) | 0) +
            ")";
          ctx.fillRect(x + 2, y + 2, T - 4, T - 4);
          if (r() < 0.12) {
            ctx.strokeStyle = "rgba(20,10,8,0.6)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(x + r() * T, y);
            ctx.lineTo(x + r() * T, y + T);
            ctx.stroke();
          }
        }
      noiseFill(ctx, w, h, (x, y, R, Gc, B) => {
        const n = tf(x, y, 90, 512);
        const k = 0.8 + n * 0.35;
        return [R * k, Gc * k, B * k];
      });
    });
  }
  /** Painted plaster: off-white, mottled, hairline cracks, rain streaks and a few chipped patches. */
