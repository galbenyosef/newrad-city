/* src/textures/32_ads.js */
/* =====================================================================
 * NEW RAD CITY — TEXTURES: billboard & poster rendering + weathering
 * Owned by: textures.
 *
 * G.tex.billboard(brandId, variant) → 768×384 texture (2:1). Pristine art
 * from 31_brands.js is aged by the decades since the bombs: paste-up sheet seams, sun fade
 * & yellowing, water stains, rust runs from the frame bolts, peeling
 * sheets exposing older ads and bare board, bullet holes, graffiti.
 * variant 0 = moderately weathered, 1 = alt art + heavy weathering,
 * 2+ = alternate seeds (same art as v%2, different damage).
 *
 * G.tex.poster(id, variant) → 320×480 RGBA texture with torn,
 * transparent edges + tape. id = any brand or one of the extra posters:
 * wanted, covenant_recruit, continuity, missing, propaganda, long_winter_recruit,
 * glowkeepers, radio_free, rally_tonic, prussian_blue.
 * ===================================================================== */
(function () {
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
})();
