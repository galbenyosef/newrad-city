// play-inline-402 05 — pos
// Lines 1065-1257 of readable/play-inline-402.pretty.js (statement-aligned).
  function worldHooks() {
    const jm = ctxOf("jefferson_market"),
      ce = ctxOf("five_boro_tower");
    // the cell 2 lock: the bailiffs' spare key ring (evidence locker 66-9120) opens it — a jailbreak in the court's eyes
    if (jm) {
      const p = jm.anchors.dot_door;
      G.world.addInteractable({
        pos: p,
        radius: 0.9,
        label: "Cell 2 (Zielinski)",
        verb: "Unlock",
        priority: 2,
        locked: () => (K.has("pv3_key_jm_cells") ? null : "Locked"),
        enabled: () => PV.jm.dotHeld(),
        onInteract() {
          if (!K.has("pv3_key_jm_cells")) {
            K.sfx("door_locked");
            K.notify(
              "The cell door is locked. The bailiffs keep spare keys somewhere on this level.",
            );
            return;
          }
          K.lockOpen(PV.LK_JM ? PV.LK_JM.cell2 : "pv3_lk_jm_cell2", () =>
            PV.jm.release("jailbreak"),
          );
        },
      });
      // the fire bell
      G.world.addInteractable({
        pos: jm.bellPos,
        radius: 1.2,
        label: "Fire Bell Rope",
        verb: "Ring",
        onInteract() {
          K.sfx("melee_hit", jm.bellPos, { pitch: 0.35, volume: 1 });
          setTimeout(
            () => K.sfx("melee_hit", jm.bellPos, { pitch: 0.34, volume: 0.8 }),
            900,
          );
          try {
            if (G.player && G.player.shake) G.player.shake(0.2, 0.4);
          } catch (e) {
            /* */
          }
          if (!PV.flag("bell_rung")) {
            PV.setFlag("bell_rung", true);
            K.xp(25, "Rang the Jefferson Market fire bell");
            K.notify(
              "The old fire bell tolls over the Village for the first time in twenty-two years.",
            );
          } else K.notify("BONG. ...BONG.");
        },
      });
      // the law library: Local Law 44 (a bound volume on shelf C)
      G.world.addInteractable({
        pos: K.world(jm, 15.4, 1.2, -13.6),
        radius: 0.9,
        label: "Bound Municipal Code, 1966",
        verb: "Take",
        enabled: () => !PV.flag("took_ordinance"),
        onInteract() {
          PV.setFlag("took_ordinance", true);
          K.give("pv3_ordinance", 1);
          K.sfx("pickup");
        },
      });
    }
    // the arc regulator on rack B
    if (ce) {
      G.world.addInteractable({
        pos: ce.regulatorPos,
        radius: 1.0,
        label: "Arc Regulator",
        verb: "Take",
        priority: 2,
        enabled: () => !PV.flag("reg_taken"),
        onInteract() {
          PV.setFlag("reg_taken", true);
          K.give("pv3_arc_regulator", 1);
          K.sfx("pickup");
          if (ce.regulatorGroup) ce.regulatorGroup.visible = false;
          if (
            q.active(QT) &&
            (q.stage(QT) === "enter" || q.stage(QT) === "regulator")
          )
            q.set(QT, "crown");
        },
      });
    }
  }

  // ==================================================================
  // SPAWN (newGame / loaded)
  // ==================================================================
  function spawnJM(ctx) {
    const A = ctx.anchors;
    const hostile = !!PV.flag("jm_contempt");
    setCellOpen(!PV.jm.dotHeld());
    PV.spawnActor(ctx, {
      id: "pv3_jm_magistrate",
      type: "patrolman",
      name: "Magistrate MK-IX",
      faction: "settlers",
      level: 10,
      hostile,
      hp: 320,
      dr: 18,
      pos: V(A.judge),
      yaw: 0,
      ai: "static",
      home: "here",
      homeR: 0.5,
      dialogue: "pv3_dlg_magistrate",
      voice: "robot",
      barks: [
        "ORDER.",
        "The court is in session.",
        "Silence in the gallery.",
        "Objection noted. Objection overruled.",
      ],
    });
    PV.spawnActor(ctx, {
      id: "pv3_jm_bailiff1",
      type: "patrolman",
      name: "Bailiff-Bot",
      faction: "settlers",
      level: 8,
      hostile,
      pos: V(A.bailiff1),
      yaw: -HP,
      ai: "guard",
      home: "here",
      homeR: 2,
      voice: "robot",
      barks: ["All rise.", "Remain seated.", "Spitting is a crime."],
    });
    PV.spawnActor(ctx, {
      id: "pv3_jm_bailiff2",
      type: "patrolman",
      name: "Bailiff-Bot",
      faction: "settlers",
      level: 8,
      hostile,
      pos: V(A.bailiff2),
      yaw: 0,
      ai: "patrol",
      patrol: [
        { x: A.bailiff2.x, z: A.bailiff2.z },
        { x: A.guard_post.x + 1, z: A.guard_post.z },
      ],
      home: "here",
      homeR: 4,
      voice: "robot",
      barks: ["Curfew is at 22:00.", "Move along, citizen."],
    });
    PV.spawnActor(ctx, {
      id: "pv3_jm_steno",
      type: "sky_eye",
      name: "Court Stenographer",
      faction: "settlers",
      level: 3,
      hostile,
      pos: V(A.stenographer),
      ai: "static",
      home: "here",
      homeR: 1,
      barks: ["*click-click-click*", "Let the record show..."],
    });
    if (PV.jm.dotHeld()) {
      PV.spawnActor(ctx, {
        id: "pv3_dot",
        type: "human",
        gender: "f",
        outfit: "merchant",
        name: "Fran Zielinski",
        faction: "settlers",
        level: 6,
        essential: true,
        pos: V(A.dot_cell),
        yaw: HP,
        ai: "static",
        home: "here",
        homeR: 0.5,
        dialogue: "pv3_dlg_dot",
        voice: "settler",
        barks: [
          "Nineteen days. NINETEEN.",
          "Hey! Anybody with thumbs out there?",
          "I want a lawyer. I want a drink. Mostly the drink.",
        ],
      });
    }
  }
