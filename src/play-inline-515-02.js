// play-inline-515 02 — root
// Lines 366-384 of readable/play-inline-515.pretty.js (statement-aligned).
  C.updateNeonSpots = function (dt) {
    try {
      update(dt);
    } catch (e) {
      G.reportError("combat:neonSpots", e);
      if (S.root) S.root.visible = false;
      S.built = false;
      S.tried = true;
    }
  };
  G.events.on("reset", () => {
    for (const l of S.lights) {
      l.target = null;
      l.aim = null;
      l.playerCd = 0;
      l.lockUntil = 0;
    }
  });
  void THREE;
