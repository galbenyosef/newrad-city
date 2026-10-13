// play-inline-100 01 — locks
// Lines 26-371 of readable/play-inline-100.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  const M = G.map._;
  const PI = Math.PI,
    HP = Math.PI / 2;

  // ===================================================================
  // Locks & keys (G.locks). Specs are registered at build time and again at initDone (register merges).
  // ===================================================================
  const LOCKS = new Map();
  /** Declare a lock: {id, label, key? | code? | passcode?, hint}. Returns the spec (used as door / container / terminal `lock`). */
  function lockSpec(spec) {
    LOCKS.set(spec.id, spec);
    return spec;
  }
  const locksLive = () => !!(G.locks && !G.isStub("locks"));
  function registerLocks() {
    if (!locksLive() || !G.locks.register) return;
    for (const sp of LOCKS.values()) {
      try {
        G.locks.register(sp);
      } catch (e) {
        G.reportError("map:lock " + sp.id, e);
      }
    }
    if (G.locks.obtainableFrom)
      for (const k of KEYS) {
        try {
          G.locks.obtainableFrom(k.id, k.where);
        } catch (e) {
          /* optional */
        }
      }
  }
  /** The player read / heard a code: log it (Goggles → NOTES → CODES). */
  function learnLock(ids, src) {
    if (!locksLive() || !G.locks.learn) return;
    for (const id of [].concat(ids)) {
      try {
        G.locks.learn(id, src);
      } catch (e) {
        /* optional */
      }
    }
  }
  function unlockLock(id) {
    try {
      if (locksLive() && G.locks.unlock) G.locks.unlock(id);
    } catch (e) {
      /* optional */
    }
  }
  // Physical keys: defined as items (type 'key') and placed as static pickups in their dungeon (K.notes with isKey).
  const KEYS = [
    {
      id: "map_key_chelsea_suitcase",
      name: "Small Suitcase Key",
      where: "The Chelsea Arms — tenant storage, with the Kowalskis",
      desc: 'A tiny brass key on a loop of string. A paper tag: "KOWALSKI — 1A".',
    },
    {
      id: "map_key_dmt_guard",
      name: "DMT Guard's Key Ring",
      where: "Dunmore Mutual Trust — banking hall, the guard by the tellers",
      desc: 'A guard\'s key ring. One key is stamped "SEC. LOCKER".',
    },
    {
      id: "map_key_dmt_chairman",
      name: "Chairman's Box Key",
      where: "Dunmore Mutual Trust — the strongroom, the Chairman's family",
      desc: 'A heavy gilt key engraved "R.D. III — BOX 001".',
    },
    {
      id: "map_key_pump_workshop",
      name: "Workshop Key (Pumping Station No. 4)",
      where: "Pumping Station No. 4 — the foreman's office",
      desc: 'A key on a cork float. Paper tag: "WORKSHOP — W.K."',
    },
  ];
  function defineKeys() {
    if (G.isStub("items") || !G.items.define) return;
    for (const k of KEYS) {
      try {
        if (!(G.items.get && G.items.get(k.id)))
          G.items.define({
            id: k.id,
            type: "key",
            name: k.name,
            desc: k.desc,
            weight: 0,
            value: 0,
            quest: false,
          });
      } catch (e) {
        G.reportError("map:key " + k.id, e);
      }
    }
  }
  /** Place a key pickup (static, persisted like the notes). */
  function placeKey(K, id, x, y, z) {
    K.notes.push({ id, x, y, z, isKey: true });
  }

  // Interior cell origins (the existing cells use x 4000 / 4400)
  const DUNGEONS = [
    {
      key: "dng_garment",
      name: "Kessler & Sons Garment Lofts",
      origin: { x: 4800, y: 0, z: 0 },
      target: [-85, -40],
      district: ["midtown_south"],
      faction: "raiders",
      level: 6,
      spawns: ["raider", "raider", "raider", "raider", "raider"],
      build: buildGarment,
      sign: "KESSLER & SONS",
      frame: "stone_limestone",
    },
    {
      key: "dng_chelsea",
      name: "The Chelsea Arms",
      origin: { x: 4800, y: 0, z: 400 },
      target: [-230, 120],
      district: ["midtown_south", "greenwich_village"],
      faction: "maniacs",
      level: 5,
      spawns: [
        "maniac",
        "maniac",
        "maniac",
        "maniac",
        "giant_roach",
        "maniac_bruiser",
      ],
      build: buildChelsea,
      sign: "CHELSEA ARMS",
      frame: "stone_brownstone",
    },
    {
      key: "dng_bank",
      name: "Dunmore Mutual Trust",
      origin: { x: 4800, y: 0, z: 800 },
      target: [70, 745],
      district: ["financial_district"],
      faction: "robots",
      level: 8,
      spawns: [
        "patrolman",
        "patrolman",
        "valet",
        "patrolman",
        "sky_eye",
        "bulwark",
      ],
      build: buildBank,
      sign: "DUNMORE MUTUAL TRUST",
      frame: "granite",
      lock: lockSpec({
        id: "map_dng_bank_door",
        label: "Dunmore Mutual Trust — staff door",
        code: "1931",
        hint: "The night-depository card taped by the door (the founding year on the cornerstone).",
      }),
      doorNote: {
        id: "dng_note_bank_door",
        name: "Night Depository Card",
        title: "DUNMORE MUTUAL TRUST — NIGHT DEPOSITORY",
        text: "NIGHT DEPOSITORY HOURS: 6 P.M. – 8 A.M.\nCustomers: use the brass slot. Do NOT knock.\n\n(typed below, for staff:)\nStaff door keypad: our founding year, as on the cornerstone — 1-9-3-1.\nRemove this card before opening. — G. Whitcomb, Branch Mgr.\n\n(in pencil, much later:)\nnobody removed it",
        learn: "map_dng_bank_door",
      },
    },
    {
      key: "dng_metro",
      name: "Fulton Street Station",
      origin: { x: 4800, y: 0, z: 1200 },
      target: [30, 690],
      district: ["financial_district"],
      faction: "brutes",
      level: 9,
      spawns: ["brute", "brute", "brute", "brute", "brute"],
      build: buildMetro,
      sign: "FULTON ST",
      frame: "granite",
      metro: true,
    },
    {
      key: "dng_market",
      name: "Big Apple Food Fair",
      origin: { x: 5200, y: 0, z: 0 },
      target: [560, 830],
      district: ["brooklyn"],
      faction: "raiders",
      level: 5,
      spawns: ["raider", "raider", "raider", "raider", "raider"],
      build: buildMarket,
      sign: "BIG APPLE FOOD FAIR",
      frame: "brick_tan",
    },
    {
      key: "dng_pump",
      name: "Pumping Station No. 4",
      origin: { x: 5200, y: 0, z: 400 },
      target: [700, 470],
      district: ["brooklyn"],
      faction: "creatures",
      level: 10,
      spawns: [
        "shellback",
        "shellback",
        "giant_roach",
        "shellback",
        "shellback",
        "shellback_matriarch",
      ],
      build: buildPump,
      sign: "PUMPING STATION No. 4",
      frame: "concrete",
    },
  ];
  M.DUNGEON_DEFS = DUNGEONS;

  // ===================================================================
  // Shared dressing helpers
  // ===================================================================
  /** Exit double door filling a gap on the outer wall at z = 0 (south wall, facing -z → inward normal -z). */
  function exitDoor(K, x, y, w, h, o) {
    o = o || {};
    const z = -0.02;
    const leafC = o.c || [0.35, 0.3, 0.25];
    for (const s of [-1, 1]) {
      const x0 = x + (s < 0 ? -w / 2 : 0),
        x1 = x + (s < 0 ? 0 : w / 2);
      M.quad(
        K.b(o.mat || "wood_planks"),
        [x1, y, z],
        [x0, y, z],
        [x0, y + h, z],
        [x1, y + h, z],
        [0, 0, -1],
        [0, 0, 1, 0, 1, 2, 0, 2],
        M.mulc(leafC, 0.8),
        leafC,
      );
      // glass lite / push bar
      if (o.glass !== false)
        M.quad(
          K.b("glass_dirty"),
          [x1 - 0.15, y + 1.2, z - 0.01],
          [x0 + 0.15, y + 1.2, z - 0.01],
          [x0 + 0.15, y + h - 0.25, z - 0.01],
          [x1 - 0.15, y + h - 0.25, z - 0.01],
          [0, 0, -1],
          [0, 0, 1, 0, 1, 1, 0, 1],
          [0.12, 0.13, 0.12],
        );
      K.beam(
        "chrome",
        x0 + 0.1,
        y + 1.0,
        z - 0.06,
        x1 - 0.1,
        y + 1.0,
        z - 0.06,
        0.04,
        0.04,
        { c: [0.6, 0.6, 0.55] },
      );
    }
    K.sign("EXIT", x, y + h + 0.35, -0.12, 0, -1, 0.9);
    K.light("red", x + w / 2 + 0.4, y + h + 0.2, -0.2, {
      nx: 0,
      nz: -1,
      floor: y,
    });
  }
  /** A closed apartment/office door painted on a wall (inner face). */
  function fakeDoor(K, x, y, z, nx, nz, o) {
    o = o || {};
    const T = M.DUNGEON_T / 2 + 0.012;
    const px = x + nx * T,
      pz = z + nz * T;
    K.plate(
      o.mat || "wood_planks",
      px,
      y + 1.1,
      pz,
      nx,
      nz,
      0.95,
      2.2,
      null,
      o.c || [0.42, 0.3, 0.22],
    );
    const rx = nz,
      rz = -nx;
    for (const s of [-1, 1])
      K.beam(
        "wood_planks",
        px + rx * s * 0.52 + nx * 0.02,
        y,
        pz + rz * s * 0.52 + nz * 0.02,
        px + rx * s * 0.52 + nx * 0.02,
        y + 2.28,
        pz + rz * s * 0.52 + nz * 0.02,
        0.07,
        0.05,
        { c: [0.35, 0.28, 0.2] },
      );
    K.beam(
      "wood_planks",
      px - rx * 0.56 + nx * 0.02,
      y + 2.3,
      pz - rz * 0.56 + nz * 0.02,
      px + rx * 0.56 + nx * 0.02,
      y + 2.3,
      pz + rz * 0.56 + nz * 0.02,
      0.08,
      0.06,
      { c: [0.35, 0.28, 0.2] },
    );
    K.cyl(
      "chrome",
      px + rx * 0.36 + nx * 0.04,
      y + 1.0,
      pz + rz * 0.36 + nz * 0.04,
      0.035,
      0.035,
      0.05,
      6,
      { c: [0.7, 0.62, 0.4] },
    );
    if (o.label)
      K.plate(
        "my/dngsigns",
        px + nx * 0.01,
        y + 1.75,
        pz + nz * 0.01,
        nx,
        nz,
        0.4,
        0.1,
        M.cellUV(Math.max(0, M.DSIGNS.indexOf(o.label)), 2, 16),
      );
  }
  /** Boarded window on an outer wall (light slits leak through). */
