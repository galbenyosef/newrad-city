/* src/weapons/20_arms.js */
/* =====================================================================
 * NEW RAD CITY — WEAPONS: first-person arms
 *
 * Two arms in Long Winter cryo-suit sleeves (grey-white padding, grey
 * knit cuffs) and articulated hands (rounded palm, capsule fingers with
 * knuckles & nails, opposable thumb, pose blending). Nothing is worn on
 * the wrist: the hero's menu lives in his VIGIL goggles.
 *
 * Arm solve (every frame, view-camera space):
 *   - the wrist follows the hand target supplied by the viewmodel (weapon
 *     sockets / reload paths), so a visible hand is ALWAYS attached to its
 *     sleeve;
 *   - the forearm keeps its natural length; its direction comes from classic
 *     2-bone IK while the hand is within reach and blends to an "elbow hint"
 *     (a point low and outside the screen) when the gun holds the hand
 *     further out than a real arm would reach.  That keeps the forearm
 *     crossing the screen diagonally from the bottom corner (classic
 *     shooter framing) instead of pointing straight down the view axis;
 *   - the upper arm (almost always off-screen) absorbs the stretch.
 *
 * Hand frame (right hand; left hand is the X-mirror):
 *   origin = centre of the gripped object (handle axis runs along ±X)
 *   -Z = direction wrist -> knuckles, +Y = back of the hand, thumb on -X.
 * ===================================================================== */
(function () {
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
  function paintAtlas() {
    const mk = () => {
      const c = document.createElement("canvas");
      c.width = c.height = ATLAS;
      return c;
    };
    const col = mk(),
      bmp = mk(),
      rgh = mk();
    const C = col.getContext("2d"),
      B = bmp.getContext("2d"),
      R = rgh.getContext("2d");
    const rng = G.util.rng(G.util.hashStr("wpn_hand_atlas"));
    const U = G.util;
    // --- base: luminance ~0.9 skin with soft warm/cool mottling (the material colour is the tone)
    const img = C.getImageData(0, 0, ATLAS, ATLAS),
      d = img.data;
    for (let y = 0; y < ATLAS; y++)
      for (let x = 0; x < ATLAS; x++) {
        const n = U.fbm2(x / 38, y / 38, 3),
          m = U.fbm2(x / 9 + 40, y / 9, 2);
        const g = 222 + n * 26 + (m - 0.5) * 10;
        const i = (y * ATLAS + x) * 4;
        const warm = U.fbm2(x / 60 + 11, y / 60, 2) - 0.5;
        d[i] = Math.min(255, g * (1 + warm * 0.05));
        d[i + 1] = Math.min(255, g * (0.972 - warm * 0.02));
        d[i + 2] = Math.min(255, g * (0.955 - warm * 0.03));
        d[i + 3] = 255;
      }
    C.putImageData(img, 0, 0);
    B.fillStyle = "#808080";
    B.fillRect(0, 0, ATLAS, ATLAS);
    R.fillStyle = "rgb(0,168,0)";
    R.fillRect(0, 0, ATLAS, ATLAS); // roughness in G: 0.66
    // --- pores (colour: tiny darker dots; bump: pits)
    for (let i = 0; i < 9000; i++) {
      const x = rng() * ATLAS,
        y = rng() * ATLAS,
        a = 0.05 + rng() * 0.07;
      C.fillStyle = "rgba(120,70,55," + a + ")";
      C.fillRect(x, y, 1, 1);
      B.fillStyle = "rgba(40,40,40," + a * 3 + ")";
      B.fillRect(x, y, 1, 1);
    }
    // micro-lines (skin texture): short random strokes, stronger on the back of the hand/fingers
    B.lineWidth = 0.7;
    for (let i = 0; i < 1400; i++) {
      const x = rng() * ATLAS,
        y = rng() * ATLAS,
        a = (rng() - 0.5) * 1.2 + (rng() < 0.5 ? 0 : Math.PI / 2),
        l = 3 + rng() * 5;
      B.strokeStyle = "rgba(60,60,60," + (0.12 + rng() * 0.12) + ")";
      B.beginPath();
      B.moveTo(x, y);
      B.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l);
      B.stroke();
    }
    const line = (ctx, pts, style, w) => {
      ctx.strokeStyle = style;
      ctx.lineWidth = w;
      ctx.beginPath();
      pts.forEach((p, i) =>
        i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]),
      );
      ctx.stroke();
    };
    const blob = (ctx, x, y, rx, ry, style) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(1, ry / rx);
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
      g.addColorStop(0, style);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(-rx, -rx, rx * 2, rx * 2);
      ctx.restore();
    };
    /** a crease across the palm side of a strip at v (wraps the seam: u .8→1 and 0→.2) */
    function crease(reg, v, span, depth) {
      for (const seg of [
        [1 - span, 1],
        [0, span],
      ]) {
        const pts = [];
        for (let k = 0; k <= 6; k++) {
          const u = seg[0] + ((seg[1] - seg[0]) * k) / 6;
          const du = Math.min(Math.abs(u), Math.abs(1 - u));
          pts.push(
            px(
              reg,
              u,
              v + 0.012 * Math.cos((du / span) * Math.PI) * (rng() - 0.3),
            ),
          );
        }
        line(C, pts, "rgba(120,62,50," + 0.35 * depth + ")", 1.4);
        line(B, pts, "rgba(20,20,20," + 0.7 * depth + ")", 1.6);
        line(R, pts, "rgba(0,205,0,0.6)", 1.5);
      }
    }
    /** knuckle wrinkles on the back of a strip, centred on v (a few bowed arcs + redness) */
    function wrinkles(reg, v, n, spread, strength) {
      const c = px(reg, 0.5, v),
        w = (reg[2] - reg[0]) * ATLAS;
      blob(
        C,
        c[0],
        c[1],
        w * 0.22,
        w * 0.14,
        "rgba(190,105,90," + 0.28 * strength + ")",
      );
      for (let k = 0; k < n; k++) {
        const dv = (k - (n - 1) / 2) * spread;
        const half =
          0.12 + 0.07 * (1 - Math.abs(k - (n - 1) / 2) / n) + rng() * 0.03;
        const pts = [];
        for (let s = 0; s <= 8; s++) {
          const u = 0.5 - half + (2 * half * s) / 8;
          const bow =
            Math.sin((s / 8) * Math.PI) * spread * 0.9 * Math.sign(dv || 1);
          pts.push(
            px(
              reg,
              u + (rng() - 0.5) * 0.01,
              v + dv + bow + (rng() - 0.5) * 0.004,
            ),
          );
        }
        line(C, pts, "rgba(110,58,45," + 0.3 * strength + ")", 1.1);
        line(B, pts, "rgba(25,25,25," + 0.75 * strength + ")", 1.3);
        line(R, pts, "rgba(0,200,0,0.5)", 1.2);
        const hi = pts.map((p) => [p[0], p[1] + 1.4]);
        line(C, hi, "rgba(255,235,220," + 0.12 * strength + ")", 0.8);
      }
    }
    // --- phalanx strips
    for (const [name, reg] of [
      ["prox", REG.prox],
      ["mid", REG.mid],
      ["dist", REG.dist],
    ]) {
      // palm-side creases at the joints (two lines at the base, one at the far joint)
      // (joint features sit on the body just inside the end domes: the domes overlap into the neighbouring
      //  segment when the finger bends, and features painted on them read as concentric rings)
      crease(reg, 0.21, 0.2, 1);
      crease(reg, 0.245, 0.17, 0.7);
      if (name !== "dist") crease(reg, 0.79, 0.18, 0.8);
      // back-of-finger wrinkles over the joints this strip touches
      if (name === "prox") wrinkles(reg, 0.765, 5, 0.011, 1);
      if (name === "mid") {
        wrinkles(reg, 0.235, 4, 0.011, 0.9);
        wrinkles(reg, 0.775, 3, 0.01, 0.7);
      }
      if (name === "dist") wrinkles(reg, 0.235, 3, 0.01, 0.65);
      // faint hair / pigment on the back of the proximal phalanx
      if (name === "prox")
        for (let i = 0; i < 40; i++) {
          const p0 = px(reg, 0.38 + rng() * 0.24, 0.3 + rng() * 0.4);
          line(C, [p0, [p0[0] + 1.5, p0[1] - 3]], "rgba(90,60,45,0.12)", 0.6);
        }
    }
    // distal: nail fold (cuticle) around where the nail sits, pinker pad & fingertip, whorl lines
    {
      const reg = REG.dist,
        w = (reg[2] - reg[0]) * ATLAS;
      const c0 = px(reg, 0.5, 0.52);
      blob(C, c0[0], c0[1] - 6, w * 0.28, w * 0.35, "rgba(210,120,110,0.22)");
      const tip = px(reg, 0.5, 0.97);
      blob(C, tip[0], tip[1], w * 0.6, w * 0.25, "rgba(225,130,120,0.25)");
      for (const u of [0.0, 1.0]) {
        const p0 = px(reg, u, 0.72);
        blob(C, p0[0], p0[1], w * 0.3, w * 0.5, "rgba(225,135,125,0.22)");
      }
      for (let k = 0; k < 7; k++) {
        // fingerprint arcs on the pad
        for (const off of [0, 1]) {
          const pts = [];
          for (let s = 0; s <= 10; s++) {
            const a = s / 10;
            pts.push(
              px(
                reg,
                off ? 1 - a * (0.1 + k * 0.012) : a * (0.1 + k * 0.012),
                0.62 + k * 0.03 + Math.sin(a * 3) * 0.01,
              ),
            );
          }
          line(B, pts, "rgba(50,50,50,0.25)", 0.8);
        }
      }
    }
    // --- palm (u around: .5 back, 0/1 palm side; v: 0 knuckles → 1 wrist)
    {
      const reg = REG.palm;
      // finger x (hand space), palm-local v of each knuckle (the knuckle end pole is at v=0 and is covered
      // by the finger bases — nothing is painted below v≈.15 so no detail pinches into a star there)
      const kn = [
        [-0.0255, 0.225],
        [-0.0083, 0.205],
        [0.0092, 0.215],
        [0.0255, 0.25],
      ];
      const uOfX = (x) =>
        0.5 -
        Math.asin(Math.max(-0.95, Math.min(0.95, x / 0.04))) / (Math.PI * 2);
      // extensor tendons fanning from the wrist to each knuckle (light ridge + dark flank, bump)
      for (const [x, kv] of kn) {
        const u1 = uOfX(x),
          u0 = 0.5 + (u1 - 0.5) * 0.25;
        const pts = [];
        for (let s = 0; s <= 10; s++) {
          const t = s / 10;
          pts.push(
            px(
              reg,
              u0 + (u1 - u0) * Math.pow(t, 0.8),
              0.95 - (0.95 - kv - 0.03) * t,
            ),
          );
        }
        line(C, pts, "rgba(255,240,228,0.10)", 3);
        line(B, pts, "rgba(210,210,210,0.35)", 3.2);
        line(
          B,
          pts.map((p) => [p[0] + 3, p[1]]),
          "rgba(60,60,60,0.25)",
          1.5,
        );
        // knuckle: redness + wrinkles
        const kp = px(reg, u1, kv);
        blob(C, kp[0], kp[1], 16, 12, "rgba(195,110,95,0.26)");
        for (let k = 0; k < 3; k++) {
          const pts2 = [];
          for (let s = 0; s <= 6; s++)
            pts2.push(
              px(
                reg,
                u1 - 0.03 + (0.06 * s) / 6,
                kv + 0.025 + k * 0.022 + Math.sin((s / 6) * Math.PI) * 0.01,
              ),
            );
          line(C, pts2, "rgba(115,62,48,0.22)", 1);
          line(B, pts2, "rgba(30,30,30,0.5)", 1.2);
        }
      }
      // two faint veins
      for (let vn = 0; vn < 2; vn++) {
        const pts = [];
        let u = 0.47 + vn * 0.07,
          v = 0.97;
        for (let s = 0; s < 14; s++) {
          pts.push(px(reg, u, v));
          u += (rng() - 0.5) * 0.02 + (vn ? 0.004 : -0.003);
          v -= 0.05;
        }
        line(C, pts, "rgba(95,105,150,0.13)", 2.4);
        line(B, pts, "rgba(190,190,190,0.25)", 2.2);
      }
      // palm creases (wrap around the seam at u=0/1)
      const palmLine = (u0, v0, u1, v1, bend, a) => {
        for (const off of [0, 1, -1]) {
          const pts = [];
          for (let s = 0; s <= 12; s++) {
            const t = s / 12;
            pts.push(
              px(
                reg,
                u0 + (u1 - u0) * t + off,
                v0 + (v1 - v0) * t + Math.sin(t * Math.PI) * bend,
              ),
            );
          }
          line(C, pts, "rgba(125,65,55," + a + ")", 1.3);
          line(B, pts, "rgba(25,25,25," + a * 2 + ")", 1.5);
        }
      };
      palmLine(0.84, 0.24, 1.1, 0.16, 0.03, 0.34); // heart line
      palmLine(0.88, 0.4, 1.14, 0.3, 0.04, 0.3); // head line
      palmLine(1.14, 0.36, 1.2, 0.9, 0.05, 0.28); // life line (around the thumb pad)
      // pinker, lighter palm
      for (const u of [0, 1]) {
        const p0 = px(reg, u, 0.5);
        blob(C, p0[0], p0[1], 120, 200, "rgba(230,150,135,0.16)");
      }
    }
    // --- nail plate (u across, v base → free edge)
    {
      const reg = REG.nail;
      const [x0, y0] = px(reg, 0, 1),
        [x1, y1] = px(reg, 1, 0);
      const W = x1 - x0,
        H = y1 - y0;
      C.fillStyle = "rgb(236,198,190)";
      C.fillRect(x0, y0, W, H);
      R.fillStyle = "rgb(0,82,0)";
      R.fillRect(x0, y0, W, H); // glossy
      B.fillStyle = "#909090";
      B.fillRect(x0, y0, W, H);
      const lu = px(reg, 0.5, 0.0);
      blob(C, lu[0], lu[1], W * 0.34, H * 0.22, "rgba(250,236,228,0.9)"); // lunula
      const fe = px(reg, 0.5, 0.93);
      C.fillStyle = "rgba(248,240,222,0.95)";
      C.fillRect(x0, y0, W, fe[1] - y0); // free edge
      line(
        C,
        [
          [x0, fe[1]],
          [x1, fe[1]],
        ],
        "rgba(200,150,140,0.6)",
        1.5,
      );
      for (let i = 0; i < 9; i++) {
        const xx = x0 + W * (0.1 + (0.8 * i) / 8);
        line(
          C,
          [
            [xx, y0 + H * 0.12],
            [xx, y1],
          ],
          "rgba(255,255,255,0.10)",
          1,
        );
        line(
          B,
          [
            [xx, y0],
            [xx, y1],
          ],
          "rgba(170,170,170,0.3)",
          1,
        );
      }
      // side folds & cuticle
      for (const s of [x0, x1 - 6]) {
        C.fillStyle = "rgba(190,120,110,0.4)";
        C.fillRect(s, y0, 6, H);
      }
      line(
        C,
        [
          [x0, y1 - 2],
          [x1, y1 - 2],
        ],
        "rgba(180,110,100,0.55)",
        3,
      );
    }
    // --- plain region: nothing extra (pores only)
    const tex = (cv, srgb) => {
      const t = new THREE.CanvasTexture(cv);
      t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
      if (srgb) t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 4;
      t.needsUpdate = true;
      return t;
    };
    return {
      map: tex(col, true),
      bump: tex(bmp, false),
      rough: tex(rgh, false),
    };
  }
  let handMat = null;
  /** The hands' skin material: atlas + bump + roughness map, wrap-lit, tone-independent nails/palms. */
  function getHandMat() {
    if (handMat) return handMat;
    const t = paintAtlas();
    const base = P.mat("skin");
    handMat = new THREE.MeshStandardMaterial({
      color: base.color.clone(),
      map: t.map,
      bumpMap: t.bump,
      bumpScale: 0.0045,
      roughnessMap: t.rough,
      roughness: 1,
      metalness: 0,
      vertexColors: true,
    });
    handMat.envMapIntensity = 0.35;
    handMat.userData.envK = 0.35;
    handMat.name = "wpn_skinHand";
    handMat.userData.shared = true;
    handMat.userData.wpnMat = "skinHand";
    P.skinPatch(handMat, true);
    if (P.addViewMat) P.addViewMat("skinHand", handMat);
    return handMat;
  }
  P.handMat = getHandMat;

  /**
   * Build a right hand (mirror = true -> left) as ONE SkinnedMesh (1 draw call):
   * every finger/thumb segment + nail is rigidly bound to its own bone; the
   * palm, pads, knuckles and wrist are bound to the root bone.
   * Returns {root, inner, fingers:[[bone x3] x4], thumb:[bone x3], pose, target}
   */
  function buildHand(mirror) {
    const root = new THREE.Group();
    root.name = mirror ? "handL" : "handR";
    const inner = new THREE.Group();
    root.add(inner);
    inner.position.set(0, 0.003, 0.03); // put the curled-finger wrap centre on the origin
    if (mirror) inner.scale.x = -1;
    const parts = []; // {geo, bone, fx:{nail, palm arrays|numbers}, ao, tint}
    const _m = new THREE.Matrix4(),
      _q = new THREE.Quaternion(),
      _e = new THREE.Euler(),
      _p = new THREE.Vector3(),
      _s = new THREE.Vector3();
    /** add a geometry: o = {p, s, r}, reg (atlas region), uvMode 'own' (keeps UV in 0..1 → region) */
    function push(geo, o, bone, reg, fx, ao, tint, skin) {
      o = o || {};
      _e.set(o.r ? o.r[0] : 0, o.r ? o.r[1] : 0, o.r ? o.r[2] : 0);
      _q.setFromEuler(_e);
      if (o.s === undefined) _s.set(1, 1, 1);
      else if (typeof o.s === "number") _s.setScalar(o.s);
      else _s.set(o.s[0], o.s[1], o.s[2]);
      _p.set(o.p ? o.p[0] : 0, o.p ? o.p[1] : 0, o.p ? o.p[2] : 0);
      geo.applyMatrix4(_m.compose(_p, _q, _s));
      if (!geo.attributes.normal) geo.computeVertexNormals();
      // UVs into the atlas region
      const uv = geo.attributes.uv,
        n = geo.attributes.position.count;
      const R = REG[reg];
      for (let i = 0; i < n; i++)
        uv.setXY(
          i,
          regU(R, Math.min(1, Math.max(0, uv.getX(i)))),
          regV(R, Math.min(1, Math.max(0, uv.getY(i)))),
        );
      // vertex colour = ambient occlusion × tint
      const col = new Float32Array(n * 3);
      const t = tint || [1, 1, 1];
      for (let i = 0; i < n; i++) {
        const a = ao ? (typeof ao === "number" ? ao : ao[i]) : 1;
        col[i * 3] = a * t[0];
        col[i * 3 + 1] = a * t[1];
        col[i * 3 + 2] = a * t[2];
      }
      geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
      parts.push({ geo, bone, fx: fx || {}, n, skin: skin || null });
    }
    // ---- palm (root bone 0): rounded palm, thenar/hypothenar pads, knuckles, wrist
    const palm = palmGeo();
    push(
      palm.geo,
      { p: [0, PALM_Y, -0.002] },
      0,
      "palm",
      { palm: palm.fx },
      palm.ao,
    );
    push(
      GEO.sphere(1, 14, 10),
      { p: [-0.021, PALM_Y - 0.0075, 0.017], s: [0.0175, 0.012, 0.026] },
      0,
      "plain",
      { palm: 0.8 },
      1,
    ); // thenar (thumb muscle)
    push(
      GEO.sphere(1, 14, 10),
      { p: [0.022, PALM_Y - 0.0075, 0.014], s: [0.0135, 0.0095, 0.025] },
      0,
      "plain",
      { palm: 0.8 },
      1,
    ); // hypothenar
    push(
      GEO.sphere(1, 16, 8),
      { p: [0.0, PALM_Y - 0.0085, -0.028], s: [0.034, 0.0072, 0.011] },
      0,
      "plain",
      { palm: 1 },
      0.95,
    ); // pads under the knuckles
    for (const f of FINGERS)
      push(
        GEO.sphere(f.r * 1.02, 12, 8),
        { p: [f.x, PALM_Y + 0.0032, f.z + 0.003], s: [1, 0.85, 1.05] },
        0,
        "plain",
        { palm: 0 },
        1,
        [1.0, 0.9, 0.87],
      ); // knuckle bumps (a little redder)
    // wrist: tapers from the heel of the palm back into the sleeve cuff
    {
      const wg = GEO.lathe(
        [
          [0.03, 0.006],
          [0.0292, -0.014],
          [0.027, -0.034],
          [0.0255, -0.05],
          [0.02, -0.058],
        ],
        18,
      );
      push(
        wg,
        { p: [0, PALM_Y - 0.002, 0.03], s: [1.1, 0.74, 1] },
        0,
        "plain",
        { palm: 0 },
        1,
      );
    }
    // ---- bones (rest pose = no rotation, so segment rest positions are pure translations)
    const bones = [];
    const rootBone = new THREE.Bone();
    rootBone.name = "palm";
    bones.push(rootBone);
    const fingers = [];
    const REGS = ["prox", "mid", "dist"];
    FINGERS.forEach((f) => {
      const chain = [];
      let parent = rootBone,
        acc = 0;
      for (let s = 0; s < 3; s++) {
        const bone = new THREE.Bone();
        bone.position.set(
          s === 0 ? f.x : 0,
          s === 0 ? PALM_Y + 0.001 : 0,
          s === 0 ? f.z : -f.len[s - 1],
        );
        parent.add(bone);
        bones.push(bone);
        const bi = bones.length - 1;
        const pr = PHAL[s];
        const ph = phalanxGeo(f.len[s], f.r * pr.r0, f.r * pr.r1, {
          bulge: pr.bulge,
          tip: s === 2,
        });
        const z = f.z - acc;
        push(
          ph.geo,
          { p: [f.x, PALM_Y + 0.001, z] },
          bi,
          REGS[s],
          { palm: ph.fx },
          ph.ao,
          null,
          {
            z0: z,
            len: f.len[s],
            pb: s === 0 ? 0 : bi - 1,
            cb: s < 2 ? bi + 1 : -1,
            B: f.r * (s === 0 ? 1.1 : 0.95),
          },
        );
        if (s === 2)
          push(
            nailGeo(ph, f.len[s], f.r * pr.r1),
            { p: [f.x, PALM_Y + 0.001, z] },
            bi,
            "nail",
            { nail: 1 },
            1,
          );
        acc += f.len[s];
        chain.push(bone);
        parent = bone;
      }
      fingers.push(chain);
    });
    // thumb: metacarpal from the thenar pad
    const thumb = [];
    {
      const base = [-0.029, PALM_Y - 0.004, 0.022],
        lens = [0.042, 0.032, 0.026];
      const RR = [
        [0.0112, 0.0099, 0.04],
        [0.0098, 0.0089, 0.07],
        [0.0092, 0.008, 0.05],
      ];
      let parent = rootBone,
        acc = 0;
      for (let s = 0; s < 3; s++) {
        const bone = new THREE.Bone();
        if (s === 0) bone.position.set(base[0], base[1], base[2]);
        else bone.position.set(0, 0, -lens[s - 1]);
        parent.add(bone);
        bones.push(bone);
        const bi = bones.length - 1;
        const z = base[2] - acc;
        const ph = phalanxGeo(lens[s], RR[s][0], RR[s][1], {
          bulge: RR[s][2],
          tip: s === 2,
        });
        push(
          ph.geo,
          { p: [base[0], base[1], z] },
          bi,
          REGS[s],
          { palm: ph.fx },
          ph.ao,
          null,
          {
            z0: z,
            len: lens[s],
            pb: s === 0 ? 0 : bi - 1,
            cb: s < 2 ? bi + 1 : -1,
            B: RR[s][0] * (s === 0 ? 1.3 : 0.95),
          },
        );
        if (s === 2)
          push(
            nailGeo(ph, lens[s], RR[s][1]),
            { p: [base[0], base[1], z] },
            bi,
            "nail",
            { nail: 1 },
            1,
          );
        acc += lens[s];
        thumb.push(bone);
        parent = bone;
      }
    }
    // ---- merge + rigid skin weights + skin fx masks
    const geo = G.util.mergeGeometries(parts.map((p) => p.geo));
    const n = geo.attributes.position.count;
    const si = new Uint16Array(n * 4),
      sw = new Float32Array(n * 4),
      sfx = new Float32Array(n * 2);
    let o = 0;
    for (const p of parts) {
      const nail = p.fx.nail || 0,
        palmM = p.fx.palm;
      const pz = p.skin ? p.geo.attributes.position : null;
      for (let k = 0; k < p.n; k++) {
        si[(o + k) * 4] = p.bone;
        sw[(o + k) * 4] = 1;
        if (pz) {
          // smooth joints: skin near each knuckle blends with the neighbouring bone (50/50 on the joint
          // plane), so a bent finger folds as ONE continuous surface instead of two capsules meeting —
          // the old rigid binding was what read as "sausage" fingers
          const sk = p.skin,
            zl = pz.getZ(k) - sk.z0; // 0 at the base joint, -len at the far joint
          const wP = 1 - smooth(-1, 1, -zl / sk.B);
          const wC = sk.cb >= 0 ? 1 - smooth(-1, 1, (zl + sk.len) / sk.B) : 0;
          const wS = Math.max(0, 1 - wP - wC),
            tot = wP + wC + wS || 1;
          si[(o + k) * 4] = p.bone;
          sw[(o + k) * 4] = wS / tot;
          si[(o + k) * 4 + 1] = sk.pb;
          sw[(o + k) * 4 + 1] = wP / tot;
          si[(o + k) * 4 + 2] = sk.cb >= 0 ? sk.cb : 0;
          sw[(o + k) * 4 + 2] = wC / tot;
        }
        sfx[(o + k) * 2] = typeof nail === "number" ? nail : nail[k];
        sfx[(o + k) * 2 + 1] =
          palmM === undefined
            ? 0
            : typeof palmM === "number"
              ? palmM
              : palmM[k];
      }
      o += p.n;
    }
    parts.forEach((p) => p.geo.dispose());
    geo.setAttribute("skinIndex", new THREE.Uint16BufferAttribute(si, 4));
    geo.setAttribute("skinWeight", new THREE.Float32BufferAttribute(sw, 4));
    geo.setAttribute("skinfx", new THREE.Float32BufferAttribute(sfx, 2));
    const mesh = new THREE.SkinnedMesh(geo, getHandMat());
    mesh.name = "handMesh";
    mesh.frustumCulled = false;
    mesh.add(rootBone);
    inner.add(mesh);
    root.updateMatrixWorld(true);
    mesh.bind(new THREE.Skeleton(bones));
    const pose = clonePose(POSES.relaxed);
    const hand = {
      root,
      inner,
      mesh,
      fingers,
      thumb,
      pose,
      target: clonePose(POSES.relaxed),
      mirror,
      overrides: null,
    };
    applyPose(hand);
    return hand;
  }
  function clonePose(p) {
    return { f: p.f.map((a) => a.slice()), s: p.s.slice(), t: p.t.slice() };
  }
  function applyPose(h) {
    const p = h.pose;
    for (let i = 0; i < 4; i++) {
      const ch = h.fingers[i];
      ch[0].rotation.set(p.f[i][0], p.s[i], 0, "YXZ");
      ch[1].rotation.set(p.f[i][1], 0, 0);
      ch[2].rotation.set(p.f[i][2], 0, 0);
    }
    // thumb: aim the first segment along t[0..2], roll about it, then curl
    _tv.set(p.t[0], p.t[1], p.t[2]);
    if (_tv.lengthSq() < 1e-6) _tv.set(0, 0, -1);
    _tv.normalize();
    _tm.lookAt(_t0, _tv, _tup);
    h.thumb[0].quaternion.setFromRotationMatrix(_tm);
    _tq.setFromAxisAngle(_tz, p.t[3]);
    h.thumb[0].quaternion.multiply(_tq);
    h.thumb[1].rotation.set(p.t[4], 0, 0);
    h.thumb[2].rotation.set(p.t[5], 0, 0);
  }
  const _tv = new THREE.Vector3(),
    _t0 = new THREE.Vector3(),
    _tup = new THREE.Vector3(0, 1, 0),
    _tz = new THREE.Vector3(0, 0, 1);
  const _tm = new THREE.Matrix4(),
    _tq = new THREE.Quaternion();
  function blendPose(h, rate) {
    const a = h.pose,
      b = h.target;
    const k = Math.min(1, rate);
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 3; j++) a.f[i][j] += (b.f[i][j] - a.f[i][j]) * k;
      a.s[i] += (b.s[i] - a.s[i]) * k;
    }
    for (let j = 0; j < 6; j++) a.t[j] += (b.t[j] - a.t[j]) * k;
    applyPose(h);
  }

  // ------------------------------------------------------------------
  // Sleeves
  // ------------------------------------------------------------------
  function buildUpperArm(len) {
    const b = P.builder();
    b.add(
      GEO.lathe(
        [
          [0.05, -0.05],
          [0.052, 0.0],
          [0.05, len * 0.5],
          [0.047, len],
          [0.044, len + 0.03],
        ],
        14,
      ),
      "sleeve",
      { s: [1, 0.92, 1] },
    );
    b.add(GEO.cyl(0.0025, len, 4), "sleeve", {
      p: [0.0, 0.047, -len * 0.5],
      tint: 0.8,
    }); // seam
    return b.build();
  }
  function buildForearm(len, isLeft) {
    const b = P.builder();
    // tapered sleeve with soft fabric folds (radius wobble), slightly baggy near the elbow
    const pts = [[0.043, -0.03]];
    const n = 11,
      end = len - 0.03;
    for (let i = 0; i <= n; i++) {
      const t = i / n,
        z = t * end;
      const base = 0.045 - t * 0.0115; // taper toward the wrist (knit cuff hugs the wrist)
      const fold = (i % 2 ? 0.0022 : -0.0012) * (1 - t * 0.6);
      pts.push([base + fold, z]);
    }
    b.add(GEO.lathe(pts, 18), "sleeve", { s: [1.08, 0.94, 1] });
    // knitted orange cuff band right at the wrist + grey turned lip (cryo suit)
    // (slimmer than before: the old 8.5 cm padded band dominated the bottom of the pistol view)
    b.add(
      GEO.lathe(
        [
          [0.0335, len - 0.03],
          [0.0356, len - 0.027],
          [0.0354, len - 0.01],
          [0.0336, len - 0.004],
        ],
        20,
      ),
      "sleeveTrim",
      { s: [1.06, 0.92, 1] },
    );
    for (let i = 0; i < 3; i++)
      b.add(GEO.torus(0.0355, 0.0007, 4, 24), "sleeveTrim", {
        p: [0, 0, -(len - 0.024 + i * 0.007)],
        s: [1.06, 0.92, 1],
        tint: 0.82,
      }); // ribbing
    b.add(GEO.torus(0.0322, 0.0022, 6, 22), "sleeve", {
      p: [0, 0, -(len - 0.003)],
      s: [1.06, 0.92, 1],
      tint: 0.85,
    });
    // side seam / stitches
    b.add(GEO.cyl(0.0018, len * 0.75, 4), "sleeve", {
      p: [isLeft ? 0.046 : -0.046, 0, -len * 0.4],
      tint: 0.75,
    });
    // wrist: a short skin stub + joint ball that fills the gap when the hand bends away from the forearm
    b.add(
      GEO.lathe(
        [
          [0.027, -0.02],
          [0.027, 0.0],
          [0.0255, 0.008],
        ],
        14,
      ),
      "skin",
      { p: [0, 0.001, -len], s: [1.1, 0.78, 1] },
    );
    b.add(GEO.sphere(1, 14, 10), "skin", {
      p: [0, 0.001, -len - 0.006],
      s: [0.0272, 0.0198, 0.02],
    });
    return b.build();
  }

  // ------------------------------------------------------------------
  // Rig
  // ------------------------------------------------------------------
  const UPPER = 0.27,
    FORE = 0.25;
  const A = (P.arms = {
    built: false,
    root: null,
    R: null,
    L: null, // {shoulder, hint, upper, fore, hand}
  });
  // Elbow hints (view camera space): where the elbow goes when the gun holds the hand far out.
  // Low and outside the frame so forearms enter from the bottom corners.
  const HINT_R = [0.34, -0.6, -0.08],
    HINT_L = [-0.3, -0.65, -0.12];
  const HINT_L_ADS = [-0.2, -0.88, -0.3]; // ADS: left elbow drops so the forearm leaves the sight picture
  const HINT_L_RAISE = [-0.2, -0.16, -0.3]; // left forearm raised across the view (scripted gestures)
  // ADS: the gun arm is extended toward the sights, so its forearm runs back toward the shoulder —
  // a short, foreshortened sleeve into the bottom-right corner instead of a column under the gun
  const HINT_R_ADS = [0.52, -0.46, 0.2];
  P.ARM_HINTS = {
    R: HINT_R,
    L: HINT_L,
    L_ADS: HINT_L_ADS,
    L_RAISE: HINT_L_RAISE,
  };

  function buildSide(isLeft) {
    const s = {
      isLeft,
      shoulder: new THREE.Vector3(isLeft ? -0.19 : 0.19, -0.3, 0.08),
      pole: new THREE.Vector3(isLeft ? -0.75 : 0.75, -1, 0.3).normalize(),
      hint: new THREE.Vector3().fromArray(isLeft ? HINT_L : HINT_R),
      upper: new THREE.Group(),
      fore: new THREE.Group(),
      hand: buildHand(isLeft),
      visible: true,
    };
    s.upper.add(buildUpperArm(UPPER));
    // elbow cap
    const elbow = P.mesh(GEO.sphere(0.047, 12, 10), "sleeve");
    elbow.scale.set(1, 0.95, 1);
    s.upper.add(elbow);
    elbow.position.z = -UPPER;
    s.fore.add(buildForearm(FORE, isLeft));
    A.root.add(s.upper, s.fore, s.hand.root);
    return s;
  }

  A.build = function () {
    if (A.built) return;
    A.root = new THREE.Group();
    A.root.name = "wpn_arms";
    A.R = buildSide(false);
    A.L = buildSide(true);
    A.built = true;
  };

  // ------------------------------------------------------------------
  // Arm solve
  // ------------------------------------------------------------------
  const _d = new THREE.Vector3(),
    _perp = new THREE.Vector3(),
    _elbow = new THREE.Vector3(),
    _wrist = new THREE.Vector3();
  const _m = new THREE.Matrix4(),
    _up = new THREE.Vector3(),
    _dir = new THREE.Vector3(),
    _e2 = new THREE.Vector3(),
    _toEye = new THREE.Vector3();
  const _hint = new THREE.Vector3(),
    _hA = new THREE.Vector3(),
    _hB = new THREE.Vector3();
  const WRIST_OFF = new THREE.Vector3(0, PALM_Y - 0.001, 0.086); // wrist joint in hand frame (heel of the palm) — the cuff ends here
  const _mirrorOff = new THREE.Vector3();

  /**
   * target: {p, q} hand pose in arms-root space (or null to hide the side)
   * opt: {ads, raise, hint (array override)}
   */
  const _sh = new THREE.Vector3();
  function solveSide(s, target, opt) {
    if (!target) {
      s.upper.visible = s.fore.visible = s.hand.root.visible = false;
      return;
    }
    s.upper.visible = s.fore.visible = s.hand.root.visible = true;
    // hand placement
    s.hand.root.position.copy(target.p);
    s.hand.root.quaternion.copy(target.q);
    // wrist point
    _mirrorOff.copy(WRIST_OFF);
    if (s.isLeft) _mirrorOff.x *= -1;
    _wrist.copy(_mirrorOff).applyQuaternion(target.q).add(target.p);
    // (0) lean into long guns: when the hand is held beyond arm's reach (rifle fore-ends), the shoulder comes
    // forward toward it (bladed stance) instead of the upper arm stretching into a long thin sleeve
    _sh.copy(s.shoulder);
    {
      _d.subVectors(_wrist, _sh);
      const over = _d.length() - (UPPER + FORE) * 0.96;
      if (over > 0) _sh.addScaledVector(_d.normalize(), Math.min(0.2, over));
    }
    // (1) classic two-bone IK with natural lengths (valid when the hand is within reach)
    _d.subVectors(_wrist, _sh);
    const dist = Math.max(1e-4, _d.length());
    const dir = _dir.copy(_d).divideScalar(dist);
    const reach = UPPER + FORE;
    if (dist < reach * 0.999) {
      const cosA = THREE.MathUtils.clamp(
        (UPPER * UPPER + dist * dist - FORE * FORE) / (2 * UPPER * dist),
        -1,
        1,
      );
      const sinA = Math.sqrt(1 - cosA * cosA);
      _perp.copy(s.pole).addScaledVector(dir, -s.pole.dot(dir));
      if (_perp.lengthSq() < 1e-6) _perp.set(0, -1, 0);
      _perp.normalize();
      _elbow
        .copy(_sh)
        .addScaledVector(dir, UPPER * cosA)
        .addScaledVector(_perp, UPPER * sinA);
    } else _elbow.copy(_sh).addScaledVector(dir, UPPER);
    // (2) elbow hint for out-of-reach hands (gun sockets far forward): forearm aims at the hint
    const hintW = smooth(0.78, 1.0, dist / reach);
    if (hintW > 0) {
      if (opt && opt.hint) _hint.fromArray(opt.hint);
      else _hint.copy(s.hint);
      if (s.isLeft && opt) {
        if (opt.ads > 0) _hint.lerp(_hA.fromArray(HINT_L_ADS), opt.ads);
        if (opt.raise > 0) _hint.lerp(_hB.fromArray(HINT_L_RAISE), opt.raise);
      } else if (opt && opt.ads > 0 && !opt.hint)
        _hint.lerp(_hA.fromArray(HINT_R_ADS), opt.ads);
      // forearm direction: toward the hint, but never more than MAX_BEND away from the straight-wrist
      // direction (+Z of the hand) — real wrists only flex so far, and a hard kink reads as broken
      _hA.subVectors(_hint, _wrist).normalize();
      _hB.set(0, 0, 1).applyQuaternion(target.q); // straight-wrist direction
      if (_hB.z < 0.25) {
        _hB.z = 0.25;
        _hB.normalize();
      } // ...but the elbow never goes out in front of the wrist
      const adsR = !s.isLeft && opt && !opt.hint ? opt.ads || 0 : 0; // extended gun arm: follow the hint freely
      _hA.lerp(_hB, 0.4 * (1 - adsR)).normalize();
      const maxBend = s.isLeft ? 0.62 : 0.85 + 0.7 * adsR;
      const ang = _hA.angleTo(_hB);
      if (ang > maxBend) {
        _hA.lerp(_hB, 1 - maxBend / ang).normalize();
      }
      _e2.copy(_wrist).addScaledVector(_hA, FORE);
      _elbow.lerp(_e2, hintW);
    }
    // (3) anatomy guard: the elbow hangs BELOW the wrist and stays on its own side. Without this a hand
    // turned palm-down under the gun (mag fetch, reload tilt, first draw) aimed the forearm straight up
    // and swung the sleeve across the lens. Relaxed only while the left forearm is deliberately raised.
    {
      const raiseK =
        s.isLeft && opt ? THREE.MathUtils.clamp(opt.raise || 0, 0, 1) : 0;
      const minDrop = (s.isLeft ? 0.42 : 0.3) * (1 - raiseK);
      _e2.subVectors(_elbow, _wrist);
      const l = _e2.length();
      if (l > 1e-6) {
        _e2.divideScalar(l);
        let changed = false;
        const side = s.isLeft ? -1 : 1;
        if (_e2.x * side < -0.18 * (1 - raiseK)) {
          _e2.x = -0.18 * (1 - raiseK) * side;
          changed = true;
        } // never cross to the other side
        if (_e2.z < -0.1 * (1 - raiseK)) {
          _e2.z = -0.1 * (1 - raiseK);
          changed = true;
        } // never in front of the wrist
        if (_e2.y > -minDrop) {
          const h = Math.hypot(_e2.x, _e2.z),
            ny = -minDrop,
            hs = Math.sqrt(1 - ny * ny);
          if (h > 1e-4) {
            _e2.x *= hs / h;
            _e2.z *= hs / h;
          } else {
            _e2.x = side * hs * 0.8;
            _e2.z = hs * 0.6;
          }
          _e2.y = ny;
          changed = true;
        }
        if (changed) {
          _e2.normalize();
          _elbow.copy(_wrist).addScaledVector(_e2, l);
        }
      }
    }
    // keep the forearm at its natural length (it is the part you actually see)
    _e2.subVectors(_elbow, _wrist);
    if (_e2.lengthSq() < 1e-8) _e2.set(s.isLeft ? -1 : 1, -1, 0.3);
    _elbow.copy(_wrist).addScaledVector(_e2.normalize(), FORE);
    // upper arm: shoulder -> elbow, stretched as needed (normally off-screen)
    const ul = _elbow.distanceTo(_sh);
    _perp.subVectors(_elbow, _sh);
    _up.copy(s.pole).negate();
    if (Math.abs(_up.dot(_perp) / Math.max(ul, 1e-4)) > 0.98) _up.set(0, 1, 0);
    _m.lookAt(_sh, _elbow, _up);
    s.upper.position.copy(_sh);
    s.upper.quaternion.setFromRotationMatrix(_m);
    s.upper.scale.set(1, 1, THREE.MathUtils.clamp(ul / UPPER, 0.5, 3));
    // forearm: -Z toward the wrist, twist follows the back of the hand (+Y of hand)
    _up.set(0, 1, 0).applyQuaternion(target.q);
    if (s.isLeft) {
      // forearm twist: in play it mostly follows the hand; raised, the inside of the wrist turns toward the eye
      _toEye.copy(_elbow).add(_wrist).multiplyScalar(-0.5).normalize();
      const ads = opt ? opt.ads || 0 : 0,
        raise = opt ? opt.raise || 0 : 0;
      const k = 0.3 * (1 - 0.8 * ads) + 0.6 * raise;
      _up
        .multiplyScalar(1 - k)
        .addScaledVector(_toEye, k)
        .normalize();
    }
    _m.lookAt(_elbow, _wrist, _up);
    s.fore.position.copy(_elbow);
    s.fore.quaternion.setFromRotationMatrix(_m);
    s.fore.scale.set(1, 1, 1);
  }

  /**
   * Called every frame by the viewmodel.
   * right/left: {p:Vector3, q:Quaternion} in arms-root (view camera) space, or null to hide.
   * opt: {ads:0..1, raise:0..1, hintL, hintR}
   */
  const _optL = { ads: 0, raise: 0, hint: null },
    _optR = { ads: 0, raise: 0, hint: null };
  A.solve = function (right, left, opt) {
    if (!A.built) return;
    _optL.ads = _optR.ads = (opt && opt.ads) || 0;
    // one-handed guns: the gun arm is always the "extended" arm (hip, reload, ADS) and the off arm keeps its
    // elbow dropped when it comes up to the gun, like in ADS
    if (opt && opt.ext) {
      _optR.ads = Math.max(_optR.ads, opt.ext);
      _optL.ads = Math.max(_optL.ads, opt.ext * 0.8);
    }
    _optL.raise = _optR.raise = (opt && opt.raise) || 0;
    _optL.hint = (opt && opt.hintL) || null;
    _optR.hint = (opt && opt.hintR) || null;
    solveSide(A.R, right, _optR);
    solveSide(A.L, left, _optL);
  };
  /** Set target pose for a hand ('R'|'L'). */
  A.setPose = function (side, name) {
    const h = (side === "L" ? A.L : A.R).hand;
    const p = POSES[name] || POSES.relaxed;
    h.target = clonePose(p);
    h.targetName = name;
  };
  A.updateHands = function (dt) {
    if (!A.built) return;
    const rate = 1 - Math.exp(-18 * dt);
    blendPose(A.R.hand, rate);
    blendPose(A.L.hand, rate);
  };
  /** (kept for callers: nothing on the arms has a screen any more) */
  A.updateScreen = function () {};
  /** Player skin tone (view material only — world/NPC skins are separate materials). */
  A.setSkinTone = function (hex) {
    // chargen tones are picked for faces under world light; on the close-up first-person hands the
    // same value reads pale and chalky, so deepen & saturate it a touch (real skin albedo is ~0.6)
    const c = new THREE.Color(hex),
      hsl = {};
    c.getHSL(hsl);
    c.setHSL(hsl.h, Math.min(1, hsl.s * 1.12 + 0.03), hsl.l * 0.86);
    P.mat("skin").color.copy(c);
    getHandMat().color.copy(c);
  };
  // exposed for tools/tests
  A._buildHand = buildHand;
  A._applyPose = function (h, name) {
    h.pose = clonePose(POSES[name] || POSES.relaxed);
    applyPose(h);
  };
})();
