// play-inline-438 02 — flag
// Lines 31-290 of readable/play-inline-438.pretty.js (statement-aligned).
  const PK = G._ppk;
  const K = PK.kit;
  const PI = Math.PI,
    HP = PI / 2;
  const q = K.q;
  const QF = "ppk_feeding_time";

  // ------------------------------------------------------------------
  // Locks (read by the site builders in init). Every unlock is placed in this module:
  //   ppk_term_commish  passcode CHESTNUT   the Parks map-room teletype (Arsenal)
  //   ppk_commish_safe  code 1934           the Commissioner's teletype ("Unlock Wall Safe" also releases it)
  //   ppk_noah          passcode LEVIATHAN, or the blotter note ppk_noah_password (Commissioner's office)
  //   ppk_roz_safe      code 0619           the Tavern office teletype
  // The keeper's service door into the Polar Circle is one-way (bolted from inside), not a lock.
  // ------------------------------------------------------------------
  PK.LOCKS = {
    commish_term: {
      id: "ppk_term_commish",
      label: "Office of the Commissioner — Teletype",
      kind: "terminal",
      passcode: "CHESTNUT",
      hint: "The Parks map-room teletype in the Arsenal.",
    },
    commish_safe: {
      id: "ppk_commish_safe",
      label: "Commissioner's Wall Safe",
      kind: "safe",
      code: "1934",
      hint: "The Commissioner's teletype.",
    },
    noah_term: {
      id: "ppk_noah",
      label: "Project N.O.A.H. — Ark Control",
      kind: "terminal",
      passcode: "LEVIATHAN",
      key: "ppk_noah_password",
      hint: "The note in the Commissioner's blotter.",
    },
    roz_safe: {
      id: "ppk_roz_safe",
      label: "Roz's Safe",
      kind: "safe",
      code: "0619",
      hint: "The Tavern office teletype.",
    },
  };
  for (const k in PK.LOCKS) PK.lockReg(PK.LOCKS[k]);

  const ctxOf = (id) => (PK.ctxs || []).find((c) => c.id === id);
  const V = (a) => (a ? { x: a.x, y: a.y, z: a.z } : null);
  const actor = (id) => {
    try {
      return !G.isStub("actors") && G.actors.get ? G.actors.get(id) : null;
    } catch (e) {
      return null;
    }
  };
  function isNight() {
    try {
      if (!G.isStub("atmos") && G.atmos.isNight) return !!G.atmos.isNight();
    } catch (e) {
      /* */
    }
    const h = (G.time && G.time.hour) || 12;
    return h < 6.5 || h > 19;
  }
  function marker(poi, name, label, interior) {
    return () => {
      const a = PK.anchor(poi, name);
      return a ? { x: a.x, z: a.z, y: a.y, label, interior } : null;
    };
  }
  const pname = () =>
    (G.HERO && G.HERO.name) || (G.player && G.player.name) || "stranger";

  // ==================================================================
  // Quest logic
  // ==================================================================
  function advanceTo(stage) {
    if (!q.started(QF)) return;
    if (q.active(QF)) q.set(QF, stage);
  }
  PK.park = {
    feedersOn: () => !!PK.flag("feeders_on"),
    gusDead: () => !!PK.flag("gus_dead"),
    resolved: () => !!PK.flag("feeders_on") || !!PK.flag("gus_dead"),
    restartFeeders() {
      if (PK.flag("feeders_on") || PK.flag("gates_open")) return;
      PK.setFlag("feeders_on", true);
      K.sfx("terminal_success");
      K.xp(120, "Restarted the Ark's feeders");
      K.standing(15, "Fed the Ark");
      const z = ctxOf("cp_zoo_arsenal");
      if (z && z.foodGroup) z.foodGroup.visible = true;
      const gus = actor("ppk_gus");
      if (gus && !gus.dead)
        K.safe("gus_calm", () => {
          if (gus.setHostile) gus.setHostile(false);
          gus.home = { x: z.anchors.feeder.x, z: z.anchors.feeder.z, r: 3 };
          if (gus.moveTo) gus.moveTo(z.anchors.feeder.x, z.anchors.feeder.z);
        });
      K.notify(
        "Somewhere below, a hopper clanks open. The Ark is feeding again.",
      );
      K.safe("news", () => {
        if (!G.isStub("radio") && G.radio.addNews)
          G.radio.addNews(
            "Good news for the folks at Tavern on the Green: no more night visitors at the pack oxen pen. Word is somebody went down under the old zoo and turned the Army's feeding machines back on. Twenty-two years late, but the animals got their dinner.",
          );
      });
      advanceTo("return");
    },
    openGates() {
      if (PK.flag("gates_open") || PK.flag("feeders_on")) return;
      PK.setFlag("gates_open", true);
      K.sfx("alarm");
      K.standing(-50, "Released the Ark");
      K.notify("Klaxons. Every habitat gate in the Ark grinds open.");
      if (q.active(QF)) q.fail(QF);
    },
  };

  // ==================================================================
  // DATA: items, quest, dialogues, terminals
  // ==================================================================
  function items() {
    K.defineItem({
      id: "ppk_gus_pelt",
      type: "misc",
      name: "Gus's Pelt",
      weight: 8,
      value: 300,
      tags: ["valuable", "unique"],
      desc: "Thick, yellow-white and patchy with pink scar tissue: the hide of the Central Park Zoo's last polar bear, two decades and a lot of Formula N later. Roz Tavish would pay for it. So would anyone with a fireplace.",
    });
    K.defineItem({
      id: "ppk_zookeeper_cap",
      type: "apparel",
      slot: "head",
      name: "Head Keeper's Cap",
      weight: 0.5,
      value: 90,
      dr: 1,
      attrs: { senses: 1 },
      skills: { survival: 5 },
      mesh: "hat_cap",
      tags: ["apparel", "hat", "unique"],
      desc: 'A green twill cap stitched "CENTRAL PARK ZOO — HEAD KEEPER". Smells faintly of herring. You notice things now: tracks, droppings, the way the shadows move.',
    });
    K.defineItem({
      id: "ppk_commish_hardhat",
      type: "apparel",
      slot: "head",
      name: "Commissioner Moss's Hard Hat",
      weight: 2,
      value: 160,
      dr: 4,
      attrs: { presence: 1 },
      skills: { mechanics: 5, trade: 5 },
      mesh: "hat_hard",
      tags: ["apparel", "helmet", "unique"],
      desc: 'A white ceremonial hard hat, gold-lettered "R. MOSS — COMMISSIONER". Worn at every ribbon-cutting for forty years. Never once worn near actual construction.',
    });
    K.defineItem({
      id: "ppk_formula_n",
      type: "aid",
      name: "Formula N",
      weight: 0,
      value: 60,
      tags: ["medical", "chem"],
      mesh: "injector",
      sound: "inject",
      effects: {
        hp: 25,
        rads: 20,
        duration: 240,
        attrs: { brawn: 1, grit: 1, wits: -1 },
      },
      desc: 'U.S. Army "adaptive nutritional supplement", 40 mg/kg, for animal use only. Makes you stronger, tougher and very, very hungry.',
    });
    K.defineItem({
      id: "ppk_rack_of_ox",
      type: "aid",
      name: "Rack of Pack oxen",
      weight: 1,
      value: 18,
      tags: ["food", "meat"],
      mesh: "steak",
      sound: "eat",
      effects: { hpOverTime: [60, 15] },
      desc: "Chef Anton's signature: two racks from one animal, crusted in dried gnarlberry and served with the solemnity of an old-world state dinner.",
    });
    K.defineItem({
      id: "ppk_tavern_wine",
      type: "aid",
      name: "Château Bellerive 1961",
      weight: 1,
      value: 45,
      tags: ["drink", "alcohol"],
      mesh: "bottle_wine",
      sound: "drink",
      effects: { hp: 10, duration: 240, attrs: { presence: 2, senses: 0 } },
      desc: "From the Tavern's cellar. A 1961 Bordeaux-style red from the Hudson Valley that has aged far better than the Hudson Valley.",
    });
  }

  function quests() {
    if (G.isStub("quests") || !G.quests.define) return;
    G.quests.define({
      id: QF,
      name: "Feeding Time",
      giver: "Roz Tavish",
      location: "Tavern on the Green",
      desc: "Something from the Central Park Zoo has been raiding the pack oxen pen at Tavern on the Green — last Tuesday, a white bear. Roz Tavish wants it stopped.",
      stages: [
        {
          id: "zoo",
          text: "Find out what is coming out of the Central Park Zoo at night.",
          markers: [marker("cp_zoo_arsenal", "door", "The Arsenal")],
        },
        {
          id: "ark",
          text: 'Search the Arsenal for a way down to the Army\'s "Ark".',
          markers: [
            marker(
              "cp_zoo_arsenal",
              "noah_terminal",
              "Ark Control",
              "cp_zoo_arsenal",
            ),
          ],
        },
        {
          id: "deal",
          text: "Stop the raids: restart the Ark's automatic feeders at Ark Control, or kill Gus in Biome B.",
          markers: [
            marker(
              "cp_zoo_arsenal",
              "noah_terminal",
              "Ark Control",
              "cp_zoo_arsenal",
            ),
            marker(
              "cp_zoo_arsenal",
              "boss",
              "Biome B — Polar",
              "cp_zoo_arsenal",
            ),
          ],
        },
        {
          id: "return",
          text: "Tell Roz Tavish at Tavern on the Green what you did.",
          markers: [{ npc: "ppk_roz", label: "Roz Tavish" }],
        },
      ],
      rewards: { xp: 300 },
    });
  }

