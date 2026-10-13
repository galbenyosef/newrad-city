// play-inline-454 05 — opts
// Lines 1286-1636 of readable/play-inline-454.pretty.js (statement-aligned).
  P.xf = function (geo, x, y, z, rx, ry, rz, sx, sy, sz) {
    _p.set(x || 0, y || 0, z || 0);
    _e.set(rx || 0, ry || 0, rz || 0, "XYZ");
    _q.setFromEuler(_e);
    if (sx === undefined) sx = 1;
    if (sy === undefined) {
      sy = sx;
      sz = sx;
    }
    if (sz === undefined) sz = 1;
    _s.set(sx, sy, sz);
    _m4.compose(_p, _q, _s);
    geo.applyMatrix4(_m4);
    return geo;
  };
  P.sphere = function (
    rx,
    ry,
    rz,
    ws,
    hs,
    phiStart,
    phiLen,
    thetaStart,
    thetaLen,
  ) {
    const g = new THREE.SphereGeometry(
      1,
      ws || 12,
      hs || 9,
      phiStart || 0,
      phiLen === undefined ? Math.PI * 2 : phiLen,
      thetaStart || 0,
      thetaLen === undefined ? Math.PI : thetaLen,
    );
    g.scale(rx, ry === undefined ? rx : ry, rz === undefined ? rx : rz);
    return g;
  };
  /**
   * Partial sphere shell centred on the FRONT (-Z) of the character.
   * (three.js SphereGeometry puts phi=0 at -X, π/2 at +Z, π at +X and
   * 1.5π at -Z, so a front-facing arc must be centred on phi = 1.5π.)
   * arc: horizontal coverage (radians); thetaStart/thetaLen: vertical band from the top.
   */
  P.shell = function (rx, ry, rz, ws, hs, arc, thetaStart, thetaLen) {
    return P.sphere(
      rx,
      ry,
      rz,
      ws,
      hs,
      Math.PI * 1.5 - arc / 2,
      arc,
      thetaStart || 0,
      thetaLen === undefined ? Math.PI : thetaLen,
    );
  };
  /** Rounded (bevelled) box centred at origin. */
  P.box = function (w, h, d, r, seg) {
    seg = seg || 2;
    r = Math.min(
      r === undefined ? Math.min(w, h, d) * 0.15 : r,
      w / 2 - 1e-4,
      h / 2 - 1e-4,
      d / 2 - 1e-4,
    );
    const g = new THREE.BoxGeometry(w, h, d, seg * 2, seg * 2, seg * 2);
    if (r <= 0.0005) return g;
    const pos = g.attributes.position,
      nor = g.attributes.normal;
    const hx = w / 2 - r,
      hy = h / 2 - r,
      hz = d / 2 - r;
    const v = new THREE.Vector3(),
      inner = new THREE.Vector3(),
      n = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      inner.set(clamp(v.x, -hx, hx), clamp(v.y, -hy, hy), clamp(v.z, -hz, hz));
      n.subVectors(v, inner);
      if (n.lengthSq() < 1e-12) n.fromBufferAttribute(nor, i);
      else n.normalize();
      v.copy(inner).addScaledVector(n, r);
      pos.setXYZ(i, v.x, v.y, v.z);
      nor.setXYZ(i, n.x, n.y, n.z);
    }
    return g;
  };
  P.cyl = function (rt, rb, h, seg, open, hs) {
    return new THREE.CylinderGeometry(rt, rb, h, seg || 10, hs || 1, !!open);
  };
  P.cone = function (r, h, seg) {
    return new THREE.ConeGeometry(r, h, seg || 8);
  };
  P.torus = function (R, r, rs, ts, arc) {
    return new THREE.TorusGeometry(
      R,
      r,
      rs || 6,
      ts || 16,
      arc === undefined ? Math.PI * 2 : arc,
    );
  };
  P.lathe = function (pts, seg, phiStart, phiLen) {
    return new THREE.LatheGeometry(
      pts.map((p) => new THREE.Vector2(Math.max(0, p[0]), p[1])),
      seg || 12,
      phiStart || 0,
      phiLen === undefined ? Math.PI * 2 : phiLen,
    );
  };
  /**
   * Tapered capsule-ish limb hanging from y=0 down to y=-len.
   * r0: radius at top joint, r1: radius at bottom; opts.bulge (mid radius add),
   * opts.bulgeAt (0..1 from top), opts.flat (z scale), opts.seg.
   */
  P.limb = function (len, r0, r1, opts) {
    opts = opts || {};
    const seg = opts.seg || 10;
    const bul = opts.bulge || 0,
      ba = opts.bulgeAt === undefined ? 0.35 : opts.bulgeAt;
    const pts = [];
    const capB = opts.capB === undefined ? r1 * 0.9 : opts.capB,
      capT = opts.capT === undefined ? r0 * 0.9 : opts.capT;
    // bottom hemisphere-ish
    for (let i = 0; i <= 3; i++) {
      const a = ((i / 3) * Math.PI) / 2;
      pts.push([Math.sin(a) * r1, -len - Math.cos(a) * capB + capB * 0.15]);
    }
    const N = 6;
    for (let i = 1; i < N; i++) {
      const t = i / N; // 0 bottom → 1 top
      let r = lerp(r1, r0, t);
      const fromTop = 1 - t;
      r += bul * Math.exp(-Math.pow((fromTop - ba) / 0.28, 2));
      pts.push([r, -len + len * t]);
    }
    for (let i = 0; i <= 3; i++) {
      const a = ((1 - i / 3) * Math.PI) / 2;
      pts.push([Math.sin(a) * r0, Math.cos(a) * capT - capT * 0.15]);
    }
    // lathe requires increasing path; make sure first/last x = 0
    pts[0][0] = 0;
    pts[pts.length - 1][0] = 0;
    const g = P.lathe(pts, seg);
    if (opts.flat) g.scale(1, 1, opts.flat);
    if (opts.wide) g.scale(opts.wide, 1, 1);
    return g;
  };
  /**
   * Loft of super-ellipse rings (bodies, torsos, helmets, armour plates).
   * rings: [{y, rx, rz, ox=0, oz=0, n=2.2}] bottom→top.
   * opts: {seg=16, a0, a1 (partial angle range, 0 = front/-Z, +π/2 = +X), capTop, capBottom, flip}
   */
  P.loft = function (rings, opts) {
    opts = opts || {};
    const seg = opts.seg || 16;
    const partial = opts.a0 !== undefined;
    const a0 = partial ? opts.a0 : 0,
      a1 = partial ? opts.a1 : Math.PI * 2;
    const cols = seg + 1,
      rows = rings.length;
    const pos = [],
      uv = [],
      idx = [];
    const spow = (v, e) => Math.sign(v) * Math.pow(Math.abs(v), e);
    for (let j = 0; j < rows; j++) {
      const R = rings[j];
      const e = 2 / (R.n || 2.2);
      for (let i = 0; i < cols; i++) {
        const a = a0 + (a1 - a0) * (i / seg);
        const x = (R.ox || 0) + R.rx * spow(Math.sin(a), e);
        const z = (R.oz || 0) - R.rz * spow(Math.cos(a), e);
        pos.push(x, R.y, z);
        uv.push(i / seg, j / (rows - 1));
      }
    }
    for (let j = 0; j < rows - 1; j++)
      for (let i = 0; i < seg; i++) {
        const a = j * cols + i,
          b = a + 1,
          c = a + cols,
          d = c + 1;
        // CCW when viewed from outside
        if (opts.flip) idx.push(a, b, c, b, d, c);
        else idx.push(a, c, b, b, c, d);
      }
    const addCap = (j, top) => {
      const R = rings[j];
      const center = pos.length / 3;
      pos.push(
        R.ox || 0,
        R.y + (top ? opts.capTopRaise || 0 : -(opts.capBottomDrop || 0)),
        R.oz || 0,
      );
      uv.push(0.5, top ? 1 : 0);
      for (let i = 0; i < seg; i++) {
        const a = j * cols + i,
          b = a + 1;
        if (top !== !!opts.flip) idx.push(center, b, a);
        else idx.push(center, a, b);
      }
    };
    if (opts.capTop) addCap(rows - 1, true);
    if (opts.capBottom) addCap(0, false);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  };
  /**
   * Sweep a circle along a Catmull-Rom path with a radius profile — horns,
   * claws, tails, hoses, antennae, spikes, teeth.
   * pts: [[x,y,z]...]; radius: number | fn(t 0..1) ; opts {seg (tubular), rs (radial), cap}
   */
  P.sweep = function (pts, radius, opts) {
    opts = opts || {};
    const curve = new THREE.CatmullRomCurve3(
      pts.map((p) => new THREE.Vector3(p[0], p[1], p[2])),
    );
    const tSeg = opts.seg || 10,
      rs = opts.rs || 6;
    const frames = curve.computeFrenetFrames(tSeg, false);
    const pos = [],
      uv = [],
      idx = [];
    const rf = typeof radius === "function" ? radius : () => radius;
    for (let i = 0; i <= tSeg; i++) {
      const t = i / tSeg;
      const P0 = curve.getPointAt(t);
      const N = frames.normals[i],
        B = frames.binormals[i];
      const r = rf(t);
      for (let k = 0; k <= rs; k++) {
        const a = (k / rs) * Math.PI * 2;
        const cx = Math.cos(a),
          sy = Math.sin(a);
        pos.push(
          P0.x + r * (cx * N.x + sy * B.x),
          P0.y + r * (cx * N.y + sy * B.y),
          P0.z + r * (cx * N.z + sy * B.z),
        );
        uv.push(k / rs, t);
      }
    }
    const cols = rs + 1;
    for (let i = 0; i < tSeg; i++)
      for (let k = 0; k < rs; k++) {
        const a = i * cols + k,
          b = a + 1,
          c = a + cols,
          d = c + 1;
        idx.push(a, b, c, b, d, c);
      }
    if (opts.cap !== false) {
      // cap start
      const p0 = curve.getPointAt(0),
        s = pos.length / 3;
      pos.push(p0.x, p0.y, p0.z);
      uv.push(0.5, 0);
      for (let k = 0; k < rs; k++) idx.push(s, k + 1, k);
      const p1 = curve.getPointAt(1),
        e = pos.length / 3,
        base = tSeg * cols;
      pos.push(p1.x, p1.y, p1.z);
      uv.push(0.5, 1);
      for (let k = 0; k < rs; k++) idx.push(e, base + k, base + k + 1);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  };
  /** Extruded 2D shape (x,y points) with depth along z, centred on z. */
  P.extrude = function (pts2, depth, bevel) {
    const sh = new THREE.Shape(pts2.map((p) => new THREE.Vector2(p[0], p[1])));
    const g = new THREE.ExtrudeGeometry(sh, {
      depth,
      bevelEnabled: !!bevel,
      bevelSize: bevel || 0,
      bevelThickness: bevel || 0,
      bevelSegments: 1,
      curveSegments: 6,
    });
    g.translate(0, 0, -depth / 2);
    // ExtrudeGeometry UVs are in shape units — normalise to 0..1
    const uv = g.attributes.uv;
    if (uv) {
      let mx = 1e-6;
      for (let i = 0; i < uv.count; i++)
        mx = Math.max(mx, Math.abs(uv.getX(i)), Math.abs(uv.getY(i)));
      for (let i = 0; i < uv.count; i++)
        uv.setXY(
          i,
          (uv.getX(i) / mx) * 0.5 + 0.5,
          (uv.getY(i) / mx) * 0.5 + 0.5,
        );
    }
    return g;
  };
  /** A plane facing -Z (the character's forward) — decals on chests etc. */
  P.decal = function (w, h) {
    const g = new THREE.PlaneGeometry(w, h);
    g.rotateY(Math.PI);
    return g;
  };
  /** Deform vertices: fn(v:Vector3) mutates v. Recomputes normals. */
  P.deform = function (geo, fn) {
    const pos = geo.attributes.position;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      fn(v, i);
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    geo.computeVertexNormals();
    return geo;
  };
  /** Mirror a geometry across X (for left/right parts) — flips winding. */
  P.mirrorX = function (geo) {
    geo.scale(-1, 1, 1);
    const idx = geo.index;
    if (idx) {
      for (let i = 0; i < idx.count; i += 3) {
        const a = idx.getX(i + 1);
        idx.setX(i + 1, idx.getX(i + 2));
        idx.setX(i + 2, a);
      }
    } else {
      for (const name in geo.attributes) {
        const at = geo.attributes[name];
        const s = at.itemSize;
        for (let i = 0; i < at.count; i += 3)
          for (let k = 0; k < s; k++) {
            const t = at.array[(i + 1) * s + k];
            at.array[(i + 1) * s + k] = at.array[(i + 2) * s + k];
            at.array[(i + 2) * s + k] = t;
          }
      }
    }
    geo.computeVertexNormals();
    return geo;
  };

  // ------------------------------------------------------------------
  // RIG BUILDER
  // ------------------------------------------------------------------
