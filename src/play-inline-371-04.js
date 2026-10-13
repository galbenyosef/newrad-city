// play-inline-371 04 — ctx
// Lines 636-898 of readable/play-inline-371.pretty.js (statement-aligned).
  P.sootTex = function () {
    return P.canvasTex(
      "m3_soot",
      512,
      512,
      (ctx, w, h) => {
        const r = P.rng("soot");
        ctx.clearRect(0, 0, w, h);
        // plume: several overlapping soft blobs rising from the bottom
        for (let i = 0; i < 60; i++) {
          const t = r(),
            x = w * 0.25 + (r() - 0.5) * w * 0.3 * (0.4 + t),
            y = h * (1 - t * 0.95),
            rad = w * (0.05 + (1 - t) * 0.1 + r() * 0.05);
          const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
          g.addColorStop(0, "rgba(12,9,6," + 0.28 * (1 - t * 0.7) + ")");
          g.addColorStop(1, "rgba(12,9,6,0)");
          ctx.fillStyle = g;
          ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);
        }
        {
          ctx.save();
          ctx.translate(w * 0.25, h);
          ctx.scale(1, 0.45);
          const g = ctx.createRadialGradient(0, 0, 0, 0, 0, w * 0.22);
          g.addColorStop(0, "rgba(8,6,4,0.8)");
          g.addColorStop(1, "rgba(8,6,4,0)");
          ctx.fillStyle = g;
          ctx.fillRect(-w * 0.25, -w * 0.25, w * 0.5, w * 0.25);
          ctx.restore();
        }
        // streaks
        for (let i = 0; i < 70; i++) {
          const x = w * 0.5 + r() * w * 0.5,
            len = h * (0.2 + r() * 0.8),
            ww = 2 + r() * 9;
          const g = ctx.createLinearGradient(0, 0, 0, len);
          const rust = r() < 0.3;
          g.addColorStop(
            0,
            rust ? "rgba(90,50,20,0.45)" : "rgba(20,16,12,0.5)",
          );
          g.addColorStop(1, "rgba(20,16,12,0)");
          ctx.fillStyle = g;
          ctx.fillRect(x, 0, ww, len);
        }
        const g2 = ctx.createLinearGradient(0, 0, 0, h * 0.12);
        g2.addColorStop(0, "rgba(15,12,8,0.6)");
        g2.addColorStop(1, "rgba(15,12,8,0)");
        ctx.fillStyle = g2;
        ctx.fillRect(w * 0.5, 0, w * 0.5, h * 0.12);
      },
      { clamp: true },
    );
  };
  /** Shared soot material key (soft-blended, no depth write). */
  P.sootMat = () =>
    P.texMat("m3_soot", P.sootTex(), {
      transparent: true,
      alphaTest: 0.01,
      depthWrite: false,
      rough: 1,
    });

  /** Clock face (stopped at 9:47). o: {bg, fg, roman} */
  P.clockTex = function (key, o) {
    o = o || {};
    return P.canvasTex(
      "m3_clock_" + key,
      256,
      256,
      (ctx, w, h) => {
        const g = ctx.createRadialGradient(
          w / 2,
          h / 2,
          8,
          w / 2,
          h / 2,
          w / 2,
        );
        g.addColorStop(0, o.bg0 || "#f2e8c8");
        g.addColorStop(1, o.bg1 || "#c0aa78");
        ctx.fillStyle = "#1a1208";
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, w / 2 - 6, 0, TAU);
        ctx.fill();
        ctx.strokeStyle = "#8a6a28";
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, w / 2 - 8, 0, TAU);
        ctx.stroke();
        ctx.fillStyle = o.fg || "#2a2014";
        ctx.font = "bold 24px " + P.FONTS.SERIF;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const R = [
          "XII",
          "I",
          "II",
          "III",
          "IIII",
          "V",
          "VI",
          "VII",
          "VIII",
          "IX",
          "X",
          "XI",
        ];
        for (let i = 0; i < 12; i++) {
          const a = (i / 12) * TAU - HP;
          ctx.fillText(
            R[i],
            w / 2 + Math.cos(a) * 94,
            h / 2 + Math.sin(a) * 94,
          );
        }
        ctx.strokeStyle = "#18120a";
        ctx.lineCap = "round";
        ctx.lineWidth = 8;
        const ah = ((9 + 47 / 60) / 12) * TAU - HP;
        ctx.beginPath();
        ctx.moveTo(w / 2, h / 2);
        ctx.lineTo(w / 2 + Math.cos(ah) * 52, h / 2 + Math.sin(ah) * 52);
        ctx.stroke();
        ctx.lineWidth = 5;
        const am = (47 / 60) * TAU - HP;
        ctx.beginPath();
        ctx.moveTo(w / 2, h / 2);
        ctx.lineTo(w / 2 + Math.cos(am) * 80, h / 2 + Math.sin(am) * 80);
        ctx.stroke();
        // a bullet crack
        ctx.strokeStyle = "rgba(40,30,20,0.6)";
        ctx.lineWidth = 1.4;
        for (let i = 0; i < 8; i++) {
          ctx.beginPath();
          ctx.moveTo(w * 0.36, h * 0.66);
          ctx.lineTo(
            w * 0.36 + Math.cos(i * 0.8) * 50,
            h * 0.66 + Math.sin(i * 0.8) * 50,
          );
          ctx.stroke();
        }
      },
      { clamp: true },
    );
  };

  /** Continuity flag: stars in a ring on blue canton, red & white stripes (original take). */
  P.continuityFlagTex = function (vertical) {
    return P.canvasTex(
      "m3_continuity_flag" + (vertical ? "_v" : ""),
      vertical ? 256 : 512,
      vertical ? 512 : 256,
      (ctx, w, h) => {
        const r = P.rng("eflag");
        ctx.save();
        if (vertical) {
          ctx.translate(w, 0);
          ctx.rotate(HP);
        }
        const W = vertical ? h : w,
          H = vertical ? w : h;
        for (let i = 0; i < 13; i++) {
          ctx.fillStyle = i % 2 ? "#e8e0cc" : "#9a2420";
          ctx.fillRect(0, (i * H) / 13, W, H / 13 + 1);
        }
        const cw = W * 0.42,
          chh = (H * 7) / 13;
        ctx.fillStyle = "#1c2a5a";
        ctx.fillRect(0, 0, cw, chh);
        ctx.fillStyle = "#ece6d4";
        const star = (x, y, s) => {
          ctx.beginPath();
          for (let k = 0; k < 10; k++) {
            const a = (k / 10) * TAU - HP,
              rr = k % 2 ? s * 0.42 : s;
            ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
          }
          ctx.closePath();
          ctx.fill();
        };
        for (let k = 0; k < 13; k++) {
          const a = (k / 13) * TAU;
          star(
            cw / 2 + Math.cos(a) * chh * 0.33,
            chh / 2 + Math.sin(a) * chh * 0.33,
            chh * 0.055,
          );
        }
        star(cw / 2, chh / 2, chh * 0.12);
        ctx.restore();
        P.blotches(ctx, w, h, r, 20, 0.25);
        P.speckle(ctx, w, h, r, 700, 0.25, 0.06);
      },
      { clamp: true },
    );
  };

  /** Spray-painted bedsheet banner (transparent edges, ragged). */
  P.sheetTex = function (key, lines, fg) {
    return P.canvasTex(
      "m3_sheet_" + key,
      512,
      256,
      (ctx, w, h) => {
        const r = P.rng("sheet" + key);
        ctx.fillStyle = "#d4ccb4";
        ctx.fillRect(0, 0, w, h);
        P.blotches(ctx, w, h, r, 30, 0.35);
        for (let i = 0; i < 6; i++) {
          ctx.fillStyle = "rgba(90,70,40,0.2)";
          ctx.fillRect(0, r() * h, w, 2 + r() * 4);
        }
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const L = lines.length;
        let fs = Math.floor((h * 0.7) / L);
        ctx.font = "bold " + fs + 'px Impact, "Arial Black", sans-serif';
        let mw = 0;
        for (const t of lines) mw = Math.max(mw, ctx.measureText(t).width);
        if (mw > w * 0.9) {
          fs = Math.floor((fs * w * 0.9) / mw);
          ctx.font = "bold " + fs + 'px Impact, "Arial Black", sans-serif';
        }
        lines.forEach((t, i) => {
          const y = h / 2 + (i - (L - 1) / 2) * fs;
          ctx.save();
          ctx.translate(w / 2, y);
          ctx.rotate((r() - 0.5) * 0.08);
          ctx.fillStyle = fg || "#a01c14";
          ctx.fillText(t, 0, 0);
          for (let k = 0; k < 12; k++)
            ctx.fillRect(
              (r() - 0.5) * w * 0.8,
              fs * 0.25,
              2 + r() * 2,
              5 + r() * fs * 0.7,
            );
          ctx.restore();
        });
        // ragged holes (alpha)
        ctx.globalCompositeOperation = "destination-out";
        for (let i = 0; i < 7; i++) {
          ctx.beginPath();
          ctx.arc(
            r() * w,
            r() < 0.5 ? r() * 20 : h - r() * 20,
            6 + r() * 16,
            0,
            TAU,
          );
          ctx.fill();
        }
        ctx.globalCompositeOperation = "source-over";
      },
      { clamp: true },
    );
  };

  /** New York Central System rail map (office wall). */
