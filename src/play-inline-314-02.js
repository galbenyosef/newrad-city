// play-inline-314 02 — fillstyle
// Lines 32-106 of readable/play-inline-314.pretty.js (statement-aligned).
  const PH = G._ph;
  const K = PH.kit;
  const PI = Math.PI,
    HP = PI / 2;

  // ---- exterior footprint (world) ----
  const X0 = -188,
    X1 = -132,
    Z0 = -87,
    Z1 = -58;
  const BASE_H = 9.6; // limestone base (ground floor + mezzanine)
  const BODY_H = 72; // full-footprint slab
  const T1 = { x0: -185, x1: -135, z0: -84, z1: -61, h: 90 }; // first setback
  const T2 = { x0: -179, x1: -141, z0: -81, z1: -64, h: 106 }; // second setback
  const TW = { x0: -171, x1: -149, z0: -78.5, z1: -66.5, h: 122 }; // tower
  const DOOR_Z = -72.5; // 8th Ave entrance (east face x = X1)

  // ---- interior levels (local) ----
  const MEZ_Y = 5.2; // mezzanine & ballroom floor
  const LOBBY_H = 8.4;

  // ==================================================================
  // shared art cells
  // ==================================================================
  function lettersCell() {
    return K.paint("art", "ny_letters", 1024, 160, function (x, X, Y, W, H) {
      x.clearRect(X, Y, W, H);
      x.font = 'bold 132px "Arial Black", Impact, sans-serif';
      x.textAlign = "center";
      x.textBaseline = "middle";
      const txt = "NEW YORKER";
      // measure per-letter to draw bulbs along strokes
      x.lineWidth = 10;
      x.strokeStyle = "#3a0806";
      x.strokeText(txt, X + W / 2, Y + H / 2 + 6, W * 0.98);
      x.fillStyle = "#c8201a";
      x.fillText(txt, X + W / 2, Y + H / 2 + 6, W * 0.98);
      // weathering: rust blooms & missing paint
      const r = K.rng("ny_letters");
      for (let k = 0; k < 120; k++) {
        x.fillStyle =
          "rgba(" +
          (r() < 0.5 ? "90,40,20" : "60,20,15") +
          "," +
          (0.2 + r() * 0.4).toFixed(2) +
          ")";
        x.fillRect(X + r() * W, Y + r() * H, 3 + r() * 10, 2 + r() * 6);
      }
      // bulb dots (only where letters are): sample the painted alpha
      const img = x.getImageData(X, Y, W, H).data;
      x.fillStyle = "rgba(255,236,200,0.85)";
      for (let yy = 14; yy < H - 8; yy += 16)
        for (let xx = 8; xx < W - 8; xx += 16) {
          const a = img[(yy * W + xx) * 4 + 3],
            rr = img[(yy * W + xx) * 4];
          if (a > 200 && rr > 120 && r() < 0.75) {
            x.beginPath();
            x.arc(X + xx, Y + yy, 3, 0, 6.3);
            x.fill();
          }
        }
    });
  }
  function lettersNeon() {
    return K.neonCell("ny_letters_neon", "NEW YORKER", 1024, 160, {
      color: "#ff2418",
      font: '"Arial Black", Impact, sans-serif',
      size: 132,
      broken: 2,
    });
  }

  // ==================================================================
  // EXTERIOR
  // ==================================================================
