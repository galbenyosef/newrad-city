// play-inline-69 02 — rng
// Lines 27-325 of readable/play-inline-69.pretty.js (statement-aligned).
  const A = G.atmos._,
    ATMOS = G.atmos;

  const CAP = 900;
  const VERT = `
    attribute vec3 iPos;    // pane centre (world)
    attribute vec4 iAx;     // x,z: façade tangent (unit, horizontal) · y: width (m) · w: height (m)
    attribute vec4 iCol;    // rgb: HDR colour · a: flicker seed (> 0.5 = fire)
    uniform float uPx, uTime, uNear, uFar, uI;
    varying vec3 vC; varying vec2 vQ;
    #include <fog_pars_vertex>
    void main(){
      vec3 t = vec3(iAx.x, 0.0, iAx.z);
      float dist = length(cameraPosition - iPos);
      float px = uPx * dist;                              // one screen pixel at this distance (m)
      // the quad is 2.4× the pane: the pane itself + the soft glow it throws on the wall/haze around it.
      // Far panes are held at ≥ ~2 × 2.5 px (a 1.4 m window is sub-pixel beyond ~600 m) with most of
      // their energy kept — they must still read as points of light on the far skyline.
      float w = max(iAx.y, px * 2.0), h = max(iAx.w, px * 2.5);
      float energy = pow((iAx.y * iAx.w) / (w * h), 0.3);
      vec3 wp = iPos + t * (position.x * w * 2.4) + vec3(0.0, position.y * h * 2.4, 0.0);
      vec4 mvPosition = viewMatrix * vec4(wp, 1.0);
      gl_Position = projectionMatrix * mvPosition;
      float s = iCol.a;
      float fl = 1.0;
      if (s > 0.5) fl = 0.72 + 0.28 * (0.5 + 0.5 * sin(uTime * (4.0 + s * 7.0) + s * 40.0)) * (0.6 + 0.4 * sin(uTime * 1.7 + s * 23.0));
      float fade = smoothstep(uNear, uNear * 1.7, dist) * (1.0 - smoothstep(uFar * 0.8, uFar, dist));
      vC = iCol.rgb * fl * fade * energy * uI;
      vQ = position.xy * 2.0;
      #include <fog_vertex>
    }
  `;
  const FRAG = `
    varying vec3 vC; varying vec2 vQ;
    #include <fog_pars_fragment>
    ${A.glsl.fogFactor}
    void main(){
      vec2 q = abs(vQ) * 2.4;                       // pane units: |q| < 1 is the window
      float pane = (1.0 - smoothstep(0.7, 1.05, q.x)) * (1.0 - smoothstep(0.75, 1.05, q.y));
      float glow = exp(-dot(q, q) * 0.9) * 0.3;     // light spilling onto the façade / into the haze
      float m = pane * (0.75 + 0.45 * (0.5 - 0.5 * clamp(vQ.y * 2.4, -1.0, 1.0))) + glow;   // lit from below (fire on the floor)
      if (m < 0.004) discard;
      vec3 c = vC * m;
      float ff = 0.0;
      #if defined( USE_FOG ) && defined( FOG_EXP2 )
        vec3 fc; ff = nrcFogAmt(vFogRay, vFogCamY, fogDensity, fogColor, c * 1.6, fc);
      #else
        ff = atmosFogFactor();
      #endif
      gl_FragColor = vec4(c * (1.0 - ff), 1.0);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }
  `;

  let mesh = null,
    built = false,
    count = 0,
    towers = 0;
  const stats = { towers: 0, lit: 0, panes: 0 };

  function build() {
    built = true;
    if (G.QS && G.QS.get("skyline") === "0") return;
    const W = G.world,
      L = G.LAYOUT;
    if (!W || !W.colliders || !L) return;
    const XMIN = L.INTERIOR_X_MIN;
    const rng = G.util && G.util.rng ? G.util.rng(90210) : Math.random;
    const pos = new Float32Array(CAP * 3),
      ax = new Float32Array(CAP * 4),
      col = new Float32Array(CAP * 4);
    const skipTags = {
      actor: 1,
      tree: 1,
      lamp: 1,
      sign: 1,
      prop: 1,
      furniture: 1,
      cover: 1,
      railing: 1,
      wreck: 1,
      rubble: 1,
      fence: 1,
      barrier: 1,
      interactable_self: 1,
    };
    // tall boxes only, deterministic order (collider registration order can vary between loads)
    const list = W.colliders.filter(
      (c) =>
        c &&
        !skipTags[c.tag] &&
        c.cx < XMIN - 50 &&
        c.maxY >= 28 &&
        c.maxY - c.minY >= 20 &&
        Math.min(c.hx, c.hz) >= 3.5 &&
        Math.max(c.hx, c.hz) <= 60 &&
        c.maxY < 460,
    );
    list.sort((a, b) => a.cx - b.cx || a.cz - b.cz || a.maxY - b.maxY);
    const put = (x, y, z, tx, tz, w, h, r, g, b, seed) => {
      if (count >= CAP) return;
      const i3 = count * 3,
        i4 = count * 4;
      pos[i3] = x;
      pos[i3 + 1] = y;
      pos[i3 + 2] = z;
      ax[i4] = tx;
      ax[i4 + 1] = w;
      ax[i4 + 2] = tz;
      ax[i4 + 3] = h;
      col[i4] = r;
      col[i4 + 1] = g;
      col[i4 + 2] = b;
      col[i4 + 3] = seed;
      count++;
    };
    const FLOOR = 3.7;
    for (const c of list) {
      if (count >= CAP) break;
      towers++;
      // taller towers are more often occupied (lookouts, sniper nests, high camps)
      const pLit = 0.5 + 0.3 * Math.min(1, (c.maxY - 28) / 120);
      if (rng() > pLit) continue;
      stats.lit++;
      const y0 = Math.max(c.minY, 0) + 8,
        y1 = c.maxY - 2.5;
      if (y1 <= y0) continue;
      const nFloors = Math.max(1, Math.floor((y1 - y0) / FLOOR));
      // one or two occupied floors, each with a small cluster of panes on one façade
      const groups = rng() < 0.4 ? 2 : 1;
      for (let gI = 0; gI < groups; gI++) {
        const fl = Math.floor(rng() * nFloors);
        const y = y0 + fl * FLOOR + FLOOR * 0.45;
        const face = Math.floor(rng() * 4);
        // face in collider-local space: normal (nx, nz), half extent along the face
        const nx = face === 0 ? 1 : face === 1 ? -1 : 0,
          nz = face === 2 ? 1 : face === 3 ? -1 : 0;
        const half = nx !== 0 ? c.hz : c.hx;
        const off = nx !== 0 ? c.hx : c.hz;
        // world normal & tangent (t = up × n → the quad's front faces outward)
        const wn = [nx * c.cos + nz * c.sin, -nx * c.sin + nz * c.cos];
        const tx = wn[1],
          tz = -wn[0];
        const kind = rng();
        const fire = kind < 0.62,
          tube = kind > 0.93;
        const n =
          fire && rng() < 0.18
            ? 5 + Math.floor(rng() * 4)
            : 1 + Math.floor(rng() * 3); // a whole burning floor now and then
        const pitch = 2.6 + rng() * 0.8;
        let s0 = (rng() * 2 - 1) * Math.max(0, half - n * pitch * 0.5 - 1.5);
        for (let k = 0; k < n; k++) {
          const s = s0 + (k - (n - 1) / 2) * pitch;
          if (Math.abs(s) > half - 1.0) continue;
          // local face point → world (0.35 m in front of the collider face)
          const lx = nx !== 0 ? nx * (off + 0.35) : s,
            lz = nz !== 0 ? nz * (off + 0.35) : s;
          const x = c.cx + lx * c.cos + lz * c.sin,
            z = c.cz - lx * c.sin + lz * c.cos;
          const skip = rng() < 0.25 && n > 2; // dark panes inside a lit floor
          if (skip) continue;
          let r, g, b;
          const I = 2.6 + rng() * 2.2;
          if (tube) {
            r = 0.72;
            g = 0.95;
            b = 0.82;
          } // generator-fed fluorescent tube
          else if (fire) {
            r = 1.0;
            g = 0.42 + rng() * 0.12;
            b = 0.1 + rng() * 0.06;
          } // camp fire
          else {
            r = 1.0;
            g = 0.66 + rng() * 0.1;
            b = 0.3 + rng() * 0.1;
          } // oil lantern / candles
          put(
            x,
            y + (rng() - 0.5) * 0.4,
            z,
            tx,
            tz,
            1.15 + rng() * 0.5,
            1.5 + rng() * 0.4,
            r * I,
            g * I,
            b * I,
            fire ? 0.5 + rng() * 0.5 : rng() * 0.45,
          );
        }
      }
    }
    stats.towers = towers;
    stats.panes = count;
    if (!count) return;
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
    geo.setAttribute(
      "iPos",
      new THREE.InstancedBufferAttribute(pos.slice(0, count * 3), 3),
    );
    geo.setAttribute(
      "iAx",
      new THREE.InstancedBufferAttribute(ax.slice(0, count * 4), 4),
    );
    geo.setAttribute(
      "iCol",
      new THREE.InstancedBufferAttribute(col.slice(0, count * 4), 4),
    );
    geo.instanceCount = count;
    const mat = new THREE.ShaderMaterial({
      uniforms: A.fogUniforms({
        uPx: { value: 0.002 },
        uTime: { value: 0 },
        uNear: { value: 150 },
        uFar: { value: 3200 },
        uI: { value: 0 },
      }),
      vertexShader: VERT,
      fragmentShader: FRAG,
      fog: true,
      transparent: true,
      depthWrite: false,
      side: THREE.FrontSide,
      blending: THREE.CustomBlending,
      blendSrc: THREE.OneFactor,
      blendDst: THREE.OneFactor,
      blendEquation: THREE.AddEquation,
    });
    mat.name = "atmos_skyline";
    mesh = new THREE.Mesh(geo, mat);
    mesh.name = "atmos_skyline";
    mesh.frustumCulled = false;
    mesh.renderOrder = 38;
    mesh.visible = false;
    G.scene.add(mesh);
    // compile now (three only compiles visible objects): no hitch at dusk when the panes first appear
    if (A.compileFor) {
      try {
        mesh.visible = true;
        A.compileFor(mesh, true);
      } catch (e) {
        /* compiled on first use */
      }
      mesh.visible = false;
    }
  }

  const _sz = new THREE.Vector2();
  function update(dt, realDt) {
    if (!mesh) return;
    const env = A.env;
    const W = A.weather ? A.weather.cur : null;
    const k = env.interior
      ? 0
      : A.smooth(0.25, 0.7, env.night) * (W ? 1 - 0.5 * W.dust : 1);
    mesh.visible = k > 0.01;
    if (!mesh.visible) return;
    const u = mesh.material.uniforms;
    u.uI.value = k;
    u.uTime.value = A.animTime;
    const cam = G.camera,
      r = G.renderer;
    if (cam && r) {
      r.getDrawingBufferSize(_sz);
      const sc = ATMOS.renderScale ? ATMOS.renderScale() : 1;
      u.uPx.value =
        (2 * Math.tan(((cam.fov || 70) * Math.PI) / 360)) /
        Math.max(120, _sz.y * (sc || 1));
    }
  }

  A.addSystem({
    name: "skyline",
    order: 72,
    init() {
      G.events.on("initDone", () => {
        try {
          if (!built) build();
        } catch (e) {
          G.reportError("atmosphere/skyline", e);
        }
      });
    },
    update,
  });
