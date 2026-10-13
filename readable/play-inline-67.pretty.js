/* src/atmosphere/60_fx_disintegrate.js */
/* =====================================================================
 * ATMOSPHERE / FX — energy-weapon disintegration (iconic!)
 *   G.fx.ash(obj3d)  — laser crit kill: body chars black from glowing
 *                      orange cracks, crumbles into flakes & embers,
 *                      leaves a smouldering ASH PILE.
 *   G.fx.goo(obj3d)  — plasma crit kill: body glows radioactive green,
 *                      melts & slumps, dripping, leaving a bubbling
 *                      GREEN GOO PUDDLE.
 * Works on any Object3D (character rigs, props): per-mesh cloned
 * materials get a noise-threshold dissolve with a hot edge
 * (onBeforeCompile, one shared program per material type). The original
 * materials are restored after the object is hidden. Emits
 * `disintegrated(obj3d, kind, pilePos)` so combat/rpg can put the
 * corpse's loot on the pile.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G,
    THREE = window.THREE;
  if (!G || !G.atmos || !G.atmos._) return;
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

  function finish(job) {
    const gy = A.groundAt(job.center.x, job.center.z, job.box.min.y + 0.6);
    job.obj.visible = false;
    for (const s of job.swaps) {
      s.o.material = s.orig;
      s.o.castShadow = s.cast;
    }
    for (const m of job.cache.values()) if (m && m.dispose) m.dispose();
    job.obj.userData._disintegrating = null;
    job.obj.userData.disintegrated = job.kind;
    const w = Math.max(job.size.x, job.size.z, job.size.y * 0.45);
    const pile = makePile(
      job.kind,
      new THREE.Vector3(job.center.x, gy, job.center.z),
      w,
    );
    job.pile = pile;
    FX.decal(
      new THREE.Vector3(job.center.x, gy, job.center.z),
      new THREE.Vector3(0, 1, 0),
      job.kind === "ash" ? "scorch_small" : "goo",
      { size: w * 1.6 },
    );
    G.events.emit("disintegrated", job.obj, job.kind, pile.pos);
    job.resolve(pile);
  }

  function update(dt) {
    if (dt <= 0) return;
    for (let i = jobs.length - 1; i >= 0; i--) {
      const j = jobs[i];
      if (!j.ready) {
        j.wait += dt;
        if (j.wait < 0.35) continue; // programs still compiling in parallel
        j.ready = true;
        for (const sw of j.swaps) sw.o.material = sw.dis;
      }
      j.t += dt;
      const u = Math.min(1, j.t / j.dur);
      // char/tint ramps in fast, dissolve follows
      j.uni.char.value = Math.min(1, u * 2.2);
      j.uni.prog.value = Math.max(0, (u - 0.18) / 0.82);
      // the body keeps following its actor (ragdoll / death anim): track the foot point
      if (j.obj.parent) {
        j.obj.updateWorldMatrix(true, false);
        j.obj.getWorldPosition(_p);
        j.uni.pivot.value.set(
          _p.x + j.pivotOff.x,
          j.uni.pivot.value.y,
          _p.z + j.pivotOff.z,
        );
      }
      if (j.kind === "goo") {
        const m = Math.max(0, (u - 0.2) / 0.8);
        const e = m * m * (3 - 2 * m);
        j.uni.squash.value.set(1 + e * 0.35, 1 - e * 0.78, 1 + e * 0.35);
      } else {
        const m = Math.max(0, (u - 0.5) / 0.5);
        j.uni.squash.value.set(1 + m * 0.06, 1 - m * 0.28, 1 + m * 0.06);
      }
      // the shadow pass doesn't dissolve: drop the body's shadow once it is mostly gone
      if (!j.shadowOff && u > 0.45) {
        j.shadowOff = true;
        for (const sw of j.swaps) sw.o.castShadow = false;
      }
      // particles
      j.emitT -= dt;
      if (j.emitT <= 0 && A.psAdd) {
        j.emitT = 0.016;
        for (let k = 0; k < 3; k++) {
          randomSurfacePoint(j, _p);
          if (j.kind === "ash") {
            A.psAlpha.spawn({
              pos: _p,
              vx: rr(-0.4, 0.4),
              vy: rr(0.3, 1.4),
              vz: rr(-0.4, 0.4),
              size: rr(0.03, 0.08),
              life: rr(1.5, 3),
              color: 0x1a1816,
              frame: FR.FLAKE,
              rotv: rr(-6, 6),
              drag: 1.2,
              wind: 0.9,
              grav: 0.05,
              lit: 1,
            });
            A.psAdd.spawn({
              pos: _p,
              vx: rr(-0.5, 0.5),
              vy: rr(0.5, 2),
              vz: rr(-0.5, 0.5),
              size: rr(0.025, 0.05),
              life: rr(0.6, 1.6),
              color: 0xff7a20,
              intensity: 5,
              frame: FR.GLOW,
              drag: 1,
              wind: 0.7,
              flicker: true,
            });
            if (Math.random() < 0.25)
              A.psAlpha.spawn({
                pos: _p,
                vy: rr(0.6, 1.2),
                size: 0.2,
                size1: rr(0.8, 1.4),
                life: rr(1.5, 2.5),
                color: 0x2a2624,
                alpha: 0.35,
                frame: FR.SMOKE3,
                wind: 0.6,
                drag: 0.8,
                rotv: rr(-1, 1),
              });
          } else {
            A.psAdd.spawn({
              pos: _p,
              vx: rr(-0.3, 0.3),
              vy: rr(-0.5, 0.3),
              vz: rr(-0.3, 0.3),
              size: rr(0.04, 0.09),
              life: rr(0.6, 1.2),
              color: 0x6aff3a,
              intensity: 3,
              frame: FR.DROP,
              grav: 0.8,
              stick: true,
              stretch: 0.04,
            });
            if (Math.random() < 0.3)
              A.psAdd.spawn({
                pos: _p,
                vy: rr(0.2, 0.8),
                size: rr(0.1, 0.25),
                size1: 0.02,
                life: rr(0.4, 0.9),
                color: 0x9aff6a,
                intensity: 2,
                frame: FR.GLOW,
                drag: 2,
              });
            if (Math.random() < 0.15)
              A.psAlpha.spawn({
                pos: _p,
                vy: rr(0.3, 0.8),
                size: 0.2,
                size1: rr(0.7, 1.2),
                life: rr(1, 2),
                color: 0x5a8a3a,
                alpha: 0.3,
                frame: FR.DUST,
                wind: 0.5,
                drag: 1,
              });
          }
        }
      }
      if (u >= 1) {
        jobs.splice(i, 1);
        finish(j);
      }
    }
    // piles: cool embers, bubble goo, smoke wisps
    for (let i = piles.length - 1; i >= 0; i--) {
      const p = piles[i];
      p.t += dt;
      const em = p.grp.userData.emissiveMat;
      if (p.kind === "ash") {
        if (em)
          em.emissiveIntensity =
            Math.max(0, 0.12 * (1 - p.t / 25)) *
            (0.7 + 0.3 * Math.sin(p.t * 5));
        if (p.glow) p.glow.glowIntensity = Math.max(0, 0.55 * (1 - p.t / 30));
        p.emitT -= dt;
        if (p.t < 20 && p.emitT <= 0 && A.psAlpha && A.camDist(p.pos) < 60) {
          p.emitT = 0.35;
          A.psAlpha.spawn({
            x: p.pos.x + rr(-0.2, 0.2),
            y: p.pos.y + 0.25,
            z: p.pos.z + rr(-0.2, 0.2),
            vy: rr(0.3, 0.7),
            size: 0.1,
            size1: rr(0.6, 1.1),
            life: rr(2, 3.5),
            color: 0x3a3634,
            alpha: 0.25 * (1 - p.t / 20),
            frame: FR.SMOKE3,
            wind: 0.5,
            drag: 0.4,
            rotv: rr(-0.5, 0.5),
          });
          if (Math.random() < 0.4)
            A.psAdd.spawn({
              x: p.pos.x + rr(-0.2, 0.2),
              y: p.pos.y + 0.2,
              z: p.pos.z + rr(-0.2, 0.2),
              vy: rr(0.5, 1.2),
              size: 0.03,
              life: rr(0.8, 1.6),
              color: 0xff7a20,
              intensity: 4,
              frame: FR.GLOW,
              wind: 0.7,
              flicker: true,
            });
        }
      } else {
        if (em)
          em.emissiveIntensity =
            0.18 +
            0.08 * Math.sin(p.t * 2.3) +
            0.25 * Math.max(0, 1 - p.t / 20);
        p.emitT -= dt;
        if (p.emitT <= 0 && A.psAdd && A.camDist(p.pos) < 40) {
          p.emitT = rr(0.25, 0.7);
          const a = rr(0, 6.28),
            r = rr(0, p.w * 0.35);
          A.psAdd.spawn({
            x: p.pos.x + Math.cos(a) * r,
            y: p.pos.y + 0.06,
            z: p.pos.z + Math.sin(a) * r,
            vy: 0.05,
            size: 0.02,
            size1: rr(0.07, 0.14),
            life: rr(0.5, 1.1),
            color: 0x9aff6a,
            intensity: 1.6,
            frame: FR.RING,
            fadeIn: 0.3,
            fadeOut: 0.8,
          });
        }
      }
    }
  }
  function reset() {
    // unfinished jobs: restore the body and settle their promises (null = no pile) so nobody
    // awaiting `.done` (combat's loot placement) hangs forever
    for (const j of jobs) {
      j.dead = true;
      for (const s of j.swaps) {
        s.o.material = s.orig;
        s.o.castShadow = s.cast;
      }
      for (const m of j.cache.values()) if (m && m.dispose) m.dispose();
      j.obj.userData._disintegrating = null;
      try {
        if (j.resolve) j.resolve(null);
      } catch (e) {
        /* ignore */
      }
    }
    jobs.length = 0;
    for (const p of piles) disposePile(p);
    piles.length = 0;
  }

  /** Laser disintegration → ash pile. Returns {done: Promise<pile>} or null. opts: {duration} */
  FX.ash = function (obj3d, opts) {
    return start(obj3d, "ash", opts);
  };
  /** Plasma disintegration → glowing goo puddle. Returns {done: Promise<pile>} or null. opts: {duration} */
  FX.goo = function (obj3d, opts) {
    return start(obj3d, "goo", opts);
  };
  FX.disintegrate = function (obj3d, kind, opts) {
    return start(
      obj3d,
      kind === "goo" || kind === "plasma" ? "goo" : "ash",
      opts,
    );
  };
  FX.piles = () => piles.map((p) => ({ kind: p.kind, pos: p.pos.clone() }));

  // ------------------------------------------------------------------
  // Prewarm pile programs (ash pile + bones + goo + bubbles) so the first
  // pile doesn't compile mid-fight; persist piles across save/load.
  // ------------------------------------------------------------------
  function init() {
    A.onPrewarm(() => {
      const g = new THREE.BoxGeometry(0.1, 0.1, 0.1);
      g.setAttribute(
        "color",
        new THREE.Float32BufferAttribute(
          new Array(g.attributes.position.count * 3).fill(0.2),
          3,
        ),
      );
      g.userData.prewarmTemp = true;
      const mk = (m) => {
        const me = new THREE.Mesh(g, m);
        me.castShadow = true;
        me.receiveShadow = true;
        return me;
      };
      return [
        mk(
          new THREE.MeshStandardMaterial({
            vertexColors: true,
            roughness: 1,
            metalness: 0,
            emissive: new THREE.Color(0xff4a10),
            emissiveIntensity: 0.0,
          }),
        ),
        mk(new THREE.MeshStandardMaterial({ color: 0x8a8274, roughness: 0.9 })),
        mk(
          new THREE.MeshStandardMaterial({
            color: 0x2c6a12,
            roughness: 0.12,
            metalness: 0.2,
            emissive: new THREE.Color(0x3aff1a),
            emissiveIntensity: 0.3,
          }),
        ),
      ];
    });
    if (G.save && G.save.register) {
      G.save.register("atmos_piles", {
        save: () =>
          piles.map((p) => ({
            k: p.kind,
            x: +p.pos.x.toFixed(2),
            y: +p.pos.y.toFixed(2),
            z: +p.pos.z.toFixed(2),
            w: +p.w.toFixed(2),
          })),
        load: (d) => {
          if (!Array.isArray(d)) return;
          for (const e of d.slice(-MAX_PILES)) {
            if (
              !e ||
              (e.k !== "ash" && e.k !== "goo") ||
              !isFinite(e.x) ||
              !isFinite(e.z)
            )
              continue;
            const p = makePile(
              e.k,
              new THREE.Vector3(e.x, e.y || 0, e.z),
              e.w || 0.8,
            );
            p.t = 40; // long cooled
            if (p.glow)
              p.glow.glowIntensity = e.k === "ash" ? 0 : p.glow.glowIntensity;
          }
        },
      });
    }
  }

  A.addSystem({ name: "disintegrate", order: 66, init, update, reset });
})();
