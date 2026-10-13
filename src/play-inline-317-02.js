// play-inline-317 02 — fillstyle
// Lines 28-122 of readable/play-inline-317.pretty.js (statement-aligned).
  const PH = G._ph;
  const K = PH.kit;
  const PI = Math.PI,
    HP = PI / 2;

  // exterior car footprint (world)
  const DX0 = -254,
    DX1 = -232,
    DZ0 = 62.5,
    DZ1 = 71.5;
  const DCX = (DX0 + DX1) / 2,
    DCZ = (DZ0 + DZ1) / 2;
  const BY = -3.4; // cellar floor (local)
  const CAR = { x0: -11, x1: 11, z0: -4.5, z1: 4.5, h: 3.3 };

  // ==================================================================
  // ART
  // ==================================================================
  function nameBand() {
    return K.paint("art", "dn_band", 1024, 96, function (x, X, Y, W, H) {
      x.fillStyle = "#101010";
      x.fillRect(X, Y, W, H);
      x.fillStyle = "#e8e4d8";
      x.font = "italic bold 64px Georgia, serif";
      x.textAlign = "center";
      x.textBaseline = "middle";
      x.fillText("Empire Diner", X + W / 2, Y + H / 2 + 4, W * 0.8);
      x.fillStyle = "#c8c8c8";
      for (const yy of [8, H - 12]) x.fillRect(X + 10, Y + yy, W - 20, 4);
      K.stains(x, X, Y, W, H, 10, 201, 0.3, [60, 60, 50]);
    });
  }
  function menuBoard() {
    return K.paint("art", "dn_menu", 512, 320, function (x, X, Y, W, H) {
      x.fillStyle = "#141414";
      x.fillRect(X, Y, W, H);
      x.fillStyle = "#f0f0e0";
      x.font = "bold 28px Arial, sans-serif";
      x.textAlign = "center";
      x.fillText("★ EMPIRE DINER ★", X + W / 2, Y + 36);
      const items = [
        ["MYSTERY MEAT PLATTER", "9"],
        ["BLUE PLATE SPECIAL", "11"],
        ["ROADKILL BURGER (NO ROAD)", "8"],
        ["SPUD HASH & EGGS", "6"],
        ["PIE (ASK)", "5"],
        ["COFFEE — BOTTOMLESS*", "3"],
      ];
      x.font = "20px Arial, sans-serif";
      items.forEach(([n, p], i) => {
        x.textAlign = "left";
        x.fillStyle = i === 0 ? "#ffd060" : "#e8e4d8";
        x.fillText(n, X + 18, Y + 80 + i * 36);
        x.textAlign = "right";
        x.fillText(p + " scrip", X + W - 18, Y + 80 + i * 36);
      });
      x.font = "italic 14px Arial";
      x.fillStyle = "#a0a090";
      x.textAlign = "center";
      x.fillText(
        "*bottom subject to availability · don't ask what's in the meat",
        X + W / 2,
        Y + H - 14,
      );
    });
  }
  function jukeCell() {
    return K.paint("neon", "dn_juke", 256, 384, function (x, X, Y, W, H) {
      x.fillStyle = "#000";
      x.fillRect(X, Y, W, H);
      const g = x.createLinearGradient(X, 0, X + W, 0);
      g.addColorStop(0, "#ff3060");
      g.addColorStop(0.3, "#ffb020");
      g.addColorStop(0.5, "#40d0ff");
      g.addColorStop(0.7, "#ffb020");
      g.addColorStop(1, "#ff3060");
      x.strokeStyle = g;
      x.lineWidth = 18;
      x.beginPath();
      x.moveTo(X + 20, Y + H - 10);
      x.lineTo(X + 20, Y + H * 0.32);
      x.arc(X + W / 2, Y + H * 0.32, W / 2 - 20, PI, 0);
      x.lineTo(X + W - 20, Y + H - 10);
      x.stroke();
      x.fillStyle = "rgba(255,200,120,0.55)";
      x.fillRect(X + 50, Y + H * 0.42, W - 100, H * 0.2);
      x.fillStyle = "rgba(80,200,255,0.35)";
      for (let k = 0; k < 6; k++)
        x.fillRect(X + 50, Y + H * 0.66 + k * 16, W - 100, 8);
    });
  }

  // ==================================================================
  // EXTERIOR
  // ==================================================================
