// play-inline-623 03 — math
// Lines 350-652 of readable/play-inline-623.pretty.js (statement-aligned).
  function rasterTri(x0, y0, z0, x1, y1, z1, x2, y2, z2) {
    let area = (x1 - x0) * (y2 - y0) - (y1 - y0) * (x2 - x0);
    if (area > -1e-6 && area < 1e-6) return;
    if (area < 0) {
      let t = x1;
      x1 = x2;
      x2 = t;
      t = y1;
      y1 = y2;
      y2 = t;
      t = z1;
      z1 = z2;
      z2 = t;
      area = -area;
    }
    const minY = Math.max(0, Math.ceil(Math.min(y0, y1, y2) - 0.5)),
      maxY = Math.min(H - 1, Math.floor(Math.max(y0, y1, y2) - 0.5));
    if (minY > maxY) return;
    const minXf = Math.min(x0, x1, x2),
      maxXf = Math.max(x0, x1, x2);
    if (maxXf < 0.5 || minXf > W - 0.5) return;
    const dzdx = ((z1 - z0) * (y2 - y0) - (z2 - z0) * (y1 - y0)) / area;
    const dzdy = ((z2 - z0) * (x1 - x0) - (z1 - z0) * (x2 - x0)) / area;
    // edges a→b: E = (xb-xa)(y-ya) - (yb-ya)(x-xa) ≥ 0 inside (CCW in this orientation)
    const e0a = -(y1 - y0),
      e1a = -(y2 - y1),
      e2a = -(y0 - y2);
    for (let py = minY; py <= maxY; py++) {
      const yc = py + 0.5;
      let lo = 0,
        hi = W - 1;
      // edge 0: v0→v1
      let b = (x1 - x0) * (yc - y0) - e0a * x0;
      if (e0a > 0) {
        const t = Math.ceil(-b / e0a - 0.5);
        if (t > lo) lo = t;
      } else if (e0a < 0) {
        const t = Math.floor(-b / e0a - 0.5);
        if (t < hi) hi = t;
      } else if (b < 0) continue;
      b = (x2 - x1) * (yc - y1) - e1a * x1;
      if (e1a > 0) {
        const t = Math.ceil(-b / e1a - 0.5);
        if (t > lo) lo = t;
      } else if (e1a < 0) {
        const t = Math.floor(-b / e1a - 0.5);
        if (t < hi) hi = t;
      } else if (b < 0) continue;
      b = (x0 - x2) * (yc - y2) - e2a * x2;
      if (e2a > 0) {
        const t = Math.ceil(-b / e2a - 0.5);
        if (t > lo) lo = t;
      } else if (e2a < 0) {
        const t = Math.floor(-b / e2a - 0.5);
        if (t < hi) hi = t;
      } else if (b < 0) continue;
      if (lo > hi) continue;
      let iz = z0 + dzdx * (lo + 0.5 - x0) + dzdy * (yc - y0);
      let idx = py * W + lo;
      for (let px = lo; px <= hi; px++, idx++, iz += dzdx)
        if (iz > buf[idx]) buf[idx] = iz;
    }
  }
  /** Rasterise a convex world-space polygon (n ≤ 12 vertices in cvx/cvy/cvz). */
  function rasterPoly(n) {
    // world → view
    for (let i = 0; i < n; i++) {
      const x = cvx[i],
        y = cvy[i],
        z = cvz[i];
      tvx[i] = V[0] * x + V[4] * y + V[8] * z + V[12];
      tvy[i] = V[1] * x + V[5] * y + V[9] * z + V[13];
      tvz[i] = -(V[2] * x + V[6] * y + V[10] * z + V[14]); // view depth (positive in front)
    }
    // clip against depth ≥ NEARC
    let m = 0,
      allIn = true,
      anyIn = false;
    for (let i = 0; i < n; i++) {
      if (tvz[i] < NEARC) allIn = false;
      else anyIn = true;
    }
    if (!anyIn) return;
    if (allIn) {
      for (let i = 0; i < n; i++) {
        cvx[i] = tvx[i];
        cvy[i] = tvy[i];
        cvz[i] = tvz[i];
      }
      m = n;
    } else {
      for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        const ai = tvz[i] >= NEARC,
          aj = tvz[j] >= NEARC;
        if (ai) {
          cvx[m] = tvx[i];
          cvy[m] = tvy[i];
          cvz[m] = tvz[i];
          m++;
        }
        if (ai !== aj) {
          const t = (NEARC - tvz[i]) / (tvz[j] - tvz[i]);
          cvx[m] = tvx[i] + (tvx[j] - tvx[i]) * t;
          cvy[m] = tvy[i] + (tvy[j] - tvy[i]) * t;
          cvz[m] = NEARC;
          m++;
        }
      }
    }
    // project (general perspective matrix; view z = -depth)
    for (let i = 0; i < m; i++) {
      const x = cvx[i],
        y = cvy[i],
        vz = -cvz[i];
      const w = P[3] * x + P[7] * y + P[11] * vz + P[15];
      const nx = (P[0] * x + P[4] * y + P[8] * vz + P[12]) / w;
      const ny = (P[1] * x + P[5] * y + P[9] * vz + P[13]) / w;
      sx[i] = (nx * 0.5 + 0.5) * W;
      sy[i] = (ny * 0.5 + 0.5) * H;
      siz[i] = 1 / cvz[i];
    }
    for (let i = 1; i < m - 1; i++)
      rasterTri(
        sx[0],
        sy[0],
        siz[0],
        sx[i],
        sy[i],
        siz[i],
        sx[i + 1],
        sy[i + 1],
        siz[i + 1],
      );
  }
  function rasterPrism(o) {
    const xs = o.xs,
      zs = o.zs,
      n = o.n;
    // camera inside the footprint (and within its height)? then it can't occlude anything sensibly
    let inside = true;
    for (let i = 0; i < n; i++)
      if ((camX - xs[i]) * o.nx[i] + (camZ - zs[i]) * o.nz[i] > 0) {
        inside = false;
        break;
      }
    if (inside && camY > o.y0 - 1 && camY < o.y1 + 1) return;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      const mx = (xs[i] + xs[j]) * 0.5,
        mz = (zs[i] + zs[j]) * 0.5;
      if ((camX - mx) * o.nx[i] + (camZ - mz) * o.nz[i] <= 0) continue; // back face
      cvx[0] = xs[i];
      cvy[0] = o.y0;
      cvz[0] = zs[i];
      cvx[1] = xs[j];
      cvy[1] = o.y0;
      cvz[1] = zs[j];
      cvx[2] = xs[j];
      cvy[2] = o.y1;
      cvz[2] = zs[j];
      cvx[3] = xs[i];
      cvy[3] = o.y1;
      cvz[3] = zs[i];
      rasterPoly(4);
    }
    if (camY > o.y1) {
      for (let i = 0; i < n; i++) {
        cvx[i] = xs[i];
        cvy[i] = o.y1;
        cvz[i] = zs[i];
      }
      rasterPoly(n);
    }
    O.rastered++;
  }

  // ------------------------------------------------------------------
  // Erosion + min pyramid
  // ------------------------------------------------------------------
  function buildPyramid() {
    const ero = O.ero;
    // 3×3 min (inverse depth: min = farthest; 0 = empty → an edge texel becomes empty)
    for (let y = 0; y < H; y++) {
      const y0 = y > 0 ? y - 1 : 0,
        y1 = y < H - 1 ? y + 1 : H - 1;
      for (let x = 0; x < W; x++) {
        const x0 = x > 0 ? x - 1 : 0,
          x1 = x < W - 1 ? x + 1 : W - 1;
        let m = buf[y * W + x];
        if (m > 0) {
          for (let yy = y0; yy <= y1 && m > 0; yy++) {
            const row = yy * W;
            for (let xx = x0; xx <= x1; xx++) {
              const v = buf[row + xx];
              if (v < m) m = v;
            }
          }
          // screen border: treat outside as empty only for real edges (x0/x1 clamp keeps border texels valid)
        }
        ero[y * W + x] = m;
      }
    }
    if (!O.pyr.length) {
      let w = W,
        h = H;
      O.pyr.push(ero);
      O.pw.push(w);
      O.ph.push(h);
      while (w > 2 || h > 2) {
        w = Math.max(1, (w + 1) >> 1);
        h = Math.max(1, (h + 1) >> 1);
        O.pyr.push(new Float32Array(w * h));
        O.pw.push(w);
        O.ph.push(h);
      }
    }
    for (let l = 1; l < O.pyr.length; l++) {
      const src = O.pyr[l - 1],
        sw = O.pw[l - 1],
        sh = O.ph[l - 1],
        dst = O.pyr[l],
        dw = O.pw[l],
        dh = O.ph[l];
      for (let y = 0; y < dh; y++) {
        const sy0 = y * 2,
          sy1 = Math.min(sh - 1, sy0 + 1);
        for (let x = 0; x < dw; x++) {
          const sx0 = x * 2,
            sx1 = Math.min(sw - 1, sx0 + 1);
          let m = src[sy0 * sw + sx0];
          let v = src[sy0 * sw + sx1];
          if (v < m) m = v;
          v = src[sy1 * sw + sx0];
          if (v < m) m = v;
          v = src[sy1 * sw + sx1];
          if (v < m) m = v;
          dst[y * dw + x] = m;
        }
      }
    }
  }

  // ------------------------------------------------------------------
  // Frame: gather + raster occluders
  // ------------------------------------------------------------------
  const cand = [];
  O.frame = function (cam) {
    O.valid = false;
    if (!O.ready) O.build();
    if (!O.list.length) return false;
    const t0 = performance.now();
    setCamera(cam);
    const XMIN = (G.LAYOUT && G.LAYOUT.INTERIOR_X_MIN) || 2500;
    if (camX >= XMIN - 50) return false; // indoors: no city occluders
    // texels per radian (vertical) for the size gate
    const fovR = ((cam.fov || 60) * Math.PI) / 180;
    const pxr =
      (H * 0.5) / Math.tan(fovR * 0.5) / (cam.zoom ? 1 / cam.zoom : 1);
    O.pxPerRad = pxr;
    cand.length = 0;
    const r = Math.ceil(OCC_R / CELL),
      gx = Math.floor(camX / CELL),
      gz = Math.floor(camZ / CELL);
    // forward vector for a cheap behind-the-camera reject
    const fx = -V[2],
      fy = -V[6],
      fz = -V[10]; // third row of the view matrix = camera back axis (negated → forward)
    for (let ix = gx - r; ix <= gx + r; ix++)
      for (let iz = gz - r; iz <= gz + r; iz++) {
        const a = O.grid.get(ix + "," + iz);
        if (!a) continue;
        for (let i = 0; i < a.length; i++) {
          const o = a[i];
          const dx = o.cx - camX,
            dy = o.cy - camY,
            dz = o.cz - camZ;
          const d2 = dx * dx + dy * dy + dz * dz;
          if (d2 > OCC_R * OCC_R) continue;
          const d = Math.sqrt(d2);
          if (dx * fx + dy * fy + dz * fz < -o.r) continue; // fully behind
          if (d > o.r && (o.r / d) * pxr < 2.5) continue; // tiny on screen
          o.d2 = d2;
          cand.push(o);
        }
      }
    cand.sort((a, b) => a.d2 - b.d2);
    buf.fill(0);
    O.rastered = 0;
    const n = Math.min(cand.length, MAX_OCC);
    for (let i = 0; i < n; i++) rasterPrism(cand[i]);
    buildPyramid();
    O.valid = O.rastered > 0;
    R.stats.rasterOccluders = O.rastered;
    O.lastMs = performance.now() - t0;
    return O.valid;
  };

  // ------------------------------------------------------------------
  // Box test. Returns true when the AABB is certainly hidden.
  // ------------------------------------------------------------------
  const px8 = new Float64Array(8),
    py8 = new Float64Array(8);
