// play-inline-170 05 — tile
// Lines 950-1294 of readable/play-inline-170.pretty.js (statement-aligned).
  BP.face = function (mat, ox, oy, oz, ux, uy, uz, vx, vy, vz, ul, vl, o) {
    o = o || {};
    const b = this._b(mat);
    const nx = uy * vz - uz * vy,
      ny = uz * vx - ux * vz,
      nz = ux * vy - uy * vx;
    const grime = o.grime !== undefined ? o.grime : this.grime;
    const seg = o.seg || (grime > 0 ? 9 : 1e9);
    const su = o.su || Math.max(1, Math.min(24, Math.ceil(ul / seg))),
      sv = o.sv || Math.max(1, Math.min(40, Math.ceil(vl / seg)));
    const tile = o.tile || K.tile(mat);
    const mode = o.uv || "side";
    const tint = o.tintObj || tintOf(o.tint);
    const base = b.vc;
    for (let j = 0; j <= sv; j++) {
      const bb = (vl * j) / sv;
      for (let i = 0; i <= su; i++) {
        const a = (ul * i) / su;
        const x = ox + ux * a + vx * bb,
          y = oy + uy * a + vy * bb,
          z = oz + uz * a + vz * bb;
        b.p.push(x, y, z);
        b.n.push(nx, ny, nz);
        let u, v;
        if (mode === "side") {
          u = ((o.uo || 0) + a) / tile[0];
          v = y / tile[1];
        } else if (mode === "top") {
          u = x / tile[0];
          v = -z / tile[1];
        } else if (mode === "rect") {
          const r = o.rect;
          u = r[0] + (r[2] - r[0]) * (a / ul);
          v = r[1] + (r[3] - r[1]) * (bb / vl);
        } else {
          u = ((o.uo || 0) + a) / tile[0];
          v = ((o.vo || 0) + bb) / tile[1];
        }
        b.uv.push(u, v);
        const col = this._color(x, y, z, ny, tint, grime, nx, nz);
        b.c.push(col[0], col[1], col[2]);
      }
    }
    const row = su + 1;
    for (let j = 0; j < sv; j++)
      for (let i = 0; i < su; i++) {
        const a = base + j * row + i,
          bI = a + 1,
          c = a + row + 1,
          d = a + row;
        b.i.push(a, bI, c, a, c, d);
      }
    b.vc += (su + 1) * (sv + 1);
    return this;
  };

  /**
   * Box. (cx, y0, cz) = bottom centre, w along local x, h up, d along local z.
   * o: {yaw (three.js convention), faces:'nsewtb' subset (default 'nsewt'), tint, grime, uvTop:'top'|'side', tile, seg}
   */
  BP.box = function (mat, cx, y0, cz, w, h, d, o) {
    o = o || {};
    const yaw = o.yaw || 0,
      c = Math.cos(yaw),
      s = Math.sin(yaw);
    const faces = o.faces || "nsewt";
    const tint = tintOf(o.tint);
    const fo = {
      tintObj: tint,
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
      tintObj: tint,
      grime: o.grime,
      tile: o.tile,
      seg: o.seg,
      uv: o.uvTop || (o.uv === "rect" ? "rect" : "top"),
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
  /** Axis-aligned box by min/max corners. */
  BP.boxMM = function (mat, x0, y0, z0, x1, y1, z1, o) {
    return this.box(
      mat,
      (x0 + x1) / 2,
      y0,
      (z0 + z1) / 2,
      x1 - x0,
      y1 - y0,
      z1 - z0,
      o,
    );
  };

  /** Vertical cylinder / cone frustum. o: {top, bottom, flat, arc0, arc, tint, grime, uvScale, yaw} */
  BP.cyl = function (mat, cx, y0, cz, rb, rt, h, seg, o) {
    o = o || {};
    const b = this._b(mat);
    seg = seg || 12;
    const tint = tintOf(o.tint);
    const grime = o.grime !== undefined ? o.grime : this.grime;
    const tile = o.tile || K.tile(mat);
    const a0 = (o.arc0 || 0) + (o.yaw || 0),
      arc = o.arc || Math.PI * 2;
    const rows = o.rows || Math.max(1, Math.min(20, Math.ceil(h / 10)));
    const slope = (rb - rt) / h;
    const base = b.vc;
    for (let j = 0; j <= rows; j++) {
      const t = j / rows,
        y = y0 + h * t,
        r = rb + (rt - rb) * t;
      for (let i = 0; i <= seg; i++) {
        const ang = a0 + (arc * i) / seg,
          ca = Math.cos(ang),
          sa = Math.sin(ang);
        const x = cx + ca * r,
          z = cz - sa * r;
        let nx = ca,
          ny = slope,
          nz = -sa;
        const nl = Math.hypot(nx, ny, nz);
        nx /= nl;
        ny /= nl;
        nz /= nl;
        b.p.push(x, y, z);
        b.n.push(nx, ny, nz);
        b.uv.push(
          ((((arc * i) / seg) * Math.max(rb, rt, 0.3)) / tile[0]) *
            (o.uvScale || 1),
          y / tile[1],
        );
        const col = this._color(x, y, z, ny, tint, grime, nx, nz);
        b.c.push(col[0], col[1], col[2]);
      }
    }
    const row = seg + 1;
    for (let j = 0; j < rows; j++)
      for (let i = 0; i < seg; i++) {
        const a = base + j * row + i;
        b.i.push(a, a + row + 1, a + row, a, a + 1, a + row + 1);
      }
    b.vc += row * (rows + 1);
    if (o.flat) {
      /* smooth shading is default; flat unsupported here (use seg small) */
    }
    const cap = (y, r, up) => {
      if (r <= 0.0001) return;
      const cb = b.vc;
      b.p.push(cx, y, cz);
      b.n.push(0, up ? 1 : -1, 0);
      b.uv.push(cx / tile[0], -cz / tile[1]);
      let col = this._color(cx, y, cz, up ? 1 : -1, tint, grime);
      b.c.push(col[0], col[1], col[2]);
      for (let i = 0; i <= seg; i++) {
        const ang = a0 + (arc * i) / seg,
          x = cx + Math.cos(ang) * r,
          z = cz - Math.sin(ang) * r;
        b.p.push(x, y, z);
        b.n.push(0, up ? 1 : -1, 0);
        b.uv.push(x / tile[0], -z / tile[1]);
        col = this._color(x, y, z, up ? 1 : -1, tint, grime);
        b.c.push(col[0], col[1], col[2]);
      }
      for (let i = 0; i < seg; i++) {
        if (up) b.i.push(cb, cb + 1 + i, cb + 2 + i);
        else b.i.push(cb, cb + 2 + i, cb + 1 + i);
      }
      b.vc += seg + 2;
    };
    if (o.top !== false) cap(y0 + h, rt, true);
    if (o.bottom) cap(y0, rb, false);
    return this;
  };

  const _m4 = new THREE.Matrix4(),
    _n3 = new THREE.Matrix3(),
    _q = new THREE.Quaternion(),
    _e = new THREE.Euler(),
    _v1 = new THREE.Vector3(),
    _v2 = new THREE.Vector3(),
    _s = new THREE.Vector3();
  /**
   * Add an arbitrary BufferGeometry with a transform baked in.
   * o: {x,y,z, rx,ry,rz (Euler YXZ), s|sx,sy,sz, matrix, uv:'auto'|'keep'|'rect', rect, tile, tint, grime}
   */
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
    const tint = tintOf(o.tint);
    const grime = o.grime !== undefined ? o.grime : this.grime;
    const tile = o.tile || K.tile(mat);
    const mode = o.uv || (uva ? "auto" : "auto");
    const base = b.vc,
      n = pos.count;
    const e = m.elements,
      ne = _n3.elements;
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
      b.p.push(x, y, z);
      b.n.push(nx, ny, nz);
      let u, v;
      if (mode === "keep" && uva) {
        u = uva.getX(i);
        v = uva.getY(i);
      } else if (mode === "rect" && uva) {
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
          u = (nx > 0 ? -z : z) / tile[0];
          v = y / tile[1];
        } else {
          u = (nz > 0 ? x : -x) / tile[0];
          v = y / tile[1];
        }
      }
      b.uv.push(u, v);
      const col = this._color(x, y, z, ny, tint, grime, nx, nz);
      b.c.push(col[0], col[1], col[2]);
    }
    if (geom.index) {
      const ix = geom.index;
      for (let i = 0; i < ix.count; i++) b.i.push(base + ix.getX(i));
    } else for (let i = 0; i < n; i++) b.i.push(base + i);
    b.vc += n;
    return this;
  };

  // Reusable template geometries (never disposed; only read)
  const T = (K.T = {
    box: new THREE.BoxGeometry(1, 1, 1),
    sphere: new THREE.SphereGeometry(1, 10, 7),
    sphereLo: new THREE.SphereGeometry(1, 7, 5),
    cyl6: new THREE.CylinderGeometry(1, 1, 1, 6, 1),
    cyl8: new THREE.CylinderGeometry(1, 1, 1, 8, 1),
    cyl12: new THREE.CylinderGeometry(1, 1, 1, 12, 1),
    cone8: new THREE.ConeGeometry(1, 1, 8, 1),
    cone4: new THREE.ConeGeometry(1, 1, 4, 1),
    cone6: new THREE.ConeGeometry(1, 1, 6, 1),
    torus: new THREE.TorusGeometry(1, 0.06, 4, 28),
    torusThick: new THREE.TorusGeometry(1, 0.2, 6, 20),
    ico: new THREE.IcosahedronGeometry(1, 0),
    dodeca: new THREE.DodecahedronGeometry(1, 0),
  });

  /** Beam (box) between two points. o: {w (thickness), d?, tint, grime, roll} */
