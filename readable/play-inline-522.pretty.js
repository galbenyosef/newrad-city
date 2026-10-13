/* src/ambient_life/35_neon_depot.js */
/* =====================================================================
 * NEW RAD CITY — AMBIENT LIFE — 35: THE NEON DEPOT FREIGHT CONVOY
 *   (TIMES_SQUARE_PLAN.md #13 "Depot: convoys arrive/leave on a schedule")
 *
 * Every day the Neon Freight convoy (a trader, a hired gun and two pack
 * oxen) walks in through the south gate around 07:30, parks in the Depot
 * (first parking anchor, the oxen in their pen) and trades general goods
 * until 16:00, then heads back out south. It only exists as actors while
 * the player is within ~220 m of the Neon; otherwise it is simulated by the
 * clock alone (arrive/park/leave), so walking in at noon finds it parked,
 * and at 17:00 it is gone. The Depot's anchors are resolved at newGame
 * (exterior stream builds them); fallbacks sit near the south entrance,
 * never inside geometry.
 * Also: Mad Eddie Moss's loop (30_convoys) stops INSIDE the Depot when the
 * anchor exists (patch in buildRoute via K.neonDepotStop).
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const K = G.ambient._;

  const TS = { x: -40, z: -262 };
  const ARRIVE = 7.4,
    PARK = 8.0,
    LEAVE = 16.0,
    GONE = 16.8;
  const STOCK = [
    ["purified_water", 8],
    ["golden_plain_jerky", 6],
    ["franks_and_beans", 5],
    ["freedom_flakes", 3],
    ["ox_steak", 4],
    ["ox_milk", 3],
    ["fizzo_cola", 6],
    ["beer", 6],
    ["rally_tonic", 3],
    ["prussian_blue", 2],
    ["ammo_10mm", 60],
    ["ammo_12ga", 24],
    ["ammo_556", 40],
    ["leather_armor", 1],
    ["biker_leathers", 1],
    ["duct_tape", 3],
    ["scrap_metal", 6],
  ];
  // Depot anchors registered by the Times Square exterior (landmarks_a). The Depot was built with the
  // old trade-wagon anchor names; the ox pen is looked up by its new name and otherwise placed beside
  // the first parking bay.
  const AN = {
    arrive: "convoy_arrive",
    park1: "convoy_park_1",
    park2: "convoy_park_2",
    master: "convoy_master",
    pen: "ox_pen",
  };
  const GREET = [
    "Neon Freight, fresh off the road. Food, water, bullets and bandages — what'll it be?",
    "Morning, stranger! We made it in with all our legs. Buy something to celebrate.",
    "Ma Dooley's the name, freight's the game. Don't touch the oxen, they're union.",
  ];
  const IDLE = [
    "Fresh from Grand Central! Mostly fresh!",
    "Water, food, ammo — step up!",
    "Clementine, stop eating the tarp.",
    "Wagon leaves at four, get it while it's here!",
  ];

  function anchor(n) {
    try {
      if (
        !G.isStub("landmarks") &&
        typeof G.landmarks.getAnchor === "function"
      ) {
        const v = G.landmarks.getAnchor("times_square", n);
        if (v && isFinite(v.x)) return v;
      }
    } catch (e) {
      /* ignore */
    }
    return null;
  }
  function anyAnchor(names) {
    for (const n of names) {
      const a = anchor(n);
      if (a) return a;
    }
    return null;
  }
  function spotNear(a, r) {
    if (!a) return null;
    return K.freeSpotNear(a.x, a.z, r || 3, 16, a.y || 0);
  }

  /** Mad Eddie's Times Square stop point (used by 30_caravans' route builder). */
  K.neonDepotStop = function () {
    const a = anyAnchor([AN.park2, AN.park1, AN.arrive]);
    return a ? { x: a.x, z: a.z } : null;
  };

  const D = { spots: null, live: null, gone: false };
  function spots() {
    if (D.spots) return D.spots;
    const park =
      spotNear(anyAnchor([AN.park1, AN.arrive, "depot_door"])) ||
      spotNear(anyAnchor(["entrance_south", "subway"]), 6) ||
      K.freeSpotNear(TS.x - 12, TS.z + 40, 8, 20, 0);
    const pen =
      spotNear(anyAnchor([AN.pen]), 2) ||
      (park
        ? K.freeSpotNear(park.x - 6.5, park.z - 5.5, 3, 16, park.y) ||
          K.freeSpotNear(park.x + 4, park.z + 3, 4, 16, park.y)
        : null);
    const gate = anyAnchor(["gate_s", AN.arrive, "entrance_south"]) || {
      x: -30,
      z: -214,
    };
    // walk-in point: 110 m south of the south gate, on the avenue
    const entry =
      K.freeSpotNear(gate.x, gate.z + 110, 8, 24, 0) ||
      K.freeSpotNear(-40, -150, 10, 24, 0);
    D.spots = { park, pen, gate: { x: gate.x, z: gate.z }, entry };
    return D.spots;
  }
  function phase(h) {
    return h >= ARRIVE && h < PARK
      ? "arrive"
      : h >= PARK && h < LEAVE
        ? "park"
        : h >= LEAVE && h < GONE
          ? "leave"
          : "away";
  }
  function nearNeon() {
    const P = G.player;
    return (
      P &&
      !K.isInterior(P.pos.x) &&
      Math.hypot(P.pos.x - TS.x, P.pos.z - TS.z) < 220
    );
  }

  function spawnAt(p, ph) {
    const S = spots();
    if (!S.park) return;
    const trader = K.spawnActor({
      type: "human",
      outfit: "merchant",
      gender: "f",
      hat: "bandana",
      hatColor: 0x7a4a2a,
      faction: "settlers",
      name: "Ma Dooley",
      level: 7,
      pos: p,
      yaw: 0,
      ai: ph === "park" ? "merchant" : "patrol",
      patrol: [ph === "leave" ? S.entry : S.park],
      voice: "merchant",
      weapon: K.itemExists("pistol_10mm") ? "pistol_10mm" : "none",
      merchant: K.merchant(380, K.stock(STOCK), { restock: 1 }),
      barks: { greet: GREET, idle: IDLE },
      noRespawn: true,
      hp: 150,
      seed: "neon_freight",
    });
    if (!trader) return;
    trader._ambConvoy = { neonDepot: true };
    const live = { trader, guard: null, oxen: [] };
    const gp = K.freeSpotNear(p.x + 2, p.z + 1.5, 3, 12, p.y) || p;
    const lvl = Math.max(6, K.level ? K.level() : 6);
    live.guard = K.spawnActor({
      type: "human",
      outfit: "combat_armor",
      faction: "settlers",
      name: "Freight Guard",
      voice: "guard",
      level: lvl,
      pos: gp,
      ai: ph === "park" ? "guard" : "follow",
      weapon: K.itemExists("hunting_rifle") ? "hunting_rifle" : "none",
      noRespawn: true,
      gender: "m",
      home: { x: gp.x, z: gp.z, r: 2 },
    });
    if (live.guard && ph !== "park")
      try {
        live.guard.follow(trader);
      } catch (e) {
        /* ignore */
      }
    for (let i = 0; i < 2; i++) {
      const bp =
        ph === "park" && S.pen
          ? K.freeSpotNear(S.pen.x, S.pen.z, 2.5, 12, S.pen.y)
          : K.freeSpotNear(p.x - 3 - i * 2.5, p.z + 2, 3, 12, p.y);
      if (!bp || !K.oxen) continue;
      const b = K.oxen.spawnActor({
        pos: bp,
        yaw: Math.random() * 6.28,
        variant: i + 1,
        pack: true,
        ai: ph === "park" ? "wander" : "follow",
        follow: ph === "park" ? null : trader,
        name: "Pack Ox",
        home: { x: bp.x, z: bp.z, r: 2.5 },
      });
      if (b) live.oxen.push(b);
    }
    D.live = live;
  }
  function despawn() {
    const lv = D.live;
    if (!lv) return;
    for (const a of [lv.trader, lv.guard].concat(lv.oxen)) K.removeActor(a);
    D.live = null;
  }
  function park() {
    const lv = D.live,
      S = spots();
    if (!lv) return;
    if (K.actorAlive(lv.trader)) {
      lv.trader.aiMode = "merchant";
      lv.trader.home = { x: S.park.x, z: S.park.z, r: 1.5 };
      K.say(lv.trader, "Neon Freight's in! Open for business!", 3.5);
    }
    if (K.actorAlive(lv.guard)) {
      try {
        lv.guard.follow(null);
      } catch (e) {
        /* ignore */
      }
      lv.guard.aiMode = "guard";
      lv.guard.home = { x: lv.guard.pos.x, z: lv.guard.pos.z, r: 2 };
    }
    for (const b of lv.oxen)
      if (K.actorAlive(b)) {
        try {
          b.follow(null);
        } catch (e) {
          /* ignore */
        }
        const t = S.pen || S.park;
        b.aiMode = "wander";
        b.home = { x: t.x, z: t.z, r: 3 };
        b.moveTo(t.x, t.z);
      }
  }
  function depart() {
    const lv = D.live,
      S = spots();
    if (!lv) return;
    if (K.actorAlive(lv.trader)) {
      lv.trader.aiMode = "patrol";
      lv.trader.patrol = [S.gate, S.entry];
      lv.trader.patrolIdx = 0;
      K.say(lv.trader, "Pack it up! Wagon's rolling!", 3.5);
    }
    if (K.actorAlive(lv.guard))
      try {
        lv.guard.follow(lv.trader);
      } catch (e) {
        /* ignore */
      }
    for (const b of lv.oxen)
      if (K.actorAlive(b))
        try {
          b.follow(lv.trader);
        } catch (e) {
          /* ignore */
        }
  }

  let tickT = 0,
    lastPh = null;
  function update(dt) {
    if (dt <= 0) return;
    tickT += dt;
    if (tickT < 0.5) return;
    tickT = 0;
    if (G.state !== "play" && !D.live) return;
    const S = spots();
    if (!S.park || !S.entry) return;
    const ph = phase(G.time.hour);
    const lv = D.live;
    if (lv) {
      const t = lv.trader;
      if (!K.actorAlive(t)) {
        if (!t || t.removed || K.distToPlayer(t.pos.x, t.pos.z) > 150)
          despawn();
        lastPh = ph;
        return;
      }
      if (K.actorBusy(t) || t.inCombat) {
        lastPh = ph;
        return;
      }
      if (ph !== lastPh) {
        if (ph === "park") park();
        else if (ph === "leave" || ph === "away") depart();
      }
      if (
        ph === "arrive" &&
        t.aiMode === "patrol" &&
        Math.hypot(t.pos.x - S.park.x, t.pos.z - S.park.z) < 3
      )
        park();
      // gone: out of sight on the way out, or the player walked away
      const far = K.distToPlayer(t.pos.x, t.pos.z);
      if (!nearNeon() && far > 180) despawn();
      else if (
        (ph === "leave" || ph === "away") &&
        (Math.hypot(t.pos.x - S.entry.x, t.pos.z - S.entry.z) < 6 ||
          far > 120) &&
        !K.inView(t.pos.x, t.pos.y + 1, t.pos.z, 2, true)
      )
        despawn();
      lastPh = ph;
      return;
    }
    lastPh = ph;
    if (!nearNeon() || G.state !== "play") return;
    if (ph === "park") {
      if (
        !K.inView(S.park.x, S.park.y + 1, S.park.z, 3, true) ||
        K.distToPlayer(S.park.x, S.park.z) > 60
      )
        spawnAt(S.park, "park");
    } else if (ph === "arrive") {
      if (!K.inView(S.entry.x, S.entry.y + 1, S.entry.z, 3, true))
        spawnAt(S.entry, "arrive");
    }
  }

  K.system({
    name: "neon_depot",
    order: 35,
    newGame() {
      D.spots = null;
      D.live = null;
      lastPh = null;
    },
    loaded() {
      D.spots = null;
      D.live = null;
      lastPh = null;
    },
    reset() {
      D.live = null;
      D.spots = null;
      lastPh = null;
    }, // combat removes the actors itself on reset
    update,
  });
  K.neonDepot = {
    state: () => ({
      phase: phase(G.time.hour),
      live: !!D.live,
      spots: D.spots,
    }),
    spawnNow: () => {
      const S = spots();
      const ph = phase(G.time.hour);
      spawnAt(
        ph === "park" ? S.park : S.entry,
        ph === "park" ? "park" : "arrive",
      );
    },
  };
})();
