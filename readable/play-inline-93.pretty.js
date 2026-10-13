/* src/map/48_billboards.js */
/* =====================================================================
 * NEW RAD CITY — MAP MODULE · 48 BILLBOARDS & WALL ADS
 * Rooftop billboards on steel frames with catwalks and gooseneck lamps,
 * painted "ghost sign" ads on exposed party walls, vertical banners on
 * towers, and the giant rooftop FIZZO COLA sign on the Brooklyn waterfront
 * facing Manhattan. All panels use G.mats.billboard(brand).
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const M = G.map._;

  M.billboards = [];
  // One atlas for every brand, two artworks each (the textures module's v0 and its different v1 composition):
  // 8×7 cells of 448×224 (3584×1568) = 28 brands × 2 variants → one material / draw call per chunk.
  const BB_COLS = 8,
    BB_ROWS = 7,
    BB_VARIANTS = 2;
  M.billboardIndex = {};
  /** Brand ids: the textures module's own list when it publishes one, else the layout's. */
  let brandCache = null;
  function brandList() {
    if (brandCache) return brandCache;
    let b = null;
    try {
      b =
        !G.isStub("tex") && G.tex.brands && G.tex.brands().length
          ? G.tex.brands()
          : null;
    } catch (e) {
      b = null;
    }
    brandCache = (b && b.length ? b : G.LAYOUT.BRANDS).slice(
      0,
      (BB_COLS * BB_ROWS) / BB_VARIANTS,
    );
    return brandCache;
  }
  M.brandList = brandList;
  M.defineAtlas("billboards", function () {
    const THREE = window.THREE;
    const CW = 448,
      CH = 224;
    const cv = M.canvas(BB_COLS * CW, BB_ROWS * CH),
      ctx = cv.getContext("2d");
    ctx.fillStyle = "#444";
    ctx.fillRect(0, 0, cv.width, cv.height);
    const brands = brandList();
    let cell = 0;
    for (let v = 0; v < BB_VARIANTS; v++) {
      brands.forEach((brand, bi) => {
        const i = cell++;
        if (i >= BB_COLS * BB_ROWS) return;
        if (v === 0) M.billboardIndex[brand] = [i];
        else if (M.billboardIndex[brand]) M.billboardIndex[brand].push(i);
        const x = (i % BB_COLS) * CW,
          y = Math.floor(i / BB_COLS) * CH;
        let img = null;
        try {
          if (!G.isStub("tex") && G.tex.billboard) {
            const t = G.tex.billboard(brand, v);
            img = t && t.image;
          }
          if ((!img || !img.width) && !G.isStub("mats") && G.mats.billboard) {
            const m = G.mats.billboard(brand, v);
            img = m && m.map && m.map.image;
          }
        } catch (e) {
          img = null;
        }
        if (!img || !img.width) {
          const t = M.fallbackBillboardTex
            ? M.fallbackBillboardTex(brand)
            : null;
          img = t && t.image;
        }
        if (img && img.width) ctx.drawImage(img, x, y, CW, CH);
        void bi;
      });
    }
    const t = M.finishTex(new THREE.CanvasTexture(cv));
    t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
    // like G.mats.billboard(brand, v, {lit:true}): faint warm self-illumination, stronger at night (glow driver)
    return {
      texture: t,
      roughness: 0.85,
      emissive: 0.12,
      emissiveColor: 0xfff2d8,
      glow: [0.08, 0.95],
    };
  });
  let variantFlip = 0;
  /** Atlas UV rect for a brand (variant: 0/1, or undefined → alternate). */
  M.billboardUV = function (brand, variant) {
    M.atlasMaterial("billboards");
    const cells = M.billboardIndex[brand] || [0];
    const v =
      variant === undefined
        ? variantFlip++ % cells.length
        : Math.min(cells.length - 1, variant);
    return M.cellUV(cells[v], BB_COLS, BB_ROWS);
  };
  let brandI = 0;
  function nextBrand(r) {
    const B = brandList();
    // cycle through all brands, with a bias for the big ones
    const big = [
      "fizzo_cola",
      "long_winter",
      "prairie_root_beer",
      "fizzo_cola",
      "first_journal",
    ].filter((b) => B.indexOf(b) >= 0);
    const pick = big.length && r() < 0.3 ? r.pick(big) : B[brandI++ % B.length];
    return pick;
  }

  /**
   * Flat ad panel centred at (cx,cy,cz), facing normal (nx,nz), size w×h.
   * Readable orientation: u runs along the viewer's right = (nz, -nx).
   */
  function panel(brand, cx, cy, cz, nx, nz, w, h, o) {
    o = o || {};
    const rx = nz,
      rz = -nx;
    const hw = w / 2,
      hh = h / 2;
    const b = M.buf("my/billboards", cx, cz, o.layer || "main");
    const uv = M.billboardUV(brand);
    const tilt = o.tilt || 0; // sag / tilt around the normal axis (radians)
    const ct = Math.cos(tilt),
      st = Math.sin(tilt);
    const P = (u, v) => {
      const du = u * ct - v * st,
        dv = u * st + v * ct;
      return [cx + rx * du, cy + dv, cz + rz * du];
    };
    const c = o.c || [1, 1, 1];
    M.quad(
      b,
      P(-hw, -hh),
      P(hw, -hh),
      P(hw, hh),
      P(-hw, hh),
      [nx, 0, nz],
      [uv[0], uv[1], uv[2], uv[1], uv[2], uv[3], uv[0], uv[3]],
      c,
      c,
    );
    M.billboards.push({ brand, x: cx, y: cy, z: cz, nx, nz, w, h });
  }
  M.adPanel = panel;

  /** Rooftop billboard: steel frame, panel, catwalk, lamps. Front faces (nx,nz). */
  function rooftopBillboard(x, y, z, nx, nz, w, h, brand, r) {
    const rx = nz,
      rz = -nx;
    const legH = r.range(2, 4);
    const py = y + legH + h / 2;
    const tilt = r() < 0.12 ? r.range(-0.12, 0.12) : 0;
    panel(brand, x + nx * 0.05, py, z + nz * 0.05, nx, nz, w, h, { tilt });
    // panel back (sheet metal) & border
    const bb = M.buf("metal_painted", x, z, "main");
    const hw = w / 2;
    M.quad(
      bb,
      [x - rx * hw - nx * 0.15, py - h / 2, z - rz * hw - nz * 0.15],
      [x + rx * hw - nx * 0.15, py - h / 2, z + rz * hw - nz * 0.15],
      [x + rx * hw - nx * 0.15, py + h / 2, z + rz * hw - nz * 0.15],
      [x - rx * hw - nx * 0.15, py + h / 2, z - rz * hw - nz * 0.15],
      [-nx, 0, -nz],
      [0, 0, w / 3, 0, w / 3, h / 3, 0, h / 3],
      [0.55, 0.55, 0.52],
    );
    const bf = M.buf("rust", x, z, "main");
    const fc = [0.55, 0.45, 0.38];
    // frame border
    M.beam(
      bf,
      x - rx * hw,
      py + h / 2 + 0.1,
      z - rz * hw,
      x + rx * hw,
      py + h / 2 + 0.1,
      z + rz * hw,
      0.2,
      0.2,
      { c: fc },
    );
    M.beam(
      bf,
      x - rx * hw,
      py - h / 2 - 0.1,
      z - rz * hw,
      x + rx * hw,
      py - h / 2 - 0.1,
      z + rz * hw,
      0.2,
      0.2,
      { c: fc },
    );
    // legs & braces behind
    const nLeg = Math.max(2, Math.round(w / 5));
    for (let i = 0; i <= nLeg; i++) {
      const t = -hw + (w * i) / nLeg;
      const lx = x + rx * t - nx * 0.4,
        lz = z + rz * t - nz * 0.4;
      M.beam(bf, lx, y, lz, lx, py + h / 2, lz, 0.22, 0.22, { c: fc });
      M.beam(
        M.buf("rust", x, z, "detail"),
        lx - nx * 2.2,
        y,
        lz - nz * 2.2,
        lx,
        py + h * 0.3,
        lz,
        0.14,
        0.14,
        { c: fc },
      );
    }
    // catwalk with railing along the bottom front
    const cw = M.buf("metal_panel", x, z, "detail");
    const cy = py - h / 2 - 0.35;
    M.quad(
      cw,
      [x - rx * hw, cy, z - rz * hw],
      [x + rx * hw, cy, z + rz * hw],
      [x + rx * hw + nx * 0.9, cy, z + rz * hw + nz * 0.9],
      [x - rx * hw + nx * 0.9, cy, z - rz * hw + nz * 0.9],
      [0, 1, 0],
      [0, 0, w / 2, 0, w / 2, 0.5, 0, 0.5],
      [0.5, 0.5, 0.48],
    );
    const rb = M.buf("rust", x, z, "detail");
    M.beam(
      rb,
      x - rx * hw + nx * 0.9,
      cy + 1,
      z - rz * hw + nz * 0.9,
      x + rx * hw + nx * 0.9,
      cy + 1,
      z + rz * hw + nz * 0.9,
      0.04,
      0.04,
      { c: fc },
    );
    for (let t = -hw; t <= hw; t += 1.5)
      M.beam(
        rb,
        x + rx * t + nx * 0.9,
        cy,
        z + rz * t + nz * 0.9,
        x + rx * t + nx * 0.9,
        cy + 1,
        z + rz * t + nz * 0.9,
        0.03,
        0.03,
        { c: fc },
      );
    // gooseneck lamps along the top
    const nl = Math.max(2, Math.round(w / 4));
    for (let i = 0; i < nl; i++) {
      const t = -hw + (w * (i + 0.5)) / nl;
      const lx = x + rx * t,
        lz = z + rz * t,
        ly = py + h / 2 + 0.2;
      M.pipe(rb, lx, ly, lz, lx + nx * 1.1, ly + 0.6, lz + nz * 1.1, 0.03, 4, {
        c: [0.3, 0.3, 0.3],
      });
      M.cyl(
        M.buf("metal_painted", x, z, "detail"),
        lx + nx * 1.2,
        ly + 0.35,
        lz + nz * 1.2,
        0.3,
        0.12,
        0.28,
        6,
        { c: [0.35, 0.35, 0.33] },
      );
    }
    M.ocol(x - nx * 1, z - nz * 1, 2.5, w, y, py + h / 2, Math.atan2(-nz, nx), {
      tag: "billboard",
      surface: "metal",
    });
  }
  M.rooftopBillboard = rooftopBillboard;

  /** Find a lot adjacent to `lot` on side k ('e'|'w'|'n'|'s'). */
  function neighbour(lot, k, idx) {
    const cands =
      idx.get(
        k === "e" ? Math.round(lot.x1) : k === "w" ? Math.round(lot.x0) : 0,
      ) || [];
    for (const o of cands) {
      if (o === lot) continue;
      if (
        k === "e" &&
        Math.abs(o.x0 - lot.x1) < 0.6 &&
        o.z0 < lot.z1 - 1 &&
        o.z1 > lot.z0 + 1
      )
        return o;
      if (
        k === "w" &&
        Math.abs(o.x1 - lot.x0) < 0.6 &&
        o.z0 < lot.z1 - 1 &&
        o.z1 > lot.z0 + 1
      )
        return o;
    }
    return null;
  }

  M.buildBillboards = function () {
    const L = G.LAYOUT;
    const r = M.rng("billboards");
    const lots = M.lots || [];
    // index lots by rounded x edges for neighbour lookups
    const idx = new Map();
    for (const l of lots) {
      for (const x of [Math.round(l.x0), Math.round(l.x1)]) {
        for (const k of [x - 1, x, x + 1]) {
          let a = idx.get(k);
          if (!a) {
            a = [];
            idx.set(k, a);
          }
          a.push(l);
        }
      }
    }
    // ---- 1. rooftop billboards on mid-rise buildings facing streets/avenues ----
    const cand = lots.filter(
      (l) =>
        l.h > 10 &&
        l.h < 60 &&
        (l.kind === "commercial" ||
          l.kind === "tenement" ||
          l.kind === "apartment" ||
          l.kind === "warehouse") &&
        l.x1 - l.x0 > 9,
    );
    // spread: at most one per ~100 m cell
    const used = new Set();
    let roofCount = 0;
    const order = cand
      .map((l) => [r(), l])
      .sort((a, b) => a[0] - b[0])
      .map((e) => e[1]);
    for (const l of order) {
      if (roofCount >= 46) break;
      const cx = (l.x0 + l.x1) / 2,
        cz = (l.z0 + l.z1) / 2;
      const key = Math.floor(cx / 95) + "," + Math.floor(cz / 80);
      if (used.has(key)) continue;
      // face a street side (prefer avenue-facing e/w for north-south views, else n/s)
      const fr = {
        n: l.front.n || l.faceN,
        s: l.front.s || l.faceS,
        e: l.front.e,
        w: l.front.w,
      };
      const sides = Object.keys(fr).filter((k) => fr[k]);
      if (!sides.length) continue;
      const k = r.pick(sides);
      const nx = k === "e" ? 1 : k === "w" ? -1 : 0,
        nz = k === "s" ? 1 : k === "n" ? -1 : 0;
      const span = nz !== 0 ? l.x1 - l.x0 : l.z1 - l.z0;
      const w = Math.min(span - 2, r.range(9, 15));
      if (w < 7) continue;
      const h = w * 0.5;
      const px = nz !== 0 ? cx : k === "e" ? l.x1 - 2.5 : l.x0 + 2.5;
      const pz = nx !== 0 ? cz : k === "s" ? l.z1 - 2.5 : l.z0 + 2.5;
      rooftopBillboard(px, l.h + 0.2, pz, nx, nz, w, h, nextBrand(r), r);
      used.add(key);
      roofCount++;
    }
    // ---- 2. painted ads on exposed party walls (taller than the neighbour) ----
    let wallCount = 0;
    for (const l of lots) {
      if (wallCount >= 70) break;
      if (l.kind === "collapsed" || l.kind === "tower" || !(l.h > 14)) continue;
      for (const k of ["e", "w"]) {
        if (l.front[k]) continue; // street face has windows
        const nb = neighbour(l, k, idx);
        const nh = nb ? nb.h || 0 : 0;
        const exposed = l.h - nh;
        if (exposed < 9) continue;
        if (r() < 0.4) continue;
        const d = l.z1 - l.z0;
        const w = Math.min(d - 2, (exposed - 2) * 2, r.range(10, 18));
        if (w < 6) continue;
        const h = w * 0.5;
        const y = nh + 1 + (exposed - 2 - h) * r.range(0.3, 0.8) + h / 2;
        const nx = k === "e" ? 1 : -1;
        const x = (k === "e" ? l.x1 : l.x0) + nx * 0.06;
        const z = (l.z0 + l.z1) / 2 + r.range(-(d - w) / 2, (d - w) / 2) * 0.8;
        panel(nextBrand(r), x, y, z, nx, 0, w, h, {
          c: M.mulc([1, 1, 1], r.range(0.62, 0.9)),
          layer: "main",
        });
        wallCount++;
        break;
      }
    }
    // ---- 3. Brooklyn warehouse walls facing Manhattan (west) ----
    const bk = lots
      .filter(
        (l) => l.district === "brooklyn" && l.kind === "warehouse" && l.h > 12,
      )
      .sort((a, b) => a.x0 - b.x0)
      .slice(0, 6);
    for (const l of bk) {
      const d = l.z1 - l.z0,
        w = Math.min(d - 3, 22),
        h = w * 0.5;
      if (w < 8) continue;
      panel(
        nextBrand(r),
        l.x0 - 0.08,
        Math.max(h / 2 + 3, l.h - h / 2 - 2),
        (l.z0 + l.z1) / 2,
        -1,
        0,
        w,
        h,
        { c: [0.8, 0.8, 0.8] },
      );
    }
    // ---- 4. The giant rooftop FIZZO COLA sign on the Brooklyn waterfront ----
    const cand2 = lots
      .filter(
        (l) =>
          l.district === "brooklyn" &&
          l.kind === "warehouse" &&
          l.z0 > 390 &&
          l.z1 < 560,
      )
      .sort((a, b) => a.x0 - b.x0);
    const host = cand2[0];
    if (host) {
      const x = host.x0 + 4,
        z = (host.z0 + host.z1) / 2;
      rooftopBillboard(x, host.h + 0.2, z, -1, 0, 34, 12, "fizzo_cola", r);
      M.giantSign = { x, z, y: host.h };
    }
    // ---- 5. vertical banners on a few midtown towers ----
    const towers = lots.filter(
      (l) => l.kind === "tower" && l.h > 70 && l.district === "midtown",
    );
    for (let i = 0; i < Math.min(8, towers.length); i++) {
      const l = towers[(i * 7) % towers.length];
      const fr = ["n", "s"].filter((k) => l.front[k]);
      if (!fr.length) continue;
      const k = fr[0],
        nz = k === "s" ? 1 : -1;
      const z = (k === "s" ? l.z1 : l.z0) + nz * 0.25;
      const w = Math.min(16, l.x1 - l.x0 - 4),
        h = w * 0.5;
      if (w < 8) continue;
      panel(
        nextBrand(r),
        (l.x0 + l.x1) / 2,
        9 + h / 2 + r.range(0, 4),
        z,
        0,
        nz,
        w,
        h,
        { c: [0.85, 0.85, 0.85] },
      );
    }
    M.billboardCount = M.billboards.length;
    void L;
    return M.billboards.length;
  };
})();
