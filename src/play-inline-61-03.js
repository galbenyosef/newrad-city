// play-inline-61 03 — material
// Lines 367-565 of readable/play-inline-61.pretty.js (statement-aligned).
  function effVisible(o) {
    let p = o,
      depth = 0;
    while (p) {
      if (!p.visible) return false;
      if (p === G.scene) return true;
      p = p.parent;
      if (++depth > 32) return false;
    }
    return false; // not (yet) attached to the scene
  }
  const _gp = new THREE.Vector3(),
    _gs = new THREE.Vector3();
  const _frustum = new THREE.Frustum(),
    _pv = new THREE.Matrix4(),
    _sph = new THREE.Sphere();
  let glowFrame = 0;
  function uploadGlows() {
    if (!glowMesh) return;
    const env = A.env,
      night = env.interior ? 1 : env.night;
    const P = gPos.array,
      C = gCol.array;
    const cam = A.camPos,
      t = A.animTime;
    let n = 0;
    glowFrame++;
    const camObj = G.camera;
    const LC = A.glowLightCands || (A.glowLightCands = []);
    let nLC = 0;
    const lightsFromGlows = !env.interior && night > 0.35;
    if (camObj) {
      _pv.multiplyMatrices(camObj.projectionMatrix, camObj.matrixWorldInverse);
      _frustum.setFromProjectionMatrix(_pv);
    }
    for (let k = glows.length - 1; k >= 0; k--) {
      const o = glows[k];
      if (!o.parent) {
        unlist(o);
        continue;
      } // detached → drop now ('added' re-lists it)
      if (o._fresh) {
        o.updateWorldMatrix(true, false);
        o._fresh = false;
      }
      const e = o.matrixWorld.elements;
      _gp.set(e[12], e[13], e[14]);
      const dx = _gp.x - cam.x,
        dy = _gp.y - cam.y,
        dz = _gp.z - cam.z;
      const d2 = dx * dx + dy * dy + dz * dz;
      if (d2 > 900 * 900) continue;
      _gs.set(e[0], e[1], e[2]);
      const sc = _gs.length();
      // candidates for a real pool of light at night (street lamps, neon, fires) — see 55_fx_fixtures.js.
      // Collected before the frustum test: a lamp just behind you still lights the street you look at.
      if (
        lightsFromGlows &&
        d2 < 900 &&
        !o.noLight &&
        o.glowSize * sc >= 0.5 &&
        nLC < 48 &&
        o._vis !== false
      ) {
        const lc =
          LC[nLC] ||
          (LC[nLC] = {
            x: 0,
            y: 0,
            z: 0,
            r: 1,
            g: 1,
            b: 1,
            i: 0,
            size: 1,
            flicker: 0,
            seed: 0,
            obj: null,
          });
        const vis0 = o.dayFactor + (1 - o.dayFactor) * night;
        lc.x = _gp.x;
        lc.y = _gp.y;
        lc.z = _gp.z;
        lc.r = o.material.color.r;
        lc.g = o.material.color.g;
        lc.b = o.material.color.b;
        lc.i =
          o.glowIntensity *
          vis0 *
          (o.material.opacity !== undefined ? o.material.opacity : 1);
        lc.size = o.glowSize * sc;
        lc.flicker = o.flicker;
        lc.seed = o._seed;
        lc.obj = o;
        if (lc.i > 0.25) nLC++;
      }
      // frustum cull BEFORE the (parent-chain) visibility walk
      if (camObj) {
        _sph.center.copy(_gp);
        _sph.radius = o.glowSize * sc * 0.6 + 0.5;
        if (!_frustum.intersectsSphere(_sph)) continue;
      }
      // effective visibility is cached and refreshed every 6 frames (staggered per glow)
      if (o._visF < 0 || (glowFrame + k) % 6 === 0) {
        o._vis = effVisible(o);
        o._visF = glowFrame;
      }
      if (!o._vis) continue;
      if (n >= GLOW_CAP) break;
      const vis = o.dayFactor + (1 - o.dayFactor) * night;
      let inten =
        o.glowIntensity *
        vis *
        (o.material.opacity !== undefined ? o.material.opacity : 1);
      if (o.flicker)
        inten *=
          1 -
          o.flicker *
            (0.5 +
              0.5 *
                Math.sin(t * 17 + o._seed) *
                Math.sin(t * 7.3 + o._seed * 3)) *
            (Math.sin(t * 2.1 + o._seed) > 0.6 ? 1 : 0.3);
      if (inten <= 0.002) continue;
      const c = o.material.color;
      const i4 = n * 4;
      P[i4] = _gp.x;
      P[i4 + 1] = _gp.y;
      P[i4 + 2] = _gp.z;
      P[i4 + 3] = o.glowSize * sc;
      C[i4] = c.r * inten;
      C[i4 + 1] = c.g * inten;
      C[i4 + 2] = c.b * inten;
      C[i4 + 3] = 1;
      n++;
    }
    A.glowLightCandN = nLC;
    glowMesh.geometry.instanceCount = n;
    glowMesh.visible = n > 0;
    if (n) {
      gPos.updateRange.offset = 0;
      gPos.updateRange.count = n * 4;
      gPos.needsUpdate = true;
      gCol.updateRange.offset = 0;
      gCol.updateRange.count = n * 4;
      gCol.needsUpdate = true;
    }
  }
  A.glowCount = () => glows.length;
  /** Public, read-only walk over every live glow sprite (render_lighting request f): fn(glowProxy, index).
   *  The proxy is an Object3D (world position via getWorldPosition); `.glowSize`, `.noLight`, `.material.color`. */
  FX.forEachGlow = function (fn) {
    for (let k = 0; k < glows.length; k++) {
      try {
        fn(glows[k], k);
      } catch (e) {
        G.reportError("fx/forEachGlow", e);
        return;
      }
    }
  };

  // ==================================================================
  // Decals
  // ==================================================================
  const DK = {
    bullet: 0,
    bullet_concrete: 0,
    bullet_metal: 1,
    scorch: 2,
    blood: 3,
    blood_red: 3,
    blood_green: 4,
    green_blood: 4,
    laser: 5,
    laser_burn: 5,
    plasma: 6,
    plasma_burn: 6,
    crack: 7,
    oil: 8,
    blood_oil: 8,
    goo: 9,
    scorch_small: 10,
    blood_smear: 11,
    bullet_wood: 12,
    puddle: 13,
    dirt: 14,
    rad_puddle: 15,
    radiation: 15,
  };
  const DEC_CAP = 360;
  let decMesh = null,
    decAttr = null,
    decNext = 0,
    decCount = 0;
  const decMeta = []; // {born, life, heat, alpha}
  const hotDecals = new Set();
  let lastDecal = { x: 1e9, y: 0, z: 0, t: -1, k: -1 };

