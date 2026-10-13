// play-inline-441 08 — fillstyle
// Lines 2326-2514 of readable/play-inline-441.pretty.js (statement-aligned).
  R("newsstand_sign", 512, 64, (c, w, h, r) => {
    c.fillStyle = "#23402c";
    c.fillRect(0, 0, w, h);
    c.strokeStyle = "#d8ceb0";
    c.lineWidth = 2;
    c.strokeRect(4, 4, w - 8, h - 8);
    txt(
      c,
      "NEWS · MAGAZINES · CIGARETTES · CANDY",
      w / 2,
      h / 2 + 2,
      30,
      "#e4d8b4",
      { maxW: 480 },
    );
    weather(c, w, h, r, 1.2);
  });
  const MAGS = [
    ["RIFLEMAN'S COMPANION", "#3a3a2a", "#e8c040"],
    ["SUPER SERGEANT", "#f0d040", "#b8261c"],
    ["HANDYMAN MONTHLY", "#1a3a6a", "#e8e0c8"],
    ["THE FIRST JOURNAL", "#e8e4d8", "#1e3a66"],
    ["POPULAR CIRCUITS", "#e8d040", "#1a1a18"],
    ["SPEEDWAY", "#b01a14", "#f0e8c8"],
    ["TRUE ROMANCE TALES", "#d06a8a", "#fff4e8"],
    ["MOTOR MANUAL", "#e8e4d8", "#2a3a5a"],
  ];
  R("mag_rack", 256, 160, (c, w, h, r) => {
    c.fillStyle = "#2a2a24";
    c.fillRect(0, 0, w, h);
    for (let i = 0; i < 8; i++) {
      const m = MAGS[i],
        cx = (i % 4) * 64,
        cy = ((i / 4) | 0) * 80;
      c.save();
      c.translate(cx + 32, cy + 40);
      c.rotate((r() - 0.5) * 0.08);
      c.fillStyle = m[1];
      c.fillRect(-28, -36, 56, 72);
      txt(c, m[0], 0, -26, 11, m[2], { maxW: 52 });
      c.fillStyle = "rgba(255,255,255,0.18)";
      c.beginPath();
      c.arc(0, 6, 16, 0, X.TAU);
      c.fill();
      c.fillStyle = m[2];
      c.fillRect(-20, 26, 40, 3);
      c.restore();
    }
    weather(c, w, h, r, 1.3);
  });
  R("shutter", 256, 160, (c, w, h, r) => {
    for (let y = 0; y < h; y += 8) {
      const t = (96 + r() * 20) | 0;
      c.fillStyle = "rgb(" + t + "," + (t - 2) + "," + (t - 8) + ")";
      c.fillRect(0, y, w, 8);
      c.fillStyle = "rgba(0,0,0,0.35)";
      c.fillRect(0, y + 6, w, 2);
    }
    for (let i = 0; i < 14; i++) {
      c.fillStyle = "rgba(110,50,20," + (0.2 + r() * 0.3) + ")";
      c.fillRect(r() * w, r() * h, 6 + r() * 30, 3 + r() * 20);
    }
    txt(
      c,
      [
        "THE END IS NIGH",
        "COVENANT WAS HERE",
        "NO SCRIP INSIDE",
        "GOD BLESS AMERICA",
      ][(r() * 4) | 0],
      w / 2,
      h * 0.45,
      30,
      "#c02018",
      { font: F_SCRIPT, maxW: 230, stroke: "rgba(0,0,0,0.2)" },
    );
    c.fillStyle = "#20201c";
    c.fillRect(w / 2 - 14, h - 14, 28, 8);
    weather(c, w, h, r, 1.0);
  });
  R("red_cross", 128, 128, (c, w, h, r) => {
    c.fillStyle = "#ddd6c0";
    c.fillRect(0, 0, w, h);
    c.fillStyle = "#b01a16";
    c.fillRect(44, 14, 40, 84);
    c.fillRect(8, 36, 112, 40);
    txt(c, "U.S. ARMY MEDICAL", w / 2, 112, 11, "#3a3a30", { maxW: 118 });
    weather(c, w, h, r, 1.2);
  });
  R("fire_alarm", 64, 96, (c, w, h, r) => {
    c.fillStyle = "#9c1c14";
    c.fillRect(0, 0, w, h);
    c.fillStyle = "#e8d8a8";
    rrect(c, 8, 8, 48, 24, 4);
    c.fill();
    txt(c, "FIRE", 32, 21, 18, "#9c1c14");
    txt(c, "PULL", 32, 50, 12, "#e8d8a8");
    txt(c, "HOOK", 32, 64, 12, "#e8d8a8");
    c.fillStyle = "#2a1a14";
    rrect(c, 20, 74, 24, 12, 3);
    c.fill();
    weather(c, w, h, r, 1.3);
  });
  R("toe_tag", 64, 32, (c, w, h, r) => {
    c.fillStyle = "#d8ceb0";
    c.fillRect(0, 0, w, h);
    stencil(c, "DOA  10-23", w / 2, h / 2, 10, "#3a3028");
    weather(c, w, h, r, 1.0);
  });

  // ------------------------------------------------------------------
  // Build the atlas (shelf packing)
  // ------------------------------------------------------------------
  X.buildAtlas = function () {
    if (X._atlasTex) return X._atlasTex;
    const canvas = X.makeCanvas(AW, AH),
      ctx = canvas.getContext("2d");
    ctx.fillStyle = "#808080";
    ctx.fillRect(0, 0, AW, AH);
    // skyline bottom-left packing (tallest first)
    const items = ORDER.slice().sort((a, b) => b[2] - a[2] || b[1] - a[1]);
    const sky = new Int32Array(AW);
    const PAD = 2;
    for (const [name, w, h, painter] of items) {
      let bestY = 1e9,
        bestX = 0;
      for (let x = 0; x + w <= AW; x += 4) {
        let y = 0;
        for (let k = x; k < x + w; k++)
          if (sky[k] > y) {
            y = sky[k];
            if (y >= bestY) break;
          }
        if (y < bestY) {
          bestY = y;
          bestX = x;
        }
      }
      if (bestY + h > AH) {
        console.warn("props atlas overflow at " + name);
        REGIONS[name] = REGIONS.white;
        continue;
      }
      const x = bestX,
        y = bestY;
      for (let k = x; k < Math.min(AW, x + w + PAD); k++) sky[k] = y + h + PAD;
      ctx.save();
      ctx.translate(x, y);
      ctx.beginPath();
      ctx.rect(0, 0, w, h);
      ctx.clip();
      try {
        painter(ctx, w, h, U.rng(U.hashStr(name)));
      } catch (e) {
        G.reportError("props:atlas:" + name, e);
      }
      ctx.restore();
      // UVs (flipY: canvas top = v 1). Inset half a texel to avoid bleeding.
      REGIONS[name] = {
        u0: (x + 0.5) / AW,
        u1: (x + w - 0.5) / AW,
        v0: 1 - (y + h - 0.5) / AH,
        v1: 1 - (y + 0.5) / AH,
        px: [x, y, w, h],
      };
    }
    const t = X.finishTex(canvas, false);
    t.generateMipmaps = true;
    t.minFilter = THREE.LinearMipmapLinearFilter;
    X._atlasTex = t;
    X._atlasCanvas = canvas;
    return t;
  };
  X.atlasRegion = function (name) {
    if (!X._atlasTex) X.buildAtlas();
    return REGIONS[name] || REGIONS.white;
  };
  X.hasRegion = (name) => {
    if (!X._atlasTex) X.buildAtlas();
    return !!REGIONS[name];
  };
  X.atlasTexture = function () {
    return X._atlasTex || X.buildAtlas();
  };

  // ------------------------------------------------------------------
  // Fallback billboard art (only used when the textures module is absent)
  // ------------------------------------------------------------------
  // [background, ink, headline, slogan, motif] for the 28 brand ids of LAYOUT.BRANDS; unknown ids get one of these by hash
