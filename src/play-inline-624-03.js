// play-inline-624 03 — math
// Lines 283-611 of readable/play-inline-624.pretty.js (statement-aligned).
  function buildSAT(tex) {
    const img = tex.image;
    if (!img) return null;
    const srgb = tex.colorSpace === "srgb" || tex.encoding === 3001;
    let w = img.width | 0,
      h = img.height | 0;
    if (!(w > 0 && h > 0)) return null;
    let px = null,
      pw = 0,
      ph = 0;
    if (img.data && img.data.length >= w * h * 3) {
      // DataTexture: box-average straight from the array
      const src = img.data,
        ch = Math.round(src.length / (w * h));
      pw = Math.min(S, w);
      ph = Math.min(S, h);
      px = new Float32Array(pw * ph * 3);
      const cnt = new Float32Array(pw * ph);
      const isF = !(
        src instanceof Uint8Array || src instanceof Uint8ClampedArray
      );
      const step = Math.max(1, Math.floor(Math.sqrt((w * h) / 65536)));
      for (let y = 0; y < h; y += step) {
        const ty = Math.min(ph - 1, ((y * ph) / h) | 0);
        for (let x = 0; x < w; x += step) {
          const tx = Math.min(pw - 1, ((x * pw) / w) | 0),
            i = (y * w + x) * ch,
            o = ty * pw + tx;
          let r = src[i],
            g = ch > 1 ? src[i + 1] : r,
            b = ch > 2 ? src[i + 2] : r;
          if (isF) {
            r = Math.min(1, r);
            g = Math.min(1, g);
            b = Math.min(1, b);
          } else if (srgb) {
            r = S2L[r];
            g = S2L[g];
            b = S2L[b];
          } else {
            r /= 255;
            g /= 255;
            b /= 255;
          }
          px[o * 3] += r;
          px[o * 3 + 1] += g;
          px[o * 3 + 2] += b;
          cnt[o]++;
        }
      }
      for (let o = 0; o < pw * ph; o++) {
        const n = cnt[o] || 1;
        px[o * 3] /= n;
        px[o * 3 + 1] /= n;
        px[o * 3 + 2] /= n;
      }
    } else {
      // canvas / image / bitmap: one high-quality (mip-mapped) downscale to ≤ 32² — a proper area average
      const sw = Math.min(S, w),
        sh = Math.min(S, h);
      const c = canvas2(sw, sh, 0),
        g = c.getContext("2d", { willReadFrequently: true });
      g.imageSmoothingEnabled = true;
      g.imageSmoothingQuality = "high";
      g.clearRect(0, 0, sw, sh);
      g.drawImage(img, 0, 0, w, h, 0, 0, sw, sh);
      const data = g.getImageData(0, 0, sw, sh).data;
      pw = sw;
      ph = sh;
      px = new Float32Array(pw * ph * 3);
      for (let i = 0, o = 0; i < pw * ph; i++, o += 4) {
        // transparent texels (cut-out signs) contribute nothing: treat them as mid-grey
        const a = data[o + 3] / 255;
        let r = srgb ? S2L[data[o]] : data[o] / 255,
          g = srgb ? S2L[data[o + 1]] : data[o + 1] / 255,
          b = srgb ? S2L[data[o + 2]] : data[o + 2] / 255;
        if (a < 1) {
          r = r * a + 0.2 * (1 - a);
          g = g * a + 0.2 * (1 - a);
          b = b * a + 0.2 * (1 - a);
        }
        px[i * 3] = r;
        px[i * 3 + 1] = g;
        px[i * 3 + 2] = b;
      }
    }
    // summed-area table (pw+1)×(ph+1), row 0 = top of the image
    const sat = new Float64Array((pw + 1) * (ph + 1) * 3),
      W1 = pw + 1;
    for (let y = 0; y < ph; y++) {
      let ar = 0,
        ag = 0,
        ab = 0;
      for (let x = 0; x < pw; x++) {
        const i = (y * pw + x) * 3;
        ar += px[i];
        ag += px[i + 1];
        ab += px[i + 2];
        const o = ((y + 1) * W1 + x + 1) * 3,
          u = (y * W1 + x + 1) * 3;
        sat[o] = sat[u] + ar;
        sat[o + 1] = sat[u + 1] + ag;
        sat[o + 2] = sat[u + 2] + ab;
      }
    }
    const t = pw * ph;
    const all = [
      sat[(ph * W1 + pw) * 3] / t,
      sat[(ph * W1 + pw) * 3 + 1] / t,
      sat[(ph * W1 + pw) * 3 + 2] / t,
    ];
    return { sat, w: pw, h: ph, all };
  }
  function texInfo(tex) {
    if (!tex || !tex.image) return null;
    let s = satCache.get(tex.image);
    if (s === undefined) {
      const t0 = performance.now();
      try {
        s = buildSAT(tex);
      } catch (e) {
        s = null;
      }
      const dt = performance.now() - t0;
      satBuilt = true; // (the builder yields right after: one texture read-back per slice)
      H.stats.satMs = (H.stats.satMs || 0) + dt;
      if (dt > (H.stats.satWorst || 0)) H.stats.satWorst = +dt.toFixed(1);
      satCache.set(tex.image, s);
    }
    if (!s) return null;
    if (tex.matrixAutoUpdate !== false && tex.updateMatrix) tex.updateMatrix();
    return {
      s,
      m: tex.matrix.elements,
      flipY: tex.flipY !== false && !(tex.image && tex.image.data),
    };
  }
  const _avg = [0, 0, 0];
  /** Average colour of `ti` over the UV bounding box (u0..u1, v0..v1) → _avg. */
  function regionAvg(ti, u0, v0, u1, v1) {
    const s = ti.s;
    const su = u1 - u0,
      sv = v1 - v0;
    if (!(su >= 0) || !(sv >= 0) || (su >= 1 && sv >= 1)) {
      _avg[0] = s.all[0];
      _avg[1] = s.all[1];
      _avg[2] = s.all[2];
      return _avg;
    }
    let a0, a1, b0, b1;
    if (su >= 1) {
      a0 = 0;
      a1 = 1;
    } else {
      a0 = u0 - Math.floor(u0);
      a1 = a0 + su;
      if (a1 > 1) {
        a0 = 0;
        a1 = 1;
      }
    }
    if (sv >= 1) {
      b0 = 0;
      b1 = 1;
    } else {
      b0 = v0 - Math.floor(v0);
      b1 = b0 + sv;
      if (b1 > 1) {
        b0 = 0;
        b1 = 1;
      }
    }
    // texel rectangle (rows from the top of the image)
    let y0, y1;
    if (ti.flipY) {
      y0 = (1 - b1) * s.h;
      y1 = (1 - b0) * s.h;
    } else {
      y0 = b0 * s.h;
      y1 = b1 * s.h;
    }
    let x0 = a0 * s.w,
      x1 = a1 * s.w;
    let ix0 = Math.floor(x0),
      ix1 = Math.ceil(x1),
      iy0 = Math.floor(y0),
      iy1 = Math.ceil(y1);
    if (ix1 <= ix0) ix1 = ix0 + 1;
    if (iy1 <= iy0) iy1 = iy0 + 1;
    ix0 = Math.max(0, Math.min(s.w - 1, ix0));
    ix1 = Math.max(ix0 + 1, Math.min(s.w, ix1));
    iy0 = Math.max(0, Math.min(s.h - 1, iy0));
    iy1 = Math.max(iy0 + 1, Math.min(s.h, iy1));
    const W1 = s.w + 1,
      T = s.sat,
      n = (ix1 - ix0) * (iy1 - iy0);
    const A = (iy0 * W1 + ix0) * 3,
      B = (iy0 * W1 + ix1) * 3,
      C = (iy1 * W1 + ix0) * 3,
      D = (iy1 * W1 + ix1) * 3;
    _avg[0] = (T[D] - T[B] - T[C] + T[A]) / n;
    _avg[1] = (T[D + 1] - T[B + 1] - T[C + 1] + T[A + 1]) / n;
    _avg[2] = (T[D + 2] - T[B + 2] - T[C + 2] + T[A + 2]) / n;
    return _avg;
  }

  // ------------------------------------------------------------------
  // What can be baked
  // ------------------------------------------------------------------
  let lodSet = null,
    lodN = -1;
  function lodObjects() {
    const L = (G.world && G.world.lods) || [];
    let ML = null;
    try {
      ML = !G.isStub("map") && G.map._ && G.map._.lodGroups;
    } catch (e) {
      ML = null;
    }
    const n = L.length + (ML ? ML.length * 100000 : 0);
    if (lodSet && lodN === n) return lodSet;
    const t0 = performance.now();
    lodSet = new WeakSet();
    lodN = n;
    // objects whose visibility an owner drives by distance: G.world.addLOD entries, and the map's own
    // chunk LOD (main ↔ building impostors at 560 m, detail / fine / near layers) — never baked
    for (const e of L) if (e && e.obj) e.obj.traverse((o) => lodSet.add(o));
    if (ML)
      for (const l of ML) if (l && l.g) l.g.traverse((o) => lodSet.add(o));
    H.stats.lodSetMs = +(performance.now() - t0).toFixed(1);
    H.stats.lodSetN = (H.stats.lodSetN || 0) + 1;
    return lodSet;
  }
  function bakeableMat(mat) {
    if (!mat || mat.visible === false) return false;
    if (!(
      mat.isMeshStandardMaterial ||
      mat.isMeshLambertMaterial ||
      mat.isMeshPhongMaterial ||
      mat.isMeshBasicMaterial
    ))
      return false;
    if (mat.transparent && (mat.opacity < 0.85 || mat.alphaMap)) return false;
    if (mat.alphaTest > 0 || mat.alphaMap || mat.wireframe || mat.polygonOffset)
      return false;
    if (
      mat.depthTest === false ||
      mat.depthWrite === false ||
      mat.colorWrite === false
    )
      return false;
    if (mat.blending !== undefined && mat.blending !== THREE.NormalBlending)
      return false;
    return true;
  }
  function effVisible(o) {
    for (let p = o; p; p = p.parent) {
      if (!p.visible) return false;
      if (p.parent === G.scene) return true;
    }
    return false;
  }
  // groups whose owner switches them by distance / time (poi_civic's `*_ext_lod` near↔far shells, blinking
  // aviation lights, flicker rigs…): recognised by name so no bake is wasted on them
  const OWNER_SWITCHED =
    /(^|[_\-: ])(lod|far|near|blink|avia|strobe|flicker|night|day)($|[_\-: \d])/i;
  function ownerSwitched(o) {
    let hit = false,
      p = o;
    for (; p && p.parent && p.parent !== G.scene; p = p.parent) {
      if (!hit && p.name && OWNER_SWITCHED.test(p.name)) hit = true;
      if (p.userData && p.userData.rpNoHlod) return true; // explicit opt-out (subtree)
    }
    if (p && p.userData && p.userData.rpNoHlod) return true;
    if (p && p.name === "map_city") return false; // the map's own chunk LOD is known exactly (lodObjects); its 'far' layer is static
    return hit || !!(p && p.name && OWNER_SWITCHED.test(p.name));
  }
  // Meshes seen switching visibility while the player is outdoors: their owner drives them → never baked.
  const noBake = new WeakSet();
  /** Is the camera inside an interior cell? Outdoor owners hide their exterior roots then (`extRoot.visible =
   *  !inside`), so visibility says nothing about the outdoor view: bake as if visible, and let the outdoor
   *  visibility watch correct anything that turns out to be hidden once the player is back outside. */
  function camIndoors() {
    const c = G.camera;
    if (!c) return false;
    return (
      c.matrixWorld.elements[12] >=
      ((G.LAYOUT && G.LAYOUT.INTERIOR_X_MIN) || 2500)
    );
  }
  function bakeable(m, lods, ignoreVis) {
    if (
      !m.isMesh ||
      m.isSkinnedMesh ||
      lods.has(m) ||
      noBake.has(m) ||
      ownerSwitched(m)
    )
      return false;
    if (ignoreVis ? !m.parent : !effVisible(m)) return false;
    if (m.userData && m.userData.rpNoCull) return false;
    const g = m.geometry;
    if (!g || !g.attributes.position) return false;
    if (
      m.isInstancedMesh &&
      (m.count > 4096 ||
        m.count * (g.index ? g.index.count : g.attributes.position.count) >
          900000)
    )
      return false;
    if (Array.isArray(m.material)) {
      for (const x of m.material) if (x && !bakeableMat(x)) return false;
      return m.material.length > 0;
    }
    return bakeableMat(m.material);
  }

  // ------------------------------------------------------------------
  // Vertex-clustering accumulator
  // ------------------------------------------------------------------
  function grow(a, n) {
    if (n <= a.length) return a;
    const b = new a.constructor(Math.max(n, a.length * 2));
    b.set(a);
    return b;
  }
  // One accumulator, reused for every cell (the JS heap is several GB: big per-cell typed-array churn
  // would invite long major GCs). Arrays only ever grow.
  let ACC = null;
