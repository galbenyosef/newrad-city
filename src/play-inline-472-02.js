// play-inline-472 02 — desc
// Lines 375-715 of readable/play-inline-472.pretty.js (statement-aligned).
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
