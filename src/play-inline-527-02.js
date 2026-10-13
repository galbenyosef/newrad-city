// play-inline-527 02 — managed
// Lines 370-496 of readable/play-inline-527.pretty.js (statement-aligned).
  function update(dt) {
    if (dt <= 0 || !K.playerOk() || G.isStub("actors")) return;
    tickT += dt;
    // walking sleepers: check arrival at 4 Hz
    if (managed.size)
      for (const [a, r] of managed) {
        if (!a || a.dead || a.removed || a._ambGone) {
          restore(a, r, true);
          continue;
        }
        if (
          a.inCombat ||
          a.state === "combat" ||
          a.state === "flee" ||
          a.hostile()
        ) {
          restore(a, r, true);
          continue;
        }
        if (r.phase === "walk") {
          r.t += dt;
          if (
            Math.hypot(a.pos.x - r.spot.x, a.pos.z - r.spot.z) < 1.2 ||
            r.t > 40
          )
            lieDown(a, r);
        }
      }
    if (tickT < 1) return;
    tickT = 0;
    const P = G.player;
    const list =
      typeof G.actors.inRadius === "function"
        ? G.actors.inRadius(P.pos, SCAN_R)
        : [];
    for (let i = 0; i < list.length; i++) {
      const a = list[i];
      const r = managed.get(a);
      if (r) {
        // time to get up?
        const still =
          r.mode === "guard"
            ? K.isDark()
            : r.mode === "storm"
              ? stormCover(a)
              : wantsSleep(a);
        if (!still && !K.actorBusy(a)) restore(a, r, false);
        continue;
      }
      if (a.dead || a.inCombat || a.state !== "idle" || K.actorBusy(a))
        continue;
      if (
        !OK_FACTIONS[a.faction] ||
        a.stableId ||
        a.hostile() ||
        a.isCreature ||
        a.isRobot
      )
        continue;
      if (!locOf(a)) continue;
      // guards: night-watch barks only (and only if they had no custom lines)
      if (a.aiMode === "guard") {
        if (K.isDark() && !a.customBarks && !a.merchant && !a.dialogue) {
          managed.set(a, {
            mode: "guard",
            orig: snapshot(a),
            roll: -1,
            phase: "asleep",
          });
          a.customBarks = NIGHT_GUARD;
        }
        continue;
      }
      if (a.aiMode !== "wander" || !eligibleResident(a)) continue;
      if (managed.size >= MAX_SLEEPERS * 2) continue;
      if (stormCover(a)) goToBed(a, "storm");
      else if (wantsSleep(a)) goToBed(a, "bed");
    }
    // anyone who drifted out of range is restored silently (they'd be asleep at their spot anyway)
    for (const [a, r] of managed)
      if (!a || a.removed || K.distToPlayer(a.pos.x, a.pos.z) > SCAN_R + 60)
        restore(a, r, true);
  }

  function clear() {
    for (const [a, r] of managed) {
      try {
        restore(a, r, true);
      } catch (e) {
        /* ignore */
      }
    }
    managed.clear();
    for (let i = 0; i < MAX_SLEEPERS; i++) if (rollUsed[i]) freeRoll(i);
  }

  K.system({
    name: "schedules",
    order: 70,
    init() {
      buildRolls();
    },
    reset() {
      clear();
    },
    update,
  });

  K.schedules = {
    managed: () =>
      Array.from(managed.entries()).map(([a, r]) => ({
        name: a.name,
        mode: r.mode,
        phase: r.phase,
        ai: a.aiMode,
      })),
    count: () => managed.size,
    asleep: (a) => {
      const r = managed.get(a);
      return !!(r && r.phase === "asleep" && r.mode !== "guard");
    },
    clear,
    tick: () => {
      tickT = 1;
      update(0.001);
    },
  };
