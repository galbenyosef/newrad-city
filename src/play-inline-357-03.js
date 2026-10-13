// play-inline-357 03 — ctx
// Lines 364-560 of readable/play-inline-357.pretty.js (statement-aligned).
  PF.headstoneTex = function (v) {
    return PF.canvasTex(
      "pws_headstone" + v,
      128,
      192,
      (ctx, w, h) => {
        const r = PF.rng("hs" + v);
        const base = ["#4a4c50", "#56524c", "#6a5a4c", "#3e4246"][v % 4];
        ctx.fillStyle = base;
        ctx.fillRect(0, 0, w, h);
        for (let i = 0; i < 260; i++) {
          ctx.fillStyle =
            "rgba(" +
            (r() < 0.5 ? "255,255,255" : "0,0,0") +
            "," +
            (0.03 + r() * 0.06) +
            ")";
          ctx.fillRect(r() * w, r() * h, 2 + r() * 8, 1 + r() * 4);
        }
        // border + tympanum arch line
        ctx.strokeStyle = "rgba(20,20,20,0.55)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(8, h - 6);
        ctx.lineTo(8, 52);
        ctx.arc(w / 2, 52, w / 2 - 8, PI, 0);
        ctx.lineTo(w - 8, h - 6);
        ctx.stroke();
        // winged death's head (or a cherub / urn on some)
        const cx = w / 2,
          cy = 34;
        ctx.fillStyle = "rgba(20,20,20,0.6)";
        if (v % 3 !== 2) {
          ctx.beginPath();
          ctx.ellipse(cx, cy, 10, 12, 0, 0, TAU);
          ctx.fill();
          ctx.fillStyle = base;
          ctx.beginPath();
          ctx.arc(cx - 4, cy - 2, 3, 0, TAU);
          ctx.arc(cx + 4, cy - 2, 3, 0, TAU);
          ctx.fill();
          ctx.fillStyle = "rgba(20,20,20,0.6)";
          for (const s of [-1, 1])
            for (let k = 0; k < 5; k++) {
              ctx.beginPath();
              ctx.ellipse(
                cx + s * (16 + k * 6),
                cy - 2 + k * 1.5,
                6,
                2.2,
                s * (0.3 + k * 0.08),
                0,
                TAU,
              );
              ctx.fill();
            }
        } else {
          ctx.beginPath();
          ctx.moveTo(cx - 9, cy + 12);
          ctx.quadraticCurveTo(cx - 14, cy - 6, cx, cy - 12);
          ctx.quadraticCurveTo(cx + 14, cy - 6, cx + 9, cy + 12);
          ctx.fill();
          ctx.fillRect(cx - 12, cy + 12, 24, 3);
        }
        // lettering lines (illegible, weathered)
        ctx.fillStyle = "rgba(15,15,15,0.55)";
        ctx.textAlign = "center";
        ctx.font = "bold 10px Georgia, serif";
        ctx.fillText("HERE LIES", cx, 66);
        const names = [
          "IOHN VAN ZANDT",
          "MARY LIVINGSTON",
          "CAPT. W. BOGART",
          "ABRAHAM DE PEYSTER",
          "SARAH TEMPLETON",
          "THOS. MOORE",
          "CATHARINE DUYCKINCK",
          "JACOB LEISLER",
        ];
        ctx.font = "bold 9px Georgia, serif";
        ctx.fillText(names[v % names.length], cx, 82);
        ctx.font = "8px Georgia, serif";
        ctx.fillText("who departed this life", cx, 96);
        ctx.fillText("Anno " + (1760 + ((v * 7) % 40)), cx, 108);
        for (let y = 122; y < h - 20; y += 10) {
          ctx.fillRect(18 + r() * 8, y, w - 40 - r() * 20, 1.4);
        }
        // lichen & loss
        for (let i = 0; i < 30; i++) {
          ctx.fillStyle =
            "rgba(" +
            ((120 + r() * 60) | 0) +
            "," +
            ((130 + r() * 50) | 0) +
            ",90," +
            (0.1 + r() * 0.25) +
            ")";
          ctx.beginPath();
          ctx.arc(r() * w, h * 0.5 + r() * h * 0.5, 2 + r() * 7, 0, TAU);
          ctx.fill();
        }
      },
      { clamp: true },
    );
  };
  PF.headstoneKey = function (v) {
    return PF.texMat("headstone" + (v % 4), PF.headstoneTex(v % 4), {
      rough: 0.9,
    });
  };

  /** Clock dial (white or gilt numerals on black), hands frozen at 9:47. */
  PF.clockTex = function (dark) {
    return PF.canvasTex(
      "pws_clock" + (dark ? "d" : "w"),
      256,
      256,
      (ctx, w, h) => {
        const cx = w / 2,
          cy = h / 2,
          R = w / 2 - 6;
        ctx.fillStyle = dark ? "#1a1c1e" : "#e8e2d0";
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, TAU);
        ctx.fill();
        ctx.strokeStyle = dark ? "#c8a050" : "#2a2a2a";
        ctx.lineWidth = 6;
        ctx.stroke();
        ctx.fillStyle = dark ? "#d8b060" : "#222";
        ctx.font = "bold 26px Georgia, serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const N = [
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
          ctx.save();
          ctx.translate(
            cx + Math.cos(a) * R * 0.78,
            cy + Math.sin(a) * R * 0.78,
          );
          ctx.rotate(a + HP);
          ctx.fillText(N[i], 0, 0);
          ctx.restore();
        }
        for (let i = 0; i < 60; i++) {
          const a = (i / 60) * TAU;
          ctx.fillRect(
            cx + Math.cos(a) * R * 0.93 - 1.5,
            cy + Math.sin(a) * R * 0.93 - 1.5,
            3,
            3,
          );
        }
        const hand = (a, len, wd) => {
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(a);
          ctx.fillRect(-wd / 2, -len, wd, len + 10);
          ctx.restore();
        };
        hand(((9 + 47 / 60) / 12) * TAU, R * 0.5, 9);
        hand((47 / 60) * TAU, R * 0.74, 5);
        const g = ctx.createRadialGradient(cx, cy, R * 0.2, cx, cy, R);
        g.addColorStop(0, "rgba(0,0,0,0)");
        g.addColorStop(1, "rgba(40,30,10,0.35)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, TAU);
        ctx.fill();
      },
      { clamp: true },
    );
  };
  PF.clockKey = function (dark) {
    return PF.texMat("clock" + (dark ? "d" : "w"), PF.clockTex(dark), {
      rough: 0.6,
      emissive: dark ? 0.15 : 0.08,
    });
  };

  /**
   * Reginald Marsh-style harbour mural (original composition): sepia-ochre fresco of ocean liners,
   * tugs and a lighthouse under a cloudy sky, in a painted frame. variant 0..7.
   */
