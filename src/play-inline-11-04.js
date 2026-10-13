// play-inline-11 04 — ctx
// Lines 866-1199 of readable/play-inline-11.pretty.js (statement-aligned).
  function brickGen(palette, mortar, soot) {
    return function (ctx, w, h, r, hc) {
      const cols = 12,
        rows = 36; // 3 m tile: 25 cm bricks, 8.3 cm courses
      const bw = w / cols,
        bh = h / rows;
      const pal = palette.slice().sort((p, q) => {
        const a = X.hex(p),
          b = X.hex(q);
        return a[0] + a[1] + a[2] - (b[0] + b[1] + b[2]);
      });
      const mBase = X.shade(X.mix(mortar, palette[0], 0.34), -0.12);
      const zone = X.fbm(w, h, { scale: 3, octaves: 4, seed: 95 }),
        zone2 = X.fbm(w, h, { scale: 8, octaves: 2, seed: 94 });
      const rep = X.fbm(w, h, { scale: 2, octaves: 3, seed: 96 }),
        dirt = X.fbm(w, h, { scale: 6, octaves: 3, seed: 92 });
      // mortar field: lime → dirt-filled (dark) by noise; repointed zones = cool grey cement
      const cement = X.mix(
        X.mix(mortar, [150, 150, 146], 0.6),
        palette[0],
        0.08,
      );
      X.fillPixels(ctx, w, h, (i) => {
        const dk = Math.max(0, Math.min(1, (dirt[i] - 0.3) * 1.9));
        let c = X.mix(
          mBase,
          X.mix(mBase, [40, 34, 28], 0.6),
          dk * (soot ? 1 : 0.8),
        );
        if (rep[i] > 0.7)
          c = X.mix(c, cement, Math.min(1, (rep[i] - 0.7) * 12));
        const g = (r() - 0.5) * 18;
        return [c[0] + g, c[1] + g, c[2] + g];
      });
      hc.fillStyle = "#2e2e2e";
      hc.fillRect(0, 0, w, h);
      const at = (x, y) =>
        Math.min(h - 1, Math.max(0, y | 0)) * w + ((((x | 0) % w) + w) % w);
      // course layout: joint widths vary per course (bed) and per brick (head); total height stays seamless
      for (let j = 0; j < rows; j++) {
        const header = j % 6 === 5,
          off = header ? 0 : ((j % 2) * bw) / 2; // aligned with the world-space brick ids (90_api.js)
        const cw = header ? bw / 2 : bw,
          y = j * bh;
        const bed = Math.max(1.2, bh * (0.12 + r() * 0.1));
        for (let x = -off; x < w; x += cw) {
          const zi =
            zone[at(x + cw / 2, y + bh / 2)] * 0.75 +
            zone2[at(x + cw / 2, y + bh / 2)] * 0.25;
          // cluster-driven palette position (+ a little per-brick jitter), not a random pick per brick
          const pos = Math.max(
            0,
            Math.min(
              pal.length - 1.001,
              zi * (pal.length - 1) * 1.25 -
                (pal.length - 1) * 0.12 +
                (r() - 0.5) * 0.7,
            ),
          );
          const i0 = pos | 0;
          let c = X.mix(
            X.hex(pal[i0]),
            X.hex(pal[Math.min(pal.length - 1, i0 + 1)]),
            pos - i0,
          );
          c = X.jitter(c, r, 0.035);
          if (header && r() < 0.2)
            c = X.shade(X.mix(c, [60, 30, 26], 0.25), -0.1); // dark flashed header ends
          else if (r() < 0.01) c = X.shade(c, -0.2); // rare clinker
          const head = Math.max(1.2, bw * (0.05 + r() * 0.05));
          const repd = rep[at(x + cw / 2, y + bh / 2)] > 0.7;
          X.wrap(w, h, x + cw / 2, y + bh / 2, cw, (cx, cy) => {
            const jx = (r() - 0.5) * 0.8,
              jy = (r() - 0.5) * 0.6;
            const x0 = cx - cw / 2 + head / 2 + jx,
              y0 = cy - bh / 2 + bed / 2 + jy,
              ww = cw - head,
              hh = bh - bed;
            const radius = Math.min(ww, hh) * (0.18 + r() * 0.2); // worn arrises
            X.rrect(ctx, x0, y0, ww, hh, radius);
            const g = ctx.createLinearGradient(0, y0, 0, y0 + hh);
            g.addColorStop(0, X.css(X.shade(c, -0.02)));
            g.addColorStop(0.5, X.css(X.shade(c, 0.025)));
            g.addColorStop(1, X.css(X.shade(c, -0.05)));
            ctx.fillStyle = g;
            ctx.fill();
            X.rrect(hc, x0, y0, ww, hh, radius);
            hc.fillStyle = "#bcbcbc";
            hc.fill();
            X.rrect(
              hc,
              x0 + 1.2,
              y0 + 1,
              ww - 2.4,
              hh - 2,
              Math.max(0.5, radius - 1),
            );
            hc.fillStyle = "#dadada";
            hc.fill();
            // recessed bed joint: the brick above shades the upper half of the joint below it
            ctx.fillStyle = "rgba(12,9,7,0.28)";
            ctx.fillRect(
              x0 + radius * 0.5,
              y0 + hh,
              ww - radius,
              Math.max(1, bed * 0.45),
            );
            // repointed zones: cement smeared over the arrises
            if (repd) {
              ctx.strokeStyle = X.css(cement, 0.45);
              ctx.lineWidth = 1.2;
              X.rrect(ctx, x0, y0, ww, hh, radius);
              ctx.stroke();
              hc.strokeStyle = "#9a9a9a";
              hc.lineWidth = 1.2;
              X.rrect(hc, x0, y0, ww, hh, radius);
              hc.stroke();
            }
            // rare spall at an edge: fresh, lighter and rougher brick core, shallow in the height
            if (r() < 0.05) {
              const left = r() < 0.5,
                sx = left
                  ? x0 + ww * (0.05 + r() * 0.2)
                  : x0 + ww * (0.75 + r() * 0.2),
                sy = y0 + hh * (r() < 0.5 ? 0.25 : 0.75);
              const sr = hh * (0.35 + r() * 0.35);
              ctx.save();
              X.rrect(ctx, x0, y0, ww, hh, radius);
              ctx.clip();
              X.blobPath(ctx, sx, sy, sr, r, 8, 0.6);
              ctx.fillStyle = X.css(
                X.shade(X.mix(c, [200, 110, 80], 0.25), 0.1),
                0.85,
              );
              ctx.fill();
              ctx.restore();
              hc.save();
              X.rrect(hc, x0, y0, ww, hh, radius);
              hc.clip();
              X.blobPath(hc, sx, sy, sr, r, 8, 0.6);
              hc.fillStyle = "#909090";
              hc.fill();
              hc.restore();
            }
          });
        }
      }
      // brick surface: fine grain + pits, a little stronger on the faces than in the joints
      const n = X.fbm(w, h, { scale: 48, octaves: 2, seed: 93 });
      const img = ctx.getImageData(0, 0, w, h),
        d = img.data;
      for (let i = 0; i < w * h; i++) {
        const k = 0.9 + n[i] * 0.16 + (r() - 0.5) * 0.08;
        d[i * 4] *= k;
        d[i * 4 + 1] *= k;
        d[i * 4 + 2] *= k;
      }
      ctx.putImageData(img, 0, 0);
      X.speckle(ctx, w, h, r, {
        count: 900,
        colors: ["#2a1a14", "#3a2a20"],
        min: 0.3,
        max: 0.9,
        alpha: 0.35,
      });
      // fine, faint soot runs and salt runs out of the joints (small: anything large repeats every tile)
      X.streaks(ctx, w, h, r, {
        count: 14,
        color: "#1e1a14",
        alpha: soot ? 0.1 : 0.07,
        minLen: bh * 2,
        maxLen: h * 0.22,
        maxW: 5,
      });
      X.streaks(ctx, w, h, r, {
        count: 8,
        color: "#ece6d8",
        alpha: 0.09,
        minLen: bh * 1.5,
        maxLen: h * 0.1,
        maxW: 4,
      });
      X.stepCracks(
        ctx,
        w,
        h,
        r,
        {
          count: 2,
          bw,
          bh,
          width: 0.9,
          color: "rgba(22,16,12,0.55)",
          lip: "rgba(230,220,200,0.14)",
        },
        hc,
      );
      macroGrime(ctx, w, h, 0.22, 97);
    };
  }
  X.brickGen = brickGen;
  def("brick_red", {
    roughVar: 0.12,
    roughInvert: true,
    meters: 3,
    normal: 2.4,
    rough: 0.88,
    desc: "NYC common red brick",
    gen: brickGen(
      ["#8a3b2a", "#7d3526", "#9a4631", "#86402d", "#6e2f22"],
      "#8b857a",
      true,
    ),
  });
  def("brick_brown", {
    roughVar: 0.12,
    roughInvert: true,
    meters: 3,
    normal: 2.4,
    rough: 0.88,
    desc: "brown/manganese brick",
    gen: brickGen(
      ["#5a3d2e", "#4e3528", "#664636", "#6c4a33", "#3f2c22"],
      "#7a7468",
    ),
  });
  def("brick_tan", {
    roughVar: 0.12,
    roughInvert: true,
    meters: 3,
    normal: 2.4,
    rough: 0.88,
    desc: "buff/tan brick (deco era)",
    gen: brickGen(
      ["#b39a72", "#a88f68", "#bea67d", "#9d8560", "#c4ae88"],
      "#8e877a",
    ),
  });
  def("brick_white", {
    roughVar: 0.35,
    meters: 3,
    normal: 2.4,
    rough: 0.88,
    desc: "glazed white brick (light well / subway)",
    gen: brickGen(
      ["#cfcabc", "#c4bfb0", "#d8d3c6", "#bdb7a8"],
      "#77726a",
      true,
    ),
  });

  // ==================================================================
  // STONE
  // ==================================================================
  function ashlarGen(stops, rows, colsPerRow, joint, seed, speck) {
    return function (ctx, w, h, r, hc) {
      const { n2 } = noiseBase(ctx, w, h, r, stops, {
        scale: 4,
        seed,
        grain: 10,
        dscale: 48,
      });
      heightFrom(hc, w, h, (i) => 0.75 + (n2[i] - 0.5) * 0.12);
      if (speck) X.speckle(ctx, w, h, r, speck);
      const rh = h / rows;
      for (let j = 0; j < rows; j++) {
        const y = j * rh,
          cols = colsPerRow,
          bw = w / cols,
          off = ((j % 2) * bw) / 2;
        // row tone variation per block
        for (let i = -1; i <= cols; i++) {
          const x = i * bw + off;
          ctx.fillStyle =
            r() < 0.5 ? X.css("#000", r() * 0.08) : X.css("#fff", r() * 0.06);
          ctx.fillRect(x, y, bw, rh);
          ctx.fillStyle = X.css("#1a1814", 0.8);
          ctx.fillRect(x, y, joint, rh);
          hc.fillStyle = "#303030";
          hc.fillRect(x - 1, y, joint + 2, rh);
          // bevel light on top/left
          ctx.fillStyle = "rgba(255,250,235,0.12)";
          ctx.fillRect(x + joint, y + joint, bw - joint, 2);
        }
        ctx.fillStyle = X.css("#1a1814", 0.8);
        ctx.fillRect(0, y, w, joint);
        hc.fillStyle = "#303030";
        hc.fillRect(0, y - 1, w, joint + 2);
        ctx.fillStyle = "rgba(0,0,0,0.18)";
        ctx.fillRect(0, y + rh - 3, w, 3);
      }
      X.streaks(ctx, w, h, r, {
        count: 28,
        color: "#2a261e",
        alpha: 0.2,
        maxLen: h * 0.6,
        maxW: 14,
      });
      X.blotches(ctx, w, h, r, { count: 8, color: "#1c1a16", alpha: 0.2 });
      X.cracks(
        ctx,
        w,
        h,
        r,
        { count: 3, width: 1, seg: 5, steps: 30, color: "rgba(30,26,20,0.7)" },
        hc,
      );
      macroGrime(ctx, w, h, 0.3, seed + 3);
    };
  }
  def("stone_limestone", {
    meters: 4,
    normal: 2.2,
    rough: 0.85,
    desc: "Indiana limestone ashlar blocks (Beaux-Arts / deco)",
    gen: ashlarGen(
      [
        [0, "#a39c88"],
        [0.5, "#bdb59f"],
        [1, "#d0c8b2"],
      ],
      6,
      3,
      2.5,
      101,
      {
        count: 900,
        colors: ["#8a8270", "#e0d8c0"],
        min: 0.3,
        max: 1.2,
        alpha: 0.5,
      },
    ),
  });
