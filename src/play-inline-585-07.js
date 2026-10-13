// play-inline-585 07 — base
// Lines 1675-1987 of readable/play-inline-585.pretty.js (statement-aligned).
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
    const tint = tintOf(o.tint),
      grime = o.grime !== undefined ? o.grime : this.grime,
      tile = o.tile || K.tile(mat);
    const mode = o.uv || "auto";
    const base = b.vc,
      n = pos.count,
      e = m.elements,
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
      this._push(b, x, y, z, nx, ny, nz, u, v, tint, grime);
    }
    if (geom.index) {
      const ix = geom.index;
      for (let i = 0; i < ix.count; i++) b.i.push(base + ix.getX(i));
    } else for (let i = 0; i < n; i++) b.i.push(base + i);
    b.vc += n;
    return this;
  };
  const T = (K.T = {
    box: new THREE.BoxGeometry(1, 1, 1),
    sphere: new THREE.SphereGeometry(1, 12, 8),
    sphereLo: new THREE.SphereGeometry(1, 7, 5),
    cyl6: new THREE.CylinderGeometry(1, 1, 1, 6, 1),
    cyl8: new THREE.CylinderGeometry(1, 1, 1, 8, 1),
    cyl12: new THREE.CylinderGeometry(1, 1, 1, 12, 1),
    cyl16: new THREE.CylinderGeometry(1, 1, 1, 16, 1),
    cone8: new THREE.ConeGeometry(1, 1, 8, 1),
    torus: new THREE.TorusGeometry(1, 0.08, 6, 24),
    plane: new THREE.PlaneGeometry(1, 1),
  });
  /** Beam (box or round) between two points. o: {d, round:6|8|12, tint, grime} */
  BP.beam = function (mat, ax, ay, az, bx, by, bz, w, o) {
    o = o || {};
    _v1.set(bx - ax, by - ay, bz - az);
    const len = _v1.length();
    if (len < 1e-4) return this;
    _v1.divideScalar(len);
    _q.setFromUnitVectors(_v2.set(0, 1, 0), _v1);
    if (o.roll)
      _q.multiply(
        new THREE.Quaternion().setFromAxisAngle(
          new THREE.Vector3(0, 1, 0),
          o.roll,
        ),
      );
    _s.set(o.round ? w / 2 : w, len, o.round ? w / 2 : o.d || w);
    const m = new THREE.Matrix4().compose(
      new THREE.Vector3((ax + bx) / 2, (ay + by) / 2, (az + bz) / 2),
      _q,
      _s,
    );
    const g =
      o.round === 6
        ? T.cyl6
        : o.round === 12
          ? T.cyl12
          : o.round
            ? T.cyl8
            : T.box;
    return this.geo(mat, g, {
      matrix: m,
      tint: o.tint,
      grime: o.grime,
      tile: o.tile,
    });
  };
  /** Sagging cable between two points (thin round beams). */
  BP.cable = function (mat, ax, ay, az, bx, by, bz, sag, w, segs, o) {
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
        w || 0.05,
        Object.assign({ round: 6, grime: 0 }, o || {}),
      );
    return pts;
  };
  /** Quad from 4 points (bl, br, tr, tl; CCW seen from the front). o: {rect, tint, grime, double} */
  BP.quad = function (mat, p0, p1, p2, p3, o) {
    o = o || {};
    const b = this._b(mat);
    _v1.set(p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]);
    _v2.set(p3[0] - p0[0], p3[1] - p0[1], p3[2] - p0[2]);
    const n = new THREE.Vector3().crossVectors(_v1, _v2).normalize();
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
    const side = (flip) => {
      const base = b.vc;
      for (let k = 0; k < 4; k++)
        this._push(
          b,
          pts[k][0],
          pts[k][1],
          pts[k][2],
          flip ? -n.x : n.x,
          flip ? -n.y : n.y,
          flip ? -n.z : n.z,
          uvs[k][0],
          uvs[k][1],
          tint,
          grime,
        );
      if (flip) b.i.push(base, base + 2, base + 1, base, base + 3, base + 2);
      else b.i.push(base, base + 1, base + 2, base, base + 2, base + 3);
      b.vc += 4;
    };
    side(false);
    if (o.double) side(true);
    return this;
  };
  /** Vertical rectangle centred at (cx,cy,cz), width w, height h, facing yaw `face` (normal = (sin f, 0, cos f)). */
  BP.panel = function (mat, cx, cy, cz, w, h, face, o) {
    o = o || {};
    const nx = Math.sin(face),
      nz = Math.cos(face),
      ux = Math.cos(face),
      uz = -Math.sin(face);
    const hw = w / 2,
      hh = h / 2,
      off = o.off || 0;
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
  /** Horizontal decal quad facing up at height y (centre cx,cz, size w×d, rotation yaw). */
  BP.floorDecal = function (name, cx, y, cz, w, d, yaw, o) {
    const c = Math.cos(yaw || 0),
      s = Math.sin(yaw || 0);
    const P = (lx, lz) => [cx + lx * c + lz * s, y, cz - lx * s + lz * c];
    return this.quad(
      "decal",
      P(-w / 2, d / 2),
      P(w / 2, d / 2),
      P(w / 2, -d / 2),
      P(-w / 2, -d / 2),
      Object.assign({ rect: K.decal(name) }, o || {}),
    );
  };
  BP.wallDecal = function (name, cx, cy, cz, w, h, face, o) {
    return this.panel(
      "decal",
      cx,
      cy,
      cz,
      w,
      h,
      face,
      Object.assign({ rect: K.decal(name), off: 0.02 }, o || {}),
    );
  };
  /** Extruded polygon prism. pts [[x,z]...]; o: {top=true, bottom, tint, grime, sides} */
  BP.prism = function (mat, pts, y0, y1, o) {
    o = o || {};
    let area = 0;
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i],
        b2 = pts[(i + 1) % pts.length];
      area += a[0] * b2[1] - b2[0] * a[1];
    }
    const P = area > 0 ? pts.slice() : pts.slice().reverse();
    const tint = tintOf(o.tint);
    let uo = 0;
    const h = y1 - y0;
    if (o.sides !== false)
      for (let i = 0; i < P.length; i++) {
        const a = P[i],
          bq = P[(i + 1) % P.length];
        const dx = bq[0] - a[0],
          dz = bq[1] - a[1],
          L = Math.hypot(dx, dz);
        if (L < 1e-4) continue;
        this.face(mat, bq[0], y0, bq[1], -dx / L, 0, -dz / L, 0, 1, 0, L, h, {
          tintObj: tint,
          grime: o.grime,
          tile: o.tile,
          uo,
        });
        uo += L;
      }
    const tri = (y, up) => {
      const b = this._b(mat);
      const contour = P.map((p) => new THREE.Vector2(p[0], p[1]));
      const faces = THREE.ShapeUtils.triangulateShape(contour, []);
      const base = b.vc;
      const tile = o.tile || K.tile(mat);
      for (const p of P)
        this._push(
          b,
          p[0],
          y,
          p[1],
          0,
          up ? 1 : -1,
          0,
          p[0] / tile[0],
          -p[1] / tile[1],
          tint,
          o.grime !== undefined ? o.grime : this.grime,
        );
      for (const f of faces) {
        const p0 = P[f[0]],
          p1 = P[f[1]],
          p2 = P[f[2]];
        const facesUp =
          (p1[1] - p0[1]) * (p2[0] - p0[0]) -
            (p1[0] - p0[0]) * (p2[1] - p0[1]) >
          0;
        if (facesUp === up) b.i.push(base + f[0], base + f[1], base + f[2]);
        else b.i.push(base + f[0], base + f[2], base + f[1]);
      }
      b.vc += P.length;
    };
    if (o.top !== false) tri(y1, true);
    if (o.bottom) tri(y0, false);
    return this;
  };
  /**
   * Barrel vault along Z from z0 to z1, spanning x0..x1, springing at ys, rise r (semicircle when r = half span).
   * Inner surface faces down/inwards. o: {mat, segs, rect (uv over the whole vault), tint}
   */
