// play-inline-78 01 — three
// Lines 16-368 of readable/play-inline-78.pretty.js (statement-aligned).
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
