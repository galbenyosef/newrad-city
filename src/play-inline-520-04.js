// play-inline-520 04 — hitched
// Lines 808-854 of readable/play-inline-520.pretty.js (statement-aligned).
  K.system({
    name: "oxen",
    order: 20,
    init() {
      G.events.on("actorDamaged", (a) => {
        try {
          onDamaged(a);
        } catch (e) {
          /* ignore */
        }
      });
    },
    newGame() {
      hitched = null;
      herdLive.clear();
      for (const h of HERDS) h.cool = 0;
    },
    loaded() {
      hitched = null;
      herdLive.clear();
    },
    reset() {
      for (const h of LIVE) h.model.dispose();
      LIVE.length = 0;
      hitched = null;
      herdLive.clear();
    },
    update(dt) {
      tick(dt);
      herdT += dt;
      if (herdT > 2 && K.playerOk() && G.state === "play") {
        herdT = 0;
        updateHerds();
      }
      // (re)hitch when the player is around the trading post
      if (
        dt > 0 &&
        K.playerOk() &&
        !hitched &&
        G.time.frame % 60 === 0 &&
        K.distToPlayer(141, 110) < 150 &&
        !K.isInterior(G.player.pos.x)
      )
        spawnHitched();
      if (hitched && (hitched.removed || hitched._ambGone)) hitched = null;
    },
  });
