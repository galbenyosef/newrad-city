// play-inline-78 02 — skip
// Lines 369-715 of readable/play-inline-78.pretty.js (statement-aligned).
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
