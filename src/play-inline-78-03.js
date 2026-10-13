// play-inline-78 03 — seg
// Lines 716-1066 of readable/play-inline-78.pretty.js (statement-aligned).
  M.cyl = function (b, x, y, z, r0, r1, h, seg, o) {
    o = o || {};
    seg = seg || 10;
    const s = o.s || 4,
      cb = o.cb || o.c || W,
      ct = o.ct || o.c || cb;
    const a0 = o.a0 || 0,
      a1 = o.a1 === undefined ? Math.PI * 2 : o.a1;
    const circ = Math.max(r0, r1) * (a1 - a0);
    const slope = (r0 - r1) / (h || 1);
    b.reserve((seg + 1) * 2, seg * 6);
    const base = b.vn;
    for (let i = 0; i <= seg; i++) {
      const a = a0 + ((a1 - a0) * i) / seg,
        ca = Math.cos(a),
        sa = Math.sin(a);
      const nl = Math.hypot(1, slope);
      const nx = ca / nl,
        ny = slope / nl,
        nz = sa / nl;
      const u = (circ * i) / seg / s;
      b.v(x + ca * r0, y, z + sa * r0, nx, ny, nz, u, 0, cb[0], cb[1], cb[2]);
      b.v(
        x + ca * r1,
        y + h,
        z + sa * r1,
        nx,
        ny,
        nz,
        u,
        h / s,
        ct[0],
        ct[1],
        ct[2],
      );
    }
    for (let i = 0; i < seg; i++) {
      const k = base + i * 2;
      // outward-facing winding: (k, k+1, k+3) seen from outside is CW for angles increasing CCW from +x toward +z... verify: use normal test
      b.tri(k, k + 1, k + 3);
      b.tri(k, k + 3, k + 2);
    }
    if (o.capTop && r1 > 0)
      M.disc(b, x, y + h, z, r1, seg, 1, o.cy || ct, s, a0, a1);
    if (o.capBot && r0 > 0) M.disc(b, x, y, z, r0, seg, -1, cb, s, a0, a1);
  };
  /** Horizontal disc (dir=+1 faces up, -1 faces down). */
  M.disc = function (b, x, y, z, r, seg, dir, c, s, a0, a1) {
    c = c || W;
    s = s || 4;
    a0 = a0 || 0;
    a1 = a1 === undefined ? Math.PI * 2 : a1;
    b.reserve(seg + 2, seg * 3);
    const ctr = b.v(x, y, z, 0, dir, 0, x / s, z / s, c[0], c[1], c[2]);
    for (let i = 0; i <= seg; i++) {
      const a = a0 + ((a1 - a0) * i) / seg;
      const px = x + Math.cos(a) * r,
        pz = z + Math.sin(a) * r;
      b.v(px, y, pz, 0, dir, 0, px / s, pz / s, c[0], c[1], c[2]);
    }
    for (let i = 0; i < seg; i++) {
      if (dir > 0) b.tri(ctr, ctr + 2 + i, ctr + 1 + i);
      else b.tri(ctr, ctr + 1 + i, ctr + 2 + i);
    }
  };
  /** Thin vertical bar as a quad facing (nx,nz) (+ back face if ds) — cheap balusters/pickets. */
  M.vbar = function (b, x, z, y0, y1, w, nx, nz, c, ds) {
    c = c || W;
    const rx = (nz * w) / 2,
      rz = (-nx * w) / 2;
    quadS(
      b,
      x - rx,
      y0,
      z - rz,
      x + rx,
      y0,
      z + rz,
      x + rx,
      y1,
      z + rz,
      x - rx,
      y1,
      z - rz,
      nx,
      0,
      nz,
      0,
      0,
      0.1,
      0,
      0.1,
      1,
      0,
      1,
      c,
      c,
    );
    if (ds)
      quadS(
        b,
        x + rx,
        y0,
        z + rz,
        x - rx,
        y0,
        z - rz,
        x - rx,
        y1,
        z - rz,
        x + rx,
        y1,
        z + rz,
        -nx,
        0,
        -nz,
        0,
        0,
        0.1,
        0,
        0.1,
        1,
        0,
        1,
        c,
        c,
      );
  };
  /** Cylinder between two arbitrary points (pipes, poles, cables). */
  M.pipe = function (b, ax, ay, az, bx, by, bz, r, seg, o) {
    o = o || {};
    seg = seg || 6;
    const dx = bx - ax,
      dy = by - ay,
      dz = bz - az,
      len = Math.hypot(dx, dy, dz);
    if (len < 1e-4) return;
    const d = [dx / len, dy / len, dz / len];
    // orthonormal basis
    const up = Math.abs(d[1]) < 0.95 ? [0, 1, 0] : [1, 0, 0];
    let ux = up[1] * d[2] - up[2] * d[1],
      uy = up[2] * d[0] - up[0] * d[2],
      uz = up[0] * d[1] - up[1] * d[0];
    const ul = Math.hypot(ux, uy, uz);
    ux /= ul;
    uy /= ul;
    uz /= ul;
    const vx = d[1] * uz - d[2] * uy,
      vy = d[2] * ux - d[0] * uz,
      vz = d[0] * uy - d[1] * ux;
    const s = o.s || 2,
      c = o.c || W,
      r1 = o.r1 === undefined ? r : o.r1;
    b.reserve((seg + 1) * 2, seg * 6);
    const base = b.vn;
    for (let i = 0; i <= seg; i++) {
      const a = (i / seg) * Math.PI * 2,
        ca = Math.cos(a),
        sa = Math.sin(a);
      const nx = ux * ca + vx * sa,
        ny = uy * ca + vy * sa,
        nz = uz * ca + vz * sa;
      const u = ((i / seg) * (2 * Math.PI * r)) / s;
      b.v(
        ax + nx * r,
        ay + ny * r,
        az + nz * r,
        nx,
        ny,
        nz,
        u,
        0,
        c[0],
        c[1],
        c[2],
      );
      b.v(
        bx + nx * r1,
        by + ny * r1,
        bz + nz * r1,
        nx,
        ny,
        nz,
        u,
        len / s,
        c[0],
        c[1],
        c[2],
      );
    }
    for (let i = 0; i < seg; i++) {
      const k = base + i * 2;
      b.tri(k, k + 2, k + 3);
      b.tri(k, k + 3, k + 1);
    }
  };

  /**
   * Horizontal polygon (array of [x,z]) at height y; world-planar UVs.
   * o: {s, c, down:bool (face -Y)}. Uses ShapeUtils triangulation (concave ok).
   */
  M.poly = function (b, pts, y, o) {
    o = o || {};
    const s = o.s || 4,
      c = o.c || W,
      dir = o.down ? -1 : 1;
    if (pts.length < 3) return;
    const v2 = pts.map((p) => new THREE.Vector2(p[0], p[1]));
    const holes = (o.holes || []).map((h) =>
      h.map((p) => new THREE.Vector2(p[0], p[1])),
    );
    let tris;
    if (pts.length === 3 && !holes.length) tris = [[0, 1, 2]];
    else if (o.convex && !holes.length) {
      tris = [];
      for (let i = 1; i < pts.length - 1; i++) tris.push([0, i, i + 1]);
    } else tris = THREE.ShapeUtils.triangulateShape(v2, holes);
    const all = v2.concat(...holes);
    b.reserve(all.length, tris.length * 3);
    const base = b.vn;
    const cf = o.cf; // optional colour function (x,z)→[r,g,b]
    for (const p of all) {
      const cc = cf ? cf(p.x, p.y) : c;
      b.v(p.x, y, p.y, 0, dir, 0, p.x / s, p.y / s, cc[0], cc[1], cc[2]);
    }
    for (const t of tris) {
      // ensure face points toward dir: compute winding in XZ
      const A = all[t[0]],
        B = all[t[1]],
        C = all[t[2]];
      const cross = (B.x - A.x) * (C.y - A.y) - (B.y - A.y) * (C.x - A.x); // >0 => CCW in x→z plane (which faces -Y in a right-handed Y-up system)
      const facesUp = cross < 0;
      if (facesUp === dir > 0) b.tri(base + t[0], base + t[1], base + t[2]);
      else b.tri(base + t[0], base + t[2], base + t[1]);
    }
  };
  /** Signed area in XZ (positive = counter-clockwise in x→z). */
  M.polyArea = function (pts) {
    let a = 0;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++)
      a += pts[j][0] * pts[i][1] - pts[i][0] * pts[j][1];
    return a / 2;
  };
  /**
   * Vertical side faces for each edge of polygon pts from y0 to y1, facing
   * outward (o.inward to flip). UV u = running length / s, v = y / s.
   */
  M.polySides = function (b, pts, y0, y1, o) {
    o = o || {};
    const s = o.s || 4,
      cb = o.cb || o.c || W,
      ct = o.ct || cb;
    const ccw = M.polyArea(pts) > 0;
    let run = 0;
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i],
        c = pts[(i + 1) % pts.length];
      const dx = c[0] - a[0],
        dz = c[1] - a[1],
        l = Math.hypot(dx, dz);
      if (l < 1e-4) continue;
      // outward normal for CCW (x→z) polygon is (dz, -dx) rotated... compute both and pick by orientation
      // for a CCW (x→z, shoelace>0) polygon the outward normal is (dz, -dx)
      let nx = dz / l,
        nz = -dx / l;
      if (!ccw) {
        nx = -nx;
        nz = -nz;
      }
      if (o.inward) {
        nx = -nx;
        nz = -nz;
      }
      M.quad(
        b,
        [a[0], y0, a[1]],
        [c[0], y0, c[1]],
        [c[0], y1, c[1]],
        [a[0], y1, a[1]],
        [nx, 0, nz],
        [
          run / s,
          y0 / s,
          (run + l) / s,
          y0 / s,
          (run + l) / s,
          y1 / s,
          run / s,
          y1 / s,
        ],
        cb,
        ct,
      );
      run += l;
    }
  };

  /** Append an arbitrary THREE.BufferGeometry transformed by matrix (Matrix4). o: {c, s (uv scale multiplier), cf(x,y,z)} */
  const _v3 = new THREE.Vector3(),
    _n3 = new THREE.Vector3(),
    _nm = new THREE.Matrix3();
  M.geom = function (b, geom, matrix, o) {
    o = o || {};
    const c = o.c || W,
      us = o.us || 1;
    const P = geom.attributes.position,
      Nn = geom.attributes.normal,
      UV = geom.attributes.uv;
    if (!Nn) geom.computeVertexNormals();
    const Nr = geom.attributes.normal;
    _nm.getNormalMatrix(matrix);
    const cnt = P.count;
    const idx = geom.index;
    b.reserve(cnt, idx ? idx.count : cnt);
    const base = b.vn;
    for (let i = 0; i < cnt; i++) {
      _v3.fromBufferAttribute(P, i).applyMatrix4(matrix);
      _n3.fromBufferAttribute(Nr, i).applyMatrix3(_nm).normalize();
      const cc = o.cf ? o.cf(_v3.x, _v3.y, _v3.z, i) : c;
      b.v(
        _v3.x,
        _v3.y,
        _v3.z,
        _n3.x,
        _n3.y,
        _n3.z,
        UV ? UV.getX(i) * us : 0,
        UV ? UV.getY(i) * us : 0,
        cc[0],
        cc[1],
        cc[2],
      );
    }
    if (idx) {
      for (let i = 0; i < idx.count; i += 3)
        b.tri(
          base + idx.getX(i),
          base + idx.getX(i + 1),
          base + idx.getX(i + 2),
        );
    } else {
      for (let i = 0; i < cnt; i += 3)
        b.tri(base + i, base + i + 1, base + i + 2);
    }
  };
  const _m4 = new THREE.Matrix4(),
    _q = new THREE.Quaternion(),
    _e = new THREE.Euler(),
    _p = new THREE.Vector3(),
    _s = new THREE.Vector3();
  /** Build a Matrix4 from position / euler (YXZ) / scale (number or [x,y,z]). */
