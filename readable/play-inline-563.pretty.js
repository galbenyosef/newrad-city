/* src/quests/55_medallions.js */
/* =====================================================================
 * NEW RAD CITY — QUESTS — 55: "SOUVENIRS OF TOMORROW" (WORLD'S FAIR MEDALLIONS)
 * Twenty bronze medallions struck for the 1964 New York World's Fair (item ids
 * `medallion_*`, defined by rpg) are hidden across Manhattan's landmarks. They
 * grant nothing by themselves. GIDEON TARBELL, once Deputy Curator of Exhibits
 * for the World's Fair 1964–1965 Corporation, keeps a stall on Grand Central's
 * east balcony (where the great color photograph used to hang) and buys them
 * back for the Corporation: 25 scrip apiece, a prize at every fifth medallion
 * in his case, and at twenty the key to the Fair's Grand Prize Vault, which
 * has sat sealed beside him since the 1966 tour train never left.
 *
 * Stages: collect (find + hand in, x/20) → vault (open it) → complete.
 * Flags: md_<item id> (found), md_in_<item id> (in Tarbell's case), md_ms_<n>
 * (milestone n paid), md_met, md_vault_open.
 * A World's Fair souvenir map left in Cryo Unit C-9's prep room starts the hunt.
 * ===================================================================== */
(function () {
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
  function defineItems() {
    L.defineItem({
      id: FLYER,
      type: "note",
      name: "World's Fair Souvenir Map",
      title: "SOUVENIRS OF TOMORROW — COLLECT ALL 20!",
      text: flyerText(),
      desc: "A folded souvenir map from the 1964 World's Fair. Read it with your VIGIL goggles (NOTES).",
      weight: 0,
      value: 0,
    });
    L.defineItem({
      id: KEY,
      type: "key",
      name: "Grand Prize Vault Key",
      weight: 0,
      value: 0,
      quest: true,
      noLoot: true,
      mesh: "key",
      tags: ["key"],
      desc: "A long brass key on a blue-and-orange World's Fair lanyard, warm from twenty-four years in Gideon Tarbell's vest pocket. Stamped \"W.F. CORP. — GRAND PRIZE — PARAGRAPH 9\".",
    });
    L.defineItem({
      id: "md_fair_boater",
      type: "apparel",
      slot: "head",
      name: "Fair Host's Boater",
      weight: 0.5,
      value: 180,
      unique: true,
      noLoot: true,
      attrs: { presence: 1 },
      skills: { persuasion: 5, trade: 5 },
      tags: ["apparel", "hat", "unique", "souvenir"],
      mesh: "hat_boater",
      desc:
        "A stiff straw boater with the Fair's orange-and-blue ribbon, issued to the hosts who walked the grounds in 1964 answering questions with a smile. " +
        "People still trust the hat. +1 Presence, +5 Persuasion, +5 Trade.",
    });
    L.defineItem({
      id: "md_unisphere_blazer",
      type: "apparel",
      slot: "body",
      name: "Unisphere Blazer",
      weight: 2,
      value: 900,
      unique: true,
      noLoot: true,
      dr: 6,
      attrs: { presence: 1, wits: 1 },
      skills: { persuasion: 10, trade: 10 },
      outfit: "director_suit",
      tags: ["apparel", "clothing", "unique", "souvenir"],
      mesh: "wf_blazer",
      desc:
        'The Fair President\'s own blazer, Unisphere blue with orange piping and the Fair seal on the pocket, tailored for the 1966 national tour and sealed in the Grand Prize Vault with a note: "For the Winner." ' +
        'A lining of ballistic nylon "for the Southern leg." +1 Presence, +1 Wits, +10 Persuasion, +10 Trade.',
    });
    L.defineItem({
      id: "md_presentation_case",
      type: "misc",
      name: "Walnut Presentation Case",
      weight: 3,
      value: 1500,
      unique: true,
      noLoot: true,
      tags: ["valuable", "souvenir", "collectible"],
      mesh: "wf_case",
      desc:
        "The handsome walnut presentation case for the complete set of Souvenirs of Tomorrow, with twenty velvet hollows and the Fair seal in the lid. Sold separately. Never sold. " +
        "A collector at any market will pay a small fortune for it, which is the one promise the Fair ever kept.",
    });
    L.defineItem({
      id: REEL,
      type: "note",
      reel: true,
      name: 'Reel: "Closing Day, 1965"',
      title: "CLOSING DAY — OCTOBER 17, 1965",
      weight: 0,
      value: 20,
      text:
        "[A brass band, slightly flat. Rain on a microphone. A man's voice, the Fair President's, reading from a card:]\n\n" +
        '"Ladies and gentlemen, fifty-one million of you came. You rode the monorail and the sky ride, you shook hands with tomorrow, and you went home ' +
        "believing it. That is the only exhibit that ever mattered. The pavilions will come down. The idea will not.\n\n" +
        "To the lucky soul who someday opens this vault: the Fair Corporation salutes you. Everything in here was meant for a tour of forty-eight " +
        'states that will begin next spring. If you are hearing this and it did not, then keep the blazer. Keep the case. And keep the idea."\n\n' +
        '[Applause. The band starts again. Someone close to the microphone says, very quietly: "Gideon, you can turn it off now."]',
      desc: "A seven-inch tape reel in a World's Fair sleeve, found in the Grand Prize Vault.",
    });
    // Tarbell's 15-medallion prize: the shooting-gallery Grand Prize rifle (cloned from the hunting rifle so the
    // weapons module keeps its viewmodel; straightened sights, a little more punch).
    const base =
      !G.isStub("items") && G.items.get ? G.items.get("hunting_rifle") : null;
    if (base && base.weapon) {
      L.defineItem(
        Object.assign({}, base, {
          id: "md_grand_prize",
          name: "Grand Prize",
          value: 1300,
          unique: true,
          noLoot: true,
          desc:
            "The walnut-and-nickel rifle that hung over the shooting gallery at the Fair's Lake Amusement Area as its GRAND PRIZE, unclaimed in two seasons " +
            "because the gallery sights were bent. Gideon Tarbell straightened them. Every shot rings a little brass bell nobody else can hear.",
          weapon: Object.assign({}, base.weapon, {
            damage: Math.round((base.weapon.damage || 30) * 1.35),
            critChance: 4,
            spread: (base.weapon.spread || 0.02) * 0.6,
            adsSpread: (base.weapon.adsSpread || 0.0015) * 0.6,
            condDecay: (base.weapon.condDecay || 0.003) * 0.6,
          }),
        }),
      );
    } else {
      L.defineItem({
        id: "md_grand_prize",
        type: "misc",
        name: "Grand Prize",
        weight: 6,
        value: 1300,
        unique: true,
        noLoot: true,
        tags: ["valuable", "souvenir"],
        desc: "The walnut-and-nickel rifle from the Fair's shooting gallery. Without a gunsmith in the city, it is a very handsome ornament.",
      });
    }
  }

  L.hook("init", function () {
    defineItems();
    L.quest({
      id: QID,
      category: "misc",
      name: "Souvenirs of Tomorrow",
      giver: "Gideon Tarbell",
      location: "Grand Central Terminal (east balcony)",
      desc:
        "Twenty bronze medallions from the 1964 World's Fair were loaned to New York landmarks before the bombs. Gideon Tarbell, the Fair's last curator, " +
        "buys them back at Grand Central: 25 scrip apiece, a prize at every fifth one in his case, and for the complete set, the key to the Fair's Grand Prize Vault.",
      stages: [
        {
          id: "collect",
          text: () =>
            "Find the World's Fair medallions and bring them to Gideon Tarbell at Grand Central (found " +
            count() +
            "/20, in his case " +
            handed() +
            "/20).",
          markers: () => {
            const out = [];
            if (carried().length || !L.flag("md_met"))
              out.push({ npc: NPC, label: "Gideon Tarbell" });
            // Only the few nearest medallions whose landmark you've discovered.
            const P = G.player.pos,
              near = [];
            for (const s of SPOTS) {
              if (owned(s[1])) continue;
              const pk = L.pickups["md_" + s[0]];
              if (!pk) continue;
              const loc = G.LAYOUT.LOCATIONS.find(
                (l) =>
                  l.id === s[2] ||
                  (s[2] === "nyse" && l.id === "wall_street") ||
                  (s[2] === "statue_of_liberty" && l.id === "liberty"),
              );
              if (loc && !G.discovered.has(loc.id)) continue;
              near.push({
                x: pk.pos.x,
                z: pk.pos.z,
                y: pk.pos.y,
                label: "Medallion (" + s[0].replace(/_/g, " ") + ")",
                d: Math.hypot(P.x - pk.pos.x, P.z - pk.pos.z),
              });
            }
            return out.concat(near.sort((a, b) => a.d - b.d).slice(0, 3));
          },
        },
        {
          id: "vault",
          text: "Open the Grand Prize Vault behind Gideon Tarbell's stall at Grand Central.",
          markers: () => {
            const v = L.world.mdVault;
            return v && v.pos
              ? [
                  {
                    x: v.pos.x,
                    y: v.pos.y,
                    z: v.pos.z,
                    label: "Grand Prize Vault",
                  },
                ]
              : [{ npc: NPC, label: "Gideon Tarbell" }];
          },
        },
      ],
      rewards: { xp: 1000 },
      onComplete() {
        L.notify(
          "The complete set, and the Grand Prize. The walnut presentation case was sold separately after all: to you, for twenty medallions and a walk across a ruined city.",
        );
      },
    });
  });
  // The hero's name is read at runtime: refresh Zeke's note for each new game.
  L.hook("newGame", function () {
    if (G.isStub("items") || !G.items.get) return;
    const d = G.items.get(FLYER);
    if (d) d.text = flyerText();
  });

  // ------------------------------------------------------------------
  // Grand Central: Tarbell's stall, the vault, the man himself
  // ------------------------------------------------------------------
  const GCX = 240,
    GCZ = -226;
  function stallSpot() {
    const a = L.anchor("grand_central", ["east_balcony"], {
      x: 263,
      y: 6.5,
      z: GCZ,
    });
    if (!a) return null;
    return { x: a.x - 0.6, y: a.y, z: a.z + 2.2 };
  }
  L.hook("world", function () {
    const st = stallSpot();
    if (!st) return;
    // a display table with the presentation case (the real one is in the vault: this is the Corporation's sample)
    try {
      const tb = L.prop("table", {
        x: st.x - 1.1,
        y: st.y,
        z: st.z,
        yaw: Math.PI / 2,
        kind: "wood",
      });
      if (tb && !G.isStub("items") && G.items.createItemModel && G.scene) {
        const m = G.items.createItemModel("md_presentation_case");
        if (m) {
          m.position.set(st.x - 1.1, st.y + 0.78, st.z);
          m.rotation.y = -Math.PI / 2;
          m.scale.setScalar(1.4);
          G.scene.add(m);
          L.world.mdDisplay = m;
        }
      }
    } catch (e) {
      G.reportError("quests:md display", e);
    }
    // the Grand Prize Vault: a locked exhibition safe a few steps north of the stall
    if (!G.isStub("containers") && G.containers.create) {
      const vp = L.freeSpot(st.x + 0.4, st.z - 4.2, st.y, {
        maxR: 3,
        radius: 0.5,
      });
      try {
        const locksLive = !G.isStub("locks") && !!G.locks;
        L.world.mdVault = G.containers.create({
          id: "md_fair_vault",
          name: "Grand Prize Vault",
          kind: "safe",
          pos: { x: vp.x, y: vp.y, z: vp.z },
          yaw: -Math.PI / 2,
          items: [
            ["md_unisphere_blazer", 1],
            ["md_presentation_case", 1],
            ["gold_bar", 3],
            ["rally_tonic_extra", 3],
            ["scrip", 500],
            [REEL, 1],
          ],
          lock: locksLive ? Object.assign({}, VAULT_LOCK) : undefined,
          owner: null,
        });
        const c = L.world.mdVault;
        if (c && c.interactable && !locksLive) {
          const en = c.interactable.enabled;
          c.interactable.enabled = () => L.has(KEY) && (!en || en());
        }
      } catch (e) {
        G.reportError("quests:md vault", e);
      }
    }
  });
  L.hook("register", function () {
    if (!G.isStub("locks") && G.locks && G.locks.register) {
      try {
        G.locks.register(Object.assign({}, VAULT_LOCK));
      } catch (e) {
        G.reportError("quests:md vault lock", e);
      }
      try {
        if (G.locks.obtainableFrom)
          G.locks.obtainableFrom(
            KEY,
            "Gideon Tarbell at Grand Central (hand in all twenty World's Fair medallions)",
          );
      } catch (e) {
        /* optional */
      }
    }
  });
  L.hook("spawn", function () {
    const st = stallSpot();
    if (st) {
      const p = L.freeSpot(st.x, st.z, st.y, { maxR: 2.5 });
      L.spawnNPC({
        id: NPC,
        type: "human",
        name: "Gideon Tarbell",
        outfit: "director_suit",
        gender: "m",
        faction: "settlers",
        ai: "static",
        pos: p,
        lookYaw: Math.atan2(GCX - p.x, GCZ - p.z) + Math.PI,
        dialogue: DLG,
        essential: true,
        age: 0.9,
        hair: "balding",
        hairColor: 0xe0dcd2,
        glasses: true,
        skinTone: 0.2,
        barks: [
          "Medallions! Bronze World's Fair medallions bought here! Twenty-five scrip apiece, per the schedule!",
          "The Fair closed on October seventeenth, 1965. Nobody told me to stop.",
          "Peace Through Understanding! That was the theme. I still think it was a good one.",
          "Mind the velvet.",
        ],
      });
    }
    // the medallions themselves
    for (const s of SPOTS) {
      if (owned(s[1])) continue;
      const site = G.LAYOUT.getSite(s[2]);
      if (!site) continue;
      const c = {
        x: (site.x0 + site.x1) / 2 + s[4][0],
        z: (site.z0 + site.z1) / 2 + s[4][1],
      };
      const p = L.anchor(s[2], s[3], c, { maxR: 10 });
      if (!p) continue;
      // nudge off the anchor so it doesn't sit inside an NPC standing there
      place(s, { x: p.x + 0.7, y: p.y, z: p.z + 0.5 });
    }
    // The souvenir map in the cryo unit's prep room.
    if (!L.has(FLYER)) {
      const f = flyerSpot();
      if (f) L.pickup("md_flyer", FLYER, 1, f);
    }
  });

  /** Place one medallion: the props stand when props has it, else a plain item pickup. */
  function place(s, pos) {
    const key = "md_" + s[0];
    pos = L.unburyPickup(pos);
    let h = null;
    if (!G.isStub("props") && G.props.spawn) {
      h = L.prop("medallion", {
        x: pos.x,
        y: pos.y,
        z: pos.z,
        medallion: s[1],
        index: SPOTS.indexOf(s),
        collide: false,
        yaw: L.rng() * Math.PI * 2,
      });
      if (h && !h.interactable) {
        try {
          if (h.remove) h.remove();
        } catch (e) {
          /* */
        }
        h = null;
      }
    }
    if (h) {
      L.dyn(h);
      L.pickups[key] = { id: s[1], pos, handle: h };
      return;
    }
    L.pickup(key, s[1], 1, pos);
  }
  function flyerSpot() {
    let a = null;
    try {
      a = G.map.getAnchor && G.map.getAnchor("cryo_c9", "prep_room");
    } catch (e) {
      a = null;
    }
    if (a && isFinite(a.x) && isFinite(a.z)) {
      const f = L.freeSpot(a.x + 0.9, a.z + 0.4, a.y || 0, { maxR: 3 });
      return f || { x: a.x + 0.9, y: a.y || 0, z: a.z + 0.4 };
    }
    const C = L.cryo && L.cryo.spots;
    const base = C && (C.goggles || C.locker);
    return base ? { x: base.x + 0.9, y: base.y, z: base.z + 0.4 } : null;
  }

  // ------------------------------------------------------------------
  // Dialogue: Gideon Tarbell, Deputy Curator of Exhibits (ret., unofficially)
  // ------------------------------------------------------------------
  L.hook("register", function () {
    const handInR = {
      text: () => {
        const n = carried().length;
        return "I have medallions for you. [" + n + "]";
      },
      cond: () => carried().length > 0,
      action: () => {
        lastHandIn = handIn();
      },
      next: "thanks",
    };
    const vaultR = {
      text: "About that vault behind you.",
      cond: () => L.has(KEY) && !L.flag("md_vault_open"),
      next: "vault",
    };
    const bye = { text: "Goodbye, Mr. Tarbell.", end: true };
    L.dialogue(DLG, {
      start: () => (L.flag("md_met") ? "hello" : "first"),
      nodes: {
        first: {
          speaker: "Gideon Tarbell",
          text:
            "Ah! A visitor! Welcome, welcome to the New York World's Fair, Grand Central annex. Gideon Tarbell, Deputy Curator of Exhibits, World's Fair 1964–1965 Corporation. " +
            "[He offers a hand in a white cotton glove, gone grey at the fingertips.] The Fair closed on October seventeenth, 1965. Nobody ever told me to stop, and I have never been a man to presume.",
          onEnter() {
            L.setFlag("md_met", true);
            if (!Q.isStarted(QID)) Q.start(QID);
          },
          responses: [
            { text: "What are you doing up here?", next: "what" },
            { text: "You collect something?", next: "medals" },
            handInR,
            bye,
          ],
        },
        hello: {
          speaker: "Gideon Tarbell",
          text: () => {
            const h = handed();
            return (
              "Welcome back to the Fair! " +
              (h >= 20
                ? "The set is complete. I polish it every morning. It does not need it."
                : "The case shows " +
                  h +
                  " of twenty. " +
                  (h
                    ? "A fine start to a fine collection."
                    : "Empty velvet. It is waiting for you."))
            );
          },
          onEnter() {
            const extra = catchUpMilestones();
            if (extra.length)
              lastHandIn = { n: 0, paid: 0, after: handed(), lines: extra };
          },
          responses: [
            handInR,
            vaultR,
            { text: "What was in it for you, the Fair?", next: "fair" },
            { text: "Remind me about the medallions.", next: "medals" },
            {
              text: "Did I miss a prize?",
              cond: () =>
                !!(lastHandIn && lastHandIn.n === 0 && lastHandIn.lines.length),
              next: "thanks",
            },
            bye,
          ],
        },
        what: {
          speaker: "Gideon Tarbell",
          text:
            "Up here? Curating. In 1965 the great colour photograph hung on this balcony, sixty feet of it, and the Corporation kept an information stand below for visitors catching the train out to Flushing Meadows. " +
            "When the Fair closed they sent me here with the Grand Prize Vault to wait for the national tour train. Spring of '66, they said. [He looks at the safe beside him.] It has been a long spring.",
          responses: [
            { text: "The Grand Prize Vault?", next: "vault_lore" },
            { text: "You collect something?", next: "medals" },
            bye,
          ],
        },
        vault_lore: {
          speaker: "Gideon Tarbell",
          text:
            'The prize for the Souvenirs of Tomorrow promotion. Paragraph nine: "The holder of the complete set shall be entitled to the contents of the Grand Prize Vault." ' +
            "Nobody ever completed the set. I have the key. I have never opened it. That would be against paragraph nine, and paragraph nine is very nearly all I have left.",
          responses: [
            { text: "How do I complete the set?", next: "medals" },
            bye,
          ],
        },
        medals: {
          speaker: "Gideon Tarbell",
          text: () =>
            'Twenty bronze medallions, one for each wonder of the Fair, loaned to twenty great institutions of this city "for public display in perpetuity." Perpetuity turned out to be shorter than advertised. ' +
            "The Corporation buys them back: " +
            PRICE +
            " scrip apiece, per the 1965 buy-back schedule. For every fifth one in my case, a prize. For all twenty, the vault." +
            (count()
              ? " You have found " +
                count() +
                " so far, I see. The bulge in your pocket is very distinctive."
              : ""),
          onEnter() {
            if (!Q.isStarted(QID)) Q.start(QID);
          },
          responses: [
            handInR,
            { text: "What are the prizes?", next: "prizes" },
            bye,
          ],
        },
        prizes: {
          speaker: "Gideon Tarbell",
          text:
            "At five, an official Fair Host's boater. At ten, the first-aid pavilion's last good tonic. At fifteen, the shooting-gallery Grand Prize from the Lake Amusement Area. " +
            "And at twenty, paragraph nine. [He pats his vest pocket.] I will not say what is in the vault. I do not know. That is the beauty of a vault.",
          responses: [handInR, bye],
        },
        thanks: {
          speaker: "Gideon Tarbell",
          text: () => {
            const r = lastHandIn;
            if (!r)
              return "[He looks in your hands, then at you, kindly.] Nothing today? Perpetuity is patient.";
            let t = r.n
              ? "[He sets " +
                (r.n === 1 ? "the medallion" : "all " + r.n + " of them") +
                " into the velvet one at a time, with tweezers.] " +
                r.paid +
                " scrip, per the schedule. That makes " +
                r.after +
                " of twenty. "
              : "";
            if (r.lines.length) t += r.lines.join(" ");
            else {
              const nx = nextMilestone();
              if (nx) t += "Your next prize comes at " + nx + ".";
            }
            return t;
          },
          responses: [
            {
              text: "A pleasure doing business.",
              next: "hello",
              action: () => {
                lastHandIn = null;
              },
            },
            {
              text: "Goodbye.",
              end: true,
              action: () => {
                lastHandIn = null;
              },
            },
          ],
        },
        fair: {
          speaker: "Gideon Tarbell",
          text:
            "For me? I was thirty-eight. I had never been further than Albany. Then for two summers the whole world came to Queens and asked me where the restrooms were, and I knew. " +
            "Peace Through Understanding, that was the theme. Two years later the understanding ran out. [He straightens the velvet.] But the theme was a good one. Somebody ought to keep it on display.",
          responses: [handInR, bye],
        },
        vault: {
          speaker: "Gideon Tarbell",
          text: "It is right there, behind the stall. Go on. I would like to watch, if you do not mind. Twenty-four years is a long time to wonder about a box.",
          responses: [{ text: "Let's see what's inside.", end: true }, bye],
        },
      },
    });
  });

  // ------------------------------------------------------------------
  // Progress
  // ------------------------------------------------------------------
  function refresh(id) {
    const s = id && BY_ID[id];
    if (s && !L.flag("md_" + id)) {
      L.setFlag("md_" + id, true);
      L.later(1.2, () =>
        L.notify(s[6], { sub: "Souvenirs of Tomorrow", duration: 7 }),
      );
      if (L.once("md_hint_tarbell"))
        L.later(9, () =>
          L.hint(
            "medallions",
            "World's Fair medallions grant nothing by themselves: bring them to Gideon Tarbell on Grand Central's east balcony. He pays scrip, and a prize for every fifth one.",
          ),
        );
    }
    if (id === FLYER && !Q.isStarted(QID)) Q.start(QID);
    if (count() > 0 && !Q.isStarted(QID)) Q.start(QID);
    if (Q.isActive(QID) && s) L.refresh(QID);
  }
  function vaultOpened() {
    if (L.flag("md_vault_open")) return;
    L.setFlag("md_vault_open", true);
    L.later(0.8, () => L.say(NPC, "Oh. Oh, my. It was real. It was all real."));
    if (Q.isActive(QID)) Q.complete(QID);
  }
  G.events.on("itemAdded", (id) => refresh(id));
  G.events.on("medallionFound", (id) =>
    refresh(typeof id === "string" ? id : null),
  );
  G.events.on("lockOpened", (id) => {
    if (id === VAULT_LOCK.id) vaultOpened();
  });
  G.events.on("containerOpened", (c) => {
    if (c && (c.id === "md_fair_vault" || c === L.world.mdVault) && L.has(KEY))
      vaultOpened();
  });
  L.medallions = {
    count,
    handed,
    carried,
    handIn,
    SPOTS,
    MILESTONES,
    owned,
    PRICE,
  };
})();
