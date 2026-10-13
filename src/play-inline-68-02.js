// play-inline-68 02 — three
// Lines 18-365 of readable/play-inline-68.pretty.js (statement-aligned).
  const A = G.atmos._,
    ATMOS = G.atmos,
    FX = G.fx,
    FR = A.FR;
  const rr = A.rr;

  // ------------------------------------------------------------------
  // Wrap fields
  // ------------------------------------------------------------------
  const WVERT = `
    attribute vec4 iSeed;
    uniform vec3 uCam, uBox, uVel;
    uniform float uTime, uSize, uStretch, uJitter, uAmount, uFrame;
    uniform vec4 uColor;
    uniform vec2 uShelter;   // x = radius of the dry zone around the camera (m), y = 0..1 strength
    uniform vec3 uNear;      // x..y: fade-in distance band (nothing smears across the lens), z: max size / distance (0 = off)
    varying vec2 vUv; varying float vA; varying float vSoftZ; varying float vSoftR;
    #ifdef LIT_POOL
      // the flash/fixture light pool (street lamps near the player at night, muzzle flashes, lightning,
      // explosions): streaks passing through a light's reach catch it — rain glitters in lamp light
      uniform vec4 uPL[3]; uniform vec3 uPC[3];
      varying vec3 vLit;
    #endif
    #include <fog_pars_vertex>
    void main(){
      vec3 p = iSeed.xyz * uBox + uVel * uTime * (0.75 + 0.5 * iSeed.w);
      p += vec3(sin(uTime * 0.7 + iSeed.w * 40.0), sin(uTime * 0.9 + iSeed.w * 23.0) * 0.5, cos(uTime * 0.6 + iSeed.w * 31.0)) * uJitter;
      vec3 rel = mod(p - uCam + uBox * 0.5, uBox) - uBox * 0.5;
      vec3 wp = uCam + rel;
      vec3 rn = rel / (uBox * 0.5);
      float edge = 1.0 - smoothstep(0.55, 1.0, max(max(abs(rn.x), abs(rn.y)), abs(rn.z)));
      vA = edge * step(iSeed.w, uAmount) * uColor.a;
      // under a roof: nothing falls in a disc around the player (rain keeps falling outside the doorway)
      if (uShelter.y > 0.0) vA *= 1.0 - uShelter.y * (1.0 - smoothstep(uShelter.x, uShelter.x + 2.5, length(rel.xz)));
      #ifdef LIT_POOL
        vLit = vec3(0.0);
        for (int i = 0; i < 3; i++) {
          vec3 dl = wp - uPL[i].xyz; float d2 = dot(dl, dl);
          float w = clamp(1.0 - sqrt(d2) / max(uPL[i].w, 0.01), 0.0, 1.0);
          vLit += uPC[i] * (w * w / max(d2, 0.35));
        }
        vLit = min(vLit, vec3(3.0));
      #endif
      vec4 mv = viewMatrix * vec4(wp, 1.0);
      float dcam = max(-mv.z, 0.01);
      vA *= smoothstep(uNear.x, uNear.y, dcam);
      float size = uSize * (0.6 + 0.8 * fract(iSeed.w * 13.7));
      if (uNear.z > 0.0) size = min(size, dcam * uNear.z);      // a speck/streak never grows past ~1-2 px wide
      vec2 q = position.xy;
      if (uStretch > 0.0) {
        vec3 vv = (viewMatrix * vec4(uVel, 0.0)).xyz;
        vec2 d = vv.xy; float L = length(d);
        vec2 dir = L > 1e-4 ? d / L : vec2(0.0, 1.0);
        vec2 perp = vec2(dir.y, -dir.x);   // (perp, dir) must be a proper rotation: the mirrored basis flipped the winding and FrontSide culled every streak
        float len = min(size + L * uStretch, 0.1 + dcam * 0.22);   // near streaks stay short
        mv.xy += dir * q.y * len + perp * q.x * size;
      } else {
        float a = iSeed.w * 40.0 + uTime * (fract(iSeed.w * 7.1) - 0.5);
        float c = cos(a), s = sin(a);
        mv.xy += vec2(c * q.x - s * q.y, s * q.x + c * q.y) * size;
      }
      gl_Position = projectionMatrix * mv;
      vSoftZ = -mv.z; vSoftR = uStretch > 0.0 ? 0.0 : size * 0.45;   // big dust/veil sheets fade into the ground & walls
      vec2 cell = vec2(mod(uFrame, 4.0), 3.0 - floor(uFrame / 4.0));
      vUv = (cell + q + 0.5) / 4.0;
      vec4 mvPosition = mv;
      #include <fog_vertex>
    }
  `;
  const WFRAG = `
    uniform sampler2D uMap; uniform vec4 uColor; uniform vec3 uLight;
    varying vec2 vUv; varying float vA; varying float vSoftR;
    #ifdef LIT_POOL
      varying vec3 vLit;
    #endif
    #include <fog_pars_fragment>
    ${A.glsl.fogFactor}
    ${A.glsl.softPars}
    void main(){
      if (vA < 0.004) discard;
      vec4 t = texture2D(uMap, vUv);
      float a = t.a * vA;
      if (vSoftR > 0.3) a *= softK(vSoftZ, vSoftR);
      float ff = atmosFogFactor();
      #ifdef ADDITIVE
        gl_FragColor = vec4(uColor.rgb * t.rgb * a * (1.0 - ff), 1.0);
      #else
        vec3 c = uColor.rgb * t.rgb * uLight;
        #ifdef LIT_POOL
          c += t.rgb * vLit;
          a = min(1.0, a * (1.0 + 0.6 * min(dot(vLit, vec3(0.33)), 1.5)));
        #endif
        gl_FragColor = vec4(mix(c, atmosFogC, ff), a);
      #endif
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }
  `;
  const fields = (A.fields = {});
  // light-pool uniforms shared by the lit fields (rain): position + reach, colour × strength
  const POOL_P = [
    new THREE.Vector4(0, -1e4, 0, 0.01),
    new THREE.Vector4(0, -1e4, 0, 0.01),
    new THREE.Vector4(0, -1e4, 0, 0.01),
  ];
  const POOL_C = [
    new THREE.Color(0, 0, 0),
    new THREE.Color(0, 0, 0),
    new THREE.Color(0, 0, 0),
  ];
  function updatePoolUniforms() {
    const P = A.flashPool || [];
    for (let i = 0; i < 3; i++) {
      const f = P[i],
        L = f && f.light;
      if (!L || !(L.intensity > 0.01)) {
        POOL_P[i].set(0, -1e4, 0, 0.01);
        POOL_C[i].setRGB(0, 0, 0);
        continue;
      }
      POOL_P[i].set(L.position.x, L.position.y, L.position.z, L.distance || 10);
      POOL_C[i].copy(L.color).multiplyScalar(Math.min(L.intensity, 400) * 0.12);
    }
  }
  function makeField(name, count, opts) {
    const geo = new THREE.InstancedBufferGeometry();
    geo.setAttribute(
      "position",
      new THREE.BufferAttribute(
        new Float32Array([
          -0.5, -0.5, 0, 0.5, -0.5, 0, 0.5, 0.5, 0, -0.5, 0.5, 0,
        ]),
        3,
      ),
    );
    geo.setIndex([0, 1, 2, 0, 2, 3]);
    const seeds = new Float32Array(count * 4);
    for (let i = 0; i < count * 4; i++) seeds[i] = Math.random();
    geo.setAttribute("iSeed", new THREE.InstancedBufferAttribute(seeds, 4));
    geo.instanceCount = count;
    const u = A.softUniforms(
      A.fogUniforms({
        uMap: { value: A.atlasTex },
        uCam: { value: new THREE.Vector3() },
        uBox: { value: new THREE.Vector3().fromArray(opts.box) },
        uVel: { value: new THREE.Vector3() },
        uTime: { value: 0 },
        uSize: { value: opts.size },
        uStretch: { value: opts.stretch || 0 },
        uJitter: { value: opts.jitter || 0 },
        uAmount: { value: 0 },
        uFrame: { value: opts.frame },
        uColor: { value: new THREE.Vector4(1, 1, 1, 1) },
        uLight: { value: new THREE.Color(1, 1, 1) },
        uShelter: { value: new THREE.Vector2(6, 0) },
        uNear: {
          value: new THREE.Vector3().fromArray(opts.near || [0, 0.01, 0]),
        },
      }),
    );
    const defs = {};
    if (opts.additive) defs.ADDITIVE = 1;
    if (opts.lit) {
      defs.LIT_POOL = 1;
      u.uPL = { value: POOL_P };
      u.uPC = { value: POOL_C };
    }
    const mat = new THREE.ShaderMaterial({
      uniforms: u,
      vertexShader: WVERT,
      fragmentShader: WFRAG,
      fog: true,
      transparent: true,
      depthWrite: false,
      defines: defs,
    });
    if (opts.additive) {
      mat.blending = THREE.CustomBlending;
      mat.blendSrc = THREE.OneFactor;
      mat.blendDst = THREE.OneFactor;
    }
    mat.name = "atmos_field_" + name;
    const mesh = new THREE.Mesh(geo, mat);
    mesh.name = "atmos_field_" + name;
    mesh.frustumCulled = false;
    mesh.renderOrder = 28;
    mesh.visible = false;
    G.scene.add(mesh);
    const f = { mesh, u, count, amount: 0 };
    fields[name] = f;
    return f;
  }
  function setField(f, amount, vel, color, alpha, light) {
    f.amount = amount;
    f.mesh.visible = amount > 0.003;
    if (!f.mesh.visible) return;
    f.u.uAmount.value = amount;
    f.u.uCam.value.copy(A.camPos);
    f.u.uTime.value = A.animTime % 2000;
    if (vel) f.u.uVel.value.copy(vel);
    if (color !== undefined) {
      const c = A.color(color, A.tmpC);
      f.u.uColor.value.set(c.r, c.g, c.b, alpha);
    }
    if (light) f.u.uLight.value.copy(light);
  }

  // ------------------------------------------------------------------
  // Steam vents & distant plumes
  // ------------------------------------------------------------------
  const vents = [];
  function buildVents() {
    const L = G.LAYOUT;
    if (!L) return;
    let pts = [];
    try {
      if (!G.isStub("map") && Array.isArray(G.map.manholes))
        pts = G.map.manholes.map((m) => ({ x: m.x, z: m.z, y: m.y || 0 }));
    } catch (e) {
      pts = [];
    }
    if (!pts.length) {
      for (const a of L.avenues)
        for (const s of L.streets) {
          if (s.park) continue;
          if (a.x < s.x0 || a.x > s.x1 || s.z < a.z0 || s.z > a.z1) continue;
          const h = G.util.hash2(a.x * 3 + 11, s.z * 7 + 5);
          if (h > 0.3) continue;
          const ox = (G.util.hash2(a.x, s.z) - 0.5) * 7,
            oz = (G.util.hash2(s.z, a.x) - 0.5) * 5;
          pts.push({ x: a.x + ox, z: s.z + oz, y: 0 });
        }
    } else
      pts = pts.filter(
        (p, i) => G.util.hash2(Math.round(p.x), Math.round(p.z)) < 0.35,
      );
    for (const p of pts) {
      const e = FX.steam(
        new THREE.Vector3(p.x, p.y + 0.05, p.z),
        rr(0.7, 1.2),
        { lod: 80, rate: rr(3, 6) },
      );
      if (e) vents.push(e);
    }
  }

  // Distant plumes: picked from the LAYOUT (generic city blocks only — never inside a
  // landmark SITE, never within a discoverable LOCATION, spread across the map, biased
  // toward the burnt-out Financial District / Brooklyn / Midtown South). Deterministic.
  const PLUME_COUNT = 7;
  function choosePlumeSites() {
    const L = G.LAYOUT,
      out = [];
    if (!L || !Array.isArray(L.blocks) || !L.blocks.length) return out;
    const rng = G.util && G.util.rng ? G.util.rng(9151) : Math.random;
    const bias = {
      financial_district: 1.6,
      brooklyn: 1.5,
      midtown_south: 1.2,
      greenwich_village: 1.0,
      midtown: 0.8,
      upper_west_side: 0.7,
      upper_east_side: 0.7,
    };
    const cands = [];
    for (const b of L.blocks) {
      const w = b.x1 - b.x0,
        d = b.z1 - b.z0;
      if (w < 30 || d < 20) continue;
      const x = b.cx,
        z = b.cz;
      if (!L.isLand(x, z) || (L.inPark && L.inPark(x, z))) continue;
      if (L.rectOverlapsSite && L.rectOverlapsSite(b.x0, b.z0, b.x1, b.z1, 6))
        continue;
      if (L.siteAt && L.siteAt(x, z, 20)) continue;
      let nearLoc = false;
      for (const l of L.LOCATIONS || [])
        if (Math.hypot(x - l.x, z - l.z) < (l.r || 30) + 45) {
          nearLoc = true;
          break;
        }
      if (nearLoc) continue;
      const vp = L.cryoExit;
      if (vp && Math.hypot(x - vp.x, z - vp.z) < 200) continue;
      cands.push({ b, score: (bias[b.district] || 0.8) * (0.4 + rng()) });
    }
    cands.sort((a, b) => b.score - a.score);
    const perDist = {};
    for (let pass = 1; pass <= 2; pass++) {
      // pass 1: one per district (spread over the skyline), pass 2: fill
      for (const c of cands) {
        if (out.length >= PLUME_COUNT) break;
        const x = c.b.cx,
          z = c.b.cz,
          dn = c.b.district || "?";
        if ((perDist[dn] || 0) >= pass) continue;
        if (out.some((o) => Math.hypot(o.x - x, o.z - z) < 230)) continue;
        perDist[dn] = (perDist[dn] || 0) + 1;
        out.push({ x, z, h: 170 + rng() * 90, w: 26 + rng() * 14 });
      }
    }
    return out;
  }
  let PLUME_SITES = [];
  const PVERT = `
    attribute vec4 iBase;   // x, y, z, height
    attribute vec4 iParam;  // width, seed, alpha, glow
    uniform vec3 uCam; uniform vec2 uWind; uniform float uTime;
    varying vec2 vUv; varying vec4 vParam; varying float vFade; varying float vH; varying float vHm;
    #include <fog_pars_vertex>
    void main(){
      float y = position.y;       // 0..1 up the column
      float h = iBase.w;
      vec3 base = iBase.xyz;
      vec3 up = vec3(0.0, 1.0, 0.0);
      vec3 toCam = uCam - base; toCam.y = 0.0;
      float dc = length(toCam);
      toCam /= max(dc, 1e-3);
      // width: tight rising column that mushrooms out into a broad, drifting canopy near the top
      float spread = 0.55 + 1.3 * y + 4.2 * pow(smoothstep(0.35, 1.0, y), 1.6);
      float w = iParam.x * spread * (1.0 + 0.08 * sin(uTime * 0.3 + iParam.y * 9.0 + y * 6.0));
      // wind shear: little lean low down, strong lean once the smoke loses buoyancy
      vec2 wv = uWind; float ws = length(wv); vec2 wd = ws > 0.01 ? wv / ws : vec2(0.8, 0.6);
      float shear = h * (0.05 * y + 0.85 * pow(smoothstep(0.3, 1.0, y), 1.5)) * clamp(0.35 + ws * 0.12, 0.35, 1.3);
      // the canopy flattens: the top rises slower than it spreads
      float yy = y < 0.55 ? y : 0.55 + (y - 0.55) * 0.55;
      vec3 ctr = base + up * yy * h + vec3(wd.x, 0.0, wd.y) * shear;
      // ribbon turned around its own (sheared) centre line toward the viewer: from the street it is the
      // usual upright column, from rooftops / the air the wind-blown canopy opens into a broad sheet
      // instead of an edge-on black line
      float y2 = min(y + 0.04, 1.0), y1 = y2 - 0.04;
      float s1 = h * (0.05 * y1 + 0.85 * pow(smoothstep(0.3, 1.0, y1), 1.5)) * clamp(0.35 + ws * 0.12, 0.35, 1.3);
      float s2 = h * (0.05 * y2 + 0.85 * pow(smoothstep(0.3, 1.0, y2), 1.5)) * clamp(0.35 + ws * 0.12, 0.35, 1.3);
      float q1 = y1 < 0.55 ? y1 : 0.55 + (y1 - 0.55) * 0.55, q2 = y2 < 0.55 ? y2 : 0.55 + (y2 - 0.55) * 0.55;
      vec3 tang = up * (q2 - q1) * h + vec3(wd.x, 0.0, wd.y) * (s2 - s1);
      vec3 v3 = normalize(uCam - ctr);
      vec3 rgt = cross(normalize(tang + up * 1e-3), v3);
      vec3 right = length(rgt) > 1e-3 ? normalize(rgt) : normalize(cross(up, toCam));
      vec3 wp = ctr + right * position.x * w;
      vUv = vec2(position.x + 0.5, y);
      vParam = iParam;
      vH = h / max(iParam.x, 1.0); vHm = h;
      vFade = smoothstep(90.0, 220.0, dc);
      vec4 mvPosition = viewMatrix * vec4(wp, 1.0);
      gl_Position = projectionMatrix * mvPosition;
      #include <fog_vertex>
    }
  `;
