// play-inline-591 04 — next
// Lines 413-898 of readable/play-inline-591.pretty.js (statement-aligned).
  const DAWN = {
    start: () => phaseNode(),
    nodes: {
      idle: {
        speaker: nicole,
        text: () =>
          F().ending
            ? "[She is very still.]"
            : "[She waits. She has been waiting a long time.]",
        responses: [{ text: "[Step back.]", end: true }],
      },
      hello: {
        speaker: nicole,
        text: () => {
          const i = I();
          let t = '"Ninety days," you said. [A beat.] You\'re late, sleeper.';
          if (i.ring === "stone")
            t +=
              "\n\n[On the chain round her neck, beside a brass key, hangs your grandmother's ring: the one you left on her stone.]";
          if (i.notice === "sundays")
            t +=
              "\n\nWhispering Gallery, Sundays. I went. Every Sunday for a year.";
          if (i.eliReplied)
            t +=
              "\n\nI heard you on the Dawn Hour. Your voice, on Rocky's air. I nearly answered.";
          return t + tokenLine(0);
        },
        onEnter() {
          setPhase("hello", 32);
        },
        responses: [
          {
            text: () => "[Turn to Rose.] You knew.",
            cond: () => rosePresent(),
            next: "rose_knew",
          },
          {
            text: "Nicky. I came as soon as I woke up.",
            cond: () => !rosePresent(),
            next: "story1",
          },
          {
            text: "[Say nothing. Look at her.]",
            cond: () => !rosePresent(),
            next: "story1",
          },
        ],
      },
      rose_knew: {
        speaker: "Rose",
        text: () =>
          roseState() === "captive"
            ? "[From the floor by the cradle, without looking up.] I knew you'd never come down here if you knew."
            : "I knew you'd never come down here if you knew.",
        responses: [{ text: "...", next: "hello_rose" }],
      },
      hello_rose: {
        speaker: nicole,
        text: () =>
          "Hello, Rose." +
          (ringToRose()
            ? "\n\n[Her eyes go to Rose's hand. Your grandmother's ring is on it. Nicole sits down on the chair by the cradle as if somebody has cut a string.]"
            : ""),
        responses: [{ text: "Tell me. All of it.", next: "story1" }],
      },
      story1: {
        speaker: nicole,
        text: () =>
          "The UN called us in at dawn that Sunday. I was in Booth Four when the liaison walked out at half past eight, like a man who knew the time. At nine forty-seven I was in the Secretariat basement. That afternoon I walked to Grand Central and went down, as deep as the trains go, because you'd told me once how deep they were.\n\nI found out on the Saturday before. Dr. Weiss. I was going to tell you in May." +
          tokenLine(1),
        onEnter() {
          setPhase("story", 34);
        },
        responses: [{ text: "Go on.", next: "story2" }],
      },
      story2: {
        speaker: nicole,
        text: () =>
          "She was born on Track 61, at dawn, in November. In February she had a fever. The Relief Station had penicillin, for cards. Enrolled. I was Canadian. She was mine. On their list she didn't exist.\n\nI knocked on your door under the Municipal Building on the twentieth. Nobody opened. On the fifth of March I struck a match in their ration store and took the penicillin while it burned. Eleven children died in that fire. They put my name under a stone. I knocked on your door every February anyway.\n\nThen the list came back. Seven-A has her name on it, " +
          first() +
          ". Every child born since. A list will choose again. Not while I'm alive. [Almost a smile.] And I'm not alive much longer.",
        responses: [{ text: "Nicky. Listen to me.", next: "guilt" }],
      },
      // ---------------- GUILT ----------------
      guilt: {
        speaker: nicole,
        text: () =>
          "I struck the match. Eleven children. [She says it the way other people say grace.]" +
          tokenLine(2),
        onEnter() {
          setPhase("guilt", 36);
        },
        responses: () => [
          {
            text: "The store was padlocked from outside, on Crane's order. The match didn't kill them. The lock did.",
            cond: () => !!I().lockTruth,
            next: "guilt_won",
            action: () => {
              F().guiltHow = "lock";
            },
          },
          {
            text: "Keel wrote it down. [Read out Major Keel's confession: the padlock, the order, the key in Captain Crane's pocket.]",
            cond: () => I().keel === "defects",
            next: "guilt_won",
            action: () => {
              F().guiltHow = "keel";
            },
          },
          {
            text: "You were a mother with a dying child in your arms, and they gave you no third choice. That's the sin, Nicky. Not yours.",
            check: { skill: "persuasion", value: persuasionNeed(85) },
            next: "guilt_won",
            failNext: "guilt_lost",
            action: () => {
              F().guiltHow = "persuasion";
            },
          },
          { text: "[Say nothing.]", next: "guilt_lost" },
        ],
      },
      guilt_won: {
        speaker: nicole,
        text: () =>
          F().guiltHow === "persuasion"
            ? "[For a long time she doesn't answer. Then, very quietly:] Nobody has ever said that to me. Not once in twenty-one years."
            : "[For a long moment she doesn't breathe.] Padlocked. [She looks at the cradle.] I carried them. Twenty-one years I carried them down here, one candle each. And the door was locked from outside.",
        onEnter() {
          F().guilt = true;
        },
        responses: [{ text: "...", next: "list" }],
      },
      guilt_lost: {
        speaker: nicole,
        text: () =>
          "[She shakes her head, gently, the way you would correct a child.] I was there, " +
          first() +
          ". You were asleep.",
        onEnter() {
          F().guilt = false;
        },
        responses: [{ text: "...", next: "list" }],
      },
      // ---------------- THE LIST ----------------
      list: {
        speaker: nicole,
        text: () =>
          (selective()
            ? "At noon your machine will sterilise our daughter. You loaded the list yourself. Seven-A, in your hand, on the torch. [Not angry. Tired.] I'm sparing her the list."
            : "Every tribe keeps a list. The Continuity has one. The Covenant has one. The Relief Station had one, on a clipboard. A list will choose again. Only the Sun doesn't choose.") +
          tokenLine(3),
        onEnter() {
          setPhase("list", 38);
          if (selective()) F().list = false;
        },
        responses: () =>
          selective()
            ? [{ text: "...", next: "after_list" }]
            : [
                {
                  text: "The men with the list chose it over the whole city, a day early. Marsh signed it on the fourth of March. That's on them, not on you.",
                  cond: () => !!I().attributionRead,
                  next: "list_won",
                },
                {
                  text: "There is no list any more. I burned the rolls myself.",
                  cond: () => I().microfilm === "burned",
                  next: "list_won",
                },
                {
                  text: "The rolls are sealed in the Covenant's mountain. Nobody will ever read them out again.",
                  cond: () => I().microfilm === "covenant",
                  next: "list_won",
                },
                {
                  text: "Your own Keeper preaches a Light that asks, now. Hollowell came round. He'd want you to.",
                  cond: () => I().glow === "convinced",
                  next: "list_won",
                },
                {
                  text: "At noon the Long Noon ends. I set the torch to clean the sky. Come up and see it.",
                  cond: () => I().torch === "reclamation",
                  next: "list_won",
                },
                {
                  text: "Then don't be one. A bomb is just a list with one line on it: everybody.",
                  check: { skill: "persuasion", value: persuasionNeed(75) },
                  next: "list_won",
                  failNext: "list_lost",
                },
                { text: "[Say nothing.]", next: "list_lost" },
              ],
      },
      list_won: {
        speaker: nicole,
        text: "[She looks up at the painted sun for a long moment.] ...Then what is it for. All of it.",
        onEnter() {
          F().list = true;
        },
        responses: [{ text: "...", next: "after_list" }],
      },
      list_lost: {
        speaker: nicole,
        text: "You've been awake three weeks. I've been awake twenty-two years.",
        onEnter() {
          F().list = false;
        },
        responses: [{ text: "...", next: "after_list" }],
      },
      after_list: {
        speaker: nicole,
        text: "[The record ends. The needle hisses in the run-out groove. Nobody moves to lift it.]",
        onEnter() {
          setPhase("rose", 39);
        },
        responses: () => [
          {
            text: "...",
            next:
              roseState() === "alone" && !F().roseArrived && K.alive("rose")
                ? "rose_arrives"
                : "moment",
          },
        ],
      },
      // ---------------- ROSE ----------------
      rose_arrives: {
        speaker: " ",
        text: "[Somewhere east, iron squeals on iron. A handcar rolls out of the spur tunnel on its own momentum, and Rose drops off it before it stops, rifle already up. Two of the zealots come to their feet with pistols.]",
        onEnter() {
          roseArrives();
        },
        responses: [{ text: "Rose!", next: "moment" }],
      },
      moment: {
        speaker: () => (roseState() === "captive" ? " " : "Rose"),
        text: () => {
          const st = roseState();
          const head =
            st === "captive"
              ? "[09:40. By the cradle Rose has worked one hand free of the cord. She snatches the pistol from the zealot beside her and is on her feet, the muzzle on her mother's chest, before anybody can move.]"
              : st === "with_eli"
                ? "[09:40. Beside you, Rose's rifle comes up, slowly, until it is on her mother's heart. Her hands are perfectly steady.] Step away from her, Dad."
                : "[09:40. Rose has walked to within five metres of her mother. The rifle is on Nicole's heart. Two of the zealots have their pistols on Rose.] Nobody move. Dad, step away from her.";
          return (
            head +
            "\n\n[Nicole doesn't move. She doesn't look at the gun. She looks at you.]"
          );
        },
        onEnter() {
          setPhase("rose", 40);
          roseRaises();
        },
        responses: () => {
          const how = talkDownHow();
          const tag =
            how === "trust"
              ? ""
              : how === "presence"
                ? "[Presence " + presenceNeed(8) + "] "
                : how === "promise"
                  ? "[Presence " + presenceNeed(6) + ", her promise] "
                  : "";
          return [
            { text: "[Let her.]", end: true, action: () => roseFires() },
            {
              text: "[Draw and shoot Nicole yourself.]",
              end: true,
              action: () => endA("A1"),
            },
            {
              text: tag + "Rose. Put it down.",
              cond: () => !!how,
              next: "rose_down",
              action: () => {
                F().roseStood = "talk";
                F().talkHow = how;
              },
            },
            { text: "Rose. Put it down.", cond: () => !how, next: "rose_wont" },
          ];
        },
      },
      rose_wont: {
        speaker: "Rose",
        text: "No. Not this time. Not for her. You don't know what she is. [Her finger is on the trigger.]",
        responses: [
          {
            text: "[Step in front of Nicole.]",
            next: "shielded",
            action: () => shield(),
          },
          { text: "[Let her.]", end: true, action: () => roseFires() },
        ],
      },
      shielded: {
        speaker: " ",
        text: "[You step into the line. The shot comes before she can stop her finger: the round takes you high in the shoulder and spins you into the flatcar. Two of the zealots are on Rose before the echo has stopped; her rifle skids away across the floor.]\n\nRose, pinned, white: You stupid... you stupid old man.",
        responses: [{ text: "[Get up.]", next: "rose_arg" }],
      },
      rose_down: {
        speaker: "Rose",
        text: () => {
          if (I().roseTrust < 3)
            return "[A long second. Then the muzzle drops, an inch, two, to the floor. She doesn't say anything. She doesn't look at either of you.]";
          let t =
            "[The muzzle drops.] Mom. [Her voice cracks on it, the first time in years.] Mom. Stop. I'm here.";
          if (ringToRose())
            t +=
              "\n\n[She holds up her hand: your grandmother's ring.] He brought this for you. I've been wearing it.";
          if (I().roseHasPhoto)
            t +=
              "\n\n[She takes the photo strip out of her jacket: two kids in a booth, New Year's 1967.] I looked at this every night when I was little. I never knew which one of you I was angry at.";
          return t;
        },
        onEnter() {
          roseLowers();
          if (I().roseTrust >= 3) {
            F().roseArg = true;
            F().roseArgHow = "rose";
          }
        },
        responses: () => [
          {
            text: "...",
            next: I().roseTrust >= 3 ? "rose_answer" : "rose_arg",
          },
        ],
      },
      rose_answer: {
        speaker: nicole,
        text: "[Nicole puts out her burned hand, and stops it a few inches from her daughter's face, and doesn't dare.] ...Little Sun.",
        responses: [{ text: "...", next: "final" }],
      },
      rose_arg: {
        speaker: nicole,
        text: "I lost her the day I chose her. [She isn't talking to you.]",
        onEnter() {
          setPhase("rose_arg", 41);
        },
        responses: () => [
          {
            text: "[Give her the page from Wren's Register.] ROSE. Born at dawn, Track 61. Father: E. W., asleep. You didn't lose her, Nicky. She's in a book that isn't a list.",
            cond: () => K.hasToken("rose_page"),
            check: { attr: "presence", value: presenceNeed(7) },
            next: "rose_arg_won",
            failNext: "rose_arg_lost",
          },
          { text: "[Say nothing.]", next: "rose_arg_lost" },
        ],
      },
      rose_arg_won: {
        speaker: nicole,
        text: '[She reads it twice. Her thumb finds the word "asleep" and stays there.] Wren wrote that. Tobias Wren, in his good ink. [To Rose, very quietly:] He wrote you down.',
        onEnter() {
          F().roseArg = true;
          F().roseArgHow = "page";
        },
        responses: [{ text: "...", next: "final" }],
      },
      rose_arg_lost: {
        speaker: nicole,
        text: "[Rose won't look at her. Nicole nods, as if that were an answer.]",
        onEnter() {
          F().roseArg = false;
        },
        responses: [{ text: "...", next: "final" }],
      },
      // ---------------- THE CHOICE ----------------
      final: {
        speaker: nicole,
        text: () =>
          (bPossible()
            ? "[She looks at the key on her chain, at the keyways, at you.] Then tell me what to do, " +
              first() +
              ". You always had a plan. Ninety days, and a ring, and two rooms in Flatbush."
            : "It's too late, " +
              first() +
              ". [Gently.] Turn it with me, or stop me.") + tokenLine(4),
        onEnter() {
          setPhase("final", 41);
        },
        responses: () => [
          {
            text: "[Join her.] Come up with me. All of you. We wall it in and walk out, and I'll carry a candle for every one of them.",
            cond: () => bPossible(),
            next: "b_join",
          },
          {
            text: "[Join her.] ...Then we turn them together.",
            cond: () => cPossible(),
            next: () =>
              rosePresent() ? "c_rose" : selective() ? "c_turn" : "c_sure1",
          },
          {
            text: "[Draw and shoot her.]",
            end: true,
            action: () => endA("A1"),
          },
        ],
      },
      b_join: {
        speaker: nicole,
        text: () =>
          "[She laughs. Nobody in the room has ever heard it; the faithful look at each other.] Two rooms in Flatbush. [She lifts the chain over her head and puts Key A in your hand, and takes a grey robe from the chair and holds it out.] Then wear this, so they'll follow you up. They won't follow me any more. They'll follow the sleeper." +
          (I().childrenSent
            ? "\n\nNoonday's children are already upriver. They'll be waiting for us."
            : ""),
        responses: [
          { text: "[Put on the robe.]", end: true, action: () => endB() },
        ],
      },
      c_rose: {
        speaker: nicole,
        text: () =>
          "[09:41.] Send her up the spur, " +
          first() +
          ". The handcar still runs. She can be under the rock at the Harlem portal by nine forty-seven.",
        onEnter() {
          setPhase("c", 41);
        },
        responses: [
          {
            text: "[Put Rose on the handcar.] Go, Rose. Don't look back.",
            next: () => (selective() ? "c_turn" : "c_sure1"),
            action: () => {
              F().cRose = "north";
              roseNorth();
            },
          },
          {
            text: "She stays with us.",
            next: () => (selective() ? "c_turn" : "c_sure1"),
            action: () => {
              F().cRose = "stays";
            },
          },
        ],
      },
      c_sure1: {
        speaker: nicole,
        text: "Are you sure?",
        responses: [
          { text: "Yes.", next: "c_sure2" },
          { text: "No.", next: "final" },
        ],
      },
      c_sure2: {
        speaker: nicole,
        text: () =>
          "[Softer.] Are you sure, " +
          first() +
          "? It isn't a list. It's everybody.",
        responses: [
          { text: "Yes.", next: "c_turn" },
          { text: "No.", next: "final" },
        ],
      },
      c_turn: {
        speaker: nicole,
        text: () =>
          "[09:47. Her hand on Key A, yours on the second." +
          (I().keyB === "destroyed"
            ? " Tinder has finished the drilled keyway, on her order, with his face wet."
            : "") +
          " On her count.]\n\nOne. Two.",
        onEnter() {
          clockTo(47);
        },
        responses: [{ text: "[Turn it.]", end: true, action: () => endC() }],
      },
      // ---------------- AFTER (B) ----------------
      after_b: {
        speaker: nicole,
        text: () =>
          [
            "We leave in April, when the river's down. Bring good boots.",
            "They keep asking me what the Light is now. I tell them to ask you.",
            "[She is sitting by the cradle with a dosimeter in her lap, teaching two of the faithful to read it.]",
          ][Math.floor(Math.random() * 3)],
        responses: [{ text: "[Step back.]", end: true }],
      },
    },
  };

  // Rose's own lines in the Sun Room (before and after)
