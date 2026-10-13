// play-inline-106 07 — the
// Lines 1687-1996 of readable/play-inline-106.pretty.js (statement-aligned).
  Atlas.prototype.alloc = function (key, w, h, draw) {
    if (key && this.slots[key]) return this.slots[key];
    const pad = 3;
    w = Math.ceil(w);
    h = Math.ceil(h);
    const W = w + pad,
      Hh = h + pad;
    let bestY = Infinity,
      bestX = 0,
      bestI = -1;
    for (let i = 0; i < this.sky.length; i++) {
      const x = this.sky[i].x;
      if (x + W > this.W) break;
      let y = 0,
        span = 0,
        j = i;
      while (span < W && j < this.sky.length) {
        y = Math.max(y, this.sky[j].y);
        span += this.sky[j].w;
        j++;
      }
      if (span < W || y + Hh > this.H) continue;
      if (y < bestY) {
        bestY = y;
        bestX = x;
        bestI = i;
      }
    }
    if (bestI < 0) {
      if (!this.quiet)
        console.warn(
          "[landmarks_a] atlas " +
            this.name +
            " full: " +
            key +
            " " +
            w +
            "x" +
            h,
        );
      return { x: 0, y: 0, w, h, rect: [0, 0, 0.001, 0.001], full: true };
    }
    // update skyline
    const node = { x: bestX, y: bestY + Hh, w: W };
    const out = [];
    for (const n of this.sky) {
      const n0 = n.x,
        n1 = n.x + n.w,
        c0 = bestX,
        c1 = bestX + W;
      if (n1 <= c0 || n0 >= c1) {
        out.push(n);
        continue;
      }
      if (n0 < c0) out.push({ x: n0, y: n.y, w: c0 - n0 });
      if (n0 >= c0 && out.indexOf(node) < 0) out.push(node);
      else if (n0 < c0 && out.indexOf(node) < 0) out.push(node);
      if (n1 > c1) out.push({ x: c1, y: n.y, w: n1 - c1 });
    }
    out.sort((a2, b2) => a2.x - b2.x);
    const merged = [];
    for (const n of out) {
      const l = merged[merged.length - 1];
      if (l && l.y === n.y && l.x + l.w === n.x) l.w += n.w;
      else merged.push({ x: n.x, y: n.y, w: n.w });
    }
    this.sky = merged;
    const s = { x: bestX, y: bestY, w, h };
    const e = 1.5;
    s.rect = [
      (s.x + e) / this.W,
      1 - (s.y + h - e) / this.H,
      (s.x + w - e) / this.W,
      1 - (s.y + e) / this.H,
    ];
    if (draw) {
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.rect(s.x, s.y, w, h);
      this.ctx.clip();
      this.ctx.translate(s.x, s.y);
      draw(this.ctx, w, h);
      this.ctx.restore();
    }
    if (key) this.slots[key] = s;
    this.used += w * h;
    this.tex.needsUpdate = true;
    return s;
  };
  K.Atlas = Atlas;
  K.atlases = {};
  K.atlas = function (name) {
    return K.atlases[name];
  };

  // ------------------------------------------------------------------
  // Glow points (fake lights) — one THREE.Points per size class
  // ------------------------------------------------------------------
  let glowTex = null;
  function getGlowTex() {
    if (glowTex) return glowTex;
    // Photographic bloom profile instead of a linear gradient (which read as a flat "bokeh disc" with a visible rim):
    // a tight hot core + a wide soft skirt, tapered smoothly to exactly 0 at the sprite edge.
    const S = 128,
      c = K.canvas(S, S),
      x = c.getContext("2d"),
      im = x.createImageData(S, S);
    for (let j = 0; j < S; j++)
      for (let i = 0; i < S; i++) {
        const dx = ((i + 0.5) / S) * 2 - 1,
          dy = ((j + 0.5) / S) * 2 - 1,
          r = Math.min(1, Math.sqrt(dx * dx + dy * dy));
        const taper = (1 - r * r) * (1 - r * r);
        const v = Math.min(
          1,
          (0.9 * Math.exp(-(r / 0.14) * (r / 0.14)) +
            0.38 * Math.exp(-(r / 0.42) * (r / 0.42)) +
            0.05 * (1 - r)) *
            taper,
        );
        const k = (j * S + i) * 4;
        im.data[k] = im.data[k + 1] = im.data[k + 2] = 255;
        im.data[k + 3] = Math.round(v * 255);
      }
    x.putImageData(im, 0, 0);
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
        s.p.push(x, y, z);
        _c.set(color === undefined ? 0xffd9a0 : color);
        s.c.push(_c.r, _c.g, _c.b);
        return this;
      },
      finish(parent, o) {
        o = o || {};
        const grp = new THREE.Group();
        grp.name = "lma_glow_" + name;
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
            return "lma_glowfade2";
          };
          glowMats.push(m);
          const pts = new THREE.Points(g, m);
          pts.name = "lma_glow_" + name + "_" + k;
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
        rds = 8 + r() * 46,
        a = 0.25 + r() * 0.55;
      for (const ox of [-S, 0, S])
        for (const oy of [-S, 0, S]) {
          const g = x.createRadialGradient(
            px + ox,
            py + oy,
            0,
            px + ox,
            py + oy,
            rds,
          );
          g.addColorStop(0, "rgba(255,255,255," + a + ")");
          g.addColorStop(0.7, "rgba(255,255,255," + a * 0.6 + ")");
          g.addColorStop(1, "rgba(255,255,255,0)");
          x.fillStyle = g;
          x.fillRect(px + ox - rds, py + oy - rds, rds * 2, rds * 2);
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
