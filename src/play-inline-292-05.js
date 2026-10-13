// play-inline-292 05 — fillstyle
// Lines 945-1205 of readable/play-inline-292.pretty.js (statement-aligned).
  function mosaicDraw(c, w, h) {
    const r = rnd("mosaic");
    c.fillStyle = "#d8ccb4";
    c.fillRect(0, 0, w, h);
    // the medallion is centred on the tile CORNERS (drawn 4×, wrapped) so it lands on world multiples of the tile size
    for (const [cx, cy] of [
      [0, 0],
      [w, 0],
      [0, h],
      [w, h],
    ]) {
      const rings = [
        [250, "#6a2a1e"],
        [232, "#d8ccb4"],
        [212, "#2a4a3a"],
        [160, "#d8ccb4"],
        [140, "#8a6a3a"],
        [64, "#d8ccb4"],
        [42, "#6a2a1e"],
      ];
      for (const [rr, col] of rings) {
        c.fillStyle = col;
        c.beginPath();
        c.arc(cx, cy, rr, 0, TAU);
        c.fill();
      }
      c.strokeStyle = "#2a1e14";
      c.lineWidth = 3;
      for (let k = 0; k < 16; k++) {
        const a = (k / 16) * TAU;
        c.beginPath();
        c.moveTo(cx + Math.cos(a) * 64, cy + Math.sin(a) * 64);
        c.lineTo(cx + Math.cos(a) * 160, cy + Math.sin(a) * 160);
        c.stroke();
      }
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * TAU + 0.2;
        c.fillStyle = "#c8a050";
        c.beginPath();
        c.arc(cx + Math.cos(a) * 186, cy + Math.sin(a) * 186, 12, 0, TAU);
        c.fill();
      }
    }
    for (let i = 0; i < 6000; i++) {
      c.fillStyle = "rgba(0,0,0," + r() * 0.12 + ")";
      c.fillRect(
        Math.floor((r() * w) / 6) * 6,
        Math.floor((r() * h) / 6) * 6,
        5,
        5,
      );
    }
    grime(c, w, h, r, 0.8);
  }
  /** Rose-and-gold hotel carpet. */
  function carpetDraw(c, w, h) {
    const r = rnd("carpet");
    c.fillStyle = "#5a1a20";
    c.fillRect(0, 0, w, h);
    for (let j = 0; j < 4; j++)
      for (let i = 0; i < 4; i++) {
        const cx = ((i + 0.5) * w) / 4,
          cy = ((j + 0.5) * h) / 4;
        c.strokeStyle = "#a07a3a";
        c.lineWidth = 3;
        c.beginPath();
        c.moveTo(cx, cy - 40);
        c.lineTo(cx + 40, cy);
        c.lineTo(cx, cy + 40);
        c.lineTo(cx - 40, cy);
        c.closePath();
        c.stroke();
        c.fillStyle = "#7a2a2a";
        c.beginPath();
        c.arc(cx, cy, 16, 0, TAU);
        c.fill();
        c.fillStyle = "#b89050";
        c.beginPath();
        c.arc(cx, cy, 5, 0, TAU);
        c.fill();
      }
    for (let i = 0; i < 3000; i++) {
      c.fillStyle = "rgba(0,0,0," + r() * 0.15 + ")";
      c.fillRect(r() * w, r() * h, 2, 2);
    }
    grime(c, w, h, r, 1.2);
  }
  /** White gallery plaster with faint hanging-hook holes and a scuffed skirting. */
  function galleryDraw(c, w, h) {
    const r = rnd("gallery");
    c.fillStyle = "#e6e2d8";
    c.fillRect(0, 0, w, h);
    for (let i = 0; i < 90; i++) {
      c.fillStyle =
        r() < 0.5 ? "rgba(255,255,250,0.05)" : "rgba(120,110,90,0.05)";
      c.beginPath();
      c.ellipse(r() * w, r() * h, 20 + r() * 60, 10 + r() * 30, 0, 0, TAU);
      c.fill();
    }
    for (let i = 0; i < 12; i++) {
      c.fillStyle = "rgba(60,50,40,0.5)";
      c.fillRect(r() * w, r() * h, 2, 2);
    }
    PM.weatherPass(c, w, h, r, {
      blotches: 30,
      dark: 0.08,
      streaks: 10,
      streak: 0.05,
      specks: 300,
      speckR: 1,
    });
  }
  /** Pale oak gallery floorboards. */
  function oakFloorDraw(c, w, h) {
    const r = rnd("oakfloor");
    const n = 8,
      bh = h / n;
    for (let i = 0; i < n; i++) {
      let x = -r() * 200;
      while (x < w) {
        const len = 120 + r() * 200,
          tone = 150 + r() * 30;
        c.fillStyle =
          "rgb(" +
          ((tone + 20) | 0) +
          "," +
          ((tone - 10) | 0) +
          "," +
          ((tone - 55) | 0) +
          ")";
        c.fillRect(x, i * bh, len, bh);
        for (let k = 0; k < 8; k++) {
          c.fillStyle = "rgba(80,50,20," + r() * 0.12 + ")";
          c.fillRect(x, i * bh + r() * bh, len, 1);
        }
        c.fillStyle = "rgba(40,24,10,0.6)";
        c.fillRect(x, i * bh, 2, bh);
        x += len;
      }
      c.fillStyle = "rgba(40,24,10,0.55)";
      c.fillRect(0, i * bh, w, 2);
    }
    PM.weatherPass(c, w, h, r, {
      blotches: 50,
      dark: 0.16,
      streaks: 0,
      specks: 800,
    });
  }
  /** Milky Thermolux glass panels (MoMA 1939 facade): 512² = 2 × 2 panes. */
  function thermoluxDraw(c, w, h) {
    const r = rnd("thermolux");
    for (let i = 0; i < 4; i++)
      for (let j = 0; j < 4; j++) {
        const x0 = (i * w) / 4,
          y0 = (j * h) / 4,
          s = w / 4;
        const broken =
          (i === 1 && j === 2) || (i === 3 && j === 0) || r() < 0.03;
        const g = c.createLinearGradient(0, y0, 0, y0 + s);
        if (broken) {
          g.addColorStop(0, "#1a1c1a");
          g.addColorStop(1, "#0c0d0c");
        } else {
          g.addColorStop(0, "#d8d8cc");
          g.addColorStop(1, "#b8b8ac");
        }
        c.fillStyle = g;
        c.fillRect(x0, y0, s, s);
        if (!broken) {
          for (let k = 0; k < 40; k++) {
            c.fillStyle = "rgba(90,80,60," + r() * 0.08 + ")";
            c.fillRect(x0 + r() * s, y0, 2 + r() * 6, s);
          }
          c.fillStyle = "rgba(80,70,50,0.25)";
          c.fillRect(x0, y0 + s * 0.85, s, s * 0.15);
          if (r() < 0.25) {
            c.strokeStyle = "rgba(40,40,40,0.6)";
            c.lineWidth = 1;
            const cx = x0 + r() * s,
              cy = y0 + r() * s;
            for (let k = 0; k < 7; k++) {
              c.beginPath();
              c.moveTo(cx, cy);
              const a = r() * TAU;
              c.lineTo(cx + Math.cos(a) * 30, cy + Math.sin(a) * 30);
              c.stroke();
            }
          }
        } else {
          c.fillStyle = "#b8b8ac";
          for (let k = 0; k < 3; k++) {
            const e = r() < 0.5;
            c.beginPath();
            c.moveTo(e ? x0 : x0 + s, y0 + r() * s);
            c.lineTo(x0 + s * (0.2 + r() * 0.6), y0 + r() * s);
            c.lineTo(e ? x0 : x0 + s, y0 + r() * s);
            c.fill();
          }
        }
        c.fillStyle = "#2a2c2a";
        c.fillRect(x0, y0, s, 3);
        c.fillRect(x0, y0, 3, s);
      }
  }
  Object.assign(PM.CUSTOM_TEX, {
    books_warm: [512, 512, booksDraw("warm")],
    books_dark: [512, 512, booksDraw("dark")],
    oak_panel: [512, 512, panelDraw(0x6a4424)],
    walnut_panel: [512, 512, panelDraw(0x4a2c18)],
    damask: [512, 512, damaskDraw],
    mosaic: [512, 512, mosaicDraw],
    rose_carpet: [512, 512, carpetDraw],
    gallery_plaster: [256, 256, galleryDraw],
    oak_floor: [512, 512, oakFloorDraw],
    thermolux: [512, 512, thermoluxDraw],
    moma_marble: [
      512,
      512,
      PM.ashlarDraw({
        base: 0xe8e4da,
        rows: 5,
        cols: 2,
        joint: 2,
        jointCol: 0xb8b2a4,
        vary: 0.04,
        seed: 41,
        weather: { blotches: 60, dark: 0.16, streaks: 60, streak: 0.12 },
      }),
    ],
    pink_marble: [
      512,
      512,
      PM.ashlarDraw({
        base: 0xe0cfc0,
        rows: 6,
        cols: 2,
        joint: 1.5,
        jointCol: 0xb8a898,
        vary: 0.05,
        seed: 43,
        chips: 0.08,
        weather: { blotches: 50, dark: 0.14, streaks: 50, streak: 0.1 },
      }),
    ],
    alg_brick: [
      512,
      512,
      PM.ashlarDraw({
        base: 0x7e3a2a,
        rows: 16,
        cols: 6,
        joint: 3,
        jointCol: 0x6a6258,
        vary: 0.2,
        seed: 47,
        chips: 0.1,
        weather: { blotches: 60, dark: 0.2, streaks: 40 },
      }),
    ],
  });
