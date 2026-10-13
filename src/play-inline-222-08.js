// play-inline-222 08 — flag
// Lines 1772-1878 of readable/play-inline-222.pretty.js (statement-aligned).
  PH.updaters.push(function (dt, realDt) {
    if (
      spawnPending &&
      (G.state === "play" || G.state === "loading" || G.worldRunning())
    ) {
      spawnPending = false;
      PH.safe("spawnEllis", spawnEllis);
      PH.safe("spawnDomino", spawnDomino);
      PH.safe("spawnHudson", spawnHudson);
    }
    maintT -= realDt || 0;
    if (maintT > 0) return;
    maintT = 1.0;
    // quest bookkeeping
    if (
      !PH.flag("quarantine_cleared") &&
      [0, 1, 2].every((i) => {
        const a = actor("ph_ellis_maniac" + i);
        return !a || a.dead;
      }) &&
      PH.flag("ellis_quarantine_open")
    ) {
      PH.setFlag("quarantine_cleared");
      if (qActive("ph_q_quarantine")) qSet("ph_q_quarantine", "report");
    }
    if (
      qActive("ph_q_sugar") &&
      PH.hasItem("ph_sugar_crate") &&
      qStage("ph_q_sugar") !== "return"
    )
      qSet("ph_q_sugar", "return");
    if (
      PH.flag("nadia_freed") &&
      !PH.flag("nadia_home") &&
      Math.abs(G.player.pos.x - 6600) < 170 &&
      Math.abs(G.player.pos.z) < 170
    )
      spawnEllis();
    // Nadia may be freed before the quest was ever given
    if (
      qActive("ph_q_huddled") &&
      PH.flag("nadia_freed") &&
      qStage("ph_q_huddled") === "board"
    )
      qSet("ph_q_huddled", "return");
  });
  G.events.on("actorKilled", (a) => {
    if (!a || !a.id) return;
    if (a.id === "ph_sweet_tooth") {
      PH.setFlag("sweettooth_dead");
      PH.xp(80, "Sweet Tooth");
      try {
        if (!G.isStub("radio") && G.radio.addNews)
          G.radio.addNews(
            "Word from Williamsburg: the brute they called Sweet Tooth has eaten his last bowl of Freedom Flakes.",
          );
      } catch (e) {
        /* */
      }
    }
    if (a.id === "ph_commodore") {
      PH.setFlag("commodore_dead");
      try {
        if (!G.isStub("radio") && G.radio.addNews)
          G.radio.addNews(
            "The Navy Yard Pirates are looking for a new Commodore. Applicants should note the job has a short life expectancy.",
          );
      } catch (e) {
        /* */
      }
    }
  });
  G.events.on("itemAdded", (id) => {
    if (id === "ph_sugar_crate") {
      PH.setFlag("sugar_taken");
      if (qActive("ph_q_sugar")) qSet("ph_q_sugar", "return");
    }
  });
  G.events.on("phCellOpened", () => {
    /* Nadia can now be talked to (her dialogue switches to "freed") */
  });
  // reactor rad source handle (so SCRAM can weaken it)
  PH.onReady.push(() => {
    const O = G.LAYOUT.INTERIORS.uss_hudson.origin;
    const list = (G.world && G.world.radSources) || [];
    PH._reactorRad =
      list.find(
        (s) => Math.abs(s.x - (O.x - 9)) < 0.5 && Math.abs(s.z - O.z) < 0.5,
      ) || null;
    if (PH._reactorRad && PH.flag("hudson_scram")) PH.applyScram();
  });
  PH.onLoaded.push(() => {
    if (PH._reactorRad)
      PH._reactorRad.strength = PH.flag("hudson_scram") ? 0.25 : 4;
  });
  PH.onReset.push(() => {
    if (PH._reactorRad) PH._reactorRad.strength = 4;
  });
  // steam vents respect the blowdown
  PH.updaters.push(() => {
    if (PH.domVents && PH.flag("domino_vents_off"))
      for (const v of PH.domVents) {
        v.t = 999;
        v.burst = 0;
      }
    else if (PH.domVents) for (const v of PH.domVents) if (v.t > 100) v.t = 2;
  });
