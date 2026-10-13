/* src/render_perf/25_hlod.js */
/* =====================================================================
 * RENDER_PERF — HLOD: distant low-poly proxies for the whole outdoor city.
 *
 * Before: every POI / landmark / map chunk was drawn with full-detail
 * geometry and its own 20–40 materials out to the far plane. From Times
 * Square ~490 draw calls and ~1.25 M triangles were spent on things more
 * than 400 m away, deep inside the haze.
 *
 * Now (the classic open-world recipe — distant LOD meshes baked per cell):
 *  * The outdoor world is cut into 200 m cells. For every cell, all static,
 *    opaque, always-visible meshes of the adopted roots (map chunks, POI and
 *    landmark exteriors, bridges…) are merged into ONE proxy mesh, simplified
 *    by vertex clustering on a 1 m grid (window insets, bolts, trims and
 *    railings collapse; silhouettes, cornices and setbacks stay), with hard
 *    edges kept (clusters split by normal direction and by source material).
 *  * Textures are replaced by colour: every triangle takes the average of its
 *    texture over the triangle's own UV rectangle (summed-area table of a box-
 *    filtered 32² copy, so atlases / signs / façade strips keep their colours),
 *    times its vertex colours (AO / grime) and instance colour.
 *  * The material values stay LIVE: each proxy vertex carries a slot index into
 *    a float table (diffuse colour, roughness, emissive × intensity, metalness)
 *    refreshed from the source materials 4×/s — so night windows, neon, the
 *    textures module's day/night glow driver and flicker all carry over.
 *  * A cell switches to its proxy when the camera is further than D from the
 *    cell's box; D follows the fog (≈ where the haze reaches 45 %: 560 m in
 *    clear weather, less in dust / rain) × the quality preset, with 7 %
 *    hysteresis. Only baked meshes are hidden (camera layers, like every other
 *    cull here); anything not baked (transparent glass, addLOD'd props, shader
 *    materials, late spawns) keeps drawing as before.
 *  * Built progressively (≤ 2.5 ms/frame in play, 8 ms in menus / indoors /
 *    loading screens; synchronously in smoke / shot runs). A cell is rebuilt if
 *    one of its baked meshes moves, is detached or is shown/hidden by its owner
 *    (repeat offenders are simply left out of the bake).
 *
 * Switches: ?rphlod=0 (off), ?rphlod=force (every proxy on, for A/B shots),
 *   G.renderPerf.setOption('hlod', bool).
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  if (!G || !G.renderPerf || !G.renderPerf._) return;
  const RP = G.renderPerf,
    R = RP._;
  const QS = R.QS;

  const H = (R.hlod = {
    CELL: 200, // cell size (m)
    GRID: 1.0, // clustering grid (m) → ≈ 1.5 px at the switch distance (1080p, 60° fov)
    D: 600, // live switch distance (m)
    Dmul: 1, // quality preset factor (50_quality.js)
    force: QS.get("rphlod") === "force",
    cells: new Map(),
    list: [],
    root: null,
    job: null,
    jobCell: null,
    inited: false,
    stats: {
      cells: 0,
      ready: 0,
      far: 0,
      shown: 0,
      srcMeshes: 0,
      srcTris: 0,
      tris: 0,
      verts: 0,
      builds: 0,
      buildMs: 0,
      rebuilds: 0,
      slots: 0,
      D: 0,
      pending: 0,
      worstStepMs: 0,
    },
  });
  R.opts.hlod = QS.get("rphlod") !== "0";

  // ------------------------------------------------------------------
  // Live material table (float RGBA texture, 2 texels per slot)
  // ------------------------------------------------------------------
  const TW = 2048; // texels per row (1024 slots)
  let TH = 4; // rows (grows)
  const slots = []; // slot → material
  const slotOf = new Map(); // material → slot
  let tabData = new Float32Array(TW * TH * 4);
  const U = {
    rpTab: { value: null },
    rpTabW: { value: TW },
    rpTabH: { value: TH },
  };
  function makeTab() {
    const t = new THREE.DataTexture(
      tabData,
      TW,
      TH,
      THREE.RGBAFormat,
      THREE.FloatType,
    );
    t.minFilter = t.magFilter = THREE.NearestFilter;
    t.generateMipmaps = false;
    t.needsUpdate = true;
    if (U.rpTab.value) U.rpTab.value.dispose();
    U.rpTab.value = t;
    U.rpTabW.value = TW;
    U.rpTabH.value = TH;
  }
  function getSlot(mat) {
    let s = slotOf.get(mat);
    if (s !== undefined) return s;
    s = slots.length;
    slots.push(mat);
    slotOf.set(mat, s);
    if (s * 2 + 2 > TW * TH) {
      TH *= 2;
      const d = new Float32Array(TW * TH * 4);
      d.set(tabData);
      tabData = d;
      makeTab();
    }
    writeSlot(s);
    tabDirty = true;
    return s;
  }
  let tabDirty = true;
  /** Write one material's live values; returns true if anything changed. */
  function writeSlot(s) {
    const m = slots[s],
      o = s * 8,
      d = tabData;
    let dr = 0,
      dg = 0,
      db = 0,
      rough = 0.9,
      er = 0,
      eg = 0,
      eb = 0,
      metal = 0;
    if (m.isMeshBasicMaterial) {
      // unlit: the colour is emitted as-is
      if (m.color) {
        er = m.color.r;
        eg = m.color.g;
        eb = m.color.b;
      }
      rough = 1;
    } else {
      if (m.color) {
        dr = m.color.r;
        dg = m.color.g;
        db = m.color.b;
      }
      if (m.roughness !== undefined) rough = m.roughness;
      else if (m.shininess !== undefined)
        rough = Math.max(0.3, 1 - Math.sqrt(m.shininess / 100) * 0.6);
      if (m.metalness !== undefined) metal = m.metalness;
      if (m.emissive) {
        const k = m.emissiveIntensity === undefined ? 1 : m.emissiveIntensity;
        er = m.emissive.r * k;
        eg = m.emissive.g * k;
        eb = m.emissive.b * k;
      }
    }
    if (m.visible === false) {
      dr = dg = db = er = eg = eb = 0;
    }
    if (
      d[o] === dr &&
      d[o + 1] === dg &&
      d[o + 2] === db &&
      d[o + 3] === rough &&
      d[o + 4] === er &&
      d[o + 5] === eg &&
      d[o + 6] === eb &&
      d[o + 7] === metal
    )
      return false;
    d[o] = dr;
    d[o + 1] = dg;
    d[o + 2] = db;
    d[o + 3] = rough;
    d[o + 4] = er;
    d[o + 5] = eg;
    d[o + 6] = eb;
    d[o + 7] = metal;
    return true;
  }
  function refreshTable() {
    let ch = tabDirty;
    for (let s = 0; s < slots.length; s++) if (writeSlot(s)) ch = true;
    if (ch && U.rpTab.value) U.rpTab.value.needsUpdate = true;
    tabDirty = false;
  }

  // ------------------------------------------------------------------
  // Proxy material: MeshStandardMaterial (so every global chunk patch —
  // height fog, skyline sun occlusion, canyon ambient, virtual lights — applies)
  // with per-vertex colour × live slot values.
  // ------------------------------------------------------------------
  let proxyMat = null;
  function material() {
    if (proxyMat) return proxyMat;
    const m = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 1,
      metalness: 0,
      side: THREE.DoubleSide,
    });
    m.name = "rp_hlod";
    m.onBeforeCompile = function (sh) {
      Object.assign(sh.uniforms, U);
      sh.vertexShader = sh.vertexShader
        .replace(
          "#include <common>",
          "#include <common>\nattribute vec3 rpC; attribute vec3 rpE; attribute float rpS;\n" +
            "uniform sampler2D rpTab; uniform float rpTabW; uniform float rpTabH;\nvarying vec3 vRpC; varying vec3 vRpE; varying vec4 vRpD; varying vec4 vRpM;",
        )
        .replace(
          "#include <begin_vertex>",
          "#include <begin_vertex>\n{\n" +
            "  float s2 = rpS * 2.0; float row = floor(s2 / rpTabW); float col = s2 - row * rpTabW;\n" +
            "  float tv = (row + 0.5) / rpTabH;\n" +
            "  vRpD = texture2D(rpTab, vec2((col + 0.5) / rpTabW, tv));\n" +
            "  vRpM = texture2D(rpTab, vec2((col + 1.5) / rpTabW, tv));\n" +
            "  vRpC = rpC * rpC; vRpE = rpE * rpE;\n}",
        );
      sh.fragmentShader = sh.fragmentShader
        .replace(
          "#include <common>",
          "#include <common>\nvarying vec3 vRpC; varying vec3 vRpE; varying vec4 vRpD; varying vec4 vRpM;",
        )
        .replace(
          "#include <color_fragment>",
          "#include <color_fragment>\n diffuseColor.rgb *= vRpC * vRpD.rgb;",
        )
        .replace(
          "#include <roughnessmap_fragment>",
          "#include <roughnessmap_fragment>\n roughnessFactor = vRpD.a;",
        )
        .replace(
          "#include <metalnessmap_fragment>",
          "#include <metalnessmap_fragment>\n metalnessFactor = vRpM.a;",
        )
        .replace(
          "#include <emissivemap_fragment>",
          "#include <emissivemap_fragment>\n totalEmissiveRadiance = vRpE * vRpM.rgb;",
        );
    };
    m.customProgramCacheKey = () => "rp_hlod_v1";
    proxyMat = m;
    return m;
  }

  // ------------------------------------------------------------------
  // Texture colour: summed-area table of a box-filtered ≤ 32² linear copy
  // (cached per image; the UV transform is applied per texture)
  // ------------------------------------------------------------------
  const satCache = new WeakMap();
  let satBuilt = false;
  const needSat = (t) => !!(t && t.image && !satCache.has(t.image));
  const S = 32;
  let cvA = null,
    cvB = null;
  function canvas2(w, h, which) {
    let c = which ? cvB : cvA;
    if (!c) {
      c = document.createElement("canvas");
      if (which) cvB = c;
      else cvA = c;
    }
    if (c.width !== w || c.height !== h) {
      c.width = w;
      c.height = h;
    }
    return c;
  }
  function s2l(c) {
    c /= 255;
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  }
  const S2L = new Float32Array(256);
  for (let i = 0; i < 256; i++) S2L[i] = s2l(i);
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
  function newAcc(cell) {
    if (!ACC) {
      const bits = 16;
      ACC = {
        bits,
        hk: new Int32Array(1 << bits),
        hv: new Int32Array(1 << bits).fill(-1),
        hn: 0,
        // position clusters
        pn: 0,
        px: new Float64Array(4096),
        py: new Float64Array(4096),
        pz: new Float64Array(4096),
        pc: new Float32Array(4096),
        ph: new Int32Array(4096),
        // output vertices
        vn: 0,
        vCell: new Int32Array(8192),
        vKey: new Int32Array(8192),
        vNext: new Int32Array(8192),
        vSlot: new Uint16Array(8192),
        vN: new Float32Array(8192 * 3),
        vC: new Float32Array(8192 * 3),
        vE: new Float32Array(8192 * 3),
        vW: new Float32Array(8192),
        tn: 0,
        tri: new Uint32Array(16384),
      };
    }
    const A = ACC;
    if (A.hn) A.hv.fill(-1);
    A.hn = 0;
    A.pn = 0;
    A.vn = 0;
    A.tn = 0;
    A.srcTris = 0;
    A.ox = (cell.ix + 0.5) * H.CELL;
    A.oz = (cell.iz + 0.5) * H.CELL;
    A.g = H.GRID;
    A.ig = 1 / H.GRID;
    A.bx0 = A.by0 = A.bz0 = Infinity;
    A.bx1 = A.by1 = A.bz1 = -Infinity;
    return A;
  }
  function rehash(A) {
    const ok = A.hk,
      ov = A.hv,
      bits = A.bits + 1,
      n = 1 << bits,
      mask = n - 1;
    const nk = new Int32Array(n),
      nvals = new Int32Array(n).fill(-1);
    for (let i = 0; i < ok.length; i++) {
      if (ov[i] < 0) continue;
      let h = Math.imul(ok[i], 0x9e3779b1) >>> (32 - bits);
      while (nvals[h] >= 0) h = (h + 1) & mask;
      nk[h] = ok[i];
      nvals[h] = ov[i];
    }
    A.hk = nk;
    A.hv = nvals;
    A.bits = bits;
  }
  /** Position cluster id of a world point (or -1 when out of the cell's local grid range). */
  function cellId(A, x, y, z) {
    const ix = Math.floor((x - A.ox) * A.ig),
      iy = Math.floor(y * A.ig),
      iz = Math.floor((z - A.oz) * A.ig);
    if (
      ix < -1024 ||
      ix > 1023 ||
      iz < -1024 ||
      iz > 1023 ||
      iy < -32 ||
      iy > 991
    )
      return -1;
    const key = ((ix + 1024) << 21) | ((iz + 1024) << 10) | (iy + 32);
    const mask = (1 << A.bits) - 1;
    let h = Math.imul(key, 0x9e3779b1) >>> (32 - A.bits);
    const hk = A.hk,
      hv = A.hv;
    while (hv[h] >= 0) {
      if (hk[h] === key) {
        const id = hv[h];
        A.px[id] += x;
        A.py[id] += y;
        A.pz[id] += z;
        A.pc[id]++;
        return id;
      }
      h = (h + 1) & mask;
    }
    const id = A.pn++;
    if (id >= A.px.length) {
      A.px = grow(A.px, id + 1);
      A.py = grow(A.py, id + 1);
      A.pz = grow(A.pz, id + 1);
      A.pc = grow(A.pc, id + 1);
      A.ph = grow(A.ph, id + 1);
    }
    A.px[id] = x;
    A.py[id] = y;
    A.pz[id] = z;
    A.pc[id] = 1;
    A.ph[id] = -1;
    hk[h] = key;
    hv[h] = id;
    if (++A.hn * 2 > hv.length) rehash(A);
    return id;
  }
  /** Output vertex for (position cluster, normal bucket, slot). */
  function outVert(A, pc, nb, slot) {
    const key = nb * 65536 + slot;
    for (let v = A.ph[pc]; v >= 0; v = A.vNext[v])
      if (A.vKey[v] === key) return v;
    const v = A.vn++;
    if (v >= A.vCell.length) {
      const n = v + 1;
      A.vCell = grow(A.vCell, n);
      A.vKey = grow(A.vKey, n);
      A.vNext = grow(A.vNext, n);
      A.vSlot = grow(A.vSlot, n);
      A.vN = grow(A.vN, n * 3);
      A.vC = grow(A.vC, n * 3);
      A.vE = grow(A.vE, n * 3);
      A.vW = grow(A.vW, n);
    }
    A.vCell[v] = pc;
    A.vKey[v] = key;
    A.vSlot[v] = slot;
    A.vNext[v] = A.ph[pc];
    A.ph[pc] = v;
    A.vN[v * 3] = A.vN[v * 3 + 1] = A.vN[v * 3 + 2] = 0;
    A.vC[v * 3] = A.vC[v * 3 + 1] = A.vC[v * 3 + 2] = 0;
    A.vE[v * 3] = A.vE[v * 3 + 1] = A.vE[v * 3 + 2] = 0;
    A.vW[v] = 0;
    return v;
  }
  function addCorner(A, v, nx, ny, nz, cr, cg, cb, er, eg, eb, w) {
    const i = v * 3;
    A.vN[i] += nx * w;
    A.vN[i + 1] += ny * w;
    A.vN[i + 2] += nz * w;
    A.vC[i] += cr * w;
    A.vC[i + 1] += cg * w;
    A.vC[i + 2] += cb * w;
    A.vE[i] += er * w;
    A.vE[i + 1] += eg * w;
    A.vE[i + 2] += eb * w;
    A.vW[v] += w;
  }

  // scratch per-vertex buffers
  let WP = new Float32Array(3 * 65536),
    CID = new Int32Array(65536);
  const _m4 = new THREE.Matrix4(),
    _im = new THREE.Matrix4(),
    _ic = new THREE.Color();

  let WORK = 0; // work units since the last yield (shared across meshes: small meshes add up)
  /** Generator: add one mesh's triangles (world space) to the accumulator; yields every few thousand items. */
  function* addMesh(A, m) {
    const g = m.geometry,
      pos = g.attributes.position,
      idx = g.index;
    const uv = g.attributes.uv,
      col = g.attributes.color;
    const nVert = pos.count;
    if (WP.length < nVert * 3) {
      WP = new Float32Array(nVert * 3);
      CID = new Int32Array(nVert);
    }
    const plain =
      !pos.isInterleavedBufferAttribute &&
      !pos.normalized &&
      pos.array instanceof Float32Array &&
      pos.itemSize === 3;
    const P = pos.array;
    const insts = m.isInstancedMesh ? m.count : 1;
    const groups =
      g.groups && g.groups.length
        ? g.groups
        : [{ start: 0, count: idx ? idx.count : nVert, materialIndex: 0 }];
    const dr0 = g.drawRange.start,
      dr1 =
        g.drawRange.count === Infinity
          ? Infinity
          : g.drawRange.start + g.drawRange.count;
    const minA = 0.01 * A.g * A.g;
    for (let ins = 0; ins < insts; ins++) {
      if (m.isInstancedMesh) {
        m.getMatrixAt(ins, _im);
        _m4.multiplyMatrices(m.matrixWorld, _im);
      } else _m4.copy(m.matrixWorld);
      let ir = 1,
        igc = 1,
        ib = 1;
      if (m.isInstancedMesh && m.instanceColor) {
        m.getColorAt(ins, _ic);
        ir = _ic.r;
        igc = _ic.g;
        ib = _ic.b;
      }
      const e = _m4.elements;
      const flipW = _m4.determinant() < 0;
      // 1. world positions + position clusters
      for (let v = 0; v < nVert; v++) {
        let x, y, z;
        if (plain) {
          x = P[v * 3];
          y = P[v * 3 + 1];
          z = P[v * 3 + 2];
        } else {
          x = pos.getX(v);
          y = pos.getY(v);
          z = pos.getZ(v);
        }
        const wx = e[0] * x + e[4] * y + e[8] * z + e[12],
          wy = e[1] * x + e[5] * y + e[9] * z + e[13],
          wz = e[2] * x + e[6] * y + e[10] * z + e[14];
        WP[v * 3] = wx;
        WP[v * 3 + 1] = wy;
        WP[v * 3 + 2] = wz;
        CID[v] = cellId(A, wx, wy, wz);
        if (wx < A.bx0) A.bx0 = wx;
        if (wx > A.bx1) A.bx1 = wx;
        if (wy < A.by0) A.by0 = wy;
        if (wy > A.by1) A.by1 = wy;
        if (wz < A.bz0) A.bz0 = wz;
        if (wz > A.bz1) A.bz1 = wz;
        if (++WORK >= 4000) {
          WORK = 0;
          yield;
        }
      }
      // 2. triangles per material group
      for (const gr of groups) {
        const mat = Array.isArray(m.material)
          ? m.material[gr.materialIndex | 0]
          : m.material;
        if (!mat) continue;
        // a texture read-back (≈ 3–8 ms) gets a slice of its own
        if (WORK > 300 && (needSat(mat.map) || needSat(mat.emissiveMap))) {
          WORK = 0;
          yield;
        }
        const slot = getSlot(mat);
        const basic = !!mat.isMeshBasicMaterial;
        const tiMap = uv ? texInfo(mat.map) : null;
        const tiEm = uv && !basic ? texInfo(mat.emissiveMap) : null;
        const allMap = !uv && mat.map ? texInfo(mat.map) : null;
        const allEm =
          !uv && !basic && mat.emissiveMap ? texInfo(mat.emissiveMap) : null;
        if (satBuilt) {
          satBuilt = false;
          yield;
        }
        const useVC = !!(mat.vertexColors && col);
        const flip = (mat.side === THREE.BackSide) !== flipW;
        const s0 = Math.max(gr.start, dr0),
          s1 = Math.min(gr.start + gr.count, dr1, idx ? idx.count : nVert);
        const I = idx ? idx.array : null;
        let tmR = 1,
          tmG = 1,
          tmB = 1,
          emR = 1,
          emG = 1,
          emB = 1;
        if (allMap) {
          tmR = allMap.s.all[0];
          tmG = allMap.s.all[1];
          tmB = allMap.s.all[2];
        }
        if (allEm) {
          emR = allEm.s.all[0];
          emG = allEm.s.all[1];
          emB = allEm.s.all[2];
        }
        for (let t = s0; t + 2 < s1; t += 3) {
          let a = I ? I[t] : t,
            b = I ? I[t + 1] : t + 1,
            c = I ? I[t + 2] : t + 2;
          if (flip) {
            const q = b;
            b = c;
            c = q;
          }
          const ca = CID[a],
            cb = CID[b],
            cc = CID[c];
          A.srcTris++;
          if (++WORK >= 3000) {
            WORK = 0;
            yield;
          }
          if (ca < 0 || cb < 0 || cc < 0 || ca === cb || cb === cc || ca === cc)
            continue;
          const ax = WP[a * 3],
            ay = WP[a * 3 + 1],
            az = WP[a * 3 + 2];
          const e1x = WP[b * 3] - ax,
            e1y = WP[b * 3 + 1] - ay,
            e1z = WP[b * 3 + 2] - az;
          const e2x = WP[c * 3] - ax,
            e2y = WP[c * 3 + 1] - ay,
            e2z = WP[c * 3 + 2] - az;
          let nx = e1y * e2z - e1z * e2y,
            ny = e1z * e2x - e1x * e2z,
            nz = e1x * e2y - e1y * e2x;
          const l = Math.sqrt(nx * nx + ny * ny + nz * nz),
            area = 0.5 * l;
          if (!(area > minA)) continue;
          nx /= l;
          ny /= l;
          nz /= l;
          // texture colour over this triangle's UV rectangle
          let tr = tmR,
            tg = tmG,
            tb = tmB,
            er = emR,
            eg = emG,
            eb = emB;
          if (tiMap || tiEm) {
            const ua = uv.getX(a),
              va = uv.getY(a),
              ub = uv.getX(b),
              vb = uv.getY(b),
              uc = uv.getX(c),
              vc = uv.getY(c);
            if (tiMap) {
              const M = tiMap.m;
              const pa = M[0] * ua + M[3] * va + M[6],
                qa = M[1] * ua + M[4] * va + M[7];
              const pb = M[0] * ub + M[3] * vb + M[6],
                qb = M[1] * ub + M[4] * vb + M[7];
              const pcc = M[0] * uc + M[3] * vc + M[6],
                qc = M[1] * uc + M[4] * vc + M[7];
              const r = regionAvg(
                tiMap,
                Math.min(pa, pb, pcc),
                Math.min(qa, qb, qc),
                Math.max(pa, pb, pcc),
                Math.max(qa, qb, qc),
              );
              tr = r[0];
              tg = r[1];
              tb = r[2];
            }
            if (tiEm) {
              const M = tiEm.m;
              const pa = M[0] * ua + M[3] * va + M[6],
                qa = M[1] * ua + M[4] * va + M[7];
              const pb = M[0] * ub + M[3] * vb + M[6],
                qb = M[1] * ub + M[4] * vb + M[7];
              const pcc = M[0] * uc + M[3] * vc + M[6],
                qc = M[1] * uc + M[4] * vc + M[7];
              const r = regionAvg(
                tiEm,
                Math.min(pa, pb, pcc),
                Math.min(qa, qb, qc),
                Math.max(pa, pb, pcc),
                Math.max(qa, qb, qc),
              );
              er = r[0];
              eg = r[1];
              eb = r[2];
            }
          }
          const nb =
            (Math.round(nx * 2) + 2) * 25 +
            (Math.round(ny * 2) + 2) * 5 +
            (Math.round(nz * 2) + 2);
          const va2 = outVert(A, ca, nb, slot),
            vb2 = outVert(A, cb, nb, slot),
            vc2 = outVert(A, cc, nb, slot);
          const w = area;
          // per-corner vertex colours (AO / grime) × instance colour
          let ar = ir,
            ag = igc,
            ab = ib,
            br = ir,
            bg = igc,
            bb = ib,
            cr = ir,
            cg = igc,
            cbb = ib;
          if (useVC) {
            ar *= col.getX(a);
            ag *= col.getY(a);
            ab *= col.getZ(a);
            br *= col.getX(b);
            bg *= col.getY(b);
            bb *= col.getZ(b);
            cr *= col.getX(c);
            cg *= col.getY(c);
            cbb *= col.getZ(c);
          }
          if (basic) {
            // unlit: the whole texture × vertex colour is emitted (slot diffuse = 0)
            addCorner(
              A,
              va2,
              nx,
              ny,
              nz,
              0,
              0,
              0,
              tr * ar,
              tg * ag,
              tb * ab,
              w,
            );
            addCorner(
              A,
              vb2,
              nx,
              ny,
              nz,
              0,
              0,
              0,
              tr * br,
              tg * bg,
              tb * bb,
              w,
            );
            addCorner(
              A,
              vc2,
              nx,
              ny,
              nz,
              0,
              0,
              0,
              tr * cr,
              tg * cg,
              tb * cbb,
              w,
            );
          } else {
            addCorner(
              A,
              va2,
              nx,
              ny,
              nz,
              tr * ar,
              tg * ag,
              tb * ab,
              er,
              eg,
              eb,
              w,
            );
            addCorner(
              A,
              vb2,
              nx,
              ny,
              nz,
              tr * br,
              tg * bg,
              tb * bb,
              er,
              eg,
              eb,
              w,
            );
            addCorner(
              A,
              vc2,
              nx,
              ny,
              nz,
              tr * cr,
              tg * cg,
              tb * cbb,
              er,
              eg,
              eb,
              w,
            );
          }
          const k = A.tn;
          if (k + 3 > A.tri.length) A.tri = grow(A.tri, k + 3);
          A.tri[k] = va2;
          A.tri[k + 1] = vb2;
          A.tri[k + 2] = vc2;
          A.tn = k + 3;
        }
      }
    }
  }

  /** Accumulator → BufferGeometry (compact, quantised). */
  function finish(A) {
    const n = A.vn;
    if (!n || !A.tn) return null;
    const pos = new Float32Array(n * 3),
      nrm = new Int8Array(n * 3),
      rc = new Uint8Array(n * 3),
      re = new Uint8Array(n * 3),
      rs = new Uint16Array(n);
    for (let v = 0; v < n; v++) {
      const p = A.vCell[v],
        k = 1 / A.pc[p];
      pos[v * 3] = A.px[p] * k;
      pos[v * 3 + 1] = A.py[p] * k;
      pos[v * 3 + 2] = A.pz[p] * k;
      let x = A.vN[v * 3],
        y = A.vN[v * 3 + 1],
        z = A.vN[v * 3 + 2];
      const l = Math.sqrt(x * x + y * y + z * z);
      if (l > 1e-9) {
        x /= l;
        y /= l;
        z /= l;
      } else {
        x = 0;
        y = 1;
        z = 0;
      }
      nrm[v * 3] = Math.round(x * 127);
      nrm[v * 3 + 1] = Math.round(y * 127);
      nrm[v * 3 + 2] = Math.round(z * 127);
      const w = A.vW[v] > 0 ? 1 / A.vW[v] : 0;
      for (let j = 0; j < 3; j++) {
        // stored as sqrt (decoded x² in the shader): dark linear tones keep their precision
        rc[v * 3 + j] = Math.round(
          Math.sqrt(Math.min(1, Math.max(0, A.vC[v * 3 + j] * w))) * 255,
        );
        re[v * 3 + j] = Math.round(
          Math.sqrt(Math.min(1, Math.max(0, A.vE[v * 3 + j] * w))) * 255,
        );
      }
      rs[v] = A.vSlot[v];
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("normal", new THREE.BufferAttribute(nrm, 3, true));
    geo.setAttribute("rpC", new THREE.BufferAttribute(rc, 3, true));
    geo.setAttribute("rpE", new THREE.BufferAttribute(re, 3, true));
    geo.setAttribute("rpS", new THREE.BufferAttribute(rs, 1));
    const tri = A.tri.subarray(0, A.tn);
    geo.setIndex(
      new THREE.BufferAttribute(
        n < 65536 ? Uint16Array.from(tri) : tri.slice(),
        1,
      ),
    );
    geo.computeBoundingBox();
    geo.computeBoundingSphere();
    return geo;
  }

  // ------------------------------------------------------------------
  // Cells
  // ------------------------------------------------------------------
  function cellFor(x, z) {
    const ix = Math.floor(x / H.CELL),
      iz = Math.floor(z / H.CELL),
      key = ix * 100000 + iz;
    let c = H.cells.get(key);
    if (!c) {
      c = {
        key,
        ix,
        iz,
        units: [],
        baked: [],
        proxy: null,
        ready: false,
        far: false,
        dirty: false,
        due: 0,
        stale: false,
        x0: 0,
        y0: 0,
        z0: 0,
        x1: 0,
        y1: 0,
        z1: 0,
        src: null,
        srcU: null,
        vis: null,
        tris: 0,
        srcTris: 0,
        fails: 0,
      };
      H.cells.set(key, c);
      H.list.push(c);
    }
    return c;
  }
  function assign(u, late) {
    if (u.hcell || u.interior || u.dead) return;
    const c = cellFor(u.cx, u.cz);
    u.hcell = c;
    c.units.push(u);
    // a unit adopted after its cell was baked (late builders, quest set pieces, newGame spawns):
    // rebuild the cell once things have settled — only if it brings something bakeable
    if (late && (c.done || H.jobCell === c) && !u.frozen) {
      const lods = lodObjects();
      const iv = camIndoors();
      for (const m of u.meshes)
        if (bakeable(m, lods, iv)) {
          markDirty(c, 5000);
          break;
        }
    }
  }
  H.assignAll = function (late) {
    for (const u of R.units)
      if (!u.hcell && !u.interior && !u.dead) assign(u, late);
  };

  function setFar(c, far) {
    if (c.far === far) return;
    c.far = far;
    for (const u of c.baked) {
      u.hf = far;
      R.apply(u);
    }
    if (!far && c.proxy) c.proxy.visible = false;
  }
  function markDirty(c, delay) {
    setFar(c, false);
    if (c.proxy) c.proxy.visible = false;
    c.ready = false;
    if (!c.dirty) H.stats.rebuilds++;
    c.dirty = true;
    c.due = Math.max(
      c.due || 0,
      performance.now() + (delay === undefined ? 2500 : delay),
    );
    if (H.jobCell === c) c.stale = true;
  }
  /** Called by the validation sweep when a unit's meshes moved / changed / left. */
  R.hlodInvalidate = function (u) {
    const c = u.hcell;
    if (u.hf) {
      u.hf = false;
      R.apply(u);
    }
    if (u.hb) {
      u.hb = null;
      u.hbAll = false;
      u.hInv = (u.hInv || 0) + 1;
      if (u.hInv >= 2) u.noHlod = true;
    }
    if (
      c &&
      (c.ready || H.jobCell === c) &&
      (c.baked.indexOf(u) >= 0 || H.jobCell === c)
    )
      markDirty(c);
  };

  function* buildJob(c) {
    const lods = lodObjects();
    const ignoreVis = camIndoors();
    c.builtIndoors = ignoreVis;
    const A = newAcc(c);
    const baked = [],
      src = [],
      srcU = [];
    c.units = c.units.filter((u) => !u.dead && u.hcell === c);
    for (const u of c.units) {
      u.hbNext = null;
      if (
        u.frozen ||
        u.noHlod ||
        u.dead ||
        !u.root ||
        u.root.parent !== G.scene
      )
        continue;
      const ms = u.meshes,
        hb = new Uint8Array(ms.length);
      let any = false;
      for (let i = 0; i < ms.length; i++)
        if (bakeable(ms[i], lods, ignoreVis)) {
          hb[i] = 1;
          any = true;
        }
      WORK += 30 * ms.length;
      if (WORK >= 3000) {
        WORK = 0;
        yield;
      }
      if (!any) continue;
      u.hbNext = hb;
      baked.push(u);
      for (let i = 0; i < ms.length; i++) {
        if (!hb[i]) continue;
        src.push(ms[i]);
        srcU.push(u);
        yield* addMesh(A, ms[i]);
        WORK += 200;
        if (WORK >= 3000) {
          WORK = 0;
          yield;
        }
      }
    }
    return { A, baked, src, srcU };
  }
  function install(c, res) {
    const t0 = performance.now();
    const geo = finish(res.A);
    const dt = performance.now() - t0;
    if (dt > (H.stats.finishWorst || 0)) H.stats.finishWorst = +dt.toFixed(1);
    // units that were baked last time but not now: make sure they are not left hidden
    for (const u of c.baked)
      if (res.baked.indexOf(u) < 0) {
        u.hb = null;
        u.hbAll = false;
        if (u.hf) {
          u.hf = false;
          R.apply(u);
        }
      }
    if (!geo) {
      if (c.proxy) {
        c.proxy.geometry.dispose();
        H.root.remove(c.proxy);
        c.proxy = null;
      }
      c.baked = [];
      c.src = c.srcU = c.vis = null;
      c.ready = false;
      c.dirty = false;
      return performance.now() - t0;
    }
    for (const u of res.baked) {
      if (u.hf) {
        u.hf = false;
        R.apply(u);
      }
      u.hb = u.hbNext;
      u.hbNext = null;
      let all = true;
      for (let i = 0; i < u.hb.length; i++)
        if (!u.hb[i]) {
          all = false;
          break;
        }
      u.hbAll = all; // every mesh is in the proxy: the cull pass can skip the unit while its cell is far
    }
    c.baked = res.baked;
    c.src = res.src;
    c.srcU = res.srcU;
    c.vis = new Uint8Array(res.src.length).fill(1);
    const A = res.A;
    c.x0 = A.bx0;
    c.y0 = A.by0;
    c.z0 = A.bz0;
    c.x1 = A.bx1;
    c.y1 = A.by1;
    c.z1 = A.bz1;
    for (const u of res.baked) {
      // the unit boxes may reach further than the baked meshes
      if (u.x0 < c.x0) c.x0 = u.x0;
      if (u.y0 < c.y0) c.y0 = u.y0;
      if (u.z0 < c.z0) c.z0 = u.z0;
      if (u.x1 > c.x1) c.x1 = u.x1;
      if (u.y1 > c.y1) c.y1 = u.y1;
      if (u.z1 > c.z1) c.z1 = u.z1;
    }
    c.srcTris = A.srcTris;
    c.tris = A.tn / 3;
    c.verts = A.vn;
    if (!c.proxy) {
      const mesh = new THREE.Mesh(geo, material());
      mesh.name = "rp_hlod_" + c.ix + "_" + c.iz;
      mesh.matrixAutoUpdate = false;
      mesh.matrixWorldAutoUpdate = false;
      mesh.castShadow = false;
      mesh.receiveShadow = true;
      mesh.raycast = function () {
        /* proxies are never hit */
      };
      mesh.visible = false;
      mesh.userData.rpNoCull = true;
      mesh.userData.rpNoFreeze = true;
      H.root.add(mesh);
      mesh.updateMatrixWorld(true);
      c.proxy = mesh;
      // first proxy: compile its program now (in parallel), not on the frame it first comes into view
      if (!H.compiled && !G.SMOKE && !G.SHOT && R.prewarmPrograms) {
        H.compiled = true;
        setTimeout(() => {
          try {
            R.prewarmPrograms(true);
          } catch (e) {
            /* optional */
          }
        }, 0);
      }
    } else {
      const old = c.proxy.geometry;
      c.proxy.geometry = geo;
      old.dispose();
      c.proxy.visible = false;
    }
    // the CPU copies are not needed after the upload (JS heap: the city is big enough already)
    for (const k in geo.attributes) geo.attributes[k].onUpload(freeArray);
    if (geo.index) geo.index.onUpload(freeArray);
    c.ready = true;
    c.dirty = false;
    c.far = false;
    H.stats.builds++;
    return performance.now() - t0;
  }
  function freeArray() {
    this.array = new this.array.constructor(0);
  }

  function pickNext(cam) {
    const now = performance.now();
    let best = null,
      bs = Infinity;
    const cx = cam ? cam.x : 0,
      cz = cam ? cam.z : 0;
    for (const c of H.list) {
      if (c.ready || (c.dirty && c.due > now) || c.fails > 2 || !c.units.length)
        continue;
      if (c.done && !c.dirty) continue;
      const dx = Math.max(0, Math.abs((c.ix + 0.5) * H.CELL - cx) - H.CELL / 2),
        dz = Math.max(0, Math.abs((c.iz + 0.5) * H.CELL - cz) - H.CELL / 2);
      const d = Math.sqrt(dx * dx + dz * dz);
      // the ones about to be needed first (just beyond the switch distance), the near ones last
      const s = d >= H.D * 0.75 ? d : d + 1e5;
      if (s < bs) {
        bs = s;
        best = c;
      }
    }
    return best;
  }
  /** Progressive builder. Returns ms spent. */
  H.work = function (budgetMs) {
    if (!H.inited) return 0;
    const t0 = performance.now();
    const cam = G.camera ? G.camera.position : null;
    while (performance.now() - t0 < budgetMs) {
      if (!H.job) {
        const c = pickNext(cam);
        if (!c) break;
        H.jobCell = c;
        c.stale = false;
        H.job = buildJob(c);
      }
      let r;
      const ts = performance.now();
      try {
        r = H.job.next();
      } catch (e) {
        G.reportError("render_perf:hlod build", e);
        H.jobCell.fails++;
        H.job = null;
        H.jobCell.done = true;
        H.jobCell = null;
        continue;
      }
      if (r.done) {
        const c = H.jobCell;
        H.job = null;
        H.jobCell = null;
        c.done = true;
        if (c.stale) {
          c.dirty = true;
          c.due = performance.now() + 2500;
          for (const u of c.units) u.hbNext = null;
          continue;
        }
        try {
          install(c, r.value);
        } catch (e) {
          G.reportError("render_perf:hlod install", e);
          c.fails++;
        }
      }
      const dt = performance.now() - ts;
      if (dt > H.stats.worstStepMs) H.stats.worstStepMs = +dt.toFixed(1);
      if (dt > 40) H.stats.slowSteps = (H.stats.slowSteps || 0) + 1;
    }
    const ms = performance.now() - t0;
    H.stats.buildMs += ms;
    return ms;
  };

  // ------------------------------------------------------------------
  // Per frame (called from the cull pass with this frame's final camera)
  // ------------------------------------------------------------------
  let dT = 0,
    visIdx = 0,
    visCell = 0;
  function updateD() {
    let D = 600;
    const f = G.scene && G.scene.fog;
    if (f && f.density > 0)
      D = 0.78 / f.density; // FogExp2: haze ≈ 45 % at D
    else if (f && f.far > 0) D = f.near + (f.far - f.near) * 0.45;
    D = Math.max(420, Math.min(1500, D)) * (H.Dmul || 1);
    // move slowly (weather transitions) so cells do not flicker in and out
    H.D = H.D ? H.D + (D - H.D) * 0.25 : D;
    H.stats.D = Math.round(H.D);
  }
  function watchVisibility(n) {
    const L = H.list;
    if (!L.length) return;
    let guard = L.length + 1;
    while (n > 0 && guard-- > 0) {
      if (visCell >= L.length) visCell = 0;
      const c = L[visCell];
      if (!c.ready || !c.src) {
        visCell++;
        visIdx = 0;
        continue;
      }
      const src = c.src,
        vis = c.vis;
      for (; visIdx < src.length && n > 0; visIdx++, n--) {
        const m = src[visIdx];
        const v = m.parent && effVisible(m) ? 1 : 0;
        if (v !== vis[visIdx]) {
          const u = c.srcU[visIdx];
          u.hVis = (u.hVis || 0) + 1;
          noBake.add(m); // its owner toggles it (distance LOD, night-only neon, quest state…): leave it out
          if (u.hVis > 24) u.noHlod = true;
          markDirty(c, 1500);
          visIdx = src.length;
          break;
        }
      }
      if (visIdx >= src.length) {
        visCell++;
        visIdx = 0;
      }
    }
  }
  function inFrustum(planes, c) {
    for (let i = 0; i < 6; i++) {
      const p = planes[i],
        nn = p.normal;
      const x = nn.x > 0 ? c.x1 : c.x0,
        y = nn.y > 0 ? c.y1 : c.y0,
        z = nn.z > 0 ? c.z1 : c.z0;
      if (nn.x * x + nn.y * y + nn.z * z + p.constant < 0) return false;
    }
    return true;
  }
  H.frame = function (cam, planes, occOn, O, cx, cy, cz, indoors) {
    if (!H.inited || !H.root) return;
    const on = R.enabled && R.opts.hlod;
    if (!on || indoors) {
      H.root.visible = false;
      if (!on) for (const c of H.list) if (c.far) setFar(c, false);
      return;
    }
    H.root.visible = true;
    if (--dT <= 0) {
      dT = 20;
      updateD();
    }
    const D = H.D,
      Dn = D * 0.93;
    let far = 0,
      shown = 0;
    for (const c of H.list) {
      if (!c.ready) continue;
      const dx = c.x0 > cx ? c.x0 - cx : cx > c.x1 ? cx - c.x1 : 0;
      const dy = c.y0 > cy ? c.y0 - cy : cy > c.y1 ? cy - c.y1 : 0;
      const dz = c.z0 > cz ? c.z0 - cz : cz > c.z1 ? cz - c.z1 : 0;
      const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
      const f = H.force || (c.far ? d > Dn : d > D);
      if (f !== c.far) setFar(c, f);
      if (f) {
        far++;
        let vis = true;
        if (
          occOn &&
          inFrustum(planes, c) &&
          O.boxOccluded(c.x0, c.y0, c.z0, c.x1, c.y1, c.z1)
        )
          vis = false;
        c.proxy.visible = vis;
        if (vis) shown++;
      }
    }
    H.stats.far = far;
    H.stats.shown = shown;
    watchVisibility(400);
  };

  H.onEnabled = function (on) {
    if (!H.root) return;
    if (!on) {
      for (const c of H.list) if (c.far) setFar(c, false);
      H.root.visible = false;
    }
  };

  // ------------------------------------------------------------------
  // System: setup once the units exist, progressive build, live table
  // ------------------------------------------------------------------
  let tabT = 0,
    assignT = 0;
  R.addSystem({
    name: "hlod",
    order: 40,
    update(dt, realDt) {
      if (!R.opts.hlod || !R.enabled) return;
      if (!H.inited) {
        if (!R.unitsReady || !G.scene) return;
        H.root = new THREE.Group();
        H.root.name = "rp_hlod";
        H.root.matrixAutoUpdate = false;
        G.scene.add(H.root);
        makeTab();
        H.inited = true;
        H.assignAll();
      }
      // units adopted later (rescans after newGame) join their cell at its next rebuild
      if ((assignT -= realDt || 0) <= 0) {
        assignT = 3;
        H.assignAll(true);
      }
      // build: synchronous in smoke / shot runs (their few frames must show the real far view),
      // otherwise a small slice per frame (more while the world is paused, indoors or in a menu)
      let budget;
      if (G.SMOKE || G.SHOT) budget = 1e9;
      else {
        const indoors =
          G.player &&
          G.player.pos &&
          G.player.pos.x >= ((G.LAYOUT && G.LAYOUT.INTERIOR_X_MIN) || 2500);
        const running = G.worldRunning ? G.worldRunning() : true;
        budget = !running || indoors ? 8 : 2.5;
      }
      H.work(budget);
      if ((tabT -= realDt || 0) <= 0) {
        tabT = 0.25;
        refreshTable();
      } else if (tabDirty) refreshTable();
      // stats
      let ready = 0,
        tris = 0,
        srcTris = 0,
        src = 0,
        pending = 0;
      for (const c of H.list) {
        if (c.ready) {
          ready++;
          tris += c.tris;
          srcTris += c.srcTris;
          src += c.src ? c.src.length : 0;
        } else if (c.units.length && !(c.done && !c.dirty)) pending++;
      }
      const s = H.stats;
      s.cells = H.list.length;
      s.ready = ready;
      s.tris = tris;
      s.srcTris = srcTris;
      s.srcMeshes = src;
      s.slots = slots.length;
      s.pending = pending;
    },
  });
})();
