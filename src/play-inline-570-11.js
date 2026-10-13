// play-inline-570 11 — responses
// Lines 2891-3234 of readable/play-inline-570.pretty.js (statement-aligned).
  T61_Z.forEach((id, i) =>
    ms.actor({
      id,
      when: () =>
        inStage("mq35", ["enter", "platform"]) && !L.flag("ms_mq35_left"),
      def: () => {
        const leader = i === 0;
        const c = lp("platform") || LAIR_FB.platform.fallback;
        return {
          type: leader ? "glowkeeper_brother" : "glowkeeper_zealot",
          seed: 340 + i,
          name: leader ? "Brother Ember" : "Glowkeeper Zealot",
          gender: i === 2 ? "f" : "m",
          outfit: "glowkeeper_robes",
          faction: "glowkeepers",
          hostile: !!ms.f("mq35_fight"),
          essential: leader && !ms.f("mq35_fight"),
          ai: "guard",
          home: "here",
          homeR: 3,
          level: 12,
          hp: leader ? 240 : 170,
          weapon: leader
            ? ["hunting_rifle", "bolt_rifle_32"]
            : [
                ["machete", "lead_pipe"],
                ["pipe_pistol", "pistol_10mm"],
                ["sledgehammer", "machete"],
              ][i % 3],
          dialogue: leader ? "dlg_ms5_ember" : undefined,
          at: {
            fallback: {
              x: c.x + (i - 1.5) * 2.2,
              z: c.z + (i % 2 ? 2 : -1),
              y: c.y,
            },
            maxR: 5,
          },
          barks: [
            "Keep the light on.",
            "Turn back, sleeper.",
            "She said you would come.",
          ],
        };
      },
    }),
  );
  ms.dlg("dlg_ms5_ember", "idle")
    .when(() =>
      !ms.f("mq35_stood_down") && !ms.f("mq35_fight") ? "ember" : null,
    )
    .add({
      idle: {
        text: () =>
          ms.f("mq35_stood_down")
            ? "Go on. We are going up."
            : "[Brother Ember bars the platform with a rifle held across his chest.]",
        responses: [
          {
            text: "Stand aside, Brother.",
            next: "ember",
            cond: () => !ms.f("mq35_stood_down") && !ms.f("mq35_fight"),
          },
          { text: "[Leave.]" },
        ],
      },
      ember: {
        text: () =>
          "[A young man in ivory robes, a gold stole, a rifle he holds like a broom. Three zealots behind him, faces wrapped.] The Dawn said the sleeper would come down this way. She said to let you pass. [His jaw works.] She didn't say anything about letting you pass with a gun in your hand." +
          (ms.f("hollowell") === "ally"
            ? " ...Is that the Keeper's voice? On the stair?"
            : ""),
        responses: [
          {
            text: "[Wait for Hollowell.]",
            cond: () => ms.f("hollowell") === "ally",
            action: () => standDown("hollowell"),
          },
          {
            text: "[Persuasion 50] Nobody on this platform has to burn today. Go up. It's a Sunday. Go and see it.",
            check: { skill: "persuasion", value: 50 },
            next: "ember_yes",
            failNext: "ember_no",
          },
          {
            text: "[Presence 6] [Say nothing. Walk toward him until he has to decide.]",
            check: { attr: "presence", value: 6 },
            next: "ember_yes",
            failNext: "ember_no",
          },
          { text: "Move, or I move you.", next: "ember_fight" },
        ],
      },
      ember_yes: {
        text: "[He looks at you for a long time. Then at the three behind him. Then he lowers the rifle, and they lower theirs.] Up, then. [Almost a laugh.] I've never seen it on a Sunday. The sky.",
        onEnter() {
          standDown("talk");
        },
        responses: [{ text: "Go on." }],
      },
      ember_no: {
        text: "No. No. You don't get to walk in here and make it simple. [The rifle comes up.]",
        responses: [{ text: "[Fight.]", action: () => platformFight() }],
      },
      ember_fight: {
        text: "[He swallows.] Then keep the light on, sleeper. [The rifle comes up.]",
        responses: [{ text: "[Fight.]", action: () => platformFight() }],
      },
    });
  // Brother Tinder's drill crew
  // removeWhenOff:false — after mq35 the finale may spawn/reuse `ms_tinder`; this file must never remove that actor.
  ms.actor({
    id: "ms_tinder",
    removeWhenOff: false,
    when: () => inStage("mq35", ["candles", "drill", "door"]),
    def: () => {
      const c = lp("drill") || LAIR_FB.drill.fallback;
      return {
        type: "brother_tinder",
        name: "Brother Tinder",
        gender: "m",
        outfit: "glowkeeper_robes",
        faction: "glowkeepers",
        hostile: ms.f("mq35_drill_resolved") === "fight",
        essential: ms.f("mq35_drill_resolved") !== "fight",
        ai: "guard",
        home: "here",
        homeR: 2,
        level: 13,
        hp: 300,
        weapon: ["sledgehammer", "lead_pipe"],
        dialogue: "dlg_ms5_tinder",
        at: { fallback: { x: c.x, z: c.z, y: c.y }, maxR: 4 },
        barks: [
          "Mind the swarf.",
          "Nine forty-seven. Plenty of time.",
          "Water on the bit! WATER!",
        ],
      };
    },
  });
  T61_CREW.forEach((id, i) =>
    ms.actor({
      id,
      when: () => inStage("mq35", ["candles", "drill", "door"]),
      def: () => {
        const c = lp("drill") || LAIR_FB.drill.fallback;
        return {
          type: "glowkeeper_acolyte",
          seed: 360 + i,
          name: "Drill Crew",
          gender: i ? "f" : "m",
          outfit: "glowkeeper_robes",
          faction: "glowkeepers",
          hostile: ms.f("mq35_drill_resolved") === "fight",
          ai: "guard",
          home: "here",
          homeR: 2,
          level: 9,
          hp: 120,
          weapon: ["lead_pipe", "machete"],
          at: {
            fallback: { x: c.x + (i ? 1.8 : -1.8), z: c.z + 1.2, y: c.y },
            maxR: 4,
          },
        };
      },
    }),
  );
  ms.dlg("dlg_ms5_tinder", "idle")
    .when(() => (!tinderResolved() ? "tinder" : null))
    .add({
      idle: {
        text: () =>
          tinderResolved()
            ? "[Brother Tinder sits on an upturned bucket beside the silent drill, wiping his goggles on his apron.]"
            : "[The drill screams.]",
        responses: [
          { text: "Tinder.", next: "tinder", cond: () => !tinderResolved() },
          { text: "[Leave him.]" },
        ],
      },
      tinder: {
        text: () =>
          "[A stocky man in a leather apron over his robe, welding goggles pushed up into a grey beard, stands at a steel door-plate with a drill rig bolted to it. The bit screams into the plate; two Brothers feed it water from buckets.] Mind the swarf, sleeper. The Dawn said you'd come by this way and to let you through. She didn't say anything about letting you touch my drill. " +
          (ms.f("keyB") === "destroyed"
            ? "Somebody dropped the navigator's key in the harbour. So I'm cutting a new keyway into the lock plate. Through by nine forty-seven, God and the bit willing."
            : "You've got the navigator's key in your pocket, I hear. The Dawn doesn't like depending on one man's pocket. So: a spare keyway. Through by nine forty-seven."),
        responses: [
          {
            text: "[Persuasion 55] Put it down, Tinder. You build things. This unbuilds everything you ever built.",
            check: { skill: "persuasion", value: 55 },
            next: "tinder_yes",
            failNext: "tinder_no",
          },
          {
            text: "[Mechanics 50] [Reach past him and slam the feed lever into reverse while the bit is under load.]",
            check: { skill: "mechanics", value: 50 },
            next: "tinder_jam",
            failNext: "tinder_no",
          },
          { text: "Step away from the drill. Now.", next: "tinder_fight" },
          {
            text: "[Walk on.] Keep drilling, Brother. It isn't my door.",
            next: "tinder_pass",
          },
        ],
      },
      tinder_yes: {
        text: "[He looks at the bit for a long moment. Then he reaches up and shuts off the motor, and the silence is enormous.] Twenty years I've been her hands. [He sits down on a bucket.] I'll wait here. If she wants it finished she can come and tell me herself.",
        onEnter() {
          tinder("persuade");
        },
        responses: [{ text: "[Go on.]" }],
      },
      tinder_jam: {
        text: "[The bit bites, binds, and shears off at the chuck with a sound like a church bell dropped down a stair. Tinder stares at it.] ...That was a good bit. That was my last good bit. [He sits down heavily on a bucket.]",
        onEnter() {
          tinder("jam");
        },
        responses: [{ text: "[Go on.]" }],
      },
      tinder_no: {
        text: "[He doesn't even look round.] Go on, sleeper. She's waiting. I've got a schedule.",
        responses: [
          { text: "Step away from the drill. Now.", next: "tinder_fight" },
          { text: "[Walk on.]", next: "tinder_pass" },
        ],
      },
      tinder_fight: {
        text: "[He picks up a sledge from beside the rig.] Then come and stop it.",
        responses: [{ text: "[Fight.]", action: () => tinder("fight") }],
      },
      tinder_pass: {
        text: "Good man. Mind the swarf.",
        onEnter() {
          tinder("pass");
        },
        responses: [{ text: "[Walk on.]" }],
      },
    });
  // Shooting at the platform crew (or the drill crew) before the talk turns it into a fight.
  G.events.on("actorDamaged", (a, dmg, info) => {
    if (!a || !Q.isActive("mq35") || !info || info.source !== "player") return;
    if (
      T61_Z.indexOf(a.id) >= 0 &&
      !ms.f("mq35_fight") &&
      !ms.f("mq35_stood_down")
    )
      platformFight();
    if (
      (a.id === "ms_tinder" || T61_CREW.indexOf(a.id) >= 0) &&
      !tinderResolved()
    )
      tinder("fight");
  });
  G.events.on("actorKilled", (a) => {
    if (!a || !Q.isActive("mq35")) return;
    if (a.id === "ms_tinder" && ms.f("mq35_drill_resolved") === "fight") {
      ms.set("tinder_stopped");
      if (stage("mq35") === "drill")
        L.later(1, () => {
          if (stage("mq35") === "drill") Q.setStage("mq35", "door");
        });
    }
  });
  // the Hall of Candles
  const HALL = {
    candle_r: { label: 'Candle Marked "R."', node: "r" },
    candle_pod7: { label: "Burned-Down Candle", node: "pod7" },
    record_player: { label: "Record Player", node: "record" },
  };
  ms.dlg("dlg_ms5_candles", "idle").add({
    idle: {
      text: "[Candles. More than you can count.]",
      responses: [{ text: "[Step back.]" }],
    },
    hall: {
      speaker: "Hall of Candles",
      text: "[A long vaulted hall off the platform, once a baggage room, given over now to candles: on every ledge, on crates, on the floor in rows, one for every name the city lost. The air is warm and thick with wax. Near the door, apart from the rest, eleven small candles burn in a ring of jam jars.]",
      onEnter() {
        ms.set("mq35_hall");
      },
      responses: [{ text: "[Go further in.]" }],
    },
    r: {
      speaker: "Candle",
      text: () =>
        "[A candle in a glass, by itself on a ledge, the letter R scratched into the glass. The wax is new, the wick trimmed this morning. It has the look of something that has never once been allowed to go out.]" +
        (roseWithEli()
          ? "\n\n[Rose stops in front of it. She stands there long enough that you hear the record player change sides of the room in your head. She doesn't blow it out.]"
          : ""),
      onEnter() {
        ms.set("mq35_candle_r");
        if (roseWithEli())
          L.later(0.5, () => rose.say("...Leave it. Let's go."));
      },
      responses: [{ text: "[Move on.]" }],
    },
    pod7: {
      speaker: "Candle",
      text: '[In the middle of the hall, on an upturned crate, the stump of a candle that has been burned down and replaced and burned down again: twenty-two rings of wax, one on top of another, each a slightly different colour, like the rings of a tree. Pinned under the bottom ring, a scrap of paper gone brown. Two words, in pencil: "pod 7".]\n\n[You told one person on earth where you would be sleeping.]',
      onEnter() {
        ms.set("mq35_pod7");
        L.later(0.5, () => {
          if (stage("mq35") === "candles") Q.setStage("mq35", "drill");
        });
      },
      responses: [{ text: "[...]" }],
    },
    record: {
      speaker: "Record Player",
      text: '[In an alcove, a wind-up record player turns, slow and a little warped: "Two Bits and a Kiss". Somebody wound it this morning. Somebody winds it every morning.]',
      onEnter() {
        ms.set("mq35_record");
      },
      responses: [{ text: "[Let it play.]" }],
    },
  });
  for (const k in HALL) {
    ms.spot({
      id: "ms5_" + k,
      when: () => inStage("mq35", ["candles", "drill", "door"]),
      at: lpAt(k),
      label: HALL[k].label,
      verb: "Look",
      radius: 1.3,
      use() {
        ms.talk("dlg_ms5_candles", HALL[k].label, HALL[k].node);
      },
    });
  }
  ms.spot({
    id: "ms5_m42",
    when: () => stage("mq35") === "door",
    at: lpAt("m42_door"),
    label: "M42 Door",
    verb: "Open",
    radius: 1.8,
    use() {
      reachDoor();
    },
  });
  // progression by place
