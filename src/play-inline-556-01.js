// play-inline-556 01 — yaw
// Lines 35-266 of readable/play-inline-556.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const L = G.quests.lib;
  const Q = G.quests;

  const TS = { x: -40, z: -262 };
  const IXM = () => (G.LAYOUT ? G.LAYOUT.INTERIOR_X_MIN : 2500);
  const isInt = (x) => x >= IXM();
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const NEON_CELL = () =>
    G.LAYOUT.INTERIORS && G.LAYOUT.INTERIORS.neon_interiors
      ? G.LAYOUT.INTERIORS.neon_interiors.origin
      : { x: 11000, z: 0 };

  // ------------------------------------------------------------------
  // Anchor resolution (plan names first, then older Neon anchors, then a safe spot)
  // ------------------------------------------------------------------
  const cache = new Map();
  /**
   * Plan name → the equivalent spot the exterior stream has ALREADY BUILT under its older anchor names
   * (landmarks_a/40_times_square.js: stalls merchant1..4 / vendor1..2 / noodles / butcher / water / repairman,
   * the red-cross clinic shack `doctor`, gate posts guard1..4, the Rad-Lounge stage `singer` …).
   * [builtName, lateral m, forward m] in the built anchor's own frame (forward = the way it faces).
   * A real plan anchor always wins; the alias is only read when the plan name is not registered.
   */
  const ALIAS = (function () {
    const A = {
      gate_n: ["guard1"],
      gate_s: ["guard2"],
      gate_w: ["guard3"],
      gate_e: ["guard4"],
      guard_captain: ["guard1", 2.4, -3.2],
      market_stall_1: ["merchant1"],
      market_stall_2: ["merchant3"],
      market_stall_3: ["merchant4"],
      market_stall_4: ["vendor2"],
      market_stall_5: ["noodles"],
      market_stall_6: ["butcher"],
      market_stall_7: ["merchant2"],
      market_stall_8: ["water"],
      plaza_centre: ["center"],
      clinic_doctor: ["doctor"],
      robo_owner: ["repairman"],
      pawn_owner: ["vendor1"],
      opry_stage: ["singer"],
      opry_director: ["lounge", 1.4, 0.8],
      radroom_cards: ["rad_room"],
      convoy_master: ["entrance_south", -6, 1.5],
      hawker_1: ["plaza", 2.5, 3],
      hawker_2: ["totem", -1.5, 2.2],
      hawker_3: ["doorman", 0, 2.8],
      sniper_1: ["lookout"],
      sniper_2: ["guard5"],
    };
    for (const d of ["n", "s", "e", "w"]) {
      A["gate_" + d + "_guard1"] = [A["gate_" + d][0], -1.8, 0];
      A["gate_" + d + "_guard2"] = [A["gate_" + d][0], 1.8, 0];
    }
    const C = [
      "settler1",
      "settler2",
      "settler3",
      "settler4",
      "settler6",
      "plaza",
      "center",
      "totem",
    ];
    for (let n = 1; n <= 20; n++)
      A["crowd_" + n] = [
        C[(n - 1) % C.length],
        (((n * 37) % 7) - 3) * 1.1,
        (((n * 53) % 5) - 2) * 1.1,
      ];
    return A;
  })();
  function lookup(n) {
    let v = null;
    try {
      if (!G.isStub("landmarks") && typeof G.landmarks.getAnchor === "function")
        v = G.landmarks.getAnchor("times_square", n);
    } catch (e) {
      v = null;
    }
    if (!v || !isFinite(v.x)) {
      try {
        if (
          G.pois &&
          !G.isStub("pois") &&
          typeof G.pois.getAnchor === "function"
        )
          v = G.pois.getAnchor("neon_interiors", n);
      } catch (e) {
        v = null;
      }
    }
    return v && isFinite(v.x) && isFinite(v.z) ? v : null;
  }
  function rawAnchor(n) {
    const v = lookup(n);
    if (v) return { x: v.x, y: v.y || 0, z: v.z, yaw: v.yaw || 0, name: n };
    const al = ALIAS[n];
    if (al) {
      const b = lookup(al[0]);
      if (b) {
        const yaw = b.yaw || 0,
          lat = al[1] || 0,
          fwd = al[2] || 0;
        return {
          x: b.x + Math.cos(yaw) * lat + Math.sin(yaw) * fwd,
          y: b.y || 0,
          z: b.z - Math.sin(yaw) * lat + Math.cos(yaw) * fwd,
          yaw,
          name: n + "→" + al[0],
          alias: al[0],
        };
      }
    }
    return null;
  }
  /**
   * The Neon's PLACES (TIMES_SQUARE_PLAN.md "The 18 places") and the anchors that prove one is built.
   * A service whose place is missing is hidden (its NPC is not spawned when the NPC IS the service — `needsPlace`),
   * never faked in the open street.
   */
  const PLACES = {
    clinic: ["clinic_doctor", "clinic_door"],
    gallery: ["gallery_owner", "gallery_range", "gallery_door"],
    robo: ["robo_owner", "robo_door"],
    pawn: ["pawn_owner", "pawn_door"],
    opry: ["opry_stage", "opry_director", "opry_door"],
    radroom: ["radroom_cards", "rad_room"],
    power: ["power_engineer", "power_generator", "power_door"],
    depot: ["convoy_master", "convoy_arrive", "depot_door"],
    bunkhouse: ["bunk_keeper", "bunk_door", "bunk_1"],
    club: ["club_host", "club_stage"],
    club_door: ["club_door", "club_bouncer"],
    speakeasy: ["speakeasy_bar", "speakeasy_bartender"],
    board: ["notice_board"],
    oracle: ["oracle_booth", "ticker_oracle"],
  };
  function placeOf(k) {
    return has(PLACES[k] || []);
  }
  /** true once the interior stream has built the Opry itself (not the Rad-Lounge stand-in stage) */
  function realOpry() {
    const a = rawAnchor("opry_stage");
    return !!(a && !a.alias);
  }
  /** First existing anchor of `names` (raw, unvalidated) or null. */
  function has(names) {
    for (const n of [].concat(names || [])) {
      const a = rawAnchor(n);
      if (a) return a;
    }
    return null;
  }
  /**
   * Resolve a standing spot. names: anchor candidates; fb: {near:[anchor names], dx, dz, yaw} or {x,z};
   * opts: {requireAnchor, maxR}. → {x,y,z,yaw,name,anchored,fallback} | null
   */
  function spot(names, fb, opts) {
    opts = opts || {};
    const key =
      [].concat(names || []).join(",") +
      "|" +
      JSON.stringify(fb || null) +
      "|" +
      (opts.requireAnchor ? 1 : 0);
    if (cache.has(key)) {
      const c = cache.get(key);
      return c ? Object.assign({}, c) : null;
    }
    let out = null;
    for (const n of [].concat(names || [])) {
      const a = rawAnchor(n);
      if (!a) continue;
      const s = L.freeSpot(a.x, a.z, a.y, { maxR: opts.maxR || 3 });
      out =
        s && !s.forced
          ? { x: s.x, y: s.y, z: s.z, yaw: a.yaw, name: a.name, anchored: true }
          : {
              x: a.x,
              y: a.y,
              z: a.z,
              yaw: a.yaw,
              name: a.name,
              anchored: true,
            };
      break;
    }
    if (!out && fb && !opts.requireAnchor) {
      let base = null;
      if (fb.near) base = has(fb.near);
      if (!base)
        base = {
          x: fb.x !== undefined ? fb.x : TS.x,
          y: fb.y || 0,
          z: fb.z !== undefined ? fb.z : TS.z,
          yaw: 0,
        };
      // fallbacks are street-level: an elevated reference anchor (a roof, a catwalk) only gives x/z
      const by = (base.y || 0) > 3 ? 0 : base.y;
      const s = L.freeSpot(base.x + (fb.dx || 0), base.z + (fb.dz || 0), by, {
        maxR: 12,
      });
      if (s)
        out = {
          x: s.x,
          y: s.y,
          z: s.z,
          yaw: fb.yaw !== undefined ? fb.yaw : base.yaw || 0,
          name: "fallback",
          fallback: true,
        };
    }
    cache.set(key, out ? Object.assign({}, out) : null);
    return out;
  }
  /** Numbered anchors that exist: base_1..n → [{…}] */
  function series(base, n) {
    const out = [];
    for (let i = 1; i <= n; i++) {
      const a = rawAnchor(base + i);
      if (a) out.push(a);
    }
    return out;
  }

  // ------------------------------------------------------------------
  // Stock (resolved through lib.resolveStock: unknown ids are dropped)
  // ------------------------------------------------------------------
