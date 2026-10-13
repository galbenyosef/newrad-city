// play-inline-386 05 — tint
// Lines 903-1045 of readable/play-inline-386.pretty.js (statement-aligned).
  K.clockCell = function (h, m) {
    return K.paint(
      "art",
      "ppn_clock_" + h + "_" + m,
      128,
      128,
      function (x, X, Y, W, H) {
        x.clearRect(X, Y, W, H);
        const cx = X + W / 2,
          cy = Y + H / 2;
        x.fillStyle = "#b8924a";
        x.beginPath();
        x.arc(cx, cy, 62, 0, 6.3);
        x.fill();
        x.fillStyle = "#e8e0c8";
        x.beginPath();
        x.arc(cx, cy, 54, 0, 6.3);
        x.fill();
        x.fillStyle = "#1a1208";
        x.font = "bold 11px Georgia";
        x.textAlign = "center";
        x.textBaseline = "middle";
        for (let k = 1; k <= 12; k++) {
          const a = (k / 12) * PI * 2 - HP;
          x.fillText(
            [
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
              "XI",
              "XII",
            ][k - 1],
            cx + Math.cos(a) * 44,
            cy + Math.sin(a) * 44,
          );
        }
        x.strokeStyle = "#1a1208";
        x.lineWidth = 4;
        const ha = ((h + m / 60) / 12) * PI * 2 - HP,
          ma = (m / 60) * PI * 2 - HP;
        x.beginPath();
        x.moveTo(cx, cy);
        x.lineTo(cx + Math.cos(ha) * 26, cy + Math.sin(ha) * 26);
        x.stroke();
        x.lineWidth = 2.5;
        x.beginPath();
        x.moveTo(cx, cy);
        x.lineTo(cx + Math.cos(ma) * 38, cy + Math.sin(ma) * 38);
        x.stroke();
        x.fillStyle = "#1a1208";
        x.font = "bold 6px Arial";
        x.fillText("U.S. POST OFFICE", cx, cy + 16);
        x.strokeStyle = "rgba(40,30,20,0.6)";
        x.lineWidth = 1;
        x.beginPath();
        x.moveTo(cx - 40, cy - 20);
        x.lineTo(cx + 10, cy + 40);
        x.stroke();
        K.grain(x, X, Y, W, H, 24, 5021);
      },
    );
  };

  /** Continuous runner over a straight flight (dir '-z'|'+z'|'-x'|'+x' as K.stairs): tread tops + riser faces. */
  K.stairRunner = function (b, x0, z0, x1, z1, y0, y1, dir, w, o) {
    o = o || {};
    const rise = y1 - y0,
      n = Math.max(1, Math.ceil(Math.abs(rise) / (o.maxRise || 0.24)));
    const along = dir === "+x" || dir === "-x",
      len = along ? x1 - x0 : z1 - z0,
      run = len / n,
      hw = w / 2;
    const cx = (x0 + x1) / 2,
      cz = (z0 + z1) / 2,
      mat = o.mat || "carpet",
      tint = o.tint || [0.62, 0.2, 0.16];
    for (let i = 0; i < n; i++) {
      const top = y0 + (rise * (i + 1)) / n,
        bot = y0 + (rise * i) / n,
        e = 0.006;
      if (dir === "-z") {
        const zf = z1 - run * i,
          zb = zf - run;
        b.face(mat, cx - hw, top + e, zf, 1, 0, 0, 0, 0, -1, w, run, {
          uv: "top",
          tint,
        });
        b.face(mat, cx - hw, bot, zf + e, 1, 0, 0, 0, 1, 0, w, top - bot, {
          tint: tint.map((v) => v * 0.85),
        });
      } else if (dir === "+z") {
        const zf = z0 + run * i;
        b.face(mat, cx - hw, top + e, zf + run, 1, 0, 0, 0, 0, -1, w, run, {
          uv: "top",
          tint,
        });
        b.face(mat, cx + hw, bot, zf - e, -1, 0, 0, 0, 1, 0, w, top - bot, {
          tint: tint.map((v) => v * 0.85),
        });
      } else if (dir === "-x") {
        const xf = x1 - run * i;
        b.face(mat, xf - run, top + e, cz + hw, 1, 0, 0, 0, 0, -1, run, w, {
          uv: "top",
          tint,
        });
        b.face(mat, xf + e, bot, cz + hw, 0, 0, -1, 0, 1, 0, w, top - bot, {
          tint: tint.map((v) => v * 0.85),
        });
      } else {
        const xf = x0 + run * i;
        b.face(mat, xf, top + e, cz + hw, 1, 0, 0, 0, 0, -1, run, w, {
          uv: "top",
          tint,
        });
        b.face(mat, xf - e, bot, cz - hw, 0, 0, 1, 0, 1, 0, w, top - bot, {
          tint: tint.map((v) => v * 0.85),
        });
      }
      if (o.rods) {
        const yy = bot + 0.02;
        if (dir === "-z")
          b.pipe(
            "brass",
            cx - hw - 0.05,
            yy,
            z1 - run * i - 0.03,
            cx + hw + 0.05,
            yy,
            z1 - run * i - 0.03,
            0.012,
            4,
            { tint: [0.9, 0.9, 0.9] },
          );
      }
    }
  };
