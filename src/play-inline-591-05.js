// play-inline-591 05 — variant
// Lines 899-1245 of readable/play-inline-591.pretty.js (statement-aligned).
  const ROSE_DLG = {
    start: () => (F().ending ? "after" : "idle"),
    nodes: {
      idle: {
        speaker: "Rose",
        text: () =>
          roseState() === "captive" && !F().roseFreed
            ? "[She keeps her eyes on the floor.] Not now, Dad."
            : "[She doesn't take her eyes off her mother.] Talk to her. I'm right here.",
        responses: [{ text: "[Step back.]", end: true }],
      },
      after: {
        speaker: "Rose",
        text: () =>
          ({
            A1: "Let's go up. Please. I want to see the sky.",
            A2: "[She is sitting against the flatcar, the rifle across her knees. She won't let go of it.] Carry me up, Dad. In a minute.",
            B1: "April. Bring the good boots, she says. As if you own any.",
            B2: "I'm staying. Somebody has to keep the sign lit.",
          })[F().variant] || "Let's go.",
        responses: [{ text: "[Step back.]", end: true }],
      },
    },
  };

  // ==================================================================
  // SCRIPTED BEATS
  // ==================================================================
  function roseArrives() {
    const f = F();
    if (f.roseArrived) return;
    f.roseArrived = true;
    K.spawnSunCast();
    const sp = anchor("spur_mouth");
    const a = K.npc("lair_rose");
    if (a && sp && a.moveTo)
      K.safe("rose.move", () => a.moveTo(sp.x - 6, sp.z - 2));
    K.sfx("creak", { pos: sp });
    K.sfx("chain_rattle", { pos: sp });
  }
  function roseRaises() {
    const f = F();
    const n = K.npc("lair_nicole");
    if (roseState() === "captive") f.roseFreed = true;
    const a = K.npc("lair_rose");
    if (a && n) {
      K.face("lair_rose", n.pos.x, n.pos.z);
      if (a.char && a.char.setAnim)
        K.safe("aim", () => a.char.setAnim("aim", { loop: true }));
    }
  }
  function roseLowers() {
    K.anim("lair_rose", "idle");
  }
  function shield() {
    const f = F();
    f.roseStood = "shield";
    f.roseDisarmed = true;
    K.setFlag("ms_eli_wounded", true);
    K.sfx("gun_rifle", { pos: G.player.pos });
    K.sfx("hurt_player");
    K.safe("dmg", () => {
      const P = G.player;
      const dmg = Math.min(P.hp - 5, P.maxHp * 0.45);
      if (dmg > 0) P.damage(dmg, { type: "ballistic", source: "script" });
      P.shake && P.shake(0.6, 0.8);
    });
    K.anim("lair_rose", "idle");
  }
  function shotFx(from, to, kind) {
    K.sfx(kind === "rifle" ? "gun_rifle" : "gun_pistol", { pos: from });
    if (K.live("fx"))
      K.safe("fx", () => {
        G.fx.flash(from, 0xffc080, 6, 0.12);
        if (G.fx.tracer) G.fx.tracer(from, to, 0xffd8a0);
      });
  }
  function headPos(id) {
    const a = K.npc(id);
    return a
      ? new THREE.Vector3(a.pos.x, a.pos.y + 1.4, a.pos.z)
      : G.player
        ? G.player.pos.clone()
        : new THREE.Vector3();
  }

  // ---------------- ENDING A ----------------
  function roseFires() {
    const alone = roseState() === "alone";
    const covered = skill("firearms") >= 50;
    endA(alone && !covered ? "A3" : "A2");
  }
  /** Nicole dies (A1 Eli's shot, A2/A3 Rose's), then the fight and the disarm. */
  function endA(variant) {
    const f = F();
    if (f.ending) return;
    f.ending = "A";
    f.variant = variant;
    f.phase = "ending_a";
    if (K.live("dialogue") && G.dialogue.isActive())
      K.safe("dlg.end", () => G.dialogue.end());
    K.setFlag("ms_ending", "A");
    K.setFlag("ms_ending_variant", variant);
    K.setFlag("ms_nicole_dead", true);
    K.setFlag("ms_glowkeepers", "destroyed");
    const target = headPos("lair_nicole");
    if (variant === "A1")
      shotFx(
        G.player.eye ? G.player.eye.clone() : G.player.pos.clone(),
        target,
        "pistol",
      );
    else
      shotFx(
        headPos("lair_rose"),
        target,
        roseState() === "captive" ? "pistol" : "rifle",
      );
    K.killNpc("lair_nicole");
    clockTo(41);
    G.events.emit("lairEnding", "A", variant);
    later(1.4, () => {
      if (variant === "A1") {
        K.anim("lair_rose", "idle");
        K.say("lair_rose", "...Dad.", 3);
      }
      if (variant === "A3") {
        // the zealots return fire; Rose came alone and nobody covered her
        for (const id of K.ZEALOTS.slice(0, 2))
          if (K.npcAlive(id))
            shotFx(headPos(id), headPos("lair_rose"), "pistol");
        K.setFlag("ms_rose_mortal", true);
        later(0.3, () => {
          K.killNpc("lair_rose");
          K.setFlag("ms_rose_dead", true);
          K.notify(
            "Rose goes down beside her mother. She is dead before you reach her.",
            { duration: 6 },
          );
        });
      }
      startFight();
      setStage("stop");
      K.notify(
        variant === "A1"
          ? "Nicole doesn't resist. She is looking at you when she falls."
          : "Rose never misses.",
        { duration: 5 },
      );
      if (I().hollowell === "ally" && K.alive("hollowell"))
        later(2.0, () =>
          K.say("lair_hollowell", "Children. Put them down. Put them DOWN.", 5),
        );
    });
  }
  function startFight() {
    const f = F();
    f.fight = true;
    if (K.live("music")) K.safe("music", () => G.music.setMood("combat"));
    for (const id of K.ZEALOTS)
      if (K.npcAlive(id)) {
        const a = K.npc(id);
        a.ai = "guard";
        a.aiMode = "guard";
        if (a.char && a.char.setAnim)
          K.safe("anim", () => a.char.setAnim("idle", { loop: true }));
        K.hostile(id, true);
      }
    if (K.npcAlive("lair_tinder")) {
      K.npc("lair_tinder").ai = "guard";
      K.hostile("lair_tinder", true);
    }
    K.notify(
      K.npcAlive("lair_tinder")
        ? "Brother Tinder comes off the plate with a sledge. The zealots are getting up."
        : "The zealots are getting up.",
      { duration: 4 },
    );
  }
  function hostilesLeft() {
    for (const id of K.ZEALOTS.concat(["lair_tinder"])) {
      const a = K.npc(id);
      if (a && !a.dead && a.hostile && a.hostile()) return true;
    }
    return false;
  }
  /** Disarm the Second Sun (Ending A). method: zeke | rose | electronics | mechanics | wrongword | battery | breaker */
  function disarm(method) {
    const f = F();
    if (f.disarmed || f.ending !== "A") return;
    f.disarmed = method;
    K.setFlag("ms_second_sun", "disarmed");
    K.setFlag("ms_disarm_method", method);
    if (method === "breaker") K.setFlag("ms_breaker_tripped", true);
    if (method === "battery") {
      K.setFlag("ms_battery_pulled", true);
      K.safe("rads", () => {
        G.player.addRads(240);
        G.player.damage(Math.min(G.player.hp - 10, 30), {
          type: "radiation",
          source: "script",
        });
      });
    }
    K.sunDress();
    K.sfx(method === "breaker" ? "zap" : "relay_click", {
      pos: anchor("firing_set"),
    });
    K.sfx("hum_electric", { volume: 0.4 });
    clockTo(46);
    const line =
      {
        zeke: '"Statue," Zeke says, and turns the wheel to it, and sits down on the floor.',
        rose: '"I watched Tinder dial that wheel a thousand times." Rose turns it to a word that means nothing, and keeps turning it long after it\'s safe.',
        electronics:
          "Two leads, a jumper, the arming relay lifted off its seat. The amber lamp gutters and goes out.",
        mechanics:
          "You back the firing pins out of the keyways and jam the cipher wheel with a cotter pin. The amber lamp gutters and goes out.",
        wrongword:
          "You turn the cipher wheel to a word that was never in the codebook. Somewhere inside the casing, a relay lets go.",
        battery:
          "You tear the leads off Big Buzz No. 2 and haul it off its cradle. The dosimeter screams. The amber lamp goes out.",
        breaker:
          "You throw the M42 main breaker. Six hundred volts arc blue across the knife-switch and die. The firing set goes dark.",
      }[method] || "The firing set goes dark.";
    K.notify("09:46. " + line, { duration: 7 });
    G.events.emit("lairDisarmed", method);
    later(5.5, () => playEnding());
  }
  K.disarm = disarm;

  // ---------------- ENDING B ----------------
  function endB() {
    const f = F();
    if (f.ending) return;
    const i = I();
    let variant = "B2";
    if (f.roseStood === "shield") variant = "B3";
    else if (i.roseTrust >= 4 || (i.rosePromise && i.ring === "rose"))
      variant = "B1";
    else if (i.roseTrust === 3) variant = "B2";
    else variant = "B3";
    if (!rosePresent() && variant !== "B3")
      variant = i.roseTrust >= 4 ? "B1" : "B2";
    f.ending = "B";
    f.variant = variant;
    f.phase = "ending_b";
    K.setFlag("ms_ending", "B");
    K.setFlag("ms_ending_variant", variant);
    K.setFlag("ms_second_sun", "walled");
    K.setFlag("ms_glowkeepers", "walked");
    K.setFlag("ms_eli_joined", true);
    if (K.live("inventory"))
      K.safe("keyA", () => G.inventory.add("lair_key_a", 1, { silent: true }));
    G.events.emit("lairEnding", "B", variant);
    K.cards(
      [
        "09:47. Nothing happens.",
        "A hundred Glowkeepers, in the Sun Room and on the stairs and up in the dark of Track 61, hear their Dawn laugh for the first time anyone can remember.",
        {
          text: "Tinder brings the cement down on the handcar. It takes all of Sunday and most of the night, and in the morning the Second Sun is a long grey shape in the floor of M42, and Tinder is crying, and nobody laughs at him.",
          onShow: () => {
            K.sunDress();
          },
        },
      ],
      () => playEnding(),
    );
  }

  // ---------------- ENDING C ----------------
  function roseNorth() {
    const sp = anchor("spur_deep");
    const a = K.npc("lair_rose");
    if (a && sp && a.moveTo)
      K.safe("rose.go", () => {
        a.ai = "guard";
        a.moveTo(sp.x, sp.z);
      });
    later(6, () => {
      K.despawn("lair_rose");
      F().roseGone = true;
    });
  }
  function endC() {
    const f = F();
    if (f.ending) return;
    const variant = f.cRose === "stays" ? "C2" : "C1";
    f.ending = "C";
    f.variant = variant;
    f.phase = "ending_c";
    K.setFlag("ms_ending", "C");
    K.setFlag("ms_ending_variant", variant);
    K.setFlag("ms_second_sun", "risen");
    K.setFlag("ms_glowkeepers", "gone");
    K.setFlag("ms_eli_joined", true);
    K.setFlag("ms_nicole_dead", true);
    K.setFlag("ms_city_burned_twice", true);
    if (variant === "C2") K.setFlag("ms_rose_dead", true);
    else K.setFlag("ms_rose_survived_c", true);
    if (I().keyB === "destroyed") K.setFlag("ms_keyway_drilled", true);
    setStage("keys");
    G.events.emit("lairEnding", "C", variant);
    K.sfx("key_turn");
    later(0.6, () => K.sfx("key_turn"));
    later(1.6, () => {
      const l = L();
      if (l && l.overlay) l.overlay("#ffffff", 0.25, 3.2, 2.5, 1);
      K.sfx("explosion_nuke");
      K.safe("shake", () => G.player.shake && G.player.shake(1, 3));
    });
    later(5.2, () => playEnding());
  }

  // ==================================================================
  // THE EPILOGUE (slides from 60_epilogue.js) and the hand-back to free roam
  // ==================================================================
  function playEnding() {
    const f = F();
    if (f.slidesPlayed) return;
    f.slidesPlayed = true;
    // whoever is still fighting scatters while the slides play (the Glowkeepers end in the tunnels)
    if (f.ending === "A")
      for (const id of K.ZEALOTS.concat(["lair_tinder"]))
        if (K.npcAlive(id)) K.despawn(id);
    K.clock.hide();
    if (G.state === "dialogue" && K.live("dialogue"))
      K.safe("dlg.end", () => G.dialogue.end());
    setStage("ending");
    f.pendingComplete = true;
    const id = "lair_" + f.variant;
    if (Q()) {
      Q().defineEnding(id, () => K.epilogue(f.variant));
      Q().playEnding(id);
    }
  }
  K.playEnding = playEnding;
  /** Back in the world after the slides: complete the quest and set the world up for free roam. */
  function settle() {
    const f = F();
    if (!f.pendingComplete) return;
    f.pendingComplete = false;
    if (Q() && Q().isActive(QID)) Q().complete(QID);
    K.setFlag("ms_finale_done", f.variant);
    afterWorld();
  }
  K.settle = settle;
