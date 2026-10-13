// play-inline-472 01 — desc
// Lines 26-374 of readable/play-inline-472.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const D = (d) => G.items.define(Object.assign({ type: "aid" }, d));
  const habit = (id, name, chance, attrs) => ({
    chance,
    id,
    name: name + " Habit",
    withdrawal: { attrs },
  });

  // ---------------------------------------------------------------
  // MEDICAL
  // ---------------------------------------------------------------
  // Rally Tonic: a patent-medicine bottle. Heals over a few seconds (scaled by Medicine), mends limbs as it goes,
  // and leaves the world swaying gently while it works (G.rpg tonic sway, see 30_rpg_core.js).
  D({
    id: "rally_tonic",
    name: "Rally Tonic",
    weight: 0.2,
    value: 25,
    tags: ["medical", "tonic"],
    mesh: "rally_tonic",
    sound: "tonic",
    effects: { healOverTime: [30, 7], limbsOverTime: [30, 7], sway: 0.55 },
    desc: "\"Doctor recommended!\" A brown bottle of Dr. Halloran's Rally Tonic, the Civil Defense first-aid cabinet's favourite friend: knits flesh, settles limbs and restores the vital spirits within seconds. Twenty-two percent alcohol, for flavour. The room may waltz a little while it works.",
  });
  D({
    id: "rally_tonic_extra",
    name: "Rally Tonic Extra",
    weight: 0.25,
    value: 75,
    tags: ["medical", "tonic"],
    mesh: "rally_tonic_extra",
    sound: "tonic",
    effects: {
      healOverTime: [100, 8],
      limbsOverTime: [60, 8],
      sway: 1,
      after: { name: "Tonic Head", duration: 60, attrs: { reflex: -1 } },
    },
    desc: 'Extra Strength, in the square bottle with the gold foil collar: "For the Man Who Cannot Afford to Be Laid Up!" It closes wounds while you watch, and for the next minute you will walk like the Saturday-night end of a wedding.',
  });
  // Prussian Blue: the real ferric-ferrocyanide capsule. Binds radioactive caesium in the gut and carries it out, slowly.
  D({
    id: "prussian_blue",
    name: "Prussian Blue",
    weight: 0.1,
    value: 20,
    tags: ["medical"],
    mesh: "prussian_blue",
    sound: "iodine_tabs",
    effects: { radsOverTime: [-150, 60] },
    desc: "A brown pharmacy bottle of Prussian Blue capsules from the Office of Civil Defense stockpile, the same blue that painters have used for two hundred years. Swallowed, it binds radiation in the gut and carries it out over the next minute. Your insides will be a fashionable shade of navy.",
  });
  D({
    id: "iodine_tabs",
    name: "Iodine Tabs",
    weight: 0,
    value: 20,
    tags: ["medical"],
    mesh: "pills_orange",
    sound: "eat",
    effects: { radResist: 25, duration: 240 },
    desc: "Potassium iodide tablets in a Civil Defense blister pack. Take two before walking into a hot zone. They taste like a swimming pool.",
  });
  D({
    id: "field_surgery_kit",
    name: "Field Surgery Kit",
    weight: 1,
    value: 50,
    tags: ["medical"],
    mesh: "field_kit",
    sound: "inject",
    effects: { limbs: 100 },
    desc: "A canvas roll of splints, clamps, plaster bandage and a curved needle. Mends every crippled limb, if you can keep your hands steady.",
  });
  D({
    id: "blood_pack",
    name: "Blood Pack",
    weight: 0.5,
    value: 20,
    tags: ["medical"],
    mesh: "bloodpack",
    sound: "drink",
    effects: { hp: 20, rads: 1 },
    desc: 'Plasma from a hospital blood bank, sealed before the bombs. The label says "Type: Probably."',
  });
  D({
    id: "root_poultice",
    name: "Root Poultice",
    weight: 0.1,
    value: 20,
    tags: ["medical"],
    mesh: "powder",
    sound: "eat",
    lootWeight: 0.5,
    effects: { hp: 25, duration: 30, attrs: { senses: -1 } },
    desc: "A paste of ground roots, moss and boiled bark wrapped in cheesecloth, made by the herb-women of the Inwood woods. Heals wounds, fogs the eyes.",
  });
  D({
    id: "clean_slate",
    name: "Clean Slate",
    weight: 0,
    value: 50,
    tags: ["medical", "chem"],
    mesh: "pills_white",
    sound: "eat",
    effects: { cureAddiction: true },
    desc: "A detox regimen from a Bellevue ward, three white pills in a paper envelope. Cures every habit you have. The next three hours are not pleasant.",
  });
  D({
    id: "shade_field",
    name: "Shade Field",
    weight: 1,
    value: 100,
    tags: ["medical", "tech"],
    mesh: "shade_field",
    sound: "hum_electric",
    effects: { shade: true, sneak: 100, duration: 30 },
    desc: "An experimental Army light-bending belt unit the size of a lunch pail. For thirty seconds, eyes slide right off you. Then it needs a new battery and you need a new hiding place.",
  });

  // ---------------------------------------------------------------
  // CHEMS
  // ---------------------------------------------------------------
  D({
    id: "morphine_syrette",
    name: "Morphine Syrette",
    weight: 0,
    value: 50,
    tags: ["chem"],
    mesh: "syrette",
    sound: "inject",
    effects: {
      dr: 25,
      duration: 240,
      addiction: habit("morphine", "Morphine", 0.1, { reflex: -1, senses: -1 }),
    },
    desc: "A squeeze-tube of morphine with a fold-down needle, Army issue. You stop feeling the wounds. You are still getting them.",
  });
  D({
    id: "rage",
    name: "Rage",
    weight: 0,
    value: 40,
    tags: ["chem"],
    mesh: "rage_inhaler",
    sound: "inject",
    effects: {
      dmgMult: 0.25,
      duration: 240,
      addiction: habit("rage", "Rage", 0.1, { wits: -1, grit: -1 }),
    },
    desc: "A red-capped inhaler of something cooked in a Bowery basement. Fear goes out, fury comes in, and your heart sounds like a kettle drum.",
  });
  D({
    id: "bull_tabs",
    name: "Bull Tabs",
    weight: 0,
    value: 20,
    tags: ["chem"],
    mesh: "pills_bull",
    sound: "eat",
    effects: {
      duration: 240,
      attrs: { brawn: 2, grit: 3 },
      addiction: habit("bull_tabs", "Bull Tabs", 0.1, { brawn: -1, grit: -1 }),
    },
    desc: "Chalky horse-pill steroids from a Coney Island strongman's locker. Every muscle swells; every joint complains about it later.",
  });
  D({
    id: "focus_pills",
    name: "Focus Pills",
    weight: 0,
    value: 20,
    tags: ["chem"],
    mesh: "focus_tin",
    sound: "eat",
    effects: {
      duration: 240,
      attrs: { wits: 2, senses: 2 },
      addiction: habit("focus_pills", "Focus Pills", 0.1, {
        wits: -1,
        senses: -1,
      }),
    },
    desc: "Peppermint-coated study aids in a hinged tin, the kind college boys passed around before finals. The world sharpens to a point.",
  });
  D({
    id: "rush",
    name: "Rush",
    weight: 0,
    value: 20,
    tags: ["chem"],
    mesh: "rush_inhaler",
    sound: "drink",
    effects: {
      stamina: 40,
      duration: 60,
      staminaRegenMult: 0.6,
      speedMult: 0.08,
      addiction: habit("rush", "Rush", 0.2, { reflex: -1 }),
    },
    desc: "Fumes from a dented aerosol can, cooked up in a Brooklyn garage. Your legs forget they were ever tired. Your nose bleeds a little.",
  });
  D({
    id: "overdrive",
    name: "Overdrive",
    weight: 0,
    value: 50,
    tags: ["chem"],
    mesh: "overdrive_canister",
    sound: "drink",
    effects: {
      stamina: 80,
      duration: 90,
      staminaRegenMult: 1,
      speedMult: 0.12,
      reloadMult: -0.15,
      addiction: habit("rush", "Rush", 0.25, { reflex: -1 }),
    },
    desc: "The Rush cooks' private reserve, in a canister warm to the touch. Everything around you slows to a crawl. You do not.",
  });
  D({
    id: "sunny_pills",
    name: "Sunny Pills",
    weight: 0,
    value: 25,
    tags: ["chem"],
    mesh: "pills_white",
    sound: "eat",
    effects: {
      duration: 240,
      attrs: { presence: 3, brawn: -2 },
      addiction: habit("sunny_pills", "Sunny Pills", 0.05, { presence: -1 }),
    },
    desc: 'Pastel mood tablets once advertised in ladies\' magazines as "a sunny afternoon in every bottle." Everyone is lovely. Everything is fine.',
  });
  D({
    id: "redline",
    name: "Redline",
    weight: 0,
    value: 30,
    tags: ["chem"],
    mesh: "rush_inhaler",
    sound: "drink",
    lootWeight: 0.6,
    effects: {
      stamina: 30,
      duration: 90,
      attrs: { reflex: 1 },
      addiction: habit("rush", "Rush", 0.15, { reflex: -1 }),
    },
    desc: "A Manhattan street mix of Rush cut with Fizzo syrup and something from a hardware store. Named for the needle on your pulse.",
  });

  // ---------------------------------------------------------------
  // DRINKS
  // ---------------------------------------------------------------
  D({
    id: "fizzo_cola",
    name: "Fizzo Cola",
    weight: 1,
    value: 20,
    tags: ["drink", "fizzo"],
    mesh: "bottle_fizzo",
    sound: "drink_fizzo",
    effects: { hp: 20, rads: 5 },
    desc: "America's sparkling cola, in the tall ribbed bottle you could pick out in the dark. It still fizzes after twenty-two years. Nobody asks why.",
  });
  D({
    id: "fizzo_cola_chilled",
    name: "Chilled Fizzo Cola",
    weight: 1,
    value: 25,
    tags: ["drink", "fizzo"],
    mesh: "bottle_fizzo_frost",
    sound: "drink_fizzo",
    effects: { hp: 30, rads: 5, stamina: 10 },
    desc: "A Fizzo Cola from a cooler that somehow still runs. Beads of cold water run down the ribs of the bottle.",
  });
  D({
    id: "fizzo_blue",
    name: "Fizzo Blue",
    weight: 1,
    value: 50,
    tags: ["drink", "fizzo", "caffeine"],
    mesh: "bottle_fizzo_blue",
    sound: "drink_fizzo",
    effects: { hp: 20, stamina: 40, rads: 10 },
    desc: 'The 1966 "space-age" flavour with double the sugar and triple the caffeine. It glows a faint blue, which the company said was "a fun food dye." Check under the crown cap.',
  });
  D({
    id: "fizzo_lime",
    name: "Fizzo Lime",
    weight: 1,
    value: 25,
    tags: ["drink", "fizzo"],
    mesh: "bottle_fizzo_lime",
    sound: "drink_fizzo",
    lootWeight: 0.6,
    effects: { hp: 25, rads: 5 },
    desc: "The summer flavour, sold only at ballparks and boardwalks. Tart, green and fiercely loyal fans.",
  });
  D({
    id: "prairie_root_beer",
    name: "Prairie Root Beer",
    weight: 1,
    value: 20,
    tags: ["drink"],
    mesh: "bottle_rootbeer",
    sound: "drink",
    effects: { hp: 20, rads: 2 },
    desc: 'Sarsaparilla and birch bark in a brown bottle with a covered wagon on the label. "Old-time flavor, poured cold." It hasn\'t been cold since 1967, and it is still good.',
  });
  D({
    id: "purified_water",
    name: "Purified Water",
    weight: 1,
    value: 20,
    tags: ["drink"],
    mesh: "bottle_water",
    sound: "drink",
    effects: { hp: 20 },
    desc: "Clean, clear, rad-free water. In New Rad City it's worth more than the Chrysler Building.",
  });
  D({
    id: "dirty_water",
    name: "Dirty Water",
    weight: 1,
    value: 5,
    tags: ["drink", "irradiated"],
    mesh: "bottle_dirty",
    sound: "drink",
    effects: { hp: 5, rads: 10 },
    desc: "Hudson River vintage. Faintly green, faintly fizzy, faintly moving.",
  });
  D({
    id: "ox_milk",
    name: "Ox Milk",
    weight: 1,
    value: 10,
    tags: ["drink"],
    mesh: "bottle_milk",
    sound: "drink",
    lootWeight: 0.6,
    effects: { hp: 10, rads: -10 },
    desc: "Milk from a scarred pack-ox cow out of a Jersey pasture. Traders swear it draws the radiation out of you. Traders swear a lot of things.",
  });
