// play-inline-503 01 — makes
// Lines 27-379 of readable/play-inline-503.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  const W = G.weapons;
  const P = W._;
  const S = P.state;

  S.schem = {}; // schematic id -> copies learned (1..3)
  S.mods = {}; // weapon id -> [mod item ids]

  const invReal = () => P.invReal();
  const count = (id) => {
    try {
      return invReal() ? G.inventory.count(id) || 0 : 0;
    } catch (e) {
      return 0;
    }
  };
  const itemName = (id) => {
    try {
      const d = !G.isStub("items") && G.items.get ? G.items.get(id) : null;
      return (
        (d && d.name) || (P.defs.get(id) || {}).name || id.replace(/_/g, " ")
      );
    } catch (e) {
      return id;
    }
  };
  const repairSkill = () => {
    try {
      return !G.isStub("rpg") && G.rpg && typeof G.rpg.skill === "function"
        ? G.rpg.skill("mechanics") || 0
        : 50;
    } catch (e) {
      return 50;
    }
  };
  const sfx = (name, fb, o) => P.snd(name, fb, o || { volume: 0.6 });
  const now = () => (G.time && G.time.elapsed) || 0;
  const CMB = () => (G.__cmb && typeof G.__cmb === "object" ? G.__cmb : null);
  const fxOk = () => !G.isStub("fx");

  // ------------------------------------------------------------------
  // Data: schematics (learned), workshop recipes (always known)
  // ------------------------------------------------------------------
  const SCHEM = {
    schematic_third_rail_shoe: {
      name: "Schematic - Third-Rail Shoe",
      makes: "third_rail_shoe",
      n: 1,
      repair: 0,
      parts: [
        ["scrap_metal", 2],
        ["conductor", 2],
        ["dry_cell", 1],
        ["duct_tape", 1],
      ],
      text: 'A Transit Authority track-crew diagram of a contact-shoe test rig, with "WEAPON?" pencilled in the margin and underlined three times by somebody else. Pole, insulators, shoe, a battery on a belt hook. "Do NOT touch the shoe and the rail at the same time."',
    },
    schematic_siren_horn: {
      name: "Schematic - Siren Horn",
      makes: "siren_horn",
      n: 1,
      repair: 0,
      parts: [
        ["dry_cell", 1],
        ["relay_board", 1],
        ["vacuum_tube", 1],
        ["scrap_metal", 3],
        ["cooking_pan", 1],
      ],
      text: 'Page 41 of a Civil Defense siren maintenance manual: rotor, stator, horn. Someone has redrawn the horn ten times smaller, added a pistol grip and written "AIM IT AT THEM, NOT THE SKY" across the exploded view.',
    },
    schematic_rivet_gun: {
      name: "Schematic - Rivet Gun",
      makes: "rivet_gun",
      n: 1,
      repair: 0,
      parts: [
        ["scrap_metal", 3],
        ["surgical_tubing", 1],
        ["gas_igniter", 1],
        ["conductor", 1],
        ["duct_tape", 1],
      ],
      text: 'A union hall handout from the Ironworkers\' local, "THE RIVETING GANG AND YOU", with a heater, a riveting hammer and an air bottle circled and joined by arrows. Bottom of the page: "catch it in the bucket, boys. Or don\'t."',
    },
    schematic_molotov: {
      name: "Schematic - Molotov Cocktail",
      makes: "molotov",
      n: 1,
      repair: 0,
      parts: [
        ["empty_whiskey_bottle", 1],
        ["turpentine", 1],
        ["duct_tape", 1],
      ],
      text: 'A riot-control lecture card from the Continuity\'s police academy, "RECOGNISING IMPROVISED INCENDIARIES". The diagram is very clear. Somebody has helpfully added the quantities.',
    },
  };
  // (schematics are ungated; your Mechanics skill only improves the crafted condition)
  // Workshop: weapon mods & ammunition, always known, gated by Mechanics
  const WORKSHOP = [
    {
      id: "wk_rivets",
      makes: "ammo_rivet",
      n: 12,
      repair: 15,
      parts: [["scrap_metal", 1]],
      cat: "AMMO",
    },
    {
      id: "wk_silencer",
      makes: "mod_10mm_silencer",
      n: 1,
      repair: 35,
      parts: [
        ["tin_can", 2],
        ["duct_tape", 1],
        ["scrap_metal", 1],
      ],
      cat: "MOD",
    },
    {
      id: "wk_10mm_mag",
      makes: "mod_10mm_ext_mag",
      n: 1,
      repair: 30,
      parts: [
        ["scrap_metal", 2],
        ["tuff_bond", 1],
      ],
      cat: "MOD",
    },
    {
      id: "wk_rifle_mag",
      makes: "mod_rifle_ext_mag",
      n: 1,
      repair: 35,
      parts: [
        ["scrap_metal", 3],
        ["duct_tape", 1],
      ],
      cat: "MOD",
    },
    {
      id: "wk_rifle_scope",
      makes: "mod_rifle_scope",
      n: 1,
      repair: 40,
      parts: [
        ["microscope", 1],
        ["scrap_metal", 1],
        ["duct_tape", 1],
      ],
      cat: "MOD",
    },
    {
      id: "wk_44_scope",
      makes: "mod_44_scope",
      n: 1,
      repair: 40,
      parts: [
        ["microscope", 1],
        ["scrap_metal", 1],
      ],
      cat: "MOD",
    },
    {
      id: "wk_gyro_venturi",
      makes: "mod_gyro_venturi",
      n: 1,
      repair: 45,
      parts: [
        ["scrap_metal", 2],
        ["conductor", 1],
        ["tuff_bond", 1],
      ],
      cat: "MOD",
    },
  ];
  P.SCHEM = SCHEM;
  P.WORKSHOP = WORKSHOP;

  // ------------------------------------------------------------------
  // Item defs: schematic diagrams + mod items (pushed into G.items)
  // ------------------------------------------------------------------
  function addDef(def) {
    P.defs.set(def.id, def);
    if (P._definedInto && !G.isStub("items") && G.items.define) {
      try {
        G.items.define(def);
      } catch (e) {
        G.reportError("weapons:define " + def.id, e);
      }
    }
  }
  for (const id of Object.keys(SCHEM)) {
    const s = SCHEM[id];
    addDef({
      id,
      name: s.name,
      type: "misc",
      weight: 0,
      value: 50,
      desc:
        s.text +
        " (Teaches a workbench recipe. Extra copies improve the condition of what you build.)",
      tags: ["schematic"],
      mesh: "clipboard",
      noLoot: true,
      schematic: s.makes,
      icon: "note",
    });
  }
  for (const id of Object.keys(P.MODS)) {
    const m = P.MODS[id];
    addDef({
      id,
      name: m.name,
      type: "misc",
      weight: m.weight,
      value: m.value,
      desc:
        m.desc +
        " Fits: " +
        m.fits.map((f) => (P.defs.get(f) || {}).name || f).join(", ") +
        ". (" +
        m.effect +
        ")",
      tags: ["weapon_mod"],
      mesh: "electronics",
      lootWeight: 0.15,
      mod: { kind: m.kind, fits: m.fits.slice() },
      icon: "misc",
    });
  }

  // ------------------------------------------------------------------
  // Learning schematics (a schematic isn't an item you keep: it goes
  // straight into your goggles' notes; each extra copy improves the build quality)
  // ------------------------------------------------------------------
  const pendingRemove = [];
  G.events.on("itemAdded", (id, n) => {
    const s = SCHEM[id];
    if (!s) return;
    const before = S.schem[id] || 0;
    const now = Math.min(3, before + Math.max(1, n | 0 || 1));
    S.schem[id] = now;
    pendingRemove.push([id, Math.max(1, n | 0 || 1)]);
    const what = (P.defs.get(s.makes) || {}).name || s.makes;
    if (!before)
      G.notify("Schematic learned: " + what + ". Build it at any workbench.");
    else if (now > before)
      G.notify(what + " schematic " + now + "/3: crafted condition improved.");
    else
      G.notify(
        "You already know everything this " +
          what +
          " schematic can teach you.",
      );
    sfx("ui_confirm", "ui_click", { volume: 0.5 });
  });
  /** Condition (0..1) of a freshly built schematic weapon: copies 1/2/3 → 55/80/100 %, +Repair bonus. */
  P.craftCondition = function (schemId) {
    const n = S.schem[schemId] || 1;
    return Math.min(
      1,
      [0, 0.55, 0.8, 1][Math.min(3, n)] + (repairSkill() / 100) * 0.1,
    );
  };

  // ------------------------------------------------------------------
  // Crafting
  // ------------------------------------------------------------------
  function recipeOf(entry) {
    return entry.parts;
  }
  function missing(entry) {
    const out = [];
    for (const [id, n] of recipeOf(entry))
      if (count(id) < n) out.push([id, n - count(id)]);
    return out;
  }
  /** Why a recipe can't be built right now (null = OK). */
  function blocker(entry) {
    if (!invReal()) return "No inventory.";
    if (repairSkill() < (entry.repair || 0))
      return "Requires Repair " + entry.repair + ".";
    const m = missing(entry);
    if (m.length) return "Missing components.";
    return null;
  }
  /** Build a recipe (schematic id or workshop entry id). Returns {ok, reason?, made?}. */
  W.craft = function (recipeId) {
    const sch = SCHEM[recipeId];
    const entry = sch ? sch : WORKSHOP.find((w) => w.id === recipeId);
    if (!entry) return { ok: false, reason: "Unknown recipe." };
    if (sch && !(S.schem[recipeId] > 0))
      return { ok: false, reason: "You don't know this schematic." };
    const why = blocker(entry);
    if (why) return { ok: false, reason: why };
    for (const [id, n] of recipeOf(entry)) {
      try {
        G.inventory.remove(id, n, { silent: true });
      } catch (e) {
        G.reportError("weapons:craft remove", e);
      }
    }
    const n = entry.n || 1;
    const def = P.defs.get(entry.makes);
    const isWeapon =
      def && def.type === "weapon" && def.weapon.reloadType !== "throw";
    try {
      if (isWeapon) {
        // rpg keeps one condition per unit (0..1): the new unit gets the schematic-derived condition
        G.inventory.add(entry.makes, n, {
          silent: true,
          cond: P.craftCondition(recipeId),
        });
      } else G.inventory.add(entry.makes, n, { silent: true });
    } catch (e) {
      G.reportError("weapons:craft add", e);
    }
    const name = itemName(entry.makes);
    G.notify(name + (n > 1 ? " (" + n + ")" : "") + " crafted.");
    sfx("ui_confirm", "reload", { volume: 0.6 });
    try {
      G.sfx.play("reload", { volume: 0.5, pitch: 0.7 });
    } catch (e) {
      /* ignore */
    }
    try {
      if (!G.isStub("rpg") && G.rpg.addXP)
        G.rpg.addXP(isWeapon ? 25 : 5, "crafting");
    } catch (e) {
      /* ignore */
    }
    G.events.emit("itemCrafted", entry.makes, n);
    return { ok: true, made: entry.makes, n };
  };
  W.knownSchematics = () =>
    Object.keys(S.schem)
      .filter((k) => S.schem[k] > 0)
      .map((k) => ({
        id: k,
        copies: S.schem[k],
        makes: SCHEM[k] && SCHEM[k].makes,
      }));

  // ------------------------------------------------------------------
  // Weapon mods: install (consumes the mod item)
  // ------------------------------------------------------------------
