// play-inline-570 09 — responses
// Lines 2252-2554 of readable/play-inline-570.pretty.js (statement-aligned).
  ms.spot({
    id: "ms5_cot",
    when: () => stage("mq34") === "sleep",
    at: {
      site: "grand_central",
      anchors: ["stationmaster", "office", "leader"],
      fallback: { x: 262, z: -236 },
      dx: 1.2,
    },
    label: "Cot (Stationmaster's Office)",
    verb: "Sleep until 05:00",
    radius: 1.5,
    use() {
      sleepToFive();
    },
  });
  // Rocky puts out the call
  ms.inject("dlg_rc_rocky", {
    start: () =>
      stage("mq34") === "muster" && !ms.f("mq34_called") ? "mq34_call" : null,
    nodes: {
      mq34_call: {
        text: "Pal. [He turns the mic off, which he never does.] I heard. Everybody's heard something, nobody's heard the same thing. What do you need?",
        responses: [
          {
            text: "Put out a call, Rocky. Everybody who owes me a favour: Grand Central, tonight.",
            next: "mq34_call2",
          },
          { text: "Nothing yet." },
        ],
      },
      mq34_call2: {
        text: 'In clear? On my air? [He thinks about it for exactly one second.] No. In code. Old trick from the fight game. "Wear your Sunday best." The ones who need to know will know. [Mic on. Big voice.] Good evening, New Rad City, this is Radio Free Manhattan, and I\'ve got a message for some friends...',
        onEnter() {
          rockyCall();
        },
        responses: [{ text: "Thanks, Rocky." }],
      },
    },
  });
  ms.inject("dlg_bs_lys", {
    start: () =>
      stage("mq34") === "muster" && ALLY_BY.lys.ok() && !mustered("lys")
        ? "mq34_lys"
        : null,
    nodes: {
      mq34_lys: {
        text: "You have the look of a man about to ask a woman to do something stupid on a Sunday. [She rolls a fresh sheet into the typewriter.] Ask, then.",
        responses: [
          { text: "Hold the tunnels with us tomorrow.", next: "mq34_lys2" },
          { text: "Never mind." },
        ],
      },
      mq34_lys2: {
        text: "[She types a line, reads it, pulls the sheet out and folds it into her coat.] I owe someone down there a debt I cannot pay in scrip. Very well. I will be on the platform stair at five, with a pistol I have never fired. Do not tell Paris.",
        onEnter() {
          muster("lys");
        },
        responses: [{ text: "There is no Paris, Lys." }],
      },
    },
  });
  ms.inject("dlg_neon_capt", {
    start: () =>
      stage("mq34") === "muster" && ALLY_BY.neon.ok() && !mustered("neon")
        ? "mq34_kin"
        : null,
    nodes: {
      mq34_kin: {
        text: "Topsider. You've got the face of a man with a favour and no scrip.",
        responses: [
          {
            text: "Tomorrow at five, under Grand Central. I need the Neon Guard on the tunnel stairs.",
            next: "mq34_kin2",
          },
          { text: "Never mind, Captain." },
        ],
      },
      mq34_kin2: {
        text: "You held the Buzz for us. [She doesn't make you wait.] Six guards and me. The Neon's been burned once already; we know the smell coming. We'll be there.",
        onEnter() {
          muster("neon");
        },
        responses: [{ text: "Thank you, Captain." }],
      },
    },
  });
  ms.inject("dlg_gc_moe", {
    add: [
      {
        node: "bar",
        responses: [
          {
            text: "Pour one for tomorrow, Moe.",
            cond: () => Q.isActive("mq34"),
            next: "mq34_moe",
          },
        ],
      },
    ],
    nodes: {
      mq34_moe: {
        text: "[He pours two, pushes one across, and drinks the other himself, which he never does.] On the house. Really on the house, this time. [He looks at the stool with ZEKE scratched into it.] You bring him back up those stairs. Both of you. I'm not scratching another name.",
        responses: [{ text: "Both of us, Moe." }],
      },
    },
  });
  // Zeke: he nearly says the name
  const ZEKE34 = {
    mq34_zeke: {
      speaker: "Zeke Marlow",
      text: "[Zeke is on his stool at the Oyster Bar, nursing something he hasn't touched.] Sit down. No, sit. [He waits until you do.] Something's been eating me since the North Woods. That sun on the slab. Twelve rays. The way they all say \"keep the light on\". I knew a girl who said that. Every night, at the door, like a joke between the two of you that I wasn't in on.",
      responses: [{ text: "Zeke.", next: "mq34_zeke2" }],
    },
    mq34_zeke2: {
      speaker: "Zeke Marlow",
      text: "[He turns the glass a full circle on the bar.] If it's who I think it is... she was always braver than the both of us. Don't make her be brave alone. She—",
      responses: [
        {
          text: "[Stop him.] Don't, Zeke. Whatever you're about to say. Not tonight.",
          next: "mq34_zeke3",
        },
        { text: "[Put a hand on his arm.] Not tonight.", next: "mq34_zeke3" },
      ],
    },
    mq34_zeke3: {
      speaker: "Zeke Marlow",
      text: () =>
        "...Okay. Okay, kid. [He finally drinks.] " +
        (ms.f("torch") === "selective"
          ? "I'm not holding a door for you tomorrow. You loaded that Directive, and I can't look at you and that at the same time. Ruth says she'll go down. She signed us into those pods; she figures she can sign us out of this. I'll be here. On my stool. Where I can see the stairs."
          : "I'll be on the platform stair at five with Ruth. Calloway. She signed us into those pods, she figures she can sign us out of this. And if you get to that firing set and you don't know which wire, you shout for me. I've been waiting twenty-two years to be useful."),
      onEnter() {
        zekeDone();
      },
      responses: [{ text: "Get some sleep, Zeke." }],
    },
  };
  ms.inject("dlg_lib_zeke", {
    start: () =>
      stage("mq34") === "zeke" ||
      (stage("mq34") === "muster" && !ms.f("mq34_zeke"))
        ? "mq34_zeke"
        : null,
    nodes: ZEKE34,
  });
  ms.dlg("dlg_ms5_zeke", "idle").add(
    Object.assign(
      {
        idle: {
          text: "[Zeke's stool is empty.]",
          responses: [{ text: "[Step back.]" }],
        },
      },
      ZEKE34,
    ),
  );
  ms.spot({
    id: "ms5_zeke_stool",
    when: () => stage("mq34") === "zeke" && !L.alive("lib_zeke"),
    at: Object.assign({ dx: 1.5, dz: 1 }, OYSTER),
    label: "Zeke's Stool",
    verb: "Sit",
    radius: 1.5,
    use() {
      if (L.flag("dead_lib_zeke")) {
        L.notify(
          "Zeke's stool. ZEKE, scratched into the seat. Nobody sits on it.",
        );
        zekeDone();
      } else ms.talk("dlg_ms5_zeke", "Zeke Marlow", "mq34_zeke");
    },
  });
  // Rose on the Oyster Bar steps
  ms.dlg("dlg_ms_rose")
    .add({
      mq34_steps: {
        speaker: "Rose",
        text: () =>
          "[Rose is sitting on the steps down to the Oyster Bar with the rifle across her knees, under the low tiled arches." +
          (ms.f("ring") === "rose" && ms.trust() >= 4
            ? " Your grandmother's ring is on her finger. She keeps turning it."
            : "") +
          "] Sit. [She shifts over.] Tell me about the blackout.",
        responses: [
          { text: "[Tell her.]", next: "mq34_blackout" },
          { text: "Why that?", next: "mq34_why" },
        ],
      },
      mq34_why: {
        speaker: "Rose",
        text: "Because it's the night before. Because everybody in this building is telling stories tonight and that's the one I want. Tell me.",
        responses: [{ text: "[Tell her.]", next: "mq34_blackout" }],
      },
      mq34_blackout: {
        speaker: "Rose",
        text: '[You tell her. November 1965, the whole Northeast dark at once, this concourse black as a mine. You broke open a Civil Defense locker for candles. A woman went from group to group with a box of matches, lighting them, saying somebody has to keep the light on. She drew a little sun on your candle box. You walked her home along 42nd Street.]\n\n[Rose listens without interrupting, and when you finish she says the last line with you, quietly, a beat ahead.] "...somebody has to keep the light on." [She looks at her hands.] I know it. I could say it before I could read. I wanted to hear it from somebody who was there.',
        responses: [
          { text: "Tomorrow. Come with me.", next: "mq34_come" },
          { text: "Tomorrow, stay up here. Please.", next: "mq34_stay" },
        ],
      },
      mq34_come: {
        speaker: "Rose",
        text: () =>
          ms.trust() >= 3
            ? "[She doesn't answer for a long time. Then she stands up, slings the rifle, and offers you a hand up off the step.] Five o'clock. I know a better way in than theirs. I've used it once, going the other direction."
            : "[She shakes her head.] No. You go your way, I go mine. I know a way in you don't, and I'll be there when it counts. [She doesn't look at you.] That's the most I've got.",
        onEnter() {
          roseChoice(true);
        },
        responses: [
          {
            text: () =>
              ms.trust() >= 3 ? "Five o'clock." : "Be careful, Rose.",
          },
        ],
      },
      mq34_stay: {
        speaker: "Rose",
        text: "[She looks at you for a long moment, and doesn't argue, and doesn't agree. She just starts cleaning the scope.] Get some sleep, Dad.",
        onEnter() {
          roseChoice(false);
        },
        responses: [{ text: "[Leave her be.]" }],
      },
    })
    .when(() => (stage("mq34") === "rose" ? "mq34_steps" : null));

  // the mustered allies at Grand Central (visible representatives; named characters stay with their own modules)
  const REPS = [
    {
      id: "ms_mu_lancer",
      ally: "lancers",
      name: "Lancer-Sergeant Okafor-Price",
      gender: "m",
      outfit: "covenant_exo_rig",
      weapon: ["gyrojet_carbine", "assault_rifle"],
      dx: 8,
      dz: 6,
      barks: ["Iron keeps.", "Five o'clock. We'll be ready at four."],
    },
    {
      id: "ms_mu_defector",
      ally: "hale",
      name: "Corporal Dunleavy",
      gender: "f",
      outfit: "continuity_uniform",
      weapon: ["gyrojet_carbine", "assault_rifle"],
      dx: -8,
      dz: 6,
      barks: [
        "The Lieutenant sends her regards. And twelve rifles.",
        "Never thought I'd sleep in a train station on purpose.",
      ],
    },
    {
      id: "ms_mu_neon",
      ally: "neon",
      name: "Neon Guard Sergeant Tobey",
      gender: "m",
      outfit: "combat_armor",
      weapon: ["assault_rifle", "hunting_rifle"],
      dx: 6,
      dz: -6,
      barks: [
        "Captain says hold the stair, we hold the stair.",
        "Smells like the Neon down there. Burnt.",
      ],
    },
  ];
  for (const r of REPS) {
    ms.actor({
      id: r.id,
      when: () =>
        (Q.isActive("mq34") ||
          (Q.isComplete("mq34") && !Q.isComplete("mq35"))) &&
        mustered(r.ally),
      def: () => ({
        type: "human",
        name: r.name,
        gender: r.gender,
        outfit: r.outfit,
        faction: "settlers",
        hostile: false,
        essential: true,
        ai: "guard",
        home: "here",
        homeR: 3,
        level: 12,
        hp: 320,
        weapon: r.weapon,
        at: {
          site: "grand_central",
          anchors: [],
          fallback: { x: GC.x + r.dx, z: GC.z + r.dz },
          maxR: 6,
        },
        barks: r.barks,
      }),
    });
  }

