// play-inline-526 02 — captive
// Lines 44-391 of readable/play-inline-526.pretty.js (statement-aligned).
  const U = K.encounters.util;
  const _v = new THREE.Vector3();

  /** Make a neutral actor hostile to the player and put it straight into combat. */
  K.aggro = function (a) {
    if (!K.actorAlive(a)) return;
    try {
      a.wasFriendly = true;
      a.setHostile(true);
    } catch (e) {
      /* ignore */
    }
    if (a.aiMode === "sit" || a.aiMode === "static") a.aiMode = "wander";
    a.awareness = 1.5;
    a.lastKnown = (a.lastKnown || new THREE.Vector3()).copy(G.player.pos);
  };
  /** Nearest friendly settlement LOCATION to (x,z). */
  function nearestTown(x, z) {
    let best = null,
      bd = 1e9;
    for (const l of G.LAYOUT.LOCATIONS) {
      if (l.hostile || l.sub || l.interior || !(l.x < G.LAYOUT.INTERIOR_X_MIN))
        continue;
      const d = Math.hypot(l.x - x, l.z - z);
      if (d < bd) {
        bd = d;
        best = l;
      }
    }
    return best;
  }
  const LOCNAME = (l) =>
    l ? l.name.replace(/ —.*$/, "").replace(/ \(.*\)$/, "") : "home";

  // ------------------------------------------------------------------
  // Notes (original writing)
  // ------------------------------------------------------------------
  const NOTES = {
    amb_note_manifest: [
      "Slaver's Manifest",
      "Rikers Pens: Transport Manifest",
      'RIKERS ISLAND PENS - FERRY MANIFEST\n\nPickup: Battery Park slip, dusk, knock three times.\nCargo: 1 female, 20s, good teeth, "mouthy."\nCollar no. 114 (the sticky one, the latch slips if you jiggle it).\nAsking: 400. Floor: 250.\n\nReminder from the Pen Boss: DAMAGED CARGO COMES OUT OF YOUR CUT.\n\n(Scrawled underneath:) Stop letting them talk. The talking ones always get somebody killed.',
    ],
    amb_note_manifest_m: [
      "Slaver's Manifest",
      "Rikers Pens: Transport Manifest",
      'RIKERS ISLAND PENS - FERRY MANIFEST\n\nPickup: Battery Park slip, dusk, knock three times.\nCargo: 1 male, 30s, strong back, good teeth, "mouthy."\nCollar no. 114 (the sticky one, the latch slips if you jiggle it).\nAsking: 400. Floor: 250.\n\nReminder from the Pen Boss: DAMAGED CARGO COMES OUT OF YOUR CUT.\n\n(Scrawled underneath:) Stop letting them talk. The talking ones always get somebody killed.',
    ],
    amb_note_bait_plan: [
      "Greasy Note",
      "The Broadway Bait",
      "Ricky plays hurt. Ricky is GOOD at playing hurt, Ricky did community theatre before the bombs (he was nine, whatever, he says it counts).\n\nRest of us behind the bus. When the mark kneels down to look at the leg, that's the cue.\n\nSplit's even. Ricky does NOT get extra for \"the performance.\"\n\n- Dutch",
    ],
    amb_note_citation: [
      "Citation",
      "NYPD Citation No. 00482-B",
      "NEW YORK CITY POLICE DEPARTMENT - AUTOMATED PATROL DIVISION\n\nOFFENCE: Pedestrian crossing against signal (jaywalking). Curfew violation.\nDATE: March 1967 (clock fault, date unverified).\nFINE: $5.00, payable at any precinct house within 30 days.\n\nFailure to pay may result in a bench warrant, a stern letter, or both.\n\nHave a safe and productive day, citizen!",
    ],
  };
  function defineNotes() {
    for (const id in NOTES)
      K.defineNote(id, NOTES[id][0], NOTES[id][1], NOTES[id][2], 0);
  }

  // ------------------------------------------------------------------
  // Standing: slavers are fair game (killing slavers is a good deed)
  // ------------------------------------------------------------------
  G.events.on("actorKilled", (a, killer) => {
    try {
      if (!a || a.faction !== "amb_slavers") return;
      if (killer === "player" || (killer && killer.following === "player"))
        K.addStanding(a._ambLead ? 15 : 8, "Killed a slaver");
    } catch (e) {
      /* ignore */
    }
  });

  // ==================================================================
  // SLAVERS WITH A CAPTIVE
  // ==================================================================
  let slaverE = null;
  /** Unique per encounter instance (survives save/load since the dialogue memory it keys is persisted). */
  const newUid = () =>
    Date.now().toString(36) + Math.floor(Math.random() * 1296).toString(36);
  const CAPTIVES = [
    ["Rosa Delacroix", "f"],
    ["Nia Banks", "f"],
    ["Petey Shaw", "m"],
    ["Marguerite Oyelaran", "f"],
    ["Sol Weintraub", "m"],
  ];
  function encSlavers() {
    const P = G.player.pos;
    const s = K.streetSpot(P.x, P.z, 45, 70, {
      road: true,
      hidden: true,
      notSettlement: true,
      clear: 1.2,
      tries: 40,
    });
    if (!s) return null;
    // walk a leg of the avenue/street toward the harbour (south); fall back to crossing in front of the player
    const pts = [];
    const ax = G.LAYOUT.isRoad(s.x, s.z + 30) && G.LAYOUT.isRoad(s.x, s.z + 60);
    if (ax) pts.push({ x: s.x, z: s.z + 70 }, { x: s.x, z: s.z + 150 });
    else pts.push({ x: s.x + (P.x > s.x ? -80 : 80), z: s.z });
    const lvl = K.level();
    const cap = K.pick(CAPTIVES);
    const E = {
      kind: "slavers",
      x: s.x,
      z: s.z,
      actors: [],
      slavers: [],
      t: 0,
      state: "bound",
      price: 250,
      rewarded: false,
      hailed: false,
      capName: cap[0],
      capG: cap[1],
      uid: newUid(),
    };
    for (let i = 0; i < 3; i++) {
      const sp =
        i === 0
          ? s
          : K.freeSpotNear(s.x + (i === 1 ? 2 : -2), s.z + 2.5, 2.5, 10);
      if (!sp) continue;
      const lead = i === 0;
      const a = K.spawnActor({
        type: "raider",
        faction: "amb_slavers",
        hostile: false,
        name: lead ? "Slaver Boss" : "Slaver",
        level: Math.max(3, lvl + (lead ? 1 : -1)),
        pos: sp,
        yaw: K.yawTo(sp.x, sp.z, pts[0].x, pts[0].z),
        ai: lead ? "patrol" : "follow",
        patrol: lead ? pts : null,
        noRespawn: true,
        weapon: lead
          ? K.itemExists("combat_shotgun")
            ? "combat_shotgun"
            : "none"
          : K.pick(
              ["pistol_10mm", "hunting_rifle", "smg_10mm"]
                .filter((w) => K.itemExists(w))
                .concat(["none"])
                .slice(0, 3),
            ),
        dialogue: lead ? "amb_dlg_slaver" : null,
        voice: "raider",
        seed: "amb_slaver" + i + Math.floor(Math.random() * 99),
        barks: {
          idle: lead
            ? [
                "Keep it moving. Ferry won't wait.",
                "Eyes front, merchandise.",
                "Rikers pays on delivery. Delivery, people.",
              ]
            : [
                "Walk faster.",
                "Don't even think about it.",
                "Hands where I can see 'em, sweetheart.",
              ],
          greet: lead
            ? [
                "Keep walking. Unless you're buying.",
                "Nothing to see here, friend.",
              ]
            : ["Move along.", "Boss does the talking."],
        },
        inventory: K.stock(
          lead
            ? [
                [K.SCRIP, K.randInt(60, 140)],
                [
                  cap[1] === "m" ? "amb_note_manifest_m" : "amb_note_manifest",
                  1,
                ],
                ["rally_tonic", 1],
              ]
            : [
                [K.SCRIP, K.randInt(10, 40)],
                ["ammo_10mm", 12],
              ],
        ),
      });
      if (!a) continue;
      a._ambLead = lead;
      E.slavers.push(a);
      E.actors.push(a);
    }
    if (!E.slavers.length) return null;
    const lead = E.slavers[0];
    for (const m of E.slavers.slice(1)) {
      try {
        m.follow(lead);
      } catch (e) {
        /* ignore */
      }
    }
    const cp = K.freeSpotNear(s.x, s.z + 1.5, 2, 10) || s;
    const c = K.spawnActor({
      type: "human",
      outfit: "settler",
      gender: cap[1],
      hair: "wild",
      faction: "settlers",
      name: cap[0],
      level: 2,
      hp: 55,
      pos: cp,
      ai: "follow",
      weapon: "none",
      noRespawn: true,
      dialogue: "amb_dlg_captive",
      voice: "settler",
      seed: "amb_captive" + cap[0],
      barks: {
        idle: [
          "Please... somebody...",
          "I'm not going to Rikers. I'm NOT.",
          "You don't have to do this.",
        ],
        greet: ["Help me. Please."],
      },
      inventory: K.stock([[K.SCRIP, 5]]),
    });
    if (c) {
      try {
        c.follow(lead);
      } catch (e) {
        /* ignore */
      }
      E.captive = c;
      E.actors.push(c);
    }
    E.update = function (dt) {
      E.t += dt;
      const alive = E.slavers.filter((a) => K.actorAlive(a));
      const lead0 = alive[0];
      if (lead0) {
        E.x = lead0.pos.x;
        E.z = lead0.pos.z;
      } else if (K.actorAlive(E.captive)) {
        E.x = E.captive.pos.x;
        E.z = E.captive.pos.z;
      }
      const d = K.distToPlayer(E.x, E.z);
      if (!E.hailed && lead0 && d < 22 && !lead0.inCombat) {
        E.hailed = true;
        K.say(
          lead0,
          K.standing() <= -500
            ? "Well now. You've got the look of somebody who understands the trade."
            : "Keep your distance, friend. This is a private transaction.",
          4,
        );
      }
      // captive freed by force: every slaver dead (or fled out of range)
      if (E.state === "bound" && !alive.length) free("killed");
      // captive reaction when shooting starts
      if (
        E.state === "bound" &&
        K.actorAlive(E.captive) &&
        alive.some((a) => a.inCombat)
      ) {
        if (E.captive.aiMode !== "sit") {
          try {
            E.captive.follow(null);
          } catch (e) {
            /* ignore */
          }
          E.captive.aiMode = "sit";
          E.captive.home = { x: E.captive.pos.x, z: E.captive.pos.z, r: 1 };
          K.say(E.captive, "Don't shoot me! Don't shoot ME!", 2.5);
        }
      }
      if (E.state === "free") updateFreed(E, dt);
      if (E.state === "walking") {
        if (
          K.actorAlive(E.captive) &&
          K.distToPlayer(E.captive.pos.x, E.captive.pos.z) > 70 &&
          !K.inView(
            E.captive.pos.x,
            E.captive.pos.y + 1,
            E.captive.pos.z,
            1,
            true,
          )
        ) {
          K.removeActor(E.captive);
        }
        // the captive is home and the player has moved on: free the director (bodies stay until castGone would have taken them)
        if (
          !K.actorAlive(E.captive) &&
          (!alive.length || E.released) &&
          d > 110
        )
          return "gone";
      }
      // slavers that were talked out of it walk off and vanish once out of sight
      if (E.released)
        for (const a of alive)
          if (
            K.distToPlayer(a.pos.x, a.pos.z) > 60 &&
            !K.inView(a.pos.x, a.pos.y + 1, a.pos.z, 1, true)
          )
            K.removeActor(a);
      if (E.t > 900) return "gone";
      return U.castGone(E) ? "gone" : null;
    };
    E.cleanup = function () {
      if (slaverE === E) slaverE = null;
      U.removeCast(E);
    };
    slaverE = E;
    return E;
  }
  function free(how) {
    const E = slaverE;
    if (!E || E.state !== "bound") return;
    E.state = "free";
    E.freeT = 0;
    E.how = how;
    const c = E.captive;
    if (!K.actorAlive(c)) return;
    try {
      c.follow(null);
    } catch (e) {
      /* ignore */
    }
    c.aiMode = "static";
    c.home = { x: c.pos.x, z: c.pos.z, r: 1 };
    const town = nearestTown(c.pos.x, c.pos.z);
    E.town = town;
    K.say(
      c,
      how === "bought"
        ? "The collar... it's off. It's really off."
        : how === "rot"
          ? "They... they just left me? Is that... did you do that?"
          : "Is it over? Is it... oh God. Thank you. Thank you.",
      4,
    );
  }
