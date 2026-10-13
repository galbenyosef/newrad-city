// play-inline-474 01 — tags
// Lines 7-354 of readable/play-inline-474.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const M = (d) => G.items.define(Object.assign({ type: "misc" }, d));
  const J = (d) =>
    G.items.define(Object.assign({ type: "junk", tags: ["junk"] }, d));
  const K = (d) =>
    G.items.define(
      Object.assign(
        {
          type: "key",
          weight: 0,
          value: 0,
          tags: ["key"],
          mesh: "key",
          noLoot: true,
        },
        d,
      ),
    );

  // ---------------------------------------------------------------
  // Currency & valuables
  // ---------------------------------------------------------------
  M({
    id: "scrip",
    name: "Ration Scrip",
    weight: 0,
    value: 1,
    tags: ["currency"],
    mesh: "scrip",
    noLoot: true,
    desc: 'Federal ration scrip: folded paper notes printed by the Office of Civil Defense in 1966 "for use in a national emergency." The emergency came. The notes stayed. Every trader in the city takes them.',
  });
  M({
    id: "old_dollars",
    name: "Old-World Dollars",
    weight: 0,
    value: 10,
    tags: ["valuable"],
    mesh: "money",
    desc: "A crisp stack of U.S. dollars. Worth less than scrip, because scrip at least promises a can of beans. Makes decent kindling.",
  });
  M({
    id: "gold_bar",
    name: "Gold Bar",
    weight: 5,
    value: 500,
    tags: ["valuable", "rare"],
    mesh: "gold_bar",
    lootWeight: 0.05,
    desc: "A Federal Reserve gold bar from the vaults under Liberty Street. Heavy, gleaming, and still, somehow, worth killing for.",
  });

  // ---------------------------------------------------------------
  // Electronic components & valuables (repair / quests / barter)
  // ---------------------------------------------------------------
  J({
    id: "dry_cell",
    name: "Dry Cell Battery",
    weight: 1,
    value: 30,
    tags: ["junk", "electronic"],
    mesh: "battery",
    desc: "A brick-sized six-volt lantern battery with brass screw terminals. Half the gadgets in the ruins will run off one, briefly.",
  });
  J({
    id: "relay_board",
    name: "Relay Board",
    weight: 0.5,
    value: 40,
    tags: ["junk", "electronic"],
    mesh: "sensor",
    desc: "A circuit board of clicking relays and a photo-eye, salvaged from a robot, a turret or a very fancy elevator.",
  });
  J({
    id: "scrap_electronics",
    name: "Scrap Electronics",
    weight: 1,
    value: 25,
    tags: ["junk", "electronic"],
    mesh: "electronics",
    desc: "A tangle of circuit boards, wire and solder that once did something clever.",
  });
  J({
    id: "vacuum_tube",
    name: "Vacuum Tube",
    weight: 0.2,
    value: 12,
    tags: ["junk", "electronic"],
    mesh: "tube",
    desc: "A glass thermionic valve. The old world ran on these, and so do most of its robots.",
  });
  J({
    id: "conductor",
    name: "Conductor",
    weight: 0.2,
    value: 8,
    tags: ["junk", "electronic"],
    mesh: "conductor",
    desc: "A copper conductor coil. Useful for fixing radios and, reportedly, ray guns.",
  });
  J({
    id: "microscope",
    name: "Microscope",
    weight: 3,
    value: 25,
    tags: ["junk", "science"],
    mesh: "microscope",
    desc: "A brass lab microscope from Columbia University. Its lenses have seen the smallest things in the world; now they see the Ruins.",
  });
  J({
    id: "gas_igniter",
    name: "Gas Igniter",
    weight: 0.5,
    value: 6,
    tags: ["junk"],
    mesh: "pilot_light",
    desc: "A gas stove igniter assembly. Every self-respecting flamer enthusiast has three.",
  });
  J({
    id: "surgical_tubing",
    name: "Surgical Tubing",
    weight: 0.2,
    value: 5,
    tags: ["junk", "medical"],
    mesh: "junk_rubber",
    desc: "Rubber tubing from a hospital supply room. Stretchy. Useful. Slightly sticky.",
  });
  J({
    id: "scrap_metal",
    name: "Scrap Metal",
    weight: 1,
    value: 2,
    tags: ["junk", "metal"],
    mesh: "scrap",
    desc: "Twisted pieces of steel, the building blocks of every shack, wall and weapon in the city.",
  });
  J({
    id: "duct_tape",
    name: "Duct Tape",
    weight: 0.2,
    value: 6,
    tags: ["junk", "tool"],
    mesh: "tape",
    desc: "Holds the city together. Literally, in some settlements.",
  });
  J({
    id: "tuff_bond",
    name: "Tuff-Bond Glue",
    weight: 0.2,
    value: 8,
    tags: ["junk", "tool"],
    mesh: "bottle_small",
    desc: "Two-part epoxy in a pair of squeeze tubes. The lids are permanently glued on, which is its own kind of endorsement.",
  });
  J({
    id: "homeguard_cleanser",
    name: "Homeguard Cleanser",
    weight: 1,
    value: 6,
    tags: ["junk", "chemical"],
    mesh: "can_homeguard",
    desc: 'A tall canister of Homeguard scouring powder with a red, white and blue shield on the label. "Defending the American kitchen." Caustic enough to strip paint and, mixed right, a good deal more.',
  });
  J({
    id: "turpentine",
    name: "Turpentine",
    weight: 1,
    value: 5,
    tags: ["junk", "chemical"],
    mesh: "can_paint",
    desc: "A can of paint thinner from a Greenwich Village art studio. Flammable, pungent, and good for cleaning up mistakes.",
  });
  J({
    id: "lighter",
    name: "Lighter",
    weight: 0.2,
    value: 4,
    tags: ["junk"],
    mesh: "lighter",
    desc: 'A chrome flip-top lighter engraved "To J., from Coney, \'64." Still sparks.',
  });

  // ---------------------------------------------------------------
  // Household junk
  // ---------------------------------------------------------------
  J({
    id: "tin_can",
    name: "Tin Can",
    weight: 0.5,
    value: 0,
    tags: ["junk", "household"],
    mesh: "can_empty",
    desc: "An empty tin can. The contents are long gone. So is the label.",
  });
  J({
    id: "bent_tin_can",
    name: "Bent Tin Can",
    weight: 0.5,
    value: 0,
    tags: ["junk", "household"],
    mesh: "can_empty",
    desc: "A crushed tin can. Somebody really didn't like whatever was in it.",
  });
  J({
    id: "empty_fizzo_bottle",
    name: "Empty Fizzo Bottle",
    weight: 1,
    value: 0,
    tags: ["junk", "household"],
    mesh: "bottle_empty",
    desc: "A tall ribbed Fizzo Cola bottle, empty. Water sellers pay for these in bulk.",
  });
  J({
    id: "empty_whiskey_bottle",
    name: "Empty Whiskey Bottle",
    weight: 1,
    value: 0,
    tags: ["junk", "household"],
    mesh: "bottle_empty",
    desc: "The saddest thing in the city is an empty bottle of whiskey. The second saddest is you, looking at it.",
  });
  J({
    id: "milk_bottle",
    name: "Milk Bottle",
    weight: 1,
    value: 1,
    tags: ["junk", "household"],
    mesh: "bottle_milk_empty",
    desc: "A glass milk bottle from the milkman who used to deliver on the Upper West Side. He never finished his route.",
  });
  J({
    id: "coffee_mug",
    name: "Coffee Mug",
    weight: 1,
    value: 1,
    tags: ["junk", "household"],
    mesh: "mug",
    desc: 'A diner mug with a chipped rim and a faded "I ♥ NY" print. The heart has lasted better than the city.',
  });
  J({
    id: "plate",
    name: "Plate",
    weight: 1,
    value: 1,
    tags: ["junk", "household"],
    mesh: "plate",
    desc: "A melamine dinner plate, pastel green. Unbreakable, as advertised.",
  });
  J({
    id: "cooking_pan",
    name: "Cooking Pan",
    weight: 3,
    value: 3,
    tags: ["junk", "household"],
    mesh: "pan",
    desc: "A cast-iron skillet. Fries eggs, blocks bullets, settles arguments.",
  });
  J({
    id: "fork",
    name: "Fork",
    weight: 0.2,
    value: 1,
    tags: ["junk", "household"],
    mesh: "fork",
    desc: "A stainless steel dinner fork. One of the tines is bent from something you don't want to know about.",
  });
  J({
    id: "clipboard",
    name: "Clipboard",
    weight: 1,
    value: 2,
    tags: ["junk", "office"],
    mesh: "clipboard",
    desc: 'A clipboard holding a Civil Defense form: "List all members of your household eligible for shelter assignment."',
  });
  J({
    id: "pencil",
    name: "Pencil",
    weight: 0,
    value: 1,
    tags: ["junk", "office"],
    mesh: "junk_wood",
    desc: "A yellow No. 2 pencil, freshly sharpened by someone who never got to take their exam.",
  });
  J({
    id: "typewriter",
    name: "Typewriter",
    weight: 8,
    value: 12,
    tags: ["junk", "office"],
    mesh: "typewriter",
    desc: 'A heavy office typewriter from a Madison Avenue ad agency. Its last sheet reads "Fizzo Cola: the taste of tomorr".',
  });
  J({
    id: "ashtray",
    name: "Ashtray",
    weight: 1,
    value: 1,
    tags: ["junk", "household"],
    mesh: "ashtray",
    desc: "A glass ashtray stolen from a Times Square lounge. Still holds one very old cigarette butt.",
  });
  J({
    id: "cigarettes",
    name: "Cigarettes",
    weight: 0.1,
    value: 5,
    tags: ["junk", "valuable"],
    mesh: "cig_pack",
    desc: "A pack of Silver Torch king-size filter tips, the silver foil gone dull. Nobody smokes them (the paper is dust) but everyone trades them.",
  });
  J({
    id: "cigarette_carton",
    name: "Carton of Cigarettes",
    weight: 1,
    value: 25,
    tags: ["junk", "valuable"],
    mesh: "cig_carton",
    desc: 'A carton of Silver Torch, ten packs of king-size filter tips still in their cellophane. "Light up like the lady in the harbor." Better than scrip on the Lower East Side.',
  });
  J({
    id: "toy_car",
    name: "Toy Car",
    weight: 0.5,
    value: 1,
    tags: ["junk", "toy"],
    mesh: "toy_car",
    desc: "A die-cast station wagon with working wheels. More reliable than the real thing.",
  });
  J({
    id: "teddy_bear",
    name: "Teddy Bear",
    weight: 1,
    value: 1,
    tags: ["junk", "toy"],
    mesh: "teddy",
    desc: "A threadbare teddy bear with one button eye. It has been waiting for someone to come home for a very long time.",
  });
  J({
    id: "lunchbox",
    name: "Lunchbox",
    weight: 1,
    value: 4,
    tags: ["junk", "toy"],
    mesh: "lunchbox",
    desc: 'A tin lunchbox with Super Sergeant on the lid, fist raised against the sky. Empty, except for a note that says "love, Mom."',
  });
