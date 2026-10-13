// play-inline-74 03 — mesh
// Lines 293-634 of readable/play-inline-74.pretty.js (statement-aligned).
  function subdivide(geo, worldScale, maxEdge, budget) {
    const me2 = (maxEdge / worldScale) * (maxEdge / worldScale);
    const P0 = geo.attributes.position,
      idx = geo.index;
    const nIdx = idx ? idx.count : P0.count;
    // quick check on the original (indexed or not): anything to split?
    let need = false;
    for (let t = 0; t < nIdx && !need; t += 3) {
      for (let e = 0; e < 3; e++) {
        const i = idx ? idx.getX(t + e) : t + e,
          j = idx ? idx.getX(t + ((e + 1) % 3)) : t + ((e + 1) % 3);
        const dx = P0.getX(i) - P0.getX(j),
          dy = P0.getY(i) - P0.getY(j),
          dz = P0.getZ(i) - P0.getZ(j);
        if (dx * dx + dy * dy + dz * dz > me2) {
          need = true;
          break;
        }
      }
    }
    if (!need) return { geo: null, added: 0 };
    const src = idx ? geo.toNonIndexed() : geo;
    // position first, then every other plain float attribute
    const names = ["position"].concat(
      Object.keys(src.attributes).filter(
        (k) =>
          k !== "position" &&
          src.attributes[k].array instanceof Float32Array &&
          !src.attributes[k].isInterleavedBufferAttribute,
      ),
    );
    const attrs = names.map((k) => src.attributes[k]);
    const sizes = attrs.map((a) => a.itemSize);
    const offs = [];
    let stride = 0;
    for (const s of sizes) {
      offs.push(stride);
      stride += s;
    }
    const outs = names.map(() => []);
    let added = 0;
    function emit(tri) {
      for (let v = 0; v < 3; v++)
        for (let k = 0; k < names.length; k++) {
          const o = v * stride + offs[k],
            arr = outs[k];
          for (let c = 0; c < sizes[k]; c++) arr.push(tri[o + c]);
        }
    }
    function len2(tri, a, b) {
      const x = tri[a * stride] - tri[b * stride],
        y = tri[a * stride + 1] - tri[b * stride + 1],
        z = tri[a * stride + 2] - tri[b * stride + 2];
      return x * x + y * y + z * z;
    }
    function split(tri, depth) {
      const l0 = len2(tri, 0, 1),
        l1 = len2(tri, 1, 2),
        l2 = len2(tri, 2, 0);
      const e = l0 >= l1 && l0 >= l2 ? 0 : l1 >= l2 ? 1 : 2;
      const le = e === 0 ? l0 : e === 1 ? l1 : l2;
      if (le <= me2 || depth > 14 || added >= budget) {
        emit(tri);
        return;
      }
      const a = e,
        b = (e + 1) % 3,
        c = (e + 2) % 3;
      const t1 = new Float32Array(3 * stride),
        t2 = new Float32Array(3 * stride);
      for (let q = 0; q < stride; q++) {
        const va = tri[a * stride + q],
          vb = tri[b * stride + q],
          vc = tri[c * stride + q],
          m = (va + vb) * 0.5;
        t1[q] = va;
        t1[stride + q] = m;
        t1[2 * stride + q] = vc; // a, m, c
        t2[q] = m;
        t2[stride + q] = vb;
        t2[2 * stride + q] = vc; // m, b, c
      }
      added++;
      split(t1, depth + 1);
      split(t2, depth + 1);
    }
    const groups =
      src.groups && src.groups.length
        ? src.groups
        : [{ start: 0, count: attrs[0].count, materialIndex: 0 }];
    const newGroups = [];
    const tri = new Float32Array(3 * stride);
    for (const gr of groups) {
      const before = outs[0].length / 3;
      const end = Math.min(attrs[0].count, gr.start + gr.count);
      for (let v0 = gr.start; v0 + 2 < end; v0 += 3) {
        for (let v = 0; v < 3; v++)
          for (let k = 0; k < names.length; k++) {
            const s = sizes[k],
              arr = attrs[k].array,
              o = v * stride + offs[k];
            for (let c = 0; c < s; c++) tri[o + c] = arr[(v0 + v) * s + c];
          }
        split(tri, 0);
      }
      newGroups.push({
        start: before,
        count: outs[0].length / 3 - before,
        materialIndex: gr.materialIndex,
      });
    }
    const out = new THREE.BufferGeometry();
    names.forEach((k, i) =>
      out.setAttribute(
        k,
        new THREE.BufferAttribute(new Float32Array(outs[i]), sizes[i]),
      ),
    );
    if (out.attributes.normal) {
      const n = out.attributes.normal;
      for (let i = 0; i < n.count; i++) {
        _n.fromBufferAttribute(n, i).normalize();
        n.setXYZ(i, _n.x, _n.y, _n.z);
      }
    }
    if (src.groups && src.groups.length)
      for (const g of newGroups)
        out.addGroup(g.start, g.count, g.materialIndex);
    out.userData = Object.assign({}, geo.userData);
    if (src !== geo) src.dispose();
    return { geo: out, added };
  }

  // ------------------------------------------------------------------
  // one mesh = a resumable work item
  // ------------------------------------------------------------------
  function geoUsers(root) {
    const m = new Map();
    (root || G.scene).traverse((o) => {
      if (o.isMesh && o.geometry)
        m.set(o.geometry, (m.get(o.geometry) || 0) + 1);
    });
    return m;
  }
  function startMesh(mesh, st) {
    const opts = st.opts;
    mesh.updateWorldMatrix(true, false);
    let geo = mesh.geometry;
    let added = 0;
    if (opts.maxEdge > 0 && st.addBudget > 0) {
      try {
        const sc = mesh.matrixWorld.getMaxScaleOnAxis() || 1;
        const s = subdivide(geo, sc, opts.maxEdge, st.addBudget);
        if (s.geo) {
          geo = s.geo;
          added = s.added;
          st.addBudget -= added;
          st.added += added;
        }
      } catch (e) {
        geo = mesh.geometry;
      }
    }
    if (geo === mesh.geometry && !opts.inPlace) geo = geo.clone();
    const pos = geo.attributes.position;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    const mult = mats.some((m) => m && m.vertexColors) && geo.attributes.color;
    return {
      mesh,
      geo,
      pos,
      nor: geo.attributes.normal,
      had: mult ? geo.attributes.color : null,
      out: new Float32Array(pos.count * 3),
      i: 0,
    };
  }
  function stepMesh(w, st, t0, lim) {
    const { pos, nor, had, out } = w;
    const opts = st.opts,
      exposure = opts.exposure || 1,
      ao = opts.ao || 0,
      floorY = opts.floorY;
    const mw = w.mesh.matrixWorld;
    _m3.getNormalMatrix(mw);
    const cnt = pos.count;
    while (w.i < cnt) {
      const i = w.i++;
      _p.fromBufferAttribute(pos, i).applyMatrix4(mw);
      let n = null;
      if (nor) {
        _n.fromBufferAttribute(nor, i).applyMatrix3(_m3).normalize();
        n = _n;
      }
      irradiance(_c, _p, n, st);
      let k = exposure;
      // floor-contact darkening on walls and furniture sides (cheap stand-in for AO)
      if (ao > 0 && floorY !== undefined && n && Math.abs(n.y) < 0.6) {
        const h = Math.min(1, Math.max(0, (_p.y - floorY) / 0.9));
        k *= 1 - ao * 0.45 * (1 - h * h * (3 - 2 * h));
      }
      // down-facing surfaces (ceilings, undersides) only see bounce
      if (n && n.y < -0.5) k *= 0.85;
      let r = Math.min(2.2, _c.r * k),
        g = Math.min(2.2, _c.g * k),
        b = Math.min(2.2, _c.b * k);
      if (had) {
        r *= had.getX(i);
        g *= had.getY(i);
        b *= had.getZ(i);
      }
      out[i * 3] = r;
      out[i * 3 + 1] = g;
      out[i * 3 + 2] = b;
      if ((i & 255) === 255 && performance.now() - t0 > lim) return false;
    }
    st.verts += cnt;
    if (st.defer) st.pending.push(w);
    else applyWork(w, st);
    return true;
  }
  /** swap in the baked geometry + vertex-colour material (deferred auto bakes do a whole cell at once: one change, no popping) */
  function applyWork(w, st) {
    const mesh = w.mesh,
      old = mesh.geometry,
      out = w.out;
    if (!mesh.parent) return;
    w.geo.setAttribute("color", new THREE.BufferAttribute(out, 3));
    mesh.geometry = w.geo;
    if (
      old !== w.geo &&
      st.users &&
      (st.users.get(old) || 0) <= 1 &&
      !(old.userData && old.userData.shared)
    ) {
      try {
        old.dispose();
      } catch (e) {
        /* ignore */
      }
    }
    if (Array.isArray(mesh.material))
      mesh.material = mesh.material.map((m) =>
        skipMaterial(m) ? m : bakedMaterial(m),
      );
    else mesh.material = bakedMaterial(mesh.material);
    mesh.userData.rlBaked = true;
    st.meshes++;
  }
  function stepInstanced(mesh, st) {
    const n = mesh.count;
    for (let i = 0; i < n; i++) {
      mesh.getMatrixAt(i, _im);
      _p.setFromMatrixPosition(_im).applyMatrix4(mesh.matrixWorld);
      irradiance(_c, _p, null, st);
      _c.multiplyScalar(st.opts.exposure || 1);
      if (mesh.instanceColor) {
        mesh.getColorAt(i, _ic);
        _c.multiply(_ic);
      }
      mesh.setColorAt(i, _c);
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.userData.rlBaked = true;
    st.meshes++;
    st.verts += n;
  }

  function meshOk(m, auto) {
    if (
      !m.isMesh ||
      m.isSkinnedMesh ||
      !m.geometry ||
      !m.geometry.attributes.position ||
      m.userData.rlBaked
    )
      return false;
    if (m.morphTargetInfluences && m.morphTargetInfluences.length) return false;
    if (auto && (m.isInstancedMesh || !m.geometry.attributes.normal))
      return false;
    const mats = Array.isArray(m.material) ? m.material : [m.material];
    if (mats.every(skipMaterial)) return false;
    return true;
  }
  function makeState(root, list, opts) {
    opts = Object.assign(
      { maxEdge: 1.0, maxAddTris: 120000, maxRays: 40000 },
      opts || {},
    );
    if (opts.maxShadowVerts !== undefined) opts.maxRays = opts.maxShadowVerts; // old name
    const lights = prepLights(opts.lights);
    return {
      root,
      list,
      opts,
      lights,
      grid: lights.length > 6 ? lightGrid(lights) : null,
      o: { amb: ambientOf(opts) },
      rays: opts.maxRays,
      nRays: 0,
      visRes: 1 / (opts.visCell || 0.5),
      falloff: opts.falloff || 0.12,
      compress: opts.compress || 0,
      addBudget: opts.maxAddTris,
      added: 0,
      meshes: 0,
      verts: 0,
      li: 0,
      w: null,
      t0: performance.now(),
      busy: 0,
      users: opts.users || null,
      defer: !!opts.defer,
      pending: [],
    };
  }
  /** process a bake state for ≤ lim ms; true when finished */
  function runState(st, lim) {
    const t0 = performance.now();
    while (st.li < st.list.length) {
      if (!st.w) {
        const m = st.list[st.li];
        if (!m.parent && m !== st.root) {
          st.li++;
          continue;
        } // removed meanwhile
        if (m.isInstancedMesh) {
          stepInstanced(m, st);
          st.li++;
          continue;
        }
        st.w = startMesh(m, st);
      }
      if (stepMesh(st.w, st, t0, lim)) {
        st.w = null;
        st.li++;
      }
      if (performance.now() - t0 > lim) break;
    }
    st.busy += performance.now() - t0;
    return st.li >= st.list.length;
  }
