// play-inline-225 06 — three
// Lines 1265-1599 of readable/play-inline-225.pretty.js (statement-aligned).
  function tessellate(g, maxE) {
    const pos = g.attributes.position,
      n = pos.count;
    if (n < 3) return g;
    const pa = pos.array,
      m2 = maxE * maxE;
    let need = false,
      area = 0;
    for (let t = 0; t < n; t += 3) {
      const i = t * 3;
      const e0 =
        (pa[i] - pa[i + 3]) ** 2 +
        (pa[i + 1] - pa[i + 4]) ** 2 +
        (pa[i + 2] - pa[i + 5]) ** 2;
      const e1 =
        (pa[i + 3] - pa[i + 6]) ** 2 +
        (pa[i + 4] - pa[i + 7]) ** 2 +
        (pa[i + 5] - pa[i + 8]) ** 2;
      const e2 =
        (pa[i + 6] - pa[i]) ** 2 +
        (pa[i + 7] - pa[i + 1]) ** 2 +
        (pa[i + 8] - pa[i + 2]) ** 2;
      if (e0 > m2 || e1 > m2 || e2 > m2) need = true;
      _a.set(pa[i + 3] - pa[i], pa[i + 4] - pa[i + 1], pa[i + 5] - pa[i + 2]);
      _b.set(pa[i + 6] - pa[i], pa[i + 7] - pa[i + 1], pa[i + 8] - pa[i + 2]);
      area += _a.cross(_b).length() / 2;
    }
    if (!need) return g;
    const est = area / (m2 * 0.3);
    if (est > 24000) {
      maxE *= Math.sqrt(est / 24000);
    }
    const lim = maxE * maxE;
    const names = ["position"].concat(
        Object.keys(g.attributes).filter((k) => k !== "position"),
      ),
      srcs = names.map((k) => g.attributes[k]),
      sizes = srcs.map((a) => a.itemSize);
    const outs = names.map(() => []);
    const stack = [];
    for (let t = 0; t < n; t += 3) {
      // a triangle = array of 3 vertex records (each: array of attribute tuples)
      const tri = [0, 1, 2].map((k) =>
        srcs.map((a, ai) =>
          Array.from(
            a.array.subarray((t + k) * sizes[ai], (t + k + 1) * sizes[ai]),
          ),
        ),
      );
      stack.push(tri);
      let guard = 0;
      while (stack.length) {
        const T = stack.pop(),
          P0 = T[0][0],
          P1 = T[1][0],
          P2 = T[2][0];
        const d = (A2, B2) =>
          (A2[0] - B2[0]) ** 2 + (A2[1] - B2[1]) ** 2 + (A2[2] - B2[2]) ** 2;
        const l0 = d(P0, P1),
          l1 = d(P1, P2),
          l2 = d(P2, P0),
          mx = Math.max(l0, l1, l2);
        if (mx <= lim || ++guard > 4000) {
          for (const V of T)
            for (let ai = 0; ai < names.length; ai++) {
              const arr = outs[ai];
              for (const v of V[ai]) arr.push(v);
            }
          continue;
        }
        const e = mx === l0 ? 0 : mx === l1 ? 1 : 2,
          A2 = T[e],
          B2 = T[(e + 1) % 3],
          Cv = T[(e + 2) % 3];
        const M = A2.map((attr, ai) => attr.map((v, k) => (v + B2[ai][k]) / 2));
        const ni = names.indexOf("normal");
        if (ni >= 0) {
          const q = M[ni],
            L2 = Math.hypot(q[0], q[1], q[2]) || 1;
          q[0] /= L2;
          q[1] /= L2;
          q[2] /= L2;
        }
        stack.push([A2, M, Cv], [M, B2, Cv]);
      }
    }
    const out = new THREE.BufferGeometry();
    names.forEach((k, ai) =>
      out.setAttribute(
        k,
        new THREE.BufferAttribute(new Float32Array(outs[ai]), sizes[ai]),
      ),
    );
    g.dispose();
    return out;
  }
  const M4 = (x, y, z, ry, rx, rz, sx, sy, sz) =>
    new THREE.Matrix4().compose(
      new THREE.Vector3(x || 0, y || 0, z || 0),
      new THREE.Quaternion().setFromEuler(
        new THREE.Euler(rx || 0, ry || 0, rz || 0, "YXZ"),
      ),
      new THREE.Vector3(
        sx === undefined ? 1 : sx,
        sy === undefined ? (sx === undefined ? 1 : sx) : sy,
        sz === undefined ? (sx === undefined ? 1 : sx) : sz,
      ),
    );
  LI.M4 = M4;
  /** Axis-aligned box by min/max corners. */
  Batch.prototype.box = function (key, x0, y0, z0, x1, y1, z1, o) {
    const w = Math.abs(x1 - x0),
      h = Math.abs(y1 - y0),
      d = Math.abs(z1 - z0);
    if (w < 1e-4 || h < 1e-4 || d < 1e-4) return null;
    const cx = (x0 + x1) / 2,
      cy = (y0 + y1) / 2,
      cz = (z0 + z1) / 2;
    return this.add(
      key,
      new THREE.BoxGeometry(w, h, d, this._sg(w), this._sg(h), this._sg(d)),
      Object.assign({}, o, {
        m: M4(cx, cy, cz),
        _box: { cx, cy, cz, sx: w, sy: h, sz: d, ry: 0 },
      }),
    );
  };
  /** Oriented box: centre (cx, cy, cz), size, yaw (three.js rotation.y), o.rx/o.rz. */
  Batch.prototype.obox = function (key, cx, cy, cz, sx, sy, sz, ry, o) {
    o = o || {};
    const tilt = !!(o.rx || o.rz);
    return this.add(
      key,
      new THREE.BoxGeometry(
        sx,
        sy,
        sz,
        this._sg(sx),
        this._sg(sy),
        this._sg(sz),
      ),
      Object.assign({}, o, {
        m: M4(cx, cy, cz, ry || 0, o.rx, o.rz),
        _box: tilt ? null : { cx, cy, cz, sx, sy, sz, ry: ry || 0 },
      }),
    );
  };
  /** Cylinder with its base at y0. o: {rx, rz, ry, open, t0, tl, hs} */
  Batch.prototype.cyl = function (key, x, y0, z, rt, rb, h, seg, o) {
    o = o || {};
    const g = new THREE.CylinderGeometry(
      rt,
      rb,
      h,
      seg || 12,
      o.hs || this._sg(h),
      !!o.open,
      o.t0 || 0,
      o.tl === undefined ? TAU : o.tl,
    );
    g.translate(0, h / 2, 0);
    return this.add(
      key,
      g,
      Object.assign({}, o, { m: M4(x, y0, z, o.ry, o.rx, o.rz) }),
    );
  };
  Batch.prototype.sphere = function (key, x, y, z, r, o) {
    o = o || {};
    const g = new THREE.SphereGeometry(
      r,
      o.ws || 12,
      o.hs || 8,
      0,
      TAU,
      o.p0 || 0,
      o.pl === undefined ? Math.PI : o.pl,
    );
    return this.add(
      key,
      g,
      Object.assign({}, o, {
        m: M4(x, y, z, o.ry, o.rx, o.rz, o.sx || 1, o.sy || 1, o.sz || 1),
      }),
    );
  };
  Batch.prototype.torus = function (key, x, y, z, R, r, o) {
    o = o || {};
    const g = new THREE.TorusGeometry(
      R,
      r,
      o.rs || 6,
      o.ts || 24,
      o.arc === undefined ? TAU : o.arc,
    );
    return this.add(
      key,
      g,
      Object.assign({}, o, {
        m: M4(
          x,
          y,
          z,
          o.ry,
          o.rx === undefined ? Math.PI / 2 : o.rx,
          o.rz,
          o.sx || 1,
          o.sy || 1,
          o.sz || 1,
        ),
      }),
    );
  };
  Batch.prototype.lathe = function (key, pts, seg, x, y, z, o) {
    o = o || {};
    const g = new THREE.LatheGeometry(
      pts.map((p) => new THREE.Vector2(p[0], p[1])),
      seg || 16,
      o.p0 || 0,
      o.pl === undefined ? TAU : o.pl,
    );
    return this.add(
      key,
      g,
      Object.assign({}, o, {
        m: M4(x, y, z, o.ry, o.rx, o.rz, o.sx || 1, o.sy || 1, o.sz || 1),
      }),
    );
  };
  /** Flat textured quad facing +Z before rotation (ry). Centre (cx,cy,cz). o.uvRect for atlas cells. */
  Batch.prototype.quad = function (key, cx, cy, cz, w, h, ry, o) {
    o = o || {};
    const g = new THREE.PlaneGeometry(w, h, this._sg(w), this._sg(h));
    // double: a back copy that reads the right way round, 3 mm behind (with a DoubleSide material the front copy's
    // mirrored back face used to z-fight it — banners read 'AIROTCIV DA' from behind)
    if (o.double) {
      const g2 = g.clone();
      g2.rotateY(Math.PI);
      g2.translate(0, 0, -0.003);
      this.add(
        key,
        g2,
        Object.assign({}, o, {
          keepUV: true,
          m: M4(cx, cy, cz, ry || 0, o.rx, o.rz),
        }),
      );
    }
    return this.add(
      key,
      g,
      Object.assign({}, o, {
        keepUV: true,
        m: M4(cx, cy, cz, ry || 0, o.rx, o.rz),
      }),
    );
  };
  /** Horizontal quad (floor decal / rug / map) at height y, facing up. */
  Batch.prototype.flat = function (key, cx, y, cz, w, d, ry, o) {
    o = o || {};
    const g = new THREE.PlaneGeometry(w, d, this._sg(w), this._sg(d));
    g.rotateX(-Math.PI / 2);
    return this.add(
      key,
      g,
      Object.assign({ noAO: true }, o, {
        keepUV: keepUV(key) || o.keepUV,
        m: M4(cx, y, cz, ry || 0),
      }),
    );
  };
  /** Box beam between two points (w wide, h tall cross-section). */
  Batch.prototype.beam = function (key, a, b, w, h, o) {
    const dx = b[0] - a[0],
      dy = b[1] - a[1],
      dz = b[2] - a[2],
      L = Math.hypot(dx, dy, dz);
    if (L < 1e-4) return null;
    const g = new THREE.BoxGeometry(w, h === undefined ? w : h, L);
    const m = new THREE.Matrix4().lookAt(
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(dx, dy, dz),
      Math.abs(dy / L) > 0.99
        ? new THREE.Vector3(1, 0, 0)
        : new THREE.Vector3(0, 1, 0),
    );
    m.setPosition((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2);
    return this.add(key, g, Object.assign({}, o, { m }));
  };
  /** Round rod between two points. */
  Batch.prototype.rod = function (key, a, b, r, o) {
    const dx = b[0] - a[0],
      dy = b[1] - a[1],
      dz = b[2] - a[2],
      L = Math.hypot(dx, dy, dz);
    if (L < 1e-4) return null;
    const g = new THREE.CylinderGeometry(r, r, L, (o && o.seg) || 6, 1, true);
    g.rotateX(Math.PI / 2);
    const m = new THREE.Matrix4().lookAt(
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(dx, dy, dz),
      Math.abs(dy / L) > 0.99
        ? new THREE.Vector3(1, 0, 0)
        : new THREE.Vector3(0, 1, 0),
    );
    m.setPosition((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2);
    return this.add(key, g, Object.assign({}, o, { m }));
  };
  /** Extruded 2D shape (pts in XY) with depth along Z, then transformed. */
  Batch.prototype.extrude = function (key, pts, depth, o) {
    o = o || {};
    const sh = new THREE.Shape();
    sh.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) sh.lineTo(pts[i][0], pts[i][1]);
    sh.closePath();
    if (o.holes)
      for (const hp of o.holes) {
        const p = new THREE.Path();
        p.moveTo(hp[0][0], hp[0][1]);
        for (let i = 1; i < hp.length; i++) p.lineTo(hp[i][0], hp[i][1]);
        p.closePath();
        sh.holes.push(p);
      }
    const g = new THREE.ExtrudeGeometry(sh, {
      depth,
      bevelEnabled: false,
      curveSegments: o.curve || 8,
    });
    return this.add(
      key,
      g,
      Object.assign({}, o, { m: o.m || M4(o.x, o.y, o.z, o.ry, o.rx, o.rz) }),
    );
  };
  /** Merge everything into one mesh per material under parent. */
