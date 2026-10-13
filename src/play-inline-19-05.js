// play-inline-19 05 — ctx
// Lines 1342-1668 of readable/play-inline-19.pretty.js (statement-aligned).
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
