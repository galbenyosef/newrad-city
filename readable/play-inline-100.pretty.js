/* src/map/56_dungeons_interior.js */
/* =====================================================================
 * NEW RAD CITY — MAP MODULE · 56 DUNGEONS — INTERIOR
 * Six multi-room "clear the building" interiors built with the dungeon kit
 * (55_dungeon_kit_interior.js), each in its own interior cell at x ≥ 4800:
 *   dng_garment  Kessler & Sons Garment Lofts (Garment District) — raiders
 *   dng_chelsea  The Chelsea Arms (Chelsea) — Maniacs + a Maniac Bruiser
 *   dng_bank     Dunmore Mutual Trust (Financial District) — security robots
 *   dng_metro    Fulton Street Station (Financial District) — Brutes
 *   dng_market   Big Apple Food Fair (Brooklyn) — raiders in a supermarket
 *   dng_pump     Pumping Station No. 4 (Brooklyn waterfront) — Shellbacks
 * Each has 6–10 rooms (office floors, stairwells, a collapsed-ceiling room,
 * restrooms, a manager's office with a wall safe, maintenance tunnels …),
 * a boss room, 9–15 containers, a terminal, a skeleton tableau and a note
 * that tells a small story. The street door sits on a generic building in
 * the right district (picked & built by 56_dungeons.js; the door links
 * street <-> cell are made here). Two LOCATIONS entries per dungeon: an
 * outdoor marker (goggles map / discovery / "Cleared") and an interior
 * entry (combat populates it from the map's spawn1..6 anchors).
 * Locks (G.locks, keys & codes): every locked door, container and terminal
 * declares a lock spec via lockSpec(); its key lies in the same dungeon as
 * a static pickup (KEYS, map_key_*) or its code / passcode is written in a
 * note or terminal entry of the same dungeon (learn: lock id).
 * ===================================================================== */
(function () {
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
  function boardedWindow(K, x, y, z, nx, nz, w, h) {
    const T = M.DUNGEON_T / 2 + 0.01;
    const px = x + nx * T,
      pz = z + nz * T;
    K.plate("glass_dirty", px, y, pz, nx, nz, w, h, null, [0.2, 0.2, 0.18]);
    const rx = nz,
      rz = -nx;
    for (let i = 0; i < 4; i++) {
      const yy = y - h / 2 + 0.2 + (i * (h - 0.3)) / 3 + K.r.range(-0.05, 0.05);
      K.obox(
        "wood_planks",
        px + nx * 0.04,
        yy,
        pz + nz * 0.04,
        Math.abs(rx) * (w + 0.3) + Math.abs(nx) * 0.03,
        0.18,
        Math.abs(rz) * (w + 0.3) + Math.abs(nz) * 0.03,
        0,
        {
          roll: Math.abs(nz) > 0 ? K.r.range(-0.08, 0.08) : 0,
          pitch: Math.abs(nx) > 0 ? K.r.range(-0.08, 0.08) : 0,
          c: [0.55, 0.46, 0.34],
          s: 1,
        },
      );
    }
    // daylight slits: faint additive glow planes in front of the gaps
    const uv = M.lightUV(0);
    M.quad(
      K.b("my/lightfx"),
      [px - (rx * w) / 2 + nx * 0.06, y - h / 2, pz - (rz * w) / 2 + nz * 0.06],
      [px + (rx * w) / 2 + nx * 0.06, y - h / 2, pz + (rz * w) / 2 + nz * 0.06],
      [
        px + (rx * w) / 2 + nx * 1.6,
        y - h / 2 - 1.6,
        pz + (rz * w) / 2 + nz * 1.6,
      ],
      [
        px - (rx * w) / 2 + nx * 1.6,
        y - h / 2 - 1.6,
        pz - (rz * w) / 2 + nz * 1.6,
      ],
      [0, 1, 0],
      [uv[0], uv[3], uv[2], uv[3], uv[2], uv[1], uv[0], uv[1]],
      [0.05, 0.05, 0.04],
    );
  }
  /** Cast-iron loft column. */
  function column(K, x, y, z, h, o) {
    o = o || {};
    K.cyl(o.mat || "metal_painted", x, y, z, 0.16, 0.14, h, 8, {
      c: o.c || [0.3, 0.33, 0.3],
    });
    K.cyl(o.mat || "metal_painted", x, y, z, 0.24, 0.24, 0.3, 8, {
      c: o.c || [0.3, 0.33, 0.3],
      capTop: true,
    });
    K.cyl(o.mat || "metal_painted", x, y + h - 0.35, z, 0.16, 0.3, 0.35, 8, {
      c: o.c || [0.3, 0.33, 0.3],
    });
    K.col(x - 0.2, y, z - 0.2, x + 0.2, y + h, z + 0.2, {
      tag: "column",
      surface: "metal",
    });
  }
  /** Mail slots panel on a wall. */
  function mailboxes(K, x, y, z, nx, nz, cols, rows) {
    const rx = nz,
      rz = -nx,
      T = M.DUNGEON_T / 2;
    const W = cols * 0.28,
      H = rows * 0.34;
    K.plate(
      "bronze",
      x + nx * (T + 0.02),
      y + H / 2,
      z + nz * (T + 0.02),
      nx,
      nz,
      W + 0.1,
      H + 0.1,
      null,
      [0.6, 0.48, 0.3],
    );
    for (let i = 0; i < cols; i++)
      for (let j = 0; j < rows; j++) {
        const cx = x + rx * (-W / 2 + 0.14 + i * 0.28),
          cz = z + rz * (-W / 2 + 0.14 + i * 0.28);
        const open = K.r() < 0.25;
        K.plate(
          open ? "glass_dirty" : "metal_panel",
          cx + nx * (T + 0.035),
          y + 0.17 + j * 0.34,
          cz + nz * (T + 0.035),
          nx,
          nz,
          0.24,
          0.3,
          null,
          open ? [0.05, 0.05, 0.05] : [0.55, 0.45, 0.3],
        );
      }
  }
  /** Radiator under a window. */
  function radiator(K, x, y, z, yaw) {
    for (let i = 0; i < 8; i++) {
      const [px, pz] = K.rot(x, z, yaw, -0.5 + i * 0.14, 0);
      K.obox("metal_painted", px, y + 0.4, pz, 0.08, 0.7, 0.18, yaw, {
        c: [0.5, 0.48, 0.42],
        s: 1,
      });
    }
    K.ocol(x, z, 1.2, 0.2, y, y + 0.8, yaw, {
      tag: "furniture",
      surface: "metal",
    });
  }
  /** Kitchenette along a wall: counter, sink, stove; the fridge is a props container. */
  function kitchenette(K, x0, x1, wallZ, dir, y) {
    const z0 = Math.min(wallZ, wallZ + dir * 0.62),
      z1 = Math.max(wallZ, wallZ + dir * 0.62);
    K.counter(x0, z0, x1 - 0.9, z1, y, {
      h: 0.92,
      top: "tile_floor",
      topC: [0.75, 0.74, 0.68],
      c: [0.55, 0.62, 0.55],
      mat: "metal_painted",
    });
    K.box(
      "metal_panel",
      x0 + 0.5,
      y + 0.8,
      z0 + 0.1,
      x0 + 1.0,
      y + 0.93,
      z1 - 0.1,
      [0.6, 0.6, 0.58],
      0.5,
    );
    K.box(
      "metal_painted",
      x1 - 0.85,
      y,
      z0,
      x1 - 0.1,
      y + 0.92,
      z1,
      [0.72, 0.7, 0.62],
      1,
    );
    for (const dx of [-0.6, -0.35])
      for (const dz of [0.2, 0.42])
        K.cyl(
          "metal_painted",
          x1 + dx,
          y + 0.92,
          z0 + (dir > 0 ? dz : 0.62 - dz),
          0.09,
          0.09,
          0.02,
          8,
          { c: [0.15, 0.15, 0.15] },
        );
    K.col(x1 - 0.85, y, z0, x1 - 0.1, y + 0.92, z1, {
      tag: "furniture",
      surface: "metal",
    });
    // cupboards above
    K.box(
      "wood_planks",
      x0,
      y + 1.5,
      dir > 0 ? wallZ : wallZ - 0.35,
      x1 - 0.9,
      y + 2.2,
      dir > 0 ? wallZ + 0.35 : wallZ,
      [0.55, 0.5, 0.4],
      1,
    );
  }
  /** Apartment room with living area, bed & kitchenette (room rect r; entry side given). */
  function apartment(K, R, o) {
    o = o || {};
    const y = R.y,
      r = K.r;
    const cx = (R.x0 + R.x1) / 2,
      cz = (R.z0 + R.z1) / 2;
    const west = o.bedSide === "w";
    const bx = west ? R.x0 + 1.2 : R.x1 - 1.2;
    K.bed(bx, y, R.z0 + 1.4, 0, { double: r() < 0.6 });
    K.table(cx, y, cz + 0.5, r() * 0.3, 1.2, 0.8, { c: [0.45, 0.35, 0.25] });
    K.chair(cx - 0.8, y, cz + 0.5, HP, {
      c: [0.4, 0.3, 0.2],
      knocked: r() < 0.4,
    });
    K.sofa(west ? R.x1 - 1.6 : R.x0 + 1.6, y, R.z1 - 1.1, 0, {});
    kitchenette(
      K,
      west ? R.x1 - 3.8 : R.x0 + 0.3,
      west ? R.x1 - 0.3 : R.x0 + 3.8,
      R.z0 + M.DUNGEON_T / 2,
      1,
      y,
    );
    // TV set, rug, pictures
    const tvx = west ? R.x1 - 1.6 : R.x0 + 1.6;
    K.box(
      "wood_planks",
      tvx - 0.45,
      y,
      R.z1 - 3.2,
      tvx + 0.45,
      y + 0.75,
      R.z1 - 2.6,
      [0.5, 0.35, 0.22],
      1,
    );
    K.box(
      "glass_dirty",
      tvx - 0.3,
      y + 0.25,
      R.z1 - 2.6,
      tvx + 0.3,
      y + 0.62,
      R.z1 - 2.58,
      [0.1, 0.12, 0.1],
      1,
    );
    K.col(tvx - 0.45, y, R.z1 - 3.2, tvx + 0.45, y + 0.75, R.z1 - 2.6, {
      tag: "furniture",
      surface: "wood",
    });
    K.box(
      "fabric",
      cx - 1.3,
      y + 0.005,
      cz - 0.6,
      cx + 1.3,
      y + 0.02,
      cz + 1.6,
      r.pick([
        [0.45, 0.2, 0.15],
        [0.25, 0.3, 0.4],
        [0.5, 0.42, 0.3],
      ]),
      0.5,
      8,
    );
    K.litter(R.x0, R.z0, R.x1, R.z1, y, 10);
    K.light(r() < 0.5 ? "bulb" : "dead", cx, y + R.h, cz, { floor: y });
    // the fridge is a container (props)
    K.loot("fridge", west ? R.x1 - 4.4 : R.x0 + 4.4, y, R.z0 + 0.55, PI, {
      loot: "fridge",
    });
  }
  /** Office cubicle grid in a rect (rows along x). */
  function cubicles(K, x0, z0, x1, z1, y, o) {
    o = o || {};
    const r = K.r;
    const cw = 2.6,
      cd = 2.6;
    for (let x = x0; x + cw <= x1 + 0.01; x += cw)
      for (let z = z0; z + cd * 2 <= z1 + 0.01; z += cd * 2 + 1.6) {
        // a back-to-back pair of cubicles
        if (r() < 0.12) {
          K.rubbleMound(x + cw / 2, y, z + cd, 1.4, 0.5);
          continue;
        }
        K.partition(x, z + cd, x + cw, z + cd, y, 1.45);
        K.partition(x, z, x, z + cd * 2, y, 1.45);
        if (x + cw * 2 > x1 + 0.01)
          K.partition(x + cw, z, x + cw, z + cd * 2, y, 1.45);
        for (const [dz, yaw] of [
          [0.5, 0],
          [cd * 2 - 0.5, PI],
        ]) {
          const top = K.desk(x + cw / 2, y, z + dz, yaw, {
            w: 1.6,
            d: 0.7,
            monitor: r() < 0.7 ? "right" : false,
          });
          void top;
          K.chair(
            x + cw / 2 + r.range(-0.3, 0.3),
            y,
            z + dz + (yaw === 0 ? 0.9 : -0.9),
            yaw + r.range(-0.6, 0.6),
            { knocked: r() < 0.25 },
          );
        }
      }
  }

  // ===================================================================
  // 1. Kessler & Sons Garment Lofts — raiders
  // ===================================================================
  function buildGarment(K) {
    const r = K.r;
    // ---- rooms ----
    const lobby = K.room({
      x0: -6,
      z0: -10,
      x1: 6,
      z1: 0,
      h: 4.2,
      floor: "terrazzo",
      wall: "plaster_stained",
      wain: "marble_dark",
      wainH: 1.2,
      wainC: [0.45, 0.42, 0.38],
      ceil: "plaster_stained",
      wc: [0.72, 0.66, 0.56],
      fc: [0.66, 0.62, 0.55],
      cc: [0.5, 0.48, 0.44],
    });
    const hall = K.room({
      x0: -1.5,
      z0: -30,
      x1: 1.5,
      z1: -10,
      h: 3.4,
      floor: "tile_floor",
      wall: "plaster_stained",
      wain: "wood_planks",
      wainC: [0.45, 0.36, 0.26],
      wc: [0.62, 0.66, 0.58],
      fc: [0.6, 0.58, 0.52],
    });
    const sew = K.room({
      x0: -26,
      z0: -34,
      x1: -1.5,
      z1: -12,
      h: 4.6,
      floor: "wood_planks",
      wall: "brick_red",
      ceil: "concrete",
      wc: [0.8, 0.72, 0.66],
      fc: [0.62, 0.52, 0.42],
      surface: "wood",
    });
    const cut = K.room({
      x0: 1.5,
      z0: -30,
      x1: 20,
      z1: -14,
      h: 4.2,
      floor: "wood_planks",
      wall: "brick_red",
      wc: [0.72, 0.64, 0.6],
      fc: [0.58, 0.5, 0.42],
      surface: "wood",
      hole: { x0: 8, z0: -25, x1: 14, z1: -19 },
    });
    const wc = K.room({
      x0: 6,
      z0: -10,
      x1: 14,
      z1: -2,
      h: 3.2,
      floor: "tile_floor",
      wall: "tile_subway",
      wc: [0.78, 0.8, 0.76],
      fc: [0.75, 0.75, 0.72],
    });
    const stair = K.room({
      x0: -1.5,
      z0: -40,
      x1: 4,
      z1: -30,
      h: 8.0,
      floor: "concrete",
      wall: "concrete",
      wc: [0.55, 0.62, 0.56],
      fc: [0.55, 0.55, 0.52],
    });
    const pattern = K.room({
      x0: 4,
      z0: -46,
      x1: 16,
      z1: -30,
      y: 4.2,
      h: 3.8,
      floor: "wood_planks",
      wall: "brick_red",
      wc: [0.7, 0.6, 0.55],
      fc: [0.55, 0.46, 0.38],
      surface: "wood",
    });
    const office = K.room({
      x0: 16,
      z0: -42,
      x1: 24,
      z1: -32,
      y: 4.2,
      h: 3.2,
      floor: "carpet",
      wall: "wallpaper",
      wain: "wood_planks",
      wainC: [0.42, 0.3, 0.2],
      wc: [0.62, 0.55, 0.45],
      fc: [0.45, 0.25, 0.2],
      surface: "carpet",
    });
    // ---- doors ----
    K.door(0, 0, 1.8, 0, 2.6, { exit: true });
    K.door(0, -10, 1.6, 0, 2.5);
    K.door(-1.5, -20, 1.8, 0, 2.5);
    K.door(1.5, -22, 1.6, 0, 2.4);
    K.door(6, -6, 1.2, 0, 2.2);
    K.door(0, -30, 1.4, 0, 2.3);
    K.door(4, -36, 1.4, 4.2, 2.3);
    K.door(16, -37, 1.2, 4.2, 2.2);
    K.build();
    exitDoor(K, 0, 0, 1.8, 2.6, { c: [0.3, 0.25, 0.2] });

    // ---- lobby: reception, mail slots, freight elevator, raider camp ----
    K.counter(-4.5, -7.2, -1.2, -6.4, 0, {
      c: [0.35, 0.28, 0.22],
      top: "marble",
      topC: [0.6, 0.58, 0.52],
    });
    K.sign("KESSLER & SONS", 0, 3.3, -9.85, 0, 1, 3.2);
    mailboxes(K, -6, 0.9, -4, 1, 0, 6, 3);
    // freight elevator doors (east wall) with a hand-painted OUT OF ORDER scrawl
    K.plate(
      "metal_panel",
      6 - M.DUNGEON_T / 2 - 0.012,
      1.3,
      -8.2 + 0,
      -1,
      0,
      2.2,
      2.6,
      null,
      [0.42, 0.44, 0.4],
    );
    K.beam("metal_painted", 5.88, 2.7, -9.4, 5.88, 2.7, -7.0, 0.1, 0.12, {
      c: [0.3, 0.3, 0.28],
    });
    K.scrawl(5.9, 1.5, -8.2, -1, 0, 1.6);
    K.sofa(3.5, 0, -1.3, PI, { c: [0.35, 0.3, 0.22] });
    K.cyl("terrazzo", -5.2, 0, -1, 0.3, 0.35, 0.6, 8, {
      c: [0.5, 0.45, 0.4],
      capTop: true,
    });
    K.pipe("wood_rotten", -5.2, 0.6, -1, -5.1, 1.6, -1.1, 0.03, 4, {
      c: [0.35, 0.28, 0.2],
    });
    // raider camp: mattresses, burning barrel, crates
    K.barrel(-3.5, 0, -4.2, { fire: true });
    K.box("fabric", -5.6, 0, -3.2, -3.9, 0.22, -1.2, [0.45, 0.4, 0.3], 0.5);
    K.crate(3.8, 0, -8.8, 0.3, 0.9);
    K.crate(4.7, 0, -8.6, -0.2, 0.7);
    K.litter(-6, -10, 6, 0, 0, 16);
    K.light("bulb", -3, 4.2, -5, { floor: 0, real: true });
    K.light("dead", 3, 4.2, -5, {});
    K.loot("first_aid", -5.85, 1.2, -7.6, -HP, { loot: "first_aid" });
    K.loot("footlocker", -4.8, 0, -2.6, 0, { loot: "raider_stash" });

    // ---- corridor ----
    K.pipeRun(
      [
        [1.3, 3.2, -10],
        [1.3, 3.2, -30],
      ],
      0.06,
      { c: [0.5, 0.4, 0.3] },
    );
    K.pipeRun(
      [
        [1.1, 3.25, -10],
        [1.1, 3.25, -30],
      ],
      0.04,
      { mat: "metal_painted", c: [0.4, 0.42, 0.4] },
    );
    fakeDoor(K, -1.5, 0, -14, 1, 0, { label: "EMPLOYEES ONLY" });
    fakeDoor(K, 1.5, 0, -27, -1, 0, {});
    K.sign("SEWING FLOOR 2", -1.35, 2.75, -20, 1, 0, 1.4);
    K.sign("CUTTING ROOM", 1.35, 2.75, -22, -1, 0, 1.4);
    K.light("tube", 0, 3.4, -14, { floor: 0, alongX: false });
    K.light("tube", 0, 3.4, -21, { floor: 0, alongX: false, flicker: true });
    K.light("dead", 0, 3.4, -27, { alongX: false });
    K.litter(-1.5, -30, 1.5, -10, 0, 8, { tiles: false });
    K.decal(0.2, 0.013, -17, 1.4, 3.2, 0.1, M.MARK.BLOOD);

    // ---- sewing floor: rows of machines, the last shift ----
    for (let x = -22; x <= -6; x += 4)
      for (let z = -30; z <= -15; z += 5)
        if (!(x === -6 && z === -20))
          column(K, x, 0, z, 4.6, { c: [0.28, 0.3, 0.28] });
    for (let z = -32; z <= -12; z += 4)
      K.beam("rust", -26, 4.4, z, -1.5, 4.4, z, 0.25, 0.35, {
        c: [0.45, 0.38, 0.32],
      });
    const rows = [-27.5, -22.5, -17.5];
    for (const z of rows)
      for (const x of [-19, -9.5]) K.sewingTable(x, 0, z, 0, 4);
    K.garmentRack(-24.2, 0, -14, HP, 3);
    K.garmentRack(-24.2, 0, -19, HP, 3);
    for (const [x, z, f] of [
      [-4, -14, false],
      [-5, -15.2, false],
      [-3.8, -32, true],
      [-24, -32, false],
      [-22.8, -32.6, false],
    ])
      K.dressForm(x, 0, z, r() * 6, f);
    K.fabricBolts(-14, 0, -32.8, 0, 6);
    for (const z of [-15, -24, -31])
      boardedWindow(K, -26, 2.4, z, 1, 0, 2.2, 2.4);
    for (let x = -22; x <= -5; x += 5.5)
      for (const z of [-26, -18])
        K.light(r() < 0.25 ? "dead" : "tubes2", x, 4.6, z, {
          floor: 0,
          drop: 0.8,
          flicker: r() < 0.3,
        });
    K.litter(-26, -34, -1.5, -12, 0, 30, {
      cells: [
        M.MARK.LITTER,
        M.MARK.DIRT,
        M.MARK.STAIN,
        M.MARK.GRIME,
        M.MARK.CRACKS,
      ],
    });
    // tableau: three seamstresses still at their machines, the floor lady on the floor by the locked door
    K.skel(-20.1, 0, -28.25, PI, "seated");
    K.skel(-17.9, 0, -23.25, PI, "seated");
    K.skel(-8.4, 0, -18.25, PI, "seated");
    K.skel(-3.1, 0, -20.6, -HP, "reaching");
    K.note("dng_note_kessler_timecard", -8.7, 0.8, -17.7, {
      name: "Timecard — R. Levy",
      title: "KESSLER & SONS — TIMECARD No. 2211 (reverse)",
      text: "Mar 5 1967.\n\nMr. Kessler says the sirens are a drill. He says the Army wants 4,000 field jackets by Tuesday, Sunday or no Sunday, and nobody punches out until the quota is met. Sal went to the door and it was LOCKED. From the outside.\n\nThe radio says it is not a drill.\n\nThe girls are still sewing. I think they do not know what else to do with their hands. I am writing this on my card so that when they punch it someone knows Rosa Levy worked 14 hours today and did not get paid for any of them.\n\nTell my brother Sam in the Bronx.",
    });
    K.loot("locker", -25.5, 0, -12.9, -HP, { loot: "locker" });
    K.loot("toolbox", -12.2, 0.8, -27.1, 0, { loot: "toolbox" });
    K.loot("file_cabinet", -2.2, 0, -32.8, PI, { loot: "file_cabinet" });
    K.anchor("spawn1", -14, 0, -20);
    K.anchor("spawn2", -20, 0, -31);

    // ---- cutting room (collapsed ceiling) ----
    K.table(5.5, 0, -17.5, 0, 6, 1.6, { c: [0.5, 0.42, 0.32] });
    K.table(16, 0, -27, 0, 5, 1.6, { c: [0.5, 0.42, 0.32], tip: 0.2 });
    K.fabricBolts(18.4, 0, -18, HP, 5);
    K.pipe("chrome", 4.2, 0.79, -17.2, 4.8, 0.79, -17.6, 0.02, 4, {
      c: [0.6, 0.6, 0.58],
    });
    for (const z of [-17, -26]) boardedWindow(K, 20, 2.3, z, -1, 0, 2, 2.2);
    K.light("dead", 5, 4.2, -26, { alongX: true });
    K.light("tube", 16, 4.2, -17, { floor: 0, flicker: true });
    K.light("bulb", 4, 4.2, -21, { floor: 0 });
    K.litter(1.5, -30, 20, -14, 0, 20);
    K.loot("ammo_box", 11.2, 0.9, -22.5, 0.3, { loot: "ammo_box" });
    K.loot("crate", 18.8, 0, -28.9, 0, { loot: "crate", kind: "army" });
    K.anchor("spawn3", 13, 0, -16.5);

    // ---- restroom ----
    K.stalls(7.6, 13.8, -10, 1, 0, 3);
    K.sinks(8, 13, -2, -1, 0);
    K.light("tube", 10, 3.2, -6, { floor: 0, flicker: true });
    K.litter(6, -10, 14, -2, 0, 6, {
      cells: [M.MARK.STAIN, M.MARK.PUDDLE, M.MARK.GRIME],
    });
    K.loot("first_aid", 13.85, 1.3, -6, HP, { loot: "medical_cabinet" });
    K.skel(12.2, 0, -9.0, PI, "curled");

    // ---- stairwell: flight up the west half, landing, gallery over the east half ----
    K.stairs(-1.4, 1.1, -31.4, -38.4, 0, 4.2, "z", { rail: "hi" });
    K.landing(-1.5, -40, 4, -38.4, 4.2, {});
    K.landing(1.1, -38.4, 4, -33.2, 4.2, {
      support: true,
      rails: [
        [1.1, -38.4, 1.1, -33.2],
        [1.1, -33.2, 4, -33.2],
      ],
    });
    K.light("cage", -1.3, 2.6, -35, { nx: 1, nz: 0, floor: 0 });
    K.light("cage", 3.8, 6.8, -39, { nx: -1, nz: 0, floor: 4.2 });
    K.scrawl(3.85, 5.8, -35.5, -1, 0, 1.6);
    K.sign("FOREMAN", 3.83, 6.9, -36, -1, 0, 1.2);

    // ---- pattern room (upper floor): raider den ----
    K.table(9, 4.2, -42, 0, 4, 1.4, { c: [0.52, 0.45, 0.35] });
    K.table(9, 4.2, -35, 0.1, 4, 1.4, { c: [0.52, 0.45, 0.35], tip: 0.12 });
    K.box(
      "fabric",
      13.2,
      4.2,
      -45.6,
      15.6,
      4.44,
      -43.5,
      [0.45, 0.38, 0.3],
      0.5,
    );
    K.box(
      "fabric",
      13.2,
      4.2,
      -42.8,
      15.6,
      4.44,
      -40.8,
      [0.4, 0.35, 0.28],
      0.5,
    );
    K.barrel(12.6, 4.2, -38, { fire: true });
    K.cage(6, 4.2, -44, 1.6);
    K.skel(6, 4.2, -44, 0.6, "curled");
    K.shelf(15.6, 4.2, -34, HP, 3, "parts", { h: 1.8 });
    K.scrawl(4.2, 6.0, -42, 1, 0, 2.2);
    K.scrawl(15.8, 6.2, -38, -1, 0, 2.0);
    K.light("bulb", 8, 8.0, -38, { floor: 4.2, real: true });
    K.light("dead", 12, 8.0, -44, {});
    K.litter(4, -46, 16, -30, 4.2, 14, {
      cells: [M.MARK.LITTER, M.MARK.BLOOD, M.MARK.DIRT, M.MARK.STAIN],
    });
    K.loot("footlocker", 14.3, 4.2, -40.2, PI, { loot: "raider_stash" });
    K.loot("ammo_box", 5.2, 4.2, -31, 0, { loot: "ammo_box", large: true });
    K.anchor("spawn4", 9, 4.2, -38.6);
    K.anchor("spawn5", 13, 4.2, -33);
    K.note("dng_note_needles_rules", 12.1, 4.99, -35.1, {
      name: "Needles' House Rules",
      title: "RULES OF THE STITCH (read em or bleed)",
      text: "1. Needles is boss. The old man's office is Needles' office.\n2. Nobody touches the safe. Needles is \"working on the combination.\" (It is in the teletype. The machine wants a word and the word is RUTHIE, it is wrote on the blotter. Needles cant read.)\n3. The dead ladies downstairs stay where they are. They are GOOD LUCK. Whoever moved Doris is on latrine duty forever.\n4. Wanna sell jackets, you ask Needles. Army jackets = 20 scrip. Mink = 200 scrip.\n5. Anyone brings in one of them frozen sleepers alive gets double.",
      learn: "map_dng_garment_term",
    });

    // ---- foreman's office (boss) ----
    const top = K.desk(21, 4.2, -38.2, 0, {
      wood: true,
      w: 1.8,
      d: 0.9,
      clutter: true,
    });
    K.chair(21, 4.2, -37.2, 0.2, { c: [0.35, 0.2, 0.15] });
    K.terminal("dng_term_kessler", 21.4, top, -38.3, PI, {
      title: "KESSLER & SONS GARMENT CO. — FOREMAN",
      header:
        "GOTHAM BUSINESS MACHINES — MODEL 33 OFFICE TELETYPE\nLEASED 1965 · SERVICE CONTRACT No. 4471\n-Line 3-",
      lock: lockSpec({
        id: "map_dng_garment_term",
        label: "Kessler & Sons — foreman's teletype",
        passcode: "RUTHIE",
        hint: "Needles' house rules, upstairs in the pattern room.",
      }),
      entries: [
        {
          title: "Army Contract W-67-114",
          text: "Deliver: 4,000 M-1965 field jackets, olive drab, to Fort Hamilton by 3/7.\nPenalty clause: $500 per jacket short.\n\nNote (A. Kessler): We make this or we lose the building. Nobody leaves the floor.",
        },
        {
          title: "Memo: Fire Door Policy",
          text: "Effective immediately the 7th Ave fire door is to be kept LOCKED during shifts to prevent unauthorized breaks and theft of goods.\nKeys: A. Kessler, M. Brody (foreman) only.\n\n— Management",
        },
        {
          title: "Personal — To Ruth",
          text: "Ruthie, the radio says Chicago is gone. I have the keys in my hand and I cannot make myself go down there. If I open the door they will ask me why I locked it. I am a coward. Kiss the boys.\n— Morty",
        },
        {
          title: "Wall Safe — Combination",
          text: "For when I forget it again: the jacket deadline, Tuesday the 7th. 0-3-0-7.\n— M.B.",
          learn: "map_dng_garment_safe",
        },
        {
          title: "Wall Safe — Release Lock",
          text: "Safe solenoid released. The door swings open with a rusty groan.",
          action: () => unlockLoot("dng_garment", "wallsafe"),
        },
      ],
    });
    K.loot("safe", 23.72, 4.2 + 1.05, -35.2, HP, {
      loot: "wall_safe",
      wall: true,
      tag: "wallsafe",
      lock: lockSpec({
        id: "map_dng_garment_safe",
        label: "Kessler & Sons — foreman's wall safe",
        code: "0307",
        hint: "The foreman's teletype.",
      }),
    });
    K.bookcase(18.4, 4.2, -41.6, PI, 1.4);
    K.fileCabinet(23.4, 4.2, -41.3, HP, {});
    K.loot("file_cabinet", 23.4, 4.2, -40.4, HP, { loot: "file_cabinet" });
    K.box(
      "fabric",
      18,
      4.201,
      -39.8,
      23,
      4.215,
      -34.2,
      [0.45, 0.18, 0.14],
      0.5,
      8,
    );
    K.poster("long_winter", 20, 6.0, -32.12, 0, -1, 1.4, 0.7);
    K.light("bulb", 20, 7.4, -37, { floor: 4.2, real: true });
    K.anchor("boss", 20.5, 4.2, -36);
    K.anchor("spawn6", 19.5, 4.2, -34.5);
    // arrival
    K.anchor("arrival", 0, 0, -2.2, 0);
    K.anchor("exit", 0, 1.2, -0.5, 0);
  }

  // ===================================================================
  // 2. The Chelsea Arms — Maniacs, a Maniac Bruiser in the boiler room
  // ===================================================================
  function buildChelsea(K) {
    const r = K.r,
      Y = 4.2;
    const W = {
      wall: "wallpaper",
      wain: "wood_planks",
      wainC: [0.4, 0.3, 0.22],
      wc: [0.66, 0.6, 0.5],
    };
    K.room(
      Object.assign(
        {
          x0: -6,
          z0: -10,
          x1: 6,
          z1: 0,
          y: Y,
          h: 3.6,
          floor: "tile_floor",
          fc: [0.72, 0.7, 0.66],
          ceil: "plaster_stained",
        },
        W,
      ),
    );
    K.room(
      Object.assign(
        {
          x0: -1.5,
          z0: -34,
          x1: 1.5,
          z1: -10,
          y: Y,
          h: 3.2,
          floor: "carpet",
          fc: [0.5, 0.26, 0.2],
          surface: "carpet",
        },
        W,
      ),
    );
    const a1 = K.room(
      Object.assign(
        {
          x0: -12,
          z0: -22,
          x1: -1.5,
          z1: -12,
          y: Y,
          h: 3.2,
          floor: "wood_planks",
          fc: [0.6, 0.5, 0.4],
          surface: "wood",
        },
        W,
        { wc: [0.6, 0.62, 0.52] },
      ),
    );
    const bath = K.room({
      x0: -12,
      z0: -26,
      x1: -5,
      z1: -22,
      y: Y,
      h: 3.0,
      floor: "tile_floor",
      wall: "tile_subway",
      wc: [0.8, 0.82, 0.78],
      fc: [0.78, 0.78, 0.74],
    });
    const a1c = K.room(
      Object.assign(
        {
          x0: -12,
          z0: -34,
          x1: -1.5,
          z1: -26,
          y: Y,
          h: 3.2,
          floor: "wood_planks",
          fc: [0.6, 0.5, 0.4],
          surface: "wood",
        },
        W,
        { wc: [0.7, 0.6, 0.5] },
      ),
    );
    const a1b = K.room(
      Object.assign(
        {
          x0: 1.5,
          z0: -22,
          x1: 12,
          z1: -12,
          y: Y,
          h: 3.2,
          floor: "wood_planks",
          fc: [0.58, 0.48, 0.38],
          surface: "wood",
          hole: { x0: 5, z0: -19, x1: 9, z1: -15 },
        },
        W,
        { wc: [0.62, 0.55, 0.62] },
      ),
    );
    const laundry = K.room({
      x0: 1.5,
      z0: -28,
      x1: 10,
      z1: -22,
      y: Y,
      h: 3.0,
      floor: "tile_floor",
      wall: "plaster_stained",
      wc: [0.7, 0.72, 0.66],
      fc: [0.62, 0.62, 0.58],
    });
    const supt = K.room({
      x0: 1.5,
      z0: -34,
      x1: 10,
      z1: -28,
      y: Y,
      h: 3.0,
      floor: "wood_planks",
      wall: "plaster_stained",
      wain: "wood_planks",
      wainC: [0.4, 0.32, 0.24],
      wc: [0.6, 0.62, 0.55],
      fc: [0.55, 0.45, 0.35],
      surface: "wood",
    });
    K.room({
      x0: -1.5,
      z0: -44,
      x1: 4,
      z1: -34,
      y: 0,
      h: 8.2,
      floor: "concrete",
      wall: "brick_red",
      wc: [0.62, 0.52, 0.46],
      fc: [0.5, 0.5, 0.47],
    });
    const boiler = K.room({
      x0: -12,
      z0: -64,
      x1: 12,
      z1: -44,
      y: 0,
      h: 5.5,
      floor: "concrete",
      wall: "brick_red",
      ceil: "concrete",
      wc: [0.6, 0.5, 0.44],
      fc: [0.45, 0.44, 0.42],
      cc: [0.35, 0.34, 0.32],
    });
    K.room({
      x0: 12,
      z0: -52,
      x1: 36,
      z1: -48,
      y: 0,
      h: 3.0,
      floor: "concrete",
      wall: "concrete",
      wc: [0.5, 0.52, 0.48],
      fc: [0.42, 0.42, 0.4],
    });
    const store = K.room({
      x0: 36,
      z0: -58,
      x1: 46,
      z1: -44,
      y: 0,
      h: 3.2,
      floor: "concrete",
      wall: "brick_red",
      wc: [0.55, 0.46, 0.4],
      fc: [0.45, 0.44, 0.42],
    });
    K.door(0, 0, 1.8, Y, 2.5, { exit: true });
    K.door(0, -10, 1.4, Y);
    K.door(-1.5, -17, 1.0, Y, 2.2);
    K.door(1.5, -16, 1.0, Y, 2.2);
    K.door(-1.5, -30, 1.0, Y, 2.2);
    K.door(-8.5, -22, 0.9, Y, 2.1);
    K.door(1.5, -25, 1.0, Y, 2.2);
    K.door(1.5, -31, 1.0, Y, 2.2);
    K.door(0, -34, 1.4, Y, 2.3);
    K.door(0, -44, 1.4, 0, 2.3);
    K.door(12, -50, 1.3, 0, 2.3);
    K.door(36, -50, 1.3, 0, 2.3);
    K.build();
    exitDoor(K, 0, Y, 1.8, 2.5, { c: [0.28, 0.22, 0.18] });

    // ---- lobby ----
    mailboxes(K, -6, Y + 0.8, -5, 1, 0, 8, 3);
    K.sign("CHELSEA ARMS", 0, Y + 2.9, -9.85, 0, 1, 3.0);
    K.sofa(4.2, Y, -2.2, -HP, { c: [0.4, 0.28, 0.2] });
    radiator(K, 5.7, Y, -6.5, -HP);
    K.counter(-5.2, -9.0, -2.5, -8.2, Y, { c: [0.4, 0.3, 0.22] });
    K.light("bulb", 0, Y + 3.6, -5, { floor: Y, real: true });
    K.litter(-6, -10, 6, 0, Y, 12);
    for (let i = 0; i < 5; i++)
      K.decal(
        r.range(-4, 4),
        Y + 0.013,
        r.range(-9, -1),
        r.range(0.6, 1.4),
        r.range(0.6, 1.4),
        r() * 6,
        M.MARK.BLOOD,
      );
    K.loot("first_aid", 5.85, Y + 1.2, -3.2, HP, { loot: "first_aid" });

    // ---- hallway: numbered doors, stains, flickering ----
    fakeDoor(K, -1.5, Y, -12.8, 1, 0, {});
    fakeDoor(K, 1.5, Y, -12.8, -1, 0, {});
    fakeDoor(K, -1.5, Y, -24.2, 1, 0, {});
    K.light("tube", 0, Y + 3.2, -13, {
      floor: Y,
      alongX: false,
      flicker: true,
    });
    K.light("dead", 0, Y + 3.2, -20, { alongX: false });
    K.light("tube", 0, Y + 3.2, -28, { floor: Y, alongX: false });
    K.litter(-1.5, -34, 1.5, -10, Y, 10, { tiles: false });
    K.decal(-0.3, Y + 0.014, -21, 1.2, 3.6, 0.1, M.MARK.BLOOD);
    K.anchor("spawn1", 0, Y, -25);

    // ---- apartments ----
    apartment(K, a1, { bedSide: "w" });
    boardedWindow(K, -12, Y + 1.5, -17, 1, 0, 1.6, 1.8);
    K.loot("file_cabinet", -2.2, Y, -12.7, 0, {
      loot: "dresser",
      name: "Dresser",
    });
    K.anchor("spawn2", -8, Y, -18);
    apartment(K, a1c, { bedSide: "w" });
    boardedWindow(K, -12, Y + 1.5, -30, 1, 0, 1.6, 1.8);
    K.anchor("spawn3", -7, Y, -30);
    apartment(K, a1b, { bedSide: "e" });
    K.poster("lonly_tv", 11.85, Y + 1.8, -19, -1, 0, 1.2, 0.8);
    // the tableau: a couple on the sofa of 1C, the TV still facing them
    K.skel(-3.55, Y - 0.03, -27.2, PI, "seated");
    K.skel(-2.65, Y - 0.03, -27.2, PI, "seated");
    K.note("dng_note_chelsea_eviction", -6.1, Y + 0.8, -29.6, {
      name: "Letter to Apt 1C",
      title: "CHELSEA ARMS — Office of the Superintendent",
      text: "Mr. & Mrs. Adler (1C) —\n\nThe building has received two (2) Civil Defense shelter passes for the deep shelter under the 69th Regiment Armory. Under the lease, they go to the tenants in best standing. That is not you. You have complained about the radiators nine times this year.\n\nThe Kowalskis in 1A will be taking the passes.\n\nRespectfully,\nE. Mooney, Supt.\n\n(handwritten below, shaky:)\nWe stayed in. We watched the news together. The radiators finally came on. It was very warm. — Harold",
    });
    // bathroom
    K.box(
      "tile_floor",
      -11.8,
      Y,
      -25.8,
      -9.8,
      Y + 0.55,
      -24.9,
      [0.85, 0.85, 0.8],
      0.5,
    );
    K.col(-11.8, Y, -25.8, -9.8, Y + 0.55, -24.9, { tag: "furniture" });
    K.stalls(-8.2, -6.2, -26, 1, Y, 1);
    K.light("bulb", -8.5, Y + 3.0, -24, { floor: Y });
    K.loot("first_aid", -5.15, Y + 1.3, -24, HP, { loot: "medical_cabinet" });

    // ---- laundry ----
    for (let x = 3; x < 9.5; x += 1.3) {
      K.box(
        "metal_painted",
        x - 0.55,
        Y,
        -27.9,
        x + 0.55,
        Y + 1.0,
        -27.2,
        [0.72, 0.72, 0.68],
        1,
      );
      K.cyl("glass_dirty", x, Y + 0.55, -27.19, 0.28, 0.28, 0.02, 10, {
        c: [0.2, 0.22, 0.2],
      });
      K.col(x - 0.55, Y, -27.9, x + 0.55, Y + 1.0, -27.2, {
        tag: "furniture",
        surface: "metal",
      });
    }
    K.pipe("rust", 2, Y + 2.4, -23, 9.5, Y + 2.4, -23, 0.012, 3, {
      c: [0.4, 0.3, 0.25],
    });
    for (let x = 2.6; x < 9; x += 0.6)
      K.obox("fabric", x, Y + 2.0, -23, 0.02, 0.8, 0.5, 0, {
        c: r.pick([
          [0.6, 0.58, 0.5],
          [0.4, 0.45, 0.55],
          [0.55, 0.3, 0.25],
        ]),
        s: 0.5,
      });
    K.light("tube", 6, Y + 3.0, -25, { floor: Y });
    K.loot("trash_can", 9.4, Y, -22.6, 0, { loot: "trash_can" });
    K.anchor("spawn4", 6, Y, -24.5);

    // ---- superintendent's office ----
    const top = K.desk(6, Y, -32.8, 0, { w: 1.6, d: 0.8, monitor: false });
    K.chair(6, Y, -31.9, 0);
    K.terminal("dng_term_chelsea", 6.3, top, -32.9, PI, {
      title: "CHELSEA ARMS — SUPERINTENDENT",
      header:
        "GOTHAM BUSINESS MACHINES — MODEL 33 OFFICE TELETYPE\n-Tenant Ledger-",
      entries: [
        {
          title: "Complaint Log (partial)",
          text: "2/13 — 1C (Adler): radiator cold. Declined.\n2/19 — 2A: screaming from 1B. Not our business.\n2/25 — 1C (Adler): radiator cold AGAIN, snow on the sill. Declined.\n3/4 — Boiler room: something living down there. Pest control booked for 3/6.",
        },
        {
          title: "Shelter Pass Allocation",
          text: 'CIVIL DEFENSE PASSES RECEIVED: 2\nALLOCATED: Kowalski, J. (1A); Kowalski, M. (1A)\nNOTES: E. Mooney (Supt.) to accompany as "building liaison" per verbal agreement with Mr. Kowalski ($200).',
        },
        {
          title: "Boiler Room — Maintenance",
          text: "Boiler #2 cracked firebox. Glowing? Recommend nobody go down there without a badge.\nThe tenant storage cages are past the tunnel. Tenants keep asking for their trunks. Tell them no.",
        },
        {
          title: "Office Safe — Combination",
          text: "Rent money goes in the wall safe Fridays.\nCombination: 1-1-0-4 (my birthday — E.M.)",
          learn: "map_dng_chelsea_safe",
        },
        {
          title: "Office Safe — Release",
          text: "Click. The wall safe unlocks.",
          action: () => unlockLoot("dng_chelsea", "wallsafe"),
        },
      ],
    });
    K.loot("safe", 9.72, Y + 1.05, -31, HP, {
      loot: "wall_safe",
      wall: true,
      tag: "wallsafe",
      lock: lockSpec({
        id: "map_dng_chelsea_safe",
        label: "Chelsea Arms — superintendent's wall safe",
        code: "1104",
        hint: "The superintendent's teletype.",
      }),
    });
    K.fileCabinet(2.2, Y, -33.4, PI, {});
    K.fileCabinet(2.7, Y, -33.4, PI, { open: true });
    K.shelf(9.5, Y, -29, HP, 1.8, "parts", { h: 1.8 });
    K.light("bulb", 5, Y + 3.0, -31, { floor: Y, real: true });
    K.skel(4.4, Y, -30.5, 1.2, "lying");
    K.loot("desk", 3.8, Y, -29.2, 0, { loot: "desk" });

    // ---- stairwell down to the basement ----
    K.landing(-1.5, -35.4, 4, -34, Y, { rails: [[1.1, -35.4, 4, -35.4]] });
    K.stairs(-1.4, 1.1, -35.4, -42.4, Y, 0, "z", { rail: "hi" });
    K.light("cage", 3.8, 2.8, -40, { nx: -1, nz: 0, floor: 0 });
    K.light("red", -1.3, 6.5, -38, { nx: 1, nz: 0, floor: 0 });
    K.sign("BOILER ROOM", 0, 2.75, -43.85, 0, 1, 1.4);

    // ---- boiler room (boss) ----
    K.boiler(-6, 0, -55, 0, 7);
    K.boiler(5.5, 0, -56, 0, 7);
    K.pipeRun(
      [
        [-12, 4.6, -46],
        [12, 4.6, -46],
      ],
      0.18,
    );
    K.pipeRun(
      [
        [-11.6, 0.4, -46],
        [-11.6, 4.8, -46],
        [-11.6, 4.8, -63],
      ],
      0.12,
    );
    K.pipeRun(
      [
        [-6, 5.3, -51.5],
        [-6, 5.3, -46],
      ],
      0.3,
      { c: [0.35, 0.3, 0.27] },
    );
    K.rubbleMound(9, 0, -61, 2.5, 1.2); // coal heap
    K.table(-9.5, 0, -46.2, 0, 3, 0.9, {
      mat: "metal_painted",
      c: [0.4, 0.4, 0.36],
    });
    K.light("cage", 0, 4.4, -44.2, { nx: 0, nz: 1, floor: 0, real: true });
    K.light("red", 11.8, 3.5, -58, { nx: -1, nz: 0, floor: 0, real: true });
    K.light("dead", 0, 5.5, -58, {});
    K.litter(-12, -64, 12, -44, 0, 18, {
      cells: [
        M.MARK.DIRT,
        M.MARK.GRIME,
        M.MARK.PUDDLE,
        M.MARK.STAIN,
        M.MARK.BLOOD,
      ],
    });
    // the bruiser's nest by a leaking, irradiated puddle, and the bones of pest control
    K.decal(0, 0.014, -58, 4, 4, 0.5, M.MARK.MOSS, [0.6, 1.2, 0.6]);
    K.skel(1.8, 0, -59.5, 2.2, "lying");
    K.skel(-1.2, 0, -60.8, 0.4, "reaching");
    K.loot("toolbox", -10.2, 0.76, -46.2, 0, { loot: "toolbox", chest: true });
    K.loot("ammo_box", -11.3, 0, -62.8, HP, { loot: "ammo_box" });
    K.anchor("spawn6", 0, 0, -57);
    K.anchor("boss", 0, 0, -57);

    // ---- maintenance tunnel ----
    K.grate(12, -49.4, 36, -48.6, 0);
    K.pipeRun(
      [
        [12, 2.6, -51.6],
        [36, 2.6, -51.6],
      ],
      0.14,
    );
    K.pipeRun(
      [
        [12, 2.2, -51.7],
        [36, 2.2, -51.7],
      ],
      0.07,
      { mat: "metal_painted", c: [0.3, 0.4, 0.3] },
    );
    for (const x of [18, 30])
      K.light("cage", x, 2.4, -48.2, { nx: 0, nz: -1, floor: 0 });
    for (let i = 0; i < 6; i++)
      K.decal(
        r.range(13, 35),
        0.013,
        r.range(-51.5, -48.5),
        r.range(0.8, 1.6),
        r.range(0.6, 1.2),
        r() * 6,
        r.pick([M.MARK.PUDDLE, M.MARK.GRIME]),
      );
    K.anchor("spawn5", 24, 0, -50);

    // ---- tenant storage: cages, trunks, and the Kowalskis ----
    for (let x = 37.5; x < 45; x += 2.4) {
      K.cage(x, 0, -56.8, 1.9);
    }
    K.lockers(38.5, 0, -44.6, 0, 4);
    K.loot("footlocker", 39.8, 0, -52.6, 0, {
      loot: "luggage",
      name: "Steamer Trunk",
    });
    K.loot("footlocker", 44.4, 0, -50.4, -HP, { loot: "footlocker" });
    K.loot("footlocker", 42, 0, -53, 0.3, {
      loot: "luggage",
      name: "Suitcase",
      lock: lockSpec({
        id: "map_dng_chelsea_suitcase",
        label: "The Kowalskis' suitcase",
        key: "map_key_chelsea_suitcase",
        hint: "On a string with the Kowalskis, in the tenant storage cages.",
      }),
    });
    placeKey(K, "map_key_chelsea_suitcase", 41.0, 0, -49.3);
    K.skel(41.2, 0, -49.5, 0.3, "curled");
    K.skel(42.2, 0, -49.1, -0.4, "child_curled");
    K.skel(40.3, 0, -48.6, 1.8, "sitting");
    K.note("dng_note_kowalski", 41.6, 0, -48.4, {
      name: "Shelter Pass (Kowalski)",
      title: "OFFICE OF CIVIL DEFENSE — PUBLIC SHELTER PASS",
      text: 'ADMIT ONE (1): KOWALSKI, JAN\nADMIT ONE (1): KOWALSKI, MARTA\nReport to the 69th Regiment Armory, Lexington Ave., with this pass and ONE suitcase.\n\n(written on the back in pencil:)\nThe Super took the car. He took my Jan\'s pass right out of his hand and said he was "the liaison." We came down here because the walls are thick. Marta is asleep. I told her we are in the shelter now, that this is what a shelter looks like. She believed me. The suitcase key is on her string. — A.K.',
    });
    K.light("bulb", 41, 3.2, -51, { floor: 0, real: true });
    K.litter(36, -58, 46, -44, 0, 10);
    K.anchor("arrival", 0, Y, -2.2, 0);
    K.anchor("exit", 0, Y + 1.2, -0.5, 0);
    void bath;
    void laundry;
    void supt;
    void boiler;
    void store;
  }

  // ===================================================================
  // 3. Dunmore Mutual Trust — the bank still guards its strongroom
  // ===================================================================
  function buildBank(K) {
    const r = K.r;
    const hall = K.room({
      x0: -12,
      z0: -20,
      x1: 12,
      z1: 0,
      h: 7,
      floor: "marble",
      wall: "stone_limestone",
      wain: "marble_dark",
      wainH: 1.4,
      wainC: [0.4, 0.4, 0.38],
      ceil: "plaster_stained",
      wc: [0.8, 0.76, 0.68],
      fc: [0.78, 0.75, 0.7],
      cc: [0.62, 0.58, 0.52],
    });
    const offices = K.room({
      x0: 12,
      z0: -20,
      x1: 36,
      z1: 0,
      h: 3.8,
      floor: "carpet",
      wall: "plaster_stained",
      wc: [0.72, 0.7, 0.62],
      fc: [0.35, 0.38, 0.42],
      surface: "carpet",
      hole: { x0: 26, z0: -12, x1: 31, z1: -6 },
    });
    K.room({
      x0: -1.5,
      z0: -32,
      x1: 1.5,
      z1: -20,
      h: 3.4,
      floor: "marble",
      wall: "plaster_stained",
      wain: "wood_planks",
      wainC: [0.4, 0.3, 0.2],
      wc: [0.7, 0.66, 0.58],
      fc: [0.7, 0.68, 0.62],
    });
    const rec = K.room({
      x0: -16,
      z0: -32,
      x1: -1.5,
      z1: -20,
      h: 3.4,
      floor: "tile_floor",
      wall: "plaster_stained",
      wc: [0.68, 0.66, 0.6],
      fc: [0.6, 0.58, 0.54],
    });
    K.room({
      x0: 1.5,
      z0: -28,
      x1: 9,
      z1: -20,
      h: 3.2,
      floor: "tile_floor",
      wall: "tile_subway",
      wc: [0.78, 0.8, 0.76],
      fc: [0.75, 0.74, 0.7],
    });
    const mgr = K.room({
      x0: 9,
      z0: -32,
      x1: 20,
      z1: -20,
      h: 3.4,
      floor: "carpet",
      wall: "wallpaper",
      wain: "wood_planks",
      wainC: [0.35, 0.24, 0.16],
      wc: [0.55, 0.62, 0.52],
      fc: [0.42, 0.18, 0.15],
      surface: "carpet",
    });
    K.room({
      x0: -6,
      z0: -44,
      x1: 6,
      z1: -32,
      h: 3.4,
      floor: "terrazzo",
      wall: "concrete_panel",
      wc: [0.62, 0.64, 0.6],
      fc: [0.62, 0.6, 0.56],
    });
    const strong = K.room({
      x0: -9,
      z0: -62,
      x1: 9,
      z1: -44,
      h: 4.2,
      floor: "metal_diamond",
      wall: "metal_panel",
      ceil: "metal_panel",
      wc: [0.62, 0.62, 0.58],
      fc: [0.55, 0.55, 0.52],
      cc: [0.45, 0.45, 0.43],
      surface: "metal",
    });
    K.door(0, 0, 2.4, 0, 3.2, { exit: true });
    K.door(12, -10, 1.6, 0, 2.6);
    K.door(0, -20, 1.4, 0, 2.4);
    K.door(-1.5, -26, 1.2, 0, 2.3);
    K.door(1.5, -24, 1.0, 0, 2.2);
    K.door(9, -30, 1.1, 0, 2.3);
    K.door(15, -20, 1.2, 0, 2.4);
    K.door(0, -32, 1.6, 0, 2.4);
    K.door(0, -44, 3.0, 0, 3.0);
    K.build();
    exitDoor(K, 0, 0, 2.4, 3.2, { mat: "bronze", c: [0.55, 0.45, 0.3] });

    // ---- banking hall ----
    for (const x of [-8, -4, 4, 8])
      for (const z of [-4, -10]) {
        K.cyl("marble", x, 0, z, 0.45, 0.42, 7, 12, { c: [0.8, 0.78, 0.72] });
        K.cyl("marble", x, 0, z, 0.6, 0.6, 0.5, 12, {
          c: [0.7, 0.68, 0.62],
          capTop: true,
        });
        K.col(x - 0.5, 0, z - 0.5, x + 0.5, 7, z + 0.5, {
          tag: "column",
          surface: "concrete",
        });
      }
    // teller counter with brass grilles (gate at x 8..10.5)
    K.counter(-11.9, -15, 8, -14, 0, {
      h: 1.15,
      c: [0.4, 0.3, 0.22],
      top: "marble",
      topC: [0.7, 0.68, 0.62],
    });
    for (let x = -11.5; x < 8; x += 0.18)
      K.pipe("bronze", x, 1.15, -14.5, x, 2.4, -14.5, 0.012, 3, {
        c: [0.6, 0.48, 0.28],
      });
    K.beam("bronze", -11.9, 2.42, -14.5, 8, 2.42, -14.5, 0.06, 0.06, {
      c: [0.6, 0.48, 0.28],
    });
    K.col(-11.9, 1.15, -14.55, 8, 2.45, -14.45, {
      tag: "grille",
      surface: "metal",
    });
    K.sign("TELLERS", -2, 3.0, -14.5, 0, 1, 2.0);
    K.sign("DUNMORE MUTUAL TRUST", 0, 5.6, -19.85, 0, 1, 5.0);
    for (const x of [-8, -2])
      K.table(x, 0, -8, 0, 2.2, 0.8, { c: [0.35, 0.25, 0.18], h: 1.05 });
    for (let i = 0; i < 6; i++) {
      const x = -9 + i * 3.4;
      K.cyl("bronze", x, 0, -2.2, 0.15, 0.12, 1.0, 8, {
        c: [0.6, 0.48, 0.28],
        capTop: true,
      });
      if (i < 5 && r() < 0.7)
        K.pipe("fabric", x, 0.95, -2.2, x + 3.4, 0.7, -2.2, 0.03, 4, {
          c: [0.5, 0.12, 0.1],
        });
    }
    // fallen chandelier
    K.cyl("bronze", 3, 0.05, -12, 1.2, 0.8, 0.5, 10, { c: [0.5, 0.42, 0.26] });
    K.pipe("bronze", 3, 0.5, -12, 4.5, 0.2, -13, 0.02, 3, {
      c: [0.5, 0.42, 0.26],
    });
    for (let i = 0; i < 12; i++)
      K.decal(
        3 + r.range(-2, 2),
        0.013,
        -12 + r.range(-2, 2),
        0.5,
        0.5,
        r() * 6,
        M.MARK.CRACKS,
      );
    K.pipe("metal_painted", 3, 7, -12, 3, 4.5, -12, 0.015, 3, {
      c: [0.3, 0.3, 0.3],
    });
    for (const [x, z] of [
      [-6, -6],
      [6, -6],
      [-6, -16],
      [6, -16],
    ])
      K.light("tubes2", x, 7, z, { floor: 0, drop: 1.5, alive: r() < 0.6 });
    K.litter(-12, -20, 12, 0, 0, 28, {
      cells: [M.MARK.LITTER, M.MARK.DIRT, M.MARK.STAIN, M.MARK.CRACKS],
    });
    K.loot("cash_register", -6, 1.15, -14.7, 0, { loot: "cash_register" });
    K.loot("cash_register", 2, 1.15, -14.7, 0, { loot: "cash_register" });
    K.loot("desk", -9.8, 0, -18.8, PI, { loot: "desk" });
    K.skel(-3, 0, -3.5, 0.8, "lying");
    K.skel(5.4, 0, -18.4, 2.2, "sitting");
    placeKey(K, "map_key_dmt_guard", 5.9, 0, -18.0); // the guard by the tellers still has his key ring
    K.anchor("spawn1", -4, 0, -17);
    K.anchor("spawn2", 4, 0, -7);
    // a wrecked robot patrolman by the door (the robots have been fighting the Maniacs for 22 years)
    K.cyl("metal_painted", -9.5, 0, -1.8, 0.35, 0.4, 1.2, 8, {
      c: [0.4, 0.42, 0.38],
      capTop: true,
    });
    K.obox("metal_painted", -9.0, 0.3, -1.1, 0.5, 0.5, 0.5, 0.6, {
      c: [0.35, 0.38, 0.36],
      roll: 0.5,
    });

    // ---- loan offices (cubicles, collapsed ceiling) ----
    cubicles(K, 13.5, -18.5, 35, -1.5, 0, {});
    K.light("tube", 16, 3.8, -4, { floor: 0, flicker: true });
    K.light("dead", 22, 3.8, -4, {});
    K.light("tube", 33, 3.8, -16, { floor: 0 });
    K.light("tube", 20, 3.8, -16, { floor: 0, real: true });
    K.litter(12, -20, 36, 0, 0, 24);
    K.loot("file_cabinet", 35.4, 0, -19.4, HP, { loot: "file_cabinet" });
    K.loot("desk", 34.2, 0, -2.5, 0, { loot: "desk" });
    K.anchor("spawn3", 24, 0, -9);

    // ---- corridor / restroom ----
    K.light("tube", 0, 3.4, -26, { floor: 0, alongX: false });
    K.stalls(3.2, 8.8, -28, 1, 0, 3);
    K.sinks(3.4, 8.6, -20, -1, 0);
    K.light("dead", 5, 3.2, -24, {});
    K.loot("first_aid", 8.85, 1.3, -22.4, HP, { loot: "first_aid" });

    // ---- records ----
    for (let x = -14.5; x < -3; x += 2.2)
      K.shelf(x, 0, -26, HP, 9, "boxes", {
        h: 2.4,
        d: 0.6,
        collapsed: r() < 0.3,
        back: false,
      });
    K.light("tube", -9, 3.4, -23, { floor: 0, flicker: true });
    K.light("dead", -9, 3.4, -29, {});
    K.litter(-16, -32, -1.5, -20, 0, 20, {
      cells: [M.MARK.LITTER, M.MARK.LITTER, M.MARK.DIRT],
    });
    K.loot("file_cabinet", -15.4, 0, -21, -HP, { loot: "file_cabinet" });

    // ---- manager's office ----
    const top = K.desk(14.5, 0, -28.5, 0, { wood: true, w: 2.0, d: 0.95 });
    K.chair(14.5, 0, -27.5, 0, { c: [0.3, 0.15, 0.1] });
    K.terminal("dng_term_bank", 14.9, top, -28.6, PI, {
      title: "DUNMORE MUTUAL TRUST — BRANCH MANAGER",
      header:
        "GOTHAM BUSINESS MACHINES — MODEL 35 BANKING TELETYPE\n-DMT Secure Branch Line-",
      lock: lockSpec({
        id: "map_dng_bank_term",
        label: "Dunmore Mutual Trust — branch manager's teletype",
        passcode: "EVELYN",
        hint: "Whitcomb's deposit slip, on his desk.",
      }),
      entries: [
        {
          title: "Security Status",
          text: 'STRONGROOM: SEALED (PROTOCOL OMEGA)\nPATROLMAN UNITS: 3 ACTIVE / ASSIGNED: LOBBY\nVALET UNIT: ACTIVE / ASSIGNED: RECORDS\nBULWARK UNIT "TELLER": ACTIVE / ASSIGNED: STRONGROOM INTERIOR\n\nDIRECTIVE: PROTECT DEPOSITOR ASSETS. NO WITHDRAWALS.',
        },
        {
          title: "Memo — Protocol Omega",
          text: "In the event of civil disorder the strongroom will be sealed from within and the robotic staff will treat ALL persons on the premises as unauthorized.\nNo exceptions. Not even for staff.\n\n— R. Dunmore III, Chairman",
        },
        {
          title: "Personal Log — G. Whitcomb",
          text: 'The Chairman\'s family is in the strongroom. The Chairman is in the strongroom. The Chairman sealed it with 40 depositors still banging on the grille. The robots are "protecting the assets."\n\nI am the only one who knows the override for the security teletype. I am writing it here in case I do not make it out of this office: OMEGAFORTY. Forty. I counted them.',
          learn: "map_dng_bank_secterm",
        },
        {
          title: "Wall Safe — Combination",
          text: "Manager's safe, dual control waived (there is nobody left to dual-control with): 0-6-1-2.",
          learn: "map_dng_bank_mgr_safe",
        },
        {
          title: "Wall Safe — Release",
          text: "The manager's wall safe unlocks.",
          action: () => unlockLoot("dng_bank", "wallsafe"),
        },
      ],
    });
    K.loot("safe", 19.72, 1.05, -26, HP, {
      loot: "wall_safe",
      wall: true,
      tag: "wallsafe",
      lock: lockSpec({
        id: "map_dng_bank_mgr_safe",
        label: "Dunmore Mutual Trust — manager's wall safe",
        code: "0612",
        hint: "The branch manager's teletype.",
      }),
    });
    K.bookcase(11.5, 0, -31.6, PI, 1.6);
    K.bookcase(13.2, 0, -31.6, PI, 1.6);
    K.sofa(17.5, 0, -21, 0, { c: [0.3, 0.15, 0.1] });
    K.box(
      "fabric",
      11,
      0.001,
      -30,
      18.5,
      0.015,
      -22.5,
      [0.4, 0.12, 0.1],
      0.5,
      8,
    );
    K.poster("long_winter", 14.5, 2.0, -31.88, 0, 1, 1.2, 0.8);
    K.cyl("bronze", 18.8, 0, -31, 0.25, 0.2, 0.9, 8, {
      c: [0.5, 0.4, 0.25],
      capTop: true,
    });
    K.cyl("glass_dirty", 18.8, 0.9, -31, 0.3, 0.3, 0.5, 10, {
      c: [0.3, 0.45, 0.55],
    });
    K.light("bulb", 14.5, 3.4, -26, { floor: 0, real: true });
    K.skel(14.5, 0, -27.45, 0, "seated");
    K.note("dng_note_whitcomb", 15.4, 0.77, -29.0, {
      name: "Deposit Slip (Whitcomb)",
      title: "DUNMORE MUTUAL TRUST — DEPOSIT SLIP",
      text: 'DEPOSITOR: Gerald Whitcomb, Branch Mgr.\nAMOUNT: one (1) conscience\n\nThey have stopped banging on the grille. The patrolmen are still saying "Please remain calm, your deposit is safe with Dunmore." I can hear them from here.\n\nIf you are reading this: my teletype word is my wife\'s name, EVELYN. The override for the security teletype by the strongroom is in my log. The Chairman keeps his personal box in the back row, left, and the key on his watch chain. Take everything.',
      learn: "map_dng_bank_term",
    });
    K.loot("file_cabinet", 10.2, 0, -23, -HP, { loot: "file_cabinet" });

    // ---- security checkpoint ----
    K.counter(-5, -38.5, -1.5, -37.5, 0, {
      h: 1.1,
      c: [0.35, 0.36, 0.33],
      mat: "metal_painted",
      top: "metal_panel",
      topC: [0.45, 0.45, 0.42],
    });
    K.lockers(4.2, 0, -33.6, 0, 4);
    K.monitor(-3.5, -37.9, 1.1, 0);
    K.terminal("dng_term_bank_sec", -2.4, 1.1, -38.0, PI, {
      title: "DMT STRONGROOM SECURITY",
      header: "DUNMORE MUTUAL TRUST\nSTRONGROOM ACCESS CONTROL",
      lock: lockSpec({
        id: "map_dng_bank_secterm",
        label: "Dunmore Mutual Trust — strongroom security teletype",
        passcode: "OMEGAFORTY",
        hint: "Whitcomb's personal log on the branch manager's teletype.",
      }),
      entries: [
        {
          title: "Strongroom Door Status",
          text: "STRONGROOM DOOR: OPEN (FORCED — 1967.10.24 04:12)\nNOTE: Door breached from the INSIDE.",
        },
        {
          title: "Depositor Box Registry",
          text: "Box 001 — R. Dunmore III (Chairman) — KEY ONLY\nBox 002 — E. Dunmore\nBox 118 — [REDACTED — Office of Civil Defense] — dual-control code 4-4-7-1\nBox 302 — M. Feeney — courtesy code 3-0-2-0\nBoxes 200-400 — Deposit holders, general",
          learn: ["map_dng_bank_box118", "map_dng_bank_box302"],
        },
      ],
    });
    K.light("tube", 0, 3.4, -38, { floor: 0, real: true, flicker: true });
    K.light("red", 5.8, 2.6, -40, { nx: -1, nz: 0, floor: 0 });
    K.loot("locker", -5.4, 0, -33.4, 0, {
      loot: "locker",
      lock: lockSpec({
        id: "map_dng_bank_locker",
        label: "Dunmore Mutual Trust — security locker",
        key: "map_key_dmt_guard",
        hint: "The guard's key ring, by the tellers in the banking hall.",
      }),
    });
    K.sign("SAFE DEPOSIT", 0, 3.0, -43.85, 0, 1, 1.8);
    K.anchor("spawn4", 0, 0, -35);

    // ---- the strongroom (boss: the Bulwark unit "TELLER") ----
    // the round door, blown off its hinges and leaning on the wall outside the opening
    const dm = M.mtx(4.4, 1.6, -43.2, 0.25, 0, 0.16);
    M.pushXF(dm);
    M.cyl(K.b("metal_scratched"), 0, -0.45, 0, 1.7, 1.7, 0.9, 20, {
      capTop: true,
      capBot: true,
      c: [0.6, 0.6, 0.58],
    });
    M.popXF();
    K.col(3.2, 0, -44, 5.8, 3.3, -42.6, { tag: "debris", surface: "metal" });
    // safe-deposit box walls
    const boxWall = (ax, az, bx, bz, nx, nz) => {
      const L = Math.hypot(bx - ax, bz - az),
        ux = (bx - ax) / L,
        uz = (bz - az) / L;
      for (let t = 0.3; t < L - 0.2; t += 0.42)
        for (let y = 0.3; y < 3.6; y += 0.3) {
          const x = ax + ux * t + nx * 0.12,
            z = az + uz * t + nz * 0.12;
          const open = r() < 0.12;
          K.plate(
            open ? "glass_dirty" : "metal_scratched",
            x,
            y,
            z,
            nx,
            nz,
            0.38,
            0.26,
            null,
            open
              ? [0.05, 0.05, 0.05]
              : M.mulc([0.7, 0.66, 0.55], 0.85 + r() * 0.2),
          );
        }
    };
    boxWall(-8.8, -61.9, 8.8, -61.9, 0, 1);
    boxWall(-8.9, -44.2, -8.9, -61.8, 1, 0);
    boxWall(8.9, -61.8, 8.9, -44.2, -1, 0);
    K.table(0, 0, -53, 0, 3, 1.2, {
      mat: "metal_painted",
      c: [0.45, 0.45, 0.42],
    });
    for (let i = 0; i < 4; i++)
      K.obox("gold", -0.8 + i * 0.35, 0.8, -53.2, 0.28, 0.08, 0.12, 0.1 * i, {
        c: [0.9, 0.75, 0.35],
        s: 0.5,
      });
    // Protocol Omega: the Chairman's family in the back row (his box key still on his watch chain)
    placeKey(K, "map_key_dmt_chairman", -6.4, 0, -60.0);
    K.skel(-6.8, 0, -60.5, 0.3, "sitting");
    K.skel(-5.8, 0, -60.8, -0.2, "child_curled");
    K.skel(-4.6, 0, -60.2, 0.2, "curled");
    K.skel(6.2, 0, -47, 2.2, "lying");
    K.light("tube", -4, 4.2, -53, { floor: 0, real: true });
    K.light("tube", 4, 4.2, -53, { floor: 0, flicker: true });
    K.light("red", 0, 3.6, -61.7, { nx: 0, nz: 1, floor: 0 });
    K.litter(-9, -62, 9, -44, 0, 16, {
      cells: [M.MARK.LITTER, M.MARK.DIRT, M.MARK.STAIN, M.MARK.BLOOD],
    });
    K.loot("safe", -7.5, 0, -61.2, PI, {
      loot: "safe",
      name: "Chairman's Deposit Box",
      lock: lockSpec({
        id: "map_dng_bank_box001",
        label: "Dunmore Mutual Trust — Box 001 (the Chairman)",
        key: "map_key_dmt_chairman",
        hint: "On the Chairman, in the back row of the strongroom.",
      }),
    });
    K.loot("safe", 7.6, 0, -58, HP, {
      loot: "safe",
      name: "Deposit Box 118",
      lock: lockSpec({
        id: "map_dng_bank_box118",
        label: "Dunmore Mutual Trust — Box 118",
        code: "4471",
        hint: "The depositor box registry on the strongroom security teletype.",
      }),
    });
    K.loot("safe", 7.6, 0, -50, HP, {
      loot: "safe",
      name: "Deposit Box 302",
      lock: lockSpec({
        id: "map_dng_bank_box302",
        label: "Dunmore Mutual Trust — Box 302",
        code: "3020",
        hint: "The depositor box registry on the strongroom security teletype.",
      }),
    });
    K.loot("ammo_box", -7.6, 0, -45.2, -HP, { loot: "ammo_box", large: true });
    K.anchor("spawn5", -4, 0, -49);
    K.anchor("spawn6", 0, 0, -57);
    K.anchor("boss", 0, 0, -57);
    K.anchor("arrival", 0, 0, -2.2, 0);
    K.anchor("exit", 0, 1.2, -0.5, 0);
    void hall;
    void offices;
    void rec;
    void mgr;
    void strong;
  }

  // ===================================================================
  // 4. Fulton Street Station — a Brute larder
  // ===================================================================
  function buildMetro(K) {
    const r = K.r,
      MZ = 4.5,
      PF = 1.2;
    const tile = { wall: "tile_subway", wc: [0.82, 0.8, 0.72] };
    K.room(
      Object.assign(
        {
          x0: -10,
          z0: -12,
          x1: 10,
          z1: 0,
          y: MZ,
          h: 3.4,
          floor: "tile_floor",
          fc: [0.62, 0.6, 0.55],
          ceil: "concrete",
        },
        tile,
      ),
    );
    K.room({
      x0: -10,
      z0: -16,
      x1: -2,
      z1: -12,
      y: MZ,
      h: 3.0,
      floor: "tile_floor",
      wall: "tile_subway",
      wc: [0.76, 0.78, 0.74],
      fc: [0.7, 0.7, 0.66],
    });
    K.room(
      Object.assign(
        {
          x0: 10,
          z0: -16,
          x1: 16,
          z1: 0,
          y: PF,
          h: 6.7,
          floor: "concrete",
          fc: [0.55, 0.55, 0.52],
        },
        tile,
        { wc: [0.7, 0.68, 0.6] },
      ),
    );
    K.room(
      Object.assign(
        {
          x0: -40,
          z0: -36,
          x1: 40,
          z1: -16,
          y: 0,
          h: 6,
          floor: "rubble",
          fc: [0.5, 0.48, 0.44],
          ceil: "concrete",
        },
        tile,
      ),
    );
    K.room({
      x0: 40,
      z0: -24,
      x1: 70,
      z1: -18,
      y: PF,
      h: 3.0,
      floor: "concrete",
      wall: "concrete",
      wc: [0.5, 0.5, 0.46],
      fc: [0.42, 0.42, 0.4],
    });
    const larder = K.room({
      x0: 70,
      z0: -32,
      x1: 90,
      z1: -10,
      y: PF,
      h: 5,
      floor: "concrete",
      wall: "tile_subway",
      wc: [0.55, 0.5, 0.44],
      fc: [0.4, 0.38, 0.35],
      cc: [0.3, 0.3, 0.28],
    });
    K.room({
      x0: -52,
      z0: -24,
      x1: -40,
      z1: -16,
      y: PF,
      h: 3.2,
      floor: "concrete",
      wall: "concrete",
      wc: [0.55, 0.56, 0.5],
      fc: [0.45, 0.45, 0.42],
    });
    K.door(0, 0, 2.4, MZ, 2.6, { exit: true });
    K.door(10, -6, 1.6, MZ, 2.4);
    K.door(-6, -12, 1.2, MZ, 2.2);
    K.door(13, -16, 2.0, PF, 2.6);
    K.door(40, -21, 1.6, PF, 2.4);
    K.door(70, -21, 1.8, PF, 2.4);
    K.door(-40, -20, 1.4, PF, 2.3);
    K.build();
    exitDoor(K, 0, MZ, 2.4, 2.6, {
      mat: "metal_painted",
      c: [0.3, 0.4, 0.32],
      glass: false,
    });
    // station end walls (x = ±40) above the tunnel mouths, the tunnel mouths themselves and their cave-ins
    for (const sd of [-1, 1]) {
      const x = sd * 40;
      // the black mouth of the tunnel over the track bed (the end wall behind it is solid)
      M.quad(
        K.b("glass_dirty"),
        [x - sd * 0.12, 0, -26.1],
        [x - sd * 0.12, 0, -35.8],
        [x - sd * 0.12, 4.2, -35.8],
        [x - sd * 0.12, 4.2, -26.1],
        [-sd, 0, 0],
        [0, 0, 1, 0, 1, 1, 0, 1],
        [0.02, 0.02, 0.02],
      );
      K.beam(
        "concrete",
        x - sd * 0.2,
        4.35,
        -35.9,
        x - sd * 0.2,
        4.35,
        -26,
        0.3,
        0.3,
        { c: [0.45, 0.44, 0.42] },
      );
      for (let k = 0; k < 10; k++)
        K.obox(
          r() < 0.5 ? "concrete" : "rubble",
          x - sd * r.range(0.5, 3),
          r.range(0.3, 2.5),
          r.range(-35.5, -26.5),
          r.range(1, 2.4),
          r.range(0.6, 1.4),
          r.range(1, 2),
          r() * 6,
          {
            pitch: r.range(-0.6, 0.6),
            roll: r.range(-0.6, 0.6),
            c: [0.5, 0.48, 0.45],
          },
        );
      K.col(
        Math.min(x, x - sd * 3.5),
        0,
        -36,
        Math.max(x, x - sd * 3.5),
        1.4,
        -26,
        { tag: "rubble", surface: "rubble" },
      );
    }

    // ---- mezzanine ----
    K.box(
      "metal_painted",
      -8,
      MZ,
      -6,
      -4.5,
      MZ + 1.1,
      -3.5,
      [0.35, 0.45, 0.4],
      1,
    );
    K.box(
      "glass_dirty",
      -8,
      MZ + 1.1,
      -6,
      -4.5,
      MZ + 2.3,
      -3.5,
      [0.45, 0.5, 0.48],
      1,
    );
    K.box(
      "metal_painted",
      -8.1,
      MZ + 2.3,
      -6.1,
      -4.4,
      MZ + 2.5,
      -3.4,
      [0.3, 0.35, 0.32],
      1,
    );
    K.col(-8, MZ, -6, -4.5, MZ + 2.5, -3.5, { surface: "metal" });
    for (let x = -3.5; x <= 8.5; x += 1.3) {
      if (Math.abs(x - 1.7) < 0.7 || Math.abs(x - 5.6) < 0.7) continue;
      K.box(
        "chrome",
        x - 0.22,
        MZ,
        -8.3,
        x + 0.22,
        MZ + 0.95,
        -7.9,
        [0.6, 0.6, 0.58],
        1,
      );
      K.col(x - 0.22, MZ, -8.3, x + 0.22, MZ + 0.95, -7.9, {
        surface: "metal",
      });
    }
    K.sign("FULTON ST", 0, MZ + 2.7, -11.85, 0, 1, 3);
    K.sign("DOWNTOWN", 9.85, MZ + 2.6, -3, -1, 0, 2);
    K.poster("fizzo_cola", -9.85, MZ + 1.6, -8.5, 1, 0, 2.2, 1.1);
    K.poster("super_sergeant", 6, MZ + 1.6, -0.15, 0, -1, 2.2, 1.1);
    for (const [x, z] of [
      [-5, -9],
      [5, -3],
      [0, -9],
    ])
      K.light(r() < 0.3 ? "dead" : "tube", x, MZ + 3.4, z, {
        floor: MZ,
        flicker: r() < 0.4,
      });
    K.litter(-10, -12, 10, 0, MZ, 18);
    K.decal(3, MZ + 0.014, -10, 2, 3, 0.4, M.MARK.BLOOD);
    K.loot("cash_register", -6.2, MZ + 1.1, -3.9, 0, {
      loot: "cash_register",
      name: "Token Booth Drawer",
    });
    // station restroom
    K.stalls(-9.6, -2.4, -16, 1, MZ, 3);
    K.light("dead", -6, MZ + 3.0, -14, {});
    K.skel(-3.4, MZ, -13, -HP, "curled");
    K.loot("first_aid", -2.15, MZ + 1.3, -13.6, HP, { loot: "first_aid" });

    // ---- stair down to the platform ----
    K.landing(10, -7.5, 16, -4.5, MZ, {
      rails: [
        [10, -4.5, 16, -4.5],
        [13.4, -7.5, 16, -7.5],
      ],
    });
    K.stairs(10.1, 13.4, -7.5, -13.5, MZ, PF, "z", {
      rail: "hi",
      mat: "concrete",
    });
    K.light("cage", 15.8, 5.2, -11, { nx: -1, nz: 0, floor: PF });
    K.sign("DOWNTOWN", 13, PF + 3.0, -15.85, 0, 1, 1.8);

    // ---- platform & track bed ----
    K.box("concrete", -40, 0, -26, 40, PF, -16, [0.6, 0.58, 0.54], 3, 0);
    K.col(-40, 0, -26, 40, PF, -16, { tag: "floor", surface: "concrete" });
    K.box(
      "cryo_orange",
      -40,
      PF,
      -26,
      40,
      PF + 0.01,
      -25.4,
      [0.9, 0.85, 0.6],
      2,
    );
    for (const rz of [-31.7, -30.3])
      K.box(
        "rust",
        -40,
        0.12,
        rz - 0.04,
        40,
        0.28,
        rz + 0.04,
        [0.75, 0.62, 0.5],
        2,
      );
    K.box(
      "wood_rotten",
      -40,
      0,
      -32.2,
      40,
      0.12,
      -29.8,
      [0.45, 0.38, 0.3],
      1.2,
    );
    K.box(
      "metal_painted",
      -40,
      0.2,
      -28.6,
      40,
      0.38,
      -28.45,
      [0.35, 0.33, 0.3],
      2,
    );
    for (let x = -36; x <= 36; x += 6) {
      column(K, x, PF, -24.2, 6 - PF, { c: [0.25, 0.3, 0.26] });
    }
    // a derailed train car on the track, doors burst, blocking half the bed
    const car = M.mtx(-12, 0.2, -31, HP + 0.08, 0, 0.14);
    M.pushXF(car);
    M.box(K.b("corrugated"), -1.5, 0.3, -8, 1.5, 3.4, 8, {
      s: 2,
      c: [0.72, 0.74, 0.76],
    });
    M.box(K.b("glass_dirty"), -1.52, 1.9, -7.5, 1.52, 2.7, 7.5, {
      s: 2,
      c: [0.1, 0.1, 0.1],
      skip: 4 + 8,
    });
    M.box(K.b("paint_red"), -1.53, 1.6, -8, 1.53, 1.75, 8, {
      s: 1,
      c: [0.6, 0.18, 0.15],
      skip: 4 + 8,
    });
    M.popXF();
    K.ocol(-12, -31, 16.2, 3.2, 0, 3.6, HP + 0.08, {
      tag: "debris",
      surface: "metal",
    });
    // benches, trash cans, direction signs, Brute barricades
    for (const x of [-30, -20, 22, 32]) {
      K.box(
        "wood_planks",
        x - 1.2,
        PF + 0.42,
        -21.5,
        x + 1.2,
        PF + 0.47,
        -20.5,
        [0.55, 0.42, 0.3],
        1,
      );
      K.col(x - 1.2, PF, -21.5, x + 1.2, PF + 0.5, -20.5, { surface: "wood" });
    }
    for (let i = 0; i < 3; i++) {
      const x = r.range(-20, 20);
      K.crate(x, PF, -19 + r.range(-1, 1), r() * 3, 1.0);
    }
    for (let x = -34; x <= 34; x += 12)
      K.sign(x < 0 ? "UPTOWN" : "DOWNTOWN", x, 4.4, -24.2, 0, 1, 2.2);
    for (let x = -30; x <= 30; x += 10)
      K.light(r() < 0.35 ? "dead" : "tube", x, 6, -21, {
        floor: PF,
        flicker: r() < 0.3,
        real: x === 0,
      });
    for (let x = -34; x <= 34; x += 17)
      K.light("cage", x, 3.6, -35.8, { nx: 0, nz: 1, floor: 0 });
    K.litter(-40, -26, 40, -16, PF, 30, {
      cells: [
        M.MARK.LITTER,
        M.MARK.STAIN,
        M.MARK.DIRT,
        M.MARK.BLOOD,
        M.MARK.CRACKS,
      ],
    });
    for (let i = 0; i < 14; i++)
      K.decal(
        r.range(-38, 38),
        0.013,
        r.range(-35, -27),
        r.range(1, 2.5),
        r.range(1, 2.5),
        r() * 6,
        r.pick([M.MARK.PUDDLE, M.MARK.LITTER, M.MARK.STAIN]),
      );
    K.skel(-26, PF, -18, 0.4, "lying");
    K.skel(8, 0, -33, 2.2, "reaching");
    K.loot("trash_can", 18, PF, -17.2, 0, { loot: "trash_can" });
    K.anchor("spawn1", -10, PF, -21);
    K.anchor("spawn2", 20, PF, -20);
    K.anchor("spawn3", 4, 0, -31);

    // ---- maintenance tunnel east ----
    K.grate(40, -21.5, 70, -20.5, PF);
    K.pipeRun(
      [
        [40, PF + 2.5, -23.6],
        [70, PF + 2.5, -23.6],
      ],
      0.16,
    );
    K.pipeRun(
      [
        [40, PF + 2.0, -23.7],
        [70, PF + 2.0, -23.7],
      ],
      0.06,
      { mat: "metal_painted", c: [0.5, 0.2, 0.15] },
    );
    for (const x of [48, 62])
      K.light("cage", x, PF + 2.3, -18.2, { nx: 0, nz: -1, floor: PF });
    for (let i = 0; i < 5; i++)
      K.decal(
        r.range(41, 69),
        PF + 0.013,
        r.range(-23, -19),
        1.2,
        1,
        r() * 6,
        r.pick([M.MARK.PUDDLE, M.MARK.BLOOD]),
      );
    K.sign("DANGER — HIGH VOLTAGE", 40.2, PF + 2.5, -19, 1, 0, 1.6);
    K.anchor("spawn4", 55, PF, -21);

    // ---- the larder (boss room: old traction substation) ----
    for (let i = 0; i < 12; i++)
      K.meatSack(r.range(72, 88), PF + 5, r.range(-30, -12));
    K.cage(74, PF, -29, 2.0);
    K.cage(77, PF, -29, 2.0);
    K.skel(74, PF, -29, 0.5, "curled");
    K.box("fabric", 84, PF, -14, 87, PF + 0.3, -11.5, [0.35, 0.3, 0.22], 0.5);
    K.box("fabric", 80, PF, -12.2, 83, PF + 0.3, -10.4, [0.3, 0.28, 0.2], 0.5);
    K.barrel(80, PF, -21, { fire: true });
    K.barrel(86, PF, -27, {});
    for (let i = 0; i < 4; i++)
      K.rubbleMound(
        r.range(76, 88),
        PF,
        r.range(-30, -14),
        r.range(0.8, 1.4),
        0.4,
      ); // bone piles
    K.box(
      "metal_painted",
      86.5,
      PF,
      -31.5,
      89.8,
      PF + 3,
      -29,
      [0.3, 0.32, 0.3],
      1,
    );
    K.col(86.5, PF, -31.5, 89.8, PF + 3, -29, { surface: "metal" });
    K.sign("DANGER — HIGH VOLTAGE", 88, PF + 3.4, -28.9, 0, 1, 1.6);
    K.light("cage", 70.2, PF + 3.5, -14, {
      nx: 1,
      nz: 0,
      floor: PF,
      real: true,
    });
    K.light("red", 89.8, PF + 3.5, -20, { nx: -1, nz: 0, floor: PF });
    K.litter(70, -32, 90, -10, PF, 26, {
      cells: [
        M.MARK.BLOOD,
        M.MARK.BLOOD,
        M.MARK.DIRT,
        M.MARK.STAIN,
        M.MARK.LITTER,
      ],
    });
    K.scrawl(89.8, PF + 2, -16, -1, 0, 3);
    K.loot("footlocker", 88.5, PF, -12.5, HP, {
      loot: "brute",
      name: "Brute Stash",
    });
    K.loot("ammo_box", 72, PF, -11, -HP, { loot: "ammo_box", large: true });
    K.loot("crate", 88.5, PF, -24, HP, {
      loot: "weapon_crate",
      kind: "military",
      lock: lockSpec({
        id: "map_dng_metro_crate",
        label: "Fulton Street — the Covenant scouts' gear crate",
        code: "0709",
        hint: "Acolyte Paulson's field notebook, by the cages.",
      }),
    });
    K.note("dng_note_paulson", 74.9, PF, -27.9, {
      name: "Field Notebook — Paulson",
      title: "Iron Covenant field notebook — Acolyte J. Paulson (pencil)",
      text: 'Day 3 in the pen. They feed us the ones who stop moving. Acolyte Carr stopped moving yesterday.\n\nThe big one — they call him "Conductor" — keeps saying the trains will run again when the station is "full." I think he means full of us.\n\nThey threw our gear crate by the transformer. The padlock is Carr\'s birthday, 0-7-0-9. Whoever reads this: take it, use it on them.\n\nIf Rockefeller gets this: the Brutes come up through the Fulton St. stairs at night. Seal it. Don\'t send another two-man team. Send the Lancers or send nobody.\n\nSteel keeps.',
      learn: "map_dng_metro_crate",
    });
    K.anchor("spawn5", 80, PF, -15);
    K.anchor("spawn6", 82, PF, -25);
    K.anchor("boss", 82, PF, -25);

    // ---- signal room west ----
    for (let x = -50.5; x < -42; x += 1.4) {
      K.box(
        "metal_painted",
        x - 0.6,
        PF,
        -23.6,
        x + 0.6,
        PF + 2.1,
        -23,
        [0.35, 0.38, 0.34],
        1,
      );
      for (let y = 0.5; y < 2; y += 0.35)
        K.box(
          K.r() < 0.3 ? "neon_red@lampr" : "glass_dirty",
          x - 0.3,
          PF + y,
          -23.02,
          x - 0.2,
          PF + y + 0.08,
          -22.98,
          [0.3, 0.3, 0.3],
          1,
        );
    }
    K.col(-51.2, PF, -23.6, -41.5, PF + 2.1, -23, { surface: "metal" });
    const top = K.desk(-47, PF, -17.3, PI, { w: 1.6 });
    K.note("dng_note_signal_card", -46.4, top, -17.5, {
      name: "Signalman's Shift Card",
      title: "N.Y.C. TRANSIT AUTHORITY — SIGNAL DIV. SHIFT CARD",
      text: "Tower: FULTON ST.   Shift: 4 P.M. – 12 A.M.\nSignalman: T. Okafor\n\nTeletype sign-on (changes 1st of month): BOWLINGGREEN\nDo not leave this card at the desk.\n\n(on the back:)\nLeft it at the desk. Sorry Sal.",
      learn: "map_dng_metro_term",
    });
    K.terminal("dng_term_metro", -47.3, top, -17.2, 0, {
      title: "TRANSIT AUTHORITY SIGNAL MAINTENANCE — FULTON ST",
      header:
        "GOTHAM BUSINESS MACHINES — MODEL 33 TELETYPE\n-Transit Signal Division-",
      lock: lockSpec({
        id: "map_dng_metro_term",
        label: "Fulton Street — signal room teletype",
        passcode: "BOWLINGGREEN",
        hint: "The signalman's shift card on the desk.",
      }),
      entries: [
        {
          title: "Incident 03/05/67",
          text: "All trains held at stations per Civil Defense Order 7. Passengers instructed to remain on platforms (SHELTER CAPACITY: 300).\nTunnel doors sealed 09:52.",
        },
        {
          title: "Incident 03/11/67",
          text: "Water from the East River in the south tunnel. Pumps offline. Platform population now approx. 120.\nSomeone has started a fire in the substation. Nobody will say what they are cooking.",
        },
        {
          title: "Incident 03/02/89 (auto-log)",
          text: "MOTION DETECTED: SUBSTATION. MOTION DETECTED: SUBSTATION. MOTION DETECTED: SUBSTATION.\n[log buffer full]",
        },
      ],
    });
    K.lockers(-45, PF, -16.4, 0, 3);
    K.light("bulb", -46, PF + 3.2, -20, { floor: PF, real: true });
    K.loot("toolbox", -51.3, PF, -18, -HP, { loot: "toolbox" });
    K.loot("locker", -43.2, PF, -16.5, 0, { loot: "locker" });
    K.anchor("arrival", 0, MZ, -2.2, 0);
    K.anchor("exit", 0, MZ + 1.2, -0.5, 0);
    void larder;
  }

  // ===================================================================
  // 5. Big Apple Food Fair — raiders in a supermarket
  // ===================================================================
  function buildMarket(K) {
    const r = K.r;
    K.room({
      x0: -4,
      z0: -4,
      x1: 4,
      z1: 0,
      h: 3.4,
      floor: "tile_floor",
      wall: "brick_tan",
      wc: [0.78, 0.72, 0.62],
      fc: [0.7, 0.68, 0.64],
    });
    const floor = K.room({
      x0: -24,
      z0: -40,
      x1: 24,
      z1: -4,
      h: 5,
      floor: "tile_floor",
      wall: "plaster_stained",
      ceil: "metal_panel",
      wc: [0.78, 0.76, 0.66],
      fc: [0.72, 0.7, 0.66],
      cc: [0.5, 0.5, 0.48],
      hole: { x0: -6, z0: -26, x1: 2, z1: -18 },
    });
    K.room({
      x0: -24,
      z0: -52,
      x1: -10,
      z1: -40,
      h: 3.4,
      floor: "tile_floor",
      wall: "plaster_stained",
      wc: [0.75, 0.8, 0.76],
      fc: [0.72, 0.72, 0.7],
    });
    K.room({
      x0: -10,
      z0: -52,
      x1: 0,
      z1: -40,
      h: 3.2,
      floor: "carpet",
      wall: "wallpaper",
      wain: "wood_planks",
      wainC: [0.4, 0.3, 0.22],
      wc: [0.62, 0.58, 0.48],
      fc: [0.3, 0.35, 0.28],
      surface: "carpet",
    });
    K.room({
      x0: 0,
      z0: -52,
      x1: 8,
      z1: -40,
      h: 3.2,
      floor: "tile_floor",
      wall: "tile_subway",
      wc: [0.78, 0.8, 0.76],
      fc: [0.75, 0.75, 0.72],
    });
    K.room({
      x0: 8,
      z0: -60,
      x1: 24,
      z1: -40,
      h: 5.5,
      floor: "concrete",
      wall: "brick_tan",
      wc: [0.62, 0.58, 0.5],
      fc: [0.5, 0.5, 0.47],
      cc: [0.4, 0.4, 0.38],
    });
    K.room({
      x0: 24,
      z0: -56,
      x1: 32,
      z1: -44,
      h: 3.0,
      floor: "metal_diamond",
      wall: "metal_panel",
      ceil: "metal_panel",
      wc: [0.7, 0.74, 0.76],
      fc: [0.55, 0.56, 0.56],
      surface: "metal",
    });
    K.door(0, 0, 2.4, 0, 2.6, { exit: true });
    K.door(0, -4, 2.4, 0, 2.6);
    K.door(-17, -40, 1.8, 0, 2.4);
    K.door(-5, -40, 1.1, 0, 2.2);
    K.door(1.2, -40, 1.1, 0, 2.2);
    K.door(16, -40, 3.0, 0, 3.0);
    K.door(24, -50, 1.3, 0, 2.3);
    K.build();
    exitDoor(K, 0, 0, 2.4, 2.6, { mat: "metal_painted", c: [0.5, 0.52, 0.5] });

    // ---- vestibule ----
    for (let i = 0; i < 4; i++) {
      const x = -3.3 + i * 0.25;
      K.obox("chrome", x, 0.5, -2.5, 0.55, 0.9, 0.9, 0.05 * i, {
        c: [0.6, 0.6, 0.58],
        s: 1,
      });
    }
    K.col(-3.6, 0, -3, -2.2, 1, -2, { surface: "metal" });
    K.poster("freedom_flakes", 3.85, 1.7, -2, -1, 0, 1.6, 0.8);
    K.light("dead", 0, 3.4, -2, {});

    // ---- sales floor ----
    K.sign("BIG APPLE FOOD FAIR", 0, 4.2, -4.15, 0, -1, 5);
    // checkout lanes
    for (const x of [-15, -9, 9, 15]) {
      K.counter(x - 0.5, -10.5, x + 0.5, -7.5, 0, {
        h: 0.9,
        mat: "metal_painted",
        c: [0.62, 0.3, 0.25],
        top: "metal_panel",
        topC: [0.6, 0.6, 0.58],
      });
      K.box(
        "metal_painted",
        x - 0.35,
        0.9,
        -8.2,
        x + 0.35,
        1.2,
        -7.7,
        [0.5, 0.45, 0.35],
        1,
      );
      K.pipe("metal_painted", x + 0.5, 0, -10.4, x + 0.5, 2.2, -10.4, 0.03, 4, {
        c: [0.3, 0.3, 0.3],
      });
      K.box(
        "glass_dirty",
        x + 0.3,
        2.2,
        -10.6,
        x + 0.7,
        2.6,
        -10.2,
        [0.2, 0.25, 0.2],
        1,
      );
    }
    K.sign("CHECKOUT", -12, 3.2, -9, 0, -1, 1.8);
    K.sign("CHECKOUT", 12, 3.2, -9, 0, -1, 1.8);
    // aisles
    const aisleX = [-18, -11, -4, 3, 10, 17];
    for (const x of aisleX) {
      for (const side of [-0.28, 0.28])
        K.shelf(
          x + side,
          0,
          -24,
          HP + (side > 0 ? PI : 0),
          17,
          r.pick(["cans", "boxes", "bottles", "cans"]),
          {
            h: 2.1,
            d: 0.55,
            levels: 4,
            collapsed: r() < 0.2,
            back: side < 0,
            c: [0.55, 0.55, 0.52],
          },
        );
    }
    K.sign("AISLE 3", -4, 3.4, -15, 0, -1, 1.2);
    K.sign("AISLE 4", 3, 3.4, -15, 0, -1, 1.2);
    K.sign("CANNED GOODS", -11, 3.4, -15, 0, -1, 1.6);
    // freezer cases along the east wall, produce bins along the west
    for (let z = -37; z < -12; z += 3.2) {
      K.box(
        "metal_painted",
        22.6,
        0,
        z,
        23.9,
        1.9,
        z + 3,
        [0.72, 0.74, 0.74],
        1,
      );
      K.box(
        "glass_dirty",
        22.58,
        0.3,
        z + 0.2,
        22.6,
        1.7,
        z + 2.8,
        [0.18, 0.22, 0.24],
        1,
      );
      K.col(22.6, 0, z, 23.9, 1.9, z + 3, { surface: "metal" });
    }
    K.sign("FROZEN FOODS", 23.8, 2.7, -24, -1, 0, 2.0);
    for (let z = -36; z < -14; z += 4) {
      K.obox("wood_planks", -22.8, 0.45, z + 1.5, 1.6, 0.9, 3.2, 0, {
        pitch: 0,
        c: [0.55, 0.45, 0.32],
        s: 1,
      });
      K.box(
        "dirt",
        -23.5,
        0.9,
        z + 0.1,
        -22.1,
        0.98,
        z + 2.9,
        [0.35, 0.3, 0.22],
        1,
      );
      K.col(-23.6, 0, z, -22, 0.95, z + 3.1, { surface: "wood" });
    }
    K.sign("PRODUCE", -23.8, 2.6, -24, 1, 0, 1.6);
    // the raiders' fort at the checkout: crate walls and a burning barrel
    for (let i = 0; i < 5; i++)
      K.crate(-3 + i * 1.1, 0, -12.2, r.range(-0.2, 0.2), 1.0);
    K.crate(-2.4, 1.0, -12.2, 0.3, 0.8, { collide: false });
    K.barrel(0, 0, -14, { fire: true });
    for (let i = 0; i < 6; i++) {
      const x = r.range(-20, 20),
        z = r.range(-36, -12);
      K.obox("chrome", x, 0.5, z, 0.55, 0.9, 0.9, r() * 6, {
        roll: r() < 0.3 ? 1.4 : 0,
        c: [0.55, 0.55, 0.52],
        s: 1,
      });
    }
    for (let x = -18; x <= 18; x += 9)
      for (const z of [-12, -34])
        K.light(r() < 0.3 ? "dead" : "tubes2", x, 5, z, {
          floor: 0,
          drop: 0.6,
          flicker: r() < 0.3,
          real: x === 0 && z === -34,
        });
    K.litter(-24, -40, 24, -4, 0, 44, {
      tiles: false,
      cells: [
        M.MARK.LITTER,
        M.MARK.LITTER,
        M.MARK.DIRT,
        M.MARK.STAIN,
        M.MARK.GRIME,
        M.MARK.BLOOD,
      ],
    });
    K.skel(-8, 0, -30.2, 0.6, "reaching");
    K.skel(12.5, 0, -8.8, 2, "lying");
    K.loot("cash_register", -15, 0.9, -8.9, PI, { loot: "cash_register" });
    K.loot("cash_register", 9, 0.9, -8.9, PI, { loot: "cash_register" });
    K.loot("first_aid", 23.85, 1.3, -6.5, HP, { loot: "first_aid" });
    K.loot("fizzo_machine", -23.3, 0, -6, -HP, { loot: "fizzo_machine" });
    K.loot("footlocker", 1.2, 0, -13.3, 0, { loot: "raider_stash" });
    K.anchor("spawn1", -7.5, 0, -24);
    K.anchor("spawn2", 13.5, 0, -30);
    K.anchor("spawn3", 1, 0, -16);

    // ---- pharmacy (boss) ----
    K.counter(-23.9, -44.8, -19, -44, 0, {
      h: 1.05,
      c: [0.8, 0.8, 0.78],
      top: "tile_floor",
      topC: [0.8, 0.8, 0.76],
    });
    K.counter(-15, -44.8, -10.1, -44, 0, {
      h: 1.05,
      c: [0.8, 0.8, 0.78],
      top: "tile_floor",
      topC: [0.8, 0.8, 0.76],
    });
    K.sign("PHARMACY", -17, 3.0, -40.15, 0, -1, 2.2);
    for (const x of [-22, -18.5, -14.8, -11.6])
      K.shelf(x, 0, -51.5, PI, 3, "bottles", {
        h: 2.2,
        d: 0.4,
        levels: 5,
        c: [0.7, 0.72, 0.7],
      });
    K.box(
      "fabric",
      -23.5,
      0,
      -49.5,
      -21.5,
      0.25,
      -46.5,
      [0.4, 0.35, 0.28],
      0.5,
    );
    K.table(-16.5, 0, -47.5, 0.2, 1.6, 0.9, { c: [0.45, 0.4, 0.35] });
    K.light("tube", -17, 3.4, -47, { floor: 0, real: true, flicker: true });
    K.litter(-24, -52, -10, -40, 0, 14, {
      cells: [M.MARK.LITTER, M.MARK.STAIN, M.MARK.BLOOD],
    });
    K.loot("safe", -23.2, 0, -51.3, -HP, {
      loot: "safe",
      name: "Narcotics Safe",
      lock: lockSpec({
        id: "map_dng_market_narc_safe",
        label: "Big Apple Food Fair — pharmacy narcotics safe",
        code: "0919",
        hint: "The store manager's teletype.",
      }),
    });
    K.loot("first_aid", -10.2, 1.3, -47, HP, { loot: "medical_cabinet" });
    K.loot("desk", -12.4, 0, -51.4, PI, { loot: "desk" });
    K.anchor("boss", -17, 0, -48.5);
    K.anchor("spawn6", -14, 0, -47);

    // ---- manager's office ----
    const top = K.desk(-5, 0, -49.8, 0, { w: 1.7, wood: true });
    K.chair(-5, 0, -48.9, 0);
    K.terminal("dng_term_market", -4.7, top, -49.9, PI, {
      title: "BIG APPLE FOOD FAIR — STORE 12",
      header:
        "GOTHAM BUSINESS MACHINES — MODEL 33 TELETYPE\n-Store Management-",
      lock: lockSpec({
        id: "map_dng_market_term",
        label: "Big Apple Food Fair — store manager's teletype",
        passcode: "GROCER",
        hint: "Danny Ruiz's note in the walk-in freezer.",
      }),
      entries: [
        {
          title: "Memo: Rationing",
          text: "Effective 2/25: limit TWO (2) cans per customer. Management reserves the right to refuse service to hoarders.\nThe stockroom is CLOSED to the public. That means you, Mrs. Petrakis.",
        },
        {
          title: "Shrinkage Report",
          text: "Q3 losses: 14 cases Golden Plain Jerky, 9 cases Pork n' Beans, 1 cash register (entire), 6 carts.\nSuspect: night stocker D. Ruiz.\n\nUpdate 3/5: Ruiz was locked in the freezer overnight as a lesson. Remember to let Ruiz out in the morning.",
        },
        {
          title: "Safe Combinations",
          text: "OFFICE SAFE (payroll): 0-2-2-5 — the day rationing started, so I remember it.\nPHARMACY NARCOTICS SAFE: 0-9-1-9 — Mr. Haddad has the other copy.\n— R. Grubb, Store Mgr.",
          learn: ["map_dng_market_safe", "map_dng_market_narc_safe"],
        },
        {
          title: "Office Safe — Release",
          text: "The wall safe unlocks.",
          action: () => unlockLoot("dng_market", "wallsafe"),
        },
      ],
    });
    K.loot("safe", -0.28, 1.05, -46, HP, {
      loot: "wall_safe",
      wall: true,
      tag: "wallsafe",
      lock: lockSpec({
        id: "map_dng_market_safe",
        label: "Big Apple Food Fair — manager's wall safe",
        code: "0225",
        hint: "The store manager's teletype.",
      }),
    });
    K.fileCabinet(-9.4, 0, -51.4, PI, {});
    K.loot("file_cabinet", -8.8, 0, -51.4, PI, { loot: "file_cabinet" });
    K.poster("mama_marinara", -5, 2.0, -40.12, 0, -1, 1.4, 0.7);
    K.light("bulb", -5, 3.2, -46, { floor: 0 });

    // ---- restroom ----
    K.stalls(0.5, 7.6, -52, 1, 0, 3);
    K.sinks(3.5, 7.5, -40, -1, 0);
    K.light("tube", 4, 3.2, -46, { floor: 0, flicker: true });
    K.litter(0, -52, 8, -40, 0, 6, { cells: [M.MARK.STAIN, M.MARK.PUDDLE] });

    // ---- stockroom ----
    for (let x = 10.5; x < 22; x += 4)
      for (let z = -57.5; z < -44; z += 4.5)
        if (r() < 0.8)
          K.pallet(x + r.range(-0.3, 0.3), 0, z, r.range(-0.3, 0.3), {});
    K.shelf(23.4, 0, -56, HP, 7, "boxes", {
      h: 3.2,
      d: 0.9,
      levels: 4,
      c: [0.5, 0.3, 0.2],
    });
    K.plate(
      "corrugated",
      16,
      1.8,
      -59.9,
      0,
      1,
      4.2,
      3.6,
      null,
      [0.6, 0.58, 0.5],
    );
    K.light("cage", 8.2, 3.5, -50, { nx: 1, nz: 0, floor: 0 });
    K.light("dead", 16, 5.5, -50, {});
    K.light("bulb", 18, 5.5, -45, { floor: 0 });
    K.litter(8, -60, 24, -40, 0, 16);
    K.loot("crate", 11, 0, -59, PI, {
      loot: "food_oldworld",
      kind: "plain",
      name: "Crate of Groceries",
    });
    K.loot("crate", 20.5, 0, -41.5, 0, { loot: "crate" });
    K.loot("ammo_box", 12.8, 0.14, -44.6, 0.4, { loot: "ammo_box" });
    K.anchor("spawn4", 14, 0, -51);
    K.anchor("spawn5", 20, 0, -46);

    // ---- walk-in freezer ----
    for (let x = 26; x < 31.5; x += 1.4)
      for (const z of [-54, -46]) {
        const len = K.r.range(1.1, 1.6);
        K.pipe("rust", x, 3.0, z, x, 2.4, z, 0.012, 3, { c: [0.4, 0.4, 0.4] });
        K.cyl("fabric", x, 2.4 - len, z, 0.2, 0.28, len, 8, {
          capTop: true,
          c: [0.62, 0.55, 0.52],
        });
      }
    K.light("dead", 28, 3.0, -50, {});
    K.light("red", 31.8, 2.4, -50, { nx: -1, nz: 0, floor: 0 });
    K.skel(30.6, 0, -49.8, -HP, "curled");
    K.note("dng_note_ruiz", 30.2, 0, -48.9, {
      name: "Note scratched on a price tag",
      title: "Price tag, reverse side",
      text: 'Its Danny Ruiz. They locked me in for the night for "shrinkage." I heard the sirens at 9. I heard the whole building shake. Nobody came.\n\nIts warm now. The compressor died. The meat is going bad.\n\nI never stole anything. I gave the cans to Mrs. Petrakis. She has four kids.\n\nIf you find this you can have my paycheck. Its in the managers safe. Grubb keeps the combinations in his teletype and the word is GROCER, he says it out loud every time he types it.',
      learn: "map_dng_market_term",
    });
    K.loot("fridge", 25, 0, -44.7, 0, {
      loot: "fridge",
      name: "Freezer Chest",
    });
    K.anchor("arrival", 0, 0, -1.8, 0);
    K.anchor("exit", 0, 1.2, -0.5, 0);
    void floor;
  }

  // ===================================================================
  // 6. Pumping Station No. 4 — Shellbacks nest in the flooded pump hall
  // ===================================================================
  function buildPump(K) {
    const r = K.r;
    K.room({
      x0: -7,
      z0: -9,
      x1: 7,
      z1: 0,
      h: 3.4,
      floor: "tile_floor",
      wall: "tile_subway",
      wc: [0.74, 0.78, 0.72],
      fc: [0.62, 0.62, 0.6],
    });
    K.room({
      x0: -1.5,
      z0: -20,
      x1: 1.5,
      z1: -9,
      h: 3.2,
      floor: "concrete",
      wall: "concrete_panel",
      wc: [0.55, 0.6, 0.55],
      fc: [0.5, 0.5, 0.48],
    });
    const hall = K.room({
      x0: -18,
      z0: -50,
      x1: 18,
      z1: -20,
      h: 10,
      floor: "concrete",
      wall: "brick_red@emis",
      ceil: "concrete",
      wc: [0.85, 0.7, 0.62],
      fc: [0.55, 0.55, 0.52],
      cc: [0.4, 0.38, 0.36],
    });
    K.room({
      x0: 18,
      z0: -36,
      x1: 50,
      z1: -32,
      h: 3.0,
      floor: "concrete",
      wall: "concrete",
      wc: [0.5, 0.52, 0.48],
      fc: [0.4, 0.4, 0.38],
    });
    K.room({
      x0: 50,
      z0: -42,
      x1: 62,
      z1: -26,
      h: 3.6,
      floor: "concrete",
      wall: "brick_red",
      wc: [0.6, 0.52, 0.46],
      fc: [0.46, 0.45, 0.42],
    });
    K.room({
      x0: -30,
      z0: -32,
      x1: -18,
      z1: -24,
      h: 3.2,
      floor: "tile_floor",
      wall: "tile_subway",
      wc: [0.72, 0.76, 0.7],
      fc: [0.62, 0.62, 0.6],
    });
    K.room({
      x0: -30,
      z0: -44,
      x1: -18,
      z1: -32,
      h: 3.2,
      floor: "wood_planks",
      wall: "plaster_stained",
      wain: "wood_planks",
      wainC: [0.4, 0.3, 0.22],
      wc: [0.6, 0.62, 0.55],
      fc: [0.52, 0.44, 0.34],
      surface: "wood",
    });
    K.door(0, 0, 1.8, 0, 2.5, { exit: true });
    K.door(0, -9, 1.4, 0, 2.3);
    K.door(0, -20, 2.0, 0, 2.8);
    K.door(18, -34, 1.4, 0, 2.3);
    K.door(50, -34, 1.4, 0, 2.3);
    K.door(-18, -28, 1.2, 0, 2.3);
    K.door(-18, -38, 1.2, 0, 2.3);
    K.build();
    exitDoor(K, 0, 0, 1.8, 2.5, {
      mat: "metal_painted",
      c: [0.35, 0.42, 0.38],
      glass: false,
    });

    // ---- control room ----
    for (const [x0, x1, wz, nz] of [
      [-6.8, -2, -8.6, 1],
      [2, 6.8, -8.6, 1],
    ]) {
      K.box(
        "metal_painted",
        x0,
        0,
        wz - 0.3 * nz,
        x1,
        1.1,
        wz + 0.5 * nz,
        [0.4, 0.5, 0.45],
        1,
      );
      K.box(
        "metal_painted",
        x0,
        1.1,
        wz - 0.3 * nz,
        x1,
        2.4,
        wz + 0.1 * nz,
        [0.38, 0.47, 0.43],
        1,
      );
      K.col(
        Math.min(x0, x1),
        0,
        Math.min(wz - 0.3 * nz, wz + 0.5 * nz),
        Math.max(x0, x1),
        1.1,
        Math.max(wz - 0.3 * nz, wz + 0.5 * nz),
        { surface: "metal" },
      );
      for (let x = x0 + 0.3; x < x1 - 0.2; x += 0.5) {
        K.cyl("chrome", x, 1.7, wz + 0.11 * nz, 0.13, 0.13, 0.03, 8, {
          c: [0.75, 0.72, 0.62],
        });
        K.box(
          r() < 0.3
            ? "neon_red@lampr"
            : r() < 0.5
              ? "neon_green@lampg"
              : "glass_dirty",
          x - 0.05,
          1.25,
          wz + 0.1 * nz,
          x + 0.05,
          1.32,
          wz + 0.13 * nz,
          [0.3, 0.3, 0.3],
          1,
        );
      }
    }
    K.sign("PUMPING STATION No. 4", 0, 2.8, -0.15, 0, -1, 3.2);
    const top = K.desk(-4.5, 0, -3.5, PI * 0.5, { w: 1.6 });
    K.chair(-3.6, 0, -3.5, HP, {});
    K.terminal("dng_term_pump", -4.2, top, -3.5, -HP, {
      title: "NYC DEPT. OF WATER — PUMPING STATION No. 4",
      header:
        "GOTHAM BUSINESS MACHINES — MODEL 33 TELETYPE\n-Municipal Utilities Line-",
      lock: lockSpec({
        id: "map_dng_pump_term",
        label: "Pumping Station No. 4 — control room teletype",
        passcode: "WETWELL",
        hint: "Walt's crossword, in the foreman's office.",
      }),
      entries: [
        {
          title: "Pump Status",
          text: "PUMP 1: OFFLINE\nPUMP 2: OFFLINE\nPUMP 3: OFFLINE (IMPELLER OBSTRUCTED — ORGANIC)\nWET WELL LEVEL: 103%\nHALL FLOOD ALARM: ACTIVE (SILENCED 1968.03.11)",
        },
        {
          title: "Foreman's Log — March 1968",
          text: "Five months since. Still pumping by hand to keep the Navy Yard basements dry, God knows why.\nSomething big is living in the wet well. It laid eggs in Pump 3. Whitey says they are crabs. Crabs don't have faces, Whitey.",
        },
        {
          title: "Foreman's Log — April 1968",
          text: "Whitey is gone. I have locked myself in the office. The workshop key is on my desk. The shotgun shells are in the workshop.\nIf the big one gets in here, at least I finished the crossword.",
        },
        {
          title: "Office Safe",
          text: "Payroll safe in the foreman's office. Combination is the day we silenced the flood alarm: 0-3-1-1.\nThere is no payroll. There is a bottle. — W.K.",
          learn: "map_dng_pump_safe",
        },
      ],
    });
    K.lockers(5.5, 0, -0.6, 0, 3);
    K.light("tube", 0, 3.4, -4.5, { floor: 0, real: true, flicker: true });
    K.litter(-7, -9, 7, 0, 0, 10);
    K.loot("locker", 6.5, 0, -5, HP, { loot: "locker" });

    // ---- corridor ----
    K.pipeRun(
      [
        [1.3, 2.9, -9],
        [1.3, 2.9, -20],
      ],
      0.1,
    );
    K.light("cage", -1.3, 2.4, -15, { nx: 1, nz: 0, floor: 0 });
    for (let i = 0; i < 4; i++)
      K.decal(
        r.range(-1, 1),
        0.013,
        r.range(-19, -10),
        1,
        1.4,
        r() * 6,
        M.MARK.PUDDLE,
      );

    // ---- pump hall (boss) ----
    K.water(-17.9, -49.9, 17.9, -21.5, 0.07);
    for (const x of [-9, 0, 9]) K.pump(x - 2, 0, -36, 1.2);
    for (let z = -48; z <= -24; z += 6)
      K.beam("rust", -18, 9.2, z, 18, 9.2, z, 0.35, 0.6, {
        c: [0.45, 0.38, 0.32],
      });
    // gantry crane on rails with a hook
    K.beam("rust", -17.5, 8.4, -44, 17.5, 8.4, -44, 0.5, 0.8, {
      c: [0.7, 0.55, 0.2],
    });
    K.beam("rust", -17.5, 8.4, -28, 17.5, 8.4, -28, 0.5, 0.8, {
      c: [0.7, 0.55, 0.2],
    });
    K.beam("rust", 4, 8.0, -44, 4, 8.0, -28, 0.6, 0.6, { c: [0.7, 0.55, 0.2] });
    K.pipe("rust", 4, 7.7, -38, 4, 3.5, -38, 0.02, 3, { c: [0.3, 0.3, 0.3] });
    K.obox("rust", 4, 3.3, -38, 0.3, 0.5, 0.15, 0, { c: [0.4, 0.35, 0.3] });
    K.pipeRun(
      [
        [-17.6, 1.2, -22],
        [-17.6, 1.2, -49.5],
        [17.6, 1.2, -49.5],
      ],
      0.35,
      { c: [0.35, 0.4, 0.36], mat: "metal_painted" },
    );
    K.pipeRun(
      [
        [-17.5, 6.5, -21],
        [17.5, 6.5, -21],
      ],
      0.25,
    );
    for (const z of [-26, -34, -42]) {
      K.light("cage", 17.8, 5.5, z, {
        nx: -1,
        nz: 0,
        floor: 0,
        real: z === -34,
      });
      K.light(z === -42 ? "red" : "cage", -17.8, 5.5, z, {
        nx: 1,
        nz: 0,
        floor: 0,
      });
    }
    // hanging work lights on long drops over the pumps (the hall must read in the dark) + the old sodium floods
    for (const [x, z] of [
      [-9, -30],
      [0, -26],
      [9, -30],
      [-9, -42],
      [9, -42],
    ])
      K.light("tubes2", x, 10, z, {
        floor: 0,
        drop: 3.5,
        alive: true,
        real: x === 0 || (x === -9 && z === -42),
        flicker: x === 9 && z === -42,
      });
    for (const [x, z] of [
      [-12, -47],
      [12, -24],
    ]) {
      K.box(
        "emissive_window@lamp",
        x - 0.3,
        8.9,
        z - 0.2,
        x + 0.3,
        9.2,
        z + 0.2,
        [1, 0.8, 0.5],
        1,
      );
      M.lightCone(
        K.b("my/lightfx"),
        x,
        8.9,
        z,
        x * 0.6,
        0.05,
        z + (z < -35 ? 4 : -4),
        0.4,
        3.5,
        [0.09, 0.07, 0.035],
      );
      M.lightPool(
        K.b("my/lightfx"),
        x * 0.6,
        0.1,
        z + (z < -35 ? 4 : -4),
        4.5,
        4.5,
        [0.14, 0.11, 0.06],
      );
    }
    // the nest: egg clutches, shells, the pest-control crew
    for (let i = 0; i < 18; i++) {
      const x = r.range(-15, 15),
        z = r.range(-48, -40);
      K.cyl("bone", x, 0, z, 0.22, 0.18, 0.36, 8, {
        capTop: true,
        c: [0.75, 0.72, 0.55],
      });
    }
    for (let i = 0; i < 6; i++)
      K.obox(
        "bone",
        r.range(-15, 15),
        0.1,
        r.range(-48, -24),
        r.range(0.6, 1.1),
        0.18,
        r.range(0.5, 0.8),
        r() * 6,
        { pitch: r.range(-0.4, 0.4), c: [0.55, 0.4, 0.3], s: 0.5 },
      );
    K.skel(-12, 0, -46, 0.8, "lying");
    K.skel(14, 0, -24.5, -2, "reaching");
    K.rubbleMound(13, 0, -47, 2.6, 1.0);
    K.loot("ammo_box", 15.5, 0, -48.8, HP, { loot: "ammo_box", large: true });
    K.loot("toolbox", -16.6, 0, -21.2, -HP, { loot: "toolbox", chest: true });
    K.anchor("spawn1", -10, 0, -26);
    K.anchor("spawn2", 10, 0, -27);
    K.anchor("spawn3", -12, 0, -42);
    K.anchor("spawn6", 3, 0, -45);
    K.anchor("boss", 3, 0, -45);

    // ---- tunnel ----
    K.grate(18, -34.4, 50, -33.6, 0);
    K.pipeRun(
      [
        [18, 2.5, -35.6],
        [50, 2.5, -35.6],
      ],
      0.2,
    );
    K.pipeRun(
      [
        [18, 2.1, -35.7],
        [50, 2.1, -35.7],
      ],
      0.08,
      { mat: "metal_painted", c: [0.25, 0.35, 0.5] },
    );
    for (const x of [26, 42])
      K.light("cage", x, 2.3, -32.2, { nx: 0, nz: -1, floor: 0 });
    K.water(18.1, -35.9, 50, -32.1, 0.05);
    K.anchor("spawn4", 34, 0, -34);

    // ---- workshop ----
    K.table(56, 0, -41, 0, 4, 1, {
      mat: "metal_painted",
      c: [0.4, 0.42, 0.38],
    });
    K.box(
      "metal_painted",
      58,
      0.76,
      -41.2,
      58.6,
      1.1,
      -40.8,
      [0.5, 0.2, 0.15],
      1,
    );
    K.shelf(61.5, 0, -34, HP, 6, "parts", { h: 2.2, d: 0.6 });
    K.shelf(51, 0, -30, -HP, 4, "parts", { h: 2.2, d: 0.6 });
    K.barrel(52, 0, -40.8, {});
    K.barrel(52.8, 0, -41.2, {});
    K.light("bulb", 56, 3.6, -34, { floor: 0, real: true });
    K.light("dead", 56, 3.6, -29, {});
    K.litter(50, -42, 62, -26, 0, 10);
    K.loot("toolbox", 54.5, 0.76, -41.1, 0, {
      loot: "toolbox",
      lock: lockSpec({
        id: "map_dng_pump_toolbox",
        label: "Pumping Station No. 4 — workshop tool chest",
        key: "map_key_pump_workshop",
        hint: "Walt's desk in the foreman's office.",
      }),
    });
    K.loot("ammo_box", 60.8, 0, -27.2, HP, { loot: "ammo_box" });
    K.loot("crate", 58.8, 0, -27, 0, {
      loot: "weapon_crate",
      kind: "army",
      lock: lockSpec({
        id: "map_dng_pump_crate",
        label: "Pumping Station No. 4 — workshop shell crate",
        key: "map_key_pump_workshop",
        hint: "Walt's desk in the foreman's office.",
      }),
    });
    K.anchor("spawn5", 56, 0, -33);

    // ---- locker room ----
    K.lockers(-24, 0, -31.6, PI, 8);
    K.box(
      "wood_planks",
      -27,
      0.42,
      -28.3,
      -21,
      0.47,
      -27.7,
      [0.55, 0.42, 0.3],
      1,
    );
    K.col(-27, 0, -28.3, -21, 0.47, -27.7, { surface: "wood" });
    for (let x = -29; x < -26; x += 1.2)
      K.pipe("chrome", x, 3.2, -24.3, x, 2.2, -24.6, 0.02, 4, {
        c: [0.6, 0.6, 0.58],
      });
    K.light("tube", -24, 3.2, -28, { floor: 0, flicker: true });
    K.loot("locker", -19.5, 0, -24.6, 0, { loot: "locker" });
    K.loot("first_aid", -29.85, 1.3, -26, -HP, { loot: "first_aid" });

    // ---- foreman's office ----
    const top2 = K.desk(-24, 0, -41.6, 0, { wood: true, w: 1.6 });
    K.chair(-24, 0, -40.7, 0, {});
    K.skel(-24, 0, -40.75, 0, "seated");
    K.note("dng_note_crossword", -23.6, top2, -41.8, {
      name: "Crossword (finished)",
      title: "The Brooklyn Eagle — Sunday Crossword",
      text: 'Every square filled in, in careful block capitals.\n\n14 ACROSS: "Crustacean that walks sideways" (4) — CRAB\n22 DOWN: "What you do when the water rises" (4,3) — PUMP OUT\n31 ACROSS: "Leave in a hurry" (4) — FLEE\n\nIn the margin: "Workshop key: on the desk. Shells: the crate in the workshop. Teletype word: WETWELL. Don\'t go in the hall at night. — Walt"',
      learn: "map_dng_pump_term",
    });
    placeKey(K, "map_key_pump_workshop", -24.6, top2, -41.4);
    K.loot("desk", -20.6, 0, -43.2, PI, { loot: "desk", name: "Walt's Desk" });
    K.loot("safe", -29.72, 1.05, -38, -HP, {
      loot: "wall_safe",
      wall: true,
      tag: "wallsafe",
      lock: lockSpec({
        id: "map_dng_pump_safe",
        label: "Pumping Station No. 4 — foreman's wall safe",
        code: "0311",
        hint: "The control room teletype.",
      }),
    });
    K.fileCabinet(-19, 0, -33, 0, {});
    K.bookcase(-28.5, 0, -32.4, 0, 1.4);
    K.light("bulb", -24, 3.2, -38, { floor: 0 });
    K.anchor("arrival", 0, 0, -2.2, 0);
    K.anchor("exit", 0, 1.2, -0.5, 0);
    void hall;
  }

  // ===================================================================
  // Build all
  // ===================================================================
  M.dungeons = [];
  /** step(frac)? is awaited after each dungeon so boot can yield (keeps the loading screen animating). */
  M.buildDungeons = async function (step) {
    const L = G.LAYOUT;
    const used = [];
    let di = 0;
    for (const D of DUNGEONS) {
      if (step && di++) await step((di - 1) / DUNGEONS.length);
      try {
        // interior cell registration (owner: map)
        if (!L.INTERIORS[D.key])
          L.INTERIORS[D.key] = {
            owner: "map",
            origin: D.origin,
            name: D.name,
            hostile: true,
            type: "dungeon",
          };
        const O = L.INTERIORS[D.key].origin;
        const K = M.dungeonKit(D.key, O, 1);
        D.build(K);
        K.finish();
        // anchors → world
        const W = {};
        for (const k in K.anchors) {
          const a = K.anchors[k];
          const v = new THREE.Vector3(
            O.x + a[0],
            (O.y || 0) + a[1],
            O.z + a[2],
          );
          v.yaw = a[3] || 0;
          W[k] = v;
        }
        M.anchors[D.key] = W;
        // street entrance
        const E = M.pickDungeonEntrance(D, used); // street face (56_dungeons.js)
        let outside = null,
          doorPos = null,
          yawOut = 0;
        if (E) {
          used.push(E);
          const sd = M.dungeonStreetDoor(D, E); // street door visuals (56_dungeons.js)
          outside = sd.outside;
          doorPos = sd.doorPos;
          yawOut = Math.atan2(-E.nx, -E.nz);
          E.lot.dungeon = D.key;
        }
        const rec = {
          key: D.key,
          name: D.name,
          def: D,
          origin: O,
          anchors: W,
          loot: K.lootList.map((l) =>
            Object.assign({}, l, {
              x: O.x + l.x,
              y: (O.y || 0) + l.y,
              z: O.z + l.z,
            }),
          ),
          notes: K.notes.map((n) =>
            Object.assign({}, n, {
              x: O.x + n.x,
              y: (O.y || 0) + n.y,
              z: O.z + n.z,
            }),
          ),
          terminals: K.terminals,
          outside,
          doorPos,
          entrance: E ? { x: E.x, z: E.z, nx: E.nx, nz: E.nz } : null,
        };
        M.dungeons.push(rec);
        // fixtures (borrowed real lights when the player is near)
        M.extraFixtures = M.extraFixtures || [];
        for (const f of K.fixtures)
          M.extraFixtures.push({
            pos: new THREE.Vector3(
              O.x + f.p[0],
              (O.y || 0) + f.p[1],
              O.z + f.p[2],
            ),
            color: f.color,
            opts: f.opts,
          });
        if (!E) {
          G.reportError &&
            console.warn("[map] dungeon " + D.key + ": no entrance lot found");
          continue;
        }
        // doors: street → arrival, exit → street
        const A = W.arrival,
          X = W.exit;
        G.world.addDoor({
          pos: doorPos,
          label: D.name,
          verb: "Enter",
          radius: 1.3,
          lock: D.lock || undefined,
          target: { x: A.x, y: A.y, z: A.z, yaw: A.yaw || 0 },
          sound: "door_open",
          onEnter: () => {
            try {
              G.discover(D.key);
            } catch (e) {
              /* */
            }
          },
        });
        G.world.addDoor({
          pos: new THREE.Vector3(X.x, X.y, X.z),
          label: "Exit to the street",
          verb: "Leave",
          radius: 1.4,
          target: { x: outside.x, y: outside.y, z: outside.z, yaw: yawOut },
          sound: "door_open",
        });
        // the code for a locked street door lies on the sidewalk outside it (a note: learn → G.locks)
        if (D.doorNote)
          rec.notes.push(
            Object.assign({}, D.doorNote, {
              x: outside.x + E.nx * 0.9 + E.nz * 1.1,
              y: outside.y || 0,
              z: outside.z + E.nz * 0.9 - E.nx * 1.1,
            }),
          );
        // LOCATIONS: outdoor marker (goggles map, discovery, "Cleared") + interior entry (combat population)
        const mx = outside.x + E.nx * 2.5,
          mz = outside.z + E.nz * 2.5;
        const extId = D.key,
          intId = D.key + "_int";
        if (!L.getLocation(extId))
          L.LOCATIONS.push({
            id: extId,
            name: D.name,
            x: mx,
            z: mz,
            r: 12,
            type: "dungeon",
            faction: D.faction,
            hostile: true,
            level: D.level,
            dungeon: D.key,
            baseName: D.name,
          });
        if (!L.getLocation(intId))
          L.LOCATIONS.push({
            id: intId,
            name: D.name,
            x: mx,
            z: mz,
            r: 8,
            type: "dungeon",
            faction: D.faction,
            hostile: true,
            level: D.level,
            interior: D.key,
            spawns: D.spawns.slice(),
            dungeon: D.key,
          });
        rec.extId = extId;
        rec.intId = intId;
        // boss anchor for combat's raider-boss logic (G.landmarks.getAnchor(locId, 'boss'))
        try {
          if (!G.landmarks || G.landmarks.__stub)
            G.landmarks = {
              getAnchor: (id, n) =>
                G.landmarks[id] &&
                G.landmarks[id].anchors &&
                G.landmarks[id].anchors[n]
                  ? G.landmarks[id].anchors[n].clone()
                  : null,
            };
          if (W.boss)
            G.landmarks[intId] = {
              id: intId,
              anchors: { boss: W.boss, entrance: outside },
            };
        } catch (e) {
          /* optional */
        }
      } catch (e) {
        G.reportError("map:dungeon " + D.key, e);
      }
    }
    registerLocks();
    return M.dungeons.length;
  };

  // ===================================================================
  // Runtime: containers / skeletons / terminals / notes; "Cleared" names
  // ===================================================================
  const spawned = new Map(); // key → [{rec, handle}]
  function unlockLoot(key, tag) {
    const list = spawned.get(key) || [];
    let n = 0;
    for (const s of list) {
      if (s.rec.tag !== tag || !s.h) continue;
      try {
        const c = s.h.container;
        if (c) {
          c.locked = 0;
          n++;
        }
        if (s.h.record && s.h.record.cdef) s.h.record.cdef.locked = 0;
      } catch (e) {
        /* */
      }
      if (s.rec.lock) unlockLock(s.rec.lock.id);
    }
    if (n) {
      try {
        G.sfx && G.sfx.play && G.sfx.play("door_open");
      } catch (e) {
        /* */
      }
    }
    return n;
  }
  M.unlockDungeonLoot = unlockLoot;
  M.spawnDungeonLoot = function () {
    M.clearDungeonLoot();
    if (G.isStub("props") || !G.props.spawn) return;
    for (const D of M.dungeons) {
      const list = [];
      D.loot.forEach((l, i) => {
        try {
          const o = {
            x: l.x,
            y: l.y,
            z: l.z,
            yaw: l.yaw,
            id: D.key + "_" + i + "_" + l.type,
            persistent: false,
          };
          if (l.loot) o.loot = l.loot;
          for (const k of [
            "name",
            "wall",
            "large",
            "chest",
            "kind",
            "pose",
            "terminalId",
            "mount",
            "floor",
          ])
            if (l[k] !== undefined) o[k] = l[k];
          if (l.lock) {
            o.lock = l.lock;
            o.locked = 0;
          }
          if (l.noContainer) o.container = false;
          const h = G.props.spawn(l.type, o);
          // the container UI opens locked containers through G.locks (container.lock)
          if (h && l.lock) {
            try {
              if (h.container) h.container.lock = l.lock;
              if (h.record && h.record.cdef) h.record.cdef.lock = l.lock;
            } catch (e) {
              /* */
            }
          }
          if (h) list.push({ rec: l, h });
        } catch (e) {
          G.reportError("map:dungeon loot " + D.key, e);
        }
      });
      spawned.set(D.key, list);
    }
  };
  M.clearDungeonLoot = function () {
    for (const list of spawned.values())
      for (const s of list) {
        try {
          if (s.h.remove) s.h.remove();
          else if (s.h.object3d && s.h.object3d.parent)
            s.h.object3d.parent.remove(s.h.object3d);
        } catch (e) {
          /* */
        }
      }
    spawned.clear();
  };
  /** Notes (static pickups, persisted by rpg) and terminals — once all modules are initialised. */
  M.initDungeonData = function () {
    registerLocks();
    defineKeys();
    for (const D of M.dungeons) {
      for (const t of D.terminals) {
        try {
          if (!G.isStub("terminals") && G.terminals.register)
            G.terminals.register(t.id, t.def);
        } catch (e) {
          G.reportError("map:terminal " + t.id, e);
        }
      }
      for (const n of D.notes) {
        try {
          if (G.isStub("items") || !G.items.define) continue;
          if (!n.isKey && !(G.items.get && G.items.get(n.id))) {
            const def = {
              id: n.id,
              type: "note",
              name: n.name,
              title: n.title,
              text: n.text,
              weight: 0,
              value: 0,
            };
            // a note that carries a code / passcode teaches it (G.locks: item `learn`, plus onRead for readers that call it)
            if (n.learn) {
              def.learn = n.learn;
              def.onRead = () => learnLock(n.learn, n.name);
            }
            G.items.define(def);
          }
          if (G.items.spawnPickup)
            G.items.spawnPickup(
              n.id,
              1,
              new THREE.Vector3(n.x, n.y + 0.02, n.z),
              { static: true, keepY: true, yaw: 0.3 },
            );
        } catch (e) {
          G.reportError("map:note " + n.id, e);
        }
      }
    }
  };
  /** Goggles map: mark cleared dungeons ("Name [Cleared]") — polled, so it survives saves & reloads. */
  M.updateDungeonNames = function () {
    if (G.isStub("combat") || typeof G.combat.isLocationCleared !== "function")
      return;
    const L = G.LAYOUT;
    for (const D of M.dungeons) {
      const ext = D.extId && L.getLocation(D.extId);
      if (!ext) continue;
      let cleared = false;
      try {
        cleared = !!G.combat.isLocationCleared(D.intId);
      } catch (e) {
        cleared = false;
      }
      if (cleared !== !!ext.cleared) {
        ext.cleared = cleared;
        ext.name = cleared ? D.name + " [Cleared]" : D.name;
      }
    }
  };
  M.dungeonVisibility = function (cam, indoor) {
    for (const D of M.dungeons) {
      const root = M.roots["int_" + D.key];
      if (!root) continue;
      root.visible =
        indoor &&
        Math.abs(cam.x - D.origin.x) < 200 &&
        Math.abs(cam.z - D.origin.z) < 200;
    }
  };
})();
