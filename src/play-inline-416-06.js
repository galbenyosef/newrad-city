// play-inline-416 06 — math
// Lines 1470-1818 of readable/play-inline-416.pretty.js (statement-aligned).
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
  BP.geo = function (mat, geom, o) {
    o = o || {};
    const b = this._b(mat);
    let m = o.matrix;
    if (!m) {
      _e.set(o.rx || 0, o.ry || 0, o.rz || 0, "YXZ");
      _q.setFromEuler(_e);
      const sc = o.s !== undefined ? o.s : 1;
      _s.set(
        o.sx !== undefined ? o.sx : sc,
        o.sy !== undefined ? o.sy : sc,
        o.sz !== undefined ? o.sz : sc,
      );
      m = _m4.compose(_v1.set(o.x || 0, o.y || 0, o.z || 0), _q, _s);
    }
    _n3.getNormalMatrix(m);
    const pos = geom.attributes.position,
      nor = geom.attributes.normal,
      uva = geom.attributes.uv;
    const tint = tintArr(o.tint),
      grime = o.grime !== undefined ? o.grime : this.grime;
    const tile = K.tileOf(mat);
    const e = m.elements,
      ne = _n3.elements;
    const base = b.vc,
      n = pos.count;
    for (let i = 0; i < n; i++) {
      const px = pos.getX(i),
        py = pos.getY(i),
        pz = pos.getZ(i);
      const x = e[0] * px + e[4] * py + e[8] * pz + e[12],
        y = e[1] * px + e[5] * py + e[9] * pz + e[13],
        z = e[2] * px + e[6] * py + e[10] * pz + e[14];
      let nx = 0,
        ny = 1,
        nz = 0;
      if (nor) {
        const qx = nor.getX(i),
          qy = nor.getY(i),
          qz = nor.getZ(i);
        nx = ne[0] * qx + ne[3] * qy + ne[6] * qz;
        ny = ne[1] * qx + ne[4] * qy + ne[7] * qz;
        nz = ne[2] * qx + ne[5] * qy + ne[8] * qz;
        const l = Math.hypot(nx, ny, nz) || 1;
        nx /= l;
        ny /= l;
        nz /= l;
      }
      let u, v;
      if (o.uv === "keep" && uva) {
        u = uva.getX(i);
        v = uva.getY(i);
      } else if (o.uv === "rect" && uva) {
        const r = o.rect;
        u = r[0] + (r[2] - r[0]) * uva.getX(i);
        v = r[1] + (r[3] - r[1]) * uva.getY(i);
      } else {
        const ax = Math.abs(nx),
          ay = Math.abs(ny),
          az = Math.abs(nz);
        if (ay >= ax && ay >= az) {
          u = x / tile[0];
          v = -z / tile[1];
        } else if (ax >= az) {
          u = z / tile[0];
          v = y / tile[1];
        } else {
          u = x / tile[0];
          v = y / tile[1];
        }
      }
      this._v(b, x, y, z, nx, ny, nz, u, v, tint, grime);
    }
    if (geom.index) {
      const ix = geom.index;
      for (let i = 0; i < ix.count; i++) b.i.push(base + ix.getX(i));
    } else for (let i = 0; i < n; i++) b.i.push(base + i);
    return this;
  };
  /** Square-section beam from A to B (w across, h up-ish). */
  BP.beam = function (mat, ax, ay, az, bx, by, bz, w, h, o) {
    const dx = bx - ax,
      dy = by - ay,
      dz = bz - az,
      len = Math.hypot(dx, dy, dz);
    if (len < 1e-4) return this;
    const g = K.unitBox();
    const yaw = Math.atan2(dx, dz),
      pitch = -Math.atan2(dy, Math.hypot(dx, dz));
    _e.set(pitch, yaw, 0, "YXZ");
    _q.setFromEuler(_e);
    _s.set(w, h, len);
    const m = new THREE.Matrix4().compose(
      _v1.set((ax + bx) / 2, (ay + by) / 2, (az + bz) / 2),
      _q,
      _s,
    );
    return this.geo(mat, g, Object.assign({}, o || {}, { matrix: m }));
  };
  /** Round pipe/bar from A to B. */
