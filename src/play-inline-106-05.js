// play-inline-106 05 — tile
// Lines 992-1342 of readable/play-inline-106.pretty.js (statement-aligned).
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
        const col = this._color(x, y, z, ny, tint, grime);
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
      const col = this._color(x, y, z, ny, tint, grime);
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
  BP.beam = function (mat, ax, ay, az, bx, by, bz, w, o) {
    o = o || {};
    _v1.set(bx - ax, by - ay, bz - az);
    const len = _v1.length();
    if (len < 1e-4) return this;
    _v1.divideScalar(len);
    _q.setFromUnitVectors(_v2.set(0, 1, 0), _v1);
    if (o.roll) {
      const qr = new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(0, 1, 0),
        o.roll,
      );
      _q.multiply(qr);
    }
    _s.set(w, len, o.d || w);
    const m = new THREE.Matrix4().compose(
      new THREE.Vector3((ax + bx) / 2, (ay + by) / 2, (az + bz) / 2),
      _q,
      _s,
    );
    return this.geo(mat, o.round ? (o.round === 6 ? T.cyl6 : T.cyl8) : T.box, {
      matrix: m,
      tint: o.tint,
      grime: o.grime,
      tile: o.tile,
    });
  };
  /** Sagging cable / catenary as thin beams. Returns sampled points. */
  BP.cable = function (mat, ax, ay, az, bx, by, bz, sag, w, segs) {
    segs = segs || 8;
    const pts = [];
    for (let i = 0; i <= segs; i++) {
      const t = i / segs;
      pts.push([
        ax + (bx - ax) * t,
        ay + (by - ay) * t - sag * 4 * t * (1 - t),
        az + (bz - az) * t,
      ]);
    }
    for (let i = 0; i < segs; i++)
      this.beam(
        mat,
        pts[i][0],
        pts[i][1],
        pts[i][2],
        pts[i + 1][0],
        pts[i + 1][1],
        pts[i + 1][2],
        w || 0.04,
        { grime: 0 },
      );
    return pts;
  };
  /** Quad from 4 points (CCW seen from front: bl, br, tr, tl). o: {rect, uv, tint, grime, double} */
  BP.quad = function (mat, p0, p1, p2, p3, o) {
    o = o || {};
    const b = this._b(mat);
    _v1.set(p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]);
    _v2.set(p3[0] - p0[0], p3[1] - p0[1], p3[2] - p0[2]);
    const n = new THREE.Vector3().crossVectors(_v1, _v2);
    // a quad collapsed to a triangle (p3 == p0, e.g. a parasol gore) has a zero edge: use the diagonals instead
    // (a zero normal normalised to NaN rendered black and blew the bloom pass out into a white blob)
    if (n.lengthSq() < 1e-12) {
      _v1.set(p2[0] - p0[0], p2[1] - p0[1], p2[2] - p0[2]);
      _v2.set(p3[0] - p1[0], p3[1] - p1[1], p3[2] - p1[2]);
      n.crossVectors(_v1, _v2);
    }
    if (n.lengthSq() < 1e-12) n.set(0, 1, 0);
    else n.normalize();
    const r = o.rect || [0, 0, 1, 1];
    const uvs = [
      [r[0], r[1]],
      [r[2], r[1]],
      [r[2], r[3]],
      [r[0], r[3]],
    ];
    const tint = tintOf(o.tint),
      grime = o.grime !== undefined ? o.grime : 0;
    const pts = [p0, p1, p2, p3];
    const addSide = (flip) => {
      const base = b.vc;
      for (let k = 0; k < 4; k++) {
        const p = pts[k];
        b.p.push(p[0], p[1], p[2]);
        b.n.push(flip ? -n.x : n.x, flip ? -n.y : n.y, flip ? -n.z : n.z);
        b.uv.push(uvs[k][0], uvs[k][1]);
        const col = this._color(p[0], p[1], p[2], n.y, tint, grime);
        b.c.push(col[0], col[1], col[2]);
      }
      if (flip) b.i.push(base, base + 2, base + 1, base, base + 3, base + 2);
      else b.i.push(base, base + 1, base + 2, base, base + 2, base + 3);
      b.vc += 4;
    };
    addSide(false);
    if (o.double) addSide(true);
    return this;
  };
  /**
   * Vertical rectangle centred at (cx, cy, cz), width w, height h, facing direction `face`
   * (three.js yaw: 0 → normal +Z/south, PI/2 → +X... actually normal = (sin f, 0, cos f)).
   */
  BP.panel = function (mat, cx, cy, cz, w, h, face, o) {
    if (o && o.both) {
      const o2 = Object.assign({}, o, { both: false });
      this.panel(mat, cx, cy, cz, w, h, face + Math.PI, o2);
      o = o2;
    }
    const nx = Math.sin(face),
      nz = Math.cos(face);
    const ux = Math.cos(face),
      uz = -Math.sin(face); // right vector when looking at the front
    const hw = w / 2,
      hh = h / 2,
      off = (o && o.off) || 0;
    const X = cx + nx * off,
      Z = cz + nz * off;
    return this.quad(
      mat,
      [X - ux * hw, cy - hh, Z - uz * hw],
      [X + ux * hw, cy - hh, Z + uz * hw],
      [X + ux * hw, cy + hh, Z + uz * hw],
      [X - ux * hw, cy + hh, Z - uz * hw],
      o,
    );
  };

  /** Horizontal floor/ceiling tiled with an atlas rect every `tile` metres (faces up unless o.down). */
  BP.tiledQuad = function (mat, x0, z0, x1, z1, y, tile, rect, o) {
    o = o || {};
    for (let x = x0; x < x1 - 1e-3; x += tile)
      for (let z = z0; z < z1 - 1e-3; z += tile) {
        const xa = x,
          xb = Math.min(x1, x + tile),
          za = z,
          zb = Math.min(z1, z + tile);
        const r = [
          rect[0],
          rect[1],
          rect[0] + ((rect[2] - rect[0]) * (xb - xa)) / tile,
          rect[1] + ((rect[3] - rect[1]) * (zb - za)) / tile,
        ];
        if (o.down)
          this.quad(mat, [xa, y, za], [xb, y, za], [xb, y, zb], [xa, y, zb], {
            rect: r,
            tint: o.tint,
            grime: o.grime,
          });
        else
          this.quad(mat, [xa, y, zb], [xb, y, zb], [xb, y, za], [xa, y, za], {
            rect: r,
            tint: o.tint,
            grime: o.grime,
          });
      }
    return this;
  };
  /** Extruded polygon (prism). pts [[x,z],...]; o: {top=true, bottom=false, tint, grime, tile, uo} */
