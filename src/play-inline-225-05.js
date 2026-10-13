// play-inline-225 05 — math
// Lines 949-1264 of readable/play-inline-225.pretty.js (statement-aligned).
  function segHitsOcc(b, ox, oy, oz, ux, uy, uz, len) {
    // bounding-sphere reject: closest approach of the segment to the box centre
    const wx = b.cx - ox,
      wy = b.cy - oy,
      wz = b.cz - oz,
      tp = Math.max(0, Math.min(len, wx * ux + wy * uy + wz * uz));
    const qx = wx - ux * tp,
      qy = wy - uy * tp,
      qz = wz - uz * tp;
    if (qx * qx + qy * qy + qz * qz > b.r * b.r) return false;
    // to box frame (three.js rotation.y = ry: local = R(-ry)·(p − c))
    const px = ox - b.cx,
      pz = oz - b.cz,
      lx = b.c * px - b.s * pz,
      lz = b.s * px + b.c * pz,
      ly = oy - b.cy;
    const dx = b.c * ux - b.s * uz,
      dz = b.s * ux + b.c * uz,
      dy = uy;
    let t0 = -1e9,
      t1 = 1e9;
    for (let k = 0; k < 3; k++) {
      const p = k === 0 ? lx : k === 1 ? ly : lz,
        dd = k === 0 ? dx : k === 1 ? dy : dz,
        h = k === 0 ? b.hx : k === 1 ? b.hy : b.hz;
      if (Math.abs(dd) < 1e-9) {
        if (p < -h || p > h) return false;
        continue;
      }
      let a = (-h - p) / dd,
        c = (h - p) / dd;
      if (a > c) {
        const tt = a;
        a = c;
        c = tt;
      }
      if (a > t0) t0 = a;
      if (c < t1) t1 = c;
      if (t0 > t1) return false;
    }
    return t0 > 0.03 && t0 < len - 0.05;
  }
  /**
   * Direction bins around a light (azimuth × elevation): each occluder goes into the bins its bounding sphere can
   * cover as seen from the light, so a shadow ray only tests the handful of occluders in its direction.
   */
  const NA = 48,
    NE = 24;
  function dirBins(l, list) {
    const bins = new Array(NA * NE),
      near = [];
    for (const b of list) {
      const dx = b.cx - l.x,
        dy = b.cy - l.y,
        dz = b.cz - l.z,
        d = Math.hypot(dx, dy, dz);
      if (d <= b.r * 1.05 + 0.05) {
        near.push(b);
        continue;
      }
      const ang = Math.asin(Math.min(1, (b.r + 0.05) / d)),
        el = Math.asin(dy / d),
        az = Math.atan2(dz, dx);
      const e0 = el - ang,
        e1 = el + ang;
      const i0 = Math.max(0, Math.floor((e0 / Math.PI + 0.5) * NE)),
        i1 = Math.min(NE - 1, Math.floor((e1 / Math.PI + 0.5) * NE));
      const cmax = Math.cos(
        Math.min(Math.PI / 2, Math.max(Math.abs(e0), Math.abs(e1))),
      );
      const fullAz = cmax < 0.2 || ang > 1.2;
      const half = fullAz
        ? Math.PI
        : Math.min(
            Math.PI,
            Math.asin(Math.min(1, Math.sin(ang) / cmax)) + 0.02,
          );
      let j0 = Math.floor(((az - half) / (2 * Math.PI) + 0.5) * NA),
        j1 = Math.floor(((az + half) / (2 * Math.PI) + 0.5) * NA);
      if (fullAz) {
        j0 = 0;
        j1 = NA - 1;
      }
      for (let i = i0; i <= i1; i++)
        for (let j = j0; j <= j1; j++) {
          const jj = ((j % NA) + NA) % NA,
            k = i * NA + jj;
          (bins[k] || (bins[k] = [])).push(b);
        }
    }
    const merged = new Array(NA * NE);
    return {
      n: list.length,
      list(ux, uy, uz) {
        const i = Math.min(
          NE - 1,
          Math.max(
            0,
            Math.floor(
              (Math.asin(Math.max(-1, Math.min(1, uy))) / Math.PI + 0.5) * NE,
            ),
          ),
        );
        const j = Math.min(
            NA - 1,
            Math.max(
              0,
              Math.floor((Math.atan2(uz, ux) / (2 * Math.PI) + 0.5) * NA),
            ),
          ),
          k = i * NA + j;
        let m = merged[k];
        if (!m)
          m = merged[k] = near.length
            ? near.concat(bins[k] || [])
            : bins[k] || [];
        return m;
      },
    };
  }
  const _pinOcc = (b, x, y, z) => {
    const px = x - b.cx,
      pz = z - b.cz,
      lx = b.c * px - b.s * pz,
      lz = b.s * px + b.c * pz;
    return (
      Math.abs(lx) <= b.hx + 0.05 &&
      Math.abs(y - b.cy) <= b.hy + 0.05 &&
      Math.abs(lz) <= b.hz + 0.05
    );
  };
  /** Bake every deferred geometry of this batch (called by build). */
  /**
   * Bake jobs: after build() merged the geometry, every baked mesh keeps a list of ranges (one per source piece,
   * with its bake multiplier). bakeStep(ms) works through them resumably, so the cells can be lit in the
   * background after init (time-sliced) — a cell the player enters is finished at once (LI.bakeCell).
   */
  Batch.prototype._bakePrep = function () {
    if (this._cand) return;
    const L = this.lights,
      occ = this.occlude ? this.occ : [];
    // per light: occluders that can intersect its sphere and do not swallow the light itself
    this._cand = L.map((l) =>
      dirBins(
        l,
        occ.filter(
          (b) =>
            Math.hypot(b.cx - l.x, b.cy - l.y, b.cz - l.z) < l.r + b.r &&
            !_pinOcc(b, l.x, l.y, l.z),
        ),
      ),
    );
    this._cache = new Map();
    this.rays = 0;
    this._ji = 0;
    this._ri = 0;
  };
  Batch.prototype._bakeRange = function (job, rg) {
    const L = this.lights,
      amb = this.amb,
      cand = this._cand,
      cache = this._cache,
      pa = job.P,
      na = job.N,
      out = job.B,
      bm = rg.mul;
    const s0 = rg.o,
      s1 = rg.o + rg.n;
    let bx0 = Infinity,
      by0 = Infinity,
      bz0 = Infinity,
      bx1 = -Infinity,
      by1 = -Infinity,
      bz1 = -Infinity;
    for (let i = s0 * 3; i < s1 * 3; i += 3) {
      const x = pa[i],
        y = pa[i + 1],
        z = pa[i + 2];
      if (x < bx0) bx0 = x;
      if (x > bx1) bx1 = x;
      if (y < by0) by0 = y;
      if (y > by1) by1 = y;
      if (z < bz0) bz0 = z;
      if (z > bz1) bz1 = z;
    }
    const LK = []; // lights whose sphere reaches this piece's bounding box
    for (let k = 0; k < L.length; k++) {
      const l = L[k],
        ex = Math.max(bx0 - l.x, 0, l.x - bx1),
        ey = Math.max(by0 - l.y, 0, l.y - by1),
        ez = Math.max(bz0 - l.z, 0, l.z - bz1);
      if (ex * ex + ey * ey + ez * ez < l.r * l.r) LK.push(k);
    }
    let rays = 0;
    for (let i = s0; i < s1; i++) {
      const x = pa[i * 3],
        y = pa[i * 3 + 1],
        z = pa[i * 3 + 2],
        nx = na[i * 3],
        ny = na[i * 3 + 1],
        nz = na[i * 3 + 2];
      let r = amb.r,
        gg = amb.g,
        b = amb.b;
      for (let kk = 0; kk < LK.length; kk++) {
        const k = LK[kk],
          l = L[k],
          dx = l.x - x,
          dy = l.y - y,
          dz = l.z - z,
          d2 = dx * dx + dy * dy + dz * dz;
        if (d2 > l.r * l.r) continue;
        const d = Math.sqrt(d2) || 1e-3,
          f = 1 - d / l.r,
          ndl = (nx * dx + ny * dy + nz * dz) / d;
        const lam = 0.16 + 0.84 * ndl;
        if (lam <= 0) continue;
        const w = f * f * l.i * lam;
        if (w < 0.008) continue;
        const cb = cand[k];
        if (cb.n && w > 0.025) {
          // faint contributions skip the shadow test
          const key =
            ((Math.imul(k + 1, 73856093) ^
              Math.imul(Math.round(x * 50), 19349663) ^
              Math.imul(Math.round(y * 50), 83492791) ^
              Math.imul(Math.round(z * 50), 2654435761 | 0)) >>>
              0) *
              8 +
            (nx > 0.5
              ? 1
              : nx < -0.5
                ? 2
                : ny > 0.5
                  ? 3
                  : ny < -0.5
                    ? 4
                    : nz > 0.5
                      ? 5
                      : 6);
          let vis = cache.get(key);
          if (vis === undefined) {
            vis = 1;
            rays++;
            const ox = x + nx * 0.06,
              oy = y + ny * 0.06,
              oz = z + nz * 0.06,
              ex = l.x - ox,
              ey = l.y - oy,
              ez = l.z - oz,
              len = Math.hypot(ex, ey, ez) || 1e-3;
            const cl = cb.list(-ex / len, -ey / len, -ez / len);
            for (let q = 0; q < cl.length; q++)
              if (
                segHitsOcc(cl[q], ox, oy, oz, ex / len, ey / len, ez / len, len)
              ) {
                vis = 0;
                break;
              }
            cache.set(key, vis);
          }
          if (!vis) continue;
        }
        r += l.c.r * w;
        gg += l.c.g * w;
        b += l.c.b * w;
      }
      const rr = r * bm,
        g2 = gg * bm,
        b2 = b * bm;
      out[i * 3] = rr < 1.8 ? rr : 1.8;
      out[i * 3 + 1] = g2 < 1.8 ? g2 : 1.8;
      out[i * 3 + 2] = b2 < 1.8 ? b2 : 1.8;
    }
    this.rays += rays;
  };
  /** Bake for up to ms milliseconds (Infinity = finish). Returns true when everything is baked. */
  Batch.prototype.bakeStep = function (ms) {
    const jobs = this.jobs;
    if (!jobs || this.baked) return true;
    const t0 = performance.now();
    try {
      this._bakePrep();
      while (this._ji < jobs.length) {
        const job = jobs[this._ji];
        while (this._ri < job.ranges.length) {
          this._bakeRange(job, job.ranges[this._ri++]);
          if (performance.now() - t0 > ms) {
            this.bakeMs = (this.bakeMs || 0) + (performance.now() - t0);
            return false;
          }
        }
        job.attr.needsUpdate = true;
        this._ji++;
        this._ri = 0;
      }
    } catch (e) {
      G.reportError("landmark_interiors:bake " + this.name, e);
    }
    this.baked = true;
    this._cache = null;
    this._cand = null;
    this.jobs = null;
    this.bakeMs = Math.round((this.bakeMs || 0) + (performance.now() - t0));
    return true;
  };
  /** Segments for a dimension under the batch's tessellation length. */
  Batch.prototype._sg = function (len) {
    return this.seg > 0
      ? Math.max(1, Math.min(48, Math.ceil(len / this.seg)))
      : 1;
  };
  /**
   * Longest-edge bisection of a non-indexed geometry until every edge ≤ maxE (custom shapes: ShapeGeometry fans,
   * lathes, extrusions) so the per-vertex bake has resolution. Interpolates every attribute. Capped at ~24k tris.
   */
