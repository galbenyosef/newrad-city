// play-inline-579 03 — flag
// Lines 1381-1659 of readable/play-inline-579.pretty.js (statement-aligned).
  QX.hook("spawn", function () {
    if (!O) O = ORIGIN();
    if (!QX.has("qx_c4_roll"))
      QX.pickup("c4_roll", "qx_c4_roll", 1, {
        x: O.x + SPOTS.roll[0],
        y: 0.22,
        z: O.z + SPOTS.roll[1],
      });
    if (!QX.has("qx_reel_c4_day12"))
      QX.pickup("c4_day12", "qx_reel_c4_day12", 1, {
        x: O.x + SPOTS.reel[0],
        y: 0.84,
        z: O.z + SPOTS.reel[1],
      });
    V.spawnDirector();
    if (QX.flag("c4_entered")) V.spawnShellbacks();
    V.applyState();
  });
  V.spawnDirector = function () {
    const out = QX.flag("c4_outside");
    const H = QX.world.c4Hatch || QX.radioSpots.hatch;
    const pos = out
      ? QX.freeSpot(H.x + 3, H.z + 2, undefined, { maxR: 6 })
      : { x: O.x + SPOTS.director[0], y: 0, z: O.z + SPOTS.director[1] };
    // Twenty-two years underground: gaunt, pale, white-haired.
    QX.spawnNPC({
      id: "qx_brandt",
      type: "human",
      name: "Director Brandt",
      outfit: DIRECTOR_OUTFIT,
      gender: "f",
      hair: "bun",
      hairColor: 0xd8d6d0,
      skinTone: "pale",
      faction: "settlers",
      ai: out ? "wander" : "static",
      home: "here",
      homeR: out ? 4 : 0.5,
      level: 6,
      hp: 110,
      noRespawn: true,
      dialogue: "qx_dlg_brandt",
      weapon: "pistol_10mm",
      inventory: [["qx_c4_director_key", 1]],
      pos: { x: pos.x, y: pos.y || 0, z: pos.z },
      yaw: out ? 0 : -Math.PI / 2,
      barks: out
        ? [
            "They waved from over there. Every spring. I never saw them.",
            "The air tastes like pennies. I'd forgotten.",
            "Twenty-two years. I'm told that's a long time.",
          ]
        : [
            "...this message will repeat.",
            "Day nine. It's always day nine.",
            "Civil Defense, please respond.",
          ],
    });
  };
  V.spawnShellbacks = function () {
    if (QX.flag("c4_shells_spawned") && QX.flag("c4_shells_dead")) return;
    QX.setFlag("c4_shells_spawned");
    SPOTS.shells.forEach((s, i) => {
      if (QX.flag("dead_qx_c4_shell" + i)) return;
      if (i === 3 && !QX.flag("c4_pumps")) return; // the fourth lives in the pump room
      QX.spawnNPC({
        id: "qx_c4_shell" + i,
        type: SHELLBACK_TYPE,
        name: i === 1 ? "Shellback Snapper" : "Shellback",
        faction: "creatures",
        hostile: true,
        level: i === 1 ? 7 : 4,
        noRespawn: true,
        ai: "guard",
        home: { x: O.x + s[0], z: O.z + s[1], r: 6 },
        pos: { x: O.x + s[0], y: 0, z: O.z + s[1] },
        aggroRange: 16,
      });
    });
  };
  V.entered = function () {
    if (!QX.flag("c4_entered")) {
      QX.setFlag("c4_entered");
      V.spawnShellbacks();
      QX.later(1.2, () =>
        QX.notify(
          'Water to the knee, and cold. Somewhere ahead, over the dripping, a tape recorder clicks and a woman\'s voice says: "...this message will repeat."',
        ),
      );
    }
    if (QX.radioQuests) QX.radioQuests.enteredFacility();
  };
  V.applyState = function () {
    if (!V.root) return;
    if (QX.flag("c4_bulkhead")) V.openBulkhead(true);
    if (QX.flag("c4_pumps")) V.drain(true);
  };

  // ------------------------------------------------------------------
  // Actions
  // ------------------------------------------------------------------
  V.openBulkhead = function (silent) {
    QX.setFlag("c4_bulkhead");
    QX.unlock(LOCKS.office.id);
    if (V.bulkheadCol) {
      G.world.removeCollider(V.bulkheadCol);
      V.bulkheadCol = null;
    }
    if (V.bulkheadMesh) {
      V.bulkheadMesh.position.y = 3.95;
      V.bulkheadMesh.scale.y = 0.02;
    }
    if (!silent) QX.sfx("door_metal");
    if (QX.stage(QID) === "inside") QX.setStage(QID, "talk");
  };
  /** The office bulkhead: the Director's key, the keypad code (quartermaster teletype), or Brandt herself over the intercom. */
  V.tryBulkhead = function () {
    if (QX.flag("c4_bulkhead")) return;
    if (QX.has("qx_c4_director_key")) {
      V.openBulkhead();
      return;
    }
    if (!QX.locksLive()) {
      QX.notify(
        "The bulkhead is sealed from inside. There is an intercom beside it, and a keypad.",
      );
      return;
    }
    QX.openLock(LOCKS.office, () => V.openBulkhead(), {
      onCancel: () =>
        QX.notify(
          "The bulkhead is sealed from inside. There is an intercom beside it.",
        ),
    });
  };
  V.drain = function (silent) {
    QX.setFlag("c4_pumps");
    if (V.pumpDoorCol) {
      G.world.removeCollider(V.pumpDoorCol);
      V.pumpDoorCol = null;
    }
    if (V.pumpDoorMesh) V.pumpDoorMesh.visible = false;
    V.drainT = silent ? 0 : 6;
    if (silent) {
      if (V.deepWater) V.deepWater.position.y = 0.1;
      for (const w of V.water) if (w !== V.deepWater) w.position.y = 0.06;
    }
    if (!silent) {
      QX.sfx("hum_electric");
      QX.notify(
        "Somewhere below your feet, two pumps cough, choke, and catch. The water starts to go down.",
      );
      QX.xp(50, "Water Rising — pumps restarted");
      QX.later(7, () => {
        if (!QX.alive("qx_c4_shell3") && !QX.flag("dead_qx_c4_shell3"))
          V.spawnShellbacks();
      });
    }
    QX.refresh(QID);
  };
  V.marcus = function () {
    const first = !QX.flag("c4_marcus");
    QX.setFlag("c4_marcus");
    QX.notify(
      'A skeleton in a grey-white Long Winter cryo suit, orange collar ring gone pale, reclining in an armchair, facing the radio. A handwritten sign is propped on his knees: "DO NOT TURN OFF. WAITING FOR THE NEXT SHOW. — M.A."',
    );
    if (first) {
      QX.xp(25, "Water Rising — Marcus Abernathy");
      QX.refresh(QID);
    }
  };
  V.marcusRadio = function () {
    QX.notify(
      "The dial is set to 97.3. You turn the knob. Nothing: the batteries died a very long time ago. You turn it back to 97.3.",
    );
    if (QX.live("radio") && G.radio.tune && QX.once("c4_radio"))
      QX.safe("tune", () => {
        const st = G.radio.stations ? G.radio.stations() : [];
        if (st.some((s) => s.id === "rfm")) G.radio.tune("rfm");
      });
  };
  /** The four endings. */
  V.resolve = function (how) {
    if (QX.done(QID)) return;
    const rewardKey = () => {
      if (!QX.has("qx_c4_director_key")) QX.give("qx_c4_director_key", 1);
    };
    if (how === "truth" || how === "speech") {
      QX.setFlag("c4_beacon_off");
      if (QX.qlive() && G.quests.setFlag)
        QX.safe("qflag", () => G.quests.setFlag("qx_c4_beacon_off", true));
      rewardKey();
      if (how === "truth") QX.take("qx_c4_roll", 1);
      QX.standing(how === "truth" ? 100 : 50, "Told Director Brandt the truth");
      QX.xp(how === "truth" ? 300 : 200, "Water Rising");
      QX.setStage(QID, how === "truth" ? "done_truth" : "done_speech");
      QX.setFlag("c4_outside");
      QX.later(4, () => {
        if (
          !V.inside() ||
          QX.dist(O.x + SPOTS.director[0], O.z + SPOTS.director[1]) > 6
        )
          V.moveOutside();
        else QX.later(6, V.moveOutside);
      });
      QX.news(
        "Downtown, a Civil Defense distress signal that has been playing since the year the bombs fell went quiet last night. " +
          "Someone out there finally answered it. Rocky is choosing to find that beautiful.",
      );
    } else if (how === "lie") {
      QX.setFlag("c4_lied");
      rewardKey();
      QX.standing(-75, "Lied to Director Brandt");
      QX.giveScrip(100);
      QX.xp(150, "Water Rising");
      QX.setStage(QID, "done_lie");
    } else if (how === "dead") {
      QX.setStage(QID, "done_dead");
      QX.xp(100, "Water Rising");
    }
  };
  V.moveOutside = function () {
    const a = QX.npc("qx_brandt");
    if (!a || a.dead) return;
    QX.removeNPC("qx_brandt");
    QX.later(0.1, V.spawnDirector);
  };
  G.events.on("actorKilled", (a) => {
    if (!a) return;
    if (a.id === "qx_brandt") {
      if (!QX.started(QID)) QX.start(QID, { stage: "talk" });
      if (!QX.done(QID)) V.resolve("dead");
    }
    if (/^qx_c4_shell/.test(a.id || "")) {
      if (
        SPOTS.shells.every(
          (s, i) =>
            QX.flag("dead_qx_c4_shell" + i) ||
            (i === 3 && !QX.flag("c4_pumps")),
        )
      )
        QX.setFlag("c4_shells_dead");
    }
  });
  G.events.on("itemAdded", (id) => {
    if (id === "qx_c4_roll" && QX.stage(QID) === "roll") QX.refresh(QID);
  });

  // drain animation + "inside" detection for the stage (in case the door onEnter was skipped by a teleport)
  // Interior root drawn only while the player is inside the cell (perf rule), in every state
  // (goggles / dialogue / terminal screens still render the world behind them).
  const syncVis = () => {
    if (V.root) {
      const v = V.inside();
      if (V.root.visible !== v) V.root.visible = v;
    }
  };
  QX.hook("always", syncVis);
  G.events.on("teleport", () => QX.safe("c4vis", syncVis));
  QX.hook("update", function (dt) {
    if (!O || !V.root || !V.inside()) return;
    if (V.drainT > 0) {
      V.drainT -= dt;
      const f = Math.max(0, V.drainT / 6);
      if (V.deepWater) V.deepWater.position.y = 0.1 + 3.0 * f;
      for (const w of V.water)
        if (w !== V.deepWater)
          w.position.y =
            0.06 + (w.position.y > 0.06 ? (WATER_Y - 0.06) * f : 0);
    }
    if (V.inside() && QX.stage(QID) === "hatch")
      QX.radioQuests && QX.radioQuests.enteredFacility();
  });

  // ------------------------------------------------------------------
  // Terminals (amber teletypes on the Office of Civil Defense net)
  // ------------------------------------------------------------------
  const HDR =
    "OFFICE OF CIVIL DEFENSE — TELETYPE NET\nPROJECT LONG WINTER — CRYO UNIT C-4\n";
