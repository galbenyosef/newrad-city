// play-inline-551 05 — complete
// Lines 1683-1687 of readable/play-inline-551.pretty.js (statement-aligned).
  G.quests.debug.gotoGC = () => {
    if (!Q.isComplete("mq01")) Q.complete("mq01");
    Q.start("mq02");
    G.player.teleport(240, 0, -180, 0);
  };
