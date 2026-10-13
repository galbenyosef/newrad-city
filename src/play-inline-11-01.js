// play-inline-11 01 — ctx
// Lines 13-270 of readable/play-inline-11.pretty.js (statement-aligned).
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
