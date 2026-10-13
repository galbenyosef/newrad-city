// play-inline-481 06 — registry
// Lines 1541-1606 of readable/play-inline-481.pretty.js (statement-aligned).
  function serialize() {
    const out = {};
    for (const [id, c] of registry)
      if (c.touched && !c.isCorpse) out[id] = stateOf(c);
    // keep state of containers that were saved but not (re)created this session
    for (const id in pendingState) if (!out[id]) out[id] = pendingState[id];
    // named actors' corpses (bounded: newest 256)
    const corpses = {};
    for (const c of registry.values())
      if (c.isCorpse && c.actor && isPersistentActor(c.actor))
        corpseStates.set(c.actor.id, stateOf(c));
    const ids = Array.from(corpseStates.keys()).slice(-256);
    for (const id of ids) corpses[id] = corpseStates.get(id);
    if (ids.length) out.__corpses = corpses;
    return out;
  }
  /**
   * New game / before load: corpses are dropped; every other container goes back to
   * its pristine state (owners such as props/quests remove their dynamic ones themselves).
   */
  function reset() {
    initPhase = false;
    pendingState = {};
    corpseStates = new Map();
    for (const c of Array.from(registry.values())) {
      if (c.isCorpse) {
        registry.delete(c.id);
        continue;
      }
      if (c._pristine) applyState(c, c._pristine);
      c.touched = false;
    }
  }
  function deserialize(d) {
    pendingState = {};
    corpseStates = new Map(Object.entries((d && d.__corpses) || {}));
    for (const id in d || {}) {
      if (id === "__corpses") continue;
      const c = registry.get(id);
      if (c) applyState(c, d[id]);
      else pendingState[id] = d[id];
    }
  }

  G.containers = {
    create,
    fromActor,
    open,
    remove,
    stealCheck,
    createModel,
    modelKind,
    isStealing: isOwnedByOther,
    isLocked,
    lockSpec,
    pruneCorpses,
    get: (id) => registry.get(id) || null,
    list: () => Array.from(registry.values()),
    near: (pos, r) =>
      Array.from(registry.values()).filter(
        (c) => Math.hypot(c.pos.x - pos.x, c.pos.z - pos.z) <= r,
      ),
    _serialize: serialize,
    _deserialize: deserialize,
    _reset: reset,
  };
