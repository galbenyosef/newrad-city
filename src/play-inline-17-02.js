// play-inline-17 02 — ctx
// Lines 170-515 of readable/play-inline-17.pretty.js (statement-aligned).
  function weatherAd(ctx, W, H, r, o) {
    o = o || {};
    const L = o.level === undefined ? 0.8 : o.level;
    // 1) paste-up sheet seams
    const seams = o.seams || 0;
    for (let i = 1; i < seams; i++) {
      const x = (i * W) / seams + (r() - 0.5) * 4;
      ctx.fillStyle = "rgba(0,0,0,0.12)";
      ctx.fillRect(x, 0, 1.5, H);
      ctx.fillStyle = "rgba(255,255,255,0.12)";
      ctx.fillRect(x + 1.5, 0, 1, H);
    }
    if (seams) {
      const y = H * (0.45 + r() * 0.1);
      ctx.fillStyle = "rgba(0,0,0,0.1)";
      ctx.fillRect(0, y, W, 1.2);
    }
    // 2) sun-fade, desaturate, yellow the paper
    ctx.save();
    ctx.globalCompositeOperation = "saturation";
    ctx.fillStyle = "rgba(128,128,128," + Math.min(0.85, 0.32 * L + 0.12) + ")";
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = "screen";
    const sg = ctx.createLinearGradient(0, 0, 0, H);
    sg.addColorStop(0, "rgba(240,225,180," + 0.3 * L + ")");
    sg.addColorStop(1, "rgba(240,225,180," + 0.06 * L + ")");
    ctx.fillStyle = sg;
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = "multiply";
    ctx.fillStyle = "rgba(232,214,176," + (0.35 + 0.25 * L) + ")";
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
    // 3) grime & water stains
    X.modulate(
      ctx,
      W,
      H,
      X.fbm(W, H, { scale: 5, octaves: 5, seed: (r() * 1000) | 0 }),
      0.45 * L,
    );
    X.blotches(ctx, W, H, r, {
      count: (6 + 8 * L) | 0,
      color: "#4a3a22",
      alpha: 0.22 * L,
      rmin: W * 0.02,
      rmax: W * 0.1,
    });
    for (let k = 0; k < 3 * L; k++) {
      // tide-mark rings
      const x = r() * W,
        y = r() * H,
        radius = W * (0.03 + r() * 0.06);
      X.smoothBlob(ctx, x, y, radius, radius * (0.7 + r() * 0.6), r, 10, 0.4);
      ctx.strokeStyle = "rgba(90,60,30," + 0.25 * L + ")";
      ctx.lineWidth = 1.5 + r() * 2;
      ctx.stroke();
    }
    X.streaks(ctx, W, H, r, {
      count: (10 + 20 * L) | 0,
      color: "#3a2a18",
      alpha: 0.25 * L,
      minLen: H * 0.1,
      maxLen: H * 0.8,
      maxW: 8,
    });
    // 4) rust runs from the frame bolts along the top edge
    for (let k = 0; k < 5; k++) {
      const x = ((k + 0.5) / 5) * W + (r() - 0.5) * 20,
        len = H * (0.15 + r() * 0.5 * L);
      const g = ctx.createLinearGradient(0, 0, 0, len);
      g.addColorStop(0, "rgba(120,56,20," + 0.6 * L + ")");
      g.addColorStop(1, "rgba(120,56,20,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(x - 4, 0);
      ctx.lineTo(x + 4, 0);
      ctx.lineTo(x + 1.5, len);
      ctx.lineTo(x - 1.5, len);
      ctx.fill();
    }
    const bottom = ctx.createLinearGradient(0, H * 0.7, 0, H);
    bottom.addColorStop(0, "rgba(30,22,14,0)");
    bottom.addColorStop(1, "rgba(30,22,14," + 0.45 * L + ")");
    ctx.fillStyle = bottom;
    ctx.fillRect(0, 0, W, H);
    // 5) peeling sheets: expose an older ad layer or bare board, with curled lips.
    //    Hero lettering (o.protect boxes, captured from the brand art) stays readable: gentle boards never
    //    peel over it; heavily weathered ones may lose at most one bite of it.
    const gentle = !!o.gentle,
      protect = o.protect || [];
    let heroHits = gentle ? 0 : 1;
    const peels = gentle
      ? Math.min(2, Math.round((0.3 + r() * 1.6) * L))
      : Math.min(5, Math.round((0.4 + r() * 2.2) * L));
    for (let k = 0; k < peels; k++) {
      let x = 0,
        y = 0,
        radius = 0,
        ok = false;
      for (let tries = 0; tries < 14 && !ok; tries++) {
        const edge = gentle || r() < 0.7;
        x = edge ? (r() < 0.5 ? r() * W * 0.1 : W - r() * W * 0.1) : r() * W;
        y = edge ? r() * H : r() < 0.5 ? r() * H * 0.2 : H - r() * H * 0.2;
        if (gentle && r() < 0.4) {
          x = r() * W;
          y = r() < 0.5 ? r() * H * 0.08 : H - r() * H * 0.08;
        } // top/bottom margin strip
        radius = W * (gentle ? 0.018 + r() * 0.03 : 0.025 + r() * 0.05);
        const hit = hitsBoxes(protect, x, y, radius * 1.25);
        if (!hit) ok = true;
        else if (heroHits > 0 && tries > 6) {
          ok = true;
          heroHits--;
        }
      }
      if (!ok) continue;
      ctx.save();
      X.blobPath(ctx, x, y, radius, r, 12, 0.7);
      ctx.clip();
      const under = r();
      if (under < 0.35) {
        // older poster underneath: faded colour block & a ghost of lettering
        ctx.fillStyle = X.css(
          ["#b89a70", "#8aa0a8", "#c8a888", "#a8b098", "#9a8a7a"][
            (r() * 5) | 0
          ],
        );
        ctx.fillRect(x - radius * 2, y - radius * 2, radius * 4, radius * 4);
        if (r() < 0.5) {
          ctx.fillStyle = "rgba(150,50,40,0.35)";
          ctx.fillRect(
            x - radius * 2,
            y - radius * 0.3 + (r() - 0.5) * radius,
            radius * 4,
            radius * 0.35,
          );
        } else
          X.text(
            ctx,
            ["VOTE", "SALE", "NEW", "ICE", "EAT"][(r() * 5) | 0],
            x + (r() - 0.5) * radius,
            y + (r() - 0.5) * radius,
            {
              font: "impact",
              size: radius * 0.45,
              color: "rgba(40,30,20,0.3)",
            },
          );
      } else if (under < 0.65) {
        // grey backing paper
        ctx.fillStyle = "#a49c8a";
        ctx.fillRect(x - radius * 2, y - radius * 2, radius * 4, radius * 4);
        X.blotches(ctx, W, H, r, {
          count: 2,
          color: "#5a4a30",
          alpha: 0.3,
          rmin: radius * 0.3,
          rmax: radius,
        });
      } else {
        // bare board
        ctx.fillStyle = o.board || "#5c4c3a";
        ctx.fillRect(x - radius * 2, y - radius * 2, radius * 4, radius * 4);
        ctx.fillStyle = "rgba(30,20,10,0.4)";
        for (let s = 0; s < 8; s++)
          ctx.fillRect(
            x - radius * 2,
            y - radius * 2 + s * radius * 0.5,
            radius * 4,
            1.2,
          );
      }
      ctx.restore();
      X.blobPath(ctx, x, y, radius, r, 12, 0.7);
      ctx.strokeStyle = "rgba(245,238,220,0.8)";
      ctx.lineWidth = 2;
      ctx.stroke();
      // curled flap
      const a = r() * TAU,
        fx = x + Math.cos(a) * radius * 0.9,
        fy = y + Math.sin(a) * radius * 0.9;
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.beginPath();
      ctx.moveTo(fx, fy);
      ctx.lineTo(
        fx + Math.cos(a + 1.2) * radius * 0.6 + 4,
        fy + Math.sin(a + 1.2) * radius * 0.6 + 4,
      );
      ctx.lineTo(
        fx + Math.cos(a) * radius * 0.5 + 4,
        fy + Math.sin(a) * radius * 0.5 + 4,
      );
      ctx.fill();
      ctx.fillStyle = "rgba(232,222,196,0.95)";
      ctx.beginPath();
      ctx.moveTo(fx, fy);
      ctx.lineTo(
        fx + Math.cos(a + 1.2) * radius * 0.6,
        fy + Math.sin(a + 1.2) * radius * 0.6,
      );
      ctx.lineTo(
        fx + Math.cos(a) * radius * 0.5,
        fy + Math.sin(a) * radius * 0.5,
      );
      ctx.fill();
    }
    // 6) bullet holes (clusters)
    const clusters = gentle ? (r() < 0.6 ? 1 : 0) : Math.round(r() * 2.5 * L);
    for (let c = 0; c < clusters; c++) {
      let cx = r() * W,
        cy = r() * H;
      for (
        let tries = 0;
        gentle && tries < 10 && hitsBoxes(protect, cx, cy, W * 0.05);
        tries++
      ) {
        cx = r() * W;
        cy = r() * H;
      }
      const n = 3 + ((r() * 7) | 0);
      for (let k = 0; k < n; k++)
        bulletHole(
          ctx,
          cx + (r() - 0.5) * W * 0.12,
          cy + (r() - 0.5) * H * 0.2,
          1.8 + r() * 2.2,
          r,
          true,
        );
    }
    // 7) graffiti
    // Tags go low down, where a raider can reach from a ledge. The phrase is picked per board (o.key) so the
    // same slogan doesn't repeat across neighbouring billboards. Placement tests the tag's FULL rotated
    // bounding rectangle against every protected lettering box; if no free spot exists the tag is skipped.
    if (!o.noGraffiti && r() < (gentle ? 0.35 : 0.5 * L - 0.1)) {
      const word =
        GRAFFITI[(X.seedOf(o.key || String(r())) >>> 3) % GRAFFITI.length];
      const skull = r() < 0.3;
      const col = SPRAY[(r() * SPRAY.length) | 0];
      let size = H * (gentle ? 0.045 + r() * 0.02 : 0.06 + r() * 0.05);
      ctx.save();
      X.setFont(ctx, word, size, "marker", null, "bold");
      let tw = ctx.measureText(word).width;
      ctx.restore();
      if (tw > W * 0.42) {
        size *= (W * 0.42) / tw;
        tw = W * 0.42;
      }
      const rot = (r() - 0.5) * 0.2;
      // rotated half-extents + overspray/drip margin
      const hw = skull
        ? size * 1.15
        : (tw / 2) * Math.cos(rot) +
          size * 0.5 * Math.abs(Math.sin(rot)) +
          size * 0.25;
      const hhUp = skull
        ? size * 1.6
        : size * 0.6 + (tw / 2) * Math.abs(Math.sin(rot));
      const hhDn = skull
        ? size * 1.2
        : size * 1.4 + (tw / 2) * Math.abs(Math.sin(rot)); // drips hang below
      const free = (x, y) => {
        if (x - hw < W * 0.03 || x + hw > W * 0.97 || y + hhDn > H * 0.985)
          return false;
        const pad = size * 0.35;
        for (const b of protect.all || protect)
          if (
            x + hw + pad > b.x &&
            x - hw - pad < b.x + b.w &&
            y + hhDn + pad > b.y &&
            y - hhUp - pad < b.y + b.h
          )
            return false;
        return true;
      };
      let gx = 0,
        gy = 0,
        ok = false;
      for (let tries = 0; tries < 24 && !ok; tries++) {
        gx = W * (0.12 + r() * 0.76);
        gy = H * (gentle ? 0.8 + r() * 0.1 : 0.55 + r() * 0.33);
        ok = free(gx, gy);
      }
      if (ok) {
        if (skull)
          skullTag(ctx, gx, gy - size * 0.6, size * 1.4, X.css(col, 0.85));
        else spray(ctx, word, gx, gy, size, col, r, rot);
      }
    }
    // 8) fine paper grain + vignette
    X.speckle(ctx, W, H, r, {
      count: (W * H) / 60,
      colors: ["#2a2014", "#f4ecd8"],
      min: 0.3,
      max: 0.9,
      alpha: 0.25,
    });
    const vg = ctx.createRadialGradient(
      W / 2,
      H / 2,
      Math.min(W, H) * 0.35,
      W / 2,
      H / 2,
      Math.max(W, H) * 0.75,
    );
    vg.addColorStop(0, "rgba(0,0,0,0)");
    vg.addColorStop(1, "rgba(20,14,8," + 0.4 * L + ")");
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, W, H);
  }
  X.weatherAd = weatherAd;

  /**
   * Resolve an arbitrary brand/poster id to one we can draw. Unknown names alias to an existing design
   * (normalised / prefix match, else a stable hash pick) so a typo can never allocate a new texture.
   */
  const aliasWarned = new Set();
  function resolveId(id, pool) {
    if (pool[id]) return id;
    const low = String(id === undefined || id === null ? "" : id)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_|_$/g, "");
    if (pool[low]) return low;
    const ids = Object.keys(pool);
    if (!ids.length) return id;
    let k =
      low.length >= 3
        ? ids.find((b) => b.startsWith(low) || low.startsWith(b))
        : null;
    if (!k) k = ids[(X.seedOf(low) >>> 0) % ids.length];
    if (!aliasWarned.has(id)) {
      aliasWarned.add(id);
      console.warn('[textures] unknown brand/poster "' + id + '" -> ' + k);
    }
    return k;
  }
  const bid = (id) => (X.brandId ? X.brandId(id) : id);
  X.resolveBrand = (id) => resolveId(bid(id), X.BRANDS);
  X.resolvePoster = (id) =>
    resolveId(bid(id), Object.assign({}, X.BRANDS, X.EXTRA_POSTERS));

  /**
   * Partially restore the pristine art inside the hero lettering boxes (feathered), so the brand name and
   * slogan stay legible through decades of grime while the rest of the sheet rots.
   */
