// play-inline-19 04 — ctx
// Lines 1004-1341 of readable/play-inline-19.pretty.js (statement-aligned).
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
