// play-inline-107 08 — size
// Lines 2266-2311 of readable/play-inline-107.pretty.js (statement-aligned).
  K.signText = function (x, W, H, text, o) {
    o = o || {};
    x.fillStyle = o.bg || "#2a2a26";
    x.fillRect(0, 0, W, H);
    if (o.border) {
      x.strokeStyle = o.border;
      x.lineWidth = Math.max(3, H * 0.06);
      x.strokeRect(H * 0.06, H * 0.06, W - H * 0.12, H - H * 0.12);
    }
    x.fillStyle = o.fg || "#e8e0c8";
    x.textAlign = "center";
    x.textBaseline = "middle";
    let size = o.size || H * 0.62;
    x.font =
      (o.weight || "bold") +
      " " +
      Math.round(size) +
      "px " +
      (o.font || '"Arial Black", Impact, sans-serif');
    while (x.measureText(text).width > W * 0.92 && size > 8) {
      size *= 0.92;
      x.font =
        (o.weight || "bold") +
        " " +
        Math.round(size) +
        "px " +
        (o.font || '"Arial Black", Impact, sans-serif');
    }
    if (o.spacing) {
      try {
        x.letterSpacing = o.spacing + "px";
      } catch (e) {
        /* older canvas */
      }
    }
    x.fillText(text, W / 2, H / 2 + (o.dy || 0) * H);
    try {
      x.letterSpacing = "0px";
    } catch (e) {
      /* ignore */
    }
    if (o.weather !== false) {
      K.stains(x, W, H, 6, U.hashStr(text) % 997, 0.35);
      K.streaks(x, W, H, 12, U.hashStr(text) % 991, 0.22);
    }
  };
