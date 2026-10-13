// play-inline-137 03 — math
// Lines 341-387 of readable/play-inline-137.pretty.js (statement-aligned).
  function flatironProw(P, RP) {
    let A = 0;
    for (let i = 0; i < P.length; i++) {
      const p = P[i],
        q = P[(i + 1) % P.length];
      A += p[0] * q[1] - q[0] * p[1];
    }
    const sgn = A > 0 ? 1 : -1;
    const nrm = (p, q) => {
      const dx = q[0] - p[0],
        dz = q[1] - p[1],
        l = Math.hypot(dx, dz);
      return [(dz / l) * sgn, (-dx / l) * sgn];
    };
    const n1 = nrm(P[1], P[2]),
      n3 = nrm(P[3], P[4]);
    const k1 = n1[0] * P[1][0] + n1[1] * P[1][1] - RP,
      k3 = n3[0] * P[3][0] + n3[1] * P[3][1] - RP;
    const det = n1[0] * n3[1] - n1[1] * n3[0];
    const c = [
      (k1 * n3[1] - n1[1] * k3) / det,
      (n1[0] * k3 - k1 * n3[0]) / det,
    ];
    const T2 = [c[0] + n1[0] * RP, c[1] + n1[1] * RP],
      T1 = [c[0] + n3[0] * RP, c[1] + n3[1] * RP];
    const a1 = Math.atan2(T1[1] - c[1], T1[0] - c[0]),
      a2 = Math.atan2(T2[1] - c[1], T2[0] - c[0]);
    const pd = Math.atan2(P[0][1] - c[1], P[0][0] - c[0]); // the old prow tip: the arc must pass round it
    let sw = a2 - a1;
    while (sw <= 0) sw += TAU;
    if (Math.cos(a1 + sw / 2 - pd) < 0) sw -= TAU;
    const arc = [];
    for (let k = 1; k < 10; k++) {
      const a = a1 + (sw * k) / 10;
      arc.push([c[0] + Math.cos(a) * RP, c[1] + Math.sin(a) * RP]);
    }
    return {
      Pr: [T2, P[2], P[3], T1].concat(arc),
      c,
      a1,
      sw,
      RP,
      sgn,
      shift0: Math.hypot(P[1][0] - T2[0], P[1][1] - T2[1]),
    };
  }

