// play-inline-556 10 — rec
// Lines 2964-3049 of readable/play-inline-556.pretty.js (statement-aligned).
  L.hook("reset", function () {
    cache.clear();
    town.recs.clear();
    town.spawned = false;
    town.gather = null;
    convo.t = 0;
    convo.busyUntil = 0;
  });

  // ------------------------------------------------------------------
  // Update: the crowd sleeps when the player is far away (performance cap)
  // ------------------------------------------------------------------
  let tickT = 0,
    lifeT = 0;
  L.hook("update", function (dt) {
    if (!town.spawned || !G.player || dt <= 0) return;
    const P = G.player.pos;
    const o = NEON_CELL();
    const near = isInt(P.x)
      ? Math.abs(P.x - o.x) < 170 && Math.abs(P.z - o.z) < 170
      : Math.hypot(P.x - TS.x, P.z - TS.z) < 260;
    if (!near) return;
    tickT += dt;
    lifeT += dt;
    if (tickT >= 0.5) {
      const step = tickT;
      tickT = 0;
      for (const rec of town.recs.values()) {
        if (!rec.def.routine || busy(rec.a)) continue;
        try {
          steer(rec, step);
        } catch (e) {
          G.reportError("quests:neon steer " + rec.id, e);
          rec.def = Object.assign({}, rec.def, { routine: null });
        }
      }
    }
    if (lifeT >= 1) {
      lifeT = 0;
      try {
        lifeTick();
      } catch (e) {
        G.reportError("quests:neon life", e);
      }
    }
  });

  // Debug (dev console): G.quests.debug.neon()
  Q.debug.neon = function () {
    return Array.from(town.recs.values()).map((r) => ({
      id: r.id,
      act: r.act,
      leg: r.leg,
      anchor: r.post && r.post.name,
      how: r.post
        ? r.post.fallback
          ? "fallback"
          : /→/.test(r.post.name || "")
            ? "built-alias"
            : "plan"
        : "?",
      x: +r.a.pos.x.toFixed(1),
      z: +r.a.pos.z.toFixed(1),
      state: r.a.state,
      mode: r.a.aiMode,
      dead: r.a.dead,
    }));
  };
  /** Where the Neon stands: placement mix, skipped services, which places exist (and through which anchor). */
  Q.debug.neonPlaces = function () {
    const rows = Q.debug.neon(),
      count = { plan: 0, "built-alias": 0, fallback: 0 };
    for (const r of rows) count[r.how] = (count[r.how] || 0) + 1;
    const places = {};
    for (const k in PLACES) {
      const a = placeOf(k);
      places[k] = a ? a.name : null;
    }
    return {
      spawned: rows.length,
      placement: count,
      skipped: (town.skipped || []).slice(),
      places,
      fallbacks: rows.filter((r) => r.how === "fallback").map((r) => r.id),
    };
  };
