// play-inline-594 02 — setflag
// Lines 844-879 of readable/play-inline-594.pretty.js (statement-aligned).
(function () {
  const G = window.G;
  const K = G.lair && G.lair._;
  if (!K) return;
  const m = /[?&]lairshot=([a-z_]+)/.exec(location.search);
  if (!m || !G.SHOT) return;
  G.events.on("newGame", () => {
    const Q = G.quests;
    if (!Q || G.isStub("quests")) return;
    K.testMode = true;
    K.fastCards = true;
    Q.setFlag("ms_lair_open", true);
    Q.setFlag("ms_track61_open", true);
    const st = m[1];
    if (st === "captive") {
      Q.setFlag("ms_rose_captive", true);
      Q.setFlag("ms_rose_trust", 2);
    } else {
      Q.setFlag("ms_rose_with_eli", true);
      Q.setFlag("ms_rose_trust", 3);
    }
    if (st === "walled") {
      Q.setFlag("ms_second_sun", "walled");
    }
    if (!Q.isStarted("mq36")) Q.start("mq36");
    K.fin().phase = st === "pre" ? "pre" : "hello";
    K.spawnSunCast();
    K.sunDress();
    if (st !== "pre") {
      const a = K.npc("lair_nicole");
      if (a) a.yaw = Math.PI / 2;
    }
    K.testMode = false;
    K.fastCards = false;
  });
})();
