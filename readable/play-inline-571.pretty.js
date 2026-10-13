/* src/quests/70_director.js */
/* =====================================================================
 * NEW RAD CITY — QUESTS — 70: DIRECTOR
 * Cross-cutting glue: contextual tutorial hints for the first hour,
 * radio news reacting to the hero's travels ("Rocky" Delgado keeps tabs),
 * quest-chain repair after loading older saves, world lore notes, and
 * debug helpers.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const L = G.quests.lib;
  const Q = G.quests;

  // Old flag values / id prefixes / stage ids written by content that has not converted yet.

  // ------------------------------------------------------------------
  // Contextual tutorial hints (each shown once per playthrough)
  // ------------------------------------------------------------------
  G.events.on("playerDamaged", () => {
    if (G.player.hp < G.player.maxHp * 0.55)
      L.hint(
        "tonic",
        "You're hurt. Drink a Rally Tonic: goggles [Tab] → INVENTORY → AID, or put it on a hotkey [1-8]. It heals over a few seconds, so drink it early.",
      );
  });
  G.events.on("radsChanged", (r) => {
    if (r > 40)
      L.hint(
        "radiation",
        "You are taking in radiation (the gauge beside your health). Prussian Blue capsules flush it out over a minute; iodine tabs raise your resistance. Avoid standing water and anything that glows.",
      );
  });
  G.events.on("combatStart", () => {
    L.hint(
      "combat",
      "In a fight: [Right Mouse] aims down the sights, [C] crouches, [R] reloads. Cover is your friend; so is running.",
    );
  });
  G.events.on("playerDetected", () => {
    L.hint(
      "sneak",
      "Press [C] to sneak. Stay out of sight and move slowly; Stealth grows every time you slip past unnoticed.",
    );
  });
  G.events.on("levelUp", () => {
    L.hint(
      "levelup",
      "Level up! Pick a Talent. Every second level also raises an attribute. Skills grow by using them.",
    );
  });
  // Goggles, keypads and codes (the city's locks open with keys, keypad codes and terminal passcodes).
  G.events.on("codeLearned", () => {
    L.hint(
      "codes",
      "Codes you find are logged in your goggles under NOTES → CODES.",
      1,
    );
  });
  G.events.on("lockBlocked", () => {
    L.hint(
      "locked",
      "Locked. Doors, safes and terminals open with a key, a keypad code or a passcode. Look for notes, tape reels and terminals nearby; " +
        "codes you have found are in your goggles under NOTES → CODES.",
      0.5,
    );
  });
  G.events.on("locationDiscovered", (loc) => {
    if (!loc) return;
    if (loc.hostile)
      L.hint(
        "hostile_loc",
        "Hostile territory. Enemies that have noticed you show up on the ring minimap.",
        1.5,
      );
    if (loc.type === "settlement")
      L.hint(
        "merchants",
        'Settlements have merchants. Talk to them and choose "trade" to buy and sell for scrip.',
        2,
      );
    // Rocky Delgado keeps tabs on the sleeper.
    const news = {
      times_square:
        "Spotted in Times Square: a fella in a grey cryo suit, gawking at the neon like a tourist off the Staten Island boat. Welcome to the Crossroads of the World, pal. Tip your barkeep.",
      empire_state:
        "Word from 34th Street: somebody in a padded cryo suit is poking around the Empire State Building. Friend, whoever you are — the big grey fellas up there do not sign autographs.",
      brooklyn_bridge:
        "Traffic advisory: we've got a sleeper on the Brooklyn Bridge. Tony, if you're listening — be nice.",
      liberty:
        "Somebody just made it to Liberty Island. Ossie says he didn't take them. Ossie says a lot of things.",
      wall_street:
        "Heads up, Financial District: a sleeper is walking into the Exchange. Betty, the market's about to get volatile.",
      city_hall:
        "Somebody climbed out from under the Municipal Building this week, blinking like a mole at noon. If that's you, sleeper: the year is 1989, the coffee is terrible, and you're listening to Radio Free Manhattan.",
    }[loc.id];
    if (news && L.once("news_loc_" + loc.id)) L.news(news);
  });

  // ------------------------------------------------------------------
  // Reactive barks: named NPCs comment on what the hero has done.
  // Each rule: [npc id regex, condition, line]. First match wins.
  // ------------------------------------------------------------------
  const F = (k) => L.flag(k);
  /** 0 best … 4 worst — the same scale as the goggles' Standing title. */
  function tier() {
    return L.standingTier();
  }
  const sided = (k) => F("mq_faction") === k;
  const REACT = [
    [/.*/, () => tier() >= 4, "Stay away from me. I've heard what you did."],
    [
      /^(gc_|fl_|rc_|bp_)/,
      () => tier() === 0,
      "It's you! My cousin says you saved her whole wagon train. Or her whole cousin. Something like that.",
    ],
    [
      /^(gc_|rc_|neon_|fl_|bp_|ws_charlie)/,
      () => F("ending_choice") === "purify",
      "Have you SEEN the sky? It's blue! Like in the old magazines!",
    ],
    [
      /^(gc_|rc_)/,
      () => F("ending_choice") === "selective",
      "They say you threw the switch on Directive 7-A. ...Please just go.",
    ],
    [
      /^gc_guard/,
      () => F("glow_isotope_planted"),
      "Don't drink the water. Just... don't.",
    ],
    [
      /^gc_guard/,
      () => F("dolores_recruited"),
      "Dolores has all of 42nd covered. Creepy. Effective. Creepy.",
    ],
    [
      /^gc_delphine/,
      () => F("bridge_legit"),
      "Tony the raider sent me a receipt. A RECEIPT. Framed it.",
    ],
    [
      /^gc_/,
      () => Q.isComplete("mq03"),
      "Hey, it's the sleeper who got Rocky back on the air!",
    ],
    [
      /^neon_/,
      () => F("neon_outcome") === "crowe" || F("neon_outcome") === "repair",
      "Citizen! Aren't the lights gorgeous tonight?",
    ],
    [
      /^neon_/,
      () => F("wendell_wed"),
      "You hear Wendell finally asked? Twenty-two years! Took him long enough.",
    ],
    [
      /^neon_/,
      () => F("neon_outcome") === "sold" || F("neon_outcome") === "glow",
      "You sold our lights. Keep walking, topsider.",
    ],
    [
      /^cov_/,
      () => sided("covenant"),
      "The Covenant remembers its friends, Acolyte.",
    ],
    [
      /^cov_/,
      () => sided("continuity"),
      "Continuity collaborator. Keep your hands where I can see them.",
    ],
    [
      /^glow_/,
      () => F("glow_isotope_planted") || F("glow_placebo_planted"),
      "Blessed be the one who carried the Glow to Grand Central!",
    ],
    [
      /^fl_/,
      () => F("wagon_honest"),
      "Hattie says you're the most honest person in Manhattan. Low bar, but still.",
    ],
    [
      /^bp_ossie/,
      () => Q.isComplete("sq_shellshock"),
      "No crabs on my boat in a week. You're a legend, pal.",
    ],
    [/^esb_kong/, () => F("kong_friend"), "SMALL FRIEND! FAY SAYS HELLO!"],
  ];
  const lastBark = {};
  let barkT = 0;
  L.hook("update", function (dt, realDt) {
    barkT -= realDt;
    if (barkT > 0) return;
    barkT = 1.5;
    if (G.state !== "play" || G.isStub("actors") || !G.actors.nearest) return;
    // Never talk over a scripted moment (camera scripts).
    if (L.cineActive()) return;
    const P = G.player.pos;
    let a = null;
    try {
      a = G.actors.nearest(
        P,
        6,
        (x) =>
          !x.dead && x.questNpc && !(x.hostile && x.hostile()) && !x.inCombat,
      );
    } catch (e) {
      a = null;
    }
    if (!a || (lastBark[a.id] && G.time.real - lastBark[a.id] < 60)) return;
    for (const r of REACT) {
      if (!r[0].test(a.id)) continue;
      let ok = false;
      try {
        ok = r[1]();
      } catch (e) {
        ok = false;
      }
      if (ok) {
        lastBark[a.id] = G.time.real;
        L.say(a.id, r[2]);
        break;
      }
    }
  });

  // ------------------------------------------------------------------
  // Chain repair (saves made mid-transition, or skipped steps)
  // ------------------------------------------------------------------
  function repairChain() {
    // The main story's spine (61_ms_core.js) starts every main quest whose prerequisites are complete.
    if (!Q.isStarted("mq01") && L.flag("left_cryo")) Q.start("mq01");
  }
  L.hook("loaded", repairChain);
  let repairT = 0;
  L.hook("update", function (dt, realDt) {
    repairT -= realDt;
    if (repairT > 0) return;
    repairT = 5;
    repairChain();
  });

  // ------------------------------------------------------------------
  // World lore notes (flavour pickups at landmarks), 1966–1967 and after
  // ------------------------------------------------------------------
  const LORE = [
    {
      id: "q_lore_playbill",
      name: 'Playbill: "Moonshot Molly!"',
      title: "THE BROADHURST THEATRE PRESENTS",
      text:
        '"MOONSHOT MOLLY!" — The Musical Sensation of the 1967 Season!\n\nAct I: "My Baby Orbits Me"\nAct II: "Countdown to Kissing"\nFinale: ' +
        '"Tomorrow (Is Just Around the Corner)"\n\nMatinee: Saturday, March 11th. Doors 1:00 P.M.\n\n[Somebody has written "sold out" across it, ' +
        'and then, later, in a different hand, "nobody came."]',
      site: "times_square",
      anchors: ["note1", "loot1", "stage"],
      off: { x: -18, z: -30 },
    },
    {
      id: "q_lore_sterlings_flyer",
      name: "Flyer: Sterling's Doorbusters",
      title: "STERLING'S OF HERALD SQUARE — WASHINGTON'S BIRTHDAY DOORBUSTERS",
      text:
        'DOORS OPEN 7 A.M. WEDNESDAY, FEBRUARY 22, 1967!\n\n- The Valet Home Robot by American Automaton Co. — 40% OFF! "Built in America, to serve America."\n- LONLY Color Consoles — 3 for the ' +
        'price of 2! "The best company in the house."\n- Office of Civil Defense Family Shelter Kits — CALL FOR AVAILABILITY\n- Chocolate Zeppelin Snack Cakes, by the case\n\nLimit 12 per ' +
        "customer. Management is not responsible for trampling.\n\nSTERLING'S OF HERALD SQUARE — Shop like royalty.",
      site: "sterlings",
      anchors: ["note1", "entrance"],
      off: { x: 4, z: 24 },
    },
    {
      id: "q_lore_rockefeller_plaque",
      name: "Rubbing: Prometheus Plaque",
      title: "ROCKEFELLER CENTER — PROMETHEUS",
      text:
        '"Prometheus, teacher in every art, brought the fire that hath proved to mortals a means to mighty ends."\n\n[Beneath it, an Iron Covenant ' +
        'archivist has chalked: "And look where THAT got us."]',
      site: "rockefeller",
      anchors: ["note1", "prometheus", "rink"],
      off: { x: 0, z: 20 },
    },
    {
      id: "q_lore_subway_map",
      name: "Transit Authority Notice",
      title: "NEW YORK CITY TRANSIT AUTHORITY — NOTICE",
      text:
        "In the event of an air raid, subway stations are designated PUBLIC SHELTERS.\n\nPlease proceed calmly to the platform. Please do not push. " +
        "Please do not block the doors. Please remember that the doors will not open again.\n\n(This notice has been approved by the Office of Civil " +
        "Defense, which has asked us to mention that its own shelters are nicer.)",
      site: "times_square",
      anchors: ["subway", "note2"],
      off: { x: -22, z: 36 },
    },
    {
      id: "q_lore_liberty_postcard",
      name: "Postcard from Liberty Island",
      title: "GREETINGS FROM LIBERTY ISLAND!",
      text:
        "Dear Mom,\n\nClimbed all 354 steps to the crown! Mark wanted to go up to the torch but the Park Ranger said it's closed for \"an Atlas Power " +
        'thing." There were men in grey suits everywhere. Very hush-hush.\n\nSee you Saturday!\nLove, Donna\n\n[Postmarked March 5, 1967. Never delivered.]',
      site: "statue_of_liberty",
      anchors: ["note1", "dock", "gift_shop"],
      off: { x: 18, z: -30 },
    },
    {
      id: "q_lore_park_ranger",
      name: "Park Ranger's Log",
      title: "CENTRAL PARK — RANGER LOG",
      text:
        'Feb 13: Atlas Power & Light men up at Belvedere Castle again, bolting an aerial onto the weather station. They say it\'s "for the forecast." ' +
        'The forecast has never needed a mast forty feet tall.\n\nFeb 14: Asked the foreman what "Knickerbocker" means. He said "a pair of trousers." ' +
        'I know what knickerbockers are. That\'s not what I asked.\n\nFeb 15: They gave me a pamphlet: "Civil Defense Begins at Home!" ' +
        "There's a mail-in coupon for a family shelter. Eight weeks for delivery.",
      site: "belvedere",
      anchors: ["note1", "loot1"],
      off: { x: 12, z: 12 },
    },
  ];
  L.hook("init", function () {
    for (const n of LORE)
      L.defineItem({
        id: n.id,
        type: "note",
        name: n.name,
        title: n.title,
        text: n.text,
        weight: 0,
        value: 0,
        desc: "A note. Read it with your VIGIL goggles (NOTES).",
      });
  });
  L.hook("spawn", function () {
    for (const n of LORE) {
      if (L.has(n.id)) continue;
      const s = G.LAYOUT.getSite(n.site);
      if (!s) continue;
      const c = {
        x: (s.x0 + s.x1) / 2 + n.off.x,
        z: (s.z0 + s.z1) / 2 + n.off.z,
      };
      const p = L.anchor(n.site, n.anchors, c, { maxR: 12 });
      if (p) L.pickup("lore_" + n.id, n.id, 1, p);
    }
  });

  // ------------------------------------------------------------------
  // Debug helpers (dev console):  G.quests.debug.status(), .skip('mq03'), .tp('gc_moe'), .skipStart()
  // (MQ01: .blastDoor() / .cryoSpots() live in 20_cryo.js)
  // ------------------------------------------------------------------
  Object.assign(G.quests.debug, {
    status() {
      return Q.list().map(
        (q) =>
          q.id + " [" + q.status + "] " + (q.stage || "") + " — " + q.stageText,
      );
    },
    flags() {
      return L.allFlags();
    },
    skip(id) {
      // story order comes from the main story spine
      if (G.quests.debug.ms) G.quests.debug.ms.skipTo(id);
      return Q.list().map((q) => q.id + ":" + q.status);
    },
    /** The core cheat's "skip the start": MQ01 done, MQ02 handed over. */
    skipStart() {
      G.events.emit("cheatSkipStart");
      return Q.list().map((q) => q.id + ":" + q.status);
    },
    tp(npcId) {
      const a = L.npc(npcId);
      if (!a) return "no such npc";
      G.player.teleport(a.pos.x + 2, a.pos.y, a.pos.z + 2, 0);
      return [a.pos.x, a.pos.z];
    },
    npcs() {
      return Object.keys(L.npcs).map((k) => {
        const a = L.npcs[k];
        return (
          k +
          " @ " +
          (a && a.pos ? a.pos.x.toFixed(0) + "," + a.pos.z.toFixed(0) : "?") +
          (a && a.dead ? " (dead)" : "")
        );
      });
    },
    markers() {
      return Q.activeMarkers(true);
    },
    /** Every lock the game registered that the locks audit flags (unreachable key, unlearnable code…). */
    locks() {
      return !G.isStub("locks") && G.locks && G.locks.audit
        ? G.locks.audit().filter((r) => r.problems && r.problems.length)
        : "locks module not loaded";
    },
  });
})();
