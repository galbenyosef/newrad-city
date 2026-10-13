// play-inline-441 01 — ctx
// Lines 14-314 of readable/play-inline-441.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  const U = G.util;
  const X = G.props._;

  const AW = 2048,
    AH = 2048;
  const REGIONS = {};
  const ORDER = []; // [name, w, h, painter]

  // ---------- font stacks ----------
  const F_BOLD =
    '"Oswald", "Impact", "Arial Black", "Helvetica Neue", sans-serif';
  const F_SCRIPT =
    '"Brush Script MT", "Segoe Script", "Comic Sans MS", cursive';
  const F_MONO = '"VT323", "Share Tech Mono", "Courier New", monospace';
  const F_SERIF = '"Special Elite", "Georgia", "Times New Roman", serif';

  function txt(ctx, s, x, y, size, color, o) {
    o = o || {};
    ctx.save();
    ctx.font = (o.weight || "bold") + " " + size + "px " + (o.font || F_BOLD);
    ctx.textAlign = o.align || "center";
    ctx.textBaseline = o.base || "middle";
    if (o.maxW) {
      const m = ctx.measureText(s).width;
      if (m > o.maxW) {
        ctx.translate(x, y);
        ctx.scale(o.maxW / m, 1);
        x = 0;
        y = 0;
      }
    }
    if (o.stroke) {
      ctx.lineWidth = o.strokeW || Math.max(2, size / 10);
      ctx.strokeStyle = o.stroke;
      ctx.lineJoin = "round";
      ctx.strokeText(s, x, y);
    }
    if (o.shadow) {
      ctx.fillStyle = o.shadow;
      ctx.fillText(s, x + size * 0.06, y + size * 0.06);
    }
    ctx.fillStyle = color;
    ctx.fillText(s, x, y);
    ctx.restore();
  }
  function rrect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
  /** Weathering: grime vignette, speckle, scratches, faded tone, torn corner. */
  function weather(ctx, w, h, r, amt, opts) {
    opts = opts || {};
    amt = amt === undefined ? 0.5 : amt;
    // fade toward a dusty tone
    ctx.fillStyle = "rgba(190,175,140," + 0.12 * amt + ")";
    ctx.fillRect(0, 0, w, h);
    // edge grime
    const g = ctx.createRadialGradient(
      w / 2,
      h / 2,
      Math.min(w, h) * 0.25,
      w / 2,
      h / 2,
      Math.max(w, h) * 0.75,
    );
    g.addColorStop(0, "rgba(40,30,15,0)");
    g.addColorStop(1, "rgba(40,30,15," + 0.55 * amt + ")");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    // speckle
    const n = (((w * h) / 60) * amt) | 0;
    for (let i = 0; i < n; i++) {
      ctx.fillStyle =
        "rgba(" +
        (r() < 0.6 ? "30,22,12" : "230,220,200") +
        "," +
        (0.1 + r() * 0.25) +
        ")";
      ctx.fillRect(r() * w, r() * h, 1 + r() * 1.5, 1 + r() * 1.5);
    }
    // drips
    for (let i = 0; i < 8 * amt; i++) {
      const x = r() * w,
        y0 = r() * h * 0.5,
        len = h * (0.1 + r() * 0.5);
      const gr = ctx.createLinearGradient(0, y0, 0, y0 + len);
      gr.addColorStop(0, "rgba(50,35,15,0.25)");
      gr.addColorStop(1, "rgba(50,35,15,0)");
      ctx.fillStyle = gr;
      ctx.fillRect(x, y0, 1 + r() * 3, len);
    }
    // scratches
    ctx.strokeStyle = "rgba(240,230,210," + 0.25 * amt + ")";
    ctx.lineWidth = 1;
    for (let i = 0; i < 10 * amt; i++) {
      ctx.beginPath();
      const x = r() * w,
        y = r() * h;
      ctx.moveTo(x, y);
      ctx.lineTo(x + (r() - 0.5) * w * 0.3, y + (r() - 0.5) * h * 0.1);
      ctx.stroke();
    }
    if (opts.torn) {
      // torn corner (paper)
      ctx.fillStyle = opts.tornColor || "#3a3328";
      ctx.beginPath();
      const c = w * (0.15 + r() * 0.2);
      ctx.moveTo(w, h);
      ctx.lineTo(w - c, h);
      for (let k = 0; k < 5; k++)
        ctx.lineTo(w - c + (c * k) / 5 + r() * 6, h - (c * k) / 5 - r() * 6);
      ctx.lineTo(w, h - c);
      ctx.closePath();
      ctx.fill();
    }
  }
  function trefoil(ctx, cx, cy, r, bg, fg) {
    ctx.save();
    ctx.translate(cx, cy);
    if (bg) {
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.arc(0, 0, r * 1.15, 0, X.TAU);
      ctx.fill();
    }
    ctx.fillStyle = fg || "#111";
    for (let k = 0; k < 3; k++) {
      const a = -Math.PI / 2 + (k * X.TAU) / 3;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a - 0.5) * r * 0.28, Math.sin(a - 0.5) * r * 0.28);
      ctx.arc(0, 0, r, a - 0.5, a + 0.5);
      ctx.arc(0, 0, r * 0.28, a + 0.5, a - 0.5, true);
      ctx.fill();
    }
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.18, 0, X.TAU);
    ctx.fill();
    ctx.restore();
  }
  /** Fizzo bottle (2D): tall, straight-sided and ribbed, a long neck, crown cap and a paper label band. */
  function fizzoBottle(ctx, cx, cy, s, glass, label) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(s, s);
    ctx.fillStyle = glass || "#4a140c";
    ctx.beginPath();
    ctx.moveTo(-5, -70);
    ctx.lineTo(5, -70);
    ctx.lineTo(6, -40);
    ctx.quadraticCurveTo(15, -32, 15, -16);
    ctx.lineTo(15, 60);
    ctx.quadraticCurveTo(15, 64, 11, 64);
    ctx.lineTo(-11, 64);
    ctx.quadraticCurveTo(-15, 64, -15, 60);
    ctx.lineTo(-15, -16);
    ctx.quadraticCurveTo(-15, -32, -6, -40);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.22)";
    ctx.lineWidth = 1.5; // moulded ribs
    for (let y = 22; y < 60; y += 6) {
      ctx.beginPath();
      ctx.moveTo(-14, y);
      ctx.lineTo(14, y);
      ctx.stroke();
    }
    ctx.strokeStyle = "rgba(255,255,255,0.4)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-9, -12);
    ctx.lineTo(-9, 56);
    ctx.stroke();
    ctx.fillStyle = label || "#f4ecd8";
    ctx.fillRect(-15, -8, 30, 24);
    ctx.fillStyle = "#c0141a";
    ctx.fillRect(-15, 10, 30, 4);
    ctx.fillStyle = "#b01018";
    ctx.font = "italic bold 11px " + F_BOLD;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Fizzo", 0, 2);
    ctx.fillStyle = "#d8d4c8";
    ctx.fillRect(-7, -76, 14, 7);
    ctx.restore();
  }
  /** The Fizzo wordmark: heavy slanted letters with a trail of rising bubbles. */
  function fizzoMark(ctx, x, y, size, color, o) {
    o = o || {};
    txt(
      ctx,
      "Fizzo",
      x,
      y,
      size,
      color,
      Object.assign({ weight: "italic bold" }, o),
    );
    ctx.save();
    ctx.fillStyle = o.bubble || color;
    ctx.globalAlpha = 0.85;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.arc(
        x + size * (1.0 + i * 0.13),
        y - size * (0.3 + i * 0.2),
        size * (0.075 - i * 0.012),
        0,
        X.TAU,
      );
      ctx.fill();
    }
    ctx.restore();
  }
  /** Office of Civil Defense mark (the public enrolment drive; Project Long Winter itself was secret): a six-armed snowflake inside a ring. */
  function winterMark(ctx, cx, cy, r, fg, bg) {
    ctx.save();
    ctx.translate(cx, cy);
    if (bg) {
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, X.TAU);
      ctx.fill();
    }
    ctx.strokeStyle = fg;
    ctx.lineCap = "round";
    ctx.lineWidth = Math.max(2, r * 0.1);
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.9, 0, X.TAU);
    ctx.stroke();
    ctx.lineWidth = Math.max(2, r * 0.09);
    for (let k = 0; k < 6; k++) {
      const a = (k * Math.PI) / 3,
        ca = Math.cos(a),
        sa = Math.sin(a);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(ca * r * 0.68, sa * r * 0.68);
      ctx.stroke();
      const bx = ca * r * 0.42,
        by = sa * r * 0.42;
      for (const s of [-1, 1]) {
        const b = a + s * 0.7;
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(bx + Math.cos(b) * r * 0.2, by + Math.sin(b) * r * 0.2);
        ctx.stroke();
      }
    }
    ctx.restore();
  }
  /** Sun-ray burst behind a product (posters, billboards). */
  function rays(ctx, cx, cy, n, len, col) {
    ctx.save();
    ctx.fillStyle = col;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * X.TAU,
        b = a + Math.PI / n;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(a) * len, cy + Math.sin(a) * len);
      ctx.lineTo(cx + Math.cos(b) * len, cy + Math.sin(b) * len);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }
  function stencil(ctx, s, x, y, size, color) {
    txt(ctx, s, x, y, size, color, {
      font: '"Courier New", monospace',
      weight: "bold",
    });
  }

  // ---------- region definitions ----------
  function R(name, w, h, painter) {
    ORDER.push([name, w, h, painter]);
  }

  R("white", 32, 32, (c, w, h) => {
    c.fillStyle = "#fff";
    c.fillRect(0, 0, w, h);
  });
  R("dark", 16, 16, (c, w, h) => {
    c.fillStyle = "#222";
    c.fillRect(0, 0, w, h);
  });

  // Fizzo Cola machine door: white enamel under a red crown panel, a glass window of racked bottles,
  // a red selection column with square push buttons, the delivery flap. Variant b pushes Fizzo Blue.
