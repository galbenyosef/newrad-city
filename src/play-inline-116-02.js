// play-inline-116 02 — fillstyle
// Lines 25-299 of readable/play-inline-116.pretty.js (statement-aligned).
  const K = G.LMA.kit;
  const U = G.util;

  // ------------------------------------------------------------------
  // Polygon helpers
  // ------------------------------------------------------------------
  function clipX(poly, c, keepLess) {
    const out = [];
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i],
        b = poly[(i + 1) % poly.length];
      const ina = keepLess ? a[0] <= c : a[0] >= c,
        inb = keepLess ? b[0] <= c : b[0] >= c;
      if (ina) out.push(a);
      if (ina !== inb) {
        const t = (c - a[0]) / (b[0] - a[0]);
        out.push([c, a[1] + (b[1] - a[1]) * t]);
      }
    }
    return out;
  }

  function textures() {
    const pal = [
      ["fac_ts_a", "#8e5a44", true],
      ["fac_ts_b", "#b8a58a", false],
      ["fac_ts_c", "#6e6a64", true],
      ["fac_ts_d", "#a47a5a", true],
    ];
    pal.forEach((p, i) =>
      K.facade(p[0], {
        bays: 6,
        floors: 8,
        bayW: 2.8,
        floorH: 3.4,
        wall: p[1],
        brick: p[2],
        glass: "#222828",
        frame: "#3a3834",
        win: { x0: 0.22, x1: 0.78, y0: 0.22, y1: 0.8 },
        broken: 0.3,
        boarded: 0.12,
        lit: 0.04,
        litColor: "#ffb870",
        sill: K.shadeHex(p[1], 1.3),
        lintel: true,
        mullions: 1,
        seed: 4200 + i,
      }),
    );
    // Animated jumbotron: 2×2 frames in one canvas; offset switches frames
    const S = 1024,
      c = K.canvas(512, 512),
      x = c.getContext("2d");
    x.scale(0.5, 0.5);
    const H = S / 2;
    // frame 0 (top-left): the Civil Defense emergency slate, frozen since the Bombing
    x.save();
    x.translate(0, 0);
    x.fillStyle = "#e8e4d8";
    x.fillRect(0, 0, H, H);
    x.strokeStyle = "#1a2a4a";
    x.lineWidth = 14;
    x.beginPath();
    x.arc(H / 2, H * 0.4, H * 0.27, 0, 7);
    x.stroke();
    x.fillStyle = "#c81e1e";
    x.beginPath();
    x.moveTo(H / 2, H * 0.2);
    x.lineTo(H / 2 + H * 0.2, H * 0.53);
    x.lineTo(H / 2 - H * 0.2, H * 0.53);
    x.closePath();
    x.fill();
    x.fillStyle = "#ffffff";
    x.font = 'bold 58px "Arial Black", sans-serif';
    x.textAlign = "center";
    x.textBaseline = "middle";
    x.fillText("CD", H / 2, H * 0.43);
    x.fillStyle = "#1a2a4a";
    x.font = 'bold 38px "Arial Black", sans-serif';
    x.fillText("EMERGENCY ALERT", H / 2, H * 0.78);
    x.font = "bold 30px monospace";
    x.fillText("TUNE TO 640 · 1240 AM", H / 2, H * 0.9);
    x.restore();
    // frame 1 (top-right): colour bars test card
    const bars = [
      "#c0c0c0",
      "#c0c000",
      "#00c0c0",
      "#00c000",
      "#c000c0",
      "#c00000",
      "#0000c0",
    ];
    bars.forEach((col, i) => {
      x.fillStyle = col;
      x.fillRect(H + (i * H) / 7, 0, H / 7 + 1, H * 0.7);
    });
    x.fillStyle = "#111";
    x.fillRect(H, H * 0.7, H, H * 0.3);
    x.fillStyle = "#eee";
    x.font = "bold 40px monospace";
    x.textAlign = "center";
    x.fillText("WNYC-TV  SIGNAL LOST", H * 1.5, H * 0.86);
    // frame 2 (bottom-left): Fizzo Cola ad
    K.drawBrand(x, H, H, "fizzo_cola", 3);
    x.save();
    x.translate(0, H);
    K.drawBrand(x, H, H, "fizzo_cola", 3);
    x.restore();
    // frame 3 (bottom-right): The Neon welcome crawl
    x.fillStyle = "#0a0a12";
    x.fillRect(H, H, H, H);
    x.fillStyle = "#7aff9a";
    x.font = 'bold 64px "Arial Black", sans-serif';
    x.fillText("THE NEON", H * 1.5, H * 1.3);
    x.font = "bold 30px monospace";
    x.fillStyle = "#ffd86a";
    [
      "ALL FOLKS WELCOME",
      "NO CENSUS · NO CARDS",
      "SCRIP · MEDS · SHOWS",
      "NO MANIACS PAST THE GATE",
    ].forEach((t, i) => x.fillText(t, H * 1.5, H * 1.52 + i * 44, H - 24));
    // scanlines
    x.fillStyle = "rgba(0,0,0,0.22)";
    for (let y = 0; y < S; y += 4) x.fillRect(0, y, S, 2);
    const tex = K.texFromCanvas(c, { clamp: true });
    tex.repeat.set(0.5, 0.5);
    K.defineMat("ts_screen", {
      basic: true,
      map: tex,
      color: 0xffffff,
      toneMapped: false,
      noShadow: true,
    });
    K.tsScreenTex = tex;
    // painted signs
    K.paint("ts_cityhall", 512, 128, (x2, W, H2) =>
      K.signText(x2, W, H2, "CITY HALL", {
        bg: "#2a3a2a",
        fg: "#e8e0b0",
        border: "#c8b060",
        size: 70,
      }),
    );
    K.paint("ts_clinic", 512, 128, (x2, W, H2) =>
      K.signText(x2, W, H2, "DOC'S RAD CLINIC", {
        bg: "#e8e4d8",
        fg: "#a01a1a",
        size: 60,
      }),
    );
    K.paint("ts_times", 1024, 128, (x2, W, H2) =>
      K.signText(x2, W, H2, "TIMES  SQUARE", {
        bg: "#1a1a1a",
        fg: "#f0e8c8",
        size: 90,
        spacing: 10,
        border: "#8a7a50",
      }),
    );
    // neon glyphs
    const n = (k, t, col, o) => K.neon(k, t, col, o);
    n("ts_theneon", "THE NEON", 0x5aff7a, {
      font: 'bold 96px "Arial Black", Impact, sans-serif',
      h: 150,
      border: true,
    });
    n("ts_welcome", "WELCOME TO THE NEON", 0xff5ab4, {
      font: 'bold 64px "Arial Black", sans-serif',
      h: 110,
    });
    n("ts_radroom", "THE RAD ROOM", 0x6ac8ff, {
      font: "italic bold 70px Georgia, serif",
      h: 110,
    });
    n("ts_open", "OPEN 24 HRS", 0xff4040, { h: 100, border: true });
    n("ts_scrip", "SCRIP 4 SCRAP", 0xffd040, { h: 100 });
    n("ts_eats", "EATS", 0xff7a30, { h: 100, border: true });
    n("ts_chems", "PILLS", 0xc070ff, { h: 100 });
    n("ts_cityhall_n", "CITY HALL", 0x80ffb0, { h: 100 });
    n("ts_fizzo", "Fizzo Cola", 0xff3030, {
      font: "italic bold 80px Georgia, serif",
      h: 120,
    });
    n("ts_hioctane", "HI-OCTANE HARRY'S", 0x4aa0ff, { h: 110, border: true });
    n("ts_shows", "SHOWS TONITE", 0xff3a3a, { h: 100, border: true });
    n("ts_comeback", "COME BACK ALIVE", 0xff5ab4, {
      font: 'bold 64px "Arial Black", sans-serif',
      h: 110,
    });
    n("ts_crossroads", "CROSSROADS OF THE WORLD", 0xffd040, {
      font: 'bold 60px "Arial Black", sans-serif',
      h: 104,
    });
    // vertical blade signs (letters stacked)
    const blade = (k, text, col) =>
      K.neonDraw(k, 120, 90 * text.length + 40, (x2, W, H2) => {
        const cc = K.hex(col);
        x2.strokeStyle = cc;
        x2.lineWidth = 5;
        x2.shadowColor = cc;
        x2.shadowBlur = 16;
        x2.strokeRect(8, 8, W - 16, H2 - 16);
        x2.font = 'bold 76px "Arial Black", Impact, sans-serif';
        x2.textAlign = "center";
        x2.textBaseline = "middle";
        for (let i = 0; i < text.length; i++) {
          x2.fillStyle = cc;
          x2.shadowBlur = 20;
          x2.fillText(text[i], W / 2, 60 + i * 90);
          x2.shadowBlur = 0;
          x2.fillStyle = "rgba(255,255,240,0.7)";
          x2.fillText(text[i], W / 2, 60 + i * 90);
        }
      });
    blade("ts_b_hotel", "HOTEL", 0xff4a4a);
    blade("ts_b_atomic", "ATOMIC", 0x4affc8);
    blade("ts_b_bar", "BAR", 0xffc040);
    blade("ts_b_live", "LIVE", 0xff5ae0);
    blade("ts_b_broadway", "BROADWAY", 0xffe070);
    blade("ts_b_eats", "EATS", 0x60c0ff);
    blade("ts_b_girls", "GIRLS", 0xff6ab0);
    blade("ts_b_dance", "DANCE", 0x9a7aff);
    blade("ts_b_chems", "DRUGS", 0x7aff6a);
    // hand-painted shop boards (bright enough to read by day, when the neon is weak)
    const board = (k, t, bg, fg, o) =>
      K.paint(k, 512, 128, (x2, W, H2) => {
        K.signText(
          x2,
          W,
          H2,
          t,
          Object.assign({ bg, fg, size: 64, border: fg }, o || {}),
        );
        K.stains(x2, W, H2, 7, k.length * 31, 0.35);
        K.grain(x2, W, H2, 16, k.length * 17);
      });
    board("ts_p_guns", "GUNS & AMMO", "#b0261c", "#f4d34a");
    board("ts_p_meat", "FRESH MEAT", "#e8e2cc", "#1e4a8a");
    board("ts_p_repair", "REPAIRS", "#e0b21e", "#1a1a1a", { size: 72 });
    board("ts_p_noodles", "NOODLES", "#c81e1e", "#fff2d0", { size: 78 });
    board("ts_p_hair", "HAIRCUTS 2 SCRIP", "#2a6a4a", "#f0ead0", { size: 54 });
    board("ts_p_rads", "IODINE * PRUSSIAN BLUE", "#f0ead8", "#2a5a8a", {
      size: 38,
    });
    // striped canvas awnings (3 colourways)
    [
      ["ts_awn_r", "#b8221a", "#ece2c8"],
      ["ts_awn_g", "#2a7a4a", "#e8dcc0"],
      ["ts_awn_b", "#1e4a8a", "#f0d24a"],
    ].forEach((q, i) =>
      K.paint(q[0], 128, 128, (x2, W, H2) => {
        for (let k = 0; k < 8; k++) {
          x2.fillStyle = k % 2 ? q[2] : q[1];
          x2.fillRect(k * 16, 0, 16, H2);
        }
        K.stains(x2, W, H2, 8, 900 + i, 0.4);
        K.grain(x2, W, H2, 16, 910 + i);
        x2.globalCompositeOperation = "destination-out";
        const r = K.rng(920 + i);
        for (let k = 0; k < 4; k++) {
          x2.beginPath();
          const tx = r() * W;
          x2.moveTo(tx, H2);
          x2.lineTo(tx + (r() - 0.5) * 30, H2 * (0.6 + r() * 0.3));
          x2.lineTo(tx + 10 + r() * 14, H2);
          x2.fill();
        }
        x2.globalCompositeOperation = "source-over";
      }),
    );
  }

