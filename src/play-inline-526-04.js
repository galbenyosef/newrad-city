// play-inline-526 04 — the
// Lines 688-1032 of readable/play-inline-526.pretty.js (statement-aligned).
  function encAmbush() {
    const P = G.player.pos;
    const s = K.streetSpot(P.x, P.z, 40, 60, {
      road: true,
      hidden: true,
      notSettlement: true,
      clear: 1.2,
      tries: 40,
    });
    if (!s) return null;
    const lvl = K.level();
    const decoy = K.spawnActor({
      type: "human",
      outfit: K.outfit("drifter", "settler"),
      gender: "m",
      hair: "short",
      faction: "amb_decoy",
      hostile: false,
      name: "Wounded Drifter",
      level: Math.max(3, lvl),
      hp: 70,
      pos: s,
      yaw: K.yawTo(s.x, s.z, P.x, P.z),
      ai: "sit",
      weapon: K.itemExists("pistol_10mm") ? "pistol_10mm" : "none",
      noRespawn: true,
      dialogue: "amb_dlg_bait",
      voice: "raider",
      seed: "amb_bait" + Math.floor(Math.random() * 99),
      barks: {
        idle: [
          "Help... somebody... over here...",
          "Please... my leg...",
          "Anybody got a tonic? Please...",
        ],
        greet: ["Oh thank God, over here! Please!"],
      },
      inventory: K.stock([
        [K.SCRIP, K.randInt(20, 50)],
        ["amb_note_bait_plan", 1],
        ["rally_tonic", 1],
        ["ammo_10mm", 14],
      ]),
    });
    if (!decoy) return null;
    const E = {
      kind: "ambush",
      x: s.x,
      z: s.z,
      actors: [decoy],
      decoy,
      t: 0,
      state: "bait",
      warned: false,
      callT: 0,
      lvl,
      uid: newUid(),
      greeted: false,
      nearT: 0,
      leftT: 0,
    };
    E.update = function (dt) {
      E.t += dt;
      const d = K.distToPlayer(decoy.pos.x, decoy.pos.z);
      if (E.state === "bait") {
        if (!K.actorAlive(decoy)) {
          E.state = "done";
          return U.castGone(E) ? "gone" : null;
        }
        if (decoy.inCombat || decoy.hp < decoy.maxHp) {
          spring(E, false);
          return null;
        }
        E.callT -= dt;
        if (E.callT <= 0 && d < 55) {
          E.callT = K.rand(5, 9);
          K.say(
            decoy,
            K.pick([
              "Help! Over here!",
              "Please, I can't walk! Help me!",
              "Raiders... they jumped me... please...",
            ]),
            3,
          );
        }
        if (!E.warned && d < 32 && K.attr("senses") >= 7) {
          E.warned = true;
          G.notify(
            "[Senses] Something's off. The \"wounded\" man's pistol is within easy reach, and there are fresh boot prints leading behind the wrecks.",
          );
        }
        const busy = K.actorBusy(decoy);
        const canTalk =
          !G.isStub("dialogue") &&
          G.dialogue &&
          typeof G.dialogue.start === "function";
        // force-greet: he calls you over and starts the conversation himself once you are close
        // (outside the 3.2 m talk range, so the story always gets told before anything happens).
        if (!E.greeted && canTalk && d < 5.5 && G.state === "play" && !busy) {
          E.greeted = true;
          try {
            if (!G.dialogue.start("amb_dlg_bait", decoy)) E.greeted = false;
          } catch (e) {
            E.greeted = false;
            G.reportError("ambient:bait greet", e);
          }
          return null;
        }
        if (busy) {
          E.nearT = 0;
          return null;
        }
        // no dialogue engine: the old proximity trigger, right on top of him
        if (!canTalk && d < 2.5) {
          spring(E, false);
          return null;
        }
        // walked away after the talk: they give up the act and open fire at range
        if (E.greeted && E.leftT && d > 14) {
          spring(E, true);
          return null;
        }
        // dismissed the talk (Esc) but loiters right on top of him: the boys stop waiting
        if (E.greeted && d < 2.5) {
          E.nearT += dt;
          if (E.nearT > 4) {
            spring(E, false);
            return null;
          }
        } else E.nearT = 0;
        // dismissed the talk and wandered off without an answer: count it as walking away
        if (E.greeted && !E.leftT && d > 20) E.leftT = K.now() || 1;
        return d > 200 ? "gone" : null;
      }
      return U.castGone(E) || E.t > 600 ? "gone" : null;
    };
    E.cleanup = function () {
      if (baitE === E) baitE = null;
      U.removeCast(E);
    };
    baitE = E;
    return E;
  }
  /** The trap closes: the decoy gets up shooting, his friends come out from behind the wrecks. */
  function spring(E, called) {
    if (!E || E.state !== "bait") return;
    E.state = "sprung";
    const dc = E.decoy,
      P = G.player.pos;
    if (K.actorAlive(dc)) {
      dc.faction = "raiders";
      dc.name = called ? "Ricky the Bait" : "Raider";
      K.say(
        dc,
        called
          ? E.leftT
            ? K.pick([
                "Screw it — mark's walking! Light 'em up!",
                "Cheap bastard. Boys — NOW!",
              ])
            : "Damn it — they made us! Light 'em up!"
          : K.pick([
              "NOW, boys!",
              "Surprise, sucker!",
              "Hah! Works every time!",
            ]),
        3,
      );
      K.aggro(dc);
    }
    const n = K.randInt(2, 3) + (E.lvl >= 8 ? 1 : 0);
    const ax = dc ? dc.pos.x : E.x,
      az = dc ? dc.pos.z : E.z;
    for (let i = 0; i < n; i++) {
      // behind cover off to the sides of the bait, out of the player's view when possible
      const sp =
        K.streetSpot(ax, az, 9, 18, {
          road: false,
          hidden: true,
          clear: 0.8,
          tries: 24,
        }) ||
        K.freeSpotNear(
          ax + (Math.random() - 0.5) * 16,
          az + (Math.random() - 0.5) * 16,
          4,
          12,
        );
      if (!sp) continue;
      const a = K.spawnActor({
        type: "raider",
        faction: "raiders",
        voice: "raider",
        level: Math.max(2, E.lvl + K.randInt(-1, 1)),
        pos: sp,
        yaw: K.yawTo(sp.x, sp.z, P.x, P.z),
        ai: "patrol",
        patrol: [{ x: P.x, z: P.z }],
        noRespawn: true,
      });
      if (a) {
        E.actors.push(a);
        K.aggro(a);
        if (i === 0)
          K.say(
            a,
            called
              ? E.leftT
                ? "Told you nobody falls for the leg thing anymore, Ricky!"
                : "Told you that one was too smart for the leg thing, Ricky!"
              : "Heh. Nobody walks past a bleeding man.",
            3,
          );
      }
    }
    if (K.fauna) K.fauna.scare(ax, az, 60);
  }
  function baitDialogue() {
    K.registerDialogue("amb_dlg_bait", {
      start: "hello",
      nodes: {
        hello: {
          text: "Oh thank God. Raiders, three of 'em, took my pack and shot me in the leg. I can't stand. Please, you gotta have a Rally Tonic. Come closer, I can't... I can't shout anymore.",
          responses: [
            {
              text: "Let me take a look at that leg.",
              action: () => spring(baitE, false),
              end: true,
            },
            {
              get id() {
                return "called#" + ((baitE && baitE.uid) || "0");
              },
              text: "Your leg's fine, and your friends behind that wreck are breathing too loud.",
              check: { attr: "senses", value: 7 },
              next: "called",
              failNext: "nothing",
            },
            {
              text: "Good luck.",
              action: () => {
                if (baitE) baitE.leftT = K.now() || 1;
              },
              end: true,
            },
          ],
        },
        called: {
          text: "...Huh. Huh! You know, most people just kneel down. Most people are very trusting. ...BOYS!",
          onEnter: () => {
            K.addXP(20, "Saw through an ambush");
          },
          responses: [
            {
              text: "[Draw your weapon]",
              action: () => spring(baitE, true),
              end: true,
            },
          ],
        },
        nothing: {
          text: "W-what? What friends? Please, I'm bleeding out here — just come closer...",
          responses: [
            {
              text: "Alright, let me see.",
              action: () => spring(baitE, false),
              end: true,
            },
            {
              text: "No.",
              action: () => {
                if (baitE) baitE.leftT = K.now() || 1;
              },
              end: true,
            },
          ],
        },
      },
    });
  }

  // ==================================================================
  // CONTINUITY SKY-EYE PROPAGANDA DRONE (tinny march through a speaker)
  // ==================================================================
  // Original march in C, 2/4 at 116 bpm; [midi, eighths]; 0 = rest. Two phrases, then the broadcast.
  const MEL = [
    [67, 1],
    [64, 1],
    [67, 1],
    [72, 1],
    [76, 1],
    [74, 1],
    [72, 1],
    [67, 1],
    [69, 1],
    [65, 1],
    [69, 1],
    [72, 1],
    [71, 2],
    [67, 2],
    [67, 1],
    [64, 1],
    [67, 1],
    [72, 1],
    [76, 1],
    [77, 1],
    [79, 1],
    [76, 1],
    [74, 1],
    [71, 1],
    [67, 1],
    [71, 1],
    [72, 3],
    [0, 1],
    [76, 1],
    [76, 1],
    [77, 1],
    [79, 1],
    [81, 2],
    [79, 2],
    [77, 1],
    [77, 1],
    [76, 1],
    [74, 1],
    [76, 2],
    [72, 2],
    [74, 1],
    [74, 1],
    [76, 1],
    [77, 1],
    [79, 1],
    [77, 1],
    [76, 1],
    [74, 1],
    [72, 1],
    [71, 1],
    [69, 1],
    [71, 1],
    [72, 3],
    [0, 1],
  ];
  const CHORDS = [
    48, 48, 53, 55, 48, 48, 55, 48, 48, 53, 48, 48, 50, 55, 55, 48,
  ]; // root per bar (C C F G ...)
