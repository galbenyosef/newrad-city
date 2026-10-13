// play-inline-107 05 — fillstyle
// Lines 1349-1689 of readable/play-inline-107.pretty.js (statement-aligned).
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
