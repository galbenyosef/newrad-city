// play-inline-491 01 — the
// Lines 27-356 of readable/play-inline-491.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  const P = G.weapons._;
  const GEO = P.GEO;

  // ------------------------------------------------------------------
  // Hand poses: fingers [index, middle, ring, pinky] x [base, mid, tip] curls
  // (radians, negative = toward palm), spread per finger, thumb params.
  // thumb t = [dirX, dirY, dirZ, roll, curl1, curl2] — direction of the first
  // thumb segment in hand space, roll about it, then the two curls.
  // ------------------------------------------------------------------
  const POSES = {
    relaxed: {
      f: [
        [-0.35, -0.45, -0.25],
        [-0.4, -0.5, -0.3],
        [-0.45, -0.55, -0.3],
        [-0.5, -0.6, -0.35],
      ],
      s: [0.06, 0.0, -0.05, -0.12],
      t: [-0.5, -0.35, -0.8, 0.9, -0.2, -0.15],
    },
    grip: {
      f: [
        [-1.25, -1.45, -0.9],
        [-1.3, -1.5, -0.95],
        [-1.35, -1.5, -0.95],
        [-1.4, -1.45, -0.9],
      ],
      s: [0.02, 0.0, -0.015, -0.035],
      t: [0.3, -0.6, -0.75, 1.2, -0.5, -0.4],
    },
    // thin handles (knives, switchblade, pipe): fingers hug a ~25 mm handle, thumb wraps over the index finger
    gripThin: {
      f: [
        [-1.38, -1.62, -1.0],
        [-1.42, -1.66, -1.02],
        [-1.46, -1.64, -1.0],
        [-1.5, -1.58, -0.95],
      ],
      s: [0.02, 0.0, -0.025, -0.06],
      t: [0.34, -0.66, -0.67, 1.3, -0.62, -0.5],
    },
    trigger: {
      f: [
        [-0.5, -0.85, -0.4],
        [-1.3, -1.5, -0.95],
        [-1.35, -1.5, -0.95],
        [-1.4, -1.45, -0.9],
      ],
      s: [0.1, 0.0, -0.015, -0.035],
      t: [-0.12, -0.32, -0.94, 0.9, -0.15, -0.1],
    },
    triggerPull: {
      f: [
        [-0.75, -1.2, -0.6],
        [-1.3, -1.5, -0.95],
        [-1.35, -1.5, -0.95],
        [-1.4, -1.45, -0.9],
      ],
      s: [0.1, 0.0, -0.015, -0.035],
      t: [-0.12, -0.32, -0.94, 0.9, -0.15, -0.1],
    },
    // closed fist: every phalanx curled (MCP ~85°, PIP ~100°, DIP ~50°) so the fingertips tuck
    // into the palm; the thumb lies across the middle phalanges of index & middle finger.
    fist: {
      f: [
        [-1.45, -1.72, -0.95],
        [-1.5, -1.75, -0.95],
        [-1.52, -1.72, -0.92],
        [-1.52, -1.65, -0.9],
      ],
      s: [0.0, 0.0, -0.005, -0.02],
      t: [0.0, -0.72, -0.69, 1.57, -0.5, -0.7],
    },
    // fore-end grip: fingers wrap up and over the far side of the handguard, thumb along the near side
    support: {
      f: [
        [-0.95, -1.15, -0.6],
        [-1.0, -1.2, -0.62],
        [-1.05, -1.2, -0.62],
        [-1.1, -1.15, -0.6],
      ],
      s: [0.04, 0.0, -0.03, -0.07],
      t: [-0.55, -0.3, -0.7, 0.85, -0.2, -0.12],
    },
    cup: {
      f: [
        [-0.9, -1.0, -0.5],
        [-0.95, -1.05, -0.5],
        [-1.0, -1.05, -0.5],
        [-1.05, -1.0, -0.5],
      ],
      s: [0.04, 0.0, -0.03, -0.07],
      t: [0.1, -0.5, -0.85, 1.0, -0.4, -0.3],
    },
    flat: {
      f: [
        [-0.1, -0.12, -0.05],
        [-0.1, -0.12, -0.05],
        [-0.12, -0.12, -0.05],
        [-0.15, -0.15, -0.08],
      ],
      s: [0.08, 0.0, -0.06, -0.14],
      t: [-0.6, -0.1, -0.8, 0.7, -0.05, 0],
    },
    pinch: {
      f: [
        [-0.95, -0.9, -0.5],
        [-1.1, -1.2, -0.7],
        [-1.3, -1.4, -0.9],
        [-1.4, -1.45, -0.9],
      ],
      s: [0.05, 0.0, -0.03, -0.07],
      t: [0.15, -0.45, -0.88, 1.1, -0.5, -0.35],
    },
  };
  P.HAND_POSES = POSES;

  // ------------------------------------------------------------------
  // Geometry
  // ------------------------------------------------------------------
  // finger layout (right hand): x offset, base z, lengths [prox, mid, dist], base radius.
  // Each phalanx tapers toward the tip, bulges a little over its base joint (knuckle) and has
  // a slight waist — no more uniform capsule "sausages".
  // (round 2: ~9 % longer and flatter-backed — real adult proportions; the old stubby round set read as "sausages")
  const FINGERS = [
    { x: -0.0255, z: -0.036, len: [0.0435, 0.0275, 0.0225], r: 0.0081 },
    { x: -0.0083, z: -0.039, len: [0.048, 0.0305, 0.0238], r: 0.0084 },
    { x: 0.0092, z: -0.037, len: [0.0448, 0.0285, 0.0228], r: 0.0079 },
    { x: 0.0255, z: -0.0315, len: [0.0362, 0.0222, 0.0196], r: 0.007 },
  ];
  // per-phalanx radius profile [base, end] as a fraction of the finger radius + knuckle bulge
  const PHAL = [
    { r0: 1.0, r1: 0.88, bulge: 0.07 },
    { r0: 0.92, r1: 0.8, bulge: 0.08 },
    { r0: 0.83, r1: 0.72, bulge: 0.05 },
  ];
  const PALM_Y = 0.021; // palm centre height above the grip axis
  const smooth = (a, b, x) => {
    const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
  };
  const FLAT_TOP = 0.76,
    FLAT_BOT = 0.88; // finger cross-section: flatter on the back, fuller pads
  // fingers are wider than they are thick (≈1.8 × 1.5 cm at the base): the round section read as thin
  // separate 'sausages' with gaps between them in a grip or fist — broadened so a curled hand is one block
  const WIDE_X = 1.13;

  // ---- skin atlas layout (UV space, v up). One 512² texture for the whole hand:
  //   palm (lower half, sphere-wrapped: u around the palm, dorsal at u=.5; v = knuckles 0 → wrist .5)
  //   prox / mid / dist phalanx strips (u around the finger, dorsal at u=.5; v = base → tip)
  //   plain pores (pads, knuckle bumps) and the nail plate.
  const ATLAS = 512;
  const REG = {
    palm: [0, 0, 1, 0.5],
    prox: [0, 0.5, 0.25, 1],
    mid: [0.25, 0.5, 0.5, 1],
    dist: [0.5, 0.5, 0.75, 1],
    plain: [0.75, 0.5, 1, 0.75],
    nail: [0.75, 0.75, 1, 1],
  };
  const REG_M = 3 / ATLAS; // inner margin against bilinear bleeding between regions
  function regU(reg, u) {
    return reg[0] + REG_M + u * (reg[2] - reg[0] - 2 * REG_M);
  }
  function regV(reg, v) {
    return reg[1] + REG_M + v * (reg[3] - reg[1] - 2 * REG_M);
  }
  /** canvas pixel of a region-local (u, v) */
  function px(reg, u, v) {
    return [regU(reg, u) * ATLAS, (1 - regV(reg, v)) * ATLAS];
  }

  /**
   * One phalanx: a surface of revolution along -Z (base joint at z=0, next joint at z=-len) with a
   * rounded cap over each joint, elliptical cross-section, knuckle bulge, waist and (tip) a fuller
   * pad. Custom UVs: u around (0 = palm side, .5 = back), v along (0 base pole … 1 tip pole); the
   * body always spans v .18–.82 so the painted creases land on the joints for every finger length.
   * Returns {geo, fx (palm-side mask per vertex), rAt(z) (half-width at z), topAt(z)}.
   */
  function phalanxGeo(len, r0, r1, o) {
    o = o || {};
    const RAD = 14;
    const rB = r0 * (1 + (o.bulge || 0));
    const rings = [];
    const capN = 4,
      bodyN = 9,
      endN = o.tip ? 6 : 4;
    for (let i = 0; i <= capN; i++) {
      const a = ((i / capN) * Math.PI) / 2;
      rings.push({
        z: rB * Math.cos(a) * 0.9,
        r: rB * Math.sin(a),
        v: (0.18 * i) / capN,
      });
    }
    for (let i = 1; i < bodyN; i++) {
      const t = i / bodyN;
      let r = rB + (r1 - rB) * t;
      r *= 1 - 0.055 * Math.sin(Math.PI * t) * (o.tip ? 0.4 : 1); // waist between the knuckles
      rings.push({ z: -len * t, r, v: 0.18 + 0.64 * t, t });
    }
    for (let i = 0; i <= endN; i++) {
      const a = ((i / endN) * Math.PI) / 2;
      rings.push({
        z: -len - r1 * Math.sin(a) * (o.tip ? 1.08 : 0.9),
        r: r1 * Math.cos(a) * (o.tip ? 1 - 0.08 * Math.sin(a) : 1),
        v: 0.82 + (0.18 * i) / endN,
        tipK: o.tip ? Math.sin(a) : 0,
      });
    }
    const nR = rings.length,
      nV = nR * (RAD + 1);
    const pos = new Float32Array(nV * 3),
      uv = new Float32Array(nV * 2),
      fx = new Float32Array(nV),
      ao = new Float32Array(nV);
    for (let i = 0; i < nR; i++) {
      const R = rings[i];
      for (let j = 0; j <= RAD; j++) {
        const th = (j / RAD) * Math.PI * 2; // 0 = palm side (-Y), π = back (+Y)
        const sx = Math.sin(th),
          cy = -Math.cos(th);
        let x = R.r * sx * WIDE_X,
          y = R.r * cy;
        y *= y > 0 ? FLAT_TOP : FLAT_BOT;
        // fingertip pad: fuller underneath toward the tip, nail side flatter
        if (o.tip && y < 0) y *= 1 + 0.1 * smooth(0.3, 0.8, R.v);
        const k = i * (RAD + 1) + j;
        pos[k * 3] = x;
        pos[k * 3 + 1] = y;
        pos[k * 3 + 2] = R.z;
        uv[k * 2] = j / RAD;
        uv[k * 2 + 1] = R.v;
        fx[k] = smooth(0.25, 0.85, -cy); // palm-side (lighter) mask
        ao[k] = 1 - 0.12 * sx * sx * (0.5 + 0.5 * (1 - R.v)); // the sides facing neighbouring fingers
      }
    }
    const idx = [];
    for (let i = 0; i < nR - 1; i++)
      for (let j = 0; j < RAD; j++) {
        const a = i * (RAD + 1) + j,
          b = a + RAD + 1;
        idx.push(a, b, a + 1, a + 1, b, b + 1);
      }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
    g.setIndex(idx);
    g.computeVertexNormals();
    // weld the UV seam and pole normals (duplicated vertices would otherwise shade as a crease)
    const nor = g.attributes.normal;
    for (let i = 0; i < nR; i++) {
      const a = i * (RAD + 1),
        b = a + RAD;
      if (rings[i].r < 1e-6) {
        const s = i === 0 ? 1 : -1;
        for (let j = 0; j <= RAD; j++) nor.setXYZ(a + j, 0, 0, s);
        continue;
      }
      const nx = nor.getX(a) + nor.getX(b),
        ny = nor.getY(a) + nor.getY(b),
        nz = nor.getZ(a) + nor.getZ(b);
      const l = Math.hypot(nx, ny, nz) || 1;
      nor.setXYZ(a, nx / l, ny / l, nz / l);
      nor.setXYZ(b, nx / l, ny / l, nz / l);
    }
    const rAt = (z) => {
      for (let i = 1; i < nR; i++)
        if (rings[i].z <= z) {
          const A = rings[i - 1],
            B = rings[i];
          const t = (z - A.z) / (B.z - A.z || 1e-6);
          return A.r + (B.r - A.r) * t;
        }
      return 0;
    };
    return { geo: g, fx, ao, rAt };
  }

  /**
   * Nail plate hugging the back of the distal phalanx: a curved patch following the finger's
   * elliptical cross-section (so it never floats), rounded free edge, UVs into the nail region.
   */
  function nailGeo(ph, len, rTip) {
    const NI = 6,
      NJ = 6;
    const z0 = -len * 0.36,
      z1 = -len - rTip * 0.42;
    const pos = [],
      uv = [],
      idx = [];
    for (let i = 0; i <= NI; i++) {
      const t = i / NI,
        z = z0 + (z1 - z0) * t;
      const rz = ph.rAt(z);
      const hw = rz * 0.66 * (1 - 0.35 * smooth(0.7, 1, t) * smooth(0.7, 1, t)); // rounded free edge
      for (let j = 0; j <= NJ; j++) {
        const s = (j / NJ) * 2 - 1,
          x = s * hw * WIDE_X;
        const yS =
          FLAT_TOP *
          Math.sqrt(Math.max(0, rz * rz - (x / WIDE_X) * (x / WIDE_X)));
        const y = yS + 0.00035 * (1 - s * s) + 0.00012 * smooth(0.8, 1, t); // proud in the middle, edges tucked into the fold
        pos.push(x, y, z);
        uv.push(j / NJ, t);
      }
    }
    for (let i = 0; i < NI; i++)
      for (let j = 0; j < NJ; j++) {
        const a = i * (NJ + 1) + j,
          b = a + NJ + 1;
        idx.push(a, a + 1, b, a + 1, b + 1, b);
      }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  }

  /**
   * Rounded block (superellipsoid) for the palm: unit sphere pushed toward a box, then shaped
   * (tapers toward the wrist, arched back, knuckle arc). The sphere is turned so its poles face
   * the wrist / knuckles and its UV seam runs down the palm side — native UVs then wrap the
   * palm like a glove (u around, dorsal at u=.5, v = knuckles 0 → wrist 1).
   */
