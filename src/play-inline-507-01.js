// play-inline-507 01 — rel
// Lines 21-156 of readable/play-inline-507.pretty.js (statement-aligned).
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
