// play-inline-491 02 — math
// Lines 357-394 of readable/play-inline-491.pretty.js (statement-aligned).
  function palmGeo() {
    const g = new THREE.SphereGeometry(1, 24, 18);
    g.rotateX(Math.PI / 2);
    g.rotateZ(Math.PI / 2);
    const pa = g.attributes.position;
    const n = pa.count,
      fx = new Float32Array(n),
      ao = new Float32Array(n);
    const e = 0.5; // <1 = boxier
    const sp = (v) => Math.sign(v) * Math.pow(Math.abs(v), e);
    for (let i = 0; i < n; i++) {
      const ux = pa.getX(i),
        uy = pa.getY(i),
        uz = pa.getZ(i);
      const x = sp(ux),
        y = sp(uy),
        z = sp(uz);
      // half extents: width 0.04, thickness ~0.0125, length 0.044 (z+ = wrist end)
      const t = (z + 1) / 2; // 0 knuckles .. 1 heel
      const X = x * 0.0405 * (1 - 0.1 * t); // narrower at the heel
      const up = smooth(-0.35, 0.35, y),
        fwd = smooth(0.35, -0.35, z);
      let Y = y * (0.0118 + 0.001 * up);
      let Z = z * 0.044;
      Y += 0.0035 * (1 - x * x) * (0.3 + 0.7 * up); // arched back of the hand
      Z -= 0.004 * (1 - x * x) * fwd; // knuckle arc (middle finger furthest forward)
      Y -= 0.0025 * t * t; // slopes down into the wrist
      pa.setXYZ(i, X, Y, Z);
      fx[i] = smooth(0.0, 0.6, -uy);
      ao[i] = 1 - 0.1 * smooth(0.5, 1, -uz) * smooth(-0.2, 0.4, -uy); // under the knuckles, palm side
    }
    g.computeVertexNormals();
    return { geo: g, fx, ao };
  }

  // ------------------------------------------------------------------
  // Skin atlas painting (colour, bump height, roughness) — see REG above
  // ------------------------------------------------------------------
