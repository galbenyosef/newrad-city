// play-inline-74 02 — math
// Lines 46-292 of readable/play-inline-74.pretty.js (statement-aligned).
  const RL = G.rlight,
    R = RL._;

  const _p = new THREE.Vector3(),
    _n = new THREE.Vector3(),
    _l = new THREE.Vector3(),
    _o = new THREE.Vector3(),
    _t = new THREE.Vector3();
  const _m3 = new THREE.Matrix3(),
    _c = new THREE.Color(),
    _ic = new THREE.Color(),
    _im = new THREE.Matrix4();
  const matCache = new WeakMap();
  const IGNORE_TAGS = ["actor", "interactable_self"];

  function toV(p) {
    return p && p.isVector3 ? p.clone() : new THREE.Vector3(p[0], p[1], p[2]);
  }
  function prepLights(list) {
    return (list || []).map((L, i) => {
      const c = new THREE.Color(L.color !== undefined ? L.color : 0xffdcaa);
      const k = L.intensity !== undefined ? L.intensity : 1.2;
      return {
        i,
        pos: toV(L.pos),
        r: c.r * k,
        g: c.g * k,
        b: c.b * k,
        range: L.range || 8,
        shadow: L.shadow !== false,
        vis: new Map(),
      };
    });
  }
  // ambient = the level away from any lamp, as a multiplier of the room's normal shading
  // (hex read as a LINEAR tint so 0xffffff·0.55 really is 55 %)
  function ambientOf(opts) {
    const c = new THREE.Color();
    c.setHex(
      opts.ambient !== undefined ? opts.ambient : 0xdfe4d2,
      THREE.LinearSRGBColorSpace,
    );
    return c.multiplyScalar(
      opts.ambientInt !== undefined ? opts.ambientInt : 0.55,
    );
  }
  function skipMaterial(m) {
    if (!m) return true;
    if (
      m.isMeshBasicMaterial ||
      m.isShaderMaterial ||
      m.isRawShaderMaterial ||
      m.isPointsMaterial ||
      m.isLineBasicMaterial ||
      m.isSpriteMaterial
    )
      return true;
    if (
      m.transparent &&
      (m.blending === THREE.AdditiveBlending || m.opacity < 0.95)
    )
      return true;
    if (
      m.emissive &&
      !m.emissiveMap &&
      (m.emissive.r + m.emissive.g + m.emissive.b) *
        (m.emissiveIntensity === undefined ? 1 : m.emissiveIntensity) >
        0.9
    )
      return true;
    return false;
  }
  function bakedMaterial(m) {
    if (m.vertexColors) return m;
    let c = matCache.get(m);
    if (!c) {
      c = m.clone();
      // Material.copy drops instance-level shader hooks and custom defines: carry them over
      const own = (k) => Object.prototype.hasOwnProperty.call(m, k);
      if (own("onBeforeCompile") && c.onBeforeCompile !== m.onBeforeCompile)
        c.onBeforeCompile = m.onBeforeCompile;
      if (
        own("customProgramCacheKey") &&
        c.customProgramCacheKey !== m.customProgramCacheKey
      )
        c.customProgramCacheKey = m.customProgramCacheKey;
      c.defines = Object.assign({}, c.defines || {}, m.defines || {}, {
        NRC_BAKED: 1,
      }); // virtual lights: pools already baked
      c.vertexColors = true;
      c.userData = Object.assign({}, m.userData, {
        rlBaked: true,
        shared: true,
      });
      matCache.set(m, c);
    }
    return c;
  }

  // ------------------------------------------------------------------
  // light lookup grid (4 m buckets) so each vertex only visits lamps in range
  // ------------------------------------------------------------------
  function lightGrid(lights) {
    const grid = new Map(),
      S = 4;
    for (const L of lights) {
      const r = L.range;
      for (
        let x = Math.floor((L.pos.x - r) / S);
        x <= Math.floor((L.pos.x + r) / S);
        x++
      )
        for (
          let y = Math.floor((L.pos.y - r) / S);
          y <= Math.floor((L.pos.y + r) / S);
          y++
        )
          for (
            let z = Math.floor((L.pos.z - r) / S);
            z <= Math.floor((L.pos.z + r) / S);
            z++
          ) {
            const k = x + "," + y + "," + z;
            let a = grid.get(k);
            if (!a) grid.set(k, (a = []));
            a.push(L);
          }
    }
    return {
      at(p) {
        return (
          grid.get(
            Math.floor(p.x / S) +
              "," +
              Math.floor(p.y / S) +
              "," +
              Math.floor(p.z / S),
          ) || null
        );
      },
    };
  }

  /** soft, cached visibility of light L from point p (normal n) */
  function lightVis(L, p, n, st) {
    if (!L.shadow || !G.world || !G.world.raycast) return 1;
    const ax = n
      ? Math.abs(n.x) > Math.abs(n.y)
        ? Math.abs(n.x) > Math.abs(n.z)
          ? n.x > 0
            ? 0
            : 1
          : n.z > 0
            ? 4
            : 5
        : Math.abs(n.y) > Math.abs(n.z)
          ? n.y > 0
            ? 2
            : 3
          : n.z > 0
            ? 4
            : 5
      : 6;
    const q = st.visRes;
    const key =
      ((Math.floor(p.x * q) & 2047) * 2048 + (Math.floor(p.z * q) & 2047)) *
        2048 +
      ((Math.floor(p.y * q) & 255) * 8 + ax);
    const hit = L.vis.get(key);
    if (hit !== undefined) return hit;
    if (st.rays <= 0) return 1;
    let v = 0;
    _o.copy(p);
    if (n) _o.addScaledVector(n, 0.08);
    for (let r = 0; r < 2; r++) {
      // two taps toward opposite sides of a ~0.3 m lamp → soft shadow edges
      _t.copy(L.pos);
      _t.x += r ? 0.15 : -0.15;
      _t.z += r ? -0.12 : 0.12;
      _l.subVectors(_t, _o);
      const d = _l.length();
      if (d < 0.3) {
        v += 1;
        continue;
      }
      _l.multiplyScalar(1 / d);
      st.rays--;
      st.nRays++;
      let occ = false;
      try {
        occ = !!G.world.raycast(_o, _l, d - 0.3, { ignoreTags: IGNORE_TAGS });
      } catch (e) {
        occ = false;
      }
      v += occ ? 0 : 1;
    }
    v = 0.12 + 0.88 * (v / 2);
    L.vis.set(key, v);
    return v;
  }

  /** irradiance multiplier (linear RGB) at a world point with a world normal */
  function irradiance(out, p, n, st) {
    const o = st.o;
    let r = o.amb.r,
      g = o.amb.g,
      b = o.amb.b;
    const list = st.grid ? st.grid.at(p) : st.lights;
    if (list)
      for (const L of list) {
        _l.subVectors(L.pos, p);
        const d2 = _l.lengthSq();
        if (d2 > L.range * L.range) continue;
        const d = Math.sqrt(d2) || 1e-3;
        _l.multiplyScalar(1 / d);
        const ndl = n ? n.dot(_l) : 1;
        if (ndl <= 0) continue;
        // windowed inverse square (smooth to 0 at range), soft near-field; half-Lambert keeps
        // walls beside a lamp from going flat
        const x = d / L.range,
          win = Math.max(0, 1 - x * x * x * x);
        let e = ((0.25 + 0.75 * ndl) * win * win) / (d2 * st.falloff + 1);
        if (e < 0.004) continue;
        e *= lightVis(L, p, n, st);
        r += L.r * e;
        g += L.g * e;
        b += L.b * e;
      }
    if (st.compress) {
      // overlapping lamps saturate instead of summing up (keeps pools, avoids a global lift)
      const k = st.compress,
        ar = o.amb.r,
        ag = o.amb.g,
        ab = o.amb.b;
      r = ar + k * (1 - Math.exp(-(r - ar) / k));
      g = ag + k * (1 - Math.exp(-(g - ag) / k));
      b = ab + k * (1 - Math.exp(-(b - ab) / k));
    }
    out.r = r;
    out.g = g;
    out.b = b;
    return out;
  }

  // ------------------------------------------------------------------
  // subdivision (longest-edge bisection) of big triangles
  // ------------------------------------------------------------------
