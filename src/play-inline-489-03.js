// play-inline-489 03 — block
// Lines 1411-1626 of readable/play-inline-489.pretty.js (statement-aligned).
  const UNARMED = {
    id: "unarmed",
    name: "Unarmed",
    type: "weapon",
    weight: 0,
    value: 0,
    desc: "Your own two fists.",
    weapon: Object.assign({}, BASE, {
      skill: "melee",
      unarmed: true,
      damage: 3,
      rof: 2.4,
      magSize: 0,
      ammo: null,
      critMult: 1,
      condDecay: 0,
      sound: "punch",
      viewmodel: "fists",
      reloadType: "melee",
      meleeRange: 1.8,
      meleeArc: 0.8,
      flash: "none",
      twoHanded: false,
      shell: null,
      meleeStyle: "punch",
      weight: 0,
      value: 0,
    }),
  };

  // ------------------------------------------------------------------
  // Registry
  // ------------------------------------------------------------------
  P.defs = new Map(); // id -> item def (weapon or ammo)
  P.AMMO = AMMO;
  P.BASE = BASE;
  P.UNARMED = UNARMED;

  for (const a of AMMO) {
    const def = {
      id: a.id,
      name: a.name,
      type: "ammo",
      weight: 0,
      value: a.value,
      desc: a.desc,
      icon: "ammo",
      casing: a.casing,
      tags: ["ammo"],
    };
    if (a.id === "ammo_recoilless") def.lootWeight = 0.3; // rare
    P.defs.set(a.id, def);
  }
  // Dedicated recipes offered by the sound module (beyond the contract's generic gun_* names).
  // `sound` becomes the dedicated name; the contract name + its pitch/volume tweak is kept in
  // `soundFb` and used whenever G.sfx doesn't know the dedicated one (P.snd below).
  const RICH_SOUND = {
    magnum_44: ["gun_magnum", 1, 1.05],
    closing_bell: ["gun_magnum", 0.94, 1.1],
    sniper_rifle: ["gun_sniper", 1, 1],
    bb_gun: ["gun_bb", 1, 0.9],
    gyrojet_pistol: ["gun_gyrojet", 1.08, 0.9],
    gemini: ["gun_gyrojet", 1.0, 1.0],
    gyrojet_carbine: ["gun_gyrojet", 0.92, 1.0],
    ticker_tape: ["gun_gyrojet", 0.88, 1.05],
    recoilless_rifle: ["gun_recoilless", 1, 1],
    rivet_gun: ["gun_rivet", 1, 1],
    siren_horn: ["siren_blast", 1, 1],
    flamer: ["gun_flamer", 1, 1],
    lady_libertys_torch: ["gun_flamer", 0.92, 1.05],
  };
  for (const w of WEAPONS) {
    const block = Object.assign({}, BASE, w.w);
    const rich = RICH_SOUND[w.id];
    block.soundFb = {
      name: block.sound,
      pitch: block.sfxPitch,
      volume: block.sfxVolume,
    };
    if (rich) {
      block.sound = rich[0];
      block.sfxPitch = rich[1];
      block.sfxVolume = rich[2];
    }
    block.weight = w.weight;
    block.value = w.value;
    if (block.ammo && block.shell === "pistol") {
      const a = AMMO.find((x) => x.id === block.ammo);
      if (a && a.casing) block.shell = a.casing;
    }
    const def = {
      id: w.id,
      name: w.name,
      type: "weapon",
      weight: w.weight,
      value: w.value,
      desc: w.desc,
      icon: "weapon_" + block.viewmodel,
      unique: !!w.unique,
      weapon: block,
    };
    if (w.crafted) {
      def.crafted = true;
      def.noLoot = true;
    }
    // thrown weapons stack & weigh per unit; tags help the rpg loot categories
    def.tags = [block.skill, block.damageType];
    if (block.reloadType === "throw") {
      def.stackable = true;
      def.tags.push(block.mine ? "mine" : "grenade");
    }
    if (block.reloadType === "melee")
      def.tags.push(
        block.unarmed || block.viewmodel === "fists" ? "unarmed" : "melee",
      );
    if (w.id === "winter_service_pistol") {
      def.unique = true;
      def.noLoot = true;
    }
    if (w.crafted) def.tags.push("crafted");
    P.defs.set(w.id, def);
  }

  // ------------------------------------------------------------------
  // Sound helpers: prefer the sound module's dedicated recipes, fall back to contract names.
  // ------------------------------------------------------------------
  P.hasSfx = function (name) {
    try {
      return !!(
        name &&
        !G.isStub("sfx") &&
        typeof G.sfx.has === "function" &&
        G.sfx.has(name)
      );
    } catch (e) {
      return false;
    }
  };
  /** Play `pref` if G.sfx has it, else `fallback` (contract name). opts as G.sfx.play. */
  P.snd = function (pref, fallback, opts) {
    try {
      return G.sfx.play(
        P.hasSfx(pref) || !fallback ? pref : fallback,
        opts || {},
      );
    } catch (e) {
      return null;
    }
  };
  /** The shot sound of a weapon block (dedicated or contract fallback), with its pitch/volume. */
  P.shotSound = function (w) {
    if (!w.soundFb || P.hasSfx(w.sound))
      return {
        name: w.sound,
        pitch: w.sfxPitch || 1,
        volume: w.sfxVolume || 1,
      };
    return {
      name: w.soundFb.name,
      pitch: w.soundFb.pitch || 1,
      volume: w.soundFb.volume || 1,
    };
  };

  /**
   * Self-heal weapon sounds once the sound module is up: if `sound` names a dedicated recipe the
   * sound module doesn't have (renamed / missing / sfx stubbed), fall back to the contract name in
   * `soundFb`, so anything that plays `weapon.sound` directly (e.g. NPC shots in combat) never goes
   * silent. `soundRich` keeps the preferred recipe name for reference.
   */
  P.healSounds = function () {
    if (G.isStub("sfx") || typeof G.sfx.has !== "function") return;
    for (const def of P.defs.values()) {
      const w = def.weapon;
      if (!w || !w.soundFb || w.sound === w.soundFb.name) continue;
      w.soundRich = w.soundRich || w.sound;
      let ok = false;
      try {
        ok = !!G.sfx.has(w.soundRich);
      } catch (e) {
        ok = false;
      }
      if (ok) {
        w.sound = w.soundRich;
        w.sfxPitch = w.richPitch || w.sfxPitch;
        w.sfxVolume = w.richVolume || w.sfxVolume;
      } else {
        if (w.richPitch === undefined) {
          w.richPitch = w.sfxPitch;
          w.richVolume = w.sfxVolume;
        }
        w.sound = w.soundFb.name;
        w.sfxPitch = w.soundFb.pitch;
        w.sfxVolume = w.soundFb.volume;
      }
    }
  };

  /** Push every def into G.items (idempotent). Returns true when G.items is real. */
  P.defineAll = function () {
    if (G.isStub("items") || !G.items || typeof G.items.define !== "function")
      return false;
    if (P._definedInto === G.items) return true;
    for (const def of P.defs.values()) {
      try {
        G.items.define(def);
      } catch (e) {
        G.reportError("weapons:define " + def.id, e);
      }
    }
    P._definedInto = G.items;
    return true;
  };

  // Early attempt (if rpg happened to load before us, harmless otherwise)
  P.defineAll();
