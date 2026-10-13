// play-inline-525 06 — kind
// Lines 1482-1767 of readable/play-inline-525.pretty.js (statement-aligned).
  function fallbackSquad(kind) {
    const P = G.player.pos;
    const s = K.streetSpot(P.x, P.z, 70, 110, {
      road: true,
      hidden: true,
      notSettlement: true,
      clear: 1,
      tries: 40,
    });
    if (!s) return [];
    const factions =
      !G.isStub("combat") && G.combat.factions ? G.combat.factions() : [];
    const fac =
      kind === "merc"
        ? factions.indexOf("mercenaries") >= 0
          ? "mercenaries"
          : "raiders"
        : factions.indexOf("lawmen") >= 0
          ? "lawmen"
          : "raiders";
    const out = [],
      n = K.randInt(3, 4),
      lvl = K.level();
    for (let i = 0; i < n; i++) {
      const sp = K.freeSpotNear(
        s.x + (Math.random() - 0.5) * 5,
        s.z + (Math.random() - 0.5) * 5,
        3,
        8,
      );
      if (!sp) continue;
      const lead = i === 0;
      const a = K.spawnActor({
        type: "human",
        outfit: kind === "merc" ? "combat_armor" : "leather_armor",
        hat: kind === "merc" ? "helmet" : "cowboy",
        faction: fac,
        hostile: true,
        name:
          kind === "merc"
            ? lead
              ? "Mercenary Captain"
              : "Mercenary"
            : lead
              ? "Posse Marshal"
              : "Posse Deputy",
        level: Math.max(4, lvl + (lead ? 2 : 0)),
        pos: sp,
        ai: "patrol",
        patrol: [{ x: P.x, z: P.z }],
        weapon: squadWeapon(),
        noRespawn: true,
        inventory: K.stock(
          lead
            ? [
                [K.SCRIP, K.randInt(40, 120)],
                [kind === "merc" ? "amb_note_contract" : "amb_note_warrant", 1],
                ["rally_tonic", 1],
              ]
            : [[K.SCRIP, K.randInt(5, 30)]],
        ),
      });
      if (a) out.push(a);
    }
    return out;
  }

  // ------------------------------------------------------------------
  // Director
  // ------------------------------------------------------------------
  const KINDS = {
    stranger: { make: encStranger, cd: 60, w: () => (K.isDark() ? 0.7 : 0) },
    preacher: { make: encPreacher, cd: 36, w: () => (K.isDark() ? 0.15 : 1) },
    lost_sleeper: {
      make: encLostSleeper,
      cd: 24 * 5,
      w: () => (questDone() || sleeper ? 0 : K.isDark() ? 0.2 : 0.9),
    },
    dog_chase: { make: encDogChase, cd: 20, w: () => 1.0 },
    dead_drop: { make: encDeadDrop, cd: 10, w: () => 1.3 },
    crash_site: { make: encCrash, cd: 48, w: () => (K.level() >= 3 ? 0.5 : 0) },
    hit_squad: {
      make: () => encHitSquad(),
      cd: 72,
      w: () =>
        K.level() >= 4 && hitSquadKind() && K.day() - stats.lastHitSquadDay >= 3
          ? 2.2
          : 0,
    },
  };
  function questDone() {
    try {
      return (
        questApi() &&
        (G.quests.isComplete(Q_ID) ||
          (G.quests.isFailed && G.quests.isFailed(Q_ID)))
      );
    } catch (e) {
      return false;
    }
  }

  function start(kind) {
    const k = KINDS[kind];
    if (!k) return null;
    if (active) end(active, "replaced");
    let E = null;
    try {
      E = k.make();
    } catch (e) {
      G.reportError("ambient:encounter " + kind, e);
      E = null;
    }
    if (!E) return null;
    active = E;
    setCooldown(kind, k.cd);
    K.log("encounter", kind, Math.round(K.distToPlayer(E.x, E.z)) + "m");
    G.events.emit("ambientEncounter", kind, E);
    return E;
  }
  function roll() {
    const P = G.player;
    if (
      !K.playerOutdoors() ||
      G.state !== "play" ||
      K.inCombat() ||
      !K.hasActors()
    )
      return;
    if (
      K.friendlyLocAt(P.pos.x, P.pos.z, 20) ||
      K.hostileLocAt(P.pos.x, P.pos.z, 10)
    )
      return;
    // guarded towns (combat 45_safezone): encounters spawn 60–120 m out, so keep clear of zone + 120 m
    try {
      if (
        !G.isStub("combat") &&
        G.combat.isSafeZone &&
        G.combat.isSafeZone(P.pos.x, P.pos.z, 120)
      )
        return;
    } catch (e) {
      /* ignore */
    }
    if (liveAdopted() > MAX_ADOPTED_ACTORS - 4) return;
    const pairs = [];
    for (const kind in KINDS) {
      if (!ready(kind)) continue;
      const w = KINDS[kind].w();
      if (w > 0) pairs.push([kind, w]);
    }
    const kind = K.weighted(pairs);
    if (kind) start(kind);
  }
  function update(dt) {
    if (dt <= 0 || !K.playerOk()) return;
    const t = K.now();
    // encounter + adopted groups (4 Hz is plenty)
    E_T += dt;
    if (E_T >= 0.25) {
      const step = E_T;
      E_T = 0;
      if (active) {
        let r = null;
        try {
          r = active.update(step);
        } catch (e) {
          G.reportError("ambient:encounter " + active.kind, e);
          r = "error";
        }
        if (r) end(active, r);
      }
      if (t > G_T) {
        G_T = t + 2;
        updateGroups();
      }
    }
    // roll for a new one every 45–90 s of game time while nothing is running
    if (!nextRollT) nextRollT = t + K.rand(60, 120);
    if (!active && t > nextRollT) {
      nextRollT = t + K.rand(45, 90);
      if (Math.random() < 0.55) roll();
    }
  }
  let E_T = 0,
    G_T = 0;

  K.system({
    name: "encounters",
    order: 60,
    initDone() {
      defineNotes();
      registerPreacherDialogue();
      sleeperDialogue();
      defineQuest();
    },
    newGame() {
      defineNotes();
      registerPreacherDialogue();
      sleeperDialogue();
      defineQuest();
    },
    reset() {
      if (active) {
        try {
          active.cleanup("reset");
        } catch (e) {
          /* ignore */
        }
        active = null;
      }
      clearGroups();
      sleeper = null;
      nextRollT = 0;
      for (const k in cooldown) delete cooldown[k];
      Object.assign(stats, {
        strangerSeen: 0,
        lostSleeper: 0,
        preacher: 0,
        hitSquads: 0,
        lastHitSquadDay: -99,
      });
    },
    update,
    save: () => ({
      cd: Object.assign({}, cooldown),
      stats: Object.assign({}, stats),
    }),
    load(d) {
      if (!d) return;
      if (d.cd)
        for (const k in d.cd)
          if (KINDS[k] && typeof d.cd[k] === "number") cooldown[k] = d.cd[k];
      if (d.stats)
        for (const k in stats)
          if (typeof d.stats[k] === "number") stats[k] = d.stats[k];
      // an escort in progress doesn't survive a load (the actor is transient): let the quest fail gracefully
      if (questActive()) failQuest();
    },
  });

  const _v = new THREE.Vector3();
  K.encounters = {
    adopt,
    start,
    end: (r) => end(active, r || "debug"),
    active: () => active,
    kinds: () => Object.keys(KINDS),
    stats: () =>
      Object.assign(
        {
          active: active ? active.kind : null,
          groups: groups.length,
          adopted: liveAdopted(),
        },
        stats,
      ),
    roll,
    cooldowns: () => Object.assign({}, cooldown),
    QUEST_ID: Q_ID,
    /** Register an extra encounter kind (62_encounters_more.js): def {make() → E|null, cd: game hours, w() → weight}. */
    register(kind, def) {
      KINDS[kind] = def;
      return def;
    },
    /** Shared plumbing for encounter files. */
    util: { castGone, removeCast, setCooldown, ready, questApi },
    /** Force a hit squad now: 'merc' (high standing) | 'marshal' (low standing) | undefined (by standing). */
    hitSquad(kind) {
      if (active) end(active, "replaced");
      let E = null;
      try {
        E = encHitSquad(
          kind === "merc" || kind === "marshal" ? kind : undefined,
        );
      } catch (e) {
        G.reportError("ambient:hitsquad", e);
      }
      if (E) {
        active = E;
        setCooldown("hit_squad", KINDS.hit_squad.cd);
      }
      return E;
    },
  };
