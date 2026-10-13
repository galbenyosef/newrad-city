// play-inline-509 04 — pos
// Lines 1299-1401 of readable/play-inline-509.pretty.js (statement-aligned).
  AP.nearest = function (pos, maxDist, pred) {
    let best = null,
      bd = maxDist === undefined ? 1e9 : maxDist;
    for (const a of C.list) {
      if (pred && !pred(a)) continue;
      const d = Math.hypot(a.pos.x - pos.x, a.pos.z - pos.z);
      if (d < bd) {
        bd = d;
        best = a;
      }
    }
    return best;
  };
  AP.inRadius = (pos, r) =>
    C.list.filter((a) => Math.hypot(a.pos.x - pos.x, a.pos.z - pos.z) <= r);
  AP.remove = function (a) {
    if (!a) return;
    const i = C.list.indexOf(a);
    if (i >= 0) C.list.splice(i, 1);
    if (a.stableId && C.byId.get(a.id) === a) C.byId.delete(a.id);
    a.dispose();
    a.removed = true;
  };
  AP.clear = function () {
    for (const a of C.list.slice()) AP.remove(a);
    C.list.length = 0;
    C.byId.clear();
    C.clearBarks();
  };
  AP.count = () => C.list.length;
  AP.alive = () => C.list.filter((a) => !a.dead);
  /** Hostile (to player), living actors in radius. */
  AP.hostilesNear = (pos, r) =>
    C.list.filter(
      (a) =>
        !a.dead &&
        a.hostile() &&
        Math.hypot(a.pos.x - pos.x, a.pos.z - pos.z) <= r,
    );
  /** Actors currently fighting the player (for HUD compass ticks). */
  AP.inCombatWithPlayer = () =>
    C.list.filter((a) => !a.dead && a.inCombat && a.target === "player");
  AP.types = () => Object.keys(C.TYPES);
  AP.typeInfo = (t) => C.TYPES[t] || null;
  AP.Actor = Actor;

  /** 'covenant' | 'continuity' | null — faction colours of the body armour the player wears. */
  C.playerArmorFaction = function () {
    if (G.isStub("inventory") || typeof G.inventory.list !== "function")
      return null;
    try {
      for (const e of G.inventory.list("apparel") || []) {
        if (!e || !e.equipped) continue;
        const d =
          e.def || (G.items && G.items.get ? G.items.get(e.id) : null) || {};
        const tags = d.tags || [];
        if (
          d.outfit === "continuity_exo_rig" ||
          tags.indexOf("continuity") >= 0
        )
          return "continuity";
        if (d.outfit === "covenant_exo_rig" || tags.indexOf("covenant") >= 0)
          return "covenant";
      }
    } catch (e) {
      /* ignore */
    }
    return null;
  };

  // Saved state helpers (stable-id actors)
  C.actorSaveState = (a) => ({
    dead: a.dead,
    hp: Math.round(a.hp),
    x: +a.pos.x.toFixed(2),
    y: +a.pos.y.toFixed(2),
    z: +a.pos.z.toFixed(2),
    yaw: +a.yaw.toFixed(2),
    host: a.hostOverride,
    inv: a.dead ? a.inventory : undefined,
    follow: a.following === "player" ? "player" : undefined,
    name: a.name,
    ff: a.wasFriendly || undefined,
  });
  C.applySavedActorState = function (a, s) {
    if (!s) return;
    if (typeof s.x === "number") {
      a.pos.set(s.x, s.y || 0, s.z);
      a.yaw = s.yaw || 0;
      a.applyYaw();
    }
    if (s.host !== undefined)
      a.hostOverride = s.host === null ? undefined : s.host;
    if (s.ff) a.wasFriendly = true; // an essential the player angered can still calm down after a load (C.calmEssential)
    if (s.name) a.name = s.name;
    if (s.dead) {
      a.hp = 0;
      C.killActor(a, { silent: true, restore: true });
      if (s.inv) a.inventory = s.inv;
    } else if (typeof s.hp === "number")
      a.hp = Math.max(1, Math.min(a.maxHp, s.hp));
    if (s.follow === "player") a.follow("player");
  };
