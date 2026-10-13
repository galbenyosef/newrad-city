// play-inline-585 04 — rect
// Lines 649-1045 of readable/play-inline-585.pretty.js (statement-aligned).
  function buildDecalAtlas() {
    const S = 2048,
      c = K.canvas(S, S),
      x = c.getContext("2d");
    x.clearRect(0, 0, S, S);
    const R = K.decalRects;
    const rect = (name, px, py, w, h) => {
      R[name] = [px / S, 1 - (py + h) / S, (px + w) / S, 1 - py / S];
      return [px, py, w, h];
    };
    // painted twelve-ray suns (gold, faded) 512² each
    let [px, py, w, h] = rect("sun_gold", 0, 0, 512, 512);
    K.drawSun(x, px + 256, py + 256, 240, {
      color: "rgba(214,164,64,0.95)",
      ring: "rgba(120,80,20,0.6)",
    });
    [px, py, w, h] = rect("sun_white", 512, 0, 512, 512);
    K.drawSun(x, px + 256, py + 256, 236, { color: "rgba(236,228,206,0.9)" });
    [px, py, w, h] = rect("sun_soot", 1024, 0, 512, 512);
    K.drawSun(x, px + 256, py + 256, 236, { color: "rgba(28,22,16,0.8)" });
    // banner cloth: ochre with a sun (used on hanging banners)
    [px, py, w, h] = rect("banner", 1536, 0, 256, 512);
    x.fillStyle = "#9a7434";
    x.fillRect(px, py, w, h);
    const bg = x.createLinearGradient(px, 0, px + w, 0);
    bg.addColorStop(0, "rgba(0,0,0,0.35)");
    bg.addColorStop(0.5, "rgba(0,0,0,0)");
    bg.addColorStop(1, "rgba(0,0,0,0.35)");
    x.fillStyle = bg;
    x.fillRect(px, py, w, h);
    K.drawSun(x, px + 128, py + 190, 100, { color: "#e8d6a0" });
    x.fillStyle = "#e8d6a0";
    x.fillRect(px + 20, py + 340, w - 40, 6);
    x.fillRect(px + 20, py + 360, w - 40, 3);
    K.stencilText(x, "THE SUN", px + 128, py + 400, 30, "#e8d6a0", {
      font: "Georgia, serif",
      weight: "700",
    });
    K.stencilText(x, "DOES NOT CHOOSE", px + 128, py + 436, 22, "#e8d6a0", {
      font: "Georgia, serif",
      weight: "700",
      maxW: 220,
    });
    for (let i = 0; i < 9; i++) {
      x.beginPath();
      x.moveTo(px + i * 30, py + h);
      x.lineTo(px + i * 30 + 15, py + h - 26);
      x.lineTo(px + i * 30 + 30, py + h);
      x.fillStyle = "rgba(0,0,0,1)";
      x.globalCompositeOperation = "destination-out";
      x.fill();
      x.globalCompositeOperation = "source-over";
    }
    // stencils
    const stencil = (name, py2, text, size, col, opts) => {
      const r = rect(name, 0, py2, 1024, 128);
      K.stencilText(
        x,
        text,
        r[0] + 512,
        r[1] + 64,
        size,
        col,
        Object.assign(
          { stencilBreaks: true, spacing: 6, maxW: 980 },
          opts || {},
        ),
      );
    };
    stencil("sirocco", 512, "SIROCCO 2", 96, "rgba(30,30,30,0.92)");
    stencil("track61", 640, "TRACK 61", 92, "rgba(230,226,214,0.9)");
    stencil("m42", 768, "M 42", 110, "rgba(230,214,170,0.92)");
    stencil(
      "nyc_sys",
      896,
      "NEW YORK CENTRAL SYSTEM",
      60,
      "rgba(225,220,205,0.85)",
    );
    stencil(
      "authorized",
      1024,
      "SUBSTATION  AUTHORIZED PERSONNEL ONLY",
      44,
      "rgba(225,200,90,0.9)",
    );
    stencil(
      "armored",
      1152,
      "ARMORED CAR U.S. No. 1",
      70,
      "rgba(225,222,205,0.85)",
    );
    stencil("t61_hatch", 1280, "T-61  BULKHEAD", 80, "rgba(238,200,80,0.9)");
    stencil("m61", 1408, "M-61  FREIGHT", 86, "rgba(238,200,80,0.9)");
    stencil("bigbuzz", 1536, "BIG BUZZ No. 2", 80, "rgba(240,240,232,0.92)");
    stencil("breaker", 1664, "M42  MAIN BREAKER", 76, "rgba(240,210,80,0.92)");
    stencil("danger", 1792, "DANGER  600 VOLTS DC", 70, "rgba(200,40,30,0.92)");
    stencil(
      "handcar",
      1920,
      "PARK AVE TUNNEL  SPUR 4",
      64,
      "rgba(230,226,214,0.85)",
    );
    // painted creed (gold brush lettering)
    [px, py, w, h] = rect("creed", 1024, 512, 1024, 128);
    K.stencilText(
      x,
      "SOMEBODY HAS TO KEEP THE LIGHT ON",
      px + 512,
      py + 64,
      54,
      "rgba(222,176,82,0.9)",
      { font: "Georgia, serif", maxW: 990 },
    );
    [px, py, w, h] = rect("creed2", 1024, 640, 1024, 128);
    K.stencilText(
      x,
      "NINETY DAYS OF WINTER, AND THEN THE SPRING",
      px + 512,
      py + 64,
      46,
      "rgba(222,176,82,0.88)",
      { font: "Georgia, serif", maxW: 990 },
    );
    [px, py, w, h] = rect("creed3", 1024, 768, 1024, 128);
    K.stencilText(
      x,
      "A DIMANCHE",
      px + 512,
      py + 64,
      80,
      "rgba(222,176,82,0.9)",
      { font: "Georgia, serif", spacing: 14 },
    );
    // chalked names (the Hall of Candles walls): 1024 x 640, several columns of names in white chalk
    [px, py, w, h] = rect("names", 1024, 896, 1024, 640);
    const FIRST = [
      "ANNA",
      "JOSEPH",
      "MARIA",
      "SAM",
      "RUTH",
      "LEO",
      "ROSA",
      "FRANK",
      "IDA",
      "TOMMY",
      "HELEN",
      "MOSES",
      "GRACE",
      "VITO",
      "ESTHER",
      "WALT",
      "MAE",
      "ABE",
      "LUCY",
      "OTTO",
      "NORA",
      "ELI",
      "BETTY",
      "GUS",
      "FAY",
      "CARMEN",
      "IRVING",
      "DOT",
      "MILO",
      "JUNE",
      "PETE",
      "HATTIE",
      "SAUL",
      "VERA",
      "NICK",
      "PEARL",
      "HUGH",
      "TESS",
      "MANNY",
      "BEA",
      "OSCAR",
      "LILA",
    ];
    const LAST = [
      "KOWALSKI",
      "O'BRIEN",
      "RUIZ",
      "GOLDBERG",
      "MORETTI",
      "JACKSON",
      "NOVAK",
      "BRENNAN",
      "CHAN",
      "SCHMIDT",
      "OKAFOR",
      "DELUCA",
      "WALSH",
      "ROSEN",
      "PEREZ",
      "KIM",
      "FINN",
      "BRADY",
      "HALLORAN",
      "VOSS",
      "TATE",
      "MENDEZ",
      "LEVY",
      "COHEN",
      "RYAN",
      "BAKER",
      "SILVA",
      "MURPHY",
      "LANG",
      "PRICE",
    ];
    const rr = K.rng(1967);
    x.save();
    x.beginPath();
    x.rect(px, py, w, h);
    x.clip();
    for (let col = 0; col < 5; col++)
      for (let row = 0; row < 26; row++) {
        const t =
          FIRST[Math.floor(rr() * FIRST.length)] +
          " " +
          LAST[Math.floor(rr() * LAST.length)];
        x.save();
        x.translate(
          px + 20 + col * 200 + rr() * 10,
          py + 18 + row * 24 + rr() * 4,
        );
        x.rotate((rr() - 0.5) * 0.06);
        x.font =
          (rr() < 0.5 ? "italic " : "") +
          (14 + Math.floor(rr() * 5)) +
          'px "Comic Sans MS", "Bradley Hand", cursive';
        x.fillStyle = "rgba(232,230,220," + (0.45 + rr() * 0.45) + ")";
        x.fillText(t, 0, 0);
        x.restore();
      }
    x.restore();
    // label cards / scraps (paper, 256x128 each) along the bottom rows
    const paper = (name, ox, oy, lines, opts) => {
      const r = rect(name, ox, oy, 256, 128);
      opts = opts || {};
      if (opts.bg !== "rgba(0,0,0,0)") {
        x.fillStyle = opts.bg || "#e6dcc0";
        x.fillRect(r[0] + 8, r[1] + 8, 240, 112);
        x.strokeStyle = "rgba(80,60,30,0.4)";
        x.lineWidth = 2;
        x.strokeRect(r[0] + 8, r[1] + 8, 240, 112);
      }
      lines.forEach((ln, i) =>
        K.stencilText(
          x,
          ln,
          r[0] + 128,
          r[1] + 40 + i * 32,
          opts.size || 26,
          opts.ink || "rgba(40,30,20,0.92)",
          {
            font: opts.font || "Georgia, serif",
            weight: opts.weight || "400",
            maxW: 228,
          },
        ),
      );
    };
    // (free slots: x 1792..2048 × y 0..512 beside the banner, and x 1024..1536 × y 1792..2048)
    paper("eleven", 1792, 0, [
      "THE ELEVEN",
      "5 MARCH 1968",
      "we keep the light on",
    ]);
    paper("pod7", 1792, 128, ["pod 7"], {
      font: '"Bradley Hand", "Comic Sans MS", cursive',
      size: 54,
      bg: "#ece2c6",
    });
    paper("r_label", 1792, 256, ["R."], {
      font: "Georgia, serif",
      size: 70,
      bg: "#e0d2b0",
    });
    paper(
      "record",
      1792,
      384,
      ["TWO BITS AND A KISS", "Ruby Castellano", "45 RPM"],
      { size: 22, bg: "#c84a3a", ink: "rgba(250,236,210,0.95)" },
    );
    paper(
      "schematic",
      1024,
      1792,
      ["KEYWAY B  BYPASS", "bore 11/16  depth 2 1/4", "Sunday by 9:47  T."],
      { size: 20, bg: "#c8d4dc", ink: "rgba(20,40,90,0.9)" },
    );
    paper(
      "ledger",
      1280,
      1792,
      ["ALTAR LEDGER", "when the list returns", "the Sun will rise"],
      { size: 20 },
    );
    paper("roses_chalk", 1024, 1920, ["F"], {
      bg: "rgba(0,0,0,0)",
      ink: "rgba(235,235,225,0.8)",
      size: 80,
      font: '"Comic Sans MS", cursive',
    });
    // Rose's chalk spark beside her 'F' (a few strokes)
    {
      const r = K.decalRects.roses_chalk;
      const bx = r[0] * S + 170,
        by = (1 - r[3]) * S + 60;
      x.strokeStyle = "rgba(235,235,225,0.8)";
      x.lineWidth = 4;
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        x.beginPath();
        x.moveTo(bx + Math.cos(a) * 8, by + Math.sin(a) * 8);
        x.lineTo(bx + Math.cos(a) * 24, by + Math.sin(a) * 24);
        x.stroke();
      }
    }
    // grime blob (soot / water stain), 256²
    [px, py, w, h] = rect("soot", 1024, 1536, 256, 256);
    {
      const g = x.createRadialGradient(
        px + 128,
        py + 128,
        0,
        px + 128,
        py + 128,
        128,
      );
      g.addColorStop(0, "rgba(10,8,6,0.75)");
      g.addColorStop(0.6, "rgba(10,8,6,0.35)");
      g.addColorStop(1, "rgba(10,8,6,0)");
      x.fillStyle = g;
      x.fillRect(px, py, w, h);
    }
    [px, py, w, h] = rect("wax_pool", 1280, 1536, 256, 256);
    {
      const r2 = K.rng(77);
      for (let i = 0; i < 14; i++) {
        const gx = px + 128 + (r2() - 0.5) * 140,
          gy = py + 128 + (r2() - 0.5) * 140,
          rad = 18 + r2() * 46;
        const g = x.createRadialGradient(gx, gy, 0, gx, gy, rad);
        g.addColorStop(0, "rgba(236,224,196,0.95)");
        g.addColorStop(0.8, "rgba(226,212,180,0.85)");
        g.addColorStop(1, "rgba(226,212,180,0)");
        x.fillStyle = g;
        x.beginPath();
        x.arc(gx, gy, rad, 0, Math.PI * 2);
        x.fill();
      }
    }
    // ring marks of the pod-7 candle (wax rings), 256x512 strip
    [px, py, w, h] = rect("rings", 1536, 1536, 256, 512);
    x.fillStyle = "#efe4c8";
    x.fillRect(px + 40, py, 176, h);
    for (let i = 0; i < 22; i++) {
      const yy = py + 16 + i * 22;
      x.fillStyle = "rgba(150,110,60,0.55)";
      x.fillRect(px + 40, yy, 176, 3);
      K.stencilText(
        x,
        String(1967 + i),
        px + 128,
        yy + 11,
        12,
        "rgba(110,80,40,0.7)",
        { font: "Georgia, serif" },
      );
    }
    // gilt sun mask face (round, 256²)
    [px, py, w, h] = rect("mask", 1792, 1536, 256, 256);
    K.drawSun(x, px + 128, py + 128, 124, { color: "#d9ad4c", disc: 0.55 });
    x.fillStyle = "rgba(20,14,6,1)";
    x.globalCompositeOperation = "destination-out";
    x.beginPath();
    x.ellipse(px + 104, py + 118, 13, 7, 0, 0, Math.PI * 2);
    x.fill();
    x.beginPath();
    x.ellipse(px + 152, py + 118, 13, 7, 0, 0, Math.PI * 2);
    x.fill();
    x.globalCompositeOperation = "source-over";
    x.strokeStyle = "rgba(120,80,20,0.7)";
    x.lineWidth = 3;
    x.beginPath();
    x.arc(px + 128, py + 150, 18, 0.2, Math.PI - 0.2);
    x.stroke();
    return K.texFromCanvas(c, { clamp: true });
  }
  /** The Sun Room ceiling: a soot-dark plaster vault with a vast faded twelve-ray sun, gold leaf flaking. */
