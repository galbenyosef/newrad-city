// play-inline-170 06 — grime
// Lines 1295-1621 of readable/play-inline-170.pretty.js (statement-aligned).
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
    const addSide = (flip) => {
      const base = b.vc;
      for (let k = 0; k < 4; k++) {
        const p = pts[k];
        b.p.push(p[0], p[1], p[2]);
        b.n.push(flip ? -n.x : n.x, flip ? -n.y : n.y, flip ? -n.z : n.z);
        b.uv.push(uvs[k][0], uvs[k][1]);
        const col = this._color(
          p[0],
          p[1],
          p[2],
          flip ? -n.y : n.y,
          tint,
          grime,
          flip ? -n.x : n.x,
          flip ? -n.z : n.z,
        );
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
  BP.prism = function (mat, pts, y0, y1, o) {
    o = o || {};
    let area = 0;
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i],
        b2 = pts[(i + 1) % pts.length];
      area += a[0] * b2[1] - b2[0] * a[1];
    }
    // We want the outward normal to be the right-hand perpendicular (dz,-dx): requires area2 > 0 in (x,z) math orientation.
    const P = area > 0 ? pts.slice() : pts.slice().reverse();
    const tint = tintOf(o.tint);
    let uo = o.uo || 0;
    const h = y1 - y0;
    if (o.sides !== false) {
      for (let i = 0; i < P.length; i++) {
        const a = P[i],
          bq = P[(i + 1) % P.length];
        const dx = bq[0] - a[0],
          dz = bq[1] - a[1],
          L = Math.hypot(dx, dz);
        if (L < 1e-4) continue;
        // origin at b, u toward a (so that u × up = outward normal)
        this.face(mat, bq[0], y0, bq[1], -dx / L, 0, -dz / L, 0, 1, 0, L, h, {
          tintObj: tint,
          grime: o.grime,
          tile: o.tile,
          uo,
          seg: o.seg,
        });
        uo += L;
      }
    }
    const tri = (y, up) => {
      const b = this._b(mat);
      const contour = P.map((p) => new THREE.Vector2(p[0], p[1]));
      const faces = THREE.ShapeUtils.triangulateShape(contour, []);
      const base = b.vc;
      const tile = o.tile || K.tile(mat);
      for (const p of P) {
        b.p.push(p[0], y, p[1]);
        b.n.push(0, up ? 1 : -1, 0);
        b.uv.push(p[0] / tile[0], -p[1] / tile[1]);
        const col = this._color(
          p[0],
          y,
          p[1],
          up ? 1 : -1,
          tint,
          o.grime !== undefined ? o.grime : this.grime,
        );
        b.c.push(col[0], col[1], col[2]);
      }
      for (const f of faces) {
        // orient each triangle explicitly: (a×b).y > 0 means it faces +Y
        const p0 = P[f[0]],
          p1 = P[f[1]],
          p2 = P[f[2]];
        const ax = p1[0] - p0[0],
          az = p1[1] - p0[1],
          bx = p2[0] - p0[0],
          bz = p2[1] - p0[1];
        const facesUp = az * bx - ax * bz > 0;
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
   * Extrude a THREE.Shape (in local x = along wall, y = up) by depth (local z, centred).
   * o: {x,y,z, ry (three yaw), curveSegments, tint, grime, tile, uv}
   */
  BP.extrude = function (mat, shape, depth, o) {
    o = o || {};
    const g = new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: false,
      curveSegments: o.curveSegments || 8,
    });
    g.translate(0, 0, -depth / 2);
    this.geo(mat, g, {
      x: o.x,
      y: o.y,
      z: o.z,
      ry: o.ry,
      rx: o.rx,
      tint: o.tint,
      grime: o.grime,
      tile: o.tile,
      uv: o.uv,
      rect: o.rect,
    });
    g.dispose();
    return this;
  };

  /**
   * Wall with rectangular/arched openings between points A and B (xz), from y0 to y1, thickness t.
   * openings: [{at (m from A), w, h (height of opening incl. arch), y (sill, default 0), arch:bool}]
   * Wall faces its local +z to the right of A→B... we simply place it; both faces are rendered by extrusion.
   */
  BP.wall = function (mat, ax, az, bx, bz, y0, y1, t, openings, o) {
    o = o || {};
    const L = Math.hypot(bx - ax, bz - az);
    const sh = new THREE.Shape();
    sh.moveTo(0, 0);
    sh.lineTo(L, 0);
    sh.lineTo(L, y1 - y0);
    sh.lineTo(0, y1 - y0);
    sh.lineTo(0, 0);
    for (const op of openings || []) {
      const hw = op.w / 2,
        sy = op.y || 0,
        top = op.h + sy;
      const p = new THREE.Path();
      if (op.arch) {
        const springY = top - hw;
        p.moveTo(op.at - hw, sy);
        p.lineTo(op.at + hw, sy);
        p.lineTo(op.at + hw, springY);
        p.absarc(op.at, springY, hw, 0, Math.PI, false);
        p.lineTo(op.at - hw, sy);
      } else if (op.pointed) {
        const springY = top - op.w * 0.85;
        p.moveTo(op.at - hw, sy);
        p.lineTo(op.at + hw, sy);
        p.lineTo(op.at + hw, springY);
        p.quadraticCurveTo(op.at + hw, top - op.w * 0.2, op.at, top);
        p.quadraticCurveTo(op.at - hw, top - op.w * 0.2, op.at - hw, springY);
        p.lineTo(op.at - hw, sy);
      } else {
        p.moveTo(op.at - hw, sy);
        p.lineTo(op.at + hw, sy);
        p.lineTo(op.at + hw, top);
        p.lineTo(op.at - hw, top);
        p.lineTo(op.at - hw, sy);
      }
      sh.holes.push(p);
    }
    const yaw = -Math.atan2(bz - az, bx - ax); // local x → direction A→B
    const mx = (ax + bx) / 2,
      mz = (az + bz) / 2;
    const g = new THREE.ExtrudeGeometry(sh, {
      depth: t,
      bevelEnabled: false,
      curveSegments: o.curveSegments || 10,
    });
    g.translate(-L / 2, 0, -t / 2);
    this.geo(mat, g, {
      x: mx,
      y: y0,
      z: mz,
      ry: yaw,
      tint: o.tint,
      grime: o.grime,
      tile: o.tile,
    });
    g.dispose();
    if (o.collide !== false)
      K.colWall(ax, az, bx, bz, t, y0, y1, openings, o.colOpts);
    return this;
  };

  /**
   * Merge all buckets into meshes under a Group. o: {cast=true, receive=true, lod: metres, parent, name}
   */
