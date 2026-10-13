/* src/landmarks_a/02_textures.js */
/* =====================================================================
 * NEW RAD CITY — landmarks_a / 02_textures.js
 * Procedural façade textures (window grids tuned per landmark), and the
 * shared atlases: 'paint' (painted signs, clock faces, reliefs), 'neon'
 * (additive glowing tubes/text), 'ads' (brand billboards — sourced from
 * G.tex.billboard when available, original fallback art otherwise) and
 * 'flags' (waving cloth, custom vertex shader).
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G,
    THREE = window.THREE;
  if (!G || !THREE || !G.LMA) return;
  const K = G.LMA.kit;
  const U = G.util;

  // ------------------------------------------------------------------
  // Façade textures
  // ------------------------------------------------------------------
  /**
   * K.facade(key, spec) → defines material `key` with a window-grid texture.
   * spec: {bays, floors, bayW, floorH, px (canvas px), wall, wall2?, pier (0..1 of bay), win:{x0,x1,y0,y1} fractions of a bay/floor,
   *        frame, glass, spandrel (colour → vertical metal strips), broken, boarded, lit, litColor, mullions (n vertical), hBand (colour of
   *        horizontal floor band), brick:boolean, seed, rough, metal, emissiveIntensity}
   */
  K.facade = function (key, s) {
    const W = s.pxW || 512,
      H = s.pxH || 512;
    const c = K.canvas(W, H),
      x = c.getContext("2d");
    const bw = W / s.bays,
      fh = H / s.floors;
    const r = K.rng(s.seed || key);
    const lit = s.lit || 0;
    let ec = null,
      ex = null;
    if (lit > 0) {
      ec = K.canvas(W / 2, H / 2);
      ex = ec.getContext("2d");
      ex.fillStyle = "#000";
      ex.fillRect(0, 0, W / 2, H / 2);
    }
    // wall base
    x.fillStyle = s.wall;
    x.fillRect(0, 0, W, H);
    if (s.brick) {
      const bh = Math.max(2, fh / 12),
        bwid = bh * 2.6;
      for (let yy = 0; yy < H; yy += bh)
        for (let xx = -bwid; xx < W; xx += bwid) {
          const off = ((Math.floor(yy / bh) % 2) * bwid) / 2;
          x.fillStyle = K.shadeHex(s.wall, 0.82 + r() * 0.3);
          x.fillRect(xx + off + 1, yy + 1, bwid - 2, bh - 1.5);
        }
    } else if (s.blocks !== false) {
      // ashlar joints
      x.strokeStyle = "rgba(40,36,30,0.18)";
      x.lineWidth = 1;
      const jh = fh / 3;
      for (let yy = 0; yy < H; yy += jh) {
        x.beginPath();
        x.moveTo(0, yy);
        x.lineTo(W, yy);
        x.stroke();
      }
    }
    for (let fy = 0; fy < s.floors; fy++) {
      const y0 = H - (fy + 1) * fh; // canvas y (top of this floor)
      if (s.hBand) {
        x.fillStyle = s.hBand;
        x.fillRect(0, y0 + fh * (s.hBandY || 0.9), W, fh * (s.hBandH || 0.1));
      }
      for (let bx = 0; bx < s.bays; bx++) {
        const X0 = bx * bw;
        const w = s.win || { x0: 0.25, x1: 0.75, y0: 0.2, y1: 0.8 };
        const wx0 = X0 + bw * w.x0,
          wx1 = X0 + bw * w.x1,
          wy0 = y0 + fh * (1 - w.y1),
          wy1 = y0 + fh * (1 - w.y0);
        if (s.spandrel) {
          x.fillStyle = s.spandrel;
          x.fillRect(wx0, y0, wx1 - wx0, fh);
        }
        if (s.pierShade) {
          x.fillStyle = "rgba(0,0,0," + s.pierShade + ")";
          x.fillRect(wx0 - 3, y0, 3, fh);
          x.fillStyle = "rgba(255,255,255," + s.pierShade * 0.6 + ")";
          x.fillRect(wx1, y0, 2, fh);
        }
        // frame
        x.fillStyle = s.frame || "#3a3a36";
        x.fillRect(wx0 - 2, wy0 - 2, wx1 - wx0 + 4, wy1 - wy0 + 4);
        const roll = r();
        let kind = "glass";
        if (roll < (s.broken || 0)) kind = "broken";
        else if (roll < (s.broken || 0) + (s.boarded || 0)) kind = "boarded";
        else if (roll < (s.broken || 0) + (s.boarded || 0) + lit) kind = "lit";
        if (kind === "glass" || kind === "lit") {
          const g = x.createLinearGradient(wx0, wy0, wx1, wy1);
          const gl = s.glass || "#2b3a3a";
          g.addColorStop(0, K.shadeHex(gl, 1.35 + r() * 0.3));
          g.addColorStop(0.55, gl);
          g.addColorStop(1, K.shadeHex(gl, 0.65));
          x.fillStyle = g;
          x.fillRect(wx0, wy0, wx1 - wx0, wy1 - wy0);
          if (kind === "lit") {
            x.fillStyle = s.litColor || "#ffcf80";
            x.globalAlpha = 0.85;
            x.fillRect(wx0, wy0, wx1 - wx0, wy1 - wy0);
            x.globalAlpha = 1;
            ex.fillStyle = s.litColor || "#ffcf80";
            ex.fillRect(wx0 / 2, wy0 / 2, (wx1 - wx0) / 2, (wy1 - wy0) / 2);
          }
          // mullions
          const mn = s.mullions === undefined ? 1 : s.mullions;
          x.fillStyle = s.frame || "#3a3a36";
          for (let m = 1; m <= mn; m++)
            x.fillRect(
              wx0 + ((wx1 - wx0) * m) / (mn + 1) - 1,
              wy0,
              2,
              wy1 - wy0,
            );
          if (s.transom !== false)
            x.fillRect(wx0, wy0 + (wy1 - wy0) * 0.38, wx1 - wx0, 2);
          // grime at sill
          x.fillStyle = "rgba(0,0,0,0.25)";
          x.fillRect(wx0, wy1 - 3, wx1 - wx0, 3);
        } else if (kind === "broken") {
          x.fillStyle = "#0b0c0b";
          x.fillRect(wx0, wy0, wx1 - wx0, wy1 - wy0);
          // jagged shards left in frame
          x.fillStyle = K.shadeHex(s.glass || "#2b3a3a", 1.2);
          x.beginPath();
          x.moveTo(wx0, wy0);
          x.lineTo(wx0 + (wx1 - wx0) * (0.2 + r() * 0.5), wy0);
          x.lineTo(wx0, wy0 + (wy1 - wy0) * (0.2 + r() * 0.4));
          x.fill();
          x.beginPath();
          x.moveTo(wx1, wy1);
          x.lineTo(wx1 - (wx1 - wx0) * (0.2 + r() * 0.4), wy1);
          x.lineTo(wx1, wy1 - (wy1 - wy0) * r() * 0.5);
          x.fill();
        } else {
          x.fillStyle = "#5a4630";
          x.fillRect(wx0, wy0, wx1 - wx0, wy1 - wy0);
          x.fillStyle = "rgba(0,0,0,0.35)";
          const n = 3 + Math.floor(r() * 3);
          for (let k = 0; k < n; k++)
            x.fillRect(
              wx0,
              wy0 + ((wy1 - wy0) * (k + 1)) / (n + 1),
              wx1 - wx0,
              2,
            );
        }
        // sill/lintel ornament
        if (s.sill) {
          x.fillStyle = s.sill;
          x.fillRect(wx0 - 4, wy1 + 1, wx1 - wx0 + 8, 4);
          if (s.lintel) x.fillRect(wx0 - 4, wy0 - 6, wx1 - wx0 + 8, 4);
        }
      }
      if (s.deco) s.deco(x, W, H, fy, y0, fh, bw, r);
    }
    // weathering
    K.streaks(x, W, H, 70, (s.seed || 1) + 11, 0.2);
    K.stains(x, W, H, 16, (s.seed || 1) + 12, 0.22);
    K.grain(x, W, H, 16, (s.seed || 1) + 13);
    const map = K.texFromCanvas(c);
    const def = {
      map,
      color: 0xffffff,
      tile: [s.bays * s.bayW, s.floors * s.floorH],
      rough: s.rough || 0.85,
      metal: s.metal || 0,
    };
    if (ec) {
      def.emissiveMap = K.texFromCanvas(ec);
      def.emissiveColor = 0xffffff;
      def.emissiveIntensity = 0.05;
      K.nightEmissive(key, 0.04, s.emissiveIntensity || 0.9);
    }
    K.defineMat(key, def);
    return def;
  };

  // ------------------------------------------------------------------
  // Atlases
  // ------------------------------------------------------------------
  K.initAtlases = function () {
    if (K.atlases.paint) return;
    const paint = (K.atlases.paint = new K.Atlas("paint", 2048, null, 2560)); // 2048×2560: round-1 signage filled 2048²
    const neon = (K.atlases.neon = new K.Atlas("neon", 2048, "#000", 1024));
    const ads = (K.atlases.ads = new K.Atlas("ads", 2048, "#222", 1536)); // 5×7 cells of 400×200: all 28 brands + a few alternates
    const flags = (K.atlases.flags = new K.Atlas("flags", 512, null, 512));
    K.defineMat("atlas_paint", {
      map: paint.tex,
      color: 0xffffff,
      rough: 0.8,
      alphaTest: 0.45,
      side: THREE.DoubleSide,
    });
    K.defineMat("atlas_paint_glow", {
      map: paint.tex,
      color: 0xffffff,
      rough: 0.6,
      alphaTest: 0.45,
      emissiveMap: paint.tex,
      emissiveColor: 0xffffff,
      emissiveIntensity: 0.55,
    });
    // Front-side only: a double-sided additive quad would superimpose a mirrored ghost of every sign
    // (two-sided signs use panel({both:true, off}) instead).
    K.defineMat("atlas_neon", {
      basic: true,
      map: neon.tex,
      color: 0xffffff,
      transparent: true,
      additive: true,
      fog: false,
      toneMapped: false,
      side: THREE.FrontSide,
      noShadow: true,
    });
    K.defineMat("atlas_ads", {
      map: ads.tex,
      color: 0xffffff,
      rough: 0.75,
      emissiveMap: ads.tex,
      emissiveColor: 0xffffff,
      emissiveIntensity: 0.15,
    });
    // flags: standard material with a wind-wave vertex shader
    const fm = new THREE.MeshStandardMaterial({
      map: flags.tex,
      vertexColors: true,
      side: THREE.DoubleSide,
      alphaTest: 0.5,
      roughness: 1,
    });
    fm.userData.uTime = { value: 0 };
    fm.onBeforeCompile = function (sh) {
      sh.uniforms.uTime = fm.userData.uTime;
      sh.vertexShader =
        "uniform float uTime;\n" +
        sh.vertexShader.replace(
          "#include <begin_vertex>",
          "#include <begin_vertex>\n" +
            "  float fT = fract(uv.x * 4.0);\n" +
            "  float ph = position.x * 0.21 + position.z * 0.17 + position.y * 0.05;\n" +
            "  transformed += normal * (sin(uTime * 3.1 + fT * 6.5 + ph) * 0.55 + sin(uTime * 7.3 + fT * 13.0 + ph) * 0.12) * fT * 0.55;",
        );
    };
    fm.customProgramCacheKey = () => "lma_flag_wave";
    K.defineMat("flags", { material: fm, noShadow: true });
    K.flagMat = fm;
    // sky-light shafts (additive, gradient along v)
    const sc = K.canvas(64, 256),
      sx = sc.getContext("2d");
    const sg = sx.createLinearGradient(0, 0, 0, 256);
    sg.addColorStop(0, "rgba(255,240,200,0.0)");
    sg.addColorStop(0.08, "rgba(255,240,200,0.55)");
    sg.addColorStop(0.5, "rgba(255,235,190,0.25)");
    sg.addColorStop(1, "rgba(255,230,180,0)");
    sx.fillStyle = sg;
    sx.fillRect(0, 0, 64, 256);
    const hg = sx.createLinearGradient(0, 0, 64, 0);
    hg.addColorStop(0, "rgba(0,0,0,1)");
    hg.addColorStop(0.2, "rgba(0,0,0,0)");
    hg.addColorStop(0.8, "rgba(0,0,0,0)");
    hg.addColorStop(1, "rgba(0,0,0,1)");
    sx.globalCompositeOperation = "destination-out";
    sx.fillStyle = hg;
    sx.fillRect(0, 0, 64, 256);
    K.defineMat("shaft", {
      basic: true,
      map: K.texFromCanvas(sc, { clamp: true }),
      color: 0x8a8068,
      transparent: true,
      additive: true,
      fog: true,
      side: THREE.DoubleSide,
      noShadow: true,
    });
  };

  /** Painted slot (opaque sign/relief/clock). draw(ctx,w,h). Returns uv rect. */
  K.paint = function (key, w, h, draw) {
    const at = K.atlases.paint;
    if (at.slots[key]) return at.slots[key].rect;
    const area = w * h,
      sc = area > 250000 ? 0.5 : area > 90000 ? 0.62 : area > 40000 ? 0.8 : 1;
    return at.alloc(
      key,
      w * sc,
      h * sc,
      draw
        ? (x) => {
            x.scale(sc, sc);
            draw(x, w, h);
          }
        : null,
    ).rect;
  };

  /** Neon text on black (additive). opts {font, size, color, glow, tube:boolean, border} */
  K.neon = function (key, text, color, opts) {
    opts = opts || {};
    const font = opts.font || 'bold 64px "Arial Black", Impact, sans-serif';
    const ctx0 = K.atlases.neon.ctx;
    ctx0.font = font;
    const tw = Math.ceil(ctx0.measureText(text).width);
    // long signs keep more resolution so the glyphs stay legible at street distance
    const sc = opts.sc || (tw > 520 ? 0.85 : NEON_SC);
    const h = opts.h || 110,
      w = Math.min(2040 / sc, opts.w || tw + 70);
    if (K.atlases.neon.slots[key]) return K.atlases.neon.slots[key].rect;
    return K.atlases.neon.alloc(key, w * sc, h * sc, (x0) => {
      x0.scale(sc, sc);
      const x = x0,
        W = w,
        H = h;
      x.fillStyle = "#000";
      x.fillRect(0, 0, W, H);
      x.font = font;
      x.textAlign = "center";
      x.textBaseline = "middle";
      const col = K.hex(color);
      if (opts.border) {
        x.strokeStyle = col;
        x.lineWidth = 4;
        x.shadowColor = col;
        x.shadowBlur = 12;
        x.strokeRect(8, 8, W - 16, H - 16);
      }
      // one soft halo pass, then crisp coloured glyphs, then a thin hot tube core traced along each stroke
      x.shadowColor = col;
      x.shadowBlur = opts.glow || 12;
      x.fillStyle = col;
      x.globalAlpha = 0.55;
      x.fillText(text, W / 2, H / 2 + 2);
      x.shadowBlur = 0;
      x.globalAlpha = 0.95;
      x.fillText(text, W / 2, H / 2 + 2);
      x.globalAlpha = 1;
      if (opts.tube !== false) {
        // hot white-ish core inside each glyph
        x.globalCompositeOperation = "lighter";
        x.fillStyle = "rgba(150,150,140,0.55)";
        x.fillText(text, W / 2, H / 2 + 2);
        x.globalCompositeOperation = "source-over";
      }
    }).rect;
  };
  const NEON_SC = 0.6;
  /** Generic neon drawing (shapes). */
  K.neonDraw = function (key, w, h, draw) {
    if (K.atlases.neon.slots[key]) return K.atlases.neon.slots[key].rect;
    return K.atlases.neon.alloc(key, w * NEON_SC, h * NEON_SC, (x) => {
      x.scale(NEON_SC, NEON_SC);
      x.fillStyle = "#000";
      x.fillRect(0, 0, w, h);
      draw(x, w, h);
    }).rect;
  };

  // ------------------------------------------------------------------
  // Brand billboards → 'ads' atlas (400×200 cells)
  // ------------------------------------------------------------------
  // Keys are the shared brand ids of G.LAYOUT.BRANDS (core layout / textures module); the art and names are original.
  const BRAND_ART = {
    fizzo_cola: {
      name: "FIZZO COLA",
      slogan: "THE TALL COOL ONE!",
      bg: "#b3261e",
      fg: "#fff4e0",
      ac: "#ffd23f",
      motif: "bottle",
    },
    fizzo_blue: {
      name: "FIZZO BLUE",
      slogan: "THE ELECTRIC TASTE OF TOMORROW",
      bg: "#12305a",
      fg: "#7fe7ff",
      ac: "#3cc9ff",
      motif: "bottle_glow",
    },
    long_winter: {
      name: "CIVIL DEFENSE",
      slogan: "KNOW YOUR SHELTER · KNOW YOUR NEIGHBOR",
      bg: "#e8e4d8",
      fg: "#1a2a4a",
      ac: "#c81e1e",
      motif: "cd",
    },
    prairie_root_beer: {
      name: "Prairie Root Beer",
      slogan: "Old-time flavor, poured cold.",
      bg: "#e98a2c",
      fg: "#4a1d0e",
      ac: "#ffe08a",
      motif: "sun",
    },
    liberty_jetliner: {
      name: "LIBERTY JETLINER",
      slogan: "Fly the flag. Fly Liberty.",
      bg: "#1c2f5c",
      fg: "#f2eee2",
      ac: "#d23a2a",
      motif: "plane",
    },
    first_journal: {
      name: "THE FIRST JOURNAL",
      slogan: "You heard it here first.",
      bg: "#ece6d6",
      fg: "#1e3a66",
      ac: "#a01e1e",
      motif: "news",
    },
    pizza_galaxy: {
      name: "PIZZA GALAXY",
      slogan: "Out of this world. Into your mouth in 30 minutes.",
      bg: "#20103a",
      fg: "#ffcf40",
      ac: "#e8452c",
      motif: "pizza",
    },
    empire_brew: {
      name: "EMPIRE BREW HOUSE",
      slogan: "Brewed in Brooklyn. Poured everywhere.",
      bg: "#1e4a34",
      fg: "#f0e0b0",
      ac: "#e8b030",
      motif: "beer",
    },
    silver_torch: {
      name: "SILVER TORCH",
      slogan: "Light up like the lady in the harbor.",
      bg: "#26323e",
      fg: "#e8eaee",
      ac: "#ffcf60",
      motif: "torch",
    },
    burger_brigade: {
      name: "BURGER BRIGADE",
      slogan: "Fifteen cents. Fifteen seconds.",
      bg: "#c8281e",
      fg: "#fff0c8",
      ac: "#ffd23f",
      motif: "burger",
    },
    excalibur_gardens: {
      name: "EXCALIBUR GARDENS",
      slogan: "COMING SOON · Summer 1967. Your kingdom awaits.",
      bg: "#3a2a6a",
      fg: "#f0d070",
      ac: "#8ad0a0",
      motif: "castle",
    },
    junior_rocketeer: {
      name: "JUNIOR ROCKETEER CO.",
      slogan: "Real science. Real rockets.",
      bg: "#e8e4d8",
      fg: "#c8281e",
      ac: "#1f4f8a",
      motif: "rocket",
    },
    miracle_mane: {
      name: "DR. THATCHER'S MIRACLE MANE",
      slogan: "Grows hair on anything. Anything.",
      bg: "#2a4a3a",
      fg: "#f0e0b0",
      ac: "#c8a040",
      motif: "tonic",
    },
    big_apple_cab: {
      name: "BIG APPLE MOTOR CAB",
      slogan: "Just get in already!",
      bg: "#e0b020",
      fg: "#151515",
      ac: "#c8201a",
      motif: "apple",
    },
    mama_marinara: {
      name: "MAMA MARINARA'S",
      slogan: "Just add water. Mama will never know.",
      bg: "#c42a1e",
      fg: "#f6ead0",
      ac: "#f6d860",
      motif: "can",
    },
    hi_octane: {
      name: "HI-OCTANE HARRY'S",
      slogan: "Full service. Full tank. Full speed ahead.",
      bg: "#f0e6d0",
      fg: "#c01e1e",
      ac: "#1c1c1c",
      motif: "pump",
    },
    vigil: {
      name: "VIGIL DEFENSE",
      slogan: "Protecting America Always",
      bg: "#13263a",
      fg: "#cfeefa",
      ac: "#e8a040",
      motif: "goggles",
    },
    freedom_flakes: {
      name: "FREEDOM FLAKES",
      slogan: "The breakfast of a free nation.",
      bg: "#1e3f86",
      fg: "#f6eedc",
      ac: "#f0c040",
      motif: "bowl",
    },
    chocolate_zeppelin: {
      name: "CHOCOLATE ZEPPELIN",
      slogan: "Lighter than air. Sweeter than pie.",
      bg: "#7ab0d8",
      fg: "#3a1e10",
      ac: "#5a3420",
      motif: "zeppelin",
    },
    golden_plain: {
      name: "GOLDEN PLAIN JERKY",
      slogan: "Tough enough for any trail.",
      bg: "#d8a838",
      fg: "#4a2410",
      ac: "#fff0b0",
      motif: "plain",
    },
    homeguard: {
      name: "HOMEGUARD",
      slogan: "Defending the American kitchen.",
      bg: "#e8e4d8",
      fg: "#1a3a6a",
      ac: "#c42a22",
      motif: "can",
    },
    lonly_tv: {
      name: "LONLY",
      slogan: "The best company in the house.",
      bg: "#2a2a2a",
      fg: "#ffcc33",
      ac: "#e8e8e8",
      motif: "tv",
    },
    eagle_motors: {
      name: "EAGLE MOTORS",
      slogan: "Freedom to Explore",
      bg: "#2a5a7a",
      fg: "#f0e8d0",
      ac: "#ffd23f",
      motif: "car",
    },
    super_sergeant: {
      name: "SUPER SERGEANT",
      slogan: "America's finest fighting man!",
      bg: "#f0d040",
      fg: "#b8261c",
      ac: "#5a6234",
      motif: "chevrons",
    },
    american_automaton: {
      name: "AMERICAN AUTOMATON CO.",
      slogan: "Built in America, to serve America.",
      bg: "#d8d0b8",
      fg: "#1f3f6a",
      ac: "#a0281e",
      motif: "robot",
    },
    forever_franks: {
      name: "FOREVER FRANKS",
      slogan: "So good they'll outlive you!",
      bg: "#f0e4c4",
      fg: "#b01a14",
      ac: "#8a5a10",
      motif: "franks",
    },
    sky_patrol: {
      name: "SKY PATROL",
      slogan: "Defend The Skyline! Now At Arcades",
      bg: "#0c0c14",
      fg: "#ffb347",
      ac: "#ff3c3c",
      motif: "missile",
    },
    worlds_fair: {
      name: "WORLD'S FAIR '64",
      slogan: "Peace Through Understanding",
      bg: "#16406e",
      fg: "#f4f0e0",
      ac: "#f0a830",
      motif: "star",
    },
  };
  K.BRAND_ART = BRAND_ART;

  function drawMotif(x, m, cx, cy, s, a) {
    x.save();
    x.translate(cx, cy);
    x.scale(s / 100, s / 100);
    x.fillStyle = a.ac;
    x.strokeStyle = a.fg;
    x.lineWidth = 6;
    const circle = (px, py, r) => {
      x.beginPath();
      x.arc(px, py, r, 0, Math.PI * 2);
    };
    switch (m) {
      case "bottle":
      case "bottle_glow": // tall, straight-sided ribbed bottle with a long neck
        if (m === "bottle_glow") {
          x.shadowColor = a.ac;
          x.shadowBlur = 40;
        }
        x.fillStyle = m === "bottle_glow" ? a.ac : "#3a1a14";
        x.beginPath();
        x.moveTo(-10, -96);
        x.lineTo(10, -96);
        x.lineTo(11, -52);
        x.quadraticCurveTo(26, -40, 26, -20);
        x.lineTo(26, 92);
        x.lineTo(-26, 92);
        x.lineTo(-26, -20);
        x.quadraticCurveTo(-26, -40, -11, -52);
        x.closePath();
        x.fill();
        x.shadowBlur = 0;
        x.strokeStyle = "rgba(255,255,255,0.35)";
        x.lineWidth = 3;
        for (let i = -2; i <= 2; i++) {
          x.beginPath();
          x.moveTo(i * 9, -14);
          x.lineTo(i * 9, 86);
          x.stroke();
        }
        x.fillStyle = a.fg;
        x.fillRect(-26, 18, 52, 22);
        x.fillStyle = "#c8c8c8";
        x.fillRect(-11, -102, 22, 8);
        break;
      case "cd": // civil defense triangle in a ring
        x.strokeStyle = a.fg;
        x.lineWidth = 10;
        circle(0, 0, 80);
        x.stroke();
        x.fillStyle = a.ac;
        x.beginPath();
        x.moveTo(0, -64);
        x.lineTo(56, 34);
        x.lineTo(-56, 34);
        x.closePath();
        x.fill();
        x.fillStyle = "#fff";
        x.font = 'bold 34px "Arial Black", sans-serif';
        x.textAlign = "center";
        x.textBaseline = "middle";
        x.fillText("CD", 0, 6);
        break;
      case "teletype":
        x.fillStyle = "#5a5248";
        x.fillRect(-70, -10, 140, 70);
        x.fillStyle = "#2a2620";
        for (let i = 0; i < 4; i++)
          for (let j = 0; j < 9; j++)
            x.fillRect(-60 + j * 14, 2 + i * 13, 10, 9);
        x.fillStyle = "#f0e8d0";
        x.fillRect(-45, -90, 90, 82);
        x.fillStyle = a.fg;
        for (let i = 0; i < 6; i++)
          x.fillRect(-36, -80 + i * 12, 30 + ((i * 23) % 40), 4);
        break;
      case "bolt":
        x.fillStyle = a.ac;
        x.beginPath();
        x.moveTo(15, -95);
        x.lineTo(-40, 10);
        x.lineTo(-2, 10);
        x.lineTo(-20, 95);
        x.lineTo(45, -15);
        x.lineTo(6, -15);
        x.closePath();
        x.fill();
        break;
      case "plane":
        x.fillStyle = a.fg;
        x.fillRect(-90, -8, 180, 16);
        x.beginPath();
        x.moveTo(-20, 0);
        x.lineTo(20, -70);
        x.lineTo(34, -70);
        x.lineTo(20, 0);
        x.lineTo(34, 70);
        x.lineTo(20, 70);
        x.closePath();
        x.fill();
        x.beginPath();
        x.moveTo(-90, 0);
        x.lineTo(-100, -30);
        x.lineTo(-84, -30);
        x.lineTo(-70, 0);
        x.fill();
        break;
      case "clock":
        x.fillStyle = a.ac;
        circle(0, 0, 70);
        x.fill();
        x.fillStyle = a.bg;
        circle(0, 0, 58);
        x.fill();
        x.strokeStyle = a.fg;
        x.lineWidth = 6;
        x.beginPath();
        x.moveTo(0, 0);
        x.lineTo(0, -44);
        x.moveTo(0, 0);
        x.lineTo(30, 10);
        x.stroke();
        x.fillStyle = a.ac;
        x.fillRect(-18, -100, 36, 30);
        x.fillRect(-18, 70, 36, 30);
        break;
      case "wheel":
        x.strokeStyle = a.fg;
        x.lineWidth = 6;
        circle(0, -10, 78);
        x.stroke();
        for (let i = 0; i < 8; i++) {
          const an = (i * Math.PI) / 4;
          x.beginPath();
          x.moveTo(0, -10);
          x.lineTo(Math.cos(an) * 78, -10 + Math.sin(an) * 78);
          x.stroke();
          x.fillStyle = a.ac;
          circle(Math.cos(an) * 78, -10 + Math.sin(an) * 78, 9);
          x.fill();
        }
        x.beginPath();
        x.moveTo(0, -10);
        x.lineTo(-40, 95);
        x.moveTo(0, -10);
        x.lineTo(40, 95);
        x.stroke();
        break;
      case "sun":
        for (let i = 0; i < 12; i++) {
          x.save();
          x.rotate((i * Math.PI) / 6);
          x.fillStyle = a.ac;
          x.fillRect(-6, -95, 12, 40);
          x.restore();
        }
        x.fillStyle = a.ac;
        circle(0, 0, 50);
        x.fill();
        break;
      case "robot": // boxy domestic robot: square head with a visor slot, barrel torso, two arms, treads
        x.fillStyle = "#9aa0a0";
        x.fillRect(-30, -80, 60, 40);
        x.fillStyle = a.ac;
        x.fillRect(-22, -66, 44, 9);
        x.fillStyle = "#9aa0a0";
        x.fillRect(-40, -34, 80, 80);
        x.fillStyle = "#5a6060";
        x.fillRect(-46, 50, 92, 22);
        x.strokeStyle = "#9aa0a0";
        x.lineWidth = 9;
        x.beginPath();
        x.moveTo(-40, -20);
        x.lineTo(-74, 20);
        x.lineTo(-64, 46);
        x.moveTo(40, -20);
        x.lineTo(74, 20);
        x.lineTo(64, 46);
        x.stroke();
        break;
      case "trident":
        x.fillStyle = a.fg;
        x.fillRect(-6, -60, 12, 150);
        x.fillRect(-50, -30, 100, 10);
        for (const px of [-50, 0, 50]) {
          x.beginPath();
          x.moveTo(px - 10, -30);
          x.lineTo(px, -90);
          x.lineTo(px + 10, -30);
          x.fill();
        }
        break;
      case "bowl":
        x.fillStyle = a.fg;
        x.beginPath();
        x.arc(0, 10, 70, 0, Math.PI);
        x.fill();
        for (let i = 0; i < 9; i++) {
          x.fillStyle = i % 2 ? "#fff" : a.ac;
          circle(-50 + i * 12, 0 - (i % 3) * 8, 12);
          x.fill();
        }
        break;
      case "cake":
        x.fillStyle = "#f5e0a0";
        x.fillRect(-60, -10, 120, 50);
        x.fillStyle = "#ff8ab0";
        x.fillRect(-60, -24, 120, 18);
        x.fillStyle = "#c01e3a";
        circle(0, -34, 12);
        x.fill();
        break;
      case "tv":
        x.fillStyle = "#5a3a22";
        x.fillRect(-70, -60, 140, 110);
        x.fillStyle = "#9adfc8";
        x.fillRect(-55, -48, 90, 80);
        x.strokeStyle = "#333";
        x.lineWidth = 4;
        x.beginPath();
        x.moveTo(-20, -60);
        x.lineTo(-45, -95);
        x.moveTo(20, -60);
        x.lineTo(45, -95);
        x.stroke();
        x.fillStyle = a.fg;
        x.beginPath();
        x.moveTo(-30, -95);
        x.lineTo(-15, -120);
        x.lineTo(0, -100);
        x.lineTo(15, -120);
        x.lineTo(30, -95);
        x.fill();
        break;
      case "box":
      case "can":
        x.fillStyle = a.ac;
        x.fillRect(-45, -70, 90, 140);
        x.fillStyle = a.fg;
        x.fillRect(-45, -20, 90, 40);
        if (m === "can") {
          x.fillStyle = "#bbb";
          x.fillRect(-45, -76, 90, 8);
          x.fillRect(-45, 68, 90, 8);
        }
        break;
      case "axe":
        x.fillStyle = "#8a6a4a";
        x.fillRect(-5, -80, 10, 170);
        x.fillStyle = "#c8c8c8";
        x.beginPath();
        x.moveTo(5, -70);
        x.quadraticCurveTo(70, -60, 60, 0);
        x.quadraticCurveTo(30, -20, 5, -20);
        x.fill();
        break;
      case "car":
        x.fillStyle = a.fg;
        x.beginPath();
        x.moveTo(-90, 30);
        x.quadraticCurveTo(-85, -10, -40, -15);
        x.quadraticCurveTo(-20, -55, 30, -50);
        x.quadraticCurveTo(60, -20, 90, -10);
        x.lineTo(95, 30);
        x.closePath();
        x.fill();
        x.fillStyle = "#222";
        circle(-50, 32, 18);
        x.fill();
        circle(55, 32, 18);
        x.fill();
        x.fillStyle = a.ac;
        x.beginPath();
        x.moveTo(95, -8);
        x.lineTo(110, -40);
        x.lineTo(100, 0);
        x.fill();
        break;
      case "inhaler":
        x.fillStyle = a.ac;
        x.fillRect(-25, -60, 50, 90);
        x.fillStyle = a.fg;
        x.fillRect(-15, 30, 30, 50);
        break;
      case "target":
        for (let i = 4; i > 0; i--) {
          x.fillStyle = i % 2 ? a.fg : a.bg;
          circle(0, 0, i * 22);
          x.fill();
        }
        break;
      case "star":
        x.fillStyle = a.fg;
        x.beginPath();
        for (let i = 0; i < 10; i++) {
          const rr = i % 2 ? 38 : 90,
            an = -Math.PI / 2 + (i * Math.PI) / 5;
          x.lineTo(Math.cos(an) * rr, Math.sin(an) * rr);
        }
        x.fill();
        break;
      case "missile":
        x.strokeStyle = a.fg;
        x.lineWidth = 4;
        for (let i = 0; i < 4; i++) {
          x.beginPath();
          x.moveTo(-80 + i * 50, -90);
          x.lineTo(-40 + i * 30, 60);
          x.stroke();
        }
        x.fillStyle = a.ac;
        circle(-20, 60, 22);
        x.fill();
        break;
      case "pill":
        x.fillStyle = a.fg;
        x.beginPath();
        x.ellipse(0, 0, 70, 30, -0.5, 0, Math.PI * 2);
        x.fill();
        x.fillStyle = "#fff";
        x.fillRect(-4, -35, 8, 70);
        break;
      case "news": // a folded newspaper: masthead, headline bars, columns
        x.fillStyle = "#f4f0e4";
        x.save();
        x.rotate(-0.12);
        x.fillRect(-70, -85, 140, 170);
        x.fillStyle = a.fg;
        x.fillRect(-60, -75, 120, 18);
        x.fillStyle = a.ac;
        x.fillRect(-60, -50, 120, 12);
        x.fillStyle = "#555";
        for (let c2 = 0; c2 < 3; c2++)
          for (let i = 0; i < 9; i++)
            x.fillRect(-60 + c2 * 42, -28 + i * 11, 34, 4);
        x.restore();
        break;
      case "pizza": // a slice with a ringed planet behind it
        x.fillStyle = a.ac;
        circle(30, -40, 40);
        x.fill();
        x.strokeStyle = a.fg;
        x.lineWidth = 6;
        x.beginPath();
        x.ellipse(30, -40, 70, 16, -0.3, 0, Math.PI * 2);
        x.stroke();
        x.fillStyle = "#f0c060";
        x.beginPath();
        x.moveTo(-70, -10);
        x.lineTo(40, 90);
        x.quadraticCurveTo(-50, 110, -80, 10);
        x.closePath();
        x.fill();
        x.fillStyle = "#e8b030";
        x.beginPath();
        x.moveTo(-70, -10);
        x.lineTo(40, 90);
        x.lineTo(32, 98);
        x.lineTo(-78, -2);
        x.fill();
        x.fillStyle = "#c0281e";
        for (const [px, py] of [
          [-40, 40],
          [-10, 66],
          [-58, 66],
        ]) {
          circle(px, py, 11);
          x.fill();
        }
        break;
      case "beer": // a foaming glass stein
        x.fillStyle = "#e8a828";
        x.fillRect(-40, -50, 80, 130);
        x.fillStyle = "rgba(255,255,255,0.3)";
        x.fillRect(-30, -40, 10, 110);
        x.fillStyle = "#fff8e8";
        for (const [px, py, rr] of [
          [-30, -56, 18],
          [-6, -64, 22],
          [22, -58, 18],
          [36, -50, 12],
        ]) {
          circle(px, py, rr);
          x.fill();
        }
        x.strokeStyle = "#e8a828";
        x.lineWidth = 12;
        x.beginPath();
        x.arc(46, 14, 26, -1.3, 1.3);
        x.stroke();
        break;
      case "torch": // a raised torch: silver handle, gold flame
        x.fillStyle = "#c8ccd0";
        x.beginPath();
        x.moveTo(-14, -20);
        x.lineTo(14, -20);
        x.lineTo(8, 90);
        x.lineTo(-8, 90);
        x.closePath();
        x.fill();
        x.fillStyle = "#9aa0a8";
        x.fillRect(-26, -34, 52, 16);
        x.fillStyle = a.ac;
        x.beginPath();
        x.moveTo(0, -100);
        x.quadraticCurveTo(34, -64, 20, -36);
        x.lineTo(-20, -36);
        x.quadraticCurveTo(-34, -64, 0, -100);
        x.fill();
        x.fillStyle = "#fff4c0";
        x.beginPath();
        x.moveTo(0, -76);
        x.quadraticCurveTo(14, -56, 8, -40);
        x.lineTo(-8, -40);
        x.quadraticCurveTo(-14, -56, 0, -76);
        x.fill();
        break;
      case "burger":
        x.fillStyle = "#e0a048";
        x.beginPath();
        x.ellipse(0, -30, 80, 44, 0, Math.PI, 0);
        x.fill();
        x.fillStyle = "#fff4d0";
        for (let i = 0; i < 7; i++) {
          x.beginPath();
          x.ellipse(
            -48 + i * 16,
            -50 + (i % 2) * 10,
            3,
            5,
            0.4,
            0,
            Math.PI * 2,
          );
          x.fill();
        }
        x.fillStyle = "#4ab040";
        x.fillRect(-84, -30, 168, 10);
        x.fillStyle = "#5a2a14";
        x.fillRect(-80, -20, 160, 26);
        x.fillStyle = "#ffd23f";
        x.beginPath();
        x.moveTo(-80, -22);
        x.lineTo(80, -22);
        x.lineTo(56, -8);
        x.lineTo(30, -16);
        x.lineTo(0, -4);
        x.lineTo(-40, -16);
        x.closePath();
        x.fill();
        x.fillStyle = "#e0a048";
        x.beginPath();
        x.ellipse(0, 12, 80, 20, 0, 0, Math.PI);
        x.fill();
        x.fillRect(-80, 6, 160, 8);
        break;
      case "castle": // turreted castle gate under a pennant
        x.fillStyle = a.fg;
        x.fillRect(-70, -30, 140, 110);
        for (const px of [-80, 50]) {
          x.fillRect(px, -70, 30, 150);
          for (let i = 0; i < 3; i++) x.fillRect(px + i * 11, -82, 8, 12);
          x.beginPath();
          x.moveTo(px - 4, -70);
          x.lineTo(px + 15, -110);
          x.lineTo(px + 34, -70);
          x.fill();
        }
        for (let i = 0; i < 6; i++) x.fillRect(-70 + i * 26, -42, 14, 12);
        x.fillStyle = a.bg;
        x.beginPath();
        x.moveTo(-24, 80);
        x.lineTo(-24, 20);
        x.arc(0, 20, 24, Math.PI, 0);
        x.lineTo(24, 80);
        x.fill();
        x.fillStyle = a.ac;
        x.beginPath();
        x.moveTo(-65, -110);
        x.lineTo(-30, -100);
        x.lineTo(-65, -90);
        x.fill();
        break;
      case "rocket": // a toy rocket on its launch rail with an exhaust plume
        x.save();
        x.rotate(0.35);
        x.fillStyle = "#f4f0e4";
        x.beginPath();
        x.moveTo(0, -100);
        x.quadraticCurveTo(26, -60, 22, 40);
        x.lineTo(-22, 40);
        x.quadraticCurveTo(-26, -60, 0, -100);
        x.fill();
        x.fillStyle = a.fg;
        x.beginPath();
        x.moveTo(0, -100);
        x.quadraticCurveTo(14, -78, 16, -62);
        x.lineTo(-16, -62);
        x.quadraticCurveTo(-14, -78, 0, -100);
        x.fill();
        x.fillStyle = a.ac;
        circle(0, -30, 10);
        x.fill();
        x.fillStyle = a.fg;
        for (const sg of [-1, 1]) {
          x.beginPath();
          x.moveTo(sg * 20, 10);
          x.lineTo(sg * 46, 56);
          x.lineTo(sg * 20, 40);
          x.fill();
        }
        x.fillStyle = "#ffb040";
        x.beginPath();
        x.moveTo(-14, 42);
        x.lineTo(0, 100);
        x.lineTo(14, 42);
        x.fill();
        x.restore();
        break;
      case "tonic": // a tall apothecary bottle with a label and stopper
        x.fillStyle = "#5a2a14";
        x.beginPath();
        x.moveTo(-10, -80);
        x.lineTo(10, -80);
        x.lineTo(10, -50);
        x.lineTo(40, -26);
        x.lineTo(40, 90);
        x.lineTo(-40, 90);
        x.lineTo(-40, -26);
        x.lineTo(-10, -50);
        x.closePath();
        x.fill();
        x.fillStyle = a.ac;
        x.fillRect(-14, -98, 28, 20);
        x.fillStyle = "#f4ecd8";
        x.fillRect(-34, -4, 68, 64);
        x.fillStyle = a.bg;
        x.font = "bold 22px Georgia, serif";
        x.textAlign = "center";
        x.textBaseline = "middle";
        x.fillText("Dr.T", 0, 18);
        x.fillRect(-26, 38, 52, 4);
        break;
      case "apple":
        x.fillStyle = "#f4ecd8";
        circle(0, 0, 90);
        x.fill();
        x.strokeStyle = a.fg;
        x.lineWidth = 8;
        x.stroke();
        x.fillStyle = a.ac;
        x.beginPath();
        x.moveTo(0, -30);
        x.bezierCurveTo(34, -60, 72, -18, 54, 26);
        x.bezierCurveTo(40, 64, 12, 64, 0, 54);
        x.bezierCurveTo(-12, 64, -40, 64, -54, 26);
        x.bezierCurveTo(-72, -18, -34, -60, 0, -30);
        x.fill();
        x.strokeStyle = "#4a2a10";
        x.lineWidth = 6;
        x.beginPath();
        x.moveTo(0, -30);
        x.lineTo(6, -58);
        x.stroke();
        x.fillStyle = "#3a8a2a";
        x.beginPath();
        x.ellipse(22, -52, 18, 8, -0.5, 0, Math.PI * 2);
        x.fill();
        break;
      case "pump": // a round-shouldered gas pump with a globe on top
        x.fillStyle = a.fg;
        x.fillRect(-36, -40, 72, 130);
        x.beginPath();
        x.ellipse(0, -40, 36, 14, 0, Math.PI, 0);
        x.fill();
        x.fillStyle = "#f4f0e4";
        circle(0, -76, 24);
        x.fill();
        x.fillStyle = a.fg;
        x.font = "bold 22px Georgia, serif";
        x.textAlign = "center";
        x.textBaseline = "middle";
        x.fillText("H", 0, -75);
        x.fillStyle = "#f4f0e4";
        x.fillRect(-24, -24, 48, 34);
        x.fillStyle = a.ac;
        for (let i = 0; i < 3; i++) x.fillRect(-18, -18 + i * 10, 36, 4);
        x.strokeStyle = a.ac;
        x.lineWidth = 6;
        x.beginPath();
        x.moveTo(36, 10);
        x.quadraticCurveTo(70, 20, 60, 70);
        x.stroke();
        break;
      case "goggles": // a pair of field goggles with amber lenses on a strap
        x.strokeStyle = "#3a4a5a";
        x.lineWidth = 12;
        x.beginPath();
        x.moveTo(-100, -4);
        x.lineTo(100, -4);
        x.stroke();
        for (const sg of [-1, 1]) {
          x.fillStyle = "#5a6a78";
          circle(sg * 42, 0, 38);
          x.fill();
          x.fillStyle = a.ac;
          circle(sg * 42, 0, 26);
          x.fill();
          x.fillStyle = "rgba(255,255,255,0.4)";
          circle(sg * 42 - 8, -8, 8);
          x.fill();
        }
        x.fillStyle = "#5a6a78";
        x.fillRect(-10, -8, 20, 14);
        break;
      case "zeppelin": // a chocolate airship with a cream-filled stripe
        x.fillStyle = a.ac;
        x.beginPath();
        x.ellipse(0, -10, 96, 42, 0, 0, Math.PI * 2);
        x.fill();
        x.fillStyle = "#fff4e0";
        x.fillRect(-90, -14, 180, 10);
        x.fillStyle = a.ac;
        for (const sg of [-1, 1]) {
          x.beginPath();
          x.moveTo(78, sg * 6 - 10);
          x.lineTo(104, sg * 40 - 10);
          x.lineTo(90, sg * 4 - 10);
          x.fill();
        }
        x.fillStyle = "#3a2418";
        x.fillRect(-24, 32, 48, 16);
        x.strokeStyle = "#3a2418";
        x.lineWidth = 3;
        x.beginPath();
        x.moveTo(-20, 32);
        x.lineTo(-30, 24);
        x.moveTo(20, 32);
        x.lineTo(30, 24);
        x.stroke();
        break;
      case "plain": // the sun on the horizon over the open plain, a winding trail
        for (let i = 0; i < 9; i++) {
          x.save();
          x.rotate(-Math.PI + ((i + 0.5) * Math.PI) / 9);
          x.fillStyle = a.ac;
          x.fillRect(-5, -100, 10, 36);
          x.restore();
        }
        x.fillStyle = a.ac;
        x.beginPath();
        x.arc(0, 0, 54, Math.PI, 0);
        x.fill();
        x.fillStyle = a.fg;
        x.fillRect(-100, 0, 200, 8);
        x.fillStyle = "rgba(74,36,16,0.45)";
        x.beginPath();
        x.moveTo(-8, 8);
        x.quadraticCurveTo(40, 40, -20, 70);
        x.lineTo(20, 96);
        x.lineTo(-50, 96);
        x.quadraticCurveTo(10, 50, -18, 8);
        x.fill();
        break;
      case "chevrons": // sergeant's stripes on an olive sleeve patch
        x.fillStyle = a.ac;
        x.fillRect(-70, -84, 140, 168);
        x.strokeStyle = a.fg;
        x.lineWidth = 5;
        x.strokeRect(-64, -78, 128, 156);
        x.strokeStyle = a.bg;
        x.lineWidth = 14;
        x.lineJoin = "miter";
        for (let i = 0; i < 3; i++) {
          const y = -46 + i * 30;
          x.beginPath();
          x.moveTo(-54, y + 30);
          x.lineTo(0, y);
          x.lineTo(54, y + 30);
          x.stroke();
        }
        break;
      case "franks": // the Forever Franks mascot: a frank in a top hat holding an hourglass
        x.scale(0.78, 0.78);
        x.translate(-12, 8);
        x.fillStyle = "#b8482c";
        x.beginPath();
        x.moveTo(-26, -40);
        x.arc(0, -40, 26, Math.PI, 0);
        x.lineTo(26, 50);
        x.arc(0, 50, 26, 0, Math.PI);
        x.closePath();
        x.fill();
        x.fillStyle = "#fff";
        circle(-10, -26, 8);
        x.fill();
        circle(10, -26, 8);
        x.fill();
        x.fillStyle = "#111";
        circle(-9, -25, 4);
        x.fill();
        circle(11, -25, 4);
        x.fill();
        x.strokeStyle = "#3a0e08";
        x.lineWidth = 4;
        x.beginPath();
        x.arc(0, -10, 14, 0.2, Math.PI - 0.2);
        x.stroke();
        x.fillStyle = "#151515";
        x.fillRect(-20, -106, 40, 44);
        x.beginPath();
        x.ellipse(0, -62, 36, 8, 0, 0, Math.PI * 2);
        x.fill();
        x.fillStyle = "#c8281e";
        x.fillRect(-20, -76, 40, 7);
        x.strokeStyle = "#2a1a10";
        x.lineWidth = 6;
        x.beginPath();
        x.moveTo(24, 10);
        x.lineTo(54, -4);
        x.stroke();
        x.fillStyle = "#7a4a22";
        x.fillRect(48, -40, 30, 6);
        x.fillRect(48, 14, 30, 6);
        x.fillStyle = "rgba(220,235,240,0.95)";
        x.beginPath();
        x.moveTo(52, -34);
        x.lineTo(74, -34);
        x.lineTo(66, -10);
        x.lineTo(74, 14);
        x.lineTo(52, 14);
        x.lineTo(60, -10);
        x.closePath();
        x.fill();
        x.fillStyle = a.ac;
        x.beginPath();
        x.moveTo(53, 14);
        x.lineTo(73, 14);
        x.lineTo(63, 0);
        x.fill();
        break;
      default:
        circle(0, 0, 60);
        x.fill();
    }
    x.restore();
  }

  /** Original fallback billboard art for a brand (original names and designs). */
  K.drawBrand = function (x, W, H, brand, variant) {
    const a = BRAND_ART[brand] || {
      name: brand.toUpperCase().replace(/_/g, " "),
      slogan: "",
      bg: "#444",
      fg: "#eee",
      ac: "#c33",
      motif: "star",
    };
    const r = K.rng(brand + ":" + (variant || 0));
    // background with sunburst
    x.fillStyle = a.bg;
    x.fillRect(0, 0, W, H);
    x.save();
    x.translate(W * 0.78, H * 0.55);
    x.globalAlpha = 0.14;
    x.fillStyle = a.ac;
    for (let i = 0; i < 16; i += 2) {
      x.beginPath();
      x.moveTo(0, 0);
      x.arc(0, 0, W, (i * Math.PI) / 8, ((i + 1) * Math.PI) / 8);
      x.fill();
    }
    x.restore();
    x.globalAlpha = 1;
    // motif on right
    drawMotif(x, a.motif, W * 0.8, H * 0.52, H * 0.75, a);
    // text
    x.fillStyle = a.fg;
    x.textAlign = "left";
    x.textBaseline = "alphabetic";
    const TW = W * 0.62; // text column left of the motif
    const nameSize = Math.min(
      H * 0.3,
      (TW / Math.max(4, a.name.length)) * 1.75,
    );
    x.font =
      "bold " + Math.round(nameSize) + 'px "Arial Black", Impact, sans-serif';
    x.shadowColor = "rgba(0,0,0,0.5)";
    x.shadowOffsetX = 3;
    x.shadowOffsetY = 3;
    x.fillText(a.name, W * 0.05, H * 0.45, TW);
    x.shadowOffsetX = 0;
    x.shadowOffsetY = 0;
    // slogan: one line, or two balanced lines when it would be squeezed
    let ss = H * 0.1;
    x.font = "italic bold " + Math.round(ss) + "px Georgia, serif";
    x.fillStyle = a.ac;
    let lines = [a.slogan];
    if (
      x.measureText(a.slogan).width > TW * 1.15 &&
      a.slogan.indexOf(" ") > 0
    ) {
      const words = a.slogan.split(" ");
      let best = 1,
        bestD = 1e9;
      for (let i = 1; i < words.length; i++) {
        const d = Math.abs(
          x.measureText(words.slice(0, i).join(" ")).width -
            x.measureText(words.slice(i).join(" ")).width,
        );
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      }
      lines = [words.slice(0, best).join(" "), words.slice(best).join(" ")];
      ss = H * 0.085;
      x.font = "italic bold " + Math.round(ss) + "px Georgia, serif";
    }
    lines.forEach((l, i) =>
      x.fillText(l, W * 0.05, H * 0.64 + i * ss * 1.15, TW),
    );
    x.fillStyle = a.fg;
    x.fillRect(W * 0.05, H * 0.7 + (lines.length - 1) * ss * 1.15, W * 0.5, 4);
    // weathering: fade, peel, stains, bullet holes
    x.fillStyle = "rgba(210,200,170," + (0.1 + r() * 0.15) + ")";
    x.fillRect(0, 0, W, H);
    for (let i = 0; i < 5; i++) {
      x.fillStyle = "rgba(120,110,90," + (0.3 + r() * 0.4) + ")";
      const px = r() * W,
        py = r() * H,
        pw = 20 + r() * 80,
        ph = 10 + r() * 50;
      x.beginPath();
      x.moveTo(px, py);
      x.lineTo(px + pw, py + r() * 10);
      x.lineTo(px + pw * 0.8, py + ph);
      x.lineTo(px + r() * 10, py + ph * 0.7);
      x.fill();
    }
    K.streaks(x, W, H, 30, U.hashStr(brand) % 997, 0.3);
    K.stains(x, W, H, 8, U.hashStr(brand) % 991, 0.35);
    x.fillStyle = "#111";
    for (let i = 0; i < 8; i++) {
      x.beginPath();
      x.arc(r() * W, r() * H, 1.5 + r() * 2, 0, 7);
      x.fill();
    }
  };

  /** Billboard slot for brand (+variant). Uses the textures module's art when present. */
  K.ad = function (brand, variant) {
    variant = variant || 0;
    const at = K.atlases.ads;
    // only a few alternate variants fit; fall back to variant 0 of the brand
    if (variant > 1) variant = 0;
    // make sure every brand's primary art exists before spending space on alternates
    if (!K._brandsPreloaded) {
      K._brandsPreloaded = true;
      for (const br of G.LAYOUT.BRANDS) K.ad(br, 0);
    }
    const key = brand + ":" + variant;
    if (at.slots[key]) return at.slots[key].rect;
    at.quiet = variant > 0;
    const res = at.alloc(key, 400, 200, (x, W, H) => {
      let img = null;
      if (!G.isStub("tex") && G.tex.billboard) {
        try {
          const t = G.tex.billboard(brand, variant);
          img = t && t.image;
        } catch (e) {
          img = null;
        }
      }
      const ok =
        img &&
        (img instanceof HTMLCanvasElement ||
          img instanceof HTMLImageElement ||
          (window.ImageBitmap && img instanceof ImageBitmap)) &&
        img.width > 0;
      if (ok) {
        try {
          x.drawImage(img, 0, 0, W, H);
        } catch (e) {
          K.drawBrand(x, W, H, brand, variant);
        }
      } else K.drawBrand(x, W, H, brand, variant);
      // frame + grime edge
      x.strokeStyle = "rgba(0,0,0,0.6)";
      x.lineWidth = 6;
      x.strokeRect(0, 0, W, H);
    });
    at.quiet = false;
    if (res.full && variant > 0) return K.ad(brand, 0);
    return res.rect;
  };
  /** Custom ad cell drawn by fn (e.g. Times Square screens, local posters). */
  K.adDraw = function (key, draw) {
    return K.atlases.ads.alloc(key, 400, 200, draw).rect;
  };

  // ------------------------------------------------------------------
  // Flags (cells 256×128 in a 4-column grid so fract(u*4) = distance from pole)
  // ------------------------------------------------------------------
  let flagCount = 0;
  K.flag = function (key, draw) {
    const at = K.atlases.flags;
    if (at.slots[key]) return at.slots[key].rect;
    const i = flagCount++;
    const col = i % 4,
      row = Math.floor(i / 4);
    const s = { x: col * 128, y: row * 64, w: 128, h: 64 };
    const S = 512,
      e = 1.0;
    s.rect = [
      (s.x + e) / S,
      1 - (s.y + s.h - e) / S,
      (s.x + s.w - e) / S,
      1 - (s.y + e) / S,
    ];
    const x = at.ctx;
    x.save();
    x.beginPath();
    x.rect(s.x, s.y, s.w, s.h);
    x.clip();
    x.translate(s.x, s.y);
    x.scale(0.5, 0.5);
    if (draw) draw(x, 256, 128);
    // tatter: ragged fly end + holes (alpha-cut)
    const r = K.rng(key);
    x.globalCompositeOperation = "destination-out";
    x.beginPath();
    x.moveTo(256, 0);
    for (let yy = 0; yy <= 128; yy += 8)
      x.lineTo(256 - 6 - r() * 50 * (0.3 + r()), yy);
    x.lineTo(256, 128);
    x.closePath();
    x.fill();
    for (let k = 0; k < 4; k++) {
      x.beginPath();
      x.arc(40 + r() * 170, r() * 128, 2 + r() * 7, 0, 7);
      x.fill();
    }
    x.globalCompositeOperation = "source-over";
    // fade
    x.fillStyle = "rgba(200,190,160,0.18)";
    x.fillRect(0, 0, 256, 128);
    x.restore();
    at.slots[key] = s;
    at.tex.needsUpdate = true;
    return s.rect;
  };
  /** Draw a flag onto builder b: pole top at (x, top, z); flag extends along `dir` yaw (three.js); size w×h. */
  K.addFlag = function (b, rect, x, top, z, face, w, h) {
    const ux = Math.cos(face),
      uz = -Math.sin(face);
    b.face("flags", x, top - h, z, ux, 0, uz, 0, 1, 0, w, h, {
      uv: "rect",
      rect,
      su: 8,
      sv: 2,
      grime: 0.1,
    });
  };
  K.stdFlags = function () {
    // old-world stars & stripes (13 stars in a ring)
    K.flag("usa", (x, W, H) => {
      for (let i = 0; i < 13; i++) {
        x.fillStyle = i % 2 ? "#f0ece0" : "#b22234";
        x.fillRect(0, (i * H) / 13, W, H / 13 + 1);
      }
      x.fillStyle = "#2b3a6a";
      x.fillRect(0, 0, W * 0.42, H * 0.54);
      x.fillStyle = "#f0ece0";
      for (let i = 0; i < 13; i++) {
        const a = (i / 13) * Math.PI * 2;
        x.beginPath();
        x.arc(
          W * 0.21 + Math.cos(a) * 20,
          H * 0.27 + Math.sin(a) * 20,
          3,
          0,
          7,
        );
        x.fill();
      }
    });
    // the Continuity: navy field, red base bar, a white star inside a gold ring
    K.flag("continuity", (x, W, H) => {
      x.fillStyle = "#1c2850";
      x.fillRect(0, 0, W, H);
      x.fillStyle = "#a01c26";
      x.fillRect(0, H * 0.78, W, H * 0.22);
      x.fillStyle = "#e8e4d8";
      x.fillRect(0, H * 0.74, W, H * 0.04);
      x.strokeStyle = "#d8b040";
      x.lineWidth = 5;
      x.beginPath();
      x.arc(W * 0.42, H * 0.4, 30, 0, 7);
      x.stroke();
      K.star(x, W * 0.42, H * 0.4, 22, 9, "#e8e4d8");
    });
    // the Iron Covenant: rust-red over black, the iron shield emblem
    K.flag("covenant", (x, W, H) => {
      x.fillStyle = "#6a1a18";
      x.fillRect(0, 0, W, H);
      x.fillStyle = "#1a1a1a";
      x.fillRect(0, H * 0.8, W, H * 0.2);
      x.fillRect(0, 0, W, H * 0.08);
      K.covenantEmblem(x, W * 0.45, H * 0.46, 42, "#e8d8b0");
    });
    K.flag("raider", (x, W, H) => {
      x.fillStyle = "#2a2622";
      x.fillRect(0, 0, W, H);
      K.skull(x, W * 0.4, H * 0.5, 34, "#d8d0c0");
      x.fillStyle = "#9a1a12";
      x.globalAlpha = 0.6;
      x.fillRect(10, 90, 180, 8);
      x.globalAlpha = 1;
    });
    // the Glowkeepers: bone-white field, a gold sun disc
    K.flag("glowkeepers", (x, W, H) => {
      x.fillStyle = "#e8e4d0";
      x.fillRect(0, 0, W, H);
      K.sunDisc(x, W * 0.42, H / 2, 40, "#d89a20");
    });
    K.flag("settlers", (x, W, H) => {
      x.fillStyle = "#3c5a7a";
      x.fillRect(0, 0, W, H);
      x.fillStyle = "#e8c860";
      x.fillRect(0, H * 0.4, W, H * 0.2);
      x.fillStyle = "#e8c860";
      x.font = 'bold 34px "Arial Black", sans-serif';
      x.textAlign = "center";
      x.textBaseline = "middle";
      x.fillText("GCM", W * 0.42, H * 0.22);
    });
    // Invented old-world member-nation flags for the UN row (tricolours etc.)
    const pals = [
      ["#1f4f9a", "#f0f0f0", "#c81e1e"],
      ["#1a7a3a", "#f0f0f0", "#e8a020"],
      ["#c81e1e", "#f0d030", "#1a1a1a"],
      ["#2a6ab0", "#f0d030"],
      ["#e8e8e8", "#c81e1e"],
      ["#1a5a2a", "#c81e1e", "#f0d030"],
      ["#8a1a3a", "#f0f0f0"],
      ["#f08a20", "#f0f0f0", "#1a8a3a"],
      ["#1a1a6a", "#c8c8c8", "#c81e1e"],
      ["#3a9ad0", "#f0f0f0"],
    ];
    pals.forEach((p, i) =>
      K.flag("nation" + i, (x, W, H) => {
        const vert = i % 3 !== 1;
        for (let k = 0; k < p.length; k++) {
          x.fillStyle = p[k];
          if (vert) x.fillRect((k * W) / p.length, 0, W / p.length + 1, H);
          else x.fillRect(0, (k * H) / p.length, W, H / p.length + 1);
        }
        if (i % 4 === 0) {
          x.fillStyle = p[p.length - 1] === "#f0f0f0" ? "#c81e1e" : "#f0f0f0";
          x.beginPath();
          x.arc(W * 0.42, H / 2, 20, 0, 7);
          x.fill();
        }
        if (i % 4 === 3) K.star(x, W * 0.2, H * 0.3, 18, 8, "#f0f0f0");
      }),
    );
    K.flag("un", (x, W, H) => {
      x.fillStyle = "#4b92db";
      x.fillRect(0, 0, W, H);
      x.strokeStyle = "#f0f0f0";
      x.lineWidth = 3;
      x.beginPath();
      x.arc(W * 0.42, H / 2, 38, 0, 7);
      x.stroke();
      x.beginPath();
      x.arc(W * 0.42, H / 2, 22, 0, 7);
      x.stroke();
      x.beginPath();
      x.moveTo(W * 0.42 - 38, H / 2);
      x.lineTo(W * 0.42 + 38, H / 2);
      x.moveTo(W * 0.42, H / 2 - 38);
      x.lineTo(W * 0.42, H / 2 + 38);
      x.stroke();
    });
  };

  // ------------------------------------------------------------------
  // Shared canvas glyphs (original designs)
  // ------------------------------------------------------------------
  K.star = function (x, cx, cy, R, r, col) {
    x.fillStyle = col;
    x.beginPath();
    for (let i = 0; i < 10; i++) {
      const rr = i % 2 ? r : R,
        a = -Math.PI / 2 + (i * Math.PI) / 5;
      x.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
    }
    x.closePath();
    x.fill();
  };
  K.skull = function (x, cx, cy, s, col) {
    x.fillStyle = col;
    x.beginPath();
    x.arc(cx, cy - s * 0.15, s * 0.6, Math.PI, 0);
    x.lineTo(cx + s * 0.45, cy + s * 0.35);
    x.lineTo(cx - s * 0.45, cy + s * 0.35);
    x.fill();
    x.fillRect(cx - s * 0.3, cy + s * 0.3, s * 0.6, s * 0.3);
    x.fillStyle = "#111";
    x.beginPath();
    x.arc(cx - s * 0.22, cy, s * 0.14, 0, 7);
    x.arc(cx + s * 0.22, cy, s * 0.14, 0, 7);
    x.fill();
    x.fillRect(cx - s * 0.04, cy + s * 0.12, s * 0.08, s * 0.14);
    x.strokeStyle = col;
    x.lineWidth = s * 0.1;
    x.beginPath();
    x.moveTo(cx - s, cy - s * 0.6);
    x.lineTo(cx + s, cy + s);
    x.moveTo(cx + s, cy - s * 0.6);
    x.lineTo(cx - s, cy + s);
    x.stroke();
  };
  /** Iron Covenant emblem (original): a heater shield with a rivet band, two crossed lances behind it, an anvil cut-out. */
  K.covenantEmblem = function (x, cx, cy, s, col) {
    x.save();
    x.translate(cx, cy);
    x.fillStyle = col;
    x.strokeStyle = col;
    x.lineWidth = s * 0.08;
    for (const sgn of [-1, 1]) {
      x.beginPath();
      x.moveTo(sgn * s * 0.95, s * 0.85);
      x.lineTo(-sgn * s * 0.8, -s * 0.8);
      x.stroke();
      x.beginPath();
      x.moveTo(-sgn * s * 0.8, -s * 0.8);
      x.lineTo(-sgn * s * 0.98, -s * 1.0);
      x.lineTo(-sgn * s * 0.66, -s * 0.9);
      x.fill();
    }
    x.beginPath();
    x.moveTo(-s * 0.5, -s * 0.55);
    x.lineTo(s * 0.5, -s * 0.55);
    x.lineTo(s * 0.5, s * 0.05);
    x.quadraticCurveTo(s * 0.45, s * 0.5, 0, s * 0.75);
    x.quadraticCurveTo(-s * 0.45, s * 0.5, -s * 0.5, s * 0.05);
    x.closePath();
    x.fill();
    x.globalCompositeOperation = "destination-out";
    for (let i = 0; i < 5; i++) {
      x.beginPath();
      x.arc(-s * 0.36 + i * s * 0.18, -s * 0.4, s * 0.045, 0, 7);
      x.fill();
    }
    x.beginPath();
    x.moveTo(-s * 0.3, -s * 0.12);
    x.lineTo(s * 0.3, -s * 0.12);
    x.lineTo(s * 0.16, s * 0.02);
    x.lineTo(s * 0.1, s * 0.3);
    x.lineTo(-s * 0.1, s * 0.3);
    x.lineTo(-s * 0.16, s * 0.02);
    x.closePath();
    x.fill();
    x.restore();
  };
  /** Glowkeeper sun disc: a solid disc, a thin ring and twelve wedge rays. */
  K.sunDisc = function (x, cx, cy, s, col, lw) {
    x.save();
    x.translate(cx, cy);
    x.strokeStyle = col;
    x.fillStyle = col;
    x.lineWidth = lw || s * 0.07;
    x.beginPath();
    x.arc(0, 0, s * 0.42, 0, 7);
    x.fill();
    x.beginPath();
    x.arc(0, 0, s * 0.6, 0, 7);
    x.stroke();
    for (let i = 0; i < 12; i++) {
      x.save();
      x.rotate((i * Math.PI) / 6);
      x.beginPath();
      x.moveTo(-s * 0.07, -s * 0.7);
      x.lineTo(0, -s * (i % 2 ? 0.92 : 1.05));
      x.lineTo(s * 0.07, -s * 0.7);
      x.closePath();
      x.fill();
      x.restore();
    }
    x.restore();
  };
  /** Analog clock face (numerals in Roman or Arabic). */
  K.clockFace = function (x, W, H, o) {
    o = o || {};
    const cx = W / 2,
      cy = H / 2,
      R = Math.min(W, H) / 2 - 2;
    x.fillStyle = o.rim || "#b8902a";
    x.beginPath();
    x.arc(cx, cy, R, 0, 7);
    x.fill();
    x.fillStyle = o.face || "#efe6c8";
    x.beginPath();
    x.arc(cx, cy, R * 0.88, 0, 7);
    x.fill();
    if (o.glass) {
      // Tiffany-style coloured glass ring
      const cols = ["#2a6a9a", "#c83a2a", "#3a8a4a", "#d8a030"];
      for (let i = 0; i < 24; i++) {
        x.fillStyle = cols[i % 4];
        x.beginPath();
        x.moveTo(cx, cy);
        x.arc(cx, cy, R * 0.88, (i * Math.PI) / 12, ((i + 1) * Math.PI) / 12);
        x.fill();
      }
      x.fillStyle = o.face || "#efe6c8";
      x.beginPath();
      x.arc(cx, cy, R * 0.66, 0, 7);
      x.fill();
    }
    x.fillStyle = o.ink || "#1a1a1a";
    x.font = "bold " + Math.round(R * 0.2) + "px Georgia, serif";
    x.textAlign = "center";
    x.textBaseline = "middle";
    const roman = [
      "XII",
      "I",
      "II",
      "III",
      "IIII",
      "V",
      "VI",
      "VII",
      "VIII",
      "IX",
      "X",
      "XI",
    ];
    for (let i = 0; i < 12; i++) {
      const a = (i * Math.PI) / 6 - Math.PI / 2,
        rr = o.glass ? R * 0.52 : R * 0.72;
      x.fillText(
        o.arabic ? String(i === 0 ? 12 : i) : roman[i],
        cx + Math.cos(a) * rr,
        cy + Math.sin(a) * rr,
      );
    }
    // hands frozen at 7:16 — the moment the bomb fell
    const hand = (ang, len, wdt) => {
      x.save();
      x.translate(cx, cy);
      x.rotate(ang);
      x.fillRect(-wdt / 2, -len, wdt, len * 1.12);
      x.restore();
    };
    x.fillStyle = o.ink || "#1a1a1a";
    hand(((7 + 16 / 60) / 12) * Math.PI * 2, R * 0.45, R * 0.07);
    hand((16 / 60) * Math.PI * 2, R * 0.66, R * 0.045);
    x.beginPath();
    x.arc(cx, cy, R * 0.06, 0, 7);
    x.fill();
    // cracks
    x.strokeStyle = "rgba(40,30,20,0.55)";
    x.lineWidth = 1.5;
    const r = K.rng(o.seed || 5);
    for (let k = 0; k < 3; k++) {
      x.beginPath();
      let px = cx + (r() - 0.5) * R,
        py = cy + (r() - 0.5) * R;
      x.moveTo(px, py);
      for (let j = 0; j < 5; j++) {
        px += (r() - 0.5) * R * 0.4;
        py += (r() - 0.5) * R * 0.4;
        x.lineTo(px, py);
      }
      x.stroke();
    }
  };

  // ------------------------------------------------------------------
  // Shopfronts: 8 ground-floor window variants in one texture (4 × 2 cells of 256²) with a matching
  // emissive map (only the lit interiors glow, brighter at night). K.shopRect(i) → uv rect of variant i.
  //   0 dirty plate glass (dim shelves, reflections)   1 boarded plywood + posters + graffiti
  //   2 LIT diner / bar interior                        3 smashed glass into darkness
  //   4 roll-down steel shutter with graffiti           5 LIT junk shop (shelves, hanging bulb)
  //   6 LIT chem clinic (white-blue)                    7 cinder-block infill
  // ------------------------------------------------------------------
  K.SHOP_LIT = [2, 5, 6];
  K.shopRect = function (i) {
    i = ((i % 8) + 8) % 8;
    const cx = i % 4,
      cy = Math.floor(i / 4);
    const e = 2 / 1024;
    return [
      cx / 4 + e,
      1 - (cy + 1) / 2 + e * 2,
      (cx + 1) / 4 - e,
      1 - cy / 2 - e * 2,
    ];
  };
  K.shopfronts = function () {
    if (K.MATDEF.shopfront) return;
    const W = 1024,
      H = 512,
      S = 256;
    const c = K.canvas(W, H),
      x = c.getContext("2d"),
      ec = K.canvas(W, H),
      e = ec.getContext("2d");
    x.fillStyle = "#222";
    x.fillRect(0, 0, W, H);
    e.fillStyle = "#000";
    e.fillRect(0, 0, W, H);
    const r = K.rng(8080);
    const frame = (ox, oy, col) => {
      // bronze / black shop frame, transom bar, kick plate
      x.fillStyle = col || "#2a2520";
      x.fillRect(ox, oy, S, 12);
      x.fillRect(ox, oy + S - 30, S, 30);
      x.fillRect(ox, oy, 12, S);
      x.fillRect(ox + S - 12, oy, 12, S);
      x.fillRect(ox, oy + 58, S, 7);
      x.fillRect(ox + S / 2 - 3, oy + 65, 6, S - 95);
      x.fillStyle = "rgba(255,230,180,0.18)";
      x.fillRect(ox + 2, oy + 2, S - 4, 2);
      x.fillRect(ox + 2, oy + 58, S - 4, 1);
      x.fillStyle = "rgba(0,0,0,0.35)";
      x.fillRect(ox, oy + S - 30, S, 3);
      e.fillStyle = "#000";
      e.fillRect(ox, oy, S, 12);
      e.fillRect(ox, oy + S - 30, S, 30);
      e.fillRect(ox, oy, 12, S);
      e.fillRect(ox + S - 12, oy, 12, S);
      e.fillRect(ox, oy + 58, S, 7);
      e.fillRect(ox + S / 2 - 3, oy + 65, 6, S - 95);
    };
    const reflections = (ox, oy, a) => {
      x.save();
      x.beginPath();
      x.rect(ox + 12, oy + 12, S - 24, S - 42);
      x.clip();
      for (let k = 0; k < 3; k++) {
        const px = ox + r() * S;
        const g = x.createLinearGradient(px, oy, px + 60, oy + S);
        g.addColorStop(0, "rgba(200,210,215,0)");
        g.addColorStop(0.5, "rgba(200,210,215," + a + ")");
        g.addColorStop(1, "rgba(200,210,215,0)");
        x.fillStyle = g;
        x.beginPath();
        x.moveTo(px, oy);
        x.lineTo(px + 40 + r() * 30, oy);
        x.lineTo(px + 110, oy + S);
        x.lineTo(px + 60, oy + S);
        x.fill();
      }
      x.restore();
    };
    const shelves = (ox, oy, col, n) => {
      for (let k = 0; k < 3; k++) {
        const y = oy + 110 + k * 36;
        x.fillStyle = col;
        x.fillRect(ox + 20, y, S - 40, 4);
        for (let j = 0; j < n; j++) {
          x.fillStyle = ["#6a3a2a", "#3a4a5a", "#8a7a3a", "#5a5a52"][
            Math.floor(r() * 4)
          ];
          const w = 6 + r() * 14,
            h = 8 + r() * 18;
          x.fillRect(ox + 24 + r() * (S - 60), y - h, w, h);
        }
      }
    };
    const grime = (ox, oy) => {
      x.save();
      x.beginPath();
      x.rect(ox, oy, S, S);
      x.clip();
      x.translate(ox, oy);
      K.stains(x, S, S, 5, Math.floor(r() * 999), 0.35);
      K.streaks(x, S, S, 10, Math.floor(r() * 999), 0.25);
      x.restore();
    };
    const cell = (i, fn) => {
      const ox = (i % 4) * S,
        oy = Math.floor(i / 4) * S;
      x.save();
      fn(ox, oy);
      x.restore();
    };
    // 0 dirty plate glass
    cell(0, (ox, oy) => {
      const g = x.createLinearGradient(0, oy, 0, oy + S);
      g.addColorStop(0, "#2a3230");
      g.addColorStop(1, "#141816");
      x.fillStyle = g;
      x.fillRect(ox, oy, S, S);
      shelves(ox, oy, "#3a3a34", 6);
      x.fillStyle = "rgba(120,130,120,0.25)";
      x.fillRect(ox, oy, S, S);
      reflections(ox, oy, 0.22);
      x.fillStyle = "rgba(210,190,120,0.55)";
      x.font = "bold 30px Georgia, serif";
      x.textAlign = "center";
      x.fillText("DRY GOODS", ox + S / 2, oy + 45);
      frame(ox, oy, "#3a2e22");
      grime(ox, oy);
    });
    // 1 boarded plywood + posters
    cell(1, (ox, oy) => {
      for (let k = 0; k < 6; k++) {
        x.fillStyle = K.shadeHex(0x9a7a52, 0.75 + r() * 0.35);
        x.fillRect(ox, oy + k * 43, S, 42);
        x.fillStyle = "rgba(40,25,10,0.5)";
        x.fillRect(ox, oy + k * 43 + 41, S, 2);
        for (let j = 0; j < 4; j++) {
          x.fillStyle = "#2a2a2a";
          x.fillRect(ox + 20 + j * 70, oy + k * 43 + 18, 3, 3);
        }
      }
      x.fillStyle = "#e8dcc0";
      x.fillRect(ox + 30, oy + 40, 80, 110);
      x.fillStyle = "#b01a1a";
      x.fillRect(ox + 36, oy + 48, 68, 30);
      x.fillStyle = "#1a1a1a";
      x.font = "bold 16px Impact, sans-serif";
      x.textAlign = "center";
      x.fillText("WANTED", ox + 70, oy + 100);
      x.fillText("ALIVE", ox + 70, oy + 120);
      x.fillStyle = "#d8c890";
      x.fillRect(ox + 150, oy + 70, 70, 95);
      x.fillStyle = "#2a4a8a";
      x.beginPath();
      x.arc(ox + 185, oy + 110, 22, 0, 7);
      x.fill();
      x.strokeStyle = "rgba(210,40,40,0.85)";
      x.lineWidth = 7;
      x.lineCap = "round";
      x.beginPath();
      x.moveTo(ox + 40, oy + 200);
      x.bezierCurveTo(
        ox + 90,
        oy + 170,
        ox + 130,
        oy + 230,
        ox + 220,
        oy + 185,
      );
      x.stroke();
      x.fillStyle = "rgba(240,150,40,0.85)";
      x.font = "bold 34px Impact, sans-serif";
      x.fillText("KEEP OUT", ox + 128, oy + 238);
      grime(ox, oy);
    });
    // 2 LIT diner / bar
    const litInterior = (ox, oy, c0, c1, glowA) => {
      const g = x.createRadialGradient(
        ox + S / 2,
        oy + 80,
        10,
        ox + S / 2,
        oy + 120,
        S * 0.8,
      );
      g.addColorStop(0, c0);
      g.addColorStop(1, c1);
      x.fillStyle = g;
      x.fillRect(ox, oy, S, S);
      const ge = e.createRadialGradient(
        ox + S / 2,
        oy + 80,
        10,
        ox + S / 2,
        oy + 120,
        S * 0.8,
      );
      ge.addColorStop(0, glowA);
      ge.addColorStop(1, "rgba(0,0,0,1)");
      e.fillStyle = ge;
      e.fillRect(ox, oy, S, S);
    };
    cell(2, (ox, oy) => {
      litInterior(ox, oy, "#ffcf7a", "#6a3a18", "rgb(255,190,110)");
      x.fillStyle = "#2a1a10";
      x.fillRect(ox + 12, oy + 160, S - 24, 30);
      for (let k = 0; k < 5; k++) {
        x.fillRect(ox + 30 + k * 45, oy + 190, 6, 36);
        x.beginPath();
        x.ellipse(ox + 33 + k * 45, oy + 188, 14, 5, 0, 0, 7);
        x.fill();
      }
      x.fillStyle = "#1a100a";
      x.beginPath();
      x.arc(ox + 80, oy + 125, 13, 0, 7);
      x.fill();
      x.fillRect(ox + 68, oy + 137, 24, 30);
      x.beginPath();
      x.arc(ox + 175, oy + 120, 12, 0, 7);
      x.fill();
      x.fillRect(ox + 164, oy + 131, 22, 34);
      x.fillStyle = "#ff5a8a";
      x.font = 'bold 26px "Arial Black", sans-serif';
      x.textAlign = "center";
      x.shadowColor = "#ff5a8a";
      x.shadowBlur = 10;
      x.fillText("OPEN", ox + S / 2, oy + 45);
      x.shadowBlur = 0;
      e.fillStyle = "#ff5a8a";
      e.font = 'bold 26px "Arial Black", sans-serif';
      e.textAlign = "center";
      e.fillText("OPEN", ox + S / 2, oy + 45);
      reflections(ox, oy, 0.08);
      frame(ox, oy, "#2a2018");
      grime(ox, oy);
    });
    // 3 smashed glass into darkness
    cell(3, (ox, oy) => {
      x.fillStyle = "#0c0e0d";
      x.fillRect(ox, oy, S, S);
      x.fillStyle = "rgba(90,100,96,0.5)";
      for (let k = 0; k < 9; k++) {
        x.beginPath();
        const ex = ox + 12 + r() * (S - 24),
          ey = oy + 65 + r() * 20;
        x.moveTo(ex, oy + 65);
        x.lineTo(ex + 20 + r() * 30, oy + 65);
        x.lineTo(ex + 10, ey + 20 + r() * 50);
        x.fill();
      }
      for (let k = 0; k < 7; k++) {
        x.beginPath();
        const ex = ox + 12 + r() * (S - 24);
        x.moveTo(ex, oy + S - 30);
        x.lineTo(ex + 25 + r() * 25, oy + S - 30);
        x.lineTo(ex + 12, oy + S - 60 - r() * 60);
        x.fill();
      }
      x.strokeStyle = "rgba(200,210,210,0.35)";
      x.lineWidth = 1;
      for (let k = 0; k < 14; k++) {
        x.beginPath();
        x.moveTo(ox + 20 + r() * 220, oy + 70 + r() * 150);
        x.lineTo(ox + 20 + r() * 220, oy + 70 + r() * 150);
        x.stroke();
      }
      frame(ox, oy, "#231e1a");
      grime(ox, oy);
    });
    // 4 roll-down shutter
    cell(4, (ox, oy) => {
      for (let k = 0; k < S; k += 8) {
        x.fillStyle = K.shadeHex(0x7a7c78, 0.8 + 0.25 * Math.sin(k));
        x.fillRect(ox, oy + k, S, 7);
        x.fillStyle = "rgba(0,0,0,0.4)";
        x.fillRect(ox, oy + k + 7, S, 1);
      }
      K.stains(x, S, S, 0, 1, 0);
      x.fillStyle = "rgba(130,70,30,0.45)";
      for (let k = 0; k < 12; k++) {
        x.beginPath();
        x.ellipse(
          ox + r() * S,
          oy + r() * S,
          8 + r() * 30,
          4 + r() * 10,
          0,
          0,
          7,
        );
        x.fill();
      }
      x.fillStyle = "rgba(60,160,230,0.9)";
      x.font = "bold 44px Impact, sans-serif";
      x.textAlign = "center";
      x.save();
      x.translate(ox + S / 2, oy + 120);
      x.rotate(-0.12);
      x.fillText("COUNT ME", 0, 0);
      x.fillStyle = "rgba(240,210,60,0.9)";
      x.fillText("OUT!", 0, 46);
      x.restore();
      frame(ox, oy, "#1e1c1a");
      grime(ox, oy);
    });
    // 5 LIT junk shop
    cell(5, (ox, oy) => {
      litInterior(ox, oy, "#ffe0a0", "#4a3a24", "rgb(230,190,120)");
      shelves(ox, oy, "#3a2a1a", 9);
      x.strokeStyle = "#2a2016";
      x.lineWidth = 2;
      x.beginPath();
      x.moveTo(ox + S / 2, oy + 12);
      x.lineTo(ox + S / 2, oy + 70);
      x.stroke();
      x.fillStyle = "#fff4d0";
      x.beginPath();
      x.arc(ox + S / 2, oy + 76, 7, 0, 7);
      x.fill();
      e.fillStyle = "#fff4d0";
      e.beginPath();
      e.arc(ox + S / 2, oy + 76, 9, 0, 7);
      e.fill();
      x.fillStyle = "rgba(40,20,10,0.8)";
      x.font = "bold 22px Georgia, serif";
      x.textAlign = "center";
      x.fillText("BUY · SELL · SWAP", ox + S / 2, oy + 44);
      reflections(ox, oy, 0.07);
      frame(ox, oy, "#2a2018");
      grime(ox, oy);
    });
    // 6 LIT chem clinic (white-blue)
    cell(6, (ox, oy) => {
      litInterior(ox, oy, "#d8f0ff", "#1a2a3a", "rgb(170,215,240)");
      x.fillStyle = "#e8f0e0";
      x.fillRect(ox + 40, oy + 150, 90, 40);
      x.fillStyle = "#c02a2a";
      x.fillRect(ox + 80, oy + 156, 10, 28);
      x.fillRect(ox + 71, oy + 165, 28, 10);
      x.fillStyle = "#123018";
      for (let k = 0; k < 8; k++)
        x.fillRect(
          ox + 150 + (k % 4) * 18,
          oy + 110 + Math.floor(k / 4) * 40,
          10,
          26,
        );
      x.fillStyle = "#e02a2a";
      x.font = 'bold 24px "Arial Black", sans-serif';
      x.textAlign = "center";
      x.fillText("+ MEDS", ox + S / 2, oy + 45);
      e.fillStyle = "#ff3a3a";
      e.font = 'bold 24px "Arial Black", sans-serif';
      e.textAlign = "center";
      e.fillText("+ MEDS", ox + S / 2, oy + 45);
      reflections(ox, oy, 0.07);
      frame(ox, oy, "#202420");
      grime(ox, oy);
    });
    // 7 cinder-block infill
    cell(7, (ox, oy) => {
      for (let row = 0; row < 12; row++)
        for (let col = -1; col < 6; col++) {
          x.fillStyle = K.shadeHex(0x8a8680, 0.8 + r() * 0.3);
          x.fillRect(ox + col * 52 + (row % 2) * 26, oy + row * 22, 50, 20);
        }
      x.fillStyle = "rgba(30,28,24,0.6)";
      x.fillRect(ox + 100, oy + 90, 40, 30);
      frame(ox, oy, "#2a2622");
      grime(ox, oy);
    });
    K.grain(x, W, H, 14, 8081);
    const map = K.texFromCanvas(c, { clamp: true }),
      emap = K.texFromCanvas(ec, { clamp: true });
    K.defineMat("shopfront", {
      map,
      emissiveMap: emap,
      emissiveColor: 0xffffff,
      emissiveIntensity: 0.25,
      color: 0xffffff,
      rough: 0.55,
      metal: 0.05,
    });
    K.nightEmissive("shopfront", 0.25, 1.25);
  };
  /** Painted sign with text (weathered). */
  K.signText = function (x, W, H, text, o) {
    o = o || {};
    x.fillStyle = o.bg || "#2a2a26";
    x.fillRect(0, 0, W, H);
    if (o.border) {
      x.strokeStyle = o.border;
      x.lineWidth = Math.max(3, H * 0.06);
      x.strokeRect(H * 0.06, H * 0.06, W - H * 0.12, H - H * 0.12);
    }
    x.fillStyle = o.fg || "#e8e0c8";
    x.textAlign = "center";
    x.textBaseline = "middle";
    let size = o.size || H * 0.62;
    x.font =
      (o.weight || "bold") +
      " " +
      Math.round(size) +
      "px " +
      (o.font || '"Arial Black", Impact, sans-serif');
    while (x.measureText(text).width > W * 0.92 && size > 8) {
      size *= 0.92;
      x.font =
        (o.weight || "bold") +
        " " +
        Math.round(size) +
        "px " +
        (o.font || '"Arial Black", Impact, sans-serif');
    }
    if (o.spacing) {
      try {
        x.letterSpacing = o.spacing + "px";
      } catch (e) {
        /* older canvas */
      }
    }
    x.fillText(text, W / 2, H / 2 + (o.dy || 0) * H);
    try {
      x.letterSpacing = "0px";
    } catch (e) {
      /* ignore */
    }
    if (o.weather !== false) {
      K.stains(x, W, H, 6, U.hashStr(text) % 997, 0.35);
      K.streaks(x, W, H, 12, U.hashStr(text) % 991, 0.22);
    }
  };
})();
