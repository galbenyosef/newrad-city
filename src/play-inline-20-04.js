// play-inline-20 04 — ctx
// Lines 1180-1509 of readable/play-inline-20.pretty.js (statement-aligned).
  decal("kindling_stone", 512, (ctx, s, r) => {
    ctx.fillStyle = "#7d7a72";
    X.rrect(ctx, s * 0.12, s * 0.08, s * 0.76, s * 0.86, s * 0.08);
    ctx.fill();
    X.speckle(ctx, s, s, r, {
      count: 3000,
      colors: ["#5a5852", "#9a978e", "#6e6b63"],
      min: 0.5,
      max: 2,
      alpha: 0.6,
    });
    ctx.save();
    ctx.globalCompositeOperation = "destination-in";
    ctx.fillStyle = "#000";
    X.rrect(ctx, s * 0.12, s * 0.08, s * 0.76, s * 0.86, s * 0.08);
    ctx.fill();
    ctx.restore();
    const carve = (t, y, sz) => {
      X.text(ctx, t, s / 2 + 1.5, y + 1.5, {
        font: "copper",
        size: sz,
        color: "rgba(220,216,206,0.5)",
        maxW: s * 0.66,
      });
      X.text(ctx, t, s / 2, y, {
        font: "copper",
        size: sz,
        color: "rgba(36,34,30,0.85)",
        maxW: s * 0.66,
      });
    };
    sunRays(ctx, s / 2, s * 0.25, s * 0.1, "rgba(36,34,30,0.8)", s * 0.012, r, {
      wobble: 0.02,
    });
    carve("NICOLE MEAD", s * 0.46, s * 0.085);
    carve("KINDLED", s * 0.58, s * 0.07);
    carve("5 III 1968", s * 0.7, s * 0.07);
    X.blotches(ctx, s, s, r, {
      count: 6,
      color: "#3a4a1e",
      alpha: 0.25,
      rmin: s * 0.03,
      rmax: s * 0.1,
    });
  });
  decal("pod7_scrap", 256, (ctx, s, r) => {
    ctx.save();
    ctx.translate(s / 2, s / 2);
    ctx.rotate(-0.12);
    ctx.fillStyle = "#e8dfc4";
    X.blobPath(ctx, 0, 0, s * 0.36, r, 9, 0.3);
    ctx.fill();
    X.text(ctx, "pod 7", 0, 0, {
      font: "script",
      size: s * 0.2,
      weight: "normal",
      color: "rgba(36,52,120,0.9)",
      noSafe: true,
    });
    ctx.restore();
    ctx.fillStyle = "rgba(200,180,120,0.35)";
    X.smoothBlob(ctx, s * 0.6, s * 0.6, s * 0.1, s * 0.06, r, 10, 0.4);
    ctx.fill(); // wax spot
  });
  decal("sirocco_stencil", 512, (ctx, s, r) => {
    X.text(ctx, "SIROCCO 2", s / 2, s * 0.38, {
      font: "stencil",
      size: s * 0.16,
      color: "rgba(30,30,28,0.88)",
      maxW: s * 0.92,
    });
    X.text(ctx, "N° 0141 · 1967", s / 2, s * 0.56, {
      font: "stencil",
      size: s * 0.07,
      color: "rgba(30,30,28,0.8)",
      maxW: s * 0.9,
    });
    for (let k = 0; k < 8; k++) {
      ctx.fillStyle = k % 2 ? "rgba(30,30,28,0.85)" : "rgba(220,170,30,0.85)";
      ctx.beginPath();
      const x = s * 0.06 + k * s * 0.11;
      ctx.moveTo(x, s * 0.7);
      ctx.lineTo(x + s * 0.11, s * 0.7);
      ctx.lineTo(x + s * 0.06, s * 0.8);
      ctx.lineTo(x - s * 0.05, s * 0.8);
      ctx.closePath();
      ctx.fill();
    }
    X.blotches(ctx, s, s, r, {
      count: 8,
      color: "#5a3a14",
      alpha: 0.3,
      rmin: s * 0.03,
      rmax: s * 0.1,
    });
  });
  decal("track61_stencil", 512, (ctx, s, r) => {
    X.text(ctx, "TRACK 61", s / 2, s * 0.24, {
      font: "stencil",
      size: s * 0.17,
      color: "rgba(240,236,224,0.9)",
      maxW: s * 0.9,
    });
    X.text(ctx, "NO ADMITTANCE", s / 2, s * 0.44, {
      font: "stencil",
      size: s * 0.09,
      color: "rgba(210,50,30,0.9)",
      maxW: s * 0.9,
    });
    X.text(ctx, "O.C.D. 1968", s / 2, s * 0.58, {
      font: "stencil",
      size: s * 0.07,
      color: "rgba(240,236,224,0.85)",
      maxW: s * 0.9,
    });
    for (const [x, y, z] of [
      [0.2, 0.8, 0.09],
      [0.5, 0.84, 0.07],
      [0.8, 0.78, 0.1],
    ])
      sunRays(ctx, s * x, s * y, s * z, "rgba(236,234,226,0.8)", s * 0.008, r, {
        wobble: 0.1,
      });
  });
  /** Opal-glass four-face clock face (Grand Central's information booth). hands: [h, m] or none. */
  function clockFace(ctx, s, r, hands) {
    const c = s / 2;
    const g = ctx.createRadialGradient(c, c * 0.9, s * 0.05, c, c, s * 0.48);
    g.addColorStop(0, "#fff6e0");
    g.addColorStop(1, "#e8dcc0");
    ctx.fillStyle = "#8a6a2a";
    ctx.beginPath();
    ctx.arc(c, c, s * 0.49, 0, TAU);
    ctx.fill();
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(c, c, s * 0.45, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = "#2a2018";
    for (let i = 0; i < 60; i++) {
      const a = (i / 60) * TAU,
        big = i % 5 === 0;
      ctx.lineWidth = big ? s * 0.012 : s * 0.004;
      ctx.beginPath();
      ctx.moveTo(
        c + Math.cos(a) * s * (big ? 0.36 : 0.4),
        c + Math.sin(a) * s * (big ? 0.36 : 0.4),
      );
      ctx.lineTo(c + Math.cos(a) * s * 0.43, c + Math.sin(a) * s * 0.43);
      ctx.stroke();
    }
    for (let n = 1; n <= 12; n++) {
      const a = (n / 12) * TAU - Math.PI / 2;
      X.text(
        ctx,
        String(n),
        c + Math.cos(a) * s * 0.3,
        c + Math.sin(a) * s * 0.3,
        { font: "serif", size: s * 0.07, color: "#2a2018", noSafe: true },
      );
    }
    if (hands) {
      const hand = (frac, len, w) => {
        const a = frac * TAU - Math.PI / 2;
        ctx.strokeStyle = "#1a1410";
        ctx.lineWidth = w;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(c - Math.cos(a) * len * 0.15, c - Math.sin(a) * len * 0.15);
        ctx.lineTo(c + Math.cos(a) * len, c + Math.sin(a) * len);
        ctx.stroke();
      };
      hand(((hands[0] % 12) + hands[1] / 60) / 12, s * 0.22, s * 0.025);
      hand(hands[1] / 60, s * 0.34, s * 0.016);
      ctx.fillStyle = "#1a1410";
      ctx.beginPath();
      ctx.arc(c, c, s * 0.02, 0, TAU);
      ctx.fill();
    }
    X.blotches(ctx, s, s, r, {
      count: 5,
      color: "#5a4020",
      alpha: 0.15,
      rmin: s * 0.05,
      rmax: s * 0.15,
    });
  }
  decal("clock_face", 512, (ctx, s, r) => clockFace(ctx, s, r, null));
  decal("clock_face_0931", 512, (ctx, s, r) => clockFace(ctx, s, r, [9, 31]));
  decal("clock_face_0947", 512, (ctx, s, r) => clockFace(ctx, s, r, [9, 47]));
  decal("record_label_two_bits", 256, (ctx, s, r) => {
    const c = s / 2;
    ctx.fillStyle = "#111";
    ctx.beginPath();
    ctx.arc(c, c, s * 0.5, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = "rgba(80,80,80,0.5)";
    ctx.lineWidth = 1;
    for (let k = 0; k < 30; k++) {
      ctx.beginPath();
      ctx.arc(c, c, s * (0.22 + k * 0.009), 0, TAU);
      ctx.stroke();
    }
    ctx.fillStyle = "#b8231c";
    ctx.beginPath();
    ctx.arc(c, c, s * 0.2, 0, TAU);
    ctx.fill();
    X.text(ctx, "LINDALE", c, c - s * 0.12, {
      font: "deco",
      size: s * 0.045,
      color: "#f4e8c8",
      noSafe: true,
    });
    X.text(ctx, "TWO BITS AND A KISS", c, c + s * 0.07, {
      font: "condensed",
      size: s * 0.045,
      color: "#f4e8c8",
      maxW: s * 0.34,
      noSafe: true,
    });
    X.text(ctx, "Ruby Castellano", c, c + s * 0.12, {
      font: "serif",
      size: s * 0.035,
      italic: true,
      color: "#f4e8c8",
      maxW: s * 0.3,
      noSafe: true,
    });
    ctx.fillStyle = "#222";
    ctx.beginPath();
    ctx.arc(c, c, s * 0.03, 0, TAU);
    ctx.fill();
  });

  // ------------------------------------------------------------------
  // SURFACES (tileable)
  // ------------------------------------------------------------------
  /** Limestone ledges and floor of the Hall of Candles: wax pooled and dripped, soot, grit. */
  X.def("candle_stone", {
    w: 512,
    meters: 3,
    normal: 1.6,
    rough: 0.8,
    desc: "stone ledges / floor thick with candle wax and soot",
    gen(ctx, w, h, r, hc) {
      X.paintSurface && X.GEN.stone_limestone
        ? ctx.drawImage(
            X.paintSurface("stone_limestone", X.GEN.stone_limestone).c,
            0,
            0,
            w,
            h,
          )
        : ((ctx.fillStyle = "#b8b09a"), ctx.fillRect(0, 0, w, h));
      X.blotches(ctx, w, h, r, {
        count: 16,
        color: "#1a140e",
        alpha: 0.35,
        rmin: w * 0.04,
        rmax: w * 0.16,
      });
      const cols = ["#efe4c8", "#e2cc96", "#f6efe0", "#c8341e"];
      for (let k = 0; k < 70; k++) {
        const x = r() * w,
          y = r() * h,
          rad = 4 + Math.pow(r(), 2) * 40,
          col = cols[(r() * (r() < 0.1 ? 4 : 3)) | 0];
        X.wrap(w, h, x, y, rad * 1.3, (xx, yy) => {
          ctx.fillStyle = X.css(col, 0.95);
          X.smoothBlob(ctx, xx, yy, rad, rad * (0.6 + r() * 0.4), r, 10, 0.5);
          ctx.fill();
          if (hc) {
            hc.fillStyle = "#9a9a9a";
            X.smoothBlob(hc, xx, yy, rad, rad * 0.8, r, 10, 0.5);
            hc.fill();
          }
        });
      }
      X.speckle(ctx, w, h, r, {
        count: 1500,
        colors: ["#2a2218", "#d8ccb0"],
        min: 0.4,
        max: 1.4,
        alpha: 0.5,
      });
    },
  });
  /** A vault blackened by decades of candle smoke (walls / arched ceilings). */
  X.def("soot_vault", {
    w: 512,
    meters: 4,
    normal: 1.4,
    rough: 0.92,
    desc: "brick/stone vault blackened by candle smoke",
    gen(ctx, w, h, r, hc) {
      X.paintSurface && X.GEN.stone_limestone
        ? ctx.drawImage(
            X.paintSurface("stone_limestone", X.GEN.stone_limestone).c,
            0,
            0,
            w,
            h,
          )
        : ((ctx.fillStyle = "#9a9282"), ctx.fillRect(0, 0, w, h));
      ctx.fillStyle = "rgba(16,12,8,0.62)";
      ctx.fillRect(0, 0, w, h);
      X.blotches(ctx, w, h, r, {
        count: 30,
        color: "#060402",
        alpha: 0.5,
        rmin: w * 0.05,
        rmax: w * 0.22,
      });
      X.streaks(ctx, w, h, r, {
        count: 24,
        color: "#5a4a30",
        alpha: 0.12,
        maxLen: h * 0.5,
        maxW: 10,
      });
      X.speckle(ctx, w, h, r, {
        count: 800,
        colors: ["#8a7a5a", "#000000"],
        min: 0.4,
        max: 1.2,
        alpha: 0.35,
      });
    },
  });
  /** The Second Sun's casing: pale grey-green paint over steel, panel seams, rivets, chips (stencil with decal sirocco_stencil). */
