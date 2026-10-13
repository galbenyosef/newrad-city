// play-inline-571 02 — pos
// Lines 350-396 of readable/play-inline-571.pretty.js (statement-aligned).
  Object.assign(G.quests.debug, {
    status() {
      return Q.list().map(
        (q) =>
          q.id + " [" + q.status + "] " + (q.stage || "") + " — " + q.stageText,
      );
    },
    flags() {
      return L.allFlags();
    },
    skip(id) {
      // story order comes from the main story spine
      if (G.quests.debug.ms) G.quests.debug.ms.skipTo(id);
      return Q.list().map((q) => q.id + ":" + q.status);
    },
    /** The core cheat's "skip the start": MQ01 done, MQ02 handed over. */
    skipStart() {
      G.events.emit("cheatSkipStart");
      return Q.list().map((q) => q.id + ":" + q.status);
    },
    tp(npcId) {
      const a = L.npc(npcId);
      if (!a) return "no such npc";
      G.player.teleport(a.pos.x + 2, a.pos.y, a.pos.z + 2, 0);
      return [a.pos.x, a.pos.z];
    },
    npcs() {
      return Object.keys(L.npcs).map((k) => {
        const a = L.npcs[k];
        return (
          k +
          " @ " +
          (a && a.pos ? a.pos.x.toFixed(0) + "," + a.pos.z.toFixed(0) : "?") +
          (a && a.dead ? " (dead)" : "")
        );
      });
    },
    markers() {
      return Q.activeMarkers(true);
    },
    /** Every lock the game registered that the locks audit flags (unreachable key, unlearnable code…). */
    locks() {
      return !G.isStub("locks") && G.locks && G.locks.audit
        ? G.locks.audit().filter((r) => r.problems && r.problems.length)
        : "locks module not loaded";
    },
  });
