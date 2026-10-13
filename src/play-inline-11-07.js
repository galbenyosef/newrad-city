// play-inline-11 07 — ctx
// Lines 1891-2151 of readable/play-inline-11.pretty.js (statement-aligned).
  def("gold", {
    w: 256,
    meters: 1,
    normal: 0,
    rough: 0.3,
    metal: 1,
    desc: "gilded metal (Prometheus)",
    gen(ctx, w, h, r) {
      noiseBase(
        ctx,
        w,
        h,
        r,
        [
          [0, "#9a7428"],
          [0.5, "#d8b050"],
          [1, "#f0d27a"],
        ],
        { scale: 4, seed: 251, grain: 8 },
      );
      X.blotches(ctx, w, h, r, { count: 8, color: "#4a3a18", alpha: 0.35 });
      X.streaks(ctx, w, h, r, { count: 12, color: "#3a2a10", alpha: 0.3 });
    },
  });

  // ==================================================================
  // WOOD
  // ==================================================================
  function grainField(w, h, seed, vertical) {
    return vertical
      ? X.fbm(w, h, { scale: 48, sy: 3, octaves: 4, seed })
      : X.fbm(w, h, { scale: 3, sy: 48, octaves: 4, seed });
  }
  def("wood_planks", {
    roughVar: 0.3,
    meters: 2,
    normal: 2.2,
    rough: 0.8,
    desc: "worn floorboards (planks along U)",
    gen(ctx, w, h, r, hc) {
      const rows = 8,
        ph = h / rows,
        g = grainField(w, h, 261, false),
        g2 = X.fbm(w, h, { scale: 6, sy: 64, octaves: 3, seed: 262 });
      const tones = ["#6a4a2e", "#7a5634", "#5c3f26", "#84603c", "#6e4c2c"];
      const img = ctx.createImageData(w, h),
        d = img.data;
      const plankTone = [],
        joints = [];
      for (let j = 0; j < rows; j++) {
        plankTone.push(X.hex(tones[(r() * tones.length) | 0]));
        joints.push([r() * w, r() * w]);
      }
      for (let y = 0; y < h; y++) {
        const j = (y / ph) | 0,
          t = plankTone[j];
        for (let x = 0; x < w; x++) {
          const i = y * w + x,
            o = i * 4;
          const rings =
            0.5 + 0.5 * Math.sin(((g[i] * 18 + g2[i] * 6) * TAU) / 3);
          const k = 0.72 + rings * 0.22 + (r() - 0.5) * 0.06;
          d[o] = t[0] * k;
          d[o + 1] = t[1] * k;
          d[o + 2] = t[2] * k;
          d[o + 3] = 255;
        }
      }
      ctx.putImageData(img, 0, 0);
      for (let j = 0; j < rows; j++) {
        const y = j * ph;
        ctx.fillStyle = "rgba(15,10,6,0.9)";
        ctx.fillRect(0, y, w, 2.5);
        hc.fillStyle = "#202020";
        hc.fillRect(0, y - 1, w, 4);
        for (const jx of joints[j]) {
          ctx.fillStyle = "rgba(15,10,6,0.85)";
          ctx.fillRect(jx, y, 2, ph);
          hc.fillStyle = "#303030";
          hc.fillRect(jx - 1, y, 3, ph);
          for (const nx of [jx - 8, jx + 10])
            for (const ny of [y + ph * 0.3, y + ph * 0.7]) {
              ctx.fillStyle = "#2a2622";
              ctx.beginPath();
              ctx.arc((nx + w) % w, ny, 1.8, 0, TAU);
              ctx.fill();
            }
        }
      }
      // knots
      for (let k = 0; k < 8; k++) {
        const x = r() * w,
          y = r() * h;
        ctx.fillStyle = "rgba(40,24,12,0.7)";
        ctx.beginPath();
        ctx.ellipse(x, y, 5 + r() * 5, 2.5 + r() * 2, 0, 0, TAU);
        ctx.fill();
      }
      // wear path (lighter, dusty) & stains
      X.blotches(ctx, w, h, r, {
        count: 8,
        color: "#a88a64",
        alpha: 0.18,
        rmin: w * 0.1,
        rmax: w * 0.3,
      });
      X.blotches(ctx, w, h, r, { count: 7, color: "#1a120a", alpha: 0.25 });
      macroGrime(ctx, w, h, 0.25, 265);
    },
  });
  def("wood_rotten", {
    meters: 2,
    normal: 3,
    rough: 0.95,
    desc: "weathered grey boards, rot & rusty nails (planks along V)",
    gen(ctx, w, h, r, hc) {
      const cols = 6,
        pw = w / cols,
        g = grainField(w, h, 271, true),
        g2 = X.fbm(w, h, { scale: 64, sy: 6, octaves: 3, seed: 272 });
      const rot = X.fbm(w, h, { scale: 4, octaves: 5, seed: 273 });
      const tones = ["#6d6558", "#7a7163", "#5f584d", "#847a6a", "#5a5046"];
      const T = [];
      for (let i = 0; i < cols; i++)
        T.push(X.hex(tones[(r() * tones.length) | 0]));
      const img = ctx.createImageData(w, h),
        d = img.data;
      const hv = new Float32Array(w * h);
      for (let y = 0; y < h; y++)
        for (let x = 0; x < w; x++) {
          const i = y * w + x,
            o = i * 4,
            t = T[(x / pw) | 0];
          const streak =
            0.5 + 0.5 * Math.sin(((g[i] * 20 + g2[i] * 8) * TAU) / 4);
          let k = 0.66 + streak * 0.34 + (r() - 0.5) * 0.08;
          let c = [t[0] * k, t[1] * k, t[2] * k];
          if (rot[i] > 0.68) {
            const q = Math.min(1, (rot[i] - 0.68) * 5);
            c = [
              c[0] * (1 - q) + 42 * q,
              c[1] * (1 - q) + 34 * q,
              c[2] * (1 - q) + 22 * q,
            ];
          }
          d[o] = c[0];
          d[o + 1] = c[1];
          d[o + 2] = c[2];
          d[o + 3] = 255;
          hv[i] = 0.55 + streak * 0.15 - (rot[i] > 0.68 ? 0.2 : 0);
        }
      ctx.putImageData(img, 0, 0);
      heightFrom(hc, w, h, (i) => hv[i]);
      for (let i = 0; i < cols; i++) {
        const x = i * pw;
        ctx.fillStyle = "rgba(12,10,8,0.95)";
        ctx.fillRect(x, 0, 3, h);
        hc.fillStyle = "#101010";
        hc.fillRect(x - 1, 0, 5, h);
        for (const ny of [h * 0.15, h * 0.65])
          for (const nx of [x + pw * 0.25, x + pw * 0.75]) {
            ctx.fillStyle = "#3a2214";
            ctx.beginPath();
            ctx.arc(nx, ny, 2.2, 0, TAU);
            ctx.fill();
            X.streaks(ctx, w, h, r, {
              count: 1,
              color: "#5a2a10",
              alpha: 0.4,
              minLen: 10,
              maxLen: 50,
              maxW: 4,
            });
          }
      }
      // splits along grain + a knot hole
      for (let k = 0; k < 14; k++) {
        const x = r() * w,
          y = r() * h,
          l = 20 + r() * 80;
        ctx.strokeStyle = "rgba(15,12,10,0.8)";
        ctx.lineWidth = 1 + r();
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + (r() - 0.5) * 4, y + l);
        ctx.stroke();
      }
      for (let k = 0; k < 3; k++) {
        const x = r() * w,
          y = r() * h;
        X.wrap(w, h, x, y, 10, (cx, cy) => {
          ctx.fillStyle = "#0e0c0a";
          ctx.beginPath();
          ctx.ellipse(cx, cy, 3 + r() * 3, 5 + r() * 5, 0, 0, TAU);
          ctx.fill();
          hc.fillStyle = "#000";
          hc.beginPath();
          hc.ellipse(cx, cy, 4, 7, 0, 0, TAU);
          hc.fill();
        });
      }
      X.blotches(ctx, w, h, r, { count: 6, color: "#2e3a22", alpha: 0.22 }); // mildew
      macroGrime(ctx, w, h, 0.3, 275);
    },
  });
  def("crate_wood", {
    w: 256,
    meters: 1,
    normal: 2,
    rough: 0.85,
    desc: "pine crate slats with stencil",
    gen(ctx, w, h, r, hc) {
      const g = grainField(w, h, 281, false);
      X.fillPixels(ctx, w, h, (i) => {
        const k = 0.8 + 0.2 * Math.sin(g[i] * 40);
        return [150 * k, 112 * k, 68 * k];
      });
      for (let j = 0; j < 4; j++) {
        ctx.fillStyle = "rgba(30,20,10,0.9)";
        ctx.fillRect(0, (j * h) / 4, w, 3);
        hc.fillStyle = "#202020";
        hc.fillRect(0, (j * h) / 4 - 1, w, 5);
      }
      ctx.fillStyle = "rgba(80,60,40,0.8)";
      ctx.fillRect(0, 0, 14, h);
      ctx.fillRect(w - 14, 0, 14, h);
      X.text(ctx, "U.S. ARMY", w / 2, h * 0.38, {
        font: "stencil",
        size: 30,
        color: "rgba(30,30,25,0.6)",
      });
      X.text(ctx, "FRAGILE", w / 2, h * 0.62, {
        font: "stencil",
        size: 22,
        color: "rgba(120,30,20,0.55)",
      });
      X.blotches(ctx, w, h, r, { count: 6, color: "#2a1c10", alpha: 0.3 });
    },
  });
  def("bark", {
    w: 256,
    meters: 1.5,
    normal: 4,
    rough: 0.95,
    desc: "dead tree bark (furrows along V)",
    gen(ctx, w, h, r, hc) {
      const n = X.fbm(w, h, { scale: 12, sy: 2, octaves: 5, seed: 291 }),
        n2 = X.fbm(w, h, { scale: 3, octaves: 4, seed: 292 });
      X.fillPixels(ctx, w, h, (i) => {
        const f = Math.pow(Math.abs(Math.sin(n[i] * 14)), 0.6),
          v = 40 + f * 50 + n2[i] * 20;
        return [v * 1.05, v * 0.95, v * 0.82];
      });
      heightFrom(hc, w, h, (i) => Math.pow(Math.abs(Math.sin(n[i] * 14)), 0.6));
      X.blotches(ctx, w, h, r, { count: 5, color: "#4a5030", alpha: 0.25 });
    },
  });

  // ==================================================================
  // WALLS / INTERIORS
  // ==================================================================
