/* src/map/00_core.js */
/* =====================================================================
 * NEW RAD CITY — MAP MODULE · 00 CORE
 * Owned by: map.  Shared internals for every map file:
 *   - G.map namespace (public API is completed by later files)
 *   - GeoBuf: fast growable geometry accumulator (pos/normal/uv/color)
 *   - primitive emitters (quads, boxes, rotated boxes, cylinders, pipes,
 *     polygons, arbitrary THREE geometries) with an optional transform
 *   - chunked batching: every emitter writes into a per-(material, layer,
 *     120 m chunk) buffer; flush() turns them into merged meshes.
 *   - material resolution through G.mats (textures module) with local
 *     procedural fallbacks, plus map-owned canvas atlases (road markings,
 *     street signs, shop signs, interior & subway signage).
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;

  // Public namespace (replaced wholesale at load time, per contract).
  const MAP = (G.map = { __module: "map" });
  // Internal shared namespace for the map's own files.
  const M = (MAP._ = {});
  M.CHUNK = 240; // batching chunk (= HLOD cell) — bigger chunks keep draw calls low
  M.SIDEWALK_Y = 0.12; // raised sidewalk / block top height
  M.LAKE_Y = -1.2; // Central Park lake & reservoir water surface (= core waterLevel → real swimming)

  // -------------------------------------------------------------------
  // Small helpers
  // -------------------------------------------------------------------
  M.clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  M.lerp = (a, b, t) => a + (b - a) * t;
  M.smooth = (a, b, x) => {
    const t = M.clamp((x - a) / (b - a), 0, 1);
    return t * t * (3 - 2 * t);
  };
  /** Deterministic rng for a given numeric/string seed. */
  M.rng = (seed) =>
    G.util.rng(
      typeof seed === "string"
        ? G.util.hashStr(seed)
        : (seed * 2654435761) >>> 0 || 7,
    );
  M.hash = (x, z, s) =>
    G.util.hash2(
      Math.floor(x * 7.31 + (s || 0) * 131.7),
      Math.floor(z * 3.17 - (s || 0) * 71.3),
    );
  /** Colour helper: hex → [r,g,b] (0..1), optionally multiplied. */
  M.col = function (hex, mul) {
    mul = mul === undefined ? 1 : mul;
    return [
      (((hex >> 16) & 255) / 255) * mul,
      (((hex >> 8) & 255) / 255) * mul,
      ((hex & 255) / 255) * mul,
    ];
  };
  M.mulc = (c, k) => [c[0] * k, c[1] * k, c[2] * k];
  M.mixc = (a, b, t) => [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  ];
  M.WHITE = [1, 1, 1];

  // -------------------------------------------------------------------
  // Global write transform (used e.g. for leaning towers, rotated props)
  // -------------------------------------------------------------------
  let XF = null; // Float32Array(16) column-major matrix or null
  let XN = null; // 3x3 normal matrix (Float32Array(9))
  /** Set a THREE.Matrix4 applied to everything emitted until cleared (null). */
  M.setXF = function (m4) {
    if (!m4) {
      XF = null;
      XN = null;
      return;
    }
    if (m4.isMatrix4 !== true) return;
    XF = Float32Array.from(m4.elements);
    const nm = new THREE.Matrix3().getNormalMatrix(m4);
    XN = Float32Array.from(nm.elements);
  };
  M.getXF = () => XF;
  // Transform stack (compose nested transforms, e.g. a water tower on a leaning tower)
  const xfStack = [];
  let curM = null;
  M.pushXF = function (m4) {
    xfStack.push(curM);
    curM = curM ? curM.clone().multiply(m4) : m4.clone();
    M.setXF(curM);
  };
  M.popXF = function () {
    curM = xfStack.length ? xfStack.pop() : null;
    M.setXF(curM);
  };
  /** Current composed transform (for code that needs to restore it). */
  M.curXF = () => curM;

  // -------------------------------------------------------------------
  // GeoBuf — growable interleaved-by-array geometry accumulator
  // -------------------------------------------------------------------
  const TRI_COUNT = { n: 0 };
  M.TRI_COUNT = TRI_COUNT;
  class GeoBuf {
    constructor() {
      this.cap = 256;
      this.icap = 768;
      this.p = new Float32Array(this.cap * 3);
      this.n = new Float32Array(this.cap * 3);
      this.t = new Float32Array(this.cap * 2);
      this.c = new Float32Array(this.cap * 3);
      this.i = new Uint32Array(this.icap);
      this.vn = 0;
      this.inn = 0;
      this.mnx = this.mny = this.mnz = Infinity;
      this.mxx = this.mxy = this.mxz = -Infinity;
    }
    reserve(nv, ni) {
      if (this.vn + nv > this.cap) {
        let cap = this.cap;
        while (this.vn + nv > cap) cap *= 2;
        const re = (a, k) => {
          const b = new Float32Array(cap * k);
          b.set(a);
          return b;
        };
        this.p = re(this.p, 3);
        this.n = re(this.n, 3);
        this.t = re(this.t, 2);
        this.c = re(this.c, 3);
        this.cap = cap;
      }
      if (this.inn + ni > this.icap) {
        let ic = this.icap;
        while (this.inn + ni > ic) ic *= 2;
        const b = new Uint32Array(ic);
        b.set(this.i);
        this.i = b;
        this.icap = ic;
      }
    }
    /** Push one vertex (world or XF-transformed). Returns its index. */
    v(x, y, z, nx, ny, nz, u, w, r, g, b) {
      if (XF) {
        const e = XF;
        const X = e[0] * x + e[4] * y + e[8] * z + e[12],
          Y = e[1] * x + e[5] * y + e[9] * z + e[13],
          Z = e[2] * x + e[6] * y + e[10] * z + e[14];
        x = X;
        y = Y;
        z = Z;
        const q = XN;
        const NX = q[0] * nx + q[3] * ny + q[6] * nz,
          NY = q[1] * nx + q[4] * ny + q[7] * nz,
          NZ = q[2] * nx + q[5] * ny + q[8] * nz;
        const l = Math.hypot(NX, NY, NZ) || 1;
        nx = NX / l;
        ny = NY / l;
        nz = NZ / l;
      }
      if (x < this.mnx) this.mnx = x;
      if (x > this.mxx) this.mxx = x;
      if (y < this.mny) this.mny = y;
      if (y > this.mxy) this.mxy = y;
      if (z < this.mnz) this.mnz = z;
      if (z > this.mxz) this.mxz = z;
      const k = this.vn++;
      const k3 = k * 3,
        k2 = k * 2;
      this.p[k3] = x;
      this.p[k3 + 1] = y;
      this.p[k3 + 2] = z;
      this.n[k3] = nx;
      this.n[k3 + 1] = ny;
      this.n[k3 + 2] = nz;
      this.t[k2] = u;
      this.t[k2 + 1] = w;
      this.c[k3] = r;
      this.c[k3 + 1] = g;
      this.c[k3 + 2] = b;
      return k;
    }
    tri(a, b, c) {
      const i = this.i;
      i[this.inn++] = a;
      i[this.inn++] = b;
      i[this.inn++] = c;
      TRI_COUNT.n++;
    }
    get empty() {
      return this.inn === 0;
    }
    toGeometry() {
      const g = new THREE.BufferGeometry();
      g.setAttribute(
        "position",
        new THREE.BufferAttribute(this.p.slice(0, this.vn * 3), 3),
      );
      g.setAttribute(
        "normal",
        new THREE.BufferAttribute(this.n.slice(0, this.vn * 3), 3),
      );
      g.setAttribute(
        "uv",
        new THREE.BufferAttribute(this.t.slice(0, this.vn * 2), 2),
      );
      g.setAttribute(
        "color",
        new THREE.BufferAttribute(this.c.slice(0, this.vn * 3), 3),
      );
      const idx =
        this.vn > 65535
          ? this.i.slice(0, this.inn)
          : Uint16Array.from(this.i.subarray(0, this.inn));
      g.setIndex(new THREE.BufferAttribute(idx, 1));
      // bounds tracked while pushing vertices (much cheaper than computeBoundingSphere/Box)
      const bb = new THREE.Box3(
        new THREE.Vector3(this.mnx, this.mny, this.mnz),
        new THREE.Vector3(this.mxx, this.mxy, this.mxz),
      );
      g.boundingBox = bb;
      g.boundingSphere = new THREE.Sphere(
        bb.getCenter(new THREE.Vector3()),
        0.5 *
          Math.hypot(
            this.mxx - this.mnx,
            this.mxy - this.mny,
            this.mxz - this.mnz,
          ),
      );
      return g;
    }
  }
  M.GeoBuf = GeoBuf;

  // -------------------------------------------------------------------
  // Primitive emitters
  // -------------------------------------------------------------------
  const W = M.WHITE;
  /**
   * Quad p0..p3 (each [x,y,z]) with intended outward normal n ([x,y,z]).
   * uv: [u0,v0,u1,v1,u2,v2,u3,v3]. cb = colour of p0,p1 ; ct = colour of p2,p3.
   * Winding is fixed automatically so the face points along n.
   */
  M.quad = function (b, p0, p1, p2, p3, n, uv, cb, ct) {
    cb = cb || W;
    ct = ct || cb;
    quadS(
      b,
      p0[0],
      p0[1],
      p0[2],
      p1[0],
      p1[1],
      p1[2],
      p2[0],
      p2[1],
      p2[2],
      p3[0],
      p3[1],
      p3[2],
      n[0],
      n[1],
      n[2],
      uv[0],
      uv[1],
      uv[2],
      uv[3],
      uv[4],
      uv[5],
      uv[6],
      uv[7],
      cb,
      ct,
    );
  };
  /** Allocation-free quad (scalars). Winding fixed from the intended normal. */
  function quadS(
    b,
    x0,
    y0,
    z0,
    x1,
    y1,
    z1,
    x2,
    y2,
    z2,
    x3,
    y3,
    z3,
    nx,
    ny,
    nz,
    u0,
    v0,
    u1,
    v1,
    u2,
    v2,
    u3,
    v3,
    cb,
    ct,
  ) {
    b.reserve(4, 6);
    const a = b.v(x0, y0, z0, nx, ny, nz, u0, v0, cb[0], cb[1], cb[2]);
    b.v(x1, y1, z1, nx, ny, nz, u1, v1, cb[0], cb[1], cb[2]);
    b.v(x2, y2, z2, nx, ny, nz, u2, v2, ct[0], ct[1], ct[2]);
    b.v(x3, y3, z3, nx, ny, nz, u3, v3, ct[0], ct[1], ct[2]);
    const ux = x1 - x0,
      uy = y1 - y0,
      uz = z1 - z0,
      vx = x3 - x0,
      vy = y3 - y0,
      vz = z3 - z0;
    if (
      (uy * vz - uz * vy) * nx +
        (uz * vx - ux * vz) * ny +
        (ux * vy - uy * vx) * nz >=
      0
    ) {
      b.tri(a, a + 1, a + 2);
      b.tri(a, a + 2, a + 3);
    } else {
      b.tri(a, a + 2, a + 1);
      b.tri(a, a + 3, a + 2);
    }
  }
  M.quadS = quadS;
  /** Triangle with explicit normal (auto winding). */
  M.tri = function (b, p0, p1, p2, n, uv, c) {
    c = c || W;
    b.reserve(3, 3);
    const a = b.v(
      p0[0],
      p0[1],
      p0[2],
      n[0],
      n[1],
      n[2],
      uv[0],
      uv[1],
      c[0],
      c[1],
      c[2],
    );
    b.v(p1[0], p1[1], p1[2], n[0], n[1], n[2], uv[2], uv[3], c[0], c[1], c[2]);
    b.v(p2[0], p2[1], p2[2], n[0], n[1], n[2], uv[4], uv[5], c[0], c[1], c[2]);
    const ux = p1[0] - p0[0],
      uy = p1[1] - p0[1],
      uz = p1[2] - p0[2];
    const vx = p2[0] - p0[0],
      vy = p2[1] - p0[1],
      vz = p2[2] - p0[2];
    const gx = uy * vz - uz * vy,
      gy = uz * vx - ux * vz,
      gz = ux * vy - uy * vx;
    if (gx * n[0] + gy * n[1] + gz * n[2] >= 0) b.tri(a, a + 1, a + 2);
    else b.tri(a, a + 2, a + 1);
  };

  /**
   * Vertical wall quad from (ax,az) to (bx,bz), y0..y1. Outward normal is the
   * right-hand side of a→b when looking from above with +Z south, i.e. for a
   * rectangle traversed (x0,z0)→(x1,z0)→(x1,z1)→(x0,z1) the normals point out.
   * u0/u1, v0/v1: texture coordinates; cb/ct: bottom/top colours.
   */
  M.wall = function (b, ax, az, bx, bz, y0, y1, u0, u1, v0, v1, cb, ct) {
    const dx = bx - ax,
      dz = bz - az,
      l = Math.hypot(dx, dz) || 1;
    // normal = (dz, 0, -dx)/l  (north wall a→b eastward gives (0,0,-1))
    const n = [dz / l, 0, -dx / l];
    M.quad(
      b,
      [ax, y0, az],
      [bx, y0, bz],
      [bx, y1, bz],
      [ax, y1, az],
      n,
      [u0, v0, u1, v0, u1, v1, u0, v1],
      cb,
      ct,
    );
  };

  /**
   * Axis-aligned box with world-planar UVs (s = metres per texture repeat).
   * o: {s, c, cb, ct, skip (bitmask 1:+x 2:-x 4:+y 8:-y 16:+z 32:-z; default 8), uo:[du,dv]}
   */
  M.box = function (b, x0, y0, z0, x1, y1, z1, o) {
    o = o || {};
    const s = o.s || 4,
      skip = o.skip === undefined ? 8 : o.skip;
    const cb = o.cb || o.c || W,
      ct = o.ct || o.c || cb,
      cy = o.cy || ct;
    const du = o.uo ? o.uo[0] : 0,
      dv = o.uo ? o.uo[1] : 0;
    const X0 = x0 / s + du,
      X1 = x1 / s + du,
      Y0 = y0 / s + dv,
      Y1 = y1 / s + dv,
      Z0 = z0 / s + du,
      Z1 = z1 / s + du,
      ZV0 = z0 / s + dv,
      ZV1 = z1 / s + dv;
    if (!(skip & 1))
      quadS(
        b,
        x1,
        y0,
        z0,
        x1,
        y0,
        z1,
        x1,
        y1,
        z1,
        x1,
        y1,
        z0,
        1,
        0,
        0,
        Z0,
        Y0,
        Z1,
        Y0,
        Z1,
        Y1,
        Z0,
        Y1,
        cb,
        ct,
      );
    if (!(skip & 2))
      quadS(
        b,
        x0,
        y0,
        z1,
        x0,
        y0,
        z0,
        x0,
        y1,
        z0,
        x0,
        y1,
        z1,
        -1,
        0,
        0,
        Z1,
        Y0,
        Z0,
        Y0,
        Z0,
        Y1,
        Z1,
        Y1,
        cb,
        ct,
      );
    if (!(skip & 16))
      quadS(
        b,
        x1,
        y0,
        z1,
        x0,
        y0,
        z1,
        x0,
        y1,
        z1,
        x1,
        y1,
        z1,
        0,
        0,
        1,
        X1,
        Y0,
        X0,
        Y0,
        X0,
        Y1,
        X1,
        Y1,
        cb,
        ct,
      );
    if (!(skip & 32))
      quadS(
        b,
        x0,
        y0,
        z0,
        x1,
        y0,
        z0,
        x1,
        y1,
        z0,
        x0,
        y1,
        z0,
        0,
        0,
        -1,
        X0,
        Y0,
        X1,
        Y0,
        X1,
        Y1,
        X0,
        Y1,
        cb,
        ct,
      );
    if (!(skip & 4))
      quadS(
        b,
        x0,
        y1,
        z0,
        x1,
        y1,
        z0,
        x1,
        y1,
        z1,
        x0,
        y1,
        z1,
        0,
        1,
        0,
        X0,
        ZV0,
        X1,
        ZV0,
        X1,
        ZV1,
        X0,
        ZV1,
        cy,
        cy,
      );
    if (!(skip & 8))
      quadS(
        b,
        x0,
        y0,
        z1,
        x1,
        y0,
        z1,
        x1,
        y0,
        z0,
        x0,
        y0,
        z0,
        0,
        -1,
        0,
        x0 / s,
        z1 / s,
        x1 / s,
        z1 / s,
        x1 / s,
        z0 / s,
        x0 / s,
        z0 / s,
        cb,
        cb,
      );
  };

  // Scratch rotation for obox
  function rotM(yaw, pitch, roll) {
    // R = Ry(yaw) * Rx(pitch) * Rz(roll)  (YXZ like the camera)
    const cy = Math.cos(yaw),
      sy = Math.sin(yaw),
      cx = Math.cos(pitch || 0),
      sx = Math.sin(pitch || 0),
      cz = Math.cos(roll || 0),
      sz = Math.sin(roll || 0);
    // columns
    return [
      cy * cz + sy * sx * sz,
      cx * sz,
      -sy * cz + cy * sx * sz,
      -cy * sz + sy * sx * cz,
      cx * cz,
      sy * sz + cy * sx * cz,
      sy * cx,
      -sx,
      cy * cx,
    ];
  }
  M.rotM = rotM;
  /**
   * Oriented box: centre (cx,cy,cz), size (sx,sy,sz), rotation yaw (Y) plus
   * optional o.pitch (X) and o.roll (Z). UVs are local-planar (s metres/repeat).
   */
  const OBP = new Float64Array(24);
  M.obox = function (b, cx, cy, cz, sx, sy, sz, yaw, o) {
    o = o || {};
    const R =
      o.pitch || o.roll ? rotM(yaw || 0, o.pitch || 0, o.roll || 0) : null;
    const cyw = Math.cos(yaw || 0),
      syw = Math.sin(yaw || 0);
    // columns of the rotation (local X, Y, Z axes in world)
    const ax0 = R ? R[0] : cyw,
      ax1 = R ? R[1] : 0,
      ax2 = R ? R[2] : -syw;
    const ay0 = R ? R[3] : 0,
      ay1 = R ? R[4] : 1,
      ay2 = R ? R[5] : 0;
    const az0 = R ? R[6] : syw,
      az1 = R ? R[7] : 0,
      az2 = R ? R[8] : cyw;
    const s = o.s || 4,
      skip = o.skip === undefined ? 0 : o.skip;
    const cb = o.cb || o.c || W,
      ct = o.ct || o.c || cb;
    const hx = sx / 2,
      hy = sy / 2,
      hz = sz / 2;
    // corners: 0 a(-,-,-) 1 b(+,-,-) 2 c(+,-,+) 3 d(-,-,+) 4 e(-,+,-) 5 f(+,+,-) 6 g(+,+,+) 7 h(-,+,+)
    const P = OBP;
    for (let i = 0; i < 8; i++) {
      const lx = i === 1 || i === 2 || i === 5 || i === 6 ? hx : -hx,
        ly = i >= 4 ? hy : -hy,
        lz = i === 2 || i === 3 || i === 6 || i === 7 ? hz : -hz;
      P[i * 3] = cx + ax0 * lx + ay0 * ly + az0 * lz;
      P[i * 3 + 1] = cy + ax1 * lx + ay1 * ly + az1 * lz;
      P[i * 3 + 2] = cz + ax2 * lx + ay2 * ly + az2 * lz;
    }
    const X = sx / s,
      Y = sy / s,
      Z = sz / s;
    const Q = (i0, i1, i2, i3, nx, ny, nz, U, V, c0, c1) =>
      quadS(
        b,
        P[i0 * 3],
        P[i0 * 3 + 1],
        P[i0 * 3 + 2],
        P[i1 * 3],
        P[i1 * 3 + 1],
        P[i1 * 3 + 2],
        P[i2 * 3],
        P[i2 * 3 + 1],
        P[i2 * 3 + 2],
        P[i3 * 3],
        P[i3 * 3 + 1],
        P[i3 * 3 + 2],
        nx,
        ny,
        nz,
        0,
        0,
        U,
        0,
        U,
        V,
        0,
        V,
        c0,
        c1,
      );
    if (!(skip & 1)) Q(1, 2, 6, 5, ax0, ax1, ax2, Z, Y, cb, ct);
    if (!(skip & 2)) Q(3, 0, 4, 7, -ax0, -ax1, -ax2, Z, Y, cb, ct);
    if (!(skip & 4)) Q(4, 5, 6, 7, ay0, ay1, ay2, X, Z, ct, ct);
    if (!(skip & 8)) Q(3, 2, 1, 0, -ay0, -ay1, -ay2, X, Z, cb, cb);
    if (!(skip & 16)) Q(2, 3, 7, 6, az0, az1, az2, X, Y, cb, ct);
    if (!(skip & 32)) Q(0, 1, 5, 4, -az0, -az1, -az2, X, Y, cb, ct);
  };

  /**
   * Beam between two points (square cross-section w×h), e.g. girders, rails,
   * ladders, braces. o.up: optional up hint.
   */
  M.beam = function (b, ax, ay, az, bx, by, bz, w, h, o) {
    const dx = bx - ax,
      dy = by - ay,
      dz = bz - az;
    const len = Math.hypot(dx, dy, dz);
    if (len < 1e-4) return;
    const yaw = Math.atan2(dx, dz); // local +Z along beam
    const pitch = -Math.asin(M.clamp(dy / len, -1, 1));
    const oo = Object.assign({ pitch, skip: 48 }, o || {}); // end faces are rarely visible on thin beams
    M.obox(
      b,
      (ax + bx) / 2,
      (ay + by) / 2,
      (az + bz) / 2,
      w,
      h === undefined ? w : h,
      len,
      yaw,
      oo,
    );
  };

  /**
   * Vertical cylinder / cone frustum. (x,y,z) = bottom centre, r0 bottom radius,
   * r1 top radius, h height, seg segments. o: {s, c, cb, ct, capTop, capBot, a0, a1 (partial arc)}
   */
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
  M.mtx = function (x, y, z, ry, rx, rz, sc) {
    _e.set(rx || 0, ry || 0, rz || 0, "YXZ");
    _q.setFromEuler(_e);
    if (sc === undefined) _s.set(1, 1, 1);
    else if (typeof sc === "number") _s.set(sc, sc, sc);
    else _s.set(sc[0], sc[1], sc[2]);
    _p.set(x, y, z);
    return new THREE.Matrix4().compose(_p, _q, _s);
  };

  // -------------------------------------------------------------------
  // Materials
  // -------------------------------------------------------------------
  // Metres per texture repeat for world-planar mapped materials.
  // (matches the textures module's `meters per tile`, see src/textures/NOTES.md)
  M.TEX_SCALE = {
    asphalt: 8,
    asphalt_lines: 8,
    sidewalk: 3,
    concrete: 4,
    concrete_dark: 4,
    brick_red: 2.7,
    brick_brown: 2.7,
    brick_tan: 2.7,
    stone_limestone: 4,
    granite: 3,
    rust: 2,
    metal_painted: 2,
    metal_panel: 2,
    corrugated: 2,
    wood_rotten: 2,
    wood_planks: 2,
    plaster_stained: 3,
    tile_cryo: 2,
    cryo_wall: 4,
    dirt: 4,
    grass_dead: 4,
    rubble: 4,
    glass_dirty: 2,
    water: 12,
    fabric: 0.5,
    chrome: 2,
    cryo_grey: 2,
    cryo_orange: 2,
    paint_red: 2,
    paint_teal: 2,
    roof_tar: 4,
    curb: 2,
    tile_floor: 2,
    carpet: 2,
    wallpaper: 2,
    terrazzo: 2,
    marble: 3,
    marble_dark: 3,
    tile_subway: 1.2,
    metal_diamond: 1,
    crate_wood: 1,
    cardboard: 0.8,
    concrete_panel: 6,
    brick_white: 2.7,
    metal_scratched: 1,
    stone_brownstone: 3,
  };
  M.sc = (name) => M.TEX_SCALE[name] || 4;

  // Façade atlas layout assumption (one texture repeat = BAYS bays × FLOORS floors).
  // Adjusted at init if the textures module publishes G.tex.facadeInfo.
  M.FACADE = { bayW: 3.0, floorH: 3.5, bays: 4, floors: 4 };
  M.facadeTile = () => ({
    w: M.FACADE.bayW * M.FACADE.bays,
    h: M.FACADE.floorH * M.FACADE.floors,
  });

  const matCache = new Map();
  const texCache = new Map();
  /** Shared fallback / map-owned texture cache. */
  M.texCache = texCache;

  function finishTex(t, srgb) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    if (srgb !== false) t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    t.needsUpdate = true;
    return t;
  }
  M.finishTex = finishTex;
  /**
   * Cut-out atlases (weeds, twigs): a canvas upload loses the colour of fully transparent pixels (they become
   * black), so the GPU mip chain darkens every stroke towards black — tufts read as black silhouettes beyond
   * a few metres. This copies the canvas into a DataTexture whose transparent texels carry `fill` (RGB 0–255)
   * instead, so mips keep the straw colour. Rows are flipped to match a CanvasTexture's default flipY.
   */
  M.cutoutTex = function (cv, fill) {
    const w = cv.width,
      h = cv.height;
    const src = cv.getContext("2d").getImageData(0, 0, w, h).data;
    const out = new Uint8Array(w * h * 4);
    for (let y = 0; y < h; y++) {
      const sy = (h - 1 - y) * w * 4,
        dy = y * w * 4;
      for (let x = 0; x < w * 4; x += 4) {
        const a = src[sy + x + 3];
        if (a < 250) {
          // blend the (un-premultiplied) stroke colour into the fill by coverage: soft edges keep their hue
          const k = a / 255;
          out[dy + x] = src[sy + x] * k + fill[0] * (1 - k);
          out[dy + x + 1] = src[sy + x + 1] * k + fill[1] * (1 - k);
          out[dy + x + 2] = src[sy + x + 2] * k + fill[2] * (1 - k);
        } else {
          out[dy + x] = src[sy + x];
          out[dy + x + 1] = src[sy + x + 1];
          out[dy + x + 2] = src[sy + x + 2];
        }
        out[dy + x + 3] = a;
      }
    }
    const t = new THREE.DataTexture(out, w, h, THREE.RGBAFormat);
    t.generateMipmaps = true;
    t.minFilter = THREE.LinearMipmapLinearFilter;
    t.magFilter = THREE.LinearFilter;
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
    t.needsUpdate = true;
    return t;
  };
  M.canvas = function (w, h) {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    return c;
  };

  // --- Procedural fallback textures (used only when the textures module is absent) ---
  const FB = {
    asphalt: { base: "#3b3a37", noise: 38, speck: "#5a5750", cracks: 6 },
    asphalt_lines: { base: "#3b3a37", noise: 38, speck: "#5a5750", cracks: 6 },
    sidewalk: {
      base: "#8b877c",
      noise: 22,
      grid: 2,
      gridCol: "rgba(40,38,32,0.55)",
      cracks: 3,
    },
    concrete: { base: "#8a867b", noise: 26, blotch: 10 },
    concrete_dark: { base: "#57544d", noise: 26, blotch: 10 },
    brick_red: { brick: "#7a3b2a", mortar: "#8a8274" },
    brick_brown: { brick: "#5b3a2c", mortar: "#7d766a" },
    brick_tan: { brick: "#a08462", mortar: "#8e877a" },
    stone_limestone: { base: "#b3aa94", noise: 18, blocks: [2, 4] },
    granite: { base: "#77746d", noise: 34, blocks: [3, 3] },
    rust: { base: "#6b3f25", noise: 40, blotch: 22, blotchCol: "#8a5230" },
    metal_painted: {
      base: "#4f5a55",
      noise: 18,
      blotch: 12,
      blotchCol: "#6b3f25",
    },
    metal_panel: {
      base: "#676c68",
      noise: 14,
      grid: 2,
      gridCol: "rgba(20,20,20,0.6)",
    },
    corrugated: {
      base: "#6e6a60",
      stripes: 16,
      blotch: 10,
      blotchCol: "#6b3f25",
    },
    wood_rotten: { base: "#5a4630", planks: 6 },
    wood_planks: { base: "#7a6040", planks: 6 },
    plaster_stained: {
      base: "#a79f8c",
      noise: 16,
      blotch: 14,
      blotchCol: "#7e7461",
    },
    tile_cryo: {
      base: "#8d9496",
      noise: 10,
      grid: 4,
      gridCol: "rgba(30,34,36,0.7)",
    },
    cryo_wall: {
      base: "#5d6e78",
      noise: 12,
      grid: 1,
      gridCol: "rgba(20,26,30,0.7)",
      rivets: true,
    },
    dirt: { base: "#5c4f3a", noise: 34, blotch: 14 },
    grass_dead: { base: "#6b6440", noise: 40, blades: true },
    rubble: { base: "#6e675b", noise: 50, chunks: true },
    glass_dirty: { base: "#27302e", noise: 14 },
    water: { base: "#2e3a26", noise: 12 },
    fabric: { base: "#8a7e6a", noise: 20 },
  };
  function fallbackTexture(name) {
    if (texCache.has("fb:" + name)) return texCache.get("fb:" + name);
    const f = FB[name] || { base: "#808080", noise: 20 };
    const S = 256,
      cv = M.canvas(S, S),
      ctx = cv.getContext("2d");
    const r = M.rng("fb" + name);
    ctx.fillStyle = f.base || "#808080";
    ctx.fillRect(0, 0, S, S);
    if (f.brick) {
      ctx.fillStyle = f.mortar;
      ctx.fillRect(0, 0, S, S);
      const bh = 16,
        bw = 42;
      for (let y = 0; y < S; y += bh)
        for (let x = -bw; x < S; x += bw) {
          const off = (((y / bh) % 2) * bw) / 2;
          const k = 0.8 + r() * 0.35;
          const c = new THREE.Color(f.brick).multiplyScalar(k);
          ctx.fillStyle = "#" + c.getHexString();
          ctx.fillRect(x + off + 1, y + 1, bw - 3, bh - 3);
        }
    }
    if (f.noise) {
      const img = ctx.getImageData(0, 0, S, S),
        d = img.data;
      for (let i = 0; i < d.length; i += 4) {
        const n = (r() - 0.5) * f.noise;
        d[i] += n;
        d[i + 1] += n;
        d[i + 2] += n;
      }
      ctx.putImageData(img, 0, 0);
    }
    if (f.blotch)
      for (let i = 0; i < f.blotch; i++) {
        ctx.globalAlpha = 0.08 + r() * 0.15;
        ctx.fillStyle = f.blotchCol || "#000";
        ctx.beginPath();
        ctx.arc(r() * S, r() * S, 8 + r() * 40, 0, 7);
        ctx.fill();
      }
    ctx.globalAlpha = 1;
    if (f.grid) {
      ctx.strokeStyle = f.gridCol;
      ctx.lineWidth = 2;
      const st = S / f.grid;
      for (let i = 0; i <= f.grid; i++) {
        ctx.beginPath();
        ctx.moveTo(i * st, 0);
        ctx.lineTo(i * st, S);
        ctx.moveTo(0, i * st);
        ctx.lineTo(S, i * st);
        ctx.stroke();
      }
    }
    if (f.rivets) {
      ctx.fillStyle = "rgba(15,20,24,0.8)";
      for (let i = 8; i < S; i += 32) {
        ctx.fillRect(i, 6, 3, 3);
        ctx.fillRect(i, S - 9, 3, 3);
      }
    }
    if (f.blocks) {
      ctx.strokeStyle = "rgba(40,36,30,0.45)";
      ctx.lineWidth = 2;
      const bw = S / f.blocks[0],
        bh = S / f.blocks[1];
      for (let y = 0; y < f.blocks[1]; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * bh);
        ctx.lineTo(S, y * bh);
        ctx.stroke();
        for (let x = 0; x < f.blocks[0]; x++) {
          const xx = x * bw + ((y % 2) * bw) / 2;
          ctx.beginPath();
          ctx.moveTo(xx, y * bh);
          ctx.lineTo(xx, (y + 1) * bh);
          ctx.stroke();
        }
      }
    }
    if (f.stripes) {
      for (let i = 0; i < f.stripes; i++) {
        const x = (i * S) / f.stripes;
        const g = ctx.createLinearGradient(x, 0, x + S / f.stripes, 0);
        g.addColorStop(0, "rgba(0,0,0,0.25)");
        g.addColorStop(0.5, "rgba(255,255,255,0.12)");
        g.addColorStop(1, "rgba(0,0,0,0.25)");
        ctx.fillStyle = g;
        ctx.fillRect(x, 0, S / f.stripes, S);
      }
    }
    if (f.planks) {
      for (let i = 0; i < f.planks; i++) {
        ctx.fillStyle = "rgba(0,0,0," + (0.1 + r() * 0.2) + ")";
        ctx.fillRect(0, (i * S) / f.planks, S, 2);
        ctx.fillStyle = "rgba(255,230,190," + r() * 0.08 + ")";
        ctx.fillRect(0, (i * S) / f.planks + 3, S, S / f.planks - 5);
      }
    }
    if (f.cracks) {
      ctx.strokeStyle = "rgba(15,15,12,0.55)";
      ctx.lineWidth = 1.2;
      for (let i = 0; i < f.cracks; i++) {
        let x = r() * S,
          y = r() * S;
        ctx.beginPath();
        ctx.moveTo(x, y);
        for (let k = 0; k < 8; k++) {
          x += (r() - 0.5) * 40;
          y += (r() - 0.5) * 40;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    }
    if (f.speck) {
      ctx.fillStyle = f.speck;
      for (let i = 0; i < 500; i++) ctx.fillRect(r() * S, r() * S, 1.5, 1.5);
    }
    if (f.blades) {
      for (let i = 0; i < 900; i++) {
        ctx.strokeStyle =
          r() < 0.5 ? "rgba(120,110,60,0.5)" : "rgba(60,55,30,0.5)";
        const x = r() * S,
          y = r() * S;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + (r() - 0.5) * 4, y - 4 - r() * 6);
        ctx.stroke();
      }
    }
    if (f.chunks) {
      for (let i = 0; i < 160; i++) {
        const k = (60 + r() * 90) | 0;
        ctx.fillStyle = "rgb(" + k + "," + (k - 6) + "," + (k - 14) + ")";
        ctx.fillRect(r() * S, r() * S, 3 + r() * 12, 3 + r() * 9);
      }
    }
    const t = finishTex(new THREE.CanvasTexture(cv));
    texCache.set("fb:" + name, t);
    return t;
  }
  M.fallbackTexture = fallbackTexture;

  /** Fallback façade atlas (4 bays × 4 floors) for style/variant. */
  const FACADE_FB = {
    apartment: { wall: "#8f6d52", trim: "#b9ab8e", win: "#1c2122" },
    artdeco: { wall: "#a39a86", trim: "#c7bea6", win: "#1a1f22" },
    brownstone: { wall: "#5e4131", trim: "#7d5a45", win: "#161a1a" },
    warehouse: { wall: "#7a3e2c", trim: "#8f8472", win: "#1d2020", arch: true },
    office: { wall: "#7d7f7a", trim: "#9b9d97", win: "#20282a", band: true },
  };
  function fallbackFacade(style, variant) {
    const key = "fbf:" + style + variant;
    if (texCache.has(key)) return texCache.get(key);
    const f = FACADE_FB[style] || FACADE_FB.apartment;
    const S = 512,
      cv = M.canvas(S, S),
      ctx = cv.getContext("2d");
    const r = M.rng(key);
    const wall = new THREE.Color(f.wall).multiplyScalar(0.85 + variant * 0.07);
    ctx.fillStyle = "#" + wall.getHexString();
    ctx.fillRect(0, 0, S, S);
    const img = ctx.getImageData(0, 0, S, S),
      d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const n = (r() - 0.5) * 22;
      d[i] += n;
      d[i + 1] += n;
      d[i + 2] += n;
    }
    ctx.putImageData(img, 0, 0);
    const bw = S / 4,
      fh = S / 4;
    for (let fy = 0; fy < 4; fy++) {
      if (f.band) {
        ctx.fillStyle = f.trim;
        ctx.fillRect(0, fy * fh + fh - 14, S, 10);
      } else {
        ctx.fillStyle = "rgba(0,0,0,0.12)";
        ctx.fillRect(0, fy * fh + fh - 6, S, 3);
      }
      for (let bx = 0; bx < 4; bx++) {
        const x = bx * bw + bw * 0.22,
          y = fy * fh + fh * 0.18,
          w = bw * 0.56,
          h = fh * 0.62;
        ctx.fillStyle = f.trim;
        ctx.fillRect(x - 5, y - 5, w + 10, h + 12);
        const roll = r();
        if (roll < 0.12) {
          ctx.fillStyle = "#6b5236";
          ctx.fillRect(x, y, w, h);
          ctx.fillStyle = "rgba(0,0,0,0.3)";
          for (let k = 0; k < 4; k++) ctx.fillRect(x, y + (k * h) / 4, w, 2);
        } else {
          ctx.fillStyle = roll < 0.45 ? "#0b0d0d" : f.win;
          ctx.fillRect(x, y, w, h);
          if (roll >= 0.45) {
            ctx.fillStyle = "rgba(160,170,150,0.12)";
            ctx.fillRect(x + 2, y + 2, w * 0.4, h * 0.45);
          }
          ctx.fillStyle = f.trim;
          ctx.fillRect(x + w / 2 - 2, y, 4, h);
          ctx.fillRect(x, y + h / 2 - 2, w, 4);
          if (f.arch) {
            ctx.fillStyle = f.trim;
            ctx.beginPath();
            ctx.arc(x + w / 2, y, w / 2 + 5, Math.PI, 0);
            ctx.fill();
            ctx.fillStyle = "#0b0d0d";
            ctx.beginPath();
            ctx.arc(x + w / 2, y, w / 2, Math.PI, 0);
            ctx.fill();
          }
        }
      }
    }
    // grime streaks
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = "rgba(20,18,12," + (0.04 + r() * 0.08) + ")";
      ctx.fillRect(r() * S, r() * S, 2 + r() * 6, 30 + r() * 140);
    }
    const t = finishTex(new THREE.CanvasTexture(cv));
    texCache.set(key, t);
    return t;
  }
  M.fallbackFacade = fallbackFacade;

  // The map calls the masonry apartment-house façade style 'apartment'. The textures module publishes its
  // style ids through G.tex.facadeStyles(); until it lists 'apartment' the map asks for the textures id below.
  const TEX_FACADE_ID = { apartment: "tenement" }; // textures-module facade style id (owner: textures)
  M.texFacadeStyle = function (style) {
    try {
      const tex = G.isStub("tex") ? null : G.tex;
      const list = tex && tex.facadeStyles ? tex.facadeStyles() : null;
      if (list && list.indexOf(style) >= 0) return style;
    } catch (e) {
      /* fall through */
    }
    return TEX_FACADE_ID[style] || style;
  };

  /** Fallback billboard: brand name on a faded retro panel. */
  // [background, ink, display name] per brand id of LAYOUT.BRANDS
  const BRAND_COL = {
    fizzo_cola: ["#a8322a", "#f4ead2", "FIZZO COLA"],
    fizzo_blue: ["#1d4f7a", "#d8f2ff", "FIZZO BLUE"],
    long_winter: ["#1b2f5a", "#f4f0e6", "CIVIL DEFENSE"],
    prairie_root_beer: ["#7a4422", "#f6e2b0", "PRAIRIE ROOT BEER"],
    liberty_jetliner: ["#1c2f5c", "#f2eee2", "LIBERTY JETLINER"],
    first_journal: ["#ece6d6", "#1e3a66", "THE FIRST JOURNAL"],
    pizza_galaxy: ["#20103a", "#ffcf40", "PIZZA GALAXY"],
    empire_brew: ["#1e4a34", "#f0e0b0", "EMPIRE BREW HOUSE"],
    silver_torch: ["#26323e", "#e8eaee", "SILVER TORCH"],
    burger_brigade: ["#c8281e", "#fff0c8", "BURGER BRIGADE"],
    excalibur_gardens: ["#3a2a6a", "#f0d070", "EXCALIBUR GARDENS"],
    junior_rocketeer: ["#e8e4d8", "#c8281e", "JUNIOR ROCKETEER"],
    miracle_mane: ["#2a4a3a", "#f0e0b0", "MIRACLE MANE"],
    big_apple_cab: ["#e0b020", "#151515", "BIG APPLE MOTOR CAB"],
    mama_marinara: ["#c42a1e", "#f6ead0", "MAMA MARINARA'S"],
    hi_octane: ["#f0e6d0", "#c8281e", "HI-OCTANE HARRY'S"],
    vigil: ["#13263a", "#cfeefa", "VIGIL DEFENSE"],
    freedom_flakes: ["#1e3f86", "#f6eedc", "FREEDOM FLAKES"],
    chocolate_zeppelin: ["#5a3420", "#f0e4c8", "CHOCOLATE ZEPPELIN"],
    golden_plain: ["#d8a838", "#4a2410", "GOLDEN PLAIN JERKY"],
    homeguard: ["#e8e4d8", "#1a3a6a", "HOMEGUARD"],
    lonly_tv: ["#2a2a2a", "#e8c860", "LONLY"],
    eagle_motors: ["#16324a", "#f0e8d0", "EAGLE MOTORS"],
    super_sergeant: ["#f0d040", "#b8261c", "SUPER SERGEANT"],
    american_automaton: ["#d6e0e4", "#1a3a4a", "AMERICAN AUTOMATON CO."],
    forever_franks: ["#f0e4c4", "#b01a14", "FOREVER FRANKS"],
    sky_patrol: ["#101838", "#9fd8ff", "SKY PATROL"],
    worlds_fair: ["#e8e2d0", "#1b4f7b", "1964 WORLD'S FAIR"],
  };
  M.fallbackBillboardTex = (brand) => fallbackBillboard(brand);
  function fallbackBillboard(brand) {
    const key = "fbb:" + brand;
    if (texCache.has(key)) return texCache.get(key);
    const cv = M.canvas(512, 256),
      ctx = cv.getContext("2d");
    const c = BRAND_COL[brand] || ["#555", "#eee"];
    ctx.fillStyle = c[0];
    ctx.fillRect(0, 0, 512, 256);
    ctx.fillStyle = c[1];
    ctx.font = "bold 54px Georgia, serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(c[2] || brand.replace(/_/g, " ").toUpperCase(), 256, 110, 480);
    ctx.font = "italic 24px Georgia, serif";
    ctx.fillText("— since 1931 —", 256, 180);
    const r = M.rng(key);
    for (let i = 0; i < 90; i++) {
      ctx.fillStyle = "rgba(40,30,20," + r() * 0.3 + ")";
      ctx.fillRect(r() * 512, r() * 256, 4 + r() * 30, 2 + r() * 20);
    }
    const t = finishTex(new THREE.CanvasTexture(cv));
    t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
    texCache.set(key, t);
    return t;
  }

  const FALLBACK_COLOR = {
    chrome: 0xb8bcc0,
    cryo_grey: 0x2a4f86,
    cryo_orange: 0xd8a830,
    paint_red: 0x8f2a22,
    paint_teal: 0x3d7a74,
    glass: 0x2b3432,
    emissive_window: 0xd8c890,
    neon_green: 0x40ff70,
    neon_red: 0xff4040,
    neon_blue: 0x4090ff,
    neon_yellow: 0xffe060,
    black: 0x151515,
    paint_yellow: 0xc89a28,
    rubber: 0x1c1c1c,
    bone: 0xd8d0b8,
  };

  function isMat(m) {
    return m && m.isMaterial;
  }

  /**
   * Resolve a material key to a (cloned, vertex-coloured) material.
   * Key syntax: "<source>[@variant]" where source is one of
   *   texname                    → G.mats.get(texname)
   *   facade/<style>/<n>         → G.mats.facade(style, n)
   *   bb/<brand>                 → G.mats.billboard(brand)
   *   decal/<name>               → G.tex.decal(name)   (transparent)
   *   my/<atlas>                 → map-owned canvas atlas (see atlases below)
   *   c/<hex>                    → flat colour (untextured trims; rarely used)
   * variants: base, plate (polygon offset back), decal (offset forward+transparent),
   *   ds (double sided), glow (emissive), dark (tinted), nocol (no vertex colours)
   */
  M.mat = function (key) {
    if (matCache.has(key)) return matCache.get(key);
    const at = key.indexOf("@");
    const src = at >= 0 ? key.slice(0, at) : key;
    const variants = at >= 0 ? key.slice(at + 1).split(",") : [];
    let base = null;
    const mats = G.isStub("mats") ? null : G.mats;
    const tex = G.isStub("tex") ? null : G.tex;
    let transparent = false,
      emissive = false;
    try {
      if (src.startsWith("facade/")) {
        const parts = src.split("/");
        if (mats && mats.facade) {
          try {
            base = mats.facade(M.texFacadeStyle(parts[1]), +parts[2]);
          } catch (e1) {
            base = null;
          }
        }
        if (!isMat(base))
          base = new THREE.MeshStandardMaterial({
            map: fallbackFacade(parts[1], +parts[2]),
            roughness: 0.92,
          });
      } else if (src.startsWith("bb/")) {
        const brand = src.slice(3);
        if (mats && mats.billboard) {
          try {
            base = mats.billboard(brand);
          } catch (e1) {
            base = null;
          }
        }
        if (!isMat(base))
          base = new THREE.MeshStandardMaterial({
            map: fallbackBillboard(brand),
            roughness: 0.8,
            emissive: 0x111111,
          });
      } else if (src.startsWith("decal/")) {
        let t = null;
        if (tex && tex.decal) t = tex.decal(src.slice(6));
        if (t && t.isTexture)
          base = new THREE.MeshStandardMaterial({
            map: t,
            transparent: true,
            depthWrite: false,
            roughness: 0.95,
          });
        else base = null;
        transparent = true;
      } else if (src.startsWith("my/")) {
        base = M.atlasMaterial(src.slice(3));
        transparent = !!base && base.transparent;
      } else if (src.startsWith("c/")) {
        base = new THREE.MeshStandardMaterial({
          color: parseInt(src.slice(2), 16),
          roughness: 0.85,
        });
      } else {
        if (mats && mats.get) {
          // the textures module may fail while building optional normal maps → retry without them
          try {
            base = mats.get(src);
          } catch (e1) {
            try {
              base = mats.get(src, { normal: false });
            } catch (e2) {
              base = null;
            }
          }
        }
        if (!isMat(base)) {
          if (FALLBACK_COLOR[src] !== undefined) {
            const col = FALLBACK_COLOR[src];
            base = new THREE.MeshStandardMaterial({
              color: col,
              roughness: src === "chrome" ? 0.3 : 0.6,
              metalness: src === "chrome" ? 0.8 : 0.1,
            });
            if (/neon|emissive/.test(src)) {
              base.emissive = new THREE.Color(col);
              base.emissiveIntensity = 1.2;
              emissive = true;
            }
          } else {
            base = new THREE.MeshStandardMaterial({
              map: fallbackTexture(src),
              roughness: src === "water" ? 0.2 : 0.92,
              metalness: /metal|rust|chrome/.test(src) ? 0.25 : 0,
            });
          }
        }
      }
    } catch (e) {
      G.reportError("map:mat:" + key, e);
      base = null;
    }
    if (!isMat(base))
      base = new THREE.MeshStandardMaterial({
        color: 0x777777,
        roughness: 0.9,
      });
    const m = base.clone();
    m.userData = Object.assign({}, base.userData, {
      shared: true,
      mapKey: key,
    });
    if (!emissive && !variants.includes("nocol")) m.vertexColors = true;
    // Brick: the textures module's 36-course tile is mapped over 2.7 m (TEX_SCALE) → 7.5 cm courses like real NYC
    // common brick. Its height-field normal map reads as shingles at grazing angles on big blank walls → soften it.
    if (/^brick_/.test(src) && m.normalMap) {
      m.normalScale = new THREE.Vector2(0.4, 0.4);
    }
    // Façades: a city dead for 22 years has no lit windows. The textures module's lit-window emissive map
    // (driven day→night through userData.txGlow) is kept only for '@lit' keys (blocks around friendly
    // settlements); everywhere else the emissive channel is removed (also saves a texture fetch).
    if (src.startsWith("facade/") && !variants.includes("lit")) {
      m.emissiveMap = null;
      m.emissive = new THREE.Color(0x000000);
      m.emissiveIntensity = 0;
      delete m.userData.txGlow;
    }
    for (const v of variants) {
      if (v === "base") {
        m.polygonOffset = true;
        m.polygonOffsetFactor = 3;
        m.polygonOffsetUnits = 6;
      } else if (v === "plate") {
        m.polygonOffset = true;
        m.polygonOffsetFactor = 1.5;
        m.polygonOffsetUnits = 3;
      } else if (v === "decal") {
        m.polygonOffset = true;
        m.polygonOffsetFactor = -2;
        m.polygonOffsetUnits = -4;
        m.transparent = true;
        m.depthWrite = false;
      } else if (v === "ds") m.side = THREE.DoubleSide;
      else if (v === "glow") {
        m.emissive = new THREE.Color(0xffffff);
        m.emissiveMap = m.map;
        m.emissiveIntensity = 0.9;
      } else if (v === "gloss") {
        m.roughness = 0.35;
        m.metalness = 0.2;
      } else if (v === "lamp") {
        m.emissive = new THREE.Color(0xffe2a0);
        m.emissiveIntensity = 1.4;
        m.vertexColors = false;
      } else if (v === "lampg") {
        m.emissive = new THREE.Color(0x70ff90);
        m.emissiveIntensity = 1.6;
        m.vertexColors = false;
        m.color = new THREE.Color(0x60e080);
        m.map = null;
      } else if (v === "lampr") {
        m.emissive = new THREE.Color(0xff3020);
        m.emissiveIntensity = 1.6;
        m.vertexColors = false;
        m.color = new THREE.Color(0xa02010);
        m.map = null;
      } else if (v === "lampw") {
        m.emissive = new THREE.Color(0xd8f0ff);
        m.emissiveIntensity = 1.3;
        m.vertexColors = false;
        m.color = new THREE.Color(0xe0f0ff);
        m.map = null;
      } else if (v === "dark") {
        m.color = new THREE.Color(0x555555);
      } else if (v === "fwd") {
        m.polygonOffset = true;
        m.polygonOffsetFactor = -1;
        m.polygonOffsetUnits = -2;
      }
      // grimy display glass you can see the dim shop through
      else if (v === "window") {
        m.transparent = true;
        m.opacity = 0.42;
        m.depthWrite = false;
        m.roughness = 0.18;
        m.metalness = 0.35;
      }
      // faint self-illumination by the surface's own texture (fake bounce light in dark interiors / tunnels)
      // far shores across the rivers: 30 % less haze, and never more than 70 % (1–3 km silhouettes keep ≥ 30 %
      // contrast against the haze) so the skyline doesn't dissolve into flat pale boxes (chains any existing compile hook)
      else if (v === "far") {
        const prevOBC = m.onBeforeCompile,
          prevKey = m.customProgramCacheKey;
        m.onBeforeCompile = function (sh, rr) {
          if (prevOBC) prevOBC.call(this, sh, rr);
          const chunk = THREE.ShaderChunk.fog_fragment || "";
          if (
            chunk &&
            sh.fragmentShader.indexOf("#include <fog_fragment>") >= 0
          ) {
            sh.fragmentShader = sh.fragmentShader.replace(
              "#include <fog_fragment>",
              chunk.replace(
                /gl_FragColor\.rgb = mix\(/g,
                "fogFactor = min(fogFactor * 0.7, 0.7); gl_FragColor.rgb = mix(",
              ),
            );
          }
        };
        m.customProgramCacheKey = function () {
          return (prevKey ? prevKey.call(this) : "") + "|mapFarFog";
        };
      } else if (v === "emis" || v === "emis2") {
        m.emissive = new THREE.Color(v === "emis2" ? 0xd8dcd0 : 0x9a9e94);
        m.emissiveMap = m.map;
        m.emissiveIntensity = v === "emis2" ? 0.32 : 0.2;
        delete m.userData.txGlow;
      }
    }
    if (transparent) {
      m.transparent = true;
      m.depthWrite = false;
      if (!m.polygonOffset) {
        m.polygonOffset = true;
        m.polygonOffsetFactor = -2;
        m.polygonOffsetUnits = -4;
      }
    }
    // map-owned emissive atlases (billboards, neon blades…) join the textures module's day/night glow driver
    if (src.startsWith("my/")) {
      const a = atlases[src.slice(3)];
      if (a && a.glow) M.trackGlow(m, a.glow, a.flicker);
      if (a && a.keepNormal) keepNormal(m);
    }
    matCache.set(key, m);
    return m;
  };
  M.matCache = matCache;
  /**
   * Put a map-built material on the textures module's clone-safe night-glow driver
   * (emissiveIntensity day→night, optional flicker). Without the textures module the
   * intensity is fixed at a sensible in-between value.
   */
  M.trackGlow = function (m, glow, flicker) {
    m.emissiveIntensity = glow[0] + (glow[1] - glow[0]) * 0.35;
    try {
      if (!G.isStub("mats") && G.mats.track)
        G.mats.track(m, { glow, flicker: !!flicker });
    } catch (e) {
      /* optional */
    }
  };

  // -------------------------------------------------------------------
  // Map-owned canvas atlases
  // -------------------------------------------------------------------
  const atlases = {}; // name → {tex, mat, cells...}
  M.atlases = atlases;
  /** Register an atlas builder: fn() → {texture, transparent?, roughness?, emissive?} */
  const atlasBuilders = {};
  M.defineAtlas = function (name, fn) {
    atlasBuilders[name] = fn;
  };
  function keepNormal(m) {
    if (!THREE.ShaderChunk.normal_fragment_begin) return;
    const chunk = THREE.ShaderChunk.normal_fragment_begin.replace(
      /normal \*= faceDirection;/g,
      "",
    );
    const prevOBC = m.onBeforeCompile,
      prevKey = m.customProgramCacheKey;
    m.onBeforeCompile = function (sh, rr) {
      if (prevOBC) prevOBC.call(this, sh, rr);
      sh.fragmentShader = sh.fragmentShader.replace(
        "#include <normal_fragment_begin>",
        chunk,
      );
    };
    m.customProgramCacheKey = function () {
      return (prevKey ? prevKey.call(this) : "") + "|mapKeepNormal";
    };
  }
  M.atlasMaterial = function (name) {
    if (atlases[name]) return atlases[name].mat;
    const b = atlasBuilders[name];
    if (!b) return null;
    const a = b();
    // a.basic → unlit (light shafts, glow pools; usually with a.additive)
    const m = a.basic
      ? new THREE.MeshBasicMaterial({
          map: a.texture,
          transparent: true,
          fog: true,
        })
      : new THREE.MeshStandardMaterial({
          map: a.texture,
          transparent: !!a.transparent,
          roughness: a.roughness === undefined ? 0.85 : a.roughness,
          metalness: a.metalness || 0,
        });
    if (a.additive) {
      m.blending = THREE.AdditiveBlending;
      m.transparent = true;
      a.transparent = true;
    }
    if (a.transparent) {
      m.depthWrite = false;
      m.alphaTest = a.alphaTest || 0;
    } else if (a.alphaTest) m.alphaTest = a.alphaTest; // cut-out (weeds, foliage) stays opaque & depth-writing
    if (a.emissive) {
      m.emissive = new THREE.Color(
        a.emissiveColor === undefined ? 0xffffff : a.emissiveColor,
      );
      m.emissiveMap = a.texture;
      m.emissiveIntensity = a.emissive;
    }
    if (a.side) m.side = a.side;
    // double-sided foliage cards (weed tufts) carry up-facing normals so they light like the ground they grow
    // from — but three's DOUBLE_SIDED path flips the normal on back faces (normal *= faceDirection), which made
    // every tuft seen from its back side render near-black. Keep the authored normal on both faces.
    // (applied in M.mat after the clone — Material.clone() drops onBeforeCompile)
    if (a.keepNormal) keepNormal(m);
    // optional relief from the colour map itself (bark fissures, rock cracks): cheap, no extra texture
    if (a.bump) {
      m.bumpMap = a.bumpMap || a.texture;
      m.bumpScale = a.bump;
    }
    atlases[name] = Object.assign(a, { mat: m });
    return m;
  };
  /** UV rect of cell i in a cols×rows atlas → [u0,v0,u1,v1] (v up). */
  M.cellUV = function (i, cols, rows) {
    const cx = i % cols,
      cy = Math.floor(i / cols);
    const u0 = cx / cols,
      u1 = (cx + 1) / cols;
    const v1 = 1 - cy / rows,
      v0 = 1 - (cy + 1) / rows;
    return [u0 + 0.002, v0 + 0.002, u1 - 0.002, v1 - 0.002];
  };

  // --- Road markings / ground decals atlas (4×4 cells) ---
  M.MARK = {
    WHITE: 0,
    YELLOW: 1,
    CRACKS: 2,
    POTHOLE: 3,
    SCORCH: 4,
    PUDDLE: 5,
    DIRT: 6,
    ONLY: 7,
    ARROW: 8,
    GRIME: 9,
    LITTER: 10,
    STAIN: 11,
    LEAVES: 12,
    BLOOD: 13,
    MOSS: 14,
    SAND: 15,
  };
  M.defineAtlas("markings", function () {
    const S = 1024,
      C = 256,
      cv = M.canvas(S, S),
      ctx = cv.getContext("2d");
    const r = M.rng("markings");
    ctx.clearRect(0, 0, S, S);
    function cell(i) {
      return [(i % 4) * C, Math.floor(i / 4) * C];
    }
    function paint(i, col) {
      const [x, y] = cell(i);
      ctx.fillStyle = col;
      ctx.fillRect(x + 2, y + 2, C - 4, C - 4);
      // weathering: punch holes via destination-out
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      for (let k = 0; k < 760; k++) {
        ctx.globalAlpha = 0.25 + r() * 0.7;
        ctx.fillRect(x + r() * C, y + r() * C, 2 + r() * 14, 1 + r() * 6);
      }
      for (let k = 0; k < 10; k++) {
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.arc(x + r() * C, y + r() * C, 5 + r() * 22, 0, 7);
        ctx.fill();
      }
      ctx.restore();
      ctx.globalAlpha = 1;
    }
    paint(M.MARK.WHITE, "rgba(214,208,190,0.85)");
    paint(M.MARK.YELLOW, "rgba(200,160,50,0.85)");
    {
      // cracks
      const [x, y] = cell(M.MARK.CRACKS);
      ctx.strokeStyle = "rgba(12,11,9,0.85)";
      ctx.lineCap = "round";
      for (let k = 0; k < 7; k++) {
        let px = x + C / 2,
          py = y + C / 2;
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(px, py);
        const ang0 = r() * 7;
        for (let s = 0; s < 9; s++) {
          const a = ang0 + (r() - 0.5) * 1.3;
          px += Math.cos(a) * 14;
          py += Math.sin(a) * 14;
          px = M.clamp(px, x + 4, x + C - 4);
          py = M.clamp(py, y + 4, y + C - 4);
          ctx.lineTo(px, py);
          ctx.lineWidth = Math.max(1, ctx.lineWidth - 0.3);
        }
        ctx.stroke();
      }
    }
    {
      // pothole
      const [x, y] = cell(M.MARK.POTHOLE);
      const g = ctx.createRadialGradient(
        x + C / 2,
        y + C / 2,
        10,
        x + C / 2,
        y + C / 2,
        C / 2 - 8,
      );
      g.addColorStop(0, "rgba(15,13,10,0.95)");
      g.addColorStop(0.55, "rgba(30,26,20,0.9)");
      g.addColorStop(0.8, "rgba(60,55,45,0.6)");
      g.addColorStop(1, "rgba(60,55,45,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      for (let a = 0; a < 6.3; a += 0.3) {
        const rr = (C / 2 - 12) * (0.75 + r() * 0.25);
        ctx.lineTo(x + C / 2 + Math.cos(a) * rr, y + C / 2 + Math.sin(a) * rr);
      }
      ctx.fill();
      ctx.fillStyle = "rgba(90,85,70,0.7)";
      for (let k = 0; k < 40; k++)
        ctx.fillRect(
          x + C / 2 + (r() - 0.5) * 120,
          y + C / 2 + (r() - 0.5) * 120,
          3 + r() * 6,
          3 + r() * 5,
        );
    }
    function radial(i, inner, outer, rds) {
      const [x, y] = cell(i);
      const g = ctx.createRadialGradient(
        x + C / 2,
        y + C / 2,
        4,
        x + C / 2,
        y + C / 2,
        rds || C / 2 - 4,
      );
      g.addColorStop(0, inner);
      g.addColorStop(1, outer);
      ctx.fillStyle = g;
      ctx.fillRect(x, y, C, C);
    }
    radial(M.MARK.SCORCH, "rgba(8,7,6,0.9)", "rgba(20,18,14,0)");
    {
      const [x, y] = cell(M.MARK.SCORCH);
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      for (let k = 0; k < 30; k++) {
        const a = r() * 7,
          d = r() * 110;
        ctx.beginPath();
        ctx.arc(
          x + C / 2 + Math.cos(a) * d,
          y + C / 2 + Math.sin(a) * d,
          3 + r() * 10,
          0,
          7,
        );
        ctx.fill();
      }
    }
    radial(M.MARK.PUDDLE, "rgba(22,28,24,0.85)", "rgba(22,28,24,0)");
    radial(M.MARK.DIRT, "rgba(78,64,44,0.85)", "rgba(78,64,44,0)");
    {
      const [x, y] = cell(M.MARK.DIRT);
      for (let k = 0; k < 200; k++) {
        ctx.fillStyle =
          "rgba(" +
          ((60 + r() * 40) | 0) +
          "," +
          ((50 + r() * 30) | 0) +
          ",30," +
          r() * 0.6 +
          ")";
        ctx.fillRect(
          x + 20 + r() * (C - 40),
          y + 20 + r() * (C - 40),
          2 + r() * 6,
          2 + r() * 6,
        );
      }
    }
    {
      const [x, y] = cell(M.MARK.ONLY);
      ctx.fillStyle = "rgba(214,208,190,0.8)";
      ctx.font = "bold 120px Arial Narrow, Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.save();
      ctx.translate(x + C / 2, y + C / 2);
      ctx.scale(0.55, 1.6);
      ctx.fillText("ONLY", 0, 0);
      ctx.restore();
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      for (let k = 0; k < 200; k++) {
        ctx.globalAlpha = r();
        ctx.fillRect(x + r() * C, y + r() * C, 3 + r() * 10, 2 + r() * 4);
      }
      ctx.restore();
      ctx.globalAlpha = 1;
    }
    {
      const [x, y] = cell(M.MARK.ARROW);
      ctx.fillStyle = "rgba(214,208,190,0.8)";
      ctx.beginPath();
      ctx.moveTo(x + C / 2, y + 10);
      ctx.lineTo(x + C / 2 + 60, y + 90);
      ctx.lineTo(x + C / 2 + 20, y + 90);
      ctx.lineTo(x + C / 2 + 20, y + C - 10);
      ctx.lineTo(x + C / 2 - 20, y + C - 10);
      ctx.lineTo(x + C / 2 - 20, y + 90);
      ctx.lineTo(x + C / 2 - 60, y + 90);
      ctx.fill();
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      for (let k = 0; k < 200; k++) {
        ctx.globalAlpha = r();
        ctx.fillRect(x + r() * C, y + r() * C, 3 + r() * 10, 2 + r() * 4);
      }
      ctx.restore();
      ctx.globalAlpha = 1;
    }
    {
      const [x, y] = cell(M.MARK.GRIME);
      const g = ctx.createLinearGradient(x, y, x, y + C);
      g.addColorStop(0, "rgba(20,18,14,0.0)");
      g.addColorStop(1, "rgba(20,18,14,0.75)");
      ctx.fillStyle = g;
      ctx.fillRect(x, y, C, C);
      for (let k = 0; k < 30; k++) {
        ctx.fillStyle = "rgba(15,13,10," + r() * 0.35 + ")";
        ctx.fillRect(x + r() * C, y + r() * C * 0.5, 2 + r() * 5, C);
      }
    }
    {
      const [x, y] = cell(M.MARK.LITTER);
      for (let k = 0; k < 140; k++) {
        const v = (66 + r() * 60) | 0;
        ctx.fillStyle = "rgba(" + v + "," + (v - 8) + "," + (v - 22) + ",0.85)";
        /* integration: darker, reads as grime not confetti */ ctx.save();
        ctx.translate(x + 10 + r() * (C - 20), y + 10 + r() * (C - 20));
        ctx.rotate(r() * 7);
        ctx.fillRect(-4 - r() * 6, -3 - r() * 4, 6 + r() * 12, 4 + r() * 8);
        ctx.restore();
      }
    }
    radial(M.MARK.STAIN, "rgba(12,12,10,0.7)", "rgba(12,12,10,0)", C / 2 - 30);
    {
      const [x, y] = cell(M.MARK.LEAVES);
      for (let k = 0; k < 260; k++) {
        ctx.fillStyle =
          r() < 0.5 ? "rgba(90,70,40,0.85)" : "rgba(60,50,30,0.85)";
        ctx.save();
        ctx.translate(x + 8 + r() * (C - 16), y + 8 + r() * (C - 16));
        ctx.rotate(r() * 7);
        ctx.beginPath();
        ctx.ellipse(0, 0, 5 + r() * 3, 2.5, 0, 0, 7);
        ctx.fill();
        ctx.restore();
      }
    }
    radial(M.MARK.BLOOD, "rgba(70,10,8,0.85)", "rgba(50,8,6,0)", C / 2 - 40);
    radial(M.MARK.MOSS, "rgba(62,70,40,0.75)", "rgba(62,70,40,0)");
    radial(M.MARK.SAND, "rgba(120,108,84,0.8)", "rgba(120,108,84,0)");
    const t = finishTex(new THREE.CanvasTexture(cv));
    t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
    return { texture: t, transparent: true, roughness: 0.95 };
  });
  M.markUV = (i) => M.cellUV(i, 4, 4);

  // --- Manhattan schist (natural rock, tileable): foliated grey-brown bands, mica glints, cracks, lichen ---
  M.defineAtlas("rock", function () {
    const S = 512,
      cv = M.canvas(S, S),
      ctx = cv.getContext("2d");
    const r = M.rng("schist");
    // periodic value-noise lattice → tileable fBm
    function lattice(n) {
      const a = new Float32Array(n * n);
      for (let i = 0; i < a.length; i++) a[i] = r();
      return a;
    }
    const oct = [
      [4, lattice(4)],
      [8, lattice(8)],
      [16, lattice(16)],
      [32, lattice(32)],
      [64, lattice(64)],
    ];
    const sm = (t) => t * t * (3 - 2 * t);
    function vn(L, n, x, y) {
      // x,y in [0,1)
      const fx = x * n,
        fy = y * n,
        ix = Math.floor(fx),
        iy = Math.floor(fy),
        tx = sm(fx - ix),
        ty = sm(fy - iy);
      const i0 = ((ix % n) + n) % n,
        i1 = (i0 + 1) % n,
        j0 = ((iy % n) + n) % n,
        j1 = (j0 + 1) % n;
      const a = L[j0 * n + i0],
        b = L[j0 * n + i1],
        c = L[j1 * n + i0],
        d = L[j1 * n + i1];
      return (a + (b - a) * tx) * (1 - ty) + (c + (d - c) * tx) * ty;
    }
    function fbm(x, y, from) {
      let v = 0,
        amp = 0.5,
        tot = 0;
      for (let k = from || 0; k < oct.length; k++) {
        v += vn(oct[k][1], oct[k][0], x, y) * amp;
        tot += amp;
        amp *= 0.55;
      }
      return v / tot;
    }
    const img = ctx.createImageData(S, S),
      d = img.data;
    for (let y = 0; y < S; y++)
      for (let x = 0; x < S; x++) {
        const u = x / S,
          v = y / S;
        const warp = fbm(u, v, 1);
        const band = Math.sin(
          2 * Math.PI * (6 * v + 0.9 * warp + 0.15 * vn(oct[1][1], 8, u, v)),
        ); // foliation (6 bands / tile)
        const fine = Math.sin(2 * Math.PI * (23 * v + 2.2 * warp));
        const n = fbm(u + 0.37, v + 0.11, 0);
        let k = 0.52 + (n - 0.5) * 0.55 + band * 0.07 + fine * 0.035;
        // rusty iron staining in the low bands, cool grey in the high ones
        const rr = k * (band > 0.4 ? 0.98 : 1.05),
          gg = k * 0.97,
          bb = k * (band > 0.4 ? 0.95 : 0.86);
        const i = (y * S + x) * 4;
        d[i] = Math.min(255, rr * 205);
        d[i + 1] = Math.min(255, gg * 199);
        d[i + 2] = Math.min(255, bb * 188);
        d[i + 3] = 255;
        if (r() < 0.004) {
          d[i] = d[i + 1] = d[i + 2] = 215;
        } // mica glint
      }
    ctx.putImageData(img, 0, 0);
    const wrap = (fn) => {
      for (const ox of [-S, 0, S])
        for (const oy of [-S, 0, S]) {
          ctx.save();
          ctx.translate(ox, oy);
          fn();
          ctx.restore();
        }
    };
    // cracks along and across the foliation
    ctx.lineCap = "round";
    for (let c = 0; c < 26; c++) {
      let x = r() * S,
        y = r() * S;
      const along = r() < 0.6;
      const pts = [[x, y]];
      for (let s2 = 0; s2 < 12; s2++) {
        x += along ? 10 + r() * 16 : (r() - 0.5) * 16;
        y += along ? (r() - 0.5) * 8 : 8 + r() * 14;
        pts.push([x, y]);
      }
      const w = 0.8 + r() * 2.2;
      wrap(() => {
        ctx.strokeStyle = "rgba(20,18,16,0.75)";
        ctx.lineWidth = w;
        ctx.beginPath();
        pts.forEach((p, i) =>
          i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]),
        );
        ctx.stroke();
        ctx.strokeStyle = "rgba(200,196,186,0.18)";
        ctx.lineWidth = w * 0.6;
        ctx.beginPath();
        pts.forEach((p, i) =>
          i
            ? ctx.lineTo(p[0] + 1.5, p[1] + 1.5)
            : ctx.moveTo(p[0] + 1.5, p[1] + 1.5),
        );
        ctx.stroke();
      });
    }
    // lichen & rust blooms
    for (let i = 0; i < 70; i++) {
      const x = r() * S,
        y = r() * S,
        rds = 3 + r() * 12;
      const col =
        r() < 0.55
          ? "rgba(150,152,120,"
          : r() < 0.6
            ? "rgba(160,110,50,"
            : "rgba(60,64,44,";
      const a = (0.25 + r() * 0.35).toFixed(2);
      wrap(() => {
        for (let k = 0; k < 6; k++) {
          ctx.fillStyle = col + a + ")";
          ctx.beginPath();
          ctx.arc(
            x + (r() - 0.5) * rds,
            y + (r() - 0.5) * rds,
            rds * (0.3 + r() * 0.5),
            0,
            7,
          );
          ctx.fill();
        }
      });
    }
    const t = finishTex(new THREE.CanvasTexture(cv));
    return { texture: t, roughness: 0.93 };
  });

  // --- Fake light: additive shafts / cones / floor pools (unlit, 4 cells in a row) ---
  //   0 vertical shaft (bright top, soft sides)  1 radial pool  2 horizontal beam (bright left)  3 soft square glow
  M.defineAtlas("lightfx", function () {
    const S = 256,
      cv = M.canvas(S * 4, S),
      ctx = cv.getContext("2d");
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, S * 4, S);
    // 0: shaft — brightness falls off downward, sides fade (drawn column by column)
    for (let y = 0; y < S; y++) {
      const vy = Math.pow(1 - y / S, 1.6);
      const g = ctx.createLinearGradient(0, 0, S, 0);
      g.addColorStop(0, "rgba(0,0,0,1)");
      g.addColorStop(
        0.3,
        "rgb(" +
          ((vy * 255) | 0) +
          "," +
          ((vy * 255) | 0) +
          "," +
          ((vy * 255) | 0) +
          ")",
      );
      g.addColorStop(
        0.7,
        "rgb(" +
          ((vy * 255) | 0) +
          "," +
          ((vy * 255) | 0) +
          "," +
          ((vy * 255) | 0) +
          ")",
      );
      g.addColorStop(1, "rgba(0,0,0,1)");
      ctx.fillStyle = g;
      ctx.fillRect(0, y, S, 1);
    }
    // 1: radial pool
    let g = ctx.createRadialGradient(S * 1.5, S / 2, 0, S * 1.5, S / 2, S / 2);
    g.addColorStop(0, "#fff");
    g.addColorStop(0.35, "#8a8a8a");
    g.addColorStop(1, "#000");
    ctx.fillStyle = g;
    ctx.fillRect(S, 0, S, S);
    // 2: horizontal beam (bright at u=0)
    for (let x = 0; x < S; x++) {
      const vx = Math.pow(1 - x / S, 1.4);
      const gg = ctx.createLinearGradient(0, 0, 0, S);
      const c =
        "rgb(" +
        ((vx * 255) | 0) +
        "," +
        ((vx * 255) | 0) +
        "," +
        ((vx * 255) | 0) +
        ")";
      gg.addColorStop(0, "#000");
      gg.addColorStop(0.35, c);
      gg.addColorStop(0.65, c);
      gg.addColorStop(1, "#000");
      ctx.fillStyle = gg;
      ctx.fillRect(S * 2 + x, 0, 1, S);
    }
    // 3: soft square glow
    g = ctx.createRadialGradient(
      S * 3.5,
      S / 2,
      S * 0.1,
      S * 3.5,
      S / 2,
      S * 0.62,
    );
    g.addColorStop(0, "#fff");
    g.addColorStop(1, "#000");
    ctx.fillStyle = g;
    ctx.fillRect(S * 3, 0, S, S);
    const t = finishTex(new THREE.CanvasTexture(cv));
    t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
    return { texture: t, basic: true, additive: true };
  });
  M.lightUV = (i) => [i * 0.25 + 0.004, 0.004, (i + 1) * 0.25 - 0.004, 0.996];
  /**
   * Fake light cone / shaft between a source line (centre s, half-width ws) and a target line (centre t,
   * half-width wt), crossed ('X') so it reads from any side. c = colour × intensity (additive!).
   */
  M.lightCone = function (buf, sx, sy, sz, tx, ty, tz, ws, wt, c, crossed) {
    const uv = M.lightUV(0);
    const dirs =
      crossed === false
        ? [[1, 0]]
        : [
            [1, 0],
            [0, 1],
          ];
    for (const [ax, az] of dirs) {
      M.quad(
        buf,
        [tx - ax * wt, ty, tz - az * wt],
        [tx + ax * wt, ty, tz + az * wt],
        [sx + ax * ws, sy, sz + az * ws],
        [sx - ax * ws, sy, sz - az * ws],
        [az, 0, -ax],
        [uv[0], uv[1], uv[2], uv[1], uv[2], uv[3], uv[0], uv[3]],
        c,
        c,
      );
    }
  };
  /** Additive floor pool of light (radius r) at (x,y,z). */
  M.lightPool = function (buf, x, y, z, rx, rz, c) {
    const uv = M.lightUV(1);
    M.quad(
      buf,
      [x - rx, y, z + rz],
      [x + rx, y, z + rz],
      [x + rx, y, z - rz],
      [x - rx, y, z - rz],
      [0, 1, 0],
      [uv[0], uv[1], uv[2], uv[1], uv[2], uv[3], uv[0], uv[3]],
      c,
      c,
    );
  };

  /**
   * Flat ground decal quad (horizontal) centred at (x,z), size w×d, rotated yaw,
   * atlas cell i. y = surface height (the material has polygon offset).
   */
  M.decal = function (b, x, y, z, w, d, yaw, cell, c, flip) {
    const uv = M.markUV(cell);
    const cs = Math.cos(yaw),
      sn = Math.sin(yaw);
    const hx = w / 2,
      hz = d / 2;
    const P = (lx, lz) => [x + lx * cs + lz * sn, y, z - lx * sn + lz * cs];
    const u0 = flip ? uv[2] : uv[0],
      u1 = flip ? uv[0] : uv[2];
    M.quad(
      b,
      P(-hx, hz),
      P(hx, hz),
      P(hx, -hz),
      P(-hx, -hz),
      [0, 1, 0],
      [u0, uv[1], u1, uv[1], u1, uv[3], u0, uv[3]],
      c || W,
    );
  };

  // -------------------------------------------------------------------
  // Chunked output + HLOD
  // -------------------------------------------------------------------
  // Layers:
  //   always  – single mesh per material, never LOD'ed (ground plates, sea walls, park terrain)
  //   far     – single mesh per material, no shadows (distant skyline filler)
  //   main    – 120 m chunks; shown while the chunk's 240 m LOD cell is within R_NEAR
  //   imp     – building impostors per 240 m cell; shown exactly when its cell's main chunks are hidden
  //   mid     – 120 m chunks; LOD 900 m (park trees)
  //   detail  – 120 m chunks; LOD 300 m (fire escapes, railings, signs, awnings …)
  //   fine    – 120 m chunks; LOD 150 m (decals, clutter)
  //   cryo / subway – interior cells (grouped per cell, toggled by the module)
  const chunkMap = new Map();
  M.chunkMap = chunkMap;
  M.R_NEAR = 560;
  M.CELL = 240;
  M.LAYER_LOD = { detail: 300, fine: 150, mid: 900, near: 330 };
  // start-interior cell layer: 'cryo'
  const START_LAYERS = { cryo: 1 };
  M.START_LAYERS = START_LAYERS;
  const SINGLE = Object.assign({ always: 1, far: 1, subway: 1 }, START_LAYERS);
  /** Interior cell layers: the start interior ('cryo'), 'subway' and every dungeon cell 'int_<key>' (one root per cell, toggled by 90_module). */
  M.isIntLayer = (l) =>
    !!START_LAYERS[l] ||
    l === "subway" ||
    (typeof l === "string" && l.startsWith("int_"));
  const isSingle = (l) => !!SINGLE[l] || M.isIntLayer(l);
  // Material consolidation for outdoor layers: key → [targetKey, colourMultiplier]
  M.REMAP = {
    concrete_dark: ["concrete", [0.6, 0.6, 0.6]],
    roof_tar: ["roof_tar", [1, 1, 1]],
    brick_brown: ["brick_red", [0.72, 0.66, 0.62]],
    chrome: ["metal_painted", [1.35, 1.35, 1.35]],
    wood_planks: ["wood_rotten", [1.2, 1.12, 1.05]],
    metal_panel: ["metal_painted", [1.05, 1.05, 1.05]],
    paint_red: ["metal_painted", [1.6, 0.45, 0.4]],
    paint_teal: ["metal_painted", [0.6, 1.2, 1.1]],
    // shop interiors (dim rooms behind the storefronts): plaster reads the same as tinted concrete in the dark,
    // and concrete is in every chunk already → one draw call less per chunk (interior cells keep real plaster)
    plaster_stained: ["concrete", [1.12, 1.08, 0.98]],
  };
  /** A tinted view onto a GeoBuf (lets remapped materials keep their look via vertex colours). */
  class TintView {
    constructor(buf, k) {
      this.b = buf;
      this.k = k;
    }
    reserve(a, c) {
      this.b.reserve(a, c);
    }
    v(x, y, z, nx, ny, nz, u, w, r, g, bb) {
      const k = this.k;
      return this.b.v(x, y, z, nx, ny, nz, u, w, r * k[0], g * k[1], bb * k[2]);
    }
    tri(a, b, c) {
      this.b.tri(a, b, c);
    }
    get vn() {
      return this.b.vn;
    }
    get empty() {
      return this.b.empty;
    }
  }
  /** Get the GeoBuf for material key at world (x,z) in a layer. */
  const keyInfo = new Map(); // key|layer → {key, tint, single, cs, cells: Map}
  M.buf = function (key, x, z, layer) {
    layer = layer || "main";
    const k1 = key + "|" + layer;
    let ki = keyInfo.get(k1);
    if (!ki) {
      let tint = null,
        rkey = key;
      if (!M.isIntLayer(layer)) {
        const at = key.indexOf("@");
        const base = at >= 0 ? key.slice(0, at) : key;
        const rm = M.REMAP[base];
        if (rm) {
          rkey = rm[0] + (at >= 0 ? key.slice(at) : "");
          tint = rm[1];
        }
      }
      ki = {
        key: rkey,
        tint,
        single: isSingle(layer),
        cs: layer === "imp" ? M.CELL : M.CHUNK,
        cells: new Map(),
      };
      keyInfo.set(k1, ki);
    }
    const cx = ki.single ? 0 : Math.floor(x / ki.cs),
      cz = ki.single ? 0 : Math.floor(z / ki.cs);
    const ck = (cx + 512) * 4096 + (cz + 512);
    let view = ki.cells.get(ck);
    if (!view) {
      const k = ki.key + "|" + layer + "|" + cx + "|" + cz;
      let e = chunkMap.get(k);
      if (!e) {
        e = { key: ki.key, layer, cx, cz, buf: new GeoBuf() };
        chunkMap.set(k, e);
      }
      view = ki.tint ? new TintView(e.buf, ki.tint) : e.buf;
      ki.cells.set(ck, view);
    }
    return view;
  };
  // Materials that should not cast shadows (flat ground, decals, glass, emissive…)
  const NO_CAST =
    /^(asphalt|sidewalk|grass_dead|dirt|water|my\/markings|decal|my\/streetsigns|my\/billboards|glass|emissive|neon|bb\/)|@(base|plate|decal|glow|lamp|fwd)/;
  const CAST =
    /^(facade\/|stone_limestone|brick_red|concrete|granite|wood_rotten|rust|metal_painted|corrugated|rubble|cryo_wall|my\/rock|my\/bark)/;
  M.roots = {};
  M.lodGroups = [];
  M.flushStats = {};
  /** Turn all accumulated buffers into meshes. Returns stats. */
  M.flush = function () {
    return flushImpl(null);
  };
  /** Same as flush, but awaits yieldFn() every ~40 ms so boot can repaint (the loading screen keeps animating). */
  M.flushAsync = function (yieldFn) {
    return flushImpl(yieldFn);
  };
  function flushImpl(yieldFn) {
    const city = M.roots.city || (M.roots.city = new THREE.Group());
    city.name = "map_city";
    const groups = new Map();
    let meshes = 0,
      tris = 0;
    const entries = Array.from(chunkMap.values());
    const run = (i0, t0) => {
      for (let i = i0; i < entries.length; i++) {
        if (yieldFn && performance.now() - t0 > 40) return i;
        one(entries[i]);
      }
      return -1;
    };
    const one = (e) => {
      if (e.buf.empty) return;
      const geo = e.buf.toGeometry();
      const mat = M.mat(e.key);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.name = "map:" + e.key + ":" + e.layer;
      mesh.matrixAutoUpdate = false;
      mesh.updateMatrix();
      // shadow casters: only the big masses in the main/mid/interior layers (the shadow pass costs a draw call per mesh)
      const cast =
        (e.layer === "main" || e.layer === "mid" || !!START_LAYERS[e.layer]) &&
        CAST.test(e.key) &&
        !NO_CAST.test(e.key) &&
        !mat.transparent;
      mesh.castShadow = cast && e.layer !== "subway";
      mesh.receiveShadow =
        !mat.transparent && e.layer !== "far" && e.layer !== "imp";
      if (mat.transparent) mesh.renderOrder = 2;
      tris += geo.index.count / 3;
      meshes++;
      const sk = e.key + ":" + e.layer;
      M.flushStats[sk] = (M.flushStats[sk] || 0) + geo.index.count / 3;
      let parent;
      if (M.isIntLayer(e.layer)) {
        parent = M.roots[e.layer] || (M.roots[e.layer] = new THREE.Group());
        parent.name = "map_" + e.layer;
      } else {
        const gk = e.layer + "|" + e.cx + "|" + e.cz;
        parent = groups.get(gk);
        if (!parent) {
          parent = new THREE.Group();
          parent.name = "chunk_" + gk;
          parent.matrixAutoUpdate = false;
          groups.set(gk, parent);
          city.add(parent);
          if (!isSingle(e.layer)) {
            const cs = e.layer === "imp" ? M.CELL : M.CHUNK;
            const cxw = (e.cx + 0.5) * cs,
              czw = (e.cz + 0.5) * cs;
            M.lodGroups.push({
              g: parent,
              layer: e.layer,
              x: cxw,
              z: czw,
              cellX: (Math.floor(cxw / M.CELL) + 0.5) * M.CELL,
              cellZ: (Math.floor(czw / M.CELL) + 0.5) * M.CELL,
            });
          }
        }
      }
      parent.add(mesh);
    };
    const done = () => {
      chunkMap.clear();
      keyInfo.clear();
      return { meshes, tris: Math.round(tris) };
    };
    if (!yieldFn) {
      run(0, 0);
      return done();
    }
    return (async () => {
      let i = 0;
      while ((i = run(i, performance.now())) >= 0) await yieldFn();
      return done();
    })();
  }
  /** Update HLOD visibility from the camera position (called ~5×/s). */
  M.updateLOD = function (cam) {
    const R2 = M.R_NEAR * M.R_NEAR;
    for (const l of M.lodGroups) {
      const cdx = l.cellX - cam.x,
        cdz = l.cellZ - cam.z;
      const nearCell = cdx * cdx + cdz * cdz <= R2;
      let vis;
      if (l.layer === "imp") vis = !nearCell;
      else if (l.layer === "main") vis = nearCell;
      else {
        const lod = M.LAYER_LOD[l.layer] || 1e9;
        const dx = l.x - cam.x,
          dz = l.z - cam.z;
        vis = dx * dx + dz * dz < lod * lod && (l.layer === "mid" || nearCell);
      }
      l.g.visible = vis;
    }
  };

  // -------------------------------------------------------------------
  // Collider helpers (thin wrappers; everything goes through G.world)
  // -------------------------------------------------------------------
  M.colliders = [];
  M.box3 = function (x0, y0, z0, x1, y1, z1, opts) {
    const c = G.world.addBox(
      Math.min(x0, x1),
      y0,
      Math.min(z0, z1),
      Math.max(x0, x1),
      y1,
      Math.max(z0, z1),
      opts,
    );
    M.colliders.push(c);
    return c;
  };
  /**
   * Oriented collider using THREE's yaw convention (same as M.obox / M.mtx:
   * local +X → world (cos y, 0, -sin y)). The engine's collider yaw rotates
   * the opposite way, so we negate here. w = local X size, d = local Z size.
   */
  M.ocol = function (cx, cz, w, d, y0, y1, yaw, opts) {
    const c = G.world.addCollider(cx, cz, w, d, y0, y1, -(yaw || 0), opts);
    M.colliders.push(c);
    return c;
  };

  // Utility: point in polygon (array of [x,z])
  M.inPoly = (x, z, poly) => G.LAYOUT.pointInPoly(x, z, poly);
})();
