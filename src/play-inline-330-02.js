// play-inline-330 02 — base
// Lines 17-245 of readable/play-inline-330.pretty.js (statement-aligned).
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
