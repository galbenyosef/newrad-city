// play-inline-26 07 — pos
// Lines 1985-2021 of readable/play-inline-26.pretty.js (statement-aligned).
  S.creatureVoice = function (name, pos) {
    const kind = CREATURE_OF[name];
    if (!kind || !pos || !G.actors || G.isStub("actors") || !G.actors.list)
      return name;
    let a = null,
      best = 2.25;
    try {
      for (const x of G.actors.list()) {
        if (!x || !x.pos) continue;
        if (x.pos === pos) {
          a = x;
          break;
        }
        const dx = x.pos.x - pos.x,
          dz = x.pos.z - pos.z,
          d2 = dx * dx + dz * dz;
        if (d2 < best) {
          best = d2;
          a = x;
        }
      }
    } catch (e) {
      return name;
    }
    if (!a) return name;
    const now = G.time ? G.time.elapsed : 0,
      set = CREATURE_SETS[kind];
    if (a.dead || a.hp <= 0) return set.death;
    if (a.lastDamageT !== undefined && now - a.lastDamageT < 0.3)
      return set.pain;
    if (
      HUNT[a.state] ||
      (a.target && a.state !== "idle" && a.state !== "dormant")
    )
      return set.alert;
    return set.idle;
  };
