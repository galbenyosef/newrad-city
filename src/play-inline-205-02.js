// play-inline-205 02 — math
// Lines 21-130 of readable/play-inline-205.pretty.js (statement-aligned).
  const PF = G._pf;
  const K = PF.kit,
    D = PF.dress;
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  const PI = Math.PI,
    HP = Math.PI / 2,
    TAU = Math.PI * 2;

  // Exterior frame
  const TX = -58.5,
    TZ = 782.5; // tower centre
  const TW = 9; // tower width
  const NAVE_X0 = -97,
    NAVE_X1 = -63; // nave + aisles
  const CH_X0 = -105; // chancel west end
  const Z_N = 775,
    Z_S = 790; // aisle outer walls
  const CL_N = 778.5,
    CL_S = 786.5; // clerestory walls
  const LOOKOUT = { x: -58.5, y: 24, z: 789.2 };

  PF.flagDefaults.tr_crypt_open = false; // crypt door unlocked
  PF.flagDefaults.tr_crypt_gate = false; // return stair gate unbolted
  PF.flagDefaults.tr_breach = null; // how the breach was sealed
  PF.flagDefaults.tr_met = false;
  PF.flagDefaults.tr_blessed = 0;

  // ===================================================================
  // helpers
  // ===================================================================
  /** Pointed-arch height at x for an arch spanning x0..x1, springing y0, rise H. */
  function archY(x, x0, x1, y0, H) {
    const W = x1 - x0,
      R = ((W * W) / 4 + H * H) / W,
      xm = (x0 + x1) / 2;
    if (x <= xm) {
      const cx = x0 + R;
      return y0 + Math.sqrt(Math.max(0, R * R - (x - cx) * (x - cx)));
    }
    const cx = x1 - R;
    return y0 + Math.sqrt(Math.max(0, R * R - (x - cx) * (x - cx)));
  }
  /** Pointed barrel vault spanning x0..x1 along zA..zB (underside visible). */
  function vault(b, key, x0, x1, zA, zB, y0, H, opts) {
    opts = opts || {};
    const g = PF.surface(
      (u, v, out) => {
        const x = x0 + u * (x1 - x0);
        out.set(x, archY(x, x0, x1, y0, H), zA + v * (zB - zA));
      },
      opts.nu || 14,
      opts.nv || Math.max(2, Math.round(Math.abs(zB - zA) / 3)),
      {},
    );
    b.add(key, g, {
      grime: opts.grime === undefined ? 0.35 : opts.grime,
      noAO: true,
    });
  }
  /** Rib following the pointed arch across x0..x1 at z (or diagonal to z2). */
  function rib(b, key, x0, x1, z, y0, H, w, z2) {
    const N = 12;
    let prev = null;
    for (let i = 0; i <= N; i++) {
      const t = i / N,
        x = x0 + t * (x1 - x0);
      const p = V3(
        x,
        archY(x, x0, x1, y0, H) - w * 0.3,
        z2 === undefined ? z : z + (z2 - z) * t,
      );
      if (prev) b.beam(key, prev, p, w, w, { grime: 0.3 });
      prev = p;
    }
  }
  /** Headstone (tilted slab with a rounded top). */
  function headstone(b, x, z, ry, r, key) {
    const h = 0.55 + r() * 0.55,
      w = 0.45 + r() * 0.3,
      tilt = (r() - 0.5) * 0.28,
      lean = (r() - 0.5) * 0.12;
    const M = PF.m4(x, 0, z, ry, tilt, lean);
    const kk = key || (r() < 0.65 ? "slate" : "limestone");
    b.add(kk, new THREE.BoxGeometry(w, h, 0.09), {
      m: new THREE.Matrix4().multiplyMatrices(M, PF.m4(0, h / 2 - 0.1, 0)),
      grime: 0.7,
    });
    const top = new THREE.CylinderGeometry(
      w / 2,
      w / 2,
      0.09,
      10,
      1,
      false,
      0,
      PI,
    );
    top.rotateX(HP);
    top.rotateZ(HP);
    if (r() < 0.7)
      b.add(kk, top, {
        m: new THREE.Matrix4().multiplyMatrices(M, PF.m4(0, h - 0.1, 0)),
        grime: 0.7,
      });
    PF.col(x, z, w, 0.3, 0, h, ry, { walkable: false });
  }

  // ===================================================================
  // EXTERIOR
  // ===================================================================
