// play-inline-577 01 — impound
// Lines 20-95 of readable/play-inline-577.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const QX = G.qx;
  const K = () => QX.kit;

  const SPOT = {
    iggyCart: { x: 225, z: -183.2 },
    mortCart: { x: 255, z: -183.2 },
    scoop: { x: 34, z: -249 },
    busStop: { x: 191.5, z: -150 },
    busWreck: { x: 199, z: 12 },
    muni: { x: 127, z: 14 },
    impound: { x: 128.4, z: 23 },
    edna: { x: 112, z: 100 },
    buttons: { x: 115, z: 298 },
    stage: { x: -62, z: -319 },
    pages: [
      { x: -2, z: -321 },
      { x: -88, z: -244 },
      { x: 60, z: -203 },
    ],
  };
  const GC_PENN = { x: 246, z: -200 }; // Pennington's new spot inside Grand Central (lobby)
  // Shared ids owned by other modules (rpg / characters / combat).
  const BURROW_RAT_MEAT = "burrow_rat_meat",
    ROACH_MEAT = "roach_meat",
    OX_MEAT = "ox_meat",
    BURROW_RAT_TYPE = "burrow_rat";
  const BAGEL = "old_world_bagel",
    CHOWDER = "shellback_chowder",
    FIZZO = "fizzo_cola",
    MED_JET = "rally_tonic",
    OLD_DOLLARS = "old_dollars";
  const PATROLMAN_TYPE = "patrolman",
    PATROLMAN_VOICE = "patrolman",
    TOWN_FACTION = "settlers",
    KILL_STANDING = "standing";
  const SK_TRADE = "trade",
    ANIMAL_TALENT = "beast_whisperer";
  /** The city impound locker on 5th Avenue: a key lock (REBRAND §5). */
  const IMPOUND = {
    id: "qx_impound_locker",
    kind: "container",
    label: "City Impound Locker",
    key: "qx_impound_key",
    hint: "MUNI-7 keeps the impound key in its evidence tray.",
    keyFrom:
      "MUNI-7 (No Standing Anytime: reprogrammed, or from its evidence tray)",
  };

  const FOODS = [
    "coney_dog",
    "bodega_pretzel",
    BAGEL,
    "golden_plain_jerky",
    "chocolate_zeppelin",
    "freedom_flakes",
    "pigeon_on_a_stick",
    BURROW_RAT_MEAT,
    ROACH_MEAT,
    "mama_marinara_meatballs",
    "franks_and_beans",
    "frank_in_a_bun",
    "saratoga_chips",
    "astronaut_ice_cream",
    "tunnel_rat_skewer",
    OX_MEAT,
    "gnarlberry",
    "cinnamon_bun",
    "qx_edna_cookies",
  ];
  const firstFood = () => FOODS.find((id) => QX.has(id)) || null;

  // ==================================================================
  // QUEST DEFINITIONS
  // ==================================================================
