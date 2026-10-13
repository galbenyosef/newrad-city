// play-inline-530 01 — weight
// Lines 19-278 of readable/play-inline-530.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;

  // Replace the namespace wholesale (contract §0.3). Internals live on C._ (= X).
  const C = (G.crafting = { __crafting: true });
  const X = (C._ = {});

  // ------------------------------------------------------------------
  // Skills shown / used by the recipe gates (rpg skill id → label)
  // ------------------------------------------------------------------
  X.SKILL_NAMES = {
    mechanics: "Mechanics",
    electronics: "Electronics",
    medicine: "Medicine",
    survival: "Survival",
    explosives: "Explosives",
  };
  X.SKILL_ABBR = {
    mechanics: "MEC",
    electronics: "ELC",
    medicine: "MED",
    survival: "SRV",
    explosives: "EXP",
  };

  // ------------------------------------------------------------------
  // Schematic weapons owned by crafting: the Lunchbox Mine.
  // `w` = weapon block overrides on top of the weapons module's BASE block.
  // ------------------------------------------------------------------
  X.WEAPON_DEFS = [
    {
      id: "cr_lunchbox_mine",
      name: "Lunchbox Mine",
      weight: 0.5,
      value: 75,
      desc: 'A tin "Super Sergeant" lunchbox packed with a frag mine, a motion sensor and two fistfuls of roofing nails. When the lid pops, the nails go everywhere at once.',
      w: {
        skill: "explosives",
        damage: 250,
        rof: 1.0,
        magSize: 1,
        ammo: "cr_lunchbox_mine",
        critMult: 1,
        sound: "melee_swing",
        viewmodel: "frag_mine",
        skin: "lunchbox",
        damageType: "explosive",
        projectile: "mine",
        projectileSpeed: 7,
        explosionRadius: 7,
        reloadType: "throw",
        flash: "none",
        twoHanded: false,
        shell: null,
        fuse: 60,
        mine: true,
        condDecay: 0,
      },
    },
  ];

  // ------------------------------------------------------------------
  // Our schematics (learned on pickup, copies 1..3).
  //   mine     → each copy adds one mine per build
  // ------------------------------------------------------------------
  X.SCHEM = {
    schematic_cr_lunchbox_mine: {
      name: "Schematic - Lunchbox Mine",
      makes: "cr_lunchbox_mine",
      perCopy: "count",
      art: "mine",
      parts: [
        ["frag_mine", 1],
        ["lunchbox", 1],
        ["relay_board", 1],
        ["scrap_metal", 2],
      ],
      text: 'A "Super Sergeant" comic with the centre pages replaced by pencil diagrams: "Lid hinge = tripwire. Nails go in LAST. Do not store under bed." Signed, in crayon, "the Bowery Boys".',
    },
  };

  // ------------------------------------------------------------------
  // Items (G.items.define). Ingredients are aid (edible forage).
  // ------------------------------------------------------------------
  X.ITEM_DEFS = [
    // schematic diagrams (misc, consumed on pickup → learned)
    {
      id: "schematic_cr_lunchbox_mine",
      name: "Schematic - Lunchbox Mine",
      type: "misc",
      weight: 0,
      value: 50,
      tags: ["schematic"],
      mesh: "clipboard",
      noLoot: true,
      icon: "note",
      schematic: "cr_lunchbox_mine",
    },
    // Gunsmith Kit: used from the goggles inventory (Aid) or the workbench REPAIR tab
    {
      id: "cr_weapon_repair_kit",
      name: "Gunsmith Kit",
      type: "aid",
      weight: 2,
      value: 100,
      tags: ["repair", "tool"],
      mesh: "lunchbox",
      sound: "reload",
      noLoot: true,
      effects: {},
      desc: "Files, springs, pins, a tube of glue and a greasy rag in a tin box. Use it to restore the condition of your equipped weapon. Better hands, better results.",
    },
    // forage (harvested from plants in the parks)
    {
      id: "cr_ashbloom",
      name: "Ashbloom",
      type: "aid",
      weight: 0.1,
      value: 6,
      tags: ["food", "forage", "ingredient"],
      mesh: "gnarlberry",
      sound: "eat",
      noLoot: true,
      effects: { hpOverTime: [6, 4] },
      desc: "A rust-orange bloom that pushes up through the dead turf of Central Park wherever the ash fell thickest. Bitter as a lawyer. Grind it with knotroot for a root poultice.",
    },
    {
      id: "cr_knotroot",
      name: "Knotroot",
      type: "aid",
      weight: 0.2,
      value: 8,
      tags: ["food", "forage", "ingredient"],
      mesh: "fungus",
      sound: "eat",
      noLoot: true,
      effects: { hpOverTime: [8, 4] },
      desc: "A knobbly purple taproot. Old-timers boil it for the stomach, chew it for the nerves and swear by it for everything else.",
    },
    // campfire food
    {
      id: "cr_roach_kebab",
      name: "Roach Kebab",
      type: "aid",
      weight: 0.4,
      value: 8,
      tags: ["food", "cooked"],
      mesh: "meat_stick",
      sound: "eat",
      effects: { hpOverTime: [22, 6] },
      desc: "Two giant-roach thoraxes on a coat-hanger skewer, charred until the fire won the argument with the radiation. Crunchy. Honest.",
    },
    {
      id: "cr_jerky",
      name: "Street Jerky",
      type: "aid",
      weight: 0.1,
      value: 10,
      tags: ["food", "cooked"],
      mesh: "meat_stick",
      sound: "eat",
      effects: { hpOverTime: [26, 12] },
      desc: "Thin strips of feral dog, smoked for hours over trash-can embers. Keeps forever, chews for about as long.",
    },
    {
      id: "cr_gasfly_slider",
      name: "Gasfly Slider",
      type: "aid",
      weight: 0.3,
      value: 14,
      tags: ["food", "cooked"],
      mesh: "bagel",
      sound: "eat",
      effects: { hpOverTime: [30, 6] },
      desc: "Grilled gasfly on a split old-world bagel. The Lower East Side's answer to the question nobody asked.",
    },
    {
      id: "cr_tunnel_stew",
      name: "Tunnel Stew",
      type: "aid",
      weight: 1,
      value: 22,
      tags: ["food", "cooked"],
      mesh: "can_chowder",
      sound: "eat",
      effects: { hpOverTime: [50, 10], duration: 180, attrs: { grit: 1 } },
      desc: "Burrow rat, a tin of Mama Marinara's and boiled river water, simmered in a hubcap the way the subway track crews made it. Sticks to the ribs, and to the pot.",
    },
    {
      id: "cr_bowery_knish",
      name: "Bowery Knish",
      type: "aid",
      weight: 0.3,
      value: 9,
      tags: ["food", "cooked"],
      mesh: "pretzel",
      sound: "eat",
      effects: { hpOverTime: [18, 5] },
      desc: "Crushed Saratoga Chips and shredded Golden Plain Jerky folded into a fried dough pocket. Twenty-two years after the bombs, still the best thing on Delancey Street.",
    },
    // campfire remedies (Survival recipes)
    {
      id: "cr_bitter_tonic",
      name: "Bitterroot Tonic",
      type: "aid",
      weight: 0.5,
      value: 20,
      tags: ["medical", "drink"],
      mesh: "bottle_small",
      sound: "drink",
      effects: { hpOverTime: [70, 12] },
      desc: "A dark tonic of ashbloom and knotroot in boiled water. Tastes like punishment, heals like a promise.",
    },
    {
      id: "cr_fungus_tea",
      name: "Tunnel-Fungus Tea",
      type: "aid",
      weight: 0.5,
      value: 25,
      tags: ["medical", "drink"],
      mesh: "mug",
      sound: "drink",
      effects: { radsOverTime: [-60, 20] },
      desc: "Grey cap mushrooms steeped in purified water. The old-timers who live along the IRT swear it pulls the glow out of your bones. It certainly pulls something out.",
    },
    {
      id: "cr_stevedore_brew",
      name: "Stevedore's Brew",
      type: "aid",
      weight: 0.5,
      value: 35,
      tags: ["chem", "drink"],
      mesh: "bottle_beer",
      sound: "drink",
      effects: {
        hpOverTime: [20, 8],
        dr: 8,
        duration: 240,
        attrs: { brawn: 1 },
      },
      desc: "Warm beer, grey cap and mashed gnarlberry, shaken until it foams. The longshoremen of the Hudson piers swear by it. Makes you tougher, braver and much louder.",
    },
  ];

  // ------------------------------------------------------------------
  // Our recipes. station: workbench | campfire; tab: workshop | chemistry |
  // cooking | remedies. req = skill gates (rpg skill ids). xp per craft.
  // ------------------------------------------------------------------
  const R = (id, station, tab, makes, n, parts, req, xp, art, note) => ({
    id,
    station,
    tab,
    makes,
    n,
    parts,
    req: req || {},
    xp: xp || 0,
    art,
    note,
  });
