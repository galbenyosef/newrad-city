/* src/weapons/10_kit.js */
/* =====================================================================
 * NEW RAD CITY — WEAPONS: modelling kit
 * Procedural textures (canvas), shared materials, geometry primitives and
 * a merging "Builder" used by every viewmodel / world model.
 *
 * Conventions for all weapon models:
 *   * metres, origin = right-hand grip point, barrel/forward along -Z, up +Y
 *   * every model is a THREE.Group returned by a kind builder with
 *     { root, parts:{...animated sub-groups}, sockets:{muzzle, eject, sight,
 *       rightHand, leftHand, ...}, cfg:{hip, ads,...} }
 *   * static geometry is merged per material (few draw calls)
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  const P = G.weapons._;

  // ------------------------------------------------------------------
  // Canvas textures
  // ------------------------------------------------------------------
  const texCache = {};
  function canvasTex(name, size, paint, opts) {
    if (texCache[name]) return texCache[name];
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const ctx = c.getContext("2d");
    paint(ctx, size);
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    if (!opts || !opts.linear) t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    t.needsUpdate = true;
    texCache[name] = t;
    return t;
  }
  function rngFor(name) {
    return G.util.rng(G.util.hashStr(name));
  }

  /** Fill with tileable-ish value noise between lo and hi (0..255 grey), tinted by rgb multipliers. */
  function noiseFill(ctx, s, freq, lo, hi, tint, oct) {
    const img = ctx.getImageData(0, 0, s, s),
      d = img.data;
    const U = G.util;
    tint = tint || [1, 1, 1];
    for (let y = 0; y < s; y++) {
      for (let x = 0; x < s; x++) {
        // wrap noise by sampling on a torus-ish blend so edges tile reasonably
        const u = x / s,
          v = y / s;
        const n =
          U.fbm2(u * freq, v * freq, oct || 4) * (1 - u) * (1 - v) +
          U.fbm2((u - 1) * freq, v * freq, oct || 4) * u * (1 - v) +
          U.fbm2(u * freq, (v - 1) * freq, oct || 4) * (1 - u) * v +
          U.fbm2((u - 1) * freq, (v - 1) * freq, oct || 4) * u * v;
        const g = lo + (hi - lo) * n;
        const i = (y * s + x) * 4;
        d[i] = Math.min(255, g * tint[0]);
        d[i + 1] = Math.min(255, g * tint[1]);
        d[i + 2] = Math.min(255, g * tint[2]);
        d[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  }
  function scratches(ctx, s, n, rng, color, maxLen, width) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width || 1;
    for (let i = 0; i < n; i++) {
      const x = rng() * s,
        y = rng() * s,
        a = rng() * Math.PI * 2,
        l = 4 + rng() * (maxLen || 30);
      ctx.globalAlpha = 0.15 + rng() * 0.45;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
  function blotches(ctx, s, n, rng, color, rMax) {
    for (let i = 0; i < n; i++) {
      const x = rng() * s,
        y = rng() * s,
        r = 3 + rng() * (rMax || 20);
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, color);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.globalAlpha = 0.3 + rng() * 0.5;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
    }
    ctx.globalAlpha = 1;
  }

  // ------------------------------------------------------------------
  // Enamel paint (military olive, cola red, civil-defense blue ...)
  // Painted in the actual base colour so chips can show *bare, lighter*
  // steel instead of black holes. Every colour uses the same seed, so the
  // chips line up with the shared bump texture (chips are recessed).
  // Look: soft mottled enamel, grime pooling in gradients, sparse small
  // chips clustered along a few "edges", fine light scuffs. Low contrast.
  // ------------------------------------------------------------------
  let noiseCanvas = null;
  function getNoiseCanvas(s) {
    if (noiseCanvas && noiseCanvas.width === s) return noiseCanvas;
    noiseCanvas = document.createElement("canvas");
    noiseCanvas.width = noiseCanvas.height = s;
    noiseFill(noiseCanvas.getContext("2d"), s, 9, 70, 190, null, 4);
    return noiseCanvas;
  }
  function drawEnamel(c, s, base, bump) {
    const r = rngFor("enamel");
    // 1) base coat + soft mottling (overlay keeps the hue)
    c.fillStyle = bump ? "#c8c8c8" : base;
    c.fillRect(0, 0, s, s);
    c.globalCompositeOperation = bump ? "source-over" : "overlay";
    c.globalAlpha = bump ? 0.18 : 0.32;
    c.drawImage(getNoiseCanvas(s), 0, 0);
    c.globalCompositeOperation = "source-over";
    c.globalAlpha = 1;
    // 2) grime: broad, faint darkening gradients (dirt pooling), a few faded sun-bleached patches
    for (let i = 0; i < 9; i++) {
      const x = r() * s,
        y = r() * s,
        rad = 20 + r() * 60;
      const g = c.createRadialGradient(x, y, 0, x, y, rad);
      const dark = r() < 0.7;
      g.addColorStop(
        0,
        bump
          ? "rgba(0,0,0,0)"
          : dark
            ? "rgba(40,32,20,0.22)"
            : "rgba(235,225,200,0.10)",
      );
      g.addColorStop(1, "rgba(0,0,0,0)");
      c.fillStyle = g;
      c.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    }
    // 3) chips: few and small, clustered along random lines (panel edges / corners)
    for (let e = 0; e < 5; e++) {
      const horiz = r() < 0.5,
        line = r() * s,
        from = r() * s,
        len = 30 + r() * 90;
      const n = 3 + Math.floor(r() * 5);
      for (let i = 0; i < n; i++) {
        const t = from + r() * len,
          off = (r() - 0.5) * 6;
        const x = (horiz ? t : line + off) % s,
          y = (horiz ? line + off : t) % s;
        const w = 0.8 + r() * 2.6,
          h = 0.6 + r() * 1.6,
          a = r() * 3;
        // darker rim (paint edge) then bare steel inside
        c.fillStyle = bump ? "rgba(90,90,90,0.9)" : "rgba(30,28,24,0.35)";
        c.beginPath();
        c.ellipse(x, y, w + 0.7, h + 0.7, a, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = bump ? "rgba(70,70,70,1)" : "rgba(150,148,142,0.92)";
        c.beginPath();
        c.ellipse(x, y, w, h, a, 0, Math.PI * 2);
        c.fill();
      }
    }
    // a handful of isolated pin chips
    for (let i = 0; i < 12; i++) {
      const x = r() * s,
        y = r() * s;
      c.fillStyle = bump ? "rgba(80,80,80,1)" : "rgba(140,138,132,0.8)";
      c.fillRect(x, y, 1 + (r() < 0.3 ? 1 : 0), 1);
    }
    // 4) fine scuffs (light, low alpha) and a few darker scratches
    if (!bump) {
      scratches(c, s, 40, r, "rgba(255,255,245,0.5)", 10, 1);
      scratches(c, s, 14, r, "rgba(20,20,20,0.5)", 8, 1);
    }
    c.globalAlpha = 1;
  }
  /** Enamel texture in a given base colour (hex number). */
  function paintTex(key, hex) {
    const css = "#" + ("000000" + hex.toString(16)).slice(-6);
    return canvasTex("wpn_paint_" + key, 256, (c, s) =>
      drawEnamel(c, s, css, false),
    );
  }
  const paintBumpTex = () =>
    canvasTex("wpn_paint_bump", 256, (c, s) => drawEnamel(c, s, null, true), {
      linear: true,
    });

  const TEX = {
    // blued / parkerized steel: neutral grey, fine noise, scratches and wear
    metal: () =>
      canvasTex("wpn_metal", 256, (c, s) => {
        const r = rngFor("metal");
        noiseFill(c, s, 18, 170, 235);
        blotches(c, s, 40, r, "rgba(60,50,40,0.9)", 18);
        scratches(c, s, 260, r, "#ffffff", 26, 1);
        scratches(c, s, 60, r, "#303030", 14, 1);
      }),
    // heavily worn metal with rust bleed
    rust: () =>
      canvasTex("wpn_rust", 256, (c, s) => {
        const r = rngFor("rust");
        noiseFill(c, s, 10, 120, 210, [1.05, 0.82, 0.62]);
        blotches(c, s, 70, r, "rgba(120,55,20,1)", 26);
        blotches(c, s, 30, r, "rgba(60,30,15,1)", 14);
        blotches(c, s, 25, r, "rgba(170,150,130,1)", 10);
        scratches(c, s, 120, r, "#d8c8b0", 16, 1);
      }),
    // walnut stock: long grain along U
    wood: () =>
      canvasTex("wpn_wood", 256, (c, s) => {
        const r = rngFor("wood");
        const U = G.util;
        const img = c.getImageData(0, 0, s, s),
          d = img.data;
        for (let y = 0; y < s; y++)
          for (let x = 0; x < s; x++) {
            const v = y / s,
              u = x / s;
            const warp = U.fbm2(u * 3, v * 6, 3) * 6;
            const ring = Math.sin((v * 22 + warp) * Math.PI) * 0.5 + 0.5;
            const fine = U.noise2(u * 90, v * 300) * 0.25;
            const k = 0.55 + ring * 0.3 + fine;
            const i = (y * s + x) * 4;
            d[i] = 122 * k + 28;
            d[i + 1] = 74 * k + 16;
            d[i + 2] = 42 * k + 10;
            d[i + 3] = 255;
          }
        c.putImageData(img, 0, 0);
        blotches(c, s, 20, r, "rgba(30,15,5,1)", 20);
        scratches(c, s, 50, r, "#e0b890", 20, 1);
      }),
    // light ash (bats, cues)
    woodLight: () =>
      canvasTex("wpn_wood_light", 256, (c, s) => {
        const r = rngFor("woodl");
        const U = G.util;
        const img = c.getImageData(0, 0, s, s),
          d = img.data;
        for (let y = 0; y < s; y++)
          for (let x = 0; x < s; x++) {
            const v = y / s,
              u = x / s;
            const warp = U.fbm2(u * 2, v * 5, 3) * 4;
            const ring = Math.sin((v * 16 + warp) * Math.PI) * 0.5 + 0.5;
            const k = 0.75 + ring * 0.18 + U.noise2(u * 80, v * 260) * 0.12;
            const i = (y * s + x) * 4;
            d[i] = 215 * k;
            d[i + 1] = 170 * k;
            d[i + 2] = 118 * k;
            d[i + 3] = 255;
          }
        c.putImageData(img, 0, 0);
        blotches(c, s, 35, r, "rgba(70,45,25,1)", 22);
        scratches(c, s, 60, r, "#3a2a1a", 18, 1);
      }),
    // checkered grip (bakelite / rubber): neutral, material colours it. Real raised diamonds: every
    // cell is a little pyramid lit from the top-left (light upper facets, dark lower facets) with a
    // cut groove between cells — reads as checkering both in colour and through the bump map.
    grip: () =>
      canvasTex("wpn_grip", 128, (c, s) => {
        noiseFill(c, s, 12, 160, 200);
        const r = rngFor("grip");
        const P8 = 8; // diamond pitch (px); 16 cells across the tile (tiles seamlessly)
        c.save();
        c.translate(s / 2, s / 2);
        c.rotate(Math.PI / 4);
        c.translate(-s, -s);
        for (let y = 0; y < s * 2; y += (P8 / Math.SQRT2) * 1.0) {
          for (let x = 0; x < s * 2; x += (P8 / Math.SQRT2) * 1.0) {
            const w = P8 / Math.SQRT2;
            // four facets: top/left light, bottom/right dark (pyramid)
            c.fillStyle = "rgba(255,255,240,0.20)";
            c.beginPath();
            c.moveTo(x, y);
            c.lineTo(x + w, y);
            c.lineTo(x + w / 2, y + w / 2);
            c.fill();
            c.fillStyle = "rgba(255,255,240,0.10)";
            c.beginPath();
            c.moveTo(x, y);
            c.lineTo(x, y + w);
            c.lineTo(x + w / 2, y + w / 2);
            c.fill();
            c.fillStyle = "rgba(0,0,0,0.28)";
            c.beginPath();
            c.moveTo(x + w, y + w);
            c.lineTo(x, y + w);
            c.lineTo(x + w / 2, y + w / 2);
            c.fill();
            c.fillStyle = "rgba(0,0,0,0.16)";
            c.beginPath();
            c.moveTo(x + w, y + w);
            c.lineTo(x + w, y);
            c.lineTo(x + w / 2, y + w / 2);
            c.fill();
          }
        }
        // grooves
        c.strokeStyle = "rgba(0,0,0,0.55)";
        c.lineWidth = 1;
        for (let i = 0; i < s * 2; i += P8 / Math.SQRT2) {
          c.beginPath();
          c.moveTo(i, 0);
          c.lineTo(i, s * 2);
          c.stroke();
          c.beginPath();
          c.moveTo(0, i);
          c.lineTo(s * 2, i);
          c.stroke();
        }
        c.restore();
        // palm-polished wear: a few flattened, shinier patches + grime in the grooves
        blotches(c, s, 6, r, "rgba(230,220,200,0.35)", 16);
        blotches(c, s, 10, r, "rgba(30,20,10,0.5)", 10);
      }),
    // hot-blued steel: blue-black base with a faint plum cast, holster wear streaks, fine polish
    // lines and a few bright scratches (edge wear itself comes from the builder's `wear` tint)
    blued: () =>
      canvasTex("wpn_blued", 256, (c, s) => {
        const r = rngFor("blued");
        noiseFill(c, s, 14, 150, 200, [0.97, 0.98, 1.03]);
        c.globalAlpha = 0.07;
        for (let y = 0; y < s; y++) {
          c.fillStyle = r() < 0.5 ? "#ffffff" : "#000010";
          c.fillRect(0, y, s, 1);
        } // polish lines
        c.globalAlpha = 1;
        blotches(c, s, 16, r, "rgba(210,214,222,0.55)", 26); // holster wear (bluing rubbed thin)
        blotches(c, s, 22, r, "rgba(40,30,45,0.9)", 14); // plum/brown patina
        blotches(c, s, 10, r, "rgba(90,60,35,0.6)", 8); // freckles of surface rust
        scratches(c, s, 140, r, "#f4f6ff", 18, 1);
        scratches(c, s, 40, r, "#101018", 10, 1);
      }),
    // tileable skin micro-detail (pores, fine lines, faint mottling) for wrists & forearm stubs
    skinPlain: () =>
      canvasTex("wpn_skin_plain", 128, (c, s) => {
        const r = rngFor("skinp");
        noiseFill(c, s, 10, 222, 244, [1, 0.97, 0.955], 3);
        c.globalAlpha = 0.3;
        blotches(c, s, 18, r, "rgba(226,150,130,0.45)", 14);
        blotches(c, s, 10, r, "rgba(200,205,225,0.3)", 12);
        c.globalAlpha = 1;
        for (let i = 0; i < 420; i++) {
          c.fillStyle = "rgba(120,70,55," + (0.05 + r() * 0.07) + ")";
          c.fillRect(r() * s, r() * s, 1, 1);
        }
        c.strokeStyle = "rgba(110,70,55,0.12)";
        c.lineWidth = 0.6;
        for (let i = 0; i < 40; i++) {
          const x = r() * s,
            y = r() * s,
            a = (r() - 0.5) * 0.6;
          c.beginPath();
          c.moveTo(x, y);
          c.lineTo(x + Math.cos(a) * 9, y + Math.sin(a) * 9);
          c.stroke();
        }
      }),
    // chipped paint over metal (legacy neutral version; paint materials now use per-colour
    // enamel textures from paintTex() below — kept for anything that asks for TEX.paint)
    paint: () =>
      canvasTex("wpn_paint", 256, (c, s) => {
        drawEnamel(c, s, "#e8e8e8", false);
      }),
    // padded suit fabric: twill weave + seams
    fabric: () =>
      canvasTex("wpn_fabric", 256, (c, s) => {
        const r = rngFor("fabric");
        noiseFill(c, s, 20, 190, 240);
        c.globalAlpha = 0.18;
        for (let y = 0; y < s; y += 2) {
          c.fillStyle = y % 4 ? "#000" : "#fff";
          c.fillRect(0, y, s, 1);
        }
        c.globalAlpha = 0.08;
        for (let x = 0; x < s; x += 3) {
          c.fillStyle = "#000";
          c.fillRect(x, 0, 1, s);
        }
        c.globalAlpha = 1;
        c.globalAlpha = 0.5;
        blotches(c, s, 10, r, "rgba(90,80,60,0.6)", 22);
        c.globalAlpha = 1; // light grime
      }),
    // skin: soft, low-contrast variation (warm/cool mottling, faint freckles and pores) — no dark spots
    skin: () =>
      canvasTex("wpn_skin", 128, (c, s) => {
        const r = rngFor("skin");
        noiseFill(c, s, 10, 226, 246, [1, 0.975, 0.965], 3);
        c.globalAlpha = 0.35;
        blotches(c, s, 22, r, "rgba(236,178,160,0.35)", 16); // warm flush
        blotches(c, s, 14, r, "rgba(214,214,226,0.25)", 14); // cooler patches
        c.globalAlpha = 1;
        // pores / fine freckles
        for (let i = 0; i < 260; i++) {
          c.fillStyle = "rgba(150,100,80," + (0.04 + r() * 0.06) + ")";
          c.fillRect(r() * s, r() * s, 1, 1);
        }
        // very light wear on the knuckle side (the hand of someone who fixes things)
        c.globalAlpha = 0.12;
        blotches(c, s, 5, r, "rgba(120,95,75,0.5)", 6);
        c.globalAlpha = 1;
      }),
    leather: () =>
      canvasTex("wpn_leather", 128, (c, s) => {
        const r = rngFor("leather");
        noiseFill(c, s, 30, 150, 215);
        scratches(c, s, 80, r, "#000", 8, 1);
      }),
    // brushed alloy (gyrojet trim, ammo cans): brushed with panel noise
    brushed: () =>
      canvasTex("wpn_brushed", 256, (c, s) => {
        const r = rngFor("brushed");
        noiseFill(c, s, 6, 185, 230);
        c.globalAlpha = 0.12;
        for (let y = 0; y < s; y++) {
          c.fillStyle = r() < 0.5 ? "#fff" : "#000";
          c.fillRect(0, y, s, 1);
        }
        c.globalAlpha = 1;
        blotches(c, s, 25, r, "rgba(60,50,35,1)", 16);
        scratches(c, s, 90, r, "#ffffff", 14, 1);
      }),
  };
  P.TEX = TEX;

  // ------------------------------------------------------------------
  // Materials — all MeshStandard with vertex colours (tints), shared.
  // Two sets: view (metallic, env-mapped) and world (less metallic so
  // they read well without an environment map).
  // ------------------------------------------------------------------
  const MAT_DEFS = {
    gunmetal: {
      color: 0x5c6066,
      metalness: 0.8,
      roughness: 0.42,
      tex: "metal",
      bump: 0.004,
    },
    darksteel: {
      color: 0x383a3e,
      metalness: 0.75,
      roughness: 0.5,
      tex: "metal",
      bump: 0.004,
    },
    steel: {
      color: 0xa4a7ac,
      metalness: 0.9,
      roughness: 0.32,
      tex: "metal",
      bump: 0.003,
    },
    chrome: { color: 0xe6e8ea, metalness: 1.0, roughness: 0.14 },
    brass: { color: 0xc9a14a, metalness: 1.0, roughness: 0.3, tex: "metal" },
    copper: { color: 0xc07448, metalness: 1.0, roughness: 0.32, tex: "metal" },
    gold: { color: 0xe0b848, metalness: 1.0, roughness: 0.22, tex: "metal" },
    wood: {
      color: 0xffffff,
      metalness: 0.0,
      roughness: 0.55,
      tex: "wood",
      bump: 0.006,
    },
    woodLight: {
      color: 0xffffff,
      metalness: 0.0,
      roughness: 0.6,
      tex: "woodLight",
      bump: 0.006,
    },
    bakelite: {
      color: 0x5a3220,
      metalness: 0.0,
      roughness: 0.38,
      tex: "grip",
      bump: 0.01,
    },
    rubber: {
      color: 0x1c1c1c,
      metalness: 0.0,
      roughness: 0.85,
      tex: "grip",
      bump: 0.012,
    },
    plastic: {
      color: 0x2a2a2a,
      metalness: 0.0,
      roughness: 0.55,
      tex: "brushed",
    },
    olive: {
      color: 0xffffff,
      metalness: 0.3,
      roughness: 0.6,
      paint: 0x5b6242,
      bump: 0.004,
    },
    tan: {
      color: 0xffffff,
      metalness: 0.25,
      roughness: 0.6,
      paint: 0xa89468,
      bump: 0.004,
    },
    red: {
      color: 0xffffff,
      metalness: 0.3,
      roughness: 0.45,
      paint: 0xa82a22,
      bump: 0.004,
    },
    yellow: {
      color: 0xffffff,
      metalness: 0.3,
      roughness: 0.45,
      paint: 0xd8b030,
      bump: 0.004,
    },
    enamelBlue: {
      color: 0xffffff,
      metalness: 0.3,
      roughness: 0.45,
      paint: 0x2c5aa0,
      bump: 0.004,
    },
    white: { color: 0xffffff, metalness: 0.2, roughness: 0.4, paint: 0xd8d6cc },
    rust: {
      color: 0xffffff,
      metalness: 0.4,
      roughness: 0.75,
      tex: "rust",
      bump: 0.008,
    },
    brushed: {
      color: 0x9aa0a6,
      metalness: 0.85,
      roughness: 0.35,
      tex: "brushed",
    },
    tape: { color: 0x8a8a82, metalness: 0.0, roughness: 0.9, tex: "fabric" },
    cloth: { color: 0x6a5a40, metalness: 0.0, roughness: 0.95, tex: "fabric" },
    leather: {
      color: 0x5a3a22,
      metalness: 0.0,
      roughness: 0.7,
      tex: "leather",
    },
    // skin: warm wrap-lit (see P.skinPatch), no emissive — the old flat emissive made the hands read as unlit plastic
    skin: {
      color: 0xc58f72,
      metalness: 0.0,
      roughness: 0.66,
      tex: "skinPlain",
      bump: 0.0025,
      skin: true,
      envK: 0.35,
    },
    blued: {
      color: 0x4a4d53,
      metalness: 0.7,
      roughness: 0.42,
      tex: "blued",
      bump: 0.003,
    }, // worn service finish: dark grey steel that still reads its machining under overcast light (0x35373c/0.82 went pitch-black on the flanks)
    gripGrey: {
      color: 0x8a8e90,
      metalness: 0.0,
      roughness: 0.42,
      tex: "grip",
      bump: 0.011,
    },
    orange: {
      color: 0xffffff,
      metalness: 0.3,
      roughness: 0.45,
      paint: 0xd8641a,
      bump: 0.004,
    },
    gripWood: {
      color: 0x8a5230,
      metalness: 0.0,
      roughness: 0.48,
      tex: "grip",
      bump: 0.011,
    },
    amberRubber: { color: 0xb57a38, metalness: 0.0, roughness: 0.42 },
    sleeve: { color: 0xb9bcb6, metalness: 0.0, roughness: 0.92, tex: "fabric" }, // Long Winter cryo-suit grey-white (matches the NPC suit)
    sleeveTrim: {
      color: 0x7b7f7c,
      metalness: 0.0,
      roughness: 0.85,
      tex: "fabric",
    }, // grey knit cuff (the orange is the collar ring only)
    lens: {
      color: 0x112018,
      metalness: 0.9,
      roughness: 0.05,
      transparent: true,
      opacity: 0.8,
    },
    glass: {
      color: 0x9fe8c0,
      metalness: 0.1,
      roughness: 0.05,
      transparent: true,
      opacity: 0.35,
    },
    // unlit glows
    glowRed: { basic: true, color: 0xff3a24 },
    glowGreen: { basic: true, color: 0x5cff6a },
    glowBlue: { basic: true, color: 0x6ad8ff },
    glowAmber: { basic: true, color: 0xffb040 },
    glowWhite: { basic: true, color: 0xfff4d0 },
  };
  P.MAT_DEFS = MAT_DEFS;

  /**
   * Skin shading for the first-person hands (MeshStandardMaterial patch):
   *  - wrap-around diffuse per colour channel (red light scatters furthest under the skin), so the
   *    terminator is soft and warm instead of the hard plastic falloff of plain Lambert;
   *  - optional per-vertex `skinfx` (x = nail mask, y = palm-side mask): nails and the paler palm /
   *    finger pads keep their own, tone-independent colour (dark skin still has pale palms & pink nails).
   * Works with MeshStandard lights (RE_Direct_Physical, three r158).
   */
  P.skinPatch = function (m, withFx) {
    m.onBeforeCompile = (sh) => {
      let lp = THREE.ShaderChunk.lights_physical_pars_fragment;
      const key =
        "reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );";
      if (lp.indexOf(key) >= 0) {
        lp = lp.replace(
          key,
          "float nlS = dot( geometryNormal, directLight.direction );\n" +
            "\tvec3 wrapS = clamp( ( vec3( nlS ) + vec3( 0.46, 0.24, 0.16 ) ) / vec3( 1.46, 1.24, 1.16 ), 0.0, 1.0 );\n" +
            "\twrapS = mix( wrapS, wrapS * wrapS * ( 3.0 - 2.0 * wrapS ), 0.5 );\n" +
            "\treflectedLight.directDiffuse += directLight.color * wrapS * BRDF_Lambert( material.diffuseColor );",
        );
        sh.fragmentShader = sh.fragmentShader.replace(
          "#include <lights_physical_pars_fragment>",
          lp,
        );
      }
      if (withFx) {
        sh.vertexShader =
          "attribute vec2 skinfx;\nvarying vec2 vSkinFx;\n" +
          sh.vertexShader.replace(
            "#include <begin_vertex>",
            "#include <begin_vertex>\n  vSkinFx = skinfx;",
          );
        sh.fragmentShader =
          "varying vec2 vSkinFx;\n" +
          sh.fragmentShader.replace(
            "#include <color_fragment>",
            "#include <color_fragment>\n" +
              "  {\n" +
              "    vec3 texL = vec3( 1.0 );\n" +
              "    #ifdef USE_MAP\n    texL = texture2D( map, vMapUv ).rgb;\n    #endif\n" +
              "    vec3 palm = diffuseColor.rgb * 0.55 + vec3( 0.30, 0.19, 0.155 ) * texL;\n" +
              "    diffuseColor.rgb = mix( diffuseColor.rgb, max( diffuseColor.rgb, palm ), vSkinFx.y * 0.7 );\n" +
              "    vec3 nail = vec3( 0.80, 0.60, 0.55 ) * texL;\n" +
              "    diffuseColor.rgb = mix( diffuseColor.rgb, nail, vSkinFx.x );\n" +
              "  }",
          );
      }
    };
    m.customProgramCacheKey = () => "wpnSkin" + (withFx ? "Fx" : "");
    return m;
  };
  const matCache = { view: {}, world: {} };
  function makeMat(name, world) {
    const d = MAT_DEFS[name] || MAT_DEFS.gunmetal;
    let m;
    if (d.basic) {
      m = new THREE.MeshBasicMaterial({
        color: d.color,
        vertexColors: true,
        toneMapped: false,
        fog: !!world,
      });
    } else {
      m = new THREE.MeshStandardMaterial({
        color: d.color,
        metalness: world ? Math.min(d.metalness, 0.45) : d.metalness,
        roughness: world ? Math.max(d.roughness, 0.45) : d.roughness,
        vertexColors: true,
        transparent: !!d.transparent,
        opacity: d.opacity || 1,
      });
      if (d.paint) {
        m.map = paintTex(name, d.paint);
        if (d.bump && !world) {
          m.bumpMap = paintBumpTex();
          m.bumpScale = d.bump;
        }
      } else if (d.tex) {
        m.map = TEX[d.tex]();
        if (d.bump && !world) {
          m.bumpMap = m.map;
          m.bumpScale = d.bump;
        }
      }
      if (d.emissive && !world) m.emissive = new THREE.Color(d.emissive);
      if (!world) {
        m.envMapIntensity = d.envK || 1.0;
        if (d.envK) m.userData.envK = d.envK;
      }
      if (d.skin && !world) P.skinPatch(m);
      if (world) m.fog = true;
    }
    m.name = "wpn_" + name + (world ? "_w" : "");
    m.userData.shared = true;
    m.userData.wpnMat = name;
    return m;
  }
  /** Material for the viewmodel layer (or world when world=true). */
  P.mat = function (name, world) {
    const set = world ? matCache.world : matCache.view;
    return set[name] || (set[name] = makeMat(name, world));
  };
  P.allViewMats = () => Object.values(matCache.view);
  /** Register a hand-made view material (so env map / light scaling reach it). */
  P.addViewMat = function (key, m) {
    matCache.view["_" + key] = m;
  };

  // ------------------------------------------------------------------
  // Material families (view layer only): kit materials sharing a texture
  // merge into one material; colour → vertex colour, roughness/metalness →
  // a per-vertex 'wrm' attribute read by a tiny onBeforeCompile patch.
  // ------------------------------------------------------------------
  const FAMILY = {
    gunmetal: "metalFam",
    darksteel: "metalFam",
    steel: "metalFam",
    brass: "metalFam",
    copper: "metalFam",
    gold: "metalFam",
    chrome: "metalFam",
    brushed: "brushedFam",
    plastic: "brushedFam",
    rubber: "gripFam",
    bakelite: "gripFam",
    gripGrey: "gripFam",
    gripWood: "gripFam",
    blued: "bluedFam",
    glowRed: "glowFam",
    glowGreen: "glowFam",
    glowBlue: "glowFam",
    glowAmber: "glowFam",
    glowWhite: "glowFam",
  };
  const FAMILY_TEX = {
    metalFam: ["metal", 0.004],
    brushedFam: ["brushed", 0],
    gripFam: ["grip", 0.011],
    bluedFam: ["blued", 0.003],
  };
  P.FAMILY = FAMILY;
  function famMat(fam) {
    const key = "_" + fam;
    if (matCache.view[key]) return matCache.view[key];
    let m;
    if (fam === "glowFam")
      m = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        vertexColors: true,
        toneMapped: false,
        fog: false,
      });
    else {
      const [tex, bump] = FAMILY_TEX[fam];
      m = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        vertexColors: true,
        roughness: 0.5,
        metalness: 0.5,
      });
      m.map = TEX[tex]();
      if (bump) {
        m.bumpMap = m.map;
        m.bumpScale = bump;
      }
      m.envMapIntensity = 1.0;
      m.onBeforeCompile = (sh) => {
        sh.vertexShader =
          "attribute vec2 wrm;\nvarying vec2 vWrm;\n" +
          sh.vertexShader.replace(
            "#include <begin_vertex>",
            "#include <begin_vertex>\n  vWrm = wrm;",
          );
        sh.fragmentShader =
          "varying vec2 vWrm;\n" +
          sh.fragmentShader
            .replace(
              "#include <roughnessmap_fragment>",
              "float roughnessFactor = vWrm.x;",
            )
            .replace(
              "#include <metalnessmap_fragment>",
              "float metalnessFactor = vWrm.y;",
            );
      };
      m.customProgramCacheKey = () => "wpnFamRM";
    }
    m.name = "wpn_" + fam;
    m.userData.shared = true;
    m.userData.wpnMat = fam;
    return (matCache.view[key] = m);
  }

  // ------------------------------------------------------------------
  // Environment map for the viewmodel scene (metals need reflections)
  // ------------------------------------------------------------------
  P.buildEnv = function () {
    if (P.envTex || !G.renderer) return P.envTex;
    try {
      const pm = new THREE.PMREMGenerator(G.renderer);
      const sc = new THREE.Scene();
      // gradient dome: warm hazy sky above, dark dusty ground below
      const dome = new THREE.Mesh(
        new THREE.SphereGeometry(10, 24, 12),
        new THREE.ShaderMaterial({
          side: THREE.BackSide,
          depthWrite: false,
          uniforms: {},
          vertexShader:
            "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }",
          fragmentShader:
            "varying vec3 vP; void main(){ float h = vP.y; vec3 sky = mix(vec3(0.55,0.56,0.45), vec3(0.85,0.82,0.66), smoothstep(0.0,0.6,h));" +
            "vec3 gnd = mix(vec3(0.26,0.24,0.2), vec3(0.4,0.37,0.31), smoothstep(-0.6,0.0,h)); gl_FragColor = vec4(h>0.0?sky:gnd, 1.0); }",
        }),
      );
      sc.add(dome);
      // bright "windows"/softboxes for specular streaks
      const lm = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const addPanel = (x, y, z, w, h, k) => {
        const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), lm.clone());
        m.material.color.setScalar(k);
        m.position.set(x, y, z);
        m.lookAt(0, 0, 0);
        sc.add(m);
      };
      addPanel(0, 7, 3, 8, 2.5, 3.5);
      addPanel(-6, 3, -4, 3, 5, 1.6);
      addPanel(6, 2, 2, 2, 5, 1.2);
      addPanel(0, 1.5, -8, 6, 1.2, 1.4);
      const rt = pm.fromScene(sc, 0.02);
      P.envTex = rt.texture;
      pm.dispose();
      sc.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
      });
    } catch (e) {
      G.reportError("weapons:env", e);
      P.envTex = null;
    }
    return P.envTex;
  };

  // ------------------------------------------------------------------
  // Geometry primitives (all return fresh BufferGeometry)
  // ------------------------------------------------------------------
  const GEO = {};
  P.GEO = GEO;
  /** Rounded/chamfered box centred at origin. r = bevel radius. */
  GEO.box = function (w, h, d, r, segs) {
    r = Math.min(
      r === undefined ? Math.min(w, h, d) * 0.12 : r,
      w / 2 - 1e-4,
      h / 2 - 1e-4,
      d / 2 - 1e-4,
    );
    if (r <= 0.0005) return new THREE.BoxGeometry(w, h, d);
    // bevel grows the outline by bs — inset the shape. Keep bs small relative to the
    // shape or ExtrudeGeometry's bevel vectors spike on thin shapes.
    const bs = Math.min(r * 0.7, Math.min(w, h) * 0.18);
    const hw = w / 2 - bs,
      hh = h / 2 - bs,
      rc = Math.min(r * 0.6, hw * 0.9, hh * 0.9);
    const sh = new THREE.Shape();
    sh.moveTo(-hw + rc, -hh);
    sh.lineTo(hw - rc, -hh);
    sh.quadraticCurveTo(hw, -hh, hw, -hh + rc);
    sh.lineTo(hw, hh - rc);
    sh.quadraticCurveTo(hw, hh, hw - rc, hh);
    sh.lineTo(-hw + rc, hh);
    sh.quadraticCurveTo(-hw, hh, -hw, hh - rc);
    sh.lineTo(-hw, -hh + rc);
    sh.quadraticCurveTo(-hw, -hh, -hw + rc, -hh);
    const g = new THREE.ExtrudeGeometry(sh, {
      depth: Math.max(1e-4, d - 2 * r),
      bevelEnabled: true,
      bevelThickness: r,
      bevelSize: bs,
      bevelSegments: segs || 1,
      curveSegments: 2,
    });
    g.translate(0, 0, -(d - 2 * r) / 2);
    return g;
  };
  /** Side-profile extrusion. pts = [[fwd, up], ...] (fwd = -Z). thickness along X, centred. */
  GEO.profile = function (pts, thickness, bevel, curveSeg, bevelSeg) {
    bevel = bevel === undefined ? Math.min(0.004, thickness * 0.2) : bevel;
    const sh = new THREE.Shape();
    pts.forEach((p, i) => (i ? sh.lineTo(p[0], p[1]) : sh.moveTo(p[0], p[1])));
    const depth = Math.max(1e-4, thickness - 2 * bevel);
    const g = new THREE.ExtrudeGeometry(sh, {
      depth,
      bevelEnabled: bevel > 0,
      bevelThickness: bevel,
      bevelSize: bevel,
      bevelSegments: bevelSeg || 1,
      curveSegments: curveSeg || 4,
    });
    g.translate(0, 0, -depth / 2);
    g.rotateY(Math.PI / 2); // shape X -> -Z (forward), extrusion -> X
    return g;
  };
  /** Profile from a THREE.Shape-building callback (for curves). */
  GEO.shapeProfile = function (build, thickness, bevel, curveSeg) {
    bevel = bevel === undefined ? Math.min(0.004, thickness * 0.2) : bevel;
    const sh = new THREE.Shape();
    build(sh);
    const depth = Math.max(1e-4, thickness - 2 * bevel);
    const g = new THREE.ExtrudeGeometry(sh, {
      depth,
      bevelEnabled: bevel > 0,
      bevelThickness: bevel,
      bevelSize: bevel,
      bevelSegments: 1,
      curveSegments: curveSeg || 8,
    });
    g.translate(0, 0, -depth / 2);
    g.rotateY(Math.PI / 2);
    return g;
  };
  /** Cylinder along Z (forward). centred on its length. */
  GEO.cyl = function (r, len, seg, r2) {
    const g = new THREE.CylinderGeometry(
      r2 === undefined ? r : r2,
      r,
      len,
      seg || 12,
      1,
    );
    g.rotateX(-Math.PI / 2); // +Y -> -Z : top (r2) faces forward
    return g;
  };
  /** Cylinder along X */
  GEO.cylX = function (r, len, seg) {
    const g = new THREE.CylinderGeometry(r, r, len, seg || 12, 1);
    g.rotateZ(Math.PI / 2);
    return g;
  };
  /** Cylinder along Y */
  GEO.cylY = function (r, len, seg, r2) {
    return new THREE.CylinderGeometry(
      r2 === undefined ? r : r2,
      r,
      len,
      seg || 12,
      1,
    );
  };
  /** Hollow tube along Z (barrel with visible bore). */
  GEO.tube = function (rOut, rIn, len, seg) {
    const pts = [
      new THREE.Vector2(rIn, len / 2),
      new THREE.Vector2(rOut, len / 2),
      new THREE.Vector2(rOut, -len / 2),
      new THREE.Vector2(rIn, -len / 2),
      new THREE.Vector2(rIn, len / 2 - 0.0001),
    ];
    const g = new THREE.LatheGeometry(pts, seg || 14);
    g.rotateX(-Math.PI / 2);
    return g;
  };
  /** Lathe along Z. pts = [[radius, fwd], ...] fwd positive = forward (-Z). */
  GEO.lathe = function (pts, seg) {
    const g = new THREE.LatheGeometry(
      pts.map((p) => new THREE.Vector2(Math.max(0, p[0]), p[1])),
      seg || 16,
    );
    g.rotateX(-Math.PI / 2);
    return g;
  };
  /** Lathe along Y (up). pts [[r,y]] */
  GEO.latheY = function (pts, seg) {
    return new THREE.LatheGeometry(
      pts.map((p) => new THREE.Vector2(Math.max(0, p[0]), p[1])),
      seg || 16,
    );
  };
  GEO.sphere = (r, ws, hs) => new THREE.SphereGeometry(r, ws || 12, hs || 8);
  GEO.torus = (R, r, rs, ts, arc) =>
    new THREE.TorusGeometry(R, r, rs || 6, ts || 16, arc || Math.PI * 2);
  GEO.capsule = (r, len, cs, rs) =>
    new THREE.CapsuleGeometry(r, len, cs || 3, rs || 8);
  /** Tube along a path of points (cables, hoses). */
  GEO.hose = function (pts, r, seg, radial) {
    const curve = new THREE.CatmullRomCurve3(
      pts.map((p) => new THREE.Vector3(p[0], p[1], p[2])),
    );
    return new THREE.TubeGeometry(curve, seg || 16, r, radial || 6, false);
  };
  /** Wedge/triangular prism etc via profile with thickness. */
  GEO.prism = (pts, thick, bevel) =>
    GEO.profile(pts, thick, bevel === undefined ? 0.0015 : bevel);
  /**
   * Loft: sweep a closed cross-section ([[x, y], ...] in the XY plane) through stations along -Z.
   * Hard-surface friendly: section corners sharper than `crease` degrees keep split normals (crisp
   * machined chamfers), gentler ones shade smooth; stations flagged `sharp` crease across the part.
   * station = {z, sx?, sy?, dx?, dy?, sharp?}: x' = x*sx + dx, y' = (y - anchorY)*sy + anchorY + dy
   * (anchorY defaults to the section's lowest point, so sy < 1 slopes the TOP down — slide noses,
   * receiver ramps). Both ends are closed with flat end plates. Used for slides, receivers and housings
   * whose cross-section is not a box (the old side-profile extrusions all read as bricks from behind).
   */
  GEO.loft = function (section, stations, o) {
    o = o || {};
    let sec = section.map((p) => [p[0], p[1]]);
    let area = 0;
    for (let i = 0; i < sec.length; i++) {
      const a = sec[i],
        b = sec[(i + 1) % sec.length];
      area += a[0] * b[1] - b[0] * a[1];
    }
    if (area < 0) sec.reverse();
    const n = sec.length,
      cos = Math.cos(
        ((o.crease === undefined ? 38 : o.crease) * Math.PI) / 180,
      );
    const anchorY =
      o.anchorY === undefined ? Math.min(...sec.map((p) => p[1])) : o.anchorY;
    // per-vertex: sharp corner?
    const sharpV = [];
    for (let i = 0; i < n; i++) {
      const a = sec[(i + n - 1) % n],
        p = sec[i],
        c = sec[(i + 1) % n];
      const e1x = p[0] - a[0],
        e1y = p[1] - a[1],
        e2x = c[0] - p[0],
        e2y = c[1] - p[1];
      const l1 = Math.hypot(e1x, e1y) || 1,
        l2 = Math.hypot(e2x, e2y) || 1;
      sharpV.push((e1x * e2x + e1y * e2y) / (l1 * l2) < cos);
    }
    // columns: side i runs from colStart[i] to colEnd[i] (= a column at vertex i+1)
    const colV = [],
      colStart = [],
      colEndAt = [];
    for (let i = 0; i < n; i++) {
      if (sharpV[i]) {
        colEndAt[i] = colV.length;
        colV.push(i);
        colStart[i] = colV.length;
        colV.push(i);
      } else {
        colEndAt[i] = colStart[i] = colV.length;
        colV.push(i);
      }
    }
    // rows
    const rows = []; // {st, k}
    const rowIn = [],
      rowOut = [];
    stations.forEach((st, k) => {
      rowIn[k] = rows.length;
      rows.push(st);
      if (st.sharp && k > 0 && k < stations.length - 1) rows.push(st);
      rowOut[k] = rows.length - 1;
    });
    const tf = (p, st) => [
      p[0] * (st.sx === undefined ? 1 : st.sx) + (st.dx || 0),
      (p[1] - anchorY) * (st.sy === undefined ? 1 : st.sy) +
        anchorY +
        (st.dy || 0),
      st.z,
    ];
    const pos = [],
      idx = [];
    const nc = colV.length;
    for (const st of rows)
      for (let c = 0; c < nc; c++) pos.push(...tf(sec[colV[c]], st));
    for (let k = 0; k < stations.length - 1; k++) {
      const r0 = rowOut[k],
        r1 = rowIn[k + 1];
      for (let i = 0; i < n; i++) {
        const a = r0 * nc + colStart[i],
          b = r0 * nc + colEndAt[(i + 1) % n];
        const c = r1 * nc + colStart[i],
          d = r1 * nc + colEndAt[(i + 1) % n];
        idx.push(a, c, b, b, c, d);
      }
    }
    // end plates (flat)
    const tri = THREE.ShapeUtils.triangulateShape(
      sec.map((p) => new THREE.Vector2(p[0], p[1])),
      [],
    );
    for (const [k, front] of [
      [0, false],
      [stations.length - 1, true],
    ]) {
      const base = pos.length / 3;
      for (const p of sec) pos.push(...tf(p, stations[k]));
      for (const t of tri) {
        if (front) idx.push(base + t[0], base + t[2], base + t[1]);
        else idx.push(base + t[0], base + t[1], base + t[2]);
      }
    }
    // everything above assumes the stations run rear → front (z decreasing); flip for the other order
    if (stations[0].z < stations[stations.length - 1].z)
      for (let i = 0; i < idx.length; i += 3) {
        const t = idx[i + 1];
        idx[i + 1] = idx[i + 2];
        idx[i + 2] = t;
      }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  };

  // ------------------------------------------------------------------
  // Builder: collects geometry + material + transform + tint, then merges
  // per material. Box-projected UVs for uniform texel density.
  // ------------------------------------------------------------------
  const _m4 = new THREE.Matrix4(),
    _q = new THREE.Quaternion(),
    _e = new THREE.Euler(),
    _v = new THREE.Vector3(),
    _s = new THREE.Vector3();
  const UV_SCALE = {
    wood: 3,
    woodLight: 2.2,
    grip: 14,
    fabric: 6,
    sleeve: 6,
    sleeveTrim: 6,
    skin: 14,
    blued: 5,
    leather: 10,
    tape: 12,
    cloth: 8,
  };

  function Builder() {
    this.items = {};
  }
  /**
   * add(geom, matName, opts) — opts: {p:[x,y,z], r:[rx,ry,rz] (XYZ euler), s:number|[x,y,z], tint:hex|[r,g,b]}
   * returns this (chainable)
   */
  Builder.prototype.add = function (geom, mat, o) {
    o = o || {};
    const g = geom.index ? geom.toNonIndexed() : geom;
    if (g !== geom) geom.dispose();
    _e.set(
      o.r ? o.r[0] : 0,
      o.r ? o.r[1] : 0,
      o.r ? o.r[2] : 0,
      o.order || "XYZ",
    );
    _q.setFromEuler(_e);
    if (o.s === undefined) _s.set(1, 1, 1);
    else if (typeof o.s === "number") _s.setScalar(o.s);
    else _s.set(o.s[0], o.s[1], o.s[2]);
    _v.set(o.p ? o.p[0] : 0, o.p ? o.p[1] : 0, o.p ? o.p[2] : 0);
    _m4.compose(_v, _q, _s);
    g.applyMatrix4(_m4);
    if (o.m) g.applyMatrix4(o.m);
    if (!g.attributes.normal) g.computeVertexNormals();
    // box-projected UVs
    const pos = g.attributes.position,
      nor = g.attributes.normal,
      n = pos.count;
    const uv = new Float32Array(n * 2);
    const k = UV_SCALE[mat] || 5;
    const ou = o.uvOff || 0;
    for (let i = 0; i < n; i++) {
      const ax = Math.abs(nor.getX(i)),
        ay = Math.abs(nor.getY(i)),
        az = Math.abs(nor.getZ(i));
      let u, v;
      if (ax >= ay && ax >= az) {
        u = pos.getZ(i);
        v = pos.getY(i);
      } else if (ay >= az) {
        u = pos.getZ(i);
        v = pos.getX(i);
      } else {
        u = pos.getX(i);
        v = pos.getY(i);
      }
      uv[i * 2] = u * k + ou;
      uv[i * 2 + 1] = v * k + ou * 0.7;
    }
    g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
    // tint as vertex colour (with optional vertical AO gradient)
    const col = new Float32Array(n * 3);
    let tr = 1,
      tg = 1,
      tb = 1;
    // tint: [r,g,b] multipliers, a scalar brightness (<= 2), or a hex colour
    if (o.tint !== undefined) {
      if (Array.isArray(o.tint)) {
        tr = o.tint[0];
        tg = o.tint[1];
        tb = o.tint[2];
      } else if (typeof o.tint === "number" && o.tint <= 2) {
        tr = tg = tb = o.tint;
      } else {
        const c = new THREE.Color(o.tint);
        tr = c.r;
        tg = c.g;
        tb = c.b;
      }
    }
    for (let i = 0; i < n; i++) {
      col[i * 3] = tr;
      col[i * 3 + 1] = tg;
      col[i * 3 + 2] = tb;
    }
    // edge wear: bevel faces (normals between the principal axes) get brighter — bluing / paint
    // rubbed off the corners first, like a real carried gun. o.wear = strength, o.wearGain = brightening.
    if (o.wear) {
      const gain = o.wearGain || 2.2;
      for (let i = 0; i < n; i++) {
        const w =
          1 -
          Math.max(
            Math.abs(nor.getX(i)),
            Math.abs(nor.getY(i)),
            Math.abs(nor.getZ(i)),
          );
        let k = Math.min(1, Math.max(0, (w - 0.05) / 0.2));
        k = k * k * (3 - 2 * k) * o.wear;
        const f = 1 + k * gain;
        col[i * 3] *= f;
        col[i * 3 + 1] *= f;
        col[i * 3 + 2] *= f * 1.04;
      }
    }
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    for (const key of Object.keys(g.attributes))
      if (!["position", "normal", "uv", "color"].includes(key))
        g.deleteAttribute(key);
    (this.items[mat] = this.items[mat] || []).push(g);
    return this;
  };
  // shorthand helpers
  Builder.prototype.box = function (mat, w, h, d, p, o) {
    return this.add(
      GEO.box(w, h, d, o && o.bevel),
      mat,
      Object.assign({ p }, o),
    );
  };
  Builder.prototype.cyl = function (mat, r, len, p, o) {
    return this.add(
      GEO.cyl(r, len, (o && o.seg) || 14, o && o.r2),
      mat,
      Object.assign({ p }, o),
    );
  };
  Builder.prototype.tube = function (mat, rO, rI, len, p, o) {
    return this.add(
      GEO.tube(rO, rI, len, (o && o.seg) || 14),
      mat,
      Object.assign({ p }, o),
    );
  };
  Builder.prototype.profile = function (mat, pts, thick, o) {
    return this.add(
      GEO.profile(pts, thick, o && o.bevel, o && o.curveSeg, o && o.bseg),
      mat,
      o,
    );
  };
  Builder.prototype.sphere = function (mat, r, p, o) {
    return this.add(
      GEO.sphere(r, (o && o.ws) || 12, (o && o.hs) || 8),
      mat,
      Object.assign({ p }, o),
    );
  };
  /** Screw/rivet heads: small flattened cylinders facing +X/-X at given points */
  Builder.prototype.rivets = function (mat, pts, r, side) {
    for (const p of pts)
      this.add(GEO.cylX(r || 0.0022, 0.0016, 6), mat, {
        p: [p[0] + (side || 0), p[1], p[2]],
      });
    return this;
  };
  Builder.prototype.isEmpty = function () {
    return Object.keys(this.items).length === 0;
  };
  /**
   * Merge into a Group. World builds: one Mesh per kit material. View builds: kit materials that
   * share a texture are folded into one "family" material (colour baked into vertex colours,
   * roughness/metalness carried per vertex — see famMat), so a part with steel + gunmetal +
   * brass + a glowing dot costs 2 draw calls instead of 4.
   */
  Builder.prototype.build = function (world) {
    world = world || !!P.buildingWorld;
    const grp = new THREE.Group();
    const fams = {};
    for (const mat of Object.keys(this.items)) {
      const fam = world ? null : FAMILY[mat];
      if (fam) {
        (fams[fam] = fams[fam] || []).push(mat);
        continue;
      }
      const geo = G.util.mergeGeometries(this.items[mat]);
      this.items[mat].forEach((g) => g.dispose());
      const mesh = new THREE.Mesh(geo, P.mat(mat, world));
      mesh.userData.wpnMat = mat;
      mesh.frustumCulled = false;
      grp.add(mesh);
    }
    for (const fam of Object.keys(fams)) {
      const list = [],
        rm = [];
      for (const mat of fams[fam]) {
        const d = MAT_DEFS[mat],
          col = new THREE.Color(d.color);
        for (const g of this.items[mat]) {
          const c = g.attributes.color,
            n = c.count;
          for (let i = 0; i < n; i++)
            c.setXYZ(
              i,
              c.getX(i) * col.r,
              c.getY(i) * col.g,
              c.getZ(i) * col.b,
            );
          list.push(g);
          rm.push([n, d.roughness || 0.5, d.metalness || 0]);
        }
      }
      const geo = G.util.mergeGeometries(list);
      list.forEach((g) => g.dispose());
      if (fam !== "glowFam") {
        const a = new Float32Array(geo.attributes.position.count * 2);
        let o = 0;
        for (const [n, r, m] of rm) {
          for (let i = 0; i < n; i++) {
            a[(o + i) * 2] = r;
            a[(o + i) * 2 + 1] = m;
          }
          o += n;
        }
        geo.setAttribute("wrm", new THREE.BufferAttribute(a, 2));
      }
      const mesh = new THREE.Mesh(geo, famMat(fam));
      mesh.userData.wpnMat = fam;
      mesh.userData.wpnMats = fams[fam];
      mesh.frustumCulled = false;
      grp.add(mesh);
    }
    this.items = {};
    return grp;
  };
  P.builder = () => new Builder();
  /**
   * Round the corners of a closed 2D polygon ([[x,y],...]) — each corner becomes a quadratic arc
   * of `seg` segments with radius r (number, or per-vertex array; 0 keeps a sharp corner).
   * Used to turn slab profiles into cast / moulded shapes instead of "boxes".
   */
  P.roundPts = function (pts, r, seg) {
    seg = seg || 3;
    const out = [],
      n = pts.length;
    for (let i = 0; i < n; i++) {
      const p = pts[i],
        a = pts[(i + n - 1) % n],
        c = pts[(i + 1) % n];
      const ri = Array.isArray(r) ? r[i] || 0 : r;
      if (!ri) {
        out.push([p[0], p[1]]);
        continue;
      }
      const la = Math.hypot(a[0] - p[0], a[1] - p[1]) || 1e-6,
        lc = Math.hypot(c[0] - p[0], c[1] - p[1]) || 1e-6;
      const ka = Math.min(ri, la * 0.45) / la,
        kc = Math.min(ri, lc * 0.45) / lc;
      const p0 = [p[0] + (a[0] - p[0]) * ka, p[1] + (a[1] - p[1]) * ka],
        p2 = [p[0] + (c[0] - p[0]) * kc, p[1] + (c[1] - p[1]) * kc];
      for (let s = 0; s <= seg; s++) {
        const t = s / seg,
          u = 1 - t;
        out.push([
          u * u * p0[0] + 2 * u * t * p[0] + t * t * p2[0],
          u * u * p0[1] + 2 * u * t * p[1] + t * t * p2[1],
        ]);
      }
    }
    return out;
  };
  /** Ensure a geometry has a (white or tinted) vertex colour attribute — all kit materials use vertexColors. */
  P.paintGeo = function (geo, tint) {
    if (geo.attributes.color) return geo;
    const n = geo.attributes.position.count,
      a = new Float32Array(n * 3);
    const c =
      typeof tint === "number" && tint <= 2
        ? new THREE.Color(tint, tint, tint)
        : new THREE.Color(tint === undefined ? 0xffffff : tint);
    for (let i = 0; i < n; i++) {
      a[i * 3] = c.r;
      a[i * 3 + 1] = c.g;
      a[i * 3 + 2] = c.b;
    }
    geo.setAttribute("color", new THREE.BufferAttribute(a, 3));
    return geo;
  };
  /** Mesh with a kit material (adds vertex colours). */
  P.mesh = function (geo, matName, tint) {
    const m = new THREE.Mesh(
      P.paintGeo(geo, tint),
      typeof matName === "string" ? P.mat(matName) : matName,
    );
    m.frustumCulled = false;
    return m;
  };
  P.MODELS = P.MODELS || {};

  /** Create a named socket (empty Object3D) under parent. */
  P.socket = function (parent, name, p, r) {
    const o = new THREE.Object3D();
    o.name = name;
    if (p) o.position.set(p[0], p[1], p[2]);
    if (r) o.rotation.set(r[0], r[1], r[2]);
    parent.add(o);
    return o;
  };
  /** Wrap a built Group as an animatable part with a pivot. */
  P.part = function (parent, builder, pivot, name) {
    const g = new THREE.Group();
    g.name = name || "part";
    if (pivot) g.position.set(pivot[0], pivot[1], pivot[2]);
    const inner = builder.build();
    if (pivot) inner.position.set(-pivot[0], -pivot[1], -pivot[2]);
    g.add(inner);
    g.userData.rest = { p: g.position.clone(), q: g.quaternion.clone() };
    parent.add(g);
    return g;
  };

  // ------------------------------------------------------------------
  // Reusable weapon components (called by the model files)
  // ------------------------------------------------------------------
  const C = (P.COMP = {});
  /** Barrel with muzzle crown and bore. from z0 (back) to z1 (front, more negative). */
  C.barrel = function (b, mat, r, z0, z1, y, o) {
    o = o || {};
    const len = z0 - z1,
      mid = (z0 + z1) / 2;
    b.tube(mat, r, r * (o.bore || 0.55), len, [o.x || 0, y, mid], {
      seg: o.seg || 14,
    });
    if (o.crown !== false)
      b.tube(
        mat,
        r * 1.12,
        r * (o.bore || 0.55),
        Math.min(0.012, len * 0.1),
        [o.x || 0, y, z1 + 0.006],
        { seg: o.seg || 14, tint: 0.85 },
      );
    return b;
  };
  /** Classic front sight post + rear notch on top of a surface at height y */
  C.ironSights = function (b, mat, yTop, zRear, zFront, o) {
    o = o || {};
    const h = o.h || 0.012;
    b.box(mat, 0.003, h, 0.006, [0, yTop + h / 2, zFront], { bevel: 0.0008 });
    b.box(mat, 0.009, 0.005, 0.006, [0, yTop + 0.0025, zFront], {
      bevel: 0.001,
    });
    // rear notch: two ears
    b.box(mat, 0.005, h * 0.9, 0.006, [-0.0045, yTop + h * 0.45, zRear], {
      bevel: 0.0008,
    });
    b.box(mat, 0.005, h * 0.9, 0.006, [0.0045, yTop + h * 0.45, zRear], {
      bevel: 0.0008,
    });
    b.box(mat, 0.016, h * 0.35, 0.008, [0, yTop + h * 0.17, zRear], {
      bevel: 0.001,
    });
  };
  /** Telescopic scope along Z centred at (0,y,zc). Returns eye z (rear lens). */
  C.scope = function (b, y, zc, len, r, o) {
    o = o || {};
    const m = o.mat || "darksteel";
    b.cyl(m, r, len * 0.55, [0, y, zc], { seg: 18 });
    // objective bell
    b.add(
      GEO.lathe(
        [
          [r, 0],
          [r * 1.55, 0.05],
          [r * 1.6, 0.11],
          [r * 1.35, 0.115],
        ],
        20,
      ),
      m,
      { p: [0, y, zc - len * 0.27] },
    );
    // ocular bell
    b.add(
      GEO.lathe(
        [
          [r * 1.4, -0.09],
          [r * 1.45, -0.02],
          [r, 0.0],
        ],
        20,
      ),
      m,
      { p: [0, y, zc + len * 0.27] },
    );
    // turrets
    b.cyl(m, r * 0.55, r * 0.9, [0, y + r * 1.1, zc], {
      r: [Math.PI / 2, 0, 0],
      seg: 12,
    });
    b.cyl(m, r * 0.55, r * 0.9, [r * 1.1, y, zc], {
      r: [0, Math.PI / 2, 0],
      seg: 12,
    });
    b.add(GEO.cylY(r * 0.62, 0.006, 12), "steel", { p: [0, y + r * 1.58, zc] });
    // rings & mounts
    for (const dz of [-len * 0.18, len * 0.14]) {
      b.add(GEO.torus(r * 1.05, r * 0.14, 6, 18), "steel", {
        p: [0, y, zc + dz],
      });
      b.box(
        "darksteel",
        r * 1.2,
        y - (o.mountY || 0) - r,
        0.016,
        [0, (y - r + (o.mountY || 0)) / 2, zc + dz],
        { bevel: 0.002 },
      );
    }
    // lenses
    b.add(new THREE.CircleGeometry(r * 1.45, 18), "lens", {
      p: [0, y, zc - len * 0.27 - 0.112],
    });
    b.add(new THREE.CircleGeometry(r * 1.3, 18), "lens", {
      p: [0, y, zc + len * 0.27 + 0.089],
      r: [0, Math.PI, 0],
    });
    return zc + len * 0.27 + 0.09;
  };
  /** Magazine (box, optionally curved) as its own builder; top at y=0, front edge at z=0 */
  C.boxMag = function (mat, w, h, d, curve, o) {
    o = o || {};
    const b = P.builder();
    const pts = [];
    const n = 6;
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      pts.push([-t * t * curve, -t * h]);
    }
    const outline = [];
    for (const p of pts) outline.push([p[0], p[1]]);
    for (let i = pts.length - 1; i >= 0; i--)
      outline.push([pts[i][0] - d, pts[i][1]]);
    b.profile(mat, outline, w, { bevel: 0.0015 });
    // base plate
    const last = pts[pts.length - 1];
    b.box(
      o.plate || mat,
      w * 1.15,
      0.008,
      d * 1.1,
      [0, last[1] - 0.003, last[0] - d / 2],
      { bevel: 0.002, tint: 0.8 },
    );
    // top cartridge
    if (o.round)
      b.add(GEO.cyl(0.0045, d * 0.8, 8), o.round, { p: [0, 0.004, -d / 2] });
    return b;
  };
})();
