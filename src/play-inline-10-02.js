// play-inline-10 02 — ctx
// Lines 336-661 of readable/play-inline-10.pretty.js (statement-aligned).
  X.blotches = function (ctx, w, h, r, opts) {
    const n = opts.count || 10,
      col = opts.color || "#000",
      a = opts.alpha === undefined ? 0.15 : opts.alpha;
    const rmin = opts.rmin || w * 0.04,
      rmax = opts.rmax || w * 0.15;
    // opts.pow > 1: power-law sizes (many small, few large — natural stains); opts.cluster = n: stains gather around n spots and
    // trail downwards along water-runoff paths instead of an even "leopard" scatter
    const pw = opts.pow || 1,
      cl = opts.cluster
        ? Array.from({ length: opts.cluster }, () => [r() * w, r() * h])
        : null;
    for (let i = 0; i < n; i++) {
      let x = r() * w,
        y = r() * h;
      if (cl) {
        const c = cl[(r() * cl.length) | 0];
        x = c[0] + (r() - 0.5) * w * 0.1;
        y = c[1] + Math.pow(r(), 1.5) * h * 0.35;
      }
      const radius = rmin + Math.pow(r(), pw) * (rmax - rmin);
      const sx = opts.stretchY ? 1 : 1,
        sy = opts.stretchY || 1;
      X.wrap(w, h, x, y, radius * Math.max(sx, sy), (xx, yy) => {
        const g = ctx.createRadialGradient(xx, yy, 0, xx, yy, radius);
        g.addColorStop(0, X.css(col, a * (0.5 + r() * 0.5)));
        g.addColorStop(1, X.css(col, 0));
        ctx.save();
        ctx.translate(xx, yy);
        ctx.scale(sx, sy);
        ctx.translate(-xx, -yy);
        ctx.fillStyle = g;
        ctx.fillRect(xx - radius, yy - radius, radius * 2, radius * 2);
        ctx.restore();
      });
    }
  };
  /** Vertical grime/rain streaks running down (tile-safe vertically). */
  X.streaks = function (ctx, w, h, r, opts) {
    const n = opts.count || 30,
      col = opts.color || "#2a2418",
      a = opts.alpha === undefined ? 0.18 : opts.alpha;
    for (let i = 0; i < n; i++) {
      const x = r() * w,
        y = r() * h,
        len = (opts.minLen || h * 0.1) + r() * (opts.maxLen || h * 0.5),
        sw = (opts.minW || 1) + r() * (opts.maxW || 6);
      X.wrap(w, h, x, y + len / 2, Math.max(len, sw), (xx, yy) => {
        const y0 = yy - len / 2;
        const g = ctx.createLinearGradient(0, y0, 0, y0 + len);
        g.addColorStop(0, X.css(col, a));
        g.addColorStop(0.3, X.css(col, a * 0.7));
        g.addColorStop(1, X.css(col, 0));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(xx - sw / 2, y0);
        ctx.lineTo(xx + sw / 2, y0);
        ctx.lineTo(xx + sw * 0.2, y0 + len);
        ctx.lineTo(xx - sw * 0.2, y0 + len);
        ctx.fill();
      });
    }
  };
  /** Branching cracks (random walk polylines). Draws to ctx and optional height ctx (dark = low). */
  X.cracks = function (ctx, w, h, r, opts, hctx) {
    const n = opts.count || 6,
      col = opts.color || "rgba(20,18,15,0.8)",
      lw = opts.width || 1.5;
    const segLen = opts.seg || w * 0.02,
      steps = opts.steps || 30;
    // A crack keeps a slowly drifting heading with a jagged zig-zag around it (a random walk of the heading itself
    // produced worm/tree-root shapes), tapers towards both ends and forks rarely.
    function branch(x, y, ang, width, depth, len) {
      const pts = [[x, y]];
      let head = ang;
      for (let s = 0; s < len; s++) {
        head += (r() - 0.5) * 0.24;
        const a = head + (r() - 0.5) * 0.8;
        const sl = segLen * (0.6 + r() * 0.8);
        x += Math.cos(a) * sl;
        y += Math.sin(a) * sl;
        pts.push([x, y]);
        if (depth < 2 && r() < 0.05)
          branch(
            x,
            y,
            head + (r() < 0.5 ? -1 : 1) * (0.45 + r() * 0.6),
            width * 0.55,
            depth + 1,
            ((len - s) * 0.45) | 0,
          );
      }
      if (pts.length < 2) return;
      const bx = Math.min(...pts.map((p) => p[0])),
        by = Math.min(...pts.map((p) => p[1]));
      const ex = Math.max(...pts.map((p) => p[0])),
        ey = Math.max(...pts.map((p) => p[1]));
      const cxm = (bx + ex) / 2,
        cym = (by + ey) / 2,
        radius = Math.max(ex - bx, ey - by) / 2 + 4;
      // opts.vary: the opening width wanders along the crack (0.4–1.7×) instead of one even line
      const vw = [];
      let vv = 1;
      for (let k = 0; k <= pts.length; k++) {
        vv = Math.max(0.4, Math.min(1.7, vv + (r() - 0.5) * 0.6));
        vw.push(opts.vary ? vv : 1);
      }
      const N = pts.length - 1,
        taper = (k) =>
          (0.3 +
            0.7 *
              Math.sqrt(Math.sin(Math.PI * Math.min(1, Math.max(0, k / N))))) *
          vw[Math.max(0, Math.min(vw.length - 1, Math.round(k)))];
      // opts.spall: chipped edges — small broken-out flakes along the crack (lighter/darker fill, lower in the height map)
      const chips = [];
      if (opts.spall)
        for (let k = 1; k < N; k++)
          if (r() < 0.22) {
            const p = pts[k],
              a = r() * Math.PI * 2,
              d = width * (0.8 + r() * 1.5);
            chips.push([
              p[0] + Math.cos(a) * d * 0.6,
              p[1] + Math.sin(a) * d * 0.6,
              width * (1.2 + r() * 2.2),
              (r() * 1e9) | 0,
            ]);
          }
      X.wrap(w, h, cxm, cym, radius, (xx, yy) => {
        const ox = xx - cxm,
          oy = yy - cym;
        for (const c of [
          [ctx, col, width],
          hctx ? [hctx, "#000", width * 1.6] : null,
        ]) {
          if (!c) continue;
          const g = c[0];
          g.strokeStyle = c[1];
          g.lineJoin = "round";
          g.lineCap = "round";
          for (let k = 1; k <= N; k++) {
            g.lineWidth = Math.max(0.5, c[2] * taper(k - 0.5));
            g.beginPath();
            g.moveTo(pts[k - 1][0] + ox, pts[k - 1][1] + oy);
            g.lineTo(pts[k][0] + ox, pts[k][1] + oy);
            g.stroke();
          }
        }
        for (const c of chips) {
          const rr = X.rng(c[3]);
          X.blobPath(ctx, c[0] + ox, c[1] + oy, c[2], rr, 7, 0.7);
          ctx.fillStyle = opts.spall;
          ctx.fill();
          if (hctx) {
            const rr2 = X.rng(c[3]);
            X.blobPath(hctx, c[0] + ox, c[1] + oy, c[2], rr2, 7, 0.7);
            hctx.fillStyle = "rgba(40,40,40,0.55)";
            hctx.fill();
          }
        }
        if (opts.highlight) {
          // light lip on one side sells depth
          ctx.strokeStyle = opts.highlight;
          ctx.lineWidth = Math.max(0.5, width * 0.5);
          ctx.beginPath();
          ctx.moveTo(pts[0][0] + ox + 1, pts[0][1] + oy + 1);
          for (let k = 1; k < pts.length; k++)
            ctx.lineTo(pts[k][0] + ox + 1, pts[k][1] + oy + 1);
          ctx.stroke();
        }
      });
    }
    for (let i = 0; i < n; i++)
      branch(
        r() * w,
        r() * h,
        r() * Math.PI * 2,
        lw * (0.6 + r() * 0.8),
        0,
        (steps * (0.5 + r())) | 0,
      );
  };
  /**
   * Masonry cracks that follow the mortar joints of a running-bond grid in a stepped diagonal (settlement cracks):
   * down one course along a head joint, sideways half a unit along the bed joint, occasionally straight through a unit.
   * o: {count, bw (unit width px), bh (course height px), width, color, lip (light edge colour or null)}. Tapered, tile-safe.
   */
  X.stepCracks = function (ctx, w, h, r, o, hctx) {
    const bw = o.bw,
      bh = o.bh,
      n = o.count || 2,
      col = o.color || "rgba(18,14,12,0.75)",
      lw = o.width || 1.2;
    for (let i = 0; i < n; i++) {
      const row = (r() * (h / bh)) | 0,
        off = ((row % 2) * bw) / 2;
      let x = off + ((r() * (w / bw)) | 0) * bw,
        y = row * bh,
        dir = r() < 0.5 ? -1 : 1;
      const pts = [[x, y]],
        steps = 4 + ((r() * (o.maxSteps || 9)) | 0);
      for (let k = 0; k < steps; k++) {
        if (r() < 0.12) {
          x += dir * bw * (0.3 + r() * 0.4);
          y += bh;
        } // through a unit
        else {
          y += bh;
          pts.push([x, y]);
          x += (dir * bw) / 2;
        } // down a head joint, then along the bed joint
        pts.push([x, y]);
        if (r() < 0.1) dir = -dir;
      }
      const N = pts.length - 1;
      const bx = Math.min(...pts.map((p) => p[0])),
        ex = Math.max(...pts.map((p) => p[0])),
        by = pts[0][1],
        ey = pts[N][1];
      X.wrap(
        w,
        h,
        (bx + ex) / 2,
        (by + ey) / 2,
        Math.max(ex - bx, ey - by) / 2 + 4,
        (xx, yy) => {
          const ox = xx - (bx + ex) / 2,
            oy = yy - (by + ey) / 2;
          for (const c of [
            [ctx, col, lw],
            hctx ? [hctx, "#1a1a1a", lw * 1.4] : null,
          ]) {
            if (!c) continue;
            const g = c[0];
            g.save();
            g.strokeStyle = c[1];
            g.lineCap = "round";
            g.lineJoin = "round";
            for (let k = 1; k <= N; k++) {
              const t = k / N;
              g.lineWidth = Math.max(
                0.5,
                c[2] * (0.35 + 0.65 * Math.sin(Math.PI * Math.min(1, t * 1.1))),
              );
              g.beginPath();
              g.moveTo(pts[k - 1][0] + ox, pts[k - 1][1] + oy);
              g.lineTo(pts[k][0] + ox, pts[k][1] + oy);
              g.stroke();
            }
            g.restore();
          }
          if (o.lip) {
            ctx.save();
            ctx.strokeStyle = o.lip;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(pts[0][0] + ox + 0.8, pts[0][1] + oy + 0.8);
            for (let k = 1; k <= N; k++)
              ctx.lineTo(pts[k][0] + ox + 0.8, pts[k][1] + oy + 0.8);
            ctx.stroke();
            ctx.restore();
          }
        },
      );
    }
  };
  /**
   * Bullet strikes on masonry: bursts (a short sweep along a line) or loose scatters, varied calibres; each hit is a dark
   * soft crater inside a lighter, irregular spall (fresh material under the grime), shallow spall + deep core in the height.
   * o: {count (bursts), spread px, size px (core radius), spall:'r,g,b' lighter tone}.
   */
  X.bulletStrikes = function (ctx, w, h, r, o, hctx) {
    const sp = o.spall || "205,190,165",
      size = o.size || 1.2;
    for (let k = 0; k < (o.count || 3); k++) {
      const cx = o.cx !== undefined ? o.cx : r() * w,
        cy = o.cy !== undefined ? o.cy : r() * h,
        sweep = r() < 0.55,
        ang = (r() - 0.5) * 0.9 + (r() < 0.5 ? 0 : Math.PI),
        len = (o.spread || 50) * (0.6 + r());
      const hits = 3 + ((r() * (sweep ? 9 : 6)) | 0),
        cal = size * (0.7 + r() * 0.9);
      for (let q = 0; q < hits; q++) {
        let px, py;
        if (sweep) {
          const t = q / hits - 0.5 + (r() - 0.5) * 0.15;
          px = cx + Math.cos(ang) * len * t + (r() - 0.5) * len * 0.12;
          py = cy + Math.sin(ang) * len * t + (r() - 0.5) * len * 0.12;
        } else {
          const a = r() * Math.PI * 2,
            d = Math.pow(r(), 1.6) * len * 0.5;
          px = cx + Math.cos(a) * d;
          py = cy + Math.sin(a) * d;
        }
        const cr = cal * (0.6 + r() * 0.8),
          sr = cr * (2 + r() * 2.2);
        X.wrap(w, h, px, py, sr + 2, (xx, yy) => {
          ctx.save();
          X.blobPath(ctx, xx, yy, sr, r, 7, 0.7);
          ctx.clip();
          const g = ctx.createRadialGradient(xx, yy, 0, xx, yy, sr);
          g.addColorStop(0, "rgba(" + sp + ",0.34)");
          g.addColorStop(0.6, "rgba(" + sp + ",0.18)");
          g.addColorStop(1, "rgba(" + sp + ",0)");
          ctx.fillStyle = g;
          ctx.fillRect(xx - sr, yy - sr, sr * 2, sr * 2);
          ctx.restore();
          const c = ctx.createRadialGradient(xx, yy, 0, xx, yy, cr * 1.3);
          c.addColorStop(0, "rgba(12,10,8,0.9)");
          c.addColorStop(0.55, "rgba(22,18,14,0.6)");
          c.addColorStop(1, "rgba(22,18,14,0)");
          ctx.fillStyle = c;
          ctx.fillRect(xx - cr * 1.3, yy - cr * 1.3, cr * 2.6, cr * 2.6);
          if (hctx) {
            const hg = hctx.createRadialGradient(xx, yy, 0, xx, yy, sr);
            hg.addColorStop(0, "rgba(20,20,20,0.9)");
            hg.addColorStop(cr / sr, "rgba(60,60,60,0.5)");
            hg.addColorStop(1, "rgba(90,90,90,0)");
            hctx.fillStyle = hg;
            hctx.fillRect(xx - sr, yy - sr, sr * 2, sr * 2);
          }
        });
      }
    }
  };
  /** Random small dots (aggregate, dirt, pits). Fast path: tiny dots are rects, colours pre-baked. */
