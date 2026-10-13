// play-inline-489 01 — casing
// Lines 17-178 of readable/play-inline-489.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;

  // Namespace (replaced wholesale — core pre-created a stub Proxy).
  // Private cross-file state lives under G.weapons._ (not part of the contract).
  const W = (G.weapons = { _: {} });
  const P = W._;

  // ------------------------------------------------------------------
  // Ammo
  // ------------------------------------------------------------------
  const AMMO = [
    {
      id: "ammo_32",
      name: ".32 Caliber Round",
      value: 1,
      desc: "Cheap, plentiful and only mildly disappointing.",
      casing: "pistol_small",
    },
    {
      id: "ammo_10mm",
      name: "10mm Round",
      value: 1,
      desc: "The workhorse pistol cartridge of the old world. Civil Defense issue.",
      casing: "pistol",
    },
    {
      id: "ammo_308",
      name: ".308 Caliber Round",
      value: 3,
      desc: "A full-power rifle cartridge. Reach out and touch someone.",
      casing: "rifle_long",
    },
    {
      id: "ammo_556",
      name: "5.56mm Round",
      value: 2,
      desc: "Standard-issue U.S. Army intermediate cartridge.",
      casing: "rifle",
    },
    {
      id: "ammo_5mm",
      name: "5mm Round",
      value: 1,
      desc: "Tiny caseless-style rounds for belt-fed miniguns. Sold by the thousand.",
      casing: "rifle_small",
    },
    {
      id: "ammo_44",
      name: ".44 Magnum Round",
      value: 4,
      desc: "The most powerful handgun round made before the bombs fell. Allegedly.",
      casing: "magnum",
    },
    {
      id: "ammo_12ga",
      name: "Shotgun Shell",
      value: 2,
      desc: "12-gauge buckshot. Solves problems at close range.",
      casing: "shell",
    },
    {
      id: "ammo_bb",
      name: "BB",
      value: 0,
      desc: "Copper-plated steel shot. You'll shoot your eye out.",
      casing: null,
    },
    {
      id: "ammo_missile",
      name: "Missile",
      value: 25,
      desc: "A shoulder-launched high explosive missile. Keep away from face.",
      casing: null,
    },
    {
      id: "ammo_gyrojet",
      name: "13mm Gyrojet Rocket",
      value: 4,
      desc: "A finned steel micro-rocket with four canted nozzles in its base. It leaves the barrel at a stroll and arrives at a sprint. Continuity issue, 1965 pattern.",
      casing: null,
    },
    {
      id: "ammo_recoilless",
      name: "Recoilless Round",
      value: 60,
      desc: "A 90 mm high-explosive round in a perforated case. The holes are where the back-blast comes out, so mind what is behind you.",
      casing: null,
    },
    {
      id: "ammo_flamer_fuel",
      name: "Flamer Fuel",
      value: 1,
      desc: "Jellied petroleum in a pressurised canister. Smells like a gas station fire.",
      casing: null,
    },
    // workbench ammunition (craftable, see 70_craft.js)
    {
      id: "ammo_rivet",
      name: "Hot Rivet",
      value: 1,
      desc: "A three-quarter-inch structural rivet. The Rivet Gun heats it cherry-red on the way out, the way the ironworkers on the RCA Building used to toss them.",
      casing: null,
    },
    {
      id: "ammo_dry_cell",
      name: "Lantern Battery",
      value: 2,
      desc: "A square six-volt dry cell with spring terminals, the kind every Civil Defense lantern took. One runs a siren horn for exactly one bad idea.",
      casing: null,
    },
  ];

  // ------------------------------------------------------------------
  // Weapon defaults (per archetype) — merged under each def
  // ------------------------------------------------------------------
  const BASE = {
    skill: "firearms",
    damage: 10,
    rof: 3,
    automatic: false,
    magSize: 10,
    ammo: null,
    reloadTime: 2.0,
    spread: 0.03,
    adsSpread: 0.008,
    range: 150,
    pellets: 1,
    projectile: "hitscan",
    explosionRadius: 0,
    critMult: 1,
    critChance: 1,
    strReq: 1,
    condDecay: 0.0025,
    sound: "gun_pistol",
    weight: 3,
    value: 100,
    viewmodel: "pistol_10mm",
    damageType: "ballistic",
    // --- weapons-module extras (not in contract, but documented) ---
    reloadType: "mag", // mag | revolver | shell | cell | drum | breakaction | single | bb | none | melee | throw
    cycle: null, // 'bolt' | 'pump' | 'lever' — manual action after each shot
    recoil: [0.012, 0.004], // pitch, yaw (rad) per shot
    kick: 1, // visual recoil scale
    flash: "ballistic", // muzzle flash kind: ballistic | gyro | rocket | none | flame
    beamColor: null, // tracer beam colour for energy-type hitscan (unused by the player roster)
    scope: 0, // >0 = scoped, zoom factor for ADS
    adsFov: 0.82, // ADS FOV multiplier for iron sights
    twoHanded: true,
    spinUp: 0, // minigun barrel spin-up seconds
    projectileSpeed: 0, // m/s for projectile kinds
    meleeRange: 0,
    meleeArc: 0,
    sfxPitch: 1,
    sfxVolume: 1,
    shell: "pistol", // shell casing kind (from ammo) or null
    moveSpread: 1, // how much moving adds to spread
    bloom: 0.012, // spread added per shot (decays)
    maxBloom: 0.06,
  };

  // Each entry: item fields + `w` (weapon block overrides).
