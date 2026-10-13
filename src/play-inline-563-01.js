// play-inline-563 01 — handed
// Lines 19-353 of readable/play-inline-563.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const L = G.quests.lib;
  const Q = G.quests;
  const QID = "sq_medallions";
  const FLYER = "q_note_medallion_flyer";
  const NPC = "md_tarbell",
    DLG = "dlg_md_tarbell";
  const KEY = "q_md_vault_key",
    REEL = "q_md_reel_closing";
  const VAULT_LOCK = {
    id: "md_fair_vault",
    label: "Grand Prize Vault (World's Fair)",
    key: KEY,
    kind: "key",
  };
  const PRICE = 25; // scrip per medallion, "per the 1965 buy-back schedule"

  // [key, medallion item id (rpg), site, anchor names, fallback offset from the site centre, where, flavour]
  const SPOTS = [
    [
      "unisphere",
      "medallion_unisphere",
      "empire_state",
      ["loot_deck", "observation_deck"],
      [0, 0],
      "the Empire State observation deck",
      "The Unisphere: a steel globe twelve stories tall, ringed like a planet that had somewhere to be. In 1964 the whole world fit in a park in Queens.",
    ],
    [
      "space_park",
      "medallion_space_park",
      "chrysler",
      ["sniper", "loot2"],
      [0, 0],
      "a sniper's nest high on the Chrysler Building",
      "Space Park: real rockets standing on their tails in the grass, and a line of kids waiting to touch the fins for luck.",
    ],
    [
      "hall_of_science",
      "medallion_hall_of_science",
      "brooklyn_bridge",
      ["truck", "deck_mid"],
      [0, 0],
      "a wrecked truck on the Brooklyn Bridge",
      "Hall of Science: a wavy wall of blue glass. Inside, a man in a white coat promised your grandchildren would summer on the Moon.",
    ],
    [
      "tent_of_tomorrow",
      "medallion_tent_of_tomorrow",
      "times_square",
      ["stage", "plaza"],
      [0, 0],
      "the stage in the Neon",
      "Tent of Tomorrow: a roof of coloured glass on sixteen concrete columns, and under it a road map of the whole state you could walk across in socks.",
    ],
    [
      "hall_of_education",
      "medallion_hall_of_education",
      "nypl",
      ["hall", "terrace"],
      [0, 0],
      "the hall of the Public Library",
      "Hall of Education: the Classroom of 1990, with a television set on every desk and a teacher who never raised her voice. Close enough.",
    ],
    [
      "monorail",
      "medallion_monorail",
      "statue_of_liberty",
      ["balcony", "fort_top"],
      [0, 0],
      "the balcony of the Statue of Liberty",
      "The Monorail: a silver car hanging from a beam, gliding over the crowds. In tomorrow, nobody was ever going to walk anywhere again.",
    ],
    [
      "observation_towers",
      "medallion_observation_towers",
      "grand_central",
      ["clock", "info_booth"],
      [0, 0],
      "the Grand Central information booth",
      "The Observation Towers: two flying saucers on concrete stilts and a glass elevator to the top. Zeke swore he could see Connecticut.",
    ],
    [
      "better_living",
      "medallion_better_living",
      "grand_central",
      ["loot3", "west_balcony"],
      [0, 0],
      "a balcony in Grand Central",
      "Better Living Center: push-button kitchens, a dishwasher that hummed show tunes, and a model housewife who never once looked tired.",
    ],
    [
      "tower_of_light",
      "medallion_tower_of_light",
      "un_hq",
      ["loot1", "terminal"],
      [0, 0],
      "deep inside the UN compound",
      "Tower of Light: a prism of searchlights that threw the brightest beam ever aimed at the sky. Nobody mentioned the electric bill.",
    ],
    [
      "heliport",
      "medallion_heliport",
      "nyse",
      ["loot", "trading_floor"],
      [0, 0],
      "the Exchange trading floor",
      'The Heliport: a landing pad up on stilts, "ten minutes from Wall Street," for gentlemen who could not bear the traffic.',
    ],
    [
      "rocket_thrower",
      "medallion_rocket_thrower",
      "rockefeller",
      ["loot1", "plaza"],
      [0, 0],
      "the Iron Covenant compound at Rockefeller Center",
      "Rocket Thrower: a bronze giant flinging a rocket past a ring of stars. He looks like he has never once doubted himself.",
    ],
    [
      "court_of_states",
      "medallion_court_of_states",
      "sterlings",
      ["safe", "office"],
      [0, 0],
      "the department store manager's office",
      "Court of the States: a plaza of little state houses, each one showing off its cheese, its corn and its senator.",
    ],
    [
      "pavilion_of_medicine",
      "medallion_pavilion_of_medicine",
      "flatiron",
      ["doctor", "bar"],
      [0, 0],
      "the Flatiron clinic counter",
      "Pavilion of Medicine: a see-through man whose organs lit up one by one while a calm voice explained that everything was fine.",
    ],
    [
      "pool_of_industry",
      "medallion_pool_of_industry",
      "washington_square",
      ["arch", "fountain"],
      [0, 0],
      "under the Washington Square arch",
      "Pool of Industry: fountains that danced to an orchestra every night at nine. The water is long gone. You can still hum the tune.",
    ],
    [
      "transportation_hall",
      "medallion_transportation_hall",
      "radio_city",
      ["loot1", "generator"],
      [0, 0],
      "the Radio City lobby",
      "Transportation Hall: cars that steered themselves down electric highways, any day now, any day now.",
    ],
    [
      "hall_of_free_enterprise",
      "medallion_hall_of_free_enterprise",
      "met",
      ["great_hall", "info_desk"],
      [0, 0],
      "the Great Hall of the Met",
      "Hall of Free Enterprise: a wall-sized counting machine tallied the nation's paychecks live. The number only ever went up. That was the point.",
    ],
    [
      "wax_museum",
      "medallion_wax_museum",
      "st_patricks",
      ["confessor", "loot2"],
      [0, 0],
      "a confessional in St. Patrick's",
      "Wax Museum: famous Americans in candle wax, posed mid-speech. The night guards swore the figures had moved by morning.",
    ],
    [
      "federal_pavilion",
      "medallion_federal_pavilion",
      "city_hall",
      ["rotunda", "boss"],
      [0, 0],
      "the City Hall rotunda",
      "Federal Pavilion: a square box on stilts where Washington explained, in a twelve-minute film, that the future was well in hand.",
    ],
    [
      "lake_amusement",
      "medallion_lake_amusement",
      "battery_park",
      ["castle", "castle_gate"],
      [0, 0],
      "Castle Clinton in Battery Park",
      "Lake Amusement Area: paddle boats, a floating stage, and a water show nobody could hear over the screaming children.",
    ],
    [
      "fountain_of_planets",
      "medallion_fountain_of_planets",
      "woolworth",
      ["boss", "footlocker"],
      [0, 0],
      "the raider den in the Woolworth Building",
      "Fountain of the Planets: the solar system in jets of water, with fireworks on top. The outermost planet was, frankly, a garden hose.",
    ],
  ];
  const BY_ID = {};
  for (const s of SPOTS) BY_ID[s[1]] = s;
  const ids = () => SPOTS.map((s) => s[1]);

  /** Found at some point (carried, handed in, or remembered by rpg). */
  function owned(id) {
    if (!G.isStub("rpg") && G.rpg.hasMedallion) {
      try {
        if (G.rpg.hasMedallion(id)) return true;
      } catch (e) {
        /* */
      }
    }
    return L.has(id) || !!L.flag("md_" + id) || !!L.flag("md_in_" + id);
  }
  function count() {
    return ids().filter(owned).length;
  }
  /** In Tarbell's presentation case. */
  function handed() {
    return ids().filter((id) => L.flag("md_in_" + id)).length;
  }
  /** Carried right now (not yet handed in). */
  function carried() {
    return ids().filter((id) => L.has(id) && !L.flag("md_in_" + id));
  }

  // ------------------------------------------------------------------
  // Milestones: Tarbell's prizes at every fifth medallion in his case
  // ------------------------------------------------------------------
  const MILESTONES = [
    {
      n: 5,
      scrip: 150,
      items: [["md_fair_boater", 1]],
      line: "Five! A quarter of the set! By the authority vested in me by the Corporation, I present you with an official Fair Host's boater, with the ribbon. The hosts wore them so lost children could find a grown-up. Now you are the grown-up. Heaven help us.",
    },
    {
      n: 10,
      scrip: 250,
      items: [
        ["rally_tonic_extra", 2],
        ["prussian_blue", 2],
      ],
      line: "Ten. Half the set. The first-aid pavilion's last two cases of the good stuff, which I have been saving for an occasion. This is an occasion. Drink the tonic sitting down.",
    },
    {
      n: 15,
      scrip: 400,
      items: [["md_grand_prize", 1]],
      line: "Fifteen! Then you shall have the Grand Prize. Not THE Grand Prize, that is in the vault. This one is the shooting-gallery Grand Prize from the Lake Amusement Area, which nobody ever won because the sights on the gallery guns were bent on purpose. I have straightened them. Do not tell the concessionaire.",
    },
    {
      n: 20,
      scrip: 600,
      items: [[KEY, 1]],
      line: 'Twenty. The complete set. [His hands shake as he sets the last one in the velvet.] Paragraph nine of the Souvenirs of Tomorrow promotion: "The holder of the complete set shall be entitled to the contents of the Grand Prize Vault." I have kept this key in my vest pocket for twenty-four years. Here. It is yours. The vault is right behind me. It always was.',
    },
  ];
  let lastHandIn = null; // summary of the last hand-in, read by the dialogue node after it

  function payMilestone(m) {
    if (L.flag("md_ms_" + m.n)) return false;
    L.setFlag("md_ms_" + m.n, true);
    if (m.scrip) L.giveScrip(m.scrip);
    for (const it of m.items) L.give(it[0], it[1]);
    L.xp(100 + m.n * 10, "Souvenirs of Tomorrow: " + m.n + " medallions");
    if (m.n >= 20) {
      L.news(
        "A note for the collectors out there: word reaches this booth that somebody has brought all twenty of the old World's Fair medallions home to Grand Central. " +
          "Every last one. Somewhere in this city, the future is sitting in a velvet case in perfect order. Congratulations, you patient, peculiar soul.",
      );
      if (Q.isActive(QID)) Q.setStage(QID, "vault");
    }
    return true;
  }
  /** Hand every carried medallion to Tarbell. Returns a summary {n, paid, lines} (null when there was nothing to give). */
  function handIn() {
    const give = carried();
    if (!give.length) return null;
    const before = handed();
    for (const id of give) {
      if (!L.take(id, 1)) continue;
      L.setFlag("md_in_" + id, true);
      L.setFlag("md_" + id, true);
    }
    const after = handed();
    const n = after - before;
    if (n <= 0) return null;
    const paid = n * PRICE;
    L.giveScrip(paid);
    const lines = [];
    for (const m of MILESTONES)
      if (before < m.n && after >= m.n && payMilestone(m)) lines.push(m.line);
    if (!Q.isStarted(QID)) Q.start(QID);
    else if (Q.isActive(QID)) L.refresh(QID);
    L.sfx("barter_trade");
    return { n, paid, after, lines };
  }
  /** Repair: milestones the case already qualifies for (older saves, a crash mid-dialogue) are paid next time we talk. */
  function catchUpMilestones() {
    const have = handed(),
      lines = [];
    for (const m of MILESTONES)
      if (have >= m.n && !L.flag("md_ms_" + m.n) && payMilestone(m))
        lines.push(m.line);
    return lines;
  }
  function nextMilestone() {
    const h = handed();
    const m = MILESTONES.find((x) => x.n > h);
    return m ? m.n : null;
  }

  // ------------------------------------------------------------------
  // Items: the souvenir map, Tarbell's prizes, the vault key and its contents
  // ------------------------------------------------------------------
  function flyerText() {
    const first = L.heroName().split(" ")[0];
    return (
      "1964 NEW YORK WORLD'S FAIR — SOUVENIRS OF TOMORROW!\n\n" +
      "Twenty solid bronze commemorative medallions, one for each wonder of the Fair! Collect the complete set and display it " +
      "proudly in the handsome walnut presentation case (sold separately).\n\n" +
      'When the Fair closes, the medallions will be loaned to twenty great Manhattan institutions "for public display in perpetuity." ' +
      "Visit them all! Complete sets may be presented at the Fair Corporation's Grand Central information stand for the GRAND PRIZE!*\n\n" +
      "*See paragraph nine. Medallions not legal tender.\n\n" +
      "[Someone has gone over the little map of Manhattan in pencil: twenty circles, a few of them crossed out. Down the margin, in Zeke's block capitals:]\n\n" +
      '"' +
      first +
      " — remember you never finished the set back in '65? Neither did I. They're still out there, scattered round the city like " +
      "everything else. I left you the Towers one at Grand Central, by the information booth. And there's an old fellow up on the east balcony " +
      "who still buys them. Says he works for the Fair. Nobody's had the heart to tell him. — Z.\""
    );
  }
