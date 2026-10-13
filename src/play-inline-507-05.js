// play-inline-507 05 — extra
// Lines 1502-1824 of readable/play-inline-507.pretty.js (statement-aligned).
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
