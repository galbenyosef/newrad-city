// play-inline-221 02 — ctx
// Lines 31-336 of readable/play-inline-221.pretty.js (statement-aligned).
  const PH = G._pharbor;
  const TAU = Math.PI * 2,
    HP = Math.PI / 2;

  // =====================================================================
  // TEXTURES
  // =====================================================================
  // One 1024×512 atlas of 4×8 label cells (256×64 each).
  const LABELS = [
    ["3-110-0-E", "id"],
    ["4-72-0-E", "id"],
    ["4-58-0-E", "id"],
    ["4-40-0-M", "id"],
    ["2-110-0-L", "id"],
    ["2-52-0-L", "id"],
    ["2-36-0-L", "id"],
    ["1-120-0-L", "id"],
    ["1-80-0-L", "id"],
    ["1-40-0-L", "id"],
    ["01-50-0-C", "id"],
    ["04-44-0-C", "id"],
    ["FIRE STATION", "red"],
    ["DAMAGE CONTROL", "red"],
    ["BATTLE DRESSING STA.", "red"],
    ["SOUND PWR PHONE JV", "id"],
    ["STEAM  ▶", "pipe"],
    ["FIRE MAIN  ▶", "piper"],
    ["FUEL OIL  ▶", "pipe"],
    ["POTABLE WATER  ▶", "pipeb"],
    ["Ⓩ  ZEBRA", "zebra"],
    ["KEEP CLOSED", "id"],
    ["NO SMOKING", "red"],
    ["CAUTION: HIGH VOLTAGE", "pipe"],
    ["KEGS WAS HERE", "graf"],
    ["HATCH 4 EVER", "grafw"],
    ["NO QUARTER", "graf"],
    ["ELLIS IS SOFT", "grafw"],
    ["TOLL OR ROLL", "graf"],
    ["SHARKS BELOW", "grafw"],
    ["☠ MINE ☠", "graf"],
    ["DON'T NAP HERE", "grafw"],
  ];
  const LI = {};
  LABELS.forEach(([t], i) => {
    LI[t] = i;
  });
  function labelAtlas() {
    return PH.canvasTex(
      "ph_hudson_labels",
      1024,
      512,
      (ctx) => {
        ctx.clearRect(0, 0, 1024, 512);
        const r = PH.rng("hlabels");
        LABELS.forEach(([t, st], i) => {
          ctx.save();
          ctx.translate((i % 4) * 256, ((i / 4) | 0) * 64);
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          if (st === "graf" || st === "grafw") {
            ctx.translate(128, 32);
            ctx.rotate((r() - 0.5) * 0.12);
            ctx.font = 'bold 40px Impact, "Arial Black", sans-serif';
            const col = st === "graf" ? "#c42a18" : "#e6ddc6";
            const mw = ctx.measureText(t).width,
              sx = Math.min(1, 232 / mw);
            ctx.scale(sx, 1);
            ctx.fillStyle = col;
            ctx.fillText(t, 0, 0);
            for (let k = 0; k < 7; k++)
              ctx.fillRect((r() - 0.5) * mw * 0.9, 8, 3, 6 + r() * 16); // paint drips
          } else {
            const bg = {
              id: "#e4dcc4",
              red: "#a82418",
              pipe: "#d8b020",
              piper: "#b8261a",
              pipeb: "#2a5a9a",
              zebra: "#e4dcc4",
            }[st];
            const fg = {
              id: "#141414",
              red: "#f2eee0",
              pipe: "#141414",
              piper: "#f2eee0",
              pipeb: "#f2eee0",
              zebra: "#141414",
            }[st];
            ctx.fillStyle = bg;
            ctx.fillRect(4, 6, 248, 52);
            ctx.strokeStyle = fg;
            ctx.lineWidth = 3;
            ctx.strokeRect(9, 11, 238, 42);
            let fs = 30;
            ctx.font = "bold " + fs + 'px "Arial Black", Impact, sans-serif';
            const mw = ctx.measureText(t).width;
            if (mw > 220) {
              fs = Math.floor((fs * 220) / mw);
              ctx.font = "bold " + fs + 'px "Arial Black", Impact, sans-serif';
            }
            ctx.fillStyle = fg;
            ctx.fillText(t, 128, 33);
            // weathering: paint chips & rust bleed
            for (let k = 0; k < 26; k++) {
              ctx.fillStyle =
                "rgba(" +
                ((90 + r() * 50) | 0) +
                "," +
                ((50 + r() * 20) | 0) +
                ",24," +
                (0.25 + r() * 0.45) +
                ")";
              ctx.fillRect(
                4 + r() * 246,
                6 + r() * 50,
                1 + r() * 4,
                1 + r() * 7,
              );
            }
            ctx.fillStyle = "rgba(40,30,20,0.18)";
            ctx.fillRect(4, 40 + r() * 10, 248, 18);
          }
          ctx.restore();
        });
      },
      { clamp: true },
    );
  }
  /** PPI radar scope face: range rings, bearing ticks, land clutter, a phosphor sweep and afterglow blips. */
  function ppiTex() {
    return PH.canvasTex("ph_hudson_ppi", 256, 256, (ctx, w, h) => {
      const cx = w / 2,
        cy = h / 2,
        R = w * 0.47,
        r = PH.rng("ppi");
      ctx.fillStyle = "#050805";
      ctx.fillRect(0, 0, w, h);
      const g = ctx.createRadialGradient(cx, cy, 4, cx, cy, R);
      g.addColorStop(0, "#0e2a14");
      g.addColorStop(1, "#06140a");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, TAU);
      ctx.fill();
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, TAU);
      ctx.clip();
      // land returns (Manhattan / Brooklyn / the islands)
      for (let i = 0; i < 260; i++) {
        const a = -2.2 + r() * 1.9,
          d = R * (0.35 + r() * 0.7);
        ctx.fillStyle = "rgba(90,255,120," + (0.08 + r() * 0.22) + ")";
        ctx.fillRect(
          cx + Math.cos(a) * d,
          cy + Math.sin(a) * d,
          1 + r() * 3,
          1 + r() * 3,
        );
      }
      // sweep with phosphor afterglow (60° trailing wedge)
      const a0 = -0.6;
      for (let k = 0; k < 60; k++) {
        const a = a0 - k * 0.018;
        ctx.strokeStyle =
          "rgba(110,255,140," + 0.5 * Math.pow(1 - k / 60, 2) + ")";
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R);
        ctx.stroke();
      }
      ctx.strokeStyle = "rgba(200,255,210,0.95)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(a0) * R, cy + Math.sin(a0) * R);
      ctx.stroke();
      // contacts
      for (const [a, d] of [
        [0.6, 0.55],
        [2.4, 0.3],
        [-1.1, 0.72],
        [1.7, 0.8],
        [3.4, 0.45],
      ]) {
        const x = cx + Math.cos(a) * R * d,
          y = cy + Math.sin(a) * R * d;
        const gg = ctx.createRadialGradient(x, y, 0, x, y, 7);
        gg.addColorStop(0, "rgba(210,255,215,1)");
        gg.addColorStop(1, "rgba(90,255,120,0)");
        ctx.fillStyle = gg;
        ctx.fillRect(x - 8, y - 8, 16, 16);
      }
      ctx.restore();
      // range rings & bearing ticks
      ctx.strokeStyle = "rgba(90,255,120,0.35)";
      ctx.lineWidth = 1;
      for (let k = 1; k <= 4; k++) {
        ctx.beginPath();
        ctx.arc(cx, cy, (R * k) / 4, 0, TAU);
        ctx.stroke();
      }
      for (let k = 0; k < 36; k++) {
        const a = (k / 36) * TAU,
          l = k % 9 === 0 ? 12 : 6;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R);
        ctx.lineTo(cx + Math.cos(a) * (R - l), cy + Math.sin(a) * (R - l));
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(cx - R, cy);
      ctx.lineTo(cx + R, cy);
      ctx.moveTo(cx, cy - R);
      ctx.lineTo(cx, cy + R);
      ctx.stroke();
    });
  }
  /** Two edge-lit plexiglass boards side by side: surface status plot | the Commodore's bounty board. */
  function boardsTex() {
    return PH.canvasTex(
      "ph_hudson_boards",
      1024,
      256,
      (ctx) => {
        const r = PH.rng("boards");
        const board = (x0, title, rows, foot) => {
          const g = ctx.createLinearGradient(x0, 0, x0 + 512, 256);
          g.addColorStop(0, "#0d1a1a");
          g.addColorStop(1, "#0a1414");
          ctx.fillStyle = g;
          ctx.fillRect(x0, 0, 512, 256);
          ctx.strokeStyle = "rgba(190,230,210,0.16)";
          ctx.lineWidth = 1;
          for (let y = 44; y < 240; y += 26) {
            ctx.beginPath();
            ctx.moveTo(x0 + 8, y);
            ctx.lineTo(x0 + 504, y);
            ctx.stroke();
          }
          ctx.fillStyle = "#e8f0e4";
          ctx.font = 'bold 22px "Arial Black", Impact, sans-serif';
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(title, x0 + 256, 22);
          ctx.textAlign = "left";
          ctx.font = 'bold 17px "Comic Sans MS", "Segoe Print", cursive';
          rows.forEach((row, i) => {
            ctx.fillStyle = row[1] || "#ffd23a";
            ctx.fillText(row[0], x0 + 14, 58 + i * 26);
          });
          if (foot) {
            ctx.fillStyle = "#ff7a3a";
            ctx.fillText(foot, x0 + 14, 236);
          }
          // grease smears
          for (let k = 0; k < 20; k++) {
            ctx.fillStyle = "rgba(255,220,120," + (0.03 + r() * 0.05) + ")";
            ctx.beginPath();
            ctx.ellipse(
              x0 + r() * 512,
              r() * 256,
              10 + r() * 40,
              4 + r() * 12,
              r() * 3,
              0,
              TAU,
            );
            ctx.fill();
          }
          ctx.strokeStyle = "rgba(160,200,190,0.5)";
          ctx.lineWidth = 6;
          ctx.strokeRect(x0 + 3, 3, 506, 250);
        };
        board(
          0,
          "SURFACE STATUS",
          [
            ["TRK  BRG  RNG   ID"],
            ["A    245  3.2   SKIFF (ELLIS) - TAKE IT"],
            ["B    180  5.8   LIBERTY - ROBOTS. AVOID", "#ff9a5a"],
            ["C    310  1.1   SHELLBACKS?? (KEGS SAYS)"],
            ["D    015  0.4   COAL BARGE - OURS NOW"],
            ["E    200  2.6   BATTERY TOLL BOAT"],
          ],
          "SKIFFS TAKEN: |||| |||| ||",
        );
        board(
          512,
          "COMMODORE'S BOUNTY BOARD",
          [
            ["REGISTRAR VELL ........ 500 SCRIP"],
            ["DOC TRAN (ALIVE!) ..... 300"],
            ['"PUMPS" OKAFOR ........ 50'],
            ["SWEET TOOTH ........... DON'T", "#ff9a5a"],
            ["THE ICEBOX KID ........ ???", "#ff9a5a"],
            ["BOSUN KEGS (OWES ME) .. 20"],
          ],
          "PAYABLE IN SCRIP, RUM, OR TEETH",
        );
      },
      { clamp: true },
    );
  }
  /** Dead-reckoning tracer chart: grid paper under glass, pencil tracks with time ticks, grease-pencil circles. */
