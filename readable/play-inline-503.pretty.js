/* src/weapons/70_craft.js */
/* =====================================================================
 * NEW RAD CITY — WEAPONS: workbench crafting, schematics, weapon mods,
 * custom shots (gyrojet rockets, hot rivets, the siren horn's cone),
 * payloads (riot gas, molotov fire, recoilless back-blast) & hit effects
 *
 *  - Schematics: finding a schematic diagram teaches a recipe; every
 *    extra copy (max 3) raises the condition of what you build. Recipes use
 *    rpg's junk (scrap metal, conductors, dry cells, bottles…).
 *  - Workbench UI (props emits 'workbench' when one is used): goggle styled
 *    list with three tabs — SCHEMATICS (learned weapon recipes), WORKSHOP
 *    (always-known weapon mods & ammunition, Mechanics-gated) and
 *    MODIFY (install mods from your inventory onto your guns).
 *  - Custom shots: gyrojet rockets fly as visible, accelerating rounds (weak
 *    at point-blank, full damage once they are up to speed); the Rivet Gun
 *    throws glowing rivets that stay stuck in walls and can cripple limbs;
 *    the Siren Horn hits everything in a short cone and knocks people flat.
 *  - Hit effects (combat's actorDamaged): Third-Rail Shoe stun, censer rads,
 *    rivet crippling & burns.
 *  - Payloads: G.weapons.gasCloud (riot gas: slows, spoils aim; combat
 *    forwards its 'gas' explosions here), molotov fire patches, the
 *    recoilless rifle's back-blast.
 *  - Schematic diagrams are placed as world pickups at fixed, validated spots
 *    (static rpg pickups: remembered per save).
 * ===================================================================== */
(function () {
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
  W.modsOf = (id) => P.modsOf(id);
  W.canInstallMod = function (weaponId, modId) {
    const m = P.MODS[modId];
    if (!m) return false;
    if (m.fits.indexOf(weaponId) < 0) return false;
    const have = P.modsOf(weaponId);
    if (have.indexOf(modId) >= 0) return false;
    if (have.some((x) => P.MODS[x] && P.MODS[x].kind === m.kind)) return false;
    return true;
  };
  W.installMod = function (weaponId, modId) {
    if (!W.canInstallMod(weaponId, modId))
      return { ok: false, reason: "That mod doesn't fit." };
    if (invReal() && count(modId) < 1)
      return { ok: false, reason: "You don't have that mod." };
    if (invReal() && count(weaponId) < 1)
      return { ok: false, reason: "You don't have that weapon." };
    if (invReal()) {
      try {
        G.inventory.remove(modId, 1, { silent: true });
      } catch (e) {
        return { ok: false, reason: "Inventory error." };
      }
    }
    S.mods[weaponId] = P.modsOf(weaponId).concat([modId]);
    G.notify(itemName(modId) + " installed on " + itemName(weaponId) + ".");
    sfx("ui_equip", "reload", { volume: 0.6 });
    // re-derive the equipped def & view model (the gun lowers, the modded model comes up)
    if (S.cur && S.cur.id === weaponId)
      W.equip(weaponId, {
        refresh: true,
        fromInventory: true,
        keepHolster: true,
      });
    // a bigger magazine is loaded at the bench: top the equipped (or stored) magazine up to the new capacity
    try {
      const md = P.moddedDef ? P.moddedDef(W.getDef(weaponId)) : null,
        w = md && md.weapon;
      if (
        w &&
        w.magSize > 0 &&
        w.ammo &&
        !w.ammoAny &&
        w.reloadType !== "throw"
      ) {
        const cur = S.cur && S.cur.id === weaponId ? S.cur : null;
        const have = cur ? cur.mag : S.mags[weaponId] || 0;
        const need = w.magSize - have;
        if (need > 0 && (S.mags[weaponId] !== undefined || cur)) {
          const got = invReal()
            ? P.takeAmmo(w.ammo, Math.min(need, P.reserve(md)))
            : 0;
          if (got > 0) {
            if (cur) cur.mag += got;
            S.mags[weaponId] = have + got;
            G.events.emit("ammoChanged", W.current());
          }
        }
      }
    } catch (e) {
      G.reportError("weapons:modTopUp", e);
    }
    G.events.emit("weaponModded", weaponId, modId);
    return { ok: true };
  };

  // ------------------------------------------------------------------
  // Hit effects (stun, rads, crippling, burns) — from combat's actorDamaged
  // so they apply to projectile, hitscan and melee hits alike
  // ------------------------------------------------------------------
  // combat's public cripple/ignite (round-1 integration), falling back to its internal object
  const cmb = () =>
    !G.isStub("combat") &&
    typeof G.combat.cripple === "function" &&
    typeof G.combat.ignite === "function"
      ? G.combat
      : CMB();
  const dots = [];
  function addDot(actor, dps, secs, type) {
    const d = dots.find((x) => x.actor === actor && x.type === type);
    if (d) {
      d.t = Math.max(d.t, secs);
      d.dps = Math.max(d.dps, dps);
      return;
    }
    dots.push({ actor, dps, t: secs, type, acc: 0 });
  }
  const LIMBS = ["leftArm", "rightArm", "leftLeg", "rightLeg"];
  /** Stun: the actor loses its footing, its aim and its next move for a moment. */
  function stun(actor, secs) {
    const t = now();
    if (actor.isRobot) secs *= 1.4; // shorted out
    actor.slowT = Math.max(actor.slowT || 0, t + secs);
    actor.aimT = Math.max(actor.aimT || 0, t + secs);
    actor.suppressT = Math.max(actor.suppressT || 0, t + secs);
    actor.pendingMelee = null;
    if (actor.lungeT) actor.lungeT = 0;
    if (fxOk() && actor.centerPos) {
      try {
        G.fx.arc(actor.centerPos(), { scale: 1.2, count: 4 });
      } catch (e) {
        /* ignore */
      }
    }
  }
  P.stunActor = stun;
  P.onWeaponHitActor = function (actor, w, info) {
    if (!actor || !w || actor.dead) return;
    if (w.igniteOnHit) {
      const c = cmb();
      if (c && typeof c.ignite === "function") {
        try {
          c.ignite(actor, w.igniteOnHit.secs, w.igniteOnHit.dps, "player");
        } catch (e) {
          addDot(actor, w.igniteOnHit.dps, w.igniteOnHit.secs, "fire");
        }
      } else addDot(actor, w.igniteOnHit.dps, w.igniteOnHit.secs, "fire");
    }
    if (w.radOnHit) {
      addDot(actor, w.radOnHit.dps, w.radOnHit.secs, "rad");
      if (fxOk() && actor.centerPos) {
        try {
          G.fx.flash(actor.centerPos(), 0xffa040, 1.2, 0.12, { range: 4 });
        } catch (e) {
          /* ignore */
        }
      }
    }
    if (w.stunOnHit) stun(actor, w.stunOnHit.secs || 1.2);
    if (w.crippleChance && Math.random() < w.crippleChance) {
      const c = cmb();
      const part =
        info && LIMBS.indexOf(info.part) >= 0
          ? info.part
          : LIMBS[(Math.random() * 4) | 0];
      if (
        c &&
        typeof c.cripple === "function" &&
        actor.limbs &&
        actor.limbs[part]
      ) {
        try {
          c.cripple(actor, part, "player");
        } catch (e) {
          /* ignore */
        }
      } else if (/Leg/.test(part)) actor.legsCrippled = true;
    }
  };
  let hookBusy = false;
  G.events.on("actorDamaged", (actor, amount, info) => {
    if (hookBusy || !info || !info.weaponId || info.dot) return;
    const src = info.source;
    if (src !== "player" && src !== G.player) return;
    const def = P.defs.get(info.weaponId);
    const w = def && def.weapon;
    if (!w || !(w.crippleChance || w.igniteOnHit || w.stunOnHit || w.radOnHit))
      return;
    hookBusy = true;
    try {
      P.onWeaponHitActor(
        actor,
        S.cur && S.cur.id === info.weaponId ? S.cur.def.weapon : w,
        info,
      );
    } catch (e) {
      G.reportError("weapons:hitFx", e);
    } finally {
      hookBusy = false;
    }
  });
  function updateDots(dt) {
    if (!dots.length || dt <= 0) return;
    for (let i = dots.length - 1; i >= 0; i--) {
      const d = dots[i];
      if (!d.actor || d.actor.dead || d.actor.removed || d.t <= 0) {
        dots.splice(i, 1);
        continue;
      }
      d.t -= dt;
      d.acc += d.dps * dt;
      if (d.acc >= 1) {
        const amt = Math.floor(d.acc);
        d.acc -= amt;
        try {
          if (typeof d.actor.damage === "function")
            d.actor.damage(amt, {
              type: d.type,
              source: "player",
              part: "torso",
              silent: true,
              dot: true,
            });
        } catch (e) {
          dots.splice(i, 1);
        }
      }
    }
  }

  // ------------------------------------------------------------------
  // Custom shots: gyrojet rockets, hot rivets (flying), the siren cone (instant)
  // ------------------------------------------------------------------
  const flying = []; // {kind, obj, pos, vel, age, damage, weaponId, w, dist, speed, dir}
  const stuck = []; // rivets left in walls {obj, t}
  const papers = []; // ticker-tape streamers drifting down {obj, vel, t, spin}
  const rings = []; // siren-horn shock rings {obj, t, dir, base}
  const _d = new THREE.Vector3(),
    _c = new THREE.Vector3(),
    _q = new THREE.Quaternion(),
    _z = new THREE.Vector3(0, 0, 1);
  let rivetProto = null,
    rocketProto = null;
  function rivetModel() {
    if (!rivetProto) {
      const b = P.builder();
      P.buildingWorld = true;
      b.add(P.GEO.cyl(0.0055, 0.03, 8), "glowAmber", {
        p: [0, 0, -0.004],
        tint: [1, 0.55, 0.3],
      });
      b.add(P.GEO.sphere(0.0085, 10, 6), "glowAmber", {
        p: [0, 0, 0.012],
        s: [1, 1, 0.55],
        tint: [1, 0.62, 0.32],
      });
      rivetProto = b.build(true);
      P.buildingWorld = false;
    }
    return rivetProto.clone(true);
  }
  function rocketModel() {
    if (!rocketProto) {
      const b = P.builder();
      P.buildingWorld = true;
      b.add(
        P.GEO.lathe(
          [
            [0.0, -0.012],
            [0.005, -0.008],
            [0.0062, 0.0],
            [0.0062, 0.026],
            [0.0, 0.026],
          ],
          10,
        ),
        "steel",
        { p: [0, 0, 0.0] },
      );
      rocketProto = b.build(true);
      P.buildingWorld = false;
      const s = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: P.glowTexture(),
          color: 0xffa040,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          toneMapped: false,
        }),
      );
      s.material.userData.shared = true;
      s.scale.setScalar(0.16);
      s.position.z = 0.04;
      rocketProto.add(s);
    }
    return rocketProto.clone(true);
  }
  /** Damage fraction of a gyrojet round that has flown `dist` metres (still accelerating close in). */
  function gyroFactor(g, dist) {
    if (!g) return 1;
    if (dist >= (g.full || 14) * 2) return 1 + (g.over || 0);
    return Math.min(
      1,
      (g.min || 0.35) + ((1 - (g.min || 0.35)) * dist) / (g.full || 14),
    );
  }
  P.gyroFactor = gyroFactor;
  /** Fire hook from 60_fire.fireOnce for weapons with w.customProj. */
  P.customShot = function (shot, cur) {
    const w = shot.weapon,
      kind = w.customProj;
    if (kind === "siren") return sirenShot(shot, cur);
    const d = P.applySpread
      ? P.applySpread(shot.dir.clone(), shot.spread)
      : shot.dir.clone();
    const start = shot.muzzle
      ? shot.muzzle.clone()
      : shot.origin.clone().addScaledVector(d, 0.5);
    // start from the eye line (so point-blank shots at walls don't pass through), the visual from the muzzle
    const pos = shot.origin.clone().addScaledVector(d, 0.35);
    const obj = kind === "gyro" ? rocketModel() : rivetModel();
    obj.position.copy(start);
    G.scene.add(obj);
    const gyro = kind === "gyro";
    const speed = gyro ? 24 : w.projectileSpeed || 55;
    flying.push({
      kind,
      obj,
      pos,
      vis: start,
      dir: d.clone(),
      speed,
      maxSpeed: w.projectileSpeed || 260,
      vel: d.clone().multiplyScalar(speed),
      age: 0,
      dist: 0.35,
      damage: w.damage,
      weaponId: cur.id,
      w,
      hitSet: new Set(),
      puffT: 0,
      paperT: 0,
    });
    if (gyro && fxOk()) {
      try {
        G.fx.dust(start, { scale: 0.25, count: 3, color: 0xcfcac0 });
      } catch (e) {
        /* ignore */
      }
    }
    if (kind === "rivet") sfx("steam_hiss", null, { volume: 0.25, pitch: 1.6 });
    return true;
  };
  const GRAV = { rivet: 2.5, gyro: 0.4 };
  /** Nearest actor whose body the segment a→b passes through (vertical capsule approximation). */
  function actorOnSegment(a, b, skip) {
    if (
      G.isStub("actors") ||
      !G.actors ||
      typeof G.actors.inRadius !== "function"
    )
      return null;
    const mid = _c.copy(a).add(b).multiplyScalar(0.5);
    const len = a.distanceTo(b);
    let list = [];
    try {
      list = G.actors.inRadius(mid, len / 2 + 2.5) || [];
    } catch (e) {
      list = [];
    }
    let best = null,
      bestT = Infinity;
    for (const act of list) {
      if (!act || act.removed || act.dead || skip.has(act)) continue;
      const ap = act.pos;
      if (!ap) continue;
      const h = act.height || (act.char && act.char.height) || 1.75,
        r = Math.max(0.35, act.radius || 0.4);
      // closest approach of the segment to the actor's vertical axis (2D), then height check
      const dx = b.x - a.x,
        dz = b.z - a.z,
        fx = a.x - ap.x,
        fz = a.z - ap.z;
      const L2 = dx * dx + dz * dz;
      let t = L2 > 1e-8 ? -(fx * dx + fz * dz) / L2 : 0;
      t = Math.max(0, Math.min(1, t));
      const px = fx + dx * t,
        pz = fz + dz * t;
      if (px * px + pz * pz > r * r) continue;
      const y = a.y + (b.y - a.y) * t;
      if (y < ap.y - 0.1 || y > ap.y + h + 0.15) continue;
      if (t < bestT) {
        bestT = t;
        best = act;
      }
    }
    return best ? { actor: best, t: bestT } : null;
  }
  function hitActor(p, act, from, dir, damage) {
    const res = { hit: false };
    if (P.combatReal()) {
      try {
        // resolve through combat (skill/condition scaling, crits, sneak attacks, limbs, gore, XP)
        const toC = _c
          .set(act.pos.x, act.pos.y + (act.height || 1.75) * 0.6, act.pos.z)
          .sub(from);
        const aim = Math.abs(toC.normalize().dot(dir)) > 0.6 ? dir : toC;
        const r = G.combat.fire({
          from: "player",
          origin: from.clone().addScaledVector(aim, -0.4),
          dir: aim.clone().normalize(),
          weaponId: p.weaponId,
          weapon: p.w,
          damage,
          spread: 0,
          pellets: 1,
          range: 4,
          projectile: "hitscan",
          damageType: "ballistic",
          muzzle: from.clone(),
          condition: P.getCond(p.weaponId),
        });
        if (r && r.hit) {
          res.hit = true;
          res.point = r.hit.point;
        }
      } catch (e) {
        G.reportError("weapons:customHit", e);
      }
    } else if (typeof act.damage === "function") {
      try {
        act.damage(damage, {
          type: "ballistic",
          source: "player",
          weaponId: p.weaponId,
        });
        res.hit = true;
      } catch (e) {
        /* ignore */
      }
    }
    return res;
  }
  function embed(p, point, dir) {
    const obj = p.obj;
    obj.position.copy(point).addScaledVector(dir, 0.012);
    _q.setFromUnitVectors(_z, dir.clone().negate());
    obj.quaternion.copy(_q);
    stuck.push({ obj, t: 20 });
    while (stuck.length > 24) G.scene.remove(stuck.shift().obj);
  }
  // ticker-tape: paper strips shed along the rocket's path
  let paperGeo = null;
  const paperMats = [];
  function spawnPaper(pos) {
    if (papers.length > 160) {
      const old = papers.shift();
      G.scene.remove(old.obj);
    }
    if (!paperGeo) {
      paperGeo = new THREE.PlaneGeometry(0.035, 0.12);
      for (const c of [0xf4f0e2, 0xf4f0e2, 0xc8302a, 0x2c5aa0]) {
        const m = new THREE.MeshBasicMaterial({
          color: c,
          side: THREE.DoubleSide,
          fog: true,
        });
        m.userData.shared = true;
        paperMats.push(m);
      }
    }
    const m = new THREE.Mesh(
      paperGeo,
      paperMats[(Math.random() * paperMats.length) | 0],
    );
    m.position.copy(pos);
    m.rotation.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);
    G.scene.add(m);
    papers.push({
      obj: m,
      t: 3.5 + Math.random() * 2,
      vel: new THREE.Vector3(
        (Math.random() - 0.5) * 1.5,
        0.6 + Math.random(),
        (Math.random() - 0.5) * 1.5,
      ),
      spin: new THREE.Vector3(
        Math.random() * 6 - 3,
        Math.random() * 6 - 3,
        Math.random() * 4 - 2,
      ),
    });
  }
  function updateFlying(dt) {
    if (dt <= 0) return;
    for (let i = flying.length - 1; i >= 0; i--) {
      const p = flying[i];
      p.age += dt;
      if (p.kind === "gyro") {
        // the rocket accelerates: ~0.25 s from a stroll to full speed
        p.speed = Math.min(p.maxSpeed, p.speed + 950 * dt);
        p.vel.copy(p.dir).multiplyScalar(p.speed);
      }
      p.vel.y -= (GRAV[p.kind] || 3) * dt;
      const step = p.vel.length() * dt;
      _d.copy(p.vel).normalize();
      const next = p.pos.clone().addScaledVector(p.vel, dt);
      let done = false;
      // actors first (so a raider in front of a wall gets hit)
      const ah = p.age < 4 ? actorOnSegment(p.pos, next, p.hitSet) : null;
      if (ah) {
        p.hitSet.add(ah.actor);
        const at = p.pos.clone().lerp(next, ah.t);
        const dmg =
          p.kind === "gyro"
            ? Math.round(p.damage * gyroFactor(p.w.gyro, p.dist + step * ah.t))
            : p.damage;
        const r = hitActor(p, ah.actor, at, _d.clone(), dmg);
        if (r.hit) {
          done = true;
          G.scene.remove(p.obj);
          if (p.kind === "gyro" && fxOk()) {
            try {
              G.fx.sparks(at, { count: 6, speed: 4 });
            } catch (e) {
              /* ignore */
            }
          }
        }
      }
      // world
      if (!done) {
        const wh = G.world.raycast(p.pos, _d, step + 0.02, {
          ignoreTags: ["actor", "interactable_self", "foliage"],
        });
        if (wh) {
          try {
            G.fx.impact(wh.point, wh.normal, wh.surface || "metal");
          } catch (e) {
            /* ignore */
          }
          try {
            G.sfx.play(p.kind === "rivet" ? "ricochet" : "bullet_impact", {
              pos: wh.point,
              volume: p.kind === "rivet" ? 0.6 : 0.45,
              pitch: p.kind === "rivet" ? 0.55 : 1.2,
            });
          } catch (e) {
            /* ignore */
          }
          if (!G.isStub("props") && G.props.damageAt) {
            try {
              G.props.damageAt(wh.point, p.damage);
            } catch (e) {
              /* ignore */
            }
          }
          if (p.kind === "rivet") embed(p, wh.point, _d.clone());
          else {
            G.scene.remove(p.obj);
            if (fxOk()) {
              try {
                G.fx.sparks(wh.point, { count: 8, speed: 5 });
              } catch (e) {
                /* ignore */
              }
            }
          }
          done = true;
        } else {
          p.pos.copy(next);
          p.dist += step;
        }
      }
      if (done) {
        flying.splice(i, 1);
        continue;
      }
      // visuals: the model starts at the gun muzzle and converges on the true path within ~6 m
      const k = Math.min(1, p.age * 6);
      p.vis.lerp(p.pos, k);
      p.obj.position.copy(p.vis);
      if (p.vel.lengthSq() > 1e-4) {
        _q.setFromUnitVectors(_z, _d.clone().negate());
        p.obj.quaternion.copy(_q);
      }
      if (p.kind === "gyro") {
        p.puffT -= dt;
        if (p.puffT <= 0 && fxOk()) {
          p.puffT = 0.035;
          try {
            G.fx.dust(p.obj.position, {
              scale: 0.14,
              count: 1,
              color: 0xd8d4ca,
            });
          } catch (e) {
            /* ignore */
          }
        }
        if (p.w.streamers) {
          p.paperT -= dt;
          if (p.paperT <= 0) {
            p.paperT = 0.03;
            spawnPaper(p.obj.position);
          }
        }
      }
      if (p.age > 4) {
        G.scene.remove(p.obj);
        flying.splice(i, 1);
      }
    }
    for (let i = stuck.length - 1; i >= 0; i--) {
      stuck[i].t -= dt;
      if (stuck[i].t <= 0) {
        G.scene.remove(stuck[i].obj);
        stuck.splice(i, 1);
      }
    }
    for (let i = papers.length - 1; i >= 0; i--) {
      const q = papers[i];
      q.t -= dt;
      q.vel.y = Math.max(-0.7, q.vel.y - 2.2 * dt);
      q.vel.x *= 0.985;
      q.vel.z *= 0.985;
      q.obj.position.addScaledVector(q.vel, dt);
      q.obj.rotation.x += q.spin.x * dt;
      q.obj.rotation.y += q.spin.y * dt;
      q.obj.rotation.z += q.spin.z * dt;
      if (q.t <= 0) {
        G.scene.remove(q.obj);
        papers.splice(i, 1);
      }
    }
    for (let i = rings.length - 1; i >= 0; i--) {
      const r = rings[i];
      r.t += dt;
      const k = r.t / 0.5;
      if (k >= 1) {
        G.scene.remove(r.obj);
        r.obj.material.dispose();
        rings.splice(i, 1);
        continue;
      }
      const s = 0.15 + k * r.base;
      r.obj.scale.setScalar(s);
      r.obj.position.copy(r.from).addScaledVector(r.dir, 0.4 + k * r.reach);
      r.obj.material.opacity = 0.55 * (1 - k);
    }
  }

  // ------------------------------------------------------------------
  // Siren Horn: one shriek hits everything in a short cone (no projectile)
  // ------------------------------------------------------------------
  let ringGeo = null;
  function sirenRings(from, dir, range) {
    if (!ringGeo) ringGeo = new THREE.RingGeometry(0.82, 1.0, 48);
    for (let i = 0; i < 3; i++) {
      const mat = new THREE.MeshBasicMaterial({
        color: 0xcfeefa,
        transparent: true,
        opacity: 0.55,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
        toneMapped: false,
        fog: false,
      });
      const m = new THREE.Mesh(ringGeo, mat);
      _q.setFromUnitVectors(_z, dir);
      m.quaternion.copy(_q);
      m.position.copy(from);
      G.scene.add(m);
      rings.push({
        obj: m,
        t: -i * 0.09,
        from: from.clone(),
        dir: dir.clone(),
        base: range * 0.55,
        reach: range * 0.85,
      });
    }
  }
  function sirenShot(shot, cur) {
    const w = shot.weapon,
      so = w.sonic || { range: 10, arc: 0.6, knock: 0.85 };
    const origin = shot.origin.clone(),
      dir = shot.dir.clone().normalize();
    const C = CMB(),
      t = now();
    const cosA = Math.cos(so.arc || 0.6);
    const cond = P.getCond(cur.id);
    let hits = 0;
    const list = C && C.list ? C.list : [];
    for (const a of list) {
      if (!a || a.dead || !a.inScene || a.removed) continue;
      const cp = a.centerPos ? a.centerPos(new THREE.Vector3()) : a.pos.clone();
      const to = cp.clone().sub(origin);
      const dist = to.length();
      if (dist > so.range + (a.radius || 0.4) || dist < 1e-3) continue;
      if (to.normalize().dot(dir) < cosA && dist > 1.5) continue;
      if (!G.world.lineOfSight(origin, cp)) continue;
      const f = Math.max(0.3, 1 - (dist / so.range) * 0.6);
      const dmg = w.damage * f * (0.6 + 0.4 * cond);
      try {
        C.applyDamage(a, dmg, {
          type: "sonic",
          source: "player",
          part: "torso",
          dir: dir.clone(),
          point: cp.clone(),
          weaponId: cur.id,
        });
      } catch (e) {
        G.reportError("weapons:siren", e);
      }
      if (!a.dead) {
        const down = C.tryKnockdown
          ? C.tryKnockdown(a, (so.knock || 0.85) * f, dir.clone())
          : false;
        if (!down) {
          a.slowT = Math.max(a.slowT || 0, t + 1.4 * f);
          a.speed = 0;
        }
        a.suppressT = Math.max(a.suppressT || 0, t + 2.2);
        a.aimT = Math.max(a.aimT || 0, t + 0.9 * f);
      }
      hits++;
    }
    if (C && C.noise) {
      try {
        C.noise(origin, 90, "player", "gun");
      } catch (e) {
        /* ignore */
      }
    }
    // glass, cans and car alarms in the cone take a beating too
    if (!G.isStub("props") && G.props.damageAt) {
      try {
        G.props.damageAt(
          origin.clone().addScaledVector(dir, so.range * 0.5),
          w.damage * 0.5,
          so.range * 0.5,
        );
      } catch (e) {
        /* ignore */
      }
    }
    sirenRings(
      shot.muzzle
        ? shot.muzzle.clone()
        : origin.clone().addScaledVector(dir, 0.5),
      dir,
      so.range,
    );
    if (fxOk()) {
      try {
        G.fx.dust(
          origin
            .clone()
            .addScaledVector(dir, 2)
            .setY(G.player.pos.y + 0.1),
          { scale: 1.2, count: 8, color: 0xb8b0a0 },
        );
      } catch (e) {
        /* ignore */
      }
    }
    return hits >= 0;
  }

  // ------------------------------------------------------------------
  // Recoilless rifle back-blast: anything standing behind you gets the exhaust;
  // a wall right behind you bounces some of it back.
  // ------------------------------------------------------------------
  P.backblast = function (w, wid) {
    const bb = w.backblast || { range: 5, damage: 40 };
    const pl = G.player;
    const back = pl.forward.clone().negate();
    back.y = 0;
    if (back.lengthSq() < 1e-6) return;
    back.normalize();
    const origin = pl.eye.clone().addScaledVector(back, 0.7);
    origin.y -= 0.2;
    if (fxOk()) {
      try {
        G.fx.dust(origin, { scale: 1.8, count: 12, color: 0xb0a898 });
        G.fx.flash(origin, 0xffa050, 2.5, 0.08, { range: 8 });
        G.fx.sparks(origin, { dir: back, count: 10, speed: 9 });
      } catch (e) {
        /* ignore */
      }
    }
    const C = CMB();
    if (C && C.list) {
      for (const a of C.list) {
        if (!a || a.dead || !a.inScene) continue;
        const to = new THREE.Vector3(a.pos.x - pl.pos.x, 0, a.pos.z - pl.pos.z);
        const dist = to.length();
        if (dist > bb.range || dist < 0.1) continue;
        if (to.normalize().dot(back) < 0.55) continue;
        const f = 1 - dist / bb.range;
        try {
          C.applyDamage(a, bb.damage * f, {
            type: "fire",
            source: "player",
            part: "torso",
            weaponId: wid,
            dir: back.clone(),
          });
        } catch (e) {
          /* ignore */
        }
        if (!a.dead && C.tryKnockdown)
          C.tryKnockdown(a, 0.4 + f * 0.6, back.clone());
      }
    }
    // a wall within a metre and a half behind: the blast comes straight back
    try {
      const wh = G.world.raycast(pl.eye, back, 1.5, {
        ignoreTags: ["actor", "foliage"],
      });
      if (wh) {
        pl.damage(12 * (1 - wh.dist / 1.5) + 4, {
          type: "explosive",
          source: "player",
        });
        pl.shake(0.5, 0.4);
        G.notify("The back-blast hits the wall behind you.");
      }
    } catch (e) {
      /* ignore */
    }
  };

  // ------------------------------------------------------------------
  // Riot gas: a low white cloud. Everyone inside is slowed and can't aim
  // (robots don't breathe). G.weapons.gasCloud is also called by combat
  // for NPC-thrown gas ('gas' explosion kind).
  // ------------------------------------------------------------------
  const clouds = [];
  P.gasCloud = W.gasCloud = function (pos, radius, opts) {
    opts = opts || {};
    const c = {
      pos: new THREE.Vector3(pos.x, pos.y, pos.z),
      r: radius || 5,
      t: opts.secs || 10,
      src: opts.source === undefined ? "player" : opts.source,
      tick: 0,
      em: [],
      weaponId: opts.weaponId || "riot_gas_grenade",
    };
    try {
      const gy = G.world.groundHeight(c.pos.x, c.pos.z, c.pos.y + 1, 0.2);
      if (isFinite(gy) && Math.abs(gy - c.pos.y) < 3) c.pos.y = gy;
    } catch (e) {
      /* ignore */
    }
    if (fxOk() && G.fx.smoke) {
      for (let i = 0; i < 4; i++) {
        const a = i * 1.7,
          rr = i ? c.r * 0.45 : 0;
        try {
          const e = G.fx.smoke(
            new THREE.Vector3(
              c.pos.x + Math.cos(a) * rr,
              c.pos.y + 0.1,
              c.pos.z + Math.sin(a) * rr,
            ),
            0.5,
            { color: 0xd8dccb, alpha: 0.34, rise: 0.22, rate: 5, lod: 160 },
          );
          if (e) c.em.push(e);
        } catch (e) {
          /* ignore */
        }
      }
    }
    try {
      G.sfx.play("steam_hiss", { pos: c.pos, volume: 0.9, pitch: 0.8 });
    } catch (e) {
      /* ignore */
    }
    clouds.push(c);
    return c;
  };
  function updateClouds(dt) {
    if (!clouds.length || dt <= 0) return;
    const C = CMB(),
      t = now(),
      pl = G.player;
    for (let i = clouds.length - 1; i >= 0; i--) {
      const c = clouds[i];
      c.t -= dt;
      c.tick -= dt;
      if (c.tick <= 0) {
        c.tick = 0.3;
        const r = c.r * Math.min(1, 0.6 + (10 - Math.min(10, c.t)) * 0.2); // the cloud spreads for the first two seconds
        if (C && C.list)
          for (const a of C.list) {
            if (!a || a.dead || !a.inScene || a.isRobot) continue;
            const dx = a.pos.x - c.pos.x,
              dz = a.pos.z - c.pos.z;
            if (dx * dx + dz * dz > r * r || Math.abs(a.pos.y - c.pos.y) > 3)
              continue;
            a.slowT = Math.max(a.slowT || 0, t + 0.7);
            a.suppressT = Math.max(a.suppressT || 0, t + 1.0);
            if (Math.random() < 0.4) a.aimT = Math.max(a.aimT || 0, t + 0.5);
            if (Math.random() < 0.5) {
              try {
                C.applyDamage(a, 1, {
                  type: "poison",
                  source: c.src,
                  part: "torso",
                  silent: true,
                  weaponId: c.weaponId,
                });
              } catch (e) {
                /* ignore */
              }
            }
          }
        if (pl && pl.alive !== false) {
          const dx = pl.pos.x - c.pos.x,
            dz = pl.pos.z - c.pos.z;
          if (dx * dx + dz * dz < r * r && Math.abs(pl.pos.y - c.pos.y) < 3) {
            if (
              !G.isStub("rpg") &&
              G.rpg &&
              typeof G.rpg.addEffect === "function"
            ) {
              try {
                G.rpg.addEffect({
                  id: "tear_gas",
                  name: "Tear Gas",
                  kind: "debuff",
                  duration: 2.5,
                  mods: { speedMult: -0.3, spreadMult: 0.6 },
                  desc: "Eyes streaming: slower, wilder aim",
                });
              } catch (e) {
                /* ignore */
              }
            }
            if (Math.random() < 0.3) {
              try {
                pl.damage(1, { type: "poison", source: c.src });
              } catch (e) {
                /* ignore */
              }
            }
          }
        }
      }
      if (c.t <= 0) {
        for (const e of c.em) {
          try {
            e.stop();
          } catch (er) {
            /* ignore */
          }
        }
        clouds.splice(i, 1);
      }
    }
  }

  // ------------------------------------------------------------------
  // Molotov: the bottle breaks, a whoomph, a patch of burning ground
  // ------------------------------------------------------------------
  const fires = [];
  P.fireBurst = function (pos, radius, damage, spec) {
    const p = new THREE.Vector3(pos.x, pos.y, pos.z);
    try {
      const gy = G.world.groundHeight(p.x, p.z, p.y + 0.5, 0.2);
      if (isFinite(gy) && Math.abs(gy - p.y) < 2.5) p.y = gy;
    } catch (e) {
      /* ignore */
    }
    try {
      G.sfx.play("glass_break", { pos: p, volume: 0.9 });
    } catch (e) {
      /* ignore */
    }
    if (P.combatReal() && typeof G.combat.explode === "function") {
      try {
        G.combat.explode(p, radius * 0.7, damage * 0.5, {
          source: "player",
          kind: "fire",
          weaponId: spec.weaponId,
          small: true,
        });
      } catch (e) {
        G.reportError("weapons:molotov", e);
      }
    } else if (fxOk()) {
      try {
        G.fx.explosion(p, radius, "fire");
      } catch (e) {
        /* ignore */
      }
    }
    const burn = spec.burn || { secs: 8, dps: 6 };
    let fx = null;
    if (fxOk() && G.fx.fire) {
      try {
        fx = G.fx.fire(p, Math.max(0.8, radius * 0.45), { light: true });
      } catch (e) {
        fx = null;
      }
    }
    fires.push({
      pos: p,
      r: radius,
      t: burn.secs,
      dps: burn.dps,
      tick: 0,
      fx,
      weaponId: spec.weaponId || "molotov",
    });
  };
  function updateFires(dt) {
    if (!fires.length || dt <= 0) return;
    const C = CMB(),
      c2 = cmb(),
      pl = G.player;
    for (let i = fires.length - 1; i >= 0; i--) {
      const f = fires[i];
      f.t -= dt;
      f.tick -= dt;
      if (f.tick <= 0) {
        f.tick = 0.5;
        if (C && C.list)
          for (const a of C.list) {
            if (!a || a.dead || !a.inScene) continue;
            const dx = a.pos.x - f.pos.x,
              dz = a.pos.z - f.pos.z;
            if (
              dx * dx + dz * dz > f.r * f.r ||
              Math.abs(a.pos.y - f.pos.y) > 2
            )
              continue;
            if (c2 && typeof c2.ignite === "function") {
              try {
                c2.ignite(a, 3, f.dps, "player");
              } catch (e) {
                /* ignore */
              }
            }
          }
        if (pl && pl.alive !== false) {
          const dx = pl.pos.x - f.pos.x,
            dz = pl.pos.z - f.pos.z;
          if (
            dx * dx + dz * dz < f.r * f.r * 0.6 &&
            Math.abs(pl.pos.y - f.pos.y) < 2
          ) {
            try {
              pl.damage(f.dps * 0.5, { type: "fire", source: "player" });
            } catch (e) {
              /* ignore */
            }
          }
        }
      }
      if (f.t <= 0) {
        if (f.fx) {
          try {
            f.fx.stop();
          } catch (e) {
            /* ignore */
          }
        }
        fires.splice(i, 1);
      }
    }
  }

  function clearFlying() {
    for (const p of flying) G.scene.remove(p.obj);
    for (const s of stuck) G.scene.remove(s.obj);
    for (const q of papers) G.scene.remove(q.obj);
    for (const r of rings) {
      G.scene.remove(r.obj);
      r.obj.material.dispose();
    }
    for (const c of clouds)
      for (const e of c.em) {
        try {
          e.stop();
        } catch (er) {
          /* ignore */
        }
      }
    for (const f of fires)
      if (f.fx) {
        try {
          f.fx.stop();
        } catch (er) {
          /* ignore */
        }
      }
    flying.length = 0;
    stuck.length = 0;
    papers.length = 0;
    rings.length = 0;
    dots.length = 0;
    clouds.length = 0;
    fires.length = 0;
  }

  // ------------------------------------------------------------------
  // Workbench UI (goggle styled; state 'container' while open)
  // ------------------------------------------------------------------
  const UI = {
    el: null,
    open: false,
    tab: 0,
    sel: 0,
    rows: [],
    bench: null,
    msg: "",
    msgT: 0,
  };
  const TABS = ["SCHEMATICS", "WORKSHOP", "MODIFY"];
  const esc = (s) =>
    String(s == null ? "" : s).replace(
      /[&<>"]/g,
      (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
    );
  function buildUI() {
    if (UI.el) return;
    const root =
      G.ui && !G.isStub("ui") && G.ui.root ? G.ui.root : document.body;
    const el = document.createElement("div");
    el.className = "wpn-craft";
    el.innerHTML =
      '<div class="wpn-craft-box"><div class="wpn-craft-scan"></div>' +
      '<div class="wpn-craft-head"><span class="wpn-craft-title">WORKBENCH</span><span class="wpn-craft-skill"></span></div>' +
      '<div class="wpn-craft-tabs"></div>' +
      '<div class="wpn-craft-body"><ul class="wpn-craft-list"></ul><div class="wpn-craft-info"></div></div>' +
      '<div class="wpn-craft-msg"></div>' +
      '<div class="wpn-craft-foot"><b>E</b> BUILD / INSTALL &nbsp; <b>W/S</b> SELECT &nbsp; <b>A/D</b> TAB &nbsp; <b>ESC</b> EXIT</div></div>';
    root.appendChild(el);
    UI.el = el;
    UI.tabsEl = el.querySelector(".wpn-craft-tabs");
    UI.listEl = el.querySelector(".wpn-craft-list");
    UI.infoEl = el.querySelector(".wpn-craft-info");
    UI.msgEl = el.querySelector(".wpn-craft-msg");
    UI.skillEl = el.querySelector(".wpn-craft-skill");
    el.addEventListener("mousedown", (e) => {
      const t = e.target.closest
        ? e.target.closest("[data-tab],[data-row],[data-act]")
        : null;
      if (!t) return;
      e.preventDefault();
      e.stopPropagation();
      if (t.dataset.tab !== undefined) {
        UI.tab = +t.dataset.tab;
        UI.sel = 0;
        sfx("ui_tab", "ui_click");
        render();
      } else if (t.dataset.row !== undefined) {
        if (UI.sel === +t.dataset.row && e.detail > 1) act();
        else {
          UI.sel = +t.dataset.row;
          sfx("ui_hover", "ui_click", { volume: 0.3 });
          render();
        }
      } else if (t.dataset.act) act();
    });
  }
  function rowsFor(tab) {
    const rows = [];
    if (tab === 0) {
      for (const id of Object.keys(SCHEM))
        if (S.schem[id] > 0) rows.push({ type: "schem", id, entry: SCHEM[id] });
    } else if (tab === 1) {
      for (const e of WORKSHOP) rows.push({ type: "work", id: e.id, entry: e });
    } else {
      // every owned weapon that some mod fits: owned mods first, installed ones listed for reference
      const owned = invReal()
        ? G.inventory.list("weapon").map((x) => x.id)
        : [];
      for (const wid of owned) {
        for (const mid of Object.keys(P.MODS)) {
          const m = P.MODS[mid];
          if (m.fits.indexOf(wid) < 0) continue;
          const inst = P.modsOf(wid).indexOf(mid) >= 0;
          if (inst || count(mid) > 0)
            rows.push({ type: "mod", id: mid, wid, installed: inst });
        }
      }
    }
    return rows;
  }
  function partsHTML(entry) {
    return (
      '<ul class="wpn-craft-parts">' +
      entry.parts
        .map(([id, n]) => {
          const have = count(id);
          return (
            '<li class="' +
            (have >= n ? "ok" : "no") +
            '"><span>' +
            esc(itemName(id)) +
            "</span><i>" +
            Math.min(have, 99) +
            "/" +
            n +
            "</i></li>"
          );
        })
        .join("") +
      "</ul>"
    );
  }
  function statLine(def) {
    if (!def || !def.weapon) return "";
    const w = def.weapon;
    const cells = [];
    if (w.damage) cells.push("DAM " + Math.round(w.damage * (w.pellets || 1)));
    if (w.strReq > 1) cells.push("BRN " + w.strReq);
    cells.push("WG " + (def.weight || 0));
    cells.push("VAL " + (def.value || 0));
    return (
      '<div class="wpn-craft-stats">' +
      cells.map((c) => "<span>" + c + "</span>").join("") +
      "</div>"
    );
  }
  function render() {
    if (!UI.el) return;
    UI.rows = rowsFor(UI.tab);
    if (UI.sel >= UI.rows.length) UI.sel = Math.max(0, UI.rows.length - 1);
    UI.skillEl.textContent = "REPAIR " + Math.round(repairSkill());
    UI.tabsEl.innerHTML = TABS.map(
      (t, i) =>
        '<b data-tab="' +
        i +
        '" class="' +
        (i === UI.tab ? "on" : "") +
        '">' +
        t +
        "</b>",
    ).join("");
    UI.listEl.innerHTML =
      UI.rows
        .map((r, i) => {
          let label,
            tag = "",
            dim = false;
          if (r.type === "schem") {
            label = itemName(r.entry.makes);
            tag =
              "<i>" +
              "&#9632;".repeat(S.schem[r.id]) +
              "&#9633;".repeat(3 - S.schem[r.id]) +
              "</i>";
            dim = !!blocker(r.entry);
          } else if (r.type === "work") {
            label =
              itemName(r.entry.makes) +
              ((r.entry.n || 1) > 1 ? " (" + r.entry.n + ")" : "");
            tag = "<i>" + r.entry.cat + "</i>";
            dim = !!blocker(r.entry);
          } else {
            label = itemName(r.id) + " &rarr; " + esc(itemName(r.wid));
            tag = r.installed
              ? "<i>INSTALLED</i>"
              : "<i>x" + count(r.id) + "</i>";
            dim = r.installed || !W.canInstallMod(r.wid, r.id);
          }
          return (
            '<li data-row="' +
            i +
            '" class="' +
            (i === UI.sel ? "sel " : "") +
            (dim ? "dim" : "") +
            '"><span>' +
            (r.type === "mod" ? label : esc(label)) +
            "</span>" +
            tag +
            "</li>"
          );
        })
        .join("") ||
      '<li class="empty">' +
        (UI.tab === 0
          ? "No schematics known.<br>Schematic diagrams are hidden all over the city: find them, then build here."
          : UI.tab === 2
            ? "No weapon mods for your weapons.<br>Build mods in the WORKSHOP tab or find them in the ruins."
            : "") +
        "</li>";
    const r = UI.rows[UI.sel];
    let info = "";
    if (r && (r.type === "schem" || r.type === "work")) {
      const e = r.entry,
        def =
          P.defs.get(e.makes) ||
          (G.items && G.items.get ? G.items.get(e.makes) : null);
      const why = blocker(e);
      info += "<h3>" + esc(itemName(e.makes)) + "</h3>";
      if (r.type === "schem")
        info += '<p class="wpn-craft-note">' + esc(e.text) + "</p>";
      else if (def && def.desc)
        info += '<p class="wpn-craft-note">' + esc(def.desc) + "</p>";
      info += statLine(def);
      if (
        r.type === "schem" &&
        def &&
        def.type === "weapon" &&
        def.weapon.reloadType !== "throw"
      ) {
        const c = Math.round(P.craftCondition(r.id) * 100);
        info +=
          '<div class="wpn-craft-cnd">CND <span class="bar"><i style="width:' +
          c +
          '%"></i></span> ' +
          c +
          "% <em>(" +
          S.schem[r.id] +
          "/3 schematics)</em></div>";
      }
      info += "<h4>COMPONENTS</h4>" + partsHTML(e);
      if (e.repair)
        info +=
          '<div class="wpn-craft-req ' +
          (repairSkill() >= e.repair ? "ok" : "no") +
          '">REQUIRES REPAIR ' +
          e.repair +
          "</div>";
      info +=
        '<button data-act="1" class="' +
        (why ? "off" : "") +
        '">' +
        (why ? esc(why.toUpperCase()) : "BUILD") +
        "</button>";
    } else if (r && r.type === "mod") {
      const m = P.MODS[r.id];
      info +=
        "<h3>" +
        esc(m.name) +
        '</h3><p class="wpn-craft-note">' +
        esc(m.desc) +
        "</p>";
      info +=
        '<div class="wpn-craft-stats"><span>' +
        esc(m.effect.toUpperCase()) +
        "</span></div>";
      const have = P.modsOf(r.wid)
        .map((x) => (P.MODS[x] || {}).name)
        .filter(Boolean);
      info +=
        "<h4>" +
        esc(itemName(r.wid).toUpperCase()) +
        '</h4><p class="wpn-craft-note">Installed: ' +
        (have.length ? esc(have.join(", ")) : "none") +
        "</p>";
      const ok =
        !r.installed && W.canInstallMod(r.wid, r.id) && count(r.id) > 0;
      info +=
        '<button data-act="1" class="' +
        (ok ? "" : "off") +
        '">' +
        (r.installed ? "INSTALLED" : ok ? "INSTALL" : "CAN'T INSTALL") +
        "</button>";
    }
    UI.infoEl.innerHTML = info;
    UI.msgEl.textContent = UI.msg;
    const selEl = UI.listEl.querySelector(".sel");
    if (selEl && selEl.scrollIntoView) {
      try {
        selEl.scrollIntoView({ block: "nearest" });
      } catch (e) {
        /* ignore */
      }
    }
  }
  function flash(msg) {
    UI.msg = msg;
    UI.msgT = 2.5;
    if (UI.msgEl) UI.msgEl.textContent = msg;
  }
  function act() {
    const r = UI.rows[UI.sel];
    if (!r) return;
    if (r.type === "mod") {
      if (r.installed) return;
      const res = W.installMod(r.wid, r.id);
      if (!res.ok) {
        flash(res.reason);
        sfx("ui_error", "empty_click");
      } else flash("Installed.");
    } else {
      const res = W.craft(r.type === "schem" ? r.id : r.entry.id);
      if (!res.ok) {
        flash(res.reason);
        sfx("ui_error", "empty_click");
      } else flash(itemName(res.made) + " built.");
    }
    render();
  }
  W.openWorkbench = function (bench) {
    buildUI();
    if (G.state !== "play" && G.state !== "container") return false;
    UI.bench = bench || null;
    UI.open = true;
    UI.msg = "";
    UI.tab = Object.keys(S.schem).some((k) => S.schem[k] > 0) ? 0 : 1;
    UI.sel = 0;
    if (G.state !== "container") G.setState("container");
    UI.el.classList.add("on");
    sfx("ui_open", "goggles_tab", { volume: 0.55 });
    render();
    return true;
  };
  W.closeWorkbench = function () {
    if (!UI.open) return;
    UI.open = false;
    if (UI.el) UI.el.classList.remove("on");
    try {
      const I = G.input;
      for (const k in I.pressed) I.pressed[k] = false;
    } catch (e) {
      /* ignore */
    }
    if (G.state === "container") G.setState("play");
    sfx("ui_back", "ui_click", { volume: 0.4 });
  };
  W.isWorkbenchOpen = () => UI.open;
  G.events.on("keydown", (code, e) => {
    if (!UI.open) return;
    const k = code || (e && e.key) || "";
    let used = true;
    if (k === "Escape" || k === "Tab" || k === "Backspace") W.closeWorkbench();
    else if (k === "ArrowUp" || k === "KeyW") {
      UI.sel = Math.max(0, UI.sel - 1);
      sfx("ui_scroll", "ui_click", { volume: 0.25 });
      render();
    } else if (k === "ArrowDown" || k === "KeyS") {
      UI.sel = Math.min(UI.rows.length - 1, UI.sel + 1);
      sfx("ui_scroll", "ui_click", { volume: 0.25 });
      render();
    } else if (k === "ArrowLeft" || k === "KeyA" || k === "KeyQ") {
      UI.tab = (UI.tab + TABS.length - 1) % TABS.length;
      UI.sel = 0;
      sfx("ui_tab", "ui_click");
      render();
    } else if (k === "ArrowRight" || k === "KeyD") {
      UI.tab = (UI.tab + 1) % TABS.length;
      UI.sel = 0;
      sfx("ui_tab", "ui_click");
      render();
    } else if (
      k === "Enter" ||
      k === "NumpadEnter" ||
      k === "KeyE" ||
      k === "Space"
    )
      act();
    else if (/^Digit[1-3]$/.test(k)) {
      UI.tab = +k.slice(5) - 1;
      UI.sel = 0;
      render();
    } else used = false;
    if (used) {
      try {
        G.input.consume(k);
      } catch (err) {
        /* ignore */
      }
      if (e && e.preventDefault) e.preventDefault();
    }
  });
  G.events.on("state", (s) => {
    if (UI.open && s !== "container") {
      UI.open = false;
      if (UI.el) UI.el.classList.remove("on");
    }
  });
  G.events.on("inventoryChanged", () => {
    if (UI.open) render();
  });
  // props: interacting with a workbench emits 'workbench' (and prints its own "lack the schematics"
  // line — swallowed for that one call, see initDone below)
  let suppressT = 0;
  G.events.on("workbench", (rec) => {
    if (W.openWorkbench(rec)) suppressT = performance.now() + 60;
  });

  // ------------------------------------------------------------------
  // Schematic diagrams in the world (static rpg pickups, placed once)
  // ------------------------------------------------------------------
  const PLACEMENTS = [
    // [schematic, x, z, search radius] — near workbenches / fitting landmarks
    ["schematic_rivet_gun", null, null, 14, "cryoExit"], // a dead ironworker near the cryo-lab exit
    ["schematic_third_rail_shoe", 146.8, 150.5, 8], // downtown workshop corner (workbench)
    ["schematic_siren_horn", 79.5, -333.5, 8], // Iron Covenant workbench, Rockefeller plaza
    ["schematic_molotov", -40, -238, 18], // The Neon, under the Fizzo Cola billboards
    ["schematic_third_rail_shoe", 240, -182, 14], // 2nd copy: Grand Central, by the old track-crew entrance
    ["schematic_third_rail_shoe", 80, -300, 14], // 3rd copy: Rockefeller checkpoint
    ["schematic_rivet_gun", 80, -207, 16], // 2nd copy: Bryant Park
    ["schematic_rivet_gun", -40, 930, 20], // 3rd copy: Battery Park
    ["schematic_siren_horn", 146, 170, 18], // 2nd copy: downtown
  ];
  const _down = new THREE.Vector3(0, -1, 0);
  /** Open ground near (x,z): a downward ray from 60 m must land near street level (not on a roof/in a building). */
  function findSpot(x, z, rad) {
    const L = G.LAYOUT;
    for (let ring = 0; ring <= 6; ring++) {
      const n = ring ? 8 + ring * 2 : 1;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + ring * 0.7,
          r = (ring / 6) * rad;
        const px = x + Math.cos(a) * r,
          pz = z + Math.sin(a) * r;
        if (L && L.isLand && !L.isLand(px, pz)) continue;
        let hit = null;
        try {
          hit = G.world.raycast(new THREE.Vector3(px, 60, pz), _down, 80, {
            ignoreTags: ["actor", "foliage"],
          });
        } catch (e) {
          hit = null;
        }
        const y = hit
          ? hit.point.y
          : G.world.terrainHeight
            ? G.world.terrainHeight(px, pz)
            : 0;
        if (y > 1.4 || y < -0.8) continue;
        if (hit && hit.normal && hit.normal.y < 0.8) continue;
        // the vertical ray marches terrain in 1 m steps: settle on the exact walkable surface
        let gy = y;
        try {
          if (G.world.groundHeight)
            gy = G.world.groundHeight(px, pz, y + 0.8, 0.05);
        } catch (e) {
          gy = y;
        }
        if (!isFinite(gy) || Math.abs(gy - y) > 1.2) gy = y;
        return { x: px, y: gy + 0.02, z: pz };
      }
    }
    return null;
  }
  let placed = false;
  function placeSchematics() {
    if (
      placed ||
      G.isStub("items") ||
      typeof G.items.spawnPickup !== "function"
    )
      return;
    placed = true;
    for (const [id, x0, z0, rad, anchor] of PLACEMENTS) {
      try {
        let x = x0,
          z = z0;
        if (anchor === "cryoExit") {
          const v = G.LAYOUT && G.LAYOUT.cryoExit;
          if (!v) continue;
          x = v.x + 6;
          z = v.z + 7;
        }
        const p = findSpot(x, z, rad);
        if (!p) {
          G.warn && G.warn("weapons: no spot for " + id);
          continue;
        }
        G.items.spawnPickup(id, 1, p, {
          yaw: (x * 13 + z * 7) % 6.28,
          static: true,
          keepY: true,
        });
      } catch (e) {
        G.reportError("weapons:placeSchematic " + id, e);
      }
    }
  }

  // ------------------------------------------------------------------
  // Save / reset / update / wiring
  // ------------------------------------------------------------------
  G.save.register("weapons_craft", {
    save: () => ({
      schem: Object.assign({}, S.schem),
      mods: JSON.parse(JSON.stringify(S.mods || {})),
    }),
    load: (d) => {
      S.schem = (d && d.schem) || {};
      S.mods = (d && d.mods) || {};
    },
  });
  G.events.on("reset", () => {
    S.schem = {};
    S.mods = {};
    clearFlying();
    pendingRemove.length = 0;
    if (UI.open) W.closeWorkbench();
  });
  G.events.on("initDone", () => {
    // swallow props' "lack the schematics" line for the workbench call we just handled
    if (typeof G.notify === "function" && !G.notify.__wpnWrapped) {
      const orig = G.notify;
      const wrapped = function (text) {
        if (
          suppressT &&
          performance.now() < suppressT &&
          /lack the schematics/i.test(String(text))
        )
          return;
        return orig.apply(this, arguments);
      };
      wrapped.__wpnWrapped = true;
      G.notify = wrapped;
    }
    placeSchematics();
  });
  /** Per-frame work, called from the weapons module update (90_api). */
  P.craftUpdate = function (dt, realDt) {
    {
      if (pendingRemove.length && invReal()) {
        const list = pendingRemove.splice(0);
        for (const [id, n] of list) {
          try {
            if (count(id) > 0)
              G.inventory.remove(id, Math.min(n, count(id)), { silent: true });
          } catch (e) {
            /* ignore */
          }
        }
      }
      updateFlying(dt);
      updateDots(dt);
      updateClouds(dt);
      updateFires(dt);
      if (UI.open && UI.msgT > 0) {
        UI.msgT -= realDt;
        if (UI.msgT <= 0) {
          UI.msg = "";
          if (UI.msgEl) UI.msgEl.textContent = "";
        }
      }
    }
  };
})();
