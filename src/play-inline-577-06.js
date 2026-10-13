// play-inline-577 06 — pos
// Lines 1309-1406 of readable/play-inline-577.pretty.js (statement-aligned).
  function finishShow(costar) {
    if (QX.stage("qx_bixby") !== "show") return;
    QX.give("qx_bixby_hat", 1);
    if (costar) {
      QX.giveScrip(40);
      QX.xp(75, "Played Horatio");
      QX.standing(20, "The show went on");
    } else QX.standing(10, "The show went on");
    QX.setStage("qx_bixby", "done");
    QX.news(
      'A theatrical note from Times Square: Bartholomew Bixby\'s "Hamlet of Hoboken" has opened' +
        (costar
          ? ", featuring a mysterious sleeper in a cryo suit as Horatio. "
          : ". ") +
        "The run is expected to last until Mister Bixby runs out of breath, which, for a man who once held a high C through a blackout, could be decades.",
    );
  }
  A.bixFinish = () => finishShow(!!QX.flag("bix_costar"));
  QX.hook("loaded", function () {
    // a performance interrupted by save/load simply finishes
    if (QX.stage("qx_bixby") === "show") performance(!!QX.flag("bix_costar"));
  });

  // ==================================================================
  // Triggers & the Buttons escort
  // ==================================================================
  // MUNI-7 tickets you when you walk into its zone.
  QX.trigger({
    id: "muni_ticket",
    pos: () => {
      const a = QX.npc("qx_muni7");
      return a && !a.dead ? a.pos : null;
    },
    r: 7,
    cond: () => !QX.started("qx_parking"),
    fire: () => {
      QX.say(
        "qx_muni7",
        "HALT, CITIZEN. YOU ARE STANDING IN A NO STANDING ZONE. CITATION ISSUED.",
        5,
      );
      QX.sfx("robot_beep");
      A.muniStart();
    },
  });
  // Found Buttons before meeting Edna: the collar tag starts the quest.
  QX.trigger({
    id: "buttons_seen",
    pos: () => {
      const a = QX.npc("qx_buttons");
      return a && !a.dead && !QX.flag("buttons_home") ? a.pos : null;
    },
    r: 6,
    cond: () => !QX.started("qx_buttons"),
    fire: () => {
      QX.notify(
        'The burrow rat is wearing a knitted collar. The tag reads "MISTER BUTTONS — if found, return to Edna, 5th & 23rd."',
      );
      A.buttonsStart("find");
    },
  });
  let escT = 0;
  QX.hook("update", function (dt, realDt) {
    escT -= realDt;
    if (escT > 0) return;
    escT = 0.5;
    if (!QX.flag("buttons_follow") || QX.flag("buttons_home")) return;
    const b = QX.npc("qx_buttons");
    if (!b || b.dead) return;
    const P = G.player.pos;
    const d = Math.hypot(b.pos.x - P.x, b.pos.z - P.z);
    // Keep up across doors / long sprints (companions do the same).
    if (d > 32 || QX.inInterior() !== b.pos.x >= G.LAYOUT.INTERIOR_X_MIN) {
      const s = QX.freeSpot(
        P.x - G.player.forward.x * 3,
        P.z - G.player.forward.z * 3,
        P.y,
        { maxR: 4 },
      );
      b.pos.set(s.x, s.y, s.z);
      if (b.follow) QX.safe("follow", () => b.follow("player"));
    }
    if (
      QX.dist(SPOT.edna.x, SPOT.edna.z) < 10 &&
      Math.hypot(b.pos.x - SPOT.edna.x, b.pos.z - SPOT.edna.z) < 12
    ) {
      A.buttonsHome();
      QX.say(
        "qx_edna",
        "BUTTONS! Oh, my baby! Look at you, you're filthy! Mama's going to — dear, come here, come here!",
        5,
      );
    }
  });

  // ==================================================================
  // DIALOGUE
  // ==================================================================
