// play-inline-530 03 — the
// Lines 697-782 of readable/play-inline-530.pretty.js (statement-aligned).
  X.TABS = {
    workbench: [
      ["schematics", "SCHEMATICS"],
      ["workshop", "WORKSHOP"],
      ["chemistry", "CHEMISTRY"],
      ["modify", "MODIFY"],
      ["repair", "REPAIR"],
    ],
    campfire: [
      ["cooking", "COOKING"],
      ["remedies", "REMEDIES"],
    ],
  };
  X.STATION_TITLE = { workbench: "WORKBENCH", campfire: "CAMPFIRE" };

  // Blueprint art per output id (weapons-owned items & common outputs). Our recipes carry their own `art`.
  X.ART_BY_ITEM = {
    third_rail_shoe: "blade",
    siren_horn: "launcher",
    rivet_gun: "dartgun",
    molotov: "grenade",
    cr_lunchbox_mine: "mine",
    ammo_rivet: "spikes",
    ammo_dry_cell: "cell",
    mod_10mm_silencer: "silencer",
    mod_10mm_ext_mag: "mag",
    mod_rifle_ext_mag: "mag",
    mod_rifle_scope: "scope",
    mod_44_scope: "scope",
    mod_gyro_venturi: "lens",
  };
  /** Blueprint kind for an item id. */
  X.artFor = function (id, fb) {
    if (X.ART_BY_ITEM[id]) return X.ART_BY_ITEM[id];
    return fb || "generic";
  };

  // ------------------------------------------------------------------
  // Schematic diagrams in the world: [schematicId, x, z, searchRadius, note]
  // (static pickups: remembered per save). Third copies sit somewhere risky.
  // ------------------------------------------------------------------
  X.SCHEM_PLACEMENTS = [
    [
      "schematic_cr_lunchbox_mine",
      4,
      -40,
      10,
      "Herald Square, by the Sterling's entrance",
    ],
    [
      "schematic_cr_lunchbox_mine",
      0,
      790,
      12,
      "Wall Street, under the Stock Exchange columns",
    ],
    ["schematic_cr_lunchbox_mine", 150, 935, 14, "Battery Park promenade"],
  ];

  // ------------------------------------------------------------------
  // Harvestable plant patches: [x, z, radius, count, species mix 0..1 (share of ashbloom)]
  // ------------------------------------------------------------------
  X.PLANT_PATCHES = [
    [-58, -694, 5, 4, 0.5], // west shore of the Lake (by the camp; teaches foraging)
    [-60, -500, 9, 6, 0.5], // Sheep Meadow
    [30, -560, 7, 4, 0.6], // near the Terrace fountain
    [-50, -670, 7, 4, 0.4], // Lake shore / Ramble
    [60, -950, 9, 5, 0.3], // North Woods
    [80, -208, 6, 4, 0.5], // Bryant Park lawn
    [80, 445, 7, 4, 0.5], // Washington Square
    [-60, 960, 9, 5, 0.5], // Battery Park
  ];
  X.PLANT_SPECIES = {
    ashbloom: { item: "cr_ashbloom", label: "Ashbloom" },
    knotroot: { item: "cr_knotroot", label: "Knotroot" },
  };
  X.REGROW_HOURS = 72; // three game days

  // Extra campfires we light ourselves if the area has none (survivor camps).
  X.CAMPFIRES = [
    [-48, -690, "pot"], // Lake shore survivor camp
    [-30, 945, "spit"], // Battery Park fishermen
    [95, -200, "pot"], // Bryant Park squatters
  ];
  // Extra workbench at the Lake shore camp (so the first schematics can be built early).
  X.WORKBENCHES = [[-44, -688, Math.PI / 2]];
