// play-inline-108 02 — font
// Lines 18-342 of readable/play-inline-108.pretty.js (statement-aligned).
  const K = G.LMA.kit;

  K.storyInit = function () {
    if (K.atlases.story) return;
    const at = (K.atlases.story = new K.Atlas("story", 1024, null, 1024));
    K.defineMat("storyp", {
      map: at.tex,
      color: 0xffffff,
      rough: 0.85,
      alphaTest: 0.4,
      side: THREE.DoubleSide,
    });
    K.defineMat("storyg", {
      map: at.tex,
      color: 0xffffff,
      rough: 0.7,
      alphaTest: 0.4,
      side: THREE.DoubleSide,
      emissiveMap: at.tex,
      emissiveColor: 0xffe2b0,
      emissiveIntensity: 0.55,
    });
  };
  /** Painted slot in the story atlas → uv rect. draw(ctx, w, h); clear background unless the draw fills it. */
  K.storyPaint = function (key, w, h, draw) {
    K.storyInit();
    const at = K.atlases.story;
    return (
      at.slots[key] ||
      at.alloc(key, w, h, (x, W, H) => {
        x.clearRect(0, 0, W, H);
        draw(x, W, H);
      })
    ).rect;
  };

  // ------------------------------------------------------------------
  // Drawing helpers
  // ------------------------------------------------------------------
  /** Nicole's twelve-ray sun as a hand-drawn mark (chalk, pencil, paint): ring + twelve straight strokes. */
  K.handSun = function (x, cx, cy, s, col, lw, seed) {
    const r = K.rng(seed || 12);
    x.save();
    x.translate(cx, cy);
    x.strokeStyle = col;
    x.lineCap = "round";
    x.lineWidth = lw || s * 0.06;
    x.beginPath();
    for (let a = 0; a <= Math.PI * 2 + 0.2; a += 0.25) {
      const rr = s * 0.36 * (1 + (r() - 0.5) * 0.06);
      x.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
    }
    x.stroke();
    for (let i = 0; i < 12; i++) {
      const a = (i * Math.PI) / 6 + (r() - 0.5) * 0.06,
        r0 = s * 0.47,
        r1 = s * (0.86 + (r() - 0.5) * 0.1);
      x.beginPath();
      x.moveTo(Math.cos(a) * r0, Math.sin(a) * r0);
      x.lineTo(Math.cos(a) * r1, Math.sin(a) * r1);
      x.stroke();
    }
    x.restore();
  };
  /** Chalk texture: break a stroked canvas region up with speckle so it reads as chalk on stone. */
  K.chalkify = function (x, W, H, seed) {
    const r = K.rng(seed || 7);
    x.save();
    x.globalCompositeOperation = "destination-out";
    for (let i = 0; i < (W * H) / 60; i++) {
      x.fillStyle = "rgba(0,0,0," + (0.25 + r() * 0.6) + ")";
      x.fillRect(r() * W, r() * H, 1 + r() * 2, 1 + r() * 2);
    }
    x.restore();
  };
  /** Stencilled sign text (centred lines). */
  K.storyText = function (x, W, H, lines, o) {
    o = o || {};
    x.save();
    x.fillStyle = o.fg || "#1a1a1a";
    x.textAlign = "center";
    x.textBaseline = "middle";
    const n = lines.length,
      lh = o.lh || H / (n + 1);
    lines.forEach((l, i) => {
      const t = typeof l === "string" ? { t: l } : l;
      x.font =
        t.font ||
        o.font ||
        "bold " + Math.round(lh * 0.62) + 'px "Courier New", monospace';
      x.fillStyle = t.fg || o.fg || "#1a1a1a";
      x.fillText(
        t.t,
        W / 2,
        (o.top || (H - lh * n) / 2) + lh * (i + 0.5),
        W - 16,
      );
    });
    x.restore();
  };

  // ------------------------------------------------------------------
  // The story paints (allocated lazily by the builders that use them)
  // ------------------------------------------------------------------
  K.storyPaints = {
    /** Guastavino herringbone terracotta tile (the Whispering Gallery vault). */
    gc_tile() {
      return K.storyPaint("gc_tile", 256, 256, (x, W, H) => {
        x.fillStyle = "#a8805a";
        x.fillRect(0, 0, W, H);
        const r = K.rng(1913),
          tw = 32,
          th = 12;
        for (let row = -2; row < 24; row++)
          for (let col = -2; col < 12; col++) {
            const ox = col * tw + (row % 2) * th,
              oy = row * th;
            x.save();
            x.translate(ox, oy);
            x.rotate((row + col) % 2 ? Math.PI / 4 : -Math.PI / 4);
            const v = (150 + r() * 40) | 0;
            x.fillStyle =
              "rgb(" + (v + 40) + "," + (v - 5) + "," + (v - 50) + ")";
            x.fillRect(-tw / 2 + 1, -th / 2 + 1, tw - 2, th - 2);
            x.restore();
          }
        K.stains(x, W, H, 6, 1914, 0.35, "40,30,20");
        K.grain(x, W, H, 14, 1915);
      });
    },
    gc_whisper_plaque() {
      return K.storyPaint("gc_whisper_plaque", 384, 192, (x, W, H) => {
        x.fillStyle = "#6a4a22";
        x.fillRect(0, 0, W, H);
        x.strokeStyle = "#c8a050";
        x.lineWidth = 6;
        x.strokeRect(8, 8, W - 16, H - 16);
        K.storyText(
          x,
          W,
          H,
          [
            {
              t: "THE WHISPERING GALLERY",
              font: "bold 28px Georgia, serif",
              fg: "#e8c878",
            },
            {
              t: "Speak softly into one corner of the arch.",
              font: "italic 18px Georgia, serif",
              fg: "#e0c890",
            },
            {
              t: "You will be heard in the opposite corner.",
              font: "italic 18px Georgia, serif",
              fg: "#e0c890",
            },
            {
              t: "NEW YORK CENTRAL SYSTEM · 1913",
              font: "bold 14px Georgia, serif",
              fg: "#b89050",
            },
          ],
          { lh: 38 },
        );
        K.stains(x, W, H, 4, 77, 0.4, "20,40,30");
      });
    },
    /** Chalk twelve-ray sun with a little wax-drip shine (transparent background). */
    chalk_sun() {
      return K.storyPaint("chalk_sun", 192, 192, (x, W, H) => {
        K.handSun(x, W / 2, H / 2, W * 0.5, "rgba(236,232,220,0.92)", 6, 61);
        K.chalkify(x, W, H, 62);
      });
    },
    /** A wall of candle-soot and old wax runs (transparent; behind the grate). */
    soot() {
      return K.storyPaint("soot", 256, 256, (x, W, H) => {
        const r = K.rng(1968);
        for (let i = 0; i < 40; i++) {
          const cx = r() * W,
            g = x.createRadialGradient(cx, H, 4, cx, H * 0.4, 90 + r() * 60);
          g.addColorStop(0, "rgba(10,8,6,0.55)");
          g.addColorStop(1, "rgba(10,8,6,0)");
          x.fillStyle = g;
          x.fillRect(0, 0, W, H);
        }
        for (let i = 0; i < 70; i++) {
          const cx = r() * W,
            cy = H * (0.45 + r() * 0.5),
            l = 10 + r() * 60;
          x.fillStyle = "rgba(232,224,200," + (0.5 + r() * 0.4) + ")";
          x.fillRect(cx, cy, 2 + r() * 3, l);
          x.beginPath();
          x.arc(cx + 2, cy + l, 3, 0, 7);
          x.fill();
        }
      });
    },
    gc_ocd_order() {
      return K.storyPaint("gc_ocd_order", 384, 256, (x, W, H) => {
        x.fillStyle = "#d8d0b4";
        x.fillRect(0, 0, W, H);
        x.strokeStyle = "#1a1a1a";
        x.lineWidth = 5;
        x.strokeRect(10, 10, W - 20, H - 20);
        K.storyText(
          x,
          W,
          H,
          [
            {
              t: "LOWER LEVEL CLOSED",
              font: 'bold 34px "Courier New", monospace',
            },
            {
              t: "BY ORDER OF THE O.C.D.",
              font: 'bold 24px "Courier New", monospace',
            },
            {
              t: "RELIEF STATION RIOT",
              font: 'bold 22px "Courier New", monospace',
              fg: "#8a1a14",
            },
            {
              t: "5 MARCH 1968",
              font: 'bold 22px "Courier New", monospace',
              fg: "#8a1a14",
            },
            {
              t: "NO ADMITTANCE · NO CANDLES",
              font: 'bold 16px "Courier New", monospace',
            },
          ],
          { lh: 44 },
        );
        K.stains(x, W, H, 10, 1968, 0.5, "60,40,20");
        K.grain(x, W, H, 16, 1969);
      });
    },
    gc_lower_sign() {
      return K.storyPaint("gc_lower_sign", 384, 96, (x, W, H) => {
        x.fillStyle = "#1a1a1a";
        x.fillRect(0, 0, W, H);
        x.strokeStyle = "#8a7a50";
        x.lineWidth = 4;
        x.strokeRect(5, 5, W - 10, H - 10);
        K.storyText(x, W, H, [
          {
            t: "LOWER LEVEL  ▼  SUBURBAN TRAINS",
            font: "bold 26px Georgia, serif",
            fg: "#d8d0b0",
          },
        ]);
      });
    },
    /** St. Patrick's Kindling Garden: the board at the gate. */
    kg_board() {
      return K.storyPaint("kg_board", 384, 256, (x, W, H) => {
        x.fillStyle = "#3a2a1a";
        x.fillRect(0, 0, W, H);
        x.strokeStyle = "#c8901a";
        x.lineWidth = 6;
        x.strokeRect(8, 8, W - 16, H - 16);
        K.sunDisc(x, W / 2, 62, 40, "#d8a030", 4);
        K.storyText(
          x,
          W,
          H,
          [
            {
              t: "THE KINDLING GARDEN",
              font: "bold 30px Georgia, serif",
              fg: "#f0d090",
            },
            {
              t: "The old name is laid beneath a stone.",
              font: "italic 18px Georgia, serif",
              fg: "#e8d0a0",
            },
            {
              t: "Walk softly. They are only sleeping.",
              font: "italic 18px Georgia, serif",
              fg: "#e8d0a0",
            },
          ],
          { top: 120, lh: 38 },
        );
      });
    },
    /** An inscribed stone face: lines of capitals cut into grey granite (transparent margin = stone edge). */
    kg_stone(key, lines, seed) {
      return K.storyPaint("kg_" + key, 192, 128, (x, W, H) => {
        x.fillStyle = "#7a7670";
        x.fillRect(0, 0, W, H);
        K.grain(x, W, H, 22, seed || 3);
        K.stains(x, W, H, 5, (seed || 3) + 1, 0.35, "30,34,26");
        x.save();
        x.textAlign = "center";
        x.textBaseline = "middle";
        const lh = H / (lines.length + 1.4);
        lines.forEach((l, i) => {
          const y = lh * (i + 1);
          x.font =
            (i === 0 ? "bold " : "") +
            Math.round(lh * (i === 0 ? 0.58 : 0.46)) +
            "px Georgia, serif";
          x.fillStyle = "rgba(30,28,24,0.85)";
          x.fillText(l, W / 2 + 1, y + 1, W - 12);
          x.fillStyle = "rgba(200,196,186,0.55)";
          x.fillText(l, W / 2 - 0.5, y - 0.5, W - 12);
        });
        x.restore();
        K.handSun(
          x,
          W / 2,
          H - lh * 0.55,
          lh * 0.9,
          "rgba(40,36,30,0.8)",
          2,
          seed,
        );
      });
    },
  };
