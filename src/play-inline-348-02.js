// play-inline-348 02 — cell
// Lines 23-170 of readable/play-inline-348.pretty.js (statement-aligned).
  const PC = G._pc;
  const K = PC.kit;
  const PI = Math.PI,
    HP = PI / 2;

  const SX0 = 210.3,
    SX1 = 269.7,
    SZ0 = 452.3,
    SZ1 = 482.7; // churchyard wall line
  const CX0 = 228,
    CX1 = 248,
    CZ0 = 458,
    CZF = 482.4; // nave (front at CZF)
  const EAVE = 13,
    RIDGE = 21.5,
    FLOOR = 0.12;
  const MID = (CX0 + CX1) / 2;
  PC.STPAT = { CX0, CX1, CZ0, CZF, MID, SZ1 };

  const STONE = [0.85, 0.78, 0.7],
    STONE_D = [0.7, 0.64, 0.56],
    BRICK = [0.72, 0.58, 0.5];

  // stained glass (atlas cell; the interior uses the additive 'neon' version)
  K.stainedGlass = function (atlas, key, w, h, seed, pal) {
    return K.paint(
      atlas,
      "pc_sg_" + key + "_" + atlas,
      w,
      h,
      function (x, X, Y, W, H) {
        const neon = atlas === "neon";
        x.fillStyle = neon ? "#000" : "#141010";
        x.fillRect(X, Y, W, H);
        const r = K.rng("sg" + seed);
        const P = pal || [
          "#a02a20",
          "#2a4a8a",
          "#d8a030",
          "#3a7a4a",
          "#7a3a8a",
          "#e8d8a0",
        ];
        const cell = W / 6;
        for (let j = 0; j < H / cell + 1; j++)
          for (let i = 0; i < 6; i++) {
            x.fillStyle = P[(i + j * 2 + ((r() * 3) | 0)) % P.length];
            if (r() < 0.06) x.fillStyle = neon ? "#000" : "#050404";
            x.beginPath();
            x.moveTo(X + i * cell + cell / 2, Y + j * cell);
            x.lineTo(X + i * cell + cell, Y + j * cell + cell / 2);
            x.lineTo(X + i * cell + cell / 2, Y + j * cell + cell);
            x.lineTo(X + i * cell, Y + j * cell + cell / 2);
            x.closePath();
            x.fill();
            x.fillStyle = P[(i + j + 3) % P.length];
            x.globalAlpha = 0.85;
            x.fillRect(
              X + i * cell + cell * 0.38,
              Y + j * cell + cell * 0.38,
              cell * 0.24,
              cell * 0.24,
            );
            x.globalAlpha = 1;
          }
        // a saint in a mandorla in the middle panel
        const cx = X + W / 2,
          cy = Y + H * 0.45;
        x.fillStyle = "#e8d8a0";
        x.beginPath();
        x.ellipse(cx, cy, W * 0.22, H * 0.2, 0, 0, PI * 2);
        x.fill();
        x.fillStyle = P[(seed | 0) % P.length];
        x.beginPath();
        x.ellipse(cx, cy + H * 0.05, W * 0.12, H * 0.14, 0, 0, PI * 2);
        x.fill();
        x.fillStyle = "#f0e0b8";
        x.beginPath();
        x.arc(cx, cy - H * 0.1, W * 0.06, 0, PI * 2);
        x.fill();
        x.strokeStyle = "#d8a030";
        x.lineWidth = 3;
        x.beginPath();
        x.arc(cx, cy - H * 0.1, W * 0.09, 0, PI * 2);
        x.stroke();
        x.strokeStyle = neon ? "#000" : "#100c0a";
        x.lineWidth = 3;
        for (let i = 0; i <= 6; i++) {
          x.beginPath();
          x.moveTo(X + i * cell, Y);
          x.lineTo(X + i * cell, Y + H);
          x.stroke();
        }
        for (let j = 0; j <= H / cell; j++) {
          x.beginPath();
          x.moveTo(X, Y + j * cell);
          x.lineTo(X + W, Y + j * cell);
          x.stroke();
        }
        if (neon) {
          x.fillStyle = "rgba(0,0,0,0.3)";
          x.fillRect(X, Y, W, H);
        } else K.stains(x, X, Y, W, H, 10, 1901 + seed, 0.45, [20, 15, 10]);
      },
    );
  };
  const rose = (atlas) =>
    K.paint(atlas, "pc_sg_rose_" + atlas, 256, 256, function (x, X, Y, W, H) {
      const neon = atlas === "neon";
      x.fillStyle = neon ? "#000" : "#141010";
      x.fillRect(X, Y, W, H);
      const cx = X + W / 2,
        cy = Y + H / 2,
        P = ["#a02a20", "#2a4a8a", "#d8a030", "#3a7a4a", "#7a3a8a"];
      for (let k = 0; k < 12; k++) {
        const a0 = (k / 12) * PI * 2,
          a1 = a0 + PI / 6;
        for (let ring = 0; ring < 3; ring++) {
          x.fillStyle = P[(k + ring) % P.length];
          x.beginPath();
          x.arc(cx, cy, W * (0.18 + ring * 0.1), a0, a1);
          x.arc(cx, cy, W * (0.08 + ring * 0.1), a1, a0, true);
          x.closePath();
          x.fill();
        }
      }
      x.fillStyle = "#e8d8a0";
      x.beginPath();
      x.arc(cx, cy, W * 0.08, 0, PI * 2);
      x.fill();
      x.strokeStyle = neon ? "#000" : "#100c0a";
      x.lineWidth = 4;
      for (let k = 0; k < 12; k++) {
        const a = (k / 12) * PI * 2;
        x.beginPath();
        x.moveTo(cx, cy);
        x.lineTo(cx + (Math.cos(a) * W) / 2, cy + (Math.sin(a) * H) / 2);
        x.stroke();
      }
      for (let ring = 0; ring < 4; ring++) {
        x.beginPath();
        x.arc(cx, cy, W * (0.08 + ring * 0.1), 0, PI * 2);
        x.stroke();
      }
      if (!neon) K.stains(x, X, Y, W, H, 8, 1950, 0.4, [20, 15, 10]);
    });
  K.roseWindow = rose;

