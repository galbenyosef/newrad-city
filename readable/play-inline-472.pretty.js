/* src/rpg/10_items_aid.js */
/* =====================================================================
 * NEW RAD CITY — RPG MODULE — AID DATABASE
 * Medical supplies, chems, drinks and food. All brands and flavour text
 * are original.
 *
 * effects schema (consumed by G.rpg.applyAid):
 *   hp               instant heal (medical items scale with Medicine)
 *   hpOverTime       [amount, seconds] (food/drink heal slowly)
 *   rads             + adds rads (irradiated food), − removes rads
 *   radsOverTime     [amount, seconds] (Prussian Blue)
 *   healOverTime     [amount, seconds] medical heal over time, scaled by Medicine (Rally Tonic)
 *   limbsOverTime    [amount, seconds] limb mending over time (Rally Tonic)
 *   sway             0..1 camera / aim sway while the over-time heal works (Rally Tonic)
 *   stamina          instant sprint stamina
 *   limbs            heal amount applied to every limb at once (field surgery kit)
 *   duration         seconds (world time) for the timed modifiers below
 *   radResist, dr, dmgMult, critChance, carry, staminaRegenMult, speedMult, sneak, reloadMult
 *   attrs {brawn:+2...}, skills {firearms:+10...}
 *   addiction        {chance, id, name, withdrawal:{attrs, skills}}
 *   cureAddiction    true (Clean Slate)
 *   after            {name, duration, attrs}: comedown after the effect ends
 *   shade            true (shade field)
 * ===================================================================== */
(function () {
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
  D({
    id: "beer",
    name: "Empire Brew House Lager",
    weight: 1,
    value: 2,
    tags: ["drink", "alcohol"],
    mesh: "bottle_beer",
    sound: "drink",
    effects: {
      hp: 5,
      duration: 120,
      attrs: { brawn: 1, presence: 1, wits: -1 },
      addiction: habit("alcohol", "Drinking", 0.05, {
        presence: -1,
        reflex: -1,
      }),
    },
    desc: 'A brown bottle of Empire Brew House lager, "Brewed in Brooklyn. Poured everywhere." The Bushwick brewery stopped pouring in March of \'67; the bottles kept their word a while longer. Flat, warm, and still the beer every bar in the city asks for by name.',
  });
  D({
    id: "whiskey",
    name: "Whiskey",
    weight: 1,
    value: 10,
    tags: ["drink", "alcohol"],
    mesh: "bottle_whiskey",
    sound: "drink",
    effects: {
      hp: 5,
      duration: 180,
      attrs: { brawn: 2, presence: 1, wits: -1 },
      addiction: habit("alcohol", "Drinking", 0.05, {
        presence: -1,
        reflex: -1,
      }),
    },
    desc: "Rye from before the bombs, aged twenty-two years longer than the distiller intended. Smooth as a bulldozer.",
  });
  D({
    id: "scotch",
    name: "Scotch",
    weight: 1,
    value: 10,
    tags: ["drink", "alcohol"],
    mesh: "bottle_scotch",
    sound: "drink",
    effects: {
      hp: 5,
      duration: 180,
      attrs: { brawn: 1, presence: 2, wits: -1 },
      addiction: habit("alcohol", "Drinking", 0.05, {
        presence: -1,
        reflex: -1,
      }),
    },
    desc: "The good stuff, from a Park Avenue liquor cabinet. Tastes like peat smoke and money.",
  });
  D({
    id: "vodka",
    name: "Vodka",
    weight: 1,
    value: 10,
    tags: ["drink", "alcohol"],
    mesh: "bottle_vodka",
    sound: "drink",
    effects: {
      hp: 5,
      duration: 180,
      attrs: { brawn: 1, presence: 1, reflex: -1 },
      addiction: habit("alcohol", "Drinking", 0.05, {
        presence: -1,
        reflex: -1,
      }),
    },
    desc: "Clear, strong and cold as a Hudson winter. Doubles as a disinfectant, degreaser and conversation starter.",
  });
  D({
    id: "wine",
    name: "Wine",
    weight: 1,
    value: 10,
    tags: ["drink", "alcohol"],
    mesh: "bottle_wine",
    sound: "drink",
    effects: {
      hp: 5,
      duration: 180,
      attrs: { presence: 2, senses: -1 },
      addiction: habit("alcohol", "Drinking", 0.05, {
        presence: -1,
        reflex: -1,
      }),
    },
    desc: "A 1966 vintage from the Finger Lakes. The last good year. Well, the last year.",
  });

  // ---------------------------------------------------------------
  // OLD-WORLD PACKAGED FOOD (irradiated, but shelf-stable forever)
  // ---------------------------------------------------------------
  D({
    id: "golden_plain_jerky",
    name: "Golden Plain Jerky",
    weight: 0.5,
    value: 6,
    tags: ["food", "oldworld_food"],
    mesh: "bag_jerky",
    sound: "eat",
    effects: { hpOverTime: [12, 5], rads: 3 },
    desc: 'Thick-cut, hickory-smoked beef jerky from Omaha in a kraft-paper bag with a lone rider on the label. "Tough enough for any trail." Twenty-two years on, it still is.',
  });
  D({
    id: "freedom_flakes",
    name: "Freedom Flakes",
    weight: 1,
    value: 7,
    tags: ["food", "oldworld_food"],
    mesh: "box_flakes",
    sound: "eat",
    effects: { hpOverTime: [15, 5], rads: 5 },
    desc: 'Sugar-frosted golden corn flakes from the Brooklyn Sugar Works, in a red, white and blue box. "The breakfast of a free nation." Best with cold milk, which nobody has had in a very long time.',
  });
  D({
    id: "chocolate_zeppelin",
    name: "Chocolate Zeppelin",
    weight: 0.5,
    value: 7,
    tags: ["food", "oldworld_food"],
    mesh: "wrap_zeppelin",
    sound: "eat",
    effects: { hpOverTime: [12, 5], rads: 4 },
    desc: 'A chocolate snack cake shaped like an airship, with a vanilla-cream filling, foil-wrapped by the National Biscuit Co. in Chelsea. "Lighter than air. Sweeter than pie." The foil kept its promise.',
  });
  D({
    id: "mama_marinara_meatballs",
    name: "Mama Marinara's Instant Meatballs",
    weight: 1,
    value: 7,
    tags: ["food", "oldworld_food"],
    mesh: "can_marinara",
    sound: "eat",
    effects: { hpOverTime: [18, 5], rads: 5 },
    desc: 'Dehydrated beef meatballs and marinara powder in a red tin. "Just add water. Mama will never know." Add any water you can find and give it five minutes; it tastes like a Sunday that never came.',
  });
  D({
    id: "franks_and_beans",
    name: "Franks & Beans",
    weight: 1,
    value: 5,
    tags: ["food", "oldworld_food"],
    mesh: "can_beans",
    sound: "eat",
    effects: { hpOverTime: [15, 5], rads: 5 },
    desc: "Baked beans in molasses sauce with coins of frankfurter, the official supper of every Boy Scout jamboree.",
  });
  D({
    id: "frank_in_a_bun",
    name: "Frank-in-a-Bun",
    weight: 0.5,
    value: 8,
    tags: ["food", "oldworld_food"],
    mesh: "wrap_frank",
    sound: "eat",
    effects: { hpOverTime: [16, 5], rads: 4 },
    desc: 'A Forever Franks frank in a soft bun with a stripe of mustard, sealed in a clear sleeve "fresh with Miracle-Keep." The little top-hat frank on the sticker still promises they are so good they\'ll outlive you.',
  });
  D({
    id: "salisbury_steak",
    name: "Salisbury Steak",
    weight: 1,
    value: 7,
    tags: ["food", "oldworld_food"],
    mesh: "box_tvdinner",
    sound: "eat",
    effects: { hpOverTime: [20, 5], rads: 5 },
    desc: "A frozen TV dinner that thawed in March of '67 and has been waiting patiently ever since.",
  });
  D({
    id: "saratoga_chips",
    name: "Saratoga Chips",
    weight: 0.5,
    value: 4,
    tags: ["food", "oldworld_food"],
    mesh: "bag_crisps",
    sound: "eat",
    effects: { hpOverTime: [6, 3], rads: 3 },
    desc: "Thin-cut potato chips in a waxed paper bag. Extra-crunchy. Twenty-two years extra.",
  });
  D({
    id: "astronaut_ice_cream",
    name: "Astronaut Ice Cream",
    weight: 0.1,
    value: 9,
    tags: ["food", "oldworld_food"],
    mesh: "pouch_astro",
    sound: "eat",
    effects: { hpOverTime: [8, 4], stamina: 15, rads: 1 },
    desc: 'A foil pouch of freeze-dried Neapolitan from the Junior Rocketeer Co.: strawberry, vanilla and chocolate, crisp as meringue. "Real science. Real rockets." No spoon, no freezer, no melting, ever.',
  });
  D({
    id: "cinnamon_bun",
    name: "Cinnamon Bun",
    weight: 0.5,
    value: 5,
    tags: ["food", "oldworld_food"],
    mesh: "sweet_roll",
    sound: "eat",
    effects: { hpOverTime: [15, 5], rads: 1 },
    desc: "A glazed bun from a Civil Defense ration crate, wrapped in wax paper. Stale enough to drive a nail.",
  });
  D({
    id: "licorice_twists",
    name: "Licorice Twists",
    weight: 0.1,
    value: 2,
    tags: ["food", "oldworld_food"],
    mesh: "bag_small",
    sound: "eat",
    lootWeight: 0.6,
    effects: { hpOverTime: [5, 3], rads: 1 },
    desc: "Red licorice ropes in a paper twist from a candy store counter. Excellent for bribing children and old men alike.",
  });
  D({
    id: "bubblegum",
    name: "Bubblegum",
    weight: 0,
    value: 2,
    tags: ["food", "oldworld_food"],
    mesh: "bag_small",
    sound: "eat",
    lootWeight: 0.6,
    effects: { hpOverTime: [2, 2] },
    desc: "Pink, stiff and older than some of the people chewing it. Still somehow chewable.",
  });
  D({
    id: "dog_chow",
    name: "Canned Dog Chow",
    weight: 1,
    value: 3,
    tags: ["food", "oldworld_food"],
    mesh: "can_dog",
    sound: "eat",
    effects: { hpOverTime: [5, 5], rads: 5 },
    desc: "Beef-flavoured chunks for your best friend. Desperation is also your best friend.",
  });
  D({
    id: "chow_mein_cup",
    name: "Chow Mein Cup",
    weight: 0.5,
    value: 6,
    tags: ["food", "oldworld_food"],
    mesh: "noodle_cup",
    sound: "eat",
    effects: { hpOverTime: [12, 5], rads: 2 },
    desc: 'Dried noodles in a waxed cup from a Mott Street grocer. The flavour packet is labelled only "SAVORY."',
  });

  // ---------------------------------------------------------------
  // NEW YORK STREET FOOD
  // ---------------------------------------------------------------
  D({
    id: "bodega_pretzel",
    name: "Petrified Pretzel",
    weight: 0.5,
    value: 4,
    tags: ["food", "oldworld_food"],
    mesh: "pretzel",
    sound: "eat",
    effects: { hpOverTime: [6, 4], rads: 3 },
    desc: "A salted street-cart pretzel the blast baked into something between bread and granite. Gnaw carefully.",
  });
  D({
    id: "coney_dog",
    name: "Coney Island Dog",
    weight: 0.5,
    value: 8,
    tags: ["food"],
    mesh: "hot_dog",
    sound: "eat",
    effects: { hpOverTime: [18, 6], rads: 4 },
    desc: 'A "hot dog" from a Grand Central food cart. The vendor insists the name is merely traditional. He will not look you in the eye.',
  });
  D({
    id: "shellback_chowder",
    name: "Manhattan Shellback Chowder",
    weight: 1,
    value: 20,
    tags: ["food", "cooked"],
    mesh: "can_chowder",
    sound: "eat",
    effects: { hpOverTime: [35, 8], rads: 2 },
    desc: "Red, tomato-based and fiercely defended by the settlers of Battery Park as the only correct chowder. Contains shell.",
  });
  D({
    id: "old_world_bagel",
    name: "Old-World Bagel",
    weight: 0.5,
    value: 4,
    tags: ["food", "oldworld_food"],
    mesh: "bagel",
    sound: "eat",
    effects: { hpOverTime: [8, 4], rads: 3 },
    desc: "An everything bagel. Everything, in this case, now includes strontium-90.",
  });
  D({
    id: "egg_cream",
    name: "Egg Cream",
    weight: 1,
    value: 10,
    tags: ["drink"],
    mesh: "bottle_milk",
    sound: "drink",
    lootWeight: 0.5,
    effects: { hpOverTime: [15, 5], rads: 2 },
    desc: "A Brooklyn soda-fountain classic: chocolate syrup, seltzer and milk. There has never been egg in it. There has never been a reason.",
  });

  // ---------------------------------------------------------------
  // MEAT & FORAGE FROM THE RUINS
  // ---------------------------------------------------------------
  D({
    id: "pigeon_on_a_stick",
    name: "Pigeon on a Stick",
    weight: 0.5,
    value: 6,
    tags: ["food", "cooked"],
    mesh: "meat_stick",
    sound: "eat",
    effects: { hpOverTime: [18, 5] },
    desc: "A plump city pigeon, plucked and roasted on a curtain rod. The pigeons survived the bombs. This one did not survive lunch.",
  });
  D({
    id: "tunnel_rat_skewer",
    name: "Tunnel Rat Skewer",
    weight: 0.5,
    value: 6,
    tags: ["food", "cooked"],
    mesh: "meat_stick",
    sound: "eat",
    effects: { hpOverTime: [14, 5] },
    desc: "Subway rat, charred over a trash-can fire and sold by the Lexington line kids for two scrip. Tastes like chicken, if the chicken lived in a sewer.",
  });
  D({
    id: "roach_meat",
    name: "Roach Meat",
    weight: 0.5,
    value: 3,
    tags: ["food", "meat", "irradiated"],
    mesh: "meat",
    sound: "eat",
    meatColor: 0x7a5a3a,
    effects: { hpOverTime: [5, 4], rads: 5 },
    desc: "A chunk of giant cockroach. Crunchy on the outside, creamy on the inside, horrifying throughout.",
  });
  D({
    id: "burrow_rat_meat",
    name: "Burrow Rat Meat",
    weight: 1,
    value: 4,
    tags: ["food", "meat", "irradiated"],
    mesh: "meat",
    sound: "eat",
    meatColor: 0xa04a3a,
    effects: { hpOverTime: [10, 5], rads: 5 },
    desc: "Tough, stringy and hairy in places. A staple of the subway tunnel diet.",
  });
  D({
    id: "gasfly_meat",
    name: "Gasfly Meat",
    weight: 0.5,
    value: 3,
    tags: ["food", "meat", "irradiated"],
    mesh: "meat",
    sound: "eat",
    meatColor: 0x9a8a5a,
    effects: { hpOverTime: [10, 5], rads: 5 },
    desc: "A slab of gasfly abdomen with the gas sac carefully cut away. Mostly carefully.",
  });
  D({
    id: "shellback_meat",
    name: "Shellback Meat",
    weight: 1,
    value: 10,
    tags: ["food", "meat", "irradiated"],
    mesh: "meat",
    sound: "eat",
    meatColor: 0xc86a4a,
    effects: { hpOverTime: [20, 5], rads: 5 },
    desc: "Sweet, pale meat pried out from under a shellback's carapace. Tastes of the harbour, which is not a compliment.",
  });
  D({
    id: "shellback_cakes",
    name: "Shellback Cakes",
    weight: 0.5,
    value: 15,
    tags: ["food", "cooked"],
    mesh: "cakes",
    sound: "eat",
    effects: { hpOverTime: [40, 8] },
    desc: "Pan-fried shellback patties from a Battery Park cook fire. Honestly? Delicious.",
  });
  D({
    id: "dog_meat",
    name: "Dog Meat",
    weight: 1,
    value: 5,
    tags: ["food", "meat", "irradiated"],
    mesh: "meat",
    sound: "eat",
    meatColor: 0x9a3a2a,
    effects: { hpOverTime: [15, 5], rads: 5 },
    desc: "Meat from a wild city dog. You try very hard not to think about Biscuit.",
  });
  D({
    id: "ox_meat",
    name: "Ox Meat",
    weight: 1,
    value: 8,
    tags: ["food", "meat"],
    mesh: "meat",
    sound: "eat",
    meatColor: 0xb04030,
    effects: { hpOverTime: [20, 5], rads: 3 },
    desc: "Raw meat from a pack ox that will not be hauling anything again.",
  });
  D({
    id: "ox_steak",
    name: "Ox Steak",
    weight: 1,
    value: 15,
    tags: ["food", "cooked"],
    mesh: "steak",
    sound: "eat",
    effects: { hpOverTime: [35, 6] },
    desc: "Grilled over a trash-can fire and seasoned with ash. The best steakhouse left on Fifth Avenue.",
  });
  D({
    id: "ripjaw_steak",
    name: "Ripjaw Steak",
    weight: 1,
    value: 60,
    tags: ["food", "cooked"],
    mesh: "steak",
    sound: "eat",
    lootWeight: 0.2,
    effects: { hpOverTime: [60, 8], duration: 180, attrs: { grit: 1 } },
    desc: "The rarest dish in the city, because the ingredients fight back. Dark, gamy and deeply satisfying.",
  });
  D({
    id: "ripjaw_meat",
    name: "Ripjaw Meat",
    weight: 2,
    value: 40,
    tags: ["food", "meat", "irradiated"],
    mesh: "meat",
    sound: "eat",
    meatColor: 0x8a2a20,
    lootWeight: 0.2,
    effects: { hpOverTime: [40, 6], rads: 6 },
    desc: "A slab of raw ripjaw cut from under the armour plates. Proof of either great skill or great luck.",
  });
  D({
    id: "brute_hound_meat",
    name: "Brute Hound Meat",
    weight: 1,
    value: 8,
    tags: ["food", "meat", "irradiated"],
    mesh: "meat",
    sound: "eat",
    meatColor: 0x6a5a7a,
    lootWeight: 0.5,
    effects: { hpOverTime: [15, 5], rads: 12 },
    desc: "Grey-violet meat from one of the hounds the Brutes keep. Tingles on the tongue in a way meat should not.",
  });
  D({
    id: "grey_cap",
    name: "Grey Cap",
    weight: 0.2,
    value: 4,
    tags: ["food", "forage"],
    mesh: "fungus",
    sound: "eat",
    effects: { hpOverTime: [4, 3], rads: 5, duration: 60, attrs: { wits: 1 } },
    desc: "A wrinkled grey mushroom that grows in the damp of the subway tunnels. Tastes like thinking.",
  });
  D({
    id: "glowcap",
    name: "Glowcap",
    weight: 0.2,
    value: 6,
    tags: ["food", "forage", "irradiated"],
    mesh: "fungus_glow",
    sound: "eat",
    effects: { hpOverTime: [10, 3], rads: 15 },
    desc: "Luminous mushrooms harvested from the walls of flooded basements. A reading lamp you can eat. Please don't.",
  });
  D({
    id: "gnarlberry",
    name: "Gnarlberry",
    weight: 0.2,
    value: 8,
    tags: ["food", "forage"],
    mesh: "gnarlberry",
    sound: "eat",
    effects: { hpOverTime: [10, 4], rads: 2 },
    desc: "A knobbly purple berry the size of a plum, grown on the rooftop gardens of Grand Central. Sweet, seedy, mostly safe.",
  });
  D({
    id: "ruins_omelet",
    name: "Ruins Omelet",
    weight: 0.5,
    value: 25,
    tags: ["food", "cooked"],
    mesh: "cakes",
    sound: "eat",
    lootWeight: 0.4,
    effects: { hpOverTime: [45, 8], duration: 120, attrs: { grit: 1 } },
    desc: "Scrambled shellback egg on a hubcap. Hearty enough to walk the length of Broadway on.",
  });
})();
