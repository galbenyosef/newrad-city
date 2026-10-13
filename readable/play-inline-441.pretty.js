/* src/props/10_atlas.js */
/* =====================================================================
 * props / 10_atlas.js — the PROPS SIGNAGE ATLAS.
 * One 2048x2048 canvas holding every printed face used on props:
 * Fizzo Cola machine fronts, the Civil Defense recruiting kiosk,
 * newspaper boxes, posters, crate stencils, licence plates, Big Apple
 * Motor Cab / police livery, truck & bus ads, the Forever Franks cart, the amber teletype screen and its printout,
 * hazard labels, shop signs, raider graffiti...
 * All art is original, drawn procedurally with 2D canvas primitives,
 * then weathered (fade, grime, scratches, torn corners).
 * Also: fallback billboard textures when the textures module is absent.
 * ===================================================================== */
(function () {
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
  function fizzoFront(c, w, h, r, variant) {
    c.fillStyle = "#ece6d6";
    c.fillRect(0, 0, w, h);
    c.fillStyle = "#c8191e";
    c.fillRect(0, 0, w, 112);
    c.beginPath();
    c.moveTo(0, 112);
    c.bezierCurveTo(w * 0.35, 142, w * 0.62, 96, w, 124);
    c.lineTo(w, 110);
    c.lineTo(0, 110);
    c.closePath();
    c.fill();
    fizzoMark(c, w / 2 - 18, 52, 60, "#fff", {
      stroke: "#6a0a0c",
      strokeW: 3,
      maxW: w - 80,
    });
    txt(
      c,
      variant ? "NOW IN FIZZO BLUE!" : "FIZZ UP, AMERICA!",
      w / 2,
      96,
      17,
      "#fff4d8",
      { maxW: w - 40 },
    );
    const wx = 16,
      wy = 146,
      ww = w - 80,
      wh = 272;
    c.fillStyle = "#16100c";
    rrect(c, wx, wy, ww, wh, 6);
    c.fill();
    for (let s = 0; s < 4; s++) {
      const sy = wy + 62 + s * 66;
      for (let i = 0; i < 5; i++)
        fizzoBottle(
          c,
          wx + 18 + i * 34,
          sy - 28,
          0.42,
          variant && (i + s) % 3 === 1 ? "#1a70a0" : "#4a140c",
        );
      c.fillStyle = "#9a968c";
      c.fillRect(wx + 4, sy + 2, ww - 8, 4);
    }
    const gg = c.createLinearGradient(wx, wy, wx + ww, wy + wh);
    gg.addColorStop(0, "rgba(255,255,255,0.22)");
    gg.addColorStop(0.4, "rgba(255,255,255,0.02)");
    gg.addColorStop(1, "rgba(255,255,255,0.1)");
    c.fillStyle = gg;
    c.fillRect(wx, wy, ww, wh);
    c.strokeStyle = "#b8b4aa";
    c.lineWidth = 5;
    rrect(c, wx, wy, ww, wh, 6);
    c.stroke();
    const px = w - 56;
    c.fillStyle = "#c8191e";
    c.fillRect(px, wy, 44, wh);
    c.fillStyle = "#1a1a18";
    c.fillRect(px + 16, wy + 14, 12, 28);
    for (let i = 0; i < 6; i++) {
      c.fillStyle = "#f0ece0";
      c.fillRect(px + 8, wy + 60 + i * 30, 28, 20);
      c.fillStyle = variant && i === 2 ? "#1a70a0" : "#8a1014";
      c.fillRect(px + 12, wy + 64 + i * 30, 20, 12);
    }
    txt(c, "10¢", px + 22, wy + wh - 18, 16, "#fff4d8");
    c.fillStyle = "#121210";
    rrect(c, 36, 438, w - 72, 46, 6);
    c.fill();
    txt(c, "LIFT FLAP", w / 2, 498, 12, "#6a0a0c");
    weather(c, w, h, r, 0.8);
  }
  R("fizzo_front", 256, 512, (c, w, h, r) => fizzoFront(c, w, h, r, 0));
  R("fizzo_front_b", 256, 512, (c, w, h, r) => fizzoFront(c, w, h, r, 1));

  // Office of Civil Defense recruiting kiosk (Project Long Winter): grey-white enamel with orange bands
  R("ocd_kiosk", 256, 512, (c, w, h, r) => {
    c.fillStyle = "#d8d6cc";
    c.fillRect(0, 0, w, h);
    c.fillStyle = "#e0702a";
    c.fillRect(0, 0, w, 12);
    c.fillRect(0, 98, w, 8);
    c.fillRect(0, h - 44, w, 44);
    winterMark(c, 46, 56, 32, "#e0702a");
    txt(c, "OFFICE OF", 156, 34, 18, "#2a2a28", { maxW: 176 });
    txt(c, "CIVIL DEFENSE", 156, 60, 24, "#2a2a28", { maxW: 176 });
    txt(c, "RECRUITING STATION", 156, 84, 13, "#6a4a2a", { maxW: 176 });
    c.fillStyle = "#120a02";
    rrect(c, 24, 118, w - 48, 170, 10);
    c.fill();
    c.strokeStyle = "#8a8a80";
    c.lineWidth = 6;
    c.stroke();
    [
      "OFFICE OF CIVIL DEFENSE",
      "SHELTER INFORMATION",
      "",
      "> KNOW YOUR SHELTER",
      "> CARRY YOUR CARD",
      "> ENROLMENT: OPEN",
    ].forEach((l, i) =>
      txt(c, l, 38, 144 + i * 24, 17, "#ffb347", {
        font: F_MONO,
        weight: "normal",
        align: "left",
        maxW: w - 76,
      }),
    );
    // the cryo capsule, drawn like a technical illustration (no figures)
    c.save();
    c.translate(w / 2, 384);
    c.strokeStyle = "#3a3a36";
    c.lineWidth = 4;
    c.fillStyle = "#eeeeea";
    rrect(c, -40, -70, 80, 140, 38);
    c.fill();
    c.stroke();
    c.fillStyle = "#9ab8c8";
    rrect(c, -24, -52, 48, 70, 20);
    c.fill();
    c.stroke();
    c.strokeStyle = "#e0702a";
    c.lineWidth = 6;
    c.beginPath();
    c.moveTo(-40, 34);
    c.lineTo(40, 34);
    c.stroke();
    c.strokeStyle = "rgba(255,255,255,0.8)";
    c.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      c.beginPath();
      c.moveTo(-18 + i * 10, -46);
      c.lineTo(-8 + i * 10, -20);
      c.stroke();
    }
    c.restore();
    txt(c, "SERVE · SLEEP · SURVIVE", w / 2, h - 22, 16, "#fff", {
      maxW: w - 20,
    });
    weather(c, w, h, r, 0.9);
  });

  // Newspaper boxes (three mastheads; The First Journal is the city's big daily). [top line, masthead, box colour, headline, slogan]
  const PAPERS = [
    [
      "THE FIRST",
      "JOURNAL",
      "#1e3a66",
      "PARIS RECALLS ENVOY",
      "You heard it here first.",
    ],
    ["DAILY", "ATOM", "#3a6ab0", "RATIONING EXPANDS"],
    ["NEW YORK", "COURIER", "#b03a2a", "RED SCARE: 3 HELD"],
  ];
  PAPERS.forEach((p, i) =>
    R("news_" + i, 128, 160, (c, w, h, r) => {
      c.fillStyle = p[2];
      c.fillRect(0, 0, w, h);
      c.fillStyle = "#f0ead8";
      c.fillRect(8, 8, w - 16, 36);
      txt(c, p[0], w / 2, 18, 11, "#222", { maxW: w - 20 });
      txt(c, p[1], w / 2, 34, 17, "#111", { font: F_SERIF, maxW: w - 20 });
      // window with folded newspaper
      c.fillStyle = "#2a2a26";
      c.fillRect(10, 52, w - 20, 74);
      c.fillStyle = "#d8d0b8";
      c.fillRect(18, 58, w - 36, 64);
      txt(c, p[3], w / 2, 70, 10, "#111", { font: F_SERIF, maxW: w - 44 });
      for (let k = 0; k < (p[4] ? 4 : 6); k++) {
        c.fillStyle = "rgba(40,40,40,0.5)";
        c.fillRect(22, 82 + k * 6, w - 44, 2);
      }
      if (p[4])
        txt(c, p[4], w / 2, 112, 9, "#1e3a66", {
          font: F_SERIF,
          weight: "italic bold",
          maxW: w - 40,
        });
      c.fillStyle = "rgba(200,220,220,0.18)";
      c.fillRect(10, 52, w - 20, 74);
      c.fillStyle = "#222";
      c.fillRect(w / 2 - 14, 134, 28, 8);
      txt(c, "10¢", w / 2, 152, 12, "#f0ead8");
      weather(c, w, h, r, 0.8);
    }),
  );

  // ---------- Posters ----------
  const posterBase = (c, w, h, bg) => {
    c.fillStyle = bg;
    c.fillRect(0, 0, w, h);
    c.strokeStyle = "rgba(0,0,0,0.3)";
    c.lineWidth = 6;
    c.strokeRect(6, 6, w - 12, h - 12);
  };
  R("poster_longwinter", 192, 288, (c, w, h, r) => {
    posterBase(c, w, h, "#e6e2d6");
    c.fillStyle = "#e0702a";
    c.fillRect(0, 0, w, 64);
    txt(c, "ENROL NOW", w / 2, 24, 28, "#fff", { maxW: w - 20 });
    txt(c, "CIVIL DEFENSE 1967", w / 2, 50, 16, "#2a2a28", { maxW: w - 20 });
    winterMark(c, w / 2, 146, 62, "#3a5a7a", "#dfe8ee");
    txt(c, "YOUR CARD IS YOUR RATION", w / 2, 232, 14, "#2a2a28", {
      maxW: w - 20,
    });
    txt(c, "Office of Civil Defense", w / 2, 260, 14, "#8a3a10", {
      font: F_SERIF,
      weight: "normal",
      maxW: w - 20,
    });
    weather(c, w, h, r, 0.9, { torn: true });
  });
  R("poster_fizzo", 192, 288, (c, w, h, r) => {
    posterBase(c, w, h, "#c01a1e");
    rays(c, w / 2, 150, 14, 170, "rgba(255,230,190,0.16)");
    fizzoBottle(c, w / 2, 150, 1.2, "#3a0c08");
    fizzoMark(c, w / 2 - 14, 36, 44, "#fff", {
      stroke: "#6a0a0c",
      maxW: w - 60,
    });
    txt(c, "FIZZ UP, AMERICA!", w / 2, 248, 19, "#fff4d8", {
      stroke: "#6a0a0c",
      maxW: w - 20,
    });
    weather(c, w, h, r, 0.9, { torn: true });
  });
  R("poster_fizzo_blue", 192, 288, (c, w, h, r) => {
    posterBase(c, w, h, "#0c2a4a");
    rays(c, w / 2, 150, 18, 200, "rgba(110,210,255,0.14)");
    fizzoBottle(c, w / 2, 150, 1.2, "#1a8ad0", "#e8f8ff");
    txt(c, "FIZZO BLUE", w / 2, 34, 32, "#8ae8ff", {
      stroke: "#082040",
      maxW: w - 20,
    });
    txt(c, "THE ELECTRIC REFRESHER!", w / 2, 238, 14, "#e8f8ff", {
      maxW: w - 20,
    });
    txt(c, "Now with extra sparkle", w / 2, 262, 14, "#8ae8ff", {
      font: F_SCRIPT,
      weight: "normal",
      maxW: w - 20,
    });
    weather(c, w, h, r, 0.8, { torn: true });
  });
  R("poster_wanted", 192, 288, (c, w, h, r) => {
    posterBase(c, w, h, "#d8c8a0");
    txt(c, "WANTED", w / 2, 34, 40, "#2a1a10", { font: F_SERIF });
    c.fillStyle = "#6a5a44";
    c.fillRect(36, 60, w - 72, 110);
    c.fillStyle = "#2a2018";
    c.beginPath();
    c.ellipse(w / 2, 110, 28, 34, 0, 0, X.TAU);
    c.fill();
    c.fillRect(w / 2 - 40, 140, 80, 30);
    txt(c, '"MAD DOG" MALONE', w / 2, 190, 16, "#2a1a10", {
      font: F_SERIF,
      maxW: w - 24,
    });
    txt(c, "RAIDER · MURDERER", w / 2, 212, 12, "#5a2a10", { font: F_SERIF });
    txt(c, "REWARD", w / 2, 238, 20, "#8a1a10", { font: F_SERIF });
    txt(c, "500 SCRIP", w / 2, 262, 22, "#2a1a10", { font: F_SERIF });
    weather(c, w, h, r, 1.0, { torn: true });
  });
  R("poster_missing", 192, 288, (c, w, h, r) => {
    posterBase(c, w, h, "#ece6d6");
    txt(c, "MISSING", w / 2, 34, 34, "#111", { font: F_SERIF });
    c.fillStyle = "#9a9488";
    c.fillRect(40, 60, w - 80, 100);
    c.fillStyle = "#5a564c";
    c.beginPath();
    c.ellipse(w / 2, 100, 22, 26, 0, 0, X.TAU);
    c.fill();
    c.fillRect(w / 2 - 30, 124, 60, 36);
    [
      "Have you seen our boy",
      "TOMMY? Age 9. Last seen",
      "at 42nd St station",
      "Mar 5. Please — ANY",
      "news. Apt 4C, W 51st.",
    ].forEach((l, i) =>
      txt(c, l, w / 2, 180 + i * 18, 12, "#222", {
        font: F_SERIF,
        weight: "normal",
        maxW: w - 24,
      }),
    );
    weather(c, w, h, r, 1.0, { torn: true });
  });
  R("poster_neighbor", 192, 288, (c, w, h, r) => {
    posterBase(c, w, h, "#e0d4b0");
    c.fillStyle = "#b01010";
    c.beginPath();
    c.moveTo(0, 0);
    c.lineTo(w, 0);
    c.lineTo(w, 140);
    c.lineTo(0, 190);
    c.closePath();
    c.fill();
    c.fillStyle = "#2a0a08";
    c.beginPath();
    c.moveTo(20, 170);
    c.quadraticCurveTo(w / 2, 20, w - 20, 120);
    c.lineTo(w - 20, 150);
    c.quadraticCurveTo(w / 2, 70, 20, 190);
    c.fill();
    txt(c, "IS YOUR NEIGHBOR", w / 2, 212, 15, "#2a1a10", { maxW: w - 16 });
    txt(c, "A COMMUNIST?", w / 2, 238, 24, "#b01010", { maxW: w - 16 });
    txt(c, "Report suspicious activity!", w / 2, 264, 12, "#2a1a10", {
      font: F_SERIF,
      weight: "normal",
    });
    weather(c, w, h, r, 0.9, { torn: true });
  });
  // American Automaton Co. ad for the Valet household robot
  R("poster_automaton", 192, 288, (c, w, h, r) => {
    posterBase(c, w, h, "#dfe6e8");
    c.fillStyle = "#1a3a4a";
    c.fillRect(0, 0, w, 30);
    txt(c, "AMERICAN AUTOMATON CO.", w / 2, 16, 12, "#f0ead8", {
      maxW: w - 24,
    });
    // the household robot: square head with a lamp visor on a column body, two jointed arms carrying a tray, wheeled base
    const cx = w / 2;
    c.fillStyle = "#8a9498";
    c.strokeStyle = "#2a3034";
    c.lineWidth = 3;
    c.fillRect(cx - 22, 44, 44, 32);
    c.strokeRect(cx - 22, 44, 44, 32);
    c.fillStyle = "#ffd890";
    c.fillRect(cx - 16, 54, 32, 8);
    c.fillStyle = "#b8c0c4";
    c.fillRect(cx - 28, 82, 56, 80);
    c.strokeRect(cx - 28, 82, 56, 80);
    c.fillStyle = "#2a3034";
    for (let i = 0; i < 4; i++) c.fillRect(cx - 18, 94 + i * 10, 36, 3);
    c.beginPath();
    c.moveTo(cx - 28, 94);
    c.lineTo(cx - 52, 120);
    c.lineTo(cx - 30, 140);
    c.moveTo(cx + 28, 94);
    c.lineTo(cx + 52, 120);
    c.lineTo(cx + 30, 140);
    c.stroke();
    c.fillStyle = "#d8d4c8";
    c.fillRect(cx - 40, 136, 80, 6);
    c.strokeRect(cx - 40, 136, 80, 6);
    c.fillStyle = "#5a6064";
    c.fillRect(cx - 34, 162, 68, 18);
    c.fillStyle = "#1a1a18";
    for (const dx of [-24, 0, 24]) {
      c.beginPath();
      c.arc(cx + dx, 186, 8, 0, X.TAU);
      c.fill();
    }
    txt(c, "THE VALET", w / 2, 212, 28, "#1a3a4a", { maxW: w - 20 });
    txt(c, "Built in America, to serve America.", w / 2, 236, 13, "#8a2a1a", {
      font: F_SCRIPT,
      weight: "normal",
      maxW: w - 20,
    });
    txt(
      c,
      "It keeps the house. You keep the evening.",
      w / 2,
      256,
      10,
      "#2a3a44",
      { font: F_SERIF, weight: "italic", maxW: w - 76 },
    );
    weather(c, w, h, r, 0.8, { torn: true });
  });
  // Super Sergeant (Bowery Comics): a square-jawed sergeant in olive drab, steel helmet and sleeve chevrons
  R("poster_sergeant", 192, 288, (c, w, h, r) => {
    posterBase(c, w, h, "#f0d040");
    // speed lines behind the hero
    c.save();
    c.strokeStyle = "rgba(200,40,30,0.35)";
    c.lineWidth = 3;
    for (let i = 0; i < 22; i++) {
      const a = (i / 22) * X.TAU;
      c.beginPath();
      c.moveTo(w / 2 + Math.cos(a) * 30, 140 + Math.sin(a) * 30);
      c.lineTo(w / 2 + Math.cos(a) * 160, 140 + Math.sin(a) * 160);
      c.stroke();
    }
    c.restore();
    c.fillStyle = "#b8261c";
    c.fillRect(0, 0, w, 56);
    txt(c, "SUPER", w / 2, 16, 16, "#fff4d8", {
      stroke: "#4a0a06",
      maxW: w - 20,
    });
    txt(c, "SERGEANT", w / 2, 40, 30, "#fff4d8", {
      stroke: "#4a0a06",
      maxW: w - 16,
    });
    const cx = w / 2;
    // shoulders and chest in olive drab, a sleeve with three chevrons on each side
    c.fillStyle = "#5a6234";
    c.beginPath();
    c.moveTo(cx - 70, 206);
    c.quadraticCurveTo(cx - 66, 160, cx - 26, 152);
    c.lineTo(cx + 26, 152);
    c.quadraticCurveTo(cx + 66, 160, cx + 70, 206);
    c.closePath();
    c.fill();
    c.strokeStyle = "#2e3218";
    c.lineWidth = 2;
    c.stroke();
    c.strokeStyle = "#e8c040";
    c.lineWidth = 3;
    for (const s of [-1, 1])
      for (let k = 0; k < 3; k++) {
        const y = 168 + k * 7;
        c.beginPath();
        c.moveTo(cx + s * 44, y);
        c.lineTo(cx + s * 53, y + 7);
        c.lineTo(cx + s * 62, y);
        c.stroke();
      }
    c.fillStyle = "#4a5028";
    c.fillRect(cx - 8, 152, 16, 24); // collar
    // the head: a broad square jaw
    c.fillStyle = "#e0a878";
    c.beginPath();
    c.moveTo(cx - 26, 100);
    c.lineTo(cx + 26, 100);
    c.lineTo(cx + 25, 136);
    c.lineTo(cx + 15, 152);
    c.lineTo(cx - 15, 152);
    c.lineTo(cx - 25, 136);
    c.closePath();
    c.fill();
    c.strokeStyle = "#5a2a14";
    c.lineWidth = 2;
    c.stroke();
    c.fillStyle = "#2a1a10";
    c.fillRect(cx - 15, 114, 9, 3);
    c.fillRect(cx + 6, 114, 9, 3); // eyes under a set brow
    c.fillRect(cx - 17, 108, 13, 3);
    c.fillRect(cx + 4, 108, 13, 3);
    c.beginPath();
    c.moveTo(cx, 117);
    c.lineTo(cx - 3, 130);
    c.lineTo(cx + 2, 130);
    c.stroke(); // nose
    c.fillRect(cx - 9, 139, 18, 2); // firm mouth
    c.beginPath();
    c.moveTo(cx - 2, 146);
    c.lineTo(cx + 2, 146);
    c.stroke(); // cleft chin
    // steel helmet with a brim and chin strap
    c.fillStyle = "#626a3a";
    c.beginPath();
    c.ellipse(cx, 102, 34, 30, 0, Math.PI, 0);
    c.fill();
    c.fillStyle = "#4e5530";
    c.beginPath();
    c.ellipse(cx, 102, 40, 6, 0, 0, X.TAU);
    c.fill();
    c.strokeStyle = "#3a3018";
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(cx - 27, 104);
    c.lineTo(cx - 20, 144);
    c.moveTo(cx + 27, 104);
    c.lineTo(cx + 20, 144);
    c.stroke();
    txt(c, "America's finest fighting man!", w / 2, 226, 14, "#b8261c", {
      font: F_SCRIPT,
      weight: "normal",
      maxW: w - 16,
    });
    c.fillStyle = "#1a1a18";
    c.fillRect(0, 244, w, 44);
    txt(c, "BOWERY COMICS · 12¢", w / 2, 264, 14, "#f0d040", { maxW: w - 20 });
    weather(c, w, h, r, 0.9, { torn: true });
  });
  // civic poster: the peaceful atom (cooling tower under a rising sun)
  R("poster_atom", 192, 288, (c, w, h, r) => {
    posterBase(c, w, h, "#1a2a3a");
    c.fillStyle = "#ffb040";
    c.beginPath();
    c.arc(w / 2, 130, 46, Math.PI, 0);
    c.fill();
    rays(c, w / 2, 130, 12, 120, "rgba(255,200,90,0.15)");
    c.fillStyle = "#c8ccd0";
    c.beginPath();
    c.moveTo(w / 2 - 44, 190);
    c.quadraticCurveTo(w / 2 - 24, 140, w / 2 - 30, 96);
    c.lineTo(w / 2 + 30, 96);
    c.quadraticCurveTo(w / 2 + 24, 140, w / 2 + 44, 190);
    c.closePath();
    c.fill();
    c.fillStyle = "rgba(240,240,240,0.7)";
    c.beginPath();
    c.ellipse(w / 2 + 6, 84, 30, 12, 0, 0, X.TAU);
    c.fill();
    c.fillStyle = "#0e1822";
    c.fillRect(0, 186, w, 6);
    txt(c, "THE PEACEFUL ATOM", w / 2, 212, 19, "#ffd040", { maxW: w - 20 });
    txt(c, "Power for a growing city", w / 2, 238, 14, "#e8e0d0", {
      font: F_SCRIPT,
      weight: "normal",
    });
    txt(c, "CITY OF NEW YORK · 1966", w / 2, 264, 11, "#8ad0ff", {
      maxW: w - 20,
    });
    weather(c, w, h, r, 0.8, { torn: true });
  });
  // Freedom Flakes cereal (Brooklyn Sugar Works)
  R("poster_flakes", 192, 288, (c, w, h, r) => {
    posterBase(c, w, h, "#1e3f86");
    rays(c, w / 2, 150, 16, 170, "rgba(255,255,255,0.08)");
    // the box: red-and-white striped top band over a cream panel
    c.fillStyle = "#f6eedc";
    c.fillRect(46, 52, w - 92, 132);
    for (let i = 0; i < 6; i++) {
      c.fillStyle = i % 2 ? "#f6eedc" : "#c42a22";
      c.fillRect(46, 52 + i * 5, w - 92, 5);
    }
    txt(c, "FREEDOM", w / 2, 98, 18, "#1e3f86", { maxW: w - 104 });
    txt(c, "FLAKES", w / 2, 118, 18, "#c42a22", { maxW: w - 104 });
    // a bowl of golden flakes
    c.fillStyle = "#e8e4d8";
    c.beginPath();
    c.ellipse(w / 2, 156, 36, 16, 0, 0, Math.PI);
    c.fill();
    for (let i = 0; i < 14; i++) {
      c.save();
      c.translate(
        w / 2 - 28 + (i % 7) * 9.5,
        150 - ((i / 7) | 0) * 6 + Math.sin(i * 1.7) * 2,
      );
      c.rotate(i * 0.9);
      c.fillStyle = ["#e8a848", "#d89030", "#f0c060"][i % 3];
      c.beginPath();
      c.ellipse(0, 0, 6, 3.5, 0, 0, X.TAU);
      c.fill();
      c.restore();
    }
    txt(c, "FREEDOM FLAKES", w / 2, 28, 24, "#fff4d8", {
      stroke: "#7a1410",
      maxW: w - 16,
    });
    txt(c, "The breakfast of a free nation.", w / 2, 214, 15, "#fff", {
      font: F_SCRIPT,
      weight: "normal",
      maxW: w - 16,
    });
    txt(c, "Toasted golden in Brooklyn", w / 2, 240, 12, "#e0ecff", {
      maxW: w - 20,
    });
    txt(c, "BROOKLYN SUGAR WORKS", w / 2, 262, 10, "#f0d040", { maxW: w - 20 });
    weather(c, w, h, r, 0.8, { torn: true });
  });
  R("poster_protest", 192, 288, (c, w, h, r) => {
    posterBase(c, w, h, "#e8e4dc");
    c.fillStyle = "#111";
    txt(c, "NO MORE", w / 2, 60, 38, "#111", { font: F_SERIF });
    txt(c, "WAR!", w / 2, 120, 64, "#a01010", { font: F_SERIF });
    c.strokeStyle = "#111";
    c.lineWidth = 5;
    c.beginPath();
    c.arc(w / 2, 200, 40, 0, X.TAU);
    c.moveTo(w / 2, 160);
    c.lineTo(w / 2, 240);
    c.moveTo(w / 2, 200);
    c.lineTo(w / 2 - 28, 228);
    c.moveTo(w / 2, 200);
    c.lineTo(w / 2 + 28, 228);
    c.stroke();
    txt(c, "RALLY · CITY HALL · SUNDAY", w / 2, 266, 11, "#111");
    weather(c, w, h, r, 1.0, { torn: true });
  });
  X.POSTERS = [
    "poster_longwinter",
    "poster_fizzo",
    "poster_fizzo_blue",
    "poster_wanted",
    "poster_missing",
    "poster_neighbor",
    "poster_automaton",
    "poster_sergeant",
    "poster_atom",
    "poster_flakes",
    "poster_protest",
  ];

  // ---------- Crate stencils ----------
  R("crate_fizzo", 128, 128, (c, w, h, r) => {
    woodFace(c, w, h, r);
    stencil(c, "FIZZO COLA", w / 2, 44, 18, "rgba(160,20,20,0.85)");
    stencil(c, "24 BTL", w / 2, 70, 18, "rgba(30,20,10,0.8)");
    stencil(c, "THIS SIDE UP ↑", w / 2, 100, 11, "rgba(30,20,10,0.7)");
    weather(c, w, h, r, 0.5);
  });
  R("crate_teletype", 128, 128, (c, w, h, r) => {
    woodFace(c, w, h, r);
    stencil(c, "HALCYON", w / 2, 44, 22, "rgba(20,40,80,0.85)");
    stencil(c, "TELEPRINTER", w / 2, 70, 13, "rgba(20,40,80,0.8)");
    stencil(c, "FRAGILE", w / 2, 100, 16, "rgba(160,30,20,0.8)");
    weather(c, w, h, r, 0.5);
  });
  R("crate_army", 128, 128, (c, w, h, r) => {
    c.fillStyle = "#56603e";
    c.fillRect(0, 0, w, h);
    woodLines(c, w, h, r, "rgba(0,0,0,0.25)");
    stencil(c, "U.S. ARMY", w / 2, 44, 20, "rgba(230,225,200,0.85)");
    stencil(c, "AMMUNITION", w / 2, 70, 14, "rgba(230,225,200,0.8)");
    stencil(c, "LOT 67-0419-B", w / 2, 96, 11, "rgba(230,225,200,0.7)");
    weather(c, w, h, r, 0.6);
  });
  R("crate_longwinter", 128, 128, (c, w, h, r) => {
    woodFace(c, w, h, r);
    winterMark(c, 38, 64, 22, "rgba(200,90,30,0.9)");
    stencil(c, "CIVIL", 90, 44, 17, "rgba(40,40,36,0.85)");
    stencil(c, "DEFENSE", 90, 64, 15, "rgba(40,40,36,0.85)");
    stencil(c, "O.C.D.", 90, 86, 14, "rgba(200,90,30,0.85)");
    weather(c, w, h, r, 0.5);
  });
  R("crate_plain", 128, 128, (c, w, h, r) => {
    woodFace(c, w, h, r);
    stencil(c, "NYC PORT AUTH.", w / 2, 60, 12, "rgba(30,20,10,0.6)");
    weather(c, w, h, r, 0.6);
  });
  function woodLines(c, w, h, r, col) {
    c.strokeStyle = col;
    for (let k = 1; k < 4; k++) {
      c.beginPath();
      c.moveTo(0, (k * h) / 4);
      c.lineTo(w, (k * h) / 4);
      c.stroke();
    }
  }
  function woodFace(c, w, h, r) {
    c.fillStyle = "#a88258";
    c.fillRect(0, 0, w, h);
    for (let i = 0; i < 40; i++) {
      c.strokeStyle = "rgba(70,45,20," + (0.08 + r() * 0.12) + ")";
      c.beginPath();
      const y = r() * h;
      c.moveTo(0, y);
      c.lineTo(w, y + (r() - 0.5) * 6);
      c.stroke();
    }
    woodLines(c, w, h, r, "rgba(40,25,10,0.5)");
    c.strokeStyle = "rgba(50,32,15,0.9)";
    c.lineWidth = 10;
    c.strokeRect(5, 5, w - 10, h - 10);
    c.lineWidth = 8;
    c.beginPath();
    c.moveTo(8, 8);
    c.lineTo(w - 8, h - 8);
    c.stroke();
    c.fillStyle = "#b89268";
    c.fillRect(14, 14, w - 28, h - 28);
    for (let i = 0; i < 20; i++) {
      c.strokeStyle = "rgba(70,45,20," + (0.08 + r() * 0.12) + ")";
      c.beginPath();
      const y = 14 + r() * (h - 28);
      c.moveTo(14, y);
      c.lineTo(w - 14, y);
      c.stroke();
    }
  }

  // ---------- vehicle livery ----------
  R("plate", 64, 32, (c, w, h, r) => {
    c.fillStyle = "#e8c850";
    c.fillRect(0, 0, w, h);
    c.strokeStyle = "#222";
    c.lineWidth = 2;
    c.strokeRect(2, 2, w - 4, h - 4);
    txt(c, "NEW YORK", w / 2, 8, 7, "#1a2a60");
    txt(c, 100 + ((r() * 899) | 0) + "-RAD", w / 2, 21, 12, "#1a2a60", {
      font: '"Courier New", monospace',
    });
    weather(c, w, h, r, 0.8);
  });
  /** Big Apple Motor Cab roundel: a red apple with a leaf on a cream disc. */
  function appleMark(ctx, cx, cy, rr) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.fillStyle = "#f4ecd8";
    ctx.beginPath();
    ctx.arc(0, 0, rr, 0, X.TAU);
    ctx.fill();
    ctx.strokeStyle = "#151515";
    ctx.lineWidth = Math.max(1.5, rr * 0.1);
    ctx.stroke();
    const a = rr * 0.62;
    ctx.fillStyle = "#c8201a";
    ctx.beginPath();
    ctx.moveTo(0, -a * 0.55);
    ctx.bezierCurveTo(
      a * 0.6,
      -a * 1.0,
      a * 1.15,
      -a * 0.3,
      a * 0.85,
      a * 0.45,
    );
    ctx.bezierCurveTo(a * 0.65, a * 1.0, a * 0.2, a * 1.0, 0, a * 0.85);
    ctx.bezierCurveTo(
      -a * 0.2,
      a * 1.0,
      -a * 0.65,
      a * 1.0,
      -a * 0.85,
      a * 0.45,
    );
    ctx.bezierCurveTo(-a * 1.15, -a * 0.3, -a * 0.6, -a * 1.0, 0, -a * 0.55);
    ctx.fill();
    ctx.strokeStyle = "#4a2a10";
    ctx.lineWidth = Math.max(1, rr * 0.08);
    ctx.beginPath();
    ctx.moveTo(0, -a * 0.5);
    ctx.lineTo(a * 0.1, -a * 0.95);
    ctx.stroke();
    ctx.fillStyle = "#3a8a2a";
    ctx.beginPath();
    ctx.ellipse(a * 0.35, -a * 0.85, a * 0.28, a * 0.12, -0.5, 0, X.TAU);
    ctx.fill();
    ctx.restore();
  }
  // Big Apple Motor Cab: roof sign, door panel and the checker stripe
  R("taxi_sign", 128, 48, (c, w, h, r) => {
    c.fillStyle = "#e8c030";
    c.fillRect(0, 0, w, h);
    c.strokeStyle = "#151515";
    c.lineWidth = 3;
    c.strokeRect(2, 2, w - 4, h - 4);
    appleMark(c, 22, h / 2, 16);
    txt(c, "BIG APPLE", 82, h / 2 + 1, 22, "#111", { maxW: 80 });
    weather(c, w, h, r, 0.8);
  });
  R("taxi_door", 256, 60, (c, w, h, r) => {
    c.fillStyle = "#e0b020";
    c.fillRect(0, 0, w, h);
    appleMark(c, 30, h / 2, 24);
    txt(c, "BIG APPLE MOTOR CAB", 150, 20, 20, "#151515", { maxW: 186 });
    txt(c, "Just get in already!", 150, 44, 16, "#8a1a10", {
      font: F_SCRIPT,
      weight: "normal",
      maxW: 180,
    });
    weather(c, w, h, r, 0.6);
  });
  R("taxi_stripe", 256, 32, (c, w, h) => {
    c.fillStyle = "#e0b828";
    c.fillRect(0, 0, w, h);
    for (let x = 0; x < w; x += 16)
      for (let y = 0; y < 2; y++) {
        if ((x / 16 + y) % 2) {
          c.fillStyle = "#151515";
          c.fillRect(x, 6 + y * 10, 16, 10);
        }
      }
  });
  R("police_door", 256, 96, (c, w, h, r) => {
    c.fillStyle = "#f0ece0";
    c.fillRect(0, 0, w, h);
    c.fillStyle = "#1a2a50";
    c.beginPath();
    c.moveTo(20, 10);
    c.lineTo(60, 10);
    c.lineTo(60, 60);
    c.quadraticCurveTo(40, 86, 20, 60);
    c.closePath();
    c.fill();
    txt(c, "★", 40, 36, 24, "#e8c040");
    txt(c, "POLICE", 158, 40, 40, "#1a2a50");
    txt(c, "N.Y.P.D.  CAR 467", 158, 76, 14, "#1a2a50");
    weather(c, w, h, r, 0.7);
  });
  R("fizzo_truck", 512, 160, (c, w, h, r) => {
    const g = c.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#d01a20");
    g.addColorStop(1, "#8a1014");
    c.fillStyle = g;
    c.fillRect(0, 0, w, h);
    c.fillStyle = "#f4ecd8";
    c.beginPath();
    c.moveTo(0, 110);
    c.bezierCurveTo(150, 60, 330, 170, w, 100);
    c.lineTo(w, 130);
    c.bezierCurveTo(330, 190, 150, 90, 0, 140);
    c.fill();
    fizzoMark(c, 200, 58, 80, "#fff", { stroke: "#5a0808", strokeW: 5 });
    fizzoBottle(c, 448, 70, 0.95, "#3a0c08");
    txt(
      c,
      "DELIVERY · REACH FOR AN ICE COLD FIZZO!",
      w / 2,
      150,
      14,
      "#fff4d8",
      { maxW: w - 30 },
    );
    weather(c, w, h, r, 0.9);
  });
  R("bus_ad_0", 512, 96, (c, w, h, r) => {
    c.fillStyle = "#dcdad0";
    c.fillRect(0, 0, w, h);
    c.fillStyle = "#e0702a";
    c.fillRect(0, 0, w, 10);
    c.fillRect(0, h - 10, w, 10);
    winterMark(c, 52, h / 2, 34, "#e0702a");
    txt(c, "CIVIL DEFENSE ENROLMENT", 290, 38, 36, "#2a2a28", { maxW: 400 });
    txt(
      c,
      "Know your shelter. Carry your card.  — Office of Civil Defense",
      290,
      70,
      15,
      "#5a3a1a",
      { maxW: 400 },
    );
    weather(c, w, h, r, 0.9);
  });
  R("bus_ad_1", 512, 96, (c, w, h, r) => {
    c.fillStyle = "#ead8a8";
    c.fillRect(0, 0, w, h);
    c.fillStyle = "#7a3a18";
    c.fillRect(0, 0, 150, h);
    txt(c, "Prairie", 75, 38, 40, "#f4e4b8", { font: F_SCRIPT });
    txt(c, "ROOT BEER", 75, 74, 18, "#f4e4b8");
    txt(c, "OLD-TIME FLAVOR, POURED COLD.", 330, 48, 20, "#5a2a10", {
      maxW: 340,
    });
    weather(c, w, h, r, 0.9);
  });
  R("bus_ad_2", 512, 96, (c, w, h, r) => {
    c.fillStyle = "#f0e8d0";
    c.fillRect(0, 0, w, h);
    c.fillStyle = "#2a4a6a";
    c.fillRect(0, 0, 150, h);
    txt(c, "HALCYON", 75, 46, 30, "#ffd890");
    txt(c, "TELEPRINTERS — EVERY OFFICE ON THE WIRE", 330, 36, 16, "#222", {
      maxW: 340,
    });
    txt(c, "Clack, clack, connected. Ask your dealer.", 330, 66, 14, "#555", {
      maxW: 340,
    });
    weather(c, w, h, r, 0.9);
  });
  R("bus_ad_3", 512, 96, (c, w, h, r) => {
    // Liberty Jetliner
    c.fillStyle = "#f2eee2";
    c.fillRect(0, 0, w, h);
    c.fillStyle = "#1c2f5c";
    c.fillRect(0, 0, 160, h);
    c.fillStyle = "#b8261c";
    c.fillRect(160, h - 14, w - 160, 6);
    c.fillRect(160, h - 24, w - 160, 4);
    c.save();
    c.translate(80, 34);
    c.fillStyle = "#f2eee2";
    c.fillRect(-46, -4, 92, 8);
    c.beginPath();
    c.moveTo(-8, 0);
    c.lineTo(12, -24);
    c.lineTo(20, -24);
    c.lineTo(12, 0);
    c.lineTo(20, 24);
    c.lineTo(12, 24);
    c.closePath();
    c.fill();
    c.beginPath();
    c.moveTo(-46, 0);
    c.lineTo(-52, -14);
    c.lineTo(-44, -14);
    c.lineTo(-36, 0);
    c.fill();
    c.restore();
    txt(c, "LIBERTY JETLINER", 80, 74, 17, "#f2eee2", { maxW: 148 });
    txt(c, "Fly the flag. Fly Liberty.", 336, 36, 30, "#1c2f5c", {
      font: F_SCRIPT,
      weight: "normal",
      maxW: 330,
    });
    txt(
      c,
      "NONSTOP JET SERVICE · IDLEWILD TO THE WORLD",
      336,
      64,
      13,
      "#3a3a3a",
      { maxW: 330 },
    );
    weather(c, w, h, r, 0.9);
  });
  R("bus_ad_4", 512, 96, (c, w, h, r) => {
    // Silver Torch cigarettes
    const g = c.createLinearGradient(0, 0, w, 0);
    g.addColorStop(0, "#1a2a3a");
    g.addColorStop(1, "#3a4a5a");
    c.fillStyle = g;
    c.fillRect(0, 0, w, h);
    c.save();
    c.translate(56, h / 2);
    c.fillStyle = "#c8ccd0";
    c.fillRect(-6, -8, 12, 40);
    c.fillStyle = "#9aa0a8";
    c.fillRect(-12, -14, 24, 8);
    c.fillStyle = "#ffd070";
    c.beginPath();
    c.moveTo(0, -40);
    c.quadraticCurveTo(14, -24, 8, -14);
    c.lineTo(-8, -14);
    c.quadraticCurveTo(-14, -24, 0, -40);
    c.fill();
    c.restore();
    txt(c, "SILVER TORCH", 270, 36, 36, "#e8eaee", {
      maxW: 360,
      stroke: "rgba(0,0,0,0.4)",
    });
    txt(c, "Light up like the lady in the harbor.", 270, 70, 18, "#d8c890", {
      font: F_SCRIPT,
      weight: "normal",
      maxW: 360,
    });
    weather(c, w, h, r, 0.9);
  });
  X.BUS_ADS = 5;
  R("bus_dest", 256, 40, (c, w, h) => {
    c.fillStyle = "#111";
    c.fillRect(0, 0, w, h);
    txt(c, "M42  CROSSTOWN", w / 2, h / 2, 24, "#f0c040", {
      font: F_MONO,
      weight: "normal",
    });
  });

  // ---------- street furniture faces ----------
  R("mailbox", 128, 128, (c, w, h, r) => {
    c.fillStyle = "#23457a";
    c.fillRect(0, 0, w, h);
    txt(c, "U.S. MAIL", w / 2, 24, 22, "#f0ece0");
    c.fillStyle = "#f0ece0";
    c.beginPath();
    c.moveTo(w / 2, 44);
    c.lineTo(w / 2 + 26, 62);
    c.lineTo(w / 2 + 16, 92);
    c.lineTo(w / 2 - 16, 92);
    c.lineTo(w / 2 - 26, 62);
    c.closePath();
    c.fill();
    c.fillStyle = "#23457a";
    c.beginPath();
    c.arc(w / 2, 68, 8, 0, X.TAU);
    c.fill();
    txt(c, "POSTAL SERVICE", w / 2, 110, 11, "#f0ece0");
    weather(c, w, h, r, 0.9);
  });
  R("phone_sign", 256, 40, (c, w, h, r) => {
    c.fillStyle = "#e8e0cc";
    c.fillRect(0, 0, w, h);
    txt(c, "PUBLIC TELEPHONE", w / 2, h / 2, 24, "#1a3a8a");
    weather(c, w, h, r, 0.7);
  });
  R("bus_stop", 96, 128, (c, w, h, r) => {
    c.fillStyle = "#f0ece0";
    c.fillRect(0, 0, w, h);
    c.fillStyle = "#1a4a9a";
    c.fillRect(0, 0, w, 44);
    txt(c, "BUS", w / 2, 22, 28, "#fff");
    txt(c, "STOP", w / 2, 66, 26, "#1a4a9a");
    txt(c, "M42 · M5", w / 2, 100, 16, "#222");
    weather(c, w, h, r, 0.8);
  });
  R("no_parking", 64, 96, (c, w, h, r) => {
    c.fillStyle = "#f0ece0";
    c.fillRect(0, 0, w, h);
    c.strokeStyle = "#c01a1a";
    c.lineWidth = 5;
    c.beginPath();
    c.arc(w / 2, 34, 22, 0, X.TAU);
    c.moveTo(w / 2 - 16, 18);
    c.lineTo(w / 2 + 16, 50);
    c.stroke();
    txt(c, "P", w / 2, 34, 24, "#111");
    txt(c, "NO PARKING", w / 2, 72, 9, "#c01a1a");
    txt(c, "ANY TIME", w / 2, 86, 9, "#111");
    weather(c, w, h, r, 0.8);
  });

  // ---------- terminals / electronics ----------
  R("term_screen", 160, 120, (c, w, h) => {
    c.fillStyle = "#120a02";
    c.fillRect(0, 0, w, h);
    const g = c.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w * 0.7);
    g.addColorStop(0, "rgba(255,170,60,0.16)");
    g.addColorStop(1, "rgba(0,0,0,0.5)");
    c.fillStyle = g;
    c.fillRect(0, 0, w, h);
    const lines = [
      "HALCYON TELEPRINTER 9",
      "OCD TELETYPE NET",
      "",
      "> READY",
      "> _",
    ];
    lines.forEach((l, i) =>
      txt(c, l, 8, 14 + i * 18, 15, "#ffb347", {
        font: F_MONO,
        weight: "normal",
        align: "left",
        maxW: w - 14,
      }),
    );
    for (let y = 0; y < h; y += 3) {
      c.fillStyle = "rgba(0,0,0,0.25)";
      c.fillRect(0, y, w, 1);
    }
  });
  // continuous-feed printout curling out of the teletype carriage (pale bars, typed lines)
  R("printout", 128, 192, (c, w, h, r) => {
    c.fillStyle = "#ece6d4";
    c.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 24) {
      c.fillStyle = "rgba(200,170,120,0.25)";
      c.fillRect(0, y, w, 12);
    }
    c.fillStyle = "#bdb6a2";
    for (let y = 6; y < h; y += 12) {
      c.beginPath();
      c.arc(5, y, 2, 0, X.TAU);
      c.fill();
      c.beginPath();
      c.arc(w - 5, y, 2, 0, X.TAU);
      c.fill();
    }
    const L = [
      "OCD TELETYPE NET",
      "MSG 0412  PRIORITY",
      "TO: ALL STATIONS",
      "",
      "CONDITION RED",
      "REPEAT CONDITION",
      "RED. SEAL ALL",
      "SHELTERS. NO",
      "FURTHER TRAFFIC",
      "",
      "END END END",
    ];
    L.forEach((l, i) =>
      txt(c, l, 14, 12 + i * 16, 11, "#2a2620", {
        font: '"Courier New", monospace',
        weight: "bold",
        align: "left",
        maxW: w - 26,
      }),
    );
    weather(c, w, h, r, 0.5);
  });
  R("teletype_badge", 128, 28, (c, w, h, r) => {
    c.fillStyle = "#b8b09a";
    c.fillRect(0, 0, w, h);
    c.strokeStyle = "#3a3628";
    c.lineWidth = 2;
    c.strokeRect(2, 2, w - 4, h - 4);
    txt(c, "HALCYON · OCD", w / 2, h / 2 + 1, 16, "#2a2620", {
      font: F_SERIF,
      maxW: w - 10,
    });
    weather(c, w, h, r, 0.5);
  });
  R("radio_dial", 128, 48, (c, w, h) => {
    c.fillStyle = "#e8d8a0";
    c.fillRect(0, 0, w, h);
    c.strokeStyle = "#5a4a2a";
    for (let k = 0; k < 24; k++) {
      c.beginPath();
      c.moveTo(8 + k * 5, 26);
      c.lineTo(8 + k * 5, k % 4 ? 32 : 36);
      c.stroke();
    }
    txt(c, "55  70  90  110  140  170", w / 2, 14, 10, "#5a4a2a");
    c.fillStyle = "#c01a1a";
    c.fillRect(64, 20, 2, 22);
  });
  R("safe_dial", 64, 64, (c, w, h) => {
    c.fillStyle = "#3a3a38";
    c.fillRect(0, 0, w, h);
    c.fillStyle = "#c8c4b8";
    c.beginPath();
    c.arc(w / 2, h / 2, 26, 0, X.TAU);
    c.fill();
    c.fillStyle = "#2a2a28";
    c.beginPath();
    c.arc(w / 2, h / 2, 14, 0, X.TAU);
    c.fill();
    for (let k = 0; k < 20; k++) {
      const a = (k / 20) * X.TAU;
      c.strokeStyle = "#222";
      c.beginPath();
      c.moveTo(w / 2 + Math.cos(a) * 18, h / 2 + Math.sin(a) * 18);
      c.lineTo(w / 2 + Math.cos(a) * 25, h / 2 + Math.sin(a) * 25);
      c.stroke();
    }
  });

  // ---------- hazard labels ----------
  R("rad_label", 128, 128, (c, w, h, r) => {
    c.fillStyle = "#d8b020";
    c.fillRect(0, 0, w, h);
    trefoil(c, w / 2, 56, 36, null, "#1a1a1a");
    txt(c, "RADIOACTIVE", w / 2, 108, 15, "#1a1a1a");
    weather(c, w, h, r, 0.9);
  });
  R("flam_label", 128, 128, (c, w, h, r) => {
    c.fillStyle = "#b81a14";
    c.fillRect(0, 0, w, h);
    c.fillStyle = "#f0ece0";
    c.beginPath();
    c.moveTo(w / 2, 20);
    c.quadraticCurveTo(w / 2 + 30, 50, w / 2 + 18, 80);
    c.quadraticCurveTo(w / 2, 92, w / 2 - 18, 80);
    c.quadraticCurveTo(w / 2 - 30, 50, w / 2, 20);
    c.fill();
    txt(c, "FLAMMABLE", w / 2, 108, 16, "#f0ece0");
    weather(c, w, h, r, 0.9);
  });
  R("firstaid", 64, 64, (c, w, h, r) => {
    c.fillStyle = "#ece8dc";
    c.fillRect(0, 0, w, h);
    c.fillStyle = "#c01818";
    c.fillRect(24, 10, 16, 44);
    c.fillRect(10, 24, 44, 16);
    weather(c, w, h, r, 0.7);
  });
  R("ammo_stencil", 128, 64, (c, w, h, r) => {
    c.fillStyle = "#4e5838";
    c.fillRect(0, 0, w, h);
    stencil(c, "CARTRIDGES", w / 2, 20, 14, "#e8e0c0");
    stencil(c, "10MM · 5.56MM", w / 2, 40, 12, "#e8e0c0");
    c.fillStyle = "#e8c030";
    c.fillRect(8, 52, w - 16, 4);
    weather(c, w, h, r, 0.7);
  });
  R("fizzo_blue_label", 64, 128, (c, w, h) => {
    c.fillStyle = "#1a90d0";
    c.fillRect(0, 0, w, h);
    c.fillStyle = "#fff";
    c.fillRect(4, 48, w - 8, 34);
    txt(c, "Fizzo", w / 2, 58, 13, "#c01018", { weight: "italic bold" });
    txt(c, "BLUE", w / 2, 74, 12, "#1a60a0");
  });
  R("longwinter_logo", 128, 128, (c, w, h, r) => {
    c.fillStyle = "#d8d6cc";
    c.fillRect(0, 0, w, h);
    winterMark(c, w / 2, h / 2 - 10, 42, "#e0702a");
    txt(c, "CIVIL DEFENSE", w / 2, h - 14, 15, "#2a2a28", { maxW: w - 10 });
    weather(c, w, h, r, 0.4);
  });
  R("grate", 128, 128, (c, w, h) => {
    c.fillStyle = "#0a0a0a";
    c.fillRect(0, 0, w, h);
    c.fillStyle = "#5a5850";
    for (let x = 0; x < w; x += 10) c.fillRect(x, 0, 4, h);
    for (let y = 0; y < h; y += 32) c.fillRect(0, y, w, 4);
    c.strokeStyle = "#6a5a4a";
    c.lineWidth = 6;
    c.strokeRect(0, 0, w, h);
  });
  // yellowed, water-stained newsprint (kept dull so litter never reads as bright confetti)
  R("paper", 64, 64, (c, w, h, r) => {
    c.fillStyle = "#9a9078";
    c.fillRect(0, 0, w, h);
    // a sheet of The First Journal: masthead, rule, EXTRA! banner, columns
    txt(c, "THE FIRST JOURNAL", w / 2, 7, 7, "#2a2620", {
      font: F_SERIF,
      maxW: w - 8,
    });
    c.fillStyle = "rgba(40,36,30,0.7)";
    c.fillRect(4, 12, w - 8, 1);
    txt(c, "EXTRA!", w / 2, 18, 9, "#2a2620", { font: F_SERIF });
    for (let k = 0; k < 6; k++) {
      c.fillStyle = "rgba(40,36,30,0.55)";
      c.fillRect(6, 26 + k * 6, w - 12 - (k % 3) * 8, 2);
    }
    c.fillStyle = "rgba(60,50,40,0.5)";
    c.fillRect(8, 26, 18, 14); // photo
    for (let i = 0; i < 4; i++) {
      const g = c.createRadialGradient(
        r() * w,
        r() * h,
        1,
        r() * w,
        r() * h,
        10 + r() * 16,
      );
      g.addColorStop(0, "rgba(90,70,40,0.35)");
      g.addColorStop(1, "rgba(90,70,40,0)");
      c.fillStyle = g;
      c.fillRect(0, 0, w, h);
    }
    weather(c, w, h, r, 1.0);
  });
  // ---------- grocery product labels (shop shelves) ----------
  const PRODUCTS = [
    ["FREEDOM", "FLAKES", "#1e3f86", "#f6eedc", "box"],
    ["CHOCOLATE", "ZEPPELIN", "#5a3420", "#e8e4dc", "box"],
    ["MAMA", "MARINARA'S", "#c42a1e", "#f6ead0", "can"],
    ["GOLDEN PLAIN", "JERKY", "#d8a838", "#4a2410", "box"],
    ["FRANKS &", "BEANS", "#8a3a1a", "#f0e0b0", "can"],
    ["FRANK-IN-", "A-BUN", "#c8281e", "#f0d040", "box"],
    ["HOMEGUARD", "CLEANSER", "#e8e4d8", "#1a3a6a", "can"],
    ["ASTRONAUT", "ICE CREAM", "#b8bcc4", "#1a2a5a", "box"],
    ["EMPIRE BREW", "LAGER", "#1a3a2a", "#e8c860", "can"],
  ];
  PRODUCTS.forEach((pd, i) =>
    R("prod_" + i, 48, 64, (c, w, h, r) => {
      c.fillStyle = pd[2];
      c.fillRect(0, 0, w, h);
      if (pd[4] === "can") {
        c.fillStyle = "rgba(255,255,255,0.18)";
        c.fillRect(0, 6, w, 3);
        c.fillRect(0, h - 9, w, 3);
      } else {
        c.fillStyle = "rgba(0,0,0,0.15)";
        c.fillRect(0, h - 14, w, 14);
        c.beginPath();
        c.fillStyle = "rgba(255,255,255,0.25)";
        c.arc(w * 0.7, h * 0.7, 9, 0, X.TAU);
        c.fill();
      }
      txt(c, pd[0], w / 2, 18, 12, pd[3], { maxW: w - 6 });
      if (pd[1]) txt(c, pd[1], w / 2, 34, 9, pd[3], { maxW: w - 6 });
      weather(c, w, h, r, 0.8);
    }),
  );
  X.PRODUCTS = PRODUCTS.map((p) => p[4]);
  // in-store signage
  R("sign_checkout", 192, 48, (c, w, h, r) => {
    c.fillStyle = "#b82a1e";
    c.fillRect(0, 0, w, h);
    c.strokeStyle = "#f0e0c0";
    c.lineWidth = 3;
    c.strokeRect(4, 4, w - 8, h - 8);
    txt(c, "CHECKOUT", w / 2, h / 2 + 1, 28, "#f6ecd0");
    weather(c, w, h, r, 0.9);
  });
  R("sign_sale", 128, 96, (c, w, h, r) => {
    c.fillStyle = "#f0d040";
    c.fillRect(0, 0, w, h);
    txt(c, "SALE!", w / 2, 30, 34, "#c01a14", {
      stroke: "#1a1a1a",
      strokeW: 2,
    });
    txt(c, "ATOMIC", w / 2, 60, 16, "#1a1a1a");
    txt(c, "SAVINGS", w / 2, 78, 16, "#1a1a1a");
    weather(c, w, h, r, 1, { torn: true });
  });
  R("sign_prices", 128, 96, (c, w, h, r) => {
    c.fillStyle = "#e8e0c8";
    c.fillRect(0, 0, w, h);
    txt(c, "TODAY'S PRICES", w / 2, 14, 12, "#8a1a10");
    [
      "JERKY ..... 15¢",
      "FREEDOM FLAKES 25¢",
      "FIZZO COLA .. 10¢",
      "CIGARETTES .. 20¢",
    ].forEach((l, i) =>
      txt(c, l, 8, 34 + i * 16, 11, "#222", {
        align: "left",
        font: F_MONO,
        weight: "normal",
        maxW: w - 14,
      }),
    );
    weather(c, w, h, r, 1);
  });
  R("sign_open", 96, 48, (c, w, h, r) => {
    c.fillStyle = "#1a1a1a";
    c.fillRect(0, 0, w, h);
    txt(c, "CLOSED", w / 2, h / 2, 24, "#e8e0d0");
    weather(c, w, h, r, 0.8);
  });

  // ---------- signs & boards ----------
  R("board_0", 128, 192, (c, w, h, r) => {
    c.fillStyle = "#1a2a1a";
    c.fillRect(0, 0, w, h);
    c.strokeStyle = "#8a6a40";
    c.lineWidth = 10;
    c.strokeRect(0, 0, w, h);
    ["TODAY:", "MEATLOAF", "& JELL-O", "", "COFFEE 5¢", "OPEN 24H"].forEach(
      (l, i) =>
        txt(c, l, w / 2, 26 + i * 26, 18, "#e8e4d8", {
          font: F_SCRIPT,
          weight: "normal",
        }),
    );
    weather(c, w, h, r, 1);
  });
  R("board_1", 128, 192, (c, w, h, r) => {
    c.fillStyle = "#e0d8c0";
    c.fillRect(0, 0, w, h);
    c.strokeStyle = "#6a4a2a";
    c.lineWidth = 10;
    c.strokeRect(0, 0, w, h);
    txt(c, "PUBLIC", w / 2, 40, 18, "#1a1a1a");
    txt(c, "SHELTER", w / 2, 64, 18, "#1a1a1a");
    trefoil(c, w / 2, 112, 28, "#e8c030", "#1a1a1a");
    txt(c, "→ DOWNSTAIRS", w / 2, 164, 13, "#8a1a10");
    weather(c, w, h, r, 1);
  });
  R("sign_keepout", 128, 96, (c, w, h, r) => {
    c.fillStyle = "#6a5a44";
    c.fillRect(0, 0, w, h);
    txt(c, "KEEP OUT", w / 2, 30, 26, "#e8e0d0", {
      font: F_SCRIPT,
      weight: "normal",
    });
    txt(c, "OR ELSE", w / 2, 66, 22, "#b01a10", {
      font: F_SCRIPT,
      weight: "normal",
    });
    weather(c, w, h, r, 1);
  });
  R("sign_toll", 128, 96, (c, w, h, r) => {
    c.fillStyle = "#5a5044";
    c.fillRect(0, 0, w, h);
    txt(c, "TOLL", w / 2, 28, 28, "#e8d8b0", {
      font: F_SCRIPT,
      weight: "normal",
    });
    txt(c, "20 SCRIP", w / 2, 64, 24, "#e8c040", {
      font: F_SCRIPT,
      weight: "normal",
    });
    weather(c, w, h, r, 1);
  });
  R("sign_danger", 128, 96, (c, w, h, r) => {
    c.fillStyle = "#e8c030";
    c.fillRect(0, 0, w, h);
    c.fillStyle = "#111";
    c.fillRect(0, 0, w, 30);
    txt(c, "DANGER", w / 2, 15, 22, "#e8c030");
    txt(c, "RADIATION", w / 2, 52, 18, "#111");
    txt(c, "AREA", w / 2, 76, 18, "#111");
    weather(c, w, h, r, 0.9);
  });
  R("sign_restricted", 128, 96, (c, w, h, r) => {
    c.fillStyle = "#3a3a3a";
    c.fillRect(0, 0, w, h);
    c.fillStyle = "#c8b070";
    c.beginPath();
    c.moveTo(w / 2, 8);
    c.lineTo(w / 2 + 28, 36);
    c.lineTo(w / 2, 64);
    c.lineTo(w / 2 - 28, 36);
    c.closePath();
    c.fill();
    txt(c, "!", w / 2, 37, 34, "#3a3a3a");
    txt(c, "RESTRICTED", w / 2, 78, 15, "#c8b070");
    weather(c, w, h, r, 0.7);
  });
  R("sign_scrip", 128, 96, (c, w, h, r) => {
    c.fillStyle = "#6a4a2a";
    c.fillRect(0, 0, w, h);
    txt(c, "TRADE", w / 2, 30, 24, "#f0e0b0", {
      font: F_SCRIPT,
      weight: "normal",
    });
    txt(c, "SCRIP ONLY", w / 2, 66, 18, "#e8c040");
    weather(c, w, h, r, 1);
  });
  const STALLS = [
    ["JUNK & SALVAGE", "#c8a060"],
    ["CLEAN WATER", "#6ab0d0"],
    ["GUNS · AMMO", "#b05a3a"],
    ["PIGEON BITS", "#8ab050"],
    ["DOC'S CHEMS", "#d0d0d0"],
    ["FIZZO COLA", "#d03030"],
  ];
  STALLS.forEach((s, i) =>
    R("stall_" + i, 256, 64, (c, w, h, r) => {
      c.fillStyle = "#4a3a2a";
      c.fillRect(0, 0, w, h);
      c.strokeStyle = "#2a1a10";
      c.lineWidth = 6;
      c.strokeRect(0, 0, w, h);
      txt(c, s[0], w / 2, h / 2, 32, s[1], {
        font: F_SCRIPT,
        weight: "normal",
        maxW: w - 20,
      });
      weather(c, w, h, r, 1);
    }),
  );
  X.STALL_SIGNS = STALLS.length;
  const GRAF = [
    (c, w, h) => {
      txt(c, "TRESPASSERS", w / 2, 40, 34, "#c01a14", {
        font: F_SCRIPT,
        weight: "normal",
      });
      txt(c, "EAT LEAD", w / 2, 88, 40, "#c01a14", {
        font: F_SCRIPT,
        weight: "normal",
      });
    },
    (c, w, h) => {
      txt(c, "THE END IS", w / 2, 40, 30, "#e8e0d0", {
        font: F_SCRIPT,
        weight: "normal",
      });
      txt(c, "NIGH!!", w / 2, 90, 44, "#e8e0d0", {
        font: F_SCRIPT,
        weight: "normal",
      });
    },
    (c, w, h) => {
      c.strokeStyle = "#b01a14";
      c.lineWidth = 8;
      c.beginPath();
      c.arc(70, 64, 40, 0, X.TAU);
      c.stroke();
      c.beginPath();
      c.moveTo(40, 40);
      c.lineTo(100, 90);
      c.moveTo(100, 40);
      c.lineTo(40, 90);
      c.stroke();
      txt(c, "KEEP OUT", 180, 64, 32, "#b01a14", {
        font: F_SCRIPT,
        weight: "normal",
      });
    },
    (c, w, h) => {
      c.fillStyle = "#f0a020";
      c.beginPath();
      c.arc(60, 64, 26, 0, X.TAU);
      c.fill();
      rays(c, 60, 64, 12, 48, "rgba(240,160,32,0.8)");
      txt(c, "THE GLOW", 172, 50, 30, "#f0a020", {
        font: F_SCRIPT,
        weight: "normal",
      });
      txt(c, "IS HOLY", 172, 92, 30, "#f0a020", {
        font: F_SCRIPT,
        weight: "normal",
      });
    },
    (c, w, h) => {
      txt(c, "THEY WERE", w / 2, 40, 26, "#f0d040", {
        font: F_SCRIPT,
        weight: "normal",
        maxW: 240,
      });
      txt(c, "PEOPLE TOO", w / 2, 88, 32, "#f0d040", {
        font: F_SCRIPT,
        weight: "normal",
      });
    },
  ];
  GRAF.forEach((fn, i) =>
    R("graffiti_" + i, 256, 128, (c, w, h, r) => {
      c.clearRect(0, 0, w, h);
      c.fillStyle = "rgba(80,70,60,1)";
      c.fillRect(0, 0, w, h);
      fn(c, w, h);
      weather(c, w, h, r, 0.8);
    }),
  );
  X.GRAFFITI = GRAF.length;
  const CONT = [
    ["EMPIRE BREW HOUSE", "BROOKLYN, N.Y.", "#1e4a34", "#f0e0b0"],
    ["KESSLER-AMES", "ELECTRIC", "#8a3a2a", "#f0e8d0"],
    ["FIZZO COLA", "BOTTLING CO.", "#a01418", "#fff"],
    ["HI-OCTANE HARRY'S", "FUEL OIL", "#c86a20", "#fff"],
  ];
  CONT.forEach((cc, i) =>
    R("container_" + i, 256, 96, (c, w, h, r) => {
      c.fillStyle = cc[2];
      c.fillRect(0, 0, w, h);
      for (let x = 0; x < w; x += 8) {
        c.fillStyle = "rgba(0,0,0,0.18)";
        c.fillRect(x, 0, 3, h);
        c.fillStyle = "rgba(255,255,255,0.08)";
        c.fillRect(x + 4, 0, 2, h);
      }
      txt(c, cc[0], w / 2, 34, 30, cc[3], { maxW: w - 16 });
      txt(c, cc[1], w / 2, 66, 20, cc[3], { maxW: w - 16 });
      weather(c, w, h, r, 1);
    }),
  );
  X.CONTAINER_LIVERIES = CONT.length;

  // ---------- US Army vehicle markings & old-world checkpoint signs (26_ruins.js) ----------
  const OLIVE = "#4a5236";
  R("army_star", 128, 128, (c, w, h, r) => {
    c.fillStyle = OLIVE;
    c.fillRect(0, 0, w, h);
    c.strokeStyle = "#dcd6c0";
    c.lineWidth = 7;
    c.beginPath();
    c.arc(w / 2, h / 2, 54, 0, X.TAU);
    c.stroke();
    c.fillStyle = "#dcd6c0";
    c.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5,
        rr = i % 2 ? 19 : 48;
      c.lineTo(w / 2 + Math.cos(a) * rr, h / 2 + Math.sin(a) * rr);
    }
    c.closePath();
    c.fill();
    weather(c, w, h, r, 1.1);
  });
  R("army_door", 256, 64, (c, w, h, r) => {
    c.fillStyle = OLIVE;
    c.fillRect(0, 0, w, h);
    stencil(c, "U.S. ARMY", w / 2, 24, 30, "#dcd6c0");
    stencil(c, "4A-19671  2ND ID", w / 2, 50, 15, "#c8c2aa");
    weather(c, w, h, r, 1.1);
  });
  R("quarantine", 256, 160, (c, w, h, r) => {
    c.fillStyle = "#e4dcc4";
    c.fillRect(0, 0, w, h);
    for (let x = -h; x < w; x += 28) {
      c.fillStyle = "#d8a818";
      c.beginPath();
      c.moveTo(x, 0);
      c.lineTo(x + 14, 0);
      c.lineTo(x + 14 + 22, 22);
      c.lineTo(x + 22, 22);
      c.fill();
      c.fillStyle = "#1a1a18";
      c.beginPath();
      c.moveTo(x + 14, 0);
      c.lineTo(x + 28, 0);
      c.lineTo(x + 50, 22);
      c.lineTo(x + 36, 22);
      c.fill();
    }
    c.fillStyle = "#1a1a18";
    c.fillRect(0, 22, w, 3);
    c.fillRect(0, h - 25, w, 3);
    txt(c, "QUARANTINE ZONE", w / 2, 50, 30, "#a01a14", { maxW: 236 });
    txt(c, "AUTHORIZED PERSONNEL ONLY", w / 2, 80, 15, "#1a1a18", {
      maxW: 236,
    });
    txt(c, "Violators will be shot", w / 2, 102, 15, "#1a1a18", {
      font: F_SERIF,
      weight: "normal",
    });
    txt(c, "BY ORDER OF THE U.S. ARMY — MAR. 1967", w / 2, 124, 10, "#3a3a36", {
      maxW: 236,
    });
    for (let x = -h; x < w; x += 28) {
      c.fillStyle = "#d8a818";
      c.fillRect(x + 40, h - 22, 14, 22);
    }
    weather(c, w, h, r, 1.2);
  });
  R("evac_route", 128, 128, (c, w, h, r) => {
    c.fillStyle = "#1d4f8a";
    c.fillRect(0, 0, w, h);
    c.strokeStyle = "#e8e4d8";
    c.lineWidth = 4;
    c.strokeRect(6, 6, w - 12, h - 12);
    txt(c, "EVACUATION", w / 2, 28, 18, "#e8e4d8", { maxW: 108 });
    txt(c, "ROUTE", w / 2, 50, 20, "#e8e4d8");
    c.fillStyle = "#e8e4d8";
    c.beginPath();
    c.moveTo(24, 82);
    c.lineTo(78, 82);
    c.lineTo(78, 68);
    c.lineTo(106, 92);
    c.lineTo(78, 116);
    c.lineTo(78, 102);
    c.lineTo(24, 102);
    c.closePath();
    c.fill();
    weather(c, w, h, r, 1.2);
  });
  // US Army checkpoint board over the guard booth (28_military.js)
  R("checkpoint_sign", 256, 128, (c, w, h, r) => {
    c.fillStyle = "#e8e2cc";
    c.fillRect(0, 0, w, h);
    c.fillStyle = "#a01a14";
    c.fillRect(0, 0, w, 40);
    txt(c, "HALT", w / 2, 22, 30, "#f4eee0");
    txt(c, "U.S. ARMY CHECKPOINT", w / 2, 60, 20, "#1a1a18", { maxW: 236 });
    txt(c, "ALL VEHICLES STOP FOR INSPECTION", w / 2, 84, 12, "#1a1a18", {
      maxW: 236,
    });
    txt(c, "Present evacuation papers", w / 2, 104, 12, "#3a3a36", {
      font: F_SERIF,
      weight: "normal",
    });
    c.strokeStyle = "#1a1a18";
    c.lineWidth = 4;
    c.strokeRect(2, 2, w - 4, h - 4);
    weather(c, w, h, r, 1.3);
  });
  // hand-painted scavenger signs on salvaged planks
  const SCAV = [
    ["KEEP OUT", "#b01a14"],
    ["WATER 5 SCRIP", "#e8e0c8"],
    ["TRADE", "#e8c040"],
    ["DANGER RAIDERS", "#b01a14"],
    ["NO MANIACS", "#e8e0c8"],
    ["FRIENDLY", "#6ab04a"],
  ];
  SCAV.forEach((sc, i) =>
    R("scav_sign_" + i, 256, 80, (c, w, h, r) => {
      const planks = 3;
      for (let p = 0; p < planks; p++) {
        const t = (70 + r() * 40) | 0;
        c.fillStyle =
          "rgb(" + t + "," + ((t * 0.78) | 0) + "," + ((t * 0.55) | 0) + ")";
        c.fillRect(0, (p * h) / planks, w, h / planks - 2);
        c.strokeStyle = "rgba(20,12,4,0.35)";
        c.lineWidth = 1;
        for (let g = 0; g < 6; g++) {
          const y = (p * h) / planks + r() * (h / planks);
          c.beginPath();
          c.moveTo(0, y);
          c.bezierCurveTo(
            w * 0.3,
            y + r() * 4 - 2,
            w * 0.7,
            y + r() * 4 - 2,
            w,
            y,
          );
          c.stroke();
        }
        c.fillStyle = "#2a2a26";
        c.fillRect(8, (p * h) / planks + 10, 4, 4);
        c.fillRect(w - 12, (p * h) / planks + 10, 4, 4);
      }
      c.save();
      c.translate(w / 2, h / 2);
      c.rotate((r() - 0.5) * 0.08);
      txt(c, sc[0], 0, 2, 38, sc[1], {
        font: F_SCRIPT,
        weight: "bold",
        maxW: 230,
        stroke: "rgba(0,0,0,0.3)",
      });
      c.restore();
      // drips of paint under the letters
      c.fillStyle = sc[1];
      for (let d = 0; d < 7; d++) {
        c.globalAlpha = 0.7;
        c.fillRect(30 + r() * 196, 52, 2, 6 + r() * 14);
      }
      c.globalAlpha = 1;
      weather(c, w, h, r, 0.9);
    }),
  );
  X.SCAV_SIGNS = SCAV.length;

  // ---------- Hi-Octane Harry's filling station (29_filling_station.js) ----------
  /** The Hi-Octane Harry's mark: a spoked wheel with swept wings either side and a bold H on its hub. s = wheel radius. */
  function harryMark(ctx, cx, cy, s, o) {
    o = o || {};
    ctx.save();
    ctx.translate(cx, cy);
    // wings: three swept feathers each side
    ctx.fillStyle = o.wing || "#c8281e";
    for (const sd of [-1, 1])
      for (let i = 0; i < 3; i++) {
        const y0 = -s * 0.55 + i * s * 0.36,
          len = s * (1.15 - i * 0.22);
        ctx.beginPath();
        ctx.moveTo(sd * s * 0.8, y0);
        ctx.lineTo(sd * (s * 0.8 + len), y0 - s * 0.16);
        ctx.lineTo(sd * (s * 0.8 + len * 0.86), y0 + s * 0.16);
        ctx.lineTo(sd * s * 0.8, y0 + s * 0.24);
        ctx.closePath();
        ctx.fill();
      }
    // tyre, rim, spokes
    ctx.fillStyle = o.tyre || "#151515";
    ctx.beginPath();
    ctx.arc(0, 0, s, 0, X.TAU);
    ctx.fill();
    ctx.fillStyle = o.rim || "#f2e8d0";
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.78, 0, X.TAU);
    ctx.fill();
    ctx.strokeStyle = o.tyre || "#151515";
    ctx.lineWidth = Math.max(1, s * 0.08);
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * s * 0.5, Math.sin(a) * s * 0.5);
      ctx.lineTo(Math.cos(a) * s * 0.76, Math.sin(a) * s * 0.76);
      ctx.stroke();
    }
    ctx.fillStyle = o.hub || "#c8281e";
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.5, 0, X.TAU);
    ctx.fill();
    txt(ctx, "H", 0, s * 0.04, Math.round(s * 0.78), o.letter || "#f2e8d0");
    ctx.restore();
  }
  X.harryMark = harryMark;
  function checker(ctx, x, y, w, h, n) {
    const cs = h / n;
    for (let j = 0; j < n; j++)
      for (let i = 0; i * cs < w; i++) {
        ctx.fillStyle = (i + j) % 2 ? "#f2e8d0" : "#151515";
        ctx.fillRect(x + i * cs, y + j * cs, cs + 0.5, cs + 0.5);
      }
  }
  // canopy / office fascia: checker bands over a red field, the mark at both ends
  R("hioctane_fascia", 512, 64, (c, w, h, r) => {
    c.fillStyle = "#c0261c";
    c.fillRect(0, 0, w, h);
    checker(c, 0, 0, w, 10, 2);
    checker(c, 0, h - 10, w, 10, 2);
    harryMark(c, 56, h / 2, 15, { wing: "#f2e8d0" });
    harryMark(c, w - 56, h / 2, 15, { wing: "#f2e8d0" });
    txt(c, "HI-OCTANE HARRY'S", w / 2, h / 2 + 1, 34, "#f2e8d0", {
      maxW: w - 200,
      stroke: "rgba(40,0,0,0.5)",
    });
    weather(c, w, h, r, 0.9);
  });
  // plain fascia run (checker bands over red) for the rest of the canopy edge
  R("hioctane_band", 256, 32, (c, w, h, r) => {
    c.fillStyle = "#c0261c";
    c.fillRect(0, 0, w, h);
    checker(c, 0, 0, w, 6, 1);
    checker(c, 0, h - 6, w, 6, 1);
    weather(c, w, h, r, 1.0);
  });
  // tall pole sign: the mark, the name, the slogan, a checker foot
  R("hioctane_pole", 256, 320, (c, w, h, r) => {
    c.fillStyle = "#f2e8d0";
    c.fillRect(0, 0, w, h);
    c.strokeStyle = "#151515";
    c.lineWidth = 8;
    c.strokeRect(4, 4, w - 8, h - 8);
    harryMark(c, w / 2, 74, 44);
    txt(c, "HI-OCTANE", w / 2, 152, 40, "#c0261c", {
      maxW: w - 30,
      stroke: "rgba(60,0,0,0.3)",
    });
    txt(c, "HARRY'S", w / 2, 192, 38, "#151515", { maxW: w - 40 });
    txt(c, "Full service. Full tank.", w / 2, 232, 18, "#2a2a26", {
      font: F_SERIF,
      weight: "italic bold",
      maxW: w - 30,
    });
    txt(c, "Full speed ahead.", w / 2, 256, 18, "#2a2a26", {
      font: F_SERIF,
      weight: "italic bold",
      maxW: w - 30,
    });
    checker(c, 8, h - 40, w - 16, 32, 2);
    weather(c, w, h, r, 1.0);
  });
  // price board hung under the pole sign
  R("hioctane_price", 256, 96, (c, w, h, r) => {
    c.fillStyle = "#151515";
    c.fillRect(0, 0, w, h);
    c.strokeStyle = "#f2e8d0";
    c.lineWidth = 3;
    c.strokeRect(5, 5, w - 10, h - 10);
    txt(c, "HI-OCTANE  33.9¢", w / 2, 32, 24, "#ffcf40", { maxW: w - 24 });
    txt(c, "REGULAR  29.9¢", w / 2, 66, 24, "#f2e8d0", { maxW: w - 24 });
    weather(c, w, h, r, 1.0);
  });
  // pump face: name band, gallons / sale windows, the mark, grade plate
  R("hioctane_pump", 96, 160, (c, w, h, r) => {
    c.fillStyle = "#c0261c";
    c.fillRect(0, 0, w, h);
    c.fillStyle = "#f2e8d0";
    c.fillRect(0, 0, w, 26);
    txt(c, "HI-OCTANE", w / 2, 14, 15, "#151515", { maxW: w - 8 });
    c.fillStyle = "#e8e2d0";
    c.fillRect(10, 34, w - 20, 50);
    c.fillStyle = "#151515";
    c.fillRect(16, 40, w - 32, 16);
    c.fillRect(16, 62, w - 32, 16);
    txt(c, "0 0 4 . 2", w / 2, 48, 12, "#e8e2d0", {
      font: F_MONO,
      weight: "normal",
    });
    txt(c, "1 . 4 2", w / 2, 70, 12, "#e8e2d0", {
      font: F_MONO,
      weight: "normal",
    });
    harryMark(c, w / 2, 108, 14, { wing: "#f2e8d0" });
    c.fillStyle = "#f2e8d0";
    c.fillRect(14, 132, w - 28, 18);
    txt(c, "ETHYL", w / 2, 141, 12, "#c0261c");
    weather(c, w, h, r, 1.1);
  });
  // office window lettering + an oil-can label
  R("hioctane_office", 256, 48, (c, w, h, r) => {
    c.fillStyle = "#f2e8d0";
    c.fillRect(0, 0, w, h);
    checker(c, 0, 0, w, 8, 2);
    txt(c, "OFFICE · ROAD MAPS · REST ROOMS", w / 2, 29, 17, "#151515", {
      maxW: w - 16,
    });
    weather(c, w, h, r, 1.0);
  });
  R("hioctane_oil", 48, 64, (c, w, h, r) => {
    c.fillStyle = "#e8b830";
    c.fillRect(0, 0, w, h);
    c.fillStyle = "#c0261c";
    c.fillRect(0, 18, w, 26);
    harryMark(c, w / 2, 31, 8, { wing: "#151515" });
    txt(c, "MOTOR OIL", w / 2, 54, 8, "#151515", { maxW: w - 4 });
    weather(c, w, h, r, 1.0);
  });

  // ---------- street vendors, newsstands, fire alarm boxes, Army medical (27_streetlife.js) ----------
  /** The Forever Franks mascot: a cheerful frank in a top hat, waving, an hourglass in his other hand. */
  function franksMascot(c, x, y, s) {
    c.save();
    c.translate(x, y);
    c.scale(s, s);
    c.lineCap = "round";
    c.lineJoin = "round";
    // legs + shoes
    c.strokeStyle = "#2a1a10";
    c.lineWidth = 3;
    c.beginPath();
    c.moveTo(-5, 28);
    c.lineTo(-7, 38);
    c.moveTo(5, 28);
    c.lineTo(7, 38);
    c.stroke();
    c.fillStyle = "#1a1a18";
    c.beginPath();
    c.ellipse(-9, 39, 5, 2.6, 0, 0, X.TAU);
    c.ellipse(9, 39, 5, 2.6, 0, 0, X.TAU);
    c.fill();
    // arms: the left one waves, the right one holds the hourglass up
    c.beginPath();
    c.moveTo(-11, 6);
    c.quadraticCurveTo(-22, 2, -24, -10);
    c.moveTo(11, 6);
    c.quadraticCurveTo(20, 10, 24, 2);
    c.stroke();
    c.fillStyle = "#f4ecd8";
    c.beginPath();
    c.arc(-24, -12, 3.6, 0, X.TAU);
    c.arc(25, 1, 3.4, 0, X.TAU);
    c.fill();
    // the hourglass: wooden caps, glass bulbs, sand running down
    c.save();
    c.translate(31, -4);
    c.fillStyle = "#7a4a22";
    c.fillRect(-7, -14, 14, 3);
    c.fillRect(-7, 11, 14, 3);
    c.fillStyle = "rgba(220,235,240,0.9)";
    c.beginPath();
    c.moveTo(-5, -11);
    c.lineTo(5, -11);
    c.lineTo(1, 0);
    c.lineTo(5, 11);
    c.lineTo(-5, 11);
    c.lineTo(-1, 0);
    c.closePath();
    c.fill();
    c.fillStyle = "#e8b848";
    c.beginPath();
    c.moveTo(-3, -6);
    c.lineTo(3, -6);
    c.lineTo(0.6, -1);
    c.lineTo(-0.6, -1);
    c.closePath();
    c.fill();
    c.beginPath();
    c.moveTo(-4.5, 11);
    c.lineTo(4.5, 11);
    c.lineTo(0, 5);
    c.closePath();
    c.fill();
    c.fillRect(-0.4, -1, 0.8, 7);
    c.strokeStyle = "#5a3418";
    c.lineWidth = 1.2;
    c.beginPath();
    c.moveTo(-6, -11);
    c.lineTo(-6, 11);
    c.moveTo(6, -11);
    c.lineTo(6, 11);
    c.stroke();
    c.restore();
    // the frank: plump rounded body with a shine
    c.fillStyle = "#b8482c";
    rrect(c, -12, -22, 24, 52, 12);
    c.fill();
    c.strokeStyle = "#6a2214";
    c.lineWidth = 1.6;
    c.stroke();
    c.fillStyle = "rgba(255,220,190,0.35)";
    rrect(c, -8, -16, 5, 30, 2.5);
    c.fill();
    // face: bright eyes and a big grin
    c.fillStyle = "#fff";
    c.beginPath();
    c.ellipse(-4.5, -9, 3.2, 3.8, 0, 0, X.TAU);
    c.ellipse(4.5, -9, 3.2, 3.8, 0, 0, X.TAU);
    c.fill();
    c.fillStyle = "#1a1a18";
    c.beginPath();
    c.arc(-4, -8.4, 1.6, 0, X.TAU);
    c.arc(5, -8.4, 1.6, 0, X.TAU);
    c.fill();
    c.strokeStyle = "#3a0e08";
    c.lineWidth = 1.8;
    c.beginPath();
    c.arc(0, -2, 6.5, 0.2, Math.PI - 0.2);
    c.stroke();
    c.fillStyle = "#e88a6a";
    c.beginPath();
    c.arc(-8, -1, 2.2, 0, X.TAU);
    c.arc(8, -1, 2.2, 0, X.TAU);
    c.fill();
    // mustard stripe down the front
    c.strokeStyle = "#f0d020";
    c.lineWidth = 2.2;
    c.beginPath();
    c.moveTo(0, 8);
    for (let i = 1; i <= 5; i++) c.lineTo(i % 2 ? 3 : -3, 8 + i * 3.6);
    c.stroke();
    // the top hat, tipped at a jaunty angle
    c.save();
    c.translate(1, -21);
    c.rotate(-0.16);
    c.fillStyle = "#151515";
    c.beginPath();
    c.ellipse(0, 0, 15, 3.4, 0, 0, X.TAU);
    c.fill();
    c.fillRect(-9, -20, 18, 20);
    c.fillStyle = "#c8281e";
    c.fillRect(-9, -6, 18, 3.4);
    c.restore();
    c.restore();
  }
  // Forever Franks cart livery: big and bright enough to read from across the street
  R("cart_side", 256, 128, (c, w, h, r) => {
    c.fillStyle = "#f0e4c4";
    c.fillRect(0, 0, w, h);
    // red & cream awning stripes along the top, red kick band along the bottom
    for (let x = 0; x < w; x += 32) {
      c.fillStyle = "#c8281e";
      c.fillRect(x, 0, 16, 20);
    }
    c.fillStyle = "#c8281e";
    for (let x = 0; x < w; x += 16) {
      c.beginPath();
      c.arc(x + 8, 20, 8, 0, Math.PI);
      c.fill();
    }
    c.fillStyle = "#c8281e";
    c.fillRect(0, h - 16, w, 16);
    c.fillStyle = "#e8c040";
    c.fillRect(0, h - 19, w, 3);
    txt(c, "FOREVER", 80, 42, 24, "#b01a14", {
      maxW: 148,
      stroke: "rgba(60,10,0,0.3)",
    });
    txt(c, "FRANKS", 80, 70, 36, "#b01a14", {
      maxW: 152,
      stroke: "rgba(60,10,0,0.35)",
    });
    txt(c, "So good they'll outlive you!", 80, 92, 13, "#2a2a26", {
      font: F_SCRIPT,
      weight: "normal",
      maxW: 150,
    });
    txt(c, "Now with Miracle-Keep", 80, 104, 8, "#5a4a30", {
      weight: "normal",
      maxW: 140,
    });
    // the mascot on a mustard sunburst
    c.save();
    c.translate(204, 66);
    c.fillStyle = "#e8c040";
    c.beginPath();
    for (let i = 0; i < 24; i++) {
      const a = (i * Math.PI) / 12,
        rr = i % 2 ? 32 : 46;
      c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
    }
    c.closePath();
    c.fill();
    c.restore();
    franksMascot(c, 200, 68, 1.0);
    weather(c, w, h, r, 0.8);
  });
  R("cart_menu", 192, 64, (c, w, h, r) => {
    c.fillStyle = "#c8281e";
    c.fillRect(0, 0, w, h);
    c.strokeStyle = "#f0e4c4";
    c.lineWidth = 3;
    c.strokeRect(4, 4, w - 8, h - 8);
    txt(c, "FOREVER FRANKS 10¢", w / 2, 26, 22, "#f0e4c4", { maxW: 176 });
    txt(c, "FRANK-IN-A-BUN · ICE COLD FIZZO", w / 2, 48, 12, "#f0d040", {
      maxW: 170,
    });
    weather(c, w, h, r, 0.9);
  });
  R("newsstand_sign", 512, 64, (c, w, h, r) => {
    c.fillStyle = "#23402c";
    c.fillRect(0, 0, w, h);
    c.strokeStyle = "#d8ceb0";
    c.lineWidth = 2;
    c.strokeRect(4, 4, w - 8, h - 8);
    txt(
      c,
      "NEWS · MAGAZINES · CIGARETTES · CANDY",
      w / 2,
      h / 2 + 2,
      30,
      "#e4d8b4",
      { maxW: 480 },
    );
    weather(c, w, h, r, 1.2);
  });
  const MAGS = [
    ["RIFLEMAN'S COMPANION", "#3a3a2a", "#e8c040"],
    ["SUPER SERGEANT", "#f0d040", "#b8261c"],
    ["HANDYMAN MONTHLY", "#1a3a6a", "#e8e0c8"],
    ["THE FIRST JOURNAL", "#e8e4d8", "#1e3a66"],
    ["POPULAR CIRCUITS", "#e8d040", "#1a1a18"],
    ["SPEEDWAY", "#b01a14", "#f0e8c8"],
    ["TRUE ROMANCE TALES", "#d06a8a", "#fff4e8"],
    ["MOTOR MANUAL", "#e8e4d8", "#2a3a5a"],
  ];
  R("mag_rack", 256, 160, (c, w, h, r) => {
    c.fillStyle = "#2a2a24";
    c.fillRect(0, 0, w, h);
    for (let i = 0; i < 8; i++) {
      const m = MAGS[i],
        cx = (i % 4) * 64,
        cy = ((i / 4) | 0) * 80;
      c.save();
      c.translate(cx + 32, cy + 40);
      c.rotate((r() - 0.5) * 0.08);
      c.fillStyle = m[1];
      c.fillRect(-28, -36, 56, 72);
      txt(c, m[0], 0, -26, 11, m[2], { maxW: 52 });
      c.fillStyle = "rgba(255,255,255,0.18)";
      c.beginPath();
      c.arc(0, 6, 16, 0, X.TAU);
      c.fill();
      c.fillStyle = m[2];
      c.fillRect(-20, 26, 40, 3);
      c.restore();
    }
    weather(c, w, h, r, 1.3);
  });
  R("shutter", 256, 160, (c, w, h, r) => {
    for (let y = 0; y < h; y += 8) {
      const t = (96 + r() * 20) | 0;
      c.fillStyle = "rgb(" + t + "," + (t - 2) + "," + (t - 8) + ")";
      c.fillRect(0, y, w, 8);
      c.fillStyle = "rgba(0,0,0,0.35)";
      c.fillRect(0, y + 6, w, 2);
    }
    for (let i = 0; i < 14; i++) {
      c.fillStyle = "rgba(110,50,20," + (0.2 + r() * 0.3) + ")";
      c.fillRect(r() * w, r() * h, 6 + r() * 30, 3 + r() * 20);
    }
    txt(
      c,
      [
        "THE END IS NIGH",
        "COVENANT WAS HERE",
        "NO SCRIP INSIDE",
        "GOD BLESS AMERICA",
      ][(r() * 4) | 0],
      w / 2,
      h * 0.45,
      30,
      "#c02018",
      { font: F_SCRIPT, maxW: 230, stroke: "rgba(0,0,0,0.2)" },
    );
    c.fillStyle = "#20201c";
    c.fillRect(w / 2 - 14, h - 14, 28, 8);
    weather(c, w, h, r, 1.0);
  });
  R("red_cross", 128, 128, (c, w, h, r) => {
    c.fillStyle = "#ddd6c0";
    c.fillRect(0, 0, w, h);
    c.fillStyle = "#b01a16";
    c.fillRect(44, 14, 40, 84);
    c.fillRect(8, 36, 112, 40);
    txt(c, "U.S. ARMY MEDICAL", w / 2, 112, 11, "#3a3a30", { maxW: 118 });
    weather(c, w, h, r, 1.2);
  });
  R("fire_alarm", 64, 96, (c, w, h, r) => {
    c.fillStyle = "#9c1c14";
    c.fillRect(0, 0, w, h);
    c.fillStyle = "#e8d8a8";
    rrect(c, 8, 8, 48, 24, 4);
    c.fill();
    txt(c, "FIRE", 32, 21, 18, "#9c1c14");
    txt(c, "PULL", 32, 50, 12, "#e8d8a8");
    txt(c, "HOOK", 32, 64, 12, "#e8d8a8");
    c.fillStyle = "#2a1a14";
    rrect(c, 20, 74, 24, 12, 3);
    c.fill();
    weather(c, w, h, r, 1.3);
  });
  R("toe_tag", 64, 32, (c, w, h, r) => {
    c.fillStyle = "#d8ceb0";
    c.fillRect(0, 0, w, h);
    stencil(c, "DOA  10-23", w / 2, h / 2, 10, "#3a3028");
    weather(c, w, h, r, 1.0);
  });

  // ------------------------------------------------------------------
  // Build the atlas (shelf packing)
  // ------------------------------------------------------------------
  X.buildAtlas = function () {
    if (X._atlasTex) return X._atlasTex;
    const canvas = X.makeCanvas(AW, AH),
      ctx = canvas.getContext("2d");
    ctx.fillStyle = "#808080";
    ctx.fillRect(0, 0, AW, AH);
    // skyline bottom-left packing (tallest first)
    const items = ORDER.slice().sort((a, b) => b[2] - a[2] || b[1] - a[1]);
    const sky = new Int32Array(AW);
    const PAD = 2;
    for (const [name, w, h, painter] of items) {
      let bestY = 1e9,
        bestX = 0;
      for (let x = 0; x + w <= AW; x += 4) {
        let y = 0;
        for (let k = x; k < x + w; k++)
          if (sky[k] > y) {
            y = sky[k];
            if (y >= bestY) break;
          }
        if (y < bestY) {
          bestY = y;
          bestX = x;
        }
      }
      if (bestY + h > AH) {
        console.warn("props atlas overflow at " + name);
        REGIONS[name] = REGIONS.white;
        continue;
      }
      const x = bestX,
        y = bestY;
      for (let k = x; k < Math.min(AW, x + w + PAD); k++) sky[k] = y + h + PAD;
      ctx.save();
      ctx.translate(x, y);
      ctx.beginPath();
      ctx.rect(0, 0, w, h);
      ctx.clip();
      try {
        painter(ctx, w, h, U.rng(U.hashStr(name)));
      } catch (e) {
        G.reportError("props:atlas:" + name, e);
      }
      ctx.restore();
      // UVs (flipY: canvas top = v 1). Inset half a texel to avoid bleeding.
      REGIONS[name] = {
        u0: (x + 0.5) / AW,
        u1: (x + w - 0.5) / AW,
        v0: 1 - (y + h - 0.5) / AH,
        v1: 1 - (y + 0.5) / AH,
        px: [x, y, w, h],
      };
    }
    const t = X.finishTex(canvas, false);
    t.generateMipmaps = true;
    t.minFilter = THREE.LinearMipmapLinearFilter;
    X._atlasTex = t;
    X._atlasCanvas = canvas;
    return t;
  };
  X.atlasRegion = function (name) {
    if (!X._atlasTex) X.buildAtlas();
    return REGIONS[name] || REGIONS.white;
  };
  X.hasRegion = (name) => {
    if (!X._atlasTex) X.buildAtlas();
    return !!REGIONS[name];
  };
  X.atlasTexture = function () {
    return X._atlasTex || X.buildAtlas();
  };

  // ------------------------------------------------------------------
  // Fallback billboard art (only used when the textures module is absent)
  // ------------------------------------------------------------------
  // [background, ink, headline, slogan, motif] for the 28 brand ids of LAYOUT.BRANDS; unknown ids get one of these by hash
  const BB_STYLE = {
    fizzo_cola: [
      "#c0141a",
      "#fff",
      "Fizzo Cola",
      "Fizz Up, America!",
      "bottle",
    ],
    fizzo_blue: [
      "#0c2a4a",
      "#8ae8ff",
      "FIZZO BLUE",
      "The Electric Refresher",
      "bottle_blue",
    ],
    long_winter: [
      "#dcdad0",
      "#c8601e",
      "CIVIL DEFENSE",
      "Enrol Today. Carry Your Card.",
      "winter",
    ],
    prairie_root_beer: [
      "#e8d8a8",
      "#7a3a18",
      "Prairie Root Beer",
      "Old-time flavor, poured cold.",
      "star",
    ],
    liberty_jetliner: [
      "#1c2f5c",
      "#f2eee2",
      "LIBERTY JETLINER",
      "Fly the flag. Fly Liberty.",
      "star",
    ],
    first_journal: [
      "#ece6d6",
      "#1e3a66",
      "THE FIRST JOURNAL",
      "You heard it here first.",
      "star",
    ],
    pizza_galaxy: [
      "#20103a",
      "#ffcf40",
      "PIZZA GALAXY",
      "Out of this world. Into your mouth in 30 minutes.",
      "star",
    ],
    empire_brew: [
      "#1e4a34",
      "#f0e0b0",
      "EMPIRE BREW HOUSE",
      "Brewed in Brooklyn. Poured everywhere.",
      "star",
    ],
    silver_torch: [
      "#26323e",
      "#e8eaee",
      "SILVER TORCH",
      "Light up like the lady in the harbor.",
      "star",
    ],
    burger_brigade: [
      "#c8281e",
      "#fff0c8",
      "BURGER BRIGADE",
      "Fifteen cents. Fifteen seconds.",
      "star",
    ],
    excalibur_gardens: [
      "#3a2a6a",
      "#f0d070",
      "EXCALIBUR GARDENS",
      "COMING SOON · Summer 1967. Your kingdom awaits.",
      "star",
    ],
    junior_rocketeer: [
      "#e8e4d8",
      "#c8281e",
      "JUNIOR ROCKETEER CO.",
      "Real science. Real rockets.",
      "star",
    ],
    miracle_mane: [
      "#2a4a3a",
      "#f0e0b0",
      "DR. THATCHER'S MIRACLE MANE",
      "Grows hair on anything. Anything.",
      "star",
    ],
    big_apple_cab: [
      "#e0b020",
      "#151515",
      "BIG APPLE MOTOR CAB",
      "Just get in already!",
      "apple",
    ],
    mama_marinara: [
      "#c42a1e",
      "#f6ead0",
      "MAMA MARINARA'S",
      "Just add water. Mama will never know.",
      "star",
    ],
    hi_octane: [
      "#f0e6d0",
      "#c8281e",
      "HI-OCTANE HARRY'S",
      "Full service. Full tank. Full speed ahead.",
      "star",
    ],
    vigil: [
      "#13263a",
      "#cfeefa",
      "VIGIL DEFENSE",
      "Protecting America Always",
      "star",
    ],
    freedom_flakes: [
      "#1e3f86",
      "#f6eedc",
      "FREEDOM FLAKES",
      "The breakfast of a free nation.",
      "star",
    ],
    chocolate_zeppelin: [
      "#5a3420",
      "#f0e4c8",
      "CHOCOLATE ZEPPELIN",
      "Lighter than air. Sweeter than pie.",
      "star",
    ],
    golden_plain: [
      "#d8a838",
      "#4a2410",
      "GOLDEN PLAIN JERKY",
      "Tough enough for any trail.",
      "star",
    ],
    homeguard: [
      "#e8e4d8",
      "#1a3a6a",
      "HOMEGUARD",
      "Defending the American kitchen.",
      "star",
    ],
    lonly_tv: [
      "#2a2a2a",
      "#e8c860",
      "LONLY",
      "The best company in the house.",
      "star",
    ],
    eagle_motors: [
      "#16324a",
      "#f0e8d0",
      "EAGLE MOTORS",
      "Freedom to Explore",
      "star",
    ],
    super_sergeant: [
      "#f0d040",
      "#b8261c",
      "SUPER SERGEANT",
      "America's finest fighting man!",
      "chevrons",
    ],
    american_automaton: [
      "#d6e0e4",
      "#1a3a4a",
      "AMERICAN AUTOMATON CO.",
      "Built in America, to serve America.",
      "star",
    ],
    forever_franks: [
      "#f0e4c4",
      "#b01a14",
      "FOREVER FRANKS",
      "So good they'll outlive you!",
      "franks",
    ],
    sky_patrol: [
      "#0a0a2a",
      "#ffb347",
      "SKY PATROL",
      "Now in Every Arcade!",
      "star",
    ],
    worlds_fair: [
      "#1a3a6a",
      "#f0e8d0",
      "1964 WORLD'S FAIR",
      "Flushing Meadows, Queens",
      "star",
    ],
  };
  const BB_LIST = Object.keys(BB_STYLE);
  const BB_CACHE = {};
  X.billboardMaterial = function (brand) {
    // prefer the textures module's shared billboard material
    if (!G.isStub("mats") && G.mats && typeof G.mats.billboard === "function") {
      try {
        const m = G.mats.billboard(brand);
        if (m && m.isMaterial) return m;
      } catch (e) {
        /* fallback */
      }
    }
    if (BB_CACHE[brand]) return BB_CACHE[brand];
    const st =
      BB_STYLE[brand] ||
      BB_STYLE[BB_LIST[U.hashStr(String(brand)) % BB_LIST.length]];
    const c = X.makeCanvas(512, 256),
      ctx = c.getContext("2d"),
      r = U.rng(U.hashStr(brand));
    ctx.fillStyle = st[0];
    ctx.fillRect(0, 0, 512, 256);
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    for (let i = 0; i < 10; i++) ctx.fillRect(0, i * 26, 512, 12);
    if (st[4] === "bottle" || st[4] === "bottle_blue")
      fizzoBottle(
        ctx,
        440,
        130,
        1.4,
        st[4] === "bottle_blue" ? "#1a8ad0" : "#3a0c08",
      );
    else if (st[4] === "winter") winterMark(ctx, 440, 128, 70, st[1]);
    else if (st[4] === "apple") appleMark(ctx, 440, 128, 70);
    else if (st[4] === "chevrons") {
      ctx.fillStyle = "#5a6234";
      ctx.fillRect(385, 50, 110, 156);
      ctx.strokeStyle = st[0];
      ctx.lineWidth = 14;
      for (let i = 0; i < 3; i++) {
        const y = 84 + i * 30;
        ctx.beginPath();
        ctx.moveTo(398, y + 28);
        ctx.lineTo(440, y);
        ctx.lineTo(482, y + 28);
        ctx.stroke();
      }
    } else if (st[4] === "franks") {
      rays(ctx, 440, 128, 12, 100, "rgba(232,192,64,0.5)");
      franksMascot(ctx, 432, 132, 2.3);
    } else {
      rays(ctx, 440, 128, 12, 90, "rgba(255,255,255,0.12)");
      ctx.fillStyle = st[1];
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const a = -Math.PI / 2 + (i * Math.PI) / 5,
          rr = i % 2 ? 24 : 58;
        ctx.lineTo(440 + Math.cos(a) * rr, 128 + Math.sin(a) * rr);
      }
      ctx.closePath();
      ctx.fill();
    }
    txt(ctx, st[2], 200, 100, st[2].length > 14 ? 44 : 64, st[1], {
      maxW: 360,
      stroke: "rgba(0,0,0,0.35)",
    });
    txt(ctx, st[3], 200, 170, st[3].length > 30 ? 22 : 28, st[1], {
      font: F_SCRIPT,
      weight: "normal",
      maxW: 360,
    });
    weather(ctx, 512, 256, r, 1.0);
    const t = X.finishTex(c, false);
    const m = new THREE.MeshStandardMaterial({
      map: t,
      roughness: 0.8,
      metalness: 0,
      emissive: 0x111111,
      emissiveMap: t,
    });
    m.userData.shared = true;
    BB_CACHE[brand] = m;
    return m;
  };
})();
