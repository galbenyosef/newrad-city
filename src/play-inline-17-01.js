// play-inline-17 01 — ctx
// Lines 19-169 of readable/play-inline-17.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const X = G._tx;
  const TAU = Math.PI * 2;
  const BW = 768,
    BH = 384,
    PW = 320,
    PH = 480;
  const billCache = new Map(),
    posterCache = new Map();

  const GRAFFITI = [
    "REPENT",
    "THE END IS NIGH",
    "KILROY WAS HERE",
    "SCRIP 4 RUSH",
    "BRUTES OUT",
    "HELP US",
    "NO GODS NO MASTERS",
    "EUROPE DID THIS",
    "RAIDERS RULE",
    "WHERE IS GOD",
    "THE SLEEPERS KNEW",
    "WALK IN THE GLOW",
    "KEEP THE LIGHT ON",
    "A DIMANCHE",
    "THE LIST HAS RETURNED",
  ];
  const SPRAY = [
    "#d8261a",
    "#1e1e1e",
    "#f4f0e0",
    "#2a7ad0",
    "#3ac04a",
    "#f2c43a",
  ];

  /** Spray-paint style text (soft overspray + drips). */
  function spray(ctx, text, x, y, size, col, r, rot) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot || 0);
    X.setFont(ctx, text, size, "marker", null, "bold");
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = X.css(col, 0.8);
    ctx.shadowBlur = size * 0.25;
    ctx.fillStyle = X.css(col, 0.9);
    ctx.fillText(text, 0, 0);
    ctx.shadowBlur = 0;
    const w = ctx.measureText(text).width;
    for (let k = 0; k < Math.max(2, text.length / 2); k++) {
      // drips
      const dx = (r() - 0.5) * w,
        len = size * (0.3 + r() * 1.2);
      ctx.fillStyle = X.css(col, 0.75);
      ctx.fillRect(dx, size * 0.2, Math.max(1, size * 0.05), len);
      ctx.beginPath();
      ctx.arc(dx + size * 0.025, size * 0.2 + len, size * 0.045, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }
  X.spray = spray;

  /** Sprayed raider skull tag. */
  function skullTag(ctx, x, y, s, col) {
    ctx.save();
    ctx.fillStyle = col;
    ctx.strokeStyle = col;
    ctx.lineWidth = s * 0.12;
    ctx.lineCap = "round";
    ctx.shadowColor = col;
    ctx.shadowBlur = s * 0.2;
    ctx.beginPath();
    ctx.arc(x, y, s * 0.5, Math.PI, 0);
    ctx.lineTo(x + s * 0.35, y + s * 0.45);
    ctx.lineTo(x - s * 0.35, y + s * 0.45);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x - s * 0.2, y + s * 0.05, s * 0.12, 0, TAU);
    ctx.arc(x + s * 0.2, y + s * 0.05, s * 0.12, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x - s * 0.7, y + s * 0.8);
    ctx.lineTo(x + s * 0.7, y + s * 1.2);
    ctx.moveTo(x + s * 0.7, y + s * 0.8);
    ctx.lineTo(x - s * 0.7, y + s * 1.2);
    ctx.stroke();
    ctx.restore();
  }
  X.skullTag = skullTag;

  /** Bullet hole (paper): dark hole, torn light rim, radial splits. */
  function bulletHole(ctx, x, y, s, r, paper) {
    ctx.save();
    ctx.strokeStyle = "rgba(30,24,18,0.6)";
    ctx.lineWidth = Math.max(0.6, s * 0.18);
    for (let k = 0; k < 5; k++) {
      const a = r() * TAU,
        l = s * (1.2 + r() * 2);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l);
      ctx.stroke();
    }
    ctx.fillStyle = paper ? "rgba(235,225,200,0.85)" : "rgba(180,170,150,0.6)";
    X.blobPath(ctx, x, y, s * 1.35, r, 8, 0.6);
    ctx.fill();
    ctx.fillStyle = "#0c0a08";
    X.blobPath(ctx, x, y, s, r, 8, 0.4);
    ctx.fill();
    ctx.restore();
  }
  X.bulletHole = bulletHole;

  /**
   * Does a circle (x,y,radius) overlap any protected box? `skip` ignores the first N boxes (sorted largest-first),
   * e.g. skip=1 → only the secondary lettering counts.
   */
  function hitsBoxes(boxes, x, y, radius, skip) {
    for (let i = skip || 0; i < boxes.length; i++) {
      const b = boxes[i];
      const cx = Math.max(b.x, Math.min(x, b.x + b.w)),
        cy = Math.max(b.y, Math.min(y, b.y + b.h));
      if ((cx - x) * (cx - x) + (cy - y) * (cy - y) < radius * radius)
        return true;
    }
    return false;
  }
  /** Run a draw function while capturing every X.text box; returns hero boxes (tall lettering), largest first. */
  function withCapture(H, fn) {
    const prev = X.textCapture;
    X.textCapture = [];
    try {
      fn();
    } finally {
      var boxes = X.textCapture;
      X.textCapture = prev;
    }
    // tall lettering (≥3.5% of the height: wordmarks AND slogans), largest first; fine print may weather freely
    const hero = boxes
      .filter((b) => b.h >= H * 0.035 && b.w > 4)
      .sort((a, b) => b.w * b.h - a.w * a.h);
    // every readable line (slogan ribbons, taglines ≥2 % of the height) — graffiti never sprays over any of them
    hero.all = boxes.filter((b) => b.h >= H * 0.02 && b.w > 4);
    return hero;
  }

  /** Age an advertisement in-place. o: {level 0..1.5, seams, paper, board:'#hex', noGraffiti} */
