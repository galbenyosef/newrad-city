// play-inline-490 02 — blotches
// Lines 196-440 of readable/play-inline-490.pretty.js (statement-aligned).
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
