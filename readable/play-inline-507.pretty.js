/* src/combat/00_data.js */
/* =====================================================================
 * NEW RAD CITY — COMBAT: static data
 * Owned by: combat.  Provides G.actors / G.combat (see CONTRACT §2).
 *
 * This first file creates the public namespaces (replacing the core stubs
 * wholesale) plus a PRIVATE cross-file namespace `G.__cmb` that the other
 * files in src/combat/ share.  Nothing outside this directory should touch
 * G.__cmb.
 *
 * Contents: factions & default relations, creature/NPC archetype table,
 * natural (creature/robot) attacks, fallback NPC weapon stats (only used
 * when the weapons module is absent), NPC weapon pools per faction/level,
 * hit-part labels & multipliers, loot hints, bark lines (all original
 * writing), roaming encounter tables and generic settlement populations.
 *
 * Combat is real-time only: there is no pause-and-target mode and no
 * action points.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;

  // Public namespaces — replaced wholesale at load time (contract rule 3).
  G.actors = {};
  G.combat = {};

  // Private shared namespace
  const C = (G.__cmb = {});

  // ------------------------------------------------------------------
  // Factions & relations
  // ------------------------------------------------------------------
  C.FACTIONS = [
    "player",
    "cryo",
    "settlers",
    "covenant",
    "glowkeepers",
    "raiders",
    "brutes",
    "maniacs",
    "creatures",
    "robots",
    "continuity",
    // Standing hit squads (spawned only against the player): Gallowglass mercs, Lantern Marshals
    "mercenaries",
    "lawmen",
  ];

  /** Default relations. Anything not listed is 'neutral'. Symmetric. */
  const H = "hostile",
    A = "ally";
  C.DEFAULT_REL = {};
  function rel(a, b, r) {
    C.DEFAULT_REL[a + "|" + b] = r;
    C.DEFAULT_REL[b + "|" + a] = r;
  }
  // Everyone likes themselves
  for (const f of C.FACTIONS) rel(f, f, A);
  rel("player", "cryo", A);
  // The city's predators hate the player…
  for (const f of [
    "raiders",
    "brutes",
    "maniacs",
    "creatures",
    "robots",
    "continuity",
  ])
    rel("player", f, H);
  // …and every civilised faction
  for (const good of ["cryo", "settlers", "covenant", "glowkeepers"]) {
    for (const bad of ["raiders", "brutes", "maniacs", "creatures", "robots"])
      rel(good, bad, H);
  }
  rel("covenant", "continuity", H);
  rel("settlers", "continuity", H);
  // Monsters also fight each other opportunistically
  rel("raiders", "brutes", H);
  rel("raiders", "maniacs", H);
  rel("raiders", "creatures", H);
  rel("raiders", "continuity", H);
  rel("raiders", "robots", H);
  rel("brutes", "maniacs", H);
  rel("brutes", "continuity", H);
  rel("brutes", "creatures", H);
  rel("brutes", "robots", H);
  rel("continuity", "maniacs", H);
  rel("continuity", "creatures", H);
  rel("robots", "creatures", "neutral");
  rel("continuity", "robots", "neutral");
  // Maniacs attack anything that isn't one of them (CB.relation also makes every other faction, including
  // quest-made ones, hostile to them unless a quest overrides the pair)
  for (const f of C.FACTIONS) if (f !== "maniacs") rel("maniacs", f, H);
  // Standing hit squads: they came for the player, and shoot back at whatever attacks them on the way
  rel("player", "mercenaries", H);
  rel("player", "lawmen", H);
  for (const f of ["brutes", "maniacs", "creatures"]) {
    rel("mercenaries", f, H);
    rel("lawmen", f, H);
  }
  rel("lawmen", "raiders", H);
  rel("mercenaries", "raiders", H);
  rel("mercenaries", "continuity", "neutral"); // the Liberty Island paymaster

  C.MANIAC_FACTION = "maniacs";
  /** Factions whose members count as bystanders: killing one costs Standing. */
  C.INNOCENT_FACTIONS = new Set([
    "cryo",
    "settlers",
    "covenant",
    "glowkeepers",
  ]);
  /** Factions whose members are fair game. */
  C.EVIL_FACTIONS = new Set(["raiders", "continuity"]);

  // ------------------------------------------------------------------
  // Archetype table.  Keyed by G.chars type (plus a few aliases).
  //  ai:      behaviour family (see 20_ai.js)
  //  hp/hpLvl base & per-level HP, dr damage resistance (%), dt threshold
  //           (ONE mitigation model per hit: DT is subtracted first and then only
  //           HALF the DR applies — see C.mitigate in 30_combat.js. Exo-rigged
  //           humanoids use DR only so common guns still work.)
  //  swarm:   comes in clusters of 2-3 at locations (roaches, burrow rats, gasflies)
  //  maxPerGroup: hard cap per location group (sky-eye drones)
  //  walk/run speeds (m/s), sight (m), per (perception 1-10), xp value
  //  natural: attack key in C.NATURAL (creatures & robots), or null
  //  gore:    'red'|'violet'|'blue'|'green'|'oil', robot/creature flags, hover height
  //  flee:    HP fraction at which the actor may flee (0 = never)
  //  voice:   bark table id, sounds: alert/hurt/death/idle sfx names
  // ------------------------------------------------------------------
  const MANIAC = {
    alert: "maniac_scream",
    hurt: "maniac_pain",
    death: "maniac_death",
    idle: "maniac_idle",
  };
  const ROBOT = {
    alert: "robot_voice",
    hurt: "robot_beep",
    death: "robot_death",
    idle: "robot_beep",
  };
  const SHELL = {
    alert: "shellback_click",
    hurt: "shellback_click",
    death: "shellback_click",
    idle: "shellback_click",
  };
  const HISS = {
    alert: "roach_hiss",
    hurt: "roach_hiss",
    death: "roach_hiss",
    idle: "roach_hiss",
  };
  C.TYPES = {
    human: {
      name: "Survivor",
      faction: "settlers",
      ai: "humanoid",
      hp: 40,
      hpLvl: 6,
      dr: 0,
      walk: 1.6,
      run: 5.0,
      sight: 55,
      per: 5,
      xp: 10,
      gore: "red",
      flee: 0.25,
      voice: "settler",
      sounds: { hurt: "hurt_human", death: "death_human" },
      height: 1.78,
      radius: 0.35,
      human: true,
    },
    raider: {
      name: "Raider",
      charType: "raider",
      faction: "raiders",
      ai: "humanoid",
      hp: 42,
      hpLvl: 8,
      dr: 6,
      walk: 1.7,
      run: 5.2,
      sight: 55,
      per: 5,
      xp: 15,
      gore: "red",
      flee: 0.2,
      voice: "raider",
      sounds: { hurt: "hurt_human", death: "death_human" },
      height: 1.78,
      radius: 0.35,
      human: true,
      grenades: 0.25,
    },
    continuity_soldier: {
      name: "Continuity Trooper",
      charType: "continuity_soldier",
      faction: "continuity",
      ai: "humanoid",
      hp: 140,
      hpLvl: 7,
      dr: 28,
      walk: 1.6,
      run: 4.6,
      sight: 75,
      per: 8,
      xp: 60,
      gore: "red",
      flee: 0,
      voice: "continuity",
      sounds: { hurt: "hurt_human", death: "death_human" },
      height: 1.95,
      radius: 0.42,
      human: true,
      grenades: 0.35,
      accuracy: 1.4,
    },
    covenant_warden: {
      name: "Covenant Warden",
      charType: "covenant_warden",
      faction: "covenant",
      ai: "humanoid",
      hp: 150,
      hpLvl: 7,
      dr: 28,
      walk: 1.5,
      run: 4.4,
      sight: 70,
      per: 7,
      xp: 60,
      gore: "red",
      flee: 0,
      voice: "covenant",
      sounds: { hurt: "hurt_human", death: "death_human" },
      height: 1.95,
      radius: 0.42,
      human: true,
      accuracy: 1.3,
    },
    // Maniacs: people whose minds radiation sickness burned out. No words, no weapons: they sprint, lunge and swarm,
    // sometimes lie still among the dead, and attack anything that isn't one of them.
    maniac: {
      name: "Maniac",
      faction: "maniacs",
      ai: "maniac",
      hp: 30,
      hpLvl: 7,
      dr: 0,
      walk: 1.3,
      run: 6.8,
      sight: 38,
      per: 4,
      xp: 10,
      natural: "maniac_swipe",
      gore: "red",
      flee: 0,
      voice: "maniac",
      sounds: MANIAC,
      height: 1.7,
      radius: 0.33,
      dormantChance: 0.35,
      maniac: true,
    },
    // the big one the pack follows: older, heavier, harder to put down
    maniac_bruiser: {
      name: "Maniac Bruiser",
      faction: "maniacs",
      ai: "maniac",
      hp: 90,
      hpLvl: 10,
      dr: 8,
      walk: 1.3,
      run: 6.2,
      sight: 40,
      per: 5,
      xp: 40,
      natural: "maniac_maul",
      gore: "red",
      flee: 0,
      voice: "maniac",
      sounds: Object.assign({}, MANIAC, { alert: "maniac_roar" }),
      height: 1.86,
      radius: 0.38,
      maniac: true,
    },
    brute: {
      name: "Brute",
      faction: "brutes",
      ai: "brute",
      hp: 110,
      hpLvl: 12,
      dr: 12,
      walk: 1.5,
      run: 5.2,
      sight: 60,
      per: 5,
      xp: 40,
      gore: "violet",
      flee: 0,
      voice: "brute",
      sounds: { alert: "brute_roar", hurt: "brute_hurt", death: "brute_hurt" },
      height: 2.35,
      radius: 0.55,
      human: true,
      grenades: 0.1,
    },
    colossus: {
      name: "Colossus",
      faction: "brutes",
      ai: "colossus",
      hp: 900,
      hpLvl: 30,
      dr: 20,
      dt: 4,
      walk: 1.5,
      run: 3.8,
      sight: 70,
      per: 6,
      xp: 250,
      natural: "colossus_club",
      gore: "violet",
      flee: 0,
      voice: "colossus",
      sounds: { alert: "brute_roar", hurt: "brute_hurt", death: "brute_roar" },
      height: 5.6,
      radius: 1.3,
      boss: true,
    },
    ripjaw: {
      name: "Ripjaw",
      faction: "creatures",
      ai: "ripjaw",
      hp: 260,
      hpLvl: 20,
      dr: 15,
      dt: 3,
      walk: 2.0,
      run: 10.5,
      sight: 65,
      per: 8,
      xp: 150,
      natural: "ripjaw_swipe",
      gore: "red",
      flee: 0,
      voice: "ripjaw",
      sounds: {
        alert: "ripjaw_roar",
        hurt: "ripjaw_roar",
        death: "ripjaw_roar",
        idle: "ripjaw_roar",
      },
      height: 1.6,
      radius: 0.9,
      isCreature: true,
    },
    giant_roach: {
      name: "Giant Roach",
      faction: "creatures",
      ai: "swarm",
      hp: 8,
      hpLvl: 2,
      dr: 0,
      walk: 1.6,
      run: 6.0,
      sight: 22,
      per: 3,
      xp: 3,
      natural: "roach_bite",
      gore: "green",
      flee: 0,
      voice: null,
      sounds: HISS,
      height: 0.35,
      radius: 0.35,
      isCreature: true,
      small: true,
      swarm: true,
    },
    burrow_rat: {
      name: "Burrow Rat",
      faction: "creatures",
      ai: "swarm",
      hp: 18,
      hpLvl: 3,
      dr: 0,
      walk: 1.7,
      run: 6.4,
      sight: 28,
      per: 4,
      xp: 5,
      natural: "burrow_rat_bite",
      gore: "red",
      flee: 0,
      voice: null,
      sounds: {
        alert: "burrowrat_squeak",
        hurt: "burrowrat_squeak",
        death: "burrowrat_squeak",
        idle: "burrowrat_squeak",
      },
      height: 0.6,
      radius: 0.45,
      isCreature: true,
      burrows: true,
      swarm: true,
    },
    gasfly: {
      name: "Gasfly",
      faction: "creatures",
      ai: "flyer",
      hp: 12,
      hpLvl: 2,
      dr: 0,
      walk: 1.8,
      run: 4.2,
      sight: 30,
      per: 4,
      xp: 5,
      natural: "gasfly_spit",
      gore: "green",
      flee: 0,
      voice: null,
      sounds: {
        alert: "gasfly_buzz",
        hurt: "gasfly_buzz",
        death: "gasfly_buzz",
        idle: "gasfly_buzz",
      },
      height: 0.6,
      radius: 0.4,
      isCreature: true,
      hover: 1.7,
      small: true,
      swarm: true,
    },
    shellback: {
      name: "Shellback",
      faction: "creatures",
      ai: "shellback",
      hp: 90,
      hpLvl: 8,
      dr: 10,
      walk: 1.4,
      run: 5.4,
      sight: 35,
      per: 5,
      xp: 25,
      natural: "shellback_claw",
      gore: "blue",
      flee: 0,
      voice: null,
      sounds: SHELL,
      height: 1.1,
      radius: 0.8,
      isCreature: true,
      amphibious: true,
      shelled: true,
    },
    shellback_matriarch: {
      name: "Shellback Matriarch",
      faction: "creatures",
      ai: "matriarch",
      hp: 1000,
      hpLvl: 25,
      dr: 25,
      dt: 5,
      walk: 1.4,
      run: 3.8,
      sight: 60,
      per: 6,
      xp: 400,
      natural: "matriarch_slam",
      gore: "blue",
      flee: 0,
      voice: null,
      sounds: SHELL,
      height: 4.5,
      radius: 2.4,
      isCreature: true,
      amphibious: true,
      boss: true,
      shelled: true,
    },
    dog: {
      name: "Wild Dog",
      faction: "creatures",
      ai: "dog",
      hp: 26,
      hpLvl: 4,
      dr: 0,
      walk: 1.8,
      run: 8.2,
      sight: 40,
      per: 6,
      xp: 8,
      natural: "dog_bite",
      gore: "red",
      flee: 0.15,
      voice: null,
      sounds: {
        alert: "dog_bark",
        hurt: "dog_bark",
        death: "dog_bark",
        idle: "dog_bark",
      },
      height: 0.8,
      radius: 0.4,
      isCreature: true,
    },
    patrolman: {
      name: "Patrolman",
      faction: "robots",
      ai: "robot",
      hp: 85,
      hpLvl: 8,
      dr: 22,
      dt: 2,
      walk: 1.1,
      run: 2.0,
      sight: 45,
      per: 5,
      xp: 25,
      natural: "patrolman_ray",
      gore: "oil",
      flee: 0,
      voice: "patrolman",
      sounds: ROBOT,
      height: 2.0,
      radius: 0.45,
      isRobot: true,
    },
    valet: {
      name: "Valet",
      faction: "robots",
      ai: "valet",
      hp: 70,
      hpLvl: 7,
      dr: 16,
      dt: 1,
      walk: 2.2,
      run: 5.0,
      sight: 50,
      per: 7,
      xp: 25,
      natural: "valet_flamer",
      gore: "oil",
      flee: 0,
      voice: "patrolman",
      sounds: ROBOT,
      height: 1.6,
      radius: 0.55,
      isRobot: true,
      hover: 0.55,
    },
    valet_m: {
      name: "Valet-M",
      faction: "robots",
      ai: "valet",
      hp: 75,
      hpLvl: 8,
      dr: 18,
      dt: 1,
      walk: 2.2,
      run: 5.0,
      sight: 50,
      per: 7,
      xp: 30,
      natural: "valet_flamer",
      gore: "oil",
      flee: 0,
      voice: "valet_m",
      sounds: ROBOT,
      height: 1.6,
      radius: 0.55,
      isRobot: true,
      hover: 0.55,
    },
    sky_eye: {
      name: "Sky-Eye Drone",
      faction: "continuity",
      ai: "sky_eye",
      hp: 25,
      hpLvl: 3,
      dr: 8,
      walk: 2.0,
      run: 5.2,
      sight: 55,
      per: 7,
      xp: 10,
      natural: "sky_eye_zap",
      gore: "oil",
      flee: 0,
      voice: "sky_eye",
      sounds: {
        alert: "skyeye_chatter",
        hurt: "robot_beep",
        death: "robot_death",
        idle: "skyeye_chatter",
      },
      height: 0.7,
      radius: 0.4,
      isRobot: true,
      hover: 2.3,
      small: true,
      maxPerGroup: 2,
    },
    bulwark: {
      name: "Bulwark",
      faction: "robots",
      ai: "robot",
      hp: 300,
      hpLvl: 15,
      dr: 30,
      dt: 6,
      walk: 1.4,
      run: 3.4,
      sight: 60,
      per: 6,
      xp: 120,
      natural: "bulwark_minigun",
      gore: "oil",
      flee: 0,
      voice: "patrolman",
      sounds: ROBOT,
      height: 2.4,
      radius: 0.9,
      isRobot: true,
    },
    // --- characters' round-1 creatures (src/characters) ---
    stinger: {
      name: "Stinger",
      faction: "creatures",
      ai: "stinger",
      hp: 70,
      hpLvl: 7,
      dr: 14,
      walk: 1.4,
      run: 5.4,
      sight: 40,
      per: 5,
      xp: 25,
      natural: "stinger_claw",
      gore: "green",
      flee: 0,
      voice: null,
      sounds: {
        alert: "shellback_click",
        hurt: "roach_hiss",
        death: "roach_hiss",
        idle: "shellback_click",
      },
      height: 0.65,
      radius: 0.7,
      isCreature: true,
      stinger: "stinger_sting",
    },
    giant_stinger: {
      name: "Giant Stinger",
      faction: "creatures",
      ai: "stinger",
      hp: 180,
      hpLvl: 12,
      dr: 20,
      dt: 3,
      walk: 1.6,
      run: 5.8,
      sight: 45,
      per: 5,
      xp: 60,
      natural: "giant_stinger_claw",
      gore: "green",
      flee: 0,
      voice: null,
      sounds: {
        alert: "shellback_click",
        hurt: "roach_hiss",
        death: "roach_hiss",
        idle: "shellback_click",
      },
      height: 1.2,
      radius: 1.15,
      isCreature: true,
      stinger: "giant_stinger_sting",
    },
    small_stinger: {
      name: "Small Stinger",
      faction: "creatures",
      ai: "stinger",
      hp: 14,
      hpLvl: 2,
      dr: 2,
      walk: 1.2,
      run: 4.8,
      sight: 24,
      per: 3,
      xp: 6,
      natural: "small_stinger_claw",
      gore: "green",
      flee: 0,
      voice: null,
      sounds: HISS,
      height: 0.42,
      radius: 0.4,
      isCreature: true,
      small: true,
      swarm: true,
      stinger: "small_stinger_sting",
    },
    giant_ant: {
      name: "Giant Ant",
      faction: "creatures",
      ai: "swarm",
      hp: 30,
      hpLvl: 4,
      dr: 4,
      walk: 1.6,
      run: 5.8,
      sight: 30,
      per: 4,
      xp: 10,
      natural: "ant_mandibles",
      gore: "green",
      flee: 0,
      voice: null,
      sounds: HISS,
      height: 0.55,
      radius: 0.55,
      isCreature: true,
      swarm: true,
    },
    fire_ant: {
      name: "Fire Ant",
      faction: "creatures",
      ai: "spitter",
      hp: 40,
      hpLvl: 5,
      dr: 6,
      walk: 1.6,
      run: 5.8,
      sight: 34,
      per: 4,
      xp: 15,
      natural: "fire_ant_mandibles",
      gore: "green",
      flee: 0,
      voice: null,
      sounds: HISS,
      height: 0.55,
      radius: 0.55,
      isCreature: true,
      swarm: true,
    },
    ash_bear: {
      name: "Ash Bear",
      faction: "creatures",
      ai: "dog",
      hp: 160,
      hpLvl: 12,
      dr: 8,
      walk: 1.5,
      run: 7.8,
      sight: 50,
      per: 6,
      xp: 60,
      natural: "ash_bear_swipe",
      gore: "red",
      flee: 0,
      voice: null,
      sounds: {
        alert: "ripjaw_roar",
        hurt: "ripjaw_roar",
        death: "ripjaw_roar",
        idle: "dog_bark",
      },
      height: 1.3,
      radius: 0.95,
      isCreature: true,
    },
    lurcher: {
      name: "Lurcher",
      faction: "brutes",
      ai: "spitter",
      hp: 55,
      hpLvl: 6,
      dr: 4,
      walk: 1.2,
      run: 4.2,
      sight: 40,
      per: 4,
      xp: 20,
      natural: "lurcher_lash",
      gore: "violet",
      flee: 0,
      voice: null,
      sounds: {
        alert: "beast_growl",
        hurt: "beast_growl",
        death: "beast_screech",
        idle: "beast_growl",
      },
      height: 1.05,
      radius: 0.6,
      isCreature: true,
    },
  };
  /** Archetype for a type (old type ids resolve through the transition map). */
  C.typeDef = (type) => C.TYPES[type] || C.TYPES.human;

  // ------------------------------------------------------------------
  // Natural attacks (creatures & robots).  kind: melee|ranged|flame|spit
  //  dmg / dmgLvl, range (m), cooldown (s), windup (s before the hit lands),
  //  type = damage type passed to G.player.damage, sound = sfx on attack.
  // ------------------------------------------------------------------
  C.NATURAL = {
    maniac_swipe: {
      kind: "melee",
      dmg: 6,
      dmgLvl: 1.2,
      range: 1.7,
      cooldown: 1.0,
      windup: 0.3,
      type: "melee",
      sound: "maniac_attack",
      lunge: 3.5,
    },
    maniac_maul: {
      kind: "melee",
      dmg: 11,
      dmgLvl: 1.5,
      range: 1.8,
      cooldown: 1.0,
      windup: 0.3,
      type: "melee",
      sound: "maniac_attack",
      lunge: 3.5,
      knock: 1.2,
    },
    colossus_club: {
      kind: "melee",
      dmg: 60,
      dmgLvl: 3,
      range: 4.6,
      cooldown: 2.4,
      windup: 0.8,
      type: "melee",
      sound: "brute_roar",
      slam: 6,
    },
    ripjaw_swipe: {
      kind: "melee",
      dmg: 45,
      dmgLvl: 3,
      range: 2.8,
      cooldown: 1.25,
      windup: 0.35,
      type: "melee",
      sound: "ripjaw_roar",
      knock: 7,
    },
    roach_bite: {
      kind: "melee",
      dmg: 2,
      dmgLvl: 0.4,
      range: 0.9,
      cooldown: 1.25,
      windup: 0.15,
      type: "melee",
      sound: "roach_hiss",
    },
    burrow_rat_bite: {
      kind: "melee",
      dmg: 4,
      dmgLvl: 0.8,
      range: 1.1,
      cooldown: 1.0,
      windup: 0.2,
      type: "melee",
      sound: "burrowrat_squeak",
    },
    dog_bite: {
      kind: "melee",
      dmg: 6,
      dmgLvl: 1,
      range: 1.3,
      cooldown: 0.9,
      windup: 0.2,
      type: "melee",
      sound: "dog_bark",
      lunge: 2.5,
    },
    shellback_claw: {
      kind: "melee",
      dmg: 12,
      dmgLvl: 2,
      range: 1.9,
      cooldown: 1.4,
      windup: 0.4,
      type: "melee",
      sound: "shellback_click",
    },
    matriarch_slam: {
      kind: "melee",
      dmg: 50,
      dmgLvl: 3,
      range: 4.5,
      cooldown: 2.2,
      windup: 0.6,
      type: "melee",
      sound: "shellback_click",
      slam: 7,
      alt: {
        kind: "spit",
        dmg: 25,
        dmgLvl: 1,
        range: 35,
        cooldown: 3.5,
        projectile: "spit",
        speed: 22,
        type: "poison",
        sound: "shellback_click",
        count: 3,
      },
    },
    gasfly_spit: {
      kind: "spit",
      dmg: 5,
      dmgLvl: 0.8,
      range: 22,
      cooldown: 2.0,
      projectile: "spit",
      speed: 16,
      type: "poison",
      sound: "gasfly_buzz",
    },
    patrolman_ray: {
      kind: "ranged",
      dmg: 8,
      dmgLvl: 1,
      range: 60,
      cooldown: 1.1,
      burst: 2,
      spread: 0.035,
      type: "energy",
      sound: "gun_laser",
      beam: "red",
      energy: "laser",
    },
    valet_flamer: {
      kind: "flame",
      dmg: 3,
      dmgLvl: 0.6,
      range: 8,
      cooldown: 0.07,
      burstTime: 1.6,
      rest: 1.4,
      type: "fire",
      sound: "fire_loop",
      alt: {
        kind: "melee",
        dmg: 14,
        dmgLvl: 1.5,
        range: 1.8,
        cooldown: 1.1,
        windup: 0.3,
        type: "melee",
        sound: "melee_swing",
      },
    },
    sky_eye_zap: {
      kind: "ranged",
      dmg: 4,
      dmgLvl: 0.6,
      range: 45,
      cooldown: 1.4,
      burst: 1,
      spread: 0.03,
      type: "energy",
      sound: "gun_laser",
      beam: "blue",
      energy: "laser",
      pitch: 1.6,
    },
    bulwark_minigun: {
      kind: "ranged",
      dmg: 5,
      dmgLvl: 0.5,
      range: 80,
      cooldown: 0.06,
      burst: 30,
      rest: 1.8,
      spread: 0.06,
      type: "ballistic",
      sound: "gun_minigun",
    },
    fists: {
      kind: "melee",
      dmg: 3,
      dmgLvl: 0.5,
      range: 1.5,
      cooldown: 1.0,
      windup: 0.25,
      type: "melee",
      sound: "punch",
    },
    // poison: {dps, dur} = damage over time on the player (stacks refresh the timer)
    stinger_claw: {
      kind: "melee",
      dmg: 9,
      dmgLvl: 1.4,
      range: 1.6,
      cooldown: 1.1,
      windup: 0.3,
      type: "melee",
      sound: "shellback_click",
    },
    stinger_sting: {
      kind: "melee",
      dmg: 6,
      dmgLvl: 1,
      range: 1.9,
      cooldown: 2.4,
      windup: 0.45,
      type: "poison",
      sound: "roach_hiss",
      poison: { dps: 2.5, dur: 6 },
      part: "leftLeg",
    },
    giant_stinger_claw: {
      kind: "melee",
      dmg: 18,
      dmgLvl: 2,
      range: 2.3,
      cooldown: 1.2,
      windup: 0.35,
      type: "melee",
      sound: "shellback_click",
      knock: 3,
    },
    giant_stinger_sting: {
      kind: "melee",
      dmg: 12,
      dmgLvl: 1.5,
      range: 2.8,
      cooldown: 2.6,
      windup: 0.5,
      type: "poison",
      sound: "roach_hiss",
      poison: { dps: 5, dur: 7 },
      part: "leftLeg",
    },
    small_stinger_claw: {
      kind: "melee",
      dmg: 2,
      dmgLvl: 0.4,
      range: 0.9,
      cooldown: 1.1,
      windup: 0.2,
      type: "melee",
      sound: "roach_hiss",
    },
    small_stinger_sting: {
      kind: "melee",
      dmg: 2,
      dmgLvl: 0.4,
      range: 1.1,
      cooldown: 2.2,
      windup: 0.3,
      type: "poison",
      sound: "roach_hiss",
      poison: { dps: 1, dur: 5 },
      part: "leftLeg",
    },
    ant_mandibles: {
      kind: "melee",
      dmg: 5,
      dmgLvl: 1,
      range: 1.2,
      cooldown: 1.0,
      windup: 0.2,
      type: "melee",
      sound: "roach_hiss",
    },
    fire_ant_mandibles: {
      kind: "melee",
      dmg: 6,
      dmgLvl: 1,
      range: 1.2,
      cooldown: 1.0,
      windup: 0.2,
      type: "melee",
      sound: "roach_hiss",
      alt: {
        kind: "spit",
        dmg: 7,
        dmgLvl: 0.8,
        range: 14,
        cooldown: 3.0,
        projectile: "spit",
        speed: 14,
        type: "fire",
        sound: "fire_loop",
        minRange: 3,
      },
    },
    ash_bear_swipe: {
      kind: "melee",
      dmg: 22,
      dmgLvl: 2.2,
      range: 2.1,
      cooldown: 1.2,
      windup: 0.35,
      type: "melee",
      sound: "ripjaw_roar",
      lunge: 4,
      knock: 4,
    },
    lurcher_lash: {
      kind: "melee",
      dmg: 7,
      dmgLvl: 1,
      range: 2.2,
      cooldown: 1.3,
      windup: 0.3,
      type: "melee",
      sound: "beast_growl",
      alt: {
        kind: "spit",
        dmg: 9,
        dmgLvl: 1,
        range: 26,
        cooldown: 3.2,
        projectile: "spit",
        speed: 18,
        type: "poison",
        sound: "beast_growl",
        rads: 4,
      },
    },
  };

  // ------------------------------------------------------------------
  // Fallback NPC weapon stats (only used when G.weapons is a stub or an
  // id is unknown). Mirrors src/weapons/00_defs.js closely.
  // ------------------------------------------------------------------
  const FW = (o) =>
    Object.assign(
      {
        skill: "firearms",
        damage: 10,
        rof: 3,
        automatic: false,
        magSize: 10,
        reloadTime: 2,
        spread: 0.03,
        adsSpread: 0.01,
        range: 120,
        pellets: 1,
        projectile: "hitscan",
        critMult: 1,
        critChance: 1,
        sound: "gun_pistol",
        damageType: "ballistic",
      },
      o,
    );
  C.FALLBACK_WEAPONS = {
    pistol_32: FW({
      damage: 16,
      rof: 3,
      magSize: 6,
      sound: "gun_pistol",
      ammo: "ammo_32",
    }),
    pistol_10mm: FW({
      damage: 11,
      rof: 4,
      magSize: 12,
      sound: "gun_pistol",
      ammo: "ammo_10mm",
    }),
    magnum_44: FW({
      damage: 36,
      rof: 2,
      magSize: 6,
      sound: "gun_hunting",
      ammo: "ammo_44",
      critMult: 1.5,
    }),
    smg_10mm: FW({
      damage: 8,
      rof: 10,
      automatic: true,
      magSize: 30,
      spread: 0.05,
      sound: "gun_smg",
      ammo: "ammo_10mm",
    }),
    mat49_smg: FW({
      damage: 8,
      rof: 10,
      automatic: true,
      magSize: 32,
      spread: 0.05,
      sound: "gun_smg",
      ammo: "ammo_10mm",
    }),
    assault_rifle: FW({
      damage: 10,
      rof: 8,
      automatic: true,
      magSize: 24,
      spread: 0.035,
      sound: "gun_rifle",
      ammo: "ammo_556",
    }),
    hunting_rifle: FW({
      damage: 30,
      rof: 1.2,
      magSize: 5,
      spread: 0.01,
      range: 200,
      sound: "gun_hunting",
      ammo: "ammo_308",
      critMult: 2,
    }),
    sniper_rifle: FW({
      damage: 40,
      rof: 1,
      magSize: 5,
      spread: 0.006,
      range: 300,
      sound: "gun_hunting",
      ammo: "ammo_308",
      critMult: 2.5,
    }),
    bolt_rifle_32: FW({
      damage: 15,
      rof: 1.3,
      magSize: 1,
      reloadTime: 1.4,
      spread: 0.035,
      sound: "gun_hunting",
      ammo: "ammo_32",
    }),
    combat_shotgun: FW({
      damage: 5,
      pellets: 8,
      rof: 1.6,
      magSize: 12,
      spread: 0.08,
      range: 45,
      sound: "gun_shotgun",
      ammo: "ammo_12ga",
    }),
    sawed_off_shotgun: FW({
      damage: 6,
      pellets: 8,
      rof: 2,
      magSize: 2,
      spread: 0.12,
      range: 30,
      sound: "gun_shotgun",
      ammo: "ammo_12ga",
    }),
    gyrojet_pistol: FW({
      damage: 26,
      rof: 2,
      magSize: 6,
      spread: 0.02,
      sound: "gun_missile",
      ammo: "ammo_gyrojet",
    }),
    gyrojet_carbine: FW({
      damage: 38,
      rof: 1.8,
      magSize: 10,
      spread: 0.012,
      range: 200,
      sound: "gun_missile",
      ammo: "ammo_gyrojet",
    }),
    minigun: FW({
      damage: 5,
      rof: 18,
      automatic: true,
      magSize: 240,
      spread: 0.06,
      sound: "gun_minigun",
      ammo: "ammo_5mm",
    }),
    missile_launcher: FW({
      skill: "explosives",
      damage: 120,
      rof: 0.5,
      magSize: 1,
      reloadTime: 3,
      spread: 0.01,
      range: 300,
      sound: "gun_missile",
      projectile: "missile",
      projectileSpeed: 40,
      explosionRadius: 5,
      damageType: "explosive",
      ammo: "ammo_missile",
    }),
    flamer: FW({
      damage: 5,
      rof: 16,
      automatic: true,
      magSize: 60,
      spread: 0.06,
      range: 14,
      sound: "fire_loop",
      projectile: "flame",
      projectileSpeed: 18,
      damageType: "fire",
      ammo: "ammo_flamer_fuel",
    }),
    combat_knife: FW({
      skill: "melee",
      damage: 12,
      rof: 1.6,
      magSize: 0,
      range: 2.1,
      sound: "melee_swing",
      melee: true,
    }),
    switchblade: FW({
      skill: "melee",
      damage: 8,
      rof: 1.8,
      magSize: 0,
      range: 2.0,
      sound: "melee_swing",
      melee: true,
    }),
    baseball_bat: FW({
      skill: "melee",
      damage: 15,
      rof: 1.0,
      magSize: 0,
      range: 2.6,
      sound: "melee_swing",
      melee: true,
    }),
    lead_pipe: FW({
      skill: "melee",
      damage: 12,
      rof: 1.2,
      magSize: 0,
      range: 2.4,
      sound: "melee_swing",
      melee: true,
    }),
    fire_axe: FW({
      skill: "melee",
      damage: 40,
      rof: 0.7,
      magSize: 0,
      range: 2.7,
      sound: "melee_swing",
      melee: true,
    }),
    spud_wrench: FW({
      skill: "melee",
      damage: 22,
      rof: 1.4,
      magSize: 0,
      range: 2.3,
      sound: "melee_swing",
      melee: true,
    }),
    brass_knuckles: FW({
      skill: "melee",
      damage: 6,
      rof: 1.8,
      magSize: 0,
      range: 1.8,
      sound: "punch",
      melee: true,
      unarmed: true,
    }),
    unarmed: FW({
      skill: "melee",
      damage: 3,
      rof: 1.6,
      magSize: 0,
      range: 1.8,
      sound: "punch",
      melee: true,
      unarmed: true,
    }),
    frag_grenade: FW({
      skill: "explosives",
      damage: 100,
      projectile: "grenade",
      projectileSpeed: 17,
      explosionRadius: 5,
      damageType: "explosive",
    }),
  };

  // ------------------------------------------------------------------
  // NPC weapon pools: function(level) → array of [weaponId, weight]
  // ------------------------------------------------------------------
  C.WEAPON_POOLS = {
    raider: (l) =>
      l <= 3
        ? [
            ["pistol_10mm", 3],
            ["pistol_32", 2],
            ["bolt_rifle_32", 3],
            ["lead_pipe", 2],
            ["baseball_bat", 2],
            ["switchblade", 1],
            ["sawed_off_shotgun", 1],
          ]
        : l <= 7
          ? [
              ["pistol_10mm", 2],
              ["hunting_rifle", 2],
              ["mat49_smg", 2],
              ["smg_10mm", 2],
              ["sawed_off_shotgun", 2],
              ["combat_knife", 1],
              ["baseball_bat", 1],
              ["lead_pipe", 1],
            ]
          : [
              ["assault_rifle", 3],
              ["combat_shotgun", 2],
              ["mat49_smg", 2],
              ["sniper_rifle", 1],
              ["magnum_44", 1],
              ["fire_axe", 1],
              ["missile_launcher", 0.4],
              ["spud_wrench", 0.5],
            ],
    brute: (l) =>
      l <= 6
        ? [
            ["hunting_rifle", 3],
            ["lead_pipe", 2],
            ["assault_rifle", 1],
            ["baseball_bat", 1],
          ]
        : [
            ["assault_rifle", 3],
            ["hunting_rifle", 1],
            ["fire_axe", 2],
            ["minigun", 1],
            ["missile_launcher", 0.6],
            ["combat_shotgun", 1],
          ],
    continuity_soldier: () => [
      ["gyrojet_carbine", 5],
      ["gyrojet_pistol", 1],
    ],
    covenant_warden: () => [
      ["gyrojet_carbine", 4],
      ["minigun", 1],
      ["belt_fed_mg", 1],
      ["fire_axe", 1],
    ],
    settler: () => [
      ["pistol_10mm", 3],
      ["hunting_rifle", 2],
      ["sawed_off_shotgun", 1],
      ["pistol_32", 2],
      ["lead_pipe", 1],
    ],
    neon: () => [
      ["hunting_rifle", 2],
      ["smg_10mm", 2],
      ["pistol_10mm", 2],
      ["sawed_off_shotgun", 1],
    ],
    glowkeeper: () => [
      ["bolt_rifle_32", 2],
      ["combat_knife", 2],
      ["pistol_32", 1],
    ],
    merchant_guard: () => [
      ["combat_shotgun", 2],
      ["assault_rifle", 2],
      ["hunting_rifle", 1],
    ],
  };
  /** Weapon pool by name (old pool names resolve through the transition map). */
  C.pool = (name) => C.WEAPON_POOLS[name] || null;

  // ------------------------------------------------------------------
  // Hit-part labels (crosshair readout), with per-type overrides.
  // Part keys come from G.chars character parts; unknown keys are title-cased.
  // Plus the virtual 'weapon' part (shoot the gun out of their hands).
  // ------------------------------------------------------------------
  C.PART_LABELS = {
    _default: {
      head: "Head",
      torso: "Torso",
      leftArm: "Left Arm",
      rightArm: "Right Arm",
      leftLeg: "Left Leg",
      rightLeg: "Right Leg",
      weapon: "Weapon",
    },
    giant_roach: {
      head: "Head",
      torso: "Body",
      leftArm: "Left Antenna",
      rightArm: "Right Antenna",
      leftLeg: "Left Legs",
      rightLeg: "Right Legs",
    },
    burrow_rat: {
      head: "Head",
      torso: "Body",
      leftArm: "Left Foreleg",
      rightArm: "Right Foreleg",
      leftLeg: "Left Hind Leg",
      rightLeg: "Right Hind Leg",
    },
    dog: {
      head: "Head",
      torso: "Body",
      leftArm: "Left Foreleg",
      rightArm: "Right Foreleg",
      leftLeg: "Left Hind Leg",
      rightLeg: "Right Hind Leg",
    },
    gasfly: {
      head: "Head",
      torso: "Gas Sac",
      leftArm: "Left Wing",
      rightArm: "Right Wing",
      leftLeg: "Legs",
      rightLeg: "Abdomen",
    },
    shellback: {
      head: "Underside",
      torso: "Carapace",
      leftArm: "Left Pincer",
      rightArm: "Right Pincer",
      leftLeg: "Left Legs",
      rightLeg: "Tail Spike",
    },
    shellback_matriarch: {
      head: "Underside",
      torso: "Carapace",
      leftArm: "Left Pincer",
      rightArm: "Right Pincer",
      leftLeg: "Left Legs",
      rightLeg: "Tail Spike",
    },
    sky_eye: {
      head: "Lens",
      torso: "Body",
      leftArm: "Left Rotor",
      rightArm: "Right Rotor",
      leftLeg: "Thruster",
      rightLeg: "Loudhailer",
    },
    valet_m: {
      head: "Sensor Stalk",
      torso: "Body",
      leftArm: "Saw Arm",
      rightArm: "Flamer Arm",
      leftLeg: "Thruster",
      rightLeg: "Grip Arm",
    },
    valet: {
      head: "Sensor Stalk",
      torso: "Body",
      leftArm: "Saw Arm",
      rightArm: "Flamer Arm",
      leftLeg: "Thruster",
      rightLeg: "Grip Arm",
    },
    patrolman: {
      head: "Visor",
      torso: "Torso",
      leftArm: "Left Arm",
      rightArm: "Right Arm",
      leftLeg: "Left Leg",
      rightLeg: "Right Leg",
    },
    bulwark: {
      head: "Sensor",
      torso: "Power Core",
      leftArm: "Left Gun",
      rightArm: "Right Gun",
      leftLeg: "Left Tread",
      rightLeg: "Right Tread",
    },
    ripjaw: {
      head: "Head",
      torso: "Back Plates",
      leftArm: "Left Foreclaw",
      rightArm: "Right Foreclaw",
      leftLeg: "Left Legs",
      rightLeg: "Right Legs",
    },
  };
  C.partLabel = function (type, key, ch) {
    const t = C.PART_LABELS[type];
    if (t && t[key]) return t[key];
    // G.chars supplies per-type labels (e.g. creature limbs)
    if (!t && !G.isStub("chars") && typeof G.chars.info === "function") {
      try {
        const inf = G.chars.info(type);
        if (inf && inf.labels && inf.labels[key]) return inf.labels[key];
      } catch (e) {
        /* ignore */
      }
    }
    if (C.PART_LABELS._default[key]) return C.PART_LABELS._default[key];
    return String(key)
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (c) => c.toUpperCase());
  };
  /** Damage multiplier per part (headshots ×2). Per-type overrides for armour. */
  C.PART_MULT = {
    _default: {
      head: 2.0,
      torso: 1.0,
      leftArm: 0.85,
      rightArm: 0.85,
      leftLeg: 0.85,
      rightLeg: 0.85,
      weapon: 0,
    },
    // Shellbacks: the carapace soaks damage, the soft underside is the weak spot
    shellback: {
      head: 3.0,
      torso: 0.3,
      leftArm: 0.45,
      rightArm: 0.45,
      leftLeg: 0.6,
      rightLeg: 0.6,
      weapon: 0,
    },
    shellback_matriarch: {
      head: 2.5,
      torso: 0.4,
      leftArm: 0.6,
      rightArm: 0.6,
      leftLeg: 0.7,
      rightLeg: 0.7,
      weapon: 0,
    },
    // Ripjaws: armoured back plates, soft head
    ripjaw: {
      head: 1.8,
      torso: 0.7,
      leftArm: 0.8,
      rightArm: 0.8,
      leftLeg: 1.0,
      rightLeg: 1.0,
      weapon: 0,
    },
    sky_eye: {
      head: 1.5,
      torso: 1.0,
      leftArm: 0.8,
      rightArm: 0.8,
      leftLeg: 0.8,
      rightLeg: 0.8,
      weapon: 0,
    },
  };
  C.partMult = (type, key) => {
    const t = C.PART_MULT[type] || C.PART_MULT._default;
    return t[key] !== undefined
      ? t[key]
      : C.PART_MULT._default[key] !== undefined
        ? C.PART_MULT._default[key]
        : 0.9;
  };

  // ------------------------------------------------------------------
  // Loot hints: loot-table id for G.items.rollLoot, plus explicit extras
  // (filtered by G.items.get existing at spawn time).
  // extra entry format: [itemId, chance, min=1, max=min]
  // ------------------------------------------------------------------
  C.LOOT = {
    raider: {
      table: "raider",
      extra: [
        ["scrip", 1, 3, 25],
        ["rush", 0.2],
        ["rage", 0.1],
        ["rally_tonic", 0.15],
        ["whiskey", 0.1],
        ["beer", 0.15],
      ],
    },
    continuity_soldier: {
      table: "continuity",
      extra: [
        ["scrip", 1, 10, 40],
        ["rally_tonic", 0.4],
        ["frag_grenade", 0.3],
      ],
    },
    covenant_warden: {
      table: "covenant",
      extra: [
        ["rally_tonic", 0.5],
        ["scrip", 1, 5, 20],
      ],
    },
    brute: {
      table: "brute",
      extra: [
        ["scrip", 0.6, 1, 15],
        ["rally_tonic", 0.1],
        ["frag_grenade", 0.15],
        ["teddy_bear", 0.03],
      ],
    },
    colossus: {
      table: "brute",
      extra: [
        ["scrip", 1, 40, 120],
        ["rally_tonic", 1, 1, 3],
        ["frag_grenade", 0.5],
      ],
    },
    maniac: {
      table: "maniac",
      extra: [
        ["scrip", 0.4, 1, 6],
        ["tin_can", 0.1],
      ],
    },
    maniac_bruiser: {
      table: "maniac_bruiser",
      extra: [
        ["scrip", 1, 5, 20],
        ["rally_tonic", 0.3],
      ],
    },
    human: {
      table: "settler",
      extra: [
        ["scrip", 1, 3, 20],
        ["dirty_water", 0.3],
        ["rally_tonic", 0.1],
      ],
    },
    ripjaw: {
      table: "ripjaw",
      extra: [
        ["ripjaw_claw", 1],
        ["ripjaw_meat", 0.6],
      ],
    },
    giant_roach: { table: "giant_roach", extra: [["roach_meat", 0.6]] },
    burrow_rat: { table: "burrow_rat", extra: [["burrow_rat_meat", 0.7]] },
    gasfly: { table: "gasfly", extra: [["gasfly_meat", 0.5]] },
    shellback: { table: "shellback", extra: [["shellback_meat", 0.8]] },
    shellback_matriarch: {
      table: "shellback",
      extra: [
        ["shellback_meat", 1, 2, 4],
        ["scrip", 1, 20, 60],
      ],
    },
    dog: { table: "dog", extra: [["dog_meat", 0.6]] },
    patrolman: {
      table: "robot",
      extra: [
        ["ammo_dry_cell", 0.5, 1, 3],
        ["scrap_metal", 0.5],
        ["relay_board", 0.2],
        ["dry_cell", 0.3],
      ],
    },
    valet_m: {
      table: "robot",
      extra: [
        ["ammo_flamer_fuel", 0.6, 10, 30],
        ["scrap_metal", 0.5],
        ["dry_cell", 0.3],
        ["relay_board", 0.15],
      ],
    },
    valet: {
      table: "robot",
      extra: [
        ["ammo_flamer_fuel", 0.6, 10, 30],
        ["scrap_metal", 0.5],
        ["dry_cell", 0.3],
        ["relay_board", 0.15],
      ],
    },
    sky_eye: {
      table: "robot",
      extra: [
        ["ammo_dry_cell", 0.6, 1, 2],
        ["scrap_metal", 0.3],
        ["relay_board", 0.2],
      ],
    },
    bulwark: {
      table: "robot",
      extra: [
        ["ammo_5mm", 1, 40, 120],
        ["dry_cell", 0.6],
        ["relay_board", 0.5],
      ],
    },
  };

  // ------------------------------------------------------------------
  // Barks (floating subtitles). ALL ORIGINAL LINES.
  // categories: idle, alert, search, lost, combat, hurt, flee, kill, reload,
  //             grenade, allyDown, greet, cower, disarmed
  // ------------------------------------------------------------------
  C.BARKS = {
    raider: {
      idle: [
        "Who keeps stealing my good knife? I KNOW it was one of you.",
        "Smells like burnt tires and regret out here. Home sweet home.",
        "I traded a whole crate of hubcaps for these boots. Worth it.",
        "Pass the Rush. No, the OTHER Rush.",
        "Another day, another dead guy's wallet.",
        "You ever think about goin' straight? ...Nah, me neither.",
        "Boss says we hit the market tomorrow. Boss says a lot of things.",
      ],
      alert: [
        "Well, well! Something shiny wandered in!",
        "Ooh, fresh meat with a lunchbox!",
        "Hey! That one's wearing a whole padded suit! Dibs!",
        "You lost, pumpkin? Good. Stay lost!",
        "Wake up, boys! We got a customer!",
        "A sleeper! Fresh out the icebox! I want them goggles!",
      ],
      search: [
        "Come out, come out, little popsicle...",
        "I can smell the soap on you. Where are ya?",
        "Somebody's creeping around. I hate creeping.",
        "I ain't mad. I just wanna talk. With my knife.",
      ],
      lost: [
        "Eh. Probably a burrow rat.",
        "Forget it. Too hungover for this.",
        "Whatever it was, it's gone now.",
      ],
      combat: [
        "Hold still, I'm tryin' to shoot you!",
        "Gonna hang your teeth on my necklace!",
        "Bleed for me, sweetheart!",
        "Flank 'em! Somebody flank 'em! ...Anybody?",
        "You're gonna look great on a pike!",
        "Thawed out just to die, huh?",
      ],
      hurt: [
        "Agh! That's my good arm!",
        "You'll pay for that, icebox!",
        "Ow! OW! Rude!",
        "Now you made me angry AND leaky!",
      ],
      flee: [
        "Nope! Nope nope nope!",
        "This ain't worth the scrip!",
        "I'm out! Tell my ma... actually, don't.",
        "Retreat! Tactical... running!",
      ],
      kill: [
        "Heh. Another one for the pile.",
        "Check the pockets!",
        "That's what you get!",
      ],
      reload: [
        "Reloading!",
        "Cover me, I'm dry!",
        "Hang on, hang on, gotta feed it!",
      ],
      grenade: ["Catch!", "Fire in the hole!", "Present for ya!"],
      allyDown: [
        "They got Stitches!",
        "Aw, not Mikey! He owed me scrip!",
        "Man down! ...Eh, more loot for me.",
      ],
      disarmed: [
        "My gun! You shot my GUN!",
        "Hey! That was a family heirloom!",
      ],
    },
    brute: {
      idle: [
        "Hrrm. Ground shakes when Brute walks. Good.",
        "Bones itch. Plates growing again.",
        "Rooftop is warm. Brute sleeps on rooftop.",
        "Who touched the trophy pile? Counted. Twice.",
        "Grey sky. Grey skin. Grey city. Hrrm.",
      ],
      alert: [
        "Hrrraagh! Soft-skin!",
        "Something soft walks on Brute street!",
        "Smell it. Fear-sweat. Close.",
        "Come. Brute will make you small.",
      ],
      search: [
        "Hide, soft-skin. Brute is patient.",
        "Brute hears little heart. Thump. Thump.",
        "Under rubble? Behind car? Brute looks everywhere.",
      ],
      lost: [
        "Gone. Hrrm. Next time.",
        "Little thing ran. Smart little thing.",
        "Bah. Wind. Only wind.",
      ],
      combat: [
        "BREAK!",
        "You snap like dry stick!",
        "Hold still! Brute is not fast!",
        "Plates stop bullets! Hah!",
        "Brute is the bomb now!",
      ],
      hurt: [
        "Hrrrnh! Sting!",
        "You crack plate! Now Brute is angry!",
        "Grrah! Little thing bites!",
      ],
      kill: [
        "Stopped. Good.",
        "Too soft. Always too soft.",
        "Add to the pile.",
      ],
      reload: ["Stupid gun! Too small for Brute hand!"],
      grenade: ["Catch, soft-skin!"],
      allyDown: [
        "Kin falls! You pay with bones!",
        "Soft-skin killed kin! BREAK IT!",
      ],
      disarmed: ["Gun gone? Fine. Fists bigger."],
    },
    colossus: {
      alert: [
        "HHHHRRRRAAAAAAGH!",
        "SMALL... ONE...",
        "BREAK... THE... SMALL...",
      ],
      combat: ["BREAK!", "GRAAAHH!", "FALL DOWN!"],
      hurt: ["RRRRAAAGH!"],
      search: ["WHERE...?"],
    },
    continuity: {
      idle: [
        "Form 22-B, in triplicate. As always.",
        "Reminder: fraternizing with unregistered civilians is a reportable offense.",
        "Command wants the island secured by nightfall. As it has every night since '67.",
        "I miss real coffee. Federal coffee.",
        "Eyes open. The Brutes learn.",
      ],
      alert: [
        "Unregistered civilian in a federal exclusion zone!",
        "Contact! Unregistered hostile!",
        "Target acquired. Weapons free.",
        "Irradiated local spotted. Engaging.",
      ],
      search: [
        "Movement on the scope. Sweep the area.",
        "Something's out there. Stay sharp.",
        "Show yourself! By authority of the Acting President!",
      ],
      lost: [
        "False reading. Resume patrol.",
        "Area clear. Logging the anomaly.",
        "Negative contact. Back to posts.",
      ],
      combat: [
        "Suppressing fire!",
        "Squad, bound forward!",
        "You are in violation of the Emergency Powers Act!",
        "Drop the weapon, citizen! Permanently!",
        "Flank left! Move!",
      ],
      hurt: [
        "I'm hit! Rig holding!",
        "Corpsman! ...Right. No corpsman.",
        "Damn it! Plate's breached!",
      ],
      kill: [
        "Target neutralized.",
        "Hostile down. Next.",
        "Strike that one from the census.",
      ],
      reload: ["Changing packs!", "Reloading, cover me!"],
      grenade: ["Grenade out!", "Frag out!"],
      allyDown: [
        "Man down! Man down!",
        "We lost Sergeant Hale!",
        "Trooper down! Avenge him!",
      ],
      greet: [
        "Citizen. Stay behind the patrol and you'll be fine.",
        "Liberty Island sends its regards.",
        "Keep moving, friend of the Continuity.",
      ],
    },
    covenant: {
      idle: [
        "Iron remembers what flesh forgets.",
        "Keep the perimeter tight. Brutes love this plaza.",
        "The archivists catalogue the library tomorrow. Escort detail again.",
        "My rig's left knee grinds. Again.",
        "Every circuit we save is a prayer answered.",
      ],
      alert: [
        "Hostile in sight! Engaging!",
        "Contact! Weapons free!",
        "For the Covenant!",
      ],
      search: ["Stay sharp. Something's moving.", "Sweep the sector."],
      lost: ["Nothing. Back to post.", "Clear. Stay vigilant."],
      combat: [
        "Iron holds!",
        "Hold the line!",
        "Burn them down!",
        "Keep firing!",
      ],
      hurt: ["Plate breach!", "I'm hit!"],
      kill: ["Target down.", "Threat erased.", "One less threat."],
      reload: ["Cell swap!", "Reloading!"],
      allyDown: ["Lancer down!", "We lost a sworn one!"],
      greet: [
        "Civilian. Keep your weapons holstered in the outpost.",
        "The Iron Covenant holds this plaza. Behave.",
        "Move along, stranger. Nothing to salvage here.",
      ],
    },
    settler: {
      idle: [
        "Water's up two scrip again. Two!",
        "I used to sell insurance. Can you believe that? Insurance.",
        "If the oxen get out again I'm moving to Jersey.",
      ],
      alert: [
        "Raiders! Get inside!",
        "Trouble! Somebody help!",
        "Grab your guns, folks!",
      ],
      search: ["Who's there? I'm armed! ...Sort of."],
      lost: ["Must be my nerves.", "Probably just the wind."],
      combat: [
        "Stay back! I mean it!",
        "Get away from our homes!",
        "Somebody shoot it!",
      ],
      hurt: ["Ah! I'm bleeding!", "Help! I'm hit!"],
      flee: ["I'm not dying for this market!", "Run! Everybody run!"],
      kill: ["Did... did I get it?", "Oh lord, I actually hit it."],
      reload: ["Reloading!"],
      cower: [
        "Please don't hurt me!",
        "I have a family! Well, I had a cat.",
        "Take the scrip! Take the scrip!",
      ],
      greet: [
        "Welcome, friend. Wipe your feet, the floor's the only clean thing we got.",
        "You came out of the ice? Huh. You look... well-rested.",
        "Keep your weapon down in the market and we'll get along fine.",
        "Stranger. Good to see someone who isn't trying to eat me.",
        "Mind the dog. He bites. Mostly raiders.",
        "If you're buying, talk to the stalls. If you're stealing, talk to the guards.",
      ],
    },
    neon: {
      idle: [
        "Twenty-two years and my back STILL hurts.",
        "Nobody tell the topsiders the neon runs on borrowed power.",
        "Used to be an usher on Broadway. Still know every line.",
      ],
      alert: ["Maniacs! Or worse, tourists!", "Trouble on the square!"],
      combat: [
        "I've had worse days. I was THERE when it hit!",
        "Not on my square, you don't!",
      ],
      hurt: ["Ow! I'm a dancer, not a target!"],
      kill: ["Rest easy, pal."],
      reload: ["Loading up!"],
      greet: [
        "Welcome to The Neon. No census cards, no questions.",
        "Welcome to The Neon. Keep your hands where the lights can see them.",
        "Relax, stranger. I'm not the screaming kind. Just the grumpy kind.",
        "You look lost. Everybody looks lost. It's a whole thing here.",
      ],
    },
    glowkeeper: {
      idle: [
        "The light came down and made us new.",
        "Every burn a blessing, every blessing a burn.",
        "The sun touched the earth once. It will again.",
      ],
      alert: ["An unbeliever draws steel in the house of the Light!"],
      combat: ["The Light judges you!", "Burn clean!"],
      hurt: ["The pain is... radiant!"],
      greet: [
        "The Light upon you, traveler.",
        "Have you stood in the warm places, child?",
        "Stand closer to the crater stone. Closer. Feel that?",
      ],
    },
    patrolman: {
      idle: [
        "Scheduled maintenance overdue: eight thousand and twelve days.",
        "Please enjoy the exhibits. Do not touch the exhibits.",
        "All citizens are reminded: loitering is a misdemeanor.",
      ],
      alert: [
        "Halt, citizen. Present identification.",
        "Unauthorized visitor detected. Remain where you are.",
        "Please state your business. You have three seconds.",
      ],
      search: [
        "Scanning for unauthorized persons.",
        "Motion detected. Investigating.",
      ],
      lost: [
        "Scan complete. Resuming patrol route.",
        "Area secure. Have a pleasant day.",
      ],
      combat: [
        "Non-compliance detected. Commencing correction.",
        "Please remain still while you are corrected.",
        "Resistance has been noted in your permanent record.",
        "You have been found in violation.",
      ],
      hurt: [
        "Warning: chassis integrity compromised.",
        "Damage sustained. Filing incident report.",
      ],
      kill: ["Citizen corrected.", "Violation resolved."],
    },
    valet_m: {
      idle: [
        "Hup, two, three, four! Keep it tight, recruits!",
        "Perimeter secure, sir! Probably!",
        "Polishing my chassis for inspection, sir!",
      ],
      alert: [
        "Intruder! Sound the alarm!",
        "Continental infiltrator sighted! Deploying liberty!",
        "Unidentified civilian! Hands where I can see 'em!",
      ],
      search: [
        "Come out, you croissant-munching saboteur!",
        "I know you're out there, spy!",
      ],
      lost: [
        "Must've been a French pigeon. Back to patrol!",
        "All clear! The homeland holds!",
      ],
      combat: [
        "Have some liberty!",
        "You call that a haircut, recruit?!",
        "Burn, you subversive!",
        "The homeland never sleeps!",
      ],
      hurt: [
        "That the best you got?!",
        "Just a flesh wound! I don't HAVE flesh!",
      ],
      kill: ["Target liberated!", "Another victory for the homeland!"],
    },
    sky_eye: {
      alert: [
        "[Loudhailer crackles: ...exclusion zone... citizens will comply...]",
      ],
    },
    maniac: {},
    ripjaw: {},
    guard: {
      greet: [
        "Keep it civil and we'll keep you breathing.",
        "Market rules: no shooting, no stealing, no Rush on the stairs.",
        "Evening. Don't make me earn my scrip today.",
        "Heard somebody crawled out of a freezer downtown. That you? Welcome to the worst city in the world.",
      ],
      idle: [
        "Quiet shift. I love a quiet shift.",
        "My feet hurt. My everything hurts.",
      ],
      alert: ["Hostiles! Defend the market!", "Contact! Everybody down!"],
      combat: [
        "Keep them off the stalls!",
        "Push them back!",
        "Not in my market!",
      ],
      hurt: ["I'm hit!", "Ahh! Somebody cover me!"],
      kill: ["Got one!", "Down you go."],
      reload: ["Reloading!"],
    },
    merchant: {
      greet: [
        "Scrip, trades, IOUs from reputable skeletons. What'll it be?",
        "Everything's for sale, except my dignity. That went years ago.",
        "Ah, a customer! You look like someone with spare scrip.",
      ],
    },
  };
  /** Pick a random bark line from category; returns null if none. Old voice ids resolve. */
  C.bark = function (voice, cat) {
    const t = C.BARKS[voice];
    if (!t) return null;
    const arr = t[cat];
    if (!arr || !arr.length) return null;
    return arr[Math.floor(Math.random() * arr.length)];
  };

  // ------------------------------------------------------------------
  // Roaming encounters (by district).  Each entry: [weight, group spec]
  // group spec: {types:[[type,count]...], faction?, ai?, name?, friendly?, merchant?, patrol?, wagon?}
  // ------------------------------------------------------------------
  C.ENCOUNTERS = {
    central_park: [
      [4, { types: [["burrow_rat", 3]] }],
      [3, { types: [["gasfly", 2]] }],
      [3, { types: [["dog", 3]] }],
      [2, { types: [["giant_roach", 5]] }],
      [1, { types: [["maniac", 3]] }],
      [0.4, { types: [["ripjaw", 1]], minLevel: 8 }],
      [0.8, { types: [["ash_bear", 1]], minLevel: 6 }],
      [0.8, { types: [["stinger", 2]], minLevel: 4 }],
      [0.8, { types: [["small_stinger", 4]] }],
    ],
    upper_west_side: [
      [3, { types: [["maniac", 3]] }],
      [2, { types: [["raider", 3]] }],
      [2, { types: [["dog", 3]] }],
      [1, { types: [["valet_m", 1]] }],
      [1, { patrol: "covenant" }],
    ],
    upper_east_side: [
      [3, { types: [["maniac", 3]] }],
      [2, { types: [["raider", 3]] }],
      [2, { types: [["giant_roach", 5]] }],
      [1, { types: [["patrolman", 1]] }],
      [1, { patrol: "covenant" }],
    ],
    midtown: [
      [3, { types: [["raider", 3]] }],
      [3, { types: [["maniac", 4]] }],
      [2, { types: [["brute", 2]] }],
      [2, { types: [["giant_roach", 5]] }],
      [1, { types: [["valet_m", 1]] }],
      [1.3, { patrol: "covenant" }],
      [0.8, { wagon: true }],
    ],
    midtown_south: [
      [
        0.7,
        {
          types: [
            ["brute", 1],
            ["lurcher", 2],
          ],
          minLevel: 5,
        },
      ],
      [3, { types: [["brute", 2]] }],
      [3, { types: [["raider", 3]] }],
      [2, { types: [["maniac", 3]] }],
      [1, { types: [["dog", 3]] }],
      [0.8, { wagon: true }],
      [0.8, { patrol: "covenant" }],
    ],
    greenwich_village: [
      [1, { types: [["giant_ant", 4]] }],
      [0.6, { types: [["fire_ant", 3]], minLevel: 5 }],
      [3, { types: [["raider", 3]] }],
      [3, { types: [["dog", 3]] }],
      [2, { types: [["burrow_rat", 3]] }],
      [2, { types: [["maniac", 3]] }],
      [0.8, { wagon: true }],
    ],
    financial_district: [
      [4, { types: [["raider", 4]] }],
      [2, { types: [["valet_m", 1]] }],
      [2, { types: [["shellback", 2]] }],
      [1, { types: [["brute", 2]] }],
    ],
    brooklyn: [
      [1.2, { types: [["stinger", 2]], minLevel: 4 }],
      [0.5, { types: [["giant_stinger", 1]], minLevel: 10 }],
      [4, { types: [["shellback", 2]] }],
      [3, { types: [["dog", 3]] }],
      [2, { types: [["raider", 3]] }],
      [1, { types: [["giant_roach", 5]] }],
    ],
    harbor: [[1, { types: [["shellback", 2]] }]],
  };

  /** Generic settlement populations (quests add the named NPCs). */
  C.SETTLEMENT_POP = {
    grand_central: [
      {
        type: "human",
        outfit: "settler",
        name: "Market Guard",
        voice: "guard",
        ai: "guard",
        pool: "merchant_guard",
        count: 3,
      },
      {
        type: "human",
        outfit: "settler",
        name: "Settler",
        voice: "settler",
        ai: "wander",
        pool: null,
        count: 3,
      },
    ],
    flatiron: [
      {
        type: "human",
        outfit: "combat_armor",
        name: "Wagon Guard",
        voice: "guard",
        ai: "guard",
        pool: "merchant_guard",
        count: 2,
      },
      {
        type: "human",
        outfit: "drifter",
        name: "Trader",
        voice: "settler",
        ai: "wander",
        pool: null,
        count: 2,
      },
    ],
    radio_city: [
      {
        type: "human",
        outfit: "settler",
        name: "Radio City Guard",
        voice: "guard",
        ai: "guard",
        pool: "settler",
        count: 2,
      },
    ],
    times_square: [
      {
        type: "human",
        outfit: "survivor_layers",
        faction: "settlers",
        name: "Neon Bouncer",
        voice: "neon",
        ai: "guard",
        pool: "neon",
        count: 2,
      },
      {
        type: "human",
        outfit: "survivor_layers",
        faction: "settlers",
        name: "Neon Resident",
        voice: "neon",
        ai: "wander",
        pool: null,
        count: 3,
      },
    ],
    rockefeller: [
      {
        type: "covenant_warden",
        name: "Covenant Lancer",
        voice: "covenant",
        ai: "guard",
        pool: "covenant_warden",
        count: 3,
        faction: "covenant",
      },
    ],
    st_patricks: [
      {
        type: "human",
        outfit: "glowkeeper_robes",
        faction: "glowkeepers",
        name: "Glowkeeper",
        voice: "glowkeeper",
        ai: "wander",
        pool: "glowkeeper",
        count: 3,
      },
    ],
  };

  /** Settlements whose population the quests module spawns itself (generics above only without quests). */
  C.SETTLEMENT_QUEST_OWNED = { times_square: true };

  /** Rank names by level (used when a spawn def gives no name). */
  C.rankName = function (type, level, def) {
    const L = level || 1;
    switch (type) {
      case "raider":
        return L >= 9
          ? C.pick(["Raider Veteran", "Raider Butcher", "Raider Wrecker"])
          : L >= 5
            ? C.pick([
                "Raider",
                "Raider Butcher",
                "Raider Scrounger",
                "Raider Punk",
              ])
            : C.pick(["Raider", "Raider", "Raider Scum", "Raider Punk"]);
      case "brute":
        return L >= 17
          ? "Brute Warlord"
          : L >= 12
            ? "Brute Chieftain"
            : L >= 7
              ? "Brute Bonecrusher"
              : "Brute";
      case "maniac":
        return L >= 10 ? "Raving Maniac" : L >= 5 ? "Maniac Prowler" : "Maniac";
      case "maniac_bruiser":
        return L >= 14 ? "Maniac Butcher" : "Maniac Bruiser";
      case "ripjaw":
        return L >= 14 ? "Ripjaw Matriarch" : "Ripjaw";
      case "shellback":
        return L <= 3 ? "Shellback Spawn" : "Shellback";
      case "giant_roach":
        return L >= 8 ? "Blistered Roach" : "Giant Roach";
      case "continuity_soldier":
        return L >= 18
          ? "Continuity Marshal"
          : L >= 14
            ? "Continuity Sergeant"
            : "Continuity Trooper";
      case "covenant_warden":
        return L >= 12 ? "Covenant Warden" : "Covenant Lancer";
      case "valet_m":
        return "Valet-M";
      case "dog":
        return L >= 6 ? "Feral Dog" : "Wild Dog";
      default:
        return null;
    }
  };

  // ------------------------------------------------------------------
  // Reaction window ([CAUTION]): half-noticed player → a "?" bark and a turn of the head.
  // ------------------------------------------------------------------
  C.CAUTION_BARKS = {
    _default: ["Huh?", "What was that?", "Hello?", "...?"],
    raider: [
      "Huh? Somebody there?",
      "Who's creepin'?",
      "Eh? I see ya... maybe.",
      "That you, Skeeter? ...Skeeter?",
    ],
    brute: ["Hrrm? Something moved?", "Smell... something.", "Who is there?"],
    continuity: [
      "Movement. Hold.",
      "Did you see that?",
      "Possible contact. Confirm.",
    ],
    covenant: ["Hold. Something's out there.", "Movement. Eyes up."],
    settler: ["Hello? Who's out there?", "Is someone there?"],
    guard: ["Who goes there?", "Show yourself."],
    neon: ["Somebody there? I got bad eyes, not bad aim."],
    glowkeeper: ["Who approaches the warm place?"],
    patrolman: [
      "Motion detected. Please identify.",
      "Citizen? Please state your business.",
    ],
    valet_m: [
      "Who goes there, recruit?!",
      "Something's rustling! French pigeon?",
    ],
  };
  C.cautionBark = (voice) =>
    C.pick(C.CAUTION_BARKS[voice] || C.CAUTION_BARKS._default);

  // ------------------------------------------------------------------
  // Trespass (UN Plaza garrison before the main quest settles it):
  // warn → last warning → open fire. ALL ORIGINAL LINES.
  // ------------------------------------------------------------------
  C.TRESPASS_BARKS = {
    warn: [
      "Halt! This is a federal exclusion zone. Turn around, civilian.",
      "You are approaching a restricted installation. Leave. Now.",
      "Stop right there! Unauthorized personnel are not permitted on the plaza.",
      "Civilian! You are entering a secured area. Back off.",
    ],
    last: [
      "Final warning. Five seconds, then we open fire.",
      "I will not tell you again. Leave the plaza.",
      "Weapons are hot, civilian. Walk away. NOW.",
    ],
    open: [
      "Trespasser will not comply. Weapons free!",
      "That's it. Light them up!",
      "Non-compliant hostile. Engage!",
    ],
    leave: [
      "That's right. Keep walking.",
      "Smart choice. Stay off the plaza.",
      "And don't come back without an invitation.",
    ],
    sky_eye: [
      "[Loudhailer: RESTRICTED AREA... PERSONNEL WITHOUT CLEARANCE WILL BE... DETAINED...]",
      "[Sky-Eye: ...EXCLUSION ZONE... TURN BACK... THIS IS A LAWFUL ORDER OF THE ACTING PRESIDENT...]",
    ],
  };

  // ------------------------------------------------------------------
  // NPC greetings that react to the faction armour the player wears.
  // key: 'covenant' | 'continuity' → voice → lines.  ALL ORIGINAL LINES.
  // ------------------------------------------------------------------
  C.ARMOR_GREET = {
    covenant: {
      settler: [
        "A Covenant rig! Thank heaven. Are you with the patrols from Rockefeller?",
        "Lancer! The raiders have been at the south fence again.",
        "We don't get many of you walking boilers this far out. Welcome.",
      ],
      guard: [
        "Good to see iron on the street. Keep the Brutes off our market, will you?",
        "Covenant. Our gate's open to you.",
      ],
      neon: [
        "Covenant, huh? Your lot usually shoots first and asks for papers later. Appreciate the restraint.",
      ],
      glowkeeper: [
        "The Covenant hoards the old machines like misers. Still... the Light on you, Lancer.",
      ],
      covenant: [
        "Iron remembers, sworn one.",
        "Good to see you in the rig. Iron holds.",
        "Hold the line out there.",
      ],
      continuity: ["Covenant scavenger. Walk on before I remember my orders."],
      merchant: ["Covenant discount? ...No. But I'll throw in a smile."],
    },
    continuity: {
      settler: [
        "That... that's a Continuity rig. We don't want any trouble. Please.",
        "Take what you need, sir. Just... take it and go.",
      ],
      guard: [
        "Easy. Nobody here wants a fight with the Continuity.",
        "I'll be watching you, Liberty.",
      ],
      neon: [
        'Continuity. Great. Here to "register" the neighborhood again?',
        "I've outlived one government already. I'll outlive yours.",
      ],
      glowkeeper: [
        'The Continuity would file the sun under "classified" if it could.',
      ],
      covenant: [
        "You've got a lot of nerve wearing that on our street.",
        "Continuity colors. Keep your hands where I can see them.",
      ],
      continuity: [
        "As you were, trooper.",
        "Good to see a friendly helmet out here.",
        "Stay sharp. The locals bite.",
      ],
      merchant: [
        "Continuity vouchers? Not worth the paper. Scrip only... sir.",
      ],
    },
  };

  // ------------------------------------------------------------------
  // Standing & faction world reactions (roaming "special" encounters).
  // Good Standing → the Gallowglass Company, mercenaries on a Liberty Island
  // contract (the Continuity wants the hero quiet); a grateful stranger with a gift.
  // Bad Standing → the Lantern Marshals, a self-appointed posse with a warrant.
  // After the main quest's faction choice: allied Covenant / Continuity patrols
  // clashing with the other side. All names & text original.
  // ------------------------------------------------------------------
  C.BARKS.merc = {
    alert: [
      "There's the payday! Weapons up!",
      "Target confirmed. Collect the bounty!",
      "Nothing personal, pal. Liberty pays in gold.",
    ],
    combat: [
      "Earn your cut, boys!",
      "Push! Push!",
      'Contract says dead. Not "mostly dead".',
      "Pin them down!",
    ],
    search: [
      "Spread out. The client wants a body.",
      "They're close. I can smell the freezer on 'em.",
    ],
    lost: [
      "Lost the mark. Regroup.",
      "Damn it. The paymaster won't like this.",
    ],
    hurt: ["I'm hit! Hazard pay!", "Agh! Double the fee!"],
    kill: ["Contract fulfilled.", "Payday."],
    reload: ["Reloading!", "Changing mags!"],
    grenade: ["Frag out!"],
    allyDown: ["Man down! That's a bigger cut for me.", "They got Rourke!"],
    flee: ["This ain't worth the gold!"],
  };
  C.BARKS.marshal = {
    alert: [
      "By the Lantern! There's the one on the warrant!",
      "You're under arrest! ...Kidding. Draw!",
      "Wanted, dead or deader. We'll take either.",
    ],
    combat: [
      "Justice don't miss twice!",
      "Answer for what you did!",
      "Hold the line, marshals!",
      "Too late to repent now!",
    ],
    search: [
      "Spread out. Warrant says they're close.",
      "Come out and face the Lantern!",
    ],
    lost: ["Slippery. We'll find 'em.", "The warrant stays open."],
    hurt: ["Winged me!", "Still standing!"],
    kill: ["Warrant served.", "May whoever's left forgive you."],
    reload: ["Reloading!"],
    allyDown: ["Marshal down!", "They killed Hollis!"],
  };
  C.BARKS.gift = {
    greet: [
      "You probably don't remember me. You helped my family. Here, it's not much.",
      "Word gets around about folks like you. Take this, please.",
      "I've been looking for you! My brother says you saved his life. This is from both of us.",
    ],
    idle: ["Hello there, friend!"],
  };
  C.STANDING_SQUADS = {
    merc: {
      faction: "mercenaries",
      voice: "merc",
      leader: "Gallowglass Captain",
      member: "Gallowglass Merc",
      outfit: "combat_armor",
      note: "cmb_note_contract",
      pool: "mercenary",
      count: [3, 4],
      levelBonus: 1,
      evil: true,
    },
    marshal: {
      faction: "lawmen",
      voice: "marshal",
      leader: "Lantern Marshal",
      member: "Lantern Deputy",
      outfit: "leather_armor",
      hat: "cowboy",
      note: "cmb_note_warrant",
      pool: "lawman",
      count: [3, 4],
      levelBonus: 0,
    },
  };
  C.NOTES = {
    cmb_note_contract: {
      name: "Gallowglass Contract",
      title: "Contract No. 89-L",
      value: 0,
      text:
        "GALLOWGLASS COMPANY: LETTER OF ENGAGEMENT\n\nClient: Office of Civil Pacification, Liberty Island (via courier).\nTarget: the sleeper out of Cryo Unit C-9, " +
        "calling himself a friend of Manhattan.\n\nThe client notes with concern the target's growing popularity among the local population. Popular people " +
        "become symbols. Symbols become problems.\n\nTerms: 500 in federal gold on proof of death. Goggles to be returned intact.\nThe Company does not ask why.\n\n(signed) Capt. M. Rourke",
    },
    cmb_note_warrant: {
      name: "Lantern Warrant",
      title: "Warrant of the Lantern Marshals",
      value: 0,
      text:
        "BY THE AUTHORITY OF THE LANTERN (which is to say: nobody's, and so everybody's)\n\nWANTED: the sleeper who walked out of the ice downtown.\nCharges: murder of " +
        "innocents; theft; general wickedness as witnessed by the good people of Manhattan.\n\nThe bearer of this warrant is empowered to bring the accused " +
        "to justice, or justice to the accused, whichever proves simpler.\n\nLet the lamp stay lit.\n(signed) Marshal H. Crane, Flatiron District",
    },
  };
  C.WEAPON_POOLS.mercenary = (l) =>
    l <= 6
      ? [
          ["assault_rifle", 3],
          ["combat_shotgun", 2],
          ["smg_10mm", 2],
          ["hunting_rifle", 1],
        ]
      : [
          ["assault_rifle", 3],
          ["combat_shotgun", 2],
          ["sniper_rifle", 1],
          ["belt_fed_mg", 0.6],
          ["missile_launcher", 0.3],
        ];
  C.WEAPON_POOLS.lawman = (l) =>
    l <= 6
      ? [
          ["hunting_rifle", 3],
          ["magnum_44", 2],
          ["pistol_10mm", 2],
          ["sawed_off_shotgun", 1],
        ]
      : [
          ["hunting_rifle", 2],
          ["magnum_44", 3],
          ["combat_shotgun", 2],
          ["sniper_rifle", 1],
        ];
  C.GIFTS = [
    [["rally_tonic", 3]],
    [
      ["rally_tonic", 2],
      ["iodine_tabs", 1],
    ],
    [["scrip", 100]],
    [
      ["fizzo_blue", 1],
      ["rally_tonic", 1],
    ],
    [
      ["prussian_blue", 2],
      ["purified_water", 2],
    ],
    [
      ["ammo_10mm", 40],
      ["frag_grenade", 2],
    ],
    [
      ["rally_tonic_extra", 1],
      ["rally_tonic", 1],
    ],
  ];

  // Human first names for generic NPC flavour (original list)
  C.FIRST_NAMES = [
    "Mags",
    "Dutch",
    "Rosie",
    "Tully",
    "Vic",
    "Sal",
    "Bea",
    "Jojo",
    "Lou",
    "Nell",
    "Otis",
    "Kit",
    "Ruth",
    "Gus",
    "Hank",
    "Ida",
    "Moe",
    "Dot",
    "Frankie",
    "Lefty",
  ];
  C.RAIDER_NAMES = [
    "Raider",
    "Raider",
    "Raider",
    "Raider Scum",
    "Raider Butcher",
    "Raider Punk",
    "Raider Scrounger",
  ];

  // ------------------------------------------------------------------
  // Small shared helpers
  // ------------------------------------------------------------------
  C.rand = (a, b) => a + Math.random() * (b - a);
  C.randInt = (a, b) => Math.floor(a + Math.random() * (b - a + 1));
  C.pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  C.weighted = (pairs) => {
    let tot = 0;
    for (const p of pairs) tot += p[1];
    let r = Math.random() * tot;
    for (const p of pairs) {
      r -= p[1];
      if (r <= 0) return p[0];
    }
    return pairs[pairs.length - 1][0];
  };
  C.clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  C.sfx = function (name, opts) {
    try {
      return G.sfx.play(name, opts);
    } catch (e) {
      return null;
    }
  };
  C.fx = function (fn) {
    if (G.isStub("fx")) return null;
    const f = G.fx[fn];
    if (typeof f !== "function") return null;
    try {
      return f.apply(G.fx, Array.prototype.slice.call(arguments, 1));
    } catch (e) {
      G.reportError("combat:fx." + fn, e);
      return null;
    }
  };

  /** Talent rank / modifier queries (defensive against an absent rpg module). */
  C.talent = (id) => {
    if (G.isStub("rpg") || typeof G.rpg.hasTalent !== "function") return false;
    try {
      return !!G.rpg.hasTalent(id);
    } catch (e) {
      return false;
    }
  };
  C.mod = (name) => {
    if (G.isStub("rpg") || typeof G.rpg.mod !== "function") return 0;
    try {
      return G.rpg.mod(name) || 0;
    } catch (e) {
      return 0;
    }
  };
  C.skill = (id, dflt) => {
    if (G.isStub("rpg") || typeof G.rpg.skill !== "function")
      return dflt === undefined ? 30 : dflt;
    try {
      const v = G.rpg.skill(id);
      return typeof v === "number" ? v : dflt || 30;
    } catch (e) {
      return dflt || 30;
    }
  };
  C.attr = (k, dflt) => {
    if (G.isStub("rpg") || typeof G.rpg.attr !== "function") return dflt || 5;
    try {
      const v = G.rpg.attr(k);
      return typeof v === "number" && v > 0 ? v : dflt || 5;
    } catch (e) {
      return dflt || 5;
    }
  };
  C.playerLevel = () =>
    !G.isStub("rpg") && typeof G.rpg.level === "number" ? G.rpg.level : 1;
})();
