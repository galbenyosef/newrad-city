// play-inline-170 08 — three
// Lines 1972-2250 of readable/play-inline-170.pretty.js (statement-aligned).
  let glowTex = null;
  function getGlowTex() {
    if (glowTex) return glowTex;
    const c = K.canvas(64, 64),
      x = c.getContext("2d");
    const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.18, "rgba(255,255,255,0.75)");
    g.addColorStop(0.45, "rgba(255,255,255,0.18)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    x.fillStyle = g;
    x.fillRect(0, 0, 64, 64);
    glowTex = K.texFromCanvas(c, { clamp: true });
    return glowTex;
  }
  K.glowTex = getGlowTex;
  const glowMats = [];
  /** Glow set: add(x,y,z,color,sizeClass 's'|'m'|'l'|'xl'); finish(parent,{nightOnly, lod}) */
  K.glowSet = function (name) {
    const sets = {
      s: { p: [], c: [], size: 0.9 },
      m: { p: [], c: [], size: 2.4 },
      l: { p: [], c: [], size: 6 },
      xl: { p: [], c: [], size: 14 },
    };
    return {
      add(x, y, z, color, cls) {
        const s = sets[cls || "m"];
        s.p.push(x, y + (K.yOff || 0), z);
        _c.set(color === undefined ? 0xffd9a0 : color);
        s.c.push(_c.r, _c.g, _c.b);
        return this;
      },
      finish(parent, o) {
        o = o || {};
        const grp = new THREE.Group();
        grp.name = "pmid_glow_" + name;
        for (const k in sets) {
          const s = sets[k];
          if (!s.p.length) continue;
          const g = new THREE.BufferGeometry();
          g.setAttribute("position", new THREE.Float32BufferAttribute(s.p, 3));
          g.setAttribute("color", new THREE.Float32BufferAttribute(s.c, 3));
          g.computeBoundingSphere();
          const m = new THREE.PointsMaterial({
            size: s.size * (o.scale || 1),
            map: getGlowTex(),
            vertexColors: true,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true,
            fog: false,
            toneMapped: false,
            opacity: 1,
          });
          m.userData.shared = true;
          m.userData.dayOpacity =
            o.dayOpacity !== undefined ? o.dayOpacity : 0.35;
          m.userData.nightOpacity =
            o.nightOpacity !== undefined ? o.nightOpacity : 1;
          m.userData.flicker = o.flicker || 0;
          m.userData.interior = !!o.interior;
          // Distance fade (additive points ignore fog): beacons/crown lights opt out with {beacon:true}.
          // Every set also gets:
          //  * a camera PULL — the sprite is drawn up to 1.2 m (0.3 × its size) nearer the camera than its
          //    source, so lamp housings / sign arms / poles around the source no longer slice dark bars
          //    through the halo (the size is still computed from the true depth);
          //  * a pixel CAP (≤ 26 % of the viewport height) so a big halo never becomes a hovering sphere;
          //  * a NEAR fade — a halo dissolves as the camera walks into it.
          const fade = o.beacon
            ? [1e6, 2e6]
            : o.fade || (o.interior ? [90, 260] : [320, 780]);
          const maxFrac = o.maxFrac || (o.beacon ? 0.2 : 0.26);
          m.onBeforeCompile = function (sh) {
            sh.uniforms.uGlowFade = {
              value: new THREE.Vector2(fade[0], fade[1]),
            };
            sh.uniforms.uGlowMax = { value: maxFrac };
            sh.vertexShader =
              "uniform vec2 uGlowFade;\nuniform float uGlowMax;\nvarying float vGlowFade;\n" +
              sh.vertexShader.replace(
                "#include <fog_vertex>",
                "#include <fog_vertex>\n" +
                  "  float gDist = max(length(mvPosition.xyz), 1e-3);\n" +
                  "  vGlowFade = (1.0 - smoothstep(uGlowFade.x, uGlowFade.y, -mvPosition.z)) * smoothstep(size * 0.2, size * 0.85, gDist);\n" +
                  "  float gPull = min(min(size * 0.3, 1.2), gDist * 0.5);\n" +
                  "  gl_Position = projectionMatrix * vec4(mvPosition.xyz * ((gDist - gPull) / gDist), 1.0);\n" +
                  "  gl_PointSize = min(gl_PointSize, scale * 2.0 * uGlowMax);",
              );
            sh.fragmentShader =
              "varying float vGlowFade;\n" +
              sh.fragmentShader.replace(
                "#include <premultiplied_alpha_fragment>",
                "#include <premultiplied_alpha_fragment>\n  gl_FragColor *= vGlowFade;",
              );
          };
          m.customProgramCacheKey = function () {
            return "pmid_glowfade2";
          };
          glowMats.push(m);
          const pts = new THREE.Points(g, m);
          pts.name = "pmid_glow_" + name + "_" + k;
          pts.frustumCulled = true;
          pts.matrixAutoUpdate = false;
          pts.updateMatrix();
          grp.add(pts);
        }
        (parent || G.scene).add(grp);
        // Default LOD: street/interior glow sets are hidden entirely once fully faded; beacons never.
        const lod =
          o.lod !== undefined ? o.lod : o.beacon ? 0 : o.interior ? 300 : 820;
        if (lod) {
          const bb = new THREE.Box3().setFromObject(grp);
          if (!bb.isEmpty())
            G.world.addLOD(grp, lod, bb.getCenter(new THREE.Vector3()));
        }
        return grp;
      },
    };
  };
  // ------------------------------------------------------------------
  // Light spill on the ground ("pools" of neon / lamp light) and view-dependent wet reflections.
  // No dynamic lights (CONTRACT: ≤ 6 in the whole game) — both are additive decals, one draw call per set.
  // ------------------------------------------------------------------
  let spillTex = null,
    puddleTex = null;
  function getSpillTex() {
    if (spillTex) return spillTex;
    const S = 128,
      c = K.canvas(S, S),
      x = c.getContext("2d");
    const g = x.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.25, "rgba(255,255,255,0.62)");
    g.addColorStop(0.55, "rgba(255,255,255,0.2)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    x.fillStyle = g;
    x.fillRect(0, 0, S, S);
    spillTex = K.texFromCanvas(c, { clamp: true });
    return spillTex;
  }
  /** Tileable wet/dry mask (world-space, 8 m repeat): bright = puddle, dark = dry asphalt. */
  function getPuddleTex() {
    if (puddleTex) return puddleTex;
    const S = 256,
      c = K.canvas(S, S),
      x = c.getContext("2d"),
      r = K.rng(4711);
    x.fillStyle = "rgb(70,70,70)";
    x.fillRect(0, 0, S, S);
    for (let i = 0; i < 70; i++) {
      const px = r() * S,
        py = r() * S,
        rad = 8 + r() * 46,
        a = 0.25 + r() * 0.55;
      for (const ox of [-S, 0, S])
        for (const oy of [-S, 0, S]) {
          const g = x.createRadialGradient(
            px + ox,
            py + oy,
            0,
            px + ox,
            py + oy,
            rad,
          );
          g.addColorStop(0, "rgba(255,255,255," + a + ")");
          g.addColorStop(0.7, "rgba(255,255,255," + a * 0.6 + ")");
          g.addColorStop(1, "rgba(255,255,255,0)");
          x.fillStyle = g;
          x.fillRect(px + ox - rad, py + oy - rad, rad * 2, rad * 2);
        }
    }
    // cracks / tar seams catch the light as thin bright lines
    x.strokeStyle = "rgba(255,255,255,0.35)";
    x.lineWidth = 1.2;
    for (let i = 0; i < 26; i++) {
      x.beginPath();
      let px = r() * S,
        py = r() * S;
      x.moveTo(px, py);
      for (let k = 0; k < 6; k++) {
        px += (r() - 0.5) * 40;
        py += (r() - 0.5) * 40;
        x.lineTo(px, py);
      }
      x.stroke();
    }
    puddleTex = K.texFromCanvas(c, { linear: true });
    puddleTex.wrapS = puddleTex.wrapT = THREE.RepeatWrapping;
    return puddleTex;
  }
  const spillMats = []; // {mat, day, night, interior}
  /**
   * Ground light pools: add(x, z, color, radius, opts{y, sx, sz (ellipse radii), yaw, i (intensity)}).
   * finish(parent, {day=0.08, night=1, interior=false, lod}) → Mesh (one draw call).
   */
  K.spillSet = function (name) {
    const p = [],
      c = [],
      uv = [],
      idx = [];
    let n = 0;
    return {
      add(x, z, color, radius, o) {
        o = o || {};
        const y = o.y !== undefined ? o.y : 0.05,
          rx = o.sx || radius,
          rz = o.sz || radius,
          yaw = o.yaw || 0,
          it = o.i === undefined ? 1 : o.i;
        const cs = Math.cos(yaw),
          sn = Math.sin(yaw);
        _c.set(color === undefined ? 0xffd9a0 : color);
        const corners = [
          [-1, 1],
          [1, 1],
          [1, -1],
          [-1, -1],
        ];
        for (const k of corners) {
          const lx = k[0] * rx,
            lz = k[1] * rz;
          p.push(x + lx * cs + lz * sn, y, z - lx * sn + lz * cs);
          c.push(_c.r * it, _c.g * it, _c.b * it);
          uv.push((k[0] + 1) / 2, (k[1] + 1) / 2);
        }
        idx.push(n, n + 1, n + 2, n, n + 2, n + 3);
        n += 4;
        return this;
      },
      finish(parent, o) {
        o = o || {};
        if (!n) return null;
        const g = new THREE.BufferGeometry();
        g.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
        g.setAttribute("color", new THREE.Float32BufferAttribute(c, 3));
        g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
        g.setIndex(idx);
        g.computeBoundingSphere();
        const m = new THREE.MeshBasicMaterial({
          map: getSpillTex(),
          vertexColors: true,
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          toneMapped: true,
          fog: true,
          side: THREE.DoubleSide,
          polygonOffset: true,
          polygonOffsetFactor: -2,
          polygonOffsetUnits: -2,
        });
        m.userData.shared = true;
        spillMats.push({
          mat: m,
          day: o.day !== undefined ? o.day : 0.08,
          night: o.night !== undefined ? o.night : 1,
          interior: !!o.interior,
        });
        const mesh = new THREE.Mesh(g, m);
        mesh.name = "pmid_spill_" + name;
        mesh.renderOrder = 2;
        mesh.matrixAutoUpdate = false;
        mesh.updateMatrix();
        (parent || G.scene).add(mesh);
        const lod = o.lod !== undefined ? o.lod : o.interior ? 0 : 360;
        if (lod) G.world.addLOD(mesh, lod, g.boundingSphere.center.clone());
        return mesh;
      },
    };
  };
  /**
   * View-dependent wet reflections: add(x, z, h, color, width, opts{len, i, y}) — a light at height h above the
   * ground point (x,z) is mirrored as a streak that always runs from the light's foot TOWARD the camera (like a
   * real reflection on wet asphalt / polished stone), broken up by a world-space puddle mask.
   * finish(parent, {day, night, interior, wet (0 = polished floor, 1 = puddled street)}) → Mesh.
   */
  const reflMats = [];
