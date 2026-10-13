/* src/ambient_life/62_encounters_more.js */
/* =====================================================================
 * NEW RAD CITY — AMBIENT LIFE — 62: more street encounters
 *
 * Registered into the director of 60_encounters (K.encounters.register):
 *
 *   slavers        Three Rikers Island slavers walking a collared captive
 *                  to the ferry. Neutral until you make them otherwise.
 *                  Buy the captive's freedom (Trade haggle), talk them out
 *                  of it (Persuasion: "that's the Rot"), jam the collar's
 *                  latch under their noses (Mechanics), or gun them down
 *                  (killing slavers raises your standing). Freed, the
 *                  captive thanks you, pays what was hidden in a boot and
 *                  walks home to the nearest town. Captives are men or
 *                  women; lines and manifest follow suit.
 *   ambush         "Help... over here... I'm hurt..." A wounded drifter
 *                  sitting in the road. A sharp-eyed (Senses) player gets a
 *                  warning. Walk up and he calls you over and starts
 *                  talking: kneel to look at the leg and his friends come
 *                  out from behind the wrecks; call the bluff (Senses 7)
 *                  or walk off and they open up at range.
 *
 * Skill checks are keyed per encounter instance (response ids carry the
 * encounter's uid), so a check won or blown against one slaver gang does
 * not vanish from every later gang for the rest of the save. Response text
 * carries no hand-written skill tag: the dialogue UI adds it.
 *   sky_eye        A Continuity Sky-Eye propaganda drone drifting down the
 *                  avenue, blaring a tinny patriotic march through its
 *                  speaker, with Continuity bulletins (it is still 1967 as
 *                  far as the Continuity is concerned) between tunes.
 *                  Harmless until shot.
 *   patrolman      An old-world police Patrolman robot still walking its
 *                  beat under the 1967 curfew, citing citizens for
 *                  jaywalking.
 *
 * All original writing. Each encounter owns and cleans up its cast.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  const K = G.ambient._;
  if (!K.encounters || !K.encounters.register) return;
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
  function rewardCaptive(E) {
    if (E.rewarded) return;
    E.rewarded = true;
    K.addStanding(E.how === "bought" ? 35 : 50, "Freed a captive");
    K.addXP(40, "Freed a captive");
    K.give(K.SCRIP, K.randInt(20, 45));
    if (Math.random() < 0.5)
      K.give(K.pick(["rally_tonic", "purified_water", "duct_tape"]), 1);
  }
  function updateFreed(E, dt) {
    const c = E.captive;
    if (!K.actorAlive(c)) return;
    E.freeT += dt;
    if (!K.actorBusy(c)) c.faceTowards(G.player.pos.x, G.player.pos.z, 2, dt);
    // talked to (dialogue sets E.thanked) or nobody came over: head home
    if ((E.thanked || E.freeT > 45) && !K.actorBusy(c)) {
      if (!E.rewarded && K.distToPlayer(c.pos.x, c.pos.z) < 40) {
        rewardCaptive(E);
        K.say(
          c,
          "I'm going home. " +
            LOCNAME(E.town) +
            ". Here — I hid these in my boot. Take them.",
          5,
        );
      }
      E.state = "walking";
      if (E.town) {
        c.aiMode = "patrol";
        c.patrol = [{ x: E.town.x, z: E.town.z }];
        c.patrolIdx = 0;
        c.walkSpeed = Math.max(c.walkSpeed, 2.4);
      }
    }
  }
  function slaverDialogues() {
    const E = () => slaverE;
    const lead = () =>
      (E() && E().slavers.find((a) => K.actorAlive(a))) || null;
    const buy = (price) => {
      if (!E() || !K.takeScrip(price)) return;
      K.sfx(K.SFX_PAY);
      free("bought");
      const e = E();
      e.released = true;
      for (const a of e.slavers)
        if (K.actorAlive(a)) {
          a.aiMode = "patrol";
          a.patrol = [
            {
              x: a.pos.x + (a.pos.x - G.player.pos.x) * 4,
              z: a.pos.z + (a.pos.z - G.player.pos.z) * 4,
            },
          ];
          a.patrolIdx = 0;
          try {
            a.follow(null);
          } catch (err) {
            /* ignore */
          }
        }
    };
    const fight = () => {
      const e = E();
      if (!e) return;
      for (const a of e.slavers) K.aggro(a);
    };
    // captive pronouns (CAPTIVES mixes men and women)
    const male = () => !!(E() && E().capG === "m");
    const her = () => (male() ? "him" : "her"),
      hers = () => (male() ? "his" : "her"),
      she = () => (male() ? "he" : "she"),
      She = () => (male() ? "He" : "She");
    // per-instance response id: the dialogue engine remembers won/blown checks by id for the whole save
    const rid = (tag) => tag + "#" + ((E() && E().uid) || "0");
    K.registerDialogue("amb_dlg_slaver", {
      start: "hello",
      nodes: {
        hello: {
          text: () =>
            K.standing() <= -500
              ? "Well, well. You've got the look of someone who knows how the world works. This one's bound for the Rikers pens. Unless you want to make an offer."
              : "Keep walking, stranger. This one's bound for the Rikers Island pens, and the paperwork's in order. Unless you're buying.",
          responses: [
            { text: "How much for the captive?", next: "price" },
            {
              get id() {
                return rid("rot");
              },
              text: () =>
                "Look at those sores on " +
                hers() +
                " neck. That's the Rot. Rikers will burn your whole pen when they see " +
                her() +
                ".",
              check: { skill: "persuasion", value: 60 },
              next: "rot_ok",
              failNext: "rot_fail",
            },
            { text: () => "Let " + her() + " go. Now.", next: "threat" },
            {
              text: "Rikers hiring? I could use the work.",
              cond: () => K.standing() <= -250,
              next: "work",
            },
            { text: "Not my business. Goodbye.", end: true },
          ],
        },
        price: {
          text: () =>
            "Price is " +
            (E() ? E().price : 250) +
            " scrip. Cash, collar comes off, " +
            she() +
            "'s your problem. Don't ask me what you do with " +
            her() +
            " after. I don't want to know.",
          responses: [
            {
              text: () =>
                "[Pay " +
                (E() ? E().price : 250) +
                " scrip] Take it. Collar off.",
              cond: () => E() && K.scrip() >= E().price,
              action: () => buy(E().price),
              next: "sold",
            },
            {
              get id() {
                return rid("haggle");
              },
              text: () =>
                "For THAT? " +
                She() +
                " can barely stand. One-twenty, and you're robbing me.",
              cond: () => E() && E().price > 120,
              check: { skill: "trade", value: 50 },
              next: "haggle_ok",
              failNext: "haggle_fail",
            },
            { text: "Too rich for me.", next: "hello" },
          ],
        },
        haggle_ok: {
          text: "Hah! You haggle like a Neon pawnbroker. ...Fine. One-twenty. And you tell nobody I went soft.",
          onEnter: () => {
            if (E()) E().price = 120;
          },
          responses: [
            {
              text: "[Pay 120 scrip] Done.",
              cond: () => K.scrip() >= 120,
              action: () => buy(120),
              next: "sold",
            },
            { text: "I'll think about it.", end: true },
          ],
        },
        haggle_fail: {
          text: () =>
            "Nice try. Two-fifty, or you can watch " +
            her() +
            " walk onto the ferry.",
          responses: [
            { text: "Fine. Back up.", next: "price" },
            { text: "Forget it.", end: true },
          ],
        },
        sold: {
          text: "Pleasure doing business. Collar's off. Boys — we're done here.",
          responses: [{ text: "[Leave]", end: true }],
        },
        rot_ok: {
          text: () =>
            "...The Rot? Aw, hell. HELL. Last time somebody brought the Rot onto the island the Pen Boss fed the whole boat to the shellbacks. Keep " +
            her() +
            ". Keep " +
            her() +
            "! Boys, we're walking. Don't touch anything.",
          onEnter: () => {
            const e = E();
            if (!e) return;
            K.addXP(30, "Talked down the slavers");
            free("rot");
            e.released = true;
            for (const a of e.slavers)
              if (K.actorAlive(a)) {
                try {
                  a.follow(null);
                } catch (err) {
                  /* ignore */
                }
                a.aiMode = "patrol";
                a.patrol = [
                  {
                    x: a.pos.x + (a.pos.x - G.player.pos.x) * 4,
                    z: a.pos.z + (a.pos.z - G.player.pos.z) * 4,
                  },
                ];
                a.patrolIdx = 0;
              }
          },
          responses: [{ text: "Smart man.", end: true }],
        },
        rot_fail: {
          text: () =>
            "Those are bug bites. I checked " +
            hers() +
            " teeth myself. Walk away, friend, while that's still an option.",
          responses: [
            { text: () => "Let " + her() + " go. Now.", next: "threat" },
            { text: "Fine.", end: true },
          ],
        },
        threat: {
          text: "Or what? ...Heh. Boys, looks like we've got a second collar to fill.",
          responses: [{ text: "[Attack]", action: fight, end: true }],
        },
        work: {
          text: "Bring us bodies with a pulse (collared, fed, walking) and the Pen Boss pays a hundred a head. Ferry leaves the Battery slip at dusk. Knock three times.",
          responses: [{ text: "I'll keep it in mind.", end: true }],
        },
      },
    });
    K.registerDialogue("amb_dlg_captive", {
      start: () => (!E() ? "gone" : E().state === "bound" ? "bound" : "free"),
      nodes: {
        bound: {
          text: () =>
            "Please... please don't just walk past. They grabbed me outside " +
            LOCNAME(nearestTown(G.player.pos.x, G.player.pos.z)) +
            ". They're taking me to Rikers. Nobody comes back from Rikers.",
          responses: [
            {
              get id() {
                return rid("jam");
              },
              text: "Hold still. That latch is cheap work. I can slip it with a bit of wire.",
              check: { skill: "mechanics", value: 50 },
              next: "jam_ok",
              failNext: "jam_fail",
            },
            { text: "I'll get you out of this.", next: "promise" },
            { text: "Sorry. Not my fight.", end: true },
          ],
        },
        promise: {
          text: "The big one has the key. Or... or you could buy me. I'll pay you back. I swear I will.",
          responses: [{ text: "Sit tight.", end: true }],
        },
        jam_ok: {
          text: "*click*... it's OFF! Oh God, they saw! RUN!",
          onEnter: () => {
            const e = E();
            if (!e) return;
            K.addXP(20, "Slipped a captive's collar");
            free("slipped");
            for (const a of e.slavers) K.aggro(a);
            e.thanked = true;
          },
          responses: [{ text: "[Fight]", end: true }],
        },
        jam_fail: {
          text: "It's not... it's not budging. Stop, stop, they're looking this way!",
          responses: [{ text: "Later.", end: true }],
        },
        free: {
          text: () => {
            const e = E();
            return (
              "You actually did it. I'm going home to " +
              LOCNAME(e && e.town) +
              ". I hid a little scrip in my boot. It's yours. I won't forget this."
            );
          },
          onEnter: () => {
            const e = E();
            if (e) {
              e.thanked = true;
              rewardCaptive(e);
            }
          },
          responses: [{ text: "Stay off the avenues. Go.", end: true }],
        },
        gone: {
          text: "Thank you. For everything.",
          responses: [{ text: "Take care.", end: true }],
        },
      },
    });
  }

  // ==================================================================
  // THE BAIT (ambush)
  // ==================================================================
  let baitE = null;
  function encAmbush() {
    const P = G.player.pos;
    const s = K.streetSpot(P.x, P.z, 40, 60, {
      road: true,
      hidden: true,
      notSettlement: true,
      clear: 1.2,
      tries: 40,
    });
    if (!s) return null;
    const lvl = K.level();
    const decoy = K.spawnActor({
      type: "human",
      outfit: K.outfit("drifter", "settler"),
      gender: "m",
      hair: "short",
      faction: "amb_decoy",
      hostile: false,
      name: "Wounded Drifter",
      level: Math.max(3, lvl),
      hp: 70,
      pos: s,
      yaw: K.yawTo(s.x, s.z, P.x, P.z),
      ai: "sit",
      weapon: K.itemExists("pistol_10mm") ? "pistol_10mm" : "none",
      noRespawn: true,
      dialogue: "amb_dlg_bait",
      voice: "raider",
      seed: "amb_bait" + Math.floor(Math.random() * 99),
      barks: {
        idle: [
          "Help... somebody... over here...",
          "Please... my leg...",
          "Anybody got a tonic? Please...",
        ],
        greet: ["Oh thank God, over here! Please!"],
      },
      inventory: K.stock([
        [K.SCRIP, K.randInt(20, 50)],
        ["amb_note_bait_plan", 1],
        ["rally_tonic", 1],
        ["ammo_10mm", 14],
      ]),
    });
    if (!decoy) return null;
    const E = {
      kind: "ambush",
      x: s.x,
      z: s.z,
      actors: [decoy],
      decoy,
      t: 0,
      state: "bait",
      warned: false,
      callT: 0,
      lvl,
      uid: newUid(),
      greeted: false,
      nearT: 0,
      leftT: 0,
    };
    E.update = function (dt) {
      E.t += dt;
      const d = K.distToPlayer(decoy.pos.x, decoy.pos.z);
      if (E.state === "bait") {
        if (!K.actorAlive(decoy)) {
          E.state = "done";
          return U.castGone(E) ? "gone" : null;
        }
        if (decoy.inCombat || decoy.hp < decoy.maxHp) {
          spring(E, false);
          return null;
        }
        E.callT -= dt;
        if (E.callT <= 0 && d < 55) {
          E.callT = K.rand(5, 9);
          K.say(
            decoy,
            K.pick([
              "Help! Over here!",
              "Please, I can't walk! Help me!",
              "Raiders... they jumped me... please...",
            ]),
            3,
          );
        }
        if (!E.warned && d < 32 && K.attr("senses") >= 7) {
          E.warned = true;
          G.notify(
            "[Senses] Something's off. The \"wounded\" man's pistol is within easy reach, and there are fresh boot prints leading behind the wrecks.",
          );
        }
        const busy = K.actorBusy(decoy);
        const canTalk =
          !G.isStub("dialogue") &&
          G.dialogue &&
          typeof G.dialogue.start === "function";
        // force-greet: he calls you over and starts the conversation himself once you are close
        // (outside the 3.2 m talk range, so the story always gets told before anything happens).
        if (!E.greeted && canTalk && d < 5.5 && G.state === "play" && !busy) {
          E.greeted = true;
          try {
            if (!G.dialogue.start("amb_dlg_bait", decoy)) E.greeted = false;
          } catch (e) {
            E.greeted = false;
            G.reportError("ambient:bait greet", e);
          }
          return null;
        }
        if (busy) {
          E.nearT = 0;
          return null;
        }
        // no dialogue engine: the old proximity trigger, right on top of him
        if (!canTalk && d < 2.5) {
          spring(E, false);
          return null;
        }
        // walked away after the talk: they give up the act and open fire at range
        if (E.greeted && E.leftT && d > 14) {
          spring(E, true);
          return null;
        }
        // dismissed the talk (Esc) but loiters right on top of him: the boys stop waiting
        if (E.greeted && d < 2.5) {
          E.nearT += dt;
          if (E.nearT > 4) {
            spring(E, false);
            return null;
          }
        } else E.nearT = 0;
        // dismissed the talk and wandered off without an answer: count it as walking away
        if (E.greeted && !E.leftT && d > 20) E.leftT = K.now() || 1;
        return d > 200 ? "gone" : null;
      }
      return U.castGone(E) || E.t > 600 ? "gone" : null;
    };
    E.cleanup = function () {
      if (baitE === E) baitE = null;
      U.removeCast(E);
    };
    baitE = E;
    return E;
  }
  /** The trap closes: the decoy gets up shooting, his friends come out from behind the wrecks. */
  function spring(E, called) {
    if (!E || E.state !== "bait") return;
    E.state = "sprung";
    const dc = E.decoy,
      P = G.player.pos;
    if (K.actorAlive(dc)) {
      dc.faction = "raiders";
      dc.name = called ? "Ricky the Bait" : "Raider";
      K.say(
        dc,
        called
          ? E.leftT
            ? K.pick([
                "Screw it — mark's walking! Light 'em up!",
                "Cheap bastard. Boys — NOW!",
              ])
            : "Damn it — they made us! Light 'em up!"
          : K.pick([
              "NOW, boys!",
              "Surprise, sucker!",
              "Hah! Works every time!",
            ]),
        3,
      );
      K.aggro(dc);
    }
    const n = K.randInt(2, 3) + (E.lvl >= 8 ? 1 : 0);
    const ax = dc ? dc.pos.x : E.x,
      az = dc ? dc.pos.z : E.z;
    for (let i = 0; i < n; i++) {
      // behind cover off to the sides of the bait, out of the player's view when possible
      const sp =
        K.streetSpot(ax, az, 9, 18, {
          road: false,
          hidden: true,
          clear: 0.8,
          tries: 24,
        }) ||
        K.freeSpotNear(
          ax + (Math.random() - 0.5) * 16,
          az + (Math.random() - 0.5) * 16,
          4,
          12,
        );
      if (!sp) continue;
      const a = K.spawnActor({
        type: "raider",
        faction: "raiders",
        voice: "raider",
        level: Math.max(2, E.lvl + K.randInt(-1, 1)),
        pos: sp,
        yaw: K.yawTo(sp.x, sp.z, P.x, P.z),
        ai: "patrol",
        patrol: [{ x: P.x, z: P.z }],
        noRespawn: true,
      });
      if (a) {
        E.actors.push(a);
        K.aggro(a);
        if (i === 0)
          K.say(
            a,
            called
              ? E.leftT
                ? "Told you nobody falls for the leg thing anymore, Ricky!"
                : "Told you that one was too smart for the leg thing, Ricky!"
              : "Heh. Nobody walks past a bleeding man.",
            3,
          );
      }
    }
    if (K.fauna) K.fauna.scare(ax, az, 60);
  }
  function baitDialogue() {
    K.registerDialogue("amb_dlg_bait", {
      start: "hello",
      nodes: {
        hello: {
          text: "Oh thank God. Raiders, three of 'em, took my pack and shot me in the leg. I can't stand. Please, you gotta have a Rally Tonic. Come closer, I can't... I can't shout anymore.",
          responses: [
            {
              text: "Let me take a look at that leg.",
              action: () => spring(baitE, false),
              end: true,
            },
            {
              get id() {
                return "called#" + ((baitE && baitE.uid) || "0");
              },
              text: "Your leg's fine, and your friends behind that wreck are breathing too loud.",
              check: { attr: "senses", value: 7 },
              next: "called",
              failNext: "nothing",
            },
            {
              text: "Good luck.",
              action: () => {
                if (baitE) baitE.leftT = K.now() || 1;
              },
              end: true,
            },
          ],
        },
        called: {
          text: "...Huh. Huh! You know, most people just kneel down. Most people are very trusting. ...BOYS!",
          onEnter: () => {
            K.addXP(20, "Saw through an ambush");
          },
          responses: [
            {
              text: "[Draw your weapon]",
              action: () => spring(baitE, true),
              end: true,
            },
          ],
        },
        nothing: {
          text: "W-what? What friends? Please, I'm bleeding out here — just come closer...",
          responses: [
            {
              text: "Alright, let me see.",
              action: () => spring(baitE, false),
              end: true,
            },
            {
              text: "No.",
              action: () => {
                if (baitE) baitE.leftT = K.now() || 1;
              },
              end: true,
            },
          ],
        },
      },
    });
  }

  // ==================================================================
  // CONTINUITY SKY-EYE PROPAGANDA DRONE (tinny march through a speaker)
  // ==================================================================
  // Original march in C, 2/4 at 116 bpm; [midi, eighths]; 0 = rest. Two phrases, then the broadcast.
  const MEL = [
    [67, 1],
    [64, 1],
    [67, 1],
    [72, 1],
    [76, 1],
    [74, 1],
    [72, 1],
    [67, 1],
    [69, 1],
    [65, 1],
    [69, 1],
    [72, 1],
    [71, 2],
    [67, 2],
    [67, 1],
    [64, 1],
    [67, 1],
    [72, 1],
    [76, 1],
    [77, 1],
    [79, 1],
    [76, 1],
    [74, 1],
    [71, 1],
    [67, 1],
    [71, 1],
    [72, 3],
    [0, 1],
    [76, 1],
    [76, 1],
    [77, 1],
    [79, 1],
    [81, 2],
    [79, 2],
    [77, 1],
    [77, 1],
    [76, 1],
    [74, 1],
    [76, 2],
    [72, 2],
    [74, 1],
    [74, 1],
    [76, 1],
    [77, 1],
    [79, 1],
    [77, 1],
    [76, 1],
    [74, 1],
    [72, 1],
    [71, 1],
    [69, 1],
    [71, 1],
    [72, 3],
    [0, 1],
  ];
  const CHORDS = [
    48, 48, 53, 55, 48, 48, 55, 48, 48, 53, 48, 48, 50, 55, 55, 48,
  ]; // root per bar (C C F G ...)
  const BROADCAST = [
    "This is Continuity Radio. Today's date is March 1967. Please set your clocks accordingly.",
    "Citizens: carry your 1967 enrolment card at all times. Rations and medicine are issued against enrolment only. Relief Station regulations remain in force.",
    "Directive 7-A is in preparation. Unenrolled persons will be advised of their schedule. Do not approach the Array. Do not approach Liberty Island.",
    "Citizens of New York: the emergency is temporary. Remain indoors and await the all-clear from your block captain.",
    "Acting President Marsh reminds you: ration books remain valid. Hoarding is unpatriotic. Federal scrip is legal tender.",
    "Unlicensed radio transmission is a federal offence under the Emergency Powers Act of 1967.",
    "The government is functioning normally. Repeat: the government is functioning normally. Stand by for further instructions.",
    "Report all foreign agents, French or otherwise, to the nearest Continuity patrol. Loose talk costs lives.",
  ];
  /** A positional "radio speaker" march loop. Returns {update(pos, level, realDt), stop(), onBreak(fn)}. */
  K.synth.march = function () {
    const H = {
      alive: true,
      update() {
        /* no audio */
      },
      stop() {
        H.alive = false;
      },
    };
    const SY = K.synth,
      c = SY.ctx();
    if (!c) return H;
    const ch = SY.chain(c, { x: 0, y: 0, z: 0 }, 9, 0.0001);
    ch.panner.rolloffFactor = 1.4;
    // speaker colouring: band-limited, a little crunchy
    const hp = c.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 420;
    const lp = c.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 3200;
    const pk = c.createBiquadFilter();
    pk.type = "peaking";
    pk.frequency.value = 1500;
    pk.gain.value = 7;
    pk.Q.value = 1.2;
    const sh = c.createWaveShaper();
    const cv = new Float32Array(512);
    for (let i = 0; i < 512; i++) {
      const x = i / 255.5 - 1;
      cv[i] = Math.tanh(x * 2.2) * 0.8;
    }
    sh.curve = cv;
    const bus = c.createGain();
    bus.gain.value = 0.55;
    bus.connect(sh);
    sh.connect(hp);
    hp.connect(lp);
    lp.connect(pk);
    pk.connect(ch.input);
    // faint carrier hiss
    const hiss = c.createBufferSource();
    hiss.buffer = SY.noise(c);
    hiss.loop = true;
    const hg = c.createGain();
    hg.gain.value = 0.025;
    hiss.connect(hg);
    hg.connect(hp);
    hiss.start();
    const EIGHTH = 60 / 116 / 2;
    let nextT = c.currentTime + 0.1,
      idx = 0,
      loops = 0,
      breakUntil = 0,
      lvl = 0;
    const midi = (m) => 440 * Math.pow(2, (m - 69) / 12);
    function note(type, f, t, dur, g) {
      const o = c.createOscillator();
      o.type = type;
      o.frequency.value = f;
      const e = c.createGain();
      e.gain.setValueAtTime(0.0001, t);
      e.gain.exponentialRampToValueAtTime(g, t + 0.012);
      e.gain.exponentialRampToValueAtTime(g * 0.5, t + dur * 0.5);
      e.gain.exponentialRampToValueAtTime(0.0001, t + dur * 0.95);
      o.connect(e);
      e.connect(bus);
      o.start(t);
      o.stop(t + dur);
    }
    function drum(t, g, f) {
      const s = c.createBufferSource();
      s.buffer = SY.noise(c);
      const bp = c.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = f;
      bp.Q.value = 0.9;
      const e = c.createGain();
      e.gain.setValueAtTime(g, t);
      e.gain.exponentialRampToValueAtTime(0.0001, t + 0.11);
      s.connect(bp);
      bp.connect(e);
      e.connect(bus);
      s.start(t, Math.random());
      s.stop(t + 0.13);
    }
    let eighthCount = 0;
    function schedule() {
      const horizon = c.currentTime + 0.5;
      if (nextT < c.currentTime - 0.05) nextT = c.currentTime + 0.05; // resumed after a pause: don't burst the backlog
      while (nextT < horizon) {
        if (c.currentTime < breakUntil) {
          nextT = breakUntil;
          return;
        }
        const [m, len] = MEL[idx];
        const dur = len * EIGHTH;
        if (m) {
          note("square", midi(m), nextT, dur * 0.92, 0.16);
          note("triangle", midi(m + 12), nextT, dur * 0.6, 0.05);
        }
        // oom-pah bass + snare on the off-beats, per eighth
        for (let k = 0; k < len; k++) {
          const tt = nextT + k * EIGHTH,
            e8 = eighthCount + k,
            bar = Math.floor(e8 / 4) % CHORDS.length,
            r = CHORDS[bar];
          if (e8 % 2 === 0)
            note(
              "triangle",
              midi(e8 % 4 === 0 ? r - 12 : r - 5),
              tt,
              EIGHTH * 0.9,
              0.22,
            );
          else {
            note("square", midi(r + 4), tt, EIGHTH * 0.5, 0.05);
            note("square", midi(r + 7), tt, EIGHTH * 0.5, 0.04);
            drum(tt, 0.28, 2200);
          }
          if (e8 % 4 === 0) drum(tt, 0.35, 180);
        }
        eighthCount += len;
        nextT += dur;
        idx++;
        if (idx >= MEL.length) {
          idx = 0;
          eighthCount = 0;
          loops++;
          // after each full tune: a spoken broadcast break
          breakUntil = nextT + 7.5;
          nextT = breakUntil;
          if (H.onBreak) {
            const at = nextT - 7.5;
            setTimeout(
              () => {
                if (H.alive && H.onBreak) H.onBreak();
              },
              Math.max(0, (at - c.currentTime) * 1000),
            );
          }
        }
      }
    }
    H.update = function (pos, level, realDt) {
      if (!H.alive) return;
      const now = c.currentTime,
        P = ch.panner;
      if (P.positionX) {
        P.positionX.setTargetAtTime(pos.x, now, 0.05);
        P.positionY.setTargetAtTime(pos.y, now, 0.05);
        P.positionZ.setTargetAtTime(pos.z, now, 0.05);
      } else P.setPosition(pos.x, pos.y, pos.z);
      const running = G.worldRunning && G.worldRunning();
      lvl += ((running ? level : 0) - lvl) * Math.min(1, (realDt || 0.016) * 3);
      ch.out.gain.setTargetAtTime(Math.max(0.0001, lvl * SY.vol()), now, 0.1);
      if (running) schedule();
      else {
        nextT = Math.max(nextT, now + 0.1);
      }
    };
    H.stop = function () {
      if (!H.alive) return;
      H.alive = false;
      const now = c.currentTime;
      try {
        ch.out.gain.cancelScheduledValues(now);
        ch.out.gain.setTargetAtTime(0.0001, now, 0.1);
      } catch (e) {
        /* ignore */
      }
      try {
        hiss.stop(now + 0.6);
      } catch (e) {
        /* ignore */
      }
      setTimeout(() => {
        try {
          ch.out.disconnect();
        } catch (e) {
          /* ignore */
        }
      }, 900);
    };
    return H;
  };

  function encSkyEye() {
    const P = G.player.pos;
    const s = K.streetSpot(P.x, P.z, 50, 80, {
      road: true,
      notSettlement: true,
      clear: 1,
      tries: 40,
    });
    if (!s) return null;
    // drift down the street past the player: target the far side
    const tx = s.x + (P.x - s.x) * 2.2,
      tz = s.z + (P.z - s.z) * 2.2;
    const a = K.spawnActor({
      type: "sky_eye",
      faction: "amb_broadcast",
      hostile: false,
      name: "Continuity Sky-Eye",
      level: Math.max(2, K.level()),
      pos: { x: s.x, y: s.y, z: s.z },
      ai: "patrol",
      patrol: [
        { x: tx, z: tz },
        { x: s.x, z: s.z },
      ],
      noRespawn: true,
      voice: "amb_none",
      barks: {
        idle: [
          "*static* ...the government is functioning normally...",
          "*crackle*",
        ],
        greet: ["*BZZT* Citizen. Remain calm."],
      },
    });
    if (!a) return null;
    const E = {
      kind: "sky_eye",
      x: s.x,
      z: s.z,
      actors: [a],
      t: 0,
      fx: [],
      line: 0,
    };
    const m = K.synth.march();
    E.fx.push(m);
    m.onBreak = function () {
      if (!K.actorAlive(a) || a.inCombat) return;
      if (K.distToPlayer(a.pos.x, a.pos.z) < 60) {
        K.say(a, BROADCAST[E.line++ % BROADCAST.length], 7);
        K.sfx("radio_static", { pos: a.pos, volume: 0.5 });
      }
    };
    E.update = function (dt, realDt) {
      E.t += dt;
      if (!K.actorAlive(a)) {
        m.stop();
        return U.castGone(E) ? "gone" : null;
      }
      E.x = a.pos.x;
      E.z = a.pos.z;
      _v.set(a.pos.x, a.pos.y + 0.3, a.pos.z);
      const d = K.distToPlayer(a.pos.x, a.pos.z);
      m.update(
        _v,
        a.inCombat || a.hostile()
          ? 0
          : K.clamp(1.25 - d / 110, 0, 1) *
              (K.isInterior(G.player.pos.x) ? 0 : 1),
        realDt || dt,
      );
      // drifted on past the player and out of sight: free the director for the next encounter
      if (
        E.t > 90 &&
        d > 120 &&
        !a.inCombat &&
        !K.inView(a.pos.x, a.pos.y, a.pos.z, 1, true)
      )
        return "gone";
      return U.castGone(E) || E.t > 300 ? "gone" : null;
    };
    E.cleanup = function () {
      m.stop();
      U.removeCast(E);
    };
    return E;
  }

  // ==================================================================
  // NYPD PATROLMAN ROBOT ON ITS BEAT
  // ==================================================================
  const COP_LINES = [
    "CITIZEN. THIS AREA IS UNDER CURFEW. CURFEW BEGAN: MARCH 1967.",
    "PLEASE HAVE YOUR IDENTIFICATION READY.",
    "LOITERING IS DISCOURAGED. THANK YOU FOR YOUR COOPERATION.",
    "ALL CITIZENS: PROCEED IN AN ORDERLY FASHION TO THE NEAREST PUBLIC SHELTER.",
    "THE NYPD IS YOUR FRIEND.",
    "REPORTING: ALL QUIET ON BEAT 14. ALL QUIET ON BEAT 14. ALL QUIET ON...",
  ];
  function encPatrolman() {
    const P = G.player.pos;
    const s = K.streetSpot(P.x, P.z, 35, 60, {
      road: true,
      hidden: true,
      notSettlement: true,
      clear: 1,
      tries: 40,
    });
    if (!s) return null;
    const ax = G.LAYOUT.isRoad(s.x + 20, s.z) && G.LAYOUT.isRoad(s.x - 20, s.z);
    const pts = ax
      ? [
          { x: s.x - 30, z: s.z },
          { x: s.x + 30, z: s.z },
        ]
      : [
          { x: s.x, z: s.z - 30 },
          { x: s.x, z: s.z + 30 },
        ];
    const a = K.spawnActor({
      type: "patrolman",
      faction: "amb_civic",
      hostile: false,
      name: "Police Patrolman",
      level: Math.max(3, K.level()),
      pos: s,
      ai: "patrol",
      patrol: pts,
      noRespawn: true,
      voice: "amb_none",
      barks: { idle: COP_LINES, greet: ["HALT, CITIZEN."] },
      inventory: K.stock([
        ["ammo_dry_cell", K.randInt(1, 3)],
        ["scrap_electronics", 1],
      ]),
    });
    if (!a) return null;
    const E = {
      kind: "patrolman",
      x: s.x,
      z: s.z,
      actors: [a],
      pickups: [],
      t: 0,
      cited: false,
      talkT: 3,
    };
    E.update = function (dt) {
      E.t += dt;
      if (!K.actorAlive(a)) return U.castGone(E) ? "gone" : null;
      E.x = a.pos.x;
      E.z = a.pos.z;
      E.talkT -= dt;
      const d = K.distToPlayer(a.pos.x, a.pos.z);
      if (a.inCombat || a.hostile()) return U.castGone(E) ? "gone" : null;
      if (E.talkT <= 0 && d < 40) {
        E.talkT = K.rand(9, 16);
        K.say(a, K.pick(COP_LINES), 4.5);
        K.sfx("robot_voice", { pos: a.pos, volume: 0.5 });
      }
      if (!E.cited && d < 6) {
        E.cited = true;
        E.stopT = 5;
        a.aiMode = "static";
        a.faceTowards(G.player.pos.x, G.player.pos.z);
        K.say(
          a,
          "HALT, CITIZEN. YOU HAVE CROSSED AGAINST THE SIGNAL. A CITATION HAS BEEN ISSUED. HAVE A SAFE AND PRODUCTIVE DAY.",
          6,
        );
        K.sfx("robot_beep", { pos: a.pos, volume: 0.6 });
        if (
          K.itemExists("amb_note_citation") &&
          !(G.inventory.count && G.inventory.count("amb_note_citation") > 0)
        )
          K.give("amb_note_citation", 1);
      }
      if (E.stopT !== undefined) {
        E.stopT -= dt;
        a.faceTowards(G.player.pos.x, G.player.pos.z, 2, dt);
        if (E.stopT <= 0) {
          E.stopT = undefined;
          a.aiMode = "patrol";
        }
      }
      if (
        E.t > 90 &&
        d > 120 &&
        !K.inView(a.pos.x, a.pos.y + 1, a.pos.z, 1, true)
      )
        return "gone";
      return U.castGone(E) || E.t > 360 ? "gone" : null;
    };
    E.cleanup = function () {
      U.removeCast(E);
    };
    return E;
  }

  // ------------------------------------------------------------------
  // Registration
  // ------------------------------------------------------------------
  const reg = K.encounters.register;
  reg("slavers", {
    make: encSlavers,
    cd: 30,
    w: () => (K.level() >= 2 ? (K.isDark() ? 0.4 : 1.0) : 0),
  });
  reg("ambush", {
    make: encAmbush,
    cd: 26,
    w: () => (K.level() >= 2 ? (K.isDark() ? 1.1 : 0.8) : 0),
  });
  reg("sky_eye", {
    make: encSkyEye,
    cd: 30,
    w: () => (K.relation("player", "continuity") === "ally" ? 0.3 : 0.8),
  });
  reg("patrolman", {
    make: encPatrolman,
    cd: 40,
    w: () => (K.isDark() ? 0.8 : 0.5),
  });

  K.system({
    name: "encounters_more",
    order: 61,
    initDone() {
      defineNotes();
      slaverDialogues();
      baitDialogue();
    },
    newGame() {
      defineNotes();
      slaverDialogues();
      baitDialogue();
    },
    reset() {
      slaverE = null;
      baitE = null;
    },
  });
})();
