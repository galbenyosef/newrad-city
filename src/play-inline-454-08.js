// play-inline-454 08 — geo
// Lines 2015-2249 of readable/play-inline-454.pretty.js (statement-aligned).
  L.Rig = Rig;

  /**
   * Merge bone-local prims [{geo, bone, part}] into ONE rigidly skinned
   * geometry (bind pose). Used for the full mesh and the LOD proxies.
   */
  L.mergeSkinned = function (prims, bones, soft) {
    let n = 0,
      ni = 0;
    for (const p of prims) {
      n += p.geo.attributes.position.count;
      ni += p.geo.index ? p.geo.index.count : p.geo.attributes.position.count;
    }
    const pos = new Float32Array(n * 3),
      nor = new Float32Array(n * 3),
      uv = new Float32Array(n * 2),
      col = new Float32Array(n * 3);
    const pbr = new Float32Array(n * 3),
      part = new Float32Array(n),
      cls = new Float32Array(n),
      si = new Uint16Array(n * 4),
      sw = new Float32Array(n * 4);
    const index = n > 65535 ? new Uint32Array(ni) : new Uint16Array(ni);
    // soft-joint lookup: for each bone, the soft joints touching it
    // ({joint bone, other bone, origin offset in this bone's space, axis, sign})
    const touch = bones.map(() => []);
    if (soft) {
      for (let c = 0; c < bones.length; c++) {
        const J = soft[c];
        if (!J) continue;
        const pb = bones[c].parent;
        if (pb < 0) continue;
        // on the child: joint at its own origin, blend toward the parent below along<0
        touch[c].push({ other: pb, ox: 0, oy: 0, oz: 0, J, toChild: false });
        // on the parent: joint at the child's origin, blend toward the child for along>0
        const cp = bones[c].pos;
        touch[pb].push({
          other: c,
          ox: cp[0],
          oy: cp[1],
          oz: cp[2],
          J,
          toChild: true,
        });
      }
    }
    const ss = (a, b, x) => {
      const t = clamp((x - a) / (b - a), 0, 1);
      return t * t * (3 - 2 * t);
    };
    const inf = [0, 0, 0, 0, 0, 0]; // up to 3 extra influences: bone, weight pairs
    let o = 0,
      io = 0;
    for (const p of prims) {
      const g = p.geo,
        c = g.attributes.position.count,
        w = bones[p.bone].world;
      const gp = g.attributes.position.array,
        gn = g.attributes.normal.array,
        gu = g.attributes.uv.array,
        gc = g.attributes.color.array,
        gb = g.attributes.pbr.array;
      const gm = g.attributes.mcls ? g.attributes.mcls.array : null;
      const pid = PART_IDS[p.part] === undefined ? 9 : PART_IDS[p.part];
      const T =
        p.rigid || (g.userData && g.userData.rigid) ? null : touch[p.bone];
      for (let i = 0; i < c; i++) {
        const k = o + i;
        const lx = gp[i * 3],
          ly = gp[i * 3 + 1],
          lz = gp[i * 3 + 2];
        pos[k * 3] = lx + w[0];
        pos[k * 3 + 1] = ly + w[1];
        pos[k * 3 + 2] = lz + w[2];
        nor[k * 3] = gn[i * 3];
        nor[k * 3 + 1] = gn[i * 3 + 1];
        nor[k * 3 + 2] = gn[i * 3 + 2];
        uv[k * 2] = gu[i * 2];
        uv[k * 2 + 1] = gu[i * 2 + 1];
        col[k * 3] = gc[i * 3];
        col[k * 3 + 1] = gc[i * 3 + 1];
        col[k * 3 + 2] = gc[i * 3 + 2];
        pbr[k * 3] = gb[i * 3];
        pbr[k * 3 + 1] = gb[i * 3 + 1];
        pbr[k * 3 + 2] = gb[i * 3 + 2];
        part[k] = pid;
        cls[k] = gm ? gm[i] : 0;
        si[k * 4] = p.bone;
        sw[k * 4] = 1;
        const IF = g.userData && g.userData.infl;
        if (IF) {
          for (let q = 0; q < 4; q++) {
            si[k * 4 + q] = IF.idx[i * 4 + q];
            sw[k * 4 + q] = IF.w[i * 4 + q];
          }
          continue;
        }
        if (!T || !T.length) continue;
        let m = 0,
          sum = 0;
        for (let q = 0; q < T.length && m < 3; q++) {
          const t = T[q],
            J = t.J;
          const vx = lx - t.ox,
            vy = ly - t.oy,
            vz = lz - t.oz;
          const along = vx * J.axis[0] + vy * J.axis[1] + vz * J.axis[2];
          if (along < -J.r || along > J.r) {
            if (t.toChild ? along < -J.r : along > J.r) continue;
          }
          const rx = vx - along * J.axis[0],
            ry = vy - along * J.axis[1],
            rz = vz - along * J.axis[2];
          const rr = Math.sqrt(rx * rx + ry * ry + rz * rz);
          const fall = 1 - ss(J.reach * 0.7, J.reach * 1.2, rr);
          if (fall <= 0) continue;
          const wt =
            (t.toChild ? ss(-J.r, J.r, along) : 1 - ss(-J.r, J.r, along)) *
            fall;
          if (wt < 0.01) continue;
          inf[m * 2] = t.other;
          inf[m * 2 + 1] = wt;
          sum += wt;
          m++;
        }
        if (!m) continue;
        const sc = sum > 1 ? 1 / sum : 1;
        sw[k * 4] = Math.max(0, 1 - sum * sc);
        for (let q = 0; q < m; q++) {
          si[k * 4 + 1 + q] = inf[q * 2];
          sw[k * 4 + 1 + q] = inf[q * 2 + 1] * sc;
        }
      }
      if (g.index) {
        const ia = g.index.array;
        for (let i = 0; i < ia.length; i++) index[io++] = ia[i] + o;
      } else for (let i = 0; i < c; i++) index[io++] = o + i;
      o += c;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
    geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
    geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
    geo.setAttribute("pbr", new THREE.BufferAttribute(pbr, 3));
    geo.setAttribute("partId", new THREE.BufferAttribute(part, 1));
    geo.setAttribute("mcls", new THREE.BufferAttribute(cls, 1));
    geo.setAttribute("skinIndex", new THREE.Uint16BufferAttribute(si, 4));
    geo.setAttribute("skinWeight", new THREE.BufferAttribute(sw, 4));
    geo.setIndex(new THREE.BufferAttribute(index, 1));
    geo.computeBoundingBox();
    geo.computeBoundingSphere();
    geo.userData.sharedCharGeo = true;
    return geo;
  };

  // ------------------------------------------------------------------
  // Open-surface detection & inner shells (enables back-face culling)
  // ------------------------------------------------------------------
  const _qk = (x, y, z) =>
    Math.round(x * 2e4) + "," + Math.round(y * 2e4) + "," + Math.round(z * 2e4);
  /** True if the (welded) surface has boundary edges, i.e. you could see inside it. */
  L.isOpen = function (geo) {
    const pos = geo.attributes.position,
      n = pos.count;
    const ids = new Int32Array(n),
      weld = new Map();
    for (let i = 0; i < n; i++) {
      const k = _qk(pos.getX(i), pos.getY(i), pos.getZ(i));
      let id = weld.get(k);
      if (id === undefined) {
        id = weld.size;
        weld.set(k, id);
      }
      ids[i] = id;
    }
    const idx = geo.index ? geo.index.array : null;
    const tn = idx ? idx.length : n;
    const edges = new Map();
    const W = weld.size + 1;
    const addE = (a, b) => {
      if (a === b) return;
      const k = a < b ? a * W + b : b * W + a;
      edges.set(k, (edges.get(k) || 0) + 1);
    };
    for (let t = 0; t < tn; t += 3) {
      const a = ids[idx ? idx[t] : t],
        b = ids[idx ? idx[t + 1] : t + 1],
        c = ids[idx ? idx[t + 2] : t + 2];
      if (a === b || b === c || a === c) continue;
      addE(a, b);
      addE(b, c);
      addE(c, a);
    }
    for (const v of edges.values()) if (v === 1) return true;
    return false;
  };
  /** Append a reversed copy (flipped normals & winding) of the surface. */
  L.doubleSided = function (geo) {
    const g = geo.index ? geo : geo; // indexed or not, handled below
    const n = g.attributes.position.count;
    const out = new THREE.BufferGeometry();
    for (const name of Object.keys(g.attributes)) {
      const a = g.attributes[name],
        s = a.itemSize;
      const arr = new Float32Array(n * 2 * s);
      arr.set(a.array.subarray ? a.array.subarray(0, n * s) : a.array);
      arr.set(a.array.subarray ? a.array.subarray(0, n * s) : a.array, n * s);
      if (name === "normal")
        for (let i = n * s; i < n * 2 * s; i++) arr[i] = -arr[i];
      out.setAttribute(name, new THREE.BufferAttribute(arr, s));
    }
    const src = g.index ? g.index.array : null;
    const tn = src ? src.length : n;
    const idx = new Uint32Array(tn * 2);
    for (let t = 0; t < tn; t += 3) {
      const a = src ? src[t] : t,
        b = src ? src[t + 1] : t + 1,
        c = src ? src[t + 2] : t + 2;
      idx[t] = a;
      idx[t + 1] = b;
      idx[t + 2] = c;
      idx[tn + t] = a + n;
      idx[tn + t + 1] = c + n;
      idx[tn + t + 2] = b + n;
    }
    out.setIndex(new THREE.BufferAttribute(idx, 1));
    geo.dispose();
    return out;
  };

  // ------------------------------------------------------------------
  // LOD proxies: vertex-clustering simplification per prim (same skeleton,
  // so the SkinnedMesh just swaps geometry at distance — free).
  // ------------------------------------------------------------------
