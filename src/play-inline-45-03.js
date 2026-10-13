// play-inline-45 03 — the
// Lines 369-727 of readable/play-inline-45.pretty.js (statement-aligned).
  const FOGU = (A.fogShared = {
    nrcFogP: { value: { x: 0, y: 0, z: 0, w: 0 } }, // x: 1/scaleHeight, y: base height, z: haze floor 0..1, w: enabled
    nrcFogX: { value: { x: 0, y: 1, z: 0, w: 0 } }, // x: hot-light resist, y: max fog, z: aerial tint amount, w: -
    nrcFogSky: { value: { x: 0, y: 0, z: 0 } }, // aerial-perspective colour (desaturated sky)
    nrcFogSun: { value: { x: 0, y: 1, z: 0, w: 0 } }, // xyz: dir to sun/moon, w: forward-scatter strength
    nrcFogSunC: { value: { x: 0, y: 0, z: 0 } }, // forward-scatter colour
    nrcCld: { value: { x: 0, y: 0.6, z: 0, w: 0 } }, // CLOUD SHADOWS: x strength (0 = off), y coverage threshold, zw wind drift (m)
    nrcCldS: { value: { x: 0, y: 0, z: 0.004, w: 320 } }, // xy: light dir xz / y (ray up to the deck), z: 1/cell size, w: deck height
  });
  A.glsl.heightFogPars = `
    uniform vec4 nrcFogP; uniform vec4 nrcFogX; uniform vec3 nrcFogSky; uniform vec4 nrcFogSun; uniform vec3 nrcFogSunC;
    uniform vec4 nrcCld; uniform vec4 nrcCldS;
    // moving cloud shadows on the key light (sun, or moon at night): the point is followed up the light
    // ray to a virtual cloud deck and a 3-octave value noise drifting with the wind decides whether a
    // cloud sits there. Same function in JS (A.cloudShadowAt) for the viewmodel light.
    float nrcCH(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
    float nrcCN(vec2 p){ vec2 i = floor(p); vec2 f = fract(p); f = f * f * (3.0 - 2.0 * f);
      return mix(mix(nrcCH(i), nrcCH(i + vec2(1.0, 0.0)), f.x), mix(nrcCH(i + vec2(0.0, 1.0)), nrcCH(i + vec2(1.0, 1.0)), f.x), f.y); }
    // cloud-deck macro density (the sky dome draws its cumulus from the SAME field, so the shadow you
    // stand in belongs to the cloud you see between you and the sun)
    float nrcCloudN(vec2 q){ return nrcCN(q) * 0.62 + nrcCN(q * 2.13 + vec2(5.7, 1.9)) * 0.28 + nrcCN(q * 4.7 + vec2(2.3, 8.1)) * 0.1; }
    float nrcCloudSh(vec3 wp){
      if (nrcCld.x < 0.001) return 1.0;
      vec2 q = (wp.xz + nrcCldS.xy * max(nrcCldS.w - wp.y, 0.0) + nrcCld.zw) * nrcCldS.z;
      return 1.0 - nrcCld.x * smoothstep(nrcCld.y, nrcCld.y + 0.17, nrcCloudN(q));
    }
    // ray: world-space camera→point vector, camY: camera height, fc: base fog colour, src: surface colour (HDR)
    float nrcFogAmt(vec3 ray, float camY, float dens, vec3 fc, vec3 src, out vec3 fcol){
      float dist = length(ray);
      float L = dist;
      fcol = fc;
      if (nrcFogP.w > 0.5) {
        vec3 dir = ray / max(dist, 1e-3);
        float a = max(camY - nrcFogP.y, 0.0) * nrcFogP.x;
        float b = max(camY + ray.y - nrcFogP.y, 0.0) * nrcFogP.x;
        float db = b - a;
        float fh = abs(db) > 1e-3 ? (exp(-a) - exp(-b)) / db : exp(-a);
        L = dist * mix(fh, 1.0, nrcFogP.z);
        fcol = mix(fc, nrcFogSky, smoothstep(-0.03, 0.3, dir.y) * nrcFogX.z);
        float mu = max(dot(dir, nrcFogSun.xyz), 0.0);
        float mu2 = mu * mu; float mu4 = mu2 * mu2;
        fcol += nrcFogSunC * (mu4 * mu4 * 0.75 + mu2 * 0.25) * nrcFogSun.w;
      }
      float t = dens * L;
      float f = 1.0 - exp(-t * t);
      float hot = max(max(src.r, max(src.g, src.b)) - 1.2, 0.0);
      f /= 1.0 + hot * nrcFogX.x;
      return min(f, nrcFogP.w > 0.5 ? nrcFogX.y : 1.0);
    }
  `;
  (function patchFogChunks() {
    const SC = THREE.ShaderChunk;
    if (!SC || !SC.fog_fragment || A._fogPatched) return;
    A._fogPatched = true;
    SC.fog_pars_vertex = `
      #ifdef USE_FOG
        varying float vFogDepth;
        varying vec3 vFogRay;
        varying float vFogCamY;
      #endif
    `;
    SC.fog_vertex = `
      #ifdef USE_FOG
        vFogDepth = - mvPosition.z;
        vFogRay = vec3(dot(viewMatrix[0].xyz, mvPosition.xyz), dot(viewMatrix[1].xyz, mvPosition.xyz), dot(viewMatrix[2].xyz, mvPosition.xyz));
        vFogCamY = - dot(viewMatrix[1].xyz, viewMatrix[3].xyz);
      #endif
    `;
    SC.fog_pars_fragment = `
      #ifdef USE_FOG
        uniform vec3 fogColor;
        varying float vFogDepth;
        varying vec3 vFogRay;
        varying float vFogCamY;
        #ifdef FOG_EXP2
          uniform float fogDensity;
          ${A.glsl.heightFogPars}
        #else
          uniform float fogNear;
          uniform float fogFar;
        #endif
      #endif
    `;
    SC.fog_fragment = `
      #ifdef USE_FOG
        #ifdef FOG_EXP2
          vec3 nrcFogCol;
          float fogFactor = nrcFogAmt(vFogRay, vFogCamY, fogDensity, fogColor, gl_FragColor.rgb, nrcFogCol);
          gl_FragColor.rgb = mix(gl_FragColor.rgb, nrcFogCol, fogFactor);
        #else
          float fogFactor = smoothstep(fogNear, fogFar, vFogDepth);
          gl_FragColor.rgb = mix(gl_FragColor.rgb, fogColor, fogFactor);
        #endif
      #endif
    `;
    // hand the shared parameter objects to every built-in shader that has fog, and to
    // UniformsLib.fog (ShaderMaterials merging it later get them by reference too)
    const add = (u) => {
      if (u && u.fogDensity)
        for (const k in FOGU) u[k] = { value: FOGU[k].value };
    };
    add(THREE.UniformsLib && THREE.UniformsLib.fog);
    for (const k in THREE.ShaderLib)
      add(THREE.ShaderLib[k] && THREE.ShaderLib[k].uniforms);
  })();

  // CLOUD SHADOWS: the shadow-casting directional light (atmosphere's sun/moon key — the only one)
  // is multiplied by nrcCloudSh() right after its shadow-map lookup. Only lit materials with the
  // height fog (they carry the uniforms and the world-position varying); off indoors (strength 0).
  (function patchCloudShadows() {
    const SC = THREE.ShaderChunk;
    if (!SC || !SC.lights_fragment_begin || A._cloudPatched) return;
    const rx =
      /(directLight\.color \*= \( directLight\.visible && receiveShadow \) \? getShadow\( directionalShadowMap\[ i \][^;]*;)/;
    if (!rx.test(SC.lights_fragment_begin)) {
      console.warn("[atmosphere] cloud shadows: three chunk changed, skipped");
      return;
    }
    A._cloudPatched = true;
    SC.lights_fragment_begin = SC.lights_fragment_begin.replace(
      rx,
      `$1
		#if defined( USE_FOG ) && defined( FOG_EXP2 )
		directLight.color *= nrcCloudSh( vFogRay + cameraPosition );
		#endif`,
    );
  })();
  // JS twin of nrcCloudSh (float64 vs float32 hashes differ only in the last bits)
  (function () {
    const fr = (x) => x - Math.floor(x);
    function h(px, py) {
      let a = fr(px * 0.1031),
        b = fr(py * 0.1031),
        c = fr(px * 0.1031);
      const d = a * (b + 33.33) + b * (c + 33.33) + c * (a + 33.33);
      a += d;
      b += d;
      c += d;
      return fr((a + b) * c);
    }
    function vn(x, y) {
      const ix = Math.floor(x),
        iy = Math.floor(y);
      let fx = x - ix,
        fy = y - iy;
      fx = fx * fx * (3 - 2 * fx);
      fy = fy * fy * (3 - 2 * fy);
      const a = h(ix, iy),
        b = h(ix + 1, iy),
        c = h(ix, iy + 1),
        d = h(ix + 1, iy + 1);
      return a + (b - a) * fx + (c + (d - c) * fx - (a + (b - a) * fx)) * fy;
    }
    A.cloudShadowAt = function (x, y, z) {
      const C = FOGU.nrcCld.value,
        S = FOGU.nrcCldS.value;
      if (C.x < 0.001) return 1;
      const up = Math.max(S.w - y, 0);
      const qx = (x + S.x * up + C.z) * S.z,
        qy = (z + S.y * up + C.w) * S.z;
      const n =
        vn(qx, qy) * 0.62 +
        vn(qx * 2.13 + 5.7, qy * 2.13 + 1.9) * 0.28 +
        vn(qx * 4.7 + 2.3, qy * 4.7 + 8.1) * 0.1;
      const t = Math.min(1, Math.max(0, (n - C.y) / 0.17));
      return 1 - C.x * t * t * (3 - 2 * t);
    };
  })();

  // ------------------------------------------------------------------
  // WET SURFACES (rain). Patched into every MeshStandard/Physical material (same
  // mechanism as the height fog, before anything compiles): while `nrcWet.x` > 0
  // porous surfaces darken, everything gets glossier, and up-facing ground
  // collects puddles (world-space noise) that turn almost mirror-smooth — street
  // lamps, neon and lightning then streak across the wet asphalt. Driven by
  // 30_weather.js (soaks in over ~20 s of rain, dries over ~1.5 min).
  // Needs the fog varyings (world position) → only on fogged materials.
  // x: wetness 0..1, y: puddle coverage 0..1, z: distance fade start (m)
  // ------------------------------------------------------------------
  const WETU = (A.wetShared = {
    nrcWet: { value: { x: 0, y: 0, z: 45, w: 0 } },
    nrcRip: { value: { x: 0, y: 0 } },
  });
  (function patchWetChunks() {
    const SC = THREE.ShaderChunk;
    if (
      !SC ||
      !SC.lights_physical_fragment ||
      !SC.lights_physical_pars_fragment ||
      A._wetPatched
    )
      return;
    A._wetPatched = true;
    SC.lights_physical_pars_fragment =
      `
      uniform vec4 nrcWet; uniform vec2 nrcRip;
      float nrcWH(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float nrcWN(vec2 p){ vec2 i = floor(p); vec2 f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(nrcWH(i), nrcWH(i + vec2(1.0, 0.0)), f.x), mix(nrcWH(i + vec2(0.0, 1.0)), nrcWH(i + vec2(1.0, 1.0)), f.x), f.y); }
    ` + SC.lights_physical_pars_fragment;
    SC.lights_physical_fragment =
      `
      #ifdef USE_FOG
      #define NRC_PUDTAG 1
      float nrcPudTag = 0.0;
      if (nrcWet.x > 0.001) {
        float nrcUp = smoothstep(0.55, 0.92, dot(normal, viewMatrix[1].xyz));
        vec3 nrcWP = vFogRay + cameraPosition;
        float nrcD = length(vFogRay);
        float nrcN = nrcWN(nrcWP.xz * 0.23) * 0.6 + nrcWN(nrcWP.xz * 0.9 + 7.3) * 0.3 + nrcWN(nrcWP.xz * 3.1) * 0.1;
        float nrcTh = 0.68 - nrcWet.y * 0.12;   // puddles in the low spots (~⅓ of the ground when soaked), not a mirror street
        float nrcPud = smoothstep(nrcTh, nrcTh + 0.05, nrcN) * nrcUp * (1.0 - smoothstep(nrcWet.z, nrcWet.z * 3.0, nrcD));
        float nrcW = nrcWet.x * mix(0.5, 1.0, nrcUp);
        float nrcPor = 1.0 - metalnessFactor;
        diffuseColor.rgb *= 1.0 - nrcW * nrcPor * 0.3 - nrcPud * nrcWet.x * 0.2;
        // raindrop rings in the puddles: two staggered cell layers of expanding ripples perturb the
        // normal (lamps and neon shiver in the water); faded out with distance before they can alias
        if (nrcRip.y > 0.01 && nrcPud > 0.02 && nrcD < 22.0) {
          vec2 nrcG = vec2(0.0);
          for (int l = 0; l < 2; l++) {
            vec2 q = nrcWP.xz * 2.4 + float(l) * vec2(0.37, 0.61);
            vec2 ci = floor(q) + float(l) * 17.0; vec2 cf = fract(q) - 0.5;
            float h = nrcWH(ci);
            vec2 dv = cf - (vec2(nrcWH(ci + 3.1), nrcWH(ci + 5.7)) - 0.5) * 0.36;
            float ph = fract(nrcRip.x * (0.8 + 0.5 * h) + h * 7.0);
            float d = length(dv), x = (d - ph * 0.42) * 30.0;
            float ring = sin(x * 3.0) * exp(-x * x * 0.5) * (1.0 - ph) * step(h, 0.25 + 0.75 * nrcRip.y);
            nrcG += dv / max(d, 1e-3) * ring;
          }
          float nrcRk = 0.45 * nrcPud * nrcRip.y * (1.0 - smoothstep(8.0, 22.0, nrcD));
          normal = normalize(normal + (viewMatrix[0].xyz * nrcG.x + viewMatrix[2].xyz * nrcG.y) * nrcRk);
        }
        roughnessFactor = mix(roughnessFactor, roughnessFactor * 0.6, nrcW);
        roughnessFactor = mix(roughnessFactor, 0.16, nrcPud * nrcWet.x);
        // specular anti-aliasing (Kaplanyan/Tokuyoshi): widen the lobe where the (normal-mapped) normal
        // varies inside the pixel → wet asphalt and car hoods no longer glitter under the lamps
        #if __VERSION__ >= 300 || defined(GL_OES_standard_derivatives)
          vec3 nrcNx = dFdx(normal), nrcNy = dFdy(normal);
          float nrcVar = 0.25 * (dot(nrcNx, nrcNx) + dot(nrcNy, nrcNy));
          float nrcA2 = roughnessFactor * roughnessFactor; nrcA2 *= nrcA2;
          roughnessFactor = max(sqrt(sqrt(clamp(nrcA2 + min(2.0 * nrcVar, 0.25), 0.0, 1.0))), 0.12);
        #endif
        // puddles are tagged for the post pass (screen-space mirror reflections), see opaque_fragment
        nrcPudTag = nrcPud * nrcWet.x * nrcWet.w;
      }
      #endif
    ` + SC.lights_physical_fragment;
    // puddle tag → alpha 0.87..0.97 in the HDR target (only opaque materials, only while the post
    // pipeline asked for it through nrcWet.w; the canvas has no alpha channel anyway)
    if (SC.opaque_fragment)
      SC.opaque_fragment =
        SC.opaque_fragment +
        `
      #if defined(NRC_PUDTAG) && defined(OPAQUE)
        if (nrcPudTag > 0.03) gl_FragColor.a = 0.87 + 0.1 * clamp(nrcPudTag, 0.0, 1.0);
      #endif
    `;
    const L = THREE.ShaderLib;
    for (const k of ["standard", "physical"])
      if (L[k] && L[k].uniforms)
        for (const n in WETU) L[k].uniforms[n] = { value: WETU[n].value };
  })();

  /** fog factor honoring FOG_EXP2 / linear (requires fog_pars_fragment include). Also sets
   *  `atmosFogC` = the aerial-perspective fog colour for this fragment (use it instead of fogColor). */
  A.glsl.fogFactor = `
    vec3 atmosFogC = vec3(0.0);
    float atmosFogFactor(){
      #ifdef USE_FOG
        atmosFogC = fogColor;
        #ifdef FOG_EXP2
          return nrcFogAmt(vFogRay, vFogCamY, fogDensity, fogColor, vec3(0.0), atmosFogC);
        #else
          return smoothstep(fogNear, fogFar, vFogDepth);
        #endif
      #else
        return 0.0;
      #endif
    }
  `;
  /** Fullscreen triangle vertex shader (for post passes) */
  A.glsl.fsVert = `
    varying vec2 vUv;
    void main(){ vUv = position.xy * 0.5 + 0.5; gl_Position = vec4(position.xy, 0.0, 1.0); }
  `;

  /** Create uniforms merged with fog uniforms (textures assigned after merge so they're not cloned). */
  A.fogUniforms = function (extra) {
    const u = THREE.UniformsUtils.merge([THREE.UniformsLib.fog, {}]);
    for (const k in extra) u[k] = extra[k];
    return u;
  };

  // ------------------------------------------------------------------
  // SOFT PARTICLES. 40_postfx.js copies the opaque scene depth (blit, WebGL2) right before the
  // transparent pass into `tSoftDepth`; smoke, fire, dust and explosion puffs fade out where they
  // meet walls and the ground instead of cutting hard lines through them. The uniform objects
  // are SHARED by reference (never clone a material that uses them).
  //   uSoftP: x near, y far, z enabled (0 → softK() returns 1), w -;  uSoftInv: 1 / scene target size
  // Vertex: write `vSoftZ = -mvPosition.z;`  Fragment: `a *= softK(vSoftZ, range_m);`
  // ------------------------------------------------------------------
  A.softU = {
    tSoftDepth: { value: null },
    uSoftP: { value: new THREE.Vector4(0.1, 3000, 0, 0) },
    uSoftInv: { value: new THREE.Vector2(1, 1) },
  };
  A.softUniforms = function (u) {
    for (const k in A.softU) u[k] = A.softU[k];
    return u;
  };
  A.glsl.softPars = `
    uniform sampler2D tSoftDepth; uniform vec4 uSoftP; uniform vec2 uSoftInv;
    varying float vSoftZ;
    float softK(float z, float range){
      if (uSoftP.z < 0.5) return 1.0;
      float d = texture2D(tSoftDepth, gl_FragCoord.xy * uSoftInv).r;
      if (d >= 0.99999) return 1.0;
      float nz = d * 2.0 - 1.0;
      float sz = 2.0 * uSoftP.x * uSoftP.y / (uSoftP.y + uSoftP.x - nz * (uSoftP.y - uSoftP.x));
      return clamp((sz - z) / max(range, 0.05), 0.0, 1.0);
    }
  `;

  /** Check a material compiled fine; returns false on GLSL errors. */
  A.validateMaterial = function (mat, geomOpt) {
    try {
      const r = G.renderer;
      const scene = new THREE.Scene();
      const mesh = new THREE.Mesh(
        geomOpt || new THREE.PlaneGeometry(1, 1),
        mat,
      );
      mesh.frustumCulled = false;
      scene.add(mesh);
      const cam = new THREE.PerspectiveCamera();
      r.compile(scene, cam);
      const props = r.properties.get(mat);
      const prog = props && props.currentProgram;
      if (prog && prog.diagnostics && prog.diagnostics.runnable === false)
        return false;
      if (prog && typeof prog.getUniforms === "function") prog.getUniforms(); // forces link check
      if (prog && prog.diagnostics && prog.diagnostics.runnable === false)
        return false;
      return true;
    } catch (e) {
      G.reportError("atmos:validate", e);
      return false;
    }
  };

  // ------------------------------------------------------------------
  // Shader prewarm. Effects that first appear mid-combat (fireballs, shock
  // rings, ash/goo piles, dissolve materials…) would otherwise compile their
  // GL programs on the frame they spawn → a visible hitch on the first
  // explosion / disintegration. Systems register sample objects via
  // A.onPrewarm(fn → Object3D[]); after initDone they are compiled against the
  // real scene (fog + lights) and — when post-fx is on — the HDR render
  // target, so the cached program is exactly the one used at runtime.
  // ------------------------------------------------------------------
