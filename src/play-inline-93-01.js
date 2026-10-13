// play-inline-93 01 — brand
// Lines 10-316 of readable/play-inline-93.pretty.js (statement-aligned).
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

