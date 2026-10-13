// play-inline-335 02 — fillstyle
// Lines 27-205 of readable/play-inline-335.pretty.js (statement-aligned).
  const EV = G._pev;
  const K = EV.kit;
  const PI = Math.PI,
    HP = PI / 2;

  // exterior footprint
  const X0 = 214,
    X1 = 266,
    Z0 = 318,
    Z1 = 342,
    PZ = 343.2; // PZ: front of the central pavilion
  const PX0 = 233,
    PX1 = 247;
  const FL = [0, 5.5, 10, 14.5, 19]; // floor lines
  const CORN = 22.5,
    TOP = 23.4,
    PAR = 24.4;
  const DOOR_X = 240;
  // interior
  const F2 = 5.5,
    BY = -5.5;
  const SHUT = { x0: -2, x1: 2, z: -14 };

  // ==================================================================
  // ART CELLS
  // ==================================================================
  function ardentBanner() {
    return K.paint(
      "art",
      "cu_ardent_banner",
      256,
      768,
      function (x, X, Y, W, H) {
        x.fillStyle = "#1c3a5a";
        x.fillRect(X, Y, W, H);
        x.fillStyle = "#d8c070";
        x.fillRect(X + 10, Y + 10, W - 20, 6);
        x.fillRect(X + 10, Y + H - 16, W - 20, 6);
        x.strokeStyle = "#e8e0c8";
        x.lineWidth = 8;
        x.beginPath();
        x.arc(X + W / 2, Y + 150, 70, 0, 6.283);
        x.stroke();
        x.fillStyle = "#e8e0c8";
        x.font = "bold 64px Arial Black, sans-serif";
        x.textAlign = "center";
        x.textBaseline = "middle";
        x.fillText("A", X + W / 2, Y + 152);
        x.font = "bold 40px Arial, sans-serif";
        x.fillText("ARDENT", X + W / 2, Y + 270);
        x.font = "bold 26px Arial, sans-serif";
        ["TECHNICAL", "ACADEMY", "", "COOPER", "UNION", "CAMPUS"].forEach(
          (t, i) => x.fillText(t, X + W / 2, Y + 340 + i * 40),
        );
        x.font = "italic 22px Georgia, serif";
        x.fillText("\"Tomorrow's", X + W / 2, Y + 620);
        x.fillText("Minds, Today's", X + W / 2, Y + 648);
        x.fillText('Machines"', X + W / 2, Y + 676);
        K.stains(x, X, Y, W, H, 14, 71, 0.5, [30, 20, 10]);
        K.streaks(x, X, Y, W, H, 20, 72, 0.4);
        // tears
        x.clearRect(X + W * 0.7, Y + H * 0.8, W * 0.3, H * 0.2);
      },
    );
  }
  function examScreen() {
    return K.paint(
      "neon",
      "cu_exam_screen",
      768,
      384,
      function (x, X, Y, W, H) {
        x.fillStyle = "#000";
        x.fillRect(X, Y, W, H);
        x.fillStyle = "#39ff7a";
        x.shadowColor = "#39ff7a";
        x.shadowBlur = 10;
        x.textAlign = "center";
        x.font = "bold 44px Courier New, monospace";
        x.fillText("FINAL EXAMINATION", X + W / 2, Y + 70);
        x.font = "bold 26px Courier New, monospace";
        x.fillText("CIVIL ENGINEERING 401 · SECTION B", X + W / 2, Y + 120);
        x.fillText("TIME REMAINING: 00:00:00", X + W / 2, Y + 190);
        x.fillText("OVERTIME: 11,571,840 MINUTES", X + W / 2, Y + 230);
        x.fillText("PENCILS DOWN.  PENCILS DOWN.", X + W / 2, Y + 290);
        x.font = "20px Courier New, monospace";
        x.fillText(
          "TRUANCY WILL RESULT IN EXPULSION  ·  PROCTOR SYSTEM v2.3",
          X + W / 2,
          Y + 345,
        );
        x.shadowBlur = 0;
        for (let yy = 0; yy < H; yy += 4) {
          x.fillStyle = "rgba(0,0,0,0.35)";
          x.fillRect(X, Y + yy, W, 2);
        }
      },
    );
  }
  function flagCell() {
    return K.paint("art", "cu_flag", 256, 160, function (x, X, Y, W, H) {
      for (let i = 0; i < 13; i++) {
        x.fillStyle = i % 2 ? "#e8e0d0" : "#8a2a22";
        x.fillRect(X, Y + (i * H) / 13, W, H / 13 + 1);
      }
      x.fillStyle = "#1e2e52";
      x.fillRect(X, Y, W * 0.42, (H * 7) / 13);
      x.fillStyle = "#e8e0d0";
      for (let j = 0; j < 5; j++)
        for (let i = 0; i < 6; i++) {
          x.beginPath();
          x.arc(X + 10 + i * 16 + (j % 2) * 8, Y + 9 + j * 16, 2.4, 0, 6.3);
          x.fill();
        }
      K.stains(x, X, Y, W, H, 8, 81, 0.5, [40, 30, 20]);
    });
  }
  function sealCell() {
    return K.paint("art", "cu_seal", 512, 512, function (x, X, Y, W, H) {
      x.fillStyle = "#b8ae98";
      x.fillRect(X, Y, W, H);
      const cx = X + W / 2,
        cy = Y + H / 2;
      x.fillStyle = "#6a2a22";
      x.beginPath();
      x.arc(cx, cy, W * 0.46, 0, 6.3);
      x.fill();
      x.fillStyle = "#d8ceb4";
      x.beginPath();
      x.arc(cx, cy, W * 0.38, 0, 6.3);
      x.fill();
      x.fillStyle = "#2e3e52";
      x.beginPath();
      x.arc(cx, cy, W * 0.3, 0, 6.3);
      x.fill();
      x.fillStyle = "#e8dcb8";
      x.font = "bold 40px Georgia, serif";
      x.textAlign = "center";
      x.textBaseline = "middle";
      const txt =
        "THE COOPER UNION · FOR THE ADVANCEMENT OF SCIENCE AND ART · ";
      for (let i = 0; i < txt.length; i++) {
        const a = -PI / 2 + (i / txt.length) * PI * 2;
        x.save();
        x.translate(cx + Math.cos(a) * W * 0.42, cy + Math.sin(a) * W * 0.42);
        x.rotate(a + PI / 2);
        x.font = "bold 22px Georgia, serif";
        x.fillStyle = "#e8dcb8";
        x.fillText(txt[i], 0, 0);
        x.restore();
      }
      x.font = "bold 110px Georgia, serif";
      x.fillText("CU", cx, cy + 6);
      x.font = "bold 28px Georgia, serif";
      x.fillText("1859", cx, cy + 90);
      K.stains(x, X, Y, W, H, 20, 91, 0.5, [50, 40, 25]);
    });
  }
  function chalk(key, lines) {
    return K.paint("art", key, 512, 256, function (x, X, Y, W, H) {
      x.clearRect(X, Y, W, H);
      x.fillStyle = "rgba(235,235,225,0.85)";
      x.font = '22px "Comic Sans MS", "Segoe Print", cursive';
      x.textAlign = "left";
      lines.forEach((l, i) => x.fillText(l, X + 16, Y + 34 + i * 30));
      x.strokeStyle = "rgba(235,235,225,0.6)";
      x.lineWidth = 2;
      const r = K.rng(key);
      x.beginPath();
      x.moveTo(X + W * 0.62, Y + H * 0.7);
      for (let k = 0; k < 6; k++)
        x.lineTo(X + W * (0.62 + k * 0.06), Y + H * (0.7 - r() * 0.4));
      x.stroke();
    });
  }

  // ==================================================================
  // EXTERIOR
  // ==================================================================
