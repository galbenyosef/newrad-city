// play-inline-591 06 — the
// Lines 1246-1588 of readable/play-inline-591.pretty.js (statement-aligned).
  function afterWorld() {
    const f = F(),
      v = f.variant;
    const trust = I().roseTrust;
    if (f.ending === "A") {
      if (v === "A1" && trust >= 3) K.returnRose("home");
      else if (v === "A2") {
        const p = anchor("platform_mid");
        K.returnRose({ x: p.x, y: p.y, z: p.z });
      } else if (v === "A1") {
        K.despawn("lair_rose");
      }
      K.despawn("lair_tinder");
      K.despawn("lair_hollowell");
      later(2, () =>
        K.notify("The Ruins are still out there. So are you.", { duration: 6 }),
      );
    } else if (f.ending === "B") {
      for (const id of K.ZEALOTS.concat(["lair_tinder", "lair_hollowell"])) {
        const a = K.npc(id);
        if (a && !a.dead && a.setHostile)
          K.safe("calm", () => a.setHostile(false));
      }
      const n = K.npc("lair_nicole");
      if (n) n.essential = true;
      if (v === "B2") K.returnRose("home");
      else if (v === "B3") K.despawn("lair_rose");
      later(2, () =>
        K.notify(
          "The Glowkeepers leave in April. Until then, the city is yours to walk.",
          { duration: 6 },
        ),
      );
    } else if (f.ending === "C") {
      K.despawnSunCast(false);
      const p = K.anchors.spur_outside;
      if (p && G.player)
        K.safe("tp", () =>
          G.fadeTransition(() => G.player.teleport(p.x, p.y, p.z, PI)),
        );
      later(2.5, () =>
        K.notify(
          "Free roam. The story is over; the city is as it stood on Saturday night.",
          { duration: 7 },
        ),
      );
    }
  }

  // ==================================================================
  // ENDING A: the firing set, the breaker, the battery (always a way to disarm)
  // ==================================================================
  const FIRING = {
    start: "set",
    nodes: {
      set: {
        speaker: "The Firing Set",
        text: () =>
          "[A grey steel box on a card table, its amber lamp burning. Cables to the casing; a brass plate with a cipher wheel and two keyways, Key A already seated. The clock says 09:" +
          String(F().clock || 41).padStart(2, "0") +
          ".]",
        responses: () => [
          {
            text: "Zeke! The wheel!",
            cond: () => K.mustered("zeke") && K.alive("zeke"),
            end: true,
            action: () => disarm("zeke"),
          },
          {
            text: "Rose. The wheel.",
            cond: () => K.npcAlive("lair_rose") && I().roseTrust >= 2,
            end: true,
            action: () => disarm("rose"),
          },
          {
            text: "[Electronics 60] Lift the arming relay out of the circuit.",
            check: { skill: "electronics", value: 60 },
            end: true,
            action: () => disarm("electronics"),
          },
          {
            text: "[Mechanics 60] Back the firing pins out of the keyways.",
            check: { skill: "mechanics", value: 60 },
            end: true,
            action: () => disarm("mechanics"),
          },
          {
            text: "Turn the cipher wheel to a word that was never in the codebook.",
            cond: () => !!I().sunWordDenied,
            end: true,
            action: () => disarm("wrongword"),
          },
          {
            text: "[Tear the leads off the battery and drag it clear.] (Heavy radiation)",
            cond: () => batteryHere(),
            end: true,
            action: () => disarm("battery"),
          },
          {
            text: "[The main breaker, on the north wall.]",
            end: true,
            action: () =>
              K.notify(
                "The M42 main breaker: the big knife-switch on the north wall.",
                { duration: 4 },
              ),
          },
          { text: "[Step back.]", end: true },
        ],
      },
    },
  };
  const batteryHere = () =>
    !K.ms("rose_captive") && !K.flag("ms_battery_pulled");

  // ==================================================================
  // Registration
  // ==================================================================
  K.addBuild(50, function () {
    if (!K.live("quests")) return;
    defineQuest();
    const lib = L();
    if (lib && lib.dialogue) {
      lib.dialogue("lair_dlg_dawn", DAWN);
      lib.dialogue("lair_dlg_rose", ROSE_DLG);
      lib.dialogue("lair_dlg_firing", FIRING);
    }
    // the M42 interactables (Ending A) — always present, only useful while the bomb is armed
    K.interact({
      getPos: () =>
        anchor("firing_set") &&
        new THREE.Vector3(
          anchor("firing_set").x + 1.0,
          1.0,
          anchor("firing_set").z,
        ),
      radius: 1.4,
      label: "Firing Set",
      verb: "Use",
      priority: 2,
      enabled: () => stage() === "stop" && !F().disarmed,
      onInteract: () =>
        K.safe("firing", () =>
          G.dialogue.start("lair_dlg_firing", null, { name: "The Firing Set" }),
        ),
    });
    K.interact({
      getPos: () =>
        anchor("breaker") &&
        new THREE.Vector3(anchor("breaker").x, 1.7, anchor("breaker").z - 1.0),
      radius: 1.6,
      label: "M42 Main Breaker",
      verb: "Throw",
      priority: 2,
      enabled: () => stage() === "stop" && !F().disarmed,
      onInteract: () => {
        K.safe("lever", () => {
          if (K.sun.lever) K.sun.lever.rotation.x = -1.2;
        });
        disarm("breaker");
      },
    });
    // examine spots: Sun Room set pieces (text only), any time
    const look = (name, label, text, dy) =>
      K.interact({
        getPos: () => {
          const a = anchor(name);
          return a
            ? new THREE.Vector3(a.x, (a.y || 0) + (dy || 1.0), a.z)
            : null;
        },
        radius: 1.2,
        label,
        verb: "Look",
        priority: 0,
        enabled: () =>
          inSun() &&
          G.state === "play" &&
          !(stage() === "face" && F().phase === "cards"),
        onInteract: () =>
          K.notify(typeof text === "function" ? text() : text, { duration: 7 }),
      });
    look(
      "cradle",
      "Cradle",
      "A small wooden cradle on rockers, kept for twenty-one years. A knitted blanket in faded rose and sky. Beside it on the floor, a tin cup.",
      0.6,
    );
    look(
      "dosimeter",
      "Dosimeter",
      () =>
        "A civil-defence dosimeter on a tripod, its probe aimed at the casing's tail seam. The needle never quite settles. M42 reads hot.",
      1.0,
    );
    look(
      "record_player2",
      "Record Player",
      '"Two Bits and a Kiss", Ruby Castellano, 45 rpm, turning on a wind-up player. The label is worn white where a thumb has held it.',
      0.9,
    );
    look(
      "clock",
      "The Information Booth Clock",
      () =>
        "The four-faced clock from Grand Central's information booth, hung on a dead converter by a chain. It says 09:" +
        String(F().clock || 31).padStart(2, "0") +
        ".",
      3.5,
    );
    if (K.live("items") && G.items.define)
      K.safe("item", () =>
        G.items.define({
          id: "lair_key_a",
          name: "Key A (the Pilot's Key)",
          type: "key",
          weight: 0,
          value: 0,
          quest: true,
          desc: "A brass arming key on a chain, worn bright by a thumb. The other one is walled into the floor of M42 with the bomb it was made for.",
        }),
      );
  });

  // a talk with Nicole's actor goes through the phase router
  K.onUpdate(function (dt, realDt) {
    const f = K.state && K.state.fin;
    if (!f) return;
    // back in the world after the slides
    if (
      f.pendingComplete &&
      G.state === "play" &&
      !(K.live("dialogue") && G.dialogue.isActive())
    ) {
      f._settleT = (f._settleT || 0) + realDt;
      if (f._settleT > 1.0) {
        f._settleT = 0;
        settle();
      }
    } else f._settleT = 0;
    // Ending A: the soft timer runs (one minute per 18 s), holds at 09:46 — never a fail state
    if (stage() === "stop" && !f.disarmed && dt > 0) {
      f._clk = (f._clk || 0) + dt;
      if (f._clk > 18) {
        f._clk = 0;
        const m = Math.min(46, (f.clock || 41) + 1);
        if (m !== f.clock) {
          clockTo(m);
          if (m === 46)
            K.notify(
              "09:46. The firing set is humming. It is waiting for somebody to turn a key.",
              { duration: 5 },
            );
        }
      }
    }
    if (f._frozen && !K.cardsActive() && !(L() && L().cineActive()))
      freeze(false);
    // clock readout only while in the Sun Room during the scene
    if (K.clock.shown() && (!inSun() || (f.ending && f.slidesPlayed)))
      K.clock.hide();
    else if (
      !K.clock.shown() &&
      inSun() &&
      active() &&
      (stage() === "face" || stage() === "stop" || stage() === "keys") &&
      f.phase !== "pre"
    )
      K.clock.show(f.clock || 31);
  });

  // shooting in the Sun Room before the choice
  G.events.on("actorDamaged", (a, amt, info) => {
    if (
      !a ||
      !info ||
      info.source !== "player" ||
      !active() ||
      stage() !== "face"
    )
      return;
    const f = F();
    if (f.ending) return;
    if (a.id === "lair_nicole") {
      endA("A1");
      return;
    }
    if (a.id === "lair_rose") return;
    if (
      K.ZEALOTS.indexOf(a.id) >= 0 ||
      a.id === "lair_tinder" ||
      a.id === "lair_hollowell"
    ) {
      if (!f.violence) {
        f.violence = true;
        K.setFlag("ms_fin_violence", true);
        startFight();
        K.notify(
          "Nicole doesn't move from the cradle. She watches you do it.",
          { duration: 5 },
        );
      }
    }
  });
  G.events.on("actorKilled", (a) => {
    if (!a || !active()) return;
    if (a.id === "lair_nicole" && !F().ending) endA("A1");
  });
  G.events.on("dialogueEnd", (actor, id) => {
    if (id !== "lair_dlg_dawn" || !active() || stage() !== "face" || F().ending)
      return;
    // walking away mid-Reckoning: she waits (talk to her again to go on)
    const a = K.npc("lair_nicole");
    if (a) a.dialogue = "lair_dlg_dawn";
  });
  K.onSpawn(function () {
    // a load inside the lair: put the room back the way the story left it
    later(0.6, () => {
      K.sunDress();
      if (!inSun()) return;
      if (active() || F().ending) K.spawnSunCast();
      if (
        active() &&
        stage() === "face" &&
        (F().phase === "pre" || F().phase === "cards")
      ) {
        F().phase = "pre";
        later(0.6, recognition);
      } else if (active() && stage() === "face") later(1.0, resumeTalk);
      else if (active() && stage() === "enter") later(0.6, recognition);
      if (F().fight && !F().disarmed && stage() === "stop") startFight();
    });
  });
  K.onReset(function () {
    if (G.player && F()._frozen) G.player.frozen = false;
  });

  // public surface (debug / other modules)
  LR.finale = {
    state: () => JSON.parse(JSON.stringify(F())),
    variant: () => F().variant || null,
    enterSunRoom: () => K.onEnterSunRoom(),
  };
