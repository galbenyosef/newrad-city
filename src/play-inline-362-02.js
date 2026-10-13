// play-inline-362 02 — math
// Lines 31-70 of readable/play-inline-362.pretty.js (statement-aligned).
  const PF = G._pws;
  const D = PF.dress;
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  const PI = Math.PI,
    HP = PI / 2,
    TAU = PI * 2;

  const KEY = "singer_building";
  const O = G.LAYOUT.INTERIORS[KEY].origin;
  const OX = O.x,
    OZ = O.z;
  const X = (x) => OX + x,
    Z = (z) => OZ + z;
  const P = (x, y, z) => V3(OX + x, y, OZ + z);
  const LH = 6.2; // lobby ceiling (bottom of the saucer bays)
  const F2 = { x0: 30, x1: 58, z0: -8, z1: 8, h: 4.2 };
  const DM = { cx: 0, cz: 40, y: 30, h: 9 }; // dome: floor y, half-size
  const LN = { cx: 0, cz: 40, y: 54, h: 2.6 }; // lantern

  function sq(a, p) {
    const c = Math.abs(Math.cos(a)),
      s = Math.abs(Math.sin(a));
    return 1 / Math.pow(Math.pow(c, p) + Math.pow(s, p), 1 / p);
  }
  /** Lathe seen from INSIDE: profile [[r,y]...] from the rim up to the crown; faces point inward. */
  function innerLathe(b, key, prof, seg, x, y, z, deformFn, opts) {
    const pts = prof
      .slice()
      .reverse()
      .map((p) => new THREE.Vector2(Math.max(0.0001, p[0]), p[1]));
    const g = new THREE.LatheGeometry(pts, seg);
    if (deformFn) PF.deform(g, deformFn);
    return b.add(
      key,
      g,
      Object.assign({ m: PF.m4(x, y, z), grime: 0.3, noAO: true }, opts || {}),
    );
  }
  PF.innerLathe = innerLathe;

