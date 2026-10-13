// play-inline-19 01 — ctx
// Lines 29-369 of readable/play-inline-19.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const X = G._tx;
  const A = X.art;
  const TAU = Math.PI * 2;
  const INK = "#1d1712";
  const signCache = new Map(),
    neonCache = new Map(),
    decalCache = new Map(),
    iconCache = new Map(),
    iconURLCache = new Map();

  function measure(text, size, font, weight) {
    const cv = X.canvas(8, 8);
    X.setFont(cv.ctx, text, size, font, null, weight);
    return cv.ctx.measureText(text).width;
  }
  /** Generic grime/age for signs (not tile-bound). */
  function ageSign(ctx, w, h, r, worn, metal) {
    worn = worn === undefined ? 0.7 : worn;
    X.modulate(
      ctx,
      w,
      h,
      X.fbm(w, h, { scale: 4, octaves: 5, seed: (r() * 999) | 0 }),
      0.4 * worn,
    );
    X.blotches(ctx, w, h, r, {
      count: (4 + 8 * worn) | 0,
      color: metal ? "#6a3010" : "#3a2a18",
      alpha: 0.3 * worn,
      rmin: h * 0.05,
      rmax: h * 0.4,
    });
    X.streaks(ctx, w, h, r, {
      count: (6 + 10 * worn) | 0,
      color: metal ? "#5a2a0e" : "#2a2014",
      alpha: 0.3 * worn,
      minLen: h * 0.2,
      maxLen: h,
      maxW: 5,
    });
    if (worn > 0.4)
      for (let k = 0; k < ((r() * 4 * worn) | 0); k++)
        X.bulletHole(ctx, r() * w, r() * h, 1.5 + r() * 2, r, false);
    ctx.save();
    ctx.globalCompositeOperation = "saturation";
    ctx.fillStyle = "rgba(128,128,128," + 0.25 * worn + ")";
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }
  X.ageSign = ageSign;
  function finish(cv, key, alpha, regen) {
    const tex = X.toTexture(cv.c, {
      repeat: false,
      name: "sign_" + key,
      regen,
    });
    tex.userData.aspect = cv.w / cv.h;
    tex.userData.alpha = !!alpha;
    return tex;
  }

  // ------------------------------------------------------------------
  // Post-war sign weathering: every outdoor sign gets decades of rust bloom from the edges, rust runs
  // from the mounting bolts, chipped enamel/paint exposing bare steel, sun bleaching, dents and the odd
  // bullet hole. Tuned per style; opts.clean skips it (interiors, cryo-facility signage that was maintained).
  // ------------------------------------------------------------------
  const WEATHER_SIGN = {
    street: {
      rust: 0.85,
      chips: 0.8,
      fade: 0.4,
      bolts: "ends",
      dents: 2,
      holes: 0.6,
    },
    subway: {
      rust: 0.55,
      chips: 0.6,
      fade: 0.2,
      bolts: "corners",
      dents: 1,
      holes: 0.3,
      soot: 0.7,
    },
    shop: {
      rust: 0.35,
      chips: 0.9,
      fade: 0.45,
      bolts: "corners",
      dents: 1,
      holes: 0.3,
    },
    metal: {
      rust: 0.6,
      chips: 0.5,
      fade: 0.2,
      bolts: null,
      dents: 2,
      holes: 0.5,
    },
    warning: {
      rust: 0.75,
      chips: 0.7,
      fade: 0.4,
      bolts: "corners",
      dents: 2,
      holes: 0.5,
    },
    danger: {
      rust: 0.75,
      chips: 0.7,
      fade: 0.35,
      bolts: "corners",
      dents: 1,
      holes: 0.5,
    },
    enamel: {
      rust: 0.7,
      chips: 1.0,
      fade: 0.2,
      bolts: "corners",
      dents: 1,
      holes: 0.4,
      enamel: true,
    },
    cryo: {
      rust: 0.25,
      chips: 0.35,
      fade: 0.1,
      bolts: "corners",
      dents: 0,
      holes: 0.1,
    },
    exit: {
      rust: 0.25,
      chips: 0.3,
      fade: 0.3,
      bolts: null,
      dents: 0,
      holes: 0.1,
      soot: 0.5,
    },
    marquee: {
      rust: 0.45,
      chips: 0.35,
      fade: 0.25,
      bolts: null,
      dents: 1,
      holes: 0.3,
    },
    lightbox: {
      rust: 0.35,
      chips: 0.2,
      fade: 0.35,
      bolts: null,
      dents: 0,
      holes: 0.2,
    },
    danger_plate: null,
  };
  function rustSign(ctx, w, h, r, cfg, opts) {
    const worn = opts.worn === undefined ? 1 : opts.worn;
    if (worn <= 0) return;
    const S = Math.min(w, h);
    // 1) sun bleach: lift & desaturate (strongest at the top edge, which faced the sky)
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    const fg = ctx.createLinearGradient(0, 0, 0, h);
    fg.addColorStop(0, "rgba(235,225,200," + cfg.fade * 0.45 * worn + ")");
    fg.addColorStop(1, "rgba(235,225,200," + cfg.fade * 0.2 * worn + ")");
    ctx.fillStyle = fg;
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = "saturation";
    ctx.fillStyle = "rgba(128,128,128," + cfg.fade * 0.6 * worn + ")";
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
    // 2) rust bloom creeping in from the edges (blotchy, darker core, orange halo)
    const perim = 2 * (w + h),
      n = Math.round((perim / (S * 0.18)) * cfg.rust * worn);
    for (let k = 0; k < n; k++) {
      const t = r() * perim;
      let x, y;
      if (t < w) {
        x = t;
        y = 0;
      } else if (t < w + h) {
        x = w;
        y = t - w;
      } else if (t < 2 * w + h) {
        x = t - w - h;
        y = h;
      } else {
        x = 0;
        y = t - 2 * w - h;
      }
      const radius = S * (0.03 + r() * r() * 0.12) * (0.6 + cfg.rust * 0.6);
      ctx.fillStyle = "rgba(150,72,22," + (0.18 + r() * 0.15) + ")";
      X.smoothBlob(
        ctx,
        x,
        y,
        radius * 1.4,
        radius * (1 + r() * 0.5),
        r,
        12,
        0.45,
      );
      ctx.fill();
      ctx.fillStyle = "rgba(92,42,14," + (0.4 + r() * 0.3) + ")";
      X.smoothBlob(ctx, x, y, radius * 0.8, radius * 0.7, r, 10, 0.5);
      ctx.fill();
      ctx.fillStyle = "rgba(40,20,8,0.55)";
      X.smoothBlob(ctx, x, y, radius * 0.32, radius * 0.3, r, 8, 0.5);
      ctx.fill();
    }
    // 3) chipped paint / enamel exposing bare steel (with rust starting in the bigger chips)
    const chips = Math.round(((w * h) / (S * S * 0.35)) * cfg.chips * worn);
    for (let k = 0; k < chips; k++) {
      const edgeBias = r() < 0.6;
      const x = edgeBias
        ? r() < 0.5
          ? r() * w * 0.15
          : w - r() * w * 0.15
        : r() * w;
      const y =
        edgeBias && r() < 0.5
          ? r() < 0.5
            ? r() * h * 0.2
            : h - r() * h * 0.2
          : r() * h;
      const radius = S * (0.008 + r() * r() * 0.045);
      X.smoothBlob(ctx, x, y, radius * (1 + r() * 0.6), radius, r, 9, 0.55);
      ctx.fillStyle = cfg.enamel ? "#1c1a18" : "#8e887c";
      ctx.fill();
      ctx.strokeStyle = "rgba(245,240,225,0.35)";
      ctx.lineWidth = 1;
      ctx.stroke();
      if (radius > S * 0.02) {
        ctx.fillStyle = "rgba(120,58,18,0.75)";
        X.smoothBlob(ctx, x, y, radius * 0.55, radius * 0.45, r, 8, 0.5);
        ctx.fill();
      }
    }
    // 4) mounting bolts with rust runs streaking down
    const bolts = [];
    if (cfg.bolts === "ends")
      bolts.push([S * 0.32, h * 0.5], [w - S * 0.32, h * 0.5]);
    else if (cfg.bolts === "corners")
      bolts.push(
        [S * 0.14, S * 0.14],
        [w - S * 0.14, S * 0.14],
        [S * 0.14, h - S * 0.14],
        [w - S * 0.14, h - S * 0.14],
      );
    for (const [bx, by] of bolts) {
      const len = h * (0.25 + r() * 0.8) * worn,
        bw = S * (0.025 + r() * 0.03);
      const g = ctx.createLinearGradient(0, by, 0, by + len);
      g.addColorStop(0, "rgba(110,50,16,0.8)");
      g.addColorStop(1, "rgba(110,50,16,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(bx - bw, by);
      ctx.lineTo(bx + bw, by);
      ctx.lineTo(bx + bw * 0.4, by + len);
      ctx.lineTo(bx - bw * 0.4, by + len);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#4a3a2c";
      ctx.beginPath();
      ctx.arc(bx, by, S * 0.035, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "rgba(160,80,30,0.8)";
      ctx.beginPath();
      ctx.arc(bx - S * 0.008, by - S * 0.008, S * 0.018, 0, TAU);
      ctx.fill();
    }
    // 5) dents: soft light/dark lobes (light from the upper left)
    for (let k = 0; k < (cfg.dents || 0); k++) {
      if (r() < 0.35) continue;
      const x = r() * w,
        y = r() * h,
        radius = S * (0.12 + r() * 0.25);
      const g = ctx.createRadialGradient(
        x - radius * 0.3,
        y - radius * 0.3,
        0,
        x,
        y,
        radius,
      );
      g.addColorStop(0, "rgba(0,0,0,0.28)");
      g.addColorStop(0.55, "rgba(0,0,0,0.08)");
      g.addColorStop(0.8, "rgba(255,250,235,0.1)");
      g.addColorStop(1, "rgba(255,250,235,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(x, y, radius, radius * (0.6 + r() * 0.4), r() * 3, 0, TAU);
      ctx.fill();
    }
    // 6) bullet holes punched through the plate: bright torn steel lip, black hole, rust halo
    if (r() < (cfg.holes || 0) * worn) {
      const cx = r() * w,
        cy = r() * h,
        m = 1 + ((r() * 4) | 0);
      for (let k = 0; k < m; k++) {
        const x = cx + (r() - 0.5) * S * 0.8,
          y = cy + (r() - 0.5) * S * 0.5,
          rr = S * (0.018 + r() * 0.015);
        ctx.fillStyle = "rgba(120,56,18,0.45)";
        ctx.beginPath();
        ctx.arc(x, y + rr * 0.6, rr * 2.4, 0, TAU);
        ctx.fill();
        ctx.fillStyle = "#b8b2a4";
        X.blobPath(ctx, x, y, rr * 1.4, r, 8, 0.5);
        ctx.fill();
        ctx.fillStyle = "#080706";
        X.blobPath(ctx, x, y, rr, r, 8, 0.4);
        ctx.fill();
      }
    }
    // 7) soot / exhaust grime (subway, exit) and dirt settling along the bottom edge
    const soot = cfg.soot || 0.25;
    const bg = ctx.createLinearGradient(0, h * 0.55, 0, h);
    bg.addColorStop(0, "rgba(24,18,12,0)");
    bg.addColorStop(1, "rgba(24,18,12," + 0.4 * soot * worn + ")");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
    X.streaks(ctx, w, h, r, {
      count: Math.round(8 * worn),
      color: "#2a1a0e",
      alpha: 0.28 * worn,
      minLen: h * 0.2,
      maxLen: h * 0.9,
      maxW: S * 0.04,
    });
  }
  X.rustSign = rustSign;

