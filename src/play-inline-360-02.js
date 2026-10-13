// play-inline-360 02 — segs
// Lines 27-77 of readable/play-inline-360.pretty.js (statement-aligned).
  const PF = G._pws;
  const D = PF.dress;
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  const PI = Math.PI,
    HP = PI / 2,
    TAU = PI * 2;

  const KEY = "st_pauls_chapel";
  const O = G.LAYOUT.INTERIORS[KEY].origin;
  const OX = O.x,
    OZ = O.z;
  const X = (x) => OX + x,
    Z = (z) => OZ + z;
  const P = (x, y, z) => V3(OX + x, y, OZ + z);
  const UNDER = 0,
    MAIN = 3.2,
    GAL = 7.6,
    SPRING = MAIN + 9.2,
    CROWN = MAIN + 11.6;
  const XW = -18,
    XN = -11,
    XE = 16.5,
    ZN = -8.5,
    ZS = 8.5; // shell; XN = narthex/nave partition
  const CH0 = 13; // chancel starts
  const BX = 0,
    BZ = -46,
    BY = 20; // belfry chamber (separate area)

  /** Inward-facing elliptical barrel vault along x (x0..x1), centred on zc, half-width hw, rise, spring y. */
  function innerVault(b, key, x0, x1, zc, hw, rise, y, segs) {
    segs = segs || 14;
    const pos = [];
    const pt = (i, j) => {
      const t = (PI * j) / segs;
      return [i ? x1 : x0, y + rise * Math.sin(t), zc - hw * Math.cos(t)];
    };
    for (let j = 0; j < segs; j++) {
      const a = pt(0, j),
        bq = pt(1, j),
        c = pt(1, j + 1),
        d = pt(0, j + 1);
      pos.push(...a, ...bq, ...c, ...a, ...c, ...d);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.computeVertexNormals();
    b.add(key, g, { grime: 0.25, noAO: true });
  }
  PF.innerVault = innerVault;

