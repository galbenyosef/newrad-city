// play-inline-277 08 — realdt
// Lines 1777-1795 of readable/play-inline-277.pretty.js (statement-aligned).
  P.tick.push((dt, realDt) => {
    P.safe("cage", () => tickCage(realDt));
    if (tobyRunT > 0) {
      tobyRunT -= realDt;
      if (tobyRunT <= 0) P.safe("toby:home", tobyHome);
    }
  });
  G.events.on("actorKilled", (a) => {
    if (!a) return;
    if (a.id === "uw_stokes") F.stokesDead = true;
  });
  // picking up the seed bank advances the garden quest; starts it if the player found it first
  G.events.on("itemAdded", (id) => {
    if (id === "uw_seed_bank") {
      if (!qDone("uw_gardens")) qSet("uw_gardens", "return");
    }
  });
  void PI;
  void HP;
