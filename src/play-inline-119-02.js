// play-inline-119 02 — the
// Lines 40-331 of readable/play-inline-119.pretty.js (statement-aligned).
  const K = G.LMA.kit;
  const U = G.util;
  const PI = Math.PI;
  const T = K.T;

  const nrm = (a) => {
    while (a > PI) a -= 2 * PI;
    while (a <= -PI) a += 2 * PI;
    return a;
  };
  /** Actor / player yaw (0 = looking north, forward = (−sin, −cos)) for a three.js facing yaw f (forward = (sin f, cos f)). */
  const AY = (f) => nrm(f + PI);
  /** Local frame on a façade point: lx along the wall (to the right, looking at it), lz outward along the normal. */
  const fr = (x, z, f) => {
    const c = Math.cos(f),
      s = Math.sin(f);
    return (lx, lz) => [x + lx * c + lz * s, z - lx * s + lz * c];
  };

  // ------------------------------------------------------------------
  // Static layout (pure maths so 40_times_square.js can reserve the façade bays before it builds them)
  // ------------------------------------------------------------------
  function onFace(a, c, t, off, toward) {
    const Lg = Math.hypot(c[0] - a[0], c[1] - a[1]),
      dx = (c[0] - a[0]) / Lg,
      dz = (c[1] - a[1]) / Lg;
    let nx = dz,
      nz = -dx;
    const mx = (a[0] + c[0]) / 2,
      mz = (a[1] + c[1]) / 2;
    if ((toward[0] - mx) * nx + (toward[1] - mz) * nz < 0) {
      nx = -nx;
      nz = -nz;
    }
    return {
      x: a[0] + dx * t + nx * off,
      z: a[1] + dz * t + nz * off,
      f: Math.atan2(nx, nz),
      nx,
      nz,
      dx,
      dz,
    };
  }
  const X0 = [-40, -262];
  const FACE_NW = [
      [-77.9, -312],
      [-64.6, -282],
    ],
    FACE_E = [
      [-24.1, -268],
      [-11.0, -237],
    ];
  const E = {};
  {
    const q = onFace(FACE_E[0], FACE_E[1], 9, 0, X0);
    E.clinic = { x: q.x, z: q.z, f: q.f };
  }
  {
    const q = onFace(FACE_E[0], FACE_E[1], 19, 0, X0);
    E.gallery = { x: q.x, z: q.z, f: q.f };
  }
  {
    const q = onFace(FACE_NW[0], FACE_NW[1], 9, 0, X0);
    E.club = { x: q.x, z: q.z, f: q.f };
  }
  {
    const q = onFace(FACE_NW[0], FACE_NW[1], 24, 0, X0);
    E.robo = { x: q.x, z: q.z, f: q.f };
  }
  E.bunk = { x: -89.0, z: -282.0, f: 0 };
  E.opry = { x: 1.0, z: -282.0, f: 0 };
  E.power = { x: 11.0, z: -282.0, f: 0 };
  E.barracks = { x: -4.0, z: -237.0, f: 0 };
  E.pawn = { x: -58.0, z: -214.0, f: PI / 2 };
  E.speak = { x: -68.0, z: -237.0, f: 0 };
  E.oracle = { x: -32.35, z: -224.9, f: PI };
  E.nest = { x: -64.0, z: -249.0, f: PI / 2 };
  E.depot = { x: -86.5, z: -258.0, f: 0 };
  // the recruiting station (Mayor's office): free-standing on the NW plaza, long axis along Broadway, front to the crossing
  const ST = (function () {
    const q = onFace(FACE_NW[0], FACE_NW[1], 14, 4.3, X0);
    return {
      x: q.x,
      z: q.z,
      ux: q.dx,
      uz: q.dz,
      nx: q.nx,
      nz: q.nz,
      L: 6.6,
      W: 3.3,
      f: Math.atan2(q.dx, q.dz),
    };
  })();
  E.mayor = {
    x: ST.x + (ST.ux * ST.L) / 2,
    z: ST.z + (ST.uz * ST.L) / 2,
    f: ST.f,
  };
  const YARD = { x0: -94, x1: -79, z0: -268, z1: -237, wz: -258 }; // the freight yard (the A2 west building's lot)
  K.neonEntrances = E;
  // door widths (40_times_square.js opens the façade colliders there so the player can walk right up to the door leaf)
  const DOORW = {
    clinic: 1.8,
    gallery: 2.2,
    robo: 1.6,
    pawn: 1.5,
    opry: 3.0,
    power: 1.3,
    bunk: 1.8,
    barracks: 1.8,
    club: 1.6,
    speak: 2.2,
    oracle: 1.1,
    nest: 1.1,
  };
  K.neonDoorW = DOORW;
  /** Collider openings on the façade edge a→c for the Neon doors on it: [{at, w, h}] (for K.colWall). */
  K.neonWallOps = function (a, c) {
    const Lg = Math.hypot(c[0] - a[0], c[1] - a[1]);
    if (Lg < 0.5) return [];
    const dx = (c[0] - a[0]) / Lg,
      dz = (c[1] - a[1]) / Lg,
      out = [];
    for (const k in DOORW) {
      const e = E[k];
      if (!e) continue;
      const t = (e.x - a[0]) * dx + (e.z - a[1]) * dz,
        off = Math.abs((e.x - a[0]) * -dz + (e.z - a[1]) * dx);
      if (off < 0.35 && t > DOORW[k] / 2 && t < Lg - DOORW[k] / 2)
        out.push({ at: t, w: DOORW[k] + 0.2, h: 3.0 });
    }
    return out;
  };
  K.neonStation = ST;
  K.neonYard = YARD;
  // façade bays 40_times_square.js must leave free (no shopfront panel / awning there)
  K.neonReserve = [
    "clinic",
    "gallery",
    "club",
    "robo",
    "bunk",
    "opry",
    "power",
    "barracks",
    "pawn",
    "speak",
    "nest",
  ]
    .map((k) => ({ x: E[k].x, z: E[k].z, r: k === "opry" ? 5.2 : 2.6 }))
    .concat([{ x: E.power.x - 2.5, z: E.power.z, r: 2.6 }]);
  K.neonIsYard = (bx0, bz0, bx1, bz1) =>
    Math.abs(bx0 - YARD.x0) < 0.01 &&
    Math.abs(bx1 - YARD.x1) < 0.01 &&
    Math.abs(bz0 - YARD.z0) < 0.01 &&
    Math.abs(bz1 - YARD.z1) < 0.01;
  K.neonIsNestRoof = (bx0, bz0, bx1) =>
    Math.abs(bx0 + 79) < 0.01 &&
    Math.abs(bz0 + 268) < 0.01 &&
    Math.abs(bx1 + 64) < 0.01;

  // ------------------------------------------------------------------
  // Atlases for the Neon's own signage (exterior + interior cell): the shared paint atlas is full
  // ------------------------------------------------------------------
  K.tsxInit = function () {
    if (K.atlases.tsx_paint) return;
    const p = (K.atlases.tsx_paint = new K.Atlas(
      "tsx_paint",
      2048,
      null,
      3072,
    )); // (2560 was full: the depot / mayor / speakeasy boards silently fell back to blank)
    const n = (K.atlases.tsx_neon = new K.Atlas(
      "tsx_neon",
      2048,
      "#000",
      1024,
    ));
    K.defineMat("tsxp", {
      map: p.tex,
      color: 0xffffff,
      rough: 0.8,
      alphaTest: 0.45,
      side: THREE.DoubleSide,
    });
    K.defineMat("tsxg", {
      map: p.tex,
      color: 0xffffff,
      rough: 0.6,
      alphaTest: 0.45,
      emissiveMap: p.tex,
      emissiveColor: 0xffffff,
      emissiveIntensity: 0.6,
    });
    K.defineMat("tsxn", {
      basic: true,
      map: n.tex,
      color: 0xffffff,
      transparent: true,
      additive: true,
      fog: false,
      toneMapped: false,
      side: THREE.FrontSide,
      noShadow: true,
    });
  };
  /** Painted slot in tsx_paint → rect. */
  K.tsxPaint = function (key, w, h, draw) {
    K.tsxInit();
    const at = K.atlases.tsx_paint;
    return (at.slots[key] || at.alloc(key, w, h, draw)).rect;
  };
  /** Neon drawing slot in tsx_neon → slot {w,h,rect}. */
  K.tsxNeonDraw = function (key, w, h, draw) {
    K.tsxInit();
    const at = K.atlases.tsx_neon;
    if (at.slots[key]) return at.slots[key];
    const sc = 0.6;
    return at.alloc(key, w * sc, h * sc, (x) => {
      x.scale(sc, sc);
      x.fillStyle = "#000";
      x.fillRect(0, 0, w, h);
      draw(x, w, h);
    });
  };
  /** Neon text slot (same look as K.neon: halo, crisp glyphs, hot tube core). */
  K.tsxNeon = function (key, text, color, o) {
    o = o || {};
    K.tsxInit();
    const at = K.atlases.tsx_neon;
    if (at.slots[key]) return at.slots[key];
    const font = o.font || 'bold 64px "Arial Black", Impact, sans-serif';
    at.ctx.font = font;
    const tw = Math.ceil(at.ctx.measureText(text).width),
      h = o.h || 110,
      w = Math.min(3300, o.w || tw + 70);
    return K.tsxNeonDraw(key, w, h, (x, W, H) => {
      const col = K.hex(color);
      x.font = font;
      x.textAlign = "center";
      x.textBaseline = "middle";
      if (o.border) {
        x.strokeStyle = col;
        x.lineWidth = 4;
        x.shadowColor = col;
        x.shadowBlur = 12;
        x.strokeRect(8, 8, W - 16, H - 16);
      }
      x.shadowColor = col;
      x.shadowBlur = 12;
      x.fillStyle = col;
      x.globalAlpha = 0.55;
      x.fillText(text, W / 2, H / 2 + 2);
      x.shadowBlur = 0;
      x.globalAlpha = 0.95;
      x.fillText(text, W / 2, H / 2 + 2);
      x.globalAlpha = 1;
      x.globalCompositeOperation = "lighter";
      x.fillStyle = "rgba(150,150,140,0.55)";
      x.fillText(text, W / 2, H / 2 + 2);
      x.globalCompositeOperation = "source-over";
    });
  };
  /** Weathered hand-painted board. */
  K.tsxBoard = function (key, text, bg, fg, o) {
    o = o || {};
    return K.tsxPaint(key, o.w || 512, o.h || 128, (x, W, H) => {
      K.signText(
        x,
        W,
        H,
        text,
        Object.assign(
          {
            bg,
            fg,
            size: o.size || 60,
            border: o.border === false ? null : o.border || fg,
          },
          o,
        ),
      );
      K.grain(x, W, H, 14, key.length * 13);
    });
  };

  // ------------------------------------------------------------------
  // DECAY DECALS (own 1024² atlas, two materials, +2 draw calls for the whole square): torn / stripped billboard
  // overlays, rust & water streaks under the boards, concertina wire, litter drifts, oil stains, cracks, paste-up posters.
  // Twenty-two years on, even the one lit place in New York is held together with paste and prayer.
  // ------------------------------------------------------------------
