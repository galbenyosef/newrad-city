// play-inline-78 06 — three
// Lines 1603-1941 of readable/play-inline-78.pretty.js (statement-aligned).
  M.mat = function (key) {
    if (matCache.has(key)) return matCache.get(key);
    const at = key.indexOf("@");
    const src = at >= 0 ? key.slice(0, at) : key;
    const variants = at >= 0 ? key.slice(at + 1).split(",") : [];
    let base = null;
    const mats = G.isStub("mats") ? null : G.mats;
    const tex = G.isStub("tex") ? null : G.tex;
    let transparent = false,
      emissive = false;
    try {
      if (src.startsWith("facade/")) {
        const parts = src.split("/");
        if (mats && mats.facade) {
          try {
            base = mats.facade(M.texFacadeStyle(parts[1]), +parts[2]);
          } catch (e1) {
            base = null;
          }
        }
        if (!isMat(base))
          base = new THREE.MeshStandardMaterial({
            map: fallbackFacade(parts[1], +parts[2]),
            roughness: 0.92,
          });
      } else if (src.startsWith("bb/")) {
        const brand = src.slice(3);
        if (mats && mats.billboard) {
          try {
            base = mats.billboard(brand);
          } catch (e1) {
            base = null;
          }
        }
        if (!isMat(base))
          base = new THREE.MeshStandardMaterial({
            map: fallbackBillboard(brand),
            roughness: 0.8,
            emissive: 0x111111,
          });
      } else if (src.startsWith("decal/")) {
        let t = null;
        if (tex && tex.decal) t = tex.decal(src.slice(6));
        if (t && t.isTexture)
          base = new THREE.MeshStandardMaterial({
            map: t,
            transparent: true,
            depthWrite: false,
            roughness: 0.95,
          });
        else base = null;
        transparent = true;
      } else if (src.startsWith("my/")) {
        base = M.atlasMaterial(src.slice(3));
        transparent = !!base && base.transparent;
      } else if (src.startsWith("c/")) {
        base = new THREE.MeshStandardMaterial({
          color: parseInt(src.slice(2), 16),
          roughness: 0.85,
        });
      } else {
        if (mats && mats.get) {
          // the textures module may fail while building optional normal maps → retry without them
          try {
            base = mats.get(src);
          } catch (e1) {
            try {
              base = mats.get(src, { normal: false });
            } catch (e2) {
              base = null;
            }
          }
        }
        if (!isMat(base)) {
          if (FALLBACK_COLOR[src] !== undefined) {
            const col = FALLBACK_COLOR[src];
            base = new THREE.MeshStandardMaterial({
              color: col,
              roughness: src === "chrome" ? 0.3 : 0.6,
              metalness: src === "chrome" ? 0.8 : 0.1,
            });
            if (/neon|emissive/.test(src)) {
              base.emissive = new THREE.Color(col);
              base.emissiveIntensity = 1.2;
              emissive = true;
            }
          } else {
            base = new THREE.MeshStandardMaterial({
              map: fallbackTexture(src),
              roughness: src === "water" ? 0.2 : 0.92,
              metalness: /metal|rust|chrome/.test(src) ? 0.25 : 0,
            });
          }
        }
      }
    } catch (e) {
      G.reportError("map:mat:" + key, e);
      base = null;
    }
    if (!isMat(base))
      base = new THREE.MeshStandardMaterial({
        color: 0x777777,
        roughness: 0.9,
      });
    const m = base.clone();
    m.userData = Object.assign({}, base.userData, {
      shared: true,
      mapKey: key,
    });
    if (!emissive && !variants.includes("nocol")) m.vertexColors = true;
    // Brick: the textures module's 36-course tile is mapped over 2.7 m (TEX_SCALE) → 7.5 cm courses like real NYC
    // common brick. Its height-field normal map reads as shingles at grazing angles on big blank walls → soften it.
    if (/^brick_/.test(src) && m.normalMap) {
      m.normalScale = new THREE.Vector2(0.4, 0.4);
    }
    // Façades: a city dead for 22 years has no lit windows. The textures module's lit-window emissive map
    // (driven day→night through userData.txGlow) is kept only for '@lit' keys (blocks around friendly
    // settlements); everywhere else the emissive channel is removed (also saves a texture fetch).
    if (src.startsWith("facade/") && !variants.includes("lit")) {
      m.emissiveMap = null;
      m.emissive = new THREE.Color(0x000000);
      m.emissiveIntensity = 0;
      delete m.userData.txGlow;
    }
    for (const v of variants) {
      if (v === "base") {
        m.polygonOffset = true;
        m.polygonOffsetFactor = 3;
        m.polygonOffsetUnits = 6;
      } else if (v === "plate") {
        m.polygonOffset = true;
        m.polygonOffsetFactor = 1.5;
        m.polygonOffsetUnits = 3;
      } else if (v === "decal") {
        m.polygonOffset = true;
        m.polygonOffsetFactor = -2;
        m.polygonOffsetUnits = -4;
        m.transparent = true;
        m.depthWrite = false;
      } else if (v === "ds") m.side = THREE.DoubleSide;
      else if (v === "glow") {
        m.emissive = new THREE.Color(0xffffff);
        m.emissiveMap = m.map;
        m.emissiveIntensity = 0.9;
      } else if (v === "gloss") {
        m.roughness = 0.35;
        m.metalness = 0.2;
      } else if (v === "lamp") {
        m.emissive = new THREE.Color(0xffe2a0);
        m.emissiveIntensity = 1.4;
        m.vertexColors = false;
      } else if (v === "lampg") {
        m.emissive = new THREE.Color(0x70ff90);
        m.emissiveIntensity = 1.6;
        m.vertexColors = false;
        m.color = new THREE.Color(0x60e080);
        m.map = null;
      } else if (v === "lampr") {
        m.emissive = new THREE.Color(0xff3020);
        m.emissiveIntensity = 1.6;
        m.vertexColors = false;
        m.color = new THREE.Color(0xa02010);
        m.map = null;
      } else if (v === "lampw") {
        m.emissive = new THREE.Color(0xd8f0ff);
        m.emissiveIntensity = 1.3;
        m.vertexColors = false;
        m.color = new THREE.Color(0xe0f0ff);
        m.map = null;
      } else if (v === "dark") {
        m.color = new THREE.Color(0x555555);
      } else if (v === "fwd") {
        m.polygonOffset = true;
        m.polygonOffsetFactor = -1;
        m.polygonOffsetUnits = -2;
      }
      // grimy display glass you can see the dim shop through
      else if (v === "window") {
        m.transparent = true;
        m.opacity = 0.42;
        m.depthWrite = false;
        m.roughness = 0.18;
        m.metalness = 0.35;
      }
      // faint self-illumination by the surface's own texture (fake bounce light in dark interiors / tunnels)
      // far shores across the rivers: 30 % less haze, and never more than 70 % (1–3 km silhouettes keep ≥ 30 %
      // contrast against the haze) so the skyline doesn't dissolve into flat pale boxes (chains any existing compile hook)
      else if (v === "far") {
        const prevOBC = m.onBeforeCompile,
          prevKey = m.customProgramCacheKey;
        m.onBeforeCompile = function (sh, rr) {
          if (prevOBC) prevOBC.call(this, sh, rr);
          const chunk = THREE.ShaderChunk.fog_fragment || "";
          if (
            chunk &&
            sh.fragmentShader.indexOf("#include <fog_fragment>") >= 0
          ) {
            sh.fragmentShader = sh.fragmentShader.replace(
              "#include <fog_fragment>",
              chunk.replace(
                /gl_FragColor\.rgb = mix\(/g,
                "fogFactor = min(fogFactor * 0.7, 0.7); gl_FragColor.rgb = mix(",
              ),
            );
          }
        };
        m.customProgramCacheKey = function () {
          return (prevKey ? prevKey.call(this) : "") + "|mapFarFog";
        };
      } else if (v === "emis" || v === "emis2") {
        m.emissive = new THREE.Color(v === "emis2" ? 0xd8dcd0 : 0x9a9e94);
        m.emissiveMap = m.map;
        m.emissiveIntensity = v === "emis2" ? 0.32 : 0.2;
        delete m.userData.txGlow;
      }
    }
    if (transparent) {
      m.transparent = true;
      m.depthWrite = false;
      if (!m.polygonOffset) {
        m.polygonOffset = true;
        m.polygonOffsetFactor = -2;
        m.polygonOffsetUnits = -4;
      }
    }
    // map-owned emissive atlases (billboards, neon blades…) join the textures module's day/night glow driver
    if (src.startsWith("my/")) {
      const a = atlases[src.slice(3)];
      if (a && a.glow) M.trackGlow(m, a.glow, a.flicker);
      if (a && a.keepNormal) keepNormal(m);
    }
    matCache.set(key, m);
    return m;
  };
  M.matCache = matCache;
  /**
   * Put a map-built material on the textures module's clone-safe night-glow driver
   * (emissiveIntensity day→night, optional flicker). Without the textures module the
   * intensity is fixed at a sensible in-between value.
   */
  M.trackGlow = function (m, glow, flicker) {
    m.emissiveIntensity = glow[0] + (glow[1] - glow[0]) * 0.35;
    try {
      if (!G.isStub("mats") && G.mats.track)
        G.mats.track(m, { glow, flicker: !!flicker });
    } catch (e) {
      /* optional */
    }
  };

  // -------------------------------------------------------------------
  // Map-owned canvas atlases
  // -------------------------------------------------------------------
  const atlases = {}; // name → {tex, mat, cells...}
  M.atlases = atlases;
  /** Register an atlas builder: fn() → {texture, transparent?, roughness?, emissive?} */
  const atlasBuilders = {};
  M.defineAtlas = function (name, fn) {
    atlasBuilders[name] = fn;
  };
  function keepNormal(m) {
    if (!THREE.ShaderChunk.normal_fragment_begin) return;
    const chunk = THREE.ShaderChunk.normal_fragment_begin.replace(
      /normal \*= faceDirection;/g,
      "",
    );
    const prevOBC = m.onBeforeCompile,
      prevKey = m.customProgramCacheKey;
    m.onBeforeCompile = function (sh, rr) {
      if (prevOBC) prevOBC.call(this, sh, rr);
      sh.fragmentShader = sh.fragmentShader.replace(
        "#include <normal_fragment_begin>",
        chunk,
      );
    };
    m.customProgramCacheKey = function () {
      return (prevKey ? prevKey.call(this) : "") + "|mapKeepNormal";
    };
  }
  M.atlasMaterial = function (name) {
    if (atlases[name]) return atlases[name].mat;
    const b = atlasBuilders[name];
    if (!b) return null;
    const a = b();
    // a.basic → unlit (light shafts, glow pools; usually with a.additive)
    const m = a.basic
      ? new THREE.MeshBasicMaterial({
          map: a.texture,
          transparent: true,
          fog: true,
        })
      : new THREE.MeshStandardMaterial({
          map: a.texture,
          transparent: !!a.transparent,
          roughness: a.roughness === undefined ? 0.85 : a.roughness,
          metalness: a.metalness || 0,
        });
    if (a.additive) {
      m.blending = THREE.AdditiveBlending;
      m.transparent = true;
      a.transparent = true;
    }
    if (a.transparent) {
      m.depthWrite = false;
      m.alphaTest = a.alphaTest || 0;
    } else if (a.alphaTest) m.alphaTest = a.alphaTest; // cut-out (weeds, foliage) stays opaque & depth-writing
    if (a.emissive) {
      m.emissive = new THREE.Color(
        a.emissiveColor === undefined ? 0xffffff : a.emissiveColor,
      );
      m.emissiveMap = a.texture;
      m.emissiveIntensity = a.emissive;
    }
    if (a.side) m.side = a.side;
    // double-sided foliage cards (weed tufts) carry up-facing normals so they light like the ground they grow
    // from — but three's DOUBLE_SIDED path flips the normal on back faces (normal *= faceDirection), which made
    // every tuft seen from its back side render near-black. Keep the authored normal on both faces.
    // (applied in M.mat after the clone — Material.clone() drops onBeforeCompile)
    if (a.keepNormal) keepNormal(m);
    // optional relief from the colour map itself (bark fissures, rock cracks): cheap, no extra texture
    if (a.bump) {
      m.bumpMap = a.bumpMap || a.texture;
      m.bumpScale = a.bump;
    }
    atlases[name] = Object.assign(a, { mat: m });
    return m;
  };
  /** UV rect of cell i in a cols×rows atlas → [u0,v0,u1,v1] (v up). */
  M.cellUV = function (i, cols, rows) {
    const cx = i % cols,
      cy = Math.floor(i / cols);
    const u0 = cx / cols,
      u1 = (cx + 1) / cols;
    const v1 = 1 - cy / rows,
      v0 = 1 - (cy + 1) / rows;
    return [u0 + 0.002, v0 + 0.002, u1 - 0.002, v1 - 0.002];
  };

  // --- Road markings / ground decals atlas (4×4 cells) ---
