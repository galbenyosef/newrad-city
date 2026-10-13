// play-inline-17 03 — ctx
// Lines 516-830 of readable/play-inline-17.pretty.js (statement-aligned).
  function restoreBoxes(ctx, pristine, boxes, alpha, W, H) {
    if (!boxes.length || alpha <= 0) return;
    const tmp = X.canvas(W, H),
      t = tmp.ctx;
    const f = Math.max(2, Math.round(H * 0.012));
    try {
      t.filter = "blur(" + f + "px)";
    } catch (e) {
      /* no filter support: hard edges */
    }
    t.fillStyle = "#fff";
    for (const b of boxes)
      t.fillRect(b.x - f, b.y - f * 0.5, b.w + 2 * f, b.h + f);
    try {
      t.filter = "none";
    } catch (e) {
      /* ignore */
    }
    t.globalCompositeOperation = "source-in";
    t.drawImage(pristine, 0, 0);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.drawImage(tmp.c, 0, 0);
    ctx.restore();
  }
  function snapshot(cv) {
    const c = X.canvas(cv.c.width, cv.c.height);
    c.ctx.drawImage(cv.c, 0, 0);
    return c.c;
  }

  /** Draw a brand's pristine art into a W×H context (virtual 1000×500). */
  function drawBill(ctx, W, H, brand, variant, r) {
    const b = X.BRANDS[brand];
    ctx.save();
    ctx.scale(W / 1000, H / 500);
    const prevSafe = X.textSafe;
    X.textSafe = { x0: 34, x1: 966 }; // inside the paper margin
    try {
      if (b) b.bill(ctx, variant, r);
      else {
        // unknown brand → generic period ad with its name
        X.adkit.bg(ctx, 1000, 500, "sunburst", "#c8a040", "#b89030", {
          cx: 500,
          cy: 250,
        });
        X.text(ctx, String(brand).replace(/_/g, " ").toUpperCase(), 500, 220, {
          font: "impact",
          size: 120,
          color: "#fff",
          stroke: "#1d1712",
          strokeW: 10,
          maxW: 900,
        });
        X.text(ctx, "Ask For It By Name!", 500, 330, {
          font: "script",
          size: 70,
          weight: "normal",
          color: "#1d1712",
          maxW: 800,
        });
      }
    } catch (e) {
      G.reportError("textures:billboard:" + brand, e);
    }
    X.textSafe = prevSafe;
    ctx.restore();
    // cream paper margin (the "blanking" border of a real billboard)
    ctx.strokeStyle = "#ece4cc";
    ctx.lineWidth = W * 0.022;
    ctx.strokeRect(0, 0, W, H);
    ctx.strokeStyle = "rgba(0,0,0,0.25)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(W * 0.011, W * 0.011, W - W * 0.022, H - W * 0.022);
  }

  X.billboardTex = function (brand, variant) {
    variant = Math.max(0, Math.floor(variant || 0));
    brand = X.resolveBrand(brand);
    const key = brand + "|" + variant;
    if (billCache.has(key)) return billCache.get(key);
    const paint = () => {
      const cv = X.canvas(BW, BH),
        r = X.rng(X.seedOf("bill:" + key));
      const hero = withCapture(BH, () =>
        drawBill(cv.ctx, BW, BH, brand, variant % 2, r),
      );
      X.lastHero = hero;
      const clean = snapshot(cv);
      const level = variant === 0 ? 0.7 : variant === 1 ? 1.0 : 0.6 + r() * 0.6;
      weatherAd(cv.ctx, BW, BH, r, {
        level,
        seams: 6,
        protect: hero,
        gentle: variant === 0 || level < 0.8,
        key: brand + variant,
      });
      restoreBoxes(
        cv.ctx,
        clean,
        hero.slice(0, 3),
        level > 0.9 ? 0.22 : 0.3,
        BW,
        BH,
      );
      return cv.c;
    };
    const tex = X.toTexture(paint(), {
      repeat: false,
      name: "billboard_" + key,
      regen: paint,
    });
    // lettering QA (texdebug sheet flags boards whose captured text leaves the safe area or overlaps another line)
    if (X.lastHero) {
      const hb = X.lastHero,
        m = BW * 0.025;
      let out = 0,
        overlap = 0;
      for (let i = 0; i < hb.length; i++) {
        const a = hb[i];
        if (a.x < m || a.x + a.w > BW - m) out++;
        for (let j = i + 1; j < hb.length; j++) {
          const b = hb[j];
          if (
            Math.abs(a.w - b.w) < a.w * 0.1 &&
            Math.abs(a.x - b.x) < a.h * 0.4
          )
            continue;
          /* drop-shadow copy */ const ix =
              Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x),
            iy = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
          if (ix > 4 && iy > a.h * 0.25 && iy > b.h * 0.25) overlap++;
        }
      }
      tex.userData.textQA = { boxes: hb.length, out, overlap };
    }
    billCache.set(key, tex);
    return tex;
  };
  /** Pristine (unweathered) billboard canvas, e.g. for goggle UI or lit Times Square signs. */
  X.billboardClean = function (brand, variant, w, h) {
    const cv = X.canvas(w || BW, h || BH);
    drawBill(
      cv.ctx,
      cv.w,
      cv.h,
      X.resolveBrand(brand),
      (variant || 0) % 2,
      X.rng(X.seedOf("clean:" + brand)),
    );
    return cv.c;
  };

  // ------------------------------------------------------------------
  // Posters
  // ------------------------------------------------------------------
  function drawPoster(ctx, id, variant, r) {
    ctx.save();
    ctx.scale(PW / 400, PH / 600);
    const prevSafe = X.textSafe;
    X.textSafe = { x0: 18, x1: 382 };
    try {
      const extra = X.EXTRA_POSTERS[id];
      const b = X.BRANDS[id];
      if (extra) extra(ctx, variant, r);
      else if (b && b.poster) b.poster(ctx, variant, r);
      else if (b) {
        const bg = b.posterBg || ["solid", b.colors[0], b.colors[0]];
        X.adkit.bg(ctx, 400, 600, bg[0], bg[1], bg[2], { cx: 200, cy: 300 });
        X.text(ctx, b.name, 200, 70, {
          font: b.posterFont || "impact",
          size: b.posterFont === "script" ? 70 : 56,
          weight: b.posterFont === "script" ? "normal" : "bold",
          color: b.posterInk || "#fff",
          stroke: "#1d1712",
          strokeW: 6,
          maxW: 370,
        });
        b.art(ctx, 200, 300, 110, variant, r);
        X.adkit.ribbonText(
          ctx,
          b.slogans[variant % b.slogans.length].toUpperCase(),
          200,
          530,
          300,
          50,
          b.colors[1],
          X.css(X.shade(b.colors[1], -0.4)),
          "#1d1712",
        );
      } else {
        X.adkit.bg(ctx, 400, 600, "solid", "#d8ccb0");
        X.text(ctx, String(id).toUpperCase(), 200, 300, {
          font: "impact",
          size: 60,
          color: "#1d1712",
          maxW: 360,
        });
      }
    } catch (e) {
      G.reportError("textures:poster:" + id, e);
    }
    X.textSafe = prevSafe;
    ctx.restore();
  }
  function tornEdges(ctx, W, H, r) {
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = "#000";
    const bite = (x, y, s) => {
      X.blobPath(ctx, x, y, s, r, 7, 0.8);
      ctx.fill();
    };
    for (let x = 0; x < W; x += 6) {
      if (r() < 0.5) bite(x, 0, 1 + r() * 4);
      if (r() < 0.5) bite(x, H, 1 + r() * 4);
    }
    for (let y = 0; y < H; y += 6) {
      if (r() < 0.5) bite(0, y, 1 + r() * 4);
      if (r() < 0.5) bite(W, y, 1 + r() * 4);
    }
    // one big torn-off corner/strip
    if (r() < 0.4) {
      ctx.restore();
      return;
    }
    const c = (r() * 4) | 0,
      cx = c % 2 ? W : 0,
      cy = c < 2 ? 0 : H;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    const n = 8,
      sx = W * (0.12 + r() * 0.22),
      sy = H * (0.05 + r() * 0.12);
    for (let k = 0; k <= n; k++) {
      const t = k / n;
      ctx.lineTo(
        Math.abs(cx - sx * (1 - t)) + (r() - 0.5) * 8,
        Math.abs(cy - sy * t) + (r() - 0.5) * 8,
      );
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  X.posterTex = function (id, variant) {
    variant = Math.max(0, Math.floor(variant || 0));
    id = X.resolvePoster(id);
    const key = id + "|" + variant;
    if (posterCache.has(key)) return posterCache.get(key);
    const paint = () => {
      const cv = X.canvas(PW, PH),
        r = X.rng(X.seedOf("poster:" + key)),
        c = cv.ctx;
      const hero = withCapture(PH * 0.8, () => drawPoster(c, id, variant, r));
      const clean = snapshot(cv);
      const level = 0.5 + r() * 0.45;
      weatherAd(c, PW, PH, r, {
        level,
        seams: 0,
        noGraffiti: r() < 0.6,
        protect: hero,
        gentle: level < 0.8,
        key: id + variant,
      });
      restoreBoxes(c, clean, hero.slice(0, 3), 0.4, PW, PH);
      // crease folds: soft, slightly off-centre, a light ridge beside a dark valley (not a hard seam)
      const fy = PH * (0.46 + r() * 0.08),
        fx = PW * (0.44 + r() * 0.12);
      const fold = (x0, y0, x1, y1, nx, ny) => {
        c.lineWidth = 1;
        c.strokeStyle = "rgba(0,0,0,0.08)";
        c.beginPath();
        c.moveTo(x0, y0);
        c.lineTo(x1, y1);
        c.stroke();
        c.strokeStyle = "rgba(255,250,235,0.1)";
        c.beginPath();
        c.moveTo(x0 + nx, y0 + ny);
        c.lineTo(x1 + nx, y1 + ny);
        c.stroke();
      };
      fold(0, fy, PW, fy + (r() - 0.5) * 4, 0, 1.2);
      if (r() < 0.7) fold(fx, 0, fx + (r() - 0.5) * 4, PH, 1.2, 0);
      tornEdges(c, PW, PH, r);
      // tape strips at the top corners
      for (const tx of [PW * 0.086, PW * 0.914]) {
        if (r() < 0.25) continue;
        c.save();
        c.translate(tx, PH * 0.026);
        c.rotate((tx < PW / 2 ? -1 : 1) * 0.6);
        c.fillStyle = "rgba(220,205,150,0.75)";
        c.fillRect(-PW * 0.07, -PH * 0.016, PW * 0.14, PH * 0.032);
        c.restore();
      }
      return cv.c;
    };
    const tex = X.toTexture(paint(), {
      repeat: false,
      name: "poster_" + key,
      regen: paint,
    });
    tex.userData.alpha = true;
    posterCache.set(key, tex);
    return tex;
  };
  /** Poster canvas (pins the texture so its pixels stay in RAM for the caller). */
  X.posterCanvas = function (id, variant) {
    const t = X.posterTex(id, variant);
    X.pin(t);
    return t.image || null;
  };
  X.posterIds = function () {
    return Object.keys(X.BRANDS).concat(Object.keys(X.EXTRA_POSTERS));
  };
