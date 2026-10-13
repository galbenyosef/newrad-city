// play-inline-509 01 — def
// Lines 15-216 of readable/play-inline-509.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  const C = G.__cmb;

  C.list = []; // all actors
  C.byId = new Map(); // stable id → actor
  C.pendingState = new Map(); // saved state for id'd actors not yet spawned (applied on spawn)
  C.ACTIVE_R = 175; // AI + in-scene radius
  C.DETACH_R = 215; // leave the scene beyond this (hysteresis)
  let uid = 0;

  const _v1 = new THREE.Vector3(),
    _v2 = new THREE.Vector3(),
    _m = new THREE.Matrix4();

  // ------------------------------------------------------------------
  // Character creation (G.chars or placeholder)
  // ------------------------------------------------------------------
  /** chars type naming: raider / continuity_soldier / covenant_warden may be human outfits in G.chars. */
  function charTypeFor(type) {
    if (G.isStub("chars")) return type;
    try {
      const types =
        typeof G.chars.types === "function" ? G.chars.types() : null;
      if (types && types.length && types.indexOf(type) < 0) {
        if (
          type === "raider" ||
          type === "continuity_soldier" ||
          type === "covenant_warden"
        )
          return "human";
        if (type === "bulwark") return "patrolman";
      }
    } catch (e) {
      /* ignore */
    }
    return type;
  }
  function charsKnows(t) {
    if (typeof G.chars.info !== "function") return true;
    try {
      return !!G.chars.info(t);
    } catch (e) {
      return false;
    }
  }
  function createCharacter(type, def) {
    const opts = {
      seed: def.seed !== undefined ? def.seed : Math.floor(Math.random() * 1e9),
      variant: def.variant,
      outfit: def.outfit,
      gender: def.gender,
      skinTone: def.skinTone,
      hair: def.hair,
      level: def.level,
    };
    if (def.burn) opts.burn = def.burn; // an old burn scar down one side of the face ('L' | 'R')
    if (def.scars !== undefined) opts.scars = def.scars;
    if (def.hat) {
      opts.hat = def.hat;
      if (def.hatColor !== undefined) opts.hatColor = def.hatColor;
    }
    if (!opts.outfit) {
      if (type === "raider")
        opts.outfit =
          (def.level || 1) > 6 && Math.random() < 0.5
            ? "raider_heavy"
            : "raider";
      else if (type === "continuity_soldier")
        opts.outfit = "continuity_exo_rig";
      else if (type === "covenant_warden") opts.outfit = "covenant_exo_rig";
    }
    if (!G.isStub("chars") && typeof G.chars.create === "function") {
      let ct = charTypeFor(type);
      const known = charsKnows(ct);
      if (known) {
        try {
          const ch = G.chars.create(
            ct,
            Object.assign({ addToScene: false }, opts),
          );
          if (ch && ch.root) {
            ch.autoUpdate = false;
            ch._cmbSeed = opts.seed;
            ch._cmbOutfit = opts.outfit;
            return ch;
          }
        } catch (e) {
          G.reportError("combat:chars.create " + type, e);
        }
      }
    }
    const ph = C.createPlaceholder(type, opts);
    if (ph) {
      ph._cmbSeed = opts.seed;
      ph._cmbOutfit = opts.outfit;
    }
    return ph;
  }

  // ------------------------------------------------------------------
  // NPC weapons
  // ------------------------------------------------------------------
  /** Normalised NPC weapon info: {id, name, damage, rof, automatic, magSize, reloadTime, spread, range, pellets,
   *  projectile, projectileSpeed, explosionRadius, sound, damageType, melee, beam, skill, critMult, ammo} */
  C.weaponInfo = function (wid) {
    if (!wid) return null;
    let d = null;
    if (!G.isStub("weapons") && typeof G.weapons.getDef === "function") {
      try {
        d = G.weapons.getDef(wid);
      } catch (e) {
        d = null;
      }
    }
    if (!d && !G.isStub("items") && typeof G.items.get === "function") {
      try {
        d = G.items.get(wid);
      } catch (e) {
        d = null;
      }
    }
    let w = d ? d.weapon || d : null;
    const fb = C.FALLBACK_WEAPONS[wid];
    if (!w || typeof w.damage !== "number") {
      if (!fb) return null;
      w = fb;
    }
    const sk = w.skill || "firearms";
    const melee = !!(w.melee || sk === "melee" || w.reloadType === "melee");
    const proj =
      w.projectile && w.projectile !== "hitscan" ? w.projectile : null;
    let beam = w.beamColor || null;
    if (
      !beam &&
      w.damageType === "energy" &&
      !proj &&
      !(w.melee || w.reloadType === "melee")
    )
      beam = "red";
    return {
      id: wid,
      name: (d && d.name) || wid,
      damage: w.damage || 5,
      rof: w.rof || 1,
      automatic: !!w.automatic,
      magSize: w.magSize || 0,
      reloadTime: w.reloadTime || 2,
      spread: w.spread !== undefined ? w.spread : 0.03,
      adsSpread:
        w.adsSpread !== undefined ? w.adsSpread : (w.spread || 0.03) * 0.4,
      range: melee ? w.meleeRange || w.range || 2 : w.range || 100,
      pellets: w.pellets || 1,
      projectile: proj,
      projectileSpeed: w.projectileSpeed || 40,
      explosionRadius: w.explosionRadius || 0,
      explosionKind: w.explosionKind || null,
      sound: w.sound || (melee ? "melee_swing" : "gun_pistol"),
      sfxPitch: w.sfxPitch || 1,
      damageType: w.damageType || "ballistic",
      melee,
      beam,
      skill: sk,
      critMult: w.critMult || 1,
      critChance: w.critChance || 1,
      unarmed: !!(
        w.unarmed ||
        w.skill === "unarmed" ||
        /fist|knuckle|^unarmed$/.test(wid)
      ),
      ammo: w.ammo || null,
      meleeArc: w.meleeArc || 1,
      flash: w.flash || null,
    };
  };
  /** Pick a weapon for an NPC of this pool/level; returns an id that resolves. */
  C.pickWeapon = function (poolKey, level) {
    const pool = C.pool(poolKey);
    if (!pool) return null;
    const pairs = pool(level || 1).filter((p) => C.weaponInfo(p[0]));
    if (!pairs.length) return null;
    return C.weighted(pairs);
  };
  function weaponModel(wid, info) {
    if (
      !G.isStub("weapons") &&
      typeof G.weapons.createWorldModel === "function"
    ) {
      try {
        const m = G.weapons.createWorldModel(wid);
        if (m) return m;
      } catch (e) {
        G.reportError("combat:createWorldModel " + wid, e);
      }
    }
    return C.placeholderWeaponModel(wid, info);
  }

  // ------------------------------------------------------------------
  // Actor
  // ------------------------------------------------------------------
