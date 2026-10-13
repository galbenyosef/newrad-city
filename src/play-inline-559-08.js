// play-inline-559 08 — reporterror
// Lines 3187-3249 of readable/play-inline-559.pretty.js (statement-aligned).
  L.hook("update", function (dt) {
    if (dt <= 0) return;
    if (BALL.seq) {
      try {
        tickDrop(dt);
      } catch (e) {
        G.reportError("quests:neon ball", e);
        BALL.seq = null;
      }
    }
    try {
      expressTick(dt);
    } catch (e) {
      G.reportError("quests:neon express", e);
      cleanupExpress();
    }
    t4 += dt;
    if (t4 < 0.5) return;
    t4 = 0;
    try {
      ballTick();
    } catch (e) {
      G.reportError("quests:neon ballTick", e);
    }
    try {
      raidTick();
    } catch (e) {
      G.reportError("quests:neon raid", e);
    }
    try {
      blackoutTick(0.5);
    } catch (e) {
      G.reportError("quests:neon blackout", e);
      BLACK.on = false;
    }
    try {
      showTick();
    } catch (e) {
      G.reportError("quests:neon show", e);
    }
  });

  // Debug (dev console)
  Q.debug.neonBall = () => {
    L.setFlag("neon_ball_fixed", "debug");
    G.time.hour = 23.9;
  };
  Q.debug.neonRaid = () => {
    if (!Q.isStarted("sq_neon_power")) Q.start("sq_neon_power");
    Q.setStage("sq_neon_power", "defend");
    G.time.hour = 1.97;
  };
  L.neonQuests = {
    startDrop,
    spawnRaid,
    spawnBounty,
    BOUNTIES,
    RUNS,
    startExpress,
    EXP,
    clubAdmit,
    ballSpots,
  };
