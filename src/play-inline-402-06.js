// play-inline-402 06 — ctx
// Lines 1258-1597 of readable/play-inline-402.pretty.js (statement-aligned).
  function spawnCH(ctx) {
    const A = ctx.anchors;
    const v = (n) => V(A[n]);
    PV.spawnActor(ctx, {
      id: "pv3_lee",
      type: "human",
      gender: "m",
      outfit: "merchant",
      name: "Lee Bedford",
      faction: "settlers",
      level: 9,
      essential: true,
      pos: v("bartender"),
      yaw: HP,
      ai: "merchant",
      home: "here",
      homeR: 1.6,
      dialogue: "pv3_dlg_lee",
      voice: "settler",
      merchant: {
        scrip: 360,
        stock: K.stock(
          [
            ["pv3_gin", 10],
            ["pv3_pigeon_stew", 6],
            ["beer", 6],
            ["whiskey", 2],
            ["vodka", 2],
            ["purified_water", 4],
            ["fizzo_cola", 3],
          ],
          "merchant_food",
          3,
        ),
        restock: 2,
      },
      barks: [
        "No sign, no names, no trouble.",
        "Gin's in the teacups.",
        "Eighty-six him if he starts singing again.",
      ],
    });
    PV.spawnActor(ctx, {
      id: "pv3_hazel",
      type: "human",
      gender: "f",
      outfit: "survivor_layers",
      name: "Hazel Adeyemi",
      faction: "settlers",
      level: 8,
      essential: true,
      pos: v("npc1"),
      yaw: HP,
      ai: "sit",
      home: "here",
      homeR: 0.4,
      dialogue: "pv3_dlg_hazel",
      voice: "settler",
      barks: [
        "Transformer B. I can feel it humming.",
        "The lights stay on. That was the motto.",
        'Vernon, if you rhyme "grid" with "did" one more time...',
      ],
    });
    PV.spawnActor(ctx, {
      id: "pv3_vernon",
      type: "human",
      gender: "m",
      outfit: "survivor",
      name: "Vernon Blake",
      faction: "settlers",
      level: 3,
      essential: true,
      pos: v("npc2"),
      yaw: PI,
      ai: "sit",
      home: "here",
      homeR: 0.3,
      dialogue: "pv3_dlg_vernon",
      voice: "settler",
      barks: [
        '"O city of stopped clocks..." no. No.',
        "Chapter one. Page four hundred.",
        "Is anyone here a publisher? Anyone?",
      ],
    });
    PV.spawnActor(ctx, {
      id: "pv3_keys",
      type: "valet",
      name: "Keys",
      faction: "settlers",
      level: 5,
      essential: true,
      pos: v("npc3"),
      yaw: PI,
      ai: "static",
      home: "here",
      homeR: 0.3,
      dialogue: "pv3_dlg_keys",
      voice: "robot",
      barks: [
        "*plink plonk*",
        "This next one is a ballad. So was the last one.",
        "Tips are appreciated! I cannot hold them, but they are appreciated!",
      ],
    });
    PV.spawnActor(ctx, {
      id: "pv3_ch_patron",
      type: "human",
      gender: "f",
      outfit: "settler",
      name: "Regular",
      faction: "settlers",
      level: 3,
      pos: v("npc4"),
      yaw: -HP,
      ai: "sit",
      home: "here",
      homeR: 0.3,
      barks: [
        "Two doors, no sign. Best bar in the world.",
        "Don't sit in the booth with the poet.",
      ],
    });
    PV.spawnActor(ctx, {
      id: "pv3_ch_cellar",
      type: "human",
      gender: "m",
      outfit: "survivor",
      name: "Settler",
      faction: "settlers",
      level: 3,
      pos: v("npc5"),
      yaw: HP,
      ai: "wander",
      home: "here",
      homeR: 3,
    });
    PV.spawnActor(ctx, {
      id: "pv3_ch_cook",
      type: "human",
      gender: "f",
      outfit: "settler",
      name: "Marguerite",
      faction: "settlers",
      level: 4,
      pos: v("npc6"),
      yaw: PI,
      ai: "wander",
      home: "here",
      homeR: 1.6,
      barks: [
        "Stew's on.",
        "Don't ask what's in it.",
        "Municipal. That's all I'll say.",
      ],
    });
    const gate = A.bouncer || A.gate;
    if (gate)
      PV.spawnActor(ctx, {
        id: "pv3_ox",
        type: "human",
        gender: "m",
        outfit: "leather_armor",
        name: "Ox",
        faction: "settlers",
        level: 9,
        pos: V(gate),
        yaw: PI,
        ai: "guard",
        home: "here",
        homeR: 0.6,
        weapon: "lead_pipe",
        barks: [
          "No sign. No problem.",
          "Knock twice. Once is a cop.",
          "You look thirsty. Door's at the back of the court.",
        ],
      });
    if (!PV.jm.dotHeld()) spawnDotAtBedfords();
    // one-way doors already used from inside stay open; the grate key waits on the cellar crates
    if (PV.flag("ch_86_open")) K.lockUnlock("pv3_lk_ch_door86");
    if (!PV.flag("ch_grate_key_taken") && A.grate_key)
      K.safe("gratekey", () => {
        if (!G.isStub("items") && G.items.spawnPickup)
          G.items.spawnPickup("pv3_key_ch_grate", 1, V(A.grate_key), {
            static: false,
            keepY: true,
            noSave: true,
          });
      });
  }
  G.events.on("itemAdded", (id) => {
    if (id === "pv3_key_ch_grate") PV.setFlag("ch_grate_key_taken", true);
  });
  function spawnCE(ctx) {
    const A = ctx.anchors;
    if (ctx.regulatorGroup) ctx.regulatorGroup.visible = !PV.flag("reg_taken");
    if (ctx.lensGroup) ctx.lensGroup.visible = PV.flag("ce_mode") === "beacon";
    if (!PV.flag("gridlock_dead")) {
      PV.spawnActor(ctx, {
        id: "pv3_gridlock",
        type: "bulwark",
        name: "GRIDLOCK",
        faction: "robots",
        level: 12,
        hostile: !PV.flag("ce_pacified"),
        hp: 520,
        dr: 25,
        damage: 1.2,
        pos: V(A.boss),
        yaw: PI,
        ai: "guard",
        home: "here",
        homeR: 5,
        noRespawn: true,
        loot: "bulwark",
        inventory: [
          ["dry_cell", 2],
          ["relay_board", 1],
        ],
        barks: [
          "GRID SECURE.",
          "UNAUTHORISED PERSONNEL DETECTED IN CLOCK ROOM.",
          "LOAD SHEDDING INITIATED.",
        ],
        onDeath: () => {
          PV.setFlag("gridlock_dead", true);
          K.xp(120, "Destroyed GRIDLOCK");
        },
      });
    }
  }

  // ==================================================================
  // UPDATE: lit groups, blinking lamp, sparks, pacified robots
  // ==================================================================
  let stageT = 0,
    dotT = 0,
    blinkT = 0,
    sparkT = 3,
    arcT = 2,
    calmT = 0,
    nightT = 0,
    night = false;
  function updateAll(dt, realDt) {
    nightT -= realDt;
    if (nightT <= 0) {
      night = isNight();
      nightT = 2;
    }
    const mode = PV.flag("ce_mode");
    const jm = ctxOf("jefferson_market"),
      ch = ctxOf("bedfords"),
      ce = ctxOf("five_boro_tower");
    if (jm && jm.litGroup) jm.litGroup.visible = mode === "grid" && night;
    if (ch && ch.litGroup) ch.litGroup.visible = mode === "grid" && night;
    // stage hand-offs that must not depend on WHICH way the player got inside (street door, 86 door, a load, fast travel)
    stageT -= realDt;
    if (stageT <= 0) {
      stageT = 0.5;
      K.safe("stagecheck", () => {
        if (jm && jm.inside && q.active(QC) && q.stage(QC) === "find")
          q.set(QC, "defend");
        if (ce && ce.inside && q.active(QT) && q.stage(QT) === "enter")
          q.set(QT, K.has("pv3_arc_regulator") ? "crown" : "regulator");
        if (
          q.active(QT) &&
          q.stage(QT) === "regulator" &&
          K.has("pv3_arc_regulator")
        )
          q.set(QT, "crown");
      });
    }
    if (jm && !jm.inside) {
      dotT -= realDt;
      if (dotT <= 0) {
        dotT = 2;
        if (PV.jm && !PV.jm.dotHeld() && PV.flag("dot_free"))
          spawnDotAtBedfords();
      }
    }
    if (ce) {
      if (ce.litGroup) ce.litGroup.visible = mode === "beacon" && night;
      blinkT += realDt;
      if (ce.aviaGroup) ce.aviaGroup.visible = blinkT % 1.6 < 0.8;
      const p = G.player && G.player.pos;
      if (p && dt > 0 && !G.isStub("fx")) {
        if (
          ce.sparkPos &&
          Math.abs(p.x - ce.sparkPos.x) < 70 &&
          Math.abs(p.z - ce.sparkPos.z) < 70
        ) {
          sparkT -= dt;
          if (sparkT <= 0) {
            sparkT = 1.5 + Math.random() * 4;
            K.safe("spark", () => G.fx.sparks(ce.sparkPos));
            if (Math.random() < 0.5)
              K.sfx("hum_electric", ce.sparkPos, { volume: 0.4 });
          }
        }
        if (ce.inside && ce.arcPos && Math.abs(p.y - ce.arcPos.y) < 10) {
          arcT -= dt;
          if (arcT <= 0) {
            arcT = 0.8 + Math.random() * 2.5;
            K.safe("arc", () => {
              G.fx.sparks(ce.arcPos);
              if (G.fx.flash) G.fx.flash(ce.arcPos, 0x88bbff, 2, 0.12);
            });
          }
        }
      }
      if (PV.flag("ce_pacified") && ce.inside) {
        calmT -= realDt;
        if (calmT <= 0) {
          calmT = 2;
          calmRobots();
        }
      }
    }
  }

  // ==================================================================
  // Registrations
  // ==================================================================
  PV.onEnter = function (key) {
    if (key === "five_boro_tower" && q.active(QT) && q.stage(QT) === "enter")
      q.set(QT, K.has("pv3_arc_regulator") ? "crown" : "regulator");
    if (key === "jefferson_market" && q.active(QC) && q.stage(QC) === "find")
      q.set(QC, "defend");
  };
  let dataDone = false;
  function dataOnce() {
    if (dataDone) return;
    dataDone = true;
    K.safe("items", items);
    K.safe("quests", quests);
    K.safe("dialogues", dialogues);
    K.safe("hooks", worldHooks);
  }
