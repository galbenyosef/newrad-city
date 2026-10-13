// play-inline-549 02 — desc
// Lines 276-568 of readable/play-inline-549.pretty.js (statement-aligned).
  const QUEST_ITEMS = [
    {
      id: "q_signal_amplifier",
      type: "misc",
      quest: true,
      name: "Signal Amplifier",
      weight: 4,
      value: 0,
      desc: "An old-world Electro-Dyne broadcast amplifier. Vacuum tubes like little glass hearts. One still glows.",
    },
    {
      id: "q_knickerbocker_core",
      type: "misc",
      quest: true,
      name: "Knickerbocker Ignition Core",
      weight: 6,
      value: 0,
      desc: "A humming cylinder of brass and glass stamped ATLAS POWER & LIGHT — PROJECT KNICKERBOCKER. It is warm, and it is definitely looking at you.",
    },
    {
      id: "q_neon_core",
      type: "misc",
      quest: true,
      name: "Neon Heart (Power Cell)",
      weight: 5,
      value: 0,
      desc: 'A subway-grade Atlas power cell with "BIG BUZZ #2" scratched into the casing. Could light up Broadway for another decade.',
    },
    {
      id: "q_blessed_isotope",
      type: "misc",
      quest: true,
      name: "Blessed Isotope",
      weight: 2,
      value: 0,
      desc: "A lead reliquary with a crack in it. The crack glows. You feel the second sun's love in your teeth.",
    },
    {
      id: "q_placebo_isotope",
      type: "misc",
      quest: true,
      name: "Blessed Isotope (?)",
      weight: 2,
      value: 0,
      desc: "The reliquary, now holding a bottle of Fizzo Blue and a lot of hope. It glows beautifully. It is completely harmless.",
    },
    {
      id: "q_book_fusion",
      type: "misc",
      quest: true,
      name: 'Book: "Practical Cold Fusion, Vol. II"',
      weight: 2,
      value: 0,
      desc: "Stamped NYPL REFERENCE — DO NOT REMOVE. Due back: November 4, 1967.",
    },
    {
      id: "q_book_armor",
      type: "misc",
      quest: true,
      name: 'Book: "Exo-Rig Mk I Field Servicing Manual"',
      weight: 2,
      value: 0,
      desc: "Property of the U.S. Army, on loan to the New York Public Library for reasons nobody documented.",
    },
    {
      id: "q_book_rotorcraft",
      type: "misc",
      quest: true,
      name: 'Book: "Rotorcraft for the Home Mechanic"',
      weight: 2,
      value: 0,
      desc: 'Chapter 1: "So You\'ve Bought a Rotorcraft." Chapter 2: "Why Did You Buy a Rotorcraft."',
    },
    {
      id: "q_caldwell_strongbox",
      type: "misc",
      quest: true,
      name: "Caldwell Strongbox",
      weight: 8,
      value: 0,
      desc: "Dented. Hammered. Somebody tried to open it with a raider. It remains locked.",
    },
    {
      id: "q_fay_mannequin",
      type: "misc",
      quest: true,
      name: 'Mannequin ("Fay")',
      weight: 12,
      value: 5,
      desc: "An old-world Sterling's display mannequin in a slightly scorched evening gown. She is small, she is pretty, and she will never, ever scream.",
    },
    {
      id: "q_wendell_ring",
      type: "misc",
      quest: true,
      name: "Engagement Ring",
      weight: 0,
      value: 120,
      desc: "A modest gold band with a small stone, kept in a Sterling's gift box for twenty-two years.",
    },
    {
      id: "q_biscuit_tag",
      type: "misc",
      quest: false,
      name: 'Dog Tag: "BISCUIT"',
      weight: 0,
      value: 1,
      desc: 'A tin tag on a leather loop. On the back: "IF FOUND, HE FOUND YOU."',
    },
    {
      id: "q_ferry_token",
      type: "misc",
      quest: true,
      name: "Ossie's Ferry Token",
      weight: 0,
      value: 0,
      desc: 'A subway token with a hole punched through it. Ossie says it means "lifetime pass." Ossie is sixty-eight; lifetime is a generous term.',
    },
  ];

  // Apparel rewards (rpg handles apparel generically: slot / dr / attrs / skills)
  const APPAREL = [
    // The goggles, when rpg has no 'vigil_goggles' of its own (L.gogglesId / L.giveGoggles).
    {
      id: "q_vigil_goggles",
      type: "apparel",
      slot: "eyes",
      quest: true,
      noCondition: true,
      name: "VIGIL Field Goggles",
      weight: 0,
      value: 0,
      dr: 0,
      desc: "Project Long Winter issue: brass-rimmed field goggles with a cathode overlay. Map, quest log, radio and vitals, a blink away. [Tab]",
    },
    {
      id: "q_kong_crown",
      type: "apparel",
      slot: "head",
      name: "Crown of Kong",
      weight: 3,
      value: 150,
      dr: 3,
      attrs: { brawn: 1, presence: -1 },
      desc: "A bent traffic-light housing hammered into a crown. It smells like a Brute's head. +1 Brawn, -1 Presence.",
    },
    {
      id: "q_mayor_top_hat",
      type: "apparel",
      slot: "head",
      name: "Mayor Crowe's Top Hat",
      weight: 1,
      value: 90,
      dr: 1,
      attrs: { presence: 1 },
      desc: "Moth-eaten silk with a neon band. Wearing it makes you feel like you should be announcing something. +1 Presence.",
    },
    {
      id: "q_curator_monocle",
      type: "apparel",
      slot: "eyes",
      name: "Curator's Monocle",
      weight: 0,
      value: 110,
      dr: 0,
      attrs: { senses: 1 },
      skills: { electronics: 5 },
      desc: "A brass eyepiece from CURATOR-7's spare-parts drawer. +1 Senses, +5 Electronics.",
    },
    {
      id: "q_glowkeeper_vestments",
      type: "apparel",
      slot: "body",
      name: "Vestments of the Second Sun",
      weight: 2,
      value: 60,
      dr: 2,
      radResist: 15,
      outfit: "glowkeeper_robes",
      desc: "Robes stitched with glowing thread and a sun disc on the breast. The Glowkeepers swear by them. +15 Rad Resistance.",
    },
    {
      id: "q_toll_collector_cap",
      type: "apparel",
      slot: "head",
      name: "Toll Collector's Cap",
      weight: 1,
      value: 40,
      dr: 1,
      skills: { trade: 5 },
      desc: "A Port Authority cap with a raider spike glued on. +5 Trade.",
    },
  ];

  /** Fill {NAME} / {FIRST} with the hero's name. */
  function personal(s) {
    if (typeof s !== "string") return s;
    const name = L.heroName();
    return s
      .replace(/\{NAME\}/g, name)
      .replace(/\{FIRST\}/g, name.split(" ")[0]);
  }
  function noteDef(n) {
    const d = Object.assign(
      { weight: 0, value: 0, quest: n.quest !== undefined ? n.quest : false },
      n,
    );
    d.name = personal(n.name);
    d.title = personal(n.title);
    d.text = personal(n.text);
    d.desc =
      d.desc ||
      (n.reel
        ? "A tape reel. Play it with your VIGIL goggles (NOTES)."
        : "A note. Read it with your VIGIL goggles (NOTES).");
    return d;
  }

  L.hook("init", function () {
    for (const n of NOTES) L.defineItem(noteDef(n));
    for (const it of QUEST_ITEMS) L.defineItem(Object.assign({}, it));
    for (const it of APPAREL)
      L.defineItem(Object.assign({ noCondition: false }, it));
  });

  // Re-personalise the texts that name the hero (the name is read at runtime, never stored in the data).
  L.hook("newGame", function () {
    if (G.isStub("items") || !G.items.get) return;
    for (const n of NOTES) {
      if (
        !/\{(NAME|FIRST)\}/.test(
          (n.name || "") + (n.title || "") + (n.text || ""),
        )
      )
        continue;
      const d = G.items.get(n.id);
      if (!d) continue;
      d.name = personal(n.name);
      d.title = personal(n.title);
      d.text = personal(n.text);
    }
  });

  // Carrying the Blessed Isotope slowly irradiates you (it's blessed, not safe).
  // Implemented as a small rad source riding on the player, so the core applies
  // iodine tabs / rad resistance, the Geiger counter clicks and the HUD shows the dose.
  // Polled once a second (one inventory count), whatever quest it came from.
  let isoSrc = null,
    isoT = 0,
    carrying = false;
  function isoOff() {
    if (isoSrc) {
      try {
        G.world.removeRadSource(isoSrc);
      } catch (e) {
        /* */
      }
      isoSrc = null;
    }
  }
  L.hook("update", function (dt, realDt) {
    isoT -= realDt;
    if (isoT <= 0) {
      isoT = 1;
      carrying = L.has("q_blessed_isotope");
    }
    if (!carrying) {
      isoOff();
      return;
    }
    if (!isoSrc && G.world.addRadSource)
      isoSrc = G.world.addRadSource({
        x: 0,
        y: 0,
        z: 0,
        radius: 2.5,
        strength: 0.6,
        tag: "blessed_isotope",
      });
    if (isoSrc) {
      const p = G.player.pos;
      isoSrc.x = p.x;
      isoSrc.y = p.y + 1;
      isoSrc.z = p.z;
    }
  });
  L.hook("reset", function () {
    isoOff();
    carrying = false;
    isoT = 0;
  });

  L.NOTES = NOTES;
