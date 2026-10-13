// play-inline-624 02 — color
// Lines 43-282 of readable/play-inline-624.pretty.js (statement-aligned).
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
