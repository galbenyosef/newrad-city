/* src/textures/40_signs.js */
/* =====================================================================
 * NEW RAD CITY — TEXTURES: signs, neon, decals, icons
 * Owned by: textures.
 *
 * G.tex.sign(text, style, opts) — styles:
 *   street   NYC green street-name blade        opts.sub (e.g. 'W'), opts.arrow
 *   subway   black station sign + route bullets opts.routes ['1','2','3','S']
 *   shop     painted shop board                 opts.bg, opts.fg, opts.font, opts.sub
 *   wood     hand-painted scrap-plank sign (settlements in the Ruins)
 *   metal    stencilled steel plate             opts.bg
 *   warning  yellow/black hazard (radiation etc.)
 *   danger   red DANGER header over white
 *   enamel   old-world porcelain enamel sign    opts.bg, opts.fg
 *   cryo     Long Winter facility plate (frost white, slate, orange band, crystal)
 *   marquee  theatre marquee with bulbs (emissive via G.mats.sign)
 *   lightbox back-lit plastic sign (emissive via G.mats.sign)
 *   banner   cloth banner (faction)             opts.bg, opts.fg, opts.emblem 'covenant'|'sun'|'continuity'|'longwinter'
 *   plaque   bronze historical plaque           opts.sub = second line / year
 *   exit     green EXIT sign
 *   gilt     gold-leaf lettering on black glass (lobbies)
 * Returned textures carry tex.userData.aspect (w/h) so callers can size planes.
 *
 * G.tex.neon(text, color, {font, border, icon, broken, transparent, sub})
 * G.tex.decal(name)  — see DECALS below (RGBA)
 * G.tex.icon(name), G.tex.iconURL(name, color) — goggle-style line icons
 * ===================================================================== */
(function () {
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

  const ROUTE_COLORS = {
    1: "#e8352a",
    2: "#e8352a",
    3: "#e8352a",
    4: "#2a9a4a",
    5: "#2a9a4a",
    6: "#2a9a4a",
    7: "#b83aa8",
    A: "#2a5ab8",
    C: "#2a5ab8",
    E: "#2a5ab8",
    B: "#f08a1a",
    D: "#f08a1a",
    F: "#f08a1a",
    N: "#f2c43a",
    Q: "#f2c43a",
    R: "#f2c43a",
    S: "#7a7a7a",
    L: "#8a8a8a",
  };

  const STYLES = {
    street(ctx, w, h, text, o, r) {
      X.rrect(ctx, 2, 2, w - 4, h - 4, h * 0.12);
      ctx.fillStyle = "#1f5b3c";
      ctx.fill();
      ctx.strokeStyle = "#e8ecde";
      ctx.lineWidth = h * 0.05;
      X.rrect(ctx, h * 0.08, h * 0.08, w - h * 0.16, h - h * 0.16, h * 0.08);
      ctx.stroke();
      const hasSub = !!o.sub;
      if (hasSub)
        X.text(ctx, o.sub, h * 0.42, h * 0.54, {
          font: "helv",
          size: h * 0.42,
          color: "#e8ecde",
        });
      X.text(ctx, text, w / 2 + (hasSub ? h * 0.2 : 0), h * 0.54, {
        font: "helv",
        size: h * 0.58,
        color: "#f0f2ea",
        maxW: w - h * (hasSub ? 1.2 : 0.6),
        weight: "bold",
      });
      ageSign(ctx, w, h, r, o.worn === undefined ? 0.6 : o.worn, true);
    },
    subway(ctx, w, h, text, o, r) {
      ctx.fillStyle = "#141414";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#e8e8e0";
      ctx.fillRect(0, h * 0.06, w, h * 0.035);
      const routes = o.routes || [];
      X.text(ctx, text, h * 0.3, h * 0.52, {
        font: "helv",
        size: h * 0.46,
        color: "#f4f4ec",
        align: "left",
        maxW: w - h * (0.5 + routes.length * 0.75),
      });
      routes.forEach((rt, i) => {
        const cx = w - h * 0.45 - (routes.length - 1 - i) * h * 0.72,
          cy = h * 0.54;
        ctx.beginPath();
        ctx.arc(cx, cy, h * 0.3, 0, TAU);
        ctx.fillStyle = ROUTE_COLORS[rt] || "#7a7a7a";
        ctx.fill();
        X.text(ctx, String(rt), cx, cy + h * 0.02, {
          font: "helv",
          size: h * 0.38,
          color: rt === "N" || rt === "Q" || rt === "R" ? "#111" : "#fff",
        });
      });
      ageSign(ctx, w, h, r, o.worn === undefined ? 0.7 : o.worn, false);
    },
    shop(ctx, w, h, text, o, r) {
      // bold, high-contrast painted boards (cream on oxblood / teal / bottle green, gilt on black, oxblood on cream) with a
      // dark keyline + drop shadow and lettering at ~60 % of the board height, so names read at 15–20 m through the grime
      const pal = [
        ["#6e1a16", "#f4e6c0"],
        ["#14504c", "#f2e2b4"],
        ["#1c3f24", "#f0e4c0"],
        ["#121210", "#e2b44c"],
        ["#ece2c6", "#7a1a14"],
        ["#1a2a4c", "#f0d070"],
        ["#3a1a2e", "#f4dca8"],
      ];
      const p = pal[X.seedOf(text) % pal.length];
      const bg = o.bg || p[0],
        fg = o.fg || p[1];
      const light = X.hex(bg).reduce((a, v) => a + v, 0) > 450;
      X.rrect(ctx, 0, 0, w, h, h * 0.08);
      ctx.fillStyle = bg;
      ctx.fill();
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "rgba(255,255,255,0.08)");
      g.addColorStop(0.5, "rgba(0,0,0,0)");
      g.addColorStop(1, "rgba(0,0,0,0.18)");
      ctx.fillStyle = g;
      ctx.fill();
      ctx.strokeStyle = X.css(fg, 0.85);
      ctx.lineWidth = h * 0.045;
      X.rrect(ctx, h * 0.09, h * 0.09, w - h * 0.18, h - h * 0.18, h * 0.05);
      ctx.stroke();
      const ink = light ? "#f4ecd8" : "#0c0a08";
      X.text(ctx, text, w / 2, h * (o.sub ? 0.43 : 0.53), {
        font: o.font || "didone",
        size: h * (o.sub ? 0.5 : 0.62),
        color: fg,
        maxW: w - h * 0.42,
        stroke: ink,
        strokeW: h * 0.035,
        shadow: ink,
        shadowA: light ? 0.35 : 0.7,
        shadowOff: h * 0.04,
      });
      if (o.sub)
        X.text(ctx, o.sub, w / 2, h * 0.78, {
          font: "condensed",
          size: h * 0.15,
          color: fg,
          spacing: 3,
          maxW: w - h * 0.5,
        });
      ageSign(ctx, w, h, r, o.worn === undefined ? 0.65 : o.worn, false);
    },
    wood(ctx, w, h, text, o, r) {
      // Scrap-wood settlement sign: 3–5 mismatched planks with gaps, nail heads and end-grain, and the lettering
      // brush-painted in thick house paint over a dark keyline (frontier-town style) so it reads at 20 m.
      // The paint follows the planks: it skips the gaps, is scraped thin along the grain and flakes off at the edges.
      const planks = Math.max(3, Math.round(h / 44));
      ctx.clearRect(0, 0, w, h);
      const P = [];
      for (let i = 0; i < planks; i++) {
        const y = (i * h) / planks,
          ph = h / planks;
        const rot = (r() - 0.5) * 0.035,
          x0 = r() * w * 0.025,
          x1 = w - r() * w * 0.025;
        P.push({ y, ph, rot });
        ctx.save();
        ctx.translate(w / 2, y + ph / 2);
        ctx.rotate(rot);
        const c = X.jitter(
          ["#6e5a42", "#7a6448", "#5e4c38", "#846a4a", "#6a5e50", "#8a7458"][
            (r() * 6) | 0
          ],
          r,
          0.12,
        );
        const g = ctx.createLinearGradient(0, -ph / 2, 0, ph / 2);
        g.addColorStop(0, X.css(X.shade(c, 0.12)));
        g.addColorStop(0.55, X.css(c));
        g.addColorStop(1, X.css(X.shade(c, -0.32)));
        ctx.fillStyle = g;
        ctx.fillRect(-w / 2 + x0, -ph / 2 + 2, x1 - x0, ph - 4);
        ctx.strokeStyle = "rgba(30,20,10,0.32)";
        ctx.lineWidth = 1;
        for (let k = 0; k < 7; k++) {
          const yy = (r() - 0.5) * ph * 0.85,
            a = (r() - 0.5) * 6;
          ctx.beginPath();
          ctx.moveTo(-w / 2, yy);
          ctx.bezierCurveTo(
            -w / 6,
            yy + a,
            w / 6,
            yy - a,
            w / 2,
            yy + (r() - 0.5) * 3,
          );
          ctx.stroke();
        }
        if (r() < 0.5) {
          const kx = (r() - 0.5) * w * 0.8;
          ctx.beginPath();
          ctx.ellipse(
            kx,
            (r() - 0.5) * ph * 0.4,
            ph * 0.08,
            ph * 0.05,
            0,
            0,
            TAU,
          );
          ctx.fillStyle = "rgba(40,26,14,0.55)";
          ctx.fill();
        } // knot
        ctx.fillStyle = "rgba(0,0,0,0.35)";
        ctx.fillRect(-w / 2 + x0, ph / 2 - 3, x1 - x0, 2); // shadow gap under each plank
        for (const nx of [-w / 2 + x0 + ph * 0.25, x1 - w / 2 - ph * 0.25])
          for (const ny of [-ph * 0.22, ph * 0.22]) {
            ctx.beginPath();
            ctx.arc(nx, ny, Math.max(2, ph * 0.045), 0, TAU);
            ctx.fillStyle = "#26221e";
            ctx.fill();
            ctx.fillStyle = "rgba(110,50,20,0.35)";
            ctx.fillRect(nx - 1, ny, 2, ph * (0.1 + r() * 0.25)); // rust weep
          }
        ctx.restore();
      }
      // lettering on its own layer, then cut to the planks and scraped
      const L = X.canvas(w, h),
        lc = L.ctx;
      const PAINT = [
        ["#ece4d0", "#1a120a"],
        ["#f0d23c", "#1a120a"],
        ["#e8e0cc", "#6a140e"],
        ["#d8301e", "#f0e6d0"],
      ];
      const pc = o.fg
        ? [o.fg, o.ink || "#1a120a"]
        : PAINT[X.seedOf(text) % PAINT.length];
      const lines = String(text).split("\n");
      const sz = (h * (o.sub ? 0.5 : 0.64)) / Math.max(1, lines.length * 0.8);
      lines.forEach((ln, i) => {
        const y =
          h * (o.sub ? 0.4 : 0.52) + (i - (lines.length - 1) / 2) * sz * 0.95;
        X.text(lc, ln, w / 2, y, {
          font: o.font || "impact",
          size: sz,
          color: pc[0],
          maxW: w * 0.88,
          stroke: pc[1],
          strokeW: sz * 0.14,
          skew: (r() - 0.5) * 0.06,
        });
      });
      if (o.sub)
        X.text(lc, o.sub, w / 2, h * 0.82, {
          font: "marker",
          size: h * 0.15,
          color: pc[0],
          maxW: w * 0.85,
          stroke: pc[1],
          strokeW: h * 0.02,
        });
      lc.save();
      lc.globalCompositeOperation = "destination-out";
      for (const pl of P) lc.fillRect(0, pl.y - 2, w, 4); // paint breaks at the plank gaps
      for (let k = 0; k < w * 0.5; k++) {
        const x = r() * w,
          y = r() * h;
        lc.globalAlpha = 0.25 + r() * 0.6;
        lc.fillRect(x, y, 6 + r() * 60, 1 + r() * 1.5);
      } // scraped along the grain
      lc.globalAlpha = 1;
      for (let k = 0; k < 18; k++) {
        X.blobPath(lc, r() * w, r() * h, h * (0.01 + r() * 0.035), r, 7, 0.7);
        lc.fill();
      } // flaked-off chips
      lc.restore();
      ctx.globalAlpha = 0.95;
      ctx.drawImage(L.c, 0, 0);
      ctx.globalAlpha = 1;
      ageSign(ctx, w, h, r, 0.45, false);
    },
    metal(ctx, w, h, text, o, r) {
      const R = X.canvas(w, h);
      X.GEN.metal_painted.gen(R.ctx, w, h, r, X.canvas(w, h).ctx);
      ctx.drawImage(R.c, 0, 0);
      if (o.bg) {
        ctx.fillStyle = X.css(o.bg, 0.8);
        ctx.globalCompositeOperation = "multiply";
        ctx.fillRect(0, 0, w, h);
        ctx.globalCompositeOperation = "source-over";
      }
      X.text(ctx, text, w / 2, h * 0.52, {
        font: "stencil",
        size: h * 0.5,
        color: o.fg || "rgba(235,230,215,0.9)",
        maxW: w * 0.9,
      });
      for (const [x, y] of [
        [h * 0.12, h * 0.15],
        [w - h * 0.12, h * 0.15],
        [h * 0.12, h * 0.85],
        [w - h * 0.12, h * 0.85],
      ]) {
        ctx.fillStyle = "#3a3a36";
        ctx.beginPath();
        ctx.arc(x, y, h * 0.05, 0, TAU);
        ctx.fill();
      }
      ageSign(ctx, w, h, r, 0.7, true);
    },
    warning(ctx, w, h, text, o, r) {
      ctx.fillStyle = "#f0c020";
      ctx.fillRect(0, 0, w, h);
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, w, h);
      ctx.rect(h * 0.12, h * 0.12, w - h * 0.24, h - h * 0.24);
      ctx.clip("evenodd");
      ctx.fillStyle = "#1a1a1a";
      for (let x = -h; x < w + h; x += h * 0.24) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + h * 0.12, 0);
        ctx.lineTo(x + h * 0.12 - h, h);
        ctx.lineTo(x - h, h);
        ctx.fill();
      }
      ctx.restore();
      X.trefoil(ctx, h * 0.55, h / 2, h * 0.26, "#1a1a1a", null);
      X.text(ctx, text, (w + h * 0.9) / 2, h / 2, {
        font: "impact",
        size: h * 0.36,
        color: "#1a1a1a",
        maxW: w - h * 1.3,
      });
      ageSign(ctx, w, h, r, 0.7, true);
    },
    danger(ctx, w, h, text, o, r) {
      ctx.fillStyle = "#f4f0e6";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#1a1a1a";
      ctx.fillRect(0, 0, w, h * 0.42);
      ctx.fillStyle = "#d0201a";
      ctx.beginPath();
      ctx.ellipse(w / 2, h * 0.21, w * 0.34, h * 0.15, 0, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = "#f4f0e6";
      ctx.lineWidth = h * 0.012;
      ctx.beginPath();
      ctx.ellipse(w / 2, h * 0.21, w * 0.34 - h * 0.02, h * 0.13, 0, 0, TAU);
      ctx.stroke();
      X.text(ctx, "DANGER", w / 2, h * 0.215, {
        font: "helv",
        size: h * 0.2,
        color: "#fff",
        maxW: w * 0.52,
        weight: "bold",
      });
      // body text: split long messages onto two lines so the lettering stays big and inside the plate margin
      let words = String(text).split(/\s+/),
        lines = [String(text)];
      if (words.length > 1 && String(text).length > 9) {
        let best = 1,
          bd = 1e9;
        for (let k = 1; k < words.length; k++) {
          const d = Math.abs(
            words.slice(0, k).join(" ").length -
              words.slice(k).join(" ").length,
          );
          if (d < bd) {
            bd = d;
            best = k;
          }
        }
        lines = [words.slice(0, best).join(" "), words.slice(best).join(" ")];
      }
      lines.forEach((l, i) =>
        X.text(ctx, l, w / 2, h * (lines.length > 1 ? 0.6 + i * 0.2 : 0.7), {
          font: "helv",
          size: h * (lines.length > 1 ? 0.17 : 0.2),
          color: "#1a1a1a",
          maxW: w * 0.8,
          weight: "bold",
        }),
      );
      ageSign(ctx, w, h, r, 0.7, true);
    },
    enamel(ctx, w, h, text, o, r) {
      const bg = o.bg || "#1e4a8a",
        fg = o.fg || "#f4f0e0";
      X.rrect(ctx, 0, 0, w, h, h * 0.15);
      ctx.fillStyle = bg;
      ctx.fill();
      ctx.strokeStyle = fg;
      ctx.lineWidth = h * 0.05;
      X.rrect(ctx, h * 0.1, h * 0.1, w - h * 0.2, h - h * 0.2, h * 0.1);
      ctx.stroke();
      X.text(ctx, text, w / 2, h * 0.52, {
        font: o.font || "slab",
        size: h * 0.5,
        color: fg,
        maxW: w - h * 0.4,
      });
      for (let k = 0; k < 10; k++) {
        const x = r() < 0.5 ? r() * w : r() < 0.5 ? 0 : w,
          y = r() < 0.5 ? (r() < 0.5 ? 0 : h) : r() * h;
        X.blobPath(ctx, x, y, h * (0.03 + r() * 0.08), r, 8, 0.6);
        ctx.fillStyle = "#1a1612";
        ctx.fill();
        ctx.strokeStyle = "#5a2a10";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      ageSign(ctx, w, h, r, 0.5, true);
    },
    cryo(ctx, w, h, text, o, r) {
      // Project Long Winter facility signage: frost-white enamel, slate keyline, safety-orange band, crystal emblem
      ctx.fillStyle = "#e6eef2";
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "#1c2e52";
      ctx.lineWidth = h * 0.06;
      ctx.strokeRect(h * 0.03, h * 0.03, w - h * 0.06, h - h * 0.06);
      ctx.fillStyle = "#e8742a";
      ctx.fillRect(h * 0.06, h * 0.8, w - h * 0.12, h * 0.1);
      A.snowflake(ctx, h * 0.55, h * 0.45, h * 0.28, "#3a6a8a", h * 0.05);
      const lines = String(text).split("\n");
      lines.forEach((l, i) =>
        X.text(
          ctx,
          l,
          (w + h) / 2,
          h * (0.45 + (i - (lines.length - 1) / 2) * 0.3),
          {
            font: "deco",
            size: h * (lines.length > 1 ? 0.26 : 0.42),
            color: "#1c2e52",
            maxW: w - h * 1.3,
            spacing: 2,
          },
        ),
      );
      ageSign(ctx, w, h, r, o.worn === undefined ? 0.4 : o.worn, true);
    },
    marquee(ctx, w, h, text, o, r) {
      ctx.fillStyle = "#1a1410";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#f4ecd8";
      ctx.fillRect(h * 0.18, h * 0.18, w - h * 0.36, h - h * 0.36);
      ctx.fillStyle = "rgba(0,0,0,0.12)";
      for (let y = h * 0.18; y < h * 0.82; y += h * 0.16)
        ctx.fillRect(h * 0.18, y, w - h * 0.36, 2);
      const lines = String(text).split("\n");
      lines.forEach((l, i) =>
        X.text(ctx, l, w / 2, h * (0.5 + (i - (lines.length - 1) / 2) * 0.26), {
          font: "condensed",
          size: h * (lines.length > 1 ? 0.22 : 0.4),
          color: "#1a1410",
          maxW: w - h * 0.5,
          spacing: 2,
        }),
      );
      for (let x = h * 0.09; x < w; x += h * 0.12)
        for (const y of [h * 0.09, h * 0.91]) {
          const lit = r() > 0.25;
          ctx.beginPath();
          ctx.arc(x, y, h * 0.035, 0, TAU);
          ctx.fillStyle = lit ? "#fff4c8" : "#3a3024";
          ctx.fill();
        }
      for (let y = h * 0.21; y < h * 0.8; y += h * 0.12)
        for (const x of [h * 0.09, w - h * 0.09]) {
          const lit = r() > 0.25;
          ctx.beginPath();
          ctx.arc(x, y, h * 0.035, 0, TAU);
          ctx.fillStyle = lit ? "#fff4c8" : "#3a3024";
          ctx.fill();
        }
      // missing letter slots
      for (let k = 0; k < 3; k++) {
        ctx.fillStyle = "rgba(40,30,20,0.35)";
        ctx.fillRect(
          h * 0.2 + r() * (w - h * 0.6),
          h * 0.3 + r() * h * 0.3,
          h * 0.12,
          h * 0.18,
        );
      }
      ageSign(ctx, w, h, r, 0.45, true);
    },
    lightbox(ctx, w, h, text, o, r) {
      const bg = o.bg || "#f4f0e0",
        fg = o.fg || "#b8201a";
      ctx.fillStyle = "#2a2a28";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = bg;
      ctx.fillRect(h * 0.08, h * 0.08, w - h * 0.16, h - h * 0.16);
      X.text(ctx, text, w / 2, h * 0.52, {
        font: o.font || "deco",
        size: h * 0.5,
        color: fg,
        maxW: w - h * 0.4,
      });
      // smashed acrylic at the ends of the box (never over the name): a jagged hole showing the dark cabinet, a dead
      // fluorescent tube and its sockets, with a pale broken rim of the plastic around it
      const nHole = 1 + (r() < 0.5 ? 1 : 0);
      for (let k = 0; k < nHole; k++) {
        const left = (k === 0) === r() < 0.5,
          x = left ? h * 0.08 + r() * w * 0.07 : w - h * 0.08 - r() * w * 0.07,
          y = h * (0.25 + r() * 0.5),
          radius = h * (0.12 + r() * 0.1);
        ctx.save();
        ctx.beginPath();
        ctx.rect(h * 0.08, h * 0.08, w - h * 0.16, h - h * 0.16);
        ctx.clip();
        X.blobPath(ctx, x, y, radius * 1.12, r, 11, 0.9);
        ctx.fillStyle = "rgba(250,248,240,0.55)";
        ctx.fill();
        X.blobPath(ctx, x, y, radius, r, 11, 0.9);
        ctx.fillStyle = "#16140f";
        ctx.fill();
        ctx.clip();
        const ty = y + (r() - 0.5) * radius * 0.6;
        const tg = ctx.createLinearGradient(0, ty - h * 0.03, 0, ty + h * 0.03);
        tg.addColorStop(0, "#5a5a54");
        tg.addColorStop(0.5, "#b8b8ae");
        tg.addColorStop(1, "#3a3a36");
        ctx.fillStyle = tg;
        ctx.fillRect(x - radius * 1.5, ty - h * 0.025, radius * 3, h * 0.05);
        ctx.restore();
      }
      ageSign(ctx, w, h, r, 0.5, false);
    },
    banner(ctx, w, h, text, o, r) {
      const bg = o.bg || "#7a1e1a",
        fg = o.fg || "#f0e0b0";
      X.weave(ctx, w, h, r, bg, 3, 777);
      for (let x = 0; x < w; x += w / 6) {
        const g = ctx.createLinearGradient(x, 0, x + w / 6, 0);
        g.addColorStop(0, "rgba(0,0,0,0.25)");
        g.addColorStop(0.5, "rgba(255,255,255,0.08)");
        g.addColorStop(1, "rgba(0,0,0,0.25)");
        ctx.fillStyle = g;
        ctx.fillRect(x, 0, w / 6, h);
      }
      const em = o.emblem;
      if (em === "sun")
        A.sunDisc(ctx, w / 2, h * 0.36, Math.min(w * 0.42, h * 0.2), {
          color: fg,
          ink: null,
          inner: X.shade(bg, -0.2),
          core: X.shade(fg, 0.4),
        });
      else if (em === "covenant")
        A.covenant(ctx, w / 2, h * 0.34, Math.min(w * 0.85, h * 0.46), {
          steel: fg,
          iron: X.css(X.shade(fg, -0.3)),
          field: X.css(X.shade(bg, -0.35)),
        });
      else if (em === "continuity")
        A.continuity(ctx, w / 2, h * 0.32, Math.min(w * 0.4, h * 0.18), {
          navy: X.css(X.shade(bg, -0.45)),
          cream: fg,
          red: fg,
        });
      else if (em === "longwinter")
        A.longWinter(ctx, w / 2, h * 0.34, Math.min(w * 0.4, h * 0.2), {
          text: false,
        });
      X.text(ctx, text, w / 2, em ? h * 0.72 : h * 0.5, {
        font: o.font || "copper",
        size: h * (em ? 0.16 : 0.3),
        color: fg,
        maxW: w * 0.85,
      });
      ctx.save();
      ctx.globalCompositeOperation = "destination-out"; // frayed bottom edge
      for (let x = 0; x < w; x += 4) {
        ctx.fillRect(x, h - r() * h * 0.05, 3, h);
      }
      ctx.restore();
      ageSign(ctx, w, h, r, 0.6, false);
    },
    plaque(ctx, w, h, text, o, r) {
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, "#8a6a34");
      g.addColorStop(0.5, "#6a4e24");
      g.addColorStop(1, "#4a3418");
      X.rrect(ctx, 0, 0, w, h, h * 0.06);
      ctx.fillStyle = g;
      ctx.fill();
      ctx.strokeStyle = "#c8a860";
      ctx.lineWidth = h * 0.03;
      X.rrect(ctx, h * 0.06, h * 0.06, w - h * 0.12, h - h * 0.12, h * 0.04);
      ctx.stroke();
      X.text(ctx, text, w / 2, h * 0.38, {
        font: "copper",
        size: h * 0.2,
        color: "#e8d098",
        maxW: w * 0.86,
        shadow: "#1a1008",
        shadowA: 0.7,
      });
      if (o.sub)
        X.text(ctx, o.sub, w / 2, h * 0.64, {
          font: "serif",
          size: h * 0.12,
          italic: true,
          weight: "normal",
          color: "#e0c890",
          maxW: w * 0.86,
        });
      X.text(
        ctx,
        o.foot || "NEW YORK LANDMARKS PRESERVATION COMMISSION",
        w / 2,
        h * 0.85,
        {
          font: "condensed",
          size: h * 0.06,
          color: "#d0b880",
          spacing: 2,
          maxW: w * 0.8,
        },
      );
      X.blotches(ctx, w, h, r, {
        count: 8,
        color: "#3c6a58",
        alpha: 0.5,
        rmin: h * 0.05,
        rmax: h * 0.25,
      }); // verdigris
      ageSign(ctx, w, h, r, 0.4, true);
    },
    exit(ctx, w, h, text, o, r) {
      ctx.fillStyle = "#e8e4d8";
      ctx.fillRect(0, 0, w, h);
      X.text(ctx, text || "EXIT", w / 2, h * 0.52, {
        font: "helv",
        size: h * 0.62,
        color: "#1a8a3a",
        maxW: w * 0.85,
      });
      ageSign(ctx, w, h, r, 0.5, false);
    },
    gilt(ctx, w, h, text, o, r) {
      ctx.fillStyle = "#0e0e0c";
      ctx.fillRect(0, 0, w, h);
      X.text(ctx, text, w / 2, h * 0.5, {
        font: o.font || "deco",
        size: h * 0.5,
        color: "#d8b050",
        stroke: "#6a4a18",
        strokeW: h * 0.02,
        maxW: w * 0.9,
        spacing: 3,
      });
      ageSign(ctx, w, h, r, 0.35, false);
    },
  };
  const SIGN_SIZE = {
    street: [512, 96],
    subway: [768, 128],
    shop: [512, 128],
    wood: [512, 160],
    metal: [512, 192],
    warning: [512, 192],
    danger: [384, 256],
    enamel: [512, 192],
    cryo: [640, 160],
    marquee: [768, 256],
    lightbox: [512, 160],
    banner: [256, 512],
    plaque: [512, 320],
    exit: [256, 96],
    gilt: [512, 128],
  };

  /** Pixel size a sign of this text/style would get (long text widens horizontal signs). */
  function signSize(text, style, opts) {
    let [w, h] = SIGN_SIZE[style];
    if (opts.w) w = opts.w;
    if (opts.h) h = opts.h;
    if (
      !opts.w &&
      style !== "banner" &&
      style !== "danger" &&
      style !== "plaque"
    ) {
      const need =
        measure(String(text).split("\n")[0], h * 0.55, "helv", "bold") +
        h * 1.4;
      w = Math.min(1024, Math.max(w, Math.ceil(need / 64) * 64));
    }
    return [w, h];
  }
  /** Paint a sign into a fresh (uncached, untracked) canvas — for callers that pack their own atlases. */
  X.signCanvas = function (text, style, opts) {
    opts = opts || {};
    if (!STYLES[style]) style = "shop";
    const [w, h] = signSize(text, style, opts);
    const key = style + "|" + text + "|" + JSON.stringify(opts);
    const cv = X.canvas(w, h),
      r = X.rng(X.seedOf(key));
    try {
      STYLES[style](cv.ctx, w, h, String(text), opts, r);
    } catch (e) {
      G.reportError("textures:sign:" + style, e);
    }
    if (!opts.clean && WEATHER_SIGN[style]) {
      try {
        rustSign(cv.ctx, w, h, r, WEATHER_SIGN[style], opts);
      } catch (e) {
        G.reportError("textures:signage:" + style, e);
      }
    }
    return cv.c;
  };
  /**
   * Pack many signs into ONE texture (e.g. every street-name sign in the city): one GPU upload instead of
   * one texture per street. list: [{text, style, opts}] or strings (style defaults to opts.style||'street').
   * Returns {texture, rects: [{u0, v0, u1, v1, aspect}] (same order; v up, for geometry UVs), byText: {text: rect}}.
   * Cached by the list contents.
   */
  const atlasCache = new Map();
  X.signAtlas = function (list, o) {
    o = o || {};
    const items = (list || []).map((it) =>
      typeof it === "string"
        ? { text: it, style: o.style || "street", opts: o.opts || {} }
        : {
            text: String(it.text),
            style: it.style || o.style || "street",
            opts: it.opts || {},
          },
    );
    const key =
      JSON.stringify(items) +
      "|" +
      JSON.stringify([o.grid, o.cellW, o.cellH, o.width]);
    if (atlasCache.has(key)) return atlasCache.get(key);
    // o.grid = [cols, rows] (+ o.cellW): fixed row-major cells, cell i at column i % cols, row floor(i / cols) from the top —
    // the same layout as map's M.cellUV(i, cols, rows) — and every sign is painted AT the cell's aspect (lettering fitted
    // inside the board), so a hand-made atlas can be swapped for this one without changing any UVs.
    const grid =
      Array.isArray(o.grid) && o.grid[0] > 0 && o.grid[1] > 0 ? o.grid : null;
    const W = grid ? grid[0] * (o.cellW || 512) : o.width || 2048,
      cellH = o.cellH || 64,
      pad = grid ? 0 : 2;
    // shelf packing at a common cell height; sign widths scaled to keep their aspect
    const cells = items.map((it, i) => {
      if (grid) {
        const cw = o.cellW || 512;
        return {
          it,
          cw,
          aspect: cw / cellH,
          x: (i % grid[0]) * cw,
          y: Math.floor(i / grid[0]) * cellH,
        };
      }
      const [w, h] = signSize(
        it.text,
        STYLES[it.style] ? it.style : "shop",
        it.opts,
      );
      const cw = Math.min(W - pad * 2, Math.round((w * cellH) / h));
      return { it, cw, aspect: w / h };
    });
    let x = pad,
      y = pad;
    if (!grid)
      for (const c of cells) {
        if (x + c.cw + pad > W) {
          x = pad;
          y += cellH + pad;
        }
        c.x = x;
        c.y = y;
        x += c.cw + pad;
      }
    const H = grid
      ? grid[1] * cellH
      : Math.min(
          4096,
          Math.pow(2, Math.ceil(Math.log2(Math.max(64, y + cellH + pad)))),
        );
    const paintAll = () => {
      const cv = X.canvas(W, H);
      for (const c of cells) {
        if (c.y + cellH > H) continue;
        const k = Math.max(1, 128 / cellH);
        const src = X.signCanvas(
          c.it.text,
          c.it.style,
          grid
            ? Object.assign({}, c.it.opts, {
                w: Math.round(c.cw * k),
                h: Math.round(cellH * k),
              })
            : c.it.opts,
        );
        cv.ctx.drawImage(src, c.x, c.y, c.cw, cellH);
      }
      return cv.c;
    };
    const tex = X.toTexture(paintAll(), {
      repeat: false,
      name: "sign_atlas_" + items.length,
      regen: paintAll,
    });
    const rects = cells.map((c) => ({
      u0: c.x / W,
      u1: (c.x + c.cw) / W,
      v0: 1 - (c.y + cellH) / H,
      v1: 1 - c.y / H,
      aspect: c.aspect,
    }));
    const byText = {};
    items.forEach((it, i) => {
      byText[it.text] = rects[i];
    });
    const res = { texture: tex, rects, byText, width: W, height: H };
    atlasCache.set(key, res);
    return res;
  };

  X.signTex = function (text, style, opts) {
    opts = opts || {};
    if (style === "neon") return X.neonTex(text, opts.color || 0xff3366, opts);
    if (!STYLES[style]) style = "shop";
    const key = style + "|" + text + "|" + JSON.stringify(opts);
    if (signCache.has(key)) return signCache.get(key);
    let [w, h] = signSize(text, style, opts);
    const paint = () => {
      const cv = X.canvas(w, h),
        r = X.rng(X.seedOf(key));
      try {
        STYLES[style](cv.ctx, w, h, String(text), opts, r);
      } catch (e) {
        G.reportError("textures:sign:" + style, e);
      }
      // decades outdoors: rust bleeding from edges & bolts, chipped paint, sun fade, dents (opts.clean skips)
      if (!opts.clean && WEATHER_SIGN[style]) {
        try {
          rustSign(cv.ctx, w, h, r, WEATHER_SIGN[style], opts);
        } catch (e) {
          G.reportError("textures:signage:" + style, e);
        }
      }
      return cv;
    };
    const cv = paint();
    const tex = finish(
      cv,
      key,
      style === "wood" || style === "banner",
      () => paint().c,
    );
    signCache.set(key, tex);
    return tex;
  };

  // ------------------------------------------------------------------
  // NEON
  // ------------------------------------------------------------------
  function neonStroke(ctx, drawPath, col, lw, lit) {
    // unlit glass tube
    ctx.save();
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    drawPath();
    ctx.strokeStyle = X.css(X.shade(col, -0.55));
    ctx.lineWidth = lw * 1.3;
    ctx.stroke();
    if (lit) {
      ctx.shadowColor = X.css(col);
      ctx.shadowBlur = lw * 5;
      drawPath();
      ctx.strokeStyle = X.css(col);
      ctx.lineWidth = lw;
      ctx.stroke();
      ctx.shadowBlur = lw * 2;
      drawPath();
      ctx.strokeStyle = X.css(X.shade(col, 0.6));
      ctx.lineWidth = lw * 0.45;
      ctx.stroke();
    }
    ctx.restore();
  }
  const NEON_ICONS = {
    arrow(ctx, x, y, s) {
      ctx.beginPath();
      ctx.moveTo(x - s, y);
      ctx.lineTo(x + s * 0.6, y);
      ctx.moveTo(x + s * 0.1, y - s * 0.5);
      ctx.lineTo(x + s * 0.7, y);
      ctx.lineTo(x + s * 0.1, y + s * 0.5);
    },
    star(ctx, x, y, s) {
      X.starPath(ctx, x, y, s, s * 0.42, 5);
    },
    sun(ctx, x, y, s) {
      ctx.beginPath();
      ctx.moveTo(x + s * 0.45, y);
      ctx.arc(x, y, s * 0.45, 0, TAU);
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * TAU,
          k = i % 2 ? 0.85 : 1.05;
        ctx.moveTo(x + Math.cos(a) * s * 0.62, y + Math.sin(a) * s * 0.62);
        ctx.lineTo(x + Math.cos(a) * s * k, y + Math.sin(a) * s * k);
      }
    },
    snowflake(ctx, x, y, s) {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * TAU - Math.PI / 2,
          ca = Math.cos(a),
          sa = Math.sin(a);
        ctx.moveTo(x, y);
        ctx.lineTo(x + ca * s, y + sa * s);
        for (const d of [-1, 1]) {
          const b = a + (d * Math.PI) / 4;
          ctx.moveTo(x + ca * s * 0.55, y + sa * s * 0.55);
          ctx.lineTo(
            x + ca * s * 0.55 + Math.cos(b) * s * 0.3,
            y + sa * s * 0.55 + Math.sin(b) * s * 0.3,
          );
        }
      }
    },
    martini(ctx, x, y, s) {
      ctx.beginPath();
      ctx.moveTo(x - s * 0.7, y - s * 0.7);
      ctx.lineTo(x + s * 0.7, y - s * 0.7);
      ctx.lineTo(x, y + s * 0.1);
      ctx.closePath();
      ctx.moveTo(x, y + s * 0.1);
      ctx.lineTo(x, y + s * 0.8);
      ctx.moveTo(x - s * 0.4, y + s * 0.8);
      ctx.lineTo(x + s * 0.4, y + s * 0.8);
    },
    cola(ctx, x, y, s) {
      ctx.beginPath();
      ctx.moveTo(x - s * 0.15, y - s);
      ctx.lineTo(x - s * 0.15, y - s * 0.5);
      ctx.quadraticCurveTo(x - s * 0.5, y - s * 0.2, x - s * 0.35, y + s);
      ctx.lineTo(x + s * 0.35, y + s);
      ctx.quadraticCurveTo(x + s * 0.5, y - s * 0.2, x + s * 0.15, y - s * 0.5);
      ctx.lineTo(x + s * 0.15, y - s);
      ctx.closePath();
    },
    heart(ctx, x, y, s) {
      ctx.beginPath();
      ctx.moveTo(x, y + s * 0.8);
      ctx.bezierCurveTo(
        x - s * 1.2,
        y - s * 0.1,
        x - s * 0.6,
        y - s,
        x,
        y - s * 0.4,
      );
      ctx.bezierCurveTo(
        x + s * 0.6,
        y - s,
        x + s * 1.2,
        y - s * 0.1,
        x,
        y + s * 0.8,
      );
    },
    eye(ctx, x, y, s) {
      ctx.beginPath();
      ctx.moveTo(x - s, y);
      ctx.quadraticCurveTo(x, y - s * 0.8, x + s, y);
      ctx.quadraticCurveTo(x, y + s * 0.8, x - s, y);
      ctx.moveTo(x + s * 0.3, y);
      ctx.arc(x, y, s * 0.3, 0, TAU);
    },
    skull(ctx, x, y, s) {
      ctx.beginPath();
      ctx.arc(x, y - s * 0.2, s * 0.6, Math.PI * 0.8, Math.PI * 2.2);
      ctx.lineTo(x + s * 0.35, y + s * 0.6);
      ctx.lineTo(x - s * 0.35, y + s * 0.6);
      ctx.closePath();
      ctx.moveTo(x - s * 0.1, y - s * 0.2);
      ctx.arc(x - s * 0.25, y - s * 0.2, s * 0.15, 0, TAU);
      ctx.moveTo(x + s * 0.4, y - s * 0.2);
      ctx.arc(x + s * 0.25, y - s * 0.2, s * 0.15, 0, TAU);
    },
    bottle(ctx, x, y, s) {
      NEON_ICONS.cola(ctx, x, y, s);
    },
  };
  const neonDayMake = new WeakMap(),
    neonDay = new WeakMap();
  /** Albedo (unlit glass on a sheet-metal can) twin of a neon texture from X.neonTex, or null. */
  X.neonDayTex = function (tex) {
    if (!tex) return null;
    if (neonDay.has(tex)) return neonDay.get(tex);
    const mk = neonDayMake.get(tex);
    if (!mk) return null;
    let d = null;
    try {
      d = mk();
    } catch (e) {
      G.reportError("textures:neonDay", e);
    }
    neonDay.set(tex, d);
    return d;
  };
  X.neonTex = function (text, color, opts) {
    opts = opts || {};
    const col =
      typeof color === "number"
        ? X.hex(color)
        : X.hex(
            X.NEON_COLORS && X.NEON_COLORS[color] !== undefined
              ? X.NEON_COLORS[color]
              : color,
          );
    const key = text + "|" + col.join(",") + "|" + JSON.stringify(opts);
    if (neonCache.has(key)) return neonCache.get(key);
    // mode 'lit' = the emissive map (glowing tubes + halo on black), 'day' = the albedo: the same tubes as unlit coated
    // glass on a weathered sheet-metal backing ("can") with stand-off clips, rust and dirt — so a neon sign reads as a
    // physical object by day and only the tubes (never the backing) glow at night.
    const paint = (mode) => {
      const day = mode === "day";
      const font = opts.font || "script",
        h = opts.h || 160,
        size = h * (opts.sub ? 0.46 : 0.58);
      const lines = String(text);
      const tw = measure(
        lines,
        size,
        font,
        font === "script" ? "normal" : "bold",
      );
      const iconW = opts.icon ? h * 0.9 : 0;
      const w = Math.min(
        1024,
        Math.max(128, Math.ceil((tw + iconW + h * 0.6) / 32) * 32),
      );
      const cv = X.canvas(w, h),
        ctx = cv.ctx,
        r = X.rng(X.seedOf(key));
      const lw = Math.max(2, h * 0.03);
      if (day && !opts.transparent) {
        // enamelled sheet-metal can: dark paint, lighter folded rim, rust bloom from the edges, rivets
        const g = ctx.createLinearGradient(0, 0, 0, h);
        g.addColorStop(0, "#2a2624");
        g.addColorStop(0.5, "#1c1a19");
        g.addColorStop(1, "#141211");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
        ctx.strokeStyle = "#4a4440";
        ctx.lineWidth = h * 0.035;
        ctx.strokeRect(h * 0.02, h * 0.02, w - h * 0.04, h - h * 0.04);
        const rr = X.rng(X.seedOf(key + "can"));
        X.blotches(ctx, w, h, rr, {
          count: 10,
          color: "#5a2c12",
          alpha: 0.45,
          rmin: h * 0.04,
          rmax: h * 0.22,
        });
        X.streaks(ctx, w, h, rr, {
          count: 10,
          color: "#4a2410",
          alpha: 0.35,
          minLen: h * 0.2,
          maxLen: h * 0.8,
          maxW: 3,
        });
        for (let x = h * 0.12; x < w; x += h * 0.9)
          for (const y of [h * 0.08, h * 0.92]) {
            ctx.beginPath();
            ctx.arc(x, y, h * 0.018, 0, TAU);
            ctx.fillStyle = "#6a625a";
            ctx.fill();
          }
      } else if (!opts.transparent) {
        ctx.fillStyle = "#060506";
        ctx.fillRect(0, 0, w, h);
      }
      // unlit coated glass: the phosphor coat makes tubes pale, tinted towards their colour; dark wet shadow on the can
      const glassCol = X.mix(col, [236, 232, 222], 0.55);
      const tube = (drawPath, c, lwi, lit) => {
        if (!day) {
          neonStroke(ctx, drawPath, c, lwi, lit);
          return;
        }
        const gc = X.mix(c, [236, 232, 222], 0.55);
        ctx.save();
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        if (!opts.transparent) {
          ctx.translate(lwi * 0.8, lwi * 1.1);
          drawPath();
          ctx.strokeStyle = "rgba(0,0,0,0.6)";
          ctx.lineWidth = lwi * 1.5;
          ctx.stroke();
          ctx.setTransform(1, 0, 0, 1, 0, 0);
        }
        drawPath();
        ctx.strokeStyle = X.css(X.shade(gc, -0.35));
        ctx.lineWidth = lwi * 1.25;
        ctx.stroke();
        drawPath();
        ctx.strokeStyle = X.css(gc);
        ctx.lineWidth = lwi * 0.85;
        ctx.stroke();
        ctx.translate(-lwi * 0.15, -lwi * 0.2);
        drawPath();
        ctx.strokeStyle = "rgba(255,255,250,0.55)";
        ctx.lineWidth = lwi * 0.25;
        ctx.stroke();
        ctx.restore();
      };
      // tube border
      if (opts.border)
        tube(
          () => {
            X.rrect(ctx, lw * 2, lw * 2, w - lw * 4, h - lw * 4, h * 0.18);
          },
          opts.borderColor ? X.hex(opts.borderColor) : col,
          lw * 0.9,
          true,
        );
      const nIcon = opts.icon;
      if (nIcon && NEON_ICONS[nIcon])
        tube(
          () => NEON_ICONS[nIcon](ctx, h * 0.55, h / 2, h * 0.3),
          opts.iconColor ? X.hex(opts.iconColor) : col,
          lw,
          true,
        );
      // lettering — each glyph separately so some tubes can be dead
      X.setFont(
        ctx,
        lines,
        size,
        font,
        null,
        font === "script" ? "normal" : "bold",
      );
      ctx.textBaseline = "middle";
      ctx.textAlign = "left";
      let x = (w + iconW - tw) / 2;
      const y = opts.sub ? h * 0.4 : h * 0.52;
      const broken = opts.broken === undefined ? 0.08 : opts.broken;
      for (const ch of Array.from(lines)) {
        const cw = ctx.measureText(ch).width;
        const lit = r() >= broken || ch === " ";
        ctx.save();
        ctx.lineJoin = "round";
        if (day) {
          if (!opts.transparent) {
            ctx.strokeStyle = "rgba(0,0,0,0.55)";
            ctx.lineWidth = lw * 1.5;
            ctx.strokeText(ch, x + lw * 0.8, y + lw * 1.1);
          }
          ctx.strokeStyle = X.css(X.shade(glassCol, -0.35));
          ctx.lineWidth = lw * 1.25;
          ctx.strokeText(ch, x, y);
          ctx.strokeStyle = X.css(lit ? glassCol : X.shade(glassCol, -0.25));
          ctx.lineWidth = lw * 0.85;
          ctx.strokeText(ch, x, y);
          ctx.strokeStyle = "rgba(255,255,250,0.5)";
          ctx.lineWidth = lw * 0.25;
          ctx.strokeText(ch, x - lw * 0.15, y - lw * 0.2);
          if (ch !== " ") {
            // stand-off clips holding the tube off the can + black electrode boots
            ctx.fillStyle = "#8a8680";
            ctx.fillRect(x + cw * 0.3, y + size * 0.3, lw * 0.8, lw * 1.6);
            ctx.fillStyle = "#0c0c0c";
            ctx.fillRect(x + cw * 0.12, y + size * 0.26, lw * 1.2, lw * 2.2);
          }
        } else {
          ctx.strokeStyle = X.css(X.shade(col, -0.6));
          ctx.lineWidth = lw * 1.2;
          ctx.strokeText(ch, x, y);
          if (lit) {
            ctx.shadowColor = X.css(col);
            ctx.shadowBlur = lw * 6;
            ctx.strokeStyle = X.css(col);
            ctx.lineWidth = lw;
            ctx.strokeText(ch, x, y);
            ctx.shadowBlur = lw * 2;
            ctx.strokeStyle = X.css(X.shade(col, 0.65));
            ctx.lineWidth = lw * 0.4;
            ctx.strokeText(ch, x, y);
          }
        }
        ctx.restore();
        x += cw;
      }
      if (opts.sub) {
        const sc = opts.subColor ? X.hex(opts.subColor) : col;
        X.setFont(ctx, opts.sub, h * 0.2, "condensed", w * 0.85, "bold");
        ctx.textAlign = "center";
        ctx.save();
        if (day) {
          ctx.strokeStyle = X.css(X.mix(sc, [236, 232, 222], 0.55));
          ctx.lineWidth = lw * 0.6;
        } else {
          ctx.shadowColor = X.css(sc);
          ctx.shadowBlur = lw * 4;
          ctx.strokeStyle = X.css(sc);
          ctx.lineWidth = lw * 0.6;
        }
        ctx.strokeText(opts.sub, w / 2, h * 0.8);
        ctx.restore();
      }
      // dust & grime over the whole day face (tubes included)
      if (day && !opts.transparent)
        ageSign(ctx, w, h, X.rng(X.seedOf(key + "age")), 0.5, true);
      return cv;
    };
    const cv = paint("lit"),
      w = cv.w,
      h = cv.h;
    const tex = X.toTexture(cv.c, {
      repeat: false,
      name: "neon_" + text,
      regen: () => paint("lit").c,
    });
    tex.userData.aspect = w / h;
    tex.userData.alpha = !!opts.transparent;
    // albedo twin, built on first request (G.mats.neon). Kept in a WeakMap, not userData: three.js deep-copies
    // userData through JSON when a texture is cloned.
    neonDayMake.set(tex, () => {
      const d = X.toTexture(paint("day").c, {
        repeat: false,
        name: "neonday_" + text,
        regen: () => paint("day").c,
      });
      d.userData.aspect = w / h;
      d.userData.alpha = !!opts.transparent;
      return d;
    });
    neonCache.set(key, tex);
    return tex;
  };

  // ------------------------------------------------------------------
  // DECALS (RGBA, centred, soft edges)
  // ------------------------------------------------------------------
  function bloodSplat(ctx, s, r, col, big) {
    const c = s / 2;
    ctx.fillStyle = col;
    X.smoothBlob(
      ctx,
      c,
      c,
      s * (big ? 0.3 : 0.2),
      s * (big ? 0.26 : 0.18),
      r,
      14,
      0.5,
    );
    ctx.fill();
    for (let k = 0; k < (big ? 30 : 22); k++) {
      const a = r() * TAU,
        d = s * (0.15 + r() * 0.3),
        rr = s * (0.005 + r() * r() * 0.04);
      ctx.beginPath();
      ctx.arc(c + Math.cos(a) * d, c + Math.sin(a) * d, rr, 0, TAU);
      ctx.fill();
      if (r() < 0.4) {
        ctx.beginPath();
        ctx.moveTo(c + Math.cos(a) * s * 0.12, c + Math.sin(a) * s * 0.12);
        ctx.lineTo(c + Math.cos(a) * d, c + Math.sin(a) * d);
        ctx.lineWidth = rr * 1.2;
        ctx.strokeStyle = col;
        ctx.stroke();
      }
    }
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    X.smoothBlob(ctx, c, c, s * 0.12, s * 0.1, r, 10, 0.5);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.12)";
    X.smoothBlob(
      ctx,
      c - s * 0.05,
      c - s * 0.05,
      s * 0.05,
      s * 0.03,
      r,
      8,
      0.5,
    );
    ctx.fill();
  }
  function radialFade(ctx, s, inner) {
    ctx.save();
    ctx.globalCompositeOperation = "destination-in";
    const g = ctx.createRadialGradient(
      s / 2,
      s / 2,
      s * (inner || 0.3),
      s / 2,
      s / 2,
      s / 2,
    );
    g.addColorStop(0, "rgba(0,0,0,1)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, s, s);
    ctx.restore();
  }

  const GRAF = [
    "REPENT",
    "KILROY WAS HERE",
    "THE END IS NIGH",
    "NO SCRIP NO SERVICE",
    "MANIACS AFTER DARK",
    "BRUTES KEEP OUT",
    "HELP",
    "WE WERE HERE",
    "RIPJAW! RUN",
    "TOLL = 20 SCRIP",
  ];
  const DECALS = {
    blood_splat(ctx, s, r) {
      bloodSplat(ctx, s, r, "rgba(90,6,4,0.92)", false);
    },
    blood_pool(ctx, s, r) {
      ctx.fillStyle = "rgba(70,4,2,0.9)";
      X.smoothBlob(ctx, s / 2, s / 2, s * 0.4, s * 0.3, r, 16, 0.35);
      ctx.fill();
      ctx.fillStyle = "rgba(40,0,0,0.5)";
      X.smoothBlob(ctx, s / 2, s / 2, s * 0.25, s * 0.18, r, 12, 0.4);
      ctx.fill();
      ctx.fillStyle = "rgba(255,220,220,0.15)";
      X.smoothBlob(ctx, s * 0.4, s * 0.42, s * 0.12, s * 0.05, r, 10, 0.3);
      ctx.fill();
    },
    blood_smear(ctx, s, r) {
      ctx.strokeStyle = "rgba(80,6,4,0.8)";
      ctx.lineCap = "round";
      for (let k = 0; k < 4; k++) {
        ctx.lineWidth = s * (0.03 + r() * 0.04);
        ctx.beginPath();
        ctx.moveTo(s * 0.15, s * (0.35 + k * 0.08));
        ctx.bezierCurveTo(
          s * 0.4,
          s * (0.3 + k * 0.1),
          s * 0.6,
          s * (0.45 + k * 0.05),
          s * 0.88,
          s * (0.4 + k * 0.08 + r() * 0.05),
        );
        ctx.stroke();
      }
    },
    blood_drips(ctx, s, r) {
      bloodSplat(ctx, s, r, "rgba(90,6,4,0.9)", false);
      ctx.fillStyle = "rgba(80,6,4,0.85)";
      for (let k = 0; k < 7; k++) {
        const x = s * (0.35 + r() * 0.3),
          l = s * (0.1 + r() * 0.35);
        ctx.fillRect(x, s / 2, s * 0.012, l);
        ctx.beginPath();
        ctx.arc(x + s * 0.006, s / 2 + l, s * 0.012, 0, TAU);
        ctx.fill();
      }
    },
    blood_green(ctx, s, r) {
      bloodSplat(ctx, s, r, "rgba(70,110,20,0.9)", false);
    },
    scorch(ctx, s, r) {
      const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
      g.addColorStop(0, "rgba(8,6,4,0.95)");
      g.addColorStop(0.5, "rgba(20,14,10,0.7)");
      g.addColorStop(1, "rgba(30,20,12,0)");
      ctx.fillStyle = g;
      X.smoothBlob(ctx, s / 2, s / 2, s * 0.48, s * 0.48, r, 18, 0.35);
      ctx.fill();
      ctx.strokeStyle = "rgba(10,8,6,0.6)";
      for (let k = 0; k < 24; k++) {
        const a = r() * TAU;
        ctx.lineWidth = 1 + r() * 3;
        ctx.beginPath();
        ctx.moveTo(
          s / 2 + Math.cos(a) * s * 0.2,
          s / 2 + Math.sin(a) * s * 0.2,
        );
        ctx.lineTo(
          s / 2 + Math.cos(a) * s * 0.48,
          s / 2 + Math.sin(a) * s * 0.48,
        );
        ctx.stroke();
      }
    },
    // a burst / scatter of strikes (varied calibre, soft craters in irregular lighter spalls), kept inside the decal
    bullet_holes(ctx, s, r) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(s * 0.08, s * 0.08, s * 0.84, s * 0.84);
      ctx.clip();
      X.bulletStrikes(ctx, s, s, r, {
        count: 1,
        cx: s * (0.4 + r() * 0.2),
        cy: s * (0.4 + r() * 0.2),
        spread: s * 0.55,
        size: s * 0.011,
      });
      ctx.restore();
    },
    bullet_hole(ctx, s, r) {
      X.bulletHole(ctx, s / 2, s / 2, s * 0.08, r, false);
    },
    cracks(ctx, s, r) {
      X.cracks(ctx, s, s, r, {
        count: 3,
        width: 2,
        seg: s * 0.03,
        steps: 16,
        color: "rgba(20,16,12,0.85)",
        highlight: "rgba(230,220,200,0.3)",
      });
      radialFade(ctx, s, 0.3);
    },
    crack_ground(ctx, s, r) {
      for (let k = 0; k < 5; k++) {
        let x = s / 2,
          y = s / 2,
          a = (k / 5) * TAU + r() * 0.5;
        ctx.strokeStyle = "rgba(15,12,10,0.85)";
        ctx.lineWidth = s * 0.012;
        ctx.beginPath();
        ctx.moveTo(x, y);
        for (let q = 0; q < 12; q++) {
          a += (r() - 0.5) * 0.7;
          x += Math.cos(a) * s * 0.035;
          y += Math.sin(a) * s * 0.035;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      radialFade(ctx, s, 0.25);
    },
    puddle(ctx, s, r) {
      ctx.fillStyle = "rgba(30,34,28,0.75)";
      X.smoothBlob(ctx, s / 2, s / 2, s * 0.44, s * 0.3, r, 18, 0.4);
      ctx.fill();
      ctx.fillStyle = "rgba(160,170,150,0.18)";
      X.smoothBlob(ctx, s * 0.45, s * 0.45, s * 0.25, s * 0.1, r, 10, 0.4);
      ctx.fill();
    },
    rad_puddle(ctx, s, r) {
      const g = ctx.createRadialGradient(
        s / 2,
        s / 2,
        0,
        s / 2,
        s / 2,
        s * 0.45,
      );
      g.addColorStop(0, "rgba(140,255,90,0.95)");
      g.addColorStop(0.6, "rgba(60,200,40,0.8)");
      g.addColorStop(1, "rgba(30,120,20,0)");
      ctx.fillStyle = g;
      X.smoothBlob(ctx, s / 2, s / 2, s * 0.45, s * 0.34, r, 16, 0.4);
      ctx.fill();
    },
    oil_stain(ctx, s, r) {
      ctx.fillStyle = "rgba(12,12,12,0.7)";
      X.smoothBlob(ctx, s / 2, s / 2, s * 0.35, s * 0.28, r, 14, 0.5);
      ctx.fill();
      ctx.fillStyle = "rgba(12,12,12,0.4)";
      for (let k = 0; k < 6; k++) {
        X.smoothBlob(
          ctx,
          s * (0.2 + r() * 0.6),
          s * (0.2 + r() * 0.6),
          s * 0.06,
          s * 0.05,
          r,
          8,
          0.5,
        );
        ctx.fill();
      }
      radialFade(ctx, s, 0.35);
    },
    rust_stain(ctx, s, r) {
      const g = ctx.createLinearGradient(0, s * 0.1, 0, s);
      g.addColorStop(0, "rgba(130,60,20,0.8)");
      g.addColorStop(1, "rgba(130,60,20,0)");
      ctx.fillStyle = g;
      for (let k = 0; k < 6; k++) {
        const x = s * (0.3 + r() * 0.4),
          ww = s * (0.02 + r() * 0.06);
        ctx.fillRect(x, s * 0.1, ww, s * (0.4 + r() * 0.5));
      }
    },
    water_stain(ctx, s, r) {
      ctx.fillStyle = "rgba(90,70,40,0.25)";
      X.smoothBlob(ctx, s / 2, s / 2, s * 0.4, s * 0.4, r, 14, 0.4);
      ctx.fill();
      ctx.strokeStyle = "rgba(80,55,25,0.5)";
      ctx.lineWidth = s * 0.012;
      ctx.stroke();
    },
    dirt_patch(ctx, s, r) {
      ctx.fillStyle = "rgba(70,56,36,0.8)";
      X.smoothBlob(ctx, s / 2, s / 2, s * 0.45, s * 0.4, r, 18, 0.5);
      ctx.fill();
      X.speckle(ctx, s, s, r, {
        count: 400,
        colors: ["#3a2c1a", "#8a7454"],
        min: 0.5,
        max: 2,
        alpha: 0.7,
      });
      radialFade(ctx, s, 0.2);
    },
    moss(ctx, s, r) {
      X.speckle(ctx, s, s, r, {
        count: 900,
        colors: ["#3a4a1e", "#4e5a26", "#2a3614"],
        min: 1,
        max: 4,
        alpha: 0.8,
      });
      radialFade(ctx, s, 0.1);
    },
    leaves(ctx, s, r) {
      for (let k = 0; k < 60; k++) {
        const x = s * (0.1 + r() * 0.8),
          y = s * (0.1 + r() * 0.8);
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(r() * TAU);
        ctx.fillStyle = X.css(
          ["#6a4a22", "#8a6a30", "#5a3a1a", "#7a5a2a"][(r() * 4) | 0],
          0.9,
        );
        ctx.beginPath();
        ctx.ellipse(0, 0, s * 0.03, s * 0.015, 0, 0, TAU);
        ctx.fill();
        ctx.restore();
      }
      radialFade(ctx, s, 0.3);
    },
    paper_litter(ctx, s, r) {
      for (let k = 0; k < 14; k++) {
        const x = s * (0.15 + r() * 0.7),
          y = s * (0.15 + r() * 0.7);
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(r() * TAU);
        ctx.fillStyle = X.css(
          ["#d8cca8", "#c8bc98", "#e8e0c8"][(r() * 3) | 0],
          0.95,
        );
        ctx.fillRect(-s * 0.04, -s * 0.05, s * 0.08, s * 0.1);
        ctx.fillStyle = "rgba(40,36,30,0.4)";
        for (let l = 0; l < 5; l++)
          ctx.fillRect(-s * 0.03, -s * 0.04 + l * s * 0.018, s * 0.06, 1);
        ctx.restore();
      }
    },
    footprints(ctx, s, r) {
      ctx.fillStyle = "rgba(40,30,20,0.5)";
      for (let k = 0; k < 6; k++) {
        const y = s * (0.9 - k * 0.15),
          x = s * 0.5 + (k % 2 ? 0.08 : -0.08) * s;
        ctx.beginPath();
        ctx.ellipse(x, y, s * 0.03, s * 0.055, 0, 0, TAU);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(x, y + s * 0.07, s * 0.025, s * 0.02, 0, 0, TAU);
        ctx.fill();
      }
    },
    chalk_outline(ctx, s, r) {
      ctx.strokeStyle = "rgba(235,235,225,0.85)";
      ctx.lineWidth = s * 0.012;
      ctx.lineJoin = "round";
      ctx.beginPath();
      A.spline(
        ctx,
        [
          [0.5, 0.12],
          [0.58, 0.2],
          [0.56, 0.3],
          [0.78, 0.28],
          [0.82, 0.34],
          [0.6, 0.4],
          [0.6, 0.6],
          [0.7, 0.85],
          [0.62, 0.88],
          [0.5, 0.65],
          [0.4, 0.88],
          [0.32, 0.85],
          [0.4, 0.6],
          [0.4, 0.4],
          [0.2, 0.45],
          [0.16, 0.38],
          [0.42, 0.3],
          [0.42, 0.2],
        ].map((p) => [p[0] * s, p[1] * s]),
        true,
      );
      ctx.stroke();
    },
    hopscotch(ctx, s, r) {
      ctx.strokeStyle = "rgba(220,200,210,0.75)";
      ctx.lineWidth = s * 0.01;
      const b = s * 0.12,
        cx = s / 2;
      let y = s * 0.9;
      const rows = [1, 1, 2, 1, 2, 1];
      rows.forEach((n, i) => {
        for (let k = 0; k < n; k++)
          ctx.strokeRect(cx - (n * b) / 2 + k * b, y - b, b, b);
        X.text(ctx, String(i + 1), cx, y - b / 2, {
          font: "marker",
          size: b * 0.5,
          color: "rgba(220,200,210,0.75)",
        });
        y -= b;
      });
      ctx.beginPath();
      ctx.arc(cx, y - b * 0.2, b * 0.6, Math.PI, 0);
      ctx.stroke();
    },
    manhole(ctx, s, r) {
      const c = s / 2;
      ctx.beginPath();
      ctx.arc(c, c, s * 0.46, 0, TAU);
      ctx.fillStyle = "#3a3632";
      ctx.fill();
      ctx.strokeStyle = "#1a1816";
      ctx.lineWidth = s * 0.02;
      ctx.stroke();
      ctx.strokeStyle = "rgba(120,110,100,0.8)";
      ctx.lineWidth = s * 0.012;
      for (let k = 0; k < 7; k++) {
        ctx.beginPath();
        ctx.arc(c, c, s * (0.08 + k * 0.05), 0, TAU);
        ctx.stroke();
      }
      X.text(ctx, "N.Y.C. SEWER", c, c, {
        font: "slab",
        size: s * 0.07,
        color: "rgba(140,130,120,0.9)",
      });
      X.blotches(ctx, s, s, r, {
        count: 6,
        color: "#6a3a14",
        alpha: 0.4,
        rmin: s * 0.05,
        rmax: s * 0.15,
      });
      ctx.save();
      ctx.globalCompositeOperation = "destination-in";
      ctx.beginPath();
      ctx.arc(c, c, s * 0.47, 0, TAU);
      ctx.fill();
      ctx.restore();
    },
    drain_grate(ctx, s, r) {
      ctx.fillStyle = "#2a2826";
      ctx.fillRect(s * 0.15, s * 0.3, s * 0.7, s * 0.4);
      ctx.fillStyle = "#0a0a08";
      for (let k = 0; k < 9; k++)
        ctx.fillRect(s * 0.18 + k * s * 0.072, s * 0.33, s * 0.04, s * 0.34);
      ctx.strokeStyle = "#4a4440";
      ctx.lineWidth = s * 0.015;
      ctx.strokeRect(s * 0.15, s * 0.3, s * 0.7, s * 0.4);
    },
    long_winter_emblem(ctx, s, r) {
      A.longWinter(ctx, s / 2, s * 0.46, s * 0.4, {});
      X.text(ctx, "O · C · D", s / 2, s * 0.93, {
        font: "deco",
        size: s * 0.07,
        color: "#1c2e52",
        spacing: 4,
        maxW: s * 0.8,
      });
    },
    cryo_c9(ctx, s, r) {
      // facility door stencil: crystal in a ring + fitted "C-9" + CRYO UNIT caption
      A.longWinter(ctx, s / 2, s * 0.42, s * 0.36, { text: false });
      ctx.beginPath();
      ctx.arc(s / 2, s * 0.42, s * 0.2, 0, TAU);
      ctx.fillStyle = "#1c2e52";
      ctx.fill();
      X.text(ctx, "C-9", s / 2, s * 0.43, {
        font: "stencil",
        size: s * 0.15,
        color: "#eef4f6",
        maxW: s * 0.34,
      });
      X.text(ctx, "CRYO UNIT", s / 2, s * 0.88, {
        font: "stencil",
        size: s * 0.1,
        color: "#e8742a",
        stroke: "#1c2e52",
        strokeW: s * 0.01,
        maxW: s * 0.8,
        spacing: 4,
      });
      X.blotches(ctx, s, s, r, {
        count: 5,
        color: "#1a1410",
        alpha: 0.3,
        rmin: s * 0.04,
        rmax: s * 0.1,
      });
    },
    radiation(ctx, s, r) {
      X.trefoil(ctx, s / 2, s / 2, s * 0.36, "#1a1a1a", "#f0c020");
      X.blotches(ctx, s, s, r, {
        count: 6,
        color: "#5a3a10",
        alpha: 0.35,
        rmin: s * 0.04,
        rmax: s * 0.12,
      });
    },
    radiation_sign(ctx, s, r) {
      ctx.fillStyle = "#f0c020";
      ctx.beginPath();
      ctx.moveTo(s / 2, s * 0.05);
      ctx.lineTo(s * 0.95, s * 0.85);
      ctx.lineTo(s * 0.05, s * 0.85);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#1a1a1a";
      ctx.lineWidth = s * 0.04;
      ctx.stroke();
      X.trefoil(ctx, s / 2, s * 0.58, s * 0.18, "#1a1a1a");
      X.text(ctx, "CAUTION", s / 2, s * 0.93, {
        font: "impact",
        size: s * 0.1,
        color: "#f0c020",
        stroke: "#1a1a1a",
        strokeW: s * 0.02,
      });
    },
    fizzo_logo(ctx, s, r) {
      const c = s / 2;
      ctx.beginPath();
      ctx.arc(c, c, s * 0.44, 0, TAU);
      A.fs(ctx, "#f6eed8", s * 0.03, "#c8241c");
      ctx.beginPath();
      ctx.arc(c, c, s * 0.37, 0, TAU);
      ctx.strokeStyle = "#2a8a84";
      ctx.lineWidth = s * 0.02;
      ctx.stroke();
      X.text(ctx, "Fizzo", c, c - s * 0.03, {
        font: "script",
        size: s * 0.22,
        weight: "normal",
        color: "#c8241c",
        maxW: s * 0.62,
      });
      X.text(ctx, "COLA", c, c + s * 0.17, {
        font: "condensed",
        size: s * 0.08,
        color: "#2a8a84",
        spacing: 4,
      });
      ctx.strokeStyle = "rgba(42,138,132,0.6)";
      ctx.lineWidth = s * 0.008;
      for (let k = 0; k < 7; k++) {
        ctx.beginPath();
        ctx.arc(
          c + (r() - 0.5) * s * 0.5,
          c - s * 0.25 + r() * s * 0.06,
          s * (0.01 + r() * 0.015),
          0,
          TAU,
        );
        ctx.stroke();
      }
    },
    covenant_emblem(ctx, s, r) {
      A.covenant(ctx, s / 2, s * 0.5, s * 0.92);
      X.blotches(ctx, s, s, r, {
        count: 5,
        color: "#3a2a18",
        alpha: 0.25,
        rmin: s * 0.03,
        rmax: s * 0.1,
      });
    },
    continuity_seal(ctx, s, r) {
      A.continuity(ctx, s / 2, s / 2, s * 0.44);
      X.blotches(ctx, s, s, r, {
        count: 4,
        color: "#2a2018",
        alpha: 0.2,
        rmin: s * 0.03,
        rmax: s * 0.09,
      });
    },
    sun_glow(ctx, s, r) {
      ctx.save();
      ctx.shadowColor = "#ffc860";
      ctx.shadowBlur = s * 0.06;
      A.sunDisc(ctx, s / 2, s / 2, s * 0.4, {
        color: "#ffd27a",
        ink: null,
        core: "#fff8e0",
      });
      ctx.restore();
    },
    graffiti_skull(ctx, s, r) {
      X.skullTag(ctx, s / 2, s * 0.35, s * 0.4, "rgba(210,30,20,0.9)");
    },
    graffiti_sleeper(ctx, s, r) {
      ctx.globalAlpha = 0.85;
      A.snowflake(ctx, s * 0.5, s * 0.36, s * 0.22, "#e8eef2", s * 0.03);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = "rgba(216,38,26,0.9)";
      ctx.lineWidth = s * 0.035;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(s * 0.25, s * 0.12);
      ctx.lineTo(s * 0.75, s * 0.6);
      ctx.stroke();
      X.spray(
        ctx,
        "THEY KNEW",
        s * 0.5,
        s * 0.85,
        s * 0.12,
        "#d8261a",
        r,
        -0.1,
      );
    },
    graffiti_arrow(ctx, s, r) {
      ctx.save();
      ctx.strokeStyle = "rgba(240,200,40,0.9)";
      ctx.shadowColor = "#f0c828";
      ctx.shadowBlur = s * 0.02;
      ctx.lineWidth = s * 0.05;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(s * 0.12, s * 0.5);
      ctx.lineTo(s * 0.82, s * 0.5);
      ctx.moveTo(s * 0.6, s * 0.3);
      ctx.lineTo(s * 0.85, s * 0.5);
      ctx.lineTo(s * 0.6, s * 0.7);
      ctx.stroke();
      ctx.restore();
      X.spray(ctx, "SAFE", s * 0.45, s * 0.28, s * 0.12, "#f0c828", r, 0);
    },
    graffiti_raiders(ctx, s, r) {
      X.skullTag(ctx, s * 0.5, s * 0.3, s * 0.25, "rgba(20,20,20,0.9)");
      X.spray(ctx, "FIENDS", s / 2, s * 0.78, s * 0.16, "#d8261a", r, -0.08);
    },
    graffiti_sun(ctx, s, r) {
      ctx.save();
      ctx.shadowColor = "#f2b23a";
      ctx.shadowBlur = s * 0.02;
      A.sunDisc(ctx, s / 2, s * 0.38, s * 0.24, {
        color: "rgba(242,178,58,0.9)",
        ink: null,
      });
      ctx.restore();
      X.spray(
        ctx,
        "WALK IN THE GLOW",
        s / 2,
        s * 0.84,
        s * 0.1,
        "#f2b23a",
        r,
        0,
      );
    },
    graffiti_covenant(ctx, s, r) {
      X.spray(
        ctx,
        "IRON ENDURES",
        s / 2,
        s * 0.5,
        s * 0.11,
        "#e8e0d0",
        r,
        -0.05,
      );
    },
  };
  for (let i = 0; i < GRAF.length; i++)
    DECALS["graffiti_" + (i + 1)] = (ctx, s, r) =>
      X.spray(
        ctx,
        GRAF[i],
        s / 2,
        s / 2,
        Math.min(s * 0.22, (s * 1.5) / Math.max(3, GRAF[i].length)),
        ["#d8261a", "#1e1e1e", "#f4f0e0", "#2a7ad0", "#3ac04a", "#f2c43a"][
          i % 6
        ],
        r,
        (r() - 0.5) * 0.2,
      );
  DECALS.graffiti = DECALS.graffiti_1;
  DECALS.raider_graffiti = DECALS.graffiti_raiders;
  DECALS.blood = DECALS.blood_splat;
  DECALS.crack = DECALS.cracks;
  DECALS.radiation_symbol = DECALS.radiation;
  DECALS.trefoil = DECALS.radiation;
  X.DECALS = DECALS;
  let dynCount = 0;
  const warnedDecal = new Set();
  X.decalTex = function (name) {
    name = String(name || "blood_splat");
    if (decalCache.has(name)) return decalCache.get(name);
    let fn = DECALS[name];
    let dyn = null;
    if (!fn && name.indexOf("graffiti_text:") === 0) {
      dyn = name.slice(14);
      fn = (ctx, s, r) =>
        X.spray(
          ctx,
          dyn,
          s / 2,
          s / 2,
          Math.min(s * 0.22, (s * 1.5) / Math.max(3, dyn.length)),
          "#d8261a",
          r,
          (r() - 0.5) * 0.15,
        );
    }
    if (dyn !== null && dynCount >= 32) {
      // cap: beyond 32 distinct texts reuse the stock tags (memory)
      const t = X.decalTex("graffiti_" + (1 + ((X.seedOf(dyn) >>> 0) % 10)));
      decalCache.set(name, t);
      return t;
    }
    if (!fn) {
      // unknown → alias to an existing decal texture instead of allocating a new one
      const alt =
        name.length >= 3
          ? Object.keys(DECALS).find((k) => k.indexOf(name) === 0)
          : null;
      const t = X.decalTex(alt || "blood_splat");
      if (!warnedDecal.has(name)) {
        warnedDecal.add(name);
        console.warn(
          '[textures] unknown decal "' +
            name +
            '" -> ' +
            (alt || "blood_splat"),
        );
      }
      decalCache.set(name, t);
      return t;
    }
    if (dyn !== null) dynCount++;
    const s =
      (X.DECAL_SIZE && X.DECAL_SIZE[name]) ||
      (/manhole|cryo_|long_winter|covenant|continuity|chalk|hopscotch|graffiti_(sleeper|sun|skull|raiders)/.test(
        name,
      )
        ? 512
        : 256); // 41_story.js sizes its own
    const paint = () => {
      const cv = X.canvas(s, s),
        r = X.rng(X.seedOf("decal:" + name));
      try {
        fn(cv.ctx, s, r);
      } catch (e) {
        G.reportError("textures:decal:" + name, e);
      }
      return cv.c;
    };
    const tex = X.toTexture(paint(), {
      repeat: false,
      name: "decal_" + name,
      regen: paint,
    });
    tex.userData.alpha = true;
    decalCache.set(name, tex);
    return tex;
  };

  // ------------------------------------------------------------------
  // ICONS (128², white-on-transparent line art; iconURL tints)
  // ------------------------------------------------------------------
  const L = (ctx, pts, close) => {
    ctx.beginPath();
    pts.forEach((p, i) =>
      i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]),
    );
    if (close) ctx.closePath();
    ctx.stroke();
  };
  let ICOL = "#ffffff"; // current icon ink (set per draw)
  const ICONS = {
    injector(c) {
      c.save();
      c.translate(64, 64);
      c.rotate(-Math.PI / 4);
      c.strokeRect(-12, -40, 24, 66);
      L(c, [
        [-6, -40],
        [-6, -50],
        [6, -50],
        [6, -40],
      ]);
      L(c, [
        [0, 26],
        [0, 46],
      ]);
      L(c, [
        [-12, -12],
        [12, -12],
      ]);
      L(c, [
        [0, -24],
        [0, 0],
      ]);
      L(c, [
        [-9, -12],
        [9, -12],
      ]);
      c.restore();
    },
    rally_tonic(c) {
      c.beginPath();
      c.moveTo(56, 14);
      c.lineTo(72, 14);
      c.lineTo(72, 34);
      c.quadraticCurveTo(94, 42, 94, 62);
      c.lineTo(94, 110);
      c.lineTo(34, 110);
      c.lineTo(34, 62);
      c.quadraticCurveTo(34, 42, 56, 34);
      c.closePath();
      c.stroke();
      c.strokeRect(42, 64, 44, 30);
      L(c, [
        [64, 70],
        [64, 88],
      ]);
      L(c, [
        [55, 79],
        [73, 79],
      ]);
    },
    prussian_blue(c) {
      c.beginPath();
      c.moveTo(52, 18);
      c.lineTo(76, 18);
      c.lineTo(76, 18);
      c.lineTo(76, 36);
      c.quadraticCurveTo(96, 44, 96, 64);
      c.lineTo(96, 104);
      c.lineTo(32, 104);
      c.lineTo(32, 64);
      c.quadraticCurveTo(32, 44, 52, 36);
      c.closePath();
      c.stroke();
      X.trefoil(c, 64, 76, 14, ICOL);
    },
    iodine_tabs(c) {
      c.beginPath();
      c.roundRect ? c.roundRect(40, 34, 48, 74, 8) : c.rect(40, 34, 48, 74);
      c.stroke();
      c.strokeRect(36, 20, 56, 16);
      L(c, [
        [52, 60],
        [76, 60],
      ]);
      L(c, [
        [64, 60],
        [64, 88],
      ]);
      L(c, [
        [52, 88],
        [76, 88],
      ]);
    },
    morphine(c) {
      c.save();
      c.translate(64, 64);
      c.rotate(Math.PI / 4);
      c.strokeRect(-8, -36, 16, 48);
      L(c, [
        [0, 12],
        [0, 40],
      ]);
      L(c, [
        [-14, -36],
        [14, -36],
      ]);
      c.beginPath();
      c.arc(0, -46, 8, 0, TAU);
      c.stroke();
      c.restore();
    },
    focus_pills(c) {
      c.beginPath();
      c.ellipse(48, 64, 22, 12, -0.6, 0, TAU);
      c.stroke();
      L(c, [
        [36, 74],
        [60, 54],
      ]);
      c.beginPath();
      c.arc(84, 70, 14, 0, TAU);
      c.stroke();
      c.beginPath();
      c.arc(84, 70, 5, 0, TAU);
      c.stroke();
    },
    bull_tabs(c) {
      c.beginPath();
      c.arc(64, 70, 30, 0, TAU);
      c.stroke();
      L(c, [
        [38, 50],
        [24, 30],
        [46, 42],
      ]);
      L(c, [
        [90, 50],
        [104, 30],
        [82, 42],
      ]);
      L(c, [
        [52, 84],
        [76, 84],
      ]);
    },
    rush(c) {
      c.strokeRect(46, 30, 36, 74);
      L(c, [
        [46, 30],
        [56, 16],
        [72, 16],
        [82, 30],
      ]);
      L(c, [
        [58, 50],
        [70, 62],
        [58, 74],
        [70, 86],
      ]);
    },
    rage(c) {
      c.strokeRect(40, 40, 48, 64);
      L(c, [
        [48, 40],
        [48, 28],
        [80, 28],
        [80, 40],
      ]);
      L(c, [
        [52, 60],
        [62, 70],
      ]);
      L(c, [
        [76, 60],
        [66, 70],
      ]);
      L(c, [
        [54, 88],
        [74, 88],
      ]);
    },
    shade_field(c) {
      c.beginPath();
      c.arc(64, 64, 36, 0, TAU);
      c.stroke();
      c.setLineDash ? c.setLineDash([8, 8]) : 0;
      c.beginPath();
      c.arc(64, 64, 22, 0, TAU);
      c.stroke();
      c.setLineDash ? c.setLineDash([]) : 0;
      L(c, [
        [64, 28],
        [64, 14],
      ]);
    },
    fizzo_cola(c) {
      c.beginPath();
      c.moveTo(58, 14);
      c.lineTo(70, 14);
      c.lineTo(70, 40);
      c.quadraticCurveTo(82, 48, 82, 58);
      c.lineTo(82, 112);
      c.lineTo(46, 112);
      c.lineTo(46, 58);
      c.quadraticCurveTo(46, 48, 58, 40);
      c.closePath();
      c.stroke();
      for (let k = 0; k < 4; k++)
        L(c, [
          [46, 72 + k * 10],
          [82, 72 + k * 10],
        ]);
    },
    fizzo_blue(c) {
      ICONS.fizzo_cola(c);
      for (const x of [30, 98])
        L(c, [
          [x, 60],
          [x, 90],
        ]);
    },
    scrip(c) {
      L(
        c,
        [
          [22, 40],
          [94, 30],
          [106, 84],
          [34, 94],
        ],
        true,
      );
      L(c, [
        [58, 35],
        [70, 89],
      ]);
      c.beginPath();
      c.arc(84, 58, 9, 0, TAU);
      c.stroke();
      L(c, [
        [30, 54],
        [50, 51],
      ]);
      L(c, [
        [32, 66],
        [52, 63],
      ]);
    },
    ammo(c) {
      for (let k = 0; k < 3; k++) {
        const x = 38 + k * 22;
        c.beginPath();
        c.moveTo(x, 100);
        c.lineTo(x, 50);
        c.quadraticCurveTo(x + 7, 26, x + 14, 50);
        c.lineTo(x + 14, 100);
        c.closePath();
        c.stroke();
        L(c, [
          [x, 60],
          [x + 14, 60],
        ]);
      }
    },
    pistol(c) {
      L(
        c,
        [
          [20, 46],
          [104, 46],
          [104, 60],
          [58, 60],
          [52, 96],
          [34, 96],
          [40, 60],
          [20, 60],
        ],
        true,
      );
      L(c, [
        [58, 60],
        [64, 74],
        [52, 74],
      ]);
    },
    rifle(c) {
      L(
        c,
        [
          [8, 70],
          [30, 60],
          [70, 58],
          [120, 56],
          [120, 62],
          [70, 66],
          [60, 76],
          [30, 76],
          [8, 84],
        ],
        true,
      );
      c.strokeRect(50, 46, 30, 8);
    },
    shotgun(c) {
      L(
        c,
        [
          [8, 72],
          [34, 62],
          [118, 60],
          [118, 70],
          [40, 72],
          [30, 82],
          [8, 86],
        ],
        true,
      );
      L(c, [
        [60, 70],
        [90, 70],
      ]);
    },
    laser(c) {
      L(
        c,
        [
          [20, 50],
          [96, 50],
          [110, 56],
          [96, 62],
          [56, 62],
          [50, 94],
          [34, 94],
          [40, 62],
          [20, 62],
        ],
        true,
      );
      for (let k = 0; k < 3; k++)
        L(c, [
          [62 + k * 10, 50],
          [62 + k * 10, 62],
        ]);
    },
    plasma(c) {
      c.beginPath();
      c.arc(64, 56, 16, 0, TAU);
      c.stroke();
      L(c, [
        [20, 56],
        [48, 56],
      ]);
      L(c, [
        [80, 56],
        [112, 56],
      ]);
      L(c, [
        [50, 70],
        [44, 98],
        [30, 98],
        [38, 66],
      ]);
    },
    recoilless_rifle(c) {
      c.save();
      c.translate(64, 64);
      c.rotate(-Math.PI / 5);
      c.strokeRect(-46, -12, 92, 24);
      L(c, [
        [-20, 12],
        [-30, 40],
      ]);
      L(c, [
        [10, 12],
        [20, 40],
      ]);
      c.restore();
    },
    recoilless_round(c) {
      c.beginPath();
      c.moveTo(64, 14);
      c.quadraticCurveTo(88, 34, 86, 76);
      c.lineTo(42, 76);
      c.quadraticCurveTo(40, 34, 64, 14);
      c.closePath();
      c.stroke();
      c.strokeRect(54, 76, 20, 16);
      L(c, [
        [44, 112],
        [54, 92],
        [74, 92],
        [84, 112],
      ]);
    },
    grenade(c) {
      c.beginPath();
      c.ellipse(60, 74, 24, 30, 0, 0, TAU);
      c.stroke();
      c.strokeRect(52, 34, 16, 12);
      c.beginPath();
      c.arc(80, 36, 10, 0, TAU);
      c.stroke();
      for (let k = 0; k < 3; k++)
        L(c, [
          [38, 62 + k * 12],
          [82, 62 + k * 12],
        ]);
    },
    mine(c) {
      c.beginPath();
      c.ellipse(64, 76, 42, 16, 0, 0, TAU);
      c.stroke();
      c.beginPath();
      c.ellipse(64, 66, 18, 8, 0, 0, TAU);
      c.stroke();
      L(c, [
        [64, 58],
        [64, 44],
      ]);
    },
    knife(c) {
      L(
        c,
        [
          [20, 100],
          [44, 76],
          [52, 84],
          [28, 108],
        ],
        true,
      );
      L(c, [
        [44, 76],
        [100, 20],
        [104, 24],
        [56, 84],
      ]);
      L(c, [
        [38, 70],
        [58, 90],
      ]);
    },
    bat(c) {
      c.save();
      c.translate(64, 64);
      c.rotate(-Math.PI / 4);
      c.beginPath();
      c.moveTo(-50, -4);
      c.lineTo(10, -8);
      c.quadraticCurveTo(52, -14, 52, 0);
      c.quadraticCurveTo(52, 14, 10, 8);
      c.lineTo(-50, 4);
      c.closePath();
      c.stroke();
      c.restore();
    },
    armor(c) {
      L(
        c,
        [
          [40, 24],
          [30, 30],
          [22, 60],
          [36, 64],
          [38, 106],
          [90, 106],
          [92, 64],
          [106, 60],
          [98, 30],
          [88, 24],
          [76, 32],
          [52, 32],
        ],
        true,
      );
      L(c, [
        [64, 32],
        [64, 106],
      ]);
    },
    helmet(c) {
      c.beginPath();
      c.arc(64, 70, 38, Math.PI, 0);
      c.lineTo(110, 78);
      c.lineTo(18, 78);
      c.closePath();
      c.stroke();
      L(c, [
        [40, 70],
        [88, 70],
      ]);
    },
    exo_rig(c) {
      c.strokeRect(36, 30, 56, 50);
      c.strokeRect(46, 44, 36, 14);
      L(c, [
        [36, 80],
        [44, 104],
        [84, 104],
        [92, 80],
      ]);
      c.beginPath();
      c.arc(54, 51, 5, 0, TAU);
      c.arc(74, 51, 5, 0, TAU);
      c.stroke();
    },
    food(c) {
      c.beginPath();
      c.moveTo(34, 40);
      c.lineTo(34, 100);
      c.ellipse(64, 100, 30, 10, 0, Math.PI, 0, true);
      c.lineTo(94, 40);
      c.stroke();
      c.beginPath();
      c.ellipse(64, 40, 30, 10, 0, 0, TAU);
      c.stroke();
      L(c, [
        [34, 60],
        [94, 60],
      ]);
      L(c, [
        [34, 84],
        [94, 84],
      ]);
    },
    water(c) {
      c.beginPath();
      c.moveTo(64, 18);
      c.bezierCurveTo(30, 60, 30, 104, 64, 104);
      c.bezierCurveTo(98, 104, 98, 60, 64, 18);
      c.stroke();
    },
    chem(c) {
      c.beginPath();
      c.moveTo(54, 20);
      c.lineTo(54, 50);
      c.lineTo(30, 100);
      c.lineTo(98, 100);
      c.lineTo(74, 50);
      c.lineTo(74, 20);
      c.stroke();
      L(c, [
        [46, 20],
        [82, 20],
      ]);
      L(c, [
        [40, 80],
        [88, 80],
      ]);
    },
    book(c) {
      L(
        c,
        [
          [64, 30],
          [20, 22],
          [20, 96],
          [64, 104],
          [108, 96],
          [108, 22],
        ],
        true,
      );
      L(c, [
        [64, 30],
        [64, 104],
      ]);
    },
    tape_reel(c) {
      for (const x of [42, 86]) {
        c.beginPath();
        c.arc(x, 60, 22, 0, TAU);
        c.stroke();
        c.beginPath();
        c.arc(x, 60, 6, 0, TAU);
        c.stroke();
      }
      L(c, [
        [42, 82],
        [86, 82],
      ]);
      L(c, [
        [20, 100],
        [108, 100],
      ]);
    },
    note(c) {
      L(
        c,
        [
          [34, 18],
          [80, 18],
          [96, 34],
          [96, 110],
          [34, 110],
        ],
        true,
      );
      for (let k = 0; k < 5; k++)
        L(c, [
          [44, 44 + k * 13],
          [86, 44 + k * 13],
        ]);
    },
    key(c) {
      c.beginPath();
      c.arc(40, 64, 16, 0, TAU);
      c.stroke();
      L(c, [
        [56, 64],
        [108, 64],
        [108, 78],
      ]);
      L(c, [
        [92, 64],
        [92, 76],
      ]);
    },
    keycard(c) {
      c.beginPath();
      c.roundRect ? c.roundRect(24, 34, 80, 56, 8) : c.rect(24, 34, 80, 56);
      c.stroke();
      L(c, [
        [24, 50],
        [104, 50],
      ]);
      c.strokeRect(34, 62, 20, 16);
      L(c, [
        [64, 70],
        [92, 70],
      ]);
    },
    junk(c) {
      c.beginPath();
      c.arc(50, 70, 20, 0, TAU);
      c.stroke();
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * TAU;
        L(c, [
          [50 + Math.cos(a) * 20, 70 + Math.sin(a) * 20],
          [50 + Math.cos(a) * 27, 70 + Math.sin(a) * 27],
        ]);
      }
      L(c, [
        [74, 30],
        [104, 100],
      ]);
      L(c, [
        [84, 26],
        [110, 88],
      ]);
    },
    worlds_fair_medallion(c) {
      c.beginPath();
      c.arc(64, 64, 42, 0, TAU);
      c.stroke();
      c.beginPath();
      c.arc(64, 64, 20, 0, TAU);
      c.stroke();
      c.beginPath();
      c.ellipse(64, 64, 8, 20, 0, 0, TAU);
      c.stroke();
      c.beginPath();
      c.ellipse(64, 64, 32, 10, -0.4, 0, TAU);
      c.stroke();
    },
    cryo(c) {
      c.beginPath();
      c.arc(64, 64, 46, 0, TAU);
      c.stroke();
      NEON_ICONS.snowflake(c, 64, 64, 30);
      c.stroke();
    },
    settlement(c) {
      L(
        c,
        [
          [20, 104],
          [20, 60],
          [64, 26],
          [108, 60],
          [108, 104],
        ],
        true,
      );
      c.strokeRect(54, 76, 20, 28);
    },
    landmark(c) {
      L(
        c,
        [
          [64, 14],
          [78, 44],
          [78, 110],
          [50, 110],
          [50, 44],
        ],
        true,
      );
      L(c, [
        [50, 64],
        [78, 64],
      ]);
      L(c, [
        [50, 84],
        [78, 84],
      ]);
    },
    skull(c) {
      NEON_ICONS.skull(c, 64, 60, 40);
      c.stroke();
    },
    radiation(c) {
      X.trefoil(c, 64, 64, 40, ICOL);
    },
    quest(c) {
      c.beginPath();
      c.moveTo(64, 110);
      c.lineTo(36, 54);
      c.arc(64, 44, 30, Math.PI * 0.8, Math.PI * 0.2);
      c.closePath();
      c.stroke();
      c.beginPath();
      c.arc(64, 44, 10, 0, TAU);
      c.stroke();
    },
    marker(c) {
      ICONS.quest(c);
    },
    talent(c) {
      X.starPath(c, 64, 64, 44, 18, 5);
      c.stroke();
    },
    vigil(c) {
      for (const x of [42, 86]) {
        c.beginPath();
        c.arc(x, 64, 20, 0, TAU);
        c.stroke();
      }
      L(c, [
        [62, 64],
        [66, 64],
      ]);
      L(c, [
        [22, 60],
        [10, 50],
      ]);
      L(c, [
        [106, 60],
        [118, 50],
      ]);
      c.strokeRect(30, 32, 22, 10);
    },
    lantern_battery(c) {
      c.strokeRect(36, 30, 56, 76);
      c.strokeRect(46, 20, 10, 10);
      c.strokeRect(72, 20, 10, 10);
      L(c, [
        [64, 46],
        [54, 68],
        [72, 68],
        [62, 92],
      ]);
    },
    rig_battery(c) {
      c.beginPath();
      c.arc(64, 64, 34, 0, TAU);
      c.stroke();
      c.strokeRect(54, 22, 20, 12);
      L(c, [
        [64, 44],
        [56, 64],
        [70, 64],
        [62, 84],
      ]);
    },
    gyrojet(c) {
      ICONS.pistol(c);
      for (let k = 0; k < 3; k++) {
        c.beginPath();
        c.arc(70 + k * 12, 53, 2, 0, TAU);
        c.stroke();
      }
    },
    sneak(c) {
      c.beginPath();
      c.moveTo(14, 64);
      c.quadraticCurveTo(64, 20, 114, 64);
      c.quadraticCurveTo(64, 108, 14, 64);
      c.stroke();
      c.beginPath();
      c.arc(64, 64, 16, 0, TAU);
      c.stroke();
    },
    missile(c) {
      c.save();
      c.translate(64, 64);
      c.rotate(-Math.PI / 4);
      L(
        c,
        [
          [-44, -8],
          [30, -8],
          [48, 0],
          [30, 8],
          [-44, 8],
        ],
        true,
      );
      L(c, [
        [-44, -8],
        [-54, -18],
        [-54, 18],
        [-44, 8],
      ]);
      c.restore();
    },
    melee(c) {
      ICONS.bat(c);
    },
    apparel(c) {
      ICONS.armor(c);
    },
    aid(c) {
      c.strokeRect(24, 36, 80, 64);
      L(c, [
        [64, 50],
        [64, 86],
      ]);
      L(c, [
        [46, 68],
        [82, 68],
      ]);
      L(c, [
        [50, 36],
        [50, 26],
        [78, 26],
        [78, 36],
      ]);
    },
    misc(c) {
      ICONS.junk(c);
    },
  };
  X.ICONS = ICONS;
  function iconCanvas(name, color) {
    const s = 128,
      cv = X.canvas(s, s),
      c = cv.ctx;
    c.strokeStyle = color || "#ffffff";
    c.fillStyle = color || "#ffffff";
    c.lineWidth = 5;
    c.lineJoin = "round";
    c.lineCap = "round";
    const fn = ICONS[name] || ICONS.misc;
    ICOL = color || "#ffffff";
    try {
      fn(c);
    } catch (e) {
      G.reportError("textures:icon:" + name, e);
    }
    return cv.c;
  }
  X.iconTex = function (name) {
    name = String(name || "misc");
    if (iconCache.has(name)) return iconCache.get(name);
    if (!ICONS[name]) {
      const t = X.iconTex("misc");
      iconCache.set(name, t);
      return t;
    } // alias, no new texture
    const tex = X.toTexture(iconCanvas(name), {
      repeat: false,
      name: "icon_" + name,
      regen: () => iconCanvas(name),
    });
    tex.userData.alpha = true;
    iconCache.set(name, tex);
    return tex;
  };
  X.iconURL = function (name, color) {
    const key = name + "|" + (color || "#cfeefa");
    if (iconURLCache.has(key)) return iconURLCache.get(key);
    const cv = iconCanvas(name, color || "#cfeefa");
    let url = null;
    try {
      url = cv.toDataURL("image/png");
    } catch (e) {
      url = null;
    }
    iconURLCache.set(key, url);
    return url;
  };

  // Debug listing for the contact sheet
  X.debugSigns = function () {
    const nd = (label, t) => [
      { label, tex: t },
      { label: label + " (day albedo)", tex: X.neonDayTex(t) },
    ];
    return [
      ...nd(
        "neon pink",
        X.neonTex("The Neon", "pink", { border: true, icon: "star" }),
      ),
      ...nd(
        "neon red sub",
        X.neonTex("Fizzo Cola", "red", { sub: "ICE COLD", icon: "cola" }),
      ),
      {
        label: "neon pink",
        tex: X.neonTex("The Neon", "pink", { border: true, icon: "star" }),
      },
      {
        label: "neon green",
        tex: X.neonTex("BAR", "green", {
          font: "deco",
          icon: "martini",
          border: true,
        }),
      },
      {
        label: "neon red sub",
        tex: X.neonTex("Fizzo Cola", "red", { sub: "ICE COLD", icon: "cola" }),
      },
      {
        label: "neon blue",
        tex: X.neonTex("HOTEL", "blue", { font: "deco", broken: 0.3 }),
      },
      {
        label: "neon yellow",
        tex: X.neonTex("Radio Free Manhattan", "yellow", { font: "condensed" }),
      },
      { label: "street", tex: X.signTex("Broadway", "street") },
      { label: "street W", tex: X.signTex("42 St", "street", { sub: "W" }) },
      {
        label: "subway",
        tex: X.signTex("Times Sq - 42 St", "subway", {
          routes: ["1", "2", "3", "N", "S"],
        }),
      },
      {
        label: "shop",
        tex: X.signTex("Hardware", "shop", { sub: "TOOLS · KEYS" }),
      },
      {
        label: "wood",
        tex: X.signTex("GRAND CENTRAL MARKET", "wood", {
          sub: "NO GUNS DRAWN",
        }),
      },
      { label: "wood toll", tex: X.signTex("TOLL 20 SCRIP", "wood") },
      { label: "wood 2", tex: X.signTex("CLINIC", "wood") },
      { label: "metal", tex: X.signTex("AUTHORIZED ONLY", "metal") },
      { label: "warning", tex: X.signTex("RADIATION HAZARD", "warning") },
      { label: "danger", tex: X.signTex("HIGH VOLTAGE", "danger") },
      {
        label: "enamel",
        tex: X.signTex("Drink Fizzo Cola", "enamel", {
          bg: "#b8201a",
          font: "script",
        }),
      },
      { label: "cryo", tex: X.signTex("CRYO UNIT C-9", "cryo") },
      { label: "marquee", tex: X.signTex("RADIO CITY\nMUSIC HALL", "marquee") },
      { label: "lightbox", tex: X.signTex("DINER", "lightbox") },
      {
        label: "plaque",
        tex: X.signTex("EMPIRE STATE BUILDING", "plaque", {
          sub: "Completed 1931 · 102 Stories",
        }),
      },
      { label: "exit", tex: X.signTex("EXIT", "exit") },
      { label: "gilt", tex: X.signTex("ROCKEFELLER PLAZA", "gilt") },

      {
        label: "banner covenant",
        tex: X.signTex("THE IRON COVENANT", "banner", {
          bg: "#5a4a32",
          fg: "#e8dcc0",
          emblem: "covenant",
        }),
      },
      {
        label: "banner glow",
        tex: X.signTex("THE GLOWKEEPERS", "banner", {
          bg: "#6a2a0e",
          fg: "#f2c25a",
          emblem: "sun",
        }),
      },
    ];
  };
})();
