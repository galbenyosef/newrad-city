// play-inline-88 02 — ctx
// Lines 51-471 of readable/play-inline-88.pretty.js (statement-aligned).
  M.defineAtlas("grime", function () {
    const S = 1024,
      C = 256,
      cv = M.canvas(S, S),
      ctx = cv.getContext("2d");
    const r = M.rng("grime-atlas");
    ctx.clearRect(0, 0, S, S);
    const cell = (i) => [(i % 4) * C, Math.floor(i / 4) * C];
    const clip = (i, fn) => {
      const [x, y] = cell(i);
      ctx.save();
      ctx.beginPath();
      ctx.rect(x + 2, y + 2, C - 4, C - 4);
      ctx.clip();
      fn(x, y);
      ctx.restore();
    };
    const rgba = (c, a) =>
      "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + a.toFixed(3) + ")";
    // vertical streak helper: gradient from y0 (alpha a0) to y0+len (0)
    function streak(x, y0, w, len, col, a0, wobble) {
      const g = ctx.createLinearGradient(0, y0, 0, y0 + len);
      g.addColorStop(0, rgba(col, a0));
      g.addColorStop(0.6, rgba(col, a0 * 0.45));
      g.addColorStop(1, rgba(col, 0));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(x, y0);
      const n = 8;
      let xx = x;
      for (let k = 1; k <= n; k++) {
        xx += (r() - 0.5) * (wobble || 1.5);
        ctx.lineTo(xx + w * (1 - (k / n) * 0.6), y0 + (len * k) / n);
      }
      for (let k = n; k >= 0; k--)
        ctx.lineTo(
          x + (r() - 0.5) * 1.2 - (k === 0 ? 0 : 0),
          y0 + (len * k) / n,
        );
      ctx.closePath();
      ctx.fill();
    }
    function blob(cx, cy, rds, col, a) {
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rds);
      g.addColorStop(0, rgba(col, a));
      g.addColorStop(1, rgba(col, 0));
      ctx.fillStyle = g;
      ctx.fillRect(cx - rds, cy - rds, rds * 2, rds * 2);
    }
    const SOOT = [14, 12, 10],
      DIRT = [34, 28, 20],
      BROWN = [62, 44, 26],
      RUST = [118, 58, 24];
    // 0 rain streaks hanging from the top edge (under cornices / sills)
    clip(GR.STREAKS, (x, y) => {
      const g = ctx.createLinearGradient(0, y, 0, y + 34);
      g.addColorStop(0, rgba(DIRT, 0.55));
      g.addColorStop(1, rgba(DIRT, 0));
      ctx.fillStyle = g;
      ctx.fillRect(x, y, C, 34);
      for (let i = 0; i < 46; i++)
        streak(
          x + r() * C,
          y + r() * 12,
          2 + r() * 11,
          50 + r() * 200,
          r() < 0.8 ? DIRT : BROWN,
          0.25 + r() * 0.4,
          2,
        );
    });
    // 1 fire-soot plume rising from a window top (bottom-centre) and spreading upward
    clip(GR.SOOT, (x, y) => {
      for (let i = 0; i < 70; i++) {
        const t = i / 70,
          cy = y + C - 18 - t * (C - 40) + (r() - 0.5) * 10;
        const spread = 26 + t * 78,
          cx =
            x + C / 2 + (r() - 0.5) * spread * 0.9 + Math.sin(t * 5 + r()) * 10;
        blob(
          cx,
          cy,
          14 + t * 46 + r() * 16,
          SOOT,
          (0.22 - t * 0.16) * (0.7 + r() * 0.6),
        );
      }
      // hard black lip right above the opening
      ctx.fillStyle = rgba(SOOT, 0.8);
      ctx.beginPath();
      ctx.ellipse(x + C / 2, y + C - 14, 52, 14, 0, 0, 7);
      ctx.fill();
      for (let i = 0; i < 9; i++)
        streak(
          x + C / 2 + (r() - 0.5) * 90,
          y + C - 30 - r() * 40,
          3 + r() * 6,
          -60 - r() * 90,
          SOOT,
          0.25,
          3,
        );
    });
    // 2 base grime: dark at the bottom, splash specks, upward-fading drips
    clip(GR.BASE, (x, y) => {
      const g = ctx.createLinearGradient(0, y + C, 0, y);
      g.addColorStop(0, rgba(DIRT, 0.82));
      g.addColorStop(0.35, rgba(DIRT, 0.4));
      g.addColorStop(1, rgba(DIRT, 0));
      ctx.fillStyle = g;
      ctx.fillRect(x, y, C, C);
      for (let i = 0; i < 260; i++) {
        ctx.fillStyle = rgba(r() < 0.7 ? DIRT : BROWN, 0.2 + r() * 0.5);
        const py = y + C - Math.pow(r(), 2.2) * C * 0.6;
        ctx.fillRect(x + r() * C, py, 1 + r() * 4, 1 + r() * 4);
      }
      for (let i = 0; i < 26; i++)
        streak(
          x + r() * C,
          y + C * (0.25 + r() * 0.4),
          2 + r() * 6,
          C * 0.6,
          DIRT,
          0.25,
          1,
        );
    });
    // 3 water stain / efflorescence with tide lines
    clip(GR.STAIN, (x, y) => {
      for (let k = 0; k < 5; k++) {
        const cx = x + C / 2 + (r() - 0.5) * 40,
          cy = y + C / 2 + (r() - 0.5) * 40,
          rds = 40 + k * 16 + r() * 10;
        blob(cx, cy, rds, BROWN, 0.18);
        ctx.strokeStyle = rgba(BROWN, 0.35);
        ctx.lineWidth = 2 + r() * 2;
        ctx.beginPath();
        for (let a = 0; a <= 6.3; a += 0.25) {
          const rr = rds * (0.85 + r() * 0.2);
          ctx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 1.2);
        }
        ctx.stroke();
      }
      ctx.fillStyle = "rgba(220,214,196,0.18)";
      for (let i = 0; i < 90; i++)
        ctx.fillRect(
          x + 40 + r() * 170,
          y + 40 + r() * 170,
          2 + r() * 6,
          1 + r() * 3,
        );
    });
    // 4 rust runs (under iron: fire escapes, railings, bolts)
    clip(GR.RUST, (x, y) => {
      for (let i = 0; i < 34; i++)
        streak(
          x + 10 + r() * (C - 20),
          y + r() * 40,
          2 + r() * 7,
          60 + r() * 180,
          r() < 0.7 ? RUST : BROWN,
          0.35 + r() * 0.35,
          1.5,
        );
    });
    // 5 dead vines climbing from the bottom
    function vine(x0, y0, dir, len, w, col) {
      let px = x0,
        py = y0,
        a = dir;
      ctx.strokeStyle = col;
      ctx.lineCap = "round";
      for (let s = 0; s < len; s++) {
        const nx = px + Math.cos(a) * 7,
          ny = py + Math.sin(a) * 7;
        ctx.lineWidth = Math.max(0.6, w * (1 - s / len));
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(nx, ny);
        ctx.stroke();
        if (r() < 0.12 && s > 2 && len - s > 4)
          vine(
            nx,
            ny,
            a + (r() < 0.5 ? -1 : 1) * (0.5 + r() * 0.6),
            Math.floor((len - s) * 0.6),
            w * 0.6,
            col,
          );
        if (r() < 0.5) {
          ctx.fillStyle =
            r() < 0.5 ? "rgba(60,48,30,0.8)" : "rgba(44,40,26,0.8)";
          ctx.beginPath();
          ctx.ellipse(
            nx + (r() - 0.5) * 6,
            ny,
            2 + r() * 2.5,
            1.2 + r(),
            r() * 3,
            0,
            7,
          );
          ctx.fill();
        }
        px = nx;
        py = ny;
        a += (r() - 0.5) * 0.5;
      }
    }
    clip(GR.VINES, (x, y) => {
      for (let i = 0; i < 7; i++)
        vine(
          x + 20 + r() * (C - 40),
          y + C - 3,
          -Math.PI / 2 + (r() - 0.5) * 0.5,
          22 + ((r() * 12) | 0),
          4.5,
          "rgba(46,36,24,0.92)",
        );
    });
    // 6 structural wall cracks
    clip(GR.CRACKS, (x, y) => {
      ctx.lineCap = "round";
      for (let k = 0; k < 4; k++) {
        let px = x + 30 + r() * (C - 60),
          py = y + 6;
        ctx.strokeStyle = "rgba(10,9,8,0.85)";
        let lw = 4;
        ctx.beginPath();
        ctx.moveTo(px, py);
        while (py < y + C - 8) {
          px += (r() - 0.5) * 26;
          py += 8 + r() * 14;
          ctx.lineTo(M.clamp(px, x + 6, x + C - 6), py);
        }
        ctx.lineWidth = lw;
        ctx.stroke();
        lw *= 0.5;
      }
      ctx.fillStyle = "rgba(200,190,170,0.12)";
      for (let i = 0; i < 40; i++)
        ctx.fillRect(x + r() * C, y + r() * C, 2 + r() * 5, 2 + r() * 5);
    });
    // 7 blast scorch (radial, ragged)
    clip(GR.SCORCH, (x, y) => {
      blob(x + C / 2, y + C / 2, C / 2 - 6, SOOT, 0.85);
      for (let i = 0; i < 40; i++) {
        const a = r() * 7,
          d = 30 + r() * 80;
        blob(
          x + C / 2 + Math.cos(a) * d,
          y + C / 2 + Math.sin(a) * d,
          10 + r() * 24,
          SOOT,
          0.35,
        );
      }
      ctx.fillStyle = "rgba(0,0,0,0.9)";
      ctx.beginPath();
      for (let a = 0; a < 6.3; a += 0.3) {
        const rr = 26 + r() * 22;
        ctx.lineTo(x + C / 2 + Math.cos(a) * rr, y + C / 2 + Math.sin(a) * rr);
      }
      ctx.fill();
    });
    // 8 bullet spray
    clip(GR.BULLETS, (x, y) => {
      for (let i = 0; i < 38; i++) {
        const px = x + C / 2 + (r() - 0.5) * 200,
          py = y + C / 2 + (r() - 0.5) * 120,
          rr = 3 + r() * 5;
        ctx.fillStyle = "rgba(210,200,180,0.45)";
        ctx.beginPath();
        ctx.arc(px, py, rr * 1.9, 0, 7);
        ctx.fill();
        ctx.fillStyle = "rgba(12,10,8,0.95)";
        ctx.beginPath();
        ctx.arc(px, py, rr, 0, 7);
        ctx.fill();
      }
    });
    // 9 damp moss / algae creeping up from the pavement
    clip(GR.MOSS, (x, y) => {
      for (let i = 0; i < 60; i++)
        blob(
          x + r() * C,
          y + C - Math.pow(r(), 1.8) * C * 0.7,
          12 + r() * 30,
          r() < 0.5 ? [40, 48, 24] : [28, 32, 18],
          0.3,
        );
      const g = ctx.createLinearGradient(0, y + C, 0, y + C * 0.55);
      g.addColorStop(0, "rgba(30,36,20,0.6)");
      g.addColorStop(1, "rgba(30,36,20,0)");
      ctx.fillStyle = g;
      ctx.fillRect(x, y, C, C);
    });
    // 10 peeled plaster / spalled stucco showing brick & lath
    clip(GR.PEEL, (x, y) => {
      for (let k = 0; k < 3; k++) {
        const cx = x + 50 + r() * 150,
          cy = y + 50 + r() * 150;
        ctx.fillStyle = "rgba(96,52,36,0.85)";
        ctx.beginPath();
        for (let a = 0; a < 6.3; a += 0.35) {
          const rr = 26 + r() * 34;
          ctx.lineTo(cx + Math.cos(a) * rr * 1.3, cy + Math.sin(a) * rr);
        }
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "rgba(40,24,16,0.5)";
        ctx.lineWidth = 1.2;
        for (let yy = cy - 50; yy < cy + 50; yy += 9) {
          ctx.beginPath();
          ctx.moveTo(cx - 55, yy);
          ctx.lineTo(cx + 55, yy);
          ctx.stroke();
        }
        ctx.strokeStyle = "rgba(20,16,12,0.7)";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });
    // 11 soot band (smoke that poured out of a burnt storefront and blackened the wall above)
    clip(GR.SOOTBAND, (x, y) => {
      const g = ctx.createLinearGradient(0, y + C, 0, y);
      g.addColorStop(0, rgba(SOOT, 0.85));
      g.addColorStop(0.45, rgba(SOOT, 0.45));
      g.addColorStop(1, rgba(SOOT, 0));
      ctx.fillStyle = g;
      ctx.fillRect(x, y, C, C);
      for (let i = 0; i < 14; i++) {
        const cx = x + r() * C;
        for (let k = 0; k < 8; k++)
          blob(
            cx + (r() - 0.5) * 30,
            y + C - k * 26 - r() * 10,
            20 + k * 5,
            SOOT,
            0.12,
          );
      }
    });
    // 12 vines hanging from the top edge
    clip(GR.HANGVINES, (x, y) => {
      for (let i = 0; i < 8; i++)
        vine(
          x + 16 + r() * (C - 32),
          y + 3,
          Math.PI / 2 + (r() - 0.5) * 0.4,
          16 + ((r() * 16) | 0),
          3.5,
          "rgba(50,40,26,0.92)",
        );
    });
    // 13 drain leak: wet dark column from a point near the top
    clip(GR.LEAK, (x, y) => {
      blob(x + C / 2, y + 30, 26, DIRT, 0.6);
      for (let i = 0; i < 12; i++)
        streak(
          x + C / 2 - 20 + r() * 40,
          y + 24,
          4 + r() * 10,
          C - 40,
          r() < 0.5 ? DIRT : [30, 36, 26],
          0.4,
          1,
        );
    });
    // 14 charred patch (heavy fire damage, ragged black with ashy edges)
    clip(GR.CHAR, (x, y) => {
      ctx.fillStyle = rgba(SOOT, 0.92);
      ctx.beginPath();
      for (let a = 0; a < 6.3; a += 0.18) {
        const rr = (C / 2 - 30) * (0.6 + r() * 0.4);
        ctx.lineTo(x + C / 2 + Math.cos(a) * rr, y + C / 2 + Math.sin(a) * rr);
      }
      ctx.fill();
      for (let i = 0; i < 30; i++) {
        const a = r() * 7,
          d = 70 + r() * 40;
        blob(
          x + C / 2 + Math.cos(a) * d,
          y + C / 2 + Math.sin(a) * d,
          14 + r() * 20,
          SOOT,
          0.4,
        );
      }
      ctx.fillStyle = "rgba(150,140,120,0.3)";
      for (let i = 0; i < 60; i++)
        ctx.fillRect(
          x + 40 + r() * 170,
          y + 40 + r() * 170,
          1 + r() * 3,
          1 + r() * 3,
        );
    });
    // 15 settled dust / ash band (lighter)
    clip(GR.DUST, (x, y) => {
      const g = ctx.createLinearGradient(0, y + C, 0, y);
      g.addColorStop(0, "rgba(150,140,118,0.55)");
      g.addColorStop(0.5, "rgba(150,140,118,0.2)");
      g.addColorStop(1, "rgba(150,140,118,0)");
      ctx.fillStyle = g;
      ctx.fillRect(x, y, C, C);
      for (let i = 0; i < 200; i++) {
        ctx.fillStyle =
          "rgba(170,160,138," + (0.1 + r() * 0.3).toFixed(2) + ")";
        ctx.fillRect(
          x + r() * C,
          y + C - Math.pow(r(), 2) * C * 0.7,
          1 + r() * 3,
          1 + r() * 3,
        );
      }
    });
    const t = M.finishTex(new THREE.CanvasTexture(cv));
    t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
    return { texture: t, transparent: true, roughness: 0.95 };
  });
