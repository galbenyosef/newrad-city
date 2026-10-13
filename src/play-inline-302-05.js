// play-inline-302 05 — ctx
// Lines 865-1206 of readable/play-inline-302.pretty.js (statement-aligned).
  function globeTex() {
    return P.canvasTex("pe_globe", 1024, 512, (ctx, w, h) => {
      const r = P.rng("globe");
      const X = (lon) => ((lon + 180) / 360) * w,
        Y = (lat) => ((90 - lat) / 180) * h;
      // ocean: aged teal with depth mottling
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "#6f8f8a");
      g.addColorStop(0.5, "#3e6a72");
      g.addColorStop(1, "#6f8f8a");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      P.blotches(ctx, w, h, r, 60, 0.18);
      // coastlines + land
      for (const k in LANDS) {
        const poly = LANDS[k];
        if (!poly) continue;
        ctx.beginPath();
        poly.forEach((p, i) =>
          i ? ctx.lineTo(X(p[0]), Y(p[1])) : ctx.moveTo(X(p[0]), Y(p[1])),
        );
        ctx.closePath();
        // coastal wash
        ctx.strokeStyle = "rgba(160,200,190,0.5)";
        ctx.lineWidth = 7;
        ctx.stroke();
        ctx.fillStyle = k === "greenland" ? "#e8e4d4" : "#d8c898";
        ctx.fill();
        ctx.strokeStyle = "#5a4020";
        ctx.lineWidth = 1.6;
        ctx.stroke();
      }
      // political tint patches (a 1930 map loves pink empires)
      const tint = (lon, lat, rr, c) => {
        const gr = ctx.createRadialGradient(
          X(lon),
          Y(lat),
          0,
          X(lon),
          Y(lat),
          rr,
        );
        gr.addColorStop(0, c);
        gr.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = gr;
        ctx.fillRect(X(lon) - rr, Y(lat) - rr, rr * 2, rr * 2);
      };
      ctx.save();
      ctx.globalCompositeOperation = "multiply";
      tint(-100, 45, 60, "rgba(210,150,120,0.6)");
      tint(95, 60, 110, "rgba(200,120,110,0.55)");
      tint(20, 5, 50, "rgba(200,190,120,0.6)");
      tint(-60, -15, 55, "rgba(160,190,130,0.6)");
      tint(134, -25, 45, "rgba(220,160,170,0.65)");
      tint(105, 32, 50, "rgba(230,200,120,0.6)");
      tint(78, 22, 30, "rgba(220,160,170,0.65)");
      ctx.restore();
      // polar ice
      ctx.fillStyle = "rgba(236,236,226,0.95)";
      ctx.fillRect(0, Y(-68), w, h - Y(-68));
      for (let x = 0; x < w; x += 8) ctx.fillRect(x, Y(-68) - r() * 8, 8, 10);
      // graticule
      ctx.strokeStyle = "rgba(60,40,20,0.45)";
      ctx.lineWidth = 1;
      for (let lon = -180; lon <= 180; lon += 15) {
        ctx.beginPath();
        ctx.moveTo(X(lon), 0);
        ctx.lineTo(X(lon), h);
        ctx.stroke();
      }
      for (let lat = -75; lat <= 75; lat += 15) {
        ctx.beginPath();
        ctx.moveTo(0, Y(lat));
        ctx.lineTo(w, Y(lat));
        ctx.stroke();
      }
      ctx.strokeStyle = "rgba(150,40,20,0.7)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, Y(0));
      ctx.lineTo(w, Y(0));
      ctx.stroke();
      ctx.setLineDash([6, 5]);
      ctx.beginPath();
      ctx.moveTo(0, Y(23.4));
      ctx.lineTo(w, Y(23.4));
      ctx.moveTo(0, Y(-23.4));
      ctx.lineTo(w, Y(-23.4));
      ctx.stroke();
      ctx.setLineDash([]);
      // labels
      ctx.fillStyle = "rgba(40,28,14,0.85)";
      ctx.textAlign = "center";
      const lab = (t, lon, lat, s, it) => {
        ctx.font = (it ? "italic " : "bold ") + s + "px " + SERIF;
        ctx.fillText(t, X(lon), Y(lat));
      };
      lab("UNITED STATES", -100, 40, 13);
      lab("CANADA", -105, 58, 13);
      lab("BRAZIL", -55, -10, 12);
      lab("AFRICA", 20, 8, 15);
      lab("SOVIET UNION", 90, 62, 15);
      lab("CHINA", 103, 34, 14);
      lab("AUSTRALIA", 134, -26, 12);
      lab("EUROPE", 15, 50, 10);
      lab("ATLANTIC OCEAN", -38, 28, 13, true);
      lab("PACIFIC OCEAN", -140, 10, 15, true);
      lab("PACIFIC OCEAN", 160, 12, 12, true);
      lab("INDIAN OCEAN", 80, -25, 13, true);
      lab("ARCTIC OCEAN", 0, 80, 11, true);
      // New York star + the First Journal cartouche
      ctx.fillStyle = "#a0201a";
      ctx.beginPath();
      ctx.arc(X(-74), Y(40.7), 4, 0, TAU);
      ctx.fill();
      ctx.font = "bold 10px " + SANS;
      ctx.fillText("NEW YORK", X(-74) + 22, Y(40.7) - 6);
      // post-Bombing scars: burn rings over the capitals
      ctx.save();
      ctx.globalCompositeOperation = "multiply";
      for (const c of [
        [-77, 38.9],
        [37.6, 55.7],
        [116, 40],
        [-122.4, 37.7],
        [-87.6, 41.8],
        [-0.1, 51.5],
        [139.7, 35.7],
      ]) {
        const gr = ctx.createRadialGradient(
          X(c[0]),
          Y(c[1]),
          0,
          X(c[0]),
          Y(c[1]),
          16,
        );
        gr.addColorStop(0, "rgba(30,20,10,0.8)");
        gr.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = gr;
        ctx.fillRect(X(c[0]) - 16, Y(c[1]) - 16, 32, 32);
      }
      ctx.restore();
      P.speckle(ctx, w, h, r, 2500, 0.25, 0.1);
      // varnish yellowing
      ctx.fillStyle = "rgba(200,170,90,0.12)";
      ctx.fillRect(0, 0, w, h);
    });
  }
  P.globeTex = globeTex;
  P.globeMat = () =>
    P.texMat("pe_globe", globeTex(), { rough: 0.45, metal: 0.05, vc: true });

  // --- compass-rose lobby floor --------------------------------------
  P.compassMat = () =>
    P.texMat(
      "pe_compass",
      P.canvasTex(
        "pe_compass",
        1024,
        1024,
        (ctx, w, h) => {
          const r = P.rng("compass");
          const cx = w / 2,
            cy = h / 2,
            R = w * 0.49;
          // black terrazzo field with brass chips
          ctx.fillStyle = "#141614";
          ctx.fillRect(0, 0, w, h);
          for (let i = 0; i < 9000; i++) {
            const k = r();
            ctx.fillStyle =
              k < 0.6
                ? "rgba(90,90,84,0.5)"
                : k < 0.9
                  ? "rgba(200,190,170,0.35)"
                  : "rgba(200,150,60,0.5)";
            ctx.fillRect(r() * w, r() * h, 1 + r() * 2.5, 1 + r() * 2.5);
          }
          // outer bronze ring with degree ticks
          ctx.strokeStyle = "#b8883a";
          ctx.lineWidth = 10;
          ctx.beginPath();
          ctx.arc(cx, cy, R - 6, 0, TAU);
          ctx.stroke();
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(cx, cy, R - 60, 0, TAU);
          ctx.stroke();
          for (let d = 0; d < 360; d += 5) {
            const a = (d / 180) * PI - PI / 2,
              L = d % 45 === 0 ? 34 : d % 15 === 0 ? 22 : 12;
            ctx.lineWidth = d % 45 === 0 ? 4 : 2;
            ctx.beginPath();
            ctx.moveTo(
              cx + Math.cos(a) * (R - 12),
              cy + Math.sin(a) * (R - 12),
            );
            ctx.lineTo(
              cx + Math.cos(a) * (R - 12 - L),
              cy + Math.sin(a) * (R - 12 - L),
            );
            ctx.stroke();
          }
          // ring inscription
          ctx.fillStyle = "#d8b060";
          ctx.font = "bold 22px " + SANS;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          const ring =
            "THE FIRST JOURNAL · WORLD WEATHER STATION · NEW YORK · EST. 1930 · ";
          for (let i = 0; i < ring.length * 2; i++) {
            const ch = (ring + ring)[i],
              a = (i / (ring.length * 2)) * TAU - PI / 2;
            ctx.save();
            ctx.translate(
              cx + Math.cos(a) * (R - 82),
              cy + Math.sin(a) * (R - 82),
            );
            ctx.rotate(a + PI / 2);
            ctx.fillText(ch, 0, 0);
            ctx.restore();
          }
          // 32-point rose
          const pt = (a, len, wid, c1, c2) => {
            const ax = Math.cos(a),
              ay = Math.sin(a),
              px = -ay,
              py = ax;
            ctx.fillStyle = c1;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + px * wid, cy + py * wid);
            ctx.lineTo(cx + ax * len, cy + ay * len);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = c2;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx - px * wid, cy - py * wid);
            ctx.lineTo(cx + ax * len, cy + ay * len);
            ctx.closePath();
            ctx.fill();
          };
          for (let i = 0; i < 32; i++) {
            const a = (i / 32) * TAU - PI / 2;
            if (i % 2) pt(a, R * 0.42, 14, "#6a5030", "#3a2a18");
          }
          for (let i = 0; i < 16; i++) {
            const a = (i / 16) * TAU - PI / 2;
            if (i % 2) pt(a, R * 0.55, 24, "#c8a868", "#8a6a38");
          }
          for (let i = 0; i < 8; i++) {
            const a = (i / 8) * TAU - PI / 2;
            pt(
              a,
              i % 2 ? R * 0.62 : R * 0.8,
              i % 2 ? 34 : 46,
              "#e8d8b0",
              "#b89048",
            );
          }
          ctx.fillStyle = "#b8883a";
          ctx.beginPath();
          ctx.arc(cx, cy, 30, 0, TAU);
          ctx.fill();
          ctx.font = "bold 60px " + SERIF;
          for (const [t, dx, dy] of [
            ["N", 0, -1],
            ["S", 0, 1],
            ["E", 1, 0],
            ["W", -1, 0],
          ]) {
            const lx = cx + dx * (R - 118),
              ly = cy + dy * (R - 118);
            ctx.fillStyle = "#141614";
            ctx.beginPath();
            ctx.arc(lx, ly, 40, 0, TAU);
            ctx.fill();
            ctx.strokeStyle = "#b8883a";
            ctx.lineWidth = 4;
            ctx.stroke();
            ctx.fillStyle = "#e8d8a8";
            ctx.fillText(t, lx, ly + 3);
          }
          P.blotches(ctx, w, h, r, 50, 0.2);
          P.speckle(ctx, w, h, r, 1500, 0.3);
        },
        { clamp: true },
      ),
      { rough: 0.5, metal: 0.1, vc: true },
    );

  // --- radiating floor line plaques: "LONDON 3,469 MILES" etc. -------
  P.distanceTex = function () {
    return P.canvasTex(
      "pe_distances",
      1024,
      512,
      (ctx, w, h) => {
        const r = P.rng("dist");
        ctx.fillStyle = "#141614";
        ctx.fillRect(0, 0, w, h);
        const cities = [
          "LONDON 3,469 MI",
          "MOSCOW 4,662 MI",
          "TOKYO 6,740 MI",
          "PEKING 6,825 MI",
          "PARIS 3,625 MI",
          "RIO 4,817 MI",
          "CAIRO 5,602 MI",
          "BERLIN 3,980 MI",
        ];
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        for (let i = 0; i < 8; i++) {
          const y = ((i + 0.5) * h) / 8;
          ctx.fillStyle = "#b8883a";
          ctx.fillRect(0, y - 3, w, 6);
          ctx.fillStyle = "#141614";
          ctx.fillRect(w * 0.5 - 170, y - 22, 340, 44);
          ctx.fillStyle = "#d8b060";
          ctx.font = "bold 30px " + SANS;
          ctx.fillText(cities[i], w * 0.5, y + 1);
        }
        P.speckle(ctx, w, h, r, 1500, 0.3);
      },
      { clamp: true },
    );
  };

  // --- clock & weather-instrument dial atlas (4 × 2 cells) ------------
  P.DIALS = [
    "NEW YORK",
    "LONDON",
    "MOSCOW",
    "TOKYO",
    "SAN FRANCISCO",
    "BERLIN",
    "BAROMETER",
    "WIND",
  ];
