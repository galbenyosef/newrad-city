// play-inline-413 02 — arcp
// Lines 24-46 of readable/play-inline-413.pretty.js (statement-aligned).
  const PV = G._pf3;
  const K = PV.kit;
  const PI = Math.PI,
    HP = PI / 2;

  const DM = (PV.dm = {
    X0: 136,
    X1: 164,
    Z0: 858,
    Z1: 882,
    FX: 138,
    FZ: 860, // west face x, north face z
    AC: { x: 144, z: 866, r: 6 }, // rounded-corner arc centre
    DA: (3 * PI) / 4, // door angle on the arc (faces the Beaver/Nassau corner)
    GF: 5.2, // ground-floor height
  });
  const arcP = (t, r) => [DM.AC.x + Math.cos(t) * r, DM.AC.z - Math.sin(t) * r];
  DM.arcP = arcP;
  {
    const p = arcP(DM.DA, DM.AC.r + 0.45);
    DM.door = new THREE.Vector3(p[0], 0.51 + 1.3, p[1]);
  }

