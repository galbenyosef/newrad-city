// play-inline-337 02 — fillstyle
// Lines 28-197 of readable/play-inline-337.pretty.js (statement-aligned).
  const EV = G._pev;
  const K = EV.kit;
  const PI = Math.PI,
    HP = PI / 2;

  const X0 = 212,
    X1 = 268,
    Z0 = 274,
    Z1 = 301;
  const BASE = 5,
    ENT = 15.5,
    BAL = 17,
    ROOF = 17.6,
    RIDGE = 23.4;
  const PZ0 = 280,
    PZ1 = 295,
    PX = 209.4; // west portico
  const DOOR_Z = 287.5;
  const CHUTE = { x: 263, z: 302.2 };
  // interior levels
  const U2 = 5.0,
    CY = -4.0,
    GH = 4.7;
  const VAULT = { x: -18, z: -24 };

  // ==================================================================
  // ART
  // ==================================================================
  function tigerCell() {
    return K.paint("art", "tam_tiger", 512, 512, function (x, X, Y, W, H) {
      x.fillStyle = "#1a1410";
      x.fillRect(X, Y, W, H);
      const cx = X + W / 2,
        cy = Y + H * 0.54;
      x.fillStyle = "#d8701c";
      x.beginPath();
      x.ellipse(cx, cy, W * 0.38, H * 0.36, 0, 0, 6.3);
      x.fill();
      for (const s of [-1, 1]) {
        x.beginPath();
        x.moveTo(cx + s * W * 0.3, cy - H * 0.22);
        x.lineTo(cx + s * W * 0.4, cy - H * 0.45);
        x.lineTo(cx + s * W * 0.17, cy - H * 0.32);
        x.fill();
      }
      x.fillStyle = "#f0e0c0";
      x.beginPath();
      x.ellipse(cx, cy + H * 0.12, W * 0.2, H * 0.16, 0, 0, 6.3);
      x.fill();
      x.strokeStyle = "#140c08";
      x.lineWidth = 12;
      for (const s of [-1, 1])
        for (let k = 0; k < 3; k++) {
          x.beginPath();
          x.moveTo(cx + s * W * (0.36 - k * 0.02), cy - H * 0.1 + k * H * 0.09);
          x.lineTo(
            cx + s * W * (0.22 - k * 0.02),
            cy - H * 0.06 + k * H * 0.08,
          );
          x.stroke();
        }
      for (let k = 0; k < 3; k++) {
        x.beginPath();
        x.moveTo(cx - W * 0.06 + k * W * 0.06, cy - H * 0.33);
        x.lineTo(cx - W * 0.03 + k * W * 0.03, cy - H * 0.18);
        x.stroke();
      }
      x.fillStyle = "#e8d020";
      for (const s of [-1, 1]) {
        x.beginPath();
        x.ellipse(
          cx + s * W * 0.12,
          cy - H * 0.05,
          W * 0.06,
          H * 0.035,
          s * 0.2,
          0,
          6.3,
        );
        x.fill();
        x.fillStyle = "#100a06";
        x.beginPath();
        x.ellipse(
          cx + s * W * 0.12,
          cy - H * 0.05,
          W * 0.015,
          H * 0.03,
          0,
          0,
          6.3,
        );
        x.fill();
        x.fillStyle = "#e8d020";
      }
      x.fillStyle = "#100a06";
      x.beginPath();
      x.moveTo(cx - W * 0.05, cy + H * 0.05);
      x.lineTo(cx + W * 0.05, cy + H * 0.05);
      x.lineTo(cx, cy + H * 0.1);
      x.fill();
      x.fillStyle = "#7a1010";
      x.beginPath();
      x.ellipse(cx, cy + H * 0.2, W * 0.1, H * 0.06, 0, 0, PI);
      x.fill();
      x.fillStyle = "#f8f0e0";
      for (const s of [-1, 1]) {
        x.beginPath();
        x.moveTo(cx + s * W * 0.07, cy + H * 0.19);
        x.lineTo(cx + s * W * 0.05, cy + H * 0.27);
        x.lineTo(cx + s * W * 0.03, cy + H * 0.19);
        x.fill();
      }
      x.fillStyle = "#e8dcb8";
      x.font = "bold 44px Georgia, serif";
      x.textAlign = "center";
      x.fillText("TAMMANY", cx, Y + 56);
      x.font = "bold 30px Arial Black, sans-serif";
      x.fillStyle = "#d02020";
      x.fillText("BRAVES", cx, Y + H - 22);
      K.stains(x, X, Y, W, H, 16, 11, 0.5, [20, 12, 8]);
      K.streaks(x, X, Y, W, H, 20, 12, 0.35);
    });
  }
  function voteBanner(key, l1, l2) {
    return K.paint("art", key, 768, 192, function (x, X, Y, W, H) {
      x.fillStyle = "#e8e0cc";
      x.fillRect(X, Y, W, H);
      x.fillStyle = "#8a1a14";
      x.fillRect(X, Y, W, H * 0.16);
      x.fillRect(X, Y + H * 0.84, W, H * 0.16);
      x.fillStyle = "#1e2e52";
      for (let k = 0; k < 9; k++) {
        x.beginPath();
        x.arc(X + 40 + k * 86, Y + H * 0.08, 7, 0, 6.3);
        x.fill();
      }
      x.fillStyle = "#1e2e52";
      x.textAlign = "center";
      x.textBaseline = "middle";
      x.font = "bold 62px Georgia, serif";
      x.fillText(l1, X + W / 2, Y + H * 0.42, W * 0.94);
      x.fillStyle = "#8a1a14";
      x.font = "italic bold 30px Georgia, serif";
      x.fillText(l2, X + W / 2, Y + H * 0.7, W * 0.9);
      K.stains(x, X, Y, W, H, 14, 21, 0.5, [40, 30, 15]);
      K.streaks(x, X, Y, W, H, 16, 22, 0.4);
    });
  }
  function tallyBoard() {
    return K.paint("art", "tam_tally", 512, 320, function (x, X, Y, W, H) {
      x.fillStyle = "#23302a";
      x.fillRect(X, Y, W, H);
      x.fillStyle = "#e8e8dc";
      x.font = "bold 34px Georgia, serif";
      x.textAlign = "center";
      x.fillText("FOURTH WARD — RESULTS", X + W / 2, Y + 44);
      x.font = 'bold 30px "Courier New", monospace';
      x.textAlign = "left";
      x.fillText("CROKE ........ 4,211", X + 40, Y + 120);
      x.fillText("OPPONENT ........  0", X + 40, Y + 170);
      x.fillText("TURNOUT ....... 312%", X + 40, Y + 220);
      x.font = "italic 22px Georgia, serif";
      x.fillText('"The people have spoken." — the Boss', X + 40, Y + 280);
      K.stains(x, X, Y, W, H, 8, 31, 0.3, [200, 200, 190]);
    });
  }

  // ==================================================================
  // EXTERIOR
  // ==================================================================
