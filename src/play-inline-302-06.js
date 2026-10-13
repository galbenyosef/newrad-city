// play-inline-302 06 — ctx
// Lines 1207-1532 of readable/play-inline-302.pretty.js (statement-aligned).
  P.dialTex = function () {
    return P.canvasTex(
      "pe_dials",
      1024,
      512,
      (ctx, w, h) => {
        const r = P.rng("dials");
        const hours = {
          "NEW YORK": 9.78,
          LONDON: 14.78,
          MOSCOW: 17.78,
          TOKYO: 23.78,
          "SAN FRANCISCO": 6.78,
          BERLIN: 15.78,
        };
        for (let i = 0; i < 8; i++) {
          const cx = ((i % 4) + 0.5) * 256,
            cy = (Math.floor(i / 4) + 0.5) * 256,
            R = 104;
          ctx.fillStyle = "#1a1612";
          ctx.fillRect(cx - 128, cy - 128, 256, 256);
          const gb = ctx.createRadialGradient(
            cx - 20,
            cy - 20,
            10,
            cx,
            cy,
            R + 14,
          );
          gb.addColorStop(0, "#f0d890");
          gb.addColorStop(1, "#6a4a18");
          ctx.fillStyle = gb;
          ctx.beginPath();
          ctx.arc(cx, cy, R + 12, 0, TAU);
          ctx.fill();
          const face = ctx.createRadialGradient(cx, cy, 10, cx, cy, R);
          face.addColorStop(0, "#f2ead0");
          face.addColorStop(1, "#c8bc98");
          ctx.fillStyle = face;
          ctx.beginPath();
          ctx.arc(cx, cy, R, 0, TAU);
          ctx.fill();
          ctx.strokeStyle = "#2a2016";
          ctx.fillStyle = "#2a2016";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          const name = P.DIALS[i];
          if (i < 6) {
            for (let k = 0; k < 60; k++) {
              const a = (k / 60) * TAU;
              ctx.lineWidth = k % 5 ? 1.2 : 3;
              const L = k % 5 ? 6 : 12;
              ctx.beginPath();
              ctx.moveTo(
                cx + Math.sin(a) * (R - 4),
                cy - Math.cos(a) * (R - 4),
              );
              ctx.lineTo(
                cx + Math.sin(a) * (R - 4 - L),
                cy - Math.cos(a) * (R - 4 - L),
              );
              ctx.stroke();
            }
            ctx.font = "bold 20px " + SERIF;
            for (let k = 1; k <= 12; k++) {
              const a = (k / 12) * TAU;
              ctx.fillText(
                String(k),
                cx + Math.sin(a) * (R - 28),
                cy - Math.cos(a) * (R - 28),
              );
            }
            const hh = hours[name],
              mm = (hh % 1) * 60;
            const ha = ((hh % 12) / 12) * TAU,
              ma = (mm / 60) * TAU;
            ctx.lineCap = "round";
            ctx.lineWidth = 7;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(
              cx + Math.sin(ha) * R * 0.5,
              cy - Math.cos(ha) * R * 0.5,
            );
            ctx.stroke();
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(
              cx + Math.sin(ma) * R * 0.78,
              cy - Math.cos(ma) * R * 0.78,
            );
            ctx.stroke();
            ctx.font = "bold 13px " + SANS;
            ctx.fillText(name, cx, cy + R * 0.42);
          } else if (i === 6) {
            const lbl = ["STORMY", "RAIN", "CHANGE", "FAIR", "DRY", "V. DRY"];
            for (let k = 0; k < 41; k++) {
              const a = -2.3 + (k / 40) * 4.6;
              ctx.lineWidth = k % 5 ? 1 : 2.5;
              const L = k % 5 ? 6 : 12;
              ctx.beginPath();
              ctx.moveTo(
                cx + Math.sin(a) * (R - 4),
                cy - Math.cos(a) * (R - 4),
              );
              ctx.lineTo(
                cx + Math.sin(a) * (R - 4 - L),
                cy - Math.cos(a) * (R - 4 - L),
              );
              ctx.stroke();
            }
            ctx.font = "bold 12px " + SANS;
            lbl.forEach((t, k) => {
              const a = -2.1 + (k / 5) * 4.2;
              ctx.fillStyle = t === "STORMY" ? "#8a1a10" : "#2a2016";
              ctx.fillText(
                t,
                cx + Math.sin(a) * (R - 32),
                cy - Math.cos(a) * (R - 32),
              );
            });
            ctx.fillStyle = "#2a2016";
            ctx.font = "bold 14px " + SANS;
            ctx.fillText("BAROMETER", cx, cy + R * 0.45);
            ctx.strokeStyle = "#1a1a1a";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(
              cx + Math.sin(2.0) * R * 0.8,
              cy - Math.cos(2.0) * R * 0.8,
            );
            ctx.stroke();
            ctx.strokeStyle = "#a02010";
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(
              cx + Math.sin(-1.4) * R * 0.7,
              cy - Math.cos(-1.4) * R * 0.7,
            );
            ctx.stroke();
          } else {
            ctx.font = "bold 18px " + SERIF;
            ["N", "E", "S", "W"].forEach((t, k) => {
              const a = (k / 4) * TAU;
              ctx.fillText(
                t,
                cx + Math.sin(a) * (R - 22),
                cy - Math.cos(a) * (R - 22),
              );
            });
            for (let k = 0; k < 32; k++) {
              const a = (k / 32) * TAU;
              ctx.lineWidth = 1.5;
              ctx.beginPath();
              ctx.moveTo(
                cx + Math.sin(a) * (R - 4),
                cy - Math.cos(a) * (R - 4),
              );
              ctx.lineTo(
                cx + Math.sin(a) * (R - 12),
                cy - Math.cos(a) * (R - 12),
              );
              ctx.stroke();
            }
            ctx.fillStyle = "#8a1a10";
            ctx.beginPath();
            ctx.moveTo(cx + 40, cy - 60);
            ctx.lineTo(cx + 8, cy + 4);
            ctx.lineTo(cx - 8, cy - 4);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = "#2a2016";
            ctx.font = "bold 13px " + SANS;
            ctx.fillText("WIND DIRECTION", cx, cy + R * 0.45);
          }
          ctx.fillStyle = "#2a2016";
          ctx.beginPath();
          ctx.arc(cx, cy, 6, 0, TAU);
          ctx.fill();
          // cracked glass on two of them
          if (i === 2 || i === 5) {
            ctx.strokeStyle = "rgba(255,255,255,0.7)";
            ctx.lineWidth = 1.2;
            for (let k = 0; k < 7; k++) {
              ctx.beginPath();
              ctx.moveTo(cx - 30, cy - 20);
              let x = cx - 30,
                y = cy - 20;
              for (let s = 0; s < 4; s++) {
                x += (r() - 0.4) * 50;
                y += (r() - 0.4) * 50;
                ctx.lineTo(x, y);
              }
              ctx.stroke();
            }
          }
          P.blotches(ctx, 256, 256, r, 6, 0.2);
        }
        P.speckle(ctx, w, h, r, 1600, 0.25);
      },
      { clamp: true },
    );
  };
  /** uvRect for dial i of the 4×2 atlas. */
  P.dialRect = (i) => [
    (i % 4) / 4,
    1 - (Math.floor(i / 4) + 1) / 2,
    ((i % 4) + 1) / 4,
    1 - Math.floor(i / 4) / 2,
  ];

  // --- newspaper front pages atlas (2 × 2) -----------------------------
  const PAGES = [
    {
      mast: "THE FIRST JOURNAL",
      sub: "YOU HEARD IT HERE FIRST · MARCH 5, 1967 · FINAL",
      head: ["WAR!", "BOMBS FALLING"],
      dek: "Sirens across the five boroughs — planes reported over the Atlantic",
      bg: "#e2d8bc",
    },
    {
      mast: "THE FIRST JOURNAL",
      sub: "NEW YORK · MARCH 1967 · 5¢",
      head: ["PARIS", "RECALLS ENVOY"],
      dek: '"Bureau Sept" spy ring exposed in Washington; President urges calm',
      bg: "#dcd2b4",
    },
    {
      mast: "THE DAILY RUIN",
      sub: "THE VOICE OF 42ND STREET · PRINTED ON THE OLD PRESSES · 1 SCRIP",
      head: ["RAIDERS HOLD", "TUDOR CITY"],
      dek: 'Self-styled "Court" demands tribute from the Market',
      bg: "#cfc6a8",
    },
    {
      mast: "THE DAILY RUIN",
      sub: "THE VOICE OF 42ND STREET · 1 SCRIP",
      head: ["BEAR IN THE", "GOLDEN TOWER"],
      dek: 'Scavengers flee Madison Square: "It was wearing a crown of gold"',
      bg: "#d4caa8",
    },
  ];
  P.pagesTex = function () {
    return P.canvasTex(
      "pe_pages",
      1024,
      1024,
      (ctx, w, h) => {
        const r = P.rng("pages");
        for (let i = 0; i < 4; i++) {
          const pg = PAGES[i],
            x0 = (i % 2) * 512,
            y0 = Math.floor(i / 2) * 512;
          ctx.fillStyle = pg.bg;
          ctx.fillRect(x0, y0, 512, 512);
          ctx.fillStyle = "#1c1812";
          ctx.textAlign = "center";
          ctx.textBaseline = "alphabetic";
          ctx.font = "bold 60px " + (i < 2 ? SANS : SERIF);
          ctx.fillText(pg.mast, x0 + 256, y0 + 70, 480);
          ctx.fillRect(x0 + 16, y0 + 84, 480, 3);
          ctx.font = "13px " + SERIF;
          ctx.fillText(pg.sub, x0 + 256, y0 + 102);
          ctx.fillRect(x0 + 16, y0 + 110, 480, 2);
          ctx.font = 'bold 88px Impact, "Arial Black", ' + SANS;
          pg.head.forEach((t, k) => {
            let fs = 88;
            ctx.font = "bold " + fs + 'px Impact, "Arial Black", ' + SANS;
            while (ctx.measureText(t).width > 480 && fs > 30) {
              fs -= 4;
              ctx.font = "bold " + fs + 'px Impact, "Arial Black", ' + SANS;
            }
            ctx.fillText(t, x0 + 256, y0 + 200 + k * 88);
          });
          ctx.font = "italic 18px " + SERIF;
          ctx.fillText(pg.dek, x0 + 256, y0 + 312);
          // photo block + columns
          ctx.fillStyle = "rgba(40,36,28,0.75)";
          ctx.fillRect(x0 + 20, y0 + 330, 230, 160);
          ctx.fillStyle = "rgba(200,190,160,0.25)";
          if (i === 0) {
            ctx.beginPath();
            ctx.arc(x0 + 135, y0 + 440, 60, PI, TAU);
            ctx.fill();
            ctx.fillRect(x0 + 125, y0 + 380, 20, 60);
          } else if (i === 3) {
            ctx.beginPath();
            ctx.moveTo(x0 + 80, y0 + 480);
            ctx.lineTo(x0 + 135, y0 + 350);
            ctx.lineTo(x0 + 190, y0 + 480);
            ctx.fill();
          } else {
            for (let k = 0; k < 6; k++)
              ctx.fillRect(x0 + 40 + k * 34, y0 + 480 - 40 - r() * 80, 22, 200);
          }
          ctx.fillStyle = "rgba(30,26,20,0.7)";
          for (let c = 0; c < 2; c++)
            for (let y = y0 + 334; y < y0 + 496; y += 7)
              ctx.fillRect(x0 + 262 + c * 118, y, 106 * (0.6 + r() * 0.4), 3);
          P.blotches(ctx, 512, 512, r, 0, 0);
          for (let k = 0; k < 18; k++) {
            const bx = x0 + r() * 512,
              by = y0 + r() * 512,
              rr = 10 + r() * 60;
            const gr = ctx.createRadialGradient(bx, by, 0, bx, by, rr);
            gr.addColorStop(0, "rgba(120,90,40," + (0.05 + r() * 0.2) + ")");
            gr.addColorStop(1, "rgba(0,0,0,0)");
            ctx.fillStyle = gr;
            ctx.fillRect(bx - rr, by - rr, rr * 2, rr * 2);
          }
        }
        P.speckle(ctx, w, h, r, 3000, 0.2);
      },
      { clamp: true },
    );
  };
  P.pageRect = (i) => [
    (i % 2) / 2,
    1 - (Math.floor(i / 2) + 1) / 2,
    ((i % 2) + 1) / 2,
    1 - Math.floor(i / 2) / 2,
  ];

  // --- the carved entrance relief (sunburst over the tower, the crowd) ---
