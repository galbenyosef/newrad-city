// play-inline-103 01 — ctx
// Lines 20-208 of readable/play-inline-103.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const M = G.map._;

  const CW = 2048,
    CH = 3136;
  const LS = CW / 1024; // label scale relative to the old 1024 px plate
  let xf = null;
  function transform() {
    if (xf) return xf;
    const W = G.LAYOUT.WORLD;
    const s = Math.min(CW / (W.maxX - W.minX), CH / (W.maxZ - W.minZ));
    const ox = (CW - (W.maxX - W.minX) * s) / 2,
      oy = (CH - (W.maxZ - W.minZ) * s) / 2;
    xf = { s, ox, oy, W };
    return xf;
  }
  M.mapXF = transform;
  const P = (x, z) => {
    const t = transform();
    return [t.ox + (x - t.W.minX) * t.s, t.oy + (z - t.W.minZ) * t.s];
  };
  const grey = (v, a) => {
    v = Math.max(0, Math.min(255, v | 0));
    return a === undefined
      ? "rgb(" + v + "," + v + "," + v + ")"
      : "rgba(" + v + "," + v + "," + v + "," + a + ")";
  };

  function pathPoly(ctx, pts, dx, dz) {
    ctx.beginPath();
    pts.forEach((p, i) => {
      const q = P(p[0] + (dx || 0), p[1] + (dz || 0));
      if (i) ctx.lineTo(q[0], q[1]);
      else ctx.moveTo(q[0], q[1]);
    });
    ctx.closePath();
  }
  const rectPts = (x0, z0, x1, z1) => [
    [x0, z0],
    [x1, z0],
    [x1, z1],
    [x0, z1],
  ];

  // sun from the NW (upper left of the plate): shadows fall to the SE
  const SUN = [0.62, 0.78];
  /** Building shadow: the footprint swept along the sun direction (length ∝ height, capped). */
  function shadow(ctx, pts, h) {
    const len = Math.min(46, 3 + h * 0.34),
      n = Math.max(2, Math.min(10, Math.ceil(len / 5)));
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    // convex sweep for rectangles, stacked copies for other shapes
    if (
      pts.length === 4 &&
      pts[0][1] === pts[1][1] &&
      pts[1][0] === pts[2][0]
    ) {
      const [x0, z0] = pts[0],
        [x1, z1] = pts[2],
        dx = SUN[0] * len,
        dz = SUN[1] * len;
      pathPoly(ctx, [
        [x0, z0],
        [x1, z0],
        [x1 + dx, z0 + dz],
        [x1 + dx, z1 + dz],
        [x0 + dx, z1 + dz],
        [x0, z1],
      ]);
      ctx.fill();
      return;
    }
    for (let k = 1; k <= n; k++) {
      pathPoly(ctx, pts, (SUN[0] * len * k) / n, (SUN[1] * len * k) / n);
      ctx.fill();
    }
  }
  /** Lit roof: fill + parapet highlight on the sun side, dark lip on the far side. */
  function roofFill(ctx, pts, v, edge) {
    pathPoly(ctx, pts);
    ctx.fillStyle = grey(v);
    ctx.fill();
    const t = transform();
    ctx.lineWidth = Math.max(1, 0.9 * t.s);
    // shade edges by their outward normal against the sun
    const ccw = M.polyArea(pts) > 0;
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i],
        b = pts[(i + 1) % pts.length];
      const dx = b[0] - a[0],
        dz = b[1] - a[1],
        l = Math.hypot(dx, dz) || 1;
      let nx = dz / l,
        nz = -dx / l;
      if (!ccw) {
        nx = -nx;
        nz = -nz;
      }
      const lit = -(nx * SUN[0] + nz * SUN[1]); // facing the sun → brighter lip
      const qa = P(a[0], a[1]),
        qb = P(b[0], b[1]);
      ctx.strokeStyle =
        lit > 0 ? grey(v + 40 * lit + (edge || 0)) : grey(v * (1 + 0.45 * lit));
      ctx.beginPath();
      ctx.moveTo(qa[0], qa[1]);
      ctx.lineTo(qb[0], qb[1]);
      ctx.stroke();
    }
  }
  function speckle(ctx, pts, r, n, v0, v1, size) {
    const bb = M.polyBBox(pts),
      t = transform();
    for (let i = 0; i < n; i++) {
      const x = r.range(bb.x0, bb.x1),
        z = r.range(bb.z0, bb.z1);
      if (pts.length > 4 && !M.inPoly(x, z, pts)) continue;
      const q = P(x, z),
        s = (size || 1.2) * t.s * r.range(0.6, 1.6);
      ctx.fillStyle = grey(r.range(v0, v1));
      ctx.fillRect(q[0], q[1], s, s);
    }
  }
  /** Roof furniture: bulkheads, a water tank, vents; setback tiers on tall buildings. */
  function roofDetail(ctx, x0, z0, x1, z1, h, v, r, kind) {
    const w = x1 - x0,
      d = z1 - z0;
    if (h > 55 && w > 12 && d > 12 && kind !== "collapsed") {
      const tiers = h > 110 ? 3 : h > 80 ? 2 : 1;
      let a = [x0, z0, x1, z1];
      for (let k = 1; k <= tiers; k++) {
        const ix = (a[2] - a[0]) * r.range(0.12, 0.2),
          iz = (a[3] - a[1]) * r.range(0.12, 0.2);
        const b = [a[0] + ix, a[1] + iz, a[2] - ix, a[3] - iz];
        if (b[2] - b[0] < 5 || b[3] - b[1] < 5) break;
        const pts = rectPts(b[0], b[1], b[2], b[3]);
        shadow(ctx, pts, h * 0.12 * k);
        roofFill(ctx, pts, v + 12 * k, 10);
        a = b;
      }
      // mast / spire dot on the top tier
      if (h > 100) {
        const q = P((a[0] + a[2]) / 2, (a[1] + a[3]) / 2),
          t = transform();
        ctx.fillStyle = grey(v + 70);
        ctx.fillRect(q[0] - t.s, q[1] - t.s, 2 * t.s, 2 * t.s);
      }
      return;
    }
    if (kind === "collapsed") return;
    const nb = w * d > 250 ? 2 : 1;
    for (let i = 0; i < nb; i++) {
      const bw = r.range(2.5, 4.5),
        bd = r.range(2.5, 4.5);
      const bx = r.range(x0 + 1, Math.max(x0 + 1, x1 - bw - 1)),
        bz = r.range(z0 + 1, Math.max(z0 + 1, z1 - bd - 1));
      const pts = rectPts(bx, bz, bx + bw, bz + bd);
      shadow(ctx, pts, 3);
      roofFill(ctx, pts, v + 16, 8);
    }
    if (
      (kind === "apartment" ||
        kind === "tenement" ||
        kind === "commercial" ||
        kind === "shell" ||
        kind === "brownstone") &&
      r() < 0.45 &&
      w > 6 &&
      d > 6
    ) {
      const t = transform(),
        cx = r.range(x0 + 2.5, x1 - 2.5),
        cz = r.range(z0 + 2.5, z1 - 2.5),
        q = P(cx, cz),
        rr = 1.8 * t.s;
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.beginPath();
      ctx.arc(q[0] + SUN[0] * 5 * t.s, q[1] + SUN[1] * 5 * t.s, rr, 0, 7);
      ctx.fill();
      ctx.fillStyle = grey(v + 26);
      ctx.beginPath();
      ctx.arc(q[0], q[1], rr, 0, 7);
      ctx.fill();
      ctx.strokeStyle = grey(v - 25);
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

