// play-inline-579 01 — side
// Lines 41-327 of readable/play-inline-579.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  const QX = G.qx;
  const K = () => QX.kit;
  const QID = "qx_c4";
  // Shared ids owned by other modules (sound / characters / combat).
  const ALARM_SFX = "cryo_alarm",
    DIRECTOR_OUTFIT = "director_suit",
    SHELLBACK_TYPE = "shellback",
    SK_MECH = "mechanics",
    SK_ELEC = "electronics";
  // Locks (G.locks, REBRAND §5) — see the header for where each key / code is found.
  const LOCKS = {
    office: {
      id: "qx_c4_office",
      kind: "door",
      label: "C-4 Director's Office Bulkhead",
      key: "qx_c4_director_key",
      code: "0305",
      hint: "The quartermaster's teletype in the pod hall keeps the door codes. Or ask the Director over the intercom.",
      learnedFrom: "C-4 quartermaster teletype — Door Codes",
    },
    footlocker: {
      id: "qx_c4_footlocker",
      kind: "container",
      label: "C-4 Director's Footlocker",
      key: "qx_c4_director_key",
      hint: "Director Brandt keeps the key on a lanyard round her neck.",
    },
    armory: {
      id: "qx_c4_armory",
      kind: "container",
      label: "C-4 Security Cage",
      code: "3709",
      hint: "The pump-room maintenance log mentions the new combination.",
      learnedFrom: "C-4 pump teletype — Maintenance Log",
    },
  };
  QX.c4Locks = LOCKS;

  // Minimum centre-to-centre spacing from any allocated interior cell
  // (cells are built within ±150 m; the layout grid itself is 400 m).
  const CELL_CLEAR = 400;
  function pickCell() {
    const INT = (G.LAYOUT && G.LAYOUT.INTERIORS) || {};
    const I = INT.qx_cryo_c4;
    if (I && I.origin) return { x: I.origin.x, z: I.origin.z };
    const taken = [];
    for (const k in INT) {
      const o = INT[k] && INT[k].origin;
      if (o && isFinite(o.x) && isFinite(o.z)) taken.push(o);
    }
    const free = (x, z) =>
      taken.every(
        (o) =>
          Math.abs(o.x - x) >= CELL_CLEAR || Math.abs(o.z - z) >= CELL_CLEAR,
      );
    // Preferred spot first, then walk a 400 m grid further east / south.
    if (free(12600, 2800)) return { x: 12600, z: 2800 };
    for (let i = 0; i < 16; i++)
      for (let j = 0; j < 16; j++) {
        const x = 12600 + i * CELL_CLEAR,
          z = 2800 + j * CELL_CLEAR;
        if (free(x, z)) return { x, z };
      }
    let maxX = 12600;
    for (const o of taken) maxX = Math.max(maxX, o.x);
    return { x: maxX + 2 * CELL_CLEAR, z: 2800 };
  }
  let PICKED = null;
  const ORIGIN = () => {
    if (!PICKED) {
      PICKED = pickCell();
      const INT = G.LAYOUT && G.LAYOUT.INTERIORS;
      if (INT && (PICKED.x !== 12600 || PICKED.z !== 2800) && !INT.qx_cryo_c4) {
        try {
          console.warn(
            "[quests_extra] Cryo Unit C-4 default cell (12600, 2800) is taken; using (" +
              PICKED.x +
              ", " +
              PICKED.z +
              ")",
          );
        } catch (e) {}
      }
    }
    return PICKED;
  };
  let O = null;
  const W = (lx, lz) => ({ x: O.x + lx, z: O.z + lz });
  const WATER_Y = 0.42; // atrium / tunnel flood line (wading depth)

  // Room rectangles (local): x0,x1,z0,z1,h
  const R = {
    shaft: [-3, 3, -3, 3, 7.5],
    tunnel: [-1.7, 1.7, 3, 21, 3.2],
    atrium: [-12, 12, 21, 45, 8],
    quarters: [-24, -12, 25, 41, 3.4],
    office: [12, 21, 27, 37, 3.4],
    pumps: [-5, 5, 45, 57, 5],
  };
  const SPOTS = {
    arrive: [0, 1.2],
    roll: [-2.1, -2.0],
    reel: [-7.5, 26.6],
    pumpTerm: [3.2, 44.5],
    qmTerm: [-11.4, 23.5],
    marcus: [-21.5, 37.8],
    radio: [-22.4, 38.6],
    office: [16.5, 32],
    director: [18.6, 32.4],
    transmitter: [20.3, 32],
    stash: [19.6, 28.4],
    dirTerm: [17.2, 35.9],
    bulkhead: [12, 32],
    armory: [0, 54.5],
    intercom: [11.6, 29.6],
    pod61: [10.6, 41.5],
    shells: [
      [-6, 33],
      [7, 38],
      [-2, 40.5],
      [0, 51],
    ],
  };

  // ------------------------------------------------------------------
  // Tiled-box builder (UVs scaled by face size so textures don't stretch)
  // ------------------------------------------------------------------
  function tbox(b, m, w, h, d, x, y, z, tile, ry) {
    const g = new THREE.BoxGeometry(w, h, d);
    const uv = g.attributes.uv;
    const t = tile || 2.5;
    // face order: +x, -x, +y, -y, +z, -z (4 verts each)
    const dims = [
      [d, h],
      [d, h],
      [w, d],
      [w, d],
      [w, h],
      [w, h],
    ];
    for (let f = 0; f < 6; f++)
      for (let v = 0; v < 4; v++) {
        const i = f * 4 + v;
        uv.setXY(
          i,
          (uv.getX(i) * dims[f][0]) / t,
          (uv.getY(i) * dims[f][1]) / t,
        );
      }
    if (ry) g.rotateY(ry);
    g.translate(x, y, z);
    if (g.attributes.color) g.deleteAttribute("color");
    let arr = b.parts.get(m);
    if (!arr) {
      arr = [];
      b.parts.set(m, arr);
    }
    arr.push(g);
  }
  function collider(lx, lz, w, d, y0, y1, surface, tag) {
    return G.world.addCollider(O.x + lx, O.z + lz, w, d, y0, y1, 0, {
      tag: tag || "qx_c4",
      surface: surface || "metal",
    });
  }
  /**
   * A room shell: floor, ceiling, 4 walls with door gaps. gaps: {n|s|e|w: [[a0,a1,top?], ...]} along the wall (local x for n/s, z for e/w).
   * n = z0 side, s = z1 side, w = x0 side, e = x1 side.
   */
  function room(b, mats, r, gaps, opts) {
    opts = opts || {};
    const [x0, x1, z0, z1, h] = r;
    const T = 0.3;
    tbox(
      b,
      mats.floor,
      x1 - x0,
      0.2,
      z1 - z0,
      (x0 + x1) / 2,
      -0.1,
      (z0 + z1) / 2,
      2,
    );
    tbox(
      b,
      mats.ceil,
      x1 - x0,
      0.2,
      z1 - z0,
      (x0 + x1) / 2,
      h + 0.1,
      (z0 + z1) / 2,
      2.5,
    );
    const wall = (side, a0, a1) => {
      const list = (gaps[side] || []).slice().sort((p, q) => p[0] - q[0]);
      let a = a0;
      const segs = [];
      for (const gp of list) {
        if (gp[0] > a) segs.push([a, gp[0], 0, h]);
        const top = gp[2] || 2.6;
        if (top < h) segs.push([gp[0], gp[1], top, h]);
        a = gp[1];
      }
      if (a < a1) segs.push([a, a1, 0, h]);
      for (const s of segs) {
        const len = s[1] - s[0],
          mid = (s[0] + s[1]) / 2,
          hh = s[3] - s[2],
          my = (s[2] + s[3]) / 2;
        if (side === "n" || side === "s") {
          const z = side === "n" ? z0 - T / 2 : z1 + T / 2;
          tbox(b, mats.wall, len, hh, T, mid, my, z, 2.5);
          if (s[2] === 0) collider(mid, z, len, T + 0.1, 0, h, "metal");
        } else {
          const x = side === "w" ? x0 - T / 2 : x1 + T / 2;
          tbox(b, mats.wall, T, hh, len, x, my, mid, 2.5);
          if (s[2] === 0) collider(x, mid, T + 0.1, len, 0, h, "metal");
        }
      }
      // skirting + mid trim stripe (the Long Winter orange band with a frost-white pinstripe)
      if (!opts.noTrim)
        for (const s of segs) {
          if (s[2] !== 0) continue;
          const len = s[1] - s[0],
            mid = (s[0] + s[1]) / 2;
          if (side === "n" || side === "s") {
            const z = side === "n" ? z0 + 0.03 : z1 - 0.03;
            tbox(b, mats.trimO, len, 0.18, 0.06, mid, 1.25, z, 4);
            tbox(b, mats.trimW, len, 0.05, 0.07, mid, 1.37, z, 4);
            tbox(b, mats.skirt, len, 0.25, 0.08, mid, 0.12, z, 4);
          } else {
            const x = side === "w" ? x0 + 0.03 : x1 - 0.03;
            tbox(b, mats.trimO, 0.06, 0.18, len, x, 1.25, mid, 4);
            tbox(b, mats.trimW, 0.07, 0.05, len, x, 1.37, mid, 4);
            tbox(b, mats.skirt, 0.08, 0.25, len, x, 0.12, mid, 4);
          }
        }
    };
    wall("n", x0, x1);
    wall("s", x0, x1);
    wall("w", z0, z1);
    wall("e", z0, z1);
  }
  /** Glow halo parented to the facility root (local coords) so it hides with the root. */
  function glow(lx, y, lz, color, size, flicker) {
    if (!QX.live("fx") || !G.fx.glowSprite || !V.root) return null;
    return QX.safe("glow", () =>
      G.fx.glowSprite(new THREE.Vector3(lx, y, lz), color, size || 1, {
        parent: V.root,
        intensity: 1.2,
        dayFactor: 1,
        flicker: flicker || 0,
      }),
    );
  }

  // ------------------------------------------------------------------
  // Build
  // ------------------------------------------------------------------
  const V = (QX.c4 = {
    root: null,
    water: [],
    bulkheadCol: null,
    bulkheadMesh: null,
    pumpDoorCol: null,
    pumpDoorMesh: null,
    deepWater: null,
    emergency: [],
    lamps: [],
    origin: () => O || ORIGIN(),
    marker(key, label) {
      const o = V.origin();
      const s = SPOTS[key] || SPOTS.office;
      return { x: o.x + s[0], z: o.z + s[1], label, interior: true };
    },
    inside() {
      if (!O) return false;
      const p = G.player.pos;
      return Math.abs(p.x - O.x) < 60 && p.z > O.z - 10 && p.z < O.z + 70;
    },
  });

