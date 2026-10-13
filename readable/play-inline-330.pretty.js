/* src/poi_chelsea/80_content.js */
/* =====================================================================
 * NEW RAD CITY — POI CHELSEA — 80_content.js
 * Webster Hall's people and the module's two side quests:
 *   "Encore"    (pch_encore) — Dizzy Calhoun's singer Lulu Monroe was
 *                snatched by the Conductors; free her from the freight
 *                terminal at the south end of the High Line.
 *   "Queen Bee" (pch_sweet)  — Gina Bellini wants royal jelly from the
 *                ant queen under the National Biscuit Company bakery.
 * Plus the box-office terminal, notes, unique rewards, merchants.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE || !G._pch) return;
  const PF = G._pch;
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  const PI = Math.PI,
    HP = PI / 2;
  const WH_DOOR = { x: 160, z: 305 };
  const HL_DOOR = { x: -305.5, z: 271 };
  const NB_DOOR = { x: -240, z: 261 };

  // ---------------------------------------------------------------
  // Items
  // ---------------------------------------------------------------
  PF.item({
    id: "pch_encore_gun",
    build() {
      const base = PF.live("items") ? G.items.get("magnum_44") : null;
      const w =
        base && base.weapon
          ? Object.assign({}, base.weapon, {
              damage: Math.round((base.weapon.damage || 40) * 1.3),
              critChance: 1.6,
              spread: (base.weapon.spread || 0.02) * 0.7,
              condDecay: (base.weapon.condDecay || 0.002) * 0.6,
              skin: "chrome",
            })
          : undefined;
      return {
        id: "pch_encore_gun",
        type: w ? "weapon" : "misc",
        name: "The Encore",
        weight: 4,
        value: 1100,
        unique: true,
        icon: base ? base.icon : undefined,
        desc: 'Dizzy Calhoun\'s nickel-plated .44, engraved along the barrel: "ONE MORE TIME, WITH FEELING." He kept it in the trumpet case for forty years and never once had to play it. Accurate, heavy, and loud enough to count as percussion.',
        weapon: w,
      };
    },
  });
  PF.item({
    id: "pch_queen_bee",
    type: "aid",
    name: "Queen Bee Cocktail",
    weight: 0.5,
    value: 60,
    tags: ["drink", "alcohol"],
    effects: {
      hp: 20,
      attrs: { reflex: 2, presence: 1 },
      duration: 240,
      rads: 2,
    },
    sound: "drink",
    desc: "Gina Bellini's legendary cocktail: bathtub gin, Fizzo syrup and a spoon of ant-queen royal jelly. Tastes like honey and a lightning strike. +2 Reflex, +1 Presence for four minutes.",
  });
  PF.item({
    id: "pch_rosa_key",
    type: "key",
    name: "Gina's Stash Key",
    weight: 0,
    value: 0,
    desc: "A small brass key on a bottle-opener ring. Gina keeps it in her apron.",
  });
  PF.keyFrom("pch_rosa_key", "NPC: Gina Bellini (carried)");
  PF.note(
    "pch_note_setlist",
    "Dizzy's Set List",
    "THE RADIUM RHYTHM KINGS — SATURDAY SET",
    '1. Bomb Shelter Shuffle (instr.)\n2. Moonlight Over the Hudson (Lulu)\n3. Glow, Little Geiger (Lulu)\n4. Pack Ox Boogie\n5. The 14th Street Stomp\n6. Two Hearts Are Better (Lulu, if she\'s back)\n7. Radium Rag\n— encore —\n8. "One More Time" (everybody)\n\n[Scrawled at the bottom:] Tell Slim to STOP speeding up in the bridge. Tell Hot Rod the cymbal is not a weapon.',
  );
  PF.note(
    "pch_poster_lulu",
    'Poster: "Lulu Monroe"',
    "LULU MONROE — THE CANARY OF 11th STREET",
    'LIVE AT WEBSTER HALL\nwith THE RADIUM RHYTHM KINGS\n\n"Her voice could melt a Geiger counter." — Radio Free Manhattan\n\nSaturdays. Cover 5 scrip. Guns at the door.',
  );
  PF.terminal("pch_wh_boxoffice", {
    title: "WEBSTER HALL — BOX OFFICE",
    header: "KESTREL TELETYPE CORP. — MODEL 40 — WEBSTER HALL TICKETING v3.1",
    entries: [
      {
        title: "Tonight: SUNDAY, MAR 5 1967",
        text: "ATOMIC JAMBOREE — featuring The Geiger-Tones, Candy Kilowatt & Her Isotopes, and a Special Guest (Valet tap-dance exhibition)\n\nDoors 8 PM. SOLD OUT.\n\n** EVENT CANCELLED — CIVIL DEFENSE ALERT **\nRefunds available at the box office.",
      },
      {
        title: "History of the Hall",
        text: 'Built 1886 by Charles Goldstein for balls, banquets and meetings of every description. The Masquerade Balls of the 1910s. The labour rallies. The Jazz Age. The "Webster Hall Swing Night" (est. 1941, never missed a Saturday).\n\nThe management wishes to remind patrons that the ballroom floor is the original 1886 maple and is not to be danced upon in hobnailed boots.',
      },
      {
        title: "Management Memo",
        text: 'To all staff: the new Consolidated Dynamo "Hearth" generator in the Studio is NOT a coat rack, NOT a bar stool and NOT to be kicked when it flickers. If it flickers, call Consolidated Dynamo.\n\nConsolidated Dynamo does not answer the phone.',
      },
      {
        title: "Refund Requests (1,418)",
        text: '[Scrolling list of names. The last entry reads: "D. CALHOUN — 2 TICKETS — REQUESTS NO REFUND. SAYS HE\'LL BE BACK NEXT SATURDAY."]',
      },
    ],
  });

  // ---------------------------------------------------------------
  // Quests
  // ---------------------------------------------------------------
  PF.quest({
    id: "pch_encore",
    name: "Encore",
    giver: "Dizzy Calhoun",
    location: "Webster Hall",
    desc: "The Conductors — the raiders who run the High Line as a toll road — kidnapped Lulu Monroe, the singer of the Radium Rhythm Kings, and are holding her for ransom in the old St. John's Park Freight Terminal at the south end of the High Line. Dizzy Calhoun wants her back before Saturday.",
    stages: [
      {
        id: "find",
        text: "Find Lulu Monroe in the St. John's Park Freight Terminal at the south end of the High Line.",
        markers: () => {
          const a = PF.anchorOf2("high_line", "cage");
          return a && PF.inCellKey("high_line")
            ? [{ x: a.x, z: a.z, y: a.y, label: "Lulu Monroe", interior: true }]
            : [
                {
                  x: HL_DOOR.x,
                  z: HL_DOOR.z,
                  y: 8,
                  label: "St. John's Park Freight Terminal",
                },
              ];
        },
      },
      {
        id: "free",
        text: "Get Lulu out of the Conductors' holding cage (the Conductor carries the Butcher's Cage Key).",
        markers: () => {
          const a = PF.anchorOf2("high_line", "cage");
          return a
            ? [
                {
                  x: a.x,
                  z: a.z,
                  y: a.y,
                  label: "Holding Cage",
                  interior: true,
                },
              ]
            : [];
        },
      },
      {
        id: "return",
        text: "Tell Dizzy Calhoun at Webster Hall that Lulu is free.",
        markers: () => [
          {
            npc: "pch_wh_dizzy",
            x: WH_DOOR.x,
            z: WH_DOOR.z,
            label: "Dizzy Calhoun",
          },
        ],
      },
    ],
    rewards: { xp: 350, scrip: 150, standing: 25 },
  });
  PF.quest({
    id: "pch_sweet",
    name: "Queen Bee",
    giver: "Gina Bellini",
    location: "Webster Hall",
    desc: "Gina Bellini, who tends bar at Webster Hall, is perfecting a cocktail that needs a spoonful of royal jelly — from the queen of the giant ants nesting under the National Biscuit Company bakery on 15th Street.",
    stages: [
      {
        id: "factory",
        text: "Find the ant queen beneath the National Biscuit Company factory.",
        markers: () => {
          const a = PF.anchorOf2("nabisco_factory", "boss");
          return a && PF.inCellKey("nabisco_factory")
            ? [{ x: a.x, z: a.z, y: a.y, label: "The Queen", interior: true }]
            : [
                {
                  x: NB_DOOR.x,
                  z: NB_DOOR.z,
                  label: "National Biscuit Company",
                },
              ];
        },
      },
      {
        id: "queen",
        text: "Take the royal jelly from the Queen's brood cell.",
        markers: () => {
          const a = PF.anchorOf2("nabisco_factory", "royal_cell");
          return a
            ? [
                {
                  x: a.x,
                  z: a.z,
                  y: a.y,
                  label: "Royal Brood Cell",
                  interior: true,
                },
              ]
            : [];
        },
      },
      {
        id: "return",
        text: "Bring the royal jelly to Gina at Webster Hall.",
        markers: () => [
          {
            npc: "pch_wh_rosa",
            x: WH_DOOR.x,
            z: WH_DOOR.z,
            label: "Gina Bellini",
          },
        ],
      },
    ],
    rewards: { xp: 300, scrip: 120, items: [["pch_queen_bee", 3]] },
  });
  PF.anchorOf2 = function (poi, name) {
    try {
      return G.pois.getAnchor(poi, name);
    } catch (e) {
      return null;
    }
  };
  PF.inCellKey = function (key) {
    return PF.inCell(key);
  };

  // ---------------------------------------------------------------
  // Dialogue
  // ---------------------------------------------------------------
  const encoreStage = () => PF.q.stage("pch_encore");
  PF.dialogue("pch_dlg_dizzy", {
    start: () => {
      if (PF.q.complete("pch_encore")) return "after";
      if (PF.flag("lulu_freed")) {
        if (!PF.q.started("pch_encore")) PF.q.start("pch_encore");
        if (PF.q.stage("pch_encore") !== "return")
          PF.q.set("pch_encore", "return");
        return "report";
      }
      return PF.q.active("pch_encore") ? "waiting" : "root";
    },
    nodes: {
      root: {
        speaker: "Dizzy Calhoun",
        text: "Welcome to Webster Hall, friend. Dizzy Calhoun, trumpet, bandleader, and — since the boss died in '69 — management. Grab a drink, dance if you got the knees for it. Just... don't ask for \"Two Hearts Are Better.\" Not tonight.",
        responses: [
          { text: "Why not tonight?", next: "why" },
          { text: "How does a dance hall survive out here?", next: "survive" },
          { text: "I'll let you get back to it." },
        ],
      },
      survive: {
        speaker: "Dizzy Calhoun",
        text: "Same as it always did: people pay to forget. Scrip at the door, Gina's gin at the bar, Big Tony outside to explain the rules. Twenty-two years and it turns out a good Saturday night is the one thing the bombs couldn't cancel.",
        responses: [
          { text: 'And why not "Two Hearts Are Better"?', next: "why" },
          { text: "Fair enough." },
        ],
      },
      why: {
        speaker: "Dizzy Calhoun",
        text: "Because that's Lulu's number, and Lulu ain't here. The Conductors — raiders who squat on the old High Line and charge a toll to walk it — grabbed her off the 14th Street stair four days ago. Ransom note says three hundred scrip. I don't have three hundred scrip. I have a trumpet and a bad heart.",
        responses: [
          {
            text: "I'll get her back.",
            next: "accept",
            action: () => {
              if (!PF.q.started("pch_encore")) PF.q.start("pch_encore");
            },
          },
          {
            text: "[Persuasion 40] Three hundred scrip for a singer? She must be good.",
            check: { skill: "persuasion", value: 40 },
            next: "speech",
            failNext: "speechFail",
          },
          { text: "Not my problem.", next: "decline" },
        ],
      },
      speech: {
        speaker: "Dizzy Calhoun",
        text: "Good? Kid, when Lulu sings \"Moonlight Over the Hudson\" the old-timers in the back cry and the raiders outside stop shooting to listen. That's why they took her. [He leans in.] Bring her home and I'll give you the only thing I own worth more than my horn. And I'll throw in a hundred scrip from the door.",
        responses: [
          {
            text: "Deal. Where is she?",
            next: "accept",
            action: () => {
              if (!PF.q.started("pch_encore")) PF.q.start("pch_encore");
              PF.setFlag("dizzy_bonus", true);
            },
          },
        ],
      },
      speechFail: {
        speaker: "Dizzy Calhoun",
        text: "Don't get cute. She's the best voice south of 34th Street and she's the closest thing I got to family. Will you help or not?",
        responses: [
          {
            text: "I'll help.",
            next: "accept",
            action: () => {
              if (!PF.q.started("pch_encore")) PF.q.start("pch_encore");
            },
          },
          { text: "Not right now.", next: "decline" },
        ],
      },
      accept: {
        speaker: "Dizzy Calhoun",
        text: 'Bless you. The Conductors hole up in the St. John\'s Park Freight Terminal — the big brick building where the High Line ends, south of 14th. Stairs up to the tracks at the north end or by 18th Street, or try the loading dock. Their boss calls himself "the Conductor." Wears a hat. Carries a shotgun. Has no sense of rhythm.',
        responses: [{ text: "I'm on it." }],
      },
      decline: {
        speaker: "Dizzy Calhoun",
        text: "Yeah. Sure. Nobody's problem. [He turns back to the stage and plays four slow bars that sound exactly like a door closing.]",
        responses: [{ text: "[Leave]" }],
      },
      waiting: {
        speaker: "Dizzy Calhoun",
        text: () =>
          encoreStage() === "free"
            ? "You found her? She's alive? Then what are you doing HERE? Get that cage open!"
            : "Any word on Lulu? The Freight Terminal, south end of the High Line. Please.",
        responses: [
          { text: "Working on it." },
          { text: "Tell me about the Conductors again.", next: "accept" },
        ],
      },
      report: {
        speaker: "Dizzy Calhoun",
        text: "You... she walked in the door an hour ago, shaking like a leaf and humming. HUMMING. Lord have mercy. You brought her home.",
        responses: [{ text: "She did most of the walking.", next: "reward" }],
      },
      reward: {
        speaker: "Dizzy Calhoun",
        text: () =>
          "Here. This is The Encore — my father's .44. Kept it in the trumpet case since before the war. Never played it once. I think it's been waiting for you." +
          (PF.flag("dizzy_bonus")
            ? " And the hundred scrip, like I promised."
            : "") +
          " Saturday night, you drink free. Every Saturday. For life.",
        onEnter: () => {
          if (PF.q.active("pch_encore")) {
            PF.q.done("pch_encore");
            PF.inv.add("pch_encore_gun", 1);
            if (PF.flag("dizzy_bonus")) PF.inv.addScrip(100);
            PF.news(
              "Good news from 14th Street: Lulu Monroe is back on stage at Webster Hall, and the Conductors on the High Line are one conductor short. The Radium Rhythm Kings play Saturday. Dance like nobody's irradiated.",
            );
          }
        },
        responses: [{ text: "Thanks, Dizzy." }],
      },
      after: {
        speaker: "Dizzy Calhoun",
        text: "Our hero! Gina — this one drinks on the house. Lulu, honey, sing the one about the moon.",
        responses: [{ text: "Play something good." }],
      },
    },
  });
  PF.dialogue("pch_dlg_lulu", {
    start: () =>
      PF.flag("lulu_freed")
        ? "home"
        : PF.flag("hl_cage_open")
          ? "free"
          : "caged",
    nodes: {
      caged: {
        speaker: "Lulu Monroe",
        text: "Hey. Hey! You're not one of them — you don't smell like diesel and bad decisions. I'm Lulu. The big ugly one in the hat has the key on his belt. Please tell me you're good at taking things off big ugly men.",
        responses: [
          {
            text: "Dizzy sent me.",
            cond: () => PF.q.active("pch_encore"),
            next: "dizzy",
          },
          {
            text: "Hang tight. I'll get you out.",
            action: () => {
              if (!PF.q.started("pch_encore")) PF.q.start("pch_encore");
              PF.q.advance("pch_encore", ["find"], "free");
            },
          },
        ],
      },
      dizzy: {
        speaker: "Lulu Monroe",
        text: "That old goat actually did something? God bless him. The key's on the Conductor — upstairs, the office overlooking the tracks. Ask him nicely, or don't. Just hurry — the butcher keeps coming by to \"measure\" me.",
        responses: [
          {
            text: "On it.",
            action: () => PF.q.advance("pch_encore", ["find"], "free"),
          },
        ],
      },
      free: {
        speaker: "Lulu Monroe",
        text: "Oh, sweet fresh-ish air. Thank you. I know the way home — the loading dock lets out on 14th and I can run the rest. Tell Dizzy to warm up the band. And tell him I want a raise.",
        responses: [
          { text: "Go. I'll meet you there.", action: () => freeLulu() },
          {
            text: "[Presence 6] Sing me something before you go?",
            check: { attr: "presence", value: 6 },
            next: "song",
            failNext: "nosong",
          },
        ],
      },
      song: {
        speaker: "Lulu Monroe",
        text: "[She clears her throat and sings, low and warm, a few bars about moonlight on the Hudson and a sailor who never came home. For a moment the freight terminal is very quiet.] ...That one's for you, hero. Now get me out of here.",
        onEnter: () => {
          if (!PF.flag("lulu_song")) {
            PF.setFlag("lulu_song", true);
            PF.xp(50, "A song from Lulu");
            try {
              G.player.heal(40);
            } catch (e) {
              /* core */
            }
          }
        },
        responses: [{ text: "Go home, Lulu.", action: () => freeLulu() }],
      },
      nosong: {
        speaker: "Lulu Monroe",
        text: "Honey, I've been in a meat locker for four days. The encore can wait for the stage.",
        responses: [{ text: "Go home, Lulu.", action: () => freeLulu() }],
      },
      home: {
        speaker: "Lulu Monroe",
        text: () =>
          PF.q.complete("pch_encore")
            ? "There's my hero! Stick around for the late set — I'm doing \"Two Hearts Are Better,\" and I'm dedicating it to you and the butcher's bad aim."
            : "Did you tell Dizzy yet? Go on, he's up on the stage pretending he wasn't crying.",
        responses: [
          { text: "Break a leg." },
          {
            text: "[Presence 6] Sing me something?",
            cond: () => !PF.flag("lulu_song"),
            check: { attr: "presence", value: 6 },
            next: "song2",
            failNext: "nosong2",
          },
        ],
      },
      song2: {
        speaker: "Lulu Monroe",
        text: '[Lulu hums the opening of "Glow, Little Geiger," a lullaby that somehow makes radiation sound cozy. A couple on the dance floor stop to listen.]',
        onEnter: () => {
          if (!PF.flag("lulu_song")) {
            PF.setFlag("lulu_song", true);
            PF.xp(50, "A song from Lulu");
          }
        },
        responses: [{ text: "Beautiful." }],
      },
      nosong2: {
        speaker: "Lulu Monroe",
        text: "Buy a ticket like everybody else, sugar. Saturday.",
        responses: [{ text: "Fair." }],
      },
    },
  });
  function freeLulu() {
    if (PF.flag("lulu_freed")) return;
    PF.setFlag("lulu_freed", true);
    if (!PF.q.started("pch_encore")) PF.q.start("pch_encore");
    if (PF.q.active("pch_encore")) PF.q.set("pch_encore", "return");
    PF.xp(75, "Freed Lulu Monroe");
    const a = PF.getNpc("pch_lulu_cage");
    if (a)
      setTimeout(() => {
        PF.safe("lulu_leave", () => {
          if (G.fadeTransition && a && !a.dead) {
            try {
              G.actors.remove(a);
            } catch (e) {
              /* */
            }
          }
        });
      }, 1200);
    PF.spawnRoster();
  }
  PF.dialogue("pch_dlg_rosa", {
    start: () => {
      if (!PF.q.complete("pch_sweet") && PF.inv.count("pch_royal_jelly")) {
        if (!PF.q.started("pch_sweet")) PF.q.start("pch_sweet");
        if (PF.q.active("pch_sweet") && PF.q.stage("pch_sweet") !== "return")
          PF.q.set("pch_sweet", "return");
        return "jelly";
      }
      return "root";
    },
    nodes: {
      root: {
        speaker: "Gina Bellini",
        text: () =>
          PF.q.complete("pch_encore")
            ? "Well, if it isn't the hero of 14th Street. Your money's no good here on Saturdays. Today's Tuesday. What'll it be?"
            : "Welcome to the best bar in the Village, which is saying something, because it's the only bar on 11th Street. I'm Gina. I pour, I listen, I throw people out. What'll it be?",
        responses: [
          { text: "Let's see what you're pouring.", barter: true },
          {
            text: "What's good here?",
            next: "good",
            cond: () => !PF.q.started("pch_sweet"),
          },
          {
            text: "About that royal jelly...",
            next: "status",
            cond: () => PF.q.active("pch_sweet"),
          },
          {
            text: "[5 scrip] Pour me a Queen Bee.",
            cond: () => PF.q.complete("pch_sweet") && PF.inv.scrip() >= 5,
            action: () => {
              PF.inv.addScrip(-5);
              PF.inv.add("pch_queen_bee", 1);
            },
            next: "pour",
          },
          { text: "Any gossip?", next: "gossip" },
          { text: "Later, Gina." },
        ],
      },
      good: {
        speaker: "Gina Bellini",
        text: "Honestly? Nothing yet. I'm working on a cocktail — the Queen Bee. Gin, Fizzo syrup, and royal jelly. Real royal jelly, the kind giant ant queens make for their brood. Makes you feel twenty years younger and twice as fast. Problem is, the nearest queen lives under the old Nabisco bakery on 15th and Tenth, and she doesn't do deliveries.",
        responses: [
          {
            text: "I could get you some.",
            next: "accept",
            action: () => {
              if (!PF.q.started("pch_sweet")) PF.q.start("pch_sweet");
            },
          },
          { text: "Giant ants? Hard pass.", next: "pass" },
        ],
      },
      accept: {
        speaker: "Gina Bellini",
        text: "You're a doll. The bakery's crawling — the ants moved in for the Chocolate Zeppelins, twenty-two years of snack cakes. The queen will be down deep, under the mixing floor where the nest is warm. Kill her, find the brood cell, bring me the jelly. Bring a flamer if you've got one. Bring two.",
        responses: [{ text: "Back soon." }],
      },
      pass: {
        speaker: "Gina Bellini",
        text: "Can't blame you. Offer stands if you grow a spine. Or six legs.",
        responses: [{ text: "[Leave]" }],
      },
      status: {
        speaker: "Gina Bellini",
        text: "National Biscuit Company, 15th and Tenth. Queen's underneath. Jelly's in her brood cell. Try not to get eaten, the tab is still open.",
        responses: [{ text: "Right." }],
      },
      jelly: {
        speaker: "Gina Bellini",
        text: "Is that — oh, look at that. Amber as sunset and it smells like burnt sugar. You actually did it.",
        responses: [
          {
            text: "Here you go.",
            next: "thanks",
            action: () => {
              PF.inv.remove("pch_royal_jelly", 1);
              PF.q.done("pch_sweet");
            },
          },
          {
            text: "[Trade 50] A cocktail this good should come with a partnership.",
            check: { skill: "trade", value: 50 },
            next: "partner",
            failNext: "nopartner",
          },
        ],
      },
      partner: {
        speaker: "Gina Bellini",
        text: "Ha! A shark in a deep-freeze suit. Fine — ten percent of every Queen Bee I sell, paid up front. Call it a hundred scrip and we're square.",
        responses: [
          {
            text: "Pleasure doing business.",
            next: "thanks",
            action: () => {
              PF.inv.remove("pch_royal_jelly", 1);
              PF.inv.addScrip(100);
              PF.q.done("pch_sweet");
            },
          },
        ],
      },
      nopartner: {
        speaker: "Gina Bellini",
        text: "Nice try, sugar. The recipe's mine. The reward's fair.",
        responses: [
          {
            text: "Fine. Here.",
            next: "thanks",
            action: () => {
              PF.inv.remove("pch_royal_jelly", 1);
              PF.q.done("pch_sweet");
            },
          },
        ],
      },
      thanks: {
        speaker: "Gina Bellini",
        text: "First three Queen Bees are yours. After that, five scrip, same as everybody. [She pours something gold that fizzes like it's thinking.] Welcome to the hive.",
        responses: [{ text: "Cheers." }],
      },
      pour: {
        speaker: "Gina Bellini",
        text: "One Queen Bee. Don't operate heavy machinery. Or light machinery. Or a gun, ideally.",
        responses: [{ text: "Cheers." }],
      },
      gossip: {
        speaker: "Gina Bellini",
        text: () => {
          const G2 = [
            "The Conductors up on the High Line charge twenty scrip to walk the tracks. Double if you're from Webster Hall, because we \"have a band\". I've never heard a stupider business model and I've heard DJ Cinders'.",
            "Cinders says the generator downstairs is on its last legs. If somebody handy fixed it, the neon out front would stop blinking like a drunk's turn signal.",
            "Doc Wendt used to be a vet. For horses. Nobody tells him we know.",
            "There's a boxcar on the High Line with OFFICE OF CIVIL DEFENSE stencilled on the side. The Conductors can't open it. Nobody can. That never stops anybody from trying.",
            "You can walk from the High Line straight into the old Nabisco bakery — there's a rail bridge over Tenth Avenue. Ants use it too, so, you know. Watch your ankles.",
          ];
          const i = (PF.flag("rosa_gossip") || 0) % G2.length;
          PF.setFlag("rosa_gossip", (PF.flag("rosa_gossip") || 0) + 1);
          return G2[i];
        },
        responses: [
          { text: "Anything else?", next: "gossip" },
          { text: "Thanks.", next: "root" },
        ],
      },
    },
  });
  function heal(rads) {
    try {
      if (PF.live("rpg") && G.rpg.doctorHeal)
        G.rpg.doctorHeal({ rads: !!rads, limbs: true, hp: true });
      else {
        G.player.heal(999);
        if (rads) G.player.rads = Math.max(0, G.player.rads - 400);
      }
    } catch (e) {
      try {
        G.player.heal(999);
      } catch (e2) {
        /* ignore */
      }
    }
    PF.sfx("inject");
  }
  PF.dialogue("pch_dlg_doc", {
    start: "root",
    nodes: {
      root: {
        speaker: "Doc Wendt",
        text: "Coat check's closed. Clinic's open. Bullet holes, bite marks, bad tattoos, glowing in the dark — I've seen it all and I charge for it all. Sit.",
        responses: [
          {
            text: "[30 scrip] Patch me up.",
            cond: () => PF.inv.scrip() >= 30,
            action: () => {
              PF.inv.addScrip(-30);
              heal(false);
            },
            next: "done",
          },
          {
            text: "[70 scrip] Get the radiation out of me.",
            cond: () => PF.inv.scrip() >= 70,
            action: () => {
              PF.inv.addScrip(-70);
              heal(true);
            },
            next: "done",
          },
          { text: "Show me your supplies.", barter: true },
          { text: "Were you really a horse doctor?", next: "horse" },
          { text: "Not today." },
        ],
      },
      done: {
        speaker: "Doc Wendt",
        text: "There. Don't pick at it. Don't drink Gina's specials for an hour. You won't listen, but I said it, so legally I'm covered.",
        responses: [{ text: "Thanks, Doc." }],
      },
      horse: {
        speaker: "Doc Wendt",
        text: "...I was a VETERINARIAN. Large animals. You know what humans are? Medium animals. The principles are identical. Now do you want the stitches or not?",
        responses: [{ text: "Neigh.", next: "root" }],
      },
    },
  });
  PF.dialogue("pch_dlg_static", {
    start: "root",
    nodes: {
      root: {
        speaker: "DJ Cinders",
        text: () =>
          PF.flag("wh_power")
            ? "You! Generator hero! The Studio's spinnin' again, baby — best sound south of Radio City. What can I do you for?"
            : "Welcome to the Studio, where the beats are hot and the generator's hotter, and not in a good way. DJ Cinders. Yeah, the scars. Pulled my crates out of a fire in '67. I was spinning records here then and I'm still spinning 'em. Records don't care what your face looks like.",
        responses: [
          {
            text: "What's wrong with the generator?",
            cond: () => !PF.flag("wh_power"),
            next: "gen",
          },
          { text: "Got anything to trade?", barter: true },
          { text: "Play something.", next: "play" },
          { text: "Later, Cinders." },
        ],
      },
      gen: {
        speaker: "DJ Cinders",
        text: "Consolidated Dynamo Hearth, forty kilowatts, installed March 1967, warranty expired March 1967. Regulator's cooked. Somebody with a wrench and a clue — or a dry cell to buffer it — could fix it in five minutes. I've got the clue. I lost the wrench in '71.",
        responses: [
          { text: "I'll take a look." },
          { text: "Not my department." },
        ],
      },
      play: {
        speaker: "DJ Cinders",
        text: "[He drops the needle on a crackling 78. A big band swings out of speakers the size of refrigerators. It sounds like 1941 and like the end of the world at the same time.] That's the stuff.",
        responses: [{ text: "[Nod along]" }],
      },
    },
  });
  PF.dialogue("pch_dlg_tony", {
    start: "root",
    nodes: {
      root: {
        speaker: "Big Tony",
        text: "Webster Hall. Three rules. One: holster your piece on the dance floor. Two: no fighting unless it's a dance-off. Three: if Gina cuts you off, you're cut off. Questions?",
        responses: [
          { text: "What's the cover?", next: "cover" },
          { text: "Seen any trouble lately?", next: "trouble" },
          { text: "No questions." },
        ],
      },
      cover: {
        speaker: "Big Tony",
        text: "Five scrip, Saturdays. Rest of the week it's free, 'cause the band's only rehearsing. Honestly, rehearsals are better. Don't tell Dizzy.",
        responses: [{ text: "Got it.", next: "root" }],
      },
      trouble: {
        speaker: "Big Tony",
        text: "Conductors snatched Lulu. That's trouble. The ants at the bakery are getting bolder — found one gnawing on the marquee last week. That's weird trouble. Otherwise? Quiet. Too quiet. I don't like quiet. I like swing.",
        responses: [{ text: "Thanks.", next: "root" }],
      },
    },
  });

  // ---------------------------------------------------------------
  // NPC roster (built after the interior anchors exist)
  // ---------------------------------------------------------------
  PF.addBuilder(
    "webster_people",
    function () {
      const A = (PF.wh && PF.wh.int) || null;
      const E = (PF.WH && PF.WH.anchors) || {};
      if (!A) return;
      const pos = (a) => ({ x: a.x, y: a.y + 0.02, z: a.z });
      PF.npc({
        id: "pch_wh_dizzy",
        type: "human",
        name: "Dizzy Calhoun",
        outfit: "dj",
        gender: "m",
        faction: "settlers",
        level: 6,
        pos: pos(A.dizzy),
        yaw: A.dizzy.yaw,
        ai: "guard",
        home: { x: A.dizzy.x, z: A.dizzy.z, r: 1.2 },
        dialogue: "pch_dlg_dizzy",
        essential: true,
        weapon: "none",
        seed: 9101,
        lookYaw: A.dizzy.yaw,
        barks: [
          "A-one, a-two, a-one-two-three-four!",
          "Slim, you're rushing.",
          "This one's for everybody still standing.",
          "[He lifts the trumpet and blows a long, bright note.]",
        ],
      });
      PF.npc({
        id: "pch_wh_slim",
        type: "human",
        name: "Slim",
        outfit: "settler",
        gender: "m",
        faction: "settlers",
        level: 3,
        pos: pos(A.slim),
        yaw: A.slim.yaw,
        ai: "guard",
        home: { x: A.slim.x, z: A.slim.z, r: 0.5 },
        weapon: "none",
        seed: 9102,
        barks: [
          "[Thump-thump-thump-thump on the bass.]",
          "I'm not rushing. The song is slow.",
          "Hey, you dance?",
        ],
      });
      PF.npc({
        id: "pch_wh_hotrod",
        type: "human",
        name: "Hot Rod",
        outfit: "survivor",
        gender: "m",
        faction: "settlers",
        level: 3,
        pos: pos(A.hotrod),
        yaw: A.hotrod.yaw,
        ai: "guard",
        home: { x: A.hotrod.x, z: A.hotrod.z, r: 0.4 },
        weapon: "none",
        seed: 9103,
        barks: [
          "[Ba-dum-tss.]",
          "The cymbal is NOT a weapon. I checked.",
          "Lulu'd have this crowd on their feet.",
        ],
      });
      PF.npc({
        id: "pch_wh_rosa",
        type: "human",
        name: "Gina Bellini",
        outfit: "merchant",
        gender: "f",
        faction: "settlers",
        level: 6,
        pos: pos(A.bartender),
        yaw: A.bartender.yaw,
        ai: "guard",
        home: { x: A.bartender.x, z: A.bartender.z, r: 2.2 },
        dialogue: "pch_dlg_rosa",
        essential: true,
        weapon: "none",
        seed: 9104,
        voice: "merchant",
        inventory: [["pch_rosa_key", 1]],
        merchant: {
          scrip: 450,
          stock: [
            ["beer", 8],
            ["whiskey", 4],
            ["scotch", 2],
            ["vodka", 3],
            ["wine", 3],
            ["fizzo_cola", 5],
            ["prairie_root_beer", 4],
            ["purified_water", 6],
            ["chocolate_zeppelin", 4],
          ],
          restock: 3,
        },
        barks: [
          "What'll it be?",
          "Tab's open, sugar.",
          "Queen Bee's coming soon. Maybe.",
          "Wipe that off the bar, please.",
        ],
      });
      PF.npc({
        id: "pch_wh_doc",
        type: "human",
        name: "Doc Wendt",
        outfit: "doctor",
        gender: "m",
        faction: "settlers",
        level: 6,
        pos: pos(A.doctor),
        yaw: A.doctor.yaw,
        ai: "guard",
        home: { x: A.doctor.x, z: A.doctor.z, r: 1.6 },
        dialogue: "pch_dlg_doc",
        essential: true,
        weapon: "none",
        seed: 9105,
        voice: "merchant",
        merchant: {
          scrip: 350,
          stock: [
            ["rally_tonic", 5],
            ["prussian_blue", 3],
            ["iodine_tabs", 3],
            ["morphine_syrette", 2],
            ["root_poultice", 2],
            ["purified_water", 4],
          ],
          restock: 3,
        },
        barks: [
          "Next.",
          "That's going to scar. Good. Scars are character.",
          "Medium animals, all of you.",
        ],
      });
      PF.npc({
        id: "pch_wh_static",
        type: "human",
        name: "DJ Cinders",
        outfit: "dj",
        gender: "m",
        burn: "L",
        faction: "settlers",
        level: 5,
        pos: pos(A.dj),
        yaw: A.dj.yaw,
        ai: "guard",
        home: { x: A.dj.x, z: A.dj.z, r: 1.2 },
        dialogue: "pch_dlg_static",
        essential: true,
        weapon: "none",
        seed: 9106,
        voice: "settler",
        merchant: {
          scrip: 250,
          stock: [
            ["scrap_electronics", 3],
            ["vacuum_tube", 3],
            ["dry_cell", 1],
            ["duct_tape", 2],
            ["ammo_10mm", 30],
            ["ammo_32", 40],
          ],
          restock: 3,
        },
        barks: [
          "This is DJ Cinders, comin' at ya from the basement of history!",
          "Records don't care what your face looks like.",
          "Somebody fix that generator before I fix it with a hammer.",
        ],
      });
      if (E.guard)
        PF.npc({
          id: "pch_wh_tony",
          type: "human",
          name: "Big Tony",
          outfit: "leather_armor",
          gender: "m",
          faction: "settlers",
          level: 8,
          pos: pos(E.guard),
          yaw: E.guard.yaw || 0,
          ai: "guard",
          home: { x: E.guard.x, z: E.guard.z, r: 1.5 },
          dialogue: "pch_dlg_tony",
          essential: true,
          weapon: "combat_shotgun",
          seed: 9107,
          voice: "guard",
          barks: [
            "Holster it on the dance floor.",
            "Five scrip Saturdays.",
            "Webster Hall. Behave.",
          ],
        });
      if (E.guard2)
        PF.npc({
          id: "pch_wh_guard2",
          type: "human",
          name: "Webster Hall Bouncer",
          outfit: "settler",
          gender: "f",
          faction: "settlers",
          level: 6,
          pos: pos(E.guard2),
          yaw: E.guard2.yaw || 0,
          ai: "guard",
          home: { x: E.guard2.x, z: E.guard2.z, r: 2.5 },
          weapon: "hunting_rifle",
          seed: 9108,
          barks: [
            "Nice night for it.",
            "Keep moving.",
            "Ants again? I swear...",
          ],
        });
      const patrons = [
        ["pch_wh_p1", "Dancing Settler", A.patron1, "f", "settler"],
        ["pch_wh_p2", "Swing Dancer", A.patron2, "m", "survivor"],
        ["pch_wh_p3", "Barfly", A.patron3, "m", "settler"],
        ["pch_wh_p4", "Balcony Regular", A.patron4, "f", "survivor_layers"],
      ];
      patrons.forEach(([id, nm, a, g, o], i) =>
        PF.npc({
          id,
          type: "human",
          name: nm,
          outfit: o,
          gender: g,
          faction: "settlers",
          level: 2 + i,
          pos: pos(a),
          yaw: a.yaw,
          ai: "guard",
          home: { x: a.x, z: a.z, r: 1.4 },
          weapon: "none",
          seed: 9120 + i,
          barks: [
            [
              "Isn't this band the best?",
              "Step, step, rock-step!",
              "Mind my feet, sugar.",
            ],
            [
              "Lindy hop is the only cardio I need.",
              "Twenty-two years and swing still swings.",
              "You gonna dance or just stand there?",
            ],
            [
              "Gina, one more.",
              "Don't tell my wife I'm here. She's dead, but still.",
              "Heard the ants got into the bakery again.",
            ],
            [
              "Best seat in the house.",
              "I've been coming here since '48.",
              "Look at them dance. Makes you forget.",
            ],
          ][i],
        }),
      );
      PF.npc({
        id: "pch_lulu_hall",
        type: "human",
        name: "Lulu Monroe",
        outfit: "settler",
        gender: "f",
        faction: "settlers",
        level: 3,
        pos: pos(A.lulu),
        yaw: A.lulu.yaw,
        ai: "guard",
        home: { x: A.lulu.x, z: A.lulu.z, r: 0.8 },
        dialogue: "pch_dlg_lulu",
        essential: true,
        weapon: "none",
        seed: 7301,
        when: () => !!PF.flag("lulu_freed"),
        barks: [
          '[She sings: "...moonlight over the Hudson, and you not there to see..."]',
          "Thank you, thank you, you're too kind, you're irradiated.",
          "This next one's for my rescuer.",
        ],
      });
    },
    80,
  );
})();
