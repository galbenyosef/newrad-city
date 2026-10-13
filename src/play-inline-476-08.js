// play-inline-476 08 — stats
// Lines 2180-2371 of readable/play-inline-476.pretty.js (statement-aligned).
  function growNeeds(hours, sleeping) {
    const N = S.needs;
    if (!N || !N.on || !(hours > 0)) return;
    N.food = Math.min(1000, N.food + NEEDS.food.perHour * hours);
    N.water = Math.min(
      1000,
      N.water + NEEDS.water.perHour * hours * (sleeping ? 0.6 : 1),
    );
    if (sleeping) N.sleep = Math.max(0, N.sleep - hours * 125);
    else N.sleep = Math.min(1000, N.sleep + NEEDS.sleep.perHour * hours);
    let changed = false;
    for (const k of NEED_KEYS) {
      const t = needTier(k);
      if (t !== lastNeedTier[k]) {
        if (t > lastNeedTier[k])
          G.notify("You are " + NEEDS[k].tiers[t].name.toLowerCase() + ".", {
            kind: "need",
            need: k,
            tier: t,
          });
        lastNeedTier[k] = t;
        changed = true;
      }
      if (N[k] >= 1000 && G.player && G.player.alive && G.player.die)
        G.player.die({
          type:
            k === "food"
              ? "starvation"
              : k === "water"
                ? "dehydration"
                : "exhaustion",
        });
    }
    if (changed) {
      dirty = true;
      G.events.emit("effectsChanged");
    }
  }
  function updateNeeds(dt) {
    if (!S.needs || !S.needs.on || !(dt > 0)) return;
    growNeeds((dt * ((G.time && G.time.minutesPerSecond) || 0.5)) / 60, false);
  }
  function setHardcore(on) {
    S.needs = S.needs || { on: false, food: 0, water: 0, sleep: 0 };
    S.needs.on = !!on;
    dirty = true;
    G.events.emit("effectsChanged");
    try {
      if (G.inventory && G.inventory._invalidateWeight)
        G.inventory._invalidateWeight();
    } catch (e) {
      /* ignore */
    }
    return S.needs.on;
  }

  /** Doctor services. what: {hp, rads, limbs, addictions} (all true by default). */
  function doctorHeal(what) {
    what = what || { hp: true, rads: true, limbs: true, addictions: true };
    const P = G.player;
    if (what.hp && P) P.hp = P.maxHp;
    if (what.rads && P) {
      P.rads = 0;
      G.events.emit("radsChanged", 0, 0);
    }
    if (what.limbs) healLimbs(100);
    if (what.addictions) cureAddictions(false);
    dirty = true;
    G.events.emit("effectsChanged");
  }

  // ------------------------------------------------------------------
  // Hero profile (fixed protagonist; no allocation screen)
  // ------------------------------------------------------------------
  function setAttrs(obj) {
    const a = normAttrs(obj);
    if (!a) return;
    for (const k in a)
      S.attrs[k] = U.clamp(
        Math.round(obj[k] !== undefined ? obj[k] : a[k]),
        1,
        10,
      );
    dirty = true;
    G.events.emit("attrsChanged");
  }

  // ------------------------------------------------------------------
  // Medallions & manuals
  // ------------------------------------------------------------------
  /**
   * A World's Fair medallion was found. Medallions grant nothing by themselves: the set is a collection the
   * Fair's last curator (src/quests/55_medallions.js) pays for. S.medallions remembers every one ever found
   * (so a medallion handed over is never offered twice); the quest keeps the hand-in count.
   */
  function collectMedallion(def) {
    if (typeof def === "string")
      def = G.items.get(def) || G.items.get(G.items.medallionId(def));
    if (!def || !def.medallion) return false;
    S.medallions[def.id] = true;
    S.stats.medallions = Object.keys(S.medallions).length;
    dirty = true;
    G.events.emit("medallionFound", def.id, S.stats.medallions);
    G.notify(def.name + " found (" + S.stats.medallions + "/20).", {
      kind: "medallion",
      icon: "medallion",
    });
    return true;
  }
  function hasMedallion(id) {
    const d = G.items.get(id);
    return !!(d && S.medallions[d.id]);
  }
  /** Skill manual: a permanent +2 (+1 more and 75 XP with Bookworm). */
  function readBook(def) {
    if (!def || !def.book) return false;
    const bw = recalc().M.bookBonus || 0;
    boostSkill(def.book.skill, 2 + bw, "book");
    S.stats.booksRead++;
    if (bw) addXP(75, "Bookworm");
    return true;
  }

  // ------------------------------------------------------------------
  // Save / reset
  // ------------------------------------------------------------------
  function serialize() {
    return {
      v: 2,
      attrs: S.attrs,
      practice: S.practice,
      bookPts: S.bookPts,
      medallions: S.medallions,
      level: S.level,
      xp: S.xp,
      attrPoints: S.attrPoints,
      talentPicks: S.talentPicks,
      talents: S.talents,
      talentChoices: S.talentChoices,
      standing: S.standing,
      effects: S.effects,
      addictions: S.addictions,
      limbs: S.limbs,
      radTier: S.radTier,
      difficulty: S.difficulty,
      stats: S.stats,
      needs: S.needs,
    };
  }
  function deserialize(d) {
    S = freshState();
    SWAY.yaw = SWAY.pitch = SWAY.amp = 0;
    if (!d) return;
    for (const k in d)
      if (d[k] !== undefined && S.hasOwnProperty(k)) S[k] = d[k];
    if (d.v !== 2) {
      // an older save: carry the level / XP / effects over, rebuild the character sheet
      S.attrPoints = Math.floor((S.level || 1) / 2);
      S.talentPicks = Math.max(0, (S.level || 1) - 1);
      S.talents = {};
      S.talentChoices = {};
    }
    const f = freshState();
    for (const k of ATTRS)
      if (typeof S.attrs[k] !== "number") S.attrs[k] = f.attrs[k];
    for (const k of SKILLS) {
      if (S.practice[k] === undefined) S.practice[k] = 0;
      if (S.bookPts[k] === undefined) S.bookPts[k] = 0;
    }
    for (const l of LIMBS) if (S.limbs[l] === undefined) S.limbs[l] = 100;
    S.needs = Object.assign(f.needs, S.needs || {});
    for (const k of NEED_KEYS) lastNeedTier[k] = S.needs.on ? needTier(k) : 0;
    S.stats = Object.assign(f.stats, S.stats || {});
    // stats from before the medicine rename / magazine removal
    if (S.stats.medJetsUsed) S.stats.tonicsUsed += S.stats.medJetsUsed;
    if (S.stats.purgeUsed) S.stats.prussianBlueUsed += S.stats.purgeUsed;
    delete S.stats.medJetsUsed;
    delete S.stats.purgeUsed;
    delete S.stats.magazinesRead;
    S.medallions = S.medallions || {};
    dirty = true;
  }
  function reset() {
    S = freshState();
    dirty = true;
    for (const k of NEED_KEYS) lastNeedTier[k] = 0;
    SWAY.yaw = SWAY.pitch = SWAY.amp = 0;
  }

  // ------------------------------------------------------------------
  // Public namespace
  // ------------------------------------------------------------------
