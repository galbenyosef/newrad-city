/* src/lair/50_finale.js */
/* =====================================================================
 * NEW RAD CITY — lair / 50_finale.js
 * mq36 "The Second Sun" — the finale (story/outline.json → finale).
 *
 * Stages: enter (open the M42 door) → face (the recognition, the Reckoning,
 * Rose's moment at 09:40, the choice at 09:41) → one of
 *   stop  (Ending A: Nicole is dead; fight Tinder and the zealots; disarm
 *          the Second Sun before 09:47 — soft timer, never a fail state)
 *   keys  (Ending C: turn the second key on her count)
 *   (Ending B plays straight from the choice: they wall it in together)
 * → ending (the epilogue slides; the quest completes when the player is back
 *   in the world; free roam continues after every ending).
 *
 * Variants (outline finale.endingVariants): A1 Eli's shot, A2 Rose's shot,
 * A3 Rose came alone and Eli fails Firearms 50 to cover her; B1 trust >= 4 (or
 * the promise + the ring on Rose's hand), B2 trust 3, B3 Eli shielded Nicole
 * (or Rose was talked down without being reconciled); C1 Rose sent north on
 * the handcar, C2 she stays.
 *
 * State: K.state.fin (save block 'lair') + result flags ms_ending,
 * ms_ending_variant, ms_nicole_dead, ms_rose_dead, ms_second_sun, ms_glowkeepers,
 * ms_disarm_method, ms_eli_wounded, ms_fin_violence. Text only: no voice.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G,
    THREE = window.THREE;
  const K = G.lair && G.lair._;
  if (!K) return;
  const HP = K.HP,
    PI = K.PI;
  const LR = G.lair;

  const QID = "mq36";
  const Q = () => K.Q();
  const L = () => K.L();
  K.fin = () => {
    if (!K.state.fin) K.state.fin = { phase: "pre" };
    return K.state.fin;
  };
  const F = () => K.fin();
  const stage = () => (Q() ? Q().stage(QID) : null);
  const active = () => !!(Q() && Q().isActive(QID));
  const first = () => K.heroFirst();
  const anchor = (n) => K.anchors[n];
  const inSun = () => K.cellAt(G.player && G.player.pos) === "lair_m42";
  const skill = (id) => {
    if (K.testSkills && K.testSkills[id] !== undefined) return K.testSkills[id];
    const l = L();
    return l ? l.skill(id) : 0;
  };
  const attr = (id) => {
    if (K.testSkills && K.testSkills[id] !== undefined) return K.testSkills[id];
    const l = L();
    return l ? l.attr(id) : 5;
  };
  const later = (s, fn) => {
    if (K.testMode) {
      K.safe("later", fn);
      return;
    }
    const l = L();
    if (l) l.later(s, fn, "lair_fin");
    else fn();
  };

  // ------------------------------------------------------------------
  // The clock (09:31 → 09:47). Scene beats set it; Ending A lets it run.
  // ------------------------------------------------------------------
  K.onClock = (min) => {
    if (K.sun && K.sun.clock) K.sun.clock.set(min);
    F().clock = min;
  };
  function clockTo(min) {
    if (!K.clock.shown() && inSun()) K.clock.show(min);
    else K.clock.set(min);
  }

  // ------------------------------------------------------------------
  // Decisions the Reckoning can be won with
  // ------------------------------------------------------------------
  const I = () => K.in();
  const persuasionNeed = (base) => Math.max(20, base - 5 * K.tokenBonus());
  const presenceNeed = (base) => Math.max(3, base - K.tokenBonus());
  const roseState = () => I().roseState;
  const rosePresent = () =>
    K.alive("rose") &&
    !F().roseGone &&
    (roseState() !== "alone" || !!F().roseArrived);
  const selective = () => I().torch === "selective";
  /** Rose can be talked down: trust >= 3, Presence 8, or Presence 6 with her promise. */
  function talkDownHow() {
    const i = I();
    if (i.roseTrust >= 3) return "trust";
    if (attr("presence") >= presenceNeed(8)) return "presence";
    if (i.rosePromise && attr("presence") >= presenceNeed(6)) return "promise";
    return null;
  }
  const allWon = () =>
    F().guilt === true && F().list === true && F().roseArg === true;
  const bPossible = () =>
    !selective() &&
    allWon() &&
    !F().violence &&
    (F().roseStood === "talk" || F().roseStood === "shield" || !rosePresent());
  /** The second key: Key B (kept) or Tinder's drilled keyway (Tinder alive to finish it, on her order). */
  const cPossible = () => I().keyB !== "destroyed" || K.alive("tinder");
  K.finale = { bPossible, cPossible, talkDownHow, allWon };

  // ------------------------------------------------------------------
  // Flavour: one memory line per token beyond the first
  // ------------------------------------------------------------------
  const TOKEN_LINES = {
    ring: "[Your grandmother's ring. You bought it back with the Long Winter bonus, to give her on thaw day.]",
    record:
      "[On its crate the record reaches the bridge, and she mouths the extra verse, the one she wrote herself, without seeming to know she is doing it.]",
    booth:
      "Booth Four. [She looks at your hands.] You went and sat in my chair, didn't you.",
    rose_page:
      "[In your coat, the certified page from Wren's Register: ROSE. Born at dawn, Track 61. Father: E. W., asleep.]",
    pass: "[Her old pass is in your pocket, the one from the lining of Ruby's green coat: N. MEAD, INTERPRETER, and her face at twenty-eight.]",
    nell: "You found Nell's tapes. [A breath.] Nell always did talk too much. No. Don't tell me where she is.",
    voice:
      '[She says "sleeper" the way the Dawn Hour says it, and you hear now that it was always your name.]',
    poster:
      "[You think of the poster from the crossing, folded in your coat: her younger face, printed over a sun.]",
  };
  function tokenLine(slot) {
    const t = I().tokens.slice(1);
    const k = t[slot];
    return k && TOKEN_LINES[k] ? "\n\n" + TOKEN_LINES[k] : "";
  }

  // ==================================================================
  // THE QUEST
  // ==================================================================
  function defineQuest() {
    const def = {
      id: QID,
      name: "The Second Sun",
      giver: "Sunday, 09:30",
      location: "The M42 substation under Grand Central",
      desc: () =>
        F().ending
          ? "It is over. " + endingSummary()
          : "The M42 substation, the old secret power basement ten storeys under Grand Central, is the Glowkeepers' Sun Room. The Second Sun is set to rise at 09:47. Somebody has to keep the light on.",
      stages: [
        {
          id: "enter",
          text: "Open the M42 door.",
          markers: () => mk("m42_door_face", "The M42 Door"),
          onEnter() {
            later(1.0, () =>
              K.notify("09:30. Behind the M42 door a record is playing.", {
                duration: 5,
              }),
            );
          },
        },
        {
          id: "face",
          text: () => (F().phase === "pre" ? "Face Sister Dawn." : "Nicole."),
          markers: () => [
            {
              npc: "lair_nicole",
              label: F().phase === "pre" ? "Sister Dawn" : "Nicole",
            },
          ],
        },
        {
          id: "stop",
          text: () =>
            "Stop the Second Sun before 09:47." +
            (F().clock
              ? " (09:" + String(F().clock).padStart(2, "0") + ")"
              : ""),
          markers: () =>
            mk("firing_set", "Firing Set").concat(
              mk("breaker", "M42 Main Breaker"),
            ),
        },
        {
          id: "keys",
          text: "Turn the second key on her count.",
          markers: () => mk("plate", "The Keyways"),
        },
        { id: "ending", text: "The Second Sun." },
        {
          id: "fight",
          text: "(Optional) Deal with Brother Tinder and the zealots.",
          sideObjective: true,
          optional: true,
          showIf: () => stage() === "stop",
          doneIf: () => !hostilesLeft(),
        },
      ],
      rewards: { xp: 2000 },
      onComplete() {
        G.events.emit("lairFinaleComplete", F().variant);
      },
    };
    const ms = K.msLib();
    if (ms && ms.quest) ms.quest(def);
    else {
      def.main = true;
      def.category = "main";
      def.act = 5;
      def.order = 36;
      def.actLabel = "Act V: The Second Sun";
      G.quests.define(def);
    }
  }
  function mk(name, label) {
    const a = anchor(name);
    return a ? [{ x: a.x, z: a.z, y: a.y, label, interior: true }] : [];
  }
  function setStage(s) {
    if (!Q()) return;
    if (!Q().isStarted(QID)) Q().start(QID, { stage: s });
    else Q().setStage(QID, s);
  }

  // ==================================================================
  // ENTERING THE SUN ROOM → the recognition
  // ==================================================================
  K.onEnterSunRoom = function () {
    K.sunDress();
    if (Q() && !Q().isStarted(QID) && K.m42Open()) Q().start(QID);
    if (!active()) {
      if (F().ending) K.spawnSunCast();
      return;
    }
    K.releaseStoryRose();
    K.spawnSunCast();
    if (stage() === "enter" || F().phase === "pre") later(0.7, recognition);
    else {
      clockTo(F().clock || 32);
      later(1.2, resumeTalk);
    }
  };
  K.finaleLocksDoor = function () {
    if (!active()) return null;
    const s = stage();
    if (s === "face" || s === "keys")
      return "Not now. Not with her standing there.";
    return null;
  };

  function freeze(v) {
    if (G.player) G.player.frozen = !!v;
    F()._frozen = !!v;
  }
  function lookAt(x, z, y) {
    const P = G.player;
    if (!P) return;
    const dx = x - P.pos.x,
      dz = z - P.pos.z;
    P.yaw = Math.atan2(-dx, -dz);
    P.pitch = Math.atan2((y || 1.4) - (P.pos.y + 1.6), Math.hypot(dx, dz));
  }
  function musterLine() {
    const NAMES = {
      lancers: "the Lancers",
      hale: "Hale's defectors",
      keel: "Major Keel",
      kong: "KONG's Brutes",
      neon: "Kincaid's Neon Guard",
      gc_guards: "the Grand Central guards",
      lys: "Mademoiselle Lys",
      zeke: "Zeke",
      calloway: "Dr. Calloway",
    };
    const m = I()
      .musters.map((id) => NAMES[id])
      .filter(Boolean);
    return m.length
      ? "Behind you, " +
          m.join(", ") +
          " put their backs to the M42 door. Allies hold it. Whatever happens in here is yours."
      : "The M42 door groans shut behind you. Nobody is holding it. Whatever happens in here is yours.";
  }
  function recognition() {
    const f = F();
    if (f.phase !== "pre" || !active()) return;
    f.phase = "cards";
    setStage("face");
    clockTo(31);
    K.setFlag("ms_fin_started", true);
    G.events.emit("lairRecognition");
    const n = K.npc("lair_nicole");
    const np = n ? n.pos : anchor("nicole");
    // pan to her back while the room settles
    const P = G.player,
      y0 = P.yaw,
      p0 = P.pitch;
    const dx = np.x - P.pos.x,
      dz = np.z - P.pos.z,
      y1 = Math.atan2(-dx, -dz),
      p1 = -0.08;
    const lib = L();
    const cards = () => {
      freeze(true);
      const st = roseState();
      const roseCard =
        st === "with_eli"
          ? "Rose is beside you. Her rifle is up, and it isn't pointed at anything yet."
          : st === "captive"
            ? "By the cradle, Rose sits on the floor with her wrists bound, her rifle gone. She doesn't look at you."
            : null;
      const list = [
        musterLine(),
        'The Sun Room. Nine dead machines stand in a ring like black standing stones. In the middle, on a railway flatcar, the Second Sun: a pale casing stencilled SIROCCO 2. A dosimeter clicks. A record turns "Two Bits and a Kiss". The clock from the information booth hangs on a converter and says 09:31.',
        roseCard,
        I().hollowell === "ally" && K.alive("hollowell")
          ? "Keeper Hollowell comes in behind you and stops. His hands are shaking."
          : null,
        "The Glowkeepers kneel. A woman in grey robes, her back to you, is lighting a candle by a small wooden cradle. On the card table beside her lies a gilt mask with twelve rays.",
        "She shakes the match out, with a flick of the wrist you have seen exactly once before, by candlelight, in the dark concourse in November 1965. And she turns.",
        {
          text: "Grey through the dark hair. A burn scar from the left jaw down the neck. Older, thinner: fifty. The gap in her front teeth. And the eyes. Nobody else in the world.",
          onShow: () => turnNicole(),
        },
        { who: first(), text: '"Nicky."' },
        "The Glowkeepers look up. Nobody has ever heard the Dawn called by a name.",
      ];
      K.cards(list, () => {
        freeze(false);
        const a = K.npc("lair_nicole");
        if (a) a.name = "Nicole";
        f.phase = "hello";
        clockTo(32);
        later(0.2, startTalk);
      });
    };
    if (lib && lib.cinematic && !G.SMOKE)
      lib.cinematic(
        2.4,
        (e) => {
          P.yaw = y0 + G.util.wrapAngle(y1 - y0) * e;
          P.pitch = p0 + (p1 - p0) * e;
        },
        cards,
      );
    else {
      P.yaw = y1;
      cards();
    }
  }
  function turnNicole() {
    const a = K.npc("lair_nicole");
    if (!a) return;
    a.name = "Nicole";
    K.face("lair_nicole", G.player.pos.x, G.player.pos.z);
  }
  function startTalk() {
    if (K.testMode) return;
    const a = K.npc("lair_nicole");
    if (!K.live("dialogue")) return;
    K.safe("dlg.start", () =>
      G.dialogue.start("lair_dlg_dawn", a || null, { name: "Nicole" }),
    );
  }
  function resumeTalk() {
    if (
      !active() ||
      stage() !== "face" ||
      !inSun() ||
      F().phase === "pre" ||
      F().phase === "cards"
    )
      return;
    if (G.state === "play" && !(K.live("dialogue") && G.dialogue.isActive()))
      startTalk();
  }

  // ==================================================================
  // THE CONVERSATION (Nicole) — recognition, Reckoning, Rose's moment, the choice
  // ==================================================================
  const nicole = () => "Nicole";
  const phaseNode = () => {
    const f = F();
    if (f.ending === "B") return "after_b";
    if (f.ending) return "idle";
    switch (f.phase) {
      case "hello":
        return "hello";
      case "story":
        return "story1";
      case "guilt":
        return "guilt";
      case "list":
        return "list";
      case "rose":
        return roseState() === "alone" && !f.roseArrived && K.alive("rose")
          ? "rose_arrives"
          : "moment";
      case "rose_arg":
        return "rose_arg";
      case "final":
      case "c":
        return "final";
      default:
        return "idle";
    }
  };
  function setPhase(p, min) {
    F().phase = p;
    if (min) clockTo(min);
  }
  const ringToRose = () => I().ring === "rose";

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
  K.fin_ = {
    endA,
    endB,
    endC,
    roseFires,
    shield,
    disarm,
    recognition,
    setPhase,
    playEnding,
    settle,
    startFight,
    roseArrives,
    DAWN,
    FIRING,
    ROSE_DLG,
  };
})();
