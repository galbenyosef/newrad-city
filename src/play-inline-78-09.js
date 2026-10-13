// play-inline-78 09 — layer
// Lines 2529-2740 of readable/play-inline-78.pretty.js (statement-aligned).
  class TintView {
    constructor(buf, k) {
      this.b = buf;
      this.k = k;
    }
    reserve(a, c) {
      this.b.reserve(a, c);
    }
    v(x, y, z, nx, ny, nz, u, w, r, g, bb) {
      const k = this.k;
      return this.b.v(x, y, z, nx, ny, nz, u, w, r * k[0], g * k[1], bb * k[2]);
    }
    tri(a, b, c) {
      this.b.tri(a, b, c);
    }
    get vn() {
      return this.b.vn;
    }
    get empty() {
      return this.b.empty;
    }
  }
  /** Get the GeoBuf for material key at world (x,z) in a layer. */
  const keyInfo = new Map(); // key|layer → {key, tint, single, cs, cells: Map}
  M.buf = function (key, x, z, layer) {
    layer = layer || "main";
    const k1 = key + "|" + layer;
    let ki = keyInfo.get(k1);
    if (!ki) {
      let tint = null,
        rkey = key;
      if (!M.isIntLayer(layer)) {
        const at = key.indexOf("@");
        const base = at >= 0 ? key.slice(0, at) : key;
        const rm = M.REMAP[base];
        if (rm) {
          rkey = rm[0] + (at >= 0 ? key.slice(at) : "");
          tint = rm[1];
        }
      }
      ki = {
        key: rkey,
        tint,
        single: isSingle(layer),
        cs: layer === "imp" ? M.CELL : M.CHUNK,
        cells: new Map(),
      };
      keyInfo.set(k1, ki);
    }
    const cx = ki.single ? 0 : Math.floor(x / ki.cs),
      cz = ki.single ? 0 : Math.floor(z / ki.cs);
    const ck = (cx + 512) * 4096 + (cz + 512);
    let view = ki.cells.get(ck);
    if (!view) {
      const k = ki.key + "|" + layer + "|" + cx + "|" + cz;
      let e = chunkMap.get(k);
      if (!e) {
        e = { key: ki.key, layer, cx, cz, buf: new GeoBuf() };
        chunkMap.set(k, e);
      }
      view = ki.tint ? new TintView(e.buf, ki.tint) : e.buf;
      ki.cells.set(ck, view);
    }
    return view;
  };
  // Materials that should not cast shadows (flat ground, decals, glass, emissive…)
  const NO_CAST =
    /^(asphalt|sidewalk|grass_dead|dirt|water|my\/markings|decal|my\/streetsigns|my\/billboards|glass|emissive|neon|bb\/)|@(base|plate|decal|glow|lamp|fwd)/;
  const CAST =
    /^(facade\/|stone_limestone|brick_red|concrete|granite|wood_rotten|rust|metal_painted|corrugated|rubble|cryo_wall|my\/rock|my\/bark)/;
  M.roots = {};
  M.lodGroups = [];
  M.flushStats = {};
  /** Turn all accumulated buffers into meshes. Returns stats. */
  M.flush = function () {
    return flushImpl(null);
  };
  /** Same as flush, but awaits yieldFn() every ~40 ms so boot can repaint (the loading screen keeps animating). */
  M.flushAsync = function (yieldFn) {
    return flushImpl(yieldFn);
  };
  function flushImpl(yieldFn) {
    const city = M.roots.city || (M.roots.city = new THREE.Group());
    city.name = "map_city";
    const groups = new Map();
    let meshes = 0,
      tris = 0;
    const entries = Array.from(chunkMap.values());
    const run = (i0, t0) => {
      for (let i = i0; i < entries.length; i++) {
        if (yieldFn && performance.now() - t0 > 40) return i;
        one(entries[i]);
      }
      return -1;
    };
    const one = (e) => {
      if (e.buf.empty) return;
      const geo = e.buf.toGeometry();
      const mat = M.mat(e.key);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.name = "map:" + e.key + ":" + e.layer;
      mesh.matrixAutoUpdate = false;
      mesh.updateMatrix();
      // shadow casters: only the big masses in the main/mid/interior layers (the shadow pass costs a draw call per mesh)
      const cast =
        (e.layer === "main" || e.layer === "mid" || !!START_LAYERS[e.layer]) &&
        CAST.test(e.key) &&
        !NO_CAST.test(e.key) &&
        !mat.transparent;
      mesh.castShadow = cast && e.layer !== "subway";
      mesh.receiveShadow =
        !mat.transparent && e.layer !== "far" && e.layer !== "imp";
      if (mat.transparent) mesh.renderOrder = 2;
      tris += geo.index.count / 3;
      meshes++;
      const sk = e.key + ":" + e.layer;
      M.flushStats[sk] = (M.flushStats[sk] || 0) + geo.index.count / 3;
      let parent;
      if (M.isIntLayer(e.layer)) {
        parent = M.roots[e.layer] || (M.roots[e.layer] = new THREE.Group());
        parent.name = "map_" + e.layer;
      } else {
        const gk = e.layer + "|" + e.cx + "|" + e.cz;
        parent = groups.get(gk);
        if (!parent) {
          parent = new THREE.Group();
          parent.name = "chunk_" + gk;
          parent.matrixAutoUpdate = false;
          groups.set(gk, parent);
          city.add(parent);
          if (!isSingle(e.layer)) {
            const cs = e.layer === "imp" ? M.CELL : M.CHUNK;
            const cxw = (e.cx + 0.5) * cs,
              czw = (e.cz + 0.5) * cs;
            M.lodGroups.push({
              g: parent,
              layer: e.layer,
              x: cxw,
              z: czw,
              cellX: (Math.floor(cxw / M.CELL) + 0.5) * M.CELL,
              cellZ: (Math.floor(czw / M.CELL) + 0.5) * M.CELL,
            });
          }
        }
      }
      parent.add(mesh);
    };
    const done = () => {
      chunkMap.clear();
      keyInfo.clear();
      return { meshes, tris: Math.round(tris) };
    };
    if (!yieldFn) {
      run(0, 0);
      return done();
    }
    return (async () => {
      let i = 0;
      while ((i = run(i, performance.now())) >= 0) await yieldFn();
      return done();
    })();
  }
  /** Update HLOD visibility from the camera position (called ~5×/s). */
  M.updateLOD = function (cam) {
    const R2 = M.R_NEAR * M.R_NEAR;
    for (const l of M.lodGroups) {
      const cdx = l.cellX - cam.x,
        cdz = l.cellZ - cam.z;
      const nearCell = cdx * cdx + cdz * cdz <= R2;
      let vis;
      if (l.layer === "imp") vis = !nearCell;
      else if (l.layer === "main") vis = nearCell;
      else {
        const lod = M.LAYER_LOD[l.layer] || 1e9;
        const dx = l.x - cam.x,
          dz = l.z - cam.z;
        vis = dx * dx + dz * dz < lod * lod && (l.layer === "mid" || nearCell);
      }
      l.g.visible = vis;
    }
  };

  // -------------------------------------------------------------------
  // Collider helpers (thin wrappers; everything goes through G.world)
  // -------------------------------------------------------------------
  M.colliders = [];
  M.box3 = function (x0, y0, z0, x1, y1, z1, opts) {
    const c = G.world.addBox(
      Math.min(x0, x1),
      y0,
      Math.min(z0, z1),
      Math.max(x0, x1),
      y1,
      Math.max(z0, z1),
      opts,
    );
    M.colliders.push(c);
    return c;
  };
  /**
   * Oriented collider using THREE's yaw convention (same as M.obox / M.mtx:
   * local +X → world (cos y, 0, -sin y)). The engine's collider yaw rotates
   * the opposite way, so we negate here. w = local X size, d = local Z size.
   */
  M.ocol = function (cx, cz, w, d, y0, y1, yaw, opts) {
    const c = G.world.addCollider(cx, cz, w, d, y0, y1, -(yaw || 0), opts);
    M.colliders.push(c);
    return c;
  };

  // Utility: point in polygon (array of [x,z])
  M.inPoly = (x, z, poly) => G.LAYOUT.pointInPoly(x, z, poly);
