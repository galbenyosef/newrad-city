// play-inline-476 03 — def
// Lines 705-1028 of readable/play-inline-476.pretty.js (statement-aligned).
  function spendAttrPoint(id) {
    id = attrId(id);
    if (!ATTR_INFO[id] || S.attrPoints <= 0 || S.attrs[id] >= 10) return false;
    S.attrs[id]++;
    S.attrPoints--;
    dirty = true;
    G.events.emit("attrsChanged", id);
    G.notify(ATTR_INFO[id].name + " increased to " + S.attrs[id] + ".", {
      kind: "attr",
      attr: id,
    });
    const P = G.player;
    if (P) {
      recalc(true);
      P.maxHp = maxHp();
    }
    return true;
  }
  /** Permanently raise a skill (manuals, quest rewards, trainers). */
  function boostSkill(id, n, source) {
    id = skillId(id);
    if (!SKILL_INFO[id]) return 0;
    const room = 100 - skillBase(id);
    const k = Math.max(0, Math.min(n, room));
    S.bookPts[id] = (S.bookPts[id] || 0) + k;
    dirty = true;
    G.events.emit("skillsChanged", id);
    if (source !== "silent")
      G.notify(SKILL_INFO[id].name + " increased to " + skillBase(id) + ".", {
        kind: "skill",
        skill: id,
      });
    return k;
  }

  // ------------------------------------------------------------------
  // Talents
  // ------------------------------------------------------------------
  function talentEligibility(def) {
    const r = talentRank(def.id);
    if (def.hidden) return { ok: false, reason: "Earned in the field" };
    if (r >= def.ranks) return { ok: false, reason: "Max rank" };
    const lvlReq = def.reqLevel + (def.levelStep ? r * def.levelStep : 0);
    if (S.level < lvlReq)
      return { ok: false, reason: "Requires level " + lvlReq };
    for (const k in def.reqAttrs)
      if (S.attrs[k] < def.reqAttrs[k])
        return {
          ok: false,
          reason: "Requires " + ATTR_INFO[k].name + " " + def.reqAttrs[k],
        };
    for (const k in def.reqSkills)
      if (skillBase(k) < def.reqSkills[k])
        return {
          ok: false,
          reason: "Requires " + SKILL_INFO[k].name + " " + def.reqSkills[k],
        };
    if (def.reqStanding === "good" && S.standing < 250)
      return { ok: false, reason: "Requires Respected standing" };
    if (def.reqStanding === "bad" && S.standing > -250)
      return { ok: false, reason: "Requires Distrusted standing" };
    if (def.canTake && !def.canTake())
      return { ok: false, reason: def.cantReason || "Unavailable" };
    if (def.needsHook && !HOOKS[def.needsHook])
      return { ok: false, reason: "Not yet available" };
    return { ok: true, reason: "" };
  }
  /** World features other modules declare they honour (e.g. 'traps' for Light Feet). */
  const HOOKS = {};
  function declareHook(name) {
    if (name) {
      HOOKS[name] = true;
      dirty = true;
    }
  }
  function talentsEligible() {
    return TALENTS.filter((p) => talentEligibility(p).ok);
  }
  function talentsAvailable() {
    return S.talentPicks > 0 ? talentsEligible() : [];
  }
  /** Every selectable Talent with eligibility info, for the level-up screen. */
  function talentList() {
    return TALENTS.filter((p) => !p.hidden).map((p) => {
      const el = talentEligibility(p);
      return {
        id: p.id,
        name: talentName(p),
        desc: talentDesc(p),
        icon: p.icon,
        rank: talentRank(p.id),
        ranks: p.ranks,
        reqLevel: p.reqLevel,
        eligible: el.ok,
        reason: el.reason,
        choice: p.choice || null,
        def: p,
      };
    });
  }
  function takeTalent(id, choice, opts) {
    id = talentKey(id);
    const def = TALENT_MAP.get(id);
    if (!def) return false;
    opts = opts || {};
    if (!opts.free) {
      if (S.talentPicks <= 0) return false;
      if (!talentEligibility(def).ok) return false;
    }
    S.talents[id] = (S.talents[id] || 0) + 1;
    if (!opts.free) S.talentPicks--;
    if (choice !== undefined && choice !== null)
      (S.talentChoices[id] = S.talentChoices[id] || []).push(choice);
    dirty = true;
    try {
      if (def.apply) def.apply(choice, S.talents[id]);
    } catch (e) {
      G.reportError("rpg:talentApply:" + id, e);
    }
    dirty = true;
    G.events.emit("talentTaken", id, S.talents[id]);
    return true;
  }
  /** Quest / scripted grant (ignores requirements & picks), e.g. exo-rig certification. */
  function grantTalent(id, silent) {
    id = talentKey(id);
    const def = TALENT_MAP.get(id);
    if (!def) return false;
    if (talentRank(id) >= def.ranks) return false;
    takeTalent(id, undefined, { free: true });
    if (!silent)
      G.notify("Talent gained: " + talentName(def), {
        kind: "talent",
        talent: id,
      });
    return true;
  }
  function playerTalents() {
    const out = [];
    for (const id in S.talents) {
      const def = TALENT_MAP.get(id);
      if (!def || !S.talents[id]) continue;
      out.push({
        id,
        name: talentName(def),
        desc: talentDesc(def),
        rank: S.talents[id],
        ranks: def.ranks,
        icon: def.icon,
        def,
      });
    }
    return out.sort((a, b) => a.name.localeCompare(b.name));
  }

  // ------------------------------------------------------------------
  // Derived stats
  // ------------------------------------------------------------------
  function maxHp() {
    const d = recalc();
    return Math.round(80 + d.attrs.grit * 15 + S.level * 8 + d.M.hp);
  }
  /** Sprint stamina pool (G.player.stamina / maxStamina). */
  function maxStamina() {
    const d = recalc();
    return Math.round(60 + d.attrs.reflex * 4 + d.attrs.grit * 2 + d.M.stamina);
  }
  function staminaRegen() {
    const d = recalc();
    return Math.max(2, (8 + d.attrs.reflex * 0.8) * (1 + d.M.staminaRegenMult));
  }
  function carryWeight() {
    const d = recalc();
    return Math.round(140 + d.attrs.brawn * 12 + d.M.carry);
  }
  /** Critical chance in percent (Senses + Talents; the caller multiplies by the weapon's crit multiplier). */
  function critChance(weaponDef) {
    const d = recalc();
    let c = 2 + d.attrs.senses * 0.8 + d.M.crit;
    if (weaponDef === undefined) weaponDef = currentWeaponDef();
    const w = weaponBlock(weaponDef);
    if (w && (w.skill === "melee" || w.melee)) c += d.M.critMelee;
    return U.clamp(c, 0, 100);
  }
  /** Critical damage multiplier: Talents (Executioner, Trapper vs creatures, Shadow Step on sneak crits). */
  function critDamageMult(target, info) {
    const d = recalc();
    const M = d.M;
    let m = 1 + M.critDmg;
    const cls =
      target && typeof target === "object" ? classifyTarget(target) : null;
    if (cls && cls.creature && M.critDmgVs.creature) m += M.critDmgVs.creature;
    if (info && info.sneak) m += M.sneakAttackMult;
    return m;
  }
  function currentWeaponDef() {
    try {
      if (!G.isStub("weapons") && G.weapons.current) {
        const c = G.weapons.current();
        if (c && c.id) return G.items.get(c.id) || c;
      }
      if (!G.isStub("inventory")) {
        const id = G.inventory.equipped("weapon");
        if (id) return G.items.get(id);
      }
    } catch (e) {
      /* ignore */
    }
    return null;
  }
  function speedMult() {
    const d = recalc();
    return U.clamp(1 + d.M.speedMult, 0.3, 1.6);
  }
  function radResist() {
    const d = recalc();
    return U.clamp(d.attrs.grit * 2 + d.M.radResist, 0, 85);
  }
  function getDR(type) {
    const d = recalc();
    let dr = d.M.dr;
    if (
      type === "energy" ||
      type === "laser" ||
      type === "plasma" ||
      type === "ray" ||
      type === "arc"
    )
      dr += d.M.energyResist;
    if (type === "fire") dr += d.M.fireResist;
    if (type === "poison") return U.clamp(d.M.poisonResist, 0, 85);
    return U.clamp(dr, 0, 85);
  }
  function getDT() {
    return Math.max(0, recalc().M.dt);
  }
  function inventoryWeight() {
    try {
      return G.isStub("inventory") ? 0 : G.inventory.weight();
    } catch (e) {
      return 0;
    }
  }
  function isOverencumbered() {
    return inventoryWeight() > carryWeight();
  }
  function isStealthed() {
    return recalc().M.stealth > 0;
  }
  function sneakBonus() {
    const d = recalc();
    return d.skills.stealth + d.M.sneak;
  }
  function sneakAttackMult() {
    return 2 * (1 + recalc().M.sneakAttackMult);
  }
  function lootScripMult() {
    return 1 + recalc().M.lootScrip;
  }
  function lootAmmoMult() {
    return 1 + recalc().M.lootAmmo;
  }
  function wearingExoRig() {
    recalc();
    return D.exoRig;
  }
  /** Reload time multiplier (Reflex + Quick Hands). */
  function reloadMult() {
    const d = recalc();
    return U.clamp(
      (1.15 - d.attrs.reflex * 0.03) * (1 + d.M.reloadMult),
      0.5,
      1.3,
    );
  }
  /** Recoil multiplier (Reflex). */
  function recoilMult() {
    const d = recalc();
    return U.clamp(1.2 - d.attrs.reflex * 0.04, 0.7, 1.2);
  }

  // ------------------------------------------------------------------
  // Weapon-facing multipliers (queried by weapons / combat)
  // ------------------------------------------------------------------
  function weaponBlock(def) {
    if (!def) return null;
    if (typeof def === "string") {
      const d = G.items.get(def);
      return d ? d.weapon || null : null;
    }
    return def.weapon || (def.skill ? def : null);
  }
  function weaponSkill(def) {
    const w = weaponBlock(def);
    return w && w.skill ? skillId(w.skill) : null;
  }
  function isOneHanded(def) {
    const w = weaponBlock(def) || {};
    if (w.oneHanded !== undefined) return !!w.oneHanded;
    if (w.twoHanded !== undefined) return !w.twoHanded;
    const id = (def && (def.id || "")) + " " + (w.viewmodel || "");
    return /pistol|revolver|magnum|44|knuckle|knife|fist/.test(id);
  }
  /** Skill scaling only: damage × (0.6 + skill/250). */
  function skillDamageMult(weaponDef) {
    const sk = weaponSkill(weaponDef);
    if (!sk || !SKILL_INFO[sk]) return 1;
    return 0.6 + recalc().skills[sk] / 250;
  }
  // ------------------------------------------------------------------
  // Target classification: who a Talent's "+X% damage vs …" applies to
  // ------------------------------------------------------------------
  const EVIL_FACTIONS = { raiders: 1, continuity: 1, slavers: 1 };
  const GOOD_FACTIONS = {
    settlers: 1,
    cryo: 1,
    covenant: 1,
    citizens: 1,
    merchants: 1,
  };
  /**
   * Classify an actor (combat Actor, or any {type, faction, def, td}) for Talent bonuses.
   * Returns {robot, insect, creature, animal, human, maniac, brute, evil, good}.
   */
