/* src/atmosphere/42_post_grade.js */
/* =====================================================================
 * ATMOSPHERE — post: LUT colour grading (render_post)
 * Every grading preset is baked on the CPU into a 32³ 3D LUT (packed as a
 * 1024×32 RGBA8 strip) that maps the tone-mapped, sRGB-encoded frame to its
 * graded colour. The composite samples two LUTs and cross-fades them, so a
 * preset change (setGrading, or a context look such as a cryo-unit interior)
 * blends smoothly instead of popping.
 *
 * The bake reproduces the previous analytic grade exactly (gain, gamma,
 * split toning, saturation, soft-toe contrast, lifted black floor) and adds
 * what only a LUT can do cheaply: HUE-SELECTIVE edits (olive greens and
 * teal-grey skies, amber desert tones and dusty teal, a cleaner blue sky and
 * warm skin), and a film-like highlight desaturation.
 * The dynamic parts (moonlit night lift/tint, rad weather, low health)
 * stay analytic in the composite.
 *
 * Exposes A.postGrade = { SIZE, GLSL, presets, lut(name), has(name) }.
 * If the LUT composite fails to compile, 40_postfx.js falls back to the
 * analytic grade (same numbers, no hue edits).
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G,
    THREE = window.THREE;
  if (!G || !G.atmos || !G.atmos._) return;
  const A = G.atmos._;

  const SIZE = 32;

  // hue bands: h = centre hue (degrees), w = half-width (degrees, gaussian), hue = hue shift (degrees,
  // + = toward higher hue), sat = chroma multiplier, lum = luminance multiplier (saturated colours only)
  const PRESETS = {
    // olive: green-olive haze. Greens drift to olive, skies to a dusty teal-grey,
    // reds/blood stay muted brown-red, yellows (soda signs, fire) keep a little life.
    olive: {
      sat: 0.74,
      contrast: 1.1,
      lift: [0.03, 0.04, 0.02],
      gamma: [1.0, 1.04, 0.94],
      gain: [1.0, 1.02, 0.86],
      shadowTint: [0.0, 0.018, 0.004],
      highTint: [0.02, 0.025, -0.02],
      bloom: 0.7,
      bands: [
        { h: 118, w: 42, hue: -14, sat: 0.86, lum: 0.97 }, // greens → olive
        { h: 212, w: 38, hue: -20, sat: 0.6, lum: 1.0 }, // blue sky → teal-grey
        { h: 262, w: 30, hue: -30, sat: 0.55, lum: 1.0 }, // violets die out
        { h: 2, w: 26, hue: 6, sat: 0.84, lum: 0.96 }, // reds → brick
        { h: 44, w: 20, hue: 0, sat: 1.06, lum: 1.0 }, // amber/yellow signage keeps some pop
      ],
      hiDesat: 0.22,
    },
    // amber: warm amber-sepia; dusty oranges richer, blues/greens pulled to dusty teal / khaki.
    amber: {
      sat: 0.8,
      contrast: 1.07,
      lift: [0.036, 0.026, 0.012],
      gamma: [1.04, 1.0, 0.9],
      gain: [1.07, 0.99, 0.8],
      shadowTint: [0.012, 0.004, -0.004],
      highTint: [0.035, 0.012, -0.03],
      bloom: 0.65,
      bands: [
        { h: 30, w: 26, hue: 3, sat: 1.16, lum: 1.0 }, // dusty orange
        { h: 205, w: 42, hue: -16, sat: 0.62, lum: 1.0 }, // sky → dusty teal
        { h: 110, w: 40, hue: -24, sat: 0.72, lum: 0.97 }, // greens → khaki
        { h: 330, w: 30, hue: 14, sat: 0.7, lum: 1.0 }, // magentas → warm red
      ],
      hiDesat: 0.14,
    },
    // teal: cleaner, more saturated; teal shadows, warm highlights, a real blue sky, warm skin.
    teal: {
      sat: 1.0,
      contrast: 1.06,
      lift: [0.016, 0.022, 0.032],
      gamma: [1.0, 1.0, 1.02],
      gain: [1.04, 1.0, 0.95],
      shadowTint: [-0.004, 0.006, 0.018],
      highTint: [0.02, 0.008, -0.012],
      bloom: 0.8,
      bands: [
        { h: 214, w: 34, hue: -6, sat: 1.12, lum: 1.0 }, // sky blue
        { h: 26, w: 22, hue: 0, sat: 1.08, lum: 1.01 }, // skin / rust
        { h: 122, w: 40, hue: -6, sat: 0.9, lum: 1.0 }, // foliage a touch less green
      ],
      hiDesat: 0.08,
    },
    none: {
      sat: 1.0,
      contrast: 1.0,
      lift: [0, 0, 0],
      gamma: [1, 1, 1],
      gain: [1, 1, 1],
      shadowTint: [0, 0, 0],
      highTint: [0, 0, 0],
      bloom: 0.6,
      bands: [],
      hiDesat: 0,
    },
    // context look (not a user preset): the cryo units — a cool, clinical blue-white under the olive grade
    cryo: {
      sat: 0.8,
      contrast: 1.09,
      lift: [0.024, 0.036, 0.042],
      gamma: [1.0, 1.02, 0.98],
      gain: [0.97, 1.01, 0.97],
      shadowTint: [-0.004, 0.012, 0.02],
      highTint: [0.012, 0.02, 0.0],
      bloom: 0.75,
      bands: [
        { h: 212, w: 40, hue: -6, sat: 0.9, lum: 1.0 }, // clinical blue stays blue
        { h: 30, w: 22, hue: -2, sat: 1.1, lum: 1.0 }, // orange hazard paint / suit collars keep their pop
        { h: 118, w: 42, hue: -10, sat: 0.8, lum: 0.97 },
      ],
      hiDesat: 0.18,
    },
  };
  const USER_PRESETS = ["olive", "amber", "teal", "none"];

  // ------------------------------------------------------------------
  // REGION / WEATHER IMAGESPACES (an "imagespace" per cell / region / weather). These are
  // MODIFIERS layered on the player's chosen grade, baked lazily as '<grade>+<mod>' LUTs (e.g. 'teal+neon'),
  // so an amber-grade player stays amber in the dust storm, just dustier. 40_postfx.js picks the context and
  // cross-fades (weather over ~6 s, districts ~2.5 s, interiors snap with the door fade).
  //   gain/gamma multiply, sat multiplies, contrast/lift/tints add, dropHues removes the base grade's bands
  //   near those hues (e.g. the olive grade's "violets die" band would kill the Neon's tubes), bands are appended.
  // ------------------------------------------------------------------
  const MODS = {
    // The Neon (Times Square) after dark + its interiors: the one powered place in NY — tubes keep their
    // pink / violet / cyan, warm tungsten mids, a little more punch
    neon: {
      sat: 1.14,
      contrast: 0.03,
      gain: [1.03, 1.0, 0.99],
      gamma: [1, 1, 1],
      lift: [0.004, 0, 0.006],
      shadowTint: [0.006, -0.002, 0.012],
      highTint: [0.012, 0.0, -0.006],
      dropHues: [262, 300, 330],
      hiDesat: 0.12,
      bands: [
        { h: 305, w: 34, hue: 0, sat: 1.14, lum: 1.0 }, // hot pink / magenta tubes
        { h: 268, w: 26, hue: 6, sat: 1.02, lum: 1.0 }, // violet → a touch pinker, alive
        { h: 186, w: 22, hue: 0, sat: 1.1, lum: 1.0 }, // cyan tubes
        { h: 36, w: 20, hue: 2, sat: 1.06, lum: 1.0 }, // tungsten bulbs
      ],
    },
    // dust storm: everything goes ochre-brown, flat and milky; the blue sky is gone
    dust: {
      sat: 0.8,
      contrast: -0.05,
      gain: [1.05, 0.98, 0.84],
      gamma: [1.0, 1.0, 0.97],
      lift: [0.022, 0.014, 0.002],
      shadowTint: [0.01, 0.004, -0.006],
      highTint: [0.02, 0.01, -0.02],
      dropHues: [],
      hiDesat: 0.12,
      bands: [
        { h: 210, w: 50, hue: -14, sat: 0.4, lum: 1.0 }, // sky / blues → dusty grey
        { h: 34, w: 30, hue: 0, sat: 1.08, lum: 1.0 }, // ochre
      ],
    },
    // rain / fog: cold, wet, desaturated steel, highlights milky
    rain: {
      sat: 0.84,
      contrast: -0.02,
      gain: [0.96, 0.99, 1.03],
      gamma: [1, 1, 1.01],
      lift: [0.0, 0.004, 0.01],
      shadowTint: [-0.004, 0.002, 0.012],
      highTint: [-0.008, 0.0, 0.01],
      dropHues: [],
      hiDesat: 0.3,
      bands: [
        { h: 30, w: 28, hue: 0, sat: 0.88, lum: 1.0 }, // warm rust/brick cools off
      ],
    },
    // subway / metro tunnels: sickly sodium-green gloom
    metro: {
      sat: 0.82,
      contrast: 0.05,
      gain: [0.97, 1.03, 0.86],
      gamma: [1.0, 1.02, 0.97],
      lift: [0.0, 0.006, 0.0],
      shadowTint: [-0.002, 0.014, 0.004],
      highTint: [0.012, 0.016, -0.014],
      dropHues: [],
      hiDesat: 0.2,
      bands: [
        { h: 52, w: 26, hue: 10, sat: 0.95, lum: 1.0 }, // sodium yellow → green-yellow
        { h: 212, w: 40, hue: -18, sat: 0.7, lum: 1.0 }, // tiles / blues → teal-grey
      ],
    },
  };
  function compose(base, m) {
    const add3 = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
    const mul3 = (a, b) => [a[0] * b[0], a[1] * b[1], a[2] * b[2]];
    const near = (h, hs) =>
      hs.some((x) => {
        let d = Math.abs(h - x);
        if (d > 180) d = 360 - d;
        return d < 24;
      });
    return {
      sat: base.sat * m.sat,
      contrast: Math.max(0.8, base.contrast + m.contrast),
      lift: add3(base.lift, m.lift),
      gamma: mul3(base.gamma, m.gamma),
      gain: mul3(base.gain, m.gain),
      shadowTint: add3(base.shadowTint, m.shadowTint),
      highTint: add3(base.highTint, m.highTint),
      bloom: base.bloom,
      bands: (base.bands || [])
        .filter((b) => !near(b.h, m.dropHues || []))
        .concat(m.bands || []),
      hiDesat: Math.max(base.hiDesat || 0, m.hiDesat || 0),
    };
  }
  /** preset by name: a base preset, or '<base>+<mod>' (composed lazily, cached) */
  function resolve(name) {
    if (PRESETS[name]) return PRESETS[name];
    const i = typeof name === "string" ? name.indexOf("+") : -1;
    if (i < 0) return null;
    const b = PRESETS[name.slice(0, i)],
      m = MODS[name.slice(i + 1)];
    if (!b || !m) return null;
    return (PRESETS[name] = compose(b, m));
  }

  // ------------------------------------------------------------------
  // CPU grade (per LUT cell). Must match the analytic path in 40_postfx.js for the shared stages.
  // ------------------------------------------------------------------
  const luma = (r, g, b) => r * 0.2126 + g * 0.7152 + b * 0.0722;
  const smooth = (e0, e1, x) => {
    const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
    return t * t * (3 - 2 * t);
  };
  function rgb2hsv(r, g, b, out) {
    const mx = Math.max(r, g, b),
      mn = Math.min(r, g, b),
      d = mx - mn;
    let h = 0;
    if (d > 1e-6) {
      if (mx === r) h = ((g - b) / d) % 6;
      else if (mx === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h *= 60;
      if (h < 0) h += 360;
    }
    out[0] = h;
    out[1] = mx > 1e-6 ? d / mx : 0;
    out[2] = mx;
    return out;
  }
  function hsv2rgb(h, s, v, out) {
    h = ((h % 360) + 360) % 360;
    const c = v * s,
      x = c * (1 - Math.abs(((h / 60) % 2) - 1)),
      m = v - c;
    let r, g, b;
    if (h < 60) {
      r = c;
      g = x;
      b = 0;
    } else if (h < 120) {
      r = x;
      g = c;
      b = 0;
    } else if (h < 180) {
      r = 0;
      g = c;
      b = x;
    } else if (h < 240) {
      r = 0;
      g = x;
      b = c;
    } else if (h < 300) {
      r = x;
      g = 0;
      b = c;
    } else {
      r = c;
      g = 0;
      b = x;
    }
    out[0] = r + m;
    out[1] = g + m;
    out[2] = b + m;
    return out;
  }
  const _hsv = [0, 0, 0],
    _rgb = [0, 0, 0];
  function gradeCell(p, r, g, b, out) {
    // gain / gamma
    r = Math.pow(Math.max(0, r * p.gain[0]), 1 / p.gamma[0]);
    g = Math.pow(Math.max(0, g * p.gain[1]), 1 / p.gamma[1]);
    b = Math.pow(Math.max(0, b * p.gain[2]), 1 / p.gamma[2]);
    // split toning
    let l = luma(r, g, b);
    const s2 = (1 - l) * (1 - l),
      h2 = l * l;
    r += p.shadowTint[0] * s2 + p.highTint[0] * h2;
    g += p.shadowTint[1] * s2 + p.highTint[1] * h2;
    b += p.shadowTint[2] * s2 + p.highTint[2] * h2;
    // hue-selective edits (weighted by chroma so greys never tint)
    if (p.bands && p.bands.length) {
      const l0 = luma(r, g, b);
      rgb2hsv(Math.max(r, 0), Math.max(g, 0), Math.max(b, 0), _hsv);
      let hue = _hsv[0],
        sat = _hsv[1];
      const v = _hsv[2];
      if (sat > 1e-4) {
        let dh = 0,
          sm = 1,
          lm = 1;
        for (const bd of p.bands) {
          let d = Math.abs(hue - bd.h);
          if (d > 180) d = 360 - d;
          const w =
            Math.exp(-(d * d) / (bd.w * bd.w)) * smooth(0.02, 0.25, sat);
          if (w < 1e-3) continue;
          dh += bd.hue * w;
          sm *= 1 + (bd.sat - 1) * w;
          lm *= 1 + ((bd.lum || 1) - 1) * w;
        }
        hsv2rgb(hue + dh, Math.min(1, sat * sm), v, _rgb);
        // keep the original luminance (× lum), so hue edits never brighten/darken whole regions
        const l1 = luma(_rgb[0], _rgb[1], _rgb[2]);
        const k = l1 > 1e-4 ? Math.min(1.6, Math.max(0.6, (l0 * lm) / l1)) : 1;
        r = _rgb[0] * k;
        g = _rgb[1] * k;
        b = _rgb[2] * k;
      }
    }
    // saturation
    l = luma(r, g, b);
    r = l + (r - l) * p.sat;
    g = l + (g - l) * p.sat;
    b = l + (b - l) * p.sat;
    // film highlight desaturation (bright sky / lamps roll toward the light's colour-neutral core)
    if (p.hiDesat > 0) {
      const k = p.hiDesat * smooth(0.62, 1.0, l);
      r += (l - r) * k;
      g += (l - g) * k;
      b += (l - b) * k;
    }
    // soft-toe contrast (identical to the analytic composite)
    const c3 = [r, g, b];
    for (let i = 0; i < 3; i++) {
      const c = c3[i];
      const cc = (c - 0.5) * p.contrast + 0.5;
      const toe = c * (1 - (p.contrast - 1) * 2 * (0.02 / (c + 0.02)));
      const t = smooth(0.02, 0.22, c);
      c3[i] = Math.max(0, toe + (cc - toe) * t);
    }
    // lifted black floor (after contrast)
    for (let i = 0; i < 3; i++) c3[i] = p.lift[i] + c3[i] * (1 - p.lift[i]);
    out[0] = c3[0];
    out[1] = c3[1];
    out[2] = c3[2];
    return out;
  }

  const cache = {};
  const _o = [0, 0, 0];
  function bake(name) {
    const p = resolve(name) || PRESETS.olive;
    const N = SIZE,
      W = N * N;
    const data = new Uint8Array(W * N * 4);
    for (let bi = 0; bi < N; bi++) {
      for (let gi = 0; gi < N; gi++) {
        for (let ri = 0; ri < N; ri++) {
          gradeCell(p, ri / (N - 1), gi / (N - 1), bi / (N - 1), _o);
          const idx = (gi * W + bi * N + ri) * 4;
          data[idx] = Math.round(Math.min(1, Math.max(0, _o[0])) * 255);
          data[idx + 1] = Math.round(Math.min(1, Math.max(0, _o[1])) * 255);
          data[idx + 2] = Math.round(Math.min(1, Math.max(0, _o[2])) * 255);
          data[idx + 3] = 255;
        }
      }
    }
    const t = new THREE.DataTexture(
      data,
      W,
      N,
      THREE.RGBAFormat,
      THREE.UnsignedByteType,
    );
    t.minFilter = t.magFilter = THREE.LinearFilter;
    t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
    t.generateMipmaps = false;
    t.flipY = false;
    t.name = "atmos_lut_" + name;
    t.needsUpdate = true;
    return t;
  }

  // GLSL: trilinear lookup into the packed strip (2 bilinear taps + a mix along blue)
  const GLSL = `
    vec3 lutSample(sampler2D t, vec3 c){
      c = clamp(c, 0.0, 1.0) * ${(SIZE - 1).toFixed(1)};
      float b0 = floor(c.b), b1 = min(b0 + 1.0, ${(SIZE - 1).toFixed(1)});
      vec2 p = vec2((c.r + 0.5) / ${(SIZE * SIZE).toFixed(1)}, (c.g + 0.5) / ${SIZE.toFixed(1)});
      vec3 a = texture2D(t, p + vec2(b0 / ${SIZE.toFixed(1)}, 0.0)).rgb;
      vec3 b = texture2D(t, p + vec2(b1 / ${SIZE.toFixed(1)}, 0.0)).rgb;
      return mix(a, b, c.b - b0);
    }
  `;

  A.postGrade = {
    SIZE,
    GLSL,
    presets: PRESETS,
    userPresets: USER_PRESETS,
    mods: MODS,
    has: (name) => !!resolve(name),
    /** cached DataTexture of a preset's LUT ('<base>+<mod>' names compose a region/weather imagespace) */
    lut(name) {
      if (!resolve(name)) name = "olive";
      if (!cache[name]) cache[name] = bake(name);
      return cache[name];
    },
    cached: (name) => !!cache[name],
    gradeCell: (name, r, g, b) =>
      gradeCell(resolve(name) || PRESETS.olive, r, g, b, [0, 0, 0]),
  };
})();
