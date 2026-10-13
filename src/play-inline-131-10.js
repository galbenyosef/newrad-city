// play-inline-131 10 — opts
// Lines 2501-2836 of readable/play-inline-131.pretty.js (statement-aligned).
  function shadeGeometry(g, opts, batch, meta) {
    const p = g.attributes.position,
      n = g.attributes.normal,
      cnt = p.count;
    // --- UVs ---
    let uv = g.attributes.uv;
    const mode = opts.uv || (meta.keep ? "keep" : "box");
    if (mode === "box") {
      const s = 1 / (opts.uvScale || meta.uv || 4);
      const arr = new Float32Array(cnt * 2);
      for (let i = 0; i < cnt; i++) {
        const nx = Math.abs(n.getX(i)),
          ny = Math.abs(n.getY(i)),
          nz = Math.abs(n.getZ(i));
        const x = p.getX(i),
          y = p.getY(i),
          z = p.getZ(i);
        let u, v;
        if (ny >= nx && ny >= nz) {
          u = x;
          v = z;
        } else if (nx >= nz) {
          u = z;
          v = y;
        } else {
          u = x;
          v = y;
        }
        arr[i * 2] = u * s;
        arr[i * 2 + 1] = v * s;
      }
      g.setAttribute("uv", new THREE.BufferAttribute(arr, 2));
    } else if (mode === "keep") {
      if (!uv) {
        g.setAttribute(
          "uv",
          new THREE.BufferAttribute(new Float32Array(cnt * 2), 2),
        );
      } else if (opts.uvRect) {
        const R = opts.uvRect;
        for (let i = 0; i < cnt; i++)
          uv.setXY(
            i,
            R[0] + uv.getX(i) * (R[2] - R[0]),
            R[1] + uv.getY(i) * (R[3] - R[1]),
          );
      } else if (opts.us || opts.vs) {
        for (let i = 0; i < cnt; i++)
          uv.setXY(i, uv.getX(i) * (opts.us || 1), uv.getY(i) * (opts.vs || 1));
      }
    }
    const aoMul = g.attributes.aoMul || null;
    // --- vertex colours ---
    const col = new Float32Array(cnt * 3);
    const tint = new THREE.Color(opts.c === undefined ? 0xffffff : opts.c);
    const grime = opts.grime === undefined ? batch.grime : opts.grime;
    const ground = opts.ground === undefined ? batch.ground : opts.ground;
    const aoH = opts.aoH || batch.aoH;
    const noAO = !!opts.noAO;
    for (let i = 0; i < cnt; i++) {
      const x = p.getX(i),
        y = p.getY(i),
        z = p.getZ(i);
      let k = aoMul ? aoMul.getX(i) : 1;
      if (!noAO) {
        const hgt = y - ground;
        k *= 0.58 + 0.42 * LB.smooth(-0.2, aoH, hgt);
      }
      let gr = 0;
      if (grime > 0) {
        const blot = U.fbm2(x * 0.11 + z * 0.05 + 3.1, y * 0.13 + z * 0.09, 3);
        const streak = U.noise2((x + z) * 0.9, y * 0.02 + 7.3); // vertical streaking
        gr =
          grime *
          (Math.max(0, blot - 0.42) * 1.3 + Math.max(0, streak - 0.55) * 0.9);
        if (n.getY(i) > 0.7) gr += grime * 0.25; // dust on horizontal surfaces
        gr = Math.min(0.85, gr);
        k *=
          0.9 +
          0.2 * U.hash2(Math.floor(x * 2.3), Math.floor(z * 2.3 + y * 1.7));
      }
      const r = tint.r * k,
        gg = tint.g * k,
        b = tint.b * k;
      col[i * 3] = r * (1 - gr) + GRIME.r * gr * k;
      col[i * 3 + 1] = gg * (1 - gr) + GRIME.g * gr * k;
      col[i * 3 + 2] = b * (1 - gr) + GRIME.b * gr * k;
    }
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    if (aoMul) g.deleteAttribute("aoMul");
  }

  // -------------------------------------------------------------------
  // Organic surfaces (statues): parametric grids with welded normals
  // -------------------------------------------------------------------
  /**
   * Smooth normals across duplicated seam vertices (lathe/sphere/grid wrap seams) by accumulating
   * area-weighted face normals per rounded position. Works on indexed or non-indexed geometry.
   */
  LB.weldNormals = function (geo) {
    const p = geo.attributes.position,
      idx = geo.index,
      cnt = p.count;
    // numeric spatial hash of the rounded position (2 mm grid) → accumulator slot
    const slot = new Int32Array(cnt),
      acc = [];
    const map = new Map();
    for (let i = 0; i < cnt; i++) {
      const xi = Math.round(p.getX(i) * 500),
        yi = Math.round(p.getY(i) * 500),
        zi = Math.round(p.getZ(i) * 500);
      const k = (xi * 73856093) ^ (yi * 19349663) ^ (zi * 83492791);
      let s = map.get(k);
      if (s === undefined) {
        s = acc.length / 3;
        acc.push(0, 0, 0);
        map.set(k, s);
      }
      slot[i] = s;
    }
    const P = p.array,
      triCount = idx ? idx.count / 3 : cnt / 3,
      I = idx ? idx.array : null;
    for (let t = 0; t < triCount; t++) {
      const i0 = I ? I[t * 3] : t * 3,
        i1 = I ? I[t * 3 + 1] : t * 3 + 1,
        i2 = I ? I[t * 3 + 2] : t * 3 + 2;
      const ax = P[i0 * 3],
        ay = P[i0 * 3 + 1],
        az = P[i0 * 3 + 2];
      const e1x = P[i1 * 3] - ax,
        e1y = P[i1 * 3 + 1] - ay,
        e1z = P[i1 * 3 + 2] - az;
      const e2x = P[i2 * 3] - ax,
        e2y = P[i2 * 3 + 1] - ay,
        e2z = P[i2 * 3 + 2] - az;
      const nx = e1y * e2z - e1z * e2y,
        ny = e1z * e2x - e1x * e2z,
        nz = e1x * e2y - e1y * e2x;
      for (const i of [i0, i1, i2]) {
        const s = slot[i] * 3;
        acc[s] += nx;
        acc[s + 1] += ny;
        acc[s + 2] += nz;
      }
    }
    const nrm = new Float32Array(cnt * 3);
    for (let i = 0; i < cnt; i++) {
      const s = slot[i] * 3;
      const l = Math.hypot(acc[s], acc[s + 1], acc[s + 2]) || 1;
      nrm[i * 3] = acc[s] / l;
      nrm[i * 3 + 1] = acc[s + 1] / l;
      nrm[i * 3 + 2] = acc[s + 2] / l;
    }
    geo.setAttribute("normal", new THREE.BufferAttribute(nrm, 3));
    return geo;
  };
  /**
   * Parametric surface grid: fn(u, v, out:Vector3) → optional ao (0..1) return value.
   * u ∈ [0,1] across nu columns (wrap: column nu == column 0 → seamless normals), v ∈ [0,1] over nv rows.
   * UV = (u*us, v*vs) — choose integer us for a seamless texture wrap. Returns an indexed BufferGeometry
   * (with an `aoMul` attribute when fn returns numbers).
   */
  LB.surface = function (fn, nu, nv, opts) {
    opts = opts || {};
    const pos = new Float32Array((nu + 1) * (nv + 1) * 3),
      uvs = new Float32Array((nu + 1) * (nv + 1) * 2),
      ao = new Float32Array((nu + 1) * (nv + 1));
    const v3 = new THREE.Vector3();
    let anyAO = false;
    for (let j = 0; j <= nv; j++)
      for (let i = 0; i <= nu; i++) {
        const k = j * (nu + 1) + i,
          u = i / nu,
          v = j / nv;
        const r = fn(opts.wrap && i === nu ? 0 : u, v, v3.set(0, 0, 0));
        pos[k * 3] = v3.x;
        pos[k * 3 + 1] = v3.y;
        pos[k * 3 + 2] = v3.z;
        uvs[k * 2] = u * (opts.us || 1);
        uvs[k * 2 + 1] = v * (opts.vs || 1);
        ao[k] = typeof r === "number" ? ((anyAO = true), r) : 1;
      }
    const index = [];
    for (let j = 0; j < nv; j++)
      for (let i = 0; i < nu; i++) {
        const a = j * (nu + 1) + i,
          b = a + 1,
          c = a + nu + 1,
          d = c + 1;
        // default winding: normal = du × dv (outward for "u around (+z→+x), v up / along" parametrisations)
        if (opts.flip) index.push(a, c, b, b, c, d);
        else index.push(a, b, c, b, d, c);
      }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
    if (anyAO) g.setAttribute("aoMul", new THREE.BufferAttribute(ao, 1));
    g.setIndex(index);
    g.computeVertexNormals();
    if (opts.wrap) {
      // average the duplicated seam column (u=0 and u=1) so the wrap is invisible
      const n = g.attributes.normal;
      for (let j = 0; j <= nv; j++) {
        const a = j * (nu + 1),
          c = a + nu;
        const x = n.getX(a) + n.getX(c),
          y = n.getY(a) + n.getY(c),
          z = n.getZ(a) + n.getZ(c),
          l = Math.hypot(x, y, z) || 1;
        n.setXYZ(a, x / l, y / l, z / l);
        n.setXYZ(c, x / l, y / l, z / l);
      }
    }
    return g;
  };
  /**
   * Organic tube along a Catmull-Rom path with radius profile radius(t) (t 0..1) and an optional per-vertex
   * displacement disp(t, a) (a = angle around, returns radial offset in metres). Caps optional.
   * UV: u around (us repeats), v along (length / vScale).
   */
  LB.organicTube = function (points, radius, opts) {
    opts = opts || {};
    const curve = new THREE.CatmullRomCurve3(points, false, "catmullrom", 0.5);
    const nu = opts.radial || 12,
      nv = opts.seg || 16;
    const frames = curve.computeFrenetFrames(nv, false);
    const len = curve.getLength();
    const rowP = [];
    for (let j = 0; j <= nv; j++) rowP.push(curve.getPointAt(j / nv));
    const g = LB.surface(
      (u, v, out) => {
        const j = Math.round(v * nv),
          a = u * TAU;
        const P = rowP[j],
          N = frames.normals[j],
          B = frames.binormals[j];
        let r = radius(v, a);
        if (opts.disp) r += opts.disp(v, a);
        const ca = Math.cos(a),
          sa = Math.sin(a);
        out.set(
          P.x + (N.x * ca + B.x * sa) * r,
          P.y + (N.y * ca + B.y * sa) * r,
          P.z + (N.z * ca + B.z * sa) * r,
        );
        return opts.ao ? opts.ao(v, a) : undefined;
      },
      nu,
      nv,
      {
        wrap: true,
        flip: !!opts.flip,
        us: opts.us || 1,
        vs: Math.max(1, Math.round(len / (opts.vScale || 4))),
      },
    );
    return g;
  };

  // -------------------------------------------------------------------
  // Colliders (convention auto-detected against core's implementation)
  // -------------------------------------------------------------------
  let YAW_SIGN = null;
  function detectYawSign() {
    if (YAW_SIGN !== null) return YAW_SIGN;
    YAW_SIGN = -1; // core (v0.1) uses the opposite rotation sense to THREE's rotation.y
    try {
      const W = G.world;
      const a = 0.5;
      const probe = {
        cx: 0,
        cz: 0,
        hx: 1,
        hz: 0.05,
        cos: Math.cos(-a),
        sin: Math.sin(-a),
      };
      // point on THREE-rotated local +X axis at distance 0.9
      const px = Math.cos(a) * 0.9,
        pz = -Math.sin(a) * 0.9;
      const inPos = W.pointInCollider(probe, px, pz, 0);
      probe.cos = Math.cos(a);
      probe.sin = Math.sin(a);
      const inNeg = W.pointInCollider(probe, px, pz, 0);
      if (inPos && !inNeg) YAW_SIGN = 1;
      else if (inNeg && !inPos) YAW_SIGN = -1;
    } catch (e) {
      /* keep default */
    }
    return YAW_SIGN;
  }
  LB.colliders = [];
  /**
   * Box collider centred (cx,cz), size w (local X) × d (local Z), y0..y1, rotated like THREE rotation.y = ry.
   * opts: {surface, walkable, tag}
   */
  LB.col = function (cx, cz, w, d, y0, y1, ry, opts) {
    opts = opts || {};
    const yaw = (ry || 0) * detectYawSign();
    try {
      const c = G.world.addCollider(cx, cz, w, d, y0, y1, yaw, {
        tag: opts.tag || "landmark",
        walkable: opts.walkable !== false,
        surface: opts.surface || "concrete",
      });
      LB.colliders.push(c);
      return c;
    } catch (e) {
      return null;
    }
  };
  LB.colMM = (x0, y0, z0, x1, y1, z1, opts) =>
    LB.col(
      (x0 + x1) / 2,
      (z0 + z1) / 2,
      Math.abs(x1 - x0),
      Math.abs(z1 - z0),
      y0,
      y1,
      0,
      opts,
    );
  /** Wall collider between two XZ points (thickness t). */
  LB.colWall = function (x0, z0, x1, z1, t, y0, y1, opts) {
    const dx = x1 - x0,
      dz = z1 - z0,
      len = Math.hypot(dx, dz);
    if (len < 0.01) return null;
    const ry = Math.atan2(-dz, dx); // local X along the wall
    return LB.col((x0 + x1) / 2, (z0 + z1) / 2, len, t, y0, y1, ry, opts);
  };
  /**
   * Fill a (local-space) polygon with run-length box colliders.  poly: [[x,z],...] in the
   * frame (ox, oz, ry).  Rows every `step` metres along local Z.
   */
