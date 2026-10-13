// play-inline-357 04 — ctx
// Lines 561-875 of readable/play-inline-357.pretty.js (statement-aligned).
  PF.muralTex = function () {
    return PF.canvasTex("pws_murals", 1024, 512, (ctx, W, H) => {
      const cw = W / 4,
        ch = H / 2;
      for (let v = 0; v < 8; v++) {
        const r = PF.rng("mural" + v);
        const x0 = (v % 4) * cw,
          y0 = Math.floor(v / 4) * ch;
        ctx.save();
        ctx.beginPath();
        ctx.rect(x0, y0, cw, ch);
        ctx.clip();
        const sky = ctx.createLinearGradient(0, y0, 0, y0 + ch);
        sky.addColorStop(0, "#c8b894");
        sky.addColorStop(0.55, "#e0d0a8");
        sky.addColorStop(0.56, "#6a7068");
        sky.addColorStop(1, "#4a5048");
        ctx.fillStyle = sky;
        ctx.fillRect(x0, y0, cw, ch);
        // clouds
        for (let k = 0; k < 7; k++) {
          ctx.fillStyle = "rgba(245,235,210," + (0.35 + r() * 0.3) + ")";
          ctx.beginPath();
          ctx.ellipse(
            x0 + r() * cw,
            y0 + ch * (0.1 + r() * 0.3),
            20 + r() * 40,
            8 + r() * 12,
            0,
            0,
            TAU,
          );
          ctx.fill();
        }
        // waves
        ctx.strokeStyle = "rgba(220,210,180,0.35)";
        ctx.lineWidth = 1.5;
        for (let y = y0 + ch * 0.6; y < y0 + ch; y += 6) {
          ctx.beginPath();
          for (let x = x0; x < x0 + cw; x += 8)
            ctx.lineTo(x, y + Math.sin(x * 0.15 + y) * 1.5);
          ctx.stroke();
        }
        const horizon = y0 + ch * 0.56;
        if (v % 3 === 0) {
          // ocean liner: black hull, white superstructure, three raked funnels trailing smoke
          const hx = x0 + cw * (0.15 + r() * 0.2),
            hw = cw * 0.62,
            hy = horizon + 10;
          ctx.fillStyle = "#1e1e1e";
          ctx.beginPath();
          ctx.moveTo(hx, hy);
          ctx.lineTo(hx + hw, hy - 4);
          ctx.lineTo(hx + hw - 14, hy + 22);
          ctx.lineTo(hx + 10, hy + 22);
          ctx.fill();
          ctx.fillStyle = "#e8e0cc";
          ctx.fillRect(hx + hw * 0.18, hy - 14, hw * 0.6, 14);
          ctx.fillRect(hx + hw * 0.3, hy - 22, hw * 0.34, 8);
          for (let k = 0; k < 3; k++) {
            const fx = hx + hw * (0.28 + k * 0.14);
            ctx.fillStyle = "#8a3020";
            ctx.fillRect(fx, hy - 40, 12, 26);
            ctx.fillStyle = "#111";
            ctx.fillRect(fx, hy - 40, 12, 6);
            ctx.fillStyle = "rgba(70,64,56,0.5)";
            for (let s = 0; s < 5; s++) {
              ctx.beginPath();
              ctx.arc(fx + 6 - s * 14, hy - 48 - s * 5, 7 + s * 3, 0, TAU);
              ctx.fill();
            }
          }
          ctx.fillStyle = "#c8c0a8";
          for (let k = 0; k < 14; k++)
            ctx.fillRect(hx + 16 + (k * hw) / 16, hy + 4, 3, 3);
        } else if (v % 3 === 1) {
          // tugboat pushing, a harbour lighthouse on a rock
          const tx = x0 + cw * 0.2,
            ty = horizon + 26;
          ctx.fillStyle = "#2a2420";
          ctx.beginPath();
          ctx.ellipse(tx + 40, ty, 44, 12, 0, 0, PI);
          ctx.fill();
          ctx.fillStyle = "#b8a888";
          ctx.fillRect(tx + 22, ty - 20, 34, 20);
          ctx.fillStyle = "#6a2a1a";
          ctx.fillRect(tx + 34, ty - 38, 10, 18);
          ctx.fillStyle = "rgba(90,80,70,0.45)";
          for (let s = 0; s < 4; s++) {
            ctx.beginPath();
            ctx.arc(tx + 39 + s * 12, ty - 46 - s * 8, 6 + s * 3, 0, TAU);
            ctx.fill();
          }
          const lx = x0 + cw * 0.78;
          ctx.fillStyle = "#5a5046";
          ctx.beginPath();
          ctx.ellipse(lx, horizon + 16, 34, 10, 0, PI, TAU);
          ctx.fill();
          ctx.fillStyle = "#e0d8c0";
          ctx.beginPath();
          ctx.moveTo(lx - 8, horizon + 8);
          ctx.lineTo(lx - 5, horizon - 60);
          ctx.lineTo(lx + 5, horizon - 60);
          ctx.lineTo(lx + 8, horizon + 8);
          ctx.fill();
          ctx.fillStyle = "#8a2a1a";
          ctx.fillRect(lx - 7, horizon - 70, 14, 10);
          ctx.fillStyle = "#ffe890";
          ctx.fillRect(lx - 4, horizon - 68, 8, 6);
        } else {
          // square-rigged clipper under sail
          const sx = x0 + cw * 0.5,
            sy = horizon + 18;
          ctx.fillStyle = "#2a2018";
          ctx.beginPath();
          ctx.moveTo(sx - 60, sy);
          ctx.lineTo(sx + 66, sy - 4);
          ctx.lineTo(sx + 50, sy + 14);
          ctx.lineTo(sx - 50, sy + 14);
          ctx.fill();
          ctx.strokeStyle = "#2a2018";
          ctx.lineWidth = 2;
          for (const mx of [-34, 0, 34]) {
            ctx.beginPath();
            ctx.moveTo(sx + mx, sy);
            ctx.lineTo(sx + mx, sy - 110);
            ctx.stroke();
            for (let k = 0; k < 4; k++) {
              ctx.fillStyle = "rgba(240,230,205,0.92)";
              const sw = 30 - k * 5;
              ctx.beginPath();
              ctx.moveTo(sx + mx - sw, sy - 22 - k * 24);
              ctx.quadraticCurveTo(
                sx + mx,
                sy - 10 - k * 24,
                sx + mx + sw,
                sy - 22 - k * 24,
              );
              ctx.lineTo(sx + mx + sw - 3, sy - 42 - k * 24);
              ctx.lineTo(sx + mx - sw + 3, sy - 42 - k * 24);
              ctx.fill();
            }
          }
          ctx.beginPath();
          ctx.moveTo(sx + 66, sy - 4);
          ctx.lineTo(sx + 110, sy - 30);
          ctx.stroke();
        }
        // gulls
        ctx.strokeStyle = "rgba(40,36,30,0.7)";
        ctx.lineWidth = 1.5;
        for (let k = 0; k < 4; k++) {
          const gx = x0 + r() * cw,
            gy = y0 + 20 + r() * ch * 0.3;
          ctx.beginPath();
          ctx.moveTo(gx - 6, gy);
          ctx.quadraticCurveTo(gx - 3, gy - 4, gx, gy);
          ctx.quadraticCurveTo(gx + 3, gy - 4, gx + 6, gy);
          ctx.stroke();
        }
        // fresco grime, water stains, flaking
        for (let k = 0; k < 40; k++) {
          ctx.fillStyle = "rgba(60,44,24," + (0.05 + r() * 0.15) + ")";
          ctx.beginPath();
          ctx.ellipse(
            x0 + r() * cw,
            y0 + r() * ch,
            6 + r() * 30,
            10 + r() * 50,
            0,
            0,
            TAU,
          );
          ctx.fill();
        }
        for (let k = 0; k < 10; k++) {
          ctx.fillStyle = "rgba(210,200,180,0.8)";
          ctx.fillRect(x0 + r() * cw, y0 + r() * ch, 3 + r() * 12, 2 + r() * 8);
        }
        // painted frame
        ctx.strokeStyle = "#6a5230";
        ctx.lineWidth = 10;
        ctx.strokeRect(x0 + 5, y0 + 5, cw - 10, ch - 10);
        ctx.strokeStyle = "#c8a860";
        ctx.lineWidth = 2;
        ctx.strokeRect(x0 + 11, y0 + 11, cw - 22, ch - 22);
        ctx.restore();
      }
    });
  };
  PF.muralKey = function () {
    return PF.texMat("murals", PF.muralTex(), { rough: 0.85 });
  };
  PF.muralRect = function (v) {
    const u0 = (v % 4) / 4,
      v0 = Math.floor(v / 4) === 0 ? 0.5 : 0;
    return [u0, v0, u0 + 0.25, v0 + 0.5];
  };

  /** L'Enfant's "Glory": gilded sunburst with clouds, Mount Sinai and the tablets of the law (original drawing). */
  PF.gloryTex = function () {
    return PF.canvasTex(
      "pws_glory",
      512,
      512,
      (ctx, w, h) => {
        const r = PF.rng("glory");
        ctx.clearRect(0, 0, w, h);
        const cx = w / 2,
          cy = h * 0.46;
        for (let i = 0; i < 64; i++) {
          const a = (i / 64) * TAU,
            len = (i % 2 ? 0.46 : 0.36) * w + r() * 12;
          ctx.fillStyle = i % 2 ? "#d8aa48" : "#b88a30";
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(
            cx + Math.cos(a - 0.03) * len,
            cy + Math.sin(a - 0.03) * len,
          );
          ctx.lineTo(
            cx + Math.cos(a + 0.03) * len,
            cy + Math.sin(a + 0.03) * len,
          );
          ctx.fill();
        }
        // clouds
        for (let i = 0; i < 26; i++) {
          const a = r() * TAU,
            d = w * (0.12 + r() * 0.14);
          ctx.fillStyle =
            "rgba(" +
            ((225 + r() * 20) | 0) +
            "," +
            ((215 + r() * 20) | 0) +
            "," +
            ((190 + r() * 20) | 0) +
            ",0.95)";
          ctx.beginPath();
          ctx.arc(
            cx + Math.cos(a) * d,
            cy + Math.sin(a) * d * 0.8 + 30,
            18 + r() * 22,
            0,
            TAU,
          );
          ctx.fill();
        }
        // mountain + tablets
        ctx.fillStyle = "#6a5a44";
        ctx.beginPath();
        ctx.moveTo(cx - 90, cy + 110);
        ctx.lineTo(cx - 10, cy - 10);
        ctx.lineTo(cx + 20, cy + 20);
        ctx.lineTo(cx + 90, cy + 110);
        ctx.fill();
        ctx.fillStyle = "#e8e0c8";
        for (const s of [-1, 1]) {
          ctx.beginPath();
          ctx.moveTo(cx + s * 4, cy - 60);
          ctx.lineTo(cx + s * 4, cy + 10);
          ctx.lineTo(cx + s * 40, cy + 10);
          ctx.lineTo(cx + s * 40, cy - 48);
          ctx.quadraticCurveTo(cx + s * 22, cy - 76, cx + s * 4, cy - 60);
          ctx.fill();
        }
        ctx.fillStyle = "#3a2a18";
        ctx.font = "bold 11px Georgia, serif";
        ctx.textAlign = "center";
        const numerals = [
          "I",
          "II",
          "III",
          "IV",
          "V",
          "VI",
          "VII",
          "VIII",
          "IX",
          "X",
        ];
        for (let k = 0; k < 5; k++) {
          ctx.fillText(numerals[k], cx - 22, cy - 44 + k * 11);
          ctx.fillText(numerals[k + 5], cx + 22, cy - 44 + k * 11);
        }
        // Hebrew-like cartouche → a gilt triangle with an eye-less glow (kept abstract)
        const g = ctx.createRadialGradient(cx, cy - 110, 2, cx, cy - 110, 40);
        g.addColorStop(0, "rgba(255,240,180,1)");
        g.addColorStop(1, "rgba(255,220,120,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, cy - 110, 40, 0, TAU);
        ctx.fill();
        // age: dust in the gilding
        for (let i = 0; i < 90; i++) {
          ctx.fillStyle = "rgba(40,30,10," + (0.05 + r() * 0.15) + ")";
          ctx.beginPath();
          ctx.arc(r() * w, r() * h, 2 + r() * 10, 0, TAU);
          ctx.fill();
        }
      },
      { clamp: true },
    );
  };
  PF.gloryKey = function () {
    return PF.texMat("glory", PF.gloryTex(), {
      transparent: true,
      rough: 0.35,
      metal: 0.4,
      emissive: 0.25,
      side: THREE.DoubleSide,
    });
  };

  /** Painted oval of the arms of the United States (eagle, shield, olive branch, arrows) — original drawing. */
