// play-inline-262 02 — ctx
// Lines 21-132 of readable/play-inline-262.pretty.js (statement-aligned).
  const P = G._ues,
    D = P.dress;
  const TAU = P.TAU,
    PI = P.PI;

  // ------------------------------------------------------------------
  // small canvas helpers
  // ------------------------------------------------------------------
  function figure(ctx, x, y, s, o) {
    // a painted standing/half figure: body (dress/robe), head, optional hat/ruff
    o = o || {};
    ctx.fillStyle = o.body || "#3a2a1a";
    ctx.beginPath();
    ctx.moveTo(x - s * 0.22, y);
    ctx.quadraticCurveTo(
      x - s * 0.3,
      y + s * 0.6,
      x - s * 0.36,
      y + s * (o.full ? 1.6 : 1.0),
    );
    ctx.lineTo(x + s * 0.36, y + s * (o.full ? 1.6 : 1.0));
    ctx.quadraticCurveTo(x + s * 0.3, y + s * 0.6, x + s * 0.22, y);
    ctx.closePath();
    ctx.fill();
    if (o.collar) {
      ctx.fillStyle = o.collar;
      ctx.beginPath();
      ctx.ellipse(x, y + s * 0.04, s * 0.2, s * 0.07, 0, 0, TAU);
      ctx.fill();
    }
    ctx.fillStyle = o.skin || "#d8a882";
    ctx.beginPath();
    ctx.ellipse(x, y - s * 0.16, s * 0.12, s * 0.16, 0, 0, TAU);
    ctx.fill();
    // modelling shadow
    const g = ctx.createRadialGradient(
      x - s * 0.05,
      y - s * 0.2,
      s * 0.02,
      x,
      y - s * 0.16,
      s * 0.18,
    );
    g.addColorStop(0, "rgba(255,240,210,0.35)");
    g.addColorStop(1, "rgba(40,20,10,0.35)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(x, y - s * 0.16, s * 0.12, s * 0.16, 0, 0, TAU);
    ctx.fill();
    if (o.hair) {
      ctx.fillStyle = o.hair;
      ctx.beginPath();
      ctx.ellipse(x, y - s * 0.26, s * 0.13, s * 0.08, 0, PI, TAU);
      ctx.fill();
    }
    if (o.hat) {
      ctx.fillStyle = o.hat;
      ctx.beginPath();
      ctx.ellipse(x, y - s * 0.3, s * 0.2, s * 0.06, 0, 0, TAU);
      ctx.fill();
      ctx.fillRect(x - s * 0.11, y - s * 0.42, s * 0.22, s * 0.12);
    }
  }
  function varnish(ctx, x, y, w, h, r, k) {
    const g = ctx.createRadialGradient(
      x + w / 2,
      y + h / 2,
      Math.min(w, h) * 0.2,
      x + w / 2,
      y + h / 2,
      Math.max(w, h) * 0.75,
    );
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(1, "rgba(20,12,4," + 0.45 * (k || 1) + ")");
    ctx.fillStyle = g;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = "rgba(140,100,30,0.16)";
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = "rgba(25,15,5,0.22)";
    ctx.lineWidth = 0.6;
    for (let i = 0; i < 90; i++) {
      const px = x + r() * w,
        py = y + r() * h;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px + (r() - 0.5) * 12, py + (r() - 0.5) * 12);
      ctx.stroke();
    }
  }

  // ------------------------------------------------------------------
  // Old Masters atlas — 16 cells (4×4), 256×256 each
  // ------------------------------------------------------------------
  const MASTER_NAMES = [
    "Mistress and Maid",
    "Self-Portrait with Gold Light",
    "St. Francis in the Desert",
    "Portrait of a Statesman",
    "Harbour at Dawn",
    "The Progress of Love",
    "Lady in Grey",
    "Portrait of a King",
    "Village with Water Mill",
    "The Forge",
    "Cleansing of the Temple",
    "Comtesse in Blue",
    "Henry Clay Frick (1910)",
    "Rocket to Tomorrow",
    "Slashed Canvas",
    "Ambrose, Head of Household (1961)",
  ];
  P.MASTER_NAMES = MASTER_NAMES;
