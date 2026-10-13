// play-inline-67 02 — three
// Lines 22-348 of readable/play-inline-67.pretty.js (statement-aligned).
  const A = G.atmos._,
    FX = G.fx,
    FR = A.FR;
  const rr = A.rr;

  const jobs = [];
  const piles = [];
  const MAX_PILES = 12;
  const _box = new THREE.Box3(),
    _c = new THREE.Vector3(),
    _sz = new THREE.Vector3(),
    _p = new THREE.Vector3();

  const onBC = function (sh) {
    const u = this.userData.dissolve;
    sh.uniforms.uDisProg = u.prog;
    sh.uniforms.uDisEdge = u.edge;
    sh.uniforms.uDisChar = u.char;
    sh.uniforms.uDisTint = u.tint;
    sh.uniforms.uNoise = { value: A.noiseTex };
    sh.uniforms.uDisPivot = u.pivot;
    sh.uniforms.uDisSquash = u.squash;
    // The melt / slump is done HERE in world space around the body's foot point (uDisPivot)
    // instead of writing obj.scale, so the characters module keeps full ownership of the
    // actor's root transform while it dissolves.
    sh.vertexShader = sh.vertexShader
      .replace(
        "#include <common>",
        "#include <common>\nvarying vec3 vDisPos; uniform vec3 uDisPivot; uniform vec3 uDisSquash;",
      )
      .replace(
        "#include <project_vertex>",
        `#include <project_vertex>
        vec4 disW = modelMatrix * vec4(transformed, 1.0);
        #ifdef USE_INSTANCING
          disW = modelMatrix * instanceMatrix * vec4(transformed, 1.0);
        #endif
        vDisPos = disW.xyz;
        disW.xyz = uDisPivot + (disW.xyz - uDisPivot) * uDisSquash;
        mvPosition = viewMatrix * disW;
        gl_Position = projectionMatrix * mvPosition;`,
      );
    sh.fragmentShader = sh.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
        varying vec3 vDisPos; uniform float uDisProg; uniform vec3 uDisEdge; uniform float uDisChar; uniform vec3 uDisTint; uniform sampler2D uNoise;
        float disN(vec3 x){ vec3 p = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f); vec2 uv = (p.xy + vec2(37.0, 17.0) * p.z) + f.xy; vec2 rg = texture2D(uNoise, (uv + 0.5) / 256.0).yx; return mix(rg.x, rg.y, f.z); }
        float disF(vec3 p){ return disN(p) * 0.55 + disN(p * 2.1 + 7.3) * 0.3 + disN(p * 4.3 + 1.7) * 0.15; }`,
      )
      .replace(
        "#include <clipping_planes_fragment>",
        `#include <clipping_planes_fragment>
        float disV = disF(vDisPos * 3.2);
        float disT = uDisProg * 1.15 - 0.05;
        if (disV < disT) discard;
        float disEdge = 1.0 - smoothstep(0.0, 0.09, disV - disT);`,
      )
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
        diffuseColor.rgb = mix(diffuseColor.rgb, uDisTint, uDisChar);`,
      )
      .replace(
        "#include <dithering_fragment>",
        `#include <dithering_fragment>
        gl_FragColor.rgb += uDisEdge * disEdge * (0.6 + 0.4 * disN(vDisPos * 9.0)) * step(0.001, uDisProg);
        gl_FragColor.rgb += uDisEdge * 0.08 * uDisChar;`,
      );
  };

  function dissolveMaterial(orig, uni) {
    const m = orig.clone();
    m.userData = Object.assign({}, orig.userData, {
      dissolve: uni,
      shared: false,
    });
    m.onBeforeCompile = onBC;
    m.customProgramCacheKey = () =>
      "atmos_dissolve_" +
      orig.type +
      (orig.vertexColors ? "_vc" : "") +
      (orig.map ? "_m" : "");
    m.transparent = false;
    return m;
  }

  /** Build a pile mesh (ash or goo). */
  function makePile(kind, pos, width) {
    const grp = new THREE.Group();
    grp.name = "atmos_" + kind + "_pile";
    const w = Math.max(0.35, Math.min(1.4, width));
    if (kind === "ash") {
      const geo = new THREE.ConeGeometry(w * 0.6, w * 0.42, 14, 4);
      const pos3 = geo.attributes.position,
        col = [];
      for (let i = 0; i < pos3.count; i++) {
        const x = pos3.getX(i),
          y = pos3.getY(i),
          z = pos3.getZ(i);
        const n = G.util.fbm2(x * 6 + 3, z * 6 + 1, 3);
        const k = 0.75 + n * 0.5;
        pos3.setXYZ(i, x * k, Math.max(-w * 0.21, y * (0.8 + n * 0.5)), z * k);
        const t = (y + w * 0.21) / (w * 0.42);
        const g = 0.06 + t * 0.18 + n * 0.06;
        col.push(g, g * 0.97, g * 0.94);
      }
      geo.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
      geo.computeVertexNormals();
      const mat = new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 1,
        metalness: 0,
        emissive: new THREE.Color(0xff4a10),
        emissiveIntensity: 0.0,
        emissiveMap: null,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.y = w * 0.17;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      grp.add(mesh);
      // a few bone-ish fragments
      const bmat = new THREE.MeshStandardMaterial({
        color: 0x8a8274,
        roughness: 0.9,
      });
      for (let i = 0; i < 3; i++) {
        const b = new THREE.Mesh(
          new THREE.CylinderGeometry(0.018, 0.022, rr(0.12, 0.25), 5),
          bmat,
        );
        const a = rr(0, 6.28);
        b.position.set(Math.cos(a) * w * 0.45, 0.04, Math.sin(a) * w * 0.45);
        b.rotation.set(Math.PI / 2, 0, a + rr(-0.5, 0.5));
        grp.add(b);
      }
      grp.userData.emissiveMat = mat;
    } else {
      const geo = new THREE.SphereGeometry(
        w * 0.62,
        20,
        10,
        0,
        Math.PI * 2,
        0,
        Math.PI / 2,
      );
      const pos3 = geo.attributes.position;
      for (let i = 0; i < pos3.count; i++) {
        const x = pos3.getX(i),
          y = pos3.getY(i),
          z = pos3.getZ(i);
        const n = G.util.fbm2(x * 4 + 5, z * 4 + 9, 3);
        const k = 0.7 + n * 0.6;
        pos3.setXYZ(i, x * k, y * 0.22 * (0.6 + n), z * k);
      }
      geo.computeVertexNormals();
      const mat = new THREE.MeshStandardMaterial({
        color: 0x2c6a12,
        roughness: 0.12,
        metalness: 0.2,
        emissive: new THREE.Color(0x3aff1a),
        emissiveIntensity: 0.3,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.receiveShadow = true;
      grp.add(mesh);
      // bubbles
      const bmat = new THREE.MeshStandardMaterial({
        color: 0x6ad83a,
        roughness: 0.1,
        emissive: new THREE.Color(0x4aff2a),
        emissiveIntensity: 1.2,
      });
      for (let i = 0; i < 5; i++) {
        const b = new THREE.Mesh(
          new THREE.SphereGeometry(rr(0.03, 0.07), 8, 6),
          bmat,
        );
        const a = rr(0, 6.28),
          r = rr(0, w * 0.4);
        b.position.set(Math.cos(a) * r, w * 0.08, Math.sin(a) * r);
        grp.add(b);
      }
      grp.userData.emissiveMat = mat;
    }
    grp.position.copy(pos);
    grp.rotation.y = rr(0, 6.28);
    G.scene.add(grp);
    const glow = FX.glowSprite
      ? FX.glowSprite(
          new THREE.Vector3(pos.x, pos.y + 0.25, pos.z),
          kind === "ash" ? 0xff5a18 : 0x5aff2a,
          w * (kind === "ash" ? 1.1 : 1.5),
          {
            intensity: kind === "ash" ? 0.55 : 0.45,
            dayFactor: 0.3,
            flicker: kind === "ash" ? 0.5 : 0.15,
          },
        )
      : null;
    const pile = { grp, kind, t: 0, glow, pos: pos.clone(), w, emitT: 0 };
    piles.push(pile);
    while (piles.length > MAX_PILES) disposePile(piles.shift());
    return pile;
  }
  function disposePile(p) {
    if (p.glow) p.glow.dispose();
    G.util.disposeObject(p.grp);
  }

  function start(obj, kind, opts) {
    opts = opts || {};
    if (!obj || !obj.isObject3D) return null;
    if (obj.userData && obj.userData._disintegrating) return null;
    obj.updateMatrixWorld(true);
    _box.setFromObject(obj);
    if (_box.isEmpty()) return null;
    _box.getCenter(_c);
    _box.getSize(_sz);
    obj.userData._disintegrating = kind;
    const uni = {
      prog: { value: 0 },
      edge: {
        value:
          kind === "ash"
            ? new THREE.Color(4.0, 1.1, 0.25)
            : new THREE.Color(0.8, 4.2, 0.4),
      },
      char: { value: 0 },
      tint: {
        value:
          kind === "ash"
            ? new THREE.Color(0.03, 0.028, 0.025)
            : new THREE.Color(0.18, 0.55, 0.08),
      },
      pivot: { value: new THREE.Vector3(_c.x, _box.min.y, _c.z) },
      squash: { value: new THREE.Vector3(1, 1, 1) },
    };
    const swaps = [];
    const cache = new Map();
    obj.traverse((o) => {
      if (!o.isMesh || !o.material) return;
      const orig = o.material;
      const mk = (m) => {
        if (!m || m.isShaderMaterial || m.isRawShaderMaterial) return m;
        if (!cache.has(m)) cache.set(m, dissolveMaterial(m, uni));
        return cache.get(m);
      };
      swaps.push({
        o,
        orig,
        dis: Array.isArray(orig) ? orig.map(mk) : mk(orig),
        cast: o.castShadow,
      });
    });
    const job = {
      obj,
      kind,
      uni,
      swaps,
      cache,
      t: 0,
      dur: opts.duration || (kind === "ash" ? 1.8 : 2.4),
      box: _box.clone(),
      center: _c.clone(),
      size: _sz.clone(),
      emitT: 0,
      resolve: null,
      shadowOff: false,
      ready: false,
      wait: 0,
    };
    job.done = new Promise((res) => {
      job.resolve = res;
    });
    obj.getWorldPosition(_p);
    job.pivotOff = new THREE.Vector3(_c.x - _p.x, 0, _c.z - _p.z);
    jobs.push(job);
    // Compile the dissolve programs in parallel BEFORE swapping them in (no stall on the
    // kill frame). The body keeps its normal materials for the few frames this takes; the
    // flash/sparks below cover it. Falls back to a plain swap after 0.35 s or on old three.
    const swapIn = () => {
      if (job.ready || job.dead) return;
      job.ready = true;
      for (const sw of swaps) sw.o.material = sw.dis;
    };
    let asyncOk = false;
    if (typeof G.renderer.compileAsync === "function") {
      try {
        for (const sw of swaps) sw.o.material = sw.dis; // expose the dissolve materials to compileAsync's traversal
        const pr = A.compileFor(obj, true);
        for (const sw of swaps) sw.o.material = sw.orig; // …then put the originals back until ready
        asyncOk = true;
        pr.then(swapIn, swapIn);
      } catch (e) {
        for (const sw of swaps) sw.o.material = sw.orig;
        asyncOk = false;
      }
    }
    if (!asyncOk) swapIn();
    // initial flash
    const col = kind === "ash" ? 0xff6a20 : 0x6aff3a;
    FX.flash(job.center, col, 3, 0.5, { range: 10 });
    if (A.psAdd)
      A.psAdd.spawn({
        pos: job.center,
        size: Math.max(job.size.x, job.size.y) * 1.6,
        life: 0.35,
        color: col,
        intensity: 2,
        frame: FR.GLOW,
        fadeIn: 0.02,
      });
    return job;
  }

  function randomSurfacePoint(job, out) {
    const b = job.box;
    out.set(rr(b.min.x, b.max.x), rr(b.min.y, b.max.y), rr(b.min.z, b.max.z));
    // pull toward the vertical axis (bodies are thinner than their bbox)
    out.x = job.center.x + (out.x - job.center.x) * 0.55;
    out.z = job.center.z + (out.z - job.center.z) * 0.55;
    return out;
  }

