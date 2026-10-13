// play-inline-111 04 — dir
// Lines 731-758 of readable/play-inline-111.pretty.js (statement-aligned).
  const SHEET = {
    door: [0.002, 0.004, 0.248, 0.996],
    directory: [0.252, 0.004, 0.498, 0.996],
    frieze: [0.502, 0.754, 0.998, 0.996],
    name: [0.502, 0.504, 0.998, 0.746],
    mailbox: [0.502, 0.004, 0.748, 0.496],
    daub: [0.752, 0.004, 0.998, 0.496],
  };

  /** Additive light shaft: two crossed quads from p along dir for len, widening w0 → w1. */
  function shaft(b, p, dir, len, w0, w1, tint) {
    const d = new THREE.Vector3(dir[0], dir[1], dir[2]).normalize();
    const up =
      Math.abs(d.y) > 0.95
        ? new THREE.Vector3(1, 0, 0)
        : new THREE.Vector3(0, 1, 0);
    const s1 = new THREE.Vector3().crossVectors(d, up).normalize(),
      s2 = new THREE.Vector3().crossVectors(d, s1).normalize();
    const e = [p[0] + d.x * len, p[1] + d.y * len, p[2] + d.z * len];
    for (const sv of [s1, s2]) {
      const a0 = [p[0] - sv.x * w0, p[1] - sv.y * w0, p[2] - sv.z * w0],
        a1 = [p[0] + sv.x * w0, p[1] + sv.y * w0, p[2] + sv.z * w0];
      const b1 = [e[0] + sv.x * w1, e[1] + sv.y * w1, e[2] + sv.z * w1],
        b0 = [e[0] - sv.x * w1, e[1] - sv.y * w1, e[2] - sv.z * w1];
      b.quad("esb_shaft", b0, b1, a1, a0, { rect: [0, 0, 1, 1], tint });
    }
  }

