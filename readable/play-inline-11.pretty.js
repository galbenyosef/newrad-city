/* src/textures/10_surfaces.js */
/* =====================================================================
 * NEW RAD CITY — TEXTURES: tileable surface materials
 * Owned by: textures.
 *
 * Each X.def(name, spec) registers a lazy generator:
 *   spec = { w, h, meters (world size of one tile), normal (height→normal
 *            strength, 0 = none), rough, metal, alpha, gen(ctx,w,h,r,hctx) }
 * The height canvas (hctx) starts mid-grey; draw darker = lower.
 * All generators are seamless (tileable) in both directions.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const X = G._tx;
  const def = (X.def = function (name, spec) {
    X.GEN[name] = spec;
    spec.name = name;
  });
  const TAU = Math.PI * 2;

  // ------------------------------------------------------------------
  // Shared building blocks
  // ------------------------------------------------------------------
  /** Ramp-coloured fbm base with per-pixel grain. */
  function noiseBase(ctx, w, h, r, stops, o) {
    o = o || {};
    const n1 = X.fbm(w, h, {
      scale: o.scale || 4,
      octaves: o.oct || 6,
      seed: o.seed || 11,
      persist: o.persist || 0.55,
    });
    const n2 =
      o.detail === 0
        ? null
        : X.fbm(w, h, {
            scale: o.dscale || 32,
            octaves: 3,
            seed: (o.seed || 11) + 5,
          });
    const lut = X.ramp(stops).lut,
      grain = o.grain === undefined ? 12 : o.grain,
      mixd = o.mix === undefined ? 0.3 : o.mix;
    const img = ctx.createImageData(w, h),
      d = img.data;
    for (let i = 0, o4 = 0; i < w * h; i++, o4 += 4) {
      const v = n2 ? n1[i] * (1 - mixd) + n2[i] * mixd : n1[i];
      const li = (v <= 0 ? 0 : v >= 1 ? 255 : (v * 255) | 0) * 3,
        g = (r() - 0.5) * grain;
      d[o4] = lut[li] + g;
      d[o4 + 1] = lut[li + 1] + g;
      d[o4 + 2] = lut[li + 2] + g;
      d[o4 + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    return { n1, n2 };
  }
  /** Write a height field (fn(i) → 0..1) into the height canvas. */
  function heightFrom(hctx, w, h, fn) {
    if (!hctx) return;
    const img = hctx.createImageData(w, h),
      d = img.data;
    for (let i = 0, o4 = 0; i < w * h; i++, o4 += 4) {
      const v = fn(i) * 255;
      d[o4] = d[o4 + 1] = d[o4 + 2] = v;
      d[o4 + 3] = 255;
    }
    hctx.putImageData(img, 0, 0);
  }
  /** Large-scale dirt/AO variation to break up tiling. */
  // Tile-scale grime is kept weak on the small seamless surfaces (≤ 4–8 m tiles): a 2-cycle blotch pattern repeating every
  // 2.7–4 m reads as camouflage on a big blank wall from a distance. Large-scale variation comes from the world-space macro
  // shader (90_api.js) instead, which never repeats. Façade atlases (14 × 21 m) keep the full strength (X.macroGrime).
  function macroGrimeFull(ctx, w, h, amt, seed) {
    X.modulate(
      ctx,
      w,
      h,
      X.fbm(w, h, { scale: 2, octaves: 4, seed: seed || 5 }),
      amt || 0.35,
    );
  }
  function macroGrime(ctx, w, h, amt, seed) {
    macroGrimeFull(ctx, w, h, (amt || 0.35) * 0.4, seed);
  }
  X.noiseBase = noiseBase;
  X.heightFrom = heightFrom;
  X.macroGrime = macroGrimeFull;

  // ==================================================================
  // CONCRETE family
  // ==================================================================
  function concreteGen(stops, dark) {
    return function (ctx, w, h, r, hc) {
      const { n2 } = noiseBase(ctx, w, h, r, stops, {
        scale: 3,
        seed: dark ? 21 : 11,
        grain: 16,
      });
      // aggregate specks & air pits
      X.speckle(ctx, w, h, r, {
        count: w * 3,
        colors: ["#4a4843", "#b8b4a8", "#6a655c"],
        min: 0.4,
        max: 1.6,
        alpha: 0.5,
      });
      heightFrom(
        hc,
        w,
        h,
        (i) => 0.5 + (n2[i] - 0.5) * 0.35 + (r() - 0.5) * 0.08,
      );
      // bugholes (air pits): mostly pin-pricks, a few larger ones, clustered in bands (the top of each pour) — a uniform scatter
      // of equal dark dots read as leopard spots on barriers and blocks
      for (let b = 0; b < 3; b++) {
        const by = r() * h,
          bhh = h * (0.04 + r() * 0.08);
        for (let q = 0; q < w / 10; q++) {
          const x = r() * w,
            y = by + (r() - 0.5) * bhh,
            s0 = 0.4 + Math.pow(r(), 3) * 1.6;
          ctx.fillStyle =
            "rgba(52,49,44," + (0.35 + r() * 0.25).toFixed(2) + ")";
          ctx.fillRect(x, ((y % h) + h) % h, s0, s0 * (0.8 + r() * 0.4));
          hc.fillStyle = "#4a4a4a";
          hc.fillRect(x, ((y % h) + h) % h, s0, s0);
        }
      }
      X.speckle(ctx, w, h, r, {
        count: w / 8,
        colors: ["#3a3731"],
        min: 0.4,
        max: 1.4,
        alpha: 0.45,
      });
      // water stains, soot, rust bleed: power-law sizes, gathered around a few runoff paths (no even scatter)
      X.blotches(ctx, w, h, r, {
        count: 9,
        color: "#3b362c",
        alpha: dark ? 0.3 : 0.18,
        rmin: w * 0.02,
        rmax: w * 0.2,
        pow: 2.5,
        cluster: 2,
      });
      X.blotches(ctx, w, h, r, {
        count: 3,
        color: "#7a4a24",
        alpha: 0.14,
        rmin: w * 0.01,
        rmax: w * 0.08,
        pow: 2.5,
        cluster: 1,
      });
      if (dark)
        X.blotches(ctx, w, h, r, {
          count: 6,
          color: "#2c3a22",
          alpha: 0.22,
          rmin: w * 0.02,
          rmax: w * 0.12,
          pow: 2,
          cluster: 2,
        }); // moss/damp
      X.streaks(ctx, w, h, r, {
        count: 22,
        color: "#2a261e",
        alpha: dark ? 0.22 : 0.14,
        maxLen: h * 0.4,
        maxW: 10,
      });
      X.cracks(
        ctx,
        w,
        h,
        r,
        {
          count: dark ? 6 : 4,
          width: 1.3,
          seg: w * 0.012,
          steps: 40,
          color: "rgba(25,22,18,0.75)",
          highlight: "rgba(200,195,180,0.25)",
        },
        hc,
      );
      macroGrime(ctx, w, h, 0.3, dark ? 31 : 13);
    };
  }
  def("concrete", {
    meters: 4,
    normal: 1.4,
    rough: 0.93,
    desc: "weathered cast concrete",
    gen: concreteGen([
      [0, "#77736a"],
      [0.5, "#949086"],
      [1, "#aaa598"],
    ]),
  });
  def("concrete_dark", {
    meters: 4,
    normal: 1.6,
    rough: 0.9,
    desc: "damp, sooty concrete",
    gen: concreteGen(
      [
        [0, "#45423c"],
        [0.5, "#5e5a52"],
        [1, "#747066"],
      ],
      true,
    ),
  });
  def("concrete_panel", {
    meters: 6,
    normal: 3,
    rough: 0.9,
    desc: "precast panels with tie-holes & seams",
    gen(ctx, w, h, r, hc) {
      concreteGen([
        [0, "#7c786f"],
        [0.5, "#96928a"],
        [1, "#aca79c"],
      ])(ctx, w, h, r, hc);
      const n = 2,
        pw = w / n,
        ph = h / n;
      for (let i = 0; i < n; i++)
        for (let j = 0; j < n; j++) {
          const x = i * pw,
            y = j * ph;
          ctx.fillStyle = X.css("#000", 0.05 + r() * 0.08);
          ctx.fillRect(x, y, pw, ph); // per-panel tone
          ctx.strokeStyle = "rgba(30,28,24,0.9)";
          ctx.lineWidth = 3;
          ctx.strokeRect(x + 1.5, y + 1.5, pw - 3, ph - 3);
          hc.strokeStyle = "#202020";
          hc.lineWidth = 5;
          hc.strokeRect(x + 1.5, y + 1.5, pw - 3, ph - 3);
          for (let a = 0; a < 3; a++)
            for (let b = 0; b < 3; b++) {
              // form-tie holes
              const hx = x + pw * (0.2 + a * 0.3),
                hy = y + ph * (0.2 + b * 0.3);
              ctx.fillStyle = "rgba(35,32,28,0.85)";
              ctx.beginPath();
              ctx.arc(hx, hy, 3.2, 0, TAU);
              ctx.fill();
              hc.fillStyle = "#303030";
              hc.beginPath();
              hc.arc(hx, hy, 3.5, 0, TAU);
              hc.fill();
              X.streaks(ctx, w, h, r, {
                count: 1,
                color: "#4a3a28",
                alpha: 0.15,
                minLen: 10,
                maxLen: ph * 0.3,
                maxW: 4,
              });
            }
        }
    },
  });
  // Pavement: four 1.5 m slabs per tile, each with its own tone, roughness, tilt (height ramp) and settlement; joints are
  // dirt-filled grooves of varying width with chipped arrises (not graphic black lines); black chewing-gum spots, a little
  // rust bleed, weeds in the joints, cracks with varying width and spalled edges.
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
  function asphaltBase(ctx, w, h, r, hc, seed, name, lanes) {
    const { n1, n2 } = noiseBase(
      ctx,
      w,
      h,
      r,
      [
        [0, "#3e3e3d"],
        [0.45, "#51504d"],
        [0.75, "#5d5b56"],
        [1, "#6a6760"],
      ],
      { scale: 3, seed: seed || 61, grain: 22, dscale: 64, mix: 0.35 },
    );
    const G2 = X.canvas(w, h),
      gc = G2.ctx;
    gc.fillStyle = "#000";
    gc.fillRect(0, 0, w, h);
    // exposed aggregate: raised stones in the height field (fine grain in the normal map), a few dark voids
    const agg = X.worley(w, h, { cells: 150, seed: (seed || 61) + 4 });
    heightFrom(
      hc,
      w,
      h,
      (i) =>
        0.5 +
        (n2[i] - 0.5) * 0.12 +
        Math.max(0, 0.16 - agg.f1[i] * 1.6) * 1.4 +
        (r() - 0.5) * 0.08,
    );
    X.speckle(ctx, w, h, r, {
      count: w * 5,
      colors: ["#8a8781", "#9e9a90", "#6d6a64", "#2a2a2a"],
      min: 0.5,
      max: 1.8,
      alpha: 0.6,
    });
    const img = ctx.getImageData(0, 0, w, h),
      d = img.data;
    const wear = lanes
      ? X.fbm(w, h, { scale: 2, sy: 6, octaves: 3, seed: (seed || 61) + 9 })
      : null;
    for (let i = 0; i < w * h; i++) {
      // polished stone tops catch the light, binder between them is darker
      let k =
        1 +
        Math.max(0, 0.12 - agg.f1[i]) * 1.1 -
        Math.max(0, agg.f1[i] - 0.3) * 0.25;
      const o = i * 4;
      if (lanes) {
        // lanes run along V: wheel paths ±0.9 m around each lane centre (polished, a touch darker and glossier),
        // oil / rubber drippings concentrated in the lane centre
        const u = (i % w) / w;
        let wp = 0,
          oil = 0;
        for (const c of lanes) {
          const du = Math.abs(u - c);
          wp = Math.max(
            wp,
            Math.exp(-Math.pow(Math.abs(du - 0.112) / 0.03, 2)),
          );
          oil = Math.max(oil, Math.exp(-Math.pow(du / 0.035, 2)));
        }
        const mod = 0.6 + 0.8 * wear[i];
        k *= 1 - 0.07 * wp * mod - 0.2 * oil * Math.max(0, wear[i] * 1.6 - 0.4);
        const gl = wp * mod * 60 + oil * 50 * wear[i];
        if (gl > 1) {
          const gi = G2._img || (G2._img = gc.getImageData(0, 0, w, h));
          gi.data[o] = gi.data[o + 1] = gi.data[o + 2] = Math.min(255, gl);
        }
      }
      d[o] *= k;
      d[o + 1] *= k;
      d[o + 2] *= k;
      // faint dusty, sun-bleached areas (kept weak: they repeat with the tile)
      if (n1[i] > 0.72) {
        const t = (n1[i] - 0.72) * 0.6;
        d[o] += (150 - d[o]) * t;
        d[o + 1] += (140 - d[o + 1]) * t;
        d[o + 2] += (120 - d[o + 2]) * t;
      }
    }
    ctx.putImageData(img, 0, 0);
    if (G2._img) gc.putImageData(G2._img, 0, 0);
    // quartz sparkle in the aggregate (tiny bright specks; they also polish → glossy)
    X.speckle(ctx, w, h, r, {
      count: w * 2,
      colors: ["#c8c4b8", "#b2aea2"],
      min: 0.4,
      max: 1.1,
      alpha: 0.55,
    });
    // small oil drips: clusters of a few spots, not an even scatter
    for (let c = 0; c < 3; c++) {
      const cx = r() * w,
        cy = r() * h;
      for (let q = 0; q < 3 + ((r() * 5) | 0); q++) {
        const x = cx + (r() - 0.5) * w * 0.06,
          y = cy + (r() - 0.5) * w * 0.12,
          radius = 1.5 + Math.pow(r(), 2.5) * w * 0.018;
        X.wrap(w, h, x, y, radius, (xx, yy) => {
          const g = ctx.createRadialGradient(xx, yy, 0, xx, yy, radius);
          g.addColorStop(0, "rgba(12,12,12,0.35)");
          g.addColorStop(1, "rgba(12,12,12,0)");
          ctx.fillStyle = g;
          ctx.fillRect(xx - radius, yy - radius, radius * 2, radius * 2);
          const g2 = gc.createRadialGradient(xx, yy, 0, xx, yy, radius);
          g2.addColorStop(0, "rgba(255,255,255,0.35)");
          g2.addColorStop(1, "rgba(255,255,255,0)");
          gc.fillStyle = g2;
          gc.fillRect(xx - radius, yy - radius, radius * 2, radius * 2);
        });
      }
    }
    // a couple of thin, meandering tar-sealed cracks (the big network is world-space)
    for (let k = 0; k < 2; k++)
      tarSnake(ctx, gc, hc, w, h, r, 14 + ((r() * 18) | 0), 2.5 + r() * 2.5);
    X.blotches(ctx, w, h, r, {
      count: 5,
      color: "#6e5f48",
      alpha: 0.1,
      rmin: w * 0.05,
      rmax: w * 0.14,
      pow: 2,
    }); // blown dust
    macroGrime(ctx, w, h, 0.2, (seed || 61) + 3);
    if (name) {
      const s2 = Math.min(256, w),
        sm = X.canvas(s2, Math.round((s2 * h) / w));
      sm.ctx.drawImage(G2.c, 0, 0, sm.w, sm.h);
      X.gloss[name] = sm.c;
    }
  }
  function roadPaint(ctx, x0, y0, x1, y1, width, color, r, hc) {
    // worn paint: draw the line, then erase random chunks
    ctx.save();
    ctx.strokeStyle = X.css(color, 0.8);
    ctx.lineWidth = width;
    ctx.lineCap = "butt";
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
    ctx.globalCompositeOperation = "source-atop";
    ctx.restore();
  }
  function wearPaint(ctx, w, h, r, color, drawFn) {
    // draw paint on a separate layer, erode it, composite it on top
    const L = X.canvas(w, h),
      c = L.ctx;
    drawFn(c);
    c.globalCompositeOperation = "destination-out";
    const n = X.fbm(w, h, { scale: 8, octaves: 4, seed: 71 });
    const img = c.getImageData(0, 0, w, h),
      d = img.data;
    for (let i = 0; i < w * h; i++) {
      const o = i * 4;
      if (!d[o + 3]) continue;
      const keep = n[i] * 1.3 - 0.25 + (r() - 0.5) * 0.35;
      d[o + 3] = Math.max(0, Math.min(d[o + 3], d[o + 3] * keep));
    }
    c.putImageData(img, 0, 0);
    ctx.drawImage(L.c, 0, 0);
  }
  X.wearPaint = wearPaint;
  def("asphalt", {
    roughVar: 0.35,
    meters: 8,
    normal: 2.2,
    rough: 0.95,
    desc: "worn city asphalt: aggregate, tar-sealed cracks, oil drips (big damage is world-space)",
    gen: (ctx, w, h, r, hc) => asphaltBase(ctx, w, h, r, hc, 61, "asphalt"),
  });
  def("asphalt_lines", {
    roughVar: 0.35,
    meters: 8,
    normal: 2.2,
    rough: 0.95,
    desc: "asphalt with faded double-yellow centre line along V at u=0.5",
    gen(ctx, w, h, r, hc) {
      asphaltBase(ctx, w, h, r, hc, 63, "asphalt_lines", [0.29, 0.71]);
      wearPaint(ctx, w, h, r, "#d8b23a", (c) => {
        c.fillStyle = "#d6ae36";
        c.fillRect(w / 2 - 11, 0, 7, h);
        c.fillRect(w / 2 + 4, 0, 7, h);
      });
    },
  });
  def("asphalt_dashed", {
    roughVar: 0.35,
    meters: 8,
    normal: 2.2,
    rough: 0.95,
    desc: "asphalt with faded white dashed lane line along V at u=0.5",
    gen(ctx, w, h, r, hc) {
      asphaltBase(ctx, w, h, r, hc, 65, "asphalt_dashed", [0.29, 0.71]);
      wearPaint(ctx, w, h, r, "#ddd", (c) => {
        c.fillStyle = "#e4e0d4";
        c.fillRect(w / 2 - 5, 0, 10, h * 0.4);
      });
    },
  });
  def("crosswalk", {
    roughVar: 0.35,
    meters: 8,
    normal: 2.2,
    rough: 0.95,
    desc: "asphalt with faded zebra bars running along V",
    gen(ctx, w, h, r, hc) {
      asphaltBase(ctx, w, h, r, hc, 67, "crosswalk");
      wearPaint(ctx, w, h, r, "#ddd", (c) => {
        c.fillStyle = "#e6e2d6";
        for (let i = 0; i < 4; i++)
          c.fillRect((i * w) / 4 + w / 16, 0, w / 8, h);
      });
    },
  });
  def("cobblestone", {
    meters: 3,
    normal: 4,
    rough: 0.85,
    desc: "granite Belgian-block paving (old NYC)",
    gen(ctx, w, h, r, hc) {
      ctx.fillStyle = "#3a3630";
      ctx.fillRect(0, 0, w, h);
      const rows = 12,
        rh = h / rows;
      for (let j = 0; j < rows; j++) {
        let x = (j % 2) * rh * 0.8;
        const y = j * rh;
        while (x < w + rh) {
          const bw = rh * (1.4 + r() * 0.7);
          const col = X.jitter(
            r() < 0.3 ? "#6e6b66" : r() < 0.5 ? "#7a746c" : "#5f5c58",
            r,
            0.15,
          );
          X.wrap(w, h, x + bw / 2, y + rh / 2, bw, (cx, cy) => {
            X.rrect(ctx, cx - bw / 2 + 2, cy - rh / 2 + 2, bw - 4, rh - 4, 5);
            const g = ctx.createLinearGradient(0, cy - rh / 2, 0, cy + rh / 2);
            g.addColorStop(0, X.css(X.shade(col, 0.18)));
            g.addColorStop(1, X.css(X.shade(col, -0.25)));
            ctx.fillStyle = g;
            ctx.fill();
            X.rrect(hc, cx - bw / 2 + 2, cy - rh / 2 + 2, bw - 4, rh - 4, 6);
            const hg = hc.createRadialGradient(cx, cy, 0, cx, cy, bw * 0.6);
            hg.addColorStop(0, "#e0e0e0");
            hg.addColorStop(1, "#707070");
            hc.fillStyle = hg;
            hc.fill();
          });
          x += bw;
        }
      }
      hc.globalCompositeOperation = "source-over";
      X.speckle(ctx, w, h, r, {
        count: 3000,
        colors: ["#222", "#aaa59a", "#8c6f60"],
        min: 0.3,
        max: 1.2,
        alpha: 0.5,
      });
      X.blotches(ctx, w, h, r, { count: 8, color: "#2a2418", alpha: 0.3 });
      macroGrime(ctx, w, h, 0.3, 81);
    },
  });

  // ==================================================================
  // BRICK
  // ==================================================================
  // Common-bond brick (a header course every 6th course, 35 % of the header ends dark-flashed) laid by hand: course heights and
  // joint widths wander, arrises are worn round, tone follows soft clusters of bricks (firing batch / weathering) with only a
  // little per-brick variation, mortar is recessed and dirt-filled (darker in the upper shadowed half of each bed joint), grey
  // cement repointing is smeared flush over the edges, spalls are rare and show the lighter, rougher core. No mortar-coloured
  // chips, no dark-brick checkerboard; big damage clusters, rising damp and salt blooms come from the world-space brick layer
  // (90_api.js, userData.txBrick) because anything large painted here would repeat every 3 m.
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
  def("metal_panel", {
    roughVar: 0.5,
    meters: 2,
    normal: 3,
    rough: 0.5,
    metal: 0.7,
    desc: "riveted steel plates (1 m panels)",
    gen(ctx, w, h, r, hc) {
      const { n2 } = noiseBase(
        ctx,
        w,
        h,
        r,
        [
          [0, "#5d6266"],
          [0.5, "#767b7e"],
          [1, "#8c9092"],
        ],
        { scale: 4, seed: 191, grain: 8, dscale: 64 },
      );
      heightFrom(hc, w, h, (i) => 0.6 + (n2[i] - 0.5) * 0.05);
      const n = 2,
        s = w / n;
      for (let i = 0; i < n; i++)
        for (let j = 0; j < n; j++) {
          const x = i * s,
            y = j * s;
          ctx.fillStyle =
            r() < 0.5 ? X.css("#000", r() * 0.12) : X.css("#fff", r() * 0.06);
          ctx.fillRect(x, y, s, s);
          // brushed direction per plate
          ctx.strokeStyle = "rgba(255,255,255,0.03)";
          ctx.lineWidth = 1;
          for (let q = 0; q < 60; q++) {
            const yy = y + r() * s;
            ctx.beginPath();
            ctx.moveTo(x, yy);
            ctx.lineTo(x + s, yy + (r() - 0.5) * 3);
            ctx.stroke();
          }
          // seam
          ctx.fillStyle = "rgba(15,15,15,0.9)";
          ctx.fillRect(x, y, s, 3);
          ctx.fillRect(x, y, 3, s);
          ctx.fillStyle = "rgba(200,205,205,0.25)";
          ctx.fillRect(x + 3, y + 3, s - 3, 1.5);
          ctx.fillRect(x + 3, y + 3, 1.5, s - 3);
          hc.fillStyle = "#202020";
          hc.fillRect(x - 1, y - 1, s + 2, 5);
          hc.fillRect(x - 1, y - 1, 5, s + 2);
          // rivets
          const nr = 8;
          for (let k = 0; k < nr; k++) {
            for (const [rx, ry] of [
              [x + 12, y + 12 + (k * (s - 24)) / (nr - 1)],
              [x + 12 + (k * (s - 24)) / (nr - 1), y + 12],
            ]) {
              const g = ctx.createRadialGradient(
                rx - 1.5,
                ry - 1.5,
                0.5,
                rx,
                ry,
                5,
              );
              g.addColorStop(0, "#c8cccc");
              g.addColorStop(0.6, "#6a6e70");
              g.addColorStop(1, "rgba(20,20,20,0.9)");
              ctx.fillStyle = g;
              ctx.beginPath();
              ctx.arc(rx, ry, 4.5, 0, TAU);
              ctx.fill();
              hc.fillStyle = "#f0f0f0";
              hc.beginPath();
              hc.arc(rx, ry, 4, 0, TAU);
              hc.fill();
              if (r() < 0.35)
                X.streaks(ctx, w, h, r, {
                  count: 1,
                  color: "#6a3010",
                  alpha: 0.35,
                  minLen: 10,
                  maxLen: 60,
                  maxW: 5,
                });
            }
          }
        }
      X.blotches(ctx, w, h, r, {
        count: 7,
        color: "#5a2c10",
        alpha: 0.28,
        rmin: 8,
        rmax: 40,
      });
      X.blotches(ctx, w, h, r, { count: 8, color: "#161616", alpha: 0.2 });
      macroGrime(ctx, w, h, 0.25, 193);
    },
  });
  def("metal_scratched", {
    roughVar: 0.5,
    meters: 1,
    normal: 0,
    rough: 0.4,
    metal: 0.9,
    desc: "brushed/scratched bare steel",
    gen(ctx, w, h, r) {
      const n = X.fbm(w, h, { scale: 64, sy: 2, octaves: 3, seed: 201 });
      X.fillPixels(ctx, w, h, (i) => {
        const v = 150 + n[i] * 40 + (r() - 0.5) * 20;
        return [v, v + 2, v + 4];
      });
      ctx.lineCap = "round";
      for (let k = 0; k < 400; k++) {
        const x = r() * w,
          y = r() * h,
          a = r() * TAU,
          l = 3 + r() * 30;
        ctx.strokeStyle =
          r() < 0.5 ? "rgba(240,240,240,0.25)" : "rgba(40,40,40,0.25)";
        ctx.lineWidth = 0.5 + r() * 0.6;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l);
        ctx.stroke();
      }
      X.blotches(ctx, w, h, r, { count: 10, color: "#3a3228", alpha: 0.25 });
      X.blotches(ctx, w, h, r, {
        count: 4,
        color: "#7a3c14",
        alpha: 0.25,
        rmin: 5,
        rmax: 25,
      });
    },
  });
  def("metal_diamond", {
    roughVar: 0.55,
    meters: 1,
    normal: 3,
    rough: 0.45,
    metal: 0.8,
    desc: "diamond tread plate",
    gen(ctx, w, h, r, hc) {
      noiseBase(
        ctx,
        w,
        h,
        r,
        [
          [0, "#484a4a"],
          [1, "#6e706e"],
        ],
        { scale: 4, seed: 211, grain: 8 },
      );
      heightFrom(hc, w, h, () => 0.4);
      const s = w / 12;
      for (let j = 0; j < 12; j++)
        for (let i = 0; i < 12; i++) {
          const cx = i * s + ((j % 2) * s) / 2,
            cy = j * s + s / 2,
            a = (j % 2 ? 1 : -1) * 0.785;
          X.wrap(w, h, cx, cy, s, (x, y) => {
            for (const [g2, c] of [
              [ctx, "rgba(210,212,208,0.7)"],
              [hc, "#e0e0e0"],
            ]) {
              g2.save();
              g2.translate(x, y);
              g2.rotate(a);
              g2.fillStyle = c;
              X.rrect(g2, -s * 0.36, -s * 0.07, s * 0.72, s * 0.14, s * 0.07);
              g2.fill();
              g2.restore();
            }
            ctx.save();
            ctx.translate(x + 1.2, y + 1.2);
            ctx.rotate(a);
            ctx.fillStyle = "rgba(0,0,0,0.35)";
            X.rrect(ctx, -s * 0.36, -s * 0.07, s * 0.72, s * 0.14, s * 0.07);
            ctx.fill();
            ctx.restore();
          });
        }
      X.blotches(ctx, w, h, r, {
        count: 8,
        color: "#5a2c10",
        alpha: 0.3,
        rmin: 10,
        rmax: 60,
      });
      X.blotches(ctx, w, h, r, { count: 6, color: "#101010", alpha: 0.3 });
    },
  });
  def("corrugated", {
    roughVar: 0.6,
    meters: 2,
    normal: 5,
    rough: 0.55,
    metal: 0.6,
    desc: "galvanized corrugated sheet (ridges along V)",
    gen(ctx, w, h, r, hc) {
      const ridges = 16;
      const n = X.fbm(w, h, { scale: 4, octaves: 5, seed: 221 }),
        sp = X.fbm(w, h, { scale: 32, octaves: 2, seed: 222 });
      const rustN = X.fbm(w, h, { scale: 3, octaves: 5, seed: 223 });
      const rr = X.ramp([
        [0, "#3a1c0c"],
        [0.5, "#7a3a16"],
        [1, "#a8662c"],
      ]);
      X.fillPixels(ctx, w, h, (i, x) => {
        const s = Math.sin((x / w) * ridges * TAU),
          shade = 0.78 + s * 0.22;
        let c = [128 + sp[i] * 40, 132 + sp[i] * 40, 134 + sp[i] * 38];
        const rust = rustN[i] * 0.8 + n[i] * 0.3;
        if (rust > 0.62) {
          const t = Math.min(1, (rust - 0.62) * 5);
          const rc = rr(n[i]);
          c = [
            c[0] + (rc[0] - c[0]) * t,
            c[1] + (rc[1] - c[1]) * t,
            c[2] + (rc[2] - c[2]) * t,
          ];
        }
        const g = (r() - 0.5) * 10;
        return [c[0] * shade + g, c[1] * shade + g, c[2] * shade + g];
      });
      heightFrom(
        hc,
        w,
        h,
        (i) => 0.5 + 0.45 * Math.sin(((i % w) / w) * ridges * TAU),
      );
      X.streaks(ctx, w, h, r, {
        count: 40,
        color: "#4a2210",
        alpha: 0.3,
        maxLen: h * 0.7,
        maxW: 6,
      });
      // nail/screw line & a lap seam
      for (let k = 0; k < ridges; k++) {
        const x = ((k + 0.25) / ridges) * w;
        for (const y of [h * 0.1, h * 0.6]) {
          ctx.fillStyle = "#2a2a2a";
          ctx.beginPath();
          ctx.arc(x, y, 2.4, 0, TAU);
          ctx.fill();
          X.streaks(ctx, w, h, r, {
            count: r() < 0.4 ? 1 : 0,
            color: "#7a3810",
            alpha: 0.3,
            minLen: 10,
            maxLen: 50,
            maxW: 4,
          });
        }
      }
      // a few nail holes/bullet holes letting light through (dark)
      for (let k = 0; k < 5; k++) {
        ctx.fillStyle = "#0c0c0c";
        ctx.beginPath();
        ctx.arc(r() * w, r() * h, 1.5 + r() * 2, 0, TAU);
        ctx.fill();
      }
      macroGrime(ctx, w, h, 0.3, 225);
    },
  });
  def("copper_patina", {
    roughVar: 0.3,
    meters: 3,
    normal: 1.8,
    rough: 0.75,
    metal: 0.25,
    desc: "oxidised copper verdigris (Statue of Liberty)",
    gen(ctx, w, h, r, hc) {
      const n = X.fbm(w, h, { scale: 4, octaves: 6, seed: 231 }),
        n2 = X.fbm(w, h, { scale: 20, octaves: 3, seed: 232 });
      const ramp = X.ramp([
        [0, "#3a5a48"],
        [0.35, "#4f8a72"],
        [0.6, "#6aa88a"],
        [0.8, "#8cc2a2"],
        [1, "#b0d8bc"],
      ]);
      X.fillPixels(ctx, w, h, (i) => {
        const c = ramp(n[i] * 0.7 + n2[i] * 0.3),
          g = (r() - 0.5) * 10;
        return [c[0] + g, c[1] + g, c[2] + g];
      });
      heightFrom(hc, w, h, (i) => 0.5 + (n2[i] - 0.5) * 0.3);
      // dark streaks where rain runs + bronze-brown spots where patina has worn
      X.streaks(ctx, w, h, r, {
        count: 40,
        color: "#23352c",
        alpha: 0.3,
        maxLen: h * 0.6,
        maxW: 10,
      });
      X.blotches(ctx, w, h, r, {
        count: 6,
        color: "#5a4028",
        alpha: 0.3,
        rmin: 5,
        rmax: 30,
      });
      // faint riveted sheet seams
      ctx.strokeStyle = "rgba(30,50,40,0.45)";
      ctx.lineWidth = 1.5;
      for (let k = 0; k < 4; k++) {
        ctx.beginPath();
        ctx.moveTo(0, (k * h) / 4 + 10);
        for (let x = 0; x <= w; x += 16)
          ctx.lineTo(x, (k * h) / 4 + 10 + Math.sin(x * 0.02 + k) * 6);
        ctx.stroke();
      }
    },
  });
  def("bronze", {
    roughVar: 0.45,
    meters: 2,
    normal: 0,
    rough: 0.45,
    metal: 0.85,
    desc: "aged statuary bronze",
    gen(ctx, w, h, r) {
      noiseBase(
        ctx,
        w,
        h,
        r,
        [
          [0, "#3a2814"],
          [0.5, "#6a4a24"],
          [0.8, "#8a6a34"],
          [1, "#4a6a50"],
        ],
        { scale: 4, seed: 241, grain: 10 },
      );
      X.blotches(ctx, w, h, r, { count: 10, color: "#3c6a58", alpha: 0.35 });
      X.streaks(ctx, w, h, r, { count: 20, color: "#2a4a3a", alpha: 0.35 });
    },
  });
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
  def("plaster_stained", {
    meters: 3,
    normal: 1.5,
    rough: 0.95,
    desc: "old plaster: water stains, cracks, spalls revealing lath",
    gen(ctx, w, h, r, hc) {
      const { n2 } = noiseBase(
        ctx,
        w,
        h,
        r,
        [
          [0, "#a8a08a"],
          [0.5, "#c2b99f"],
          [1, "#d4ccb2"],
        ],
        { scale: 3, seed: 301, grain: 8 },
      );
      heightFrom(hc, w, h, (i) => 0.6 + (n2[i] - 0.5) * 0.1);
      // water stains: pale-brown blooms with darker tide-line rims
      // (soft-edged bloom, faint nested tide lines, a run of drips below; hard outlined blobs read as cartoon balloons)
      for (let k = 0; k < 5; k++) {
        const x = r() * w,
          y = r() * h,
          radius = w * (0.05 + r() * 0.1),
          ry = radius * (1 + r() * 0.6),
          sd = r() * 1e4;
        X.wrap(w, h, x, y, Math.max(radius, ry) * 1.6, (cx, cy) => {
          const rr = X.rng ? X.rng(sd) : r;
          ctx.save();
          ctx.filter = "blur(" + (2 + radius * 0.06).toFixed(1) + "px)";
          X.smoothBlob(ctx, cx, cy, radius, ry, rr, 12, 0.45);
          ctx.fillStyle = "rgba(140,110,60,0.12)";
          ctx.fill();
          ctx.restore();
          // tide lines: blurred, faint and broken (a crisp outline reads as a drawn ring)
          ctx.save();
          ctx.filter = "blur(1.4px)";
          for (let t = 0; t < 2; t++) {
            const kk = 1 - t * 0.28;
            X.smoothBlob(
              ctx,
              cx,
              cy + t * radius * 0.12,
              radius * kk,
              ry * kk,
              rr,
              12,
              0.45,
            );
            ctx.setLineDash([
              radius * (0.4 + r() * 0.6),
              radius * (0.15 + r() * 0.3),
            ]);
            ctx.strokeStyle =
              "rgba(110,78,34," + (0.1 - t * 0.04).toFixed(2) + ")";
            ctx.lineWidth = 1.5 + r();
            ctx.stroke();
          }
          ctx.restore();
          if (r() < 0.6) {
            const g = ctx.createLinearGradient(0, cy, 0, cy + ry * 2.5);
            g.addColorStop(0, "rgba(120,90,45,0.16)");
            g.addColorStop(1, "rgba(120,90,45,0)");
            ctx.fillStyle = g;
            for (let q = 0; q < 3; q++)
              ctx.fillRect(
                cx + (r() - 0.5) * radius,
                cy + ry * 0.6,
                1.5 + r() * 3,
                ry * (1 + r() * 1.5),
              );
          }
        });
      }
      // fallen plaster, per pixel from a noisy distance field (no polygon outlines): a soft AO halo, a crumbly broken edge of
      // the white finish coat, a stepped band of the darker brown scratch coat, then the lath — strips of random spacing and
      // a slight tilt, broken ends, dark cavity between them with plaster keys squeezed through, rusty nails at the studs.
      {
        const img = ctx.getImageData(0, 0, w, h),
          d = img.data,
          himg = hc.getImageData(0, 0, w, h),
          hd = himg.data;
        const pa = X.fbm(w, h, { scale: 28, octaves: 3, seed: 307 }),
          pb = X.fbm(w, h, { scale: 64, octaves: 2, seed: 308 });
        for (let k = 0; k < 4; k++) {
          const cx = r() * w,
            cy = r() * h,
            radius = 16 + r() * 30,
            sq = 0.6 + r() * 0.8;
          const sp = 5.5 + r() * 3,
            fill = 0.58 + r() * 0.14,
            tiltK = Math.tan((r() - 0.5) * 0.08),
            ph = r() * sp;
          const stud = w * 0.135,
            sOff = r() * stud,
            R = Math.ceil(radius * 2.9 * Math.max(1, sq));
          for (let yy = -R; yy <= R; yy++)
            for (let xx = -R; xx <= R; xx++) {
              const px = (((Math.round(cx) + xx) % w) + w) % w,
                py = (((Math.round(cy) + yy) % h) + h) % h,
                i = py * w + px,
                o = i * 4;
              const dn =
                (Math.hypot(xx, yy / sq) / radius) *
                  (1 + (pa[i] - 0.5) * 0.95) +
                (pb[i] - 0.5) * 0.16;
              if (dn > 1.45 || !(dn > -1)) continue;
              let c = [d[o], d[o + 1], d[o + 2]],
                hh = hd[o];
              const e1 = 0.93 + (pa[i] - 0.5) * 0.12,
                e2 = 0.7 + (pb[i] - 0.5) * 0.2 + (pa[i] - 0.5) * 0.18; // wandering step edges
              if (dn > 1.0) {
                const ao = 1 - 0.2 * (1 - (dn - 1.0) / 0.45);
                c = c.map((v) => v * ao);
              } // halo: dirt gathered at the break
              else if (dn > e1) {
                c = X.mix(
                  c,
                  [214, 206, 188],
                  0.3 * Math.max(0, pb[i] - 0.3) * 2,
                );
                hh = 146;
              } // crumbly broken edge of the finish coat
              else if (dn > e2) {
                c = X.mix([118, 104, 84], [146, 132, 108], pb[i]);
                hh = 112;
                if (yy < 0 && dn > e1 - 0.06) c = c.map((v) => v * 0.78);
              } // scratch coat (stepped down)
              else {
                const lv = (yy + xx * tiltK + ph) / sp,
                  f = lv - Math.floor(lv),
                  strip = Math.floor(lv);
                const broken = X.rng((strip * 7919 + k * 131) >>> 0)();
                const gapBreak =
                  broken < 0.25 &&
                  Math.abs(xx - (broken * 4 - 0.5) * radius) < radius * 0.25; // a snapped strip
                if (f < fill && !gapBreak) {
                  const e = Math.min(f, fill - f) / fill; // round the strip edges
                  c = X.mix(
                    [74, 58, 40],
                    [128, 104, 74],
                    Math.min(1, e * 3) * (0.7 + 0.3 * pb[i]),
                  );
                  hh = 70 + e * 40;
                  const nx = (((px - sOff) % stud) + stud) % stud; // nails where the strip crosses a stud
                  if (nx < 2.2 && f > fill * 0.3 && f < fill * 0.7) {
                    c = [92, 46, 22];
                    hh = 60;
                  } else if (nx < 3.5 && f > fill * 0.7)
                    c = X.mix(c, [110, 60, 30], 0.5); // rust bleed under the nail
                } else {
                  c = [26, 20, 15];
                  hh = 25; // cavity
                  if (pb[i] > 0.68 && f > fill + 0.08) {
                    c = [168, 158, 136];
                    hh = 55;
                  } // plaster keys pushed through
                }
                if (dn > 0.6) {
                  const ao = 0.55 + 0.45 * (1 - (dn - 0.6) / 0.14);
                  c = c.map((v) => v * (yy < 0 ? ao * 0.8 : ao));
                } // shadow under the coats
              }
              d[o] = c[0];
              d[o + 1] = c[1];
              d[o + 2] = c[2];
              hd[o] = hd[o + 1] = hd[o + 2] = hh;
            }
        }
        ctx.putImageData(img, 0, 0);
        hc.putImageData(himg, 0, 0);
      }
      X.cracks(
        ctx,
        w,
        h,
        r,
        { count: 6, width: 1, seg: 6, steps: 40, color: "rgba(60,50,40,0.75)" },
        hc,
      );
      X.streaks(ctx, w, h, r, {
        count: 14,
        color: "#6a5a3a",
        alpha: 0.15,
        maxW: 20,
      });
      X.blotches(ctx, w, h, r, { count: 5, color: "#39402a", alpha: 0.15 }); // mould
      macroGrime(ctx, w, h, 0.25, 305);
    },
  });
  def("wallpaper", {
    meters: 2,
    normal: 0,
    rough: 0.9,
    desc: "faded 1950s starburst-pattern wallpaper, peeling",
    gen(ctx, w, h, r, hc) {
      ctx.fillStyle = "#b8b08a";
      ctx.fillRect(0, 0, w, h);
      // vertical pinstripes
      for (let x = 0; x < w; x += w / 8) {
        ctx.fillStyle = "rgba(120,140,110,0.35)";
        ctx.fillRect(x, 0, 6, h);
      }
      // starbursts & boomerangs in a half-drop repeat
      const s = w / 4;
      for (let j = 0; j < 4; j++)
        for (let i = 0; i < 4; i++) {
          const cx = i * s + s / 2 + ((j % 2) * s) / 2,
            cy = j * s + s / 2;
          X.wrap(w, h, cx, cy, s, (x, y) => {
            ctx.strokeStyle = "rgba(160,80,60,0.55)";
            ctx.lineWidth = 1.5;
            for (let a = 0; a < 8; a++) {
              const an = (a / 8) * TAU;
              ctx.beginPath();
              ctx.moveTo(x, y);
              ctx.lineTo(
                x + Math.cos(an) * s * 0.2,
                y + Math.sin(an) * s * 0.2,
              );
              ctx.stroke();
            }
            ctx.fillStyle = "rgba(160,80,60,0.6)";
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, TAU);
            ctx.fill();
            ctx.fillStyle = "rgba(70,110,110,0.45)";
            ctx.beginPath();
            ctx.moveTo(x + s * 0.25, y + s * 0.3);
            ctx.quadraticCurveTo(
              x + s * 0.4,
              y + s * 0.15,
              x + s * 0.5,
              y + s * 0.35,
            );
            ctx.quadraticCurveTo(
              x + s * 0.4,
              y + s * 0.25,
              x + s * 0.25,
              y + s * 0.3,
            );
            ctx.fill();
          });
        }
      X.desaturate(ctx, w, h, 0.3);
      X.blotches(ctx, w, h, r, {
        count: 10,
        color: "#7a6040",
        alpha: 0.25,
        stretchY: 1.8,
      });
      X.streaks(ctx, w, h, r, {
        count: 20,
        color: "#5a4020",
        alpha: 0.2,
        maxW: 16,
      });
      // peeled strips showing plaster
      for (let k = 0; k < 4; k++) {
        const x = r() * w,
          y = r() * h,
          sw = 20 + r() * 40,
          sh = 40 + r() * 90;
        X.wrap(w, h, x, y, Math.max(sw, sh), (cx, cy) => {
          ctx.fillStyle = "#9c957e";
          X.blobPath(ctx, cx, cy, sw, r, 9, 0.6);
          ctx.fill();
          ctx.strokeStyle = "rgba(240,230,200,0.6)";
          ctx.lineWidth = 2;
          ctx.stroke();
        });
      }
      macroGrime(ctx, w, h, 0.3, 315);
    },
  });
  def("tile_subway", {
    roughVar: 0.6,
    meters: 1.2,
    normal: 2.5,
    rough: 0.35,
    desc: "white 3×6 subway tile, grimy grout",
    gen(ctx, w, h, r, hc) {
      ctx.fillStyle = "#6e685c";
      ctx.fillRect(0, 0, w, h);
      hc.fillStyle = "#404040";
      hc.fillRect(0, 0, w, h);
      const cols = 8,
        rows = 16,
        tw = w / cols,
        th = h / rows,
        gap = 2;
      for (let j = 0; j < rows; j++)
        for (let i = -1; i <= cols; i++) {
          const x = i * tw + ((j % 2) * tw) / 2,
            y = j * th;
          const c = X.jitter(r() < 0.04 ? "#9a9888" : "#dcd8cc", r, 0.05);
          const g = ctx.createLinearGradient(0, y, 0, y + th);
          g.addColorStop(0, X.css(X.shade(c, 0.1)));
          g.addColorStop(1, X.css(X.shade(c, -0.08)));
          ctx.fillStyle = g;
          X.rrect(ctx, x + gap / 2, y + gap / 2, tw - gap, th - gap, 3);
          ctx.fill();
          hc.fillStyle = "#d0d0d0";
          X.rrect(hc, x + gap / 2, y + gap / 2, tw - gap, th - gap, 3);
          hc.fill();
          if (r() < 0.05) {
            ctx.fillStyle = "#4a4438";
            ctx.beginPath();
            ctx.moveTo(x + r() * tw, y);
            ctx.lineTo(x + tw, y + r() * th);
            ctx.lineTo(x + tw, y);
            ctx.fill();
          } // broken corner
        }
      X.cracks(ctx, w, h, r, {
        count: 4,
        width: 1,
        seg: 6,
        steps: 30,
        color: "rgba(40,38,32,0.7)",
      });
      X.streaks(ctx, w, h, r, {
        count: 30,
        color: "#4a3e2a",
        alpha: 0.22,
        maxW: 16,
      });
      X.blotches(ctx, w, h, r, { count: 10, color: "#3a3428", alpha: 0.28 });
      macroGrime(ctx, w, h, 0.35, 325);
    },
  });
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
  def("rubble", {
    meters: 4,
    normal: 2.8,
    rough: 0.95,
    desc: "broken concrete, brick & plaster debris",
    gen(ctx, w, h, r, hc) {
      const wn = X.worley(w, h, { cells: 14, seed: 401 }),
        wn2 = X.worley(w, h, { cells: 34, seed: 402 });
      const n = X.fbm(w, h, { scale: 8, octaves: 4, seed: 403 });
      const pal = [
        X.hex("#8a867c"),
        X.hex("#9c978b"),
        X.hex("#6e6a62"),
        X.hex("#8a4a36"),
        X.hex("#a89c80"),
        X.hex("#5a5650"),
      ];
      const hv = new Float32Array(w * h);
      X.fillPixels(ctx, w, h, (i) => {
        const big = wn.f1[i] < 0.42 && wn.id[i] > 0.25;
        const W2 = big ? wn : wn2;
        const id = W2.id[i],
          c = pal[(id * pal.length) | 0];
        const dome = Math.max(0, 1 - W2.f1[i] * (big ? 2.4 : 1.6));
        const edge = W2.f2[i] - W2.f1[i];
        let k = 0.55 + dome * 0.5 + (n[i] - 0.5) * 0.25;
        if (edge < 0.04) k *= 0.35 + edge * 12;
        hv[i] = (big ? 0.35 : 0.1) + dome * 0.5;
        const g = (r() - 0.5) * 16;
        return [c[0] * k + g, c[1] * k + g, c[2] * k + g];
      });
      heightFrom(hc, w, h, (i) => hv[i]);
      // rebar bits & dust
      ctx.lineCap = "round";
      for (let k = 0; k < 16; k++) {
        const x = r() * w,
          y = r() * h,
          a = r() * TAU,
          l = 15 + r() * 40;
        ctx.strokeStyle = "#3a200e";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.quadraticCurveTo(
          x + Math.cos(a) * l * 0.5 + 6,
          y + Math.sin(a) * l * 0.5,
          x + Math.cos(a) * l,
          y + Math.sin(a) * l,
        );
        ctx.stroke();
        ctx.strokeStyle = "rgba(180,110,60,0.5)";
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
      X.blotches(ctx, w, h, r, { count: 10, color: "#b0a890", alpha: 0.25 }); // pulverised dust
      X.speckle(ctx, w, h, r, {
        count: 3000,
        colors: ["#c8c0a8", "#3a3228"],
        min: 0.3,
        max: 1.4,
        alpha: 0.6,
      });
    },
  });

  // ==================================================================
  // GLASS, WATER, SKY
  // ==================================================================
  def("glass_dirty", {
    w: 256,
    meters: 2,
    normal: 0,
    rough: 0.1,
    metal: 0.5,
    desc: "grimy window glass (use with transparent material)",
    gen(ctx, w, h, r) {
      noiseBase(
        ctx,
        w,
        h,
        r,
        [
          [0, "#7c8c88"],
          [1, "#a8b4ae"],
        ],
        { scale: 3, seed: 411, grain: 6 },
      );
      X.blotches(ctx, w, h, r, { count: 12, color: "#6a5a40", alpha: 0.35 });
      X.streaks(ctx, w, h, r, {
        count: 30,
        color: "#5a4a30",
        alpha: 0.3,
        maxW: 10,
      });
      // spider crack
      const cx = w * 0.6,
        cy = h * 0.4;
      ctx.strokeStyle = "rgba(235,240,235,0.55)";
      ctx.lineWidth = 0.8;
      for (let k = 0; k < 9; k++) {
        const a = (k / 9) * TAU + r() * 0.3;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        let x = cx,
          y = cy;
        for (let s = 0; s < 6; s++) {
          x += Math.cos(a + (r() - 0.5) * 0.5) * 10;
          y += Math.sin(a + (r() - 0.5) * 0.5) * 10;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      for (let rr = 8; rr < 40; rr += 11) {
        ctx.beginPath();
        ctx.arc(cx, cy, rr, 0, TAU);
        ctx.stroke();
      }
    },
  });
  def("water", {
    meters: 12,
    normal: 1.2,
    rough: 0.1,
    desc: "murky irradiated river water (colour + ripple normal)",
    gen(ctx, w, h, r, hc) {
      const n = X.fbm(w, h, { scale: 3, octaves: 5, seed: 421 }),
        rip = X.fbm(w, h, { scale: 12, octaves: 4, seed: 422 });
      const ramp = X.ramp([
        [0, "#1c2a1e"],
        [0.5, "#2e4030"],
        [0.8, "#3e5236"],
        [1, "#556a44"],
      ]);
      X.fillPixels(ctx, w, h, (i) => {
        const c = ramp(n[i]),
          s = Math.pow(Math.max(0, Math.sin(rip[i] * 30)), 12) * 30;
        return [c[0] + s, c[1] + s * 1.1, c[2] + s * 0.8];
      });
      heightFrom(
        hc,
        w,
        h,
        (i) => 0.5 + Math.sin(rip[i] * 30) * 0.25 + (n[i] - 0.5) * 0.2,
      );
      X.blotches(ctx, w, h, r, { count: 8, color: "#6a7a40", alpha: 0.15 }); // algae scum
    },
  });
  def("sky_clouds", {
    w: 1024,
    h: 512,
    meters: 1000,
    normal: 0,
    alpha: true,
    desc: "RGBA wispy cloud layer, tiles horizontally (for sky domes)",
    gen(ctx, w, h, r) {
      const n = X.fbm(w, h, {
          scale: 6,
          sy: 3,
          octaves: 7,
          seed: 431,
          persist: 0.55,
        }),
        n2 = X.fbm(w, h, { scale: 24, sy: 6, octaves: 3, seed: 432 });
      X.fillPixels(ctx, w, h, (i, x, y) => {
        const band = Math.sin((y / h) * Math.PI); // fade at top/bottom rows
        const v = n[i] * 0.8 + n2[i] * 0.2;
        const a = Math.max(0, Math.min(1, (v - 0.45) * 3.2)) * band;
        const lum = 200 + (v - 0.5) * 90 - (1 - a) * 40;
        return [lum, lum * 0.99, lum * 0.93, a * 255];
      });
    },
  });
  // CRT screen glow (text lines, scanlines). screen_green = generic green-tint CRT; screen_amber = teletype terminals.
  function screenGen(c0, c1, ink) {
    return function (ctx, w, h, r) {
      const g = ctx.createRadialGradient(
        w / 2,
        h / 2,
        10,
        w / 2,
        h / 2,
        w * 0.7,
      );
      g.addColorStop(0, c0);
      g.addColorStop(1, c1);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = ink;
      ctx.font = '11px "Share Tech Mono","Courier New",monospace';
      const lines = [
        "HALCYON TELEPRINTER  MODEL 9",
        "TELETYPE NETWORK LINK",
        "",
        "NODE C9 / MUNICIPAL",
        "",
        "> LOGIN",
        "> PASSCODE: ********",
        "> STATUS",
        "CORE MEMORY 64K WORDS",
        "TAPE UNITS 4 .... READY",
        "LINE PRINTER .... ONLINE",
        "",
        "AWAITING INPUT",
        "",
        "> _",
      ];
      lines.forEach((l, i) => ctx.fillText(l, 10, 16 + i * 10));
      for (let y = 0; y < h; y += 2) {
        ctx.fillStyle = "rgba(0,0,0,0.25)";
        ctx.fillRect(0, y, w, 1);
      }
    };
  }
  def("screen_green", {
    w: 256,
    h: 192,
    meters: 1,
    normal: 0,
    repeat: false,
    desc: "green-tint CRT screen glow (text lines, scanlines)",
    gen: screenGen("#0f3a1a", "#021006", "#6aff8a"),
  });
  def("screen_amber", {
    w: 256,
    h: 192,
    meters: 1,
    normal: 0,
    repeat: false,
    desc: "amber teletype-terminal screen glow (text lines, scanlines)",
    gen: screenGen("#3a2208", "#100602", "#ffb347"),
  });
  def("window_lit", {
    w: 128,
    h: 192,
    meters: 1.5,
    normal: 0,
    repeat: false,
    desc: "single warm-lit window (blinds, silhouette) — also emissive map",
    gen(ctx, w, h, r) {
      const g = ctx.createRadialGradient(
        w * 0.5,
        h * 0.35,
        5,
        w * 0.5,
        h * 0.4,
        h * 0.7,
      );
      g.addColorStop(0, "#ffe2a8");
      g.addColorStop(0.5, "#d8904a");
      g.addColorStop(1, "#5a2a10");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      // venetian blinds half down, a few bent slats
      const bl = h * (0.3 + r() * 0.2);
      for (let y = 0; y < bl; y += 6) {
        ctx.fillStyle = "rgba(60,40,20,0.55)";
        ctx.fillRect(0, y, w, 3.5);
        if (r() < 0.15) {
          ctx.fillStyle = "rgba(255,220,160,0.6)";
          ctx.fillRect(r() * w, y, 20, 3.5);
        }
      }
      // silhouette: lamp shade + chair back
      ctx.fillStyle = "rgba(40,20,10,0.75)";
      ctx.beginPath();
      ctx.moveTo(w * 0.15, h * 0.62);
      ctx.lineTo(w * 0.35, h * 0.62);
      ctx.lineTo(w * 0.3, h * 0.5);
      ctx.lineTo(w * 0.2, h * 0.5);
      ctx.fill();
      ctx.fillRect(w * 0.24, h * 0.62, 3, h * 0.3);
      X.rrect(ctx, w * 0.55, h * 0.6, w * 0.35, h * 0.4, 12);
      ctx.fill();
      // muntins/frame
      ctx.fillStyle = "#2a2018";
      ctx.fillRect(0, 0, w, 6);
      ctx.fillRect(0, h - 6, w, 6);
      ctx.fillRect(0, 0, 6, h);
      ctx.fillRect(w - 6, 0, 6, h);
      ctx.fillRect(0, h / 2 - 3, w, 6);
      X.blotches(ctx, w, h, r, { count: 6, color: "#3a2a10", alpha: 0.3 });
    },
  });

  // ==================================================================
  // FABRIC / ORGANIC
  // ==================================================================
  function weave(ctx, w, h, r, base, cell, seed) {
    const n = X.fbm(w, h, { scale: 4, octaves: 4, seed });
    const c = X.hex(base);
    X.fillPixels(ctx, w, h, (i, x, y) => {
      const a = (((x / cell) | 0) + ((y / cell) | 0)) % 2;
      const t = a
        ? Math.sin(((x % cell) / cell) * Math.PI)
        : Math.sin(((y % cell) / cell) * Math.PI);
      const k = 0.72 + t * 0.25 + (n[i] - 0.5) * 0.2 + (r() - 0.5) * 0.06;
      return [c[0] * k, c[1] * k, c[2] * k];
    });
  }
  X.weave = weave;
  def("fabric", {
    w: 256,
    meters: 0.5,
    normal: 0,
    rough: 1,
    desc: "woven canvas/cloth, neutral (tint via material colour)",
    gen(ctx, w, h, r) {
      weave(ctx, w, h, r, "#b0a68c", 4, 441);
      X.blotches(ctx, w, h, r, { count: 8, color: "#4a3a24", alpha: 0.25 });
    },
  });
  def("burlap", {
    w: 256,
    meters: 0.6,
    normal: 2,
    rough: 1,
    desc: "sandbag burlap",
    gen(ctx, w, h, r, hc) {
      weave(ctx, w, h, r, "#8a7650", 6, 451);
      heightFrom(hc, w, h, (i) => {
        const x = i % w,
          y = (i / w) | 0;
        return (
          0.5 +
          0.4 *
            ((((x / 6) | 0) + ((y / 6) | 0)) % 2
              ? Math.sin(((x % 6) / 6) * Math.PI)
              : Math.sin(((y % 6) / 6) * Math.PI))
        );
      });
      X.blotches(ctx, w, h, r, { count: 10, color: "#3a2a14", alpha: 0.3 });
    },
  });
  def("cryo_suit", {
    w: 256,
    meters: 0.5,
    normal: 1,
    rough: 0.85,
    desc: "Long Winter cryo suit: grey-white padded nylon, diamond quilting (collar ring: cryo_suit_orange material)",
    gen(ctx, w, h, r, hc) {
      const n = X.fbm(w, h, { scale: 4, octaves: 4, seed: 461 });
      const cell = w / 8;
      X.fillPixels(ctx, w, h, (i, x, y) => {
        const u = ((x + y) % cell) / cell,
          v = ((x - y + w * 4) % cell) / cell;
        const seam = Math.min(u, 1 - u, v, 1 - v) < 0.06 ? 0.82 : 1,
          puff = 0.94 + Math.sin(u * Math.PI) * Math.sin(v * Math.PI) * 0.08;
        const k = seam * puff * (0.9 + n[i] * 0.14);
        return [206 * k, 210 * k, 212 * k];
      });
      heightFrom(hc, w, h, (i) => {
        const x = i % w,
          y = (i / w) | 0,
          u = ((x + y) % cell) / cell,
          v = ((x - y + w * 4) % cell) / cell;
        return 0.3 + Math.sin(u * Math.PI) * Math.sin(v * Math.PI) * 0.6;
      });
      X.blotches(ctx, w, h, r, { count: 6, color: "#4a4a44", alpha: 0.18 });
    },
  });
  def("leather", {
    w: 256,
    meters: 0.5,
    normal: 1.5,
    rough: 0.75,
    desc: "worn brown leather (raider/leather armor)",
    gen(ctx, w, h, r, hc) {
      const wn = X.worley(w, h, { cells: 30, seed: 471 });
      const n = X.fbm(w, h, { scale: 4, octaves: 5, seed: 472 });
      X.fillPixels(ctx, w, h, (i) => {
        const e = wn.f2[i] - wn.f1[i];
        const k = (0.7 + n[i] * 0.4) * (e < 0.06 ? 0.75 : 1);
        return [98 * k, 66 * k, 40 * k];
      });
      heightFrom(hc, w, h, (i) => Math.min(1, (wn.f2[i] - wn.f1[i]) * 4));
      X.blotches(ctx, w, h, r, { count: 8, color: "#c0a070", alpha: 0.18 });
      X.blotches(ctx, w, h, r, { count: 6, color: "#1a1008", alpha: 0.3 });
    },
  });
  def("military", {
    w: 256,
    meters: 1,
    normal: 0,
    rough: 0.7,
    metal: 0.2,
    desc: "olive drab painted surface (ammo boxes, combat armor)",
    gen: paintedMetal("#4f5536", 0.3, 481),
  });
  def("rubber", {
    w: 256,
    meters: 0.5,
    normal: 0,
    rough: 0.95,
    desc: "cracked black rubber (tyres)",
    gen(ctx, w, h, r) {
      noiseBase(
        ctx,
        w,
        h,
        r,
        [
          [0, "#141414"],
          [1, "#2c2a28"],
        ],
        { scale: 4, seed: 491, grain: 10 },
      );
      X.cracks(ctx, w, h, r, {
        count: 10,
        width: 0.8,
        seg: 4,
        steps: 20,
        color: "rgba(90,85,78,0.5)",
      });
      for (let x = 0; x < w; x += 16) {
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(x, 0, 6, h);
      } // tread
    },
  });
  def("cardboard", {
    w: 256,
    meters: 0.8,
    normal: 0,
    rough: 0.95,
    desc: "soggy corrugated cardboard",
    gen(ctx, w, h, r) {
      noiseBase(
        ctx,
        w,
        h,
        r,
        [
          [0, "#7a6040"],
          [1, "#a88a5e"],
        ],
        { scale: 3, seed: 501, grain: 10 },
      );
      for (let x = 0; x < w; x += 5) {
        ctx.fillStyle = "rgba(60,40,20,0.12)";
        ctx.fillRect(x, 0, 2, h);
      }
      X.blotches(ctx, w, h, r, { count: 6, color: "#3a2810", alpha: 0.35 });
      X.text(ctx, "THIS SIDE UP", w / 2, h * 0.3, {
        font: "stencil",
        size: 20,
        color: "rgba(40,30,20,0.5)",
      });
    },
  });
  def("paper", {
    w: 256,
    h: 256,
    meters: 0.5,
    normal: 0,
    rough: 1,
    desc: "yellowed newspaper page (litter)",
    gen(ctx, w, h, r) {
      noiseBase(
        ctx,
        w,
        h,
        r,
        [
          [0, "#b8ac88"],
          [1, "#d6cca8"],
        ],
        { scale: 3, seed: 511, grain: 8 },
      );
      X.text(ctx, "THE NEW YORK HERALD", w / 2, 18, {
        font: "didone",
        size: 20,
        color: "#2a2620",
        maxW: w - 16,
      });
      X.text(ctx, "PARIS RECALLS ENVOY!", w / 2, 46, {
        font: "impact",
        size: 24,
        color: "#1e1c18",
        maxW: w - 16,
      });
      ctx.fillStyle = "rgba(40,36,30,0.55)";
      for (let c = 0; c < 4; c++)
        for (let y = 66; y < h - 10; y += 5)
          if (r() > 0.06)
            ctx.fillRect(8 + c * 61, y, 52 * (0.6 + r() * 0.4), 2);
      ctx.fillStyle = "rgba(40,36,30,0.35)";
      ctx.fillRect(8 + 61, 80, 113, 70);
      X.blotches(ctx, w, h, r, { count: 7, color: "#6a5028", alpha: 0.3 });
    },
  });
  def("bone", {
    w: 256,
    meters: 0.5,
    normal: 0,
    rough: 0.8,
    desc: "aged bone (skeletons)",
    gen(ctx, w, h, r) {
      noiseBase(
        ctx,
        w,
        h,
        r,
        [
          [0, "#8a7a5a"],
          [0.5, "#b8a880"],
          [1, "#d4c8a4"],
        ],
        { scale: 4, seed: 521, grain: 10 },
      );
      X.blotches(ctx, w, h, r, { count: 8, color: "#4a3a20", alpha: 0.3 });
      X.cracks(ctx, w, h, r, {
        count: 4,
        width: 0.7,
        seg: 4,
        steps: 20,
        color: "rgba(60,50,30,0.6)",
      });
    },
  });
  def("skin_base", {
    w: 256,
    meters: 0.4,
    normal: 0,
    rough: 0.7,
    desc: "neutral light skin (tint via material colour)",
    gen(ctx, w, h, r) {
      noiseBase(
        ctx,
        w,
        h,
        r,
        [
          [0, "#caa48a"],
          [0.5, "#dcb59a"],
          [1, "#e6c3aa"],
        ],
        { scale: 4, seed: 531, grain: 6 },
      );
      X.blotches(ctx, w, h, r, { count: 14, color: "#c07a6a", alpha: 0.12 });
      X.speckle(ctx, w, h, r, {
        count: 1500,
        colors: ["#a8806a"],
        min: 0.3,
        max: 0.8,
        alpha: 0.35,
      });
    },
  });
  def("skin_brute", {
    w: 256,
    meters: 0.5,
    normal: 3,
    rough: 0.7,
    desc: "Brute hide: grey-violet, thick and lumpy, pale bone plates breaking through",
    gen(ctx, w, h, r, hc) {
      const wn = X.worley(w, h, { cells: 10, seed: 551 }),
        n = X.fbm(w, h, { scale: 4, octaves: 5, seed: 552 });
      const ramp = X.ramp([
        [0, "#3a3242"],
        [0.4, "#5a4e62"],
        [0.7, "#766a7c"],
        [1, "#948a98"],
      ]);
      X.fillPixels(ctx, w, h, (i) => {
        const lump = Math.max(0, 1 - wn.f1[i] * 1.6);
        if (wn.id[i] > 0.86 && wn.f1[i] < 0.35) {
          const k = 0.85 + n[i] * 0.2;
          return [214 * k, 204 * k, 182 * k];
        } // bone plate
        const c = ramp(n[i] * 0.6 + lump * 0.4);
        return [c[0], c[1], c[2]];
      });
      heightFrom(hc, w, h, (i) =>
        wn.id[i] > 0.86 && wn.f1[i] < 0.35
          ? 0.95
          : Math.max(0, 1 - wn.f1[i] * 1.6) * 0.7 + n[i] * 0.3,
      );
      ctx.strokeStyle = "rgba(40,30,46,0.5)";
      ctx.lineWidth = 1.2;
      for (let k = 0; k < 20; k++) {
        let x = r() * w,
          y = r() * h;
        ctx.beginPath();
        ctx.moveTo(x, y);
        for (let q = 0; q < 8; q++) {
          x += (r() - 0.5) * 16;
          y += r() * 10;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      X.blotches(ctx, w, h, r, { count: 8, color: "#3a2a20", alpha: 0.25 });
    },
  });
  def("chainlink", {
    w: 256,
    meters: 1,
    normal: 0,
    alpha: true,
    alphaTest: 0.35,
    rough: 0.5,
    metal: 0.8,
    side: "double",
    desc: "RGBA chain-link fence mesh",
    gen(ctx, w, h, r) {
      ctx.clearRect(0, 0, w, h);
      const s = w / 8;
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      for (let j = -1; j <= 8; j++)
        for (let i = -1; i <= 8; i++) {
          const x = i * s,
            y = j * s;
          const rust = r() < 0.3;
          ctx.strokeStyle = rust ? "#6a4020" : "#9a9c98";
          ctx.beginPath();
          ctx.moveTo(x, y + s / 2);
          ctx.lineTo(x + s / 2, y);
          ctx.lineTo(x + s, y + s / 2);
          ctx.lineTo(x + s / 2, y + s);
          ctx.closePath();
          ctx.stroke();
        }
      // cut hole
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(w * 0.7, h * 0.7, 18, 0, TAU);
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";
    },
  });
  def("shadow_blob", {
    w: 128,
    meters: 1,
    normal: 0,
    repeat: false,
    desc: "soft radial blob (use as alphaMap for contact shadows)",
    gen(ctx, w, h) {
      const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
      g.addColorStop(0, "#fff");
      g.addColorStop(0.5, "#999");
      g.addColorStop(1, "#000");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    },
  });

  // ==================================================================
  // CRYO FACILITY (Project Long Winter)
  // ==================================================================
  def("tile_cryo", {
    roughVar: 0.7,
    meters: 2,
    normal: 3,
    rough: 0.55,
    metal: 0.6,
    desc: "Cryo facility floor: steel plates, 4×4 per tile, bolted corners",
    gen(ctx, w, h, r, hc) {
      const { n2 } = noiseBase(
        ctx,
        w,
        h,
        r,
        [
          [0, "#4a5058"],
          [0.5, "#5e656c"],
          [1, "#727a80"],
        ],
        { scale: 3, seed: 561, grain: 8, dscale: 64 },
      );
      heightFrom(hc, w, h, (i) => 0.62 + (n2[i] - 0.5) * 0.05);
      const n = 4,
        s = w / n;
      for (let j = 0; j < n; j++)
        for (let i = 0; i < n; i++) {
          const x = i * s,
            y = j * s;
          ctx.fillStyle =
            r() < 0.5 ? X.css("#000", r() * 0.1) : X.css("#fff", r() * 0.05);
          ctx.fillRect(x, y, s, s);
          // bevelled edge
          ctx.fillStyle = "rgba(255,255,255,0.1)";
          ctx.fillRect(x + 3, y + 3, s - 6, 3);
          ctx.fillRect(x + 3, y + 3, 3, s - 6);
          ctx.fillStyle = "rgba(0,0,0,0.3)";
          ctx.fillRect(x + 3, y + s - 6, s - 6, 3);
          ctx.fillRect(x + s - 6, y + 3, 3, s - 6);
          ctx.fillStyle = "#1a1c1e";
          ctx.fillRect(x, y, s, 3);
          ctx.fillRect(x, y, 3, s);
          hc.fillStyle = "#202020";
          hc.fillRect(x - 1, y - 1, s + 2, 5);
          hc.fillRect(x - 1, y - 1, 5, s + 2);
          // anti-slip dimples on alternating plates
          if ((i + j) % 2 === 0)
            for (let a = 1; a < 6; a++)
              for (let b = 1; b < 6; b++) {
                const dx = x + (a * s) / 6,
                  dy = y + (b * s) / 6;
                ctx.fillStyle = "rgba(0,0,0,0.25)";
                ctx.beginPath();
                ctx.arc(dx + 0.6, dy + 0.6, 2.4, 0, TAU);
                ctx.fill();
                ctx.fillStyle = "rgba(200,210,215,0.25)";
                ctx.beginPath();
                ctx.arc(dx, dy, 2, 0, TAU);
                ctx.fill();
                hc.fillStyle = "#b0b0b0";
                hc.beginPath();
                hc.arc(dx, dy, 2.2, 0, TAU);
                hc.fill();
              }
          for (const [bx, by] of [
            [x + 12, y + 12],
            [x + s - 12, y + 12],
            [x + 12, y + s - 12],
            [x + s - 12, y + s - 12],
          ]) {
            ctx.fillStyle = "#2a2e30";
            ctx.beginPath();
            ctx.arc(bx, by, 4, 0, TAU);
            ctx.fill();
            ctx.strokeStyle = "rgba(200,205,210,0.5)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(bx - 3, by);
            ctx.lineTo(bx + 3, by);
            ctx.stroke();
            hc.fillStyle = "#d0d0d0";
            hc.beginPath();
            hc.arc(bx, by, 4, 0, TAU);
            hc.fill();
          }
        }
      // scuffs & boot traffic
      ctx.lineCap = "round";
      for (let k = 0; k < 80; k++) {
        const x = r() * w,
          y = r() * h,
          a = r() * TAU,
          l = 6 + r() * 30;
        ctx.strokeStyle = "rgba(20,20,20,0.25)";
        ctx.lineWidth = 1 + r() * 2;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l);
        ctx.stroke();
      }
      X.blotches(ctx, w, h, r, { count: 6, color: "#101418", alpha: 0.25 });
      macroGrime(ctx, w, h, 0.2, 565);
    },
  });
  def("cryo_wall", {
    roughVar: 0.5,
    meters: 4,
    normal: 3,
    rough: 0.5,
    metal: 0.5,
    desc: "Cryo facility wall: riveted grey-white enamelled steel panels with a rib",
    gen(ctx, w, h, r, hc) {
      const { n2 } = noiseBase(
        ctx,
        w,
        h,
        r,
        [
          [0, "#9ca2a4"],
          [0.5, "#b4b9ba"],
          [1, "#c8cccc"],
        ],
        { scale: 3, seed: 571, grain: 6, dscale: 64 },
      );
      heightFrom(hc, w, h, (i) => 0.55 + (n2[i] - 0.5) * 0.04);
      const cols = 4,
        pw = w / cols;
      for (let i = 0; i < cols; i++) {
        const x = i * pw;
        ctx.fillStyle =
          r() < 0.5 ? X.css("#000", r() * 0.08) : X.css("#fff", r() * 0.05);
        ctx.fillRect(x, 0, pw, h);
        // inset field
        ctx.fillStyle = "rgba(0,0,0,0.12)";
        ctx.fillRect(x + 14, 14, pw - 28, h / 2 - 28);
        ctx.fillRect(x + 14, h / 2 + 14, pw - 28, h / 2 - 28);
        ctx.strokeStyle = "rgba(230,240,245,0.22)";
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 14, 14, pw - 28, h / 2 - 28);
        ctx.strokeRect(x + 14, h / 2 + 14, pw - 28, h / 2 - 28);
        hc.fillStyle = "#6a6a6a";
        hc.fillRect(x + 14, 14, pw - 28, h / 2 - 28);
        hc.fillRect(x + 14, h / 2 + 14, pw - 28, h / 2 - 28);
        // vertical seam
        ctx.fillStyle = "#20262c";
        ctx.fillRect(x, 0, 4, h);
        ctx.fillStyle = "rgba(220,230,235,0.25)";
        ctx.fillRect(x + 4, 0, 2, h);
        hc.fillStyle = "#202020";
        hc.fillRect(x - 1, 0, 6, h);
        // rivet rows
        for (let y = 8; y < h; y += 24)
          for (const rx of [x + 7, x + pw - 7]) {
            ctx.fillStyle = "#3a444c";
            ctx.beginPath();
            ctx.arc(rx, y, 3.2, 0, TAU);
            ctx.fill();
            ctx.fillStyle = "rgba(230,235,240,0.5)";
            ctx.beginPath();
            ctx.arc(rx - 0.8, y - 0.8, 1.3, 0, TAU);
            ctx.fill();
            hc.fillStyle = "#f0f0f0";
            hc.beginPath();
            hc.arc(rx, y, 3.2, 0, TAU);
            hc.fill();
          }
      }
      // horizontal rib at mid height
      const g = ctx.createLinearGradient(0, h / 2 - 8, 0, h / 2 + 8);
      g.addColorStop(0, "#dadedf");
      g.addColorStop(0.5, "#9aa0a2");
      g.addColorStop(1, "#5a6062");
      ctx.fillStyle = g;
      ctx.fillRect(0, h / 2 - 8, w, 16);
      hc.fillStyle = "#e0e0e0";
      hc.fillRect(0, h / 2 - 8, w, 16);
      X.streaks(ctx, w, h, r, {
        count: 16,
        color: "#3a3020",
        alpha: 0.18,
        maxW: 10,
      });
      X.blotches(ctx, w, h, r, {
        count: 5,
        color: "#5a3a1a",
        alpha: 0.18,
        rmin: 5,
        rmax: 25,
      });
      macroGrime(ctx, w, h, 0.18, 575);
    },
  });
  def("cryo_trim", {
    w: 512,
    h: 128,
    meters: 4,
    metersV: 1,
    normal: 0,
    rough: 0.5,
    metal: 0.4,
    desc: 'Long Winter slate band with safety-orange stripes, crystal marks & "CRYO UNIT C-9" stencil (u along wall)',
    gen(ctx, w, h, r) {
      ctx.fillStyle = "#2e3a46";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#e8742a";
      ctx.fillRect(0, 10, w, 10);
      ctx.fillRect(0, h - 20, w, 10);
      for (const cx of [w * 0.06, w * 0.56])
        X.art.snowflake(ctx, cx, h / 2, 24, "#e6eef2", 4);
      X.text(ctx, "CRYO UNIT C-9", w * 0.29, h / 2, {
        font: "stencil",
        size: 40,
        color: "#e6eef2",
        weight: "bold",
        spacing: 3,
        maxW: w / 2 - 80,
      });
      X.text(ctx, "CRYO UNIT C-9", w * 0.79, h / 2, {
        font: "stencil",
        size: 40,
        color: "#e6eef2",
        weight: "bold",
        spacing: 3,
        maxW: w / 2 - 80,
      });
      X.blotches(ctx, w, h, r, {
        count: 8,
        color: "#0c1420",
        alpha: 0.25,
        rmin: 10,
        rmax: 40,
      });
      X.streaks(ctx, w, h, r, {
        count: 12,
        color: "#101820",
        alpha: 0.2,
        maxW: 8,
      });
      ctx.fillStyle = "rgba(0,0,0,0.15)";
      for (let k = 0; k < 20; k++) {
        const x = r() * w;
        ctx.fillRect(x, r() * h, 1 + r() * 8, 1 + r() * 3);
      }
    },
  });
})();
