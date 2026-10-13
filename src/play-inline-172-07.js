// play-inline-172 07 — len
// Lines 1633-1650 of readable/play-inline-172.pretty.js (statement-aligned).
  F.shaft = function (b, x, y, z, yaw, w, len, tilt, o) {
    o = o || {};
    const dx = Math.sin(yaw) * Math.sin(tilt),
      dz = Math.cos(yaw) * Math.sin(tilt),
      dy = -Math.cos(tilt);
    const ux = Math.cos(yaw),
      uz = -Math.sin(yaw);
    const hw = w / 2;
    const p0 = [x - ux * hw, y, z - uz * hw],
      p1 = [x + ux * hw, y, z + uz * hw];
    const p2 = [p1[0] + dx * len, y + dy * len, p1[2] + dz * len],
      p3 = [p0[0] + dx * len, y + dy * len, p0[2] + dz * len];
    b.quad("shaft", p3, p2, p1, p0, {
      rect: [0, 0, 1, 1],
      tint: o.tint || 0xffffff,
      double: true,
    });
  };
