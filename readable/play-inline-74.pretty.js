/* src/render_lighting/30_bake.js */
/* =====================================================================
 * RENDER_LIGHTING — baked interior light ("pools of light")
 *
 * Interiors can't afford real lights (atmosphere lends 2 pooled lights to the
 * nearest fixtures), so rooms tend to look evenly grey. This bakes
 * pools of lamp light into VERTEX COLOURS: zero runtime cost,
 * one extra attribute, one program variant per material type.
 *
 * AUTOMATIC (default on; ?rlbake=0 / RL.setAutoBake(false) / userData.rlNoBake on any
 * ancestor opts out): every interior cell (LAYOUT.INTERIORS, 400 m grid east of the
 * world) is baked once — the cell the player is in first (6 ms/frame; synchronous in
 * the headless shot tool), the others in the background (1.5 ms/frame) after the probe
 * bake. Light sources are found like atmosphere's fixture scan: bright emissive lamp
 * geometry (tubes, bulbs, fire barrels…) clustered per 1.6 m. A cell with < 2 lamps
 * is left alone. Model: 72 % away from lamps, soft inverse square
 * (falloff 0.05 — high bunker ceilings still pool on the floor), overlapping lamps saturate at +0.9. Skipped: skinned/instanced/morph meshes, unlit/additive/transparent
 * materials, the lamps themselves, interactables' objects, anything tagged rlNoBake.
 *
 * EXPLICIT (interior builders, more control):
 *   G.rlight.bakeInterior(root, {
 *     lights: [{ pos:[x,y,z] | Vector3, color:0xffd9a0, intensity:1.4, range:9, shadow:true }],
 *     ambient: 0xdfe4d2,  ambientInt: 0.55,   // level away from lamps (linear tint × int)
 *     floorY: <number>,  ao: 0.7,             // darken wall bases / floor edges (0 = off)
 *     exposure: 1, maxRays: 40000,            // occlusion rays via G.world.raycast (colliders)
 *     falloff: 0.12, visCell: 0.5,            // inverse-square softness (lower = reaches further), occlusion cache cell
 *     maxEdge: 1.0, maxAddTris: 120000,       // subdivide big faces so pools actually show
 *     inPlace: false,                          // true: write into the existing geometry
 *   }) → { meshes, verts, addedTris, rays, ms }
 *   G.rlight.bakeInteriorAsync(root, opts) → job {done, result, cancel()} (≤4 ms/frame)
 *
 * Notes
 * - Colours MULTIPLY the material's own colour/texture (1 = unchanged, up to 2.2 = hot spot).
 * - Large faces are split (longest-edge bisection) to ≤ maxEdge so a 10 m floor gets ~200
 *   samples instead of 4 — the pools are real gradients, not a flat corner blend.
 * - Occlusion: 2 jittered rays per (light, 0.5 m cell, facing) — cached and averaged, so
 *   shadowed pools have soft edges instead of per-vertex triangle steps.
 * - Materials are cloned once per original (cached) with vertexColors on; originals are
 *   untouched. Geometry is replaced (the old one disposed if no other mesh used it).
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G,
    THREE = window.THREE;
  if (!G || !G.rlight || !G.rlight._) return;
  const RL = G.rlight,
    R = RL._;

  const _p = new THREE.Vector3(),
    _n = new THREE.Vector3(),
    _l = new THREE.Vector3(),
    _o = new THREE.Vector3(),
    _t = new THREE.Vector3();
  const _m3 = new THREE.Matrix3(),
    _c = new THREE.Color(),
    _ic = new THREE.Color(),
    _im = new THREE.Matrix4();
  const matCache = new WeakMap();
  const IGNORE_TAGS = ["actor", "interactable_self"];

  function toV(p) {
    return p && p.isVector3 ? p.clone() : new THREE.Vector3(p[0], p[1], p[2]);
  }
  function prepLights(list) {
    return (list || []).map((L, i) => {
      const c = new THREE.Color(L.color !== undefined ? L.color : 0xffdcaa);
      const k = L.intensity !== undefined ? L.intensity : 1.2;
      return {
        i,
        pos: toV(L.pos),
        r: c.r * k,
        g: c.g * k,
        b: c.b * k,
        range: L.range || 8,
        shadow: L.shadow !== false,
        vis: new Map(),
      };
    });
  }
  // ambient = the level away from any lamp, as a multiplier of the room's normal shading
  // (hex read as a LINEAR tint so 0xffffff·0.55 really is 55 %)
  function ambientOf(opts) {
    const c = new THREE.Color();
    c.setHex(
      opts.ambient !== undefined ? opts.ambient : 0xdfe4d2,
      THREE.LinearSRGBColorSpace,
    );
    return c.multiplyScalar(
      opts.ambientInt !== undefined ? opts.ambientInt : 0.55,
    );
  }
  function skipMaterial(m) {
    if (!m) return true;
    if (
      m.isMeshBasicMaterial ||
      m.isShaderMaterial ||
      m.isRawShaderMaterial ||
      m.isPointsMaterial ||
      m.isLineBasicMaterial ||
      m.isSpriteMaterial
    )
      return true;
    if (
      m.transparent &&
      (m.blending === THREE.AdditiveBlending || m.opacity < 0.95)
    )
      return true;
    if (
      m.emissive &&
      !m.emissiveMap &&
      (m.emissive.r + m.emissive.g + m.emissive.b) *
        (m.emissiveIntensity === undefined ? 1 : m.emissiveIntensity) >
        0.9
    )
      return true;
    return false;
  }
  function bakedMaterial(m) {
    if (m.vertexColors) return m;
    let c = matCache.get(m);
    if (!c) {
      c = m.clone();
      // Material.copy drops instance-level shader hooks and custom defines: carry them over
      const own = (k) => Object.prototype.hasOwnProperty.call(m, k);
      if (own("onBeforeCompile") && c.onBeforeCompile !== m.onBeforeCompile)
        c.onBeforeCompile = m.onBeforeCompile;
      if (
        own("customProgramCacheKey") &&
        c.customProgramCacheKey !== m.customProgramCacheKey
      )
        c.customProgramCacheKey = m.customProgramCacheKey;
      c.defines = Object.assign({}, c.defines || {}, m.defines || {}, {
        NRC_BAKED: 1,
      }); // virtual lights: pools already baked
      c.vertexColors = true;
      c.userData = Object.assign({}, m.userData, {
        rlBaked: true,
        shared: true,
      });
      matCache.set(m, c);
    }
    return c;
  }

  // ------------------------------------------------------------------
  // light lookup grid (4 m buckets) so each vertex only visits lamps in range
  // ------------------------------------------------------------------
  function lightGrid(lights) {
    const grid = new Map(),
      S = 4;
    for (const L of lights) {
      const r = L.range;
      for (
        let x = Math.floor((L.pos.x - r) / S);
        x <= Math.floor((L.pos.x + r) / S);
        x++
      )
        for (
          let y = Math.floor((L.pos.y - r) / S);
          y <= Math.floor((L.pos.y + r) / S);
          y++
        )
          for (
            let z = Math.floor((L.pos.z - r) / S);
            z <= Math.floor((L.pos.z + r) / S);
            z++
          ) {
            const k = x + "," + y + "," + z;
            let a = grid.get(k);
            if (!a) grid.set(k, (a = []));
            a.push(L);
          }
    }
    return {
      at(p) {
        return (
          grid.get(
            Math.floor(p.x / S) +
              "," +
              Math.floor(p.y / S) +
              "," +
              Math.floor(p.z / S),
          ) || null
        );
      },
    };
  }

  /** soft, cached visibility of light L from point p (normal n) */
  function lightVis(L, p, n, st) {
    if (!L.shadow || !G.world || !G.world.raycast) return 1;
    const ax = n
      ? Math.abs(n.x) > Math.abs(n.y)
        ? Math.abs(n.x) > Math.abs(n.z)
          ? n.x > 0
            ? 0
            : 1
          : n.z > 0
            ? 4
            : 5
        : Math.abs(n.y) > Math.abs(n.z)
          ? n.y > 0
            ? 2
            : 3
          : n.z > 0
            ? 4
            : 5
      : 6;
    const q = st.visRes;
    const key =
      ((Math.floor(p.x * q) & 2047) * 2048 + (Math.floor(p.z * q) & 2047)) *
        2048 +
      ((Math.floor(p.y * q) & 255) * 8 + ax);
    const hit = L.vis.get(key);
    if (hit !== undefined) return hit;
    if (st.rays <= 0) return 1;
    let v = 0;
    _o.copy(p);
    if (n) _o.addScaledVector(n, 0.08);
    for (let r = 0; r < 2; r++) {
      // two taps toward opposite sides of a ~0.3 m lamp → soft shadow edges
      _t.copy(L.pos);
      _t.x += r ? 0.15 : -0.15;
      _t.z += r ? -0.12 : 0.12;
      _l.subVectors(_t, _o);
      const d = _l.length();
      if (d < 0.3) {
        v += 1;
        continue;
      }
      _l.multiplyScalar(1 / d);
      st.rays--;
      st.nRays++;
      let occ = false;
      try {
        occ = !!G.world.raycast(_o, _l, d - 0.3, { ignoreTags: IGNORE_TAGS });
      } catch (e) {
        occ = false;
      }
      v += occ ? 0 : 1;
    }
    v = 0.12 + 0.88 * (v / 2);
    L.vis.set(key, v);
    return v;
  }

  /** irradiance multiplier (linear RGB) at a world point with a world normal */
  function irradiance(out, p, n, st) {
    const o = st.o;
    let r = o.amb.r,
      g = o.amb.g,
      b = o.amb.b;
    const list = st.grid ? st.grid.at(p) : st.lights;
    if (list)
      for (const L of list) {
        _l.subVectors(L.pos, p);
        const d2 = _l.lengthSq();
        if (d2 > L.range * L.range) continue;
        const d = Math.sqrt(d2) || 1e-3;
        _l.multiplyScalar(1 / d);
        const ndl = n ? n.dot(_l) : 1;
        if (ndl <= 0) continue;
        // windowed inverse square (smooth to 0 at range), soft near-field; half-Lambert keeps
        // walls beside a lamp from going flat
        const x = d / L.range,
          win = Math.max(0, 1 - x * x * x * x);
        let e = ((0.25 + 0.75 * ndl) * win * win) / (d2 * st.falloff + 1);
        if (e < 0.004) continue;
        e *= lightVis(L, p, n, st);
        r += L.r * e;
        g += L.g * e;
        b += L.b * e;
      }
    if (st.compress) {
      // overlapping lamps saturate instead of summing up (keeps pools, avoids a global lift)
      const k = st.compress,
        ar = o.amb.r,
        ag = o.amb.g,
        ab = o.amb.b;
      r = ar + k * (1 - Math.exp(-(r - ar) / k));
      g = ag + k * (1 - Math.exp(-(g - ag) / k));
      b = ab + k * (1 - Math.exp(-(b - ab) / k));
    }
    out.r = r;
    out.g = g;
    out.b = b;
    return out;
  }

  // ------------------------------------------------------------------
  // subdivision (longest-edge bisection) of big triangles
  // ------------------------------------------------------------------
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
  function result(st) {
    return {
      meshes: st.meshes,
      verts: st.verts,
      addedTris: st.added,
      rays: st.nRays,
      ms: Math.round(st.busy),
      lights: st.lights.length,
    };
  }
  function collect(root, auto) {
    const list = [];
    root.updateWorldMatrix(true, true);
    root.traverse((m) => {
      if (meshOk(m, auto)) list.push(m);
    });
    return list;
  }

  /** Synchronous bake of everything under root (see header). */
  RL.bakeInterior = function (root, opts) {
    if (!root) return { meshes: 0, verts: 0, addedTris: 0, rays: 0, ms: 0 };
    const st = makeState(
      root,
      collect(root, false),
      Object.assign(
        { users: geoUsers(G.scene && root !== G.scene ? G.scene : root) },
        opts || {},
      ),
    );
    runState(st, 1e9);
    return result(st);
  };
  const jobs = [];
  /** Same bake spread over frames (≤ opts.msPerFrame, default 4 ms). → {done, result, cancel()} */
  RL.bakeInteriorAsync = function (root, opts) {
    const job = {
      done: false,
      result: null,
      cancelled: false,
      cancel() {
        this.cancelled = true;
      },
    };
    if (!root) {
      job.done = true;
      return job;
    }
    job.st = makeState(
      root,
      collect(root, false),
      Object.assign({ users: geoUsers(G.scene) }, opts || {}),
    );
    job.ms = (opts && opts.msPerFrame) || 4;
    jobs.push(job);
    return job;
  };

  /** Irradiance multiplier at a point (same model as the bake): → THREE.Color */
  RL.bakedLightAt = function (pos, normal, opts) {
    const st = makeState(null, [], Object.assign({ maxRays: 64 }, opts || {}));
    return irradiance(
      new THREE.Color(),
      toV(pos),
      normal ? toV(normal).normalize() : null,
      st,
    );
  };

  // ------------------------------------------------------------------
  // AUTOMATIC interior bake
  // ------------------------------------------------------------------
  const cells = new Map(); // key → {key, origin, state:'queued'|'running'|'done'|'skipped', st, res}
  let auto = null; // current cell job
  function cellList() {
    const I = G.LAYOUT && G.LAYOUT.INTERIORS;
    if (!I) return [];
    return Object.keys(I)
      .filter((k) => I[k] && I[k].origin)
      .map((k) => ({ key: k, o: I[k].origin }));
  }
  function cellAt(x, z) {
    let best = null,
      bd = 1e18;
    for (const c of cellList()) {
      const d = (c.o.x - x) ** 2 + (c.o.z - z) ** 2;
      if (d < bd) {
        bd = d;
        best = c;
      }
    }
    return best && bd < 230 * 230 ? best : null;
  }
  function lampInfo(m) {
    if (!m || m.transparent || m.isShaderMaterial || m.isRawShaderMaterial)
      return null;
    const key = (m.userData && m.userData.mapKey) || "";
    const named =
      /@[^|]*lamp/.test(key) ||
      /(lamp|light|bulb|fixture|tube)/i.test(m.name || "");
    if (m.emissive && m.emissive.isColor) {
      const e = m.emissive,
        k = m.emissiveIntensity === undefined ? 1 : m.emissiveIntensity;
      const lum = (0.2126 * e.r + 0.7152 * e.g + 0.0722 * e.b) * k;
      if (lum >= (named ? 0.3 : 0.55) && (named || !m.emissiveMap))
        return { color: e, lum };
      return null;
    }
    if (named && m.isMeshBasicMaterial && m.color)
      return { color: m.color, lum: 1 };
    return null;
  }
  function blocked(o) {
    for (let p = o; p; p = p.parent) {
      const u = p.userData;
      if (u && (u.rlNoBake || u.actor || u.isActor || u.npc || u.dynamic))
        return true;
      if (p.name && /^(atmos|rl_)/.test(p.name)) return true;
    }
    return false;
  }
  /** gather the cell's meshes + lamp clusters (one scene traversal) */
  function prepareCell(c) {
    const ox = c.o.x,
      oz = c.o.z,
      HALF = 200;
    const skipObjs = new Set();
    try {
      for (const d of (G.world && G.world.interactables) || []) {
        const ob = d && (d.object || d.mesh || d.obj);
        if (ob && ob.isObject3D) skipObjs.add(ob);
      }
    } catch (e) {
      /* ignore */
    }
    const list = [],
      clusters = new Map();
    const box = new THREE.Box3(),
      ctr = new THREE.Vector3();
    G.scene.updateMatrixWorld(); // only dirty matrices (a forced update of the whole city cost tens of ms)
    const inCell = (o) => {
      const g = o.geometry;
      if (!g.boundingBox) g.computeBoundingBox();
      box.copy(g.boundingBox).applyMatrix4(o.matrixWorld);
      box.getCenter(ctr);
      return Math.abs(ctr.x - ox) < HALF && Math.abs(ctr.z - oz) < HALF;
    };
    const skipUnder = new Set();
    G.scene.traverse((o) => {
      if (!o.isMesh || !o.geometry || !o.geometry.attributes.position) return;
      if (!inCell(o)) return;
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      let info = null;
      for (const m of mats) {
        info = lampInfo(m);
        if (info) break;
      }
      if (info) {
        // lamp: cluster its vertices (sampled) into fixtures
        const pos = o.geometry.attributes.position,
          nor = o.geometry.attributes.normal;
        _m3.getNormalMatrix(o.matrixWorld);
        const step = Math.max(1, Math.floor(pos.count / 6000));
        for (let i = 0; i < pos.count; i += step) {
          _p.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld);
          if (nor) _n.fromBufferAttribute(nor, i).applyMatrix3(_m3).normalize();
          else _n.set(0, -1, 0);
          const k =
            Math.floor(_p.x / 1.6) +
            "," +
            Math.floor(_p.y / 1.6) +
            "," +
            Math.floor(_p.z / 1.6);
          let q = clusters.get(k);
          if (!q)
            clusters.set(
              k,
              (q = {
                n: 0,
                x: 0,
                y: 0,
                z: 0,
                nx: 0,
                ny: 0,
                nz: 0,
                r: 0,
                g: 0,
                b: 0,
                lum: 0,
                x0: 1e9,
                x1: -1e9,
                y0: 1e9,
                y1: -1e9,
                z0: 1e9,
                z1: -1e9,
              }),
            );
          q.n++;
          q.x += _p.x;
          q.y += _p.y;
          q.z += _p.z;
          q.nx += _n.x;
          q.ny += _n.y;
          q.nz += _n.z;
          q.r += info.color.r;
          q.g += info.color.g;
          q.b += info.color.b;
          q.lum += info.lum;
          if (_p.x < q.x0) q.x0 = _p.x;
          if (_p.x > q.x1) q.x1 = _p.x;
          if (_p.y < q.y0) q.y0 = _p.y;
          if (_p.y > q.y1) q.y1 = _p.y;
          if (_p.z < q.z0) q.z0 = _p.z;
          if (_p.z > q.z1) q.z1 = _p.z;
        }
        return;
      }
      if (skipObjs.has(o)) return;
      for (let p = o.parent; p; p = p.parent) if (skipObjs.has(p)) return;
      if (blocked(o) || !meshOk(o, true)) return;
      list.push(o);
    });
    const lights = [];
    for (const q of clusters.values()) {
      if (q.n < 3) continue;
      if (Math.max(q.x1 - q.x0, q.y1 - q.y0, q.z1 - q.z0) > 3.5) continue; // glowing wall panel / sign, not a fixture
      const n = q.n;
      _n.set(q.nx, q.ny, q.nz);
      if (_n.lengthSq() < 0.01 * n * n) _n.set(0, -1, 0);
      else _n.normalize();
      const col = new THREE.Color(q.r / n, q.g / n, q.b / n);
      const mx = Math.max(col.r, col.g, col.b, 1e-3);
      col.multiplyScalar(1 / mx); // hue only
      const lum = q.lum / n;
      lights.push({
        pos: [
          q.x / n + _n.x * 0.35,
          q.y / n + _n.y * 0.35,
          q.z / n + _n.z * 0.35,
        ],
        color: col,
        intensity: Math.min(1.6, 0.7 + lum * 0.5),
        range: 8 + Math.min(4, Math.sqrt(n) * 0.4),
        _w: lum * Math.sqrt(n),
        down: _n.y < -0.5,
      });
    }
    lights.sort((a, b) => b._w - a._w);
    if (lights.length > 220) lights.length = 220;
    return { list, lights };
  }
  function startCell(c) {
    let rec = cells.get(c.key);
    if (!rec) cells.set(c.key, (rec = { key: c.key, c, state: "queued" }));
    if (rec.state !== "queued") return rec;
    const t0 = performance.now();
    const { list, lights } = prepareCell(c);
    rec.lamps = lights.length;
    rec.prepMs = Math.round(performance.now() - t0);
    rec.lights = lights; // also the interior's virtual lights (50_lights.js)
    if (lights.length < 2 || !list.length) {
      rec.state = "skipped";
      return rec;
    }
    // auto bake stays close to the builders' own lighting: 85 % away from lamps, warm pools
    // big horizontal surfaces (floors, ceilings) first: they get the subdivision budget and show the pools
    const area = (m) => {
      const g = m.geometry;
      if (!g.boundingBox) g.computeBoundingBox();
      const b = g.boundingBox,
        sc = m.matrixWorld.getMaxScaleOnAxis() || 1;
      return (b.max.x - b.min.x) * (b.max.z - b.min.z) * sc * sc;
    };
    list.sort((a, b) => area(b) - area(a));
    rec.st = makeState(null, list, {
      lights,
      ambient: 0xf2efe6,
      ambientInt: 0.72,
      falloff: 0.05,
      compress: 0.9,
      ao: 0,
      maxEdge: 1.25,
      maxAddTris: G.SMOKE ? 20000 : 120000,
      maxRays: G.SMOKE ? 4000 : 60000,
      visCell: 1.0,
      defer: true,
      users: sceneUsers(),
    });
    rec.state = "running";
    return rec;
  }
  /** interior lamps of the cell at (x, z) for the virtual lights — from the bake's scan, or a
   *  lamp-only scan (once per cell) when the auto bake is off */
  const lampOnly = new Map();
  R.cellLampsAt = function (x, z) {
    const c = cellAt(x, z);
    if (!c) return null;
    const rec = cells.get(c.key);
    if (rec && rec.lights) return rec.lights;
    if (RL.autoBake && B_ready) return null; // the bake's own scan runs this frame / next
    let l = lampOnly.get(c.key);
    if (!l) {
      try {
        l = prepareCell(c).lights;
      } catch (e) {
        l = [];
      }
      lampOnly.set(c.key, l);
    }
    return l;
  };
  // geometry → user count (shared-geometry check before disposing a replaced one): one scene traversal
  // per 30 s at most, not one per cell
  let usersCache = null,
    usersAt = -1e9;
  function sceneUsers() {
    const now = performance.now();
    if (!usersCache || now - usersAt > 30000) {
      usersCache = geoUsers(G.scene);
      usersAt = now;
    }
    return usersCache;
  }
  let bgT = 0;
  /** Background baking (cells the player is NOT in) only while the game is paused in a UI — goggles,
   *  dialogue, terminal, map, menus, loading. render_perf measured 114–283 ms spikes while walking
   *  5th Ave when it ran during play: starting a cell (scene scan + lamp clustering) and subdividing a
   *  big merged mesh are not sliceable. The player's own cell still bakes in the foreground (6 ms/frame)
   *  right after the door fade. */
  function bgAllowed() {
    if (G.SMOKE || G.SHOT || G.SURVEY) return false;
    const st = G.state;
    return st !== "play" && st !== "dead" && st !== "cutscene";
  }
  function update(dt, realDt) {
    // explicit async jobs
    for (let i = jobs.length - 1; i >= 0; i--) {
      const j = jobs[i];
      if (j.cancelled) {
        jobs.splice(i, 1);
        j.done = true;
        continue;
      }
      if (runState(j.st, j.ms)) {
        j.done = true;
        j.result = result(j.st);
        jobs.splice(i, 1);
      }
    }
    if (!RL.autoBake || !B_ready || !G.scene || !G.LAYOUT || !G.world) return;
    const cam = G.camera;
    const inside = R.interior();
    const sync = !!(G.SHOT || G.SURVEY);
    try {
      // the player's cell first
      if (inside && cam) {
        const c = cellAt(cam.position.x, cam.position.z);
        if (c) {
          const rec = startCell(c);
          if (rec.state === "running") {
            if (runState(rec.st, sync ? 1e9 : 6)) finishCell(rec);
            return;
          }
        }
      }
      // background: one queued cell at a time, only while a UI pauses the game, never in the first seconds
      bgT += realDt || 0.016;
      if (sync || bgT < 4 || !bgAllowed()) return;
      let rec = null;
      for (const r of cells.values())
        if (r.state === "running") {
          rec = r;
          break;
        }
      if (!rec) {
        for (const c of cellList()) {
          const r0 = cells.get(c.key);
          if (!r0 || r0.state === "queued") {
            rec = startCell(c);
            if (rec.state === "running") break;
            rec = null;
          }
        }
      }
      if (rec && rec.state === "running" && runState(rec.st, 5))
        finishCell(rec);
    } catch (e) {
      G.reportError("update:render_lighting/autobake", e);
    }
  }
  function finishCell(rec) {
    const st = rec.st;
    for (const w of st.pending) {
      try {
        applyWork(w, st);
      } catch (e) {
        G.reportError("render_lighting/autobake-apply", e);
      }
    }
    st.pending.length = 0;
    rec.res = result(st);
    rec.state = "done";
    rec.st = null;
    G.events.emit &&
      G.events.emit("rlightInteriorBaked", { key: rec.key, result: rec.res });
  }
  let B_ready = false;
  RL.setAutoBake = function (on) {
    RL.autoBake = !!on;
    try {
      localStorage.setItem("nrc_rl_bake", on ? "1" : "0");
    } catch (e) {
      /* ignore */
    }
  };
  RL.bakeInfo = () => {
    const o = {};
    for (const r of cells.values())
      o[r.key] = {
        state: r.state,
        lamps: r.lamps,
        prepMs: r.prepMs,
        res:
          r.res ||
          (r.st ? { progress: r.st.li + "/" + r.st.list.length } : null),
      };
    return { auto: RL.autoBake, jobs: jobs.length, cells: o };
  };

  R.addSystem({
    name: "bake",
    order: 30,
    update,
    init() {
      G.events.on("initDone", () => {
        B_ready = true;
      });
    },
  });
})();
