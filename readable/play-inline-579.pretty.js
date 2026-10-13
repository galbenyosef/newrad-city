/* src/quests_extra/35_cryo_c4.js */
/* =====================================================================
 * NEW RAD CITY — QUESTS_EXTRA — 35: CRYO UNIT C-4 ("Water Rising")
 * A second Project Long Winter site (Office of Civil Defense) under Battery
 * Park, flooded since the '67 War. Reached through the freight hatch on the
 * seawall (30_radio.js places the hatch).
 *
 * Own interior cell (not in LAYOUT.INTERIORS yet — see NOTES.md
 * "Requests to other modules"):
 *   origin = LAYOUT.INTERIORS.qx_cryo_c4.origin once core registers it;
 *   until then pickCell() scans EVERY LAYOUT.INTERIORS origin at build time
 *   and takes the first candidate (preferred 12600, 2800) that is >= 400 m
 *   from all of them, so a newly allocated cell can never overlap the site.
 *   The facility spans local x -24..21, z -3..57 (inside the ±150 m cell rule).
 *   Root visibility is explicit: root.visible === V.inside() (checked every
 *   frame in every state and on every teleport), so the flooded facility —
 *   transparent water sheets, glow sprites, merged geometry — never draws
 *   while the player is anywhere else.
 *
 * Plan (local metres, +z = deeper into the facility):
 *   hatch shaft (ladder up to the freight hatch, the Departure Roll's tin at
 *   the bottom) → knee-deep service tunnel → flooded pod hall (shellbacks,
 *   coolant manifold column, two rows of cracked cryo pods, the sealed
 *   rectangular pressure door, the Director's day-12 tape reel, the
 *   quartermaster's teletype) → west: crew quarters (Marcus Abernathy and his
 *   radio), east: the Facility Director's office behind a sandbagged bulkhead
 *   (Brandt, the transmitter, her footlocker), south: the pump room and the
 *   security cage, under water until the pumps are restarted.
 *
 * Locks (G.locks, REBRAND §5):
 *   qx_c4_office     office bulkhead — key qx_c4_director_key or keypad 0305
 *                    (code on the quartermaster teletype "Door Codes"; Brandt
 *                    also opens it from inside over the intercom)
 *   qx_c4_footlocker Director's footlocker — key qx_c4_director_key (Brandt gives
 *                    it on every ending; she carries it if she dies)
 *   qx_c4_armory     security cage — keypad 3709 (pump-room maintenance log)
 *   qx_c4_dir_term   Director's teletype — passcode WATCHKEEPER (quartermaster
 *                    teletype "Door Codes", and Brandt tells you)
 * ===================================================================== */
(function () {
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

  QX.hook("world", function () {
    O = ORIGIN();
    const k = K();
    const root = new THREE.Group();
    root.position.set(O.x, 0, O.z);
    root.name = "qx_cryo_c4";
    G.scene.add(root);
    V.root = root;
    root.visible = false; // shown only while the player is inside (see 'always' hook)
    const b = k.builder();
    const M = {
      // frost-white glazed tile walls, grey terrazzo floor, Long Winter orange band
      wall: k.tint("qx_c4_tile", 0xc5cccf, {
        roughness: 0.45,
        metalness: 0.05,
      }),
      floor: k.tint("qx_c4_floor", 0x6f777a, { roughness: 0.7 }),
      ceil: k.mat("metal_panel", 0x3c4246),
      trimO: k.tint("qx_c4_orange", 0xd8641e, { roughness: 0.6 }),
      trimW: k.tint("qx_c4_white", 0xe8eef0, { roughness: 0.5 }),
      skirt: k.mat("rust", 0x5a3a22),
      rust: k.mat("rust", 0x5a3a22),
      metal: k.mat("metal_painted", 0x55606a),
      conc: k.mat("concrete_dark", 0x4a4844),
      pipe: k.tint("qx_c4_pipe", 0x4f5a52, { roughness: 0.55, metalness: 0.6 }),
      dark: k.tint("qx_c4_dark", 0x14171a, { roughness: 0.9 }),
      lamp: k.tint("qx_c4_lamp", 0xe8f0e0, {
        emissive: 0xcfe0c8,
        emissiveIntensity: 1.2,
        roughness: 0.4,
      }),
      red: k.tint("qx_c4_red", 0x801810, {
        emissive: 0xff2a10,
        emissiveIntensity: 1.4,
      }),
      crt: k.tint("qx_c4_crt", 0x3a2408, {
        emissive: 0xffa020,
        emissiveIntensity: 0.9,
      }), // amber indicator glass
      glass: k.tint("qx_c4_podglass", 0xd8e6ea, {
        roughness: 0.08,
        metalness: 0.1,
        transparent: true,
        opacity: 0.32,
        depthWrite: false,
      }),
      frost: k.tint("qx_c4_frost", 0xf2f6f8, {
        roughness: 0.95,
        transparent: true,
        opacity: 0.7,
        depthWrite: false,
      }),
      shell: k.tint("qx_c4_podshell", 0xd4d8d6, {
        roughness: 0.5,
        metalness: 0.35,
      }),
      slime: k.tint("qx_c4_slime", 0x2e3a22, { roughness: 1 }),
      wood: k.mat("wood_planks", 0x6a4a2a),
      fabric: k.mat("fabric", 0x6a6a5a),
      sand: k.tint("qx_c4_sand", 0x8a7a58, { roughness: 1 }),
    };

    // --- shells ---
    room(b, M, R.shaft, { s: [[-1.7, 1.7, 2.8]] });
    room(
      b,
      M,
      R.tunnel,
      { n: [[-1.7, 1.7, 3.2]], s: [[-1.7, 1.7, 3.2]] },
      { noTrim: false },
    );
    room(b, M, R.atrium, {
      n: [[-1.7, 1.7, 3.2]],
      w: [[31, 35, 2.8]],
      e: [[30.8, 33.2, 2.6]],
      s: [[-1.3, 1.3, 2.6]],
    });
    room(b, M, R.quarters, { e: [[31, 35, 2.8]] });
    room(b, M, R.office, { w: [[30.8, 33.2, 2.6]] });
    room(b, M, R.pumps, { n: [[-1.3, 1.3, 2.6]] });

    // --- pressure-door frames round every doorway (jambs + lintel, orange/black hazard-striped
    //     inner faces, rivet strip) so each opening reads as a door at a glance ---
    const hzY = k.tint("qx_c4_hazard", 0xd8641e, { roughness: 0.7 }),
      hzK = k.tint("qx_c4_hazard_d", 0x1c1c1a, { roughness: 0.8 });
    /** axis 'z': opening in a wall at z=c spanning x a0..a1; axis 'x': wall at x=c spanning z a0..a1. */
    const frame = (axis, c, a0, a1, top) => {
      const J = 0.32,
        D = 0.62; // jamb width, depth through the wall
      const put = (w, h, d, u, y, v, m) =>
        axis === "z"
          ? k.box(b, m, w, h, d, u, y, c + v)
          : k.box(b, m, d, h, w, c + v, y, u);
      for (const [u, sgn] of [
        [a0 - J / 2, 1],
        [a1 + J / 2, -1],
      ]) {
        put(J, top + J, D, u, (top + J) / 2, 0, M.metal);
        for (let y = 0.15; y < top; y += 0.5)
          put(
            0.02,
            0.24,
            D + 0.02,
            u + sgn * (J / 2 + 0.005),
            y + 0.12,
            0,
            Math.round(y * 2) % 2 ? hzY : hzK,
          );
      }
      put(a1 - a0 + J * 2, J, D, (a0 + a1) / 2, top + J / 2, 0, M.metal);
      put(a1 - a0, 0.04, D + 0.02, (a0 + a1) / 2, top - 0.02, 0, hzY);
      for (const v of [-D / 2 - 0.01, D / 2 + 0.01])
        put(
          a1 - a0 + J * 2 - 0.1,
          0.06,
          0.03,
          (a0 + a1) / 2,
          top + J * 0.55,
          v,
          M.rust,
        );
    };
    frame("z", 3, -1.7, 1.7, 2.8); // shaft → tunnel
    frame("z", 21, -1.7, 1.7, 3.2); // tunnel → pod hall
    frame("x", -12, 31, 35, 2.8); // pod hall → crew quarters
    frame("x", 12, 30.8, 33.2, 2.6); // pod hall → Director's office
    frame("z", 45, -1.3, 1.3, 2.6); // pod hall → pump room
    // structural ribs up the pod-hall walls (riveted-panel rhythm)
    for (let x = -10; x <= 10; x += 4) {
      if (Math.abs(x) < 3 || (x > -10.5 && x < -2.5)) {
        /* tunnel mouth / pressure door */
      } else tbox(b, M.metal, 0.34, 8, 0.16, x, 4, 21.08, 2);
      if (Math.abs(x) > 2.2) tbox(b, M.metal, 0.34, 8, 0.16, x, 4, 44.92, 2);
    }
    for (let z = 23; z <= 43; z += 4) {
      if (z < 30 || z > 36) {
        tbox(b, M.metal, 0.16, 8, 0.34, -11.92, 4, z, 2);
        tbox(b, M.metal, 0.16, 8, 0.34, 11.92, 4, z, 2);
      }
    }
    // --- shaft: ladder, hatch disc at the top, the roll's tin, puddles ---
    for (let i = 0; i < 2; i++)
      tbox(b, M.rust, 0.08, 7.2, 0.08, -0.35 + i * 0.7, 3.6, -2.8, 1);
    for (let y = 0.35; y < 7.2; y += 0.35)
      tbox(b, M.rust, 0.7, 0.05, 0.05, 0, y, -2.8, 1);
    k.cyl(b, M.metal, 0.9, 0.2, 0, 7.4, -2.2, 16);
    k.box(b, M.metal, 0.28, 0.2, 0.18, SPOTS.roll[0], 0.1, SPOTS.roll[1]); // tin box
    k.box(b, M.trimO, 0.29, 0.03, 0.19, SPOTS.roll[0], 0.2, SPOTS.roll[1]);
    // --- tunnel: pipes both sides, bulkhead ribs, drips ---
    for (const s of [-1, 1]) {
      k.cyl(b, M.pipe, 0.16, 18, s * 1.4, 2.4, 12, 8, Math.PI / 2);
      k.cyl(b, M.pipe, 0.09, 18, s * 1.45, 2.85, 12, 8, Math.PI / 2);
      k.cyl(b, M.rust, 0.11, 18, s * 1.45, 0.6, 12, 8, Math.PI / 2);
    }
    for (let z = 5; z < 21; z += 4) {
      tbox(b, M.metal, 3.6, 0.25, 0.3, 0, 3.05, z, 2);
      tbox(b, M.metal, 0.25, 3.2, 0.3, -1.65, 1.6, z, 2);
      tbox(b, M.metal, 0.25, 3.2, 0.3, 1.65, 1.6, z, 2);
    }
    // --- pod hall: the coolant manifold column, balcony stubs, flooded furniture, catwalk ---
    const cx = 0,
      cz = 33;
    k.cyl(b, M.conc, 1.6, 8, cx, 4, cz, 16);
    k.cyl(b, M.trimO, 1.66, 0.35, cx, 1.3, cz, 16);
    k.cyl(b, M.trimW, 1.67, 0.08, cx, 1.52, cz, 16);
    for (let i = 0; i < 6; i++) {
      // coolant risers round the column
      const a = (i / 6) * Math.PI * 2 + 0.26,
        px = cx + Math.cos(a) * 1.78,
        pz = cz + Math.sin(a) * 1.78;
      k.cyl(b, M.pipe, 0.11, 7.6, px, 3.8, pz, 8);
      for (const y of [2.4, 4.6, 6.8])
        k.cyl(b, M.frost, 0.15, 0.32, px, y, pz, 8); // frost collars where the old coolant still sweats
    }
    k.cyl(b, M.frost, 1.63, 0.6, cx, 5.6, cz, 16); // rime band where the manifold ring runs
    collider(cx, cz, 3.8, 3.8, 0, 8, "concrete");
    // upper balcony ring (decorative, out of reach) with railings
    // (the north run stops short of the pressure door, which rises through it)
    for (const s of [-1, 1]) {
      if (s > 0) {
        tbox(b, M.metal, 24, 0.25, 2.4, 0, 4.2, 43.8, 2);
        tbox(b, M.metal, 24, 0.9, 0.06, 0, 4.8, 42.6, 2);
      } else {
        tbox(b, M.metal, 14.4, 0.25, 2.4, 4.8, 4.2, 22.2, 2);
        tbox(b, M.metal, 14.4, 0.9, 0.06, 4.8, 4.8, 23.4, 2);
        tbox(b, M.metal, 0.06, 0.9, 2.4, -2.4, 4.8, 22.2, 2);
      }
      tbox(b, M.metal, 2.4, 0.25, 24, s * 10.8, 4.2, 33, 2);
      tbox(b, M.metal, 0.06, 0.9, 24, s * 9.6, 4.8, 33, 2);
    }
    // PRESSURE DOOR 1 — the rectangular freight bulkhead on the north wall, sealed since day nine
    // (the hydraulics are under water; everyone left by the freight hatch). A heavy steel leaf in a
    // concrete surround, orange/black chevrons on the frame, three locking dogs, a wired viewport,
    // salt-frost along every seam, and an Office of Civil Defense stencil on the leaf.
    {
      const DX = -6.6,
        DZ = 21,
        HW = 2.3,
        HH = 4.4; // leaf half-width, height
      const hz = k.tint("qx_c4_hazard", 0xd8641e, { roughness: 0.7 });
      const hzd = k.tint("qx_c4_hazard_d", 0x1c1c1a, { roughness: 0.8 });
      const leaf = k.tint("qx_c4_leafsteel", 0x8a8e90, {
        roughness: 0.45,
        metalness: 0.75,
      });
      // concrete surround + shadow gap
      tbox(
        b,
        M.conc,
        HW * 2 + 1.6,
        HH + 0.9,
        0.5,
        DX,
        (HH + 0.9) / 2,
        DZ + 0.22,
        2,
      );
      k.box(
        b,
        M.dark,
        HW * 2 + 0.2,
        HH + 0.12,
        0.06,
        DX,
        (HH + 0.12) / 2,
        DZ + 0.5,
      );
      // chevrons up both jambs and across the head
      for (let i = 0; i < 9; i++) {
        const y = 0.3 + i * 0.52;
        for (const sx of [-1, 1])
          k.box(
            b,
            i % 2 ? hz : hzd,
            0.6,
            0.5,
            0.04,
            DX + sx * (HW + 0.5),
            y,
            DZ + 0.49,
            0,
            0,
            sx * 0.6,
          );
      }
      for (let i = 0; i < 9; i++)
        k.box(
          b,
          i % 2 ? hz : hzd,
          0.6,
          0.38,
          0.04,
          DX - HW - 0.2 + i * 0.6,
          HH + 0.45,
          DZ + 0.49,
          0,
          0,
          0.6,
        );
      // the leaf: plate, horizontal stiffeners, three locking dogs, the wired viewport
      k.box(b, leaf, HW * 2, HH, 0.5, DX, HH / 2, DZ + 0.62);
      for (const y of [0.9, 2.2, 3.5])
        k.box(b, leaf, HW * 2 - 0.2, 0.18, 0.12, DX, y, DZ + 0.92);
      for (const y of [1.1, 2.2, 3.3]) {
        k.box(b, M.metal, 0.5, 0.26, 0.2, DX + HW - 0.35, y, DZ + 0.98);
        k.box(b, M.rust, 1.1, 0.1, 0.1, DX + HW + 0.2, y, DZ + 1.0); // dog bar, thrown home
      }
      k.box(b, M.dark, 0.9, 0.5, 0.06, DX, 3.0, DZ + 0.9);
      for (let i = 0; i < 4; i++)
        k.box(
          b,
          M.metal,
          0.02,
          0.5,
          0.02,
          DX - 0.36 + i * 0.24,
          3.0,
          DZ + 0.94,
        );
      // salt-frost along the seams and the head (the room breathes cold off the coolant)
      for (let i = 0; i < 12; i++)
        k.box(
          b,
          M.frost,
          0.5 + (i % 3) * 0.2,
          0.06,
          0.05,
          DX - HW + 0.3 + i * 0.36,
          HH - 0.05 - (i % 2) * 0.08,
          DZ + 0.9,
        );
      for (const sx of [-1, 1])
        for (let i = 0; i < 6; i++)
          k.box(
            b,
            M.frost,
            0.07,
            0.4 + (i % 2) * 0.3,
            0.05,
            DX + sx * (HW - 0.04),
            1.0 + i * 0.6,
            DZ + 0.9,
          );
      k.box(b, M.slime, HW * 2 + 1.4, 0.5, 0.05, DX, 0.9, DZ + 0.96); // twenty-two years of tide line
      collider(DX, DZ + 0.5, HW * 2 + 1.6, 1.0, 0, HH + 0.9, "metal");
      // hydraulic ram housing — sheared, rusting in the water
      tbox(b, M.metal, 1.1, 1.3, 1.2, DX + HW + 1.5, 3.1, DZ + 0.7, 1);
      k.cyl(b, M.pipe, 0.2, 2.4, DX + HW + 1.5, 1.2, DZ + 0.7, 10);
      k.cyl(b, M.rust, 0.12, 1.3, DX + HW + 1.3, 0.35, DZ + 1.5, 8, 1.1);
      // door control podium (dead) and a pair of emergency lamps flanking the door
      const PX = DX - HW - 1.55,
        PZ = DZ + 1.3;
      tbox(b, M.metal, 0.9, 1.1, 0.6, PX, 0.55, PZ, 1);
      k.box(b, M.metal, 0.9, 0.08, 0.6, PX, 1.16, PZ - 0.05, 0, -0.45);
      k.box(b, M.red, 0.14, 0.14, 0.06, PX - 0.2, 1.2, PZ - 0.18, 0, -0.45);
      k.box(b, M.crt, 0.3, 0.12, 0.04, PX + 0.15, 1.22, PZ - 0.2, 0, -0.45);
      k.cyl(b, M.metal, 0.03, 0.4, PX + 0.3, 1.35, PZ, 6); // the lever, thrown, for all the good it did
      collider(PX, PZ, 0.9, 0.6, 0, 1.2, "metal");
      V.pdoor = { x: DX, y: HH / 2, z: DZ, hw: HW, hh: HH, podium: [PX, PZ] };
    }
    // --- the pod rows: Project Long Winter cryo pods along the east and west walls, lids cracked
    //     open for the emergency thaw on day eight. Grey-white shells, orange collar rings, frosted
    //     glass (some of it shattered), a stencilled number on each plinth. Pod 61 is still sealed.
    V.pods = [];
    const pod = (px, pz, face, n, opts) => {
      opts = opts || {};
      const ox = face * 0.42; // glass side toward the hall
      k.box(b, M.metal, 1.25, 0.3, 1.25, px, 0.15, pz); // plinth
      k.cyl(b, M.shell, 0.58, 2.2, px - face * 0.08, 1.4, pz, 14); // back shell
      k.cyl(b, M.trimO, 0.62, 0.12, px - face * 0.08, 0.5, pz, 14); // orange collar rings
      k.cyl(b, M.trimO, 0.62, 0.12, px - face * 0.08, 2.48, pz, 14);
      k.cyl(b, M.shell, 0.5, 0.3, px - face * 0.08, 2.7, pz, 14); // crown + coolant stub
      k.cyl(b, M.pipe, 0.07, 1.4, px - face * 0.08, 3.5, pz, 6);
      if (!opts.broken) {
        k.box(b, M.glass, 0.06, 1.8, 0.86, px + ox, 1.45, pz); // the lid's glass
        for (let i = 0; i < 4; i++)
          k.box(
            b,
            M.frost,
            0.07,
            0.18 + (i % 2) * 0.3,
            0.3 + (i % 3) * 0.12,
            px + ox + face * 0.005,
            0.7 + i * 0.42,
            pz - 0.25 + (i % 2) * 0.4,
          );
        if (opts.cracked)
          for (let i = 0; i < 5; i++)
            k.box(
              b,
              M.dark,
              0.075,
              0.5 + (i % 2) * 0.25,
              0.012,
              px + ox + face * 0.01,
              1.5 + (i - 2) * 0.12,
              pz + (i - 2) * 0.09,
              0,
              0.5 + i * 0.6,
            );
      } else {
        for (let i = 0; i < 6; i++)
          k.box(
            b,
            M.glass,
            0.18,
            0.012,
            0.12,
            px + face * (0.9 + (i % 3) * 0.2),
            0.02,
            pz - 0.3 + i * 0.12,
            i * 0.9,
          ); // shards on the floor
        k.box(b, M.fabric, 0.06, 1.5, 0.5, px - face * 0.25, 1.35, pz); // the padded liner, sagging
      }
      if (opts.sealed) {
        k.box(b, M.frost, 0.08, 1.75, 0.8, px + ox + face * 0.02, 1.45, pz);
        k.box(b, M.crt, 0.04, 0.1, 0.1, px + ox + face * 0.06, 2.25, pz + 0.3);
      }
      collider(px, pz, 1.3, 1.3, 0, 2.8, "metal");
      const pl = k.plate(String(n), 0.34, 0.2, {
        fg: "#1c1c1a",
        bg: "#dfe3e2",
      });
      pl.position.set(px + face * 0.64, 0.15, pz);
      pl.rotation.y = face > 0 ? Math.PI / 2 : -Math.PI / 2;
      root.add(pl);
      V.pods.push({ x: px, z: pz, n });
    };
    // west row (faces +x), east row (faces -x); door gaps at z 31..35 (west) and 30.8..33.2 (east)
    pod(-10.6, 37.6, 1, 12, { cracked: true });
    pod(-10.6, 40.0, 1, 13, { broken: true });
    pod(-10.6, 42.4, 1, 14, { cracked: true });
    pod(10.6, 36.6, -1, 58, { broken: true });
    pod(10.6, 39.0, -1, 59, { cracked: true });
    pod(SPOTS.pod61[0], SPOTS.pod61[1], -1, 61, { sealed: true });
    // flooded canteen tables & chairs, a toppled Fizzo Cola machine
    for (const [tx, tz] of [
      [-6, 29],
      [-7.5, 38],
      [6.5, 27.5],
      [5.5, 40.5],
    ]) {
      k.cyl(b, M.metal, 0.5, 0.05, tx, 0.74, tz, 12);
      k.cyl(b, M.metal, 0.05, 0.72, tx, 0.37, tz, 6);
      for (let i = 0; i < 2; i++) {
        const a = i * 2.4 + tx;
        k.box(
          b,
          M.trimO,
          0.42,
          0.06,
          0.42,
          tx + Math.cos(a) * 0.8,
          0.45,
          tz + Math.sin(a) * 0.8,
          a,
        );
        k.box(
          b,
          M.trimO,
          0.42,
          0.45,
          0.05,
          tx + Math.cos(a) * 1.0,
          0.7,
          tz + Math.sin(a) * 1.0,
          a,
        );
      }
    }
    k.box(b, M.red, 1.0, 0.8, 1.8, 9.8, 0.4, 24.5, 0.3); // toppled Fizzo Cola machine (lit panel face)
    collider(9.8, 24.5, 1.4, 2, 0, 0.8, "metal");
    // tape-reel desk (the Director's day-12 reel)
    k.box(b, M.metal, 1.6, 0.08, 0.8, SPOTS.reel[0], 0.78, SPOTS.reel[1]);
    k.box(b, M.metal, 1.5, 0.74, 0.7, SPOTS.reel[0], 0.37, SPOTS.reel[1]);
    collider(SPOTS.reel[0], SPOTS.reel[1], 1.6, 0.8, 0, 0.82, "metal");
    // pump-control panel housing on the south wall
    k.box(
      b,
      M.metal,
      1.6,
      2.2,
      0.5,
      SPOTS.pumpTerm[0],
      1.1,
      SPOTS.pumpTerm[1] + 0.15,
    );
    for (let i = 0; i < 4; i++)
      k.box(
        b,
        i % 2 ? M.red : M.crt,
        0.12,
        0.12,
        0.05,
        SPOTS.pumpTerm[0] - 0.5 + i * 0.3,
        1.9,
        SPOTS.pumpTerm[1] - 0.12,
      );
    // big overhead pipes into the pump room + a warning sign
    k.cyl(b, M.pipe, 0.35, 24, -9, 6.8, 33, 10, Math.PI / 2);
    k.cyl(b, M.pipe, 0.35, 24, 9, 6.8, 33, 10, Math.PI / 2);
    // slime tide line on the walls (the water used to be higher)
    tbox(b, M.slime, 24.2, 0.12, 0.02, 0, 1.75, 21.02, 4);
    tbox(b, M.slime, 24.2, 0.12, 0.02, 0, 1.75, 44.98, 4);
    tbox(b, M.slime, 0.02, 0.12, 24.2, -11.98, 1.75, 33, 4);
    tbox(b, M.slime, 0.02, 0.12, 24.2, 11.98, 1.75, 33, 4);
    // --- quarters: bunks, lockers, Marcus's chair and radio ---
    const [qx0, qx1, qz0, qz1] = R.quarters;
    for (let i = 0; i < 4; i++) {
      const bz = qz0 + 2 + i * 3.4;
      for (const lvl of [0.45, 1.6]) {
        tbox(b, M.metal, 2.0, 0.12, 0.95, qx0 + 1.2, lvl, bz, 2);
        tbox(b, M.fabric, 1.9, 0.14, 0.85, qx0 + 1.2, lvl + 0.13, bz, 1);
      }
      for (const px of [qx0 + 0.25, qx0 + 2.15])
        tbox(b, M.metal, 0.06, 2.0, 0.06, px, 1.0, bz - 0.44, 1);
      collider(qx0 + 1.2, bz, 2.0, 1.0, 0, 2.0, "metal");
    }
    for (let i = 0; i < 5; i++) {
      tbox(b, M.shell, 0.6, 1.9, 0.5, qx0 + 5 + i * 0.64, 0.95, qz0 + 0.3, 1);
      tbox(b, M.trimO, 0.61, 0.08, 0.51, qx0 + 5 + i * 0.64, 1.7, qz0 + 0.3, 1);
    }
    collider(qx0 + 6.3, qz0 + 0.3, 3.3, 0.55, 0, 1.9, "metal");
    k.box(b, M.wood, 0.6, 0.5, 0.45, SPOTS.radio[0], 0.25, SPOTS.radio[1]); // side table
    k.box(b, M.wood, 0.46, 0.3, 0.26, SPOTS.radio[0], 0.65, SPOTS.radio[1]); // the radio
    k.box(
      b,
      M.crt,
      0.2,
      0.08,
      0.02,
      SPOTS.radio[0] + 0.05,
      0.7,
      SPOTS.radio[1] + 0.135,
    );
    k.box(b, M.fabric, 0.7, 0.45, 0.7, SPOTS.marcus[0], 0.45, SPOTS.marcus[1]); // armchair
    k.box(
      b,
      M.fabric,
      0.7,
      0.6,
      0.15,
      SPOTS.marcus[0],
      0.95,
      SPOTS.marcus[1] + 0.3,
    );
    collider(
      SPOTS.marcus[0],
      SPOTS.marcus[1] + 0.2,
      1.1,
      1.0,
      0,
      0.9,
      "carpet",
    );
    // --- office: sandbags in the doorway, desk, the transmitter rack, the window ---
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 2; j++)
        k.box(
          b,
          M.sand,
          0.72,
          0.2,
          0.42,
          11.4,
          0.1 + j * 0.2,
          31.2 + i * 0.8 + (j ? 0.4 : 0),
          0.05 * (i - 1),
        );
    collider(11.4, 32, 0.5, 2.4, 0, 0.42, "rubble"); // step over (0.42 m)
    tbox(
      b,
      M.wood,
      2.2,
      0.08,
      1.0,
      SPOTS.office[0],
      0.78,
      SPOTS.office[1] + 1.6,
      1,
    );
    tbox(
      b,
      M.wood,
      2.1,
      0.74,
      0.9,
      SPOTS.office[0],
      0.37,
      SPOTS.office[1] + 1.6,
      1,
    );
    collider(SPOTS.office[0], SPOTS.office[1] + 1.6, 2.2, 1.0, 0, 0.82, "wood");
    tbox(
      b,
      M.metal,
      0.8,
      2.3,
      2.6,
      SPOTS.transmitter[0],
      1.15,
      SPOTS.transmitter[1],
      1,
    );
    for (let i = 0; i < 6; i++)
      k.box(
        b,
        i % 3 === 0 ? M.red : M.crt,
        0.03,
        0.08,
        0.14,
        SPOTS.transmitter[0] - 0.41,
        0.8 + i * 0.22,
        SPOTS.transmitter[1] - 0.8 + (i % 3) * 0.4,
      );
    k.box(
      b,
      M.dark,
      0.03,
      0.7,
      1.2,
      SPOTS.transmitter[0] - 0.41,
      1.75,
      SPOTS.transmitter[1],
    ); // tape reels bay
    for (const rz of [-0.3, 0.3])
      k.cyl(
        b,
        M.metal,
        0.22,
        0.04,
        SPOTS.transmitter[0] - 0.43,
        1.75,
        SPOTS.transmitter[1] + rz,
        14,
        0,
        Math.PI / 2,
      );
    collider(
      SPOTS.transmitter[0],
      SPOTS.transmitter[1],
      0.9,
      2.7,
      0,
      2.3,
      "metal",
    );
    k.cyl(
      b,
      M.metal,
      0.03,
      3.0,
      SPOTS.transmitter[0],
      3.4,
      SPOTS.transmitter[1],
      5,
    ); // mast through the ceiling
    // the cot she sleeps on (she doesn't)
    tbox(b, M.metal, 0.9, 0.35, 2.0, 13.3, 0.35, 35.4, 1);
    tbox(b, M.fabric, 0.85, 0.1, 1.9, 13.3, 0.55, 35.4, 1);
    collider(13.3, 35.4, 0.9, 2.0, 0, 0.6, "metal");
    // tally marks: twenty-two years of days, scratched into the tile above the cot
    const tally = k.sign(
      "||||| ||||| ||||| ||||| ||||| ||||| ||||| ||||| ||||| |||||\n||||| ||||| ||||| ||||| ||||| ||||| ||||| ||||| ||||| |||||\n||||| ||||| ||||| ||||| ||||| ||||| ||||| ||||| ||||| |||||\nDAY 8,012",
      "wood",
      2.6,
      0.9,
      { fg: "#2a2a28", bg: "#b9c2c5" },
    );
    tally.position.set(12.04, 1.8, 35.2);
    tally.rotation.y = Math.PI / 2;
    root.add(tally);
    // --- pump room: the pumps, and the armory cage at the back ---
    for (const px of [-2.6, 2.6]) {
      k.cyl(b, M.pipe, 1.0, 2.6, px, 1.3, 49, 14);
      k.cyl(b, M.rust, 0.45, 3.4, px, 3.5, 49, 10);
    }
    for (let i = 0; i < 6; i++)
      tbox(b, M.metal, 0.05, 2.5, 0.05, -2.5 + i, 1.25, 53, 1);
    collider(-2.6, 49, 2, 2, 0, 2.6, "metal");
    collider(2.6, 49, 2, 2, 0, 2.6, "metal");

    // --- lights: fluorescent tubes (baked emissive), emergency reds (flicker) ---
    const tubes = [
      [0, 7.2, 0],
      [0, 3.0, 8],
      [0, 3.0, 16],
      [-6, 7.7, 27],
      [6, 7.7, 27],
      [-6, 7.7, 39],
      [6, 7.7, 39],
      [-18, 3.3, 30],
      [-18, 3.3, 37],
      [16.5, 3.3, 31],
      [0, 4.8, 51],
    ];
    for (const t of tubes) {
      k.box(b, M.lamp, 1.3, 0.06, 0.18, t[0], t[1], t[2]);
    }
    k.flush(b, root, false);
    for (const t of tubes)
      V.lamps.push(
        glow(t[0], t[1] - 0.2, t[2], 0xcfe8c8, t[1] < 4 ? 1.7 : 3.2),
      ); // smaller halos under the low ceilings
    for (const r of [
      [0, 2.8, 20.7],
      [-11.7, 3.2, 33],
      [11.7, 3.2, 26],
      [0, 3.2, 44.7],
      [-1.5, 3.2, 2.7],
    ]) {
      k.box(b, M.red, 0.3, 0.18, 0.18, r[0], r[1], r[2]);
      const gs = glow(r[0], r[1], r[2], 0xff3018, 1.6, 0.8);
      if (gs) V.emergency.push(gs);
    }
    k.flush(b, root, false);

    // --- water: one transparent sheet for the tunnel + atrium + quarters, a deep one in the pump room ---
    const wm = new THREE.MeshStandardMaterial({
      color: 0x223328,
      roughness: 0.08,
      metalness: 0.5,
      transparent: true,
      opacity: 0.78,
      depthWrite: false,
    });
    wm.userData.shared = true;
    const sheet = (x0, x1, z0, z1, y) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0), wm);
      m.rotation.x = -Math.PI / 2;
      m.position.set((x0 + x1) / 2, y, (z0 + z1) / 2);
      m.renderOrder = 2;
      root.add(m);
      V.water.push(m);
      return m;
    };
    sheet(-1.7, 1.7, 1.5, 21, WATER_Y * 0.7);
    sheet(-12, 12, 21, 45, WATER_Y);
    sheet(-24, -12, 25, 41, WATER_Y);
    V.deepWater = sheet(-5, 5, 45, 57, 3.1);
    // wading surface (footsteps splash) — thin walkable slabs at floor level
    for (const r of [
      [-1.7, 1.7, 3, 21],
      [-12, 12, 21, 45],
      [-24, -12, 25, 41],
    ])
      collider(
        (r[0] + r[1]) / 2,
        (r[2] + r[3]) / 2,
        r[1] - r[0],
        r[3] - r[2],
        -0.3,
        0.0,
        "water",
        "qx_c4_wade",
      );
    // the flooded pump-room doorway: blocks until the pumps are restarted
    const pd = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.6, 0.12), M.rust);
    pd.position.set(0, 1.3, 45.1);
    root.add(pd);
    V.pumpDoorMesh = pd;
    V.pumpDoorCol = collider(0, 45.1, 2.8, 0.3, 0, 2.6, "metal");
    // the office bulkhead (slides up when unlocked)
    const bh = new THREE.Mesh(new THREE.BoxGeometry(0.14, 2.6, 2.4), M.metal);
    bh.position.set(12.05, 1.3, 32);
    root.add(bh);
    V.bulkheadMesh = bh;
    V.bulkheadCol = collider(12.1, 32, 0.3, 2.5, 0, 2.6, "metal");
    const plate = (text, w, h, x, y, z, ry, o) => {
      const p = k.plate(text, w, h, o || { fg: "#1c1c1a", bg: "#dfe3e2" });
      p.position.set(x, y, z);
      p.rotation.y = ry || 0;
      root.add(p);
      return p;
    };
    plate("FACILITY DIRECTOR", 1.4, 0.3, 11.8, 2.85, 32, -Math.PI / 2, {
      fg: "#e8eaea",
      bg: "#c4561a",
    });
    plate(
      "OFFICE OF CIVIL DEFENSE — PROJECT LONG WINTER\nCRYO UNIT C-4\nSLEEP SOUND. AMERICA KEEPS WATCH.",
      3.6,
      1.0,
      0,
      5.9,
      21.2,
      0,
      { fg: "#1c1c1a", bg: "#dfe3e2", stripe: "#d8641e" },
    );
    // the way out: a stencilled placard beside the ladder, lit by the shaft's own tube
    plate("FREIGHT HATCH\n↑ SEAWALL ↑", 1.1, 0.5, 1.25, 2.1, -2.84, 0, {
      fg: "#1c1c1a",
      bg: "#dfe3e2",
      stripe: "#d8641e",
    });
    // the stencilled door number (on the leaf) + the podium placard
    if (V.pdoor) {
      plate(
        "PRESSURE DOOR 1\nC-4",
        1.6,
        0.62,
        V.pdoor.x,
        1.9,
        V.pdoor.z + 0.99,
        0,
        { fg: "#e8eaea", bg: "#5e6264" },
      );
      plate(
        "PRESSURE DOOR\nCYCLE CONTROL",
        0.7,
        0.26,
        V.pdoor.podium[0],
        1.45,
        V.pdoor.podium[1] - 0.29,
        0,
        { fg: "#1c1c1a", bg: "#d8641e" },
      );
      for (const sx of [-1, 1]) {
        const gl = glow(
          V.pdoor.x + sx * (V.pdoor.hw + 1.0),
          5.2,
          V.pdoor.z + 0.35,
          0xff3018,
          1.3,
          0.6,
        );
        if (gl) V.emergency.push(gl);
      }
    }
    plate("PUMP ROOM\nAUTHORIZED PERSONNEL", 1.4, 0.45, 0, 3.0, 44.8, Math.PI, {
      fg: "#1c1c1a",
      bg: "#d8641e",
    });
    plate(
      "POD BAY — EAST\n58 · 59 · 61",
      1.4,
      0.4,
      11.84,
      3.2,
      39.0,
      -Math.PI / 2,
    );
    plate(
      "POD BAY — WEST\n12 · 13 · 14",
      1.4,
      0.4,
      -11.84,
      3.2,
      40.0,
      Math.PI / 2,
    );
    // radiation in the standing water (mild)
    G.world.addRadSource({
      x: O.x,
      y: 0,
      z: O.z + 33,
      radius: 13,
      strength: 0.6,
    });
    G.world.addRadSource({
      x: O.x - 18,
      y: 0,
      z: O.z + 33,
      radius: 7,
      strength: 0.4,
    });

    // --- doors: seawall freight hatch ↔ the bottom of the shaft ---
    const H = QX.world.c4Hatch || QX.radioSpots.hatch;
    G.world.addDoor({
      id: "qx_c4_hatch",
      pos: QX.V3(H.x, (H.y || 0) + 0.6, H.z),
      radius: 1.3,
      label: "Cryo Unit C-4 Freight Hatch",
      verb: "Climb Down",
      sound: "door_metal",
      target: {
        x: O.x + SPOTS.arrive[0],
        y: 0,
        z: O.z + SPOTS.arrive[1],
        yaw: Math.PI,
      },
      onEnter: () => V.entered(),
    });
    G.world.addDoor({
      id: "qx_c4_ladder",
      pos: QX.V3(O.x, 1.4, O.z - 2.5),
      radius: 1.0,
      label: "Ladder to the Seawall",
      verb: "Climb Up",
      sound: "door_metal",
      target: { x: H.x + 2.2, y: H.y || 0, z: H.z, yaw: -Math.PI / 2 },
    });

    // --- interactables ---
    if (V.pdoor)
      QX.interact({
        pos: QX.V3(O.x + V.pdoor.podium[0], 1.2, O.z + V.pdoor.podium[1]),
        radius: 0.7,
        label: "Pressure Door Control",
        verb: "Press",
        priority: 2,
        onInteract: () => {
          QX.sfx(QX.flag("c4_pumps") ? ALARM_SFX : "ui_error");
          QX.notify(
            QX.flag("c4_pumps")
              ? "A klaxon whoops once. Behind the leaf, something enormous groans, shifts an inch, and stops. Frost cracks off the seams like gunfire. The ram is sheared clean through. This door is never opening again."
              : 'Click. Nothing. The door hydraulics are somewhere under the water, and they have been since day nine. A strip of tape on the button reads: "USE THE HATCH. — J.B."',
          );
        },
      });
    QX.interact({
      pos: QX.V3(O.x + 11.55, 1.6, O.z + 32),
      radius: 1.1,
      label: "Director's Office — Bulkhead",
      verb: "Open",
      priority: 2,
      locked: () => (QX.flag("c4_bulkhead") ? null : "Locked (key or keypad)"),
      enabled: () => !QX.flag("c4_bulkhead"),
      onInteract: () => V.tryBulkhead(),
    });
    QX.interact({
      pos: QX.V3(O.x + SPOTS.pod61[0] - 0.7, 1.5, O.z + SPOTS.pod61[1]),
      radius: 0.7,
      label: "Cryo Pod 61",
      verb: "Examine",
      priority: 1,
      onInteract: () =>
        QX.notify(
          "The only pod still sealed. Frost has grown across the glass from the inside, thick as a fingernail; the amber lamp says EMPTY — READY. " +
            'The plinth plate reads: "61 — RESERVED — FACILITY DIRECTOR." Somebody has scratched underneath it, very neatly: "Not yet."',
        ),
    });
    QX.interact({
      pos: QX.V3(O.x + SPOTS.intercom[0], 1.5, O.z + SPOTS.intercom[1]),
      radius: 0.5,
      label: "Intercom",
      verb: "Press",
      priority: 3,
      enabled: () => !QX.flag("c4_bulkhead") && QX.alive("qx_brandt"),
      onInteract: () => {
        QX.sfx("ui_click");
        QX.talk("qx_dlg_brandt", "qx_brandt");
      },
    });
    QX.interact({
      pos: QX.V3(O.x + SPOTS.marcus[0], 1.0, O.z + SPOTS.marcus[1]),
      radius: 0.8,
      label: "Marcus Abernathy",
      verb: "Examine",
      priority: 1,
      onInteract: () => V.marcus(),
    });
    QX.interact({
      pos: QX.V3(O.x + SPOTS.radio[0], 0.7, O.z + SPOTS.radio[1]),
      radius: 0.4,
      label: "Marcus's Radio",
      verb: "Turn Knob",
      priority: 2,
      onInteract: () => V.marcusRadio(),
    });
    QX.interact({
      pos: QX.V3(
        O.x + SPOTS.transmitter[0] - 0.4,
        1.6,
        O.z + SPOTS.transmitter[1],
      ),
      radius: 0.8,
      label: "Distress Beacon Transmitter",
      verb: "Examine",
      priority: 1,
      onInteract: () =>
        QX.notify(
          QX.flag("c4_beacon_off")
            ? "The reels have stopped. The VU needle lies on its pin. For the first time in twenty-two years, 91.7 is empty."
            : 'Two reels of tape turn, stop, rewind, turn. The splice has been re-taped so many times it is more tape than tape. A card on the rack: "RE-RECORDED — 11th TIME. KEEP DAY COUNT AT NINE."',
        ),
    });

    // terminals
    QX.terminalProp(
      "qx_term_c4_pumps",
      {
        x: O.x + SPOTS.pumpTerm[0] - 1.4,
        y: 0,
        z: O.z + SPOTS.pumpTerm[1] - 0.25,
      },
      Math.PI,
    );
    QX.terminalProp(
      "qx_term_c4_qm",
      { x: O.x + SPOTS.qmTerm[0] + 0.4, y: 0, z: O.z + SPOTS.qmTerm[1] },
      -Math.PI / 2,
    );
    QX.terminalProp(
      "qx_term_c4_director",
      { x: O.x + SPOTS.dirTerm[0], y: 0, z: O.z + SPOTS.dirTerm[1] - 0.2 },
      Math.PI,
    );

    // containers
    const mk = (id, name, lx, lz, yaw, kind, items, extra) => {
      if (!QX.live("containers") || !G.containers.create) return null;
      return QX.safe("ctr:" + id, () =>
        G.containers.create(
          Object.assign(
            {
              id,
              kind,
              name,
              pos: { x: O.x + lx, y: 0, z: O.z + lz },
              yaw,
              items: items.filter(
                (e) => e[0] === QX.SCRIP_ID || QX.itemExists(e[0]),
              ),
            },
            extra || {},
          ),
        ),
      );
    };
    for (const L of Object.values(LOCKS)) QX.registerLock(L);
    QX.keyFrom(
      "qx_c4_director_key",
      "Facility Director Brandt (Water Rising: every ending; carried if she dies)",
    );
    QX.world.c4Stash = mk(
      "qx_c4_stash",
      "Director's Footlocker",
      SPOTS.stash[0],
      SPOTS.stash[1],
      Math.PI,
      "footlocker",
      [
        ["qx_c4_cryo_suit", 1],
        [QX.SCRIP_ID, 160],
        ["rally_tonic", 3],
        ["prussian_blue", 2],
        ["pistol_10mm", 1],
        ["ammo_10mm", 48],
        ["focus_pills", 1],
        ["cigarettes", 2],
      ],
      { lock: LOCKS.footlocker },
    );
    QX.world.c4Armory = mk(
      "qx_c4_armory",
      "C-4 Security Cage",
      SPOTS.armory[0],
      SPOTS.armory[1],
      Math.PI,
      "locker",
      [
        ["assault_rifle", 1],
        ["ammo_556", 90],
        ["frag_grenade", 4],
        ["rally_tonic", 2],
        ["security_armor", 1],
        ["security_helmet", 1],
        ["morphine_syrette", 1],
      ],
      { lock: LOCKS.armory },
    );
    mk("qx_c4_locker1", "Crew Locker", -19.5, 25.4, 0, "locker", [
      ["purified_water", 2],
      ["golden_plain_jerky", 1],
      ["scrap_metal", 3],
    ]);
    mk("qx_c4_locker2", "Crew Locker", -16.9, 25.4, 0, "locker", [
      ["freedom_flakes", 1],
      ["old_world_book", 1],
      ["prussian_blue", 1],
      [QX.SCRIP_ID, 22],
    ]);
    mk(
      "qx_c4_qm",
      "Quartermaster's Cabinet",
      -11.4,
      26.2,
      -Math.PI / 2,
      "file_cabinet",
      [
        ["scrap_electronics", 3],
        ["duct_tape", 1],
        ["dry_cell", 1],
      ],
    );
  });

  // ------------------------------------------------------------------
  // Session content: pickups (roll, day-12 tape), actors
  // ------------------------------------------------------------------
  QX.hook("spawn", function () {
    if (!O) O = ORIGIN();
    if (!QX.has("qx_c4_roll"))
      QX.pickup("c4_roll", "qx_c4_roll", 1, {
        x: O.x + SPOTS.roll[0],
        y: 0.22,
        z: O.z + SPOTS.roll[1],
      });
    if (!QX.has("qx_reel_c4_day12"))
      QX.pickup("c4_day12", "qx_reel_c4_day12", 1, {
        x: O.x + SPOTS.reel[0],
        y: 0.84,
        z: O.z + SPOTS.reel[1],
      });
    V.spawnDirector();
    if (QX.flag("c4_entered")) V.spawnShellbacks();
    V.applyState();
  });
  V.spawnDirector = function () {
    const out = QX.flag("c4_outside");
    const H = QX.world.c4Hatch || QX.radioSpots.hatch;
    const pos = out
      ? QX.freeSpot(H.x + 3, H.z + 2, undefined, { maxR: 6 })
      : { x: O.x + SPOTS.director[0], y: 0, z: O.z + SPOTS.director[1] };
    // Twenty-two years underground: gaunt, pale, white-haired.
    QX.spawnNPC({
      id: "qx_brandt",
      type: "human",
      name: "Director Brandt",
      outfit: DIRECTOR_OUTFIT,
      gender: "f",
      hair: "bun",
      hairColor: 0xd8d6d0,
      skinTone: "pale",
      faction: "settlers",
      ai: out ? "wander" : "static",
      home: "here",
      homeR: out ? 4 : 0.5,
      level: 6,
      hp: 110,
      noRespawn: true,
      dialogue: "qx_dlg_brandt",
      weapon: "pistol_10mm",
      inventory: [["qx_c4_director_key", 1]],
      pos: { x: pos.x, y: pos.y || 0, z: pos.z },
      yaw: out ? 0 : -Math.PI / 2,
      barks: out
        ? [
            "They waved from over there. Every spring. I never saw them.",
            "The air tastes like pennies. I'd forgotten.",
            "Twenty-two years. I'm told that's a long time.",
          ]
        : [
            "...this message will repeat.",
            "Day nine. It's always day nine.",
            "Civil Defense, please respond.",
          ],
    });
  };
  V.spawnShellbacks = function () {
    if (QX.flag("c4_shells_spawned") && QX.flag("c4_shells_dead")) return;
    QX.setFlag("c4_shells_spawned");
    SPOTS.shells.forEach((s, i) => {
      if (QX.flag("dead_qx_c4_shell" + i)) return;
      if (i === 3 && !QX.flag("c4_pumps")) return; // the fourth lives in the pump room
      QX.spawnNPC({
        id: "qx_c4_shell" + i,
        type: SHELLBACK_TYPE,
        name: i === 1 ? "Shellback Snapper" : "Shellback",
        faction: "creatures",
        hostile: true,
        level: i === 1 ? 7 : 4,
        noRespawn: true,
        ai: "guard",
        home: { x: O.x + s[0], z: O.z + s[1], r: 6 },
        pos: { x: O.x + s[0], y: 0, z: O.z + s[1] },
        aggroRange: 16,
      });
    });
  };
  V.entered = function () {
    if (!QX.flag("c4_entered")) {
      QX.setFlag("c4_entered");
      V.spawnShellbacks();
      QX.later(1.2, () =>
        QX.notify(
          'Water to the knee, and cold. Somewhere ahead, over the dripping, a tape recorder clicks and a woman\'s voice says: "...this message will repeat."',
        ),
      );
    }
    if (QX.radioQuests) QX.radioQuests.enteredFacility();
  };
  V.applyState = function () {
    if (!V.root) return;
    if (QX.flag("c4_bulkhead")) V.openBulkhead(true);
    if (QX.flag("c4_pumps")) V.drain(true);
  };

  // ------------------------------------------------------------------
  // Actions
  // ------------------------------------------------------------------
  V.openBulkhead = function (silent) {
    QX.setFlag("c4_bulkhead");
    QX.unlock(LOCKS.office.id);
    if (V.bulkheadCol) {
      G.world.removeCollider(V.bulkheadCol);
      V.bulkheadCol = null;
    }
    if (V.bulkheadMesh) {
      V.bulkheadMesh.position.y = 3.95;
      V.bulkheadMesh.scale.y = 0.02;
    }
    if (!silent) QX.sfx("door_metal");
    if (QX.stage(QID) === "inside") QX.setStage(QID, "talk");
  };
  /** The office bulkhead: the Director's key, the keypad code (quartermaster teletype), or Brandt herself over the intercom. */
  V.tryBulkhead = function () {
    if (QX.flag("c4_bulkhead")) return;
    if (QX.has("qx_c4_director_key")) {
      V.openBulkhead();
      return;
    }
    if (!QX.locksLive()) {
      QX.notify(
        "The bulkhead is sealed from inside. There is an intercom beside it, and a keypad.",
      );
      return;
    }
    QX.openLock(LOCKS.office, () => V.openBulkhead(), {
      onCancel: () =>
        QX.notify(
          "The bulkhead is sealed from inside. There is an intercom beside it.",
        ),
    });
  };
  V.drain = function (silent) {
    QX.setFlag("c4_pumps");
    if (V.pumpDoorCol) {
      G.world.removeCollider(V.pumpDoorCol);
      V.pumpDoorCol = null;
    }
    if (V.pumpDoorMesh) V.pumpDoorMesh.visible = false;
    V.drainT = silent ? 0 : 6;
    if (silent) {
      if (V.deepWater) V.deepWater.position.y = 0.1;
      for (const w of V.water) if (w !== V.deepWater) w.position.y = 0.06;
    }
    if (!silent) {
      QX.sfx("hum_electric");
      QX.notify(
        "Somewhere below your feet, two pumps cough, choke, and catch. The water starts to go down.",
      );
      QX.xp(50, "Water Rising — pumps restarted");
      QX.later(7, () => {
        if (!QX.alive("qx_c4_shell3") && !QX.flag("dead_qx_c4_shell3"))
          V.spawnShellbacks();
      });
    }
    QX.refresh(QID);
  };
  V.marcus = function () {
    const first = !QX.flag("c4_marcus");
    QX.setFlag("c4_marcus");
    QX.notify(
      'A skeleton in a grey-white Long Winter cryo suit, orange collar ring gone pale, reclining in an armchair, facing the radio. A handwritten sign is propped on his knees: "DO NOT TURN OFF. WAITING FOR THE NEXT SHOW. — M.A."',
    );
    if (first) {
      QX.xp(25, "Water Rising — Marcus Abernathy");
      QX.refresh(QID);
    }
  };
  V.marcusRadio = function () {
    QX.notify(
      "The dial is set to 97.3. You turn the knob. Nothing: the batteries died a very long time ago. You turn it back to 97.3.",
    );
    if (QX.live("radio") && G.radio.tune && QX.once("c4_radio"))
      QX.safe("tune", () => {
        const st = G.radio.stations ? G.radio.stations() : [];
        if (st.some((s) => s.id === "rfm")) G.radio.tune("rfm");
      });
  };
  /** The four endings. */
  V.resolve = function (how) {
    if (QX.done(QID)) return;
    const rewardKey = () => {
      if (!QX.has("qx_c4_director_key")) QX.give("qx_c4_director_key", 1);
    };
    if (how === "truth" || how === "speech") {
      QX.setFlag("c4_beacon_off");
      if (QX.qlive() && G.quests.setFlag)
        QX.safe("qflag", () => G.quests.setFlag("qx_c4_beacon_off", true));
      rewardKey();
      if (how === "truth") QX.take("qx_c4_roll", 1);
      QX.standing(how === "truth" ? 100 : 50, "Told Director Brandt the truth");
      QX.xp(how === "truth" ? 300 : 200, "Water Rising");
      QX.setStage(QID, how === "truth" ? "done_truth" : "done_speech");
      QX.setFlag("c4_outside");
      QX.later(4, () => {
        if (
          !V.inside() ||
          QX.dist(O.x + SPOTS.director[0], O.z + SPOTS.director[1]) > 6
        )
          V.moveOutside();
        else QX.later(6, V.moveOutside);
      });
      QX.news(
        "Downtown, a Civil Defense distress signal that has been playing since the year the bombs fell went quiet last night. " +
          "Someone out there finally answered it. Rocky is choosing to find that beautiful.",
      );
    } else if (how === "lie") {
      QX.setFlag("c4_lied");
      rewardKey();
      QX.standing(-75, "Lied to Director Brandt");
      QX.giveScrip(100);
      QX.xp(150, "Water Rising");
      QX.setStage(QID, "done_lie");
    } else if (how === "dead") {
      QX.setStage(QID, "done_dead");
      QX.xp(100, "Water Rising");
    }
  };
  V.moveOutside = function () {
    const a = QX.npc("qx_brandt");
    if (!a || a.dead) return;
    QX.removeNPC("qx_brandt");
    QX.later(0.1, V.spawnDirector);
  };
  G.events.on("actorKilled", (a) => {
    if (!a) return;
    if (a.id === "qx_brandt") {
      if (!QX.started(QID)) QX.start(QID, { stage: "talk" });
      if (!QX.done(QID)) V.resolve("dead");
    }
    if (/^qx_c4_shell/.test(a.id || "")) {
      if (
        SPOTS.shells.every(
          (s, i) =>
            QX.flag("dead_qx_c4_shell" + i) ||
            (i === 3 && !QX.flag("c4_pumps")),
        )
      )
        QX.setFlag("c4_shells_dead");
    }
  });
  G.events.on("itemAdded", (id) => {
    if (id === "qx_c4_roll" && QX.stage(QID) === "roll") QX.refresh(QID);
  });

  // drain animation + "inside" detection for the stage (in case the door onEnter was skipped by a teleport)
  // Interior root drawn only while the player is inside the cell (perf rule), in every state
  // (goggles / dialogue / terminal screens still render the world behind them).
  const syncVis = () => {
    if (V.root) {
      const v = V.inside();
      if (V.root.visible !== v) V.root.visible = v;
    }
  };
  QX.hook("always", syncVis);
  G.events.on("teleport", () => QX.safe("c4vis", syncVis));
  QX.hook("update", function (dt) {
    if (!O || !V.root || !V.inside()) return;
    if (V.drainT > 0) {
      V.drainT -= dt;
      const f = Math.max(0, V.drainT / 6);
      if (V.deepWater) V.deepWater.position.y = 0.1 + 3.0 * f;
      for (const w of V.water)
        if (w !== V.deepWater)
          w.position.y =
            0.06 + (w.position.y > 0.06 ? (WATER_Y - 0.06) * f : 0);
    }
    if (V.inside() && QX.stage(QID) === "hatch")
      QX.radioQuests && QX.radioQuests.enteredFacility();
  });

  // ------------------------------------------------------------------
  // Terminals (amber teletypes on the Office of Civil Defense net)
  // ------------------------------------------------------------------
  const HDR =
    "OFFICE OF CIVIL DEFENSE — TELETYPE NET\nPROJECT LONG WINTER — CRYO UNIT C-4\n";
  QX.hook("register", function () {
    QX.terminal("qx_term_c4_pumps", {
      title: "C-4 — HYDRAULICS & DRAINAGE",
      header: HDR + "STATION 3 — PLANT ROOM",
      entries: [
        {
          title: "Pump Status",
          text: () =>
            QX.flag("c4_pumps")
              ? "PUMP 1: RUNNING (84%)\nPUMP 2: RUNNING (61%) — BEARING NOISE\nLOWER LEVEL: DRAINED\nSEAWALL SEEPAGE: 2.1 L/MIN (NOMINAL, SOMEHOW)"
              : "PUMP 1: OFFLINE — IMPELLER SEIZED\nPUMP 2: OFFLINE — NO POWER\nLOWER LEVEL: FLOODED (3.2 M)\nSEAWALL SEEPAGE: 2.1 L/MIN\n\nLAST MAINTENANCE: 03.03.1967\nNEXT SCHEDULED MAINTENANCE: 03.10.1967",
        },
        {
          title: "Maintenance Log",
          learn: LOCKS.armory.id,
          text:
            "DAY 3 — Breach at the seawall coupling. Pump 1 handling it. Barely.\nDAY 5 — Pump 2 fuse box shorted when the water reached it. Nobody is to touch the fuse box. NOBODY, CHO.\n" +
            'DAY 6 — Changed the security cage combination to 3-7-0-9 after somebody "borrowed" a rifle to shoot at a crab. You know who you are.\n' +
            "DAY 8 — Pump 1 impeller seized. Generator room flooded. Pod coolant failing — Director ordered the emergency thaw.\nDAY 9 — Pressure door hydraulics under water. Director is recording a message.\n" +
            "DAY 12 — Maintenance crew leaving with the others. Sorry, Director. Somebody pull the impeller pin and give it a whack. That usually does it.",
        },
        {
          title: () =>
            QX.flag("c4_pumps") ? "Pumps: Running" : "Restart Pumps",
          cond: () => true,
          action: () => {
            if (QX.flag("c4_pumps")) return "The pumps are already running.";
            if (QX.skill(SK_MECH) >= 40 || QX.skill(SK_ELEC) >= 60) {
              V.drain();
              return "> PUMP 1 IMPELLER: FREED (MANUAL OVERRIDE)\n> PUMP 2 FUSE: BYPASSED\n> STARTING...\n> STARTING...\n> RUNNING.\n\nDRAINAGE IN PROGRESS.";
            }
            return "ERROR: PUMP 1 IMPELLER SEIZED. MANUAL SERVICE REQUIRED.\n\n[Mechanics 40 or Electronics 60 needed to override.]";
          },
        },
      ],
    });
    QX.terminal("qx_term_c4_qm", {
      title: "C-4 — QUARTERMASTER",
      header: HDR + "QUARTERMASTER STATION",
      entries: [
        {
          title: "Population",
          text: "FAMILY-UNIT PILOT (WHOLE HOUSEHOLDS, VOLUNTEERED TOGETHER)\nSLEEPERS IN POD: 58\nWATCH CREW: 3\nTOTAL: 61\n\nDAY 8: EMERGENCY THAW, ALL PODS. 58 REVIVED. 0 LOST.\nON SITE: 2\nDEPARTED VIA FREIGHT HATCH (DAY 12): 59\n\n[Later entries, typed with one finger:]\nDECEASED: 1 (YEAR 3) — ABERNATHY, M. — NATURAL CAUSES. RADIO LEFT ON AT HIS REQUEST.\nON SITE: 1",
        },
        {
          title: "Rations",
          text: "DAY 12: 59 PERSONNEL ISSUED 14 DAYS EACH. RIFLES: 20. MAP OF LOWER MANHATTAN: 1 (LAMINATED).\nREMAINING: 2 PERSONS x 400 DAYS.\n\n[Later:] REMAINING: 1 PERSON. RATIONS EXHAUSTED YEAR 4. (SEE PUMP ROOM — CRAB POTS. DO NOT ASK.)",
        },
        {
          title: "Door Codes",
          learn: [LOCKS.office.id, "qx_c4_dir_term"],
          text: "DIRECTOR'S OFFICE BULKHEAD (KEYPAD): 0-3-0-5 (DAY ONE. LEST WE FORGET)\nDIRECTOR'S TELETYPE PASSCODE (RESET DAY 40): WATCHKEEPER\nSECURITY CAGE: SEE PLANT ROOM LOG (CHO CHANGED IT AGAIN)\n\nDO NOT LEAVE THIS LIST ON THE QUARTERMASTER TERMINAL. — J.B.\n[Below:] SORRY DIRECTOR — D.C.",
        },
        {
          title: "Note to Self",
          text: "If anyone reads this — I kept the transmitter on because that's the job. The job is: somebody stays awake. I was the Director. I stayed.\n\n— J.B.",
        },
      ],
    });
    QX.terminal("qx_term_c4_director", {
      title: "FACILITY DIRECTOR BRANDT — PERSONAL",
      header: HDR + "DIRECTOR'S STATION — RESTRICTED",
      lock: {
        id: "qx_c4_dir_term",
        passcode: "WATCHKEEPER",
        label: "C-4 Director's Teletype",
        hint: "The quartermaster teletype in the pod hall keeps the passcode list.",
      },
      entries: [
        {
          title: "O.C.D. Memorandum C-4/67-B",
          text:
            "OFFICE OF CIVIL DEFENSE — BUDGET & FACILITIES (DIRECTOR'S EYES ONLY)\n\nRE: CRYO UNIT C-4, BATTERY PARK. The contractor's drainage plan for C-4 is rated for a " +
            "ten-year flood at mean high water. The engineering review recommends a second pump train and a seawall coupling of the heavier pattern.\n\n" +
            "Remediation is deferred to fiscal 1968. Site is to remain in service. Director is not to be troubled with the review.\n\n" +
            "[Below, typed into the annotation field:] I WAS TROUBLED WITH IT ON DAY 40, WHEN THE COURIER POUCH FINALLY DRIED OUT. I STAYED ANYWAY. MAKE A NOTE OF THAT, GENTLEMEN.",
        },
        {
          title: "Beacon Control",
          text: () =>
            QX.flag("c4_beacon_off")
              ? "BEACON: OFF\nLOOP COUNT AT SHUTDOWN: 461,906"
              : "BEACON: TRANSMITTING (91.7 MHZ)\nLOOP COUNT: 461,9##\nTAPE CONDITION: POOR (RE-RECORDED 11x)",
        },
        {
          title: "Personal Log — Year 2",
          text: 'The water stopped at the knee. It has been at the knee for a year. I am told that\'s called a "water table". Marcus says it\'s called "Tuesday".',
        },
        {
          title: "Personal Log — Year 9",
          text: "My hair is white now, and what is left of it comes out in the comb. Nine winters without daylight. I eat shellback six days a week. I think I am supposed to be dead. I am not dead. I think it is spite. Marcus would have made a joke. I miss Marcus's jokes, which I never laughed at.",
        },
        {
          title: "Personal Log — Pod 61",
          text: "They kept a pod for me. Sixty-one. Standing orders: the Director goes under last, when the watch is relieved. The watch has not been relieved. I check the seal every Sunday. It is very cold and very ready. Not yet.",
        },
        {
          title: "Personal Log — Year ???",
          text: "Stopped counting years. Kept counting days. The message says day nine. It seemed less embarrassing than the truth.",
        },
      ],
    });
  });

  // ------------------------------------------------------------------
  // Dialogue — Facility Director Josephine Brandt
  // ------------------------------------------------------------------
  QX.hook("register", function () {
    const st = () => QX.stage(QID);
    const intercom = () => !QX.flag("c4_bulkhead");
    const D = "Director Brandt",
      DI = "Director Brandt (intercom)";
    QX.dialogue("qx_dlg_brandt", {
      start: () => {
        if (intercom())
          return QX.flag("c4_intercom") ? "intercom2" : "intercom";
        if (QX.done(QID))
          return QX.flag("c4_lied")
            ? "after_lie"
            : QX.flag("c4_outside")
              ? "after_out"
              : "after_lie";
        return QX.flag("met_brandt") ? "again" : "hello";
      },
      nodes: {
        intercom: {
          speaker: DI,
          onEnter: () => {
            QX.setFlag("c4_intercom");
            if (!QX.started(QID))
              QX.radioQuests && QX.radioQuests.startC4(true);
          },
          text: "[Static, then a voice — dry, precise, very tired.] This is Facility Director Brandt, Cryo Unit C-4. Identify yourself. ...Are you from Civil Defense?",
          responses: [
            {
              text: "I heard your distress call. I'm here to help.",
              next: "ic_help",
            },
            { text: "(Lie) Yes. Washington sent me.", next: "ic_vt" },
            { text: "[Say nothing]", end: true },
          ],
        },
        intercom2: {
          speaker: DI,
          text: "You again. The bulkhead is open if you want it to be. I've been talking to walls for a long time. It would be nice to talk to a face.",
          responses: [
            { text: "Open the door.", next: "ic_open" },
            { text: "Not yet.", end: true },
          ],
        },
        ic_help: {
          speaker: DI,
          text: "[A long pause.] Somebody heard. Somebody actually heard. ...Mind the sandbags. I'm opening the bulkhead. Please don't scream when you see me. The last visitor did. He was a shellback.",
          responses: [
            {
              text: "[Enter]",
              next: null,
              end: true,
              action: () => V.openBulkhead(),
            },
          ],
        },
        ic_vt: {
          speaker: DI,
          text: "[The breath catches.] Oh. Oh, thank God. Come in. Come in, please. I'll open the bulkhead. I have... I have a report ready. I've had it ready for a while.",
          responses: [
            {
              text: "[Enter]",
              end: true,
              action: () => {
                QX.setFlag("c4_said_ocd");
                V.openBulkhead();
              },
            },
          ],
        },
        ic_open: {
          speaker: DI,
          text: "Opening.",
          responses: [
            { text: "[Enter]", end: true, action: () => V.openBulkhead() },
          ],
        },

        hello: {
          speaker: D,
          onEnter: () => {
            QX.setFlag("met_brandt");
            if (st() === "inside") QX.setStage(QID, "talk");
          },
          text: () =>
            "[A gaunt, paper-pale woman stands up from a folding chair beside a humming transmitter. She wears a pressed Civil Defense tunic with a Director's bar, buttoned to the throat. Her hair is still pinned in a perfect bun. It is white, and there is not a great deal of it.] " +
            (QX.flag("c4_said_ocd")
              ? "Washington. You came. I knew — I told them you would. "
              : "A visitor. An actual visitor. ") +
            "Josephine Brandt, Facility Director, Cryo Unit C-4. I apologise for the water. And the smell. And the — [she gestures at herself] — this. I'm told it happened slowly. It didn't feel slow.",
          responses: [
            { text: "How long have you been down here?", next: "howlong" },
            { text: "What happened to this place?", next: "what" },
            { text: "Where is everyone?", next: "where" },
          ],
        },
        again: {
          speaker: D,
          text: () =>
            st() === "roll"
              ? "Did you find anything? About my people? I'll wait. I'm good at waiting."
              : "You came back. People don't, as a rule.",
          responses: [
            { text: "About your people...", next: "ask" },
            {
              text: "Tell me about Marcus Abernathy.",
              next: "marcus",
              cond: () => !QX.flag("c4_asked_marcus"),
            },
            {
              text: "What's the passcode for your teletype?",
              next: "pass",
              cond: () => !QX.flag("c4_asked_pass"),
            },
            {
              text: "Have you heard from any other Long Winter unit?",
              next: "c9",
              cond: () => !QX.flag("c4_heard_c9"),
            },
            { text: "I'll be back.", end: true },
          ],
        },
        pass: {
          speaker: D,
          learn: "qx_c4_dir_term",
          onEnter: () => {
            QX.setFlag("c4_asked_pass");
            QX.learnCode("qx_c4_dir_term", "Director Brandt");
          },
          text: "\"Watchkeeper.\" One word. It was a joke, when I chose it. Read whatever you like. There's nothing on it I haven't said to the walls.",
          responses: [{ text: "Thank you.", next: "again" }],
        },
        c9: {
          speaker: D,
          onEnter: () => {
            QX.setFlag("c4_heard_c9");
            QX.setQflag("brandt_heard_calloway");
          },
          text:
            "The transmitter keeps a listening watch on the Civil Defense band. In twenty-two years it has spoken twice. The second time was last month: C-9, under the Municipal Building. A Director Calloway. " +
            "She said one of her sleepers had thawed on a fault and gone up, and that she was going to the U.N. to find out who was reading names on the radio. She sounded like me, twenty years ago. " +
            "[A pause.] I wished her luck. I couldn't send it. The transmitter only goes one way.",
          responses: [
            { text: "Calloway was my Director.", next: "c9b" },
            { text: "Thank you.", next: "again" },
          ],
        },
        c9b: {
          speaker: D,
          text: "Then you know the type. [Almost a smile.] If you find her, tell her C-4 heard. Directors should hear that, once.",
          responses: [{ text: "I will.", next: "again" }],
        },
        howlong: {
          speaker: D,
          text: "The tape says day nine. The tape has said day nine for a very long time. I stopped counting years at some point. I kept counting days. [She nods at the wall. The tile is covered in tally marks.] Eight thousand and twelve.",
          responses: [
            { text: "That's twenty-two years.", next: "what" },
            { text: "Where is everyone?", next: "where" },
          ],
        },
        what: {
          speaker: D,
          text:
            "The bomb fell north of the island and the harbour came in to see what the noise was. The seawall coupling failed on day three. The pumps died on day eight, and the main generator with them, and fifty-eight people asleep in pods had about an hour of cold left. So I thawed them. All of them. Every lid. " +
            "C-4 was the family-unit pilot, you understand: whole households, children too, to see whether a family takes the cold. They took it. They took it better than the building did. " +
            "What you see lit runs off the beacon set's own little generator and a battery bank I ration like communion wine. " +
            "On day nine the pressure door went under and I recorded the message. On day twelve the thawed and my crew voted to go out the freight hatch and take their chances. Fifty-nine for. Two against.",
          responses: [{ text: "Who were the two?", next: "two" }],
        },
        two: {
          speaker: D,
          text: "Me, and Marcus Abernathy — a sleeper, a bus driver from Hoboken. I stayed because somebody had to be here when Civil Defense answered. Marcus stayed because he didn't want to miss the next radio show. He was joking. I think he was joking.",
          responses: [
            { text: "What happened to Marcus?", next: "marcus" },
            { text: "And the fifty-nine?", next: "where" },
          ],
        },
        marcus: {
          speaker: D,
          onEnter: () => {
            QX.setFlag("c4_asked_marcus");
            if (!QX.flag("c4_marcus")) {
              QX.setFlag("c4_marcus");
              QX.refresh(QID);
            }
          },
          text: "Year three. He fell asleep in his chair in front of that radio and he didn't wake up. Two weeks in a pod and he woke up fine; one nap in an armchair and that was that. I left the radio on. He made me promise. The batteries died in year five. I didn't have the heart to tell him. I still haven't.",
          responses: [{ text: "I'm sorry.", next: "where" }],
        },
        where: {
          speaker: D,
          onEnter: () => {
            if (st() === "talk" || st() === "inside") QX.setStage(QID, "roll");
          },
          text: "That's the question, isn't it. They went up the hatch with fourteen days of rations, twenty rifles and one laminated map. I never heard. Not once. The radio only goes one way. [She looks at you, and for a moment she looks every one of her twenty-two years down here.] Do you know? Did they make it?",
          responses: [{ text: "Let me tell you...", next: "ask" }],
        },
        ask: {
          speaker: D,
          text: "Tell me. Whatever it is. I've had a long time to get ready for it.",
          responses: [
            {
              text: "[Give her the Departure Roll] Read the back.",
              cond: () => QX.has("qx_c4_roll"),
              next: "truth",
            },
            {
              id: "c4_persuade",
              text: "Nobody is coming. Civil Defense is gone — it went the day the bombs fell. You did your job. You can stop now.",
              check: { skill: "persuasion", value: 60 },
              next: "speech",
              failNext: "speech_fail",
              cond: () => !QX.flag("c4_speech_failed"),
            },
            {
              text: "(Lie) Washington received your message. Help is on the way. Keep broadcasting.",
              next: "lie",
            },
            { text: "I don't know yet. I'll find out.", next: "notyet" },
          ],
        },
        notyet: {
          speaker: D,
          text: "They went out the freight hatch. If anything was ever left for me, it would be there — the bottom of the shaft. I don't go there. The shellbacks do. [A thin smile.] We have an arrangement. They don't come in, and I don't scream.",
          responses: [{ text: "I'll look.", end: true }],
        },
        truth: {
          speaker: D,
          onEnter: () => QX.setFlag("c4_read_roll"),
          text:
            '[She reads the names first. All of them, slowly, her lips moving. Then she turns it over. "Made it to the Ellis ferry slip, all 59. Took the long way round. We send the kids to the seawall every spring to wave at the hatch. She never comes up. Tell her we\'re alright. — L.B."] ' +
            "...Lorraine Baptiste. Pod twenty-six. She had four children in the pods beside her. She had four children and she came BACK here, to put this down the hatch, and I never... [She holds it against her chest.] All fifty-nine.",
          responses: [
            {
              text: "They made it, Director. You can stop broadcasting.",
              next: "truth2",
            },
          ],
        },
        truth2: {
          speaker: D,
          onEnter: () => V.resolve("truth"),
          text:
            "[She reaches over to the transmitter and, very carefully, as if it might break, flips a switch. The reels stop. The room is suddenly enormous with quiet.] " +
            "Day nine is over. ...Take the key. There's a footlocker behind you with my things in it, and a cryo suit that was never worn. Someone should wear it outside. As for me — I believe I'll go and stand on the seawall. It seems only polite to wave back.",
          responses: [{ text: "I'll see you up there, Director.", end: true }],
        },
        speech: {
          speaker: D,
          onEnter: () => V.resolve("speech"),
          text:
            "[For a long time she doesn't move. Then she laughs — a dry, rattling thing that turns into a cough.] Gone. Of course they're gone. I read the memorandum on day forty; I knew what this site was worth to them. I just — someone had to be the one who stayed awake. " +
            "[She switches the transmitter off.] Take the key. Everything I own is in that footlocker. I'm going to go and look at the sky. I'm told it's a strange colour now. I'd like to see it for myself.",
          responses: [{ text: "Goodbye, Director.", end: true }],
        },
        speech_fail: {
          speaker: D,
          onEnter: () => QX.setFlag("c4_speech_failed"),
          text: "[Her face closes like a pressure door.] You don't know that. You can't know that. I have a DUTY. [She turns back to the transmitter.] If you have something real — something from them — bring it. Otherwise, the bulkhead is where you left it.",
          responses: [{ text: "I'll find something.", end: true }],
        },
        lie: {
          speaker: D,
          onEnter: () => V.resolve("lie"),
          text:
            "[Her whole body loosens, as if a cable holding her upright has been cut.] Help. Help is coming. [She laughs, and wipes her eyes on a pressed sleeve.] I knew it. I KNEW it. I'll keep the beacon on so they can find us. " +
            "Here — the key to my stores. Take what you need for the road. Tell them — tell them C-4 held.",
          responses: [{ text: "I'll tell them.", end: true }],
        },
        after_out: {
          speaker: D,
          text: "Hello again. I've been practising waving. [She demonstrates. It is a very formal wave.] Lorraine's grandchildren came by. Eleven of them. I'm told that is normal for grandchildren. It seems excessive. It was wonderful.",
          responses: [
            { text: "You look well, Director.", next: "after_out2" },
            { text: "Take care.", end: true },
          ],
        },
        after_out2: {
          speaker: D,
          text: "I look like a boiled boot. But it's very kind of you to say. [A pause.] Thank you. For answering. Nobody else did.",
          responses: [{ text: "Goodbye.", end: true }],
        },
        after_lie: {
          speaker: D,
          text: "Any word from Washington? No? They'll be here soon. I've re-recorded the message so they know we're still waiting. Twelfth time. I changed it to day ten. It felt like progress.",
          responses: [{ text: "...Soon.", end: true }],
        },
      },
    });
  });
})();
