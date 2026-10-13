// play-inline-11 09 — ctx
// Lines 2484-2824 of readable/play-inline-11.pretty.js (statement-aligned).
  def("tile_floor", {
    roughVar: 0.5,
    meters: 2,
    normal: 1.5,
    rough: 0.5,
    desc: "black & white checker linoleum/tile, worn",
    gen(ctx, w, h, r, hc) {
      const n = 8,
        s = w / n;
      for (let j = 0; j < n; j++)
        for (let i = 0; i < n; i++) {
          const c =
            (i + j) % 2
              ? X.jitter("#2a2a28", r, 0.1)
              : X.jitter("#d2ccb8", r, 0.05);
          ctx.fillStyle = X.css(c);
          ctx.fillRect(i * s, j * s, s, s);
          hc.fillStyle = "#b0b0b0";
          hc.fillRect(i * s + 1, j * s + 1, s - 2, s - 2);
          if (r() < 0.04) {
            ctx.fillStyle = "#3a342a";
            ctx.fillRect(i * s + 2, j * s + 2, s - 4, s - 4);
            ctx.fillStyle = "rgba(90,80,64,0.8)";
            X.blobPath(ctx, i * s + s / 2, j * s + s / 2, s * 0.3, r, 8, 0.6);
            ctx.fill();
          } // missing tile, bare mastic
        }
      ctx.strokeStyle = "rgba(30,28,24,0.6)";
      ctx.lineWidth = 1.5;
      for (let i = 0; i <= n; i++) {
        ctx.beginPath();
        ctx.moveTo(i * s, 0);
        ctx.lineTo(i * s, h);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * s);
        ctx.lineTo(w, i * s);
        ctx.stroke();
      }
      X.blotches(ctx, w, h, r, { count: 12, color: "#4a3e2c", alpha: 0.3 });
      X.speckle(ctx, w, h, r, {
        count: 1500,
        colors: ["#3a3024", "#8a8070"],
        min: 0.4,
        max: 1.5,
        alpha: 0.4,
      });
      macroGrime(ctx, w, h, 0.35, 335);
    },
  });
  def("carpet", {
    w: 256,
    meters: 2,
    normal: 0,
    rough: 1,
    desc: "worn red hotel/lobby carpet with deco border motif",
    gen(ctx, w, h, r) {
      noiseBase(
        ctx,
        w,
        h,
        r,
        [
          [0, "#4a1414"],
          [0.6, "#6a1c1a"],
          [1, "#7a2622"],
        ],
        { scale: 4, seed: 341, grain: 26, dscale: 128, mix: 0.5 },
      );
      ctx.strokeStyle = "rgba(200,160,80,0.35)";
      ctx.lineWidth = 3;
      const s = w / 2;
      for (let j = 0; j < 2; j++)
        for (let i = 0; i < 2; i++) {
          const cx = i * s + s / 2,
            cy = j * s + s / 2;
          ctx.beginPath();
          ctx.moveTo(cx, cy - s * 0.35);
          ctx.lineTo(cx + s * 0.35, cy);
          ctx.lineTo(cx, cy + s * 0.35);
          ctx.lineTo(cx - s * 0.35, cy);
          ctx.closePath();
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(cx, cy, s * 0.1, 0, TAU);
          ctx.stroke();
        }
      X.blotches(ctx, w, h, r, { count: 10, color: "#1e120a", alpha: 0.35 });
      X.blotches(ctx, w, h, r, { count: 5, color: "#8a7050", alpha: 0.2 });
    },
  });
  def("roof_tar", {
    meters: 4,
    normal: 1.8,
    rough: 0.95,
    desc: "tar & gravel roof with patched seams",
    gen(ctx, w, h, r, hc) {
      const { n2 } = noiseBase(
        ctx,
        w,
        h,
        r,
        [
          [0, "#262523"],
          [0.5, "#34322e"],
          [1, "#48453e"],
        ],
        { scale: 3, seed: 351, grain: 20 },
      );
      heightFrom(hc, w, h, (i) => 0.5 + (n2[i] - 0.5) * 0.2);
      X.speckle(
        ctx,
        w,
        h,
        r,
        {
          count: w * 8,
          colors: ["#6e6a60", "#8a8478", "#4e4a44"],
          min: 0.5,
          max: 1.6,
          alpha: 0.8,
          height: "#b0b0b0",
        },
        hc,
      );
      for (let k = 0; k < 4; k++) {
        const y = r() * h;
        ctx.fillStyle = "rgba(12,12,12,0.6)";
        ctx.fillRect(0, y, w, 10 + r() * 8);
        hc.fillStyle = "#a0a0a0";
        hc.fillRect(0, y, w, 4);
      }
      X.blotches(ctx, w, h, r, { count: 8, color: "#101010", alpha: 0.4 });
      X.blotches(ctx, w, h, r, { count: 6, color: "#6a6048", alpha: 0.2 });
      X.cracks(
        ctx,
        w,
        h,
        r,
        { count: 5, width: 1.2, seg: 6, steps: 40, color: "rgba(8,8,8,0.8)" },
        hc,
      );
    },
  });

  // ==================================================================
  // GROUND
  // ==================================================================
  def("dirt", {
    meters: 4,
    normal: 2,
    rough: 0.98,
    desc: "dry irradiated soil with pebbles",
    gen(ctx, w, h, r, hc) {
      const { n2 } = noiseBase(
        ctx,
        w,
        h,
        r,
        [
          [0, "#3e3224"],
          [0.4, "#58482f"],
          [0.7, "#6e5a3c"],
          [1, "#85704e"],
        ],
        { scale: 4, seed: 361, grain: 18 },
      );
      heightFrom(hc, w, h, (i) => 0.45 + (n2[i] - 0.5) * 0.4);
      const wn = X.worley(w, h, { cells: 10, seed: 362 });
      const img = ctx.getImageData(0, 0, w, h),
        d = img.data;
      for (let i = 0; i < w * h; i++)
        if (wn.f2[i] - wn.f1[i] < 0.025 && n2[i] > 0.55) {
          const o = i * 4;
          d[o] *= 0.55;
          d[o + 1] *= 0.55;
          d[o + 2] *= 0.55;
        } // dry mud cracks
      ctx.putImageData(img, 0, 0);
      // pebbles with light top & shadow
      for (let k = 0; k < w * 0.9; k++) {
        const x = r() * w,
          y = r() * h,
          s = 1 + r() * r() * 5,
          c = X.jitter(r() < 0.5 ? "#7c7466" : "#5e554a", r, 0.2);
        X.wrap(w, h, x, y, s + 2, (cx, cy) => {
          ctx.fillStyle = "rgba(20,14,8,0.5)";
          ctx.beginPath();
          ctx.ellipse(cx + 1, cy + 1, s, s * 0.8, 0, 0, TAU);
          ctx.fill();
          ctx.fillStyle = X.css(c);
          ctx.beginPath();
          ctx.ellipse(cx, cy, s, s * 0.8, 0, 0, TAU);
          ctx.fill();
          ctx.fillStyle = "rgba(255,245,220,0.25)";
          ctx.beginPath();
          ctx.ellipse(cx - s * 0.3, cy - s * 0.3, s * 0.4, s * 0.3, 0, 0, TAU);
          ctx.fill();
          hc.fillStyle = "#e0e0e0";
          hc.beginPath();
          hc.arc(cx, cy, s, 0, TAU);
          hc.fill();
        });
      }
      X.blotches(ctx, w, h, r, { count: 8, color: "#2a2016", alpha: 0.25 });
      macroGrime(ctx, w, h, 0.3, 365);
    },
  });
  def("grass_dead", {
    meters: 4,
    normal: 1.5,
    rough: 1,
    desc: "dead yellow-brown grass over dry soil",
    gen(ctx, w, h, r, hc) {
      const { n1 } = noiseBase(
        ctx,
        w,
        h,
        r,
        [
          [0, "#4a3c26"],
          [0.5, "#5e4c30"],
          [1, "#6e5a3a"],
        ],
        { scale: 4, seed: 371, grain: 14 },
      );
      const cover = X.fbm(w, h, { scale: 3, octaves: 4, seed: 372 });
      heightFrom(hc, w, h, () => 0.4);
      const cols = [
        "#8a7a48",
        "#9c8a52",
        "#76663c",
        "#a89660",
        "#6a5a34",
        "#5e5a36",
        "#b0a070",
      ];
      // blades batched per colour into single paths (fast), wrapped at the tile edges
      const paths = cols.map(() => []);
      for (let k = 0; k < w * 16; k++) {
        const x = r() * w,
          y = r() * h;
        if (cover[(y | 0) * w + (x | 0)] < 0.35 && r() < 0.8) continue; // bald patches
        const len = 3 + r() * 9,
          a = -Math.PI / 2 + (r() - 0.5) * 1.6;
        paths[(r() * cols.length) | 0].push(
          x,
          y,
          x + Math.cos(a) * len,
          y + Math.sin(a) * len,
        );
      }
      ctx.lineCap = "round";
      const hp = [];
      paths.forEach((P, ci) => {
        ctx.strokeStyle = X.css(cols[ci], 0.85);
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        for (let q = 0; q < P.length; q += 4) {
          for (const ox of [0, P[q] < 12 ? w : P[q] > w - 12 ? -w : null])
            for (const oy of [
              0,
              P[q + 1] < 12 ? h : P[q + 1] > h - 12 ? -h : null,
            ]) {
              if (ox === null || oy === null) continue;
              ctx.moveTo(P[q] + ox, P[q + 1] + oy);
              ctx.lineTo(P[q + 2] + ox, P[q + 3] + oy);
            }
        }
        ctx.stroke();
        hp.push(P);
      });
      hc.strokeStyle = "rgba(230,230,230,0.5)";
      hc.lineWidth = 1;
      hc.beginPath();
      for (const P of hp)
        for (let q = 0; q < P.length; q += 4) {
          hc.moveTo(P[q], P[q + 1]);
          hc.lineTo(P[q + 2], P[q + 3]);
        }
      hc.stroke();
      // a few olive, barely-alive tufts
      X.blotches(ctx, w, h, r, { count: 6, color: "#4e5a2c", alpha: 0.2 });
      X.blotches(ctx, w, h, r, { count: 6, color: "#2a2014", alpha: 0.25 });
      macroGrime(ctx, w, h, 0.25, 375);
      void n1;
    },
  });
  def("gravel", {
    meters: 2,
    normal: 3.5,
    rough: 0.95,
    desc: "loose gravel / ballast (subway tracks)",
    gen(ctx, w, h, r, hc) {
      const wn = X.worley(w, h, { cells: 40, seed: 381 });
      X.fillPixels(ctx, w, h, (i) => {
        const id = wn.id[i],
          k = Math.max(0, 1 - wn.f1[i] * 1.4),
          edge = wn.f2[i] - wn.f1[i];
        const base = 70 + id * 70,
          v = base * (0.55 + k * 0.6) * (edge < 0.05 ? 0.5 : 1);
        return [v * (1 + (id - 0.5) * 0.15), v, v * (0.92 + id * 0.1)];
      });
      heightFrom(hc, w, h, (i) => Math.max(0, 1 - wn.f1[i] * 1.3));
      X.blotches(ctx, w, h, r, { count: 8, color: "#2a1e10", alpha: 0.3 });
    },
  });
  def("sand", {
    meters: 4,
    normal: 1.2,
    rough: 1,
    desc: "grey harbour sand / silt",
    gen(ctx, w, h, r, hc) {
      const { n2 } = noiseBase(
        ctx,
        w,
        h,
        r,
        [
          [0, "#6e6650"],
          [0.5, "#8a8064"],
          [1, "#a29878"],
        ],
        { scale: 3, seed: 391, grain: 22 },
      );
      heightFrom(
        hc,
        w,
        h,
        (i) => 0.5 + Math.sin(((i % w) / w) * TAU * 6 + n2[i] * 8) * 0.12,
      );
      X.speckle(ctx, w, h, r, {
        count: 4000,
        colors: ["#3c3628", "#c0b89a"],
        min: 0.3,
        max: 1,
        alpha: 0.5,
      });
      X.blotches(ctx, w, h, r, { count: 6, color: "#3a3a28", alpha: 0.2 });
    },
  });
