// play-inline-11 03 — ctx
// Lines 590-865 of readable/play-inline-11.pretty.js (statement-aligned).
  function asphaltBase(ctx, w, h, r, hc, seed, name, lanes) {
    const { n1, n2 } = noiseBase(
      ctx,
      w,
      h,
      r,
      [
        [0, "#3e3e3d"],
        [0.45, "#51504d"],
        [0.75, "#5d5b56"],
        [1, "#6a6760"],
      ],
      { scale: 3, seed: seed || 61, grain: 22, dscale: 64, mix: 0.35 },
    );
    const G2 = X.canvas(w, h),
      gc = G2.ctx;
    gc.fillStyle = "#000";
    gc.fillRect(0, 0, w, h);
    // exposed aggregate: raised stones in the height field (fine grain in the normal map), a few dark voids
    const agg = X.worley(w, h, { cells: 150, seed: (seed || 61) + 4 });
    heightFrom(
      hc,
      w,
      h,
      (i) =>
        0.5 +
        (n2[i] - 0.5) * 0.12 +
        Math.max(0, 0.16 - agg.f1[i] * 1.6) * 1.4 +
        (r() - 0.5) * 0.08,
    );
    X.speckle(ctx, w, h, r, {
      count: w * 5,
      colors: ["#8a8781", "#9e9a90", "#6d6a64", "#2a2a2a"],
      min: 0.5,
      max: 1.8,
      alpha: 0.6,
    });
    const img = ctx.getImageData(0, 0, w, h),
      d = img.data;
    const wear = lanes
      ? X.fbm(w, h, { scale: 2, sy: 6, octaves: 3, seed: (seed || 61) + 9 })
      : null;
    for (let i = 0; i < w * h; i++) {
      // polished stone tops catch the light, binder between them is darker
      let k =
        1 +
        Math.max(0, 0.12 - agg.f1[i]) * 1.1 -
        Math.max(0, agg.f1[i] - 0.3) * 0.25;
      const o = i * 4;
      if (lanes) {
        // lanes run along V: wheel paths ±0.9 m around each lane centre (polished, a touch darker and glossier),
        // oil / rubber drippings concentrated in the lane centre
        const u = (i % w) / w;
        let wp = 0,
          oil = 0;
        for (const c of lanes) {
          const du = Math.abs(u - c);
          wp = Math.max(
            wp,
            Math.exp(-Math.pow(Math.abs(du - 0.112) / 0.03, 2)),
          );
          oil = Math.max(oil, Math.exp(-Math.pow(du / 0.035, 2)));
        }
        const mod = 0.6 + 0.8 * wear[i];
        k *= 1 - 0.07 * wp * mod - 0.2 * oil * Math.max(0, wear[i] * 1.6 - 0.4);
        const gl = wp * mod * 60 + oil * 50 * wear[i];
        if (gl > 1) {
          const gi = G2._img || (G2._img = gc.getImageData(0, 0, w, h));
          gi.data[o] = gi.data[o + 1] = gi.data[o + 2] = Math.min(255, gl);
        }
      }
      d[o] *= k;
      d[o + 1] *= k;
      d[o + 2] *= k;
      // faint dusty, sun-bleached areas (kept weak: they repeat with the tile)
      if (n1[i] > 0.72) {
        const t = (n1[i] - 0.72) * 0.6;
        d[o] += (150 - d[o]) * t;
        d[o + 1] += (140 - d[o + 1]) * t;
        d[o + 2] += (120 - d[o + 2]) * t;
      }
    }
    ctx.putImageData(img, 0, 0);
    if (G2._img) gc.putImageData(G2._img, 0, 0);
    // quartz sparkle in the aggregate (tiny bright specks; they also polish → glossy)
    X.speckle(ctx, w, h, r, {
      count: w * 2,
      colors: ["#c8c4b8", "#b2aea2"],
      min: 0.4,
      max: 1.1,
      alpha: 0.55,
    });
    // small oil drips: clusters of a few spots, not an even scatter
    for (let c = 0; c < 3; c++) {
      const cx = r() * w,
        cy = r() * h;
      for (let q = 0; q < 3 + ((r() * 5) | 0); q++) {
        const x = cx + (r() - 0.5) * w * 0.06,
          y = cy + (r() - 0.5) * w * 0.12,
          radius = 1.5 + Math.pow(r(), 2.5) * w * 0.018;
        X.wrap(w, h, x, y, radius, (xx, yy) => {
          const g = ctx.createRadialGradient(xx, yy, 0, xx, yy, radius);
          g.addColorStop(0, "rgba(12,12,12,0.35)");
          g.addColorStop(1, "rgba(12,12,12,0)");
          ctx.fillStyle = g;
          ctx.fillRect(xx - radius, yy - radius, radius * 2, radius * 2);
          const g2 = gc.createRadialGradient(xx, yy, 0, xx, yy, radius);
          g2.addColorStop(0, "rgba(255,255,255,0.35)");
          g2.addColorStop(1, "rgba(255,255,255,0)");
          gc.fillStyle = g2;
          gc.fillRect(xx - radius, yy - radius, radius * 2, radius * 2);
        });
      }
    }
    // a couple of thin, meandering tar-sealed cracks (the big network is world-space)
    for (let k = 0; k < 2; k++)
      tarSnake(ctx, gc, hc, w, h, r, 14 + ((r() * 18) | 0), 2.5 + r() * 2.5);
    X.blotches(ctx, w, h, r, {
      count: 5,
      color: "#6e5f48",
      alpha: 0.1,
      rmin: w * 0.05,
      rmax: w * 0.14,
      pow: 2,
    }); // blown dust
    macroGrime(ctx, w, h, 0.2, (seed || 61) + 3);
    if (name) {
      const s2 = Math.min(256, w),
        sm = X.canvas(s2, Math.round((s2 * h) / w));
      sm.ctx.drawImage(G2.c, 0, 0, sm.w, sm.h);
      X.gloss[name] = sm.c;
    }
  }
  function roadPaint(ctx, x0, y0, x1, y1, width, color, r, hc) {
    // worn paint: draw the line, then erase random chunks
    ctx.save();
    ctx.strokeStyle = X.css(color, 0.8);
    ctx.lineWidth = width;
    ctx.lineCap = "butt";
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
    ctx.globalCompositeOperation = "source-atop";
    ctx.restore();
  }
  function wearPaint(ctx, w, h, r, color, drawFn) {
    // draw paint on a separate layer, erode it, composite it on top
    const L = X.canvas(w, h),
      c = L.ctx;
    drawFn(c);
    c.globalCompositeOperation = "destination-out";
    const n = X.fbm(w, h, { scale: 8, octaves: 4, seed: 71 });
    const img = c.getImageData(0, 0, w, h),
      d = img.data;
    for (let i = 0; i < w * h; i++) {
      const o = i * 4;
      if (!d[o + 3]) continue;
      const keep = n[i] * 1.3 - 0.25 + (r() - 0.5) * 0.35;
      d[o + 3] = Math.max(0, Math.min(d[o + 3], d[o + 3] * keep));
    }
    c.putImageData(img, 0, 0);
    ctx.drawImage(L.c, 0, 0);
  }
  X.wearPaint = wearPaint;
  def("asphalt", {
    roughVar: 0.35,
    meters: 8,
    normal: 2.2,
    rough: 0.95,
    desc: "worn city asphalt: aggregate, tar-sealed cracks, oil drips (big damage is world-space)",
    gen: (ctx, w, h, r, hc) => asphaltBase(ctx, w, h, r, hc, 61, "asphalt"),
  });
  def("asphalt_lines", {
    roughVar: 0.35,
    meters: 8,
    normal: 2.2,
    rough: 0.95,
    desc: "asphalt with faded double-yellow centre line along V at u=0.5",
    gen(ctx, w, h, r, hc) {
      asphaltBase(ctx, w, h, r, hc, 63, "asphalt_lines", [0.29, 0.71]);
      wearPaint(ctx, w, h, r, "#d8b23a", (c) => {
        c.fillStyle = "#d6ae36";
        c.fillRect(w / 2 - 11, 0, 7, h);
        c.fillRect(w / 2 + 4, 0, 7, h);
      });
    },
  });
  def("asphalt_dashed", {
    roughVar: 0.35,
    meters: 8,
    normal: 2.2,
    rough: 0.95,
    desc: "asphalt with faded white dashed lane line along V at u=0.5",
    gen(ctx, w, h, r, hc) {
      asphaltBase(ctx, w, h, r, hc, 65, "asphalt_dashed", [0.29, 0.71]);
      wearPaint(ctx, w, h, r, "#ddd", (c) => {
        c.fillStyle = "#e4e0d4";
        c.fillRect(w / 2 - 5, 0, 10, h * 0.4);
      });
    },
  });
  def("crosswalk", {
    roughVar: 0.35,
    meters: 8,
    normal: 2.2,
    rough: 0.95,
    desc: "asphalt with faded zebra bars running along V",
    gen(ctx, w, h, r, hc) {
      asphaltBase(ctx, w, h, r, hc, 67, "crosswalk");
      wearPaint(ctx, w, h, r, "#ddd", (c) => {
        c.fillStyle = "#e6e2d6";
        for (let i = 0; i < 4; i++)
          c.fillRect((i * w) / 4 + w / 16, 0, w / 8, h);
      });
    },
  });
  def("cobblestone", {
    meters: 3,
    normal: 4,
    rough: 0.85,
    desc: "granite Belgian-block paving (old NYC)",
    gen(ctx, w, h, r, hc) {
      ctx.fillStyle = "#3a3630";
      ctx.fillRect(0, 0, w, h);
      const rows = 12,
        rh = h / rows;
      for (let j = 0; j < rows; j++) {
        let x = (j % 2) * rh * 0.8;
        const y = j * rh;
        while (x < w + rh) {
          const bw = rh * (1.4 + r() * 0.7);
          const col = X.jitter(
            r() < 0.3 ? "#6e6b66" : r() < 0.5 ? "#7a746c" : "#5f5c58",
            r,
            0.15,
          );
          X.wrap(w, h, x + bw / 2, y + rh / 2, bw, (cx, cy) => {
            X.rrect(ctx, cx - bw / 2 + 2, cy - rh / 2 + 2, bw - 4, rh - 4, 5);
            const g = ctx.createLinearGradient(0, cy - rh / 2, 0, cy + rh / 2);
            g.addColorStop(0, X.css(X.shade(col, 0.18)));
            g.addColorStop(1, X.css(X.shade(col, -0.25)));
            ctx.fillStyle = g;
            ctx.fill();
            X.rrect(hc, cx - bw / 2 + 2, cy - rh / 2 + 2, bw - 4, rh - 4, 6);
            const hg = hc.createRadialGradient(cx, cy, 0, cx, cy, bw * 0.6);
            hg.addColorStop(0, "#e0e0e0");
            hg.addColorStop(1, "#707070");
            hc.fillStyle = hg;
            hc.fill();
          });
          x += bw;
        }
      }
      hc.globalCompositeOperation = "source-over";
      X.speckle(ctx, w, h, r, {
        count: 3000,
        colors: ["#222", "#aaa59a", "#8c6f60"],
        min: 0.3,
        max: 1.2,
        alpha: 0.5,
      });
      X.blotches(ctx, w, h, r, { count: 8, color: "#2a2418", alpha: 0.3 });
      macroGrime(ctx, w, h, 0.3, 81);
    },
  });

  // ==================================================================
  // BRICK
  // ==================================================================
  // Common-bond brick (a header course every 6th course, 35 % of the header ends dark-flashed) laid by hand: course heights and
  // joint widths wander, arrises are worn round, tone follows soft clusters of bricks (firing batch / weathering) with only a
  // little per-brick variation, mortar is recessed and dirt-filled (darker in the upper shadowed half of each bed joint), grey
  // cement repointing is smeared flush over the edges, spalls are rare and show the lighter, rougher core. No mortar-coloured
  // chips, no dark-brick checkerboard; big damage clusters, rising damp and salt blooms come from the world-space brick layer
  // (90_api.js, userData.txBrick) because anything large painted here would repeat every 3 m.
