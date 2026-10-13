// play-inline-312 06 — math
// Lines 1667-1973 of readable/play-inline-312.pretty.js (statement-aligned).
  BP.quad = function (mat, p0, p1, p2, p3, o) {
    o = o || {};
    if (o.rect) mat = K.atlasMat(mat, o.rect);
    const b = this._b(mat);
    const ax = p1[0] - p0[0],
      ay = p1[1] - p0[1],
      az = p1[2] - p0[2];
    const bx = p3[0] - p0[0],
      by = p3[1] - p0[1],
      bz = p3[2] - p0[2];
    let nx = ay * bz - az * by,
      ny = az * bx - ax * bz,
      nz = ax * by - ay * bx;
    const nl = Math.hypot(nx, ny, nz) || 1;
    nx /= nl;
    ny /= nl;
    nz /= nl;
    const tint = tintArr(o.tint),
      grime = o.grime !== undefined ? o.grime : this.grime;
    const tile = o.tile || K.tileOf(mat);
    const base = b.vc;
    const pts = [p0, p1, p2, p3];
    const R = o.rect;
    const ruv = R
      ? [
          [R[0], R[1]],
          [R[2], R[1]],
          [R[2], R[3]],
          [R[0], R[3]],
        ]
      : null;
    for (let k = 0; k < 4; k++) {
      const p = pts[k];
      let u, v;
      if (ruv) {
        u = ruv[k][0];
        v = ruv[k][1];
      } else {
        const aX = Math.abs(nx),
          aY = Math.abs(ny),
          aZ = Math.abs(nz);
        if (aY >= aX && aY >= aZ) {
          u = p[0] / tile[0];
          v = -p[2] / tile[1];
        } else if (aX >= aZ) {
          u = p[2] / tile[0];
          v = p[1] / tile[1];
        } else {
          u = p[0] / tile[0];
          v = p[1] / tile[1];
        }
      }
      this._v(b, p[0], p[1], p[2], nx, ny, nz, u, v, tint, grime);
    }
    b.i.push(base, base + 1, base + 2, base, base + 2, base + 3);
    return this;
  };
  /** Subdivided (bilinear) quad p0→p1 = U, p0→p3 = V; normal (p1−p0)×(p3−p0). o: {tint, grime, seg, uv:'top'|'side'} */
  BP.quadGrid = function (mat, p0, p1, p2, p3, o) {
    o = o || {};
    const b = this._b(mat);
    const ax = p1[0] - p0[0],
      ay = p1[1] - p0[1],
      az = p1[2] - p0[2];
    const bx = p3[0] - p0[0],
      by = p3[1] - p0[1],
      bz = p3[2] - p0[2];
    let nx = ay * bz - az * by,
      ny = az * bx - ax * bz,
      nz = ax * by - ay * bx;
    const nl = Math.hypot(nx, ny, nz) || 1;
    nx /= nl;
    ny /= nl;
    nz /= nl;
    const seg = o.seg || this.seg;
    const lu = Math.max(
      Math.hypot(ax, ay, az),
      Math.hypot(p2[0] - p3[0], p2[1] - p3[1], p2[2] - p3[2]),
    );
    const lv = Math.max(
      Math.hypot(bx, by, bz),
      Math.hypot(p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]),
    );
    const su = Math.max(1, Math.min(32, Math.ceil(lu / seg))),
      sv = Math.max(1, Math.min(32, Math.ceil(lv / seg)));
    const tint = tintArr(o.tint),
      grime = o.grime !== undefined ? o.grime : this.grime,
      tile = o.tile || K.tileOf(mat);
    const top = o.uv ? o.uv === "top" : Math.abs(ny) > 0.7;
    const base = b.vc;
    for (let j = 0; j <= sv; j++) {
      const v = j / sv;
      for (let i = 0; i <= su; i++) {
        const u = i / su;
        const x =
          (p0[0] * (1 - u) + p1[0] * u) * (1 - v) +
          (p3[0] * (1 - u) + p2[0] * u) * v;
        const y =
          (p0[1] * (1 - u) + p1[1] * u) * (1 - v) +
          (p3[1] * (1 - u) + p2[1] * u) * v;
        const z =
          (p0[2] * (1 - u) + p1[2] * u) * (1 - v) +
          (p3[2] * (1 - u) + p2[2] * u) * v;
        const U = top ? (x + this.off.x) / tile[0] : (u * lu) / tile[0],
          V = top ? -(z + this.off.z) / tile[1] : y / tile[1];
        this._v(b, x, y, z, nx, ny, nz, U, V, tint, grime);
      }
    }
    const row = su + 1;
    for (let j = 0; j < sv; j++)
      for (let i = 0; i < su; i++) {
        const a = base + j * row + i;
        b.i.push(a, a + 1, a + row + 1, a, a + row + 1, a + row);
      }
    return this;
  };
  /** Quad whose winding is flipped if needed so its normal points along n. */
  BP.quadN = function (mat, p0, p1, p2, p3, n, o) {
    const ax = p1[0] - p0[0],
      ay = p1[1] - p0[1],
      az = p1[2] - p0[2];
    const bx = p3[0] - p0[0],
      by = p3[1] - p0[1],
      bz = p3[2] - p0[2];
    const nx = ay * bz - az * by,
      ny = az * bx - ax * bz,
      nz = ax * by - ay * bx;
    if (nx * n[0] + ny * n[1] + nz * n[2] >= 0)
      return this.quad(mat, p0, p1, p2, p3, o);
    return this.quad(mat, p1, p0, p3, p2, o);
  };
  /**
   * Box: bottom-centre (cx,y0,cz), w (local x), h, d (local z).
   * o: {yaw (three.js), faces 'nsewtb' (default 'nsewt'), tint, grime, uv, seg, tile, rect}
   */
  BP.box = function (mat, cx, y0, cz, w, h, d, o) {
    o = o || {};
    const yaw = o.yaw || 0,
      c = Math.cos(yaw),
      s = Math.sin(yaw);
    const faces = o.faces || "nsewt";
    const fo = {
      tint: o.tint,
      grime: o.grime,
      tile: o.tile,
      seg: o.seg,
      uv: o.uv,
      rect: o.rect,
    };
    const hw = w / 2,
      hd = d / 2;
    const R = (lx, lz) => [cx + lx * c + lz * s, cz - lx * s + lz * c];
    const D = (lx, lz) => [lx * c + lz * s, -lx * s + lz * c];
    let p, u;
    if (faces.indexOf("s") >= 0) {
      p = R(-hw, hd);
      u = D(1, 0);
      this.face(mat, p[0], y0, p[1], u[0], 0, u[1], 0, 1, 0, w, h, fo);
    }
    if (faces.indexOf("n") >= 0) {
      p = R(hw, -hd);
      u = D(-1, 0);
      this.face(mat, p[0], y0, p[1], u[0], 0, u[1], 0, 1, 0, w, h, fo);
    }
    if (faces.indexOf("e") >= 0) {
      p = R(hw, hd);
      u = D(0, -1);
      this.face(mat, p[0], y0, p[1], u[0], 0, u[1], 0, 1, 0, d, h, fo);
    }
    if (faces.indexOf("w") >= 0) {
      p = R(-hw, -hd);
      u = D(0, 1);
      this.face(mat, p[0], y0, p[1], u[0], 0, u[1], 0, 1, 0, d, h, fo);
    }
    const to = {
      tint: o.tint,
      grime: o.grime,
      tile: o.tile,
      seg: o.seg,
      uv: o.uv === "rect" ? "rect" : o.uvTop || "top",
      rect: o.rect,
    };
    if (faces.indexOf("t") >= 0) {
      p = R(-hw, hd);
      u = D(1, 0);
      const v = D(0, -1);
      this.face(
        mat,
        p[0],
        y0 + h,
        p[1],
        u[0],
        0,
        u[1],
        v[0],
        0,
        v[1],
        w,
        d,
        to,
      );
    }
    if (faces.indexOf("b") >= 0) {
      p = R(-hw, -hd);
      u = D(1, 0);
      const v = D(0, 1);
      this.face(mat, p[0], y0, p[1], u[0], 0, u[1], v[0], 0, v[1], w, d, to);
    }
    return this;
  };
  BP.boxMM = function (mat, x0, y0, z0, x1, y1, z1, o) {
    return this.box(
      mat,
      (x0 + x1) / 2,
      Math.min(y0, y1),
      (z0 + z1) / 2,
      Math.abs(x1 - x0),
      Math.abs(y1 - y0),
      Math.abs(z1 - z0),
      o,
    );
  };
  /** Vertical cylinder/cone. o: {top(true), bottom, arc0, arc, tint, grime, rows} */
  BP.cyl = function (mat, cx, y0, cz, rb, rt, h, seg, o) {
    o = o || {};
    const b = this._b(mat);
    seg = seg || 10;
    const tint = tintArr(o.tint),
      grime = o.grime !== undefined ? o.grime : this.grime;
    const tile = K.tileOf(mat);
    const a0 = o.arc0 || 0,
      arc = o.arc || Math.PI * 2;
    const rows = o.rows || Math.max(1, Math.min(16, Math.ceil(h / this.seg)));
    const slope = (rb - rt) / (h || 1);
    const base = b.vc;
    for (let j = 0; j <= rows; j++) {
      const t = j / rows,
        y = y0 + h * t,
        r = rb + (rt - rb) * t;
      for (let i = 0; i <= seg; i++) {
        const ang = a0 + (arc * i) / seg,
          ca = Math.cos(ang),
          sa = Math.sin(ang);
        let nx = ca,
          ny = slope,
          nz = -sa;
        const nl = Math.hypot(nx, ny, nz);
        nx /= nl;
        ny /= nl;
        nz /= nl;
        this._v(
          b,
          cx + ca * r,
          y,
          cz - sa * r,
          nx,
          ny,
          nz,
          (((arc * i) / seg) * Math.max(rb, rt, 0.2)) / tile[0],
          y / tile[1],
          tint,
          grime,
        );
      }
    }
    const row = seg + 1;
    for (let j = 0; j < rows; j++)
      for (let i = 0; i < seg; i++) {
        const a = base + j * row + i;
        b.i.push(a, a + row + 1, a + row, a, a + 1, a + row + 1);
      }
    const cap = (y, r, up) => {
      if (r <= 1e-4) return;
      const cb = b.vc;
      this._v(b, cx, y, cz, 0, up ? 1 : -1, 0, 0.5, 0.5, tint, grime);
      for (let i = 0; i <= seg; i++) {
        const ang = a0 + (arc * i) / seg;
        this._v(
          b,
          cx + Math.cos(ang) * r,
          y,
          cz - Math.sin(ang) * r,
          0,
          up ? 1 : -1,
          0,
          0.5 + Math.cos(ang) * 0.5,
          0.5 + Math.sin(ang) * 0.5,
          tint,
          grime,
        );
      }
      for (let i = 0; i < seg; i++) {
        if (up) b.i.push(cb, cb + 1 + i, cb + 2 + i);
        else b.i.push(cb, cb + 2 + i, cb + 1 + i);
      }
    };
    if (o.top !== false) cap(y0 + h, rt, true);
    if (o.bottom) cap(y0, rb, false);
    return this;
  };
  const _m4 = new THREE.Matrix4(),
    _q = new THREE.Quaternion(),
    _e = new THREE.Euler(),
    _v1 = new THREE.Vector3(),
    _s = new THREE.Vector3(),
    _n3 = new THREE.Matrix3();
  /** Arbitrary BufferGeometry with transform (local coords). o: {x,y,z,rx,ry,rz,s,sx,sy,sz,matrix,tint,grime,uv:'keep'|'rect',rect} */
