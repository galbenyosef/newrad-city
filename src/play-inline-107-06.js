// play-inline-107 06 — beginpath
// Lines 1690-1901 of readable/play-inline-107.pretty.js (statement-aligned).
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
  /** Iron Covenant emblem (original): a heater shield with a rivet band, two crossed lances behind it, an anvil cut-out. */
  K.covenantEmblem = function (x, cx, cy, s, col) {
    x.save();
    x.translate(cx, cy);
    x.fillStyle = col;
    x.strokeStyle = col;
    x.lineWidth = s * 0.08;
    for (const sgn of [-1, 1]) {
      x.beginPath();
      x.moveTo(sgn * s * 0.95, s * 0.85);
      x.lineTo(-sgn * s * 0.8, -s * 0.8);
      x.stroke();
      x.beginPath();
      x.moveTo(-sgn * s * 0.8, -s * 0.8);
      x.lineTo(-sgn * s * 0.98, -s * 1.0);
      x.lineTo(-sgn * s * 0.66, -s * 0.9);
      x.fill();
    }
    x.beginPath();
    x.moveTo(-s * 0.5, -s * 0.55);
    x.lineTo(s * 0.5, -s * 0.55);
    x.lineTo(s * 0.5, s * 0.05);
    x.quadraticCurveTo(s * 0.45, s * 0.5, 0, s * 0.75);
    x.quadraticCurveTo(-s * 0.45, s * 0.5, -s * 0.5, s * 0.05);
    x.closePath();
    x.fill();
    x.globalCompositeOperation = "destination-out";
    for (let i = 0; i < 5; i++) {
      x.beginPath();
      x.arc(-s * 0.36 + i * s * 0.18, -s * 0.4, s * 0.045, 0, 7);
      x.fill();
    }
    x.beginPath();
    x.moveTo(-s * 0.3, -s * 0.12);
    x.lineTo(s * 0.3, -s * 0.12);
    x.lineTo(s * 0.16, s * 0.02);
    x.lineTo(s * 0.1, s * 0.3);
    x.lineTo(-s * 0.1, s * 0.3);
    x.lineTo(-s * 0.16, s * 0.02);
    x.closePath();
    x.fill();
    x.restore();
  };
  /** Glowkeeper sun disc: a solid disc, a thin ring and twelve wedge rays. */
  K.sunDisc = function (x, cx, cy, s, col, lw) {
    x.save();
    x.translate(cx, cy);
    x.strokeStyle = col;
    x.fillStyle = col;
    x.lineWidth = lw || s * 0.07;
    x.beginPath();
    x.arc(0, 0, s * 0.42, 0, 7);
    x.fill();
    x.beginPath();
    x.arc(0, 0, s * 0.6, 0, 7);
    x.stroke();
    for (let i = 0; i < 12; i++) {
      x.save();
      x.rotate((i * Math.PI) / 6);
      x.beginPath();
      x.moveTo(-s * 0.07, -s * 0.7);
      x.lineTo(0, -s * (i % 2 ? 0.92 : 1.05));
      x.lineTo(s * 0.07, -s * 0.7);
      x.closePath();
      x.fill();
      x.restore();
    }
    x.restore();
  };
  /** Analog clock face (numerals in Roman or Arabic). */
  K.clockFace = function (x, W, H, o) {
    o = o || {};
    const cx = W / 2,
      cy = H / 2,
      R = Math.min(W, H) / 2 - 2;
    x.fillStyle = o.rim || "#b8902a";
    x.beginPath();
    x.arc(cx, cy, R, 0, 7);
    x.fill();
    x.fillStyle = o.face || "#efe6c8";
    x.beginPath();
    x.arc(cx, cy, R * 0.88, 0, 7);
    x.fill();
    if (o.glass) {
      // Tiffany-style coloured glass ring
      const cols = ["#2a6a9a", "#c83a2a", "#3a8a4a", "#d8a030"];
      for (let i = 0; i < 24; i++) {
        x.fillStyle = cols[i % 4];
        x.beginPath();
        x.moveTo(cx, cy);
        x.arc(cx, cy, R * 0.88, (i * Math.PI) / 12, ((i + 1) * Math.PI) / 12);
        x.fill();
      }
      x.fillStyle = o.face || "#efe6c8";
      x.beginPath();
      x.arc(cx, cy, R * 0.66, 0, 7);
      x.fill();
    }
    x.fillStyle = o.ink || "#1a1a1a";
    x.font = "bold " + Math.round(R * 0.2) + "px Georgia, serif";
    x.textAlign = "center";
    x.textBaseline = "middle";
    const roman = [
      "XII",
      "I",
      "II",
      "III",
      "IIII",
      "V",
      "VI",
      "VII",
      "VIII",
      "IX",
      "X",
      "XI",
    ];
    for (let i = 0; i < 12; i++) {
      const a = (i * Math.PI) / 6 - Math.PI / 2,
        rr = o.glass ? R * 0.52 : R * 0.72;
      x.fillText(
        o.arabic ? String(i === 0 ? 12 : i) : roman[i],
        cx + Math.cos(a) * rr,
        cy + Math.sin(a) * rr,
      );
    }
    // hands frozen at 7:16 — the moment the bomb fell
    const hand = (ang, len, wdt) => {
      x.save();
      x.translate(cx, cy);
      x.rotate(ang);
      x.fillRect(-wdt / 2, -len, wdt, len * 1.12);
      x.restore();
    };
    x.fillStyle = o.ink || "#1a1a1a";
    hand(((7 + 16 / 60) / 12) * Math.PI * 2, R * 0.45, R * 0.07);
    hand((16 / 60) * Math.PI * 2, R * 0.66, R * 0.045);
    x.beginPath();
    x.arc(cx, cy, R * 0.06, 0, 7);
    x.fill();
    // cracks
    x.strokeStyle = "rgba(40,30,20,0.55)";
    x.lineWidth = 1.5;
    const r = K.rng(o.seed || 5);
    for (let k = 0; k < 3; k++) {
      x.beginPath();
      let px = cx + (r() - 0.5) * R,
        py = cy + (r() - 0.5) * R;
      x.moveTo(px, py);
      for (let j = 0; j < 5; j++) {
        px += (r() - 0.5) * R * 0.4;
        py += (r() - 0.5) * R * 0.4;
        x.lineTo(px, py);
      }
      x.stroke();
    }
  };

  // ------------------------------------------------------------------
  // Shopfronts: 8 ground-floor window variants in one texture (4 × 2 cells of 256²) with a matching
  // emissive map (only the lit interiors glow, brighter at night). K.shopRect(i) → uv rect of variant i.
  //   0 dirty plate glass (dim shelves, reflections)   1 boarded plywood + posters + graffiti
  //   2 LIT diner / bar interior                        3 smashed glass into darkness
  //   4 roll-down steel shutter with graffiti           5 LIT junk shop (shelves, hanging bulb)
  //   6 LIT chem clinic (white-blue)                    7 cinder-block infill
  // ------------------------------------------------------------------
  K.SHOP_LIT = [2, 5, 6];
  K.shopRect = function (i) {
    i = ((i % 8) + 8) % 8;
    const cx = i % 4,
      cy = Math.floor(i / 4);
    const e = 2 / 1024;
    return [
      cx / 4 + e,
      1 - (cy + 1) / 2 + e * 2,
      (cx + 1) / 4 - e,
      1 - cy / 2 - e * 2,
    ];
  };
