// play-inline-480 04 — box
// Lines 1331-1651 of readable/play-inline-480.pretty.js (statement-aligned).
  Object.assign(BUILDERS, {
    // ---- clothing ----
    cloth_cryo: (k) => {
      garment(k, C.cryoGrey, C.cryoOrange, "coverall");
      k.torus(0.06, 0.014, C.cryoOrange, 0, 0.034, -0.27, Math.PI / 2);
      return k;
    },
    cloth_white: (k) => garment(k, 0xe8e8e0, 0xb0b0a8, "coat"),
    cloth_black: (k) => garment(k, 0x26262a, 0x8a1a1a, "suit"),
    cloth_red: (k) => garment(k, 0x7a1a14, 0xd0b040, "robe"),
    cloth_green: (k) => garment(k, 0x4a6a2a, 0xa0d040, "robe"),
    cloth_yellow: (k) => garment(k, 0xd8b020, 0x2a2a2a, "hazmat"),
    cloth_orange: (k) => garment(k, 0xd07020, 0x2a2a2a, "hazmat"),
    cloth_grey: (k) => garment(k, 0x6a6a68, 0x3a3a3a, "suit"),
    cloth_olive: (k) => garment(k, 0x5a603a, 0x3a3a2a, "coverall"),
    cloth_brown: (k) => garment(k, 0x6a4a2a, 0x3a2a1a, "rags"),
    cloth_blue: (k) => garment(k, 0x2e4466, 0xc8a040, "suit"),
    cloth_floral: (k) => {
      garment(k, 0xd890a0, 0xf0e0a0, "dress");
      for (let i = 0; i < 5; i++)
        k.sph(
          0.018,
          0xf4f0d8,
          -0.1 + i * 0.05,
          0.03,
          0.2 + (i % 2) * 0.08,
          1,
          0.3,
          1,
          6,
        );
      return k;
    },
    cloth_sequin: (k) => garment(k, 0xd0a030, 0xff60a0, "dress"),
    // ---- World's Fair curator rewards (src/quests/55_medallions.js) ----
    wf_blazer: (k) => {
      // the Fair host's blazer: Unisphere blue with orange piping and the Fair seal on the breast pocket
      garment(k, 0x1e3a8a, 0xf08a1a, "suit");
      k.boxL(0.07, 0.004, 0.07, 0xffffff, "wf_seal", "y", 0.09, 0.052, 0.05);
      return k;
    },
    hat_boater: (k) => {
      // a stiff straw boater with the orange-and-blue Fair ribbon
      k.cyl(0.15, 0.15, 0.008, 0xd8c078, 0, 0.004, 0, 20);
      k.cyl(0.095, 0.098, 0.06, 0xd0b468, 0, 0.038, 0, 18);
      k.cyl(0.095, 0.095, 0.004, 0xd8c078, 0, 0.07, 0, 18);
      k.cylL(0.1, 0.1, 0.022, 0xffffff, "wf_ribbon", 0, 0.022, 0, 18);
      return k;
    },
    wf_case: (k) => {
      // the walnut presentation case for the complete set: twenty bronze discs in green velvet, the Fair seal in the lid
      k.box(0.42, 0.04, 0.3, 0x5a3418, 0, 0.02, 0);
      k.box(0.4, 0.004, 0.28, 0x1a4a2a, 0, 0.041, 0);
      k.box(0.42, 0.26, 0.02, 0x5a3418, 0, 0.13, -0.15, 0, -0.35);
      k.boxL(
        0.12,
        0.12,
        0.004,
        0xffffff,
        "wf_seal",
        "z",
        0,
        0.14,
        -0.135,
        0,
        -0.35,
      );
      for (let r = 0; r < 4; r++)
        for (let c = 0; c < 5; c++)
          k.cyl(
            0.026,
            0.026,
            0.006,
            0xb07a30,
            -0.14 + c * 0.07,
            0.045,
            -0.1 + r * 0.065,
            12,
          );
      k.box(0.04, 0.012, 0.012, C.crownGold, 0, 0.03, 0.152);
      return k;
    },
    // ---- body armor ----
    armor_guard: (k) => {
      garment(k, 0x8a8e92, C.cryoOrange, "coverall");
      plate(k, 0.3, 0.28, 0x3a3e52, 0, -0.1);
      plate(k, 0.13, 0.13, 0x3a3e52, -0.2, -0.22);
      plate(k, 0.13, 0.13, 0x3a3e52, 0.2, -0.22);
      k.box(0.12, 0.012, 0.03, 0xe8e8e0, 0, 0.068, -0.14);
      return k;
    },
    armor_leather: (k) => {
      garment(k, 0x4a3a2a, 0x2a1a0a, "suit");
      plate(k, 0.32, 0.28, 0x6a4424, 0, -0.1);
      plate(k, 0.15, 0.15, 0x5a3a1e, -0.2, -0.2);
      plate(k, 0.15, 0.15, 0x5a3a1e, 0.2, -0.2);
      for (const z of [-0.18, -0.08, 0.02])
        k.box(0.3, 0.012, 0.018, 0x2a1a0a, 0, 0.07, z); // straps
      k.box(0.08, 0.05, 0.06, 0x5a3a1e, 0.12, 0.05, 0.1);
      k.box(0.08, 0.05, 0.06, 0x5a3a1e, -0.12, 0.05, 0.1); // belt pouches
      plate(k, 0.1, 0.1, 0x6a4424, -0.1, 0.36);
      plate(k, 0.1, 0.1, 0x6a4424, 0.1, 0.36); // knee pads
      return k;
    },
    armor_leather_r: (k) => {
      BUILDERS.armor_leather(k);
      for (const x of [-0.08, 0.08]) {
        k.box(0.1, 0.012, 0.12, 0x7a7870, x, 0.08, -0.12);
        rivets(k, [x - 0.04, x + 0.04], -0.17, 0.088);
      }
      return k;
    },
    armor_metal: (k) => {
      garment(k, 0x3a3430, 0x2a2420, "rags");
      for (let i = 0; i < 3; i++)
        k.box(
          0.34 - i * 0.03,
          0.02,
          0.12,
          i % 2 ? 0x7a7670 : 0x6a6660,
          0,
          0.05 + i * 0.008,
          -0.2 + i * 0.1,
          0,
          0.12,
        ); // overlapping chest plates
      for (const sx of [-1, 1]) {
        k.sph(0.1, 0x8a8680, sx * 0.21, 0.04, -0.2, 1, 0.45, 1.1, 10);
        rivets(k, [sx * 0.21], -0.2, 0.087);
      }
      rivets(k, [-0.14, -0.05, 0.05, 0.14], -0.2, 0.072, 0xb0b0a8);
      k.box(0.12, 0.02, 0.2, 0x6a6660, -0.09, 0.05, 0.36);
      k.box(0.12, 0.02, 0.2, 0x6a6660, 0.09, 0.05, 0.36); // greaves
      k.cyl(0.05, 0.05, 0.012, 0x9a9a90, 0, 0.078, 0.02, 12); // hubcap belly plate
      return k;
    },
    armor_combat: (k) => {
      garment(k, 0x2e3228, 0x1a1c18, "coverall");
      plate(k, 0.3, 0.26, 0x4a5040, 0, -0.12);
      k.box(0.26, 0.022, 0.05, 0x3a3e34, 0, 0.056, 0.02);
      k.box(0.24, 0.022, 0.05, 0x3a3e34, 0, 0.056, 0.075); // chest + ab plates
      for (const sx of [-1, 1]) {
        plate(k, 0.13, 0.16, 0x4a5040, sx * 0.21, -0.2);
        plate(k, 0.09, 0.09, 0x4a5040, sx * 0.09, 0.36);
        k.box(0.08, 0.02, 0.1, 0x3a3e34, sx * 0.28, 0.04, -0.02, sx * 0.55);
      }
      k.box(0.06, 0.03, 0.04, 0x1a1a18, 0.1, 0.055, -0.2);
      k.box(0.1, 0.004, 0.03, 0xd8d0b0, -0.08, 0.075, -0.16); // radio + stencil
      return k;
    },
    armor_scout: (k) => {
      BUILDERS.armor_combat(k);
      k.box(0.12, 0.012, 0.08, 0x6a6a50, 0.06, 0.08, -0.08, 0.5);
      k.box(0.1, 0.012, 0.06, 0x3a3a2a, -0.07, 0.078, -0.16, -0.4);
      return k;
    },
    armor_riot: (k) => {
      garment(k, 0x1a1a1e, 0x0e0e10, "coverall");
      plate(k, 0.34, 0.3, 0x24242a, 0, -0.1);
      k.box(0.3, 0.004, 0.03, 0xd8d8d0, 0, 0.078, -0.03); // POLICE stripe
      for (const sx of [-1, 1]) {
        k.sph(0.12, 0x26262c, sx * 0.22, 0.04, -0.2, 1, 0.5, 1.2, 10);
        plate(k, 0.1, 0.12, 0x26262c, sx * 0.09, 0.36);
      }
      k.cyl(0.03, 0.03, 0.004, 0xc0a040, -0.08, 0.08, -0.18, 8); // precinct badge
      return k;
    },
    armor_stealth: (k) => {
      garment(k, 0x2a1414, 0x4a1a1a, "coverall");
      plate(k, 0.3, 0.26, 0x5a1a1a, 0, -0.1);
      for (const sx of [-1, 1])
        k.box(0.02, 0.01, 0.3, 0x3aff7a, sx * 0.06, 0.07, 0.05); // glowing field lines
      k.box(0.05, 0.03, 0.05, 0x40ff80, 0.1, 0.07, -0.16);
      return k;
    },
    armor_raider: (k) => {
      garment(k, 0x4a3420, 0x2a1a10, "rags");
      k.box(0.16, 0.03, 0.14, 0x5a5a58, -0.18, 0.05, -0.2, 0.3);
      k.sph(0.08, 0x8a2a1a, 0.2, 0.04, -0.2, 1, 0.5, 1, 8); // mismatched pads
      spikes(
        k,
        [
          [-0.2, 0.09, -0.22],
          [-0.14, 0.09, -0.16],
          [0.2, 0.08, -0.2],
        ],
        0x8a8a80,
      );
      k.torus(0.08, 0.025, 0x1a1a1a, 0.05, 0.035, 0.06, Math.PI / 2); // tire strapped to the belly
      k.box(0.3, 0.012, 0.03, 0x2a2a2a, 0, 0.06, -0.08, 0.35); // bandolier
      return k;
    },
    armor_scrap: (k) => {
      BUILDERS.armor_raider(k);
      k.cyl(0.03, 0.03, 0.14, 0x9a2a1a, -0.06, 0.07, -0.1, 8, 0, Math.PI / 2);
      k.cyl(0.03, 0.03, 0.14, 0x9a2a1a, -0.06, 0.07, -0.03, 8, 0, Math.PI / 2);
      return k;
    },
    armor_duster: (k) => {
      garment(k, 0x5a4230, 0x2a1a10, "rags");
      k.box(0.34, 0.02, 0.16, 0x6a5a48, 0, 0.05, -0.18);
      spikes(
        k,
        [
          [0.22, 0.08, -0.2],
          [0.26, 0.08, -0.14],
        ],
        0x7a7a70,
      );
      k.box(0.3, 0.012, 0.03, 0x2a2a2a, 0, 0.06, -0.02, -0.35);
      return k;
    },
    armor_wallstreet: (k) => {
      garment(k, 0x2a2a34, 0x8a1a1a, "suit");
      for (let i = 0; i < 3; i++)
        k.box(0.26, 0.018, 0.08, 0x6a6a60, 0, 0.05, -0.2 + i * 0.09);
      k.box(0.1, 0.004, 0.04, 0xd8c060, -0.08, 0.062, -0.24);
      return k;
    },
    // ---- exo-rigs ----
    rig_mk1: (k) => rigTorso(k, 0x5c604e, 0x3a3c32, 0xb0a060, "mk1"),
    rig_mk2: (k) => rigTorso(k, 0x8a8c84, 0x4a4c48, 0xd07020, "mk2"),
    rig_mk3: (k) => rigTorso(k, 0x4a5236, 0x2e3424, 0xe8e8e0, "mk3"),
    helmet_rig_mk2: (k) => rigHelmet(k, 0x8a8c84, 0x4a4c48, 0xf0a030),
    // ---- junk with distinct silhouettes ----
    sensor: (k) => {
      k.box(0.1, 0.06, 0.08, 0xc8c0a8, 0, 0.03, 0);
      k.cyl(0.028, 0.028, 0.02, C.chrome, 0, 0.035, 0.045, 12, Math.PI / 2);
      k.cyl(0.02, 0.02, 0.022, 0x102030, 0, 0.035, 0.05, 12, Math.PI / 2);
      k.cyl(0.003, 0.003, 0.08, 0x2a2a2a, 0.035, 0.1, -0.02, 4);
      k.sph(0.007, 0xd02020, 0.035, 0.14, -0.02, 1, 1, 1, 6);
      k.box(0.05, 0.008, 0.01, 0xc08040, -0.03, 0.004, -0.05);
      return k;
    },
    conductor: (k) => {
      k.cyl(0.006, 0.006, 0.16, 0xc07a40, 0, 0.08, 0, 6);
      for (let i = 0; i < 4; i++)
        k.cyl(
          0.03 - i * 0.003,
          0.034 - i * 0.003,
          0.018,
          0xe8e0d0,
          0,
          0.02 + i * 0.03,
          0,
          12,
        );
      k.torus(0.02, 0.004, 0xc07a40, 0, 0.15, 0, Math.PI / 2);
      return k;
    },
    microscope: (k) => {
      k.box(0.12, 0.02, 0.16, 0x2a2a2e, 0, 0.01, 0);
      k.box(0.04, 0.2, 0.04, 0x2a2a2e, 0, 0.11, -0.05, 0, 0.15);
      k.box(0.1, 0.012, 0.08, 0x3a3a3e, 0, 0.08, 0.02);
      k.cyl(0.018, 0.018, 0.15, 0xd8d8d0, 0, 0.19, 0.0, 10, 0.35);
      k.cyl(0.012, 0.012, 0.04, 0x1a1a1a, 0, 0.27, -0.03, 8, 0.35);
      k.cyl(0.02, 0.02, 0.03, C.chrome, 0.04, 0.12, -0.05, 10, 0, Math.PI / 2);
      return k;
    },
    pilot_light: (k) => {
      k.cyl(0.018, 0.018, 0.06, 0xc0a050, 0, 0.03, 0, 10);
      k.cyl(0.022, 0.022, 0.01, 0x2a2a2a, 0, 0.065, 0, 10);
      k.box(0.03, 0.01, 0.008, 0xc02020, 0, 0.074, 0);
      k.torus(0.035, 0.004, C.chrome, 0.045, 0.006, 0, Math.PI / 2);
      k.cyl(0.006, 0.006, 0.04, 0xc0a050, 0.025, 0.02, 0, 6, 0, Math.PI / 2);
      return k;
    },
    lighter: (k) => {
      k.box(0.024, 0.045, 0.012, C.chrome, 0, 0.0225, 0);
      k.box(0.0245, 0.003, 0.0125, 0x6a6a6a, 0, 0.032, 0);
      k.cyl(0.003, 0.003, 0.008, 0x3a3a3a, 0.006, 0.048, 0, 6);
      return k;
    },
    fork: (k) => {
      k.box(0.1, 0.004, 0.012, C.chrome, -0.03, 0.002, 0);
      k.box(0.03, 0.004, 0.022, C.chrome, 0.035, 0.002, 0);
      for (const z of [-0.008, 0, 0.008])
        k.box(0.04, 0.004, 0.003, C.chrome, 0.07, 0.002, z);
      return k;
    },
    camera: (k) => {
      k.box(0.12, 0.07, 0.06, 0x1e1e1e, 0, 0.035, 0);
      k.box(0.122, 0.018, 0.062, C.chrome, 0, 0.066, 0);
      k.cyl(0.024, 0.026, 0.04, 0x2a2a2a, 0, 0.035, 0.045, 12, Math.PI / 2);
      k.cyl(0.016, 0.016, 0.042, 0x2a4a5a, 0, 0.035, 0.046, 10, Math.PI / 2);
      k.box(0.02, 0.012, 0.012, C.chrome, 0.04, 0.08, 0);
      return k;
    },
    typewriter: (k) => {
      k.box(0.3, 0.07, 0.24, 0x2a3a2a, 0, 0.035, 0.02);
      k.box(0.3, 0.05, 0.1, 0x2a3a2a, 0, 0.09, -0.06, 0, 0.3);
      for (let r = 0; r < 3; r++)
        for (let i = 0; i < 8; i++)
          k.cyl(
            0.009,
            0.009,
            0.008,
            0xe8e0d0,
            -0.105 + i * 0.03,
            0.074 + r * 0.008,
            0.1 - r * 0.03,
            6,
          );
      k.cyl(0.02, 0.02, 0.34, 0x1a1a1a, 0, 0.13, -0.09, 10, 0, Math.PI / 2);
      k.box(0.2, 0.003, 0.08, C.paper, 0, 0.17, -0.1, 0, -0.2);
      return k;
    },
    ashtray: (k) => {
      k.cyl(0.06, 0.055, 0.018, 0x9ab8b0, 0, 0.009, 0, 14);
      k.cyl(0.045, 0.045, 0.01, 0x3a3a38, 0, 0.014, 0, 14);
      k.cyl(0.004, 0.004, 0.05, 0xe8e0d0, 0.02, 0.022, 0, 6, 0, Math.PI / 2);
      return k;
    },
    token: (k) => {
      k.cyl(0.012, 0.012, 0.003, 0xc0a040, 0, 0.0015, 0, 12);
      k.cyl(0.004, 0.004, 0.0035, 0x2a2010, 0, 0.0016, 0, 8);
      return k;
    },
  });

  // Materials per kind (default 'base')
