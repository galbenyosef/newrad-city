// play-inline-11 05 — ctx
// Lines 1200-1546 of readable/play-inline-11.pretty.js (statement-aligned).
  def("granite", {
    roughVar: 0.3,
    meters: 3,
    normal: 2,
    rough: 0.7,
    desc: "speckled grey-pink granite blocks",
    gen: ashlarGen(
      [
        [0, "#6f6a66"],
        [0.5, "#8a8480"],
        [1, "#9f978f"],
      ],
      4,
      2,
      2,
      111,
      {
        count: 9000,
        colors: ["#1f1d1c", "#d8d4ce", "#9a7068", "#4a4644"],
        min: 0.4,
        max: 1.6,
        alpha: 0.75,
      },
    ),
  });
  def("stone_brownstone", {
    meters: 3,
    normal: 2.4,
    rough: 0.9,
    desc: "reddish-brown sandstone, flaking",
    gen(ctx, w, h, r, hc) {
      ashlarGen(
        [
          [0, "#4a3026"],
          [0.5, "#5e3d2f"],
          [1, "#735040"],
        ],
        5,
        2,
        1.5,
        121,
        {
          count: 2000,
          colors: ["#3a2218", "#8a6450"],
          min: 0.3,
          max: 1.4,
          alpha: 0.5,
        },
      )(ctx, w, h, r, hc);
      // spalling: lighter flaked patches
      for (let k = 0; k < 14; k++) {
        const x = r() * w,
          y = r() * h,
          s = 6 + r() * 22;
        X.wrap(w, h, x, y, s, (cx, cy) => {
          X.blobPath(ctx, cx, cy, s, r, 11, 0.6);
          ctx.fillStyle = X.css("#8a6250", 0.55);
          ctx.fill();
          ctx.strokeStyle = "rgba(30,18,12,0.5)";
          ctx.lineWidth = 1;
          ctx.stroke();
          X.blobPath(hc, cx, cy, s, r, 11, 0.6);
          hc.fillStyle = "#707070";
          hc.fill();
        });
      }
    },
  });
  def("marble", {
    roughVar: 0.4,
    meters: 3,
    normal: 0,
    rough: 0.25,
    desc: "white Carrara-style marble, veined",
    gen(ctx, w, h, r) {
      const n = X.fbm(w, h, { scale: 3, octaves: 6, seed: 131 }),
        n2 = X.fbm(w, h, { scale: 6, octaves: 5, seed: 132 }),
        cl = X.fbm(w, h, { scale: 2, octaves: 4, seed: 134 });
      X.fillPixels(ctx, w, h, (i, x, y) => {
        const t = (x / w + y / h) * TAU + n[i] * 7 + n2[i] * 2.5;
        const v = Math.abs(Math.sin(t));
        const vein =
          Math.pow(1 - v, 5) * 0.35 +
          Math.pow(1 - v, 40) * 0.45 +
          Math.pow(1 - Math.abs(Math.sin(n2[i] * 11 + n[i] * 3)), 50) * 0.25;
        const base = 226 - cl[i] * 26;
        return [base - vein * 110, base - vein * 104, base - 5 - vein * 96];
      });
      X.blotches(ctx, w, h, r, { count: 7, color: "#6a5a40", alpha: 0.12 });
      macroGrime(ctx, w, h, 0.18, 133);
    },
  });
  def("marble_dark", {
    roughVar: 0.3,
    meters: 3,
    normal: 0,
    rough: 0.2,
    desc: "deco green-black marble",
    gen(ctx, w, h, r) {
      const n = X.fbm(w, h, { scale: 3, octaves: 6, seed: 141 });
      X.fillPixels(ctx, w, h, (i, x, y) => {
        const v = Math.abs(Math.sin((x / w + y / h) * TAU + n[i] * 8));
        const vein = Math.pow(1 - v, 6) * 0.3 + Math.pow(1 - v, 40) * 0.6;
        return [
          22 + vein * 120 + n[i] * 18,
          36 + vein * 130 + n[i] * 20,
          30 + vein * 110 + n[i] * 16,
        ];
      });
    },
  });
  def("terrazzo", {
    roughVar: 0.4,
    meters: 2,
    normal: 0,
    rough: 0.35,
    desc: "speckled terrazzo floor (lobbies, stations)",
    gen(ctx, w, h, r) {
      noiseBase(
        ctx,
        w,
        h,
        r,
        [
          [0, "#a8a090"],
          [1, "#c0b8a6"],
        ],
        { scale: 3, seed: 151, grain: 6 },
      );
      X.speckle(ctx, w, h, r, {
        count: 6000,
        colors: [
          "#5a4a3c",
          "#e4dccb",
          "#7c6a52",
          "#3c3c3a",
          "#9a5a3c",
          "#6a7a6a",
        ],
        min: 0.8,
        max: 3.5,
        alpha: 0.9,
      });
      ctx.strokeStyle = "rgba(150,120,70,0.8)";
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, w - 2, h - 2); // brass divider strips
      X.blotches(ctx, w, h, r, { count: 10, color: "#3a3024", alpha: 0.2 });
      macroGrime(ctx, w, h, 0.25, 153);
    },
  });

  // ==================================================================
  // METALS
  // ==================================================================
  function rustField(ctx, w, h, r, hc, seed) {
    const n1 = X.fbm(w, h, { scale: 4, octaves: 6, seed: seed }),
      n2 = X.fbm(w, h, { scale: 24, octaves: 3, seed: seed + 1 });
    const wn = X.worley(w, h, { cells: 18, seed: seed + 2 });
    const ramp = X.ramp([
      [0, "#2a150c"],
      [0.3, "#5a2a14"],
      [0.55, "#8a4219"],
      [0.75, "#a85c24"],
      [0.9, "#b8773a"],
      [1, "#6a5a44"],
    ]);
    X.fillPixels(ctx, w, h, (i) => {
      const flake = wn.f1[i] < 0.28 ? 0.12 : 0;
      const v = n1[i] * 0.6 + n2[i] * 0.4 + flake + (r() - 0.5) * 0.12;
      return ramp(v);
    });
    heightFrom(
      hc,
      w,
      h,
      (i) =>
        0.4 + n2[i] * 0.35 + (wn.f1[i] < 0.28 ? 0.15 : 0) + (r() - 0.5) * 0.15,
    );
    X.speckle(
      ctx,
      w,
      h,
      r,
      {
        count: w * 2,
        colors: ["#1a0c06", "#c88a4a"],
        min: 0.4,
        max: 2,
        alpha: 0.6,
        height: "#303030",
      },
      hc,
    );
    return { n1, n2 };
  }
  def("rust", {
    roughVar: 0.3,
    meters: 2,
    normal: 2.4,
    rough: 0.95,
    metal: 0.25,
    desc: "heavily corroded steel",
    gen(ctx, w, h, r, hc) {
      rustField(ctx, w, h, r, hc, 161);
      // remnants of old grey-green paint clinging on, with flaking edges
      const pn = X.fbm(w, h, { scale: 5, octaves: 6, seed: 164 });
      const img = ctx.getImageData(0, 0, w, h),
        d = img.data;
      const hd = hc.getImageData(0, 0, w, h);
      for (let i = 0; i < w * h; i++) {
        const o = i * 4,
          v = pn[i];
        if (v > 0.74) {
          const k = 0.85 + (r() - 0.5) * 0.1;
          d[o] = (d[o] * 0.35 + 86 * 0.65) * k;
          d[o + 1] = (d[o + 1] * 0.35 + 84 * 0.65) * k;
          d[o + 2] = (d[o + 2] * 0.35 + 70 * 0.65) * k;
          hd.data[o] = hd.data[o + 1] = hd.data[o + 2] = 190;
        } else if (v > 0.715) {
          d[o] *= 0.5;
          d[o + 1] *= 0.45;
          d[o + 2] *= 0.42;
        } else if (v < 0.22) {
          d[o] *= 0.55;
          d[o + 1] *= 0.5;
          d[o + 2] *= 0.48;
        } // deep scale
      }
      ctx.putImageData(img, 0, 0);
      hc.putImageData(hd, 0, 0);
      X.blotches(ctx, w, h, r, {
        count: 10,
        color: "#1a0a04",
        alpha: 0.35,
        rmin: 8,
        rmax: w * 0.12,
      });
      X.streaks(ctx, w, h, r, {
        count: 30,
        color: "#3a1a0c",
        alpha: 0.3,
        maxLen: h * 0.6,
        maxW: 10,
      });
      X.streaks(ctx, w, h, r, {
        count: 14,
        color: "#c07a3a",
        alpha: 0.2,
        maxLen: h * 0.4,
        maxW: 6,
      });
      macroGrime(ctx, w, h, 0.3, 163);
    },
  });
  /** Painted metal with chips revealing rust, scratches, grime. wear 0..1 */
  function paintedMetal(paint, wear, seed) {
    return function (ctx, w, h, r, hc) {
      const R = X.canvas(w, h); // rust layer underneath
      rustField(R.ctx, w, h, r, null, seed + 7);
      const n = X.fbm(w, h, { scale: 5, octaves: 6, seed }),
        fine = X.fbm(w, h, { scale: 40, octaves: 2, seed: seed + 3 });
      const pc = X.hex(paint),
        rust = R.ctx.getImageData(0, 0, w, h).data;
      const img = ctx.createImageData(w, h),
        d = img.data;
      const hv = new Float32Array(w * h);
      const thr = 1 - wear * 0.5;
      for (let i = 0; i < w * h; i++) {
        const o = i * 4,
          v = n[i] * 0.75 + fine[i] * 0.25;
        const chip = v > thr ? 1 : v > thr - 0.03 ? 0.5 : 0;
        const tone = 0.88 + fine[i] * 0.2 + (r() - 0.5) * 0.05;
        if (chip >= 1) {
          d[o] = rust[o];
          d[o + 1] = rust[o + 1];
          d[o + 2] = rust[o + 2];
          hv[i] = 0.35;
        } else if (chip > 0) {
          d[o] = pc[0] * 0.45;
          d[o + 1] = pc[1] * 0.45;
          d[o + 2] = pc[2] * 0.45;
          hv[i] = 0.5;
        } // chip edge shadow
        else {
          d[o] = pc[0] * tone;
          d[o + 1] = pc[1] * tone;
          d[o + 2] = pc[2] * tone;
          hv[i] = 0.62 + fine[i] * 0.05;
        }
        d[o + 3] = 255;
      }
      ctx.putImageData(img, 0, 0);
      heightFrom(hc, w, h, (i) => hv[i]);
      // scratches
      ctx.lineCap = "round";
      for (let k = 0; k < 60 * wear + 10; k++) {
        const x = r() * w,
          y = r() * h,
          a = r() * TAU,
          l = 5 + r() * 40;
        ctx.strokeStyle =
          r() < 0.6 ? "rgba(210,205,190,0.35)" : "rgba(50,30,20,0.4)";
        ctx.lineWidth = 0.6 + r();
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l);
        ctx.stroke();
      }
      X.streaks(ctx, w, h, r, {
        count: 16,
        color: "#4a2410",
        alpha: 0.25 * wear + 0.08,
        maxLen: h * 0.5,
        maxW: 8,
      });
      X.blotches(ctx, w, h, r, { count: 8, color: "#1e1a14", alpha: 0.22 });
      // sun-faded top-light variation
      macroGrime(ctx, w, h, 0.25, seed + 5);
    };
  }
  X.paintedMetal = paintedMetal;
  def("metal_painted", {
    roughVar: 0.6,
    meters: 2,
    normal: 2.5,
    rough: 0.6,
    metal: 0.3,
    desc: "olive-grey painted steel, chipped",
    gen: paintedMetal("#6a6e5c", 0.55, 171),
  });
  X.definePaint = function (color) {
    const name = "paint_" + color;
    if (X.GEN[name]) return;
    const hex =
      (X.PAINTS && X.PAINTS[color]) ||
      (/^[0-9a-f]{6}$/i.test(color) ? "#" + color : null);
    if (!hex) return;
    def(name, {
      w: 256,
      meters: 1.5,
      normal: 0,
      rough: 0.55,
      metal: 0.25,
      desc: "chipped " + color + " paint over rust",
      gen: paintedMetal(hex, 0.35, 180 + (X.seedOf(color) % 97)),
    });
  };
