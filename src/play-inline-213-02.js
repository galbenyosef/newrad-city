// play-inline-213 02 — over
// Lines 17-126 of readable/play-inline-213.pretty.js (statement-aligned).
  const PH = G._pharbor;
  const TAU = Math.PI * 2;

  // Footprint (world)
  const X0 = -539,
    X1 = -501,
    Z0 = 1079,
    Z1 = 1097.5; // central pavilion
  const H = 20; // pavilion eaves
  const TOWERS = [
    [-535.5, 1082],
    [-504.5, 1082],
    [-535.5, 1094],
    [-504.5, 1094],
  ];
  const TS = 3.5; // tower half size
  const WING_H = 15;
  const WINGS = [
    [-552, 1081, -539, 1096],
    [-501, 1081, -488, 1096],
  ];
  const DOOR = { x: -520, z: Z0 };
  PH.ELLIS = { DOOR, X0, X1, Z0, Z1 };

  /** Quoins (alternating long/short limestone blocks) up a vertical corner edge. */
  function quoins(b, x, z, y0, y1, ax, az) {
    // (ax,az): the two outward axes of the corner (signs)
    let k = 0;
    for (let y = y0; y < y1 - 0.3; y += 0.75, k++) {
      const long = k % 2 === 0;
      const lx = long ? 1.1 : 0.6,
        lz = long ? 0.6 : 1.1;
      b.box(
        "limestone",
        x - ax * (lx / 2 - 0.06),
        y,
        z - az * (lz / 2 - 0.06),
        lx,
        0.62,
        lz,
        { seg: false, grime: 0.55 },
      );
    }
  }
  /** Horizontal limestone band around a rectangle. */
  function band(b, x0, z0, x1, z1, y, h, out, key) {
    const o = out || 0.12;
    b.boxMM(key || "limestone", x0 - o, y, z0 - o, x1 + o, y + h, z0 + 0.3, {
      seg: false,
      grime: 0.5,
    });
    b.boxMM(key || "limestone", x0 - o, y, z1 - 0.3, x1 + o, y + h, z1 + o, {
      seg: false,
      grime: 0.5,
    });
    b.boxMM(key || "limestone", x0 - o, y, z0, x0 + 0.3, y + h, z1, {
      seg: false,
      grime: 0.5,
    });
    b.boxMM(key || "limestone", x1 - 0.3, y, z0, x1 + o, y + h, z1, {
      seg: false,
      grime: 0.5,
    });
  }
  /** Hipped roof over a rectangle (eave y, ridge rise). */
  function hipRoof(b, key, x0, z0, x1, z1, y, rise, over) {
    over = over || 0.6;
    const ax0 = x0 - over,
      ax1 = x1 + over,
      az0 = z0 - over,
      az1 = z1 + over;
    const w = ax1 - ax0,
      d = az1 - az0;
    const inset = Math.min(w, d) / 2;
    const rx0 = ax0 + inset,
      rx1 = ax1 - inset,
      rz0 = az0 + inset,
      rz1 = az1 - inset;
    const P = (x, yy, z) => new THREE.Vector3(x, yy, z);
    const top = y + rise;
    const tri = (a, bb, c) => {
      const g = new THREE.BufferGeometry().setFromPoints([a, bb, c]);
      g.computeVertexNormals();
      b.add(key, g, { grime: 0.6 });
    };
    const quad = (a, bb, c, d2) => {
      tri(a, bb, c);
      tri(a, c, d2);
    };
    const ridgeA =
      w >= d ? P(rx0, top, (az0 + az1) / 2) : P((ax0 + ax1) / 2, top, rz0);
    const ridgeB =
      w >= d ? P(rx1, top, (az0 + az1) / 2) : P((ax0 + ax1) / 2, top, rz1);
    const c00 = P(ax0, y, az0),
      c10 = P(ax1, y, az0),
      c11 = P(ax1, y, az1),
      c01 = P(ax0, y, az1);
    if (w >= d) {
      quad(c00, ridgeA, ridgeB, c10); // north (faces -z) — winding for outward normal
      quad(c11, ridgeB, ridgeA, c01); // south
      tri(c01, ridgeA, c00); // west
      tri(c10, ridgeB, c11); // east
    } else {
      quad(c01, ridgeB, ridgeA, c00);
      quad(c10, ridgeA, ridgeB, c11);
      tri(c00, ridgeA, c10);
      tri(c11, ridgeB, c01);
    }
  }

