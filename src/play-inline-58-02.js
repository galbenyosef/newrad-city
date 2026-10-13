// play-inline-58 02 — shocks
// Lines 28-252 of readable/play-inline-58.pretty.js (statement-aligned).
  const A = G.atmos._;
  const NH = 6,
    NS = 3;

  const GLSL = `
    uniform vec4 uHeatA[${NH}];   // xy screen uv of the fire base, z plume half-width (uv, y units), w strength
    uniform vec4 uHeatB[${NH}];   // x linear depth of the fire (m), y plume height (uv), z,w -
    uniform vec4 uShockA[${NS}];  // xy centre uv, z ring radius (uv-y units), w amplitude
    uniform vec4 uShockB[${NS}];  // x ring width (uv), y linear depth of the blast, z,w -
    uniform float uHeatN, uShockN, uDistDepth;
  `;
  // returns the UV offset for the scene read; needs linZ(), tDepth, uNoise, uTime, uAspect
  const APPLY_GLSL = `
    vec2 nrcDistort(vec2 uv){
      vec2 off = vec2(0.0);
      float zf = -1.0;
      for (int i = 0; i < ${NH}; i++) {
        if (float(i) >= uHeatN) break;
        vec4 a = uHeatA[i]; vec4 b = uHeatB[i];
        vec2 q = uv - a.xy; q.x *= uAspect;
        // plume: starts at the flames, widens and fades as it rises
        float h = q.y / max(b.y, 1e-4);
        if (h < -0.15 || h > 1.25) continue;
        float wdt = a.z * (0.7 + 0.8 * clamp(h, 0.0, 1.0));
        float lat = abs(q.x) / max(wdt, 1e-4);
        if (lat > 1.0) continue;
        if (zf < 0.0) { float d = texture2D(tDepth, uv).r; zf = (uDistDepth > 0.5 && d < 0.99999) ? linZ(d) : 1e5; }
        if (zf < b.x - 1.2) continue;            // something in front of the fire: no shimmer on it
        float fall = (1.0 - lat * lat) * smoothstep(-0.15, 0.15, h) * (1.0 - smoothstep(0.55, 1.25, h));
        vec2 np = vec2(q.x / max(a.z, 1e-4), q.y / max(b.y, 1e-4)) * vec2(0.55, 0.9) + vec2(0.13 * float(i), -uTime * 0.85);
        vec2 n = texture2D(uNoise, np).rg - 0.5;
        n += (texture2D(uNoise, np * 2.3 + vec2(0.31, -uTime * 0.6)).gb - 0.5) * 0.6;
        off += n * a.w * fall;
      }
      for (int i = 0; i < ${NS}; i++) {
        if (float(i) >= uShockN) break;
        vec4 a = uShockA[i]; vec4 b = uShockB[i];
        vec2 q = uv - a.xy; q.x *= uAspect;
        float d = length(q);
        float x = (d - a.z) / max(b.x, 1e-4);
        if (abs(x) > 2.5) continue;
        if (zf < 0.0) { float dd = texture2D(tDepth, uv).r; zf = (uDistDepth > 0.5 && dd < 0.99999) ? linZ(dd) : 1e5; }
        if (zf < b.y * 0.5) continue;           // the viewmodel / something right in front
        // refraction: push outward just outside the front, pull inward just inside (a lens-like bulge)
        float prof = -x * exp(-x * x);
        vec2 dir = q / max(d, 1e-4); dir.x /= uAspect;
        off += dir * prof * a.w;
      }
      return off;
    }
  `;

  const S = { shocks: [], on: true, wrapped: false };
  try {
    if (G.QS && /heat/.test(G.QS.get("postoff") || "")) S.on = false;
  } catch (e) {
    /* ignore */
  }

  /** wrap G.fx.explosion (public API) once: record a blast wave, always call the original first */
  function hook() {
    if (S.wrapped || !G.fx || typeof G.fx.explosion !== "function") return;
    const orig = G.fx.explosion;
    G.fx.explosion = function (pos, radius, kind) {
      const ret = orig.apply(this, arguments);
      try {
        if (pos && S.on) {
          const nuke = kind === "nuke";
          const R = Math.max(0.5, radius || 4);
          S.shocks.push({
            p: new THREE.Vector3(pos.x, pos.y, pos.z),
            R: nuke ? Math.max(R, 14) * 2.2 : R,
            t: 0,
            dur: nuke ? 1.1 : 0.45 + Math.min(0.2, R * 0.02),
            amp: nuke
              ? 1.6
              : kind === "plasma" || kind === "electric"
                ? 0.8
                : 1.0,
          });
          if (S.shocks.length > NS) S.shocks.shift();
        }
      } catch (e) {
        /* never break the explosion */
      }
      return ret;
    };
    S.wrapped = true;
  }
  // ?heattest=1 (shots): a fire 5 m ahead of the camera + a blast wave frozen at 30 % of its life 14 m ahead
  function testSetup() {
    if (S.testDone || !G.QS || !G.QS.get("heattest") || !G.camera || !G.fx)
      return;
    S.testDone = true;
    try {
      const cam = G.camera,
        f = new THREE.Vector3();
      cam.getWorldDirection(f);
      f.y = 0;
      f.normalize();
      const c = new THREE.Vector3().setFromMatrixPosition(cam.matrixWorld);
      const gy = (p) =>
        (G.world && G.world.terrainHeight
          ? G.world.terrainHeight(p.x, p.z)
          : 0) || 0;
      const fp = c.clone().addScaledVector(f, 5);
      fp.y = gy(fp) + 0.2;
      if (G.fx.fire) G.fx.fire(fp, 1.2, { sound: false });
      const r = new THREE.Vector3(f.z, 0, -f.x);
      const bp = c.clone().addScaledVector(f, 14).addScaledVector(r, 3);
      bp.y = gy(bp) + 1;
      S.shocks.push({ p: bp, R: 4, t: 0, dur: 0.5, amp: 1, frozen: 0.3 });
    } catch (e) {
      /* test only */
    }
  }

  const _v = new THREE.Vector3(),
    _c = new THREE.Vector3(),
    _up = new THREE.Vector3();
  const cand = [];
  /** fills the composite uniforms; returns true if anything distorts this frame */
  function update(u, env, rd, depthOK) {
    const cam = G.camera;
    let nh = 0,
      ns = 0;
    testSetup();
    if (S.on && cam && G.state !== "title") {
      const tanY = Math.tan(((cam.fov || 70) * Math.PI) / 360);
      _c.setFromMatrixPosition(cam.matrixWorld);
      // --- fires (atmosphere emitters with a flame card)
      const em = A.emitters;
      if (em && em.length) {
        cand.length = 0;
        for (let i = 0; i < em.length; i++) {
          const e = em[i];
          if (!e || !e.alive || !e.card || e.paused || !e.pos) continue;
          const d = _c.distanceTo(e.pos);
          if (d > 45 || d < 0.8) continue;
          cand.push({ e, d });
        }
        cand.sort((a, b) => a.d - b.d);
        for (let i = 0; i < cand.length && nh < NH; i++) {
          const e = cand[i].e,
            d = cand[i].d,
            s = e.scale || 1;
          _v.copy(e.pos);
          _v.y += 0.35 * s;
          _v.project(cam);
          if (_v.z > 1 || Math.abs(_v.x) > 1.4 || _v.y < -1.6 || _v.y > 1.2)
            continue;
          // plume: ~0.9 m wide × 3 m tall per unit of fire scale, in uv-y units at this distance
          const pxPerM = 0.5 / (tanY * d);
          const halfW = 0.55 * s * pxPerM,
            height = 2.6 * s * pxPerM;
          // strength: a few pixels of wobble close up, fading with distance (and weaker by day in bright light)
          const amp =
            0.0048 *
            Math.min(1.4, Math.sqrt(s)) *
            (1 - A.smooth(18, 45, d)) *
            (0.75 + 0.25 * (env.night || 0));
          u.uHeatA.value[nh].set(
            _v.x * 0.5 + 0.5,
            _v.y * 0.5 + 0.5,
            halfW,
            amp,
          );
          u.uHeatB.value[nh].set(d, height, 0, 0);
          nh++;
        }
      }
      // --- blast waves
      for (let i = S.shocks.length - 1; i >= 0; i--) {
        const s = S.shocks[i];
        s.t = s.frozen !== undefined ? s.frozen * s.dur : s.t + rd;
        if (s.t >= s.dur) {
          S.shocks.splice(i, 1);
          continue;
        }
      }
      for (let i = 0; i < S.shocks.length && ns < NS; i++) {
        const s = S.shocks[i],
          k = s.t / s.dur;
        const d = Math.max(1, _c.distanceTo(s.p));
        _v.copy(s.p).project(cam);
        if (_v.z > 1) continue;
        const pxPerM = 0.5 / (tanY * d);
        const rWorld = s.R * (0.35 + 2.6 * (1 - Math.pow(1 - k, 2.2)));
        const ring = rWorld * pxPerM;
        if (ring > 2.5) continue;
        const amp =
          0.02 * s.amp * (1 - k) * (1 - k) * (1 - A.smooth(25, 90, d));
        if (amp < 0.0004) continue;
        u.uShockA.value[ns].set(_v.x * 0.5 + 0.5, _v.y * 0.5 + 0.5, ring, amp);
        u.uShockB.value[ns].set(Math.max(0.012, ring * 0.12), d, 0, 0);
        ns++;
      }
    }
    u.uHeatN.value = nh;
    u.uShockN.value = ns;
    S.last = { fires: nh, shocks: ns };
    u.uDistDepth.value = depthOK ? 1 : 0;
    return nh + ns > 0;
  }
  function uniforms() {
    const arr = (n) => {
      const a = [];
      for (let i = 0; i < n; i++) a.push(new THREE.Vector4());
      return a;
    };
    return {
      uHeatA: { value: arr(NH) },
      uHeatB: { value: arr(NH) },
      uShockA: { value: arr(NS) },
      uShockB: { value: arr(NS) },
      uHeatN: { value: 0 },
      uShockN: { value: 0 },
      uDistDepth: { value: 0 },
    };
  }
  function reset() {
    S.shocks.length = 0;
  }

  A.postDistort = { GLSL, APPLY_GLSL, update, uniforms, hook, reset, S };
