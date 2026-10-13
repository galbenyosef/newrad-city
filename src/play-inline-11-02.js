// play-inline-11 02 — ctx
// Lines 271-589 of readable/play-inline-11.pretty.js (statement-aligned).
  def("sidewalk", {
    meters: 3,
    normal: 2.6,
    rough: 0.9,
    roughVar: 0.25,
    desc: "1.5 m pavement slabs, 2×2 per tile",
    gen(ctx, w, h, r, hc) {
      const { n2 } = noiseBase(
        ctx,
        w,
        h,
        r,
        [
          [0, "#7f7b72"],
          [0.5, "#9b978c"],
          [1, "#b0ab9f"],
        ],
        { scale: 3, seed: 41, grain: 14 },
      );
      X.speckle(ctx, w, h, r, {
        count: w * 2,
        colors: ["#5a574f", "#c0bcb0"],
        min: 0.4,
        max: 1.3,
        alpha: 0.4,
      });
      const n = 2,
        s = w / n;
      // per-slab tilt / settlement in the height field, tone in the colour
      const tilt = [],
        lift = [],
        tone = [];
      for (let q = 0; q < n * n; q++) {
        tilt.push([(r() - 0.5) * 0.14, (r() - 0.5) * 0.14]);
        lift.push((r() - 0.5) * 0.12 - (r() < 0.2 ? 0.08 : 0));
        tone.push(r());
      }
      const jn = X.fbm(w, h, { scale: 24, octaves: 2, seed: 47 });
      heightFrom(hc, w, h, (i) => {
        const x = i % w,
          y = (i / w) | 0,
          q = ((y / s) | 0) * n + ((x / s) | 0),
          fx = (x % s) / s - 0.5,
          fy = (y % s) / s - 0.5;
        return (
          0.56 +
          (n2[i] - 0.5) * 0.16 +
          lift[q] +
          tilt[q][0] * fx +
          tilt[q][1] * fy
        );
      });
      for (let i = 0; i < n; i++)
        for (let j = 0; j < n; j++) {
          const x = i * s,
            y = j * s,
            t = tone[j * n + i];
          ctx.fillStyle =
            t < 0.5
              ? X.css("#1a1812", (0.5 - t) * 0.16)
              : X.css("#f4efe0", (t - 0.5) * 0.12);
          ctx.fillRect(x, y, s, s);
          // broken slab corner: a stepped piece with its own tilt
          if (r() < 0.3) {
            const cx0 = x + (r() < 0.5 ? 0 : s),
              cy0 = y + (r() < 0.5 ? 0 : s),
              radius = s * (0.18 + r() * 0.2);
            ctx.save();
            ctx.beginPath();
            ctx.rect(x, y, s, s);
            ctx.clip();
            X.blobPath(ctx, cx0, cy0, radius, r, 9, 0.5);
            ctx.fillStyle = "rgba(40,36,30,0.12)";
            ctx.fill();
            ctx.strokeStyle = "rgba(30,27,22,0.7)";
            ctx.lineWidth = 1.3;
            ctx.stroke();
            ctx.restore();
            hc.save();
            hc.beginPath();
            hc.rect(x, y, s, s);
            hc.clip();
            X.blobPath(hc, cx0, cy0, radius, r, 9, 0.5);
            hc.fillStyle = "rgba(0,0,0,0.12)";
            hc.fill();
            hc.restore();
          }
        }
      X.cracks(
        ctx,
        w,
        h,
        r,
        {
          count: 5,
          width: 1.4,
          seg: w * 0.01,
          steps: 45,
          color: "rgba(30,27,22,0.8)",
          vary: true,
          spall: "rgba(178,172,158,0.55)",
          highlight: "rgba(205,200,188,0.2)",
        },
        hc,
      );
      // expansion joints: dirt-filled grooves, width wanders along the joint, chipped arrises on both sides
      for (let i = 0; i < n; i++)
        for (const vert of [true, false]) {
          const c0 = i * s;
          for (let t = 0; t < w; t += 1) {
            const jw =
              2.2 +
              jn[vert ? (t * w + (c0 | 0)) % (w * h) : ((c0 | 0) % h) * w + t] *
                3.2;
            const px = vert ? c0 : t,
              py = vert ? t : c0;
            X.wrap(w, h, px, py, jw + 1, (xx, yy) => {
              ctx.fillStyle = "rgba(88,80,66,0.9)";
              if (vert) ctx.fillRect(xx - jw / 2, yy, jw, 1.2);
              else ctx.fillRect(xx, yy - jw / 2, 1.2, jw);
              ctx.fillStyle = "rgba(30,27,22,0.45)"; // shadowed lip of the higher slab
              if (vert) ctx.fillRect(xx - jw / 2, yy, 1, 1.2);
              else ctx.fillRect(xx, yy - jw / 2, 1.2, 1);
              hc.fillStyle = "#383838";
              if (vert) hc.fillRect(xx - jw / 2, yy, jw, 1.2);
              else hc.fillRect(xx, yy - jw / 2, 1.2, jw);
            });
          }
          for (let k = 0; k < 16; k++) {
            // chipped arrises
            const along = r() * w,
              side = r() < 0.5 ? -1 : 1,
              radius = 1.5 + Math.pow(r(), 2) * 5;
            const px = vert ? c0 + side * (2 + radius * 0.5) : along,
              py = vert ? along : c0 + side * (2 + radius * 0.5);
            X.wrap(w, h, px, py, radius, (xx, yy) => {
              const sd = (r() * 1e9) | 0;
              X.blobPath(ctx, xx, yy, radius, X.rng(sd), 7, 0.7);
              ctx.fillStyle = "rgba(96,88,74,0.75)";
              ctx.fill();
              X.blobPath(hc, xx, yy, radius, X.rng(sd), 7, 0.7);
              hc.fillStyle = "#4a4a4a";
              hc.fill();
            });
          }
        }
      for (let k = 0; k < 34; k++) {
        // weeds: small tufts in the joints
        const along = r() * w,
          jl = ((r() * n) | 0) * s,
          vert = r() < 0.5;
        const x = vert ? jl : along,
          y = vert ? along : jl;
        for (let b = 0; b < 5; b++) {
          ctx.strokeStyle = X.css(r() < 0.5 ? "#6b5e3a" : "#4d4a2c", 0.75);
          ctx.lineWidth = 0.8 + r() * 0.6;
          const a = r() * Math.PI * 2,
            l = 2 + r() * 7;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.quadraticCurveTo(
            x + Math.cos(a) * l * 0.5,
            y + Math.sin(a) * l * 0.2,
            x + Math.cos(a) * l,
            y + Math.sin(a) * l,
          );
          ctx.stroke();
        }
      }
      // chewing gum: flattened black discs with a slightly lighter rim, many small, a few big
      for (let k = 0; k < 28; k++) {
        const x = r() * w,
          y = r() * h,
          radius = 0.8 + Math.pow(r(), 2.6) * 3;
        X.wrap(w, h, x, y, radius + 1, (xx, yy) => {
          ctx.fillStyle = "rgba(70,66,58,0.35)";
          ctx.beginPath();
          ctx.ellipse(
            xx,
            yy,
            radius + 0.8,
            (radius + 0.8) * 0.85,
            0,
            0,
            Math.PI * 2,
          );
          ctx.fill();
          ctx.fillStyle =
            "rgba(52,50,45," + (0.35 + r() * 0.25).toFixed(2) + ")";
          ctx.beginPath();
          ctx.ellipse(xx, yy, radius, radius * 0.85, r(), 0, Math.PI * 2);
          ctx.fill();
        });
      }
      X.blotches(ctx, w, h, r, {
        count: 2,
        color: "#7a4a24",
        alpha: 0.14,
        rmin: 4,
        rmax: w * 0.05,
        pow: 2,
      }); // rust bleed
      X.blotches(ctx, w, h, r, {
        count: 8,
        color: "#3a342a",
        alpha: 0.16,
        pow: 2.5,
        cluster: 2,
      });
      X.blotches(ctx, w, h, r, {
        count: 3,
        color: "#1c1a18",
        alpha: 0.25,
        rmin: 6,
        rmax: 26,
        pow: 2,
      }); // oil
      macroGrime(ctx, w, h, 0.28, 44);
    },
  });
  def("curb", {
    meters: 2,
    normal: 2,
    rough: 0.9,
    desc: "granite curbstone strip (u along street)",
    gen(ctx, w, h, r, hc) {
      noiseBase(
        ctx,
        w,
        h,
        r,
        [
          [0, "#6c6a66"],
          [0.6, "#8e8b85"],
          [1, "#a9a59d"],
        ],
        { scale: 6, seed: 51 },
      );
      X.speckle(ctx, w, h, r, {
        count: 1400,
        colors: ["#2e2d2b", "#d6d2c8", "#8a6f66"],
        min: 0.4,
        max: 1.4,
        alpha: 0.6,
      });
      for (let x = 0; x < w; x += w / 2) {
        ctx.fillStyle = "rgba(30,28,25,0.9)";
        ctx.fillRect(x, 0, 2, h);
        hc.fillStyle = "#222";
        hc.fillRect(x, 0, 3, h);
      }
      X.streaks(ctx, w, h, r, { count: 10, alpha: 0.2 });
      X.blotches(ctx, w, h, r, { count: 5, color: "#1a1814", alpha: 0.3 });
    },
  });

  // ==================================================================
  // ASPHALT family
  // ==================================================================
  // The 8 m asphalt tile is deliberately near-uniform worn aggregate: every straight crack, tar snake or repair patch
  // painted into it repeats every 8 m and reads as a grid down the avenues. Cracks (block + alligator), tar-sealed
  // "snakes" and rolled-in repair patches are drawn by the world-anchored ground layer of the macro shader instead
  // (90_api.js, userData.txGround), so they never repeat.
  // Material-scale detail stays in the tile (it is below the size at which repetition reads): exposed aggregate with sparkle
  // and polished stone tops, a few thin tar-sealed crack "snakes" (glossy in the roughness map), small oil drips. Lane
  // textures (lines / dashed / crosswalk, V = travel direction) also get polished wheel paths and an oil-darkened lane
  // centre. Gloss is written to X.gloss[name] and subtracted from the derived roughness map (buildRoughCanvas).
  X.gloss = X.gloss || {};
  function tarSnake(ctx, gc, hc, w, h, r, len, width) {
    let x = r() * w,
      y = r() * h,
      head = r() * Math.PI * 2;
    const pts = [[x, y]];
    for (let s = 0; s < len; s++) {
      head += (r() - 0.5) * 0.5;
      x += Math.cos(head) * w * 0.012;
      y += Math.sin(head) * w * 0.012;
      pts.push([x, y]);
    }
    const bx = Math.min(...pts.map((p) => p[0])),
      ex = Math.max(...pts.map((p) => p[0])),
      by = Math.min(...pts.map((p) => p[1])),
      ey = Math.max(...pts.map((p) => p[1]));
    const wv = pts.map(() => width * (0.7 + r() * 0.6));
    X.wrap(
      w,
      h,
      (bx + ex) / 2,
      (by + ey) / 2,
      Math.max(ex - bx, ey - by) / 2 + width * 2,
      (xx, yy) => {
        const ox = xx - (bx + ex) / 2,
          oy = yy - (by + ey) / 2;
        for (const [g, col, k] of [
          [ctx, "rgba(18,17,16,0.82)", 1],
          [gc, "rgba(255,255,255,0.8)", 1],
          [hc, "#9c9c9c", 1.1],
        ]) {
          if (!g) continue;
          g.save();
          g.strokeStyle = col;
          g.lineCap = "round";
          g.lineJoin = "round";
          for (let i = 1; i < pts.length; i++) {
            const t = i / pts.length;
            g.lineWidth =
              wv[i] *
              k *
              (0.45 + 0.55 * Math.sin(Math.PI * Math.min(1, t * 1.05)));
            g.beginPath();
            g.moveTo(pts[i - 1][0] + ox, pts[i - 1][1] + oy);
            g.lineTo(pts[i][0] + ox, pts[i][1] + oy);
            g.stroke();
          }
          g.restore();
        }
      },
    );
  }
