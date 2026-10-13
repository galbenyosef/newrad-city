// play-inline-233 02 — math
// Lines 30-277 of readable/play-inline-233.pretty.js (statement-aligned).
  const LI = G._li,
    A = LI.arch,
    F = LI.furn,
    Q = LI.q,
    TAU = Math.PI * 2;
  const KEY = "city_hall_rotunda";
  const D2R = Math.PI / 180;

  function art() {
    const T = {};
    T.coffers = LI.texMat(
      "ch_coffers",
      LI.canvasTex("ch_coffers", 256, 256, (x, W, H) => {
        x.fillStyle = "#e8e0cc";
        x.fillRect(0, 0, W, H);
        for (let k = 0; k < 5; k++) {
          const i = 18 + k * 14;
          x.fillStyle = ["#d4ccb6", "#c8bea6", "#bcb298", "#b0a68a", "#a8a088"][
            k
          ];
          x.fillRect(i, i, W - 2 * i, H - 2 * i);
        }
        x.fillStyle = "#c8a050";
        x.beginPath();
        x.arc(W / 2, H / 2, 26, 0, TAU);
        x.fill();
        for (let k = 0; k < 8; k++) {
          const a = (k / 8) * TAU;
          x.beginPath();
          x.ellipse(
            W / 2 + Math.cos(a) * 30,
            H / 2 + Math.sin(a) * 30,
            12,
            6,
            a,
            0,
            TAU,
          );
          x.fill();
        }
        x.strokeStyle = "#8a7a5a";
        x.lineWidth = 3;
        x.strokeRect(1, 1, W - 2, H - 2);
        LI.wear(x, W, H, 12, 0.5);
      }),
      { rough: 0.85 },
    );
    T.portraits = LI.texMat(
      "ch_portraits",
      LI.canvasTex(
        "ch_portraits",
        1024,
        512,
        (x, W, H) => {
          for (let i = 0; i < 8; i++)
            LI.portrait(
              x,
              (i % 4) * 256,
              Math.floor(i / 4) * 256,
              256,
              256,
              40 + i * 5,
            );
        },
        { clamp: true },
      ),
      { rough: 0.8 },
    );
    T.tondo = LI.texMat(
      "ch_tondo",
      LI.canvasTex(
        "ch_tondo",
        1024,
        1024,
        (x, W, H) => {
          const cx = W / 2,
            cy = H / 2,
            r = LI.rng(64);
          const g = x.createRadialGradient(cx, cy, 20, cx, cy, 500);
          g.addColorStop(0, "#e8d8a8");
          g.addColorStop(0.6, "#a8b8c8");
          g.addColorStop(1, "#4a5a6a");
          x.fillStyle = g;
          x.fillRect(0, 0, W, H);
          // the city enthroned, receiving tribute (original allegory)
          x.fillStyle = "#e0c898";
          x.beginPath();
          x.ellipse(cx, cy - 40, 60, 80, 0, 0, TAU);
          x.fill();
          x.fillStyle = "#6a2a2a";
          x.beginPath();
          x.moveTo(cx - 110, cy + 180);
          x.quadraticCurveTo(cx - 60, cy - 20, cx, cy + 10);
          x.quadraticCurveTo(cx + 60, cy - 20, cx + 110, cy + 180);
          x.fill();
          x.fillStyle = "#d8b050";
          for (let k = 0; k < 7; k++) {
            const a = -Math.PI / 2 + (k - 3) * 0.28;
            x.beginPath();
            x.moveTo(cx + Math.cos(a) * 60, cy - 130 + Math.sin(a) * 60);
            x.lineTo(cx + Math.cos(a) * 100, cy - 130 + Math.sin(a) * 100);
            x.lineTo(
              cx + Math.cos(a + 0.08) * 60,
              cy - 130 + Math.sin(a + 0.08) * 60,
            );
            x.fill();
          }
          for (let k = 0; k < 10; k++) {
            const a = (k / 10) * TAU,
              px = cx + Math.cos(a) * 330,
              py = cy + Math.sin(a) * 330;
            x.fillStyle = ["#8a5a3a", "#3a5a7a", "#5a7a3a", "#7a3a5a"][k % 4];
            x.beginPath();
            x.ellipse(px, py, 40, 70, a + Math.PI / 2, 0, TAU);
            x.fill();
            x.fillStyle = "#d8b890";
            x.beginPath();
            x.arc(px - Math.cos(a) * 60, py - Math.sin(a) * 60, 22, 0, TAU);
            x.fill();
          }
          x.strokeStyle = "#c8a050";
          x.lineWidth = 30;
          x.beginPath();
          x.arc(cx, cy, 495, 0, TAU);
          x.stroke();
          LI.wear(x, W, H, 64, 0.8);
        },
        { clamp: true },
      ),
      { rough: 0.9 },
    );
    T.seal = LI.texMat(
      "ch_seal",
      LI.canvasTex(
        "ch_seal",
        512,
        512,
        (x, W, H) => {
          x.clearRect(0, 0, W, H);
          const cx = W / 2,
            cy = H / 2;
          x.fillStyle = "#1c2c5a";
          x.beginPath();
          x.arc(cx, cy, 250, 0, TAU);
          x.fill();
          x.strokeStyle = "#d8b050";
          x.lineWidth = 12;
          x.beginPath();
          x.arc(cx, cy, 238, 0, TAU);
          x.stroke();
          x.beginPath();
          x.arc(cx, cy, 170, 0, TAU);
          x.stroke();
          x.fillStyle = "#e8d8a0";
          x.font = "bold 30px Georgia, serif";
          x.textAlign = "center";
          const txt = "· SEAL OF THE CITY OF NEW YORK · 1625 ·";
          for (let i = 0; i < txt.length; i++) {
            const a = -Math.PI * 0.95 + (i / txt.length) * Math.PI * 1.9;
            x.save();
            x.translate(cx + Math.cos(a) * 205, cy + Math.sin(a) * 205);
            x.rotate(a + Math.PI / 2);
            x.fillText(txt[i], 0, 10);
            x.restore();
          }
          // shield with windmill sails, two supporters, eagle (stylised, original)
          x.fillStyle = "#e8d8a0";
          x.beginPath();
          x.moveTo(cx - 70, cy - 80);
          x.lineTo(cx + 70, cy - 80);
          x.lineTo(cx + 70, cy + 20);
          x.quadraticCurveTo(cx, cy + 110, cx - 70, cy + 20);
          x.fill();
          x.strokeStyle = "#1c2c5a";
          x.lineWidth = 10;
          for (let k = 0; k < 4; k++) {
            const a = (k / 4) * TAU + Math.PI / 4;
            x.beginPath();
            x.moveTo(cx, cy - 20);
            x.lineTo(cx + Math.cos(a) * 60, cy - 20 + Math.sin(a) * 60);
            x.stroke();
          }
          x.fillStyle = "#e8d8a0";
          for (const s of [-1, 1]) {
            x.beginPath();
            x.ellipse(cx + s * 115, cy + 10, 26, 80, 0, 0, TAU);
            x.fill();
            x.beginPath();
            x.arc(cx + s * 115, cy - 85, 20, 0, TAU);
            x.fill();
          }
          x.beginPath();
          x.moveTo(cx, cy - 150);
          x.lineTo(cx - 60, cy - 110);
          x.lineTo(cx + 60, cy - 110);
          x.fill();
        },
        { clamp: true },
      ),
      { transparent: true, rough: 0.5, metal: 0.3 },
    );
    T.park = LI.texMat(
      "ch_park",
      LI.canvasTex(
        "ch_park",
        1024,
        512,
        (x, W, H) => {
          const g = x.createLinearGradient(0, 0, 0, H);
          g.addColorStop(0, "#7a8a62");
          g.addColorStop(0.55, "#b8b088");
          g.addColorStop(0.56, "#5a5a44");
          g.addColorStop(1, "#3a3a2e");
          x.fillStyle = g;
          x.fillRect(0, 0, W, H);
          const r = LI.rng(3);
          x.strokeStyle = "rgba(40,36,28,0.9)";
          for (let i = 0; i < 14; i++) {
            const tx = r() * W,
              th = 80 + r() * 90;
            x.lineWidth = 6;
            x.beginPath();
            x.moveTo(tx, H * 0.56);
            x.lineTo(tx, H * 0.56 - th);
            x.stroke();
            x.lineWidth = 2;
            for (let k = 0; k < 6; k++) {
              x.beginPath();
              x.moveTo(tx, H * 0.56 - th * (0.4 + k * 0.1));
              x.lineTo(tx + (r() - 0.5) * 90, H * 0.56 - th * (0.7 + k * 0.08));
              x.stroke();
            }
          }
          x.fillStyle = "rgba(80,76,64,0.9)";
          x.fillRect(W * 0.7, H * 0.2, W * 0.3, H * 0.36);
          LI.wear(x, W, H, 4, 0.4);
        },
        { clamp: true },
      ),
      { emissive: 0.7, rough: 1 },
    );
    T.sign = (id, lines, st, w, h) =>
      LI.texMat("ch_sign_" + id, LI.signTex("ch_" + id, lines, st, w, h), {
        rough: 0.8,
      });
    return T;
  }

