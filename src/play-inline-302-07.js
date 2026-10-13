// play-inline-302 07 — ctx
// Lines 1533-1736 of readable/play-inline-302.pretty.js (statement-aligned).
  P.reliefTex = function () {
    return P.canvasTex(
      "pe_relief",
      512,
      640,
      (ctx, w, h) => {
        const r = P.rng("relief");
        ctx.fillStyle = "#b4ab96";
        ctx.fillRect(0, 0, w, h);
        const carve = (fn, depth) => {
          ctx.save();
          ctx.translate(2, 3);
          ctx.fillStyle = "rgba(40,34,26," + 0.55 * depth + ")";
          fn();
          ctx.restore();
          ctx.save();
          ctx.translate(-1.5, -1.5);
          ctx.fillStyle = "rgba(255,250,236," + 0.35 * depth + ")";
          fn();
          ctx.restore();
          ctx.fillStyle = "#b8af9a";
          fn();
        };
        // sunburst rays from behind the tower
        const cx = w / 2,
          cy = h * 0.42;
        for (let i = 0; i < 26; i++) {
          const a0 = PI + (i / 26) * PI,
            a1 = a0 + PI / 52;
          carve(() => {
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + Math.cos(a0) * 300, cy + Math.sin(a0) * 300);
            ctx.lineTo(cx + Math.cos(a1) * 300, cy + Math.sin(a1) * 300);
            ctx.closePath();
            ctx.fill();
          }, 0.7);
        }
        carve(() => {
          ctx.beginPath();
          ctx.arc(cx, cy, 58, PI, TAU);
          ctx.fill();
        }, 1);
        // the striped tower itself
        carve(() => {
          ctx.fillRect(cx - 50, cy - 170, 100, 330);
          ctx.fillRect(cx - 34, cy - 200, 68, 40);
        }, 1.2);
        ctx.fillStyle = "rgba(50,40,30,0.4)";
        for (let k = -4; k <= 4; k++)
          ctx.fillRect(cx + k * 10.5 - 2, cy - 160, 4, 315);
        // the crowd along the bottom, looking up
        for (let i = 0; i < 9; i++) {
          const x = 40 + i * 54,
            y = h - 90 + (i % 2) * 8;
          carve(() => {
            ctx.beginPath();
            ctx.arc(x, y - 58, 12, 0, TAU);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(x - 18, y + 60);
            ctx.lineTo(x - 14, y - 40);
            ctx.lineTo(x + 14, y - 40);
            ctx.lineTo(x + 18, y + 60);
            ctx.fill();
          }, 1);
        }
        // lettering band
        carve(() => {
          ctx.fillRect(20, h - 190, w - 40, 56);
        }, 0.6);
        ctx.fillStyle = "rgba(46,38,28,0.9)";
        ctx.font = "bold 44px " + DECO;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        try {
          ctx.letterSpacing = "14px";
        } catch (e) {
          /* old canvas */
        }
        ctx.fillText("THE JOURNAL", w / 2, h - 161, w - 50);
        ctx.font = "bold 13px " + SERIF;
        try {
          ctx.letterSpacing = "3px";
        } catch (e) {
          /* */
        }
        ctx.fillStyle = "rgba(46,38,28,0.8)";
        ctx.fillText("HE MADE SO MANY OF THEM", w / 2, h - 12);
        // grime streaks & a blast scorch
        for (let i = 0; i < 40; i++) {
          ctx.fillStyle = "rgba(40,34,26," + (0.05 + r() * 0.1) + ")";
          const x = r() * w;
          ctx.fillRect(x, r() * h * 0.3, 2 + r() * 5, 60 + r() * 300);
        }
        P.blotches(ctx, w, h, r, 40, 0.25);
        P.speckle(ctx, w, h, r, 3000, 0.4);
      },
      { clamp: true },
    );
  };

  // --- TUDOR CITY neon letters (transparent, emissive) ------------------
  P.neonLetterTex = function (text, dead) {
    return P.canvasTex(
      "pe_neon_" + text + "_" + (dead || ""),
      1024,
      192,
      (ctx, w, h) => {
        ctx.clearRect(0, 0, w, h);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        let fs = 150;
        ctx.font = "bold " + fs + "px " + SERIF;
        while (ctx.measureText(text).width > w * 0.96) {
          fs -= 6;
          ctx.font = "bold " + fs + "px " + SERIF;
        }
        const tw = ctx.measureText(text).width;
        let x = w / 2 - tw / 2;
        for (let i = 0; i < text.length; i++) {
          const ch = text[i],
            cw = ctx.measureText(ch).width;
          const off = dead && dead.indexOf(i) >= 0;
          ctx.save();
          if (!off) {
            ctx.shadowColor = "#ff3018";
            ctx.shadowBlur = 22;
            ctx.fillStyle = "#ff5a3a";
          } else ctx.fillStyle = "#4a1e18";
          ctx.fillText(ch, x + cw / 2, h / 2 + 6);
          if (!off) {
            ctx.shadowBlur = 0;
            ctx.fillStyle = "#ffd8c8";
            ctx.globalAlpha = 0.6;
            ctx.fillText(ch, x + cw / 2, h / 2 + 6);
          }
          ctx.restore();
          x += cw;
        }
      },
      { clamp: true },
    );
  };

  // --- bear claw marks / blood decals ------------------------------------
  P.clawTex = function () {
    return P.canvasTex(
      "pe_claws",
      256,
      256,
      (ctx, w, h) => {
        const r = P.rng("claws");
        ctx.clearRect(0, 0, w, h);
        for (let s = 0; s < 2; s++) {
          const ox = 40 + s * 90,
            oy = 30 + s * 40;
          for (let k = 0; k < 4; k++) {
            ctx.strokeStyle = "rgba(20,14,10,0.85)";
            ctx.lineWidth = 7 - k * 0.6;
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(ox + k * 16, oy);
            ctx.quadraticCurveTo(
              ox + k * 16 + 20,
              oy + 80,
              ox + k * 14 + 34,
              oy + 150 + r() * 20,
            );
            ctx.stroke();
            ctx.strokeStyle = "rgba(230,220,200,0.35)";
            ctx.lineWidth = 2;
            ctx.stroke();
          }
        }
      },
      { clamp: true },
    );
  };
  P.bloodTex = function () {
    return P.canvasTex(
      "pe_blood",
      256,
      256,
      (ctx, w, h) => {
        const r = P.rng("blood");
        ctx.clearRect(0, 0, w, h);
        for (let i = 0; i < 26; i++) {
          const x = w / 2 + (r() - 0.5) * w * 0.7,
            y = h / 2 + (r() - 0.5) * h * 0.7,
            rr = 6 + r() * 36;
          const g = ctx.createRadialGradient(x, y, 0, x, y, rr);
          g.addColorStop(0, "rgba(70,6,4,0.95)");
          g.addColorStop(0.7, "rgba(60,8,4,0.7)");
          g.addColorStop(1, "rgba(40,4,2,0)");
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(x, y, rr, 0, TAU);
          ctx.fill();
        }
      },
      { clamp: true },
    );
  };
