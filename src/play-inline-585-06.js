// play-inline-585 06 — grime
// Lines 1391-1674 of readable/play-inline-585.pretty.js (statement-aligned).
  BP._base = function (x, y, z, ny, tint, grime) {
    let s = 1;
    if (grime > 0) {
      const gy = y - this.groundY;
      const ao = K.clamp(1 - gy / 3.5, 0, 1);
      const streak = U.noise2(x * 0.23 + z * 0.19, y * 0.05);
      const blotch = U.noise2(
        x * 0.047 + 11.3 + y * 0.013,
        z * 0.047 - y * 0.031,
      );
      s =
        1 -
        grime *
          (0.3 * ao * ao + 0.26 * streak * streak + 0.24 * blotch * blotch);
      if (ny < -0.6) s *= 1 - grime * 0.25;
    }
    for (let k = 0; k < this.burns.length; k++) {
      const bn = this.burns[k];
      const dx = x - bn.x,
        dy = y - bn.y,
        dz = z - bn.z;
      const d2 = dx * dx + dy * dy + dz * dz;
      if (d2 < bn.r * bn.r) {
        const f = 1 - Math.sqrt(d2) / bn.r;
        s *= 1 - bn.amt * Math.min(1, f * 1.6);
      }
    }
    const m = this._mul;
    if (m) return [tint.r * s * m.r, tint.g * s * m.g, tint.b * s * m.b];
    return [tint.r * s, tint.g * s, tint.b * s];
  };
  BP._push = function (b, x, y, z, nx, ny, nz, u, v, tint, grime) {
    b.p.push(x, y, z);
    b.n.push(nx, ny, nz);
    b.uv.push(u, v);
    const c = this._base(x, y, z, ny, tint, grime);
    b.c.push(c[0], c[1], c[2]);
  };
  /** Planar grid face: origin corner (ox,oy,oz), unit axes U and V (U×V = normal), lengths ul, vl. */
  BP.face = function (mat, ox, oy, oz, ux, uy, uz, vx, vy, vz, ul, vl, o) {
    o = o || {};
    const b = this._b(mat);
    let nx = uy * vz - uz * vy,
      ny = uz * vx - ux * vz,
      nz = ux * vy - uy * vx;
    {
      const nl = Math.hypot(nx, ny, nz) || 1;
      nx /= nl;
      ny /= nl;
      nz /= nl;
    }
    const grime = o.grime !== undefined ? o.grime : this.grime;
    const seg = o.seg || this.seg;
    const su = Math.max(1, Math.min(48, Math.ceil(ul / seg))),
      sv = Math.max(1, Math.min(48, Math.ceil(vl / seg)));
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
        this._push(b, x, y, z, nx, ny, nz, u, v, tint, grime);
      }
    }
    const row = su + 1;
    for (let j = 0; j < sv; j++)
      for (let i = 0; i < su; i++) {
        const a = base + j * row + i;
        b.i.push(a, a + 1, a + row + 1, a, a + row + 1, a + row);
      }
    b.vc += (su + 1) * (sv + 1);
    return this;
  };
  /** Box: bottom centre (cx, y0, cz), size w (x) h (y) d (z). o: {yaw, faces:'nsewtb' (default 'nsewt'), tint, grime, uv, rect, seg} */
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
  /** Vertical cylinder / frustum. o: {top=true, bottom, arc0, arc, tint, grime, rows} */
  BP.cyl = function (mat, cx, y0, cz, rb, rt, h, seg, o) {
    o = o || {};
    const b = this._b(mat);
    seg = seg || 12;
    const tint = tintOf(o.tint),
      grime = o.grime !== undefined ? o.grime : this.grime,
      tile = o.tile || K.tile(mat);
    const a0 = o.arc0 || 0,
      arc = o.arc || Math.PI * 2;
    const rows = o.rows || Math.max(1, Math.min(16, Math.ceil(h / 2)));
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
        let nx = ca,
          ny = slope,
          nz = -sa;
        const nl = Math.hypot(nx, ny, nz);
        nx /= nl;
        ny /= nl;
        nz /= nl;
        this._push(
          b,
          cx + ca * r,
          y,
          cz - sa * r,
          nx,
          ny,
          nz,
          (((arc * i) / seg) * Math.max(rb, rt, 0.3)) / tile[0],
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
    b.vc += row * (rows + 1);
    const cap = (y, r, up) => {
      if (r <= 1e-4) return;
      const cb = b.vc;
      this._push(
        b,
        cx,
        y,
        cz,
        0,
        up ? 1 : -1,
        0,
        cx / tile[0],
        -cz / tile[1],
        tint,
        grime,
      );
      for (let i = 0; i <= seg; i++) {
        const ang = a0 + (arc * i) / seg,
          x = cx + Math.cos(ang) * r,
          z = cz - Math.sin(ang) * r;
        this._push(
          b,
          x,
          y,
          z,
          0,
          up ? 1 : -1,
          0,
          x / tile[0],
          -z / tile[1],
          tint,
          grime,
        );
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
  /** Arbitrary BufferGeometry with a transform baked in. o: {x,y,z, rx,ry,rz (Euler YXZ), s|sx,sy,sz, matrix, uv:'auto'|'keep'|'rect', rect, tint, grime} */
