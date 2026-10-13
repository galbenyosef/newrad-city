// play-inline-82 01 — ctx
// Lines 12-265 of readable/play-inline-82.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  const M = G.map._;
  const SY = M.SIDEWALK_Y;
  const MK = M.MARK;

  // -------------------------------------------------------------------
  // Atlases
  // -------------------------------------------------------------------
  M.streetSignIndex = {};
  M.defineAtlas("streetsigns", function () {
    const names = [];
    const add = (n) => {
      if (n && !(n in M.streetSignIndex)) {
        M.streetSignIndex[n] = names.length;
        names.push(n);
      }
    };
    for (const a of G.LAYOUT.AVENUE_DEFS) add(a.name);
    add("Broadway");
    add("Central Park West");
    add("Central Park South");
    add("Columbus Circle");
    for (const a of M.roads.avenues) add(a.name);
    for (const s of M.roads.streets) add(s.name);
    const cols = 2,
      rows = 64,
      CW = 512,
      CH = 64;
    const cv = M.canvas(cols * CW, rows * CH),
      ctx = cv.getContext("2d");
    const r = M.rng("streetsigns");
    names.slice(0, cols * rows).forEach((n, i) => {
      const x = (i % cols) * CW,
        y = Math.floor(i / cols) * CH;
      let drawn = false;
      try {
        if (!G.isStub("tex") && G.tex.sign) {
          const t = G.tex.sign(n.toUpperCase(), "street");
          const img = t && t.image;
          if (
            img &&
            img.width &&
            img.height &&
            img.width / img.height > 3 &&
            img.width / img.height < 12
          ) {
            ctx.drawImage(img, x, y, CW, CH);
            drawn = true;
          }
        }
      } catch (e) {
        drawn = false;
      }
      if (!drawn) {
        ctx.fillStyle = "#1f5a36";
        ctx.fillRect(x, y, CW, CH);
        ctx.strokeStyle = "#e8e8dc";
        ctx.lineWidth = 4;
        ctx.strokeRect(x + 5, y + 5, CW - 10, CH - 10);
        ctx.fillStyle = "#ecece0";
        ctx.font = 'bold 40px "Arial Narrow", Arial, sans-serif';
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const txt = n
          .replace(" Street", " St")
          .replace(" Avenue", " Av")
          .toUpperCase();
        ctx.save();
        ctx.translate(x + CW / 2, y + CH / 2 + 2);
        ctx.scale(0.8, 1);
        ctx.fillText(txt, 0, 0, CW * 1.15);
        ctx.restore();
      }
      // weathering
      for (let k = 0; k < 40; k++) {
        ctx.fillStyle =
          "rgba(" + ((60 + r() * 60) | 0) + ",40,20," + r() * 0.35 + ")";
        ctx.fillRect(x + r() * CW, y + r() * CH, 2 + r() * 12, 1 + r() * 6);
      }
    });
    M.streetSignNames = names;
    const t = M.finishTex(new THREE.CanvasTexture(cv));
    t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
    return { texture: t, roughness: 0.6, metalness: 0.2 };
  });
  M.streetSignUV = function (name) {
    M.atlasMaterial("streetsigns");
    const i = M.streetSignIndex[name];
    return M.cellUV(i === undefined ? 0 : i, 2, 64);
  };

  const SHOPS = [
    ["DELICATESSEN", "#7a1f1a", "#f0e2c0"],
    ["PHARMACY", "#1d4d33", "#f2f2e0"],
    ["PAWN SHOP · LOANS", "#23233a", "#e8c24a"],
    ["LAUNDROMAT", "#2e5a7a", "#ffffff"],
    ["HARDWARE", "#5a3a1a", "#f0d890"],
    ["LIQUORS", "#6a1a2a", "#ffe0a0"],
    ["BARBER SHOP", "#f0ece0", "#b02020"],
    ["SHOE REPAIR", "#3a3020", "#e8dcc0"],
    ["RADIO & TV REPAIR", "#1e3a4a", "#9ff0ff"],
    ["SPARKLE CLEANERS", "#d8d0b0", "#1b3f6b"],
    ["FIZZO COLA SOLD HERE", "#a8322a", "#f7f0dc"],
    ["DINER · OPEN 24 HRS", "#c8c0a8", "#8a1a14"],
    ["BOOKS & MAGAZINES", "#2a2a2a", "#e0d8b8"],
    ["TAILOR", "#4a3a5a", "#f0e8d8"],
    ["JEWELRY", "#101010", "#e8c870"],
    ["BAKERY", "#e8d8b0", "#6a3a1a"],
    ["FLORIST", "#2a4a2a", "#f8e8e8"],
    ["HOTEL", "#3a1a1a", "#f0c860"],
    ["CHECK CASHING", "#e0c030", "#202020"],
    ["GROCERY", "#2d5a2d", "#f8f0d8"],
    ["TELETYPE SALES & SERVICE", "#26323a", "#ffb347"],
    ["CIVIL DEFENSE RECRUITING", "#1b2f5a", "#f4f0e6"],
    ["PIZZA GALAXY · SLICES", "#20103a", "#ffcf40"],
    ["CHOP SUEY", "#8a1a1a", "#f0d060"],
    ["TOBACCONIST", "#3a2a1a", "#e0c898"],
    ["CAMERA EXCHANGE", "#202830", "#f0f0f0"],
    ["TOYS & HOBBIES", "#d04020", "#fff4c0"],
    ["BAR & GRILL", "#1a1a1a", "#ff9040"],
    ["LONLY TELEVISION · SALES & SERVICE", "#e8e2d0", "#1b3f6b"],
    ["PHOTO STUDIO", "#403040", "#f0e0f0"],
    ["LUNCHEONETTE", "#c83a2a", "#ffffff"],
    ["OPTICIAN", "#1a2a4a", "#e0f0ff"],
  ];
  M.SHOP_SIGN_COUNT = SHOPS.length;
  M.defineAtlas("shopsigns", function () {
    const cols = 2,
      rows = 16,
      CW = 512,
      CH = 64;
    const cv = M.canvas(cols * CW, rows * CH),
      ctx = cv.getContext("2d");
    const r = M.rng("shopsigns");
    const fonts = [
      "bold 38px Georgia, serif",
      'bold 40px "Arial Narrow", Arial, sans-serif',
      "italic bold 38px Georgia, serif",
      'bold 36px "Courier New", monospace',
    ];
    SHOPS.forEach(([txt, bg, fg], i) => {
      const x = (i % cols) * CW,
        y = Math.floor(i / cols) * CH;
      ctx.fillStyle = bg;
      ctx.fillRect(x, y, CW, CH);
      ctx.strokeStyle = fg;
      ctx.globalAlpha = 0.5;
      ctx.lineWidth = 3;
      ctx.strokeRect(x + 6, y + 6, CW - 12, CH - 12);
      ctx.globalAlpha = 1;
      ctx.fillStyle = fg;
      ctx.font = fonts[i % fonts.length];
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(txt, x + CW / 2, y + CH / 2 + 2, CW - 30);
      // grime, rust drips, missing letters
      for (let k = 0; k < 60; k++) {
        ctx.fillStyle =
          "rgba(" +
          ((40 + r() * 50) | 0) +
          "," +
          ((30 + r() * 30) | 0) +
          ",20," +
          r() * 0.45 +
          ")";
        ctx.fillRect(x + r() * CW, y + r() * CH, 2 + r() * 16, 1 + r() * 10);
      }
      for (let k = 0; k < 6; k++) {
        ctx.fillStyle = "rgba(90,50,25,0.35)";
        ctx.fillRect(x + r() * CW, y + CH * 0.5, 2, CH * 0.5);
      }
      if (r() < 0.4) {
        ctx.fillStyle = bg;
        ctx.fillRect(x + 40 + r() * (CW - 100), y + 8, 26, CH - 16);
      }
    });
    const t = M.finishTex(new THREE.CanvasTexture(cv));
    t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
    return { texture: t, roughness: 0.75 };
  });

  // -------------------------------------------------------------------
  // Lane lines, crosswalks, stop lines
  // -------------------------------------------------------------------
  const Y_MARK = 0.012;
  function dashes(ax, az, bx, bz, w, dash, gap, cell, fade, r) {
    const len = Math.hypot(bx - ax, bz - az);
    if (len < 1) return;
    const ux = (bx - ax) / len,
      uz = (bz - az) / len,
      yaw = Math.atan2(ux, uz);
    for (let t = 0; t < len - dash; t += dash + gap) {
      if (r() < fade) continue;
      const cx = ax + ux * (t + dash / 2),
        cz = az + uz * (t + dash / 2);
      if (
        M.circlePart &&
        M.circlePart(cx, cz) &&
        M.circlePart(cx, cz) !== "walk"
      )
        continue; // roundabouts get their own paint
      // 22 years of traffic-free weathering: faded, sun-bleached paint (dimmer vertex colour = less contrast)
      const c = M.mulc([1, 1, 1], r.range(0.2, 0.5));
      // broken paint: some dashes survive only as fragments
      const frag = r() < 0.3 ? r.range(0.35, 0.8) : 1;
      M.decal(
        M.buf("my/markings", cx, cz, "detail"),
        cx,
        Y_MARK,
        cz,
        w,
        dash * frag,
        yaw,
        cell,
        c,
        r() < 0.5,
      );
    }
  }
  function solid(ax, az, bx, bz, w, cell, r, fade) {
    const len = Math.hypot(bx - ax, bz - az);
    if (len < 1) return;
    const n = Math.ceil(len / 6);
    for (let i = 0; i < n; i++) {
      if (r() < (fade || 0.15)) continue;
      const t0 = (i * len) / n,
        t1 = ((i + 1) * len) / n;
      dashes(
        ax + ((bx - ax) * t0) / len,
        az + ((bz - az) * t0) / len,
        ax + ((bx - ax) * t1) / len,
        az + ((bz - az) * t1) / len,
        w,
        t1 - t0 - 0.01,
        0.01,
        cell,
        0,
        r,
      );
    }
  }
  function intersections() {
    const out = [];
    for (const a of M.roads.avenues)
      for (const s of M.roads.streets) {
        if (a.x < s.x0 + 4 || a.x > s.x1 - 4) continue;
        if (s.z < a.z0 + 3 || s.z > a.z1 - 3) continue;
        out.push({ a, s, x: a.x, z: s.z });
      }
    M.intersections = out;
    return out;
  }
