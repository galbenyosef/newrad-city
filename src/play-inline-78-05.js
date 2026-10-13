// play-inline-78 05 — ctx
// Lines 1412-1602 of readable/play-inline-78.pretty.js (statement-aligned).
  const FACADE_FB = {
    apartment: { wall: "#8f6d52", trim: "#b9ab8e", win: "#1c2122" },
    artdeco: { wall: "#a39a86", trim: "#c7bea6", win: "#1a1f22" },
    brownstone: { wall: "#5e4131", trim: "#7d5a45", win: "#161a1a" },
    warehouse: { wall: "#7a3e2c", trim: "#8f8472", win: "#1d2020", arch: true },
    office: { wall: "#7d7f7a", trim: "#9b9d97", win: "#20282a", band: true },
  };
  function fallbackFacade(style, variant) {
    const key = "fbf:" + style + variant;
    if (texCache.has(key)) return texCache.get(key);
    const f = FACADE_FB[style] || FACADE_FB.apartment;
    const S = 512,
      cv = M.canvas(S, S),
      ctx = cv.getContext("2d");
    const r = M.rng(key);
    const wall = new THREE.Color(f.wall).multiplyScalar(0.85 + variant * 0.07);
    ctx.fillStyle = "#" + wall.getHexString();
    ctx.fillRect(0, 0, S, S);
    const img = ctx.getImageData(0, 0, S, S),
      d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const n = (r() - 0.5) * 22;
      d[i] += n;
      d[i + 1] += n;
      d[i + 2] += n;
    }
    ctx.putImageData(img, 0, 0);
    const bw = S / 4,
      fh = S / 4;
    for (let fy = 0; fy < 4; fy++) {
      if (f.band) {
        ctx.fillStyle = f.trim;
        ctx.fillRect(0, fy * fh + fh - 14, S, 10);
      } else {
        ctx.fillStyle = "rgba(0,0,0,0.12)";
        ctx.fillRect(0, fy * fh + fh - 6, S, 3);
      }
      for (let bx = 0; bx < 4; bx++) {
        const x = bx * bw + bw * 0.22,
          y = fy * fh + fh * 0.18,
          w = bw * 0.56,
          h = fh * 0.62;
        ctx.fillStyle = f.trim;
        ctx.fillRect(x - 5, y - 5, w + 10, h + 12);
        const roll = r();
        if (roll < 0.12) {
          ctx.fillStyle = "#6b5236";
          ctx.fillRect(x, y, w, h);
          ctx.fillStyle = "rgba(0,0,0,0.3)";
          for (let k = 0; k < 4; k++) ctx.fillRect(x, y + (k * h) / 4, w, 2);
        } else {
          ctx.fillStyle = roll < 0.45 ? "#0b0d0d" : f.win;
          ctx.fillRect(x, y, w, h);
          if (roll >= 0.45) {
            ctx.fillStyle = "rgba(160,170,150,0.12)";
            ctx.fillRect(x + 2, y + 2, w * 0.4, h * 0.45);
          }
          ctx.fillStyle = f.trim;
          ctx.fillRect(x + w / 2 - 2, y, 4, h);
          ctx.fillRect(x, y + h / 2 - 2, w, 4);
          if (f.arch) {
            ctx.fillStyle = f.trim;
            ctx.beginPath();
            ctx.arc(x + w / 2, y, w / 2 + 5, Math.PI, 0);
            ctx.fill();
            ctx.fillStyle = "#0b0d0d";
            ctx.beginPath();
            ctx.arc(x + w / 2, y, w / 2, Math.PI, 0);
            ctx.fill();
          }
        }
      }
    }
    // grime streaks
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = "rgba(20,18,12," + (0.04 + r() * 0.08) + ")";
      ctx.fillRect(r() * S, r() * S, 2 + r() * 6, 30 + r() * 140);
    }
    const t = finishTex(new THREE.CanvasTexture(cv));
    texCache.set(key, t);
    return t;
  }
  M.fallbackFacade = fallbackFacade;

  // The map calls the masonry apartment-house façade style 'apartment'. The textures module publishes its
  // style ids through G.tex.facadeStyles(); until it lists 'apartment' the map asks for the textures id below.
  const TEX_FACADE_ID = { apartment: "tenement" }; // textures-module facade style id (owner: textures)
  M.texFacadeStyle = function (style) {
    try {
      const tex = G.isStub("tex") ? null : G.tex;
      const list = tex && tex.facadeStyles ? tex.facadeStyles() : null;
      if (list && list.indexOf(style) >= 0) return style;
    } catch (e) {
      /* fall through */
    }
    return TEX_FACADE_ID[style] || style;
  };

  /** Fallback billboard: brand name on a faded retro panel. */
  // [background, ink, display name] per brand id of LAYOUT.BRANDS
  const BRAND_COL = {
    fizzo_cola: ["#a8322a", "#f4ead2", "FIZZO COLA"],
    fizzo_blue: ["#1d4f7a", "#d8f2ff", "FIZZO BLUE"],
    long_winter: ["#1b2f5a", "#f4f0e6", "CIVIL DEFENSE"],
    prairie_root_beer: ["#7a4422", "#f6e2b0", "PRAIRIE ROOT BEER"],
    liberty_jetliner: ["#1c2f5c", "#f2eee2", "LIBERTY JETLINER"],
    first_journal: ["#ece6d6", "#1e3a66", "THE FIRST JOURNAL"],
    pizza_galaxy: ["#20103a", "#ffcf40", "PIZZA GALAXY"],
    empire_brew: ["#1e4a34", "#f0e0b0", "EMPIRE BREW HOUSE"],
    silver_torch: ["#26323e", "#e8eaee", "SILVER TORCH"],
    burger_brigade: ["#c8281e", "#fff0c8", "BURGER BRIGADE"],
    excalibur_gardens: ["#3a2a6a", "#f0d070", "EXCALIBUR GARDENS"],
    junior_rocketeer: ["#e8e4d8", "#c8281e", "JUNIOR ROCKETEER"],
    miracle_mane: ["#2a4a3a", "#f0e0b0", "MIRACLE MANE"],
    big_apple_cab: ["#e0b020", "#151515", "BIG APPLE MOTOR CAB"],
    mama_marinara: ["#c42a1e", "#f6ead0", "MAMA MARINARA'S"],
    hi_octane: ["#f0e6d0", "#c8281e", "HI-OCTANE HARRY'S"],
    vigil: ["#13263a", "#cfeefa", "VIGIL DEFENSE"],
    freedom_flakes: ["#1e3f86", "#f6eedc", "FREEDOM FLAKES"],
    chocolate_zeppelin: ["#5a3420", "#f0e4c8", "CHOCOLATE ZEPPELIN"],
    golden_plain: ["#d8a838", "#4a2410", "GOLDEN PLAIN JERKY"],
    homeguard: ["#e8e4d8", "#1a3a6a", "HOMEGUARD"],
    lonly_tv: ["#2a2a2a", "#e8c860", "LONLY"],
    eagle_motors: ["#16324a", "#f0e8d0", "EAGLE MOTORS"],
    super_sergeant: ["#f0d040", "#b8261c", "SUPER SERGEANT"],
    american_automaton: ["#d6e0e4", "#1a3a4a", "AMERICAN AUTOMATON CO."],
    forever_franks: ["#f0e4c4", "#b01a14", "FOREVER FRANKS"],
    sky_patrol: ["#101838", "#9fd8ff", "SKY PATROL"],
    worlds_fair: ["#e8e2d0", "#1b4f7b", "1964 WORLD'S FAIR"],
  };
  M.fallbackBillboardTex = (brand) => fallbackBillboard(brand);
  function fallbackBillboard(brand) {
    const key = "fbb:" + brand;
    if (texCache.has(key)) return texCache.get(key);
    const cv = M.canvas(512, 256),
      ctx = cv.getContext("2d");
    const c = BRAND_COL[brand] || ["#555", "#eee"];
    ctx.fillStyle = c[0];
    ctx.fillRect(0, 0, 512, 256);
    ctx.fillStyle = c[1];
    ctx.font = "bold 54px Georgia, serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(c[2] || brand.replace(/_/g, " ").toUpperCase(), 256, 110, 480);
    ctx.font = "italic 24px Georgia, serif";
    ctx.fillText("— since 1931 —", 256, 180);
    const r = M.rng(key);
    for (let i = 0; i < 90; i++) {
      ctx.fillStyle = "rgba(40,30,20," + r() * 0.3 + ")";
      ctx.fillRect(r() * 512, r() * 256, 4 + r() * 30, 2 + r() * 20);
    }
    const t = finishTex(new THREE.CanvasTexture(cv));
    t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
    texCache.set(key, t);
    return t;
  }

  const FALLBACK_COLOR = {
    chrome: 0xb8bcc0,
    cryo_grey: 0x2a4f86,
    cryo_orange: 0xd8a830,
    paint_red: 0x8f2a22,
    paint_teal: 0x3d7a74,
    glass: 0x2b3432,
    emissive_window: 0xd8c890,
    neon_green: 0x40ff70,
    neon_red: 0xff4040,
    neon_blue: 0x4090ff,
    neon_yellow: 0xffe060,
    black: 0x151515,
    paint_yellow: 0xc89a28,
    rubber: 0x1c1c1c,
    bone: 0xd8d0b8,
  };

  function isMat(m) {
    return m && m.isMaterial;
  }

  /**
   * Resolve a material key to a (cloned, vertex-coloured) material.
   * Key syntax: "<source>[@variant]" where source is one of
   *   texname                    → G.mats.get(texname)
   *   facade/<style>/<n>         → G.mats.facade(style, n)
   *   bb/<brand>                 → G.mats.billboard(brand)
   *   decal/<name>               → G.tex.decal(name)   (transparent)
   *   my/<atlas>                 → map-owned canvas atlas (see atlases below)
   *   c/<hex>                    → flat colour (untextured trims; rarely used)
   * variants: base, plate (polygon offset back), decal (offset forward+transparent),
   *   ds (double sided), glow (emissive), dark (tinted), nocol (no vertex colours)
   */
