/* src/quests/66_ms_act4.js */
/* =====================================================================
 * NEW RAD CITY — QUESTS — 66: MAIN STORY, END OF ACT IV
 *   n29 mq29 "The Second Dawn" — back in the city, the Dawn takes over every
 *   frequency: the Second Sun rises Sunday at 09:47, and "the sleeper" must
 *   bring what is hers. St. Patrick's empties. On the Tudor City roof Rose
 *   half-admits her lie (LIE 2) and says she means to kill the Dawn. Rocky asks
 *   what to tell the city.
 * Liberty (mq06, mq25–mq28) is in 60_finale.js. Toolkit: L.ms (61_ms_core.js).
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const L = G.quests.lib;
  const Q = G.quests;
  const ms = L.ms;
  const first = () => String(L.heroName()).split(" ")[0];
  const at = (id, s) => Q.isActive(id) && Q.stage(id) === s;
  const GC = { x: 240, z: -230 };

  ms.note({
    id: "ms_note_dawn_broadcast",
    name: "Transcript: the Dawn, on every frequency",
    title: 'ALL BANDS — 18:00 — "The Second Dawn"',
    text:
      "[Every radio in the city at once: Radio Free Manhattan, Continuity Radio, the Neon's jukebox relay, the numbers station on 93.9. One voice, low and careful, every consonant in its place, like someone speaking a second language perfectly.]\n\n" +
      "Children of the Second Sun. And all of you who have never knelt: listen.\n\n" +
      "On Sunday at noon the men with the list will light their torch on the island. They have a schedule. Your children are on it. Every child born since the Bombing is on it, on the empty line at the bottom, and a clerk will choose.\n\n" +
      "No list survives a sun. On Sunday, at nine forty-seven, the hour of the first Kindling, the Second Sun will rise over Grand Central, and nobody will ever be chosen again.\n\n" +
      "If you are afraid, go north today. Go far. We will not stop you. Take a candle.\n\n" +
      "Sleeper. You have something of mine. Bring it. Come alone.\n\nA dimanche.",
  });

  L.hook("init", function () {
    ms.quest({
      id: "mq29",
      giver: '"Rocky" Delgado',
      location: "Grand Central · St. Patrick's · Tudor City · Radio City",
      desc: () =>
        "The torch is set for noon on Sunday. Back in the city, something has taken over every radio at once." +
        (L.flag("ms_nicole_alive_known")
          ? " And Nicole is alive: Calloway heard her knock this February. Rose told you she was dead."
          : ""),
      stages: [
        {
          id: "return",
          text: "Return to Grand Central.",
          markers: [
            {
              anchor: ["grand_central", ["entrance", "door", "main_entrance"]],
              fallback: { x: 240, z: -185 },
              label: "Grand Central",
            },
          ],
          onEnter() {
            L.hint(
              "ms_liberty_back",
              "Ossie's boat on the Liberty Island dock runs back to the Battery.",
              3,
            );
          },
        },
        {
          id: "broadcast",
          text: "Listen to the broadcast.",
          markers: () => [{ npc: "gc_delphine", label: "Grand Central" }],
        },
        {
          id: "cathedral",
          text: "Go to St. Patrick's. Something has happened at the cathedral.",
          markers: () => [
            { npc: "glow_sister", label: "Sister Noonday" },
            {
              anchor: ["st_patricks", ["steps", "entrance", "door"]],
              fallback: { x: 126, z: -342 },
              label: "St. Patrick's",
            },
          ],
        },
        {
          id: "rose",
          text: "Confront Rose on the Tudor City roof.",
          markers: () => ms.rose.marker("Rose"),
        },
        {
          id: "rocky",
          text: "Tell Rocky what to say to the city.",
          markers: () => [{ npc: "rc_rocky", label: "Rocky Delgado" }],
        },
      ],
      rewards: { xp: 500 },
      onComplete() {
        ms.rose.place("home");
      },
    });
  });

  // ------------------------------------------------------------------
  // The broadcast at Grand Central
  // ------------------------------------------------------------------
  function playBroadcast() {
    if (L.flag("ms_dawn_broadcast_heard")) {
      if (at("mq29", "broadcast") || at("mq29", "return"))
        Q.setStage("mq29", "cathedral");
      return;
    }
    L.setFlag("ms_dawn_broadcast_heard");
    if (!L.has("ms_note_dawn_broadcast"))
      L.give("ms_note_dawn_broadcast", 1, true);
    const t = ms.scene(
      [
        [
          "",
          "Every radio in the concourse cuts out at once: Moe's set behind the bar, the INFO-BOT, the guards' walkie-talkies, Rosa's shortwave. Then one voice, on all of them.",
        ],
        [
          "ALL BANDS",
          "Children of the Second Sun. And all of you who have never knelt: listen.",
        ],
        [
          "ALL BANDS",
          "On Sunday at noon the men with the list will light their torch. Every child born since the Bombing is on it. A clerk will choose.",
        ],
        [
          "ALL BANDS",
          "No list survives a sun. On Sunday, at nine forty-seven, the Second Sun will rise over Grand Central, and nobody will ever be chosen again.",
        ],
        ["ALL BANDS", "If you are afraid, go north today. Take a candle."],
        [
          "ALL BANDS",
          "Sleeper. You have something of mine. Bring it. Come alone. A dimanche.",
          6,
        ],
        [
          "",
          "The carrier drops. Nobody in Grand Central says anything for a long time. Then Stationmaster Okafor starts counting the exits out loud.",
        ],
      ],
      5.2,
    );
    L.later(t, () => {
      if (at("mq29", "broadcast") || at("mq29", "return"))
        Q.setStage("mq29", "cathedral");
      L.xp(40, "The Second Dawn");
    });
    L.news(
      "...Rocky here. That wasn't me. That was every frequency in the city at once, mine included. I've got a lady on the line from the Neon asking if it's a joke. It's not a joke. Folks, there's a bomb under Grand Central, and somebody just set an alarm clock on it.",
    );
  }
  L.trigger({
    id: "ms_mq29_gc",
    once: false,
    cooldown: 2,
    x: GC.x,
    z: GC.z,
    r: 55,
    cond: () => at("mq29", "return"),
    fire() {
      Q.setStage("mq29", "broadcast");
      L.later(2.5, playBroadcast);
    },
  });

  // ------------------------------------------------------------------
  // The empty cathedral: Noonday
  // ------------------------------------------------------------------
  ms.inject("dlg_glow_sister", {
    start: () => (at("mq29", "cathedral") ? "mq29_empty" : null),
    nodes: {
      mq29_empty: {
        speaker: "Sister Noonday",
        text: "[The cathedral is empty. The pews are full of candles, all lit, all alone. Sister Noonday sits in the front pew with her hands in her lap.] They went down last night. All of them, the whole congregation, down the tunnels to her. The Keeper stayed. I stayed. Somebody has to keep the light on up here too.",
        responses: [
          { text: "Who is she, Sister? The Dawn.", next: "mq29_who" },
        ],
      },
      mq29_who: {
        text: () =>
          "[She looks at you for a long moment.] She was a mother once. That's all I'll say." +
          (L.flag("ms_eli_replied")
            ? " [A pause.] She played your voice twice. The message you put into the relay. Twice, at five forty-seven, with nobody listening but her. Then she switched it off and went to bed."
            : ""),
        responses: [
          { text: "Is she going to do it? The bomb?", next: "mq29_bomb" },
        ],
      },
      mq29_bomb: {
        text: "She has never once said a thing she didn't do. [She stands.] Go and see your girl, sleeper. The Little Sun. She'll be on her roof with that rifle, and she's angrier than any of us.",
        onEnter() {
          L.setFlag("ms_noonday_mq29");
          if (at("mq29", "cathedral")) Q.setStage("mq29", "rose");
        },
        responses: [{ text: "...Little Sun?" }],
      },
    },
  });
  // No Noonday (dead / missing module): the empty cathedral itself tells the story.
  L.trigger({
    id: "ms_mq29_cathedral",
    once: false,
    cooldown: 3,
    x: 140,
    z: -342,
    r: 30,
    cond: () =>
      at("mq29", "cathedral") &&
      (!L.npc("glow_sister") || L.flag("dead_glow_sister")),
    fire() {
      L.notify(
        "St. Patrick's is empty. Every pew is full of candles, all lit, all alone. The congregation went down into the tunnels in the night.",
        { duration: 7 },
      );
      Q.setStage("mq29", "rose");
    },
  });

  // ------------------------------------------------------------------
  // The roof: LIE 2
  // ------------------------------------------------------------------
  const RD = ms.dlg("dlg_ms_rose");
  RD.when(() => (at("mq29", "rose") ? "mq29_roof" : null));
  RD.add({
    mq29_roof: {
      speaker: "Rose",
      text: () =>
        ms.trust() === 0
          ? "[Rose doesn't turn round. She is sitting on the edge of the gantry under the dark TUDOR CITY sign, rifle across her knees.] You loaded their list. With my name on it. And now you want to talk."
          : "[Rose is sitting on the edge of the gantry under the TUDOR CITY sign, rifle across her knees, watching the smoke over Grand Central. She doesn't turn round.] You heard her. Everybody heard her.",
      responses: [
        {
          text: "Calloway heard your mother knock on my door this February. Zeke says nobody was ever buried under that stone. You lied to me, Rose.",
          next: "mq29_lie",
        },
      ],
    },
    mq29_lie: {
      text: "[A long breath.] Fine. [She turns round at last.] Fine. She's alive. She went down with the sun people when I was a baby and she never came back up. She chose them, over me, every day for sixteen years. So I left. And she let me go. ...She's alive. Leave her. I mean it. Leave her down there.",
      onEnter() {
        L.setFlag("ms_rose_lie2");
      },
      responses: [
        { text: "Why did you tell me she was dead?", next: "mq29_why" },
      ],
    },
    mq29_why: {
      text: "Because you'd have gone looking for her, instead of the bomb. You still might. [She stands up.] Listen to me. The Dawn is going to do it. Sunday, nine forty-seven. I'm going to kill her before she does. That's the whole plan. And the door down there opens for the sleeper — she's always said so, the sleeper gets in. So you're my way in.",
      responses: [
        {
          text: "I forgive you. For the lie. We go in together.",
          action: () => {
            ms.addTrust(1, "You forgave her lie");
            L.setFlag("ms_rose_forgiven");
          },
          next: "mq29_forgive",
        },
        {
          text: "Promise me: nobody dies down there unless we have to.",
          action: () => {
            ms.set("rose_promise");
          },
          next: "mq29_promise",
        },
        {
          text: "You lied to my face over her grave. Get someone else to open your door.",
          action: () => {
            ms.addTrust(-1, "You turned on her");
            L.setFlag("ms_rose_angered");
          },
          next: "mq29_anger",
        },
      ],
    },
    mq29_forgive: {
      text: "...Okay. [She looks away, fast.] Okay. Don't make it a thing.",
      onEnter() {
        mq29RoseDone();
      },
      responses: [{ text: "It's not a thing." }],
    },
    mq29_promise: {
      text: "[She thinks about it for a long time, which is how you know she means it.] Unless we have to. ...Fine. Promise. I don't break those. Ask anybody I ever made one to. There's four of them.",
      onEnter() {
        mq29RoseDone();
      },
      responses: [{ text: "Five, now." }],
    },
    mq29_anger: {
      text: "Fine. [She slings the rifle.] I know another way in. I always know another way in. [She walks to the stair without looking back, the way somebody else used to leave goodbyes.]",
      onEnter() {
        mq29RoseDone();
      },
      responses: [{ text: "[Let her go.]" }],
    },
  });
  function mq29RoseDone() {
    if (at("mq29", "rose")) Q.setStage("mq29", "rocky");
  }

  // ------------------------------------------------------------------
  // Rocky: what to tell the city
  // ------------------------------------------------------------------
  ms.inject("dlg_rc_rocky", {
    start: () => (at("mq29", "rocky") ? "mq29_rocky" : null),
    nodes: {
      mq29_rocky: {
        speaker: '"Rocky" Delgado',
        text: "Popsicle. [Rocky looks like he hasn't slept.] I've got the whole city calling in. Well — shouting at the building. The Neon wants to know if they should run. Grand Central wants to know if they should run. My mother wants to know if she should run, and she's been dead since '74. What do I tell them? You tell me, and I'll put it on the air.",
        responses: [
          {
            text: "Tell them to get out. North, upriver, anywhere. Call an evacuation.",
            action: () => {
              ms.set("evacuation_called");
            },
            next: "mq29_evac",
          },
          {
            text: "Tell them the truth, and tell them somebody's going down to stop it.",
            next: "mq29_truth",
          },
          {
            text: "Tell them to stay calm. Panic will kill more people than any bomb.",
            next: "mq29_calm",
          },
        ],
      },
      mq29_evac: {
        text: "Evacuation. [He nods slowly.] Half of them will go and half of them won't, and I'll lose my whole audience. ...Worth it. ROCKETTE! Get me the good microphone.",
        onEnter() {
          mq29Done("evac");
        },
        responses: [{ text: "Thanks, Rocky." }],
      },
      mq29_truth: {
        text: () =>
          "The truth. That's a new one for radio. [He almost laughs.] \"There's a bomb, and " +
          first() +
          " is going down to stop it.\" You know what? That's the best news I've read in twenty-two years.",
        onEnter() {
          mq29Done("truth");
        },
        responses: [{ text: "Thanks, Rocky." }],
      },
      mq29_calm: {
        text: "Stay calm. Sure. I'll play the slow one. [He doesn't look convinced.] Pal, if you're going down there, go soon.",
        onEnter() {
          mq29Done("calm");
        },
        responses: [{ text: "Thanks, Rocky." }],
      },
    },
  });
  function mq29Done(how) {
    L.setFlag("ms_rocky_told", how);
    if (how === "evac")
      L.news(
        "This is Radio Free Manhattan. This is not a drill and it's not a joke. If you live within forty blocks of Grand Central, get out. Go north, go upriver, go to your cousin in Yonkers you never liked. Take water. Take your kids. Take a candle if it makes you feel better. Go today.",
      );
    else if (how === "truth")
      L.news(
        "Folks, here it is straight. There's a bomb under Grand Central, the sun people mean to light it Sunday morning, and the sleeper from Chambers Street is going down there to stop them. That's it. That's the news. Say a prayer, or don't, but keep your radio on.",
      );
    else
      L.news(
        "Stay calm, New Rad City. Nobody's served by a stampede. Here's the slow one. Keep your lights on.",
      );
    if (at("mq29", "rocky")) Q.complete("mq29");
  }

  // ------------------------------------------------------------------
  // Test solver
  // ------------------------------------------------------------------
  ms.solver("mq29", {
    return() {
      Q.setStage("mq29", "broadcast");
    },
    broadcast() {
      L.setFlag("ms_dawn_broadcast_heard");
      L.give("ms_note_dawn_broadcast", 1, true);
      Q.setStage("mq29", "cathedral");
    },
    cathedral() {
      L.setFlag("ms_noonday_mq29");
      Q.setStage("mq29", "rose");
    },
    rose() {
      L.setFlag("ms_rose_lie2");
      ms.addTrust(1, "test");
      L.setFlag("ms_rose_forgiven");
      mq29RoseDone();
    },
    rocky() {
      mq29Done("truth");
    },
  });
})();
