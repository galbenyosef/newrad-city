// play-inline-171 04 — font
// Lines 692-770 of readable/play-inline-171.pretty.js (statement-aligned).
  K.star = function (x, cx, cy, R, r, col) {
    x.fillStyle = col;
    x.beginPath();
    for (let i = 0; i < 10; i++) {
      const rr = i % 2 ? r : R,
        a = -Math.PI / 2 + (i * Math.PI) / 5;
      x.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
    }
    x.closePath();
    x.fill();
  };
  K.skull = function (x, cx, cy, s, col) {
    x.fillStyle = col;
    x.beginPath();
    x.arc(cx, cy - s * 0.15, s * 0.6, Math.PI, 0);
    x.lineTo(cx + s * 0.45, cy + s * 0.35);
    x.lineTo(cx - s * 0.45, cy + s * 0.35);
    x.fill();
    x.fillRect(cx - s * 0.3, cy + s * 0.3, s * 0.6, s * 0.3);
    x.fillStyle = "#111";
    x.beginPath();
    x.arc(cx - s * 0.22, cy, s * 0.14, 0, 7);
    x.arc(cx + s * 0.22, cy, s * 0.14, 0, 7);
    x.fill();
    x.fillRect(cx - s * 0.04, cy + s * 0.12, s * 0.08, s * 0.14);
    x.strokeStyle = col;
    x.lineWidth = s * 0.1;
    x.beginPath();
    x.moveTo(cx - s, cy - s * 0.6);
    x.lineTo(cx + s, cy + s);
    x.moveTo(cx + s, cy - s * 0.6);
    x.lineTo(cx - s, cy + s);
    x.stroke();
  };

  /** Painted text helper: fits `text` into width w at max size px. */
  K.fitText = function (x, text, cx, cy, w, px, font, fill, stroke, lw) {
    let size = px;
    x.font =
      (font || "bold ") +
      size +
      "px " +
      (K.FONT || 'Georgia, "Times New Roman", serif');
    while (x.measureText(text).width > w && size > 8) {
      size -= 2;
      x.font =
        (font || "bold ") +
        size +
        "px " +
        (K.FONT || 'Georgia, "Times New Roman", serif');
    }
    x.textAlign = "center";
    x.textBaseline = "middle";
    if (stroke) {
      x.strokeStyle = stroke;
      x.lineWidth = lw || 4;
      x.strokeText(text, cx, cy);
    }
    if (fill) {
      x.fillStyle = fill;
      x.fillText(text, cx, cy);
    }
    return size;
  };
  K.FONT = 'Georgia, "Times New Roman", serif';
  K.SANS = '"Arial Black", Impact, "Helvetica Neue", sans-serif';
  /** Weathering pass for painted slots. */
  K.weather = function (x, w, h, seed, amt) {
    K.stains(x, w, h, Math.round(6 * (amt || 1)), seed || 7, 0.28 * (amt || 1));
    K.streaks(
      x,
      w,
      h,
      Math.round(12 * (amt || 1)),
      (seed || 7) + 1,
      0.16 * (amt || 1),
    );
    K.grain(x, w, h, 18, (seed || 7) + 2);
  };
