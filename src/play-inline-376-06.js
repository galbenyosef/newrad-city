// play-inline-376 06 — push
// Lines 1144-1211 of readable/play-inline-376.pretty.js (statement-aligned).
  G.events.on("itemAdded", (id) => {
    if (id === "m3_note_chaz" || id === "m3_note_pen") {
      if (!qActive("m3_cellar") && !qDone("m3_cellar"))
        qStart("m3_cellar", F.holeFound ? "open" : "find");
    } else if (id === "m3_mayors_reserve" && !F.reserveTaken) {
      F.reserveTaken = true;
      qStart("m3_cellar", "claim");
      qComplete("m3_cellar");
    } else if (id === "m3_reel_duty" || id === "m3_relay_codes")
      qStart("m3_dead_air", "reach");
  });
  G.events.on("actorKilled", (a) => {
    if (a && a.id === "m3_voss") F.vossDead = true;
    if (a && EXTRA.some((e) => e.id === a.id)) {
      F.extraDead = F.extraDead || [];
      if (F.extraDead.indexOf(a.id) < 0) F.extraDead.push(a.id);
    }
  });
  G.events.on("locationDiscovered", (loc) => {
    const id = loc && (loc.id || loc);
    if (id === "helmsley") qStart("m3_dead_air", "reach");
  });

  P.onPreReady.push(() => {
    defineItems();
    defineTerminals();
    defineQuests();
  });
  P.onReady.push(() => {
    interactables();
  });
  P.onReset.push(() => {
    resetWorld();
    F = DEF_STATE();
    applyRelay();
  });
  P.onNewGame.push(() => {
    F = DEF_STATE();
    applyWorldState();
    spawnVoss();
    spawnExtras();
  });
  P.onLoaded.push(() => {
    applyWorldState();
    spawnVoss();
    spawnExtras();
  });
  let slow = 0;
  P.tick.push((dt, realDt) => {
    tickCellar(realDt);
    tickRelay(dt, realDt);
    slow -= realDt;
    if (slow > 0) return;
    slow = 0.5;
    tickKing();
    // reaching the crown advances "Dead Air"
    const pp = G.player && G.player.pos;
    if (
      pp &&
      P.inCell("helmsley") &&
      pp.y - P.I("helmsley").y > 50 &&
      F.relay === "on"
    ) {
      if (!qActive("m3_dead_air")) qStart("m3_dead_air", "silence");
      else if (qStage("m3_dead_air") === "reach")
        qSet("m3_dead_air", "silence");
    }
  });
