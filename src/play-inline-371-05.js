// play-inline-371 05 — ctx
// Lines 899-1001 of readable/play-inline-371.pretty.js (statement-aligned).
  P.railMapTex = function () {
    return P.canvasTex(
      "m3_railmap",
      1024,
      512,
      (ctx, w, h) => {
        const r = P.rng("rail");
        ctx.fillStyle = "#d8ccaa";
        ctx.fillRect(0, 0, w, h);
        // coastline / lakes
        ctx.fillStyle = "#9ab0b0";
        ctx.beginPath();
        ctx.moveTo(w * 0.86, h);
        ctx.bezierCurveTo(w * 0.9, h * 0.7, w * 0.96, h * 0.5, w, h * 0.3);
        ctx.lineTo(w, h);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(w * 0.3, h * 0.28, w * 0.12, h * 0.08, -0.2, 0, TAU);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(w * 0.52, h * 0.2, w * 0.1, h * 0.05, 0.1, 0, TAU);
        ctx.fill();
        // rail lines
        const cities = [
          ["NEW YORK", 0.86, 0.78],
          ["ALBANY", 0.8, 0.5],
          ["SYRACUSE", 0.66, 0.42],
          ["ROCHESTER", 0.58, 0.38],
          ["BUFFALO", 0.5, 0.4],
          ["CLEVELAND", 0.4, 0.5],
          ["TOLEDO", 0.3, 0.52],
          ["DETROIT", 0.3, 0.42],
          ["CHICAGO", 0.12, 0.5],
          ["CINCINNATI", 0.3, 0.78],
          ["ST. LOUIS", 0.08, 0.82],
          ["BOSTON", 0.95, 0.4],
          ["PITTSBURGH", 0.52, 0.66],
        ];
        ctx.strokeStyle = "#1a1410";
        ctx.lineWidth = 5;
        const at = (n) => cities.find((c) => c[0] === n);
        const line = (list) => {
          ctx.beginPath();
          list.forEach((n, i) => {
            const c = at(n);
            if (i) ctx.lineTo(c[1] * w, c[2] * h);
            else ctx.moveTo(c[1] * w, c[2] * h);
          });
          ctx.stroke();
        };
        line([
          "NEW YORK",
          "ALBANY",
          "SYRACUSE",
          "ROCHESTER",
          "BUFFALO",
          "CLEVELAND",
          "TOLEDO",
          "CHICAGO",
        ]);
        ctx.lineWidth = 3;
        line(["ALBANY", "BOSTON"]);
        line(["TOLEDO", "DETROIT"]);
        line(["CLEVELAND", "CINCINNATI", "ST. LOUIS"]);
        line(["BUFFALO", "PITTSBURGH"]);
        ctx.fillStyle = "#9a1c14";
        ctx.font = "bold 15px " + P.FONTS.SANS;
        ctx.textAlign = "left";
        for (const c of cities) {
          ctx.beginPath();
          ctx.arc(c[1] * w, c[2] * h, 7, 0, TAU);
          ctx.fill();
          ctx.fillStyle = "#1a1410";
          ctx.fillText(c[0], c[1] * w + 10, c[2] * h - 8);
          ctx.fillStyle = "#9a1c14";
        }
        ctx.fillStyle = "#1a1410";
        ctx.font = "bold 42px " + P.FONTS.SERIF;
        ctx.textAlign = "center";
        ctx.fillText("NEW YORK CENTRAL SYSTEM", w * 0.42, 60);
        ctx.font = "italic 20px " + P.FONTS.SERIF;
        ctx.fillText('"The Water Level Route — You Can Sleep"', w * 0.42, 92);
        // Continuity grease-pencil annotations
        ctx.strokeStyle = "rgba(30,50,140,0.85)";
        ctx.lineWidth = 3;
        for (const c of [at("NEW YORK"), at("ALBANY"), at("CHICAGO")]) {
          ctx.beginPath();
          ctx.arc(c[1] * w, c[2] * h, 18, 0, TAU);
          ctx.stroke();
        }
        ctx.fillStyle = "rgba(30,50,140,0.9)";
        ctx.font = "bold 18px " + P.FONTS.SANS;
        ctx.fillText(
          "RELAY 7 — ACTIVE",
          at("NEW YORK")[1] * w - 60,
          at("NEW YORK")[2] * h + 40,
        );
        P.blotches(ctx, w, h, r, 40, 0.3);
        P.speckle(ctx, w, h, r, 2000);
      },
      { clamp: true },
    );
  };
