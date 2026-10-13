// play-inline-454 09 — tpl
// Lines 2250-2596 of readable/play-inline-454.pretty.js (statement-aligned).
  L.simplify = function (geo, cell, dropK) {
    const pos = geo.attributes.position,
      nor = geo.attributes.normal,
      n = pos.count;
    if (!geo.boundingBox) geo.computeBoundingBox();
    const bb = geo.boundingBox;
    const diag = Math.hypot(
      bb.max.x - bb.min.x,
      bb.max.y - bb.min.y,
      bb.max.z - bb.min.z,
    );
    if (geo.userData.keepLod) return diag > cell * 0.15 ? geo : null; // glowing bits stay as-is
    if (diag < cell * (dropK || 1.25)) return null; // tiny detail: drop
    const inv = 1 / cell;
    const map = new Map(),
      cl = new Int32Array(n);
    const acc = [];
    for (let i = 0; i < n; i++) {
      const x = pos.getX(i),
        y = pos.getY(i),
        z = pos.getZ(i),
        nx = nor.getX(i),
        ny = nor.getY(i),
        nz = nor.getZ(i);
      // the normal octant keeps front/back shells and hard creases apart
      const oct = (nx > 0 ? 1 : 0) | (ny > 0 ? 2 : 0) | (nz > 0 ? 4 : 0);
      const k =
        Math.floor(x * inv) +
        "," +
        Math.floor(y * inv) +
        "," +
        Math.floor(z * inv) +
        "," +
        oct;
      let c = map.get(k);
      if (c === undefined) {
        c = acc.length;
        map.set(k, c);
        acc.push({ rep: i, px: 0, py: 0, pz: 0, nx: 0, ny: 0, nz: 0, w: 0 });
      }
      const A = acc[c];
      A.px += x;
      A.py += y;
      A.pz += z;
      A.nx += nx;
      A.ny += ny;
      A.nz += nz;
      A.w++;
      cl[i] = c;
    }
    const src = geo.index ? geo.index.array : null;
    const tn = src ? src.length : n;
    const tris = [];
    for (let t = 0; t < tn; t += 3) {
      const a = cl[src ? src[t] : t],
        b = cl[src ? src[t + 1] : t + 1],
        c = cl[src ? src[t + 2] : t + 2];
      if (a === b || b === c || a === c) continue;
      tris.push(a, b, c);
    }
    if (tris.length < 3) return null;
    // compact used clusters
    const used = new Int32Array(acc.length).fill(-1);
    let m = 0;
    for (const c of tris) if (used[c] < 0) used[c] = m++;
    const out = new THREE.BufferGeometry();
    const P3 = new Float32Array(m * 3),
      N3 = new Float32Array(m * 3);
    const extra = ["uv", "color", "pbr", "mcls"].filter(
      (k) => geo.attributes[k],
    );
    const ex = extra.map(
      (k) => new Float32Array(m * geo.attributes[k].itemSize),
    );
    for (let c = 0; c < acc.length; c++) {
      const j = used[c];
      if (j < 0) continue;
      const A = acc[c];
      P3[j * 3] = A.px / A.w;
      P3[j * 3 + 1] = A.py / A.w;
      P3[j * 3 + 2] = A.pz / A.w;
      const l = Math.hypot(A.nx, A.ny, A.nz) || 1;
      N3[j * 3] = A.nx / l;
      N3[j * 3 + 1] = A.ny / l;
      N3[j * 3 + 2] = A.nz / l;
      extra.forEach((k, e) => {
        const at = geo.attributes[k],
          s = at.itemSize;
        for (let q = 0; q < s; q++) ex[e][j * s + q] = at.array[A.rep * s + q];
      });
    }
    out.setAttribute("position", new THREE.BufferAttribute(P3, 3));
    out.setAttribute("normal", new THREE.BufferAttribute(N3, 3));
    extra.forEach((k, e) =>
      out.setAttribute(
        k,
        new THREE.BufferAttribute(ex[e], geo.attributes[k].itemSize),
      ),
    );
    const I = new Uint32Array(tris.length);
    for (let i = 0; i < tris.length; i++) I[i] = used[tris[i]];
    out.setIndex(new THREE.BufferAttribute(I, 1));
    // carry custom skin weights (continuous limbs, faces) with the cluster representative
    const IF = geo.userData.infl;
    if (IF) {
      const idx = new Uint16Array(m * 4),
        w = new Float32Array(m * 4);
      for (let c = 0; c < acc.length; c++) {
        const j = used[c];
        if (j < 0) continue;
        const r = acc[c].rep;
        for (let q = 0; q < 4; q++) {
          idx[j * 4 + q] = IF.idx[r * 4 + q];
          w[j * 4 + q] = IF.w[r * 4 + q];
        }
      }
      out.userData.infl = { idx, w };
    }
    return out;
  };
  /** LOD level geometry for a template (1 = mid, 2 = far); built on first use. */
  L.getLod = function (tpl, level) {
    if (!level) return tpl.geometry;
    if (tpl.lods[level]) return tpl.lods[level];
    try {
      const h = (tpl.meta && tpl.meta.height) || 1.8;
      // cell size scales with the creature (min absolute size so tiny critters still simplify)
      // level 3 = "mid" for faced templates: only the dense head/face prims are
      // simplified (fine cell), the body stays as authored
      const cell =
        level === 3
          ? 0.009
          : level === 1
            ? Math.max(h * 0.03, 0.014)
            : Math.max(h * 0.075, 0.04);
      const faceBones =
        level === 3
          ? new Set(
              tpl.bones
                .map((b, i) => (b.part === "head" ? i : -1))
                .filter((i) => i >= 0),
            )
          : null;
      const prims = [];
      for (let bi = 0; bi < tpl.perBone.length; bi++) {
        for (const g of tpl.perBone[bi]) {
          if (faceBones && !faceBones.has(bi)) {
            prims.push({
              geo: g,
              bone: bi,
              part: g.userData.part || tpl.bones[bi].part,
              rigid: !!g.userData.rigid,
              keep: true,
            });
            continue;
          }
          const s = L.simplify(
            g,
            cell,
            level === 1 ? 1.25 : level === 3 ? 0.8 : 2.2,
          );
          if (s)
            prims.push({
              geo: s,
              bone: bi,
              part: g.userData.part || tpl.bones[bi].part,
              rigid: !!g.userData.rigid,
            });
        }
      }
      const geo = prims.length
        ? L.mergeSkinned(prims, tpl.bones, tpl.soft)
        : tpl.geometry;
      for (const p of prims)
        if (!p.keep && p.geo !== geo && !tpl.perBone[p.bone].includes(p.geo))
          p.geo.dispose();
      tpl.lods[level] = geo;
      tpl["lodTris" + level] = geo.index ? geo.index.count / 3 : 0;
    } catch (e) {
      tpl.lods[level] = tpl.geometry;
      if (G.reportError) G.reportError("chars.lod", e);
    }
    return tpl.lods[level];
  };

  /**
   * Geometry of a bone subtree as a plain (non-skinned) mesh, relative to
   * the subtree root bone. Used for dismemberment gibs.
   */
  L.subtreeGeometry = function (tpl, rootBone, excludeRoot) {
    const inSub = (bi) => {
      let b = bi;
      while (b >= 0) {
        if (b === rootBone) return true;
        b = tpl.bones[b].parent;
      }
      return false;
    };
    const rw = tpl.bones[rootBone].world;
    const geos = [];
    for (let bi = 0; bi < tpl.bones.length; bi++) {
      if (!inSub(bi) || (excludeRoot && bi === rootBone)) continue;
      const w = tpl.bones[bi].world;
      for (const g of tpl.perBone[bi]) {
        const c = g.clone();
        c.translate(w[0] - rw[0], w[1] - rw[1], w[2] - rw[2]);
        geos.push(c);
      }
    }
    if (!geos.length) return null;
    return L.mergePlain(geos);
  };
  /** Merge non-indexed geometries that carry position/normal/uv/color/pbr. */
  L.mergePlain = function (geos) {
    let n = 0,
      ni = 0;
    for (const g of geos) {
      n += g.attributes.position.count;
      ni += g.index ? g.index.count : g.attributes.position.count;
    }
    const names = ["position", "normal", "uv", "color", "pbr", "mcls"],
      sizes = [3, 3, 2, 3, 3, 1];
    const out = new THREE.BufferGeometry();
    names.forEach((nm, k) => {
      const arr = new Float32Array(n * sizes[k]);
      let o = 0;
      for (const g of geos) {
        const a = g.attributes[nm];
        if (a) arr.set(a.array, o);
        o += g.attributes.position.count * sizes[k];
      }
      out.setAttribute(nm, new THREE.BufferAttribute(arr, sizes[k]));
    });
    const index = n > 65535 ? new Uint32Array(ni) : new Uint16Array(ni);
    let vo = 0,
      io = 0;
    for (const g of geos) {
      const c = g.attributes.position.count;
      if (g.index) {
        const ia = g.index.array;
        for (let i = 0; i < ia.length; i++) index[io++] = ia[i] + vo;
      } else for (let i = 0; i < c; i++) index[io++] = vo + i;
      vo += c;
    }
    out.setIndex(new THREE.BufferAttribute(index, 1));
    const part = new Float32Array(n).fill(9);
    out.setAttribute("partId", new THREE.BufferAttribute(part, 1));
    for (const g of geos) g.dispose();
    out.computeBoundingSphere();
    return out;
  };

  // ------------------------------------------------------------------
  // Two-bone IK (analytic). Bones hang along -Y in bind pose; the second
  // bone bends about its local X axis. Works in world space targets.
  // ------------------------------------------------------------------
  const _t = new THREE.Vector3(),
    _pl = new THREE.Vector3(),
    _s0 = new THREE.Vector3(),
    _d = new THREE.Vector3(),
    _u = new THREE.Vector3(),
    _el = new THREE.Vector3();
  const _xA = new THREE.Vector3(),
    _yA = new THREE.Vector3(),
    _zA = new THREE.Vector3(),
    _mb = new THREE.Matrix4(),
    _inv = new THREE.Matrix4(),
    _qa = new THREE.Quaternion(),
    _qb = new THREE.Quaternion();
  /**
   * boneA (upper), boneB (lower, child of A), targetW (world pos for B's child joint = end effector),
   * poleW (world pos the joint should bend toward), lenA, lenB, weight (0..1 blend with current FK).
   * Assumes A.parent.matrixWorld is current. Updates A and B quaternions.
   */
  L.solveIK2 = function (A, B, targetW, poleW, lenA, lenB, weight) {
    const parent = A.parent;
    _inv.copy(parent.matrixWorld).invert();
    _t.copy(targetW).applyMatrix4(_inv);
    _pl.copy(poleW).applyMatrix4(_inv);
    // parent may be scaled (unlikely) — lengths are in local units already
    _s0.copy(A.position);
    _d.subVectors(_t, _s0);
    let dist = _d.length();
    const maxR = (lenA + lenB) * 0.9995,
      minR = Math.abs(lenA - lenB) + 1e-3;
    dist = clamp(dist, minR, maxR);
    if (_d.lengthSq() < 1e-10) return;
    _d.normalize();
    const cosA = clamp(
      (lenA * lenA + dist * dist - lenB * lenB) / (2 * lenA * dist),
      -1,
      1,
    );
    const sinA = Math.sqrt(1 - cosA * cosA);
    _u.subVectors(_pl, _s0);
    _u.addScaledVector(_d, -_u.dot(_d));
    if (_u.lengthSq() < 1e-8) {
      _u.set(0, 0, 1).addScaledVector(_d, -_d.z);
    }
    _u.normalize();
    _el
      .copy(_s0)
      .addScaledVector(_d, lenA * cosA)
      .addScaledVector(_u, lenA * sinA);
    // A basis: local -Y → elbow direction ; local X = bend plane normal
    _yA.subVectors(_s0, _el).normalize(); // +Y points from elbow back to shoulder
    _xA.crossVectors(_d, _u).normalize(); // normal of bend plane
    _zA.crossVectors(_xA, _yA).normalize();
    _xA.crossVectors(_yA, _zA).normalize();
    _mb.makeBasis(_xA, _yA, _zA);
    _qa.setFromRotationMatrix(_mb);
    // Forearm: angle about local X so the end reaches the target (in A space)
    // target relative to elbow, expressed in A's frame
    const tx = _t.x - _el.x,
      ty = _t.y - _el.y,
      tz = _t.z - _el.z;
    const ly = tx * _yA.x + ty * _yA.y + tz * _yA.z,
      lz = tx * _zA.x + ty * _zA.y + tz * _zA.z;
    let ang = Math.atan2(-lz, -ly);
    if (ang < -0.05) {
      // bending the wrong way: flip the bend normal
      _xA.negate();
      _zA.negate();
      _mb.makeBasis(_xA, _yA, _zA);
      _qa.setFromRotationMatrix(_mb);
      ang = -ang;
    }
    _qb.setFromAxisAngle(_xA.set(1, 0, 0), ang);
    const w = weight === undefined ? 1 : weight;
    if (w >= 0.999) {
      A.quaternion.copy(_qa);
      B.quaternion.copy(_qb);
    } else {
      A.quaternion.slerp(_qa, w);
      B.quaternion.slerp(_qb, w);
    }
  };

  // ------------------------------------------------------------------
  // Template cache
  // ------------------------------------------------------------------
  // Templates are shared by every instance built from the same (type,
  // appearance variant). The cache is an LRU capped at MAX_TEMPLATES: when a
  // new template pushes it over, the least-recently-used template with NO live
  // characters (tpl.users === 0) has its geometry (and LOD proxies) disposed.
  L.templates = new Map();
  L.MAX_TEMPLATES = 96;
