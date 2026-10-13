// play-inline-568 08 — responses
// Lines 2171-2505 of readable/play-inline-568.pretty.js (statement-aligned).
  RD.add({
    // ---- mq04 ----
    mq04_side: {
      speaker: "Rose",
      text: "[Rose is cleaning the rifle's scope with the tail of her red neckerchief.] So. Who's taking you across? Stroud has boats and rules. Hale has a Rotorcraft and a list. Ossie has a bucket.",
      onEnter() {
        L.setFlag("ms_mq04_rose_asked");
        refresh("mq04");
      },
      responses: [
        { text: "Who would you trust?", next: "mq04_trust" },
        { text: "What do you know about Lieutenant Hale?", next: "mq04_hale" },
        {
          text: "We go alone. Ossie's bucket.",
          next: "mq04_alone",
          cond: () => !L.flag("mq_faction"),
        },
        { text: "I'll decide." },
      ],
    },
    mq04_trust: {
      speaker: "Rose",
      text: "Not the Continuity. Their list has my name on it, on the empty line. [She doesn't look up.] Stroud I can stand. He tells you to your face he'll take the machine away from you. The Continuity smiles, and files you.",
      responses: [
        { text: "What empty line?", next: "mq04_line" },
        {
          text: "We go alone, then.",
          next: "mq04_alone",
          cond: () => !L.flag("mq_faction"),
        },
        { text: "Understood." },
      ],
    },
    mq04_line: {
      speaker: "Rose",
      text: "Directive 7-A. It leaked last November, through people I don't talk to any more. Everybody not on the 1967 rolls gets sorted onto a schedule. Every kid born since. My line was empty for twenty-one years. [She snaps the lens cap back on.] Now it isn't.",
      responses: [
        { text: "Then we make sure they never run it." },
        { text: "Understood." },
      ],
    },
    mq04_hale: {
      speaker: "Rose",
      text: "Vesper Hale. We grew up a block apart on Tudor Place. She lent me books; I never gave one back. She doesn't know my real name. [A beat.] She believes them. That's the worst thing I can say about her, and it isn't very bad. If anybody over there could be turned, it's her. Play her the right reel.",
      responses: [
        { text: "Who would you trust?", next: "mq04_trust" },
        { text: "Understood." },
      ],
    },
    mq04_alone: {
      speaker: "Rose",
      text: "Then Ossie. He's old, he's cheap, and the shellbacks have eaten four of his boats. Fix his crab problem and he'll take us anywhere. [Almost a smile.] Nobody owns us. I like that.",
      onEnter() {
        if (!L.flag("mq_faction")) L.setFlag("mq_faction", "none");
        if (Q.isActive("mq04")) Q.complete("mq04");
      },
      responses: [{ text: "Nobody owns us." }],
    },
    mq04_con: {
      speaker: "Rose",
      text: "[She doesn't get up.] You signed their paper. [She keeps cleaning the rifle.] Fine. Don't ask me to stand on their helipad, and don't tell me what number they gave you.",
      onEnter() {
        ms.set("mq04_con_seen");
      },
      responses: [
        { text: "Rose...", next: "mq04_con2" },
        { text: "[Leave her be.]" },
      ],
    },
    mq04_con2: {
      speaker: "Rose",
      text: "I know why. You want across, and they've got the fastest boat. [She finally looks at you.] Just remember whose list it is.",
      responses: [{ text: "I will." }],
    },
    // ---- mq19 ----
    mq19_taper: {
      speaker: "Rose",
      text: "[You tell her what the lens showed at two in the morning: the skiff, the candle-lantern, the tall man rowing, the private on the pier.] A tall man in a hood, one lantern in the bow? [She is quiet for a moment.] That's Brother Taper's boat. He used to carry me on his shoulders. [Then, flatter:] And the private is Teague. Gate duty on the pier. He goes to the Dawn Hour on his leave days and thinks nobody notices. The Dawn has a man standing next to that key.",
      onEnter() {
        ms.set("mq19_rose_taper_pending", false);
      },
      responses: [
        {
          text: "What do we do about Teague?",
          next: "mq19_report",
          cond: () => at("mq19", "report"),
        },
        { text: "Understood." },
      ],
    },
    mq19_report: {
      speaker: "Rose",
      text: "You going to tell them about Taper's boat? [She doesn't wait for an answer.] Report it and Teague goes up the pedestal stairs and doesn't come down. Keep it quiet and there's a man on Liberty who opens a gate for anybody who knows the word.",
      onEnter() {
        ms.set("mq19_rose_talked");
      },
      responses: [
        { text: "We keep it quiet.", next: "mq19_quiet" },
        { text: "What's the word?", next: "mq19_word" },
        { text: "I'm going to report it.", next: "mq19_report2" },
      ],
    },
    mq19_word: {
      speaker: "Rose",
      text: 'A dimanche. [She says it like a swear word.] It\'s what they say down there instead of goodbye. "Until Sunday."',
      responses: [
        { text: "We keep it quiet.", next: "mq19_quiet" },
        { text: "I'm going to report it.", next: "mq19_report2" },
      ],
    },
    mq19_quiet: {
      speaker: "Rose",
      text: "Quiet, then. [She taps her temple.] Teague keeps his gate. We keep the word.",
      onEnter() {
        teagueKept();
      },
      responses: [{ text: "We keep the word." }],
    },
    mq19_report2: {
      speaker: "Rose",
      text: "Your call. It always is, with you. [She shrugs.] Hale, or Stroud, or Rocky's microphone. Any of them will do it.",
      responses: [{ text: "Understood." }],
    },
    // ---- mq20 ----
    mq20_list: {
      speaker: "Rose",
      text: () =>
        "[You hold out Static's transcript. Rose takes it without a word. Her eyes go down the column: WAYTE, E.: PRIORITY ASSET. MEAD, N.: STRUCK 1968." +
        (conKnowsNicole()
          ? " MEAD, N.: FILE REOPENED 1989, SLEEPER INQUIRING."
          : "") +
        " Then her own line: MEAD, R.: UNENROLLED, DIRECTIVE 7-A SCHEDULE C (STERILISE).]\n\n[She reads it twice. She folds the paper very small, puts it back in your hand, and says nothing at all.]",
      onEnter() {
        ms.set("rose_read_schedule_c");
      },
      responses: [
        {
          text: "[Say nothing either.]",
          action: () => {
            if (Q.isActive("mq20")) Q.complete("mq20");
          },
        },
        { text: "Rose...", next: "mq20_list2" },
      ],
    },
    mq20_list2: {
      speaker: "Rose",
      text: "[She shakes her head once. Not now. Not ever, maybe. She goes back to her rifle.]",
      onEnter() {
        if (Q.isActive("mq20")) Q.complete("mq20");
      },
      responses: [{ text: "[Leave it.]" }],
    },
    // ---- mq21 ----
    mq21_keel: {
      speaker: "Rose",
      text: () =>
        keelGone()
          ? "[She holds out her hand for the ledger.] Show me."
          : "[She looks at the ledger under your arm, at her own name in someone else's handwriting.] Eighteenth of February. That's me. I said I'd never set foot on their ground. [She slings the rifle.] Show me the door, and show me her.",
      responses: [
        {
          text: "Let's find Major Keel.",
          cond: () => !keelGone(),
          action: () => {
            const a = L.npc("li_keel");
            if (
              !a ||
              (a &&
                !a.dead &&
                Math.hypot(a.pos.x - G.player.pos.x, a.pos.z - G.player.pos.z) <
                  15)
            ) {
              startKeelScene();
              return null;
            }
            rose.place("follow");
            return null;
          },
        },
        {
          text: "[Hand her the ledger.]",
          cond: () => keelGone(),
          action: () => {
            ms.talk("dlg_ms_mq21_keel", "Rose", "gone");
          },
        },
        { text: "Give me a minute." },
      ],
    },
    // ---- mq22 ----
    mq22_memo: {
      speaker: "Rose",
      text: "[You show her the carbon from the archive core. She reads it once.] That's it. That's what she preaches. A list, and a door, and the people on the wrong side of it.",
      onEnter() {
        ms.set("mq22_rose_line");
      },
      responses: [
        { text: "Who preaches it?", next: "mq22_memo2" },
        { text: "[Say nothing.]" },
      ],
    },
    mq22_memo2: {
      speaker: "Rose",
      text: "The Dawn. Every morning at five forty-seven. [She hands the carbon back.] She's not wrong about the list. That's the worst part. She's only wrong about what to do with it.",
      responses: [{ text: "Understood." }],
    },
    // ---- mq23 ----
    mq23_after: {
      speaker: "Rose",
      text: "[She takes one look at your face and knows something happened.] Grand Central. You went to the gallery. Who was it?",
      responses: [
        {
          text: "Brother Taper. He offered me the truth about Nicole, for Key B.",
          next: "mq23_told",
        },
        {
          text: () =>
            "A woman behind the Track 61 bulkhead was humming our song. Mine and Nicole's.",
          cond: () => !!ms.f("heard_humming"),
          next: "mq23_hum",
        },
        { text: "Nobody. An echo.", next: "mq23_lie" },
      ],
    },
    mq23_told: {
      speaker: "Rose",
      text: () =>
        ms.f("dawn_pact") === "agree"
          ? "[Very still.] And you said yes. [She turns the cuff on her wrist, once, all the way round.] You said yes."
          : ms.f("dawn_pact") === "refuse"
            ? "And you told him no. [Something in her shoulders lets go.] Good."
            : "And you didn't answer. [She narrows her eyes.] Don't leave a door like that open.",
      onEnter() {
        if (ms.f("dawn_pact") === "agree" && !ms.f("dawn_pact_known")) {
          ms.set("dawn_pact_known");
          ms.addTrust(-1, "You made a deal with the Dawn.");
        }
      },
      responses: [{ text: "...", next: "mq23_line" }],
    },
    mq23_hum: {
      speaker: "Rose",
      text: "[Rose goes very still. Then she shrugs, a little too late.] Lots of people know that song. It was on the radio for a whole year.",
      responses: [
        {
          text: "Brother Taper offered me the truth about Nicole, for Key B.",
          next: "mq23_told",
        },
        { text: "I suppose.", next: "mq23_line" },
      ],
    },
    mq23_lie: {
      speaker: "Rose",
      text: "[She doesn't believe you, and lets you see she doesn't.]",
      responses: [{ text: "...", next: "mq23_line" }],
    },
    mq23_line: {
      speaker: "Rose",
      text: "They'll say anything. Don't listen.",
      onEnter() {
        L.later(0.5, finishMq23);
      },
      responses: [{ text: "I won't." }],
    },
    // ---- mq24 ----
    mq24_hello: {
      speaker: "Rose",
      text: () =>
        ms.trust() >= 2
          ? "When you go across, I'm going with you. Don't argue. I want to see that key with my own eyes."
          : "I'll be on the Battery wall with my scope when you cross. Somebody has to cover the landing. [She doesn't say: and I don't trust you enough to stand next to you yet. She doesn't have to.]",
      onEnter() {
        ms.set("mq24_rose_hello");
      },
      responses: [{ text: "Understood." }],
    },
  });

  // ==================================================================
  // Test solvers (forced stage walk: the default resolution of every stage)
  // ==================================================================
  ms.solver("mq19", {
    lens() {
      if (!ms.f("mq19_lens")) ms.set("mq19_lens", pathLens());
      Q.setStage("mq19", "watch");
    },
    watch() {
      watchDone();
    },
    report() {
      teagueKept();
    },
  });
  ms.solver("mq20", {
    side() {
      if (Q.get("qx_numbers")) {
        if (!Q.isStarted("qx_numbers")) Q.start("qx_numbers");
        Q.complete("qx_numbers");
      } else {
        mq20Done();
        Q.setStage("mq20", "rose");
      }
    },
    rose() {
      ms.set("rose_read_schedule_c");
      Q.complete("mq20");
    },
  });
  ms.solver("mq21", {
    records() {
      if (Q.get("li_un_records")) {
        if (!Q.isStarted("li_un_records")) Q.start("li_un_records");
        if (!L.flag("li_un_tapes_to")) L.setFlag("li_un_tapes_to", "burned");
        Q.complete("li_un_records");
      } else Q.setStage("mq21", "ledger");
    },
    ledger() {
      if (!L.has(NOTE_LEDGER)) L.give(NOTE_LEDGER, 1, true);
      ms.set("lock_truth");
      L.setFlag("lock_truth");
      Q.setStage("mq21", "keel");
    },
    keel() {
      if (keelGone()) {
        if (!ms.f("keel")) ms.set("keel", "dead");
        Q.complete("mq21");
        return;
      }
      ms.set("keel_scene");
      ms.set("keel", "spared");
      L.setFlag("keel_spared");
      Q.complete("mq21");
    },
  });
