// play-inline-79 03 — math
// Lines 612-655 of readable/play-inline-79.pretty.js (statement-aligned).
  M.rasterPoly = function (poly, code) {
    const r = M.raster,
      d = r.data;
    const bb = M.polyBBox(poly);
    const j0 = Math.max(0, Math.floor(bb.z0 - r.Z0)),
      j1 = Math.min(r.RH - 1, Math.ceil(bb.z1 - r.Z0));
    const xsI = [];
    for (let j = j0; j <= j1; j++) {
      const z = r.Z0 + j + 0.5;
      xsI.length = 0;
      for (let i = 0, k = poly.length - 1; i < poly.length; k = i++) {
        const a = poly[k],
          b = poly[i];
        if (a[1] > z !== b[1] > z)
          xsI.push(a[0] + ((z - a[1]) / (b[1] - a[1])) * (b[0] - a[0]));
      }
      xsI.sort((p, q) => p - q);
      for (let k = 0; k + 1 < xsI.length; k += 2) {
        const i0 = Math.max(0, Math.ceil(xsI[k] - r.X0 - 0.5)),
          i1 = Math.min(r.RW - 1, Math.floor(xsI[k + 1] - r.X0 - 0.5));
        const row = j * r.RW;
        for (let i = i0; i <= i1; i++) d[row + i] = code;
      }
    }
  };
  M.rasterRect = function (x0, z0, x1, z1, code) {
    M.rasterPoly(
      [
        [x0, z0],
        [x1, z0],
        [x1, z1],
        [x0, z1],
      ],
      code,
    );
  };
  M.rasterAt = function (x, z) {
    const r = M.raster;
    if (!r) return 1;
    const i = Math.floor(x - r.X0),
      j = Math.floor(z - r.Z0);
    if (i < 0 || j < 0 || i >= r.RW || j >= r.RH) return 0;
    return r.data[j * r.RW + i];
  };
