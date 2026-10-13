// play-inline-231 02 — fillstyle
// Lines 34-262 of readable/play-inline-231.pretty.js (statement-aligned).
  const LI = G._li,
    A = LI.arch,
    F = LI.furn,
    Q = LI.q,
    TAU = Math.PI * 2;
  const KEY = "nyse_floor";

  function art() {
    const T = {};
    const QUOTES = [
      ["SCRIP", "+", "0.02"],
      ["RALLY TONIC", "-", "4.50"],
      ["RUSH", "+", "12.00"],
      ["H2O", "+", "9.75"],
      ["OXEN", "-", "1.10"],
      ["LONG WINTER", "-", "0.00"],
      ["FIZZO", "+", "3.33"],
      ["PRUSSIAN BLUE", "+", "7.40"],
      ["MORTAR", "-", "88.00"],
      ["PIT: BRUNO", "+", "6 TO 1"],
      ["PIT: YOU", "-", "40 TO 1"],
      ["GOLD", "+", "SHINY"],
    ];
    T.ticker = LI.texMat(
      "nyse_ticker",
      LI.canvasTex("nyse_ticker", 2048, 64, (x, W, H) => {
        x.fillStyle = "#040604";
        x.fillRect(0, 0, W, H);
        x.font = 'bold 36px "Courier New", monospace';
        x.textBaseline = "middle";
        let px = 10;
        for (let rep = 0; px < W - 50; rep++)
          for (const q of QUOTES) {
            if (px > W - 60) break;
            x.fillStyle = "#e8c860";
            x.fillText(q[0], px, H / 2);
            px += x.measureText(q[0] + " ").width;
            x.fillStyle = q[1] === "+" ? "#50ff70" : "#ff5040";
            x.fillText((q[1] === "+" ? "▲" : "▼") + q[2], px, H / 2);
            px += x.measureText("▲" + q[2] + "     ").width;
          }
        for (let i = 0; i < W; i += 4) {
          x.fillStyle = "rgba(0,0,0,0.35)";
          x.fillRect(i, 0, 1, H);
        }
      }),
      { emissive: 1.5, rough: 0.6 },
    );
    T.board = LI.texMat(
      "nyse_board",
      LI.canvasTex("nyse_board", 1024, 512, (x, W, H) => {
        x.fillStyle = "#10140e";
        x.fillRect(0, 0, W, H);
        x.font = 'bold 30px "Courier New", monospace';
        const r = LI.rng(8);
        for (let row = 0; row < 12; row++)
          for (let col = 0; col < 4; col++) {
            const sym = [
              "FZO",
              "OCD",
              "TTY",
              "GEN",
              "HAL",
              "SFG",
              "DSM",
              "SCB",
              "WST",
              "MIL",
              "OXN",
              "SCR",
            ][(row + col * 5) % 12];
            const up = r() < 0.2;
            x.fillStyle = "#d8c060";
            x.fillText(sym, 20 + col * 250, 40 + row * 38);
            x.fillStyle = up ? "#50ff70" : "#ff5040";
            x.fillText(
              (up ? "▲" : "▼") + (r() * 90).toFixed(2),
              100 + col * 250,
              40 + row * 38,
            );
          }
        x.fillStyle = "#ff3a20";
        x.font = 'bold 44px "Courier New", monospace';
        x.fillText("TRADING HALTED 09:31", 260, 500);
        LI.wear(x, W, H, 5, 0.5);
      }),
      { emissive: 0.9, rough: 0.6 },
    );
    T.window = LI.texMat(
      "nyse_street",
      LI.canvasTex(
        "nyse_street",
        1024,
        1024,
        (x, W, H) => {
          const g = x.createLinearGradient(0, 0, 0, H);
          g.addColorStop(0, "#8a9a70");
          g.addColorStop(0.6, "#c8c090");
          g.addColorStop(1, "#6a6450");
          x.fillStyle = g;
          x.fillRect(0, 0, W, H);
          x.fillStyle = "rgba(120,112,92,0.95)";
          x.fillRect(0, H * 0.05, W * 0.45, H);
          x.fillRect(W * 0.55, H * 0.15, W * 0.45, H);
          x.fillStyle = "rgba(60,56,46,0.8)";
          for (let r = 0; r < 20; r++)
            for (let c = 0; c < 6; c++) {
              x.fillRect(20 + c * 72, H * 0.08 + r * 46, 36, 26);
              x.fillRect(W * 0.58 + c * 70, H * 0.18 + r * 42, 34, 24);
            }
          x.fillStyle = "rgba(40,40,34,0.9)";
          x.fillRect(0, H * 0.88, W, H * 0.12);
          LI.wear(x, W, H, 14, 0.5);
        },
        { clamp: true },
      ),
      { emissive: 0.8, rough: 1 },
    );
    T.sunburst = LI.texMat(
      "nyse_sunburst",
      LI.canvasTex(
        "nyse_sunburst",
        1024,
        1024,
        (x, W, H) => {
          x.fillStyle = "#3a2410";
          x.fillRect(0, 0, W, H);
          const cx = W / 2,
            cy = H / 2;
          for (let i = 0; i < 64; i++) {
            const a0 = (i / 64) * TAU,
              a1 = a0 + TAU / 128;
            x.fillStyle = i % 2 ? "#d8a848" : "#8a6424";
            x.beginPath();
            x.moveTo(cx, cy);
            x.arc(cx, cy, 720, a0, a1);
            x.fill();
          }
          for (let k = 0; k < 5; k++) {
            x.strokeStyle = "#f0d078";
            x.lineWidth = 8;
            x.beginPath();
            x.arc(cx, cy, 80 + k * 90, 0, TAU);
            x.stroke();
          }
          x.fillStyle = "#f0d078";
          x.beginPath();
          x.arc(cx, cy, 70, 0, TAU);
          x.fill();
          LI.wear(x, W, H, 17, 0.6);
        },
        { clamp: true },
      ),
      { metal: 0.5, rough: 0.4 },
    );
    T.odds = LI.texMat(
      "nyse_odds",
      LI.canvasTex(
        "nyse_odds",
        512,
        384,
        (x, W, H) => {
          x.fillStyle = "#1e2a22";
          x.fillRect(0, 0, W, H);
          x.fillStyle = "#e8e4d8";
          x.font = 'bold 34px "Special Elite", "Courier New", monospace';
          x.textAlign = "center";
          x.fillText("THE PIT — TONITE", W / 2, 44);
          x.font = '24px "Courier New", monospace';
          x.textAlign = "left";
          const lines = [
            "BRUNO vs MANIAC (x2) ..... 1:6",
            "BRUNO vs CONVOY GUARD ... 1:9",
            'BRUNO vs "DOC" ~~~~~~~~ SCRATCHED',
            "BRUNO vs BURROW RAT (x5) . 1:3",
            "NEXT: ??? vs BRUNO ...... 40:1",
            "",
            "BETS CLOSE AT THE BELL",
            "NO CREDIT. NO REFUNDS. NO CRYING.",
          ];
          lines.forEach((l, i) => x.fillText(l, 22, 96 + i * 34));
          x.strokeStyle = "#e8e4d8";
          x.lineWidth = 3;
          x.beginPath();
          x.moveTo(20, 164);
          x.lineTo(490, 150);
          x.stroke();
          LI.wear(x, W, H, 6, 0.7);
        },
        { clamp: true },
      ),
      { rough: 0.95 },
    );
    T.portraits = LI.texMat(
      "nyse_portraits",
      LI.canvasTex(
        "nyse_portraits",
        1024,
        512,
        (x, W, H) => {
          for (let i = 0; i < 4; i++)
            LI.portrait(x, i * 256, 0, 256, 512, 20 + i * 3);
        },
        { clamp: true },
      ),
      { rough: 0.8 },
    );
    T.sign = (id, lines, st, w, h) =>
      LI.texMat("nyse_sign_" + id, LI.signTex("nyse_" + id, lines, st, w, h), {
        rough: 0.8,
      });
    T.blood = (() => {
      try {
        if (!G.isStub("tex") && G.tex.decal) {
          const t = G.tex.decal("blood_pool");
          if (t)
            return LI.texMat("nyse_blood", t, {
              transparent: true,
              rough: 0.3,
            });
        }
      } catch (e) {
        /* */
      }
      return null;
    })();
    return T;
  }

