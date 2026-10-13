// play-inline-623 04 — math
// Lines 653-708 of readable/play-inline-623.pretty.js (statement-aligned).
  O.boxOccluded = function (x0, y0, z0, x1, y1, z1) {
    if (!O.valid) return false;
    let minD = 1e9,
      mnx = 1e9,
      mny = 1e9,
      mxx = -1e9,
      mxy = -1e9;
    for (let i = 0; i < 8; i++) {
      const x = i & 1 ? x1 : x0,
        y = i & 2 ? y1 : y0,
        z = i & 4 ? z1 : z0;
      const vx = V[0] * x + V[4] * y + V[8] * z + V[12];
      const vy = V[1] * x + V[5] * y + V[9] * z + V[13];
      const vz = V[2] * x + V[6] * y + V[10] * z + V[14];
      const d = -vz;
      if (d < NEARC) return false;
      if (d < minD) minD = d;
      const w = P[3] * vx + P[7] * vy + P[11] * vz + P[15];
      const sxx =
        (((P[0] * vx + P[4] * vy + P[8] * vz + P[12]) / w) * 0.5 + 0.5) * W;
      const syy =
        (((P[1] * vx + P[5] * vy + P[9] * vz + P[13]) / w) * 0.5 + 0.5) * H;
      if (sxx < mnx) mnx = sxx;
      if (sxx > mxx) mxx = sxx;
      if (syy < mny) mny = syy;
      if (syy > mxy) mxy = syy;
      px8[i] = sxx;
      py8[i] = syy;
    }
    if (mxx < 0 || mxy < 0 || mnx > W || mny > H) return false; // off-screen: the renderer's frustum test handles it
    let rx0 = Math.max(0, Math.floor(mnx)),
      ry0 = Math.max(0, Math.floor(mny));
    let rx1 = Math.min(W - 1, Math.floor(mxx)),
      ry1 = Math.min(H - 1, Math.floor(mxy));
    // threshold: the occluder must be nearer than the unit's nearest corner by 0.5 m + 0.4 %
    const dt = minD * 0.996 - 0.5;
    if (dt <= NEARC) return false;
    const izT = 1 / dt;
    let L = 0;
    while (
      L < O.pyr.length - 1 &&
      ((rx1 >> L) - (rx0 >> L) > 3 || (ry1 >> L) - (ry0 >> L) > 3)
    )
      L++;
    const lv = O.pyr[L],
      lw = O.pw[L];
    const ax0 = rx0 >> L,
      ax1 = rx1 >> L,
      ay0 = ry0 >> L,
      ay1 = ry1 >> L;
    for (let y = ay0; y <= ay1; y++) {
      const row = y * lw;
      for (let x = ax0; x <= ax1; x++) if (!(lv[row + x] > izT)) return false;
    }
    return true;
  };
