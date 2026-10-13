// play-inline-314 04 — math
// Lines 762-797 of readable/play-inline-314.pretty.js (statement-aligned).
  function sunburstCell() {
    return K.paint("art", "ny_sunburst", 512, 256, function (x, X, Y, W, H) {
      x.fillStyle = "#2a1a0c";
      x.fillRect(X, Y, W, H);
      const cx = X + W / 2,
        cy = Y + H;
      for (let k = 0; k < 24; k++) {
        const a0 = Math.PI + (k * Math.PI) / 24,
          a1 = a0 + Math.PI / 48;
        x.fillStyle = k % 2 ? "#c8a050" : "#8a6a30";
        x.beginPath();
        x.moveTo(cx, cy);
        x.arc(cx, cy, H * 0.98, a0, a1);
        x.closePath();
        x.fill();
      }
      x.fillStyle = "#e0c070";
      x.beginPath();
      x.arc(cx, cy, H * 0.3, Math.PI, 0);
      x.fill();
      x.strokeStyle = "#2a1a0c";
      x.lineWidth = 6;
      for (const rr of [0.3, 0.55, 0.8]) {
        x.beginPath();
        x.arc(cx, cy, H * rr, Math.PI, 0);
        x.stroke();
      }
      K.stains(x, X, Y, W, H, 12, 77, 0.45, [30, 40, 20]);
    });
  }

  // ==================================================================
  // INTERIOR — built in 11_newyorker_int.js (PH.nyInterior)
  // ==================================================================
  PH.ny = { X0, X1, Z0, Z1, DOOR_Z, MEZ_Y, LOBBY_H, sunburstCell, lettersCell };
  PH.nyExterior = exterior;
