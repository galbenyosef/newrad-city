// play-inline-170 09 — night
// Lines 2251-2486 of readable/play-inline-170.pretty.js (statement-aligned).
  K.reflSet = function (name) {
    const ce = [],
      pa = [],
      co = [],
      idx = [];
    let n = 0;
    return {
      add(x, z, h, color, width, o) {
        o = o || {};
        const len = o.len || Math.max(2.5, Math.min(12, h * 0.85 + 1.5)),
          it = o.i === undefined ? 1 : o.i,
          y = o.y !== undefined ? o.y : 0.04;
        _c.set(color === undefined ? 0xffd9a0 : color);
        for (const k of [
          [-1, 0],
          [1, 0],
          [1, 1],
          [-1, 1],
        ]) {
          ce.push(x, y, z);
          pa.push(k[0], k[1], width, len);
          co.push(_c.r * it, _c.g * it, _c.b * it);
        }
        idx.push(
          n,
          n + 2,
          n + 1,
          n,
          n + 3,
          n + 2,
          n,
          n + 1,
          n + 2,
          n,
          n + 2,
          n + 3,
        );
        n += 4;
        return this;
      },
      finish(parent, o) {
        o = o || {};
        if (!n) return null;
        const g = new THREE.BufferGeometry();
        g.setAttribute("position", new THREE.Float32BufferAttribute(ce, 3));
        g.setAttribute("aParams", new THREE.Float32BufferAttribute(pa, 4));
        g.setAttribute("color", new THREE.Float32BufferAttribute(co, 3));
        g.setIndex(idx);
        g.computeBoundingSphere();
        g.boundingSphere.radius += 20;
        const m = new THREE.ShaderMaterial({
          uniforms: {
            uOpacity: { value: 1 },
            uMask: { value: getPuddleTex() },
            uWet: { value: o.wet === undefined ? 1 : o.wet },
            uFar: { value: o.interior ? 70 : 140 },
          },
          vertexShader: [
            "attribute vec4 aParams; attribute vec3 color;",
            "varying vec3 vCol; varying vec2 vUv; varying vec2 vW; varying float vFade;",
            "uniform float uFar;",
            "void main(){",
            "  vec2 toCam = cameraPosition.xz - position.xz; float dc = length(toCam);",
            "  vec2 dir = dc > 1e-3 ? toCam / dc : vec2(0.0, 1.0); vec2 perp = vec2(-dir.y, dir.x);",
            "  float len = min(aParams.w, dc * 0.6);",
            "  float wd = aParams.z * (1.0 - aParams.y * 0.45);", // narrows toward the viewer: a streak, not a beam
            "  vec2 o2 = perp * aParams.x * wd * 0.5 + dir * (aParams.y * len - 0.25);",
            "  vec3 p = position + vec3(o2.x, 0.0, o2.y);",
            "  vCol = color; vUv = aParams.xy; vW = p.xz;",
            "  float dn = length(cameraPosition - p);",
            "  vFade = (1.0 - smoothstep(uFar * 0.6, uFar, dc)) * smoothstep(2.5, 9.0, dn);",
            "  gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);",
            "}",
          ].join("\n"),
          fragmentShader: [
            "uniform float uOpacity; uniform sampler2D uMask; uniform float uWet;",
            "varying vec3 vCol; varying vec2 vUv; varying vec2 vW; varying float vFade;",
            "void main(){",
            "  float across = 1.0 - vUv.x * vUv.x; across *= across;",
            "  float along = pow(1.0 - vUv.y, 2.2) * smoothstep(0.0, 0.08, vUv.y + 0.02);",
            "  float m = texture2D(uMask, vW / 8.0).r;",
            "  float wet = mix(0.75 + 0.25 * m, smoothstep(0.38, 0.85, m) * 1.2 + 0.03, uWet);",
            "  float ripple = 0.85 + 0.15 * sin(vW.x * 7.0 + vW.y * 5.0 + vUv.y * 20.0);",
            "  gl_FragColor = vec4(vCol * across * along * wet * ripple * uOpacity * vFade, 1.0);",
            "}",
          ].join("\n"),
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          polygonOffset: true,
          polygonOffsetFactor: -3,
          polygonOffsetUnits: -3,
        });
        m.userData.shared = true;
        reflMats.push({
          mat: m,
          day: o.day !== undefined ? o.day : 0.05,
          night: o.night !== undefined ? o.night : 0.9,
          interior: !!o.interior,
        });
        const mesh = new THREE.Mesh(g, m);
        mesh.name = "pmid_refl_" + name;
        mesh.renderOrder = 3;
        mesh.matrixAutoUpdate = false;
        mesh.updateMatrix();
        (parent || G.scene).add(mesh);
        const lod = o.lod !== undefined ? o.lod : o.interior ? 0 : 240;
        if (lod) G.world.addLOD(mesh, lod, g.boundingSphere.center.clone());
        return mesh;
      },
    };
  };

  /** Materials whose emissiveIntensity follows day/night (lit windows etc.). */
  const nightMats = [];
  K.nightEmissive = function (key, day, night) {
    nightMats.push({ key, day, night });
  };
  K.updateNightMats = function (night) {
    for (const n of nightMats) {
      const m = K.mat(n.key);
      if (m && m.emissiveIntensity !== undefined)
        m.emissiveIntensity = U.lerp(n.day, n.night, night);
    }
  };
  K.updateGlows = function (t, night) {
    for (const m of glowMats) {
      const base = m.userData.interior
        ? m.userData.nightOpacity
        : U.lerp(m.userData.dayOpacity, m.userData.nightOpacity, night);
      const f = m.userData.flicker
        ? 1 -
          m.userData.flicker *
            (0.5 + 0.5 * Math.sin(t * 13.7 + Math.sin(t * 3.1) * 4)) *
            (Math.sin(t * 0.7) > 0.6 ? 1 : 0.2)
        : 1;
      m.opacity = base * f;
    }
    for (const s of spillMats)
      s.mat.opacity = s.interior ? s.night : U.lerp(s.day, s.night, night);
    for (const s of reflMats)
      s.mat.uniforms.uOpacity.value = s.interior
        ? s.night
        : U.lerp(s.day, s.night, night);
  };

  // ------------------------------------------------------------------
  // Anchors / site registry
  // ------------------------------------------------------------------
  /**
   * Create the exported POI record {id, root, interiorRoot, interiorKey, anchors} and register it into G.pois.
   * Anchors are world-space Vector3 with a .yaw; interior anchors live in the x ≥ 5000 cell.
   */
  K.record = function (id, interiorKey) {
    const root = new THREE.Group();
    root.name = "poi_" + id;
    G.scene.add(root);
    const iroot = new THREE.Group();
    iroot.name = "poi_" + id + "_interior";
    iroot.visible = false;
    G.scene.add(iroot);
    const rec = {
      id,
      root,
      interiorRoot: iroot,
      interiorKey: interiorKey || id,
      anchors: {},
      name: (G.LAYOUT.getSite(id) || {}).name || id,
      owner: "poi_midtown",
    };
    rec.anchor = function (name, x, y, z, yaw) {
      const v = new THREE.Vector3(x, y + (K.yOff || 0), z);
      v.yaw = yaw || 0;
      rec.anchors[name] = v;
      return v;
    };
    G.pois[id] = rec;
    K.A.records[id] = rec;
    return rec;
  };

  // ------------------------------------------------------------------
  // FX bridges (degrade gracefully when atmosphere/fx is a stub)
  // ------------------------------------------------------------------
  A.fires = A.fires || []; // {pos, scale, handle}
  K.fire = function (x, y, z, scale) {
    A.fires.push({
      pos: new THREE.Vector3(x, y, z),
      scale: scale || 1,
      handle: null,
    });
  };
  A.smokes = A.smokes || [];
  K.smoke = function (x, y, z, scale) {
    A.smokes.push({
      pos: new THREE.Vector3(x, y, z),
      scale: scale || 1,
      handle: null,
    });
  };
  // Each fire/smoke is started at most once per game: a handle that can't be stopped (fx returned nothing)
  // is remembered as 'unstoppable' and never restarted, so reset → newGame / load cycles can't stack fires.
  K.startFx = function () {
    if (G.isStub("fx")) return;
    const start = (f, fn) => {
      if (f.handle) return;
      try {
        f.handle = fn(f.pos.clone(), f.scale) || "unstoppable";
      } catch (e) {
        f.handle = "failed";
      }
    };
    for (const f of A.fires) start(f, (p, s) => G.fx.fire(p, s));
    for (const f of A.smokes) start(f, (p, s) => G.fx.smoke(p, s));
  };
  K.stopFx = function () {
    for (const f of A.fires.concat(A.smokes)) {
      const h = f.handle;
      if (!h || typeof h !== "object") continue;
      f.handle = null;
      try {
        if (h.stop) h.stop();
        else if (h.remove) h.remove();
        else if (h.dispose) h.dispose();
      } catch (e) {
        /* ignore */
      }
    }
  };
  /** Debug: number of live fx handles (should equal fires + smokes after newGame, never more). */
  K.fxCount = function () {
    let n = 0;
    for (const f of A.fires.concat(A.smokes))
      if (f.handle && typeof f.handle === "object") n++;
    return n;
  };
