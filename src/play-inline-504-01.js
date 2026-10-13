// play-inline-504 01 — three
// Lines 18-266 of readable/play-inline-504.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  const P = G.weapons._;

  const LOD_NEAR = 28,
    LOD_FAR = 90,
    LOD_FAR_SMALL = 45;

  // ------------------------------------------------------------------
  // Shared world materials
  // ------------------------------------------------------------------
  let wearTex = null,
    wearAvg = 1;
  function getWearTex() {
    if (wearTex) return wearTex;
    try {
      const s = 128,
        c = document.createElement("canvas");
      c.width = c.height = s;
      const ctx = c.getContext("2d");
      const img = ctx.createImageData(s, s),
        d = img.data;
      const U = G.util;
      let sum = 0;
      for (let y = 0; y < s; y++)
        for (let x = 0; x < s; x++) {
          const u = x / s,
            v = y / s;
          const n =
            U.fbm2(u * 8, v * 8, 3) * 0.7 + U.noise2(u * 40, v * 40) * 0.3;
          const g = 200 + 55 * n;
          const i = (y * s + x) * 4;
          d[i] = d[i + 1] = d[i + 2] = g;
          d[i + 3] = 255;
          sum += g;
        }
      ctx.putImageData(img, 0, 0);
      const avgS = sum / (s * s) / 255;
      wearAvg = new THREE.Color().setRGB(
        avgS,
        avgS,
        avgS,
        THREE.SRGBColorSpace,
      ).r;
      wearTex = new THREE.CanvasTexture(c);
      wearTex.wrapS = wearTex.wrapT = THREE.RepeatWrapping;
      wearTex.colorSpace = THREE.SRGBColorSpace;
    } catch (e) {
      wearTex = null;
      wearAvg = 1;
    }
    return wearTex;
  }
  const worldMats = {};
  function worldMat(kind) {
    if (worldMats[kind]) return worldMats[kind];
    let m;
    if (kind === "glow")
      m = new THREE.MeshBasicMaterial({
        vertexColors: true,
        toneMapped: false,
        fog: true,
      });
    else
      m = new THREE.MeshStandardMaterial({
        vertexColors: true,
        map: getWearTex(),
        metalness: kind === "metal" ? 0.45 : 0.06,
        roughness: kind === "metal" ? 0.45 : 0.74,
      });
    m.name = "wpn_world_" + kind;
    m.userData.shared = true;
    return (worldMats[kind] = m);
  }

  // ------------------------------------------------------------------
  // Average (linear) colour of a kit material's texture, cached
  // ------------------------------------------------------------------
  const texAvgCache = new Map();
  function textureAvg(tex) {
    if (!tex) return null;
    if (texAvgCache.has(tex)) return texAvgCache.get(tex);
    let out = null;
    try {
      const im = tex.image;
      if (im && im.getContext) {
        const d = im
          .getContext("2d")
          .getImageData(0, 0, im.width, im.height).data;
        let r = 0,
          g = 0,
          b = 0,
          n = 0;
        for (let i = 0; i < d.length; i += 16) {
          r += d[i];
          g += d[i + 1];
          b += d[i + 2];
          n++;
        }
        out = new THREE.Color().setRGB(
          r / n / 255,
          g / n / 255,
          b / n / 255,
          THREE.SRGBColorSpace,
        );
      }
    } catch (e) {
      out = null;
    }
    if (!out) out = new THREE.Color(0.62, 0.62, 0.62);
    texAvgCache.set(tex, out);
    return out;
  }
  /** Bucket + baked base colour (linear) for a kit material instance. */
  function classify(mat) {
    const name = mat.userData && mat.userData.wpnMat;
    const def = (name && P.MAT_DEFS[name]) || null;
    if (name === "glass") return null; // see-through: dropped (the glow core stays)
    if (mat.isMeshBasicMaterial || (def && def.basic))
      return { kind: "glow", col: mat.color.clone() };
    const col = mat.color.clone();
    if (mat.map) col.multiply(textureAvg(mat.map));
    if (name === "lens") col.setRGB(0.02, 0.035, 0.03);
    const metal = def ? def.metalness >= 0.6 : (mat.metalness || 0) >= 0.6;
    return { kind: metal ? "metal" : "matte", col };
  }

  // ------------------------------------------------------------------
  // Bake a built model into merged buckets + LOD
  // ------------------------------------------------------------------
  const _rel = new THREE.Matrix4(),
    _inv = new THREE.Matrix4();
  function prepGeo(src, matrix, col, kind) {
    let g = src.index ? src.toNonIndexed() : src.clone();
    for (const key of Object.keys(g.attributes))
      if (!["position", "normal", "uv", "color"].includes(key))
        g.deleteAttribute(key);
    if (!g.attributes.normal) g.computeVertexNormals();
    const n = g.attributes.position.count;
    if (!g.attributes.uv)
      g.setAttribute(
        "uv",
        new THREE.BufferAttribute(new Float32Array(n * 2), 2),
      );
    const c = new Float32Array(n * 3),
      src3 = g.attributes.color;
    // glow keeps its colour; lit buckets divide out the wear texture's average so the product matches the kit look
    const k = kind === "glow" ? 1 : 1 / Math.max(0.2, wearAvg);
    for (let i = 0; i < n; i++) {
      const tr = src3 ? src3.getX(i) : 1,
        tg = src3 ? src3.getY(i) : 1,
        tb = src3 ? src3.getZ(i) : 1;
      c[i * 3] = Math.min(1, col.r * tr * k);
      c[i * 3 + 1] = Math.min(1, col.g * tg * k);
      c[i * 3 + 2] = Math.min(1, col.b * tb * k);
    }
    g.setAttribute("color", new THREE.BufferAttribute(c, 3));
    g.applyMatrix4(matrix);
    return g;
  }
  /**
   * P.bakeWorld(root, opts) → Group containing a THREE.LOD.
   * opts: {castShadow, far (hide distance), noLod}
   */
  P.bakeWorld = function (root, opts) {
    opts = opts || {};
    getWearTex();
    root.updateMatrixWorld(true);
    _inv.copy(root.matrixWorld).invert();
    const buckets = { metal: [], matte: [], glow: [] };
    root.traverse((o) => {
      if (!o.isMesh || !o.geometry || !o.geometry.attributes.position) return;
      // skip parts hidden by the model (e.g. hand-only items)
      for (let p = o; p && p !== root; p = p.parent) if (!p.visible) return;
      const cl = classify(
        Array.isArray(o.material) ? o.material[0] : o.material,
      );
      if (!cl) return;
      _rel.multiplyMatrices(_inv, o.matrixWorld);
      buckets[cl.kind].push(prepGeo(o.geometry, _rel, cl.col, cl.kind));
    });
    const out = new THREE.Group();
    out.name = root.name + "_world";
    const detail = new THREE.Group();
    detail.name = "lod0";
    const box = new THREE.Box3();
    const avg = new THREE.Color(0, 0, 0);
    let avgN = 0;
    for (const kind of ["metal", "matte", "glow"]) {
      const list = buckets[kind];
      if (!list.length) continue;
      const geo = G.util.mergeGeometries(list);
      list.forEach((g) => g.dispose());
      if (!geo) continue;
      geo.computeBoundingBox();
      geo.computeBoundingSphere();
      if (kind !== "glow") {
        box.union(geo.boundingBox);
        const c = geo.attributes.color;
        const step = Math.max(1, Math.floor(c.count / 400));
        for (let i = 0; i < c.count; i += step) {
          avg.r += c.getX(i);
          avg.g += c.getY(i);
          avg.b += c.getZ(i);
          avgN++;
        }
      }
      const mesh = new THREE.Mesh(geo, worldMat(kind));
      mesh.name = "wpn_" + kind;
      mesh.castShadow = !!opts.castShadow && kind !== "glow";
      mesh.receiveShadow = false;
      detail.add(mesh);
    }
    if (opts.noLod || box.isEmpty()) {
      out.add(detail);
      return out;
    }
    // silhouette: a slightly slimmed box in the model's average colour (reads fine at 30 m+)
    const size = box.getSize(new THREE.Vector3()),
      ctr = box.getCenter(new THREE.Vector3());
    const sg = new THREE.BoxGeometry(
      Math.max(0.01, size.x * 0.75),
      Math.max(0.01, size.y * 0.6),
      Math.max(0.01, size.z * 0.95),
    ).toNonIndexed();
    sg.translate(ctr.x, ctr.y, ctr.z);
    if (avgN) avg.multiplyScalar(0.85 / avgN);
    else avg.setRGB(0.1, 0.1, 0.1);
    const sc = new Float32Array(sg.attributes.position.count * 3);
    for (let i = 0; i < sc.length; i += 3) {
      sc[i] = avg.r;
      sc[i + 1] = avg.g;
      sc[i + 2] = avg.b;
    }
    sg.setAttribute("color", new THREE.BufferAttribute(sc, 3));
    const sil = new THREE.Mesh(sg, worldMat("matte"));
    sil.name = "wpn_silhouette";
    sil.castShadow = false;
    const lod = new THREE.LOD();
    lod.name = "wpn_lod";
    lod.addLevel(detail, 0);
    const far = opts.far || LOD_FAR;
    if (far > LOD_NEAR) lod.addLevel(sil, LOD_NEAR);
    lod.addLevel(new THREE.Object3D(), far);
    out.add(lod);
    return out;
  };
  P.WORLD_LOD = { near: LOD_NEAR, far: LOD_FAR, farSmall: LOD_FAR_SMALL };
