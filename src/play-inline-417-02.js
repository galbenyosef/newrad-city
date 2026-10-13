// play-inline-417 02 — fillstyle
// Lines 23-342 of readable/play-inline-417.pretty.js (statement-aligned).
  const PV = G._ph2;
  const K = PV.kit;
  const P = K.customPaint;
  const rgba = K.rgba;

  /** Rust bleed: vertical runs from a seam line. */
  function bleed(x, S, r, y, n, a) {
    for (let i = 0; i < n; i++) {
      const px = r() * S,
        len = S * (0.04 + r() * 0.22),
        w = 1 + r() * 5;
      const g = x.createLinearGradient(0, y, 0, y + len);
      g.addColorStop(0, rgba(120, 58, 24, a));
      g.addColorStop(0.4, rgba(140, 70, 30, a * 0.6));
      g.addColorStop(1, rgba(120, 60, 25, 0));
      x.fillStyle = g;
      x.fillRect(px, y, w, len);
    }
  }
  function chips(x, S, r, n, col, a) {
    for (let i = 0; i < n; i++) {
      const px = r() * S,
        py = r() * S,
        w = 2 + r() * 14,
        h = 1 + r() * 8;
      x.fillStyle = rgba(col[0], col[1], col[2], a * (0.5 + r() * 0.5));
      x.beginPath();
      x.ellipse(px, py, w, h, r() * 3, 0, Math.PI * 2);
      x.fill();
    }
  }

  P.clapboard = function (x, S, r) {
    const n = 12,
      h = S / n;
    for (let j = 0; j < n; j++) {
      const v = 0.9 + r() * 0.12;
      x.fillStyle = rgba(214 * v, 206 * v, 184 * v, 1);
      x.fillRect(0, j * h, S, h);
      // shadow under each lap + highlight on the board's lower edge
      const g = x.createLinearGradient(0, j * h, 0, j * h + h);
      g.addColorStop(0, "rgba(40,36,30,0.45)");
      g.addColorStop(0.18, "rgba(40,36,30,0.0)");
      g.addColorStop(0.9, "rgba(255,250,235,0.0)");
      g.addColorStop(1, "rgba(255,250,235,0.25)");
      x.fillStyle = g;
      x.fillRect(0, j * h, S, h);
      // butt joints
      for (let k = 0; k < 2; k++) {
        const px = r() * S;
        x.fillStyle = "rgba(50,44,36,0.5)";
        x.fillRect(px, j * h, 2, h);
      }
    }
    // peeling paint → grey weathered wood underneath: long ragged strips that follow the boards (the paint splits
    // along the grain), clustered near the laps, with a lighter curled edge — not round blotches
    for (let i = 0; i < 46; i++) {
      const j = Math.floor(r() * n),
        py = j * h + h * (0.25 + r() * 0.6),
        px = r() * S,
        len = 14 + r() * 70,
        th = 1.2 + r() * 3.2;
      x.fillStyle = rgba(134 + r() * 20, 128 + r() * 18, 114 + r() * 14, 0.8);
      x.beginPath();
      x.moveTo(px, py);
      for (let k = 1; k <= 6; k++)
        x.lineTo(px + (len * k) / 6, py - th * (0.4 + r() * 0.8));
      for (let k = 6; k >= 0; k--)
        x.lineTo(px + (len * k) / 6, py + th * (0.4 + r() * 0.8));
      x.closePath();
      x.fill();
      x.fillStyle = "rgba(250,246,232,0.45)";
      x.fillRect(px, py - th - 1, len * 0.8, 1);
      // wood grain showing through the bare strip
      x.fillStyle = "rgba(80,74,64,0.35)";
      x.fillRect(px + 2, py, len - 4, 0.8);
    }
    K.stains(x, 0, 0, S, S, 16, 3101, 0.35, [60, 70, 50]);
    K.streaks(x, 0, 0, S, S, 30, 3102, 0.25);
    K.grain(x, 0, 0, S, S, 18, 3103);
  };

  function hull(x, S, r, base, seamA) {
    x.fillStyle = base;
    x.fillRect(0, 0, S, S);
    // plate mottling
    for (let i = 0; i < 50; i++) {
      const px = r() * S,
        py = r() * S,
        rad = 20 + r() * 90,
        g = x.createRadialGradient(px, py, 0, px, py, rad);
      g.addColorStop(0, rgba(0, 0, 0, 0.12 * r()));
      g.addColorStop(1, rgba(0, 0, 0, 0));
      x.fillStyle = g;
      x.fillRect(px - rad, py - rad, rad * 2, rad * 2);
    }
    // welded strakes (horizontal) + butts (vertical, staggered) + rivet rows
    const rows = 4,
      rh = S / rows;
    for (let j = 0; j < rows; j++) {
      const y = j * rh;
      x.fillStyle = "rgba(25,18,12,0.55)";
      x.fillRect(0, y, S, 2);
      x.fillStyle = "rgba(255,240,220,0.12)";
      x.fillRect(0, y + 2, S, 1);
      const off = ((j % 2) * S) / 4;
      for (let k = 0; k < 2; k++) {
        const px = (off + (k * S) / 2) % S;
        x.fillStyle = "rgba(25,18,12,0.5)";
        x.fillRect(px, y, 2, rh);
      }
      for (let px = 4; px < S; px += 9) {
        x.fillStyle = "rgba(30,20,12,0.45)";
        x.beginPath();
        x.arc(px, y + 6, 1.6, 0, 6.3);
        x.fill();
      }
      bleed(x, S, r, y + 2, 26, seamA);
    }
    chips(x, S, r, 120, [96, 50, 26], 0.55);
    chips(x, S, r, 60, [60, 34, 20], 0.5);
    K.grain(x, 0, 0, S, S, 22, 3203);
  }
  P.hull_orange = function (x, S, r) {
    hull(x, S, r, "#c0612a", 0.55);
  };
  P.hull_dark = function (x, S, r) {
    hull(x, S, r, "#2a2826", 0.5);
    K.stains(x, 0, 0, S, S, 10, 3301, 0.35, [70, 60, 30]);
  };
  P.hull_red = function (x, S, r) {
    hull(x, S, r, "#8e2a20", 0.45);
    chips(x, S, r, 50, [150, 140, 120], 0.35); // primer
  };

  P.deck = function (x, S, r) {
    const n = 10,
      w = S / n;
    for (let i = 0; i < n; i++) {
      const v = 0.8 + r() * 0.3;
      x.fillStyle = rgba(122 * v, 116 * v, 104 * v, 1);
      x.fillRect(i * w, 0, w, S);
      for (let k = 0; k < 16; k++) {
        x.strokeStyle = rgba(70, 64, 56, 0.25 + r() * 0.2);
        x.lineWidth = 1;
        x.beginPath();
        const px = i * w + 3 + r() * (w - 6);
        x.moveTo(px, 0);
        x.bezierCurveTo(
          px + (r() - 0.5) * 8,
          S * 0.3,
          px + (r() - 0.5) * 8,
          S * 0.7,
          px,
          S,
        );
        x.stroke();
      }
      x.fillStyle = "rgba(15,12,10,0.85)";
      x.fillRect(i * w, 0, 3, S); // gap
      for (let k = 0; k < 3; k++) {
        const py = ((k + 0.5) * S) / 3 + (r() - 0.5) * 20;
        x.fillStyle = "rgba(20,16,12,0.7)";
        x.fillRect(i * w + 3, py, w - 3, 2);
        x.fillStyle = "rgba(120,70,40,0.8)";
        x.fillRect(i * w + 7, py - 2, 3, 3);
        x.fillRect(i * w + w - 9, py - 2, 3, 3);
      }
    }
    K.stains(x, 0, 0, S, S, 22, 3401, 0.45, [30, 34, 26]);
    // guano / salt bloom
    for (let i = 0; i < 90; i++) {
      x.fillStyle = rgba(225, 222, 205, 0.3 + r() * 0.3);
      x.beginPath();
      x.arc(r() * S, r() * S, 1 + r() * 3, 0, 6.3);
      x.fill();
    }
    K.grain(x, 0, 0, S, S, 20, 3402);
  };

  P.shutter = function (x, S, r) {
    // two leaves of riveted iron plate, green paint flaking to red-brown rust
    x.fillStyle = "#3f5a44";
    x.fillRect(0, 0, S, S);
    for (let i = 0; i < 40; i++) {
      const px = r() * S,
        py = r() * S,
        rad = 10 + r() * 60,
        g = x.createRadialGradient(px, py, 0, px, py, rad);
      g.addColorStop(0, "rgba(90,120,90,0.25)");
      g.addColorStop(1, "rgba(90,120,90,0)");
      x.fillStyle = g;
      x.fillRect(px - rad, py - rad, rad * 2, rad * 2);
    }
    chips(x, S, r, 140, [118, 58, 30], 0.8);
    chips(x, S, r, 40, [70, 40, 26], 0.7);
    x.fillStyle = "rgba(15,12,10,0.8)";
    x.fillRect(S / 2 - 2, 0, 4, S); // meeting stile
    x.strokeStyle = "rgba(20,24,18,0.7)";
    x.lineWidth = 5;
    x.strokeRect(4, 4, S - 8, S - 8);
    for (const yy of [S * 0.18, S * 0.5, S * 0.82]) {
      x.fillStyle = "rgba(25,28,22,0.75)";
      x.fillRect(8, yy - 5, S - 16, 10);
    } // strap hinges / bars
    for (let px = 10; px < S; px += 14)
      for (const yy of [8, S - 8, S * 0.5]) {
        x.fillStyle = "rgba(20,20,16,0.6)";
        x.beginPath();
        x.arc(px, yy, 2.2, 0, 6.3);
        x.fill();
      }
    bleed(x, S, r, S * 0.18, 20, 0.5);
    bleed(x, S, r, S * 0.5, 20, 0.5);
    K.grain(x, 0, 0, S, S, 20, 3501);
  };

  P.pressed = function (x, S, r) {
    // green-painted pressed-metal panel with an egg-and-dart border and a central cartouche (Battery Maritime style)
    x.fillStyle = "#4c6e58";
    x.fillRect(0, 0, S, S);
    const c = S / 2;
    for (let j = 0; j < 2; j++)
      for (let i = 0; i < 2; i++) {
        const X = i * c,
          Y = j * c;
        x.fillStyle = "#3c5a47";
        x.fillRect(X + 10, Y + 10, c - 20, c - 20);
        x.strokeStyle = "#6f9179";
        x.lineWidth = 4;
        x.strokeRect(X + 14, Y + 14, c - 28, c - 28);
        x.strokeStyle = "#2a3e32";
        x.lineWidth = 2;
        x.strokeRect(X + 20, Y + 20, c - 40, c - 40);
        // egg-and-dart along the top of each panel
        for (let k = 0; k < 8; k++) {
          x.fillStyle = "#6a8c74";
          x.beginPath();
          x.ellipse(X + 24 + (k * (c - 48)) / 7, Y + 30, 6, 9, 0, 0, 6.3);
          x.fill();
        }
        // cartouche
        x.fillStyle = "#58806a";
        x.beginPath();
        x.ellipse(X + c / 2, Y + c * 0.58, c * 0.2, c * 0.14, 0, 0, 6.3);
        x.fill();
        x.strokeStyle = "#2a3e32";
        x.lineWidth = 3;
        x.stroke();
      }
    chips(x, S, r, 90, [120, 70, 40], 0.6);
    K.streaks(x, 0, 0, S, S, 40, 3601, 0.35);
    bleed(x, S, r, 12, 16, 0.4);
    bleed(x, S, r, S / 2 + 12, 16, 0.4);
    K.grain(x, 0, 0, S, S, 16, 3602);
  };

  P.slime = function (x, S, r) {
    x.fillStyle = "#2a2a1c";
    x.fillRect(0, 0, S, S);
    for (let i = 0; i < 80; i++) {
      const px = r() * S,
        py = r() * S,
        rad = 10 + r() * 60,
        g = x.createRadialGradient(px, py, 0, px, py, rad);
      const c = r() < 0.5 ? "70,86,40" : "40,34,24";
      g.addColorStop(0, "rgba(" + c + ",0.7)");
      g.addColorStop(1, "rgba(" + c + ",0)");
      x.fillStyle = g;
      x.fillRect(px - rad, py - rad, rad * 2, rad * 2);
    }
    for (let i = 0; i < 400; i++) {
      x.fillStyle =
        r() < 0.5 ? "rgba(200,190,160,0.5)" : "rgba(120,150,80,0.45)";
      x.fillRect(r() * S, r() * S, 1 + r() * 3, 1 + r() * 2);
    } // shell grit, weed
    for (let i = 0; i < 40; i++) {
      x.fillStyle = "rgba(210,230,190,0.35)";
      x.beginPath();
      x.arc(r() * S, r() * S, 1 + r() * 2.5, 0, 6.3);
      x.fill();
    } // wet highlights
  };

  P.glaze = function (x, S, r) {
    const rows = 8,
      h = S / rows,
      w = S / 4;
    x.fillStyle = "#7a7466";
    x.fillRect(0, 0, S, S);
    for (let j = 0; j < rows; j++)
      for (let i = -1; i < 5; i++) {
        const v = 0.9 + r() * 0.12,
          px = i * w + ((j % 2) * w) / 2;
        const g = x.createLinearGradient(0, j * h, 0, j * h + h);
        g.addColorStop(0, rgba(236 * v, 226 * v, 196 * v, 1));
        g.addColorStop(1, rgba(212 * v, 200 * v, 168 * v, 1));
        x.fillStyle = g;
        x.fillRect(px + 2, j * h + 2, w - 4, h - 4);
        x.fillStyle = "rgba(255,255,255,0.25)";
        x.fillRect(px + 4, j * h + 3, w - 8, 2);
      }
    x.strokeStyle = "rgba(60,50,40,0.5)";
    x.lineWidth = 0.8;
    for (let i = 0; i < 14; i++) {
      x.beginPath();
      let px = r() * S,
        py = r() * S;
      x.moveTo(px, py);
      for (let k = 0; k < 4; k++) {
        px += (r() - 0.5) * 50;
        py += r() * 40;
        x.lineTo(px, py);
      }
      x.stroke();
    }
    K.stains(x, 0, 0, S, S, 16, 3701, 0.45, [70, 55, 30]);
    K.streaks(x, 0, 0, S, S, 24, 3702, 0.3);
  };

