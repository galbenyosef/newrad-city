// play-inline-52 03 — math
// Lines 368-429 of readable/play-inline-52.pretty.js (statement-aligned).
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
